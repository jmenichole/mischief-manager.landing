// Sample Vercel serverless function for waitlist handling
// File: api/waitlist.js (rename without .sample to enable)
// Requires env vars: RESEND_API_KEY, optional NOTIFY_TO, GITHUB_TOKEN_SIGNUPS, REPO_SLUG
// NOTE: For Netlify, export handler differently (module.exports = { handler })

import crypto from 'crypto';

// Lazy import to reduce cold start if unused features disabled
let Resend;

function json(res, status, data) {
  res.status(status).setHeader('Content-Type', 'application/json').send(JSON.stringify(data));
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const { email, source, handle } = req.body || {};
  if (!email || !validateEmail(email)) return json(res, 400, { error: 'Invalid email' });
  if (!source) return json(res, 400, { error: 'Source required' });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return json(res, 500, { error: 'Missing RESEND_API_KEY' });

  // Simple dedup hash (stateless) - optional persistent dedup if storing externally
  const hash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');

  // Lazy load Resend
  if (!Resend) ({ Resend } = await import('resend'));
  const resend = new Resend(resendKey);

  // Send confirmation email
  try {
    await resend.emails.send({
      from: 'Mischief Manager <waitlist@mischief.example>',
      to: email,
      subject: 'You\'re on the Mischief Manager waitlist',
      text: `🔥 Welcome! You are officially on the list. Source: ${source}. Handle: ${handle || 'n/a'}. We\nWill reach out when early access opens. Hash: ${hash.slice(0,10)}`
    });
  } catch (e) {
    console.error('Resend confirmation failed', e); // Do not expose full error to client
    return json(res, 502, { error: 'Email send failed' });
  }

  // Internal notification (optional)
  if (process.env.NOTIFY_TO) {
    try {
      await resend.emails.send({
        from: 'Mischief Manager <waitlist@mischief.example>',
        to: process.env.NOTIFY_TO.split(/[,\s]+/).filter(Boolean),
        subject: 'New waitlist signup',
        text: `Email: ${email}\nSource: ${source}\nHandle: ${handle || 'n/a'}\nHash: ${hash}`
      });
    } catch (e) {
      console.warn('Internal notification failed', e);
    }
  }

  // Optional GitHub file append
  if (process.env.GITHUB_TOKEN_SIGNUPS && process.env.REPO_SLUG) {
    try {
      const record = { email, source, handle: handle || null, ts: Date.now(), h: hash };
      const ghHeaders = {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN_SIGNUPS}`,
        Accept: 'application/vnd.github+json'
      };
      const path = 'waitlist.json';
      // Fetch existing file
      let existing = [];
      let sha = null;
      const getResp = await fetch(`https://api.github.com/repos/${process.env.REPO_SLUG}/contents/${path}`, { headers: ghHeaders });
      if (getResp.ok) {
        const jsonData = await getResp.json();
        sha = jsonData.sha;
        const decoded = Buffer.from(jsonData.content, 'base64').toString('utf8');
        existing = JSON.parse(decoded);
      }
      existing.push(record);
      const newContent = Buffer.from(JSON.stringify(existing, null, 2)).toString('base64');
      const putResp = await fetch(`https://api.github.com/repos/${process.env.REPO_SLUG}/contents/${path}`, {
        method: 'PUT',
        headers: { ...ghHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `chore: add waitlist signup ${email}`,
          content: newContent,
          sha: sha || undefined
        })
      });
      if (!putResp.ok) console.warn('GitHub append failed', await putResp.text());
    } catch (e) {
      console.warn('GitHub storage error', e);
    }
  }

  return json(res, 200, { ok: true });
}

// For Netlify compatibility example:
// export const handler = async (event) => {
//   const body = JSON.parse(event.body || '{}');
//   // adapt logic above and return { statusCode, headers, body }
// };

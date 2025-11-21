# Mischief Manager Landing Page

Static landing page for the Mischief Manager waitlist.
Hosted on GitHub Pages (frontend) with a recommended Vercel/Netlify serverless backend for secure waitlist collection using the Resend API.

## Features
- Dark-mode responsive landing page
- Enhanced waitlist form (email + optional handle + source)
- Client-side status + graceful error handling
- Sends data to a serverless `/api/waitlist` endpoint
- Uses Resend for confirmation + internal notification
- Optional GitHub file storage (append JSON/CSV via API)

## Frontend Deployment (GitHub Pages)
1. Push this repo to GitHub.
2. Enable GitHub Pages (Settings → Pages → Deploy from branch, root).
3. Configure custom domain + DNS.
4. (Optional) Override endpoint without rebuilding by injecting `WAITLIST_ENDPOINT` using a small snippet before `script.js` if you serve via another host.

```html
<script>window.WAITLIST_ENDPOINT='https://your.vercel.app/api/waitlist'</script>
<script src="script.js" defer></script>
```

## Backend (Serverless) Setup
You need a secure backend because the Resend API key must never be exposed in the browser.

### 1. Create serverless function (Vercel example)
Add a file `api/waitlist.js` in a Vercel project (see sample in this repo under `api/waitlist.sample.js`).

### 2. Environment Variables
Set the following in Vercel/Netlify dashboard:
- `RESEND_API_KEY` – Your Resend API key
- (Optional) `NOTIFY_TO` – Internal email(s) to alert (comma separated)
- (Optional) `GITHUB_TOKEN_SIGNUPS` – Fine‑grained PAT to append signups file
- (Optional) `REPO_SLUG` – e.g. `youruser/mischief-manager.waitlist-data`

### 3. Data Flow
1. User submits form → POST `/api/waitlist`.
2. Function validates + dedups (simple email hash).
3. Sends confirmation email via Resend.
4. Sends internal notification (optional).
5. Appends record to GitHub file OR a simple in-memory fallback if storage not configured.

### 4. GitHub Storage (Optional Lightweight Persistence)
Create a separate private repo to store `waitlist.json` or `waitlist.csv`. Grant the PAT content:write for that repo only. The function will:
- Fetch existing file (if any)
- Append new record
- Commit updated file via GitHub Contents API

### 5. Rate Limiting / Abuse
Minimal: reject >3 submissions per IP/hour or same email within 24h. (See sample code placeholder.)

### 6. Resend Template
Use a simple transactional email (plaintext or minimal HTML). Avoid heavy styling for deliverability.

## Sample Serverless Function
See `api/waitlist.sample.js` in this repository for a full implementation outline.

## Local Development
You can still open `index.html` directly; submission will fail unless `WAITLIST_ENDPOINT` is reachable.

## Security Notes
- Never embed `RESEND_API_KEY` in frontend code.
- Use serverless cold storage commits sparingly to avoid rate limits.
- Sanitize/validate email + optional handle before storing.

## Future Enhancements
- Add hCaptcha/Turnstile for bot defense
- Add region-based risk copy
- Provide real-time position in waitlist

## License
Internal use only (add proper license if needed).

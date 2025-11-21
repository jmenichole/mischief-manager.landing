import express from "express";
import { Resend } from "resend";

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/waitlist", async (req, res) => {
  const { email, source } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // 1. OPTIONAL: Store to your DB here
    // await db.waitlist.create({ email, source });

    // 2. Notify YOU or send confirmation to user
    await resend.emails.send({
      from: "Mischief Manager <onboarding@yourdomain.com>",
      to: email, // or to YOU if you want admin alert
      subject: "You're on the list 😈",
      html: `<p>Thanks for joining the Mischief Manager waitlist!</p>`
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Resend error:", error);
    return res.status(500).json({ error: "Failed to join waitlist" });
  }
});

export default router;

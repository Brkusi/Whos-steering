const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const mail = require('../lib/mail');

const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

router.post('/', rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), async (req, res) => {
  const { name, email, vehicle, message } = req.body || {};
  if (typeof email !== 'string' || email.length > 254 || !emailPattern.test(email.trim()) ||
      typeof message !== 'string' || !message.trim() || message.length > 5000 ||
      (name != null && (typeof name !== 'string' || name.length > 100)) ||
      (vehicle != null && (typeof vehicle !== 'string' || vehicle.length > 200))) {
    return res.status(400).json({ error: 'Enter a valid email address and message.' });
  }
  try {
    await mail.sendEmail({
      to: mail.ADDRESS,
      replyTo: email.trim(),
      subject: `Who's Steering inquiry${vehicle?.trim() ? ` - ${vehicle.trim().replace(/\s+/g, ' ').slice(0, 100)}` : ''}`,
      html: `<h1>New website inquiry</h1><p><strong>Name:</strong> ${escape(name?.trim() || 'Website visitor')}</p><p><strong>Email:</strong> ${escape(email.trim())}</p><p><strong>Vehicle:</strong> ${escape(vehicle?.trim() || 'Not specified')}</p><p><strong>Message:</strong></p><p>${escape(message.trim()).replace(/\n/g, '<br>')}</p>`,
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error('Contact email failed:', error.message);
    return res.status(503).json({ error: 'Your message could not be sent. Please email service@whossteering.com directly.' });
  }
});

module.exports = router;

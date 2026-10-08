const ADDRESS = 'service@whossteering.com';
const FROM = `Who's Steering <${ADDRESS}>`;

const mailReady = () => Boolean(process.env.RESEND_API_KEY?.trim());

async function sendEmail({ to, subject, html, replyTo = ADDRESS, idempotencyKey }) {
  if (!mailReady()) throw new Error('Email service is not configured');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: JSON.stringify({ from: FROM, to: Array.isArray(to) ? to : [to], reply_to: replyTo, subject, html }),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  const result = await response.json().catch(() => ({}));
  if (!result.id) throw new Error('Email provider did not confirm the message');
  return result.id;
}

module.exports = { ADDRESS, mailReady, sendEmail };

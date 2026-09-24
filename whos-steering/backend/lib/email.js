const site = 'https://whossteering.com';
const from = "Who's Steering <service@whossteering.com>";

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

function plainText(html) {
  return String(html)
    .replace(/<a\b[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gis, (_, href, label) => `${label} (${href})`)
    .replace(/<\/(?:p|h[1-6]|div|li)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(?:amp|lt|gt|quot|#39);/g, entity => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" })[entity])
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const signature = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;color:#111111">
  <tr>
    <td style="padding:12px 16px;vertical-align:middle;background:#050505;border-right:3px solid #d7ff00">
      <a href="${site}" style="text-decoration:none"><img src="${site}/ws-logo.png" width="190" alt="Who's Steering" style="display:block;width:190px;max-width:190px;height:auto;border:0"></a>
    </td>
    <td style="padding:2px 0 2px 18px;vertical-align:middle">
      <div style="font-size:18px;line-height:23px;font-weight:700;letter-spacing:.2px;color:#111111">WHO'S STEERING</div>
      <div style="padding:2px 0 9px;font-size:11px;line-height:16px;font-weight:700;letter-spacing:1.3px;color:#687078;text-transform:uppercase">Custom Steering Wheels</div>
      <div style="font-size:13px;line-height:20px"><a href="mailto:service@whossteering.com" style="color:#111111;text-decoration:none">service@whossteering.com</a></div>
      <div style="font-size:13px;line-height:20px"><a href="${site}" style="color:#111111;text-decoration:none">whossteering.com</a><span style="color:#a0a5aa"> &nbsp;•&nbsp; </span><a href="https://www.instagram.com/whossteering/" style="color:#111111;text-decoration:none">@whossteering</a></div>
      <div style="padding-top:9px;font-size:10px;line-height:15px;letter-spacing:.5px;color:#7a8086">BMW &amp; AUDI SPECIALISTS&nbsp; • &nbsp;MADE TO ORDER</div>
    </td>
  </tr>
</table>`;

async function sendEmail({ to, subject, html, idempotencyKey, replyTo = 'service@whossteering.com' }) {
  if (!process.env.RESEND_API_KEY) return false;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: JSON.stringify({ from, to: Array.isArray(to) ? to : [to], reply_to: replyTo, subject,
      html: `${html}${signature}`, text: `${plainText(html)}\n\nWho's Steering\nservice@whossteering.com\n${site}` }),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  return true;
}

module.exports = { site, escapeHtml, signature, sendEmail };

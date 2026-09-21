const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function sanitizeText(value, maxLength = 500) {
  if (typeof value !== 'string') return '';
  return value
    .replace(CONTROL_CHARACTERS, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

function sanitizeObject(value, maxDepth = 6) {
  if (maxDepth < 0) return null;
  if (typeof value === 'string') return sanitizeText(value, 2000);
  if (Array.isArray(value)) return value.slice(0, 100).map(item => sanitizeObject(item, maxDepth - 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 200)
        .map(([key, item]) => [sanitizeText(key, 100), sanitizeObject(item, maxDepth - 1)])
    );
  }
  return value;
}

function sanitizeRequestBody(req, res, next) {
  // Signed webhook payloads must remain byte/field-for-field equivalent to the
  // provider's message or signature verification will fail.
  if (req.originalUrl === '/api/paypal/webhook') return next();
  const protectedKeys = new Set(['password', 'checkoutToken', 'clientSecret']);
  function walk(value, depth = 0, key = '') {
    if (depth > 8 || protectedKeys.has(key)) return value;
    if (typeof value === 'string') return sanitizeText(value, 5000);
    if (Array.isArray(value)) return value.slice(0, 100).map(item => walk(item, depth + 1));
    if (value && typeof value === 'object') {
      for (const [childKey, childValue] of Object.entries(value)) {
        value[childKey] = walk(childValue, depth + 1, childKey);
      }
    }
    return value;
  }
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) walk(req.body);
  next();
}

function safeHttpUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(String(value));
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

module.exports = { sanitizeText, sanitizeObject, safeHttpUrl, sanitizeRequestBody };

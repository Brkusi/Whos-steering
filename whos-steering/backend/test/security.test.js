const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeText, safeHttpUrl, sanitizeRequestBody } = require('../lib/security');

test('stored text removes markup and control characters', () => {
  assert.equal(sanitizeText('  <img src=x onerror=alert(1)>\u0000  '), 'img src=x onerror=alert(1)');
});

test('external links only accept HTTP protocols', () => {
  assert.equal(safeHttpUrl('javascript:alert(1)'), null);
  assert.equal(safeHttpUrl('data:text/html,test'), null);
  assert.equal(safeHttpUrl('https://carrier.example/track?id=1'), 'https://carrier.example/track?id=1');
});

test('request sanitizer preserves passwords while cleaning display fields', () => {
  const req = { body: { password: '<valid-password>', note: '<script>alert(1)</script>' } };
  sanitizeRequestBody(req, {}, () => {});
  assert.equal(req.body.password, '<valid-password>');
  assert.equal(req.body.note, 'scriptalert(1)/script');
});

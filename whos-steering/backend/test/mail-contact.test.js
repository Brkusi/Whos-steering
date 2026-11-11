const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('Resend uses the service sender and confirms accepted messages', async () => {
  const mail = require('../lib/mail');
  const previousKey = process.env.RESEND_API_KEY;
  const previousFetch = global.fetch;
  process.env.RESEND_API_KEY = 'test-key';
  let request;
  global.fetch = async (url, options) => { request = { url, options }; return { ok: true, json: async () => ({ id: 'email-1' }) }; };
  try {
    assert.equal(await mail.sendEmail({ to: 'customer@example.com', subject: 'Saved build', html: '<p>Ready</p>' }), 'email-1');
    assert.equal(request.url, 'https://api.resend.com/emails');
    assert.deepEqual(JSON.parse(request.options.body), {
      from: "Who's Steering <service@whossteering.com>",
      to: ['customer@example.com'], reply_to: 'whossteering@gmail.com', subject: 'Saved build', html: '<p>Ready</p>'
    });
    global.fetch = async () => ({ ok: true, json: async () => ({}) });
    await assert.rejects(mail.sendEmail({ to: 'customer@example.com', subject: 'Test', html: '' }), /did not confirm/);
  } finally {
    global.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = previousKey;
  }
});

test('contact inquiries go directly to Gmail with customer reply-to', async () => {
  const routes = {};
  const sent = [];
  const router = { post: (path, ...handlers) => { routes[path] = handlers; } };
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(require.resolve('../routes/contact'), 'utf8'), {
    module, exports: module.exports, console,
    require: name => ({
      express: { Router: () => router },
      'express-rate-limit': () => () => {},
      '../lib/mail': { INQUIRY_ADDRESS: 'whossteering@gmail.com', sendEmail: async message => { sent.push(message); return 'email-1'; } }
    })[name]
  });
  const handler = routes['/'][1];
  const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
  const bad = response();
  await handler({ body: { email: 'bad', message: 'Hello' } }, bad);
  assert.equal(bad.statusCode, 400);
  assert.equal(sent.length, 0);
  const good = response();
  await handler({ body: { name: 'Visitor', email: 'visitor@example.com', vehicle: '2024 Supra', message: 'Can you help? <script>' } }, good);
  assert.equal(good.body.ok, true);
  assert.equal(sent[0].to, 'whossteering@gmail.com');
  assert.equal(sent[0].replyTo, 'visitor@example.com');
  assert.match(sent[0].html, /&lt;script&gt;/);
});

for (const delivered of [true, false]) {
  test(`fitment is saved and Gmail notification ${delivered ? 'includes the full request' : 'failure is reported accurately'}`, async () => {
    const sent = [];
    const saved = [];
    const module = { exports: {} };
    const actualMail = require('../lib/mail');
    vm.runInNewContext(fs.readFileSync(require.resolve('../lib/sales'), 'utf8'), {
      module, exports: module.exports, process, console: { error() {} },
      require: name => {
        if (name === '../db/pool') return { query: async (sql, values) => { saved.push(values); return { rows: [{id: values[0], email: values[1]}] }; } };
        if (name === './mail') return { ...actualMail, mailReady: () => true, sendEmail: async message => { sent.push(message); if (!delivered) throw new Error('Provider unavailable'); return 'email-1'; } };
        return require(name);
      }
    });
    const payload = {fullName:'Alex <Driver>',brand:'BMW',year:'2020',model:'M3',photoUrl:'https://example.test/wheel.jpg',config:{wheelStyleType:'G-Series Pre LCI',sideMat:'<Leather>'}};
    const result = await module.exports.save('driver@example.test', 'fitment', payload, false);
    assert.equal(saved.length, 1);
    assert.equal(saved[0][3], payload);
    assert.equal(result.emailed, delivered);
    assert.equal(sent[0].to, 'whossteering@gmail.com');
    assert.equal(sent[0].replyTo, 'driver@example.test');
    assert.match(sent[0].subject, /fitment inquiry/);
    assert.match(sent[0].html, /https:\/\/example.test\/wheel.jpg/);
    assert.match(sent[0].html, /&lt;Leather&gt;/);
    assert.match(sent[0].html, /2020 M3/);
    assert.match(sent[0].html, /Full name: Alex &lt;Driver&gt;/);
    assert.match(sent[0].idempotencyKey, /^fitment-/);
  });
}

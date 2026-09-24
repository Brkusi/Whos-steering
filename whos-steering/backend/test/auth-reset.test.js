const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { sendEmail } = require('../lib/email');
const { currentAccount, authRequired, adminRequired } = require('../middleware/auth');
const router = require('../routes/auth');
const ordersRouter = require('../routes/orders');

const originalSecret = process.env.JWT_SECRET;
process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';
test.after(() => { if (originalSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = originalSecret; });

function handler(path) {
  return router.stack.find(layer => layer.route?.path === path).route.stack[0].handle;
}

function response() {
  return {
    statusCode: 200, body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('session version rejects tokens issued before a password reset', async () => {
  const database = { query: async () => ({ rows: [{ id: 'user-1', email: 'new@example.com', is_admin: false, session_version: 2 }] }) };
  const oldToken = jwt.sign({ id: 'user-1', sessionVersion: 1 }, process.env.JWT_SECRET);
  const currentToken = jwt.sign({ id: 'user-1', sessionVersion: 2 }, process.env.JWT_SECRET);
  assert.equal(await currentAccount(oldToken, database), null);
  assert.deepEqual(await currentAccount(currentToken, database), { id: 'user-1', email: 'new@example.com', isAdmin: false });
});

test('protected routes reject revoked tokens and read current admin role', async () => {
  const originalQuery = pool.query;
  pool.query = async () => ({ rows: [{ id: 'user-1', email: 'a@example.com', is_admin: false, session_version: 3 }] });
  try {
    const token = jwt.sign({ id: 'user-1', isAdmin: true, sessionVersion: 3 }, process.env.JWT_SECRET);
    const stale = jwt.sign({ id: 'user-1', sessionVersion: 2 }, process.env.JWT_SECRET);
    const denied = response();
    await authRequired({ headers: { authorization: `Bearer ${stale}` } }, denied, () => assert.fail('revoked token passed'));
    assert.equal(denied.statusCode, 401);
    const admin = response();
    await adminRequired({ headers: { authorization: `Bearer ${token}` } }, admin, () => assert.fail('old admin claim passed'));
    assert.equal(admin.statusCode, 403);
  } finally {
    pool.query = originalQuery;
  }
});

test('reset confirmation changes password and invalidates prior sessions together', async () => {
  const originalConnect = pool.connect;
  const customerId = 'user-1';
  const code = '123456';
  const codeHash = crypto.createHmac('sha256', process.env.JWT_SECRET).update(`${customerId}:${code}`).digest('hex');
  const queries = [];
  const client = {
    async query(sql, values) {
      queries.push([sql, values]);
      if (sql.includes('FROM password_reset_codes pr')) return { rows: [{ id: 'reset-1', customer_id: customerId, code_hash: codeHash, attempts: 0 }] };
      return { rows: [] };
    },
    release() {},
  };
  pool.connect = async () => client;
  try {
    const res = response();
    await handler('/password-reset/confirm')({ body: { email: 'a@example.com', code, password: 'StrongPassword123' } }, res);
    assert.equal(res.statusCode, 200);
    assert.ok(queries.some(([sql]) => sql.includes('session_version=session_version+1')));
    assert.ok(queries.some(([sql]) => sql.includes('UPDATE password_reset_codes SET used_at=NOW()')));
    assert.ok(queries.some(([sql]) => sql === 'COMMIT'));
  } finally {
    pool.connect = originalConnect;
  }
});

test('a wrong reset code consumes an attempt without changing the password', async () => {
  const originalConnect = pool.connect;
  const queries = [];
  pool.connect = async () => ({
    async query(sql) {
      queries.push(sql);
      if (sql.includes('FROM password_reset_codes pr')) return { rows: [{ id: 'reset-1', customer_id: 'user-1', code_hash: '0'.repeat(64), attempts: 0 }] };
      return { rows: [] };
    },
    release() {},
  });
  try {
    const res = response();
    await handler('/password-reset/confirm')({ body: { email: 'a@example.com', code: '123456', password: 'StrongPassword123' } }, res);
    assert.equal(res.statusCode, 400);
    assert.ok(queries.some(sql => sql.includes('attempts=attempts+1')));
    assert.ok(queries.includes('COMMIT'));
    assert.ok(!queries.some(sql => sql.includes('UPDATE customers')));
  } finally { pool.connect = originalConnect; }
});

test('exhausted and expired reset codes are rejected without changing the password', async () => {
  const originalConnect = pool.connect;
  for (const rows of [[{ id: 'reset-1', customer_id: 'user-1', code_hash: '0'.repeat(64), attempts: 5 }], []]) {
    const queries = [];
    pool.connect = async () => ({
      async query(sql) { queries.push(sql); return { rows: sql.includes('FROM password_reset_codes pr') ? rows : [] }; },
      release() {},
    });
    try {
      const res = response();
      await handler('/password-reset/confirm')({ body: { email: 'a@example.com', code: '123456', password: 'StrongPassword123' } }, res);
      assert.equal(res.statusCode, 400);
      assert.ok(queries.includes('ROLLBACK'));
      assert.ok(!queries.some(sql => sql.includes('UPDATE customers')));
    } finally { pool.connect = originalConnect; }
  }
});

test('passwords exceeding bcrypt UTF-8 input limit are refused', async () => {
  const res = response();
  await handler('/register')({ body: { email: 'a@example.com', password: 'Aa1' + 'é'.repeat(36) } }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /72 UTF-8 bytes/);
});

test('registration rejects malformed addresses and login rejects non-string passwords', async () => {
  const invalidEmail = response();
  await handler('/register')({ body: { email: 'not-an-email', password: 'StrongPassword123' } }, invalidEmail);
  assert.equal(invalidEmail.statusCode, 400);
  const invalidPassword = response();
  await handler('/login')({ body: { email: 'a@example.com', password: { nested: 'value' } } }, invalidPassword);
  assert.equal(invalidPassword.statusCode, 400);
});

test('email helper keeps HTML links and signature and includes a useful text fallback', async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  let sent;
  process.env.RESEND_API_KEY = 'test-key';
  global.fetch = async (_url, options) => { sent = JSON.parse(options.body); return { ok: true }; };
  try {
    assert.equal(await sendEmail({ to: 'a@example.com', subject: 'Reset', html: '<p>Open <a href="https://whossteering.com/resume#abc">your build</a>.</p>' }), true);
    assert.match(sent.html, /href="https:\/\/whossteering\.com\/resume#abc"/);
    assert.match(sent.html, /WHO'S STEERING/);
    assert.match(sent.text, /your build \(https:\/\/whossteering\.com\/resume#abc\)/);
    assert.doesNotMatch(sent.text, /<a\b/);
    global.fetch = async () => ({ ok: false, status: 503 });
    await assert.rejects(sendEmail({ to: 'a@example.com', subject: 'Reset', html: '<p>Hi</p>' }), /503/);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = originalKey;
  }
});

test('account order lookup stays scoped to the authenticated customer id', async () => {
  const originalQuery = pool.query;
  let statement;
  let parameters;
  pool.query = async (sql, values) => { statement = sql; parameters = values; return { rows: [] }; };
  try {
    const route = ordersRouter.stack.find(layer => layer.route?.path === '/my').route.stack.at(-1).handle;
    const res = response();
    await route({ user: { id: 'owner-1', email: 'same-email@example.com' } }, res);
    assert.equal(res.statusCode, 200);
    assert.match(statement, /WHERE o\.customer_id = \$1/);
    assert.deepEqual(parameters, ['owner-1']);
  } finally {
    pool.query = originalQuery;
  }
});

test('failed reset email removes the undelivered code without retiring earlier codes', { timeout: 2000 }, async () => {
  const originalConnect = pool.connect;
  const originalQuery = pool.query;
  const originalKey = process.env.RESEND_API_KEY;
  const originalError = console.error;
  delete process.env.RESEND_API_KEY;
  const statements = [];
  let done;
  const deleted = new Promise(resolve => { done = resolve; });
  pool.connect = async () => ({
    async query(sql) {
      statements.push(sql);
      if (sql.includes('FROM customers')) return { rows: [{ id: 'user-1', first_name: 'A', email: 'a@example.com' }] };
      if (sql.includes('SELECT 1 FROM password_reset_codes')) return { rows: [] };
      if (sql.includes('INSERT INTO password_reset_codes')) return { rows: [{ id: 'reset-1' }] };
      return { rows: [] };
    },
    release() {},
  });
  pool.query = async sql => { statements.push(sql); if (sql.includes('DELETE FROM password_reset_codes')) done(); return { rows: [] }; };
  console.error = () => {};
  try {
    const res = response();
    handler('/password-reset/request')({ body: { email: 'a@example.com' } }, res);
    assert.equal(res.statusCode, 200);
    await deleted;
    assert.ok(statements.some(sql => sql.includes('FOR UPDATE')));
    assert.ok(statements.some(sql => sql.includes('DELETE FROM password_reset_codes')));
    assert.equal(statements.some(sql => sql.includes('id<>$2')), false);
    await new Promise(resolve => setImmediate(resolve));
  } finally {
    pool.connect = originalConnect;
    pool.query = originalQuery;
    console.error = originalError;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = originalKey;
  }
});

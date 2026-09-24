const test = require('node:test');
const assert = require('node:assert/strict');
const pool = require('../db/pool');
const router = require('../routes/orders');

const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
const handler = path => router.stack.find(layer => layer.route?.path === path).route.stack.at(-1).handle;

test('matching unverified guest email does not grant private order access', async () => {
  const originalQuery = pool.query;
  pool.query = async () => ({ rows: [{ id: 'order-1', customer_id: null, guest_email: 'guest@example.com' }] });
  try {
    const res = response();
    await handler('/:id')({ params: { id: 'order-1' }, user: { id: 'new-user', email: 'guest@example.com' } }, res);
    assert.equal(res.statusCode, 403);
    const owner = response();
    pool.query = async () => ({ rows: [{ id: 'order-1', customer_id: 'owner' }] });
    await handler('/:id')({ params: { id: 'order-1' }, user: { id: 'owner' } }, owner);
    assert.equal(owner.statusCode, 200);
    assert.equal(owner.body.id, 'order-1');
  } finally { pool.query = originalQuery; }
});

test('matching unverified guest email cannot cancel or refund an order', async () => {
  const originalConnect = pool.connect;
  const originalKey = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = 'sk_test_placeholder';
  const queries = [];
  pool.connect = async () => ({
    async query(sql) {
      queries.push(sql);
      return { rows: sql.includes('SELECT') ? [{ id: 'order-1', customer_id: null, guest_email: 'guest@example.com', status: 'paid' }] : [] };
    }, release() {},
  });
  try {
    const res = response();
    await handler('/:id/cancel')({ params: { id: 'order-1' }, user: { id: 'new-user', email: 'guest@example.com' } }, res);
    assert.equal(res.statusCode, 403);
    assert.ok(queries.includes('ROLLBACK'));
    assert.ok(!queries.some(sql => /^\s*(UPDATE|INSERT|DELETE)\b/i.test(sql)));
  } finally {
    pool.connect = originalConnect;
    if (originalKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = originalKey;
  }
});

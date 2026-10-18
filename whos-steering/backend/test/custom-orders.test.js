const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadRoute({ pool, stripe, mail }) {
  const routes = {};
  const adminRequired = () => {};
  const middleware = [];
  const router = {
    get: (path, handler) => { routes[`GET ${path}`] = handler; },
    post: (path, handler) => { routes[`POST ${path}`] = handler; },
    use: handler => middleware.push(handler),
  };
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(require.resolve('../routes/custom-orders'), 'utf8'), {
    module, exports: module.exports, process: { env: { FRONTEND_URL: 'https://whossteering.com' } },
    console, Date, Number, String,
    require: name => ({
      express: { Router: () => router },
      crypto: require('node:crypto'),
      '../db/pool': pool,
      '../middleware/auth': { adminRequired },
      '../lib/mail': mail,
      '../lib/custom-order-payment': { recordPaidCustomOrder: async () => true },
      stripe: () => stripe,
    })[name],
  });
  return { routes, middleware, adminRequired, amountCents: module.exports.amountCents };
}

test('custom order amount rejects malformed and undersized prices', () => {
  const { amountCents } = loadRoute({ pool: {}, stripe: {}, mail: {} });
  assert.equal(amountCents('549.99'), 54999);
  for (const value of ['0.49', '-2', '1.234', '1e3', 'NaN', '1000000', '']) assert.equal(amountCents(value), null);
});

test('admin custom order creates exact Stripe charge for the recipient and emails only that address', async () => {
  const orderId = '12345678-1234-4234-8234-123456789012';
  const sent = [];
  let sessionArgs;
  let row = null;
  const client = { release() {}, async query(sql, values = []) {
    if (sql.includes('INSERT INTO orders')) row = { order_id: orderId, guest_email: values[1], total: values[2], status: 'pending', title: '', description: '', stripe_session_id: '', checkout_url: '', checkout_expires_at: new Date(1760000000 * 1000), email_sent_at: null, email_attempts: 0, created_at: new Date() };
    if (sql.includes('INSERT INTO custom_orders')) Object.assign(row, { title: values[1], description: values[2], stripe_session_id: values[3], checkout_url: values[4] });
    if (sql.includes('FROM custom_orders')) return { rows: row ? [row] : [] };
    return { rows: [], rowCount: 1 };
  } };
  const pool = { connect: async () => client, async query(sql, values = []) {
    if (sql.includes('SET email_attempts')) row.email_attempts = values[1];
    if (sql.includes('SET email_sent_at')) row.email_sent_at = new Date();
    if (sql.includes('FROM custom_orders')) return { rows: [row] };
    return { rows: [] };
  } };
  const stripe = { checkout: { sessions: { create: async args => { sessionArgs = args; return { id: 'cs_test_abc', url: 'https://checkout.stripe.com/c/pay/test', expires_at: 1760000000 }; } } } };
  const mail = { mailReady: () => true, sendEmail: async args => { sent.push(args); return 'email_1'; } };
  const { routes, middleware, adminRequired } = loadRoute({ pool, stripe, mail });
  assert.equal(middleware[0], adminRequired);
  assert.equal(typeof routes['GET /confirm'], 'function');
  let statusCode = 200;
  let body;
  const res = { status(code) { statusCode = code; return this; }, json(value) { body = value; return this; } };
  await routes['POST /']({ user: { id: orderId }, body: { requestId: orderId, email: ' Buyer@Example.com ', title: 'Custom BMW wheel', description: 'Red stitching', price: '549.99' } }, res);
  assert.equal(statusCode, 201);
  assert.equal(body.emailSent, true);
  assert.equal(body.order.amount, '549.99');
  assert.equal(sessionArgs.line_items[0].price_data.unit_amount, 54999);
  assert.equal(sessionArgs.customer_email, 'buyer@example.com');
  assert.equal(sessionArgs.payment_intent_data.metadata.orderId, orderId);
  assert.equal(sessionArgs.payment_intent_data.metadata.customOrder, 'true');
  assert.deepEqual(sent.map(message => message.to), ['buyer@example.com']);
  assert.match(sent[0].html, /\$549\.99 USD/);
  assert.match(sent[0].html, /checkout\.stripe\.com/);
});

test('custom payment records only matching succeeded USD payments', async () => {
  const orderId = '12345678-1234-4234-8234-123456789012';
  const queries = [];
  let status = 'pending';
  const client = { release() {}, async query(sql) {
    queries.push(sql);
    if (sql.includes('SELECT o.id')) return { rows: [{ id: orderId, status, total: '549.99' }] };
    if (sql.includes('UPDATE orders')) status = 'paid';
    return { rows: [], rowCount: 1 };
  } };
  const pool = { connect: async () => client };
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(require.resolve('../lib/custom-order-payment'), 'utf8'), {
    module, exports: module.exports, require: name => name === '../db/pool' ? pool : undefined,
  });
  const record = module.exports.recordPaidCustomOrder;
  const pi = { id: 'pi_test', status: 'succeeded', currency: 'usd', amount_received: 54999, metadata: { orderId, customOrder: 'true' } };
  assert.equal(await record(pi), true);
  assert.equal(queries.filter(sql => sql.includes('INSERT INTO order_status_history')).length, 1);
  assert.equal(await record(pi), true);
  assert.equal(queries.filter(sql => sql.includes('INSERT INTO order_status_history')).length, 1);
  await assert.rejects(record({ ...pi, amount_received: 1 }));
  assert.equal(queries.filter(sql => sql.includes('INSERT INTO payments')).length, 2);
});

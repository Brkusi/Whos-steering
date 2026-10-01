const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('sales reporting periods and fitment queue use bounded, parameterized queries', async () => {
  const routes = {};
  const admin = () => {};
  const router = {
    get: (path, ...handlers) => { routes[`GET ${path}`] = handlers; },
    post: (path, ...handlers) => { routes[`POST ${path}`] = handlers; },
    patch: (path, ...handlers) => { routes[`PATCH ${path}`] = handlers; }
  };
  const calls = [];
  const pool = { query: async (sql, params = []) => {
    calls.push({ sql, params });
    if (sql.includes('AS total FROM sales_leads')) return { rows: [{ total: '1' }] };
    if (sql.includes('SELECT id,email,payload,created_at,status FROM sales_leads')) return { rows: [{ id: 'fit-1', status: 'open' }] };
    if (sql.includes('AS purchases')) return { rows: [{ purchases: '2', revenue: '1200.00' }] };
    if (sql.includes('AS orders')) return { rows: [{ orders: '1', revenue: '600.00' }] };
    if (sql.includes('AS open,')) return { rows: [{ open: '1', resolved: '0', oldest_open: '2026-09-30' }] };
    if (sql.startsWith('UPDATE sales_leads')) return { rowCount: 1 };
    return { rows: [] };
  } };
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(require.resolve('../routes/sales'), 'utf8'), {
    module, exports: module.exports, process, console,
    require: name => ({
      express: { Router: () => router },
      'express-rate-limit': () => () => {},
      '../db/pool': pool,
      '../lib/sales': { mailReady: () => true, recoveryReady: () => false },
      '../middleware/auth': { adminRequired: admin }
    })[name]
  });
  const response = () => ({ body: null, statusCode: 200, status(code) { this.statusCode = code; return this; }, set() { return this; }, json(value) { this.body = value; return this; } });
  const next = error => { if (error) throw error; };
  assert.equal(routes['GET /admin'][0], admin);
  assert.equal(routes['GET /admin/fitment'][0], admin);
  const report = response();
  await routes['GET /admin'][1]({ query: { days: '90' } }, report, next);
  assert.equal(report.body.days, 90);
  assert.equal(report.body.fitment.open, '1');
  assert.equal(calls.filter(call => call.params[0] === 90).length, 6);
  const invalid = response();
  await routes['GET /admin'][1]({ query: { days: '365' } }, invalid, next);
  assert.equal(invalid.statusCode, 400);
  calls.length = 0;
  const queue = response();
  await routes['GET /admin/fitment'][1]({ query: { status: 'open', sort: 'oldest', search: 'BMW', page: '1' } }, queue, next);
  assert.equal(queue.body.total, 1);
  assert.equal(queue.body.leads[0].id, 'fit-1');
  assert.deepEqual(Array.from(calls[0].params), ['open', 'bmw']);
  assert.deepEqual(Array.from(calls[1].params), ['open', 'bmw', 0]);
  assert.match(calls[1].sql, /ORDER BY created_at ASC/);
  assert.doesNotMatch(calls[1].sql, /BMW/);
  const changed = response();
  await routes['PATCH /admin/:id'][1]({ params: { id: 'fit-1' }, body: { status: 'resolved' } }, changed, next);
  assert.equal(changed.body.ok, true);
  assert.match(calls.at(-1).sql, /kind='fitment'/);
});

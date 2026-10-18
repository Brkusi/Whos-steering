const pool = require('../db/pool');

// Stripe's signed webhook and the customer's return page both call this. The
// row lock keeps a fast return and a delayed webhook from recording twice.
async function recordPaidCustomOrder(pi, source = 'Stripe') {
  if (pi.status !== 'succeeded' || pi.metadata?.customOrder !== 'true') return false;
  const orderId = pi.metadata.orderId;
  if (!/^[0-9a-f-]{36}$/i.test(orderId || '')) return false;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT o.id,o.status,o.total,c.stripe_session_id
       FROM orders o JOIN custom_orders c ON c.order_id=o.id
       WHERE o.id=$1 FOR UPDATE OF o`, [orderId]);
    const order = rows[0];
    if (!order || pi.currency !== 'usd' || Math.round(Number(order.total) * 100) !== pi.amount_received) {
      throw new Error('Custom order payment amount or currency does not match');
    }
    const payment = await client.query(
      `INSERT INTO payments(order_id,stripe_payment_intent,stripe_charge_id,amount,currency,status)
       VALUES($1,$2,$3,$4,'usd','succeeded')
       ON CONFLICT (stripe_payment_intent) DO UPDATE SET
         stripe_charge_id=EXCLUDED.stripe_charge_id,status='succeeded',updated_at=NOW()
       WHERE payments.order_id=EXCLUDED.order_id`,
      [orderId, pi.id, pi.latest_charge || null, order.total]);
    if (payment.rowCount !== 1) throw new Error('Payment intent is already linked to another order');
    if (['pending', 'payment_processing'].includes(order.status)) {
      await client.query("UPDATE orders SET status='paid',updated_at=NOW() WHERE id=$1", [orderId]);
      await client.query(
        `INSERT INTO order_status_history(order_id,from_status,to_status,note)
         VALUES($1,$2,'paid',$3)`, [orderId, order.status, `Custom order payment confirmed via ${source}`]);
    }
    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { recordPaidCustomOrder };

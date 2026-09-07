const paypal = require('./paypal');
async function issuePaypalRefund(pool, payment, body, adminId, requiredStatus) {
  const client = await pool.connect();
  let reserved;
  try {
    await client.query('BEGIN');
    const {
      rows: lockedOrders
    } = await client.query('SELECT id,status FROM orders WHERE id=$1 FOR UPDATE', [payment.order_id]);
    const {
      rows
    } = await client.query('SELECT * FROM paypal_refund_requests WHERE request_id=$1', [body.requestId]);
    reserved = rows[0];
    if (!reserved && requiredStatus && lockedOrders[0]?.status !== requiredStatus) throw new Error('This order is no longer eligible for cancellation.');
    if (reserved && (reserved.payment_id !== payment.id || reserved.amount_cents !== body.amount || reserved.reason !== body.reason || reserved.note !== body.note.trim())) throw new Error('This request ID was already used for another refund.');
    if (!reserved) {
      const current = await paypal.snapshot(client, payment);
      if (current.status !== 'succeeded' || body.amount > current.available) throw new Error('The available refund balance changed. Refresh this payment.');
      const {
        rows: newRows
      } = await client.query(`INSERT INTO paypal_refund_requests(request_id,payment_id,amount_cents,reason,note,admin_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`, [body.requestId, payment.id, body.amount, body.reason, body.note.trim(), adminId]);
      reserved = newRows[0];
    }
    // Persist the reservation before sending money. An uncertain request keeps its balance reserved.
    await client.query('COMMIT');
    let refund;
    if (reserved.provider_id) refund = await paypal.request(`/v2/payments/refunds/${reserved.provider_id}`);else {
      if (Date.now() - new Date(reserved.created_at).getTime() > 5 * 60 * 60 * 1000) throw new Error('This earlier request needs reconciliation in PayPal before retrying. Its balance remains reserved.');
      refund = await paypal.request(`/v2/payments/captures/${payment.paypal_capture_id}/refund`, {
        method: 'POST',
        requestId: body.requestId,
        body: {
          amount: {
            value: (body.amount / 100).toFixed(2),
            currency_code: 'USD'
          },
          custom_id: body.requestId
        }
      });
    }
    await client.query('BEGIN');
    await client.query('SELECT id FROM orders WHERE id=$1 FOR UPDATE', [payment.order_id]);
    await client.query('UPDATE paypal_refund_requests SET provider_id=$1,status=$2 WHERE request_id=$3', [refund.id, refund.status, body.requestId]);
    const updated = await paypal.snapshot(client, payment);
    const {
      rows: current
    } = await client.query('SELECT status FROM orders WHERE id=$1', [payment.order_id]);
    const status = updated.completed >= updated.amount && updated.amount > 0 ? 'refunded' : current[0].status;
    await client.query('UPDATE orders SET status=$1,updated_at=NOW() WHERE id=$2', [status, payment.order_id]);
    const note = `PayPal refund ${refund.id}: ${(body.amount / 100).toFixed(2)} USD — ${body.note.trim()}`;
    await client.query(`INSERT INTO order_status_history(order_id,from_status,to_status,note,changed_by) SELECT $1,$2,$3,$4,$5 WHERE NOT EXISTS(SELECT 1 FROM order_status_history WHERE order_id=$1 AND note=$4)`, [payment.order_id, current[0].status, status, note, adminId]);
    await client.query('COMMIT');
    return {
      refund: {
        id: refund.id,
        status: refund.status,
        amount: body.amount
      },
      payment: updated
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
module.exports = {
  issuePaypalRefund
};

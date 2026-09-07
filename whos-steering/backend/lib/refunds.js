function refundTotals(amount, refunds) {
  const completed = refunds.filter(r => r.status === 'succeeded').reduce((sum, r) => sum + r.amount, 0);
  const pending = refunds.filter(r => !['succeeded', 'failed', 'canceled'].includes(r.status)).reduce((sum, r) => sum + r.amount, 0);
  return {
    completed,
    pending,
    available: Math.max(0, amount - completed - pending)
  };
}
function validateRefund(body) {
  if (!Number.isSafeInteger(body.amount) || body.amount <= 0) throw new Error('Enter a positive refund amount in cents.');
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(body.requestId || '')) throw new Error('A valid refund request ID is required.');
  if (!['requested_by_customer', 'duplicate', 'fraudulent'].includes(body.reason)) throw new Error('Select a valid refund reason.');
  if (typeof body.note !== 'string' || body.note.trim().length < 3 || body.note.length > 500) throw new Error('Add a refund note between 3 and 500 characters.');
}
async function paymentSnapshot(stripe, paymentIntent) {
  const intent = await stripe.paymentIntents.retrieve(paymentIntent, {
    expand: ['latest_charge']
  });
  const charge = intent.latest_charge;
  const refunds = [];
  if (charge?.id) for await (const refund of stripe.refunds.list({
    charge: charge.id,
    limit: 100
  })) refunds.push(refund);
  const amount = charge?.amount_captured || 0;
  return {
    paymentIntent,
    chargeId: charge?.id,
    status: intent.status,
    currency: intent.currency,
    amount,
    ...refundTotals(amount, refunds),
    method: charge?.payment_method_details?.type || null,
    refunds: refunds.map(r => ({
      id: r.id,
      amount: r.amount,
      status: r.status,
      reason: r.reason,
      created: r.created,
      requestId: r.metadata?.requestId,
      note: r.metadata?.note
    }))
  };
}
async function syncRefunds(client, stripe, paymentIntent) {
  const snapshot = await paymentSnapshot(stripe, paymentIntent);
  await client.query('UPDATE payments SET refunded_amount=$1, updated_at=NOW() WHERE stripe_payment_intent=$2', [(snapshot.completed / 100).toFixed(2), paymentIntent]);
  // Partial refunds never change fulfillment. Only a confirmed full refund does.
  if (snapshot.amount > 0 && snapshot.completed >= snapshot.amount) {
    const {
      rows
    } = await client.query(`SELECT o.id, o.status FROM orders o JOIN payments p ON p.order_id=o.id WHERE p.stripe_payment_intent=$1 FOR UPDATE OF o`, [paymentIntent]);
    for (const order of rows) if (order.status !== 'refunded') {
      await client.query("UPDATE orders SET status='refunded',updated_at=NOW() WHERE id=$1", [order.id]);
      await client.query("INSERT INTO order_status_history(order_id,from_status,to_status,note) VALUES($1,$2,'refunded','Full refund confirmed by Stripe')", [order.id, order.status]);
    }
  }
  return snapshot;
}
module.exports = {
  refundTotals,
  validateRefund,
  paymentSnapshot,
  syncRefunds
};

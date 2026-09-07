const crypto = require('crypto');
const enabled = () => process.env.PAYPAL_ENABLED === 'true' && !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET && !!process.env.FRONTEND_URL;
const base = () => process.env.PAYPAL_ENVIRONMENT === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
async function request(path, {
  method = 'GET',
  body,
  requestId
} = {}) {
  if (!enabled()) throw new Error('PayPal is not configured.');
  const auth = await fetch(`${base()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(15000)
  });
  if (!auth.ok) throw new Error('Unable to authenticate with PayPal.');
  const token = await auth.json();
  const response = await fetch(`${base()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(requestId ? {
        'PayPal-Request-Id': requestId
      } : {})
    },
    ...(body ? {
      body: JSON.stringify(body)
    } : {}),
    signal: AbortSignal.timeout(20000)
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error('PayPal could not complete this request.');
    error.providerStatus = response.status;
    error.details = data.details;
    throw error;
  }
  return data;
}
async function createOrder(orderId, total, shipping) {
  const origin = new URL(process.env.FRONTEND_URL).origin;
  const order = await request('/v2/checkout/orders', {
    method: 'POST',
    requestId: orderId,
    body: {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: orderId,
        custom_id: orderId,
        amount: {
          currency_code: 'USD',
          value: total
        },
        shipping: {
          name: {
            full_name: shipping.name
          },
          address: {
            address_line_1: shipping.address1,
            address_line_2: shipping.address2 || undefined,
            admin_area_2: shipping.city,
            admin_area_1: shipping.state,
            postal_code: shipping.zip,
            country_code: shipping.country
          }
        }
      }],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Who's Steering",
            user_action: 'PAY_NOW',
            shipping_preference: 'SET_PROVIDED_ADDRESS',
            return_url: `${origin}/order-confirmation?provider=paypal&orderId=${orderId}`,
            cancel_url: `${origin}/checkout?paypal=cancelled`
          }
        }
      }
    }
  });
  const approvalUrl = order.links?.find(l => l.rel === 'payer-action' || l.rel === 'approve')?.href;
  if (!approvalUrl) throw new Error('PayPal did not return an approval link.');
  return {
    id: order.id,
    approvalUrl
  };
}
function verifiedCapture(order, payment) {
  const unit = order.purchase_units?.find(u => u.custom_id === payment.order_id || u.reference_id === payment.order_id);
  const capture = unit?.payments?.captures?.[0];
  if (!capture) return null;
  if (capture.amount?.currency_code !== 'USD' || Math.round(Number(capture.amount.value) * 100) !== Math.round(Number(payment.amount) * 100)) throw new Error('PayPal amount does not match the order.');
  return capture;
}
async function captureOrder(client, payment) {
  let order = await request(`/v2/checkout/orders/${payment.paypal_order_id}`);
  let capture = verifiedCapture(order, payment);
  if (!capture && order.status === 'APPROVED') {
    order = await request(`/v2/checkout/orders/${payment.paypal_order_id}/capture`, {
      method: 'POST',
      body: {},
      requestId: crypto.createHash('sha256').update(`capture-${payment.order_id}`).digest('hex').slice(0, 38)
    });
    capture = verifiedCapture(order, payment);
  }
  const status = ['COMPLETED', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(capture?.status) ? 'succeeded' : capture?.status === 'PENDING' ? 'processing' : 'requires_payment_method';
  await client.query('UPDATE payments SET status=$1,paypal_capture_id=COALESCE($2,paypal_capture_id),updated_at=NOW() WHERE id=$3', [status, capture?.id || null, payment.id]);
  if (status === 'succeeded') {
    const {
      rows
    } = await client.query("UPDATE orders SET status='paid',updated_at=NOW() WHERE id=$1 AND status IN('pending','payment_processing') RETURNING id", [payment.order_id]);
    if (rows.length) await client.query("INSERT INTO order_status_history(order_id,from_status,to_status,note) VALUES($1,'pending','paid','Payment verified with PayPal')", [payment.order_id]);
  }
  const {
    rows
  } = await client.query('SELECT status,total FROM orders WHERE id=$1', [payment.order_id]);
  return {
    paymentStatus: status,
    orderStatus: rows[0].status,
    total: rows[0].total,
    paid: status === 'succeeded'
  };
}
async function snapshot(client, payment) {
  const {
    rows: refunds
  } = await client.query('SELECT * FROM paypal_refund_requests WHERE payment_id=$1 ORDER BY created_at DESC', [payment.id]);
  for (const refund of refunds) if (refund.provider_id) {
    const remote = await request(`/v2/payments/refunds/${refund.provider_id}`);
    refund.status = remote.status;
    await client.query('UPDATE paypal_refund_requests SET status=$1 WHERE request_id=$2', [remote.status, refund.request_id]);
  }
  const capture = payment.paypal_capture_id ? await request(`/v2/payments/captures/${payment.paypal_capture_id}`) : null;
  const amount = capture ? Math.round(Number(capture.amount.value) * 100) : 0;
  const completed = refunds.filter(r => r.status === 'COMPLETED').reduce((s, r) => s + r.amount_cents, 0);
  const pending = refunds.filter(r => !['COMPLETED', 'FAILED', 'CANCELLED'].includes(r.status)).reduce((s, r) => s + r.amount_cents, 0);
  // External partial refunds have no full transaction list on this API. Require reconciliation instead of guessing the remaining balance.
  const externallyChanged = capture?.status === 'PARTIALLY_REFUNDED' && !completed;
  const totalRefunded = capture?.status === 'REFUNDED' ? amount : completed;
  await client.query('UPDATE payments SET refunded_amount=$1,updated_at=NOW() WHERE id=$2', [(totalRefunded / 100).toFixed(2), payment.id]);
  return {
    status: ['COMPLETED', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(capture?.status) ? 'succeeded' : payment.status,
    currency: 'usd',
    amount,
    completed: totalRefunded,
    pending,
    available: externallyChanged ? 0 : Math.max(0, amount - totalRefunded - pending),
    method: 'PayPal',
    refunds: refunds.map(r => ({
      id: r.provider_id || r.request_id,
      amount: r.amount_cents,
      status: r.status,
      reason: r.reason,
      created: new Date(r.created_at).getTime() / 1000
    })),
    externallyChanged
  };
}
module.exports = {
  enabled,
  request,
  createOrder,
  captureOrder,
  verifiedCapture,
  snapshot
};

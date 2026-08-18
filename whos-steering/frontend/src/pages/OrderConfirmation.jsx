import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context';
import { useAuth } from '../context';
import { apiFetch } from '../lib/api';

const SUCCESS_ORDER_STATUSES = [
  'paid',
  'in_build',
  'quality_check',
  'shipped',
  'delivered',
];

export default function OrderConfirmation() {
  const [params] = useSearchParams();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

  const orderId = params.get('orderId');
  const paymentIntent = params.get('payment_intent');

  const [verification, setVerification] = useState('checking');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [order, setOrder] = useState(null);
  const [verifiedTotal, setVerifiedTotal] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let stopped = false;
    let timer;

    const verify = async (attempt = 0) => {
      if (!orderId || !paymentIntent) {
        setVerification('failed');
        setMessage(
          'We could not verify a completed Stripe payment for this checkout. Your order has not been shown as placed.'
        );
        return;
      }

      try {
        const result = await apiFetch(
          `/api/checkout/verify-payment?orderId=${encodeURIComponent(orderId)}&paymentIntent=${encodeURIComponent(paymentIntent)}`
        );

        if (stopped) return;

        setPaymentStatus(result.paymentStatus || '');
        setOrderStatus(result.orderStatus || '');
        setVerifiedTotal(result.total ?? null);

        if (
          result.paymentStatus === 'succeeded' &&
          SUCCESS_ORDER_STATUSES.includes(result.orderStatus)
        ) {
          setVerification('success');

          // The cart is cleared ONLY after the server verifies Stripe succeeded.
          clearCart();

          if (user) {
            try {
              const fullOrder = await apiFetch(`/api/orders/${orderId}`);
              if (!stopped) setOrder(fullOrder);
            } catch (err) {
              console.error(err);
            }
          }

          return;
        }

        if (result.paymentStatus === 'processing') {
          // A small bounded retry gives webhooks/async payment methods time to
          // settle without ever displaying a false success state.
          if (attempt < 4) {
            timer = setTimeout(() => verify(attempt + 1), 1800);
          } else {
            setVerification('processing');
            setMessage(
              'Stripe is still processing this payment. We will not mark the order as placed until Stripe confirms success.'
            );
          }
          return;
        }

        setVerification('failed');
        setMessage(
          'Payment was not completed successfully. Your order has not been placed and will not appear in My Orders.'
        );
      } catch (err) {
        if (stopped) return;
        setVerification('failed');
        setMessage(
          err.message ||
          'We could not verify payment success. Your order has not been shown as placed.'
        );
      }
    };

    verify();

    return () => {
      stopped = true
      if (timer) clearTimeout(timer);
    };
  }, [orderId, paymentIntent]); // eslint-disable-line

  const success = verification === 'success';
  const processing = verification === 'processing';
  const failed = verification === 'failed';

  const displayTotal =
    order?.total !== undefined
      ? parseFloat(order.total)
      : verifiedTotal !== null
        ? parseFloat(verifiedTotal)
        : null;

  return (
    <div style={{
      paddingTop: 0,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 30% 50%, rgba(232,184,0,.05) 0%, transparent 60%), var(--d)',
    }}>
      <div style={{
        maxWidth: 590,
        width: '100%',
        padding: 40,
        background: 'var(--p)',
        border: '1px solid var(--b)',
        margin: '24px 16px',
      }}>

        {verification === 'checking' && (
          <div style={{ textAlign: 'center', padding: '22px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 3, color: 'var(--y)', marginBottom: 8 }}>
              VERIFYING PAYMENT
            </div>
            <div style={{ color: 'var(--t)', fontSize: 13, lineHeight: 1.7 }}>
              Confirming payment directly with Stripe before placing your order...
            </div>
          </div>
        )}

        {success && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, letterSpacing: 4, color: 'var(--y)', marginBottom: 8 }}>
                PAYMENT CONFIRMED
              </div>
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 44 }}>
                ORDER PLACED!
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--b)', borderBottom: '1px solid var(--b)', padding: '16px 0', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: displayTotal !== null ? 10 : 0 }}>
                <span style={{ fontSize: 12, color: 'var(--t)', letterSpacing: 1, textTransform: 'uppercase' }}>Order ID</span>
                <span style={{ fontSize: 12, fontFamily: 'Orbitron, monospace', color: 'var(--y)' }}>
                  {orderId?.slice(0, 8).toUpperCase()}
                </span>
              </div>

              {displayTotal !== null && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--t)', letterSpacing: 1, textTransform: 'uppercase' }}>Total Paid</span>
                  <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 26, color: 'var(--y)' }}>
                    ${displayTotal.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div style={{ fontSize: 13, color: 'var(--t)', lineHeight: 1.9, marginBottom: 18 }}>
              🛡 Your custom wheel order is confirmed.<br />
              ⏱ Estimated build time: <strong style={{ color: 'var(--w)' }}>3–4 weeks</strong>.<br />
              📧 For inquiries contact <a href="mailto:service@whossteering.com" style={{ color: 'var(--y)', textDecoration: 'none' }}>service@whossteering.com</a>
            </div>

            <div style={{
              padding: '12px 14px',
              marginBottom: 24,
              border: '1px solid rgba(232,184,0,.35)',
              background: 'rgba(232,184,0,.05)',
              color: 'var(--t)',
              fontSize: 11,
              lineHeight: 1.65,
            }}>
              <strong style={{ color: 'var(--y)' }}>CANCELLATION NOTICE:</strong>{' '}
              Orders may be canceled before order processing / the build begins.
              Once processing starts, the order can no longer be canceled.
            </div>

            {user ? (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn-outline sm" style={{ clipPath: 'none', flex: 1 }} onClick={() => nav('/catalog')}>
                  KEEP SHOPPING
                </button>
                <button className="btn" style={{ clipPath: 'none', flex: 1 }} onClick={() => nav('/account')}>
                  VIEW MY ORDER
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button className="btn" style={{ clipPath: 'none', minWidth: 200 }} onClick={() => nav('/catalog')}>
                  KEEP SHOPPING
                </button>
              </div>
            )}
          </>
        )}

        {processing && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 50, marginBottom: 12 }}>⏳</div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 3, color: 'var(--y)', marginBottom: 8 }}>
              PAYMENT PROCESSING
            </div>
            <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 34, marginBottom: 14 }}>
              NOT PLACED YET
            </div>
            <div style={{ color: 'var(--t)', fontSize: 13, lineHeight: 1.8, marginBottom: 24 }}>
              {message}
            </div>
            <button className="btn-outline sm" onClick={() => window.location.reload()}>
              CHECK AGAIN
            </button>
          </div>
        )}

        {failed && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 50, marginBottom: 12 }}>✕</div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 3, color: '#FF6650', marginBottom: 8 }}>
              PAYMENT NOT CONFIRMED
            </div>
            <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 34, marginBottom: 14 }}>
              ORDER NOT PLACED
            </div>
            <div style={{ color: 'var(--t)', fontSize: 13, lineHeight: 1.8, marginBottom: 24 }}>
              {message}
            </div>
            <button className="btn" style={{ clipPath: 'none' }} onClick={() => nav('/checkout')}>
              RETURN TO CHECKOUT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

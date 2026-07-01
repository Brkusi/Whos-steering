import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context';
import { useAuth } from '../context';
import { apiFetch } from '../lib/api';

export default function OrderConfirmation() {
  const [params] = useSearchParams();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const orderId = params.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearCart();
    if (orderId) {
      apiFetch(`/api/orders/${orderId}`)
        .then(setOrder)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]); // eslint-disable-line

  return (
    <div style={{ paddingTop: 120, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 30% 50%, rgba(232,184,0,.05) 0%, transparent 60%), var(--d)' }}>
      <div style={{ maxWidth: 560, width: '100%', padding: 40, background: 'var(--p)', border: '1px solid var(--b)', margin: '0 16px' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, letterSpacing: 4, color: 'var(--y)', marginBottom: 8 }}>PAYMENT CONFIRMED</div>
          <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 44 }}>ORDER PLACED!</div>
        </div>

        {loading ? (
          <div style={{ color: 'var(--t)', textAlign: 'center', padding: '20px 0' }}>Loading order details...</div>
        ) : order ? (
          <div>
            <div style={{ borderTop: '1px solid var(--b)', borderBottom: '1px solid var(--b)', padding: '16px 0', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--t)', letterSpacing: 1, textTransform: 'uppercase' }}>Order ID</span>
                <span style={{ fontSize: 12, fontFamily: 'Orbitron, monospace', color: 'var(--y)' }}>{orderId?.slice(0,8).toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--t)', letterSpacing: 1, textTransform: 'uppercase' }}>Total Paid</span>
                <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 26, color: 'var(--y)' }}>${parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--t)', lineHeight: 1.9, marginBottom: 24 }}>
              🛡 Your custom wheel build is now queued.<br />
              ⏱ Estimated build time: <strong style={{ color: 'var(--w)' }}>3–4 weeks</strong>.<br />
              📧 For any inquiries contact <a href="mailto:service@whossteering.com" style={{ color: 'var(--y)', textDecoration: 'none' }}>service@whossteering.com</a>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--t)', fontSize: 13, lineHeight: 1.9, marginBottom: 24 }}>
            Your payment was received. A confirmation email will follow shortly.<br />
            ⏱ Estimated build time: <strong style={{ color: 'var(--w)' }}>3–4 weeks</strong>.<br />
            📧 For any inquiries contact <a href="mailto:service@whossteering.com" style={{ color: 'var(--y)', textDecoration: 'none' }}>service@whossteering.com</a>
          </div>
        )}

        {/* Buttons — centered when only one, side by side when two */}
        {user ? (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-outline sm" style={{ clipPath: 'none', flex: 1 }} onClick={() => nav('/catalog')}>KEEP SHOPPING</button>
            <button className="btn" style={{ clipPath: 'none', flex: 1 }} onClick={() => nav(orderId ? `/account` : '/account')}>VIEW MY ORDER</button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="btn" style={{ clipPath: 'none', minWidth: 200 }} onClick={() => nav('/catalog')}>KEEP SHOPPING</button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context';
import { useAuth } from '../context';
import { apiFetch } from '../lib/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// ─── Inner form (inside <Elements>) ─────────────────────────────────────────
function CheckoutForm({ orderId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError('');

    const { error: stripeErr } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation?orderId=${orderId}`,
      },
    });

    if (stripeErr) {
      setError(stripeErr.message);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <div className="err-msg" style={{ marginTop: 12 }}>{error}</div>}
      <button className="btn" type="submit" disabled={!stripe || processing}
        style={{ width: '100%', clipPath: 'none', marginTop: 20 }}>
        {processing ? 'PROCESSING...' : 'COMPLETE PURCHASE'}
      </button>
    </form>
  );
}

// ─── Checkout Page ───────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState(user?.email || '');
  const [name,  setName]  = useState(user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '');
  const [addr,  setAddr]  = useState({ address1: '', city: '', state: '', zip: '', country: 'US' });

  useEffect(() => {
    if (items.length === 0) nav('/catalog');
  }, [items, nav]);

  const startPayment = async () => {
    if (!email) { setError('Email is required'); return; }
    setLoading(true); setError('');
    try {
      const res = await apiFetch('/api/checkout/create-intent', {
        method: 'POST',
        body: JSON.stringify({
          cartItems: items.map(i => ({
            name: i.name, detail: i.detail, quantity: 1,
            config: i.config,
          })),
          customer: { email, name },
          shippingAddress: { name, ...addr },
        }),
      });
      setClientSecret(res.clientSecret);
      setOrderId(res.orderId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stripeOpts = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: { colorPrimary: '#E8B800', colorBackground: '#1E1E1E', fontFamily: 'Rajdhani, sans-serif' },
    },
  };

  return (
    <div style={{ paddingTop: 88, minHeight: '100vh', background: 'var(--d)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: 40 }}>

        {/* Left: order summary */}
        <div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: 'var(--y)', marginBottom: 8 }}>ORDER SUMMARY</div>
          <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 40, marginBottom: 24 }}>CHECKOUT</div>

          {items.map(item => (
            <div key={item.cartId} style={{ padding: '16px 0', borderBottom: '1px solid var(--b)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontStyle: 'italic', fontSize: 20 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: 'var(--t)', marginTop: 3 }}>{item.detail}</div>
              </div>
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 22, color: 'var(--y)', whiteSpace: 'nowrap' }}>
                ${item.price.toFixed(2)}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderTop: '2px solid var(--y)', marginTop: 8 }}>
            <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, letterSpacing: 2 }}>TOTAL</span>
            <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 32, color: 'var(--y)' }}>${total.toFixed(2)}</span>
          </div>

          <div style={{ fontSize: 12, color: 'var(--t)', lineHeight: 1.7, marginTop: 16, padding: '16px', borderLeft: '2px solid rgba(232,184,0,.3)', background: 'rgba(232,184,0,.03)' }}>
            🛡 6 Month Manufacturer Warranty &nbsp;·&nbsp; ⏱ 3–5 Week Custom Build &nbsp;·&nbsp; Made to Order
          </div>
        </div>

        {/* Right: contact + payment */}
        <div>
          {!clientSecret ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 3, color: 'var(--y)', marginBottom: 4 }}>CONTACT & SHIPPING</div>

              <div><label className="fl">Email <span className="req">*</span></label>
                <input className="fi" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" /></div>

              <div><label className="fl">Full Name</label>
                <input className="fi" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" /></div>

              <div><label className="fl">Address</label>
                <input className="fi" type="text" value={addr.address1} onChange={e => setAddr(a => ({...a, address1: e.target.value}))} placeholder="123 Main St" /></div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label className="fl">City</label>
                  <input className="fi" type="text" value={addr.city} onChange={e => setAddr(a => ({...a, city: e.target.value}))} placeholder="City" /></div>
                <div><label className="fl">State</label>
                  <input className="fi" type="text" value={addr.state} onChange={e => setAddr(a => ({...a, state: e.target.value}))} placeholder="NY" /></div>
              </div>

              <div><label className="fl">ZIP</label>
                <input className="fi" type="text" value={addr.zip} onChange={e => setAddr(a => ({...a, zip: e.target.value}))} placeholder="10001" /></div>

              {error && <div className="err-msg">{error}</div>}

              <button className="btn" style={{ clipPath: 'none', marginTop: 8 }} onClick={startPayment} disabled={loading}>
                {loading ? 'PREPARING...' : 'CONTINUE TO PAYMENT →'}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 3, color: 'var(--y)', marginBottom: 16 }}>PAYMENT</div>
              <Elements stripe={stripePromise} options={stripeOpts}>
                <CheckoutForm orderId={orderId} onSuccess={() => { clearCart(); nav(`/order-confirmation?orderId=${orderId}`); }} />
              </Elements>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

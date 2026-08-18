import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context';
import { useAuth } from '../context';
import { apiFetch } from '../lib/api';

// Preferred env name matches frontend/.env.example.
// Legacy REACT_APP_STRIPE_PK is kept as a fallback so older deployments still work.
const STRIPE_PK =
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ||
  process.env.REACT_APP_STRIPE_PK;

const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

// ── Payment form (lives inside <Elements>) ────────────────────────────────────
function PaymentForm({ total, orderId, email }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [elementReady, setElementReady] = useState(false);
  const [elementLoadError, setElementLoadError] = useState('');

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation?orderId=${orderId}`,
        receipt_email: email,
      },
    });
    if (stripeError) setError(stripeError.message);
    setLoading(false);
  };

  return (
    <div>
      {!elementReady && !elementLoadError && (
        <div style={{ padding: '30px 0', textAlign: 'center', fontSize: 13, color: 'var(--t)', letterSpacing: 1 }}>
          Loading payment form...
        </div>
      )}
      <div style={{ display: elementReady ? 'block' : 'none' }}>
        <PaymentElement
          options={{ layout: 'tabs' }}
          onReady={() => setElementReady(true)}
          onLoadError={(e) => setElementLoadError(e?.error?.message || 'Failed to load payment form.')}
        />
      </div>
      {elementLoadError && (
        <div style={{ padding: '10px 14px', background: 'rgba(204,51,0,.1)', border: '1px solid #CC3300', color: '#FF5533', fontSize: 12, marginTop: 16 }}>
          {elementLoadError} — please refresh the page. If this keeps happening, the Stripe client secret may have expired; go back and re-enter your shipping info to start a new payment session.
        </div>
      )}
      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(204,51,0,.1)', border: '1px solid #CC3300', color: '#FF5533', fontSize: 12, marginTop: 16 }}>
          {error}
        </div>
      )}
      <button
        className="btn"
        style={{ clipPath: 'none', width: '100%', padding: 18, fontSize: 13, marginTop: 20 }}
        onClick={handlePay}
        disabled={!stripe || loading || !elementReady}
      >
        {loading ? 'PROCESSING...' : `PAY $${total.toFixed(2)}`}
      </button>
      <div style={{ fontSize: 11, color: 'var(--t)', textAlign: 'center', marginTop: 12 }}>
        🔒 Secured by Stripe · Your card details are never stored
      </div>
    </div>
  );
}

// ── Main Checkout page ────────────────────────────────────────────────────────
export default function Checkout() {
  const { items, total } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');

  const [info, setInfo] = useState({
    email: '', name: '', address1: '', address2: '',
    city: '', state: '', zip: '', country: 'US',
  });
  const [infoErrors, setInfoErrors] = useState({});

  useEffect(() => {
    if (user?.email) setInfo(prev => ({ ...prev, email: user.email }));
  }, [user]);

  const validateInfo = () => {
    const e = {};
    if (!info.email)    e.email    = true;
    if (!info.name)     e.name     = true;
    if (!info.address1) e.address1 = true;
    if (!info.city)     e.city     = true;
    if (!info.state)    e.state    = true;
    if (!info.zip)      e.zip      = true;
    setInfoErrors(e);
    return !Object.keys(e).length;
  };

  const handleContinue = async () => {
    if (!validateInfo()) return;
    setLoading(true);
    setError('');
    try {
      const result = await apiFetch('/api/checkout/create-intent', {
        method: 'POST',
        body: JSON.stringify({
          cartItems: items.map(item => ({
            name: item.name,
            detail: item.detail,
            price: item.price,
            quantity: 1,
            config: item.config || {},
          })),
          customer: { email: info.email, name: info.name },
          shippingAddress: {
            name: info.name, address1: info.address1,
            address2: info.address2, city: info.city,
            state: info.state, zip: info.zip, country: info.country,
          },
        }),
      });
      setClientSecret(result.clientSecret);
      setOrderId(result.orderId);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, k, placeholder, half }) => (
    <div style={{ flex: half ? '0 0 calc(50% - 5px)' : '1 1 100%' }}>
      <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--t)', marginBottom: 5 }}>
        {label} <span style={{ color: 'var(--y)' }}>*</span>
      </label>
      <input
        className={`fi${infoErrors[k] ? ' error' : ''}`}
        value={info[k]}
        placeholder={placeholder}
        onChange={e => { setInfo(p => ({ ...p, [k]: e.target.value })); setInfoErrors(p => ({ ...p, [k]: false })); }}
        style={{ width: '100%' }}
      />
      {infoErrors[k] && <div className="err-msg">Required</div>}
    </div>
  );

  if (!items.length && !clientSecret) {
    return (
      <div style={{ paddingTop: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--d)' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, opacity: .2, marginBottom: 16 }}>🛒</div>
          <div style={{ color: 'var(--t)', letterSpacing: 2, textTransform: 'uppercase', fontSize: 13, marginBottom: 20 }}>Your cart is empty</div>
          <button className="btn" style={{ clipPath: 'none' }} onClick={() => nav('/catalog')}>SHOP CATALOG</button>
        </div>
      </div>
    );
  }

  const stripeAppearance = {
    theme: 'night',
    variables: {
      colorPrimary: '#E8B800',
      colorBackground: '#1E1E1E',
      colorText: '#F0F0F0',
      colorDanger: '#FF5533',
      fontFamily: 'Rajdhani, sans-serif',
      borderRadius: '0px',
    },
  };

  return (
    <div style={{ paddingTop: 0, minHeight: '100vh', background: 'var(--d)' }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '40px 24px',
        display: 'grid',
        gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 400px',
        gap: 32, alignItems: 'start',
      }}>

        {/* ── Left: form ── */}
        <div>
          {/* Step tabs */}
          <div style={{ display: 'flex', marginBottom: 32, borderBottom: '1px solid var(--b)' }}>
            {['Contact & Shipping', 'Payment'].map((label, i) => (
              <div key={i}
                style={{ flex: 1, padding: '14px 20px', fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: 2, color: step === i + 1 ? 'var(--y)' : 'var(--t)', borderBottom: step === i + 1 ? '2px solid var(--y)' : '2px solid transparent', cursor: step > i + 1 ? 'pointer' : 'default', transition: 'color .2s' }}
                onClick={() => step > i + 1 && setStep(i + 1)}>
                {i + 1}. {label.toUpperCase()}
              </div>
            ))}
          </div>

          {/* Step 1 — info */}
          {step === 1 && (
            <div>
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 28, marginBottom: 24 }}>CONTACT & SHIPPING</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                <Field label="Email"    k="email"    placeholder="your@email.com" />
                <Field label="Full Name" k="name"   placeholder="John Smith" />
                <Field label="Address"  k="address1" placeholder="123 Main St" />
                <div style={{ flex: '1 1 100%' }}>
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--t)', marginBottom: 5 }}>Apt / Suite</label>
                  <input className="fi" value={info.address2} placeholder="Optional"
                    onChange={e => setInfo(p => ({ ...p, address2: e.target.value }))} style={{ width: '100%' }} />
                </div>
                <Field label="City"  k="city"  placeholder="New York"  half />
                <Field label="State" k="state" placeholder="NY"        half />
                <Field label="ZIP"   k="zip"   placeholder="10001"     half />
                <div style={{ flex: '0 0 calc(50% - 5px)' }}>
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--t)', marginBottom: 5 }}>Country</label>
                  <select className="fi" value={info.country} onChange={e => setInfo(p => ({ ...p, country: e.target.value }))} style={{ width: '100%' }}>
                    {[['US','United States'],['CA','Canada'],['GB','United Kingdom'],['AU','Australia'],['DE','Germany'],['FR','France'],['Other','Other']].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              {error && (
                <div style={{ padding: '10px 14px', background: 'rgba(204,51,0,.1)', border: '1px solid #CC3300', color: '#FF5533', fontSize: 12, marginBottom: 16 }}>{error}</div>
              )}
              <button className="btn" style={{ clipPath: 'none', width: '100%', padding: 18, fontSize: 13 }}
                onClick={handleContinue} disabled={loading}>
                {loading ? 'PROCESSING...' : 'CONTINUE TO PAYMENT →'}
              </button>
            </div>
          )}

          {/* Step 2 — Stripe */}
          {step === 2 && clientSecret && (
            <div>
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 28, marginBottom: 24 }}>PAYMENT</div>
              {!stripePromise ? (
                <div style={{ padding: '14px 16px', background: 'rgba(204,51,0,.1)', border: '1px solid #CC3300', color: '#FF5533', fontSize: 13, lineHeight: 1.6 }}>
                  Payment form couldn't load because the Stripe publishable key is missing from this build. Set REACT_APP_STRIPE_PUBLISHABLE_KEY in your Netlify environment variables, then redeploy the site. (REACT_APP_STRIPE_PK is still accepted as a legacy fallback.)
                </div>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
                  <PaymentForm total={total} orderId={orderId} email={info.email} />
                </Elements>
              )}
            </div>
          )}
        </div>

        {/* ── Right: order summary ── */}
        <div style={{ background: 'var(--p)', border: '1px solid var(--b)', padding: 24 }}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 3, color: 'var(--y)', marginBottom: 16 }}>ORDER SUMMARY</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 20 }}>
            {items.map(item => (
              <div key={item.cartId} style={{ padding: '14px 0', borderBottom: '1px solid var(--b)' }}>
                <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontStyle: 'italic', fontSize: 18 }}>{item.name}</div>
                {item.detail && <div style={{ fontSize: 11, color: 'var(--t)', marginTop: 2, lineHeight: 1.5 }}>{item.detail}</div>}
                <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 22, color: 'var(--y)', marginTop: 6 }}>${item.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--b)', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--t)' }}>Subtotal</span>
              <span style={{ fontWeight: 700 }}>${total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: 'var(--t)' }}>Shipping</span>
              <span style={{ fontSize: 12, color: '#3DB85A', fontWeight: 700 }}>Confirmed after order</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 2, color: 'var(--t)' }}>TOTAL</span>
              <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 36, color: 'var(--y)' }}>${total.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ marginTop: 20, padding: '12px 0', borderTop: '1px solid var(--b)', fontSize: 11, color: 'var(--t)', lineHeight: 1.9 }}>
            🛡 6 Month Warranty<br />
            ⏱ 3–4 Week Build Time<br />
            📦 Made to Order — ships when complete
          </div>
        </div>
      </div>
    </div>
  );
}
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
        <div style={{ padding: '30px 0', textAlign: 'center', fontSize: 14, color: 'var(--t)', letterSpacing: 1 }}>
          Loading payment form...
        </div>
      )}
      <div style={{ display: elementReady ? 'block' : 'none' }}>
        <PaymentElement
          options={{ layout: 'accordion', paymentMethodOrder: ['apple_pay', 'google_pay', 'card', 'paypal', 'klarna'], wallets: { applePay: 'auto', googlePay: 'auto' } }}
          onReady={() => setElementReady(true)}
          onLoadError={(e) => setElementLoadError(e?.error?.message || 'Failed to load payment form.')}
        />
      </div>
      {elementLoadError && (
        <div style={{ padding: '10px 14px', background: 'rgba(204,51,0,.1)', border: '1px solid #CC3300', color: '#FF5533', fontSize: 14, marginTop: 16 }}>
          {elementLoadError} — please refresh the page. If this keeps happening, the Stripe client secret may have expired; go back and re-enter your shipping info to start a new payment session.
        </div>
      )}
      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(204,51,0,.1)', border: '1px solid #CC3300', color: '#FF5533', fontSize: 14, marginTop: 16 }}>
          {error}
        </div>
      )}
      <button
        className="btn"
        style={{ clipPath: 'none', width: '100%', padding: 18, fontSize: 14, marginTop: 20 }}
        onClick={handlePay}
        disabled={!stripe || loading || !elementReady}
      >
        {loading ? 'PROCESSING...' : `PAY $${total.toFixed(2)}`}
      </button>
      <div style={{ fontSize: 14, color: 'var(--t)', textAlign: 'center', marginTop: 12 }}>
        🔒 Secured by Stripe · Your card details are never stored
      </div>
    </div>
  );
}


// Stable shipping field component.
// Important: keep this OUTSIDE Checkout(). If a component function is declared
// inside Checkout, React receives a new component type on every state update,
// which remounts the input and causes it to lose focus after each keystroke.
function ShippingField({
  label,
  fieldKey,
  placeholder,
  half,
  info,
  setInfo,
  infoErrors,
  setInfoErrors,
}) {
  return (
    <div style={{ flex: half ? '0 0 calc(50% - 5px)' : '1 1 100%' }}>
      <label
        htmlFor={`checkout-${fieldKey}`}
        style={{
          display: 'block',
          fontSize: 14,
          letterSpacing: .6,
          textTransform: 'uppercase',
          color: 'var(--t)',
          marginBottom: 5,
        }}
      >
        {label} <span style={{ color: 'var(--y)' }}>*</span>
      </label>

      <input
        id={`checkout-${fieldKey}`}
        type={fieldKey === 'email' ? 'email' : 'text'}
        required aria-invalid={!!infoErrors[fieldKey]} aria-describedby={infoErrors[fieldKey] ? `checkout-${fieldKey}-error` : undefined}
        className={`fi${infoErrors[fieldKey] ? ' error' : ''}`}
        value={info[fieldKey]}
        placeholder={placeholder}
        autoComplete={
          fieldKey === 'email' ? 'email' :
          fieldKey === 'name' ? 'name' :
          fieldKey === 'address1' ? 'address-line1' :
          fieldKey === 'city' ? 'address-level2' :
          fieldKey === 'state' ? 'address-level1' :
          fieldKey === 'zip' ? 'postal-code' :
          'off'
        }
        onChange={(e) => {
          const value = e.target.value;
          setInfo((prev) => ({ ...prev, [fieldKey]: value }));

          if (infoErrors[fieldKey]) {
            setInfoErrors((prev) => ({ ...prev, [fieldKey]: false }));
          }
        }}
        style={{ width: '100%' }}
      />

      {infoErrors[fieldKey] && (
        <div id={`checkout-${fieldKey}-error`} className="err-msg">{typeof infoErrors[fieldKey] === 'string' ? infoErrors[fieldKey] : 'This field is required.'}</div>
      )}
    </div>
  );
}

// ── Main Checkout page ────────────────────────────────────────────────────────
export default function Checkout() {
  const { items, total } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

  const [step, setStep] = useState(1);
  const [provider,setProvider]=useState('stripe');
  const [paypalAvailable,setPaypalAvailable]=useState(false);
  useEffect(()=>{apiFetch('/api/paypal/availability').then(r=>setPaypalAvailable(r.enabled)).catch(()=>{});},[]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [paymentTotal, setPaymentTotal] = useState(total);

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const [info, setInfo] = useState({
    email: '', name: '', address1: '', address2: '',
    city: '', state: '', zip: '', country: 'US',
  });
  const [infoErrors, setInfoErrors] = useState({});

  useEffect(() => {
    if (user?.email) setInfo(prev => ({ ...prev, email: user.email }));
  }, [user]);

  const promoDiscount = appliedPromo
    ? total * (appliedPromo.percentOff / 100)
    : 0;

  const displayedTotal = Math.max(0, total - promoDiscount);

  const applyPromo = async () => {
    const code = promoInput.trim();

    if (!code) {
      setAppliedPromo(null);
      setPromoMessage('Enter a promo code.');
      return;
    }

    setPromoLoading(true);
    setPromoMessage('');

    try {
      const result = await apiFetch('/api/checkout/validate-promo', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });

      if (!result.valid) {
        setAppliedPromo(null);
        setPromoMessage(result.error || 'Promo code not recognized.');
        return;
      }

      setAppliedPromo({
        code: result.code,
        percentOff: Number(result.percentOff) || 0,
        label: result.label || '',
      });
      setPromoInput(result.code);
      setPromoMessage(`${result.code.toUpperCase()} applied — ${result.percentOff}% off.`);
    } catch (err) {
      setAppliedPromo(null);
      setPromoMessage(err.message || 'Unable to validate promo code.');
    } finally {
      setPromoLoading(false);
    }
  };

  const validateInfo = () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(info.email.trim())) e.email = 'Enter a valid email address.';
    if (!info.name.trim())     e.name     = true;
    if (!info.address1.trim()) e.address1 = true;
    if (!info.city.trim())     e.city     = true;
    if (!info.state.trim())    e.state    = true;
    if (!info.zip.trim())      e.zip      = true;
    setInfoErrors(e);
    return !Object.keys(e).length;
  };

  const handleContinue = async () => {
    if (loading) return;
    if (!validateInfo()) { setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0); return; }
    setLoading(true);
    setError('');
    try {
      const result = await apiFetch('/api/checkout/create-intent', {
        method: 'POST',
        body: JSON.stringify({
          provider,
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
          promoCode: appliedPromo?.code || '',
        }),
      });
      if(result.approvalUrl){sessionStorage.setItem('ws_paypal_'+result.orderId,result.checkoutToken);window.location.assign(result.approvalUrl);return;}
      setClientSecret(result.clientSecret);
      setOrderId(result.orderId);
      setPaymentTotal(Number(result.amount));
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length && !clientSecret) {
    return (
      <div style={{ paddingTop: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--d)' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, opacity: .2, marginBottom: 16 }}>🛒</div>
          <div style={{ color: 'var(--t)', letterSpacing: .6, textTransform: 'uppercase', fontSize: 14, marginBottom: 20 }}>Your cart is empty</div>
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
      fontFamily: 'Arial, sans-serif',
      borderRadius: '6px',
    },
  };

  return (
    <div className="checkout-page"><div className="checkout-heading"><p className="eyebrow">Your next drive starts here</p><h1>Checkout</h1><p>Review your build, add your shipping details, and choose how to pay.</p></div>
      <div className="checkout-layout">

        {/* ── Left: form ── */}
        <div className="checkout-panel">
          {/* Step tabs */}
          <div className="checkout-steps" aria-label="Checkout progress">{['Contact & shipping','Payment'].map((label,i)=><button key={label} aria-current={step===i+1?'step':undefined} disabled={i+1>step} onClick={()=>setStep(i+1)}>{i+1}. {label}</button>)}</div>
          {step===1 && paypalAvailable && <div className="checkout-providers" role="group" aria-label="Payment provider"><button className={provider==='stripe'?'ob on':'ob'} aria-pressed={provider==='stripe'} onClick={()=>setProvider('stripe')}>Card, wallets & pay later</button><button className={provider==='paypal'?'ob on':'ob'} aria-pressed={provider==='paypal'} onClick={()=>setProvider('paypal')}>PayPal</button></div>}
          {/* Step 1 — info */}
          {step === 1 && (
            <div className="checkout-step">
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 28, marginBottom: 24 }}>CONTACT & SHIPPING</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                <ShippingField label="Email" fieldKey="email" placeholder="your@email.com" info={info} setInfo={setInfo} infoErrors={infoErrors} setInfoErrors={setInfoErrors} />
                <ShippingField label="Full Name" fieldKey="name" placeholder="John Smith" info={info} setInfo={setInfo} infoErrors={infoErrors} setInfoErrors={setInfoErrors} />
                <ShippingField label="Address" fieldKey="address1" placeholder="123 Main St" info={info} setInfo={setInfo} infoErrors={infoErrors} setInfoErrors={setInfoErrors} />
                <div style={{ flex: '1 1 100%' }}>
                  <label style={{ display: 'block', fontSize: 14, letterSpacing: .6, textTransform: 'uppercase', color: 'var(--t)', marginBottom: 5 }}>Apt / Suite</label>
                  <input className="fi" value={info.address2} placeholder="Optional"
                    onChange={e => setInfo(p => ({ ...p, address2: e.target.value }))} style={{ width: '100%' }} />
                </div>
                <ShippingField label="City" fieldKey="city" placeholder="New York" half info={info} setInfo={setInfo} infoErrors={infoErrors} setInfoErrors={setInfoErrors} />
                <ShippingField label="State" fieldKey="state" placeholder="NY" half info={info} setInfo={setInfo} infoErrors={infoErrors} setInfoErrors={setInfoErrors} />
                <ShippingField label="ZIP" fieldKey="zip" placeholder="10001" half info={info} setInfo={setInfo} infoErrors={infoErrors} setInfoErrors={setInfoErrors} />
                <div style={{ flex: '0 0 calc(50% - 5px)' }}>
                  <label style={{ display: 'block', fontSize: 14, letterSpacing: .6, textTransform: 'uppercase', color: 'var(--t)', marginBottom: 5 }}>Country</label>
                  <select className="fi" value={info.country} onChange={e => setInfo(p => ({ ...p, country: e.target.value }))} style={{ width: '100%' }}>
                    {[['US','United States'],['CA','Canada'],['GB','United Kingdom'],['AU','Australia'],['DE','Germany'],['FR','France'],['Other','Other']].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              {error && (
                <div style={{ padding: '10px 14px', background: 'rgba(204,51,0,.1)', border: '1px solid #CC3300', color: '#FF5533', fontSize: 14, marginBottom: 16 }}>{error}</div>
              )}
              <button className="btn" style={{ clipPath: 'none', width: '100%', padding: 18, fontSize: 14 }}
                onClick={handleContinue} disabled={loading}>
                {loading ? 'Preparing payment…' : provider==='paypal' ? 'Continue with PayPal ↗' : 'Continue to payment →'}
              </button>
            </div>
          )}

          {/* Step 2 — Stripe */}
          {step === 2 && clientSecret && (
            <div className="checkout-step">
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 28, marginBottom: 24 }}>PAYMENT</div>
              {!stripePromise ? (
                <div style={{ padding: '14px 16px', background: 'rgba(204,51,0,.1)', border: '1px solid #CC3300', color: '#FF5533', fontSize: 14, lineHeight: 1.6 }}>
                  Payments are temporarily unavailable. Your cart is saved for this session. Please try again later or contact our team.
                </div>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
                  <PaymentForm total={paymentTotal} orderId={orderId} email={info.email} />
                </Elements>
              )}
            </div>
          )}
        </div>

        {/* ── Right: order summary ── */}
        <div className="checkout-summary">
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, letterSpacing: .6, color: 'var(--y)', marginBottom: 16 }}>ORDER SUMMARY</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 20 }}>
            {items.map(item => (
              <div key={item.cartId} style={{ padding: '14px 0', borderBottom: '1px solid var(--b)' }}>
                <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontStyle: 'italic', fontSize: 18 }}>{item.name}</div>
                {item.detail && <div style={{ fontSize: 14, color: 'var(--t)', marginTop: 2, lineHeight: 1.5 }}>{item.detail}</div>}
                <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 22, color: 'var(--y)', marginTop: 6 }}>${item.price.toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Promo code */}
          <div style={{
            padding: '14px 0 16px',
            borderBottom: '1px solid var(--b)',
            marginBottom: 16,
          }}>
            <div style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: 14,
              letterSpacing: .6,
              color: 'var(--t)',
              marginBottom: 7,
            }}>
              PROMO CODE
            </div>

            <div style={{ display: 'flex', gap: 7 }}>
              <input
                className="fi"
                aria-label="Promo code" aria-label="Promo code" value={promoInput}
                disabled={step === 2}
                placeholder="Enter promo code"
                onChange={(e) => {
                  setPromoInput(e.target.value);
                  if (
                    appliedPromo &&
                    e.target.value.trim().toLowerCase() !== appliedPromo.code
                  ) {
                    setAppliedPromo(null);
                    setPromoMessage('');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && step === 1) {
                    e.preventDefault();
                    applyPromo();
                  }
                }}
                style={{
                  flex: 1,
                  minWidth: 0,
                  textTransform: 'none',
                  opacity: step === 2 ? .7 : 1,
                }}
              />

              <button
                type="button"
                className="btn-outline sm"
                onClick={applyPromo}
                disabled={promoLoading || step === 2}
                style={{
                  minWidth: 84,
                  clipPath: 'none',
                  opacity: step === 2 ? .5 : 1,
                }}
              >
                {promoLoading ? '...' : appliedPromo ? 'APPLIED' : 'APPLY'}
              </button>
            </div>

            {promoMessage && (
              <div style={{
                marginTop: 7,
                fontSize: 14,
                lineHeight: 1.5,
                color: appliedPromo ? '#5DCC73' : '#FF6650',
              }}>
                {promoMessage}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--b)', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: 'var(--t)' }}>Subtotal</span>
              <span style={{ fontWeight: 700 }}>${total.toFixed(2)}</span>
            </div>

            {appliedPromo && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: '#5DCC73' }}>
                  Promo ({appliedPromo.code.toUpperCase()} · {appliedPromo.percentOff}%)
                </span>
                <span style={{ fontSize: 14, color: '#5DCC73', fontWeight: 800 }}>
                  -${promoDiscount.toFixed(2)}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 14, color: 'var(--t)' }}>Shipping</span>
              <span style={{ fontSize: 14, color: '#3DB85A', fontWeight: 700 }}>Confirmed after order</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, letterSpacing: .6, color: 'var(--t)' }}>TOTAL</span>
              <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 36, color: 'var(--y)' }}>
                ${(step === 2 && clientSecret ? paymentTotal : displayedTotal).toFixed(2)}
              </span>
            </div>
          </div>
          <div style={{ marginTop: 20, padding: '12px 0', borderTop: '1px solid var(--b)', fontSize: 14, color: 'var(--t)', lineHeight: 1.9 }}>
            🛡 6 Month Warranty<br />
            ⏱ 3–4 Week Build Time<br />
            📦 Made to Order — ships when complete<br />
            <span style={{ color: 'var(--y)' }}>↩ Cancellation:</span>{' '}
            Orders may be canceled before order processing / the build begins.
            Once processing starts, cancellation is no longer available.
          </div>
        </div>
      </div>
    </div>
  );
}
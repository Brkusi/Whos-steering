import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function CustomOrderConfirmation() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(sessionId));
  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    apiFetch(`/api/custom-orders/confirm?sessionId=${encodeURIComponent(sessionId)}`)
      .then(data => { if (active) setResult(data); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [sessionId]);
  return <main className="empty-state" style={{ minHeight: '55vh' }}>
    {loading ? <><h1>Verifying your payment…</h1><p>Please wait while we check with Stripe.</p></> : error ? <><h1>We couldn't verify this payment yet.</h1><p>{error}</p><button className="btn" onClick={() => window.location.reload()}>Try again</button></> : result?.paid ? <><p className="eyebrow">Payment confirmed</p><h1>Thank you for your order.</h1><p>Stripe confirmed your payment of ${result.amount} for {result.title}. Your order number is #{result.orderId}.</p><Link className="btn" to="/track-order">Track your order →</Link></> : sessionId ? <><h1>Payment is still processing.</h1><p>We have not received a successful payment confirmation yet. Please check back shortly.</p><button className="btn" onClick={() => window.location.reload()}>Check again</button></> : <><h1>Payment was not completed.</h1><p>Your custom order has not been charged.</p><Link className="btn" to="/contact">Contact us</Link></>}
  </main>;
}

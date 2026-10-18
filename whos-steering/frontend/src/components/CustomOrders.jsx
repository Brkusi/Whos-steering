import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import './CustomOrders.css';

const blank = () => ({ email: '', title: '', description: '', price: '', requestId: crypto.randomUUID() });
const money = value => Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function CustomOrders() {
  const [form, setForm] = useState(blank);
  const [review, setReview] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/custom-orders');
      setOrders(data.orders);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, []);

  const update = (key, value) => {
    setForm(current => ({ ...current, [key]: value }));
    setReview(false);
    setError('');
  };
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) && form.title.trim() &&
    /^\d{1,6}(?:\.\d{1,2})?$/.test(form.price.trim()) && Number(form.price) >= 0.5;
  const create = async () => {
    if (busy || !valid) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await apiFetch('/api/custom-orders', {
        method: 'POST', body: JSON.stringify({ ...form, email: form.email.trim(), title: form.title.trim(), description: form.description.trim() }),
      });
      setOrders(current => [result.order, ...current.filter(order => order.orderId !== result.order.orderId)]);
      setNotice(result.emailSent
        ? `Payment link sent to ${result.order.email}.`
        : `Order created, but the email was not sent. Copy the link below or retry sending it.`);
      setForm(blank());
      setReview(false);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const resend = async orderId => {
    setSendingId(orderId);
    setError('');
    setNotice('');
    try {
      const result = await apiFetch(`/api/custom-orders/${orderId}/send`, { method: 'POST' });
      setOrders(current => current.map(order => order.orderId === orderId ? result.order : order));
      setNotice(result.emailSent ? `Payment link sent to ${result.order.email}.` : 'Email could not be sent. Copy the payment link or try again.');
    } catch (err) { setError(err.message); }
    finally { setSendingId(null); }
  };
  const copy = async url => {
    try { await navigator.clipboard.writeText(url); setNotice('Payment link copied.'); }
    catch { setError('Clipboard unavailable. Open the link and copy its address.'); }
  };

  return <section className="custom-orders-page">
    <div className="dashboard-heading"><div><p className="eyebrow">Who's Steering / Admin</p><h1>Custom orders</h1><p>Create a one-time Stripe payment link and send it directly to a customer.</p></div><button className="btn-outline" onClick={refresh} disabled={loading}>Refresh</button></div>
    {error && <div className="notice notice-error" role="alert">{error}</div>}
    {notice && <div className="notice" role="status">{notice}</div>}
    <div className="custom-orders-layout">
      <section className="custom-order-card" aria-labelledby="custom-order-title">
        <h2 id="custom-order-title">New custom order</h2>
        {!review ? <form onSubmit={event => { event.preventDefault(); if (valid) setReview(true); }}>
          <label htmlFor="custom-email">Customer email</label><input id="custom-email" className="fi" type="email" required maxLength={254} autoComplete="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="customer@example.com" />
          <label htmlFor="custom-title">Item or order name</label><input id="custom-title" className="fi" required maxLength={120} value={form.title} onChange={e => update('title', e.target.value)} placeholder="Custom steering wheel build" />
          <label htmlFor="custom-description">Details shown to the customer</label><textarea id="custom-description" className="fi" maxLength={2000} rows={4} value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe the agreed build and included options" />
          <label htmlFor="custom-price">Price (USD)</label><div className="custom-order-price"><span>$</span><input id="custom-price" className="fi" type="text" inputMode="decimal" required value={form.price} onChange={e => update('price', e.target.value)} placeholder="549.99" /></div>
          <p className="muted">The amount you enter is the full amount charged. The customer pays on Stripe's secure checkout page.</p>
          <button className="btn" type="submit" disabled={!valid}>Review payment request →</button>
        </form> : <div className="custom-order-review"><h3>Review before sending</h3><dl><dt>Send to</dt><dd>{form.email.trim()}</dd><dt>Order</dt><dd>{form.title.trim()}</dd>{form.description.trim() && <><dt>Details</dt><dd>{form.description.trim()}</dd></>}<dt>Total due</dt><dd>{money(form.price)}</dd></dl><div className="custom-order-actions"><button className="btn-outline" onClick={() => setReview(false)} disabled={busy}>Edit</button><button className="btn" onClick={create} disabled={busy}>{busy ? 'Creating link…' : 'Create & email payment link'}</button></div></div>}
      </section>
      <section className="custom-order-card custom-order-list" aria-labelledby="custom-orders-list-title"><h2 id="custom-orders-list-title">Recent custom orders</h2>
        {loading ? <p role="status">Loading orders…</p> : orders.length === 0 ? <p className="muted">No custom orders yet.</p> : <div className="custom-order-items">{orders.map(order => {
          const expired = new Date(order.expiresAt).getTime() <= Date.now();
          return <article key={order.orderId} className="custom-order-item"><div className="custom-order-item-head"><div><strong>{order.title}</strong><small>#{order.orderId.slice(0, 8).toUpperCase()} · {order.email}</small></div><span className="status-pill">{order.status.replace(/_/g, ' ')}</span></div><p>{money(order.amount)} · {new Date(order.createdAt).toLocaleDateString()}</p>{order.description && <p className="muted">{order.description}</p>}{order.status === 'pending' && <><p className="muted">{expired ? 'Payment link expired' : `Link expires ${new Date(order.expiresAt).toLocaleString()}`} · {order.emailSentAt ? `Last emailed ${new Date(order.emailSentAt).toLocaleString()}` : 'Email not sent'}</p><div className="custom-order-actions">{!expired && <><button className="btn-outline sm" onClick={() => copy(order.checkoutUrl)}>Copy link</button><a className="btn-outline sm" href={order.checkoutUrl} target="_blank" rel="noreferrer">Open checkout ↗</a></>}<button className="btn-outline sm" disabled={sendingId === order.orderId} onClick={() => resend(order.orderId)}>{sendingId === order.orderId ? 'Preparing…' : expired ? 'Renew & email link' : 'Email link again'}</button></div></>}</article>;
        })}</div>}
      </section>
    </div>
  </section>;
}

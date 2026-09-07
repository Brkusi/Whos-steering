import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useDialog } from './Experience';
const money = (cents, currency = 'usd') => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency
}).format(cents / 100);
function RefundDialog({
  payment,
  onClose,
  onUpdated
}) {
  const [snapshot, setSnapshot] = useState(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('requested_by_customer');
  const [note, setNote] = useState('');
  const [review, setReview] = useState(false);
  const [request, setRequest] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const ref = useRef(null);
  useDialog(ref, true, () => {
    if (!busy) onClose();
  });
  const refresh = () => {
    setError('');
    apiFetch(`/api/payments/${payment.id}`).then(setSnapshot).catch(e => setError(e.message));
  };
  useEffect(refresh, [payment.id]); // eslint-disable-line
  const cents = /^\d+(\.\d{1,2})?$/.test(amount) ? Math.round(Number(amount) * 100) : 0;
  const valid = snapshot && cents > 0 && cents <= snapshot.available && note.trim().length >= 3;
  const submit = async () => {
    if (busy) return;
    const payload = request || {
      amount: cents,
      reason,
      note: note.trim(),
      requestId: crypto.randomUUID()
    };
    setRequest(payload);
    setBusy(true);
    setError('');
    try {
      const response = await apiFetch(`/api/payments/${payment.id}/refunds`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setResult(response.refund);
      setSnapshot(response.payment);
      onUpdated();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return <div className="admin-modal-overlay"><section className="refund-dialog" ref={ref} role="dialog" aria-modal="true" aria-labelledby="refund-title" tabIndex={-1}>
    <header><div><p className="eyebrow">Payment detail</p><h2 id="refund-title">Order #{payment.order_id.slice(0, 8).toUpperCase()}</h2></div><button className="icon-button" onClick={onClose} disabled={busy} aria-label="Close payment detail">✕</button></header>
    {error && <div className="notice notice-error" role="alert">{error}{!snapshot && <button className="btn-outline" onClick={refresh}>Retry</button>}</div>}
    {!snapshot && !error && <p role="status">Verifying the payment balance…</p>}
    {snapshot && <><div className="payment-balances">{[['Collected', snapshot.amount], ['Refunded', snapshot.completed], ['Pending refunds', snapshot.pending], ['Available to refund', snapshot.available]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{money(value, snapshot.currency)}</strong></div>)}</div><p className="muted">{snapshot.method || 'Payment'} · {snapshot.status.replace(/_/g, ' ')}</p>
    {result ? <div className="notice" role="status">Refund {result.id}: {result.status}. {result.status === 'succeeded' || result.status === 'COMPLETED' ? 'The provider confirmed the refund.' : 'The request has been submitted; its status may still change.'}</div> : snapshot.available > 0 && snapshot.status === 'succeeded' && <>
      {!review ? <div className="refund-fields"><h3>Issue a refund</h3><p className="muted">Return any amount up to the remaining balance to the original payment method. A partial refund keeps fulfillment unchanged.</p><label htmlFor="refund-amount">Amount ({snapshot.currency.toUpperCase()})</label><div className="refund-amount"><input className="fi" id="refund-amount" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} /><button className="btn-outline" onClick={() => setAmount((snapshot.available / 100).toFixed(2))}>Full remaining amount</button></div><label htmlFor="refund-reason">Reason</label><select className="fi" id="refund-reason" value={reason} onChange={e => setReason(e.target.value)}><option value="requested_by_customer">Customer request</option><option value="duplicate">Duplicate payment</option><option value="fraudulent">Fraudulent payment</option></select>{reason === 'fraudulent' && <p className="muted">Stripe may add this card and email to its fraud block list.</p>}<label htmlFor="refund-note">Internal note</label><textarea className="fi" id="refund-note" maxLength={500} value={note} onChange={e => setNote(e.target.value)} placeholder="Why is this refund being issued?" /><button className="btn" disabled={!valid} onClick={() => setReview(true)}>Review refund →</button></div> : <div className="refund-review"><h3>Confirm {money(request?.amount || cents, snapshot.currency)} refund</h3><p>This returns funds to the customer’s original payment method. It cannot be undone.</p><p><strong>Reason:</strong> {reason.replace(/_/g, ' ')}<br /><strong>Note:</strong> {note}</p><div className="dashboard-actions">{!request && <button className="btn-outline" onClick={() => setReview(false)}>Edit details</button>}<button className="btn" disabled={busy} onClick={submit}>{busy ? 'Submitting…' : request ? 'Retry same refund' : 'Confirm refund'}</button></div></div>}
    </>}
    <h3 className="refund-history-title">Refund history</h3>{snapshot.refunds.length ? <ul className="refund-history">{snapshot.refunds.map(r => <li key={r.id}><div><strong>{money(r.amount, snapshot.currency)}</strong><span>{r.reason?.replace(/_/g, ' ') || 'Refund'} · {new Date(r.created * 1000).toLocaleDateString()}</span></div><span className="status-pill">{r.status}</span></li>)}</ul> : <p className="muted">No refunds for this payment.</p>}</>}
  </section></div>;
}
export default function PaymentCenter() {
  const [data, setData] = useState({
    payments: [],
    hasMore: false
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    apiFetch(`/api/payments?page=${page}`).then(r => {
      if (active) setData(r);
    }).catch(e => {
      if (active) setError(e.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [page, revision]);
  return <section className="payments-center"><div className="dashboard-heading"><div><p className="eyebrow">Payments & refunds</p><h1>Payment center</h1><p>Review transactions and manage full or partial refunds.</p></div><button className="btn-outline" disabled={loading} onClick={() => setRevision(r => r + 1)}>Refresh</button></div>{error && <div className="notice notice-error" role="alert">{error}</div>}<div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr>{['Order', 'Customer', 'Collected', 'Refunded', 'Payment status', ''].map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead><tbody>{!loading && !error && data.payments.map(p => <tr key={p.id}><td>#{p.order_id.slice(0, 8).toUpperCase()}</td><td>{p.email}<small>{new Date(p.created_at).toLocaleDateString()}</small></td><td>{money(Math.round(Number(p.amount) * 100), p.currency)}</td><td>{money(Math.round(Number(p.refunded_amount || 0) * 100), p.currency)}</td><td><span className="status-pill">{p.status.replace(/_/g, ' ')}</span></td><td><button className="btn-outline sm" onClick={() => setSelected(p)}>View payment</button></td></tr>)}</tbody></table>{loading && <div className="dashboard-empty" role="status">Loading payments…</div>}{!loading && !error && !data.payments.length && <div className="dashboard-empty">No payments on this page.</div>}</div><div className="dashboard-pagination"><button className="btn-outline" disabled={page === 1 || loading} onClick={() => setPage(p => p - 1)}>Previous</button><span>Page {page}</span><button className="btn-outline" disabled={!data.hasMore || loading} onClick={() => setPage(p => p + 1)}>Next</button></div>{selected && <RefundDialog payment={selected} onClose={() => setSelected(null)} onUpdated={() => setRevision(r => r + 1)} />}</section>;
}

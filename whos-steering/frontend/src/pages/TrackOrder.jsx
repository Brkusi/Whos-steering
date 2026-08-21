import { useState } from 'react';
import { apiFetch } from '../lib/api';
import './TrackOrder.css';

const STAGES = [
  { id: 'paid', label: 'ORDER CONFIRMED', short: 'CONFIRMED' },
  { id: 'in_build', label: 'BUILD IN PROGRESS', short: 'BUILD' },
  { id: 'quality_check', label: 'QUALITY CHECK', short: 'QUALITY' },
  { id: 'shipped', label: 'SHIPPED', short: 'SHIPPED' },
  { id: 'delivered', label: 'DELIVERED', short: 'DELIVERED' },
];

function statusCopy(status) {
  switch (status) {
    case 'paid': return 'Payment is confirmed and your build is waiting to enter production.';
    case 'in_build': return 'Your custom steering wheel is actively being built.';
    case 'quality_check': return 'Your build is complete and is going through final quality inspection.';
    case 'shipped': return 'Your order has left us and is on the way to you.';
    case 'delivered': return 'Your order has been marked as delivered.';
    default: return 'Your order status was found.';
  }
}

export default function TrackOrder() {
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!email.trim() || !orderNumber.trim()) {
      setError('Enter both the email used at checkout and your order number.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch('/api/orders/track', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), orderNumber: orderNumber.trim() }),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'We could not find an order matching those details.');
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = result?.progressIndex ?? -1;
  const cancelled = result?.status === 'cancelled' || result?.status === 'refunded';

  return (
    <main className="track-page">
      <section className="track-page__inner">
        <div className="track-page__eyebrow">ORDER STATUS</div>
        <h1>TRACK YOUR BUILD<span>.</span></h1>
        <p className="track-page__intro">
          Enter the email address used at checkout and the order number from your confirmation. We only reveal production and shipping status—never customer or address information.
        </p>

        <form className="track-form" onSubmit={submit}>
          <div className="track-field">
            <label htmlFor="track-email">EMAIL USED AT CHECKOUT</label>
            <input
              id="track-email"
              className="fi"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="track-field">
            <label htmlFor="track-order">ORDER NUMBER</label>
            <input
              id="track-order"
              className="fi"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. AB12CD34"
            />
          </div>

          <button className="btn track-form__submit" type="submit" disabled={loading}>
            {loading ? 'CHECKING...' : 'TRACK ORDER →'}
          </button>
        </form>

        {error && <div className="track-error">{error}</div>}

        {result && (
          <section className="track-result" aria-live="polite">
            <div className="track-result__top">
              <div>
                <span>ORDER</span>
                <strong>#{result.orderNumber}</strong>
              </div>
              <div className={`track-status-badge${cancelled ? ' is-cancelled' : ''}`}>
                {result.statusLabel}
              </div>
            </div>

            {cancelled ? (
              <div className="track-cancelled">
                This order has been {result.status === 'refunded' ? 'refunded' : 'cancelled'} and is no longer moving through production.
              </div>
            ) : (
              <>
                <div className="track-progress" aria-label={`${result.progressPercent}% through order progress`}>
                  {STAGES.map((stage, index) => {
                    const complete = index <= currentIndex;
                    const active = index === currentIndex;
                    return (
                      <div
                        key={stage.id}
                        className={`track-progress__step${complete ? ' is-complete' : ''}${active ? ' is-active' : ''}`}
                      >
                        <span className="track-progress__num">0{index + 1}</span>
                        <span className="track-progress__label">{stage.short}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="track-progress-meter" aria-hidden="true">
                  <span style={{ width: `${result.progressPercent}%` }} />
                </div>

                <div className="track-current">
                  <div className="track-current__eyebrow">CURRENT STAGE</div>
                  <div className="track-current__title">{result.statusLabel}</div>
                  <p>{statusCopy(result.status)}</p>
                  {result.updatedAt && (
                    <div className="track-current__updated">
                      Last updated {new Date(result.updatedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </>
            )}

            {result.tracking?.number && (
              <div className="tracking-box">
                <div className="tracking-box__eyebrow">SHIPPING TRACKING NUMBER</div>
                <div className="tracking-box__row">
                  <div>
                    {result.tracking.carrier && <span className="tracking-box__carrier">{result.tracking.carrier}</span>}
                    <strong>{result.tracking.number}</strong>
                  </div>
                  {result.tracking.url && (
                    <a href={result.tracking.url} target="_blank" rel="noreferrer">
                      TRACK PACKAGE ↗
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}

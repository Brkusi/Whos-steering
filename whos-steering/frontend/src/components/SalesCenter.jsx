import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { activityBuckets } from '../lib/salesDashboard';
import './SalesCenter.css';

const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
const number = value => Number(value || 0).toLocaleString('en-US');
const date = value => value ? new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';
const eventCount = (data, event) => Number(data?.events?.find(row => row.event === event)?.count || 0);
const leadCount = (data, kind) => Number(data?.counts?.find(row => row.kind === kind)?.count || 0);
const photoUrl = value => { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; } };

function ActivityPanel({ data, days }) {
  const [metric, setMetric] = useState('configure');
  const metrics = [['configure', 'Configure starts'], ['checkout', 'Checkout starts'], ['orders', 'Paid orders']];
  const buckets = activityBuckets(data.activity, days);
  const maximum = Math.max(1, ...buckets.map(bucket => bucket[metric]));
  const label = metrics.find(item => item[0] === metric)[1];
  return <section className="sales-panel">
    <div className="sales-panel-head"><div><p className="eyebrow">Activity</p><h2>{label}</h2></div><span>Last {days} days</span></div>
    <div className="sales-metric-tabs" role="group" aria-label="Activity metric">{metrics.map(([id, title]) => <button key={id} type="button" className={metric === id ? 'active' : ''} aria-pressed={metric === id} onClick={() => setMetric(id)}>{title}</button>)}</div>
    <div className="sales-chart" role="img" aria-label={`${label} over the last ${days} days`}>{buckets.map(bucket => <div className="sales-chart-column" key={bucket.start}>
      <strong>{bucket[metric] || ''}</strong><div className="sales-chart-track"><div className="sales-chart-bar" style={{ height: bucket[metric] ? `${Math.max(5, bucket[metric] / maximum * 100)}%` : '0%' }} title={`${bucket.label}: ${bucket[metric]} ${label.toLowerCase()}`} /></div><span>{bucket.label}</span>
    </div>)}</div>
    <p className="sales-source-note">Starts count unique browser sessions. Paid orders use confirmed order statuses.</p>
  </section>;
}

function FitmentQueue({ summary, onUpdated }) {
  const [status, setStatus] = useState('open');
  const [sort, setSort] = useState('oldest');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ leads: [], total: 0, hasMore: false });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);
  const [busyId, setBusyId] = useState(null);
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); setSelected(null); setQuery(search.trim()); }, 250);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    const params = new URLSearchParams({ status, sort, page: String(page), search: query });
    apiFetch(`/api/sales/admin/fitment?${params}`).then(data => { if (active) setResult(data); }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status, sort, query, page, revision]);
  async function changeStatus(lead) {
    if (busyId) return;
    const next = lead.status === 'open' ? 'resolved' : 'open';
    setBusyId(lead.id); setError(''); setMessage('');
    try {
      await apiFetch(`/api/sales/admin/${lead.id}`, { method: 'PATCH', body: JSON.stringify({ status: next }) });
      setSelected(current => current?.id === lead.id ? { ...current, status: next } : current);
      setMessage(`Fitment request ${next === 'resolved' ? 'resolved' : 'reopened'}.`);
      setRevision(value => value + 1);
      onUpdated();
    } catch (e) { setError(e.message); } finally { setBusyId(null); }
  }
  const imageLink = photoUrl(selected?.payload?.photoUrl);
  return <section className="sales-fitment" id="fitment-queue">
    <div className="sales-section-title"><div><p className="eyebrow">Fitment workflow</p><h2>Fitment inbox <span>{number(summary?.open)} open</span></h2><p>Review vehicle details and the customer's wheel photo before confirming fitment.</p></div><button className="btn-outline sm" disabled={loading} onClick={() => setRevision(value => value + 1)}>Refresh queue</button></div>
    <div className="sales-fitment-toolbar"><div className="sales-status-tabs" role="group" aria-label="Fitment status">{[['open', 'Open', summary?.open], ['resolved', 'Resolved', summary?.resolved], ['all', 'All', null]].map(([value, label, count]) => <button type="button" key={value} className={status === value ? 'active' : ''} aria-pressed={status === value} onClick={() => { setStatus(value); setPage(1); setSelected(null); }}>{label}{count != null && <span>{number(count)}</span>}</button>)}</div><label>Search requests<input className="fi" value={search} onChange={e => setSearch(e.target.value)} placeholder="Email, make, model, year" /></label><label>Order<select className="fi" value={sort} onChange={e => { setSort(e.target.value); setPage(1); setSelected(null); }}><option value="oldest">Oldest first</option><option value="newest">Newest first</option></select></label></div>
    {message && <div className="notice" role="status">{message}</div>}{error && <div className="notice notice-error" role="alert">{error} <button className="btn-outline sm" onClick={() => setRevision(value => value + 1)}>Retry</button></div>}
    <div className="sales-fitment-layout"><div className="sales-fitment-list" aria-busy={loading}>{loading && <div className="dashboard-empty" role="status">Loading fitment requests…</div>}{!loading && !error && !result.leads.length && <div className="dashboard-empty"><h3>No requests found</h3><p>{query ? 'Try another search or status.' : 'This part of the fitment queue is clear.'}</p></div>}{!loading && result.leads.map(lead => <button className={`sales-fitment-row${selected?.id === lead.id ? ' selected' : ''}`} key={lead.id} type="button" onClick={() => setSelected(lead)}><span className="sales-fitment-row-top"><strong>{[lead.payload?.brand, lead.payload?.year, lead.payload?.model].filter(Boolean).join(' ') || 'Vehicle details'}</strong><span className={`sales-state ${lead.status}`}>{lead.status}</span></span><span>{lead.email}</span><small>{date(lead.created_at)}</small></button>)}</div>
      <aside className="sales-fitment-detail">{selected ? <><p className="eyebrow">Fitment request</p><h3>{[selected.payload?.year, selected.payload?.brand, selected.payload?.model].filter(Boolean).join(' ') || 'Vehicle details'}</h3><span className={`sales-state ${selected.status}`}>{selected.status}</span><dl><div><dt>Customer</dt><dd>{selected.email}</dd></div><div><dt>Received</dt><dd>{date(selected.created_at)}</dd></div><div><dt>Vehicle</dt><dd>{[selected.payload?.brand, selected.payload?.model].filter(Boolean).join(' ') || '—'}</dd></div></dl><div className="sales-fitment-actions">{imageLink && <a className="btn-outline" href={imageLink} target="_blank" rel="noreferrer">View wheel photo ↗</a>}<a className="btn-outline" href={`mailto:${encodeURIComponent(selected.email)}?subject=Your%20steering%20wheel%20fitment%20request`}>Reply by email ↗</a><button className="btn" disabled={!!busyId} onClick={() => changeStatus(selected)}>{busyId === selected.id ? 'Saving…' : selected.status === 'open' ? 'Mark resolved' : 'Reopen request'}</button></div></> : <div className="sales-fitment-placeholder"><span>◎</span><h3>Select a request</h3><p>Vehicle details, wheel photo, and follow-up actions will appear here.</p></div>}</aside>
    </div><div className="dashboard-pagination sales-fitment-pagination"><span>{result.total ? `${(page - 1) * 25 + 1}–${Math.min(page * 25, result.total)} of ${result.total}` : '0 requests'}</span><div><button className="btn-outline sm" disabled={page === 1 || loading} onClick={() => { setPage(value => value - 1); setSelected(null); }}>Previous</button><span>Page {page}</span><button className="btn-outline sm" disabled={!result.hasMore || loading} onClick={() => { setPage(value => value + 1); setSelected(null); }}>Next</button></div></div>
  </section>;
}

export default function SalesCenter() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    apiFetch(`/api/sales/admin?days=${days}`).then(result => { if (active) setData(result); }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [days, revision]);
  const cards = [
    ['Open fitment', number(data?.fitment?.open), 'Requests waiting for review', true],
    ['Paid orders', number(data?.orders?.purchases), 'Confirmed in selected period'],
    ['Order revenue', money(data?.orders?.revenue), 'Confirmed order totals'],
    ['Configure starts', number(eventCount(data, 'configure_started')), 'Unique browser sessions'],
    ['Saved builds', number(leadCount(data, 'build')), 'Private build links created'],
    ['Recovered revenue', money(data?.recovered?.revenue), `${number(data?.recovered?.orders)} orders from saved links`]
  ];
  return <section className="sales-center">
    <header className="dashboard-heading sales-heading"><div><p className="eyebrow">Sales & fitment</p><h1>See what needs attention.</h1><p>Track demand, follow saved builds, and clear fitment requests.</p></div><button className="btn-outline" disabled={loading} onClick={() => setRevision(value => value + 1)}>Refresh data</button></header>
    <div className="sales-topline"><div className="sales-period" aria-label="Sales reporting period">{[7, 30, 90].map(value => <button key={value} type="button" className={days === value ? 'active' : ''} aria-pressed={days === value} onClick={() => setDays(value)}>{value} days</button>)}</div><span>Metrics use the selected period · Fitment queue shows all active requests</span></div>
    {error && <div className="notice notice-error" role="alert">{error} <button className="btn-outline sm" onClick={() => setRevision(value => value + 1)}>Retry</button></div>}
    {loading && !data && <div className="dashboard-empty" role="status">Loading sales activity…</div>}
    {data && <><div className="sales-kpis" aria-busy={loading}>{cards.map(([label, value, hint, priority]) => <article className={priority ? 'sales-kpi priority' : 'sales-kpi'} key={label}><span>{label}</span><strong>{value}</strong><small>{hint}</small></article>)}</div><div className="sales-panels"><ActivityPanel data={data} days={days} /><section className="sales-panel sales-panel-operations"><p className="eyebrow">Operating status</p><h2>Follow-up health</h2><div className="sales-operation-row"><span>Saved-link emails</span><strong className={data.email ? 'is-good' : 'is-muted'}>{data.email ? 'Connected' : 'Not configured'}</strong></div><div className="sales-operation-row"><span>Recovery reminders</span><strong className={data.recovery ? 'is-good' : 'is-muted'}>{data.recovery ? 'Enabled' : 'Paused'}</strong></div><div className="sales-operation-row"><span>Oldest open fitment</span><strong>{data.fitment?.oldest_open ? date(data.fitment.oldest_open) : 'Queue clear'}</strong></div><p>{data.recovery ? 'Opted-in shoppers can receive build reminders.' : 'Recovery reminders need an email sender and business mailing address.'}</p><a href="#fitment-queue" className="sales-panel-link">Review fitment queue ↘</a></section></div></>}
    <FitmentQueue summary={data?.fitment} onUpdated={() => setRevision(value => value + 1)} />
    {data && <section className="sales-recent"><div className="sales-section-title"><div><p className="eyebrow">Recent intent</p><h2>Saved builds & checkouts</h2></div></div><div className="sales-recent-list">{!data.recentSaves?.length && <p>No saved builds or checkouts yet.</p>}{data.recentSaves?.map(lead => <div key={lead.id}><span className="sales-recent-kind">{lead.kind === 'checkout' ? 'Checkout' : 'Build'}</span><strong>{lead.email}</strong><span>{date(lead.created_at)}</span><small>{lead.stage ? `${lead.stage} reminder${lead.stage === 1 ? '' : 's'} sent` : 'No reminders sent'}</small></div>)}</div></section>}
  </section>;
}

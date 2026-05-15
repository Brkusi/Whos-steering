import { useState, useEffect } from 'react';
import { useAuth } from '../context';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  pending: '#888', payment_processing: '#4499FF', paid: '#3DB85A',
  in_build: '#E8B800', quality_check: '#FF9500', shipped: '#00B4D8',
  delivered: '#3DB85A', cancelled: '#CC3300', refunded: '#6A1FA8',
};

const ALL_STATUSES = ['pending','payment_processing','paid','in_build','quality_check','shipped','delivered','cancelled','refunded'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user?.is_admin) { nav('/'); return; }
    loadStats();
    loadOrders();
  }, [user]); // eslint-disable-line

  const loadStats = () => apiFetch('/api/orders/admin/stats').then(setStats).catch(console.error);
  const loadOrders = (status = '') => {
    const q = status ? `?status=${status}` : '';
    apiFetch(`/api/orders${q}`).then(setOrders).catch(console.error);
  };

  const updateStatus = async () => {
    if (!selected || !newStatus) return;
    try {
      await apiFetch(`/api/orders/${selected.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, note }),
      });
      setMsg('Status updated!');
      loadOrders(filter);
      loadStats();
      setTimeout(() => setMsg(''), 3000);
      setSelected(null); setNote('');
    } catch (err) {
      setMsg('Error: ' + err.message);
    }
  };

  return (
    <div style={{ paddingTop: 88, minHeight: '100vh', background: 'var(--d)', padding: '104px 24px 48px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: 'var(--y)', marginBottom: 8 }}>ADMIN</div>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 48, marginBottom: 32 }}>DASHBOARD</div>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, background: 'var(--b)', marginBottom: 32 }}>
            {[
              ['Total Orders', stats.total_orders],
              ['Paid', stats.paid],
              ['In Build', stats.in_build],
              ['Shipped', stats.shipped],
              ['Revenue', `$${parseFloat(stats.total_revenue || 0).toLocaleString()}`],
              ['Last 30d', `$${parseFloat(stats.revenue_30d || 0).toLocaleString()}`],
            ].map(([label, val]) => (
              <div key={label} style={{ background: 'var(--p)', padding: '20px 24px' }}>
                <div style={{ fontSize: 11, color: 'var(--t)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 32, color: 'var(--y)' }}>{val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {['', ...ALL_STATUSES].map(s => (
            <button key={s} className={`ob${filter === s ? ' on' : ''}`} onClick={() => { setFilter(s); loadOrders(s); }}
              style={{ fontSize: 10, padding: '6px 12px' }}>
              {s || 'ALL'}
            </button>
          ))}
        </div>

        {msg && <div style={{ padding: '10px 16px', background: 'rgba(61,184,90,.1)', border: '1px solid #3DB85A', color: '#3DB85A', marginBottom: 16, fontSize: 13 }}>{msg}</div>}

        {/* Orders table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--b)' }}>
                {['Order ID','Customer','Date','Items','Total','Status','Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: 2, color: 'var(--t)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--b)', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--p)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--y)' }}>{o.id.slice(0,8).toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '12px' }}>{o.customer_email || o.guest_email || '—'}</td>
                  <td style={{ padding: '12px', color: 'var(--t)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px', color: 'var(--t)' }}>{o.item_count}</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: 'var(--y)' }}>${parseFloat(o.total).toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', fontSize: 10, letterSpacing: 1, fontWeight: 700, textTransform: 'uppercase', background: `${STATUS_COLORS[o.status]}22`, color: STATUS_COLORS[o.status], border: `1px solid ${STATUS_COLORS[o.status]}66` }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button className="btn-outline sm" onClick={() => { setSelected(o); setNewStatus(o.status); }}>UPDATE</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--t)' }}>No orders found.</div>}
        </div>

        {/* Status update modal */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ background: 'var(--p)', border: '1px solid var(--b)', padding: 32, width: 480, maxWidth: '90vw' }}>
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 28, marginBottom: 20 }}>
                Update Order #{selected.id.slice(0,8).toUpperCase()}
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="fl">New Status</label>
                <select className="fi" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="fl">Note (optional)</label>
                <textarea className="fi" value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="e.g. Shipped via UPS tracking #..." style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn" style={{ clipPath: 'none' }} onClick={updateStatus}>SAVE CHANGES</button>
                <button className="btn-outline sm" onClick={() => setSelected(null)}>CANCEL</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

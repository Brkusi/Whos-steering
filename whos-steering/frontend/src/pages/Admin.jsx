import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { colorName } from '../lib/data';

const STATUS_COLORS = {
  pending: '#888', payment_processing: '#4499FF', paid: '#3DB85A',
  in_build: '#E8B800', quality_check: '#FF9500', shipped: '#00B4D8',
  delivered: '#3DB85A', cancelled: '#CC3300', refunded: '#6A1FA8',
};

const ALL_STATUSES = ['pending','payment_processing','paid','in_build','quality_check','shipped','delivered','cancelled','refunded'];

function ConfigDetail({ config }) {
  if (!config) return <div style={{ color: 'var(--t)', fontSize: 12 }}>No config data</div>;
  const rows = [
    ['Brand',            config.brand],
    ['Vehicle',          [config.vehicle_year, config.brand, config.vehicle_model].filter(Boolean).join(' ')],
    ['Wheel Style',      config.wheel_style],
    ['Paddle Shifters',  config.paddle_shifters],
    ['Top/Bottom Mat',   config.top_bottom_mat],
    ['Top/Bottom Color', colorName(config.top_bottom_col)],
    ['Side Material',    config.side_mat],
    ['Side Color',       colorName(config.side_col)],
    ['Stripe',           config.stripe_mode === 'none' ? 'None' : config.stripe_mode === 'tri' ? `Tri-Color (${config.tri_key})` : colorName(config.stripe_color)],
    ['Airbag Cover',     config.airbag_compat ? '✓ Yes' : '✗ No'],
    ['Full Airbag Upgrade', config.airbag_upgrade ? '✓ Yes' : '✗ No'],
    ['Heated',           config.heated ? '✓ Yes' : '✗ No'],
    ['Lane Assist',      config.lane_assist ? '✓ Yes' : '✗ No'],
    config.audi_badge    ? ['Audi Badge',   config.audi_badge] : null,
    config.outer_trim_col ? ['Outer Trim',  colorName(config.outer_trim_col)] : null,
    config.inner_trim_col ? ['Inner Trim',  colorName(config.inner_trim_col)] : null,
    config.custom_notes  ? ['Notes',        config.custom_notes] : null,
  ].filter(Boolean);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 24px' }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1A1A1A', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--t)', letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0 }}>{label}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--w)', textAlign: 'right' }}>{value || '—'}</span>
        </div>
      ))}
    </div>
  );
}

function OrderModal({ order, onClose, onSave }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [note, setNote] = useState('');
  const [lightbox, setLightbox] = useState(null);
  const [imgError, setImgError] = useState({});

  const items = (order.items || []).filter(Boolean);
  const allConfigs = items.map(i => i.config).filter(Boolean);
  const allPhotos = allConfigs.map(c => c.photo_url).filter(Boolean);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 2000, overflowY: 'auto', padding: '40px 16px' }}>
      <div style={{ background: 'var(--p)', border: '1px solid var(--b)', width: '100%', maxWidth: 900 }}>

        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--b)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 3, color: 'var(--y)' }}>ORDER DETAIL</div>
            <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 28 }}>
              #{order.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--t)', cursor: 'pointer', fontSize: 22 }}>✕</button>
        </div>

        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Customer + shipping */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--t)', marginBottom: 8 }}>Customer</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{order.customer_email || order.guest_email || '—'}</div>
              <div style={{ fontSize: 12, color: 'var(--t)', marginTop: 2 }}>
                {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {order.shipping_address1 && (
              <div>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--t)', marginBottom: 8 }}>Ship To</div>
                <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                  <div>{order.shipping_name}</div>
                  <div>{order.shipping_address1}</div>
                  <div>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</div>
                </div>
              </div>
            )}
          </div>

          {/* Wheel photos */}
          {allPhotos.length > 0 && (
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--t)', marginBottom: 12 }}>
                Customer's Submitted Wheel Photo{allPhotos.length > 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {allPhotos.map((url, i) => (
                  <div key={i} onClick={() => setLightbox(url)}
                    style={{ position: 'relative', cursor: 'zoom-in', border: '1px solid var(--b)', overflow: 'hidden' }}>
                    {!imgError[url] ? (
                      <img src={url} alt={`Wheel ${i + 1}`}
                        onError={() => setImgError(p => ({ ...p, [url]: true }))}
                        style={{ width: 160, height: 160, objectFit: 'cover', display: 'block', transition: 'transform .2s' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                    ) : (
                      <div style={{ width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--m)', color: 'var(--t)', fontSize: 12 }}>
                        Unavailable
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,.6)', padding: '4px 8px', fontSize: 10, color: '#aaa', letterSpacing: 1 }}>
                      ORDER #{order.id.slice(0,8).toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Build specs */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--t)', marginBottom: 12 }}>Build Specifications</div>
            {items.map((item, i) => (
              <div key={i} style={{ background: 'var(--m)', border: '1px solid var(--b)', padding: 20, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontStyle: 'italic', fontSize: 22 }}>{item.item_name}</div>
                    {item.item_detail && <div style={{ fontSize: 12, color: 'var(--t)', marginTop: 2 }}>{item.item_detail}</div>}
                  </div>
                  <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 24, color: 'var(--y)' }}>
                    ${parseFloat(item.unit_price).toFixed(2)}
                  </div>
                </div>
                {item.config && <ConfigDetail config={item.config} />}
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--b)', paddingTop: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--t)' }}>Order Total</div>
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 36, color: 'var(--y)' }}>${parseFloat(order.total).toFixed(2)}</div>
            </div>
          </div>

          {/* Status update */}
          <div style={{ borderTop: '1px solid var(--b)', paddingTop: 20 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--t)', marginBottom: 12 }}>Update Status</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label className="fl">New Status</label>
                <select className="fi" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="fl">Note (optional)</label>
                <input className="fi" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Shipped via UPS #1Z..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn" style={{ clipPath: 'none' }} onClick={() => onSave(order.id, newStatus, note)}>SAVE CHANGES</button>
              <button className="btn-outline sm" onClick={onClose}>CLOSE</button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, cursor: 'zoom-out' }}>
          <img src={lightbox} alt="Wheel" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', boxShadow: '0 0 60px rgba(232,184,0,.2)' }} />
          <div style={{ position: 'absolute', top: 20, right: 24, color: '#fff', fontSize: 28, cursor: 'pointer' }}>✕</div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
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

  const openOrder = async (order) => {
    try {
      const full = await apiFetch(`/api/orders/${order.id}`);
      setSelected(full);
    } catch {
      setSelected(order);
    }
  };

  const updateStatus = async (orderId, status, note) => {
    try {
      await apiFetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      });
      setMsg('Status updated!');
      loadOrders(filter);
      loadStats();
      setSelected(null);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('Error: ' + err.message);
    }
  };

  // Filter by status AND search by order ID
  const filteredOrders = orders.filter(o => {
    const matchStatus = !filter || o.status === filter;
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase().replace(/#/g, ''));
    return matchStatus && matchSearch;
  });

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
              ['Paid',         stats.paid],
              ['In Build',     stats.in_build],
              ['Shipped',      stats.shipped],
              ['Revenue',      `$${parseFloat(stats.total_revenue || 0).toLocaleString()}`],
              ['Last 30d',     `$${parseFloat(stats.revenue_30d || 0).toLocaleString()}`],
            ].map(([label, val]) => (
              <div key={label} style={{ background: 'var(--p)', padding: '20px 24px' }}>
                <div style={{ fontSize: 11, color: 'var(--t)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 32, color: 'var(--y)' }}>{val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search + Filter bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search box */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <input
              className="fi"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search order #..."
              style={{ width: 220, paddingLeft: 32 }}
            />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t)', fontSize: 13 }}>🔍</span>
          </div>

          {/* Status filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['', ...ALL_STATUSES].map(s => (
              <button key={s} className={`ob${filter === s ? ' on' : ''}`}
                onClick={() => { setFilter(s); loadOrders(s); }}
                style={{ fontSize: 10, padding: '6px 12px' }}>
                {s ? s.replace(/_/g, ' ') : 'ALL'}
              </button>
            ))}
          </div>
        </div>

        {msg && (
          <div style={{ padding: '10px 16px', background: 'rgba(61,184,90,.1)', border: '1px solid #3DB85A', color: '#3DB85A', marginBottom: 16, fontSize: 13 }}>{msg}</div>
        )}

        {/* Orders table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--b)' }}>
                {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Photo', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: 2, color: 'var(--t)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--b)', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--p)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--y)' }}>{o.id.slice(0, 8).toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '12px' }}>{o.customer_email || o.guest_email || '—'}</td>
                  <td style={{ padding: '12px', color: 'var(--t)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px', color: 'var(--t)' }}>{o.item_count}</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: 'var(--y)' }}>${parseFloat(o.total).toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', fontSize: 10, letterSpacing: 1, fontWeight: 700, textTransform: 'uppercase', background: `${STATUS_COLORS[o.status]}22`, color: STATUS_COLORS[o.status], border: `1px solid ${STATUS_COLORS[o.status]}66` }}>
                      {o.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  {/* Photo thumbnail in table */}
                  <td style={{ padding: '8px 12px' }}>
                    <PhotoThumb orderId={o.id} />
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button className="btn-outline sm" onClick={() => openOrder(o)}>VIEW & UPDATE</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--t)' }}>
              {search ? `No orders matching "${search}"` : 'No orders found.'}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <OrderModal order={selected} onClose={() => setSelected(null)} onSave={updateStatus} />
      )}
    </div>
  );
}

// Small photo thumbnail that fetches the first photo for an order
function PhotoThumb({ orderId }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    apiFetch(`/api/orders/${orderId}`)
      .then(order => {
        const items = (order.items || []).filter(Boolean);
        const photo = items.map(i => i.config?.photo_url).find(Boolean);
        if (photo) setUrl(photo);
      })
      .catch(() => {});
  }, [orderId]);

  if (!url) return <span style={{ color: 'var(--t)', fontSize: 10 }}>—</span>;

  return (
    <img src={url} alt="wheel"
      style={{ width: 44, height: 44, objectFit: 'cover', border: '1px solid var(--b)', cursor: 'pointer' }}
      onError={e => e.target.style.display = 'none'} />
  );
}
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context';
import { apiFetch } from '../lib/api';

const STATUS_COLORS = {
  pending: '#888', payment_processing: '#4499FF', paid: '#3DB85A',
  in_build: '#E8B800', quality_check: '#FF9500', shipped: '#00B4D8',
  delivered: '#3DB85A', cancelled: '#CC3300', refunded: '#6A1FA8',
};

export default function Account() {
  const { user, logout, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) nav('/login');
  }, [user, authLoading, nav]);

  useEffect(() => {
    if (user) {
      apiFetch('/api/orders/my')
        .then(setOrders)
        .catch(console.error)
        .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  if (authLoading) return (
    <div style={{ paddingTop: 88, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--y)', fontFamily: 'Orbitron, monospace', letterSpacing: 4 }}>LOADING...</div>
  );
  if (!user) return null;

  return (
    <div style={{ paddingTop: 88, minHeight: '100vh', background: 'var(--d)' }}>
      {/* Header */}
      <div style={{ padding: '50px 40px 32px', borderBottom: '1px solid var(--b)', background: 'linear-gradient(180deg, rgba(232,184,0,.04) 0%, transparent 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: 'var(--y)', marginBottom: 8 }}>Welcome Back</div>
          <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 48 }}>
            {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.email}
          </div>
          <div style={{ fontSize: 12, color: 'var(--t)', marginTop: 4 }}>{user.email}</div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {user.is_admin && (
            <Link to="/admin"><button className="btn btn-sm" style={{ clipPath: 'none' }}>ADMIN DASHBOARD</button></Link>
          )}
          <button className="btn-outline sm" onClick={() => { logout(); nav('/'); }}>SIGN OUT</button>
        </div>
      </div>

      {/* Orders */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 32, marginBottom: 24 }}>MY ORDERS</div>

        {ordersLoading ? (
          <div style={{ color: 'var(--t)', fontFamily: 'Orbitron, monospace', letterSpacing: 3, fontSize: 11 }}>LOADING ORDERS...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 48, opacity: .2, marginBottom: 16 }}>🛞</div>
            <div style={{ color: 'var(--t)', letterSpacing: 2, textTransform: 'uppercase', fontSize: 13, marginBottom: 20 }}>No orders yet</div>
            <Link to="/configure"><button className="btn" style={{ clipPath: 'none' }}>BUILD YOUR FIRST WHEEL</button></Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--b)' }}>
            {orders.map(order => (
              <div key={order.id} style={{ background: 'var(--p)' }}>
                {/* Order row */}
                <div onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  style={{ padding: '20px 24px', display: 'flex', gap: 20, alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#242424'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--y)', letterSpacing: 2 }}>#{order.id.slice(0, 8).toUpperCase()}</div>
                    <div style={{ fontSize: 12, color: 'var(--t)', marginTop: 2 }}>{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div>
                    <span style={{ display: 'inline-block', padding: '4px 12px', fontSize: 10, letterSpacing: 1, fontWeight: 700, textTransform: 'uppercase', background: `${STATUS_COLORS[order.status]}22`, color: STATUS_COLORS[order.status], border: `1px solid ${STATUS_COLORS[order.status]}66` }}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 24, color: 'var(--y)', minWidth: 90, textAlign: 'right' }}>
                    ${parseFloat(order.total).toFixed(2)}
                  </div>
                  <div style={{ color: 'var(--t)', fontSize: 18 }}>{expanded === order.id ? '▲' : '▼'}</div>
                </div>

                {/* Expanded detail */}
                {expanded === order.id && (
                  <div style={{ padding: '0 24px 20px', borderTop: '1px solid var(--b)' }}>
                    {(order.items || []).filter(Boolean).map((item, i) => (
                      <div key={i} style={{ padding: '14px 0', borderBottom: '1px solid #1A1A1A' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontStyle: 'italic', fontSize: 18 }}>{item.item_name}</div>
                            <div style={{ fontSize: 11, color: 'var(--t)', marginTop: 2 }}>{item.item_detail}</div>
                            {item.config && (
                              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {[
                                  item.config.brand,
                                  item.config.vehicle_year && `${item.config.vehicle_year} ${item.config.vehicle_model}`,
                                  item.config.wheel_style,
                                  item.config.top_bottom_mat,
                                ].filter(Boolean).map(tag => (
                                  <span key={tag} style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(232,184,0,.08)', border: '1px solid rgba(232,184,0,.2)', color: 'var(--y)', letterSpacing: 1 }}>{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 20, color: 'var(--y)', whiteSpace: 'nowrap', marginLeft: 16 }}>
                            ${parseFloat(item.unit_price).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Status history */}
                    {order.status_history && order.status_history.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--t)', marginBottom: 10 }}>Order Timeline</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {order.status_history.filter(Boolean).map((h, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 12 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[h.to_status] || '#888', marginTop: 3, flexShrink: 0 }} />
                              <div>
                                <span style={{ color: STATUS_COLORS[h.to_status] || '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{h.to_status?.replace('_', ' ')}</span>
                                {h.note && <span style={{ color: 'var(--t)', marginLeft: 8 }}>— {h.note}</span>}
                                <div style={{ color: '#555', fontSize: 10, marginTop: 1 }}>{new Date(h.created_at).toLocaleString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {order.shipping_address1 && (
                      <div style={{ marginTop: 16, fontSize: 12, color: 'var(--t)', borderTop: '1px solid var(--b)', paddingTop: 12 }}>
                        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4, color: '#555' }}>Shipping To</div>
                        <div>{order.shipping_name}</div>
                        <div>{order.shipping_address1}</div>
                        <div>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

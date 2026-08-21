import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context';
import { apiFetch } from '../lib/api';
import { colorName } from '../lib/data';

const STATUS_COLORS = {
  pending: '#888', payment_processing: '#4499FF', paid: '#3DB85A',
  in_build: '#E8B800', quality_check: '#FF9500', shipped: '#00B4D8',
  delivered: '#3DB85A', cancelled: '#CC3300', refunded: '#6A1FA8',
};

const STATUS_LABEL = {
  pending: 'Order Received',
  payment_processing: 'Processing Payment',
  paid: 'Payment Confirmed',
  in_build: 'Being Built',
  quality_check: 'Quality Check',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled / Refund Started',
  refunded: 'Refunded',
};

function ConfigDetail({ config }) {
  if (!config) return null;
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
    ['Airbag Compat',    config.airbag_compat ? '✓ Yes' : '✗ No'],
    ['Heated',           config.heated ? '✓ Yes' : '✗ No'],
    ['Lane Assist',      config.lane_assist ? '✓ Yes' : '✗ No'],
    config.audi_badge      ? ['Audi Badge',  config.audi_badge] : null,
    config.outer_trim_col  ? ['Outer Trim',  colorName(config.outer_trim_col)] : null,
    config.inner_trim_col  ? ['Inner Trim',  colorName(config.inner_trim_col)] : null,
  ].filter(Boolean);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 20px', marginTop: 12 }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #1A1A1A', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--t)', letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0 }}>{label}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--w)', textAlign: 'right' }}>{value || '—'}</span>
        </div>
      ))}
    </div>
  );
}

export default function Account() {
  const { user, logout, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [cancelingOrder, setCancelingOrder] = useState(null);
  const [cancelMessage, setCancelMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !user) nav('/login');
  }, [user, authLoading, nav]);

  const loadOrders = async () => {
    if (!user) return;
    try {
      const result = await apiFetch('/api/orders/my');
      setOrders(result);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]); // eslint-disable-line

  const cancelOrder = async (order) => {
    const confirmed = window.confirm(
      `Cancel order #${order.id.slice(0, 8).toUpperCase()}?\n\n` +
      'A refund will be initiated to the original payment method. ' +
      'This action is only available before order processing begins.'
    );

    if (!confirmed) return;

    setCancelingOrder(order.id);
    setCancelMessage('');

    try {
      const result = await apiFetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      setCancelMessage(
        result.message ||
        'Order canceled. Your refund has been initiated.'
      );

      await loadOrders();
    } catch (err) {
      setCancelMessage(err.message || 'Unable to cancel this order.');
    } finally {
      setCancelingOrder(null);
    }
  };

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
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 32, marginBottom: 24 }}>MY ORDERS</div>

        {cancelMessage && (
          <div style={{
            padding: '11px 14px',
            marginBottom: 16,
            border: `1px solid ${cancelMessage.toLowerCase().includes('unable') || cancelMessage.toLowerCase().includes('cannot') ? '#CC3300' : '#3DB85A'}`,
            background: cancelMessage.toLowerCase().includes('unable') || cancelMessage.toLowerCase().includes('cannot')
              ? 'rgba(204,51,0,.08)'
              : 'rgba(61,184,90,.08)',
            color: cancelMessage.toLowerCase().includes('unable') || cancelMessage.toLowerCase().includes('cannot')
              ? '#FF6650'
              : '#5DCC73',
            fontSize: 12,
          }}>
            {cancelMessage}
          </div>
        )}

        {ordersLoading ? (
          <div style={{ color: 'var(--t)', fontFamily: 'Orbitron, monospace', letterSpacing: 3, fontSize: 11 }}>LOADING ORDERS...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 48, opacity: .2, marginBottom: 16 }}>🛞</div>
            <div style={{ color: 'var(--t)', letterSpacing: 2, textTransform: 'uppercase', fontSize: 13, marginBottom: 20 }}>No orders yet</div>
            <Link to="/build"><button className="btn" style={{ clipPath: 'none' }}>BUILD YOUR FIRST WHEEL</button></Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--b)' }}>
            {orders.map(order => {
              const items = (order.items || []).filter(Boolean);
              const photos = items.map(i => i.config?.photo_url).filter(Boolean);
              const isOpen = expanded === order.id;

              return (
                <div key={order.id} style={{ background: 'var(--p)' }}>
                  {/* Order header row */}
                  <div onClick={() => setExpanded(isOpen ? null : order.id)}
                    style={{ padding: '20px 24px', display: 'flex', gap: 20, alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#242424'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--y)', letterSpacing: 2 }}>#{order.id.slice(0, 8).toUpperCase()}</div>
                      <div style={{ fontSize: 12, color: 'var(--t)', marginTop: 2 }}>{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                    <span style={{ display: 'inline-block', padding: '4px 12px', fontSize: 10, letterSpacing: 1, fontWeight: 700, textTransform: 'uppercase', background: `${STATUS_COLORS[order.status]}22`, color: STATUS_COLORS[order.status], border: `1px solid ${STATUS_COLORS[order.status]}66` }}>
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                    <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 24, color: 'var(--y)', minWidth: 90, textAlign: 'right' }}>
                      ${parseFloat(order.total).toFixed(2)}
                    </div>
                    <div style={{ color: 'var(--t)', fontSize: 18 }}>{isOpen ? '▲' : '▼'}</div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--b)' }}>

                      {/* Wheel photos */}
                      {photos.length > 0 && (
                        <div style={{ marginTop: 20, marginBottom: 20 }}>
                          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--t)', marginBottom: 10 }}>
                            Your Submitted Wheel Photo{photos.length > 1 ? 's' : ''}
                          </div>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {photos.map((url, i) => (
                              <img key={i} src={url} alt={`Your wheel ${i + 1}`}
                                onClick={() => setLightbox(url)}
                                style={{ width: 140, height: 140, objectFit: 'cover', border: '1px solid var(--b)', cursor: 'zoom-in', transition: 'transform .2s' }}
                                onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                onError={e => e.target.style.display = 'none'} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Build specs per item */}
                      {items.map((item, i) => (
                        <div key={i} style={{ background: 'var(--m)', border: '1px solid var(--b)', padding: '16px 20px', marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontStyle: 'italic', fontSize: 20 }}>{item.item_name}</div>
                            <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 22, color: 'var(--y)' }}>${parseFloat(item.unit_price).toFixed(2)}</div>
                          </div>
                          {item.config && <ConfigDetail config={item.config} />}
                        </div>
                      ))}

                      {/* Status timeline */}
                      {order.status_history && order.status_history.filter(Boolean).length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--t)', marginBottom: 10 }}>Order Timeline</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {order.status_history.filter(Boolean).map((h, i) => (
                              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 12 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[h.to_status] || '#888', marginTop: 4, flexShrink: 0 }} />
                                <div>
                                  <span style={{ color: STATUS_COLORS[h.to_status] || '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {STATUS_LABEL[h.to_status] || h.to_status}
                                  </span>
                                  {h.note && <span style={{ color: 'var(--t)', marginLeft: 8 }}>— {h.note}</span>}
                                  <div style={{ color: '#555', fontSize: 10, marginTop: 1 }}>{new Date(h.created_at).toLocaleString()}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Shipping */}
                      {order.shipping_address1 && (
                        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--t)', borderTop: '1px solid var(--b)', paddingTop: 12 }}>
                          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4, color: '#555' }}>Shipping To</div>
                          <div>{order.shipping_name}</div>
                          <div>{order.shipping_address1}</div>
                          <div>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</div>
                        </div>
                      )}

                      {/* Customer cancellation control */}
                      <div style={{ marginTop: 18, borderTop: '1px solid var(--b)', paddingTop: 16 }}>
                        {order.status === 'paid' ? (
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ maxWidth: 560, color: 'var(--t)', fontSize: 11, lineHeight: 1.6 }}>
                              Need to cancel? You can cancel now because processing has not started.
                              A refund will be initiated to your original payment method.
                            </div>
                            <button
                              type="button"
                              className="btn-outline sm"
                              disabled={cancelingOrder === order.id}
                              onClick={() => cancelOrder(order)}
                              style={{
                                borderColor: '#CC3300',
                                color: '#FF6650',
                                opacity: cancelingOrder === order.id ? .55 : 1,
                              }}
                            >
                              {cancelingOrder === order.id ? 'CANCELING...' : 'CANCEL ORDER'}
                            </button>
                          </div>
                        ) : ['in_build', 'quality_check', 'shipped', 'delivered'].includes(order.status) ? (
                          <div style={{ color: '#E8B800', fontSize: 11, lineHeight: 1.6, letterSpacing: .4 }}>
                            CANCELLATION CLOSED — order processing has started.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, cursor: 'zoom-out' }}>
          <img src={lightbox} alt="Wheel" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }} />
          <div style={{ position: 'absolute', top: 20, right: 24, color: '#fff', fontSize: 28, cursor: 'pointer' }}>✕</div>
        </div>
      )}
    </div>
  );
}

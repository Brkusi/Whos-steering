import { useState, useEffect, useRef } from 'react';
import PaymentCenter from '../components/PaymentCenter';
import { useDialog } from '../components/Experience';
import { useAuth } from '../context';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { colorName, STRIPE_CONCEPTS, STITCH_COLORS, CLASSIC_CARBON_COLORS, FORGED_CARBON_COLORS, HONEYCOMB_CARBON_COLORS } from '../lib/data';
import './Admin.css';
const STATUS_COLORS = {
  pending: '#888',
  payment_processing: '#4499FF',
  paid: '#3DB85A',
  in_build: '#E8B800',
  quality_check: '#FF9500',
  shipped: '#00B4D8',
  delivered: '#3DB85A',
  cancelled: '#CC3300',
  refunded: '#6A1FA8'
};
const ALL_STATUSES = ['pending', 'payment_processing', 'paid', 'in_build', 'quality_check', 'shipped', 'delivered', 'cancelled', 'refunded'];
function adminText(value) {
  return typeof value === 'string' ? value.trim() : '';
}
function adminStitchColor(hex) {
  if (!hex) return '—';
  return STITCH_COLORS.find(c => c.h === hex)?.n || colorName(hex) || hex;
}
function adminCarbonColor(material, hex) {
  if (!hex) return '—';
  const list = material === 'Classic Carbon' ? CLASSIC_CARBON_COLORS : material === 'Forged Carbon' ? FORGED_CARBON_COLORS : HONEYCOMB_CARBON_COLORS;
  return list.find(c => c.h === hex)?.n || hex;
}
function adminMaterialColor(material, regularColor, carbonColor, customColor) {
  const custom = adminText(customColor);
  if (custom) return custom;
  if (material && material.toLowerCase().includes('carbon')) {
    return adminCarbonColor(material, carbonColor);
  }
  return regularColor ? colorName(regularColor) : '—';
}
function adminColor(regularColor, customColor, stitch = false) {
  const custom = adminText(customColor);
  if (custom) return custom;
  if (!regularColor) return '—';
  return stitch ? adminStitchColor(regularColor) : colorName(regularColor);
}
function ConfigDetail({
  config,
  itemName
}) {
  if (!config) {
    return <div style={{
      color: 'var(--t)',
      fontSize: 14,
      padding: '8px 0'
    }}>
        No configuration data saved.
      </div>;
  }
  const snapshot = config.config_json && typeof config.config_json === 'object' && Object.keys(config.config_json).length ? config.config_json : null;
  const isPreset = snapshot?.isPreset || !config.vehicle_year || config.vehicle_year === '';
  let rows;
  if (snapshot && isPreset) {
    rows = [['Type', 'Preset Build'], ['Preset Name', snapshot.presetName || itemName || '—'], ['Brand', snapshot.brand || config.brand || '—'], snapshot.audiBadge ? ['Badge', snapshot.audiBadge] : null, snapshot.bmwBadge ? ['Badge', snapshot.bmwBadge] : null, snapshot.m1m2Buttons !== undefined ? ['M1 / M2 Buttons', snapshot.m1m2Buttons ? '✓ Yes' : '✗ No'] : null, ['Airbag Cover', snapshot.airbagCompat ? '✓ Yes' : '✗ No'], snapshot.airbagCompat ? ['Full Upgraded Airbag Unit', snapshot.airbagUpgrade ? '✓ Yes' : '✗ No'] : null, ['Heated Steering', snapshot.heated ? '✓ Yes' : '✗ No'], ['Lane / Driver Assistance', snapshot.laneAssist ? '✓ Yes' : '✗ No'], ['Notes', adminText(snapshot.customNotes) || 'None']].filter(Boolean);
  } else if (snapshot) {
    const stripe = STRIPE_CONCEPTS.find(s => s.id === snapshot.stripeConceptId);
    const isAudi = snapshot.brand === 'AUDI';
    rows = [['Brand', snapshot.brand || config.brand], ['Vehicle Year', snapshot.vehicleYear || config.vehicle_year || '—'], ['Vehicle Model', snapshot.vehicleModel || config.vehicle_model || '—'], ['Wheel Style Type', snapshot.wheelStyleType || '—'], isAudi && snapshot.wheelStyleType === 'R8' ? ['Start / Stop & Drive Select Buttons', snapshot.startStopButtons ? '✓ Yes' : '✗ No'] : null, [isAudi ? 'LED Display Strip' : 'RPM Gauge', snapshot.ledDisplay ? '✓ Yes' : '✗ No'], ['Top Stripe', stripe?.label || snapshot.stripeConceptId || '—'], adminText(snapshot.stripeCustomColor) ? ['Custom Stripe Color', adminText(snapshot.stripeCustomColor)] : null, ['Stitch Color', adminColor(snapshot.stitchColor, snapshot.stitchCustomColor, true)], !(isAudi && snapshot.wheelStyleType === 'R8') && !(snapshot.brand === 'BMW' && snapshot.wheelStyleType === 'F-Series') ? ['Wheel Style', snapshot.wheelStyle || '—'] : null, ['Paddle Shifters', snapshot.paddleShifters || '—'], snapshot.paddleShifters === 'Magnetic' ? ['Paddle Length', snapshot.paddleLength || 'Short'] : null, ['Top & Bottom Grip Material', snapshot.topBottomMat || '—'], ['Top & Bottom Color', adminMaterialColor(snapshot.topBottomMat, snapshot.topBottomCol, snapshot.topBottomCarbonCol, snapshot.topBottomCustomColor)], ['Side Grip Material', snapshot.sideMat || '—'], ['Side Grip Color', adminMaterialColor(snapshot.sideMat, snapshot.sideCol, snapshot.sideCarbonCol, snapshot.sideCustomColor)], isAudi ? ['Lower Badge', snapshot.audiBadge || '—'] : null, isAudi ? ['Plastic Trim Color', adminColor(snapshot.plasticTrimCol, snapshot.plasticTrimCustomColor)] : null, isAudi ? ['Inner Trim Color', snapshot.innerTrimMatchCarbon ? 'Match Carbon Fiber Top & Bottom' : adminColor(snapshot.innerTrimCol, snapshot.innerTrimCustomColor)] : null, ['Airbag Cover', snapshot.airbagCompat ? '✓ Yes' : '✗ No'], snapshot.airbagCompat ? ['Full Upgraded Airbag Unit', snapshot.airbagUpgrade ? '✓ Yes' : '✗ No'] : null, snapshot.airbagCompat ? ['Airbag Material', snapshot.airbagMat || '—'] : null, snapshot.airbagCompat ? ['Airbag Color', adminColor(snapshot.airbagCol, snapshot.airbagCustomColor)] : null, snapshot.airbagCompat ? ['Airbag Stitch Color', adminColor(snapshot.airbagStitchColor, snapshot.airbagStitchCustomColor, true)] : null, isAudi && snapshot.airbagCompat ? ['Audi Logo Color', adminColor(snapshot.audiLogoCol, snapshot.audiLogoCustomColor)] : null, ['Heated Steering', snapshot.heated ? '✓ Yes' : '✗ No'], [snapshot.brand === 'BMW' ? 'Driver Assistance Retained' : 'Lane Assist Compatible', snapshot.laneAssist ? '✓ Yes' : '✗ No'], ['Wheel Photo', snapshot.photoUrl || config.photo_url ? '✓ Attached' : '✗ Missing'], ['Notes', adminText(snapshot.customNotes) || 'None']].filter(Boolean);
  } else {
    // Legacy orders created before config_json was added.
    rows = [['Brand', config.brand], ['Vehicle', [config.vehicle_year, config.brand, config.vehicle_model].filter(Boolean).join(' ') || '—'], ['Wheel Style', config.wheel_style], ['Paddle Shifters', config.paddle_shifters], ['Top/Bottom Mat', config.top_bottom_mat], ['Top/Bottom Color', config.top_bottom_col || '—'], ['Side Material', config.side_mat], ['Side Color', config.side_col || '—'], ['Stripe', config.stripe_mode || '—'], ['Airbag Cover', config.airbag_compat ? '✓ Yes' : '✗ No'], ['Heated', config.heated ? '✓ Yes' : '✗ No'], ['Lane Assist', config.lane_assist ? '✓ Yes' : '✗ No'], config.audi_badge ? ['Audi Badge', config.audi_badge] : null, config.outer_trim_col ? ['Outer Trim', config.outer_trim_col] : null, config.inner_trim_col ? ['Inner Trim', config.inner_trim_col] : null].filter(Boolean);
  }
  return <div className="admin-config-grid" style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2px 24px'
  }}>
      {rows.map(([label, value], index) => <div key={`${label}-${index}`} style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '6px 0',
      borderBottom: '1px solid #1A1A1A',
      gap: 8
    }}>
          <span style={{
        fontSize: 14,
        color: 'var(--t)',
        letterSpacing: 1,
        textTransform: 'uppercase',
        flexShrink: 0
      }}>
            {label}
          </span>
          <span style={{
        fontSize: 14,
        fontWeight: 700,
        color: 'var(--w)',
        textAlign: 'right',
        overflowWrap: 'anywhere'
      }}>
            {value ?? '—'}
          </span>
        </div>)}
    </div>;
}
function OrderModal({
  order,
  onClose,
  onSave
}) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [note, setNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [trackingCarrier, setTrackingCarrier] = useState(order.tracking_carrier || '');
  const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || '');
  const [lightbox, setLightbox] = useState(null);
  const [imgError, setImgError] = useState({});
  const modalRef = useRef(null);
  useDialog(modalRef, true, () => lightbox ? setLightbox(null) : onClose());
  const items = (order.items || []).filter(Boolean);
  const allConfigs = items.map(i => i.config).filter(Boolean);
  const allPhotos = allConfigs.map(c => c.photo_url).filter(Boolean);
  return <div className="admin-modal-overlay" style={{
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.88)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 2000,
    overflowY: 'auto',
    padding: '40px 16px'
  }}>
      <div ref={modalRef} role="dialog" aria-modal="true" aria-label="Order details" tabIndex={-1} className="admin-modal" style={{
      background: 'var(--p)',
      border: '1px solid var(--b)',
      width: '100%',
      maxWidth: 900
    }}>

        {/* Header */}
        <div className="admin-modal-header" style={{
        padding: '20px 28px',
        borderBottom: '1px solid var(--b)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
          <div>
            <div style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: 14,
            letterSpacing: .6,
            color: 'var(--y)'
          }}>ORDER DETAIL</div>
            <div style={{
            fontFamily: '"Barlow Condensed", sans-serif',
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: 28
          }}>
              #{order.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
          <button onClick={onClose} style={{
          background: 'none',
          border: 'none',
          color: 'var(--t)',
          cursor: 'pointer',
          fontSize: 22
        }}>✕</button>
        </div>

        <div className="admin-modal-body" style={{
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }}>

          {/* Customer + shipping */}
          <div className="admin-modal-summary-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24
        }}>
            <div>
              <div style={{
              fontSize: 14,
              letterSpacing: .6,
              textTransform: 'uppercase',
              color: 'var(--t)',
              marginBottom: 8
            }}>Customer</div>
              <div style={{
              fontSize: 14,
              fontWeight: 700
            }}>{order.customer_email || order.guest_email || '—'}</div>
              <div style={{
              fontSize: 14,
              color: 'var(--t)',
              marginTop: 2
            }}>
                {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
              </div>
            </div>
            {order.shipping_address1 && <div>
                <div style={{
              fontSize: 14,
              letterSpacing: .6,
              textTransform: 'uppercase',
              color: 'var(--t)',
              marginBottom: 8
            }}>Ship To</div>
                <div style={{
              fontSize: 14,
              lineHeight: 1.7
            }}>
                  <div>{order.shipping_name}</div>
                  <div>{order.shipping_address1}</div>
                  <div>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</div>
                </div>
              </div>}
          </div>

          {/* Wheel photos */}
          {allPhotos.length > 0 && <div>
              <div style={{
            fontSize: 14,
            letterSpacing: .6,
            textTransform: 'uppercase',
            color: 'var(--t)',
            marginBottom: 12
          }}>
                Customer's Submitted Wheel Photo{allPhotos.length > 1 ? 's' : ''}
              </div>
              <div style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap'
          }}>
                {allPhotos.map((url, i) => <div key={i} onClick={() => setLightbox(url)} style={{
              position: 'relative',
              cursor: 'zoom-in',
              border: '1px solid var(--b)',
              overflow: 'hidden'
            }}>
                    {!imgError[url] ? <img src={url} alt={`Wheel ${i + 1}`} onError={() => setImgError(p => ({
                ...p,
                [url]: true
              }))} className="admin-order-photo" style={{
                width: 160,
                height: 160,
                objectFit: 'cover',
                display: 'block',
                transition: 'transform .2s'
              }} onMouseEnter={e => e.target.style.transform = 'scale(1.04)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'} /> : <div className="admin-order-photo admin-order-photo--fallback" style={{
                width: 160,
                height: 160,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--m)',
                color: 'var(--t)',
                fontSize: 14
              }}>
                        Unavailable
                      </div>}
                    <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0,0,0,.6)',
                padding: '4px 8px',
                fontSize: 14,
                color: '#aaa',
                letterSpacing: 1
              }}>
                      ORDER #{order.id.slice(0, 8).toUpperCase()}
                    </div>
                  </div>)}
              </div>
            </div>}

          {/* Build specs */}
          <div>
            <div style={{
            fontSize: 14,
            letterSpacing: .6,
            textTransform: 'uppercase',
            color: 'var(--t)',
            marginBottom: 12
          }}>Build Specifications</div>
            {items.map((item, i) => <div key={i} style={{
            background: 'var(--m)',
            border: '1px solid var(--b)',
            padding: 20,
            marginBottom: 12
          }}>
                <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: 8
            }}>
                  <div>
                    <div style={{
                  fontFamily: '"Barlow Condensed", sans-serif',
                  fontWeight: 800,
                  fontStyle: 'italic',
                  fontSize: 22
                }}>{item.item_name}</div>
                    {item.item_detail && <div style={{
                  fontSize: 14,
                  color: 'var(--t)',
                  marginTop: 2
                }}>{item.item_detail}</div>}
                  </div>
                  <div style={{
                fontFamily: '"Barlow Condensed", sans-serif',
                fontWeight: 900,
                fontSize: 24,
                color: 'var(--y)'
              }}>
                    ${parseFloat(item.unit_price).toFixed(2)}
                  </div>
                </div>
                {item.config && <ConfigDetail config={item.config} itemName={item.item_name} />}
              </div>)}
          </div>

          {/* Total */}
          <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          borderTop: '1px solid var(--b)',
          paddingTop: 16
        }}>
            <div style={{
            textAlign: 'right'
          }}>
              <div style={{
              fontSize: 14,
              letterSpacing: .6,
              textTransform: 'uppercase',
              color: 'var(--t)'
            }}>Order Total</div>
              <div style={{
              fontFamily: '"Barlow Condensed", sans-serif',
              fontWeight: 900,
              fontSize: 36,
              color: 'var(--y)'
            }}>${parseFloat(order.total).toFixed(2)}</div>
            </div>
          </div>

          {/* Status update */}
          <div style={{
          borderTop: '1px solid var(--b)',
          paddingTop: 20
        }}>
            <div style={{
            fontSize: 14,
            letterSpacing: .6,
            textTransform: 'uppercase',
            color: 'var(--t)',
            marginBottom: 12
          }}>Update Status</div>
            <div className="admin-status-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 12
          }}>
              <div>
                <label className="fl">New Status</label>
                <select className="fi" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {ALL_STATUSES.filter(s => s !== 'refunded' || order.status === 'refunded').map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="fl">Note (optional)</label>
                <input className="fi" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Tracking: 1Z... or production note" />
              </div>
            </div>

            <div style={{
            padding: 14,
            marginBottom: 12,
            background: 'rgba(232,184,0,.04)',
            border: '1px solid rgba(232,184,0,.22)'
          }}>
              <div style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: 14,
              letterSpacing: .6,
              color: 'var(--y)',
              marginBottom: 10
            }}>
                CUSTOMER SHIPPING TRACKING
              </div>
              <div className="admin-tracking-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr .8fr',
              gap: 10,
              marginBottom: 10
            }}>
                <div>
                  <label className="fl">Tracking Number</label>
                  <input className="fi" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="1Z..., FedEx, USPS, etc." />
                </div>
                <div>
                  <label className="fl">Carrier</label>
                  <input className="fi" value={trackingCarrier} onChange={e => setTrackingCarrier(e.target.value)} placeholder="UPS / FedEx / USPS" />
                </div>
              </div>
              <div>
                <label className="fl">Tracking URL (optional)</label>
                <input className="fi" value={trackingUrl} onChange={e => setTrackingUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div style={{
              marginTop: 8,
              color: '#666',
              fontSize: 14,
              lineHeight: 1.55
            }}>
                This tracking number is customer-visible on Track Order. If you paste only a tracking number into the Note field instead, the backend will recognize and save it too.
              </div>
            </div>

            <div className="admin-modal-actions" style={{
            display: 'flex',
            gap: 12
          }}>
              <button className="btn" style={{
              clipPath: 'none'
            }} onClick={() => onSave(order.id, newStatus, note, {
              number: trackingNumber.trim(),
              carrier: trackingCarrier.trim(),
              url: trackingUrl.trim()
            })}>SAVE CHANGES</button>
              <button className="btn-outline sm" onClick={onClose}>CLOSE</button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && <div onClick={() => setLightbox(null)} style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      cursor: 'zoom-out'
    }}>
          <img src={lightbox} alt="Wheel" style={{
        maxWidth: '90vw',
        maxHeight: '90vh',
        objectFit: 'contain',
        boxShadow: '0 0 60px rgba(232,184,0,.2)'
      }} />
          <div style={{
        position: 'absolute',
        top: 20,
        right: 24,
        color: '#fff',
        fontSize: 28,
        cursor: 'pointer'
      }}>✕</div>
        </div>}
    </div>;
}
export default function AdminDashboard() {
  const {
    user,
    loading: authLoading
  } = useAuth();
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [section, setSection] = useState('overview');
  const isAdmin = user?.is_admin || user?.isAdmin;
  useEffect(() => {
    if (!authLoading && !isAdmin) nav('/login');
  }, [authLoading, isAdmin, nav]);
  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([apiFetch('/api/orders/admin/stats'), apiFetch(`/api/orders?page=${page}&limit=50&status=${encodeURIComponent(filter)}&search=${encodeURIComponent(search)}`)]).then(([stats, orders]) => {
      if (active) {
        setStats(stats);
        setOrders(orders);
      }
    }).catch(e => {
      if (active) setError(e.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [isAdmin, page, filter, search, revision]);
  const openOrder = async order => {
    setError('');
    try {
      setSelected(await apiFetch(`/api/orders/${order.id}`));
    } catch (e) {
      setError(e.message);
    }
  };
  const updateStatus = async (id, status, note, tracking) => {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      await apiFetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          note,
          tracking
        })
      });
      setSelected(null);
      setMsg('Order updated.');
      setRevision(r => r + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };
  if (authLoading || !isAdmin) return <div className="empty-state" role="status">Checking admin access…</div>;
  return <div className="dashboard-layout"><aside className="dashboard-sidebar"><p className="eyebrow">Workspace</p><nav aria-label="Admin navigation">{[['overview', '◫', 'Overview'], ['orders', '▤', 'Orders'], ['payments', '↗', 'Payments & refunds']].map(([id, icon, label]) => <button key={id} className={section === id ? 'active' : ''} aria-current={section === id ? 'page' : undefined} onClick={() => setSection(id)}><span aria-hidden="true">{icon}</span>{label}</button>)}</nav><div className="dashboard-sidebar-bottom"><span>Who's Steering</span><small>Admin workspace</small><button onClick={() => nav('/')}>View storefront ↗</button></div></aside><main className="dashboard-main">
    {section === 'payments' ? <PaymentCenter /> : <><div className="dashboard-heading"><div><p className="eyebrow">Who's Steering / Admin</p><h1>{section === 'overview' ? 'Your workshop, at a glance.' : 'Order management'}</h1><p>Follow every build from checkout to delivery.</p></div><button className="btn-outline" disabled={loading} onClick={() => setRevision(r => r + 1)}>Refresh</button></div>
    {section === 'overview' && stats && <div className="dashboard-stats">{[['Total orders', stats.total_orders], ['Paid', stats.paid], ['In build', stats.in_build], ['Shipped', stats.shipped], ['Net collected', `$${Number(stats.total_revenue || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2
          })}`], ['Last 30 days', `$${Number(stats.revenue_30d || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2
          })}`]].map(([label, value], i) => <article key={label} style={{
            animationDelay: `${i * 45}ms`
          }}><span>{label}</span><strong>{value}</strong><div className="stat-line" /></article>)}</div>}
    {section === 'overview' && <div className="dashboard-quick"><div><h2>Keep every build moving.</h2><p>Review specifications, update production, and add tracking in one place.</p></div><button className="btn" onClick={() => setSection('orders')}>Manage orders →</button><button className="btn-outline" onClick={() => setSection('payments')}>Payments & refunds ↗</button></div>}
    <div className="dashboard-toolbar"><label><span>Find an order</span><input className="fi" value={search} placeholder="Order number or customer email" onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }} /></label><label><span>Status</span><select className="fi" value={filter} onChange={e => {
              setFilter(e.target.value);
              setPage(1);
            }}><option value="">All statuses</option>{ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></label></div>
    {msg && <div className="notice" role="status">{msg}</div>}{error && <div className="notice notice-error" role="alert">{error}</div>}
    <div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr>{['Order', 'Customer', 'Date', 'Total', 'Status', ''].map((h, i) => <th scope="col" key={i}>{h}</th>)}</tr></thead><tbody>{!loading && !error && orders.map(o => <tr key={o.id}><td><strong>#{o.id.slice(0, 8).toUpperCase()}</strong><small>{o.item_count} item{o.item_count === 1 ? '' : 's'}</small></td><td>{o.customer_email || o.guest_email || '—'}</td><td>{new Date(o.created_at).toLocaleDateString()}</td><td>${Number(o.total).toFixed(2)}</td><td><span className="status-pill" style={{
                    '--status-color': STATUS_COLORS[o.status] || '#aaa'
                  }}>{o.status.replace(/_/g, ' ')}</span></td><td><button className="btn-outline sm" onClick={() => openOrder(o)}>View order ↗</button></td></tr>)}</tbody></table>{loading && <div className="dashboard-empty" role="status">Loading orders…</div>}{!loading && !error && !orders.length && <div className="dashboard-empty"><h3>No matching orders</h3><p>Try another order number, email, or status.</p><button className="btn-outline" onClick={() => {
              setSearch('');
              setFilter('');
              setPage(1);
            }}>Clear filters</button></div>}</div><div className="dashboard-pagination"><button className="btn-outline" disabled={page === 1 || loading} onClick={() => setPage(p => p - 1)}>Previous</button><span>Page {page}</span><button className="btn-outline" disabled={orders.length < 50 || loading} onClick={() => setPage(p => p + 1)}>Next</button></div></>}
    </main>{selected && <><OrderModal order={selected} onClose={() => {
        if (!saving) setSelected(null);
      }} onSave={updateStatus} />{(saving || error) && <div className={`save-feedback ${error ? 'notice-error' : ''}`} role={error ? 'alert' : 'status'}>{saving ? 'Saving changes…' : error}</div>}</>}
  </div>;
}

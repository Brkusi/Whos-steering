import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useCart } from '../context';
import { AUDI_PRESETS } from '../lib/data';

function WheelSVG({ brand, stripeColor }) {
  const badge = brand === 'AUDI' ? 'RS' : 'BMW';
  const stripe = stripeColor || '#2A2A2A';
  return (
    <svg viewBox="0 0 300 300" style={{ width: '70%', height: '70%' }}>
      <circle cx="150" cy="150" r="143" fill="#1A1A1A" />
      <rect x="132" y="7" width="36" height="28" rx="3" fill={stripe} />
      <path d="M150 10 A140 140 0 1 1 149.99 10" fill="none" stroke="#2A2A2A" strokeWidth="26" />
      <line x1="150" y1="88" x2="150" y2="10" stroke="#333" strokeWidth="7" strokeLinecap="round" />
      <line x1="150" y1="212" x2="150" y2="290" stroke="#333" strokeWidth="7" strokeLinecap="round" />
      <line x1="88" y1="150" x2="10" y2="150" stroke="#333" strokeWidth="7" strokeLinecap="round" />
      <line x1="212" y1="150" x2="290" y2="150" stroke="#333" strokeWidth="7" strokeLinecap="round" />
      <circle cx="150" cy="150" r="37" fill="#111" stroke="#2E2E2E" strokeWidth="2" />
      <text x="150" y="157" textAnchor="middle" fill="#E8B800" fontFamily="Orbitron,monospace" fontSize="20" letterSpacing="2">{badge}</text>
      <rect x="5" y="118" width="20" height="64" rx="3" fill="#2A2A2A" />
      <rect x="275" y="118" width="20" height="64" rx="3" fill="#2A2A2A" />
    </svg>
  );
}

function WheelCard({ product, onView, onConfigure }) {
  return (
    <div style={{ background: 'var(--p)', display: 'flex', flexDirection: 'column', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'background .2s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#242424'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--p)'}
      onClick={() => !product.isPreset && onView(product.id)}>
      <div style={{ width: '100%', aspectRatio: 1, background: 'var(--m)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <WheelSVG brand={product.brand} stripeColor={product.stripe_color} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 60%,rgba(0,0,0,.5) 100%)' }} />
        <div style={{ position: 'absolute', top: 12, left: 12, background: 'var(--y)', color: '#000', fontFamily: 'Orbitron, monospace', fontSize: 9, fontWeight: 700, padding: '3px 8px', letterSpacing: 1 }}>{product.brand}</div>
        {product.isPreset && <div style={{ position: 'absolute', top: 12, right: 12, background: '#1A5C2A', color: '#fff', fontFamily: 'Orbitron, monospace', fontSize: 8, fontWeight: 700, padding: '3px 8px', letterSpacing: 1 }}>PRESET</div>}
      </div>
      <div style={{ padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontStyle: 'italic', fontSize: 22, marginBottom: 4 }}>{product.name}</div>
        <div style={{ fontSize: 12, color: 'var(--t)', lineHeight: 1.5, marginBottom: 14, flex: 1 }}>{product.description}</div>
        {Array.isArray(product.features) && product.features.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {(Array.isArray(product.features) ? product.features : JSON.parse(product.features || '[]')).slice(0,4).map(f => (
              <span key={f} style={{ fontSize: 9, padding: '2px 7px', background: 'rgba(232,184,0,.08)', border: '1px solid rgba(232,184,0,.2)', color: 'var(--y)', letterSpacing: 1 }}>{f}</span>
            ))}
          </div>
        )}
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 28, color: 'var(--y)' }}>${parseFloat(product.base_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div style={{ fontSize: 10, color: 'var(--t)', marginBottom: 12 }}>Starting price · Fully configurable</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {!product.isPreset && (
            <button className="btn btn-sm" style={{ clipPath: 'none', flex: 1 }} onClick={e => { e.stopPropagation(); onView(product.id); }}>VIEW DETAILS</button>
          )}
          <button className="btn-outline sm" style={{ flex: product.isPreset ? 1 : undefined }} onClick={e => { e.stopPropagation(); onConfigure(product.brand); }}>
            {product.isPreset ? 'CONFIGURE THIS STYLE' : 'CONFIGURE'}
          </button>
        </div>
        <div style={{ fontSize: 10, color: 'var(--t)', paddingTop: 10, borderTop: '1px solid var(--b)' }}>🛡 6 Month Warranty · ⏱ 3–5 Week Build</div>
      </div>
    </div>
  );
}

function ConfigureCard({ brand, nav }) {
  return (
    <div onClick={() => nav(`/configure?brand=${brand}`)}
      style={{ background: 'linear-gradient(135deg, rgba(232,184,0,.08) 0%, var(--p) 100%)', display: 'flex', flexDirection: 'column', cursor: 'pointer', border: '1px dashed rgba(232,184,0,.3)', transition: 'all .2s', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(232,184,0,.14) 0%, #242424 100%)'; e.currentTarget.style.borderColor = 'rgba(232,184,0,.6)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(232,184,0,.08) 0%, var(--p) 100%)'; e.currentTarget.style.borderColor = 'rgba(232,184,0,.3)'; }}>
      <div style={{ width: '100%', aspectRatio: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 32 }}>
        <div style={{ fontSize: 56, opacity: .3 }}>⚙</div>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: 'var(--y)', textAlign: 'center', textTransform: 'uppercase' }}>Build Your Own</div>
      </div>
      <div style={{ padding: '18px 20px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 28, marginBottom: 8, color: 'var(--y)' }}>CUSTOM CONFIGURE</div>
        <div style={{ fontSize: 12, color: 'var(--t)', lineHeight: 1.6, marginBottom: 20, flex: 1 }}>
          Choose every material, color, stripe, stitch and option. Fully tailored to your exact specification.
        </div>
        <button className="btn" style={{ clipPath: 'none', width: '100%' }}>
          START CONFIGURING →
        </button>
      </div>
    </div>
  );
}

export default function Catalog() {
  const [dbProducts, setDbProducts] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const brand = params.get('brand');
    if (brand) setFilter(brand);
    apiFetch('/api/products')
      .then(data => setDbProducts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  // Combine DB products with Audi presets, deduplicated
  const allProducts = [
    ...dbProducts,
    ...AUDI_PRESETS,
  ];

  const filtered = filter === 'ALL'
    ? allProducts
    : allProducts.filter(p => p.brand === filter);

  return (
    <div style={{ paddingTop: 88, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '50px 40px 32px', borderBottom: '1px solid var(--b)', background: 'linear-gradient(180deg,rgba(232,184,0,.04) 0%,transparent 100%)' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: 'var(--y)', textTransform: 'uppercase', marginBottom: 8 }}>Shop All</div>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 52, letterSpacing: 2 }}>CATALOG</div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, padding: '16px 40px', borderBottom: '1px solid var(--b)', flexWrap: 'wrap' }}>
        {['ALL', 'BMW', 'AUDI'].map(f => (
          <button key={f} className={`ob${filter === f ? ' on' : ''}`} style={{ fontSize: 11, padding: '5px 16px' }} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--t)', fontFamily: 'Orbitron, monospace', letterSpacing: 3 }}>LOADING...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1, background: 'var(--b)' }}>
          {filtered.map(p => (
            <WheelCard key={p.id} product={p}
              onView={id => nav(`/catalog/${id}`)}
              onConfigure={brand => nav(`/configure?brand=${brand}`)} />
          ))}
          {/* Configure card — always show last */}
          {(filter === 'ALL' || filter === 'BMW') && <ConfigureCard brand="BMW" nav={nav} />}
          {(filter === 'ALL' || filter === 'AUDI') && <ConfigureCard brand="AUDI" nav={nav} />}
        </div>
      )}

      {/* Info strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid var(--b)', background: 'var(--m)' }}>
        {[['🛡','6 Month Warranty','Manufacturer guaranteed'],['⏱','3–5 Week Build','Handcrafted to order'],['🔧','BMW & Audi','Fitment specialists']].map(([icon,title,sub]) => (
          <div key={title} style={{ padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 12, borderRight: '1px solid var(--b)' }}>
            <span style={{ fontSize: 22, color: 'var(--y)' }}>{icon}</span>
            <div><div style={{ fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>{title}</div><div style={{ fontSize: 11, color: 'var(--t)' }}>{sub}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

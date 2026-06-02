import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function ConfigureCard({ brand, nav }) {
  return (
    <div onClick={() => nav(`/configure?brand=${brand}`)}
      style={{ background: 'linear-gradient(135deg, rgba(232,184,0,.08) 0%, var(--p) 100%)', display: 'flex', flexDirection: 'column', cursor: 'pointer', border: '1px dashed rgba(232,184,0,.3)', transition: 'all .2s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,rgba(232,184,0,.14) 0%,#242424 100%)'; e.currentTarget.style.borderColor = 'rgba(232,184,0,.6)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,rgba(232,184,0,.08) 0%,var(--p) 100%)'; e.currentTarget.style.borderColor = 'rgba(232,184,0,.3)'; }}>
      <div style={{ width: '100%', aspectRatio: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, padding: 32 }}>
        {/* Wheel SVG */}
        <svg viewBox="0 0 300 300" style={{ width: '55%', opacity: .25 }}>
          <circle cx="150" cy="150" r="143" fill="none" stroke="#E8B800" strokeWidth="6" />
          <line x1="150" y1="10" x2="150" y2="88" stroke="#E8B800" strokeWidth="6" strokeLinecap="round" />
          <line x1="150" y1="212" x2="150" y2="290" stroke="#E8B800" strokeWidth="6" strokeLinecap="round" />
          <line x1="10" y1="150" x2="88" y2="150" stroke="#E8B800" strokeWidth="6" strokeLinecap="round" />
          <line x1="212" y1="150" x2="290" y2="150" stroke="#E8B800" strokeWidth="6" strokeLinecap="round" />
          <circle cx="150" cy="150" r="37" fill="none" stroke="#E8B800" strokeWidth="6" />
        </svg>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 3, color: 'var(--y)', textAlign: 'center' }}>
          BUILD YOUR OWN {brand}
        </div>
      </div>
      <div style={{ padding: '18px 20px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 26, marginBottom: 8, color: 'var(--y)' }}>
          {brand} CUSTOM BUILD
        </div>
        <div style={{ fontSize: 12, color: 'var(--t)', lineHeight: 1.6, flex: 1, marginBottom: 16 }}>
          Choose every material, color, stripe and stitch. Fully tailored to your exact specification.
        </div>
        <button className="btn" style={{ clipPath: 'none', width: '100%' }}>
          START CONFIGURING →
        </button>
      </div>
    </div>
  );
}

export default function Catalog() {
  const [filter, setFilter] = useState('ALL');
  const nav = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const brand = params.get('brand');
    if (brand) setFilter(brand);
  }, []); // eslint-disable-line

  // Exactly which configure cards to show based on filter — never duplicates
  const cards = filter === 'BMW'
    ? ['BMW']
    : filter === 'AUDI'
      ? ['AUDI']
      : ['BMW', 'AUDI']; // ALL shows both, once each

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
          <button key={f} className={`ob${filter === f ? ' on' : ''}`}
            style={{ fontSize: 11, padding: '5px 16px' }}
            onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {/* Grid — only configure cards, no duplicates */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1, background: 'var(--b)' }}>
        {cards.map(brand => (
          <ConfigureCard key={brand} brand={brand} nav={nav} />
        ))}
      </div>

      {/* Info strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid var(--b)', background: 'var(--m)', marginTop: 1 }}>
        {[
          ['🛡', '6 Month Warranty',  'Manufacturer guaranteed'],
          ['⏱', '3–5 Week Build',    'Handcrafted to order'],
          ['🔧', 'BMW & Audi',        'Fitment specialists'],
        ].map(([icon, title, sub]) => (
          <div key={title} style={{ padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 12, borderRight: '1px solid var(--b)' }}>
            <span style={{ fontSize: 22, color: 'var(--y)' }}>{icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>{title}</div>
              <div style={{ fontSize: 11, color: 'var(--t)' }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

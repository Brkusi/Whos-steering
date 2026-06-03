import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// ── Audi preset data ──────────────────────────────────────────────────────────
const AUDI_PRESETS = [
  {
    id: 'rs-sig-carbon',
    name: 'RS SIGNATURE CARBON',
    price: '$1,249.99',
    tag: 'AUDI',
    compat: 'Fits 2011+ AUDI All Models',
    features: [
      'Magnetic Paddle Shifters',
      'Classic Carbon Top & Bottom',
      'Perforated Leather Sides',
      'S or RS Badging Option',
      'Airbag Cover Compatible',
      'Heated Steering',
    ],
    images: ['PRESET_1.png', 'PRESET_1_2_.png'],
    desc: 'A bold carbon-forward build with perforated leather sides and magnetic paddle shifters. Available with S or RS badging.',
  },
  {
    id: 'rs-stealth',
    name: 'RS STEALTH',
    price: '$1,129.99',
    tag: 'AUDI',
    compat: 'Fits 2011+ AUDI All Models',
    features: [
      'Magnetic Paddle Shifters',
      'Full Alcantara Grip',
      'Carbon Fiber Accents',
      'RS Badging',
      'Airbag Cover Compatible',
      'Heated Steering',
    ],
    images: ['PRESET_2.png', 'PRESET_2_2_.png'],
    desc: 'Blacked-out Alcantara all around with carbon fibre accents. Understated, aggressive, and purpose-built.',
  },
];

function PresetCard({ preset, nav }) {
  const [imgIdx, setImgIdx] = useState(0);

  return (
    <div style={{ background: 'var(--p)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', transition: 'background .2s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#242424'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--p)'}>

      {/* Image area */}
      <div style={{ width: '100%', aspectRatio: 1, background: '#0A0A0A', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
        onClick={() => setImgIdx(i => (i + 1) % preset.images.length)}>
        <img
          src={`/${preset.images[imgIdx]}`}
          alt={preset.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
        {/* Brand badge */}
        <div style={{ position: 'absolute', top: 12, left: 12, background: 'var(--y)', color: '#000', fontFamily: 'Orbitron, monospace', fontSize: 9, fontWeight: 700, padding: '3px 8px', letterSpacing: 1 }}>
          {preset.tag}
        </div>
        {/* Image counter */}
        {preset.images.length > 1 && (
          <div style={{ position: 'absolute', bottom: 10, right: 12, display: 'flex', gap: 4 }}>
            {preset.images.map((_, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === imgIdx ? 'var(--y)' : 'rgba(255,255,255,.3)', cursor: 'pointer' }}
                onClick={e => { e.stopPropagation(); setImgIdx(i); }} />
            ))}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(transparent, rgba(0,0,0,.7))' }} />
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 24, marginBottom: 4 }}>{preset.name}</div>
        <div style={{ fontSize: 11, color: 'rgba(232,184,0,.7)', letterSpacing: 1, marginBottom: 8 }}>✓ {preset.compat}</div>
        <div style={{ fontSize: 12, color: 'var(--t)', lineHeight: 1.5, marginBottom: 12 }}>{preset.desc}</div>

        {/* Features */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
          {preset.features.map(f => (
            <span key={f} style={{ fontSize: 9, padding: '2px 7px', background: 'rgba(232,184,0,.08)', border: '1px solid rgba(232,184,0,.2)', color: 'var(--y)', letterSpacing: 1 }}>{f}</span>
          ))}
        </div>

        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 28, color: 'var(--y)', marginBottom: 4 }}>{preset.price}</div>
        <div style={{ fontSize: 10, color: 'var(--t)', marginBottom: 14 }}>Starting price · Fully configurable</div>

        <button className="btn" style={{ clipPath: 'none', width: '100%' }}
          onClick={() => nav(`/configure?brand=AUDI&preset=${preset.id}`)}>
          CONFIGURE THIS STYLE →
        </button>
        <div style={{ fontSize: 10, color: 'var(--t)', paddingTop: 10, marginTop: 4, borderTop: '1px solid var(--b)' }}>🛡 6 Month Warranty · ⏱ 3–5 Week Build</div>
      </div>
    </div>
  );
}

function ConfigureCard({ brand, nav }) {
  return (
    <div onClick={() => nav(`/configure?brand=${brand}`)}
      style={{ background: 'linear-gradient(135deg, rgba(232,184,0,.08) 0%, var(--p) 100%)', display: 'flex', flexDirection: 'column', cursor: 'pointer', border: '1px dashed rgba(232,184,0,.3)', transition: 'all .2s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,rgba(232,184,0,.14) 0%,#242424 100%)'; e.currentTarget.style.borderColor = 'rgba(232,184,0,.6)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,rgba(232,184,0,.08) 0%,var(--p) 100%)'; e.currentTarget.style.borderColor = 'rgba(232,184,0,.3)'; }}>
      <div style={{ width: '100%', aspectRatio: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, padding: 32 }}>
        <svg viewBox="0 0 300 300" style={{ width: '55%', opacity: .25 }}>
          <circle cx="150" cy="150" r="143" fill="none" stroke="#E8B800" strokeWidth="6" />
          <line x1="150" y1="10" x2="150" y2="88" stroke="#E8B800" strokeWidth="6" strokeLinecap="round" />
          <line x1="150" y1="212" x2="150" y2="290" stroke="#E8B800" strokeWidth="6" strokeLinecap="round" />
          <line x1="10" y1="150" x2="88" y2="150" stroke="#E8B800" strokeWidth="6" strokeLinecap="round" />
          <line x1="212" y1="150" x2="290" y2="150" stroke="#E8B800" strokeWidth="6" strokeLinecap="round" />
          <circle cx="150" cy="150" r="37" fill="none" stroke="#E8B800" strokeWidth="6" />
        </svg>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 3, color: 'var(--y)', textAlign: 'center' }}>BUILD YOUR OWN {brand}</div>
      </div>
      <div style={{ padding: '18px 20px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 26, marginBottom: 8, color: 'var(--y)' }}>{brand} CUSTOM BUILD</div>
        <div style={{ fontSize: 12, color: 'var(--t)', lineHeight: 1.6, flex: 1, marginBottom: 16 }}>Choose every material, color, stripe and stitch. Fully tailored to your exact specification.</div>
        <button className="btn" style={{ clipPath: 'none', width: '100%' }}>START CONFIGURING →</button>
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

  const showBMW  = filter === 'ALL' || filter === 'BMW';
  const showAUDI = filter === 'ALL' || filter === 'AUDI';

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1, background: 'var(--b)' }}>
        {/* BMW configure card */}
        {showBMW && <ConfigureCard brand="BMW" nav={nav} />}
        {/* Audi presets */}
        {showAUDI && AUDI_PRESETS.map(p => <PresetCard key={p.id} preset={p} nav={nav} />)}
        {/* Audi configure card */}
        {showAUDI && <ConfigureCard brand="AUDI" nav={nav} />}
      </div>

      {/* Info strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid var(--b)', background: 'var(--m)', marginTop: 1 }}>
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

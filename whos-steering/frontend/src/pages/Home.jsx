import { useNavigate } from 'react-router-dom';

const MATERIALS = [
  'Carbon fibre base engineered for superior strength, weave consistency, and surface finish',
  'High quality leather selected for luxury feel, durability, and long-term wear',
  'Advanced 3D modelling for precise fitment and OEM-correct ergonomics',
  'Hand stitching applied by skilled craftsmen for a tailored, premium finish',
  'Environmentally conscious production processes implemented where possible',
  'Secure protective packaging to safeguard premium materials during transport',
  'Handcrafted construction with strict quality control standards',
];

export default function Home() {
  const nav = useNavigate();

  return (
    <div>
      {/* ── Hero ── */}
      <div id="hero" style={{
        height: '100vh', position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(232,184,0,.09) 0%, transparent 60%), #080808' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(232,184,0,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(232,184,0,.03) 1px, transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)' }} />

        {/* Spinning wheel bg */}
        <svg viewBox="0 0 300 300" style={{ position: 'absolute', right: -60, top: '50%', transform: 'translateY(-50%)', opacity: .04, width: 500, animation: 'spin 30s linear infinite' }}>
          <circle cx="150" cy="150" r="143" fill="none" stroke="#E8B800" strokeWidth="4" />
          <line x1="150" y1="10" x2="150" y2="290" stroke="#E8B800" strokeWidth="6" />
          <line x1="10" y1="150" x2="290" y2="150" stroke="#E8B800" strokeWidth="6" />
          <circle cx="150" cy="150" r="37" fill="none" stroke="#E8B800" strokeWidth="4" />
        </svg>

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px', width: '100%', maxWidth: 700 }}>
          {/* Logo */}
          <div className="fade-up" style={{ marginBottom: 4, animationDelay: '.2s' }}>
            <img
              src="/ws-logo.png"
              alt="Who's Steering"
              style={{
                /* Mobile: 55vw, capped at 320px. Desktop: 36vw, capped at 480px */
                width: 'min(55vw, 320px)',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
              }}
            />
          </div>

          <div className="fade-up" style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(8px, 2vw, 10px)', letterSpacing: 6, color: 'var(--y)', textTransform: 'uppercase', marginBottom: 8, animationDelay: '.55s' }}>
            Custom Steering Wheels
          </div>
          <div className="fade-up" style={{ fontSize: 'clamp(11px, 3vw, 15px)', color: 'var(--t)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10, animationDelay: '.7s' }}>
            BMW &amp; AUDI SPECIALISTS
          </div>
          <div className="fade-up" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24, animationDelay: '.85s' }}>
            {['Made to Order', '6 Month Warranty', '3–5 Week Build'].map(b => (
              <span key={b} style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(7px, 2vw, 9px)', letterSpacing: 2, padding: '5px 10px', border: '1px solid rgba(232,184,0,.3)', color: 'rgba(232,184,0,.75)' }}>{b}</span>
            ))}
          </div>
          <div className="fade-up" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '1s' }}>
            <button className="btn" onClick={() => nav('/configure')}>BUILD YOURS</button>
            <button className="btn-outline" onClick={() => nav('/catalog')}>SHOP CATALOG</button>
          </div>
        </div>

        {/* Bottom brand strip */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', borderTop: '1px solid var(--b)' }}>
          {[
            { id: 'bmw',    name: 'BMW',    tag: 'M Sport Builds',    badge: 'IN STOCK'  },
            { id: 'audi',   name: 'AUDI',   tag: 'RS Edition Builds', badge: 'IN STOCK'  },
            { id: 'custom', name: 'CUSTOM', tag: 'Full Configurator', badge: 'CONFIGURE' },
          ].map((b, i) => (
            <div key={b.id} onClick={() => nav(b.id === 'custom' ? '/configure' : `/catalog?brand=${b.name}`)}
              style={{ flex: 1, padding: 'clamp(10px,2vw,16px) clamp(8px,2vw,20px)', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(20,20,20,.9)', borderRight: i < 2 ? '1px solid var(--b)' : 'none', cursor: 'pointer', transition: 'background .3s', overflow: 'hidden' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(35,35,35,.9)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(20,20,20,.9)'}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontStyle: 'italic', fontSize: 'clamp(14px,3vw,22px)', letterSpacing: 1 }}>{b.name}</div>
                <div style={{ fontSize: 'clamp(7px,1.5vw,10px)', color: 'var(--t)', letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.tag}</div>
              </div>
              <div style={{ marginLeft: 'auto', background: 'var(--y)', color: '#000', fontSize: 'clamp(7px,1.5vw,9px)', fontWeight: 700, padding: '3px 6px', fontFamily: 'Orbitron, monospace', letterSpacing: 1, flexShrink: 0 }}>{b.badge}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Materials & Craftsmanship ── */}
      <div style={{ background: 'var(--m)', borderBottom: '1px solid var(--b)' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: 'clamp(40px,6vw,64px) clamp(20px,5vw,40px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(32px,5vw,60px)',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: 4, color: 'var(--y)', textTransform: 'uppercase', marginBottom: 10 }}>Our Standard</div>
            <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(32px,5vw,44px)', lineHeight: 1, marginBottom: 16 }}>
              MATERIALS &<br /><span style={{ color: 'var(--y)' }}>CRAFTSMANSHIP</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--t)', lineHeight: 1.7 }}>
              Every wheel we build is a commitment to quality. From the materials we select to the hands that assemble them, no detail is overlooked.
            </div>
          </div>
          <div>
            {MATERIALS.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 20, height: 20, background: 'rgba(232,184,0,.1)', border: '1px solid rgba(232,184,0,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <div style={{ width: 6, height: 6, background: 'var(--y)' }} />
                </div>
                <span style={{ fontSize: 13, color: 'var(--t)', lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
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
      <div id="hero" style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#080808', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', aspectRatio: '3 / 2' }}>
            <img
              src="/hero-main.png"
              alt="Who's Steering — Designed by you. Built by us. Custom steering wheels made to your specification."
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
            <div className="fade-up" style={{ position: 'absolute', left: '5.5%', top: '65%', display: 'flex', gap: 10, flexWrap: 'wrap', zIndex: 2, animationDelay: '.4s' }}>
              <button className="btn" onClick={() => nav('/configure')}>BUILD YOURS</button>
              <button className="btn-outline" onClick={() => nav('/catalog')}>EXPLORE WHEELS</button>
            </div>
          </div>
        </div>

        {/* Bottom brand strip */}
        <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', borderTop: '1px solid var(--b)', marginTop: 'auto' }}>
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

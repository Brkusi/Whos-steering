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
        minHeight: '100vh', position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', flexDirection: 'column',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 75% 50%, rgba(232,184,0,.10) 0%, transparent 60%), #080808' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(232,184,0,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(232,184,0,.03) 1px, transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)' }} />

        <div style={{
          position: 'relative', zIndex: 2, width: '100%', maxWidth: 1360,
          flex: 1, display: 'flex', alignItems: 'center',
          margin: '0 auto', padding: 'clamp(90px,10vw,40px) clamp(24px,5vw,64px) clamp(60px,8vw,40px)',
        }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(280px,560px) minmax(280px,1fr)',
          gap: 'clamp(24px,4vw,40px)', alignItems: 'center', width: '100%',
        }}>
          {/* Left: copy */}
          <div className="fade-up" style={{ animationDelay: '.2s' }}>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(9px,1.6vw,11px)', letterSpacing: 4, color: 'var(--y)', textTransform: 'uppercase', marginBottom: 16 }}>
              Built Around You.
            </div>
            <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(40px,6.5vw,76px)', lineHeight: .95, letterSpacing: -1, marginBottom: 20, textTransform: 'uppercase' }}>
              Designed by <span style={{ color: 'var(--y)' }}>You.</span><br />
              Built by <span style={{ color: 'var(--y)' }}>Us.</span>
            </div>
            <div style={{ fontSize: 'clamp(14px,2vw,16px)', color: 'var(--t)', lineHeight: 1.6, marginBottom: 28, maxWidth: 440 }}>
              Handcrafted custom steering wheels built exactly to your specification.
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn" onClick={() => nav('/configure')}>BUILD YOURS</button>
              <button className="btn-outline" onClick={() => nav('/catalog')}>EXPLORE WHEELS</button>
            </div>
          </div>

          {/* Right: hero wheel photo */}
          <div className="fade-up" style={{ animationDelay: '.4s', position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: '80%', aspectRatio: '1/1', borderRadius: '50%', background: 'radial-gradient(ellipse at center, rgba(232,184,0,.25) 0%, transparent 70%)', filter: 'blur(10px)' }} />
            <img
              src="/BMW_PRESET_1.png"
              alt="Custom BMW M steering wheel"
              style={{ position: 'relative', width: '100%', maxWidth: 620, height: 'auto', objectFit: 'contain', display: 'block' }}
            />
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

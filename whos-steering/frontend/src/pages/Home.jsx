import { useNavigate } from 'react-router-dom';

export default function Home() {
  const nav = useNavigate();

  return (
    <div>
      {/* Hero */}
      <div id="hero" style={{ height: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(232,184,0,.09) 0%, transparent 60%), #080808' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(232,184,0,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(232,184,0,.03) 1px, transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)' }} />

        {/* Spinning wheel bg */}
        <svg viewBox="0 0 300 300" style={{ position: 'absolute', right: -60, top: '50%', transform: 'translateY(-50%)', opacity: .04, width: 500, animation: 'spin 30s linear infinite' }}>
          <circle cx="150" cy="150" r="143" fill="none" stroke="#E8B800" strokeWidth="4" />
          <line x1="150" y1="10" x2="150" y2="290" stroke="#E8B800" strokeWidth="6" />
          <line x1="10" y1="150" x2="290" y2="150" stroke="#E8B800" strokeWidth="6" />
          <circle cx="150" cy="150" r="37" fill="none" stroke="#E8B800" strokeWidth="4" />
        </svg>

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px' }}>
          <div className="ws-logo hero-logo fade-up" style={{ marginBottom: 18, animationDelay: '.2s' }}>
            <span className="ws-logo-top" style={{ fontSize: 'clamp(56px,12vw,120px)', letterSpacing: -2 }}>WHO'S</span>
            <span className="ws-logo-bot" style={{ fontSize: 'clamp(20px,4vw,42px)', letterSpacing: 6, marginTop: -4 }}>STEERING</span>
          </div>
          <div className="fade-up" style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 6, color: 'var(--y)', textTransform: 'uppercase', marginBottom: 12, animationDelay: '.55s' }}>
            Custom Steering Wheels
          </div>
          <div className="fade-up" style={{ fontSize: 15, color: 'var(--t)', letterSpacing: 3, textTransform: 'uppercase', marginTop: 10, animationDelay: '.7s' }}>
            BMW &amp; AUDI SPECIALISTS
          </div>
          <div className="fade-up" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12, animationDelay: '.85s' }}>
            {['Made to Order', '6 Month Warranty', '3–5 Week Build'].map(b => (
              <span key={b} style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: 2, padding: '5px 12px', border: '1px solid rgba(232,184,0,.3)', color: 'rgba(232,184,0,.75)' }}>{b}</span>
            ))}
          </div>
          <div className="fade-up" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28, animationDelay: '1s' }}>
            <button className="btn" onClick={() => nav('/configure')}>BUILD YOURS</button>
            <button className="btn-outline" onClick={() => nav('/catalog')}>SHOP CATALOG</button>
          </div>
        </div>

        {/* Bottom brand strip */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', borderTop: '1px solid var(--b)' }}>
          {[
            { id: 'bmw', name: 'BMW', tag: 'M Sport Builds', badge: 'IN STOCK' },
            { id: 'audi', name: 'AUDI', tag: 'RS Edition Builds', badge: 'IN STOCK' },
            { id: 'custom', name: 'CUSTOM', tag: 'Full Configurator', badge: 'CONFIGURE' },
          ].map((b, i) => (
            <div key={b.id} onClick={() => nav(b.id === 'custom' ? '/configure' : `/catalog?brand=${b.name}`)}
              style={{ flex: 1, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(20,20,20,.9)', borderRight: i < 2 ? '1px solid var(--b)' : 'none', cursor: 'pointer', transition: 'background .3s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(35,35,35,.9)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(20,20,20,.9)'}>
              <div>
                <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontStyle: 'italic', fontSize: 22, letterSpacing: 1 }}>{b.name}</div>
                <div style={{ fontSize: 10, color: 'var(--t)', letterSpacing: 1, textTransform: 'uppercase' }}>{b.tag}</div>
              </div>
              <div style={{ marginLeft: 'auto', background: 'var(--y)', color: '#000', fontSize: 9, fontWeight: 700, padding: '3px 8px', fontFamily: 'Orbitron, monospace', letterSpacing: 1 }}>{b.badge}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

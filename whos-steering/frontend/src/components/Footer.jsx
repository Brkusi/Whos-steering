import { Link } from 'react-router-dom';

const LEGAL_LINKS = [
  { label: 'Terms of Service',    to: '/terms' },
  { label: 'Privacy Policy',      to: '/privacy' },
  { label: 'Shipping Policy',     to: '/shipping' },
  { label: 'Return & Refund',     to: '/refund-policy' },
  { label: 'Payment Policy',      to: '/payment-policy' },
];

const NAV_LINKS = [
  { label: 'Shop',      to: '/catalog' },
  { label: 'Configure', to: '/build' },
  { label: 'Track Order', to: '/track-order' },
  { label: 'Contact',   to: '/contact' },
];

export default function Footer() {
  return (
    <footer style={{
      background: '#060606',
      borderTop: '1px solid var(--b)',
      padding: '48px 40px 28px',
      marginTop: 0,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Top row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 40,
          marginBottom: 48,
          paddingBottom: 40,
          borderBottom: '1px solid var(--b)',
        }}>

          {/* Brand */}
          <div>
            <img src="/ws-logo.png" alt="Who's Steering"
              style={{ height: 48, width: 'auto', objectFit: 'contain', display: 'block', marginBottom: 16 }}
              onError={e => e.target.style.display = 'none'} />
            <div style={{ fontSize: 12, color: 'var(--t)', lineHeight: 1.8, maxWidth: 240 }}>
              Custom BMW & Audi steering wheels. Engineered in Florida. Assembled in New York City.
            </div>
            <div style={{ marginTop: 14, fontSize: 11, color: 'rgba(232,184,0,.6)', letterSpacing: 1 }}>
              ✈️ Worldwide Shipping Available
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: 3, color: 'var(--y)', marginBottom: 16, textTransform: 'uppercase' }}>Navigation</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {NAV_LINKS.map(l => (
                <Link key={l.to} to={l.to} style={{ fontSize: 13, color: 'var(--t)', textDecoration: 'none', transition: 'color .2s', letterSpacing: 1 }}
                  onMouseEnter={e => e.target.style.color = 'var(--y)'}
                  onMouseLeave={e => e.target.style.color = 'var(--t)'}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: 3, color: 'var(--y)', marginBottom: 16, textTransform: 'uppercase' }}>Legal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LEGAL_LINKS.map(l => (
                <Link key={l.to} to={l.to} style={{ fontSize: 13, color: 'var(--t)', textDecoration: 'none', transition: 'color .2s', letterSpacing: 1 }}
                  onMouseEnter={e => e.target.style.color = 'var(--y)'}
                  onMouseLeave={e => e.target.style.color = 'var(--t)'}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: 3, color: 'var(--y)', marginBottom: 16, textTransform: 'uppercase' }}>Contact</div>
            <div style={{ fontSize: 13, color: 'var(--t)', lineHeight: 1.9 }}>
              <div><a href="mailto:service@whossteering.com" style={{ color: 'var(--t)', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = 'var(--y)'}
                onMouseLeave={e => e.target.style.color = 'var(--t)'}>
                service@whossteering.com
              </a></div>
              <div style={{ marginTop: 8 }}>
                <a
                  href="https://www.instagram.com/whossteering/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Who's Steering on Instagram"
                  style={{ color: 'var(--y)', textDecoration: 'none', fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 1.4 }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--yl)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--y)'}
                >
                  ◎ INSTAGRAM
                </a>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: '#444', lineHeight: 1.7 }}>
                Manufactured in Florida<br />
                Assembled in New York City
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ fontSize: 11, color: '#333', letterSpacing: 1 }}>
            © {new Date().getFullYear()} WHO'S STEERING. ALL RIGHTS RESERVED.
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href="https://www.instagram.com/whossteering/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 10, color: 'var(--y)', textDecoration: 'none', letterSpacing: 1, textTransform: 'uppercase' }}
            >
              Instagram ↗
            </a>
            {LEGAL_LINKS.map(l => (
              <Link key={l.to} to={l.to}
                style={{ fontSize: 10, color: '#333', textDecoration: 'none', letterSpacing: 1, textTransform: 'uppercase', transition: 'color .2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--y)'}
                onMouseLeave={e => e.target.style.color = '#333'}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

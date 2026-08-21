import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context';
import { useAuth } from '../context';
import CartDrawer from './CartDrawer';
import AnnouncementBar from './AnnouncementBar';

export default function Nav() {
  const { count, cartOpen, setCartOpen } = useCart();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();

  const linkStyle = {
    color: 'var(--t)', fontWeight: 600, fontSize: 11, letterSpacing: 3,
    textTransform: 'uppercase', transition: 'color .2s', cursor: 'pointer',
    textDecoration: 'none',
  };

  return (
    <>
      <AnnouncementBar />
      <nav style={{
        position: 'sticky', top: 32, left: 0, right: 0, height: 88,
        background: 'rgba(5,5,5,0.97)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--b)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', zIndex: 1000,
      }}>
        {/* Left links */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', minWidth: 160 }}>
          <Link to="/catalog" style={linkStyle}
            onMouseEnter={e => e.target.style.color = 'var(--y)'}
            onMouseLeave={e => e.target.style.color = 'var(--t)'}>Shop</Link>
          <Link to="/build" style={linkStyle}
            onMouseEnter={e => e.target.style.color = 'var(--y)'}
            onMouseLeave={e => e.target.style.color = 'var(--t)'}>Configure</Link>
        </div>

        {/* Center — real logo image */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', cursor: 'pointer', zIndex: 10 }}
          onClick={() => nav('/')}>
          <img
            src="/ws-logo.png"
            alt="Who's Steering"
            style={{ height: 62, width: 'auto', objectFit: 'contain', display: 'block' }}
          />
        </div>

        {/* Right links */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', minWidth: 160, justifyContent: 'flex-end' }}>
          <Link to="/track-order" style={{ ...linkStyle, display: window.innerWidth <= 760 ? 'none' : 'block' }}
            onMouseEnter={e => e.target.style.color = 'var(--y)'}
            onMouseLeave={e => e.target.style.color = 'var(--t)'}>Track</Link>
          <Link to="/contact" style={{ ...linkStyle, display: window.innerWidth <= 480 ? 'none' : 'block' }}
            onMouseEnter={e => e.target.style.color = 'var(--y)'}
            onMouseLeave={e => e.target.style.color = 'var(--t)'}>Contact</Link>
          <Link to={user ? '/account' : '/login'} style={linkStyle}
            onMouseEnter={e => e.target.style.color = 'var(--y)'}
            onMouseLeave={e => e.target.style.color = 'var(--t)'}>{user ? 'Account' : 'Login'}</Link>

          {/* Cart */}
          <button onClick={() => setCartOpen(true)} style={{
            background: 'none', border: 'none', color: 'var(--t)', cursor: 'pointer',
            fontSize: 18, transition: 'color .2s', position: 'relative',
            display: 'flex', alignItems: 'center', padding: 0,
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--y)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--t)'}>
            🛒
            {count > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -8,
                background: 'var(--y)', color: '#000', fontSize: 9, fontWeight: 700,
                width: 15, height: 15, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Orbitron, monospace',
              }}>{count}</span>
            )}
          </button>

          {/* Hamburger mobile */}
          <button onClick={() => setMenuOpen(m => !m)} style={{
            background: 'none', border: 'none', color: 'var(--t)', cursor: 'pointer',
            fontSize: 20, padding: 0,
            display: window.innerWidth > 640 ? 'none' : 'flex', alignItems: 'center',
          }}>☰</button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 120, left: 0, right: 0,
          background: 'rgba(5,5,5,.98)', borderBottom: '1px solid var(--b)',
          zIndex: 999, display: 'flex', flexDirection: 'column',
        }}>
          {[['/catalog','SHOP'],['/build','CONFIGURE'],['/track-order','TRACK ORDER'],['/contact','CONTACT'],[user ? '/account' : '/login', user ? 'ACCOUNT' : 'LOGIN']].map(([path, label]) => (
            <Link key={path} to={path} onClick={() => setMenuOpen(false)}
              style={{ padding: '16px 24px', borderBottom: '1px solid var(--b)', fontFamily: 'Orbitron, monospace', fontSize: 11, letterSpacing: 3, color: 'var(--t)', textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
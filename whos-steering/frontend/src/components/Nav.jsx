import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context';
import { useAuth } from '../context';
import CartDrawer from './CartDrawer';

export default function Nav() {
  const { count } = useCart();
  const { user } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();

  const navLink = (color = 'var(--t)') => ({
    color, fontWeight: 600, fontSize: 11, letterSpacing: 3,
    textTransform: 'uppercase', transition: 'color .2s', cursor: 'pointer',
  });

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 88,
        background: 'rgba(5,5,5,0.97)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--b)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', zIndex: 1000,
      }}>
        {/* Left links — hide on mobile */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', minWidth: 160 }}
          className="nav-links-left">
          <Link to="/catalog" style={navLink()}
            onMouseEnter={e => e.target.style.color = 'var(--y)'}
            onMouseLeave={e => e.target.style.color = 'var(--t)'}>Shop</Link>
          <Link to="/configure" style={navLink()}
            onMouseEnter={e => e.target.style.color = 'var(--y)'}
            onMouseLeave={e => e.target.style.color = 'var(--t)'}>Configure</Link>
        </div>

        {/* Center logo */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', cursor: 'pointer' }}
          onClick={() => nav('/')}>
          <div className="ws-logo">
            <span className="ws-logo-top">WHO'S</span>
            <span className="ws-logo-bot">STEERING</span>
          </div>
        </div>

        {/* Right links */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', minWidth: 160, justifyContent: 'flex-end' }}>
          {/* Desktop links */}
          <Link to="/contact" style={{ ...navLink(), display: window.innerWidth <= 480 ? 'none' : 'block' }}
            onMouseEnter={e => e.target.style.color = 'var(--y)'}
            onMouseLeave={e => e.target.style.color = 'var(--t)'}>Contact</Link>
          <Link to={user ? '/account' : '/login'} style={navLink()}
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

          {/* Hamburger — mobile only */}
          <button onClick={() => setMenuOpen(m => !m)} style={{
            background: 'none', border: 'none', color: 'var(--t)', cursor: 'pointer',
            fontSize: 20, padding: 0, display: window.innerWidth > 640 ? 'none' : 'flex',
            alignItems: 'center',
          }}>☰</button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 88, left: 0, right: 0,
          background: 'rgba(5,5,5,.98)', borderBottom: '1px solid var(--b)',
          zIndex: 999, display: 'flex', flexDirection: 'column',
        }}>
          {[
            ['/catalog',   'SHOP'],
            ['/configure', 'CONFIGURE'],
            ['/contact',   'CONTACT'],
            [user ? '/account' : '/login', user ? 'ACCOUNT' : 'LOGIN'],
          ].map(([path, label]) => (
            <Link key={path} to={path}
              onClick={() => setMenuOpen(false)}
              style={{ padding: '16px 24px', borderBottom: '1px solid var(--b)', fontFamily: 'Orbitron, monospace', fontSize: 11, letterSpacing: 3, color: 'var(--t)' }}>
              {label}
            </Link>
          ))}
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

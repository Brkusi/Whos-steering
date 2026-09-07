import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart, useAuth } from '../context';
import CartDrawer from './CartDrawer';
import AnnouncementBar from './AnnouncementBar';
export default function Nav() {
  const {
    count,
    cartOpen,
    setCartOpen
  } = useCart();
  const {
    user
  } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const menuButton = useRef(null);
  useEffect(() => setMenuOpen(false), [location]);
  const links = [['/build', 'Build yours'], ['/catalog', 'Preconfigured'], ['/track-order', 'Track order'], ['/contact', 'Contact']];
  return <>
    <AnnouncementBar />
    <header className="site-header" onKeyDown={e => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    }}>
      <Link className="site-logo" to="/" aria-label="Who's Steering home"><img src="/ws-logo.png" alt="Who's Steering" /></Link>
      <nav className="desktop-links" aria-label="Main navigation">{links.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}{user?.is_admin && <NavLink to="/admin">Admin</NavLink>}</nav>
      <div className="header-actions"><Link className="account-link" to={user ? '/account' : '/login'}>{user ? 'Account' : 'Sign in'}</Link><button className="icon-button cart-trigger" aria-label={`Open cart, ${count} items`} onClick={() => setCartOpen(true)}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M6 7h14l-2 9H8L5 3H2" /><circle cx="9" cy="20" r="1" /><circle cx="17" cy="20" r="1" /></svg>{count > 0 && <span key={count}>{count}</span>}</button><button ref={menuButton} className="icon-button menu-toggle" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? '✕' : '☰'}</button></div>
      {menuOpen && <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation">{links.map(([to, label]) => <NavLink key={to} to={to}>{label}<span aria-hidden="true">↗</span></NavLink>)}<Link to={user ? '/account' : '/login'}>{user ? 'Your account' : 'Sign in'}</Link>{user?.is_admin && <Link to="/admin">Admin dashboard</Link>}</nav>}
    </header><CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
  </>;
}

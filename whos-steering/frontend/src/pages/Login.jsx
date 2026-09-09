import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context';
import './Login.css';

export default function Login() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savePassword, setSavePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLongLoading, setShowLongLoading] = useState(false);

  // Sign in fields
  const [siEmail, setSiEmail] = useState('');
  const [siPass, setSiPass]   = useState('');

  // Register fields
  const [caFirst, setCaFirst]   = useState('');
  const [caLast, setCaLast]     = useState('');
  const [caEmail, setCaEmail]   = useState('');
  const [caPass, setCaPass]     = useState('');
  const [caPass2, setCaPass2]   = useState('');

  // Preload the account chunk while the customer types so a successful login
  // does not have to wait for the next page bundle after authentication.
  useEffect(() => {
    import('./Account').catch(() => {});
  }, []);

  useEffect(() => {
    if (!loading) {
      setShowLongLoading(false);
      return undefined;
    }

    const timer = setTimeout(() => setShowLongLoading(true), 300);
    return () => clearTimeout(timer);
  }, [loading]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(siEmail, siPass);
      if (savePassword && window.PasswordCredential && navigator.credentials?.store) {
        try { await navigator.credentials.store(new window.PasswordCredential({ id: siEmail, password: siPass })); } catch { /* Browser saving is optional; authentication has succeeded. */ }
      }
      nav('/account', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (caPass !== caPass2) { setError('Passwords do not match'); return; }
    setError(''); setLoading(true);
    try {
      await register({ firstName: caFirst, lastName: caLast, email: caEmail, password: caPass });
      nav('/account', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-label="Your account">
        <aside className="auth-story">
          <Link to="/" aria-label="Who's Steering home"><img className="auth-logo" src="/ws-logo.png" alt="Who's Steering" /></Link>
          <p className="auth-eyebrow">YOUR WHEEL. YOUR WAY.</p>
          <h1>Your next drive<br /><span>starts here.</span></h1>
          <p>Keep your builds, orders and every detail in one place.</p>
          <Link className="auth-explore" to="/catalog">EXPLORE WHEELS ↗</Link>
        </aside>
        <div className="login-card" aria-busy={loading}>
          <p className="auth-eyebrow">MY ACCOUNT</p>
          <h2>{tab === 'signin' ? 'Welcome back.' : 'Make it yours.'}</h2>
          <p className="auth-subtitle">{tab === 'signin' ? 'Sign in to pick up where you left off.' : 'Create an account for your next custom build.'}</p>
          <div className="auth-tabs" aria-label="Account options">
            {[['signin','Sign in'],['register','Create account']].map(([key,label]) => <button type="button" key={key} disabled={loading} aria-pressed={tab === key} onClick={() => { setTab(key); setError(''); setShowPassword(false); }}>{label}</button>)}
          </div>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <form onSubmit={tab === 'signin' ? handleSignIn : handleRegister}>
            <fieldset disabled={loading}>
              {tab === 'register' && <div className="auth-names">
                <div><label htmlFor="first-name">First name</label><input className="fi" id="first-name" name="given-name" autoComplete="given-name" value={caFirst} onChange={e => setCaFirst(e.target.value)} placeholder="First name" /></div>
                <div><label htmlFor="last-name">Last name</label><input className="fi" id="last-name" name="family-name" autoComplete="family-name" value={caLast} onChange={e => setCaLast(e.target.value)} placeholder="Last name" /></div>
              </div>}
              <label htmlFor="account-email">Email address</label>
              <input className="fi" id="account-email" name="username" type="email" autoComplete="username" required value={tab === 'signin' ? siEmail : caEmail} onChange={e => tab === 'signin' ? setSiEmail(e.target.value) : setCaEmail(e.target.value)} placeholder="you@example.com" />
              <label htmlFor="account-password">Password</label>
              <div className="auth-password"><input className="fi" id="account-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={tab === 'signin' ? 'current-password' : 'new-password'} required minLength={tab === 'register' ? 8 : undefined} value={tab === 'signin' ? siPass : caPass} onChange={e => tab === 'signin' ? setSiPass(e.target.value) : setCaPass(e.target.value)} aria-describedby={tab === 'register' ? 'password-help' : undefined} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div>
              {tab === 'signin' ? <div className="auth-save"><label><input type="checkbox" checked={savePassword} onChange={e => setSavePassword(e.target.checked)} /> Save password</label><small>Uses your browser’s password manager.</small></div> : <><small id="password-help">Use at least 8 characters.</small><label htmlFor="confirm-password">Confirm password</label><input className="fi" id="confirm-password" name="confirm-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={caPass2} onChange={e => setCaPass2(e.target.value)} /></>}
              <button className="btn auth-submit" type="submit" disabled={loading}>{loading ? 'Connecting…' : tab === 'signin' ? 'SIGN IN →' : 'CREATE ACCOUNT →'}</button>
            </fieldset>
          </form>
          {showLongLoading && <p className="auth-status" role="status">Securely connecting to your account…</p>}
          <p className="auth-help">Need help signing in? <Link to="/contact">Contact us ↗</Link></p>
        </div>
      </section>
    </main>
  );
}

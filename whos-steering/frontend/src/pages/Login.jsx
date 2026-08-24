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

  const inputStyle = { marginBottom: 14 };

  return (
    <div style={{ paddingTop: 88, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'radial-gradient(ellipse at 30% 50%, rgba(232,184,0,.05) 0%, transparent 60%), var(--d)' }}>
      <div className="login-card" aria-busy={loading} style={{ width: 400, maxWidth: '100%', padding: 40, background: 'var(--p)', border: '1px solid var(--b)', margin: '0 16px' }}>

        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div className="ws-logo" style={{ alignItems: 'center' }}>
            <span className="ws-logo-top" style={{ fontSize: 32 }}>WHO'S</span>
            <span className="ws-logo-bot" style={{ fontSize: 13, letterSpacing: 3 }}>STEERING</span>
          </div>
        </div>

        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 28, marginBottom: 4 }}>MY ACCOUNT</div>
        <div style={{ fontSize: 12, color: 'var(--t)', letterSpacing: 1, marginBottom: 20 }}>Sign in or create your account</div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--b)', marginBottom: 24 }}>
          {[['signin','Sign In'],['register','Create Account']].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setError(''); }}
              style={{ flex: 1, padding: '10px 0', background: 'none', border: 'none', borderBottom: tab === key ? '2px solid var(--y)' : '2px solid transparent', color: tab === key ? 'var(--y)' : 'var(--t)', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', transition: 'all .2s', marginBottom: -1 }}>
              {label}
            </button>
          ))}
        </div>

        {error && <div style={{ padding: '10px 14px', background: 'rgba(204,51,0,.1)', border: '1px solid #CC3300', color: '#FF6644', fontSize: 13, marginBottom: 16 }}>{error}</div>}

        {tab === 'signin' ? (
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={inputStyle}>
              <label className="fl">Email</label>
              <input className="fi" type="email" value={siEmail} onChange={e => setSiEmail(e.target.value)} placeholder="your@email.com" required />
            </div>
            <div style={inputStyle}>
              <label className="fl">Password</label>
              <input className="fi" type="password" value={siPass} onChange={e => setSiPass(e.target.value)} placeholder="••••••••" required />
            </div>
            <div style={{ fontSize: 11, color: 'var(--t)', textAlign: 'right', marginBottom: 16, cursor: 'pointer', letterSpacing: 1 }}>Forgot password?</div>
            <button className="btn" type="submit" disabled={loading} style={{ clipPath: 'none', width: '100%' }}>
              {loading ? <><span className="login-button-spinner" aria-hidden="true" /> SIGNING IN...</> : 'SIGN IN'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <label className="fl">First Name</label>
                <input className="fi" type="text" value={caFirst} onChange={e => setCaFirst(e.target.value)} placeholder="First" />
              </div>
              <div>
                <label className="fl">Last Name</label>
                <input className="fi" type="text" value={caLast} onChange={e => setCaLast(e.target.value)} placeholder="Last" />
              </div>
            </div>
            <div style={inputStyle}>
              <label className="fl">Email <span className="req">*</span></label>
              <input className="fi" type="email" value={caEmail} onChange={e => setCaEmail(e.target.value)} placeholder="your@email.com" required />
            </div>
            <div style={inputStyle}>
              <label className="fl">Password <span className="req">*</span></label>
              <input className="fi" type="password" value={caPass} onChange={e => setCaPass(e.target.value)} placeholder="Min 8 characters" required />
            </div>
            <div style={inputStyle}>
              <label className="fl">Confirm Password <span className="req">*</span></label>
              <input className="fi" type="password" value={caPass2} onChange={e => setCaPass2(e.target.value)} placeholder="••••••••" required />
            </div>
            <button className="btn" type="submit" disabled={loading} style={{ clipPath: 'none', width: '100%', marginTop: 4 }}>
              {loading ? <><span className="login-button-spinner" aria-hidden="true" /> CREATING ACCOUNT...</> : 'CREATE ACCOUNT'}
            </button>
          </form>
        )}
      </div>

      {showLongLoading && (
        <div className="login-wait-overlay" role="status" aria-live="polite">
          <div className="login-wait-panel">
            <div className="login-wait-spinner" aria-hidden="true"><span>→</span></div>
            <div className="login-wait-title">{tab === 'signin' ? 'SIGNING YOU IN' : 'CREATING YOUR ACCOUNT'}</div>
            <div className="login-wait-copy">Securely connecting to your account…</div>
          </div>
        </div>
      )}
    </div>
  );
}

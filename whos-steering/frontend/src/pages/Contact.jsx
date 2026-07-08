import { useState } from 'react';
import { Link } from 'react-router-dom';

const EMAILJS_SERVICE  = 'service_b5oz67d';
const EMAILJS_TEMPLATE = 'template_akep1pv';
const EMAILJS_PUBLIC   = 'Q47wFG6Du93lcGe_O';

// Load EmailJS script once
let emailjsLoaded = false;
function loadEmailJS() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) { resolve(window.emailjs); return; }
    if (emailjsLoaded) {
      const check = setInterval(() => {
        if (window.emailjs) { clearInterval(check); resolve(window.emailjs); }
      }, 100);
      return;
    }
    emailjsLoaded = true;
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload = () => { window.emailjs.init(EMAILJS_PUBLIC); resolve(window.emailjs); };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', vehicle: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: false })); setSendError(''); };

  const handleSend = async () => {
    const e = {};
    if (!form.email) e.email = true;
    if (!form.message) e.message = true;
    if (Object.keys(e).length) { setErrors(e); return; }

    setSending(true);
    setSendError('');

    try {
      const ejs = await loadEmailJS();
      const result = await ejs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
        subject:    `Who's Steering Inquiry${form.vehicle ? ' - ' + form.vehicle : ''}`,
        from_name:  form.name || 'Website Visitor',
        from_email: form.email,
        email:      form.email,
        name:       form.name || 'Website Visitor',
        vehicle:    form.vehicle || 'Not specified',
        message:    form.message,
      });
      console.log('EmailJS result:', result);
      setSent(true);
    } catch (err) {
      console.error('EmailJS error:', err);
      setSendError(`Failed to send (${err?.text || err?.message || 'unknown error'}). Please email us directly at service@whossteering.com`);
    } finally {
      setSending(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (sent) {
    return (
      <div style={{ paddingTop: 120, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 30% 50%, rgba(232,184,0,.06) 0%, transparent 60%), var(--d)' }}>
        <div style={{ maxWidth: 520, width: '100%', padding: 52, background: 'var(--p)', border: '1px solid var(--b)', margin: '0 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: 'var(--y)', marginBottom: 10 }}>MESSAGE SENT</div>
          <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 44, marginBottom: 16 }}>WE'LL BE IN TOUCH!</div>
          <div style={{ fontSize: 14, color: 'var(--t)', lineHeight: 1.9, marginBottom: 28 }}>
            Your message has been delivered to<br />
            <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, color: 'var(--y)', letterSpacing: 2 }}>service@whossteering.com</span><br /><br />
            We typically respond within <strong style={{ color: 'var(--w)' }}>24 hours</strong>.<br />
            In the meantime, feel free to browse our catalog.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn" style={{ clipPath: 'none' }}
              onClick={() => { setSent(false); setForm({ name: '', email: '', vehicle: '', message: '' }); }}>
              SEND ANOTHER
            </button>
            <Link to="/catalog"><button className="btn-outline sm">SHOP CATALOG</button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 120, minHeight: '100vh' }}>
      <div style={{ padding: '50px 40px 32px', borderBottom: '1px solid var(--b)', background: 'linear-gradient(180deg,rgba(232,184,0,.04) 0%,transparent 100%)' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: 'var(--y)', marginBottom: 8 }}>Get In Touch</div>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 52, letterSpacing: 2 }}>MESSAGE US</div>
      </div>

      <div style={{ padding: '48px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, maxWidth: 1100, margin: '0 auto' }}>
        {/* Left */}
        <div>
          <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 52, lineHeight: 1, marginBottom: 20 }}>
            LET'S BUILD<br />YOUR<br /><span style={{ color: 'var(--y)' }}>WHEEL</span>
          </div>
          <div style={{ color: 'var(--t)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
            Questions about fitment, materials, or a custom build? Reach out — we respond within 24 hours.
          </div>
          {[['✉','service@whossteering.com'],['⏱','3–4 Week Build · Made to Order'],['🛡','6 Month Manufacturer Warranty'],['🚗','BMW & Audi Specialists']].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <span style={{ color: 'var(--y)', fontSize: 18, width: 24, flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: 14, color: 'var(--t)' }}>{text}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--b)', paddingTop: 20, marginTop: 8 }}>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: 3, color: 'var(--y)', textTransform: 'uppercase', marginBottom: 12 }}>Materials & Craftsmanship</div>
            {['Carbon fibre base engineered for superior strength, weave consistency, and surface finish','High quality leather selected for luxury feel, durability, and long-term wear','Advanced 3D modelling for precise fitment and OEM-correct ergonomics','Hand stitching by skilled craftsmen for a tailored, premium finish','Environmentally conscious production processes implemented where possible','Secure protective packaging to safeguard premium materials during transport','Strict quality control standards throughout the entire build process'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 5, height: 5, background: 'var(--y)', flexShrink: 0, marginTop: 6 }} />
                <span style={{ fontSize: 12, color: 'var(--t)', lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div>
          <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 28, marginBottom: 20 }}>SEND A MESSAGE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="fl">Your Name</label>
              <input className="fi" type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Name" />
            </div>
            <div>
              <label className="fl">Email <span className="req">*</span></label>
              <input className={`fi${errors.email ? ' error' : ''}`} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" />
              {errors.email && <div className="err-msg">Email is required</div>}
            </div>
            <div>
              <label className="fl">Vehicle</label>
              <input className="fi" type="text" value={form.vehicle} onChange={e => set('vehicle', e.target.value)} placeholder="2023 Audi S4, 2021 BMW M4..." />
            </div>
            <div>
              <label className="fl">Message <span className="req">*</span></label>
              <textarea className={`fi${errors.message ? ' error' : ''}`} value={form.message} onChange={e => set('message', e.target.value)} placeholder="Tell us about your build..." rows={6} style={{ resize: 'vertical' }} />
              {errors.message && <div className="err-msg">Message is required</div>}
            </div>

            {sendError && (
              <div style={{ padding: '10px 14px', background: 'rgba(204,51,0,.1)', border: '1px solid #CC3300', color: '#FF6644', fontSize: 13, lineHeight: 1.5 }}>
                {sendError}
              </div>
            )}

            <button className="btn" style={{ clipPath: 'none', alignSelf: 'flex-start' }} onClick={handleSend} disabled={sending}>
              {sending ? 'SENDING...' : 'SEND MESSAGE ✉'}
            </button>
            <div style={{ fontSize: 11, color: '#444', letterSpacing: 1 }}>
              All inquiries go directly to <span style={{ color: 'var(--t)' }}>service@whossteering.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

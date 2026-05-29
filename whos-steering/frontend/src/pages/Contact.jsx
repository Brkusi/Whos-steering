import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', vehicle: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: false })); };

  const handleSend = () => {
    const e = {};
    if (!form.email) e.email = true;
    if (!form.message) e.message = true;
    if (Object.keys(e).length) { setErrors(e); return; }

    const subject = encodeURIComponent(`Who's Steering Inquiry${form.vehicle ? ' - ' + form.vehicle : ''}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}${form.vehicle ? '\nVehicle: ' + form.vehicle : ''}\n\n${form.message}`);
    window.open(`mailto:service@whossteering.com?subject=${subject}&body=${body}`);
    setSent(true);
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (sent) {
    return (
      <div style={{ paddingTop: 88, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 30% 50%, rgba(232,184,0,.05) 0%, transparent 60%), var(--d)' }}>
        <div style={{ maxWidth: 480, width: '100%', padding: 48, background: 'var(--p)', border: '1px solid var(--b)', margin: '0 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✉️</div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: 'var(--y)', marginBottom: 10 }}>MESSAGE SENT</div>
          <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 38, marginBottom: 16 }}>WE'LL BE IN TOUCH!</div>
          <div style={{ fontSize: 14, color: 'var(--t)', lineHeight: 1.8, marginBottom: 28 }}>
            Your message has been sent to{' '}
            <a href="mailto:service@whossteering.com" style={{ color: 'var(--y)', textDecoration: 'none' }}>service@whossteering.com</a>.
            <br />We typically respond within 24 hours.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn" style={{ clipPath: 'none' }} onClick={() => setSent(false)}>SEND ANOTHER</button>
            <a href="/catalog"><button className="btn-outline sm">SHOP CATALOG</button></a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 88, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '50px 40px 32px', borderBottom: '1px solid var(--b)', background: 'linear-gradient(180deg,rgba(232,184,0,.04) 0%,transparent 100%)' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: 'var(--y)', marginBottom: 8 }}>Get In Touch</div>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 52, letterSpacing: 2 }}>MESSAGE US</div>
      </div>

      <div style={{ padding: '48px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, maxWidth: 1100, margin: '0 auto' }}>
        {/* Left info */}
        <div>
          <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 48, lineHeight: 1, marginBottom: 20 }}>
            LET'S BUILD<br />YOUR<br /><span style={{ color: 'var(--y)' }}>WHEEL</span>
          </div>
          <div style={{ color: 'var(--t)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
            Questions about fitment, materials, or a custom build? Reach out — we respond within 24 hours.
          </div>

          {/* Materials & Craftsmanship */}
          <div style={{ borderTop: '1px solid var(--b)', paddingTop: 20, marginBottom: 20 }}>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: 3, color: 'var(--y)', textTransform: 'uppercase', marginBottom: 12 }}>Materials & Craftsmanship</div>
            {[
              'Carbon fibre base engineered for superior strength, weave consistency, and surface finish',
              'High quality leather selected for luxury feel, durability, and long-term wear',
              'Advanced 3D modelling for precise fitment and OEM-correct ergonomics',
              'Hand stitching by skilled craftsmen for a tailored, premium finish',
              'Environmentally conscious production processes implemented where possible',
              'Secure protective packaging to safeguard premium materials during transport',
              'Strict quality control standards throughout the entire build process',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 5, height: 5, background: 'var(--y)', flexShrink: 0, marginTop: 5 }} />
                <span style={{ fontSize: 12, color: 'var(--t)', lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>

          {[
            ['✉', 'service@whossteering.com'],
            ['⏱', '3–5 Week Build · Made to Order'],
            ['🛡', '6 Month Manufacturer Warranty'],
            ['🚗', 'BMW & Audi Specialists'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <span style={{ color: 'var(--y)', fontSize: 18, width: 24, flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: 13, color: 'var(--t)' }}>{text}</span>
            </div>
          ))}
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
            <button className="btn" style={{ clipPath: 'none', alignSelf: 'flex-start' }} onClick={handleSend}>
              SEND MESSAGE ✉
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

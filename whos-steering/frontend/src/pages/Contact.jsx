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
    window.location.href = `mailto:service@whossteering.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

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
          <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 52, lineHeight: 1, marginBottom: 20 }}>
            LET'S BUILD<br />YOUR<br /><span style={{ color: 'var(--y)' }}>WHEEL</span>
          </div>
          <div style={{ color: 'var(--t)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
            Questions about fitment, materials, or a custom build? Reach out — we respond within 24 hours.
          </div>
          {[
            ['✉', 'service@whossteering.com'],
            ['⏱', '3–5 Week Build · Made to Order'],
            ['🛡', '6 Month Manufacturer Warranty'],
            ['🚗', 'BMW & Audi Specialists'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <span style={{ color: 'var(--y)', fontSize: 18, width: 24, flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: 14, color: 'var(--t)' }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Right form */}
        <div>
          <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 28, marginBottom: 20 }}>SEND A MESSAGE</div>

          {sent && (
            <div style={{ padding: '12px 16px', background: 'rgba(61,184,90,.1)', border: '1px solid #3DB85A', color: '#3DB85A', fontSize: 13, marginBottom: 16 }}>
              ✓ Your email client should open with the message pre-filled!
            </div>
          )}

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
              <input className="fi" type="text" value={form.vehicle} onChange={e => set('vehicle', e.target.value)} placeholder="2013 Audi A6 C7..." />
            </div>
            <div>
              <label className="fl">Message <span className="req">*</span></label>
              <textarea className={`fi${errors.message ? ' error' : ''}`} value={form.message} onChange={e => set('message', e.target.value)} placeholder="Tell us about your build..." rows={5} style={{ resize: 'vertical' }} />
              {errors.message && <div className="err-msg">Message is required</div>}
            </div>
            <button className="btn" style={{ clipPath: 'none', alignSelf: 'flex-start' }} onClick={handleSend}>
              SEND MESSAGE ✉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

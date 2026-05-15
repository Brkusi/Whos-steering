import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import WheelPreview from '../components/WheelPreview';
import { COLORS, MATS, TRIS, DEFAULT_CONFIG, colorName } from '../lib/data';
import { calcPrice, apiFetch } from '../lib/api';
import { useCart } from '../context';

function ColorGrid({ onSelect, selected }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 6 }}>
      {COLORS.map(c => (
        <div key={c.h} className={`csw${selected === c.h ? ' on' : ''}`}
          style={{ background: c.h }} title={c.n} onClick={() => onSelect(c.h)} />
      ))}
    </div>
  );
}

function MatRow({ options, selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
      {options.map(m => (
        <button key={m.n} className={`ob${selected === m.n ? ' on' : ''}`} onClick={() => onSelect(m.n)}>{m.n}</button>
      ))}
    </div>
  );
}

function Sect({ label, value, children }) {
  return (
    <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--b)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 15, letterSpacing: 2, textTransform: 'uppercase' }}>{label}</span>
        <span style={{ color: '#444', fontSize: 13 }}>|</span>
        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--y)', letterSpacing: .5 }}>{value}</span>
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, sub, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1A1A1A', flexWrap: 'wrap', gap: 8 }}>
      <div>
        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: 'var(--y)', letterSpacing: .5 }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex' }}>
        {['YES','NO'].map((v, i) => (
          <button key={v} onClick={() => onChange(v === 'YES')}
            style={{ padding: '6px 16px', border: '1px solid var(--b)', background: value === (v === 'YES') ? 'var(--y)' : 'transparent', color: value === (v === 'YES') ? '#000' : 'var(--t)', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: 1, transition: 'all .2s', borderRight: i === 0 ? 'none' : undefined }}>
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Configure() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { addItem } = useCart();
  const [rules, setRules] = useState({});
  const [toast, setToast] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const [cfg, setCfg] = useState({
    ...DEFAULT_CONFIG,
    brand: params.get('brand') || 'BMW',
  });

  const set = useCallback((key, val) => setCfg(prev => ({ ...prev, [key]: val })), []);

  useEffect(() => {
    apiFetch('/api/products/pricing/rules').then(setRules).catch(console.error);
  }, []);

  const price = calcPrice(cfg, rules);

  // Stripe mode switching clears incompatible selections
  const setStripeMode = (mode) => {
    setCfg(prev => ({
      ...prev, stripeMode: mode,
      stripeColor: mode !== 'single' ? null : prev.stripeColor,
      triKey: mode !== 'tri' ? null : prev.triKey,
    }));
  };

  // Brand switch resets vehicle-specific fields
  const setBrand = (brand) => {
    setCfg(prev => ({ ...DEFAULT_CONFIG, brand }));
    setPhoto(null);
    setErrors({});
  };

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setPhoto(preview);
    setPhotoUploading(true);
    try {
      const fd = new FormData(); fd.append('photo', file);
      const token = localStorage.getItem('ws_token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/upload/wheel-photo`, {
        method: 'POST', body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.url) set('photoUrl', data.url);
    } catch { /* non-blocking */ }
    finally { setPhotoUploading(false); }
  };

  const validate = () => {
    const e = {};
    if (!cfg.vehicleYear) e.year = true;
    if (!cfg.vehicleModel) e.model = true;
    if (!photo) e.photo = true;
    if (cfg.stripeMode === 'single' && !cfg.stripeColor) { showToast('SELECT A STRIPE COLOR'); return false; }
    if (cfg.stripeMode === 'tri' && !cfg.triKey) { showToast('SELECT A TRI-COLOR OPTION'); return false; }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2400); };

  const stripeLabel = cfg.stripeMode === 'none' ? 'None'
    : cfg.stripeMode === 'tri' ? (cfg.triKey ? TRIS[cfg.triKey].lbl + ' Tri' : 'Tri-Color')
    : cfg.stripeColor ? colorName(cfg.stripeColor) : '—';

  const sideMats = cfg.wheelStyle === 'Sport'
    ? MATS.filter(m => !['Carbon Fiber','Forged Carbon'].includes(m.n))
    : MATS;

  return (
    <div style={{ paddingTop: 88, minHeight: '100vh', background: 'var(--d)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 88px)' }}>

        {/* LEFT: Wheel preview */}
        <div style={{ position: 'sticky', top: 88, height: 'calc(100vh - 88px)', background: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '28px 24px', borderRight: '1px solid var(--b)', overflow: 'hidden' }}>
          <WheelPreview config={cfg} size={Math.min(420, window.innerWidth * 0.42)} />
          <div style={{ paddingTop: 12, borderTop: '1px solid var(--b)', width: '100%', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: 3, color: 'var(--t)', textTransform: 'uppercase' }}>Estimated Total</div>
            <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 62, color: 'var(--y)', lineHeight: 1 }}>${price.toFixed(2)}</div>
            <div style={{ fontSize: 10, color: 'var(--t)', letterSpacing: 1 }}>Final price confirmed at checkout</div>
          </div>
          <button className="btn" style={{ width: '100%', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', marginTop: 20, padding: 18, fontSize: 13, letterSpacing: 3 }}
            onClick={() => validate() && setShowReview(true)}>
            + ADD TO CART
          </button>
        </div>

        {/* RIGHT: Options */}
        <div style={{ background: 'var(--d)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid var(--b)', background: 'var(--d)', position: 'sticky', top: 0, zIndex: 10 }}>
            <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 30, letterSpacing: 2 }}>CUSTOMIZATION</div>
          </div>

          {/* Brand */}
          <Sect label="Vehicle" value={cfg.vehicleYear && cfg.vehicleModel ? `${cfg.vehicleYear} ${cfg.brand} ${cfg.vehicleModel}` : '—'}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {['BMW','AUDI'].map(b => (
                <button key={b} className={`ob${cfg.brand === b ? ' on' : ''}`} style={{ fontSize: 10, padding: '5px 16px' }} onClick={() => setBrand(b)}>{b}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label className="fl">Year <span className="req">*</span></label>
                <input className={`fi${errors.year ? ' error' : ''}`} value={cfg.vehicleYear} onChange={e => { set('vehicleYear', e.target.value); setErrors(p => ({...p, year: false})); }} placeholder="e.g. 2022" />
                {errors.year && <div className="err-msg">Required</div>}
              </div>
              <div>
                <label className="fl">Model <span className="req">*</span></label>
                <input className={`fi${errors.model ? ' error' : ''}`} value={cfg.vehicleModel} onChange={e => { set('vehicleModel', e.target.value); setErrors(p => ({...p, model: false})); }} placeholder="e.g. M4, 540i" />
                {errors.model && <div className="err-msg">Required</div>}
              </div>
            </div>
            {/* Photo upload */}
            <label className="fl">Current Wheel Photo <span className="req">*</span></label>
            <label style={{ display: 'block', border: `2px dashed ${errors.photo ? '#CC3300' : photo ? '#3DB85A' : 'var(--b)'}`, padding: 16, textAlign: 'center', cursor: 'pointer', transition: 'all .2s', marginTop: 6, background: photo ? 'rgba(61,184,90,.04)' : 'transparent' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
              {photo ? <img src={photo} alt="wheel" style={{ width: '100%', maxHeight: 110, objectFit: 'cover' }} />
                : <><div style={{ fontSize: 20, opacity: .4, marginBottom: 3 }}>📷</div>
                   <div style={{ fontSize: 12, color: 'var(--t)' }}>{photoUploading ? 'Uploading...' : 'Drop or click to upload'}</div>
                   <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>JPG / PNG — required for fitment</div></>}
            </label>
            {errors.photo && <div className="err-msg">A photo of your current wheel is required</div>}
          </Sect>

          {/* Stripe */}
          <Sect label="Top Stripe" value={stripeLabel}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
              {['none','single','tri'].map(m => (
                <button key={m} className={`ob${cfg.stripeMode === m ? ' on' : ''}`} onClick={() => setStripeMode(m)}>
                  {m === 'none' ? 'No Stripe' : m === 'single' ? 'Single Color' : 'Tri-Color'}
                </button>
              ))}
            </div>
            {cfg.stripeMode === 'single' && (
              <><div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Stripe Color</div>
              <ColorGrid selected={cfg.stripeColor} onSelect={h => set('stripeColor', h)} /></>
            )}
            {cfg.stripeMode === 'tri' && (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 6 }}>
                {Object.entries(TRIS)
                  .filter(([k]) => cfg.brand === 'BMW' ? k === 'bmw' : k === 'germany')
                  .map(([k, opt]) => (
                    <div key={k} onClick={() => set('triKey', k)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: `conic-gradient(${opt.c1} 0deg 120deg, ${opt.c2} 120deg 240deg, ${opt.c3} 240deg 360deg)`, border: `2px solid ${cfg.triKey === k ? 'var(--y)' : 'transparent'}`, boxShadow: cfg.triKey === k ? '0 0 0 2px var(--y)' : 'none' }} />
                      <div style={{ fontSize: 10, color: 'var(--t)', letterSpacing: 1 }}>{opt.lbl}</div>
                    </div>
                  ))}
              </div>
            )}
          </Sect>

          {/* Wheel Style */}
          <Sect label="Wheel Style" value={cfg.wheelStyle === 'Standard' ? 'Comfort' : 'Sport'}>
            <MatRow options={[{n:'Standard'},{n:'Sport'}]} selected={cfg.wheelStyle} onSelect={v => set('wheelStyle', v)} />
          </Sect>

          {/* Paddles */}
          <Sect label="Paddle Shifters" value={cfg.paddleShifters}>
            <MatRow options={[{n:'Standard'},{n:'Magnetic'}]} selected={cfg.paddleShifters} onSelect={v => set('paddleShifters', v)} />
          </Sect>

          {/* Top/Bottom Mat */}
          <Sect label="Top and Bottom Grip Material" value={cfg.topBottomMat}>
            <MatRow options={MATS} selected={cfg.topBottomMat} onSelect={v => { set('topBottomMat', v); set('topBottomCol', null); }} />
            {MATS.find(m => m.n === cfg.topBottomMat)?.col && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Color: {colorName(cfg.topBottomCol) || '—'}</div>
                <ColorGrid selected={cfg.topBottomCol} onSelect={h => set('topBottomCol', h)} />
              </div>
            )}
          </Sect>

          {/* Side Mat */}
          <Sect label="Side Grip Material" value={cfg.sideMat}>
            <MatRow options={sideMats} selected={cfg.sideMat} onSelect={v => { set('sideMat', v); set('sideCol', null); }} />
            {MATS.find(m => m.n === cfg.sideMat)?.col && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Color: {colorName(cfg.sideCol) || '—'}</div>
                <ColorGrid selected={cfg.sideCol} onSelect={h => set('sideCol', h)} />
              </div>
            )}
          </Sect>

          {/* AUDI-only: badge & trim */}
          {cfg.brand === 'AUDI' && (
            <>
              <Sect label="Lower Badge" value={cfg.audiBadge}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['RS','S'].map(b => (
                    <div key={b} className={`ob${cfg.audiBadge === b ? ' on' : ''}`}
                      style={{ flex: 1, padding: 14, textAlign: 'center', fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 26, letterSpacing: 3, cursor: 'pointer' }}
                      onClick={() => set('audiBadge', b)}>{b}</div>
                  ))}
                </div>
              </Sect>
              <Sect label="Outer Trim Color" value={colorName(cfg.outerTrimCol)}>
                <ColorGrid selected={cfg.outerTrimCol} onSelect={h => set('outerTrimCol', h)} />
              </Sect>
              <Sect label="Inner Trim Color" value={colorName(cfg.innerTrimCol)}>
                <ColorGrid selected={cfg.innerTrimCol} onSelect={h => set('innerTrimCol', h)} />
              </Sect>
            </>
          )}

          {/* Options */}
          <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--b)' }}>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 15, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Options</div>
            <Toggle label="Airbag Compatible" sub="+$75.00" value={cfg.airbagCompat} onChange={v => set('airbagCompat', v)} />
            <Toggle label="Heated Steering" sub={cfg.brand === 'AUDI' ? '+$25.00' : ''} value={cfg.heated} onChange={v => set('heated', v)} />
            <Toggle label="Lane Assist Compatible" value={cfg.laneAssist} onChange={v => set('laneAssist', v)} />
          </div>
        </div>
      </div>

      {/* Review overlay */}
      {showReview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
          <div style={{ background: 'var(--p)', border: '1px solid var(--b)', padding: 32, width: 480, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: 'var(--y)', marginBottom: 4 }}>REVIEW YOUR BUILD</div>
            <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 32, marginBottom: 20 }}>LOOKS GOOD?</div>
            {[
              ['Brand', cfg.brand],
              ['Vehicle', `${cfg.vehicleYear} ${cfg.brand} ${cfg.vehicleModel}`],
              ['Wheel Style', cfg.wheelStyle === 'Standard' ? 'Comfort' : 'Sport'],
              ['Paddle Shifters', cfg.paddleShifters],
              ['Top & Bottom', cfg.topBottomMat + (cfg.topBottomCol ? ' — ' + colorName(cfg.topBottomCol) : '')],
              ['Side Grip', cfg.sideMat + (cfg.sideCol ? ' — ' + colorName(cfg.sideCol) : '')],
              ['Stripe', stripeLabel],
              ['Airbag', cfg.airbagCompat ? 'Yes' : 'No'],
              ['Heated', cfg.heated ? 'Yes' : 'No'],
              ['Lane Assist', cfg.laneAssist ? 'Yes' : 'No'],
              ['Estimated Total', `$${price.toFixed(2)}`],
            ].map(([k,v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #1A1A1A' }}>
                <span style={{ fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: '#888' }}>{k}</span>
                <span style={{ fontSize: k === 'Estimated Total' ? 17 : 14, fontWeight: 700, color: k === 'Estimated Total' ? 'var(--y)' : 'var(--w)' }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn" style={{ clipPath: 'none', flex: 1 }} onClick={() => {
                addItem({
                  name: `${cfg.brand} Custom Wheel`,
                  detail: `${cfg.vehicleYear} ${cfg.brand} ${cfg.vehicleModel} · ${cfg.wheelStyle} · ${cfg.topBottomMat}`,
                  price, config: cfg,
                });
                setShowReview(false);
                showToast('ADDED TO CART');
              }}>LOOKS PERFECT</button>
              <button className="btn-outline sm" onClick={() => setShowReview(false)}>MAKE CHANGES</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>
    </div>
  );
}

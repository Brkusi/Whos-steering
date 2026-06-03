import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import WheelPreview from '../components/WheelPreview';
import {
  COLORS, MATS, TRIS, DEFAULT_CONFIG, colorName,
  STRIPE_CONCEPTS, STITCH_COLORS,
  CLASSIC_CARBON_COLORS, FORGED_CARBON_COLORS, HONEYCOMB_CARBON_COLORS,
} from '../lib/data';
import { calcPrice, apiFetch } from '../lib/api';
import { useCart } from '../context';

function Sect({ label, value, children, badge }) {
  return (
    <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--b)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 15, letterSpacing: 2, textTransform: 'uppercase' }}>{label}</span>
        {badge && <span style={{ background: 'var(--y)', color: '#000', fontFamily: 'Orbitron, monospace', fontSize: 8, fontWeight: 700, padding: '2px 8px', letterSpacing: 2 }}>{badge}</span>}
        {value && <><span style={{ color: '#444', fontSize: 13 }}>|</span>
        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--y)', letterSpacing: .5 }}>{value}</span></>}
      </div>
      {children}
    </div>
  );
}

function OptionRow({ options, selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
      {options.map(o => (
        <button key={o} className={`ob${selected === o ? ' on' : ''}`} onClick={() => onSelect(o)}>{o}</button>
      ))}
    </div>
  );
}

function ColorGrid({ colors, selected, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 8 }}>
      {colors.map(c => (
        <div key={c.h} className={`csw${selected === c.h ? ' on' : ''}`}
          style={{ background: c.h, aspectRatio: 1, borderRadius: 3, cursor: 'pointer', border: `2px solid ${selected === c.h ? 'var(--y)' : 'transparent'}`, transition: 'transform .15s, border-color .15s', boxShadow: selected === c.h ? '0 0 0 1px var(--y)' : 'none' }}
          title={c.n} onClick={() => onSelect(c.h)} />
      ))}
    </div>
  );
}

function CustomColorInput({ label, value, onChange }) {
  return (
    <div style={{ marginTop: 10 }}>
      <label className="fl">{label || 'Type Any Color:'}</label>
      <input className="fi" type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder="e.g. Midnight Blue, Olive Green, RAL 9005..." style={{ marginTop: 4 }} />
    </div>
  );
}

function Toggle({ label, sub, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1A1A1A', flexWrap: 'wrap', gap: 8 }}>
      <div style={{ flex: 1, paddingRight: 12 }}>
        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: 'var(--y)', letterSpacing: .5 }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', flexShrink: 0 }}>
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

function StripeConcept({ concept, selected, onSelect }) {
  const { id, stripes, tri } = concept;
  return (
    <div onClick={() => onSelect(id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
      <div style={{ width: 64, height: 40, background: '#111', border: `2px solid ${selected === id ? 'var(--y)' : '#2A2A2A'}`, borderRadius: 4, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: selected === id ? '0 0 0 1px var(--y)' : 'none' }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ position: 'absolute', left: i * 9, top: 0, width: 5, height: '100%', background: 'rgba(255,255,255,.03)', transform: 'skewX(-10deg)' }} />
        ))}
        {stripes.length === 0 ? (
          <div style={{ fontSize: 9, color: '#555', letterSpacing: 1 }}>NONE</div>
        ) : tri ? (
          <div style={{ display: 'flex', height: '100%', width: 18 }}>
            {stripes.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
          </div>
        ) : (
          stripes.map((c, i) => (
            <div key={i} style={{ position: 'absolute', left: '50%', transform: `translateX(${i * 6 - (stripes.length - 1) * 3}px)`, width: 5, height: '100%', background: c }} />
          ))
        )}
      </div>
      <div style={{ fontSize: 9, color: selected === id ? 'var(--y)' : 'var(--t)', letterSpacing: 1, textAlign: 'center', maxWidth: 64 }}>{id}</div>
    </div>
  );
}

function CarbonColorGrid({ colors, selected, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
      {colors.map(c => (
        <div key={c.h} onClick={() => onSelect(c.h)}
          style={{ cursor: 'pointer', border: `2px solid ${selected === c.h ? 'var(--y)' : '#2A2A2A'}`, borderRadius: 4, overflow: 'hidden', boxShadow: selected === c.h ? '0 0 0 1px var(--y)' : 'none', transition: 'border-color .15s' }}>
          <div style={{ background: c.h, height: 44, position: 'relative', overflow: 'hidden' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ position: 'absolute', left: i * 12, top: 0, width: 7, height: '100%', background: 'rgba(255,255,255,.04)', transform: 'skewX(-12deg)' }} />
            ))}
          </div>
          <div style={{ padding: '4px 6px', background: '#111', fontSize: 9, color: selected === c.h ? 'var(--y)' : 'var(--t)', letterSpacing: .5, textAlign: 'center', lineHeight: 1.3 }}>{c.n}</div>
        </div>
      ))}
    </div>
  );
}

function MatSection({ label, matKey, colKey, carbonColKey, customColKey, cfg, set }) {
  const mat = cfg[matKey];
  const selectedMat = MATS.find(m => m.n === mat);
  const isCarbon = selectedMat?.carbon;
  const cType = selectedMat?.cType;
  const carbonColors = cType === 'classic' ? CLASSIC_CARBON_COLORS : cType === 'forged' ? FORGED_CARBON_COLORS : HONEYCOMB_CARBON_COLORS;

  return (
    <Sect label={label} value={mat}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
        {MATS.map(m => (
          <button key={m.n} className={`ob${mat === m.n ? ' on' : ''}`}
            onClick={() => { set(matKey, m.n); set(colKey, null); set(carbonColKey, null); set(customColKey, ''); }}>
            {m.n}
          </button>
        ))}
      </div>
      {isCarbon ? (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4, color: 'var(--t)' }}>
            {cType === 'classic' ? 'Classic Carbon Color' : cType === 'forged' ? 'Forged Carbon Flakes' : 'Honeycomb Carbon Color'}
          </div>
          <CarbonColorGrid colors={carbonColors} selected={cfg[carbonColKey]} onSelect={v => set(carbonColKey, v)} />
          <CustomColorInput label="Type Any Color:" value={cfg[customColKey]} onChange={v => set(customColKey, v)} />
        </>
      ) : selectedMat?.col ? (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4, color: 'var(--t)' }}>
            Color: {colorName(cfg[colKey]) || (cfg[customColKey] ? cfg[customColKey] : '—')}
          </div>
          <ColorGrid colors={COLORS} selected={cfg[colKey]} onSelect={v => { set(colKey, v); set(customColKey, ''); }} />
          <CustomColorInput label="Type Any Color:" value={cfg[customColKey]} onChange={v => { set(customColKey, v); set(colKey, null); }} />
        </>
      ) : null}
    </Sect>
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

  const setBrand = (brand) => {
    setCfg({ ...DEFAULT_CONFIG, brand });
    setPhoto(null);
    setErrors({});
  };

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const token = localStorage.getItem('ws_token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/upload/wheel-photo`, {
        method: 'POST', body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.url) set('photoUrl', data.url);
    } catch {}
    finally { setPhotoUploading(false); }
  };

  const validate = () => {
    const e = {};
    if (!cfg.vehicleYear) e.year = true;
    if (!cfg.vehicleModel) e.model = true;
    if (!photo) e.photo = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2400); };

  const selectedStripeConcept = STRIPE_CONCEPTS.find(s => s.id === cfg.stripeConceptId) || STRIPE_CONCEPTS[0];

  const buildSummary = () => {
    return [
      ['Brand',            cfg.brand],
      ['Vehicle',          `${cfg.vehicleYear} ${cfg.brand} ${cfg.vehicleModel}`],
      ['Wheel Style',      cfg.wheelStyle === 'Standard' ? 'Comfort' : 'Sport'],
      ['Paddle Shifters',  cfg.paddleShifters],
      ['Top/Bottom',       cfg.topBottomMat + (cfg.topBottomCol ? ' · ' + colorName(cfg.topBottomCol) : '') + (cfg.topBottomCustomColor ? ' · ' + cfg.topBottomCustomColor : '')],
      ['Side Grip',        cfg.sideMat + (cfg.sideCol ? ' · ' + colorName(cfg.sideCol) : '') + (cfg.sideCustomColor ? ' · ' + cfg.sideCustomColor : '')],
      ['Stripe',           selectedStripeConcept.label],
      ['Stitch Color',     cfg.stitchColor ? colorName(cfg.stitchColor) : cfg.stitchCustomColor || 'None'],
      ['Airbag Cover',     cfg.airbagCompat ? 'Yes (+$50)' : 'No'],
      ['Full Airbag Upgrade', cfg.airbagUpgrade ? 'Yes (+$25)' : 'No'],
      ['Heated',           cfg.heated ? 'Yes' : 'No'],
      ['Lane Assist',      cfg.laneAssist ? 'Yes' : 'No'],
      cfg.brand === 'AUDI' ? ['Audi Badge', cfg.audiBadge] : null,
      ['Notes',            cfg.customNotes || 'None'],
      ['Est. Price',       `$${price.toFixed(2)}`],
    ].filter(Boolean);
  };

  const isAudi = cfg.brand === 'AUDI';

  return (
    <div style={{ paddingTop: 88, minHeight: '100vh', background: 'var(--d)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', minHeight: 'calc(100vh - 88px)' }}>

        {/* LEFT: Preview */}
        <div style={{
          position: window.innerWidth < 768 ? 'relative' : 'sticky',
          top: 88,
          height: window.innerWidth < 768 ? 'auto' : 'calc(100vh - 88px)',
          background: '#111',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 16, padding: '28px 24px',
          borderRight: '1px solid var(--b)', overflow: 'hidden',
          order: window.innerWidth < 768 ? 2 : 1,
        }}>
          <WheelPreview config={cfg} size={Math.min(360, window.innerWidth * 0.4)} />
          <div style={{ paddingTop: 12, borderTop: '1px solid var(--b)', width: '100%', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: 3, color: 'var(--t)', textTransform: 'uppercase' }}>Estimated Total</div>
            <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 56, color: 'var(--y)', lineHeight: 1 }}>${price.toFixed(2)}</div>
            <div style={{ fontSize: 10, color: 'var(--t)', letterSpacing: 1 }}>Final price confirmed at checkout</div>
          </div>
          <button className="btn" style={{ width: '100%', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', padding: 18, fontSize: 13, letterSpacing: 3 }}
            onClick={() => validate() && setShowReview(true)}>
            + ADD TO CART
          </button>
        </div>

        {/* RIGHT: Options */}
        <div style={{ background: 'var(--d)', overflowY: 'auto', display: 'flex', flexDirection: 'column', order: window.innerWidth < 768 ? 1 : 2 }}>

          {/* Heading */}
          <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid var(--b)', background: 'var(--d)', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 28, letterSpacing: 2 }}>CUSTOMIZATION</div>
            {isAudi && (
              <span style={{ background: 'rgba(232,184,0,.1)', border: '1px solid var(--y)', color: 'var(--y)', fontFamily: 'Orbitron, monospace', fontSize: 9, fontWeight: 700, padding: '4px 10px', letterSpacing: 2 }}>B9 STYLE</span>
            )}
          </div>

          {/* Vehicle */}
          <Sect label="Vehicle" value={cfg.vehicleYear && cfg.vehicleModel ? `${cfg.vehicleYear} ${cfg.brand} ${cfg.vehicleModel}` : '—'}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {['BMW','AUDI'].map(b => (
                <button key={b} className={`ob${cfg.brand === b ? ' on' : ''}`} style={{ fontSize: 10, padding: '5px 20px' }} onClick={() => setBrand(b)}>{b}</button>
              ))}
            </div>
            {isAudi && (
              <div style={{ padding: '8px 12px', background: 'rgba(232,184,0,.05)', border: '1px solid rgba(232,184,0,.2)', marginBottom: 12, fontSize: 11, color: 'var(--t)', letterSpacing: 1 }}>
                ✓ Fits 2011+ AUDI All Models
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label className="fl">Year <span className="req">*</span></label>
                <input className={`fi${errors.year ? ' error' : ''}`} value={cfg.vehicleYear}
                  onChange={e => { set('vehicleYear', e.target.value); setErrors(p => ({...p, year: false})); }}
                  placeholder="e.g. 2023" />
                {errors.year && <div className="err-msg">Required</div>}
              </div>
              <div>
                <label className="fl">Model <span className="req">*</span></label>
                <input className={`fi${errors.model ? ' error' : ''}`} value={cfg.vehicleModel}
                  onChange={e => { set('vehicleModel', e.target.value); setErrors(p => ({...p, model: false})); }}
                  placeholder={isAudi ? 'e.g. A5, S4' : 'e.g. M4, 540i'} />
                {errors.model && <div className="err-msg">Required</div>}
              </div>
            </div>
            <label className="fl">Current Wheel Photo <span className="req">*</span></label>
            <label style={{ display: 'block', border: `2px dashed ${errors.photo ? '#CC3300' : photo ? '#3DB85A' : 'var(--b)'}`, padding: 16, textAlign: 'center', cursor: 'pointer', transition: 'all .2s', marginTop: 6, background: photo ? 'rgba(61,184,90,.04)' : 'transparent' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
              {photo ? <img src={photo} alt="wheel" style={{ width: '100%', maxHeight: 120, objectFit: 'cover' }} />
                : <><div style={{ fontSize: 20, opacity: .4, marginBottom: 3 }}>📷</div>
                   <div style={{ fontSize: 12, color: 'var(--t)' }}>{photoUploading ? 'Uploading...' : 'Drop or click to upload'}</div>
                   <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>JPG / PNG — required for fitment verification</div></>}
            </label>
            {errors.photo && <div className="err-msg">A photo of your current wheel is required</div>}
          </Sect>

          {/* Stripe */}
          <Sect label="Top Stripe" value={selectedStripeConcept.label}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px,1fr))', gap: 10, marginBottom: 14 }}>
              {STRIPE_CONCEPTS.map(sc => (
                <StripeConcept key={sc.id} concept={sc} selected={cfg.stripeConceptId} onSelect={v => set('stripeConceptId', v)} />
              ))}
            </div>
            <CustomColorInput label="Type Any Stripe Color:" value={cfg.stripeCustomColor} onChange={v => set('stripeCustomColor', v)} />
          </Sect>

          {/* Stitch */}
          <Sect label="Stitch Color" value={cfg.stitchColor ? colorName(cfg.stitchColor) : cfg.stitchCustomColor || 'None'}>
            <ColorGrid colors={STITCH_COLORS} selected={cfg.stitchColor} onSelect={v => { set('stitchColor', v); set('stitchCustomColor', ''); }} />
            <CustomColorInput label="Type Any Stitch Color:" value={cfg.stitchCustomColor} onChange={v => { set('stitchCustomColor', v); set('stitchColor', null); }} />
          </Sect>

          {/* Wheel Style */}
          <Sect label="Wheel Style" value={cfg.wheelStyle}>
            <OptionRow options={['Standard', 'Sport']} selected={cfg.wheelStyle} onSelect={v => set('wheelStyle', v)} />
          </Sect>

          {/* Paddles */}
          <Sect label="Paddle Shifters" value={cfg.paddleShifters}>
            <OptionRow options={['Standard', 'Magnetic']} selected={cfg.paddleShifters} onSelect={v => set('paddleShifters', v)} />
          </Sect>

          {/* Top/Bottom Mat */}
          <MatSection label="Top & Bottom Grip Material"
            matKey="topBottomMat" colKey="topBottomCol"
            carbonColKey="topBottomCarbonCol" customColKey="topBottomCustomColor"
            cfg={cfg} set={set} />

          {/* Side Mat */}
          <MatSection label="Side Grip Material"
            matKey="sideMat" colKey="sideCol"
            carbonColKey="sideCarbonCol" customColKey="sideCustomColor"
            cfg={cfg} set={set} />

          {/* AUDI-only */}
          {isAudi && (
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
                <ColorGrid colors={COLORS} selected={cfg.outerTrimCol} onSelect={v => set('outerTrimCol', v)} />
                <CustomColorInput label="Type Any Color:" value={cfg.outerTrimCustomColor || ''} onChange={v => set('outerTrimCustomColor', v)} />
              </Sect>
              <Sect label="Inner Trim Color" value={colorName(cfg.innerTrimCol)}>
                <ColorGrid colors={COLORS} selected={cfg.innerTrimCol} onSelect={v => set('innerTrimCol', v)} />
                <CustomColorInput label="Type Any Color:" value={cfg.innerTrimCustomColor || ''} onChange={v => set('innerTrimCustomColor', v)} />
              </Sect>
            </>
          )}

          {/* ── OPTIONS — updated labels and pricing ── */}
          <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--b)' }}>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 15, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Options</div>
            <Toggle
              label="Airbag Cover"
              sub="+$50.00"
              value={cfg.airbagCompat}
              onChange={v => set('airbagCompat', v)}
            />
            <Toggle
              label="Will you require a full upgraded airbag unit (full airbag not just cover)?"
              sub="+$25.00"
              value={cfg.airbagUpgrade}
              onChange={v => set('airbagUpgrade', v)}
            />
            <Toggle
              label="Heated Steering"
              sub={isAudi ? '+$25.00' : ''}
              value={cfg.heated}
              onChange={v => set('heated', v)}
            />
            <Toggle
              label="Lane Assist Compatible"
              value={cfg.laneAssist}
              onChange={v => set('laneAssist', v)}
            />
          </div>

          {/* Custom Notes */}
          <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--b)' }}>
            <label className="fl" style={{ marginBottom: 8 }}>Let us know if there are any other configurations you would like that have not been listed</label>
            <textarea className="fi" value={cfg.customNotes} onChange={e => set('customNotes', e.target.value)}
              placeholder="e.g. specific stitching pattern, custom embroidery, unique material combination..." rows={4} style={{ resize: 'vertical', marginTop: 4 }} />
          </div>

        </div>
      </div>

      {/* Review overlay */}
      {showReview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20, overflowY: 'auto' }}>
          <div style={{ background: 'var(--p)', border: '1px solid var(--b)', padding: 32, width: 520, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: 'var(--y)', marginBottom: 4 }}>REVIEW YOUR BUILD</div>
            <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 32, marginBottom: 20 }}>LOOKS GOOD?</div>
            {buildSummary().map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1A1A1A', gap: 10 }}>
                <span style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#666', flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: k === 'Est. Price' ? 18 : 13, fontWeight: 700, color: k === 'Est. Price' ? 'var(--y)' : 'var(--w)', textAlign: 'right' }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              <button className="btn" style={{ clipPath: 'none', flex: 1 }} onClick={() => {
                const topMat = MATS.find(m => m.n === cfg.topBottomMat);
                addItem({
                  name: `${cfg.brand} Custom Wheel`,
                  detail: `${cfg.vehicleYear} ${cfg.brand} ${cfg.vehicleModel} · ${cfg.wheelStyle} · ${cfg.topBottomMat}`,
                  price,
                  config: { ...cfg, topMatIsCarbon: topMat?.carbon },
                });
                setShowReview(false);
                showToast('ADDED TO CART');
              }}>LOOKS PERFECT — ADD TO CART</button>
              <button className="btn-outline sm" onClick={() => setShowReview(false)}>MAKE CHANGES</button>
            </div>
          </div>
        </div>
      )}

      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>
    </div>
  );
}

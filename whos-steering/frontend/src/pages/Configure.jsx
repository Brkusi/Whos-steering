import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import WheelPreview from '../components/WheelPreview';
import {
  COLORS, MATS, TRIS, DEFAULT_CONFIG, colorName,
  STRIPE_CONCEPTS, STITCH_COLORS,
  CLASSIC_CARBON_COLORS, FORGED_CARBON_COLORS, HONEYCOMB_CARBON_COLORS,
  TOP_BOTTOM_MATS, SIDE_MATS, AIRBAG_MATS,
} from '../lib/data';
import { calcPrice, apiFetch } from '../lib/api';
import { useCart } from '../context';

function Sect({ label, value, children, badge }) {
  return (
    <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--b)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 15, letterSpacing: 2, textTransform: 'uppercase' }}>{label}</span>
        {badge && <span style={{ background: 'var(--y)', color: '#000', fontFamily: 'Orbitron, monospace', fontSize: 11, fontWeight: 700, padding: '2px 8px', letterSpacing: 2 }}>{badge}</span>}
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
        <div key={c.h} title={c.n} onClick={() => onSelect(c.h)}
          style={{ position: 'relative', aspectRatio: 1, borderRadius: 3, cursor: 'pointer',
            border: `2px solid ${selected === c.h ? 'var(--y)' : 'transparent'}`,
            boxShadow: selected === c.h ? '0 0 0 1px var(--y)' : 'none',
            overflow: 'hidden', transition: 'border-color .15s' }}>
          {c.img
            ? <img src={c.img} alt={c.n} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: '100%', background: c.h }} />
          }
          {selected === c.h && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(232,184,0,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--y)' }}>✓</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CustomColorInput({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginTop: 10 }}>
      <label className="fl">{label || 'Type Any Color:'}</label>
      <input className="fi" type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'e.g. Gold, Magenta, Beige...'} style={{ marginTop: 4 }} />
    </div>
  );
}

function Toggle({ label, sub, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1A1A1A', flexWrap: 'wrap', gap: 8 }}>
      <div style={{ flex: 1, paddingRight: 12 }}>
        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--y)', letterSpacing: .5 }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', flexShrink: 0 }}>
        {['YES','NO'].map((v, i) => (
          <button key={v} onClick={() => onChange(v === 'YES')}
            style={{ padding: '6px 16px', border: '1px solid var(--b)', background: value === (v === 'YES') ? 'var(--y)' : 'transparent', color: value === (v === 'YES') ? '#000' : 'var(--t)', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontSize: 13, fontWeight: 700, letterSpacing: 1, transition: 'all .2s', borderRight: i === 0 ? 'none' : undefined }}>
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

function StripeConcept({ concept, selected, onSelect }) {
  const { id, label, img } = concept;
  const isSelected = selected === id;
  return (
    <div onClick={() => onSelect(id)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
      <div style={{ width: 80, height: 52, border: `2px solid ${isSelected ? 'var(--y)' : '#2A2A2A'}`,
        borderRadius: 4, overflow: 'hidden', position: 'relative',
        boxShadow: isSelected ? '0 0 0 1px var(--y)' : 'none', transition: 'border-color .15s' }}>
        {img
          ? <img src={img} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 11, color: '#555' }}>NONE</span>
            </div>
        }
        {isSelected && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(232,184,0,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--y)' }}>✓</span>
          </div>
        )}
      </div>
      <div style={{ fontSize: 11, color: isSelected ? 'var(--y)' : 'var(--t)', letterSpacing: .5,
        textAlign: 'center', maxWidth: 80, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function CarbonColorGrid({ colors, selected, onSelect }) {
  const [starPressed, setStarPressed] = useState(null);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, marginTop: 8 }}>
      {colors.map(c => {
        const isSel = selected === c.h;
        return (
          <div key={c.h} onClick={() => onSelect(c.h)}
            style={{ cursor: 'pointer', border: `2px solid ${isSel ? 'var(--y)' : '#2A2A2A'}`,
              borderRadius: 4, overflow: 'hidden', position: 'relative',
              boxShadow: isSel ? '0 0 0 1px var(--y)' : 'none', transition: 'border-color .15s' }}>
            {c.img
              ? <img src={c.img} alt={c.n}
                  style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
              : <div style={{ height: 100, background: c.h, position: 'relative', overflow: 'hidden' }}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} style={{ position: 'absolute', left: i*14, top: 0, width: 8,
                      height: '100%', background: 'rgba(255,255,255,.04)', transform: 'skewX(-12deg)' }} />
                  ))}
                </div>
            }
            {c.rec && (
              <div
                onClick={e => { e.stopPropagation(); setStarPressed(p => p === c.n ? null : c.n); }}
                title="Recommended"
                style={{ position: 'absolute', top: 6, left: 6, width: 20, height: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.6))', zIndex: 2 }}>
                <span style={{ fontSize: 16, color: '#FFD500', lineHeight: 1 }}>★</span>
              </div>
            )}
            {c.rec && starPressed === c.n && (
              <div style={{ position: 'absolute', top: 28, left: 6, background: '#FFD500', color: '#000',
                fontSize: 10, fontWeight: 700, letterSpacing: .5, padding: '2px 6px', borderRadius: 3,
                zIndex: 2, whiteSpace: 'nowrap' }}>
                Recommended
              </div>
            )}
            {isSel && (
              <div style={{ position: 'absolute', top: 6, right: 6, background: 'var(--y)',
                borderRadius: '50%', width: 18, height: 18, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#000', fontWeight: 700 }}>✓</div>
            )}
            <div style={{ padding: '5px 8px', background: '#111',
              fontSize: 12, color: isSel ? 'var(--y)' : 'var(--t)',
              letterSpacing: .5, textAlign: 'center', fontWeight: isSel ? 700 : 400 }}>
              {c.n}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MatSection({ label, matKey, colKey, carbonColKey, customColKey, cfg, set, matsOverride, linkedMat, colorError }) {
  const mat = cfg[matKey];
  const fullList = matsOverride || MATS;

  // If a linked material (e.g. Top/Bottom) has a carbon type selected, restrict
  // this section's options to: the same carbon type, Alcantara, or Classic Leather.
  const linkedCarbonType = linkedMat?.carbon ? linkedMat.cType : null;
  const matList = linkedCarbonType
    ? fullList.filter(m => (m.carbon && m.cType === linkedCarbonType) || m.n === 'Alcantara' || m.n === 'Classic Leather')
    : fullList;

  const selectedMat = matList.find(m => m.n === mat);
  const isCarbon = selectedMat?.carbon;
  const cType = selectedMat?.cType;
  const carbonColors = cType === 'classic' ? CLASSIC_CARBON_COLORS : cType === 'forged' ? FORGED_CARBON_COLORS : HONEYCOMB_CARBON_COLORS;
  const carbonLabel = cType === 'classic' ? 'Classic Carbon Color' : cType === 'forged' ? 'Forged Carbon Flakes' : 'Honeycomb Carbon Flakes';

  return (
    <Sect label={label} value={mat}>
      {linkedCarbonType && (
        <div style={{ fontSize: 12, color: 'rgba(232,184,0,.7)', letterSpacing: .5, marginBottom: 10, padding: '6px 10px', background: 'rgba(232,184,0,.06)', border: '1px solid rgba(232,184,0,.2)' }}>
          ✦ Limited to matching carbon, Alcantara, or Classic Leather based on your other grip selection
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
        {matList.map(m => (
          <button key={m.n} className={`ob${mat === m.n ? ' on' : ''}`}
            onClick={() => { set(matKey, m.n); set(colKey, null); set(carbonColKey, null); set(customColKey, ''); }}>
            {m.n}{m.carbon && <span style={{ marginLeft: 6, fontSize: 10, opacity: .75 }}>(+$40)</span>}
          </button>
        ))}
      </div>
      {isCarbon ? (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4, color: 'var(--t)' }}>
            {carbonLabel} <span className="req">*</span>
          </div>
          <CarbonColorGrid
            colors={carbonColors}
            selected={cfg[carbonColKey]}
            onSelect={v => { set(carbonColKey, v); set(customColKey, ''); }}
          />
          {cType !== 'honeycomb' && (
            <CustomColorInput
              label="Type Any Color:"
              value={cfg[customColKey]}
              onChange={v => { set(customColKey, v); set(carbonColKey, null); }}
            />
          )}
        </>
      ) : selectedMat?.col ? (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4, color: 'var(--t)' }}>
            Color <span className="req">*</span>: {cfg[customColKey] ? cfg[customColKey] : colorName(cfg[colKey])}
          </div>
          <ColorGrid colors={COLORS} selected={cfg[colKey]} onSelect={v => { set(colKey, v); set(customColKey, ''); }} />
          <CustomColorInput label="Type Any Color:" value={cfg[customColKey]} onChange={v => { set(customColKey, v); set(colKey, null); }} />
        </>
      ) : null}
      {colorError && <div className="err-msg" style={{ marginTop: 8 }}>Please choose a color option.</div>}
    </Sect>
  );
}


function textValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function stitchColorName(hex) {
  if (!hex) return '—';
  return STITCH_COLORS.find(c => c.h === hex)?.n || colorName(hex) || hex;
}

function carbonColorName(material, hex) {
  if (!hex) return '—';
  const list = material === 'Classic Carbon'
    ? CLASSIC_CARBON_COLORS
    : material === 'Forged Carbon'
      ? FORGED_CARBON_COLORS
      : HONEYCOMB_CARBON_COLORS;

  return list.find(c => c.h === hex)?.n || hex;
}

function configuredMaterialColor(material, regularColor, carbonColor, customColor) {
  const custom = textValue(customColor);
  if (custom) return custom;
  if (material && material.toLowerCase().includes('carbon')) {
    return carbonColorName(material, carbonColor);
  }
  return regularColor ? colorName(regularColor) : '—';
}

function configuredColor(regularColor, customColor, palette = 'standard') {
  const custom = textValue(customColor);
  if (custom) return custom;
  if (!regularColor) return '—';
  return palette === 'stitch' ? stitchColorName(regularColor) : colorName(regularColor);
}

function Model3DPreview({ src, alt, height }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setLoaded(false);
    const el = ref.current;
    if (!el) return;
    const onLoad = () => setLoaded(true);
    el.addEventListener('load', onLoad);
    return () => el.removeEventListener('load', onLoad);
  }, [src]);

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <model-viewer
        ref={ref}
        src={src}
        alt={alt}
        camera-controls
        auto-rotate
        shadow-intensity="0.4"
        environment-image="neutral"
        exposure="2.4"
        tone-mapping="commerce"
        style={{ width: '100%', height: '100%', background: 'transparent', opacity: loaded ? 1 : 0, transition: 'opacity .5s ease' }}
      >
        <div slot="progress-bar" />
      </model-viewer>
      {!loaded && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, border: '3px solid rgba(232,184,0,.15)', borderTopColor: 'var(--y)', borderRadius: '50%', animation: 'spin3d 1s linear infinite' }} />
          <div style={{ fontSize: 13, letterSpacing: 2, color: 'var(--t)', textTransform: 'uppercase' }}>Loading 3D Preview...</div>
        </div>
      )}
      <style>{`@keyframes spin3d { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}


const CONFIG_STEPS = [
  { id: 'vehicle', number: '01', label: 'VEHICLE' },
  { id: 'style', number: '02', label: 'STYLE' },
  { id: 'materials', number: '03', label: 'MATERIALS' },
  { id: 'details', number: '04', label: 'DETAILS' },
  { id: 'review', number: '05', label: 'REVIEW' },
];

function ConfigProgress({ activeStep, onStep }) {
  const activeIndex = CONFIG_STEPS.findIndex(step => step.id === activeStep);

  return (
    <div
      aria-label="Configurator progress"
      style={{
        display: 'flex',
        width: '100%',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        background: '#090909',
        borderTop: '1px solid #181818',
      }}
    >
      {CONFIG_STEPS.map((step, index) => {
        const active = step.id === activeStep;
        const complete = index < activeIndex;

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onStep(step.id)}
            aria-current={active ? 'step' : undefined}
            style={{
              position: 'relative',
              flex: '1 0 auto',
              minWidth: window.innerWidth < 768 ? 102 : 88,
              padding: window.innerWidth < 768 ? '10px 12px 11px' : '9px 12px 10px',
              border: 0,
              borderRight: index < CONFIG_STEPS.length - 1 ? '1px solid #1D1D1D' : 'none',
              background: active ? 'rgba(232,184,0,.08)' : 'transparent',
              color: active || complete ? 'var(--y)' : '#666',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background .18s, color .18s',
            }}
          >
            <span
              style={{
                display: 'block',
                fontFamily: 'Orbitron, monospace',
                fontSize: 7,
                fontWeight: 800,
                letterSpacing: 1.5,
                opacity: active ? 1 : .7,
                marginBottom: 3,
              }}
            >
              {complete ? '✓' : step.number}
            </span>

            <span
              style={{
                display: 'block',
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: window.innerWidth < 768 ? 11 : 10,
                fontWeight: 800,
                letterSpacing: 1.6,
                whiteSpace: 'nowrap',
              }}
            >
              {step.label}
            </span>

            {active && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 2,
                  background: 'var(--y)',
                  boxShadow: '0 0 10px rgba(232,184,0,.35)',
                }}
              />
            )}
          </button>
        );
      })}
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
  const [activeStep, setActiveStep] = useState('vehicle');

  const optionsRef = useRef(null);
  const vehicleRef = useRef(null);
  const styleRef = useRef(null);
  const materialsRef = useRef(null);
  const detailsRef = useRef(null);
  const reviewRef = useRef(null);

  const initBrand = params.get('brand') || 'BMW';
  const [cfg, setCfg] = useState({
    ...DEFAULT_CONFIG,
    brand: initBrand,
    wheelStyleType: initBrand === 'BMW' ? 'G-Series' : 'B9',
  });

  const set = useCallback((key, val) => {
    setCfg(prev => ({ ...prev, [key]: val }));

    const errorMap = {
      topBottomCol: 'topBottomColor',
      topBottomCarbonCol: 'topBottomColor',
      topBottomCustomColor: 'topBottomColor',

      sideCol: 'sideColor',
      sideCarbonCol: 'sideColor',
      sideCustomColor: 'sideColor',

      stitchColor: 'stitchColor',
      stitchCustomColor: 'stitchColor',

      plasticTrimCol: 'plasticTrimColor',
      plasticTrimCustomColor: 'plasticTrimColor',
      innerTrimCol: 'innerTrimColor',
      innerTrimCustomColor: 'innerTrimColor',
      innerTrimMatchCarbon: 'innerTrimColor',

      airbagMat: 'airbagMaterial',
      airbagCol: 'airbagColor',
      airbagCustomColor: 'airbagColor',
      airbagStitchColor: 'airbagStitchColor',
      airbagStitchCustomColor: 'airbagStitchColor',

      audiLogoCol: 'audiLogoColor',
      audiLogoCustomColor: 'audiLogoColor',
    };

    const errorKey = errorMap[key];
    if (errorKey) {
      setErrors(prev => ({ ...prev, [errorKey]: false }));
    }
  }, []);

  useEffect(() => {
    apiFetch('/api/products/pricing/rules').then(setRules).catch(console.error);
  }, []);

  useEffect(() => {
    const tracked = [
      vehicleRef.current,
      styleRef.current,
      materialsRef.current,
      detailsRef.current,
      reviewRef.current,
    ].filter(Boolean);

    if (!tracked.length || typeof IntersectionObserver === 'undefined') return;

    const isMobileViewport = window.innerWidth < 768;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => {
            const targetY = isMobileViewport ? 210 : 175;
            return Math.abs(a.boundingClientRect.top - targetY) - Math.abs(b.boundingClientRect.top - targetY);
          });

        const step = visible[0]?.target?.dataset?.step;
        if (step) setActiveStep(step);
      },
      {
        root: isMobileViewport ? null : optionsRef.current,
        rootMargin: isMobileViewport
          ? '-180px 0px -52% 0px'
          : '-145px 0px -52% 0px',
        threshold: [0, 0.01, 0.1, 0.25],
      }
    );

    tracked.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const scrollToStep = (step) => {
    const targets = {
      vehicle: vehicleRef,
      style: styleRef,
      materials: materialsRef,
      details: detailsRef,
      review: reviewRef,
    };

    setActiveStep(step);
    targets[step]?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const price = calcPrice(cfg, rules);
  const isCarbonTopBottom = !!(cfg.topBottomMat && cfg.topBottomMat.toLowerCase().includes('carbon'));

  const setBrand = (brand) => {
    setCfg({ ...DEFAULT_CONFIG, brand, wheelStyleType: brand === 'BMW' ? 'G-Series' : 'B9' });
    setPhoto(null);
    setErrors({});
  };

  const setAirbagCover = (enabled) => {
    setCfg(prev => {
      if (enabled) {
        return {
          ...prev,
          airbagCompat: true,
        };
      }

      // Airbag-dependent options must not remain active when the cover is disabled.
      return {
        ...prev,
        airbagCompat: false,
        airbagUpgrade: false,

        airbagMat: null,
        airbagCol: null,
        airbagCustomColor: '',
        airbagStitchColor: null,
        airbagStitchCustomColor: '',

        audiLogoCol: null,
        audiLogoCustomColor: '',
      };
    });

    if (!enabled) {
      setErrors(prev => ({
        ...prev,
        airbagMaterial: false,
        airbagColor: false,
        airbagStitchColor: false,
        audiLogoColor: false,
      }));
    }
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

    if (!textValue(cfg.vehicleYear)) e.year = true;
    if (!textValue(cfg.vehicleModel)) e.model = true;
    if (!photo && !cfg.photoUrl) e.photo = true;

    const topMaterial = TOP_BOTTOM_MATS.find(m => m.n === cfg.topBottomMat);
    const topColorSelected = topMaterial?.carbon
      ? Boolean(cfg.topBottomCarbonCol || textValue(cfg.topBottomCustomColor))
      : Boolean(cfg.topBottomCol || textValue(cfg.topBottomCustomColor));
    if (!topColorSelected) e.topBottomColor = true;

    const sideMaterial = SIDE_MATS.find(m => m.n === cfg.sideMat);
    const sideColorSelected = sideMaterial?.carbon
      ? Boolean(cfg.sideCarbonCol || textValue(cfg.sideCustomColor))
      : Boolean(cfg.sideCol || textValue(cfg.sideCustomColor));
    if (!sideColorSelected) e.sideColor = true;

    if (!cfg.stitchColor && !textValue(cfg.stitchCustomColor)) {
      e.stitchColor = true;
    }

    if (cfg.brand === 'AUDI') {
      if (!cfg.plasticTrimCol && !textValue(cfg.plasticTrimCustomColor)) {
        e.plasticTrimColor = true;
      }

      if (!cfg.innerTrimMatchCarbon && !cfg.innerTrimCol && !textValue(cfg.innerTrimCustomColor)) {
        e.innerTrimColor = true;
      }
    }

    if (cfg.airbagCompat) {
      if (!cfg.airbagMat) e.airbagMaterial = true;
      if (!cfg.airbagCol && !textValue(cfg.airbagCustomColor)) e.airbagColor = true;
      if (!cfg.airbagStitchColor && !textValue(cfg.airbagStitchCustomColor)) e.airbagStitchColor = true;

      if (cfg.brand === 'AUDI' && !cfg.audiLogoCol && !textValue(cfg.audiLogoCustomColor)) {
        e.audiLogoColor = true;
      }
    }

    setErrors(e);

    if (Object.keys(e).length > 0) {
      const vehicleErrors = e.year || e.model || e.photo;
      const styleErrors = e.stitchColor;
      const materialErrors =
        e.topBottomColor || e.sideColor ||
        e.plasticTrimColor || e.innerTrimColor;
      const detailErrors =
        e.airbagMaterial || e.airbagColor || e.airbagStitchColor || e.audiLogoColor;

      if (vehicleErrors) scrollToStep('vehicle');
      else if (styleErrors) scrollToStep('style');
      else if (materialErrors) scrollToStep('materials');
      else if (detailErrors) scrollToStep('details');

      showToast('PLEASE COMPLETE ALL REQUIRED OPTIONS');
      return false;
    }

    return true;
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2400); };

  const selectedStripeConcept = STRIPE_CONCEPTS.find(s => s.id === cfg.stripeConceptId) || STRIPE_CONCEPTS[0];

  const buildSummary = () => {
    const topColor = configuredMaterialColor(
      cfg.topBottomMat,
      cfg.topBottomCol,
      cfg.topBottomCarbonCol,
      cfg.topBottomCustomColor
    );

    const sideColor = configuredMaterialColor(
      cfg.sideMat,
      cfg.sideCol,
      cfg.sideCarbonCol,
      cfg.sideCustomColor
    );

    const rows = [
      ['Brand', cfg.brand],
      ['Vehicle Year', cfg.vehicleYear],
      ['Vehicle Model', cfg.vehicleModel],
      ['Current Wheel Photo', photo || cfg.photoUrl ? 'Attached' : 'Missing'],

      ['Wheel Style Type', cfg.wheelStyleType],

      cfg.brand === 'AUDI' && cfg.wheelStyleType === 'R8'
        ? ['Start / Stop & Drive Select Buttons', cfg.startStopButtons ? 'Yes (+$40)' : 'No']
        : null,

      [cfg.brand === 'AUDI' ? 'LED Display Strip' : 'RPM Gauge',
        cfg.ledDisplay ? `Yes (+$${cfg.brand === 'AUDI' ? '50' : '100'})` : 'No'],

      ['Top Stripe', selectedStripeConcept.label],
      textValue(cfg.stripeCustomColor)
        ? ['Custom Stripe Color', textValue(cfg.stripeCustomColor)]
        : null,

      ['Stitch Color', configuredColor(cfg.stitchColor, cfg.stitchCustomColor, 'stitch')],

      !(cfg.brand === 'AUDI' && cfg.wheelStyleType === 'R8') &&
      !(cfg.brand === 'BMW' && cfg.wheelStyleType === 'F-Series')
        ? ['Wheel Style', cfg.wheelStyle]
        : null,

      ['Paddle Shifters', cfg.paddleShifters],
      cfg.paddleShifters === 'Magnetic'
        ? ['Paddle Length', cfg.paddleLength || 'Short']
        : null,

      ['Top & Bottom Grip Material', cfg.topBottomMat],
      ['Top & Bottom Color', topColor],
      ['Side Grip Material', cfg.sideMat],
      ['Side Grip Color', sideColor],

      cfg.brand === 'AUDI' ? ['Lower Badge', cfg.audiBadge] : null,
      cfg.brand === 'AUDI'
        ? ['Plastic Trim Color', configuredColor(cfg.plasticTrimCol, cfg.plasticTrimCustomColor)]
        : null,
      cfg.brand === 'AUDI'
        ? ['Inner Trim Color',
            cfg.innerTrimMatchCarbon
              ? 'Match Carbon Fiber Top & Bottom'
              : configuredColor(cfg.innerTrimCol, cfg.innerTrimCustomColor)]
        : null,

      ['Airbag Cover',
        cfg.airbagCompat
          ? (cfg.brand === 'BMW' && cfg.wheelStyleType === 'F-Series' ? 'Yes (FREE)' : 'Yes (+$25)')
          : 'No'],

      cfg.airbagCompat
        ? ['Full Upgraded Airbag Unit', cfg.airbagUpgrade ? 'Yes (+$75)' : 'No']
        : null,

      cfg.airbagCompat ? ['Airbag Material', cfg.airbagMat || '—'] : null,
      cfg.airbagCompat
        ? ['Airbag Color', configuredColor(cfg.airbagCol, cfg.airbagCustomColor)]
        : null,
      cfg.airbagCompat
        ? ['Airbag Stitch Color', configuredColor(cfg.airbagStitchColor, cfg.airbagStitchCustomColor, 'stitch')]
        : null,
      cfg.brand === 'AUDI' && cfg.airbagCompat
        ? ['Audi Logo Color', configuredColor(cfg.audiLogoCol, cfg.audiLogoCustomColor)]
        : null,

      ['Heated Steering', cfg.heated ? (cfg.brand === 'BMW' ? 'Yes (+$75)' : 'Yes') : 'No'],
      [cfg.brand === 'BMW' ? 'Driver Assistance Retained' : 'Lane Assist Compatible',
        cfg.laneAssist ? (cfg.brand === 'BMW' ? 'Yes (+$30)' : 'Yes') : 'No'],

      ['Custom Notes', textValue(cfg.customNotes) || 'None'],
      ['Est. Price', `$${price.toFixed(2)}`],
    ];

    return rows.filter(Boolean);
  };

  const buildConfigSnapshot = () => ({
    ...cfg,
    paddleLength: cfg.paddleLength || 'Short',
    topBottomCustomColor: cfg.topBottomCustomColor || '',
    sideCustomColor: cfg.sideCustomColor || '',
    innerTrimCustomColor: cfg.innerTrimCustomColor || '',
  });

  const isAudi = cfg.brand === 'AUDI';
  const isMobileViewport = window.innerWidth < 768;
  const previewMediaMaxHeight = isMobileViewport ? 440 : 'none';

  return (
    <div style={{
      paddingTop: 0,
      paddingBottom: isMobileViewport ? 74 : 0,
      minHeight: '100vh',
      background: 'var(--d)',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobileViewport ? '1fr' : 'minmax(0, 0.98fr) minmax(500px, 1.02fr)',
        minHeight: isMobileViewport ? 'auto' : 'calc(100vh - 120px)',
        alignItems: isMobileViewport ? 'start' : 'stretch',
        alignContent: 'start',
      }}>

        {/* LEFT: Preview */}
        <div style={{
          position: isMobileViewport ? 'relative' : 'sticky',
          top: isMobileViewport ? 0 : 120,
          height: isMobileViewport ? 'auto' : 'calc(100vh - 120px)',
          minHeight: 0,
          background: '#111',
          display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start',
          gap: isMobileViewport ? 0 : 10,
          padding: isMobileViewport ? '0' : '14px 12px 14px',
          borderRight: isMobileViewport ? 'none' : '1px solid var(--b)', overflow: 'hidden',
          order: 1,
        }}>
          {!isAudi && cfg.wheelStyleType === 'G-Series' ? (
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: 'none',
              margin: 0,
              aspectRatio: isMobileViewport ? '4 / 3' : 'auto',
              height: isMobileViewport ? 'auto' : 'calc(100vh - 292px)',
              maxHeight: previewMediaMaxHeight,
              flex: isMobileViewport ? '0 0 auto' : '1 1 auto',
              minHeight: 0,
              overflow: 'hidden',
            }}>
              <img
                src="/g-series-reference.png"
                alt="BMW G-Series Steering Wheel customization options"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: isMobileViewport ? 'contain' : 'contain',
                  objectPosition: 'center',
                  display: 'block',
                  transform: isMobileViewport ? 'none' : 'scale(0.985)',
                  transformOrigin: 'center',
                }}
              />
            </div>
          ) : !isAudi && cfg.wheelStyleType === 'F-Series' ? (
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: 'none',
              margin: 0,
              aspectRatio: isMobileViewport ? '4 / 3' : 'auto',
              height: isMobileViewport ? 'auto' : 'calc(100vh - 292px)',
              maxHeight: previewMediaMaxHeight,
              flex: isMobileViewport ? '0 0 auto' : '1 1 auto',
              minHeight: 0,
              overflow: 'hidden',
            }}>
              <img
                src="/f-series-reference.png"
                alt="BMW F-Series Steering Wheel customization options"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: isMobileViewport ? 'contain' : 'contain',
                  objectPosition: 'center',
                  display: 'block',
                  transform: isMobileViewport ? 'none' : 'scale(0.985)',
                  transformOrigin: 'center',
                }}
              />
            </div>
          ) : isAudi && cfg.wheelStyleType === 'B9' ? (
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: 'none',
              margin: 0,
              aspectRatio: isMobileViewport ? '3 / 2' : 'auto',
              height: isMobileViewport ? 'auto' : 'calc(100vh - 292px)',
              maxHeight: previewMediaMaxHeight,
              flex: isMobileViewport ? '0 0 auto' : '1 1 auto',
              minHeight: 0,
              overflow: 'hidden',
            }}>
              <img
                src="/b9-reference.png"
                alt="Audi B9 Steering Wheel customization options"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: isMobileViewport ? 'contain' : 'contain',
                  objectPosition: 'center',
                  display: 'block',
                  transform: isMobileViewport ? 'none' : 'scale(0.985)',
                  transformOrigin: 'center',
                }}
              />
            </div>
          ) : isAudi && cfg.wheelStyleType === 'R8' ? (
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: 'none',
              margin: 0,
              aspectRatio: isMobileViewport ? '3 / 2' : 'auto',
              height: isMobileViewport ? 'auto' : 'calc(100vh - 292px)',
              maxHeight: previewMediaMaxHeight,
              flex: isMobileViewport ? '0 0 auto' : '1 1 auto',
              minHeight: 0,
              overflow: 'hidden',
            }}>
              <img
                src="/r8-reference.png"
                alt="Audi R8 Steering Wheel customization options"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: isMobileViewport ? 'contain' : 'contain',
                  objectPosition: 'center',
                  display: 'block',
                  transform: isMobileViewport ? 'none' : 'scale(0.985)',
                  transformOrigin: 'center',
                }}
              />
            </div>
          ) : (
            <WheelPreview config={cfg} size={Math.min(isMobileViewport ? 360 : 520, window.innerWidth * (isMobileViewport ? 0.74 : 0.46))} />
          )}
          {!isMobileViewport && (
            <div style={{ paddingTop: 8, borderTop: '1px solid var(--b)', width: '100%', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, letterSpacing: 3, color: 'var(--t)', textTransform: 'uppercase', marginBottom: 2 }}>Estimated Total</div>
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 'clamp(54px,5vw,72px)', color: 'var(--y)', lineHeight: .95, letterSpacing: -1 }}>${price.toFixed(2)}</div>
              <div style={{ fontSize: 13, color: 'var(--t)', letterSpacing: 1.15, marginTop: 2 }}>Final price confirmed at checkout</div>
            </div>
          )}
          {!isMobileViewport && (
            <button className="btn" style={{ width: '100%', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', padding: 18, fontSize: 13, letterSpacing: 3 }}
              onClick={() => validate() && setShowReview(true)}>
              + ADD TO CART
            </button>
          )}
        </div>

        {/* RIGHT: Options */}
        <div ref={optionsRef} style={{
          background: 'var(--d)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          order: 2,
          borderTop: isMobileViewport ? '1px solid var(--b)' : 'none',
        }}>

          {/* Sticky heading + progress */}
          <div style={{
            position: 'sticky',

            /*
              Desktop options are already inside a scroll column that begins
              BELOW the 120px site header, so desktop must stick at 0.
              Mobile scrolls in the page viewport, so it still needs 120px.
            */
            top: isMobileViewport ? 120 : 0,

            zIndex: 30,
            background: 'var(--d)',
            borderBottom: '1px solid var(--b)',
            boxShadow: '0 8px 22px rgba(0,0,0,.24)',
          }}>
            <div style={{ padding: '16px 28px 12px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 28, letterSpacing: 2 }}>CUSTOMIZATION</div>
              {isAudi && (
                <span style={{ background: 'rgba(232,184,0,.1)', border: '1px solid var(--y)', color: 'var(--y)', fontFamily: 'Orbitron, monospace', fontSize: 11, fontWeight: 700, padding: '4px 10px', letterSpacing: 2 }}>B9 STYLE</span>
              )}
              <div style={{ marginLeft: 'auto', fontFamily: 'Orbitron, monospace', color: 'var(--y)', fontSize: 8, letterSpacing: 1.4 }}>
                {CONFIG_STEPS.findIndex(s => s.id === activeStep) + 1} / {CONFIG_STEPS.length}
              </div>
            </div>
            <ConfigProgress activeStep={activeStep} onStep={scrollToStep} />
          </div>

          {/* Vehicle */}
          <div ref={vehicleRef} data-step="vehicle" style={{ scrollMarginTop: isMobileViewport ? 205 : 88 }}>
          <Sect label="Vehicle" value={cfg.vehicleYear && cfg.vehicleModel ? `${cfg.vehicleYear} ${cfg.brand} ${cfg.vehicleModel}` : '—'}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {['BMW','AUDI'].map(b => (
                <button key={b} className={`ob${cfg.brand === b ? ' on' : ''}`} style={{ fontSize: 12, padding: '5px 20px' }} onClick={() => setBrand(b)}>{b}</button>
              ))}
            </div>
            {isAudi && (
              <div style={{ padding: '8px 12px', background: 'rgba(232,184,0,.05)', border: '1px solid rgba(232,184,0,.2)', marginBottom: 12, fontSize: 13, color: 'var(--t)', letterSpacing: 1 }}>
                ✓ Fits 2011+ AUDI All Models
              </div>
            )}
            {!isAudi && (
              <div style={{ padding: '8px 12px', background: 'rgba(232,184,0,.05)', border: '1px solid rgba(232,184,0,.2)', marginBottom: 12, fontSize: 13, color: 'var(--t)', letterSpacing: 1 }}>
                ✓ {cfg.wheelStyleType === 'F-Series' ? 'Fits F10, F30, E90' : 'Fits F10, F30, G20, G30, G22, G42, G80, G82, G87'}
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
                   <div style={{ fontSize: 12, color: '#444', marginTop: 2 }}>JPG / PNG — required for fitment verification</div></>}
            </label>
            {errors.photo && <div className="err-msg">A photo of your current wheel is required</div>}
          </Sect>
          </div>

          {/* Style */}
          <div ref={styleRef} data-step="style" style={{ scrollMarginTop: isMobileViewport ? 205 : 88 }}>
          {/* Wheel Style Type */}
          <Sect label="Wheel Style Type" value={cfg.wheelStyleType}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {(isAudi ? ['B9', 'R8'] : ['G-Series', 'F-Series']).map(style => (
                <div key={style} onClick={() => set('wheelStyleType', style)}
                  style={{ flex: 1, padding: '14px 12px', border: `2px solid ${cfg.wheelStyleType === style ? 'var(--y)' : 'var(--b)'}`, background: cfg.wheelStyleType === style ? 'rgba(232,184,0,.06)' : 'transparent', cursor: 'pointer', textAlign: 'center', transition: 'all .2s' }}>
                  <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 28, color: cfg.wheelStyleType === style ? 'var(--y)' : 'var(--w)', letterSpacing: 2 }}>{style} STYLE</div>
                  <div style={{ fontSize: 12, color: 'var(--t)', marginTop: 4 }}>
                    {isAudi
                      ? (style === 'B9' ? 'Classic flat-bottom sport profile' : 'R8 supercar-inspired round profile')
                      : (style === 'G-Series' ? 'Modern G-chassis flat-bottom sport profile' : 'Classic F-chassis round profile')}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--y)', fontWeight: 700, marginTop: 6 }}>
                    {isAudi
                      ? (style === 'B9' ? 'From $699.99' : 'From $799.99')
                      : (style === 'G-Series' ? 'From $549.99' : 'From $449.99')}
                  </div>
                </div>
              ))}
            </div>
            {isAudi && cfg.wheelStyleType === 'R8' && (
              <Toggle
                label="Start / Stop & Drive Select Buttons"
                sub="+$40.00"
                value={cfg.startStopButtons}
                onChange={v => set('startStopButtons', v)}
              />
            )}
          </Sect>

          {/* LED / RPM Display Strip — both brands, price differs by brand */}
          <Sect label={isAudi ? 'LED Display Strip' : 'RPM Gauge'}
            value={cfg.ledDisplay ? `Yes · +$${isAudi ? '50' : '100'}` : 'No'}
            badge={cfg.ledDisplay ? 'ADDED' : undefined}>
            <Toggle
              label={isAudi ? 'Add LED Display Strip' : 'Add RPM Gauge'}
              sub={isAudi ? '+$50.00' : '+$100.00'}
              value={cfg.ledDisplay}
              onChange={v => set('ledDisplay', v)}
            />
            {cfg.ledDisplay && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flexShrink: 0, border: '1px solid var(--b)', overflow: 'hidden', background: '#0A0A0A', width: 120, height: 80 }}>
                  <img src="/led-display.png" alt={isAudi ? 'LED Display Strip' : 'RPM Gauge'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }} />
                </div>
                <div style={{ fontSize: 13, color: 'var(--t)', lineHeight: 1.7 }}>
                  Integrated LED RPM shift-light strip with live speed and gear display — embedded directly into the steering wheel, visible without moving your eyes from the road.
                </div>
              </div>
            )}
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
          <Sect label="Stitch Color *" value={cfg.stitchColor ? stitchColorName(cfg.stitchColor) : cfg.stitchCustomColor || '—'}>
            <ColorGrid colors={STITCH_COLORS} selected={cfg.stitchColor} onSelect={v => { set('stitchColor', v); set('stitchCustomColor', ''); }} />
            <CustomColorInput label="Type Any Stitch Color (Max Two):" value={cfg.stitchCustomColor} onChange={v => { set('stitchCustomColor', v); set('stitchColor', null); }} placeholder="e.g. Gold, Magenta, Dual Colors..." />
            {errors.stitchColor && <div className="err-msg" style={{ marginTop: 8 }}>Please choose a stitch color.</div>}
          </Sect>

          {/* Wheel Style — hidden for R8 and F-Series */}
          {!(isAudi && cfg.wheelStyleType === 'R8') && !(!isAudi && cfg.wheelStyleType === 'F-Series') && (
            <Sect label="Wheel Style" value={cfg.wheelStyle}>
              <OptionRow options={['Standard', 'Sport']} selected={cfg.wheelStyle} onSelect={v => set('wheelStyle', v)} />
            </Sect>
          )}

          {/* Paddles */}
          <Sect label="Paddle Shifters" value={cfg.paddleShifters + (cfg.paddleShifters === 'Magnetic' ? ` · ${cfg.paddleLength}` : '')}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {['Standard', 'Magnetic'].map(o => (
                <button key={o} className={`ob${cfg.paddleShifters === o ? ' on' : ''}`} onClick={() => set('paddleShifters', o)}>
                  {o}{o === 'Magnetic' ? ' (+$25.00)' : ''}
                </button>
              ))}
            </div>
            {cfg.paddleShifters === 'Magnetic' && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 13, color: 'rgba(232,184,0,.7)', letterSpacing: 1, marginBottom: 8, padding: '6px 10px', background: 'rgba(232,184,0,.06)', border: '1px solid rgba(232,184,0,.2)' }}>
                  ✦ All of our magnetic paddle shifters are carbon fiber
                </div>
                <div style={{ fontSize: 13, color: 'var(--t)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Paddle Length</div>
                <OptionRow options={['Short', 'Long']} selected={cfg.paddleLength || 'Short'} onSelect={v => set('paddleLength', v)} />
              </div>
            )}
          </Sect>

          </div>

          {/* Materials */}
          <div ref={materialsRef} data-step="materials" style={{ scrollMarginTop: isMobileViewport ? 205 : 88 }}>
          {/* Top/Bottom Mat */}
          <MatSection label="Top & Bottom Grip Material"
            matKey="topBottomMat" colKey="topBottomCol"
            carbonColKey="topBottomCarbonCol" customColKey="topBottomCustomColor"
            cfg={cfg} set={set} matsOverride={TOP_BOTTOM_MATS}
            colorError={errors.topBottomColor} />

          {/* Side Mat — restricted to match Top/Bottom carbon type when applicable */}
          <MatSection label="Side Grip Material"
            matKey="sideMat" colKey="sideCol"
            carbonColKey="sideCarbonCol" customColKey="sideCustomColor"
            cfg={cfg} set={set} matsOverride={SIDE_MATS}
            linkedMat={TOP_BOTTOM_MATS.find(m => m.n === cfg.topBottomMat)}
            colorError={errors.sideColor} />

          {/* AUDI-only */}
          {isAudi && (
            <>
              <Sect label="Lower Badge" value={cfg.audiBadge}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['RS','S','R8'].map(b => (
                    <div key={b} className={`ob${cfg.audiBadge === b ? ' on' : ''}`}
                      style={{ flex: 1, padding: 14, textAlign: 'center', fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 26, letterSpacing: 3, cursor: 'pointer' }}
                      onClick={() => set('audiBadge', b)}>{b}</div>
                  ))}
                </div>
              </Sect>
              <Sect label="Plastic Trim Color *" value={configuredColor(cfg.plasticTrimCol, cfg.plasticTrimCustomColor)}>
                <ColorGrid colors={COLORS} selected={cfg.plasticTrimCol} onSelect={v => { set('plasticTrimCol', v); set('plasticTrimCustomColor', ''); }} />
                <CustomColorInput label="Type Any Color:" value={cfg.plasticTrimCustomColor || ''} onChange={v => { set('plasticTrimCustomColor', v); set('plasticTrimCol', null); }} />
                {errors.plasticTrimColor && <div className="err-msg" style={{ marginTop: 8 }}>Please choose a plastic trim color.</div>}
              </Sect>
              <Sect label="Inner Trim Color *" value={cfg.innerTrimMatchCarbon ? 'Match Carbon Fiber' : configuredColor(cfg.innerTrimCol, cfg.innerTrimCustomColor)}>
                {isCarbonTopBottom && (
                  <div onClick={() => {
                      const next = !cfg.innerTrimMatchCarbon;
                      set('innerTrimMatchCarbon', next);
                      set('innerTrimCol', null);
                      if (next) set('innerTrimCustomColor', '');
                    }}
                    className={`ob${cfg.innerTrimMatchCarbon ? ' on' : ''}`}
                    style={{ padding: '10px 14px', marginBottom: 10, textAlign: 'center', cursor: 'pointer', fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                    Match Carbon Fiber Top & Bottom
                  </div>
                )}
                {!cfg.innerTrimMatchCarbon && (
                  <>
                    <ColorGrid colors={COLORS} selected={cfg.innerTrimCol} onSelect={v => { set('innerTrimCol', v); set('innerTrimCustomColor', ''); }} />
                    <CustomColorInput label="Type Any Color:" value={cfg.innerTrimCustomColor || ''} onChange={v => { set('innerTrimCustomColor', v); set('innerTrimCol', null); }} />
                  </>
                )}
                {errors.innerTrimColor && <div className="err-msg" style={{ marginTop: 8 }}>Please choose an inner trim color or select Match Carbon Fiber.</div>}
              </Sect>
            </>
          )}

          </div>

          {/* Details */}
          <div ref={detailsRef} data-step="details" style={{ scrollMarginTop: isMobileViewport ? 205 : 88 }}>
          {/* ── OPTIONS ── */}
          <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--b)' }}>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 15, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Options</div>
            <Toggle
              label="Airbag Cover"
              sub={cfg.brand === 'BMW' && cfg.wheelStyleType === 'F-Series'
                ? <span style={{ display: 'inline-block', background: 'var(--y)', color: '#000', fontWeight: 800, fontSize: 11, letterSpacing: 1, padding: '2px 8px', borderRadius: 3 }}>FREE</span>
                : '+$25.00'}
              value={cfg.airbagCompat}
              onChange={setAirbagCover}
            />

            {/* Only relevant when the customer is ordering an airbag cover */}
            {cfg.airbagCompat && (
              <Toggle
                label="Will you require a full upgraded airbag unit (full airbag not just cover)?"
                sub="+$75.00"
                value={cfg.airbagUpgrade}
                onChange={v => set('airbagUpgrade', v)}
              />
            )}
            <Toggle
              label="Heated Steering"
              sub={!isAudi ? '+$75.00' : ''}
              value={cfg.heated}
              onChange={v => set('heated', v)}
            />
            <Toggle
              label={!isAudi ? 'Does Your Original Steering Wheel Have Driver Assistance Functionality?' : 'Lane Assist Compatible'}
              sub={!isAudi
                ? (cfg.laneAssist ? 'Yes (I want to retain Driver Assistance) — +$30.00' : 'No')
                : ''}
              value={cfg.laneAssist}
              onChange={v => set('laneAssist', v)}
            />

            {cfg.airbagCompat && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #1A1A1A' }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, color: 'var(--t)' }}>Airbag Material <span className="req">*</span></div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
                  {AIRBAG_MATS.map(m => (
                    <button key={m.n} className={`ob${cfg.airbagMat === m.n ? ' on' : ''}`}
                      onClick={() => { set('airbagMat', m.n); set('airbagCol', null); set('airbagCustomColor', ''); }}>
                      {m.n}
                    </button>
                  ))}
                </div>
                {errors.airbagMaterial && <div className="err-msg" style={{ margin: '-6px 0 10px' }}>Please choose an airbag material.</div>}
                {cfg.airbagMat && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4, color: 'var(--t)' }}>
                      Color <span className="req">*</span>: {configuredColor(cfg.airbagCol, cfg.airbagCustomColor)}
                    </div>
                    <ColorGrid colors={COLORS} selected={cfg.airbagCol} onSelect={v => { set('airbagCol', v); set('airbagCustomColor', ''); }} />
                    <CustomColorInput label="Type Any Color:" value={cfg.airbagCustomColor} onChange={v => { set('airbagCustomColor', v); set('airbagCol', null); }} />
                    {errors.airbagColor && <div className="err-msg" style={{ marginTop: 8 }}>Please choose an airbag color.</div>}
                  </>
                )}
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', margin: '16px 0 4px', color: 'var(--t)' }}>
                  Airbag Stitch Color <span className="req">*</span>: {configuredColor(cfg.airbagStitchColor, cfg.airbagStitchCustomColor, 'stitch')}
                </div>
                <ColorGrid colors={STITCH_COLORS} selected={cfg.airbagStitchColor} onSelect={v => { set('airbagStitchColor', v); set('airbagStitchCustomColor', ''); }} />
                <CustomColorInput label="Type Any Stitch Color:" value={cfg.airbagStitchCustomColor} onChange={v => { set('airbagStitchCustomColor', v); set('airbagStitchColor', null); }} placeholder="e.g. Gold, Magenta, Dual Colors..." />
                {errors.airbagStitchColor && <div className="err-msg" style={{ marginTop: 8 }}>Please choose an airbag stitch color.</div>}
              </div>
            )}

            {isAudi && cfg.airbagCompat && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #1A1A1A' }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4, color: 'var(--t)' }}>
                  Audi Logo Color <span className="req">*</span>: {configuredColor(cfg.audiLogoCol, cfg.audiLogoCustomColor)}
                </div>
                <ColorGrid colors={COLORS} selected={cfg.audiLogoCol} onSelect={v => { set('audiLogoCol', v); set('audiLogoCustomColor', ''); }} />
                <CustomColorInput label="Type Any Color:" value={cfg.audiLogoCustomColor} onChange={v => { set('audiLogoCustomColor', v); set('audiLogoCol', null); }} />
                {errors.audiLogoColor && <div className="err-msg" style={{ marginTop: 8 }}>Please choose an Audi logo color.</div>}
              </div>
            )}
          </div>

          </div>

          {/* Review / final checkout */}
          <div ref={reviewRef} data-step="review" style={{ scrollMarginTop: isMobileViewport ? 205 : 88 }}>
          {/* Custom Notes */}
          <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--b)' }}>
            <label className="fl" style={{ marginBottom: 8 }}>Let us know if there are any other configurations you would like that have not been listed</label>
            <textarea className="fi" value={cfg.customNotes} onChange={e => set('customNotes', e.target.value)}
              placeholder="e.g. specific stitching pattern, custom embroidery, unique material combination..." rows={4} style={{ resize: 'vertical', marginTop: 4 }} />
          </div>

          {/* Mobile checkout CTA stays LAST, after every customization option */}
          {isMobileViewport && (
            <div style={{
              padding: '24px 20px calc(30px + env(safe-area-inset-bottom, 0px))',
              background: '#0A0A0A',
              borderTop: '1px solid var(--b)',
            }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{
                  fontFamily: 'Orbitron, monospace',
                  fontSize: 10,
                  letterSpacing: 3,
                  color: 'var(--t)',
                  textTransform: 'uppercase',
                  marginBottom: 3,
                }}>
                  Estimated Total
                </div>
                <div style={{
                  fontFamily: '"Barlow Condensed", sans-serif',
                  fontWeight: 900,
                  fontSize: 46,
                  color: 'var(--y)',
                  lineHeight: 1,
                }}>
                  ${price.toFixed(2)}
                </div>
              </div>

              <button
                className="btn"
                style={{
                  width: '100%',
                  clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)',
                  padding: 18,
                  fontSize: 13,
                  letterSpacing: 3,
                }}
                onClick={() => validate() && setShowReview(true)}
              >
                + ADD TO CART
              </button>
            </div>
          )}
          </div>

        </div>
      </div>

      {/* Sticky mobile build total — tap to jump to final review */}
      {isMobileViewport && !['vehicle', 'review'].includes(activeStep) && !showReview && (
        <button
          type="button"
          onClick={() => scrollToStep('review')}
          aria-label={`Build total $${price.toFixed(2)}. Jump to review.`}
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
            transform: 'translateX(-50%)',
            zIndex: 1200,
            width: 'calc(100% - 28px)',
            maxWidth: 560,
            minHeight: 58,
            padding: '9px 14px 9px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            border: '1px solid rgba(232,184,0,.72)',
            background: 'rgba(8,8,8,.94)',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 10px 36px rgba(0,0,0,.55), 0 0 0 1px rgba(232,184,0,.05) inset',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
            <span style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: 7,
              fontWeight: 800,
              letterSpacing: 1.8,
              color: 'var(--y)',
              marginBottom: 2,
            }}>
              BUILD TOTAL
            </span>
            <span style={{
              fontFamily: '"Barlow Condensed", sans-serif',
              fontSize: 28,
              fontWeight: 900,
              lineHeight: .95,
              letterSpacing: .3,
              whiteSpace: 'nowrap',
            }}>
              ${price.toFixed(2)}
            </span>
          </span>

          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--y)',
            fontFamily: 'Orbitron, monospace',
            fontSize: 7,
            fontWeight: 800,
            letterSpacing: 1.2,
            whiteSpace: 'nowrap',
          }}>
            REVIEW BUILD
            <span aria-hidden="true" style={{ fontSize: 14 }}>↓</span>
          </span>
        </button>
      )}

      {/* Review overlay */}
      {showReview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20, overflowY: 'auto' }}>
          <div style={{ background: 'var(--p)', border: '1px solid var(--b)', padding: 32, width: 520, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, letterSpacing: 4, color: 'var(--y)', marginBottom: 4 }}>REVIEW YOUR BUILD</div>
            <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 32, marginBottom: 20 }}>LOOKS GOOD?</div>
            {buildSummary().map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1A1A1A', gap: 10 }}>
                <span style={{ fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: '#666', flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: k === 'Est. Price' ? 32 : 13, fontWeight: 900, color: k === 'Est. Price' ? 'var(--y)' : 'var(--w)', textAlign: 'right', fontFamily: k === 'Est. Price' ? '"Barlow Condensed", sans-serif' : 'inherit', letterSpacing: k === 'Est. Price' ? 1 : 'normal' }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              <button className="btn" style={{ clipPath: 'none', flex: 1 }} onClick={() => {
                const topMat = MATS.find(m => m.n === cfg.topBottomMat);
                addItem({
                  name: `${cfg.brand} Custom Wheel`,
                  detail: `${cfg.vehicleYear} ${cfg.brand} ${cfg.vehicleModel} · ${cfg.wheelStyle} · ${cfg.topBottomMat}`,
                  price,
                  config: { ...buildConfigSnapshot(), topMatIsCarbon: topMat?.carbon },
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
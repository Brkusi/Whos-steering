import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context';
import { AUDI_PRESETS_FULL as AUDI_PRESETS, BMW_PRESETS } from '../lib/data';
import ZoomableImage from '../components/ZoomableImage';

function ArrowBtn({ dir, onClick }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); e.preventDefault(); onClick(); }}
      style={{
        position: 'absolute', top: '50%',
        [dir === 'left' ? 'left' : 'right']: 10,
        transform: 'translateY(-50%)',
        background: 'rgba(0,0,0,.75)', border: '1px solid rgba(255,255,255,.2)',
        color: '#fff', width: 34, height: 34, borderRadius: '50%',
        cursor: 'pointer', fontSize: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10, transition: 'background .2s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,184,0,.8)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,.75)'}>
      {dir === 'left' ? '‹' : '›'}
    </button>
  );
}

function ConfigureCard({ brand, nav }) {
  // Slim horizontal bar — not a full grid cell
  return null;
}

function ConfigureBanner({ nav }) {
  const btnStyle = {
    clipPath: 'none', flex: 1, padding: '12px 16px',
    fontSize: 13, whiteSpace: 'nowrap', letterSpacing: 1.5,
    background: 'var(--y)', color: '#000',
    border: '2px solid var(--y)', cursor: 'pointer',
    fontFamily: 'Orbitron, monospace', fontWeight: 700,
    transition: 'all .2s',
  };
  const btnOutlineStyle = {
    ...btnStyle,
    background: 'transparent', color: '#fff',
    border: '2px solid #fff',
  };
  return (
    <div style={{
      padding: '16px 24px',
      background: 'linear-gradient(90deg, rgba(232,184,0,.07) 0%, transparent 60%)',
      borderBottom: '1px solid var(--b)',
    }}>
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, letterSpacing: 3, color: 'rgba(232,184,0,.6)', textTransform: 'uppercase', marginBottom: 4 }}>Want something fully custom?</div>
      <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 18, color: 'var(--w)', marginBottom: 12 }}>BUILD YOUR OWN — Every material, color, stripe &amp; stitch</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnStyle}
          onClick={() => nav('/configure?brand=BMW')}
          onMouseEnter={e => { e.currentTarget.style.background = '#FFD000'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--y)'; }}>
          CONFIGURE BMW →
        </button>
        <button style={btnStyle}
          onClick={() => nav('/configure?brand=AUDI')}
          onMouseEnter={e => { e.currentTarget.style.background = '#FFD000'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--y)'; }}>
          CONFIGURE AUDI →
        </button>
      </div>
    </div>
  );
}

function PresetCard({ preset, onOpen }) {
  const [imgIdx, setImgIdx] = useState(0);
  const total = preset.images.length;

  return (
    <div style={{ background: 'var(--p)', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'background .2s', minHeight: 480 }}
      onMouseEnter={e => e.currentTarget.style.background = '#242424'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--p)'}>

      {/* Image with working arrows — no onClick on container so arrows work independently */}
      <div style={{ width: '100%', aspectRatio: 1, background: '#0A0A0A', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        {/* Clickable overlay for opening details — sits behind arrows */}
        <div onClick={() => onOpen(preset)} style={{ position: 'absolute', inset: 0, cursor: 'pointer', zIndex: 1 }} />
        <img src={preset.images[imgIdx]} alt={preset.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s', pointerEvents: 'none' }}
          onError={e => e.target.style.display = 'none'} />
        {/* Arrows — zIndex above the overlay */}
        {total > 1 && <div style={{ zIndex: 20, position: 'absolute', top: 0, left: 0, bottom: 0, display: 'flex', alignItems: 'center', paddingLeft: 0 }}><ArrowBtn dir="left" onClick={() => setImgIdx(i => (i - 1 + total) % total)} /></div>}
        {total > 1 && <div style={{ zIndex: 20, position: 'absolute', top: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', paddingRight: 0 }}><ArrowBtn dir="right" onClick={() => setImgIdx(i => (i + 1) % total)} /></div>}
        <div style={{ position: 'absolute', top: 12, left: 12, background: 'var(--y)', color: '#000', fontFamily: 'Orbitron, monospace', fontSize: 11, fontWeight: 700, padding: '3px 8px', letterSpacing: 1, zIndex: 5 }}>{preset.brand}</div>
        <div style={{ position: 'absolute', top: 12, right: 12, background: '#1A3A1A', color: '#3DB85A', fontFamily: 'Orbitron, monospace', fontSize: 11, fontWeight: 700, padding: '3px 8px', letterSpacing: 1, border: '1px solid #3DB85A', zIndex: 5 }}>PRESET</div>
        {total > 1 && (
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 5 }}>
            {preset.images.map((_, i) => (
              <div key={i} onClick={e => { e.stopPropagation(); setImgIdx(i); }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: i === imgIdx ? 'var(--y)' : 'rgba(255,255,255,.3)', cursor: 'pointer', zIndex: 15 }} />
            ))}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(transparent, rgba(0,0,0,.7))', zIndex: 2 }} />
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div onClick={() => onOpen(preset)} style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 24, marginBottom: 4, cursor: 'pointer', transition: 'color .2s' }}
          onMouseEnter={e => e.target.style.color = 'var(--y)'}
          onMouseLeave={e => e.target.style.color = 'inherit'}>
          {preset.name}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(232,184,0,.7)', letterSpacing: 1, marginBottom: 8 }}>✓ {preset.compat}</div>
        <div style={{ fontSize: 12, color: 'var(--t)', lineHeight: 1.5, marginBottom: 12, flex: 1 }}>{preset.desc}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
          {preset.features.slice(0, 4).map(f => (
            <span key={f} style={{ fontSize: 11, padding: '2px 7px', background: 'rgba(232,184,0,.08)', border: '1px solid rgba(232,184,0,.2)', color: 'var(--y)', letterSpacing: 1 }}>{f}</span>
          ))}
        </div>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 28, color: 'var(--y)', marginBottom: 2 }}>${preset.base_price.toFixed(2)}</div>
        <div style={{ fontSize: 12, color: 'var(--t)', marginBottom: 14 }}>Starting price · Options available</div>
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        <button className="btn" style={{ clipPath: 'none', width: '100%' }} onClick={() => onOpen(preset)}>
          VIEW DETAILS
        </button>
        <div style={{ fontSize: 12, color: 'var(--t)', paddingTop: 10, marginTop: 4, borderTop: '1px solid var(--b)', textAlign: 'center' }}>🛡 6 Month Warranty · ⏱ 3–4 Week Build</div>
      </div>
    </div>
  );
}

function PresetPage({ preset, onClose }) {
  const { addItem } = useCart();
  const nav = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);
  const [badge, setBadge] = useState(preset.brand === 'BMW' ? 'M' : 'RS');
  const [m1m2, setM1m2] = useState(false);
  const [airbagCover, setAirbagCover] = useState(true);
  const [airbagUpgrade, setAirbagUpgrade] = useState(false);
  const [heated, setHeated] = useState(true);
  const [laneAssist, setLaneAssist] = useState(true);
  const [notes, setNotes] = useState('');
  const [added, setAdded] = useState(false);
  const total = preset.images.length;
  const isBMW = preset.brand === 'BMW';

  // BMW pricing: heated +$75, lane assist +$30, airbag upgrade +$75
  // Audi pricing: heated free, lane assist free, airbag upgrade +$75
  const totalPrice =
    preset.base_price +
    (!isBMW && airbagCover ? 25 : 0) +
    (airbagUpgrade ? 75   : 0) +
    (heated && isBMW ? 75 : 0) +
    (laneAssist && isBMW ? 30 : 0) +
    (m1m2 && isBMW ? 40 : 0);

  function YesNo({ label, sub, value, onChange }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #1A1A1A', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--w)' }}>{label}</div>
          {sub && <div style={{ fontSize: 12, color: 'var(--y)', marginTop: 2 }}>{sub}</div>}
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

  const buildItem = () => ({
    name: preset.name,
    detail: `${preset.brand} · ${badge} Badge · ${preset.features.slice(0, 2).join(' · ')}`,
    price: totalPrice,
    config: {
      brand: preset.brand,
      presetId: preset.id,
      presetName: preset.name,
      audiBadge: preset.brand === 'AUDI' ? badge : undefined,
      bmwBadge:  preset.brand === 'BMW'  ? badge : undefined,
      m1m2Buttons: m1m2,
      airbagCompat: airbagCover,
      airbagUpgrade,
      heated,
      laneAssist,
      customNotes: notes,
      isPreset: true,
    },
  });

  const handleAdd = () => {
    addItem(buildItem());
    setAdded(true);
    setTimeout(() => onClose(), 1200);
  };

  const handleBuyNow = () => {
    addItem(buildItem());
    onClose();
    nav('/checkout');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--d)', zIndex: 500, overflowY: 'auto', paddingTop: 120 }}>
      <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--b)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onClose}
          style={{ background: 'none', border: '1px solid var(--b)', color: 'var(--t)', cursor: 'pointer', padding: '8px 16px', fontFamily: 'Orbitron, monospace', fontSize: 11, letterSpacing: 2, transition: 'color .2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--y)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--t)'}>
          ← BACK TO CATALOG
        </button>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 22, color: 'var(--t)' }}>{preset.name}</div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: 48, alignItems: 'start' }}>

        {/* Left — images */}
        <div>
          <div style={{ background: '#0A0A0A', position: 'relative', overflow: 'hidden', aspectRatio: 1 }}>
            <ZoomableImage src={preset.images[imgIdx]} alt={preset.name}
              onError={e => e.target.style.display = 'none'}
              buttonStyle={{ top: 12, right: 12, zIndex: 8 }} iconSize={30} />
            {total > 1 && <ArrowBtn dir="left" onClick={() => setImgIdx(i => (i - 1 + total) % total)} />}
            {total > 1 && <ArrowBtn dir="right" onClick={() => setImgIdx(i => (i + 1) % total)} />}
            {total > 1 && (
              <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                {preset.images.map((_, i) => (
                  <div key={i} onClick={() => setImgIdx(i)}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: i === imgIdx ? 'var(--y)' : 'rgba(255,255,255,.3)', cursor: 'pointer' }} />
                ))}
              </div>
            )}
          </div>
          {total > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {preset.images.map((src, i) => (
                <div key={i} onClick={() => setImgIdx(i)}
                  style={{ width: 72, height: 72, background: '#0A0A0A', cursor: 'pointer', overflow: 'hidden', border: `2px solid ${i === imgIdx ? 'var(--y)' : 'transparent'}`, transition: 'border-color .2s' }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, letterSpacing: 3, color: 'var(--y)', textTransform: 'uppercase', marginBottom: 12 }}>What's Included</div>
            {preset.features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, background: 'var(--y)', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: 'var(--w)' }}>{f}</span>
              </div>
            ))}
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(232,184,0,.05)', border: '1px solid rgba(232,184,0,.2)', fontSize: 12, color: 'rgba(232,184,0,.8)', letterSpacing: 1 }}>
              ✓ {preset.compat}
            </div>
          </div>
        </div>

        {/* Right — options */}
        <div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, letterSpacing: 3, color: 'var(--y)', marginBottom: 8 }}>{preset.brand} · PRESET BUILD</div>
          <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 48, lineHeight: 1, marginBottom: 12 }}>{preset.name}</div>
          <div style={{ fontSize: 14, color: 'var(--t)', lineHeight: 1.7, marginBottom: 24 }}>{preset.desc}</div>

          {/* Badge — Audi only */}
          {!isBMW && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, color: 'var(--t)' }}>Lower Badge</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['RS','S','R8'].map(b => (
                  <button key={b} onClick={() => setBadge(b)}
                    style={{ flex: 1, padding: 14, border: `1px solid ${badge === b ? 'var(--y)' : 'var(--b)'}`, background: badge === b ? 'rgba(232,184,0,.08)' : 'transparent', color: badge === b ? 'var(--y)' : 'var(--t)', cursor: 'pointer', fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: 3, transition: 'all .2s' }}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price breakdown */}
          <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(232,184,0,.04)', border: '1px solid rgba(232,184,0,.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--t)', marginBottom: 6 }}>
              <span>Base Price</span><span style={{ color: 'var(--w)' }}>${preset.base_price.toFixed(2)}</span>
            </div>
            {airbagCover && !isBMW && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--t)', marginBottom: 6 }}><span>Airbag Cover</span><span style={{ color: 'var(--y)' }}>+$25.00</span></div>}
            {airbagUpgrade && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--t)', marginBottom: 6 }}><span>Full Airbag Upgrade</span><span style={{ color: 'var(--y)' }}>+$75.00</span></div>}
            {heated && isBMW && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--t)', marginBottom: 6 }}><span>Heated Steering</span><span style={{ color: 'var(--y)' }}>+$75.00</span></div>}
            {laneAssist && isBMW && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--t)', marginBottom: 6 }}><span>Lane Assist</span><span style={{ color: 'var(--y)' }}>+$30.00</span></div>}
            {m1m2 && isBMW && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--t)', marginBottom: 6 }}><span>M1 & M2 Buttons</span><span style={{ color: 'var(--y)' }}>+$40.00</span></div>}
          </div>

          {/* Options */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, color: 'var(--t)' }}>Options</div>
            {!isBMW && <YesNo label="Airbag Cover" sub="+$25.00" value={airbagCover} onChange={setAirbagCover} />}
            <YesNo label={isBMW ? "Full Airbag Unit" : "Full Upgraded Airbag Unit (full airbag not just cover)"} sub="+$75.00" value={airbagUpgrade} onChange={setAirbagUpgrade} />
            <YesNo label="Heated Steering" sub={isBMW ? '+$75.00' : 'Included'} value={heated} onChange={setHeated} />
            <YesNo label="Lane Assist Compatible" sub={isBMW ? '+$30.00' : 'Included'} value={laneAssist} onChange={setLaneAssist} />
            {isBMW && preset.features.some(f => f.includes('M1')) && (
              <YesNo label="M1 & M2 Buttons" sub="+$40.00" value={m1m2} onChange={setM1m2} />
            )}
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--t)', display: 'block', marginBottom: 6 }}>Any other configurations not listed?</label>
            <textarea className="fi" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. specific stitching, custom embroidery..." rows={3} style={{ resize: 'vertical' }} />
          </div>

          {/* Price + buttons */}
          <div style={{ borderTop: '1px solid var(--b)', paddingTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, letterSpacing: 2, color: 'var(--t)' }}>TOTAL</span>
              <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 44, color: 'var(--y)' }}>${totalPrice.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <button className="btn" style={{ clipPath: 'none', flex: 1, fontSize: 12 }} onClick={handleBuyNow}>BUY NOW</button>
              <button className="btn-outline sm" style={{ flex: 1, clipPath: 'none', padding: '13px 20px', fontSize: 13 }} onClick={handleAdd} disabled={added}>
                {added ? '✓ ADDED' : '+ ADD TO CART'}
              </button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--t)', lineHeight: 1.7 }}>🛡 6 Month Warranty · ⏱ 3–4 Week Build · Made to Order</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Catalog() {
  const [filter, setFilter] = useState('ALL');
  const [openPreset, setOpenPreset] = useState(null);
  const nav = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const brand = params.get('brand');
    if (brand) setFilter(brand);

    const presetId = params.get('preset');
    if (presetId) {
      const allPresets = [...BMW_PRESETS, ...AUDI_PRESETS].filter(Boolean);
      const preset = allPresets.find(p => p.id === presetId);
      if (preset) setOpenPreset(preset);
    }
  }, []); // eslint-disable-line

  const showBMW  = filter === 'ALL' || filter === 'BMW';
  const showAUDI = filter === 'ALL' || filter === 'AUDI';

  return (
    <div style={{ paddingTop: 120, minHeight: '100vh' }}>
      <div style={{ padding: '50px 40px 32px', borderBottom: '1px solid var(--b)', background: 'linear-gradient(180deg,rgba(232,184,0,.04) 0%,transparent 100%)' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, letterSpacing: 4, color: 'var(--y)', textTransform: 'uppercase', marginBottom: 8 }}>Shop All</div>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 52, letterSpacing: 2 }}>CATALOG</div>
      </div>

      <div style={{ display: 'flex', gap: 10, padding: '16px 40px', borderBottom: '1px solid var(--b)', flexWrap: 'wrap' }}>
        {['ALL','BMW','AUDI'].map(f => (
          <button key={f} className={`ob${filter === f ? ' on' : ''}`} style={{ fontSize: 13, padding: '5px 16px' }} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <ConfigureBanner nav={nav} />
      <div style={{ maxWidth: 1600, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 1, background: 'var(--b)' }}>
          {showBMW  && BMW_PRESETS.map(p => <PresetCard key={p.id} preset={p} onOpen={setOpenPreset} />)}
          {showAUDI && AUDI_PRESETS.map(p => <PresetCard key={p.id} preset={p} onOpen={setOpenPreset} />)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid var(--b)', background: 'var(--m)', marginTop: 1 }}>
        {[['🛡','6 Month Warranty','Manufacturer guaranteed'],['⏱','3–4 Week Build','Handcrafted to order'],['🔧','BMW & Audi','Fitment specialists']].map(([icon,title,sub]) => (
          <div key={title} style={{ padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 12, borderRight: '1px solid var(--b)' }}>
            <span style={{ fontSize: 22, color: 'var(--y)' }}>{icon}</span>
            <div><div style={{ fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>{title}</div><div style={{ fontSize: 13, color: 'var(--t)' }}>{sub}</div></div>
          </div>
        ))}
      </div>

      {openPreset && <PresetPage preset={openPreset} onClose={() => setOpenPreset(null)} />}
    </div>
  );
}
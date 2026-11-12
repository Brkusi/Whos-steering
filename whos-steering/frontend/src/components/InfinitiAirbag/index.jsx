import { useEffect, useRef, useState } from 'react';
import { COLORS, STITCH_COLORS } from '../../lib/data';
import { INFINITI_LOGO_FINISHES, infinitiEmblemExtraCents, airbagMoney, infinitiLogoPalette, normalizeInfinitiAirbag, infinitiAirbagSummary, infinitiAirbagProduct, INFINITI_LED_NOTICE } from '../../lib/infinitiAirbagConfiguration';
import { renderInfinitiAirbag, drawInfinitiLedFrame } from '../../lib/infinitiAirbagRenderer';
import './style.css';
import {AirbagSpecial} from '../BlackFriday';

export function InfinitiAirbagPreview({ config, productId, children }) {
  const canvas = useRef(null), generation = useRef(0);
  const [state, setState] = useState('loading'), [error, setError] = useState(''), [retry, setRetry] = useState(0);
  const product = infinitiAirbagProduct(productId);
  const normalized = normalizeInfinitiAirbag(config), key = JSON.stringify(normalized);
  useEffect(() => {
    const id = ++generation.current;
    let frame, started;
    setState('loading'); setError('');
    const buffer = document.createElement('canvas');
    renderInfinitiAirbag(buffer, JSON.parse(key), product.id).then(() => {
      if (generation.current !== id || !canvas.current) return;
      canvas.current.width = buffer.width; canvas.current.height = buffer.height;
      canvas.current.getContext('2d').drawImage(buffer, 0, 0); setState('ready');
      if (JSON.parse(key).infinitiLogoFinish === 'LED') {
        const animate = now => {
          if (generation.current !== id || !canvas.current) return;
          if (started === undefined) started = now;
          if (!document.hidden) drawInfinitiLedFrame(canvas.current, buffer, now - started, product.id);
          frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
      }
    }).catch(e => { if (generation.current === id) { setError(e.message); setState('error'); } });
    return () => { generation.current++; cancelAnimationFrame(frame); };
  }, [key, retry, product.id]);
  return <div className="infiniti-preview">
    <div className="infiniti-artboard">
      <AirbagSpecial/>
      <canvas ref={canvas} aria-label={`${product.label} airbag, ${Object.values(infinitiAirbagSummary(config)).join(', ')}`} role="img" />
    </div>
    {children}
    <div className="infiniti-render-status" role="status">{state === 'loading' ? 'Updating preview…' : error || ''}</div>
    {error && <button type="button" onClick={() => setRetry(retry + 1)}>Retry preview</button>}
  </div>;
}
function Swatches({ label, colors, value, onChange }) {
  return <fieldset className="infiniti-options"><legend>{label}<span>{colors.find(c => c.h === value)?.n}</span></legend>
    <div className="infiniti-swatches">{colors.map(c => <button type="button" key={c.h} title={c.n} aria-label={`${label}: ${c.n}`} aria-pressed={value === c.h} onClick={() => onChange(c.h)} style={{ backgroundColor: c.h }}>
      {c.img && <img src={c.img} alt="" loading="lazy" />}<span>{value === c.h ? '✓' : ''}</span>
    </button>)}</div>
  </fieldset>;
}
// Controlled component: the host wheel configurator owns and saves these fields
// alongside its existing config. Changing an airbag field preserves all wheel fields.
export function InfinitiAirbagOptions({ config, onChange }) {
  const cfg = normalizeInfinitiAirbag(config);
  const change = patch => onChange({ ...config, ...cfg, ...patch });
  return <div className="infiniti-controls">
    <fieldset className="infiniti-options"><legend>Airbag material</legend><div className="infiniti-segments">
      {[['Smooth Leather', 'Leather'], ['Alcantara', 'Alcantara / Suede']].map(([value, label]) => <button type="button" key={value} className={`ob${cfg.airbagMat === value ? ' on' : ''}`} aria-pressed={cfg.airbagMat === value} onClick={() => change({ airbagMat: value })}>{label}</button>)}
    </div></fieldset>
    <Swatches label="Airbag color" colors={COLORS} value={cfg.airbagCol} onChange={airbagCol => change({ airbagCol })} />
    <Swatches label="Airbag stitch color" colors={STITCH_COLORS} value={cfg.airbagStitchColor} onChange={airbagStitchColor => change({ airbagStitchColor })} />
    <fieldset className="infiniti-options"><legend>Emblem Finish</legend><div className="infiniti-segments">
      {INFINITI_LOGO_FINISHES.map(finish => <button type="button" key={finish} className={`ob${cfg.infinitiLogoFinish === finish ? ' on' : ''}`} aria-pressed={cfg.infinitiLogoFinish === finish} onClick={() => change({ infinitiLogoFinish: finish, infinitiLogoCol: infinitiLogoPalette(finish)[0].h })}>{finish}<small>{infinitiEmblemExtraCents(finish) ? `+${airbagMoney(infinitiEmblemExtraCents(finish))}` : 'Included'}</small></button>)}
    </div></fieldset>
    {cfg.infinitiLogoFinish === 'LED' && <div className="infiniti-led-notice" role="note"><strong>Bluetooth RGB LED</strong><p>{INFINITI_LED_NOTICE}</p></div>}
    {cfg.infinitiLogoFinish === 'Classic' && <p className="infiniti-led-notice">Chrome Infiniti emblem</p>}
    {!['LED','Classic'].includes(cfg.infinitiLogoFinish) && <Swatches label="Infiniti logo color" colors={infinitiLogoPalette(cfg.infinitiLogoFinish)} value={cfg.infinitiLogoCol} onChange={infinitiLogoCol => change({ infinitiLogoCol })} />}
  </div>;
}

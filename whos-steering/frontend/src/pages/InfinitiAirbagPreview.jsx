import { useRef, useState } from 'react';
import { InfinitiAirbagOptions, InfinitiAirbagPreview } from '../components/InfinitiAirbag';
import { INFINITI_AIRBAG_DEFAULTS, normalizeInfinitiAirbag, infinitiAirbagSummary, infinitiAirbagPrice, airbagMoney, infinitiAirbagCartItem } from '../lib/infinitiAirbagConfiguration';
import { useCart } from '../context';
import { useDialog } from '../components/Experience';
const KEY = 'whossteering:infiniti-q50-airbag:v1';
export default function InfinitiAirbagModulePreview() {
  const {addItem, setCartOpen} = useCart();
  const [review, setReview] = useState(false), panel = useRef(null);
  useDialog(panel, review, () => setReview(false));
  const [config, setConfig] = useState(() => { try { const saved = localStorage.getItem(KEY); return saved ? normalizeInfinitiAirbag(JSON.parse(saved)) : INFINITI_AIRBAG_DEFAULTS; } catch { return INFINITI_AIRBAG_DEFAULTS; } });
  const summary = infinitiAirbagSummary(config), price = infinitiAirbagPrice(config);
  function change(value) { setConfig(value); try { localStorage.setItem(KEY, JSON.stringify(value)); } catch {} }
  return <main className="infiniti-module"><header><div className="eyebrow">WHO’S STEERING / AIRBAG DESIGN</div><h1>INFINITI Q50 <span style={{color:'#999'}}>2014–2017</span></h1><p>Make the details yours. Choose your airbag material, color, stitching and Infiniti emblem finish.</p></header>
    <div className="infiniti-layout"><InfinitiAirbagPreview config={config} /><div><InfinitiAirbagOptions config={config} onChange={change} />
      <div className="infiniti-summary"><strong>Your airbag design</strong><br />{summary.color} {summary.material} · {summary.stitching} stitching<br />{summary.logoFinish} · {summary.logoColor}</div>
      <div className="infiniti-price" aria-live="polite"><div><span>Airbag</span><span>{airbagMoney(price.base)}</span></div><div><span>{summary.logoFinish} emblem</span><span>{price.emblem ? `+${airbagMoney(price.emblem)}` : 'Included'}</span></div><div className="infiniti-price-total"><strong>Total</strong><strong>{airbagMoney(price.total)}</strong></div></div>
      <button type="button" className="btn infiniti-add-to-cart" onClick={() => setReview(true)}>+ ADD TO CART</button>
    </div></div>
    {review && <div className="infiniti-review-backdrop"><div ref={panel} className="infiniti-review" role="dialog" aria-modal="true" aria-labelledby="airbag-review-title" tabIndex={-1}>
      <div className="eyebrow">REVIEW YOUR BUILD</div><h2 id="airbag-review-title">YOUR AIRBAG COVER</h2>
      <dl>{[['Vehicle','Infiniti Q50 · 2014–2017'],['Material',summary.material],['Airbag color',summary.color],['Stitching',summary.stitching],['Emblem Finish',summary.logoFinish],['Emblem color',summary.logoColor],['Total',airbagMoney(price.total)]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      {config.infinitiLogoFinish === 'LED' && <p className="infiniti-led-notice">The LED emblem must be wired properly upon installation.</p>}
      <button type="button" className="btn" onClick={() => {addItem(infinitiAirbagCartItem(config)); setReview(false); setCartOpen(true);}}>LOOKS PERFECT — ADD TO CART</button>
      <button type="button" className="btn-outline sm" onClick={() => setReview(false)}>MAKE CHANGES</button>
    </div></div>}
  </main>;
}

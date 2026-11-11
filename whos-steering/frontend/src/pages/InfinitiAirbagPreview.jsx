import { useState } from 'react';
import { InfinitiAirbagOptions, InfinitiAirbagPreview } from '../components/InfinitiAirbag';
import { INFINITI_AIRBAG_DEFAULTS, normalizeInfinitiAirbag, infinitiAirbagSummary, infinitiAirbagPrice, airbagMoney } from '../lib/infinitiAirbagConfiguration';
const KEY = 'whossteering:infiniti-q50-airbag:v1';
export default function InfinitiAirbagModulePreview() {
  const [config, setConfig] = useState(() => { try { const saved = localStorage.getItem(KEY); return saved ? normalizeInfinitiAirbag(JSON.parse(saved)) : INFINITI_AIRBAG_DEFAULTS; } catch { return INFINITI_AIRBAG_DEFAULTS; } });
  const summary = infinitiAirbagSummary(config), price = infinitiAirbagPrice(config);
  function change(value) { setConfig(value); try { localStorage.setItem(KEY, JSON.stringify(value)); } catch {} }
  return <main className="infiniti-module"><header><div className="eyebrow">WHO’S STEERING / AIRBAG DESIGN</div><h1>INFINITI Q50 <span style={{color:'#999'}}>2014–2017</span></h1><p>Make the details yours. Choose your airbag material, color, stitching and Infiniti emblem finish.</p></header>
    <div className="infiniti-layout"><InfinitiAirbagPreview config={config} /><div><InfinitiAirbagOptions config={config} onChange={change} />
      <div className="infiniti-summary"><strong>Your airbag design</strong><br />{summary.color} {summary.material} · {summary.stitching} stitching<br />{summary.logoFinish} · {summary.logoColor}</div>
      <div className="infiniti-price" aria-live="polite"><div><span>Airbag</span><span>{airbagMoney(price.base)}</span></div><div><span>{summary.logoFinish} emblem</span><span>{price.emblem ? `+${airbagMoney(price.emblem)}` : 'Included'}</span></div><div className="infiniti-price-total"><strong>Total</strong><strong>{airbagMoney(price.total)}</strong></div></div>
    </div></div>
  </main>;
}

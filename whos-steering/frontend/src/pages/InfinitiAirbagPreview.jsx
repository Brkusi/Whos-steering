import { useState } from 'react';
import { InfinitiAirbagOptions, InfinitiAirbagPreview } from '../components/InfinitiAirbag';
import { INFINITI_AIRBAG_DEFAULTS, normalizeInfinitiAirbag, infinitiAirbagSummary } from '../lib/infinitiAirbagConfiguration';
const KEY = 'whossteering:infiniti-q50-airbag:v1';
export default function InfinitiAirbagModulePreview() {
  const [config, setConfig] = useState(() => { try { const saved = localStorage.getItem(KEY); return saved ? normalizeInfinitiAirbag(JSON.parse(saved)) : INFINITI_AIRBAG_DEFAULTS; } catch { return INFINITI_AIRBAG_DEFAULTS; } });
  const summary = infinitiAirbagSummary(config);
  function change(value) { setConfig(value); try { localStorage.setItem(KEY, JSON.stringify(value)); } catch {} }
  return <main className="infiniti-module"><header><div className="eyebrow">WHO’S STEERING / AIRBAG DESIGN</div><h1>INFINITI Q50 <span style={{color:'#999'}}>2014–2017</span></h1><p>Make the details yours. Choose your airbag material, color, stitching and Infiniti emblem finish.</p></header>
    <div className="infiniti-layout"><InfinitiAirbagPreview config={config} /><div><InfinitiAirbagOptions config={config} onChange={change} />
      <div className="infiniti-summary"><strong>Your airbag design</strong><br />{summary.color} {summary.material} · {summary.stitching} stitching<br />{summary.logoFinish} · {summary.logoColor}<br /><button className="reset" type="button" onClick={() => change(INFINITI_AIRBAG_DEFAULTS)}>Reset design</button></div>
    </div></div>
  </main>;
}

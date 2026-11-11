import { useEffect, useRef, useState } from 'react';
import { InfinitiAirbagOptions, InfinitiAirbagPreview } from '../components/InfinitiAirbag';
import { INFINITI_AIRBAG_DEFAULTS, normalizeInfinitiAirbag, infinitiAirbagSummary, infinitiAirbagPrice, airbagMoney, infinitiAirbagCartItem } from '../lib/infinitiAirbagConfiguration';
import { useCart } from '../context';
import { BuildCheckoutTotal, FloatingBuildTotal, BuildReviewDialog } from '../components/BuildControls';
function BuildCheckout({price,onReview,className=''}) {
  return <div className={className}><BuildCheckoutTotal price={price.total/100} onReview={onReview} mobile={className === 'infiniti-mobile-checkout'} /></div>;
}
const KEY = 'whossteering:infiniti-q50-airbag:v1';
export default function InfinitiAirbagModulePreview() {
  const {addItem, setCartOpen, cartOpen} = useCart();
  const [review, setReview] = useState(false), reviewAnchor = useRef(null);
  const [reviewVisible, setReviewVisible] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setReviewVisible(entry.isIntersecting), {rootMargin:'-120px 0px -90px 0px',threshold:0});
    if (reviewAnchor.current) observer.observe(reviewAnchor.current);
    return () => observer.disconnect();
  }, []);
  const [config, setConfig] = useState(() => { try { const saved = localStorage.getItem(KEY); return saved ? normalizeInfinitiAirbag(JSON.parse(saved)) : INFINITI_AIRBAG_DEFAULTS; } catch { return INFINITI_AIRBAG_DEFAULTS; } });
  const summary = infinitiAirbagSummary(config), price = infinitiAirbagPrice(config);
  function change(value) { setConfig(value); try { localStorage.setItem(KEY, JSON.stringify(value)); } catch {} }
  return <main className="infiniti-module"><header><div className="eyebrow">WHO’S STEERING / AIRBAG DESIGN</div><h1>INFINITI Q50 <span style={{color:'#999'}}>2014–2017</span></h1><p>Make the details yours. Choose your airbag material, color, stitching and Infiniti emblem finish.</p></header>
    <div className="infiniti-layout"><InfinitiAirbagPreview config={config}><BuildCheckout className="infiniti-desktop-checkout" price={price} onReview={() => setReview(true)} /></InfinitiAirbagPreview><div><InfinitiAirbagOptions config={config} onChange={change} />
      <section ref={reviewAnchor} className="infiniti-build-review" tabIndex={-1} aria-label="Review your airbag build">
      <div className="infiniti-summary"><strong>Your airbag design</strong><br />{summary.color} {summary.material} · {summary.stitching} stitching<br />{summary.logoFinish} · {summary.logoColor}</div>
      <div className="infiniti-price" aria-live="polite"><div><span>Airbag</span><span>{airbagMoney(price.base)}</span></div><div><span>{summary.logoFinish} emblem</span><span>{price.emblem ? `+${airbagMoney(price.emblem)}` : 'Included'}</span></div></div>
      <BuildCheckout className="infiniti-mobile-checkout" price={price} onReview={() => setReview(true)} />
      </section>
    </div></div>
    {!review && !cartOpen && !reviewVisible && <FloatingBuildTotal className="infiniti-floating-total" price={price.total/100} onReview={() => {reviewAnchor.current?.scrollIntoView?.({behavior:'smooth',block:'start'});reviewAnchor.current?.focus({preventScroll:true});}} />}
    {review && <BuildReviewDialog className="infiniti-review" rows={[
      ['Vehicle','Infiniti Q50 · 2014–2017'],['Material',summary.material],['Airbag color',summary.color],['Stitching',summary.stitching],['Emblem Finish',summary.logoFinish],['Emblem color',summary.logoColor],['Est. Price',airbagMoney(price.total)],
    ]} onClose={() => setReview(false)} onConfirm={() => {addItem(infinitiAirbagCartItem(config)); setReview(false); setCartOpen(true);}}>
      {config.infinitiLogoFinish === 'LED' && <p className="infiniti-led-notice">The LED emblem must be wired properly upon installation.</p>}
    </BuildReviewDialog>}

  </main>;
}

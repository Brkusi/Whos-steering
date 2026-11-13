import {useRef,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {apiFetch} from '../lib/api';
import {CLUSTER_PATH,CLUSTER_IMAGE,CLUSTER_NAME,CLUSTER_PRODUCT,CLUSTER_FEATURES} from '../lib/digitalCluster';
import './DigitalCluster.css';

export function DigitalClusterCard(){
 return <article className="cluster-card">
  <Link to={CLUSTER_PATH} className="cluster-card-art" aria-label={`Explore ${CLUSTER_NAME}`}><span className="cluster-card-brand">AUDI</span><img src={CLUSTER_IMAGE} alt={CLUSTER_NAME} loading="lazy"/><span className="cluster-card-status">COMING SOON</span></Link>
  <div className="cluster-card-body"><h2><Link to={CLUSTER_PATH}>DIGITAL INSTRUMENT CLUSTER</Link></h2><p className="cluster-fitment">Audi A6 / A7 · 2012–2018 · C7</p><p>Your digital cockpit, reimagined. Explore the 12.3-inch display, wireless connectivity and factory integration.</p><div className="cluster-card-tags"><span>12.3″ IPS HD</span><span>4 UI THEMES</span><span>WIRELESS CARPLAY</span></div><Link className="btn" to={`${CLUSTER_PATH}?waitlist=1#cluster-waitlist`}>JOIN THE WAITLIST</Link><Link className="cluster-explore-link" to={CLUSTER_PATH}>EXPLORE THE SYSTEM ↗</Link></div>
 </article>;
}

export default function DigitalCluster(){
 const [active,setActive]=useState(null);
 const [params]=useSearchParams();
 const [formOpen,setFormOpen]=useState(params.get('waitlist')==='1');
 const [form,setForm]=useState({name:'',email:'',vehicle:'',consent:false});
 const [status,setStatus]=useState('idle');
 const [error,setError]=useState('');
 const formRef=useRef(null);
 const detail=CLUSTER_FEATURES.find(item=>item.id===active);
 const token=typeof window!=='undefined'?window.location.hash.match(/^#unsubscribe-([a-f0-9]{64})$/)?.[1]:null;
 const [removed,setRemoved]=useState(false);
 function update(key,value){setForm(previous=>({...previous,[key]:value}));setError('');}
 function openWaitlist(){setFormOpen(true);requestAnimationFrame(()=>{formRef.current?.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});formRef.current?.querySelector('input')?.focus({preventScroll:true});});}
 async function join(event){
  event.preventDefault();if(status==='sending'||status==='success')return;
  setStatus('sending');setError('');
  try{const result=await apiFetch('/api/waitlist/subscribe',{method:'POST',body:JSON.stringify({...form,product:CLUSTER_PRODUCT})});if(result.ok!==true)throw new Error('Your signup could not be confirmed. Please try again.');setStatus('success');}
  catch(err){setStatus('idle');setError(err.message||'Please try again. Your signup has not been confirmed.');}
 }
 async function unsubscribe(){setStatus('sending');setError('');try{await apiFetch('/api/waitlist/unsubscribe',{method:'POST',body:JSON.stringify({id:token})});setRemoved(true);}catch(err){setError(err.message);}finally{setStatus('idle');}}
 return <main className="cluster-page">
  <div className="cluster-breadcrumb"><Link to="/catalog">STORE</Link><span>/</span><span>AUDI DIGITAL COCKPIT</span></div>
  <header className="cluster-header"><div><p className="cluster-eyebrow">AUDI A6 / A7 · 2012–2018 · C7 / 4G8</p><h1>YOUR COCKPIT.<br/><span>REIMAGINED.</span></h1><p className="cluster-intro">{CLUSTER_NAME}. A familiar fit. An entirely new perspective.</p></div><div className="cluster-header-cta"><span className="cluster-coming"><i/> COMING SOON</span><button className="btn" onClick={openWaitlist}>JOIN THE WAITLIST ↗</button><p>Get notified when it’s available.</p></div></header>
  {token&&<section className="cluster-unsubscribe"><h2>Product waitlist</h2><p role="status">{removed?'You’ve been removed from this product’s waitlist.':'Unsubscribe from Digital Instrument Cluster availability updates.'}</p>{!removed&&<button className="btn-outline" onClick={unsubscribe} disabled={status==='sending'}>UNSUBSCRIBE</button>}{error&&<p role="alert">{error}</p>}</section>}
  <section className="cluster-explorer" aria-label="Interactive instrument cluster">
   <div className="cluster-view" onKeyDown={event=>{if(event.key==='Escape')setActive(null);}}>
    <div className="cluster-view-label"><span>EXPLORE THE SYSTEM</span></div>
    <div className={`cluster-viewport${detail?' is-focused':''}`}>
     <div className="cluster-image-layer" style={{transform:detail?`translate(${(50-detail.x)*detail.scale}%, ${(50-detail.y)*detail.scale}%) scale(${detail.scale})`:'translate(0%, 0%) scale(1)'}}>
      <img src={CLUSTER_IMAGE} alt="Audi A6/A7 digital instrument cluster with twin gauges and center media display" draggable="false" fetchpriority="high"/>
      {CLUSTER_FEATURES.map(item=><button key={item.id} type="button" className={`cluster-hotspot${active===item.id?' selected':''}`} style={{left:`${item.x}%`,top:`${item.y}%`}} aria-label={`Explore ${item.label}`} aria-pressed={active===item.id} aria-controls="cluster-detail" onClick={()=>setActive(active===item.id?null:item.id)}><span aria-hidden="true"/></button>)}
     </div>
     <div className="cluster-popover-host" aria-live="polite" aria-atomic="true">{detail&&<section className="cluster-popover" id="cluster-detail" aria-label={detail.label} key={detail.id}>
      <button type="button" className="cluster-popover-close" aria-label="Close feature details" onClick={()=>setActive(null)}>×</button>
      <p className="cluster-eyebrow">{detail.label}</p><h2>{detail.title}</h2><p>{detail.description}</p><ul className="cluster-options">{detail.options.map(option=><li key={option}>{option}</li>)}</ul><p className="cluster-detail-note">{detail.detail}</p>
     </section>}</div>
    </div>
    <div className="cluster-view-footer"><p>{detail?'Select another feature below or reset the view.':'Tap a glowing point to take a closer look.'}</p><button className="cluster-reset" disabled={!active} onClick={()=>setActive(null)}>↺ RESET VIEW</button></div>
   </div>

   <div className="cluster-feature-nav" role="group" aria-label="System features">{CLUSTER_FEATURES.map(item=><button key={item.id} aria-pressed={active===item.id} aria-controls="cluster-detail" onClick={()=>setActive(active===item.id?null:item.id)}><span className="cluster-feature-dot" aria-hidden="true"/><span><strong>{item.label}</strong><small>{item.short}</small></span><span className="cluster-feature-arrow">↗</span></button>)}</div>
  </section>
  <section className="cluster-specs" aria-label="Product highlights"><div><span>01 / CLARITY</span><h2>SEE THE DIFFERENCE.</h2><p>1920 × 720 resolution, 2K visual support and an automotive Linux operating system.</p></div><div><span>02 / CONNECTION</span><h2>STAY CONNECTED.</h2><p>Wireless Apple CarPlay, Android Auto, AirPlay and HiCar. HDMI input, factory HUD and reversing camera support.</p></div><div><span>03 / INTEGRATION</span><h2>KEEP WHAT MATTERS.</h2><p>Retain your original mainboard, vehicle data, steering wheel controls, factory menus and safety alerts.</p></div></section>
  <section id="cluster-waitlist" ref={formRef} className="cluster-waitlist"><div><p className="cluster-eyebrow">BE FIRST TO KNOW</p><h2>YOUR NEXT UPGRADE<br/>STARTS HERE.</h2><p>Join the waitlist for the Audi A6/A7 2012–2018 Digital Instrument Cluster. We’ll let you know when it’s available.</p></div><div className="cluster-form-wrap">
   {status==='success'?<div className="cluster-success" role="status"><span>✓</span><h3>YOU’RE ON THE LIST.</h3><p>We’ve saved your interest in the Audi A6/A7 Digital Instrument Cluster. Keep an eye on your inbox for availability updates.</p></div>:formOpen?<form onSubmit={join}>
    <label htmlFor="cluster-name">FULL NAME</label><input className="fi" id="cluster-name" autoComplete="name" maxLength={100} required value={form.name} onChange={event=>update('name',event.target.value)} disabled={status==='sending'}/>
    <label htmlFor="cluster-email">EMAIL ADDRESS</label><input className="fi" id="cluster-email" type="email" autoComplete="email" maxLength={254} required value={form.email} onChange={event=>update('email',event.target.value)} disabled={status==='sending'}/>
    <label htmlFor="cluster-vehicle">YOUR VEHICLE (OPTIONAL)</label><input className="fi" id="cluster-vehicle" placeholder="e.g. 2016 Audi A7" maxLength={200} value={form.vehicle} onChange={event=>update('vehicle',event.target.value)} disabled={status==='sending'}/>
    <label className="cluster-consent"><input type="checkbox" required checked={form.consent} onChange={event=>update('consent',event.target.checked)} disabled={status==='sending'}/><span>Email me about this product’s availability. I can unsubscribe at any time. <Link to="/privacy">Privacy policy</Link></span></label>
    {error&&<p className="cluster-error" role="alert">{error}</p>}<button className="btn" type="submit" disabled={status==='sending'}>{status==='sending'?'JOINING…':'JOIN THE WAITLIST ↗'}</button><p className="cluster-form-note">No payment required. Joining the waitlist does not place an order.</p>
   </form>:<><button className="btn" onClick={openWaitlist}>JOIN THE WAITLIST ↗</button><p className="cluster-form-note">Availability updates. No payment required.</p></>}
  </div></section>
 </main>;
}

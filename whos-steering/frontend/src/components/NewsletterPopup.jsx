import {useEffect,useRef,useState} from 'react';
import {apiFetch} from '../lib/api';
import {blackFridayActive} from '../lib/blackFriday';
import {useDialog} from './Experience';
import './NewsletterPopup.css';
const KEY='ws_newsletter_popup_v1';
export default function NewsletterPopup(){
 const [open,setOpen]=useState(false),[email,setEmail]=useState(''),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[success,setSuccess]=useState(false),[error,setError]=useState('');
 const dialog=useRef(null);
 function close(){setOpen(false);try{if(!success)localStorage.setItem(KEY,String(Date.now()));}catch{}}
 useDialog(dialog,open,close);
 useEffect(()=>{let seen=0;try{seen=Number(localStorage.getItem(KEY)||0);}catch{} if(Date.now()-seen<7*86400000)return;const timer=setTimeout(()=>setOpen(true),5000);return()=>clearTimeout(timer);},[]);
 async function submit(event){event.preventDefault();setBusy(true);setError('');try{await apiFetch('/api/newsletter/subscribe',{method:'POST',body:JSON.stringify({email,consent})});setSuccess(true);try{localStorage.setItem(KEY,String(Date.now()+365*86400000));}catch{}}catch(e){setError(e.message);}finally{setBusy(false);}}
 if(!open)return null;
 return <div className="newsletter-overlay" onClick={event=>{if(event.target===event.currentTarget)close();}}><section ref={dialog} className="newsletter-popup" role="dialog" aria-modal="true" aria-labelledby="newsletter-title" tabIndex={-1}>
 <button className="newsletter-close" type="button" aria-label="Close newsletter popup" onClick={close}>×</button>
 <div className="newsletter-visual" aria-hidden="true"><img src="/ws-logo.png" alt=""/><span>BUILT FOR<br/>YOUR NEXT MOVE.</span></div>
 <div className="newsletter-copy"><img className="newsletter-mobile-logo" src="/ws-logo.png" alt="Who’s Steering"/><p className="newsletter-eyebrow">{blackFridayActive()?'BLACK FRIDAY SPECIAL · NEWSLETTER':'WHO’S STEERING NEWSLETTER'}</p><h2 id="newsletter-title">{success?'YOU’RE ON THE LIST.':blackFridayActive()?'UP TO 30% OFF.':'MAKE IT YOURS.'}</h2>
 {success?<><p>Thanks for signing up. Watch your inbox for offers, new builds and product updates.</p><button type="button" className="btn" onClick={close}>KEEP EXPLORING</button></>:<><p>{blackFridayActive()?'Nov 11–28 · Infiniti airbag covers from $159.99 and 10% off custom steering wheels. In-stock wheels excluded from the wheel offer.':'Get offers, new builds and product updates in your inbox.'}</p>
 <form onSubmit={submit}><label htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
 <label className="newsletter-consent"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>Email me offers and product news from Who’s Steering. I can unsubscribe at any time.</span></label>
 <button className="btn" disabled={busy}>{busy?'SIGNING UP…':'JOIN THE LIST'}</button>{error&&<p role="alert">{error}</p>}</form><small><a href="/privacy">Privacy policy</a></small><button type="button" className="newsletter-skip" onClick={close}>Maybe later</button></>}
 </div></section></div>;
}

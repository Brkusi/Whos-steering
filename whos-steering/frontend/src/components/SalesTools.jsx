import {useEffect,useState} from 'react';
import {apiFetch} from '../lib/api';
import './SalesTools.css';
export function trackSales(event) {
  try {
    let session=sessionStorage.getItem('ws_sales_session');
    if(!session){session=crypto.randomUUID();sessionStorage.setItem('ws_sales_session',session);}
    apiFetch('/api/sales/events',{method:'POST',body:JSON.stringify({session,event})}).catch(()=>{});
  }catch{}
}
export default function SalesTools({config,items}) {
  const [email,setEmail]=useState('');
  const [fullName,setFullName]=useState('');
  const [consent,setConsent]=useState(false);
  const [status,setStatus]=useState(null);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [link,setLink]=useState('');
  useEffect(()=>{apiFetch('/api/sales/status').then(setStatus).catch(()=>{});},[]);
  async function submit(e,fitment=false) {
    e.preventDefault();
    const form=e.currentTarget.form || e.currentTarget;
    if(fitment ? !form.reportValidity() : !form.querySelector('input[type="email"]').reportValidity())return;
    if(fitment && !fullName.trim()){setMessage('Enter your full name for your fitment inquiry.');return;}
    setBusy(true);setMessage('');setLink('');
    try {
      const result=await apiFetch('/api/sales/save',{method:'POST',body:JSON.stringify({email,consent,kind:fitment?'fitment':items?'checkout':'build',payload:fitment?{fullName:fullName.trim(),brand:config.brand,year:config.vehicleYear,model:config.vehicleModel,photoUrl:config.photoUrl,config}:items?{items}:{config}})});
      if(fitment)setMessage('Your fitment request has been saved for our team. We’ll reply to your email.');
      else {setLink(result.url);setMessage(result.emailed?'Saved! Your private link is also on its way by email.':'Saved! Copy your private link below to return within 30 days.');}
    }catch(err){setMessage(err.message);}finally{setBusy(false);}
  }
  return <section className="sales-tools"><h3>{items?'Not ready to check out?':'Save your build or ask about fitment'}</h3><p>Keep your exact selections with a private link, valid for 30 days.</p><form noValidate onSubmit={submit}>{config&&<label>Full name (required for fitment)<input required name="fullName" type="text" maxLength={120} value={fullName} onChange={e=>setFullName(e.target.value)} autoComplete="name"/></label>}<label>Email<input required type="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label>{status?.recovery&&<label className="sales-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> Email me up to three reminders about this wheel. I can unsubscribe anytime.</label>}<div className="sales-actions"><button className="btn-outline" disabled={busy}>{busy?'SAVING…':'SAVE MY BUILD'}</button>{config&&<button type="button" className="btn-outline" disabled={busy} onClick={e=>submit(e,true)}>ASK ABOUT FITMENT</button>}</div>{config&&<small>For fitment help, first add your vehicle year, model, and current wheel photo above. Our team will review compatibility.</small>}<p role="status">{message}</p>{link&&<label>Your private return link<input readOnly value={link} onFocus={e=>e.target.select()}/></label>}<small>By saving, you request a saved-build link. Fitment requests include your name, wheel, selections, vehicle details, and photo. <a href="/privacy">Privacy policy</a></small></form></section>;
}

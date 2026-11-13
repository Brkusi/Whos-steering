import {useState} from 'react';
import {apiFetch} from '../lib/api';
export default function WaitlistAdmin(){
 const [message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 async function download(){
  setBusy(true);setMessage('');
  try{
   const {subscribers}=await apiFetch('/api/waitlist/admin');
   const quote=value=>'"'+(/^[\s]*[=+@-]/.test(String(value??''))?"'"+String(value):String(value??'')).replaceAll('"','""')+'"';
   const rows=[['Product','Full name','Email','Vehicle','Signup date','Consent date','Unsubscribe URL'],...subscribers.map(row=>[row.product,row.name,row.email,row.vehicle,row.createdAt,row.consentAt,row.unsubscribeUrl])];
   const url=URL.createObjectURL(new Blob([rows.map(row=>row.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
   const link=document.createElement('a');link.href=url;link.download='whossteering-product-waitlist.csv';link.click();URL.revokeObjectURL(url);
   setMessage(`${subscribers.length} active waitlist signups exported.`);
  }catch(error){setMessage(error.message);}finally{setBusy(false);}
 }
 return <section className="sales-panel"><p className="eyebrow">Product availability</p><h2>Digital Instrument Cluster waitlist</h2><p>Audi A6/A7 2012–2018 availability requests. Include each customer’s unsubscribe link in availability emails. These signups are separate from the newsletter.</p><button className="btn-outline" onClick={download} disabled={busy}>{busy?'EXPORTING…':'EXPORT WAITLIST'}</button><p role="status">{message}</p></section>;
}

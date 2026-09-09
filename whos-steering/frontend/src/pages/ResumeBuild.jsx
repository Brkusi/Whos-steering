import {useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {apiFetch} from '../lib/api';
import {useCart} from '../context';
import {trackSales} from '../components/SalesTools';
export default function ResumeBuild({unsubscribe=false}) {
 const [saved,setSaved]=useState(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const nav=useNavigate();const {addItem}=useCart();
 const id=window.location.hash.slice(1);
 useEffect(()=>{if(unsubscribe)return;apiFetch(`/api/sales/saved/${encodeURIComponent(id)}`).then(setSaved).catch(e=>setMessage(e.message));},[id,unsubscribe]);
 async function restore(){setBusy(true);try{
  if(unsubscribe){await apiFetch('/api/sales/unsubscribe',{method:'POST',body:JSON.stringify({id})});setMessage('You’re unsubscribed from build reminders.');return;}
  trackSales('build_resumed');
  sessionStorage.setItem('ws_sales_source',id);
  if(saved.kind==='build'){sessionStorage.setItem('ws_restore_build',JSON.stringify(saved.payload.config));nav(`/configure?brand=${encodeURIComponent(saved.payload.config.brand)}`);}
  else {for(const item of saved.payload.items)addItem(item);nav('/checkout');}
 }catch(e){setMessage(e.message);setBusy(false);}}
 return <main className="empty-state" style={{maxWidth:700,margin:'auto'}}><h1>{unsubscribe?'Build reminders':'Your saved wheel'}</h1><p>{message||(unsubscribe?'Confirm below to stop reminder emails.':saved?'Your selections are ready. Current prices will be confirmed at checkout.':'Loading your selections…')}</p>{(saved||unsubscribe)&&!busy&&<button className="btn" onClick={restore}>{unsubscribe?'UNSUBSCRIBE':saved.kind==='build'?'CONTINUE MY BUILD':'ADD SAVED ITEMS TO CART'}</button>}<p><a href="/build">Start a new build</a></p></main>;
}

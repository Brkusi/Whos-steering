import * as React from 'react'
import {Link} from 'react-router-dom'
import wheel from '../assets/hero/hero-wheel-highlighted.webp'
import './WheelDetails.css'
const details=[
 {title:'Your grip. Your feel.',label:'Grip materials',body:'Choose smooth leather, perforated leather, or Alcantara / suede, then select your color.',function:'The grip material changes the texture and feel in your hands.',x:12,y:52},
 {title:'Make your signature.',label:'Stitching & stripe',body:'Choose your stitching color and 12 o’clock stripe, or keep the rim clean with no stripe.',function:'Coordinate the details with your interior, exterior, or personal style.',x:50,y:8},
 {title:'Finish meets function.',label:'Carbon & controls',body:'Explore carbon finishes, inlay colors, and available paddle-shifter options.',function:'Button, paddle, and heating options are confirmed for your exact vehicle.',x:78,y:54}
]
export default function WheelDetails(){
 const [active,setActive]=React.useState(null)
 const uid=React.useId().replace(/:/g,'')
 const buttons=React.useRef([])
 const closeButton=React.useRef(null)
 const last=React.useRef(0)
 const wasOpen=React.useRef(false)
 const chosen=active===null?null:details[active]
 const open=(i)=>{last.current=i;setActive(i)}
 const close=()=>setActive(null)
 React.useEffect(()=>{
  if(active!==null){wasOpen.current=true;closeButton.current?.focus()}
  else if(wasOpen.current){buttons.current[last.current]?.focus();wasOpen.current=false}
 },[active])
 const scale=chosen?2.45:1
 return <div className={'ws-wheel-details'+(chosen?' ws-detail-open':'')}  onKeyDown={e=>{if(e.key==='Escape'&&active!==null){e.preventDefault();close()}}}>
 <img src={wheel} alt={chosen?'Magnified view: '+chosen.label:'Custom BMW steering wheel with suede grips, carbon trim and red stripe'} draggable={false} style={{transform:chosen?`translate(${(50-chosen.x)*scale}%, ${-15+(50-chosen.y)*scale}%) scale(${scale})`:'translate(0,0) scale(1)'}}/>

 {details.map((d,i)=><button className="ws-hotspot" type="button" key={d.label} ref={el=>{buttons.current[i]=el}} style={{left:d.x+'%',top:d.y+'%',visibility:active===null?'visible':'hidden'}} aria-label={'Zoom in: '+d.label} aria-expanded={active===i} aria-controls={uid+'-detail'} onClick={()=>open(i)}>+</button>)}
 {chosen&&<div className="ws-detail-note" id={uid+'-detail'} role="dialog" aria-label={chosen.label+' customization details'}><p className="ws-detail-kicker">DETAIL VIEW · {chosen.label}</p><h3>{chosen.title}</h3><p>{chosen.body}</p><p className="ws-function">{chosen.function}</p><button ref={closeButton} type="button" className="ws-back" aria-label="Back to full wheel" onClick={close}>← Full wheel</button><Link className="ws-detail-link" to="/build">Customize your wheel <span aria-hidden="true">↗</span></Link></div>}
 </div>
}

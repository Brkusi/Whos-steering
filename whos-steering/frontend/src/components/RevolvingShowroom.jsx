import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { WHEEL_STYLES } from '../lib/wheelStyles';
import './RevolvingShowroom.css';

const BRANDS = {BMW:'BMW', AUDI:'Audi', MERCEDES:'Mercedes', TOYOTA:'Toyota', PORSCHE:'Porsche', DODGE_SRT:'Dodge'};
const groups=Object.keys(BRANDS).map(brand=>WHEEL_STYLES.filter(wheel=>wheel.brand===brand));
export const SHOWROOM_WHEELS=Array.from({length:Math.max(...groups.map(group=>group.length))},(_,index)=>groups.map(group=>group[index]).filter(Boolean)).flat();
export const wheelName = wheel => wheel.label.startsWith(BRANDS[wheel.brand]) ? wheel.label : `${BRANDS[wheel.brand]} ${wheel.label}`;
const imageCache = new Map();
function loadImage(src) {
  if (!imageCache.has(src)) imageCache.set(src, new Promise((resolve,reject) => {
    const image = new Image(); image.onload=()=>resolve(image); image.onerror=reject; image.src=src;
  }));
  return imageCache.get(src);
}

// Render existing configurator photographs as a transparent canvas composition.
// Only connected near-black backdrop regions are keyed; small dark product details remain.
export function clearBackdrop(pixels, width, height) {
  const seen = new Uint8Array(width*height);
  const queue = new Int32Array(width*height);
  for(let start=0;start<seen.length;start++) {
    if(seen[start]) continue;
    const offset=start*4;
    if(pixels[offset+3]===0 || Math.max(pixels[offset],pixels[offset+1],pixels[offset+2])>12) {seen[start]=1;continue;}
    let head=0,tail=1;queue[0]=start;seen[start]=1;
    while(head<tail) {
      const at=queue[head++],x=at%width;
      const neighbors=[x>0?at-1:-1,x<width-1?at+1:-1,at-width,at+width];
      neighbors.forEach(next=>{
        if(next<0||next>=seen.length||seen[next])return;
        const n=next*4;
        if(pixels[n+3]>0&&Math.max(pixels[n],pixels[n+1],pixels[n+2])<=12){seen[next]=1;queue[tail++]=next;}
      });
    }
    if(tail>width*height*.001) for(let i=0;i<tail;i++) pixels[queue[i]*4+3]=0;
  }
}
function WheelArt({wheel}) {
  const canvas=useRef(null);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    let cancelled=false;
    const sources=[wheel.image,...(wheel.imageOverlays||(wheel.imageOverlay?[wheel.imageOverlay]:[]))];
    Promise.all(sources.map(loadImage)).then(images=>{
      if(cancelled||!canvas.current)return;
      const c=canvas.current,ctx=c.getContext('2d',{willReadFrequently:true});
      c.width=640;c.height=640;
      images.forEach((image,index)=>{
        const layer=document.createElement('canvas');layer.width=640;layer.height=640;
        const lc=layer.getContext('2d',{willReadFrequently:true});
        const crop=wheel.style==='R8'&&index===0?{x:1163,y:552,w:354,h:404}:{x:0,y:0,w:image.width,h:image.height};
        const size=Math.min(640/crop.w,640/crop.h);
        lc.drawImage(image,crop.x,crop.y,crop.w,crop.h,(640-crop.w*size)/2,(640-crop.h*size)/2,crop.w*size,crop.h*size);
        // Already-transparent files retain their original alpha and details.
        const data=lc.getImageData(0,0,640,640);
        const firstPixel=(Math.min(639,Math.ceil((640-crop.h*size)/2)+1)*640+Math.min(639,Math.ceil((640-crop.w*size)/2)+1))*4;
        const corner=data.data[firstPixel+3];
        if(corner===255&&index===0){clearBackdrop(data.data,640,640);lc.putImageData(data,0,0);}
        ctx.drawImage(layer,0,0);
      });
    }).catch(()=>{if(!cancelled)setFailed(true);});
    return()=>{cancelled=true;};
  },[wheel]);
  return failed ? <span className="orbit-art-error">Preview unavailable</span> : <canvas ref={canvas} className="orbit-art" role="img" aria-label={`${wheelName(wheel)} steering wheel, isolated on a transparent background`} />;
}
export default function RevolvingShowroom() {
  const [selected,setSelected]=useState(null);
  const [paused,setPaused]=useState(false);
  const [hovered,setHovered]=useState(false);
  const back=useRef(null),triggers=useRef([]),last=useRef(null);
  const id=useId();
  const open=(wheel,index)=>{last.current=index;setSelected(wheel);};
  const close=()=>{setHovered(false);setSelected(null);};
  useEffect(()=>{if(selected){back.current?.focus();back.current?.closest('.orbit-stage')?.scrollIntoView?.({block:'start'});}else if(last.current!==null)triggers.current[last.current]?.focus({preventScroll:true});},[selected]);
  const running=!paused&&!selected&&!hovered;
  return <section className="orbit-showroom" aria-labelledby="orbit-title" onKeyDown={event=>{if(event.key==='Escape'&&selected){event.preventDefault();close();} if(event.key==='Tab'&&selected){const nodes=event.currentTarget.querySelectorAll('.orbit-selection button,.orbit-selection a');const first=nodes[0],end=nodes[nodes.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();end.focus();}else if(!event.shiftKey&&document.activeElement===end){event.preventDefault();first.focus();}}}}>
    <div className="orbit-heading"><div><p className="orbit-eyebrow">THE DRIVER’S COLLECTION / {SHOWROOM_WHEELS.length} WAYS TO MAKE IT YOURS</p><h1 id="orbit-title">YOUR NEXT WHEEL.<br/><em>IN THE SPOTLIGHT.</em></h1></div><div className="orbit-intro"><p>Every brand. Every style. One moving collection.<br/>Choose a wheel. Make every detail yours.</p><Link to="/build">Explore all wheel styles <span aria-hidden="true">↗</span></Link></div></div>
    <div className={`orbit-stage${selected?' has-selection':''}`}>
      <div className="orbit-ceiling" aria-hidden="true"><i/><i/><i/><i/><i/></div>
      <div className="orbit-belt-window" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
        <div className="orbit-belt" style={{animationPlayState:running?'running':'paused'}} aria-label="All configurable steering wheels">
          {[0,1].map(copy=><div className="orbit-group" key={copy}>
            {SHOWROOM_WHEELS.map((wheel,index)=><button key={wheel.brand+wheel.style} type="button" className="orbit-wheel" ref={el=>{if(copy===0)triggers.current[index]=el;}} aria-hidden={copy===1?true:undefined} tabIndex={selected||copy===1?-1:0} onClick={()=>open(wheel,index)} aria-label={`View ${wheelName(wheel)} style wheel`} aria-controls={selected?id:undefined}>
              <span className="orbit-light" aria-hidden="true"/><span className="orbit-wheel-art"><WheelArt wheel={wheel}/></span><span className="orbit-wheel-label"><b>{BRANDS[wheel.brand]}</b><span>{wheel.label} style</span><small>SELECT WHEEL ↗</small></span><span className="orbit-plinth" aria-hidden="true"/>
            </button>)}
          </div>)}
        </div>
      </div>
      <div className="orbit-shelf" aria-hidden="true"/>
      {selected&&<div className="orbit-selection" role="dialog" aria-labelledby={id}>
        <button ref={back} className="orbit-back" type="button" onClick={close}>← Back to the shelf</button>
        <div className="orbit-selected-art"><WheelArt wheel={selected}/></div>
        <div className="orbit-selected-copy"><p className="orbit-eyebrow">YOUR BUILD STARTS HERE</p><h2 id={id}>Build {selected.brand==='AUDI'?'an':'a'}{' '}<br/>{wheelName(selected)}<br/><em>style wheel.</em></h2><p>Choose your materials, colors, stitching and finishing touches. Final fitment is confirmed from your current wheel photo.</p><Link to={`/configure?${new URLSearchParams({brand:selected.brand,style:selected.style})}`} className="orbit-build">BUILD THIS WHEEL <span aria-hidden="true">↗</span></Link><small>From ${selected.price.toFixed(2)} · Handcrafted to order</small></div>
      </div>}
    </div>
    <div className="orbit-toolbar"><p><span className="orbit-live-dot"/> {selected?'YOUR WHEEL, UP CLOSE':running?'THE COLLECTION IS IN MOTION':'TAKE YOUR TIME. FIND YOUR STYLE.'}</p><div><select aria-label="Find a wheel" value="" onChange={event=>{if(event.target.value!=='')open(SHOWROOM_WHEELS[Number(event.target.value)],Number(event.target.value));}}><option value="">Find your wheel</option>{SHOWROOM_WHEELS.map((wheel,index)=><option key={wheel.brand+wheel.style} value={index}>{wheelName(wheel)}</option>)}</select><span className="orbit-count">{SHOWROOM_WHEELS.length} WHEELS · 6 BRANDS</span><button type="button" onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?'▶ Resume shelf':'Ⅱ Pause shelf'}</button></div></div>
    <Link className="orbit-chat" to="/contact" aria-label="Have a question? Let’s Chat! Contact us"><svg className="orbit-chat-ring" viewBox="0 0 120 120" aria-hidden="true"><defs><path id="chat-ring-path" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs><text><textPath href="#chat-ring-path" textLength="276">HAVE A QUESTION? · LET’S CHAT! · </textPath></text></svg><span className="orbit-chat-center" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 5h14v11H9l-4 3V5Z"/><path d="M9 10h6M9 13h4"/></svg></span></Link>
  </section>;
}

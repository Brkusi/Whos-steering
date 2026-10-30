import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { WHEEL_STYLES } from '../lib/wheelStyles';
import './RevolvingShowroom.css';
import WheelPicker from './WheelPicker';
import DirectionalArrow from './DirectionalArrow';
import workshop from '../assets/hero/prototyping-workshop.webp';

const BRANDS = {BMW:'BMW', AUDI:'Audi', MERCEDES:'Mercedes', TOYOTA:'Toyota', PORSCHE:'Porsche', DODGE_SRT:'Dodge'};
const groups=Object.keys(BRANDS).map(brand=>WHEEL_STYLES.filter(wheel=>wheel.brand===brand));
export const SHOWROOM_WHEELS=Array.from({length:Math.max(...groups.map(group=>group.length))},(_,index)=>groups.map(group=>group[index]).filter(Boolean)).flat();
const audiFitment = wheel => wheel.brand==='AUDI' && ['B9','R8','RS 2020+'].includes(wheel.style);
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
export function WheelArt({wheel}) {
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
  const back=useRef(null),triggers=useRef([]),last=useRef(null),belt=useRef(null),scrubber=useRef(null),gesture=useRef(null),suppressClick=useRef(false);
  const id=useId();
  const open=(wheel,index)=>{last.current=index;setSelected(wheel);};
  const close=()=>setSelected(null);
  useEffect(()=>{if(selected){back.current?.focus();back.current?.closest('.orbit-stage')?.scrollIntoView?.({block:'start'});}else if(last.current!==null)triggers.current[last.current]?.focus({preventScroll:true});},[selected]);
  const running=!selected;
  const seek = useCallback((fraction,relative=false) => {
    const animation=belt.current?.getAnimations?.()[0];
    if(!animation)return;
    const duration=Number(animation.effect.getTiming().duration);
    if(!duration)return;
    const current=Number(animation.currentTime)||0;
    const next=relative?current+fraction*duration:fraction*duration;
    animation.currentTime=((next%duration)+duration)%duration;
  },[]);
  useEffect(()=>{
    if(!belt.current?.getAnimations)return;
    let frame;
    const update=()=>{
      const animation=belt.current?.getAnimations?.()[0];
      const duration=Number(animation?.effect.getTiming().duration);
      if(animation&&duration&&scrubber.current){
        const progress=((Number(animation.currentTime)||0)%duration)/duration;
        scrubber.current.value=Math.round(progress*1000);
        scrubber.current.style.setProperty('--scrub-progress',`${progress*100}%`);
      }
      frame=requestAnimationFrame(update);
    };
    frame=requestAnimationFrame(update);
    return()=>cancelAnimationFrame(frame);
  },[]);
  useEffect(()=>{
    const node=belt.current?.parentElement;
    if(!node)return;
    const scroll=event=>{
      if(selected||(!event.shiftKey&&Math.abs(event.deltaX)<=Math.abs(event.deltaY)))return;
      event.preventDefault();
      const delta=event.deltaX||event.deltaY;
      seek(delta*(event.deltaMode===1?16:1)/(belt.current.scrollWidth/2),true);
    };
    node.addEventListener('wheel',scroll,{passive:false});
    return()=>node.removeEventListener('wheel',scroll);
  },[selected,seek]);
  return <section className="orbit-showroom" aria-labelledby="orbit-title" onKeyDown={event=>{if(event.key==='Escape'&&selected){event.preventDefault();close();} if(event.key==='Tab'&&selected){const nodes=event.currentTarget.querySelectorAll('.orbit-selection button,.orbit-selection a');const first=nodes[0],end=nodes[nodes.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();end.focus();}else if(!event.shiftKey&&document.activeElement===end){event.preventDefault();first.focus();}}}}>
    <div className="orbit-banner"><img className="orbit-banner-background" src={workshop} alt="" aria-hidden="true" fetchpriority="high"/><div className="orbit-heading"><div><p className="orbit-eyebrow">THE DRIVER’S COLLECTION / {SHOWROOM_WHEELS.length} WAYS TO MAKE IT YOURS</p><h1 id="orbit-title">YOUR NEXT WHEEL.<br/><em>IN THE SPOTLIGHT.</em></h1></div><div className="orbit-intro"><p>Every brand. Every style. One moving collection.<br/>Choose a wheel. Make every detail yours.</p><div className="orbit-heading-actions"><Link className="orbit-heading-build" to="/build">BUILD A WHEEL <DirectionalArrow/></Link><Link className="orbit-heading-premade" to="/catalog">EXPLORE PRE-MADE WHEELS <DirectionalArrow/></Link></div><ul className="orbit-heading-proof"><li>14 configurable styles</li><li>6-month warranty</li><li>Worldwide shipping</li></ul></div></div>
    </div>
    <div className={`orbit-stage${selected?' has-selection':''}`}>
      <div className="orbit-ceiling" aria-hidden="true"><i/><i/><i/><i/><i/></div>
      <div className="orbit-belt-window" onPointerDown={event=>{
        if(selected||event.button!==0)return;
        suppressClick.current=false;
        gesture.current={x:event.clientX,y:event.clientY,lastX:event.clientX,dragging:false};
      }} onPointerMove={event=>{
        const drag=gesture.current;
        if(!drag||selected)return;
        const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
        if(!drag.dragging&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){
          drag.dragging=true;suppressClick.current=true;
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }
        if(drag.dragging){
          const width=belt.current.scrollWidth/2;
          if(width)seek(-(event.clientX-drag.lastX)/width,true);
          drag.lastX=event.clientX;
        }
      }} onPointerUp={()=>{gesture.current=null;}} onPointerCancel={()=>{gesture.current=null;}} onClickCapture={event=>{
        if(suppressClick.current){event.preventDefault();event.stopPropagation();suppressClick.current=false;}
      }}>
        <div ref={belt} className="orbit-belt" style={{animationPlayState:running?'running':'paused','--orbit-play-state':running?'running':'paused'}} aria-label="All configurable steering wheels">
          {[0,1].map(copy=><div className="orbit-group" key={copy}>
            {SHOWROOM_WHEELS.map((wheel,index)=><button key={wheel.brand+wheel.style} type="button" className="orbit-wheel" ref={el=>{if(copy===0)triggers.current[index]=el;}} aria-hidden={copy===1?true:undefined} tabIndex={selected||copy===1?-1:0} onClick={()=>open(wheel,index)} aria-label={`View ${wheelName(wheel)} style wheel`} aria-controls={selected?id:undefined}>
              <span className="orbit-light" aria-hidden="true"/><span className="orbit-wheel-art"><WheelArt wheel={wheel}/></span><span className="orbit-wheel-label"><b>{BRANDS[wheel.brand]}</b><span>{wheel.label} style</span>{audiFitment(wheel)&&<span className="orbit-wheel-fitment">All Audi’s 2011+</span>}<small>SELECT WHEEL <DirectionalArrow/></small></span><span className="orbit-plinth" aria-hidden="true"/>
            </button>)}
          </div>)}
        </div>
      </div>
      <div className="orbit-shelf" aria-hidden="true"/>
      {selected&&<div className="orbit-selection" role="dialog" aria-labelledby={id}>
        <button ref={back} className="orbit-back" type="button" onClick={close}>← Back to the shelf</button>
        <div className="orbit-selected-art"><WheelArt wheel={selected}/></div>
        <div className="orbit-selected-copy"><p className="orbit-eyebrow">YOUR BUILD STARTS HERE</p><h2 id={id}>Build {selected.brand==='AUDI'?'an':'a'}{' '}<br/>{wheelName(selected)}<br/><em>style wheel.</em></h2>{audiFitment(selected)&&<p className="orbit-selected-fitment">All Audi’s 2011+</p>}<p>Choose your materials, colors, stitching and finishing touches. Final fitment is confirmed from your current wheel photo.</p><Link to={`/configure?${new URLSearchParams({brand:selected.brand,style:selected.style})}`} className="orbit-build">BUILD THIS WHEEL <DirectionalArrow/></Link><small>From ${selected.price.toFixed(2)} · Handcrafted to order</small></div>
      </div>}
    </div>
    <div className="orbit-scrub" aria-label="Collection browsing controls">
      <button type="button" disabled={!!selected} onClick={()=>seek(-1/SHOWROOM_WHEELS.length,true)} aria-label="Previous wheel in collection">‹</button>
      <div className="orbit-scrub-track"><label htmlFor={`${id}-scrub`}>BROWSE AT YOUR PACE <span>Drag to explore faster</span></label><input ref={scrubber} id={`${id}-scrub`} aria-label="Browse wheel collection" type="range" min="0" max="1000" step="1" defaultValue="0" disabled={!!selected} onChange={event=>seek(Math.min(Number(event.target.value),999)/1000)}/></div>
      <button type="button" disabled={!!selected} onClick={()=>seek(1/SHOWROOM_WHEELS.length,true)} aria-label="Next wheel in collection">›</button>
    </div>
    <div className="orbit-toolbar"><p><span className="orbit-live-dot"/> {selected?'YOUR WHEEL, UP CLOSE':running?'THE COLLECTION IS IN MOTION':'TAKE YOUR TIME. FIND YOUR STYLE.'}{!selected&&<span className="orbit-swipe-hint"> · SWIPE TO EXPLORE</span>}</p><div><WheelPicker wheels={SHOWROOM_WHEELS} nameForWheel={wheelName} onChoose={open}/><span className="orbit-count">{SHOWROOM_WHEELS.length} WHEELS · 6 BRANDS</span></div></div>
    <Link className="orbit-chat" to="/contact" aria-label="Have a question? Contact us"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v11H9l-4 3V5Z"/><path d="M9 10h6M9 13h4"/></svg><span>Have a question?</span></Link>
  </section>;
}

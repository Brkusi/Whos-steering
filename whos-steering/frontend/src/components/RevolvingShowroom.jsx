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
export function spotlightDepth(center, viewportCenter, viewportWidth) {
  const proximity = Math.max(0, 1 - Math.abs(center - viewportCenter) / Math.max(1, viewportWidth / 2));
  const eased = proximity * proximity * (3 - 2 * proximity);
  return {scale:.78 + .36 * eased, lift:14 * eased, light:.12 + .88 * eased};
}
export const R8_CROP = {x:40,y:30,w:930,h:870};
// Outer rim and the genuine openings, in the B9.5 source photo's coordinates.
export const B95_OUTLINE = 'M 628 80 C 369 76 161 259 88 505 C 37 690 79 934 231 1097 C 270 1139 334 1159 409 1165 C 544 1178 753 1178 870 1161 C 960 1150 1004 1110 1054 1046 C 1178 888 1221 678 1162 480 C 1091 246 879 80 628 80 Z M 630 178 C 476 178 347 249 286 350 C 276 366 281 385 267 406 C 243 440 213 475 191 516 C 158 565 173 585 213 581 L 248 578 L 266 535 Q 272 521 286 520 L 325 519 Q 340 519 346 533 L 351 549 L 405 541 C 444 481 788 478 844 542 L 903 551 L 913 531 Q 918 518 934 519 L 971 522 Q 985 524 990 538 L 1008 577 L 1043 582 C 1087 585 1092 565 1063 518 C 1041 476 1018 442 997 411 C 981 389 985 368 972 349 C 910 249 781 178 630 178 Z M 267 540 L 258 576 L 336 557 L 330 537 Q 327 531 319 532 L 285 533 Q 272 533 267 540 Z M 923 535 L 916 557 L 993 576 L 982 544 Q 980 535 970 534 L 937 531 Q 926 530 923 535 Z M 199 715 C 170 760 204 918 284 1025 Q 333 1055 411 1057 L 449 858 C 422 824 410 789 405 742 L 349 724 Z M 1057 717 L 853 742 C 847 790 830 828 808 860 L 844 1058 Q 931 1061 971 1029 C 1051 927 1089 769 1057 717 Z M 532 888 Q 628 902 723 888 L 692 1036 Q 686 1048 669 1048 L 583 1048 Q 566 1048 560 1035 Z';

export function clearR8Backdrop(pixels,width,height,marker){
  const isMarker=(x,y)=>x>=marker.x&&x<=marker.x+marker.w&&y>=marker.y&&y<=marker.y+marker.h;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    if(isMarker(x,y))continue;
    const i=(y*width+x)*4;
    const low=Math.min(pixels[i],pixels[i+1],pixels[i+2]);
    // White studio background, including the spaces within the paddles.
    // The real white center marker is protected separately.
    if(low>235)pixels[i+3]=Math.round(pixels[i+3]*Math.max(0,(248-low)/13));
  }
  const alpha=Uint8Array.from({length:width*height},(_,i)=>pixels[i*4+3]);
  for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
    if(isMarker(x,y))continue;
    const at=y*width+x,i=at*4;
    if(!alpha[at])continue;
    const low=Math.min(pixels[i],pixels[i+1],pixels[i+2]);
    const onEdge=alpha[at]<255||[-width-1,-width,-width+1,-1,1,width-1,width,width+1].some(d=>alpha[at+d]===0);
    if(low>60&&onEdge){
      // Unmix white from antialiased edges before putting them on a dark stage.
      const coverage=Math.min(1,(255-low)/230);
      for(let channel=0;channel<3;channel++)pixels[i+channel]=Math.max(0,(pixels[i+channel]-255*(1-coverage))/(coverage||1));
      pixels[i+3]=Math.round(alpha[at]*coverage);
    }
  }
}
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
    const sources=[wheel.showroomImage||wheel.image,...(wheel.imageOverlays||(wheel.imageOverlay?[wheel.imageOverlay]:[]))];
    Promise.all(sources.map(loadImage)).then(images=>{
      if(cancelled||!canvas.current)return;
      setFailed(false);
      const c=canvas.current,ctx=c.getContext('2d',{willReadFrequently:true});
      c.width=640;c.height=640;
      images.forEach((image,index)=>{
        const layer=document.createElement('canvas');layer.width=640;layer.height=640;
        const lc=layer.getContext('2d',{willReadFrequently:true});
        const crop=wheel.style==='R8'&&index===0?R8_CROP:{x:0,y:0,w:image.width,h:image.height};
        const size=Math.min(608/crop.w,608/crop.h);
        if(wheel.style==='RS 2020+'&&index===0){
          // Trace the photographic silhouette instead of keying its near-black
          // inner rim: those shadows belong to the wheel, not the backdrop.
          lc.save();lc.translate((640-crop.w*size)/2,(640-crop.h*size)/2);lc.scale(size,size);
          const outline=new Path2D(B95_OUTLINE);
          lc.clip(outline,'evenodd');lc.drawImage(image,0,0);lc.restore();
        }else lc.drawImage(image,crop.x,crop.y,crop.w,crop.h,(640-crop.w*size)/2,(640-crop.h*size)/2,crop.w*size,crop.h*size);
        const data=lc.getImageData(0,0,640,640);
        if(wheel.style==='R8'&&index===0){
          clearR8Backdrop(data.data,640,640,{x:(640-crop.w*size)/2+(495-crop.x)*size,y:(640-crop.h*size)/2+(43-crop.y)*size,w:16*size,h:70*size});
          lc.putImageData(data,0,0);
        }else if(wheel.style!=='RS 2020+'&&index===0){
          const firstPixel=(Math.min(639,Math.ceil((640-crop.h*size)/2)+1)*640+Math.min(639,Math.ceil((640-crop.w*size)/2)+1))*4;
          if(data.data[firstPixel+3]===255){clearBackdrop(data.data,640,640);lc.putImageData(data,0,0);}
        }
        ctx.drawImage(layer,0,0);
      });
    }).catch(()=>{if(!cancelled)setFailed(true);});
    return()=>{cancelled=true;};
  },[wheel]);
  return failed ? <span className="orbit-art-error">Preview unavailable</span> : <canvas ref={canvas} className="orbit-art" role="img" aria-label={`${wheelName(wheel)} steering wheel, isolated on a transparent background`} />;
}
export default function RevolvingShowroom() {
  const [selected,setSelected]=useState(null);
  const [paused,setPaused]=useState(()=>(typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) || false);
  const back=useRef(null),triggers=useRef([]),last=useRef(null),belt=useRef(null),scrubber=useRef(null),gesture=useRef(null),suppressClick=useRef(false);
  const id=useId();
  const open=(wheel,index)=>{last.current=index;setSelected(wheel);};
  const close=()=>setSelected(null);
  useEffect(()=>{if(selected){back.current?.focus();back.current?.closest('.orbit-stage')?.scrollIntoView?.({block:'start'});}else if(last.current!==null)triggers.current[last.current]?.focus({preventScroll:true});},[selected]);
  const running=!selected&&!paused;
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
      if(belt.current && !document.hidden){
        const bounds=belt.current.parentElement.getBoundingClientRect();
        const center=bounds.left+bounds.width/2;
        const samples=[...belt.current.querySelectorAll('.orbit-wheel')].map(node=>({node,rect:node.getBoundingClientRect()}));
        samples.forEach(({node,rect})=>{
          const depth=spotlightDepth(rect.left+rect.width/2,center,bounds.width);
          node.style.setProperty('--wheel-scale',depth.scale.toFixed(4));
          node.style.setProperty('--wheel-lift',`${depth.lift.toFixed(2)}px`);
          node.style.setProperty('--spotlight',depth.light.toFixed(3));
        });
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
      <div className="orbit-ceiling" aria-hidden="true"/><div className="orbit-center-glow" aria-hidden="true"/>
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
              <span className="orbit-light" aria-hidden="true"><i/></span><span className="orbit-wheel-art"><WheelArt wheel={wheel}/></span><span className="orbit-wheel-label"><b>{BRANDS[wheel.brand]}</b><span>{wheel.label} style</span>{audiFitment(wheel)&&<span className="orbit-wheel-fitment">All Audi’s 2011+</span>}<small>SELECT WHEEL <DirectionalArrow/></small></span><span className="orbit-plinth" aria-hidden="true"/>
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
    <div className="orbit-toolbar"><p><span className="orbit-live-dot"/> {selected?'YOUR WHEEL, UP CLOSE':running?'THE COLLECTION IS IN MOTION':'TAKE YOUR TIME. FIND YOUR STYLE.'}{!selected&&<span className="orbit-swipe-hint"> · SWIPE TO EXPLORE</span>}</p><div><button type="button" aria-label={paused?'Play wheel collection':'Pause wheel collection'} aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?'Play':'Pause'}</button><WheelPicker wheels={SHOWROOM_WHEELS} nameForWheel={wheelName} onChoose={open}/><span className="orbit-count">{SHOWROOM_WHEELS.length} WHEELS · 6 BRANDS</span></div></div>
    <Link className="orbit-chat" to="/contact" aria-label="Have a question? Contact us"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v11H9l-4 3V5Z"/><path d="M9 10h6M9 13h4"/></svg><span>Have a question?</span></Link>
  </section>;
}

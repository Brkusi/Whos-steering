import {useRef, useState} from 'react';
import './PreviewZoom.css';
export const zoomOrigin = (x,y,rect) => ({x:Math.max(0,Math.min(100,(x-rect.left)/Math.max(1,rect.width)*100)),y:Math.max(0,Math.min(100,(y-rect.top)/Math.max(1,rect.height)*100))});
export default function PreviewZoom({children,className='',style}) {
  const [zoom,setZoom]=useState(false);
  const [origin,setOrigin]=useState({x:50,y:50});
  const start=useRef(null);
  const point=e=>setOrigin(zoomOrigin(e.clientX,e.clientY,e.currentTarget.getBoundingClientRect()));
  return <div className={`preview-zoom ${className}${zoom?' is-magnified':''}`} style={style} role="button" tabIndex={0} aria-label={zoom?'Zoom out wheel preview':'Zoom wheel preview at pointer'} aria-pressed={zoom}
    onPointerDown={e=>{start.current={x:e.clientX,y:e.clientY};}}
    onPointerMove={e=>{if(e.pointerType!=='touch'&&zoom)point(e);}}
    onClick={e=>{if(start.current&&Math.hypot(e.clientX-start.current.x,e.clientY-start.current.y)>10)return;point(e);setZoom(!zoom);}}
    onKeyDown={e=>{if(e.key==='Escape'){setZoom(false);}else if(e.key==='Enter'||e.key===' '){e.preventDefault();setOrigin({x:50,y:50});setZoom(!zoom);}else if(zoom&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();setOrigin(p=>({x:Math.max(0,Math.min(100,p.x+(e.key==='ArrowRight'?10:e.key==='ArrowLeft'?-10:0))),y:Math.max(0,Math.min(100,p.y+(e.key==='ArrowDown'?10:e.key==='ArrowUp'?-10:0)))}));}}}>
    <div className="preview-zoom-content" style={{transformOrigin:`${origin.x}% ${origin.y}%`,transform:`scale(${zoom?2.4:1})`}}>{children}</div>
    <span className="preview-zoom-hint">{zoom?'Move to inspect · Click or Esc to reset':'Click or tap any detail to zoom'}</span>
  </div>;
}

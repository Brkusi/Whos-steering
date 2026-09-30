import { useEffect, useRef, useState } from 'react';
import { bmwFSeriesConfiguration, sourceWheelHasPaddles } from '../lib/bmwFSeriesConfiguration';
import { createFSeriesCompositor } from '../lib/bmwFSeriesComposite';
import './FSeriesPreview.css';

function parseColor(value) {
  if(typeof value!=='string'||!CSS.supports('color',value)||/^(inherit|initial|unset|revert|currentcolor|transparent|var\()/i.test(value))return null;
  const c=document.createElement('canvas'),ctx=c.getContext('2d');c.width=c.height=1;ctx.fillStyle=value;ctx.fillRect(0,0,1,1);
  return '#'+[...ctx.getImageData(0,0,1,1).data].slice(0,3).map(v=>v.toString(16).padStart(2,'0')).join('');
}

export default function FSeriesPreview({config}) {
  const output=useRef(null),renderer=useRef(null),version=useRef(0);
  const [status,setStatus]=useState('loading'),[zoom,setZoom]=useState(false),[retry,setRetry]=useState(0);
  const appearance=bmwFSeriesConfiguration(config,parseColor),key=JSON.stringify(appearance),family=appearance.family;
  const label=config.brand === 'AUDI' ? 'Audi B9.5 Style' : config.brand === 'BMW' ? `BMW ${config.wheelStyleType}` : config.brand === 'TOYOTA' ? 'Toyota Supra GR' : config.brand === 'PORSCHE' ? `Porsche ${config.wheelStyleType}` : config.brand === 'DODGE_SRT' ? 'Dodge SRT' : config.wheelStyleType;
  useEffect(()=>{const compositor=createFSeriesCompositor(family);renderer.current=compositor;return()=>{version.current++;compositor.dispose();renderer.current=null;};},[family]);
  useEffect(()=>{
    const current=++version.current;setStatus('loading');
    renderer.current.render(JSON.parse(key)).then(canvas=>{
      if(current!==version.current||!canvas||!output.current)return;
      output.current.width=canvas.width;output.current.height=canvas.height;
      output.current.getContext('2d').drawImage(canvas,0,0);setStatus('ready');
    }).catch(()=>{if(current===version.current)setStatus('error');});
  },[key,retry]);
  return <section className={`fseries-preview${zoom?' is-zoomed':''}`} aria-label={`${label} live wheel preview`}>
    <div className="fseries-preview-heading"><span>LIVE PREVIEW</span><button type="button" aria-label={zoom?'Zoom out wheel preview':'Zoom in wheel preview'} aria-pressed={zoom} onClick={()=>setZoom(!zoom)}>{zoom?'−':'+'}</button></div>
    <div className="fseries-preview-stage"><canvas ref={output} role="img" aria-label={`${label} ${config.bmwShape||'Round'} wheel, ${config.topBottomMat}${sourceWheelHasPaddles(config) ? `, ${config.paddleShifters} paddles` : ''}`}/></div>
    {status==='loading'&&<p role="status" className="fseries-preview-loading">Updating wheel…</p>}
    {status==='error'&&<div className="fseries-preview-error" role="alert"><p>The wheel images could not load.</p><button onClick={()=>setRetry(retry+1)}>Retry preview</button></div>}
    <p className="fseries-preview-caption">{label} · {config.bmwShape||'Round'}</p>
    {config.brand==='AUDI'&&config.airbagCompat&&<p className="fseries-preview-note">Airbag cover and full-unit choices are saved for your build; the preview retains the original center image.</p>}
    {!!appearance.unresolved.length&&<p className="fseries-preview-note">Custom instructions saved for your order: {appearance.unresolved.join(', ')}.</p>}
  </section>;
}

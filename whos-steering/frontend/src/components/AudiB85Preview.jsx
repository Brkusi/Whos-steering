import { createLedArtwork, drawLedDisplay } from '../lib/ledDisplay';
import { useEffect, useRef, useState } from 'react';
import { audiB85Layers, normalizeB85Options, B85_LED } from '../lib/audiB85Configuration';
import './FSeriesPreview.css';

export default function AudiB85Preview({config}) {
  const output = useRef(null);
  const cache = useRef(new Map());
  const [zoom, setZoom] = useState(false);
  const [status, setStatus] = useState('loading');
  const [retry, setRetry] = useState(0);
  const key = JSON.stringify(audiB85Layers(normalizeB85Options(config)).filter(layer => layer.src !== B85_LED));
  const led = !!config.ledDisplay;
  useEffect(() => {
    let active = true;
    setStatus('loading');
    const layers = JSON.parse(key);
    const load = src => {
      if (!cache.current.has(src)) {
        cache.current.set(src, new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => { cache.current.delete(src); reject(new Error(`Unable to load ${src}`)); };
          img.src = src;
        }));
      }
      return cache.current.get(src);
    };
    Promise.all(layers.map(layer => load(layer.src))).then(images => {
      if (!active || !output.current) return;
      const canvas = output.current;
      canvas.width = canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      layers.forEach((layer, i) => {
        if (layer.crop) ctx.drawImage(images[i], ...layer.crop, ...layer.rect);
        else if(layer.rect)ctx.drawImage(images[i], ...layer.rect);
        else ctx.drawImage(images[i], 0, 0, 1080, 1080);
      });
      if(led)drawLedDisplay(ctx,createLedArtwork(),{x:245,y:95,width:590,height:46,rise:85});
      setStatus('ready');
    }).catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [key, retry, led]);
  return <section className={`fseries-preview${zoom ? ' is-zoomed' : ''}`} aria-label="Audi B8.5 flat-bottom live wheel preview" aria-busy={status === 'loading'}>
    <div className="fseries-preview-heading"><span>LIVE PREVIEW</span><button type="button" aria-label={zoom ? 'Zoom out wheel preview' : 'Zoom in wheel preview'} aria-pressed={zoom} onClick={() => setZoom(!zoom)}>{zoom ? '−' : '+'}</button></div>
    <div className="fseries-preview-stage"><canvas ref={output} role="img" aria-label={`Audi B8.5 Sport flat-bottom wheel with ${config.topBottomMat}, ${config.sideMat}, and ${config.paddleShifters} paddles`} /></div>
    {status === 'loading' && <p role="status" className="fseries-preview-loading">Updating wheel…</p>}
    {status === 'error' && <div className="fseries-preview-error" role="alert"><p>The wheel images could not load.</p><button type="button" onClick={() => setRetry(retry + 1)}>Retry preview</button></div>}
    <p className="fseries-preview-caption">Audi B8.5 Sport · Flat bottom</p>
  </section>;
}

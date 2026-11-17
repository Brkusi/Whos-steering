import {resolvePreviewColor, tintPreviewPixels} from '../lib/previewColor';
import {addUrusPaddlesToCanvas} from '../lib/urusPaddleOverlay';
import {fitPreviewCanvas} from '../lib/previewFraming';
import PreviewZoom from './PreviewZoom';
import { createLedArtwork, drawLedDisplay } from '../lib/ledDisplay';
import { useEffect, useRef, useState } from 'react';
import { audiB85Layers, normalizeB85Options, B85_LED } from '../lib/audiB85Configuration';
import './FSeriesPreview.css';

export default function AudiB85Preview({config}) {
  const output = useRef(null);
  const cache = useRef(new Map());
  const [status, setStatus] = useState('loading');
  const [retry, setRetry] = useState(0);
  const key = JSON.stringify(audiB85Layers(normalizeB85Options(config)).filter(layer => layer.src !== B85_LED));
  const led = !!config.ledDisplay;
  const urus=config.paddleShifters==='Urus Style',urusFinish=config.urusPaddleColor;
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
    Promise.all(layers.map(layer => Promise.all([load(layer.src), layer.stitchSource && load(layer.stitchSource)]))).then(async images => {
      if (!active || !output.current) return;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      layers.forEach((layer, i) => {
        const [image, stitchImage] = images[i];
        const tint = resolvePreviewColor(layer.tint);
        const stitch = resolvePreviewColor(layer.stitchColor);
        if (tint || (stitch && stitchImage)) {
          const layerCanvas = document.createElement('canvas');
          layerCanvas.width = layerCanvas.height = 1080;
          const layerContext = layerCanvas.getContext('2d', {willReadFrequently:true});
          let whiteThreads;
          if (stitch && stitchImage) {
            layerContext.drawImage(stitchImage,0,0,1080,1080);
            whiteThreads = layerContext.getImageData(0,0,1080,1080).data;
            layerContext.clearRect(0,0,1080,1080);
          }
          layerContext.drawImage(image,0,0,1080,1080);
          const pixels = layerContext.getImageData(0,0,1080,1080);
          const original = whiteThreads && pixels.data.slice();
          if (tint && tint !== '#111111') tintPreviewPixels(pixels.data,tint);
          if (whiteThreads) {
            const ink = stitch.match(/[\da-f]{2}/gi).map(channel => parseInt(channel,16));
            for (let offset=0;offset<pixels.data.length;offset+=4) {
              const coverage = Math.max(0,Math.min(1,(whiteThreads[offset]-original[offset]-12)/110));
              for (let channel=0;channel<3;channel++) {
                pixels.data[offset+channel] += (ink[channel]-pixels.data[offset+channel])*coverage;
              }
            }
          }
          layerContext.putImageData(pixels,0,0);
          ctx.drawImage(layerCanvas,0,0);
        } else if (layer.crop) ctx.drawImage(image, ...layer.crop, ...layer.rect);
        else if(layer.rect)ctx.drawImage(image, ...layer.rect);
        else ctx.drawImage(image, 0, 0, 1080, 1080);
      });
      if(led)drawLedDisplay(ctx,createLedArtwork(),{x:245,y:95,width:590,height:46,rise:85});
      await addUrusPaddlesToCanvas(canvas,{brand:'AUDI',paddleShifters:urus?'Urus Style':'Standard',urusPaddleColor:urusFinish});
      if(!active||!output.current)return;fitPreviewCanvas(canvas,output.current);setStatus('ready');
    }).catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [key, retry, led, urus, urusFinish]);
  return <section className="fseries-preview" aria-label="Audi B8.5 flat-bottom live wheel preview" aria-busy={status === 'loading'}>
    <div className="fseries-preview-heading"><span>LIVE PREVIEW</span></div>
    <PreviewZoom className="fseries-preview-stage"><canvas ref={output} role="img" aria-label={`Audi B8.5 Sport flat-bottom wheel with ${config.topBottomMat}, ${config.sideMat}, and ${config.paddleShifters} paddles`} /></PreviewZoom>
    {status === 'loading' && <p role="status" className="fseries-preview-loading">Updating wheel…</p>}
    {status === 'error' && <div className="fseries-preview-error" role="alert"><p>The wheel images could not load.</p><button type="button" onClick={() => setRetry(retry + 1)}>Retry preview</button></div>}
    <p className="fseries-preview-caption">Audi B8.5 Sport · Flat bottom</p>
  </section>;
}

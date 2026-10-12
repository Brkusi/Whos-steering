import { useState } from 'react';
import { B85_STRIPE_CONCEPTS } from '../lib/data';
import './FSeriesPreview.css';

const root = '/models/audi-b85/source/';
const topLayer = {
  'Smooth Leather': 'top-leather.png',
  'Alcantara': 'top-alcantara.png',
  'Classic Carbon': 'top-classic.png',
  'Matte Carbon': 'top-matte.png',
  'Forged Carbon': 'top-forged.png',
};
const paddleLayer = {
  Standard: 'paddles-original.png',
  'Racing Style 1': 'paddles-racing-1.png',
  'Racing Style 2': 'paddles-racing-2.png',
  Magnetic: 'paddles-magnetic.png',
};

function layer(name, style = {}) {
  return name ? <img key={name} src={root + name} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', ...style }} /> : null;
}

function materialTint(name, color) {
  if (!name || !color || ['#111111','#1A0A2E'].includes(color)) return null;
  return <span aria-hidden="true" style={{ position:'absolute', inset:0, background:color, opacity:.42, mixBlendMode:'color', maskImage:`url(${root + name})`, WebkitMaskImage:`url(${root + name})`, maskSize:'contain', WebkitMaskSize:'contain', maskRepeat:'no-repeat', WebkitMaskRepeat:'no-repeat' }} />;
}

function AudiLed() {
  return <svg viewBox="0 0 1080 1080" aria-hidden="true" style={{ position:'absolute', inset:0, width:'100%', height:'100%', overflow:'visible' }}>
    <path d="M263 181 Q540 -24 817 181" fill="none" stroke="#07090c" strokeWidth="37" strokeLinecap="round" />
    <path d="M263 181 Q540 -24 817 181" fill="none" stroke="#343b42" strokeWidth="2" />
    {[0,1,2,3,4,5,6,7].map(i => <g key={i} transform={`translate(${305 + i*25} ${146 - i*12}) rotate(${-31+i*4})`}><rect width="19" height="8" rx="2" fill={i<3?'#187de0':i<6?'#bc28bc':'#e02727'} /></g>)}
    {[0,1,2,3,4,5,6,7].map(i => <g key={i} transform={`translate(${593 + i*25} ${60 + i*12}) rotate(${1+i*4})`}><rect width="19" height="8" rx="2" fill={i<2?'#e02727':i<5?'#bc28bc':'#187de0'} /></g>)}
    <rect x="484" y="42" width="112" height="37" rx="5" fill="#0a0e13" stroke="#66717a" strokeWidth="2" />
    <text x="540" y="67" fill="#d9e3eb" fontFamily="Arial, sans-serif" fontSize="22" textAnchor="middle">3  RPM</text>
  </svg>;
}

export default function AudiB85Preview({config}) {
  const [zoom, setZoom] = useState(false);
  const forged = config.topBottomMat === 'Forged Carbon';
  const carbonColor = config.topBottomCarbonCol;
  const forgedImages = {'#0A1428':'top-forged-blue.png','#6E0000':'top-forged-red.png','#D0D0D0':'top-forged-white.png','#A6326C':'top-forged-pink.png'};
  const colorFilter = forged ? ({'#1A0A2E':'hue-rotate(55deg)','#0A2E10':'hue-rotate(235deg)','#3A2800':'hue-rotate(190deg)'}[carbonColor] || '') : '';
  const stripe = B85_STRIPE_CONCEPTS.find(option => option.id === config.stripeConceptId);
  const topImage = forged ? (forgedImages[carbonColor] || (colorFilter ? 'top-forged-blue.png' : 'top-forged.png')) : topLayer[config.topBottomMat];
  const topColor = config.topBottomMat?.includes('Carbon') ? config.topBottomCarbonCol || config.topBottomCustomColor : config.topBottomCol || config.topBottomCustomColor;
  const sideImage = config.sideMat === 'Perforated Leather' ? null : 'side-alcantara.png';
  return <section className={`fseries-preview${zoom?' is-zoomed':''}`} aria-label="Audi B8.5 flat-bottom live wheel preview">
    <div className="fseries-preview-heading"><span>LIVE PREVIEW</span><button type="button" aria-label={zoom?'Zoom out wheel preview':'Zoom in wheel preview'} aria-pressed={zoom} onClick={() => setZoom(!zoom)}>{zoom?'−':'+'}</button></div>
    <div className="fseries-preview-stage">
      <div role="img" aria-label={`Audi B8.5 Sport flat-bottom wheel with ${config.topBottomMat}, ${config.sideMat}, and ${config.paddleShifters} paddles`} style={{ position:'relative', width:'auto', height:'100%', maxHeight:'100%', maxWidth:'100%', aspectRatio:'1', flex:'none', transform:zoom?'scale(1.35)':undefined, transition:'transform .2s ease' }}>
        {layer('base.png')}
        {layer(topImage, {filter:colorFilter})}
        {config.topBottomMat !== 'Forged Carbon' && materialTint(topImage, topColor)}
        {config.sideMat === 'Alcantara' && layer('side-alcantara.png')}
        {config.sideMat === 'Smooth Leather' && layer('side-alcantara.png', {filter:'brightness(.77) contrast(1.2) blur(.5px)'})}
        {materialTint(sideImage, config.sideCol || config.sideCustomColor)}
        {layer(paddleLayer[config.paddleShifters])}
        {config.paddleShifters === 'Magnetic' && layer('paddles-magnetic-symbols.png')}
        {layer('airbag.png')}
        {config.ledDisplay ? <AudiLed /> : config.stripeConceptId !== 'C-1' && <span style={{ position:'absolute', left:'48.7%', top:'7.6%', width:'2.6%', height:'6.5%', background:config.stripeCustomColor || stripe?.stripes?.[0] || '#e8b800', borderRadius:2, opacity:.9 }} />}
        {config.audiBadge && <span style={{ position:'absolute', left:'47.5%', top:'83%', width:'5%', color:config.audiBadge==='S'?'#eee':'#d7282e', textShadow:'0 1px 2px #000', font:'italic 700 13px Arial,sans-serif', textAlign:'center' }}>{config.audiBadge}</span>}
      </div>
    </div>
    <p className="fseries-preview-caption">Audi B8.5 Sport · Flat bottom</p>
    <p className="fseries-preview-note">Buttons are included. Color and stitch details are confirmed from your build notes and wheel photo.</p>
  </section>;
}

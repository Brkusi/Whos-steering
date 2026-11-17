import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import Configure from './Configure';
import {CartProvider} from '../context';
jest.mock('../components/LedDisplay',()=>()=> <div>LED display</div>);
jest.mock('../components/FSeriesPreview',()=>()=> <div>Wheel preview</div>);
jest.mock('../components/B9ModelPreview',()=>()=> <div>Wheel preview</div>);
jest.mock('../components/AudiB85Preview',()=>()=> <div>Wheel preview</div>);
jest.mock('../components/WheelPreview',()=>()=> <div>Wheel preview</div>);
jest.mock('../components/SalesTools',()=>({__esModule:true,default:()=>null,trackSales:jest.fn()}));
jest.mock('../lib/api',()=>({calcPrice:()=>700,apiFetch:()=>Promise.resolve({})}));
let mockViewport=1280;
jest.mock('../hooks/useViewport',()=>()=>mockViewport);
global.IS_REACT_ACT_ENVIRONMENT=true;
let host,root;
beforeEach(()=>{jest.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue({fillRect:jest.fn(),save:jest.fn(),restore:jest.fn(),translate:jest.fn(),scale:jest.fn(),beginPath:jest.fn(),moveTo:jest.fn(),lineTo:jest.fn(),closePath:jest.fn(),clip:jest.fn(),stroke:jest.fn(),drawImage:jest.fn(),createLinearGradient:()=>({addColorStop:jest.fn()})});mockViewport=1280;sessionStorage.clear();host=document.createElement('div');document.body.append(host);root=createRoot(host);window.scrollTo=jest.fn();});
afterEach(()=>{act(()=>root.unmount());host.remove();jest.restoreAllMocks();});
async function mount(query='brand=AUDI&style=B9&year=2018&model=A4'){await act(async()=>root.render(<MemoryRouter initialEntries={['/configure?'+query]}><CartProvider><Configure/></CartProvider></MemoryRouter>));}
function clickLabel(label){act(()=>host.querySelector(`button[aria-label="${label}"]`).click());}
function jump(value){act(()=>{const s=host.querySelector('.feature-wizard select');s.value=value;s.dispatchEvent(new Event('change',{bubbles:true}));});}
function next(){act(()=>host.querySelector('.feature-wizard-nav .btn').click());}
test('feature choices survive revisiting and transparent stripe swatches retain stripe behavior',async()=>{
 await mount();expect(host.querySelector('.feature-wizard-panel h2').textContent).toBe('Vehicle');
 jump('style-led-display');clickLabel('Add LED Display: YES');next();
 expect(host.querySelector('.feature-wizard-panel h2').textContent).toBe('Top Stripe');
 expect(host.querySelectorAll('svg[role="img"]')).not.toHaveLength(0);
 expect(host.querySelector('svg image').getAttribute('href')).toBe('/stripes/rim-transparent.png');
 clickLabel('Red');jump('style-led-display');expect(host.querySelector('button[aria-label="Add LED Display: NO"]').getAttribute('aria-pressed')).toBe('true');
 jump('style-top-stripe');expect(host.querySelector('button[aria-label="Red"]').getAttribute('aria-pressed')).toBe('true');
});
test('missing photo blocks Next and final validation returns to the exact missing feature',async()=>{
 await mount();next();expect(host.querySelector('.feature-wizard-panel h2').textContent).toBe('Current Wheel Photo');
 next();expect(host.querySelector('.feature-wizard-panel h2').textContent).toBe('Current Wheel Photo');expect(host.textContent).toContain('A photo of your current wheel is required');
 jump('review');next();expect(host.querySelector('.feature-wizard-panel h2').textContent).toBe('Current Wheel Photo');expect(host.querySelector('[role="dialog"]')).toBeNull();
});
test('shape-dependent features disappear for a yoke and reappear when returning to round',async()=>{
 await mount('brand=BMW&style=F-Series&year=2018&model=M3');jump('style-wheel-shape');
 act(()=>[...host.querySelectorAll('button')].find(b=>b.textContent==='Yoke').click());
 expect([...host.querySelectorAll('.feature-wizard option')].map(o=>o.value)).not.toContain('style-top-stripe');
 act(()=>[...host.querySelectorAll('button')].find(b=>b.textContent==='Round').click());
 expect([...host.querySelectorAll('.feature-wizard option')].map(o=>o.value)).toContain('style-top-stripe');
});
test('removes redundant wheel controls and preserves new Urus colors',async()=>{
 await mount();
 expect(host.textContent).toContain('Preview may not exactly match your finished wheel.');
 expect(host.textContent).not.toContain('final fitment checked');
 expect(host.textContent).not.toContain('CHANGE VEHICLE OR WHEEL');
 expect([...host.querySelectorAll('.feature-wizard option')].map(o=>o.value)).not.toContain('style-selected-wheel');
 expect(host.querySelector('.bf-preview-tag')).toBeNull();
 jump('style-wheel-style');
 const sport=[...host.querySelectorAll('button')].find(b=>b.textContent==='Sport (Flat Bottom)');
 act(()=>sport.click());expect(sport.getAttribute('aria-pressed')).toBe('true');
 jump('style-paddle-shifters');
 act(()=>[...host.querySelectorAll('button')].find(b=>b.textContent.startsWith('Urus Style')).click());
 for(const color of ['Silver','Green','Carbon Fiber','Red Carbon Fiber','Forged Carbon Fiber','Red Forged Carbon Fiber','Blue Forged Carbon Fiber']){
  act(()=>[...host.querySelectorAll('button')].find(b=>b.textContent===color).click());
  jump('style-wheel-style');jump('style-paddle-shifters');
  expect([...host.querySelectorAll('button')].find(b=>b.textContent===color).getAttribute('aria-pressed')).toBe('true');
 }
});
test('build review itemizes the active sale discount',async()=>{
 jest.spyOn(Date,'now').mockReturnValue(Date.parse('2026-11-17T12:00:00-05:00'));
 sessionStorage.setItem('ws_restore_build',JSON.stringify({brand:'BMW',wheelStyleType:'F-Series',vehicleYear:'2018',vehicleModel:'M3',photoUrl:'/test-wheel.png',topBottomMat:'Smooth Leather',topBottomCol:'#000000',sideMat:'Perforated Leather',sideCol:'#000000',stitchColor:'#000000',airbagCompat:false}));
 await mount('brand=BMW&style=F-Series&year=2018&model=M3');
 jump('review');next();
 const dialog=host.querySelector('[role="dialog"]');
 expect(dialog).not.toBeNull();
 expect(dialog.textContent).toContain('Original total');
 expect(dialog.textContent).toContain('Black Friday discount (10%)');
 expect(dialog.textContent).toContain('−$70.00');
 expect(dialog.textContent).toContain('$630.00');
});

test('mobile keeps progress, preview and navigation in a locked configuration shell',async()=>{
 mockViewport=390;await mount();
 expect(document.body.classList.contains('wheel-config-active')).toBe(true);
 const wizard=host.querySelector('.feature-wizard');
 expect(wizard.querySelector('.feature-wizard-header')).not.toBeNull();
 expect(wizard.querySelector('.feature-wizard-preview')).not.toBeNull();
 expect(wizard.querySelector('.feature-wizard-nav .wheel-config-mobile-total')).not.toBeNull();
 next();expect(host.querySelector('.feature-wizard-panel h2').textContent).toBe('Current Wheel Photo');
 jump('review');
 act(()=>host.querySelector('.feature-wizard-nav .btn-outline').click());
 expect(host.querySelector('.feature-wizard-panel h2').textContent).not.toBe('Review & notes');
 mockViewport=1280;await mount();
 expect(document.body.classList.contains('wheel-config-active')).toBe(false);
 expect(wizard.querySelector('.feature-wizard-preview')).toBeNull();
});

test('vehicle confirmation appears after year and model; Urus is absent outside Audi',async()=>{
 await mount();expect(host.querySelector('.vehicle-compatible').textContent).toBe('✓ Your vehicle is compatible');
});
test('non-Audi paddle menu excludes Urus',async()=>{
 await mount('brand=BMW&style=F-Series&year=2018&model=M3');jump('style-paddle-shifters');expect(host.textContent).not.toContain('Urus Style');
});

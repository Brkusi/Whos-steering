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
jest.mock('../hooks/useViewport',()=>()=>1280);
global.IS_REACT_ACT_ENVIRONMENT=true;
let host,root;
beforeEach(()=>{sessionStorage.clear();host=document.createElement('div');document.body.append(host);root=createRoot(host);window.scrollTo=jest.fn();});
afterEach(()=>{act(()=>root.unmount());host.remove();});
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

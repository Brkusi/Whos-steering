import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import RevolvingShowroom,{SHOWROOM_WHEELS,clearBackdrop,wheelName} from './RevolvingShowroom';
import {WHEEL_STYLES} from '../lib/wheelStyles';
global.IS_REACT_ACT_ENVIRONMENT=true;

test('the single collection includes every configurable style and interleaves all six brands',()=>{
 expect(new Set(SHOWROOM_WHEELS.map(w=>w.brand+w.style))).toEqual(new Set(WHEEL_STYLES.map(w=>w.brand+w.style)));
 expect(new Set(SHOWROOM_WHEELS.slice(0,6).map(w=>w.brand)).size).toBe(6);
});
test('backdrop keying preserves transparent alpha and small dark product details',()=>{
 const pixels=new Uint8ClampedArray(100*100*4);
 for(let i=0;i<10000;i++)pixels.set([0,0,0,255],i*4);
 for(let y=20;y<80;y++)for(let x=20;x<80;x++)pixels.set([80,80,80,255],(y*100+x)*4);
 pixels.set([0,0,0,255],(50*100+50)*4);
 clearBackdrop(pixels,100,100);
 expect(pixels[3]).toBe(0);
 expect(pixels[(50*100+50)*4+3]).toBe(255);
 expect(pixels[(40*100+40)*4+3]).toBe(255);
});
test('every style opens its exact build route, Back and Escape return it, and chat links to Contact',()=>{
 const original=global.Image;global.Image=class {};
 const host=document.createElement('div');document.body.appendChild(host);const root=createRoot(host);
 act(()=>root.render(<MemoryRouter future={{v7_startTransition:true,v7_relativeSplatPath:true}}><RevolvingShowroom/></MemoryRouter>));
 expect(host.querySelectorAll('.orbit-belt').length).toBe(1);
 act(()=>host.querySelector('.orbit-belt-window').dispatchEvent(new MouseEvent('mouseover',{bubbles:true})));
 expect(host.querySelector('.orbit-belt').style.animationPlayState).toBe('running');
 expect(host.querySelector('.orbit-heading-build').getAttribute('href')).toBe('/build');
 expect(host.querySelector('.orbit-heading-premade').getAttribute('href')).toBe('/catalog');
 expect([...host.querySelectorAll('.orbit-group:first-child .orbit-wheel-fitment')].map(el=>el.textContent)).toEqual(Array(3).fill('All Audi’s 2011+'));
 const select=host.querySelector('select');
 SHOWROOM_WHEELS.forEach((wheel,index)=>{
  act(()=>{select.value=String(index);select.dispatchEvent(new Event('change',{bubbles:true}));});
  expect(host.querySelector('.orbit-selection h2').textContent).toContain(wheelName(wheel));
  expect(host.querySelector('.orbit-build').getAttribute('href')).toBe(`/configure?${new URLSearchParams({brand:wheel.brand,style:wheel.style})}`);
  expect(host.querySelector('.orbit-belt').style.animationPlayState).toBe('paused');
  act(()=> index%2 ? host.querySelector('.orbit-back').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})) : host.querySelector('.orbit-back').click());
  expect(host.querySelector('.orbit-selection')).toBeNull();
  expect(host.querySelector('.orbit-belt').style.animationPlayState).toBe('running');
 });
 expect(host.querySelector('.orbit-chat').getAttribute('href')).toBe('/contact');
 act(()=>root.unmount());host.remove();global.Image=original;
});

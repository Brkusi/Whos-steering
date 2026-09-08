import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Nav from './Nav';
import PaymentCenter from './PaymentCenter';
import { apiFetch } from '../lib/api';
jest.mock('../context',()=>({useCart:()=>({count:0,items:[],total:0,cartOpen:false,setCartOpen:jest.fn(),removeItem:jest.fn()}),useAuth:()=>({user:null})}));
jest.mock('../lib/api',()=>({apiFetch:jest.fn()}));
let container,root;
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;container=document.createElement('div');document.body.appendChild(container);root=createRoot(container);apiFetch.mockReset();});
afterEach(()=>{act(()=>root.unmount());container.remove();});
const render=async component=>{await act(async()=>{root.render(<MemoryRouter>{component}</MemoryRouter>);});};
test('homepage restores original artwork and keeps custom and catalog cards',async()=>{
  await render(<Home/>);
  expect(container.querySelector('.ws-wheel-image').getAttribute('src')).toContain('hero-wheel-highlighted.webp');
  expect(container.querySelector('.site-logo')).toBeNull();
  expect(container.querySelector('a[href="/build"]')).not.toBeNull();
  expect(container.querySelectorAll('.path-card').length).toBe(2);
  expect(container.textContent).toContain('EXPLORE WHEELS');
  expect(container.textContent).not.toContain('Preconfigured');
  expect(container.querySelector('.inline-offer').textContent).toContain('LABOR');
  expect(container.querySelector('.labor-promo-overlay')).toBeNull();
});
test('mobile navigation toggles and Escape closes it while retaining the actual logo',async()=>{
  await render(<Nav/>);
  expect(container.querySelector('.site-logo img').getAttribute('src')).toBe('/ws-logo.png');
  const toggle=container.querySelector('.menu-toggle');
  act(()=>toggle.click());expect(toggle.getAttribute('aria-expanded')).toBe('true');
  act(()=>toggle.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  expect(container.querySelector('#mobile-menu')).toBeNull();
  expect(container.querySelector('.cart-panel').hasAttribute('inert')).toBe(true);
});
test('payment center reads balances without issuing a refund and shows provider failures',async()=>{
  apiFetch.mockResolvedValueOnce({payments:[{id:'payment',order_id:'12345678',email:'example@test.invalid',amount:'100.00',currency:'usd',status:'succeeded',created_at:'2026-09-07'}],hasMore:false});
  await render(<PaymentCenter/>);
  apiFetch.mockRejectedValueOnce(new Error('Provider unavailable'));
  const view=[...container.querySelectorAll('button')].find(b=>b.textContent==='View payment');
  await act(async()=>view.click());
  expect(container.textContent).toContain('Provider unavailable');
  expect(apiFetch.mock.calls.every(([,options])=>!options?.method)).toBe(true);
  expect(container.querySelector('[role="dialog"]')).not.toBeNull();
});

test('account forms offer browser password saving and appropriate autocomplete',async()=>{
  await render(<Login/>);
  expect(container.querySelector('#account-password').autocomplete).toBe('current-password');
  const save=container.querySelector('input[type="checkbox"]');
  expect(save.checked).toBe(false);
  act(()=>save.click()); expect(save.checked).toBe(true);
  act(()=>container.querySelector('[aria-label="Show password"]').click());
  expect(container.querySelector('#account-password').type).toBe('text');
  act(()=>[...container.querySelectorAll('.auth-tabs button')][1].click());
  expect(container.querySelector('#account-password').autocomplete).toBe('new-password');
  expect(container.querySelector('#account-password').minLength).toBe(8);
  expect(container.querySelector('#confirm-password')).not.toBeNull();
});

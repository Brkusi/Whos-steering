import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter,useLocation} from 'react-router-dom';
import {CartProvider,useCart} from '../context';
import CartDrawer from '../components/CartDrawer';
import Airbag from './InfinitiAirbagPreview';
jest.mock('../components/InfinitiAirbag',()=>({InfinitiAirbagPreview:()=>null,InfinitiAirbagOptions:()=>null}));
function Harness(){const cart=useCart(),location=useLocation();return <><Airbag/><CartDrawer open={cart.cartOpen} onClose={()=>cart.setCartOpen(false)}/><output>{location.pathname}</output></>;}
test('review confirms selections, adds exact item to shared cart and proceeds to checkout',async()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;
 sessionStorage.clear();localStorage.clear();
 localStorage.setItem('whossteering:infiniti-q50-airbag:v1',JSON.stringify({airbagMat:'Alcantara',infinitiLogoFinish:'Carbon color',infinitiLogoCol:'#E85500'}));
 const host=document.createElement('div');document.body.appendChild(host);const root=createRoot(host);
 await act(async()=>root.render(<MemoryRouter future={{v7_startTransition:true,v7_relativeSplatPath:true}}><CartProvider><Harness/></CartProvider></MemoryRouter>));
 act(()=>host.querySelector('.infiniti-add-to-cart').click());
 expect(host.querySelector('.infiniti-review').textContent).toContain('Carbon color');
 expect(host.querySelector('.infiniti-review').textContent).toContain('$189.98');
 act(()=>host.querySelector('.infiniti-review .btn').click());
 expect(host.querySelector('.cart-panel').getAttribute('aria-hidden')).toBe('false');
 expect(host.querySelector('.cart-item').textContent).toContain('Custom Airbag Cover');
 expect(host.querySelector('.cart-item').textContent).toContain('Carbon color');
 expect(host.querySelector('.cart-item').textContent).toContain('$189.98');
 const items=JSON.parse(sessionStorage.getItem('ws_cart'));
 expect(items[0].config.infinitiLogoFinish).toBe('Carbon color');
 expect(items[0].config.airbagMat).toBe('Alcantara');
 act(()=>host.querySelector('.cart-panel .btn').click());
 expect(host.querySelector('output').textContent).toBe('/checkout');
 act(()=>root.unmount());host.remove();sessionStorage.clear();localStorage.clear();
});

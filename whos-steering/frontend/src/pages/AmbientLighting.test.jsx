import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
global.IS_REACT_ACT_ENVIRONMENT=true;
import {MemoryRouter} from 'react-router-dom';
import AmbientLighting from './AmbientLighting';
import {CartProvider,useCart} from '../context';
let root,host;
function CartSnapshot(){const {items,total,addItem}=useCart();return <><output id="cart-result">{JSON.stringify({items,total})}</output><button id="repeat-add" onClick={()=>addItem({name:'lighting',price:0.01,quantity:100,config:{productType:'ambient-lighting',lightingVariant:'26-in-1'}})}>Repeat</button></>;}
beforeEach(()=>{sessionStorage.clear();host=document.createElement('div');document.body.append(host);root=createRoot(host);act(()=>root.render(<MemoryRouter><CartProvider><AmbientLighting/><CartSnapshot/></CartProvider></MemoryRouter>));});
afterEach(()=>{act(()=>root.unmount());host.remove();});
const click=element=>act(()=>element.dispatchEvent(new MouseEvent('click',{bubbles:true})));
function change(element,value){act(()=>{Object.getOwnPropertyDescriptor(element.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(element,value);element.dispatchEvent(new Event('change',{bubbles:true}));element.dispatchEvent(new Event('input',{bubbles:true}));});}
test('choosing a kit updates prices, contents and charged quantity; repeated additions cannot exceed 100',()=>{
 expect(host.querySelectorAll('input[name="lighting-kit"]')).toHaveLength(10);
 expect(host.querySelector('.lighting-order').compareDocumentPosition(host.querySelector('.lighting-explorer')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
 click(host.querySelector('input[value="6-in-1"]'));
 expect(host.querySelector('.lighting-price').textContent).toContain('$49.99');
 expect(host.querySelector('.lighting-price del').textContent).toBe('$64.99');
 expect(host.querySelector('.lighting-contents img').getAttribute('src')).toContain('kit-10-transparent.png');
 change(host.querySelector('#lighting-quantity'),'101');
 expect(host.querySelector('#lighting-quantity').value).toBe('100');
 click([...host.querySelectorAll('button')].find(b=>b.textContent==='ADD TO CART'));
 let cart=JSON.parse(host.querySelector('#cart-result').textContent);
 expect(cart.total).toBeCloseTo(4999,2);expect(cart.items[0].quantity).toBe(100);
 click(host.querySelector('#repeat-add'));
 cart=JSON.parse(host.querySelector('#cart-result').textContent);expect(cart.items).toHaveLength(1);expect(cart.total).toBeCloseTo(4999,2);
});
test('LED hotspots zoom, cycle insights and reset; view navigation opens different supplier photos',()=>{
 click(host.querySelector('[aria-label="Explore Acrylic light guide"]'));
 expect(host.querySelector('.lighting-insight h2').textContent).toBe('A continuous line of light.');
 expect(host.querySelector('.lighting-image-layer').style.transform).toContain('scale(2.1)');
 click([...host.querySelectorAll('button')].find(b=>b.textContent==='NEXT →'));
 expect(host.querySelector('.lighting-insight h2').textContent).toBe('Color that moves with you.');
 click(host.querySelector('[aria-label="Close feature details"]'));
 expect(host.querySelector('.lighting-image-layer').style.transform).toBe('');
 click(host.querySelector('[aria-label="Next lighting view"]'));
 expect(host.querySelector('.lighting-image-layer img').getAttribute('src')).toContain('view-2.jpg');
});
test('customers can mix three 6-in-1 kits with two 26-in-1 kits as separate cart lines',()=>{
 click(host.querySelector('input[value="6-in-1"]'));change(host.querySelector('#lighting-quantity'),'3');
 click([...host.querySelectorAll('button')].find(b=>b.textContent==='ADD TO CART'));
 click(host.querySelector('input[value="26-in-1"]'));change(host.querySelector('#lighting-quantity'),'2');
 click([...host.querySelectorAll('button')].find(b=>b.textContent==='ADD TO CART'));
 const cart=JSON.parse(host.querySelector('#cart-result').textContent);
 expect(cart.items).toHaveLength(2);
 expect(cart.items.map(i=>[i.config.lightingVariant,i.quantity])).toEqual([['6-in-1',3],['26-in-1',2]]);
 expect(cart.total).toBeCloseTo(309.95,2);
});

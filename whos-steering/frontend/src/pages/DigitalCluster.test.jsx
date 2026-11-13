import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import DigitalCluster,{DigitalClusterCard} from './DigitalCluster';
import {apiFetch} from '../lib/api';
import {seoForRoute} from '../lib/seoCatalog';
import {CLUSTER_PATH,CLUSTER_PRODUCT} from '../lib/digitalCluster';
jest.mock('../lib/api',()=>({apiFetch:jest.fn()}));
let root,host;
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');document.body.appendChild(host);root=createRoot(host);apiFetch.mockReset();});
afterEach(()=>{act(()=>root.unmount());host.remove();});
function mount(element,entry=CLUSTER_PATH){act(()=>root.render(<MemoryRouter initialEntries={[entry]} future={{v7_startTransition:true,v7_relativeSplatPath:true}}>{element}</MemoryRouter>));}
function fill(input,value){act(()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));});}
test('hotspots zoom to the selected part, explain options and reset with Escape',()=>{
 mount(<DigitalCluster/>);const buttons=host.querySelectorAll('.cluster-hotspot');expect(Array.from(buttons).every(button=>button.textContent==='')).toBe(true);expect(host.querySelector('.cluster-view-label').textContent).toBe('EXPLORE THE SYSTEM');
 act(()=>buttons[0].click());expect(host.querySelector('.cluster-image-layer').style.transform).toContain('scale(2.05)');expect(host.querySelector('#cluster-detail').textContent).toContain('Sport');expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
 act(()=>buttons[1].click());expect(host.querySelector('#cluster-detail').textContent).toContain('Apple CarPlay');expect(host.querySelector('.cluster-popover')).not.toBeNull();
 act(()=>host.querySelector('.cluster-view').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));expect(host.querySelector('.cluster-image-layer').style.transform).toContain('scale(1)');
 expect(host.querySelector('.cluster-page').textContent).not.toMatch(/\$|ADD TO CART|BUY NOW/);
});
test('waitlist preserves entries after failure and only confirms a server response',async()=>{
 mount(<DigitalCluster/>,CLUSTER_PATH+'?waitlist=1');fill(host.querySelector('#cluster-name'),'Driver');fill(host.querySelector('#cluster-email'),'driver@example.com');fill(host.querySelector('#cluster-vehicle'),'2016 Audi A7');act(()=>host.querySelector('[type=checkbox]').click());
 apiFetch.mockRejectedValueOnce(new Error('Try again shortly.'));
 await act(async()=>host.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
 expect(host.querySelector('[role=alert]').textContent).toContain('Try again');expect(host.querySelector('#cluster-email').value).toBe('driver@example.com');expect(host.querySelector('.cluster-success')).toBeNull();
 apiFetch.mockResolvedValueOnce({ok:true});await act(async()=>host.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
 expect(apiFetch).toHaveBeenLastCalledWith('/api/waitlist/subscribe',expect.objectContaining({body:JSON.stringify({name:'Driver',email:'driver@example.com',vehicle:'2016 Audi A7',consent:true,product:CLUSTER_PRODUCT})}));expect(host.querySelector('.cluster-success').textContent).toContain('YOU’RE ON THE LIST');
});
test('store card and metadata contain no price or purchasable offer',()=>{
 mount(<DigitalClusterCard/>);expect(host.textContent).toContain('JOIN THE WAITLIST');expect(host.textContent).not.toMatch(/\$|ADD TO CART/);const seo=seoForRoute(CLUSTER_PATH);expect(seo.noindex).toBe(false);const product=seo.schema['@graph'].find(item=>item['@type']==='Product');expect(product).toBeDefined();expect(product.offers).toBeUndefined();
});

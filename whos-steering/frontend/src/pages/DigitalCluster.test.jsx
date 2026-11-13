import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import DigitalCluster,{DigitalClusterCard} from './DigitalCluster';
import {apiFetch} from '../lib/api';
import {seoForRoute} from '../lib/seoCatalog';
import {CLUSTER_PATH,CLUSTER_PRODUCT,CLUSTER_VIEWS} from '../lib/digitalCluster';
jest.mock('../lib/api',()=>({apiFetch:jest.fn()}));
let root,host;
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');document.body.appendChild(host);root=createRoot(host);apiFetch.mockReset();});
afterEach(()=>{act(()=>root.unmount());host.remove();});
function mount(element,entry=CLUSTER_PATH){act(()=>root.render(<MemoryRouter initialEntries={[entry]} future={{v7_startTransition:true,v7_relativeSplatPath:true}}>{element}</MemoryRouter>));}
function fill(input,value){act(()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));});}
test('hotspots zoom to the selected part, explain options and reset with Escape',()=>{
 mount(<DigitalCluster/>);const buttons=host.querySelectorAll('.cluster-hotspot');expect(Array.from(buttons).every(button=>button.textContent==='')).toBe(true);expect(host.querySelector('.cluster-view-label').textContent).toContain('EXPLORE THE SYSTEM');
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

test('Explore other features visits every supplied photo, resets zoom and uses the matching hotspots',()=>{
 mount(<DigitalCluster/>);const image=()=>host.querySelector('.cluster-view-image');
 expect(CLUSTER_VIEWS).toHaveLength(8);expect(new Set(CLUSTER_VIEWS.map(view=>view.source)).size).toBe(8);
 act(()=>host.querySelector('.cluster-hotspot').click());expect(host.querySelector('.cluster-popover')).not.toBeNull();expect(host.querySelector('.cluster-next')).toBeNull();act(()=>host.querySelector('h1').click());
 for(let index=1;index<CLUSTER_VIEWS.length;index++){
  act(()=>host.querySelector('.cluster-next').click());expect(host.querySelector('.cluster-popover')).toBeNull();expect(host.querySelector('.cluster-image-layer').style.transform).toContain('scale(1)');expect(image().getAttribute('src')).toBe(CLUSTER_VIEWS[index].image);expect(host.querySelector('.cluster-view-name').textContent).toContain(CLUSTER_VIEWS[index].label);expect(host.querySelector('.cluster-hotspot').disabled).toBe(true);
  act(()=>image().dispatchEvent(new Event('load')));act(()=>host.querySelector('.cluster-hotspot').click());expect(host.querySelector('.cluster-popover').textContent).toContain(CLUSTER_VIEWS[index].features[0].title);act(()=>document.body.click());
 }
 act(()=>host.querySelector('.cluster-next').click());expect(image().getAttribute('src')).toBe(CLUSTER_VIEWS[0].image);act(()=>image().dispatchEvent(new Event('load')));
 act(()=>host.querySelector('.cluster-previous').click());expect(image().getAttribute('src')).toBe(CLUSTER_VIEWS.at(-1).image);
});
test('a failed view load leaves navigation available and offers a retry',()=>{
 mount(<DigitalCluster/>);act(()=>host.querySelector('.cluster-next').click());act(()=>host.querySelector('.cluster-view-image').dispatchEvent(new Event('error')));expect(host.querySelector('[role=alert]').textContent).toContain('couldn’t load');expect(host.querySelector('.cluster-hotspot').disabled).toBe(true);act(()=>host.querySelector('.cluster-image-status button').click());expect(host.querySelector('.cluster-view-image').getAttribute('src')).toContain('?retry=1');act(()=>host.querySelector('.cluster-view-image').dispatchEvent(new Event('load')));expect(host.querySelector('.cluster-hotspot').disabled).toBe(false);
});

test('overview navigation sits beneath the unit, disappears during insights, and outside clicks restore it',()=>{
 mount(<DigitalCluster/>);expect(host.querySelector('.cluster-next').textContent).toContain('EXPLORE OTHER FEATURES');expect(host.querySelector('.cluster-more-features').previousElementSibling.className).toContain('cluster-viewport');
 act(()=>host.querySelector('.cluster-hotspot').click());expect(host.querySelector('.cluster-next')).toBeNull();
 act(()=>host.querySelector('.cluster-popover p').click());expect(host.querySelector('.cluster-popover')).not.toBeNull();
 act(()=>host.querySelector('.cluster-specs').click());expect(host.querySelector('.cluster-popover')).toBeNull();expect(host.querySelector('.cluster-image-layer').style.transform).toContain('scale(1)');expect(host.querySelector('.cluster-next')).not.toBeNull();
 const previous=host.querySelector('.cluster-view-image').getAttribute('src');act(()=>host.querySelector('.cluster-next').click());expect(host.textContent).not.toContain('Loading features');expect(host.querySelector('.cluster-previous-image').getAttribute('src')).toBe(previous);expect(host.querySelector('.cluster-view-image').style.visibility).toBe('hidden');
 act(()=>host.querySelector('.cluster-view-image').dispatchEvent(new Event('load')));expect(host.querySelector('.cluster-previous-image')).toBeNull();expect(host.querySelector('.cluster-view-image').style.visibility).toBe('visible');
});

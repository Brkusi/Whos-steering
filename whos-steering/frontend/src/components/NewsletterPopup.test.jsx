import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import Popup from './NewsletterPopup';
import {apiFetch} from '../lib/api';
jest.mock('../lib/api',()=>({apiFetch:jest.fn()}));
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;jest.useFakeTimers();localStorage.clear();apiFetch.mockReset();});
afterEach(()=>jest.useRealTimers());
test('homepage newsletter opens after delay, requires consent and saves an opted-in subscription',async()=>{
 const host=document.createElement('div');document.body.appendChild(host);const root=createRoot(host);act(()=>root.render(<Popup/>));
 expect(host.querySelector('[role=dialog]')).toBeNull();act(()=>jest.advanceTimersByTime(5000));expect(host.querySelector('[role=dialog]')).not.toBeNull();
 const email=host.querySelector('input[type=email]');act(()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(email,'driver@example.com');email.dispatchEvent(new Event('input',{bubbles:true}));});
 act(()=>host.querySelector('input[type=checkbox]').click());apiFetch.mockResolvedValue({ok:true});await act(async()=>host.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
 expect(apiFetch).toHaveBeenCalledWith('/api/newsletter/subscribe',{method:'POST',body:JSON.stringify({email:'driver@example.com',consent:true})});expect(host.textContent).toContain('YOU’RE ON THE LIST.');
 act(()=>host.querySelector('.newsletter-close').click());expect(host.querySelector('[role=dialog]')).toBeNull();expect(Number(localStorage.getItem('ws_newsletter_popup_v1'))).toBeGreaterThan(Date.now());act(()=>root.unmount());host.remove();
});
test('dismissal suppresses the popup for seven days',()=>{
 localStorage.setItem('ws_newsletter_popup_v1',String(Date.now()));const host=document.createElement('div'),root=createRoot(host);act(()=>root.render(<Popup/>));act(()=>jest.advanceTimersByTime(10000));expect(host.querySelector('[role=dialog]')).toBeNull();act(()=>root.unmount());
});

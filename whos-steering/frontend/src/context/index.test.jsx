import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {AuthProvider,useAuth} from './index';
import {apiFetch,authToken,warmAccountService} from '../lib/api';
jest.mock('../lib/api',()=>({apiFetch:jest.fn(),authToken:jest.fn(),warmAccountService:jest.fn()}));
global.IS_REACT_ACT_ENVIRONMENT=true;
let current,root,host;
function Probe(){current=useAuth();return null;}
beforeEach(()=>{jest.clearAllMocks();localStorage.clear();sessionStorage.clear();host=document.createElement('div');document.body.appendChild(host);root=createRoot(host);});
afterEach(()=>{act(()=>root.unmount());host.remove();});
test('successful login becomes ready immediately and a stale session rejection cannot clear it',async()=>{
 let rejectOld;
 authToken.mockReturnValue('old-token');localStorage.setItem('ws_token','old-token');
 apiFetch.mockImplementation(path=>path==='/api/auth/me'?new Promise((resolve,reject)=>{rejectOld=reject;}):Promise.resolve({token:'new-token',user:{id:'new-user',email:'driver@example.com'}}));
 act(()=>root.render(<AuthProvider><Probe/></AuthProvider>));
 expect(current.loading).toBe(true);
 await act(async()=>{await current.login('driver@example.com','password');});
 expect(current.loading).toBe(false);expect(current.user.id).toBe('new-user');
 await act(async()=>{rejectOld(Object.assign(new Error('Expired old session'),{status:401}));});
 expect(current.user.id).toBe('new-user');expect(sessionStorage.getItem('ws_token')).toBe('new-token');
});
test('a late session response cannot sign a customer back in after logout',async()=>{
 let resolveOld;authToken.mockReturnValue('old-token');
 apiFetch.mockImplementation(()=>new Promise(resolve=>{resolveOld=resolve;}));
 act(()=>root.render(<AuthProvider><Probe/></AuthProvider>));
 act(()=>current.logout());
 await act(async()=>resolveOld({id:'old-user'}));
 expect(current.user).toBeNull();expect(current.loading).toBe(false);expect(localStorage.getItem('ws_user')).toBeNull();
});
test('visiting without a session starts warming the service without blocking the page',()=>{
 authToken.mockReturnValue(null);
 act(()=>root.render(<AuthProvider><Probe/></AuthProvider>));
 expect(warmAccountService).toHaveBeenCalledTimes(1);expect(current.loading).toBe(false);
});

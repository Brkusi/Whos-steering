import { apiFetch } from './api';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('a network failure gives a useful service message', async () => {
  global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
  await expect(apiFetch('/api/auth/login')).rejects.toMatchObject({
    code: 'NETWORK_ERROR',
    message: expect.stringContaining('temporarily unavailable'),
  });
});

test('a server outage is distinguishable from invalid credentials', async () => {
  global.fetch.mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
  await expect(apiFetch('/api/auth/login')).rejects.toMatchObject({
    status: 503,
    message: expect.stringContaining('temporarily unavailable'),
  });

  global.fetch.mockResolvedValue({ ok: false, status: 401, json: async () => ({ error: 'Invalid credentials' }) });
  await expect(apiFetch('/api/auth/login')).rejects.toMatchObject({
    status: 401,
    message: 'Invalid credentials',
  });
});

test('service warm-up is deduplicated, never sends account credentials, and does not block authentication',async()=>{
 const previous=process.env.REACT_APP_API_URL;
 process.env.REACT_APP_API_URL='https://account.example.com';
 let warm;
 jest.isolateModules(()=>{warm=require('./api').warmAccountService;});
 process.env.REACT_APP_API_URL=previous;
 let finish;global.fetch.mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));
 const first=warm(),second=warm();
 expect(first).toBe(second);expect(global.fetch).toHaveBeenCalledTimes(1);
 expect(global.fetch.mock.calls[0][0]).toBe('https://account.example.com/health');
 expect(global.fetch.mock.calls[0][1].headers).toBeUndefined();
 finish({ok:true});await first;await warm();
 expect(global.fetch).toHaveBeenCalledTimes(1);
});

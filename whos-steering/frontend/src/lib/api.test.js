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

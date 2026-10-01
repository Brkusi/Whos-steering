import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import SalesCenter from './SalesCenter';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({ apiFetch: jest.fn() }));
let container, root;
const lead = { id: 'lead-1', email: 'driver@example.test', status: 'open', created_at: '2026-09-29T13:00:00Z', payload: { brand: 'BMW', year: '2020', model: 'M3', photoUrl: 'https://example.test/wheel.jpg' } };
const report = {
  events: [{ event: 'configure_started', count: '5' }], counts: [{ kind: 'build', count: '2' }],
  orders: { purchases: '1', revenue: '799.99' }, recovered: { orders: '0', revenue: '0' },
  activity: { events: [], orders: [] }, recentSaves: [], fitment: { open: '1', resolved: '0', oldest_open: lead.created_at },
  email: true, recovery: false
};
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  apiFetch.mockReset();
  apiFetch.mockImplementation((path, options) => {
    if (options?.method === 'PATCH') return Promise.resolve({ ok: true });
    if (path.startsWith('/api/sales/admin/fitment')) return Promise.resolve({ leads: [lead], total: 1, hasMore: false });
    return Promise.resolve(report);
  });
});
afterEach(() => { act(() => root.unmount()); container.remove(); });

test('sales period and chart controls update, and a fitment request can be resolved', async () => {
  await act(async () => root.render(<SalesCenter />));
  expect(container.textContent).toContain('Fitment inbox');
  expect(container.textContent).toContain('$799.99');
  await act(async () => [...container.querySelectorAll('.sales-period button')][0].click());
  expect(apiFetch.mock.calls.some(([path]) => path === '/api/sales/admin?days=7')).toBe(true);
  act(() => [...container.querySelectorAll('.sales-metric-tabs button')][1].click());
  expect(container.querySelector('.sales-metric-tabs button.active').textContent).toBe('Checkout starts');
  await act(async () => container.querySelector('.sales-fitment-row').click());
  expect(container.textContent).toContain('driver@example.test');
  await act(async () => [...container.querySelectorAll('.sales-fitment-actions button')][0].click());
  expect(apiFetch).toHaveBeenCalledWith('/api/sales/admin/lead-1', { method: 'PATCH', body: JSON.stringify({ status: 'resolved' }) });
  expect(container.textContent).toContain('Fitment request resolved.');
});

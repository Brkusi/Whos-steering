import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import TrackOrder from './TrackOrder';
import { apiFetch } from '../lib/api';

let mockCurrentUser = { id: 'owner-1' };
jest.mock('../context', () => ({ useAuth: () => ({ user: mockCurrentUser, loading: false }) }));
jest.mock('../lib/api', () => ({ apiFetch: jest.fn() }));

let container;
let root;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  mockCurrentUser = { id: 'owner-1' };
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  apiFetch.mockReset();
});
afterEach(() => { act(() => root.unmount()); container.remove(); });

test('logging out clears the account order and ignores a late account response', async () => {
  let finishRequest;
  apiFetch.mockImplementation(() => new Promise(resolve => { finishRequest = resolve; }));
  await act(async () => { root.render(<TrackOrder />); });
  expect(apiFetch).toHaveBeenCalledWith('/api/orders/my');

  mockCurrentUser = null;
  await act(async () => { root.render(<TrackOrder />); });
  expect(container.querySelector('.track-result')).toBeNull();
  expect(container.querySelector('.track-form')).not.toBeNull();

  await act(async () => {
    finishRequest([{ id: 'abcdef12-0000-0000-0000-000000000000', status: 'shipped' }]);
  });
  expect(container.querySelector('.track-result')).toBeNull();
});

test('logging out removes an order already displayed for the prior account', async () => {
  apiFetch.mockResolvedValue([{ id: 'abcdef12-0000-0000-0000-000000000000', status: 'shipped' }]);
  await act(async () => { root.render(<TrackOrder />); });
  expect(container.querySelector('.track-result')).not.toBeNull();
  expect(container.textContent).toContain('ABCDEF12');

  mockCurrentUser = null;
  await act(async () => { root.render(<TrackOrder />); });
  expect(container.querySelector('.track-result')).toBeNull();
  expect(container.textContent).not.toContain('ABCDEF12');
});

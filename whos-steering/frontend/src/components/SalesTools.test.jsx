import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import SalesTools from './SalesTools';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api', () => ({ apiFetch: jest.fn() }));

test('fitment request saves the exact wheel and selected build', async () => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const config = {brand:'BMW',vehicleYear:'2020',vehicleModel:'M3',photoUrl:'https://example.test/wheel.jpg',wheelStyleType:'G-Series Pre LCI',topBottomMat:'Forged Carbon',topBottomCarbonCol:'#1A0A2E',sideMat:'Perforated Leather',sideCol:'#CC2200',paddleShifters:'Magnetic',paddleLength:'Long'};
  apiFetch.mockImplementation(path => path === '/api/sales/status' ? Promise.resolve({recovery:false}) : Promise.resolve({ok:true}));
  await act(async () => root.render(<SalesTools config={config} />));
  const email = container.querySelector('input[type="email"]');
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(email, 'driver@example.test');
    email.dispatchEvent(new Event('input', {bubbles:true}));
  });
  await act(async () => [...container.querySelectorAll('button')].find(button => button.textContent === 'ASK ABOUT FITMENT').click());
  const [, options] = apiFetch.mock.calls.find(([path]) => path === '/api/sales/save');
  const request = JSON.parse(options.body);
  expect(request.kind).toBe('fitment');
  expect(request.payload).toMatchObject({brand:'BMW',year:'2020',model:'M3',photoUrl:config.photoUrl,config});
  act(() => root.unmount());
  container.remove();
});

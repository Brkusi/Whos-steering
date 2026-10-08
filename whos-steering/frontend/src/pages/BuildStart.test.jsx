import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import BuildStart from './BuildStart';

let container, root;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); });

const choose = (id, value) => act(() => {
  const select = container.querySelector(`#${id}`);
  select.value = value;
  select.dispatchEvent(new Event('change', {bubbles:true}));
});

test('compatibility guides make, year, then model and filters wheel styles', async () => {
  await act(async () => root.render(<MemoryRouter><BuildStart /></MemoryRouter>));
  expect(document.activeElement.id).toBe('compatible-make');
  expect(container.querySelectorAll('.build-brand-card')).toHaveLength(13);

  choose('compatible-make', 'AUDI');
  expect(document.activeElement.id).toBe('build-vehicle-year');
  expect(container.querySelector('.vehicle-field.is-next select').id).toBe('build-vehicle-year');
  expect(container.querySelectorAll('.build-brand-card')).toHaveLength(3);

  choose('build-vehicle-year', '2020');
  expect(document.activeElement.id).toBe('build-vehicle-model');
  expect(container.querySelector('.vehicle-field.is-next select').id).toBe('build-vehicle-model');

  choose('build-vehicle-model', 'A4');
  expect(container.querySelector('.vehicle-field.is-next')).toBeNull();
  expect(container.textContent).toContain('Vehicle details added');
  expect(container.querySelectorAll('.build-brand-card')).toHaveLength(3);
});

test('BMW chassis selection filters families and highlights the next field', async () => {
  await act(async () => root.render(<MemoryRouter><BuildStart /></MemoryRouter>));
  choose('compatible-make', 'BMW');
  choose('build-vehicle-year', '2018');
  const firstModel = container.querySelector('#build-vehicle-model option:not([value=""])').value;
  choose('build-vehicle-model', firstModel);
  expect(document.activeElement.id).toBe('build-vehicle-chassis');
  choose('build-vehicle-chassis', 'G');
  expect(container.querySelectorAll('.build-brand-card')).toHaveLength(2);
  choose('build-vehicle-chassis', 'F');
  expect(container.querySelectorAll('.build-brand-card')).toHaveLength(3);
  choose('build-vehicle-chassis', 'E90');
  expect(container.querySelectorAll('.build-brand-card')).toHaveLength(1);
});

test('Toyota Supra is the only Toyota with an online wheel; other models reach contact', async () => {
  await act(async () => root.render(<MemoryRouter><BuildStart /></MemoryRouter>));
  choose('compatible-make', 'TOYOTA');
  choose('build-vehicle-year', '2024');
  choose('build-vehicle-model', 'Camry');
  expect(container.querySelectorAll('.build-brand-card')).toHaveLength(0);
  expect(container.textContent).toContain('we currently do not offer online customization');
  expect(container.querySelector('.build-start__unavailable a').getAttribute('href')).toBe('/contact?brand=TOYOTA&year=2024&model=Camry');
  choose('build-vehicle-model', 'Supra');
  expect(container.querySelectorAll('.build-brand-card')).toHaveLength(1);
});

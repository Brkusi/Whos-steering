import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import BuildPipelineChart from './BuildPipelineChart';

let container, root;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); });

test('zero active orders have no filled gauge segments', () => {
  act(() => root.render(<BuildPipelineChart stats={{ awaiting_build: '0', building_now: '0', quality_now: '0', in_transit: '0' }} onSelect={() => {}} />));
  expect(container.textContent).toContain('No active orders right now');
  expect(container.querySelectorAll('svg path:not([fill="#34373e"])')).toHaveLength(0);
});

test('stage action selects exactly the current status rather than cumulative historical counts', () => {
  const onSelect = jest.fn();
  act(() => root.render(<BuildPipelineChart stats={{ awaiting_build: '3', building_now: '2', quality_now: '1', in_transit: '4', paid: '70' }} onSelect={onSelect} />));
  expect(container.textContent).toContain('10 active orders');
  act(() => container.querySelector('[aria-label="View quality check: 1 orders"]').click());
  expect(onSelect).toHaveBeenCalledWith('quality_check');
});

test('an older API does not present missing current-stage metrics as zero', () => {
  act(() => root.render(<BuildPipelineChart stats={{ paid: 30, in_build: 20, shipped: 10 }} onSelect={() => {}} />));
  expect(container.textContent).toContain('updated API');
  expect(container.querySelector('button')).toBeNull();
});

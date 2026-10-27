import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import WheelDetails from './WheelDetails';

global.IS_REACT_ACT_ENVIRONMENT = true;

test('each hotspot zooms its detail, links to the builder, and restores keyboard focus', () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<MemoryRouter future={{v7_startTransition:true,v7_relativeSplatPath:true}}><WheelDetails /></MemoryRouter>));
  const labels = ['Grip materials', 'Stitching & stripe', 'Carbon & controls'];
  labels.forEach((label, index) => {
    const trigger = container.querySelector(`[aria-label="Zoom in: ${label}"]`);
    act(() => trigger.click());
    expect(container.querySelector('[role="dialog"]').getAttribute('aria-label')).toBe(`${label} customization details`);
    expect(container.querySelector('img').style.transform).toContain('scale(2.45)');
    expect(container.querySelector('.ws-detail-link').getAttribute('href')).toBe('/build');
    const back = container.querySelector('.ws-back');
    expect(document.activeElement).toBe(back);
    act(() => index === 1 ? back.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', bubbles:true})) : back.click());
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(container.querySelector('img').style.transform).toContain('scale(1)');
    expect(document.activeElement).toBe(trigger);
  });
  act(() => root.unmount());
  container.remove();
});

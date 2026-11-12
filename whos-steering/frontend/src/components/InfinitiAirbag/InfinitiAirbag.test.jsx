import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { InfinitiAirbagOptions } from './index';
test('LED selection shows wiring notice; other finishes do not', () => {
  const html = renderToStaticMarkup(<InfinitiAirbagOptions config={{infinitiLogoFinish:'LED'}} onChange={()=>{}} />);
  expect(html).toContain('RGB LED colors are controlled via Bluetooth.');
  expect(html).toContain('The LED emblem must be wired properly upon installation.');
  expect(html).not.toContain('illumination, as shown.');
  expect(html).toContain('+$79.99');
  expect(html).not.toContain('aria-label="Infiniti logo color:');
  const regular = renderToStaticMarkup(<InfinitiAirbagOptions config={{infinitiLogoFinish:'Regular Color'}} onChange={()=>{}} />);
  expect(regular).not.toContain('must be wired properly');
  expect(regular).toContain('Included');
});

test('Classic is a separate included chrome finish with no color choices', () => {
 const html=renderToStaticMarkup(<InfinitiAirbagOptions config={{infinitiLogoFinish:'Classic'}} onChange={()=>{}} />);
 expect(html).toContain('Chrome Infiniti emblem');
 expect(html).toContain('aria-pressed="true">Classic<small>Included');
 expect(html).not.toContain('aria-label="Infiniti logo color:');
});

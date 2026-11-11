import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { InfinitiAirbagOptions } from './index';
test('LED selection shows wiring notice; other finishes do not', () => {
  const html = renderToStaticMarkup(<InfinitiAirbagOptions config={{infinitiLogoFinish:'LED'}} onChange={()=>{}} />);
  expect(html).toContain('The LED emblem must be wired properly upon installation.');
  expect(html).not.toContain('illumination, as shown.');
  expect(html).toContain('+$79.99');
  expect(html).not.toContain('aria-label="Infiniti logo color:');
  const regular = renderToStaticMarkup(<InfinitiAirbagOptions config={{infinitiLogoFinish:'Regular Color'}} onChange={()=>{}} />);
  expect(regular).not.toContain('must be wired properly');
  expect(regular).toContain('Included');
});

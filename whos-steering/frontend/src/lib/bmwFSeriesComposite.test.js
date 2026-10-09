import { gripZoneOpacity, stripeColorIndex, wheelSilhouetteOpacity } from './bmwFSeriesComposite';
import { stitchMaskWeight } from './bmwFSeriesSourceRenderer';

test('material layers stop at the photographed wheel silhouette', () => {
  expect(wheelSilhouetteOpacity(1,1,1,255,true)).toBe(0);
  expect(wheelSilhouetteOpacity(24,20,18,255,true)).toBe(255);
  expect(wheelSilhouetteOpacity(0,0,0,0,false)).toBe(0);
  expect(wheelSilhouetteOpacity(0,0,0,255,false)).toBe(255);
});

test('faint stripe pixels outside the opaque bounds retain an edge color', () => {
  for (const count of [1, 3]) {
    for (let x = 0; x < 1024; x++) {
      const index = stripeColorIndex(x, 490, 534, count);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(count);
    }
    expect(stripeColorIndex(489, 490, 534, count)).toBe(0);
    expect(stripeColorIndex(535, 490, 534, count)).toBe(count - 1);
  }
  expect([490, 512, 534].map(x => stripeColorIndex(x, 490, 534, 3))).toEqual([0, 1, 2]);
});

test('grip colors cannot cover spokes or the airbag in 2D source images', () => {
  expect(gripZoneOpacity(.5,.5,'side')).toBe(0);
  expect(gripZoneOpacity(.5,.5,'top')).toBe(0);
  expect(gripZoneOpacity(.1,.5,'side')).toBe(1);
  expect(gripZoneOpacity(.5,.1,'top')).toBe(1);
  expect(gripZoneOpacity(.5,.1,'top','yoke')).toBe(0);
  expect(gripZoneOpacity(.5,.9,'top','yoke')).toBe(1);
});

test('compressed red noise in source maps does not become stitching', () => {
  expect(stitchMaskWeight(95,210)).toBe(0);
  expect(stitchMaskWeight(145,200)).toBe(0);
  expect(stitchMaskWeight(255,220)).toBe(1);
  expect(stitchMaskWeight(255,65)).toBe(1);
});

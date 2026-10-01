import { activityBuckets } from './salesDashboard';

test('sales activity uses the full selected period and groups days consistently', () => {
  const activity = {
    events: [
      { day: '2026-09-01', event: 'configure_started', count: '3' },
      { day: '2026-09-03', event: 'checkout_started', count: '2' },
      { day: '2026-09-30', event: 'configure_started', count: '4' },
      { day: '2026-08-31', event: 'configure_started', count: '20' }
    ],
    orders: [{ day: '2026-09-30', count: '1' }]
  };
  const buckets = activityBuckets(activity, 30, new Date('2026-09-30T12:00:00Z'));
  expect(buckets).toHaveLength(10);
  expect(buckets[0]).toMatchObject({ start: '2026-09-01', configure: 3, checkout: 2 });
  expect(buckets[9]).toMatchObject({ configure: 4, orders: 1 });
  expect(buckets.reduce((sum, bucket) => sum + bucket.configure, 0)).toBe(7);
});

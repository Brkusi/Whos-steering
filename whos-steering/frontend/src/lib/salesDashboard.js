export function activityBuckets(activity, days, today = new Date()) {
  const width = days === 7 ? 1 : days === 30 ? 3 : 7;
  const midnight = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const first = midnight - (days - 1) * 86400000;
  const buckets = Array.from({ length: Math.ceil(days / width) }, (_, index) => {
    const start = new Date(first + index * width * 86400000);
    return {
      start: start.toISOString().slice(0, 10),
      label: start.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' }),
      configure: 0, checkout: 0, orders: 0
    };
  });
  function add(day, key, value) {
    const offset = Math.floor((Date.parse(`${day}T00:00:00Z`) - first) / 86400000);
    if (Number.isFinite(offset) && offset >= 0 && offset < days) {
      buckets[Math.floor(offset / width)][key] += Number(value || 0);
    }
  }
  for (const row of activity?.events || []) {
    if (row.event === 'configure_started') add(row.day, 'configure', row.count);
    if (row.event === 'checkout_started') add(row.day, 'checkout', row.count);
  }
  for (const row of activity?.orders || []) add(row.day, 'orders', row.count);
  return buckets;
}

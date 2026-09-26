// Follow the original grip mask, so the print bends with the rim instead of
// being projected across the whole image as a flat square.
export function carbonCoordinates(alpha, size) {
  const bands = [0, 1].map(half => {
    const centers = new Float32Array(size), radii = new Float32Array(size), distance = new Float32Array(size);
    centers.fill(NaN);
    for (let x = 0; x < size; x++) {
      let first = size, last = -1;
      for (let y = half * Math.floor(size / 2); y < (half + 1) * Math.floor(size / 2); y++) {
        if (alpha[(y * size + x) * 4 + 3] > 20) { first = Math.min(first, y); last = y; }
      }
      if (last >= first) { centers[x] = (first + last) / 2; radii[x] = Math.max(1, (last - first) / 2); }
    }
    let previous = -1;
    for (let x = 0; x < size; x++) {
      if (!Number.isFinite(centers[x])) continue;
      if (previous >= 0) distance[x] = distance[previous] + Math.hypot(x - previous, centers[x] - centers[previous]);
      previous = x;
    }
    return { centers, radii, distance };
  });
  return (x, y) => {
    const band = bands[y < size / 2 ? 0 : 1];
    if (!Number.isFinite(band.centers[x])) return [x, y];
    const across = Math.max(-1, Math.min(1, (y - band.centers[x]) / (band.radii[x] || 1)));
    return [band.distance[x], Math.asin(across) * band.radii[x]];
  };
}

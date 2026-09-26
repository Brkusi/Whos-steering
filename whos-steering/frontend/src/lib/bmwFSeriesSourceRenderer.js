// Material pixel renderer extracted from the supplied F-Series configurator.
// R = stitch mask; G = diffuse lighting; B = specular lighting; A = coverage.
// Source and asset hashes are recorded in docs/bmw-fseries-2d.md.
const o0 = e => e <= .04045 ? e / 12.92 : Math.pow((e + .055) / 1.055, 2.4),
  f2 = e => e <= .0031308 ? 12.92 * e : 1.055 * Math.pow(e, 1 / 2.4) - .055;
function y1(e) {
  const a = parseInt(e.slice(1), 16);
  return [a >> 16 & 255, a >> 8 & 255, a & 255];
}
const F0 = .58,
  b2 = e => e <= F0 ? e : 1 - (1 - F0) * Math.exp(-(e - F0) / (1 - F0)),
  t1 = .65;
function m2(e) {
  const a = .2126 * e[0] + .7152 * e[1] + .0722 * e[2],
    s = [a + (e[0] - a) * t1, a + (e[1] - a) * t1, a + (e[2] - a) * t1],
    o = Math.min(1, Math.max(0, .2126 * s[0] + .7152 * s[1] + .0722 * s[2])),
    r = .12 + o * .4,
    i = .098,
    f = Math.max(0, 1 - o / .12),
    x = r - i * f * f,
    n = o > 1e-4 ? x / o : 1;
  return [s[0] * n, s[1] * n, s[2] * n];
}
const S0 = 4,
  Q = 16384,
  U0 = new Uint8Array(Q + 1);
for (let e = 0; e <= Q; e++) U0[e] = Math.round(f2(b2(e / Q * S0)) * 255);
const s1 = Q / S0;
function k1(e, a = 1) {
  const s = new Float32Array(256);
  for (let o = 0; o < 256; o++) {
    const r = Math.pow(o / 255, 2.2) * e;
    s[o] = a === 1 ? r : Math.pow(r, a);
  }
  return s;
}
function u2(e) {
  return 1 - .5 * (.2126 * e[0] + .7152 * e[1] + .0722 * e[2]);
}
function x2(e, a, s, o, r) {
  var p0, M0, y0;
  const i = e.data,
    l = a.data,
    f = i.length >> 2,
    [x, n, d] = y1(o);
  let m = m2([o0(x / 255), o0(n / 255), o0(d / 255)]);
  const g = k1(s.dMax, u2(m)),
    H = k1(s.sMax),
    [b, u, h] = y1(r);
  let R = [o0(b / 255), o0(u / 255), o0(h / 255)];
  const _ = Math.max(1e-4, s.sRef),
    G = (p0 = s.gloss) != null ? p0 : 1,
    p = .18,
    z = .52,
    X = .7,
    P0 = .2126 * m[0] + .7152 * m[1] + .0722 * m[2],
    D0 = p + (1 - p) * Math.pow(Math.min(1, P0 / z), X),
    h0 = ((M0 = s.dHi) != null ? M0 : s.dMax) * Math.max(m[0], m[1], m[2]) + ((y0 = s.sHi) != null ? y0 : 0),
    K = h0 > 1.05 ? 1.05 / h0 : 1;
  K !== 1 && (m = m.map(P => P * K), R = R.map(P => P * K));
  const H0 = K;
  for (let P = 0, T = 0; P < f; P++, T += 4) {
    const k0 = i[T + 3];
    if (l[T + 3] = k0, k0 < 6) {
      l[T] = 0, l[T + 1] = 0, l[T + 2] = 0;
      continue;
    }
    const Y = i[T] / 255,
      s0 = g[i[T + 1]],
      R0 = H[i[T + 2]] * H0,
      S = R0 * G * D0;
    let D = s0 * m[0] + S,
      _0 = s0 * m[1] + S,
      v0 = s0 * m[2] + S;
    if (Y > .004) {
      const a1 = .72 + .28 * Math.min(1, R0 / (_ * H0));
      D += (R[0] * a1 - D) * Y, _0 += (R[1] * a1 - _0) * Y, v0 += (R[2] * a1 - v0) * Y;
    }
    l[T] = U0[D <= 0 ? 0 : D >= S0 ? Q : D * s1 | 0], l[T + 1] = U0[_0 <= 0 ? 0 : _0 >= S0 ? Q : _0 * s1 | 0], l[T + 2] = U0[v0 <= 0 ? 0 : v0 >= S0 ? Q : v0 * s1 | 0];
  }
  return a;
}
class g2 {
  constructor(a = 24) {
    this.limit = a, this.cache = new Map(), this.sources = new Map();
  }
  async source(a, s, o) {
    const r = `${a}@${o}`;
    if (this.sources.has(r)) return this.sources.get(r);
    const i = (async () => {
      const l = new Image();
      l.decoding = "async", l.src = s, await l.decode();
      const f = Math.max(1, Math.min(o, l.naturalWidth || o)),
        x = document.createElement("canvas");
      x.width = f, x.height = f;
      const n = x.getContext("2d", {
        willReadFrequently: !0
      });
      return n.drawImage(l, 0, 0, f, f), n.getImageData(0, 0, f, f);
    })();
    return this.sources.set(r, i), i;
  }
  async render(a, s, o, r, i, l) {
    const f = `${a}@${o}|${i}|${l}`,
      x = this.cache.get(f);
    if (x) return this.cache.delete(f), this.cache.set(f, x), x;
    const n = await this.source(a, s, o),
      d = new ImageData(n.width, n.height);
    return x2(n, d, r, i, l), this._toCanvas(f, d, n.width);
  }
  _toCanvas(a, s, o) {
    const r = document.createElement("canvas");
    return r.width = o, r.height = o, r.getContext("2d").putImageData(s, 0, 0), this.cache.set(a, r), this.cache.size > this.limit && this.cache.delete(this.cache.keys().next().value), r;
  }
  invalidate() {
    this.cache.clear(), this.sources.clear();
  }
}
export { x2 as renderMaterialPixels, g2 as SourceMaterialRenderer };

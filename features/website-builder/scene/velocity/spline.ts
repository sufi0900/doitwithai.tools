export type Curve1D = (x: number) => number;

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (edge0: number, edge1: number, x: number) => { const t = clamp((x - edge0) / (edge1 - edge0), 0, 1); return t * t * (3 - 2 * t); };

/** Smooth maximum: like Math.max but rounds the corner over a width of `k`. */
export function smax(a: number, b: number, k: number): number {
  const h = clamp(0.5 + (0.5 * (a - b)) / k, 0, 1);
  return lerp(b, a, h) + k * h * (1 - h);
}

/**
 * Monotone cubic (PCHIP) interpolation. Passes through every control point and never overshoots,
 * which keeps sculpted body profiles free of wobble. Points must be sorted by ascending x.
 */
export function pchip(points: ReadonlyArray<readonly [number, number]>): Curve1D {
  const n = points.length;
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  const h: number[] = [];
  const d: number[] = [];
  for (let i = 0; i < n - 1; i += 1) { h[i] = xs[i + 1] - xs[i]; d[i] = (ys[i + 1] - ys[i]) / h[i]; }
  const endpoint = (h0: number, h1: number, d0: number, d1: number) => {
    let m = ((2 * h0 + h1) * d0 - h0 * d1) / (h0 + h1);
    if (Math.sign(m) !== Math.sign(d0)) m = 0;
    else if (Math.sign(d0) !== Math.sign(d1) && Math.abs(m) > 3 * Math.abs(d0)) m = 3 * d0;
    return m;
  };
  const m: number[] = new Array(n).fill(0);
  if (n === 2) { m[0] = d[0]; m[1] = d[0]; }
  else {
    m[0] = endpoint(h[0], h[1], d[0], d[1]);
    m[n - 1] = endpoint(h[n - 2], h[n - 3], d[n - 2], d[n - 3]);
    for (let i = 1; i < n - 1; i += 1) {
      if (d[i - 1] * d[i] <= 0) m[i] = 0;
      else { const w1 = 2 * h[i] + h[i - 1]; const w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]); }
    }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (i < n - 2 && x > xs[i + 1]) i += 1;
    const t = (x - xs[i]) / h[i];
    const t2 = t * t; const t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h[i] * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h[i] * m[i + 1];
  };
}

import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { clamp, lerp, pchip, smax, smoothstep } from "./spline";

/**
 * Procedural GT coupe. Original design, built entirely in code: no downloaded assets, no third-party
 * marks, no licence obligations. Units are metres. +X is the nose, +Y is up, +Z is the passenger side.
 *
 * The bodywork is a "loft": a stack of smooth cross-sections along the length. Wheel arches are real
 * openings because the underside of the loft rises over each wheel. Every trim detail (lamps, door
 * cuts, pillars, grille) is a ribbon/patch that hugs the surface via `Loft.at` / `Loft.normalAt`.
 */
export const CAR = {
  halfLength: 2.3,
  wheelRadius: 0.345,
  archRadius: 0.395,
  frontAxleX: 1.38,
  rearAxleX: -1.3,
  frontTrack: 0.8,
  rearTrack: 0.81,
  frontTireWidth: 0.245,
  rearTireWidth: 0.295,
  roofHeight: 1.165,
} as const;

const HALF = CAR.halfLength;
export const RING_SAMPLES_PER_SEGMENT = 4;
const RING_SEGMENTS = 8;
export const HALF_RING = RING_SEGMENTS * RING_SAMPLES_PER_SEGMENT + 1; // 33 samples, bottom centre → top centre
export const RING_SIZE = (HALF_RING - 1) * 2 + 1; // 65, closed (first === last)
/** Ring index (0..64) of well-known lines on the right-hand flank; divide by 64 for `s`. */
export const RING = { underbody: 4, sill: 8, lowerFlank: 12, shoulder: 16, upperFlank: 20, topEdge: 24, hoodMid: 28, topCentre: 32 } as const;
export const sOf = (index: number) => index / (RING_SIZE - 1);
export const sMirror = (s: number) => 1 - s;

// ───────────────────────── Body profile tables (x → value) ─────────────────────────
const halfWidth = pchip([[-2.3, 0.62], [-2.15, 0.83], [-1.8, 0.945], [-1.3, 0.985], [-0.8, 0.96], [-0.2, 0.93], [0.5, 0.925], [1.05, 0.95], [1.5, 0.958], [1.85, 0.9], [2.1, 0.76], [2.3, 0.42]]);
const topHeight = pchip([[-2.3, 0.66], [-2.18, 0.84], [-2.0, 0.925], [-1.6, 0.965], [-1.0, 0.94], [-0.5, 0.88], [0.1, 0.84], [0.6, 0.805], [1.1, 0.775], [1.5, 0.755], [1.9, 0.64], [2.15, 0.51], [2.3, 0.4]]);
const bottomHeight = pchip([[-2.3, 0.2], [-2.2, 0.17], [-2.0, 0.14], [-1.7, 0.12], [-0.5, 0.105], [0.5, 0.105], [1.7, 0.115], [2.05, 0.125], [2.2, 0.15], [2.3, 0.2]]);
/** Crown: how much the panel edge sits below the centreline. Negative = pronounced fender "buttresses". */
const crown = pchip([[-2.3, 0.03], [-1.8, -0.04], [-1.3, -0.07], [-0.5, 0.03], [0.5, 0.05], [1.1, -0.02], [1.5, -0.03], [1.9, 0.02], [2.3, 0.04]]);

const archCeiling = (x: number): number => {
  let best = -Infinity;
  for (const axle of [CAR.frontAxleX, CAR.rearAxleX]) {
    const dx = Math.abs(x - axle);
    if (dx < CAR.archRadius) best = Math.max(best, CAR.wheelRadius + Math.sqrt(CAR.archRadius ** 2 - dx ** 2));
  }
  return best;
};

export interface BodyParams { w: number; yb: number; yt: number; c: number }

export function bodyParams(x: number): BodyParams {
  const ax = Math.abs(x);
  // Nose and tail close as a quarter-ellipsoid: width and height follow the same curve, so the bumper stays round (no "duckbill").
  const t = clamp((ax - 1.98) / (HALF - 1.98), 0, 1);
  const f = Math.sqrt(Math.max(1 - t * t, 0));
  const tip = x > 0 ? 0.3 : 0.5;
  const blend = 1 - f;
  let yb = bottomHeight(x);
  const arch = archCeiling(x);
  if (arch > -Infinity) yb = smax(yb, arch, 0.035);
  let yt = topHeight(x);
  yb = lerp(yb, tip, blend);
  yt = lerp(yt, tip, blend);
  yt = Math.max(yt, yb + 0.012);
  return { w: Math.max(halfWidth(x) * f, 0.004), yb, yt, c: crown(x) * (1 - blend) };
}

/** Right-hand half cross-section, bottom centre → top centre, as [z, y] pairs. */
function halfSection({ w, yb, yt, c }: BodyParams): Array<[number, number]> {
  const H = Math.max(yt - yb, 0.012);
  const shoulder = yb + 0.6 * H;
  const edge = Math.max(yt - c * 0.55, shoulder + 0.22 * H);
  const control: Array<[number, number]> = [
    [0, yb], [w * 0.7, yb], [w * 0.93, yb + 0.05 * H], [w * 0.995, yb + 0.2 * H], [w, shoulder],
    [w * 0.965, shoulder + 0.2 * H], [w * 0.86, edge], [w * 0.55, yt - c * 0.25], [0, yt],
  ];
  return sampleCatmullRom(control, RING_SAMPLES_PER_SEGMENT);
}

/** Uniform Catmull-Rom through control points; control point k lands exactly on sample k·perSegment. */
export function sampleCatmullRom(control: ReadonlyArray<readonly [number, number]>, perSegment: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const n = control.length;
  const at = (i: number) => control[clamp(i, 0, n - 1)];
  for (let seg = 0; seg < n - 1; seg += 1) {
    const p0 = at(seg - 1), p1 = at(seg), p2 = at(seg + 1), p3 = at(seg + 2);
    for (let k = 0; k < perSegment; k += 1) {
      const t = k / perSegment; const t2 = t * t; const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push([control[n - 1][0], control[n - 1][1]]);
  return out;
}

/** Full closed ring (index 0 → 64) from a right-hand half section. */
function fullRing(half: Array<[number, number]>): Array<[number, number]> {
  const ring: Array<[number, number]> = half.map(([z, y]) => [z, y]);
  for (let i = HALF_RING - 2; i >= 0; i -= 1) ring.push([-half[i][0], half[i][1]]);
  return ring;
}

// ───────────────────────── Loft ─────────────────────────
export interface Loft {
  geometry: THREE.BufferGeometry;
  xs: number[];
  positions: Float32Array;
  /** Surface point. `s` runs 0..1 around the ring (0 = underside centre, 0.5 = top centre; +Z side first). */
  at(x: number, s: number, out?: THREE.Vector3): THREE.Vector3;
  normalAt(x: number, s: number, out?: THREE.Vector3): THREE.Vector3;
}

function makeLoft(xs: number[], ringAt: (x: number) => Array<[number, number]>, uvScale: number, groupOf?: (x: number, m: number) => number): Loft {
  const N = xs.length;
  const M = RING_SIZE;
  const positions = new Float32Array(N * M * 3);
  const uvs = new Float32Array(N * M * 2);
  for (let i = 0; i < N; i += 1) {
    const ring = ringAt(xs[i]);
    for (let m = 0; m < M; m += 1) {
      const o = (i * M + m) * 3;
      positions[o] = xs[i]; positions[o + 1] = ring[m][1]; positions[o + 2] = ring[m][0];
      uvs[(i * M + m) * 2] = (m / (M - 1)) * uvScale;
      uvs[(i * M + m) * 2 + 1] = xs[i] * 0.6;
    }
  }
  const buckets: number[][] = [[], []];
  for (let i = 0; i < N - 1; i += 1) {
    for (let m = 0; m < M - 1; m += 1) {
      const a = i * M + m, b = (i + 1) * M + m, c = b + 1, d = a + 1;
      buckets[groupOf ? groupOf((xs[i] + xs[i + 1]) / 2, m) : 0].push(a, b, d, b, c, d);
    }
  }
  const indices = buckets.flat();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  let offset = 0;
  buckets.forEach((bucket, materialIndex) => { if (bucket.length) { geometry.addGroup(offset, bucket.length, materialIndex); offset += bucket.length; } });
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  const findStation = (x: number): [number, number] => {
    if (x <= xs[0]) return [0, 0];
    if (x >= xs[N - 1]) return [N - 2, 1];
    let lo = 0, hi = N - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (xs[mid] <= x) lo = mid; else hi = mid; }
    return [lo, (x - xs[lo]) / (xs[lo + 1] - xs[lo])];
  };
  const at: Loft["at"] = (x, s, out = new THREE.Vector3()) => {
    const [i, f] = findStation(x);
    const mf = clamp(s, 0, 1) * (M - 1);
    const m = Math.min(Math.floor(mf), M - 2);
    const g = mf - m;
    const p = (ii: number, mm: number, axis: number) => positions[(ii * M + mm) * 3 + axis];
    const v = (axis: number) => lerp(lerp(p(i, m, axis), p(i, m + 1, axis), g), lerp(p(i + 1, m, axis), p(i + 1, m + 1, axis), g), f);
    return out.set(lerp(xs[i], xs[i + 1], f), v(1), v(2));
  };
  const normalAt: Loft["normalAt"] = (x, s, out = new THREE.Vector3()) => {
    const dx = 0.012, ds = 0.5 / (M - 1);
    const a = at(x + dx, s), b = at(x - dx, s), c = at(x, Math.min(1, s + ds)), d = at(x, Math.max(0, s - ds));
    return out.copy(a.sub(b)).cross(c.sub(d)).normalize();
  };
  return { geometry, xs, positions, at, normalAt };
}

const cosineStations = (from: number, to: number, count: number) =>
  Array.from({ length: count }, (_, i) => lerp(from, to, (1 - Math.cos((Math.PI * i) / (count - 1))) / 2));

export function buildBody(stations = 190): Loft {
  return makeLoft(cosineStations(-HALF, HALF, stations), (x) => fullRing(halfSection(bodyParams(x))), 4);
}

// ───────────────────────── Greenhouse (glass canopy) ─────────────────────────
const roofHeight = pchip([[-1.7, 0.93], [-1.35, 0.995], [-1.0, 1.085], [-0.6, 1.15], [-0.2, CAR.roofHeight], [0.2, 1.145], [0.55, 1.05], [0.85, 0.915], [1.02, 0.815]]);
const CABIN_FRONT = 1.02, CABIN_REAR = -1.7;

export function cabinParams(x: number) {
  const body = bodyParams(x);
  const baseY = body.yt - 0.045;
  const roofY = Math.max(roofHeight(x), baseY + 0.01);
  const edgeFade = smoothstep(0, 0.09, Math.min(x - CABIN_REAR, CABIN_FRONT - x));
  const baseHalf = Math.min(body.w * 0.865, 0.82) * (0.35 + 0.65 * edgeFade);
  return { baseY, roofY, baseHalf };
}

export function buildCabin(stations = 110): Loft {
  const xs = cosineStations(CABIN_REAR, CABIN_FRONT, stations);
  return makeLoft(xs, (x) => {
    const { baseY, roofY, baseHalf: wb } = cabinParams(x);
    const H = Math.max(roofY - baseY, 0.01);
    const control: Array<[number, number]> = [
      [0, baseY], [wb, baseY], [wb * 0.985, baseY + 0.28 * H], [wb * 0.9, baseY + 0.66 * H],
      [wb * 0.72, roofY - 0.05 * H], [wb * 0.4, roofY - 0.01 * H], [wb * 0.16, roofY - 0.002 * H], [wb * 0.05, roofY], [0, roofY],
    ];
    return fullRing(sampleCatmullRom(control, RING_SAMPLES_PER_SEGMENT));
  }, 3, (x, m) => (x > ROOF_PANEL.rear && x < ROOF_PANEL.front && m >= ROOF_PANEL.ringFrom && m <= RING_SIZE - 1 - ROOF_PANEL.ringFrom ? 1 : 0));
}
/** Solid roof panel (material group 1); everything else on the canopy is glass (group 0). */
const ROOF_PANEL = { rear: -0.98, front: 0.13, ringFrom: 14 } as const;
export const CABIN = { front: CABIN_FRONT, rear: CABIN_REAR } as const;

// ───────────────────────── Trim: ribbons & patches that hug a surface ─────────────────────────
export type SurfacePoint = [x: number, s: number];

export function ribbon(loft: Loft, path: SurfacePoint[], width: number, lift = 0.003): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = path.map(([x, s]) => loft.at(x, s));
  const normals = path.map(([x, s]) => loft.normalAt(x, s));
  const pos: number[] = [], nor: number[] = [], idx: number[] = [], uv: number[] = [];
  path.forEach((_, j) => {
    const prev = pts[Math.max(0, j - 1)], next = pts[Math.min(path.length - 1, j + 1)];
    const tangent = next.clone().sub(prev).normalize();
    const side = new THREE.Vector3().crossVectors(normals[j], tangent).normalize().multiplyScalar(width / 2);
    const base = pts[j].clone().addScaledVector(normals[j], lift);
    const l = base.clone().sub(side), r = base.clone().add(side);
    pos.push(l.x, l.y, l.z, r.x, r.y, r.z);
    nor.push(normals[j].x, normals[j].y, normals[j].z, normals[j].x, normals[j].y, normals[j].z);
    uv.push(0, j / (path.length - 1), 1, j / (path.length - 1));
    if (j < path.length - 1) { const a = j * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(idx);
  return geometry;
}

export function patch(loft: Loft, x0: number, x1: number, s0: number, s1: number, nx = 14, ns = 14, lift = 0.004): THREE.BufferGeometry {
  const pos: number[] = [], nor: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= nx; i += 1) {
    for (let j = 0; j <= ns; j += 1) {
      const x = lerp(x0, x1, i / nx), s = lerp(s0, s1, j / ns);
      const p = loft.at(x, s), n = loft.normalAt(x, s);
      p.addScaledVector(n, lift);
      pos.push(p.x, p.y, p.z); nor.push(n.x, n.y, n.z); uv.push(j / ns, i / nx);
    }
  }
  for (let i = 0; i < nx; i += 1) for (let j = 0; j < ns; j += 1) { const a = i * (ns + 1) + j, b = a + ns + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(idx);
  return geometry;
}

/** Straight-in-parameter-space polyline with `count` points. */
export const line = (x0: number, s0: number, x1: number, s1: number, count = 24): SurfacePoint[] =>
  Array.from({ length: count }, (_, i) => [lerp(x0, x1, i / (count - 1)), lerp(s0, s1, i / (count - 1))] as SurfacePoint);

/** Mirror a set of geometries built for the +Z side onto the −Z side and merge them. */
export function mirrorZ(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  const mirrored = geometry.clone();
  mirrored.scale(1, 1, -1);
  const index = mirrored.getIndex();
  if (index) { const arr = index.array as ArrayLike<number> as number[]; for (let i = 0; i < arr.length; i += 3) { const t = arr[i + 1]; (index.array as Uint16Array)[i + 1] = arr[i + 2]; (index.array as Uint16Array)[i + 2] = t; } }
  const normal = mirrored.getAttribute("normal");
  if (normal) for (let i = 0; i < normal.count; i += 1) normal.setZ(i, -normal.getZ(i));
  return mirrored;
}

/** Merge geometries that may mix indexed and non-indexed sources. Throws (never silently returns nothing). */
export const mergeAll = (geometries: THREE.BufferGeometry[]) => {
  const prepared = geometries.map((geometry) => (geometry.index ? geometry.toNonIndexed() : geometry));
  const merged = mergeGeometries(prepared, false);
  if (!merged) throw new Error("Car geometry merge failed: incompatible attributes");
  return merged;
};

// ───────────────────────── Wheels ─────────────────────────
export interface WheelParts {
  tire: THREE.BufferGeometry;
  barrel: THREE.BufferGeometry;
  spokes: THREE.BufferGeometry;
  hub: THREE.BufferGeometry;
  disc: THREE.BufferGeometry;
  caliper: THREE.BufferGeometry;
  lugs: THREE.BufferGeometry;
}

/** All wheel geometry is built with the axle along +Z and the outboard face towards +Z. */
export function buildWheel(width: number, spokeCount = 10): WheelParts {
  const R = CAR.wheelRadius;
  const half = width / 2;
  const tireProfile = new THREE.SplineCurve([
    new THREE.Vector2(0.238, -half * 0.7), new THREE.Vector2(0.262, -half * 0.97), new THREE.Vector2(0.302, -half * 1.0), new THREE.Vector2(0.333, -half * 0.87),
    new THREE.Vector2(R - 0.004, -half * 0.55), new THREE.Vector2(R, -half * 0.2), new THREE.Vector2(R, half * 0.2), new THREE.Vector2(R - 0.004, half * 0.55),
    new THREE.Vector2(0.333, half * 0.87), new THREE.Vector2(0.302, half * 1.0), new THREE.Vector2(0.262, half * 0.97), new THREE.Vector2(0.238, half * 0.7),
  ]).getPoints(48);
  const tire = new THREE.LatheGeometry(tireProfile, 72).rotateX(Math.PI / 2);

  const barrelProfile = [
    new THREE.Vector2(0.226, -half * 0.75), new THREE.Vector2(0.226, half * 0.55), new THREE.Vector2(0.242, half * 0.72), new THREE.Vector2(0.252, half * 0.84), new THREE.Vector2(0.24, half * 0.9),
  ];
  const barrel = new THREE.LatheGeometry(barrelProfile, 64).rotateX(Math.PI / 2);

  const spokes: THREE.BufferGeometry[] = [];
  for (let i = 0; i < spokeCount; i += 1) {
    const shape = new THREE.Shape();
    shape.moveTo(0.05, -0.014); shape.lineTo(0.236, -0.03); shape.quadraticCurveTo(0.246, 0, 0.236, 0.03); shape.lineTo(0.05, 0.014); shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: true, bevelSize: 0.005, bevelThickness: 0.006, bevelSegments: 2, curveSegments: 6 });
    geometry.translate(0, 0, half * 0.5);
    geometry.rotateZ((i / spokeCount) * Math.PI * 2);
    spokes.push(geometry);
  }
  const face = new THREE.CylinderGeometry(0.075, 0.09, 0.03, 40).rotateX(Math.PI / 2).translate(0, 0, half * 0.5 + 0.012);
  const hubCap = new THREE.CylinderGeometry(0.034, 0.034, 0.02, 32).rotateX(Math.PI / 2).translate(0, 0, half * 0.5 + 0.034);
  const lugList: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2;
    lugList.push(new THREE.CylinderGeometry(0.008, 0.008, 0.014, 10).rotateX(Math.PI / 2).translate(Math.cos(a) * 0.052, Math.sin(a) * 0.052, half * 0.5 + 0.03));
  }
  const disc = new THREE.CylinderGeometry(0.205, 0.205, 0.028, 56).rotateX(Math.PI / 2).translate(0, 0, half * 0.16);
  const caliperShape = new THREE.Shape();
  caliperShape.absarc(0, 0, 0.212, 0.35, 1.25, false); caliperShape.absarc(0, 0, 0.13, 1.25, 0.35, true); caliperShape.closePath();
  const caliper = new THREE.ExtrudeGeometry(caliperShape, { depth: 0.07, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2 }).translate(0, 0, half * 0.16 - 0.035);
  return { tire, barrel, spokes: mergeAll(spokes), hub: mergeAll([face, hubCap]), disc, caliper, lugs: mergeAll(lugList) };
}

// ───────────────────────── Aero & small parts ─────────────────────────
export function buildWing(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0); shape.bezierCurveTo(0.03, 0.05, 0.16, 0.048, 0.3, 0.012); shape.lineTo(0.3, 0.004); shape.bezierCurveTo(0.16, 0.014, 0.04, 0.002, 0, 0);
  const foil = new THREE.ExtrudeGeometry(shape, { depth: 1.5, bevelEnabled: false, curveSegments: 12 }).translate(-0.15, 0, -0.75);
  const plate = (z: number) => new THREE.BoxGeometry(0.34, 0.075, 0.012).translate(0, 0.02, z);
  const pylon = (z: number) => new THREE.BoxGeometry(0.05, 0.16, 0.022).translate(0.02, -0.08, z);
  return mergeAll([foil, plate(-0.75), plate(0.75), pylon(-0.38), pylon(0.38)]);
}

export function buildSplitter(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.7); shape.lineTo(0.16, -0.62); shape.quadraticCurveTo(0.34, -0.3, 0.36, 0); shape.quadraticCurveTo(0.34, 0.3, 0.16, 0.62); shape.lineTo(0, 0.7); shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: 0.018, bevelEnabled: true, bevelSize: 0.005, bevelThickness: 0.004, bevelSegments: 1 }).rotateX(Math.PI / 2).translate(1.97, 0.115, 0);
}

export function buildDiffuser(): THREE.BufferGeometry {
  const fins: THREE.BufferGeometry[] = [new THREE.BoxGeometry(0.42, 0.012, 1.3).translate(-2.06, 0.18, 0)];
  for (let i = -3; i <= 3; i += 1) fins.push(new THREE.BoxGeometry(0.4, 0.09, 0.012).translate(-2.06, 0.225, i * 0.19));
  return mergeAll(fins);
}

export function buildMirror(): THREE.BufferGeometry {
  const shell = new THREE.SphereGeometry(0.075, 24, 16).scale(1.3, 0.62, 1).translate(0.02, 0.0, 0.1);
  const stalk = new THREE.BoxGeometry(0.06, 0.03, 0.09).translate(0, -0.02, 0.02);
  return mergeAll([shell, stalk]);
}

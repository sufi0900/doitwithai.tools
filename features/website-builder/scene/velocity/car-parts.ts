import * as THREE from "three";
import { CAR, CABIN, RING, buildBody, buildCabin, buildDiffuser, buildMirror, buildSplitter, buildWheel, buildWing, line, mergeAll, mirrorZ, patch, ribbon, sMirror, sOf, type Loft, type SurfacePoint, type WheelParts } from "./car-geometry";

/** Every geometry the car needs, built once. Trim is grouped by material so the whole car is ~25 draw calls. */
export interface CarPack {
  body: Loft;
  cabin: Loft;
  bodyGeometry: THREE.BufferGeometry;
  cabinGeometry: THREE.BufferGeometry;
  innerShell: THREE.BufferGeometry;
  trim: { gloss: THREE.BufferGeometry; gaps: THREE.BufferGeometry; paint: THREE.BufferGeometry; grille: THREE.BufferGeometry; lampWhite: THREE.BufferGeometry; lampRed: THREE.BufferGeometry; lampHousing: THREE.BufferGeometry };
  wheels: { front: WheelParts; rear: WheelParts };
  wing: THREE.BufferGeometry;
  splitter: THREE.BufferGeometry;
  diffuser: THREE.BufferGeometry;
  mirror: THREE.BufferGeometry;
  anchors: { headlight: THREE.Vector3; taillight: THREE.Vector3 };
  dispose: () => void;
}

const both = (geometry: THREE.BufferGeometry) => [geometry, mirrorZ(geometry)];

export function buildCarPack(): CarPack {
  const body = buildBody();
  const cabin = buildCabin();
  const R = (i: number) => sOf(i);

  // ── Body-surface trim (built on the +Z side, then mirrored) ──
  const gaps: THREE.BufferGeometry[] = [];
  const gloss: THREE.BufferGeometry[] = [];
  const paint: THREE.BufferGeometry[] = [];
  const lampWhite: THREE.BufferGeometry[] = [];
  const lampRed: THREE.BufferGeometry[] = [];
  const housing: THREE.BufferGeometry[] = [];
  const grille: THREE.BufferGeometry[] = [];

  // Door shut lines: leading edge, trailing edge, sill line.
  const doorFront: SurfacePoint[] = line(0.74, R(11), 0.66, R(22), 20);
  const doorRear: SurfacePoint[] = line(-0.4, R(11), -0.36, R(22), 20);
  const doorSill: SurfacePoint[] = line(0.74, R(11), -0.4, R(11), 30);
  gaps.push(...both(ribbon(body, doorFront, 0.007, 0.0015)), ...both(ribbon(body, doorRear, 0.007, 0.0015)), ...both(ribbon(body, doorSill, 0.007, 0.0015)));
  // Rear-quarter intake behind the door and a matching front-fender vent.
  grille.push(...both(patch(body, -0.8, -0.52, R(14), R(18.6), 14, 10, 0.003)));
  gloss.push(...both(ribbon(body, line(-0.84, R(13.6), -0.84, R(19), 12), 0.012, 0.0035)), ...both(ribbon(body, line(-0.48, R(13.6), -0.48, R(19), 12), 0.012, 0.0035)));
  for (let i = 0; i < 4; i += 1) gloss.push(...both(ribbon(body, line(1.02 + i * 0.05, R(19.5), 1.0 + i * 0.05, R(22), 8), 0.012, 0.0035)));
  // Rocker / sill trim.
  gloss.push(...both(ribbon(body, line(0.86, R(9.5), -0.86, R(9.5), 40), 0.05, 0.0025)));
  // Front lower intakes (air curtains) and grille.
  grille.push(...both(patch(body, 1.96, 2.27, R(0.5), R(9.5), 16, 14, 0.003)));
  grille.push(patch(body, 1.96, 2.27, sMirror(R(0.5)), 1, 16, 4, 0.003), patch(body, 1.96, 2.27, 0, R(0.5), 16, 4, 0.003));
  // Headlamps: dark housing + LED signature (upper blade and lower DRL).
  housing.push(...both(patch(body, 1.66, 2.14, R(20.2), R(25.2), 26, 10, 0.0035)));
  lampWhite.push(...both(ribbon(body, line(1.66, R(20.4), 2.13, R(19.6), 26), 0.022, 0.0075)));
  lampWhite.push(...both(ribbon(body, line(1.7, R(24), 2.1, R(22.6), 26), 0.014, 0.0075)));
  // Full-width tail LED bar plus corner blades.
  lampRed.push(ribbon(body, line(-2.185, R(25), -2.185, sMirror(R(25)), 40), 0.04, 0.006));
  lampRed.push(...both(ribbon(body, line(-2.02, R(24), -2.17, R(19), 16), 0.03, 0.006)));
  housing.push(ribbon(body, line(-2.185, R(25), -2.185, sMirror(R(25)), 40), 0.085, 0.003));
  // Belt-line highlight along the shoulder.
  paint.push(...both(ribbon(body, line(1.1, R(16.2), -1.2, R(16.2), 60), 0.004, 0.0012)));

  // ── Greenhouse trim (painted pillars/rails, gloss frames) ──
  const railS = R(14);
  gloss.push(...both(ribbon(cabin, line(-1.45, railS, 0.55, railS, 40), 0.045, 0.004)));
  gloss.push(...both(ribbon(cabin, line(0.98, R(5), 0.28, R(13.5), 24), 0.05, 0.004)));
  gloss.push(...both(ribbon(cabin, line(-1.65, R(5), -1.2, R(13.5), 20), 0.06, 0.004)));
  gloss.push(ribbon(cabin, line(0.16, R(14), 0.16, sMirror(R(14)), 30), 0.05, 0.004));
  gloss.push(...both(ribbon(cabin, line(-0.34, R(5.5), -0.34, R(13), 14), 0.05, 0.004)));
  gloss.push(...both(ribbon(cabin, line(0.98, R(4.4), -1.66, R(4.4), 60), 0.028, 0.004)));

  const bodyGeometry = body.geometry;
  const cabinGeometry = cabin.geometry;
  const innerShell = bodyGeometry.clone();
  innerShell.translate(0, -0.55, 0); innerShell.scale(0.985, 0.93, 0.93); innerShell.translate(0, 0.55, 0);

  const anchors = { headlight: body.at(2.08, R(20)), taillight: body.at(-2.19, R(32)) };
  const wheels = { front: buildWheel(CAR.frontTireWidth), rear: buildWheel(CAR.rearTireWidth) };
  const pack: CarPack = {
    body, cabin, bodyGeometry, cabinGeometry, innerShell,
    trim: { gloss: mergeAll(gloss), gaps: mergeAll(gaps), paint: mergeAll(paint), grille: mergeAll(grille), lampWhite: mergeAll(lampWhite), lampRed: mergeAll(lampRed), lampHousing: mergeAll(housing) },
    wheels, wing: buildWing(), splitter: buildSplitter(), diffuser: buildDiffuser(), mirror: buildMirror(), anchors,
    dispose: () => {
      const all: THREE.BufferGeometry[] = [bodyGeometry, cabinGeometry, innerShell, ...Object.values(pack.trim)];
      for (const wheel of [wheels.front, wheels.rear]) all.push(...Object.values(wheel));
      all.push(pack.wing, pack.splitter, pack.diffuser, pack.mirror);
      for (const geometry of all) geometry.dispose();
    },
  };
  return pack;
}

export { CABIN, RING };

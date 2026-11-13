"use client";

import { MeshReflectorMaterial, Sparkles } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { buildCarPack } from "./car-parts";
import { Car, type CarMotion } from "./car-model";
import { clamp, lerp, smoothstep } from "./spline";
import { buildStudioEnvironment } from "./studio-environment";
import { makeGlowTexture } from "./textures";

export interface StageProps {
  paint: string;
  active: boolean;
  intensity: number;
  lite: boolean;
  /** Copy sits under the canvas (narrow layouts): keep the car centred instead of composing it into the right third. */
  stacked: boolean;
  progress: React.MutableRefObject<number>;
}

const EMBER = new THREE.Color("#ff6a3d");
const ICE = new THREE.Color("#8fd3ff");
const WARM = new THREE.Color("#ffe2b8");
const seeded = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

/** Light streaks rushing past the car. Their speed is tied to the wheel speed, so the car really reads as cruising. */
function Streaks({ motion, count }: { motion: React.MutableRefObject<CarMotion>; count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const items = useMemo(() => {
    const rand = seeded(42);
    return Array.from({ length: count }, () => {
      return { x: -26 + rand() * 52, z: 1.7 + rand() * 6.5, y: 0.02 + rand() * rand() * 2.8, len: 1.4 + rand() * 4.2, k: 0.75 + rand() * 1.5, color: rand() > 0.62 ? ICE : rand() > 0.35 ? EMBER : WARM };
    });
  }, [count]);
  useEffect(() => { items.forEach((item, i) => mesh.current?.setColorAt(i, item.color)); if (mesh.current?.instanceColor) mesh.current.instanceColor.needsUpdate = true; }, [items]);
  useFrame((_, delta) => {
    if (!mesh.current) return;
    const dt = Math.min(delta, 0.05);
    items.forEach((item, i) => {
      item.x -= motion.current.speed * item.k * dt * 2.1;
      if (item.x < -26) item.x += 52;
      dummy.position.set(item.x, item.y, item.z);
      dummy.scale.set(item.len, 1, 1);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
    <boxGeometry args={[1, 0.014, 0.014]} />
    <meshBasicMaterial transparent opacity={0.95} toneMapped={false} />
  </instancedMesh>;
}

/** Overhead light bars sweeping over the car: their reflections stream across the floor. */
function Gantries({ motion }: { motion: React.MutableRefObject<CarMotion> }) {
  const group = useRef<THREE.Group>(null);
  const spacing = 6.5, count = 9;
  useFrame((_, delta) => {
    if (!group.current) return;
    const dt = Math.min(delta, 0.05);
    group.current.children.forEach((child, i) => {
      child.position.x -= motion.current.speed * dt * 1.6;
      if (child.position.x < -spacing * count * 0.5) child.position.x += spacing * count;
      const fade = 1 - smoothstep(10, 28, Math.abs(child.position.x));
      (child as THREE.Mesh).scale.y = 1;
      ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.15 + fade * 0.85 + (i % 2) * 0;
    });
  });
  return <group ref={group}>
    {Array.from({ length: count }, (_, i) => <mesh key={i} position={[(i - count / 2) * spacing, 5.4, 0]}>
      <boxGeometry args={[0.12, 0.07, 15]} />
      <meshBasicMaterial color={i % 3 === 0 ? "#ffb08a" : "#dfeaff"} transparent toneMapped={false} />
    </mesh>)}
  </group>;
}

/** Dashed lane lights embedded in the floor on both sides of the car. */
function LaneDashes({ motion }: { motion: React.MutableRefObject<CarMotion> }) {
  const group = useRef<THREE.Group>(null);
  const spacing = 4.4, count = 14;
  useFrame((_, delta) => {
    if (!group.current) return;
    const dt = Math.min(delta, 0.05);
    group.current.children.forEach((child) => { child.position.x -= motion.current.speed * dt * 2.1; if (child.position.x < -spacing * count * 0.5) child.position.x += spacing * count; });
  });
  return <group ref={group}>
    {Array.from({ length: count }, (_, i) => <group key={i} position={[(i - count / 2) * spacing, 0.006, 0]}>
      <mesh position={[0, 0, 3.7]}><boxGeometry args={[1.9, 0.008, 0.05]} /><meshBasicMaterial color="#ff7a4a" toneMapped={false} /></mesh>
      <mesh position={[0, 0, -3.7]}><boxGeometry args={[1.9, 0.008, 0.05]} /><meshBasicMaterial color="#8fd3ff" toneMapped={false} /></mesh>
    </group>)}
  </group>;
}

function Floor({ lite }: { lite: boolean }) {
  return <mesh rotation-x={-Math.PI / 2} receiveShadow>
    <planeGeometry args={[90, 60]} />
    {lite
      ? <meshStandardMaterial color="#0b0e13" roughness={0.32} metalness={0.7} />
      : <MeshReflectorMaterial blur={[70, 24]} resolution={640} mixBlur={0.6} mixStrength={190} mixContrast={1} roughness={0.35} depthScale={0.45} minDepthThreshold={0.7} maxDepthThreshold={1.7} color="#0e1218" metalness={0.75} mirror={0} />}
  </mesh>;
}

/** Faint cool/warm glow far behind the car so its silhouette separates from the dark. Sits fully above the floor: no hard edges. */
function BackdropGlow() {
  const map = useMemo(() => makeGlowTexture(), []);
  useEffect(() => () => map.dispose(), [map]);
  return <>
    <mesh position={[-25, 5.4, -3]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[26, 8]} /><meshBasicMaterial map={map} color="#ff7a48" transparent opacity={0.11} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} toneMapped={false} /></mesh>
    <mesh position={[-26, 5, 7]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[22, 7]} /><meshBasicMaterial map={map} color="#5db7ff" transparent opacity={0.09} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} toneMapped={false} /></mesh>
  </>;
}

/** Soft baked contact shadow under the car (cheaper and more predictable than a render-to-texture pass). */
function GroundShadow() {
  const map = useMemo(() => {
    const el = document.createElement("canvas"); el.width = el.height = 256;
    const ctx = el.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
    g.addColorStop(0, "rgba(0,0,0,.95)"); g.addColorStop(0.45, "rgba(0,0,0,.62)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
    const texture = new THREE.CanvasTexture(el); texture.colorSpace = THREE.SRGBColorSpace; return texture;
  }, []);
  useEffect(() => () => map.dispose(), [map]);
  return <mesh rotation-x={-Math.PI / 2} position={[0.05, 0.004, 0]} renderOrder={1}>
    <planeGeometry args={[6.6, 3.1]} />
    <meshBasicMaterial map={map} transparent depthWrite={false} toneMapped={false} polygonOffset polygonOffsetFactor={-2} />
  </mesh>;
}

/** Drives the intro, cruise, pointer parallax and scroll-linked camera. Everything is mutated in place; no React re-renders. */
function Director({ motion, progress, active, stacked }: { motion: React.MutableRefObject<CarMotion>; progress: React.MutableRefObject<number>; active: boolean; stacked: boolean }) {
  const size = useThree((state) => state.size);
  const start = useRef<number | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const scratch = useMemo(() => ({ center: new THREE.Vector3(0, 0.52, 0), pos: new THREE.Vector3(), forward: new THREE.Vector3(), right: new THREE.Vector3(), target: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) }), []);
  useFrame((state, delta) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const t = state.clock.elapsedTime;
    if (start.current === null) start.current = t;
    const introT = active ? clamp((t - start.current) / 3.8, 0, 1) : 1;
    const ease = 1 - Math.pow(1 - introT, 3);
    const scroll = active ? clamp(progress.current, 0, 1) : 0;
    const k = 1 - Math.exp(-4 * Math.min(delta, 0.05));
    pointer.current.x += ((active ? state.pointer.x : 0) - pointer.current.x) * k;
    pointer.current.y += ((active ? state.pointer.y : 0) - pointer.current.y) * k;

    const m = motion.current;
    m.intro = ease;
    m.lights = active ? smoothstep(0.12, 0.5, introT) * (introT < 0.45 && Math.sin(t * 41) < -0.25 ? 0.35 : 1) : 1;
    m.speed = active ? lerp(1.4, 4.6, ease) * (1 + scroll * 1.1) : 0;
    m.steer = active ? Math.sin(t * 0.45) * 0.05 + pointer.current.x * 0.1 : 0;
    m.pitch = active ? Math.sin(t * 0.6) * 0.002 - scroll * 0.004 : 0;

    const aspect = size.width / Math.max(1, size.height);
    const az = lerp(-1.52, -0.62, ease) + (active ? Math.sin(t * 0.17) * 0.05 : 0) + pointer.current.x * 0.2 + scroll * 0.55;
    const el = lerp(0.05, 0.19, ease) + pointer.current.y * 0.035 - scroll * 0.05;
    const dist = (lerp(5.6, 9.7, ease) * clamp(1.6 / aspect, 1, 1.9)) - scroll * 1.3;
    const fov = lerp(44, 30, ease);
    if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
    scratch.pos.set(dist * Math.cos(el) * Math.cos(az), scratch.center.y + dist * Math.sin(el), dist * Math.cos(el) * Math.sin(az));
    scratch.forward.copy(scratch.center).sub(scratch.pos).normalize();
    scratch.right.crossVectors(scratch.forward, scratch.up).normalize();
    // Compose the car into the right-hand third so the headline has clean negative space (fraction of the visible width).
    const visibleWidth = 2 * dist * Math.tan(THREE.MathUtils.degToRad(fov / 2)) * aspect;
    const shift = stacked ? 0 : clamp((aspect - 0.9) * 0.6, 0, 0.19) * visibleWidth * ease;
    scratch.target.copy(scratch.center).addScaledVector(scratch.right, -shift);
    scratch.pos.addScaledVector(scratch.right, -shift);
    camera.position.copy(scratch.pos);
    camera.lookAt(scratch.target);

    // Slowly sweep the studio reflections across the paint so the body always feels alive.
    m.env = active ? Math.sin(t * 0.21) * 0.55 + t * 0.03 : 0.4;
  });
  return null;
}

export function VelocityWorld({ paint, active, intensity, lite, stacked, progress }: StageProps) {
  const gl = useThree((state) => state.gl);
  const env = useMemo(() => buildStudioEnvironment(gl), [gl]);
  useEffect(() => () => env.dispose(), [env]);
  const pack = useMemo(() => buildCarPack(), []);
  useEffect(() => () => pack.dispose(), [pack]);
  const motion = useRef<CarMotion>({ speed: 0, steer: 0, intro: 0, lights: active ? 0 : 1, pitch: 0, env: 0.4 });
  const I = intensity;
  return <>
    <color attach="background" args={["#06080c"]} />
    <fog attach="fog" args={["#06080c", 13, 40]} />
    <ambientLight intensity={0.05} />
    <spotLight position={[4, 8, 4]} angle={0.5} penumbra={1} intensity={70 * I} color="#e1eaff" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
    <BackdropGlow />
    <Floor lite={lite} />
    <Streaks motion={motion} count={lite ? 26 : 48} />
    <Gantries motion={motion} />
    <LaneDashes motion={motion} />
    <Sparkles count={lite ? 30 : 70} scale={[16, 3.4, 11]} size={2.1} speed={0.35} opacity={0.55} color="#ffb48a" position={[0, 1.5, 0]} />
    <GroundShadow />
    <Car pack={pack} paintColor={paint} motion={motion} active={active} env={env} />
    <Director motion={motion} progress={progress} active={active} stacked={stacked} />
  </>;
}

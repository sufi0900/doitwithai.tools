"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CAR } from "./car-geometry";
import type { CarPack } from "./car-parts";
import { makeFlakeTexture, makeGlowTexture, makeMeshTexture } from "./textures";

/** Live values shared between the stage and the car (mutated every frame, never React state). */
export interface CarMotion { speed: number; steer: number; intro: number; lights: number; pitch: number; env: number }

const R = CAR.wheelRadius;

function useCarMaterials(paintColor: string, env: THREE.Texture) {
  const materials = useMemo(() => {
    const flake = makeFlakeTexture();
    const mesh = makeMeshTexture();
    const paint = new THREE.MeshPhysicalMaterial({ envMap: env, color: paintColor, metalness: 0.78, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.15, bumpMap: flake, bumpScale: 0.06 });
    return {
      flake, mesh, paint,
      glass: new THREE.MeshPhysicalMaterial({ envMap: env, color: "#070b10", metalness: 0.2, roughness: 0.04, transparent: true, opacity: 0.9, envMapIntensity: 1.6, clearcoat: 1, clearcoatRoughness: 0.02, depthWrite: false }),
      gloss: new THREE.MeshPhysicalMaterial({ envMap: env, color: "#050608", metalness: 0.5, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.6, side: THREE.DoubleSide }),
      gaps: new THREE.MeshBasicMaterial({ color: "#020203", side: THREE.DoubleSide }),
      grille: new THREE.MeshStandardMaterial({ envMap: env, color: "#0b0c0e", map: mesh, roughness: 0.55, metalness: 0.7, side: THREE.DoubleSide }),
      housing: new THREE.MeshPhysicalMaterial({ envMap: env, color: "#04050a", metalness: 0.6, roughness: 0.08, clearcoat: 1, envMapIntensity: 2, side: THREE.DoubleSide }),
      lampWhite: new THREE.MeshBasicMaterial({ color: "#f4fbff", toneMapped: false, side: THREE.DoubleSide }),
      lampRed: new THREE.MeshBasicMaterial({ color: "#ff2a1e", toneMapped: false, side: THREE.DoubleSide }),
      carbon: new THREE.MeshStandardMaterial({ envMap: env, color: "#0c0d10", roughness: 0.35, metalness: 0.5 }),
      tire: new THREE.MeshStandardMaterial({ envMap: env, color: "#0a0a0b", roughness: 0.82, metalness: 0.05 }),
      rim: new THREE.MeshStandardMaterial({ envMap: env, color: "#4a515c", roughness: 0.22, metalness: 1, envMapIntensity: 1.6 }),
      rimLip: new THREE.MeshStandardMaterial({ envMap: env, color: "#c9d1dc", roughness: 0.16, metalness: 1, envMapIntensity: 1.8 }),
      disc: new THREE.MeshStandardMaterial({ envMap: env, color: "#6b7078", roughness: 0.42, metalness: 0.95 }),
      caliper: new THREE.MeshPhysicalMaterial({ envMap: env, color: "#e23a2a", roughness: 0.35, metalness: 0.2, clearcoat: 1 }),
      chrome: new THREE.MeshStandardMaterial({ envMap: env, color: "#d9dee6", roughness: 0.12, metalness: 1, envMapIntensity: 2 }),
      exhaustInner: new THREE.MeshBasicMaterial({ color: "#020202" }),
      underbody: new THREE.MeshBasicMaterial({ color: "#020304" }),
      cabinDark: new THREE.MeshStandardMaterial({ envMap: env, color: "#0d1116", roughness: 0.6, metalness: 0.1 }),
      dashLed: new THREE.MeshBasicMaterial({ color: "#6fd0ff", toneMapped: false }),
      inner: new THREE.MeshBasicMaterial({ color: "#020304", side: THREE.BackSide }),
    };
  }, [env]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { materials.paint.color.set(paintColor); }, [materials, paintColor]);
  useEffect(() => () => {
    materials.flake.dispose(); materials.mesh.dispose();
    for (const value of Object.values(materials)) if (value instanceof THREE.Material) value.dispose();
  }, [materials]);
  return materials;
}
type Materials = ReturnType<typeof useCarMaterials>;

function Wheel({ pack, materials, x, z, front, motion }: { pack: CarPack; materials: Materials; x: number; z: number; front: boolean; motion: React.MutableRefObject<CarMotion> }) {
  const parts = front ? pack.wheels.front : pack.wheels.rear;
  const steer = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const angle = useRef(Math.random() * 6);
  const left = z < 0;
  useFrame((_, delta) => {
    const m = motion.current;
    angle.current += (m.speed / R) * Math.min(delta, 0.05);
    if (spin.current) spin.current.rotation.z = left ? angle.current : -angle.current;
    if (steer.current && front) steer.current.rotation.y = m.steer * (left ? 1 : 1);
  });
  return <group position={[x, R, z]}>
    <group ref={steer}>
      <group rotation={[0, left ? Math.PI : 0, 0]}>
        <group ref={spin}>
          <mesh geometry={parts.tire} material={materials.tire} castShadow />
          <mesh geometry={parts.barrel} material={materials.rimLip} />
          <mesh geometry={parts.spokes} material={materials.rim} />
          <mesh geometry={parts.hub} material={materials.rimLip} />
          <mesh geometry={parts.lugs} material={materials.chrome} />
        </group>
        <mesh geometry={parts.disc} material={materials.disc} />
        <mesh geometry={parts.caliper} material={materials.caliper} rotation={[0, 0, front ? 0 : 2.6]} />
      </group>
    </group>
  </group>;
}

function HeadBeam({ side, pack, motion, glow }: { side: 1 | -1; pack: CarPack; motion: React.MutableRefObject<CarMotion>; glow: THREE.Texture }) {
  const p = pack.anchors.headlight;
  const light = useMemo(() => {
    const spot = new THREE.SpotLight("#ffe8c8", 0, 12, 0.34, 1, 1.6);
    spot.position.set(p.x, p.y, p.z * side);
    spot.target.position.set(p.x + 6, 0, p.z * side * 0.85);
    return spot;
  }, [p, side]);
  const sprite = useRef<THREE.Sprite>(null);
  useFrame((state) => {
    const on = motion.current.lights;
    light.intensity = 5 * on;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 3.1 + side) * 0.03;
    if (sprite.current) { sprite.current.scale.setScalar(0.34 * on * pulse + 0.001); (sprite.current.material as THREE.SpriteMaterial).opacity = 0.95 * on; }
  });
  return <>
    <primitive object={light} /><primitive object={light.target} />
    <sprite ref={sprite} position={[p.x + 0.03, p.y, p.z * side]}><spriteMaterial map={glow} color="#e4f3ff" blending={THREE.AdditiveBlending} depthWrite={false} transparent toneMapped={false} /></sprite>
  </>;
}

export function Car({ pack, paintColor, motion, active, env }: { pack: CarPack; paintColor: string; motion: React.MutableRefObject<CarMotion>; active: boolean; env: THREE.Texture }) {
  const materials = useCarMaterials(paintColor, env);
  const reflective = useMemo(() => [materials.paint, materials.glass, materials.gloss, materials.housing, materials.grille, materials.carbon, materials.tire, materials.rim, materials.rimLip, materials.disc, materials.caliper, materials.chrome, materials.cabinDark], [materials]);
  const glow = useMemo(() => makeGlowTexture(), []);
  useEffect(() => () => glow.dispose(), [glow]);
  const rig = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Sprite>(null);
  const tailLight = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const m = motion.current;
    if (rig.current) {
      const cruise = active ? 1 : 0;
      rig.current.rotation.x = -m.steer * 0.045 * cruise + Math.sin(t * 0.7) * 0.0022 * cruise;                                 // body roll
      rig.current.rotation.z = m.pitch + Math.sin(t * 1.3 + 1) * 0.0028 * cruise;                                             // pitch
      rig.current.position.y = (Math.sin(t * 1.9) * 0.006 + Math.sin(t * 23) * 0.0009 * m.speed) * cruise;                     // breathing + engine tremor
    }
    for (const material of reflective) material.envMapRotation.y = m.env;
    if (tail.current) { tail.current.scale.set(1.25 * m.lights + 0.001, 0.2 * m.lights + 0.001, 1); }
    if (tailLight.current) tailLight.current.intensity = 1.2 * m.lights;
  });
  const { anchors } = pack;
  return <group ref={rig}>
    <mesh geometry={pack.bodyGeometry} material={materials.paint} castShadow receiveShadow />
    <mesh geometry={pack.innerShell} material={materials.inner} />
    <mesh geometry={pack.cabinGeometry} material={[materials.glass, materials.gloss]} renderOrder={2} />
    <mesh geometry={pack.trim.paint} material={materials.paint} />
    <mesh geometry={pack.trim.gloss} material={materials.gloss} />
    <mesh geometry={pack.trim.gaps} material={materials.gaps} />
    <mesh geometry={pack.trim.grille} material={materials.grille} />
    <mesh geometry={pack.trim.lampHousing} material={materials.housing} />
    <mesh geometry={pack.trim.lampWhite} material={materials.lampWhite} />
    <mesh geometry={pack.trim.lampRed} material={materials.lampRed} />

    <mesh geometry={pack.splitter} material={materials.carbon} />
    <mesh geometry={pack.diffuser} material={materials.carbon} />
    <mesh geometry={pack.wing} material={materials.carbon} position={[-2.02, 1.045, 0]} rotation={[0, 0, -0.06]} />
    {[1, -1].map((side) => <group key={`mirror-${side}`} position={[0.66, 0.885, 0.8 * side]} scale={[1, 1, side]}><mesh geometry={pack.mirror} material={materials.paint} /></group>)}
    {[-0.34, 0.34].map((z) => <group key={`exhaust-${z}`} position={[-2.2, 0.245, z]}>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 0.14, 28, 1, true]} /><meshStandardMaterial {...{ color: "#c9d0da", metalness: 1, roughness: 0.16, side: THREE.DoubleSide }} /></mesh>
      <mesh position={[-0.04, 0, 0]} rotation={[0, Math.PI / 2, 0]}><circleGeometry args={[0.045, 24]} /><meshBasicMaterial color="#020202" /></mesh>
    </group>)}
    <mesh material={materials.underbody} position={[0.02, 0.092, 0]}><boxGeometry args={[3.9, 0.012, 1.3]} /></mesh>

    {/* Cabin: two seats, dash with a cool LED strip, steering wheel. Visible through the tinted glass. */}
    <group position={[0, 0, 0]}>
      {[-0.36, 0.36].map((z) => <mesh key={z} position={[-0.42, 0.78, z]} material={materials.cabinDark}><capsuleGeometry args={[0.15, 0.32, 4, 12]} /></mesh>)}
      <mesh position={[0.5, 0.86, 0]} rotation={[0, 0, -0.18]} material={materials.cabinDark}><boxGeometry args={[0.42, 0.09, 1.34]} /></mesh>
      <mesh position={[0.53, 0.905, 0]} rotation={[0, 0, -0.18]} material={materials.dashLed}><boxGeometry args={[0.02, 0.012, 1.18]} /></mesh>
      <mesh position={[0.3, 0.98, 0.36]} rotation={[0, 0.06, 0.95]} material={materials.cabinDark}><torusGeometry args={[0.13, 0.014, 8, 28]} /></mesh>
    </group>

    <Wheel pack={pack} materials={materials} x={CAR.frontAxleX} z={CAR.frontTrack} front motion={motion} />
    <Wheel pack={pack} materials={materials} x={CAR.frontAxleX} z={-CAR.frontTrack} front motion={motion} />
    <Wheel pack={pack} materials={materials} x={CAR.rearAxleX} z={CAR.rearTrack} front={false} motion={motion} />
    <Wheel pack={pack} materials={materials} x={CAR.rearAxleX} z={-CAR.rearTrack} front={false} motion={motion} />

    <HeadBeam side={1} pack={pack} motion={motion} glow={glow} />
    <HeadBeam side={-1} pack={pack} motion={motion} glow={glow} />
    <sprite ref={tail} position={[anchors.taillight.x - 0.05, anchors.taillight.y, 0]}><spriteMaterial map={glow} color="#ff2a1a" blending={THREE.AdditiveBlending} depthWrite={false} transparent toneMapped={false} opacity={0.5} /></sprite>
    <pointLight ref={tailLight} position={[-2.6, 0.35, 0]} color="#ff2a1a" intensity={0} distance={5} decay={1.6} />
  </group>;
}

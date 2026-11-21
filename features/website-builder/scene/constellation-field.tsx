"use client";

import { Html, Line, OrbitControls, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Component, useMemo, useRef, type ErrorInfo, type ReactNode } from "react";
import * as THREE from "three";
import type { SiteCommand } from "@/features/website-builder/domain/commands";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";

const accents = { cyan: "#4deeea", violet: "#a78bfa", coral: "#fb7185", lime: "#a3e635", rose: "#d94c89", blue: "#75aaff", olive: "#78834b", indigo: "#6366f1" } as const;
type Props = { document: SiteDocument; execute: (command: SiteCommand) => void; reducedMotion: boolean };

function Field({ document, execute, reducedMotion }: Props) {
  const group = useRef<THREE.Group>(null);
  const accent = accents[document.design.accent];
  const speed = reducedMotion || document.scene.motion === "still" ? 0 : document.scene.motion === "dynamic" ? .09 : .025;
  useFrame((_, delta) => { if (group.current) group.current.rotation.y += delta * speed * document.scene.intensity; });
  const points = useMemo(() => document.skills.map((_, index) => {
    const angle = (index / document.skills.length) * Math.PI * 2;
    const radius = 2.15 + (index % 3) * .32;
    return [Math.cos(angle) * radius, Math.sin(angle * 2) * .9, Math.sin(angle) * radius] as [number, number, number];
  }), [document.skills]);
  return <group ref={group} rotation={[.08, -.3, 0]}>
    <Line points={[...points, points[0]]} color={accent} transparent opacity={.28} lineWidth={1} />
    {points.map((point, index) => {
      const skill = document.skills[index];
      const selected = document.scene.focusedSkill === skill.id;
      return <group key={skill.id} position={point}>
        <mesh scale={selected ? 1.35 : 1} onClick={(event) => { event.stopPropagation(); execute({ type: "scene.focusSkill", skillId: skill.id }); }}>
          <octahedronGeometry args={[.18 + skill.level * .025, document.scene.preset === "minimal" ? 0 : 1]} />
          <meshStandardMaterial color={selected ? "#fff" : accent} emissive={accent} emissiveIntensity={selected ? 1.1 : .45} metalness={.62} roughness={.2} />
        </mesh>
        <Html center distanceFactor={7} style={{ pointerEvents: "none" }}><span className={selected ? "scene-label selected" : "scene-label"}>{skill.label}</span></Html>
      </group>;
    })}
    <mesh><dodecahedronGeometry args={[.7, 1]} /><meshBasicMaterial color={accent} wireframe transparent opacity={.32} /></mesh>
    <Sparkles count={document.scene.preset === "minimal" ? 35 : 90} scale={7} size={1.15} speed={speed * 2} color={accent} opacity={.45} />
  </group>;
}

class Boundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Constellation scene unavailable", error, info.componentStack); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function ConstellationField(props: Props) {
  return <Boundary fallback={<div className="scene-fallback constellation-fallback" role="img" aria-label="Static constellation field fallback"><div className="fallback-core" /></div>}>
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, .25, 6.8], fov: 42 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
      <ambientLight intensity={.65} /><directionalLight position={[4, 5, 5]} intensity={2} /><pointLight position={[-3, -2, 3]} intensity={16} color={accents[props.document.design.accent]} distance={9} />
      <Field {...props} /><OrbitControls enablePan={false} minDistance={4.8} maxDistance={9} makeDefault />
    </Canvas>
  </Boundary>;
}

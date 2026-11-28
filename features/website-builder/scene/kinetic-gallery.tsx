"use client";

import { Html, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Component, useMemo, useRef, type ErrorInfo, type ReactNode } from "react";
import * as THREE from "three";
import type { SiteCommand } from "@/features/website-builder/domain/commands";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";

const accents = { cyan: "#4deeea", violet: "#a78bfa", coral: "#fb7185", lime: "#a3e635", rose: "#d94c89", blue: "#75aaff", olive: "#78834b", indigo: "#6366f1" } as const;
type Props = { document: SiteDocument; execute: (command: SiteCommand) => void; reducedMotion: boolean };

function GalleryPanel({ skill, index, total, accent, selected, execute }: { skill: SiteDocument["skills"][number]; index: number; total: number; accent: string; selected: boolean; execute: Props["execute"] }) {
  const x = total === 1 ? 0 : -2.35 + (index / (total - 1)) * 4.7;
  const y = index % 2 ? .72 : -.55;
  const z = -1.05 - (index % 3) * .42;
  return <group position={[x, y, z]} rotation={[0, -x * .1, (index % 2 ? .07 : -.07)]}>
    <mesh scale={selected ? 1.1 : 1} onClick={(event) => { event.stopPropagation(); execute({ type: "scene.focusSkill", skillId: skill.id }); }}>
      <boxGeometry args={[.78, 1.05, .07]} />
      <meshStandardMaterial color={selected ? "#f8fafc" : "#111827"} emissive={accent} emissiveIntensity={selected ? 1.15 : .22} metalness={.72} roughness={.24} />
    </mesh>
    <mesh position={[0, -.38, .05]}>
      <boxGeometry args={[.54, .012, .012]} />
      <meshBasicMaterial color={accent} transparent opacity={.85} />
    </mesh>
    <Html center position={[0, .68, .06]} distanceFactor={7} style={{ pointerEvents: "none" }}>
      <span className={selected ? "scene-label selected" : "scene-label"}>{skill.label}</span>
    </Html>
  </group>;
}

function GalleryWorld({ document, execute, reducedMotion }: Props) {
  const group = useRef<THREE.Group>(null);
  const accent = accents[document.design.accent];
  const speed = reducedMotion || document.scene.motion === "still" ? 0 : document.scene.motion === "dynamic" ? .45 : .16;
  const panels = useMemo(() => document.skills.slice(0, 6), [document.skills]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const targetX = reducedMotion ? 0 : state.pointer.y * .13;
    const targetY = reducedMotion ? 0 : state.pointer.x * .2;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 3.5, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 3.5, delta);
    group.current.position.y = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * speed) * .07;
  });

  return <group ref={group} rotation={[.03, -.05, 0]}>
    <mesh position={[0, 0, .2]}>
      <boxGeometry args={[1.15, 3.35, .28]} />
      <meshPhysicalMaterial color="#0b1220" emissive={accent} emissiveIntensity={.13 * document.scene.intensity} metalness={.86} roughness={.16} transmission={.05} />
    </mesh>
    <mesh position={[0, 0, .36]}>
      <boxGeometry args={[.08, 2.6, .025]} />
      <meshBasicMaterial color={accent} transparent opacity={.85} />
    </mesh>
    <mesh position={[0, -1.84, .2]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[7.4, 4.6]} />
      <meshBasicMaterial color="#05070c" transparent opacity={.5} />
    </mesh>
    {panels.map((skill, index) => <GalleryPanel key={skill.id} skill={skill} index={index} total={panels.length} accent={accent} selected={document.scene.focusedSkill === skill.id} execute={execute} />)}
    <Sparkles count={reducedMotion ? 30 : 75} scale={[7, 4.5, 4]} size={1.1} speed={speed * .8} color={accent} opacity={.4} />
  </group>;
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Kinetic Gallery scene unavailable", error, info.componentStack); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function GalleryFallback({ document }: { document: SiteDocument }) {
  return <div className="scene-fallback kinetic-gallery-fallback" role="img" aria-label="Static Kinetic Gallery fallback">
    <div className="gallery-fallback-monolith" />
    {document.skills.slice(0, 6).map((skill, index) => <span key={skill.id} style={{ "--i": index } as React.CSSProperties}>{skill.label}</span>)}
  </div>;
}

export function KineticGallery(props: Props) {
  return <SceneBoundary fallback={<GalleryFallback document={props.document} />}>
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, .2, 7.8], fov: 38 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
      <ambientLight intensity={.48} />
      <directionalLight position={[-3, 5, 4]} intensity={2.1} color="#e2e8f0" />
      <pointLight position={[0, 1, 3]} intensity={18} color={accents[props.document.design.accent]} distance={8} />
      <pointLight position={[-4, -1, 0]} intensity={6} color="#818cf8" distance={7} />
      <GalleryWorld {...props} />
    </Canvas>
  </SceneBoundary>;
}

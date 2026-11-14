"use client";

import { Html, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Component, useMemo, useRef, type ErrorInfo, type ReactNode } from "react";
import * as THREE from "three";
import type { SiteCommand } from "@/features/website-builder/domain/commands";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";

const accents = { cyan: "#4deeea", violet: "#a78bfa", coral: "#fb7185", lime: "#a3e635", rose: "#d94c89", blue: "#75aaff", olive: "#78834b", indigo: "#6366f1" } as const;
type Props = { document: SiteDocument; execute: (command: SiteCommand) => void; reducedMotion: boolean };

function ArchiveRecord({ skill, index, accent, selected, execute }: { skill: SiteDocument["skills"][number]; index: number; accent: string; selected: boolean; execute: Props["execute"] }) {
  const record = useRef<THREE.Group>(null);
  const x = index % 2 ? .85 : -.82;
  const y = 1.45 - index * .62;
  const z = -.35 - (index % 3) * .42;
  useFrame((state) => {
    if (!record.current) return;
    record.current.position.y = y + Math.sin(state.clock.elapsedTime * .42 + index * 1.7) * .09;
  });
  return <group ref={record} position={[x, y, z]} rotation={[0, index % 2 ? -.17 : .17, index % 2 ? -.05 : .05]}>
    <mesh scale={selected ? 1.09 : 1} onClick={(event) => { event.stopPropagation(); execute({ type: "scene.focusSkill", skillId: skill.id }); }}>
      <planeGeometry args={[1.45, .39]} />
      <meshPhysicalMaterial color={selected ? "#fdf2f8" : "#172033"} emissive={accent} emissiveIntensity={selected ? .9 : .12} transparent opacity={.78} metalness={.15} roughness={.08} transmission={.46} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[-.5, 0, .012]}><planeGeometry args={[.22, .012]} /><meshBasicMaterial color={accent} /></mesh>
    <Html center position={[.08, 0, .02]} distanceFactor={8} style={{ pointerEvents: "none" }}><span className={selected ? "scene-label selected" : "scene-label"}>{skill.label}</span></Html>
  </group>;
}

function AuroraWorld({ document, execute, reducedMotion }: Props) {
  const chamber = useRef<THREE.Group>(null);
  const accent = accents[document.design.accent];
  const records = useMemo(() => document.skills.slice(0, 6), [document.skills]);
  useFrame((state, delta) => {
    if (!chamber.current) return;
    const drift = reducedMotion || document.scene.motion === "still" ? 0 : document.scene.motion === "dynamic" ? .32 : .15;
    chamber.current.rotation.y = THREE.MathUtils.damp(chamber.current.rotation.y, state.pointer.x * .16, 3, delta);
    chamber.current.rotation.x = THREE.MathUtils.damp(chamber.current.rotation.x, -state.pointer.y * .08, 3, delta);
    chamber.current.position.x = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * drift) * .06;
  });
  return <group ref={chamber}>
    <mesh position={[0, .05, -1.3]}><planeGeometry args={[4.3, 5.3]} /><meshBasicMaterial color="#06111b" transparent opacity={.65} /></mesh>
    <mesh position={[-1.6, 0, -.92]} rotation={[0, 0, -.06]}><planeGeometry args={[.015, 4.6]} /><meshBasicMaterial color={accent} transparent opacity={.6} /></mesh>
    <mesh position={[1.55, -.35, -.86]} rotation={[0, 0, .08]}><planeGeometry args={[.012, 3.9]} /><meshBasicMaterial color="#dbeafe" transparent opacity={.18} /></mesh>
    <mesh position={[0, 0, -.76]}><planeGeometry args={[2.15, 4.45]} /><meshBasicMaterial color={accent} transparent opacity={.035 + document.scene.intensity * .03} /></mesh>
    {records.map((skill, index) => <ArchiveRecord key={skill.id} skill={skill} index={index} accent={accent} selected={document.scene.focusedSkill === skill.id} execute={execute} />)}
    <Sparkles count={reducedMotion ? 24 : 70} scale={[4.7, 5.5, 2.2]} size={1.35} speed={reducedMotion ? 0 : .18} color={accent} opacity={.52} />
  </group>;
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Aurora Archive scene unavailable", error, info.componentStack); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function ArchiveFallback({ document }: { document: SiteDocument }) {
  return <div className="scene-fallback aurora-archive-fallback" role="img" aria-label="Static Aurora Archive fallback"><i />{document.skills.slice(0, 6).map((skill) => <span key={skill.id}>{skill.label}</span>)}</div>;
}

export function AuroraArchive(props: Props) {
  return <SceneBoundary fallback={<ArchiveFallback document={props.document} />}><Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 6.7], fov: 39 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
    <ambientLight intensity={.42} /><directionalLight position={[2, 4, 4]} intensity={1.8} color="#f8fafc" /><pointLight position={[-1, .5, 3]} intensity={15} color={accents[props.document.design.accent]} distance={8} /><pointLight position={[2, -2, 1]} intensity={6} color="#a5b4fc" distance={6} />
    <AuroraWorld {...props} />
  </Canvas></SceneBoundary>;
}

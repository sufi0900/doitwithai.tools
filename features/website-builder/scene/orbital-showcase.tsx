"use client";

import { Float, Html, OrbitControls, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Component, useMemo, useRef, type ErrorInfo, type ReactNode } from "react";
import * as THREE from "three";
import type { SiteCommand } from "@/features/website-builder/domain/commands";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";

const accents = { cyan: "#4deeea", violet: "#a78bfa", coral: "#fb7185", lime: "#a3e635", rose: "#d94c89", blue: "#75aaff", olive: "#78834b", indigo: "#6366f1" } as const;
const scenePalettes = {
  cosmic: { core: "#6ee7ff", secondary: "#8b5cf6", metalness: 0.45 },
  architect: { core: "#f8fafc", secondary: "#38bdf8", metalness: 0.8 },
  minimal: { core: "#dbeafe", secondary: "#64748b", metalness: 0.2 },
} as const;

type Props = { document: SiteDocument; execute: (command: SiteCommand) => void; reducedMotion: boolean };

function OrbitalWorld({ document, execute, reducedMotion }: Props) {
  const group = useRef<THREE.Group>(null);
  const palette = scenePalettes[document.scene.preset];
  const accent = accents[document.design.accent];
  const speed = document.scene.motion === "dynamic" ? 0.16 : document.scene.motion === "still" || reducedMotion ? 0 : 0.055;

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * speed * document.scene.intensity;
  });

  const positions = useMemo(() => document.skills.map((skill, index) => {
    const angle = (index / document.skills.length) * Math.PI * 2;
    const radius = 2.25 + (index % 2) * 0.35;
    return [Math.cos(angle) * radius, Math.sin(angle * 1.5) * 0.6, Math.sin(angle) * radius] as const;
  }), [document.skills]);

  return (
    <group ref={group} rotation={[0.12, -0.25, 0.04]}>
      <Float speed={reducedMotion ? 0 : 1.1} rotationIntensity={reducedMotion ? 0 : 0.12} floatIntensity={reducedMotion ? 0 : 0.2}>
        <mesh>
          <icosahedronGeometry args={[1.05, 5]} />
          <meshPhysicalMaterial color={palette.core} emissive={accent} emissiveIntensity={0.22} roughness={0.18} metalness={palette.metalness} transmission={0.18} thickness={1.5} />
        </mesh>
        <mesh scale={1.12}>
          <icosahedronGeometry args={[1.05, 2]} />
          <meshBasicMaterial color={accent} wireframe transparent opacity={0.18} />
        </mesh>
      </Float>

      {[1.7, 2.3, 2.9].map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2.3 + index * 0.35, index * 0.4, 0]}>
          <torusGeometry args={[radius, 0.008 + index * 0.003, 8, 160]} />
          <meshBasicMaterial color={index === 1 ? accent : palette.secondary} transparent opacity={0.3 - index * 0.05} />
        </mesh>
      ))}

      {document.skills.map((skill, index) => {
        const position = positions[index];
        const selected = document.scene.focusedSkill === skill.id;
        return (
          <Float key={skill.id} speed={reducedMotion ? 0 : 1.5 + index * 0.1} floatIntensity={reducedMotion ? 0 : 0.22}>
            <group position={position}>
              <mesh
                scale={selected ? 1.35 : 1}
                onClick={(event) => { event.stopPropagation(); execute({ type: "scene.focusSkill", skillId: skill.id }); }}
                onPointerOver={() => { globalThis.document?.body.classList.add("scene-hover"); }}
                onPointerOut={() => { globalThis.document?.body.classList.remove("scene-hover"); }}
              >
                <sphereGeometry args={[0.16 + skill.level * 0.018, 24, 24]} />
                <meshStandardMaterial color={selected ? "#ffffff" : accent} emissive={accent} emissiveIntensity={selected ? 1.2 : 0.48} roughness={0.22} />
              </mesh>
              <Html center distanceFactor={7} style={{ pointerEvents: "none" }}>
                <span className={selected ? "scene-label selected" : "scene-label"}>{skill.label}</span>
              </Html>
            </group>
          </Float>
        );
      })}
      <Sparkles count={document.scene.preset === "minimal" ? 45 : 105} scale={7} size={1.2} speed={speed * 2} color={accent} opacity={0.45} />
    </group>
  );
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("3D scene unavailable", error, info.componentStack); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function SceneFallback({ document }: { document: SiteDocument }) {
  return (
    <div className="scene-fallback" role="img" aria-label="Static Orbital Showcase fallback">
      <div className="fallback-core" />
      {document.skills.map((skill, index) => <span key={skill.id} style={{ "--i": index } as React.CSSProperties}>{skill.label}</span>)}
    </div>
  );
}

export function OrbitalShowcase(props: Props) {
  return (
    <SceneBoundary fallback={<SceneFallback document={props.document} />}>
      <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0.4, 6.7], fov: 42 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} color="#e0f2fe" />
        <pointLight position={[-4, -2, 2]} intensity={18} color={accents[props.document.design.accent]} distance={9} />
        <OrbitalWorld {...props} />
        <OrbitControls enablePan={false} minDistance={4.5} maxDistance={9} autoRotate={false} makeDefault />
      </Canvas>
    </SceneBoundary>
  );
}

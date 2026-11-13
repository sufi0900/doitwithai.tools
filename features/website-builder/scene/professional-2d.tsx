"use client";

import { Canvas } from "@react-three/fiber";
import { Component, type ReactNode, type ErrorInfo } from "react";
import type { SiteCommand } from "@/features/website-builder/domain/commands";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";

const accents = { cyan: "#06b6d4", violet: "#8b5cf6", coral: "#f97316", lime: "#84cc16", rose: "#d94c89", blue: "#75aaff", olive: "#78834b", indigo: "#6366f1" } as const;

type Props = { document: SiteDocument; execute: (command: SiteCommand) => void; reducedMotion: boolean };

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Professional 2D scene unavailable", error, info.componentStack); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function Professional2DFallback({ document }: { document: SiteDocument }) {
  const accent = accents[document.design.accent];
  return (
    <div className="scene-fallback professional-2d-fallback" role="img" aria-label="Professional 2D portfolio — clean light mode layout">
      <div className="fallback-accent-bar" style={{ background: accent }} />
      <div className="fallback-content">
        <span className="fallback-label">PROFESSIONAL 2D</span>
        <span className="fallback-desc">Clean, accessible light-mode layout</span>
      </div>
    </div>
  );
}

export function Professional2D({ document }: Props) {
  return (
    <SceneBoundary fallback={<Professional2DFallback document={document} />}>
      <div className="professional-2d-canvas-host">
        <Canvas
          dpr={[1, 1]}
          camera={{ position: [0, 0, 10], fov: 1 } }
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["transparent"]} />
        </Canvas>
      </div>
    </SceneBoundary>
  );
}
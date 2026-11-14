"use client";

import { Canvas } from "@react-three/fiber";
import { Component, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import * as THREE from "three";
import type { SiteCommand } from "@/features/website-builder/domain/commands";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import { VelocityWorld } from "./velocity/velocity-stage";

/** Paint per accent: deep, saturated metallics that stay rich against the graphite showroom. */
const paint = { cyan: "#0a8f9e", violet: "#5a3fd1", coral: "#c9271b", lime: "#86ad1c", rose: "#d94c89", blue: "#75aaff", olive: "#78834b", indigo: "#6366f1" } as const;
type Props = { document: SiteDocument; execute: (command: SiteCommand) => void; reducedMotion: boolean };

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Velocity Atelier scene unavailable", error, info.componentStack); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function RoadsterFallback() {
  return <div className="scene-fallback velocity-roadster-fallback" role="img" aria-label="Static cinematic coupe in a dark automotive showroom">
    <svg viewBox="0 0 640 220" aria-hidden="true">
      <defs>
        <linearGradient id="vx-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff6a4d" /><stop offset=".55" stopColor="#c9271b" /><stop offset="1" stopColor="#5e0f0a" /></linearGradient>
        <linearGradient id="vx-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1b2a3a" /><stop offset="1" stopColor="#05080c" /></linearGradient>
        <radialGradient id="vx-floor" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#000" stopOpacity=".7" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="320" cy="188" rx="250" ry="14" fill="url(#vx-floor)" />
      <path d="M40 158c4-20 26-30 66-36l76-12c30-26 72-44 120-44 58 0 96 8 130 30l84 22c34 8 56 14 62 34 4 16 0 30-14 32H60c-14 0-22-10-20-26Z" fill="url(#vx-body)" />
      <path d="M204 108c26-22 62-38 104-38 44 0 76 6 104 24l40 18H204Z" fill="url(#vx-glass)" opacity=".92" />
      <path d="M52 150h520" stroke="#ffb4a3" strokeOpacity=".35" strokeWidth="2" />
      <path d="M578 132c14 2 26 6 30 14" stroke="#f4fbff" strokeWidth="5" strokeLinecap="round" />
      <path d="M40 140c-2 8 0 14 4 18" stroke="#ff2a1e" strokeWidth="6" strokeLinecap="round" />
      {[[168, 168], [456, 168]].map(([cx, cy]) => <g key={cx}><circle cx={cx} cy={cy} r="34" fill="#0b0c0e" /><circle cx={cx} cy={cy} r="21" fill="#2b3038" stroke="#c9d1dc" strokeWidth="2.5" /><circle cx={cx} cy={cy} r="6" fill="#c9d1dc" /></g>)}
    </svg>
    <span>VELOCITY ATELIER</span>
  </div>;
}

/** Hero-relative scroll progress (0 at the top of the hero → 1 once it has scrolled away). Works in the Studio's nested scroller too. */
function useHeroProgress(host: React.RefObject<HTMLElement | null>) {
  const progress = useRef(0);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const update = () => {
      const hero = el.closest(".portfolio-hero") ?? el;
      const rect = hero.getBoundingClientRect();
      progress.current = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height * 0.9)));
    };
    const onScroll = (event: Event) => { const target = event.target; if (target === document || (target instanceof Element && target.contains(el))) update(); };
    update();
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => { document.removeEventListener("scroll", onScroll, { capture: true }); window.removeEventListener("resize", update); };
  }, [host]);
  return progress;
}

export function VelocityRoadster(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const progress = useHeroProgress(host);
  const [visible, setVisible] = useState(true);
  const [lite, setLite] = useState(false);
  const [stacked, setStacked] = useState(false);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    setLite(window.innerWidth < 720 || (navigator.hardwareConcurrency ?? 8) <= 4);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "80px" });
    observer.observe(el);
    // The layout stacks (copy under the canvas) when the portfolio container is narrow, mirroring the CSS container query.
    const page = el.closest(".portfolio-preview") ?? document.documentElement;
    const measure = () => setStacked(page.clientWidth <= 820);
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(page);
    return () => { observer.disconnect(); resize.disconnect(); };
  }, []);
  const active = !props.reducedMotion && props.document.scene.motion !== "still";
  return <SceneBoundary fallback={<RoadsterFallback />}>
    <div ref={host} className="velocity-canvas-host" style={{ position: "absolute", inset: 0 }}>
      <Canvas shadows dpr={[1, lite ? 1.25 : 1.7]} frameloop={visible ? (active ? "always" : "demand") : "never"} camera={{ position: [5, 1.8, -5], fov: 30, near: 0.1, far: 90 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.08 }}>
        <VelocityWorld paint={paint[props.document.design.accent]} active={active} intensity={props.document.scene.intensity} lite={lite} stacked={stacked} progress={progress} />
      </Canvas>
    </div>
  </SceneBoundary>;
}

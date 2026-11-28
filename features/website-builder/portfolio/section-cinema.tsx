"use client";

import "./section-cinema.css";
import "./section-cinema-velocity.css";
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { MotionMode } from "@/features/website-builder/domain/site-document";
import { startCinema } from "./section-cinema-engine";

export type CinemaKind = "about" | "experience" | "skills" | "projects" | "contact";

const index = (count: number) => Array.from({ length: count }, (_, value) => value);
const at = (value: number) => ({ "--k": value } as CSSProperties);

/**
 * Wraps the homepage sections. When `enabled`, it starts the shared cinema engine (scroll depth,
 * pointer parallax, in-view gating). When not enabled it renders exactly the original wrapper.
 */
export function CinemaRoot({ enabled, template, motion, intensity, children }: { enabled: boolean; template: string; motion: MotionMode; intensity: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!enabled || !root) return;
    return startCinema(root, motion);
  }, [enabled, motion]);
  if (!enabled) return <div className="portfolio-sections">{children}</div>;
  const amplitude = Math.round((template === "editorial-depth" ? intensity * 0.7 : intensity) * 100) / 100;
  const style = { "--cine-i": amplitude, "--cine-t": motion === "dynamic" ? 0.62 : 1 } as CSSProperties;
  return <div ref={ref} className="portfolio-sections cinema-on" data-motion={motion} data-cinema-template={template} style={style}>{children}</div>;
}

/** Decorative, non-interactive 3D set piece for one homepage section. Uses CSS 3D only — no WebGL context. */
export function SectionScene({ kind, template }: { kind: CinemaKind; template?: string }) {
  const set = template === "velocity-atelier" ? velocityScenes : scenes;
  return <div className={`cine-scene cine-${kind}`} aria-hidden="true"><div className="cine-glow" /><div className="cine-stage">{set[kind]}</div></div>;
}

const Gem = () => <div className="cine-obj cine-gem">
  <div className="gem-spin">
    {index(4).map((k) => <i key={`t${k}`} className="gem-face top" style={at(k)} />)}
    {index(4).map((k) => <i key={`b${k}`} className="gem-face bottom" style={at(k)} />)}
  </div>
  <div className="cine-ring r1" /><div className="cine-ring r2" /><div className="cine-ring r3" />
</div>;

const Cube = () => <div className="cine-obj cine-cube">
  <div className="cube-spin">{index(6).map((k) => <i key={k} className={`cube-face f${k}`} />)}<div className="cube-core" /></div>
  <div className="cine-ring r1" /><div className="cine-ring r2" />
</div>;

const scenes: Record<CinemaKind, ReactNode> = {
  about: <>
    <div className="cine-obj cine-plate p1" /><div className="cine-obj cine-plate p2" /><div className="cine-obj cine-plate p3" />
    <Gem /><Cube />
    <div className="cine-obj cine-cross c1" /><div className="cine-obj cine-cross c2" />
  </>,
  experience: <>
    <div className="cine-floor"><div className="floor-grid" /></div>
    <div className="cine-tunnel">{index(7).map((k) => <div key={k} className="tunnel-frame" style={at(k)} />)}</div>
    <div className="cine-obj cine-pillar a" /><div className="cine-obj cine-pillar b" /><div className="cine-obj cine-pillar c" />
    <div className="cine-obj cine-cross c1" /><div className="cine-obj cine-cross c2" />
  </>,
  skills: <>
    <div className="cine-obj cine-gyro">
      <div className="gyro-ring g1" /><div className="gyro-ring g2" /><div className="gyro-ring g3" /><div className="gyro-core" />
    </div>
    <div className="cine-obj cine-shard s1" /><div className="cine-obj cine-shard s2" />
    <div className="cine-obj cine-cross c1" /><div className="cine-obj cine-cross c2" />
  </>,
  projects: <>
    <div className="cine-obj cine-panel p1" /><div className="cine-obj cine-panel p2" /><div className="cine-obj cine-panel p3" /><div className="cine-obj cine-panel p4" />
    <div className="cine-obj cine-shard s1" /><div className="cine-obj cine-shard s2" /><div className="cine-obj cine-shard s3" />
    <div className="cine-obj cine-cross c1" /><div className="cine-obj cine-cross c2" />
  </>,
  contact: <>
    <div className="cine-floor beacon-floor">{index(4).map((k) => <div key={k} className="beacon-pulse" style={at(k)} />)}</div>
    <div className="cine-obj cine-beacon">
      <div className="beacon-beam" /><div className="beacon-orb" /><div className="beacon-orbit"><div /></div>
    </div>
    <div className="cine-obj cine-cross c1" /><div className="cine-obj cine-cross c2" />
  </>,
};

// ───────────────────────── Velocity Atelier: automotive scene set ─────────────────────────
const Wheel = () => <div className="cine-obj vx-wheel">
  <div className="vx-wheel-spin">
    {index(9).map((k) => <div key={k} className="vx-tire" style={at(k)} />)}
    <div className="vx-disc" />
    <div className="vx-rim" /><div className="vx-lip" /><div className="vx-hub" />
  </div>
  <div className="vx-caliper" />
  <div className="vx-sheen" />
</div>;

const velocityScenes: Record<CinemaKind, ReactNode> = {
  about: <>
    <div className="vx-turntable" />
    <Wheel />
    <div className="cine-obj vx-swatch s1" /><div className="cine-obj vx-swatch s2" /><div className="cine-obj vx-swatch s3" />
  </>,
  experience: <>
    <div className="vx-road"><div className="vx-road-lines" /></div>
    <div className="vx-gantries">{index(6).map((k) => <div key={k} className="vx-arch" style={at(k)} />)}</div>
    {index(7).map((k) => <div key={k} className={`vx-streak st${k}`} />)}
    <div className="cine-obj vx-post a" /><div className="cine-obj vx-post b" />
  </>,
  skills: <>
    <div className="cine-obj vx-cluster">
      <div className="vx-gauge">
        <div className="vx-track" /><div className="vx-progress" /><div className="vx-ticks" /><div className="vx-needle" /><div className="vx-cap" /><div className="vx-glass" />
      </div>
      <div className="vx-gauge mini a"><div className="vx-track" /><div className="vx-ticks" /><div className="vx-needle" /><div className="vx-cap" /></div>
      <div className="vx-gauge mini b"><div className="vx-track" /><div className="vx-ticks" /><div className="vx-needle" /><div className="vx-cap" /></div>
      <div className="vx-leds">{index(10).map((k) => <i key={k} style={at(k)} />)}</div>
    </div>
    <div className="cine-obj cine-shard s1" /><div className="cine-obj cine-shard s2" />
  </>,
  projects: <>
    <div className="vx-rail">{index(3).map((k) => <i key={k} style={at(k)} />)}</div>
    <div className="vx-cone c1" /><div className="vx-cone c2" /><div className="vx-cone c3" />
    <div className="cine-obj vx-frame f1" /><div className="cine-obj vx-frame f2" /><div className="cine-obj vx-frame f3" />
    <div className="cine-obj cine-shard s1" /><div className="cine-obj cine-shard s3" />
  </>,
  contact: <>
    <div className="vx-lane"><div className="vx-lane-lines" /></div>
    <div className="vx-beam l" /><div className="vx-beam r" />
    <div className="vx-flare" />
    <div className="cine-obj vx-lamp l"><i /><b /></div><div className="cine-obj vx-lamp r"><i /><b /></div>
    {index(9).map((k) => <div key={k} className={`vx-bokeh k${k}`} />)}
  </>,
};

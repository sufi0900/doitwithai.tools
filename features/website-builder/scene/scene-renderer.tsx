"use client";

import dynamic from "next/dynamic";
import type { SiteCommand } from "@/features/website-builder/domain/commands";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";

const OrbitalShowcase = dynamic(() => import("./orbital-showcase").then((module) => module.OrbitalShowcase), { ssr: false, loading: () => <div className="scene-loading">Preparing Orbital Showcase…</div> });
const ConstellationField = dynamic(() => import("./constellation-field").then((module) => module.ConstellationField), { ssr: false, loading: () => <div className="scene-loading">Preparing Constellation Field…</div> });
const KineticGallery = dynamic(() => import("./kinetic-gallery").then((module) => module.KineticGallery), { ssr: false, loading: () => <div className="scene-loading">Preparing Kinetic Gallery…</div> });
const VelocityRoadster = dynamic(() => import("./velocity-roadster").then((module) => module.VelocityRoadster), { ssr: false, loading: () => <div className="scene-loading">Opening the Velocity Atelier…</div> });
const Professional2D = dynamic(() => import("./professional-2d").then((module) => module.Professional2D), { ssr: false, loading: () => <div className="scene-loading">Preparing Professional 2D…</div> });

export function SceneRenderer(props: { document: SiteDocument; execute: (command: SiteCommand) => void; reducedMotion: boolean }) {
  if (props.document.scene.family === "kinetic-gallery") return <KineticGallery {...props} />;
  if (props.document.scene.family === "velocity-roadster") return <VelocityRoadster {...props} />;
  if (props.document.scene.family === "professional-2d") return <Professional2D {...props} />;
  if (props.document.scene.family === "doitwithai-editorial-grid") return <Professional2D {...props} />;
  return props.document.scene.family === "constellation-field" ? <ConstellationField {...props} /> : <OrbitalShowcase {...props} />;
}

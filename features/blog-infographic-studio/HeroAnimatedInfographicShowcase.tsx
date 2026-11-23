"use client";

/**
 * Venngage / Canva-Style Interactive Infographic Hero Showcase
 * File: features/blog-infographic-studio/HeroAnimatedInfographicShowcase.tsx
 *
 * Purpose-built for `/tools/blog-section-infographic-generator`:
 *  - Zero testimonial/founder portraits (100% pure infographic data visualizations & diagrams)
 *  - Auto-cycles across 5 signature infographic families (Chevron Pipeline, VS Battle Board,
 *    Glassmorphic KPI Orbs, Interlocking Growth Gears, and Survey Stat Cards + Multi-Bar Chart)
 *  - Renders live high-DPI composite infographics (AI Art Plates + Vector Icon Medallions + Charts)
 *  - Dispatches `select-blog-infographic-template` CustomEvent to load any showcase design into the studio
 */

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowDownRight,
  BarChart3,
  CheckCircle2,
  GitCompare,
  Layers,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import type { BlogInfographicConfig } from "@/lib/blog-writer/canonical-state";
import {
  createSampleInfographicConfig,
  preloadInfographicArtPlates,
  renderBlogInfographicToCanvas,
} from "@/lib/blog-infographic-studio/canvas-renderer";

export interface HeroInfographicShowcaseSlide {
  id: string;
  tabLabel: string;
  templateId: number;
  templateBadge: string;
  familyLabel: string;
  paletteId: BlogInfographicConfig["paletteId"];
  artPlateLabel: string;
  metricsSummary: string;
}

export const HERO_INFOGRAPHIC_SLIDES: HeroInfographicShowcaseSlide[] = [
  {
    id: "chevron-pipeline-slide",
    tabLabel: "1. Chevron Pipeline",
    templateId: 1,
    templateBadge: "Template #1 · 5-Step Chevron Pipeline",
    familyLabel: "PROCESS & STEP FLOWS",
    paletteId: "blue-trust",
    artPlateLabel: "Editorial Daylight Plate",
    metricsSummary: "5 Interlocking Chevrons · Vector Icons · KPI Badges",
  },
  {
    id: "versus-spine-slide",
    tabLabel: "2. VS Battle Card",
    templateId: 6,
    templateBadge: "Template #6 · Central-Spine VS Board",
    familyLabel: "COMPARISON & VERSUS",
    paletteId: "indigo-cyber",
    artPlateLabel: "Royal Indigo Isometric Plate",
    metricsSummary: "Dual Contender Ribbons · Central Icon Spine",
  },
  {
    id: "glass-orbs-kpi-slide",
    tabLabel: "3. KPI Glass Orbs",
    templateId: 11,
    templateBadge: "Template #11 · Glassmorphic KPI Orbs",
    familyLabel: "DATA, KPI & STAT CALLOUTS",
    paletteId: "amber-executive",
    artPlateLabel: "3D Obsidian Glass Orbs Plate",
    metricsSummary: "$5.4M Revenue · 91.4% Retention · $420 CAC",
  },
  {
    id: "interlocking-gears-slide",
    tabLabel: "4. Growth Gears",
    templateId: 3,
    templateBadge: "Template #3 · Interlocking Gears System",
    familyLabel: "PROCESS & STEP FLOWS",
    paletteId: "slate-minimal",
    artPlateLabel: "Architectural Paper Plate",
    metricsSummary: "5 Mechanical Gears · Alternating Callout Pointers",
  },
  {
    id: "survey-bar-chart-slide",
    tabLabel: "5. Stats + Bar Chart",
    templateId: 12,
    templateBadge: "Template #12 · 2×2 Stat Cards + Bar Chart",
    familyLabel: "DATA, KPI & STAT CALLOUTS",
    paletteId: "cyan-tech",
    artPlateLabel: "Cyan Systems Glass Plate",
    metricsSummary: "4 Clipboard Stat Cards + Vertical Multi-Bar Graph",
  },
];

const CYCLE_MS = 3600;

function dispatchSelectTemplate(
  slide: HeroInfographicShowcaseSlide,
  loadSampleData = true
) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("select-blog-infographic-template", {
      detail: {
        templateId: slide.templateId,
        paletteId: slide.paletteId,
        loadSampleData,
      },
    })
  );
  const el = document.getElementById("tool-studio-workspace");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function LiveHeroInfographicCanvas({
  templateId,
  paletteId,
  plateVersion,
}: {
  templateId: number;
  paletteId: BlogInfographicConfig["paletteId"];
  plateVersion: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const sample = createSampleInfographicConfig(templateId, paletteId);
    renderBlogInfographicToCanvas(canvasRef.current, sample, {
      scale: 0.55,
      showVectorIcons: true,
    });
  }, [templateId, paletteId, plateVersion]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`Live preview of infographic template #${templateId}`}
      className="block h-full w-full object-contain"
    />
  );
}

export default function HeroAnimatedInfographicShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [plateVersion, setPlateVersion] = useState(0);

  useEffect(() => {
    preloadInfographicArtPlates(() => {
      setPlateVersion((v) => v + 1);
    });
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      setActiveIdx((prev) => (prev + 1) % HERO_INFOGRAPHIC_SLIDES.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const activeSlide =
    HERO_INFOGRAPHIC_SLIDES[activeIdx] || HERO_INFOGRAPHIC_SLIDES[0];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="rounded-3xl border border-white/15 bg-slate-950/80 p-3.5 shadow-2xl backdrop-blur-md"
    >
      {/* Top clickable infographic family tabs */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex flex-wrap gap-1">
          {HERO_INFOGRAPHIC_SLIDES.map((s, idx) => {
            const isAct = idx === activeIdx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold transition ${
                  isAct
                    ? "bg-gradient-to-r from-[#3452D1] to-[#6366F1] text-white shadow-md shadow-indigo-500/30"
                    : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                }`}
              >
                {s.tabLabel}
              </button>
            );
          })}
        </div>
        <span className="hidden items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 sm:inline-flex">
          <Sparkles size={11} /> 25 Infographic Layouts
        </span>
      </div>

      {/* Fixed-height stage (h-[365px] sm:h-[380px]) rendering real composite infographics */}
      <div className="relative h-[365px] w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#050814] sm:h-[380px]">
        {HERO_INFOGRAPHIC_SLIDES.map((s, idx) => {
          const isAct = idx === activeIdx;
          return (
            <div
              key={s.id}
              aria-hidden={!isAct}
              className={`absolute inset-0 flex flex-col justify-between p-3 transition-all duration-500 ${
                isAct
                  ? "pointer-events-auto z-20 scale-100 opacity-100"
                  : "pointer-events-none z-10 scale-[0.98] opacity-0"
              }`}
            >
              {/* Top Infographic Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-slate-900/90 px-3 py-1.5 text-[10px]">
                <span className="inline-flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-indigo-300">
                  {s.templateId === 6 ? (
                    <GitCompare size={12} className="text-emerald-400" />
                  ) : s.templateId === 11 || s.templateId === 12 ? (
                    <BarChart3 size={12} className="text-amber-400" />
                  ) : (
                    <Workflow size={12} className="text-cyan-400" />
                  )}
                  <span>{s.templateBadge}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="hidden rounded-md bg-white/10 px-2 py-0.5 font-semibold text-slate-300 sm:inline">
                    {s.artPlateLabel}
                  </span>
                  <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 font-black text-indigo-200">
                    16:9 · 1:1 · 4:5 · 9:16
                  </span>
                </div>
              </div>

              {/* Center Live Composite Infographic Canvas Preview */}
              <div
                onClick={() => dispatchSelectTemplate(s, true)}
                title="Click to load and customize this infographic in the studio below"
                className="group relative my-2 flex min-h-0 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-slate-950 p-1.5 shadow-inner"
              >
                <LiveHeroInfographicCanvas
                  templateId={s.templateId}
                  paletteId={s.paletteId}
                  plateVersion={plateVersion}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="rounded-full bg-slate-950/90 px-3.5 py-1 text-[11px] font-extrabold text-amber-300 shadow-lg ring-1 ring-amber-400/40">
                    Click to open Template #{s.templateId} in Studio ↓
                  </span>
                </div>
              </div>

              {/* Slide Footer */}
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/95 px-3 py-2 text-[11px] text-white">
                <span className="inline-flex items-center gap-1.5 truncate font-bold text-slate-200">
                  <ShieldCheck size={13} className="shrink-0 text-emerald-400" />
                  <span className="truncate">{s.metricsSummary}</span>
                </span>
                <button
                  type="button"
                  onClick={() => dispatchSelectTemplate(s, true)}
                  className="inline-flex shrink-0 items-center gap-1 font-extrabold text-amber-300 hover:underline"
                >
                  <span>Load #{s.templateId}</span>
                  <ArrowDownRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom quick-action bar */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <span className="inline-flex items-center gap-1.5 font-bold text-slate-300">
          <CheckCircle2 size={13} className="text-emerald-400" />
          <span>
            <strong className="text-white">Brand Logo + Vector Charts</strong> ·
            No generic stock avatars
          </span>
        </span>
        <button
          type="button"
          onClick={() => dispatchSelectTemplate(activeSlide, true)}
          className="inline-flex items-center gap-1 font-extrabold text-[#93a8ff] hover:text-white hover:underline"
        >
          <Layers size={13} />
          <span>Customize this infographic in Studio ↓</span>
        </button>
      </div>
    </div>
  );
}

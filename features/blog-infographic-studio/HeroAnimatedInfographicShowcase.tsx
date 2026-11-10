"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowDownRight,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { BlogInfographicConfig } from "@/lib/blog-writer/canonical-state";
import type { MalePortraitPresetId } from "@/features/quote-stat-testimonial-card-studio/model";

export interface HeroInfographicShowcaseSlide {
  id: string;
  tabLabel: string;
  templateId: number;
  templateBadge: string;
  familyLabel: string;
  paletteId: BlogInfographicConfig["paletteId"];
  portraitPreset: MalePortraitPresetId;
  headline: string;
  subheadline: string;
  accentHex: string;
  dark: boolean;
  bgHex: string;
  borderHex: string;
  authorName: string;
  authorRole: string;
  imageSrc: string;
  nodes: { badge: string; title: string; metric: string; detail: string }[];
}

export const HERO_INFOGRAPHIC_SLIDES: HeroInfographicShowcaseSlide[] = [
  {
    id: "pipeline-slide",
    tabLabel: "1. 4-Step Pipeline",
    templateId: 1,
    templateBadge: "Template #1 · Process Flow",
    familyLabel: "PROCESS & STEP FLOWS",
    paletteId: "indigo-cyber",
    portraitPreset: "sufian-founder",
    headline: "4-Stage Autonomous Blog & Visual SEO Pipeline",
    subheadline: "Turn 1 keyword into a 2,000-word article + editable H2 diagrams",
    accentHex: "#6366F1",
    dark: true,
    bgHex: "#0B1120",
    borderHex: "#4F46E5",
    authorName: "Sufian Mustafa",
    authorRole: "Founder · DoItWithAI.tools",
    imageSrc: "/images/testimonials/sufian-executive.png",
    nodes: [
      { badge: "01", title: "Intent & Cluster", metric: "<10ms", detail: "Primary keyword + LSI entities" },
      { badge: "02", title: "<580px Meta Pack", metric: "512px", detail: "Zero SERP ellipsis truncation" },
      { badge: "03", title: "25 H2 Diagrams", metric: "$0 API", detail: "Editable Canvas & vector SVG" },
      { badge: "04", title: "JSON-LD @graph", metric: "100 CWV", detail: "BlogPosting + FAQPage schema" },
    ],
  },
  {
    id: "versus-slide",
    tabLabel: "2. Versus Battle Card",
    templateId: 6,
    templateBadge: "Template #6 · Head-to-Head VS",
    familyLabel: "COMPARISON & VERSUS",
    paletteId: "emerald-growth",
    portraitPreset: "marcus-saas-vp",
    headline: "Raw Diffusion AI Art vs. 25-Template Infographic Studio",
    subheadline: "Why deterministic HTML5/SVG diagrams beat garbled raster images",
    accentHex: "#10B981",
    dark: true,
    bgHex: "#062220",
    borderHex: "#10B981",
    authorName: "Marcus Vance",
    authorRole: "VP of Growth · VeloCloud AI",
    imageSrc: "/images/testimonials/marcus-executive.png",
    nodes: [
      { badge: "OLD", title: "Diffusion Image Prompts", metric: "42/100", detail: "Misspelled labels & flat pixels" },
      { badge: "WIN", title: "25-Template Studio", metric: "99/100", detail: "100% live-editable text & SVG" },
    ],
  },
  {
    id: "bento-kpi-slide",
    tabLabel: "3. 4-KPI Bento Grid",
    templateId: 11,
    templateBadge: "Template #11 · Bento KPI Grid",
    familyLabel: "DATA, KPI & STAT CALLOUTS",
    paletteId: "amber-executive",
    portraitPreset: "tariq-growth-lead",
    headline: "2026 Organic SEO Impact of Visual H2 Diagrams",
    subheadline: "Verified dwell-time & AI Overview citation benchmarks",
    accentHex: "#F59E0B",
    dark: true,
    bgHex: "#0F172A",
    borderHex: "#F59E0B",
    authorName: "Tariq Al-Mansoor",
    authorRole: "Head of Acquisition · Apex B2B",
    imageSrc: "/images/testimonials/tariq-executive.png",
    nodes: [
      { badge: "DWELL", title: "+64% Reader Time", metric: "2.4x", detail: "Scannable diagrams under H2s" },
      { badge: "CWV", title: "Zero Layout Shift", metric: "0.00 CLS", detail: "Explicit width/height attributes" },
      { badge: "COST", title: "Zero Token Burn", metric: "$0.00", detail: "Pure client-side Canvas + SVG" },
      { badge: "AEO", title: "AI Overview Ready", metric: "+38%", detail: "Structured alt & schema data" },
    ],
  },
  {
    id: "pyramid-slide",
    tabLabel: "4. 3-Tier Pyramid",
    templateId: 17,
    templateBadge: "Template #17 · Authority Pyramid",
    familyLabel: "FRAMEWORKS & PYRAMIDS",
    paletteId: "blue-trust",
    portraitPreset: "daniel-founder",
    headline: "The 3-Tier Topical Authority & Visual Proof Pyramid",
    subheadline: "Boardroom daylight palette for B2B guides & executive playbooks",
    accentHex: "#3452D1",
    dark: false,
    bgHex: "#F8FAFC",
    borderHex: "#3452D1",
    authorName: "Daniel Mercer",
    authorRole: "Founder · NorthStar Analytics",
    imageSrc: "/images/testimonials/daniel-executive.png",
    nodes: [
      { badge: "APEX", title: "1. Original Benchmarks & Interactive Quizzes", metric: "Tier 1", detail: "Earned backlinks & citations" },
      { badge: "CORE", title: "2. Custom H2 Infographic Diagrams (25 Layouts)", metric: "Tier 2", detail: "Visual retention & shareability" },
      { badge: "BASE", title: "3. Semantic Keyword Cluster & JSON-LD @graph", metric: "Tier 3", detail: "Crawl & index foundation" },
    ],
  },
  {
    id: "hero-og-slide",
    tabLabel: "5. Hero + Ring Portrait",
    templateId: 25,
    templateBadge: "Template #25 · Blog Hero & OG",
    familyLabel: "HERO, OG & QUOTE CARDS",
    paletteId: "cyan-tech",
    portraitPreset: "sufian-founder",
    headline: "Widescreen 16:9 Blog Hero & 1200×630 OpenGraph Card",
    subheadline: "Concentric ring executive portrait + brand logo + metric badges",
    accentHex: "#22D3EE",
    dark: true,
    bgHex: "#061826",
    borderHex: "#06B6D4",
    authorName: "Sufian Mustafa",
    authorRole: "Founder · DoItWithAI.tools",
    imageSrc: "/images/testimonials/sufian-executive.png",
    nodes: [
      { badge: "HERO", title: "1600×900 Widescreen", metric: "16:9 HD", detail: "Featured image & social share" },
      { badge: "RING", title: "Framed Author Portrait", metric: "Auto-Cut", detail: "Circle-in-Ring or Arch mask" },
    ],
  },
];

const CYCLE_MS = 3200;

function dispatchSelectTemplate(slide: HeroInfographicShowcaseSlide) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("select-blog-infographic-template", {
      detail: {
        templateId: slide.templateId,
        paletteId: slide.paletteId,
        portraitPreset: slide.portraitPreset,
      },
    })
  );
  const el = document.getElementById("tool-studio-workspace");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function HeroAnimatedInfographicShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      setActiveIdx((prev) => (prev + 1) % HERO_INFOGRAPHIC_SLIDES.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const activeSlide = HERO_INFOGRAPHIC_SLIDES[activeIdx] || HERO_INFOGRAPHIC_SLIDES[0];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="rounded-3xl border border-white/15 bg-slate-950/75 p-3.5 shadow-2xl backdrop-blur-md"
    >
      {/* Top clickable template pills */}
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
                    ? "bg-[#5271ff] text-white shadow"
                    : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                }`}
              >
                {s.tabLabel}
              </button>
            );
          })}
        </div>
        <span className="hidden items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 sm:inline-flex">
          <Sparkles size={11} /> 25 Live Layouts
        </span>
      </div>

      {/* Fixed-height stage (h-[365px] sm:h-[380px]) so hero height never jumps */}
      <div className="relative h-[365px] w-full overflow-hidden rounded-2xl sm:h-[380px]">
        {HERO_INFOGRAPHIC_SLIDES.map((s, idx) => {
          const isAct = idx === activeIdx;
          return (
            <div
              key={s.id}
              aria-hidden={!isAct}
              style={{
                backgroundColor: s.bgHex,
                borderColor: s.borderHex,
                color: s.dark ? "#F8FAFC" : "#0F172A",
              }}
              className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border-[2.5px] p-4 transition-all duration-500 ${
                isAct
                  ? "pointer-events-auto z-20 scale-100 opacity-100"
                  : "pointer-events-none z-10 scale-[0.98] opacity-0"
              }`}
            >
              {/* Slide Header */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    style={{
                      backgroundColor: `${s.accentHex}22`,
                      borderColor: `${s.accentHex}66`,
                      color: s.dark ? "#FFFFFF" : s.accentHex,
                    }}
                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider"
                  >
                    <Layers size={11} /> {s.templateBadge}
                  </span>
                  <span className="rounded-full bg-slate-900/90 px-2.5 py-0.5 text-[10px] font-black text-white">
                    16:9 · 1:1 · 4:5 · 9:16
                  </span>
                </div>

                <h3 className="mt-2 line-clamp-1 text-base font-black tracking-tight sm:text-lg">
                  {s.headline}
                </h3>
                <p
                  className={`line-clamp-1 text-[11px] font-medium ${
                    s.dark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {s.subheadline}
                </p>
              </div>

              {/* Slide Middle: Left Diagram Nodes + Right Architectural Ring Portrait */}
              <div className="my-2 grid min-h-0 flex-1 grid-cols-12 items-center gap-3">
                <div className="col-span-8 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {s.nodes.map((n) => (
                    <div
                      key={n.badge + n.title}
                      style={{
                        borderColor: `${s.accentHex}55`,
                        backgroundColor: s.dark ? "rgba(15,23,42,0.78)" : "#FFFFFF",
                      }}
                      className="rounded-xl border p-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          style={{
                            backgroundColor: `${s.accentHex}25`,
                            color: s.dark ? "#FFFFFF" : s.accentHex,
                          }}
                          className="rounded px-1.5 py-0.5 font-mono text-[9px] font-black"
                        >
                          {n.badge}
                        </span>
                        <span
                          style={{ backgroundColor: s.accentHex }}
                          className="rounded-full px-2 py-0.5 text-[9px] font-extrabold text-white"
                        >
                          {n.metric}
                        </span>
                      </div>
                      <div className="mt-1 truncate text-xs font-extrabold">{n.title}</div>
                      <div
                        className={`truncate text-[10px] ${
                          s.dark ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {n.detail}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column: Concentric Ring Framed Male Executive Portrait */}
                <div className="col-span-4 flex flex-col items-center justify-center">
                  <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
                    <span
                      style={{ borderColor: `${s.accentHex}55` }}
                      className="absolute inset-0 rounded-full border-2 border-dashed"
                    />
                    <span
                      style={{ borderColor: s.accentHex }}
                      className="absolute inset-2 rounded-full border-2 opacity-75"
                    />
                    <div
                      style={{ borderColor: s.accentHex }}
                      className="relative h-20 w-20 overflow-hidden rounded-full border-[3px] bg-slate-800 shadow-lg sm:h-24 sm:w-24"
                    >
                      <Image
                        src={s.imageSrc}
                        alt={s.authorName}
                        fill
                        sizes="96px"
                        priority={idx === 0}
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                  <div className="mt-1.5 text-center">
                    <div className="truncate text-[11px] font-extrabold">{s.authorName}</div>
                    <div
                      className={`truncate text-[9px] font-semibold ${
                        s.dark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {s.authorRole}
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide Footer */}
              <div className="flex items-center justify-between rounded-xl bg-slate-950/90 px-3 py-2 text-[11px] text-white">
                <span className="inline-flex items-center gap-1.5 font-bold text-slate-200">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>DoItWithAI.tools · Zero-Token HTML5 &amp; SVG Engine</span>
                </span>
                <button
                  type="button"
                  onClick={() => dispatchSelectTemplate(s)}
                  className="inline-flex items-center gap-1 font-extrabold text-amber-300 hover:underline"
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
          <span>{activeSlide.templateBadge} · Click any tab to preview</span>
        </span>
        <button
          type="button"
          onClick={() => dispatchSelectTemplate(activeSlide)}
          className="inline-flex items-center gap-1 font-extrabold text-[#93a8ff] hover:text-white hover:underline"
        >
          <span>Customize this layout in Studio ↓</span>
        </button>
      </div>
    </div>
  );
}

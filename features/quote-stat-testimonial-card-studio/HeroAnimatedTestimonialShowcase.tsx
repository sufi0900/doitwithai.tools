"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowDownRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import type {
  MalePortraitPresetId,
  QuoteVisualTemplateId,
} from "./model";

/**
 * Hero preview carousel — shows 5 distinct, architecturally framed cards
 * produced by the Free AI Testimonial Card Generator.
 *
 * CRITICAL FIXES:
 * 1. Every portrait is clipped inside its exact architectural container
 *    (Rounded Arch Frame, Concentric Ring Inner Circle, Editorial Rounded Frame,
 *    or Full-Bleed Split Panel with Gradient Seam)—eliminating any mismatched
 *    rectangular gray background box.
 * 2. Clicking any slide tab or "Load This Template in Studio" immediately
 *    activates that exact template and color theme in the studio below.
 */

export type HeroSlideStyle =
  | "arch"
  | "rings"
  | "editorial"
  | "bleed"
  | "kpi-ring";

export type HeroShowcaseSlide = {
  id: string;
  label: string;
  style: HeroSlideStyle;
  templateId: QuoteVisualTemplateId;
  portraitPreset: MalePortraitPresetId;
  quote: string;
  highlight: string;
  quoteAfter: string;
  statCallout?: string;
  personName: string;
  personRole: string;
  brand: string;
  badges: string[];
  imageSrc: string;
  accent: string;
};

export const HERO_SHOWCASE_SLIDES: HeroShowcaseSlide[] = [
  {
    id: "arch-marcus",
    label: "1. Arch Frame",
    style: "arch",
    templateId: "arch-aura-split",
    portraitPreset: "marcus-saas-vp",
    quote: "We pasted a client review, picked an arch frame and ",
    highlight: "exported a branded testimonial card in 30 seconds",
    quoteAfter: " with our logo and hex colors.",
    personName: "Marcus Vance",
    personRole: "VP of Growth · VeloCloud AI",
    brand: "VELOCLOUD",
    badges: ["Verified Customer", "2.8x Lift"],
    imageSrc: "/images/testimonials/marcus-executive.png",
    accent: "#EA580C",
  },
  {
    id: "rings-tariq",
    label: "2. Circle in Ring",
    style: "rings",
    templateId: "obsidian-gold-rings",
    portraitPreset: "tariq-growth-lead",
    quote: "Upload any portrait photo and ",
    highlight: "fit it cleanly inside concentric brand rings",
    quoteAfter: " with real-time up, down, zoom and radius sliders.",
    personName: "Tariq Al-Mansoor",
    personRole: "Head of Acquisition · Apex B2B",
    brand: "APEX B2B",
    badges: ["Ring Frame", "Pan & Zoom", "1080p HD"],
    imageSrc: "/images/testimonials/tariq-executive.png",
    accent: "#F59E0B",
  },
  {
    id: "editorial-daniel",
    label: "3. Editorial Grid",
    style: "editorial",
    templateId: "editorial-dot-grid",
    portraitPreset: "daniel-founder",
    quote: "Our logo, our brand palette, our customer's photo: ",
    highlight: "all 14 templates update live",
    quoteAfter: " across 1:1 Square, 4:5 LinkedIn and 16:9 Decks.",
    personName: "Daniel Mercer",
    personRole: "Founder · NorthStar Analytics",
    brand: "NORTHSTAR",
    badges: ["14 Templates", "Custom Logo", "Zero Watermark"],
    imageSrc: "/images/testimonials/daniel-executive.png",
    accent: "#059669",
  },
  {
    id: "bleed-sufian",
    label: "4. Full-Bleed Split",
    style: "bleed",
    templateId: "full-bleed-portrait",
    portraitPreset: "sufian-founder",
    quote: "Paste any article URL or review, pick a template and ",
    highlight: "do it with AI in one visual studio",
    quoteAfter: " ready for landing pages and social proof.",
    personName: "Sufian Mustafa",
    personRole: "Founder · DoItWithAI.tools",
    brand: "DOITWITHAI",
    badges: ["Custom Photo & Logo", "Free Commercial Use"],
    imageSrc: "/images/testimonials/sufian-executive.png",
    accent: "#5271FF",
  },
  {
    id: "kpi-marcus",
    label: "5. KPI Stat + Ring",
    style: "kpi-ring",
    templateId: "kpi-stat-portrait",
    portraitPreset: "marcus-saas-vp",
    statCallout: "2.8x",
    quote: "Pairing an oversized ROI metric with a ",
    highlight: "verified customer portrait inside a radar ring",
    quoteAfter: " made our B2B case study cards impossible to ignore.",
    personName: "Marcus Vance",
    personRole: "VP of Growth · VeloCloud AI",
    brand: "VELOCLOUD",
    badges: ["KPI Stat Card", "PNG · SVG · PDF"],
    imageSrc: "/images/testimonials/marcus-executive.png",
    accent: "#38BDF8",
  },
];

const STYLE_TOKENS: Record<
  HeroSlideStyle,
  {
    bg: string;
    border: string;
    text: string;
    sub: string;
    footer: string;
    dark: boolean;
  }
> = {
  arch: {
    bg: "#FAF8F5",
    border: "#261546",
    text: "#1E1B2E",
    sub: "#5B5870",
    footer: "#261546",
    dark: false,
  },
  rings: {
    bg: "#0F172A",
    border: "#F59E0B",
    text: "#F8FAFC",
    sub: "#94A3B8",
    footer: "#070D19",
    dark: true,
  },
  editorial: {
    bg: "#FDFBF7",
    border: "#064E3B",
    text: "#111827",
    sub: "#4B5563",
    footer: "#064E3B",
    dark: false,
  },
  bleed: {
    bg: "#0B132B",
    border: "#4361EE",
    text: "#FFFFFF",
    sub: "#A9B6D8",
    footer: "#060B19",
    dark: true,
  },
  "kpi-ring": {
    bg: "#0B132B",
    border: "#38BDF8",
    text: "#F8FAFC",
    sub: "#94A3B8",
    footer: "#060B19",
    dark: true,
  },
};

const CYCLE_MS = 3200;

function triggerStudioTemplate(slide: HeroShowcaseSlide) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("select-testimonial-template", {
      detail: {
        template: slide.templateId,
        portraitPreset: slide.portraitPreset,
        accent: slide.accent,
      },
    }),
  );
  const el = document.getElementById("tool-studio-workspace");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SlideCard({
  s,
  eager,
  onSelect,
}: {
  s: HeroShowcaseSlide;
  eager: boolean;
  onSelect: () => void;
}) {
  const t = STYLE_TOKENS[s.style];

  return (
    <div
      style={{
        backgroundColor: t.bg,
        borderColor: t.border,
        color: t.text,
      }}
      className="flex h-full flex-col justify-between overflow-hidden rounded-3xl border-[3px] shadow-2xl"
    >
      <div className="relative grid min-h-0 flex-1 grid-cols-12 items-center">
        <div className="relative z-20 col-span-7 flex flex-col justify-center py-4 pl-5 pr-2 sm:pl-6">
          <div className="flex items-center gap-2">
            <span
              style={{ color: s.accent }}
              className="font-serif text-5xl font-black leading-none select-none"
            >
              “
            </span>
            <span
              className="flex items-center gap-0.5 text-amber-400"
              aria-label="5 out of 5 stars"
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={13} fill="currentColor" />
              ))}
            </span>
          </div>

          {s.statCallout && (
            <div className="mt-1 flex items-baseline gap-2">
              <span
                style={{ color: s.accent }}
                className="text-3xl font-black tracking-tight sm:text-4xl"
              >
                {s.statCallout}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-75">
                Verified ROI Metric
              </span>
            </div>
          )}

          <p className="mt-1.5 text-[13.5px] font-extrabold leading-[1.42] tracking-tight sm:text-[15px]">
            {s.quote}
            <span
              style={{
                color: t.dark ? "#FFFFFF" : s.accent,
                backgroundColor: t.dark ? `${s.accent}38` : `${s.accent}1E`,
              }}
              className="rounded px-1.5 py-0.5 font-black"
            >
              {s.highlight}
            </span>
            {s.quoteAfter}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {s.badges.map((b) => (
              <span
                key={b}
                style={{
                  borderColor: `${s.accent}66`,
                  backgroundColor: `${s.accent}16`,
                  color: t.dark ? "#FFFFFF" : s.accent,
                }}
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold"
              >
                <CheckCircle2 size={10} /> {b}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 col-span-5 flex h-full items-center justify-center overflow-hidden p-2">
          {s.style === "arch" && (
            <div className="relative flex h-full w-full items-end justify-center pt-3">
              <div
                style={{
                  backgroundColor: `${s.accent}22`,
                  borderColor: s.accent,
                }}
                className="relative h-[220px] w-[158px] overflow-hidden rounded-t-full rounded-b-2xl border-[3px] shadow-xl sm:h-[232px] sm:w-[168px]"
              >
                <Image
                  src={s.imageSrc}
                  alt={`${s.personName} portrait`}
                  fill
                  sizes="180px"
                  priority={eager}
                  className="scale-105 object-cover object-top"
                />
              </div>
            </div>
          )}

          {(s.style === "rings" || s.style === "kpi-ring") && (
            <div className="relative flex h-full w-full items-center justify-center">
              <div
                style={{ borderColor: `${s.accent}38` }}
                className="pointer-events-none absolute h-[186px] w-[186px] rounded-full border-2 sm:h-[198px] sm:w-[198px]"
              />
              <div
                style={{ borderColor: `${s.accent}66` }}
                className="pointer-events-none absolute h-[162px] w-[162px] rounded-full border-2 sm:h-[172px] sm:w-[172px]"
              />
              <div
                style={{
                  borderColor: s.accent,
                  boxShadow: `0 0 28px ${s.accent}44`,
                }}
                className="relative z-10 h-[136px] w-[136px] overflow-hidden rounded-full border-[3.5px] bg-slate-800 sm:h-[146px] sm:w-[146px]"
              >
                <Image
                  src={s.imageSrc}
                  alt={`${s.personName} portrait`}
                  fill
                  sizes="160px"
                  priority={eager}
                  className="scale-110 object-cover object-top"
                />
              </div>
            </div>
          )}

          {s.style === "editorial" && (
            <div className="relative flex h-full w-full items-center justify-center">
              <div
                style={{
                  backgroundImage: `radial-gradient(${s.accent} 1.7px, transparent 1.7px)`,
                  backgroundSize: "12px 12px",
                }}
                className="pointer-events-none absolute right-2 top-3 h-24 w-24 opacity-45"
              />
              <div
                style={{ backgroundColor: `${s.accent}24` }}
                className="pointer-events-none absolute h-[196px] w-[150px] translate-x-2 translate-y-2 rounded-3xl"
              />
              <div
                style={{ borderColor: s.accent }}
                className="relative z-10 h-[196px] w-[150px] overflow-hidden rounded-3xl border-[3px] bg-slate-800 shadow-xl sm:h-[206px] sm:w-[158px]"
              >
                <Image
                  src={s.imageSrc}
                  alt={`${s.personName} portrait`}
                  fill
                  sizes="170px"
                  priority={eager}
                  className="scale-105 object-cover object-top"
                />
              </div>
            </div>
          )}

          {s.style === "bleed" && (
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={s.imageSrc}
                alt={`${s.personName} portrait`}
                fill
                sizes="220px"
                priority={eager}
                className="scale-105 object-cover object-top"
              />
              <div
                style={{
                  background: `linear-gradient(90deg, ${t.bg} 0%, ${t.bg}B8 32%, transparent 100%)`,
                }}
                className="pointer-events-none absolute inset-y-0 left-0 w-2/5"
              />
              <div
                style={{
                  background: `linear-gradient(180deg, transparent 65%, ${t.footer} 100%)`,
                }}
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
              />
            </div>
          )}
        </div>
      </div>

      <div
        style={{ backgroundColor: t.footer }}
        className="relative z-20 flex items-center justify-between gap-2 px-5 py-2.5 text-white"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            style={{ borderColor: s.accent }}
            className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border-2 bg-slate-800"
          >
            <Image
              src={s.imageSrc}
              alt=""
              fill
              sizes="36px"
              className="object-cover object-top"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="truncate text-xs font-black">
                {s.personName}
              </span>
              <ShieldCheck size={13} style={{ color: s.accent }} />
            </div>
            <p className="truncate text-[10px] font-medium text-slate-300">
              {s.personRole}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSelect}
          style={{
            borderColor: `${s.accent}88`,
            backgroundColor: `${s.accent}2E`,
          }}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white transition hover:brightness-125"
        >
          <span>{s.brand}</span>
          <ArrowDownRight size={11} />
        </button>
      </div>
    </div>
  );
}

export default function HeroAnimatedTestimonialShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setActive((p) => (p + 1) % HERO_SHOWCASE_SLIDES.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const currentSlide = HERO_SHOWCASE_SLIDES[active];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative mx-auto w-full max-w-[490px]"
      aria-label="Interactive AI testimonial card template showcase"
    >
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-1.5 px-0.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-extrabold text-white backdrop-blur-xs">
          <Sparkles size={12} className="animate-pulse text-amber-300" />
          Live Framed Templates
        </span>

        <div
          className="flex flex-wrap items-center gap-1"
          role="tablist"
          aria-label="Preview testimonial card templates"
        >
          {HERO_SHOWCASE_SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={active === i}
              onClick={() => setActive(i)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold transition ${
                active === i
                  ? "bg-white text-slate-900 shadow-xs"
                  : "bg-white/10 text-slate-200 hover:bg-white/25"
              }`}
            >
              {s.label.split(". ")[1]}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[365px] sm:h-[380px]">
        {HERO_SHOWCASE_SLIDES.map((s, i) => {
          const on = active === i;
          return (
            <div
              key={s.id}
              aria-hidden={!on}
              className={`absolute inset-0 transition-all duration-500 ease-out ${
                on
                  ? "z-10 translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none z-0 translate-y-2 scale-[0.98] opacity-0"
              }`}
            >
              <SlideCard
                s={s}
                eager={i === 0}
                onSelect={() => triggerStudioTemplate(s)}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center justify-between px-1 text-[11px] text-slate-300">
        <span>
          Previewing: <strong className="text-white">{currentSlide.label}</strong>
        </span>
        <button
          type="button"
          onClick={() => triggerStudioTemplate(currentSlide)}
          className="inline-flex items-center gap-1 font-extrabold text-amber-300 underline-offset-2 hover:underline"
        >
          Customize this layout in Studio ↓
        </button>
      </div>
    </div>
  );
}

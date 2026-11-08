"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, Sparkles, Star } from "lucide-react";

export type HeroShowcaseSlide = {
  id: string;
  templateType: "coral-arch" | "emerald-editorial" | "obsidian-gold" | "royal-indigo";
  quote: string;
  highlightText: string;
  quoteAfter: string;
  personName: string;
  personRole: string;
  companyName: string;
  ratingText: string;
  badge1: string;
  badge2: string;
  badge3?: string;
  imageSrc: string;
  accentColor: string;
  cardBg: string;
  borderColor: string;
};

export const HERO_SHOWCASE_SLIDES: HeroShowcaseSlide[] = [
  {
    id: "marcus-coral-arch",
    templateType: "coral-arch",
    quote: "My 'after' photo looks so polished my coworkers asked which photographer I used. ",
    highlightText: "It was an app that lifted demo signups by 2.8x",
    quoteAfter: " in our very first two-week sprint.",
    personName: "Marcus Vance",
    personRole: "VP of Growth · B2B SaaS",
    companyName: "VeloCloud AI",
    ratingText: "★★★★★",
    badge1: "Professional results",
    badge2: "Zero hassle",
    imageSrc: "/images/testimonials/marcus-executive.png",
    accentColor: "#EA580C",
    cardBg: "#FAF8F5",
    borderColor: "#261546",
  },
  {
    id: "daniel-emerald-editorial",
    templateType: "emerald-editorial",
    quote: "Skipped the studio, skipped the awkward posing, ",
    highlightText: "still got a headshot my whole team was jealous of",
    quoteAfter: " in under 60 seconds with our exact brand hex colors.",
    personName: "Diego / Daniel Mercer",
    personRole: "Startup Founder & Consultant",
    companyName: "NorthStar SEO",
    ratingText: "★★★★★",
    badge1: "Professional Quality",
    badge2: "No Studio Needed",
    badge3: "Team Approved",
    imageSrc: "/images/testimonials/daniel-executive.png",
    accentColor: "#059669",
    cardBg: "#FDFBF7",
    borderColor: "#064E3B",
  },
  {
    id: "tariq-obsidian-gold",
    templateType: "obsidian-gold",
    quote: "I needed a professional photo in a weekend for a job pitch. ",
    highlightText: "Aragon-grade visual cards delivered in under an hour",
    quoteAfter: " and cut paid CPA by 34% on LinkedIn & Meta.",
    personName: "Jonah / Tariq Al-Mansoor",
    personRole: "Freelance Consultant · Acquisition Lead",
    companyName: "Apex Commerce",
    ratingText: "★★★★★",
    badge1: "Fast turnaround",
    badge2: "Exceptional quality",
    badge3: "Highly recommended",
    imageSrc: "/images/testimonials/tariq-executive.png",
    accentColor: "#EAB308",
    cardBg: "#0F172A",
    borderColor: "#EAB308",
  },
  {
    id: "sufian-royal-indigo",
    templateType: "royal-indigo",
    quote: "Paste any article URL or customer review, choose a male executive portrait, and ",
    highlightText: "do it with AI in one unified visual studio",
    quoteAfter: " ready for website landing pages, decks, and case studies.",
    personName: "Sufian Mustafa",
    personRole: "Founder · DoItWithAI.tools",
    companyName: "DoItWithAI Studio",
    ratingText: "★★★★★ 5.0",
    badge1: "Custom Photo & Logo",
    badge2: "Free Commercial Use",
    imageSrc: "/images/testimonials/sufian-executive.png",
    accentColor: "#5271FF",
    cardBg: "#0B132B",
    borderColor: "#4361EE",
  },
];

export default function HeroAnimatedTestimonialShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);

  // Snappy 2300ms speed for a fast, engaging visual hook that never gets frozen
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % HERO_SHOWCASE_SLIDES.length);
    }, 2300);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SHOWCASE_SLIDES[activeIdx];

  return (
    <div
      className="relative mx-auto w-full max-w-[460px]"
      aria-label="Live rotating customer testimonial card preview"
    >
      {/* Top Floating Live Studio Badge & Visual Progress Bars */}
      <div className="mb-2.5 flex items-center justify-between px-1">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-extrabold text-white backdrop-blur-xs shadow-xs">
          <Sparkles size={12} className="text-amber-300 animate-pulse" />
          Live Rotating Aragon-Style Testimonials
        </span>

        {/* Snappy Tab Progress Indicators */}
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Showcase slides">
          {HERO_SHOWCASE_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={activeIdx === idx}
              onClick={() => setActiveIdx(idx)}
              aria-label={`Preview template ${idx + 1}: ${s.personName}`}
              className={`relative h-2 overflow-hidden rounded-full transition-all duration-300 ${
                activeIdx === idx
                  ? "w-7 bg-white shadow-xs"
                  : "w-2.5 bg-white/35 hover:bg-white/60"
              }`}
            >
              {activeIdx === idx && (
                <span className="absolute inset-0 bg-gradient-to-r from-amber-300 to-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* DYNAMIC TEMPLATE RENDERER */}
      <div className="relative min-h-[350px] transition-all duration-300">
        {/* TEMPLATE 1: CORAL ARCH AURA (Aragon Screenshot 1) */}
        {slide.templateType === "coral-arch" && (
          <div
            style={{ backgroundColor: slide.cardBg, borderColor: slide.borderColor }}
            className="overflow-hidden rounded-3xl border-[3px] text-slate-900 shadow-2xl transition-all duration-300"
          >
            <div className="grid grid-cols-12 items-end px-5 pt-5 sm:px-6">
              {/* Left 7 Columns */}
              <div className="col-span-7 pb-4 pr-2">
                <span
                  style={{ color: slide.accentColor }}
                  className="font-serif text-5xl font-black leading-none select-none"
                >
                  “
                </span>
                <p className="mt-1 text-[13px] font-extrabold leading-[1.42] tracking-tight text-slate-900 sm:text-[14px]">
                  {slide.quote}
                  <span
                    style={{
                      color: slide.accentColor,
                      backgroundColor: `${slide.accentColor}18`,
                    }}
                    className="rounded px-1.5 py-0.5 font-black inline"
                  >
                    {slide.highlightText}
                  </span>
                  {slide.quoteAfter}
                </p>

                <div className="mt-3">
                  <div
                    className="flex items-center gap-0.5 text-xs font-black"
                    style={{ color: slide.accentColor }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} fill="currentColor" />
                    ))}
                  </div>
                  <p className="mt-1 text-[10px] font-bold text-slate-600">
                    {slide.badge1}. {slide.badge2}.
                  </p>
                </div>
              </div>

              {/* Right 5 Columns: Curved Coral Arch Aura Backdrop */}
              <div className="col-span-5 relative flex h-[200px] items-end justify-center overflow-hidden">
                {/* Curved Coral Arch shape */}
                <div
                  style={{ backgroundColor: `${slide.accentColor}25` }}
                  className="absolute bottom-0 h-[175px] w-[130px] rounded-t-full"
                />
                <img
                  src={slide.imageSrc}
                  alt={slide.personName}
                  className="relative z-10 max-h-[195px] w-auto max-w-full object-contain object-bottom drop-shadow-md"
                />
              </div>
            </div>

            {/* Bottom Dark Plum Footer Bar */}
            <div
              style={{ backgroundColor: slide.borderColor }}
              className="flex items-center justify-between gap-2 px-5 py-3 text-white"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white/80 bg-slate-800">
                  <img
                    src={slide.imageSrc}
                    alt={slide.personName}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-black text-white">
                      {slide.personName}
                    </span>
                    <span
                      style={{ backgroundColor: slide.accentColor }}
                      className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-white"
                    >
                      ✓
                    </span>
                  </div>
                  <p className="truncate text-[10px] font-medium text-slate-300">
                    {slide.personRole}
                  </p>
                </div>
              </div>

              <span
                style={{
                  borderColor: `${slide.accentColor}66`,
                  backgroundColor: `${slide.accentColor}25`,
                }}
                className="shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white"
              >
                {slide.companyName}
              </span>
            </div>
          </div>
        )}

        {/* TEMPLATE 2: EMERALD EDITORIAL WITH 3-PILL BAR (Aragon Screenshot 2) */}
        {slide.templateType === "emerald-editorial" && (
          <div
            style={{ backgroundColor: slide.cardBg, borderColor: slide.borderColor }}
            className="overflow-hidden rounded-3xl border-[3px] text-slate-900 shadow-2xl transition-all duration-300"
          >
            <div className="grid grid-cols-12 items-end px-5 pt-4 sm:px-6">
              {/* Left 7 Columns */}
              <div className="col-span-7 pb-3 pr-2">
                <span
                  style={{ color: slide.accentColor }}
                  className="font-serif text-5xl font-black leading-none select-none"
                >
                  “
                </span>
                <p className="mt-1 text-[13px] font-extrabold leading-[1.42] tracking-tight text-slate-900 sm:text-[14px]">
                  {slide.quote}
                  <span
                    style={{
                      color: slide.accentColor,
                      backgroundColor: `${slide.accentColor}18`,
                    }}
                    className="rounded px-1.5 py-0.5 font-black inline"
                  >
                    {slide.highlightText}
                  </span>
                  {slide.quoteAfter}
                </p>

                {/* Left Author Attribution */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-emerald-600">
                    <img
                      src={slide.imageSrc}
                      alt={slide.personName}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-black text-slate-900">
                      {slide.personName}
                    </p>
                    <p className="truncate text-[9px] text-slate-500">
                      {slide.personRole}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right 5 Columns: Geometric Dot Grid Pattern */}
              <div className="col-span-5 relative flex h-[195px] items-end justify-center overflow-hidden">
                {/* Dot grid pattern */}
                <div
                  style={{
                    backgroundImage: `radial-gradient(${slide.accentColor} 1.5px, transparent 1.5px)`,
                    backgroundSize: "12px 12px",
                  }}
                  className="absolute right-2 top-2 h-24 w-24 opacity-35"
                />
                <img
                  src={slide.imageSrc}
                  alt={slide.personName}
                  className="relative z-10 max-h-[195px] w-auto max-w-full object-contain object-bottom drop-shadow-md"
                />
              </div>
            </div>

            {/* Bottom Full-Width Emerald Bar with 3 Trust Pills */}
            <div
              style={{ backgroundColor: slide.borderColor }}
              className="flex items-center justify-between gap-1 px-4 py-2.5 text-[10px] font-bold text-emerald-100"
            >
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 size={11} className="text-emerald-400" />
                {slide.badge1}
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-400" />
                {slide.badge2}
              </span>
              {slide.badge3 && (
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-400" />
                  {slide.badge3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* TEMPLATE 3: OBSIDIAN & GOLD CONCENTRIC RINGS (Aragon Screenshot 3) */}
        {slide.templateType === "obsidian-gold" && (
          <div
            style={{ backgroundColor: slide.cardBg }}
            className="relative overflow-hidden rounded-3xl border-2 border-slate-700 text-white shadow-2xl transition-all duration-300"
          >
            {/* Golden corner bevel accent in bottom right */}
            <div
              style={{ backgroundColor: slide.accentColor }}
              className="absolute -bottom-6 -right-6 h-14 w-14 rotate-45 pointer-events-none"
            />

            <div className="grid grid-cols-12 items-end p-5 sm:p-6">
              {/* Left 7 Columns */}
              <div className="col-span-7 pb-2 pr-2">
                <div className="flex items-center gap-2">
                  <span
                    style={{ color: slide.accentColor }}
                    className="font-serif text-4xl font-black leading-none select-none"
                  >
                    “
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </div>
                </div>

                <p className="mt-1 text-[13px] font-bold leading-[1.42] tracking-tight text-slate-100 sm:text-[14px]">
                  {slide.quote}
                  <span
                    style={{ color: slide.accentColor }}
                    className="font-black underline decoration-amber-400/50 underline-offset-2"
                  >
                    {slide.highlightText}
                  </span>
                  {slide.quoteAfter}
                </p>

                {/* Subtext badges */}
                <p className="mt-2 text-[10px] font-semibold text-slate-400">
                  {slide.badge1}. {slide.badge2}. {slide.badge3}.
                </p>

                {/* Author Info */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-amber-400">
                    <img
                      src={slide.imageSrc}
                      alt={slide.personName}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-black text-amber-300">
                      {slide.personName}
                    </p>
                    <p className="truncate text-[9px] text-slate-400">
                      {slide.personRole}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right 5 Columns: Concentric Rings / Grooves Frame */}
              <div className="col-span-5 relative flex h-[195px] items-end justify-center overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/90">
                {/* Concentric circular grooves */}
                <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
                  <div className="h-44 w-44 rounded-full border border-amber-400" />
                  <div className="absolute h-32 w-32 rounded-full border border-amber-400" />
                  <div className="absolute h-20 w-20 rounded-full border border-amber-400" />
                </div>
                <img
                  src={slide.imageSrc}
                  alt={slide.personName}
                  className="relative z-10 max-h-[195px] w-auto max-w-full object-contain object-bottom drop-shadow-md"
                />
              </div>
            </div>
          </div>
        )}

        {/* TEMPLATE 4: ROYAL SAPPHIRE GLASSMORPHIC (DoItWithAI Flagship) */}
        {slide.templateType === "royal-indigo" && (
          <div
            style={{ backgroundColor: slide.cardBg, borderColor: slide.borderColor }}
            className="overflow-hidden rounded-3xl border-2 text-white shadow-2xl transition-all duration-300"
          >
            <div className="grid grid-cols-12 items-end px-5 pt-4 sm:px-6">
              {/* Left 7 Columns */}
              <div className="col-span-7 pb-4 pr-2">
                <div className="flex items-center gap-2">
                  <span
                    style={{ color: slide.accentColor }}
                    className="font-serif text-4xl font-black leading-none select-none"
                  >
                    “
                  </span>
                  <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-black text-blue-300 ring-1 ring-blue-400/30">
                    ★ 5.0 Flagship
                  </span>
                </div>

                <p className="mt-1 text-[13px] font-bold leading-[1.42] tracking-tight text-slate-100 sm:text-[14px]">
                  {slide.quote}
                  <span
                    style={{ color: "#93C5FD", backgroundColor: "#3B82F622" }}
                    className="rounded px-1.5 py-0.5 font-black inline"
                  >
                    {slide.highlightText}
                  </span>
                  {slide.quoteAfter}
                </p>

                {/* 2 Trust Badges */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-300">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 ring-1 ring-white/15">
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    {slide.badge1}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 ring-1 ring-white/15">
                    <ShieldCheck size={11} className="text-emerald-400" />
                    {slide.badge2}
                  </span>
                </div>
              </div>

              {/* Right 5 Columns: Indigo Aura Glow */}
              <div className="col-span-5 relative flex h-[195px] items-end justify-center overflow-hidden">
                <div
                  style={{
                    background: "radial-gradient(circle at 50% 60%, rgba(67, 97, 238, 0.45) 0%, transparent 70%)",
                  }}
                  className="absolute inset-0 rounded-t-2xl pointer-events-none"
                />
                <img
                  src={slide.imageSrc}
                  alt={slide.personName}
                  className="relative z-10 max-h-[195px] w-auto max-w-full object-contain object-bottom drop-shadow-md"
                />
              </div>
            </div>

            {/* Bottom Dark Brand Strip */}
            <div className="flex items-center justify-between gap-2 border-t border-slate-800 bg-[#070D1F] px-5 py-3 text-white">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-blue-400 bg-slate-800">
                  <img
                    src={slide.imageSrc}
                    alt={slide.personName}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-black text-white">
                      {slide.personName}
                    </span>
                    <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white">
                      ✓
                    </span>
                  </div>
                  <p className="truncate text-[10px] text-slate-300">
                    {slide.personRole}
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-lg border border-blue-400/40 bg-blue-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-200">
                {slide.companyName}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

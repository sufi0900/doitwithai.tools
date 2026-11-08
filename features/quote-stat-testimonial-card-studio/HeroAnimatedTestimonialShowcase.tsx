"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, ShieldCheck, Sparkles, Star } from "lucide-react";

export type HeroShowcaseSlide = {
  id: string;
  quoteBefore: string;
  quoteHighlight: string;
  quoteAfter: string;
  accentColor: string;
  cardTint: string;
  footerBg: string;
  personName: string;
  personRole: string;
  companyName: string;
  badge1: string;
  badge2: string;
  imageSrc: string;
};

export const HERO_SHOWCASE_SLIDES: HeroShowcaseSlide[] = [
  {
    id: "marcus-b2b-saas",
    imageSrc: "/images/testimonials/marcus-executive.png",
    quoteBefore:
      "Our customer quotes used to sit buried in text walls. Turning them into branded portrait cards ",
    quoteHighlight: "lifted landing page demo signups by 2.8x",
    quoteAfter: " in our very first two-week sprint.",
    accentColor: "#EA580C",
    cardTint: "#FFF7ED",
    footerBg: "#0F172A",
    personName: "Marcus Vance",
    personRole: "VP of Growth · B2B SaaS",
    companyName: "VeloCloud AI",
    badge1: "Verified Customer",
    badge2: "2.8x Conversion Lift",
  },
  {
    id: "daniel-founder",
    imageSrc: "/images/testimonials/daniel-executive.png",
    quoteBefore:
      "I was skeptical a free browser studio could match agency graphics. ",
    quoteHighlight: "Then I exported 5 client testimonial cards",
    quoteAfter:
      " with our exact hex colors and logo in under 60 seconds.",
    accentColor: "#2563EB",
    cardTint: "#EFF6FF",
    footerBg: "#0B1528",
    personName: "Daniel Mercer",
    personRole: "Founder & Principal Consultant",
    companyName: "NorthStar SEO",
    badge1: "100% On-Brand Colors",
    badge2: "Instant 1080p PNG/SVG",
  },
  {
    id: "tariq-ecommerce",
    imageSrc: "/images/testimonials/tariq-executive.png",
    quoteBefore:
      "We added 5-star portrait review cards to our top product pages and ",
    quoteHighlight: "cut paid ad CPA by 34% on LinkedIn & Meta",
    quoteAfter: " without hiring an external design studio.",
    accentColor: "#059669",
    cardTint: "#ECFDF5",
    footerBg: "#062019",
    personName: "Tariq Al-Mansoor",
    personRole: "Head of Digital Acquisition",
    companyName: "Apex Commerce",
    badge1: "Fast Turnaround",
    badge2: "Built for B2B & D2C",
  },
  {
    id: "sufian-architect",
    imageSrc: "/images/testimonials/sufian-executive.png",
    quoteBefore:
      "Paste any article URL or customer review, choose a male executive portrait, and ",
    quoteHighlight: "do it with AI in one unified visual studio",
    quoteAfter: " ready for LinkedIn, sales decks, and case studies.",
    accentColor: "#4F46E5",
    cardTint: "#EEF2FF",
    footerBg: "#111827",
    personName: "Sufian Mustafa",
    personRole: "Founder · DoItWithAI.tools",
    companyName: "DoItWithAI Studio",
    badge1: "Custom Photo & Logo",
    badge2: "Free Commercial Use",
  },
];

export default function HeroAnimatedTestimonialShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % HERO_SHOWCASE_SLIDES.length);
    }, 3400);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = HERO_SHOWCASE_SLIDES[activeIdx];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative mx-auto w-full max-w-[460px]"
      aria-label="Live rotating customer testimonial card preview"
    >
      {/* Top Floating Live Studio Badge & Interactive Indicator Dots */}
      <div className="mb-2.5 flex items-center justify-between px-1">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-extrabold text-white backdrop-blur-xs shadow-xs">
          <Sparkles size={12} className="text-amber-300 animate-pulse" />
          Live Rotating Aragon-Style Testimonials
        </span>
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Showcase slides">
          {HERO_SHOWCASE_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={activeIdx === idx}
              onClick={() => setActiveIdx(idx)}
              aria-label={`Preview card ${idx + 1}: ${s.personName}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIdx === idx
                  ? "w-6 bg-white shadow-xs"
                  : "w-2 bg-white/35 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Aragon-Style Split Portrait Testimonial Card */}
      <div
        style={{ backgroundColor: slide.cardTint }}
        className="overflow-hidden rounded-3xl border-[3px] border-slate-900/90 text-slate-900 shadow-2xl transition-colors duration-500"
      >
        <div className="grid grid-cols-12 items-end px-5 pt-4 sm:px-6 sm:pt-5">
          {/* Left 7 Columns: Quote Mark, 5 Stars, Highlighted Quote & Trust Badges */}
          <div className="col-span-7 pb-4 pr-2">
            <div className="flex items-center gap-2">
              <span
                style={{ color: slide.accentColor }}
                className="font-serif text-4xl font-black leading-none select-none"
              >
                “
              </span>
              <div
                className="flex items-center gap-0.5"
                style={{ color: slide.accentColor }}
                aria-label="5 out of 5 stars"
              >
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="currentColor" />
                ))}
              </div>
            </div>

            <p className="mt-1.5 text-[13px] font-extrabold leading-[1.42] tracking-tight text-slate-900 sm:text-[14px]">
              {slide.quoteBefore}
              <span
                style={{
                  color: slide.accentColor,
                  backgroundColor: `${slide.accentColor}18`,
                }}
                className="rounded px-1.5 py-0.5 font-black inline-block"
              >
                {slide.quoteHighlight}
              </span>
              {slide.quoteAfter}
            </p>

            {/* 2 Mini Trust Badges */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-700">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 shadow-2xs ring-1 ring-slate-900/10">
                <CheckCircle2
                  size={11}
                  style={{ color: slide.accentColor }}
                />
                {slide.badge1}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 shadow-2xs ring-1 ring-slate-900/10">
                <ShieldCheck
                  size={11}
                  style={{ color: slide.accentColor }}
                />
                {slide.badge2}
              </span>
            </div>
          </div>

          {/* Right 5 Columns: Realistic Male Executive Photographic Portrait Cutout */}
          <div className="col-span-5 relative flex h-[196px] items-end justify-center overflow-hidden">
            {/* Subtle brand-accent aura backdrop glow */}
            <div
              style={{
                background: `radial-gradient(circle at 50% 60%, ${slide.accentColor}33 0%, ${slide.accentColor}05 70%, transparent 100%)`,
              }}
              className="absolute inset-0 rounded-t-2xl pointer-events-none"
            />
            {/* High-resolution photographic headshot */}
            <div className="relative h-full w-full flex items-end justify-center">
              <img
                src={slide.imageSrc}
                alt={`Executive male portrait of ${slide.personName}`}
                className="max-h-[196px] w-auto max-w-full object-contain object-bottom drop-shadow-md transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* Bottom Dark Brand Footer Strip with Avatar, Name, Role & Custom Brand Pill */}
        <div
          style={{ backgroundColor: slide.footerBg }}
          className="flex items-center justify-between gap-2 px-5 py-3 text-white transition-colors duration-500"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Real circular photographic avatar */}
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white/80 bg-slate-800 shadow-xs">
              <img
                src={slide.imageSrc}
                alt={slide.personName}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-black tracking-tight text-white">
                  {slide.personName}
                </span>
                <span
                  style={{ backgroundColor: slide.accentColor }}
                  className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-white"
                  title="Verified Customer"
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
              backgroundColor: `${slide.accentColor}22`,
            }}
            className="shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white"
          >
            {slide.companyName}
          </span>
        </div>
      </div>
    </div>
  );
}

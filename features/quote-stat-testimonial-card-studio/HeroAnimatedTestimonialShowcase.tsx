"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, Sparkles, Star } from "lucide-react";

type ShowcaseSlide = {
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
  suitColor: string;
  tieColor: string;
  skinTone: string;
  hairColor: string;
  hasBeard: boolean;
  hasGlasses: boolean;
};

const HERO_SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: "marcus-b2b-saas",
    quoteBefore:
      "Our customer quotes used to sit buried in text walls. Turning them into branded portrait cards ",
    quoteHighlight: "lifted landing page demo signups by 2.8x",
    quoteAfter: " in our very first two-week sprint.",
    accentColor: "#EA580C",
    cardTint: "#FFF7ED",
    footerBg: "#0F172A",
    personName: "Marcus V.",
    personRole: "VP of Growth · B2B SaaS",
    companyName: "VeloCloud AI",
    badge1: "Professional results",
    badge2: "Zero design hassle",
    suitColor: "#1E293B",
    tieColor: "#EA580C",
    skinTone: "#E8B89A",
    hairColor: "#27272A",
    hasBeard: true,
    hasGlasses: false,
  },
  {
    id: "daniel-founder",
    quoteBefore:
      "I was skeptical a free browser studio could match agency graphics. ",
    quoteHighlight: "Then I exported 5 client testimonial cards",
    quoteAfter:
      " with our exact hex colors and logo in under 60 seconds.",
    accentColor: "#2563EB",
    cardTint: "#EFF6FF",
    footerBg: "#0B1528",
    personName: "Daniel K.",
    personRole: "Founder & Principal Consultant",
    companyName: "NorthStar SEO",
    badge1: "100% On-Brand Colors",
    badge2: "Instant 1080p PNG/SVG",
    suitColor: "#0F172A",
    tieColor: "#2563EB",
    skinTone: "#F1C6A7",
    hairColor: "#3F2E21",
    hasBeard: false,
    hasGlasses: true,
  },
  {
    id: "tariq-ecommerce",
    quoteBefore:
      "We added 5-star portrait review cards to our top product pages and ",
    quoteHighlight: "cut paid ad CPA by 34% on LinkedIn & Meta",
    quoteAfter: " without hiring an external studio.",
    accentColor: "#059669",
    cardTint: "#ECFDF5",
    footerBg: "#062019",
    personName: "Tariq A.",
    personRole: "Head of Digital Acquisition",
    companyName: "Apex Commerce",
    badge1: "Fast turnaround",
    badge2: "Built for B2B & D2C",
    suitColor: "#1F2937",
    tieColor: "#10B981",
    skinTone: "#D9A17C",
    hairColor: "#18181B",
    hasBeard: true,
    hasGlasses: false,
  },
  {
    id: "sufian-architect",
    quoteBefore:
      "Paste any article URL or customer review, upload a male executive portrait, and ",
    quoteHighlight: "do it with AI in one unified visual studio",
    quoteAfter: " ready for LinkedIn, sales decks, and case studies.",
    accentColor: "#4F46E5",
    cardTint: "#EEF2FF",
    footerBg: "#111827",
    personName: "Sufian M.",
    personRole: "Founder · DoItWithAI.tools",
    companyName: "DoItWithAI Studio",
    badge1: "Custom Photo & Logo",
    badge2: "Free Commercial Use",
    suitColor: "#1E1B4B",
    tieColor: "#6366F1",
    skinTone: "#DFAC88",
    hairColor: "#18181B",
    hasBeard: true,
    hasGlasses: false,
  },
];

function MaleExecutiveSvgPortrait({
  slide,
  size = "large",
}: {
  slide: ShowcaseSlide;
  size?: "large" | "avatar";
}) {
  const isAvatar = size === "avatar";
  return (
    <svg
      viewBox="0 0 220 260"
      className={
        isAvatar
          ? "h-9 w-9 shrink-0 rounded-full border-2 border-white/80 bg-slate-800 object-cover"
          : "h-full w-full object-cover object-bottom"
      }
      role="img"
      aria-label={`Executive male portrait of ${slide.personName}`}
    >
      <defs>
        <linearGradient id={`bg-${slide.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={slide.accentColor} stopOpacity="0.16" />
          <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {isAvatar && (
        <rect width="220" height="260" fill={slide.suitColor} rx="110" />
      )}
      {!isAvatar && (
        <circle
          cx="118"
          cy="118"
          r="86"
          fill={`url(#bg-${slide.id})`}
        />
      )}
      {/* Suit Shoulders */}
      <path
        d="M20 260 C24 196, 62 176, 110 176 C158 176, 196 196, 200 260 Z"
        fill={slide.suitColor}
      />
      {/* Crisp White Dress Shirt */}
      <polygon points="86,176 134,176 118,242 102,242" fill="#FFFFFF" />
      {/* Executive Tie */}
      <polygon
        points="104,182 116,182 120,238 110,250 100,238"
        fill={slide.tieColor}
      />
      {/* Suit Lapels */}
      <polygon points="86,176 105,235 66,260 52,190" fill="#0F172A" opacity="0.45" />
      <polygon points="134,176 115,235 154,260 168,190" fill="#0F172A" opacity="0.45" />
      {/* Neck */}
      <rect x="93" y="142" width="34" height="40" rx="12" fill={slide.skinTone} />
      {/* Ears */}
      <circle cx="67" cy="112" r="10" fill={slide.skinTone} />
      <circle cx="153" cy="112" r="10" fill={slide.skinTone} />
      {/* Male Jaw & Head */}
      <rect
        x="70"
        y="58"
        width="80"
        height="96"
        rx="34"
        fill={slide.skinTone}
      />
      {/* Short Executive Male Haircut */}
      <path
        d="M68 92 C66 56, 86 42, 112 42 C138 42, 154 58, 152 92 C146 72, 132 64, 110 64 C88 64, 74 72, 68 92 Z"
        fill={slide.hairColor}
      />
      {/* Eyebrows */}
      <rect x="83" y="92" width="18" height="4" rx="2" fill={slide.hairColor} />
      <rect x="119" y="92" width="18" height="4" rx="2" fill={slide.hairColor} />
      {/* Eyes */}
      <circle cx="92" cy="104" r="4.2" fill="#0F172A" />
      <circle cx="128" cy="104" r="4.2" fill="#0F172A" />
      <circle cx="93.5" cy="102.5" r="1.3" fill="#FFFFFF" />
      <circle cx="129.5" cy="102.5" r="1.3" fill="#FFFFFF" />
      {/* Optional Executive Glasses */}
      {slide.hasGlasses && (
        <g stroke="#1E293B" strokeWidth="3" fill="none">
          <rect x="79" y="96" width="26" height="17" rx="4" />
          <rect x="115" y="96" width="26" height="17" rx="4" />
          <line x1="105" y1="103" x2="115" y2="103" />
        </g>
      )}
      {/* Nose */}
      <path
        d="M110 104 L107 120 L114 121"
        stroke="#B47B56"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Groomed Male Beard / Jaw Shadow */}
      {slide.hasBeard && (
        <path
          d="M72 118 C73 144, 90 156, 110 156 C130 156, 147 144, 148 118 C144 134, 130 143, 110 143 C90 143, 76 134, 72 118 Z"
          fill={slide.hairColor}
          opacity="0.82"
        />
      )}
      {/* Confident Smile */}
      <path
        d="M98 131 Q110 139 122 131"
        stroke={slide.hasBeard ? "#FFFFFF" : "#7C2D12"}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function HeroAnimatedTestimonialShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % HERO_SHOWCASE_SLIDES.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = HERO_SHOWCASE_SLIDES[activeIdx];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative mx-auto w-full max-w-[440px]"
      aria-label="Live rotating customer testimonial card preview"
    >
      {/* Top Floating Live Studio Badge */}
      <div className="mb-2.5 flex items-center justify-between px-1">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-extrabold text-white backdrop-blur-xs">
          <Sparkles size={12} className="text-amber-300" />
          Live Rotating Testimonial Cards
        </span>
        <div className="flex items-center gap-1.5">
          {HERO_SHOWCASE_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveIdx(idx)}
              aria-label={`Preview testimonial card ${idx + 1}: ${s.personName}`}
              className={`h-2 rounded-full transition-all ${
                activeIdx === idx
                  ? "w-6 bg-white"
                  : "w-2 bg-white/35 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Aragon-Style Split Portrait Testimonial Card (Compact Hero Height) */}
      <div
        key={slide.id}
        style={{ backgroundColor: slide.cardTint }}
        className="overflow-hidden rounded-3xl border-[3px] border-slate-900/90 text-slate-900 shadow-2xl transition-all duration-500"
      >
        <div className="grid grid-cols-12 items-end px-5 pt-4 sm:px-6 sm:pt-5">
          {/* Left 7 Columns: Quote Mark, 5 Stars, Highlighted Quote & Trust Badges */}
          <div className="col-span-7 pb-4 pr-2">
            <div className="flex items-center gap-2">
              <span
                style={{ color: slide.accentColor }}
                className="font-serif text-4xl font-black leading-none"
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
                  backgroundColor: `${slide.accentColor}15`,
                }}
                className="rounded px-1 py-0.5 font-black"
              >
                {slide.quoteHighlight}
              </span>
              {slide.quoteAfter}
            </p>

            {/* 2 Mini Trust Badges */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-700">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 shadow-2xs ring-1 ring-slate-900/10">
                <CheckCircle2
                  size={11}
                  style={{ color: slide.accentColor }}
                />
                {slide.badge1}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 shadow-2xs ring-1 ring-slate-900/10">
                <ShieldCheck
                  size={11}
                  style={{ color: slide.accentColor }}
                />
                {slide.badge2}
              </span>
            </div>
          </div>

          {/* Right 5 Columns: Male Executive Cutout Portrait */}
          <div className="col-span-5 flex h-[196px] items-end justify-center overflow-hidden">
            <MaleExecutiveSvgPortrait slide={slide} size="large" />
          </div>
        </div>

        {/* Bottom Dark Brand Footer Strip with Avatar, Name, Role & Custom Brand Pill */}
        <div
          style={{ backgroundColor: slide.footerBg }}
          className="flex items-center justify-between gap-2 px-5 py-3 text-white"
        >
          <div className="flex items-center gap-2.5">
            <MaleExecutiveSvgPortrait slide={slide} size="avatar" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-tight text-white">
                  {slide.personName}
                </span>
                <span
                  style={{ backgroundColor: slide.accentColor }}
                  className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-black text-white"
                  title="Verified Customer"
                >
                  ✓
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-300">
                {slide.personRole}
              </p>
            </div>
          </div>

          <span
            style={{
              borderColor: `${slide.accentColor}66`,
              backgroundColor: `${slide.accentColor}22`,
            }}
            className="rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white"
          >
            {slide.companyName}
          </span>
        </div>
      </div>
    </div>
  );
}

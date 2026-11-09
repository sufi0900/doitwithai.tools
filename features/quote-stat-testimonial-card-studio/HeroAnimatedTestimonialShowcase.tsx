"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, ShieldCheck, Sparkles, Star } from "lucide-react";

/**
 * Hero preview carousel — shows the kinds of cards the studio produces.
 * RULES: male people only (see docs/TOOL_OPTIMIZATION_RULES.md); content is
 * clearly SAMPLE copy, never presented as a real customer review.
 */

type SlideStyle = "arch" | "dots" | "obsidian" | "indigo";

export type HeroShowcaseSlide = {
  id: string;
  style: SlideStyle;
  quote: string;
  highlight: string;
  quoteAfter: string;
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
    style: "arch",
    quote: "We pasted a review, picked a portrait and ",
    highlight: "had a branded testimonial card in under a minute",
    quoteAfter: ".",
    personName: "Marcus Vance",
    personRole: "VP of Growth · VeloCloud AI",
    brand: "VeloCloud",
    badges: ["Verified customer", "Easy to use"],
    imageSrc: "/images/testimonials/marcus-executive.png",
    accent: "#EA580C",
  },
  {
    id: "dots-daniel",
    style: "dots",
    quote: "Our logo, our brand colors, our customer's photo: ",
    highlight: "every template updates instantly",
    quoteAfter: " and exports sharp.",
    personName: "Daniel Mercer",
    personRole: "Founder · NorthStar Analytics",
    brand: "NorthStar",
    badges: ["Your logo", "Brand colors", "HD export"],
    imageSrc: "/images/testimonials/daniel-executive.png",
    accent: "#059669",
  },
  {
    id: "obsidian-tariq",
    style: "obsidian",
    quote: "One quote, ten layouts. ",
    highlight: "Square for the site, 4:5 for LinkedIn, 16:9 for the sales deck",
    quoteAfter: ".",
    personName: "Tariq Al-Mansoor",
    personRole: "Head of Acquisition · Apex B2B",
    brand: "Apex B2B",
    badges: ["10 templates", "3 sizes", "Free"],
    imageSrc: "/images/testimonials/tariq-executive.png",
    accent: "#EAB308",
  },
  {
    id: "indigo-sufian",
    style: "indigo",
    quote: "Paste a URL or a review, choose a template and ",
    highlight: "do it with AI in one visual studio",
    quoteAfter: ".",
    personName: "Sufian Mustafa",
    personRole: "Founder · DoItWithAI.tools",
    brand: "DoItWithAI",
    badges: ["Custom photo & logo", "Free to use"],
    imageSrc: "/images/testimonials/sufian-executive.png",
    accent: "#5271FF",
  },
  {
    id: "arch-tariq",
    style: "arch",
    quote: "Upload any photo and the ",
    highlight: "background is removed automatically",
    quoteAfter: ", right in your browser.",
    personName: "Tariq Al-Mansoor",
    personRole: "Head of Acquisition · Apex B2B",
    brand: "Apex B2B",
    badges: ["Auto cut-out", "Private"],
    imageSrc: "/images/testimonials/tariq-executive.png",
    accent: "#7C3AED",
  },
  {
    id: "obsidian-daniel",
    style: "obsidian",
    quote: "Founder memo, verified post or KPI card: ",
    highlight: "pick the layout that fits your channel",
    quoteAfter: ".",
    personName: "Daniel Mercer",
    personRole: "Founder · NorthStar Analytics",
    brand: "NorthStar",
    badges: ["Memo card", "Post card", "KPI card"],
    imageSrc: "/images/testimonials/daniel-executive.png",
    accent: "#22D3EE",
  },
];

const STYLE_TOKENS: Record<
  SlideStyle,
  { bg: string; border: string; text: string; sub: string; footer: string; dark: boolean }
> = {
  arch: { bg: "#FAF8F5", border: "#261546", text: "#1E1B2E", sub: "#5B5870", footer: "#261546", dark: false },
  dots: { bg: "#FDFBF7", border: "#064E3B", text: "#111827", sub: "#4B5563", footer: "#064E3B", dark: false },
  obsidian: { bg: "#0F172A", border: "#334155", text: "#F1F5F9", sub: "#94A3B8", footer: "#0B1220", dark: true },
  indigo: { bg: "#0B132B", border: "#4361EE", text: "#F1F5F9", sub: "#A9B6D8", footer: "#070D1F", dark: true },
};

const CYCLE_MS = 2800;

function SlideCard({ s, eager }: { s: HeroShowcaseSlide; eager: boolean }) {
  const t = STYLE_TOKENS[s.style];
  return (
    <div
      style={{ backgroundColor: t.bg, borderColor: t.border, color: t.text }}
      className="flex h-full flex-col overflow-hidden rounded-3xl border-[3px] shadow-2xl"
    >
      <div className="relative grid min-h-0 flex-1 grid-cols-12">
        {/* decoration behind the person */}
        {s.style === "arch" && (
          <div
            style={{ backgroundColor: `${s.accent}30` }}
            className="absolute bottom-0 right-[4%] h-[82%] w-[40%] rounded-t-full"
          />
        )}
        {s.style === "dots" && (
          <div
            style={{
              backgroundImage: `radial-gradient(${s.accent} 1.6px, transparent 1.6px)`,
              backgroundSize: "13px 13px",
            }}
            className="absolute right-4 top-4 h-24 w-24 opacity-40"
          />
        )}
        {s.style === "obsidian" && (
          <div className="pointer-events-none absolute bottom-[-10%] right-[2%] flex h-[90%] w-[46%] items-center justify-center opacity-40">
            <div style={{ borderColor: s.accent }} className="absolute h-[95%] w-[95%] rounded-full border" />
            <div style={{ borderColor: s.accent }} className="absolute h-[68%] w-[68%] rounded-full border" />
            <div style={{ borderColor: s.accent }} className="absolute h-[42%] w-[42%] rounded-full border" />
          </div>
        )}
        {s.style === "indigo" && (
          <div
            style={{ background: `radial-gradient(circle at 75% 65%, ${s.accent}73 0%, transparent 62%)` }}
            className="pointer-events-none absolute inset-0"
          />
        )}

        {/* quote column */}
        <div className="relative z-10 col-span-7 flex flex-col justify-center px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span style={{ color: s.accent }} className="font-serif text-6xl font-black leading-none">
              “
            </span>
            <span className="flex items-center gap-0.5 text-amber-400" aria-label="5 out of 5 stars">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </span>
          </div>
          <p className="mt-1 text-[15px] font-extrabold leading-[1.4] tracking-tight sm:text-[17px]">
            {s.quote}
            <span
              style={{ color: s.accent, backgroundColor: `${s.accent}22` }}
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
                style={{ borderColor: `${s.accent}66`, backgroundColor: `${s.accent}14`, color: t.dark ? "#fff" : s.accent }}
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold"
              >
                <CheckCircle2 size={11} /> {b}
              </span>
            ))}
          </div>
        </div>

        {/* person cut-out */}
        <div className="relative z-10 col-span-5">
          <Image
            src={s.imageSrc}
            alt={`${s.personName}, sample customer portrait`}
            fill
            sizes="(max-width: 1024px) 40vw, 200px"
            priority={eager}
            className="object-contain object-bottom drop-shadow-lg"
          />
        </div>
      </div>

      {/* footer */}
      <div
        style={{ backgroundColor: t.footer }}
        className="flex items-center justify-between gap-2 px-5 py-3 text-white"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white/80 bg-slate-700">
            <Image src={s.imageSrc} alt="" fill sizes="40px" className="object-cover object-top" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-xs font-black">{s.personName}</span>
              <ShieldCheck size={13} style={{ color: s.accent }} />
            </div>
            <p className="truncate text-[10px] font-medium text-slate-300">{s.personRole}</p>
          </div>
        </div>
        <span
          style={{ borderColor: `${s.accent}88`, backgroundColor: `${s.accent}30` }}
          className="shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
        >
          {s.brand}
        </span>
      </div>
    </div>
  );
}

export default function HeroAnimatedTestimonialShowcase() {
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Continuous rotation. Skips ticks while the tab is hidden so slides never
  // fast-forward when the visitor comes back.
  useEffect(() => {
    const id = window.setInterval(
      () => {
        if (document.hidden) return;
        setActive((p) => (p + 1) % HERO_SHOWCASE_SLIDES.length);
      },
      reduced ? 6000 : CYCLE_MS,
    );
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <div className="relative mx-auto w-full max-w-[480px]" aria-label="Rotating sample testimonial card designs">
      <div className="mb-2.5 flex items-center justify-between px-1">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-extrabold text-white backdrop-blur-xs">
          <Sparkles size={12} className="animate-pulse text-amber-300" />
          Sample designs made with this studio
        </span>
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Sample card designs">
          {HERO_SHOWCASE_SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Show sample design ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                active === i ? "w-7 bg-white" : "w-2.5 bg-white/35 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Fixed-height stage: slides are stacked and cross-fade, so the hero never changes height */}
      <div className="relative h-[390px] sm:h-[400px]">
        {HERO_SHOWCASE_SLIDES.map((s, i) => {
          const on = active === i;
          return (
            <div
              key={s.id}
              aria-hidden={!on}
              className={`absolute inset-0 transition-[opacity,transform] ease-out ${
                reduced ? "duration-300" : "duration-700"
              } ${
                on
                  ? "z-10 translate-y-0 scale-100 opacity-100"
                  : `pointer-events-none z-0 opacity-0 ${reduced ? "" : "translate-y-3 scale-[0.97]"}`
              }`}
            >
              <SlideCard s={s} eager={i === 0} />
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-center text-[11px] text-slate-300/80">
        Sample cards for illustration. Add your own quote, photo and logo below.
      </p>
    </div>
  );
}

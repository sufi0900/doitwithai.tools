"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { buildPrismScene } from "@/lib/blog-infographic-studio/prism-renderer";
import { PRISM_LAYOUTS } from "@/lib/blog-infographic-studio/layout-registry";
import { createLayoutSample } from "@/lib/blog-infographic-studio/samples";
import { infographicColors } from "@/lib/blog-infographic-studio/appearance";

export default function HeroAnimatedInfographicShowcase() {
  const [index, setIndex] = useState(0),
    [paused, setPaused] = useState(false),
    [hover, setHover] = useState(false),
    [hidden, setHidden] = useState(false),
    [reduced, setReduced] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReduced(media.matches),
      visibility = () => setHidden(document.hidden);
    motion();
    visibility();
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      media.removeEventListener("change", motion);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (paused || hover || hidden || reduced) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % PRISM_LAYOUTS.length),
      1800,
    );
    return () => clearInterval(timer);
  }, [paused, hover, hidden, reduced]);
  const slides = useMemo(
    () =>
      PRISM_LAYOUTS.map((l) => {
        const config = createLayoutSample(l.id);
        return {
          src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildPrismScene(config, { showcaseDimensions: { width: 1080, height: 1350 } }).svg)}`,
          alt: config.altText,
          bg: infographicColors(config).bg,
        };
      }),
    [],
  );
  const select = (i: number) => {
    setIndex((i + slides.length) % slides.length);
    setPaused(true);
  };
  return (
    <div
      aria-label="Infographic layout showcase"
      aria-roledescription="carousel"
      className="group relative mx-auto w-full max-w-[540px]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setPaused(true)}
    >
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-xl shadow-[0_24px_70px_#3452d12e] ring-1 ring-indigo-500/10 motion-safe:transition-colors"
        style={{ background: slides[index].bg }}
      >
        {slides.map((slide, i) => (
          <img
            key={i}
            src={slide.src}
            alt={i === index ? slide.alt : ""}
            aria-hidden={i !== index}
            className={`absolute inset-0 h-full w-full object-cover motion-safe:transition-opacity motion-safe:duration-300 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>
      <div className="relative mx-auto mt-3 flex w-full max-w-full items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/95 px-2 py-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900/95">
        <button
          type="button"
          aria-label="Previous infographic"
          onClick={() => select(index - 1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={15} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col items-center gap-1 overflow-hidden">
          <div className="flex max-w-full items-center gap-1.5">
            <span className="truncate text-[11px] font-bold text-slate-700 dark:text-slate-200">
              {PRISM_LAYOUTS[index]?.name}
            </span>
            <span className="shrink-0 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-200">
              {index + 1}/{PRISM_LAYOUTS.length}
            </span>
          </div>
          <div className="flex max-w-full flex-wrap items-center justify-center">
            {PRISM_LAYOUTS.map((l, i) => (
              <button
                key={l.id}
                type="button"
                aria-label={`Show ${l.name}`}
                aria-pressed={i === index}
                onClick={() => select(i)}
                className="flex h-5 w-3.5 items-center justify-center rounded-full transition hover:scale-125"
              >
                <span
                  className={`h-1.5 rounded-full transition-all ${index === i ? "w-3 bg-indigo-600 dark:bg-indigo-400" : "w-1.5 bg-slate-300 dark:bg-slate-600"}`}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            disabled={reduced}
            aria-label={
              reduced
                ? "Rotation disabled for reduced motion"
                : paused
                  ? "Play infographic showcase"
                  : "Pause infographic showcase"
            }
            onClick={() => setPaused((p) => !p)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-40 dark:text-indigo-300 dark:hover:bg-slate-800"
          >
            {paused || reduced ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button
            type="button"
            aria-label="Next infographic"
            onClick={() => select(index + 1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-slate-800"
          >
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

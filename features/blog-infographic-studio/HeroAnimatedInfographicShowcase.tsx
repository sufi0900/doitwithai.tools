"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import {
  createSampleInfographicConfig,
  generateBlogInfographicSvg,
} from "@/lib/blog-infographic-studio/canvas-renderer";
const slides = [
  { id: 2, label: "Roadmap", palette: "blue-trust" },
  { id: 8, label: "Comparison", palette: "emerald-growth" },
  { id: 11, label: "Key figures", palette: "amber-executive" },
  { id: 17, label: "Hierarchy", palette: "rose-editorial" },
  { id: 22, label: "Anatomy", palette: "violet-saas" },
] as const;
export default function HeroAnimatedInfographicShowcase() {
  const [index, setIndex] = useState(0),
    [paused, setPaused] = useState(false),
    [hover, setHover] = useState(false),
    [focused, setFocused] = useState(false),
    [hidden, setHidden] = useState(false),
    [reduced, setReduced] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReduced(media.matches),
      onVisibility = () => setHidden(document.hidden);
    onMotion();
    onVisibility();
    media.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      media.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  useEffect(() => {
    if (paused || hover || focused || hidden || reduced) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      4500,
    );
    return () => clearInterval(timer);
  }, [paused, hover, focused, hidden, reduced]);
  const source = useMemo(
    () =>
      slides.map((s) => {
        const c = createSampleInfographicConfig(s.id, s.palette);
        if (s.id === 8) {
          c.headline = "From scattered ideas to a clear plan";
          c.subheadline = "Compare two approaches to planning a useful article";
          c.comparisonLabels = ["Unstructured", "Planned"];
          c.nodes = [
            {
              id: "a1",
              badge: "01",
              title: "Start with a title",
              detail: "Draft before checking what the reader needs.",
            },
            {
              id: "b1",
              badge: "02",
              title: "Start with a question",
              detail: "Define the reader’s task before choosing the format.",
            },
            {
              id: "a2",
              badge: "03",
              title: "Publish in isolation",
              detail: "Check overlapping pages and related links later.",
            },
            {
              id: "b2",
              badge: "04",
              title: "Map before writing",
              detail:
                "Choose the page, useful examples and next step together.",
            },
          ];
          c.altText =
            "Comparison of unstructured and planned article workflows.";
        }
        if (s.id === 17) {
          c.headline = "Build useful content from the ground up";
          c.subheadline = "A simple hierarchy for a stronger editorial process";
          c.nodes = [
            {
              id: "h1",
              badge: "03",
              title: "Review and improve",
              detail: "Use feedback and search data to decide what to update.",
            },
            {
              id: "h2",
              badge: "02",
              title: "Create the right answer",
              detail:
                "Write a clear page with useful examples and relevant links.",
            },
            {
              id: "h3",
              badge: "01",
              title: "Understand the audience",
              detail:
                "Establish the reader’s question, intent and context first.",
            },
          ];
          c.altText =
            "Three-tier content hierarchy: audience understanding, useful answers, review.";
        }
        c.brand = { illustration: s.id === 2 ? "paper-steps" : "none" };
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generateBlogInfographicSvg(c))}`;
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
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node))
          setFocused(false);
      }}
      className="overflow-hidden rounded-3xl border border-indigo-200 bg-[#EEF1FF] shadow-xl dark:border-indigo-500/25 dark:bg-[#111C38]"
    >
      <div className="flex items-center justify-between px-5 pt-4">
        <span className="text-[10px] font-bold uppercase tracking-[.2em] text-indigo-600 dark:text-indigo-200">
          One idea. Different perspectives.
        </span>
        <button
          type="button"
          aria-label={
            reduced
              ? "Automatic rotation is disabled for reduced motion"
              : paused
                ? "Play layout showcase"
                : "Pause layout showcase"
          }
          disabled={reduced}
          onClick={() => setPaused((p) => !p)}
          className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-100 dark:text-indigo-200 dark:hover:bg-indigo-500/20"
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      </div>
      <div className="relative flex h-[350px] items-center justify-center overflow-hidden px-5 py-5 sm:h-[380px]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#5271ff20,_transparent_70%)]" />
        {/* These are real renderer output, not testimonial mockups or baked-in screenshots. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={source[(index + 1) % slides.length]}
          alt=""
          aria-hidden="true"
          className="absolute right-[5%] h-[76%] max-w-[48%] rotate-12 object-contain opacity-40 shadow-lg"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={index}
          src={source[index]}
          alt={`${slides[index].label} infographic example with editable text and source footer`}
          className="relative z-10 h-full max-w-[80%] -rotate-3 object-contain shadow-2xl motion-safe:transition-transform motion-safe:duration-300"
        />
        <div className="absolute bottom-3 left-4 z-20 rounded-xl border border-white/60 bg-white/95 px-3 py-2 shadow-sm dark:border-slate-600 dark:bg-slate-900/95">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
            Made in this studio
          </p>
          <p className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-white">
            Editable text · Brand-ready · SVG + PNG
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 pb-4">
        <button
          type="button"
          onClick={() => select(index - 1)}
          aria-label="Previous example"
          className="rounded-lg p-2 text-indigo-600 dark:text-indigo-200"
        >
          <ArrowLeft size={15} />
        </button>
        <div className="flex flex-wrap justify-center gap-1.5">
          {slides.map((s, i) => (
            <button
              type="button"
              key={s.id}
              aria-pressed={index === i}
              onClick={() => select(i)}
              className={`rounded-full px-2.5 py-2 text-[10px] font-bold ${index === i ? "bg-indigo-600 text-white" : "bg-white/70 text-indigo-900 hover:bg-white dark:bg-slate-800 dark:text-indigo-200"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => select(index + 1)}
          aria-label="Next example"
          className="rounded-lg p-2 text-indigo-600 dark:text-indigo-200"
        >
          <ArrowRight size={15} />
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          window.dispatchEvent(
            new CustomEvent("select-blog-infographic-template", {
              detail: { templateId: slides[index].id },
            }),
          );
          document.getElementById("tool-studio-workspace")?.scrollIntoView({
            behavior: reduced ? "auto" : "smooth",
            block: "start",
          });
        }}
        className="flex w-full items-center justify-center gap-2 border-t border-indigo-200 bg-white px-4 py-4 text-xs font-bold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-500/25 dark:bg-indigo-950/60 dark:text-indigo-200"
      >
        Use this layout in the studio
        <ArrowDown size={14} />
      </button>
    </div>
  );
}

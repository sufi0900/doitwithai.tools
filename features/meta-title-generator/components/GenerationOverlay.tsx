"use client";

import { Quote, ScanSearch } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GENERATION_QUOTES } from "@/features/meta-title-generator/quotes";

type Props = {
  active: boolean;
};

// Status copy tied to elapsed seconds rather than to real backend events,
// since generation is a single request-response call. The thresholds are
// tuned to roughly match how the request actually spends its time: reading
// the brief, letting the model consult web search for phrasing context,
// drafting the five option groups, then the deterministic quality pass that
// runs client-side once the response lands. This keeps the wait legible
// without inventing a progress percentage the app can't actually measure.
const STATUS_STEPS = [
  { afterSeconds: 0, label: "Reading your page brief and search intent" },
  { afterSeconds: 3, label: "AI is researching how similar pages phrase titles online" },
  { afterSeconds: 9, label: "Drafting Google, human, AI-readable, and desktop angles" },
  { afterSeconds: 17, label: "Checking grammar, variety, and natural keyword placement" },
  { afterSeconds: 26, label: "Finalizing your recommendations" },
];

export default function GenerationOverlay({ active }: Props) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const quotesRef = useRef(GENERATION_QUOTES);

  useEffect(() => {
    if (!active) {
      setElapsed(0);
      setQuoteIndex(Math.floor(Math.random() * quotesRef.current.length));
      return;
    }

    const tick = window.setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1_000);

    const quoteRotation = window.setInterval(() => {
      setQuoteIndex((current) => (current + 1) % quotesRef.current.length);
    }, 5_000);

    return () => {
      window.clearInterval(tick);
      window.clearInterval(quoteRotation);
    };
  }, [active]);

  if (!active) return null;

  const status =
    [...STATUS_STEPS].reverse().find((step) => elapsed >= step.afterSeconds) ??
    STATUS_STEPS[0];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Generating meta title options"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md"
    >
      <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-slate-950 p-7 text-center text-white shadow-[0_40px_120px_-40px_rgba(0,0,0,0.7)] sm:p-9">
        <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#5271ff]/15 text-[#5271ff]">
          <ScanSearch className="h-7 w-7" />
          <span className="animate-ping absolute inset-0 rounded-2xl border border-[#5271ff]/40" />
        </div>

        <h2 className="mt-6 text-lg font-black tracking-tight">
          Building your title set
        </h2>

        <p
          key={status.label}
          className="mt-2 min-h-[2.5rem] text-sm font-semibold leading-6 text-blue-100/85"
        >
          {status.label}
          <span className="inline-block w-4 text-left">
            <span className="animate-pulse">…</span>
          </span>
        </p>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-[pulse_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-[#5271ff] to-cyan-400" />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            <Quote className="h-3 w-3" />
            While you wait
          </div>
          <p
            key={quoteIndex}
            className="mt-2 text-sm leading-6 text-slate-200"
          >
            {quotesRef.current[quoteIndex]}
          </p>
        </div>

        <p className="mt-5 text-[11px] leading-5 text-slate-500">
          This usually takes a little longer than a simple template fill,
          since the model is checking real phrasing patterns before writing
          your options.
        </p>
      </div>
    </div>
  );
}

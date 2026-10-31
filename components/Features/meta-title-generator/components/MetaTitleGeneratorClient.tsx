"use client";

import { AlertCircle, ArrowDown, ScanSearch, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { generateMetaTitles } from "@/features/meta-title-generator/api";
import type {
  MetaTitleApiResponse,
  MetaTitleInput,
} from "@/features/meta-title-generator/schema";
import MetaTitleForm from "./MetaTitleForm";
import MetaTitleResults from "./MetaTitleResults";

const loadingPhases = [
  "Reading the page promise and search intent",
  "Building Google, human, and AI-readable angles",
  "Checking variety and editorial trade-offs",
  "Preparing the deterministic quality review",
];

export default function MetaTitleGeneratorClient() {
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MetaTitleApiResponse | null>(null);
  const [lastInput, setLastInput] = useState<MetaTitleInput | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!busy) return;
    const interval = window.setInterval(() => {
      setPhase((current) => (current + 1) % loadingPhases.length);
    }, 1_900);
    return () => window.clearInterval(interval);
  }, [busy]);

  async function run(input: MetaTitleInput) {
    setBusy(true);
    setPhase(0);
    setError("");
    setLastInput(input);

    try {
      const response = await generateMetaTitles(input);
      setResult(response);
      window.setTimeout(
        () =>
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        80,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The generator could not complete this request.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="meta-title-generator" className="scroll-mt-24">
      <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["4", "Optimization lenses"],
          ["20", "Distinct candidates"],
          ["3", "Ranked recommendations"],
          ["Live", "Mobile + desktop SERP lab"],
        ].map(([value, label]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-md"
          >
            <p className="text-2xl font-black">{value}</p>
            <p className="mt-1 text-xs font-semibold text-blue-100/80">
              {label}
            </p>
          </div>
        ))}
      </div>

      <MetaTitleForm busy={busy} onSubmit={run} />

      {busy && (
        <div className="mt-7 overflow-hidden rounded-2xl border border-[#5271ff]/20 bg-white p-5 shadow-lg dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#5271ff]/10 text-[#5271ff]">
              <ScanSearch className="h-5 w-5" />
              <span className="animate-ping absolute inset-0 rounded-xl border border-[#5271ff]/40" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-extrabold text-slate-900 dark:text-white">
                  {loadingPhases[phase]}
                </p>
                <Sparkles className="animate-pulse h-4 w-4 text-[#5271ff]" />
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full w-1/2 animate-[pulse_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-[#5271ff] to-cyan-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div
          className="mt-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-extrabold">Generation paused</p>
            <p className="mt-1 text-sm leading-6">{error}</p>
          </div>
        </div>
      )}

      {!busy && !result && (
        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-100/80">
          Generate once to open the full analysis workspace{" "}
          <ArrowDown className="animate-bounce h-4 w-4" />
        </div>
      )}

      <div ref={resultRef} className="scroll-mt-24">
        {result && lastInput && (
          <MetaTitleResults
            key={result.meta.generatedAt}
            data={result}
            input={lastInput}
            onRegenerate={() => run(lastInput)}
          />
        )}
      </div>
    </section>
  );
}

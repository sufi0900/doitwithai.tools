"use client";

import { AlertCircle, ArrowDown } from "lucide-react";
import { useRef, useState } from "react";
import { generateMetaTitles } from "@/features/meta-title-generator/api";
import type {
  MetaTitleApiResponse,
  MetaTitleInput,
} from "@/features/meta-title-generator/schema";
import MetaTitleForm from "./MetaTitleForm";
import MetaTitleResults from "./MetaTitleResults";
import GenerationOverlay from "./GenerationOverlay";

export default function MetaTitleGeneratorClient() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MetaTitleApiResponse | null>(null);
  const [lastInput, setLastInput] = useState<MetaTitleInput | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function run(input: MetaTitleInput) {
    setBusy(true);
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
          ["5", "Optimization lenses"],
          ["25", "Distinct candidates"],
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

      <GenerationOverlay active={busy} />

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

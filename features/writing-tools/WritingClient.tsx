"use client";
import { readToolResponse } from "@/lib/ai-tools/client-response";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  LayoutTemplate,
  PencilLine,
  Sparkles,
} from "lucide-react";
import {
  validateWritingOutput,
  type WritingInput,
  type WritingKind,
  type WritingOutput,
} from "./schema";
import WritingForm from "./WritingForm";
import WritingResults from "./WritingResults";
export default function WritingClient({ kind }: { kind: WritingKind }) {
  const [result, setResult] = useState<{
    output: WritingOutput;
    input: WritingInput;
    generation: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => () => controllerRef.current?.abort(), []);
  async function generate(input: WritingInput) {
    if (controllerRef.current) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setBusy(true);
    setError("");
    setStatus("Creating six options from your page brief.");
    const timeout = window.setTimeout(() => controller.abort(), 40_000);
    try {
      const response = await fetch(`/api/ai-tools/${kind}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      const data = await readToolResponse(response);
      if (!response.ok)
        throw new Error(data.error?.message || "Generation is unavailable.");
      const output = validateWritingOutput(data.result, kind);
      setResult({ output, input, generation: Date.now() });
      setStatus(
        "Six options are ready. Choose a direction and refine it in your lab.",
      );
      window.setTimeout(() => {
        const heading = document.getElementById(`${kind}-results`);
        heading?.focus({ preventScroll: true });
        heading?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "start",
        });
      }, 80);
    } catch (e) {
      setStatus("");
      setError(
        e instanceof Error && e.name !== "AbortError"
          ? e.message
          : "The request timed out. Your existing drafts are still available.",
      );
    } finally {
      window.clearTimeout(timeout);
      controllerRef.current = null;
      setBusy(false);
    }
  }
  return (
    <section id={`${kind}-workspace`} className="scroll-mt-24">
      <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [Sparkles, "6", "Purposeful writing options"],
          [LayoutTemplate, "3", "Distinct writing directions"],
          [
            PencilLine,
            "Live",
            kind === "meta-description"
              ? "Snippet editing lab"
              : "Heading hierarchy lab",
          ],
          [CheckCircle2, "You", "Final editorial judgment"],
        ].map(([Icon, value, label]) => {
          const FeatureIcon = Icon as typeof Sparkles;
          return (
            <div
              key={label as string}
              className="rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-2xl font-black text-white">
                  {value as string}
                </p>
                <FeatureIcon className="h-5 w-5 text-blue-300" aria-hidden />
              </div>
              <p className="mt-2 text-[11px] font-semibold leading-5 text-blue-100/70">
                {label as string}
              </p>
            </div>
          );
        })}
      </div>
      <WritingForm kind={kind} busy={busy} onGenerate={generate} />
      <div
        role="status"
        aria-live="polite"
        className="mt-5 text-center text-xs font-semibold text-blue-100/80"
      >
        {status}
      </div>
      {busy && (
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-blue-400/20 bg-white/[0.06] p-5">
          <BrainCircuit
            aria-hidden
            className="animate-pulse motion-reduce:animate-none h-6 w-6 shrink-0 text-blue-300"
          />
          <div>
            <p className="text-sm font-extrabold text-white">
              Writing alternatives for your page
            </p>
            <p className="mt-1 text-xs leading-6 text-slate-300">
              You can compare directions, edit locally, and export once the
              options arrive.
            </p>
          </div>
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-red-300/30 bg-red-950/30 p-5 text-red-100"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <div>
            <p className="text-sm font-bold">Generation paused</p>
            <p className="mt-1 text-sm leading-6">{error}</p>
            {result && (
              <p className="mt-2 text-xs">
                Your previous options and local edits have been preserved.
              </p>
            )}
          </div>
        </div>
      )}
      {result && (
        <WritingResults
          key={result.generation}
          kind={kind}
          output={result.output}
          input={result.input}
          busy={busy}
          onRegenerate={() => generate(result.input)}
        />
      )}
    </section>
  );
}

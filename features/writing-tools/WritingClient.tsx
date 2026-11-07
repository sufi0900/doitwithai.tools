"use client";

import { ToolRunOverlay, paintToolFeedback } from "@/features/tool-ui/ToolRunOverlay";
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
import { sampleBrief } from "./config";
import WritingForm from "./WritingForm";
import WritingResults from "./WritingResults";

const INITIAL_META_OUTPUT: WritingOutput = {
  candidates: [
    {
      text: "Learn how to write clear meta titles with AI using a practical brief, side-by-side examples, and a pre-publish editorial review checklist.",
      approach: "Clear summary",
      explanation:
        "Summarizes the specific workflow, worked examples, and review checklist on the page.",
    },
    {
      text: "A step-by-step guide to drafting and reviewing accurate page titles with AI so your search snippet matches what readers find on the page.",
      approach: "Clear summary",
      explanation:
        "Focuses on accuracy and alignment between the title promise and page content.",
    },
    {
      text: "Avoid generic AI title tags. Use our worked examples and editorial checklist to write specific, reader-first meta titles for your guides.",
      approach: "Reader benefit",
      explanation:
        "Highlights how readers avoid generic wording using the supplied examples.",
    },
    {
      text: "Give readers a clear reason to click with meta titles grounded in your real page content, audience task, and editorial checklist.",
      approach: "Reader benefit",
      explanation:
        "Emphasizes grounding the headline in real page substance for content marketers.",
    },
    {
      text: "Compare three meta title angles, test your draft against our review checklist, and refine the wording before you publish.",
      approach: "Next step",
      explanation:
        "Invites the reader to compare alternatives and run the review checklist.",
    },
    {
      text: "Explore worked meta title examples and use the step-by-step review checklist to verify your next page title before publishing.",
      approach: "Next step",
      explanation:
        "Directs readers to the worked examples and verification workflow.",
    },
  ],
};

const INITIAL_H1_OUTPUT: WritingOutput = {
  candidates: [
    {
      text: "Write Clear Meta Titles with AI and Review Them Before Publishing",
      approach: "Topic first",
      explanation:
        "Names the core topic and pairs it with the human review workflow covered in the guide.",
    },
    {
      text: "AI-Assisted Meta Titles: Worked Examples and an Editorial Checklist",
      approach: "Topic first",
      explanation:
        "Places the subject first and specifies the worked examples and checklist on the page.",
    },
    {
      text: "How to Draft, Compare, and Verify Page Titles Using AI",
      approach: "Task first",
      explanation:
        "Leads with the three concrete actions the reader will perform in the tutorial.",
    },
    {
      text: "Use a Focused Page Brief to Write Accurate Meta Titles with AI",
      approach: "Task first",
      explanation:
        "Centers the reader's primary action of briefing AI with real page substance.",
    },
    {
      text: "A Content Marketer's Workflow for Writing Honest Meta Titles with AI",
      approach: "Audience first",
      explanation:
        "Addresses content marketers directly and sets an editorial expectation.",
    },
    {
      text: "For Editorial Teams: How to Shape AI Title Drafts Into Clear Page Headlines",
      approach: "Audience first",
      explanation:
        "Speaks to teams reviewing AI drafts before publication.",
    },
  ],
};

export default function WritingClient({ kind }: { kind: WritingKind }) {
  const [result, setResult] = useState<{
    output: WritingOutput;
    input: WritingInput;
    generation: number;
  } | null>(() => ({
    output: kind === "meta-description" ? INITIAL_META_OUTPUT : INITIAL_H1_OUTPUT,
    input: { ...sampleBrief },
    generation: 1,
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(
    "Six sample options are pre-loaded below. Choose any direction to refine it in the live editing lab, or generate new options from your brief.",
  );
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
      const output = validateWritingOutput(data.result, kind, input);
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
      <ToolRunOverlay
        active={busy}
        title="Generating tailored writing options"
        description="Drafting clear, reader-first copy variations aligned with your tone and goal."
      />
      <div className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
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
              className="rounded-xl border border-white/15 bg-white/[0.07] px-3.5 py-2.5 backdrop-blur"
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

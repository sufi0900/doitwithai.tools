"use client";

import { AlertCircle, ArrowDown, BrainCircuit, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { generateSlugs } from "@/features/slug-generator/api";
import type {
  SlugApiResponse,
  SlugInput,
} from "@/features/slug-generator/schema";
import SlugGeneratorForm, { sampleForm } from "./SlugGeneratorForm";
import SlugResults from "./SlugResults";

const INITIAL_SLUG_RESULT: SlugApiResponse = {
  result: {
    analysis: {
      pageType: "Software Product Review",
      searchIntent: "Commercial Investigation",
      coreTopic: "Merlin AI Chrome Extension Review",
      primaryEntity: "Merlin AI",
      stableConcepts: ["merlin-ai", "review", "chrome-extension"],
      detailsCompressed: [
        {
          detail: "a-review-blog-for",
          decision:
            "Stripped conversational framing words ('a', 'blog', 'for') and kept 'review' as the single intent token.",
        },
        {
          detail: "free-and-paid-plans-features",
          decision:
            "Omitted sub-sections (pricing, features, pros/cons) so the URL remains evergreen when plans change.",
        },
      ],
      summary:
        "This page is an evergreen commercial review of the Merlin AI browser extension covering features, pricing, and practical trade-offs.",
      recommendedDirection:
        "Pair the primary entity ('merlin-ai') with the core commercial intent token ('review') for a durable, 2-to-3 word slug.",
    },
    topRecommendation: {
      slug: "merlin-ai-review",
      angle: "Balanced Entity + Intent",
      rationale:
        "Combines the exact product entity ('merlin-ai') with the primary commercial investigation modifier ('review') in 16 characters.",
      bestFor:
        "Evergreen software reviews that may expand beyond Chrome to Edge, Safari, or desktop apps.",
      tradeoff:
        "Omits 'chrome-extension' from the URL path in favor of brevity.",
    },
    alternatives: {
      concise: [
        {
          slug: "merlin-ai",
          angle: "Ultra-Short Entity Hub",
          rationale:
            "Uses only the 2-word brand entity when the parent folder (/ai-tools/) already establishes the review context.",
          bestFor:
            "Sites with a dedicated /reviews/ or /ai-tools/ directory structure.",
          tradeoff:
            "Does not explicitly state 'review' in the slug path itself.",
        },
        {
          slug: "merlin-extension-review",
          angle: "Compact Extension Focus",
          rationale:
            "Highlights the browser extension form factor while keeping total length under 25 characters.",
          bestFor:
            "Readers specifically comparing browser-based AI assistants.",
          tradeoff:
            "Drops 'ai' after 'merlin', assuming brand recognition.",
        },
      ],
      keywordAligned: [
        {
          slug: "merlin-ai-chrome-extension-review",
          angle: "Full Long-Tail Keyword Match",
          rationale:
            "Includes both 'chrome-extension' and 'review' for exact alignment with long-tail search queries.",
          bestFor:
            "Capturing specific 'Merlin AI Chrome extension review' search intent.",
          tradeoff:
            "At 33 characters and 5 words, it is slightly longer than the 3-word ideal.",
        },
        {
          slug: "merlin-ai-extension",
          angle: "Product Category Match",
          rationale:
            "Targets the product + form-factor query without locking the page strictly to a review format.",
          bestFor:
            "Hybrid guide + review pages that also teach how to use the extension.",
          tradeoff: "Less explicit about editorial evaluation than '-review'.",
        },
      ],
      intentLed: [
        {
          slug: "is-merlin-ai-worth-it",
          angle: "Buyer Decision Question",
          rationale:
            "Mirrors how buyers phrase bottom-of-funnel value evaluations in search and AI assistants.",
          bestFor:
            "Opinionated verdict-first articles focused on ROI and paid plan value.",
          tradeoff:
            "Includes conversational stop words ('is', 'worth', 'it') that lengthen the slug.",
        },
        {
          slug: "merlin-ai-pros-cons",
          angle: "Trade-Off Evaluation",
          rationale:
            "Signals an objective comparison of strengths and limitations for researchers.",
          bestFor:
            "Comparison-style reviews emphasizing hands-on testing results.",
          tradeoff:
            "Narrower framing if the article also covers setup tutorials.",
        },
      ],
    },
    editorNotes: [
      "If 'a-review-blog-for-merlin-ai-chrome-extension' is already indexed, add a permanent 301 redirect to '/ai-tools/merlin-ai-review' and update internal links.",
      "Keep the year (e.g., 2026) in your <title> tag rather than the URL slug so you can refresh the review annually without changing URLs.",
      "Verify canonical tag alignment immediately after updating the slug.",
    ],
  },
  meta: {
    generatedAt: "2026-03-25T10:00:00.000Z",
    model: "deterministic-preview",
    remaining: 15,
  },
};

const loadingPhases = [
  "Interpreting the page topic and search intent",
  "Separating durable concepts from headline detail",
  "Writing concise, keyword, and intent-led options",
  "Running deterministic URL quality checks",
];

export default function SlugGeneratorClient() {
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SlugApiResponse | null>(
    INITIAL_SLUG_RESULT,
  );
  const [lastInput, setLastInput] = useState<SlugInput | null>(sampleForm);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!busy) return;
    const interval = window.setInterval(() => {
      setPhase((current) => (current + 1) % loadingPhases.length);
    }, 1_850);
    return () => window.clearInterval(interval);
  }, [busy]);

  async function run(input: SlugInput) {
    setBusy(true);
    setPhase(0);
    setError("");
    setLastInput(input);

    try {
      const response = await generateSlugs(input);
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
    <section id="slug-url-generator" className="scroll-mt-24">
      <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["1", "Required context field"],
          ["7", "Focused slug candidates"],
          ["3", "Alternative strategies"],
          ["Live", "Editable URL quality lab"],
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

      <SlugGeneratorForm busy={busy} onSubmit={run} />

      {busy && (
        <div className="mt-7 overflow-hidden rounded-2xl border border-[#5271ff]/20 bg-white p-5 shadow-lg dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#5271ff]/10 text-[#5271ff]">
              <BrainCircuit className="h-5 w-5" />
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
          Generate once to open the analysis workspace
          <ArrowDown className="animate-bounce h-4 w-4" />
        </div>
      )}

      <div ref={resultRef} className="scroll-mt-24">
        {result && lastInput && (
          <SlugResults
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

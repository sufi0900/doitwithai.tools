"use client";

import ToolRunOverlay, { paintToolFeedback } from "@/features/tool-ui/ToolRunOverlay";

import { AlertCircle } from "lucide-react";
import { useRef, useState } from "react";
import { generateMetaTitles } from "@/features/meta-title-generator/api";
import type {
  MetaTitleApiResponse,
  MetaTitleInput,
} from "@/features/meta-title-generator/schema";
import MetaTitleForm, { sampleForm } from "./MetaTitleForm";
import MetaTitleResults from "./MetaTitleResults";
import GenerationOverlay from "./GenerationOverlay";

const INITIAL_SAMPLE_RESPONSE: MetaTitleApiResponse = {
  meta: {
    generatedAt: "2026-11-02T12:00:00.000Z",
    model: "interactive-sample",
    remaining: 15,
  },
  result: {
    analysis: {
      contentType: "Practical SEO & AI Search Guide",
      intent: "Informational with tool-assisted workflow",
      audienceSummary:
        "SEO practitioners, editors, and website owners looking for reliable title rules",
      pagePromise:
        "Learn how to write, measure, and test meta titles across Google SERPs, AI Overviews, and human readers",
      keywordStrategy:
        "Front-load 'Meta Title Optimization' naturally while weaving in 'Title Tag' and 'AI SEO' context",
      differentiator:
        "Combines Google pixel-width checks, human click clarity, and AI-search disambiguation",
      recommendedDirection:
        "Lead with the primary keyword, specify the practical pixel + AI-search workflow, and keep total width under 560px.",
      assistantMessage:
        "Here are 25 candidate titles across 5 optimization lenses. Click any card below to load it into the Live SERP Lab for real-time pixel and mobile/desktop truncation testing.",
    },
    groups: [
      {
        lens: "unified",
        heading: "Unified Balance (Search + Human + AI)",
        explanation:
          "Balances early primary keyword placement, clear reader value, and explicit topic framing within mobile and desktop pixel budgets.",
        focuses: ["Front-loaded keyword", "Pixel-safe", "Clear page promise"],
        candidates: [
          {
            title:
              "Meta Title Optimization: Pixel, CTR & AI SEO Guide | Do It With AI",
            angle: "Complete practitioner framework",
            rationale:
              "Places the exact primary keyword first and names the three concrete pillars.",
            tradeoff: "Slightly longer on narrow mobile screens with brand suffix.",
          },
          {
            title:
              "Meta Title Optimization Guide for Google & AI Search",
            angle: "Direct & concise",
            rationale:
              "Fits comfortably under both mobile and desktop pixel limits with zero truncation.",
            tradeoff: "Omits the brand suffix to preserve maximum clarity.",
          },
          {
            title:
              "Meta Title Optimization: How to Write Pixel-Safe Title Tags",
            angle: "How-to execution",
            rationale:
              "Combines the primary phrase and secondary 'title tags' variant naturally.",
            tradeoff: "Focuses more on mechanics than high-level strategy.",
          },
          {
            title:
              "Practical Meta Title Optimization for Search & Human Readers",
            angle: "Editorial & reader-first",
            rationale:
              "Highlights the dual search-and-reader outcome promised in the brief.",
            tradeoff: "Primary keyword starts at word two instead of word one.",
          },
          {
            title:
              "Meta Title Optimization Checklist: Pixels, Intent & AI SEO",
            angle: "Actionable checklist",
            rationale:
              "Strong informational format cue that sets clear reader expectations.",
            tradeoff: "Checklist framing works best if the page includes a summary list.",
          },
        ],
      },
      {
        lens: "search",
        heading: "Traditional Search Engine Clarity",
        explanation:
          "Prioritizes exact-match keyword prominence, intent alignment, and differentiation from generic competitor titles.",
        focuses: ["Exact keyword match", "Intent cue", "Zero ambiguity"],
        candidates: [
          {
            title:
              "Meta Title Optimization: Title Tag Length, Pixels & SEO Rules",
            angle: "Technical specification",
            rationale:
              "Pairs the primary keyword with high-intent secondary modifiers.",
            tradeoff: "Dense technical phrasing.",
          },
          {
            title:
              "Meta Title Optimization for SEO: Complete Title Tag Guide",
            angle: "Classic search guide",
            rationale:
              "Unambiguous topical relevance for both primary and secondary keywords.",
            tradeoff: "More conventional phrasing than human-first hooks.",
          },
          {
            title:
              "How Meta Title Optimization Works: Pixel Width & Intent Guide",
            angle: "Explanatory search intent",
            rationale:
              "Matches 'how-to' and informational query variations cleanly.",
            tradeoff: "Starts with 'How' before the primary keyword.",
          },
          {
            title:
              "Meta Title Optimization & Title Tag Sizing for Mobile SERPs",
            angle: "Mobile SERP focus",
            rationale:
              "Highlights the mobile preview differentiator from your brief.",
            tradeoff: "Narrows perceived scope to mobile displays.",
          },
          {
            title:
              "Meta Title Optimization Framework for Modern AI SEO Teams",
            angle: "B2B practitioner lens",
            rationale:
              "Integrates both 'meta title optimization' and 'AI SEO' cleanly.",
            tradeoff: "Less suited for beginners.",
          },
        ],
      },
      {
        lens: "human",
        heading: "Human Reader Appeal & Click Clarity",
        explanation:
          "Emphasizes concrete outcomes, readability, and why a practitioner should choose your guide over generic results.",
        focuses: ["Reader outcome", "High scanability", "Specific value"],
        candidates: [
          {
            title:
              "Write Better Title Tags: A Practical Meta Title Optimization Guide",
            angle: "Outcome-led hook",
            rationale:
              "Leads with the reader's goal while retaining the exact primary keyword.",
            tradeoff: "Places the primary keyword in the second half.",
          },
          {
            title:
              "Meta Title Optimization Without Guesswork: Live Pixel Workflow",
            angle: "Pain-point resolution",
            rationale:
              "Directly contrasts your live pixel check against guesswork.",
            tradeoff: "Slightly conversational tone.",
          },
          {
            title:
              "Stop Truncated Titles: Meta Title Optimization for Marketers",
            angle: "Problem-solution framing",
            rationale:
              "Immediately resonates with editors frustrated by SERP clipping.",
            tradeoff: "Emphasis on truncation over broader intent strategy.",
          },
          {
            title:
              "Meta Title Optimization: Craft Titles Readers & Search Engines Trust",
            angle: "Trust & clarity",
            rationale:
              "Reflects the M.E.T.A. trust principle without hype.",
            tradeoff: "Near the upper desktop pixel threshold.",
          },
          {
            title:
              "The Marketer’s Guide to Meta Title Optimization & Pixel Fit",
            angle: "Audience-named guide",
            rationale:
              "Calls out marketers directly and names the pixel-fit benefit.",
            tradeoff: "Keyword appears after the audience lead-in.",
          },
        ],
      },
      {
        lens: "ai",
        heading: "AI Overviews & Answer Engine Disambiguation",
        explanation:
          "Uses explicit entity relationships and descriptive noun phrases so answer engines classify the page's exact scope.",
        focuses: ["Entity disambiguation", "Explicit scope", "Zero fluff"],
        candidates: [
          {
            title:
              "Meta Title Optimization for Google SERPs, AI Search & Readers",
            angle: "Tri-system scope",
            rationale:
              "Explicitly states the three environments covered in the guide.",
            tradeoff: "Slightly formal structure.",
          },
          {
            title:
              "Meta Title Optimization: Aligning Title Tags with Search Intent",
            angle: "Semantic relationship",
            rationale:
              "Connects the entity (Title Tags) with the core concept (Search Intent).",
            tradeoff: "Less emphasis on pixel measurements.",
          },
          {
            title:
              "AI SEO & Meta Title Optimization: Entity and Pixel Guidelines",
            angle: "AI SEO entity pairing",
            rationale:
              "Pairs both target keywords in a clear, citation-friendly heading.",
            tradeoff: "Secondary keyword appears before primary keyword.",
          },
          {
            title:
              "Meta Title Optimization Standards: Pixel Width & Intent Matching",
            angle: "Reference standard",
            rationale:
              "Positions the article as a structured reference document.",
            tradeoff: "Clinical tone.",
          },
          {
            title:
              "How to Optimize Meta Titles for Search Engines and AI Answers",
            angle: "Task-oriented disambiguation",
            rationale:
              "Matches natural-language prompts used in AI search tools.",
            tradeoff: "Uses verb variation ('Optimize Meta Titles').",
          },
        ],
      },
      {
        lens: "desktop",
        heading: "Compact Mobile & Tight Pixel Budget",
        explanation:
          "Engineered for zero-truncation display across narrow mobile viewports and compact browser tabs.",
        focuses: ["Under 480px", "Zero clipping", "Fast scanning"],
        candidates: [
          {
            title: "Meta Title Optimization: Practical SEO Guide",
            angle: "Ultra-compact guide",
            rationale:
              "Renders in full on virtually every mobile and desktop viewport.",
            tradeoff: "Fewer secondary modifiers.",
          },
          {
            title: "Meta Title Optimization & Pixel Width Guide",
            angle: "Compact + differentiator",
            rationale:
              "Keeps both the primary keyword and pixel differentiator under 45 chars.",
            tradeoff: "Omits brand name.",
          },
          {
            title: "Meta Title Optimization for AI SEO & SERPs",
            angle: "Compact dual-keyword",
            rationale:
              "Includes both primary and secondary keywords in 43 characters.",
            tradeoff: "Abbreviated SERP terminology.",
          },
          {
            title: "Meta Title Optimization: Title Tag Checklist",
            angle: "Compact checklist",
            rationale:
              "Includes primary keyword + 'Title Tag' in a tight 44-character frame.",
            tradeoff: "Best when paired with an on-page checklist.",
          },
          {
            title: "Meta Title Optimization Guide | Do It With AI",
            angle: "Compact branded",
            rationale:
              "Fits the full brand suffix inside the mobile pixel budget.",
            tradeoff: "Less room for secondary keywords.",
          },
        ],
      },
    ],
    editorNotes: [
      "Verify that your chosen title matches the visible H1 topic and actual content on the page.",
      "Use the Live SERP Lab above to test mobile vs. desktop pixel width before publishing.",
      "Avoid repeating identical boilerplate words across dozens of URLs on your domain.",
    ],
  },
};

export default function MetaTitleGeneratorClient() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MetaTitleApiResponse | null>(
    INITIAL_SAMPLE_RESPONSE,
  );
  const [lastInput, setLastInput] = useState<MetaTitleInput | null>(sampleForm);
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
      <ToolRunOverlay
        active={busy}
        title="Generating 25 SERP-calibrated meta title options"
        description="Scoring pixel widths, search intent alignment, and click clarity across 5 lenses."
      />
      <div className="mb-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["5", "Optimization lenses"],
          ["25", "Distinct candidates"],
          ["3", "Ranked recommendations"],
          ["Live", "Mobile + desktop SERP lab"],
        ].map(([value, label]) => (
          <div
            key={label}
            className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-white backdrop-blur-md"
          >
            <p className="text-2xl font-black">{value}</p>
            <p className="mt-1 text-xs font-semibold text-blue-100/80">
              {label}
            </p>
          </div>
        ))}
      </div>

      <MetaTitleForm
        busy={busy}
        onSubmit={run}
        onLoadSample={() => {
          setLastInput(sampleForm);
          setResult(INITIAL_SAMPLE_RESPONSE);
          setError("");
        }}
      />

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

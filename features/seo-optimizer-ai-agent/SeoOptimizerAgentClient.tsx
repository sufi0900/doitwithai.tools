"use client";

import React, { useRef, useState } from "react";
import {
  Check,
  Code2,
  Compass,
  Copy,
  Download,
  FileCode2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  DEFAULT_SEO_OPTIMIZER_INPUT,
  buildDeterministicSeoOptimizerPack,
  type SeoOptimizerAgentInput,
  type SeoOptimizerAgentPack,
} from "./model";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";

export default function SeoOptimizerAgentClient() {
  const [input, setInput] = useState<SeoOptimizerAgentInput>(
    DEFAULT_SEO_OPTIMIZER_INPUT,
  );
  const [pack, setPack] = useState<SeoOptimizerAgentPack>(() =>
    buildDeterministicSeoOptimizerPack(DEFAULT_SEO_OPTIMIZER_INPUT),
  );
  const [activeStepTab, setActiveStepTab] = useState<
    "step1" | "step2" | "step3" | "step4" | "step5"
  >("step1");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  function updateField<K extends keyof SeoOptimizerAgentInput>(
    key: K,
    value: SeoOptimizerAgentInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRunAgent(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    await paintToolFeedback();
    try {
      const res = await fetch("/api/ai-tools/seo-optimizer-ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.pack) {
        setPack(data.pack);
        notify(
          data.provider === "ai"
            ? "Autonomous 5-Step SEO & AEO Chain completed!"
            : "5-Step SEO & AEO Optimization Pack built!",
        );
      } else {
        setPack(buildDeterministicSeoOptimizerPack(input));
        notify("5-Step SEO & AEO Optimization Pack built!");
      }
      setTimeout(() => focusToolSection(resultsRef.current), 60);
    } catch {
      setPack(buildDeterministicSeoOptimizerPack(input));
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadSample() {
    setLoading(true);
    await paintToolFeedback(400);
    setInput(DEFAULT_SEO_OPTIMIZER_INPUT);
    setPack(buildDeterministicSeoOptimizerPack(DEFAULT_SEO_OPTIMIZER_INPUT));
    setLoading(false);
    notify("Loaded sample 5-step SEO & AEO Page Optimizer workflow.");
  }

  function downloadFile(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section
      id="seo-optimizer-ai-agent"
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6"
    >
      <ToolRunOverlay
        active={loading}
        title="Running 5-Step SEO & AEO Page Optimizer Chain"
        description="Classifying search intent, engineering <580px meta tags, drafting a 50-word AI Overview Power Answer, auditing E-E-A-T entity gaps, and compiling @graph JSON-LD schema."
      />

      {toast && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300"
        >
          <Check size={15} />
          {toast}
        </div>
      )}

      <div className="mb-6">
        <UrlArticleExtractorBar
          label="Option 1: Paste Any Live Page URL to Auto-Extract Topic, Meta Tags & Content for the 5-Step Chain"
          placeholder="https://doitwithai.tools/ai-seo/what-is-ai-seo"
          buttonLabel="Extract Live Page"
          onExtracted={(data) => {
            const nextInput: SeoOptimizerAgentInput = {
              ...input,
              pageUrl: data.url || input.pageUrl,
              draftTitle: data.title || input.draftTitle,
              draftDescription: data.description || input.draftDescription,
              targetKeywordOrTopic:
                data.primaryKeyword || data.title || input.targetKeywordOrTopic,
              contentSummaryOrDraft:
                data.excerpt ||
                (data.keyTakeaways || []).join("\n") ||
                input.contentSummaryOrDraft,
            };
            setInput(nextInput);
            setPack(buildDeterministicSeoOptimizerPack(nextInput));
            notify("Extracted live URL into the 5-Step SEO & AEO Agent!");
          }}
        />
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-12">
        <form
          onSubmit={handleRunAgent}
          className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6 lg:col-span-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                5-Step Autonomous Input
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Topic, URL &amp; E-E-A-T Context
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void handleLoadSample()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <RotateCcw size={13} />
              Sample Run
            </button>
          </div>

          <div>
            <label
              htmlFor="seo-opt-kw"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Target Keyword or Topic *
            </label>
            <input
              id="seo-opt-kw"
              type="text"
              required
              value={input.targetKeywordOrTopic}
              onChange={(e) =>
                updateField("targetKeywordOrTopic", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="seo-opt-url"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Canonical Page URL
            </label>
            <input
              id="seo-opt-url"
              type="text"
              value={input.pageUrl}
              onChange={(e) => updateField("pageUrl", e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="seo-opt-author"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Author Name &amp; Credentials (for E-E-A-T &amp; Schema)
            </label>
            <input
              id="seo-opt-author"
              type="text"
              value={input.authorNameAndCredentials}
              onChange={(e) =>
                updateField("authorNameAndCredentials", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="seo-opt-brand"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Publisher / Brand Name
            </label>
            <input
              id="seo-opt-brand"
              type="text"
              value={input.brandOrSiteName}
              onChange={(e) => updateField("brandOrSiteName", e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="seo-opt-summary"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Page Draft or Core Summary
            </label>
            <textarea
              id="seo-opt-summary"
              rows={4}
              value={input.contentSummaryOrDraft}
              onChange={(e) =>
                updateField("contentSummaryOrDraft", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs leading-relaxed text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3452d1] via-[#5271ff] to-indigo-600 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            <Wand2 size={17} />
            {loading
              ? "Executing 5-Step SEO & AEO Chain..."
              : "Run 5-Step SEO & AEO Optimizer Agent"}
          </button>
        </form>

        <div ref={resultsRef} className="space-y-5 lg:col-span-7">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  5-Step Autonomous SEO &amp; AEO Pipeline
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {pack.step1IntentClassification.primaryIntent}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      pack.compiledFullBundleMarkdown,
                    );
                    notify("Copied complete 5-Step SEO & AEO Report!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2 text-xs font-extrabold text-white shadow hover:bg-[#2841b5]"
                >
                  <Copy size={13} />
                  Copy All 5 Steps
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadFile(
                      "seo-aeo-5-step-agent-pack.md",
                      pack.compiledFullBundleMarkdown,
                      "text/markdown",
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <Download size={13} />
                  Export .MD
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {(
                [
                  ["step1", "1. Intent", Compass],
                  ["step2", "2. <580px Meta", Sparkles],
                  ["step3", "3. 50w AEO Lead", Wand2],
                  ["step4", "4. E-E-A-T Gaps", ShieldCheck],
                  ["step5", "5. @graph Schema", Code2],
                ] as const
              ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveStepTab(id)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2.5 text-xs font-extrabold transition ${
                    activeStepTab === id
                      ? "bg-[#3452d1] text-white shadow"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {activeStepTab === "step1" && (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                Step 1 of 5 · Search &amp; AI Answer Intent Classification
              </span>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    Classified Primary Intent
                  </span>
                  <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                    {pack.step1IntentClassification.primaryIntent}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    Buyer / Reader Stage
                  </span>
                  <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                    {pack.step1IntentClassification.buyerStage}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <span className="text-[11px] font-bold uppercase text-slate-400">
                  AEO &amp; AI Overview Citation Strategy
                </span>
                <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                  {pack.step1IntentClassification.aeoVisibilityAngle}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <span className="text-[11px] font-bold uppercase text-slate-400">
                  Target Query &amp; Keyword Cluster
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {pack.step1IntentClassification.targetQueryCluster.map((q) => (
                    <span
                      key={q}
                      className="rounded-lg bg-[#3452d1]/10 px-2.5 py-1 text-xs font-bold text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]"
                    >
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeStepTab === "step2" && (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                  Step 2 of 5 · &lt;580px Meta Title &amp; Single-Sentence Description
                </span>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-300">
                  {pack.step2MetaOptimization.estimatedPixels}px / 580px Safe
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    Optimized Meta Title ({pack.step2MetaOptimization.characterCount} chars)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        pack.step2MetaOptimization.metaTitle,
                      );
                      notify("Copied <580px Meta Title!");
                    }}
                    className="text-xs font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                  >
                    Copy Title
                  </button>
                </div>
                <p className="mt-1.5 text-base font-black text-[#1a0dab] dark:text-[#8ab4f8]">
                  {pack.step2MetaOptimization.metaTitle}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    Single-Sentence Meta Description ({pack.step2MetaOptimization.descriptionCharCount} chars)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        pack.step2MetaOptimization.singleSentenceMetaDescription,
                      );
                      notify("Copied Meta Description!");
                    }}
                    className="text-xs font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                  >
                    Copy Description
                  </button>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {pack.step2MetaOptimization.singleSentenceMetaDescription}
                </p>
              </div>
            </div>
          )}

          {activeStepTab === "step3" && (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Step 3 of 5 · 50-Word AI Overview Power Answer ({pack.step3AeoPowerAnswer.wordCount} words)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      pack.step3AeoPowerAnswer.htmlSnippetBlock,
                    );
                    notify("Copied 50-Word AI Overview Power Answer HTML!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-emerald-500"
                >
                  <Copy size={12} />
                  Copy HTML Lead
                </button>
              </div>

              <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                {pack.step3AeoPowerAnswer.powerAnswerText}
              </p>

              <pre className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-emerald-300 dark:border-slate-800">
                {pack.step3AeoPowerAnswer.htmlSnippetBlock}
              </pre>
            </div>
          )}

          {activeStepTab === "step4" && (
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Step 4 of 5 · E-E-A-T Entity Gap Audit &amp; Copy-Paste Proof Blocks
              </span>
              {pack.step4EeatEntityGaps.map((gap) => (
                <div
                  key={gap.entityOrSignal}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      [{gap.category}] {gap.entityOrSignal}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(gap.remediationSnippet);
                        notify(`Copied ${gap.category} remediation snippet!`);
                      }}
                      className="text-xs font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                    >
                      Copy Fix
                    </button>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {gap.remediationSnippet}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeStepTab === "step5" && (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                  <FileCode2 size={14} />
                  Step 5 of 5 · Connected @graph JSON-LD Schema (WebPage + Article + FAQPage)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(pack.step5JsonLdGraph);
                    notify("Copied @graph JSON-LD Schema!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3 py-1.5 text-xs font-extrabold text-white"
                >
                  <Copy size={12} />
                  Copy JSON-LD
                </button>
              </div>
              <pre className="max-h-96 overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-sky-300 dark:border-slate-800">
                {pack.step5JsonLdGraph}
              </pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

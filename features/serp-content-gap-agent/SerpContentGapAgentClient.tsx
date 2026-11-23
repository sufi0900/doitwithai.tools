"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Download,
  FileText,
  HelpCircle,
  Layers,
  RotateCcw,
  Wand2,
} from "lucide-react";
import {
  DEFAULT_SERP_GAP_INPUT,
  buildDeterministicSerpContentGapPack,
  type SerpContentGapInput,
  type SerpContentGapPack,
} from "./model";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";

export default function SerpContentGapAgentClient() {
  const [input, setInput] = useState<SerpContentGapInput>(
    DEFAULT_SERP_GAP_INPUT,
  );
  const [pack, setPack] = useState<SerpContentGapPack>(() =>
    buildDeterministicSerpContentGapPack(DEFAULT_SERP_GAP_INPUT),
  );
  const [gapEdits, setGapEdits] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"gaps" | "paa" | "markdown">(
    "gaps",
  );
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  function updateField<K extends keyof SerpContentGapInput>(
    key: K,
    value: SerpContentGapInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRunGapAgent(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    await paintToolFeedback();
    try {
      const res = await fetch("/api/ai-tools/serp-content-gap-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.pack) {
        setPack(data.pack);
        setGapEdits({});
        notify(
          data.provider === "ai"
            ? "Autonomous SERP Content Gap & Outranker sections generated!"
            : "Structured SERP Content Gap blueprint built!",
        );
      } else {
        const local = buildDeterministicSerpContentGapPack(input);
        setPack(local);
        setGapEdits({});
        notify("Structured SERP Content Gap blueprint built!");
      }
      setTimeout(() => focusToolSection(resultsRef.current), 60);
    } catch {
      const local = buildDeterministicSerpContentGapPack(input);
      setPack(local);
      setGapEdits({});
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadSample() {
    setLoading(true);
    await paintToolFeedback(420);
    setInput(DEFAULT_SERP_GAP_INPUT);
    setPack(buildDeterministicSerpContentGapPack(DEFAULT_SERP_GAP_INPUT));
    setGapEdits({});
    setLoading(false);
    notify("Loaded sample SERP Content Gap analysis.");
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
      id="serp-content-gap-agent"
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6"
    >
      <ToolRunOverlay
        active={loading}
        title="Analyzing Competitor SERP Coverage & Drafting Missing H2 Sections"
        description="Identifying topical blind spots, Information Gain opportunities, and writing ready-to-paste H2/H3 sections + PAA answers."
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

      {/* 1-Click Live URL Outline Importer */}
      <div className="mb-6">
        <UrlArticleExtractorBar
          label="Option 1: Paste Your Article URL to Extract Current H2 Headings & Detect SERP Content Gaps"
          placeholder="https://doitwithai.tools/ai-seo/meta-title"
          buttonLabel="Extract My Outline"
          onExtracted={(data) => {
            const headings = (data.headings || [])
              .slice(0, 8)
              .map((h) => (typeof h === "string" ? h : h.text))
              .join("\n");
            const nextInput: SerpContentGapInput = {
              ...input,
              targetUrl: data.url || input.targetUrl,
              primaryKeyword:
                data.focusKeyword ||
                (data.title || "").toLowerCase().slice(0, 55) ||
                input.primaryKeyword,
              userHeadingsList: headings || input.userHeadingsList,
            };
            setInput(nextInput);
            setPack(buildDeterministicSerpContentGapPack(nextInput));
            setGapEdits({});
            notify("Extracted current article outline for SERP gap comparison!");
          }}
        />
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-12">
        {/* Left Column: Gap Analysis Inputs */}
        <form
          onSubmit={handleRunGapAgent}
          className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6 lg:col-span-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                SERP Gap &amp; Outranker Inputs
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Compare Outline vs. SERP
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void handleLoadSample()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <RotateCcw size={13} />
              Sample Gap Audit
            </button>
          </div>

          <div>
            <label
              htmlFor="scg-kw"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Primary Target Keyword *
            </label>
            <input
              id="scg-kw"
              type="text"
              required
              value={input.primaryKeyword}
              onChange={(e) => updateField("primaryKeyword", e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="scg-intent"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Dominant SERP Intent
            </label>
            <select
              id="scg-intent"
              value={input.searchIntent}
              onChange={(e) =>
                updateField(
                  "searchIntent",
                  e.target.value as SerpContentGapInput["searchIntent"],
                )
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="Informational (Guide / Tutorial)">
                Informational (Guide / Tutorial)
              </option>
              <option value="Commercial Investigation (Comparison / Best X)">
                Commercial Investigation (Comparison / Best X)
              </option>
              <option value="Transactional (Tool / Template / Product)">
                Transactional (Tool / Template / Product)
              </option>
              <option value="Troubleshooting & How-To Fix">
                Troubleshooting &amp; How-To Fix
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="scg-user-h"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Your Current H2 Headings (1 per line)
            </label>
            <textarea
              id="scg-user-h"
              rows={3}
              value={input.userHeadingsList}
              onChange={(e) => updateField("userHeadingsList", e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="scg-comp"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Competitor Subtopics / Missing Questions (1 per line)
            </label>
            <textarea
              id="scg-comp"
              rows={4}
              value={input.competitorTopicsOrUrls}
              onChange={(e) =>
                updateField("competitorTopicsOrUrls", e.target.value)
              }
              className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="scg-angle"
              className="block text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300"
            >
              Your Unique Information Gain Angle
            </label>
            <textarea
              id="scg-angle"
              rows={2}
              value={input.uniquePractitionerAngle}
              onChange={(e) =>
                updateField("uniquePractitionerAngle", e.target.value)
              }
              className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3452d1] to-[#5271ff] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            <Wand2 size={16} />
            {loading
              ? "Detecting Gaps & Writing Missing H2 Sections..."
              : "Run SERP Content Gap & Outranker Agent"}
          </button>
        </form>

        {/* Right Column: Interactive Gap Closure Workspace */}
        <div
          ref={resultsRef}
          tabIndex={-1}
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6 lg:col-span-7"
        >
          {/* Coverage Lift & Export Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-xl bg-amber-500/15 px-3 py-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-300">
                Current Coverage: {pack.baselineCoverageScore}%
              </span>
              <span className="text-xs font-black text-slate-400">→</span>
              <span className="rounded-xl bg-emerald-500/15 px-3 py-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                After Gap Patch: {pack.outrankScoreProjection}%
              </span>
              <span className="rounded-xl bg-[#3452d1]/10 px-3 py-1.5 text-xs font-extrabold text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                {pack.missingSubtopicGaps.length} H2 Sections Drafted
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    pack.compiledOutrankBlueprintMarkdown,
                  );
                  notify("Copied all missing H2 sections + PAA answers!");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#4361ee]"
              >
                <Copy size={13} />
                Copy All Gap Sections
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    `${input.primaryKeyword.replace(/\s+/g, "-") || "serp"}-gap-patch.md`,
                    pack.compiledOutrankBlueprintMarkdown,
                    "text/markdown",
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <Download size={13} />
                Download .MD
              </button>
            </div>
          </div>

          {/* Intent Diagnosis Banner */}
          <div className="rounded-2xl border border-[#5271ff]/30 bg-[#3452d1]/5 p-4 dark:bg-[#3452d1]/10">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
              SERP Intent &amp; Outrank Diagnosis
            </span>
            <p className="mt-1 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
              {pack.detectedIntentSummary}
            </p>
          </div>

          {/* View Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              {
                id: "gaps" as const,
                label: "1. Ready-to-Paste Missing H2 Sections",
                icon: Layers,
              },
              {
                id: "paa" as const,
                label: "2. People Also Ask (PAA) Blocks",
                icon: HelpCircle,
              },
              {
                id: "markdown" as const,
                label: "3. Full Outranker Markdown",
                icon: FileText,
              },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                    activeTab === t.id
                      ? "bg-[#3452d1] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {activeTab === "gaps" && (
            <div className="space-y-4">
              {pack.missingSubtopicGaps.map((gap, idx) => {
                const body =
                  gapEdits[gap.id] !== undefined
                    ? gapEdits[gap.id]
                    : gap.readyToPasteMarkdown;
                return (
                  <article
                    key={gap.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/70"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span
                          className={`inline-block rounded-lg px-2.5 py-0.5 text-[11px] font-extrabold ${
                            gap.gapSeverity === "High-Priority Gap"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                              : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          }`}
                        >
                          Gap #{idx + 1} · {gap.gapSeverity}
                        </span>
                        <h3 className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
                          ## {gap.missingHeading}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            `## ${gap.missingHeading}\n\n${body}`,
                          );
                          notify(`Copied Missing H2 Section #${idx + 1}!`);
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Copy H2 Section
                      </button>
                    </div>

                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {gap.competitorCoverageNote}
                    </p>

                    <textarea
                      rows={6}
                      value={body}
                      onChange={(e) =>
                        setGapEdits((prev) => ({
                          ...prev,
                          [gap.id]: e.target.value,
                        }))
                      }
                      className="mt-3 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-xs leading-relaxed text-slate-800 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    />
                  </article>
                );
              })}
            </div>
          )}

          {activeTab === "paa" && (
            <div className="space-y-3.5">
              {pack.peopleAlsoAskBlocks.map((paa, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Q: {paa.question}
                    </h3>
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          `### ${paa.question}\n${paa.conciseAnswer}`,
                        );
                        notify("Copied PAA Question & Answer!");
                      }}
                      className="text-xs font-bold text-[#3452d1] underline dark:text-[#9aabff]"
                    >
                      Copy Q&amp;A
                    </button>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    {paa.conciseAnswer}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "markdown" && (
            <div>
              <textarea
                rows={18}
                readOnly
                value={pack.compiledOutrankBlueprintMarkdown}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              />
            </div>
          )}

          {/* Chaining Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/90">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Pair with semantic entity analysis or Information Gain auditing:
            </span>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/tools/semantic-entity-gap-analyzer"
                className="rounded-xl bg-[#3452d1] px-3 py-1.5 text-xs font-extrabold text-white"
              >
                Semantic Entity Gap Analyzer →
              </Link>
              <Link
                href="/tools/information-gain-auditor"
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Information Gain Auditor →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

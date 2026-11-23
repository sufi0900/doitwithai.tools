"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  FileText,
  RotateCcw,
  Sparkles,
  Table,
  Wand2,
} from "lucide-react";
import {
  DEFAULT_GEO_CITATION_INPUT,
  buildDeterministicGeoCitationPack,
  type GeoCitationInput,
  type GeoCitationPack,
} from "./model";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";

export default function AiCitationGeoAgentClient() {
  const [input, setInput] = useState<GeoCitationInput>(
    DEFAULT_GEO_CITATION_INPUT,
  );
  const [pack, setPack] = useState<GeoCitationPack>(() =>
    buildDeterministicGeoCitationPack(DEFAULT_GEO_CITATION_INPUT),
  );
  const [activeTab, setActiveTab] = useState<
    "passages" | "matrix" | "schema" | "markdown"
  >("passages");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  function updateField<K extends keyof GeoCitationInput>(
    key: K,
    value: GeoCitationInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRunGeoAgent(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    await paintToolFeedback();
    try {
      const res = await fetch("/api/ai-tools/ai-citation-geo-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.pack) {
        setPack(data.pack);
        notify(
          data.provider === "ai"
            ? "Autonomous GEO & AI Citation pack generated!"
            : "Structured GEO Citation & Entity pack built!",
        );
      } else {
        const local = buildDeterministicGeoCitationPack(input);
        setPack(local);
        notify("Structured GEO Citation & Entity pack built!");
      }
      setTimeout(() => focusToolSection(resultsRef.current), 60);
    } catch {
      const local = buildDeterministicGeoCitationPack(input);
      setPack(local);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadSample() {
    setLoading(true);
    await paintToolFeedback(420);
    setInput(DEFAULT_GEO_CITATION_INPUT);
    setPack(buildDeterministicGeoCitationPack(DEFAULT_GEO_CITATION_INPUT));
    setLoading(false);
    notify("Loaded sample GEO & AI Citation brief.");
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
      id="ai-citation-geo-agent"
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6"
    >
      <ToolRunOverlay
        active={loading}
        title="Refactoring Content for AI Overviews, Perplexity & ChatGPT Citations"
        description="Synthesizing 50-word RAG definition leads, Markdown fact matrices, quotable passage chunks, and Person/Organization sameAs JSON-LD."
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

      {/* 1-Click Live URL Content Importer */}
      <div className="mb-6">
        <UrlArticleExtractorBar
          label="Option 1: Paste Any Public Article URL to Extract Topic & Opening Paragraphs for GEO Refactoring"
          placeholder="https://doitwithai.tools/ai-seo/what-is-ai-seo"
          buttonLabel="Extract Article for GEO"
          onExtracted={(data) => {
            const openingText = (data.paragraphs || []).slice(0, 3).join("\n\n");
            const nextInput: GeoCitationInput = {
              ...input,
              targetUrl: data.url || input.targetUrl,
              primaryTopicOrQuery:
                data.focusKeyword || data.title || input.primaryTopicOrQuery,
              rawDraftOrParagraphs: openingText || input.rawDraftOrParagraphs,
            };
            setInput(nextInput);
            setPack(buildDeterministicGeoCitationPack(nextInput));
            notify("Extracted article topic and opening paragraphs for GEO upgrade!");
          }}
        />
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-12">
        {/* Left Column: GEO Brief & Entity Controls */}
        <form
          onSubmit={handleRunGeoAgent}
          className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6 lg:col-span-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                GEO &amp; RAG Citation Inputs
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Entity &amp; Answer Signals
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void handleLoadSample()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <RotateCcw size={13} />
              Sample Brief
            </button>
          </div>

          <div>
            <label
              htmlFor="geo-topic"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Primary Topic or AI Search Query *
            </label>
            <input
              id="geo-topic"
              type="text"
              required
              value={input.primaryTopicOrQuery}
              onChange={(e) =>
                updateField("primaryTopicOrQuery", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="geo-entity"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Author · Brand Entity
              </label>
              <input
                id="geo-entity"
                type="text"
                value={input.brandOrAuthorEntity}
                onChange={(e) =>
                  updateField("brandOrAuthorEntity", e.target.value)
                }
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="geo-goal"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                GEO Focus Mode
              </label>
              <select
                id="geo-goal"
                value={input.optimizationGoal}
                onChange={(e) =>
                  updateField(
                    "optimizationGoal",
                    e.target.value as GeoCitationInput["optimizationGoal"],
                  )
                }
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="Full AI Overview & Perplexity Readiness">
                  Full AI Overview &amp; Perplexity Readiness
                </option>
                <option value="Quotable Data & Fact Tables">
                  Quotable Data &amp; Fact Tables
                </option>
                <option value="Entity Disambiguation & sameAs Schema">
                  Entity Disambiguation &amp; sameAs Schema
                </option>
                <option value="Direct Answer Lead Refactoring">
                  Direct Answer Lead Refactoring
                </option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="geo-draft"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Current Unstructured Draft / Opening Paragraphs
            </label>
            <textarea
              id="geo-draft"
              rows={3}
              value={input.rawDraftOrParagraphs}
              onChange={(e) =>
                updateField("rawDraftOrParagraphs", e.target.value)
              }
              className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="geo-proof"
              className="block text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300"
            >
              First-Party Metric / Practitioner Proof (Information Gain)
            </label>
            <textarea
              id="geo-proof"
              rows={3}
              value={input.proprietaryStatOrProof}
              onChange={(e) =>
                updateField("proprietaryStatOrProof", e.target.value)
              }
              className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="geo-profiles"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Verified Profile URLs for sameAs Schema (1 per line)
            </label>
            <textarea
              id="geo-profiles"
              rows={3}
              value={input.verifiedProfilesList}
              onChange={(e) =>
                updateField("verifiedProfilesList", e.target.value)
              }
              className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-mono text-xs text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3452d1] to-[#5271ff] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            <Wand2 size={16} />
            {loading
              ? "Synthesizing GEO Passages & Entity Graph..."
              : "Run Autonomous GEO & Citation Agent"}
          </button>
        </form>

        {/* Right Column: GEO Citation Workspace */}
        <div
          ref={resultsRef}
          tabIndex={-1}
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6 lg:col-span-7"
        >
          {/* Citation Readiness Lift & Export Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-xl bg-amber-500/15 px-3 py-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-300">
                Draft Readiness: {pack.citationReadinessScore}/100
              </span>
              <span className="text-xs font-black text-slate-400">→</span>
              <span className="rounded-xl bg-emerald-500/15 px-3 py-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                GEO Upgraded: {pack.upgradedScoreProjection}/100
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    pack.citationReadyFullMarkdown,
                  );
                  notify("Copied full GEO Citation Markdown brief!");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#4361ee]"
              >
                <Copy size={13} />
                Copy GEO Brief
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    `${input.primaryTopicOrQuery.replace(/\s+/g, "-").slice(0, 40) || "geo"}-citation-pack.md`,
                    pack.citationReadyFullMarkdown,
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

          {/* Workspace View Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              {
                id: "passages" as const,
                label: "1. Quotable RAG Passages (3)",
                icon: Sparkles,
              },
              {
                id: "matrix" as const,
                label: "2. Comparison Fact Matrix",
                icon: Table,
              },
              {
                id: "schema" as const,
                label: "3. Entity sameAs JSON-LD",
                icon: Code2,
              },
              {
                id: "markdown" as const,
                label: "4. Compiled GEO Markdown",
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

          {activeTab === "passages" && (
            <div className="space-y-4">
              {/* Direct HTML Definition Box */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Drop-In Semantic HTML Definition Lead (&lt;aside&gt;)
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        pack.directAnswerDefinitionHtml,
                      );
                      notify("Copied semantic HTML definition block!");
                    }}
                    className="rounded-lg border border-emerald-500/30 bg-white px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-slate-900 dark:text-emerald-300"
                  >
                    Copy HTML
                  </button>
                </div>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-3 font-mono text-xs text-emerald-300">
                  {pack.directAnswerDefinitionHtml}
                </pre>
              </div>

              {/* Before -> After Quotable Passage Cards */}
              {pack.quotablePassages.map((p, idx) => (
                <article
                  key={p.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                        RAG Chunk {idx + 1} · {p.wordCount} Words
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {p.queryIntent}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(p.citationReadyAfter);
                        notify(`Copied Quotable Passage ${idx + 1}!`);
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      Copy Passage
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-rose-600 line-through dark:text-rose-400">
                    Unstructured Draft: &quot;{p.fluffyBefore}&quot;
                  </p>

                  <div className="mt-2.5 rounded-xl border border-emerald-500/30 bg-white p-3 text-sm font-medium leading-relaxed text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                    {p.citationReadyAfter}
                  </div>

                  <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <CheckCircle2
                      size={14}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />
                    <span>
                      <strong>Why AI Search Cites This:</strong>{" "}
                      {p.whyLLMsCiteThis}
                    </span>
                  </p>
                </article>
              ))}
            </div>
          )}

          {activeTab === "matrix" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Machine-Readable Markdown Comparison Table for Grounded LLM Extraction:
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      pack.comparisonFactMatrixMarkdown,
                    );
                    notify("Copied Markdown Comparison Table!");
                  }}
                  className="rounded-xl bg-[#3452d1] px-3 py-1.5 text-xs font-extrabold text-white"
                >
                  Copy Table Markdown
                </button>
              </div>
              <textarea
                rows={10}
                readOnly
                value={pack.comparisonFactMatrixMarkdown}
                className="w-full rounded-2xl border border-slate-300 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-300 focus:outline-none dark:border-slate-800"
              />

              <div className="space-y-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  4 Core GEO Citation Audit Signals
                </h3>
                {pack.auditSignals.map((sig, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {sig.signal}{" "}
                        <span className="ml-1.5 text-emerald-600 dark:text-emerald-400">
                          ({sig.scoreImpact})
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                        {sig.remediation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "schema" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Disambiguated TechArticle + Person + Organization sameAs Knowledge Graph:
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      pack.entityKnowledgeGraphJsonLd,
                    );
                    notify("Copied Entity Knowledge Graph JSON-LD!");
                  }}
                  className="rounded-xl bg-[#3452d1] px-3 py-1.5 text-xs font-extrabold text-white"
                >
                  Copy JSON-LD
                </button>
              </div>
              <textarea
                rows={18}
                readOnly
                value={pack.entityKnowledgeGraphJsonLd}
                className="w-full rounded-2xl border border-slate-300 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-sky-300 focus:outline-none dark:border-slate-800"
              />
            </div>
          )}

          {activeTab === "markdown" && (
            <div>
              <textarea
                rows={18}
                readOnly
                value={pack.citationReadyFullMarkdown}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              />
            </div>
          )}

          {/* Workflow Chaining Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/90">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Chain into full citation readiness or entity profile verification:
            </span>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/tools/ai-citation-readiness-checker"
                className="rounded-xl bg-[#3452d1] px-3 py-1.5 text-xs font-extrabold text-white"
              >
                Check AI Citation Readiness →
              </Link>
              <Link
                href="/tools/entity-sameas-finder"
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Entity &amp; sameAs Finder →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

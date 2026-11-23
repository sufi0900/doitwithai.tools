"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  FileCode2,
  Image as ImageIcon,
  ListTree,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  DEFAULT_ON_PAGE_REPAIR_INPUT,
  buildDeterministicOnPageRepairPack,
  type OnPageRepairInput,
  type OnPageRepairPack,
} from "./model";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";

export default function OnPageRepairAgentClient() {
  const [input, setInput] = useState<OnPageRepairInput>(
    DEFAULT_ON_PAGE_REPAIR_INPUT,
  );
  const [pack, setPack] = useState<OnPageRepairPack>(() =>
    buildDeterministicOnPageRepairPack(DEFAULT_ON_PAGE_REPAIR_INPUT),
  );
  const [activeTab, setActiveTab] = useState<
    "diagnostics" | "headings" | "schema" | "head-patch"
  >("diagnostics");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  function updateField<K extends keyof OnPageRepairInput>(
    key: K,
    value: OnPageRepairInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRunAgent(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    await paintToolFeedback();
    try {
      const res = await fetch("/api/ai-tools/on-page-repair-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.pack) {
        setPack(data.pack);
        notify(
          data.provider === "ai"
            ? "Autonomous On-Page SEO Repair pack generated!"
            : "Structured On-Page SEO Repair patch built!",
        );
      } else {
        const local = buildDeterministicOnPageRepairPack(input);
        setPack(local);
        notify("Structured On-Page SEO Repair patch built!");
      }
      setTimeout(() => focusToolSection(resultsRef.current), 60);
    } catch {
      const local = buildDeterministicOnPageRepairPack(input);
      setPack(local);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadSample() {
    setLoading(true);
    await paintToolFeedback(420);
    setInput(DEFAULT_ON_PAGE_REPAIR_INPUT);
    setPack(buildDeterministicOnPageRepairPack(DEFAULT_ON_PAGE_REPAIR_INPUT));
    setLoading(false);
    notify("Loaded sample On-Page SEO Repair audit.");
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
      id="on-page-ai-seo-repair-agent"
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6"
    >
      <ToolRunOverlay
        active={loading}
        title="Running Autonomous On-Page SEO Diagnosis & Code Repair"
        description="Auditing SERP pixel width, rewriting metadata, refactoring H1/H2 landmarks, and compiling drop-in HTML + JSON-LD patches."
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

      {/* 1-Click Live URL Page Importer */}
      <div className="mb-6">
        <UrlArticleExtractorBar
          label="Option 1: Paste Any Public Page URL to Auto-Extract Current Title, Meta, Headings & Images for Repair"
          placeholder="https://doitwithai.tools/ai-seo/write-slug-urls"
          buttonLabel="Extract Page Signals"
          onExtracted={(data) => {
            const headings = (data.headings || [])
              .slice(0, 6)
              .map((h) => (typeof h === "string" ? h : h.text))
              .join("\n");
            const missingAltImgs = (data.images || [])
              .filter((img) => !img.alt || img.alt.trim().length < 5)
              .slice(0, 5)
              .map((img) => img.src.split("/").pop()?.split("?")[0] || "image.png")
              .join("\n");
            const nextInput: OnPageRepairInput = {
              ...input,
              targetUrl: data.url || input.targetUrl,
              primaryKeyword:
                data.focusKeyword ||
                (data.title || "").toLowerCase().slice(0, 50) ||
                input.primaryKeyword,
              currentTitle: data.title || input.currentTitle,
              currentDescription: data.description || input.currentDescription,
              currentH1: data.title || input.currentH1,
              headingsList: headings || input.headingsList,
              imagesWithoutAlt: missingAltImgs || input.imagesWithoutAlt,
            };
            setInput(nextInput);
            setPack(buildDeterministicOnPageRepairPack(nextInput));
            notify("Extracted live page metadata, headings, and image signals!");
          }}
        />
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-12">
        {/* Left Column: Page Signals & Agent Controls */}
        <form
          onSubmit={handleRunAgent}
          className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6 lg:col-span-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                Autonomous Repair Inputs
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Page Signals &amp; Target Intent
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void handleLoadSample()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <RotateCcw size={13} />
              Sample Audit
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="opr-kw"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Primary Target Keyword *
              </label>
              <input
                id="opr-kw"
                type="text"
                required
                value={input.primaryKeyword}
                onChange={(e) => updateField("primaryKeyword", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="opr-focus"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Agent Repair Mode
              </label>
              <select
                id="opr-focus"
                value={input.repairFocus}
                onChange={(e) =>
                  updateField(
                    "repairFocus",
                    e.target.value as OnPageRepairInput["repairFocus"],
                  )
                }
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="Full Technical & Editorial Repair">
                  Full Technical &amp; Editorial Repair
                </option>
                <option value="CTR & Snippet Optimization">
                  CTR &amp; Snippet Optimization
                </option>
                <option value="Schema & Structured Data">
                  Schema &amp; Structured Data
                </option>
                <option value="AI Overview & Position Zero">
                  AI Overview &amp; Position Zero
                </option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="opr-sec"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Supporting Entities / Secondary Keywords
            </label>
            <input
              id="opr-sec"
              type="text"
              value={input.secondaryKeywords}
              onChange={(e) => updateField("secondaryKeywords", e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="opr-title"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Current Meta Title
              </label>
              <input
                id="opr-title"
                type="text"
                value={input.currentTitle}
                onChange={(e) => updateField("currentTitle", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="opr-h1"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Current H1 Heading
              </label>
              <input
                id="opr-h1"
                type="text"
                value={input.currentH1}
                onChange={(e) => updateField("currentH1", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="opr-desc"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Current Meta Description
            </label>
            <textarea
              id="opr-desc"
              rows={2}
              value={input.currentDescription}
              onChange={(e) =>
                updateField("currentDescription", e.target.value)
              }
              className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="opr-headings"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Current H2 Headings (1/line)
              </label>
              <textarea
                id="opr-headings"
                rows={3}
                value={input.headingsList}
                onChange={(e) => updateField("headingsList", e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="opr-imgs"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Unoptimized Images (1/line)
              </label>
              <textarea
                id="opr-imgs"
                rows={3}
                value={input.imagesWithoutAlt}
                onChange={(e) =>
                  updateField("imagesWithoutAlt", e.target.value)
                }
                className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3452d1] to-[#5271ff] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            <Wand2 size={16} />
            {loading
              ? "Diagnosing & Synthesizing Code Patches..."
              : "Run Autonomous On-Page Repair Agent"}
          </button>
        </form>

        {/* Right Column: Interactive Repair Dashboard */}
        <div
          ref={resultsRef}
          tabIndex={-1}
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6 lg:col-span-7"
        >
          {/* Health Score Lift & Primary Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-xl bg-amber-500/15 px-3 py-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-300">
                Before: {pack.overallHealthScore}/100
              </span>
              <span className="text-xs font-black text-slate-400">→</span>
              <span className="rounded-xl bg-emerald-500/15 px-3 py-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                After Patch: {pack.repairedScoreProjection}/100
              </span>
              <span className="rounded-xl bg-[#3452d1]/10 px-3 py-1.5 text-xs font-extrabold text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                {pack.diagnostics.length} Auto-Repairs Ready
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(pack.completeHeadPatchHtml);
                  notify("Copied full HTML <head> + JSON-LD patch!");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#4361ee]"
              >
                <Copy size={13} />
                Copy &lt;head&gt; Patch
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    `${input.primaryKeyword.replace(/\s+/g, "-") || "seo"}-repair-patch.html`,
                    pack.completeHeadPatchHtml,
                    "text/html",
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <Download size={13} />
                Download .HTML
              </button>
            </div>
          </div>

          {/* Repaired SERP Snippet Preview Box */}
          <div className="rounded-2xl border border-[#5271ff]/30 bg-slate-50/90 p-4 dark:bg-slate-900/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                Repaired Google SERP &amp; AI Citation Preview ({pack.titlePixelEstimate}px · {pack.descriptionCharCount} chars)
              </span>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    `Title: ${pack.optimizedTitle}\nDescription: ${pack.optimizedDescription}`,
                  );
                  notify("Copied repaired Title & Meta Description!");
                }}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Copy Meta
              </button>
            </div>
            <p className="mt-2 truncate text-xs text-emerald-700 dark:text-emerald-400">
              {pack.canonicalUrl}
            </p>
            <h3 className="mt-0.5 text-base font-bold text-[#1a0dab] dark:text-[#8ab4f8]">
              {pack.optimizedTitle}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {pack.optimizedDescription}
            </p>
          </div>

          {/* Workspace View Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              {
                id: "diagnostics" as const,
                label: "1. Diagnostics & Position Zero",
                icon: Sparkles,
              },
              {
                id: "headings" as const,
                label: "2. Heading & Alt Refactors",
                icon: ListTree,
              },
              {
                id: "schema" as const,
                label: "3. JSON-LD @graph",
                icon: Code2,
              },
              {
                id: "head-patch" as const,
                label: "4. Drop-In <head> Patch",
                icon: FileCode2,
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

          {activeTab === "diagnostics" && (
            <div className="space-y-4">
              {/* Position Zero Answer Block */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Auto-Generated 50-Word Position Zero / AI Overview Lead HTML
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        pack.positionZeroLeadBlock,
                      );
                      notify("Copied Position Zero HTML lead block!");
                    }}
                    className="rounded-lg border border-emerald-500/30 bg-white px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-slate-900 dark:text-emerald-300"
                  >
                    Copy HTML Block
                  </button>
                </div>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-3 font-mono text-xs text-emerald-300">
                  {pack.positionZeroLeadBlock}
                </pre>
              </div>

              {/* Diagnostic Cards */}
              {pack.diagnostics.map((d) => (
                <div
                  key={d.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                      {d.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[11px] font-extrabold ${
                        d.severity === "Critical"
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      <AlertTriangle size={12} />
                      {d.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                    {d.issue}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    <strong>SEO Impact:</strong> {d.impact}
                  </p>
                  <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                    <span>
                      <strong>Agent Auto-Fix:</strong> {d.autoFixSummary}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "headings" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Before → After Heading Hierarchy Refactors
                </h3>
                {pack.headingRefactors.map((h, i) => (
                  <div
                    key={`${h.level}-${i}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-[#3452d1]/15 px-2.5 py-0.5 text-xs font-extrabold text-[#3452d1] dark:text-[#9aabff]">
                        {h.level} Landmark
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(h.afterText);
                          notify(`Copied repaired ${h.level} heading!`);
                        }}
                        className="text-xs font-bold text-[#3452d1] underline dark:text-[#9aabff]"
                      >
                        Copy Heading
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-rose-600 line-through dark:text-rose-400">
                      Before: {h.beforeText}
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                      After: {h.afterText}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {h.intentRationale}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                <h3 className="flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <ImageIcon size={15} />
                  Accessible Image Alt Text &amp; Lazy-Load Patches
                </h3>
                {pack.imageAltPatches.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                        {img.imageNameOrContext}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(img.htmlSnippet);
                          notify("Copied <img> tag snippet!");
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Copy &lt;img&gt;
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs text-emerald-700 dark:text-emerald-300">
                      <strong>Alt:</strong> &quot;{img.suggestedAlt}&quot;
                    </p>
                    <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950 p-2.5 font-mono text-[11px] text-slate-200">
                      {img.htmlSnippet}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "schema" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Validated TechArticle + FAQPage + Author Entity JSON-LD Graph:
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(pack.jsonLdSchemaCode);
                    notify("Copied JSON-LD Schema Graph!");
                  }}
                  className="rounded-xl bg-[#3452d1] px-3 py-1.5 text-xs font-extrabold text-white"
                >
                  Copy JSON-LD
                </button>
              </div>
              <textarea
                rows={18}
                readOnly
                value={pack.jsonLdSchemaCode}
                className="w-full rounded-2xl border border-slate-300 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-300 focus:outline-none dark:border-slate-800"
              />
            </div>
          )}

          {activeTab === "head-patch" && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs text-slate-600 dark:text-slate-300">
                  Complete drop-in HTML <code>&lt;head&gt;</code> patch (Title,
                  Description, Canonical, OpenGraph, Twitter Card, and JSON-LD):
                </p>
                <textarea
                  rows={16}
                  readOnly
                  value={pack.completeHeadPatchHtml}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-sky-300 focus:outline-none dark:border-slate-800"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                  5-Step Deployment Checklist
                </h3>
                <ul className="mt-2.5 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {pack.implementationChecklist.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2
                        size={14}
                        className="mt-0.5 shrink-0 text-emerald-500"
                      />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Workflow Chaining Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/90">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Chain this repair into deep diagnostics or schema validation:
            </span>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/tools/on-page-ai-seo-analyzer"
                className="rounded-xl bg-[#3452d1] px-3 py-1.5 text-xs font-extrabold text-white"
              >
                Open Full On-Page Analyzer →
              </Link>
              <Link
                href="/tools/structured-data-validator"
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Validate JSON-LD →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

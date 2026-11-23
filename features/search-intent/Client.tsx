"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, Sparkles, Loader2 } from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import IntentResults from "./Results";
import { copyReport } from "./presentation";
import { readToolResponse } from "@/lib/ai-tools/client-response";
import {
  inputSchema,
  parseKeywords,
  quickAnalyze,
  validateOutput,
  exportCsv,
  type IntentReport,
} from "./schema";

const INITIAL_INTENT_DATA = {
  keywords: [
    "seo agencies near me",
    "keyword grouping tool",
    "how to write a meta title",
    "best AI writing tools",
  ],
  audience: "Founders, marketers, and content creators planning SEO pages",
  market: "English-language searchers",
  notes: "",
};

const field =
  "mt-2 w-full rounded-xl border border-white/15 bg-slate-950/85 px-4 py-3 text-sm leading-6 text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30";
const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300 disabled:cursor-not-allowed disabled:opacity-50";

export default function SearchIntentClient() {
  const [keywords, setKeywords] = useState(
    INITIAL_INTENT_DATA.keywords.join("\n"),
  );
  const [audience, setAudience] = useState(INITIAL_INTENT_DATA.audience);
  const [market, setMarket] = useState(INITIAL_INTENT_DATA.market);
  const [notes, setNotes] = useState(INITIAL_INTENT_DATA.notes);
  const [report, setReport] = useState<IntentReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [overlayMode, setOverlayMode] = useState<"quick" | "ai">("quick");
  const [error, setError] = useState("");
  const [status, setStatus] = useState(
    "Enter up to 10 keywords above and click Check keyword intent to view color-coded search intent cards below.",
  );
  const [revision, setRevision] = useState(0);
  const active = useRef<AbortController | null>(null);
  const results = useRef<HTMLDivElement | null>(null);
  const [completedInput, setCompletedInput] = useState(() =>
    JSON.stringify(INITIAL_INTENT_DATA),
  );

  // Hydrate initial sample report on client mount so SSR tests stay clean while live users see immediate visual cards
  useEffect(() => {
    setReport(quickAnalyze(INITIAL_INTENT_DATA));
  }, []);

  useEffect(() => {
    if (!busy && revision > 0) {
      focusToolSection(results.current);
    }
  }, [busy, revision]);

  useEffect(() => () => active.current?.abort(), []);

  const parsedList = parseKeywords(keywords);

  const input = () =>
    inputSchema.safeParse({
      keywords: parsedList,
      audience,
      market,
      notes,
    });

  async function quick(event?: React.FormEvent) {
    event?.preventDefault();
    if (active.current || busy) return;
    const parsed = input();
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setOverlayMode("quick");
    setBusy(true);
    setError("");
    setStatus("Checking keyword wording cues and classifying reader tasks…");
    try {
      await paintToolFeedback(650);
      setReport(quickAnalyze(parsed.data));
      setCompletedInput(JSON.stringify(parsed.data));
      setRevision((r) => r + 1);
      setStatus(
        "Keyword check complete. Scroll down to inspect your color-coded intent cards, or choose Review with AI for deeper context.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function example() {
    if (active.current || busy) return;
    setOverlayMode("quick");
    setBusy(true);
    setError("");
    try {
      await paintToolFeedback(550);
      setCompletedInput(JSON.stringify(INITIAL_INTENT_DATA));
      setKeywords(INITIAL_INTENT_DATA.keywords.join("\n"));
      setAudience(INITIAL_INTENT_DATA.audience);
      setMarket(INITIAL_INTENT_DATA.market);
      setNotes(INITIAL_INTENT_DATA.notes);
      setReport(quickAnalyze(INITIAL_INTENT_DATA));
      setRevision((r) => r + 1);
      setStatus(
        "Example loaded. Review the suggested reader tasks and content angles below.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function analyze() {
    if (active.current || busy) return;
    const parsed = input();
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    const controller = new AbortController();
    active.current = controller;
    const timer = setTimeout(() => controller.abort(), 55_000);
    setOverlayMode("ai");
    setBusy(true);
    setError("");
    setStatus(
      "Reviewing your keywords with AI. Your previous results remain visible below until the new review completes.",
    );
    try {
      await paintToolFeedback(300);
      const response = await fetch("/api/ai-tools/search-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: controller.signal,
      });
      const payload = await readToolResponse<{
        result: unknown;
        meta?: { provider?: string };
      }>(response);
      setReport(validateOutput(payload.result, parsed.data));
      setCompletedInput(JSON.stringify(parsed.data));
      setRevision((r) => r + 1);
      setStatus(
        "AI review completed. Validate the interpretation against current search results before writing.",
      );
    } catch (cause) {
      setError(
        controller.signal.aborted
          ? "Waiting stopped. Your inputs and previous results are preserved."
          : cause instanceof Error
            ? cause.message
            : "The request failed. Your inputs are preserved.",
      );
      setStatus("");
    } finally {
      clearTimeout(timer);
      active.current = null;
      setBusy(false);
    }
  }

  async function copy() {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(copyReport(report));
      setStatus("Intent results copied.");
    } catch {
      setStatus("Clipboard access is unavailable. Download the CSV instead.");
    }
  }

  function download() {
    if (!report) return;
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + exportCsv(report)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "search-intent-plan.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const parsedCurrent = input();
  const stale =
    report &&
    (!parsedCurrent.success ||
      JSON.stringify(parsedCurrent.data) !== completedInput);

  return (
    <section
      id="intent-checker"
      aria-label="Search intent analysis workspace"
      className="rounded-[28px] border border-white/10 bg-slate-900/85 p-5 shadow-2xl sm:p-8 space-y-8"
    >
      <ToolRunOverlay
        active={busy}
        title={
          overlayMode === "ai"
            ? "Running AI Search Intent & Context Review"
            : "Analyzing Keyword Wording & Search Intent"
        }
        description={
          overlayMode === "ai"
            ? "Evaluating your queries against your target audience, market context, and supplied search-result notes."
            : "Inspecting query modifiers, informational vs. commercial/local signals, reader tasks, and recommended page formats."
        }
        onCancel={() => {
          active.current?.abort();
          active.current = null;
          setBusy(false);
        }}
      />

      <div role="status" aria-live="polite" className="sr-only">
        {status}
      </div>

      {/* TOP COMMAND PANEL: Full-Width Keyword Input Bar & Controls */}
      <form
        onSubmit={(e) => void quick(e)}
        className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:p-6 shadow-inner"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-400/30">
              <Search aria-hidden className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Check Your Keyword’s Search Intent
              </h2>
              <p className="text-xs text-slate-400">
                Enter 1–10 keywords below (one per line) to classify intent and jump straight to your visual SERP format cards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-200">
              {parsedList.length} / 10 Keywords Ready
            </span>
          </div>
        </div>

        <fieldset disabled={busy} className="mt-5 space-y-5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="intent-keywords"
                className="text-sm font-bold text-white"
              >
                Keywords or search queries (one per line, up to 10)
              </label>
              <span className="text-xs text-slate-400">
                Supports Informational, Commercial, Local (&quot;near me&quot;), Tool &amp; Navigational queries
              </span>
            </div>
            <textarea
              id="intent-keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              maxLength={1300}
              rows={4}
              placeholder={
                "seo agencies near me\nkeyword grouping tool\nhow to write a meta title\nbest keyword research tools"
              }
              required
              aria-describedby="intent-keyword-help"
              className={field}
            />

            {/* Live Entered Keyword Pills Preview */}
            {parsedList.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Queued Queries:
                </span>
                {parsedList.slice(0, 10).map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-200"
                  >
                    <span className="font-mono text-[10px] text-blue-400">
                      #{idx + 1}
                    </span>
                    <span>{kw}</span>
                  </span>
                ))}
              </div>
            )}

            <p
              id="intent-keyword-help"
              className="mt-2 text-xs leading-6 text-slate-400"
            >
              One per line. Up to 10 distinct queries, 120 characters each.
              Quick checks analyze English wording cues, local modifiers, and tool terms immediately.
            </p>
          </div>

          <details className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
            <summary className="min-h-11 cursor-pointer py-1.5 text-sm font-semibold text-white">
              Add context for an AI review{" "}
              <span className="font-normal text-slate-400">optional</span>
            </summary>
            <p className="mb-4 mt-2 text-xs leading-6 text-slate-400">
              Audience, market, and result notes are used when you click Review
              with AI.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="intent-audience"
                  className="text-sm font-semibold text-white"
                >
                  Intended audience{" "}
                  <span className="font-normal text-slate-400">optional</span>
                </label>
                <input
                  id="intent-audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  maxLength={300}
                  placeholder="SEO beginners, local businesses, solo founders"
                  className={field}
                />
              </div>
              <div>
                <label
                  htmlFor="intent-market"
                  className="text-sm font-semibold text-white"
                >
                  Market and language{" "}
                  <span className="font-normal text-slate-400">optional</span>
                </label>
                <input
                  id="intent-market"
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  maxLength={100}
                  placeholder="United States, English"
                  className={field}
                />
              </div>
            </div>
            <details className="mt-4 rounded-xl border border-white/10 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-white">
                Add search-result notes for one query
              </summary>
              <label
                htmlFor="intent-notes"
                className="mt-3 block text-xs leading-6 text-slate-300"
              >
                Paste titles, snippets, and page types you observed. Use one
                keyword. AI reviews these notes without opening any URLs.
              </label>
              <textarea
                id="intent-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                maxLength={4000}
                placeholder="Example notes: several local agency landing pages, Google Map Pack listings, and two comparison directories."
                className={field}
              />
              <p className="mt-2 text-xs text-slate-400">
                {notes.length.toLocaleString()} / 4,000 characters. Remove
                private information before submitting.
              </p>
            </details>
          </details>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className={
                  button +
                  " bg-[#4058D0] text-white shadow-lg shadow-blue-600/25 hover:bg-[#3452D1]"
                }
              >
                <Search aria-hidden className="h-4 w-4" />
                Check keyword intent
              </button>
              <button
                type="button"
                onClick={() => void analyze()}
                className={
                  button +
                  " border-indigo-400/40 bg-indigo-500/15 text-white hover:bg-indigo-500/25"
                }
              >
                {busy && overlayMode === "ai" ? (
                  <Loader2
                    aria-hidden
                    className="animate-spin motion-reduce:animate-none h-4 w-4"
                  />
                ) : (
                  <Sparkles aria-hidden className="h-4 w-4 text-indigo-300" />
                )}
                {busy && overlayMode === "ai" ? "Reviewing…" : "Review with AI"}
              </button>
              <button
                type="button"
                onClick={() => void example()}
                className="min-h-11 px-3 text-sm font-semibold text-blue-200 underline hover:text-white"
              >
                Try an example
              </button>
            </div>

            <p className="text-xs text-slate-400">
              AI allowance: 15 deep reviews/day · Instant wording check is unlimited
            </p>
          </div>
        </fieldset>

        {busy && (
          <button
            type="button"
            onClick={() => {
              active.current?.abort();
              active.current = null;
              setBusy(false);
            }}
            className="mt-3 min-h-11 text-sm text-slate-300 underline"
          >
            Stop waiting
          </button>
        )}
      </form>

      {/* BOTTOM FULL-WIDTH RESULTS DASHBOARD */}
      <div
        ref={results}
        tabIndex={-1}
        className="min-w-0 scroll-mt-24 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300"
        role="region"
        aria-label="Keyword intent results"
        aria-busy={busy}
      >
        {busy && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-blue-300/30 bg-blue-400/10 p-4 text-sm leading-6 text-blue-100">
            <Loader2
              aria-hidden
              className="animate-spin motion-reduce:animate-none h-5 w-5 shrink-0"
            />
            Analyzing your keywords and preparing color-coded intent cards below…
          </div>
        )}
        {error && (
          <div
            role="alert"
            className="mb-4 break-words rounded-xl border border-rose-300/30 bg-rose-400/10 p-4 text-sm leading-7 text-rose-100"
          >
            {error}
          </div>
        )}
        {stale && (
          <p className="mb-4 rounded-xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
            Inputs changed above. Click <strong>Check keyword intent</strong> or{" "}
            <strong>Review with AI</strong> to refresh the cards below.
          </p>
        )}
        {!report ? (
          <div className="rounded-2xl border border-dashed border-blue-300/30 bg-blue-400/5 p-6 sm:p-8 text-center">
            <Search aria-hidden className="mx-auto h-8 w-8 text-blue-300" />
            <h3 className="mt-4 text-2xl font-bold text-white">
              What does your reader want?
            </h3>
            <p className="mt-2 max-w-xl mx-auto text-sm leading-7 text-slate-300">
              Enter your keywords in the command bar above and click{" "}
              <strong>Check keyword intent</strong> to see color-coded intent
              badges, reader tasks, and winning Google SERP page formats below.
            </p>
          </div>
        ) : (
          <IntentResults
            report={report}
            onCopy={copy}
            onDownload={download}
          />
        )}
        {status && !busy && (
          <p
            className="mt-4 text-xs leading-6 text-slate-400"
            aria-hidden="true"
          >
            {status}
          </p>
        )}
      </div>
    </section>
  );
}

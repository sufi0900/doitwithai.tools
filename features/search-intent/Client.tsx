"use client";
import React, { useEffect, useRef, useState } from "react";
import { Search, Sparkles, Loader2 } from "lucide-react";
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
const field =
  "mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm leading-6 text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30";
const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-bold transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300 disabled:cursor-not-allowed disabled:opacity-50";
export default function SearchIntentClient() {
  const [keywords, setKeywords] = useState("");
  const [audience, setAudience] = useState("");
  const [market, setMarket] = useState("");
  const [notes, setNotes] = useState("");
  const [report, setReport] = useState<IntentReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const active = useRef<AbortController | null>(null);
  const results = useRef<HTMLDivElement | null>(null);
  const [completedInput, setCompletedInput] = useState("");
  useEffect(() => {
    if (!report) return;
    const frame = requestAnimationFrame(() => {
      results.current?.focus({ preventScroll: true });
      results.current?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [report]);
  useEffect(() => () => active.current?.abort(), []);
  const input = () =>
    inputSchema.safeParse({
      keywords: parseKeywords(keywords),
      audience,
      market,
      notes,
    });
  function quick(event?: React.FormEvent) {
    event?.preventDefault();
    if (active.current) return;
    const parsed = input();
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setReport(quickAnalyze(parsed.data));
    setCompletedInput(JSON.stringify(parsed.data));
    setError("");
    setStatus(
      "Keyword check complete. Choose Review with AI to include your audience context and pasted notes.",
    );
  }
  function example() {
    if (active.current) return;
    setCompletedInput(
      JSON.stringify({
        keywords: [
          "how to write a meta title",
          "best AI writing tools",
          "buy a keyword research course",
        ],
        audience: "Content creators planning their first SEO articles",
        market: "English-language readers",
        notes: "",
      }),
    );
    setKeywords(
      "how to write a meta title\nbest AI writing tools\nbuy a keyword research course",
    );
    setAudience("Content creators planning their first SEO articles");
    setMarket("English-language readers");
    setNotes("");
    setReport(
      quickAnalyze({
        keywords: [
          "how to write a meta title",
          "best AI writing tools",
          "buy a keyword research course",
        ],
        audience: "Content creators planning their first SEO articles",
        market: "English-language readers",
        notes: "",
      }),
    );
    setError("");
    setStatus(
      "Example loaded. Review the suggested reader tasks and content angles.",
    );
  }
  async function analyze() {
    if (active.current) return;
    const parsed = input();
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    const controller = new AbortController();
    active.current = controller;
    const timer = setTimeout(() => controller.abort(), 55_000);
    setBusy(true);
    setError("");
    setStatus(
      "Reviewing your keywords. Your previous results remain visible until the new review completes.",
    );
    try {
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
      className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-2xl sm:p-8"
    >
      <div role="status" aria-live="polite" className="sr-only">
        {status}
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form onSubmit={quick} className="min-w-0">
          <div className="mb-5 flex items-center gap-3">
            <Search aria-hidden className="h-6 w-6 text-blue-300" />
            <h2 className="text-xl font-bold text-white">
              Check your keyword’s intent
            </h2>
          </div>
          <fieldset disabled={busy} className="space-y-5">
            <div>
              <label
                htmlFor="intent-keywords"
                className="text-sm font-semibold text-white"
              >
                Keywords or search queries
              </label>
              <textarea
                id="intent-keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                maxLength={1300}
                rows={5}
                placeholder={
                  "how to write a meta title\nbest keyword research tools"
                }
                required
                aria-describedby="intent-keyword-help"
                className={field}
              />
              <p
                id="intent-keyword-help"
                className="mt-2 text-xs leading-6 text-slate-400"
              >
                One per line. Up to 10 distinct queries, 120 characters each.
                Quick checks use English wording cues.
              </p>
            </div>
            <details className="rounded-xl border border-white/10 p-4">
              <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-white">
                Add context for an AI review{" "}
                <span className="font-normal text-slate-400">optional</span>
              </summary>
              <p className="mb-4 mt-2 text-xs leading-6 text-slate-400">
                Audience, market, and result notes are used only by Review with
                AI.
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
                    placeholder="SEO beginners, small businesses"
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
                  rows={5}
                  maxLength={4000}
                  placeholder="Example notes: several comparison pages, one tutorial, and two product pages. Include actual titles when possible."
                  className={field}
                />
                <p className="mt-2 text-xs text-slate-400">
                  {notes.length.toLocaleString()} / 4,000 characters. Remove
                  private information before submitting.
                </p>
              </details>
            </details>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className={
                  button + " bg-[#5271ff] text-white hover:bg-blue-600"
                }
              >
                <Search aria-hidden className="h-4 w-4" />
                Check keyword intent
              </button>
              <button
                type="button"
                onClick={analyze}
                className={button + " text-white"}
              >
                {busy ? (
                  <Loader2
                    aria-hidden
                    className="animate-spin motion-reduce:animate-none h-4 w-4"
                  />
                ) : (
                  <Sparkles aria-hidden className="h-4 w-4" />
                )}
                {busy ? "Reviewing…" : "Review with AI"}
              </button>
              <button
                type="button"
                onClick={example}
                className="min-h-11 px-2 text-sm text-blue-200 underline"
              >
                Try an example
              </button>
            </div>
          </fieldset>
          {busy && (
            <button
              type="button"
              onClick={() => active.current?.abort()}
              className="mt-3 min-h-11 text-sm text-slate-300 underline"
            >
              Stop waiting
            </button>
          )}
          <p className="mt-5 text-xs leading-6 text-slate-400">
            Check keyword intent uses English wording cues. Review with AI
            includes your supplied context and notes.
          </p>
          <p className="mt-2 text-xs leading-6 text-slate-400">
            AI allowance: 15 reviews per day and five starts per ten minutes.
            Failed reviews release their allowance.
          </p>
        </form>
        <div
          ref={results}
          tabIndex={-1}
          className="min-w-0 scroll-mt-32 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300"
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
              Reviewing your keywords. Previous results remain below.
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
              Inputs changed. These results belong to your previous check. Run
              another check to update them.
            </p>
          )}
          {!report ? (
            <div className="rounded-2xl border border-dashed border-blue-300/30 bg-blue-400/5 p-6 sm:p-7">
              <Search aria-hidden className="h-7 w-7 text-blue-300" />
              <h3 className="mt-4 text-2xl font-bold text-white">
                What does your reader want?
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Enter a keyword to see its likely intent and a suggested page
                format.
              </p>
              <p className="mt-4 text-xs leading-6 text-slate-400">
                For example, “how to write a meta title” suggests an
                informational guide.
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
      </div>
    </section>
  );
}

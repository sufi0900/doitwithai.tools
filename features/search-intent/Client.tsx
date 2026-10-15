"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Sparkles, Download, Copy, ArrowRight } from "lucide-react";
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
  const [provider, setProvider] = useState("");
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  const input = () =>
    inputSchema.safeParse({
      keywords: parseKeywords(keywords),
      audience,
      market,
      notes,
    });
  function quick() {
    const parsed = input();
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setReport(quickAnalyze(parsed.data));
    setProvider("");
    setError("");
    setStatus(
      "Quick check completed locally. No AI request was made. Audience context and pasted notes are used only in AI review.",
    );
  }
  function example() {
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
    setProvider("");
    setError("");
    setStatus(
      "Illustrative wording-based example. No AI or search request was made.",
    );
  }
  async function analyze(event: React.FormEvent) {
    event.preventDefault();
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
      setProvider(payload.meta?.provider || "");
      setStatus(
        "AI review completed. Validate the interpretation against current search results before writing.",
      );
    } catch (cause) {
      setError(
        controller.signal.aborted
          ? "Waiting stopped or timed out. An in-flight provider request may still complete. Your inputs and previous results are preserved."
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
      await navigator.clipboard.writeText(
        [
          report.method,
          report.notice,
          ...report.items.map(
            (i) =>
              `${i.keyword}\n${i.primary}\nReader task: ${i.task}\nFormat: ${i.format}\nAngle: ${i.angle}\nNext step: ${i.nextStep}\nUncertainty: ${i.uncertainty}`,
          ),
        ].join("\n\n"),
      );
      setStatus("Planning notes copied.");
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
  return (
    <section
      id="intent-checker"
      aria-label="Search intent analysis workspace"
      className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-2xl sm:p-8"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form onSubmit={analyze} className="min-w-0">
          <div className="mb-5 flex items-center gap-3">
            <Search aria-hidden className="h-6 w-6 text-blue-300" />
            <h2 className="text-xl font-bold text-white">
              Start with the reader’s query
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
              </p>
            </div>
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
            <details className="rounded-xl border border-white/10 p-4">
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
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className={
                  button + " bg-[#5271ff] text-white hover:bg-blue-600"
                }
              >
                <Sparkles aria-hidden className="h-4 w-4" />
                {busy ? "Reviewing…" : "Review with AI"}
              </button>
              <button
                type="button"
                onClick={quick}
                className={button + " text-white"}
              >
                Quick check · no API
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
            Quick check uses wording rules only. AI review uses your supplied
            text, with Gemini first and Groq as backup. No live search is
            performed.
          </p>
          <p className="mt-2 text-xs leading-6 text-slate-400">
            AI allowance: 15 reviews per day and five starts per ten minutes.
            Failed reviews release their allowance.
          </p>
        </form>
        <div className="min-w-0" aria-busy={busy}>
          <div
            role="status"
            aria-live="polite"
            className="text-sm leading-6 text-blue-100"
          >
            {status}
          </div>
          {error && (
            <div
              role="alert"
              className="mt-4 break-words rounded-xl border border-rose-300/30 bg-rose-400/10 p-4 text-sm leading-7 text-rose-100"
            >
              {error}
            </div>
          )}
          {!report ? (
            <div className="mt-5 rounded-2xl border border-dashed border-white/15 p-7">
              <h3 className="text-xl font-bold text-white">
                An intent label should lead to a useful decision
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                See the likely reader task, supporting wording, page format,
                content angle, and next step. Ambiguous queries stay uncertain.
              </p>
              <p className="mt-4 text-xs leading-6 text-slate-400">
                Try an example to inspect the output without spending API quota.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-5 rounded-2xl border border-blue-300/20 bg-blue-400/5 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-bold text-white">{report.method}</h3>
                  <span className="text-xs text-slate-300">
                    {report.items.length} queries
                    {provider ? ` · ${provider}` : ""}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-6 text-slate-300">
                  {report.notice}
                </p>
                {(report.audience || report.market) && (
                  <p className="mt-2 break-words text-xs text-slate-400">
                    Context supplied:{" "}
                    {[report.audience, report.market]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copy}
                    className={button + " text-white"}
                  >
                    <Copy aria-hidden className="h-4 w-4" />
                    Copy plan
                  </button>
                  <button
                    type="button"
                    onClick={download}
                    className={button + " text-white"}
                  >
                    <Download aria-hidden className="h-4 w-4" />
                    Export CSV
                  </button>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {report.items.map((item) => (
                  <article
                    key={item.index}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 p-5"
                  >
                    <h4 className="break-words text-lg font-bold text-white">
                      {item.keyword}
                    </h4>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-400/15 px-3 py-1 text-xs font-semibold text-blue-200">
                        {item.primary}
                      </span>
                      {item.secondary && (
                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                          Possible secondary · {item.secondary}
                        </span>
                      )}
                    </div>
                    <dl className="mt-4 space-y-4">
                      {[
                        ["Reader task", item.task],
                        ["Page format", item.format],
                        ["Content angle", item.angle],
                        ["Appropriate next step", item.nextStep],
                        ["What to verify", item.uncertainty],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            {label}
                          </dt>
                          <dd className="mt-1 break-words text-sm leading-7 text-slate-200">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-4 border-t border-white/10 pt-3">
                      <p className="text-xs font-bold text-slate-400">
                        Supporting cues
                      </p>
                      {item.evidence.length ? (
                        <ul className="mt-2 space-y-2">
                          {item.evidence.map((e, i) => (
                            <li
                              key={i}
                              className="break-words text-xs leading-6 text-slate-300"
                            >
                              {e.source}: “{e.quote}”
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs leading-6 text-slate-400">
                          No explicit wording cue. Check the live result mix.
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
              <Link
                href="/tools/article-outline-generator"
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-blue-200 underline"
              >
                Turn the reviewed task into an outline
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

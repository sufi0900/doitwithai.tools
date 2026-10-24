"use client";
import { useRef, useState, useEffect } from "react";
import {
  Search,
  Link2,
  FileCheck2,
  Download,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import CopyButton from "@/components/ai-tools/CopyButton";
import { readToolResponse } from "@/lib/ai-tools/client-response";
import type { Report } from "./core";
const field =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:ring-4 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-900";
const example: Report = {
  sourceUrl: "https://example.com/keyword-research",
  sourceTitle: "Keyword research for content writers",
  sourceMode: "Illustrative example",
  discovered: 3,
  analyzed: 2,
  discovery: "Example page list",
  suggestions: [
    {
      destinationUrl: "https://example.com/search-intent",
      destinationTitle: "How to check search intent",
      paragraphIndex: 0,
      passage:
        "Check search intent before choosing which keywords deserve a separate article. Different reader tasks may require different pages.",
      anchor: "search intent",
      reason:
        "The destination explains the intent check mentioned here, giving readers a useful next step.",
      method: "Text match",
    },
  ],
  pages: [
    {
      url: "https://example.com/search-intent",
      status: "Analyzed",
      title: "How to check search intent",
    },
    {
      url: "https://example.com/content-planning",
      status: "Analyzed",
      title: "Content planning",
    },
    {
      url: "https://example.com/about",
      status: "Not fetched within this run's limits",
    },
  ],
  notes: [
    "This is an illustrative example. No website was fetched and these URLs are placeholders.",
  ],
};
function csv(report: Report) {
  const rows = [
    ["Source URL", "Destination URL", "Anchor", "Passage", "Reason", "Method"],
    ...report.suggestions.map((s) => [
      report.sourceUrl,
      s.destinationUrl,
      s.anchor,
      s.passage,
      s.reason,
      s.method,
    ]),
  ];
  return rows
    .map((row) =>
      row
        .map(
          (cell) =>
            `"${(/^[=+@-]/.test(cell) ? "'" : "") + cell.replace(/"/g, '""')}"`,
        )
        .join(","),
    )
    .join("\r\n");
}
export default function Client() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [urls, setUrls] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const controller = useRef<AbortController | null>(null);
  const results = useRef<HTMLDivElement>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function analyze(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    controller.current = new AbortController();
    const timer = setTimeout(() => controller.current?.abort(), 65000);
    try {
      const response = await fetch("/api/ai-tools/internal-linking", {
        method: "POST",
        signal: controller.current.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceUrl: sourceUrl.trim(),
          sourceText,
          sitemapUrl: sitemapUrl.trim(),
          destinationUrls: urls
            .split(/\r?\n/)
            .map((u) => u.trim())
            .filter(Boolean),
        }),
      });
      const data = await readToolResponse<{ result: Report }>(response);
      setReport(data.result);
      requestAnimationFrame(() => results.current?.focus());
    } catch (e) {
      setError(
        e instanceof Error && e.name === "AbortError"
          ? "Analysis stopped. You can try again with a smaller page list."
          : e instanceof Error
            ? e.message
            : "Cannot complete the analysis.",
      );
    } finally {
      clearTimeout(timer);
      setBusy(false);
      controller.current = null;
    }
  }
  function download() {
    if (!report) return;
    const url = URL.createObjectURL(
      new Blob([csv(report)], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "internal-link-opportunities.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <form
        onSubmit={analyze}
        className="min-w-0 rounded-3xl border border-white/10 bg-white p-5 shadow-2xl dark:bg-[#1D2430] sm:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-blue-50 p-3 text-[#5271ff] dark:bg-blue-950">
            <Link2 aria-hidden className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Find useful link placements
          </h2>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
          Start with one article. We discover sitemap pages, read promising
          destinations, and suggest links for your review.
        </p>
        <fieldset
          disabled={busy}
          className="mt-6 space-y-5 disabled:opacity-70"
        >
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Article URL
            <input
              required
              type="url"
              maxLength={2000}
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://yourwebsite.com/article"
              className={field}
            />
          </label>
          <details className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <summary className="cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-200">
              Optional inputs and fallback
            </summary>
            <div className="mt-5 space-y-5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Sitemap URL
                <input
                  type="url"
                  maxLength={2000}
                  value={sitemapUrl}
                  onChange={(e) => setSitemapUrl(e.target.value)}
                  className={field}
                  placeholder="https://yourwebsite.com/sitemap.xml"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Destination URLs, one per line
                <textarea
                  rows={5}
                  maxLength={100000}
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  className={field}
                  placeholder="Paste up to 100 URLs on the article's hostname."
                />
              </label>
              <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
                Supplied URLs replace sitemap discovery. The tool still fetches
                their content.
              </p>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Paste article text
                <textarea
                  rows={7}
                  maxLength={40000}
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  className={field}
                  placeholder="Use this if article extraction fails. Separate paragraphs with blank lines."
                />
              </label>
              <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
                Pasted text replaces the source download. Existing hyperlinks
                cannot be detected in plain text.
              </p>
            </div>
          </details>
          <button
            type="submit"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#5271ff] px-5 py-3 text-sm font-bold text-white hover:bg-blue-600 focus-visible:ring-4 focus-visible:ring-blue-300"
          >
            {busy ? (
              <Loader2
                aria-hidden
                className="animate-spin motion-reduce:animate-none h-4 w-4"
              />
            ) : (
              <Search aria-hidden className="h-4 w-4" />
            )}
            {busy ? "Analyzing pages…" : "Find link opportunities"}
          </button>
        </fieldset>
        <div className="mt-4 flex flex-wrap gap-4">
          {busy ? (
            <button
              type="button"
              onClick={() => controller.current?.abort()}
              className="min-h-10 text-sm font-semibold text-red-600 dark:text-red-300"
            >
              Stop analysis
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setReport(example);
                setError("");
              }}
              className="min-h-10 text-sm font-semibold text-[#4662df] dark:text-blue-300"
            >
              View an example
            </button>
          )}
        </div>
        <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
          Up to 100 candidates, 20 new destination downloads, and five
          suggestions. 15 analyses per day, with up to five starts per 10
          minutes. Review each suggested placement before changing your page.
        </p>
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          >
            {error}
          </p>
        )}
      </form>
      <div
        ref={results}
        tabIndex={-1}
        aria-label="Link analysis results"
        aria-busy={busy}
        className="min-w-0 space-y-5 rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
      >
        {!report ? (
          <div
            role="status"
            className="rounded-3xl border border-white/15 bg-white/5 p-8 text-slate-300"
          >
            <FileCheck2 aria-hidden className="h-10 w-10 text-blue-300" />
            <h2 className="mt-5 text-2xl font-bold text-white">
              {busy
                ? "Checking your website"
                : "Exact placements, visible reasoning"}
            </h2>
            <p className="mt-4 text-sm leading-8">
              {busy
                ? "Discovering URLs, extracting article passages, and reviewing candidate pages. A bounded analysis can take about a minute."
                : "Each suggestion includes a destination, existing anchor words, the original passage, and a reason to add the link."}
            </p>
            <p className="mt-4 text-sm leading-8">
              Review every suggestion before publishing. This tool does not edit
              your website or promise ranking improvements.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 text-white">
              <h2 className="text-xl font-bold">
                {report.suggestions.length} link{" "}
                {report.suggestions.length === 1
                  ? "opportunity"
                  : "opportunities"}
              </h2>
              <p className="mt-2 break-words text-sm text-slate-300">
                {report.sourceTitle}
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[
                  [report.discovered, "Discovered"],
                  [report.analyzed, "Analyzed"],
                  [report.suggestions.length, "Suggested"],
                ].map(([count, label]) => (
                  <div key={label} className="rounded-xl bg-white/5 p-3">
                    <strong className="block text-2xl">{count}</strong>
                    <span className="text-xs text-slate-300">{label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-300">
                {report.discovery} · {report.sourceMode}
                {report.sourcePassages
                  ? ` · ${report.sourcePassages} article passages read`
                  : ""}
              </p>
              <p className="mt-2 text-xs text-slate-300">
                {report.alreadyLinked ?? 0} discovered pages already linked ·{" "}
                {report.aiReviewed
                  ? "AI review completed"
                  : "Local text analysis"}
                {report.reviewCharacters
                  ? ` · ${report.reviewCharacters.toLocaleString()} content characters sent for AI review`
                  : ""}
                {" · Images, video, scripts, and styles excluded from AI input"}
              </p>
              <button
                type="button"
                onClick={download}
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/20 px-4 text-xs font-bold"
              >
                <Download aria-hidden className="h-4 w-4" />
                Export suggestions
              </button>
            </div>
            {report.notes.map((note) => (
              <p
                key={note}
                className="break-words rounded-xl border border-amber-300/25 bg-amber-300/10 p-4 text-xs leading-6 text-amber-100"
              >
                {note}
              </p>
            ))}
            {!report.suggestions.length && (
              <p className="rounded-2xl border border-white/15 p-6 text-sm leading-7 text-slate-300">
                {(report.alreadyLinked ?? 0) > 0 &&
                report.alreadyLinked === report.discovered
                  ? `Good news: all ${report.alreadyLinked} discovered destination pages are already linked from this source. No new destination links were needed within this candidate set.`
                  : `No additional links passed the checks across ${report.analyzed} readable destination pages. ${report.alreadyLinked ?? 0} discovered pages are already linked.`}
                {
                  " This is a limited scan, not proof that every internal link is optimized. Review page coverage below. Supply closer destination URLs to expand the check."
                }
              </p>
            )}
            {report.suggestions.map((s, i) => {
              const at = s.passage.indexOf(s.anchor);
              return (
                <article
                  key={s.destinationUrl}
                  className="rounded-3xl bg-white p-6 dark:bg-[#1D2430]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-wide text-[#4662df] dark:text-blue-300">
                      Opportunity {i + 1}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {s.method}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-slate-950 dark:text-white">
                    {s.destinationTitle}
                  </h3>
                  <a
                    href={s.destinationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex max-w-full items-start gap-2 break-all text-xs leading-6 text-[#4662df] dark:text-blue-300"
                  >
                    {s.destinationUrl}
                    <ArrowUpRight
                      aria-hidden
                      className="mt-1 h-4 w-4 shrink-0"
                    />
                  </a>
                  <p className="mt-5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    Source passage {s.paragraphIndex + 1}
                  </p>
                  <blockquote className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    {s.passage.slice(0, at)}
                    <mark className="rounded bg-blue-100 px-1 text-blue-900 dark:bg-blue-900 dark:text-blue-100">
                      {s.anchor}
                    </mark>
                    {s.passage.slice(at + s.anchor.length)}
                  </blockquote>
                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {s.reason}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <CopyButton value={s.anchor} label="Copy anchor" />
                    <CopyButton value={s.destinationUrl} label="Copy URL" />
                  </div>
                </article>
              );
            })}
            <details className="rounded-2xl border border-white/15 p-5 text-slate-300">
              <summary className="cursor-pointer text-sm font-bold text-white">
                Page coverage and skipped URLs
              </summary>
              <p className="mt-3 text-xs leading-6">
                Coverage is limited to this run. Sitemaps can omit pages, and
                JavaScript-only content may be unreadable.
              </p>
              <ul className="mt-4 space-y-3">
                {report.pages.map((p) => (
                  <li
                    key={p.url}
                    className="break-all border-t border-white/10 pt-3 text-xs leading-6"
                  >
                    <span className="block">{p.url}</span>
                    <span
                      className={
                        p.status === "Analyzed"
                          ? "text-emerald-300"
                          : "text-amber-200"
                      }
                    >
                      {p.status}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          </>
        )}
      </div>
    </div>
  );
}

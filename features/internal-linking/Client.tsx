"use client";

import ToolRunOverlay, { paintToolFeedback } from "@/features/tool-ui/ToolRunOverlay";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";
import { useRef, useState, useEffect } from "react";
import {
  Search,
  Link2,
  FileCheck2,
  Download,
  ArrowUpRight,
  Loader2,
  Sparkles,
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
  discovered: 4,
  analyzed: 3,
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
    {
      destinationUrl: "https://example.com/keyword-clustering-tool",
      destinationTitle: "Keyword clustering workflow for SEO teams",
      paragraphIndex: 2,
      passage:
        "Once you collect candidate queries, group related search terms by shared reader task so you do not publish competing pages.",
      anchor: "group related search terms",
      reason:
        "Links the clustering step directly to the dedicated keyword grouping workflow.",
      method: "AI reviewed",
    },
  ],
  pages: [
    {
      url: "https://example.com/search-intent",
      status: "Analyzed",
      title: "How to check search intent",
    },
    {
      url: "https://example.com/keyword-clustering-tool",
      status: "Analyzed",
      title: "Keyword clustering workflow for SEO teams",
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
    "This is an illustrative example. You can edit any anchor text or destination URL inline below and copy ready-to-paste HTML.",
  ],
};

function csv(report: Report) {
  const rows = [
    [
      "Source URL",
      "Destination URL",
      "Anchor",
      "HTML Link Tag",
      "Passage",
      "Reason",
      "Method",
    ],
    ...report.suggestions.map((s) => [
      report.sourceUrl,
      s.destinationUrl,
      s.anchor,
      `<a href="${s.destinationUrl}">${s.anchor}</a>`,
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

function buildHtmlExport(report: Report) {
  return report.suggestions
    .map((s, idx) => {
      const at = s.passage.toLowerCase().indexOf(s.anchor.toLowerCase());
      const linkedPassage =
        at >= 0
          ? `${s.passage.slice(0, at)}<a href="${s.destinationUrl}">${s.anchor}</a>${s.passage.slice(at + s.anchor.length)}`
          : `${s.passage} (<a href="${s.destinationUrl}">${s.anchor}</a>)`;
      return `<!-- Opportunity ${idx + 1}: ${s.destinationTitle} -->\n<p>${linkedPassage}</p>`;
    })
    .join("\n\n");
}

export default function Client() {
  const [sourceUrl, setSourceUrl] = useState(example.sourceUrl);
  const [sourceText, setSourceText] = useState("");
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [urls, setUrls] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<Report | null>(example);
  const controller = useRef<AbortController | null>(null);
  const results = useRef<HTMLDivElement>(null);

  useEffect(() => () => controller.current?.abort(), []);

  function updateSuggestion(
    idx: number,
    patch: Partial<Report["suggestions"][number]>,
  ) {
    setReport((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        suggestions: prev.suggestions.map((item, i) =>
          i === idx ? { ...item, ...patch } : item,
        ),
      };
    });
  }

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

  function downloadCsv() {
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

  function downloadHtml() {
    if (!report) return;
    const url = URL.createObjectURL(
      new Blob([buildHtmlExport(report)], { type: "text/html;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "internal-link-passages.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <ToolRunOverlay
        active={busy}
        title="Finding contextual internal link opportunities"
        description="Scanning candidate pages and matching natural anchor phrases inside your article."
      />
      <form
        onSubmit={analyze}
        className="min-w-0 rounded-3xl border border-white/10 bg-white p-5 shadow-2xl dark:bg-[#1D2430] sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-blue-50 p-3 text-[#5271ff] dark:bg-blue-950">
              <Link2 aria-hidden className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">
              Find useful link placements
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setSourceUrl(example.sourceUrl);
              setReport(example);
              setError("");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Sparkles size={14} className="text-[#5271ff]" />
            Load sample opportunities
          </button>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
          Start with one article. We discover sitemap pages, read promising
          destinations, and suggest contextual anchor placements for your review.
        </p>
        <fieldset
          disabled={busy}
          className="mt-6 space-y-5 disabled:opacity-70"
        >
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Article URL
            <ToolUrlInput
              required
              type="url"
              maxLength={2000}
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://yourwebsite.com/article"
              className={field}
            />
          </label>
          <details
            open
            className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
          >
            <summary className="cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-200">
              Optional inputs and fallback (Sitemap, Candidate URLs, Pasted Text)
            </summary>
            <div className="mt-5 space-y-5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Sitemap URL
                <ToolUrlInput
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
                  rows={4}
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
                  rows={5}
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
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:ring-4 focus-visible:ring-blue-300"
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
        {busy && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => controller.current?.abort()}
              className="min-h-10 text-sm font-semibold text-red-600 dark:text-red-300"
            >
              Stop analysis
            </button>
          </div>
        )}
        <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
          Up to 100 candidates, 20 new destination downloads, and five
          suggestions. Review each suggested placement before changing your page.
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
          </div>
        ) : (
          <>
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 text-white">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">
                    {report.suggestions.length} link{" "}
                    {report.suggestions.length === 1
                      ? "opportunity"
                      : "opportunities"}
                  </h2>
                  <p className="mt-1 break-words text-sm text-slate-300">
                    {report.sourceTitle}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={downloadCsv}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#3452d1] px-4 text-xs font-bold text-white hover:bg-[#2943b5]"
                  >
                    <Download aria-hidden className="h-4 w-4" />
                    Export .CSV
                  </button>
                  <button
                    type="button"
                    onClick={downloadHtml}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/20 px-4 text-xs font-bold hover:bg-white/10"
                  >
                    <Download aria-hidden className="h-4 w-4" />
                    Export .HTML
                  </button>
                </div>
              </div>
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
            </div>
            {report.notes.map((note) => (
              <p
                key={note}
                className="break-words rounded-xl border border-amber-300/25 bg-amber-300/10 p-4 text-xs leading-6 text-amber-100"
              >
                {note}
              </p>
            ))}
            {report.suggestions.map((s, i) => {
              const at = s.passage
                .toLowerCase()
                .indexOf(s.anchor.toLowerCase());
              const htmlLinkTag = `<a href="${s.destinationUrl}">${s.anchor}</a>`;
              const updatedParagraphHtml =
                at >= 0
                  ? `<p>${s.passage.slice(0, at)}${htmlLinkTag}${s.passage.slice(at + s.anchor.length)}</p>`
                  : `<p>${s.passage} ${htmlLinkTag}</p>`;
              return (
                <article
                  key={`${s.destinationUrl}-${i}`}
                  className="rounded-3xl bg-white p-6 dark:bg-[#1D2430]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-wide text-[#4662df] dark:text-blue-300">
                      Opportunity {i + 1} · Live Editable Anchor
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {s.method}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                    {s.destinationTitle}
                  </h3>
                  <a
                    href={s.destinationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex max-w-full items-start gap-2 break-all text-xs leading-6 text-[#4662df] dark:text-blue-300"
                  >
                    {s.destinationUrl}
                    <ArrowUpRight
                      aria-hidden
                      className="mt-1 h-4 w-4 shrink-0"
                    />
                  </a>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Editable Anchor Text
                      <input
                        type="text"
                        value={s.anchor}
                        onChange={(e) =>
                          updateSuggestion(i, { anchor: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </label>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Editable Target URL
                      <input
                        type="url"
                        value={s.destinationUrl}
                        onChange={(e) =>
                          updateSuggestion(i, {
                            destinationUrl: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </label>
                  </div>

                  <p className="mt-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                    Source passage {s.paragraphIndex + 1}
                  </p>
                  <blockquote className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    {at >= 0 ? (
                      <>
                        {s.passage.slice(0, at)}
                        <mark className="rounded bg-blue-100 px-1 font-semibold text-blue-900 dark:bg-blue-900 dark:text-blue-100">
                          {s.anchor}
                        </mark>
                        {s.passage.slice(at + s.anchor.length)}
                      </>
                    ) : (
                      s.passage
                    )}
                  </blockquote>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {s.reason}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <CopyButton value={htmlLinkTag} label="Copy HTML <a> Tag" />
                    <CopyButton
                      value={updatedParagraphHtml}
                      label="Copy Linked Paragraph HTML"
                    />
                    <CopyButton value={s.anchor} label="Copy Anchor" />
                    <CopyButton value={s.destinationUrl} label="Copy URL" />
                  </div>
                </article>
              );
            })}
            <details
              open
              className="rounded-2xl border border-white/15 p-5 text-slate-300"
            >
              <summary className="cursor-pointer text-sm font-bold text-white">
                Page coverage and skipped URLs ({report.pages.length})
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

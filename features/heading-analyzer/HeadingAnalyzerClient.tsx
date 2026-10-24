"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import styles from "./HeadingOutline.module.css";
import Link from "next/link";
import {
  ArrowRight,
  CornerDownRight,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  Globe,
  ListTree,
  Loader2,
  Search,
  Target,
} from "lucide-react";
import {
  analyzeHeadings,
  buildCsv,
  detectFormat,
  extractFromHtml,
  extractFromMarkdown,
  outlineAsMarkdown,
  SAMPLE_HTML,
  type ExtractResult,
  type Format,
} from "./headingLib";
import { keywordMatches, structureScore, suggestedLevel } from "./report";
import type { PageHeadings } from "./server/fetch-headings";

const input =
  "w-full min-w-0 rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-[#7890ff] focus:ring-2 focus:ring-[#5271ff]/40";
const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-60";
const panel =
  "min-w-0 rounded-2xl border border-white/15 bg-slate-950/40 p-4 sm:p-6";
const colors = {
  error: "border-red-400/40 bg-red-400/10 text-red-200",
  warning: "border-amber-400/40 bg-amber-400/10 text-amber-100",
  info: "border-blue-300/30 bg-blue-300/10 text-blue-100",
  success: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
};
const headingLevels = [
  {
    label: "Main heading",
    badge: "border-emerald-300/40 bg-emerald-400/20 text-emerald-100",
    row: "border-emerald-300/40 border-l-emerald-400 bg-emerald-400/[0.08]",
    text: "text-emerald-100",
  },
  {
    label: "Section",
    badge: "border-blue-300/40 bg-blue-400/20 text-blue-100",
    row: "border-white/10 border-l-blue-400 bg-blue-400/[0.06]",
    text: "text-blue-100",
  },
  {
    label: "Subsection",
    badge: "border-violet-300/40 bg-violet-400/20 text-violet-100",
    row: "border-white/10 border-l-violet-400 bg-violet-400/[0.06]",
    text: "text-violet-100",
  },
  {
    label: "Detail",
    badge: "border-amber-300/40 bg-amber-400/20 text-amber-100",
    row: "border-white/10 border-l-amber-400 bg-amber-400/[0.06]",
    text: "text-amber-100",
  },
  {
    label: "Nested detail",
    badge: "border-pink-300/40 bg-pink-400/20 text-pink-100",
    row: "border-white/10 border-l-pink-400 bg-pink-400/[0.06]",
    text: "text-pink-100",
  },
  {
    label: "Deepest detail",
    badge: "border-cyan-300/40 bg-cyan-400/20 text-cyan-100",
    row: "border-white/10 border-l-cyan-400 bg-cyan-400/[0.06]",
    text: "text-cyan-100",
  },
];
type Result = ExtractResult &
  Partial<Pick<PageHeadings, "title" | "finalUrl" | "checkedAt">> & {
    source: "url" | "paste";
    cached?: boolean;
  };

export default function HeadingAnalyzerClient() {
  const [mode, setMode] = useState<"url" | "paste">("url");
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("");
  const [format, setFormat] = useState<"auto" | Format>("auto");
  const [mainOnly, setMainOnly] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState<"all" | "issues">("all");
  const active = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => () => active.current?.abort(), []);
  const analysis = useMemo(
    () => (result ? analyzeHeadings(result.headings, keyword) : null),
    [result, keyword],
  );
  const rating = useMemo(
    () => (analysis ? structureScore(analysis) : null),
    [analysis],
  );
  const visible = result?.headings.filter((h) => !h.hidden) || [];
  const scoreColor = !visible.length
    ? colors.info
    : rating!.score >= 90
      ? colors.success
      : rating!.score >= 60
        ? colors.warning
        : colors.error;

  function analyzePaste(text = source, explicitFormat?: Format) {
    setError("");
    setNotice("");
    if (!text.trim()) {
      setError("Paste HTML or Markdown, or try the example.");
      return;
    }
    if (text.length > 2_000_000) {
      setError(
        "Paste up to 2 million characters, or use only the article section.",
      );
      return;
    }
    try {
      const kind =
        explicitFormat || (format === "auto" ? detectFormat(text) : format);
      const extracted =
        kind === "html"
          ? extractFromHtml(
              text,
              (html) => new DOMParser().parseFromString(html, "text/html"),
              mainOnly,
            )
          : extractFromMarkdown(text);
      if (extracted.headings.length > 1000) {
        setError("Use a smaller section containing up to 1,000 headings.");
        return;
      }
      setResult({ ...extracted, source: "paste" });
      setFilter("all");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "This content could not be analyzed. Try a smaller HTML or Markdown section.",
      );
    }
  }

  async function analyzeUrl() {
    setError("");
    setNotice("");
    let normalized: URL;
    try {
      normalized = new URL(
        /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`,
      );
      if (
        !url.trim() ||
        !/^https?:$/.test(normalized.protocol) ||
        normalized.username ||
        normalized.password
      )
        throw new Error();
    } catch {
      setError(
        "Enter a public webpage address, such as https://example.com/article.",
      );
      return;
    }
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    const timer = setTimeout(() => controller.abort(), 24_000);
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/ai-tools/heading-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageUrl: normalized.toString(), mainOnly }),
        signal: controller.signal,
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body.error?.message ||
            "The page could not be read. Try Paste content instead.",
        );
      if (!body.result || !Array.isArray(body.result.headings))
        throw new Error("The page returned an incomplete report. Try again.");
      if (active.current === controller) {
        setResult({ ...body.result, source: "url", cached: body.cached });
        setFilter("all");
      }
    } catch (e) {
      if (active.current === controller)
        setError(
          controller.signal.aborted
            ? "The website took too long to respond. Try again or use Paste content."
            : e instanceof Error
              ? e.message
              : "The page could not be read.",
        );
    } finally {
      clearTimeout(timer);
      if (active.current === controller) {
        setLoading(false);
        active.current = null;
      }
    }
  }

  async function copyOutline() {
    try {
      await navigator.clipboard.writeText(outlineAsMarkdown(result!.headings));
      setNotice("Outline copied.");
    } catch {
      setNotice(
        "Clipboard access is unavailable. Download the CSV report instead.",
      );
    }
  }
  function download() {
    const href = URL.createObjectURL(
      new Blob(["\uFEFF" + buildCsv(analysis!)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "heading-structure-report.csv";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }

  return (
    <section
      id="heading-structure-analyzer"
      aria-label="Heading analysis workspace"
      className="relative mx-auto max-w-6xl rounded-3xl border border-white/15 bg-white/[0.06] p-4 text-white sm:p-7"
    >
      <div
        className="mb-6 flex flex-wrap gap-2"
        role="group"
        aria-label="Choose analysis input"
      >
        <button
          type="button"
          disabled={loading}
          aria-pressed={mode === "url"}
          onClick={() => {
            setMode("url");
            setError("");
          }}
          className={`${button} ${mode === "url" ? "bg-[#5271ff]" : ""}`}
        >
          <Globe size={17} /> Website URL
        </button>
        <button
          type="button"
          disabled={loading}
          aria-pressed={mode === "paste"}
          onClick={() => {
            setMode("paste");
            setError("");
          }}
          className={`${button} ${mode === "paste" ? "bg-[#5271ff]" : ""}`}
        >
          <Code2 size={17} /> Paste content
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (mode === "url") void analyzeUrl();
          else analyzePaste();
        }}
        className="space-y-5"
      >
        {mode === "url" ? (
          <div>
            <label htmlFor="ha-url" className="mb-2 block text-sm font-bold">
              Website or article URL
            </label>
            <input
              id="ha-url"
              type="text"
              inputMode="url"
              autoComplete="url"
              maxLength={2048}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setResult(null);
              }}
              disabled={loading}
              className={input}
              placeholder="https://example.com/your-article"
            />
            <p className="mt-2 text-xs leading-6 text-slate-300">
              Checks one public page at a time. No access to your website
              account is needed.
            </p>
          </div>
        ) : (
          <div>
            <label htmlFor="ha-source" className="mb-2 block text-sm font-bold">
              HTML or Markdown
            </label>
            <textarea
              id="ha-source"
              className={`${input} min-h-48 font-mono`}
              value={source}
              maxLength={2_000_000}
              onChange={(e) => {
                setSource(e.target.value);
                setResult(null);
              }}
              placeholder={
                "<h1>Your main topic</h1>\n<h2>Your first section</h2>"
              }
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label htmlFor="ha-format" className="text-xs">
                Format
              </label>
              <select
                id="ha-format"
                className={`${input} !w-auto`}
                value={format}
                onChange={(e) => {
                  setFormat(e.target.value as typeof format);
                  setResult(null);
                }}
              >
                <option value="auto">Auto-detect</option>
                <option value="html">HTML</option>
                <option value="markdown">Markdown</option>
              </select>
              <button
                type="button"
                className={button}
                onClick={() => fileRef.current?.click()}
              >
                Load file
              </button>
              <input
                type="file"
                ref={fileRef}
                className="sr-only"
                aria-label="Load HTML or Markdown file"
                accept=".html,.htm,.md,.markdown,.txt"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  if (file.size > 2_000_000) {
                    setError("Choose a file smaller than 2 MB.");
                    return;
                  }
                  try {
                    setSource(await file.text());
                    setResult(null);
                    setError("");
                  } catch {
                    setError(
                      "This file could not be read. Paste its contents instead.",
                    );
                  }
                }}
              />
            </div>
            <p className="mt-2 text-xs leading-6 text-slate-300">
              Useful for unpublished drafts or headings added by JavaScript.
              Pasted content stays in your browser. Scripts are not executed.
            </p>
          </div>
        )}
        <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <label
              htmlFor="ha-keyword"
              className="mb-2 block text-sm font-bold"
            >
              Target phrase{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="ha-keyword"
              className={input}
              value={keyword}
              maxLength={100}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. content marketing"
            />
          </div>
          <label className="flex min-h-12 items-start gap-3 rounded-xl border border-white/15 p-3 text-sm sm:mt-7">
            <input
              type="checkbox"
              checked={mainOnly}
              disabled={loading}
              onChange={(e) => {
                setMainOnly(e.target.checked);
                setResult(null);
              }}
              className="mt-1 accent-[#5271ff]"
            />
            <span>
              Main content only
              <span className="mt-1 block text-xs leading-5 text-slate-300">
                Uses main or article when available. Excludes navigation,
                footer, and sidebar headings.
              </span>
            </span>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            disabled={loading}
            className={`${button} border-transparent bg-[#5271ff] px-6 hover:bg-[#4561e6]`}
          >
            {loading ? (
              <Loader2
                size={18}
                className="animate-spin motion-reduce:animate-none"
              />
            ) : (
              <Search size={18} />
            )}
            {loading ? "Checking headings…" : "Analyze headings"}
          </button>
          <button
            type="button"
            disabled={loading}
            className={button}
            onClick={() => {
              setMode("paste");
              setSource(SAMPLE_HTML);
              setFormat("html");
              analyzePaste(SAMPLE_HTML, "html");
            }}
          >
            Try an example
          </button>
        </div>
      </form>
      {error && (
        <div
          role="alert"
          className={`mt-5 rounded-xl border p-4 text-sm leading-6 ${colors.warning}`}
        >
          {error}
          {mode === "url" && (
            <button
              type="button"
              className="ml-2 underline underline-offset-4"
              onClick={() => {
                setMode("paste");
                setError("");
              }}
            >
              Use Paste content
            </button>
          )}
        </div>
      )}
      <p role="status" className="mt-3 text-sm text-blue-100">
        {notice}
      </p>
      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 flex min-h-52 flex-col items-center justify-center rounded-2xl border border-blue-300/30 bg-[#5271ff]/10 p-6 text-center"
        >
          <ListTree
            size={34}
            className="animate-pulse motion-reduce:animate-none mb-4 text-blue-200"
          />
          <p className="font-bold">
            Reading your page and mapping its headings
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Checking the main heading, section order, and repeated labels.
          </p>
        </div>
      )}
      {!analysis && !loading && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            [
              ListTree,
              "See the complete outline",
              "Explore H1 to H6 in page order.",
            ],
            [
              CheckCircle2,
              "Find clear next steps",
              "Review issues beside affected headings.",
            ],
            [
              Target,
              "Check topic placement",
              "See where your target phrase appears.",
            ],
          ].map(([Icon, title, detail]) => {
            const I = Icon as typeof ListTree;
            return (
              <div key={title as string} className={panel}>
                <I size={21} className="mb-3 text-blue-200" />
                <p className="text-sm font-bold">{title as string}</p>
                <p className="mt-2 text-xs leading-6 text-slate-300">
                  {detail as string}
                </p>
              </div>
            );
          })}
        </div>
      )}
      {analysis && result && rating && (
        <div className="mt-7 space-y-5" aria-label="Heading analysis results">
          <div className={panel}>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-200">
              Heading report
            </p>
            <h2 className="mt-2 break-words text-xl font-bold">
              {result.title ||
                (result.source === "url"
                  ? "Your webpage outline"
                  : "Your content outline")}
            </h2>
            {result.finalUrl && (
              <p className="mt-2 break-all text-xs text-slate-300">
                {result.finalUrl}
              </p>
            )}
            <p className="mt-2 text-xs leading-6 text-slate-300">
              Scope: {result.scope}.
              {result.checkedAt &&
                ` Checked ${new Date(result.checkedAt).toLocaleTimeString()}.${result.cached ? " Recent report reused, up to five minutes old." : ""}`}
            </p>
            {result.source === "url" && (
              <p className="mt-3 rounded-xl bg-blue-300/10 p-3 text-xs leading-6 text-blue-100">
                This report reads the HTML returned by the website. Headings
                added later by JavaScript or hidden through external styles may
                differ. Compare with the visible page. Use Paste content for
                rendered HTML.
              </p>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className={`rounded-2xl border p-5 ${scoreColor}`}>
              <p className="text-xs font-semibold uppercase">Structure score</p>
              <p className="mt-2 text-4xl font-black">
                {visible.length ? rating.score : "—"}
                <span className="ml-1 text-sm font-normal">
                  {visible.length ? "/ 100" : "No visible headings"}
                </span>
              </p>
              <p className="mt-2 text-xs">
                {visible.length
                  ? rating.score >= 90
                    ? "Strong basic structure"
                    : rating.score >= 60
                      ? "Room to improve"
                      : "Review the outline"
                  : "Check the source and scope"}
              </p>
            </div>
            {[
              {
                label: "Headings found",
                value: result.headings.length,
                note: `${visible.length} included in structure checks`,
                tone: colors.info,
              },
              {
                label: "Visible H1 headings",
                value: visible.filter((h) => h.level === 1).length,
                note:
                  visible.find((h) => h.level === 1)?.text ||
                  "No visible main heading found",
                tone:
                  visible.filter((h) => h.level === 1).length === 1
                    ? colors.success
                    : colors.warning,
              },
              {
                label: "Items to review",
                value: analysis.issues.filter((i) => i.severity !== "info")
                  .length,
                note: `${analysis.issues.filter((i) => i.severity === "error").length} errors · ${analysis.issues.filter((i) => i.severity === "warning").length} warnings`,
                tone: analysis.issues.some((i) => i.severity === "error")
                  ? colors.error
                  : analysis.issues.some((i) => i.severity === "warning")
                    ? colors.warning
                    : colors.success,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`min-w-0 rounded-2xl border p-5 ${stat.tone}`}
              >
                <p className="text-xs font-semibold uppercase">{stat.label}</p>
                <p className="mt-2 text-4xl font-black">{stat.value}</p>
                <p className="mt-2 break-words text-xs leading-5">
                  {stat.note}
                </p>
              </div>
            ))}
          </div>
          <details className={panel}>
            <summary className="cursor-pointer text-sm font-bold">
              How the structure score works
            </summary>
            <p className="mt-3 text-xs leading-6 text-slate-300">
              This tool checks six basic structure rules. It is not a Google
              score, ranking prediction, or complete accessibility audit.
              Keyword matches do not affect it.
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {rating.checks.map((check) => (
                <li
                  key={check.label}
                  className="flex justify-between gap-3 text-xs"
                >
                  <span>
                    {check.passed ? "✓" : "○"} {check.label}
                  </span>
                  <span>
                    {check.passed ? check.points : 0}/{check.points}
                  </span>
                </li>
              ))}
            </ul>
            {!visible.length && (
              <p className="mt-2 text-xs text-slate-300">
                A score needs at least one visible heading.
              </p>
            )}
          </details>
          {analysis.keyword && (
            <div className={panel}>
              <h2 className="flex items-center gap-2 font-bold">
                <Target size={18} /> Target phrase placement
              </h2>
              <p className="mt-2 break-words text-sm text-slate-300">
                “{analysis.keyword.term}” appears in {analysis.keyword.matching}{" "}
                of {analysis.keyword.total} visible headings.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {[1, 2, 3, 4, 5, 6].map((level) => {
                  const group = visible.filter((h) => h.level === level);
                  const matches = group.filter((h) =>
                    keywordMatches(h.text, keyword),
                  ).length;
                  return (
                    <div
                      key={level}
                      className={`rounded-xl border p-3 ${matches ? colors.success : colors.info}`}
                    >
                      <p className="text-xs font-bold">H{level}</p>
                      <p className="mt-1 text-lg font-bold">
                        {matches}/{group.length}
                      </p>
                      <p className="text-[11px]">phrase matches</p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs leading-6 text-slate-300">
                Matches use complete words, ignoring case and punctuation.
                Variations and synonyms can work well. Every heading does not
                need the exact phrase.
              </p>
            </div>
          )}
          <div className="space-y-6">
            <div className={panel}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-bold">
                  <ListTree size={19} /> Heading hierarchy
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void copyOutline()}
                    className={button}
                  >
                    <Copy size={14} /> Copy outline
                  </button>
                  <button type="button" onClick={download} className={button}>
                    <Download size={14} /> CSV
                  </button>
                </div>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                Follow the page from its main topic to sections and nested
                details. Headings stay in their original document order.
              </p>
              <div
                className="mt-5 flex flex-wrap gap-2"
                aria-label="Heading level legend"
              >
                {analysis.counts.map((count, i) => (
                  <span
                    key={i}
                    className={`rounded-lg border px-3 py-2 text-xs ${headingLevels[i].badge}`}
                  >
                    <strong>H{i + 1}</strong> · {headingLevels[i].label}{" "}
                    <span className="ml-1 opacity-80">({count})</span>
                  </span>
                ))}
              </div>
              {visible.some((h) => h.level === 1) && (
                <div
                  className="mt-5 rounded-2xl border border-emerald-300/30 bg-emerald-400/[0.08] p-4 sm:p-5"
                  aria-label="Main heading overview"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">
                    Page main heading
                    {visible.filter((h) => h.level === 1).length > 1 ? "s" : ""}
                  </p>
                  <ul className="mt-3 space-y-3">
                    {visible
                      .filter((h) => h.level === 1)
                      .slice(0, 3)
                      .map((h) => (
                        <li key={h.index} className="flex items-start gap-3">
                          <span className="shrink-0 rounded-lg border border-emerald-300/40 bg-emerald-400/20 px-3 py-2 text-sm font-black text-emerald-100">
                            H1
                          </span>
                          <div className="min-w-0">
                            <p className="break-words text-lg font-bold leading-7 text-white sm:text-2xl sm:leading-8">
                              {h.text || "(Empty heading)"}
                            </p>
                            <a
                              href={`#ha-heading-${h.index}`}
                              onClick={() => setFilter("all")}
                              className="mt-1 inline-block text-xs text-emerald-100 underline underline-offset-4"
                            >
                              View position {h.index + 1} in the outline
                            </a>
                          </div>
                        </li>
                      ))}
                  </ul>
                  {visible.filter((h) => h.level === 1).length > 3 && (
                    <p className="mt-3 text-xs text-emerald-100">
                      Showing the first three H1 headings. Find every H1 in the
                      outline below.
                    </p>
                  )}
                  {visible.filter((h) => h.level === 1).length > 1 && (
                    <p className="mt-3 text-xs leading-6 text-amber-100">
                      Multiple H1 headings found. Review whether one heading can
                      clearly introduce the whole page.
                    </p>
                  )}
                </div>
              )}
              <p className="mt-4 text-xs leading-6 text-slate-400">
                Level colors identify H1 to H6. Separate issue badges indicate
                errors, warnings, or guidance.
              </p>
              <div
                role="group"
                aria-label="Filter outline"
                className="my-4 flex flex-wrap gap-2"
              >
                <button
                  type="button"
                  aria-pressed={filter === "all"}
                  onClick={() => setFilter("all")}
                  className={`${button} ${filter === "all" ? "bg-white/15" : ""}`}
                >
                  All headings
                </button>
                <button
                  type="button"
                  aria-pressed={filter === "issues"}
                  onClick={() => setFilter("issues")}
                  className={`${button} ${filter === "issues" ? "bg-white/15" : ""}`}
                >
                  Flagged headings
                </button>
              </div>
              <ol
                className={`${styles.outline} max-h-[850px] space-y-3 overflow-y-auto py-2 pr-1 sm:space-y-4`}
                aria-label="Headings in document order"
              >
                {result.headings
                  .filter(
                    (h) => filter === "all" || analysis.flags[h.index]?.length,
                  )
                  .map((h) => {
                    const flags = analysis.flags[h.index] || [];
                    const fix = suggestedLevel(h, result.headings);
                    const severity = flags.some((f) => f.severity === "error")
                      ? "error"
                      : flags.some((f) => f.severity === "warning")
                        ? "warning"
                        : "info";
                    const level = headingLevels[h.level - 1];
                    return (
                      <li
                        key={h.index}
                        id={`ha-heading-${h.index}`}
                        style={{ "--depth": h.level - 1 } as CSSProperties}
                        data-heading-level={h.level}
                        className={`${styles.row} scroll-mt-24 rounded-xl border border-l-4 p-3 sm:p-5 ${level.row} ${h.level === 1 ? "!my-5 shadow-lg shadow-emerald-950/20" : ""}`}
                      >
                        {h.level > 1 && (
                          <span className={styles.branch} aria-hidden="true" />
                        )}
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="flex shrink-0 items-center gap-1.5">
                            {h.level > 1 && (
                              <CornerDownRight
                                size={16}
                                className={`hidden sm:block ${level.text}`}
                                aria-hidden="true"
                              />
                            )}
                            <span
                              className={`rounded-lg border px-2 py-2 text-sm font-black sm:px-3 ${level.badge}`}
                            >
                              H{h.level}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`mb-1 text-[10px] font-bold uppercase tracking-widest ${level.text}`}
                            >
                              {level.label}
                            </p>
                            <p
                              className={`break-words font-semibold leading-7 ${h.level === 1 ? "text-lg sm:text-xl" : h.level === 2 ? "text-base sm:text-lg" : "text-sm sm:text-base"}`}
                            >
                              {h.text || "(Empty heading)"}
                            </p>
                            <p className="mt-1 text-[11px] opacity-80">
                              Position {h.index + 1}
                              {h.line ? ` · Line ${h.line}` : ""}
                              {h.hidden
                                ? " · Hidden, excluded from structure checks"
                                : ""}
                              {h.landmark ? ` · ${h.landmark}` : ""}
                            </p>
                            {keyword &&
                              keywordMatches(h.text, keyword) &&
                              !h.hidden && (
                                <span className="mt-2 inline-block text-[11px] text-emerald-200">
                                  ✓ Target phrase
                                </span>
                              )}
                          </div>
                        </div>
                        {flags.length > 0 && (
                          <p
                            className={`mt-3 rounded-lg border px-3 py-2 text-xs leading-6 ${colors[severity]}`}
                          >
                            <strong>
                              {severity === "error"
                                ? "Error"
                                : severity === "warning"
                                  ? "Review"
                                  : "Guidance"}
                              :{" "}
                            </strong>
                            {flags.map((f) => f.title).join(" · ")}
                          </p>
                        )}
                        {fix && (
                          <p className="mt-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold leading-6 text-blue-100">
                            Suggested level: H{fix}. Confirm that this matches
                            the section relationship.
                          </p>
                        )}
                      </li>
                    );
                  })}
              </ol>
              {!result.headings.length && (
                <p
                  className={`rounded-xl border p-4 text-sm leading-6 ${colors.warning}`}
                >
                  No headings were found in this scope. Try the whole page, or
                  paste rendered HTML if headings appear in your browser.
                </p>
              )}
              {filter === "issues" &&
                result.headings.length > 0 &&
                !result.headings.some(
                  (h) => analysis.flags[h.index]?.length,
                ) && (
                  <p className="text-sm text-emerald-200">
                    No individual headings were flagged.
                  </p>
                )}
            </div>
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.4fr)]">
              <div className={panel}>
                <h2 className="font-bold">Your next steps</h2>
                <p className="mt-2 text-xs leading-6 text-slate-300">
                  Review errors first, then warnings. Suggested changes need
                  your editorial judgment.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {analysis.issues.map((issue) => (
                    <article
                      key={issue.code}
                      className={`rounded-xl border p-4 ${colors[issue.severity]}`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        {issue.severity === "info"
                          ? "Guidance"
                          : issue.severity}
                      </p>
                      <h3 className="mt-1 text-sm font-bold">{issue.title}</h3>
                      <p className="mt-2 text-xs leading-6">{issue.detail}</p>
                      {issue.indexes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {issue.indexes.slice(0, 12).map((index) => (
                            <a
                              key={index}
                              href={`#ha-heading-${index}`}
                              onClick={() => setFilter("all")}
                              className="rounded-md bg-white/10 px-2 py-1 text-xs underline"
                            >
                              Heading {index + 1}
                            </a>
                          ))}
                          {issue.indexes.length > 12 && (
                            <span className="text-xs">
                              +{issue.indexes.length - 12} more in the outline
                            </span>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
                {!analysis.issues.length && (
                  <div
                    className={`mt-4 rounded-xl border p-4 ${colors.success}`}
                  >
                    <CheckCircle2 size={22} />
                    <p className="mt-2 text-sm font-bold">
                      No issues found in these checks
                    </p>
                    <p className="mt-2 text-xs leading-6">
                      Your basic heading structure looks clear. Review topic
                      coverage and the rendered page before publishing.
                    </p>
                  </div>
                )}
              </div>
              <Link
                href="/tools/h1-heading-generator"
                className="block rounded-2xl border border-blue-300/30 bg-[#5271ff]/20 p-5 transition hover:bg-[#5271ff]/30"
              >
                <p className="font-bold">Need a clearer main heading?</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Create H1 options that describe your page topic.
                </p>
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold">
                  Open H1 Heading Generator <ArrowRight size={16} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

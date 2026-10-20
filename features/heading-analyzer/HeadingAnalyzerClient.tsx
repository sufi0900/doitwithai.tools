"use client";

import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Copy, Download, Info, Lock, Upload, XCircle } from "lucide-react";
import {
  SAMPLE_HTML,
  SAMPLE_MARKDOWN,
  analyzeHeadings,
  buildCsv,
  detectFormat,
  extractFromHtml,
  extractFromMarkdown,
  outlineAsMarkdown,
  type ExtractResult,
  type Format,
  type Severity,
} from "./headingLib";

type FormatChoice = "auto" | Format;

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const inputClass =
  "w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#7f9aff] focus:outline-none focus:ring-2 focus:ring-[#5271ff]/40";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400";
const smallButton =
  "inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50";
const primaryButton =
  "inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50";

const SEVERITY_CLASS: Record<Severity, string> = {
  error: "border-rose-300/30 bg-rose-300/10 text-rose-200",
  warning: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  info: "border-sky-300/20 bg-sky-300/10 text-sky-200",
};
const PILL_CLASS: Record<Severity, string> = {
  error: "bg-rose-400/15 text-rose-300",
  warning: "bg-amber-400/15 text-amber-300",
  info: "bg-sky-400/15 text-sky-300",
};
const SEVERITY_LABEL: Record<Severity, string> = { error: "Error", warning: "Warning", info: "Note" };

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function shorten(text: string, max = 48): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text || "(empty)";
}

export default function HeadingAnalyzerClient() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [formatChoice, setFormatChoice] = useState<FormatChoice>("auto");
  const [mainOnly, setMainOnly] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [fileError, setFileError] = useState("");
  const [copied, setCopied] = useState(false);

  const format: Format = formatChoice === "auto" ? detectFormat(text) : formatChoice;

  const extracted: ExtractResult | null = useMemo(() => {
    if (!text.trim() || typeof DOMParser === "undefined") return null;
    if (format === "markdown") return extractFromMarkdown(text);
    return extractFromHtml(text, (html) => new DOMParser().parseFromString(html, "text/html"), mainOnly);
  }, [text, format, mainOnly]);

  const analysis = useMemo(() => (extracted ? analyzeHeadings(extracted.headings, keyword) : null), [extracted, keyword]);

  const errors = analysis?.issues.filter((issue) => issue.severity === "error").length ?? 0;
  const warnings = analysis?.issues.filter((issue) => issue.severity === "warning").length ?? 0;
  const maxCount = analysis ? Math.max(1, ...analysis.counts) : 1;

  const loadFile = async (file: File | undefined) => {
    setFileError("");
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setFileError("That file is larger than 5 MB. Paste only the part of the page you want to check.");
      return;
    }
    setText(await file.text());
  };

  const copyOutline = async () => {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(outlineAsMarkdown(analysis.headings));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      id="heading-structure-analyzer"
      className="mx-auto max-w-6xl scroll-mt-24 rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-left backdrop-blur sm:p-8"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div>
          <label className={labelClass} htmlFor="ha-input">
            1. Paste your page&apos;s HTML or Markdown
          </label>
          <textarea
            id="ha-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={14}
            spellCheck={false}
            placeholder={"<main>\n  <h1>Your page title</h1>\n  <h2>First section</h2>\n</main>\n\n…or Markdown:\n# Your page title\n## First section"}
            className={`${inputClass} font-mono text-xs`}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className={primaryButton}>
              <Upload className="h-4 w-4" aria-hidden="true" /> Load file
            </button>
            <button type="button" onClick={() => setText(SAMPLE_HTML)} className={smallButton}>
              Sample HTML
            </button>
            <button type="button" onClick={() => setText(SAMPLE_MARKDOWN)} className={smallButton}>
              Sample Markdown
            </button>
            {text && (
              <button type="button" onClick={() => setText("")} className={smallButton}>
                Clear
              </button>
            )}
            <input ref={fileRef} type="file" accept=".html,.htm,.md,.markdown,.txt,text/html,text/markdown,text/plain" className="sr-only" aria-label="Choose an HTML or Markdown file" onChange={(e) => void loadFile(e.target.files?.[0])} />
          </div>
          {fileError && (
            <p role="alert" className="mt-2 text-xs font-semibold text-amber-300">
              {fileError}
            </p>
          )}
          <p className="mt-2 flex items-start gap-2 text-xs leading-6 text-slate-400">
            <Lock className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden="true" />
            Analyzed in your browser. Your content isn&apos;t uploaded or stored, and pasted scripts are never run.
          </p>
          <p className="mt-2 flex items-start gap-2 text-xs leading-6 text-slate-400">
            <Info className="mt-1 h-3.5 w-3.5 shrink-0 text-sky-300" aria-hidden="true" />
            Tip: on a live page, right-click → Inspect, then copy the outer HTML of the &lt;html&gt; or &lt;main&gt; element. That includes headings added by JavaScript, which &ldquo;View source&rdquo; can miss.
          </p>

          <p className={`${labelClass} mt-6`}>2. Options</p>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300" htmlFor="ha-format">
                Format
              </label>
              <select id="ha-format" value={formatChoice} onChange={(e) => setFormatChoice(e.target.value as FormatChoice)} className={inputClass}>
                <option value="auto">Detect automatically{text.trim() ? ` (${format === "html" ? "HTML" : "Markdown"})` : ""}</option>
                <option value="html">HTML</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>
            <label className="flex items-start gap-2 text-xs font-semibold leading-5 text-slate-200">
              <input type="checkbox" checked={mainOnly} onChange={(e) => setMainOnly(e.target.checked)} disabled={format === "markdown"} className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-900" />
              Analyze main content only (uses &lt;main&gt; or &lt;article&gt; when present)
            </label>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300" htmlFor="ha-keyword">
                Target phrase (optional)
              </label>
              <input id="ha-keyword" type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. meta description length" className={inputClass} />
            </div>
          </div>
        </div>

        <div aria-live="polite">
          <p className={labelClass}>3. Review the outline and fixes</p>
          {!analysis ? (
            <p className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-sm text-slate-400">
              Paste a page or load a file and the heading outline will appear here.
            </p>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Headings", analysis.headings.length],
                  ["H1s", analysis.counts[0]],
                  ["Errors", errors],
                  ["Warnings", warnings],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="mt-1 text-xl font-black text-white">{value}</p>
                  </div>
                ))}
              </div>
              {extracted && format === "html" && <p className="text-xs text-slate-400">Checked {extracted.scope}.</p>}

              {analysis.headings.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Headings by level</p>
                  <ul className="mt-3 space-y-1.5">
                    {analysis.counts.map((count, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="w-6 font-bold text-slate-200">H{i + 1}</span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                          <span className="block h-full rounded-full bg-[#7f9aff]" style={{ width: `${(count / maxCount) * 100}%` }} />
                        </span>
                        <span className="w-6 text-right tabular-nums">{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.keyword && (
                <p className="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-xs leading-6 text-slate-300">
                  <span className="font-bold text-white">&ldquo;{analysis.keyword.term}&rdquo;</span> — {analysis.keyword.inH1 ? "in the H1" : "not in the H1"} · appears in{" "}
                  {analysis.keyword.matching} of {analysis.keyword.total} headings ({Math.round(analysis.keyword.share * 100)}%).
                </p>
              )}

              {analysis.headings.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Outline</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => void copyOutline()} className={smallButton}>
                        {copied ? <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                        Copy outline
                      </button>
                      <button type="button" onClick={() => download("heading-report.csv", buildCsv(analysis), "text/csv;charset=utf-8")} className={smallButton}>
                        <Download className="h-4 w-4" aria-hidden="true" /> CSV
                      </button>
                    </div>
                  </div>
                  <ul className="mt-3 max-h-96 space-y-1.5 overflow-auto pr-1">
                    {analysis.headings.map((heading) => {
                      const flags = analysis.flags[heading.index] ?? [];
                      return (
                        <li key={heading.index} style={{ paddingLeft: `${(heading.level - 1) * 14}px` }}>
                          <div className={`rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 ${heading.hidden ? "opacity-60" : ""}`}>
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-200">H{heading.level}</span>
                              <span className={`min-w-0 break-words text-xs ${heading.text ? "text-slate-100" : "italic text-slate-500"}`}>{heading.text || "(empty)"}</span>
                            </div>
                            {(flags.length > 0 || heading.hidden || heading.landmark) && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {heading.landmark && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300">in {heading.landmark}</span>}
                                {flags.map((flag, i) => (
                                  <span key={i} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${PILL_CLASS[flag.severity]}`}>
                                    {flag.title}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {analysis.issues.length === 0 ? (
                <p className="flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-3 text-xs font-bold text-emerald-200">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> No structural problems found. A clean outline still needs headings that describe their sections well.
                </p>
              ) : (
                <ul className="space-y-2">
                  {analysis.issues.map((issue) => (
                    <li key={`${issue.code}-${issue.title}`} className={`rounded-xl border p-3 text-xs leading-6 ${SEVERITY_CLASS[issue.severity]}`}>
                      <span className="flex items-center gap-1.5 font-extrabold">
                        {issue.severity === "error" ? <XCircle className="h-3.5 w-3.5" aria-hidden="true" /> : issue.severity === "warning" ? <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> : <Info className="h-3.5 w-3.5" aria-hidden="true" />}
                        {SEVERITY_LABEL[issue.severity]}: {issue.title}
                      </span>
                      <span className="mt-1 block">{issue.detail}</span>
                      {issue.indexes.length > 0 && (
                        <span className="mt-1 block opacity-80">
                          Affects:{" "}
                          {issue.indexes.slice(0, 4).map((index) => `#${index + 1} “${shorten(analysis.headings[index].text)}”`).join(" · ")}
                          {issue.indexes.length > 4 ? ` · +${issue.indexes.length - 4} more` : ""}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Globe,
  Loader2,
  MinusCircle,
  XCircle,
} from "lucide-react";
import {
  inputClass as sharedInputClass,
  panelClass,
  primaryButton,
  secondaryButton,
} from "@/features/writing-tools/config";
const inputClass = `${sharedInputClass} min-w-0`;
import { analyzeDocument } from "./analyzer";
import { extractFromText } from "./extract-from-text";
import { analyzeUrl } from "./client";
import type { AnalysisResult, CheckStatus } from "./types";

type Mode = "url" | "text";

const STATUS_STYLE: Record<
  CheckStatus,
  { icon: typeof CheckCircle2; className: string }
> = {
  pass: {
    icon: CheckCircle2,
    className: "text-emerald-600 dark:text-emerald-400",
  },
  warn: {
    icon: AlertTriangle,
    className: "text-amber-600 dark:text-amber-400",
  },
  fail: { icon: XCircle, className: "text-rose-600 dark:text-rose-400" },
  na: { icon: MinusCircle, className: "text-slate-400 dark:text-slate-500" },
};

function scoreLabel(score: number) {
  if (score >= 80)
    return {
      text: "Strong",
      className: "text-emerald-600 dark:text-emerald-400",
    };
  if (score >= 55)
    return {
      text: "Needs work",
      className: "text-amber-600 dark:text-amber-400",
    };
  return { text: "Weak", className: "text-rose-600 dark:text-rose-400" };
}

function ResultsPanel({ result }: { result: AnalysisResult }) {
  const label = scoreLabel(result.score);
  const grouped = (
    ["answer", "structure", "evidence", "technical"] as const
  ).map((categoryId) => ({
    category: result.categories.find((item) => item.id === categoryId),
    checks: result.checks.filter((check) => check.category === categoryId),
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-5 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
        <div className="text-center">
          <p className="text-4xl font-black text-slate-950 dark:text-white">
            {result.score}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            / 100
          </p>
        </div>
        <div>
          <p className={`text-sm font-extrabold ${label.className}`}>
            {label.text}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Review the page checks and suggested improvements before editing.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {grouped.map(({ category, checks }) => (
          <div
            key={category?.id}
            className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
                {category?.name}
              </h3>
              {category && category.possible > 0 && (
                <span className="text-xs font-semibold text-slate-400">
                  {Math.round((category.earned / category.possible) * 100)}%
                </span>
              )}
            </div>
            <ul className="mt-3 space-y-2">
              {checks.map((check) => {
                const style = STATUS_STYLE[check.status];
                const Icon = style.icon;
                return (
                  <li
                    key={check.id}
                    className="flex items-start gap-2 text-xs leading-5"
                  >
                    <Icon
                      className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${style.className}`}
                    />
                    <span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {check.label}:
                      </span>{" "}
                      <span className="text-slate-500 dark:text-slate-400">
                        {check.detail}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CitationReadinessClient() {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [urlResult, setUrlResult] = useState<{
    result: AnalysisResult;
    title: string;
    wordCount: number;
    finalUrl: string;
  } | null>(null);

  const textResult = useMemo(() => {
    if (!draft.trim()) return null;
    return analyzeDocument(extractFromText(draft));
  }, [draft]);

  async function handleAnalyzeUrl() {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setUrlResult(null);
    const outcome = await analyzeUrl(url.trim());
    setLoading(false);
    if (outcome.ok === false) {
      setError(outcome.message);
      return;
    }
    setUrlResult({
      result: outcome.result,
      title: outcome.doc.title,
      wordCount: outcome.doc.wordCount,
      finalUrl: outcome.doc.finalUrl,
    });
  }

  return (
    <div
      id="ai-citation-readiness-checker"
      className={`${panelClass} p-5 sm:p-8`}
    >
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={mode === "url" ? primaryButton : secondaryButton}
        >
          <Globe className="h-3.5 w-3.5" /> Analyze a URL
        </button>
        <button
          type="button"
          onClick={() => setMode("text")}
          className={mode === "text" ? primaryButton : secondaryButton}
        >
          <FileText className="h-3.5 w-3.5" /> Paste content
        </button>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          {mode === "url" ? (
            <>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Public page URL
              </label>
              <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                <input
                  className={inputClass}
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://example.com/article"
                  inputMode="url"
                />
                <button
                  type="button"
                  onClick={handleAnalyzeUrl}
                  disabled={loading || !url.trim()}
                  className={`${primaryButton} shrink-0`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  {loading ? "Analyzing…" : "Analyze"}
                </button>
              </div>
              <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                Checks headings, paragraphs, lists, author, dates, outbound
                links, and JSON-LD on the live page. Use an accessible public
                page.
              </p>
              {error && (
                <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {error}
                </p>
              )}
              {urlResult && (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Analyzed{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {urlResult.title || urlResult.finalUrl}
                  </span>{" "}
                  ; {urlResult.wordCount.toLocaleString()} words.
                </p>
              )}
            </>
          ) : (
            <>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Paste your draft
              </label>
              <textarea
                className={`${inputClass} mt-1.5 min-h-[320px] resize-y font-mono text-xs`}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={
                  "# Your H1 title\n\nA short, direct opening paragraph.\n\n## A question your reader would ask?\n\n- Point one\n- Point two"
                }
              />
              <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                Use{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono dark:bg-slate-800">
                  #
                </code>{" "}
                for headings and{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono dark:bg-slate-800">
                  -
                </code>{" "}
                for list items to get a full structural read. Author, dates,
                links, and schema can't be checked from pasted text; analyze the
                live URL once it's published for those.
              </p>
            </>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {mode === "url" ? (
            urlResult ? (
              <ResultsPanel result={urlResult.result} />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400 dark:border-slate-700">
                Results will appear here after you analyze a URL.
              </div>
            )
          ) : textResult ? (
            <ResultsPanel result={textResult} />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400 dark:border-slate-700">
              Start pasting to see a live score.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

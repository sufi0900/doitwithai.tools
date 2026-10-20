"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Globe,
  Info,
  Loader2,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  inputClass as sharedInputClass,
  panelClass,
  primaryButton,
  secondaryButton,
} from "@/features/writing-tools/config";
const inputClass = `${sharedInputClass} min-w-0`;
import {
  buildHreflangTags,
  COMMON_CODES,
  defaultState,
  emptyEntry,
  parseHreflangFromHtml,
  validateHreflang,
} from "./generator";
import { fetchExistingHreflangTags } from "./client";
import type { HreflangState, OutputFormat } from "./types";

type Mode = "build" | "check";

export default function HreflangClient() {
  const [mode, setMode] = useState<Mode>("build");
  const [state, setState] = useState<HreflangState>(() => defaultState());
  const [format, setFormat] = useState<OutputFormat>("html");
  const [pageUrl, setPageUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => buildHreflangTags(state, format), [state, format]);
  const issues = useMemo(() => validateHreflang(state), [state]);
  const errorCount = issues.filter((issue) => issue.level === "error").length;

  function updateEntry(id: string, patch: Partial<{ code: string; url: string }>) {
    setState((previous) => ({
      ...previous,
      entries: previous.entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    }));
  }

  function addEntry(code = "") {
    setState((previous) => ({ ...previous, entries: [...previous.entries, emptyEntry(code, "")] }));
  }

  function removeEntry(id: string) {
    setState((previous) => ({ ...previous, entries: previous.entries.filter((entry) => entry.id !== id) }));
  }

  function addQuickCode(code: string) {
    if (state.entries.some((entry) => entry.code.trim().toLowerCase() === code.toLowerCase())) return;
    addEntry(code);
  }

  async function handleFetch() {
    if (!pageUrl.trim()) return;
    setFetching(true);
    setMessage(null);
    const outcome = await fetchExistingHreflangTags(pageUrl.trim());
    setFetching(false);
    if (outcome.ok === false) {
      setMessage({ tone: "error", text: outcome.message });
      return;
    }
    setState(parseHreflangFromHtml(outcome.tags));
    setMode("build");
    setMessage({
      tone: "success",
      text: `Loaded ${outcome.tags.length} hreflang tag(s) from ${outcome.finalUrl}. Review the checklist below, edit anything, then copy.`,
    });
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage({ tone: "error", text: "Could not copy automatically ; select the text and copy manually." });
    }
  }

  return (
    <div id="hreflang-generator" className={`${panelClass} p-5 sm:p-8`}>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setMode("build")} className={mode === "build" ? primaryButton : secondaryButton}>
          Build tags
        </button>
        <button type="button" onClick={() => setMode("check")} className={mode === "check" ? primaryButton : secondaryButton}>
          <Globe className="h-3.5 w-3.5" /> Check a live page
        </button>
      </div>

      {mode === "check" && (
        <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Page URL</label>
          <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
            <input
              className={inputClass}
              value={pageUrl}
              onChange={(event) => setPageUrl(event.target.value)}
              placeholder="https://example.com/en/page"
              inputMode="url"
            />
            <button type="button" onClick={handleFetch} disabled={fetching || !pageUrl.trim()} className={`${secondaryButton} shrink-0`}>
              {fetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
              {fetching ? "Fetching…" : "Fetch hreflang tags"}
            </button>
          </div>
          <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
            Reads the page's existing &lt;link rel=&quot;alternate&quot; hreflang&gt; tags and loads them into the builder below. Review and export your results.
          </p>
        </div>
      )}

      {message && (
        <p className={`mt-3 text-xs font-semibold ${message.tone === "error" ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
          {message.text}
        </p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
                Language / region versions
              </h2>
              <button type="button" onClick={() => addEntry()} className={secondaryButton}>
                <Plus className="h-3.5 w-3.5" /> Add version
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {state.entries.map((entry) => (
                <div key={entry.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:grid-cols-[7rem_minmax(0,1fr)_auto]">
                  <input
                    className={`${inputClass} col-span-2 font-mono sm:col-span-1`}
                    value={entry.code}
                    onChange={(event) => updateEntry(entry.id, { code: event.target.value })}
                    placeholder="en-US"
                  />
                  <input
                    className={inputClass}
                    value={entry.url}
                    onChange={(event) => updateEntry(entry.id, { url: event.target.value })}
                    placeholder="https://example.com/en-us/page"
                    inputMode="url"
                  />
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    className="shrink-0 rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400"
                    aria-label="Remove version"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Quick-add common codes</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {COMMON_CODES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => addQuickCode(item.code)}
                    title={item.label}
                    className="rounded-full border border-slate-200 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-600 transition hover:border-[#5271ff]/40 hover:text-[#4662df] dark:border-slate-700 dark:text-slate-300"
                  >
                    {item.code}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">Output format</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => setFormat("html")} className={format === "html" ? primaryButton : secondaryButton}>
                HTML &lt;link&gt; tags
              </button>
              <button type="button" onClick={() => setFormat("header")} className={format === "header" ? primaryButton : secondaryButton}>
                HTTP Link header
              </button>
            </div>
            <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
              Use the HTML tags in your page's &lt;head&gt;. Use the HTTP header format for non-HTML files (PDFs, etc.) where you can't add &lt;link&gt; tags.
            </p>
          </section>
        </div>

        <div className="min-w-0 space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">Live preview</h2>
              <span className="text-xs font-semibold text-slate-400">{output.length.toLocaleString()} chars</span>
            </div>
            <pre className="mt-3 max-h-[380px] overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100 dark:border-slate-700">
              {output || "Add versions above to generate tags."}
            </pre>
            <div className="mt-3">
              <button type="button" onClick={handleCopy} className={primaryButton}>
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy tags"}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
              Checks you can inspect
            </h2>
            {issues.length === 0 ? (
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> No issues found.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {issues.map((issue, index) => {
                  const Icon = issue.level === "error" ? XCircle : issue.level === "warning" ? AlertTriangle : Info;
                  const className =
                    issue.level === "error" ? "text-rose-600 dark:text-rose-400" : issue.level === "warning" ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-400";
                  return (
                    <li key={`${issue.level}-${index}`} className={`flex items-start gap-2 text-xs font-semibold leading-5 ${className}`}>
                      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {issue.message}
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-3 text-[11px] leading-5 text-slate-400">
              {errorCount > 0
                ? "Resolve the errors above before publishing."
                : "Paste this exact same block onto every page listed above ; hreflang must be reciprocal across all versions."}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

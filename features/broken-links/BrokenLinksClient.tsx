"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChevronDown, Download, Link2, Search } from "lucide-react";
import ToolRunOverlay, { focusToolSection } from "../tool-ui/ToolRunOverlay";
import {
  evidenceCsv,
  labels,
  sourceUrls,
  type Report,
  type LinkState,
} from "./model";

const box =
  "rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 sm:p-7";
const control =
  "w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const primary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";
const secondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-[#5271ff] disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-800";
export default function BrokenLinksClient() {
  const [sources, setSources] = useState(""),
    [html, setHtml] = useState(""),
    [mode, setMode] = useState<"live" | "pasted">("live"),
    [limit, setLimit] = useState(15);
  const [busy, setBusy] = useState(false),
    [fieldError, setFieldError] = useState(""),
    [htmlError, setHtmlError] = useState(""),
    [message, setMessage] = useState("");
  const [reports, setReports] = useState<Report[]>([]),
    [progress, setProgress] = useState({ completed: 0, total: 0 }),
    [filter, setFilter] = useState<LinkState | "all">("all");
  const sourceInput = useRef<HTMLTextAreaElement>(null),
    htmlInput = useRef<HTMLTextAreaElement>(null),
    results = useRef<HTMLElement>(null),
    feedback = useRef<HTMLDivElement>(null),
    controller = useRef<AbortController | null>(null),
    mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!busy && reports.length) focusToolSection(results.current);
  }, [busy, reports]);
  async function run(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setFieldError("");
    setHtmlError("");
    setMessage("");
    let urls: string[];
    try {
      urls = sourceUrls(sources);
      if (mode === "pasted" && urls.length !== 1)
        throw new Error("Supplied HTML needs exactly one publisher page URL.");
    } catch (error) {
      setFieldError((error as Error).message);
      sourceInput.current?.focus();
      return;
    }
    if (
      mode === "pasted" &&
      (!html.trim() || new TextEncoder().encode(html).length > 500000)
    ) {
      setHtmlError("Paste non-empty page HTML below 500 KB.");
      htmlInput.current?.focus();
      return;
    }
    const chosenLimit = Math.max(5, Math.min(30, limit || 15));
    setLimit(chosenLimit);
    const runController = new AbortController();
    controller.current = runController;
    setBusy(true);
    setReports([]);
    setFilter("all");
    setProgress({ completed: 0, total: urls.length });
    const completed: Report[] = [];
    try {
      for (const source of urls) {
        if (runController.signal.aborted) break;
        const response = await fetch("/api/ai-tools/broken-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source,
            limit: chosenLimit,
            ...(mode === "pasted" ? { html } : {}),
          }),
          signal: AbortSignal.any([
            runController.signal,
            AbortSignal.timeout(55000),
          ]),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(
            data.error?.message ||
              "The scan could not finish. Please try again.",
          );
        if (!data.report || !Array.isArray(data.report.rows))
          throw new Error("No readable report was returned. Please try again.");
        if (runController.signal.aborted) break;
        completed.push(data.report);
        if (mounted.current) {
          setReports([...completed]);
          setProgress({ completed: completed.length, total: urls.length });
        }
      }
      if (mounted.current && runController.signal.aborted)
        setMessage(
          "Scan stopped. Completed publisher reports remain below. Unfinished pages were not checked.",
        );
    } catch (error) {
      if (mounted.current)
        setMessage(
          runController.signal.aborted
            ? "Scan stopped. Completed publisher reports remain below. Unfinished pages were not checked."
            : error instanceof Error && error.name !== "TimeoutError"
              ? error.message
              : "The scan timed out. Completed reports remain below. Try fewer links per page.",
        );
    } finally {
      if (mounted.current) {
        setBusy(false);
        if (!completed.length)
          requestAnimationFrame(() => feedback.current?.focus());
      }
    }
  }
  const rows = reports.flatMap((r) => r.rows),
    candidates = rows.filter((r) => r.state === "broken").length,
    unverified = rows.filter((r) => r.state === "unverified").length;
  function download(onlyBroken = false) {
    const blob = new Blob([evidenceCsv(reports, onlyBroken)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = onlyBroken
      ? "broken-link-candidates.csv"
      : "broken-link-evidence.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <form onSubmit={run} noValidate className={box} aria-busy={busy}>
        <h2 className="flex items-center gap-3 text-2xl font-extrabold">
          <Search aria-hidden className="shrink-0 text-[#5271ff]" />
          Inspect publisher resource pages
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Bring pages that discuss your topic or list useful resources. This
          checks their external links, rather than searching the entire web.
        </p>
        <label
          htmlFor="broken-sources"
          className="mt-6 block text-sm font-bold"
        >
          Publisher page URLs <span className="font-normal">(required)</span>
        </label>
        <p
          id="broken-sources-help"
          className="mb-3 mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300"
        >
          Paste one full page URL per line. Press Enter to add another, up to
          five unique pages.
        </p>
        <textarea
          ref={sourceInput}
          id="broken-sources"
          className={control}
          rows={4}
          value={sources}
          disabled={busy}
          maxLength={12000}
          onChange={(e) => {
            setSources(e.target.value);
            setFieldError("");
          }}
          placeholder={
            "https://publisher.com/resources\nhttps://another-site.com/useful-links"
          }
          aria-invalid={Boolean(fieldError)}
          aria-describedby={`broken-sources-help${fieldError ? " broken-source-error" : ""}`}
          required
        />
        {fieldError && (
          <p
            id="broken-source-error"
            role="alert"
            className="mt-2 text-sm text-red-700 dark:text-red-300"
          >
            {fieldError}
          </p>
        )}
        <details className="group mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold">
            Optional settings and supplied HTML
            <ChevronDown
              size={18}
              aria-hidden
              className="shrink-0 text-[#5271ff] transition group-open:rotate-180"
            />
          </summary>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="broken-limit"
                className="block text-sm font-semibold"
              >
                External URLs to inspect per page
              </label>
              <input
                id="broken-limit"
                type="number"
                min={5}
                max={30}
                disabled={busy}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className={`${control} mt-2`}
              />
              <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                Default 15, maximum 30. Longer pages may need a separate review.
                The report identifies scan limits.
              </p>
            </div>
            <fieldset>
              <legend className="text-sm font-semibold">
                Publisher source
              </legend>
              <label className="mt-3 flex gap-2 text-sm">
                <input
                  type="radio"
                  name="broken-mode"
                  checked={mode === "live"}
                  disabled={busy}
                  onChange={() => setMode("live")}
                />
                Fetch the current page
              </label>
              <label className="mt-3 flex gap-2 text-sm">
                <input
                  type="radio"
                  name="broken-mode"
                  checked={mode === "pasted"}
                  disabled={busy}
                  onChange={() => setMode("pasted")}
                />
                Paste HTML for one page
              </label>
            </fieldset>
          </div>
          {mode === "pasted" && (
            <div className="mt-5">
              <label htmlFor="broken-html" className="block text-sm font-bold">
                Page HTML{" "}
                <span className="font-normal">(required in this mode)</span>
              </label>
              <p
                id="broken-html-help"
                className="my-2 text-sm leading-6 text-slate-600 dark:text-slate-300"
              >
                Paste up to 500 KB. Source placement is supplied evidence;
                destination URL checks still use the network.
              </p>
              <textarea
                ref={htmlInput}
                id="broken-html"
                rows={6}
                className={control}
                disabled={busy}
                value={html}
                onChange={(e) => {
                  setHtml(e.target.value);
                  setHtmlError("");
                }}
                aria-invalid={Boolean(htmlError)}
                aria-describedby={`broken-html-help${htmlError ? " broken-html-error" : ""}`}
                spellCheck={false}
              />
              {htmlError && (
                <p
                  id="broken-html-error"
                  role="alert"
                  className="mt-2 text-sm text-red-700 dark:text-red-300"
                >
                  {htmlError}
                </p>
              )}
            </div>
          )}
        </details>
        <button disabled={busy} className={`${primary} mt-6`}>
          <Link2 size={18} aria-hidden />
          {busy ? "Inspecting links…" : "Find broken-link candidates"}
        </button>
        <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
          Only public HTTP and HTTPS URLs are requested. Restricted networks and
          blocked crawler paths are not bypassed.
        </p>
      </form>
      <ToolRunOverlay
        active={busy}
        title="Inspecting external links"
        description="Reading publisher pages and checking a bounded set of destinations. Slow or restricted URLs stay unverified."
        progress={progress}
        onCancel={() => controller.current?.abort()}
      />
      <div ref={feedback} tabIndex={-1} className="scroll-mt-28">
        {message && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-7 text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
          >
            {message}
          </p>
        )}
      </div>
      {reports.length > 0 && (
        <section
          ref={results}
          tabIndex={-1}
          aria-labelledby="broken-results-title"
          className="mt-9 scroll-mt-28 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5271ff]"
        >
          <h2 id="broken-results-title" className="text-3xl font-extrabold">
            Your link evidence
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            {reports.length} publisher reports · {rows.length} selected
            destinations · {candidates} HTTP 404/410 candidates · {unverified}{" "}
            unverified
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            A candidate is a reason to review the resource. It does not
            establish relevance, publisher interest, or a guaranteed backlink.
          </p>
          <div className="my-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              className={secondary}
              onClick={() => download()}
            >
              <Download size={17} aria-hidden />
              Export all evidence CSV
            </button>
            <button
              type="button"
              disabled={busy || !candidates}
              className={secondary}
              onClick={() => download(true)}
            >
              <Download size={17} aria-hidden />
              Export candidates CSV
            </button>
          </div>
          <div
            role="group"
            aria-label="Filter link evidence"
            className="mb-6 flex flex-wrap gap-2"
          >
            {[
              ["all", "All evidence"],
              ["broken", "404 / 410"],
              ["unverified", "Unverified"],
              ["redirected", "Redirected"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                aria-pressed={filter === value}
                onClick={() => setFilter(value as typeof filter)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline-[#5271ff] ${filter === value ? "border-[#3452d1] bg-[#3452d1] text-white" : "border-slate-300 dark:border-slate-600"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="space-y-6">
            {reports.map((r, index) => (
              <article key={`${r.sourceUrl}-${index}`} className={box}>
                <h3 className="break-words text-lg font-bold">
                  {r.title || "Publisher page"}
                </h3>
                <a
                  href={r.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block break-all text-sm text-[#3452d1] underline dark:text-blue-200"
                >
                  {r.sourceUrl}
                </a>
                <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
                  {r.method === "pasted"
                    ? "Supplied HTML source"
                    : "Live source"}{" "}
                  · {r.totalExternal} unique external URLs found ·{" "}
                  {r.checkedCount} destination HTTP responses ·{" "}
                  {new Date(r.checkedAt).toLocaleString()}
                </p>
                {r.finalSourceUrl !== r.sourceUrl && (
                  <p className="mt-2 break-all text-xs leading-6">
                    Final publisher URL: {r.finalSourceUrl}
                  </p>
                )}
                {r.error && (
                  <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-950 dark:bg-amber-950 dark:text-amber-100">
                    {r.error}
                  </p>
                )}
                {r.notes.map((note) => (
                  <p
                    key={note}
                    className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400"
                  >
                    {note}
                  </p>
                ))}
                {!r.error && !r.rows.length && (
                  <p className="mt-5 text-sm leading-7">
                    No eligible external links were found in the inspected
                    content. This does not rule out links outside this scan’s
                    scope.
                  </p>
                )}
                {!!r.rows.length &&
                  !r.rows.some(
                    (l) => filter === "all" || l.state === filter,
                  ) && (
                    <p className="mt-5 text-sm">
                      No destinations match this filter on this page.
                    </p>
                  )}
                <div className="mt-5 space-y-3">
                  {r.rows
                    .filter((l) => filter === "all" || l.state === filter)
                    .map((l) => (
                      <details
                        key={l.href}
                        className="group rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                      >
                        <summary className="flex cursor-pointer list-none items-start gap-3 text-sm focus-visible:outline-[#5271ff]">
                          <span className="min-w-0 flex-1">
                            <strong className="block break-words">
                              {l.anchor}
                            </strong>
                            <span className="mt-2 block break-all text-xs text-slate-500 dark:text-slate-400">
                              {l.href}
                            </span>
                            <span
                              className={`mt-3 inline-block rounded-lg px-3 py-1 text-xs font-bold ${l.state === "broken" ? "bg-amber-100 text-amber-950 dark:bg-amber-900 dark:text-amber-100" : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"}`}
                            >
                              {labels[l.state]}
                              {l.httpStatus ? ` · HTTP ${l.httpStatus}` : ""}
                            </span>
                          </span>
                          <ChevronDown
                            size={18}
                            aria-hidden
                            className="shrink-0 text-[#5271ff] transition group-open:rotate-180"
                          />
                        </summary>
                        <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-sm leading-7 dark:border-slate-700">
                          <p>{l.reason}</p>
                          <blockquote className="rounded-lg bg-slate-50 p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {l.context || "No surrounding text was extracted."}
                          </blockquote>
                          <p>
                            Link attributes:{" "}
                            {l.rel.join(", ") || "No rel tokens observed"}.
                            Occurrences: {l.occurrences}.
                          </p>
                          <a
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block break-all text-[#3452d1] underline dark:text-blue-200"
                          >
                            Open destination for manual review
                          </a>
                          {l.redirects.length > 0 && (
                            <div>
                              <p className="font-semibold">Redirect evidence</p>
                              <ol className="list-inside list-decimal space-y-2">
                                {l.redirects.map((h, i) => (
                                  <li key={i} className="break-all">
                                    HTTP {h.status}: {h.url} → {h.location}
                                  </li>
                                ))}
                              </ol>
                              <p className="mt-2 break-all">
                                Final destination: {l.finalUrl}
                              </p>
                            </div>
                          )}
                        </div>
                      </details>
                    ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

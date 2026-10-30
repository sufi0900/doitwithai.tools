"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Search, Download, Bookmark } from "lucide-react";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";
import { importAudienceWebsite } from "@/features/audience-research/website";
import { readToolResponse } from "@/lib/ai-tools/client-response";
import {
  exampleReport,
  inputSchema,
  intents,
  keywordKey,
  validateOutput,
  type ResearchReport,
} from "./schema";
import { importMetrics, exportCsv, type Metric } from "./metrics";
type Row = ResearchReport["keywords"][number] & { origin: string };
const control =
  "w-full min-w-0 rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5271FF] dark:border-slate-600 dark:bg-slate-950 dark:text-white";
const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:border-[#5271FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271FF] disabled:opacity-50 dark:border-slate-600";
export default function KeywordResearchClient() {
  const [seeds, setSeeds] = useState(""),
    [url, setUrl] = useState(""),
    [country, setCountry] = useState("United States"),
    [language, setLanguage] = useState("English");
  const [rows, setRows] = useState<Row[]>([]),
    [metrics, setMetrics] = useState<Metric[]>([]),
    [summary, setSummary] = useState(""),
    [error, setError] = useState(""),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  const [query, setQuery] = useState(""),
    [intent, setIntent] = useState("all"),
    [group, setGroup] = useState("all"),
    [onlySaved, setOnlySaved] = useState(false),
    [saved, setSaved] = useState<string[]>([]),
    [tab, setTab] = useState("Explorer"),
    [context, setContext] = useState(""),
    [coverage, setCoverage] = useState(""),
    [reportMarket, setReportMarket] = useState(""),
    [fileNote, setFileNote] = useState("");
  const active = useRef<AbortController | null>(null),
    dialog = useRef<HTMLDialogElement>(null),
    results = useRef<HTMLDivElement>(null),
    failure = useRef<HTMLParagraphElement>(null),
    seedField = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (busy && !dialog.current?.open) dialog.current?.showModal();
    else if (!busy) dialog.current?.close();
  }, [busy]);
  useEffect(() => () => active.current?.abort(), []);
  useEffect(() => {
    if (error) {
      failure.current?.focus({ preventScroll: true });
      failure.current?.scrollIntoView({ block: "center" });
    }
  }, [error]);
  function reveal() {
    requestAnimationFrame(() => {
      results.current?.focus({ preventScroll: true });
      results.current?.scrollIntoView({
        block: "start",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    });
  }
  async function generate(more = false) {
    if (active.current) return;
    if (more && reportMarket !== `${country} · ${language}`) {
      setError("Start a new search before expanding a different market.");
      return;
    }
    setError("");
    if (!seeds.trim() && !url.trim()) {
      setError("Add a seed keyword or a public website URL.");
      seedField.current?.focus();
      return;
    }
    const parsed = inputSchema.safeParse({
      seeds: seeds
        .split(/\n/)
        .map((s) => s.trim())
        .filter(Boolean),
      context:
        context || (url.trim() ? "Website context will be imported." : ""),
      country,
      language,
      exclude: more ? rows.map((r) => r.keyword).slice(0, 120) : [],
      count: 60,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    const abort = new AbortController();
    active.current = abort;
    setBusy(true);
    const deadline = setTimeout(() => abort.abort(), 115000);
    try {
      let website = context;
      if (url.trim() && !website) {
        const imported = await importAudienceWebsite(
          url,
          abort.signal,
          setStatus,
        );
        website = imported.text;
        setContext(website);
        setCoverage(imported.note);
      }
      setStatus("Finding relevant keyword ideas and proposed page groups.");
      const data = inputSchema.parse({ ...parsed.data, context: website });
      const response = await fetch("/api/ai-tools/keyword-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: abort.signal,
      });
      const body = await readToolResponse<{ result: unknown }>(response);
      const report = validateOutput(body.result, data);
      setRows((previous) =>
        more
          ? [
              ...previous,
              ...report.keywords.map((r) => ({
                ...r,
                origin: "Generated suggestion",
              })),
            ].slice(0, 120)
          : report.keywords.map((r) => ({
              ...r,
              origin: "Generated suggestion",
            })),
      );
      if (!more) {
        setMetrics([]);
        setFileNote("");
        setSaved([]);
        setQuery("");
        setGroup("all");
        setIntent("all");
        setOnlySaved(false);
      }
      setReportMarket(`${country} · ${language}`);
      setSummary(report.summary);
      setStatus(
        `Added ${report.keywords.length} distinct suggestions. Search demand has not been measured.`,
      );
      setTab("Explorer");
      reveal();
    } catch (e) {
      setError(
        abort.signal.aborted
          ? "Waiting stopped. Your inputs and earlier results remain available."
          : e instanceof Error
            ? e.message
            : "The request failed. Try again.",
      );
    } finally {
      clearTimeout(deadline);
      active.current = null;
      setBusy(false);
    }
  }
  function example() {
    const report = exampleReport();
    setRows(
      report.keywords.map((r) => ({ ...r, origin: "Illustrative example" })),
    );
    setSummary(report.summary);
    setReportMarket("Illustrative example");
    setSaved([]);
    setMetrics([]);
    setFileNote("");
    setQuery("");
    setIntent("all");
    setGroup("all");
    setOnlySaved(false);
    setError("");
    setTab("Explorer");
    reveal();
  }
  async function upload(file?: File) {
    if (!file) return;
    setError("");
    try {
      if (file.size > 100000)
        throw Error("Use a CSV or TSV file below 100 KB.");
      const bytes = await file.arrayBuffer();
      const view = new Uint8Array(bytes);
      const text =
        view[0] === 255 && view[1] === 254
          ? new TextDecoder("utf-16le").decode(bytes)
          : new TextDecoder().decode(bytes);
      const imported = importMetrics(text);
      setMetrics(imported.metrics);
      setFileNote(
        `${file.name}: ${imported.metrics.length} keywords. ${imported.duplicates} duplicate rows ignored. ${imported.hasVolume ? "Volume cells preserved as supplied." : "No volume column found."}`,
      );
      setRows((previous) => {
        const retained = previous.filter((r) => r.origin !== "Supplied list");
        const keys = new Set(retained.map((r) => keywordKey(r.keyword)));
        return [
          ...retained,
          ...imported.metrics
            .filter((m) => !keys.has(keywordKey(m.keyword)))
            .map((m) => ({
              keyword: m.keyword,
              question: /[?¿]/.test(m.keyword),
              intent: "unclear" as const,
              group: "Imported keywords",
              format: "needs review" as const,
              task: "Review this supplied keyword before assigning a page.",
              origin: "Supplied list",
            })),
        ];
      });
      setStatus(
        "File loaded locally. Review its market, date range, currency, and source before comparing metrics.",
      );
      reveal();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cannot read this file.");
    }
  }
  const map = new Map(metrics.map((m) => [keywordKey(m.keyword), m]));
  const visible = rows.filter(
    (r) =>
      (!query || r.keyword.toLowerCase().includes(query.toLowerCase())) &&
      (intent === "all" || r.intent === intent) &&
      (group === "all" || r.group === group) &&
      (!onlySaved || saved.includes(keywordKey(r.keyword))) &&
      (tab !== "Questions" ||
        r.question ||
        /^(how|what|why|when|where|who|which|can|does|do|is|are|should)\b/i.test(
          r.keyword,
        ) ||
        r.keyword.includes("?")),
  );
  const groups = [...new Set(rows.map((r) => r.group))];
  function download() {
    const href = URL.createObjectURL(
      new Blob(["\uFEFF" + exportCsv(visible, metrics, reportMarket)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = href;
    a.download = "keyword-research.csv";
    a.click();
    URL.revokeObjectURL(href);
  }
  return (
    <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:p-7">
      <dialog
        ref={dialog}
        aria-labelledby="keyword-loading-title"
        onCancel={(e) => {
          e.preventDefault();
          active.current?.abort();
        }}
        className="m-auto w-[min(90vw,440px)] rounded-2xl bg-white p-7 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm dark:bg-slate-900 dark:text-white"
      >
        <Loader2
          aria-hidden
          className="animate-spin motion-reduce:animate-none mx-auto text-[#5271FF]"
          size={36}
        />
        <h2
          id="keyword-loading-title"
          className="mt-4 text-center text-xl font-bold"
        >
          Researching your topic
        </h2>
        <p role="status" className="mt-3 text-center text-sm leading-7">
          {status}
        </p>
        <button
          className={button + " mt-5 w-full"}
          onClick={() => active.current?.abort()}
        >
          Cancel and keep inputs
        </button>
      </dialog>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          generate();
        }}
        noValidate
      >
        <fieldset disabled={busy} className="grid min-w-0 gap-5 lg:grid-cols-2">
          <label className="text-sm font-semibold">
            Seed keywords, one per line
            <textarea
              ref={seedField}
              className={control + " mt-2"}
              rows={3}
              maxLength={1210}
              value={seeds}
              onChange={(e) => setSeeds(e.target.value)}
              placeholder="home espresso classes"
            />
            <span className="mt-2 block text-xs font-normal leading-6">
              Use up to ten seeds, or supply a website below.
            </span>
          </label>
          <div>
            <label htmlFor="keyword-url" className="text-sm font-semibold">
              Public website URL, optional
            </label>
            <ToolUrlInput
              id="keyword-url"
              className={control + " mt-2"}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setContext("");
                setCoverage("");
              }}
              placeholder="https://example.com"
            />
            <p className="mt-2 text-xs leading-6">
              Reviews up to three relevant public pages. Protected pages may
              require a seed keyword instead.
            </p>
          </div>
          <label className="text-sm font-semibold">
            Target country
            <input
              required
              className={control + " mt-2"}
              value={country}
              maxLength={80}
              onChange={(e) => setCountry(e.target.value)}
            />
          </label>
          <label className="text-sm font-semibold">
            Keyword language
            <input
              required
              className={control + " mt-2"}
              value={language}
              maxLength={60}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <button className={button + " bg-[#4058D0] text-white"}>
              <Search size={16} aria-hidden />
              Research keywords
            </button>
            <button type="button" className={button} onClick={example}>
              Try an example
            </button>
          </div>
        </fieldset>
      </form>
      <details className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <summary className="cursor-pointer text-sm font-semibold">
          Import keywords or volume data
        </summary>
        <p className="mt-3 text-sm leading-7">
          Upload English-header CSV or TSV exports, up to 500 keywords and 100
          KB. Numbers and ranges remain unchanged.
        </p>
        <label className="mt-3 block text-sm font-semibold">
          Choose file
          <input
            type="file"
            disabled={busy}
            accept=".csv,.tsv,.txt"
            className={control + " mt-2"}
            onChange={(e) => {
              upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        <p className="mt-2 text-xs leading-6">
          Supported headers include Keyword, Avg. monthly searches, Competition,
          and Top of page bid (low range). Uploads replace earlier metric
          overlays.
        </p>
        <p className="mt-2 break-words text-xs leading-6">{fileNote}</p>
      </details>
      {error && (
        <p
          ref={failure}
          tabIndex={-1}
          role="alert"
          className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm leading-7 text-red-900 dark:bg-red-950 dark:text-red-100"
        >
          {error}
        </p>
      )}
      <p
        role="status"
        className="mt-4 text-sm leading-7 text-blue-800 dark:text-blue-200"
      >
        {!busy && status}
      </p>
      <div
        ref={results}
        tabIndex={-1}
        aria-label="Keyword research results"
        className="mt-6 min-w-0 scroll-mt-32"
        role="region"
      >
        {!rows.length ? (
          <div className="rounded-2xl bg-[#5271FF]/5 p-6">
            <h2 className="text-xl font-bold">
              From a topic to a usable keyword shortlist
            </h2>
            <p className="mt-3 text-sm leading-7">
              Explore related phrases, likely intent, questions, and proposed
              page groups. Import your own metrics when available.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Your keyword workspace</h2>
                <p className="mt-2 text-sm leading-7">{summary}</p>
                <p className="mt-2 text-xs">
                  Research context:{" "}
                  {reportMarket || "Supplied file; confirm its market"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className={button}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        visible.map((r) => r.keyword).join("\n"),
                      );
                      setStatus("Visible keywords copied.");
                    } catch {
                      setError(
                        "Clipboard unavailable. Export visible rows instead.",
                      );
                    }
                  }}
                >
                  Copy keywords
                </button>
                <button className={button} onClick={download}>
                  <Download size={16} aria-hidden />
                  Export visible rows
                </button>
                <button
                  className={button}
                  disabled={
                    busy ||
                    reportMarket === "Illustrative example" ||
                    rows.length >= 120 ||
                    (!seeds.trim() && !url.trim())
                  }
                  onClick={() => generate(true)}
                >
                  Find more ideas
                </button>
              </div>
            </div>
            {reportMarket &&
              reportMarket !== `${country} · ${language}` &&
              reportMarket !== "Illustrative example" && (
                <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                  Settings changed. Existing results retain their original
                  research context. Start a new search to change markets.
                </p>
              )}
            <p className="mt-4 rounded-xl bg-slate-100 p-4 text-sm leading-7 dark:bg-slate-800">
              Ideas, intent, and groups are suggestions. Uploaded metrics are
              user-supplied, not independently verified. Advertising competition
              is separate from organic ranking difficulty.
            </p>
            {coverage && (
              <details className="mt-3 text-xs leading-6">
                <summary className="cursor-pointer">
                  Website context reviewed
                </summary>
                <p className="break-words">{coverage}</p>
              </details>
            )}
            <div
              className="my-5 flex flex-wrap gap-2"
              role="group"
              aria-label="Research view"
            >
              {["Explorer", "Questions", "Groups"].map((t) => (
                <button
                  className={
                    button +
                    (tab === t ? " border-[#5271FF] bg-[#5271FF]/10" : "")
                  }
                  aria-pressed={tab === t}
                  key={t}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label className="text-xs font-semibold">
                Filter keywords
                <input
                  className={control + " mt-1"}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <label className="text-xs font-semibold">
                Inferred intent
                <select
                  className={control + " mt-1"}
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                >
                  <option value="all">All intents</option>
                  {intents.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold">
                Proposed page group
                <select
                  className={control + " mt-1"}
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                >
                  <option value="all">All groups</option>
                  {groups.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </label>
              <button
                className={button + " self-end"}
                aria-pressed={onlySaved}
                onClick={() => setOnlySaved(!onlySaved)}
              >
                <Bookmark size={15} aria-hidden />
                Shortlist ({saved.length})
              </button>
            </div>
            <p className="mb-3 text-xs leading-6">
              {visible.length} of {rows.length} keywords shown. Volume is
              unavailable unless matched to an uploaded metric row.
            </p>
            {tab === "Groups" ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[...new Set(visible.map((r) => r.group))].map((g) => (
                  <section
                    className="min-w-0 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                    key={g}
                  >
                    <h3 className="font-bold">{g}</h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7">
                      {visible
                        .filter((r) => r.group === g)
                        .map((r) => (
                          <li
                            className="break-words"
                            key={keywordKey(r.keyword)}
                          >
                            {r.keyword}
                          </li>
                        ))}
                    </ul>
                    <p className="mt-3 text-xs leading-6">
                      Review search results before deciding whether this group
                      needs one page or several.
                    </p>
                  </section>
                ))}
              </div>
            ) : (
              <div
                className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700"
                tabIndex={0}
                role="region"
                aria-label="Keyword table, scroll horizontally"
              >
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      {[
                        "Save",
                        "Keyword and reader task",
                        "Inferred intent",
                        "Proposed group",
                        "Uploaded volume",
                        "Ad competition",
                        "Uploaded bid range",
                      ].map((h) => (
                        <th className="p-3" scope="col" key={h}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((r) => {
                      const key = keywordKey(r.keyword),
                        m = map.get(key);
                      return (
                        <tr
                          key={key}
                          className="border-t border-slate-200 align-top dark:border-slate-700"
                        >
                          <td className="p-3">
                            <button
                              className={button}
                              aria-label={`${saved.includes(key) ? "Remove" : "Save"} ${r.keyword}`}
                              aria-pressed={saved.includes(key)}
                              onClick={() =>
                                setSaved((p) =>
                                  p.includes(key)
                                    ? p.filter((k) => k !== key)
                                    : [...p, key],
                                )
                              }
                            >
                              <Bookmark size={16} aria-hidden />
                            </button>
                          </td>
                          <th scope="row" className="max-w-sm p-3 font-normal">
                            <strong className="block break-words font-semibold">
                              {r.keyword}
                            </strong>
                            <span className="mt-1 block text-xs leading-6 text-slate-600 dark:text-slate-300">
                              {r.task}
                            </span>
                            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                              {r.origin} · {r.format}
                            </span>
                          </th>
                          <td className="p-3">
                            <span className="inline-block rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-900 dark:bg-blue-900/40 dark:text-blue-100">
                              {r.intent}
                            </span>
                          </td>
                          <td className="p-3">{r.group}</td>
                          <td className="p-3">{m?.volume || "Unavailable"}</td>
                          <td className="p-3">
                            {m?.competition || "Unavailable"}
                          </td>
                          <td className="p-3">
                            {m?.bidLow || m?.bidHigh
                              ? `${m.bidLow || "Unavailable"} to ${m.bidHigh || "Unavailable"}`
                              : "Unavailable"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {!visible.length && (
              <p className="rounded-xl bg-slate-100 p-5 text-sm dark:bg-slate-800">
                No matches. Adjust your filters or shortlist selection.
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              {[
                ["keyword-clustering-tool", "Review keyword clusters"],
                ["search-intent-checker", "Review search intent"],
                ["seo-content-brief-generator", "Create a content brief"],
              ].map(([slug, label]) => (
                <Link className={button} key={slug} href={`/tools/${slug}`}>
                  {label}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      <p className="mt-5 text-xs leading-6 text-slate-500 dark:text-slate-400">
        Up to 15 discovery requests daily. Generated lists contain up to 120
        ideas across batches. Export your work before leaving this session.
      </p>
    </div>
  );
}

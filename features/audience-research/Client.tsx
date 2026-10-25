"use client";
import React, { useEffect, useRef, useState } from "react";
import { Loader2, Users, Download, Copy, ArrowUpRight } from "lucide-react";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";
import { readToolResponse } from "@/lib/ai-tools/client-response";
import type { PageSnapshot } from "@/features/on-page-analyzer/types";
import {
  channels,
  inputSchema,
  validateOutput,
  exampleReport,
  reportCsv,
  type AudienceInput,
  type AudienceReport,
} from "./schema";
const initial: AudienceInput = {
  brief: "",
  websiteText: "",
  notes: "",
  market: "",
  goal: "",
  businessType: "Blog or publication",
  stage: "New idea",
  focus: "Explore options",
};
const field =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5271FF] dark:border-slate-600 dark:bg-slate-950 dark:text-white";
const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold transition hover:border-[#5271FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271FF] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600";
const tabs = [
  "Overview",
  "Buyer personas",
  "Content and channels",
  "Validation plan",
] as const;
const destinations: Record<(typeof channels)[number], string> = {
  Search: "https://www.google.com/search?q=",
  TikTok: "https://www.tiktok.com/search?q=",
  YouTube: "https://www.youtube.com/results?search_query=",
  LinkedIn: "https://www.linkedin.com/search/results/content/?keywords=",
  Instagram: "https://www.instagram.com/",
  Facebook: "https://www.facebook.com/search/top?q=",
  Reddit: "https://www.reddit.com/search/?q=",
  Email: "",
};
export default function AudienceClient() {
  const [input, setInput] = useState<AudienceInput>(initial),
    [url, setUrl] = useState(""),
    [importNote, setImportNote] = useState(""),
    [mode, setMode] = useState("idea"),
    [busy, setBusy] = useState<"import" | "plan" | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [tab, setTab] = useState<(typeof tabs)[number]>("Overview"),
    [selected, setSelected] = useState(0);
  const [saved, setSaved] = useState<{
    report: AudienceReport;
    input: AudienceInput;
    example: boolean;
    source: string;
  } | null>(null);
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const active = useRef<AbortController | null>(null),
    result = useRef<HTMLDivElement>(null);
  useEffect(() => () => active.current?.abort(), []);
  useEffect(() => {
    if (!saved) return;
    const frame = requestAnimationFrame(() => {
      result.current?.focus({ preventScroll: true });
      result.current?.scrollIntoView({
        block: "start",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [saved]);
  function update<K extends keyof AudienceInput>(
    key: K,
    value: AudienceInput[K],
  ) {
    setInput((p) => ({ ...p, [key]: value }));
  }
  async function run(kind: "import" | "plan") {
    if (active.current) return;
    const parsed = inputSchema.safeParse(input);
    if (kind === "plan" && !parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (kind === "import" && !url.trim()) {
      setError("Enter a public website or article URL.");
      return;
    }
    const controller = new AbortController();
    active.current = controller;
    const timeout = setTimeout(
      () => controller.abort(),
      kind === "import" ? 30000 : 55000,
    );
    setBusy(kind);
    setError("");
    setMessage(
      kind === "import"
        ? "Reading your public page context."
        : "Building a working audience plan.",
    );
    try {
      if (kind === "import") {
        const response = await fetch("/api/ai-tools/on-page/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
          signal: controller.signal,
        });
        const body = await readToolResponse<{ result: PageSnapshot }>(response);
        const page = body.result;
        const text = [
          page.title,
          page.description,
          ...page.blocks.map((b) => b.text),
        ]
          .filter(Boolean)
          .join("\n")
          .slice(0, 6000);
        if (text.length < 25)
          throw Error(
            "This page did not expose enough readable text. Describe your offer instead.",
          );
        update("websiteText", text);
        setImportNote(
          `Imported ${text.length.toLocaleString()} characters from ${page.url}. ${page.partial ? "The source import was partial. " : ""}Only this page was read. Review the text below before planning.`,
        );
        setMessage(
          "Website context imported. Add your goal, then build an audience plan.",
        );
      } else {
        const data = parsed.success ? parsed.data : input;
        const response = await fetch("/api/ai-tools/audience-research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          signal: controller.signal,
        });
        const body = await readToolResponse<{ result: unknown }>(response);
        setSaved({
          report: validateOutput(body.result, data),
          input: data,
          example: false,
          source: importNote,
        });
        setTab("Overview");
        setSelected(0);
        setDecisions({});
        setMessage(
          "Your working audience plan is ready. Review its hypotheses before acting.",
        );
      }
    } catch (e) {
      setMessage("");
      setError(
        controller.signal.aborted
          ? "Waiting stopped. Your inputs and previous plan remain available."
          : e instanceof Error
            ? e.message
            : "The request failed. Please try again.",
      );
    } finally {
      clearTimeout(timeout);
      active.current = null;
      setBusy(null);
    }
  }
  function example() {
    const data = {
      ...initial,
      brief:
        "A learning website offering practical SEO guides and tools for independent business bloggers.",
      goal: "Help readers write and review accurate page metadata.",
      focus: "TikTok" as const,
    };
    setInput(data);
    setUrl("");
    setImportNote("");
    setSaved({
      report: exampleReport(),
      input: data,
      example: true,
      source: "",
    });
    setTab("Overview");
    setSelected(0);
    setDecisions({});
    setError("");
    setMessage(
      "Illustrative example loaded. No audience research was performed.",
    );
  }
  function download(csv = false) {
    if (!saved) return;
    const body = csv
      ? reportCsv(saved.report)
      : JSON.stringify(
          {
            ...saved,
            reviewerDecisions: decisions,
            limits:
              "Working hypotheses and supplied notes, not verified audience demographics or measured platform presence.",
          },
          null,
          2,
        );
    const link = document.createElement("a");
    const href = URL.createObjectURL(
      new Blob([csv ? "\uFEFF" + body : body], {
        type: csv ? "text/csv;charset=utf-8" : "application/json",
      }),
    );
    link.href = href;
    link.download = csv ? "audience-findings.csv" : "audience-plan.json";
    link.click();
    URL.revokeObjectURL(href);
  }
  async function copy() {
    if (!saved) return;
    try {
      await navigator.clipboard.writeText(
        JSON.stringify({ ...saved, reviewerDecisions: decisions }, null, 2),
      );
      setMessage("Full audience plan copied.");
    } catch {
      setMessage("Clipboard unavailable. Download your report instead.");
    }
  }
  const stale = saved && JSON.stringify(input) !== JSON.stringify(saved.input),
    persona = saved?.report.segments[selected];
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:p-7">
      <div
        role="status"
        aria-live="polite"
        className="mb-3 text-sm leading-6 text-blue-700 dark:text-blue-200"
      >
        {message}
      </div>
      <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
        <form
          className="min-w-0"
          onSubmit={(e) => {
            e.preventDefault();
            run("plan");
          }}
        >
          <h2 className="text-xl font-bold">Start with your business</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Describe a new idea, paste an article, or import one public page.
            Add customer evidence when available.
          </p>
          <fieldset disabled={!!busy} className="mt-5 space-y-5">
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Starting point"
            >
              {[
                ["idea", "Idea or pasted brief"],
                ["website", "Website or article URL"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={mode === value}
                  className={
                    button +
                    (mode === value ? " border-[#5271FF] bg-[#5271FF]/10" : "")
                  }
                  onClick={() => setMode(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            {mode === "website" && (
              <div>
                <label htmlFor="audience-url" className="text-sm font-semibold">
                  Public page URL
                </label>
                <ToolUrlInput
                  id="audience-url"
                  className={field}
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    update("websiteText", "");
                    setImportNote("");
                  }}
                  placeholder="https://example.com/about"
                />
                <button
                  type="button"
                  className={button + " mt-3"}
                  onClick={() => run("import")}
                >
                  Import website context
                </button>
                <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                  One readable page, not a site crawl. Protected pages may
                  require a pasted brief.
                </p>
              </div>
            )}
            <div>
              <label htmlFor="audience-brief" className="text-sm font-semibold">
                Your idea, offer, or article brief
              </label>
              <textarea
                id="audience-brief"
                className={field}
                rows={5}
                maxLength={5000}
                value={input.brief}
                onChange={(e) => update("brief", e.target.value)}
                placeholder="What will you offer? Which problem does it solve? What makes it useful?"
              />
            </div>
            {input.websiteText && (
              <details>
                <summary className="cursor-pointer text-sm font-semibold">
                  Review imported page text
                </summary>
                <p className="mt-2 break-words text-xs leading-6">
                  {importNote}
                </p>
                <label htmlFor="audience-import" className="sr-only">
                  Imported page context
                </label>
                <textarea
                  id="audience-import"
                  rows={6}
                  className={field}
                  maxLength={6000}
                  value={input.websiteText}
                  onChange={(e) => update("websiteText", e.target.value)}
                />
              </details>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Business type
                <select
                  className={field}
                  value={input.businessType}
                  onChange={(e) =>
                    update(
                      "businessType",
                      e.target.value as AudienceInput["businessType"],
                    )
                  }
                >
                  {["Blog or publication", "B2B", "B2C", "Mixed"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold">
                Current stage
                <select
                  className={field}
                  value={input.stage}
                  onChange={(e) =>
                    update("stage", e.target.value as AudienceInput["stage"])
                  }
                >
                  {["New idea", "Existing business", "Audience refinement"].map(
                    (s) => (
                      <option key={s}>{s}</option>
                    ),
                  )}
                </select>
              </label>
            </div>
            <label className="block text-sm font-semibold">
              Market and language <span className="font-normal">optional</span>
              <input
                className={field}
                maxLength={300}
                value={input.market}
                onChange={(e) => update("market", e.target.value)}
                placeholder="Pakistan, Urdu and English"
              />
            </label>
            <label className="block text-sm font-semibold">
              Decision this research should inform
              <textarea
                required
                className={field}
                rows={2}
                maxLength={400}
                value={input.goal}
                onChange={(e) => update("goal", e.target.value)}
                placeholder="Choose an initial audience and plan useful launch content."
              />
            </label>
            <label className="block text-sm font-semibold">
              Channel focus
              <select
                className={field}
                value={input.focus}
                onChange={(e) =>
                  update("focus", e.target.value as AudienceInput["focus"])
                }
              >
                {["Explore options", ...channels].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <details className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <summary className="cursor-pointer text-sm font-semibold">
                Add anonymized customer notes
              </summary>
              <p className="mt-2 text-xs leading-6">
                Include real interview findings, customer questions, or
                feedback. Add dates and context. Remove personal information.
                Notes are not independently verified.
              </p>
              <label htmlFor="audience-notes" className="sr-only">
                Customer evidence notes
              </label>
              <textarea
                id="audience-notes"
                className={field}
                rows={5}
                maxLength={4000}
                value={input.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </details>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className={button + " bg-[#4058D0] text-white"}
              >
                <Users size={17} aria-hidden />
                Build audience plan
              </button>
              <button type="button" className={button} onClick={example}>
                Try an example
              </button>
            </div>
          </fieldset>
          {busy && (
            <button
              type="button"
              onClick={() => active.current?.abort()}
              className={button + " mt-3"}
            >
              Stop waiting
            </button>
          )}
          <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
            Up to 15 generated plans daily. Drafts and review decisions stay in
            this session. Export before leaving.
          </p>
        </form>
        <div
          ref={result}
          tabIndex={-1}
          role="region"
          aria-label="Audience planning results"
          className="min-w-0 scroll-mt-32 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5271FF]"
          aria-busy={!!busy}
        >
          {busy && (
            <p className="mb-4 flex items-center gap-3 rounded-xl bg-[#5271FF]/10 p-4 text-sm">
              <Loader2
                className="animate-spin motion-reduce:animate-none"
                size={20}
                aria-hidden
              />
              {busy === "import"
                ? "Reading public page context…"
                : "Building working personas and a validation plan…"}
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mb-4 break-words rounded-xl border border-red-300 bg-red-50 p-4 text-sm leading-7 text-red-800 dark:bg-red-950/30 dark:text-red-200"
            >
              {error}
            </p>
          )}
          {!saved ? (
            <div className="rounded-2xl border border-dashed border-[#5271FF]/40 bg-[#5271FF]/5 p-7">
              <Users size={30} className="text-[#5271FF]" aria-hidden />
              <h2 className="mt-4 text-xl font-bold">
                A useful audience plan starts with a clear problem
              </h2>
              <p className="mt-3 text-sm leading-7">
                Explore working personas, content ideas, channel experiments,
                and research questions. Use the example to preview the
                dashboard.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold">Your audience workspace</h2>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={button} onClick={copy}>
                    <Copy size={15} aria-hidden />
                    Copy
                  </button>
                  <button
                    type="button"
                    className={button}
                    onClick={() => download()}
                  >
                    <Download size={15} aria-hidden />
                    JSON
                  </button>
                  <button
                    type="button"
                    className={button}
                    onClick={() => download(true)}
                  >
                    Findings CSV
                  </button>
                </div>
              </div>
              {stale && (
                <p className="mt-4 rounded-xl bg-amber-100 p-3 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
                  Inputs changed. This plan belongs to the previous brief.
                </p>
              )}
              <p className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-950 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100">
                {saved.example ? "Illustrative example. " : ""}Personas are
                working hypotheses. Supplied notes are not independently
                verified. Channel suggestions are places to investigate, not
                confirmed audience locations.
              </p>
              <div
                className="my-5 flex flex-wrap gap-2"
                role="group"
                aria-label="Report views"
              >
                {tabs.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={
                      button +
                      (tab === t ? " border-[#5271FF] bg-[#5271FF]/10" : "")
                    }
                    aria-pressed={tab === t}
                    onClick={() => setTab(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {tab === "Overview" && (
                <div className="space-y-5">
                  <p className="text-base leading-8">{saved.report.summary}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {saved.report.segments.map((s, i) => (
                      <button
                        key={s.name}
                        className="rounded-xl border border-slate-200 p-5 text-left hover:border-[#5271FF] dark:border-slate-700"
                        onClick={() => {
                          setSelected(i);
                          setTab("Buyer personas");
                        }}
                      >
                        <h3 className="font-bold">{s.name}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                          {s.fit}
                        </p>
                        <span className="mt-3 block text-sm font-semibold text-blue-700 dark:text-blue-300">
                          Review working persona →
                        </span>
                      </button>
                    ))}
                  </div>
                  <h3 className="font-bold">What remains unknown</h3>
                  <ul className="list-disc space-y-2 pl-5 text-sm leading-7">
                    {saved.report.unknowns.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(tab === "Buyer personas" || tab === "Content and channels") &&
                persona && (
                  <>
                    <label className="block text-sm font-semibold">
                      Audience segment
                      <select
                        className={field}
                        value={selected}
                        onChange={(e) => setSelected(Number(e.target.value))}
                      >
                        {saved.report.segments.map((s, i) => (
                          <option value={i} key={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <h3 className="mt-5 text-lg font-bold">{persona.name}</h3>
                    <p className="mt-2 text-sm leading-7">{persona.fit}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
                      Outside this segment: {persona.notFor}
                    </p>
                    {tab === "Buyer personas" ? (
                      <div className="mt-5 space-y-4">
                        {persona.findings.map((f, i) => {
                          const key = `${selected}-${i}`;
                          return (
                            <section
                              key={f.topic}
                              className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                            >
                              <div className="flex flex-wrap justify-between gap-2">
                                <h4 className="font-bold">{f.topic}</h4>
                                <span
                                  className={
                                    "rounded-full px-3 py-1 text-xs font-semibold " +
                                    (f.state === "Supported by supplied notes"
                                      ? "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100"
                                      : f.state === "Unknown"
                                        ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                        : "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100")
                                  }
                                >
                                  {f.state}
                                </span>
                              </div>
                              <p className="mt-3 text-sm leading-7">
                                {f.value}
                              </p>
                              {f.evidence.map((e, j) => (
                                <blockquote
                                  className="mt-3 border-l-2 border-[#5271FF] pl-3 text-sm leading-7"
                                  key={j}
                                >
                                  {e.source}: “{e.quote}”
                                </blockquote>
                              ))}
                              <p className="mt-3 text-sm leading-7">
                                <strong>Ask to validate</strong> {f.question}
                              </p>
                              <label className="mt-3 block text-xs font-semibold">
                                Your review decision
                                <select
                                  className={field}
                                  value={decisions[key] || "Not reviewed"}
                                  onChange={(e) =>
                                    setDecisions((d) => ({
                                      ...d,
                                      [key]: e.target.value,
                                    }))
                                  }
                                >
                                  {[
                                    "Not reviewed",
                                    "Supported by my research",
                                    "Needs revision",
                                    "Not relevant",
                                  ].map((x) => (
                                    <option key={x}>{x}</option>
                                  ))}
                                </select>
                              </label>
                            </section>
                          );
                        })}
                        <p className="text-xs leading-6">
                          Saved decisions reflect your judgment. They do not
                          independently verify a persona or change its evidence
                          label.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-5 space-y-4">
                        {persona.outreach.map((o, i) => (
                          <section
                            key={i}
                            className="rounded-xl border border-slate-200 p-5 dark:border-slate-700"
                          >
                            <h4 className="font-bold">
                              {o.channel} · Suggested experiment
                            </h4>
                            <p className="mt-2 text-sm leading-7">
                              {o.rationale}
                            </p>
                            <dl className="mt-3 space-y-3 text-sm leading-7">
                              {[
                                ["Content idea", o.contentIdea],
                                ["Format", o.format],
                                ["Small test", o.experiment],
                                ["Observe", o.metric],
                              ].map(([name, value]) => (
                                <div key={name}>
                                  <dt className="font-semibold">{name}</dt>
                                  <dd>{value}</dd>
                                </div>
                              ))}
                            </dl>
                            {destinations[o.channel] && (
                              <a
                                className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-blue-700 underline dark:text-blue-300"
                                href={
                                  destinations[o.channel] +
                                  (o.channel === "Instagram"
                                    ? ""
                                    : encodeURIComponent(o.topic))
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Explore {o.channel}
                                <ArrowUpRight size={15} aria-hidden />
                              </a>
                            )}
                            <p className="mt-2 text-xs leading-6">
                              Check relevance, community rules, and actual
                              conversations before choosing a channel. Results
                              may require sign-in.
                            </p>
                          </section>
                        ))}
                      </div>
                    )}
                  </>
                )}
              {tab === "Validation plan" && (
                <div className="space-y-5">
                  <h3 className="font-bold">Interview questions</h3>
                  <ol className="list-decimal space-y-2 pl-5 text-sm leading-7">
                    {saved.report.questions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ol>
                  <h3 className="font-bold">Turn assumptions into research</h3>
                  {saved.report.experiments.map((e, i) => (
                    <section
                      key={i}
                      className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <h4 className="font-bold">
                        {i + 1}. {e.task}
                      </h4>
                      <p className="mt-2 text-sm leading-7">
                        <strong>Collect</strong> {e.evidenceNeeded}
                      </p>
                      <p className="mt-2 text-sm leading-7">
                        <strong>Decision</strong> {e.decision}
                      </p>
                    </section>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

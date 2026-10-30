"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Download,
  FileText,
  Globe,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import {
  PILLAR_META,
  analyzeEeatHtml,
  buildEeatDocx,
  exportEeatCsv,
  type EeatAuditReport,
  type EeatPillar,
} from "./model";

const SAMPLE_EEAT_HTML = `<!doctype html><html><head>
  <title>2026 Core Web Vitals & Technical SEO Benchmark Study | DoItWithAI Research</title>
  <meta name="author" content="Sufian Ahmad" />
  <meta property="article:published_time" content="2026-09-10" />
  <meta property="article:modified_time" content="2026-10-28" />
  <script type="application/ld+json">{
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": "2026 Core Web Vitals & Technical SEO Benchmark Study",
        "datePublished": "2026-09-10",
        "dateModified": "2026-10-28",
        "author": {
          "@type": "Person",
          "name": "Sufian Ahmad",
          "url": "https://doitwithai.tools/author/sufian",
          "sameAs": ["https://www.linkedin.com/in/sufian-seo", "https://github.com/sufi0900"]
        },
        "reviewedBy": {
          "@type": "Person",
          "name": "Dr. Ayesha Khan, Data Systems Lead"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home"}]
      },
      {
        "@type": "FAQPage",
        "mainEntity": []
      }
    ]
  }</script>
</head><body>
  <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/about">About Us</a> / <a href="/contact">Contact</a> / <a href="/editorial-policy">Editorial Policy</a></nav>
  <main><article>
    <h1>2026 Core Web Vitals & Technical SEO Benchmark Study</h1>
    <p class="byline">By <a href="/author/sufian" rel="author">Sufian Ahmad</a> · Fact-checked by Dr. Ayesha Khan · Editorial Disclosure: Independent benchmark study with zero paid placements.</p>
    <p>In our test of 420 production websites across 14 days, we measured how interaction latency affects organic visibility. When we ran our dataset against Google CrUX thresholds, 64.2% of pages passing INP under 150ms retained top-3 rankings during core updates. ${"Detailed practitioner analysis covering methodology, sample sizes, edge cases, and reproducible verification steps for engineering and SEO teams. ".repeat(55)}</p>
    <h2>Methodology & How We Tested</h2>
    <p>We evaluated 420 URLs over 30 days using field CrUX data and documented limitations. Reference specifications include <a href="https://developers.google.com/search/docs">Google Search Central Docs</a>, <a href="https://www.w3.org/TR/">W3C Standards</a>, and <a href="https://web.dev/vitals/">Web.dev Vitals</a>.</p>
    <figure><img src="/chart1.png" alt="Distribution of INP latency across 420 tested domains" /><img src="/chart2.png" alt="Comparison table of LCP before and after asset optimization" /></figure>
    <table><thead><tr><th>Metric</th><th>Median</th></tr></thead><tbody><tr><td>INP</td><td>142ms</td></tr></tbody></table>
    <table><thead><tr><th>Tier</th><th>Pass Rate</th></tr></thead><tbody><tr><td>SaaS</td><td>68%</td></tr></tbody></table>
    <h2>Frequently Asked Questions</h2>
    <p>Answers to common practitioner questions.</p>
  </article></main>
</body></html>`;

const control =
  "w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";
const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-[#5271ff] dark:border-slate-600 dark:hover:bg-slate-800";

export default function EeatContentAuditorClient() {
  const [mode, setMode] = useState<"live" | "html">("live");
  const [urlInput, setUrlInput] = useState("");
  const [strictness, setStrictness] = useState<"standard" | "ymyl">("standard");
  const [htmlInput, setHtmlInput] = useState("");
  const [pillarFilter, setPillarFilter] = useState<EeatPillar | "all">("all");

  const [report, setReport] = useState<EeatAuditReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [revision, setRevision] = useState(0);

  const resultRef = useRef<HTMLElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!busy && revision > 0) {
      focusToolSection(resultRef.current);
    }
  }, [busy, revision]);

  function loadSample() {
    setError("");
    const built = analyzeEeatHtml({
      html: SAMPLE_EEAT_HTML,
      url: "https://doitwithai.tools/research/cwv-benchmark-study",
      strictness,
      mode: "sample",
    });
    setReport(built);
    setRevision((r) => r + 1);
    setFeedback(
      "Loaded sample research article and evaluated all 20 E-E-A-T & Helpful Content signals.",
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setFeedback("");

    if (mode === "live" && !urlInput.trim()) {
      setError(
        "Enter a public webpage URL to scan (or click 'Load Sample E-E-A-T Audit').",
      );
      return;
    }
    if (mode === "html" && !htmlInput.trim()) {
      setError("Paste webpage HTML to run the 20-signal E-E-A-T audit.");
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setBusy(true);

    try {
      await paintToolFeedback();
      if (mode === "html") {
        const built = analyzeEeatHtml({
          html: htmlInput,
          url: urlInput.trim() || "https://example.com/audited-page",
          strictness,
          mode: "html",
        });
        setReport(built);
        setRevision((r) => r + 1);
      } else {
        const res = await fetch("/api/ai-tools/eeat-content-auditor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            url: urlInput.trim(),
            strictness,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.report) {
          setError(
            data?.error?.message ||
              "Could not fetch the target URL. Try Pasted HTML mode.",
          );
          return;
        }
        setReport(data.report);
        setRevision((r) => r + 1);
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        setError("Audit interrupted. Check your URL or HTML and try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleDownload(format: "csv" | "docx") {
    if (!report) return;
    if (format === "csv") {
      triggerDownload(
        new Blob([exportEeatCsv(report)], { type: "text/csv;charset=utf-8" }),
        "eeat-20-signal-audit.csv",
      );
      setFeedback("Downloaded 20-signal E-E-A-T audit CSV.");
    } else {
      const bytes = buildEeatDocx(report);
      triggerDownload(
        new Blob([bytes as unknown as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
        "eeat-remediation-brief.docx",
      );
      setFeedback("Downloaded editable Word (.docx) E-E-A-T remediation brief.");
    }
  }

  const filteredSignals = useMemo(() => {
    if (!report) return [];
    if (pillarFilter === "all") return report.signals;
    return report.signals.filter((s) => s.pillar === pillarFilter);
  }, [report, pillarFilter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <ToolRunOverlay
        active={busy}
        title="Auditing 20 E-E-A-T & Helpful Content signals"
        description="Inspecting author credentials, JSON-LD sameAs disambiguation, first-hand experience markers, citations, and trust policies."
        onCancel={() => {
          abortControllerRef.current?.abort();
          setBusy(false);
        }}
      />

      <form onSubmit={handleSubmit} noValidate className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-2xl font-extrabold">
              <Award aria-hidden className="text-[#5271ff]" />
              Run a 20-Signal E-E-A-T & Helpful Content Audit
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Inspect concrete HTML, schema, authorship, and citation evidence
              across Experience, Expertise, Authoritativeness, and
              Trustworthiness.
            </p>
          </div>
          <button type="button" onClick={loadSample} className={secondaryBtn}>
            <Sparkles size={16} className="text-[#5271ff]" />
            Load Sample E-E-A-T Audit
          </button>
        </div>

        <div
          role="tablist"
          aria-label="E-E-A-T input mode"
          className="mt-6 grid gap-2 sm:grid-cols-2"
        >
          {[
            {
              id: "live" as const,
              label: "1. Audit Live Public Webpage URL",
              sub: "Fetches live HTML, JSON-LD schema, and page links",
              icon: Globe,
            },
            {
              id: "html" as const,
              label: "2. Audit Pasted Webpage HTML",
              sub: "Inspect staging drafts or firewall-protected pages",
              icon: FileText,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setMode(tab.id);
                  setError("");
                }}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-[#3452d1] bg-[#3452d1]/5 ring-2 ring-[#3452d1]/20 dark:border-[#5271ff] dark:bg-[#5271ff]/10"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon
                  size={20}
                  className={
                    active
                      ? "mt-0.5 shrink-0 text-[#3452d1] dark:text-[#9aabff]"
                      : "mt-0.5 shrink-0 text-slate-400"
                  }
                />
                <div>
                  <p className="text-sm font-bold">{tab.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {tab.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-[1.5fr_1fr]">
          <div>
            <label htmlFor="eeat-url-input" className="block text-sm font-bold">
              Target Webpage URL{" "}
              {mode === "live" ? "(required)" : "(optional reference)"}
            </label>
            <input
              id="eeat-url-input"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://your-site.com/guides/complete-audit"
              className={`${control} mt-1`}
            />
          </div>
          <div>
            <label
              htmlFor="eeat-strictness"
              className="block text-sm font-bold"
            >
              Evaluation Strictness Profile
            </label>
            <select
              id="eeat-strictness"
              value={strictness}
              onChange={(e) =>
                setStrictness(e.target.value as "standard" | "ymyl")
              }
              className={`${control} mt-1 dark:bg-slate-900`}
            >
              <option value="standard">
                Standard Editorial / SaaS / B2B Content
              </option>
              <option value="ymyl">
                YMYL Strict (Finance, Health, Legal, Safety)
              </option>
            </select>
          </div>
        </div>

        {mode === "html" && (
          <div className="mt-5">
            <label
              htmlFor="eeat-html-input"
              className="block text-sm font-bold"
            >
              Paste Full Webpage HTML
            </label>
            <textarea
              id="eeat-html-input"
              rows={7}
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="<!doctype html><html><head>...</head><body><article>...</article></body></html>"
              className={`${control} mt-1 font-mono text-xs`}
            />
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
          >
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {feedback && !error && (
          <p
            role="status"
            className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-300"
          >
            {feedback}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className={primaryBtn}>
            <ShieldCheck size={18} />
            Run 20-Signal E-E-A-T Audit
          </button>
          {report && (
            <button
              type="button"
              onClick={() => {
                setReport(null);
                setFeedback("");
              }}
              className={secondaryBtn}
            >
              <RefreshCw size={15} />
              Clear
            </button>
          )}
        </div>
      </form>

      {report && (
        <section
          ref={resultRef}
          tabIndex={-1}
          aria-label="E-E-A-T audit results"
          className="mt-10 space-y-8 focus:outline-none"
        >
          {/* Executive Summary & Pillar Bars */}
          <div className={panel}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
                  20-Signal On-Page Evidence Audit ·{" "}
                  {report.strictness === "ymyl" ? "YMYL Strict" : "Standard"}
                </span>
                <h3 className="mt-1 text-2xl font-black">{report.pageTitle}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Author: <strong>{report.detectedAuthor}</strong> · Reviewer:{" "}
                  <strong>{report.detectedReviewer}</strong> · Published:{" "}
                  <strong>{report.detectedDates.published}</strong> · Updated:{" "}
                  <strong>{report.detectedDates.modified}</strong>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload("csv")}
                  className={primaryBtn}
                >
                  <Download size={16} />
                  Download 20-Signal CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("docx")}
                  className={secondaryBtn}
                >
                  <Download size={16} />
                  Remediation Brief (.DOCX)
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Signal Coverage
                </p>
                <p className="mt-2 text-3xl font-black text-[#3452d1] dark:text-[#9aabff]">
                  {report.overallScore}
                  <span className="text-base font-semibold text-slate-400">
                    /100
                  </span>
                </p>
                <p className="mt-1 text-xs capitalize text-slate-500">
                  {report.readinessTier} signal density
                </p>
              </div>

              {report.pillars.map((pl) => (
                <div
                  key={pl.pillar}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40"
                >
                  <p className="text-xs font-bold uppercase text-slate-500">
                    {pl.pillar}
                  </p>
                  <p className="mt-2 text-2xl font-black">{pl.scorePct}%</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {pl.passed} pass · {pl.partial} partial · {pl.missing} missing
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Fixes */}
          {report.priorityFixes.length > 0 && (
            <div className={panel}>
              <h3 className="text-xl font-extrabold">
                Priority On-Page E-E-A-T Improvements ({report.priorityFixes.length})
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Ordered by impact weight so your editors and developers know
                what to add first.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {report.priorityFixes.slice(0, 6).map((fix) => (
                  <div
                    key={fix.id}
                    className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20"
                  >
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${PILLAR_META[fix.pillar].badgeClass}`}
                    >
                      {PILLAR_META[fix.pillar].label}
                    </span>
                    <p className="mt-2 text-sm font-bold">{fix.title}</p>
                    <p className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-300">
                      Observed: {fix.observedEvidence}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-slate-900 dark:text-white">
                      Fix: {fix.remediation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full 20-Signal Matrix */}
          <div className={panel}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-xl font-extrabold">
                Complete 20-Signal E-E-A-T Inspection Log
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(["all", "experience", "expertise", "authoritativeness", "trustworthiness"] as const).map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPillarFilter(p)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold capitalize ${
                        pillarFilter === p
                          ? "border-[#3452d1] bg-[#3452d1] text-white"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {p === "all" ? "All 20 Signals" : p}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {filteredSignals.map((sig) => (
                <div
                  key={sig.id}
                  className={`rounded-xl border p-4 ${
                    sig.status === "pass"
                      ? "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                      : sig.status === "partial"
                        ? "border-amber-200/80 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/20"
                        : "border-rose-200/80 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {sig.status === "pass" ? (
                      <CheckCircle2
                        size={17}
                        className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                      />
                    ) : sig.status === "partial" ? (
                      <AlertTriangle
                        size={17}
                        className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                      />
                    ) : (
                      <XCircle
                        size={17}
                        className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400"
                      />
                    )}
                    <div>
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${PILLAR_META[sig.pillar].badgeClass}`}
                      >
                        {sig.pillar.toUpperCase()}
                      </span>
                      <p className="mt-1.5 text-sm font-bold">{sig.title}</p>
                      <p className="mt-1 font-mono text-xs text-slate-800 dark:text-slate-200">
                        {sig.observedEvidence}
                      </p>
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                        {sig.remediation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

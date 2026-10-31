"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  FileText,
  Globe,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import {
  analyzePublisherProspectHtml,
  buildProspectVettingDocx,
  exportProspectVettingCsv,
  type ProspectVettingResult,
} from "./model";

const SAMPLE_PROSPECTS: Array<{
  url: string;
  html: string;
}> = [
  {
    url: "https://martech-editorial-journal.example.com/guides/technical-seo-audits",
    html: `<!doctype html><html><head>
      <title>How Technical SEO & Link Audits Improve Search Visibility | MarTech Journal</title>
      <link rel="canonical" href="https://martech-editorial-journal.example.com/guides/technical-seo-audits" />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Elena Rostova" />
      <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","author":{"@type":"Person","name":"Elena Rostova"},"datePublished":"2026-09-18","dateModified":"2026-10-12"}</script>
    </head><body><main><article>
      <h1>How Technical SEO and Off-Page Link Audits Work Together</h1>
      <p>Modern search teams combine technical crawlability checks with disciplined off-page link building and backlink audits. Before pitching a digital PR story or guest article, SEO leads verify indexability, canonical alignment, and anchor text context. ${"Editorial depth paragraph explaining search intent, topical authority, internal linking architecture, and sustainable digital PR outreach workflows for SaaS and content teams. ".repeat(38)}</p>
      <h2>1. Checking Indexability and Canonical Signals</h2>
      <p>Always review <a href="/guides/canonical-tags">our canonical tag checklist</a> and <a href="/tools/site-architecture">internal link architecture guide</a> alongside <a href="/research/ai-search-visibility">our 2026 AI search study</a>.</p>
      <h2>2. Evaluating External Citations</h2>
      <p>Compare your findings with <a href="https://developers.google.com/search/docs">Google Search Central documentation</a> and <a href="https://doitwithai.tools/tools/backlink-verification-tool">DoItWithAI backlink verification tools</a>.</p>
    </article></main></body></html>`,
  },
  {
    url: "https://strict-media-digest.example.org/marketing/link-outreach-trends",
    html: `<!doctype html><html><head>
      <title>Link Outreach Trends in 2026 | Media Digest</title>
      <link rel="canonical" href="https://strict-media-digest.example.org/marketing/link-outreach-trends" />
      <meta name="robots" content="index, follow" />
      <meta property="article:published_time" content="2026-08-04" />
    </head><body><main><article>
      <h1>Link Outreach and Digital PR Trends in 2026</h1>
      <p>Brands investing in SEO and link building are shifting toward original research. ${"Detailed editorial commentary on outreach personalization, journalist requests, and brand mentions across industry publications. ".repeat(32)}</p>
      <h2>Key Takeaways for SEO Teams</h2>
      <p>Read <a href="/marketing/pr-metrics">our PR measurement breakdown</a> and <a href="/marketing/brand-mentions">brand mention study</a>. External references include <a href="https://example-research.org/report" rel="nofollow">this industry survey</a> and <a href="https://doitwithai.tools" rel="nofollow sponsored">DoItWithAI SEO tools</a>.</p>
    </article></main></body></html>`,
  },
  {
    url: "https://cheap-guestposts-hub24.example.xyz/general/business-tips-2026",
    html: `<!doctype html><html><head>
      <title>Top Business & Casino Tips — Write For Us Paid Guest Post</title>
      <link rel="canonical" href="https://cheap-guestposts-hub24.example.xyz/" />
      <meta name="robots" content="noindex, follow" />
    </head><body><main><article>
      <h1>Write For Us: Submit a Guest Post on Business, Crypto & Casino</h1>
      <p>Welcome to our general blog. Contact us to buy cheap backlinks or submit a guest post today! Check out <a href="https://slots1.example.com">online casino bonus</a>, <a href="https://bet2.example.com">sports betting odds</a>, <a href="https://cbd3.example.com">buy cbd gummies</a>, <a href="https://essay4.example.com">essay writing service</a>, and <a href="https://loans5.example.com">fast payday loan</a>.</p>
    </article></main></body></html>`,
  },
];

const control =
  "w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";
const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-[#5271ff] dark:border-slate-600 dark:hover:bg-slate-800";

export default function LinkPlacementQualityCheckerClient() {
  const [mode, setMode] = useState<"live" | "html">("live");
  const [urlsInput, setUrlsInput] = useState("");
  const [nicheKeywordsInput, setNicheKeywordsInput] = useState(
    "technical seo, link building, backlink audit, digital pr, search visibility",
  );
  const [htmlUrl, setHtmlUrl] = useState(
    "https://publisher-prospect.example.com/article",
  );
  const [htmlContent, setHtmlContent] = useState("");

  const [results, setResults] = useState<ProspectVettingResult[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

  const parsedKeywords = useMemo(
    () =>
      nicheKeywordsInput
        .split(/[,;\n]+/)
        .map((k) => k.trim())
        .filter(Boolean),
    [nicheKeywordsInput],
  );

  function loadComparisonDemo() {
    setError("");
    const kw = [
      "technical seo",
      "link building",
      "backlink audit",
      "digital pr",
      "search visibility",
    ];
    setNicheKeywordsInput(kw.join(", "));
    const built = SAMPLE_PROSPECTS.map((item) =>
      analyzePublisherProspectHtml({
        html: item.html,
        url: item.url,
        nicheKeywords: kw,
        method: "sample",
      }),
    );
    setResults(built);
    setExpandedId(built[0]?.id || null);
    setNotes([
      "Loaded 3-prospect comparison demo: (1) Strong Editorial Site, (2) Nofollow-Only Media Site, and (3) High-Risk Guest-Post Farm.",
    ]);
    setRevision((r) => r + 1);
    setFeedback("Loaded 3-prospect side-by-side vetting comparison.");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setFeedback("");
    setNotes([]);

    if (mode === "live" && !urlsInput.trim()) {
      setError(
        "Enter between 1 and 5 candidate publisher URLs (or click 'Load 3-Site Vetting Demo').",
      );
      return;
    }
    if (mode === "html" && !htmlContent.trim()) {
      setError("Paste candidate webpage HTML to run the 10-point vetting audit.");
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setBusy(true);

    try {
      await paintToolFeedback();
      if (mode === "html") {
        const res = analyzePublisherProspectHtml({
          html: htmlContent,
          url: htmlUrl || "https://publisher.example.com/post",
          nicheKeywords: parsedKeywords,
          method: "html",
        });
        setResults([res]);
        setExpandedId(res.id);
        setNotes([
          "Evaluated from supplied HTML. Live HTTP response headers were not fetched.",
        ]);
        setRevision((r) => r + 1);
      } else {
        const urls = Array.from(
          new Set(
            urlsInput
              .split(/\r?\n/)
              .map((u) => u.trim())
              .filter(Boolean),
          ),
        ).slice(0, 5);

        const response = await fetch(
          "/api/ai-tools/link-placement-quality-checker",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              urls,
              nicheKeywords: parsedKeywords,
            }),
          },
        );
        const data = await response.json();
        if (!response.ok) {
          setError(
            data?.error?.message ||
              "Could not vet the supplied URLs. Try Pasted HTML mode.",
          );
          return;
        }
        if (!data.results?.length) {
          setError(
            data.notes?.join(" ") ||
              "None of the supplied URLs returned inspectable HTML.",
          );
          return;
        }
        setResults(data.results);
        setExpandedId(data.results[0]?.id || null);
        setNotes(data.notes || []);
        setRevision((r) => r + 1);
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        setError("Vetting scan interrupted. Check your URLs and try again.");
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
    if (!results.length) return;
    if (format === "csv") {
      triggerDownload(
        new Blob([exportProspectVettingCsv(results)], {
          type: "text/csv;charset=utf-8",
        }),
        "link-prospect-vetting-scorecard.csv",
      );
      setFeedback("Downloaded prospect vetting scorecard CSV.");
    } else {
      const bytes = buildProspectVettingDocx(results);
      triggerDownload(
        new Blob([bytes as unknown as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
        "link-prospect-vetting-audit.docx",
      );
      setFeedback("Downloaded editable Word (.docx) vetting report.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-12 sm:px-6">
      <ToolRunOverlay
        active={busy}
        title="Vetting publisher placement quality"
        description="Inspecting indexability, canonical alignment, outbound link density, follow policies, link-farm footprints, and topical relevance."
        onCancel={() => {
          abortControllerRef.current?.abort();
          setBusy(false);
        }}
      />

      <form onSubmit={handleSubmit} noValidate className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-2xl font-extrabold">
              <ShieldCheck aria-hidden className="text-[#5271ff]" />
              Vet Guest Post Sites & Link Placement Prospects
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Audit up to 5 candidate publisher URLs across 10 observable
              technical and editorial checkpoints before pitching or paying for
              a placement.
            </p>
          </div>
          <button
            type="button"
            onClick={loadComparisonDemo}
            className={secondaryBtn}
          >
            <Sparkles size={16} className="text-[#5271ff]" />
            Load 3-Site Vetting Demo
          </button>
        </div>

        {/* Mode Tabs */}
        <div
          role="tablist"
          aria-label="Prospect inspection mode"
          className="mt-6 grid gap-2 sm:grid-cols-2"
        >
          {[
            {
              id: "live" as const,
              label: "1. Live Publisher URL Batch Scan (Up to 5 URLs)",
              sub: "Fetches live HTML, HTTP headers, canonicals, and outbound links",
              icon: Globe,
            },
            {
              id: "html" as const,
              label: "2. Inspect Pasted Publisher HTML",
              sub: "Vet behind-Cloudflare pages or draft guest post previews",
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

        <div className="mt-6">
          <label
            htmlFor="vetting-niche-keywords"
            className="block text-sm font-bold"
          >
            Your Target Niche / Topic Keywords (comma-separated)
          </label>
          <p className="mb-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
            Used to score topical relevance overlap between the publisher page
            and your subject matter.
          </p>
          <input
            id="vetting-niche-keywords"
            type="text"
            value={nicheKeywordsInput}
            onChange={(e) => setNicheKeywordsInput(e.target.value)}
            placeholder="e.g. technical seo, link building, saas marketing, content strategy"
            className={control}
          />
        </div>

        {mode === "live" ? (
          <div className="mt-6">
            <label
              htmlFor="vetting-live-urls"
              className="block text-sm font-bold"
            >
              Candidate Publisher Article or Resource Page URLs (up to 5, one
              per line)
            </label>
            <p className="mb-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              Tip: Enter a sample article URL from each prospective guest-post
              domain (or the exact niche-edit target URL) so we can measure real
              article word count, author attribution, and outbound link density.
            </p>
            <textarea
              id="vetting-live-urls"
              rows={4}
              value={urlsInput}
              onChange={(e) => setUrlsInput(e.target.value)}
              placeholder={`https://publisher-one.com/blog/seo-strategy-guide\nhttps://publisher-two.org/resources/marketing-tools`}
              className={control}
            />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="vetting-html-url"
                className="block text-sm font-bold"
              >
                Publisher Page URL (for canonical & internal/external domain
                matching)
              </label>
              <input
                id="vetting-html-url"
                type="url"
                value={htmlUrl}
                onChange={(e) => setHtmlUrl(e.target.value)}
                className={`${control} mt-1`}
              />
            </div>
            <div>
              <label
                htmlFor="vetting-html-content"
                className="block text-sm font-bold"
              >
                Paste Candidate Page HTML
              </label>
              <textarea
                id="vetting-html-content"
                rows={7}
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="<!doctype html><html><head><title>Sample Article</title></head><body>...</body></html>"
                className={`${control} mt-1 font-mono text-xs`}
              />
            </div>
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
            Run 10-Point Placement Quality Audit
          </button>
          {results.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setResults([]);
                setNotes([]);
                setFeedback("");
              }}
              className={secondaryBtn}
            >
              <RefreshCw size={15} />
              Clear Results
            </button>
          )}
        </div>
      </form>

      {results.length > 0 && (
        <section
          ref={resultRef}
          tabIndex={-1}
          aria-label="Prospect vetting scorecard results"
          className="mt-10 space-y-8 focus:outline-none"
        >
          {/* Comparison Summary Matrix */}
          <div className={panel}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
                  10-Point Evidence Audit · {results.length} Prospect(s) Evaluated
                </span>
                <h3 className="mt-1 text-2xl font-black">
                  Publisher Vetting Comparison Matrix
                </h3>
                {notes.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {notes.join(" · ")}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload("csv")}
                  className={primaryBtn}
                >
                  <Download size={16} />
                  Download Scorecard (.CSV)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("docx")}
                  className={secondaryBtn}
                >
                  <Download size={16} />
                  Vetting Report (.DOCX)
                </button>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 uppercase text-slate-500 dark:border-slate-700">
                    <th className="py-3 pr-3">Publisher Domain</th>
                    <th className="px-3 py-3">Verdict</th>
                    <th className="px-3 py-3">Checks Passed</th>
                    <th className="px-3 py-3">Indexable & Canonical</th>
                    <th className="px-3 py-3">Ext / Int Links</th>
                    <th className="px-3 py-3">Dofollow %</th>
                    <th className="px-3 py-3">Words</th>
                    <th className="py-3 pl-3">Topical Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {results.map((r) => (
                    <tr key={r.id}>
                      <td className="py-3 pr-3 font-bold">
                        <div>{r.domain}</div>
                        <div
                          className="max-w-[210px] truncate font-normal text-slate-500"
                          title={r.finalUrl}
                        >
                          {r.finalUrl}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 font-bold ${
                            r.verdict === "strong-prospect"
                              ? "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                              : r.verdict === "review-carefully"
                                ? "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
                                : "border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200"
                          }`}
                        >
                          {r.verdictLabel}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-bold">
                        {r.passedChecksCount} / {r.totalChecksCount}
                      </td>
                      <td className="px-3 py-3">
                        {r.isIndexable && r.canonicalMatchesSelf ? (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            Pass
                          </span>
                        ) : (
                          <span className="font-semibold text-rose-600 dark:text-rose-400">
                            {!r.isIndexable ? "Noindex" : "Canonical Mismatch"}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {r.externalLinkCount} ext / {r.internalLinkCount} int
                      </td>
                      <td className="px-3 py-3 font-semibold">
                        {r.dofollowSharePct}%
                      </td>
                      <td className="px-3 py-3">{r.wordCount}</td>
                      <td className="py-3 pl-3 font-semibold">
                        {r.topicalOverlapPct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Individual Expandable 10-Point Evidence Cards */}
          <div className="space-y-5">
            {results.map((r) => {
              const isOpen = expandedId === r.id;
              return (
                <div key={r.id} className={panel}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${
                            r.verdict === "strong-prospect"
                              ? "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                              : r.verdict === "review-carefully"
                                ? "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
                                : "border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200"
                          }`}
                        >
                          {r.verdictLabel} ({r.passedChecksCount}/
                          {r.totalChecksCount} Checks Passed)
                        </span>
                        <span className="text-sm font-extrabold">
                          {r.domain}
                        </span>
                      </div>
                      <h4 className="mt-2 text-lg font-bold">{r.pageTitle}</h4>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        {r.verdictSummary}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isOpen ? null : r.id)}
                      className={secondaryBtn}
                    >
                      {isOpen ? (
                        <>
                          <ChevronUp size={15} />
                          Hide 10-Point Breakdown
                        </>
                      ) : (
                        <>
                          <ChevronDown size={15} />
                          Inspect 10-Point Breakdown
                        </>
                      )}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700">
                      <div className="grid gap-3 md:grid-cols-2">
                        {r.checkpoints.map((cp) => (
                          <div
                            key={cp.id}
                            className={`rounded-xl border p-4 ${
                              cp.status === "pass"
                                ? "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                                : cp.status === "warn"
                                  ? "border-amber-200/80 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/20"
                                  : "border-rose-200/80 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              {cp.status === "pass" ? (
                                <CheckCircle2
                                  size={17}
                                  className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                                />
                              ) : cp.status === "warn" ? (
                                <ShieldAlert
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
                                <p className="text-xs font-bold">{cp.label}</p>
                                <p className="mt-1 font-mono text-xs font-semibold text-slate-900 dark:text-white">
                                  {cp.observed}
                                </p>
                                <p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-400">
                                  {cp.guidance}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {r.sampleExternalAnchors.length > 0 && (
                        <div className="mt-5">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Observed Outbound Links on This Page (Sample)
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {r.sampleExternalAnchors.map((item, i) => (
                              <span
                                key={`${item.href}-${i}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                              >
                                <ExternalLink size={12} className="text-slate-400" />
                                <span className="font-semibold">
                                  {item.anchor}
                                </span>
                                <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] dark:bg-slate-700">
                                  {item.rel}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

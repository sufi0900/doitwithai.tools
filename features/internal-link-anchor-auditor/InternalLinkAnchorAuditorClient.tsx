"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Download,
  FileText,
  GitFork,
  Globe,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import {
  auditInternalLinksFromPages,
  buildInternalLinkAuditDocx,
  exportInternalLinkAuditCsv,
  type InternalLinkAuditReport,
  type InternalLinkIssueType,
} from "./model";

const SAMPLE_INTERNAL_HTML = `<main><article>
  <h1>Complete Guide to On-Page and Off-Page SEO</h1>
  <p>Start by auditing your <a href="https://doitwithai.tools/tools/anchor-text-analyzer">anchor text analyzer</a> ratios and checking our <a href="https://doitwithai.tools/guides/anchor-text-guide">anchor text analyzer</a> tutorial.</p>
  <p>For schema validation, <a href="https://doitwithai.tools/tools/schema-markup-generator">click here</a> or <a href="https://doitwithai.tools/tools/structured-data-validator" rel="nofollow">structured data validator</a>.</p>
  <p>You can also revisit our <a href="https://doitwithai.tools/tools/anchor-text-analyzer">backlink anchor ratio tool</a> and <a href="https://doitwithai.tools/guides/on-page-seo"><img src="/icon.png" alt="" /></a>.</p>
</article></main>`;

const control =
  "w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";
const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-[#5271ff] dark:border-slate-600 dark:hover:bg-slate-800";

export default function InternalLinkAnchorAuditorClient() {
  const [mode, setMode] = useState<"live" | "html">("live");
  const [urlsInput, setUrlsInput] = useState("");
  const [htmlUrl, setHtmlUrl] = useState(
    "https://doitwithai.tools/guides/on-page-seo",
  );
  const [htmlInput, setHtmlInput] = useState("");
  const [includeNavAndFooter, setIncludeNavAndFooter] = useState(false);
  const [issueFilter, setIssueFilter] = useState<
    InternalLinkIssueType | "all"
  >("all");

  const [report, setReport] = useState<InternalLinkAuditReport | null>(null);
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
    setMode("html");
    setHtmlUrl("https://doitwithai.tools/guides/on-page-seo");
    setHtmlInput(SAMPLE_INTERNAL_HTML);
    setError("");
    const built = auditInternalLinksFromPages(
      [
        {
          url: "https://doitwithai.tools/guides/on-page-seo",
          html: SAMPLE_INTERNAL_HTML,
        },
      ],
      includeNavAndFooter,
    );
    setReport(built);
    setRevision((r) => r + 1);
    setFeedback(
      "Loaded sample internal link audit — detected anchor cannibalization, generic CTA, nofollow leak, and duplicate destination.",
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setFeedback("");

    if (mode === "html") {
      if (!htmlInput.trim()) {
        setError(
          "Paste webpage HTML or click 'Load Sample Internal Link Audit'.",
        );
        return;
      }
      setBusy(true);
      try {
        await paintToolFeedback();
        const built = auditInternalLinksFromPages(
          [
            {
              url: htmlUrl.trim() || "https://example.com/page",
              html: htmlInput,
            },
          ],
          includeNavAndFooter,
        );
        setReport(built);
        setRevision((r) => r + 1);
      } finally {
        setBusy(false);
      }
      return;
    }

    const urls = Array.from(
      new Set(
        urlsInput
          .split(/\r?\n/)
          .map((u) => u.trim())
          .filter(Boolean),
      ),
    ).slice(0, 5);

    if (!urls.length) {
      setError("Enter 1 to 5 public URLs on your domain (one per line).");
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setBusy(true);

    try {
      await paintToolFeedback();
      const res = await fetch("/api/ai-tools/internal-link-anchor-auditor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ urls, includeNavAndFooter }),
      });
      const data = await res.json();
      if (!res.ok || !data.report) {
        setError(
          data?.error?.message ||
            "Could not scan the supplied URLs. Use Pasted HTML mode instead.",
        );
        return;
      }
      setReport(data.report);
      setRevision((r) => r + 1);
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        setError("Scan interrupted. Try Pasted HTML mode.");
      }
    } finally {
      setBusy(false);
    }
  }

  const filteredRows = useMemo(() => {
    if (!report) return [];
    if (issueFilter === "all") return report.rows;
    return report.rows.filter((r) => r.issues.includes(issueFilter));
  }, [report, issueFilter]);

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
        new Blob([exportInternalLinkAuditCsv(report)], {
          type: "text/csv;charset=utf-8",
        }),
        "internal-link-anchor-audit.csv",
      );
      setFeedback("Downloaded internal link audit CSV.");
    } else {
      const bytes = buildInternalLinkAuditDocx(report);
      triggerDownload(
        new Blob([bytes as unknown as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
        "internal-link-remediation-report.docx",
      );
      setFeedback("Downloaded editable Word (.docx) internal link report.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <ToolRunOverlay
        active={busy}
        title="Auditing internal link anchors & cannibalization"
        description="Checking internal anchor text conflicts, generic CTAs, internal nofollow leaks, empty image anchors, and first-link priority duplicates."
        onCancel={() => {
          abortControllerRef.current?.abort();
          setBusy(false);
        }}
      />

      <form onSubmit={handleSubmit} noValidate className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-2xl font-extrabold">
              <GitFork aria-hidden className="text-[#5271ff]" />
              Audit Internal Link Anchors & Cannibalization
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Catch internal anchor text cannibalization (same keyword anchor
              pointing to different URLs), weak generic CTAs, and accidental{" "}
              <code>nofollow</code> leaks.
            </p>
          </div>
          <button type="button" onClick={loadSample} className={secondaryBtn}>
            <Sparkles size={16} className="text-[#5271ff]" />
            Load Sample Internal Link Audit
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Internal link audit mode"
          className="mt-6 grid gap-2 sm:grid-cols-2"
        >
          {[
            {
              id: "live" as const,
              label: "1. Scan Up to 5 Live URLs on Your Domain",
              sub: "Cross-checks anchors across multiple pages",
              icon: Globe,
            },
            {
              id: "html" as const,
              label: "2. Inspect Pasted Page HTML",
              sub: "Instant offline internal link & anchor check",
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

        {mode === "live" ? (
          <div className="mt-6">
            <label htmlFor="int-live-urls" className="block text-sm font-bold">
              Public URLs on Your Domain (up to 5 URLs, one per line)
            </label>
            <textarea
              id="int-live-urls"
              rows={4}
              value={urlsInput}
              onChange={(e) => setUrlsInput(e.target.value)}
              placeholder={`https://your-site.com/blog/guide-1\nhttps://your-site.com/blog/guide-2`}
              className={`${control} mt-1`}
            />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="int-html-url" className="block text-sm font-bold">
                Page URL (for resolving relative internal links)
              </label>
              <input
                id="int-html-url"
                type="url"
                value={htmlUrl}
                onChange={(e) => setHtmlUrl(e.target.value)}
                className={`${control} mt-1`}
              />
            </div>
            <div>
              <label
                htmlFor="int-html-input"
                className="block text-sm font-bold"
              >
                Paste Page HTML
              </label>
              <textarea
                id="int-html-input"
                rows={7}
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                placeholder={SAMPLE_INTERNAL_HTML}
                className={`${control} mt-1 font-mono text-xs`}
              />
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2.5">
          <input
            id="int-include-nav"
            type="checkbox"
            checked={includeNavAndFooter}
            onChange={(e) => setIncludeNavAndFooter(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#3452d1]"
          />
          <label
            htmlFor="int-include-nav"
            className="text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            Include global <code>&lt;nav&gt;</code>, <code>&lt;header&gt;</code>,
            and <code>&lt;footer&gt;</code> links (unchecked focuses on
            editorial body links)
          </label>
        </div>

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
            <GitFork size={18} />
            Run Internal Link Anchor Audit
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
          aria-label="Internal link audit results"
          className="mt-10 space-y-8 focus:outline-none"
        >
          <div className={panel}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
                  Internal Link Architecture · {report.domain}
                </span>
                <h3 className="mt-1 text-2xl font-black">
                  Internal Anchor & Cannibalization Report
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload("csv")}
                  className={primaryBtn}
                >
                  <Download size={16} />
                  Download Audit (.CSV)
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
                  Link Health Score
                </p>
                <p className="mt-2 text-3xl font-black text-[#3452d1] dark:text-[#9aabff]">
                  {report.healthScore}/100
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {report.totalInternalLinks} links checked
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
                <p className="text-xs font-bold uppercase text-rose-700 dark:text-rose-300">
                  Cannibalized Anchors
                </p>
                <p className="mt-2 text-3xl font-black text-rose-600 dark:text-rose-400">
                  {report.cannibalizedGroups.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Same anchor → 2+ URLs
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                <p className="text-xs font-bold uppercase text-amber-700 dark:text-amber-300">
                  Generic / Empty
                </p>
                <p className="mt-2 text-3xl font-black text-amber-600 dark:text-amber-400">
                  {report.genericAnchorCount + report.emptyAnchorCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Weak topical context
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Nofollow Leaks
                </p>
                <p className="mt-2 text-3xl font-black">
                  {report.nofollowLeakCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Blocked internal equity
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Duplicate Targets
                </p>
                <p className="mt-2 text-3xl font-black">
                  {report.duplicateFirstLinkCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  First-link priority rule
                </p>
              </div>
            </div>

            {report.cannibalizedGroups.length > 0 && (
              <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900/50 dark:bg-rose-950/25">
                <h4 className="text-sm font-extrabold text-rose-800 dark:text-rose-200">
                  Internal Anchor Text Cannibalization Detected (
                  {report.cannibalizedGroups.length})
                </h4>
                <div className="mt-2 space-y-2 text-xs">
                  {report.cannibalizedGroups.map((g) => (
                    <div key={g.anchor}>
                      <span className="font-mono font-bold">
                        &ldquo;{g.anchor}&rdquo;
                      </span>{" "}
                      points to competing internal paths:{" "}
                      <code>{g.conflictingTargetPaths.join(" , ")}</code> —{" "}
                      {g.fixGuidance}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {(
                [
                  ["all", "All Internal Links"],
                  ["anchor-cannibalization", "Cannibalized"],
                  ["generic-anchor", "Generic CTAs"],
                  ["empty-anchor", "Empty / Missing Alt"],
                  ["internal-nofollow-leak", "Nofollow Leaks"],
                  ["duplicate-destination", "Duplicate Target"],
                  ["healthy", "Healthy"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setIssueFilter(val)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                    issueFilter === val
                      ? "border-[#3452d1] bg-[#3452d1] text-white"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 uppercase text-slate-500 dark:border-slate-700">
                    <th className="py-3 pr-3">Anchor Text</th>
                    <th className="px-3 py-3">Target Path</th>
                    <th className="px-3 py-3">Rel</th>
                    <th className="py-3 pl-3">Diagnostic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredRows.map((r) => (
                    <tr key={r.id}>
                      <td className="py-3 pr-3 font-mono font-bold">
                        {r.anchorText}
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-600 dark:text-slate-300">
                        {r.targetPath}
                      </td>
                      <td className="px-3 py-3 uppercase font-semibold">
                        {r.rel}
                      </td>
                      <td className="py-3 pl-3 text-slate-600 dark:text-slate-300">
                        {r.issueNote}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { agencyRequest } from "./agency-request";
import type { KnowledgeRow } from "./KnowledgeReview";
import { classifyPageKind } from "@/lib/ai-employee-agency/site-knowledge";
import { CircularScoreGauge } from "./CircularScoreGauge";

type Fields = { heading: string; title: string; description: string };
type ImageAudit = {
  src: string;
  alt: string;
  missingAlt: boolean;
  sizeKb: number | null;
  isWebpOrAvif: boolean;
  isOversized: boolean;
};
type CriteriaCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
  weight: number;
};
type PageDiagnostics = {
  score: number;
  wordCount: number;
  h2Count: number;
  h3Count: number;
  h2List: string[];
  internalLinkCount: number;
  externalLinkCount: number;
  hasCanonical: boolean;
  hasSchemaJsonLd: boolean;
  schemaTypes: string[];
  criteriaChecks: CriteriaCheck[];
};
type Snapshot = {
  fields: Fields;
  metaHealth?: "ok" | "needs_fix";
  images?: ImageAudit[];
  publication?: string;
  findings: string[];
  diagnostics?: PageDiagnostics | null;
};
type DeepOptimization = {
  heading: string;
  title: string;
  description: string;
  keywordGaps: string[];
  competitorAngle: string;
  internalLinkSuggestions: Array<{
    anchorText: string;
    targetUrl: string;
    reason: string;
  }>;
  contentSectionDiffs: Array<{
    sectionHeading: string;
    action: "add" | "expand" | "tighten";
    recommendation: string;
  }>;
  altSuggestions: Array<{ src: string; suggestedAlt: string }>;
  schemaJsonLd: string;
};
type MediaIssue = {
  pageUrl: string;
  imageUrl: string;
  alt: string;
  missingAlt: boolean;
  sizeKb: number | null;
  isOversized: boolean;
  isWebpOrAvif: boolean;
  targetGuidance: string;
};
type Scan = {
  cycle: string;
  report: {
    files?: { url: string; status: number | null }[];
    added: string[];
    removed: string[];
    coverage: string;
    checks: {
      url: string;
      status?: number | null;
      metaHealth?: "ok" | "needs_fix";
      findings: string[];
      images?: ImageAudit[];
    }[];
    mediaIssues?: MediaIssue[];
    summary?: {
      totalChecked: number;
      metaOk: number;
      metaNeedsFix: number;
      missingAltCount: number;
      oversizedImageCount: number;
    };
  };
};

const labels: Record<keyof Fields, string> = {
  heading: "Page heading (H1)",
  title: "SEO title",
  description: "Meta description",
};
const maxLengths: Record<keyof Fields, number> = {
  heading: 120,
  title: 70,
  description: 170,
};
const keys = Object.keys(labels) as (keyof Fields)[];
const endpoint = "/api/ai-employee-agency/refresh";

type PageCategoryFilter = "all" | "blog" | "service" | "product" | "landing";

function computeSiteHealthScore(scan: Scan | undefined): number {
  if (!scan) return 0;
  const files = scan.report.files || [];
  const crawlOk = files.filter((f) => f.status === 200).length;
  const crawlPts = files.length > 0 ? Math.round((crawlOk / files.length) * 30) : 15;

  const total = scan.report.summary?.totalChecked || scan.report.checks.length || 1;
  const metaOk = scan.report.summary?.metaOk ?? scan.report.checks.filter((c) => c.metaHealth === "ok").length;
  const metaPts = Math.round((metaOk / total) * 40);

  const mediaIssues = scan.report.mediaIssues?.length ?? 0;
  const mediaPts = Math.max(0, 30 - mediaIssues * 3);

  return Math.max(0, Math.min(100, crawlPts + metaPts + mediaPts));
}

export function RefreshWorkbench({
  website,
  audit,
}: {
  website: KnowledgeRow;
  audit: boolean;
}) {
  const pages = website.profile.pages || [];
  const [url, setUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [snapshot, setSnapshot] = useState<Snapshot>();
  const [draft, setDraft] = useState<Fields>();
  const [deepResult, setDeepResult] = useState<DeepOptimization | null>(null);
  const [lastTokenInfo, setLastTokenInfo] = useState<string>("");
  const [scan, setScan] = useState<Scan>();
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [version, refresh] = useState(0);
  const [auditTab, setAuditTab] = useState<"crawl" | "meta" | "media">("crawl");
  const [categoryFilter, setCategoryFilter] = useState<PageCategoryFilter>("all");

  // Load latest site scan when viewing Technical Site Audit or on initial mount
  useEffect(() => {
    const controller = new AbortController();
    agencyRequest(endpoint, { signal: controller.signal })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || controller.signal.aborted) return;
        setScan(data.scan);
      })
      .catch(() => {
        // Non-fatal
      });
    return () => controller.abort();
  }, [version]);

  // Zero-LLM Live Page Diagnostic when a user selects a URL in On-Page & Refresh
  useEffect(() => {
    if (!url || audit) return;
    const controller = new AbortController();
    setSnapshot(undefined);
    setDraft(undefined);
    setDeepResult(null);
    setLastTokenInfo("");
    setNotice("Running $0.00 live page diagnostic (H1, Meta, H2/H3, Links, Schema, Images)…");

    agencyRequest(`${endpoint}?url=${encodeURIComponent(url)}`, {
      signal: controller.signal,
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw Error(data.error || "Unable to inspect page.");
        if (controller.signal.aborted) return;
        setSnapshot(data);
        setNotice("");
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setNotice(err instanceof Error ? err.message : "Unable to inspect this page.");
        }
      });
    return () => controller.abort();
  }, [url, audit, version]);

  const categorizedPages = useMemo(() => {
    return pages.map((p) => {
      const kind = classifyPageKind(p.url);
      const scanMatch = scan?.report.checks.find((c) => c.url === p.url);
      return {
        ...p,
        kind,
        metaHealth: scanMatch?.metaHealth,
      };
    });
  }, [pages, scan]);

  const filteredPages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return categorizedPages.filter((p) => {
      const catMatch =
        categoryFilter === "all"
          ? true
          : categoryFilter === "landing"
            ? p.kind === "landing" || p.kind === "other"
            : p.kind === categoryFilter;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        p.url.toLowerCase().includes(q) ||
        (p.title || "").toLowerCase().includes(q)
      );
    });
  }, [categorizedPages, categoryFilter, searchQuery]);

  async function runLiveTechnicalScan() {
    if (scanning) return;
    setScanning(true);
    setNotice("Running Zero-LLM Technical, Meta & Media audit ($0.00)…");
    try {
      const res = await agencyRequest(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scan-now" }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        scan?: Scan;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Technical site scan failed.");
      }
      if (data.scan) setScan(data.scan);
      setNotice("Live $0.00 Technical Site Scan completed and saved.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Technical site scan failed.");
    } finally {
      setScanning(false);
    }
  }

  async function runMultiAgentDeepOptimize() {
    if (!url || !snapshot || optimizing) return;
    setOptimizing(true);
    setNotice(
      "Running Multi-Agent Deep Optimization (Keyword Gaps, Competitor Angle, Internal Links, Schema & Content Diffs)…",
    );
    try {
      const res = await agencyRequest("/api/ai-employee-agency/optimize-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          pageKind: classifyPageKind(url),
          currentFields: snapshot.fields,
          diagnostics: snapshot.diagnostics || null,
          images: snapshot.images || [],
          findings: snapshot.findings || [],
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        optimized?: DeepOptimization;
        tokenUsage?: { modelId?: string; totalTokens?: number; shadowPaidCostUsd?: number };
      };
      if (!res.ok || !data.ok || !data.optimized) {
        throw new Error(data.error || "Multi-agent page optimization failed.");
      }
      setDeepResult(data.optimized);
      setDraft({
        heading: data.optimized.heading,
        title: data.optimized.title,
        description: data.optimized.description,
      });
      if (data.tokenUsage) {
        setLastTokenInfo(
          `${(data.tokenUsage.totalTokens || 0).toLocaleString()} tokens · $${(data.tokenUsage.shadowPaidCostUsd || 0).toFixed(4)} · ${data.tokenUsage.modelId || ""}`,
        );
      }
      setNotice("Multi-agent optimization blueprint generated cleanly.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Multi-agent page optimization failed.");
    } finally {
      setOptimizing(false);
    }
  }

  async function applyInternalUpdate() {
    if (!snapshot || !draft) return;
    setBusy(true);
    setNotice("");
    try {
      const res = await agencyRequest(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publication: snapshot.publication,
          url,
          before: snapshot.fields,
          after: draft,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw Error(data.error || "Unable to apply page update.");
      setNotice("Live builder page updated.");
      refresh((v) => v + 1);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Unable to apply page update.");
    } finally {
      setBusy(false);
    }
  }

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  // =========================================================================
  // VIEW 1: DEDICATED TECHNICAL SITE AUDIT (CIRCULAR SCORE RING + 3 TABS)
  // =========================================================================
  if (audit) {
    const siteScore = computeSiteHealthScore(scan);
    return (
      <section className="space-y-5 rounded-xl border border-slate-800 bg-[#111827] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-5">
            <CircularScoreGauge
              score={siteScore}
              label="Technical Site Health"
              sublabel={
                scan
                  ? `Cycle ${scan.cycle} · ${scan.report.coverage} inventory`
                  : "Run a $0.00 live scan to score"
              }
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={scanning}
              onClick={() => void runLiveTechnicalScan()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {scanning && <span className="h-2 w-2 rounded-full bg-white animate-ping" />}
              <span>
                {scanning ? "Scanning Live Site…" : "Run Live Technical Site Scan ($0.00)"}
              </span>
            </button>
          </div>
        </div>

        {notice && (
          <p role="status" className="rounded-lg border border-blue-500/30 bg-blue-950/30 px-3.5 py-2 text-xs text-blue-200">
            {notice}
          </p>
        )}

        {scan ? (
          <div className="space-y-4">
            {/* 4 Clean Executive Metric Tiles */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3.5">
                <span className="text-[11px] text-slate-400">Indexed Pages</span>
                <strong className="mt-1 block font-mono text-lg text-white">{pages.length}</strong>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3.5">
                <span className="text-[11px] text-slate-400">Meta Health</span>
                <strong className="mt-1 block font-mono text-lg text-emerald-300">
                  {scan.report.summary?.metaOk ?? 0} OK{" "}
                  <span className="text-xs text-amber-300">
                    / {scan.report.summary?.metaNeedsFix ?? 0} Fix
                  </span>
                </strong>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3.5">
                <span className="text-[11px] text-slate-400">Missing Image Alt</span>
                <strong className="mt-1 block font-mono text-lg text-amber-300">
                  {scan.report.summary?.missingAltCount ?? 0}
                </strong>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3.5">
                <span className="text-[11px] text-slate-400">Oversized (&gt;200 KB)</span>
                <strong className="mt-1 block font-mono text-lg text-rose-300">
                  {scan.report.summary?.oversizedImageCount ?? 0}
                </strong>
              </div>
            </div>

            {/* Sub-View Switcher */}
            <div className="inline-flex rounded-lg border border-slate-800 bg-[#0B0F17] p-1 text-xs">
              {(
                [
                  { id: "crawl", label: "Crawl & Index" },
                  {
                    id: "meta",
                    label: `Meta Health (${scan.report.summary?.metaNeedsFix ?? scan.report.checks.length} Fix)`,
                  },
                  {
                    id: "media",
                    label: `Media & Alt-Text (${scan.report.mediaIssues?.length ?? 0})`,
                  },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAuditTab(t.id)}
                  className={`rounded-md px-3 py-1.5 font-semibold transition ${
                    auditTab === t.id
                      ? "bg-[#2563EB] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {auditTab === "crawl" && (
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {(scan.report.files || []).map((f) => {
                  const ok = f.status === 200;
                  return (
                    <div
                      key={f.url}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-[#0B0F17] p-3"
                    >
                      <span className="truncate font-mono text-xs text-slate-300">
                        {f.url.replace(/^https?:\/\/[^/]+/, "") || "/"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                          ok
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {f.status === null ? "Unavailable" : `HTTP ${f.status}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {auditTab === "meta" && (
              <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-[#0B0F17]">
                {scan.report.checks.map((c) => {
                  const isOk = c.metaHealth === "ok";
                  return (
                    <div key={c.url} className="space-y-1 p-3.5 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isOk
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-amber-500/15 text-amber-300"
                          }`}
                        >
                          {isOk ? "OK — Keep As Is" : "Needs Fix"}
                        </span>
                        <strong className="truncate font-mono text-slate-200">{c.url}</strong>
                      </div>
                      <p className="text-slate-400">
                        {c.findings.join(" · ") || "All checked on-page fields passed."}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {auditTab === "media" && (
              <div className="space-y-2">
                {!scan.report.mediaIssues || scan.report.mediaIssues.length === 0 ? (
                  <p className="rounded-lg border border-slate-800 bg-[#0B0F17] p-4 text-xs text-slate-400">
                    No missing alt-text or oversized (&gt;200 KB) images detected across scanned pages.
                  </p>
                ) : (
                  scan.report.mediaIssues.slice(0, 20).map((m, idx) => (
                    <div
                      key={`${m.imageUrl}-${idx}`}
                      className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="truncate font-mono text-slate-200">{m.imageUrl}</span>
                        <div className="flex shrink-0 items-center gap-1.5 font-mono text-[10px]">
                          {m.sizeKb !== null && (
                            <span
                              className={`rounded px-2 py-0.5 ${
                                m.isOversized
                                  ? "bg-rose-500/15 text-rose-300"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {m.sizeKb} KB
                            </span>
                          )}
                          {m.missingAlt && (
                            <span className="rounded bg-amber-500/15 px-2 py-0.5 text-amber-300">
                              Missing Alt
                            </span>
                          )}
                          {!m.isWebpOrAvif && (
                            <span className="rounded bg-blue-500/15 px-2 py-0.5 text-blue-300">
                              Non-WebP
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Page: {m.pageUrl} · {m.targetGuidance}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="rounded-lg border border-slate-800 bg-[#0B0F17] p-4 text-sm text-slate-400">
            No technical scan recorded yet. Click{" "}
            <strong className="text-slate-200">Run Live Technical Site Scan ($0.00)</strong> above to
            score crawl files, meta hygiene, and media weight without spending any LLM tokens.
          </p>
        )}
      </section>
    );
  }

  // =========================================================================
  // VIEW 2: DEDICATED EXISTING ARTICLES & PAGES OPTIMIZATION STUDIO
  // =========================================================================
  return (
    <section className="space-y-5 rounded-xl border border-slate-800 bg-[#111827] p-5">
      <div className="border-b border-slate-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-400">
          Existing Articles &amp; Pages Studio · Opt-In Multi-Agent Optimization
        </p>
        <h2 className="mt-0.5 text-base font-semibold text-white">
          Inspect any live page at $0.00, then trigger deep multi-agent optimization only on pages you choose
        </h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left Pane: Categorized Existing URL Inventory */}
        <aside className="space-y-3 lg:col-span-4">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${pages.length} discovered pages…`}
            className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />

          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {(
              [
                { id: "all", label: "All" },
                { id: "blog", label: "Blogs" },
                { id: "service", label: "Services" },
                { id: "product", label: "Tools/Prod" },
                { id: "landing", label: "Landing" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`rounded-md border px-2.5 py-1 font-medium transition ${
                  categoryFilter === tab.id
                    ? "border-[#2563EB] bg-blue-500/15 text-blue-200"
                    : "border-slate-800 bg-[#0B0F17] text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
            {filteredPages.length === 0 ? (
              <p className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3 text-xs text-slate-400">
                No URLs match this filter.
              </p>
            ) : (
              filteredPages.map((p) => {
                const active = url === p.url;
                return (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => setUrl(p.url)}
                    className={`block w-full rounded-lg border p-2.5 text-left text-xs transition ${
                      active
                        ? "border-[#2563EB] bg-blue-500/15 text-white"
                        : "border-slate-800 bg-[#0B0F17] text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">
                        {p.title || p.url.replace(/^https?:\/\/[^/]+/, "") || "/"}
                      </span>
                      <span className="shrink-0 rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-[9px] uppercase text-slate-400">
                        {p.kind}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500">
                      {p.url}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Pane: Zero-LLM Diagnostic Scorecard + Opt-In Deep Optimization */}
        <div className="min-w-0 space-y-4 lg:col-span-8">
          {!url ? (
            <div className="rounded-xl border border-slate-800 bg-[#0B0F17] p-8 text-center text-xs text-slate-400">
              Select any blog, service, tool, or landing page on the left to run a{" "}
              <strong className="text-slate-200">$0.00 diagnostic scorecard</strong>. No AI tokens
              are spent until you explicitly click <strong className="text-white">Run Multi-Agent Deep Optimization</strong>.
            </div>
          ) : snapshot ? (
            <div className="space-y-4">
              {/* Diagnostic Header with Circular Score Ring + Opt-In Button */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
                <CircularScoreGauge
                  score={snapshot.diagnostics?.score ?? (snapshot.metaHealth === "ok" ? 85 : 50)}
                  label="Live Page SEO Score"
                  sublabel={
                    snapshot.diagnostics
                      ? `${snapshot.diagnostics.wordCount.toLocaleString()} words · ${snapshot.diagnostics.h2Count} H2s · ${snapshot.diagnostics.internalLinkCount} internal links`
                      : url
                  }
                />
                <div className="space-y-1.5 text-right">
                  <button
                    type="button"
                    disabled={optimizing || busy}
                    onClick={() => void runMultiAgentDeepOptimize()}
                    className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                  >
                    {optimizing
                      ? "Running Multi-Agent Audit…"
                      : deepResult
                        ? "Re-Run Multi-Agent Optimization"
                        : "Run Multi-Agent Deep Optimization →"}
                  </button>
                  <p className="font-mono text-[10px] text-slate-400">
                    {lastTokenInfo || "Zero LLM tokens spent on diagnostic view"}
                  </p>
                </div>
              </div>

              {/* Transparent Rule-by-Rule Diagnostic Checklist */}
              {snapshot.diagnostics?.criteriaChecks && (
                <div className="rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Objective Diagnostic Criteria (100-Pt Rubric)
                  </h3>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {snapshot.diagnostics.criteriaChecks.map((check) => (
                      <div
                        key={check.id}
                        className="flex items-start justify-between gap-2 rounded-lg border border-slate-800/80 bg-[#111827] px-3 py-2 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-slate-200">{check.label}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">{check.detail}</p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                            check.passed
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-amber-500/15 text-amber-300"
                          }`}
                        >
                          {check.passed ? `+${check.weight}` : "Fix"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Live Page Readout (Always visible at $0.00) */}
              <div className="space-y-2.5 rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-200">Current live page</h3>
                  <span className="truncate font-mono text-[11px] text-slate-500">{url}</span>
                </div>
                {keys.map((k) => (
                  <div key={k} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{labels[k]}</span>
                      <span className="font-mono text-[11px]">{snapshot.fields[k].length} chars</span>
                    </div>
                    <p className="break-words rounded-lg border border-slate-800/80 bg-[#111827] p-2.5 text-xs text-slate-200">
                      {snapshot.fields[k] || "Empty"}
                    </p>
                  </div>
                ))}
              </div>

              {/* OPT-IN MULTI-AGENT OPTIMIZATION BLUEPRINT (Only shown after user clicks Optimize) */}
              {deepResult && draft && (
                <div className="space-y-4 border-t border-slate-800 pt-4">
                  <div className="space-y-3 rounded-xl border border-blue-500/30 bg-[#0B0F17] p-4">
                    <h3 className="text-sm font-semibold text-white">
                      AI-Optimized H1, Title &amp; Meta Description
                    </h3>
                    {keys.map((k) => (
                      <label className="block space-y-1" key={k}>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>{labels[k]}</span>
                          <span className="font-mono text-[11px]">
                            {draft[k].length}/{maxLengths[k]}
                          </span>
                        </div>
                        <textarea
                          rows={k === "description" ? 3 : 2}
                          value={draft[k]}
                          disabled={busy || optimizing}
                          maxLength={maxLengths[k]}
                          className="block w-full rounded-lg border border-slate-700 bg-[#111827] p-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                          onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                        />
                      </label>
                    ))}
                  </div>

                  {(deepResult.keywordGaps.length > 0 || deepResult.competitorAngle) && (
                    <div className="space-y-2.5 rounded-xl border border-slate-800 bg-[#0B0F17] p-4 text-xs">
                      <h4 className="font-semibold text-white">Keyword Gaps &amp; Competitor Angle</h4>
                      {deepResult.competitorAngle && (
                        <p className="text-slate-300">{deepResult.competitorAngle}</p>
                      )}
                      {deepResult.keywordGaps.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {deepResult.keywordGaps.map((kw, i) => (
                            <span
                              key={i}
                              className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 font-mono text-[11px] text-blue-200"
                            >
                              + {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {deepResult.contentSectionDiffs.length > 0 && (
                    <div className="space-y-2 rounded-xl border border-slate-800 bg-[#0B0F17] p-4 text-xs">
                      <h4 className="font-semibold text-white">
                        Article &amp; Section Content Upgrades ({deepResult.contentSectionDiffs.length})
                      </h4>
                      <div className="divide-y divide-slate-800">
                        {deepResult.contentSectionDiffs.map((diff, idx) => (
                          <div key={idx} className="py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-blue-500/15 px-1.5 py-0.5 font-mono text-[10px] uppercase text-blue-300">
                                {diff.action}
                              </span>
                              <strong className="text-slate-100">{diff.sectionHeading}</strong>
                            </div>
                            <p className="mt-1 text-slate-300">{diff.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {deepResult.internalLinkSuggestions.length > 0 && (
                    <div className="space-y-2 rounded-xl border border-slate-800 bg-[#0B0F17] p-4 text-xs">
                      <h4 className="font-semibold text-white">
                        Verified Internal Linking Opportunities ({deepResult.internalLinkSuggestions.length})
                      </h4>
                      <div className="divide-y divide-slate-800">
                        {deepResult.internalLinkSuggestions.map((link, idx) => (
                          <div key={idx} className="py-2">
                            <p className="font-medium text-emerald-300">
                              Anchor: &ldquo;{link.anchorText}&rdquo;
                            </p>
                            <p className="truncate font-mono text-[11px] text-slate-400">
                              → {link.targetUrl}
                            </p>
                            {link.reason && <p className="mt-0.5 text-slate-300">{link.reason}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {deepResult.altSuggestions.length > 0 && (
                    <div className="space-y-2 rounded-xl border border-slate-800 bg-[#0B0F17] p-4 text-xs">
                      <h4 className="font-semibold text-white">
                        Image Alt-Text Suggestions ({deepResult.altSuggestions.length})
                      </h4>
                      <div className="divide-y divide-slate-800">
                        {deepResult.altSuggestions.map((a, idx) => (
                          <div key={idx} className="py-2">
                            <p className="truncate font-mono text-[11px] text-slate-400">{a.src}</p>
                            <p className="mt-0.5 text-emerald-300">alt=&quot;{a.suggestedAlt}&quot;</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {deepResult.schemaJsonLd && (
                    <details open className="rounded-xl border border-slate-800 bg-[#0B0F17] p-4 text-xs">
                      <summary className="cursor-pointer font-semibold text-white">
                        Recommended JSON-LD Schema Patch
                      </summary>
                      <pre className="mt-2.5 max-h-56 overflow-y-auto whitespace-pre-wrap break-words border-t border-slate-800 pt-2.5 font-mono text-[11px] text-slate-300">
                        {deepResult.schemaJsonLd}
                      </pre>
                    </details>
                  )}

                  {snapshot.publication ? (
                    <button
                      type="button"
                      className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                      disabled={
                        busy ||
                        keys.every((k) => snapshot.fields[k] === draft[k]) ||
                        keys.some((k) => !draft[k].trim())
                      }
                      onClick={() => void applyInternalUpdate()}
                    >
                      {busy ? "Applying Update…" : "Approve & Update Live Page"}
                    </button>
                  ) : (
                    <label className="block space-y-1.5 text-xs font-medium text-slate-300">
                      <span>Copy-ready HTML patch for external CMS</span>
                      <textarea
                        readOnly
                        rows={4}
                        className="block w-full rounded-lg border border-slate-700 bg-[#0B0F17] p-3 font-mono text-xs text-slate-200"
                        onFocus={(e) => e.target.select()}
                        value={
                          "<title>" +
                          escapeHtml(draft.title) +
                          '</title>\n<meta name="description" content="' +
                          escapeHtml(draft.description) +
                          '">\n<h1>' +
                          escapeHtml(draft.heading) +
                          "</h1>"
                        }
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {notice && (
        <p className="text-xs text-slate-300" role="status">
          {notice}
        </p>
      )}
    </section>
  );
}

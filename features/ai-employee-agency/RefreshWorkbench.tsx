"use client";

import { useEffect, useMemo, useState } from "react";
import { agencyRequest } from "./agency-request";
import type { KnowledgeRow } from "./KnowledgeReview";
import { classifyPageKind } from "@/lib/ai-employee-agency/site-knowledge";

type Fields = { heading: string; title: string; description: string };
type ImageAudit = {
  src: string;
  alt: string;
  missingAlt: boolean;
  sizeKb: number | null;
  isWebpOrAvif: boolean;
  isOversized: boolean;
};
type Snapshot = {
  fields: Fields;
  metaHealth?: "ok" | "needs_fix";
  images?: ImageAudit[];
  suggested?: Fields;
  publication?: string;
  findings: string[];
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

export function RefreshWorkbench({
  website,
  audit,
}: {
  website: KnowledgeRow;
  audit: boolean;
}) {
  const pages = website.profile.pages || [];
  const [url, setUrl] = useState("");
  const [snapshot, setSnapshot] = useState<Snapshot>();
  const [draft, setDraft] = useState<Fields>();
  const [scan, setScan] = useState<Scan>();
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [version, refresh] = useState(0);
  const [auditTab, setAuditTab] = useState<"crawl" | "meta" | "media">("crawl");
  const [categoryFilter, setCategoryFilter] = useState<PageCategoryFilter>("all");
  const [altSuggestions, setAltSuggestions] = useState<
    Array<{ src: string; suggestedAlt: string }>
  >([]);
  const [schemaPatch, setSchemaPatch] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setSnapshot(undefined);
    setDraft(undefined);
    setAltSuggestions([]);
    setSchemaPatch("");
    setNotice(url ? "Reading live page metadata & media…" : "");
    if (!url) setScan(undefined);

    agencyRequest(endpoint + (url ? "?url=" + encodeURIComponent(url) : ""), {
      signal: controller.signal,
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw Error(data.error);
        if (controller.signal.aborted) return;
        if (url) {
          setSnapshot(data);
          setDraft(data.suggested || data.fields);
        } else {
          setScan(data.scan);
        }
        setNotice("");
      })
      .catch((err) => {
        if (!controller.signal.aborted) setNotice(err.message);
      });
    return () => controller.abort();
  }, [url, version]);

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
    if (categoryFilter === "all") return categorizedPages;
    return categorizedPages.filter((p) =>
      categoryFilter === "landing"
        ? p.kind === "landing" || p.kind === "other"
        : p.kind === categoryFilter,
    );
  }, [categorizedPages, categoryFilter]);

  async function runLiveTechnicalScan() {
    if (scanning) return;
    setScanning(true);
    setNotice("Running Stage 1 Zero-LLM Technical, Meta & Media audit…");
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

  async function runAiOptimizePage() {
    if (!url || !snapshot || optimizing) return;
    setOptimizing(true);
    setNotice("Running AI Page Optimizer (Meta diff, Alt-Text & Schema patch)…");
    try {
      const res = await agencyRequest(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ai-optimize",
          url,
          pageKind: classifyPageKind(url),
          currentFields: snapshot.fields,
          images: snapshot.images || [],
          findings: snapshot.findings || [],
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        optimized?: {
          heading: string;
          title: string;
          description: string;
          altSuggestions: Array<{ src: string; suggestedAlt: string }>;
          schemaAndContentPatch: string;
        };
      };
      if (!res.ok || !data.ok || !data.optimized) {
        throw new Error(data.error || "AI page optimization failed.");
      }
      setDraft({
        heading: data.optimized.heading,
        title: data.optimized.title,
        description: data.optimized.description,
      });
      setAltSuggestions(data.optimized.altSuggestions || []);
      setSchemaPatch(data.optimized.schemaAndContentPatch || "");
      setNotice("Generated AI optimization diff, alt-text suggestions, and schema patch.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "AI page optimization failed.");
    } finally {
      setOptimizing(false);
    }
  }

  async function apply() {
    if (!snapshot || !draft) return;
    setBusy(true);
    try {
      const r = await agencyRequest(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          publication: snapshot.publication,
          before: snapshot.fields,
          after: draft,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error);
      refresh((v) => v + 1);
      setNotice("Page metadata updated and revalidated.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }

  const escape = (s: string) =>
    s.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c]!,
    );

  return (
    <section className="space-y-5 rounded-xl border border-slate-800 bg-[#111827] p-5">
      {/* ====================================================================
          UNIFIED TECHNICAL SITE AUDIT (ZERO-LLM SCAN + 3 FILTERABLE SUB-VIEWS)
         ==================================================================== */}
      {audit && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="min-w-0 space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                Unified Technical Site Audit · Stage 1 Zero-LLM ($0.00)
              </p>
              <h2 className="text-base font-semibold text-white">
                Crawl Files, Meta Health (OK vs. Needs Fix) &amp; Media Weight
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {scan && (
                <span className="rounded-full border border-slate-700 bg-[#0B0F17] px-3 py-1 font-mono text-xs text-slate-300">
                  {scan.cycle} · {scan.report.coverage}
                </span>
              )}
              <button
                type="button"
                disabled={scanning}
                onClick={() => void runLiveTechnicalScan()}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
              >
                {scanning && (
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                )}
                <span>
                  {scanning ? "Scanning Live Site…" : "Run Live Technical Site Scan Now"}
                </span>
              </button>
            </div>
          </div>

          {scan ? (
            <div className="space-y-4">
              {/* Summary Strip + Sub-View Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3">
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

                {scan.report.summary && (
                  <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                    <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
                      {scan.report.summary.metaOk} OK
                    </span>
                    <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-300">
                      {scan.report.summary.metaNeedsFix} Needs Fix
                    </span>
                    <span className="rounded border border-slate-700 bg-[#0B0F17] px-2 py-0.5 text-slate-300">
                      {scan.report.summary.missingAltCount} Missing Alt ·{" "}
                      {scan.report.summary.oversizedImageCount} &gt;200 KB
                    </span>
                  </div>
                )}
              </div>

              {/* SUB-VIEW 1: CRAWL & INDEX */}
              {auditTab === "crawl" && (
                <div className="space-y-4">
                  {scan.report.files && scan.report.files.length > 0 && (
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {scan.report.files.map((f) => {
                        const ok = f.status === 200;
                        return (
                          <div
                            key={f.url}
                            className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3"
                          >
                            <div className="flex items-center justify-between gap-2">
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
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    {(["added", "removed"] as const).map((key) => (
                      <details
                        key={key}
                        className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3"
                      >
                        <summary className="cursor-pointer text-xs font-semibold text-slate-200">
                          {scan.report[key].length} URLs {key}
                        </summary>
                        <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                          {scan.report[key].length === 0 ? (
                            <p className="text-xs text-slate-500">None in this cycle.</p>
                          ) : (
                            scan.report[key].map((u) => (
                              <p
                                key={u}
                                className="truncate font-mono text-[11px] text-slate-400"
                              >
                                {u}
                              </p>
                            ))
                          )}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-VIEW 2: META HEALTH (OK vs. NEEDS FIX) */}
              {auditTab === "meta" && (
                <div className="space-y-2">
                  {scan.report.checks.map((c) => {
                    const isOk = c.metaHealth === "ok";
                    return (
                      <div
                        key={c.url}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-[#0B0F17] p-3 text-xs"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
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
                            <strong className="truncate font-mono text-slate-200">
                              {c.url}
                            </strong>
                          </div>
                          <p className="text-slate-400">
                            {c.findings.join(" · ") || "All checked on-page fields healthy."}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUrl(c.url)}
                          className="shrink-0 rounded-md border border-slate-700 bg-[#111827] px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:border-blue-500/60 hover:text-white"
                        >
                          Inspect &amp; Fix →
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SUB-VIEW 3: MEDIA & ALT-TEXT */}
              {auditTab === "media" && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-blue-500/20 bg-blue-950/20 px-3.5 py-2.5 text-xs text-slate-300">
                    Flags missing <code className="font-mono text-blue-300">alt</code>{" "}
                    attributes and heavy non-WebP / <code className="font-mono text-blue-300">&gt;200 KB</code>{" "}
                    images at $0.00 LLM cost. Target <strong className="text-white">&lt; 150 KB WebP</strong>{" "}
                    for Core Web Vitals LCP (native DoItWithAI Image Compressor hook ready).
                  </div>

                  {!scan.report.mediaIssues || scan.report.mediaIssues.length === 0 ? (
                    <p className="rounded-lg border border-slate-800 bg-[#0B0F17] p-4 text-xs text-slate-400">
                      No missing alt-text or oversized (&gt;200 KB) images detected across scanned pages.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {scan.report.mediaIssues.slice(0, 20).map((m, idx) => (
                        <div
                          key={`${m.imageUrl}-${idx}`}
                          className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="truncate font-mono text-slate-200">
                              {m.imageUrl}
                            </span>
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
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="rounded-lg border border-slate-800 bg-[#0B0F17] p-4 text-sm text-slate-400">
              No technical scan recorded yet. Click{" "}
              <strong className="text-slate-200">Run Live Technical Site Scan Now</strong>{" "}
              above to audit crawl files, meta health, and media weight immediately at $0.00 LLM cost.
            </p>
          )}
        </div>
      )}

      {/* ====================================================================
          TWO-PANE ON-PAGE & CONTENT REFRESH WORKBENCH
         ==================================================================== */}
      <div className="grid gap-5 border-t border-slate-800 pt-5 lg:grid-cols-12">
        {/* Left Pane: Categorized Existing URL Inventory */}
        <aside className="space-y-3 lg:col-span-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">
              Discovered Pages ({pages.length})
            </h3>
            <p className="text-xs text-slate-400">
              Select a page to inspect live metadata, media, and generate an AI optimization diff.
            </p>
          </div>

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

          <div className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
            {filteredPages.length === 0 ? (
              <p className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3 text-xs text-slate-400">
                No URLs in this category.
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
                      {p.metaHealth && (
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                            p.metaHealth === "ok"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-amber-500/15 text-amber-300"
                          }`}
                        >
                          {p.metaHealth === "ok" ? "OK" : "Fix"}
                        </span>
                      )}
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

        {/* Right Pane: Before/After Diff + AI Optimize Page + Patch Delivery */}
        <div className="min-w-0 space-y-4 lg:col-span-8">
          {!url ? (
            <div className="rounded-xl border border-slate-800 bg-[#0B0F17] p-6 text-center text-xs text-slate-400">
              Select any discovered URL on the left to inspect its live H1, SEO title, meta description, image alt-text, and run 1-click AI Optimization.
            </div>
          ) : snapshot && draft ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        snapshot.metaHealth === "ok"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-amber-500/15 text-amber-300"
                      }`}
                    >
                      {snapshot.metaHealth === "ok" ? "OK — Keep As Is" : "Needs Fix"}
                    </span>
                    <span className="truncate font-mono text-xs text-slate-200">{url}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {snapshot.findings.join(" · ") || "No issues in checked fields."}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={optimizing || busy}
                  onClick={() => void runAiOptimizePage()}
                  className="shrink-0 rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {optimizing
                    ? "Optimizing Page…"
                    : "AI Optimize Page (Meta, Alt-Text & Diff)"}
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="min-w-0 space-y-3 rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
                  <h3 className="text-sm font-semibold text-slate-200">Current live page</h3>
                  {keys.map((k) => (
                    <div key={k} className="space-y-1">
                      <strong className="text-xs text-slate-400">{labels[k]}</strong>
                      <p className="break-words rounded-lg border border-slate-800/80 bg-[#111827] p-2.5 text-xs text-slate-200">
                        {snapshot.fields[k] || "Empty"}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="min-w-0 space-y-3 rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
                  <h3 className="text-sm font-semibold text-white">Proposed SEO update</h3>
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
              </div>

              {altSuggestions.length > 0 && (
                <div className="space-y-2 rounded-xl border border-slate-800 bg-[#0B0F17] p-4 text-xs">
                  <h4 className="font-semibold text-white">
                    Copy-Ready Image Alt-Text Suggestions ({altSuggestions.length})
                  </h4>
                  <div className="divide-y divide-slate-800/80">
                    {altSuggestions.map((a, idx) => (
                      <div key={idx} className="py-2">
                        <p className="truncate font-mono text-[11px] text-slate-400">{a.src}</p>
                        <p className="mt-0.5 text-emerald-300">alt=&quot;{a.suggestedAlt}&quot;</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {schemaPatch && (
                <details open className="rounded-xl border border-slate-800 bg-[#0B0F17] p-4 text-xs">
                  <summary className="cursor-pointer font-semibold text-white">
                    Content Refresh &amp; JSON-LD FAQ Patch
                  </summary>
                  <pre className="mt-2.5 max-h-60 overflow-y-auto whitespace-pre-wrap break-words border-t border-slate-800 pt-2.5 font-mono text-[11px] text-slate-300">
                    {schemaPatch}
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
                  onClick={() => void apply()}
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
                      escape(draft.title) +
                      '</title>\n<meta name="description" content="' +
                      escape(draft.description) +
                      '">\n<h1>' +
                      escape(draft.heading) +
                      "</h1>"
                    }
                  />
                </label>
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

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FilePenLine,
  Globe,
  Loader2,
  Plus,
  RefreshCw,
  SearchCheck,
  XCircle,
} from "lucide-react";
import {
  createDefaultStudioState,
  loadStudioState,
  saveStudioStateOptimistic,
  subscribeStudioState,
} from "@/lib/studio/store";
import { seedKeywordIntoWriterStudio } from "@/lib/studio/writer-bridge";
import type { SiteAuditSnapshot, StudioWorkspaceState } from "@/lib/studio/types";

export default function StudioOverviewClient() {
  const router = useRouter();
  const [studio, setStudio] = useState<StudioWorkspaceState>(
    createDefaultStudioState,
  );
  const [selectedUrl, setSelectedUrl] = useState("");
  const [auditing, setAuditing] = useState(false);
  const [auditError, setAuditError] = useState("");

  useEffect(() => {
    const initial = loadStudioState();
    setStudio(initial);
    const active =
      initial.sites.find((s) => s.id === initial.activeSiteId) ||
      initial.sites[0];
    if (active) setSelectedUrl(active.url);

    return subscribeStudioState(() => {
      const next = loadStudioState();
      setStudio(next);
      const nextSite =
        next.sites.find((s) => s.id === next.activeSiteId) || next.sites[0];
      if (nextSite && !selectedUrl) setSelectedUrl(nextSite.url);
    });
  }, []);

  const activeSite =
    studio.sites.find((s) => s.id === studio.activeSiteId) ||
    studio.sites[0] ||
    null;

  if (!activeSite) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-8 text-center shadow-xl sm:p-12">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5271FF]/20 text-[#9aabff]">
          <SearchCheck size={24} />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
          Run Your First Combined 1-Click Site Snapshot
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
          Connect your existing website (Path A) to unify On-Page, Meta Pixel,
          and @graph Schema checks into a single view—or launch a new AI Tool or
          Blog website on an isolated subdomain (Path B).
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/studio/onboarding"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#5271FF] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#5271FF]/25 transition hover:bg-[#4361EE]"
          >
            <Plus size={16} />
            <span>Start 60-Second Onboarding</span>
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/tools/on-page-ai-seo-analyzer"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3.5 text-sm font-bold text-slate-200 hover:border-[#5271FF]"
          >
            Stateless On-Page Analyzer
          </Link>
        </div>
      </div>
    );
  }

  const snapshot = activeSite.auditSnapshot;
  const siteKeywords = studio.keywords.filter((k) => k.siteId === activeSite.id);

  const handleRunLiveAudit = async (targetUrl?: string) => {
    const urlToScan = (targetUrl || selectedUrl || activeSite.url).trim();
    if (!urlToScan) return;
    setAuditing(true);
    setAuditError("");
    try {
      const res = await fetch("/api/studio/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: urlToScan,
          niche: activeSite.niche,
          audience: activeSite.audience,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        snapshot?: SiteAuditSnapshot;
        sitemapUrls?: Array<{ url: string; title: string }>;
        brandColorHex?: string;
      };
      if (!res.ok || data.error || !data.snapshot) {
        throw new Error(data.error || "Could not refresh snapshot.");
      }

      saveStudioStateOptimistic((prev) => ({
        ...prev,
        usage: {
          ...prev.usage,
          auditsRun: prev.usage.auditsRun + 1,
        },
        sites: prev.sites.map((s) =>
          s.id === activeSite.id
            ? {
                ...s,
                auditSnapshot: data.snapshot!,
                brandColorHex: data.brandColorHex || s.brandColorHex,
                sitemapUrls:
                  data.sitemapUrls && data.sitemapUrls.length > s.sitemapUrls.length
                    ? data.sitemapUrls
                    : s.sitemapUrls,
                updatedAtIso: new Date().toISOString(),
              }
            : s,
        ),
      }));
    } catch (err) {
      setAuditError(
        err instanceof Error ? err.message : "Live snapshot failed.",
      );
    } finally {
      setAuditing(false);
    }
  };

  const handleWriteAboutPage = async (pageTitle: string, pageUrl: string) => {
    await seedKeywordIntoWriterStudio({
      keyword: pageTitle.toLowerCase(),
      suggestedTitle: `${pageTitle} — Updated Guide`,
      customBrief: `Refresh or expand upon existing URL: ${pageUrl}`,
      site: activeSite,
    });
    router.push("/studio/writer");
  };

  return (
    <div className="space-y-6">
      {/* Top Snapshot Header Card */}
      <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-6 shadow-xl">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-emerald-500/35 bg-emerald-500/10 text-emerald-300">
              <span className="text-xl font-black">
                {snapshot?.overallScore ?? 0}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider">
                / 100
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold text-white sm:text-2xl">
                  {activeSite.name}
                </h1>
                <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-300">
                  {activeSite.sourceType === "website-builder"
                    ? "Isolated Builder Subdomain"
                    : "Connected Website"}
                </span>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <Globe size={13} />
                <a
                  href={activeSite.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline hover:text-white"
                >
                  {activeSite.url}
                </a>
                <span>·</span>
                <span>{activeSite.sitemapUrls.length} URLs discovered</span>
                <span>·</span>
                <span>{siteKeywords.length} saved keywords</span>
              </p>

              {/* Brand DNA Swatches */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span>Brand DNA:</span>
                {(snapshot?.brandColors || [activeSite.brandColorHex]).map(
                  (hex) => (
                    <span
                      key={hex}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-slate-200"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: hex }}
                      />
                      {hex}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* 1-Click URL Selector + Rescan */}
          <div className="flex flex-wrap items-center gap-2">
            {activeSite.sitemapUrls.length > 0 && (
              <select
                aria-label="Select sitemap URL to inspect"
                value={selectedUrl || activeSite.url}
                onChange={(e) => {
                  setSelectedUrl(e.target.value);
                  void handleRunLiveAudit(e.target.value);
                }}
                className="max-w-[260px] truncate rounded-xl border border-slate-700 bg-[#091020] px-3 py-2.5 text-xs text-slate-200 focus:border-[#5271FF] focus:outline-none"
              >
                {activeSite.sitemapUrls.slice(0, 60).map((p) => (
                  <option key={p.url} value={p.url}>
                    {p.url.replace(/^https?:\/\/[^/]+/, "") || "/"}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              disabled={auditing}
              onClick={() => void handleRunLiveAudit()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-white transition hover:border-[#5271FF] disabled:opacity-60"
            >
              {auditing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              <span>{auditing ? "Scanning…" : "Re-Run Snapshot"}</span>
            </button>
            <Link
              href="/studio/keywords"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#5271FF] px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#4361EE]"
            >
              <span>Review {siteKeywords.length} Keywords</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {auditError && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-200">
            {auditError}
          </div>
        )}
      </div>

      {/* Combined On-Page / Meta / Schema Checks Grid */}
      {snapshot && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {snapshot.checks.map((check) => {
            const StatusIcon =
              check.status === "pass"
                ? CheckCircle2
                : check.status === "warn"
                  ? AlertTriangle
                  : XCircle;
            const badgeStyle =
              check.status === "pass"
                ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-300"
                : check.status === "warn"
                  ? "border-amber-500/35 bg-amber-500/10 text-amber-300"
                  : "border-rose-500/35 bg-rose-500/10 text-rose-300";

            return (
              <div
                key={check.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0F172A] p-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      {check.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${badgeStyle}`}
                    >
                      <StatusIcon size={11} />
                      {check.status}
                    </span>
                  </div>
                  <h2 className="mt-2.5 text-sm font-extrabold text-white">
                    {check.label}
                  </h2>
                  <p className="mt-1 font-mono text-xs text-[#9aabff]">
                    {check.value}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    {check.recommendation}
                  </p>
                </div>

                <div className="mt-4 border-t border-slate-800/80 pt-3">
                  <Link
                    href={check.fixToolHref}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9aabff] hover:text-white"
                  >
                    <span>{check.fixToolLabel}</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Discovered Sitemap Pages Table */}
      <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-white">
              Imported Sitemap &amp; Internal Link Pool ({activeSite.sitemapUrls.length})
            </h2>
            <p className="text-xs text-slate-400">
              Automatically fed as real internal link candidates when you draft
              in <code>/studio/writer</code>.
            </p>
          </div>
          <Link
            href="/tools/content-decay-refresh-analyzer"
            className="text-xs font-bold text-[#9aabff] hover:underline"
          >
            Open Content Decay Planner →
          </Link>
        </div>

        <div className="mt-4 divide-y divide-slate-800/80">
          {activeSite.sitemapUrls.slice(0, 10).map((page) => (
            <div
              key={page.url}
              className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-200">
                  {page.title}
                </p>
                <p className="truncate text-[11px] text-slate-400">{page.url}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUrl(page.url);
                    void handleRunLiveAudit(page.url);
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 font-semibold text-slate-200 hover:border-[#5271FF]"
                >
                  Audit URL
                </button>
                <button
                  type="button"
                  onClick={() => void handleWriteAboutPage(page.title, page.url)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#5271FF]/20 px-2.5 py-1.5 font-bold text-[#b4c2ff] hover:bg-[#5271FF]/30"
                >
                  <FilePenLine size={12} />
                  <span>Refresh in Writer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

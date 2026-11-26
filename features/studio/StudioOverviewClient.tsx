"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FilePenLine,
  FileSearch,
  Globe,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  createDefaultStudioState,
  loadStudioState,
  subscribeStudioState,
  upsertConnectedSite,
} from "@/lib/studio/store";
import type {
  ConnectedStudioSite,
  SavedKeywordItem,
  SiteAuditSnapshot,
  StudioWorkspaceState,
} from "@/lib/studio/types";

export default function StudioOverviewClient() {
  const router = useRouter();
  const [studio, setStudio] = useState<StudioWorkspaceState>(
    createDefaultStudioState,
  );
  const [resyncing, setResyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [sitemapFilter, setSitemapFilter] = useState("");

  useEffect(() => {
    setStudio(loadStudioState());
    return subscribeStudioState(() => setStudio(loadStudioState()));
  }, []);

  const activeSite =
    studio.sites.find((s) => s.id === studio.activeSiteId) ||
    studio.sites[0] ||
    null;

  const filteredSitemap = useMemo(() => {
    if (!activeSite) return [];
    const q = sitemapFilter.trim().toLowerCase();
    if (!q) return activeSite.sitemapUrls.slice(0, 60);
    return activeSite.sitemapUrls
      .filter(
        (u) =>
          u.url.toLowerCase().includes(q) || u.title.toLowerCase().includes(q),
      )
      .slice(0, 60);
  }, [activeSite, sitemapFilter]);

  if (!activeSite) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#0D1526]">
        <Globe size={28} className="mx-auto text-[#5271FF]" />
        <h1 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
          No Website Connected Yet
        </h1>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Connect your website in the Workspace Hub to inspect Brand DNA, XML
          sitemap URLs, and live SEO health.
        </p>
        <Link
          href="/studio"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#5271FF] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#4361EE]"
        >
          <Plus size={14} />
          <span>Connect Website in Hub</span>
        </Link>
      </div>
    );
  }

  const handleResyncSite = async () => {
    setSyncError("");
    setResyncing(true);
    try {
      const res = await fetch("/api/studio/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: activeSite.url,
          niche: activeSite.niche,
          audience: activeSite.audience,
          primaryGoal: activeSite.primaryGoal,
          planTier: studio.planTier,
        }),
      });
      const payload = (await res.json()) as {
        error?: string;
        siteName?: string;
        normalizedUrl?: string;
        brandColorHex?: string;
        topicSeed?: string;
        coreOfferSummary?: string;
        businessModel?: string;
        detectedAudience?: string;
        detectedContentPillars?: string[];
        robotsTxtPreview?: string;
        hasLlmsTxt?: boolean;
        sitemapUrls?: Array<{ url: string; title: string }>;
        snapshot?: SiteAuditSnapshot;
        seedKeywords?: SavedKeywordItem[];
      };

      if (!res.ok || payload.error || !payload.snapshot) {
        throw new Error(payload.error || "Unable to refresh website snapshot.");
      }

      const updated: ConnectedStudioSite = {
        ...activeSite,
        name: payload.siteName || activeSite.name,
        niche: payload.topicSeed || activeSite.niche,
        audience: payload.detectedAudience || activeSite.audience,
        brandColorHex: payload.brandColorHex || activeSite.brandColorHex,
        coreOfferSummary: payload.coreOfferSummary || activeSite.coreOfferSummary,
        businessModel: payload.businessModel || activeSite.businessModel,
        detectedContentPillars:
          payload.detectedContentPillars || activeSite.detectedContentPillars,
        robotsTxtPreview: payload.robotsTxtPreview || activeSite.robotsTxtPreview,
        hasLlmsTxt: payload.hasLlmsTxt ?? activeSite.hasLlmsTxt,
        sitemapUrls: payload.sitemapUrls || activeSite.sitemapUrls,
        auditSnapshot: payload.snapshot,
        updatedAtIso: new Date().toISOString(),
      };
      upsertConnectedSite(updated, payload.seedKeywords || []);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Refresh failed.");
    } finally {
      setResyncing(false);
    }
  };

  const snap = activeSite.auditSnapshot;
  const siteKeywordsCount = studio.keywords.filter(
    (k) => k.siteId === activeSite.id,
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Executive Brand DNA & Site Identity Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-bold text-white shadow-xs"
              style={{ backgroundColor: activeSite.brandColorHex || "#5271FF" }}
            >
              {activeSite.name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {activeSite.name}
                </h1>
                {activeSite.businessModel && (
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {activeSite.businessModel}
                  </span>
                )}
              </div>
              <a
                href={activeSite.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#5271FF] dark:text-slate-400"
              >
                {activeSite.url}
                <ExternalLink size={12} />
              </a>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {activeSite.coreOfferSummary || activeSite.niche}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleResyncSite}
              disabled={resyncing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {resyncing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              <span>{resyncing ? "Re-crawling..." : "Re-Sync Site & Ideas"}</span>
            </button>
            <Link
              href="/studio/writer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#5271FF] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#4361EE]"
            >
              <FilePenLine size={14} />
              <span>Open Content Writer</span>
            </Link>
          </div>
        </div>

        {syncError && (
          <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-300">
            {syncError}
          </p>
        )}

        {/* Brand DNA Metadata Strip */}
        <div className="mt-5 grid gap-3 border-t border-slate-200/80 pt-5 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800/80">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              SEO Health Pulse
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {snap ? `${snap.overallScore}/100` : "Pending"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Homepage metadata &amp; technical baseline
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              XML Sitemap Inventory
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {activeSite.sitemapUrls.length} URLs
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Synced for internal linking &amp; page audits
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Tailored Blog Ideas
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {siteKeywordsCount} topics
            </p>
            <Link
              href="/studio/keywords"
              className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-[#5271FF] hover:underline dark:text-[#9aabff]"
            >
              Explore keyword clusters <ArrowRight size={11} />
            </Link>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Brand Palette &amp; Schema
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              {(snap?.brandColors?.length
                ? snap.brandColors
                : [activeSite.brandColorHex || "#5271FF"]
              ).map((hex) => (
                <span
                  key={hex}
                  title={hex}
                  className="h-5 w-5 rounded-md border border-slate-300/60 dark:border-slate-700"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
              {snap?.schemaTypes?.length
                ? `Schema: ${snap.schemaTypes.join(", ")}`
                : "No @graph schema detected yet"}
            </p>
          </div>
        </div>

        {/* Detected Content Pillars */}
        {activeSite.detectedContentPillars &&
          activeSite.detectedContentPillars.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Topical Pillars:
              </span>
              {activeSite.detectedContentPillars.map((pillar) => (
                <span
                  key={pillar}
                  className="rounded-lg border border-[#5271FF]/25 bg-[#5271FF]/[0.07] px-2.5 py-1 text-xs font-semibold text-[#4361EE] dark:text-[#b4c2ff]"
                >
                  {pillar}
                </span>
              ))}
            </div>
          )}
      </div>

      {/* Baseline Diagnostic Checks (Routes Directly Inside Studio Sidebar!) */}
      {snap && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Homepage Baseline Diagnostics
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quick checks from your latest crawl. Click any item to open its
                in-dashboard SEO workbench.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/studio/on-page"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-200"
              >
                <FileSearch size={13} /> On-Page Audit
              </Link>
              <Link
                href="/studio/technical"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-200"
              >
                <ShieldCheck size={13} /> Technical SEO
              </Link>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {snap.checks.map((check) => {
              const Icon =
                check.status === "pass"
                  ? CheckCircle2
                  : check.status === "warn"
                    ? AlertTriangle
                    : XCircle;
              const iconColor =
                check.status === "pass"
                  ? "text-emerald-500"
                  : check.status === "warn"
                    ? "text-amber-500"
                    : "text-rose-500";
              const targetHref = check.fixToolHref.startsWith("/studio/")
                ? check.fixToolHref
                : check.category === "schema" || check.category === "technical"
                  ? "/studio/technical"
                  : "/studio/on-page";

              return (
                <div
                  key={check.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200/90 p-4 dark:border-slate-800"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                        <Icon size={15} className={`shrink-0 ${iconColor}`} />
                        {check.label}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {check.value}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {check.recommendation}
                    </p>
                  </div>
                  <div className="mt-3 pt-1">
                    <Link
                      href={targetHref}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#5271FF] hover:underline dark:text-[#9aabff]"
                    >
                      <span>{check.fixToolLabel}</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Discovered XML Sitemap Inventory */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Synced Sitemap Pages ({activeSite.sitemapUrls.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Used automatically by the Content Writer for verified internal
              linking and by On-Page SEO for 1-click page audits.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={sitemapFilter}
              onChange={(e) => setSitemapFilter(e.target.value)}
              placeholder="Filter sitemap URLs..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        {filteredSitemap.length === 0 ? (
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            No matching sitemap URLs found.
          </p>
        ) : (
          <div className="mt-4 max-h-80 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200/80 dark:divide-slate-800/80 dark:border-slate-800">
            {filteredSitemap.map((entry) => (
              <div
                key={entry.url}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-xs hover:bg-slate-50/80 dark:hover:bg-slate-900/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold capitalize text-slate-800 dark:text-slate-200">
                    {entry.title}
                  </p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {entry.url}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/studio/on-page?url=${encodeURIComponent(entry.url)}`,
                    )
                  }
                  className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-300 dark:hover:text-[#9aabff]"
                >
                  Audit Page
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

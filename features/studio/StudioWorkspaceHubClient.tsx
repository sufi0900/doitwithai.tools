"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FilePenLine,
  FileSearch,
  Globe,
  KeyRound,
  Layers,
  Link2,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";
import {
  createDefaultStudioState,
  loadStudioState,
  removeConnectedSite,
  saveStudioStateOptimistic,
  subscribeStudioState,
  upsertConnectedSite,
} from "@/lib/studio/store";
import type {
  ConnectedStudioSite,
  SavedKeywordItem,
  SiteAuditSnapshot,
  StudioWorkspaceState,
} from "@/lib/studio/types";

interface CloudBuilderSite {
  projectId: string;
  name: string;
  templateName: string;
  mode: string;
  publicSlug: string | null;
  isPublished: boolean;
  publishedPostCount: number;
  seoHealthScore: number;
  updatedAt: string;
}

export default function StudioWorkspaceHubClient() {
  const router = useRouter();
  const [studio, setStudio] = useState<StudioWorkspaceState>(
    createDefaultStudioState,
  );
  const [cloudSites, setCloudSites] = useState<CloudBuilderSite[]>([]);
  const [showQuickConnect, setShowQuickConnect] = useState(false);

  // Quick-Connect Website form state
  const [siteUrl, setSiteUrl] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");

  useEffect(() => {
    setStudio(loadStudioState());
    const unsub = subscribeStudioState(() => setStudio(loadStudioState()));

    fetch("/api/website-builder/overview")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.websites)) {
          setCloudSites(data.websites as CloudBuilderSite[]);
        }
      })
      .catch(() => {});

    return unsub;
  }, []);

  const handleOpenSiteDashboard = (
    siteId: string,
    destination = "/studio/writer",
  ) => {
    saveStudioStateOptimistic((prev) => ({
      ...prev,
      activeSiteId: siteId,
    }));
    router.push(destination);
  };

  const handleImportBuilderSite = (cloud: CloudBuilderSite) => {
    const slug = (cloud.publicSlug || cloud.name || "site")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const domain = `${slug || "creator"}.doitwithai.site`;
    const nowIso = new Date().toISOString();
    const mapped: ConnectedStudioSite = {
      id: `builder-${cloud.projectId}`,
      name: cloud.name || "Builder Website",
      url: `https://${domain}`,
      niche: cloud.templateName || "Editorial & Digital Brand",
      audience: "Organic search visitors & readers",
      primaryGoal: "Publish high-ranking articles and optimize site SEO",
      brandColorHex: "#5271FF",
      sourceType: "website-builder",
      isolatedSubdomain: domain,
      builderProjectId: cloud.projectId,
      sitemapUrls: [],
      auditSnapshot: null,
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
    };
    upsertConnectedSite(mapped, []);
    router.push("/studio/writer");
  };

  const handleQuickConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectError("");
    if (!siteUrl.trim()) {
      setConnectError("Enter your website URL (for example, https://yourdomain.com).");
      return;
    }

    setConnecting(true);
    try {
      const res = await fetch("/api/studio/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: siteUrl.trim(),
          niche: niche.trim(),
          audience: audience.trim(),
          primaryGoal:
            "Grow organic traffic with high-intent blog content and clean technical/on-page SEO",
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
        detectedContentPillars?: string[];
        robotsTxtPreview?: string;
        hasLlmsTxt?: boolean;
        sitemapUrls?: Array<{ url: string; title: string }>;
        snapshot?: SiteAuditSnapshot;
        seedKeywords?: SavedKeywordItem[];
      };

      if (!res.ok || payload.error || !payload.snapshot || !payload.normalizedUrl) {
        throw new Error(
          payload.error || "Unable to analyze that URL. Check the domain and try again.",
        );
      }

      const nowIso = new Date().toISOString();
      const siteId = `site-${Date.now()}`;
      const newSite: ConnectedStudioSite = {
        id: siteId,
        name: payload.siteName || new URL(payload.normalizedUrl).hostname,
        url: payload.normalizedUrl,
        niche: niche.trim() || payload.topicSeed || "Digital Business",
        audience:
          audience.trim() || "Search-driven buyers, readers, and practitioners",
        primaryGoal:
          "Grow organic traffic with high-intent blog content and clean technical/on-page SEO",
        brandColorHex: payload.brandColorHex || "#5271FF",
        sourceType: "external-url",
        coreOfferSummary: payload.coreOfferSummary,
        businessModel: payload.businessModel,
        detectedContentPillars: payload.detectedContentPillars,
        robotsTxtPreview: payload.robotsTxtPreview,
        hasLlmsTxt: payload.hasLlmsTxt,
        sitemapUrls: payload.sitemapUrls || [],
        auditSnapshot: payload.snapshot,
        createdAtIso: nowIso,
        updatedAtIso: nowIso,
      };

      upsertConnectedSite(newSite, payload.seedKeywords || []);
      router.push("/studio/writer");
    } catch (err) {
      setConnectError(
        err instanceof Error ? err.message : "Could not connect website.",
      );
    } finally {
      setConnecting(false);
    }
  };

  const unsyncedCloudSites = cloudSites.filter(
    (cs) => !studio.sites.some((s) => s.builderProjectId === cs.projectId),
  );

  const showConnectPanel = studio.sites.length === 0 || showQuickConnect;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      {/* Clean Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/90 pb-6 dark:border-slate-800/90">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5271FF] dark:text-[#9aabff]">
            DoItWithAI Workspace Hub
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Your Websites &amp; Studios
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Select a connected website to open its dedicated SEO &amp; Content
            Writer dashboard, or launch the standalone AI Website Builder Studio.
          </p>
        </div>

        {studio.sites.length > 0 && (
          <button
            type="button"
            onClick={() => setShowQuickConnect((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#5271FF] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#4361EE]"
          >
            <Plus size={15} />
            <span>{showQuickConnect ? "Hide Connect Form" : "Connect Website"}</span>
          </button>
        )}
      </div>

      {/* SECTION 1: CONNECTED WEBSITES */}
      <section className="mt-8" aria-labelledby="connected-websites-heading">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2
              id="connected-websites-heading"
              className="text-base font-bold text-slate-900 dark:text-white"
            >
              Connected Websites
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click a website to enter its Left-Sidebar Content Writer, Keyword,
              On-Page, Technical &amp; Off-Page SEO workspace.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {studio.sites.length} {studio.sites.length === 1 ? "site" : "sites"}
          </span>
        </div>

        {/* Inline Connect Website Form (auto-open when 0 sites, or toggled via + Connect Website) */}
        {showConnectPanel && (
          <form
            onSubmit={handleQuickConnectSubmit}
            className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800 dark:bg-[#0D1526]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Connect an Existing Website
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  We crawl your live homepage, metadata, JSON-LD schema, XML
                  sitemap, and niche to prepare tailored article ideas and SEO
                  checks in real time.
                </p>
              </div>
              <Link
                href="/studio/onboarding"
                className="text-xs font-semibold text-[#5271FF] hover:underline dark:text-[#9aabff]"
              >
                Advanced setup options
              </Link>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-12">
              <div className="sm:col-span-6">
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Website URL
                </label>
                <ToolUrlInput
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  urlKind="domain"
                  placeholder="https://yourdomain.com"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Niche / Offer <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="Auto-detected from site"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Audience <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Founders, buyers, teams..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            {connectError && (
              <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-600 dark:text-rose-300">
                {connectError}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Live XML sitemap &amp; internal links
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  AI niche &amp; tailored blog topic ideas
                </span>
              </div>

              <button
                type="submit"
                disabled={connecting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#5271FF] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#4361EE] disabled:opacity-60"
              >
                {connecting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Analyzing Website &amp; Generating Ideas...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze &amp; Open Website Dashboard</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Connected Website Cards Grid */}
        {studio.sites.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {studio.sites.map((site) => {
              const siteKeywords = studio.keywords.filter(
                (k) => k.siteId === site.id,
              );
              const cleanHost =
                site.sourceType === "website-builder" && site.isolatedSubdomain
                  ? site.isolatedSubdomain
                  : site.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
              const healthScore = site.auditSnapshot?.overallScore;

              return (
                <div
                  key={site.id}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#5271FF]/60 hover:shadow-md dark:border-slate-800 dark:bg-[#0D1526] dark:hover:border-[#5271FF]/60"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenSiteDashboard(site.id, "/studio/writer")
                        }
                        className="flex min-w-0 items-center gap-3 text-left"
                      >
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-xs"
                          style={{
                            backgroundColor: site.brandColorHex || "#5271FF",
                          }}
                        >
                          {site.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-base font-bold text-slate-900 group-hover:text-[#5271FF] dark:text-white dark:group-hover:text-[#9aabff]">
                            {site.name}
                          </span>
                          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                            {cleanHost}
                          </span>
                        </span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                          {site.sourceType === "website-builder"
                            ? "Builder Site"
                            : "Connected Domain"}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeConnectedSite(site.id)}
                          title="Remove from hub"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {site.coreOfferSummary || site.niche}
                    </p>

                    {/* Clean Metrics Row */}
                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 text-center dark:border-slate-800/80 dark:bg-slate-900/60">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {siteKeywords.length}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Article Ideas
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {site.sitemapUrls.length}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Sitemap URLs
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {typeof healthScore === "number"
                            ? `${healthScore}/100`
                            : "Ready"}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          SEO Pulse
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Primary & Quick Module Entry Buttons */}
                  <div className="mt-4 space-y-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenSiteDashboard(site.id, "/studio/writer")
                      }
                      className="flex w-full items-center justify-between rounded-xl bg-[#5271FF] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#4361EE]"
                    >
                      <span className="flex items-center gap-2">
                        <FilePenLine size={14} />
                        Open Content Writer &amp; SEO Dashboard
                      </span>
                      <ArrowRight size={14} />
                    </button>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenSiteDashboard(site.id, "/studio/overview")
                        }
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 transition hover:border-[#5271FF]/50 hover:text-[#5271FF] dark:border-slate-800 dark:text-slate-300 dark:hover:text-[#9aabff]"
                      >
                        Overview
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenSiteDashboard(site.id, "/studio/keywords")
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 transition hover:border-[#5271FF]/50 hover:text-[#5271FF] dark:border-slate-800 dark:text-slate-300 dark:hover:text-[#9aabff]"
                      >
                        <KeyRound size={11} /> Keywords
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenSiteDashboard(site.id, "/studio/on-page")
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 transition hover:border-[#5271FF]/50 hover:text-[#5271FF] dark:border-slate-800 dark:text-slate-300 dark:hover:text-[#9aabff]"
                      >
                        <FileSearch size={11} /> On-Page
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenSiteDashboard(site.id, "/studio/technical")
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 transition hover:border-[#5271FF]/50 hover:text-[#5271FF] dark:border-slate-800 dark:text-slate-300 dark:hover:text-[#9aabff]"
                      >
                        <ShieldCheck size={11} /> Technical
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenSiteDashboard(site.id, "/studio/off-page")
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 transition hover:border-[#5271FF]/50 hover:text-[#5271FF] dark:border-slate-800 dark:text-slate-300 dark:hover:text-[#9aabff]"
                      >
                        <Link2 size={11} /> Off-Page
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Unsynced Cloud Website Builder Projects */}
        {unsyncedCloudSites.length > 0 && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Sites Created in Your AI Website Builder ({unsyncedCloudSites.length})
            </p>
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
              {unsyncedCloudSites.map((cs) => (
                <div
                  key={cs.projectId}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 dark:border-slate-800 dark:bg-[#0D1526]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {cs.name}
                    </p>
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {cs.templateName} · {cs.publishedPostCount} posts
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleImportBuilderSite(cs)}
                    className="shrink-0 rounded-lg bg-[#5271FF]/15 px-3 py-1.5 text-xs font-bold text-[#5271FF] transition hover:bg-[#5271FF] hover:text-white dark:text-[#9aabff]"
                  >
                    Connect to SEO Hub
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: SEPARATE STANDALONE AI WEBSITE BUILDER STUDIO */}
      <section
        className="mt-10 border-t border-slate-200/90 pt-8 dark:border-slate-800/90"
        aria-labelledby="website-builder-studio-heading"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7 dark:border-slate-800 dark:bg-[#0D1526]">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                <Layers size={13} className="text-[#5271FF]" />
                <span>Separate Standalone Creation Studio</span>
              </div>
              <h2
                id="website-builder-studio-heading"
                className="mt-3 text-lg font-bold text-slate-900 sm:text-xl dark:text-white"
              >
                AI Website &amp; Blog Builder Studio
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Need to build a new SEO publication, personal brand, SaaS
                launchpad, or interactive tool site from scratch? Launch the
                dedicated Website Builder Studio. Any site you create there can
                be connected right back to your Workspace Hub above for ongoing
                keyword research, content writing, and SEO audits.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <Link
                href="/ai-website-builder"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:border-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <Globe size={14} />
                <span>Open Website Builder Studio</span>
                <ArrowUpRight size={14} />
              </Link>
              <Link
                href="/ai-website-builder/start"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-[#5271FF]/50 hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-300 dark:hover:text-[#9aabff]"
              >
                <span>Browse 16 Templates</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

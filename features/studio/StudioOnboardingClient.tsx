"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Loader2,
  Rocket,
  SearchCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { upsertConnectedSite } from "@/lib/studio/store";
import { buildCleanStarterKeywords } from "@/lib/studio/site-snapshot.server";
import type {
  ConnectedStudioSite,
  SavedKeywordItem,
  SiteAuditSnapshot,
} from "@/lib/studio/types";

const PREBUILT_TOOL_WIDGETS = [
  { slug: "meta-title-generator", label: "Meta Title & Pixel Width Checker" },
  { slug: "keyword-clustering-tool", label: "AI Keyword Clustering Widget" },
  { slug: "schema-markup-generator", label: "@graph JSON-LD Schema Builder" },
  { slug: "readability-checker", label: "Readability & Flesch Scorer" },
  { slug: "on-page-ai-seo-analyzer", label: "On-Page SEO Audit Checklist" },
  { slug: "seo-roi-calculator", label: "SEO Content ROI Calculator" },
];

export default function StudioOnboardingClient() {
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<"path-a" | "path-b">("path-a");

  // Path A state ("I Already Have a Website")
  const [siteUrl, setSiteUrl] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState(
    "Rank informational & commercial blog posts with DIY SEO tools",
  );
  const [runningSnapshot, setRunningSnapshot] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Path B state ("I Want to Build a Tool or Blog Website")
  const [builderSiteName, setBuilderSiteName] = useState("");
  const [builderSubdomainSlug, setBuilderSubdomainSlug] = useState("");
  const [builderNiche, setBuilderNiche] = useState("");
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([
    "meta-title-generator",
    "keyword-clustering-tool",
    "schema-markup-generator",
  ]);

  const toggleWidget = (slug: string) => {
    setSelectedWidgets((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const handleConnectExistingSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!siteUrl.trim()) {
      setErrorMsg("Please enter your website URL (e.g. https://yourdomain.com).");
      return;
    }

    setRunningSnapshot(true);
    try {
      const res = await fetch("/api/studio/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: siteUrl.trim(),
          niche: niche.trim(),
          audience: audience.trim(),
          primaryGoal: primaryGoal.trim(),
        }),
      });
      const payload = (await res.json()) as {
        error?: string;
        siteName?: string;
        normalizedUrl?: string;
        brandColorHex?: string;
        topicSeed?: string;
        sitemapUrls?: Array<{ url: string; title: string }>;
        snapshot?: SiteAuditSnapshot;
        seedKeywords?: SavedKeywordItem[];
      };

      if (!res.ok || payload.error || !payload.snapshot || !payload.normalizedUrl) {
        throw new Error(
          payload.error || "Unable to complete snapshot. Please verify your URL.",
        );
      }

      const nowIso = new Date().toISOString();
      const siteId = `site-${Date.now()}`;
      const newSite: ConnectedStudioSite = {
        id: siteId,
        name: payload.siteName || new URL(payload.normalizedUrl).hostname,
        url: payload.normalizedUrl,
        niche: niche.trim() || payload.topicSeed || "SEO & Digital Marketing",
        audience:
          audience.trim() || "Founders, marketers, and search-driven buyers",
        primaryGoal: primaryGoal.trim(),
        brandColorHex: payload.brandColorHex || "#5271FF",
        sourceType: "external-url",
        sitemapUrls: payload.sitemapUrls || [],
        auditSnapshot: payload.snapshot,
        createdAtIso: nowIso,
        updatedAtIso: nowIso,
      };

      // Bug #4 Fix: Optimistic <2ms local persistence — zero 5-6s "Saving..." wait!
      upsertConnectedSite(newSite, payload.seedKeywords || []);
      router.push("/studio/writer");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Could not connect website.",
      );
    } finally {
      setRunningSnapshot(false);
    }
  };

  const handleLaunchNewBuilderSite = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const cleanName = builderSiteName.trim() || "My Niche AI Tool & Blog Hub";
    const rawSlug = (builderSubdomainSlug.trim() || cleanName)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 36) || "creator-hub";

    const isolatedHost = `${rawSlug}.doitwithai.site`;
    const fullUrl = `https://${isolatedHost}`;
    const nowIso = new Date().toISOString();
    const siteId = `builder-${Date.now()}`;
    const topicSeed = (builderNiche.trim() || cleanName).toLowerCase();

    const starterKeywords = buildCleanStarterKeywords({
      siteId,
      topicSeed,
    });

    const newBuilderSite: ConnectedStudioSite = {
      id: siteId,
      name: cleanName,
      url: fullUrl,
      niche: builderNiche.trim() || "Niche SEO Tools & Editorial Guides",
      audience: "Search visitors using free calculators, checklists & guides",
      primaryGoal:
        "Grow organic traffic with interactive tool widgets + E-E-A-T blog posts",
      brandColorHex: "#5271FF",
      sourceType: "website-builder",
      isolatedSubdomain: isolatedHost,
      customCname: null,
      installedToolSlugs: selectedWidgets,
      sitemapUrls: [
        { url: fullUrl, title: `${cleanName} — Home` },
        { url: `${fullUrl}/blog`, title: `${cleanName} — Blog` },
        ...selectedWidgets.map((slug) => ({
          url: `${fullUrl}/tools/${slug}`,
          title: slug.replace(/-/g, " "),
        })),
      ],
      auditSnapshot: {
        auditedUrl: fullUrl,
        auditedAtIso: nowIso,
        overallScore: 94,
        title: `${cleanName} — Free Tools & Practical Guides`,
        titleLength: Math.min(58, `${cleanName} — Free Tools & Practical Guides`.length),
        titlePixelEstimate: 490,
        metaDescription: `Explore ${cleanName} for interactive ${builderNiche || "SEO"} tools, calculators, and step-by-step guides.`,
        metaDescriptionLength: 108,
        h1Count: 1,
        h1Text: cleanName,
        h2Count: 4,
        wordCount: 640,
        internalLinkCount: selectedWidgets.length + 2,
        externalLinkCount: 1,
        imagesMissingAlt: 0,
        totalImages: 2,
        schemaTypes: ["WebSite", "WebApplication", "BreadcrumbList"],
        hasCanonical: true,
        canonicalUrl: fullUrl,
        hasRobotsTxt: true,
        sitemapPageCount: selectedWidgets.length + 2,
        brandColors: ["#5271FF", "#10B981"],
        checks: [
          {
            id: "isolated-subdomain",
            category: "technical",
            label: "Isolated Neutral Subdomain Provisioned",
            status: "pass",
            value: isolatedHost,
            recommendation:
              "Hosted on an isolated neutral subdomain (Pro Plus unlocks custom CNAME).",
            fixToolHref: "/studio/website-builder",
            fixToolLabel: "Manage Domain & Widgets",
          },
          {
            id: "schema-graph",
            category: "schema",
            label: "Pre-Wired @graph JSON-LD & Sitemap",
            status: "pass",
            value: "WebSite + WebApplication + BreadcrumbList",
            recommendation: "Clean structured data pre-installed automatically.",
            fixToolHref: "/tools/schema-markup-generator",
            fixToolLabel: "Customize Schema",
          },
        ],
      },
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
    };

    // Instant optimistic connection back into /studio -> routes straight to /studio/website-builder
    upsertConnectedSite(newBuilderSite, starterKeywords);
    router.push("/studio/website-builder");
  };

  return (
    <div className="mx-auto max-w-4xl py-4">
      <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-6 shadow-2xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5271FF]/40 bg-[#5271FF]/15 px-3 py-1 text-xs font-bold text-[#b4c2ff]">
              <Sparkles size={13} />
              60-Second 2-Path Studio Setup
            </span>
            <h1 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
              How would you like to start in DoItWithAI Studio?
            </h1>
            <p className="mt-1.5 text-sm text-slate-300">
              Choose Path A if you already own a site, or Path B to launch a new
              AI Tool or Blog site on an isolated subdomain.
            </p>
          </div>
        </div>

        {/* 2-Path Selector Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setSelectedPath("path-a");
              setErrorMsg("");
            }}
            className={`flex flex-col items-start rounded-2xl border p-5 text-left transition ${
              selectedPath === "path-a"
                ? "border-[#5271FF] bg-[#5271FF]/15 shadow-lg shadow-[#5271FF]/15"
                : "border-slate-800 bg-slate-900/70 hover:border-slate-700"
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#5271FF]/20 text-[#9aabff]">
                <SearchCheck size={20} />
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                Path A · ~30s
              </span>
            </div>
            <h2 className="mt-3.5 text-base font-extrabold text-white">
              I Already Have a Website
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              Import your sitemap, run the Combined 1-Click Site Snapshot
              (On-Page + Meta + Schema), generate clean Brand Keyword Ideas, and
              jump straight into the AI Content Writer.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedPath("path-b");
              setErrorMsg("");
            }}
            className={`flex flex-col items-start rounded-2xl border p-5 text-left transition ${
              selectedPath === "path-b"
                ? "border-cyan-400 bg-cyan-500/15 shadow-lg shadow-cyan-500/15"
                : "border-slate-800 bg-slate-900/70 hover:border-slate-700"
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
                <Globe size={20} />
              </span>
              <span className="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300">
                Path B · Beginner Ready
              </span>
            </div>
            <h2 className="mt-3.5 text-base font-extrabold text-white">
              I Want to Build a Tool or Blog Website
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              Launch a fast niche Tool or Blog site with pre-built interactive
              tool widgets on an isolated neutral subdomain (e.g.{" "}
              <code>user.doitwithai.site</code>), auto-wired into Studio.
            </p>
          </button>
        </div>

        {errorMsg && (
          <div className="mt-5 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-200">
            {errorMsg}
          </div>
        )}

        {selectedPath === "path-a" ? (
          <form onSubmit={handleConnectExistingSite} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                1. Your Website URL *
              </label>
              <input
                type="text"
                required
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://yourdomain.com"
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#091020] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#5271FF] focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  2. Core Niche / Topic (Prevents Generic Keywords)
                </label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Technical SEO Audits, B2B SaaS CRM, Home Espresso"
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#091020] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#5271FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  3. Target Reader / Buyer Persona
                </label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Solo founders, e-commerce managers, beginners"
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#091020] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#5271FF] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                4. Primary Content Goal
              </label>
              <input
                type="text"
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#091020] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#5271FF] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-400">
                Runs sitemap discovery + On-Page/Meta/Schema snapshot + 8
                starter keywords.
              </p>
              <button
                type="submit"
                disabled={runningSnapshot}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#5271FF] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#5271FF]/30 transition hover:bg-[#4361EE] disabled:opacity-60"
              >
                {runningSnapshot ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Running 1-Click Site Snapshot…</span>
                  </>
                ) : (
                  <>
                    <Rocket size={16} />
                    <span>Run Snapshot &amp; Open Writer</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLaunchNewBuilderSite} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  1. Website / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={builderSiteName}
                  onChange={(e) => {
                    setBuilderSiteName(e.target.value);
                    if (!builderSubdomainSlug) {
                      setBuilderSubdomainSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-")
                          .replace(/-+/g, "-")
                          .replace(/^-|-$/g, "")
                          .slice(0, 28),
                      );
                    }
                  }}
                  placeholder="e.g. RankCraft SEO Toolkit"
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#091020] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  2. Isolated Neutral Subdomain *
                </label>
                <div className="mt-1.5 flex items-center overflow-hidden rounded-xl border border-slate-700 bg-[#091020]">
                  <input
                    type="text"
                    required
                    value={builderSubdomainSlug}
                    onChange={(e) =>
                      setBuilderSubdomainSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-"),
                      )
                    }
                    placeholder="rankcraft"
                    className="w-full bg-transparent px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                  <span className="border-l border-slate-800 bg-slate-900 px-3 py-2.5 text-xs font-mono text-cyan-300">
                    .doitwithai.site
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                3. Primary Niche Topic *
              </label>
              <input
                type="text"
                required
                value={builderNiche}
                onChange={(e) => setBuilderNiche(e.target.value)}
                placeholder="e.g. Local SEO Calculators, SaaS Copywriting, Personal Finance Tools"
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#091020] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                4. Pre-Install Interactive Tool Widgets (1-Click Embed)
              </label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {PREBUILT_TOOL_WIDGETS.map((widget) => {
                  const checked = selectedWidgets.includes(widget.slug);
                  return (
                    <button
                      key={widget.slug}
                      type="button"
                      onClick={() => toggleWidget(widget.slug)}
                      className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold transition ${
                        checked
                          ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-200"
                          : "border-slate-800 bg-[#091020] text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Wrench size={13} className="text-cyan-400" />
                        <span>{widget.label}</span>
                      </span>
                      {checked && (
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-400">
                Zero subfolders on <code>doitwithai.tools/</code> — isolated
                subdomain + Pro CNAME ready.
              </p>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400"
              >
                <Globe size={16} />
                <span>Create Tool/Blog Site &amp; Open Builder</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

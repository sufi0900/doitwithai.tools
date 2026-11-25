"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  Crown,
  ExternalLink,
  Globe,
  Layers,
  Plus,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import {
  createDefaultStudioState,
  loadStudioState,
  saveStudioStateOptimistic,
  subscribeStudioState,
} from "@/lib/studio/store";
import type { StudioWorkspaceState } from "@/lib/studio/types";

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

const INSTALLABLE_DIY_WIDGETS = [
  {
    slug: "meta-title-generator",
    title: "Meta Title & SERP Pixel Checker",
    category: "On-Page SEO",
  },
  {
    slug: "meta-description-generator",
    title: "Meta Description Optimizer",
    category: "On-Page SEO",
  },
  {
    slug: "keyword-clustering-tool",
    title: "AI Keyword Clustering Widget",
    category: "Keywords",
  },
  {
    slug: "schema-markup-generator",
    title: "@graph JSON-LD Schema Generator",
    category: "Technical SEO",
  },
  {
    slug: "readability-checker",
    title: "Readability & Flesch Grade Checker",
    category: "Editorial",
  },
  {
    slug: "seo-roi-calculator",
    title: "SEO Content ROI Calculator",
    category: "Lead Magnet",
  },
  {
    slug: "h1-heading-generator",
    title: "H1 Heading & Intent Analyzer",
    category: "On-Page SEO",
  },
  {
    slug: "article-to-quiz-test-generator",
    title: "Interactive Article-to-Quiz Widget",
    category: "Engagement",
  },
];

export default function StudioWebsiteBuilderClient() {
  const [studio, setStudio] = useState<StudioWorkspaceState>(
    createDefaultStudioState,
  );
  const [cloudSites, setCloudSites] = useState<CloudBuilderSite[]>([]);
  const [customDomainDraft, setCustomDomainDraft] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    const s = loadStudioState();
    setStudio(s);
    const builderSite = s.sites.find((x) => x.sourceType === "website-builder");
    if (builderSite?.customCname) setCustomDomainDraft(builderSite.customCname);

    const unsub = subscribeStudioState(() => setStudio(loadStudioState()));

    fetch("/api/website-builder/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.websites)) {
          setCloudSites(data.websites as CloudBuilderSite[]);
        }
      })
      .catch(() => {});

    return unsub;
  }, []);

  const builderSites = studio.sites.filter(
    (s) => s.sourceType === "website-builder",
  );
  const activeBuilderSite =
    builderSites.find((s) => s.id === studio.activeSiteId) ||
    builderSites[0] ||
    null;

  const installedWidgets = activeBuilderSite?.installedToolSlugs || [
    "meta-title-generator",
    "keyword-clustering-tool",
    "schema-markup-generator",
  ];

  const handleToggleWidget = (slug: string) => {
    if (!activeBuilderSite) return;
    saveStudioStateOptimistic((prev) => ({
      ...prev,
      sites: prev.sites.map((site) => {
        if (site.id !== activeBuilderSite.id) return site;
        const current = site.installedToolSlugs || [];
        const next = current.includes(slug)
          ? current.filter((s) => s !== slug)
          : [...current, slug];
        return {
          ...site,
          installedToolSlugs: next,
          updatedAtIso: new Date().toISOString(),
        };
      }),
    }));
  };

  const handleSaveCustomCname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBuilderSite) return;
    const cleaned = customDomainDraft
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");

    saveStudioStateOptimistic((prev) => ({
      ...prev,
      sites: prev.sites.map((s) =>
        s.id === activeBuilderSite.id
          ? { ...s, customCname: cleaned || null }
          : s,
      ),
    }));
  };

  const handleCopyEmbedSnippet = (slug: string) => {
    const snippet = `<iframe src="https://doitwithai.tools/tools/${slug}?embed=1" width="100%" height="680" style="border:0;border-radius:16px;overflow:hidden;" loading="lazy" title="${slug}"></iframe>`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(snippet);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Isolated Subdomain Architecture Card */}
      <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/35 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold text-cyan-300">
              <ShieldCheck size={13} />
              Isolated Neutral Subdomain Architecture · Zero Main-Domain Risk
            </span>
            <h1 className="mt-3 text-xl font-extrabold text-white sm:text-2xl">
              AI Tool &amp; Blog Website Builder
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-300">
              Launch niche blog or interactive tool websites hosted strictly on
              isolated neutral subdomains (<code>*.doitwithai.site</code>) or
              custom Pro Plus <code>CNAME</code> domains—never subfolders on{" "}
              <code>doitwithai.tools/</code>.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/studio/onboarding"
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/50 bg-cyan-500/15 px-4 py-2.5 text-xs font-extrabold text-cyan-200 transition hover:bg-cyan-500/25"
            >
              <Plus size={14} />
              <span>Quick-Create Subdomain Site</span>
            </Link>
            <Link
              href="/ai-website-builder/start"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#5271FF] px-4 py-2.5 text-xs font-extrabold text-white shadow transition hover:bg-[#4361EE]"
            >
              <Sparkles size={14} />
              <span>Open 2D/3D Visual Builder</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        {/* Active Isolated Subdomain + CNAME Config */}
        {activeBuilderSite ? (
          <div className="mt-6 grid gap-4 rounded-2xl border border-slate-800 bg-[#091020] p-5 lg:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active Builder Site
              </p>
              <h2 className="mt-1 text-lg font-extrabold text-white">
                {activeBuilderSite.name}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 font-mono text-emerald-300">
                  <Globe size={12} />
                  https://{activeBuilderSite.isolatedSubdomain || "creator.doitwithai.site"}
                </span>
                <span className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-300">
                  {installedWidgets.length} Tool Widgets Installed
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/do-it-ai/website-studio/demo"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-700"
                >
                  <span>Preview Live Template</span>
                  <ExternalLink size={12} />
                </Link>
                <Link
                  href="/studio/writer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#5271FF]/20 px-3.5 py-2 text-xs font-bold text-[#b4c2ff] hover:bg-[#5271FF]/30"
                >
                  <span>Write Blog Post for Site →</span>
                </Link>
              </div>
            </div>

            {/* Custom Domain CNAME Panel (Pro Plus) */}
            <form
              onSubmit={handleSaveCustomCname}
              className="rounded-xl border border-slate-800 bg-[#0F172A] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-white">
                  Custom Domain CNAME
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                  <Crown size={11} />
                  Pro Plus ($29/mo)
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Point your DNS <code>CNAME</code> record to{" "}
                <code>cname.doitwithai.site</code> for edge SSL.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={customDomainDraft}
                  onChange={(e) => setCustomDomainDraft(e.target.value)}
                  placeholder="tools.yourdomain.com"
                  disabled={studio.planTier !== "pro_plus"}
                  className="flex-1 rounded-xl border border-slate-700 bg-[#091020] px-3 py-2 text-xs text-white placeholder-slate-500 disabled:opacity-60"
                />
                {studio.planTier === "pro_plus" ? (
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-extrabold text-slate-950 hover:bg-emerald-400"
                  >
                    Save CNAME
                  </button>
                ) : (
                  <Link
                    href="/pricing"
                    className="inline-flex items-center rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-300"
                  >
                    Unlock
                  </Link>
                )}
              </div>
              {activeBuilderSite.customCname && (
                <p className="mt-2 text-[11px] font-semibold text-emerald-300">
                  ✓ Configured custom CNAME: {activeBuilderSite.customCname}
                </p>
              )}
            </form>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-700 bg-[#091020] p-6 text-center">
            <p className="text-sm font-bold text-white">
              No isolated Builder subdomain configured in this session yet
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Use Path B in{" "}
              <Link href="/studio/onboarding" className="text-cyan-300 underline">
                2-Path Onboarding
              </Link>{" "}
              to spin up a neutral subdomain site in 20 seconds.
            </p>
          </div>
        )}
      </div>

      {/* Pre-Built Tool Widgets Catalog */}
      <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-white">
              Pre-Built Interactive Tool Widgets (1-Click Inject &amp; Embed)
            </h2>
            <p className="text-xs text-slate-400">
              Toggle widgets on your Builder site or copy a clean{" "}
              <code>&lt;iframe&gt;</code> embed code for WordPress, Webflow, or
              Ghost.
            </p>
          </div>
          <Link
            href="/tools/downloadable-ai-tools"
            className="text-xs font-bold text-[#9aabff] hover:underline"
          >
            Download Offline .ZIP Packs →
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {INSTALLABLE_DIY_WIDGETS.map((widget) => {
            const isInstalled = installedWidgets.includes(widget.slug);
            return (
              <div
                key={widget.slug}
                className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
                  isInstalled
                    ? "border-cyan-500/45 bg-cyan-500/10"
                    : "border-slate-800 bg-[#091020]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>{widget.category}</span>
                    {isInstalled && (
                      <CheckCircle2 size={13} className="text-emerald-400" />
                    )}
                  </div>
                  <h3 className="mt-2 text-xs font-extrabold text-white">
                    {widget.title}
                  </h3>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {activeBuilderSite && (
                    <button
                      type="button"
                      onClick={() => handleToggleWidget(widget.slug)}
                      className={`flex-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                        isInstalled
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      }`}
                    >
                      {isInstalled ? "Installed" : "+ Install"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCopyEmbedSnippet(widget.slug)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:border-[#5271FF] hover:text-white"
                  >
                    <Copy size={11} />
                    <span>
                      {copiedSlug === widget.slug ? "Copied!" : "Embed"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cloud Supabase Website Projects (if signed into Google) */}
      {cloudSites.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-6">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#9aabff]" />
            <h2 className="text-base font-extrabold text-white">
              Synced Cloud Website Builder Projects ({cloudSites.length})
            </h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cloudSites.map((proj) => (
              <div
                key={proj.projectId}
                className="rounded-2xl border border-slate-800 bg-[#091020] p-4"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold uppercase text-cyan-300">
                    {proj.mode} · {proj.templateName}
                  </span>
                  <span className="text-emerald-300">
                    SEO {proj.seoHealthScore}/100
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-extrabold text-white">
                  {proj.name}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {proj.publishedPostCount} published posts
                </p>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/ai-website-builder/studio/${proj.projectId}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#5271FF] px-3 py-1.5 text-xs font-bold text-white"
                  >
                    <Wrench size={12} />
                    <span>Edit Studio</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

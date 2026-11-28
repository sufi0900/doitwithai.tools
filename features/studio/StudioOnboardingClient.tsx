"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Globe,
  Layers,
  Loader2,
} from "lucide-react";
import { upsertConnectedSite } from "@/lib/studio/store";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";
import type {
  ConnectedStudioSite,
  SavedKeywordItem,
  SiteAuditSnapshot,
} from "@/lib/studio/types";

export default function StudioOnboardingClient() {
  const router = useRouter();

  const [siteUrl, setSiteUrl] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState(
    "Publish high-ranking informational & commercial articles and strengthen site-wide SEO",
  );
  const [runningSnapshot, setRunningSnapshot] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleConnectExistingSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!siteUrl.trim()) {
      setErrorMsg("Enter your website URL (for example, https://yourdomain.com).");
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

      if (!res.ok || payload.error || !payload.snapshot || !payload.normalizedUrl) {
        throw new Error(
          payload.error || "Unable to complete website analysis. Verify the URL and try again.",
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
          audience.trim() ||
          payload.detectedAudience ||
          "Search-driven buyers, readers, and practitioners",
        primaryGoal: primaryGoal.trim(),
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
      setErrorMsg(
        err instanceof Error ? err.message : "Could not connect website.",
      );
    } finally {
      setRunningSnapshot(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <Link
        href="/studio"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-[#5271FF] dark:text-slate-400 dark:hover:text-[#9aabff]"
      >
        <ArrowLeft size={14} />
        <span>Back to Workspace Hub</span>
      </Link>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-[#0D1526]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#5271FF] dark:text-[#9aabff]">
          Real-Time Website Onboarding
        </p>
        <h1 className="mt-1.5 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
          Connect Your Website to Studio
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          We crawl your homepage HTML, metadata, JSON-LD entities, brand colors,
          and XML sitemap in real time, then synthesize tailored keyword clusters
          and ready-to-write article ideas for your exact niche.
        </p>

        <form onSubmit={handleConnectExistingSite} className="mt-6 space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
              Website URL
            </label>
            <ToolUrlInput
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              urlKind="domain"
              placeholder="https://yourdomain.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                Core Niche / Offer{" "}
                <span className="font-normal text-slate-400">(optional — auto-detected)</span>
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g., B2B SaaS analytics, Dental clinic, AI SEO tools"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                Ideal Customer / Reader{" "}
                <span className="font-normal text-slate-400">(optional — auto-detected)</span>
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g., Founders, marketing leaders, local patients"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
              Primary 90-Day Organic Goal
            </label>
            <input
              type="text"
              value={primaryGoal}
              onChange={(e) => setPrimaryGoal(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-600 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          <div className="grid gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-600 sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
              Up to 400 XML sitemap URLs
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
              Brand DNA &amp; schema check
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
              12–15 AI niche article ideas
            </span>
          </div>

          <button
            type="submit"
            disabled={runningSnapshot}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5271FF] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#4361EE] disabled:opacity-60"
          >
            {runningSnapshot ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Crawling Site, Sitemap &amp; Generating Niche Ideas...</span>
              </>
            ) : (
              <>
                <span>Connect Website &amp; Open Studio</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Separate Standalone Builder Callout */}
      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-[#0D1526]">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#5271FF] dark:bg-slate-800">
            <Layers size={17} />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Don&apos;t have a website yet?
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Build a new blog, SaaS landing page, or portfolio in our separate
              AI Website Builder Studio first.
            </p>
          </div>
        </div>
        <Link
          href="/ai-website-builder"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-800 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-200 dark:hover:text-[#9aabff]"
        >
          <Globe size={14} />
          <span>Open Website Builder</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  );
}

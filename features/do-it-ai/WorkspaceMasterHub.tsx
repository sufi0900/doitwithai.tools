"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bot,
  ExternalLink,
  FileText,
  Globe2,
  Layers,
  Mic,
  Plus,
  RefreshCw,
  Settings2,
  Sparkles,
} from "lucide-react";
import { authorizedWebsiteFetch } from "@/features/website-builder/lib/supabase/browser";
import { listLocalWebsitesAsConnectedSummaries } from "@/features/website-builder/lib/local-websites-store";
import type { ConnectedWebsiteSummary } from "@/features/website-builder/ecosystem-bridge";
import {
  listSavedBlogProjects,
  type BlogProjectMetaSummary,
} from "@/lib/blog-writer/project-storage-db";

export interface WorkspaceMasterHubProps {
  authenticated: boolean;
  userEmail?: string | null;
  onSignIn?: () => void;
  signingIn?: boolean;
  compact?: boolean;
  onOpenFullHub?: () => void;
  onWebsitesCountChange?: (count: number) => void;
}

export function WorkspaceMasterHub({
  authenticated,
  userEmail,
  onSignIn,
  signingIn,
  compact = false,
  onOpenFullHub,
  onWebsitesCountChange,
}: WorkspaceMasterHubProps) {
  const [websites, setWebsites] = useState<ConnectedWebsiteSummary[]>([]);
  const [articles, setArticles] = useState<BlogProjectMetaSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWorkspaceOverview = useCallback(async () => {
    setLoading(true);
    try {
      const [localArticles, webRes] = await Promise.all([
        listSavedBlogProjects().catch(() => [] as BlogProjectMetaSummary[]),
        authorizedWebsiteFetch("/api/website-builder/overview", {
          cache: "no-store",
        }).catch(() => null),
      ]);
      setArticles(localArticles);
      const localSites = listLocalWebsitesAsConnectedSummaries();
      let serverSites: ConnectedWebsiteSummary[] = [];
      if (webRes && webRes.ok) {
        const data = (await webRes.json()) as {
          websites?: ConnectedWebsiteSummary[];
        };
        serverSites = Array.isArray(data.websites) ? data.websites : [];
      }
      const seenIds = new Set<string>();
      const merged = [...localSites, ...serverSites].filter((s) => {
        if (seenIds.has(s.projectId)) return false;
        seenIds.add(s.projectId);
        return true;
      });
      setWebsites(merged);
      onWebsitesCountChange?.(merged.length);
    } finally {
      setLoading(false);
    }
  }, [onWebsitesCountChange]);

  useEffect(() => {
    void loadWorkspaceOverview();
  }, [authenticated, loadWorkspaceOverview]);

  if (compact) {
    return (
      <section
        aria-label="Connected Website Builder and AI Content Writer Hub"
        className="w-full max-w-3xl rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-[#0c132d]/95 via-[#091026]/95 to-[#060B19]/95 p-4 shadow-lg"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Layers size={15} />
            </span>
            <div>
              <div className="text-xs font-bold text-white">
                Unified Website &amp; Content Ecosystem
              </div>
              <div className="text-[11px] text-slate-400">
                {loading
                  ? "Checking websites & articles…"
                  : `${websites.length} website${websites.length === 1 ? "" : "s"} · ${articles.length} writer article${articles.length === 1 ? "" : "s"}`}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/ai-website-builder/start"
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-500 hover:bg-indigo-400 px-2.5 py-1.5 text-[11px] font-bold text-white transition"
            >
              <Plus size={12} />
              <span>New Website</span>
            </Link>
            <Link
              href="/ai-content-writer"
              className="inline-flex items-center gap-1 rounded-lg border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 px-2.5 py-1.5 text-[11px] font-bold text-sky-300 transition"
            >
              <FileText size={12} />
              <span>AI Content Writer</span>
            </Link>
            {onOpenFullHub && (
              <button
                type="button"
                onClick={onOpenFullHub}
                className="rounded-lg border border-slate-700 bg-slate-900/90 hover:border-indigo-400/50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 transition"
              >
                Open Command Center →
              </button>
            )}
          </div>
        </div>

        {websites.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {websites.slice(0, 3).map((site) => (
              <div
                key={site.projectId}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/75 px-3 py-1.5 text-[11px]"
              >
                <span className="font-semibold text-white">{site.name}</span>
                <Link
                  href={`/ai-website-builder/studio/${site.projectId}`}
                  className="text-indigo-300 hover:text-indigo-200 font-semibold"
                >
                  Studio
                </Link>
                {site.publicSlug && (
                  <Link
                    href={`/p/${site.publicSlug}`}
                    target="_blank"
                    className="text-emerald-300 hover:text-emerald-200 font-semibold"
                  >
                    /p/{site.publicSlug}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-[#0e1738] via-[#0a122b] to-[#081024] p-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">
            DOITWITHAI MASTER WORKSPACE · CONNECTED ECOSYSTEM
          </p>
          <h2 className="mt-1 text-2xl font-black text-white">
            Websites, Visitor AI Agents &amp; Content Articles
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            {authenticated && userEmail
              ? `Signed in with Google (${userEmail}). Create websites, open studios, and publish writer articles in 1 click.`
              : "Explore our Flagship Demo anytime, or sign in with Google to save unlimited websites and publish live /p/[slug] sites."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadWorkspaceOverview()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-indigo-400/50 transition"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
          <Link
            href="/ai-website-builder/start"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-3.5 py-2 text-xs font-bold text-white transition"
          >
            <Plus size={14} />
            <span>Create New Website</span>
          </Link>
          <Link
            href="/ai-content-writer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 px-3.5 py-2 text-xs font-bold text-sky-200 transition"
          >
            <FileText size={14} />
            <span>Write SEO Article</span>
          </Link>
        </div>
      </div>

      {!authenticated && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0B132B]/90 p-5">
          <div>
            <h3 className="text-base font-bold text-white">
              Choose How You Want to Start Today
            </h3>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl">
              Try the Interactive Website Studio Demo right away, launch the AI
              Content Writer with local IndexedDB saving, or sign in with Google
              to store and publish live cloud websites.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onSignIn && (
              <button
                type="button"
                onClick={onSignIn}
                disabled={signingIn}
                className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-950 hover:bg-slate-100 transition"
              >
                {signingIn ? "Connecting Google…" : "Sign in with Google"}
              </button>
            )}
            <Link
              href="/ai-website-builder/studio/demo"
              className="rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-4 py-2 text-xs font-bold text-indigo-200 hover:bg-indigo-500/25 transition"
            >
              Launch Interactive Studio Demo
            </Link>
          </div>
        </div>
      )}

      {/* WEBSITES SECTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Your Websites ({websites.length})
          </h3>
          <Link
            href="/ai-website-builder"
            className="text-xs font-semibold text-indigo-300 hover:text-indigo-200"
          >
            Browse all 16 templates →
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-xs text-slate-400">
            Loading your connected websites…
          </div>
        ) : websites.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-indigo-500/30 bg-[#0B132B]/95 p-5">
              <div className="flex items-center gap-2 text-indigo-300">
                <Mic size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Option A · Website Builder
                </span>
              </div>
              <h4 className="mt-2 text-lg font-bold text-white">
                Build a Flagship Blog, SaaS, or 3D Website
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                Use Do It AI Agent voice onboarding or select from 16 2D
                editorial and 3D WebGL templates with Visitor Q&amp;A.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/ai-website-builder/start"
                  className="rounded-lg bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-400 transition"
                >
                  Create New Website →
                </Link>
                <Link
                  href="/ai-website-builder/studio/demo"
                  className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-500 transition"
                >
                  Open Flagship Demo
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-500/30 bg-[#0B132B]/95 p-5">
              <div className="flex items-center gap-2 text-sky-300">
                <Sparkles size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Option B · Content Writer Studio
                </span>
              </div>
              <h4 className="mt-2 text-lg font-bold text-white">
                Write Authority Articles &amp; Section Infographics
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                Run multi-agent keyword research, Google SERP simulation, and
                1-click publishing into any website you build here later.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/ai-content-writer"
                  className="rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-sky-400 transition"
                >
                  Open AI Content Writer →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {websites.map((site) => (
              <article
                key={site.projectId}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0B132B]/90 p-5 hover:border-indigo-500/40 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                      {(site.mode ??
                        (site.templateCategory === "interactive-3d-portfolio"
                          ? "3d"
                          : "2d")) === "3d"
                        ? "3D WebGL"
                        : "2D Editorial"}{" "}
                      · {site.templateName ?? site.templateId.replaceAll("-", " ")}
                    </span>
                    {site.publicSlug ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                        Live · /p/{site.publicSlug}
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-400">
                        Private Draft
                      </span>
                    )}
                  </div>

                  <h4 className="mt-3 text-lg font-bold text-white">
                    {site.name}
                  </h4>

                  <p className="mt-1 text-xs text-slate-400">
                    Rev {site.revision} · {site.publishedPostCount} published ·{" "}
                    {site.draftPostCount} draft posts · Visitor AI:{" "}
                    {site.visitorAgentEnabled ? "On" : "Off"}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-800/80 pt-3">
                  <Link
                    href={`/ai-website-builder/studio/${site.projectId}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 px-3 py-1.5 text-xs font-bold text-white transition"
                  >
                    <Globe2 size={13} />
                    <span>Open Website Studio</span>
                  </Link>

                  <Link
                    href={`/ai-content-writer?targetSiteId=${site.projectId}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 px-3 py-1.5 text-xs font-semibold text-sky-200 transition"
                  >
                    <FileText size={13} />
                    <span>Write Article for Site</span>
                  </Link>

                  <Link
                    href={`/ai-website-builder/studio/${site.projectId}/settings`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:border-slate-500 px-3 py-1.5 text-xs font-semibold text-slate-200 transition"
                  >
                    <Bot size={13} />
                    <span>Visitor AI</span>
                  </Link>

                  {site.publicSlug && (
                    <Link
                      href={`/p/${site.publicSlug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition"
                    >
                      <ExternalLink size={12} />
                      <span>View Live</span>
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* WRITER ARTICLES SECTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Saved Writer Studio Articles ({articles.length})
          </h3>
          <Link
            href="/ai-content-writer"
            className="text-xs font-semibold text-sky-300 hover:text-sky-200"
          >
            Open /ai-content-writer →
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-xs text-slate-300">
            No local articles in this browser yet. Open{" "}
            <Link
              href="/ai-content-writer"
              className="font-semibold text-sky-300 underline"
            >
              AI Content Writer Studio
            </Link>{" "}
            to draft your first article and sync it to any website.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 9).map((article) => (
              <article
                key={article.projectId}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0B132B]/80 p-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-sky-300">
                      SEO {article.overallScore}/100
                    </span>
                    <span className="text-slate-400">
                      {article.wordCount} words
                    </span>
                  </div>
                  <h4 className="mt-2 line-clamp-2 text-sm font-bold text-white">
                    {article.projectTitle || "Untitled Article"}
                  </h4>
                  {article.primaryKeyword && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      Keyword: {article.primaryKeyword}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-2.5">
                  <Link
                    href={
                      websites[0]
                        ? `/ai-content-writer?targetSiteId=${websites[0].projectId}`
                        : "/ai-content-writer"
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-sky-500/35 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-200 hover:bg-sky-500/20 transition"
                  >
                    <Settings2 size={12} />
                    <span>Edit &amp; Publish to Site</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

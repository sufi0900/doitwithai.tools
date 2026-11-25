"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarCheck2,
  Crown,
  FilePenLine,
  Globe,
  KeyRound,
  LayoutDashboard,
  Lock,
  Plus,
  Sparkles,
} from "lucide-react";
import { useWorkspace } from "@/features/tools-workspace/WorkspaceProvider";
import {
  createDefaultStudioState,
  loadStudioState,
  saveStudioStateOptimistic,
  subscribeStudioState,
} from "@/lib/studio/store";
import type { StudioWorkspaceState } from "@/lib/studio/types";

const STUDIO_TABS = [
  {
    href: "/studio",
    label: "Site Snapshot",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/studio/keywords",
    label: "Keywords",
    icon: KeyRound,
    exact: false,
  },
  {
    href: "/studio/writer",
    label: "Writer",
    icon: FilePenLine,
    exact: false,
  },
  {
    href: "/studio/website-builder",
    label: "Website Builder",
    icon: Globe,
    exact: false,
  },
  {
    href: "/studio/planner",
    label: "Planner & Prompts",
    icon: CalendarCheck2,
    exact: false,
  },
];

const PLAN_LABELS: Record<StudioWorkspaceState["planTier"], string> = {
  free: "Free ($0)",
  pro_creator: "Pro Creator",
  pro_plus: "Pro Plus",
};

const ARTICLE_LIMITS: Record<StudioWorkspaceState["planTier"], number> = {
  free: 1,
  pro_creator: 20,
  pro_plus: 50,
};

export default function StudioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const workspace = useWorkspace();
  const [hydrated, setHydrated] = useState(false);
  const [studio, setStudio] = useState<StudioWorkspaceState>(
    createDefaultStudioState,
  );

  useEffect(() => {
    setStudio(loadStudioState());
    setHydrated(true);
    return subscribeStudioState(() => {
      setStudio(loadStudioState());
    });
  }, []);

  const isAuthorized = Boolean(workspace?.user || studio.guestPassActive);
  const activeSite =
    studio.sites.find((s) => s.id === studio.activeSiteId) ||
    studio.sites[0] ||
    null;
  const maxArticles = ARTICLE_LIMITS[studio.planTier];

  const handleSelectSite = (siteId: string) => {
    saveStudioStateOptimistic((prev) => ({
      ...prev,
      activeSiteId: siteId,
    }));
  };

  const handleActivatePreviewPass = () => {
    saveStudioStateOptimistic((prev) => ({
      ...prev,
      guestPassActive: true,
    }));
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#070D1B] px-4 py-12 text-slate-200">
        <div className="mx-auto max-w-6xl animate-pulse space-y-4">
          <div className="h-14 rounded-2xl bg-slate-800/70" />
          <div className="h-96 rounded-3xl bg-slate-900/80" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-[82vh] bg-[#070D1B] px-4 py-16 text-slate-100">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-800 bg-[#0F172A] p-8 shadow-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5271FF]/40 bg-[#5271FF]/15 px-3 py-1 text-xs font-bold text-[#9aabff]">
            <Lock size={12} />
            Protected DIY Workspace (noindex)
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-white">
            Sign in to unlock DoItWithAI Studio
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Access your 5-tab Manual DIY Toolkit: Combined Site Audit Snapshot,
            Saved Keyword Backlog, Flagship AI Content Writer, AI Tool/Blog
            Website Builder, and Editorial Planner.
          </p>
          <div className="mt-6 space-y-3">
            <Link
              href={`/auth?next=${encodeURIComponent(pathname || "/studio")}`}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5271FF] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#4361EE]"
            >
              Sign In with Google (/auth)
            </Link>
            <button
              type="button"
              onClick={handleActivatePreviewPass}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 px-5 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500/25"
            >
              <Sparkles size={15} />
              Instant Preview Pass (Test Path A &amp; B Now)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070D1B] text-slate-100">
      {/* Studio Top Bar */}
      <div className="border-b border-slate-800/90 bg-[#0B1325]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 text-sm font-extrabold tracking-tight text-white"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: activeSite?.brandColorHex || "#5271FF",
                }}
              />
              <span>DoItWithAI Studio</span>
              <span className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                DIY Toolkit
              </span>
            </Link>

            {studio.sites.length > 0 ? (
              <div className="flex items-center gap-2">
                <select
                  aria-label="Active connected website"
                  value={activeSite?.id || ""}
                  onChange={(e) => handleSelectSite(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-[#0F172A] px-3 py-1.5 text-xs font-semibold text-slate-200 focus:border-[#5271FF] focus:outline-none"
                >
                  {studio.sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name} ({site.sourceType === "website-builder" && site.isolatedSubdomain
                        ? site.isolatedSubdomain
                        : site.url.replace(/^https?:\/\//, "").replace(/\/$/, "")})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => router.push("/studio/onboarding")}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-[#5271FF] hover:text-white"
                >
                  <Plus size={13} />
                  <span className="hidden sm:inline">Add Site</span>
                </button>
              </div>
            ) : (
              <Link
                href="/studio/onboarding"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/25"
              >
                <Plus size={13} />
                <span>60s Setup: Connect or Build a Site</span>
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 font-semibold text-slate-300">
              Articles:{" "}
              <strong className="text-white">
                {studio.usage.articlesGenerated}/{maxArticles}
              </strong>{" "}
              this mo
            </span>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#5271FF]/40 bg-[#5271FF]/15 px-3 py-1.5 font-bold text-[#b4c2ff] transition hover:bg-[#5271FF]/25"
            >
              <Crown size={13} className="text-amber-300" />
              <span>{PLAN_LABELS[studio.planTier]}</span>
              {studio.planTier === "free" && (
                <span className="text-emerald-300">· Upgrade</span>
              )}
            </Link>
          </div>
        </div>

        {/* 5 Manual DIY Module Tabs */}
        <div className="mx-auto max-w-[1600px] overflow-x-auto px-4 sm:px-6">
          <nav
            aria-label="Studio navigation"
            className="flex items-center gap-1 pb-2"
          >
            {STUDIO_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.exact
                ? pathname === tab.href
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  prefetch={false}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    isActive
                      ? "bg-[#5271FF] text-white shadow-md shadow-[#5271FF]/25"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
            <Link
              href="/studio/onboarding"
              prefetch={false}
              className={`ml-auto inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition ${
                pathname === "/studio/onboarding"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
              }`}
            >
              <Sparkles size={13} />
              <span>2-Path Onboarding</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Tab Body */}
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}

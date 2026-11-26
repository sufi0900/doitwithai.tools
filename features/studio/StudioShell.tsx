"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Bot,
  CalendarCheck2,
  Crown,
  FilePenLine,
  FileSearch,
  Globe,
  KeyRound,
  LayoutDashboard,
  Link2,
  Lock,
  type LucideIcon,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useWorkspace } from "@/features/tools-workspace/WorkspaceProvider";
import RecentUrlsProvider from "@/features/tool-ui/recent-urls/RecentUrlsProvider";
import {
  createDefaultStudioState,
  dispatchStudioDrawer,
  loadStudioState,
  saveStudioStateOptimistic,
  subscribeStudioState,
} from "@/lib/studio/store";
import type {
  StudioRuntimeStatus,
  StudioWorkspaceState,
} from "@/lib/studio/types";
import StudioGlobalDrawer from "./StudioGlobalDrawer";

interface SidebarNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  group: "primary" | "seo" | "resources";
  badge?: string;
}

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  {
    href: "/studio/writer",
    label: "Content Writer & Ideas",
    icon: FilePenLine,
    group: "primary",
    badge: "Focus",
  },
  {
    href: "/studio/overview",
    label: "Overview & Brand DNA",
    icon: LayoutDashboard,
    group: "seo",
  },
  {
    href: "/studio/keywords",
    label: "Keyword Research",
    icon: KeyRound,
    group: "seo",
  },
  {
    href: "/studio/on-page",
    label: "On-Page SEO",
    icon: FileSearch,
    group: "seo",
  },
  {
    href: "/studio/technical",
    label: "Technical SEO",
    icon: ShieldCheck,
    group: "seo",
  },
  {
    href: "/studio/off-page",
    label: "Off-Page SEO",
    icon: Link2,
    group: "seo",
  },
  {
    href: "/studio/planner",
    label: "Editorial Planner",
    icon: CalendarCheck2,
    group: "seo",
  },
  {
    href: "/studio/vault",
    label: "Prompts, Tools & Playbooks",
    icon: BookOpen,
    group: "resources",
  },
];

const PLAN_LABELS: Record<StudioWorkspaceState["planTier"], string> = {
  free: "Free Plan",
  pro_creator: "Pro Creator",
  pro_plus: "Pro Plus",
};

const ARTICLE_LIMITS: Record<StudioWorkspaceState["planTier"], number> = {
  free: 1,
  pro_creator: 20,
  pro_plus: 50,
};

export default function StudioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/studio";
  const router = useRouter();
  const workspace = useWorkspace();

  const [hydrated, setHydrated] = useState(false);
  const [studio, setStudio] = useState<StudioWorkspaceState>(
    createDefaultStudioState,
  );
  const [runtime, setRuntime] = useState<StudioRuntimeStatus>({
    unlimitedTesting: false,
    studioAiConfigured: true,
    providerLabel: "Studio Gateway",
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setStudio(loadStudioState());
    setHydrated(true);

    fetch("/api/studio/runtime")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.unlimitedTesting === "boolean") {
          setRuntime({
            unlimitedTesting: Boolean(data.unlimitedTesting),
            studioAiConfigured: Boolean(data.studioAiConfigured),
            providerLabel: String(data.providerLabel || "Studio Gateway"),
          });
        }
      })
      .catch(() => {});

    return subscribeStudioState(() => {
      setStudio(loadStudioState());
    });
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const isAuthorized = Boolean(
    workspace?.user || studio.guestPassActive || runtime.unlimitedTesting,
  );
  const activeSite =
    studio.sites.find((s) => s.id === studio.activeSiteId) ||
    studio.sites[0] ||
    null;
  const maxArticles = ARTICLE_LIMITS[studio.planTier];
  const isHubOrOnboarding =
    pathname === "/studio" || pathname.startsWith("/studio/onboarding");

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
      <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-700 dark:bg-[#080E1C] dark:text-slate-200">
        <div className="mx-auto max-w-6xl animate-pulse space-y-4">
          <div className="h-12 rounded-2xl bg-slate-200 dark:bg-slate-800/70" />
          <div className="h-96 rounded-2xl bg-slate-200/70 dark:bg-slate-900/80" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-[82vh] bg-slate-50 px-4 py-16 text-slate-900 dark:bg-[#080E1C] dark:text-slate-100">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-[#0D1526]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5271FF]/30 bg-[#5271FF]/10 px-3 py-1 text-xs font-semibold text-[#5271FF] dark:text-[#9aabff]">
            <Lock size={12} />
            DoItWithAI Studio Workspace
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
            Sign in to open your Dashboard
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Connect your website to access tailored article ideas, the Flagship
            AI Content Writer, On-Page, Technical &amp; Off-Page SEO audits, and
            site-aware prompts &amp; tools.
          </p>
          <div className="mt-6 space-y-3">
            <Link
              href={`/auth?next=${encodeURIComponent(pathname)}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5271FF] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#4361EE]"
            >
              Sign in with Google
            </Link>
            <button
              type="button"
              onClick={handleActivatePreviewPass}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-200 dark:hover:text-[#9aabff]"
            >
              <Sparkles size={15} />
              Continue with Instant Guest Pass
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LEVEL 1: WORKSPACE HUB & ONBOARDING (Clean layout without site-specific SEO sidebar)
  if (isHubOrOnboarding) {
    return (
      <RecentUrlsProvider>
        <div className="min-h-[calc(100vh-80px)] bg-slate-50 text-slate-900 dark:bg-[#080E1C] dark:text-slate-100">
          {children}
          <StudioGlobalDrawer activeSite={activeSite} />
        </div>
      </RecentUrlsProvider>
    );
  }

  // LEVEL 2: CONNECTED WEBSITE LEFT-SIDEBAR SAAS DASHBOARD
  const currentNavItem = SIDEBAR_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const siteIdeasCount = activeSite
    ? studio.keywords.filter((k) => k.siteId === activeSite.id).length
    : 0;

  const renderSidebarContent = (compact: boolean) => (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-5 overflow-y-auto px-3 py-4">
        {/* Top Hub Back-Link + Active Website Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            {!compact && (
              <Link
                href="/studio"
                prefetch={false}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-[#5271FF] dark:text-slate-400 dark:hover:text-[#9aabff]"
              >
                <ArrowLeft size={13} />
                <span>Workspace Hub</span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="hidden rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:inline-flex dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title={compact ? "Expand sidebar" : "Collapse sidebar"}
            >
              {compact ? (
                <PanelLeftOpen size={15} />
              ) : (
                <PanelLeftClose size={15} />
              )}
            </button>
          </div>

          {!compact ? (
            studio.sites.length > 0 ? (
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: activeSite?.brandColorHex || "#5271FF",
                    }}
                  />
                  <select
                    aria-label="Select connected website"
                    value={activeSite?.id || ""}
                    onChange={(e) => handleSelectSite(e.target.value)}
                    className="w-full truncate bg-transparent text-xs font-bold text-slate-900 focus:outline-none dark:text-white"
                  >
                    {studio.sites.map((site) => (
                      <option
                        key={site.id}
                        value={site.id}
                        className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                      >
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-slate-200/70 pt-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <span className="truncate">
                    {activeSite
                      ? activeSite.url
                          .replace(/^https?:\/\//, "")
                          .replace(/\/$/, "")
                      : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push("/studio")}
                    className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-[#5271FF] hover:underline dark:text-[#9aabff]"
                  >
                    <Plus size={11} /> Add
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/studio"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#5271FF]/50 bg-[#5271FF]/[0.06] px-3 py-2.5 text-xs font-bold text-[#5271FF] transition hover:bg-[#5271FF]/[0.12] dark:text-[#9aabff]"
              >
                <Plus size={14} />
                <span>Connect Your Website</span>
              </Link>
            )
          ) : (
            <Link
              href="/studio"
              title="Back to Workspace Hub"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-800 dark:text-slate-300"
            >
              <ArrowLeft size={15} />
            </Link>
          )}
        </div>

        {/* Primary Focus Navigation */}
        <div>
          {!compact && (
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Primary Focus
            </p>
          )}
          {SIDEBAR_ITEMS.filter((i) => i.group === "primary").map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                title={compact ? item.label : undefined}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                  active
                    ? "bg-[#5271FF] text-white shadow-sm shadow-[#5271FF]/25"
                    : "border border-[#5271FF]/25 bg-[#5271FF]/[0.07] text-[#4361EE] hover:bg-[#5271FF]/[0.14] dark:text-[#b4c2ff]"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Icon size={16} className="shrink-0" />
                  {!compact && <span className="truncate">{item.label}</span>}
                </span>
                {!compact && siteIdeasCount > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-[#5271FF]/15 text-[#5271FF] dark:text-[#b4c2ff]"
                    }`}
                  >
                    {siteIdeasCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* SEO & Website Growth Pillars */}
        <div>
          {!compact && (
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              SEO &amp; Growth
            </p>
          )}
          <nav aria-label="Website SEO modules" className="space-y-1">
            {SIDEBAR_ITEMS.filter((i) => i.group === "seo").map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  title={compact ? item.label : undefined}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                  }`}
                >
                  <Icon
                    size={15}
                    className={`shrink-0 ${
                      active ? "text-[#9aabff]" : "text-slate-400"
                    }`}
                  />
                  {!compact && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Knowledge Vault & Brand AI Strategist */}
        <div>
          {!compact && (
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Knowledge &amp; Copilot
            </p>
          )}
          <div className="space-y-1">
            {SIDEBAR_ITEMS.filter((i) => i.group === "resources").map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  title={compact ? item.label : undefined}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                  }`}
                >
                  <Icon
                    size={15}
                    className={`shrink-0 ${
                      active ? "text-[#9aabff]" : "text-slate-400"
                    }`}
                  />
                  {!compact && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => dispatchStudioDrawer({ type: "open-copilot" })}
              title={compact ? "Brand AI Strategist" : undefined}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-[#5271FF] dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-[#9aabff]"
            >
              <Bot size={15} className="shrink-0 text-[#5271FF]" />
              {!compact && <span className="truncate">Brand AI Strategist</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Utility Footer: Separate Website Builder Link + Clean Runtime/Plan Status */}
      <div className="space-y-2 border-t border-slate-200/80 p-3 dark:border-slate-800/80">
        <Link
          href="/ai-website-builder"
          title={compact ? "AI Website Builder Studio" : undefined}
          className="flex items-center justify-between rounded-xl border border-slate-200/90 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#5271FF]/40 hover:text-[#5271FF] dark:border-slate-800 dark:text-slate-300 dark:hover:text-[#9aabff]"
        >
          <span className="flex items-center gap-2 truncate">
            <Globe size={14} className="shrink-0 text-slate-400" />
            {!compact && <span className="truncate">Website Builder</span>}
          </span>
          {!compact && <ArrowUpRight size={13} className="shrink-0 opacity-60" />}
        </Link>

        {!compact &&
          (runtime.unlimitedTesting ? (
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Preview · Unlimited Quota
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-slate-100/80 px-3 py-2 text-[11px] dark:bg-slate-900/90">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {studio.usage.articlesGenerated}/{maxArticles} articles
              </span>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 font-bold text-[#5271FF] hover:underline dark:text-[#9aabff]"
              >
                <Crown size={11} />
                {PLAN_LABELS[studio.planTier]}
              </Link>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <RecentUrlsProvider>
      <div className="flex min-h-[calc(100vh-80px)] bg-slate-50 text-slate-900 dark:bg-[#080E1C] dark:text-slate-100">
        {/* Desktop Collapsible Left Sidebar */}
        <aside
          className={`sticky top-[80px] hidden h-[calc(100vh-80px)] shrink-0 border-r border-slate-200/90 bg-white transition-all duration-200 lg:block dark:border-slate-800/90 dark:bg-[#0B1222] ${
            sidebarCollapsed ? "w-[68px]" : "w-[256px]"
          }`}
        >
          {renderSidebarContent(sidebarCollapsed)}
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-[10030] flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative z-10 flex h-full w-72 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0B1222]">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Studio Navigation
                </span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={16} />
                </button>
              </div>
              {renderSidebarContent(false)}
            </div>
          </div>
        )}

        {/* Main Workspace Column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Calm Contextual Workspace Sub-Header */}
          <div className="sticky top-[80px] z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-4 py-2.5 backdrop-blur-md sm:px-6 dark:border-slate-800/80 dark:bg-[#0B1222]/90">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="inline-flex rounded-lg border border-slate-200 p-1.5 text-slate-600 lg:hidden dark:border-slate-700 dark:text-slate-300"
                aria-label="Open Studio sidebar"
              >
                <Menu size={16} />
              </button>

              <div className="flex min-w-0 items-center gap-2 text-xs">
                <Link
                  href="/studio"
                  className="hidden font-medium text-slate-500 hover:text-slate-900 sm:inline dark:text-slate-400 dark:hover:text-white"
                >
                  {activeSite ? activeSite.name : "Workspace"}
                </Link>
                <span className="hidden text-slate-300 sm:inline dark:text-slate-700">
                  /
                </span>
                <span className="truncate font-bold text-slate-900 dark:text-white">
                  {currentNavItem?.label || "Studio"}
                </span>
                {activeSite && activeSite.sitemapUrls.length > 0 && (
                  <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 md:inline-flex dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                    {activeSite.sitemapUrls.length} sitemap URLs synced
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => dispatchStudioDrawer({ type: "open-copilot" })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#5271FF]/50 hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-[#9aabff]"
              >
                <Bot size={14} className="text-[#5271FF]" />
                <span>Brand AI</span>
              </button>

              {pathname !== "/studio/writer" && (
                <Link
                  href="/studio/writer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#5271FF] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#4361EE]"
                >
                  <FilePenLine size={13} />
                  <span>Write Article</span>
                </Link>
              )}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>

        <StudioGlobalDrawer activeSite={activeSite} />
      </div>
    </RecentUrlsProvider>
  );
}

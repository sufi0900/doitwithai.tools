"use client";

import React, { useEffect, useRef, useState, type ReactNode } from "react";
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
  Mail,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Share2,
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
  subscribeStudioDrawer,
  subscribeStudioState,
} from "@/lib/studio/store";
import {
  countSavedArticlesForSite,
  filterArticlesForSite,
  loadStudioArticleLibrary,
  STUDIO_ARTICLES_CHANGED_EVENT,
} from "@/lib/studio/article-library";
import type {
  StudioRuntimeStatus,
  StudioWorkspaceState,
} from "@/lib/studio/types";
import StudioGlobalDrawer from "./StudioGlobalDrawer";
import StudioTopBar from "./StudioTopBar";
import styles from "./studio-shell.module.css";
import StudioInlineEmbedPanel, {
  type StudioInlineItem,
} from "./StudioInlineEmbedPanel";
import { getSocialBrandMeta, SocialBrandIcon } from "./SocialBrandIcon";

interface SidebarNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  group: "brand" | "primary" | "distribution" | "seo" | "resources";
  badge?: string;
}

const SOCIAL_PLATFORM_SUBLINKS: Array<{ channel: string; label: string }> = [
  { channel: "Instagram", label: "Instagram" },
  { channel: "Facebook", label: "Facebook" },
  { channel: "LinkedIn", label: "LinkedIn" },
  { channel: "X", label: "X (Twitter)" },
  { channel: "Pinterest", label: "Pinterest" },
  { channel: "YouTube", label: "YouTube & Video" },
];

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  {
    href: "/studio/overview",
    label: "Overview & Brand DNA",
    icon: LayoutDashboard,
    group: "brand",
  },
  {
    href: "/studio/writer",
    label: "Content Writer",
    icon: FilePenLine,
    group: "primary",
  },
  {
    href: "/studio/social",
    label: "Social & Video Studio",
    icon: Share2,
    group: "distribution",
  },
  {
    href: "/studio/email",
    label: "Email Newsletter",
    icon: Mail,
    group: "distribution",
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
  const [runtimeChecked, setRuntimeChecked] = useState(false);
  const isWriter = pathname === "/studio/writer" || pathname.startsWith("/studio/writer/");
  const [navPreference, setNavPreference] = useState<{ writer: boolean; collapsed: boolean } | null>(null);
  const sidebarCollapsed = navPreference?.writer === isWriter ? navPreference.collapsed : isWriter;
  const workspaceScroll = useRef<HTMLDivElement>(null);
  const mobileNav = useRef<HTMLDialogElement>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [siteArticlesCount, setSiteArticlesCount] = useState(0);
  const [activeSocialChannel, setActiveSocialChannel] = useState("Instagram");
  const [inlineWorkspaceItem, setInlineWorkspaceItem] =
    useState<StudioInlineItem | null>(null);

  useEffect(() => {
    setStudio(loadStudioState());
    try {
      if (window.sessionStorage.getItem("doitwithai_studio_unlimited") === "1") {
        setRuntime((prev) => ({ ...prev, unlimitedTesting: true }));
        setRuntimeChecked(true);
      }
    } catch {
      // ignore storage errors
    }
    setHydrated(true);

    fetch("/api/studio/runtime")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.unlimitedTesting === "boolean") {
          const isUnlim = Boolean(data.unlimitedTesting);
          setRuntime({
            unlimitedTesting: isUnlim,
            studioAiConfigured: Boolean(data.studioAiConfigured),
            providerLabel: String(data.providerLabel || "Studio Gateway"),
          });
          try {
            window.sessionStorage.setItem(
              "doitwithai_studio_unlimited",
              isUnlim ? "1" : "0",
            );
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {})
      .finally(() => setRuntimeChecked(true));

    return subscribeStudioState(() => {
      setStudio(loadStudioState());
    });
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
    if (workspaceScroll.current) workspaceScroll.current.scrollTop = 0;
    setInlineWorkspaceItem(null);
    if (typeof window !== "undefined") {
      const ch = new URLSearchParams(window.location.search).get("channel");
      if (ch) setActiveSocialChannel(ch);
      else if (pathname === "/studio/social") setActiveSocialChannel("Instagram");
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncChannel = () => {
      const ch = new URLSearchParams(window.location.search).get("channel");
      setActiveSocialChannel(ch || "Instagram");
    };
    const onChannelEvent = (e: Event) => {
      const ch = (e as CustomEvent<string>).detail;
      if (ch) setActiveSocialChannel(ch);
    };
    window.addEventListener("popstate", syncChannel);
    window.addEventListener("doitwithai:studio-social-channel", onChannelEvent);
    return () => {
      window.removeEventListener("popstate", syncChannel);
      window.removeEventListener(
        "doitwithai:studio-social-channel",
        onChannelEvent,
      );
    };
  }, []);

  useEffect(() => {
    return subscribeStudioDrawer((action) => {
      // /studio/vault renders inline tools & playbooks directly inside its own workspace so tabs remain on screen.
      if (pathname === "/studio/vault" || pathname.startsWith("/studio/vault/")) {
        return;
      }
      if (action.type === "open-tool") {
        setInlineWorkspaceItem({
          type: "tool",
          slug: action.slug,
          title: action.title || action.slug.replace(/-/g, " "),
        });
      } else if (action.type === "open-playbook") {
        setInlineWorkspaceItem({
          type: "playbook",
          slug: action.slug,
          title: action.title,
          url: action.url,
          relatedTools: action.relatedTools,
        });
      }
    });
  }, [pathname]);

  const isAuthorized = Boolean(
    workspace?.user || studio.guestPassActive || runtime.unlimitedTesting,
  );
  const activeSite =
    studio.sites.find((s) => s.id === studio.activeSiteId) ||
    studio.sites[0] ||
    null;

  useEffect(() => {
    let cancelled = false;
    setSiteArticlesCount(countSavedArticlesForSite());
    const refreshArticlesCount = () => {
      void loadStudioArticleLibrary()
        .then((all) => {
          if (cancelled) return;
          setSiteArticlesCount(filterArticlesForSite(all, activeSite).length);
        })
        .catch(() => {});
    };
    refreshArticlesCount();
    window.addEventListener(STUDIO_ARTICLES_CHANGED_EVENT, refreshArticlesCount);
    return () => {
      cancelled = true;
      window.removeEventListener(
        STUDIO_ARTICLES_CHANGED_EVENT,
        refreshArticlesCount,
      );
    };
  }, [activeSite?.id, activeSite]);
  const maxArticles = ARTICLE_LIMITS[studio.planTier];
  const isHubOrOnboarding =
    pathname === "/studio" || pathname.startsWith("/studio/onboarding");

  const currentNavItem = SIDEBAR_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const showNavigation = hydrated && isAuthorized && !isHubOrOnboarding;
  const moduleTitle = currentNavItem?.label || (showNavigation ? "Studio" : undefined);

  useEffect(() => {
    const drawer = mobileNav.current;
    if (!drawer) return;
    if (mobileNavOpen && showNavigation && !drawer.open) drawer.showModal();
    else if ((!mobileNavOpen || !showNavigation) && drawer.open) drawer.close();
  }, [mobileNavOpen, showNavigation]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (media.matches) setMobileNavOpen(false); };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  const renderTopBar = () => (
    <StudioTopBar pathname={pathname} actions={showNavigation ? (
      <>
        <button
          type="button"
          className={styles.topAction}
          onClick={() => dispatchStudioDrawer({ type: "open-copilot" })}
          aria-label="Brand AI"
          title="Brand AI"
        >
          <Bot size={15} aria-hidden="true" />
          <span className={styles.actionLabel}>Brand AI</span>
        </button>
        {!isWriter && (
          <Link href="/studio/writer" aria-label="Write article" title="Write article" className={styles.topAction}>
            <FilePenLine size={15} aria-hidden="true" />
            <span className={styles.actionLabel}>Write Article</span>
          </Link>
        )}
      </>
    ) : undefined}>
      {showNavigation && (
        <>
          <button
            type="button"
            className={`${styles.topAction} ${styles.desktopNavToggle}`}
            aria-controls="studio-navigation"
            aria-expanded={!sidebarCollapsed}
            aria-label={sidebarCollapsed ? "Expand Studio navigation" : "Collapse Studio navigation"}
            title={sidebarCollapsed ? "Expand Studio navigation" : "Collapse Studio navigation"}
            onClick={() => setNavPreference({ writer: isWriter, collapsed: !sidebarCollapsed })}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={17} aria-hidden="true" /> : <PanelLeftClose size={17} aria-hidden="true" />}
          </button>
          <button
            type="button"
            className={`${styles.topAction} ${styles.mobileNavToggle}`}
            aria-controls="studio-mobile-navigation"
            aria-expanded={mobileNavOpen}
            aria-label="Open Studio navigation"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu size={18} aria-hidden="true" />
          </button>
        </>
      )}
      <div className={styles.breadcrumbs}>
        <Link href="/studio" className={`${styles.siteName} ${moduleTitle ? styles.siteWithModule : ""}`}
          title={showNavigation ? activeSite?.name || "Workspace" : "Studio"}>
          {showNavigation ? activeSite?.name || "Workspace" : "Studio"}
        </Link>
        {moduleTitle && <>
          <span className={styles.divider} aria-hidden="true">/</span>
          <span className={styles.moduleName} title={moduleTitle}>{moduleTitle}</span>
        </>}
        {showNavigation && activeSite && activeSite.sitemapUrls.length > 0 && (
          <span className={styles.syncCount}>{activeSite.sitemapUrls.length} URLs synced</span>
        )}
      </div>
    </StudioTopBar>
  );

  const renderStandalone = (content: ReactNode) => (
    <>
      {renderTopBar()}
      <div ref={workspaceScroll} data-studio-scroll className={styles.scrollArea}>{content}</div>
    </>
  );

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

  if (!hydrated || (!isAuthorized && !runtimeChecked)) {
    return renderStandalone(
      <div className="px-4 py-12">
        <div className="mx-auto max-w-6xl animate-pulse space-y-4">
          <div className="h-12 rounded-2xl bg-slate-200 dark:bg-slate-800/70" />
          <div className="h-96 rounded-2xl bg-slate-200/70 dark:bg-slate-900/80" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return renderStandalone(
      <div className="px-4 py-16">
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
    return renderStandalone(
      <RecentUrlsProvider>
        {children}
        <StudioGlobalDrawer activeSite={activeSite} />
      </RecentUrlsProvider>
    );
  }

  // LEVEL 2: CONNECTED WEBSITE LEFT-SIDEBAR SAAS DASHBOARD
  const renderSidebarContent = (compact: boolean) => (
    <div className={`flex h-full flex-col justify-between ${styles.navContents}`} data-compact={compact}>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {/* Top Hub Back-Link + Active Website Selector */}
        <div className="space-y-2.5">
          {!compact && (
            <Link href="/studio" prefetch={false}
              className="inline-flex items-center gap-1.5 px-1 text-xs font-semibold text-slate-500 hover:text-[#5271FF] dark:text-slate-400"
            >
              <ArrowLeft size={13} aria-hidden="true" />
              Workspace Hub
            </Link>
          )}

          {!compact &&
            (studio.sites.length > 0 ? (
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
            ))}
        </div>

        {/* 1. Brand Foundation & Content Workspace (Top Priority) */}
        <div className="space-y-1.5">
          {SIDEBAR_ITEMS.filter((i) => i.group === "brand").map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                onClick={() => setInlineWorkspaceItem(null)}
                title={compact ? item.label : undefined}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  compact ? "justify-center px-2" : ""
                } ${
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

          {SIDEBAR_ITEMS.filter((i) => i.group === "primary").map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                onClick={() => {
                  setInlineWorkspaceItem(null);
                  window.dispatchEvent(
                    new CustomEvent("doitwithai:studio-distribution-reset", {
                      detail: "/studio/writer",
                    }),
                  );
                }}
                title={compact ? item.label : undefined}
                className={`flex items-center rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                  compact ? "justify-center px-2" : "justify-between"
                } ${
                  active
                    ? "bg-[#5271FF] text-white shadow-sm shadow-[#5271FF]/25"
                    : "border border-[#5271FF]/25 bg-[#5271FF]/[0.07] text-[#4361EE] hover:bg-[#5271FF]/[0.14] dark:text-[#b4c2ff]"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Icon size={16} className="shrink-0" />
                  {!compact && <span className="truncate">{item.label}</span>}
                </span>
                {!compact && siteArticlesCount > 0 && (
                  <span
                    title={`${siteArticlesCount} saved article${siteArticlesCount === 1 ? "" : "s"}`}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-[#5271FF]/15 text-[#5271FF] dark:text-[#b4c2ff]"
                    }`}
                  >
                    {siteArticlesCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* 2. Content & Social Distribution Studios (Directly Below Content Writer) */}
        <div>
          {!compact && (
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Social &amp; Distribution
            </p>
          )}
          <nav aria-label="Social and Email studios" className="space-y-1">
            {SIDEBAR_ITEMS.filter((i) => i.group === "distribution").map(
              (item) => {
                const Icon = item.icon;
                const isEmail = item.href === "/studio/email";
                const emailBrand = getSocialBrandMeta("Email");
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <React.Fragment key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={false}
                      onClick={() => {
                        setInlineWorkspaceItem(null);
                        window.dispatchEvent(
                          new CustomEvent(
                            "doitwithai:studio-distribution-reset",
                            { detail: item.href },
                          ),
                        );
                      }}
                      title={compact ? item.label : undefined}
                      style={
                        isEmail && active
                          ? {
                              backgroundColor: emailBrand.tintBg,
                              borderColor: emailBrand.borderTint,
                            }
                          : undefined
                      }
                      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        compact ? "justify-center px-2" : ""
                      } ${
                        active
                          ? isEmail
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "border-transparent bg-slate-900 text-white dark:bg-slate-800 dark:text-white"
                          : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                      }`}
                    >
                      {isEmail ? (
                        <SocialBrandIcon channel="Email" size={15} />
                      ) : (
                        <Icon
                          size={15}
                          className={`shrink-0 ${
                            active ? "text-[#9aabff]" : "text-slate-400"
                          }`}
                        />
                      )}
                      {!compact && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>

                    {item.href === "/studio/social" && (
                      <div
                        className={
                          compact
                            ? "space-y-1 pt-0.5"
                            : "ml-3 space-y-0.5 border-l border-slate-200/80 pl-2 pt-0.5 pb-1 dark:border-slate-800"
                        }
                      >
                        {SOCIAL_PLATFORM_SUBLINKS.map((sub) => {
                          const brand = getSocialBrandMeta(sub.channel);
                          const subActive =
                            pathname === "/studio/social" &&
                            activeSocialChannel.toLowerCase() ===
                              sub.channel.toLowerCase();
                          return (
                            <Link
                              key={sub.channel}
                              href={`/studio/social?channel=${encodeURIComponent(sub.channel)}`}
                              prefetch={false}
                              title={compact ? sub.label : undefined}
                              onClick={() => {
                                setInlineWorkspaceItem(null);
                                setActiveSocialChannel(sub.channel);
                                window.dispatchEvent(
                                  new CustomEvent(
                                    "doitwithai:studio-distribution-reset",
                                    { detail: `/studio/social?channel=${sub.channel}` },
                                  ),
                                );
                              }}
                              style={
                                subActive
                                  ? {
                                      backgroundColor: brand.tintBg,
                                      borderColor: brand.borderTint,
                                    }
                                  : undefined
                              }
                              className={`flex items-center rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                                compact ? "justify-center px-1.5" : "justify-between"
                              } ${
                                subActive
                                  ? "text-slate-900 dark:text-white"
                                  : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-white"
                              }`}
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <SocialBrandIcon
                                  channel={sub.channel}
                                  size={14}
                                />
                                {!compact && (
                                  <span
                                    className="truncate"
                                    style={
                                      subActive ? { color: brand.color } : undefined
                                    }
                                  >
                                    {sub.label}
                                  </span>
                                )}
                              </span>
                              {!compact && subActive && (
                                <span
                                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                                  style={{ backgroundColor: brand.color }}
                                />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </React.Fragment>
                );
              },
            )}
          </nav>
        </div>

        {/* 3. SEO & Website Growth Pillars */}
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
                  onClick={() => setInlineWorkspaceItem(null)}
                  title={compact ? item.label : undefined}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    compact ? "justify-center px-2" : ""
                  } ${
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
                  onClick={() => setInlineWorkspaceItem(null)}
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
              onClick={() => {
                setMobileNavOpen(false);
                dispatchStudioDrawer({ type: "open-copilot" });
              }}
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
      {renderTopBar()}
      <div className={styles.body}>
        <aside id="studio-navigation" aria-label="Studio navigation" className={styles.desktopNav} data-collapsed={sidebarCollapsed}>
          {renderSidebarContent(sidebarCollapsed)}
        </aside>

        <dialog
          id="studio-mobile-navigation"
          ref={mobileNav}
          className={styles.mobileNav}
          aria-labelledby="studio-mobile-navigation-title"
          onClose={() => setMobileNavOpen(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget ||
              (event.target instanceof Element && event.target.closest("a[href]"))) setMobileNavOpen(false);
          }}
        >
          <div className={styles.mobileNavHeader}>
            <span id="studio-mobile-navigation-title">Studio navigation</span>
            <button type="button" className={styles.topAction} aria-label="Close Studio navigation" onClick={() => setMobileNavOpen(false)}>
              <X size={17} aria-hidden="true" />
            </button>
          </div>
          <div className={styles.mobileNavBody}>{renderSidebarContent(false)}</div>
        </dialog>

        <div ref={workspaceScroll} data-studio-scroll className={styles.scrollArea}>
          <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
              {inlineWorkspaceItem ? (
                <StudioInlineEmbedPanel
                  item={inlineWorkspaceItem}
                  activeSite={activeSite}
                  backLabel={`Back to ${currentNavItem?.label || "Dashboard"}`}
                  completedPlaybookSlugs={studio.completedPlaybookSlugs}
                  onBack={() => setInlineWorkspaceItem(null)}
                  onSwitchItem={(next) => setInlineWorkspaceItem(next)}
                />
              ) : (
                children
              )}
          </div>
        </div>
        <StudioGlobalDrawer activeSite={activeSite} />
      </div>
    </RecentUrlsProvider>
  );
}

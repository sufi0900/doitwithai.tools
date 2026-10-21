"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bookmark,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  FileCode2,
  KeyRound,
  LayoutGrid,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PenTool,
  Search,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { categories, tools, toolPath } from "../tool-catalog/catalog";
import { topics, getTopicMeta } from "../tool-catalog/discovery";
import { ToolActions } from "./ToolActions";
import { useWorkspace, type WorkspaceView } from "./WorkspaceProvider";
import "./workspace.css";

const TOPIC_ICONS: Record<string, typeof Search> = {
  "on-page": Search,
  technical: FileCode2,
  writing: PenTool,
  keywords: KeyRound,
  "ai-search": Sparkles,
  social: Share2,
};

export default function ToolsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const workspace = useWorkspace()!;

  const [navQuery, setNavQuery] = useState("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(topics.map((t) => [t.id, true])),
  );

  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const current = tools.find((t) => toolPath(t.slug) === pathname);
  const isCatalog = !current;
  const sidebarCollapsed = workspace.sidebarCollapsed;

  useEffect(() => {
    setMobileDrawerOpen(false);
    if (current) {
      workspace.visit(current.id);
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileDrawerOpen(false);
        triggerRef.current?.focus();
      }
      if (event.key === "Tab") {
        const elements = Array.from(
          drawerRef.current?.querySelectorAll<HTMLElement>(
            "a[href],button:not([disabled]),input:not([disabled])",
          ) || [],
        );
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = before;
      document.removeEventListener("keydown", handleKey);
    };
  }, [mobileDrawerOpen]);

  const handleViewSelect = (targetView: WorkspaceView) => {
    setMobileDrawerOpen(false);
    workspace.setActiveTopic("");
    workspace.selectView(targetView);
    const destination = `/tools#view=${targetView}`;
    if (pathname === "/tools") {
      window.history.replaceState(null, "", destination);
      const finder = document.getElementById("tool-finder-section");
      finder?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push(destination);
    }
  };

  const handleTopicFilter = (topicId: string) => {
    setMobileDrawerOpen(false);
    const nextTopic = workspace.activeTopic === topicId ? "" : topicId;
    workspace.setActiveTopic(nextTopic);
    workspace.selectView("all");
    if (pathname !== "/tools") {
      router.push("/tools");
    } else {
      const finder = document.getElementById("tool-finder-section");
      finder?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleSection = (topicId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [topicId]: !(prev[topicId] ?? true),
    }));
  };

  const trimmedQuery = navQuery.toLowerCase().trim();

  const renderNavigation = (isMobile = false) => (
    <div className="flex h-full flex-col">
      {/* Sidebar Top Header */}
      <div className="mb-4 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#5271FF] to-[#4361EE] text-white shadow-sm shadow-[#5271FF]/25">
            <Compass size={16} />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              Tools Hub
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {tools.length} free utilities
            </p>
          </div>
        </div>
        {isMobile ? (
          <button
            type="button"
            className="workspace-icon"
            aria-label="Close navigation"
            onClick={() => {
              setMobileDrawerOpen(false);
              triggerRef.current?.focus();
            }}
          >
            <X size={18} />
          </button>
        ) : (
          <button
            type="button"
            className="workspace-icon"
            title="Collapse sidebar"
            aria-label="Collapse tool navigation sidebar"
            onClick={() => workspace.setSidebarCollapsed(true)}
          >
            <PanelLeftClose size={17} />
          </button>
        )}
      </div>

      {/* Primary Workspace View Pills (All / Saved / Recent) */}
      <div className="mb-4 space-y-1 rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm dark:border-slate-800 dark:bg-[#161F30]/90">
        <button
          type="button"
          onClick={() => handleViewSelect("all")}
          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold transition ${
            isCatalog && workspace.view === "all" && !workspace.activeTopic
              ? "bg-gradient-to-r from-[#5271FF] to-[#4361EE] text-white shadow-sm shadow-[#5271FF]/25"
              : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70"
          }`}
        >
          <LayoutGrid size={15} className="shrink-0" />
          <span className="flex-1">All tools</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              isCatalog && workspace.view === "all" && !workspace.activeTopic
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {tools.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleViewSelect("saved")}
          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold transition ${
            isCatalog && workspace.view === "saved"
              ? "bg-gradient-to-r from-[#5271FF] to-[#4361EE] text-white shadow-sm shadow-[#5271FF]/25"
              : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70"
          }`}
        >
          <Bookmark size={15} className="shrink-0" />
          <span className="flex-1">Saved tools</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              isCatalog && workspace.view === "saved"
                ? "bg-white/20 text-white"
                : "bg-[#5271FF]/[0.15] text-[#4A6CF7] dark:text-[#AEBBFF]"
            }`}
          >
            {workspace.saved.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleViewSelect("recent")}
          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold transition ${
            isCatalog && workspace.view === "recent"
              ? "bg-gradient-to-r from-[#5271FF] to-[#4361EE] text-white shadow-sm shadow-[#5271FF]/25"
              : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70"
          }`}
        >
          <Clock size={15} className="shrink-0" />
          <span className="flex-1">Recently used</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              isCatalog && workspace.view === "recent"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {workspace.recent.length}
          </span>
        </button>
      </div>

      {/* Quick Sidebar Search */}
      <div className="relative mb-4">
        <Search
          aria-hidden="true"
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          aria-label="Find a tool in navigation"
          placeholder="Quick jump to tool…"
          value={navQuery}
          onChange={(event) => setNavQuery(event.target.value)}
          className="h-10 w-full rounded-xl border border-slate-200/90 bg-white/90 pl-9 pr-8 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#5271FF] focus:outline-none focus:ring-2 focus:ring-[#5271FF]/25 dark:border-slate-700/80 dark:bg-[#161F30] dark:text-slate-100"
        />
        {navQuery && (
          <button
            type="button"
            aria-label="Clear sidebar search"
            onClick={() => setNavQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Digital Marketing & SEO Category Tree */}
      <div className="mb-2 flex items-center justify-between px-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Categories & Disciplines
        </span>
        {workspace.activeTopic && (
          <button
            type="button"
            onClick={() => workspace.setActiveTopic("")}
            className="text-[11px] font-semibold text-[#5271FF] hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {topics.map((topic) => {
          const meta = getTopicMeta(topic.id, topic.name);
          const TopicIcon = TOPIC_ICONS[topic.id] || Sparkles;
          const items = tools.filter(
            (tool) =>
              tool.topics.includes(topic.id) &&
              (!trimmedQuery ||
                tool.name.toLowerCase().includes(trimmedQuery) ||
                tool.tags.some((t) => t.toLowerCase().includes(trimmedQuery))),
          );
          if (!items.length) return null;
          const isOpen = trimmedQuery ? true : (openSections[topic.id] ?? true);
          const isTopicSelected = workspace.activeTopic === topic.id;

          return (
            <div
              key={topic.id}
              className={`rounded-2xl border transition-colors ${
                isTopicSelected
                  ? "border-[#5271FF]/40 bg-[#5271FF]/[0.06] dark:border-[#5271FF]/40 dark:bg-[#5271FF]/[0.08]"
                  : "border-slate-200/70 bg-white/60 dark:border-slate-800/80 dark:bg-[#151D2C]/60"
              }`}
            >
              <div className="flex items-center justify-between gap-1 px-2.5 py-2">
                <button
                  type="button"
                  onClick={() => handleTopicFilter(topic.id)}
                  title={`Filter catalog by ${meta.shortName}`}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                      isTopicSelected
                        ? "bg-[#5271FF] text-white"
                        : "bg-[#5271FF]/10 text-[#4A6CF7] dark:bg-[#5271FF]/20 dark:text-[#93B4FF]"
                    }`}
                  >
                    <TopicIcon size={13} />
                  </span>
                  <span className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                    {meta.shortName}
                  </span>
                  <span className="ml-auto rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {items.length}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={
                    isOpen
                      ? `Collapse ${meta.shortName} tools`
                      : `Expand ${meta.shortName} tools`
                  }
                  aria-expanded={isOpen}
                  onClick={() => toggleSection(topic.id)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      isOpen ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </button>
              </div>

              {isOpen && (
                <div className="space-y-0.5 border-t border-slate-100 px-2 py-2 dark:border-slate-800/80">
                  {items.map((tool) => {
                    const isCurrent = current?.id === tool.id;
                    const isSaved = workspace.saved.includes(tool.id);
                    return (
                      <Link
                        key={tool.id}
                        prefetch={false}
                        href={toolPath(tool.slug)}
                        aria-current={isCurrent ? "page" : undefined}
                        onClick={() => setMobileDrawerOpen(false)}
                        className="workspace-nav-link"
                      >
                        <span
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            isCurrent
                              ? "bg-[#5271FF]"
                              : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {tool.name}
                        </span>
                        {isSaved && (
                          <Bookmark
                            size={12}
                            className="shrink-0 fill-[#5271FF] text-[#5271FF]"
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {trimmedQuery &&
          !tools.some(
            (tool) =>
              tool.name.toLowerCase().includes(trimmedQuery) ||
              tool.tags.some((t) => t.toLowerCase().includes(trimmedQuery)),
          ) && (
            <div
              role="status"
              className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400"
            >
              No matching tools for “{navQuery}”.
            </div>
          )}
      </div>

      {/* Category Hub Links Footer */}
      <div className="mt-4 border-t border-slate-200/80 pt-3 dark:border-slate-800">
        <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Hub Collections
        </p>
        <div className="flex flex-wrap gap-1.5">
          {categories
            .filter((category) =>
              tools.some((tool) => tool.categories.includes(category.slug)),
            )
            .map((category) => (
              <Link
                key={category.slug}
                href={`/tools/categories/${category.slug}`}
                onClick={() => setMobileDrawerOpen(false)}
                className="rounded-lg border border-slate-200/90 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-[#5271FF]/50 hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:text-[#93B4FF]"
              >
                {category.name}
              </Link>
            ))}
          <Link
            href="/tools/categories"
            onClick={() => setMobileDrawerOpen(false)}
            className="rounded-lg border border-dashed border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-[#5271FF]/50 hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-400"
          >
            All Categories →
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`tools-shell ${isCatalog ? "is-catalog" : "is-tool"} ${
        sidebarCollapsed ? "is-expanded" : ""
      }`}
    >
      {/* Desktop Collapsible Left Sidebar */}
      <aside className="workspace-sidebar" aria-label="Tool navigation">
        {renderNavigation(false)}
      </aside>

      <div className="workspace-body min-w-0">
        {/* Contextual Workspace Strip:
            - On mobile/tablet (<1024px) or when desktop sidebar is collapsed, shows the Sidebar Open button.
            - On individual tool pages (/tools/[slug]), shows breadcrumb + Save/Like + Expand toggle without duplicating the global header! */}
        <div
          className={`workspace-context-bar ${
            isCatalog && !sidebarCollapsed ? "workspace-hide-with-sidebar" : ""
          }`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2">
              {/* Mobile/Tablet Drawer Button (<1024px) */}
              <button
                ref={triggerRef}
                type="button"
                className="workspace-icon workspace-drawer-trigger"
                aria-label="Open tool navigation"
                aria-expanded={mobileDrawerOpen}
                onClick={() => setMobileDrawerOpen(true)}
              >
                <Menu size={18} />
                <span className="text-xs font-bold">Tools</span>
              </button>

              {/* Desktop Sidebar Expand Button (shown when sidebar is collapsed OR on tool pages) */}
              <button
                type="button"
                className="workspace-icon workspace-restore-sidebar"
                title="Open tools sidebar"
                aria-label="Restore tool navigation sidebar"
                onClick={() => workspace.setSidebarCollapsed(false)}
              >
                <PanelLeftOpen size={17} />
                <span className="text-xs font-bold">Tools Sidebar</span>
              </button>

              {current && (
                <nav
                  aria-label="Active tool breadcrumb"
                  className="flex min-w-0 items-center gap-1.5 text-xs font-semibold"
                >
                  <Link
                    href="/tools"
                    className="hidden text-slate-500 transition hover:text-[#5271FF] dark:text-slate-400 sm:inline"
                  >
                    All Tools
                  </Link>
                  <ChevronRight
                    size={14}
                    className="hidden shrink-0 text-slate-400 sm:inline"
                  />
                  <span className="truncate font-bold text-slate-800 dark:text-slate-100">
                    {current.name}
                  </span>
                </nav>
              )}
            </div>

            {current && (
              <div className="flex shrink-0 items-center gap-2">
                <ToolActions id={current.id} compact />
                <button
                  type="button"
                  className="workspace-icon workspace-focus-toggle"
                  title={
                    sidebarCollapsed
                      ? "Show tools sidebar"
                      : "Hide sidebar for focus view"
                  }
                  aria-label={
                    sidebarCollapsed ? "Restore navigation" : "Expand workspace"
                  }
                  aria-pressed={sidebarCollapsed}
                  onClick={() =>
                    workspace.setSidebarCollapsed(!sidebarCollapsed)
                  }
                >
                  {sidebarCollapsed ? (
                    <PanelLeftOpen size={16} />
                  ) : (
                    <PanelLeftClose size={16} />
                  )}
                  <span className="text-xs font-semibold">
                    {sidebarCollapsed ? "Show Sidebar" : "Focus View"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {children}
      </div>

      {/* Mobile & Tablet Slide-Over Navigation Drawer */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-[10050] bg-slate-950/60 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setMobileDrawerOpen(false);
              triggerRef.current?.focus();
            }
          }}
        >
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Tool navigation"
            className="h-full w-[min(330px,88vw)] overflow-y-auto border-r border-slate-200 bg-slate-50 p-4 text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-[#111827] dark:text-slate-100"
          >
            {renderNavigation(true)}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bookmark,
  ChevronDown,
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
import { topics, getTopicMeta, topicStyle } from "../tool-catalog/discovery";
import { ToolActions } from "./ToolActions";
import { useWorkspace, type WorkspaceView } from "./WorkspaceProvider";
import "./workspace.css";
import { RecentUrlSettings } from "../tool-ui/recent-urls/RecentUrlsProvider";

const TOPIC_ICONS: Record<string, typeof Search> = {
  "on-page": Search,
  technical: FileCode2,
  writing: PenTool,
  keywords: KeyRound,
  "ai-search": Sparkles,
  social: Share2,
};
const VIEWS = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "recent", label: "Recent", icon: Clock },
] as const;

export default function ToolsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname(),
    router = useRouter(),
    workspace = useWorkspace()!;
  const [query, setQuery] = useState(""),
    [drawerOpen, setDrawerOpen] = useState(false),
    [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const triggerRef = useRef<HTMLButtonElement>(null),
    drawerRef = useRef<HTMLDivElement>(null),
    restoreRef = useRef<HTMLButtonElement>(null),
    collapseRef = useRef<HTMLButtonElement>(null);
  const current = tools.find((tool) => toolPath(tool.slug) === pathname),
    isCatalog = !current;
  const collapsed = workspace.sidebarCollapsed;
  const trimmedQuery = query.toLowerCase().trim();
  useEffect(() => {
    setDrawerOpen(false);
    if (current) workspace.visit(current.id);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        triggerRef.current?.focus();
      }
      if (event.key === "Tab") {
        const elements = Array.from(
          drawerRef.current?.querySelectorAll<HTMLElement>(
            "a[href],button:not([disabled]),input:not([disabled]),summary",
          ) || [],
        );
        const first = elements[0],
          last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", key);
    };
  }, [drawerOpen]);
  function selectView(view: WorkspaceView) {
    workspace.setActiveTopic("");
    workspace.selectView(view);
    setDrawerOpen(false);
    if (pathname !== "/tools") router.push(`/tools#view=${view}`);
    else
      document
        .getElementById("tool-finder-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function selectTopic(id: string) {
    workspace.setActiveTopic(workspace.activeTopic === id ? "" : id);
    workspace.selectView("all");
    setDrawerOpen(false);
    if (pathname !== "/tools") router.push("/tools");
    else
      document
        .getElementById("tool-finder-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function collapse() {
    workspace.setSidebarCollapsed(true);
    requestAnimationFrame(() => restoreRef.current?.focus());
  }
  function restore() {
    workspace.setSidebarCollapsed(false);
    requestAnimationFrame(() => collapseRef.current?.focus());
  }
  const countFor = (view: WorkspaceView) =>
    view === "saved"
      ? workspace.saved.length
      : view === "recent"
        ? workspace.recent.length
        : tools.length;
  const renderNavigation = (mobile = false) => (
    <div className="workspace-navigation">
      <div className="workspace-nav-controls">
        <div className="workspace-nav-title">
          <span className="inline-flex items-center gap-2 text-sm font-bold">
            <Compass size={17} className="text-primary" />
            Tools{" "}
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {tools.length}
            </span>
          </span>
          <button
            type="button"
            ref={mobile ? undefined : collapseRef}
            className="workspace-nav-control"
            aria-label={
              mobile ? "Close navigation" : "Collapse tool navigation sidebar"
            }
            onClick={() => {
              if (mobile) {
                setDrawerOpen(false);
                triggerRef.current?.focus();
              } else collapse();
            }}
          >
            {mobile ? <X size={17} /> : <PanelLeftClose size={17} />}
          </button>
        </div>
        <div className="workspace-nav-tabs" aria-label="Tool views">
          {VIEWS.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              aria-label={`${label} tools`}
              aria-pressed={
                workspace.view === id && !workspace.activeTopic && isCatalog
              }
              onClick={() => selectView(id)}
            >
              <Icon size={13} />
              <span>{label}</span>
              <span className="workspace-tab-count">{countFor(id)}</span>
            </button>
          ))}
        </div>
        <div className="workspace-nav-search">
          <Search size={14} aria-hidden="true" />
          <input
            type="search"
            aria-label="Find a tool in navigation"
            placeholder="Find a tool…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear sidebar search"
              onClick={() => setQuery("")}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>
      <nav
        className="workspace-tool-list"
        aria-label={mobile ? "Browse tools" : "Browse tool categories"}
      >
        {topics.map((topic) => {
          const meta = getTopicMeta(topic.id, topic.name),
            Icon = TOPIC_ICONS[topic.id] || Sparkles;
          const items = tools.filter(
            (tool) =>
              tool.topics.includes(topic.id) &&
              (tool.id !== "on-page-ai-seo-analyzer" ||
                topic.id === "on-page") &&
              (!trimmedQuery ||
                [tool.name, ...tool.tags].some((text) =>
                  text.toLowerCase().includes(trimmedQuery),
                )),
          );
          if (!items.length) return null;
          const open = trimmedQuery ? true : openSections[topic.id] !== false;
          return (
            <section
              key={topic.id}
              className="workspace-topic-group"
              data-topic={topic.id}
              style={topicStyle(meta)}
            >
              <div className="workspace-topic-heading">
                <button
                  type="button"
                  className="workspace-topic-filter"
                  aria-pressed={workspace.activeTopic === topic.id}
                  title={`Show ${meta.shortName} tools`}
                  onClick={() => selectTopic(topic.id)}
                >
                  <Icon size={15} />
                  <span>{meta.shortName}</span>
                  <span className="workspace-topic-count">{items.length}</span>
                </button>
                <button
                  type="button"
                  className="workspace-topic-toggle"
                  aria-label={`${open ? "Collapse" : "Expand"} ${meta.shortName} tools`}
                  aria-expanded={open}
                  onClick={() =>
                    setOpenSections((old) => ({ ...old, [topic.id]: !open }))
                  }
                >
                  <ChevronDown size={15} className={open ? "" : "-rotate-90"} />
                </button>
              </div>
              {open && (
                <div className="workspace-topic-links">
                  {items.map((tool) => (
                    <Link
                      key={tool.id}
                      prefetch={false}
                      href={toolPath(tool.slug)}
                      aria-current={
                        current?.id === tool.id ? "page" : undefined
                      }
                      onClick={() => setDrawerOpen(false)}
                      className={`workspace-nav-link ${tool.id === "on-page-ai-seo-analyzer" ? "workspace-flagship-link" : ""}`}
                    >
                      <span className="workspace-tool-dot" aria-hidden="true" />
                      <span className="min-w-0 flex-1">{tool.name}</span>
                      {workspace.saved.includes(tool.id) && (
                        <Bookmark
                          size={12}
                          className="shrink-0"
                          aria-label="Saved"
                        />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          );
        })}
        {trimmedQuery &&
          !tools.some((tool) =>
            [tool.name, ...tool.tags].some((text) =>
              text.toLowerCase().includes(trimmedQuery),
            ),
          ) && (
            <p
              role="status"
              className="p-4 text-sm text-slate-500 dark:text-slate-400"
            >
              No matching tools. Try another name or tag.
            </p>
          )}
        <RecentUrlSettings />
        <details className="workspace-collections">
          <summary>Browse collections</summary>
          <div>
            {categories
              .filter((category) =>
                tools.some((tool) => tool.categories.includes(category.slug)),
              )
              .map((category) => (
                <Link
                  key={category.slug}
                  href={`/tools/categories/${category.slug}`}
                  onClick={() => setDrawerOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            <Link href="/tools/categories" onClick={() => setDrawerOpen(false)}>
              All categories
            </Link>
          </div>
        </details>
      </nav>
      {current && (
        <div className="workspace-nav-actions">
          <span className="workspace-current-name" title={current.name}>
            {current.name}
          </span>
          <ToolActions id={current.id} />
        </div>
      )}
    </div>
  );
  return (
    <div
      className={`tools-shell ${isCatalog ? "is-catalog" : "is-tool"} ${collapsed ? "is-expanded" : ""}`}
    >
      <aside className="workspace-sidebar" aria-label="Tool navigation">
        {renderNavigation()}
      </aside>
      <aside className="workspace-rail" aria-label="Collapsed tool navigation">
        <button
          ref={restoreRef}
          type="button"
          className="workspace-icon"
          aria-label="Restore tool navigation sidebar"
          title="Show tools"
          onClick={restore}
        >
          <PanelLeftOpen size={19} />
        </button>
        {VIEWS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className="workspace-icon"
            aria-label={`${label} tools`}
            title={`${label} tools`}
            onClick={() => selectView(id)}
          >
            <Icon size={18} />
          </button>
        ))}
        {current && <ToolActions id={current.id} compact />}
      </aside>
      <div className="workspace-body">{children}</div>
      <button
        ref={triggerRef}
        type="button"
        className="workspace-drawer-trigger"
        aria-label="Open tool navigation"
        aria-expanded={drawerOpen}
        onClick={() => setDrawerOpen(true)}
      >
        <Menu size={19} />
        <span>Tools</span>
      </button>
      {drawerOpen && (
        <div
          className="workspace-drawer-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDrawerOpen(false);
              triggerRef.current?.focus();
            }
          }}
        >
          <div
            ref={drawerRef}
            className="workspace-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Tool navigation"
          >
            {renderNavigation(true)}
          </div>
        </div>
      )}
    </div>
  );
}

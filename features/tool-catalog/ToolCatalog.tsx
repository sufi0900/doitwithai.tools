"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Clock,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { tools } from "./catalog";
import Link from "next/link";
import {
  useWorkspace,
  type WorkspaceView,
} from "../tools-workspace/WorkspaceProvider";
import { topics, matchesTopic, getTopicMeta } from "./discovery";
import ToolCard from "./ToolCard";
import { findTools } from "./catalog-core.mjs";

const FEATURED_SLUGS = [
  "on-page-ai-seo-analyzer",
  "blog-section-infographic-generator",
  "article-outline-generator",
  "meta-title-generator",
] as const;

function readHashView(): WorkspaceView | null {
  if (typeof window === "undefined") return null;
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return null;
  const p = new URLSearchParams(raw);
  const v = p.get("view");
  if (v === "saved" || v === "recent" || v === "all") return v;
  return null;
}

export default function ToolCatalog({ category }: { category?: string }) {
  const workspace = useWorkspace();
  const setWorkspaceView = workspace?.setView;
  const [localView, setLocalView] = useState<WorkspaceView>("all");
  const [localTopic, setLocalTopic] = useState("");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selected, setSelected] = useState(category || "all");
  const [sort, setSort] = useState("featured");

  const view: WorkspaceView = workspace ? workspace.view : localView;
  const topic = workspace ? workspace.activeTopic : localTopic;

  const updateView = (next: WorkspaceView) => {
    setLocalView(next);
    updateTopic("");
    workspace?.selectView(next);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#view=${next}`);
    }
  };

  const updateTopic = (next: string) => {
    setLocalTopic(next);
    workspace?.setActiveTopic(next);
  };

  useEffect(() => {
    const syncFromHash = () => {
      const parsed = readHashView();
      setLocalView(parsed || "all");
      setWorkspaceView?.(parsed || "all");
    };
    const handleCustomView = (event: Event) => {
      const detail = (event as CustomEvent<{ view?: WorkspaceView }>).detail;
      if (detail?.view) {
        setLocalView(detail.view);
        setQuery("");
        setSelected(category || "all");
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);
    window.addEventListener("tools:viewchange", handleCustomView);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
      window.removeEventListener("tools:viewchange", handleCustomView);
    };
  }, [category, setWorkspaceView]);

  const featuredTools = useMemo(
    () =>
      FEATURED_SLUGS.map((slug) => tools.find((t) => t.slug === slug)).filter(
        (t): t is NonNullable<typeof t> => Boolean(t),
      ),
    [],
  );

  const results = useMemo(
    () =>
      findTools(tools, { query: deferredQuery, category, selected, sort }).filter(
        (tool) =>
          matchesTopic(tool, topic) &&
          (view === "all" ||
            (view === "saved" ? workspace?.saved : workspace?.recent)?.includes(
              tool.id,
            )),
      ),
    [
      deferredQuery,
      selected,
      sort,
      category,
      topic,
      view,
      workspace?.saved,
      workspace?.recent,
    ],
  );

  const hasActiveFilters =
    Boolean(query.trim()) ||
    Boolean(topic) ||
    view !== "all" ||
    selected !== (category || "all");

  const resetAllFilters = () => {
    setQuery("");
    updateTopic("");
    updateView("all");
    setSelected(category || "all");
  };

  const activeTopicMeta = topic ? getTopicMeta(topic) : null;
  const showFeaturedRow =
    !topic && !query.trim() && view === "all" && !category;

  return (
    <section
      id="tool-finder-section"
      aria-label="Tool finder"
      className="scroll-mt-24"
    >
      {selected === "content-conversion" &&
        !tools.some((tool) =>
          tool.categories.includes("content-conversion"),
        ) && (
          <p className="mb-4 rounded-xl border border-orange-200 bg-[#5271ff]/10 p-4 text-sm leading-7 text-orange-900 dark:border-orange-300/25 dark:bg-orange-300/5 dark:text-orange-100">
            The Content Conversion collection is in preparation.{" "}
            <Link
              href="/tools/categories/content-conversion"
              className="font-bold underline"
            >
              View the planned formats
            </Link>
            .
          </p>
        )}

      {/* Mobile-only Workspace View Tabs (hidden on desktop where ToolsShell sidebar handles All/Saved/Recent) */}
      <div className="mb-3 flex flex-wrap items-center gap-2 lg:hidden">
        {(
          [
            ["all", "All tools", tools.length, LayoutGrid],
            ["saved", "Saved tools", workspace?.saved.length ?? 0, Bookmark],
            ["recent", "Recently used", workspace?.recent.length ?? 0, Clock],
          ] as const
        ).map(([id, label, count, Icon]) => {
          const isActive = view === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isActive}
              onClick={() => {
                if (id === "all") {
                  resetAllFilters();
                } else {
                  updateView(id);
                }
              }}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "border-[#5271FF] bg-[#5271FF] text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              }`}
            >
              <Icon size={14} className="shrink-0" />
              <span>{label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Unified 2-Row Control Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-4">
        {/* Row 1: Search Input + Sort Dropdown + Grid|List Toggle */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <label htmlFor="tool-search" className="sr-only">
              Search {tools.length} tools by task, keyword, or tag
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              id="tool-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${tools.length} tools by task, keyword, or tag…`}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#5271FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5271FF]/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:focus:bg-slate-950"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search query"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="tool-sort" className="sr-only">
              Sort by
            </label>
            <select
              id="tool-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-semibold text-slate-700 focus:border-[#5271FF] focus:outline-none focus:ring-2 focus:ring-[#5271FF]/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200"
            >
              <option value="featured">Sort: Featured first</option>
              <option value="recent">Sort: Recently added</option>
              <option value="name">Sort: Name A–Z</option>
            </select>

            <div
              className="inline-flex h-10 shrink-0 items-center rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-700 dark:bg-slate-800/80"
              role="group"
              aria-label="Catalog layout view"
            >
              <button
                type="button"
                aria-label="Grid view"
                aria-pressed={layout === "grid"}
                onClick={() => setLayout("grid")}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition ${
                  layout === "grid"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <LayoutGrid size={14} />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                aria-label="List view"
                aria-pressed={layout === "list"}
                onClick={() => setLayout("list")}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition ${
                  layout === "list"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <List size={14} />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Single Horizontal Scrollable Row of Clean Topic Filter Pills */}
        <div
          className="mt-3 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap border-t border-slate-100 pt-3 pb-0.5 dark:border-slate-800"
          role="group"
          aria-label="Topics"
        >
          <button
            type="button"
            aria-pressed={!topic}
            onClick={() => updateTopic("")}
            className={`workspace-topic-chip shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              !topic
                ? "border-[#5271FF] bg-[#5271FF] text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
            }`}
          >
            All
          </button>

          {topics.map((item) => {
            const meta = getTopicMeta(item.id, item.name);
            const isSelected = topic === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => updateTopic(isSelected ? "" : item.id)}
                className={`workspace-topic-chip shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? "border-[#5271FF] bg-[#5271FF] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
                }`}
              >
                {meta.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Tools Row (only on default All view with empty search) */}
      {showFeaturedRow && featuredTools.length > 0 && (
        <div className="mt-6" aria-labelledby="featured-tools-heading">
          <div className="mb-3 flex items-center justify-between gap-2 px-0.5">
            <h2
              id="featured-tools-heading"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Featured tools
            </h2>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            {featuredTools.map((tool) => (
              <ToolCard
                key={`featured-${tool.id}`}
                tool={tool}
                headingLevel={3}
                workspace
              />
            ))}
          </div>
        </div>
      )}

      {/* Results Status & Active Filter Bar */}
      <div className="my-4 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <p
          role="status"
          aria-live="polite"
          className="text-xs font-medium text-slate-500 dark:text-slate-400"
        >
          Showing{" "}
          <span className="font-bold text-slate-900 dark:text-white">
            {results.length}
          </span>{" "}
          {results.length === 1 ? "tool" : "tools"}
          {view === "saved"
            ? " in your saved collection"
            : view === "recent"
              ? " from your recent history"
              : activeTopicMeta
                ? ` in ${activeTopicMeta.shortName}`
                : ""}
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#4A6CF7] transition hover:border-[#5271FF]/50 hover:bg-[#5271FF]/5 dark:border-slate-700 dark:bg-slate-800 dark:text-[#AEBBFF]"
          >
            <RotateCcw size={12} />
            Reset filters
          </button>
        )}
      </div>

      {/* Tool Cards Grid / List */}
      <div
        className={
          layout === "grid"
            ? "grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid gap-2.5"
        }
      >
        {results.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            workspace
            list={layout === "list"}
          />
        ))}
      </div>

      {/* Empty State */}
      {!results.length && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center dark:border-slate-700 dark:bg-slate-900/60">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {view === "saved"
              ? "No saved tools yet"
              : view === "recent"
                ? "No recently used tools yet"
                : "No matching tools found"}
          </h2>
          <p className="mx-auto my-2.5 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
            {view === "saved"
              ? "Click the bookmark icon on any tool card to save your favorite SEO and content utilities here."
              : view === "recent"
                ? "Open any tool to automatically keep track of your recently used workflows here."
                : "Try a broader keyword (such as title, schema, sitemap, or readability) or clear your active filters."}
          </p>
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#5271FF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4361EE]"
            onClick={resetAllFilters}
          >
            <RotateCcw size={14} />
            {view !== "all" ? "Browse all tools" : "Reset filters"}
          </button>
        </div>
      )}

      <noscript>
        <p className="mt-5">
          Tool links are available above. Enable JavaScript to search, filter,
          and use interactive tools.
        </p>
      </noscript>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  ArrowRightLeft,
  Bookmark,
  Clock,
  FileCode2,
  Filter,
  KeyRound,
  LayoutGrid,
  List,
  PenTool,
  RotateCcw,
  Search,
  Share2,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { categories, tools } from "./catalog";
import Link from "next/link";
import {
  useWorkspace,
  type WorkspaceView,
} from "../tools-workspace/WorkspaceProvider";
import { topics, matchesTopic, getTopicMeta, topicStyle } from "./discovery";
import ToolCard from "./ToolCard";
import { findTools } from "./catalog-core.mjs";

const TOPIC_ICONS: Record<string, typeof Search> = {
  conversion: ArrowRightLeft,
  "on-page": Search,
  technical: FileCode2,
  writing: PenTool,
  keywords: KeyRound,
  "ai-search": Sparkles,
  social: Share2,
};

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
  const [tag, setTag] = useState("");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
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
        setTag("");
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

  const availableTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tool of tools) {
      if (!matchesTopic(tool, topic)) continue;
      if (category && !tool.categories.includes(category)) continue;
      if (selected !== "all" && !tool.categories.includes(selected)) continue;
      for (const t of tool.tags) {
        counts.set(t, (counts.get(t) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [topic, category, selected]);

  const results = useMemo(
    () =>
      findTools(tools, { query, category, selected, sort }).filter(
        (tool) =>
          matchesTopic(tool, topic) &&
          (!tag || tool.tags.includes(tag)) &&
          (view === "all" ||
            (view === "saved" ? workspace?.saved : workspace?.recent)?.includes(
              tool.id,
            )),
      ),
    [
      query,
      selected,
      sort,
      category,
      topic,
      tag,
      view,
      workspace?.saved,
      workspace?.recent,
    ],
  );

  const hasActiveFilters =
    Boolean(query.trim()) ||
    Boolean(topic) ||
    Boolean(tag) ||
    view !== "all" ||
    selected !== (category || "all");

  const resetAllFilters = () => {
    setQuery("");
    updateTopic("");
    setTag("");
    updateView("all");
    setSelected(category || "all");
  };

  const activeTopicMeta = topic ? getTopicMeta(topic) : null;

  return (
    <section
      id="tool-finder-section"
      aria-label="Tool finder"
      className="mt-6 scroll-mt-24"
    >
      {selected === "content-conversion" &&
        !tools.some((tool) =>
          tool.categories.includes("content-conversion"),
        ) && (
          <p className="mb-5 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm leading-7 text-orange-900 dark:border-orange-300/25 dark:bg-orange-300/5 dark:text-orange-100">
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
      {/* Unified Control Hub */}
      <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-[#161F30]/95 sm:p-6">
        {/* Top Row: Workspace View Tabs (All / Saved / Recent) + Layout Switcher */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ["all", "All tools", tools.length, LayoutGrid],
                [
                  "saved",
                  "Saved tools",
                  workspace?.saved.length ?? 0,
                  ChevronRight,
                  Bookmark,
                ],
                [
                  "recent",
                  "Recently used",
                  workspace?.recent.length ?? 0,
                  Clock,
                ],
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
                  className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition sm:text-sm ${
                    isActive
                      ? "border-[#5271FF] bg-gradient-to-r from-[#5271FF] to-[#4361EE] text-white shadow-md shadow-[#5271FF]/25"
                      : "border-slate-200/90 bg-slate-50/70 text-slate-700 hover:border-[#5271FF]/40 hover:bg-white dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-[#5271FF]/50"
                  }`}
                >
                  <Icon size={15} className="shrink-0" />
                  <span>{label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 xl:inline">
              {workspace?.user
                ? "Synced to your account"
                : "Bookmarks saved on this device"}
            </span>
            <div
              className="inline-flex rounded-xl border border-slate-200/90 bg-slate-100/80 p-1 dark:border-slate-700 dark:bg-slate-800/80"
              role="group"
              aria-label="Catalog layout view"
            >
              <button
                type="button"
                aria-label="Grid view"
                aria-pressed={layout === "grid"}
                onClick={() => setLayout("grid")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  layout === "grid"
                    ? "bg-white text-[#4A6CF7] shadow-sm dark:bg-[#1D283E] dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
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
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  layout === "list"
                    ? "bg-white text-[#4A6CF7] shadow-sm dark:bg-[#1D283E] dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <List size={14} />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Second Row: Search Input + Category Filter + Sort Selector */}
        <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1fr)_180px_170px]">
          <div>
            <label
              htmlFor="tool-search"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Search tools by task, keyword, or tag
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <input
                id="tool-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search e.g. meta title, schema, readability, GSC, sitemap…"
                className="h-11 w-full rounded-xl border border-slate-200/90 bg-slate-50/60 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#5271FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5271FF]/25 dark:border-slate-700 dark:bg-[#111827]/80 dark:text-white dark:focus:bg-[#111827]"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search query"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="tool-category"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Category
            </label>
            <select
              id="tool-category"
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200/90 bg-slate-50/60 px-3 text-sm font-medium text-slate-900 focus:border-[#5271FF] focus:outline-none focus:ring-2 focus:ring-[#5271FF]/25 dark:border-slate-700 dark:bg-[#111827]/80 dark:text-white"
            >
              {!category && <option value="all">All categories</option>}
              {categories
                .filter((item) => !category || item.slug === category)
                .map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="tool-sort"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Sort by
            </label>
            <select
              id="tool-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200/90 bg-slate-50/60 px-3 text-sm font-medium text-slate-900 focus:border-[#5271FF] focus:outline-none focus:ring-2 focus:ring-[#5271FF]/25 dark:border-slate-700 dark:bg-[#111827]/80 dark:text-white"
            >
              <option value="featured">Featured first</option>
              <option value="recent">Recently added</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>

        {/* Third Row: Scalable Digital Marketing & SEO Discipline Pills */}
        <div className="mt-5 border-t border-slate-200/70 pt-4 dark:border-slate-800/80">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Filter size={13} className="text-[#5271FF]" />
              Browse by workflow
            </span>
            {topic && (
              <button
                type="button"
                onClick={() => {
                  updateTopic("");
                  setTag("");
                }}
                className="text-xs font-semibold text-[#5271FF] hover:underline"
              >
                Show all disciplines
              </button>
            )}
          </div>

          <div
            className="flex flex-wrap items-center gap-2"
            aria-label="Topics"
          >
            <button
              type="button"
              aria-pressed={!topic}
              onClick={() => {
                updateTopic("");
                setTag("");
              }}
              className={`workspace-topic-chip inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                !topic
                  ? "border-[#5271FF] bg-[#5271FF]/[0.15] text-[#4A6CF7] dark:border-[#5271FF] dark:bg-[#5271FF]/25 dark:text-white"
                  : "border-slate-200/80 bg-slate-50/70 text-slate-600 hover:border-[#5271FF]/40 hover:text-slate-900 dark:border-slate-700/80 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <span>All topics</span>
              <span className="rounded-full bg-slate-200/80 px-1.5 py-0.5 text-[10px] text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                {tools.length}
              </span>
            </button>

            {topics.map((item) => {
              const meta = getTopicMeta(item.id, item.name);
              const TopicIcon = TOPIC_ICONS[item.id] || Sparkles;
              const count = tools.filter((t) =>
                t.topics.includes(item.id),
              ).length;
              const isSelected = topic === item.id;
              return (
                <button
                  key={item.id}
                  style={topicStyle(meta)}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    updateTopic(isSelected ? "" : item.id);
                    setTag("");
                  }}
                  className={`workspace-topic-chip inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                    isSelected
                      ? "border-[#5271FF] bg-[#5271FF]/[0.15] text-[#4A6CF7] shadow-sm dark:border-[#5271FF] dark:bg-[#5271FF]/25 dark:text-white"
                      : "border-slate-200/80 bg-slate-50/70 text-slate-700 hover:border-[#5271FF]/40 hover:text-slate-900 dark:border-slate-700/80 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:text-white"
                  }`}
                >
                  <TopicIcon size={14} className="opacity-90" />
                  <span>{meta.shortName}</span>
                  <span
                    data-topic-count
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      isSelected
                        ? "bg-[#5271FF] text-white"
                        : "bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Contextual Discipline Description Banner when a topic is active */}
          {activeTopicMeta && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#5271FF]/25 bg-[#5271FF]/[0.05] px-3.5 py-2.5 text-xs text-slate-700 dark:border-[#5271FF]/30 dark:bg-[#5271FF]/[0.1] dark:text-slate-200">
              <div>
                <strong className="font-bold text-[#4A6CF7] dark:text-[#AEBBFF]">
                  {activeTopicMeta.shortName}:
                </strong>{" "}
                {activeTopicMeta.description}
              </div>
            </div>
          )}

          {/* Fourth Row: Interactive Tag Chips + Accessible Select */}
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500">
              <Tag size={12} />
              Tags:
            </span>
            {availableTags.slice(0, 10).map((item) => {
              const isTagActive = tag === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  aria-pressed={isTagActive}
                  onClick={() => setTag(isTagActive ? "" : item.name)}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                    isTagActive
                      ? "border-[#5271FF] bg-[#5271FF] text-white"
                      : "border-slate-200/80 bg-white text-slate-600 hover:border-[#5271FF]/40 hover:text-[#4A6CF7] dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:text-[#93B4FF]"
                  }`}
                >
                  #{item.name}
                </button>
              );
            })}

            <label className="sr-only" htmlFor="tool-tag">
              Filter by tag
            </label>
            <select
              id="tool-tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="ml-auto h-8 max-w-full rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">All tags ({availableTags.length})</option>
              {availableTags.map((t) => (
                <option key={t.name} value={t.name}>
                  #{t.name} ({t.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Status & Active Filter Bar */}
      <div className="my-5 flex flex-wrap items-center justify-between gap-3 px-1">
        <p
          role="status"
          aria-live="polite"
          className="text-sm font-semibold text-slate-600 dark:text-slate-300"
        >
          Showing{" "}
          <span className="font-extrabold text-slate-900 dark:text-white">
            {results.length}
          </span>{" "}
          {results.length === 1 ? "tool" : "tools"}
          {view === "saved"
            ? " in your saved collection"
            : view === "recent"
              ? " from your recent history"
              : activeTopicMeta
                ? ` in ${activeTopicMeta.shortName}`
                : " available"}
          {tag ? ` tagged #${tag}` : ""}
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="shadow-2xs inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#4A6CF7] transition hover:border-[#5271FF]/50 hover:bg-[#5271FF]/5 dark:border-slate-700 dark:bg-slate-800 dark:text-[#AEBBFF]"
          >
            <RotateCcw size={13} />
            Reset all filters
          </button>
        )}
      </div>

      {/* Tool Cards Grid / List */}
      <div
        className={
          layout === "grid"
            ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            : "grid gap-3.5"
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
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center dark:border-slate-700 dark:bg-[#161F30]/60">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {view === "saved"
              ? "No saved tools yet"
              : view === "recent"
                ? "No recently used tools yet"
                : "No matching tools found"}
          </h2>
          <p className="mx-auto my-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
            {view === "saved"
              ? "Click the Save button on any tool card to bookmark your favorite SEO and content utilities here."
              : view === "recent"
                ? "Open any tool to automatically keep track of your recently used workflows here."
                : "Try a broader keyword (such as title, schema, sitemap, or readability) or clear your active category and tag filters."}
          </p>
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5271FF] to-[#4361EE] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#5271FF]/25 transition hover:opacity-95"
            onClick={resetAllFilters}
          >
            <RotateCcw size={15} />
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

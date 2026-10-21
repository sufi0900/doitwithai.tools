"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { categories, tools } from "./catalog";
import { useWorkspace } from "../tools-workspace/WorkspaceProvider";
import { topics, matchesTopic } from "./discovery";
import ToolCard from "./ToolCard";
import { findTools } from "./catalog-core.mjs";

export default function ToolCatalog({ category }: { category?: string }) {
  const workspace = useWorkspace();
  const [view, setView] = useState("all");
  const [topic, setTopic] = useState("");
  const [tag, setTag] = useState("");
  const [layout, setLayout] = useState("grid");
  useEffect(() => {
    const read = () => {
      const p = new URLSearchParams(location.hash.slice(1));
      setView(
        ["saved", "recent"].includes(p.get("view") || "")
          ? p.get("view")!
          : "all",
      );
    };
    read();
    addEventListener("hashchange", read);
    return () => removeEventListener("hashchange", read);
  }, []);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(category || "all");
  const [sort, setSort] = useState("featured");
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

  return (
    <section aria-label="Tool finder" className="mt-10">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {[
          ["all", "All tools"],
          ["saved", "Saved tools"],
          ["recent", "Recently used"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={view === id}
            onClick={() => {
              setView(id);
              history.replaceState(null, "", `#view=${id}`);
            }}
            className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold ${view === id ? "border-primary bg-primary text-white" : "border-slate-200 dark:border-slate-700"}`}
          >
            {label}
          </button>
        ))}
        <p className="ml-auto text-xs text-slate-500">
          {workspace?.user
            ? "Your personal workspace"
            : "Save tools on this device. Sign in to sync."}
        </p>
      </div>
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#1D2430] md:grid-cols-[1fr_auto_auto]">
        <div>
          <label
            htmlFor="tool-search"
            className="mb-2 block text-sm font-semibold"
          >
            Search tools
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-3 h-5 w-5 text-slate-400"
            />
            <input
              id="tool-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Title, URL, structured data..."
              className="w-full rounded-xl border border-slate-300 bg-transparent py-3 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="tool-category"
            className="mb-2 block text-sm font-semibold"
          >
            Category
          </label>
          <select
            id="tool-category"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-[#1D2430]"
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
            className="mb-2 block text-sm font-semibold"
          >
            Sort by
          </label>
          <select
            id="tool-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-[#1D2430]"
          >
            <option value="featured">Featured first</option>
            <option value="recent">Recently added</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Topics">
        <button
          aria-pressed={!topic}
          onClick={() => {
            setTopic("");
            setTag("");
          }}
          className="rounded-full border px-3 py-2 text-xs"
        >
          All topics
        </button>
        {topics.map((item) => (
          <button
            key={item.id}
            aria-pressed={topic === item.id}
            onClick={() => {
              setTopic(topic === item.id ? "" : item.id);
              setTag("");
            }}
            className={`rounded-full border px-3 py-2 text-xs ${topic === item.id ? "border-primary bg-blue-50 text-blue-700" : "dark:border-slate-600"}`}
          >
            {item.name}
          </button>
        ))}
        <label className="sr-only" htmlFor="tool-tag">
          Filter by tag
        </label>
        <select
          id="tool-tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="max-w-full rounded-full border bg-transparent px-3 py-2 text-xs"
        >
          <option value="">All tags</option>
          {Array.from(
            new Set(
              tools
                .filter((t) => matchesTopic(t, topic))
                .flatMap((t) => t.tags),
            ),
          )
            .sort()
            .map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
        </select>
        <button
          className="ml-auto rounded-full border px-3 py-2 text-xs"
          onClick={() => setLayout(layout === "grid" ? "list" : "grid")}
        >
          {layout === "grid" ? "List view" : "Grid view"}
        </button>
      </div>
      <p
        role="status"
        aria-live="polite"
        className="my-5 text-sm text-slate-600 dark:text-slate-300"
      >
        {results.length} {results.length === 1 ? "tool" : "tools"} available
      </p>
      <div
        className={
          layout === "grid"
            ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            : "grid gap-4"
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
      {!results.length && (
        <div className="rounded-2xl border border-dashed border-slate-400 p-10 text-center">
          <h2 className="text-xl font-bold">No matching tools</h2>
          <p className="my-3">
            {view === "saved"
              ? "Bookmark a tool to find it here."
              : view === "recent"
                ? "Open a tool to start your recent list."
                : "Try a broader term, such as title or URL."}
          </p>
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-white"
            onClick={() => {
              setQuery("");
              setTopic("");
              setTag("");
              setView("all");
              history.replaceState(null, "", "#view=all");
              setSelected(category || "all");
            }}
          >
            Reset filters
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

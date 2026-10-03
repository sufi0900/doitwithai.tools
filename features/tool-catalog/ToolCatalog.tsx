"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { categories, tools } from "./catalog";
import ToolCard from "./ToolCard";
import { findTools } from "./catalog-core.mjs";

export default function ToolCatalog({ category }: { category?: string }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(category || "all");
  const [sort, setSort] = useState("featured");
  const results = useMemo(
    () => findTools(tools, { query, category, selected, sort }),
    [query, selected, sort, category],
  );

  return (
    <section aria-label="Tool finder" className="mt-10">
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
      <p
        role="status"
        aria-live="polite"
        className="my-5 text-sm text-slate-600 dark:text-slate-300"
      >
        {results.length} {results.length === 1 ? "tool" : "tools"} available
      </p>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {results.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
      {!results.length && (
        <div className="rounded-2xl border border-dashed border-slate-400 p-10 text-center">
          <h2 className="text-xl font-bold">No matching tools</h2>
          <p className="my-3">Try a broader term, such as title or URL.</p>
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-white"
            onClick={() => {
              setQuery("");
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

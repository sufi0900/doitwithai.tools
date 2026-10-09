"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { categories, tools } from "@/features/tool-catalog/catalog";
import ToolCard from "@/features/tool-catalog/ToolCard";
import { homepage } from "./content";
export default function HomeToolFinder() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const active = categories.filter((c) =>
    tools.some((t) => t.categories.includes(c.slug)),
  );
  const searching = !!query.trim() || category !== "all";
  const matched = searching
    ? tools.filter(
        (t) =>
          (category === "all" || t.categories.includes(category)) &&
          `${t.name} ${t.description} ${t.tags.join(" ")}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      )
    : homepage.featuredToolSlugs
        .map((slug) => tools.find((t) => t.slug === slug))
        .filter(Boolean);
  return (
    <section
      id="featured-tools"
      aria-labelledby="home-tools-title"
      className="home-section bg-white dark:bg-[#111827]"
    >
      <div className="home-shell">
        <div className="home-section-head">
          <div>
            <p className="home-eyebrow">Built to help you do the work</p>
            <h2 id="home-tools-title" className="home-title">
              Find an AI tool for your next task
            </h2>
            <p className="home-description">
              Start with tools for SEO and content writing, then review and
              refine the results for your project.
            </p>
          </div>
          <Link className="home-text-link shrink-0" href="/tools">
            Browse all tools <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <label htmlFor="home-tool-search" className="sr-only">
              Search AI tools
            </label>
            <Search
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            />
            <input
              id="home-tool-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try titles, outlines, or readability"
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 outline-none focus:border-[#5271ff] focus:ring-2 focus:ring-[#5271ff]/25 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div
            role="group"
            aria-label="Filter tools by category"
            className="flex flex-wrap gap-2"
          >
            {[{ slug: "all", name: "All tools" }, ...active].map((c) => (
              <button
                key={c.slug}
                type="button"
                aria-pressed={category === c.slug}
                onClick={() => setCategory(c.slug)}
                className={`min-h-11 rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${category === c.slug ? "bg-[#5271ff] text-white" : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <p className="sr-only" role="status">
          {matched.length} tools shown
        </p>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {matched.map((t) => (
            <ToolCard key={t.id} tool={t} headingLevel={3} homepage />
          ))}
        </div>
        {!matched.length && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-600">
            <p className="text-slate-600 dark:text-slate-300">
              No tools match your search. Try another term or browse all tools.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="home-text-link mt-4"
            >
              Clear filters
            </button>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {active.map((c) => (
            <Link
              key={c.slug}
              href={`/tools/categories/${c.slug}`}
              className="home-text-link"
            >
              Explore {c.name.toLowerCase()} tools{" "}
              <ArrowRight aria-hidden className="h-3 w-3" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

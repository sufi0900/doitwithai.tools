"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { categories, tools, toolPath } from "./catalog";

export default function ToolCatalog({ category }: { category?: string }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(category || "all");
  const [sort, setSort] = useState("featured");
  const results = useMemo(() => {
    const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const matches = tools.filter((tool) => {
      const text = [tool.name, tool.description, ...tool.tags, ...tool.categories].join(" ").toLocaleLowerCase();
      return (!category || tool.categories.includes(category)) &&
        (selected === "all" || tool.categories.includes(selected)) && words.every((word) => text.includes(word));
    });
    return sort === "name" ? [...matches].sort((a, b) => a.name.localeCompare(b.name)) : matches;
  }, [query, selected, sort, category]);

  return (
    <section aria-label="Tool finder" className="mt-10">
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#1D2430] md:grid-cols-[1fr_auto_auto]">
        <div>
          <label htmlFor="tool-search" className="mb-2 block text-sm font-semibold">Search tools</label>
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input id="tool-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, URL, structured data…" className="w-full rounded-xl border border-slate-300 bg-transparent py-3 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600" />
          </div>
        </div>
        <div>
          <label htmlFor="tool-category" className="mb-2 block text-sm font-semibold">Category</label>
          <select id="tool-category" value={selected} onChange={(event) => setSelected(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-[#1D2430]">
            {!category && <option value="all">All categories</option>}
            {categories.filter((item) => !category || item.slug === category).map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="tool-sort" className="mb-2 block text-sm font-semibold">Sort by</label>
          <select id="tool-sort" value={sort} onChange={(event) => setSort(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-[#1D2430]">
            <option value="featured">Featured</option><option value="name">Name A–Z</option>
          </select>
        </div>
      </div>
      <p role="status" aria-live="polite" className="my-5 text-sm text-slate-600 dark:text-slate-300">{results.length} {results.length === 1 ? "tool" : "tools"} available</p>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {results.map((tool) => (
          <article key={tool.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-primary dark:border-slate-700 dark:bg-[#1D2430]">
            <div className="mb-6 flex items-center justify-between"><Sparkles aria-hidden="true" className="h-10 w-10 rounded-xl bg-primary/10 p-2 text-primary" /><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:text-blue-200">{tool.kind}</span></div>
            <h2 className="text-xl font-bold"><Link href={toolPath(tool.slug)} className="hover:text-primary">{tool.name}</Link></h2>
            <p className="mt-3 flex-1 text-sm leading-7 text-slate-600 dark:text-slate-300">{tool.description}</p>
            <div className="my-5 flex flex-wrap gap-2">{tool.tags.map((tag) => <span key={tag} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{tag}</span>)}</div>
            <Link href={toolPath(tool.slug)} className="inline-flex items-center gap-2 font-semibold text-primary dark:text-blue-200">Open tool <ArrowRight aria-hidden="true" className="h-4 w-4" /><span className="sr-only">: {tool.name}</span></Link>
          </article>
        ))}
      </div>
      {!results.length && <div className="rounded-2xl border border-dashed border-slate-400 p-10 text-center"><h2 className="text-xl font-bold">No matching tools</h2><p className="my-3">Try a broader term, such as title or URL.</p><button type="button" className="rounded-lg bg-primary px-4 py-2 text-white" onClick={() => { setQuery(""); setSelected(category || "all"); }}>Reset filters</button></div>}
      <noscript><p className="mt-5">Tool links are available above. Enable JavaScript to search, filter, and use interactive tools.</p></noscript>
    </section>
  );
}

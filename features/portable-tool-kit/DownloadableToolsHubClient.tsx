"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Code2,
  Download,
  ExternalLink,
  FileCode2,
  Laptop,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import { categories, tools, type CatalogTool } from "@/features/tool-catalog/catalog";
import {
  PortableToolModal,
  buildStandaloneHtmlCode,
} from "./PortableToolHeroBar";
import ToolRunOverlay, { paintToolFeedback } from "@/features/tool-ui/ToolRunOverlay";

export default function DownloadableToolsHubClient() {
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [globalBrand, setGlobalBrand] = useState("DoItWithAI.tools");
  const [globalAccent, setGlobalAccent] = useState("#3452D1");
  const [activeModalTool, setActiveModalTool] = useState<CatalogTool | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((t) => {
      if (t.slug === "downloadable-ai-tools") return false;
      const matchesCat =
        selectedCat === "all" || t.categories.includes(selectedCat);
      const matchesQuery =
        !q ||
        `${t.name} ${t.shortDescription} ${t.description} ${t.tags.join(" ")}`
          .toLowerCase()
          .includes(q);
      return matchesCat && matchesQuery;
    });
  }, [query, selectedCat]);

  async function quickDownloadHtml(tool: CatalogTool) {
    setBusy(true);
    await paintToolFeedback(460);
    const html = buildStandaloneHtmlCode(
      tool,
      tool.name,
      globalBrand,
      globalAccent,
      "dark",
    );
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tool.slug}-standalone.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setBusy(false);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <ToolRunOverlay
        active={busy}
        title="Compiling portable single-file HTML tool package"
        description="Bundling Tailwind UI, deterministic scoring engine, and optional BYOK Gemini support for offline PC & website use."
      />

      {/* Top Filter & Global Branding Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-7">
        <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
            <label
              htmlFor="portable-search"
              className="block text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]"
            >
              Search {filteredTools.length} Portable AI &amp; SEO Tools
            </label>
            <div className="relative mt-1.5">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="portable-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by tool name, task, or keyword (e.g., meta title, intent, schema)..."
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div className="lg:col-span-4">
            <label
              htmlFor="global-brand-input"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300"
            >
              Pre-Fill Your Website / Brand Label on Downloads
            </label>
            <input
              id="global-brand-input"
              type="text"
              value={globalBrand}
              onChange={(e) => setGlobalBrand(e.target.value)}
              placeholder="YourBrand.com"
              className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="lg:col-span-3">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Global Accent Color
            </label>
            <div className="mt-2 flex items-center gap-2">
              {["#3452D1", "#059669", "#7C3AED", "#D97706", "#E11D48"].map(
                (hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setGlobalAccent(hex)}
                    aria-label={`Select accent color ${hex}`}
                    className={`h-8 w-8 rounded-full border-2 transition ${
                      globalAccent === hex
                        ? "scale-110 border-slate-900 dark:border-white"
                        : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ),
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCat("all")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition ${
                selectedCat === "all"
                  ? "bg-[#3452d1] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              All Tools ({tools.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedCat(cat.slug)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition ${
                  selectedCat === cat.slug
                    ? "bg-[#3452d1] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <Link
            href="/do-it-ai"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3452d1] to-[#5271ff] px-4 py-2 text-xs font-extrabold text-white shadow"
          >
            <Sparkles size={14} />
            Open All Tools in Do It AI Dashboard →
          </Link>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTools.map((tool) => (
          <article
            key={tool.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#5271ff]/60 hover:shadow-md dark:border-slate-800 dark:bg-[#111A2E]"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-lg bg-[#3452d1]/10 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                  {tool.categories[0]?.replace(/-/g, " ") || "AI SEO"}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <Laptop size={12} />
                  HTML + React + Prompts
                </span>
              </div>

              <h3 className="mt-3 text-lg font-extrabold text-slate-900 dark:text-white">
                <Link
                  href={`/tools/${tool.slug}`}
                  className="hover:text-[#3452d1] dark:hover:text-[#9aabff]"
                >
                  {tool.name}
                </Link>
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {tool.shortDescription || tool.description}
              </p>
            </div>

            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800/80">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => void quickDownloadHtml(tool)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#3452d1] px-3 py-2 text-xs font-extrabold text-white transition hover:bg-[#4361ee]"
                >
                  <Download size={13} />
                  1-Click .HTML
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalTool(tool)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-800 transition hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <Code2 size={13} />
                  Customize &amp; TSX
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] font-bold">
                <Link
                  href={`/tools/${tool.slug}`}
                  className="inline-flex items-center gap-1 text-[#3452d1] hover:underline dark:text-[#9aabff]"
                >
                  Use Online Studio <ExternalLink size={11} />
                </Link>
                <Link
                  href={`/do-it-ai?tool=${tool.slug}`}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <Wand2 size={11} />
                  Run in Do It AI
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {activeModalTool && (
        <PortableToolModal
          tool={activeModalTool}
          open={Boolean(activeModalTool)}
          onClose={() => setActiveModalTool(null)}
        />
      )}
    </div>
  );
}

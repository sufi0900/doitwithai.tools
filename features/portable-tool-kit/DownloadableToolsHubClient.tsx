"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Code2,
  Download,
  ExternalLink,
  KeyRound,
  Laptop,
  Palette,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  categories,
  tools,
  type CatalogTool,
} from "@/features/tool-catalog/catalog";
import {
  ACCENT_PRESETS,
  PortableToolModal,
  buildStandaloneHtmlCode,
  buildUserManualMarkdown,
  doesToolUseAiApi,
} from "./PortableToolHeroBar";
import ToolRunOverlay, {
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";

function getMockupSampleForTool(tool: CatalogTool): {
  sampleInput: string;
  metricLabel: string;
  metricValue: string;
  barPercent: number;
} {
  const s = tool.slug;
  if (s.includes("meta-title")) {
    return {
      sampleInput: "How to Check Keyword Rankings in Google (4 Free Methods)",
      metricLabel: "SERP Pixel Meter",
      metricValue: "56 chars · 524px / 580px Safe",
      barPercent: 88,
    };
  }
  if (s.includes("meta-description")) {
    return {
      sampleInput: "Learn 4 accurate ways to check Google keyword rankings...",
      metricLabel: "Desktop & Mobile Fit",
      metricValue: "152 chars · 860px / 920px Safe",
      barPercent: 92,
    };
  }
  if (s.includes("schema") || s.includes("structured-data")) {
    return {
      sampleInput: '{"@context":"https://schema.org","@type":"Article"}',
      metricLabel: "JSON-LD Validation",
      metricValue: "100% Rich Result Valid",
      barPercent: 96,
    };
  }
  if (s.includes("local") || s.includes("gbp") || s.includes("nap")) {
    return {
      sampleInput: "Primary GBP Category + Service Area + LocalBusiness JSON-LD",
      metricLabel: "Map Pack Signal Score",
      metricValue: "94/100 Local Authority",
      barPercent: 94,
    };
  }
  if (s.includes("keyword") || s.includes("intent") || s.includes("cluster")) {
    return {
      sampleInput: "what to do after keyword research · check google rankings",
      metricLabel: "Intent & Cluster Match",
      metricValue: "Informational + Tool Cluster",
      barPercent: 90,
    };
  }
  return {
    sampleInput: `Input for ${tool.name.slice(0, 34)}...`,
    metricLabel: "E-E-A-T & Quality Score",
    metricValue: "95/100 Verified Output",
    barPercent: 91,
  };
}

export default function DownloadableToolsHubClient() {
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [globalBrand, setGlobalBrand] = useState("DoItWithAI.tools");
  const [globalAccent, setGlobalAccent] = useState("#3452D1");
  const [activeModalTool, setActiveModalTool] = useState<CatalogTool | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const customColorInputRef = useRef<HTMLInputElement>(null);

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

  async function quickDownloadHtml(tool: CatalogTool, includeManual = false) {
    setBusy(true);
    await paintToolFeedback(420);
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
    a.download = `${tool.slug}-app.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    if (includeManual) {
      const manual = buildUserManualMarkdown(tool, tool.name, globalBrand);
      setTimeout(() => {
        const mBlob = new Blob([manual], {
          type: "text/markdown;charset=utf-8",
        });
        const mUrl = URL.createObjectURL(mBlob);
        const mLink = document.createElement("a");
        mLink.href = mUrl;
        mLink.download = `USER-MANUAL-${tool.slug}.md`;
        mLink.click();
        setTimeout(() => URL.revokeObjectURL(mUrl), 1000);
      }, 300);
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <ToolRunOverlay
        active={busy}
        title="Compiling Unified Next.js + Local PC App Package"
        description="Bundling Full Next.js Studio view, Default DoItWithAI Cloud API connection, Personal BYOK API drawer, editable content canvas, and User Manual."
      />

      {/* Top Filter, Custom Color Picker & Global Branding Bar */}
      <div
        className="rounded-3xl border bg-white p-5 shadow-xl transition dark:bg-[#111A2E] sm:p-7"
        style={{ borderColor: `${globalAccent}55` }}
      >
        <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-4">
            <label
              htmlFor="portable-search"
              className="block text-xs font-extrabold uppercase tracking-wider"
              style={{ color: globalAccent }}
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
                placeholder="Search by tool name, task, or keyword..."
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <label
              htmlFor="global-brand-input"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300"
            >
              Pre-Fill Your Website / Brand Label
            </label>
            <input
              id="global-brand-input"
              type="text"
              value={globalBrand}
              onChange={(e) => setGlobalBrand(e.target.value)}
              placeholder="YourBrand.com"
              className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="lg:col-span-5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Global Accent Color (Live Card &amp; Download Theme)
              </label>
              <span
                className="rounded-md px-2 py-0.5 font-mono text-[11px] font-bold text-white"
                style={{ backgroundColor: globalAccent }}
              >
                {globalAccent}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setGlobalAccent(preset.hex)}
                  title={preset.label}
                  aria-label={`Select accent color ${preset.label}`}
                  className={`h-8 w-8 rounded-full border-2 transition ${
                    globalAccent.toLowerCase() === preset.hex.toLowerCase()
                      ? "scale-110 border-slate-900 ring-2 ring-offset-1 dark:border-white"
                      : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: preset.hex }}
                />
              ))}

              {/* Dedicated Custom Color Picker Panel Button */}
              <button
                type="button"
                onClick={() => customColorInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-800 shadow-sm transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-white"
              >
                <Palette size={14} style={{ color: globalAccent }} />
                <span>Custom Color</span>
              </button>
              <input
                ref={customColorInputRef}
                type="color"
                value={globalAccent}
                onChange={(e) => setGlobalAccent(e.target.value)}
                aria-label="Open custom color picker panel"
                className="sr-only"
              />
            </div>
          </div>
        </div>

        {/* API Policy Banner */}
        <div
          className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-4 py-2.5 text-xs"
          style={{
            borderColor: `${globalAccent}40`,
            backgroundColor: `${globalAccent}12`,
          }}
        >
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <KeyRound size={15} style={{ color: globalAccent }} />
            <span>
              <strong>Default API Included:</strong> Every downloaded tool uses
              our <strong>Default DoItWithAI Cloud API</strong> automatically
              when online, plus includes a{" "}
              <strong>User Manual &amp; BYOK Drawer</strong> (saving your own
              API key permanently removes the default API).
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCat("all")}
              style={
                selectedCat === "all"
                  ? { backgroundColor: globalAccent, color: "#FFFFFF" }
                  : undefined
              }
              className={`rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition ${
                selectedCat === "all"
                  ? "text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              All Tools ({tools.length - 1})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedCat(cat.slug)}
                style={
                  selectedCat === cat.slug
                    ? { backgroundColor: globalAccent, color: "#FFFFFF" }
                    : undefined
                }
                className={`rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition ${
                  selectedCat === cat.slug
                    ? "text-white shadow"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <Link
            href="/do-it-ai"
            style={{ backgroundColor: globalAccent }}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold text-white shadow transition hover:opacity-95"
          >
            <Sparkles size={14} />
            Open All Tools in Do It AI Dashboard →
          </Link>
        </div>
      </div>

      {/* Tools Grid with Live Interactive UI Mockups & Real-Time Theme Color Sync */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTools.map((tool) => {
          const usesAi = doesToolUseAiApi(tool.slug);
          const mockup = getMockupSampleForTool(tool);

          return (
            <article
              key={tool.id}
              className="group flex flex-col justify-between rounded-3xl border bg-white p-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-[#111A2E]"
              style={{
                borderColor: `${globalAccent}38`,
              }}
            >
              <div>
                {/* Top Category & Engine Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${globalAccent}18`,
                      color: globalAccent,
                    }}
                  >
                    {tool.categories[0]?.replace(/-/g, " ") || "AI SEO"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300 border border-emerald-500/25">
                    {usesAi
                      ? "🟢 Default AI + BYOK"
                      : "⚡ 100% Local Engine"}
                  </span>
                </div>

                {/* LIVE MINI UI MOCKUP PREVIEW (Dynamically Themed by globalAccent & globalBrand!) */}
                <div
                  onClick={() => setActiveModalTool(tool)}
                  className="mt-3.5 cursor-pointer overflow-hidden rounded-2xl border bg-[#0B1120] p-3 text-white shadow-inner transition group-hover:brightness-105"
                  style={{ borderColor: `${globalAccent}55` }}
                >
                  {/* Mockup Window Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-800/90 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500/80" />
                      <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                      <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                      <span className="ml-1 truncate text-[10px] font-bold text-slate-300">
                        {tool.slug}-app.html
                      </span>
                    </div>
                    <span
                      className="rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-white"
                      style={{ backgroundColor: globalAccent }}
                    >
                      {globalBrand.slice(0, 16)}
                    </span>
                  </div>

                  {/* Mockup Simulated Input & Live Meter */}
                  <div className="mt-2.5 space-y-2">
                    <div className="rounded-lg border border-slate-800 bg-slate-950/90 px-2.5 py-1.5 text-[10px] text-slate-300 truncate font-mono">
                      &gt; {mockup.sampleInput}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-slate-400">
                          {mockup.metricLabel}
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: globalAccent }}
                        >
                          {mockup.metricValue}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${mockup.barPercent}%`,
                            backgroundColor: globalAccent,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-0.5 text-[9px] text-slate-400">
                      <span>⚡ Full Next.js + Local Studio</span>
                      <span
                        className="font-bold underline"
                        style={{ color: globalAccent }}
                      >
                        Preview &amp; Edit →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tool Title & Description */}
                <h3 className="mt-3.5 text-lg font-extrabold text-slate-900 dark:text-white">
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="transition hover:underline"
                    style={{ textDecorationColor: globalAccent }}
                  >
                    {tool.name}
                  </Link>
                </h3>

                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-2">
                  {tool.shortDescription || tool.description}
                </p>
              </div>

              {/* Action Buttons (Themed by globalAccent!) */}
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-3.5 dark:border-slate-800/80">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => void quickDownloadHtml(tool, true)}
                    style={{ backgroundColor: globalAccent }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-extrabold text-white shadow transition hover:opacity-95"
                  >
                    <Download size={13} />
                    App + Manual
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalTool(tool)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-extrabold text-slate-800 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-white"
                  >
                    <Code2 size={13} style={{ color: globalAccent }} />
                    Edit &amp; Embed
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] font-bold">
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="inline-flex items-center gap-1 hover:underline"
                    style={{ color: globalAccent }}
                  >
                    Open Online Studio <ExternalLink size={11} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setActiveModalTool(tool)}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    <BookOpen size={11} />
                    Read Manual
                  </button>
                  <Link
                    href={`/do-it-ai?tool=${tool.slug}`}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    <Wand2 size={11} />
                    Do It AI
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {activeModalTool && (
        <PortableToolModal
          tool={activeModalTool}
          open={Boolean(activeModalTool)}
          onClose={() => setActiveModalTool(null)}
          initialAccent={globalAccent}
          initialBrand={globalBrand}
        />
      )}
    </div>
  );
}

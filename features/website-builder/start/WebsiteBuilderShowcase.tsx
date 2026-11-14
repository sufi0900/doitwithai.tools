"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  FileText,
  Globe2,
  Layers,
  Mic,
  Palette,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  DEFAULT_WEBSITE_TEMPLATE_ID,
  getTemplatesByCategory,
  UNIFIED_WEBSITE_TEMPLATES,
  type WebsiteTemplateCategory,
} from "@/features/website-builder/ecosystem-bridge";

const CATEGORY_TABS: Array<{
  id: "all" | WebsiteTemplateCategory;
  label: string;
  blurb: string;
}> = [
  {
    id: "all",
    label: `All Templates (${UNIFIED_WEBSITE_TEMPLATES.length})`,
    blurb: "Complete 2D editorial & 3D WebGL library",
  },
  {
    id: "blog-editorial",
    label: "Blogging & SEO Media",
    blurb: "Content-first hubs built for AI Content Writer sync",
  },
  {
    id: "personal-brand",
    label: "Personal Brand & Creator",
    blurb: "Authority hubs for founders, consultants & studios",
  },
  {
    id: "startup-saas",
    label: "Startup & SaaS Product",
    blurb: "Landing pages, documentation & product launches",
  },
  {
    id: "interactive-3d-portfolio",
    label: "3D Interactive & Spatial",
    blurb: "WebGL signature scenes & tactile spatial stages",
  },
];

const ACCENT_HEX: Record<string, string> = {
  indigo: "#6366f1",
  blue: "#38bdf8",
  olive: "#84a98c",
  coral: "#f97316",
  violet: "#8b5cf6",
  cyan: "#22d3ee",
  rose: "#fb7185",
  amber: "#fbbf24",
  teal: "#2dd4bf",
  emerald: "#34d399",
  slate: "#94a3b8",
};

export default function WebsiteBuilderShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | WebsiteTemplateCategory
  >("all");

  const visibleTemplates = useMemo(() => {
    if (selectedCategory === "all") return UNIFIED_WEBSITE_TEMPLATES;
    return getTemplatesByCategory(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="bg-[#050816] text-slate-100">
      <section className="relative overflow-hidden border-b border-indigo-500/20 bg-[radial-gradient(circle_at_15%_15%,rgba(99,102,241,0.22),transparent_42%),radial-gradient(circle_at_85%_20%,rgba(56,189,248,0.16),transparent_40%),#050816] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-200">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span>
              Flagship AI Website Builder · {UNIFIED_WEBSITE_TEMPLATES.length}{" "}
              Curated 2D &amp; 3D Templates · Connected to AI Content Writer
            </span>
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Build Authority Blogs, SaaS Sites &amp; 3D Websites with{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-cyan-200 bg-clip-text text-transparent">
              Do It AI Agent
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Launch a governed website in seconds via live voice interview or
            pick from {UNIFIED_WEBSITE_TEMPLATES.length} flagship templates —
            including{" "}
            <strong className="text-white">DoItWithAI Editorial Flagship</strong>{" "}
            as default. Edit sections, publish instant clean{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-sky-200">
              /p/[slug]
            </code>{" "}
            sites, activate Visitor AI Agent Q&amp;A, and push articles straight
            from{" "}
            <Link
              href="/ai-content-writer"
              className="font-semibold text-sky-300 underline decoration-sky-400/40 underline-offset-4 hover:text-sky-200"
            >
              AI Content Writer
            </Link>{" "}
            in one click.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/ai-website-builder/start"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
            >
              <Wand2 className="h-4 w-4" />
              <span>Create Your Website Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/ai-website-builder/studio/demo"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-3.5 text-sm font-semibold text-white transition hover:border-indigo-400/50 hover:bg-slate-800"
            >
              <Globe2 className="h-4 w-4 text-sky-400" />
              <span>Try Interactive Studio Demo</span>
            </Link>

            <Link
              href="/do-it-ai"
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-950/50 px-5 py-3.5 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-900/60"
            >
              <Layers className="h-4 w-4 text-indigo-300" />
              <span>Open Unified /do-it-ai Workspace</span>
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-4">
              <Mic className="h-5 w-5 text-sky-400" />
              <h2 className="mt-2 text-sm font-bold text-white">
                Do It AI Agent Voice Studio
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Governed real-time voice editing, scene switching, undo/redo,
                and direct Writer Studio handoff.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-4">
              <FileText className="h-5 w-5 text-indigo-400" />
              <h2 className="mt-2 text-sm font-bold text-white">
                Writer-to-Website Bridge
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Publish articles written in AI Content Writer straight into your
                website blog with zero copy-paste.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-4">
              <Palette className="h-5 w-5 text-emerald-400" />
              <h2 className="mt-2 text-sm font-bold text-white">
                2D Editorial &amp; 3D WebGL Modes
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Choose ultra-fast 2D editorial layouts for SEO or GPU 3D spatial
                scenes powered by Three.js.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-4">
              <Bot className="h-5 w-5 text-cyan-300" />
              <h2 className="mt-2 text-sm font-bold text-white">
                Visitor AI Agent &amp; Shares
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Ground an interactive visitor Q&amp;A assistant on your own
                published documents and private opportunity links.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">
              16 Purpose-Built Architectures
            </p>
            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              Explore Templates Across 4 Categories
            </h2>
          </div>
          <Link
            href="/ai-website-builder/claim"
            className="text-xs font-semibold text-sky-300 underline-offset-4 hover:underline"
          >
            Built something in the demo? Claim your local draft →
          </Link>
        </div>

        <div
          className="mt-6 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Website template categories"
        >
          {CATEGORY_TABS.map((tab) => {
            const active = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(tab.id)}
                className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                  active
                    ? "border-indigo-400 bg-indigo-500/25 text-white"
                    : "border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTemplates.map((template) => {
            const accentHex =
              ACCENT_HEX[template.presentation.accent] ?? "#6366f1";
            const isDefault = template.id === DEFAULT_WEBSITE_TEMPLATE_ID;
            return (
              <article
                key={template.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/75 p-5 transition hover:border-indigo-400/50"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-950/70 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: accentHex }}
                      />
                      {template.categoryLabel}
                    </span>
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-sky-300">
                      {template.mode === "3d" ? "3D WebGL" : "2D Editorial"}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      {template.name}
                    </h3>
                    {isDefault && (
                      <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                        Default Flagship
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    {template.description}
                  </p>

                  <dl className="mt-4 space-y-1.5 border-t border-slate-800 pt-3 text-[11px]">
                    <div>
                      <dt className="inline font-semibold text-slate-400">
                        Best for:{" "}
                      </dt>
                      <dd className="inline text-slate-300">
                        {template.audience}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold text-slate-400">
                        SEO Edge:{" "}
                      </dt>
                      <dd className="inline text-sky-200/90">
                        {template.seoUseCase}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-slate-800 pt-4">
                  <Link
                    href={`/ai-website-builder/start?template=${template.id}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-400"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/ai-website-builder/studio/demo"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
                  >
                    Live Demo
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

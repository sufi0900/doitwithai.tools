"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  Download,
  KeyRound,
  Layers,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";

const PROMPT_SUGGESTIONS = [
  {
    icon: "⚡",
    label: "Audit on-page SEO & schema",
    prompt:
      "Audit on-page SEO, heading hierarchy, and JSON-LD schema for how to check google keyword rankings",
  },
  {
    icon: "🎯",
    label: "Generate 6 high-CTR meta titles",
    prompt:
      "Generate 6 high-CTR meta titles and descriptions for my targeted article",
  },
  {
    icon: "🗺️",
    label: "10-Step post-keyword research plan",
    prompt:
      "What should I do after keyword research? Give me the complete 10-step execution playbook",
  },
  {
    icon: "📍",
    label: "Local SEO & Google Business Profile",
    prompt:
      "How can I rank in Google Map Pack and optimize Google Business Profile category & description?",
  },
  {
    icon: "📦",
    label: "Download portable offline tools",
    prompt:
      "How can I download and run 90+ portable AI SEO tools on my PC with zero installation?",
  },
];

export default function HomeDoItAiSection() {
  const router = useRouter();
  const [promptInput, setPromptInput] = useState("");

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = promptInput.trim();
    if (query) {
      router.push(`/do-it-ai?prompt=${encodeURIComponent(query)}`);
    } else {
      router.push("/do-it-ai");
    }
  };

  const handleSelectSuggestion = (prompt: string) => {
    router.push(`/do-it-ai?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <section
      id="do-it-ai-hub"
      aria-labelledby="do-it-ai-title"
      className="home-section bg-slate-50/80 dark:bg-[#0D1527]"
    >
      <div className="home-shell">
        <div className="home-section-head">
          <div>
            <p className="home-eyebrow inline-flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#5271ff]" />
              <span>Flagship AI Workspace · Do It With AI</span>
            </p>
            <h2 id="do-it-ai-title" className="home-title">
              Put AI to work with Do It AI — one agent connected to 90+ SEO engines
            </h2>
            <p className="home-description">
              Instead of guessing prompts in generic chatbots, run live 36-factor
              URL audits, validate SERP pixel widths, cluster keyword lists, and
              launch interactive SEO tools inside a single unified workspace.
            </p>
          </div>
          <Link className="home-text-link shrink-0" href="/what-our-ai-tool-can-do">
            See what our AI tool can do{" "}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>

        {/* Interactive Prompt Launcher Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111827] sm:p-7">
          <form onSubmit={handleLaunch} className="relative">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Ask Do It AI: Audit a webpage URL, write pixel-checked meta titles, cluster keywords, or build JSON-LD schema..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-[#5271FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5271FF]/25 dark:border-slate-700/80 dark:bg-[#0B1120] dark:text-white dark:placeholder-slate-400 dark:focus:bg-[#0B1120]"
                />
              </div>
              <button
                type="submit"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5271FF] to-[#4361EE] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#5271FF]/25 transition hover:opacity-95 active:scale-95"
              >
                <Wand2 size={16} />
                <span>Launch in Do It AI</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </form>

          {/* Instant Starter Prompts */}
          <div className="mt-4 border-t border-slate-200/80 pt-4 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Try a one-click SEO workflow in Do It AI:
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {PROMPT_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item.prompt)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#5271FF] hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:border-[#5271FF] dark:hover:text-[#9aabff]"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 transition hover:border-[#5271FF]/50 dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5271FF]/10 text-[#5271FF] dark:bg-[#5271FF]/20">
              <Layers size={20} />
            </div>
            <h3 className="mt-3.5 text-base font-bold text-slate-900 dark:text-white">
              90+ Deterministic Engines
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Wired directly into real calculators for SERP pixel widths,
              Schema.org JSON-LD validation, heading hierarchies, and keyword
              clustering.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 transition hover:border-[#5271FF]/50 dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5271FF]/10 text-[#5271FF] dark:bg-[#5271FF]/20">
              <Bot size={20} />
            </div>
            <h3 className="mt-3.5 text-base font-bold text-slate-900 dark:text-white">
              AI Search (AEO &amp; GEO) Ready
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Structures content with clear answer blocks, factual evidence, and
              entity markup to earn citations in Perplexity, ChatGPT, and Google
              AI Overviews.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 transition hover:border-[#5271FF]/50 dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5271FF]/10 text-[#5271FF] dark:bg-[#5271FF]/20">
              <Download size={20} />
            </div>
            <h3 className="mt-3.5 text-base font-bold text-slate-900 dark:text-white">
              Portable PC &amp; Embed Apps
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Export any tool as a standalone HTML/React app to run offline on
              your computer or embed directly inside WordPress, Webflow, or
              Shopify.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 transition hover:border-[#5271FF]/50 dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5271FF]/10 text-[#5271FF] dark:bg-[#5271FF]/20">
              <KeyRound size={20} />
            </div>
            <h3 className="mt-3.5 text-base font-bold text-slate-900 dark:text-white">
              Default Cloud + BYOK Privacy
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Works out-of-the-box with our cloud API, or connect your personal
              Gemini/OpenAI key for 100% private client-side execution.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
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
    prompt: "Audit on-page SEO, heading hierarchy, and JSON-LD schema for how to check google keyword rankings",
  },
  {
    icon: "🎯",
    label: "Generate 6 high-CTR meta titles",
    prompt: "Generate 6 high-CTR meta titles and descriptions for my targeted article",
  },
  {
    icon: "🗺️",
    label: "10-Step post-keyword research plan",
    prompt: "What should I do after keyword research? Give me the complete 10-step execution playbook",
  },
  {
    icon: "📍",
    label: "Local SEO & Google Business Profile",
    prompt: "How can I rank in Google Map Pack and optimize Google Business Profile category & description?",
  },
  {
    icon: "📦",
    label: "Download portable offline tools",
    prompt: "How can I download and run 90+ portable AI SEO tools on my PC with zero installation?",
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
      className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-[#0B132B] to-slate-950 py-20 text-white"
    >
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[900px] rounded-full bg-[#5271FF]/20 blur-[140px]" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-[400px] w-[500px] rounded-full bg-indigo-500/10 blur-[130px]" />

      <div className="home-shell relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5271FF]/40 bg-[#5271FF]/15 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#9aabff] shadow-sm">
            <Sparkles size={14} className="text-[#5271FF]" />
            <span>Flagship AI Workspace · Do It With AI</span>
          </div>

          <h2
            id="do-it-ai-title"
            className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-tight"
          >
            Don&apos;t Just Chat With AI —{" "}
            <span className="bg-gradient-to-r from-[#5271FF] via-[#7B96FF] to-cyan-400 bg-clip-text text-transparent">
              Put AI to Work with Do It AI
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Why settle for generic, hallucinated AI answers? <strong>Do It AI</strong> is
            our brand-flagship agent wired directly to <strong>90+ specialized SEO, content, and schema engines</strong>.
            Audit URLs in real-time, generate SERP-validated meta tags, cluster keyword lists, or mount full portable tools right inside your chat workspace.
          </p>
        </div>

        {/* Interactive Prompt Launcher Box */}
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-[#5271FF]/30 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
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
                  placeholder="Ask Do It AI: e.g. Audit my on-page SEO, generate meta descriptions, cluster keywords..."
                  className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/80 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-400 shadow-inner focus:border-[#5271FF] focus:outline-none focus:ring-2 focus:ring-[#5271FF]/30"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5271FF] to-[#3452D1] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#5271FF]/30 transition hover:opacity-95 hover:shadow-[#5271FF]/50 active:scale-95 shrink-0"
              >
                <Wand2 size={16} />
                <span>Launch in Do It AI →</span>
              </button>
            </div>
          </form>

          {/* Prompt Starter Pills */}
          <div className="mt-4 pt-3.5 border-t border-slate-800">
            <p className="text-xs font-bold text-slate-400">
              💡 Or click any popular SEO &amp; content prompt to run instantly:
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {PROMPT_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item.prompt)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-[#5271FF] hover:bg-[#5271FF]/10 hover:text-white"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Feature Pillars of Do It AI */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 transition hover:border-[#5271FF]/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5271FF]/15 text-[#5271FF]">
              <Layers size={20} />
            </div>
            <h3 className="mt-3.5 text-base font-bold text-white">
              90+ Special Engines
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              No need to prompt LLMs from scratch. Do It AI executes real algorithms for SERP pixel limits, JSON-LD schema, and keyword clustering.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 transition hover:border-[#5271FF]/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <Bot size={20} />
            </div>
            <h3 className="mt-3.5 text-base font-bold text-white">
              GEO &amp; AEO Optimization
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Optimized for Perplexity, ChatGPT, and Google SGE citations. Structures answers to win AI visibility and featured snippets.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 transition hover:border-[#5271FF]/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
              <Download size={20} />
            </div>
            <h3 className="mt-3.5 text-base font-bold text-white">
              Export Portable Tool Apps
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Ask Do It AI to generate or download standalone HTML/React versions of any tool to run on your PC or embed on your website.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 transition hover:border-[#5271FF]/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <KeyRound size={20} />
            </div>
            <h3 className="mt-3.5 text-base font-bold text-white">
              Default Cloud + BYOK Privacy
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Works instantly with our default cloud API, or plug in your own Gemini/OpenAI key for permanent local privacy.
            </p>
          </div>
        </div>

        {/* Section Bottom Links */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/do-it-ai"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#5271FF] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#5271FF]/25 transition hover:bg-[#4361EE]"
          >
            <span>Open Do It AI Full Workspace</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/what-our-ai-tool-can-do"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-6 py-3 text-sm font-bold text-slate-200 transition hover:border-slate-500 hover:text-white"
          >
            <span>Read: What Our AI Tool Can Do →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

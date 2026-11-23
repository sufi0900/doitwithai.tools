"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Laptop,
  Sparkles,
} from "lucide-react";

export default function HomePortableToolsSection() {
  return (
    <section
      id="portable-tools-showcase"
      aria-labelledby="portable-tools-title"
      className="home-section bg-white pt-4 dark:bg-[#111827]"
    >
      <div className="home-shell">
        <div className="rounded-3xl border border-slate-200/90 bg-slate-50/80 p-6 shadow-lg dark:border-slate-800 dark:bg-[#161F30] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <p className="home-eyebrow inline-flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#5271ff]" />
                <span>Zero Terminal Commands · Standalone Web Apps</span>
              </p>

              <h2
                id="portable-tools-title"
                className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl"
              >
                Download &amp; Run 90+ AI SEO Tools Locally on Your PC or Embed on Your Site
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Every tool in our catalog is packaged as a{" "}
                <strong>100% portable standalone web application</strong>.
                Download a 1-click unified <code>.ZIP</code> bundle,
                double-click <code>Run-Tool.html</code>, and run full audits,
                metadata studios, and schema generators directly in your
                browser.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-[#5271FF]"
                  />
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    <strong>Zero Installation:</strong> No Node.js, npm, or
                    Python required. Opens immediately in Chrome, Edge, or
                    Safari.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-[#5271FF]"
                  />
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    <strong>Complete .ZIP Bundle:</strong> Includes the full
                    interactive tool, User Manual, React TSX code, and prompt
                    specs.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-[#5271FF]"
                  />
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    <strong>Live Text &amp; Color Customization:</strong> Edit
                    headings, text, and button accent colors right inside the
                    app before saving.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-[#5271FF]"
                  />
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    <strong>Cloud API + BYOK Privacy:</strong> Works online via
                    our Cloud API by default, or enter your own Gemini/OpenAI
                    key.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/tools/downloadable-ai-tools"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5271FF] to-[#4361EE] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-[#5271FF]/25 transition hover:opacity-95 sm:text-sm"
                >
                  <Download size={15} />
                  <span>Browse &amp; Download 90+ Portable Tools</span>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:bg-[#111827] dark:text-slate-200 dark:hover:border-[#5271FF] sm:text-sm"
                >
                  <Laptop size={15} />
                  <span>Explore Online Tools</span>
                </Link>
              </div>
            </div>

            {/* Right Visual Package Preview */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700/80 dark:bg-[#0B1120]">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-1 font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Run-Tool.html
                    </span>
                  </div>
                  <span className="rounded-full bg-[#5271FF]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#5271FF] dark:bg-[#5271FF]/20 dark:text-[#b4c2ff]">
                    100% REAL TOOL UI
                  </span>
                </div>

                <div className="mt-4 space-y-3 font-mono text-xs">
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/90">
                    <p className="text-[11px] font-bold text-[#5271FF] dark:text-[#9aabff]">
                      📦 on-page-ai-seo-analyzer-portable-pack.zip
                    </p>
                    <ul className="mt-2 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                      <li>├── 📄 Run-Tool.html (Full Interactive App)</li>
                      <li>├── 📄 USER-MANUAL.md (Setup &amp; API Guide)</li>
                      <li>├── ⚛️ React-Component.tsx (Next.js / Tailwind)</li>
                      <li>└── 📝 Vibe-Coding-Prompts.md</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/70 px-3.5 py-2.5 text-[11px] dark:border-slate-800 dark:bg-slate-900/90">
                    <span className="font-sans text-slate-500 dark:text-slate-400">
                      Default Cloud API:
                    </span>
                    <span className="font-sans font-bold text-emerald-600 dark:text-emerald-400">
                      ● Active Out-of-the-Box
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/70 px-3.5 py-2.5 text-[11px] dark:border-slate-800 dark:bg-slate-900/90">
                    <span className="font-sans text-slate-500 dark:text-slate-400">
                      Personal API (BYOK):
                    </span>
                    <span className="font-sans font-bold text-[#5271FF] dark:text-[#9aabff]">
                      🔑 Gemini &amp; OpenAI Supported
                    </span>
                  </div>

                  <Link
                    href="/tools/downloadable-ai-tools"
                    className="block w-full rounded-xl border border-[#5271FF]/30 bg-[#5271FF]/10 py-2.5 text-center font-sans text-xs font-bold text-[#5271FF] transition hover:bg-[#5271FF] hover:text-white dark:border-[#5271FF]/40 dark:text-[#b4c2ff] dark:hover:bg-[#5271FF] dark:hover:text-white"
                  >
                    Open Downloadable Tools Hub →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

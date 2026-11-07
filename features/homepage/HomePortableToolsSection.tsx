"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Download,
  FileCode2,
  HardDrive,
  Laptop,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function HomePortableToolsSection() {
  return (
    <section
      id="portable-tools-showcase"
      aria-labelledby="portable-tools-title"
      className="relative overflow-hidden bg-slate-950 py-16 text-white border-t border-slate-800/80"
    >
      <div className="home-shell mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#0B1428] to-slate-900 p-7 shadow-2xl sm:p-10">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-400">
                <Sparkles size={13} />
                <span>Zero Terminal Commands · Standalone Web Apps</span>
              </div>

              <h2
                id="portable-tools-title"
                className="mt-4 text-2xl font-extrabold text-white sm:text-4xl sm:leading-tight"
              >
                Download &amp; Run 90+ AI SEO Tools{" "}
                <span className="text-emerald-400">
                  Locally on Your PC
                </span>
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Every single tool on DoItWithAI.tools is now available as a{" "}
                <strong>100% portable standalone web application</strong>. Download
                a 1-click unified <code>.ZIP</code> package, double-click{" "}
                <code>Run-Tool.html</code>, and run audits, metadata generators, and
                schema builders right on your computer.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="mt-0.5 text-emerald-400 shrink-0" />
                  <p className="text-xs text-slate-300">
                    <strong>Zero Installation:</strong> No Node.js, npm, or Python required. Opens instantly in Chrome, Edge, or Safari.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="mt-0.5 text-emerald-400 shrink-0" />
                  <p className="text-xs text-slate-300">
                    <strong>1-Click .ZIP Package:</strong> Includes Standalone HTML app, User Manual, React TSX component &amp; prompts.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="mt-0.5 text-emerald-400 shrink-0" />
                  <p className="text-xs text-slate-300">
                    <strong>Cloud API + BYOK Privacy:</strong> Connected to our Cloud API by default, or add your own private API key.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="mt-0.5 text-emerald-400 shrink-0" />
                  <p className="text-xs text-slate-300">
                    <strong>Embed Anywhere:</strong> Ready to iframe or deploy on WordPress, Webflow, Shopify, or React/Next.js.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/download-and-embed"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs sm:text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 active:scale-95"
                >
                  <Download size={15} />
                  <span>Browse &amp; Download 90+ Portable Tools</span>
                </Link>

                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs sm:text-sm font-bold text-slate-200 transition hover:border-slate-500 hover:text-white"
                >
                  <Laptop size={15} />
                  <span>Explore Online Tools</span>
                </Link>
              </div>
            </div>

            {/* Right Visual Card Simulation */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-emerald-500/30 bg-[#070D19] p-4 text-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-1 font-mono text-[11px] text-slate-400">
                      Run-Tool.html
                    </span>
                  </div>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    100% STANDALONE
                  </span>
                </div>

                <div className="mt-4 space-y-3 font-mono text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-slate-300">
                    <p className="text-[11px] text-emerald-400 font-bold">
                      📦 on-page-ai-seo-analyzer-portable-pack.zip
                    </p>
                    <ul className="mt-2 space-y-1 text-[11px] text-slate-400">
                      <li>├── 📄 Run-Tool.html (Double-click to run)</li>
                      <li>├── 📄 USER-MANUAL.md (API rules &amp; guide)</li>
                      <li>├── ⚛️ React-Component.tsx (Tailwind TSX)</li>
                      <li>└── 📝 Vibe-Coding-Prompts.md</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-900/90 p-3 text-[11px]">
                    <span className="text-slate-400">Default API:</span>
                    <span className="font-bold text-emerald-400">🟢 Included (Online)</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-900/90 p-3 text-[11px]">
                    <span className="text-slate-400">Personal API (BYOK):</span>
                    <span className="font-bold text-purple-400">🔑 Gemini &amp; OpenAI</span>
                  </div>

                  <Link
                    href="/download-and-embed"
                    className="block w-full text-center rounded-xl bg-emerald-500/15 border border-emerald-500/35 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition"
                  >
                    Download 90+ Portable Tools Now →
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

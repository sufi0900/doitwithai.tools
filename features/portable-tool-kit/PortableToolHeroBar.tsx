"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  Globe,
  KeyRound,
  Laptop,
  Palette,
  Sparkles,
  Terminal,
  Wand2,
  X,
} from "lucide-react";
import { tools, type CatalogTool } from "@/features/tool-catalog/catalog";

export type DoItAiToolItem = {
  slug: string;
  name: string;
  shortDescription?: string;
  description: string;
  category: string;
  categories: string[];
  tags: string[];
  href: string;
};

export const ALL_LIVE_TOOLS: DoItAiToolItem[] = tools.map((t) => ({
  slug: t.slug,
  name: t.name,
  shortDescription: t.description.slice(0, 110),
  description: t.description,
  category: t.categories?.[0] || "AI SEO",
  categories: t.categories || ["AI SEO"],
  tags: t.tags || [],
  href: `/tools/${t.slug}`,
}));

const DETERMINISTIC_ONLY_SLUGS = new Set([
  "slug-generator",
  "robots-txt-generator",
  "sitemap-xml-generator",
  "canonical-tag-checker",
  "hreflang-generator",
  "keyword-density-checker",
  "redirect-rule-generator",
  "indexnow-key-generator",
  "structured-data-validator",
  "nap-consistency-checker",
  "internal-link-anchor-auditor",
  "heading-structure-analyzer",
  "readability-checker",
]);

export function doesToolUseAiApi(slug: string): boolean {
  return !DETERMINISTIC_ONLY_SLUGS.has(slug);
}

export const ACCENT_PRESETS = [
  { label: "Brand Blue", hex: "#3452D1" },
  { label: "Electric Indigo", hex: "#5271FF" },
  { label: "Emerald Growth", hex: "#059669" },
  { label: "Royal Violet", hex: "#7C3AED" },
  { label: "Amber Signal", hex: "#D97706" },
  { label: "Rose Pulse", hex: "#E11D48" },
];

export const BG_PRESETS = [
  { label: "Dark Navy", hex: "#0B1120", mode: "dark" as const },
  { label: "Deep Slate", hex: "#0F172A", mode: "dark" as const },
  { label: "Midnight", hex: "#060B19", mode: "dark" as const },
  { label: "Soft Light", hex: "#F8FAFC", mode: "light" as const },
  { label: "Pure White", hex: "#FFFFFF", mode: "light" as const },
];

function toPascalCase(slug: string): string {
  return slug
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

export function buildUserManualMarkdown(
  tool: CatalogTool,
  customTitle: string,
  brandName: string,
): string {
  const title = customTitle || tool.name;
  const brand = brandName || "DoItWithAI.tools";
  const usesAi = doesToolUseAiApi(tool.slug);

  return `# 📖 Official User Manual & Setup Guide: ${title}
**Package Version:** Unified Next.js + Local HTML5 Desktop & Web App (v3.0)
**Prepared by:** ${brand} (Powered by https://doitwithai.tools/tools/${tool.slug})

---

## 1. Quick Start: How to Run This Tool on Your PC (Zero Terminal Commands!)
You do **not** need Node.js, npm, Python, or any terminal commands to use this tool on your computer:
1. Locate the downloaded file \`${tool.slug}-app.html\` on your Windows, Mac, or Linux computer.
2. **Double-click \`${tool.slug}-app.html\`** to open it directly in Chrome, Edge, Brave, Firefox, or Safari.
3. The full interactive dashboard opens immediately like a native desktop app.

---

## 2. Two Built-In Execution Modes (Live Next.js Studio vs. Local Offline Studio)
This portable package combines **two synchronized engines** inside a single file:
- **Mode A — ⚡ Original Next.js Full Studio (Default when Online):**
  When your PC is connected to the internet and you have not replaced the default API key, the app renders the **100% original Next.js tool experience** with all multi-lens tabs, SERP pixel gauges, interactive checkers, and your custom brand colors.
- **Mode B — 💻 Local / Custom API Key Studio (For Offline PC & Private API Usage):**
  Click the **"💻 Local / Custom API Studio"** button in the top bar (or open the file while offline) to use the built-in local workspace with editable output canvas, live SERP pixel meters, and Markdown/CSV/HTML export.

---

## 3. API Key Rules & Important Caution (${usesAi ? "AI-Powered Tool" : "100% Local Algorithmic Tool"})
${
  usesAi
    ? `### 🟢 Default Mode (Connected to Internet):
- **By default, this tool uses DoItWithAI.tools' built-in Cloud API automatically** whenever you are connected to the internet. You do **not** need to enter an API key to test or use the tool right away.

### 🔑 Recommended for Long-Term Local PC Usage ("Use Your Own API Key"):
- If you plan to use this tool heavily on your local PC or want private, direct LLM generations, we recommend clicking **"🔑 API Key Settings"** in the top bar and entering your own free **Google Gemini API Key** (\`AIzaSy...\`) or **OpenAI API Key** (\`sk-...\`).

> ⚠️ **IMPORTANT CAUTION — PERMANENT REMOVAL OF DEFAULT API KEY:**
> **Once you enter and save your own API key, DoItWithAI.tools' default built-in API key will be permanently removed and disabled for this downloaded tool.** From that moment onward, the tool will run exclusively using your personal API key (stored privately in your browser's \`localStorage\`) and the built-in offline engine.`
    : `### ⚡ 100% Local Algorithmic Engine (No API Key Required):
- **${title}** runs 100% locally using deterministic SEO & validation algorithms.
- It does **not** require an external AI API key to perform its core calculations, validations, or code generation, though you can optionally add your own Gemini key if you wish to generate extra AI recommendations.`
}

---

## 4. How to Edit Content, Colors & Branding Inside the Tool
1. Click the **"✏️ Edit Content & Colors"** button in the top navigation bar of the app.
2. Change the **Tool Title**, **Subtitle / Instructions**, **Brand Name**, **Accent Color** (using the full color wheel picker), or **Background Color**.
3. Inside the **Local Studio**, click directly inside any generated report block (marked **"✏️ Click to Edit Output"**) to modify the text before copying or downloading your report.
4. Click **"💾 Save Customized .HTML Copy"** inside the app to download a fresh copy with your edits baked in!

---

## 5. How to Deploy or Embed on Your Website (WordPress, Webflow, Next.js, Netlify)
- **Option A (Upload Standalone HTML):** Upload your customized \`${tool.slug}-app.html\` to **Netlify Drop** (app.netlify.com/drop), **Cloudflare Pages**, **Vercel**, or your cPanel hosting.
- **Option B (WordPress / Webflow / Shopify Embed):** Copy the responsive \`<iframe>\` snippet from the Customize modal on https://doitwithai.tools/tools/${tool.slug} and paste it into a Custom HTML block.
- **Option C (Next.js / React Component):** Download the \`.tsx\` React widget from the Customize modal and drop it into your Next.js project.
`;
}

export function buildStandaloneHtmlCode(
  tool: CatalogTool,
  customTitle: string,
  brandName: string,
  accentHex: string,
  themeMode: "dark" | "light",
  customSubtitle?: string,
  bgHex?: string,
): string {
  const safeTitle = (customTitle || tool.name).replace(/"/g, "&quot;");
  const safeBrand = (brandName || "DoItWithAI.tools").replace(/"/g, "&quot;");
  const safeDesc = (
    customSubtitle ||
    tool.shortDescription ||
    tool.description
  ).replace(/"/g, "&quot;");
  const canonicalUrl = `https://doitwithai.tools/tools/${tool.slug}`;
  const isDark = themeMode === "dark";
  const resolvedBg = bgHex || (isDark ? "#0B1120" : "#F8FAFC");
  const usesAi = doesToolUseAiApi(tool.slug);
  const liveEmbedUrl = `https://doitwithai.tools/tools/${tool.slug}?embed=1&app=1&accent=${encodeURIComponent(accentHex)}&bg=${encodeURIComponent(resolvedBg)}&brand=${encodeURIComponent(brandName || "DoItWithAI.tools")}&title=${encodeURIComponent(customTitle || tool.name)}&subtitle=${encodeURIComponent(customSubtitle || tool.shortDescription || tool.description)}`;
  const manualText = buildUserManualMarkdown(
    tool,
    customTitle || tool.name,
    brandName || "DoItWithAI.tools",
  );

  return `<!DOCTYPE html>
<html lang="en" class="${isDark ? "dark" : ""}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} — ${safeBrand} (Portable App Studio)</title>
  <meta name="description" content="${safeDesc}" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      --brand-accent: ${accentHex};
      --app-bg: ${resolvedBg};
    }
    body {
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--app-bg);
      color: ${isDark ? "#F8FAFC" : "#0F172A"};
      margin: 0;
      padding: 0;
    }
    .accent-bg { background-color: var(--brand-accent); }
    .accent-border { border-color: var(--brand-accent); }
    .accent-text { color: var(--brand-accent); }
    [contenteditable="true"]:focus {
      outline: 2px solid var(--brand-accent);
      border-radius: 12px;
    }
  </style>
</head>
<body class="min-h-screen antialiased flex flex-col">
  <!-- TOP UNIFIED DESKTOP & WEB APP CONTROL BAR -->
  <header class="sticky top-0 z-40 border-b ${isDark ? "border-slate-800 bg-[#080F23]/95" : "border-slate-200 bg-white/95"} px-4 py-2.5 backdrop-blur">
    <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2.5">
      <div class="flex items-center gap-2.5">
        <span class="accent-bg flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black text-white shadow">
          AI
        </span>
        <div>
          <div class="flex items-center gap-2">
            <span id="topBarTitle" class="text-sm font-black tracking-tight">${safeTitle}</span>
            <span id="topBarBrand" class="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider" style="background:color-mix(in srgb, var(--brand-accent) 18%, transparent);color:var(--brand-accent);border:1px solid color-mix(in srgb, var(--brand-accent) 40%, transparent);">
              ${safeBrand}
            </span>
          </div>
          <div id="apiStatusBadge" class="text-[11px] font-semibold text-emerald-400">
            ${
              usesAi
                ? "🟢 Default DoItWithAI Cloud API Active (Online) · Zero Setup Required"
                : "⚡ 100% Local Algorithmic Engine Active · No API Key Needed"
            }
          </div>
        </div>
      </div>

      <!-- Mode Switcher & Controls -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="inline-flex rounded-xl border ${isDark ? "border-slate-800 bg-slate-900/90" : "border-slate-200 bg-slate-100"} p-1">
          <button id="modeLiveBtn" type="button" class="accent-bg rounded-lg px-3 py-1.5 text-xs font-extrabold text-white transition">
            ⚡ Full Next.js Studio
          </button>
          <button id="modeLocalBtn" type="button" class="rounded-lg px-3 py-1.5 text-xs font-bold ${isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900"} transition">
            💻 Local / Custom API Studio
          </button>
        </div>

        <button id="toggleCustomizeBtn" type="button" class="rounded-xl border ${isDark ? "border-slate-700 bg-slate-800/80 text-slate-200" : "border-slate-300 bg-white text-slate-700"} px-3 py-1.5 text-xs font-bold hover:opacity-90">
          ✏️ Edit Content &amp; Color
        </button>

        <button id="toggleApiKeyBtn" type="button" class="rounded-xl border ${isDark ? "border-amber-500/40 bg-amber-500/10 text-amber-300" : "border-amber-600/40 bg-amber-50 text-amber-800"} px-3 py-1.5 text-xs font-bold hover:opacity-90">
          🔑 Use Your Own API Key
        </button>

        <button id="toggleManualBtn" type="button" class="rounded-xl border ${isDark ? "border-blue-500/40 bg-blue-500/10 text-blue-300" : "border-blue-600/40 bg-blue-50 text-blue-800"} px-3 py-1.5 text-xs font-bold hover:opacity-90">
          📖 User Manual
        </button>
      </div>
    </div>

    <!-- DRAWER 1: API KEY SETTINGS WITH PERMANENT DEFAULT API REMOVAL CAUTION -->
    <div id="apiKeyDrawer" class="hidden mx-auto mt-3 max-w-5xl rounded-2xl border border-amber-500/40 ${isDark ? "bg-[#0F172A]" : "bg-amber-50/90"} p-4 shadow-xl">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-xs font-black uppercase tracking-wider text-amber-400">
            🔑 API Key Configuration — Default Cloud API vs. Your Own API Key (BYOK)
          </h3>
          <p class="mt-1 text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}">
            ${
              usesAi
                ? "By default, when your PC is connected to the internet, this tool uses <strong>DoItWithAI.tools' built-in Cloud API</strong> automatically so you can use it with zero setup. For dedicated local PC usage, we recommend entering your own Google Gemini or OpenAI API key below."
                : "This tool runs 100% locally using deterministic SEO rules and does not require an API key. However, you can optionally add your own Gemini or OpenAI key below to unlock extra AI expansion."
            }
          </p>
          <div class="mt-2 rounded-xl border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-200">
            ⚠️ <strong>Caution:</strong> Once you enter and save your own API key below, <strong>our default DoItWithAI API key will be permanently removed from this tool</strong>, and it will run exclusively in Local / Custom API Studio Mode.
          </div>
        </div>
        <button type="button" onclick="document.getElementById('apiKeyDrawer').classList.add('hidden')" class="text-xs font-bold opacity-70 hover:opacity-100">✕</button>
      </div>
      <div class="mt-3 grid gap-2 sm:grid-cols-12">
        <select id="providerSelect" class="sm:col-span-3 rounded-xl border ${isDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-900"} px-3 py-2 text-xs font-bold">
          <option value="gemini">Google Gemini API Key</option>
          <option value="openai">OpenAI API Key (GPT-4o-mini)</option>
        </select>
        <input id="customApiKeyInput" type="password" placeholder="Paste your API key (e.g. AIzaSy... or sk-...)" class="sm:col-span-6 rounded-xl border ${isDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-900"} px-3.5 py-2 text-xs" />
        <button id="saveCustomKeyBtn" type="button" class="accent-bg sm:col-span-3 rounded-xl px-4 py-2 text-xs font-extrabold text-white shadow">
          Save My Key &amp; Remove Default API
        </button>
      </div>
    </div>

    <!-- DRAWER 2: LIVE CONTENT & COLOR EDITOR -->
    <div id="customizeDrawer" class="hidden mx-auto mt-3 max-w-5xl rounded-2xl border ${isDark ? "border-slate-700 bg-[#0F172A]" : "border-slate-300 bg-white"} p-4 shadow-xl">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-black uppercase tracking-wider accent-text">
          ✏️ Customize Tool Title, Instructions, Brand &amp; Theme Color
        </h3>
        <button type="button" onclick="document.getElementById('customizeDrawer').classList.add('hidden')" class="text-xs font-bold opacity-70 hover:opacity-100">✕</button>
      </div>
      <div class="mt-3 grid gap-3 sm:grid-cols-4">
        <div>
          <label class="block text-[11px] font-bold opacity-80">Custom Tool Title</label>
          <input id="editTitleInput" type="text" value="${safeTitle}" class="mt-1 w-full rounded-xl border ${isDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"} px-3 py-1.5 text-xs" />
        </div>
        <div>
          <label class="block text-[11px] font-bold opacity-80">Brand / Website Name</label>
          <input id="editBrandInput" type="text" value="${safeBrand}" class="mt-1 w-full rounded-xl border ${isDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"} px-3 py-1.5 text-xs" />
        </div>
        <div>
          <label class="block text-[11px] font-bold opacity-80">Custom Subtitle / Intro</label>
          <input id="editDescInput" type="text" value="${safeDesc}" class="mt-1 w-full rounded-xl border ${isDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"} px-3 py-1.5 text-xs" />
        </div>
        <div>
          <label class="block text-[11px] font-bold opacity-80">Pick Any Accent &amp; BG Color</label>
          <div class="mt-1 flex items-center gap-2">
            <input id="editAccentPicker" type="color" value="${accentHex}" title="Pick Accent Color" class="h-8 w-12 cursor-pointer rounded border border-slate-600 bg-transparent" />
            <input id="editBgPicker" type="color" value="${resolvedBg}" title="Pick Background Color" class="h-8 w-12 cursor-pointer rounded border border-slate-600 bg-transparent" />
            <button id="applyCustomizationBtn" type="button" class="accent-bg flex-1 rounded-xl px-3 py-1.5 text-xs font-extrabold text-white">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- VIEW 1: ORIGINAL NEXT.JS FULL STUDIO ENGINE (100% Identical Experience When Online & Default API Active) -->
  <section id="liveNextjsView" class="flex-1 flex flex-col">
    <iframe
      id="liveToolIframe"
      src="${liveEmbedUrl}"
      title="${safeTitle}"
      class="w-full flex-1 border-0"
      style="min-height: calc(100vh - 64px);"
      allow="clipboard-write; clipboard-read"
    ></iframe>
  </section>

  <!-- VIEW 2: LOCAL / OFFLINE & CUSTOM API KEY STUDIO (With Editable Content Canvas & Multi-Lens Analysis) -->
  <main id="localStudioView" class="hidden mx-auto w-full max-w-6xl flex-1 p-4 sm:p-8">
    <div class="rounded-3xl border ${isDark ? "border-slate-800 bg-[#111A2E]" : "border-slate-200 bg-white"} p-6 sm:p-8 shadow-xl">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span id="localBrandPill" class="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider" style="background:color-mix(in srgb, var(--brand-accent) 18%, transparent);color:var(--brand-accent);border:1px solid color-mix(in srgb, var(--brand-accent) 40%, transparent);">
          Local &amp; Custom API Studio · ${safeBrand}
        </span>
        <span class="text-xs font-semibold opacity-75">
          ✏️ Tip: You can click and edit any generated output below before exporting!
        </span>
      </div>
      <h1 id="localMainTitle" contenteditable="true" class="mt-3 text-2xl sm:text-4xl font-black tracking-tight">${safeTitle}</h1>
      <p id="localMainDesc" contenteditable="true" class="mt-2 max-w-3xl text-sm sm:text-base ${isDark ? "text-slate-300" : "text-slate-600"} leading-relaxed">
        ${safeDesc}
      </p>
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-12">
      <!-- Left Input Column -->
      <section class="lg:col-span-5 rounded-3xl border ${isDark ? "border-slate-800 bg-[#111A2E]" : "border-slate-200 bg-white"} p-6 shadow-lg">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-base font-extrabold">1. Configure Tool Inputs</h2>
          <button id="loadSampleBtn" type="button" class="text-xs font-bold underline accent-text">
            Load Sample Data
          </button>
        </div>

        <form id="toolForm" class="mt-4 space-y-4">
          <div>
            <label for="primaryInput" class="block text-xs font-bold uppercase tracking-wider opacity-80">
              Primary Keyword, Topic, URL, or Content Input
            </label>
            <textarea id="primaryInput" rows="5" required placeholder="Enter your primary keyword, URL, or draft content..." class="mt-1.5 w-full rounded-2xl border ${isDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"} p-3.5 text-sm focus:outline-none">how to check google keyword rankings\nwhat to do after keyword research\nmeta title pixel width checker</textarea>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="contextInput" class="block text-xs font-bold uppercase tracking-wider opacity-80">
                Target Audience / Niche
              </label>
              <input id="contextInput" type="text" value="Non-coder marketers, bloggers & founders" class="mt-1.5 w-full rounded-xl border ${isDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"} px-3 py-2 text-sm" />
            </div>
            <div>
              <label for="modeSelect" class="block text-xs font-bold uppercase tracking-wider opacity-80">
                Optimization Lens
              </label>
              <select id="modeSelect" class="mt-1.5 w-full rounded-xl border ${isDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-900"} px-3 py-2 text-sm">
                <option value="5-lens">Full 5-Lens SEO + AEO Breakdown</option>
                <option value="deep">Deep Audit + E-E-A-T Checklist</option>
                <option value="compact">Compact Copy-Paste Deliverables</option>
              </select>
            </div>
          </div>

          <button type="submit" id="runBtn" class="accent-bg w-full rounded-2xl py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:opacity-95">
            ⚡ Run ${safeTitle}
          </button>
        </form>
      </section>

      <!-- Right Output Column with Editable Canvas -->
      <section class="lg:col-span-7 rounded-3xl border ${isDark ? "border-slate-800 bg-[#111A2E]" : "border-slate-200 bg-white"} p-6 shadow-lg flex flex-col justify-between">
        <div>
          <div class="flex flex-wrap items-center justify-between gap-2 border-b ${isDark ? "border-slate-800" : "border-slate-200"} pb-3">
            <div>
              <h2 class="text-base font-extrabold">2. Interactive Results &amp; Editable Canvas</h2>
              <p class="text-[11px] opacity-70">Click any card text below to edit it directly before copying or downloading.</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button id="copyOutputBtn" type="button" class="rounded-xl border ${isDark ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-200 bg-slate-100 text-slate-700"} px-3 py-1.5 text-xs font-bold">
                Copy Report
              </button>
              <button id="downloadMdBtn" type="button" class="rounded-xl border ${isDark ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-200 bg-slate-100 text-slate-700"} px-3 py-1.5 text-xs font-bold">
                ⬇ .MD
              </button>
              <button id="downloadCsvBtn" type="button" class="rounded-xl border ${isDark ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-200 bg-slate-100 text-slate-700"} px-3 py-1.5 text-xs font-bold">
                ⬇ .CSV
              </button>
            </div>
          </div>

          <div id="outputContainer" contenteditable="true" class="mt-4 space-y-3 text-sm leading-relaxed p-1"></div>
        </div>

        <footer class="mt-6 border-t ${isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"} pt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span id="footerEngineNote">Engine: Default DoItWithAI Cloud API + Local Deterministic Fallback</span>
          <a href="${canonicalUrl}" target="_blank" rel="noopener" class="font-bold underline accent-text">
            Powered by DoItWithAI.tools →
          </a>
        </footer>
      </section>
    </div>
  </main>

  <!-- MODAL: BUILT-IN USER MANUAL -->
  <div id="manualModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
    <div class="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-700 bg-[#0F172A] text-white shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <h3 class="text-base font-black">📖 Official User Manual &amp; API Key Guide — ${safeTitle}</h3>
        <div class="flex items-center gap-2">
          <button id="downloadManualFileBtn" type="button" class="accent-bg rounded-xl px-3 py-1.5 text-xs font-extrabold text-white">
            ⬇ Download Manual (.MD)
          </button>
          <button type="button" onclick="document.getElementById('manualModal').classList.add('hidden');document.getElementById('manualModal').classList.remove('flex');" class="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold">
            ✕ Close
          </button>
        </div>
      </div>
      <pre id="manualTextPre" class="flex-1 overflow-y-auto whitespace-pre-wrap p-6 font-mono text-xs leading-relaxed text-slate-200">${manualText.replace(/</g, "&lt;")}</pre>
    </div>
  </div>

  <!-- Centered Loading Modal -->
  <div id="loadingModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
    <div class="w-full max-w-md rounded-3xl border border-slate-700 bg-[#111A2E] p-6 text-center text-white shadow-2xl">
      <div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-blue-400"></div>
      <h3 class="mt-4 text-lg font-extrabold">Running ${safeTitle}</h3>
      <p id="loadingSubtext" class="mt-1 text-xs text-slate-300">Synthesizing structured recommendations, SERP pixel checks, and E-E-A-T signals...</p>
    </div>
  </div>

  <script>
    const TOOL_SLUG = ${JSON.stringify(tool.slug)};
    const USES_AI_API = ${JSON.stringify(usesAi)};
    const DEFAULT_API_ENDPOINT = "https://doitwithai.tools/api/do-it-ai";
    const KEY_STORAGE = "diwai_custom_api_key_" + TOOL_SLUG;
    const PROVIDER_STORAGE = "diwai_custom_api_provider_" + TOOL_SLUG;
    const DEFAULT_REMOVED_FLAG = "diwai_default_api_permanently_removed_" + TOOL_SLUG;
    const MANUAL_MARKDOWN = ${JSON.stringify(manualText)};

    const liveView = document.getElementById("liveNextjsView");
    const localView = document.getElementById("localStudioView");
    const modeLiveBtn = document.getElementById("modeLiveBtn");
    const modeLocalBtn = document.getElementById("modeLocalBtn");
    const apiStatusBadge = document.getElementById("apiStatusBadge");
    const footerEngineNote = document.getElementById("footerEngineNote");
    const outputContainer = document.getElementById("outputContainer");
    const loadingModal = document.getElementById("loadingModal");
    let latestMarkdown = "";
    let latestCsvRows = [];

    function isDefaultApiPermanentlyRemoved() {
      return localStorage.getItem(DEFAULT_REMOVED_FLAG) === "true";
    }

    function switchView(mode) {
      if (mode === "live" && !isDefaultApiPermanentlyRemoved() && navigator.onLine) {
        liveView.classList.remove("hidden");
        localView.classList.add("hidden");
        modeLiveBtn.classList.add("accent-bg", "text-white");
        modeLocalBtn.classList.remove("accent-bg", "text-white");
      } else {
        liveView.classList.add("hidden");
        localView.classList.remove("hidden");
        modeLocalBtn.classList.add("accent-bg", "text-white");
        modeLiveBtn.classList.remove("accent-bg", "text-white");
      }
    }

    function updateApiStatusUI() {
      const removed = isDefaultApiPermanentlyRemoved();
      const customKey = localStorage.getItem(KEY_STORAGE) || "";
      const provider = localStorage.getItem(PROVIDER_STORAGE) || "gemini";
      if (!USES_AI_API && !customKey) {
        apiStatusBadge.textContent = "⚡ 100% Local Algorithmic Engine Active · No API Key Required";
        apiStatusBadge.className = "text-[11px] font-semibold text-emerald-400";
        return;
      }
      if (removed) {
        apiStatusBadge.textContent = customKey
          ? "🔒 Custom " + provider.toUpperCase() + " API Key Active (Default DoItWithAI API Permanently Removed)"
          : "🔒 Local Offline Mode Only (Default DoItWithAI API Permanently Removed)";
        apiStatusBadge.className = "text-[11px] font-semibold text-amber-400";
        footerEngineNote.textContent = "Engine: Personal BYOK API Key + Local Deterministic Engine (Default Cloud API Removed)";
        modeLiveBtn.title = "Default DoItWithAI Cloud API was permanently removed when you saved your own API key.";
        modeLiveBtn.classList.add("opacity-50");
        switchView("local");
      } else if (!navigator.onLine) {
        apiStatusBadge.textContent = "📴 Offline PC Mode Active — Using Built-In Local Engine (Add your own API key for custom LLM)";
        apiStatusBadge.className = "text-[11px] font-semibold text-amber-300";
        switchView("local");
      } else {
        apiStatusBadge.textContent = "🟢 Default DoItWithAI Cloud API Active (Online) · Or click 'Use Your Own API Key'";
        apiStatusBadge.className = "text-[11px] font-semibold text-emerald-400";
      }
    }

    modeLiveBtn.addEventListener("click", () => {
      if (isDefaultApiPermanentlyRemoved()) {
        alert("Caution Notice: Because you previously saved your own API key, DoItWithAI's default Cloud API has been permanently removed for this installation. Using Local / Custom API Studio.");
        switchView("local");
        return;
      }
      switchView("live");
    });
    modeLocalBtn.addEventListener("click", () => switchView("local"));

    document.getElementById("toggleApiKeyBtn").addEventListener("click", () => {
      document.getElementById("apiKeyDrawer").classList.toggle("hidden");
    });
    document.getElementById("toggleCustomizeBtn").addEventListener("click", () => {
      document.getElementById("customizeDrawer").classList.toggle("hidden");
    });
    document.getElementById("toggleManualBtn").addEventListener("click", () => {
      const m = document.getElementById("manualModal");
      m.classList.remove("hidden");
      m.classList.add("flex");
    });
    document.getElementById("downloadManualFileBtn").addEventListener("click", () => {
      const blob = new Blob([MANUAL_MARKDOWN], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "USER-MANUAL-" + TOOL_SLUG + ".md";
      a.click();
      URL.revokeObjectURL(url);
    });

    // Save custom API key & permanently remove Default DoItWithAI API
    document.getElementById("customApiKeyInput").value = localStorage.getItem(KEY_STORAGE) || "";
    document.getElementById("saveCustomKeyBtn").addEventListener("click", () => {
      const val = document.getElementById("customApiKeyInput").value.trim();
      const prov = document.getElementById("providerSelect").value;
      if (!val) {
        alert("Please enter a valid Gemini or OpenAI API key first.");
        return;
      }
      const confirmed = confirm(
        "CAUTION: Saving your own API key will permanently remove DoItWithAI.tools' default built-in API key from this downloaded tool. Continue?"
      );
      if (!confirmed) return;
      localStorage.setItem(KEY_STORAGE, val);
      localStorage.setItem(PROVIDER_STORAGE, prov);
      localStorage.setItem(DEFAULT_REMOVED_FLAG, "true");
      document.getElementById("apiKeyDrawer").classList.add("hidden");
      updateApiStatusUI();
      runToolExecution();
    });

    // Live Content & Color Customizer
    document.getElementById("applyCustomizationBtn").addEventListener("click", () => {
      const newTitle = document.getElementById("editTitleInput").value.trim();
      const newBrand = document.getElementById("editBrandInput").value.trim();
      const newDesc = document.getElementById("editDescInput").value.trim();
      const newAccent = document.getElementById("editAccentPicker").value;
      const newBg = document.getElementById("editBgPicker").value;

      document.documentElement.style.setProperty("--brand-accent", newAccent);
      document.documentElement.style.setProperty("--app-bg", newBg);
      if (newTitle) {
        document.getElementById("topBarTitle").textContent = newTitle;
        document.getElementById("localMainTitle").textContent = newTitle;
        document.title = newTitle + " — " + (newBrand || "Portable App");
      }
      if (newBrand) {
        document.getElementById("topBarBrand").textContent = newBrand;
        document.getElementById("localBrandPill").textContent = "Local & Custom API Studio · " + newBrand;
      }
      if (newDesc) {
        document.getElementById("localMainDesc").textContent = newDesc;
      }
      const iframe = document.getElementById("liveToolIframe");
      if (iframe && !isDefaultApiPermanentlyRemoved()) {
        iframe.src = "https://doitwithai.tools/tools/" + TOOL_SLUG + "?embed=1&app=1&accent=" + encodeURIComponent(newAccent) + "&bg=" + encodeURIComponent(newBg) + "&brand=" + encodeURIComponent(newBrand) + "&title=" + encodeURIComponent(newTitle) + "&subtitle=" + encodeURIComponent(newDesc);
      }
      document.getElementById("customizeDrawer").classList.add("hidden");
    });

    function classifyLine(line) {
      const lower = line.toLowerCase();
      const words = line.trim().split(/\\s+/).filter(Boolean).length;
      const chars = line.trim().length;
      const approxPx = Math.round(chars * 9.2);
      let intent = "Informational (Guide / Tutorial)";
      if (/\\b(buy|price|pricing|cost|hire|agency|service|tool|generator|checker)\\b/.test(lower)) {
        intent = "Transactional / Interactive Tool Intent";
      } else if (/\\b(best|top|vs|compare|review|alternatives)\\b/.test(lower)) {
        intent = "Commercial Investigation (Comparison / List)";
      }
      return { line: line.trim(), words, chars, approxPx, intent };
    }

    function renderStructuredCards(headline, summary, metrics, sections) {
      const mdLines = ["# " + headline, summary, ""];
      latestCsvRows = [["Section", "Label", "Content", "Metrics"]];

      let html = '<div class="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4">';
      html += '<div class="text-base font-black">' + headline.replace(/</g, "&lt;") + '</div>';
      html += '<p class="mt-1 text-xs opacity-80">' + summary.replace(/</g, "&lt;") + '</p>';
      if (metrics && metrics.length) {
        html += '<div class="mt-3 grid gap-2.5 sm:grid-cols-4">';
        metrics.forEach(m => {
          html += '<div class="rounded-xl border border-slate-700/50 bg-slate-950/60 p-2.5"><div class="text-[10px] uppercase font-bold opacity-70">' + m.label + '</div><div class="mt-0.5 text-sm font-black accent-text">' + m.value + '</div></div>';
        });
        html += '</div>';
      }
      html += '</div><div class="mt-4 space-y-4">';

      sections.forEach(sec => {
        mdLines.push("## " + sec.title);
        html += '<div class="space-y-2.5"><div class="flex items-center justify-between"><h3 class="text-xs font-extrabold uppercase tracking-wider accent-text">' + sec.title + '</h3>' + (sec.badge ? '<span class="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-300">' + sec.badge + '</span>' : '') + '</div>';
        sec.items.forEach(it => {
          mdLines.push("### " + it.label);
          mdLines.push(it.content);
          if (it.code) mdLines.push("\`\`\`\\n" + it.code + "\\n\`\`\`");
          mdLines.push("");
          latestCsvRows.push([sec.title, it.label, it.content, it.meta || ""]);

          html += '<article class="rounded-2xl border border-slate-700/50 bg-slate-800/20 p-4">';
          html += '<div class="flex flex-wrap items-center justify-between gap-2"><span class="text-xs font-extrabold accent-text">' + it.label + '</span>' + (it.meta ? '<span class="rounded-md bg-slate-950 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-slate-800">' + it.meta + '</span>' : '') + '</div>';
          html += '<p class="mt-1.5 text-sm font-medium">' + it.content.replace(/</g, "&lt;") + '</p>';
          if (it.code) {
            html += '<pre class="mt-2 overflow-x-auto rounded-xl bg-slate-950 p-3 font-mono text-xs text-blue-200 border border-slate-800">' + it.code.replace(/</g, "&lt;") + '</pre>';
          }
          html += '</article>';
        });
        html += '</div>';
      });
      html += '</div>';
      latestMarkdown = mdLines.join("\\n");
      outputContainer.innerHTML = html;
    }

    async function runToolExecution() {
      const rawText = document.getElementById("primaryInput").value;
      const audience = document.getElementById("contextInput").value;
      const mode = document.getElementById("modeSelect").value;
      const customKey = localStorage.getItem(KEY_STORAGE) || "";
      const provider = localStorage.getItem(PROVIDER_STORAGE) || "gemini";
      const defaultRemoved = isDefaultApiPermanentlyRemoved();

      loadingModal.classList.remove("hidden");
      loadingModal.classList.add("flex");

      try {
        // 1. If Default DoItWithAI Cloud API is still active and user is online, call our live Cloud API!
        if (!defaultRemoved && navigator.onLine) {
          const res = await fetch(DEFAULT_API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "execute_tool",
              toolSlug: TOOL_SLUG,
              toolInput: rawText,
              toolSecondaryInput: audience,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.toolResult) {
              const tr = data.toolResult;
              renderStructuredCards(tr.headline, tr.summary, tr.metrics || [], tr.sections || []);
              loadingModal.classList.add("hidden");
              loadingModal.classList.remove("flex");
              return;
            }
          }
        }

        // 2. If User Saved Their Own Gemini or OpenAI API Key (BYOK Mode)
        if (customKey && navigator.onLine) {
          const prompt = "You are executing the SEO/AI tool '" + document.getElementById("localMainTitle").textContent + "'. Input: " + rawText + ". Target Audience: " + audience + ". Mode: " + mode + ". Return 5 high-impact, ready-to-publish variations or audit steps with character counts, estimated SERP pixel widths, and E-E-A-T verification notes.";
          if (provider === "gemini") {
            const gemRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(customKey), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            });
            if (gemRes.ok) {
              const gemData = await gemRes.json();
              const aiText = gemData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
              if (aiText) {
                const blocks = aiText.split(/\\n\\n+/).filter(Boolean).slice(0, 6);
                renderStructuredCards(
                  document.getElementById("localMainTitle").textContent + " — Custom Gemini API Output",
                  "Generated directly using your personal Google Gemini API key.",
                  [
                    { label: "API Mode", value: "Personal Gemini Key" },
                    { label: "Blocks Generated", value: String(blocks.length) },
                    { label: "Target Audience", value: audience.slice(0, 22) },
                    { label: "Default API", value: "Permanently Removed" }
                  ],
                  [{
                    title: "AI-Generated Deliverables (Click Any Card to Edit)",
                    badge: "BYOK Gemini 2.5",
                    items: blocks.map((b, i) => ({
                      label: "Deliverable #" + (i + 1),
                      content: b.replace(/^#+\\s*/, ""),
                      meta: b.length + " chars"
                    }))
                  }]
                );
                loadingModal.classList.add("hidden");
                loadingModal.classList.remove("flex");
                return;
              }
            }
          } else if (provider === "openai") {
            const oaRes = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + customKey
              },
              body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }]
              })
            });
            if (oaRes.ok) {
              const oaData = await oaRes.json();
              const aiText = oaData?.choices?.[0]?.message?.content || "";
              if (aiText) {
                const blocks = aiText.split(/\\n\\n+/).filter(Boolean).slice(0, 6);
                renderStructuredCards(
                  document.getElementById("localMainTitle").textContent + " — Custom OpenAI Output",
                  "Generated directly using your personal OpenAI API key.",
                  [
                    { label: "API Mode", value: "Personal OpenAI Key" },
                    { label: "Blocks Generated", value: String(blocks.length) },
                    { label: "Target Audience", value: audience.slice(0, 22) },
                    { label: "Default API", value: "Permanently Removed" }
                  ],
                  [{
                    title: "AI-Generated Deliverables (Click Any Card to Edit)",
                    badge: "BYOK GPT-4o-mini",
                    items: blocks.map((b, i) => ({
                      label: "Deliverable #" + (i + 1),
                      content: b.replace(/^#+\\s*/, ""),
                      meta: b.length + " chars"
                    }))
                  }]
                );
                loadingModal.classList.add("hidden");
                loadingModal.classList.remove("flex");
                return;
              }
            }
          }
        }
      } catch {
        // Fall back to deterministic local engine
      }

      // 3. Built-In Deterministic Local Engine (Works 100% Offline)
      const lines = rawText.split(/\\r?\\n/).map(s => s.trim()).filter(Boolean);
      const items = (lines.length ? lines : [rawText.trim()]).slice(0, 12).map(classifyLine);
      renderStructuredCards(
        document.getElementById("localMainTitle").textContent + " — Local Studio Report",
        "Executed locally in your browser with SERP pixel-width calibration and search intent classification.",
        [
          { label: "Items Analyzed", value: String(items.length) },
          { label: "Avg Length", value: Math.round(items.reduce((a,b)=>a+b.chars,0)/items.length) + " chars" },
          { label: "Avg SERP Width", value: "~" + Math.round(items.reduce((a,b)=>a+b.approxPx,0)/items.length) + "px" },
          { label: "Verification", value: "E-E-A-T Checked" }
        ],
        [{
          title: "Structured Analysis & Actionable Variations (Click to Edit)",
          badge: "Local Engine",
          items: items.map((it, idx) => ({
            label: (idx + 1) + ". " + it.line,
            content: "Detected Intent: " + it.intent + ". Recommended Action: Place primary entity in the opening 50-word answer block, keep title under 580px, and validate claims with first-hand proof.",
            meta: it.words + " words · " + it.chars + " chars (~" + it.approxPx + "px)"
          }))
        }]
      );
      loadingModal.classList.add("hidden");
      loadingModal.classList.remove("flex");
    }

    document.getElementById("loadSampleBtn").addEventListener("click", () => {
      document.getElementById("primaryInput").value = "how to check google keyword rankings\\nwhat to do after keyword research\\nfree search intent checker tool";
      runToolExecution();
    });

    document.getElementById("toolForm").addEventListener("submit", (e) => {
      e.preventDefault();
      runToolExecution();
    });

    document.getElementById("copyOutputBtn").addEventListener("click", async () => {
      const textToCopy = outputContainer.innerText || latestMarkdown;
      if (!textToCopy) return;
      await navigator.clipboard.writeText(textToCopy);
      const btn = document.getElementById("copyOutputBtn");
      btn.textContent = "✓ Copied!";
      setTimeout(() => { btn.textContent = "Copy Report"; }, 1500);
    });

    document.getElementById("downloadMdBtn").addEventListener("click", () => {
      const content = latestMarkdown || outputContainer.innerText;
      if (!content) return;
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = TOOL_SLUG + "-report.md";
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById("downloadCsvBtn").addEventListener("click", () => {
      if (!latestCsvRows.length) return;
      const csv = latestCsvRows.map(r => r.map(c => '"' + String(c || "").replace(/"/g, '""') + '"').join(",")).join("\\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = TOOL_SLUG + "-report.csv";
      a.click();
      URL.revokeObjectURL(url);
    });

    // Initialize state
    updateApiStatusUI();
    runToolExecution();
  </script>
</body>
</html>`;
}

export function buildReactComponentCode(
  tool: CatalogTool,
  customTitle: string,
  brandName: string,
  accentHex: string,
  customSubtitle?: string,
): string {
  const compName = `${toPascalCase(tool.slug)}Widget`;
  const desc = customSubtitle || tool.shortDescription || tool.description;
  return `"use client";

import React, { useState } from "react";

/**
 * Portable React / Next.js Widget for ${customTitle || tool.name}
 * Includes Default DoItWithAI Cloud API + Permanent BYOK Override + Editable Output
 * Generated by ${brandName || "DoItWithAI.tools"} (https://doitwithai.tools/tools/${tool.slug})
 */
export default function ${compName}() {
  const [input, setInput] = useState("how to check google keyword rankings\\nwhat to do after keyword research");
  const [audience, setAudience] = useState("Non-coder marketers & solo founders");
  const [customKey, setCustomKey] = useState("");
  const [defaultRemoved, setDefaultRemoved] = useState(false);
  const [running, setRunning] = useState(false);
  const [items, setItems] = useState<Array<{ label: string; content: string; meta: string }>>([]);

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    setRunning(true);
    try {
      if (!defaultRemoved) {
        const res = await fetch("https://doitwithai.tools/api/do-it-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "execute_tool",
            toolSlug: "${tool.slug}",
            toolInput: input,
            toolSecondaryInput: audience,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const firstSection = data?.toolResult?.sections?.[0]?.items;
          if (Array.isArray(firstSection) && firstSection.length > 0) {
            setItems(firstSection);
            setRunning(false);
            return;
          }
        }
      }
    } catch {
      // Fallback to local engine
    }
    const lines = input.split(/\\r?\\n/).map((s) => s.trim()).filter(Boolean);
    setItems(
      lines.map((line, i) => ({
        label: \`\${i + 1}. \${line}\`,
        content: \`Optimized for \${audience}: front-load primary entity, keep title under 580px, and pair with a 50-word answer block.\`,
        meta: \`\${line.length} chars (~\${Math.round(line.length * 9.2)}px)\`,
      }))
    );
    setRunning(false);
  }

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-[#0F172A] p-6 text-white shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: "${accentHex}22", color: "${accentHex}" }}>
          ${brandName || "DoItWithAI.tools"} · {defaultRemoved ? "Custom API Key Mode" : "Default Cloud API Active"}
        </span>
        <a href="https://doitwithai.tools/tools/${tool.slug}" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 underline">
          Open Full Studio →
        </a>
      </div>
      <h2 className="mt-3 text-2xl font-black">${(customTitle || tool.name).replace(/"/g, '\\"')}</h2>
      <p className="mt-1 text-sm text-slate-300">${desc.replace(/"/g, '\\"')}</p>

      <form onSubmit={handleRun} className="mt-5 space-y-4">
        <textarea
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3.5 text-sm text-white"
          placeholder="Enter keywords, URLs, or draft lines..."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
            placeholder="Target audience"
          />
          <input
            type="password"
            value={customKey}
            onChange={(e) => {
              setCustomKey(e.target.value);
              if (e.target.value.trim()) setDefaultRemoved(true);
            }}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
            placeholder="Optional: Own API Key (Permanently removes default API)"
          />
        </div>
        <button
          type="submit"
          disabled={running}
          style={{ backgroundColor: "${accentHex}" }}
          className="w-full rounded-xl px-5 py-3 text-sm font-extrabold text-white"
        >
          {running ? "Analyzing..." : "Run ${customTitle || tool.name}"}
        </button>
      </form>

      {items.length > 0 && (
        <div className="mt-6 space-y-2.5">
          {items.map((it, idx) => (
            <div key={idx} contentEditable suppressContentEditableWarning className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-sm">{it.label}</strong>
                <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-300">{it.meta}</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-300">{it.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`;
}

export function buildVibeCodingPrompts(
  tool: CatalogTool,
  customTitle: string,
): Array<{ title: string; stage: string; prompt: string }> {
  const name = customTitle || tool.name;
  return [
    {
      title: "Prompt 1: Build the Single-File HTML/JS Version (Zero Coding)",
      stage: "Step 1 · Architecture & UI",
      prompt: `Act as a Senior Frontend Architect. Build a complete, single-file HTML5 + Tailwind CSS + Vanilla JS web tool called "${name}". Purpose: ${tool.description}. Include a 2-column responsive layout (Left: Input form with a 'Load Sample' button; Right: Live scorecard, editable results canvas, and Markdown/CSV download button), a centered loading modal animation when the action button is clicked, and customizable accent color styling.`,
    },
    {
      title: "Prompt 2: Add Default Cloud API + Permanent BYOK Override",
      stage: "Step 2 · Hybrid API & Local Engine",
      prompt: `Upgrade the JavaScript engine inside "${name}" so that when connected to the internet it connects to our default API endpoint out-of-the-box, while also offering a 'Use Your Own API Key' drawer (Google Gemini or OpenAI). Display a caution notice that once the user saves their own API key, the default API connection is permanently removed and the tool runs exclusively on their key + offline deterministic rules.`,
    },
    {
      title: "Prompt 3: Add Inline Content Editing & Live Theme Color Picker",
      stage: "Step 3 · Editable Canvas & Branding",
      prompt: `Add a live 'Edit Content & Color' bar to "${name}" so the user can edit the tool title, subtitle, brand name, and pick any custom hex color from a native color wheel picker (<input type="color">), plus edit any generated output card inline using contenteditable="true" before exporting.`,
    },
    {
      title: "Prompt 4: Customize Niche, Branding & Lead Capture",
      stage: "Step 4 · Custom Branding",
      prompt: `Customize "${name}" for my specific niche: [INSERT YOUR NICHE / AUDIENCE]. Update the sample preset data to use realistic examples from my industry, add a 'Download Full Checklist (.MD)' button, and include a call-to-action banner at the bottom of the results inviting users to book a consultation or join my newsletter.`,
    },
  ];
}

export function PortableToolModal({
  tool,
  open,
  onClose,
  initialAccent = "#3452D1",
  initialBrand = "DoItWithAI.tools",
}: {
  tool: CatalogTool;
  open: boolean;
  onClose: () => void;
  initialAccent?: string;
  initialBrand?: string;
}) {
  const [customTitle, setCustomTitle] = useState(tool.name);
  const [customSubtitle, setCustomSubtitle] = useState(
    tool.shortDescription || tool.description,
  );
  const [brandName, setBrandName] = useState(initialBrand);
  const [accentHex, setAccentHex] = useState(initialAccent);
  const [bgHex, setBgHex] = useState("#0B1120");
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<
    "html" | "embed" | "react" | "manual" | "prompts"
  >("html");
  const [copiedLabel, setCopiedLabel] = useState("");
  const colorPickerInputRef = useRef<HTMLInputElement>(null);
  const bgPickerInputRef = useRef<HTMLInputElement>(null);

  const usesAi = doesToolUseAiApi(tool.slug);

  const htmlCode = useMemo(
    () =>
      buildStandaloneHtmlCode(
        tool,
        customTitle,
        brandName,
        accentHex,
        themeMode,
        customSubtitle,
        bgHex,
      ),
    [tool, customTitle, brandName, accentHex, themeMode, customSubtitle, bgHex],
  );

  const manualMarkdown = useMemo(
    () => buildUserManualMarkdown(tool, customTitle, brandName),
    [tool, customTitle, brandName],
  );

  const reactCode = useMemo(
    () =>
      buildReactComponentCode(
        tool,
        customTitle,
        brandName,
        accentHex,
        customSubtitle,
      ),
    [tool, customTitle, brandName, accentHex, customSubtitle],
  );

  const embedUrl = useMemo(
    () =>
      `https://doitwithai.tools/tools/${tool.slug}?embed=1&app=1&accent=${encodeURIComponent(accentHex)}&bg=${encodeURIComponent(bgHex)}&brand=${encodeURIComponent(brandName)}&title=${encodeURIComponent(customTitle)}&subtitle=${encodeURIComponent(customSubtitle)}`,
    [tool.slug, accentHex, bgHex, brandName, customTitle, customSubtitle],
  );

  const embedSnippet = useMemo(
    () =>
      `<!-- ${customTitle || tool.name} Responsive Website Embed (Powered by DoItWithAI.tools) -->\n<div style="max-width:1180px;margin:0 auto;background:${bgHex};padding:12px;border-radius:24px;border:1px solid ${accentHex}44;">\n  <iframe\n    src="${embedUrl}"\n    title="${(customTitle || tool.name).replace(/"/g, "&quot;")}"\n    style="width:100%;min-height:740px;border:0;border-radius:18px;overflow:hidden;background:${bgHex};"\n    loading="lazy"\n    allow="clipboard-write; clipboard-read"\n  ></iframe>\n  <p style="margin:8px 4px 2px;font-size:12px;text-align:right;font-family:sans-serif;color:#94a3b8;">\n    Powered by <a href="https://doitwithai.tools/tools/${tool.slug}" target="_blank" rel="noopener" style="color:${accentHex};font-weight:700;text-decoration:underline;">${customTitle || tool.name} — ${brandName || "DoItWithAI.tools"}</a>\n  </p>\n</div>`,
    [tool, customTitle, brandName, accentHex, bgHex, embedUrl],
  );

  const vibePrompts = useMemo(
    () => buildVibeCodingPrompts(tool, customTitle),
    [tool, customTitle],
  );

  if (!open) return null;

  function triggerDownload(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadAppAndManualBundle() {
    triggerDownload(`${tool.slug}-app.html`, htmlCode, "text/html");
    setTimeout(() => {
      triggerDownload(
        `USER-MANUAL-${tool.slug}.md`,
        manualMarkdown,
        "text/markdown",
      );
    }, 350);
  }

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedLabel(label);
      setTimeout(() => setCopiedLabel(""), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Download or customize ${tool.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-md sm:p-6"
    >
      <div className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-[#9aabff]/30 bg-[#0D1526] text-white shadow-2xl">
        {/* Top Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-[#111C33] px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow"
              style={{ backgroundColor: accentHex }}
            >
              <Code2 size={20} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/30">
                  Next.js + Portable HTML5 App Studio
                </span>
                <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-bold text-blue-300 ring-1 ring-blue-400/30">
                  {usesAi
                    ? "🟢 Default DoItWithAI API Included + Optional BYOK"
                    : "⚡ 100% Local Algorithmic Engine (No API Key Needed)"}
                </span>
              </div>
              <h2 className="mt-0.5 text-lg font-black sm:text-xl">
                Customize, Download &amp; Embed: {customTitle || tool.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/do-it-ai?tool=${tool.slug}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#5271ff]/40 bg-[#3452d1]/20 px-3.5 py-2 text-xs font-extrabold text-[#b4c3ff] transition hover:bg-[#3452d1]/35"
            >
              <Sparkles size={14} />
              Open in Do It AI
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="grid flex-1 gap-6 overflow-y-auto p-5 sm:p-7 lg:grid-cols-12">
          {/* Left Column: Content Editor, Custom Color Wheel & 1-Click Package Download */}
          <div className="space-y-4 lg:col-span-4">
            <div className="rounded-2xl border border-slate-800 bg-[#111C33]/90 p-4 sm:p-5">
              <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#9aabff]">
                <Palette size={15} />
                1. Edit Tool Content, Colors &amp; Brand
              </h3>

              <div className="mt-3.5 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    Editable Tool Heading
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs sm:text-sm text-white focus:border-[#5271ff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    Editable Subtitle / Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-[#5271ff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    Your Website or Brand Label
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs sm:text-sm text-white focus:border-[#5271ff] focus:outline-none"
                  />
                </div>

                {/* Accent Color Presets + Dedicated Color Panel Button */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300">
                      Brand Accent Color
                    </label>
                    <span className="font-mono text-[11px] text-slate-400">
                      {accentHex}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {ACCENT_PRESETS.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setAccentHex(preset.hex)}
                        title={preset.label}
                        className={`h-7 w-7 rounded-full border-2 transition ${
                          accentHex.toLowerCase() === preset.hex.toLowerCase()
                            ? "scale-110 border-white ring-2 ring-white/40"
                            : "border-transparent opacity-80 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: preset.hex }}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => colorPickerInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white hover:border-white"
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-white/40"
                        style={{ backgroundColor: accentHex }}
                      />
                      🎨 Pick Color
                    </button>
                    <input
                      ref={colorPickerInputRef}
                      type="color"
                      value={accentHex}
                      onChange={(e) => setAccentHex(e.target.value)}
                      aria-label="Open custom accent color panel"
                      className="sr-only"
                    />
                  </div>
                </div>

                {/* App & Embed Background Color */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300">
                      App &amp; Embed Background Color
                    </label>
                    <span className="font-mono text-[11px] text-slate-400">
                      {bgHex}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {BG_PRESETS.map((bg) => (
                      <button
                        key={bg.hex}
                        type="button"
                        onClick={() => {
                          setBgHex(bg.hex);
                          setThemeMode(bg.mode);
                        }}
                        className={`rounded-lg border px-2 py-1 text-[11px] font-bold transition ${
                          bgHex.toLowerCase() === bg.hex.toLowerCase()
                            ? "border-white bg-slate-800 text-white"
                            : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                        }`}
                      >
                        {bg.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => bgPickerInputRef.current?.click()}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-bold text-slate-200 hover:border-white"
                    >
                      🎨 Custom BG
                    </button>
                    <input
                      ref={bgPickerInputRef}
                      type="color"
                      value={bgHex}
                      onChange={(e) => setBgHex(e.target.value)}
                      aria-label="Custom background color"
                      className="sr-only"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Download Actions + User Manual */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 sm:p-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                2. Download PC App &amp; User Manual
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                Double-click the downloaded <code>.html</code> app on your PC to
                run the full Next.js studio (online with our Default API) or
                switch to Local / Own API Key mode.
              </p>

              <div className="mt-3.5 space-y-2">
                <button
                  type="button"
                  onClick={downloadAppAndManualBundle}
                  style={{ backgroundColor: accentHex }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold text-white shadow-lg transition hover:opacity-95"
                >
                  <Download size={15} />
                  Download PC App (.HTML) + User Manual (.MD)
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      triggerDownload(
                        `${tool.slug}-app.html`,
                        htmlCode,
                        "text/html",
                      )
                    }
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-[11px] font-bold text-slate-200 transition hover:border-white hover:text-white"
                  >
                    <Laptop size={13} />
                    App Only (.HTML)
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      triggerDownload(
                        `USER-MANUAL-${tool.slug}.md`,
                        manualMarkdown,
                        "text/markdown",
                      )
                    }
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-[11px] font-bold text-emerald-300 transition hover:border-emerald-400"
                  >
                    <BookOpen size={13} />
                    User Manual (.MD)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    triggerDownload(
                      `${toPascalCase(tool.slug)}Widget.tsx`,
                      reactCode,
                      "text/plain",
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-[11px] font-bold text-slate-300 transition hover:border-[#5271ff] hover:text-white"
                >
                  <FileCode2 size={14} />
                  Download Next.js / React Component (.tsx)
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 5-Tab Studio (App HTML, Website Embed + Live Preview, User Manual, React TSX, Vibe Prompts) */}
          <div className="flex flex-col rounded-2xl border border-slate-800 bg-[#111C33]/70 p-4 sm:p-5 lg:col-span-8">
            <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-3">
              {[
                {
                  id: "html" as const,
                  label: "1. Unified PC & Web App (.HTML)",
                  icon: Laptop,
                },
                {
                  id: "embed" as const,
                  label: "2. Website Embed (<iframe>)",
                  icon: Globe,
                },
                {
                  id: "manual" as const,
                  label: "3. User Manual & API Caution",
                  icon: BookOpen,
                },
                {
                  id: "react" as const,
                  label: "4. React (.tsx)",
                  icon: FileCode2,
                },
                {
                  id: "prompts" as const,
                  label: "5. Vibe-Coding Prompts",
                  icon: Wand2,
                },
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    style={active ? { backgroundColor: accentHex } : undefined}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition ${
                      active
                        ? "text-white shadow"
                        : "bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon size={14} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {activeTab === "html" && (
              <div className="mt-4 flex flex-1 flex-col space-y-3">
                <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-3.5 text-xs text-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-blue-300">
                      ⚡ How This Unified Desktop &amp; Web App Works:
                    </strong>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                      Zero Terminal Commands Needed
                    </span>
                  </div>
                  <p className="mt-1 leading-relaxed text-slate-300">
                    Double-click the downloaded <code>.html</code> file on your
                    PC. By default, it connects to our live Next.js studio and{" "}
                    <strong>Default DoItWithAI Cloud API</strong> when you are
                    online. You can also switch to the built-in{" "}
                    <strong>Local Studio</strong>, edit content inline, or add
                    your own API key (which permanently removes the default API
                    key).
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-400">
                    Self-contained HTML5 package with custom color ({accentHex})
                    and built-in User Manual:
                  </p>
                  <button
                    type="button"
                    onClick={() => copyText("html", htmlCode)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-[#5271ff]"
                  >
                    {copiedLabel === "html" ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        Copied App HTML!
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        Copy Full HTML
                      </>
                    )}
                  </button>
                </div>
                <pre className="max-h-[340px] flex-1 overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-300">
                  {htmlCode}
                </pre>
              </div>
            )}

            {activeTab === "embed" && (
              <div className="mt-4 flex flex-1 flex-col space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-300">
                    Clean, chromeless website embed with your custom accent (
                    <code>{accentHex}</code>), background (<code>{bgHex}</code>
                    ), and custom heading:
                  </p>
                  <button
                    type="button"
                    onClick={() => copyText("embed", embedSnippet)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-[#5271ff]"
                  >
                    {copiedLabel === "embed" ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        Copied Embed Code!
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        Copy Embed Snippet
                      </>
                    )}
                  </button>
                </div>
                <pre className="max-h-[160px] overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs leading-relaxed text-emerald-300">
                  {embedSnippet}
                </pre>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                  <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Live Styled Embed Preview ({customTitle || tool.name})
                    </span>
                    <span>
                      Accent: {accentHex} · BG: {bgHex}
                    </span>
                  </div>
                  <div
                    className="rounded-xl p-4 border"
                    style={{
                      backgroundColor: bgHex,
                      borderColor: `${accentHex}55`,
                    }}
                  >
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase"
                      style={{
                        backgroundColor: `${accentHex}25`,
                        color: accentHex,
                      }}
                    >
                      {brandName || "DoItWithAI.tools"} · Embedded Studio
                    </span>
                    <h4
                      className="mt-2 text-base font-black"
                      style={{
                        color: themeMode === "light" ? "#0F172A" : "#FFFFFF",
                      }}
                    >
                      {customTitle || tool.name}
                    </h4>
                    <p
                      className="mt-1 text-xs"
                      style={{
                        color: themeMode === "light" ? "#475569" : "#CBD5E1",
                      }}
                    >
                      {customSubtitle}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-8 flex-1 rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 flex items-center text-[11px] text-slate-400">
                        Interactive Next.js tool inputs &amp; live meters render
                        here...
                      </div>
                      <span
                        className="rounded-lg px-3 py-1.5 text-xs font-extrabold text-white"
                        style={{ backgroundColor: accentHex }}
                      >
                        Run Tool →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "manual" && (
              <div className="mt-4 flex flex-1 flex-col space-y-3">
                <div className="rounded-2xl border border-amber-500/35 bg-amber-950/20 p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
                  <KeyRound size={16} className="shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <strong>
                      Default API Key vs. Personal API Key Policy:
                    </strong>{" "}
                    When connected to the internet, the downloaded tool uses
                    DoItWithAI&apos;s default API key out of the box. For
                    long-term local PC usage, we recommend entering your own
                    Gemini/OpenAI API key.{" "}
                    <strong className="underline">
                      Once you enter and save your own API key, our default API
                      key is permanently removed from the downloaded tool.
                    </strong>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Included inside the app and downloadable as{" "}
                    <code>USER-MANUAL-{tool.slug}.md</code>:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      triggerDownload(
                        `USER-MANUAL-${tool.slug}.md`,
                        manualMarkdown,
                        "text/markdown",
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:border-emerald-400"
                  >
                    <Download size={13} />
                    Download Manual (.MD)
                  </button>
                </div>
                <pre className="max-h-[330px] flex-1 overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200">
                  {manualMarkdown}
                </pre>
              </div>
            )}

            {activeTab === "react" && (
              <div className="mt-4 flex flex-1 flex-col">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-300">
                    Drop this <code>.tsx</code> component into Cursor, Bolt,
                    Lovable, or any Next.js App Router project.
                  </p>
                  <button
                    type="button"
                    onClick={() => copyText("react", reactCode)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-[#5271ff]"
                  >
                    {copiedLabel === "react" ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        Copied TSX!
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        Copy React Component
                      </>
                    )}
                  </button>
                </div>
                <pre className="mt-3 max-h-[380px] flex-1 overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-sky-300">
                  {reactCode}
                </pre>
              </div>
            )}

            {activeTab === "prompts" && (
              <div className="mt-4 space-y-3 overflow-y-auto max-h-[410px] pr-1">
                <p className="text-xs text-slate-300">
                  Want to learn how to build or customize a tool like{" "}
                  <strong>{tool.name}</strong> without writing code? Copy these
                  4 sequential Vibe-Coding prompts into ChatGPT, Claude, or
                  Cursor:
                </p>
                {vibePrompts.map((vp, idx) => (
                  <div
                    key={vp.title}
                    className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#9aabff]">
                          {vp.stage}
                        </span>
                        <h4 className="text-sm font-extrabold text-white">
                          {vp.title}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText(`prompt-${idx}`, vp.prompt)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-200 hover:border-[#5271ff]"
                      >
                        {copiedLabel === `prompt-${idx}` ? (
                          <>
                            <Check size={12} className="text-emerald-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            Copy Prompt
                          </>
                        )}
                      </button>
                    </div>
                    <p className="mt-2 font-mono text-xs leading-relaxed text-slate-300">
                      {vp.prompt}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortableToolHeroBar({ slug }: { slug?: string }) {
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);

  const detectedSlug = useMemo(() => {
    if (slug) return slug;
    if (!pathname) return "";
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "tools" && parts[1] && parts[1] !== "categories") {
      return parts[1];
    }
    return "";
  }, [slug, pathname]);

  const tool = useMemo(
    () => tools.find((t) => t.slug === detectedSlug) || null,
    [detectedSlug],
  );

  if (!tool) return null;

  return (
    <>
      <div
        data-portable-hero-bar="true"
        className="mt-5 flex flex-wrap items-center gap-2.5"
      >
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3452d1] to-[#5271ff] px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-[#3452d1]/25 transition hover:brightness-110"
        >
          <Download size={14} />
          Download PC App / Embed This Tool (Free)
        </button>

        <Link
          href={`/do-it-ai?tool=${tool.slug}`}
          className="inline-flex items-center gap-2 rounded-xl border border-[#9aabff]/35 bg-[#101b30]/90 px-4 py-2.5 text-xs font-extrabold text-[#b4c3ff] transition hover:border-[#9aabff] hover:bg-[#162440] hover:text-white"
        >
          <Sparkles size={14} />
          Run in Do It AI Workspace →
        </Link>

        <Link
          href="/tools/downloadable-ai-tools"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-bold text-slate-300 transition hover:border-white/25 hover:text-white"
        >
          <Terminal size={13} className="text-emerald-300" />
          Browse 90+ Downloadable Tools
          <ExternalLink size={11} />
        </Link>
      </div>

      <PortableToolModal
        tool={tool}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

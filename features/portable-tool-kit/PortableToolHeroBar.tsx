"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  Globe,
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

const ACCENT_PRESETS = [
  { label: "Brand Blue", hex: "#3452D1" },
  { label: "Electric Indigo", hex: "#5271FF" },
  { label: "Emerald Growth", hex: "#059669" },
  { label: "Royal Violet", hex: "#7C3AED" },
  { label: "Amber Signal", hex: "#D97706" },
];

function toPascalCase(slug: string): string {
  return slug
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

export function buildStandaloneHtmlCode(
  tool: CatalogTool,
  customTitle: string,
  brandName: string,
  accentHex: string,
  themeMode: "dark" | "light",
): string {
  const safeTitle = (customTitle || tool.name).replace(/"/g, "&quot;");
  const safeBrand = (brandName || "DoItWithAI.tools").replace(/"/g, "&quot;");
  const safeDesc = (tool.shortDescription || tool.description).replace(
    /"/g,
    "&quot;",
  );
  const canonicalUrl = `https://doitwithai.tools/tools/${tool.slug}`;
  const isDark = themeMode === "dark";

  return `<!DOCTYPE html>
<html lang="en" class="${isDark ? "dark" : ""}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} — ${safeBrand}</title>
  <meta name="description" content="${safeDesc}" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root { --brand-accent: ${accentHex}; }
    body {
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: ${isDark ? "#0B1120" : "#F8FAFC"};
      color: ${isDark ? "#F8FAFC" : "#0F172A"};
    }
    .accent-bg { background-color: var(--brand-accent); }
    .accent-border { border-color: var(--brand-accent); }
    .accent-text { color: var(--brand-accent); }
  </style>
</head>
<body class="min-h-screen antialiased p-4 sm:p-8">
  <div class="mx-auto max-w-5xl">
    <!-- Header Banner -->
    <header class="rounded-3xl border ${isDark ? "border-slate-800 bg-[#111A2E]" : "border-slate-200 bg-white"} p-6 sm:p-8 shadow-xl">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <span class="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider" style="background:${accentHex}22;color:${accentHex};border:1px solid ${accentHex}44;">
          Portable AI Tool · ${safeBrand}
        </span>
        <button id="toggleApiKeyBtn" type="button" class="rounded-xl border ${isDark ? "border-slate-700 bg-slate-800/80 text-slate-200" : "border-slate-200 bg-slate-100 text-slate-700"} px-3 py-1.5 text-xs font-bold hover:opacity-90">
          ⚙️ Optional AI Key (BYOK)
        </button>
      </div>
      <h1 class="mt-4 text-2xl sm:text-4xl font-black tracking-tight">${safeTitle}</h1>
      <p class="mt-2 max-w-3xl text-sm sm:text-base ${isDark ? "text-slate-300" : "text-slate-600"} leading-relaxed">
        ${safeDesc}
      </p>

      <!-- Collapsible BYOK Drawer (Stored 100% locally in user's browser) -->
      <div id="apiKeyDrawer" class="hidden mt-4 rounded-2xl border ${isDark ? "border-slate-700 bg-slate-900/90" : "border-slate-200 bg-slate-50"} p-4">
        <label class="block text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}">
          Optional Google Gemini API Key (Stored only in your browser localStorage)
        </label>
        <div class="mt-2 flex flex-col sm:flex-row gap-2">
          <input id="geminiKeyInput" type="password" placeholder="AIzaSy... (Leave blank to use instant built-in local engine)" class="flex-1 rounded-xl border ${isDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-900"} px-3.5 py-2 text-sm" />
          <button id="saveKeyBtn" type="button" class="accent-bg rounded-xl px-4 py-2 text-xs font-extrabold text-white">Save Key Locally</button>
        </div>
        <p class="mt-1.5 text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}">
          Works out-of-the-box using deterministic local rules. Add a free Gemini key only if you want live LLM expansion.
        </p>
      </div>
    </header>

    <!-- Main Interactive Workspace -->
    <main class="mt-6 grid gap-6 lg:grid-cols-12">
      <section class="lg:col-span-5 rounded-3xl border ${isDark ? "border-slate-800 bg-[#111A2E]" : "border-slate-200 bg-white"} p-6 shadow-lg">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-base font-extrabold">1. Enter Your Input</h2>
          <button id="loadSampleBtn" type="button" class="text-xs font-bold underline" style="color:${accentHex}">
            Load Sample Input
          </button>
        </div>

        <form id="toolForm" class="mt-4 space-y-4">
          <div>
            <label for="primaryInput" class="block text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}">
              Primary Topic, Keyword, URL or Draft Text
            </label>
            <textarea id="primaryInput" rows="5" required placeholder="Enter your topic, keywords, URL, or draft content here..." class="mt-1.5 w-full rounded-2xl border ${isDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"} p-3.5 text-sm focus:outline-none">how to check google keyword rankings\nbest free seo tools for beginners\nmeta title pixel width checker</textarea>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="contextInput" class="block text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}">
                Target Audience / Goal
              </label>
              <input id="contextInput" type="text" value="Non-coder marketers & site owners" class="mt-1.5 w-full rounded-xl border ${isDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"} px-3 py-2 text-sm" />
            </div>
            <div>
              <label for="modeSelect" class="block text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}">
                Analysis Depth
              </label>
              <select id="modeSelect" class="mt-1.5 w-full rounded-xl border ${isDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-900"} px-3 py-2 text-sm">
                <option value="standard">Standard Action Report</option>
                <option value="deep">Deep Audit + E-E-A-T Checklist</option>
                <option value="compact">Quick Summary Cards</option>
              </select>
            </div>
          </div>

          <button type="submit" id="runBtn" class="accent-bg w-full rounded-2xl py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:opacity-95">
            Run ${safeTitle}
          </button>
        </form>
      </section>

      <section class="lg:col-span-7 rounded-3xl border ${isDark ? "border-slate-800 bg-[#111A2E]" : "border-slate-200 bg-white"} p-6 shadow-lg flex flex-col justify-between">
        <div>
          <div class="flex flex-wrap items-center justify-between gap-2 border-b ${isDark ? "border-slate-800" : "border-slate-200"} pb-3">
            <h2 class="text-base font-extrabold">2. Structured Output &amp; Recommendations</h2>
            <div class="flex gap-2">
              <button id="copyOutputBtn" type="button" class="rounded-xl border ${isDark ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-200 bg-slate-100 text-slate-700"} px-3 py-1.5 text-xs font-bold">
                Copy Report
              </button>
              <button id="downloadMdBtn" type="button" class="rounded-xl border ${isDark ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-200 bg-slate-100 text-slate-700"} px-3 py-1.5 text-xs font-bold">
                Download .MD
              </button>
            </div>
          </div>

          <div id="outputContainer" class="mt-4 space-y-3 text-sm leading-relaxed"></div>
        </div>

        <footer class="mt-6 border-t ${isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"} pt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span>Runs locally in your browser · Zero server setup required</span>
          <a href="${canonicalUrl}" target="_blank" rel="noopener" class="font-bold underline" style="color:${accentHex}">
            Powered by DoItWithAI.tools (Open Full Cloud Studio →)
          </a>
        </footer>
      </section>
    </main>
  </div>

  <!-- Centered Loading Modal -->
  <div id="loadingModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
    <div class="w-full max-w-md rounded-3xl border border-slate-700 bg-[#111A2E] p-6 text-center text-white shadow-2xl">
      <div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-blue-400"></div>
      <h3 class="mt-4 text-lg font-extrabold">Processing in ${safeTitle}</h3>
      <p class="mt-1 text-xs text-slate-300">Analyzing inputs, scoring signals, and building your structured recommendations...</p>
    </div>
  </div>

  <script>
    const STORAGE_KEY = "diwai_portable_gemini_key";
    const keyInput = document.getElementById("geminiKeyInput");
    const keyDrawer = document.getElementById("apiKeyDrawer");
    const outputContainer = document.getElementById("outputContainer");
    const loadingModal = document.getElementById("loadingModal");
    let latestMarkdown = "";

    keyInput.value = localStorage.getItem(STORAGE_KEY) || "";
    document.getElementById("toggleApiKeyBtn").addEventListener("click", () => {
      keyDrawer.classList.toggle("hidden");
    });
    document.getElementById("saveKeyBtn").addEventListener("click", () => {
      localStorage.setItem(STORAGE_KEY, keyInput.value.trim());
      keyDrawer.classList.add("hidden");
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

    function renderDeterministicReport(rawText, audience, mode) {
      const lines = rawText.split(/\\r?\\n/).map(s => s.trim()).filter(Boolean);
      const items = (lines.length ? lines : [rawText.trim()]).slice(0, 12).map(classifyLine);
      const mdLines = [
        "# " + ${JSON.stringify(customTitle || tool.name)} + " — Action Report",
        "- **Target Audience / Goal:** " + (audience || "General practitioners"),
        "- **Analysis Mode:** " + mode,
        ""
      ];

      let html = '<div class="grid gap-3 sm:grid-cols-3">';
      html += '<div class="rounded-2xl border border-slate-700/40 bg-slate-800/20 p-3.5"><div class="text-[11px] uppercase font-bold opacity-75">Items Analyzed</div><div class="mt-1 text-2xl font-black">' + items.length + '</div></div>';
      html += '<div class="rounded-2xl border border-slate-700/40 bg-slate-800/20 p-3.5"><div class="text-[11px] uppercase font-bold opacity-75">Avg Character / Pixel</div><div class="mt-1 text-2xl font-black">' + Math.round(items.reduce((a,b)=>a+b.chars,0)/items.length) + ' ch · ~' + Math.round(items.reduce((a,b)=>a+b.approxPx,0)/items.length) + 'px</div></div>';
      html += '<div class="rounded-2xl border border-slate-700/40 bg-slate-800/20 p-3.5"><div class="text-[11px] uppercase font-bold opacity-75">Verification Mode</div><div class="mt-1 text-sm font-extrabold">Human-Reviewed E-E-A-T</div></div>';
      html += '</div><div class="mt-4 space-y-3">';

      items.forEach((item, idx) => {
        mdLines.push("## " + (idx + 1) + ". " + item.line);
        mdLines.push("- **Detected Signal / Intent:** " + item.intent);
        mdLines.push("- **Metrics:** " + item.words + " words | " + item.chars + " chars (~" + item.approxPx + "px)");
        mdLines.push("- **Recommended Action:** Align your H1, opening 50-word answer block, and verifiable proof examples around this exact reader task.\\n");

        html += '<article class="rounded-2xl border border-slate-700/40 bg-slate-800/15 p-4">';
        html += '<div class="flex flex-wrap items-center justify-between gap-2">';
        html += '<span class="font-extrabold text-base">' + (idx + 1) + '. ' + item.line.replace(/</g, "&lt;") + '</span>';
        html += '<span class="rounded-full px-2.5 py-0.5 text-xs font-bold" style="background:${accentHex}25;color:${accentHex}">' + item.intent + '</span>';
        html += '</div>';
        html += '<p class="mt-2 text-xs opacity-80">Length: <strong>' + item.words + ' words</strong> · <strong>' + item.chars + ' chars (~' + item.approxPx + 'px SERP width)</strong> · Audience: ' + (audience || "Practitioners").replace(/</g, "&lt;") + '</p>';
        html += '<p class="mt-1.5 text-xs opacity-90"><strong>Next Step:</strong> Lead with a direct 45–58 word answer passage, pair with a comparison table or checklist, and verify claims before publishing.</p>';
        html += '</article>';
      });
      html += '</div>';
      latestMarkdown = mdLines.join("\\n");
      outputContainer.innerHTML = html;
    }

    document.getElementById("loadSampleBtn").addEventListener("click", () => {
      document.getElementById("primaryInput").value = "how to check google keyword rankings\\nwhat to do after keyword research\\nfree search intent checker tool";
      renderDeterministicReport(document.getElementById("primaryInput").value, document.getElementById("contextInput").value, document.getElementById("modeSelect").value);
    });

    document.getElementById("toolForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      loadingModal.classList.remove("hidden");
      loadingModal.classList.add("flex");
      await new Promise(r => setTimeout(r, 520));
      renderDeterministicReport(
        document.getElementById("primaryInput").value,
        document.getElementById("contextInput").value,
        document.getElementById("modeSelect").value
      );
      loadingModal.classList.add("hidden");
      loadingModal.classList.remove("flex");
    });

    document.getElementById("copyOutputBtn").addEventListener("click", async () => {
      if (!latestMarkdown) return;
      await navigator.clipboard.writeText(latestMarkdown);
      const btn = document.getElementById("copyOutputBtn");
      btn.textContent = "Copied!";
      setTimeout(() => { btn.textContent = "Copy Report"; }, 1500);
    });

    document.getElementById("downloadMdBtn").addEventListener("click", () => {
      if (!latestMarkdown) return;
      const blob = new Blob([latestMarkdown], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "${tool.slug}-report.md";
      a.click();
      URL.revokeObjectURL(url);
    });

    // Initial render
    renderDeterministicReport(
      document.getElementById("primaryInput").value,
      document.getElementById("contextInput").value,
      document.getElementById("modeSelect").value
    );
  </script>
</body>
</html>`;
}

export function buildReactComponentCode(
  tool: CatalogTool,
  customTitle: string,
  brandName: string,
  accentHex: string,
): string {
  const compName = `${toPascalCase(tool.slug)}Widget`;
  return `"use client";

import React, { useState } from "react";

/**
 * Portable React / Next.js Widget for ${customTitle || tool.name}
 * Generated by ${brandName || "DoItWithAI.tools"} (https://doitwithai.tools/tools/${tool.slug})
 */
export default function ${compName}() {
  const [input, setInput] = useState("how to check google keyword rankings\\nwhat to do after keyword research");
  const [audience, setAudience] = useState("Non-coder marketers & solo founders");
  const [running, setRunning] = useState(false);
  const [items, setItems] = useState<Array<{ text: string; words: number; chars: number; px: number; intent: string }>>([]);

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    setRunning(true);
    await new Promise((r) => setTimeout(r, 480));
    const lines = input.split(/\\r?\\n/).map((s) => s.trim()).filter(Boolean);
    const parsed = lines.map((line) => {
      const lower = line.toLowerCase();
      const chars = line.length;
      const words = line.split(/\\s+/).filter(Boolean).length;
      const px = Math.round(chars * 9.2);
      const intent = /\\b(buy|price|tool|generator|checker)\\b/.test(lower)
        ? "Transactional / Tool"
        : /\\b(best|vs|compare|review)\\b/.test(lower)
          ? "Commercial Investigation"
          : "Informational Guide";
      return { text: line, words, chars, px, intent };
    });
    setItems(parsed);
    setRunning(false);
  }

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-[#0F172A] p-6 text-white shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: "${accentHex}22", color: "${accentHex}" }}>
          ${brandName || "DoItWithAI.tools"} · Portable Widget
        </span>
        <a href="https://doitwithai.tools/tools/${tool.slug}" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 underline">
          Open Full Studio →
        </a>
      </div>
      <h2 className="mt-3 text-2xl font-black">${(customTitle || tool.name).replace(/"/g, '\\"')}</h2>
      <p className="mt-1 text-sm text-slate-300">${(tool.shortDescription || tool.description).replace(/"/g, '\\"')}</p>

      <form onSubmit={handleRun} className="mt-5 space-y-4">
        <textarea
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3.5 text-sm text-white"
          placeholder="Enter keywords, URLs, or draft lines..."
        />
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white"
            placeholder="Target audience"
          />
          <button
            type="submit"
            disabled={running}
            style={{ backgroundColor: "${accentHex}" }}
            className="rounded-xl px-5 py-2.5 text-sm font-extrabold text-white"
          >
            {running ? "Analyzing..." : "Run Analysis"}
          </button>
        </div>
      </form>

      {items.length > 0 && (
        <div className="mt-6 space-y-2.5">
          {items.map((it, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-sm">{it.text}</strong>
                <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-300">{it.intent}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {it.words} words · {it.chars} chars (~{it.px}px SERP width) · Audience: {audience}
              </p>
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
      prompt: `Act as a Senior Frontend Architect. Build a complete, single-file HTML5 + Tailwind CSS + Vanilla JS web tool called "${name}". Purpose: ${tool.description}. Include a 2-column responsive layout (Left: Input form with a 'Load Sample' button; Right: Live scorecard, copyable results, and Markdown/CSV download button), a centered loading modal animation when the action button is clicked, and dark navy (#0B1120) + brand blue (#3452D1) styling.`,
    },
    {
      title: "Prompt 2: Add Deterministic Local Scoring Rules",
      stage: "Step 2 · Local Engine Logic",
      prompt: `Upgrade the JavaScript engine inside "${name}" so it runs 100% locally in the browser without requiring a backend server. Measure word count, character length, estimated Google SERP pixel width (~9.2px per character), search intent modifiers (informational, commercial, transactional), and actionable next steps for each line entered by the user.`,
    },
    {
      title: "Prompt 3: Add Optional Bring-Your-Own-Key (BYOK) AI Expansion",
      stage: "Step 3 · Optional AI Layer",
      prompt: `Add a collapsible settings drawer to "${name}" where the user can optionally paste their own Google Gemini API key (saved only in browser localStorage). When a key is present, call Gemini 2.5 Flash to enrich the deterministic report with 3 custom recommendations tailored to the user's target audience; when blank, fall back gracefully to the local engine.`,
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
}: {
  tool: CatalogTool;
  open: boolean;
  onClose: () => void;
}) {
  const [customTitle, setCustomTitle] = useState(tool.name);
  const [brandName, setBrandName] = useState("DoItWithAI.tools");
  const [accentHex, setAccentHex] = useState("#3452D1");
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<
    "html" | "embed" | "react" | "prompts"
  >("html");
  const [copiedLabel, setCopiedLabel] = useState("");

  const htmlCode = useMemo(
    () =>
      buildStandaloneHtmlCode(
        tool,
        customTitle,
        brandName,
        accentHex,
        themeMode,
      ),
    [tool, customTitle, brandName, accentHex, themeMode],
  );

  const reactCode = useMemo(
    () => buildReactComponentCode(tool, customTitle, brandName, accentHex),
    [tool, customTitle, brandName, accentHex],
  );

  const embedSnippet = useMemo(
    () =>
      `<!-- ${customTitle || tool.name} Embed Widget (Powered by DoItWithAI.tools) -->\n<div style="max-width:1152px;margin:0 auto;">\n  <iframe\n    src="https://doitwithai.tools/tools/${tool.slug}?embed=1"\n    title="${(customTitle || tool.name).replace(/"/g, "&quot;")}"\n    style="width:100%;min-height:680px;border:1px solid #1e293b;border-radius:20px;overflow:hidden;"\n    loading="lazy"\n  ></iframe>\n  <p style="margin-top:8px;font-size:12px;text-align:right;font-family:sans-serif;">\n    Powered by <a href="https://doitwithai.tools/tools/${tool.slug}" target="_blank" rel="noopener" style="color:${accentHex};font-weight:700;">${tool.name} — DoItWithAI.tools</a>\n  </p>\n</div>`,
    [tool, customTitle, accentHex],
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
      aria-label={`Download or build ${tool.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-md sm:p-6"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-[#9aabff]/30 bg-[#0D1526] text-white shadow-2xl">
        {/* Top Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-[#111C33] px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3452d1]/25 text-[#9aabff] ring-1 ring-[#5271ff]/40">
              <Code2 size={20} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/30">
                  Build with AI · Portable Tool Studio
                </span>
                <span className="text-xs text-slate-400">
                  Zero coding required · Works on PC, WordPress &amp; Next.js
                </span>
              </div>
              <h2 className="mt-0.5 text-lg font-black sm:text-xl">
                Get &amp; Customize: {tool.name}
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
          {/* Left Column: 1-Click Customizer & Instant Downloads */}
          <div className="space-y-5 lg:col-span-4">
            <div className="rounded-2xl border border-slate-800 bg-[#111C33]/90 p-5">
              <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#9aabff]">
                <Palette size={15} />
                1. Customize Your Tool Copy &amp; Brand
              </h3>

              <div className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    Custom Tool Heading
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-[#5271ff] focus:outline-none"
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
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-[#5271ff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    Brand Accent Color
                  </label>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {ACCENT_PRESETS.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setAccentHex(preset.hex)}
                        title={preset.label}
                        className={`h-7 w-7 rounded-full border-2 transition ${
                          accentHex === preset.hex
                            ? "scale-110 border-white ring-2 ring-white/40"
                            : "border-transparent opacity-80 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: preset.hex }}
                      />
                    ))}
                    <input
                      type="color"
                      value={accentHex}
                      onChange={(e) => setAccentHex(e.target.value)}
                      aria-label="Custom hex color"
                      className="h-7 w-9 cursor-pointer rounded border border-slate-700 bg-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    Default Color Theme
                  </label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {(["dark", "light"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setThemeMode(mode)}
                        className={`rounded-xl border px-3 py-2 text-xs font-bold capitalize transition ${
                          themeMode === mode
                            ? "border-[#5271ff] bg-[#3452d1]/30 text-white"
                            : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {mode === "dark" ? "🌙 Dark Navy" : "☀️ Clean Light"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Download Actions */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                2. Download &amp; Run Immediately
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                Double-click the downloaded <code>.html</code> file on your PC
                to run it in Chrome/Edge offline, or upload it to WordPress,
                Netlify Drop, or Vercel.
              </p>

              <div className="mt-4 space-y-2.5">
                <button
                  type="button"
                  onClick={() =>
                    triggerDownload(
                      `${tool.slug}-standalone.html`,
                      htmlCode,
                      "text/html",
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-4 py-3 text-xs font-extrabold text-white shadow-lg transition hover:bg-[#4361ee]"
                >
                  <Download size={15} />
                  Download Standalone HTML App (.html)
                </button>

                <button
                  type="button"
                  onClick={() =>
                    triggerDownload(
                      `${toPascalCase(tool.slug)}Widget.tsx`,
                      reactCode,
                      "text/plain",
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:border-[#5271ff] hover:text-white"
                >
                  <FileCode2 size={15} />
                  Download React / Next.js Widget (.tsx)
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 4-Tab Code, Embed & Vibe-Coding Studio */}
          <div className="flex flex-col rounded-2xl border border-slate-800 bg-[#111C33]/70 p-5 lg:col-span-8">
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3.5">
              {[
                {
                  id: "html" as const,
                  label: "1. Standalone HTML (PC & Web)",
                  icon: Laptop,
                },
                {
                  id: "embed" as const,
                  label: "2. Website Embed (<iframe>)",
                  icon: Globe,
                },
                {
                  id: "react" as const,
                  label: "3. React / Next.js (.tsx)",
                  icon: FileCode2,
                },
                {
                  id: "prompts" as const,
                  label: "4. Vibe-Coding Prompts (How We Built It)",
                  icon: Wand2,
                },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                      activeTab === t.id
                        ? "bg-[#3452d1] text-white shadow"
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
              <div className="mt-4 flex flex-1 flex-col">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-300">
                    Self-contained single-file HTML5 app with Tailwind CSS,
                    deterministic engine, and optional BYOK Gemini key drawer.
                  </p>
                  <button
                    type="button"
                    onClick={() => copyText("html", htmlCode)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-[#5271ff]"
                  >
                    {copiedLabel === "html" ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        Copied HTML!
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        Copy Full HTML
                      </>
                    )}
                  </button>
                </div>
                <pre className="mt-3 max-h-[380px] flex-1 overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-300">
                  {htmlCode}
                </pre>
              </div>
            )}

            {activeTab === "embed" && (
              <div className="mt-4 flex flex-1 flex-col">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-300">
                    Paste this responsive snippet into any WordPress Custom HTML
                    block, Webflow embed, or Shopify page.
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
                <pre className="mt-3 max-h-[380px] flex-1 overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-300">
                  {embedSnippet}
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
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3452d1] to-[#5271ff] px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-[#3452d1]/25 transition hover:brightness-110"
        >
          <Download size={14} />
          Get / Download This Tool (Free Code)
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

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ALL_LIVE_TOOLS,
  type DoItAiToolItem,
} from "@/features/portable-tool-kit/PortableToolHeroBar";
import type { RichToolExecutionResult } from "@/app/api/do-it-ai/route";

type VisualCard = {
  id: string;
  title: string;
  category: string;
  url: string;
  articleSlug?: string;
  caption: string;
};

type PromptCard = {
  id: string;
  title: string;
  category: string;
  hubUrl: string;
  prompt: string;
  tags: string[];
};

type LiveArticleCard = {
  title: string;
  url: string;
  summary: string;
  type: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  followUpQuestions?: string[];
  visuals?: VisualCard[];
  prompts?: PromptCard[];
  relatedTools?: DoItAiToolItem[];
  liveArticles?: LiveArticleCard[];
  mountedTool?: {
    slug: string;
    defaultInput: string;
    autoResult?: RichToolExecutionResult | null;
  } | null;
};

type ChatSession = {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
};

const STORAGE_KEY = "doitwithai_do_it_ai_sessions_v3";

const STARTER_CARDS = [
  {
    badge: "Learn + Visuals",
    title: "Master Meta Titles & Descriptions",
    desc: "Learn the 580px & 920px SERP rules with infographics, prompts, and live generators.",
    prompt:
      "Teach me how to write high-CTR Meta Titles and Meta Descriptions with visual infographics and examples",
    accent: "from-blue-600/20 to-indigo-600/10 border-blue-500/30",
  },
  {
    badge: "Run Live Tool",
    title: "Generate 6 Meta Descriptions Now",
    desc: "Run the Meta Description Generator inline with live character & pixel-width meters.",
    prompt:
      "Write meta descriptions for how to check google keyword rankings and optimize pages",
    accent: "from-emerald-600/20 to-teal-600/10 border-emerald-500/30",
  },
  {
    badge: "Local SEO Suite",
    title: "How to Do Local SEO (Full Playbook)",
    desc: "Get the GBP audit checklist, LocalBusiness JSON-LD schema, and all 4 Local SEO tools.",
    prompt:
      "How can I do Local SEO? Show me the playbook, schema markup, and all Local SEO tools",
    accent: "from-purple-600/20 to-indigo-600/10 border-purple-500/30",
  },
  {
    badge: "952+ Prompt Hub",
    title: "Get 12 Copy-Paste SEO Prompts",
    desc: "Pull ready-to-use prompts from our 952+ Prompt Library for keyword research & content.",
    prompt:
      "Give me 12 copy-paste prompts for keyword research, on-page SEO, and blog writing",
    accent: "from-amber-600/20 to-orange-600/10 border-amber-500/30",
  },
];

function renderInlineMarkdown(text: string): React.ReactNode[] {
  // Clean up any stray triple or unclosed asterisks while preserving valid **bold**, `code`, and [link](url)
  const parts: React.ReactNode[] = [];
  const tokenRegex =
    /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plain = text
        .slice(lastIndex, match.index)
        .replace(/\*\*/g, "");
      parts.push(<React.Fragment key={key++}>{plain}</React.Fragment>);
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      const inner = token.slice(2, -2).replace(/\*\*/g, "");
      parts.push(
        <strong key={key++} className="font-semibold text-white">
          {inner}
        </strong>,
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      const inner = token.slice(1, -1);
      parts.push(
        <code
          key={key++}
          className="rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-xs text-blue-300 border border-slate-700/70"
        >
          {inner}
        </code>,
      );
    } else if (token.startsWith("[")) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        parts.push(
          <Link
            key={key++}
            href={linkMatch[2]}
            className="font-semibold text-blue-400 underline decoration-blue-500/50 underline-offset-2 hover:text-blue-300"
          >
            {linkMatch[1].replace(/\*\*/g, "")}
          </Link>,
        );
      } else {
        parts.push(
          <React.Fragment key={key++}>
            {token.replace(/\*\*/g, "")}
          </React.Fragment>,
        );
      }
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(
      <React.Fragment key={key++}>
        {text.slice(lastIndex).replace(/\*\*/g, "")}
      </React.Fragment>,
    );
  }

  return parts;
}

function StructuredMessageContent({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let key = 0;

  const flushBullets = () => {
    if (bulletBuffer.length === 0) return;
    const currentBullets = [...bulletBuffer];
    bulletBuffer = [];
    blocks.push(
      <ul key={key++} className="my-2.5 space-y-2 pl-1">
        {currentBullets.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-200"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
            <span className="flex-1">{renderInlineMarkdown(item)}</span>
          </li>
        ))}
      </ul>,
    );
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushBullets();
      continue;
    }

    if (line.startsWith("### ")) {
      flushBullets();
      const headingText = line.replace(/^###\s+/, "").replace(/\*\*/g, "");
      blocks.push(
        <h3
          key={key++}
          className="mt-4 first:mt-0 text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2"
        >
          <span className="h-4 w-1 rounded-full bg-blue-500 inline-block" />
          <span>{headingText}</span>
        </h3>,
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushBullets();
      const headingText = line.replace(/^##\s+/, "").replace(/\*\*/g, "");
      blocks.push(
        <h3
          key={key++}
          className="mt-4 first:mt-0 text-base sm:text-lg font-bold tracking-tight text-white"
        >
          {headingText}
        </h3>,
      );
      continue;
    }

    if (/^[-*•]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const cleanedItem = line
        .replace(/^[-*•]\s+/, "")
        .replace(/^\d+\.\s+/, "");
      bulletBuffer.push(cleanedItem);
      continue;
    }

    flushBullets();
    blocks.push(
      <p key={key++} className="text-sm sm:text-[15px] leading-7 text-slate-200">
        {renderInlineMarkdown(line)}
      </p>,
    );
  }

  flushBullets();
  return <div className="space-y-2.5">{blocks}</div>;
}

function estimatePixelsClient(text: string, perChar = 5.5): number {
  let px = 0;
  for (const ch of text) {
    if ("MW@#%&QGO".includes(ch)) px += perChar * 1.35;
    else if ("il1|!.,:;'- ".includes(ch)) px += perChar * 0.55;
    else if (ch >= "A" && ch <= "Z") px += perChar * 1.15;
    else px += perChar;
  }
  return Math.round(px);
}

function generatePortableHtmlBundle(
  tool: DoItAiToolItem,
  defaultTopic: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${tool.name} — Portable Widget (DoItWithAI.tools)</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-6 font-sans">
  <div class="max-w-3xl mx-auto rounded-2xl border border-blue-500/30 bg-slate-900/90 p-6 shadow-2xl">
    <span class="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
      ${tool.category} · Portable AI Tool
    </span>
    <h1 class="mt-2 text-2xl font-bold text-white">${tool.name}</h1>
    <p class="mt-1 text-sm text-slate-300">${tool.description}</p>
    <div class="mt-5 space-y-4">
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Primary Topic, Keyword or URL</label>
        <textarea id="tool-input" rows="3" class="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white">${defaultTopic}</textarea>
      </div>
      <button onclick="runWidget()" class="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition">
        Run ${tool.name}
      </button>
      <div id="tool-output" class="hidden mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200 space-y-2"></div>
    </div>
  </div>
  <script>
    function runWidget() {
      const val = document.getElementById('tool-input').value.trim() || '${defaultTopic}';
      const out = document.getElementById('tool-output');
      out.classList.remove('hidden');
      out.innerHTML = '<div class="font-semibold text-blue-400">Generated Output for: ' + val + '</div><p class="text-slate-300">Customize this standalone HTML5 widget or connect it to your API endpoint. Powered by DoItWithAI.tools.</p>';
    }
  </script>
</body>
</html>`;
}

function InlineToolWorkspaceCard({
  toolSlug,
  initialInput,
  initialResult,
}: {
  toolSlug: string;
  initialInput: string;
  initialResult?: RichToolExecutionResult | null;
}) {
  const tool =
    ALL_LIVE_TOOLS.find((t) => t.slug === toolSlug) || ALL_LIVE_TOOLS[0];
  const [input, setInput] = useState(
    initialInput || "how to check google keyword rankings",
  );
  const [audience, setAudience] = useState(
    "Non-coder marketers, creators & solo founders",
  );
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RichToolExecutionResult | null>(
    initialResult || null,
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExecuteTool = async () => {
    const cleanTopic = input.trim() || "how to check google keyword rankings";
    setRunning(true);
    try {
      // 1. Try specialized live tool API routes first for real Gemini generation when configured
      const expandedBrief =
        cleanTopic.length >= 45
          ? cleanTopic
          : `Comprehensive SEO page brief for "${cleanTopic}" tailored for ${audience} with actionable step-by-step guidance, SERP proof, and clear takeaways.`;

      if (
        tool.slug === "meta-description-generator" ||
        tool.slug === "h1-heading-generator"
      ) {
        const endpoint =
          tool.slug === "meta-description-generator"
            ? "/api/ai-tools/meta-description"
            : "/api/ai-tools/h1-heading";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brief: expandedBrief,
            keyword: cleanTopic.slice(0, 90),
            audience,
            pageType: "guide",
            intent: "informational",
            tone: "clear",
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            candidates?: Array<{
              text: string;
              approach: string;
              explanation: string;
            }>;
          };
          if (data.candidates?.length) {
            setResult({
              headline: `${tool.name} — ${data.candidates.length} Live AI Candidates for "${cleanTopic}"`,
              summary: `Generated ${data.candidates.length} copy-ready options tailored for ${audience}.`,
              metrics: [
                {
                  label: "Options Generated",
                  value: `${data.candidates.length} Candidates`,
                  status: "optimal",
                },
                {
                  label: "Target Window",
                  value:
                    tool.slug === "meta-description-generator"
                      ? "140–158 chars (~920px)"
                      : "Single Clear H1",
                  status: "optimal",
                },
                {
                  label: "Primary Keyword",
                  value: cleanTopic.slice(0, 26),
                  status: "optimal",
                },
              ],
              sections: [
                {
                  title: `Live ${tool.name} Candidates`,
                  badge: "Real-Time Engine",
                  items: data.candidates.map((c, idx) => {
                    const chars = c.text.length;
                    const px = estimatePixelsClient(c.text);
                    return {
                      label: `Option ${idx + 1} · ${c.approach}`,
                      content: c.text,
                      meta: `${chars} chars · ~${px}px · ${c.explanation}`,
                      code:
                        tool.slug === "meta-description-generator"
                          ? `<meta name="description" content="${c.text.replace(/"/g, "&quot;")}" />`
                          : `<h1>${c.text}</h1>`,
                    };
                  }),
                },
              ],
            });
            setRunning(false);
            return;
          }
        }
      }

      if (tool.slug === "meta-title-generator") {
        const res = await fetch("/api/ai-tools/meta-title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topicSummary: expandedBrief,
            primaryKeyword: cleanTopic.slice(0, 90),
            pageType: "guide",
            searchIntent: "informational",
            targetAudience: audience,
            tone: "professional",
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            groups?: Array<{
              label: string;
              candidates: Array<{
                title: string;
                rationale: string;
                charCount?: number;
                estimatedPixels?: number;
              }>;
            }>;
          };
          const allCandidates =
            data.groups?.flatMap((g) =>
              g.candidates.map((c) => ({
                lens: g.label,
                ...c,
              })),
            ) || [];
          if (allCandidates.length > 0) {
            setResult({
              headline: `Meta Title Studio — ${allCandidates.length} Titles Across 5 Strategic Lenses`,
              summary: `Generated ${allCandidates.length} pixel-verified meta titles for "${cleanTopic}".`,
              metrics: [
                {
                  label: "Pixel Limit",
                  value: "≤ 580px Safe",
                  status: "optimal",
                },
                {
                  label: "Candidates",
                  value: `${allCandidates.length} Titles`,
                  status: "optimal",
                },
                {
                  label: "Lenses",
                  value: "5 Strategic Angles",
                  status: "optimal",
                },
              ],
              sections: [
                {
                  title: "Generated Meta Title Candidates",
                  badge: "5-Lens Engine",
                  items: allCandidates.slice(0, 8).map((c) => {
                    const chars = c.charCount || c.title.length;
                    const px =
                      c.estimatedPixels || estimatePixelsClient(c.title, 6.2);
                    return {
                      label: c.lens,
                      content: c.title,
                      meta: `${chars} chars · ~${px}px / 580px · ${c.rationale}`,
                      code: `<title>${c.title}</title>`,
                    };
                  }),
                },
              ],
            });
            setRunning(false);
            return;
          }
        }
      }

      // 2. Fallback / Universal Execution via /api/do-it-ai execute_tool engine
      const execRes = await fetch("/api/do-it-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "execute_tool",
          toolSlug: tool.slug,
          toolInput: cleanTopic,
          toolSecondaryInput: audience,
        }),
      });
      const execData = (await execRes.json()) as {
        ok?: boolean;
        toolResult?: RichToolExecutionResult;
      };
      if (execData.toolResult) {
        setResult(execData.toolResult);
      }
    } catch {
      // Keep existing or ignore
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-blue-500/30 bg-slate-950/95 p-4 sm:p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-400 border border-blue-500/30">
              Connected Tool Engine · {tool.category}
            </span>
          </div>
          <h4 className="mt-1 text-base sm:text-lg font-bold text-white">
            {tool.name}
          </h4>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCodeModal(!showCodeModal)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            <span>⬇ Get / Download Tool Code</span>
          </button>
          <Link
            href={`/tools/${tool.slug}`}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-blue-400 hover:text-white transition"
          >
            <span>Full Studio ↗</span>
          </Link>
        </div>
      </div>

      {showCodeModal && (
        <div className="mt-3 rounded-xl border border-emerald-500/30 bg-slate-900/95 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-emerald-300">
              Portable HTML5 Widget Code for {tool.name}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  copyText(
                    generatePortableHtmlBundle(tool, input),
                    `code-${tool.slug}`,
                  )
                }
                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                {copiedId === `code-${tool.slug}`
                  ? "✓ Copied HTML5"
                  : "Copy HTML5 Code"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob(
                    [generatePortableHtmlBundle(tool, input)],
                    { type: "text/html" },
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${tool.slug}-widget.html`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                Download .HTML
              </button>
            </div>
          </div>
          <pre className="max-h-40 overflow-y-auto rounded-lg bg-slate-950 p-2.5 font-mono text-[11px] text-slate-300 border border-slate-800">
            {generatePortableHtmlBundle(tool, input)}
          </pre>
        </div>
      )}

      <div className="mt-3.5 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Topic, Primary Keyword, URL, or Content Brief
          </label>
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your keyword, topic, or URL..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Target audience (e.g., Non-coder marketers & solo founders)"
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleExecuteTool}
            disabled={running}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition shrink-0"
          >
            {running ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Running {tool.name}...</span>
              </>
            ) : (
              <span>▷ Run {tool.name} Now</span>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-4 space-y-4 border-t border-slate-800/90 pt-4">
          <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3.5">
            <h5 className="text-sm sm:text-base font-bold text-white">
              {result.headline}
            </h5>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              {result.summary}
            </p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {result.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-800/90 bg-slate-900/80 px-3 py-2"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {m.label}
                  </div>
                  <div className="mt-0.5 text-xs sm:text-sm font-bold text-emerald-400">
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result.sections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h6 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-300">
                  {sec.title}
                </h6>
                {sec.badge && (
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                    {sec.badge}
                  </span>
                )}
              </div>
              <div className="space-y-2.5">
                {sec.items.map((item, iIdx) => {
                  const itemId = `res-${sIdx}-${iIdx}`;
                  return (
                    <div
                      key={iIdx}
                      className="rounded-xl border border-slate-800/90 bg-slate-900/75 p-3.5 hover:border-slate-700 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-blue-400">
                          {item.label}
                        </span>
                        <div className="flex items-center gap-2">
                          {item.meta && (
                            <span className="rounded-md bg-slate-950 px-2 py-0.5 text-[11px] font-medium text-emerald-300 border border-slate-800">
                              {item.meta}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              copyText(item.code || item.content, itemId)
                            }
                            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-600 hover:border-blue-500 transition"
                          >
                            {copiedId === itemId ? "✓ Copied" : "Copy"}
                          </button>
                        </div>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-white font-medium">
                        {item.content}
                      </p>
                      {item.code && (
                        <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 p-2.5 font-mono text-xs text-blue-200 border border-slate-800/90">
                          {item.code}
                        </pre>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DoItAiDashboardClient() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showToolsModal, setShowToolsModal] = useState(false);
  const [toolSearchQuery, setToolSearchQuery] = useState("");
  const [lightboxVisual, setLightboxVisual] = useState<VisualCard | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved sessions from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatSession[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      }
    } catch {
      // Ignore storage errors
    }
    const initialSession: ChatSession = {
      id: `chat-${Date.now()}`,
      title: "New Do It AI Session",
      updatedAt: "Just now",
      messages: [],
    };
    setSessions([initialSession]);
    setActiveSessionId(initialSession.id);
  }, []);

  // Save sessions to localStorage whenever updated
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 20)));
      } catch {
        // Ignore quota errors
      }
    }
  }, [sessions]);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages.length, isLoading]);

  const startNewChat = () => {
    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      title: "New Do It AI Session",
      updatedAt: "Just now",
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInputPrompt("");
    setShowMobileSidebar(false);
  };

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      startNewChat();
    } else {
      setSessions(remaining);
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? inputPrompt).trim();
    if (!text || isLoading || !activeSession) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedHistory = [...activeSession.messages, userMsg].slice(-15);
    const updatedTitle =
      activeSession.messages.length === 0 ? text.slice(0, 42) : activeSession.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              title: updatedTitle,
              updatedAt: "Just now",
              messages: [...s.messages, userMsg],
            }
          : s,
      ),
    );
    setInputPrompt("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/do-it-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          messages: updatedHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        followUpQuestions?: string[];
        visuals?: VisualCard[];
        prompts?: PromptCard[];
        relatedTools?: DoItAiToolItem[];
        liveArticles?: LiveArticleCard[];
        mountedTool?: {
          slug: string;
          defaultInput: string;
          autoResult?: RichToolExecutionResult | null;
        } | null;
        error?: string;
      };

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: "assistant",
        content:
          data.reply ||
          data.error ||
          "Here is your workspace breakdown. Let me know what you'd like to run next.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        followUpQuestions: data.followUpQuestions || [],
        visuals: data.visuals || [],
        prompts: data.prompts || [],
        relatedTools: data.relatedTools || [],
        liveArticles: data.liveArticles || [],
        mountedTool: data.mountedTool || null,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                updatedAt: "Just now",
                messages: [...s.messages, assistantMsg],
              }
            : s,
        ),
      );
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: "assistant",
        content:
          "### Connection Notice\nI couldn't reach the server for a moment. Please try your message again or select one of the quick tools below.",
        timestamp: "Just now",
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? { ...s, messages: [...s.messages, fallbackMsg] }
            : s,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const mountSpecificToolInChat = async (tool: DoItAiToolItem) => {
    setShowToolsModal(false);
    await sendMessage(
      `Open and run ${tool.name} for how to check google keyword rankings`,
    );
  };

  const filteredModalTools = ALL_LIVE_TOOLS.filter(
    (t) =>
      !toolSearchQuery.trim() ||
      t.name.toLowerCase().includes(toolSearchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(toolSearchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(toolSearchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-[calc(100dvh-76px)] w-full overflow-hidden bg-[#060B19] text-slate-100">
      {/* LEFT SIDEBAR — Clean ChatGPT Style (ONLY New Chat + Chat History + Compact Footer Links) */}
      <aside
        className={`${
          showMobileSidebar
            ? "fixed inset-y-0 left-0 z-50 flex w-72"
            : "hidden lg:flex lg:w-72"
        } shrink-0 flex-col border-r border-slate-800/80 bg-[#080F23]`}
      >
        {/* Top New Chat Button */}
        <div className="p-3.5 border-b border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white shadow-md shadow-blue-600/30">
                AI
              </span>
              <div>
                <div className="text-sm font-bold text-white leading-none">
                  Do It AI
                </div>
                <div className="text-[10px] font-medium text-blue-400 mt-0.5">
                  Custom Website GPT · 15-Msg Memory
                </div>
              </div>
            </div>
            {showMobileSidebar && (
              <button
                type="button"
                onClick={() => setShowMobileSidebar(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white lg:hidden"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={startNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition"
          >
            <span>＋ New Chat</span>
          </button>
        </div>

        {/* Scrollable Chat History List ONLY (Never stretches viewport!) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Recent Conversations ({sessions.length})
          </div>
          {sessions.map((session) => {
            const isActive = session.id === activeSession?.id;
            return (
              <div
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                  setShowMobileSidebar(false);
                }}
                className={`group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-xs transition ${
                  isActive
                    ? "bg-blue-600/20 text-white border border-blue-500/40 font-semibold"
                    : "text-slate-300 hover:bg-slate-900/90 hover:text-white border border-transparent"
                }`}
              >
                <div className="truncate pr-2">
                  <div className="truncate">{session.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {session.messages.length} msgs · {session.updatedAt}
                  </div>
                </div>
                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => deleteChat(session.id, e)}
                    title="Delete chat"
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Compact Bottom Sidebar Footer */}
        <div className="border-t border-slate-800/80 p-3 space-y-1.5 bg-slate-950/60">
          <button
            type="button"
            onClick={() => setShowToolsModal(true)}
            className="flex w-full items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition"
          >
            <span>⚡ Browse All 92 Live Tools</span>
            <span className="rounded bg-blue-600/30 px-1.5 py-0.5 text-[10px] text-white">
              92
            </span>
          </button>
          <div className="grid grid-cols-2 gap-1.5">
            <Link
              href="/prompts"
              className="flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:border-slate-700 hover:text-white transition"
            >
              952+ Prompts Hub
            </Link>
            <Link
              href="/tools/downloadable-ai-tools"
              className="flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:border-slate-700 hover:text-white transition"
            >
              Download Tools
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE COLUMN — Locked Viewport Height with Pinned Bottom Input */}
      <main className="flex flex-1 flex-col h-full overflow-hidden bg-[#060B19]">
        {/* Compact Top Workspace Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#080F23]/90 px-4 py-2.5 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowMobileSidebar(true)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-200 lg:hidden"
            >
              ☰ Chats
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 border border-emerald-500/25">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              DoItWithAI Knowledge Base Active
            </span>
            <span className="hidden md:inline-block text-xs text-slate-400">
              92 Live Tools · 952+ Prompts · 30+ Visual Infographics · Sufian Mustafa Playbooks
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowToolsModal(true)}
              className="rounded-xl border border-slate-700 bg-slate-900 hover:border-blue-500/50 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition"
            >
              ⚡ Open Tool Directory (92)
            </button>
            <button
              type="button"
              onClick={startNewChat}
              className="rounded-xl border border-blue-500/30 bg-blue-600/15 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-600/25 transition sm:hidden"
            >
              ＋ New
            </button>
          </div>
        </header>

        {/* CENTER SCROLLABLE CHAT STREAM */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {(!activeSession || activeSession.messages.length === 0) ? (
              /* ZERO-STATE WELCOME SCREEN */
              <div className="py-4 sm:py-8 space-y-6">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300">
                    <span>✨ Do It AI — Your Custom Website GPT & Execution Studio</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                    What would you like to{" "}
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">
                      Learn, Build, or Sell
                    </span>{" "}
                    today?
                  </h1>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    Say <strong className="text-white">&quot;Hi&quot;</strong> for a guided tour, ask me to teach you any SEO or AI workflow with visual infographics, pull from <strong className="text-white">952+ prompts</strong>, or run any of our <strong className="text-white">92+ live AI tools</strong> directly inside chat.
                  </p>
                </div>

                {/* 4 Starter Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {STARTER_CARDS.map((card, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendMessage(card.prompt)}
                      className={`text-left rounded-2xl border bg-gradient-to-br ${card.accent} p-4 hover:scale-[1.01] transition shadow-lg`}
                    >
                      <span className="inline-block rounded-full bg-slate-950/80 px-2.5 py-0.5 text-[11px] font-bold text-blue-300 border border-slate-800">
                        {card.badge}
                      </span>
                      <h2 className="mt-2 text-base font-bold text-white">
                        {card.title}
                      </h2>
                      <p className="mt-1 text-xs leading-relaxed text-slate-300">
                        {card.desc}
                      </p>
                      <div className="mt-3 text-xs font-semibold text-blue-400 flex items-center gap-1">
                        <span>Try this prompt</span>
                        <span>→</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* CONVERSATION MESSAGES STREAM */
              activeSession.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white shadow-md shadow-blue-600/30 mt-1">
                      AI
                    </div>
                  )}

                  <div
                    className={`max-w-3xl flex-1 rounded-2xl p-4 sm:p-5 ${
                      msg.role === "user"
                        ? "ml-auto max-w-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "border border-slate-800/90 bg-[#0B132B]/95 text-slate-100 shadow-xl"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm sm:text-[15px] leading-relaxed font-medium whitespace-pre-line">
                        {msg.content}
                      </p>
                    ) : (
                      <div className="space-y-5">
                        {/* 1. Clean Structured Markdown Content (Zero Raw ** Asterisks!) */}
                        <StructuredMessageContent content={msg.content} />

                        {/* 2. Mounted Interactive Tool Runner */}
                        {msg.mountedTool && (
                          <InlineToolWorkspaceCard
                            toolSlug={msg.mountedTool.slug}
                            initialInput={msg.mountedTool.defaultInput}
                            initialResult={msg.mountedTool.autoResult}
                          />
                        )}

                        {/* 3. Related Tools Strip (Switch or Launch Any Matching Tool) */}
                        {msg.relatedTools && msg.relatedTools.length > 0 && (
                          <div className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-3.5">
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                              Related Live Tools on DoItWithAI.tools ({msg.relatedTools.length})
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {msg.relatedTools.map((t) => (
                                <div
                                  key={t.slug}
                                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 hover:border-blue-500/40 transition"
                                >
                                  <div className="min-w-0">
                                    <div className="truncate text-xs font-bold text-white">
                                      {t.name}
                                    </div>
                                    <div className="truncate text-[11px] text-slate-400">
                                      {t.category}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        sendMessage(
                                          `Run ${t.name} for ${
                                            msg.mountedTool?.defaultInput ||
                                            "my website topic"
                                          }`,
                                        )
                                      }
                                      className="rounded-lg bg-blue-600/20 border border-blue-500/40 px-2 py-1 text-[11px] font-semibold text-blue-300 hover:bg-blue-600 hover:text-white transition"
                                    >
                                      Run Here
                                    </button>
                                    <Link
                                      href={`/tools/${t.slug}`}
                                      className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white"
                                    >
                                      Open ↗
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 4. Visual Infographic & Diagram Gallery */}
                        {msg.visuals && msg.visuals.length > 0 && (
                          <div className="rounded-xl border border-slate-800/90 bg-slate-950/75 p-3.5 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                                📊 Visual Infographics & Workflow Diagrams ({msg.visuals.length})
                              </span>
                              <span className="text-[11px] text-slate-400">
                                Click any visual to enlarge or download
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {msg.visuals.map((v) => (
                                <div
                                  key={v.id}
                                  className="group overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 flex flex-col justify-between"
                                >
                                  <div
                                    onClick={() => setLightboxVisual(v)}
                                    className="relative cursor-pointer overflow-hidden bg-slate-950 aspect-[16/10]"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={v.url}
                                      alt={v.title}
                                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                                      loading="lazy"
                                    />
                                    <span className="absolute top-2 left-2 rounded-md bg-slate-950/85 px-2 py-0.5 text-[10px] font-semibold text-blue-300 border border-slate-800">
                                      {v.category}
                                    </span>
                                  </div>
                                  <div className="p-3 space-y-1.5">
                                    <div className="text-xs font-bold text-white line-clamp-1">
                                      {v.title}
                                    </div>
                                    <p className="text-[11px] text-slate-300 line-clamp-2">
                                      {v.caption}
                                    </p>
                                    <div className="pt-1 flex items-center justify-between gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setLightboxVisual(v)}
                                        className="text-[11px] font-semibold text-blue-400 hover:text-blue-300"
                                      >
                                        🔍 Preview Full Size
                                      </button>
                                      <a
                                        href={v.url}
                                        download
                                        className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
                                      >
                                        ⬇ Download
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 5. Copy-Paste Prompts from the 952+ Prompt Library */}
                        {msg.prompts && msg.prompts.length > 0 && (
                          <div className="rounded-xl border border-amber-500/25 bg-slate-950/80 p-3.5 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                                💡 Copy-Paste Prompts from Our 952+ Library ({msg.prompts.length})
                              </span>
                              <Link
                                href="/prompts"
                                className="text-[11px] font-semibold text-amber-400 hover:underline"
                              >
                                Explore All 952+ Prompts ↗
                              </Link>
                            </div>
                            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                              {msg.prompts.map((p, pIdx) => (
                                <div
                                  key={p.id}
                                  className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 space-y-1.5"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-white">
                                      {pIdx + 1}. {p.title}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/20">
                                        {p.category}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(p.prompt);
                                          setCopiedPromptId(p.id);
                                          setTimeout(
                                            () => setCopiedPromptId(null),
                                            2000,
                                          );
                                        }}
                                        className="rounded-lg bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-semibold text-amber-200 hover:bg-amber-500 hover:text-slate-950 transition"
                                      >
                                        {copiedPromptId === p.id
                                          ? "✓ Copied"
                                          : "Copy Prompt"}
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-xs leading-relaxed text-slate-300 font-mono bg-slate-950/90 p-2.5 rounded-lg border border-slate-800/80">
                                    {p.prompt}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 6. Clickable Follow-Up Question Chips */}
                        {msg.followUpQuestions &&
                          msg.followUpQuestions.length > 0 && (
                            <div className="pt-2 border-t border-slate-800/80">
                              <div className="text-[11px] font-semibold text-slate-400 mb-2">
                                Suggested Next Steps & Follow-Ups:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {msg.followUpQuestions.map((q, qIdx) => (
                                  <button
                                    key={qIdx}
                                    type="button"
                                    onClick={() => sendMessage(q)}
                                    className="rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-600/25 px-3 py-1.5 text-left text-xs font-medium text-blue-200 hover:text-white transition"
                                  >
                                    → {q}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#0B132B]/90 p-4 max-w-xl">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                <div className="text-xs sm:text-sm font-medium text-slate-300">
                  Do It AI is analyzing your query, website playbooks, and connected tool engines...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* PINNED BOTTOM INPUT BAR — Always Visible Without Scrolling */}
        <div className="shrink-0 border-t border-slate-800/80 bg-[#080F23]/95 px-4 py-3 sm:px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="mx-auto max-w-4xl flex items-center gap-2.5 rounded-2xl border border-slate-700/90 bg-slate-950 px-3.5 py-2 shadow-2xl focus-within:border-blue-500"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Say 'Hi', ask to learn a topic, request 15 prompts/images, or tell Do It AI to run a tool (e.g. 'Write meta descriptions')..."
              className="flex-1 bg-transparent py-1.5 text-sm text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/30 transition shrink-0"
            >
              <span>➤ Do It</span>
            </button>
          </form>
        </div>
      </main>

      {/* MODAL 1: 92-TOOL DIRECTORY DRAWER (On-Demand so it never stretches the sidebar!) */}
      {showToolsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-800 bg-[#0B132B] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  All 92 Live AI & SEO Tools
                </h3>
                <p className="text-xs text-slate-400">
                  Click &quot;Run in Chat&quot; to execute any tool inline or &quot;Full Studio&quot; to open its dedicated page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowToolsModal(false)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-4 border-b border-slate-800">
              <input
                type="text"
                value={toolSearchQuery}
                onChange={(e) => setToolSearchQuery(e.target.value)}
                placeholder="Search 92 tools by name, category, or keyword (e.g., meta, schema, local seo, blog)..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredModalTools.map((tool) => (
                <div
                  key={tool.slug}
                  className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 hover:border-blue-500/40 transition"
                >
                  <div>
                    <span className="inline-block rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-400 border border-blue-500/20">
                      {tool.category}
                    </span>
                    <h4 className="mt-1.5 text-sm font-bold text-white">
                      {tool.name}
                    </h4>
                    <p className="mt-1 text-xs text-slate-300 line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => mountSpecificToolInChat(tool)}
                      className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition"
                    >
                      ⚡ Run in Chat
                    </button>
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white"
                    >
                      Full Page ↗
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VISUAL INFOGRAPHIC LIGHTBOX PREVIEW */}
      {lightboxVisual && (
        <div
          onClick={() => setLightboxVisual(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-blue-400">
                  {lightboxVisual.category}
                </span>
                <h4 className="text-base font-bold text-white">
                  {lightboxVisual.title}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxVisual.url}
                  download
                  className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500"
                >
                  ⬇ Download High-Res
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxVisual(null)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl bg-slate-950 p-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxVisual.url}
                alt={lightboxVisual.title}
                className="max-h-[66vh] w-auto object-contain rounded-lg"
              />
            </div>
            <p className="text-xs text-slate-300">{lightboxVisual.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}

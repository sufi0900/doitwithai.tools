"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ALL_LIVE_TOOLS,
  buildStandaloneHtmlCode,
  type DoItAiToolItem,
} from "@/features/portable-tool-kit/PortableToolHeroBar";
import { tools as catalogTools } from "@/features/tool-catalog/catalog";
import { useWorkspace } from "@/features/tools-workspace/WorkspaceProvider";
import { browserAccounts } from "@/features/tools-workspace/supabase";
import type { RichToolExecutionResult } from "@/app/api/do-it-ai/route";

type VisualCard = {
  id: string;
  title: string;
  category: string;
  url?: string;
  src?: string;
  alt?: string;
  articleSlug?: string;
  pageHref?: string;
  caption?: string;
};

type PromptCard = {
  id: string;
  title: string;
  category: string;
  task?: string;
  hubUrl?: string;
  prompt?: string;
  template?: string;
  tags?: string[];
  toolName?: string;
  toolHref?: string;
};

type LiveArticleCard = {
  slug?: string;
  title: string;
  url: string;
  category?: string;
  badge?: string;
  image?: string;
  summary: string;
  ctaLabel?: string;
  type?: string;
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

const STORAGE_KEY = "doitwithai_do_it_ai_sessions_v4";

const STARTER_CARDS = [
  {
    icon: "🎯",
    label: "Teach me high-CTR Meta Titles & Descriptions with visual infographics",
    prompt:
      "Teach me how to write high-CTR Meta Titles and Meta Descriptions with visual infographics and examples",
  },
  {
    icon: "⚡",
    label: "Write 6 meta descriptions for 'how to check google keyword rankings'",
    prompt:
      "Write meta descriptions for how to check google keyword rankings and optimize pages",
  },
  {
    icon: "🗺️",
    label: "Show me the 10-step plan for What to Do After Keyword Research",
    prompt:
      "What should I do after keyword research? Show me the 10-step execution workflow, infographics, and tools",
  },
  {
    icon: "📍",
    label: "How can I rank in Google Map Pack? (Local SEO playbook + schema)",
    prompt:
      "How can I do Local SEO? Show me the playbook, schema markup, and all Local SEO tools",
  },
  {
    icon: "💡",
    label: "Give me 12 copy-paste prompts for keyword research & on-page SEO",
    prompt:
      "Give me 12 copy-paste prompts for keyword research, on-page SEO, and blog writing",
  },
  {
    icon: "🛠️",
    label: "Help me build & download a portable AI SEO tool for my website",
    prompt:
      "How can I download or embed your free HTML5 and React AI SEO tools on my PC or website?",
  },
];

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Matches: **[label](url)** | [**label**](url) | [label](url) | **bold** | `code`
  const tokenRegex =
    /(\*\*\[([^\]]+)\]\(([^)]+)\)\*\*|\[\*\*([^*]+)\*\*\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  const renderAnchor = (label: string, rawHref: string) => {
    const cleanLabel = label.replace(/\*\*/g, "").trim();
    const href = rawHref.trim().replace(/^https?:\/\/doitwithai\.tools/i, "") || "/";
    const isInternal = href.startsWith("/");
    if (isInternal) {
      return (
        <Link
          key={key++}
          href={href}
          className="inline-flex items-center gap-0.5 font-semibold text-blue-400 underline decoration-blue-400/60 underline-offset-4 hover:text-blue-300 transition"
        >
          <span>{cleanLabel}</span>
          <span className="text-[11px] no-underline">↗</span>
        </Link>
      );
    }
    return (
      <a
        key={key++}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-0.5 font-semibold text-blue-400 underline decoration-blue-400/60 underline-offset-4 hover:text-blue-300 transition"
      >
        <span>{cleanLabel}</span>
        <span className="text-[11px] no-underline">↗</span>
      </a>
    );
  };

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plain = text.slice(lastIndex, match.index).replace(/\*\*/g, "");
      parts.push(<React.Fragment key={key++}>{plain}</React.Fragment>);
    }

    if (match[2] !== undefined && match[3] !== undefined) {
      // **[label](url)**
      parts.push(renderAnchor(match[2], match[3]));
    } else if (match[4] !== undefined && match[5] !== undefined) {
      // [**label**](url)
      parts.push(renderAnchor(match[4], match[5]));
    } else if (match[6] !== undefined && match[7] !== undefined) {
      // [label](url)
      parts.push(renderAnchor(match[6], match[7]));
    } else if (match[8] !== undefined) {
      // **bold** — check if it contains a nested [label](url)
      const inner = match[8];
      const nestedLink = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(inner.trim());
      if (nestedLink) {
        parts.push(renderAnchor(nestedLink[1], nestedLink[2]));
      } else {
        parts.push(
          <strong key={key++} className="font-semibold text-white">
            {inner.replace(/\*\*/g, "")}
          </strong>,
        );
      }
    } else if (match[9] !== undefined) {
      // `code`
      parts.push(
        <code
          key={key++}
          className="rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-xs text-blue-300 border border-slate-700/70"
        >
          {match[9]}
        </code>,
      );
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
      <ul key={key++} className="my-2.5 space-y-2.5 pl-1">
        {currentBullets.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-200"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
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
      const headingText = line.replace(/^###\s+/, "");
      blocks.push(
        <h3
          key={key++}
          className="mt-4 first:mt-0 text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2"
        >
          <span className="h-4 w-1 rounded-full bg-blue-500 inline-block shrink-0" />
          <span>{renderInlineMarkdown(headingText)}</span>
        </h3>,
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushBullets();
      const headingText = line.replace(/^##\s+/, "");
      blocks.push(
        <h3
          key={key++}
          className="mt-4 first:mt-0 text-base sm:text-lg font-bold tracking-tight text-white"
        >
          {renderInlineMarkdown(headingText)}
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
      <p
        key={key++}
        className="text-sm sm:text-[15px] leading-7 text-slate-200"
      >
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
  _defaultTopic: string,
): string {
  const matched =
    catalogTools.find((t) => t.slug === tool.slug) || catalogTools[0];
  return buildStandaloneHtmlCode(
    matched,
    tool.name,
    "DoItWithAI.tools",
    "#3452D1",
    "dark",
    tool.description,
  );
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
      // Keep existing result
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
  const workspace = useWorkspace();
  const googleUser = workspace?.user || null;
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showToolsModal, setShowToolsModal] = useState(false);
  const [toolSearchQuery, setToolSearchQuery] = useState("");
  const [lightboxVisual, setLightboxVisual] = useState<VisualCard | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [cloudSynced, setCloudSynced] = useState(false);

  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const activeStorageKey = googleUser?.id
    ? `${STORAGE_KEY}_user_${googleUser.id}`
    : STORAGE_KEY;

  // Load saved sessions from localStorage + Google Account metadata
  useEffect(() => {
    try {
      const mergeSessions = (
        primary: ChatSession[],
        secondary: ChatSession[],
      ): ChatSession[] => {
        const map = new Map<string, ChatSession>();
        for (const s of [...primary, ...secondary]) {
          if (!s || !s.id) continue;
          const existing = map.get(s.id);
          if (
            !existing ||
            (s.messages?.length || 0) > (existing.messages?.length || 0)
          ) {
            map.set(s.id, s);
          }
        }
        const merged = Array.from(map.values());
        // Keep non-empty sessions first, or at least 1 default session
        const nonEmpty = merged.filter((s) => s.messages && s.messages.length > 0);
        return nonEmpty.length > 0 ? nonEmpty.slice(0, 25) : merged.slice(0, 5);
      };

      const rawGuest = localStorage.getItem(STORAGE_KEY);
      const guestSessions: ChatSession[] = rawGuest ? JSON.parse(rawGuest) : [];

      if (googleUser?.id) {
        const rawUser = localStorage.getItem(
          `${STORAGE_KEY}_user_${googleUser.id}`,
        );
        const userLocalSessions: ChatSession[] = rawUser
          ? JSON.parse(rawUser)
          : [];
        const cloudMetaSessions: ChatSession[] = Array.isArray(
          googleUser.user_metadata?.doitai_chat_sessions_v1,
        )
          ? (googleUser.user_metadata.doitai_chat_sessions_v1 as ChatSession[])
          : [];

        const combined = mergeSessions(
          userLocalSessions,
          mergeSessions(cloudMetaSessions, guestSessions),
        );

        if (combined.length > 0) {
          setSessions(combined);
          setActiveSessionId(combined[0].id);
          setCloudSynced(true);
          return;
        }
      } else if (Array.isArray(guestSessions) && guestSessions.length > 0) {
        setSessions(guestSessions);
        setActiveSessionId(guestSessions[0].id);
        return;
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
  }, [googleUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save sessions to localStorage AND sync to Google Account (Supabase user_metadata) whenever updated
  useEffect(() => {
    if (sessions.length === 0) return;
    try {
      localStorage.setItem(
        activeStorageKey,
        JSON.stringify(sessions.slice(0, 25)),
      );
      if (googleUser?.id) {
        // Also keep guest storage updated so history is never lost on sign-out
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(sessions.slice(0, 15)),
        );
        const compactForCloud = sessions
          .filter((s) => s.messages.length > 0)
          .slice(0, 12)
          .map((s) => ({
            id: s.id,
            title: s.title,
            updatedAt: s.updatedAt,
            messages: s.messages.slice(-10).map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content.slice(0, 1800),
              timestamp: m.timestamp,
              followUpQuestions: m.followUpQuestions?.slice(0, 3),
            })),
          }));

        const timer = window.setTimeout(() => {
          browserAccounts()
            .then((client) => {
              if (!client) return;
              return client.auth.updateUser({
                data: { doitai_chat_sessions_v1: compactForCloud },
              });
            })
            .then(() => setCloudSynced(true))
            .catch(() => {});
        }, 900);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // Ignore quota errors
    }
  }, [sessions, activeStorageKey, googleUser?.id]);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Smart Scroll: Scroll to the TOP of the latest message inside the chat container (NEVER yank user to the bottom of a long reply!)
  useEffect(() => {
    const container = chatScrollContainerRef.current;
    const targetMsg = latestMessageRef.current;
    if (!container || !targetMsg) return;

    const topOffset = Math.max(0, targetMsg.offsetTop - 20);
    container.scrollTo({
      top: topOffset,
      behavior: "smooth",
    });
  }, [activeSession?.messages.length]);

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
    chatScrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
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
      activeSession.messages.length === 0
        ? text.slice(0, 42)
        : activeSession.title;

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

  const downloadToolHtmlDirect = (tool: DoItAiToolItem, defaultTopic = "how to check google keyword rankings") => {
    const blob = new Blob([generatePortableHtmlBundle(tool, defaultTopic)], {
      type: "text/html",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tool.slug}-widget.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredModalTools = ALL_LIVE_TOOLS.filter(
    (t) =>
      !toolSearchQuery.trim() ||
      t.name.toLowerCase().includes(toolSearchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(toolSearchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(toolSearchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#060B19] text-slate-100">
      {/* LEFT SIDEBAR — Clean ChatGPT Style */}
      <aside
        className={`${
          showMobileSidebar
            ? "fixed inset-y-0 left-0 z-50 flex w-72"
            : "hidden lg:flex lg:w-72"
        } shrink-0 flex-col border-r border-slate-800/80 bg-[#080F23]`}
      >
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

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="flex items-center justify-between px-2 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Recent Conversations ({sessions.length})
            </span>
            {googleUser && (
              <span className="text-[10px] font-semibold text-emerald-400">
                {cloudSynced ? "☁️ Synced" : "Syncing..."}
              </span>
            )}
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
                className={`group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
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

        {/* GOOGLE SIGN-IN CHAT HISTORY PERSISTENCE & QUICK LINKS */}
        <div className="border-t border-slate-800/80 p-3 space-y-2 bg-slate-950/60">
          {googleUser ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                    {(
                      googleUser.user_metadata?.full_name ||
                      googleUser.email ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[11px] font-bold text-white">
                      {googleUser.user_metadata?.full_name || googleUser.email}
                    </div>
                    <div className="text-[10px] font-medium text-emerald-400">
                      ☁️ Google Chat History Saved
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => workspace?.signOut()}
                  className="shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] font-semibold text-slate-300 hover:text-white"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => workspace?.signIn()}
              disabled={workspace?.signingIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/90 bg-slate-900/95 hover:border-blue-500/50 hover:bg-slate-900 px-3 py-2 text-xs font-bold text-white transition"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-blue-600">
                G
              </span>
              <span>
                {workspace?.signingIn
                  ? "Connecting Google..."
                  : "Sign in to Save Chat History"}
              </span>
            </button>
          )}

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

      {/* MAIN WORKSPACE COLUMN */}
      <main className="flex flex-1 flex-col h-full overflow-hidden bg-[#060B19]">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#080F23]/90 px-4 py-2 backdrop-blur">
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
              92 Live Tools · 952+ Prompts · 530+ Sanity & Site Visuals · Sufian Mustafa Playbooks
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

        {/* CENTER SCROLLABLE CHAT STREAM (Single Scroller Only) */}
        <div
          ref={chatScrollContainerRef}
          className="relative flex-1 overflow-y-auto px-4 py-4 sm:px-6"
        >
          <div className="mx-auto max-w-4xl h-full">
            {!activeSession || activeSession.messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-2 space-y-5">
                <div className="text-center max-w-2xl mx-auto space-y-2.5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-300">
                    <span>
                      ✨ Do It AI — Your Custom Website GPT & Execution Studio
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                    What would you like to{" "}
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">
                      Learn, Build, or Sell
                    </span>{" "}
                    today?
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
                    Ask any SEO or AI question, pull from{" "}
                    <strong className="text-white">952+ prompts</strong> &{" "}
                    <strong className="text-white">530+ visual diagrams</strong>,
                    or click a prompt below to send it directly to chat:
                  </p>
                </div>

                {/* Frontier-Model (ChatGPT-Style) Single-Line Starter Prompt Pills */}
                <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {STARTER_CARDS.map((card, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendMessage(card.prompt)}
                      className="group flex items-center justify-between gap-2.5 rounded-2xl border border-slate-800/90 bg-[#0B132B]/90 hover:border-blue-500/50 hover:bg-[#101C3D] px-3.5 py-2.5 text-left transition shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-xs">
                          {card.icon}
                        </span>
                        <span className="truncate text-xs sm:text-[13px] font-medium text-slate-200 group-hover:text-white">
                          {card.label}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-md bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                        Send ↵
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
              {activeSession.messages.map((msg, msgIdx) => {
                const isLatestMessage =
                  msgIdx === activeSession.messages.length - 1;
                return (
                  <div
                    key={msg.id}
                    ref={isLatestMessage ? latestMessageRef : null}
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
                          {/* 1. Clean Structured Markdown Content With Hyperlinks */}
                          <StructuredMessageContent content={msg.content} />

                          {/* 2. Mounted Interactive Tool Runner */}
                          {msg.mountedTool && (
                            <InlineToolWorkspaceCard
                              toolSlug={msg.mountedTool.slug}
                              initialInput={msg.mountedTool.defaultInput}
                              initialResult={msg.mountedTool.autoResult}
                            />
                          )}

                          {/* 3. Featured DoItWithAI Promotional Guide Cards (Responsive Split Layout With Images!) */}
                          {msg.liveArticles && msg.liveArticles.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                                  📚 Featured DoItWithAI Guides & Playbooks ({msg.liveArticles.length})
                                </span>
                                <Link
                                  href="/ai-seo"
                                  className="text-[11px] font-semibold text-blue-400 hover:underline"
                                >
                                  Browse SEO Hub ↗
                                </Link>
                              </div>
                              <div className="space-y-3">
                                {msg.liveArticles.map((art, aIdx) => {
                                  const imgSrc =
                                    art.image ||
                                    "/prompts/metadata-prompts-hero-v2.webp";
                                  return (
                                    <div
                                      key={art.url || aIdx}
                                      className="overflow-hidden rounded-2xl border border-slate-800/90 bg-[#0E1730] shadow-lg transition hover:border-blue-500/40"
                                    >
                                      <div className="grid grid-cols-1 sm:grid-cols-12 items-center">
                                        <Link
                                          href={art.url}
                                          className="sm:col-span-5 p-3 sm:p-3.5 block"
                                        >
                                          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 aspect-[16/10]">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                              src={imgSrc}
                                              alt={art.title}
                                              onError={(e) => {
                                                e.currentTarget.src =
                                                  "/prompts/metadata-prompts-hero-v2.webp";
                                              }}
                                              className="h-full w-full object-cover hover:scale-105 transition duration-300"
                                              loading="lazy"
                                            />
                                          </div>
                                        </Link>
                                        <div className="sm:col-span-7 p-4 sm:p-5 sm:border-l border-slate-800/80 space-y-2">
                                          <div className="flex items-center gap-2">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-[10px] font-black text-white">
                                              AI
                                            </span>
                                            <span className="text-[11px] font-bold text-slate-200">
                                              Do It With AI Tools
                                            </span>
                                          </div>
                                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
                                            {art.badge ||
                                              art.category ||
                                              "PRACTICAL AI SEO GUIDE"}
                                          </div>
                                          <h4 className="text-sm sm:text-base font-extrabold leading-snug text-white">
                                            <Link
                                              href={art.url}
                                              className="hover:text-blue-300 transition"
                                            >
                                              {art.title}
                                            </Link>
                                          </h4>
                                          <p className="text-xs leading-relaxed text-slate-300 line-clamp-2">
                                            {art.summary}
                                          </p>
                                          <div className="pt-1">
                                            <Link
                                              href={art.url}
                                              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition"
                                            >
                                              <span>
                                                {art.ctaLabel ||
                                                  "Read the full guide ↗"}
                                              </span>
                                            </Link>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* 4. Upgraded Related Tools Cards */}
                          {msg.relatedTools && msg.relatedTools.length > 0 && (
                            <div className="rounded-xl border border-slate-800/90 bg-slate-950/75 p-3.5 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                                  ⚡ Connected Live Tools for This Workflow ({msg.relatedTools.length})
                                </span>
                                <Link
                                  href="/tools"
                                  className="text-[11px] font-semibold text-emerald-400 hover:underline"
                                >
                                  All 92 Tools ↗
                                </Link>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {msg.relatedTools.map((t) => (
                                  <div
                                    key={t.slug}
                                    className="flex flex-col justify-between gap-2.5 rounded-xl border border-slate-800 bg-slate-900/90 p-3 hover:border-blue-500/40 transition"
                                  >
                                    <div>
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-400 border border-blue-500/20">
                                          {t.category}
                                        </span>
                                        <Link
                                          href={`/tools/${t.slug}`}
                                          className="text-[11px] font-semibold text-slate-300 hover:text-white"
                                        >
                                          Full Studio ↗
                                        </Link>
                                      </div>
                                      <div className="mt-1.5 text-xs sm:text-sm font-bold text-white">
                                        {t.name}
                                      </div>
                                      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-300 line-clamp-2">
                                        {t.description}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          sendMessage(
                                            `Run ${t.name} for ${
                                              msg.mountedTool?.defaultInput ||
                                              "how to check google keyword rankings"
                                            }`,
                                          )
                                        }
                                        className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-500 px-2.5 py-1.5 text-[11px] font-bold text-white transition"
                                      >
                                        ▷ Run Inline Here
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          downloadToolHtmlDirect(
                                            t,
                                            msg.mountedTool?.defaultInput ||
                                              "how to check google keyword rankings",
                                          )
                                        }
                                        title="Download standalone HTML5 tool widget"
                                        className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
                                      >
                                        ⬇ HTML
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 5. Visual Infographic & Diagram Gallery (Supports Both v.url and v.src + Error Fallback!) */}
                          {msg.visuals && msg.visuals.length > 0 && (
                            <div className="rounded-xl border border-slate-800/90 bg-slate-950/75 p-3.5 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                                  📊 Visual Infographics & Sanity Diagrams ({msg.visuals.length})
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  Click any visual to enlarge or download
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {msg.visuals.map((v) => {
                                  const imgSrc =
                                    v.url ||
                                    v.src ||
                                    "/prompts/metadata-prompts-hero-v2.webp";
                                  const captionText =
                                    v.caption || v.alt || v.title;
                                  const guideHref =
                                    v.pageHref || v.articleSlug || "/ai-seo";
                                  return (
                                    <div
                                      key={v.id}
                                      className="group overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 flex flex-col justify-between"
                                    >
                                      <div
                                        onClick={() =>
                                          setLightboxVisual({
                                            ...v,
                                            url: imgSrc,
                                            caption: captionText,
                                          })
                                        }
                                        className="relative cursor-pointer overflow-hidden bg-slate-950 aspect-[16/10]"
                                      >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={imgSrc}
                                          alt={v.alt || v.title}
                                          onError={(e) => {
                                            e.currentTarget.src =
                                              "/prompts/metadata-prompts-hero-v2.webp";
                                          }}
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
                                          {captionText}
                                        </p>
                                        <div className="pt-1 flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-2.5">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setLightboxVisual({
                                                  ...v,
                                                  url: imgSrc,
                                                  caption: captionText,
                                                })
                                              }
                                              className="text-[11px] font-semibold text-blue-400 hover:text-blue-300"
                                            >
                                              🔍 Enlarge
                                            </button>
                                            <Link
                                              href={guideHref}
                                              className="text-[11px] font-semibold text-slate-300 hover:text-white underline decoration-slate-600"
                                            >
                                              Source Guide ↗
                                            </Link>
                                          </div>
                                          <a
                                            href={imgSrc}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
                                          >
                                            ⬇ Save
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* 6. Copy-Paste Prompts from the 952+ Prompt Library (Supports Both p.prompt and p.template!) */}
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
                              <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
                                {msg.prompts.map((p, pIdx) => {
                                  const promptText =
                                    p.prompt || p.template || p.task || "";
                                  return (
                                    <div
                                      key={p.id || pIdx}
                                      className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-2"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-xs sm:text-sm font-bold text-white">
                                          {pIdx + 1}. {p.title}
                                        </span>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/20">
                                            {p.category}
                                          </span>
                                          {p.toolHref && (
                                            <Link
                                              href={p.toolHref}
                                              className="rounded bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-300 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition"
                                            >
                                              ⚡ Open Tool ↗
                                            </Link>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              navigator.clipboard.writeText(
                                                promptText,
                                              );
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
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const md = `# ${p.title}\n\n**Category:** ${p.category}\n**Task:** ${p.task || ""}\n\n## Prompt Template\n\n\`\`\`\n${promptText}\n\`\`\`\n`;
                                              const blob = new Blob([md], {
                                                type: "text/markdown",
                                              });
                                              const url =
                                                URL.createObjectURL(blob);
                                              const a =
                                                document.createElement("a");
                                              a.href = url;
                                              a.download = `${p.id || "prompt"}.md`;
                                              a.click();
                                              URL.revokeObjectURL(url);
                                            }}
                                            className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300 hover:text-white"
                                          >
                                            ⬇ .MD
                                          </button>
                                        </div>
                                      </div>
                                      {p.task && (
                                        <p className="text-xs text-slate-300">
                                          <strong className="text-slate-200">
                                            Goal:
                                          </strong>{" "}
                                          {p.task}
                                        </p>
                                      )}
                                      <pre className="whitespace-pre-wrap text-xs leading-relaxed text-slate-200 font-mono bg-slate-950/95 p-3 rounded-lg border border-slate-800/90 max-h-48 overflow-y-auto">
                                        {promptText}
                                      </pre>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* 7. Clickable Follow-Up Question Chips */}
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
                );
              })}
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#0B132B]/90 p-4 max-w-xl">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                <div className="text-xs sm:text-sm font-medium text-slate-300">
                  Do It AI is synthesizing your answer with live Sanity visuals,
                  prompts, and connected tools...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PINNED BOTTOM INPUT BAR */}
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

      {/* MODAL 1: 92-TOOL DIRECTORY DRAWER */}
      {showToolsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-800 bg-[#0B132B] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  All 92 Live AI & SEO Tools
                </h3>
                <p className="text-xs text-slate-400">
                  Click &quot;Run in Chat&quot; to execute any tool inline or
                  &quot;Full Studio&quot; to open its dedicated page.
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
                  href={
                    lightboxVisual.url ||
                    lightboxVisual.src ||
                    "/prompts/metadata-prompts-hero-v2.webp"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
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
                src={
                  lightboxVisual.url ||
                  lightboxVisual.src ||
                  "/prompts/metadata-prompts-hero-v2.webp"
                }
                alt={lightboxVisual.alt || lightboxVisual.title}
                onError={(e) => {
                  e.currentTarget.src = "/prompts/metadata-prompts-hero-v2.webp";
                }}
                className="max-h-[66vh] w-auto object-contain rounded-lg"
              />
            </div>
            <p className="text-xs text-slate-300">
              {lightboxVisual.caption || lightboxVisual.alt}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

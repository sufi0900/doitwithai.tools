"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Bot,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Send,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { toolPath } from "@/features/tool-catalog/catalog";
import {
  appendCopilotMessages,
  loadStudioState,
  subscribeStudioDrawer,
  type StudioDrawerAction,
} from "@/lib/studio/store";
import type {
  ConnectedStudioSite,
  StudioCopilotMessage,
} from "@/lib/studio/types";

interface Props {
  activeSite: ConnectedStudioSite | null;
}

interface CopilotApiResponse {
  ok?: boolean;
  error?: string;
  reply?: string;
  recommendedTools?: Array<{ slug: string; name: string }>;
  recommendedPrompts?: Array<{ id: string; title: string; prompt: string }>;
  followUps?: string[];
}

function resolveDrawerToolPath(slug: string): string {
  if (slug === "blog-to-infographic-generator") {
    return "/tools/blog-section-infographic-generator";
  }
  return toolPath(slug);
}

export default function StudioGlobalDrawer({ activeSite }: Props) {
  const [drawer, setDrawer] = useState<StudioDrawerAction>({ type: "close" });
  const [messages, setMessages] = useState<StudioCopilotMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [latestPrompts, setLatestPrompts] = useState<
    Array<{ id: string; title: string; prompt: string }>
  >([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const siteKey = activeSite?.id || "global";

  useEffect(() => {
    const state = loadStudioState();
    setMessages(state.copilotMessagesBySite[siteKey] || []);
  }, [siteKey]);

  useEffect(() => {
    return subscribeStudioDrawer((action) => {
      setDrawer(action);
      if (action.type === "open-tool" || action.type === "open-playbook") {
        setIframeLoaded(false);
      }
      if (action.type === "open-copilot" && action.prompt) {
        if (action.autoSend) {
          setPendingPrompt(action.prompt);
        } else {
          setInput(action.prompt);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const sendQuestion = async (rawQuestion: string) => {
    const trimmed = rawQuestion.trim();
    if (!trimmed || sending) return;

    const userMsg: StudioCopilotMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAtIso: new Date().toISOString(),
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setSending(true);

    try {
      const studio = loadStudioState();
      const topKeywords = activeSite
        ? studio.keywords
            .filter((k) => k.siteId === activeSite.id)
            .slice(0, 8)
            .map((k) => k.keyword)
        : [];

      const res = await fetch("/api/studio/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: nextHistory.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          siteContext: activeSite
            ? {
                name: activeSite.name,
                url: activeSite.url,
                niche: activeSite.coreOfferSummary || activeSite.niche,
                audience: activeSite.audience,
                sitemapCount: activeSite.sitemapUrls.length,
                seoScore: activeSite.auditSnapshot?.overallScore,
                topKeywords,
              }
            : undefined,
        }),
      });

      const payload = (await res.json()) as CopilotApiResponse;
      const replyMsg: StudioCopilotMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content:
          payload.reply ||
          payload.error ||
          "Unable to generate a response right now.",
        createdAtIso: new Date().toISOString(),
        recommendedToolSlugs: payload.recommendedTools?.map(
          (t) => `${t.slug}::${t.name}`,
        ),
        followUps: payload.followUps,
      };

      if (payload.recommendedPrompts?.length) {
        setLatestPrompts(payload.recommendedPrompts);
      }

      const updated = [...nextHistory, replyMsg];
      setMessages(updated);
      appendCopilotMessages(siteKey, updated);
    } catch {
      const fallbackMsg: StudioCopilotMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content:
          "Connection interrupted. Please retry your question in a moment.",
        createdAtIso: new Date().toISOString(),
      };
      setMessages([...nextHistory, fallbackMsg]);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (drawer.type === "open-copilot" && pendingPrompt && !sending) {
      const promptToRun = pendingPrompt;
      setPendingPrompt(null);
      void sendQuestion(promptToRun);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawer.type, pendingPrompt, sending]);

  if (drawer.type === "close") return null;

  const handleCopyPrompt = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const starterQuestions = activeSite
    ? [
        `What are the highest-ROI SEO priorities for ${activeSite.name} right now?`,
        `Which 3 pillar articles should I write first in Content Writer?`,
        `Which On-Page & Technical checks matter most for AI Overview citations?`,
      ]
    : [
        "How should I structure my first Pillar & Spoke topic cluster?",
        "Which DoItWithAI tools help audit an existing landing page?",
        "How do I earn natural editorial backlinks without cold spam?",
      ];

  const isWideDrawer =
    drawer.type === "open-tool" || drawer.type === "open-playbook";
  const resolvedToolHref =
    drawer.type === "open-tool" ? resolveDrawerToolPath(drawer.slug) : "";
  const playbookEmbedHref =
    drawer.type === "open-playbook"
      ? `${drawer.url}${drawer.url.includes("?") ? "&" : "?"}embed=1`
      : "";

  return (
    <div className="fixed inset-0 z-[10040] flex justify-end bg-slate-950/55 backdrop-blur-xs">
      <div
        className={`flex h-full w-full flex-col border-l border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-[#0B1222] dark:text-slate-100 ${
          isWideDrawer ? "max-w-4xl" : "max-w-xl"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5271FF]/15 text-[#5271FF] dark:text-[#9aabff]">
              {drawer.type === "open-copilot" ? (
                <Bot size={18} />
              ) : drawer.type === "open-playbook" ? (
                <BookOpen size={17} />
              ) : (
                <Wrench size={17} />
              )}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold">
                {drawer.type === "open-copilot"
                  ? "DoItWithAI Brand Strategist"
                  : drawer.type === "open-playbook"
                    ? drawer.title
                    : drawer.title || "Tool Workbench"}
              </h2>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {activeSite
                  ? `Active site: ${activeSite.name}`
                  : "DoItWithAI Studio"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDrawer({ type: "close" })}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODE B: INTERACTIVE TOOL WORKBENCH */}
        {drawer.type === "open-tool" ? (
          <div className="relative flex flex-1 flex-col overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-slate-50 px-5 py-2 text-xs dark:border-slate-800/80 dark:bg-slate-900/60">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {activeSite
                  ? `Configured for ${activeSite.name}`
                  : "Interactive SEO Tool"}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDrawer({ type: "open-copilot" })}
                  className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-[#5271FF] dark:text-slate-300"
                >
                  <Bot size={12} />
                  <span>Ask Brand AI</span>
                </button>
                <Link
                  href={resolvedToolHref}
                  target="_blank"
                  className="inline-flex items-center gap-1 font-semibold text-[#5271FF] hover:underline dark:text-[#9aabff]"
                >
                  Open in new tab <ExternalLink size={12} />
                </Link>
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden">
              {!iframeLoaded && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-[#0B1222]/85">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <Loader2 size={14} className="animate-spin text-[#5271FF]" />
                    <span>Loading tool...</span>
                  </div>
                </div>
              )}
              <iframe
                key={drawer.slug}
                src={`${resolvedToolHref}?embed=1&studio=1`}
                title={drawer.title || drawer.slug}
                onLoad={() => setIframeLoaded(true)}
                className="h-full w-full flex-1 border-0 bg-white dark:bg-[#0B1222]"
              />
            </div>
          </div>
        ) : drawer.type === "open-playbook" ? (
          /* MODE C: EXECUTIVE PLAYBOOK READER + MATCHED TOOL SHORTCUT */
          <div className="relative flex flex-1 flex-col overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-slate-50 px-5 py-2.5 text-xs dark:border-slate-800/80 dark:bg-slate-900/60">
              <div className="flex flex-wrap items-center gap-2">
                {drawer.relatedTools?.[0] && (
                  <button
                    type="button"
                    onClick={() => {
                      const t = drawer.relatedTools![0]!;
                      setIframeLoaded(false);
                      setDrawer({
                        type: "open-tool",
                        slug: t.slug,
                        title: t.name,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#5271FF] px-3 py-1 font-bold text-white transition hover:bg-[#4361EE]"
                  >
                    <Wrench size={12} />
                    <span>{drawer.relatedTools[0].name}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const prompt = `Summarize the step-by-step action checklist from "${drawer.title}" and tailor it to my connected website.`;
                    setDrawer({ type: "open-copilot", prompt, autoSend: true });
                    setPendingPrompt(prompt);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <Bot size={12} />
                  <span>AI Action Checklist</span>
                </button>
              </div>
              <Link
                href={drawer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#5271FF] hover:underline dark:text-[#9aabff]"
              >
                Open in new tab <ExternalLink size={12} />
              </Link>
            </div>

            <div className="relative flex-1 overflow-hidden">
              {!iframeLoaded && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-[#0B1222]/85">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <Loader2 size={14} className="animate-spin text-[#5271FF]" />
                    <span>Loading playbook...</span>
                  </div>
                </div>
              )}
              <iframe
                key={drawer.url}
                src={playbookEmbedHref}
                title={drawer.title}
                onLoad={() => setIframeLoaded(true)}
                className="h-full w-full flex-1 border-0 bg-white dark:bg-[#0B1222]"
              />
            </div>
          </div>
        ) : (
          /* MODE A: SITE-AWARE DOITWITHAI BRAND AI STRATEGIST CHAT */
          <div className="flex flex-1 flex-col overflow-hidden">
            <div
              ref={scrollRef}
              className="flex-1 space-y-4 overflow-y-auto p-5"
            >
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                    <div className="mb-1.5 flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <Sparkles size={14} className="text-[#5271FF]" />
                      <span>Your Site-Aware DoItWithAI Strategist</span>
                    </div>
                    Ask about keyword gaps, content briefs, on-page fixes,
                    technical schema, or which DoItWithAI tool/prompt to run
                    next.
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Quick Questions
                    </p>
                    {starterQuestions.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => void sendQuestion(q)}
                        className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-xs font-medium text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-800 dark:bg-[#0D1526] dark:text-slate-200"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#5271FF] font-medium text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-[#0D1526] dark:text-slate-200"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.recommendedToolSlugs &&
                    msg.recommendedToolSlugs.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {msg.recommendedToolSlugs.map((raw) => {
                          const [slug, name] = raw.split("::");
                          if (!slug) return null;
                          return (
                            <button
                              key={slug}
                              type="button"
                              onClick={() => {
                                setIframeLoaded(false);
                                setDrawer({
                                  type: "open-tool",
                                  slug,
                                  title: name || slug,
                                });
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#5271FF]/30 bg-[#5271FF]/10 px-2.5 py-1 text-[11px] font-semibold text-[#5271FF] hover:bg-[#5271FF] hover:text-white dark:text-[#9aabff]"
                            >
                              <Wrench size={11} />
                              <span>{name || slug}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.followUps.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => void sendQuestion(f)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600 hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-800 dark:text-slate-400"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {sending && (
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  <Loader2 size={13} className="animate-spin text-[#5271FF]" />
                  <span>Analyzing site &amp; playbooks...</span>
                </div>
              )}

              {latestPrompts.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Matched Vault Prompts
                  </p>
                  <div className="mt-2 space-y-2">
                    {latestPrompts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-xs dark:bg-[#0D1526]"
                      >
                        <span className="truncate font-medium">{p.title}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyPrompt(p.id, p.prompt)}
                          className="inline-flex shrink-0 items-center gap-1 font-semibold text-[#5271FF] dark:text-[#9aabff]"
                        >
                          {copiedId === p.id ? (
                            <>
                              <Check size={12} /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={12} /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendQuestion(input);
              }}
              className="border-t border-slate-200 p-4 dark:border-slate-800"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    activeSite
                      ? `Ask about ${activeSite.name}...`
                      : "Ask your Brand AI Strategist..."
                  }
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#5271FF] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#4361EE] disabled:opacity-60"
                >
                  <Send size={14} />
                  <span>Ask</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

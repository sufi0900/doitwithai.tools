"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Bot,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Wrench,
} from "lucide-react";
import { toolPath } from "@/features/tool-catalog/catalog";
import { dispatchStudioDrawer, togglePlaybookCompleted } from "@/lib/studio/store";
import type { ConnectedStudioSite } from "@/lib/studio/types";

export type StudioInlineItem =
  | { type: "tool"; slug: string; title: string }
  | {
      type: "playbook";
      slug: string;
      title: string;
      url: string;
      track?: string;
      relatedTools?: Array<{ slug: string; name: string }>;
    };

export function resolveStudioToolPath(slug: string): string {
  if (slug === "blog-to-infographic-generator") {
    return "/tools/blog-section-infographic-generator";
  }
  return toolPath(slug);
}

interface StudioInlineEmbedPanelProps {
  item: StudioInlineItem;
  activeSite: ConnectedStudioSite | null;
  backLabel: string;
  completedPlaybookSlugs?: string[];
  onBack: () => void;
  onSwitchItem: (next: StudioInlineItem) => void;
}

export default function StudioInlineEmbedPanel({
  item,
  activeSite,
  backLabel,
  completedPlaybookSlugs = [],
  onBack,
  onSwitchItem,
}: StudioInlineEmbedPanelProps) {
  const externalHref =
    item.type === "tool" ? resolveStudioToolPath(item.slug) : item.url;
  const embedSrc =
    item.type === "tool"
      ? `${externalHref}?embed=1&studio=1`
      : `${item.url}${item.url.includes("?") ? "&" : "?"}embed=1`;

  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    setIframeLoaded(false);
  }, [embedSrc]);

  const isPlaybookCompleted =
    item.type === "playbook" && completedPlaybookSlugs.includes(item.slug);
  const matchedTool =
    item.type === "playbook" ? item.relatedTools?.[0] || null : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
      {/* Inline Workspace Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/90 px-4 py-3 sm:px-5 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-[#9aabff]"
          >
            <ArrowLeft size={13} />
            <span>{backLabel}</span>
          </button>

          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#5271FF]/15 text-[#5271FF] dark:text-[#9aabff]">
              {item.type === "playbook" ? (
                <BookOpen size={15} />
              ) : (
                <Wrench size={15} />
              )}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {item.title}
              </h2>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {activeSite
                  ? `Active site: ${activeSite.name}`
                  : item.type === "playbook"
                    ? item.track || "SEO Playbook"
                    : "Interactive Tool"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {item.type === "playbook" ? (
            <>
              {matchedTool && (
                <button
                  type="button"
                  onClick={() =>
                    onSwitchItem({
                      type: "tool",
                      slug: matchedTool.slug,
                      title: matchedTool.name,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#5271FF] px-3 py-1.5 font-bold text-white transition hover:bg-[#4361EE]"
                >
                  <Wrench size={12} />
                  <span>{matchedTool.name}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => togglePlaybookCompleted(item.slug)}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 font-semibold transition ${
                  isPlaybookCompleted
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
                    : "border-slate-200 bg-white text-slate-700 hover:border-emerald-500/50 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                <CheckCircle2 size={12} />
                <span>{isPlaybookCompleted ? "Completed" : "Mark Complete"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  dispatchStudioDrawer({
                    type: "open-copilot",
                    prompt: `Summarize the step-by-step action checklist from "${item.title}" and tailor it to my connected website.`,
                    autoSend: true,
                  })
                }
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <Bot size={12} />
                <span>AI Action Checklist</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => dispatchStudioDrawer({ type: "open-copilot" })}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <Bot size={12} className="text-[#5271FF]" />
              <span>Ask Brand AI</span>
            </button>
          )}

          <Link
            href={externalHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-[#5271FF] transition hover:border-[#5271FF] dark:border-slate-700 dark:bg-slate-900 dark:text-[#9aabff]"
          >
            <span>Open in new tab</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* Full-Width Inline Interactive Canvas */}
      <div className="relative">
        {!iframeLoaded && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/85 dark:bg-[#0B1222]/90">
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <Loader2 size={14} className="animate-spin text-[#5271FF]" />
              <span>
                {item.type === "playbook"
                  ? "Loading playbook..."
                  : "Loading tool..."}
              </span>
            </div>
          </div>
        )}
        <iframe
          key={embedSrc}
          src={embedSrc}
          title={item.title}
          onLoad={() => setIframeLoaded(true)}
          className="h-[calc(100vh-210px)] min-h-[760px] w-full border-0 bg-white dark:bg-[#0B1222]"
        />
      </div>
    </div>
  );
}

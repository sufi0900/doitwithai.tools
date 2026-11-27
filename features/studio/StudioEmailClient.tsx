"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Eye,
  FileText,
  Globe,
  Layers,
  Loader2,
  Mail,
  Palette,
  PenTool,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { BlogInfographicConfig } from "@/lib/blog-writer/canonical-state";
import { saveBlogProject } from "@/lib/blog-writer/project-storage-db";
import { buildInfographicScene } from "@/lib/blog-infographic-studio/canvas-renderer";
import { BLOG_INFOGRAPHIC_PALETTES } from "@/lib/blog-infographic-studio/palettes";
import { BLOG_INFOGRAPHIC_25_TEMPLATES } from "@/lib/blog-infographic-studio/templates";
import { newsletter, saveBlob, svgRaster } from "@/features/writer-workspace/assets";
import {
  articleRevision,
  escapeHtml,
  patchWorkspace,
  workspace,
} from "@/features/writer-workspace/model";
import {
  ARTICLE_STATUS_LABELS,
  notifyStudioArticlesChanged,
  STUDIO_ARTICLES_CHANGED_EVENT,
} from "@/lib/studio/article-library";
import {
  buildSocialInfographicConfigFromProject,
  channelStatusKey,
  deleteStandaloneCampaign,
  getChannelStatusMap,
  loadStudioCampaignSources,
  saveStandaloneCampaign,
  setChannelAssetStatus,
  STUDIO_CAMPAIGNS_CHANGED_EVENT,
  type ChannelAssetStatus,
  type StudioSocialCampaignSource,
} from "@/lib/studio/social-infographic-bridge";
import {
  createDefaultStudioState,
  loadStudioState,
  subscribeStudioState,
} from "@/lib/studio/store";
import type { StudioWorkspaceState } from "@/lib/studio/types";

const EMAIL_CHANNEL_KEY = "email";

const EMAIL_STATUS_LABELS: Record<ChannelAssetStatus, string> = {
  ready: "Ready",
  customized: "Customized",
  posted: "Sent",
};

const EMAIL_STATUS_STYLES: Record<ChannelAssetStatus, string> = {
  ready:
    "border-slate-300/80 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  customized:
    "border-[#5271FF]/35 bg-[#5271FF]/10 text-[#4361EE] dark:text-[#b4c2ff]",
  posted:
    "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

function renderInfographicDataUri(config: BlogInfographicConfig): {
  svg: string;
  dataUri: string;
} {
  try {
    const scene = buildInfographicScene(config);
    return {
      svg: scene.svg,
      dataUri: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(scene.svg)}`,
    };
  } catch {
    return { svg: "", dataUri: "" };
  }
}

export default function StudioEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleIdParam = searchParams.get("articleId");

  const [studio, setStudio] = useState<StudioWorkspaceState>(
    createDefaultStudioState,
  );
  const [sources, setSources] = useState<StudioSocialCampaignSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");
  const [statusMap, setStatusMap] = useState<Record<string, ChannelAssetStatus>>(
    {},
  );
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  // Standalone Creator
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newHeadline, setNewHeadline] = useState("");
  const [newAngle, setNewAngle] = useState("");

  // Workbench fields
  const [subjectText, setSubjectText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");
  const [headerTemplateId, setHeaderTemplateId] = useState<number>(25);
  const [headerPaletteId, setHeaderPaletteId] =
    useState<BlogInfographicConfig["paletteId"]>("indigo-cyber");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exportBusy, setExportBusy] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setStudio(loadStudioState());
    setStatusMap(getChannelStatusMap());
    return subscribeStudioState(() => setStudio(loadStudioState()));
  }, []);

  useEffect(() => {
    if (!switcherOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (
        switcherRef.current &&
        !switcherRef.current.contains(e.target as Node)
      ) {
        setSwitcherOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSwitcherOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [switcherOpen]);

  const activeSite =
    studio.sites.find((s) => s.id === studio.activeSiteId) ||
    studio.sites[0] ||
    null;

  useEffect(() => {
    let cancelled = false;
    const refreshSources = () => {
      void loadStudioCampaignSources(activeSite)
        .then((loaded) => {
          if (cancelled) return;
          setSources(loaded);
          setLoading(false);
          setSelectedSourceId((prev) => {
            if (articleIdParam && loaded.some((s) => s.id === articleIdParam)) {
              return articleIdParam;
            }
            if (prev && loaded.some((s) => s.id === prev)) return prev;
            return loaded[0]?.id || "";
          });
        })
        .catch(() => {
          if (!cancelled) setLoading(false);
        });
    };

    refreshSources();
    window.addEventListener(STUDIO_ARTICLES_CHANGED_EVENT, refreshSources);
    window.addEventListener(STUDIO_CAMPAIGNS_CHANGED_EVENT, refreshSources);
    return () => {
      cancelled = true;
      window.removeEventListener(STUDIO_ARTICLES_CHANGED_EVENT, refreshSources);
      window.removeEventListener(STUDIO_CAMPAIGNS_CHANGED_EVENT, refreshSources);
    };
  }, [activeSite?.id, activeSite, articleIdParam]);

  const selectedSource = useMemo(
    () =>
      sources.find((s) => s.id === selectedSourceId) || sources[0] || null,
    [sources, selectedSourceId],
  );

  const selectedNewsletter = useMemo(() => {
    if (!selectedSource) return null;
    return newsletter(selectedSource.project);
  }, [selectedSource]);

  const subjectOptions = useMemo(() => {
    if (!selectedSource || !selectedNewsletter) return [];
    const opts = [...selectedNewsletter.draft.subjectOptions];
    const kw = selectedSource.primaryKeyword?.trim();
    if (kw && opts.length < 4) {
      opts.push(`Practical playbook: ${kw}`);
    } else if (opts.length < 4) {
      opts.push(`Key checklist: ${selectedSource.title}`);
    }
    return opts.slice(0, 4);
  }, [selectedSource, selectedNewsletter]);

  useEffect(() => {
    if (!selectedSource || !selectedNewsletter) return;
    const savedEmail = workspace(selectedSource.project).email;
    setSubjectText(
      savedEmail?.subject ?? selectedNewsletter.draft.selectedSubject,
    );
    setBodyText(
      savedEmail?.body ??
        selectedNewsletter.text.replace(/^Subject:[^\n]*\n*/i, ""),
    );
  }, [selectedSource?.id, selectedSource, selectedNewsletter]);

  const siteKeywords = useMemo(() => {
    if (!activeSite) return studio.keywords.slice(0, 8);
    return studio.keywords
      .filter((k) => k.siteId === activeSite.id)
      .slice(0, 8);
  }, [studio.keywords, activeSite]);

  const headerConfig = useMemo(() => {
    if (!selectedSource) return null;
    return buildSocialInfographicConfigFromProject(selectedSource.project, {
      channel: "Facebook", // 16:9 widescreen newsletter header
      templateId: headerTemplateId,
      paletteId: headerPaletteId,
      customHeadline: subjectText || selectedSource.title,
      brandName: activeSite?.name,
      brandColor: activeSite?.brandColorHex,
    });
  }, [
    selectedSource,
    headerTemplateId,
    headerPaletteId,
    subjectText,
    activeSite,
  ]);

  const headerPreview = useMemo(
    () => (headerConfig ? renderInfographicDataUri(headerConfig) : { svg: "", dataUri: "" }),
    [headerConfig],
  );

  const handleSelectSource = (sourceId: string) => {
    setSelectedSourceId(sourceId);
    setSwitcherOpen(false);
    router.replace(`/studio/email?articleId=${encodeURIComponent(sourceId)}`);
  };

  const handleCreateStandalone = (e: React.FormEvent) => {
    e.preventDefault();
    const kw = newKeyword.trim();
    if (!kw) return;
    const titleCased = kw.replace(/\b\w/g, (c) => c.toUpperCase());
    const id = `standalone-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const headline = newHeadline.trim() || `${titleCased} — Weekly Briefing`;
    const angle =
      newAngle.trim() ||
      `Actionable takeaways and step-by-step playbook on ${kw} for subscribers.`;

    saveStandaloneCampaign({
      id,
      siteId: activeSite?.id || "general",
      keyword: kw,
      title: headline,
      angle,
      points: [
        {
          title: `Why ${titleCased} Matters Now`,
          detail: `Cut through outdated advice on ${kw} with practical clarity.`,
          metricValue: "1",
        },
        {
          title: "Step-by-Step Workflow",
          detail: "Run a quick baseline review and prioritize high-ROI wins first.",
          metricValue: "2",
        },
        {
          title: "Checklist Before Shipping",
          detail: `Verify examples, internal references, and scannable headings for ${kw}.`,
          metricValue: "3",
        },
        {
          title: "Next Action for Readers",
          detail: "Pick one bottleneck today and track the improvement over 14 days.",
          metricValue: "4",
        },
      ],
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
    });

    setCreatorOpen(false);
    setNewKeyword("");
    setNewHeadline("");
    setNewAngle("");
    handleSelectSource(id);
    setNotice(`Generated standalone newsletter edition & 16:9 header banner for "${kw}".`);
  };

  const handleSaveEdition = async () => {
    if (!selectedSource) return;
    setSaving(true);
    try {
      if (selectedSource.kind === "article") {
        const updated = patchWorkspace(selectedSource.project, {
          email: {
            subject: subjectText,
            body: bodyText,
            sourceRevision: articleRevision(selectedSource.project),
          },
        });
        await saveBlogProject(updated);
        notifyStudioArticlesChanged();
      } else {
        saveStandaloneCampaign({
          id: selectedSource.id,
          siteId: activeSite?.id || "general",
          keyword: selectedSource.primaryKeyword,
          title: subjectText || selectedSource.title,
          angle: bodyText.slice(0, 220),
          points: selectedSource.project.sections.map((s, idx) => ({
            title: s.h2Text,
            detail: s.bodyMarkdown,
            metricValue: String(idx + 1),
          })),
          createdAtIso: selectedSource.updatedAtIso,
          updatedAtIso: new Date().toISOString(),
        });
      }
      setStatusMap(
        setChannelAssetStatus(
          selectedSource.id,
          EMAIL_CHANNEL_KEY,
          "customized",
        ),
      );
      setNotice("Saved newsletter edition changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSent = (sourceId: string) => {
    const key = channelStatusKey(sourceId, EMAIL_CHANNEL_KEY);
    const next: ChannelAssetStatus =
      statusMap[key] === "posted" ? "ready" : "posted";
    setStatusMap(setChannelAssetStatus(sourceId, EMAIL_CHANNEL_KEY, next));
  };

  const handleDownloadHeaderPng = async (
    cfg: BlogInfographicConfig,
    filePrefix: string,
  ) => {
    setExportBusy("Rendering PNG...");
    try {
      const { svg } = renderInfographicDataUri(cfg);
      if (!svg) return;
      const pngUri = await svgRaster(svg, "png");
      const blob = await (await fetch(pngUri)).blob();
      saveBlob(blob, `${filePrefix}-newsletter-header.png`, "image/png");
    } finally {
      setExportBusy("");
    }
  };

  const handleDownloadHtml = (subject: string, body: string, id: string) => {
    const html = `<!doctype html><html><body style="font-family:system-ui,-apple-system,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#0f172a;line-height:1.6"><h1>${escapeHtml(
      subject,
    )}</h1>${body
      .split(/\n\s*\n/)
      .map((t) => `<p>${escapeHtml(t).replace(/\n/g, "<br>")}</p>`)
      .join("")}</body></html>`;
    saveBlob(html, `${id}-newsletter.html`, "text/html;charset=utf-8");
  };

  const handleCopyNewsletter = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(`Subject: ${subjectText}\n\n${bodyText}`);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 1800);
    }
  };

  const recentEditions = useMemo(() => {
    return sources.slice(0, 4).map((src) => {
      const edition = newsletter(src.project);
      const savedEmail = workspace(src.project).email;
      const subject = savedEmail?.subject ?? edition.draft.selectedSubject;
      const body = savedEmail?.body ?? edition.text.replace(/^Subject:[^\n]*\n*/i, "");
      const cfg = buildSocialInfographicConfigFromProject(src.project, {
        channel: "Facebook",
        templateId: 25,
        paletteId: "indigo-cyber",
        customHeadline: subject,
        brandName: activeSite?.name,
        brandColor: activeSite?.brandColorHex,
      });
      return {
        source: src,
        subject,
        body,
        words: body.split(/\s+/).filter(Boolean).length,
        config: cfg,
        preview: renderInfographicDataUri(cfg),
        emailStatus:
          statusMap[channelStatusKey(src.id, EMAIL_CHANNEL_KEY)] ||
          ("ready" as const),
      };
    });
  }, [sources, activeSite, statusMap]);

  return (
    <div className="space-y-6">
      {/* 1. Header + Simple Switcher + Standalone Newsletter Creator */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800 dark:bg-[#0D1526]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Email Newsletter Studio
              </h1>
              {activeSite && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  <Globe size={11} />
                  <span>{activeSite.name}</span>
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Turn any written article or keyword into a ready-to-send email
              newsletter edition with subject line angles and a 16:9 infographic
              header banner.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {sources.length > 0 && (
              <div ref={switcherRef} className="relative">
                <button
                  type="button"
                  onClick={() => setSwitcherOpen((prev) => !prev)}
                  aria-expanded={switcherOpen}
                  aria-haspopup="listbox"
                  className="inline-flex max-w-[280px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:border-[#5271FF]/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <FileText size={13} className="shrink-0 text-[#5271FF]" />
                  <span className="truncate">
                    {selectedSource?.title || "Select Edition"}
                  </span>
                  <ChevronDown size={13} className="shrink-0 text-slate-400" />
                </button>

                {switcherOpen && (
                  <div
                    role="listbox"
                    aria-label="Select newsletter edition"
                    className="absolute right-0 top-full z-50 mt-1.5 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-[#0D1526]"
                  >
                    <div className="max-h-72 space-y-0.5 overflow-y-auto">
                      {sources.map((src) => {
                        const isCurrent = src.id === selectedSource?.id;
                        const st =
                          statusMap[
                            channelStatusKey(src.id, EMAIL_CHANNEL_KEY)
                          ] || "ready";
                        return (
                          <button
                            key={src.id}
                            type="button"
                            role="option"
                            aria-selected={isCurrent}
                            onClick={() => handleSelectSource(src.id)}
                            className={`flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition ${
                              isCurrent
                                ? "bg-[#5271FF]/12 font-bold text-[#4361EE] dark:text-[#b4c2ff]"
                                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70"
                            }`}
                          >
                            <span className="min-w-0 flex-1 truncate">
                              {src.title}
                            </span>
                            <span
                              className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${EMAIL_STATUS_STYLES[st]}`}
                            >
                              {EMAIL_STATUS_LABELS[st]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setCreatorOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#5271FF] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#4361EE]"
            >
              <Plus size={14} />
              <span>Create Standalone Newsletter</span>
            </button>
          </div>
        </div>

        {/* Standalone Keyword/Prompt Newsletter Creator */}
        {creatorOpen && (
          <form
            onSubmit={handleCreateStandalone}
            className="mt-4 rounded-xl border border-[#5271FF]/30 bg-[#5271FF]/[0.05] p-4 dark:bg-[#5271FF]/[0.08]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Generate Standalone Email Newsletter + 16:9 Header Graphic (No Article Required)
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {siteKeywords.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[11px] text-slate-500">Quick keywords:</span>
                    {siteKeywords.slice(0, 4).map((kw) => (
                      <button
                        key={kw.id}
                        type="button"
                        onClick={() => {
                          setNewKeyword(kw.keyword);
                          setNewHeadline(kw.suggestedTitle);
                        }}
                        className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      >
                        {kw.keyword}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setCreatorOpen(false)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-2.5 sm:grid-cols-12">
              <input
                type="text"
                required
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Topic or keyword (e.g. google core update checklist)..."
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none sm:col-span-4 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={newHeadline}
                onChange={(e) => setNewHeadline(e.target.value)}
                placeholder="Optional newsletter subject line..."
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none sm:col-span-4 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={newAngle}
                onChange={(e) => setNewAngle(e.target.value)}
                placeholder="Optional key takeaway..."
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none sm:col-span-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#5271FF] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#4361EE] sm:col-span-2"
              >
                <Sparkles size={13} />
                <span>Generate Edition</span>
              </button>
            </div>
          </form>
        )}

        {notice && (
          <p className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {notice}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-[#0D1526]">
          <Loader2 size={22} className="animate-spin text-[#5271FF]" />
        </div>
      ) : sources.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-[#0D1526]">
          <Mail size={28} className="mx-auto text-[#5271FF]" />
          <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
            No email newsletter editions yet
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Write an article in Content Writer or click{" "}
            <strong>Create Standalone Newsletter</strong> above to build a
            newsletter edition from any topic.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setCreatorOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#5271FF] px-4 py-2 text-xs font-bold text-white"
            >
              <Plus size={14} />
              <span>Create Standalone Newsletter</span>
            </button>
            <Link
              href="/studio/writer?mode=editor"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              <span>Open Content Writer</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* 2. RECENT NEWSLETTER EDITIONS (TOP 4 CARDS) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Created Newsletter Editions
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing {recentEditions.length} of {sources.length}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {recentEditions.map((ed) => {
                const isSelected = ed.source.id === selectedSource?.id;
                return (
                  <div
                    key={ed.source.id}
                    className={`flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-xs transition dark:bg-[#0D1526] ${
                      isSelected
                        ? "border-[#5271FF] ring-2 ring-[#5271FF]/25"
                        : "border-slate-200 hover:border-[#5271FF]/50 dark:border-slate-800"
                    }`}
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => handleSelectSource(ed.source.id)}
                        className="block w-full bg-slate-950 p-2"
                      >
                        {ed.preview.dataUri ? (
                          <img
                            src={ed.preview.dataUri}
                            alt={ed.subject}
                            className="h-36 w-full rounded-lg object-contain"
                          />
                        ) : null}
                      </button>
                      <div className="p-3.5">
                        <div className="flex items-center justify-between gap-2 text-[10px]">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {ed.words} words
                          </span>
                          <span
                            className={`rounded border px-1.5 py-0.5 font-semibold ${EMAIL_STATUS_STYLES[ed.emailStatus]}`}
                          >
                            {EMAIL_STATUS_LABELS[ed.emailStatus]}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs font-bold text-slate-900 dark:text-white">
                          {ed.subject}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 border-t border-slate-100 px-3.5 py-2.5 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleSelectSource(ed.source.id)}
                        className={`flex-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                          isSelected
                            ? "bg-[#5271FF]/15 text-[#4361EE] dark:text-[#b4c2ff]"
                            : "bg-[#5271FF] text-white hover:bg-[#4361EE]"
                        }`}
                      >
                        {isSelected ? "Open Now" : "Load Edition"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void handleDownloadHeaderPng(ed.config, ed.source.id)
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-[#5271FF] dark:border-slate-700 dark:text-slate-200"
                      >
                        <Download size={12} />
                        <span>PNG</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. NEWSLETTER EDITION WORKBENCH */}
          {selectedSource && headerConfig && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800 dark:bg-[#0D1526]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#5271FF] dark:text-[#9aabff]">
                    Active Newsletter Edition
                  </p>
                  <h2 className="mt-0.5 text-base font-bold text-slate-900 dark:text-white">
                    {selectedSource.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {exportBusy && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5271FF]">
                      <Loader2 size={13} className="animate-spin" />
                      {exportBusy}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggleSent(selectedSource.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                      statusMap[
                        channelStatusKey(selectedSource.id, EMAIL_CHANNEL_KEY)
                      ] === "posted"
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-200 text-slate-700 hover:border-emerald-500/50 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <CheckCircle2 size={13} />
                    <span>
                      {statusMap[
                        channelStatusKey(selectedSource.id, EMAIL_CHANNEL_KEY)
                      ] === "posted"
                        ? "Sent ✓"
                        : "Mark as Sent"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-6 lg:grid-cols-12">
                {/* Left Column: Header Infographic + Subject Options */}
                <div className="space-y-4 lg:col-span-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      16:9 Newsletter Header Infographic
                    </span>
                    <div className="mt-1.5 rounded-2xl border border-slate-200 bg-slate-950 p-2.5 dark:border-slate-800">
                      {headerPreview.dataUri && (
                        <img
                          src={headerPreview.dataUri}
                          alt={`${subjectText || selectedSource.title} — 16:9 email newsletter header infographic`}
                          className="w-full rounded-xl object-contain"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span className="mb-1 inline-flex items-center gap-1">
                        <Layers size={12} /> Header Style
                      </span>
                      <select
                        value={headerTemplateId}
                        onChange={(e) =>
                          setHeaderTemplateId(Number(e.target.value))
                        }
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        {BLOG_INFOGRAPHIC_25_TEMPLATES.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>
                            #{tpl.id} {tpl.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span className="mb-1 inline-flex items-center gap-1">
                        <Palette size={12} /> Header Palette
                      </span>
                      <select
                        value={headerPaletteId}
                        onChange={(e) =>
                          setHeaderPaletteId(
                            e.target.value as BlogInfographicConfig["paletteId"],
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        {Object.values(BLOG_INFOGRAPHIC_PALETTES).map((pal) => (
                          <option key={pal.id} value={pal.id}>
                            {pal.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <button
                    type="button"
                    disabled={Boolean(exportBusy)}
                    onClick={() =>
                      void handleDownloadHeaderPng(
                        headerConfig,
                        selectedSource.id,
                      )
                    }
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 hover:border-[#5271FF] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <Download size={13} />
                    <span>Download Header Infographic (PNG)</span>
                  </button>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Subject Line Angles (4 Options)
                    </span>
                    <div className="mt-1.5 space-y-1.5">
                      {subjectOptions.map((subj, idx) => {
                        const active = subjectText === subj;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSubjectText(subj)}
                            className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition ${
                              active
                                ? "border-[#5271FF] bg-[#5271FF]/10 font-bold text-[#4361EE] dark:text-[#b4c2ff]"
                                : "border-slate-200 bg-white text-slate-700 hover:border-[#5271FF]/50 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
                            }`}
                          >
                            {active ? (
                              <Check size={12} className="shrink-0" />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">
                                #{idx + 1}
                              </span>
                            )}
                            <span className="truncate">{subj}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Subject + Body Editor / HTML Preview */}
                <div className="space-y-4 lg:col-span-7">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Subject Line
                    <input
                      type="text"
                      maxLength={180}
                      value={subjectText}
                      onChange={(e) => setSubjectText(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </label>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Newsletter Body
                      </span>
                      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-900">
                        <button
                          type="button"
                          onClick={() => setPreviewMode("edit")}
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold ${
                            previewMode === "edit"
                              ? "bg-white text-slate-900 shadow-xs dark:bg-[#0D1526] dark:text-white"
                              : "text-slate-500"
                          }`}
                        >
                          <PenTool size={11} /> Edit Text
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewMode("preview")}
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold ${
                            previewMode === "preview"
                              ? "bg-white text-slate-900 shadow-xs dark:bg-[#0D1526] dark:text-white"
                              : "text-slate-500"
                          }`}
                        >
                          <Eye size={11} /> HTML Preview
                        </button>
                      </div>
                    </div>

                    {previewMode === "edit" ? (
                      <textarea
                        rows={16}
                        value={bodyText}
                        onChange={(e) => setBodyText(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs leading-relaxed text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="max-h-[380px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 text-slate-900 dark:border-slate-800">
                        <h3 className="text-base font-bold">{subjectText}</h3>
                        <div className="mt-3 space-y-3 text-xs leading-relaxed text-slate-700">
                          {bodyText.split(/\n\s*\n/).map((para, idx) => (
                            <p key={idx} className="whitespace-pre-line">
                              {para}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyNewsletter}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#5271FF] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#4361EE]"
                    >
                      {copiedEmail ? (
                        <>
                          <Check size={13} /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={13} /> Copy Newsletter
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadHtml(
                          subjectText,
                          bodyText,
                          selectedSource.id,
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-[#5271FF] dark:border-slate-700 dark:text-slate-200"
                    >
                      <Download size={13} />
                      <span>Download .HTML</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        saveBlob(
                          `Subject: ${subjectText}\n\n${bodyText}`,
                          `${selectedSource.id}-newsletter.txt`,
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-[#5271FF] dark:border-slate-700 dark:text-slate-200"
                    >
                      <Download size={13} />
                      <span>Download .TXT</span>
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleSaveEdition()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#5271FF]/40 bg-[#5271FF]/10 px-3 py-2 text-xs font-bold text-[#4361EE] hover:bg-[#5271FF]/20 disabled:opacity-60 dark:text-[#b4c2ff]"
                    >
                      {saving ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Check size={13} />
                      )}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. ALL NEWSLETTER EDITIONS TABLE */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                All Newsletter Editions ({sources.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] divide-y divide-slate-200 text-left text-xs dark:divide-slate-800">
                <thead className="bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Subject &amp; Source</th>
                    <th className="px-3 py-3">Target Keyword</th>
                    <th className="px-3 py-3">Article Status</th>
                    <th className="px-3 py-3">Newsletter Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {sources.map((src) => {
                    const emailStatus =
                      statusMap[channelStatusKey(src.id, EMAIL_CHANNEL_KEY)] ||
                      "ready";
                    const ed = newsletter(src.project);
                    const subj =
                      workspace(src.project).email?.subject ??
                      ed.draft.selectedSubject;
                    const body =
                      workspace(src.project).email?.body ??
                      ed.text.replace(/^Subject:[^\n]*\n*/i, "");
                    const isSelected = src.id === selectedSource?.id;

                    return (
                      <tr
                        key={src.id}
                        className={`transition ${
                          isSelected
                            ? "bg-[#5271FF]/[0.05]"
                            : "hover:bg-slate-50/70 dark:hover:bg-slate-900/40"
                        }`}
                      >
                        <td className="max-w-md px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleSelectSource(src.id)}
                            className="text-left font-bold text-slate-900 hover:text-[#5271FF] dark:text-white dark:hover:text-[#9aabff]"
                          >
                            {subj}
                          </button>
                          <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                            {src.title}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                          {src.primaryKeyword || "—"}
                        </td>
                        <td className="px-3 py-3">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {src.kind === "standalone"
                              ? "Standalone"
                              : ARTICLE_STATUS_LABELS[
                                  src.articleStatus as Exclude<
                                    StudioSocialCampaignSource["articleStatus"],
                                    "standalone"
                                  >
                                ]}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded border px-2 py-0.5 text-[11px] font-semibold ${EMAIL_STATUS_STYLES[emailStatus]}`}
                          >
                            {EMAIL_STATUS_LABELS[emailStatus]}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSelectSource(src.id)}
                              className="rounded-lg bg-[#5271FF] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#4361EE]"
                            >
                              {isSelected ? "Open" : "Edit Edition"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDownloadHtml(subj, body, src.id)
                              }
                              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-[#5271FF] dark:border-slate-700 dark:text-slate-300"
                            >
                              .HTML
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleSent(src.id)}
                              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-emerald-500/50 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300"
                            >
                              {emailStatus === "posted" ? "Sent ✓" : "Mark Sent"}
                            </button>
                            {src.kind === "standalone" && (
                              <button
                                type="button"
                                onClick={() => deleteStandaloneCampaign(src.id)}
                                title="Delete standalone newsletter"
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

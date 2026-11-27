"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import JSZip from "jszip";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Film,
  Globe,
  Layers,
  Loader2,
  Palette,
  Plus,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { BlogInfographicConfig } from "@/lib/blog-writer/canonical-state";
import { saveBlogProject } from "@/lib/blog-writer/project-storage-db";
import { buildInfographicScene } from "@/lib/blog-infographic-studio/canvas-renderer";
import { BLOG_INFOGRAPHIC_PALETTES } from "@/lib/blog-infographic-studio/palettes";
import { BLOG_INFOGRAPHIC_25_TEMPLATES } from "@/lib/blog-infographic-studio/templates";
import { buildChannelCarouselSlides, getSocialChannelSpec } from "@/features/writer-workspace/adapters/socialVisualRegistry";
import {
  carousel,
  saveBlob,
  socialDrafts,
  svgRaster,
} from "@/features/writer-workspace/assets";
import { bodyOf, patchWorkspace, workspace } from "@/features/writer-workspace/model";
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
  getStudioSocialChannelMeta,
  loadStudioCampaignSources,
  saveStandaloneCampaign,
  setChannelAssetStatus,
  SOCIAL_INFOGRAPHIC_STYLES,
  STUDIO_CAMPAIGNS_CHANGED_EVENT,
  STUDIO_SOCIAL_CHANNELS,
  type ChannelAssetStatus,
  type StudioSocialCampaignSource,
} from "@/lib/studio/social-infographic-bridge";
import {
  createDefaultStudioState,
  loadStudioState,
  subscribeStudioState,
} from "@/lib/studio/store";
import type { StudioWorkspaceState } from "@/lib/studio/types";

const POST_STATUS_STYLES: Record<ChannelAssetStatus, string> = {
  ready:
    "border-slate-300/80 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  customized:
    "border-[#5271FF]/35 bg-[#5271FF]/10 text-[#4361EE] dark:text-[#b4c2ff]",
  posted:
    "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

const POST_STATUS_LABELS: Record<ChannelAssetStatus, string> = {
  ready: "Ready",
  customized: "Customized",
  posted: "Posted",
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

export default function StudioSocialClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const channelParam = searchParams.get("channel");
  const articleIdParam = searchParams.get("articleId");

  const channelMeta = useMemo(
    () => getStudioSocialChannelMeta(channelParam),
    [channelParam],
  );
  const channel = channelMeta.id;
  const channelSpec = useMemo(() => getSocialChannelSpec(channel), [channel]);

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

  // Standalone Keyword/Prompt Creator state
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newHeadline, setNewHeadline] = useState("");
  const [newAngle, setNewAngle] = useState("");

  // Active workbench visual & copy controls
  const [templateId, setTemplateId] = useState<number>(
    channelMeta.defaultTemplateId,
  );
  const [paletteId, setPaletteId] = useState<BlogInfographicConfig["paletteId"]>(
    channelMeta.defaultPaletteId,
  );
  const [visualHeadline, setVisualHeadline] = useState("");
  const [visualSubheadline, setVisualSubheadline] = useState("");
  const [captionText, setCaptionText] = useState("");
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exportBusy, setExportBusy] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setStudio(loadStudioState());
    setStatusMap(getChannelStatusMap());
    return subscribeStudioState(() => setStudio(loadStudioState()));
  }, []);

  useEffect(() => {
    setTemplateId(channelMeta.defaultTemplateId);
    setPaletteId(channelMeta.defaultPaletteId);
    setNotice("");
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("doitwithai:studio-social-channel", {
          detail: channelMeta.id,
        }),
      );
    }
  }, [channelMeta.id, channelMeta.defaultTemplateId, channelMeta.defaultPaletteId]);

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

  const selectedDraft = useMemo(() => {
    if (!selectedSource) return null;
    const drafts = socialDrafts(selectedSource.project);
    return drafts.find((d) => d.channel === channel) || null;
  }, [selectedSource, channel]);

  // Sync workbench fields when switching article/channel
  useEffect(() => {
    if (!selectedSource) return;
    const overrides = workspace(selectedSource.project).social[channel];
    setVisualHeadline(overrides?.headline || selectedDraft?.headline || selectedSource.title);
    setVisualSubheadline(
      overrides?.body ||
        selectedDraft?.body ||
        selectedSource.project.metaPack?.aeoDirectAnswer50Words ||
        "",
    );
    setCaptionText(overrides?.caption || selectedDraft?.caption || "");
  }, [selectedSource?.id, channel, selectedSource, selectedDraft]);

  const siteKeywords = useMemo(() => {
    if (!activeSite) return studio.keywords.slice(0, 8);
    return studio.keywords
      .filter((k) => k.siteId === activeSite.id)
      .slice(0, 8);
  }, [studio.keywords, activeSite]);

  const activeConfig = useMemo(() => {
    if (!selectedSource) return null;
    return buildSocialInfographicConfigFromProject(selectedSource.project, {
      channel,
      templateId,
      paletteId,
      customHeadline: visualHeadline,
      customSubheadline: visualSubheadline,
      brandName: activeSite?.name,
      brandColor: activeSite?.brandColorHex,
    });
  }, [
    selectedSource,
    channel,
    templateId,
    paletteId,
    visualHeadline,
    visualSubheadline,
    activeSite,
  ]);

  const activePreview = useMemo(
    () => (activeConfig ? renderInfographicDataUri(activeConfig) : { svg: "", dataUri: "" }),
    [activeConfig],
  );

  const styleVariations = useMemo(() => {
    if (!selectedSource) return [];
    const isPortrait = ["Instagram", "LinkedIn", "Pinterest", "Threads"].includes(
      channel,
    );
    return SOCIAL_INFOGRAPHIC_STYLES.map((style) => {
      const tpl = isPortrait
        ? style.portraitTemplateId
        : style.landscapeTemplateId;
      const cfg = buildSocialInfographicConfigFromProject(
        selectedSource.project,
        {
          channel,
          templateId: tpl,
          paletteId: style.defaultPaletteId,
          customHeadline: visualHeadline || selectedSource.title,
          customSubheadline: visualSubheadline,
          brandName: activeSite?.name,
        },
      );
      return {
        ...style,
        templateId: tpl,
        config: cfg,
        preview: renderInfographicDataUri(cfg),
      };
    });
  }, [
    selectedSource,
    channel,
    visualHeadline,
    visualSubheadline,
    activeSite,
  ]);

  const handleSelectChannel = (nextChannel: string) => {
    const params = new URLSearchParams();
    params.set("channel", nextChannel);
    if (selectedSourceId) params.set("articleId", selectedSourceId);
    router.replace(`/studio/social?${params.toString()}`);
  };

  const handleSelectSource = (sourceId: string) => {
    setSelectedSourceId(sourceId);
    setSwitcherOpen(false);
    const params = new URLSearchParams();
    params.set("channel", channel);
    params.set("articleId", sourceId);
    router.replace(`/studio/social?${params.toString()}`);
  };

  const handleCreateStandalone = (e: React.FormEvent) => {
    e.preventDefault();
    const kw = newKeyword.trim();
    if (!kw) return;
    const titleCased = kw.replace(/\b\w/g, (c) => c.toUpperCase());
    const id = `standalone-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const headline = newHeadline.trim() || `${titleCased}: Quick Visual Breakdown`;
    const angle =
      newAngle.trim() ||
      `Actionable ${kw} takeaways crafted for ${channelMeta.label}.`;

    saveStandaloneCampaign({
      id,
      siteId: activeSite?.id || "general",
      keyword: kw,
      title: headline,
      angle,
      points: [
        {
          title: `Core ${titleCased} Foundation`,
          detail: `Clarify goals and audience intent before publishing on ${kw}.`,
          metricValue: "1",
        },
        {
          title: "High-Signal Structure",
          detail: "Lead with concrete answers, proof points, and clean visuals.",
          metricValue: "2",
        },
        {
          title: "Avoid Common Pitfalls",
          detail: `Eliminate generic fluff and focus on real ${kw} examples.`,
          metricValue: "3",
        },
        {
          title: "Measure & Repurpose",
          detail: "Turn top performers into carousel decks, shorts, and newsletter hooks.",
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
    setNotice(`Generated new ${channelMeta.shortLabel} post & 4 infographic styles for "${kw}".`);
  };

  const handleSaveCustomization = async () => {
    if (!selectedSource) return;
    setSaving(true);
    try {
      if (selectedSource.kind === "article") {
        const w = workspace(selectedSource.project);
        const updated = patchWorkspace(selectedSource.project, {
          social: {
            ...w.social,
            [channel]: {
              ...w.social[channel],
              caption: captionText,
              headline: visualHeadline,
              body: visualSubheadline,
              theme: BLOG_INFOGRAPHIC_PALETTES[paletteId]?.isLight
                ? "paper"
                : "brand",
            },
          },
        });
        await saveBlogProject(updated);
        notifyStudioArticlesChanged();
      } else {
        const existing = sources.find((s) => s.id === selectedSource.id);
        if (existing) {
          saveStandaloneCampaign({
            id: existing.id,
            siteId: activeSite?.id || "general",
            keyword: existing.primaryKeyword,
            title: visualHeadline || existing.title,
            angle: visualSubheadline || existing.title,
            points: existing.project.sections.map((s, idx) => ({
              title: s.h2Text,
              detail: s.bodyMarkdown,
              metricValue: String(idx + 1),
            })),
            createdAtIso: existing.updatedAtIso,
            updatedAtIso: new Date().toISOString(),
          });
        }
      }
      const nextMap = setChannelAssetStatus(
        selectedSource.id,
        channel,
        "customized",
      );
      setStatusMap(nextMap);
      setNotice(`Saved ${channelMeta.shortLabel} post & infographic customization.`);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePosted = (sourceId: string) => {
    const key = channelStatusKey(sourceId, channel);
    const nextStatus: ChannelAssetStatus =
      statusMap[key] === "posted" ? "ready" : "posted";
    setStatusMap(setChannelAssetStatus(sourceId, channel, nextStatus));
  };

  const handleDownloadSourcePng = async (
    cfg: BlogInfographicConfig,
    filePrefix: string,
  ) => {
    setExportBusy("Rendering PNG...");
    try {
      const { svg } = renderInfographicDataUri(cfg);
      if (!svg) return;
      const pngDataUrl = await svgRaster(svg, "png");
      const blob = await (await fetch(pngDataUrl)).blob();
      saveBlob(blob, `${filePrefix}-${channel.toLowerCase()}.png`, "image/png");
    } finally {
      setExportBusy("");
    }
  };

  const handleDownloadZip = async () => {
    if (!selectedSource || !activePreview.svg) return;
    setExportBusy("Packaging ZIP...");
    try {
      const zip = new JSZip();
      zip.file("caption.txt", captionText);
      zip.file("infographic.svg", activePreview.svg);
      const pngUri = await svgRaster(activePreview.svg, "png");
      zip.file("infographic.png", await (await fetch(pngUri)).blob());
      saveBlob(
        await zip.generateAsync({ type: "blob" }),
        `${channel.toLowerCase()}-${selectedSource.id}.zip`,
      );
    } finally {
      setExportBusy("");
    }
  };

  const handleDownloadCarouselPdf = async () => {
    if (!selectedSource) return;
    setExportBusy("Generating Carousel PDF...");
    try {
      const out = await carousel(selectedSource.project);
      saveBlob(
        out.pdf,
        `${channel.toLowerCase()}-carousel-slides.pdf`,
        "application/pdf",
      );
    } finally {
      setExportBusy("");
    }
  };

  const handleCopyCaption = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(captionText);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 1800);
    }
  };

  const recentCards = useMemo(() => {
    return sources.slice(0, 4).map((src) => {
      const cfg = buildSocialInfographicConfigFromProject(src.project, {
        channel,
        templateId: channelMeta.defaultTemplateId,
        paletteId: channelMeta.defaultPaletteId,
        brandName: activeSite?.name,
        brandColor: activeSite?.brandColorHex,
      });
      return {
        source: src,
        config: cfg,
        preview: renderInfographicDataUri(cfg),
        postStatus:
          statusMap[channelStatusKey(src.id, channel)] || ("ready" as const),
      };
    });
  }, [sources, channel, channelMeta, activeSite, statusMap]);

  return (
    <div className="space-y-6">
      {/* 1. Platform Header Bar + Channel Switcher + Simple Post Switcher + Standalone Generator */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800 dark:bg-[#0D1526]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {channelMeta.studioTitle}
              </h1>
              <span className="rounded-md border border-[#5271FF]/30 bg-[#5271FF]/10 px-2 py-0.5 text-[11px] font-bold text-[#4361EE] dark:text-[#b4c2ff]">
                {channelMeta.aspectLabel}
              </span>
              {activeSite && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  <Globe size={11} />
                  <span>{activeSite.name}</span>
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {channelMeta.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Simple Clean Source Switcher Dropdown */}
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
                    {selectedSource?.title || "Select Post"}
                  </span>
                  <ChevronDown size={13} className="shrink-0 text-slate-400" />
                </button>

                {switcherOpen && (
                  <div
                    role="listbox"
                    aria-label="Select article or post"
                    className="absolute right-0 top-full z-50 mt-1.5 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-[#0D1526]"
                  >
                    <div className="max-h-72 space-y-0.5 overflow-y-auto">
                      {sources.map((src) => {
                        const isCurrent = src.id === selectedSource?.id;
                        const st = statusMap[channelStatusKey(src.id, channel)] || "ready";
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
                              className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${POST_STATUS_STYLES[st]}`}
                            >
                              {POST_STATUS_LABELS[st]}
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
              <span>Create {channelMeta.shortLabel} Post</span>
            </button>
          </div>
        </div>

        {/* Platform Switcher Pills */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto border-t border-slate-200/80 pt-4 pb-1 dark:border-slate-800/80">
          {STUDIO_SOCIAL_CHANNELS.map((c) => {
            const active = c.id === channel;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectChannel(c.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? "border-[#5271FF] bg-[#5271FF] text-white shadow-xs"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-[#5271FF]/50 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                {c.isVideo ? <Film size={12} /> : <Share2 size={12} />}
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Standalone Keyword / Prompt Post Creator */}
        {creatorOpen && (
          <form
            onSubmit={handleCreateStandalone}
            className="mt-4 rounded-xl border border-[#5271FF]/30 bg-[#5271FF]/[0.05] p-4 dark:bg-[#5271FF]/[0.08]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Generate Standalone {channelMeta.shortLabel} Post + 4 Infographic Styles (No Article Required)
              </p>
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
            </div>

            <div className="mt-3 grid gap-2.5 sm:grid-cols-12">
              <input
                type="text"
                required
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Topic, keyword, or prompt (e.g. technical seo checklist 2026)..."
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none sm:col-span-4 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={newHeadline}
                onChange={(e) => setNewHeadline(e.target.value)}
                placeholder="Optional visual headline..."
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none sm:col-span-4 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={newAngle}
                onChange={(e) => setNewAngle(e.target.value)}
                placeholder="Optional angle or hook..."
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none sm:col-span-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#5271FF] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#4361EE] sm:col-span-2"
              >
                <Sparkles size={13} />
                <span>Generate Pack</span>
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
          <Share2 size={28} className="mx-auto text-[#5271FF]" />
          <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
            No {channelMeta.shortLabel} posts or visuals created yet
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Write an article in Content Writer or click{" "}
            <strong>Create {channelMeta.shortLabel} Post</strong> above to
            generate high-craft infographic visuals &amp; captions from any
            keyword right away.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setCreatorOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#5271FF] px-4 py-2 text-xs font-bold text-white"
            >
              <Plus size={14} />
              <span>Create {channelMeta.shortLabel} Post</span>
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
          {/* 2. RECENTLY CREATED VISUALS & POSTS STRIP (TOP 4 CARDS) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent {channelMeta.shortLabel} Visuals &amp; Posts
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing {recentCards.length} of {sources.length}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {recentCards.map(({ source, config, preview, postStatus }) => {
                const isSelected = source.id === selectedSource?.id;
                return (
                  <div
                    key={source.id}
                    className={`flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-xs transition dark:bg-[#0D1526] ${
                      isSelected
                        ? "border-[#5271FF] ring-2 ring-[#5271FF]/25"
                        : "border-slate-200 hover:border-[#5271FF]/50 dark:border-slate-800"
                    }`}
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => handleSelectSource(source.id)}
                        className="block w-full bg-slate-950/90 p-2"
                      >
                        {preview.dataUri ? (
                          <img
                            src={preview.dataUri}
                            alt={config.altText}
                            className="h-44 w-full rounded-lg object-contain"
                          />
                        ) : (
                          <div className="flex h-44 items-center justify-center text-xs text-slate-400">
                            Preview unavailable
                          </div>
                        )}
                      </button>

                      <div className="p-3.5">
                        <div className="flex items-center justify-between gap-2 text-[10px]">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {source.kind === "standalone"
                              ? "Standalone Post"
                              : ARTICLE_STATUS_LABELS[
                                  source.articleStatus as Exclude<
                                    StudioSocialCampaignSource["articleStatus"],
                                    "standalone"
                                  >
                                ]}
                          </span>
                          <span
                            className={`rounded border px-1.5 py-0.5 font-semibold ${POST_STATUS_STYLES[postStatus]}`}
                          >
                            {POST_STATUS_LABELS[postStatus]}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs font-bold text-slate-900 dark:text-white">
                          {source.title}
                        </p>
                        {source.primaryKeyword && (
                          <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
                            {source.primaryKeyword}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 border-t border-slate-100 px-3.5 py-2.5 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleSelectSource(source.id)}
                        className={`flex-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                          isSelected
                            ? "bg-[#5271FF]/15 text-[#4361EE] dark:text-[#b4c2ff]"
                            : "bg-[#5271FF] text-white hover:bg-[#4361EE]"
                        }`}
                      >
                        {isSelected ? "Active in Studio" : "Load Post"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void handleDownloadSourcePng(config, source.id)
                        }
                        title="Download PNG"
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

          {/* 3. HIGH-CRAFT MULTI-STYLE INFOGRAPHIC & POST WORKBENCH */}
          {selectedSource && activeConfig && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800 dark:bg-[#0D1526]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#5271FF] dark:text-[#9aabff]">
                    Active {channelMeta.shortLabel} Workbench ·{" "}
                    {channelSpec.aspectLabel}
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
                    onClick={() => handleTogglePosted(selectedSource.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                      statusMap[channelStatusKey(selectedSource.id, channel)] ===
                      "posted"
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-200 text-slate-700 hover:border-emerald-500/50 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <CheckCircle2 size={13} />
                    <span>
                      {statusMap[channelStatusKey(selectedSource.id, channel)] ===
                      "posted"
                        ? "Posted"
                        : "Mark as Posted"}
                    </span>
                  </button>
                </div>
              </div>

              {/* 4 Multi-Style Infographic Previews */}
              <div className="mt-5">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <Layers size={14} className="text-[#5271FF]" />
                    <span>Choose Infographic Style (Powered by 25 Blog Visual Templates)</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Click any style to apply &amp; customize
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {styleVariations.map((style) => {
                    const isActiveStyle =
                      templateId === style.templateId &&
                      paletteId === style.defaultPaletteId;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => {
                          setTemplateId(style.templateId);
                          setPaletteId(style.defaultPaletteId);
                        }}
                        className={`flex flex-col overflow-hidden rounded-xl border p-2 text-left transition ${
                          isActiveStyle
                            ? "border-[#5271FF] bg-[#5271FF]/[0.08] ring-1 ring-[#5271FF]/30"
                            : "border-slate-200 bg-slate-50/70 hover:border-[#5271FF]/50 dark:border-slate-800 dark:bg-slate-900/50"
                        }`}
                      >
                        {style.preview.dataUri && (
                          <img
                            src={style.preview.dataUri}
                            alt={style.label}
                            className="h-32 w-full rounded-lg bg-slate-950 object-contain"
                          />
                        )}
                        <span className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
                          {style.label}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {style.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customizer + Live Preview + Caption Workbench */}
              <div className="mt-6 grid gap-6 lg:grid-cols-12">
                {/* Left: Live High-Craft Infographic Preview & Controls */}
                <div className="space-y-4 lg:col-span-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-950 p-3 dark:border-slate-800">
                    {activePreview.dataUri ? (
                      <img
                        src={activePreview.dataUri}
                        alt={activeConfig.altText}
                        className="mx-auto max-h-[520px] w-full rounded-xl object-contain"
                      />
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span className="mb-1 inline-flex items-center gap-1">
                        <Layers size={12} /> Infographic Template (25)
                      </span>
                      <select
                        value={templateId}
                        onChange={(e) => setTemplateId(Number(e.target.value))}
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
                        <Palette size={12} /> Color Palette (8)
                      </span>
                      <select
                        value={paletteId}
                        onChange={(e) =>
                          setPaletteId(
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

                  <div className="grid gap-3">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Infographic Headline
                      <input
                        type="text"
                        maxLength={80}
                        value={visualHeadline}
                        onChange={(e) => setVisualHeadline(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </label>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Infographic Subheadline
                      <input
                        type="text"
                        maxLength={120}
                        value={visualSubheadline}
                        onChange={(e) => setVisualSubheadline(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={Boolean(exportBusy)}
                      onClick={() =>
                        void handleDownloadSourcePng(
                          activeConfig,
                          selectedSource.id,
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#5271FF] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#4361EE] disabled:opacity-60"
                    >
                      <Download size={13} />
                      <span>Download PNG</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (activePreview.svg) {
                          saveBlob(
                            activePreview.svg,
                            `${selectedSource.id}-${channel.toLowerCase()}.svg`,
                            "image/svg+xml",
                          );
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-[#5271FF] dark:border-slate-700 dark:text-slate-200"
                    >
                      <Download size={13} />
                      <span>SVG</span>
                    </button>

                    {channelSpec.supportsCarousel && (
                      <button
                        type="button"
                        disabled={Boolean(exportBusy)}
                        onClick={() => void handleDownloadCarouselPdf()}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-[#5271FF] dark:border-slate-700 dark:text-slate-200"
                      >
                        <Download size={13} />
                        <span>Carousel PDF</span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={Boolean(exportBusy)}
                      onClick={() => void handleDownloadZip()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-[#5271FF] dark:border-slate-700 dark:text-slate-200"
                    >
                      <Download size={13} />
                      <span>Post ZIP</span>
                    </button>
                  </div>
                </div>

                {/* Right: Caption / Thread / Video Script Editor */}
                <div className="space-y-4 lg:col-span-6">
                  {selectedDraft && selectedDraft.variants.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {channel === "YouTube"
                          ? "Video Script Angle"
                          : "Caption Angle Presets"}
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {selectedDraft.variants.map((variant, i) => {
                          const isCurrent = captionText === variant.content;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setCaptionText(variant.content)}
                              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                                isCurrent
                                  ? "border-[#5271FF] bg-[#5271FF]/12 text-[#4361EE] dark:text-[#b4c2ff]"
                                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-[#5271FF]/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                              }`}
                            >
                              {isCurrent && <Check size={11} />}
                              <span>{variant.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {channel === "YouTube"
                          ? "YouTube / Short-Form Script"
                          : `${channelMeta.shortLabel} Post Caption`}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {captionText.length} / {channelSpec.safeCharLimit} chars
                      </span>
                    </div>
                    <textarea
                      rows={12}
                      value={captionText}
                      onChange={(e) => setCaptionText(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs leading-relaxed text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCaption}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                    >
                      {copiedCaption ? (
                        <>
                          <Check size={13} /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={13} /> Copy{" "}
                          {channel === "YouTube" ? "Script" : "Caption"}
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleSaveCustomization()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#5271FF]/40 bg-[#5271FF]/10 px-3.5 py-2 text-xs font-bold text-[#4361EE] transition hover:bg-[#5271FF]/20 disabled:opacity-60 dark:text-[#b4c2ff]"
                    >
                      {saving ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Check size={13} />
                      )}
                      <span>Save Changes</span>
                    </button>
                  </div>

                  {channelSpec.supportsCarousel && (
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {channel} Multi-Slide Carousel Outline
                      </p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {buildChannelCarouselSlides(
                          visualHeadline || selectedSource.title,
                          selectedSource.project.sections.map(
                            (sec) => `${sec.h2Text}: ${bodyOf(sec)}`,
                          ),
                          4,
                        ).map((slide) => (
                          <div
                            key={slide.index}
                            className="rounded-lg border border-slate-200/80 bg-white p-2.5 text-[11px] dark:border-slate-800 dark:bg-[#0D1526]"
                          >
                            <span className="font-bold text-[#5271FF] dark:text-[#9aabff]">
                              Slide {slide.badge}
                            </span>
                            <p className="mt-0.5 truncate font-bold text-slate-900 dark:text-white">
                              {slide.headline}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-slate-500 dark:text-slate-400">
                              {slide.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. ALL POSTS & ARTICLES TABLE FOR THIS CHANNEL */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                All {channelMeta.shortLabel} Posts &amp; Articles ({sources.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] divide-y divide-slate-200 text-left text-xs dark:divide-slate-800">
                <thead className="bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Title &amp; Keyword</th>
                    <th className="px-3 py-3">Source Type</th>
                    <th className="px-3 py-3">{channelMeta.shortLabel} Status</th>
                    <th className="px-3 py-3">Updated</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {sources.map((src) => {
                    const postStatus =
                      statusMap[channelStatusKey(src.id, channel)] || "ready";
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
                            {src.title}
                          </button>
                          {src.primaryKeyword && (
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                              {src.primaryKeyword}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {src.kind === "standalone"
                              ? "Standalone Post"
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
                            className={`inline-flex rounded border px-2 py-0.5 text-[11px] font-semibold ${POST_STATUS_STYLES[postStatus]}`}
                          >
                            {POST_STATUS_LABELS[postStatus]}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-[11px] text-slate-500">
                          {src.updatedAtIso
                            ? new Date(src.updatedAtIso).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSelectSource(src.id)}
                              className="rounded-lg bg-[#5271FF] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#4361EE]"
                            >
                              {isSelected ? "Open" : "Edit Post"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTogglePosted(src.id)}
                              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-emerald-500/50 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300"
                            >
                              {postStatus === "posted" ? "Posted ✓" : "Mark Posted"}
                            </button>
                            {src.kind === "standalone" && (
                              <button
                                type="button"
                                onClick={() => deleteStandaloneCampaign(src.id)}
                                title="Delete standalone campaign"
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

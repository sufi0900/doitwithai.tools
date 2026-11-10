"use client";

/**
 * Phase 4 Core Deliverable #2: Dedicated 25-Template Canva / Napkin.ai-Style Blog Infographic Studio
 * File: features/blog-infographic-studio/BlogInfographicStudio.tsx
 *
 * Built & Signed by: Nova-Forge (Flagship Studio Persistence & Workspace Engineer)
 *
 * Supports TWO execution modes:
 *  - `mode="standalone"` (default on `/tools/blog-section-infographic-generator`)
 *  - `mode="embedded-modal"` (drawer/modal inside Phase 6 `Stage4RichEditorAndScorecard.tsx`)
 */

import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";
import JSZip from "jszip";
import {
  Check,
  Code2,
  Copy,
  Download,
  FileCode2,
  ImagePlus,
  Layers,
  Loader2,
  Move,
  PackageCheck,
  Palette,
  Plus,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Type,
  Upload,
  Wand2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";
import PlatformBrandIcon from "@/features/tool-ui/PlatformBrandIcon";
import {
  copyCanvasImageToClipboard,
  downloadCanvasAsPng,
  printCanvasAsPdfPoster,
} from "@/features/tool-ui/visualCardExport";
import {
  MALE_PORTRAIT_PRESETS,
  type LogoBadgeStyle,
  type MalePortraitPresetId,
  type PortraitFrameMode,
} from "@/features/quote-stat-testimonial-card-studio/model";
import {
  loadImageFromFile,
  removePortraitBackground,
  removeStudioBackdropInstant,
} from "@/features/quote-stat-testimonial-card-studio/portraitCutout";
import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
  InfographicAspectRatio,
} from "@/lib/blog-writer/canonical-state";
import { autoRecommendInfographicTemplate } from "@/lib/blog-writer/deterministic-analyzers";
import {
  BLOG_INFOGRAPHIC_25_TEMPLATES,
  type BlogInfographicTemplateSpec,
} from "@/lib/founder-hub/grand-blog-writer-blueprint";
import {
  ASPECT_RATIO_DIMENSIONS,
  BLOG_INFOGRAPHIC_PALETTES,
  createSampleInfographicConfig,
  generateBlogInfographicSvg,
  renderBlogInfographicToCanvas,
  type BlogInfographicCustomColorOverrides,
  type BlogInfographicRenderOptions,
} from "@/lib/blog-infographic-studio/canvas-renderer";

export interface BlogInfographicStudioProps {
  mode?: "standalone" | "embedded-modal";
  initialConfig?: BlogInfographicConfig;
  onSaveConfig?: (updated: BlogInfographicConfig) => void;
  onClose?: () => void;
}

const FAMILY_FILTERS: (
  | "All 25"
  | BlogInfographicTemplateSpec["family"]
)[] = [
  "All 25",
  "Process & Step Flows",
  "Comparison & Versus",
  "Data, KPI & Stat Callouts",
  "Frameworks & Pyramids",
  "Checklists & Cheat Sheets",
  "Hero, OG & Quote Cards",
];

const FRAME_MODE_OPTIONS: { id: PortraitFrameMode; label: string }[] = [
  { id: "auto", label: "Auto (Ring)" },
  { id: "ring-circle", label: "Circle in Ring" },
  { id: "arch", label: "Arch Frame" },
  { id: "rounded", label: "Radius Frame" },
  { id: "cutout", label: "Cutout Aura" },
];

const LOGO_STYLE_OPTIONS: { id: LogoBadgeStyle; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "pill", label: "Brand Pill" },
  { id: "white", label: "White Box" },
  { id: "dark", label: "Dark Box" },
  { id: "plain", label: "No Box" },
];

type BgStatus = "idle" | "working" | "done" | "failed";

/**
 * Live miniature <canvas> preview of each of the 25 templates (`0.22x` scale via `useDeferredValue`)
 * rendered with the user's active headline, nodes, palette, portrait, and logo.
 */
function InfographicTemplateThumb({
  spec,
  baseConfig,
  renderOptions,
  active,
  onSelect,
}: {
  spec: BlogInfographicTemplateSpec;
  baseConfig: BlogInfographicConfig;
  renderOptions: BlogInfographicRenderOptions;
  active: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const deferredConfig = useDeferredValue(baseConfig);
  const deferredOpts = useDeferredValue(renderOptions);

  useEffect(() => {
    if (!ref.current) return;
    renderBlogInfographicToCanvas(
      ref.current,
      {
        ...deferredConfig,
        templateId: spec.id,
        templateSlug: spec.slug,
        templateName: spec.name,
        aspectRatio: "16:9",
      },
      {
        ...deferredOpts,
        scale: 0.22,
      }
    );
  }, [deferredConfig, deferredOpts, spec]);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`group relative flex flex-col justify-between rounded-2xl border p-2.5 text-left transition-all ${
        active
          ? "border-[#4058d0] bg-[#4058d0]/10 ring-2 ring-[#4058d0]/35 dark:bg-[#4058d0]/20"
          : "border-slate-200 bg-white hover:border-[#4058d0]/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
      }`}
    >
      <div>
        <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-slate-900 dark:border-slate-800">
          <canvas
            ref={ref}
            role="img"
            aria-label={`${spec.name} live template preview`}
            className="block h-auto w-full transition-transform duration-200 group-hover:scale-[1.02]"
          />
          <span
            className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-xs ${
              active
                ? "bg-[#4058d0] text-white"
                : "bg-slate-900/85 text-white backdrop-blur-xs"
            }`}
          >
            #{spec.id} · {spec.family.split(" ")[0]}
          </span>
        </div>
        <strong className="mt-2 block text-xs font-extrabold text-slate-900 dark:text-white">
          #{spec.id}. {spec.name}
        </strong>
        <span className="mt-0.5 block text-[10px] leading-4 text-slate-500 dark:text-slate-400">
          Best for: {spec.bestForSectionType}
        </span>
      </div>
    </button>
  );
}

function parseParagraphIntoNodes(raw: string): BlogInfographicNodeItem[] {
  const lines = raw
    .split(/\r?\n|(?<=[.!?])\s+/)
    .map((l) => l.replace(/^[-*•\d.)]+\s*/, "").trim())
    .filter((l) => l.length > 10);

  if (lines.length === 0) return [];
  return lines.slice(0, 6).map((line, idx) => {
    const words = line.split(/\s+/);
    const numMatch = line.match(/(\d+(?:\.\d+)?(?:\s*%|\s*x|\s*px|\s*ms|\+)?)/i);
    return {
      id: `n-${Date.now().toString(36)}-${idx + 1}`,
      badge: `0${idx + 1}`,
      title: words.slice(0, 5).join(" ").replace(/[:.,;-]+$/, ""),
      detail: line.slice(0, 115),
      metricValue: numMatch ? numMatch[1].trim() : `Step ${idx + 1}`,
    };
  });
}

export function BlogInfographicStudio({
  mode = "standalone",
  initialConfig,
  onSaveConfig,
  onClose,
}: BlogInfographicStudioProps) {
  const [cards, setCards] = useState<BlogInfographicConfig[]>(() =>
    initialConfig
      ? [initialConfig]
      : [
          createSampleInfographicConfig(1, "indigo-cyber"),
          {
            ...createSampleInfographicConfig(6, "emerald-growth"),
            id: "infographic-tpl-6",
            headline: "Single-Prompt AI Wrapper vs. 62-Tool Blog Visual Studio",
            subheadline: "Head-to-head SEO, typography & token efficiency comparison",
          },
          {
            ...createSampleInfographicConfig(11, "amber-executive"),
            id: "infographic-tpl-11",
            headline: "4 Core Web Vitals & Organic Ranking Benchmarks (2026)",
            subheadline: "Key metrics across 121 live AI SEO & Visual Studio tools",
          },
        ]
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [familyFilter, setFamilyFilter] =
    useState<(typeof FAMILY_FILTERS)[number]>("All 25");
  const [customColors, setCustomColors] =
    useState<BlogInfographicCustomColorOverrides>({});
  const [rawPasteText, setRawPasteText] = useState("");
  const [showPasteBox, setShowPasteBox] = useState(false);

  // Executive portrait & framing state (100% male executive presets per site-wide rule)
  const [portraitPreset, setPortraitPreset] =
    useState<MalePortraitPresetId>("none");
  const [portraitFrame, setPortraitFrame] = useState<PortraitFrameMode>("auto");
  const [portraitScale, setPortraitScale] = useState(1);
  const [portraitRingScale, setPortraitRingScale] = useState(1);
  const [portraitOffsetX, setPortraitOffsetX] = useState(0);
  const [portraitOffsetY, setPortraitOffsetY] = useState(0);
  const [portraitRadius, setPortraitRadius] = useState(24);
  const [authorName, setAuthorName] = useState("Sufian Mustafa");
  const [authorRole, setAuthorRole] = useState("Founder · DoItWithAI.tools");

  const [presetCutout, setPresetCutout] = useState<
    HTMLImageElement | HTMLCanvasElement | null
  >(null);
  const [uploadedImg, setUploadedImg] = useState<HTMLImageElement | null>(null);
  const [uploadedCutout, setUploadedCutout] =
    useState<HTMLCanvasElement | null>(null);
  const [uploadedName, setUploadedName] = useState("");
  const [autoRemoveBg, setAutoRemoveBg] = useState(true);
  const [bgStatus, setBgStatus] = useState<BgStatus>("idle");

  // Brand logo state
  const [uploadedLogo, setUploadedLogo] = useState<HTMLImageElement | null>(
    null
  );
  const [uploadedLogoName, setUploadedLogoName] = useState("");
  const [logoScale, setLogoScale] = useState(1);
  const [logoBgStyle, setLogoBgStyle] = useState<LogoBadgeStyle>("auto");

  const [zoomLevel, setZoomLevel] = useState(1);
  const [toast, setToast] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const personInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const presetCacheRef = useRef<
    Record<string, { raw: HTMLImageElement; cutout: HTMLCanvasElement }>
  >({});

  const activeConfig = cards[activeIdx] || cards[0];

  function notify(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3500);
  }

  const updateActiveConfig = (
    updater:
      | Partial<BlogInfographicConfig>
      | ((prev: BlogInfographicConfig) => BlogInfographicConfig)
  ) => {
    setCards((prev) =>
      prev.map((c, idx) => {
        if (idx !== activeIdx) return c;
        return typeof updater === "function" ? updater(c) : { ...c, ...updater };
      })
    );
  };

  // Sync when initialConfig prop changes in embedded-modal mode
  useEffect(() => {
    if (initialConfig) {
      setCards([initialConfig]);
      setActiveIdx(0);
    }
  }, [initialConfig]);

  // Listen for Hero Showcase CustomEvent ("select-blog-infographic-template")
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (
        e as CustomEvent<{
          templateId?: number;
          paletteId?: BlogInfographicConfig["paletteId"];
          portraitPreset?: MalePortraitPresetId;
        }>
      ).detail;
      if (!detail) return;
      const spec =
        BLOG_INFOGRAPHIC_25_TEMPLATES.find((t) => t.id === detail.templateId) ??
        BLOG_INFOGRAPHIC_25_TEMPLATES[0];
      updateActiveConfig((curr) => ({
        ...curr,
        templateId: spec.id,
        templateSlug: spec.slug,
        templateName: spec.name,
        paletteId: detail.paletteId ?? curr.paletteId,
      }));
      if (detail.portraitPreset) {
        setPortraitPreset(detail.portraitPreset);
      }
    };
    window.addEventListener("select-blog-infographic-template", handler);
    return () =>
      window.removeEventListener("select-blog-infographic-template", handler);
  });

  // Load male executive portrait preset when selected
  useEffect(() => {
    if (portraitPreset === "none" || portraitPreset === "custom-upload") {
      setPresetCutout(null);
      return;
    }
    const found = MALE_PORTRAIT_PRESETS.find((p) => p.id === portraitPreset);
    if (!found) return;
    setAuthorName(found.authorSample);
    setAuthorRole(found.roleSample);

    const cached = presetCacheRef.current[found.id];
    if (cached) {
      setPresetCutout(autoRemoveBg ? cached.cutout : cached.raw);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const cutout = removeStudioBackdropInstant(img);
      presetCacheRef.current[found.id] = { raw: img, cutout };
      setPresetCutout(autoRemoveBg ? cutout : img);
    };
    img.src = found.imageSrc;
  }, [portraitPreset, autoRemoveBg]);

  const activePortraitSource = useMemo(() => {
    if (portraitPreset === "custom-upload") {
      return autoRemoveBg ? uploadedCutout || uploadedImg : uploadedImg;
    }
    if (portraitPreset !== "none") {
      return presetCutout;
    }
    return null;
  }, [portraitPreset, autoRemoveBg, uploadedCutout, uploadedImg, presetCutout]);

  const renderOptions: BlogInfographicRenderOptions = useMemo(
    () => ({
      customColors,
      portraitSource: activePortraitSource,
      portraitPreset,
      portraitFrame,
      portraitScale,
      portraitRingScale,
      portraitOffsetX,
      portraitOffsetY,
      portraitRadius,
      authorName,
      authorRole,
      logoImage: uploadedLogo,
      logoScale,
      logoBgStyle,
    }),
    [
      customColors,
      activePortraitSource,
      portraitPreset,
      portraitFrame,
      portraitScale,
      portraitRingScale,
      portraitOffsetX,
      portraitOffsetY,
      portraitRadius,
      authorName,
      authorRole,
      uploadedLogo,
      logoScale,
      logoBgStyle,
    ]
  );

  // Render main HD canvas
  useEffect(() => {
    if (!canvasRef.current || !activeConfig) return;
    renderBlogInfographicToCanvas(canvasRef.current, activeConfig, renderOptions);
  }, [activeConfig, renderOptions]);

  const filteredTemplates = useMemo(
    () =>
      familyFilter === "All 25"
        ? BLOG_INFOGRAPHIC_25_TEMPLATES
        : BLOG_INFOGRAPHIC_25_TEMPLATES.filter((t) => t.family === familyFilter),
    [familyFilter]
  );

  const handlePersonUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBgStatus("working");
    try {
      const img = await loadImageFromFile(file);
      setUploadedImg(img);
      setUploadedName(file.name);
      setPortraitPreset("custom-upload");
      const instant = removeStudioBackdropInstant(img);
      setUploadedCutout(instant);
      const refined = await removePortraitBackground(img);
      setUploadedCutout(refined);
      setBgStatus("done");
    } catch {
      setBgStatus("failed");
    }
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const img = await loadImageFromFile(file);
      setUploadedLogo(img);
      setUploadedLogoName(file.name);
      notify("Brand logo applied to infographic.");
    } catch {
      notify("Could not load logo image.");
    }
  };

  const resetPhotoFit = () => {
    setPortraitFrame("auto");
    setPortraitScale(1);
    setPortraitRingScale(1);
    setPortraitOffsetX(0);
    setPortraitOffsetY(0);
    setPortraitRadius(24);
  };

  const handleSelectTemplate = (spec: BlogInfographicTemplateSpec) => {
    updateActiveConfig((curr) => ({
      ...curr,
      templateId: spec.id,
      templateSlug: spec.slug,
      templateName: spec.name,
      altText: `${curr.headline} — ${spec.name}`,
    }));
  };

  const handleAddNode = () => {
    if (activeConfig.nodes.length >= 8) return;
    const nextIdx = activeConfig.nodes.length + 1;
    const nextNode: BlogInfographicNodeItem = {
      id: `n-${Date.now().toString(36)}`,
      badge: `0${nextIdx}`,
      title: `Key Takeaway #${nextIdx}`,
      detail: "Add supporting benchmark, step detail, or E-E-A-T proof.",
      metricValue: `Step ${nextIdx}`,
    };
    updateActiveConfig((curr) => ({
      ...curr,
      nodes: [...curr.nodes, nextNode],
    }));
  };

  const handleUpdateNode = (
    nodeId: string,
    patch: Partial<BlogInfographicNodeItem>
  ) => {
    updateActiveConfig((curr) => ({
      ...curr,
      nodes: curr.nodes.map((n) => (n.id === nodeId ? { ...n, ...patch } : n)),
    }));
  };

  const handleMoveNode = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= activeConfig.nodes.length) return;
    const copy = [...activeConfig.nodes];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    updateActiveConfig({ nodes: copy });
  };

  const handleDeleteNode = (nodeId: string) => {
    if (activeConfig.nodes.length <= 2) {
      notify("Keep at least 2 nodes in an infographic diagram.");
      return;
    }
    updateActiveConfig((curr) => ({
      ...curr,
      nodes: curr.nodes.filter((n) => n.id !== nodeId),
    }));
  };

  const handleDownloadSvg = () => {
    const svg = generateBlogInfographicSvg(activeConfig, renderOptions);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeConfig.templateSlug || "blog-infographic"}.svg`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
    notify("Downloaded crisp vector .SVG infographic.");
  };

  const handleDownloadWebp = () => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/webp", 0.94);
    a.download = `${activeConfig.templateSlug || "blog-infographic"}.webp`;
    a.click();
    notify("Downloaded Core Web Vitals .WebP infographic.");
  };

  const handleCopyCwvHtml = async () => {
    const dims =
      ASPECT_RATIO_DIMENSIONS[activeConfig.aspectRatio] ??
      ASPECT_RATIO_DIMENSIONS["16:9"];
    const figureHtml = `<figure class="my-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
  <img src="/visuals/${activeConfig.templateSlug}.webp" alt="${activeConfig.altText || activeConfig.headline}" width="${dims.width}" height="${dims.height}" loading="lazy" decoding="async" class="w-full h-auto" />
  <figcaption class="px-4 py-2.5 text-xs text-slate-400">${activeConfig.headline} — ${activeConfig.footerSourceLabel}</figcaption>
</figure>`;
    try {
      await navigator.clipboard.writeText(figureHtml);
      notify("Copied zero-CLS Core Web Vitals <figure> HTML.");
    } catch {
      notify("Could not copy HTML to clipboard.");
    }
  };

  const handleDownloadAllZip = async () => {
    const zip = new JSZip();
    const offscreen = document.createElement("canvas");
    cards.forEach((card, i) => {
      renderBlogInfographicToCanvas(offscreen, card, renderOptions);
      const pngBase64 = offscreen
        .toDataURL("image/png")
        .replace(/^data:image\/png;base64,/, "");
      zip.file(`section-${i + 1}-${card.templateSlug}.png`, pngBase64, {
        base64: true,
      });
      zip.file(
        `section-${i + 1}-${card.templateSlug}.svg`,
        generateBlogInfographicSvg(card, renderOptions)
      );
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "blog-section-infographics-pack.zip";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    notify(`Downloaded ${cards.length} PNG + SVG infographics in one .ZIP!`);
  };

  const handleSaveIntoBlogSection = () => {
    if (!onSaveConfig) return;
    const pngDataUrl = canvasRef.current?.toDataURL("image/png");
    const svgMarkup = generateBlogInfographicSvg(activeConfig, renderOptions);
    onSaveConfig({
      ...activeConfig,
      renderedPngDataUrl: pngDataUrl,
      renderedSvgMarkup: svgMarkup,
    });
    notify("Saved infographic into blog section!");
    onClose?.();
  };

  const panel =
    "rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900/90";
  const stepTitle =
    "inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white";
  const label =
    "block text-[11px] font-bold text-slate-700 dark:text-slate-200";
  const field =
    "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#4058d0] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white";

  return (
    <section
      id="tool-studio-workspace"
      className={
        mode === "embedded-modal"
          ? "rounded-3xl border border-slate-700 bg-slate-950 p-4 text-white shadow-2xl sm:p-6"
          : "mx-auto max-w-7xl px-4 py-8 sm:px-6"
      }
    >
      {/* Top URL Extractor Bar (Standalone Mode) or Modal Header (Embedded Mode) */}
      {mode === "standalone" ? (
        <div className="mb-6 space-y-4">
          <UrlArticleExtractorBar
            onExtracted={(data) => {
              const paras = (data.paragraphs || []).filter(
                (p: string) => p.length > 35
              );
              if (paras.length === 0) return;
              const extractedCards: BlogInfographicConfig[] = paras
                .slice(0, 4)
                .map((p: string, idx: number) => {
                  const firstSentence =
                    p.split(/[.!?]/)[0]?.trim() || `Section #${idx + 1}`;
                  const rec = autoRecommendInfographicTemplate(firstSentence, p);
                  const parsedNodes = parseParagraphIntoNodes(p);
                  return {
                    id: `extracted-${idx + 1}`,
                    sectionId: `sec-${idx + 1}`,
                    templateId: rec.templateId,
                    templateSlug: rec.templateSlug,
                    templateName: rec.templateName,
                    headline: firstSentence.slice(0, 88),
                    subheadline: `Extracted from ${data.domain || "article URL"} · ${rec.templateName}`,
                    paletteId: idx % 2 === 0 ? "indigo-cyber" : "emerald-growth",
                    aspectRatio: "16:9",
                    nodes:
                      parsedNodes.length >= 2
                        ? parsedNodes
                        : createSampleInfographicConfig(rec.templateId).nodes,
                    footerSourceLabel: `${data.domain || "DoItWithAI.tools"} · Visual Summary`,
                    altText: `${firstSentence} infographic`,
                  };
                });
              setCards(extractedCards);
              setActiveIdx(0);
              notify(
                `Extracted ${extractedCards.length} section infographics from ${data.domain || "URL"}!`
              );
            }}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5">
              <PlatformBrandIcon
                slugOrText="blog-section-infographic-generator"
                size={24}
              />
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
                  25 Canva &amp; Napkin.ai-Style Blog Infographic Layouts · Zero
                  API Cost
                </span>
                <h2 className="text-base font-black text-slate-900 dark:text-white sm:text-lg">
                  Interactive Blog Section Infographic &amp; Diagram Studio
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const rec = autoRecommendInfographicTemplate(
                    activeConfig.headline,
                    activeConfig.nodes.map((n) => n.detail).join(" ")
                  );
                  const spec =
                    BLOG_INFOGRAPHIC_25_TEMPLATES.find(
                      (t) => t.id === rec.templateId
                    ) ?? BLOG_INFOGRAPHIC_25_TEMPLATES[0];
                  handleSelectTemplate(spec);
                  notify(`Auto-matched Template #${spec.id}: ${spec.name}`);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5]"
              >
                <Wand2 size={14} />
                Auto-Match Template from H2
              </button>
              <button
                type="button"
                onClick={() => void handleDownloadAllZip()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#4058d0] px-3.5 py-2 text-xs font-extrabold text-[#4058d0] hover:bg-[#4058d0]/10 dark:text-blue-300"
              >
                <PackageCheck size={15} />
                Download All ({cards.length}) .ZIP
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400">
              Embedded H2 Visual Customizer · 25 Deterministic Templates
            </span>
            <h3 className="text-lg font-black text-white">
              Customize Section Infographic: {activeConfig.headline}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveIntoBlogSection}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-500"
            >
              <Check size={14} /> Save &amp; Insert into Blog Section
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          ✓ {toast}
        </div>
      )}

      {/* UNIFIED 2-COLUMN STUDIO GRID */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* ============ LEFT COLUMN: STICKY 4-STEP CUSTOMIZATION DECK ============ */}
        <div className="order-2 space-y-4 lg:order-1 lg:col-span-5 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1">
          {/* STEP 1 — AUTHOR / EXECUTIVE PORTRAIT, RING FRAME & BRAND LOGO */}
          <div className={panel}>
            <div className="flex items-center justify-between gap-2">
              <span className={stepTitle}>
                <ImagePlus size={14} />
                1 · Brand Logo &amp; Optional Author Ring Frame
              </span>
              <button
                type="button"
                onClick={resetPhotoFit}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4058d0] hover:underline dark:text-blue-300"
              >
                <RotateCcw size={10} /> Reset Fit
              </button>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3452D1] via-[#4361EE] to-[#5271FF] px-3 py-2 text-xs font-extrabold text-white shadow-md shadow-[#3452D1]/25 transition hover:brightness-110"
                >
                  <ShieldCheck size={13} />
                  <span className="truncate">
                    {uploadedLogoName
                      ? `${uploadedLogoName.slice(0, 14)}…`
                      : "Upload brand logo"}
                  </span>
                </button>
                {uploadedLogoName && (
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedLogo(null);
                      setUploadedLogoName("");
                    }}
                    className="mt-1 flex w-full items-center justify-center gap-1 text-[10px] font-bold text-slate-500 hover:text-rose-500"
                  >
                    <X size={10} /> Remove logo
                  </button>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="sr-only"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => personInputRef.current?.click()}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 transition hover:border-[#4058d0] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  {bgStatus === "working" ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Upload size={13} className="text-[#4058d0]" />
                  )}
                  <span className="truncate">
                    {uploadedName
                      ? `${uploadedName.slice(0, 14)}…`
                      : "Upload author photo"}
                  </span>
                </button>
                <input
                  ref={personInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePersonUpload}
                  className="sr-only"
                />
              </div>
            </div>

            <div className="mt-3">
              <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Author / Executive Portrait Badge (or Diagram Only):
              </span>
              <button
                type="button"
                onClick={() => setPortraitPreset("none")}
                className={`mt-1.5 flex w-full items-center justify-center rounded-xl border py-1.5 text-[11px] font-extrabold transition ${
                  portraitPreset === "none"
                    ? "border-[#4058d0] bg-[#4058d0]/15 text-[#4058d0] dark:text-blue-300"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                }`}
              >
                Diagram Only (Full-Width Infographic Nodes)
              </button>

              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {MALE_PORTRAIT_PRESETS.map((mp) => {
                  const selected = portraitPreset === mp.id;
                  return (
                    <button
                      key={mp.id}
                      type="button"
                      onClick={() => setPortraitPreset(mp.id)}
                      aria-pressed={selected}
                      className={`flex items-center gap-2 rounded-xl border p-1.5 text-left transition ${
                        selected
                          ? "border-[#4058d0] bg-[#4058d0]/15 ring-2 ring-[#4058d0]/30"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950"
                      }`}
                    >
                      <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-slate-300 bg-slate-700 dark:border-slate-700">
                        <Image
                          src={mp.imageSrc}
                          alt={mp.authorSample}
                          fill
                          sizes="28px"
                          className="object-cover object-top"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-extrabold text-slate-900 dark:text-white">
                          {mp.authorSample}
                        </span>
                        <span className="block truncate text-[9px] text-slate-500 dark:text-slate-400">
                          {mp.roleSample.split("·")[0]}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {activePortraitSource && (
              <div className="mt-3 space-y-2.5 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-950">
                <label className="flex cursor-pointer items-center gap-2 text-[11px]">
                  <input
                    type="checkbox"
                    checked={autoRemoveBg}
                    onChange={(e) => setAutoRemoveBg(e.target.checked)}
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Auto-remove &amp; blend photo background
                  </span>
                </label>

                <div>
                  <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#4058d0] dark:text-blue-300">
                    <Move size={11} /> Portrait Frame Mode
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {FRAME_MODE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPortraitFrame(opt.id)}
                        className={`rounded-lg px-2 py-1 text-[10px] font-extrabold transition ${
                          portraitFrame === opt.id
                            ? "bg-[#4058d0] text-white"
                            : "border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <label className={label}>
                    <span className="flex justify-between">
                      <span>Photo Zoom</span>
                      <span className="text-[10px] text-[#4058d0]">
                        {Math.round(portraitScale * 100)}%
                      </span>
                    </span>
                    <input
                      type="range"
                      min={0.7}
                      max={1.45}
                      step={0.01}
                      value={portraitScale}
                      onChange={(e) => setPortraitScale(Number(e.target.value))}
                      className="mt-1 w-full accent-[#4058d0]"
                    />
                  </label>

                  <label className={label}>
                    <span className="flex justify-between">
                      <span>Ring / Frame Size</span>
                      <span className="text-[10px] text-[#4058d0]">
                        {Math.round(portraitRingScale * 100)}%
                      </span>
                    </span>
                    <input
                      type="range"
                      min={0.75}
                      max={1.2}
                      step={0.01}
                      value={portraitRingScale}
                      onChange={(e) =>
                        setPortraitRingScale(Number(e.target.value))
                      }
                      className="mt-1 w-full accent-[#4058d0]"
                    />
                  </label>

                  <label className={label}>
                    <span className="flex justify-between">
                      <span>Position Up / Down</span>
                      <span className="text-[10px] text-[#4058d0]">
                        {Math.round(portraitOffsetY * 100)}%
                      </span>
                    </span>
                    <input
                      type="range"
                      min={-0.25}
                      max={0.25}
                      step={0.01}
                      value={portraitOffsetY}
                      onChange={(e) =>
                        setPortraitOffsetY(Number(e.target.value))
                      }
                      className="mt-1 w-full accent-[#4058d0]"
                    />
                  </label>

                  <label className={label}>
                    <span className="flex justify-between">
                      <span>Position Left / Right</span>
                      <span className="text-[10px] text-[#4058d0]">
                        {Math.round(portraitOffsetX * 100)}%
                      </span>
                    </span>
                    <input
                      type="range"
                      min={-0.25}
                      max={0.25}
                      step={0.01}
                      value={portraitOffsetX}
                      onChange={(e) =>
                        setPortraitOffsetX(Number(e.target.value))
                      }
                      className="mt-1 w-full accent-[#4058d0]"
                    />
                  </label>
                </div>

                <label className={label}>
                  <span className="flex justify-between">
                    <span>Corner / Circle Radius (0%–50%)</span>
                    <span className="text-[10px] text-[#4058d0]">
                      {portraitRadius}%
                    </span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={portraitRadius}
                    onChange={(e) => {
                      setPortraitRadius(Number(e.target.value));
                      if (portraitFrame === "auto") setPortraitFrame("rounded");
                    }}
                    className="mt-1 w-full accent-[#4058d0]"
                  />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={label}>Author Name</label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className={field}
                    />
                  </div>
                  <div>
                    <label className={label}>Author Role</label>
                    <input
                      type="text"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      className={field}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-2.5 space-y-1.5 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Logo / Brand Badge Scale &amp; Style
                </span>
                <span className="text-[10px] font-bold text-[#4058d0]">
                  {Math.round(logoScale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.7}
                max={1.45}
                step={0.02}
                value={logoScale}
                onChange={(e) => setLogoScale(Number(e.target.value))}
                className="w-full accent-[#4058d0]"
              />
              <div className="flex flex-wrap gap-1">
                {LOGO_STYLE_OPTIONS.map((ls) => (
                  <button
                    key={ls.id}
                    type="button"
                    onClick={() => setLogoBgStyle(ls.id)}
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition ${
                      logoBgStyle === ls.id
                        ? "bg-[#4058d0] text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    {ls.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 2 — H2 HEADLINE, SUBHEADLINE, ALT TEXT & FOOTER */}
          <div className={`${panel} space-y-2.5`}>
            <span className={stepTitle}>
              <Type size={14} />2 · H2 Headline, Subtitle &amp; SEO Alt Text
            </span>

            <div>
              <label className={label}>H2 Section Headline</label>
              <input
                type="text"
                value={activeConfig.headline}
                onChange={(e) =>
                  updateActiveConfig({ headline: e.target.value })
                }
                className={`${field} font-bold`}
              />
            </div>

            <div>
              <label className={label}>Subheadline / Context Line</label>
              <input
                type="text"
                value={activeConfig.subheadline}
                onChange={(e) =>
                  updateActiveConfig({ subheadline: e.target.value })
                }
                className={field}
              />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <label className={label}>Footer Source / Domain Label</label>
                <input
                  type="text"
                  value={activeConfig.footerSourceLabel}
                  onChange={(e) =>
                    updateActiveConfig({ footerSourceLabel: e.target.value })
                  }
                  className={field}
                />
              </div>
              <div>
                <label className={label}>Image SEO Alt Text</label>
                <input
                  type="text"
                  value={activeConfig.altText}
                  onChange={(e) =>
                    updateActiveConfig({ altText: e.target.value })
                  }
                  className={field}
                />
              </div>
            </div>
          </div>

          {/* STEP 3 — INTERACTIVE DIAGRAM NODES (2..8) */}
          <div className={`${panel} space-y-2.5`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={stepTitle}>
                <Layers size={14} />3 · Diagram Nodes ({activeConfig.nodes.length}
                /8)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowPasteBox((v) => !v)}
                  className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2 py-1 text-[10px] font-bold text-[#4058d0] dark:text-indigo-300"
                >
                  ⚡ Paste Paragraph → Nodes
                </button>
                <button
                  type="button"
                  onClick={handleAddNode}
                  disabled={activeConfig.nodes.length >= 8}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#4058d0] px-2.5 py-1 text-[10px] font-extrabold text-white disabled:opacity-40"
                >
                  <Plus size={11} /> Add Node
                </button>
              </div>
            </div>

            {showPasteBox && (
              <div className="space-y-2 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-2.5">
                <textarea
                  rows={3}
                  value={rawPasteText}
                  onChange={(e) => setRawPasteText(e.target.value)}
                  placeholder="Paste any H2 section paragraph or bullet list here..."
                  className={field}
                />
                <button
                  type="button"
                  onClick={() => {
                    const parsed = parseParagraphIntoNodes(rawPasteText);
                    if (parsed.length >= 2) {
                      updateActiveConfig({ nodes: parsed });
                      setShowPasteBox(false);
                      notify(`Extracted ${parsed.length} diagram nodes!`);
                    } else {
                      notify("Paste at least 2 sentences or bullet points.");
                    }
                  }}
                  className="rounded-lg bg-[#4058d0] px-3 py-1.5 text-[11px] font-bold text-white"
                >
                  Convert Text into Diagram Nodes
                </button>
              </div>
            )}

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {activeConfig.nodes.map((node, idx) => (
                <div
                  key={node.id}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={node.badge}
                        onChange={(e) =>
                          handleUpdateNode(node.id, { badge: e.target.value })
                        }
                        aria-label={`Node ${idx + 1} badge`}
                        className="w-14 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 font-mono text-[11px] font-extrabold text-[#4058d0] dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-300"
                      />
                      <input
                        type="text"
                        value={node.metricValue || ""}
                        onChange={(e) =>
                          handleUpdateNode(node.id, {
                            metricValue: e.target.value,
                          })
                        }
                        placeholder="Metric / KPI"
                        className="w-24 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-bold text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-400"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveNode(idx, -1)}
                        className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] disabled:opacity-30 dark:border-slate-700"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={idx === activeConfig.nodes.length - 1}
                        onClick={() => handleMoveNode(idx, 1)}
                        className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] disabled:opacity-30 dark:border-slate-700"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNode(node.id)}
                        className="rounded border border-rose-500/30 px-1.5 py-0.5 text-[10px] text-rose-500"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={node.title}
                    onChange={(e) =>
                      handleUpdateNode(node.id, { title: e.target.value })
                    }
                    placeholder="Node title"
                    className={`${field} font-bold`}
                  />
                  <input
                    type="text"
                    value={node.detail}
                    onChange={(e) =>
                      handleUpdateNode(node.id, { detail: e.target.value })
                    }
                    placeholder="Supporting detail"
                    className={field}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* STEP 4 — 8 BRAND PALETTES, HEX WHEEL & 4 ASPECT RATIOS */}
          <div className={`${panel} space-y-2.5`}>
            <div className="flex items-center justify-between">
              <span className={stepTitle}>
                <Palette size={14} />4 · Brand Palette, Hex &amp; Size
              </span>
              {Object.keys(customColors).length > 0 && (
                <button
                  type="button"
                  onClick={() => setCustomColors({})}
                  className="text-[10px] font-bold text-[#4058d0] hover:underline"
                >
                  Reset Hex
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1">
              {Object.values(BLOG_INFOGRAPHIC_PALETTES).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    updateActiveConfig({ paletteId: p.id });
                    setCustomColors({});
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-bold transition ${
                    activeConfig.paletteId === p.id &&
                    Object.keys(customColors).length === 0
                      ? "border-[#4058d0] bg-[#4058d0] text-white"
                      : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: p.accent }}
                  />
                  {p.label.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* Custom Hex Pickers */}
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {(
                [
                  [
                    "Backdrop",
                    customColors.bgStart ||
                      BLOG_INFOGRAPHIC_PALETTES[activeConfig.paletteId].bgStart,
                    (v: string) => ({ bgStart: v }),
                  ],
                  [
                    "Card",
                    customColors.surface ||
                      BLOG_INFOGRAPHIC_PALETTES[activeConfig.paletteId].surface,
                    (v: string) => ({ surface: v }),
                  ],
                  [
                    "Accent",
                    customColors.accent ||
                      BLOG_INFOGRAPHIC_PALETTES[activeConfig.paletteId].accent,
                    (v: string) => ({ accent: v }),
                  ],
                  [
                    "Text",
                    customColors.textMain ||
                      BLOG_INFOGRAPHIC_PALETTES[activeConfig.paletteId].textMain,
                    (v: string) => ({ textMain: v }),
                  ],
                ] as const
              ).map(([name, val, build]) => (
                <label
                  key={name}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                >
                  <input
                    type="color"
                    value={val}
                    onChange={(e) =>
                      setCustomColors((prev) => ({
                        ...prev,
                        ...build(e.target.value),
                      }))
                    }
                    className="h-4 w-5 cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span>{name}</span>
                </label>
              ))}
            </div>

            {/* 4 Aspect Ratios */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 sm:grid-cols-4">
              {(["16:9", "1:1", "4:5", "9:16"] as InfographicAspectRatio[]).map(
                (ar) => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => updateActiveConfig({ aspectRatio: ar })}
                    className={`rounded-lg px-2 py-1.5 text-[10px] font-extrabold transition ${
                      activeConfig.aspectRatio === ar
                        ? "bg-[#4058d0] text-white"
                        : "border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                    }`}
                  >
                    {ar}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* ============ RIGHT COLUMN: LIVE HD CANVAS + 25 LIVE TEMPLATE PREVIEWS ============ */}
        <div className="order-1 space-y-4 lg:order-2 lg:col-span-7">
          {/* Multi-Section Visual Tabs */}
          {mode === "standalone" && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                {cards.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition ${
                      activeIdx === idx
                        ? "bg-[#4058d0] text-white"
                        : "border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    }`}
                  >
                    H2 Visual {idx + 1} (#{c.templateId})
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={cards.length >= 8}
                  onClick={() => {
                    const nextId = ((cards.length * 5) % 25) + 1;
                    const created = createSampleInfographicConfig(
                      nextId,
                      "emerald-growth"
                    );
                    created.id = `visual-${Date.now().toString(36)}`;
                    setCards((prev) => [...prev, created]);
                    setActiveIdx(cards.length);
                  }}
                  className="inline-flex items-center gap-0.5 rounded-lg bg-[#4058d0] px-2.5 py-1 text-[11px] font-bold text-white disabled:opacity-40"
                >
                  <Plus size={12} /> Add Section Visual
                </button>
                {cards.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCards((prev) =>
                        prev.filter((_, idx) => idx !== activeIdx)
                      );
                      setActiveIdx((prev) => Math.max(0, prev - 1));
                    }}
                    aria-label="Remove active visual"
                    className="inline-flex items-center rounded-lg bg-rose-600 px-2 py-1 text-[11px] font-bold text-white"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Live HD Canvas Stage + Visible Export Bar */}
          <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-[#070b14] shadow-xl dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-white">
                Template #{activeConfig.templateId} · {activeConfig.aspectRatio}{" "}
                HD
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    downloadCanvasAsPng(
                      canvasRef.current,
                      `${activeConfig.templateSlug || "blog-infographic"}.png`,
                      () => notify("Downloaded HD .PNG infographic!")
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-[#3452d1] px-3 py-1.5 text-xs font-black text-white hover:bg-[#2842b5]"
                >
                  <Download size={13} /> PNG
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  <FileCode2 size={13} /> Vector SVG
                </button>
                <button
                  type="button"
                  onClick={handleDownloadWebp}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  <Sparkles size={12} /> WebP
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void printCanvasAsPdfPoster(
                      canvasRef.current,
                      activeConfig.headline,
                      () => notify("Exported print-ready .PDF poster!")
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-white/25"
                >
                  <Printer size={12} /> PDF
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await copyCanvasImageToClipboard(
                      canvasRef.current
                    );
                    notify(
                      ok
                        ? "Copied infographic image to clipboard!"
                        : "Downloaded PNG fallback."
                    );
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-white/25"
                >
                  <Copy size={12} /> Copy
                </button>
                <button
                  type="button"
                  onClick={() => void handleCopyCwvHtml()}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-bold text-cyan-300 hover:bg-white/25"
                >
                  <Code2 size={12} /> CWV HTML
                </button>
                {onSaveConfig && (
                  <button
                    type="button"
                    onClick={handleSaveIntoBlogSection}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-emerald-400"
                  >
                    <Check size={13} /> Insert in Blog
                  </button>
                )}
              </div>
            </div>

            <div className="relative flex items-center justify-center overflow-auto p-4 sm:p-6">
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "center top",
                }}
                className="w-full max-w-2xl transition-transform"
              >
                <canvas
                  ref={canvasRef}
                  role="img"
                  aria-label={activeConfig.altText || activeConfig.headline}
                  className="mx-auto block h-auto w-full rounded-xl shadow-2xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/90 px-4 py-2 text-[11px] text-slate-300">
              <span>
                {activeConfig.templateName} ·{" "}
                {ASPECT_RATIO_DIMENSIONS[activeConfig.aspectRatio]?.label}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setZoomLevel((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))
                  }
                  className="rounded bg-white/10 p-1 hover:bg-white/20"
                  aria-label="Zoom out"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="font-mono text-[10px]">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setZoomLevel((z) => Math.min(1.3, Number((z + 0.1).toFixed(2))))
                  }
                  className="rounded bg-white/10 p-1 hover:bg-white/20"
                  aria-label="Zoom in"
                >
                  <ZoomIn size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* 25 LIVE MINIATURE CANVAS TEMPLATE PREVIEWS GALLERY */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Choose from 25 Live Blog Infographic Templates (Click to
                  Switch Instantly)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Every thumbnail below is rendered live with your current H2
                  headline, nodes, brand palette, logo, and portrait—switching
                  templates never resets your edits.
                </p>
              </div>
            </div>

            {/* 6 Visual Family Filter Pills */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {FAMILY_FILTERS.map((fam) => {
                const isAct = familyFilter === fam;
                return (
                  <button
                    key={fam}
                    type="button"
                    onClick={() => setFamilyFilter(fam)}
                    className={`rounded-full px-3 py-1 text-[11px] font-extrabold transition ${
                      isAct
                        ? "bg-[#4058d0] text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-[#4058d0]/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                    }`}
                  >
                    {fam}
                  </button>
                );
              })}
            </div>

            {/* Live Canvas Thumbnails Grid */}
            <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTemplates.map((spec) => (
                <InfographicTemplateThumb
                  key={spec.id}
                  spec={spec}
                  baseConfig={activeConfig}
                  renderOptions={renderOptions}
                  active={activeConfig.templateId === spec.id}
                  onSelect={() => handleSelectTemplate(spec)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlogInfographicStudio;

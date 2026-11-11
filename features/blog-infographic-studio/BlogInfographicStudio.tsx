"use client";

/**
 * Phase 4 Core Deliverable #2: Dedicated 25-Template Venngage / Canva-Style Blog Infographic Studio
 * File: features/blog-infographic-studio/BlogInfographicStudio.tsx
 *
 * Upgraded by: Aegis-Prime & Nova-Forge
 *
 * Key Upgrades:
 *  - Removed irrelevant Testimonial/Founder headshot controls from the Infographic Studio
 *    (Infographics use Brand Logos, Vector Icon Medallions, Charts & AI Art Plates—not portraits)
 *  - Added Hybrid AI Art Plate Selector + Custom Backdrop Image Upload + Spacing Density Controls
 *  - Added Per-Node Vector Icon Picker (20 geometric vector icons) + 6 One-Click Scenario Presets
 *  - Upgraded the 25-Template Preview Cards with "Curated Showcase Mode" (each card displays its
 *    own signature palette, AI art plate & realistic data like Venngage) vs "My Active Text Mode"
 *  - Supports both `mode="standalone"` (/tools/blog-section-infographic-generator) and
 *    `mode="embedded-modal"` (inside /ai-content-writer Stage 4 Rich Editor)
 */

import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent } from "react";
import JSZip from "jszip";
import {
  Check,
  Code2,
  Copy,
  Download,
  Eye,
  FileCode2,
  ImagePlus,
  Layers,
  PackageCheck,
  Palette,
  Plus,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Type,
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
import type { LogoBadgeStyle } from "@/features/quote-stat-testimonial-card-studio/model";
import { loadImageFromFile } from "@/features/quote-stat-testimonial-card-studio/portraitCutout";
import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
  InfographicAspectRatio,
  InfographicBackdropStyle,
  InfographicIconId,
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
  INFOGRAPHIC_ICON_OPTIONS,
  preloadInfographicArtPlates,
  QUICK_SCENARIO_PRESETS,
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

const LOGO_STYLE_OPTIONS: { id: LogoBadgeStyle; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "pill", label: "Brand Pill" },
  { id: "white", label: "White Box" },
  { id: "dark", label: "Dark Box" },
  { id: "plain", label: "No Box" },
];

const BACKDROP_STYLE_OPTIONS: {
  id: InfographicBackdropStyle;
  label: string;
  desc: string;
}[] = [
  {
    id: "ai-art-plate",
    label: "✨ AI Art Plate",
    desc: "Blends curated 3D glass/isometric/paper AI backdrop plates",
  },
  {
    id: "glass-orbs",
    label: "🔮 3D Glow Orbs",
    desc: "Procedural radial neon orbs & architectural grid",
  },
  {
    id: "clean-studio",
    label: "📐 Clean Vector",
    desc: "Minimalist flat studio poster backdrop",
  },
];

/**
 * Upgraded Venngage-Style Live Template Preview Card (`0.26x` high-DPI `<canvas>`):
 * Supports both "Showcase Mode" (each template renders with its own curated palette,
 * AI art plate & realistic data) and "My Active Text Mode".
 */
function InfographicTemplateThumb({
  spec,
  baseConfig,
  renderOptions,
  showcaseMode,
  plateVersion,
  active,
  onApplyLayoutOnly,
  onLoadFullSample,
}: {
  spec: BlogInfographicTemplateSpec;
  baseConfig: BlogInfographicConfig;
  renderOptions: BlogInfographicRenderOptions;
  showcaseMode: boolean;
  plateVersion: number;
  active: boolean;
  onApplyLayoutOnly: () => void;
  onLoadFullSample: () => void;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const deferredConfig = useDeferredValue(baseConfig);
  const deferredOpts = useDeferredValue(renderOptions);

  useEffect(() => {
    if (!ref.current) return;
    const targetConfig: BlogInfographicConfig = showcaseMode
      ? createSampleInfographicConfig(spec.id)
      : {
          ...deferredConfig,
          templateId: spec.id,
          templateSlug: spec.slug,
          templateName: spec.name,
          aspectRatio: "16:9",
        };

    renderBlogInfographicToCanvas(ref.current, targetConfig, {
      ...(showcaseMode ? {} : deferredOpts),
      scale: 0.26,
      showVectorIcons: true,
    });
  }, [deferredConfig, deferredOpts, spec, showcaseMode, plateVersion]);

  const curatedSample = useMemo(
    () => createSampleInfographicConfig(spec.id),
    [spec.id]
  );
  const paletteInfo =
    BLOG_INFOGRAPHIC_PALETTES[
      showcaseMode ? curatedSample.paletteId : baseConfig.paletteId
    ];

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border p-3 text-left transition-all duration-200 ${
        active
          ? "border-[#4058d0] bg-[#4058d0]/10 ring-2 ring-[#4058d0]/40 dark:bg-[#4058d0]/20"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[#4058d0]/60 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
      }`}
    >
      <div>
        <div
          onClick={onApplyLayoutOnly}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onApplyLayoutOnly();
            }
          }}
          className="relative cursor-pointer overflow-hidden rounded-xl border border-slate-200/80 bg-slate-950 shadow-sm dark:border-slate-800"
        >
          <canvas
            ref={ref}
            role="img"
            aria-label={`${spec.name} live infographic preview`}
            className="block h-auto w-full transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute left-2 top-2 flex items-center gap-1">
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm ${
                active
                  ? "bg-[#4058d0] text-white"
                  : "bg-slate-950/85 text-white backdrop-blur-xs"
              }`}
            >
              #{spec.id} · {spec.family.split(" ")[0]}
            </span>
          </div>
          <span
            style={{ backgroundColor: paletteInfo.accent }}
            className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-extrabold text-white shadow-sm"
          >
            {paletteInfo.label.split(" ")[0]}
          </span>
        </div>

        <div className="mt-2.5 flex items-start justify-between gap-2">
          <div>
            <strong className="block text-xs font-extrabold text-slate-900 dark:text-white">
              #{spec.id}. {spec.name}
            </strong>
            <span className="mt-0.5 block text-[10px] leading-4 text-slate-500 dark:text-slate-400">
              Best for: {spec.bestForSectionType}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-slate-100 pt-2.5 dark:border-slate-800/80">
        <button
          type="button"
          onClick={onApplyLayoutOnly}
          className={`rounded-lg px-2 py-1.5 text-[10px] font-extrabold transition ${
            active
              ? "bg-[#4058d0] text-white"
              : "bg-slate-100 text-slate-800 hover:bg-[#4058d0] hover:text-white dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-[#4058d0]"
          }`}
        >
          {active ? "✓ Active Layout" : "Use Layout"}
        </button>
        <button
          type="button"
          onClick={onLoadFullSample}
          className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2 py-1.5 text-[10px] font-extrabold text-[#3452d1] transition hover:bg-indigo-500/20 dark:text-indigo-300"
          title="Load this template along with its curated sample data and signature palette"
        >
          Load Sample
        </button>
      </div>
    </div>
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
    const numMatch = line.match(
      /(\d+(?:\.\d+)?(?:\s*%|\s*x|\s*px|\s*ms|\s*M|\s*K|\+)?)/i
    );
    return {
      id: `n-${Date.now().toString(36)}-${idx + 1}`,
      badge: `0${idx + 1}`,
      title: words.slice(0, 5).join(" ").replace(/[:.,;-]+$/, ""),
      detail: line.slice(0, 115),
      metricValue: numMatch ? numMatch[1].trim() : `Step ${idx + 1}`,
      iconId: "auto",
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
          createSampleInfographicConfig(1),
          {
            ...createSampleInfographicConfig(6),
            id: "infographic-tpl-6",
          },
          {
            ...createSampleInfographicConfig(11),
            id: "infographic-tpl-11",
          },
          {
            ...createSampleInfographicConfig(12),
            id: "infographic-tpl-12",
          },
        ]
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [familyFilter, setFamilyFilter] =
    useState<(typeof FAMILY_FILTERS)[number]>("All 25");
  const [showcaseMode, setShowcaseMode] = useState(true);
  const [plateVersion, setPlateVersion] = useState(0);
  const [customColors, setCustomColors] =
    useState<BlogInfographicCustomColorOverrides>({});
  const [rawPasteText, setRawPasteText] = useState("");
  const [showPasteBox, setShowPasteBox] = useState(false);

  // Brand logo & Custom Backdrop Plate state (No founder/person portrait clutter)
  const [uploadedLogo, setUploadedLogo] = useState<HTMLImageElement | null>(
    null
  );
  const [uploadedLogoName, setUploadedLogoName] = useState("");
  const [logoScale, setLogoScale] = useState(1);
  const [logoBgStyle, setLogoBgStyle] = useState<LogoBadgeStyle>("auto");

  const [customBackdropImg, setCustomBackdropImg] =
    useState<HTMLImageElement | null>(null);
  const [customBackdropName, setCustomBackdropName] = useState("");
  const [showVectorIcons, setShowVectorIcons] = useState(true);
  const [spacingDensity, setSpacingDensity] = useState<
    "compact" | "balanced" | "spacious"
  >("balanced");

  const [zoomLevel, setZoomLevel] = useState(1);
  const [toast, setToast] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const backdropInputRef = useRef<HTMLInputElement | null>(null);

  const activeConfig = cards[activeIdx] || cards[0];

  function notify(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3500);
  }

  // Preload AI-generated Infographic Art Plates
  useEffect(() => {
    preloadInfographicArtPlates(() => {
      setPlateVersion((v) => v + 1);
    });
  }, []);

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

  // Listen for Hero Showcase & Below-Page CustomEvent ("select-blog-infographic-template")
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (
        e as CustomEvent<{
          templateId?: number;
          paletteId?: BlogInfographicConfig["paletteId"];
          loadSampleData?: boolean;
        }>
      ).detail;
      if (!detail) return;
      const spec =
        BLOG_INFOGRAPHIC_25_TEMPLATES.find((t) => t.id === detail.templateId) ??
        BLOG_INFOGRAPHIC_25_TEMPLATES[0];

      if (detail.loadSampleData) {
        const sample = createSampleInfographicConfig(spec.id, detail.paletteId);
        updateActiveConfig((curr) => ({
          ...sample,
          id: curr.id,
          sectionId: curr.sectionId,
        }));
        setCustomColors({});
      } else {
        updateActiveConfig((curr) => ({
          ...curr,
          templateId: spec.id,
          templateSlug: spec.slug,
          templateName: spec.name,
          paletteId: detail.paletteId ?? curr.paletteId,
        }));
      }
      notify(`Loaded Template #${spec.id}: ${spec.name}`);
    };
    window.addEventListener("select-blog-infographic-template", handler);
    return () =>
      window.removeEventListener("select-blog-infographic-template", handler);
  });

  const renderOptions: BlogInfographicRenderOptions = useMemo(
    () => ({
      customColors,
      backdropStyle: activeConfig?.backdropStyle ?? "ai-art-plate",
      backdropPlateImage: customBackdropImg ?? undefined,
      showVectorIcons,
      spacingDensity,
      logoImage: uploadedLogo,
      logoScale,
      logoBgStyle,
    }),
    [
      customColors,
      activeConfig?.backdropStyle,
      customBackdropImg,
      showVectorIcons,
      spacingDensity,
      uploadedLogo,
      logoScale,
      logoBgStyle,
    ]
  );

  // Render main HD canvas
  useEffect(() => {
    if (!canvasRef.current || !activeConfig) return;
    renderBlogInfographicToCanvas(
      canvasRef.current,
      activeConfig,
      renderOptions
    );
  }, [activeConfig, renderOptions, plateVersion]);

  const filteredTemplates = useMemo(
    () =>
      familyFilter === "All 25"
        ? BLOG_INFOGRAPHIC_25_TEMPLATES
        : BLOG_INFOGRAPHIC_25_TEMPLATES.filter((t) => t.family === familyFilter),
    [familyFilter]
  );

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

  const handleCustomBackdropUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const img = await loadImageFromFile(file);
      setCustomBackdropImg(img);
      setCustomBackdropName(file.name);
      updateActiveConfig({ backdropStyle: "ai-art-plate" });
      notify("Custom background art plate applied!");
    } catch {
      notify("Could not load custom background image.");
    }
  };

  const handleApplyLayoutOnly = (spec: BlogInfographicTemplateSpec) => {
    updateActiveConfig((curr) => ({
      ...curr,
      templateId: spec.id,
      templateSlug: spec.slug,
      templateName: spec.name,
      altText: `${curr.headline} — ${spec.name}`,
    }));
    notify(`Switched layout to #${spec.id}: ${spec.name} (kept your text).`);
  };

  const handleLoadFullSample = (spec: BlogInfographicTemplateSpec) => {
    const sample = createSampleInfographicConfig(spec.id);
    updateActiveConfig((curr) => ({
      ...sample,
      id: curr.id,
      sectionId: curr.sectionId,
    }));
    setCustomColors({});
    notify(`Loaded full curated sample for #${spec.id}: ${spec.name}!`);
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
      iconId: "auto",
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
                  const rec = autoRecommendInfographicTemplate(
                    firstSentence,
                    p
                  );
                  const parsedNodes = parseParagraphIntoNodes(p);
                  const sample = createSampleInfographicConfig(rec.templateId);
                  return {
                    ...sample,
                    id: `extracted-${idx + 1}`,
                    sectionId: `sec-${idx + 1}`,
                    headline: firstSentence.slice(0, 88),
                    subheadline: `Extracted from ${data.domain || "article URL"} · ${rec.templateName}`,
                    nodes:
                      parsedNodes.length >= 2 ? parsedNodes : sample.nodes,
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
                  25 Venngage &amp; Canva-Style Composite Infographic Layouts ·
                  AI Art Plates + Vector SVG
                </span>
                <h2 className="text-base font-black text-slate-900 dark:text-white sm:text-lg">
                  Interactive Blog Section Infographic &amp; Data Visual Studio
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
                  handleApplyLayoutOnly(spec);
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
              Embedded H2 Infographic Studio · 25 Composite Layouts + AI Art
              Plates
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
        {/* ============ LEFT COLUMN: STICKY INFOGRAPHIC CONTROL DECK ============ */}
        <div className="order-2 space-y-4 lg:order-1 lg:col-span-5 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1">
          {/* STEP 1 — 1-CLICK INFOGRAPHIC SCENARIOS & PARAGRAPH-TO-DIAGRAM CONVERTER */}
          <div className={panel}>
            <div className="flex items-center justify-between gap-2">
              <span className={stepTitle}>
                <Sparkles size={14} className="text-[#4058d0]" />
                1 · Quick Infographic Presets &amp; AI Text Parser
              </span>
              <button
                type="button"
                onClick={() => setShowPasteBox((v) => !v)}
                className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-extrabold text-[#4058d0] dark:text-indigo-300"
              >
                {showPasteBox ? "Close Parser" : "⚡ Paste Paragraph"}
              </button>
            </div>

            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Load a Venngage-style infographic preset in 1 click or paste your
              own H2 section text:
            </p>

            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {QUICK_SCENARIO_PRESETS.map((preset) => {
                const isCurr = activeConfig.templateId === preset.templateId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      const spec =
                        BLOG_INFOGRAPHIC_25_TEMPLATES.find(
                          (t) => t.id === preset.templateId
                        ) ?? BLOG_INFOGRAPHIC_25_TEMPLATES[0];
                      handleLoadFullSample(spec);
                    }}
                    className={`flex items-center justify-between rounded-xl border px-2.5 py-1.5 text-left text-[11px] font-extrabold transition ${
                      isCurr
                        ? "border-[#4058d0] bg-[#4058d0]/15 text-[#4058d0] dark:text-indigo-200"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#4058d0]/50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                    }`}
                  >
                    <span className="truncate">{preset.label}</span>
                    <span className="ml-1 shrink-0 rounded bg-slate-900/10 px-1.5 py-0.5 text-[9px] font-black dark:bg-white/10">
                      {preset.badge.split(" ")[1]}
                    </span>
                  </button>
                );
              })}
            </div>

            {showPasteBox && (
              <div className="mt-2.5 space-y-2 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-2.5">
                <textarea
                  rows={3}
                  value={rawPasteText}
                  onChange={(e) => setRawPasteText(e.target.value)}
                  placeholder="Paste any blog H2 paragraph, bullet points, or statistics here to auto-generate diagram nodes..."
                  className={field}
                />
                <button
                  type="button"
                  onClick={() => {
                    const parsed = parseParagraphIntoNodes(rawPasteText);
                    if (parsed.length >= 2) {
                      const rec = autoRecommendInfographicTemplate(
                        activeConfig.headline,
                        rawPasteText
                      );
                      updateActiveConfig((curr) => ({
                        ...curr,
                        templateId: rec.templateId,
                        templateSlug: rec.templateSlug,
                        templateName: rec.templateName,
                        nodes: parsed,
                      }));
                      setShowPasteBox(false);
                      notify(
                        `Generated ${parsed.length} infographic nodes & matched Layout #${rec.templateId}!`
                      );
                    } else {
                      notify("Paste at least 2 sentences or bullet points.");
                    }
                  }}
                  className="w-full rounded-lg bg-[#4058d0] px-3 py-1.5 text-[11px] font-extrabold text-white hover:bg-[#3449b8]"
                >
                  Convert Paragraph into Infographic Diagram
                </button>
              </div>
            )}
          </div>

          {/* STEP 2 — BRAND LOGO, AI ART PLATE BACKDROP & VISUAL DENSITY */}
          <div className={`${panel} space-y-3`}>
            <div className="flex items-center justify-between gap-2">
              <span className={stepTitle}>
                <ImagePlus size={14} className="text-[#4058d0]" />
                2 · Brand Logo, AI Art Plate &amp; Spacing
              </span>
              {(uploadedLogo || customBackdropImg) && (
                <button
                  type="button"
                  onClick={() => {
                    setUploadedLogo(null);
                    setUploadedLogoName("");
                    setCustomBackdropImg(null);
                    setCustomBackdropName("");
                    setLogoScale(1);
                    setLogoBgStyle("auto");
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:underline"
                >
                  <RotateCcw size={10} /> Reset Assets
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
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
                      : "Upload Brand Logo"}
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
                  onClick={() => backdropInputRef.current?.click()}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 transition hover:border-[#4058d0] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <ImagePlus size={13} className="text-[#4058d0]" />
                  <span className="truncate">
                    {customBackdropName
                      ? `${customBackdropName.slice(0, 13)}…`
                      : "Custom Art Plate"}
                  </span>
                </button>
                {customBackdropName && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomBackdropImg(null);
                      setCustomBackdropName("");
                    }}
                    className="mt-1 flex w-full items-center justify-center gap-1 text-[10px] font-bold text-slate-500 hover:text-rose-500"
                  >
                    <X size={10} /> Use Built-In Plate
                  </button>
                )}
                <input
                  ref={backdropInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleCustomBackdropUpload}
                  className="sr-only"
                />
              </div>
            </div>

            {/* Backdrop Visual Style Selector */}
            <div className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-950">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Infographic Visual Backdrop Engine
              </span>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                {BACKDROP_STYLE_OPTIONS.map((bOpt) => {
                  const isSel =
                    (activeConfig.backdropStyle ?? "ai-art-plate") === bOpt.id;
                  return (
                    <button
                      key={bOpt.id}
                      type="button"
                      onClick={() =>
                        updateActiveConfig({ backdropStyle: bOpt.id })
                      }
                      title={bOpt.desc}
                      className={`rounded-lg border px-2 py-1.5 text-[10px] font-extrabold transition ${
                        isSel
                          ? "border-[#4058d0] bg-[#4058d0] text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                      }`}
                    >
                      {bOpt.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={showVectorIcons}
                    onChange={(e) => setShowVectorIcons(e.target.checked)}
                    className="accent-[#4058d0]"
                  />
                  <span>Show Vector Icon Medallions</span>
                </label>

                <div className="flex items-center gap-1">
                  {(["compact", "balanced", "spacious"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSpacingDensity(d)}
                      className={`rounded px-2 py-0.5 text-[10px] font-bold capitalize ${
                        spacingDensity === d
                          ? "bg-[#4058d0] text-white"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Logo Scale & Container Badge Style */}
            <div className="space-y-1.5 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Logo / Brand Watermark Scale &amp; Style
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

          {/* STEP 3 — H2 HEADLINE, SUBHEADLINE, ALT TEXT & FOOTER */}
          <div className={`${panel} space-y-2.5`}>
            <span className={stepTitle}>
              <Type size={14} className="text-[#4058d0]" />3 · H2 Headline,
              Subtitle &amp; Brand Domain
            </span>

            <div>
              <label className={label}>Infographic H2 Headline</label>
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
                <label className={label}>Brand / Domain Watermark</label>
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

          {/* STEP 4 — INTERACTIVE DIAGRAM NODES, KPI PILLS & VECTOR ICONS (2..8) */}
          <div className={`${panel} space-y-2.5`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={stepTitle}>
                <Layers size={14} className="text-[#4058d0]" />4 · Infographic
                Nodes &amp; Icons ({activeConfig.nodes.length}/8)
              </span>
              <button
                type="button"
                onClick={handleAddNode}
                disabled={activeConfig.nodes.length >= 8}
                className="inline-flex items-center gap-1 rounded-lg bg-[#4058d0] px-2.5 py-1 text-[10px] font-extrabold text-white disabled:opacity-40"
              >
                <Plus size={11} /> Add Node
              </button>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {activeConfig.nodes.map((node, idx) => (
                <div
                  key={node.id}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <input
                        type="text"
                        value={node.badge}
                        onChange={(e) =>
                          handleUpdateNode(node.id, { badge: e.target.value })
                        }
                        aria-label={`Node ${idx + 1} badge`}
                        className="w-16 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 font-mono text-[11px] font-extrabold text-[#4058d0] dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-300"
                      />
                      <input
                        type="text"
                        value={node.metricValue || ""}
                        onChange={(e) =>
                          handleUpdateNode(node.id, {
                            metricValue: e.target.value,
                          })
                        }
                        placeholder="KPI / Stat"
                        className="w-24 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-bold text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-400"
                      />
                      <select
                        value={node.iconId || "auto"}
                        onChange={(e) =>
                          handleUpdateNode(node.id, {
                            iconId: e.target.value as InfographicIconId,
                          })
                        }
                        aria-label={`Node ${idx + 1} icon`}
                        className="rounded-lg border border-slate-300 bg-slate-50 px-1.5 py-1 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {INFOGRAPHIC_ICON_OPTIONS.map((ic) => (
                          <option key={ic.id} value={ic.id}>
                            {ic.label}
                          </option>
                        ))}
                      </select>
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

          {/* STEP 5 — 8 BRAND PALETTES, HEX WHEEL & 4 ASPECT RATIOS */}
          <div className={`${panel} space-y-2.5`}>
            <div className="flex items-center justify-between">
              <span className={stepTitle}>
                <Palette size={14} className="text-[#4058d0]" />5 · Color
                Palette, Hex &amp; Poster Ratio
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

            <div className="flex flex-wrap gap-1.5">
              {Object.values(BLOG_INFOGRAPHIC_PALETTES).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    updateActiveConfig({ paletteId: p.id });
                    setCustomColors({});
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold transition ${
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
                  {p.label.split(" (")[0]}
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

        {/* ============ RIGHT COLUMN: LIVE HD CANVAS + 25 VENNGAGE-STYLE TEMPLATE PREVIEWS ============ */}
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
                    Section Visual {idx + 1} (#{c.templateId})
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={cards.length >= 8}
                  onClick={() => {
                    const nextId = ((cards.length * 4) % 25) + 1;
                    const created = createSampleInfographicConfig(nextId);
                    created.id = `visual-${Date.now().toString(36)}`;
                    setCards((prev) => [...prev, created]);
                    setActiveIdx(cards.length);
                  }}
                  className="inline-flex items-center gap-0.5 rounded-lg bg-[#4058d0] px-2.5 py-1 text-[11px] font-bold text-white disabled:opacity-40"
                >
                  <Plus size={12} /> Add Section Infographic
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
                Layout #{activeConfig.templateId} · {activeConfig.templateName}{" "}
                · {activeConfig.aspectRatio}
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
                    setZoomLevel((z) =>
                      Math.max(0.6, Number((z - 0.1).toFixed(2)))
                    )
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
                    setZoomLevel((z) =>
                      Math.min(1.3, Number((z + 0.1).toFixed(2)))
                    )
                  }
                  className="rounded bg-white/10 p-1 hover:bg-white/20"
                  aria-label="Zoom in"
                >
                  <ZoomIn size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* 25 VENNGAGE-STYLE TEMPLATE PREVIEWS GALLERY */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  25 Venngage &amp; Canva-Style Infographic Templates
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Click <strong>&quot;Use Layout&quot;</strong> to apply the
                  geometry to your current text, or{" "}
                  <strong>&quot;Load Sample&quot;</strong> to load that
                  template&apos;s curated design &amp; data.
                </p>
              </div>

              {/* Showcase Mode vs My Active Text Toggle */}
              <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() => setShowcaseMode(true)}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-extrabold transition ${
                    showcaseMode
                      ? "bg-[#4058d0] text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <Sparkles size={11} /> Curated Designs
                </button>
                <button
                  type="button"
                  onClick={() => setShowcaseMode(false)}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-extrabold transition ${
                    !showcaseMode
                      ? "bg-[#4058d0] text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <Eye size={11} /> My Active Text
                </button>
              </div>
            </div>

            {/* Family Filter Tabs */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {FAMILY_FILTERS.map((fam) => (
                <button
                  key={fam}
                  type="button"
                  onClick={() => setFamilyFilter(fam)}
                  className={`rounded-full px-3 py-1 text-[10px] font-extrabold transition ${
                    familyFilter === fam
                      ? "bg-[#4058d0] text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-[#4058d0]/40 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  }`}
                >
                  {fam}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTemplates.map((spec) => (
                <InfographicTemplateThumb
                  key={spec.id}
                  spec={spec}
                  baseConfig={activeConfig}
                  renderOptions={renderOptions}
                  showcaseMode={showcaseMode}
                  plateVersion={plateVersion}
                  active={activeConfig.templateId === spec.id}
                  onApplyLayoutOnly={() => handleApplyLayoutOnly(spec)}
                  onLoadFullSample={() => handleLoadFullSample(spec)}
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

"use client";

import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import JSZip from "jszip";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  Download,
  FileCode2,
  Layers,
  Loader2,
  Palette,
  Plus,
  Redo2,
  Sparkles,
  Trash2,
  Undo2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  InfographicDepthControls,
  InfographicProceduralStyleControls,
  InfographicSignatureControls,
} from "./InfographicDesignControls";
import { IconPickerGrid } from "./IconPickerGrid";
import {
  InteractiveInfographicCanvas,
  type CanvasSelection,
} from "./InteractiveInfographicCanvas";
import {
  getInfographicDimensions,
  lockInfographicGeometry,
} from "@/lib/blog-infographic-studio/layout-registry";
import { PRISM_LAYOUT_THEMES } from "@/lib/blog-infographic-studio/samples";
import {
  brandColors,
  brandSectionVariantColors,
  extractHeadlineHighlightPhrases,
  normalizeSignature,
} from "@/lib/blog-infographic-studio/appearance";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";
import type { UniversalExtractResponse } from "@/app/api/ai-tools/universal-extract/route";
import { printCanvasAsPdfPoster } from "@/features/tool-ui/visualCardExport";
import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
  BlogSectionNode,
} from "@/lib/blog-writer/canonical-state";
import {
  PRISM_LAYOUTS,
  PRISM_LAYOUT_CATEGORIES,
  buildAllArticleSectionVisuals,
  buildSectionConceptAlternatives,
  buildSectionVisual,
  createPrismSample,
  recommendPrismLayout,
  sectionFromText,
  shuffleInfographicVisualVariation,
  visualFromWriterSection,
  withPrismLayout,
} from "@/lib/blog-infographic-studio/visual-brief";
import {
  classifySectionArchetype,
  synthesizeInfographicHeadlineAndSubheadline,
} from "@/lib/blog-infographic-studio/skills/topic-intelligence";
import { runInfographicQaCritic } from "@/lib/blog-infographic-studio/skills/visual-qa-critic";
import type {
  PrismLayout,
  PrismLayoutCategory,
} from "@/lib/blog-infographic-studio/visual-brief";
import { autoRecommendInfographicTemplate } from "@/lib/blog-writer/deterministic-analyzers";
import { BLOG_INFOGRAPHIC_25_TEMPLATES } from "@/lib/blog-infographic-studio/templates";
import {
  BLOG_INFOGRAPHIC_PALETTES,
  buildInfographicScene,
  createSampleInfographicConfig,
  generateBlogInfographicSvg,
  renderBlogInfographicToCanvas,
} from "@/lib/blog-infographic-studio/canvas-renderer";
import {
  importInfographicProject,
  patchInfographic,
  selectInfographicTemplate,
} from "@/lib/blog-infographic-studio/project";

export interface BlogInfographicStudioProps {
  mode?: "standalone" | "embedded-modal";
  initialConfig?: BlogInfographicConfig;
  sourceSection?: BlogSectionNode;
  onSaveConfig?: (updated: BlogInfographicConfig) => void;
  onClose?: () => void;
}
const field =
  "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const button =
  "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";
const primary =
  button +
  " !border-indigo-600 !bg-indigo-600 !text-white hover:!bg-indigo-500";
const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const svgSource = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const familyLabels = [
  "All layouts",
  "Process",
  "Comparison",
  "Data",
  "Framework",
  "Checklist",
  "Cover",
];
function saveFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]!,
  );
}

function PrismTemplateCard({
  config,
  layout,
  onSelect,
}: {
  config: BlogInfographicConfig;
  layout: PrismLayout;
  onSelect: () => void;
}) {
  const spec = PRISM_LAYOUTS.find((l) => l.id === layout)!;
  const selected =
    config.visualEngine === "prism-antv" && config.prismLayout === layout;
  const hasCustomColors = Boolean(
    Object.keys(config.brand?.customColors || {}).length,
  );
  const cardPalette = selected
    ? config.paletteId
    : PRISM_LAYOUT_THEMES[layout] || config.paletteId;
  const scene = useMemo(() => {
    const previewNodes =
      layout === "comparison" &&
      config.nodes.length > 2 &&
      config.nodes.length % 2 !== 0
        ? config.nodes.slice(0, config.nodes.length - 1)
        : config.nodes;
    return buildInfographicScene(
      withPrismLayout(
        {
          ...config,
          paletteId: hasCustomColors ? config.paletteId : cardPalette,
          nodes: previewNodes,
        },
        layout,
      ),
    );
  }, [config, layout, hasCustomColors, cardPalette]);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`overflow-hidden rounded-xl border-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${selected ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-transparent bg-slate-100 hover:border-indigo-300 dark:bg-slate-800"}`}
    >
      <div className="flex h-64 items-center justify-center overflow-hidden bg-slate-200/60 p-3 dark:bg-slate-950/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={svgSource(scene.svg)}
          alt={`${spec.name} with your current text`}
          loading="lazy"
          className="h-full w-full object-contain"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-1.5">
          <span className="truncate text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
            {spec.category}
          </span>
          <span className="shrink-0 rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {spec.ratio}
          </span>
        </div>
        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
          {selected ? "✓ " : ""}
          {spec.name}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-300">
          {spec.description}
        </p>
        {scene.issues.length > 0 && (
          <p className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
            Check content fit for this layout
          </p>
        )}
      </div>
    </button>
  );
}
function TemplateCard({
  config,
  id,
  selected,
  onSelect,
}: {
  config: BlogInfographicConfig;
  id: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = BLOG_INFOGRAPHIC_25_TEMPLATES[id - 1];
  const src = useMemo(
    () =>
      svgSource(
        generateBlogInfographicSvg(selectInfographicTemplate(config, id)),
      ),
    [config, id],
  );
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`group overflow-hidden rounded-2xl border-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${selected ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-transparent bg-slate-100 hover:border-indigo-300 dark:bg-slate-800/50"}`}
    >
      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-slate-200/70 p-4 dark:bg-slate-900/80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${t.name} layout with your content`}
          loading="lazy"
          className="max-h-full max-w-full rounded-sm object-contain shadow-lg transition duration-300 group-hover:scale-[1.03]"
        />
        {selected && (
          <span className="absolute right-2 top-2 rounded-full bg-indigo-600 p-1.5 text-white">
            <Check size={13} />
          </span>
        )}
      </div>
      <div className="p-3.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
          {familyLabels[familyIndex(id)]} · {String(id).padStart(2, "0")}
        </span>
        <h4 className="mt-1 text-sm font-bold leading-snug text-slate-900 dark:text-white">
          {t.name}
        </h4>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {t.bestForSectionType}
        </p>
      </div>
    </button>
  );
}
function familyIndex(id: number) {
  return id <= 5
    ? 1
    : id <= 10
      ? 2
      : id <= 15
        ? 3
        : id <= 19
          ? 4
          : id <= 24
            ? 5
            : 6;
}

export function BlogInfographicStudio({
  mode = "standalone",
  initialConfig,
  sourceSection,
  onSaveConfig,
  onClose,
}: BlogInfographicStudioProps) {
  const [cards, setCards] = useState<BlogInfographicConfig[]>(() => [
    lockInfographicGeometry(initialConfig || createPrismSample()),
  ]);
  const [activeIdx, setActiveIdx] = useState(0),
    [panel, setPanel] = useState<"content" | "design">("content"),
    [prismCategory, setPrismCategory] = useState<PrismLayoutCategory | "all">(
      "all",
    ),
    [family, setFamily] = useState(0),
    [query, setQuery] = useState("");
  const [paste, setPaste] = useState(""),
    [toast, setToast] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [zoom, setZoom] = useState(1);
  const [classicOpen, setClassicOpen] = useState(false);
  const [openNodeIdx, setOpenNodeIdx] = useState<number>(0);
  const [openIconPickerNodeId, setOpenIconPickerNodeId] = useState<string | null>(
    null,
  );
  const [canvasSelection, setCanvasSelection] = useState<CanvasSelection>({
    kind: "none",
  });
  const [extractedArticle, setExtractedArticle] =
    useState<UniversalExtractResponse | null>(null);
  const lastExtractedUrlRef = useRef<string>("");
  const [past, setPast] = useState<BlogInfographicConfig[][]>([]),
    [future, setFuture] = useState<BlogInfographicConfig[][]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const active = cards[Math.min(activeIdx, cards.length - 1)];
  const deferred = useDeferredValue(active);
  const scene = useMemo(() => buildInfographicScene(deferred), [deferred]);
  const dimensions = getInfographicDimensions(active);
  const spec = BLOG_INFOGRAPHIC_25_TEMPLATES.find(
    (t) => t.id === active.templateId,
  )!;
  const templates = BLOG_INFOGRAPHIC_25_TEMPLATES.filter(
    (t) =>
      (!family || familyIndex(t.id) === family) &&
      `${t.name} ${t.bestForSectionType}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const notify = (s: string) => {
    setToast(s);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4500);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useEffect(() => {
    if (initialConfig) {
      setCards([lockInfographicGeometry(initialConfig)]);
      setActiveIdx(0);
      setPast([]);
      setFuture([]);
    }
  }, [initialConfig]);
  function commit(next: BlogInfographicConfig[]) {
    setPast((p) => [...p.slice(-29), cards]);
    setFuture([]);
    setCards(next);
    setError("");
  }
  function update(patch: Partial<BlogInfographicConfig>) {
    commit(
      cards.map((c, i) => (i === activeIdx ? patchInfographic(c, patch) : c)),
    );
  }
  function updateBrand(
    patch: Partial<NonNullable<BlogInfographicConfig["brand"]>>,
  ) {
    update({ brand: { ...active.brand, ...patch } });
  }
  function choose(id: number) {
    update(selectInfographicTemplate(active, id));
  }
  useEffect(() => {
    const handler = (event: Event) => {
      const d = (event as CustomEvent<{ templateId: number }>).detail;
      if (!BLOG_INFOGRAPHIC_25_TEMPLATES.some((t) => t.id === d?.templateId))
        return;
      setCards((prev) =>
        prev.map((c, i) =>
          i === activeIdx ? selectInfographicTemplate(c, d.templateId) : c,
        ),
      );
      setPanel("design");
    };
    window.addEventListener("select-blog-infographic-template", handler);
    return () =>
      window.removeEventListener("select-blog-infographic-template", handler);
  }, [activeIdx]);
  function undo() {
    if (!past.length) return;
    setFuture((f) => [cards, ...f]);
    setCards(past[past.length - 1]);
    setPast((p) => p.slice(0, -1));
    setActiveIdx(0);
  }
  function redo() {
    if (!future.length) return;
    setPast((p) => [...p, cards]);
    setCards(future[0]);
    setFuture((f) => f.slice(1));
    setActiveIdx(0);
  }
  function updateNode(id: string, patch: Partial<BlogInfographicNodeItem>) {
    update({
      nodes: active.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    });
  }
  function moveNode(index: number, delta: number) {
    const nodes = [...active.nodes],
      target = index + delta;
    if (target < 0 || target >= nodes.length) return;
    [nodes[index], nodes[target]] = [nodes[target], nodes[index]];
    update({ nodes });
  }
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "This action failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function freshCanvas(config = active) {
    const canvas = document.createElement("canvas");
    await renderBlogInfographicToCanvas(canvas, config);
    return canvas;
  }
  const filename = `${active.templateSlug}-${active.aspectRatio.replace(":", "x")}`;
  async function exportImage(type: "png" | "webp") {
    await run(async () => {
      const canvas = await freshCanvas();
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Image export failed."))),
          `image/${type}`,
          0.94,
        ),
      );
      saveFile(blob, `${filename}.${type}`);
      notify(
        `Downloaded ${dimensions.width} × ${dimensions.height} ${type.toUpperCase()}.`,
      );
    });
  }
  async function copyImage() {
    await run(async () => {
      if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined")
        throw new Error(
          "Image copy is unavailable here. Use Download PNG instead.",
        );
      const canvas = await freshCanvas();
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Image copy failed."))),
          "image/png",
        ),
      );
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      notify("Image copied.");
    });
  }
  async function exportZip() {
    await run(async () => {
      const zip = new JSZip();
      for (const [i, card] of cards.entries()) {
        const stem = `section-${i + 1}-${card.templateSlug}`,
          canvas = await freshCanvas(card);
        zip.file(`${stem}.svg`, generateBlogInfographicSvg(card));
        zip.file(`${stem}.png`, canvas.toDataURL("image/png").split(",")[1], {
          base64: true,
        });
      }
      zip.file(
        "editable-project.json",
        JSON.stringify({ version: 1, cards }, null, 2),
      );
      saveFile(
        await zip.generateAsync({ type: "blob" }),
        "blog-infographics.zip",
      );
      notify("Downloaded images and editable project.");
    });
  }
  async function exportMultiPagePdfDeck() {
    await run(async () => {
      const pagesHtml: string[] = [];
      for (const card of cards) {
        const svg = generateBlogInfographicSvg(card);
        const dims = getInfographicDimensions(card);
        const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        pagesHtml.push(
          `<div class="deck-page" style="width:${dims.width}px;height:${dims.height}px;page-break-after:always;break-after:page;display:flex;align-items:center;justify-content:center;overflow:hidden;margin:0 auto;"><img src="${dataUri}" alt="${escapeHtml(card.altText || card.headline)}" style="width:100%;height:100%;object-fit:contain;display:block;" /></div>`,
        );
      }
      const win = window.open("", "_blank", "width=1100,height=900");
      if (!win) {
        throw new Error(
          "Pop-up blocked. Allow pop-ups to print or save the multi-page PDF deck.",
        );
      }
      const firstDims = getInfographicDimensions(cards[0]);
      win.document.write(
        `<!doctype html><html><head><title>${escapeHtml(cards[0]?.headline || "Infographic Deck")} — Visual Deck (${cards.length} Sections)</title><style>@page{size:${firstDims.width}px ${firstDims.height}px;margin:0;}*{box-sizing:border-box;margin:0;padding:0;}body{background:#0f172a;color:#fff;font-family:system-ui,sans-serif;}@media screen{.toolbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:12px 24px;background:#0f172aee;border-bottom:1px solid #334155;backdrop-filter:blur(8px);}.toolbar button{background:#4f46e5;color:#fff;border:0;padding:8px 18px;border-radius:8px;font-weight:700;cursor:pointer;}.deck-page{margin:24px auto;box-shadow:0 20px 50px rgba(0,0,0,.5);border-radius:12px;max-width:92vw;height:auto!important;}}@media print{.toolbar{display:none!important;}body{background:#fff;}}</style></head><body><div class="toolbar"><span><strong>${cards.length}-Section Infographic Deck</strong> · Choose "Save as PDF" in the print dialog</span><button onclick="window.print()">Save as PDF / Print</button></div>${pagesHtml.join("")}<script>window.onload=function(){setTimeout(function(){window.print();},350);};</script></body></html>`,
      );
      win.document.close();
      notify(
        `Opened ${cards.length}-page PDF deck. Choose "Save as PDF" in your print dialog.`,
      );
    });
  }
  async function saveToWriter() {
    await run(async () => {
      const canvas = await freshCanvas();
      onSaveConfig?.({
        ...active,
        sectionId: initialConfig?.sectionId || active.sectionId,
        id: initialConfig?.id || active.id,
        renderedPngDataUrl: canvas.toDataURL("image/png"),
        renderedSvgMarkup: generateBlogInfographicSvg(active),
      });
      onClose?.();
    });
  }
  async function uploadLogo(file?: File) {
    if (!file) return;
    await run(async () => {
      if (
        file.size > 2_000_000 ||
        !["image/png", "image/jpeg", "image/webp"].includes(file.type)
      )
        throw new Error("Choose a PNG, JPG or WebP logo under 2 MB.");
      const src = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(new Error("The logo could not be read."));
        r.readAsDataURL(file);
      });
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () =>
          reject(new Error("This image could not be opened."));
        image.src = src;
      });
      const canvas = document.createElement("canvas"),
        scale = Math.min(1, 640 / Math.max(image.width, image.height));
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas
        .getContext("2d")!
        .drawImage(image, 0, 0, canvas.width, canvas.height);
      updateBrand({
        logoDataUrl: canvas.toDataURL("image/png"),
        logoStyle: "plain",
      });
      notify("Logo added. It will travel with your saved infographic.");
    });
  }
  async function uploadNodeCustomIcon(nodeId: string, file?: File) {
    if (!file) return;
    await run(async () => {
      if (
        file.size > 1_500_000 ||
        !["image/png", "image/jpeg", "image/webp"].includes(file.type)
      )
        throw new Error("Choose a PNG, JPG or WebP icon under 1.5 MB.");
      const src = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(new Error("The icon could not be read."));
        r.readAsDataURL(file);
      });
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () =>
          reject(new Error("This image could not be opened."));
        image.src = src;
      });
      const canvas = document.createElement("canvas"),
        scale = Math.min(1, 160 / Math.max(image.width, image.height));
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas
        .getContext("2d")!
        .drawImage(image, 0, 0, canvas.width, canvas.height);
      updateNode(nodeId, {
        customIconDataUrl: canvas.toDataURL("image/png"),
      });
      notify("Custom card icon added.");
    });
  }
  async function uploadCustomSceneObject(file?: File) {
    if (!file) return;
    await run(async () => {
      if (
        file.size > 2_000_000 ||
        !["image/png", "image/jpeg", "image/webp"].includes(file.type)
      )
        throw new Error(
          "Choose a PNG, JPG or WebP illustration image under 2 MB.",
        );
      const src = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () =>
          reject(new Error("The illustration image could not be read."));
        r.readAsDataURL(file);
      });
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () =>
          reject(new Error("This image could not be opened."));
        image.src = src;
      });
      const canvas = document.createElement("canvas"),
        scale = Math.min(1, 360 / Math.max(image.width, image.height));
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas
        .getContext("2d")!
        .drawImage(image, 0, 0, canvas.width, canvas.height);
      update({
        customSceneImageUrl: canvas.toDataURL("image/png"),
      });
      notify(
        "Custom illustration object uploaded and placed in the infographic header.",
      );
    });
  }
  function addSection() {
    if (cards.length >= 12) return;
    const card = {
      ...createPrismSample(),
      paletteId: active.paletteId,
      id: uid(),
      sectionId: uid(),
      headline: "Your next section",
      subheadline: "Paste the section body to create its visual summary.",
      nodes: [],
      visualBrief: undefined,
      footerSourceLabel: "Source: supplied section text",
      altText: "",
      brand: { ...active.brand },
      depth: active.depth,
      signature: active.signature,
      backgroundPattern: active.backgroundPattern,
      cardStyle: active.cardStyle,
      fontFamily: active.fontFamily,
      extractedBrand: active.extractedBrand,
    };
    commit([...cards, card]);
    setActiveIdx(cards.length);
  }
  function pastePoints() {
    if (
      paste.length > 90000 ||
      paste.split(/\n+/).filter((s) => s.trim()).length > 1200
    ) {
      setError(
        "This section exceeds the source limit (90,000 characters or 1,200 blocks). Split it into smaller sections before creating a visual.",
      );
      return;
    }
    const headline =
      paste.match(/^#{1,2}\s+([^\n]+)/m)?.[1]?.trim() || active.headline;
    const result = buildSectionVisual(
      sectionFromText(headline, paste, active.sectionId),
    );
    if (result.nodes.length < 2) {
      setError(
        "Paste at least two explanatory points, not just headings. Include the section body.",
      );
      return;
    }
    update(
      runInfographicQaCritic({
        ...withPrismLayout(
          active,
          recommendPrismLayout(result.brief, result.nodes.length),
        ),
        headline,
        subheadline: "",
        highlightWords: extractHeadlineHighlightPhrases(headline).join(", "),
        nodes: result.nodes,
        visualBrief: result.brief,
        altText: `${headline}: ${result.nodes.map((n) => n.title).join("; ")}`,
        footerSourceLabel: active.footerSourceLabel.includes(
          "Illustrative framework",
        )
          ? "Source: supplied section text"
          : active.footerSourceLabel,
      }),
    );
    notify(
      "Created a source-based draft. Check the explanations and source coverage before exporting.",
    );
  }
  return (
    <section
      id="tool-studio-workspace"
      aria-label="Blog infographic studio"
      className={
        mode === "standalone"
          ? "mx-auto max-w-[1440px] px-4 py-10 sm:px-6"
          : "rounded-3xl bg-white p-4 text-slate-900 dark:bg-slate-950 dark:text-white sm:p-6"
      }
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-indigo-600 dark:text-indigo-300">
            <Layers size={15} /> The visual editor
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Make the idea easy to see.
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Shape your content, choose a layout, and make it yours.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            className={button + " lg:hidden"}
            href={`#${mode}-infographic-preview`}
          >
            See preview
          </a>
          <button
            type="button"
            className={button}
            onClick={undo}
            disabled={!past.length || busy}
            title="Undo"
          >
            <Undo2 size={15} />
            Undo
          </button>
          <button
            type="button"
            className={button}
            onClick={redo}
            disabled={!future.length || busy}
            title="Redo"
          >
            <Redo2 size={15} />
            Redo
          </button>
          {mode === "embedded-modal" && (
            <>
              <button
                type="button"
                className={primary}
                onClick={saveToWriter}
                disabled={busy}
              >
                <Check size={15} />
                Save to section
              </button>
              <button
                type="button"
                className={button}
                onClick={onClose}
                aria-label="Close infographic editor"
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>
      </div>
      {mode === "standalone" && (
        <details
          open
          className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <summary className="cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-200">
            Start from an article URL{" "}
            <span className="ml-2 text-xs font-normal text-slate-500">
              or edit the example below
            </span>
          </summary>
          <div className="mt-4">
            <UrlArticleExtractorBar
              extractionPurpose="infographic"
              label="Create from an article section"
              buttonLabel="Read article sections"
              onExtracted={(data) => {
                setExtractedArticle(data);
                const isNewUrl = lastExtractedUrlRef.current !== data.url;
                lastExtractedUrlRef.current = data.url;

                // When extracting a new article URL with multiple sections, automatically generate
                // a unique infographic for every substantive section in the article at once!
                if (isNewUrl && data.sections && data.sections.length >= 2) {
                  const allVisuals = buildAllArticleSectionVisuals(
                    data.sections,
                    {
                      sourceUrl: data.url,
                      domain: data.domain,
                      articleTitle: data.title,
                      coverage: data.coverage,
                      baseConfig: active,
                      brandTheme: data.brandTheme,
                    },
                  );
                  if (allVisuals.length > 0) {
                    const recIdx = Math.max(
                      0,
                      allVisuals.findIndex(
                        (c) =>
                          c.sectionId ===
                          (data.selectedSectionId || data.recommendedSectionId),
                      ),
                    );
                    commit(allVisuals);
                    setActiveIdx(allVisuals[0]?.id === "ai-seo-overview" ? 0 : recIdx);
                    notify(
                      `Generated ${allVisuals.length} unique section infographics across the article with 4 switchable multi-genre concepts per section. Click any section tab or concept pill to customize.`,
                    );
                    return;
                  }
                  setError(
                    "This article has no standalone section with two source-backed points. Select a section or paste more detail.",
                  );
                  return;
                }

                // If user clicked a section chip for an already-generated section tab, switch to that tab
                if (!isNewUrl && data.selectedSectionId) {
                  const existingTabIdx = cards.findIndex(
                    (c) => c.sectionId === data.selectedSectionId,
                  );
                  if (existingTabIdx !== -1 && cards.length > 1) {
                    setActiveIdx(existingTabIdx);
                    notify(
                      `Switched to Section ${existingTabIdx + 1}: ${cards[existingTabIdx].headline}`,
                    );
                    return;
                  }
                }

                const sectionIdx = Math.max(
                  0,
                  data.sections?.findIndex(
                    (s) => s.id === data.selectedSectionId,
                  ) ?? 0,
                );
                const section = data.sections?.find(
                  (s) => s.id === data.selectedSectionId,
                );
                const input =
                  section || sectionFromText(data.title, data.cleanText);
                const intel = classifySectionArchetype(input, data.title);
                const synthesized = synthesizeInfographicHeadlineAndSubheadline(
                  input.title,
                  data.title,
                );
                const result = buildSectionVisual(input, data.url);
                if (result.nodes.length < 2) {
                  setError(
                    result.brief.warnings.join(" ") ||
                      "Choose a section with explanatory text, not just a heading.",
                  );
                  return;
                }
                const domainBadge = (
                  data.brandTheme?.siteName ||
                  data.domain ||
                  "ARTICLE"
                )
                  .slice(0, 28)
                  .toUpperCase();
                const paletteKeys = Object.keys(
                  BLOG_INFOGRAPHIC_PALETTES,
                ) as Array<BlogInfographicConfig["paletteId"]>;
                const chosenPalette =
                  paletteKeys[sectionIdx % paletteKeys.length] ||
                  active.paletteId;
                const topicSignals = `${input.title} ${result.nodes
                  .map((n) => `${n.title} ${n.detail}`)
                  .join(" ")}`;
                const chosenLayout: PrismLayout = intel.isFaq
                  ? "checklist"
                  : recommendPrismLayout(
                      result.brief,
                      result.nodes.length,
                      topicSignals,
                    );
                let next = withPrismLayout(
                  {
                    ...active,
                    id: active.id,
                    sectionId: input.id,
                    paletteId: chosenPalette,
                    headline: synthesized.headline,
                    subheadline: synthesized.subheadline,
                    eyebrowLabel: intel.isFaq
                      ? "FAQ PLAYBOOK · KEY QUESTIONS"
                      : `SECTION PLAYBOOK · ${domainBadge}`,
                    slideCounter: undefined,
                    calloutBadge: undefined,
                    calloutText: undefined,
                    centerLabel: undefined,
                    comparisonLabels: undefined,
                    highlightWords: extractHeadlineHighlightPhrases(
                      synthesized.headline,
                    ).join(", "),
                    nodes: result.nodes,
                    visualBrief: {
                      ...result.brief,
                      articleCoverage: data.coverage,
                    },
                    footerSourceLabel: `Source: ${data.domain}`,
                    altText: `${synthesized.headline}: ${result.nodes.map((n) => n.title).join("; ")}`,
                  },
                  chosenLayout,
                );
                const newArticle = active.visualBrief?.sourceUrl !== data.url;
                if (newArticle && data.brandTheme) {
                  const hint = data.brandTheme;
                  next = {
                    ...next,
                    extractedBrand: hint,
                    signature: {
                      ...normalizeSignature(active.signature),
                      name: hint.siteName || data.domain,
                      showLogo: Boolean(hint.logoDataUrl),
                    },
                    ...(hint.secondaryAccent
                      ? { secondaryAccent: hint.secondaryAccent }
                      : {}),
                    brand: {
                      ...active.brand,
                      logoDataUrl: hint.logoDataUrl,
                      ...(hint.accent
                        ? {
                            customColors: brandSectionVariantColors(
                              hint.accent,
                              hint.secondaryAccent,
                              sectionIdx,
                              hint.isDark ??
                                !BLOG_INFOGRAPHIC_PALETTES[active.paletteId]
                                  .isLight,
                            ),
                          }
                        : {}),
                    },
                  };
                }
                const criticized = runInfographicQaCritic(next, data.title);
                const concepts = buildSectionConceptAlternatives(
                  criticized,
                  data.title,
                );
                update({
                  ...criticized,
                  conceptAlternatives: concepts,
                  activeConceptId: concepts[0]?.id,
                });
                notify(
                  `${result.nodes.length} supported points from the selected section.${data.coverage?.truncated ? " Article exceeded extraction limits; inspect source coverage." : " Review the source text before publishing."}`,
                );
              }}
            />
            {extractedArticle?.sections &&
              extractedArticle.sections.length >= 2 && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-200/80 bg-indigo-50/60 px-3.5 py-2.5 text-xs dark:border-indigo-500/30 dark:bg-indigo-950/30">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    AI Visual Engine:{" "}
                    <strong>{cards.length} section visuals</strong> ready across
                    18 diagram types, brand colors &amp; 4 concepts each.
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={primary}
                      onClick={() => {
                        const suite = buildAllArticleSectionVisuals(
                          extractedArticle.sections!,
                          {
                            sourceUrl: extractedArticle.url,
                            domain: extractedArticle.domain,
                            articleTitle: extractedArticle.title,
                            coverage: extractedArticle.coverage,
                            baseConfig: active,
                            brandTheme: extractedArticle.brandTheme,
                          },
                        );
                        if (!suite.length) {
                          setError(
                            "No substantive sections with 2+ explained points were found.",
                          );
                          return;
                        }
                        commit(suite);
                        setActiveIdx(0);
                        notify(
                          `Generated ${suite.length} unique section infographics across the entire article.`,
                        );
                      }}
                    >
                      <Sparkles size={14} />
                      Generate All Article Sections (
                      {
                        extractedArticle.sections.filter(
                          (s) => s.role === "content",
                        ).length
                      }
                      )
                    </button>
                    <button
                      type="button"
                      className={button}
                      disabled={busy}
                      title="Runs AI only on the currently selected section to save ~85% of API tokens"
                      onClick={() =>
                        void run(async () => {
                          const targetSectionId = active.sectionId;
                          const matchingSection =
                            extractedArticle.sections?.find(
                              (s) => s.id === targetSectionId,
                            );
                          if (!matchingSection) {
                            throw new Error(
                              "Select an extracted article section to run single-section AI polish.",
                            );
                          }
                          const res = await fetch(
                            "/api/ai-tools/infographic-plan",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                sections: [matchingSection],
                                sectionIds: [matchingSection.id],
                                articleTitle: extractedArticle.title,
                                sourceUrl: extractedArticle.url,
                                domain: extractedArticle.domain,
                                baseConfig: active,
                                brandTheme: extractedArticle.brandTheme,
                              }),
                            },
                          );
                          if (!res.ok) {
                            throw new Error(
                              "Single-section AI polish request failed.",
                            );
                          }
                          const planned = (await res.json()) as {
                            visuals?: BlogInfographicConfig[];
                            providerUsed?: string;
                            cached?: boolean;
                          };
                          if (
                            Array.isArray(planned.visuals) &&
                            planned.visuals.length > 0
                          ) {
                            const upgraded = lockInfographicGeometry(
                              planned.visuals[0],
                            );
                            commit(
                              cards.map((c, idx) =>
                                idx === activeIdx ? upgraded : c,
                              ),
                            );
                            notify(
                              `AI polished Section ${activeIdx + 1} (${planned.providerUsed || "verified planner"}${planned.cached ? " · cached, 0 tokens" : " · low-cost single section"}).`,
                            );
                          }
                        })
                      }
                    >
                      <Sparkles size={14} />
                      AI Polish This Section (Low-Cost)
                    </button>
                    <button
                      type="button"
                      className={button}
                      disabled={busy}
                      onClick={() =>
                        void run(async () => {
                          const res = await fetch(
                            "/api/ai-tools/infographic-plan",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                sections: extractedArticle.sections,
                                articleTitle: extractedArticle.title,
                                sourceUrl: extractedArticle.url,
                                domain: extractedArticle.domain,
                                baseConfig: active,
                                brandTheme: extractedArticle.brandTheme,
                              }),
                            },
                          );
                          if (!res.ok) {
                            throw new Error("AI visual planning request failed.");
                          }
                          const planned = (await res.json()) as {
                            visuals?: BlogInfographicConfig[];
                            providerUsed?: string;
                            cached?: boolean;
                          };
                          if (
                            Array.isArray(planned.visuals) &&
                            planned.visuals.length > 0
                          ) {
                            commit(planned.visuals.map(lockInfographicGeometry));
                            setActiveIdx(0);
                            notify(
                              `AI Visual Director (${planned.providerUsed || "verified planner"}${planned.cached ? " · cached, 0 tokens" : ""}) synthesized ${planned.visuals.length} section visuals.`,
                            );
                          }
                        })
                      }
                    >
                      <Sparkles size={14} />
                      AI Re-Synthesize All
                    </button>
                    {cards.length > 1 && (
                      <button
                        type="button"
                        className={button}
                        onClick={() => void exportMultiPagePdfDeck()}
                      >
                        <Download size={14} />
                        Export Multi-Page PDF Deck ({cards.length})
                      </button>
                    )}
                  </div>
                </div>
              )}
          </div>
        </details>
      )}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </div>
      )}
      <div className="grid min-w-0 gap-6 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[370px_minmax(0,1fr)]">
        <aside className="min-w-0 self-start overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-6">
          <div
            className="flex border-b border-slate-200 p-2 dark:border-slate-800"
            role="tablist"
            aria-label="Editor controls"
            onKeyDown={(e) => {
              const tabs = ["content", "design"] as const;
              let next = tabs.indexOf(panel);
              if (e.key === "ArrowRight") next = (next + 1) % 2;
              else if (e.key === "ArrowLeft") next = (next + 1) % 2;
              else if (e.key === "Home") next = 0;
              else if (e.key === "End") next = 1;
              else return;
              e.preventDefault();
              setPanel(tabs[next]);
              document.getElementById(`infographic-tab-${tabs[next]}`)?.focus();
            }}
          >
            {(["content", "design"] as const).map((tab) => (
              <button
                type="button"
                id={`infographic-tab-${tab}`}
                role="tab"
                tabIndex={panel === tab ? 0 : -1}
                aria-selected={panel === tab}
                aria-controls={`infographic-panel-${tab}`}
                key={tab}
                onClick={() => setPanel(tab)}
                className={`flex-1 rounded-lg px-3 py-3 text-sm font-bold capitalize ${panel === tab ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div
            id={`infographic-panel-${panel}`}
            role="tabpanel"
            aria-labelledby={`infographic-tab-${panel}`}
            className="space-y-6 p-4 sm:p-5 lg:max-h-[calc(100vh-190px)] lg:overflow-y-auto"
          >
            {panel === "content" && (
              <>
                {sourceSection && (
                  <button
                    type="button"
                    className={primary + " w-full"}
                    onClick={() => {
                      const result = visualFromWriterSection(sourceSection);
                      if (result.nodes.length < 2) {
                        setError(
                          "Write the section body first. An outline alone cannot provide explanations.",
                        );
                        return;
                      }
                      update(result);
                      notify(
                        "Rebuilt from this writer section’s body. Review the draft before saving.",
                      );
                    }}
                  >
                    Build from this section’s content
                  </button>
                )}
                {active.visualBrief && (
                  <details className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 text-xs dark:border-indigo-500/30 dark:bg-indigo-950/30">
                    <summary className="cursor-pointer font-bold text-indigo-700 dark:text-indigo-300">
                      Source &amp; coverage ·{" "}
                      {
                        new Set(
                          active.nodes.flatMap((n) => n.sourceBlockIds || []),
                        ).size
                      }{" "}
                      cited blocks /{" "}
                      {
                        active.visualBrief.sourceBlocks.filter(
                          (b) => b.kind !== "heading",
                        ).length
                      }{" "}
                      source blocks
                    </summary>
                    <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">
                      This is an extractive draft, not a fact check. Read the
                      source and edit for clarity.{" "}
                      {active.visualBrief.excludedBlocks} unsuitable blocks
                      excluded; {active.visualBrief.omittedPoints} additional
                      points kept in the source below.
                    </p>
                    {active.visualBrief.sourceUrl && (
                      <a
                        className="mt-2 inline-block font-bold text-indigo-600 underline dark:text-indigo-300"
                        href={active.visualBrief.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open source article
                      </a>
                    )}
                    {active.visualBrief.articleCoverage && (
                      <p className="mt-2 text-slate-600 dark:text-slate-300">
                        Article coverage:{" "}
                        {active.visualBrief.articleCoverage.sectionsIncluded}/
                        {active.visualBrief.articleCoverage.sectionsFound}{" "}
                        sections and{" "}
                        {active.visualBrief.articleCoverage.blocksIncluded}/
                        {active.visualBrief.articleCoverage.blocksFound} blocks.
                        {active.visualBrief.articleCoverage.truncated
                          ? " Extraction limit reached. Paste missing section text manually."
                          : ""}
                      </p>
                    )}
                    {active.visualBrief.warnings.map((w, i) => (
                      <p
                        key={i}
                        className="mt-2 text-amber-700 dark:text-amber-300"
                      >
                        {w}
                      </p>
                    ))}
                    <div className="mt-3 max-h-64 space-y-3 overflow-auto">
                      {active.visualBrief.sourceBlocks.map((b) => (
                        <p
                          key={b.id}
                          className="whitespace-pre-wrap leading-relaxed text-slate-600 dark:text-slate-300"
                        >
                          <span className="font-bold">
                            {b.kind === "heading"
                              ? b.text
                              : b.heading
                                ? `${b.heading}: `
                                : ""}
                          </span>
                          {b.kind !== "heading" && b.text}
                        </p>
                      ))}
                    </div>
                  </details>
                )}
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                    Headline
                    <input
                      className={field}
                      value={active.headline}
                      maxLength={180}
                      onChange={(e) => update({ headline: e.target.value })}
                    />
                  </label>
                  {active.visualEngine && (
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                        <span className="flex items-center justify-between">
                          <span>2-Tone headline highlight words</span>
                          <button
                            type="button"
                            onClick={() =>
                              update({
                                highlightWords: extractHeadlineHighlightPhrases(
                                  active.headline,
                                ).join(", "),
                              })
                            }
                            className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            Auto-pick
                          </button>
                        </span>
                        <input
                          className={field}
                          value={active.highlightWords || ""}
                          maxLength={140}
                          placeholder="Comma-separated words to accent (e.g. AI SEO, Citations)"
                          onChange={(e) =>
                            update({ highlightWords: e.target.value })
                          }
                        />
                      </label>
                      <div className="grid grid-cols-[1fr_92px] gap-2">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Eyebrow badge (optional)
                          <input
                            className={field}
                            value={active.eyebrowLabel || ""}
                            maxLength={64}
                            placeholder="e.g. SECTION 01 · PLAYBOOK"
                            onChange={(e) =>
                              update({ eyebrowLabel: e.target.value })
                            }
                          />
                        </label>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Counter
                          <input
                            className={field}
                            value={active.slideCounter || ""}
                            maxLength={16}
                            placeholder="01 / 05"
                            onChange={(e) =>
                              update({ slideCounter: e.target.value })
                            }
                          />
                        </label>
                      </div>
                    </div>
                  )}
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                    Short explanation (subtitle)
                    <textarea
                      className={field}
                      rows={2}
                      value={active.subheadline}
                      maxLength={240}
                      onChange={(e) => update({ subheadline: e.target.value })}
                    />
                  </label>
                </div>
                <details className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 dark:border-indigo-500/30 dark:bg-indigo-950/30">
                  <summary className="cursor-pointer text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    Create from section text
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Paste paragraphs or lists, including their explanations.
                    Subheadings help identify the main concepts. No facts or
                    statistics are invented.
                  </p>
                  <textarea
                    aria-label="Section text for infographic"
                    className={field}
                    rows={5}
                    value={paste}
                    onChange={(e) => setPaste(e.target.value)}
                    placeholder="Paste a section or one point per line…"
                  />
                  <button
                    type="button"
                    onClick={pastePoints}
                    className={primary + " mt-2 w-full"}
                  >
                    <Sparkles size={14} />
                    Use this text
                  </button>
                </details>
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Your points{" "}
                      <span className="text-slate-400">
                        {active.nodes.length}/{active.visualEngine ? 6 : 8}
                      </span>
                    </h3>
                    <button
                      type="button"
                      className={button}
                      disabled={
                        active.nodes.length >= (active.visualEngine ? 6 : 8)
                      }
                      onClick={() =>
                        update({
                          nodes: [
                            ...active.nodes,
                            {
                              id: uid(),
                              badge: String(active.nodes.length + 1).padStart(
                                2,
                                "0",
                              ),
                              title: "New point",
                              detail:
                                "Explain the idea in one short sentence.",
                              metricValue: "",
                            },
                          ],
                        })
                      }
                    >
                      <Plus size={14} />
                      Add
                    </button>
                  </div>
                  <p className="mb-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {active.visualEngine
                      ? "Give each concept a short title and a complete explanation. Icons follow the topic; no statistics are added."
                      : "For comparison layouts, points alternate between columns. Charts use only the figures you enter."}
                  </p>
                  <div className="space-y-3">
                    {active.nodes.map((n, i) => (
                      <details
                        key={n.id}
                        open={i === openNodeIdx}
                        onToggle={(e) => {
                          if (e.currentTarget.open) setOpenNodeIdx(i);
                        }}
                        className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                      >
                        <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-[10px] text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                            {i + 1}
                          </span>
                          <span className="min-w-0 flex-1 truncate">
                            {n.title || "Untitled point"}
                          </span>
                          <ChevronDown size={13} />
                        </summary>
                        <div className="mt-3 space-y-3">
                          {active.visualEngine && (
                            <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 dark:border-slate-700/80 dark:bg-slate-900/60">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  aria-pressed={openIconPickerNodeId === n.id}
                                  onClick={() =>
                                    setOpenIconPickerNodeId((prev) =>
                                      prev === n.id ? null : n.id,
                                    )
                                  }
                                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
                                    openIconPickerNodeId === n.id
                                      ? "border-indigo-600 bg-indigo-600 text-white"
                                      : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                  }`}
                                >
                                  <Sparkles size={12} />
                                  {n.icon
                                    ? `Icon: ${n.icon} (80)`
                                    : "Choose Icon (80)"}
                                </button>
                                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-bold text-indigo-700 transition hover:border-indigo-500 dark:border-indigo-500/40 dark:bg-indigo-950/50 dark:text-indigo-200">
                                  <Upload size={12} />
                                  {n.customIconDataUrl
                                    ? "Replace Image"
                                    : "Upload Image"}
                                  <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="sr-only"
                                    disabled={busy}
                                    onChange={(e) => {
                                      void uploadNodeCustomIcon(
                                        n.id,
                                        e.target.files?.[0],
                                      );
                                      e.target.value = "";
                                    }}
                                  />
                                </label>
                                <label
                                  className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400"
                                  title="Custom card accent color"
                                >
                                  <input
                                    type="color"
                                    aria-label={`Card ${i + 1} accent color`}
                                    value={
                                      n.accentHex ||
                                      active.brand?.customColors?.accent ||
                                      active.extractedBrand?.accent ||
                                      BLOG_INFOGRAPHIC_PALETTES[active.paletteId]
                                        .accent
                                    }
                                    onChange={(e) =>
                                      updateNode(n.id, {
                                        accentHex: e.target.value,
                                      })
                                    }
                                    className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent"
                                  />
                                </label>
                                {n.accentHex && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateNode(n.id, { accentHex: undefined })
                                    }
                                    className="text-[10px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                                  >
                                    Reset
                                  </button>
                                )}
                              </div>
                              {n.customIconDataUrl && (
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-950">
                                  <div className="flex items-center gap-2">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={n.customIconDataUrl}
                                      alt={`Custom icon for ${n.title}`}
                                      className="h-7 w-7 rounded object-contain"
                                    />
                                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                      Custom card image active
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    aria-label={`Remove custom image for point ${i + 1}`}
                                    onClick={() =>
                                      updateNode(n.id, {
                                        customIconDataUrl: undefined,
                                      })
                                    }
                                    className="rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              )}
                              {openIconPickerNodeId === n.id && (
                                <IconPickerGrid
                                  value={n.icon}
                                  customIconDataUrl={n.customIconDataUrl}
                                  accentColor={
                                    n.accentHex ||
                                    active.brand?.customColors?.accent ||
                                    active.extractedBrand?.accent ||
                                    BLOG_INFOGRAPHIC_PALETTES[active.paletteId]
                                      .accent
                                  }
                                  busy={busy}
                                  onSelectIcon={(icon) =>
                                    updateNode(n.id, {
                                      icon,
                                      customIconDataUrl: undefined,
                                    })
                                  }
                                  onUploadCustomIcon={(file) =>
                                    void uploadNodeCustomIcon(n.id, file)
                                  }
                                  onRemoveCustomIcon={() =>
                                    updateNode(n.id, {
                                      customIconDataUrl: undefined,
                                    })
                                  }
                                />
                              )}
                            </div>
                          )}
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Title
                            <input
                              className={field}
                              value={n.title}
                              maxLength={120}
                              onChange={(e) =>
                                updateNode(n.id, { title: e.target.value })
                              }
                            />
                          </label>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Explanation
                            <textarea
                              className={field}
                              rows={3}
                              value={n.detail}
                              maxLength={360}
                              onChange={(e) =>
                                updateNode(n.id, { detail: e.target.value })
                              }
                            />
                          </label>
                          <div className="grid grid-cols-[72px_1fr] gap-2">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              Badge
                              <input
                                className={field}
                                value={n.badge}
                                maxLength={6}
                                onChange={(e) =>
                                  updateNode(n.id, { badge: e.target.value })
                                }
                              />
                            </label>
                            {(!active.visualEngine ||
                              active.prismLayout === "stat-bars" ||
                              active.prismLayout === "donut-breakdown" ||
                              active.prismLayout === "kpi-bento" ||
                              active.prismLayout === "funnel-stages") && (
                              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Verified metric (optional)
                                <input
                                  className={field}
                                  value={n.metricValue || ""}
                                  maxLength={30}
                                  placeholder="e.g. 42% or 3.2x"
                                  onChange={(e) =>
                                    updateNode(n.id, {
                                      metricValue: e.target.value,
                                    })
                                  }
                                />
                              </label>
                            )}
                          </div>
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              className={button}
                              aria-label={`Move point ${i + 1} up`}
                              disabled={i === 0}
                              onClick={() => moveNode(i, -1)}
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              className={button}
                              aria-label={`Move point ${i + 1} down`}
                              disabled={i === active.nodes.length - 1}
                              onClick={() => moveNode(i, 1)}
                            >
                              <ArrowDown size={13} />
                            </button>
                            <button
                              type="button"
                              className={button}
                              aria-label={`Delete point ${i + 1}`}
                              disabled={active.nodes.length <= 1}
                              onClick={() =>
                                update({
                                  nodes: active.nodes.filter(
                                    (x) => x.id !== n.id,
                                  ),
                                })
                              }
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
                {active.visualEngine && (
                  <details className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                    <summary className="cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                      Bottom callout / takeaway bar (optional)
                    </summary>
                    <div className="mt-3 space-y-3">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Callout badge
                        <input
                          className={field}
                          value={active.calloutBadge || ""}
                          maxLength={28}
                          placeholder="KEY TAKEAWAY or FREE TOOL"
                          onChange={(e) =>
                            update({ calloutBadge: e.target.value })
                          }
                        />
                      </label>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Callout text
                        <input
                          className={field}
                          value={active.calloutText || ""}
                          maxLength={140}
                          placeholder="One-line takeaway or tool tip shown above footer"
                          onChange={(e) =>
                            update({ calloutText: e.target.value })
                          }
                        />
                      </label>
                    </div>
                  </details>
                )}
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span className="flex items-center justify-between">
                    <span>Source / footer (optional)</span>
                    {active.footerSourceLabel.trim() && (
                      <button
                        type="button"
                        onClick={() => update({ footerSourceLabel: "" })}
                        className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        Remove source
                      </button>
                    )}
                  </span>
                  <input
                    className={field}
                    value={active.footerSourceLabel}
                    maxLength={180}
                    placeholder="Optional source credit (leave blank to hide)"
                    onChange={(e) =>
                      update({ footerSourceLabel: e.target.value })
                    }
                  />
                  <span className="mt-1 block text-[11px] font-normal text-slate-500">
                    Edit or clear this line anytime. Leave blank to hide the
                    footer source credit.
                  </span>
                </label>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Image description (alt text)
                  <textarea
                    className={field}
                    rows={3}
                    value={active.altText}
                    onChange={(e) => update({ altText: e.target.value })}
                  />
                </label>
              </>
            )}
            {panel === "design" && (
              <>
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-200">
                  <p className="font-bold">
                    Designed to fit · {dimensions.width} × {dimensions.height}
                  </p>
                  <p className="mt-1 leading-relaxed">
                    Each layout has a fixed canvas. Choose another composition
                    in the gallery for a different format.
                  </p>
                  {active.visualEngine && (
                    <button
                      type="button"
                      className={primary + " mt-2.5 w-full"}
                      onClick={() => {
                        update(shuffleInfographicVisualVariation(active, 1));
                        notify(
                          "Shuffled layout, background shader and card style while keeping your text.",
                        );
                      }}
                    >
                      <Sparkles size={14} />
                      Shuffle visual variation
                    </button>
                  )}
                </div>
                {(active.visualEngine
                  ? active.prismLayout === "comparison" ||
                    active.prismLayout === "before-after"
                  : [6, 8, 9, 10, 23].includes(active.templateId)) && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {active.prismLayout === "before-after"
                        ? "Before & After column headings"
                        : "Comparison headings"}
                    </h3>
                    {[0, 1].map((i) => (
                      <label
                        key={i}
                        className="block text-xs font-bold text-slate-600 dark:text-slate-300"
                      >
                        {i === 0 ? "Left column" : "Right column"}
                        <input
                          className={field}
                          maxLength={70}
                          value={active.comparisonLabels?.[i] || ""}
                          placeholder={
                            i === 0
                              ? active.prismLayout === "before-after"
                                ? "e.g. BEFORE · Legacy Approach"
                                : "e.g. Manual workflow"
                              : active.prismLayout === "before-after"
                                ? "e.g. AFTER · Modern Approach"
                                : "e.g. Assisted workflow"
                          }
                          onChange={(e) => {
                            const labels: [string, string] = [
                              active.comparisonLabels?.[0] || "Option A",
                              active.comparisonLabels?.[1] || "Option B",
                            ];
                            labels[i] = e.target.value;
                            update({ comparisonLabels: labels });
                          }}
                        />
                      </label>
                    ))}
                  </div>
                )}
                {(active.visualEngine
                  ? active.prismLayout === "constellation" ||
                    active.prismLayout === "donut-breakdown" ||
                    active.prismLayout === "cycle-wheel" ||
                    active.prismLayout === "hierarchy-tree"
                  : [3, 19].includes(active.templateId)) && (
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                    {active.prismLayout === "hierarchy-tree"
                      ? "Root tree node label"
                      : "Center hub label"}
                    <input
                      className={field}
                      maxLength={45}
                      value={active.centerLabel || ""}
                      placeholder={
                        active.visualEngine
                          ? active.prismLayout === "cycle-wheel"
                            ? "Continuous Loop"
                            : active.prismLayout === "hierarchy-tree"
                              ? "Core System"
                              : "Key ideas"
                          : active.templateId === 3
                            ? "Cycle"
                            : "Topic"
                      }
                      onChange={(e) => update({ centerLabel: e.target.value })}
                    />
                  </label>
                )}
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                    Selected layout ·{" "}
                    {active.visualEngine
                      ? "Editorial collection"
                      : `${active.templateId}/25`}
                  </p>
                  <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                    {active.templateName}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {active.visualEngine
                      ? "Concepts and source-based explanations"
                      : spec.bestForSectionType}
                    . Choose a different layout in the gallery; your writing
                    stays in place.
                  </p>
                  <button
                    type="button"
                    className={button + " mt-3 w-full"}
                    onClick={() => {
                      if (active.visualEngine) {
                        const layout = active.visualBrief
                          ? recommendPrismLayout(
                              active.visualBrief,
                              active.nodes.length,
                            )
                          : active.nodes.length > 3
                            ? "ribbon"
                            : "editorial";
                        update(withPrismLayout(active, layout));
                        notify(
                          "Suggested an editorial composition for this point count. Check the text fit before exporting.",
                        );
                        return;
                      }
                      const rec = autoRecommendInfographicTemplate(
                        active.headline,
                        active.nodes.map((n) => n.detail).join(" "),
                      );
                      choose(rec.templateId);
                      notify(
                        `Suggested: ${rec.templateName}. You can choose any layout.`,
                      );
                    }}
                  >
                    <Sparkles size={14} />
                    Suggest a layout
                  </button>
                </div>
                {!active.visualEngine && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Editorial illustration
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      Optional reusable artwork. All wording and figures stay
                      editable.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {(["none", "paper-steps"] as const).map((v) => (
                        <button
                          type="button"
                          key={v}
                          aria-pressed={
                            (active.brand?.illustration || "none") === v
                          }
                          className={
                            (active.brand?.illustration || "none") === v
                              ? primary
                              : button
                          }
                          onClick={() => updateBrand({ illustration: v })}
                        >
                          {v === "none" ? "Type only" : "Paper & progress"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {active.visualEngine && (
                  <>
                    <InfographicProceduralStyleControls
                      config={active}
                      onChange={update}
                    />
                    <InfographicDepthControls
                      config={active}
                      onChange={update}
                    />
                  </>
                )}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Palette size={16} />
                    Color themes
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    One click coordinates the gradient, panels, text and
                    illustrations.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {Object.values(BLOG_INFOGRAPHIC_PALETTES).map((p) => (
                      <button
                        type="button"
                        aria-pressed={
                          active.paletteId === p.id &&
                          !Object.keys(active.brand?.customColors || {}).length
                        }
                        key={p.id}
                        onClick={() =>
                          update({
                            paletteId: p.id,
                            brand: { ...active.brand, customColors: {} },
                          })
                        }
                        className={`rounded-xl border p-3 text-left ${active.paletteId === p.id && !Object.keys(active.brand?.customColors || {}).length ? "border-indigo-500 ring-1 ring-indigo-500" : "border-slate-200 dark:border-slate-700"}`}
                      >
                        <span
                          className="flex h-14 items-end gap-1 rounded-lg p-2"
                          style={{
                            background: `linear-gradient(135deg, ${p.bgStart}, ${p.bgEnd})`,
                          }}
                        >
                          {[p.bgStart, p.accent, p.accentSecondary].map(
                            (c, i) => (
                              <span
                                key={i}
                                className="h-5 w-5 rounded-full border border-black/10"
                                style={{ background: c }}
                              />
                            ),
                          )}
                        </span>
                        <span className="mt-2 block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                          {p.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Your brand color
                  </h3>
                  <label className="mt-3 flex items-center gap-3 text-xs">
                    <input
                      type="color"
                      aria-label="Brand color"
                      className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
                      value={
                        active.brand?.customColors?.accent ||
                        BLOG_INFOGRAPHIC_PALETTES[active.paletteId].accent
                      }
                      onChange={(e) =>
                        updateBrand({
                          customColors: brandColors(
                            e.target.value,
                            !BLOG_INFOGRAPHIC_PALETTES[active.paletteId]
                              .isLight,
                          ),
                        })
                      }
                    />
                    Build a coordinated theme from your color
                  </label>
                  {active.extractedBrand && (
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      {active.extractedBrand.accent
                        ? `Brand hint from ${active.extractedBrand.source}: ${active.extractedBrand.accent}. Review or replace it here.`
                        : "No reliable brand color was found. Your selected theme is preserved."}
                    </p>
                  )}
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-semibold">
                      Fine-tune individual colors
                    </summary>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {(
                        [
                          ["bgStart", "Background"],
                          ["surface", "Panels"],
                          ["accent", "Accent"],
                          ["textMain", "Text"],
                        ] as const
                      ).map(([key, label]) => (
                        <label
                          key={key}
                          className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"
                        >
                          <input
                            type="color"
                            aria-label={label}
                            className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent"
                            value={
                              active.brand?.customColors?.[key] ||
                              BLOG_INFOGRAPHIC_PALETTES[active.paletteId][key]
                            }
                            onChange={(e) =>
                              updateBrand({
                                customColors: {
                                  ...active.brand?.customColors,
                                  [key]: e.target.value,
                                },
                              })
                            }
                          />
                          {label}
                        </label>
                      ))}
                      <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <input
                          type="color"
                          aria-label="Secondary"
                          className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent"
                          value={
                            active.secondaryAccent ||
                            BLOG_INFOGRAPHIC_PALETTES[active.paletteId]
                              .accentSecondary
                          }
                          onChange={(e) =>
                            update({ secondaryAccent: e.target.value })
                          }
                        />
                        Secondary
                      </label>
                    </div>
                    <button
                      type="button"
                      className="mt-3 text-xs font-semibold text-indigo-500"
                      onClick={() =>
                        update({
                          secondaryAccent: undefined,
                          brand: { ...active.brand, customColors: {} },
                        })
                      }
                    >
                      Reset custom colors
                    </button>
                  </details>
                </div>
                {active.visualEngine && (
                  <InfographicSignatureControls
                    config={active}
                    onChange={update}
                  />
                )}
                <div className="space-y-4 border-t border-slate-200 pt-5 dark:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Brand logo
                  </h3>
                  <label className={button + " w-full cursor-pointer"}>
                    <Upload size={14} />
                    Upload PNG, JPG or WebP
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      disabled={busy}
                      onChange={(e) => {
                        void uploadLogo(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <p className="text-xs text-slate-500">
                    Up to 2 MB. Stored with this infographic.
                  </p>
                  {active.brand?.logoDataUrl && (
                    <>
                      <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={active.brand.logoDataUrl}
                          alt="Your uploaded brand logo"
                          className="h-12 max-w-[170px] object-contain"
                        />
                        <button
                          type="button"
                          className={button}
                          onClick={() =>
                            updateBrand({ logoDataUrl: undefined })
                          }
                          aria-label="Remove logo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                        Logo size ·{" "}
                        {Math.round((active.brand.logoScale || 1) * 100)}%
                        <input
                          type="range"
                          min="0.7"
                          max="1.5"
                          step="0.05"
                          value={active.brand.logoScale || 1}
                          onChange={(e) =>
                            updateBrand({ logoScale: Number(e.target.value) })
                          }
                          className="mt-3 w-full accent-indigo-600"
                        />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(["plain", "white", "dark"] as const).map((s) => (
                          <button
                            type="button"
                            aria-pressed={
                              (active.brand?.logoStyle || "plain") === s
                            }
                            key={s}
                            onClick={() => updateBrand({ logoStyle: s })}
                            className={
                              (active.brand?.logoStyle || "plain") === s
                                ? primary
                                : button
                            }
                          >
                            {s === "plain" ? "No box" : `${s} box`}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {cards.length > 1 && (
                    <button
                      type="button"
                      className={button + " w-full"}
                      onClick={() => {
                        commit(
                          cards.map((c) =>
                            patchInfographic(c, {
                              paletteId: active.paletteId,
                              brand: { ...active.brand },
                              depth: active.depth,
                              signature: active.signature,
                              fontFamily: active.fontFamily,
                              extractedBrand: active.extractedBrand,
                              styleOverrides: active.styleOverrides
                                ? { ...active.styleOverrides }
                                : undefined,
                            }),
                          ),
                        );
                        notify(
                          "Applied brand color mode, depth, typography and logo across all sections.",
                        );
                      }}
                    >
                      Apply brand to all sections
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </aside>
        <div
          id={`${mode}-infographic-preview`}
          className="min-w-0 scroll-mt-28 space-y-6"
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
              <div
                className="flex min-w-0 flex-1 gap-2 overflow-x-auto"
                role="group"
                aria-label="Infographic sections"
              >
                {cards.map((c, i) => (
                  <button
                    type="button"
                    aria-pressed={activeIdx === i}
                    key={c.id}
                    onClick={() => {
                      setActiveIdx(i);
                      setCanvasSelection({ kind: "none" });
                    }}
                    className={
                      (activeIdx === i ? primary : button) + " shrink-0"
                    }
                  >
                    Section {i + 1}
                  </button>
                ))}
              </div>
              {active.visualEngine && (
                <button
                  type="button"
                  className={button}
                  disabled={busy}
                  title="Shuffle layout, background shader and card style"
                  onClick={() => {
                    update(shuffleInfographicVisualVariation(active, 1));
                    notify("Shuffled visual style for this section.");
                  }}
                >
                  <Sparkles size={14} />
                  Shuffle style
                </button>
              )}
              <button
                type="button"
                className={button}
                onClick={addSection}
                disabled={cards.length >= 12 || busy}
                aria-label="Add section"
              >
                <Plus size={15} />
              </button>
              <button
                type="button"
                className={button}
                disabled={cards.length <= 1 || busy}
                onClick={() => {
                  commit(cards.filter((_, i) => i !== activeIdx));
                  setActiveIdx(Math.max(0, activeIdx - 1));
                }}
                aria-label="Delete active section"
              >
                <Trash2 size={14} />
              </button>
            </div>
            {active.conceptAlternatives &&
              active.conceptAlternatives.length > 1 && (
                <div
                  className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-indigo-50/50 px-3 py-2.5 text-xs dark:border-slate-800 dark:bg-indigo-950/25"
                  role="group"
                  aria-label="Infographic concept alternatives"
                >
                  <span className="font-bold text-indigo-800 dark:text-indigo-200">
                    Section Visual Concepts:
                  </span>
                  {active.conceptAlternatives.map((concept) => {
                    const isSelected =
                      (active.activeConceptId ||
                        active.conceptAlternatives?.[0]?.id) === concept.id;
                    return (
                      <button
                        type="button"
                        key={concept.id}
                        aria-pressed={isSelected}
                        onClick={() => {
                          update(
                            withPrismLayout(
                              {
                                ...active,
                                activeConceptId: concept.id,
                                headline: concept.headline,
                                subheadline: concept.subheadline,
                                eyebrowLabel:
                                  concept.eyebrowLabel || active.eyebrowLabel,
                                calloutBadge: concept.calloutBadge,
                                calloutText: concept.calloutText,
                                comparisonLabels: concept.comparisonLabels,
                                sceneIllustration:
                                  concept.sceneIllustration ||
                                  active.sceneIllustration,
                                highlightWords: extractHeadlineHighlightPhrases(
                                  concept.headline,
                                ).join(", "),
                                nodes: concept.nodes,
                              },
                              concept.prismLayout,
                            ),
                          );
                          notify(
                            `Switched to ${concept.label} (${concept.prismLayout}).`,
                          );
                        }}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                            : "border-indigo-200 bg-white text-slate-700 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        }`}
                      >
                        {concept.label}
                      </button>
                    );
                  })}
                </div>
              )}
            <div className="flex flex-wrap items-center gap-2 p-3">
              <button
                type="button"
                className={primary}
                disabled={busy}
                onClick={() => exportImage("png")}
              >
                {busy ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                Download PNG
              </button>
              <button
                type="button"
                className={button}
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    saveFile(
                      new Blob([generateBlogInfographicSvg(active)], {
                        type: "image/svg+xml",
                      }),
                      `${filename}.svg`,
                    );
                  })
                }
              >
                SVG
              </button>
              <button
                type="button"
                className={button}
                disabled={busy}
                onClick={() => exportImage("webp")}
              >
                WebP
              </button>
              <button
                type="button"
                className={button}
                disabled={busy}
                onClick={() =>
                  run(async () =>
                    printCanvasAsPdfPoster(
                      await freshCanvas(),
                      active.headline,
                    ),
                  )
                }
              >
                Print / PDF
              </button>
              {cards.length > 1 && (
                <button
                  type="button"
                  className={button}
                  disabled={busy}
                  onClick={() => void exportMultiPagePdfDeck()}
                >
                  PDF Deck ({cards.length})
                </button>
              )}
              <button
                type="button"
                className={button}
                disabled={busy}
                onClick={copyImage}
              >
                <Copy size={13} />
                Copy
              </button>
              <button
                type="button"
                className={button}
                disabled={busy}
                onClick={exportZip}
              >
                All sections ZIP
              </button>
            </div>
            <InteractiveInfographicCanvas
              svg={scene.svg}
              config={active}
              width={dimensions.width}
              height={dimensions.height}
              zoom={zoom}
              busy={busy}
              selection={canvasSelection}
              onSelect={(nextSel) => {
                setCanvasSelection(nextSel);
                if (nextSel.kind === "card" || nextSel.kind === "icon") {
                  setOpenNodeIdx(nextSel.index);
                }
              }}
              onUpdateConfig={update}
              onUpdateNode={updateNode}
              onUploadNodeIcon={(nodeId, file) =>
                void uploadNodeCustomIcon(nodeId, file)
              }
              onUploadSceneImage={(file) =>
                void uploadCustomSceneObject(file)
              }
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {dimensions.width} × {dimensions.height} · {active.aspectRatio}{" "}
                <span className="ml-2 text-indigo-500">
                  Click any headline, card, icon, illustration, or footer
                  directly on the canvas to edit inline
                </span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={button}
                  onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
                  aria-label="Zoom out"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="w-10 text-xs text-slate-500"
                  aria-label="Reset zoom"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  className={button}
                  onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
                  aria-label="Zoom in"
                >
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>
          </div>
          {scene.issues.length > 0 && (
            <div
              role="status"
              className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200"
            >
              <p className="font-bold">
                Check these details before exporting.
              </p>
              <ul className="mt-2 max-h-48 list-disc space-y-1 overflow-y-auto pl-4">
                {scene.issues.map((issue, i) => (
                  <li key={i}>{issue.message}</li>
                ))}
              </ul>
              {scene.issues.some(
                (i) => !["Colors", "Values", "nodes"].includes(i.field),
              ) && (
                <button
                  type="button"
                  onClick={() => {
                    setPanel("design");
                    document
                      .getElementById("infographic-layouts")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="mt-3 font-bold underline"
                >
                  Choose another layout
                </button>
              )}
            </div>
          )}
          <div
            id="infographic-layouts"
            className="scroll-mt-28 rounded-2xl border border-indigo-200 bg-white p-4 dark:border-indigo-500/30 dark:bg-slate-900 sm:p-5"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  18 Flagship Diagram &amp; Infographic Archetypes
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Eighteen original diagram &amp; infographic compositions with
                  fixed canvases—including charts, donuts, funnels, pyramids,
                  trees, flywheels, flowcharts, and KPI bentos. Your writing,
                  brand colors and logo stay in place when you switch.
                </p>
              </div>
            </div>
            <div
              className="mt-4 flex flex-wrap gap-1.5"
              role="group"
              aria-label="Filter infographic diagram categories"
            >
              <button
                type="button"
                aria-pressed={prismCategory === "all"}
                onClick={() => setPrismCategory("all")}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  prismCategory === "all"
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                All ({PRISM_LAYOUTS.length})
              </button>
              {PRISM_LAYOUT_CATEGORIES.map((cat) => {
                const count = PRISM_LAYOUTS.filter(
                  (l) => l.category === cat,
                ).length;
                return (
                  <button
                    type="button"
                    key={cat}
                    aria-pressed={prismCategory === cat}
                    onClick={() => setPrismCategory(cat)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                      prismCategory === cat
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {PRISM_LAYOUTS.filter(
                (layout) =>
                  prismCategory === "all" || layout.category === prismCategory,
              ).map((layout) => (
                <PrismTemplateCard
                  key={layout.id}
                  config={deferred}
                  layout={layout.id}
                  onSelect={() => {
                    const hasCustom = Boolean(
                      Object.keys(active.brand?.customColors || {}).length,
                    );
                    const nextNodes =
                      layout.id === "comparison" &&
                      active.nodes.length > 2 &&
                      active.nodes.length % 2 !== 0
                        ? active.nodes.slice(0, active.nodes.length - 1)
                        : active.nodes;
                    update(
                      withPrismLayout(
                        {
                          ...active,
                          paletteId: hasCustom
                            ? active.paletteId
                            : PRISM_LAYOUT_THEMES[layout.id] ||
                              active.paletteId,
                          nodes: nextNodes,
                        },
                        layout.id,
                      ),
                    );
                  }}
                />
              ))}
            </div>
          </div>
          <details
            open={classicOpen}
            onToggle={(e) => setClassicOpen(e.currentTarget.open)}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5"
          >
            <summary className="cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-200">
              Classic collection · 25 legacy layouts
            </summary>
            {classicOpen && (
              <>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-500">
                      25 ways to tell the story
                    </p>
                    <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Find the right visual structure.
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Live previews use your content, colors, logo and format.
                    </p>
                  </div>
                  <label>
                    <span className="sr-only">Search layouts</span>
                    <input
                      className={field + " !mt-0 max-w-[200px]"}
                      placeholder="Search layouts…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                </div>
                <div className="my-5 flex flex-wrap gap-2">
                  {familyLabels.map((f, i) => (
                    <button
                      type="button"
                      key={f}
                      aria-pressed={family === i}
                      onClick={() => setFamily(i)}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold ${family === i ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 text-slate-600 hover:border-indigo-400 dark:border-slate-700 dark:text-slate-300"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 xl:grid-cols-3">
                  {templates.map((t) => (
                    <TemplateCard
                      key={t.id}
                      id={t.id}
                      config={deferred}
                      selected={
                        !active.visualEngine && active.templateId === t.id
                      }
                      onSelect={() => choose(t.id)}
                    />
                  ))}
                </div>
                {!templates.length && (
                  <p className="py-10 text-center text-sm text-slate-500">
                    No layouts match. Try a different search or category.
                  </p>
                )}
              </>
            )}
          </details>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Keep an editable copy
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Save the project to continue later or share it with a teammate.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={button}
                onClick={() =>
                  saveFile(
                    new Blob([JSON.stringify({ version: 1, cards }, null, 2)], {
                      type: "application/json",
                    }),
                    "infographic-project.json",
                  )
                }
              >
                <FileCode2 size={14} />
                Save project
              </button>
              <label className={button + " cursor-pointer"}>
                <Upload size={14} />
                Open project
                <input
                  type="file"
                  className="sr-only"
                  accept="application/json,.json"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f)
                      void run(async () => {
                        if (f.size > 12_000_000)
                          throw new Error("Project files must be under 12 MB.");
                        const loaded = importInfographicProject(await f.text());
                        if (cards.length + loaded.length > 12)
                          throw new Error(
                            "A project supports 12 sections. Save your current work before opening more sections.",
                          );
                        commit([...cards, ...loaded]);
                        setActiveIdx(cards.length);
                        notify(
                          "Project sections added. Your existing sections were kept.",
                        );
                      });
                  }}
                />
              </label>
              <button
                type="button"
                className={button}
                onClick={() =>
                  run(async () => {
                    const html = `<figure><img src="${filename}.webp" alt="${escapeHtml(active.altText || active.headline)}" width="${dimensions.width}" height="${dimensions.height}" loading="lazy" decoding="async" style="max-width:100%;height:auto"/><figcaption>${escapeHtml(active.footerSourceLabel)}</figcaption></figure>`;
                    await navigator.clipboard.writeText(html);
                    notify(
                      "Embed HTML copied. Upload the matching WebP alongside your article.",
                    );
                  })
                }
              >
                <Copy size={13} />
                Embed HTML
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        role="status"
        aria-live="polite"
        className={
          toast
            ? "fixed bottom-6 left-1/2 z-[100] max-w-[90vw] -translate-x-1/2 rounded-xl bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white shadow-xl ring-1 ring-white/15"
            : "sr-only"
        }
      >
        {toast}
      </div>
    </section>
  );
}
export default BlogInfographicStudio;

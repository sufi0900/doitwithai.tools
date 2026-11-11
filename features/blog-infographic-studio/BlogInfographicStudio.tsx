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
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";
import { printCanvasAsPdfPoster } from "@/features/tool-ui/visualCardExport";
import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
  InfographicAspectRatio,
} from "@/lib/blog-writer/canonical-state";
import { autoRecommendInfographicTemplate } from "@/lib/blog-writer/deterministic-analyzers";
import { BLOG_INFOGRAPHIC_25_TEMPLATES } from "@/lib/blog-infographic-studio/templates";
import {
  ASPECT_RATIO_DIMENSIONS,
  BLOG_INFOGRAPHIC_PALETTES,
  buildInfographicScene,
  createSampleInfographicConfig,
  generateBlogInfographicSvg,
  renderBlogInfographicToCanvas,
} from "@/lib/blog-infographic-studio/canvas-renderer";
import {
  importInfographicProject,
  nodesFromText,
  patchInfographic,
  selectInfographicTemplate,
} from "@/lib/blog-infographic-studio/project";

export interface BlogInfographicStudioProps {
  mode?: "standalone" | "embedded-modal";
  initialConfig?: BlogInfographicConfig;
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
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
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
        {/* The very same scene as the main preview, in the selected aspect ratio. */}
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
  onSaveConfig,
  onClose,
}: BlogInfographicStudioProps) {
  const [cards, setCards] = useState<BlogInfographicConfig[]>(() => [
    initialConfig || createSampleInfographicConfig(),
  ]);
  const [activeIdx, setActiveIdx] = useState(0),
    [panel, setPanel] = useState<"content" | "design" | "brand">("content"),
    [family, setFamily] = useState(0),
    [query, setQuery] = useState("");
  const [paste, setPaste] = useState(""),
    [toast, setToast] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [zoom, setZoom] = useState(1);
  const [past, setPast] = useState<BlogInfographicConfig[][]>([]),
    [future, setFuture] = useState<BlogInfographicConfig[][]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const active = cards[Math.min(activeIdx, cards.length - 1)];
  const deferred = useDeferredValue(active);
  const scene = useMemo(() => buildInfographicScene(deferred), [deferred]);
  const dimensions = ASPECT_RATIO_DIMENSIONS[active.aspectRatio];
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
      setCards([initialConfig]);
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
  function addSection() {
    if (cards.length >= 12) return;
    const card = {
      ...createSampleInfographicConfig(active.templateId, active.paletteId),
      id: uid(),
      sectionId: uid(),
      headline: "Your next section",
      subheadline: "Add a short explanation of the main idea",
      brand: { ...active.brand },
    };
    commit([...cards, card]);
    setActiveIdx(cards.length);
  }
  function pastePoints() {
    const nodes = nodesFromText(paste);
    if (!nodes.length) {
      setError("Paste at least one sentence or list item first.");
      return;
    }
    update({ nodes });
    setPaste("");
    notify(
      "Text split into editable points. Review the wording before exporting.",
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
        <details className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <summary className="cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-200">
            Start from an article URL{" "}
            <span className="ml-2 text-xs font-normal text-slate-500">
              or edit the example below
            </span>
          </summary>
          <div className="mt-4">
            <UrlArticleExtractorBar
              onExtracted={(data) => {
                if (cards.length >= 12) {
                  setError(
                    "This project has 12 sections. Save it and start a new project for more.",
                  );
                  return;
                }
                const paras = (data.paragraphs || [])
                  .filter((p: string) => p.trim().length > 25)
                  .slice(0, Math.min(6, 12 - cards.length));
                if (!paras.length) {
                  setError(
                    "No readable article paragraphs were found. Paste the text in Content instead.",
                  );
                  return;
                }
                const next = paras.map((p: string) => {
                  const headline = p.split(/[.!?]/)[0].slice(0, 140),
                    rec = autoRecommendInfographicTemplate(headline, p);
                  return {
                    ...createSampleInfographicConfig(
                      rec.templateId,
                      active.paletteId,
                    ),
                    id: uid(),
                    sectionId: uid(),
                    headline,
                    subheadline: `Visual summary · ${data.domain || "Imported article"}`,
                    nodes: nodesFromText(p),
                    footerSourceLabel: `Source: ${data.domain || data.url}`,
                    brand: { ...active.brand },
                  };
                });
                commit([...cards, ...next]);
                setActiveIdx(cards.length);
                notify(
                  `Added ${next.length} editable section summaries. Review them before publishing.`,
                );
              }}
            />
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
              const tabs = ["content", "design", "brand"] as const;
              let next = tabs.indexOf(panel);
              if (e.key === "ArrowRight") next = (next + 1) % 3;
              else if (e.key === "ArrowLeft") next = (next + 2) % 3;
              else if (e.key === "Home") next = 0;
              else if (e.key === "End") next = 2;
              else return;
              e.preventDefault();
              setPanel(tabs[next]);
              document.getElementById(`infographic-tab-${tabs[next]}`)?.focus();
            }}
          >
            {(["content", "design", "brand"] as const).map((tab) => (
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
            className="max-h-[720px] space-y-6 overflow-y-auto p-5 lg:max-h-[calc(100vh-190px)]"
          >
            {panel === "content" && (
              <>
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
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                    Subtitle
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
                    Turn a paragraph into points
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Split sentences or list items into editable blocks. No facts
                    or statistics are added.
                  </p>
                  <textarea
                    aria-label="Paragraph to split into points"
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
                        {active.nodes.length}/8
                      </span>
                    </h3>
                    <button
                      type="button"
                      className={button}
                      disabled={active.nodes.length >= 8}
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
                              detail: "Explain the idea in one short sentence.",
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
                    For comparison layouts, points alternate between the left
                    and right columns. Values are optional; charts use the
                    figures you enter.
                  </p>
                  <div className="space-y-3">
                    {active.nodes.map((n, i) => (
                      <details
                        key={n.id}
                        open
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
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              Value / metric
                              <input
                                className={field}
                                value={n.metricValue || ""}
                                maxLength={30}
                                placeholder="e.g. 42%"
                                onChange={(e) =>
                                  updateNode(n.id, {
                                    metricValue: e.target.value,
                                  })
                                }
                              />
                            </label>
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
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Source / footer
                  <input
                    className={field}
                    value={active.footerSourceLabel}
                    maxLength={180}
                    onChange={(e) =>
                      update({ footerSourceLabel: e.target.value })
                    }
                  />
                  <span className="mt-1 block text-[11px] font-normal text-slate-500">
                    Credit the actual source of any figures.
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
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Canvas format
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {(
                      Object.keys(
                        ASPECT_RATIO_DIMENSIONS,
                      ) as InfographicAspectRatio[]
                    ).map((r) => (
                      <button
                        type="button"
                        key={r}
                        aria-pressed={active.aspectRatio === r}
                        className={active.aspectRatio === r ? primary : button}
                        onClick={() => update({ aspectRatio: r })}
                      >
                        {r}
                        <span className="text-[10px] opacity-70">
                          {r === "16:9"
                            ? "Landscape"
                            : r === "1:1"
                              ? "Square"
                              : r === "4:5"
                                ? "Portrait"
                                : "Tall"}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Portrait and tall formats give longer explanations more
                    breathing room.
                  </p>
                </div>
                {[6, 8, 9, 10, 23].includes(active.templateId) && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Comparison headings
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
                              ? "e.g. Manual workflow"
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
                {[3, 19].includes(active.templateId) && (
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                    Center label
                    <input
                      className={field}
                      maxLength={45}
                      value={active.centerLabel || ""}
                      placeholder={active.templateId === 3 ? "Cycle" : "Topic"}
                      onChange={(e) => update({ centerLabel: e.target.value })}
                    />
                  </label>
                )}
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                    Selected layout · {active.templateId}/25
                  </p>
                  <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                    {spec.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {spec.bestForSectionType}. Choose a different layout in the
                    gallery; your writing stays in place.
                  </p>
                  <button
                    type="button"
                    className={button + " mt-3 w-full"}
                    onClick={() => {
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
              </>
            )}
            {panel === "brand" && (
              <>
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Palette size={16} />
                    Color collection
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {Object.values(BLOG_INFOGRAPHIC_PALETTES).map((p) => (
                      <button
                        type="button"
                        aria-pressed={active.paletteId === p.id}
                        key={p.id}
                        onClick={() =>
                          update({
                            paletteId: p.id,
                            brand: { ...active.brand, customColors: {} },
                          })
                        }
                        className={`rounded-xl border p-3 text-left ${active.paletteId === p.id ? "border-indigo-500 ring-1 ring-indigo-500" : "border-slate-200 dark:border-slate-700"}`}
                      >
                        <span className="flex gap-1">
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
                    Custom colors
                  </h3>
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
                  </div>
                  <button
                    type="button"
                    className="mt-3 text-xs font-semibold text-indigo-500"
                    onClick={() => updateBrand({ customColors: {} })}
                  >
                    Reset custom colors
                  </button>
                </div>
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
                            }),
                          ),
                        );
                        notify(
                          "Applied colors, logo and illustration to all sections.",
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
        <div className="min-w-0 space-y-6">
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
                    onClick={() => setActiveIdx(i)}
                    className={
                      (activeIdx === i ? primary : button) + " shrink-0"
                    }
                  >
                    Section {i + 1}
                  </button>
                ))}
              </div>
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
                  saveFile(
                    new Blob([generateBlogInfographicSvg(active)], {
                      type: "image/svg+xml",
                    }),
                    `${filename}.svg`,
                  )
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
            <div
              className="overflow-auto bg-slate-200/70 px-4 py-8 dark:bg-[#080E1B] sm:px-8"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #94a3b825 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            >
              <div
                className="mx-auto flex min-h-[300px] justify-center"
                style={{
                  width: `${zoom * 100}%`,
                  maxWidth: zoom === 1 ? "100%" : "none",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={svgSource(scene.svg)}
                  alt={active.altText || active.headline}
                  width={dimensions.width}
                  height={dimensions.height}
                  className="h-auto max-h-[680px] max-w-full object-contain drop-shadow-xl"
                  style={{ maxHeight: 680 * zoom }}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {dimensions.width} × {dimensions.height} · {active.aspectRatio}{" "}
                <span className="ml-2 text-indigo-500">
                  Editable source included in ZIP
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
              <p className="font-bold">Check these details before exporting.</p>
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
                    update({ aspectRatio: "9:16" });
                    setPanel("design");
                  }}
                  className="mt-3 font-bold underline"
                >
                  Try the tall format
                </button>
              )}
            </div>
          )}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
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
                  selected={active.templateId === t.id}
                  onSelect={() => choose(t.id)}
                />
              ))}
            </div>
            {!templates.length && (
              <p className="py-10 text-center text-sm text-slate-500">
                No layouts match. Try a different search or category.
              </p>
            )}
          </div>
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

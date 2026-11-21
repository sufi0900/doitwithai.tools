"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Palette, Sparkles, Trash2, Type, Upload, X } from "lucide-react";
import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
} from "@/lib/blog-writer/canonical-state";
import { BLOG_INFOGRAPHIC_PALETTES } from "@/lib/blog-infographic-studio/palettes";
import { extractHeadlineHighlightPhrases } from "@/lib/blog-infographic-studio/appearance";
import { VECTOR_SCENE_CATALOG } from "@/lib/visual-stock/vector-scenes";
import { IconPickerGrid } from "./IconPickerGrid";

export type CanvasSelection =
  | { kind: "none" }
  | { kind: "headline" }
  | { kind: "scene" }
  | { kind: "card"; index: number }
  | { kind: "icon"; index: number }
  | { kind: "callout" }
  | { kind: "footer" };

interface HighlightBox {
  layerId: string;
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface InteractiveInfographicCanvasProps {
  svg: string;
  config: BlogInfographicConfig;
  width: number;
  height: number;
  zoom: number;
  busy?: boolean;
  selection: CanvasSelection;
  onSelect: (next: CanvasSelection) => void;
  onUpdateConfig: (patch: Partial<BlogInfographicConfig>) => void;
  onUpdateNode: (nodeId: string, patch: Partial<BlogInfographicNodeItem>) => void;
  onUploadNodeIcon: (nodeId: string, file?: File) => void;
  onUploadSceneImage: (file?: File) => void;
}

function parseLayerId(layerId: string): CanvasSelection {
  if (layerId === "headline") return { kind: "headline" };
  if (layerId === "scene-illustration") return { kind: "scene" };
  if (layerId === "callout") return { kind: "callout" };
  if (layerId === "footer") return { kind: "footer" };
  const iconMatch = layerId.match(/^node-icon-(\d+)$/);
  if (iconMatch) return { kind: "icon", index: Number(iconMatch[1]) };
  const nodeMatch = layerId.match(/^node-(\d+)$/);
  if (nodeMatch) return { kind: "card", index: Number(nodeMatch[1]) };
  return { kind: "none" };
}

function selectionToLayerId(sel: CanvasSelection): string | null {
  switch (sel.kind) {
    case "headline":
      return "headline";
    case "scene":
      return "scene-illustration";
    case "card":
      return `node-${sel.index}`;
    case "icon":
      return `node-icon-${sel.index}`;
    case "callout":
      return "callout";
    case "footer":
      return "footer";
    default:
      return null;
  }
}

function labelForLayer(layerId: string): string {
  if (layerId === "headline") return "Headline · Click to edit";
  if (layerId === "scene-illustration") return "Illustration · Click to swap or upload";
  if (layerId === "callout") return "Callout banner · Click to edit";
  if (layerId === "footer") return "Footer · Click to edit";
  const iconMatch = layerId.match(/^node-icon-(\d+)$/);
  if (iconMatch) return `Icon ${Number(iconMatch[1]) + 1} · Click to change or upload`;
  const nodeMatch = layerId.match(/^node-(\d+)$/);
  if (nodeMatch) return `Card ${Number(nodeMatch[1]) + 1} · Click to edit`;
  return "Click to edit";
}

const inputCls =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const btnCls =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

export function InteractiveInfographicCanvas({
  svg,
  config,
  width,
  height,
  zoom,
  busy = false,
  selection,
  onSelect,
  onUpdateConfig,
  onUpdateNode,
  onUploadNodeIcon,
  onUploadSceneImage,
}: InteractiveInfographicCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [hoverBox, setHoverBox] = useState<HighlightBox | null>(null);
  const [selectedBox, setSelectedBox] = useState<HighlightBox | null>(null);

  const measureLayer = useCallback((layerId: string): HighlightBox | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    const el =
      stage.querySelector(`[data-layer-box="${layerId}"]`) ||
      stage.querySelector(`[data-layer-id="${layerId}"]`);
    if (!el) return null;
    const stageRect = stage.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return {
      layerId,
      label: labelForLayer(layerId),
      left: rect.left - stageRect.left,
      top: rect.top - stageRect.top,
      width: rect.width,
      height: rect.height,
    };
  }, []);

  useEffect(() => {
    const selLayerId = selectionToLayerId(selection);
    if (!selLayerId) {
      setSelectedBox(null);
      return;
    }
    const raf = requestAnimationFrame(() => {
      setSelectedBox(measureLayer(selLayerId));
    });
    const onResize = () => setSelectedBox(measureLayer(selLayerId));
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [selection, svg, zoom, measureLayer]);

  useEffect(() => {
    if (selection.kind === "none") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSelect({ kind: "none" });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selection.kind, onSelect]);

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as Element | null;
    const hit = target?.closest("[data-layer-id]");
    const layerId = hit?.getAttribute("data-layer-id");
    if (!layerId) {
      if (hoverBox) setHoverBox(null);
      return;
    }
    if (hoverBox?.layerId === layerId) return;
    setHoverBox(measureLayer(layerId));
  };

  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as Element | null;
    const hit = target?.closest("[data-layer-id]");
    const layerId = hit?.getAttribute("data-layer-id");
    if (!layerId) {
      onSelect({ kind: "none" });
      return;
    }
    const nextSel = parseLayerId(layerId);
    onSelect(nextSel);
  };

  const accentHex =
    config.brand?.customColors?.accent ||
    config.extractedBrand?.accent ||
    BLOG_INFOGRAPHIC_PALETTES[config.paletteId]?.accent ||
    "#4F46E5";

  const activeNode =
    selection.kind === "card" || selection.kind === "icon"
      ? config.nodes[selection.index]
      : undefined;

  const displayHeight = Math.round(680 * zoom);
  const aspectRatioCss = `${width} / ${height}`;

  return (
    <div className="flex flex-col">
      {/* Contextual Canva-style Direct-Click Inspector Bar (appears ONLY when an element on the canvas is clicked) */}
      {selection.kind !== "none" && (
        <div
          className="border-b border-indigo-200 bg-indigo-50/90 p-3.5 text-xs dark:border-indigo-500/30 dark:bg-slate-900/95"
          aria-label="Direct canvas element editor"
        >
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {selection.kind === "headline" && (
                  <>
                    <Type size={11} /> Headline &amp; Subtitle
                  </>
                )}
                {selection.kind === "scene" && (
                  <>
                    <ImageIcon size={11} /> Header Illustration Object
                  </>
                )}
                {selection.kind === "card" && (
                  <>
                    <Type size={11} /> Card {selection.index + 1} Content
                  </>
                )}
                {selection.kind === "icon" && (
                  <>
                    <Sparkles size={11} /> Card {selection.index + 1} Icon &amp; Image
                  </>
                )}
                {selection.kind === "callout" && (
                  <>
                    <Sparkles size={11} /> Bottom Callout Banner
                  </>
                )}
                {selection.kind === "footer" && (
                  <>
                    <Type size={11} /> Footer Source &amp; Brand
                  </>
                )}
              </span>
              {(selection.kind === "card" || selection.kind === "icon") && (
                <div className="inline-flex rounded-lg border border-indigo-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() =>
                      onSelect({ kind: "card", index: selection.index })
                    }
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                      selection.kind === "card"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 hover:text-indigo-600 dark:text-slate-300"
                    }`}
                  >
                    Edit Text &amp; Color
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onSelect({ kind: "icon", index: selection.index })
                    }
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                      selection.kind === "icon"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 hover:text-indigo-600 dark:text-slate-300"
                    }`}
                  >
                    Change Icon / Upload Image
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => onSelect({ kind: "none" })}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold text-slate-600 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <X size={12} />
              Done
            </button>
          </div>

          {selection.kind === "headline" && (
            <div className="grid gap-2.5 sm:grid-cols-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-200">
                Headline
                <input
                  autoFocus
                  className={inputCls}
                  value={config.headline}
                  maxLength={180}
                  onChange={(e) => onUpdateConfig({ headline: e.target.value })}
                />
              </label>
              <label className="block font-semibold text-slate-700 dark:text-slate-200">
                Subtitle
                <input
                  className={inputCls}
                  value={config.subheadline}
                  maxLength={240}
                  onChange={(e) =>
                    onUpdateConfig({ subheadline: e.target.value })
                  }
                />
              </label>
              <label className="block font-semibold text-slate-700 dark:text-slate-200">
                <span className="flex items-center justify-between">
                  <span>2-Tone Highlight Words</span>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateConfig({
                        highlightWords: extractHeadlineHighlightPhrases(
                          config.headline,
                        ).join(", "),
                      })
                    }
                    className="text-[11px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Auto-pick
                  </button>
                </span>
                <input
                  className={inputCls}
                  value={config.highlightWords || ""}
                  maxLength={140}
                  placeholder="Comma-separated words to highlight"
                  onChange={(e) =>
                    onUpdateConfig({ highlightWords: e.target.value })
                  }
                />
              </label>
              <label className="block font-semibold text-slate-700 dark:text-slate-200">
                Headline Size ({Math.round((config.styleOverrides?.headlineScale ?? 1) * 100)}%)
                <input
                  type="range"
                  min={0.75}
                  max={1.3}
                  step={0.05}
                  value={config.styleOverrides?.headlineScale ?? 1}
                  onChange={(e) =>
                    onUpdateConfig({
                      styleOverrides: {
                        ...config.styleOverrides,
                        headlineScale: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-2.5 w-full accent-indigo-600"
                />
              </label>
            </div>
          )}

          {selection.kind === "card" && activeNode && (
            <div className="space-y-2.5">
              <div className="grid gap-2.5 sm:grid-cols-[1fr_1.5fr]">
                <label className="block font-semibold text-slate-700 dark:text-slate-200">
                  Card Title
                  <input
                    autoFocus
                    className={inputCls}
                    value={activeNode.title}
                    maxLength={120}
                    onChange={(e) =>
                      onUpdateNode(activeNode.id, { title: e.target.value })
                    }
                  />
                </label>
                <label className="block font-semibold text-slate-700 dark:text-slate-200">
                  Card Explanation
                  <input
                    className={inputCls}
                    value={activeNode.detail}
                    maxLength={360}
                    onChange={(e) =>
                      onUpdateNode(activeNode.id, { detail: e.target.value })
                    }
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                  Badge
                  <input
                    className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    value={activeNode.badge}
                    maxLength={8}
                    onChange={(e) =>
                      onUpdateNode(activeNode.id, { badge: e.target.value })
                    }
                  />
                </label>
                <label className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                  <Palette size={12} />
                  Card Accent
                  <input
                    type="color"
                    aria-label="Card accent color"
                    value={activeNode.accentHex || accentHex}
                    onChange={(e) =>
                      onUpdateNode(activeNode.id, { accentHex: e.target.value })
                    }
                    className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent"
                  />
                </label>
                {activeNode.accentHex && (
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateNode(activeNode.id, { accentHex: undefined })
                    }
                    className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Reset color
                  </button>
                )}
                <label className={btnCls + " ml-auto cursor-pointer"}>
                  <Upload size={12} />
                  {activeNode.customIconDataUrl
                    ? "Replace Card Image"
                    : "Upload Card Image"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    disabled={busy}
                    onChange={(e) => {
                      onUploadNodeIcon(activeNode.id, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          )}

          {selection.kind === "icon" && activeNode && (
            <IconPickerGrid
              value={activeNode.icon}
              customIconDataUrl={activeNode.customIconDataUrl}
              accentColor={activeNode.accentHex || accentHex}
              busy={busy}
              onSelectIcon={(icon) =>
                onUpdateNode(activeNode.id, {
                  icon,
                  customIconDataUrl: undefined,
                })
              }
              onUploadCustomIcon={(file) =>
                onUploadNodeIcon(activeNode.id, file)
              }
              onRemoveCustomIcon={() =>
                onUpdateNode(activeNode.id, { customIconDataUrl: undefined })
              }
            />
          )}

          {selection.kind === "scene" && (
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500">
                  <Upload size={13} />
                  {config.customSceneImageUrl
                    ? "Replace Custom Illustration / Object"
                    : "Upload Custom Illustration / Object (PNG, JPG, WebP)"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    disabled={busy}
                    onChange={(e) => {
                      onUploadSceneImage(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                {config.customSceneImageUrl && (
                  <button
                    type="button"
                    className={btnCls}
                    onClick={() =>
                      onUpdateConfig({ customSceneImageUrl: undefined })
                    }
                  >
                    <Trash2 size={12} />
                    Remove Custom Image
                  </button>
                )}
                <button
                  type="button"
                  className={btnCls}
                  onClick={() =>
                    onUpdateConfig({
                      sceneIllustration: "none",
                      customSceneImageUrl: undefined,
                    })
                  }
                >
                  Hide Illustration
                </button>
              </div>
              <div className="grid max-h-40 grid-cols-3 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-6">
                {VECTOR_SCENE_CATALOG.map((scene) => {
                  const selected =
                    !config.customSceneImageUrl &&
                    config.sceneIllustration === scene.id;
                  const previewSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 220">${scene.renderSvgNodes({
                    primary: accentHex,
                    secondary: config.secondaryAccent || "#10B981",
                    surface: "#0F172A",
                    ink: "#F8FAFC",
                    muted: "#94A3B8",
                  })}</svg>`;
                  return (
                    <button
                      type="button"
                      key={scene.id}
                      aria-pressed={selected}
                      onClick={() =>
                        onUpdateConfig({
                          sceneIllustration: scene.id,
                          customSceneImageUrl: undefined,
                        })
                      }
                      className={`flex flex-col overflow-hidden rounded-lg border text-left transition ${
                        selected
                          ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500 dark:bg-indigo-950/60"
                          : "border-slate-200 bg-white hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800"
                      }`}
                    >
                      <div className="flex h-12 items-center justify-center bg-slate-900 p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(previewSvg)}`}
                          alt={scene.title}
                          loading="lazy"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <span className="truncate px-1.5 py-1 text-[9px] font-bold text-slate-700 dark:text-slate-200">
                        {scene.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selection.kind === "callout" && (
            <div className="grid gap-2.5 sm:grid-cols-[150px_1fr_160px]">
              <label className="block font-semibold text-slate-700 dark:text-slate-200">
                Callout Badge
                <input
                  className={inputCls}
                  value={config.calloutBadge || ""}
                  maxLength={28}
                  placeholder="KEY TAKEAWAY"
                  onChange={(e) =>
                    onUpdateConfig({ calloutBadge: e.target.value })
                  }
                />
              </label>
              <label className="block font-semibold text-slate-700 dark:text-slate-200">
                Callout Text
                <input
                  autoFocus
                  className={inputCls}
                  value={config.calloutText || ""}
                  maxLength={140}
                  onChange={(e) =>
                    onUpdateConfig({ calloutText: e.target.value })
                  }
                />
              </label>
              <label className="block font-semibold text-slate-700 dark:text-slate-200">
                Banner Style
                <select
                  className={inputCls}
                  value={config.styleOverrides?.calloutStyle || "default"}
                  onChange={(e) =>
                    onUpdateConfig({
                      styleOverrides: {
                        ...config.styleOverrides,
                        calloutStyle: e.target.value as NonNullable<
                          BlogInfographicConfig["styleOverrides"]
                        >["calloutStyle"],
                      },
                    })
                  }
                >
                  <option value="default">Editorial border</option>
                  <option value="gold-pill">Gold highlight bar</option>
                  <option value="accent-pill">Brand accent bar</option>
                  <option value="hidden">Hide callout</option>
                </select>
              </label>
            </div>
          )}

          {selection.kind === "footer" && (
            <div className="grid gap-2.5 sm:grid-cols-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-200">
                Source / Footer Line
                <input
                  autoFocus
                  className={inputCls}
                  value={config.footerSourceLabel}
                  maxLength={180}
                  placeholder="Leave blank to hide source credit"
                  onChange={(e) =>
                    onUpdateConfig({ footerSourceLabel: e.target.value })
                  }
                />
              </label>
              <label className="block font-semibold text-slate-700 dark:text-slate-200">
                Brand Signature Name
                <input
                  className={inputCls}
                  value={config.signature?.name || ""}
                  maxLength={64}
                  placeholder="Your website or brand name"
                  onChange={(e) =>
                    onUpdateConfig({
                      signature: {
                        ...config.signature,
                        name: e.target.value,
                      },
                    })
                  }
                />
              </label>
            </div>
          )}
        </div>
      )}

      {/* Clean, Unobstructed Live SVG Canvas with Direct Element Selection & Canva Outline */}
      <div
        className="overflow-auto bg-slate-200/70 px-4 py-8 dark:bg-[#080E1B] sm:px-8"
        style={{
          backgroundImage:
            "radial-gradient(circle, #94a3b825 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelect({ kind: "none" });
        }}
      >
        <div
          className="mx-auto flex min-h-[300px] justify-center"
          style={{
            width: `${zoom * 100}%`,
            maxWidth: zoom === 1 ? "100%" : "none",
          }}
        >
          <div
            ref={stageRef}
            onMouseMove={handleStageMouseMove}
            onMouseLeave={() => setHoverBox(null)}
            onClick={handleStageClick}
            className="relative inline-block max-w-full select-none drop-shadow-xl"
            style={{
              height: displayHeight,
              maxWidth: "100%",
              aspectRatio: aspectRatioCss,
            }}
          >
            {/* Live native SVG directly interactive (zero obstructing buttons) */}
            <div
              className="h-full w-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
              aria-label={config.altText || config.headline}
              dangerouslySetInnerHTML={{ __html: svg }}
            />

            {/* Subtle Canva-style hover outline hugging ONLY the hovered element */}
            {hoverBox && hoverBox.layerId !== selectedBox?.layerId && (
              <div
                className="pointer-events-none absolute rounded-lg border-2 border-dashed border-sky-400/90 bg-sky-400/[0.04] transition-all duration-75"
                style={{
                  left: hoverBox.left - 3,
                  top: hoverBox.top - 3,
                  width: hoverBox.width + 6,
                  height: hoverBox.height + 6,
                }}
              >
                <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-slate-950/90 px-1.5 py-0.5 text-[10px] font-semibold text-sky-200 shadow-sm">
                  {hoverBox.label}
                </span>
              </div>
            )}

            {/* Crisp Canva-style solid selection frame around the actively clicked element */}
            {selectedBox && (
              <div
                className="pointer-events-none absolute rounded-lg border-2 border-indigo-500 ring-2 ring-indigo-500/25 transition-all duration-100"
                style={{
                  left: selectedBox.left - 3,
                  top: selectedBox.top - 3,
                  width: selectedBox.width + 6,
                  height: selectedBox.height + 6,
                }}
              >
                <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white" />
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white" />
                <span className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white" />
                <span className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveInfographicCanvas;

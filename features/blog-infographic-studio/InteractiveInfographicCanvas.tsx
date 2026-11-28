"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { BlogInfographicConfig } from "@/lib/blog-writer/canonical-state";

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
  selection: CanvasSelection;
  onSelect: (next: CanvasSelection) => void;
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
  if (layerId === "headline") return "Headline · Click to edit in Left Panel";
  if (layerId === "scene-illustration")
    return "Illustration · Click to edit in Left Panel";
  if (layerId === "callout")
    return "Callout banner · Click to edit in Left Panel";
  if (layerId === "footer") return "Footer · Click to edit in Left Panel";
  const iconMatch = layerId.match(/^node-icon-(\d+)$/);
  if (iconMatch)
    return `Object / Icon ${Number(iconMatch[1]) + 1} · Click to edit color, icon & size in Left Panel`;
  const nodeMatch = layerId.match(/^node-(\d+)$/);
  if (nodeMatch)
    return `Card ${Number(nodeMatch[1]) + 1} · Click to edit in Left Panel`;
  return "Click to edit in Left Panel";
}

export function InteractiveInfographicCanvas({
  svg,
  config,
  width,
  height,
  zoom,
  selection,
  onSelect,
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

  const displayHeight = Math.round(680 * zoom);
  const aspectRatioCss = `${width} / ${height}`;

  return (
    <div className="flex flex-col">

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
                <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-white dark:bg-slate-950/90 px-1.5 py-0.5 text-[10px] font-semibold text-sky-200 shadow-sm">
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

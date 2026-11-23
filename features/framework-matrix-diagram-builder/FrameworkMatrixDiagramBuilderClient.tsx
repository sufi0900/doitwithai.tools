"use client";

import { TemplateThumbnail } from "@/features/tool-ui/InfographicArtwork";
import studioStyles from "@/features/tool-ui/visual-studio.module.css";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  GitBranch,
  Palette,
  Plus,
  Printer,
  RotateCcw,
  Sparkles,
  Trash2,
  Type,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";
import ToolRunOverlay, {
  focusToolSection,
} from "@/features/tool-ui/ToolRunOverlay";
import { PlatformBrandIcon } from "@/features/tool-ui/PlatformBrandIcon";
import {
  copyCanvasImageToClipboard,
  downloadCanvasAsEmbeddedSvg,
  downloadCanvasAsPng,
  printCanvasAsPdfPoster,
  resolveVisualTheme,
  SHARED_VISUAL_THEMES,
  type SharedVisualThemeId,
} from "@/features/tool-ui/visualCardExport";
import {
  buildDeterministicFrameworkDiagram,
  DEFAULT_FRAMEWORK_DIAGRAM_INPUT,
  type DiagramNodeItem,
  type DiagramTemplateId,
  type FrameworkDiagramInput,
  type FrameworkDiagramPack,
} from "./model";

const DIAGRAM_TEMPLATES: {
  id: DiagramTemplateId;
  label: string;
  desc: string;
}[] = [
  {
    id: "matrix-2x2",
    label: "1. 2×2 Strategy Matrix",
    desc: "Classic 4-quadrant Effort vs. Impact prioritization grid",
  },
  {
    id: "swot-4-quadrant",
    label: "2. SWOT 4-Quadrant Grid",
    desc: "Strengths, Weaknesses, Opportunities & Threats board",
  },
  {
    id: "circular-flywheel",
    label: "3. Circular Growth Flywheel",
    desc: "Central core engine surrounded by compounding stages",
  },
  {
    id: "three-pillar-house",
    label: "4. 3-Pillar Architecture",
    desc: "Roof goal supported by 3 strategic pillars & foundation",
  },
  {
    id: "hub-and-spoke",
    label: "5. Hub & Spoke Topic Map",
    desc: "Central pillar topic connected to 4–6 spoke sub-topics",
  },
  {
    id: "horizontal-workflow",
    label: "6. Process Workflow Chain",
    desc: "Step-by-step connected pipeline with directional arrows",
  },
  {
    id: "layered-pyramid",
    label: "7. 3D Layered Pyramid",
    desc: "Tiered hierarchy from foundation base to apex goal",
  },
  {
    id: "iceberg-model",
    label: "8. Surface vs. Depth Iceberg",
    desc: "Waterline split contrasting visible tactics vs. deep systems",
  },
  {
    id: "venn-overlap-3",
    label: "9. 3-Circle Venn Synergy",
    desc: "Overlapping strategic circles converging on core sweet spot",
  },
  {
    id: "staircase-maturity",
    label: "10. Ascending Maturity Steps",
    desc: "Rising diagonal maturity stages from Level 1 to Level 4",
  },
  {
    id: "honeycomb-cluster",
    label: "11. Hexagonal Ecosystem Grid",
    desc: "Interlocking geometric cells for modular frameworks",
  },
  {
    id: "bow-tie-funnel",
    label: "12. Acquisition & Expansion Funnel",
    desc: "Balanced strategic funnel from acquisition to compounding LTV",
  },
];

const QUADRANT_ACCENTS = [
  "#10B981",
  "#38BDF8",
  "#F59E0B",
  "#F43F5E",
  "#A855F7",
  "#4058d0",
];

function wrapDiagramText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = w;
      if (lines.length >= maxLines - 1) break;
    } else {
      cur = test;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines;
}

const MIN_DIAGRAM_NODES = 3;
const MAX_DIAGRAM_NODES = 6;

export default function FrameworkMatrixDiagramBuilderClient() {
  const [input, setInput] = useState<FrameworkDiagramInput>(
    DEFAULT_FRAMEWORK_DIAGRAM_INPUT,
  );
  const [aiPack, setAiPack] = useState<FrameworkDiagramPack | null>(null);
  const [nodes, setNodes] = useState<DiagramNodeItem[]>(
    () =>
      buildDeterministicFrameworkDiagram(DEFAULT_FRAMEWORK_DIAGRAM_INPUT).nodes,
  );
  const [themeId, setThemeId] = useState<SharedVisualThemeId>("royal-cobalt");
  const [customColors, setCustomColors] = useState({
    bgStart: "#0B1120",
    cardBg: "#1E293B",
    accent: "#4058d0",
    textMain: "#FFFFFF",
  });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const deterministicPack = useMemo(
    () => buildDeterministicFrameworkDiagram(input),
    [input],
  );
  const pack = aiPack || deterministicPack;
  const theme = useMemo(
    () => resolveVisualTheme(themeId, customColors),
    [themeId, customColors],
  );

  useEffect(() => {
    setNodes(pack.nodes);
  }, [pack]);

  const canAddNode = nodes.length < MAX_DIAGRAM_NODES;
  const canRemoveNode = nodes.length > MIN_DIAGRAM_NODES;

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleGenerateAiDiagram(
    overrideInput?: FrameworkDiagramInput,
  ) {
    const activeInput = overrideInput || input;
    setLoading(true);
    try {
      const res = await fetch(
        "/api/ai-tools/framework-matrix-diagram-builder",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(activeInput),
        },
      );
      const data = await res.json();
      if (data?.pack) {
        setAiPack(data.pack);
        setNodes(data.pack.nodes);
        notify("Generated AI Strategic Framework Diagram in 1 click!");
      }
      focusToolSection(resultsRef.current);
    } catch {
      notify("Rendered strategic framework diagram.");
      focusToolSection(resultsRef.current);
    } finally {
      setLoading(false);
    }
  }

  function updateNode(id: string, field: keyof DiagramNodeItem, value: string) {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [field]: value } : n)),
    );
  }

  function addNode() {
    if (!canAddNode) {
      notify("Maximum 6 framework stages/quadrants reached.");
      return;
    }
    const idx = nodes.length + 1;
    setNodes((prev) => [
      ...prev,
      {
        id: `node-${Date.now()}`,
        tag: `STAGE 0${idx}`,
        title: `Strategic Pillar #${idx}`,
        detail: "Compound repeatable execution across every distribution channel.",
      },
    ]);
    notify(`Added Stage #${idx} to diagram!`);
  }

  function removeNode(id: string) {
    if (!canRemoveNode) {
      notify("Framework diagrams require at least 3 stages/quadrants.");
      return;
    }
    setNodes((prev) => prev.filter((n) => n.id !== id));
    notify("Removed diagram stage.");
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1200;
    const H = 1200;
    canvas.width = W;
    canvas.height = H;

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, theme.bgStart);
    grad.addColorStop(1, theme.bgEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const padX = 72;
    let curY = 58;

    // Kicker Badge
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.roundRect(padX, curY, 360, 42, 21);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 18px system-ui, -apple-system, sans-serif";
    ctx.fillText("STRATEGIC FRAMEWORK & MENTAL MODEL", padX + 20, curY + 27);
    curY += 60;

    // Title
    ctx.fillStyle = theme.textMain;
    ctx.font = "900 42px system-ui, -apple-system, sans-serif";
    const tLines = wrapDiagramText(ctx, input.diagramTitle, W - padX * 2, 2);
    for (const l of tLines) {
      ctx.fillText(l, padX, curY + 38);
      curY += 50;
    }

    // Subtitle
    ctx.fillStyle = theme.textMuted;
    ctx.font = "500 22px system-ui, -apple-system, sans-serif";
    const sLines = wrapDiagramText(ctx, input.diagramSubtitle, W - padX * 2, 2);
    for (const l of sLines) {
      ctx.fillText(l, padX, curY + 22);
      curY += 30;
    }
    curY += 24;

    const bodyTop = curY;
    const bodyBottom = H - 88;
    const availH = bodyBottom - bodyTop;
    const activeNodes = nodes.slice(0, 6);

    if (
      input.template === "matrix-2x2" ||
      input.template === "swot-4-quadrant" ||
      input.template === "honeycomb-cluster"
    ) {
      const quadNodes = activeNodes.slice(0, 4);
      const axisPad = 48;
      const gridLeft = padX + axisPad;
      const gridTop = bodyTop + 10;
      const gridW = W - padX * 2 - axisPad;
      const gridH = availH - axisPad - 10;
      const gap = 24;
      const qW = Math.floor((gridW - gap) / 2);
      const qH = Math.floor((gridH - gap) / 2);

      ctx.strokeStyle = "rgba(148,163,184,0.45)";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(gridLeft + gridW / 2, gridTop);
      ctx.lineTo(gridLeft + gridW / 2, gridTop + gridH);
      ctx.moveTo(gridLeft, gridTop + gridH / 2);
      ctx.lineTo(gridLeft + gridW, gridTop + gridH / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = theme.textMuted;
      ctx.font = "800 18px system-ui, -apple-system, sans-serif";
      const xLbl = input.xAxisLabel.slice(0, 65);
      const xW = ctx.measureText(xLbl).width;
      ctx.fillText(xLbl, gridLeft + (gridW - xW) / 2, bodyBottom - 8);

      ctx.save();
      ctx.translate(padX + 18, gridTop + gridH / 2);
      ctx.rotate(-Math.PI / 2);
      const yLbl = input.yAxisLabel.slice(0, 65);
      const yW = ctx.measureText(yLbl).width;
      ctx.fillText(yLbl, -yW / 2, 0);
      ctx.restore();

      quadNodes.forEach((node, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = gridLeft + col * (qW + gap);
        const y = gridTop + row * (qH + gap);
        const accent =
          idx === 0
            ? theme.accent
            : QUADRANT_ACCENTS[idx % QUADRANT_ACCENTS.length];

        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(
          x,
          y,
          qW,
          qH,
          input.template === "honeycomb-cluster" ? 42 : 24,
        );
        ctx.fill();
        ctx.stroke();

        // Vertically center tag + title + detail inside each quadrant
        ctx.font = "800 28px system-ui, -apple-system, sans-serif";
        const ntLines = wrapDiagramText(ctx, node.title, qW - 52, 2);
        ctx.font = "500 21px system-ui, -apple-system, sans-serif";
        const ndLines = wrapDiagramText(ctx, node.detail, qW - 52, 4);
        const totalBlockH =
          38 + 18 + ntLines.length * 34 + 10 + ndLines.length * 28;
        const startBlockY = y + Math.max(22, (qH - totalBlockH) / 2);

        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.roundRect(x + 26, startBlockY, 230, 38, 12);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 17px system-ui, -apple-system, sans-serif";
        ctx.fillText(node.tag.slice(0, 22), x + 42, startBlockY + 25);

        ctx.fillStyle = theme.textMain;
        ctx.font = "800 28px system-ui, -apple-system, sans-serif";
        let ty = startBlockY + 38 + 38;
        for (const l of ntLines) {
          ctx.fillText(l, x + 26, ty);
          ty += 34;
        }

        ctx.fillStyle = theme.textMuted;
        ctx.font = "500 21px system-ui, -apple-system, sans-serif";
        ty += 4;
        for (const l of ndLines) {
          if (ty < y + qH - 16) {
            ctx.fillText(l, x + 26, ty);
            ty += 28;
          }
        }
      });
    } else if (
      input.template === "circular-flywheel" ||
      input.template === "hub-and-spoke" ||
      input.template === "venn-overlap-3"
    ) {
      const cx = W / 2;
      const cy = bodyTop + availH / 2;
      const radiusX = 355;
      const radiusY = 275;
      const cardW = 310;
      const cardH = 155;

      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();

      activeNodes.forEach((_, idx) => {
        const angle = -Math.PI / 2 + (idx * (Math.PI * 2)) / activeNodes.length;
        const nx = cx + Math.cos(angle) * radiusX;
        const ny = cy + Math.sin(angle) * radiusY;

        ctx.strokeStyle = QUADRANT_ACCENTS[idx % QUADRANT_ACCENTS.length];
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.stroke();
      });

      ctx.fillStyle = theme.accent;
      ctx.beginPath();
      ctx.arc(cx, cy, 118, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 22px system-ui, -apple-system, sans-serif";
      const coreLines = wrapDiagramText(
        ctx,
        input.centerOrCoreThesis || "Core Engine",
        190,
        3,
      );
      let coreY = cy - ((coreLines.length - 1) * 26) / 2 + 6;
      for (const l of coreLines) {
        const lw = ctx.measureText(l).width;
        ctx.fillText(l, cx - lw / 2, coreY);
        coreY += 28;
      }

      activeNodes.forEach((node, idx) => {
        const angle = -Math.PI / 2 + (idx * (Math.PI * 2)) / activeNodes.length;
        const nx = cx + Math.cos(angle) * radiusX - cardW / 2;
        const ny = cy + Math.sin(angle) * radiusY - cardH / 2;
        const accent = QUADRANT_ACCENTS[idx % QUADRANT_ACCENTS.length];

        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(nx, ny, cardW, cardH, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = accent;
        ctx.font = "900 15px system-ui, -apple-system, sans-serif";
        ctx.fillText(node.tag.slice(0, 20), nx + 18, ny + 30);

        ctx.fillStyle = theme.textMain;
        ctx.font = "800 21px system-ui, -apple-system, sans-serif";
        const tL = wrapDiagramText(ctx, node.title, cardW - 36, 1);
        ctx.fillText(tL[0] || node.title, nx + 18, ny + 58);

        ctx.fillStyle = theme.textMuted;
        ctx.font = "500 17px system-ui, -apple-system, sans-serif";
        const dL = wrapDiagramText(ctx, node.detail, cardW - 36, 3);
        let dy = ny + 86;
        for (const l of dL) {
          if (dy < ny + cardH - 12) {
            ctx.fillText(l, nx + 18, dy);
            dy += 22;
          }
        }
      });
    } else if (input.template === "three-pillar-house") {
      const totalW = W - padX * 2;
      const roofH = 110;
      const foundH = 110;
      const pillarTop = bodyTop + roofH + 22;
      const pillarH = availH - roofH - foundH - 44;
      const gap = 22;
      const pW = Math.floor((totalW - gap * 2) / 3);

      ctx.fillStyle = theme.accent;
      ctx.beginPath();
      ctx.roundRect(padX, bodyTop, totalW, roofH, 22);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 30px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        `OVERARCHING GOAL: ${input.centerOrCoreThesis.slice(0, 42)}`,
        padX + 36,
        bodyTop + 66,
      );

      activeNodes.slice(0, 3).forEach((node, idx) => {
        const x = padX + idx * (pW + gap);
        const col = QUADRANT_ACCENTS[idx % QUADRANT_ACCENTS.length];
        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = col;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, pillarTop, pW, pillarH, 22);
        ctx.fill();
        ctx.stroke();

        ctx.font = "800 26px system-ui, -apple-system, sans-serif";
        const tL = wrapDiagramText(ctx, node.title, pW - 48, 2);
        ctx.font = "500 20px system-ui, -apple-system, sans-serif";
        const dL = wrapDiagramText(ctx, node.detail, pW - 48, 6);
        const blockH = 30 + tL.length * 32 + 14 + dL.length * 28;
        const startPillarY =
          pillarTop + Math.max(28, (pillarH - blockH) / 2);

        ctx.fillStyle = col;
        ctx.font = "900 18px system-ui, -apple-system, sans-serif";
        ctx.fillText(node.tag, x + 24, startPillarY + 18);

        ctx.fillStyle = theme.textMain;
        ctx.font = "800 26px system-ui, -apple-system, sans-serif";
        let ty = startPillarY + 56;
        for (const l of tL) {
          ctx.fillText(l, x + 24, ty);
          ty += 32;
        }

        ctx.fillStyle = theme.textMuted;
        ctx.font = "500 20px system-ui, -apple-system, sans-serif";
        ty += 8;
        for (const l of dL) {
          ctx.fillText(l, x + 24, ty);
          ty += 28;
        }
      });

      const fNode = activeNodes[3] || activeNodes[0];
      const fTop = pillarTop + pillarH + 22;
      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(padX, fTop, totalW, foundH, 22);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = theme.textMain;
      ctx.font = "800 24px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        `FOUNDATION: ${fNode.title} — ${fNode.detail.slice(0, 58)}`,
        padX + 32,
        fTop + 64,
      );
    } else {
      // Layered Pyramid, Iceberg, Staircase, Bow-Tie, or Process Workflow Chain — Vertically Centered
      const count = activeNodes.length;
      const rowGap = 16;
      const rowH = Math.min(
        136,
        Math.floor((availH - rowGap * (count - 1)) / count),
      );
      const totalRowsH = count * rowH + (count - 1) * rowGap;
      const startRowsY = bodyTop + Math.max(0, (availH - totalRowsH) / 2);
      const maxW = W - padX * 2;

      activeNodes.forEach((node, idx) => {
        const y = startRowsY + idx * (rowH + rowGap);
        let barW = maxW;
        let x = padX;
        if (input.template === "layered-pyramid") {
          barW = Math.floor(
            maxW * (0.52 + (0.48 * idx) / Math.max(1, count - 1)),
          );
          x = Math.floor((W - barW) / 2);
        } else if (input.template === "staircase-maturity") {
          barW = Math.floor(maxW * 0.76);
          x = padX + Math.floor(((maxW - barW) * idx) / Math.max(1, count - 1));
        }
        const col =
          idx === 0
            ? theme.accent
            : QUADRANT_ACCENTS[idx % QUADRANT_ACCENTS.length];

        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, rowH, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.roundRect(x + 22, y + 20, 185, 38, 12);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 16px system-ui, -apple-system, sans-serif";
        ctx.fillText(node.tag.slice(0, 18), x + 36, y + 45);

        ctx.fillStyle = theme.textMain;
        ctx.font = "800 25px system-ui, -apple-system, sans-serif";
        ctx.fillText(node.title.slice(0, 42), x + 226, y + 46);

        ctx.fillStyle = theme.textMuted;
        ctx.font = "500 19px system-ui, -apple-system, sans-serif";
        const dLines = wrapDiagramText(ctx, node.detail, barW - 48, 2);
        let dy = y + 82;
        for (const l of dLines) {
          if (dy < y + rowH - 10) {
            ctx.fillText(l, x + 24, dy);
            dy += 24;
          }
        }
      });
    }

    // Footer Bar
    ctx.fillStyle = "rgba(15, 23, 42, 0.74)";
    ctx.fillRect(0, H - 72, W, 72);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 22px system-ui, -apple-system, sans-serif";
    ctx.fillText(input.brandFooter || "doitwithai.tools", padX, H - 28);
    ctx.fillStyle = theme.accent;
    ctx.font = "700 19px system-ui, -apple-system, sans-serif";
    ctx.fillText("Save & Share Strategic Framework ★", W - padX - 315, H - 28);
  }, [input, nodes, theme]);

  return (
    <section
      aria-label="2x2 Strategy Matrix and Framework Diagram Studio"
      className={`${studioStyles.studio} mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6`}
    >
      <ToolRunOverlay
        active={loading}
        title="Synthesizing Strategic Framework & Rendering Diagram..."
        description="Mapping your content into 12 executive diagram layouts with PNG, SVG, and PDF export."
      />

      {/* 1-CLICK ARTICLE URL EXTRACTION */}
      <UrlArticleExtractorBar
        label="Option 1: Paste Any Article URL to Auto-Build a 2×2 Matrix, SWOT, or Flywheel Diagram in 1 Click"
        placeholder="Paste a blog or strategy URL to extract pillars & render a diagram..."
        buttonLabel="Extract & Build Diagram (1-Click)"
        onExtracted={(data) => {
          setAiPack(null);
          const cleanTitle = (data.title || input.diagramTitle)
            .replace(/\s*\|\s*[^|]+$/g, "")
            .trim();
          let domain = "doitwithai.tools";
          try {
            domain = new URL(data.url).hostname.replace(/^www\./, "");
          } catch {}
          const nextInput: FrameworkDiagramInput = {
            ...input,
            diagramTitle: cleanTitle,
            diagramSubtitle: data.description || input.diagramSubtitle,
            centerOrCoreThesis: data.focusKeyword || cleanTitle.slice(0, 36),
            sourceNotes:
              (data.keyTakeaways || []).join("\n") ||
              data.cleanText.slice(0, 1200) ||
              input.sourceNotes,
            brandFooter: domain,
          };
          setInput(nextInput);
          void handleGenerateAiDiagram(nextInput);
        }}
        onSelectSubTopic={(sub) => {
          setAiPack(null);
          const nextInput: FrameworkDiagramInput = {
            ...input,
            diagramTitle: sub.title,
            diagramSubtitle: sub.summary,
            centerOrCoreThesis: sub.title.slice(0, 36),
            sourceNotes: sub.content,
          };
          setInput(nextInput);
          void handleGenerateAiDiagram(nextInput);
        }}
      />

      <div
        ref={resultsRef}
        tabIndex={-1}
        className="shadow-xs space-y-5 rounded-3xl border border-slate-200 bg-white p-5 focus:outline-none dark:border-slate-800 dark:bg-[#111827] sm:p-6"
      >
        {toast && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
          >
            <CheckCircle2 size={15} />
            <span>{toast}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <PlatformBrandIcon brand="matrix-diagram" size={36} />
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#4058d0]">
                <GitBranch size={14} /> 12 Framework &amp; Matrix Templates · 10
                Themes + Custom Pickers
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Strategic Framework &amp; Diagram Studio (1200×1200 HD)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleGenerateAiDiagram()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#4058d0] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#3452d1]"
          >
            <Sparkles size={14} />
            {loading ? "Building Diagram…" : "Generate AI Diagram (1-Click)"}
          </button>
        </div>

        {/* OPEN BY DEFAULT SO ALL 12 DIAGRAM TEMPLATES ARE IMMEDIATELY VISIBLE */}
        <details open className="rounded-2xl border border-slate-400/30 p-4">
          <summary className="cursor-pointer font-extrabold text-slate-900 dark:text-white">
            Choose a Framework or Matrix Template (12 Executive Layouts)
          </summary>
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {DIAGRAM_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() =>
                    setInput((prev) => ({ ...prev, template: tpl.id }))
                  }
                  className={`rounded-xl border p-2.5 text-left transition ${
                    input.template === tpl.id
                      ? "border-[#4058d0] bg-[#4058d0]/10 ring-1 ring-[#4058d0]"
                      : "border-slate-200 bg-slate-50/70 hover:border-[#3452d1] dark:border-slate-800 dark:bg-slate-900/60"
                  }`}
                >
                  <TemplateThumbnail id={tpl.id} category="mindmap" />
                  <strong className="mt-1 block text-xs font-extrabold text-slate-900 dark:text-white">
                    {tpl.label}
                  </strong>
                  <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                    {tpl.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </details>

        {/* 10 Color Themes + Custom Brand Color Pickers */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">
              Designer Color Theme (10 Presets + Custom)
            </label>
            <select
              value={themeId}
              onChange={(e) =>
                setThemeId(e.target.value as SharedVisualThemeId)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
            >
              {Object.values(SHARED_VISUAL_THEMES).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
              <option value="custom-brand">
                🎨 Custom Brand Colors (Use Pickers →)
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Palette size={13} className="text-[#4058d0]" /> Live Custom Color
              Pickers
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">
              <label className="flex items-center gap-1 text-[11px] font-bold">
                <input
                  type="color"
                  value={theme.bgStart}
                  onChange={(e) => {
                    setThemeId("custom-brand");
                    setCustomColors((p) => ({ ...p, bgStart: e.target.value }));
                  }}
                  className="h-6 w-6 cursor-pointer border-0 bg-transparent"
                />
                BG
              </label>
              <label className="flex items-center gap-1 text-[11px] font-bold">
                <input
                  type="color"
                  value={
                    theme.cardBg.startsWith("#") ? theme.cardBg : "#1E293B"
                  }
                  onChange={(e) => {
                    setThemeId("custom-brand");
                    setCustomColors((p) => ({ ...p, cardBg: e.target.value }));
                  }}
                  className="h-6 w-6 cursor-pointer border-0 bg-transparent"
                />
                Card
              </label>
              <label className="flex items-center gap-1 text-[11px] font-bold">
                <input
                  type="color"
                  value={theme.accent}
                  onChange={(e) => {
                    setThemeId("custom-brand");
                    setCustomColors((p) => ({ ...p, accent: e.target.value }));
                  }}
                  className="h-6 w-6 cursor-pointer border-0 bg-transparent"
                />
                Accent
              </label>
              <label className="flex items-center gap-1 text-[11px] font-bold">
                <input
                  type="color"
                  value={theme.textMain}
                  onChange={(e) => {
                    setThemeId("custom-brand");
                    setCustomColors((p) => ({
                      ...p,
                      textMain: e.target.value,
                    }));
                  }}
                  className="h-6 w-6 cursor-pointer border-0 bg-transparent"
                />
                Text
              </label>
            </div>
          </div>
        </div>

        {/* 2-COLUMN WORKSPACE: LEFT = QUADRANT / NODE EDITOR, RIGHT = ZOOMABLE DIAGRAM CANVAS */}
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,0.7fr)_minmax(0,1.3fr)]">
          <div className="space-y-4">
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span>Diagram Headline</span>
                  <span className="text-[10px] text-[#4058d0]">
                    {input.diagramTitle.length}/72c (~80% optimal)
                  </span>
                </label>
                <input
                  type="text"
                  value={input.diagramTitle}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      diagramTitle: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Central Core Thesis / Goal
                  </label>
                  <input
                    type="text"
                    value={input.centerOrCoreThesis}
                    onChange={(e) =>
                      setInput((prev) => ({
                        ...prev,
                        centerOrCoreThesis: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Brand Footer
                  </label>
                  <input
                    type="text"
                    value={input.brandFooter}
                    onChange={(e) =>
                      setInput((prev) => ({
                        ...prev,
                        brandFooter: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#4058d0]">
                  Edit Quadrants / Stages ({nodes.length} / {MAX_DIAGRAM_NODES})
                </h3>
                <button
                  type="button"
                  onClick={addNode}
                  disabled={!canAddNode}
                  style={{ cursor: canAddNode ? "pointer" : "not-allowed" }}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#3452d1] px-2.5 py-1 text-xs font-extrabold text-white disabled:opacity-45"
                >
                  <Plus size={12} /> Add Stage
                </button>
              </div>

              <div className="max-h-[450px] space-y-2.5 overflow-y-auto pr-1">
                {nodes.map((node, i) => (
                  <div
                    key={node.id}
                    className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                        Stage / Quadrant #{i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeNode(node.id)}
                        disabled={!canRemoveNode}
                        style={{
                          backgroundColor: "#e11d48",
                          cursor: canRemoveNode ? "pointer" : "not-allowed",
                        }}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white disabled:opacity-45"
                        title={
                          canRemoveNode
                            ? "Remove this stage"
                            : "Minimum 3 stages required"
                        }
                      >
                        <Trash2 size={11} /> Remove
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div>
                        <input
                          type="text"
                          value={node.tag}
                          onChange={(e) =>
                            updateNode(node.id, "tag", e.target.value)
                          }
                          placeholder={`Node #${i + 1} Tag`}
                          className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-extrabold text-[#4058d0] dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={node.title}
                          onChange={(e) =>
                            updateNode(node.id, "title", e.target.value)
                          }
                          placeholder="Quadrant / Stage Title"
                          className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={node.detail}
                      onChange={(e) =>
                        updateNode(node.id, "detail", e.target.value)
                      }
                      className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: 1200x1200 DIAGRAM CANVAS WITH PERSISTENT TOP BAR + DIRECT INPUT + BOTTOM ZOOM */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-[#070b14] shadow-xl dark:border-slate-700">
              {/* Persistent Top Export Bar */}
              <div
                data-export-toolbar
                className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2.5"
              >
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-white">
                  1200×1200 Diagram Export
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      downloadCanvasAsPng(
                        canvasRef.current,
                        `framework-diagram-${input.template}.png`,
                        () => notify("Downloaded 1200×1200 Diagram (.PNG)!"),
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-xl bg-[#4058d0] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[#3452d1]"
                  >
                    <Download size={13} />
                    Download PNG
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadCanvasAsEmbeddedSvg(
                        canvasRef.current,
                        input.diagramTitle,
                        `framework-diagram-${input.template}.svg`,
                        () => notify("Downloaded Diagram (.SVG)!"),
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-xl bg-[#3452d1] px-2.5 py-1.5 text-xs font-extrabold text-white hover:bg-[#2842b5]"
                  >
                    <FileCode2 size={13} />
                    SVG
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      printCanvasAsPdfPoster(
                        canvasRef.current,
                        input.diagramTitle,
                        () => notify("Opened PDF Export Dialog!"),
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1.5 text-xs font-extrabold text-white hover:bg-emerald-500"
                  >
                    <Printer size={13} />
                    PDF
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      copyCanvasImageToClipboard(canvasRef.current, () =>
                        notify("Copied Diagram Image to Clipboard!"),
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-white/20"
                  >
                    <Copy size={12} />
                    Copy
                  </button>
                </div>
              </div>

              {/* Direct In-Canvas Headline Editor Bar */}
              <div className="flex items-center gap-2 border-b border-slate-800 bg-[#0d1424] px-4 py-2 text-xs text-white">
                <span className="inline-flex shrink-0 items-center gap-1 font-extrabold text-[#9aabff]">
                  <Type size={13} /> Diagram Title:
                </span>
                <input
                  type="text"
                  value={input.diagramTitle}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      diagramTitle: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-white focus:border-[#5271ff] focus:outline-none"
                />
              </div>

              {/* Zoomable Canvas Viewport */}
              <div
                onWheel={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    setZoomLevel((z) =>
                      Math.min(
                        2.25,
                        Math.max(
                          0.6,
                          +(z + (e.deltaY < 0 ? 0.12 : -0.12)).toFixed(2),
                        ),
                      ),
                    );
                  }
                }}
                className="overflow-auto p-3 sm:p-5"
              >
                <div
                  style={{
                    width:
                      zoomLevel === 1
                        ? "100%"
                        : `${Math.round(zoomLevel * 100)}%`,
                    maxWidth: zoomLevel === 1 ? "620px" : "none",
                    transition: "width 0.16s ease-out",
                  }}
                  className="mx-auto"
                >
                  <canvas
                    ref={canvasRef}
                    className="mx-auto block aspect-square h-auto w-full rounded-xl shadow-2xl"
                  />
                </div>
              </div>

              {/* Bottom Zoom Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-[#0d1424] px-4 py-2 text-xs text-slate-300">
                <span className="text-[11px] text-slate-400">
                  Ctrl + Scroll to zoom
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setZoomLevel((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))
                    }
                    className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-bold text-white hover:bg-slate-700"
                  >
                    <ZoomOut size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold ${
                      zoomLevel === 1
                        ? "bg-[#4058d0] text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    Auto Fit ({Math.round(zoomLevel * 100)}%)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setZoomLevel((z) =>
                        Math.min(2.25, +(z + 0.15).toFixed(2)),
                      )
                    }
                    className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-bold text-white hover:bg-slate-700"
                  >
                    <ZoomIn size={12} />
                  </button>
                  {[1.35, 1.75].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setZoomLevel(preset)}
                      className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                        Math.abs(zoomLevel - preset) < 0.04
                          ? "bg-[#3452d1] text-white"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {Math.round(preset * 100)}%
                    </button>
                  ))}
                  {zoomLevel !== 1 && (
                    <button
                      type="button"
                      onClick={() => setZoomLevel(1)}
                      className="rounded-lg border border-slate-700 px-2 py-1 text-[11px] font-bold text-slate-300"
                    >
                      <RotateCcw size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(pack.socialPostText);
                notify("Copied Strategic Framework Social Caption!");
              }}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <Copy size={14} />
              Copy Companion Framework Social Caption
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

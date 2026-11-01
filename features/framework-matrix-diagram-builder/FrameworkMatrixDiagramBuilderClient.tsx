"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  GitBranch,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";
import {
  focusToolSection,
  ToolRunOverlay,
} from "@/features/tool-ui/ToolRunOverlay";
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
    desc: "Central core engine surrounded by connected compounding stages",
  },
  {
    id: "three-pillar-house",
    label: "4. 3-Pillar Architecture",
    desc: "Overarching roof goal supported by 3 strategic pillars & foundation",
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
];

const QUADRANT_ACCENTS = [
  "#10B981",
  "#38BDF8",
  "#F59E0B",
  "#F43F5E",
  "#A855F7",
  "#FF6B35",
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

export default function FrameworkMatrixDiagramBuilderClient() {
  const [input, setInput] = useState<FrameworkDiagramInput>(
    DEFAULT_FRAMEWORK_DIAGRAM_INPUT,
  );
  const [aiPack, setAiPack] = useState<FrameworkDiagramPack | null>(null);
  const [nodes, setNodes] = useState<DiagramNodeItem[]>(() =>
    buildDeterministicFrameworkDiagram(DEFAULT_FRAMEWORK_DIAGRAM_INPUT).nodes,
  );
  const [theme, setTheme] = useState<"dark-slate" | "clean-light" | "violet">(
    "dark-slate",
  );
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const deterministicPack = useMemo(
    () => buildDeterministicFrameworkDiagram(input),
    [input],
  );
  const pack = aiPack || deterministicPack;

  useEffect(() => {
    setNodes(pack.nodes);
  }, [pack]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  async function handleGenerateAiDiagram() {
    setLoading(true);
    try {
      const res = await fetch(
        "/api/ai-tools/framework-matrix-diagram-builder",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      const data = await res.json();
      if (data?.pack) {
        setAiPack(data.pack);
        setNodes(data.pack.nodes);
        notify("Generated AI Strategic Framework Diagram!");
      }
      focusToolSection(resultsRef.current);
    } catch {
      notify("Updated strategic framework diagram.");
      focusToolSection(resultsRef.current);
    } finally {
      setLoading(false);
    }
  }

  function updateNode(
    id: string,
    field: keyof DiagramNodeItem,
    value: string,
  ) {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [field]: value } : n)),
    );
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

    const isLight = theme === "clean-light";
    const bgStart =
      theme === "clean-light"
        ? "#F8FAFC"
        : theme === "violet"
          ? "#170F2E"
          : "#0B1120";
    const bgEnd =
      theme === "clean-light"
        ? "#E2E8F0"
        : theme === "violet"
          ? "#2E1065"
          : "#1E293B";
    const textMain = isLight ? "#0F172A" : "#FFFFFF";
    const textMuted = isLight ? "#475569" : "#CBD5E1";
    const cardBg = isLight ? "#FFFFFF" : "rgba(30, 41, 59, 0.88)";
    const cardBorder = isLight ? "#CBD5E1" : "rgba(148, 163, 184, 0.28)";

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, bgStart);
    grad.addColorStop(1, bgEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const padX = 72;
    let curY = 58;

    // Kicker Badge
    ctx.fillStyle = "#7C3AED";
    ctx.beginPath();
    ctx.roundRect(padX, curY, 340, 40, 20);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 18px system-ui, -apple-system, sans-serif";
    ctx.fillText("STRATEGIC FRAMEWORK & MENTAL MODEL", padX + 20, curY + 26);
    curY += 60;

    // Title
    ctx.fillStyle = textMain;
    ctx.font = "900 42px system-ui, -apple-system, sans-serif";
    const tLines = wrapDiagramText(ctx, input.diagramTitle, W - padX * 2, 2);
    for (const l of tLines) {
      ctx.fillText(l, padX, curY + 38);
      curY += 50;
    }

    // Subtitle
    ctx.fillStyle = textMuted;
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
      input.template === "swot-4-quadrant"
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

      // Draw Central Crosshair Axis Lines
      ctx.strokeStyle = isLight ? "#94A3B8" : "rgba(148,163,184,0.45)";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(gridLeft + gridW / 2, gridTop);
      ctx.lineTo(gridLeft + gridW / 2, gridTop + gridH);
      ctx.moveTo(gridLeft, gridTop + gridH / 2);
      ctx.lineTo(gridLeft + gridW, gridTop + gridH / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // X-Axis Label at Bottom
      ctx.fillStyle = textMuted;
      ctx.font = "800 18px system-ui, -apple-system, sans-serif";
      const xLbl = input.xAxisLabel.slice(0, 65);
      const xW = ctx.measureText(xLbl).width;
      ctx.fillText(xLbl, gridLeft + (gridW - xW) / 2, bodyBottom - 8);

      // Y-Axis Label Rotated on Left
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
        const accent = QUADRANT_ACCENTS[idx % QUADRANT_ACCENTS.length];

        ctx.fillStyle = cardBg;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, qW, qH, 24);
        ctx.fill();
        ctx.stroke();

        // Tag Pill
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.roundRect(x + 26, y + 24, 230, 38, 12);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 17px system-ui, -apple-system, sans-serif";
        ctx.fillText(node.tag.slice(0, 22), x + 42, y + 49);

        // Node Title
        ctx.fillStyle = textMain;
        ctx.font = "800 28px system-ui, -apple-system, sans-serif";
        const ntLines = wrapDiagramText(ctx, node.title, qW - 52, 2);
        let ty = y + 102;
        for (const l of ntLines) {
          ctx.fillText(l, x + 26, ty);
          ty += 34;
        }

        // Node Detail
        ctx.fillStyle = textMuted;
        ctx.font = "500 21px system-ui, -apple-system, sans-serif";
        const ndLines = wrapDiagramText(ctx, node.detail, qW - 52, 5);
        ty += 8;
        for (const l of ndLines) {
          if (ty < y + qH - 18) {
            ctx.fillText(l, x + 26, ty);
            ty += 28;
          }
        }
      });
    } else if (
      input.template === "circular-flywheel" ||
      input.template === "hub-and-spoke"
    ) {
      // Central Core Hub + Orbiting Spoke Cards
      const cx = W / 2;
      const cy = bodyTop + availH / 2;
      const radiusX = 355;
      const radiusY = 275;
      const cardW = 310;
      const cardH = 155;

      // Connecting Spoke Lines & Orbit Ring
      ctx.strokeStyle = isLight ? "#CBD5E1" : "rgba(124, 58, 237, 0.45)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();

      activeNodes.forEach((node, idx) => {
        const angle =
          -Math.PI / 2 + (idx * (Math.PI * 2)) / activeNodes.length;
        const nx = cx + Math.cos(angle) * radiusX;
        const ny = cy + Math.sin(angle) * radiusY;

        ctx.strokeStyle = QUADRANT_ACCENTS[idx % QUADRANT_ACCENTS.length];
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.stroke();
      });

      // Center Core Circle
      ctx.fillStyle = "#7C3AED";
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

      // Draw Orbiting Cards
      activeNodes.forEach((node, idx) => {
        const angle =
          -Math.PI / 2 + (idx * (Math.PI * 2)) / activeNodes.length;
        const nx = cx + Math.cos(angle) * radiusX - cardW / 2;
        const ny = cy + Math.sin(angle) * radiusY - cardH / 2;
        const accent = QUADRANT_ACCENTS[idx % QUADRANT_ACCENTS.length];

        ctx.fillStyle = cardBg;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(nx, ny, cardW, cardH, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = accent;
        ctx.font = "900 15px system-ui, -apple-system, sans-serif";
        ctx.fillText(node.tag.slice(0, 20), nx + 18, ny + 28);

        ctx.fillStyle = textMain;
        ctx.font = "800 21px system-ui, -apple-system, sans-serif";
        const tL = wrapDiagramText(ctx, node.title, cardW - 36, 1);
        ctx.fillText(tL[0] || node.title, nx + 18, ny + 56);

        ctx.fillStyle = textMuted;
        ctx.font = "500 17px system-ui, -apple-system, sans-serif";
        const dL = wrapDiagramText(ctx, node.detail, cardW - 36, 3);
        let dy = ny + 84;
        for (const l of dL) {
          if (dy < ny + cardH - 12) {
            ctx.fillText(l, nx + 18, dy);
            dy += 22;
          }
        }
      });
    } else if (input.template === "three-pillar-house") {
      // Roof Banner + 3 Vertical Pillars + Foundation Bar
      const totalW = W - padX * 2;
      const roofH = 110;
      const foundH = 110;
      const pillarTop = bodyTop + roofH + 22;
      const pillarH = availH - roofH - foundH - 44;

      // Roof Goal
      ctx.fillStyle = "#7C3AED";
      ctx.beginPath();
      ctx.roundRect(padX, bodyTop, totalW, roofH, 22);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 20px system-ui, -apple-system, sans-serif";
      ctx.fillText("NORTH STAR ROOF GOAL / THESIS", padX + 28, bodyTop + 40);
      ctx.font = "800 28px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        (input.centerOrCoreThesis || input.diagramTitle).slice(0, 52),
        padX + 28,
        bodyTop + 80,
      );

      // 3 Vertical Pillars
      const gap = 22;
      const pW = Math.floor((totalW - gap * 2) / 3);
      activeNodes.slice(0, 3).forEach((node, idx) => {
        const x = padX + idx * (pW + gap);
        const accent = QUADRANT_ACCENTS[idx];

        ctx.fillStyle = cardBg;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, pillarTop, pW, pillarH, 22);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.roundRect(x + 22, pillarTop + 24, 150, 36, 10);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 16px system-ui, -apple-system, sans-serif";
        ctx.fillText(`PILLAR 0${idx + 1}`, x + 42, pillarTop + 48);

        ctx.fillStyle = textMain;
        ctx.font = "800 26px system-ui, -apple-system, sans-serif";
        const tl = wrapDiagramText(ctx, node.title, pW - 44, 3);
        let ty = pillarTop + 98;
        for (const l of tl) {
          ctx.fillText(l, x + 22, ty);
          ty += 32;
        }

        ctx.fillStyle = textMuted;
        ctx.font = "500 20px system-ui, -apple-system, sans-serif";
        const dl = wrapDiagramText(ctx, node.detail, pW - 44, 7);
        ty += 12;
        for (const l of dl) {
          if (ty < pillarTop + pillarH - 20) {
            ctx.fillText(l, x + 22, ty);
            ty += 28;
          }
        }
      });

      // Foundation Bar
      const foundNode = activeNodes[3] || activeNodes[0];
      const foundY = pillarTop + pillarH + 22;
      ctx.fillStyle = cardBg;
      ctx.strokeStyle = "#FF6B35";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(padX, foundY, totalW, foundH, 22);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#FF6B35";
      ctx.font = "900 18px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        `FOUNDATION LAYER · ${(foundNode?.title || "Core Infrastructure").toUpperCase()}`,
        padX + 28,
        foundY + 40,
      );
      ctx.fillStyle = textMain;
      ctx.font = "500 21px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        (foundNode?.detail || "").slice(0, 82),
        padX + 28,
        foundY + 78,
      );
    } else {
      // Horizontal / Zigzag Process Workflow Chain
      const cols = 2;
      const rows = Math.ceil(activeNodes.length / cols);
      const gap = 28;
      const cardW = Math.floor((W - padX * 2 - gap) / cols);
      const cardH = Math.floor((availH - gap * (rows - 1)) / rows);

      activeNodes.forEach((node, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = padX + col * (cardW + gap);
        const y = bodyTop + row * (cardH + gap);
        const accent = QUADRANT_ACCENTS[idx % QUADRANT_ACCENTS.length];

        ctx.fillStyle = cardBg;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 22);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = accent;
        ctx.font = "900 20px system-ui, -apple-system, sans-serif";
        ctx.fillText(`STEP 0${idx + 1} →`, x + 26, y + 42);

        ctx.fillStyle = textMain;
        ctx.font = "800 26px system-ui, -apple-system, sans-serif";
        const tl = wrapDiagramText(ctx, node.title, cardW - 52, 2);
        let ty = y + 80;
        for (const l of tl) {
          ctx.fillText(l, x + 26, ty);
          ty += 32;
        }

        ctx.fillStyle = textMuted;
        ctx.font = "500 20px system-ui, -apple-system, sans-serif";
        const dl = wrapDiagramText(ctx, node.detail, cardW - 52, 3);
        ty += 8;
        for (const l of dl) {
          if (ty < y + cardH - 16) {
            ctx.fillText(l, x + 26, ty);
            ty += 26;
          }
        }
      });
    }

    // Footer Bar
    ctx.fillStyle = "rgba(15, 23, 42, 0.72)";
    ctx.fillRect(0, H - 76, W, 76);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 22px system-ui, -apple-system, sans-serif";
    ctx.fillText(input.brandFooter || "doitwithai.tools", padX, H - 30);

    ctx.fillStyle = "#A855F7";
    ctx.font = "800 20px system-ui, -apple-system, sans-serif";
    ctx.fillText("Framework & Matrix Studio · 1200×1200 HD", W - padX - 390, H - 30);
  }, [input, nodes, theme]);

  function downloadDiagramPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `framework-diagram-${input.template}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
    notify("Downloaded 1200×1200 Strategic Diagram (.PNG)!");
  }

  function downloadDiagramAndCaptionPackage() {
    downloadDiagramPng();
    navigator.clipboard.writeText(pack.socialPostText);
    const blob = new Blob([pack.socialPostText], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "framework-diagram-caption.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded Diagram PNG + Caption TXT (and copied caption)!");
  }

  return (
    <section
      aria-label="2x2 Strategy Matrix, SWOT, Flywheel and Diagram Studio"
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6 space-y-6"
    >
      <ToolRunOverlay
        open={loading}
        title="Mapping Content Into Strategic Framework Diagram..."
        subtitle="Structuring quadrants, flywheel stages, and architecture pillars onto a 1200×1200 visual board."
      />

      <UrlArticleExtractorBar
        label="Option 1: Fetch Any Article or Strategy Guide URL to Auto-Build a 2×2 Matrix, SWOT, or Flywheel"
        placeholder="Paste an article URL to extract sub-topics & map them into a visual diagram..."
        onExtracted={(data) => {
          setAiPack(null);
          const cleanTitle = (data.title || input.diagramTitle)
            .replace(/\s*\|\s*[^|]+$/g, "")
            .trim();
          const lines =
            data.subTopics?.length >= 3
              ? data.subTopics
                  .slice(0, 6)
                  .map((s) => `${s.title}: ${s.summary}`)
                  .join("\n")
              : (data.keyTakeaways || []).join("\n") || input.sourceNotes;
          setInput((prev) => ({
            ...prev,
            diagramTitle: cleanTitle,
            diagramSubtitle: data.description || prev.diagramSubtitle,
            centerOrCoreThesis: cleanTitle.slice(0, 38),
            sourceNotes: lines,
          }));
          notify(`Mapped "${cleanTitle}" into framework diagram!`);
          focusToolSection(resultsRef.current);
        }}
        onSelectSubTopic={(sub) => {
          setAiPack(null);
          setInput((prev) => ({
            ...prev,
            diagramTitle: sub.title,
            centerOrCoreThesis: sub.title.slice(0, 38),
            sourceNotes: sub.content,
          }));
          notify(`Focused diagram on sub-topic: "${sub.title}"!`);
          focusToolSection(resultsRef.current);
        }}
      />

      {toast && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 size={15} />
          <span>{toast}</span>
        </div>
      )}

      <div
        ref={resultsRef}
        tabIndex={-1}
        className="rounded-2xl border-2 border-purple-500/25 bg-white p-5 shadow-xs dark:border-purple-500/35 dark:bg-[#111827] sm:p-6 space-y-6 focus:outline-none"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              <GitBranch size={14} />6 Built-In Editable Strategy &amp;
              Diagram Templates
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              2×2 Matrix, SWOT, Flywheel &amp; Architecture Diagram Studio
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleGenerateAiDiagram}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-purple-700"
            >
              <Sparkles size={14} />
              AI Generate Framework
            </button>
            <button
              type="button"
              onClick={downloadDiagramAndCaptionPackage}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#ff6b35] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#e85d2a]"
            >
              <PackageCheck size={15} />
              Download Diagram + Caption Package
            </button>
          </div>
        </div>

        {/* 6 Diagram Template Buttons */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DIAGRAM_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() =>
                setInput((prev) => ({ ...prev, template: tpl.id }))
              }
              className={`rounded-xl border p-3 text-left transition ${
                input.template === tpl.id
                  ? "border-purple-600 bg-purple-600/10 dark:border-purple-400 dark:bg-purple-500/20"
                  : "border-slate-200 bg-slate-50/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60"
              }`}
            >
              <strong className="block text-xs font-extrabold text-slate-900 dark:text-white">
                {tpl.label}
              </strong>
              <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                {tpl.desc}
              </span>
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-start">
          {/* LEFT: DIAGRAM HEADERS, AXES & QUADRANT/NODE EDITOR */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Visual Color Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) =>
                      setTheme(
                        e.target.value as
                          | "dark-slate"
                          | "clean-light"
                          | "violet",
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="dark-slate">Executive Dark Slate</option>
                    <option value="clean-light">Editorial Clean Light</option>
                    <option value="violet">SaaS Deep Violet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Central Hub / Roof Thesis
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
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Diagram Headline
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
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              {input.template === "matrix-2x2" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500">
                      X-Axis Label (Bottom)
                    </label>
                    <input
                      type="text"
                      value={input.xAxisLabel}
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          xAxisLabel: e.target.value,
                        }))
                      }
                      className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500">
                      Y-Axis Label (Left)
                    </label>
                    <input
                      type="text"
                      value={input.yAxisLabel}
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          yAxisLabel: e.target.value,
                        }))
                      }
                      className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5 dark:border-slate-800 dark:bg-slate-900/60 max-h-[450px] overflow-y-auto">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Edit Quadrants / Flywheel Stages ({nodes.length})
              </h3>
              {nodes.map((node, i) => (
                <div
                  key={node.id}
                  className="rounded-lg border border-slate-200 bg-white p-3 space-y-2 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div>
                      <input
                        type="text"
                        value={node.tag}
                        onChange={(e) =>
                          updateNode(node.id, "tag", e.target.value)
                        }
                        placeholder={`Node #${i + 1} Tag`}
                        className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-extrabold text-purple-600 dark:border-slate-700 dark:bg-slate-900"
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

          {/* RIGHT: LIVE 1200x1200 DIAGRAM CANVAS */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-slate-950 p-2 shadow-lg dark:border-slate-700">
              <canvas
                ref={canvasRef}
                className="mx-auto block aspect-square w-full h-auto rounded-xl"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadDiagramPng}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-slate-800 dark:bg-slate-800"
              >
                <Download size={14} />
                Download 1200×1200 Diagram (.PNG)
              </button>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(pack.socialPostText);
                  notify("Copied Framework Post Caption!");
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <Copy size={14} />
                Copy Framework Caption
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

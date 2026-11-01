"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Code2,
  Copy,
  Download,
  FileCode2,
  Layers,
  Palette,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";

export type InfographicTemplateId =
  | "step-roadmap"
  | "comparison-versus"
  | "stat-bento-grid"
  | "timeline-journey"
  | "dos-and-donts"
  | "pyramid-funnel"
  | "numbered-checklist"
  | "hub-anatomy";

export type InfographicAspectRatio =
  | "vertical-poster" // 900 x 1800 (1:2 Long Infographic)
  | "portrait-social" // 1080 x 1350 (4:5 LinkedIn / Instagram)
  | "pinterest-tall" // 1000 x 1500 (2:3 Pinterest)
  | "square-card"; // 1080 x 1080 (1:1 Universal)

export type InfographicColorPaletteId =
  | "navy-orange"
  | "emerald-slate"
  | "editorial-light"
  | "royal-indigo"
  | "terracotta-cream"
  | "cyber-violet";

export interface InfographicNodeItem {
  id: string;
  badge: string;
  title: string;
  body: string;
  metricValue?: string;
  compareRight?: string;
}

export interface InfographicColorPalette {
  id: InfographicColorPaletteId;
  name: string;
  bgStart: string;
  bgEnd: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentSoft: string;
  badgeText: string;
}

export const INFOGRAPHIC_PALETTES: InfographicColorPalette[] = [
  {
    id: "navy-orange",
    name: "Navy & Vibrant Orange",
    bgStart: "#0B1120",
    bgEnd: "#1E293B",
    cardBg: "rgba(30, 41, 59, 0.88)",
    cardBorder: "rgba(148, 163, 184, 0.25)",
    textPrimary: "#FFFFFF",
    textSecondary: "#CBD5E1",
    accent: "#FF6B35",
    accentSoft: "rgba(255, 107, 53, 0.18)",
    badgeText: "#FFFFFF",
  },
  {
    id: "emerald-slate",
    name: "Executive Emerald & Slate",
    bgStart: "#052E24",
    bgEnd: "#0F172A",
    cardBg: "rgba(15, 23, 42, 0.85)",
    cardBorder: "rgba(52, 211, 153, 0.28)",
    textPrimary: "#F8FAFC",
    textSecondary: "#A7F3D0",
    accent: "#10B981",
    accentSoft: "rgba(16, 185, 129, 0.2)",
    badgeText: "#052E24",
  },
  {
    id: "editorial-light",
    name: "Clean Editorial Light",
    bgStart: "#F8FAFC",
    bgEnd: "#EEF2FF",
    cardBg: "#FFFFFF",
    cardBorder: "#CBD5E1",
    textPrimary: "#0F172A",
    textSecondary: "#334155",
    accent: "#3452D1",
    accentSoft: "#DBEAFE",
    badgeText: "#FFFFFF",
  },
  {
    id: "royal-indigo",
    name: "Royal Blue & Sky",
    bgStart: "#0F172A",
    bgEnd: "#1E3A8A",
    cardBg: "rgba(15, 23, 42, 0.82)",
    cardBorder: "rgba(96, 165, 250, 0.3)",
    textPrimary: "#FFFFFF",
    textSecondary: "#DBEAFE",
    accent: "#38BDF8",
    accentSoft: "rgba(56, 189, 248, 0.2)",
    badgeText: "#0F172A",
  },
  {
    id: "terracotta-cream",
    name: "Warm Ivory & Terracotta",
    bgStart: "#FFFBEB",
    bgEnd: "#FEF3C7",
    cardBg: "#FFFFFF",
    cardBorder: "#FDE68A",
    textPrimary: "#1C1917",
    textSecondary: "#44403C",
    accent: "#EA580C",
    accentSoft: "#FFEDD5",
    badgeText: "#FFFFFF",
  },
  {
    id: "cyber-violet",
    name: "SaaS Violet & Magenta",
    bgStart: "#170F2E",
    bgEnd: "#2E1065",
    cardBg: "rgba(30, 17, 64, 0.86)",
    cardBorder: "rgba(192, 132, 252, 0.3)",
    textPrimary: "#FFFFFF",
    textSecondary: "#E9D5FF",
    accent: "#C084FC",
    accentSoft: "rgba(192, 132, 252, 0.22)",
    badgeText: "#170F2E",
  },
];

export const INFOGRAPHIC_TEMPLATES: {
  id: InfographicTemplateId;
  label: string;
  desc: string;
}[] = [
  {
    id: "step-roadmap",
    label: "1. Step-by-Step Roadmap",
    desc: "Connected numbered cards for how-to guides & workflows",
  },
  {
    id: "comparison-versus",
    label: "2. A vs. B Comparison",
    desc: "Side-by-side Old Way vs. New Way or Option A vs. Option B",
  },
  {
    id: "stat-bento-grid",
    label: "3. KPI & Stat Bento Grid",
    desc: "2-column metric callouts with large numbers & proof bars",
  },
  {
    id: "timeline-journey",
    label: "4. Vertical Timeline",
    desc: "Central spine with alternating left/right milestone cards",
  },
  {
    id: "dos-and-donts",
    label: "5. Do's & Don'ts Split",
    desc: "High-contrast green checkmarks vs. red mistakes",
  },
  {
    id: "pyramid-funnel",
    label: "6. Pyramid / Funnel",
    desc: "Tiered strategic hierarchy from foundation to top goal",
  },
  {
    id: "numbered-checklist",
    label: "7. Saveable Checklist",
    desc: "Clean checkbox rows ideal for bookmarks & Pinterest",
  },
  {
    id: "hub-anatomy",
    label: "8. Pillar & Spoke Grid",
    desc: "Central core thesis surrounded by structured sub-topic cards",
  },
];

function wrapTextLines(
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
  let current = "";
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = w;
      if (lines.length >= maxLines - 1) break;
    } else {
      current = test;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  return lines;
}

export interface EditableInfographicStudioProps {
  initialTitle: string;
  initialSubtitle: string;
  initialKicker?: string;
  initialFooterBrand?: string;
  initialSourceUrl?: string;
  initialTemplate?: InfographicTemplateId;
  initialAspect?: InfographicAspectRatio;
  initialPalette?: InfographicColorPaletteId;
  initialNodes: InfographicNodeItem[];
}

export function EditableInfographicStudio({
  initialTitle,
  initialSubtitle,
  initialKicker = "VISUAL INFOGRAPHIC PLAYBOOK",
  initialFooterBrand = "doitwithai.tools",
  initialSourceUrl = "https://doitwithai.tools",
  initialTemplate = "step-roadmap",
  initialAspect = "vertical-poster",
  initialPalette = "navy-orange",
  initialNodes,
}: EditableInfographicStudioProps) {
  const [template, setTemplate] =
    useState<InfographicTemplateId>(initialTemplate);
  const [aspect, setAspect] = useState<InfographicAspectRatio>(initialAspect);
  const [paletteId, setPaletteId] =
    useState<InfographicColorPaletteId>(initialPalette);
  const [kicker, setKicker] = useState(initialKicker);
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [footerBrand, setFooterBrand] = useState(initialFooterBrand);
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl);
  const [nodes, setNodes] = useState<InfographicNodeItem[]>(initialNodes);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [toast, setToast] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setTitle(initialTitle);
    setSubtitle(initialSubtitle);
    if (initialKicker) setKicker(initialKicker);
    if (initialSourceUrl) setSourceUrl(initialSourceUrl);
    if (initialNodes?.length) setNodes(initialNodes);
  }, [
    initialTitle,
    initialSubtitle,
    initialKicker,
    initialSourceUrl,
    initialNodes,
  ]);

  const palette =
    INFOGRAPHIC_PALETTES.find((p) => p.id === paletteId) ||
    INFOGRAPHIC_PALETTES[0];

  const dimensions = {
    "vertical-poster": { w: 1000, h: 1920, label: "Vertical Infographic (1000×1920)" },
    "pinterest-tall": { w: 1000, h: 1500, label: "Pinterest Tall Pin (1000×1500)" },
    "portrait-social": { w: 1080, h: 1350, label: "LinkedIn / IG Portrait (1080×1350)" },
    "square-card": { w: 1080, h: 1080, label: "Square Summary (1080×1080)" },
  }[aspect];

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function updateNode(
    id: string,
    field: keyof InfographicNodeItem,
    value: string,
  ) {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [field]: value } : n)),
    );
  }

  function addNode() {
    if (nodes.length >= 8) {
      notify("Maximum 8 visual nodes per infographic for crisp readability.");
      return;
    }
    const nextNum = nodes.length + 1;
    setNodes((prev) => [
      ...prev,
      {
        id: `node-${Date.now()}`,
        badge: `0${nextNum}`,
        title: `Key Takeaway #${nextNum}`,
        body: "Add a concise 10–15 word explanation for this step or insight.",
        metricValue: `${nextNum * 15}%`,
        compareRight: "Optimized AI workflow outcome with measurable lift.",
      },
    ]);
  }

  function removeNode(id: string) {
    if (nodes.length <= 2) {
      notify("Keep at least 2 nodes on the infographic.");
      return;
    }
    setNodes((prev) => prev.filter((n) => n.id !== id));
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = dimensions.w;
    const H = dimensions.h;
    canvas.width = W;
    canvas.height = H;

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, palette.bgStart);
    bgGrad.addColorStop(1, palette.bgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle decorative grid dots in header
    ctx.fillStyle = palette.accentSoft;
    ctx.beginPath();
    ctx.arc(W - 90, 90, 160, 0, Math.PI * 2);
    ctx.fill();

    // 2. Top Kicker Pill
    const padX = 64;
    let curY = 58;
    ctx.font = "800 20px system-ui, -apple-system, sans-serif";
    const kickerText = (kicker || "VISUAL INFOGRAPHIC").toUpperCase();
    const kickerWidth = Math.min(
      W - padX * 2,
      ctx.measureText(kickerText).width + 44,
    );
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.roundRect(padX, curY, kickerWidth, 42, 21);
    ctx.fill();

    ctx.fillStyle = palette.badgeText;
    ctx.fillText(kickerText, padX + 22, curY + 28);
    curY += 68;

    // 3. Main Infographic Title
    ctx.fillStyle = palette.textPrimary;
    const titleFontSize = H >= 1500 ? 46 : 40;
    ctx.font = `900 ${titleFontSize}px system-ui, -apple-system, sans-serif`;
    const titleLines = wrapTextLines(ctx, title, W - padX * 2, 3);
    for (const line of titleLines) {
      ctx.fillText(line, padX, curY + titleFontSize);
      curY += titleFontSize + 12;
    }

    // 4. Subtitle
    curY += 8;
    ctx.fillStyle = palette.textSecondary;
    ctx.font = "500 24px system-ui, -apple-system, sans-serif";
    const subLines = wrapTextLines(ctx, subtitle, W - padX * 2, 2);
    for (const line of subLines) {
      ctx.fillText(line, padX, curY + 24);
      curY += 34;
    }

    curY += 26;
    // Accent divider line
    ctx.fillStyle = palette.accent;
    ctx.fillRect(padX, curY, 140, 6);
    curY += 28;

    // 5. Render Body Area According to Selected Template
    const footerH = 88;
    const bodyTop = curY;
    const bodyBottom = H - footerH;
    const availH = Math.max(320, bodyBottom - bodyTop);
    const activeNodes = nodes.slice(0, 8);
    const count = Math.max(1, activeNodes.length);

    if (
      template === "stat-bento-grid" ||
      template === "hub-anatomy"
    ) {
      // 2-Column Bento Grid
      const cols = 2;
      const rows = Math.ceil(count / cols);
      const gap = 22;
      const cardW = Math.floor((W - padX * 2 - gap) / cols);
      const cardH = Math.max(
        160,
        Math.floor((availH - gap * (rows - 1)) / rows),
      );

      activeNodes.forEach((node, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = padX + col * (cardW + gap);
        const y = bodyTop + row * (cardH + gap);

        ctx.fillStyle = palette.cardBg;
        ctx.strokeStyle = palette.cardBorder;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 24);
        ctx.fill();
        ctx.stroke();

        // Metric or Badge Hero
        const statLabel = node.metricValue || node.badge || `0${idx + 1}`;
        ctx.fillStyle = palette.accent;
        ctx.font = "900 42px system-ui, -apple-system, sans-serif";
        ctx.fillText(statLabel, x + 26, y + 58);

        // Node Title
        ctx.fillStyle = palette.textPrimary;
        ctx.font = "800 25px system-ui, -apple-system, sans-serif";
        const tLines = wrapTextLines(ctx, node.title, cardW - 52, 2);
        let ty = y + 96;
        for (const l of tLines) {
          ctx.fillText(l, x + 26, ty);
          ty += 31;
        }

        // Node Body
        ctx.fillStyle = palette.textSecondary;
        ctx.font = "500 20px system-ui, -apple-system, sans-serif";
        const bLines = wrapTextLines(ctx, node.body, cardW - 52, 3);
        ty += 6;
        for (const l of bLines) {
          if (ty < y + cardH - 16) {
            ctx.fillText(l, x + 26, ty);
            ty += 26;
          }
        }
      });
    } else if (
      template === "comparison-versus" ||
      template === "dos-and-donts"
    ) {
      // 2-Column Split Header + Comparison Rows
      const isDos = template === "dos-and-donts";
      const gap = 20;
      const colW = Math.floor((W - padX * 2 - gap) / 2);

      // Column Headers
      ctx.fillStyle = isDos ? "rgba(244,63,94,0.22)" : palette.cardBg;
      ctx.beginPath();
      ctx.roundRect(padX, bodyTop, colW, 54, 14);
      ctx.fill();
      ctx.fillStyle = isDos ? "#FDA4AF" : palette.textSecondary;
      ctx.font = "800 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        isDos ? "✗ AVOID THESE MISTAKES" : "◀ TRADITIONAL / OLD WAY",
        padX + 20,
        bodyTop + 35,
      );

      ctx.fillStyle = isDos ? "rgba(16,185,129,0.24)" : palette.accent;
      ctx.beginPath();
      ctx.roundRect(padX + colW + gap, bodyTop, colW, 54, 14);
      ctx.fill();
      ctx.fillStyle = isDos ? "#6EE7B7" : palette.badgeText;
      ctx.fillText(
        isDos ? "✓ DO THIS INSTEAD" : "▶ HIGH-LEVERAGE NEW WAY",
        padX + colW + gap + 20,
        bodyTop + 35,
      );

      const rowsTop = bodyTop + 72;
      const rowsAvailH = availH - 72;
      const rowGap = 16;
      const rowH = Math.max(
        110,
        Math.floor((rowsAvailH - rowGap * (count - 1)) / count),
      );

      activeNodes.forEach((node, idx) => {
        const y = rowsTop + idx * (rowH + rowGap);

        // Left Card
        ctx.fillStyle = palette.cardBg;
        ctx.strokeStyle = palette.cardBorder;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(padX, y, colW, rowH, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = palette.textPrimary;
        ctx.font = "800 22px system-ui, -apple-system, sans-serif";
        ctx.fillText(`${idx + 1}. ${node.title}`.slice(0, 36), padX + 20, y + 36);

        ctx.fillStyle = palette.textSecondary;
        ctx.font = "500 19px system-ui, -apple-system, sans-serif";
        const leftLines = wrapTextLines(ctx, node.body, colW - 40, 3);
        let ly = y + 66;
        for (const l of leftLines) {
          if (ly < y + rowH - 12) {
            ctx.fillText(l, padX + 20, ly);
            ly += 25;
          }
        }

        // Right Card
        const rx = padX + colW + gap;
        ctx.fillStyle = palette.cardBg;
        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(rx, y, colW, rowH, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = palette.accent;
        ctx.font = "800 22px system-ui, -apple-system, sans-serif";
        ctx.fillText(
          isDos ? `✓ Best Practice #${idx + 1}` : `★ Winning Action #${idx + 1}`,
          rx + 20,
          y + 36,
        );

        ctx.fillStyle = palette.textPrimary;
        ctx.font = "500 19px system-ui, -apple-system, sans-serif";
        const rightText =
          node.compareRight ||
          `Apply "${node.title}" with structured templates and measurable KPIs.`;
        const rightLines = wrapTextLines(ctx, rightText, colW - 40, 3);
        let ry = y + 66;
        for (const l of rightLines) {
          if (ry < y + rowH - 12) {
            ctx.fillText(l, rx + 20, ry);
            ry += 25;
          }
        }
      });
    } else if (template === "pyramid-funnel") {
      // Tiered Pyramid / Funnel Bars
      const rowGap = 16;
      const rowH = Math.max(
        96,
        Math.floor((availH - rowGap * (count - 1)) / count),
      );
      const maxBarW = W - padX * 2;

      activeNodes.forEach((node, idx) => {
        const widthRatio = 0.62 + (0.38 * idx) / Math.max(1, count - 1);
        const barW = Math.floor(maxBarW * widthRatio);
        const x = Math.floor((W - barW) / 2);
        const y = bodyTop + idx * (rowH + rowGap);

        ctx.fillStyle = palette.cardBg;
        ctx.strokeStyle = idx === 0 ? palette.accent : palette.cardBorder;
        ctx.lineWidth = idx === 0 ? 3.5 : 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, rowH, 22);
        ctx.fill();
        ctx.stroke();

        // Badge pill inside bar
        ctx.fillStyle = palette.accent;
        ctx.beginPath();
        ctx.roundRect(x + 22, y + 20, 68, 40, 12);
        ctx.fill();
        ctx.fillStyle = palette.badgeText;
        ctx.font = "900 21px system-ui, -apple-system, sans-serif";
        ctx.fillText(node.badge || `0${idx + 1}`, x + 40, y + 47);

        ctx.fillStyle = palette.textPrimary;
        ctx.font = "800 24px system-ui, -apple-system, sans-serif";
        ctx.fillText(node.title.slice(0, 42), x + 108, y + 46);

        ctx.fillStyle = palette.textSecondary;
        ctx.font = "500 19px system-ui, -apple-system, sans-serif";
        const line = wrapTextLines(ctx, node.body, barW - 130, 2);
        let by = y + 76;
        for (const l of line) {
          if (by < y + rowH - 10) {
            ctx.fillText(l, x + 108, by);
            by += 24;
          }
        }
      });
    } else {
      // Step-by-Step Roadmap, Timeline Journey, or Numbered Checklist
      const rowGap = 16;
      const rowH = Math.max(
        102,
        Math.floor((availH - rowGap * (count - 1)) / count),
      );
      const isChecklist = template === "numbered-checklist";
      const isTimeline = template === "timeline-journey";

      if (isTimeline) {
        // Vertical connecting spine line
        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(padX + 42, bodyTop + 24);
        ctx.lineTo(padX + 42, bodyTop + count * (rowH + rowGap) - rowGap - 24);
        ctx.stroke();
      }

      activeNodes.forEach((node, idx) => {
        const y = bodyTop + idx * (rowH + rowGap);
        const cardX = isTimeline ? padX + 94 : padX;
        const cardW = isTimeline ? W - padX * 2 - 94 : W - padX * 2;

        if (isTimeline) {
          // Timeline node circle on spine
          ctx.fillStyle = palette.accent;
          ctx.beginPath();
          ctx.arc(padX + 42, y + rowH / 2, 26, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = palette.badgeText;
          ctx.font = "900 20px system-ui, -apple-system, sans-serif";
          ctx.fillText(node.badge || `0${idx + 1}`, padX + 29, y + rowH / 2 + 7);
        }

        ctx.fillStyle = palette.cardBg;
        ctx.strokeStyle = palette.cardBorder;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cardX, y, cardW, rowH, 20);
        ctx.fill();
        ctx.stroke();

        // Left Accent Bar
        ctx.fillStyle = palette.accent;
        ctx.beginPath();
        ctx.roundRect(cardX, y, 10, rowH, [20, 0, 0, 20]);
        ctx.fill();

        let textStartX = cardX + 28;
        if (!isTimeline) {
          // Numbered or Checkbox badge inside card
          ctx.fillStyle = palette.accent;
          ctx.beginPath();
          ctx.roundRect(cardX + 24, y + 22, 62, 54, 14);
          ctx.fill();

          ctx.fillStyle = palette.badgeText;
          ctx.font = "900 24px system-ui, -apple-system, sans-serif";
          ctx.fillText(
            isChecklist ? "✓" : node.badge || `0${idx + 1}`,
            cardX + (isChecklist ? 44 : 39),
            y + 58,
          );
          textStartX = cardX + 106;
        }

        // Optional Metric Pill on Top Right of Card
        if (node.metricValue) {
          ctx.fillStyle = palette.accentSoft;
          ctx.beginPath();
          ctx.roundRect(cardX + cardW - 150, y + 18, 126, 36, 18);
          ctx.fill();
          ctx.fillStyle = palette.accent;
          ctx.font = "800 18px system-ui, -apple-system, sans-serif";
          ctx.fillText(
            node.metricValue.slice(0, 10),
            cardX + cardW - 130,
            y + 42,
          );
        }

        // Node Title
        ctx.fillStyle = palette.textPrimary;
        ctx.font = "800 25px system-ui, -apple-system, sans-serif";
        const maxTitleW = cardW - (textStartX - cardX) - (node.metricValue ? 165 : 28);
        const tLines = wrapTextLines(ctx, node.title, maxTitleW, 1);
        ctx.fillText(tLines[0] || node.title, textStartX, y + 44);

        // Node Body
        ctx.fillStyle = palette.textSecondary;
        ctx.font = "500 20px system-ui, -apple-system, sans-serif";
        const bLines = wrapTextLines(
          ctx,
          node.body,
          cardW - (textStartX - cardX) - 28,
          2,
        );
        let by = y + 76;
        for (const l of bLines) {
          if (by < y + rowH - 10) {
            ctx.fillText(l, textStartX, by);
            by += 26;
          }
        }
      });
    }

    // 6. Footer Attribution Bar
    ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
    ctx.fillRect(0, H - footerH, W, footerH);

    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.arc(padX + 12, H - footerH / 2, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 22px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      footerBrand || "doitwithai.tools",
      padX + 32,
      H - footerH / 2 + 8,
    );

    ctx.fillStyle = "#CBD5E1";
    ctx.font = "600 18px system-ui, -apple-system, sans-serif";
    const rightFooter = "Save & Share This Visual Guide ★";
    const rfWidth = ctx.measureText(rightFooter).width;
    ctx.fillText(rightFooter, W - padX - rfWidth, H - footerH / 2 + 7);
  }, [
    template,
    aspect,
    palette,
    kicker,
    title,
    subtitle,
    footerBrand,
    nodes,
    dimensions.w,
    dimensions.h,
  ]);

  function downloadHighResPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `infographic-${template}-${aspect}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
    notify("Downloaded High-Resolution Infographic (.PNG)!");
  }

  function downloadVectorSvg() {
    const W = dimensions.w;
    const H = dimensions.h;
    const esc = (s: string) =>
      String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const nodeRects = nodes
      .slice(0, 8)
      .map((n, i) => {
        const y = 320 + i * 170;
        return `<g transform="translate(64, ${y})">
          <rect width="${W - 128}" height="148" rx="20" fill="${palette.bgEnd}" stroke="${palette.accent}" stroke-width="2" />
          <rect x="20" y="24" width="56" height="48" rx="12" fill="${palette.accent}" />
          <text x="36" y="56" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="22" font-weight="900">${esc(n.badge || `0${i + 1}`)}</text>
          <text x="96" y="52" fill="${palette.textPrimary}" font-family="system-ui, sans-serif" font-size="24" font-weight="800">${esc(n.title.slice(0, 56))}</text>
          <text x="96" y="92" fill="${palette.textSecondary}" font-family="system-ui, sans-serif" font-size="19">${esc(n.body.slice(0, 95))}</text>
        </g>`;
      })
      .join("\n");

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <rect width="${W}" height="${H}" fill="${palette.bgStart}" />
      <text x="64" y="96" fill="${palette.accent}" font-family="system-ui, sans-serif" font-size="22" font-weight="800">${esc(kicker)}</text>
      <text x="64" y="156" fill="${palette.textPrimary}" font-family="system-ui, sans-serif" font-size="40" font-weight="900">${esc(title.slice(0, 48))}</text>
      <text x="64" y="208" fill="${palette.textSecondary}" font-family="system-ui, sans-serif" font-size="22">${esc(subtitle.slice(0, 80))}</text>
      ${nodeRects}
      <text x="64" y="${H - 36}" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="22" font-weight="800">${esc(footerBrand)}</text>
    </svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `infographic-${template}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded Editable Vector Infographic (.SVG)!");
  }

  function printPdfPoster() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(
      `<!doctype html><html><head><title>${title}</title><style>body{margin:0;display:flex;justify-content:center;background:#0f172a}@media print{body{background:#fff}}img{max-width:100%;height:auto}</style></head><body><img src="${dataUrl}" alt="${title}"/><script>window.onload=()=>{setTimeout(()=>window.print(),300)}</script></body></html>`,
    );
    win.document.close();
  }

  const seoEmbedCode = `<!-- Interactive Infographic Embed Code -->
<figure style="max-width:800px;margin:24px auto;text-align:center;font-family:system-ui,sans-serif">
  <a href="${sourceUrl}" target="_blank" rel="noopener">
    <img src="${sourceUrl.replace(/\/$/, "")}/infographic-${template}.png" alt="${title.replace(/"/g, "&quot;")}" style="width:100%;height:auto;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.12)" loading="lazy" />
  </a>
  <figcaption style="margin-top:10px;font-size:13px;color:#475569">
    <strong>${title}</strong> — Visual Infographic created with <a href="https://doitwithai.tools/tools/blog-to-infographic-generator" target="_blank" rel="noopener">Do It With AI Tools</a>. Source: <a href="${sourceUrl}" target="_blank" rel="noopener">${footerBrand}</a>.
  </figcaption>
</figure>`;

  return (
    <div className="rounded-2xl border-2 border-[#3452d1]/25 bg-white p-5 shadow-xs dark:border-[#5271ff]/30 dark:bg-[#111827] sm:p-6 space-y-6">
      {toast && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
        >
          ✓ {toast}
        </div>
      )}

      {/* TOP TEMPLATE & PALETTE BAR */}
      <div className="space-y-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#ff6b35]">
              <Layers size={14} />8 Built-In Editable Visual Infographic
              Templates
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Interactive Visual Infographic Studio &amp; Multi-Format Exporter
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadHighResPng}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#ff6b35] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#e85d2a]"
            >
              <Download size={14} />
              Download HD Infographic (.PNG)
            </button>
            <button
              type="button"
              onClick={downloadVectorSvg}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5]"
            >
              <FileCode2 size={14} />
              Vector (.SVG)
            </button>
            <button
              type="button"
              onClick={printPdfPoster}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <Printer size={14} />
              Save PDF Poster
            </button>
            <button
              type="button"
              onClick={() => setShowEmbedModal((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <Code2 size={14} />
              SEO Backlink Embed Code
            </button>
          </div>
        </div>

        {/* 8 Template Selector Pills */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {INFOGRAPHIC_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setTemplate(tpl.id)}
              className={`rounded-xl border p-3 text-left transition ${
                template === tpl.id
                  ? "border-[#ff6b35] bg-[#ff6b35]/10 shadow-xs dark:border-[#ff6b35] dark:bg-[#ff6b35]/15"
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

        {/* Aspect Ratio & Color Palette Controls */}
        <div className="grid gap-3 pt-1 sm:grid-cols-2">
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Layers size={13} className="text-[#3452d1]" />
              Infographic Dimensions / Aspect Ratio
            </label>
            <select
              value={aspect}
              onChange={(e) =>
                setAspect(e.target.value as InfographicAspectRatio)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="vertical-poster">
                Vertical Blog Infographic Poster (1000×1920)
              </option>
              <option value="pinterest-tall">
                Pinterest 2:3 Tall Pin Infographic (1000×1500)
              </option>
              <option value="portrait-social">
                LinkedIn / Instagram 4:5 Portrait (1080×1350)
              </option>
              <option value="square-card">
                Universal 1:1 Square Visual (1080×1080)
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Palette size={13} className="text-[#ff6b35]" />
              Brand Color Theme Palette
            </label>
            <select
              value={paletteId}
              onChange={(e) =>
                setPaletteId(e.target.value as InfographicColorPaletteId)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {INFOGRAPHIC_PALETTES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional SEO Backlink Embed Code Drawer */}
        {showEmbedModal && (
          <div className="rounded-xl border border-indigo-500/30 bg-slate-900 p-4 text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                SEO Backlink Acquisition HTML Embed Code (For Bloggers &amp; PR)
              </span>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(seoEmbedCode);
                  notify("Copied SEO Infographic Embed HTML code!");
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-[#ff6b35] px-3 py-1 text-xs font-bold text-white"
              >
                <Copy size={12} /> Copy Embed HTML
              </button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-emerald-300">
              {seoEmbedCode}
            </pre>
          </div>
        )}
      </div>

      {/* MAIN 2-COLUMN LIVE EDITOR (LEFT) + LIVE HIGH-RES INFOGRAPHIC CANVAS (RIGHT) */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-start">
        {/* LEFT COLUMN: INLINE TEXT & NODE EDITOR */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/60">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
              1. Edit Header, Subtitle &amp; Brand Footer
            </h4>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Top Kicker Badge
                </label>
                <input
                  type="text"
                  value={kicker}
                  onChange={(e) => setKicker(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Brand Footer Attribution
                </label>
                <input
                  type="text"
                  value={footerBrand}
                  onChange={(e) => setFooterBrand(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Main Infographic Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Subtitle / Context Takeaway
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
          </div>

          {/* EDITABLE VISUAL NODES */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#ff6b35]">
                2. Edit Visual Cards / Steps ({nodes.length} / 8)
              </h4>
              <button
                type="button"
                onClick={addNode}
                className="inline-flex items-center gap-1 rounded-lg bg-[#3452d1] px-2.5 py-1 text-xs font-extrabold text-white hover:bg-[#2842b5]"
              >
                <Plus size={13} /> Add Visual Step
              </button>
            </div>

            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
              {nodes.map((node, i) => (
                <div
                  key={node.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      Card #{i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNode(node.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">
                        Badge / Step #
                      </label>
                      <input
                        type="text"
                        value={node.badge}
                        onChange={(e) =>
                          updateNode(node.id, "badge", e.target.value)
                        }
                        className="mt-0.5 w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500">
                        Stat / Metric Pill (Optional)
                      </label>
                      <input
                        type="text"
                        value={node.metricValue || ""}
                        onChange={(e) =>
                          updateNode(node.id, "metricValue", e.target.value)
                        }
                        placeholder="e.g. +142% ROI, Step 1, 98%"
                        className="mt-0.5 w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500">
                      Card Title
                    </label>
                    <input
                      type="text"
                      value={node.title}
                      onChange={(e) =>
                        updateNode(node.id, "title", e.target.value)
                      }
                      className="mt-0.5 w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500">
                      Supporting Explanation (Keep concise for crisp visual layout)
                    </label>
                    <textarea
                      rows={2}
                      value={node.body}
                      onChange={(e) =>
                        updateNode(node.id, "body", e.target.value)
                      }
                      className="mt-0.5 w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>

                  {(template === "comparison-versus" ||
                    template === "dos-and-donts") && (
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-600">
                        Right-Column Counterpart (&ldquo;Do This Instead / New Way&rdquo;)
                      </label>
                      <input
                        type="text"
                        value={node.compareRight || ""}
                        onChange={(e) =>
                          updateNode(node.id, "compareRight", e.target.value)
                        }
                        placeholder="Enter the positive counterpart for Column B..."
                        className="mt-0.5 w-full rounded border border-emerald-300 bg-emerald-50/40 px-2.5 py-1 text-xs dark:border-emerald-800 dark:bg-slate-900"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE RENDERED INFOGRAPHIC CANVAS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold uppercase tracking-wider text-slate-500">
              Live Infographic Preview ({dimensions.label})
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Updates in real time as you type
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-slate-950 p-2 shadow-lg dark:border-slate-700">
            <canvas
              ref={canvasRef}
              className="mx-auto block h-auto max-h-[820px] w-full object-contain rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditableInfographicStudio;

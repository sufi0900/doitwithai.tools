"use client";

import { TemplateThumbnail } from "@/features/tool-ui/InfographicArtwork";
import studioStyles from "@/features/tool-ui/visual-studio.module.css";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  FileText,
  Image as ImageIcon,
  Layers,
  PackageCheck,
  Palette,
  Sparkles,
} from "lucide-react";
import UrlArticleExtractorBar, {
  type ExtractedImageAsset,
} from "@/features/tool-ui/UrlArticleExtractorBar";
import ToolRunOverlay, {
  focusToolSection,
} from "@/features/tool-ui/ToolRunOverlay";
import PlatformBrandIcon from "@/features/tool-ui/PlatformBrandIcon";
import {
  copyCanvasImageToClipboard,
  downloadCanvasAsEmbeddedSvg,
  downloadCanvasAsPng,
  printCanvasAsPdfPoster,
  resolveStudioTheme,
  STUDIO_COLOR_THEMES,
  type CustomStudioColorOverrides,
  type StudioColorThemeId,
} from "@/features/tool-ui/visualCardExport";
import {
  buildDeterministicPinterestVisualPack,
  DEFAULT_PINTEREST_VISUAL_INPUT,
  type PinterestVisualInput,
  type PinterestVisualPack,
  type PinterestVisualTemplateId,
} from "./model";

const PIN_TEMPLATES: {
  id: PinterestVisualTemplateId;
  label: string;
  desc: string;
}[] = [
  {
    id: "listicle-number-pin",
    label: "1. Giant Number Listicle Pin",
    desc: "Oversized number badge + bold hook + numbered cards",
  },
  {
    id: "step-mini-infographic",
    label: "2. Step-by-Step Roadmap Pin",
    desc: "Vertical connected timeline spine built for Pinterest Saves",
  },
  {
    id: "editorial-cover-pin",
    label: "3. Editorial Magazine Cover",
    desc: "Magazine cover typography + extracted article photo frame",
  },
  {
    id: "saveable-checklist-pin",
    label: "4. Save-Worthy Checklist Card",
    desc: "High-contrast paper clipboard card + checkmark rows",
  },
  {
    id: "split-photo-headline",
    label: "5. Split Photo + Ribbon Pin",
    desc: "Top image frame + center ribbon badge + lower takeaways",
  },
  {
    id: "comparison-pin",
    label: "6. Mistake vs. Solution Pin",
    desc: "Contrasts 'Stop Doing This' vs. 'Do This Instead' columns",
  },
  {
    id: "pyramid-hierarchy-pin",
    label: "7. 5-Tier Pyramid Hierarchy",
    desc: "Stacked pyramid levels from foundation to mastery",
  },
  {
    id: "stat-donut-pin",
    label: "8. Big Stat Ring + Takeaways",
    desc: "Hero KPI radial progress ring + 4 supporting proof rows",
  },
  {
    id: "ribbon-banner-pin",
    label: "9. 3D Ribbon Chevrons Pin",
    desc: "Dimensional ribbon banners with alternating color badges",
  },
  {
    id: "before-after-pin",
    label: "10. Before vs. After Pin",
    desc: "Top 'Old Bottleneck' block vs. Bottom 'New Blueprint' block",
  },
  {
    id: "bento-grid-pin",
    label: "11. 2×3 Bento Cheat Sheet Pin",
    desc: "Modern modular Bento grid cards on a 2:3 vertical canvas",
  },
  {
    id: "quote-tip-poster-pin",
    label: "12. Authority Quote & Tip Poster",
    desc: "Oversized editorial pull-quote + 3 golden rules below",
  },
];

function wrapPinText(
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

export default function PinterestPinVisualGeneratorClient() {
  const [input, setInput] = useState<PinterestVisualInput>(
    DEFAULT_PINTEREST_VISUAL_INPUT,
  );
  const [aiPack, setAiPack] = useState<PinterestVisualPack | null>(null);
  const [activeVarIdx, setActiveVarIdx] = useState(0);
  const [themeId, setThemeId] = useState<StudioColorThemeId>("royal-cobalt");
  const [customColors, setCustomColors] = useState<CustomStudioColorOverrides>(
    {},
  );
  const [extractedImages, setExtractedImages] = useState<ExtractedImageAsset[]>(
    [],
  );
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>("");
  const [loadedPhotoEl, setLoadedPhotoEl] = useState<HTMLImageElement | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const activeTheme = useMemo(
    () => resolveStudioTheme(themeId, customColors),
    [themeId, customColors],
  );

  const fallbackPack = useMemo(
    () => buildDeterministicPinterestVisualPack(input),
    [input],
  );
  const pack = aiPack || fallbackPack;
  const activePin = pack.pinVariations[activeVarIdx] || pack.pinVariations[0];

  const [customBadge, setCustomBadge] = useState(activePin.pinBadge);
  const [customHeadline, setCustomHeadline] = useState(
    activePin.pinHeadlineOverlay,
  );
  const [customSubtext, setCustomSubtext] = useState(
    activePin.pinSubtextOverlay,
  );

  useEffect(() => {
    setCustomBadge(activePin.pinBadge);
    setCustomHeadline(activePin.pinHeadlineOverlay);
    setCustomSubtext(activePin.pinSubtextOverlay);
  }, [activePin]);

  useEffect(() => {
    if (!selectedPhotoUrl) {
      setLoadedPhotoEl(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setLoadedPhotoEl(img);
    img.onerror = () => setLoadedPhotoEl(null);
    img.src = selectedPhotoUrl;
  }, [selectedPhotoUrl]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  async function runGenerateAiPins(overrideInput?: PinterestVisualInput) {
    const payload = overrideInput || input;
    setLoading(true);
    try {
      const res = await fetch("/api/ai-tools/pinterest-pin-visual-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.pack) {
        setAiPack(data.pack);
        setActiveVarIdx(0);
        notify("Generated 3 Pinterest Pin Designs & SEO Descriptions!");
      }
      focusToolSection(resultsRef.current);
    } catch {
      notify("Updated Pinterest Pin visuals.");
      focusToolSection(resultsRef.current);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1000;
    const H = 1500;
    canvas.width = W;
    canvas.height = H;

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, activeTheme.bgStart);
    grad.addColorStop(1, activeTheme.bgEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle decorative background glow
    const glow = ctx.createRadialGradient(
      W * 0.82,
      H * 0.14,
      20,
      W * 0.82,
      H * 0.14,
      420,
    );
    glow.addColorStop(0, `${activeTheme.accent}33`);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    const padX = 64;
    const hasTopPhoto =
      loadedPhotoEl &&
      (input.template === "editorial-cover-pin" ||
        input.template === "split-photo-headline");

    if (hasTopPhoto && loadedPhotoEl) {
      const imgH = 480;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(padX, 52, W - padX * 2, imgH, 32);
      ctx.clip();
      const scale = Math.max(
        (W - padX * 2) / loadedPhotoEl.width,
        imgH / loadedPhotoEl.height,
      );
      const dw = loadedPhotoEl.width * scale;
      const dh = loadedPhotoEl.height * scale;
      ctx.drawImage(
        loadedPhotoEl,
        padX + (W - padX * 2 - dw) / 2,
        52 + (imgH - dh) / 2,
        dw,
        dh,
      );
      ctx.restore();
    }

    let curY = hasTopPhoto ? 560 : 68;

    // Top Badge Pill
    ctx.fillStyle = activeTheme.accent;
    ctx.beginPath();
    ctx.roundRect(padX, curY, 360, 50, 25);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 21px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      (customBadge || "MUST-SAVE GUIDE").toUpperCase().slice(0, 24),
      padX + 24,
      curY + 33,
    );

    if (input.template === "listicle-number-pin") {
      // Giant listicle number badge on top-right
      ctx.fillStyle = activeTheme.accentSecondary;
      ctx.beginPath();
      ctx.arc(W - padX - 66, curY + 58, 66, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 58px system-ui, -apple-system, sans-serif";
      const numMatch =
        customHeadline.match(/\d+/)?.[0] || String(pack.bulletSteps.length);
      ctx.textAlign = "center";
      ctx.fillText(numMatch, W - padX - 66, curY + 78);
      ctx.textAlign = "left";
    }

    curY += 72;

    // Big Pin Headline Overlay
    ctx.fillStyle = activeTheme.textMain;
    ctx.font = "900 52px system-ui, -apple-system, sans-serif";
    const headlineMaxW =
      input.template === "listicle-number-pin"
        ? W - padX * 2 - 150
        : W - padX * 2;
    const hLines = wrapPinText(ctx, customHeadline, headlineMaxW, 3);
    for (const l of hLines) {
      ctx.fillText(l, padX, curY + 48);
      curY += 62;
    }

    // Subtext
    curY += 8;
    ctx.fillStyle = activeTheme.textSub;
    ctx.font = "600 26px system-ui, -apple-system, sans-serif";
    const subLines = wrapPinText(ctx, customSubtext, W - padX * 2, 2);
    for (const l of subLines) {
      ctx.fillText(l, padX, curY + 26);
      curY += 36;
    }
    curY += 24;

    const footerH = 92;
    const availH = H - footerH - curY - 24;
    const steps = pack.bulletSteps.slice(0, 5);
    const palette = [
      activeTheme.accent,
      activeTheme.accentSecondary,
      activeTheme.accentTertiary,
      "#10B981",
      "#F59E0B",
    ];

    if (input.template === "pyramid-hierarchy-pin") {
      // 5-Tier Pyramid Hierarchy
      const count = Math.max(3, steps.length);
      const gap = 14;
      const tierH = Math.floor((availH - gap * (count - 1)) / count);
      steps.forEach((stepText, idx) => {
        const ratio = 0.52 + ((idx + 1) / count) * 0.48;
        const w = Math.floor((W - padX * 2) * ratio);
        const x = Math.floor((W - w) / 2);
        const y = curY + idx * (tierH + gap);
        const col = palette[idx % palette.length];

        ctx.fillStyle = activeTheme.cardBg;
        ctx.strokeStyle = col;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, w, tierH, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = col;
        ctx.font = "900 20px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`LEVEL 0${idx + 1}`, W / 2, y + 32);

        ctx.fillStyle = activeTheme.textMain;
        ctx.font = "800 23px system-ui, -apple-system, sans-serif";
        const sLines = wrapPinText(ctx, stepText, w - 48, 2);
        let sy = y + 64;
        for (const l of sLines) {
          ctx.fillText(l, W / 2, sy);
          sy += 28;
        }
      });
      ctx.textAlign = "left";
    } else if (
      input.template === "comparison-pin" ||
      input.template === "before-after-pin"
    ) {
      // 2-Column or Top/Bottom Mistake vs Solution
      const colW = Math.floor((W - padX * 2 - 24) / 2);
      const colH = availH;

      // Left Column: Common Mistakes
      ctx.fillStyle = "rgba(244, 63, 94, 0.14)";
      ctx.strokeStyle = "#F43F5E";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(padX, curY, colW, colH, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#F43F5E";
      ctx.font = "900 24px system-ui, -apple-system, sans-serif";
      ctx.fillText("✗ STOP DOING THIS", padX + 24, curY + 46);

      // Right Column: Proven System
      const rightX = padX + colW + 24;
      ctx.fillStyle = "rgba(16, 185, 129, 0.14)";
      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(rightX, curY, colW, colH, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#10B981";
      ctx.font = "900 24px system-ui, -apple-system, sans-serif";
      ctx.fillText("✓ DO THIS INSTEAD", rightX + 24, curY + 46);

      const itemGap = Math.floor((colH - 80) / Math.max(1, steps.length));
      steps.forEach((stepText, idx) => {
        const iy = curY + 86 + idx * itemGap;
        ctx.fillStyle = activeTheme.textSub;
        ctx.font = "700 21px system-ui, -apple-system, sans-serif";
        const mLines = wrapPinText(
          ctx,
          `Skipping step #${idx + 1} and relying on guesswork`,
          colW - 48,
          2,
        );
        mLines.forEach((l, li) => ctx.fillText(l, padX + 24, iy + li * 26));

        ctx.fillStyle = activeTheme.textMain;
        ctx.font = "800 22px system-ui, -apple-system, sans-serif";
        const sLines = wrapPinText(ctx, stepText, colW - 48, 3);
        sLines.forEach((l, li) => ctx.fillText(l, rightX + 24, iy + li * 26));
      });
    } else if (input.template === "bento-grid-pin") {
      // 2x3 Bento Grid Cheat Sheet
      const cols = 2;
      const rows = Math.ceil(Math.max(4, steps.length) / cols);
      const gap = 18;
      const cardW = Math.floor((W - padX * 2 - gap) / cols);
      const cardH = Math.floor((availH - gap * (rows - 1)) / rows);

      steps.forEach((stepText, idx) => {
        const r = Math.floor(idx / cols);
        const c = idx % cols;
        const isLastFull = idx === steps.length - 1 && steps.length % 2 === 1;
        const w = isLastFull ? W - padX * 2 : cardW;
        const x = padX + c * (cardW + gap);
        const y = curY + r * (cardH + gap);
        const col = palette[idx % palette.length];

        ctx.fillStyle = activeTheme.cardBg;
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(x, y, w, cardH, 24);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.roundRect(x + 22, y + 20, 96, 36, 12);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 18px system-ui, -apple-system, sans-serif";
        ctx.fillText(`TIP #0${idx + 1}`, x + 36, y + 44);

        ctx.fillStyle = activeTheme.textMain;
        ctx.font = "800 24px system-ui, -apple-system, sans-serif";
        const sLines = wrapPinText(ctx, stepText, w - 44, 4);
        let sy = y + 92;
        for (const l of sLines) {
          ctx.fillText(l, x + 22, sy);
          sy += 31;
        }
      });
    } else if (input.template === "stat-donut-pin") {
      // Hero Stat Donut Ring + 4 Takeaway Cards
      const ringBoxH = 230;
      ctx.fillStyle = activeTheme.cardBg;
      ctx.strokeStyle = activeTheme.accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(padX, curY, W - padX * 2, ringBoxH, 26);
      ctx.fill();
      ctx.stroke();

      const cx = padX + 125;
      const cy = curY + ringBoxH / 2;
      ctx.strokeStyle = "rgba(148,163,184,0.22)";
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.arc(cx, cy, 74, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = activeTheme.accent;
      ctx.lineWidth = 18;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(cx, cy, 74, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.88);
      ctx.stroke();

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "900 34px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("3.4x", cx, cy + 12);
      ctx.textAlign = "left";

      ctx.fillStyle = activeTheme.accent;
      ctx.font = "900 22px system-ui, -apple-system, sans-serif";
      ctx.fillText("PROVEN GROWTH BENCHMARK", padX + 235, curY + 76);

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "700 26px system-ui, -apple-system, sans-serif";
      const bLines = wrapPinText(
        ctx,
        steps[0] ||
          "Consistent 2:3 visual pins compound evergreen search clicks.",
        W - padX * 2 - 260,
        3,
      );
      bLines.forEach((l, li) =>
        ctx.fillText(l, padX + 235, curY + 118 + li * 32),
      );

      const listTop = curY + ringBoxH + 20;
      const remH = H - footerH - listTop - 20;
      const subSteps = steps.slice(1, 5);
      const rH = Math.floor(
        (remH - 14 * (subSteps.length - 1)) / Math.max(1, subSteps.length),
      );
      subSteps.forEach((st, idx) => {
        const y = listTop + idx * (rH + 14);
        ctx.fillStyle = activeTheme.cardBg;
        ctx.strokeStyle = activeTheme.cardBorder;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(padX, y, W - padX * 2, rH, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = palette[idx % palette.length];
        ctx.font = "900 24px system-ui, -apple-system, sans-serif";
        ctx.fillText(`0${idx + 1}`, padX + 26, y + rH / 2 + 8);

        ctx.fillStyle = activeTheme.textMain;
        ctx.font = "800 24px system-ui, -apple-system, sans-serif";
        const lines = wrapPinText(ctx, st, W - padX * 2 - 110, 2);
        lines.forEach((l, li) =>
          ctx.fillText(
            l,
            padX + 82,
            y + rH / 2 + (lines.length === 1 ? 8 : -8 + li * 28),
          ),
        );
      });
    } else if (input.template === "quote-tip-poster-pin") {
      // Authority Quote & Golden Rule Poster
      const quoteBoxH = Math.floor(availH * 0.46);
      ctx.fillStyle = activeTheme.cardBg;
      ctx.strokeStyle = activeTheme.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(padX, curY, W - padX * 2, quoteBoxH, 28);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = activeTheme.accent;
      ctx.font = "900 96px Georgia, serif";
      ctx.fillText("“", padX + 28, curY + 92);

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "800 32px Georgia, serif";
      const qLines = wrapPinText(
        ctx,
        steps[0] || customSubtext,
        W - padX * 2 - 80,
        4,
      );
      qLines.forEach((l, li) =>
        ctx.fillText(l, padX + 44, curY + 120 + li * 42),
      );

      const lowerTop = curY + quoteBoxH + 22;
      const lowerH = H - footerH - lowerTop - 22;
      const rules = steps.slice(1, 4);
      const rH = Math.floor(
        (lowerH - 14 * (rules.length - 1)) / Math.max(1, rules.length),
      );
      rules.forEach((st, idx) => {
        const y = lowerTop + idx * (rH + 14);
        ctx.fillStyle = activeTheme.cardBg;
        ctx.beginPath();
        ctx.roundRect(padX, y, W - padX * 2, rH, 18);
        ctx.fill();
        ctx.fillStyle = activeTheme.accentSecondary;
        ctx.font = "900 22px system-ui, -apple-system, sans-serif";
        ctx.fillText(`★ RULE #${idx + 1}`, padX + 24, y + 36);
        ctx.fillStyle = activeTheme.textMain;
        ctx.font = "700 24px system-ui, -apple-system, sans-serif";
        const lines = wrapPinText(ctx, st, W - padX * 2 - 48, 2);
        lines.forEach((l, li) => ctx.fillText(l, padX + 24, y + 70 + li * 28));
      });
    } else {
      // Standard & Step Roadmap / Checklist / Ribbon Templates
      const stepCount = Math.max(1, steps.length);
      const rowGap = 16;
      const rowH = Math.min(
        136,
        Math.max(
          82,
          Math.floor((availH - rowGap * (stepCount - 1)) / stepCount),
        ),
      );

      if (input.template === "step-mini-infographic") {
        // Draw vertical timeline spine connecting all step badges
        ctx.strokeStyle = activeTheme.accent;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(padX + 50, curY + 30);
        ctx.lineTo(
          padX + 50,
          curY + (stepCount - 1) * (rowH + rowGap) + rowH - 30,
        );
        ctx.stroke();
      }

      steps.forEach((stepText, idx) => {
        const y = curY + idx * (rowH + rowGap);
        const col =
          input.template === "ribbon-banner-pin"
            ? palette[idx % palette.length]
            : activeTheme.accent;

        ctx.fillStyle = activeTheme.cardBg;
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(padX, y, W - padX * 2, rowH, 22);
        ctx.fill();
        ctx.stroke();

        if (input.template === "ribbon-banner-pin") {
          ctx.fillStyle = col;
          ctx.fillRect(padX, y, 16, rowH);
        }

        // Number / Check Badge inside Row
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.roundRect(padX + 24, y + (rowH - 52) / 2, 56, 52, 14);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 24px system-ui, -apple-system, sans-serif";
        ctx.fillText(
          input.template === "saveable-checklist-pin" ? "✓" : `0${idx + 1}`,
          padX + (input.template === "saveable-checklist-pin" ? 41 : 36),
          y + rowH / 2 + 9,
        );

        ctx.fillStyle = activeTheme.textMain;
        ctx.font = "800 26px system-ui, -apple-system, sans-serif";
        const sLines = wrapPinText(ctx, stepText, W - padX * 2 - 120, 2);
        let sy = sLines.length === 1 ? y + rowH / 2 + 9 : y + rowH / 2 - 8;
        for (const l of sLines) {
          ctx.fillText(l, padX + 100, sy);
          sy += 32;
        }
      });
    }

    // Bottom Domain Banner
    ctx.fillStyle = activeTheme.accent;
    ctx.fillRect(0, H - footerH, W, footerH);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 26px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      `🌐 ${(input.destinationDomain || "doitwithai.tools").toUpperCase()}`,
      padX,
      H - 35,
    );
    ctx.font = "800 22px system-ui, -apple-system, sans-serif";
    ctx.fillText("SAVE THIS PIN FOR LATER ★", W - padX - 320, H - 36);
  }, [
    input.template,
    input.destinationDomain,
    activeTheme,
    customBadge,
    customHeadline,
    customSubtext,
    pack.bulletSteps,
    loadedPhotoEl,
  ]);

  function downloadTallPinPng() {
    downloadCanvasAsPng(
      canvasRef.current,
      `pinterest-pin-1000x1500-${activeVarIdx + 1}.png`,
    );
    notify("Downloaded 1000×1500 Tall Pinterest Pin (.PNG)!");
  }

  function downloadPinAndSeoPackage() {
    downloadTallPinPng();
    const seoText = `PINTEREST PIN TITLE:\n${activePin.pinTitle}\n\nPINTEREST SEO DESCRIPTION:\n${activePin.seoDescription}\n\nHASHTAGS:\n${pack.hashtags.join(" ")}\n\nALT TEXT:\n${activePin.altText}\n\nSUGGESTED BOARD:\n${activePin.suggestedBoard}`;
    navigator.clipboard.writeText(
      `${activePin.pinTitle}\n\n${activePin.seoDescription}`,
    );
    const blob = new Blob([seoText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pinterest-pin-seo-pack.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded 1000×1500 Pin PNG + Pinterest SEO Copy Package!");
  }

  return (
    <section
      aria-label="Pinterest Tall Pin Visual Generator and SEO Studio"
      className={`${studioStyles.studio} mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6`}
    >
      <ToolRunOverlay
        active={loading}
        title="Designing 1000×1500 Tall Pinterest Pins & SEO Copy..."
        description="Building 2:3 vertical Pin graphics, overlay hooks, and keyword-indexed descriptions."
      />

      <UrlArticleExtractorBar
        label="Option 1: Paste Any Blog Post URL to Extract Steps, Photos & Auto-Design 1000×1500 Pinterest Pins"
        placeholder="Paste a blog URL to extract sub-topics, article images & generate tall Pins..."
        onExtracted={(data) => {
          setAiPack(null);
          const cleanTitle = (data.title || input.topicOrHeadline)
            .replace(/\s*\|\s*[^|]+$/g, "")
            .trim();
          let domain = "doitwithai.tools";
          try {
            domain = new URL(data.url).hostname.replace(/^www\./, "");
          } catch {}
          const nextInput: PinterestVisualInput = {
            ...input,
            topicOrHeadline: cleanTitle,
            targetKeyword: data.focusKeyword || input.targetKeyword,
            destinationDomain: domain,
            sourceStepsOrNotes:
              (data.keyTakeaways || []).join("\n") ||
              data.subTopics?.map((s) => s.title).join("\n") ||
              input.sourceStepsOrNotes,
          };
          setInput(nextInput);
          if (data.images?.length) {
            setExtractedImages(data.images);
            setSelectedPhotoUrl(data.images[0].src);
          }
          void runGenerateAiPins(nextInput);
        }}
        onSelectSubTopic={(sub) => {
          setAiPack(null);
          const nextInput: PinterestVisualInput = {
            ...input,
            topicOrHeadline: sub.title,
            sourceStepsOrNotes: sub.content,
          };
          setInput(nextInput);
          void runGenerateAiPins(nextInput);
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
        className="shadow-xs space-y-6 rounded-2xl border-2 border-[#E60023]/25 bg-white p-5 focus:outline-none dark:border-[#E60023]/35 dark:bg-[#111827] sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <PlatformBrandIcon
              platform="pinterest"
              slug="pinterest-pin-visual-generator"
              size={42}
            />
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#E60023]">
                <Layers size={14} />
                12 Editable 2:3 Tall Pin Templates (1000×1500 HD)
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Pinterest Tall Pin Visual Designer &amp; Search SEO Studio
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void runGenerateAiPins()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#E60023] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#c8001e]"
            >
              <Sparkles size={14} />
              Generate 3 AI Pin Variations
            </button>
            <button
              type="button"
              onClick={downloadPinAndSeoPackage}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-slate-800 dark:bg-[#3452d1]"
            >
              <PackageCheck size={15} />
              Download 1000×1500 Pin + SEO Package
            </button>
          </div>
        </div>

        <details className="rounded-2xl border border-slate-400/30 p-4">
          <summary className="font-semibold">Choose a template</summary>
          <div className="mt-4">
            {/* 12 Template Selector */}
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {PIN_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() =>
                    setInput((prev) => ({ ...prev, template: tpl.id }))
                  }
                  className={`rounded-xl border p-2.5 text-left transition ${
                    input.template === tpl.id
                      ? "border-[#E60023] bg-[#E60023]/10 dark:border-[#E60023] dark:bg-[#E60023]/20"
                      : "border-slate-200 bg-slate-50/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60"
                  }`}
                >
                  <TemplateThumbnail id={tpl.id} category="side-image" />
                  <strong className="block text-xs font-extrabold text-slate-900 dark:text-white">
                    {tpl.label}
                  </strong>
                  <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                    {tpl.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </details>
        {/* 10 Color Themes + Custom Brand Color Pickers */}
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              <Palette size={14} className="text-[#E60023]" />
              10 Pin Color Palettes &amp; Live Custom Brand Color Pickers
            </span>
            {Object.keys(customColors).length > 0 && (
              <button
                type="button"
                onClick={() => setCustomColors({})}
                className="text-[11px] font-bold text-[#E60023] hover:underline"
              >
                Reset Custom Colors
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {STUDIO_COLOR_THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setThemeId(t.id);
                  setCustomColors({});
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-extrabold transition ${
                  themeId === t.id && Object.keys(customColors).length === 0
                    ? "shadow-xs border-[#E60023] bg-[#E60023] text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full border border-white/40"
                  style={{ background: t.accent }}
                />
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <input
                type="color"
                value={activeTheme.bgStart}
                onChange={(e) =>
                  setCustomColors((prev) => ({
                    ...prev,
                    bgStart: e.target.value,
                    bgEnd: e.target.value,
                  }))
                }
                className="h-5 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span>Pin BG</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <input
                type="color"
                value={
                  activeTheme.cardBg.startsWith("#")
                    ? activeTheme.cardBg
                    : "#1e293b"
                }
                onChange={(e) =>
                  setCustomColors((prev) => ({
                    ...prev,
                    cardBg: e.target.value,
                  }))
                }
                className="h-5 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span>Card Surface</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <input
                type="color"
                value={activeTheme.accent}
                onChange={(e) =>
                  setCustomColors((prev) => ({
                    ...prev,
                    accent: e.target.value,
                  }))
                }
                className="h-5 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span>Accent Badge</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <input
                type="color"
                value={activeTheme.textMain}
                onChange={(e) =>
                  setCustomColors((prev) => ({
                    ...prev,
                    textMain: e.target.value,
                  }))
                }
                className="h-5 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span>Text Color</span>
            </label>
          </div>
        </div>

        {/* 1-Click Extracted Article Photo Picker */}
        {extractedImages.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                <ImageIcon size={14} className="text-[#E60023]" />
                Click Any Extracted Article Image to Feature on Your Tall Pin:
              </span>
              {selectedPhotoUrl && (
                <button
                  type="button"
                  onClick={() => setSelectedPhotoUrl("")}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Clear Photo
                </button>
              )}
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {extractedImages.slice(0, 8).map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedPhotoUrl(img.src);
                    setInput((prev) => ({
                      ...prev,
                      template: "editorial-cover-pin",
                    }));
                    notify("Applied article photo to 1000×1500 Pinterest Pin!");
                  }}
                  className={`shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    selectedPhotoUrl === img.src
                      ? "border-[#E60023] ring-2 ring-[#E60023]/30"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt || `Article visual ${idx + 1}`}
                    className="h-14 w-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
          {/* LEFT: PIN VARIATION SWITCHER, INLINE TEXT OVERLAY EDITOR & SEO COPY */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {pack.pinVariations.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveVarIdx(i)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                    activeVarIdx === i
                      ? "shadow-xs bg-[#E60023] text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  }`}
                >
                  Pin Angle #{i + 1}: {v.pinBadge}
                </button>
              ))}
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Top Badge Overlay
                  </label>
                  <input
                    type="text"
                    value={customBadge}
                    onChange={(e) => setCustomBadge(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Destination Domain Footer
                  </label>
                  <input
                    type="text"
                    value={input.destinationDomain}
                    onChange={(e) =>
                      setInput((prev) => ({
                        ...prev,
                        destinationDomain: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Pin Canvas Headline Overlay
                </label>
                <input
                  type="text"
                  value={customHeadline}
                  onChange={(e) => setCustomHeadline(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Pin Subtext Overlay
                </label>
                <input
                  type="text"
                  value={customSubtext}
                  onChange={(e) => setCustomSubtext(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Checklist / Roadmap Steps Rendered on Pin (One per line)
                </label>
                <textarea
                  rows={4}
                  value={input.sourceStepsOrNotes}
                  onChange={(e) => {
                    setAiPack(null);
                    setInput((prev) => ({
                      ...prev,
                      sourceStepsOrNotes: e.target.value,
                    }));
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs leading-5 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
            </div>

            {/* PINTEREST SEO TITLE, DESCRIPTION & ALT TEXT */}
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#E60023]">
                  Pinterest Search SEO Copy (Title + Description + Alt Text)
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      `${activePin.pinTitle}\n\n${activePin.seoDescription}`,
                    );
                    notify("Copied Pin Title + SEO Description!");
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white"
                >
                  <Copy size={12} /> Copy Pin SEO
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <strong className="text-slate-500">Pin Title (100c): </strong>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {activePin.pinTitle}
                  </span>
                </div>
                <div>
                  <strong className="text-slate-500">SEO Description: </strong>
                  <p className="mt-0.5 leading-relaxed text-slate-700 dark:text-slate-300">
                    {activePin.seoDescription}
                  </p>
                </div>
                <div>
                  <strong className="text-slate-500">Suggested Board: </strong>
                  <span className="font-semibold text-[#E60023]">
                    {activePin.suggestedBoard}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE 1000x1500 (2:3) TALL PINTEREST PIN CANVAS WITH HOVER EXPORT BAR */}
          <div className="space-y-3">
            <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-slate-300 bg-slate-950 p-2 shadow-lg dark:border-slate-700">
              {/* Floating Hover Download Bar */}
              <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/15 bg-slate-950/90 px-3.5 py-2.5 opacity-0 shadow-2xl backdrop-blur-md transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-white">
                  1000×1500 Tall Pin Export
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={downloadTallPinPng}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#E60023] px-2.5 py-1.5 text-[11px] font-extrabold text-white hover:bg-[#c8001e]"
                  >
                    <Download size={12} /> PNG
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadCanvasAsEmbeddedSvg(
                        canvasRef.current,
                        `pinterest-pin-1000x1500-${activeVarIdx + 1}.svg`,
                      );
                      notify("Downloaded Scalable Vector Pin (.SVG)!");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-[11px] font-extrabold text-white hover:bg-white/25"
                  >
                    <FileCode2 size={12} /> SVG
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      printCanvasAsPdfPoster(
                        canvasRef.current,
                        activePin.pinTitle,
                        activePin.seoDescription,
                      );
                      notify("Opened Print-Ready PDF Poster View!");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-[11px] font-extrabold text-white hover:bg-white/25"
                  >
                    <FileText size={12} /> PDF
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await copyCanvasImageToClipboard(
                        canvasRef.current,
                      );
                      notify(
                        ok
                          ? "Copied 1000×1500 Pin Image to Clipboard!"
                          : "Use PNG Download on this browser.",
                      );
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-extrabold text-white hover:bg-emerald-500"
                  >
                    <Copy size={12} /> Copy
                  </button>
                </div>
              </div>

              <canvas
                ref={canvasRef}
                className="mx-auto block h-auto max-h-[680px] w-full rounded-xl object-contain"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadTallPinPng}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#E60023] px-4 py-3 text-xs font-extrabold text-white shadow-sm hover:bg-[#c8001e]"
              >
                <Download size={15} />
                Download 1000×1500 Tall Pin (.PNG)
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadCanvasAsEmbeddedSvg(
                    canvasRef.current,
                    `pinterest-pin-1000x1500-${activeVarIdx + 1}.svg`,
                  );
                  notify("Downloaded Scalable Vector Pin (.SVG)!");
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <FileCode2 size={14} /> SVG
              </button>
              <button
                type="button"
                onClick={() => {
                  printCanvasAsPdfPoster(
                    canvasRef.current,
                    activePin.pinTitle,
                    activePin.seoDescription,
                  );
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <FileText size={14} /> PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

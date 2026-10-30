"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Copy,
  Download,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { zipStored } from "../outreach-email/docx";
import { focusToolSection } from "../tool-ui/ToolRunOverlay";
import { docxMime } from "./docx";
import { filename, validate, type Article } from "./model";
import {
  articleToEpub,
  articleToMarkdown,
  buildLinkedinCarousel,
  buildNewsletter,
  buildPodcastScript,
  buildRasterCarouselPdf,
  buildSocialPosts,
  buildVideoScript,
  carouselPdf,
  CAROUSEL_THEME_PRESETS,
  countWords,
  ensureStructuredSocialText,
  newsletterDocx,
  newsletterHtml,
  newsletterTxt,
  podcastScriptDocx,
  podcastScriptTxt,
  recommendCarouselTemplate,
  socialPostsCsv,
  socialPostsTxt,
  videoScriptDocx,
  videoScriptTxt,
  type CarouselBrandConfig,
  type CarouselSlide,
  type CarouselTemplateId,
  type ConversionFormat,
  type NewsletterDraft,
  type PodcastScriptDraft,
  type SocialPost,
  type VideoScriptDraft,
} from "./formats";

const field =
  "w-full rounded-xl border border-slate-300 bg-transparent p-3 text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5271ff] dark:border-slate-600 dark:hover:bg-slate-800 disabled:opacity-50";
const primary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";

type DownloadAsset = {
  label: string;
  url: string;
  downloadName: string;
  primary?: boolean;
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 4,
): string[] {
  const words = (text || "").replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if (!w) continue;
    const test = (line + " " + w).trim();
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
      if (lines.length >= maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

/**
 * Miniature SVG layout preview inside each Template Selector Card so the user
 * immediately sees the unique structural architecture of each template.
 */
function TemplateLayoutThumbnail({
  template,
  bgColor,
  accentColor,
  cardBgColor,
  textColor,
}: {
  template: CarouselTemplateId;
  bgColor: string;
  accentColor: string;
  cardBgColor: string;
  textColor: string;
}) {
  return (
    <div
      className="relative mb-2.5 h-24 w-full overflow-hidden rounded-lg border border-slate-300/60 p-2.5 shadow-inner dark:border-slate-700"
      style={{ backgroundColor: bgColor, color: textColor }}
      aria-hidden="true"
    >
      {/* Top mini brand bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: accentColor }}
          />
          <span
            className="inline-block h-1.5 w-12 rounded opacity-80"
            style={{ backgroundColor: textColor }}
          />
        </div>
        <span
          className="inline-block h-1.5 w-6 rounded"
          style={{ backgroundColor: accentColor }}
        />
      </div>
      {/* Mini headline bar */}
      <div className="mt-2 space-y-1">
        <div
          className="h-2 w-3/4 rounded"
          style={{ backgroundColor: textColor }}
        />
        <div
          className="h-2 w-1/2 rounded"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      {/* Distinct structural diagram preview per template */}
      {template === "saas-comparison" && (
        <div className="relative mt-2.5 h-10 w-full">
          <div className="absolute left-0 top-0 h-7 w-[48%] rounded border border-white/40 bg-white p-1 shadow">
            <div className="flex gap-0.5">
              <span className="h-1 w-1 rounded-full bg-red-400" />
              <span className="h-1 w-1 rounded-full bg-amber-400" />
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
            </div>
            <div className="mt-1 h-1.5 w-4/5 rounded bg-slate-700" />
          </div>
          <div
            className="absolute bottom-0 right-0 h-7 w-[48%] rounded border p-1 shadow"
            style={{
              backgroundColor: cardBgColor,
              borderColor: accentColor,
            }}
          >
            <div
              className="h-1.5 w-3/4 rounded"
              style={{ backgroundColor: accentColor }}
            />
            <div className="mt-1 h-1 w-full rounded bg-white/70" />
          </div>
        </div>
      )}

      {template === "before-after" && (
        <div className="mt-2 space-y-1">
          <div
            className="flex items-center justify-between rounded border border-white/20 px-1.5 py-1"
            style={{ backgroundColor: cardBgColor }}
          >
            <span className="text-[8px] font-black text-amber-400">BEFORE</span>
            <span className="h-1.5 w-2/3 rounded bg-white/60" />
          </div>
          <div
            className="flex items-center justify-between rounded border px-1.5 py-1"
            style={{
              backgroundColor: cardBgColor,
              borderColor: accentColor,
            }}
          >
            <span
              className="text-[8px] font-black"
              style={{ color: accentColor }}
            >
              AFTER ✓
            </span>
            <span className="h-1.5 w-2/3 rounded bg-white/90" />
          </div>
        </div>
      )}

      {template === "founder-playbook" && (
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex flex-col items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-2.5 w-full rounded border border-slate-300 bg-white" />
            <div className="h-2.5 w-full rounded border border-slate-300 bg-white" />
            <div className="h-2.5 w-full rounded border border-slate-300 bg-white" />
          </div>
        </div>
      )}

      {template === "executive-editorial" && (
        <div className="relative mt-2 flex items-center justify-between gap-2">
          <div
            className="flex-1 rounded border-l-4 p-1.5"
            style={{
              backgroundColor: cardBgColor,
              borderLeftColor: accentColor,
            }}
          >
            <div className="h-1.5 w-4/5 rounded bg-white/80" />
            <div className="mt-1 h-1.5 w-3/5 rounded bg-white/50" />
          </div>
          <span
            className="text-2xl font-black opacity-25"
            style={{ color: accentColor }}
          >
            01
          </span>
        </div>
      )}

      {template === "cyber-dark" && (
        <div className="mt-2 grid grid-cols-2 gap-1">
          <div
            className="col-span-2 h-3.5 rounded border px-1.5 py-0.5"
            style={{
              backgroundColor: cardBgColor,
              borderColor: accentColor,
            }}
          />
          <div
            className="h-4 rounded border border-white/15"
            style={{ backgroundColor: cardBgColor }}
          />
          <div
            className="h-4 rounded border border-white/15"
            style={{ backgroundColor: cardBgColor }}
          />
        </div>
      )}

      {template === "blueprint-grid" && (
        <div className="mt-2.5 flex items-center justify-between gap-1">
          <div
            className="h-6 flex-1 rounded border border-white/30 p-1"
            style={{ backgroundColor: cardBgColor }}
          />
          <span className="text-[10px] font-bold" style={{ color: accentColor }}>
            →
          </span>
          <div
            className="h-6 flex-1 rounded border-2 p-1"
            style={{
              backgroundColor: cardBgColor,
              borderColor: accentColor,
            }}
          />
          <span className="text-[10px] font-bold" style={{ color: accentColor }}>
            →
          </span>
          <div
            className="h-6 flex-1 rounded border border-white/30 p-1"
            style={{ backgroundColor: cardBgColor }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Studio-grade HTML5 Canvas renderer with:
 * - 6 genuinely distinct architectural templates (unique backgrounds + unique diagrams)
 * - 3 distinct slide archetypes:
 *   1. Slide 1 (`cover`): Hero Introduction Slide with "What You'll Learn" preview box & Swipe button
 *   2. Middle Slides (`point` / `comparison`): Step Progress + Template-Specific Visual Diagram
 *   3. Final Slide (`cta`): Quick Implementation Recap Checklist + High-Contrast Website CTA Banner
 */
function renderSlideCanvas(
  slide: CarouselSlide,
  totalSlides: number,
  config: CarouselBrandConfig,
  logoImg: HTMLImageElement | null,
): HTMLCanvasElement {
  const width = 1080;
  const height = config.aspect === "portrait" ? 1350 : 1080;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const isLightTheme =
    config.bgColor.toLowerCase() === "#f8fafc" ||
    config.bgColor.toLowerCase() === "#ffffff" ||
    config.textColor.toLowerCase() === "#0f172a";
  const cardTextPrimary =
    config.cardBgColor.toLowerCase() === "#ffffff" ? "#0F172A" : "#FFFFFF";
  const cardTextMuted =
    config.cardBgColor.toLowerCase() === "#ffffff" ? "#475569" : "#CBD5E1";

  // ==========================================================================
  // 1. TEMPLATE-SPECIFIC BACKGROUND GEOMETRY & TEXTURE
  // ==========================================================================
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, config.bgColor);
  grad.addColorStop(1, config.bgSecondaryColor || config.bgColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  if (config.template === "saas-comparison") {
    // Concentric orbital rings in top-right + soft bottom-left wave
    ctx.strokeStyle = config.accentColor;
    ctx.globalAlpha = 0.14;
    ctx.lineWidth = 3;
    for (let r = 180; r <= 540; r += 90) {
      ctx.beginPath();
      ctx.arc(width - 90, 160, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (config.template === "before-after") {
    // Dot-matrix grid + glowing radial spotlight
    ctx.fillStyle = config.accentColor;
    ctx.globalAlpha = 0.1;
    for (let dx = 60; dx < width; dx += 54) {
      for (let dy = 60; dy < height; dy += 54) {
        ctx.beginPath();
        ctx.arc(dx, dy, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (config.template === "founder-playbook") {
    // Crisp architectural diagonal ribbon in top-right + soft accent bar on left edge
    ctx.fillStyle = config.accentColor;
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.moveTo(width - 420, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, 420);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 0.85;
    ctx.fillRect(0, 0, 14, height);
  } else if (config.template === "executive-editorial") {
    // Magazine inset border frame + Giant Watermarked Slide Number
    ctx.strokeStyle = config.accentColor;
    ctx.globalAlpha = 0.28;
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    ctx.fillStyle = config.accentColor;
    ctx.globalAlpha = 0.1;
    ctx.font = "900 250px Georgia, serif";
    const numStr = String(slide.number).padStart(2, "0");
    const nw = ctx.measureText(numStr).width;
    ctx.fillText(numStr, width - nw - 68, 290);
  } else if (config.template === "cyber-dark") {
    // HUD corner brackets + subtle carbon mesh
    ctx.strokeStyle = config.accentColor;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 4;
    const bLen = 48;
    const m = 42;
    // Top-left bracket
    ctx.beginPath();
    ctx.moveTo(m, m + bLen);
    ctx.lineTo(m, m);
    ctx.lineTo(m + bLen, m);
    ctx.stroke();
    // Top-right bracket
    ctx.beginPath();
    ctx.moveTo(width - m - bLen, m);
    ctx.lineTo(width - m, m);
    ctx.lineTo(width - m, m + bLen);
    ctx.stroke();
    // Bottom-left bracket
    ctx.beginPath();
    ctx.moveTo(m, height - m - bLen);
    ctx.lineTo(m, height - m);
    ctx.lineTo(m + bLen, height - m);
    ctx.stroke();
    // Bottom-right bracket
    ctx.beginPath();
    ctx.moveTo(width - m - bLen, height - m);
    ctx.lineTo(width - m, height - m);
    ctx.lineTo(width - m, height - m - bLen);
    ctx.stroke();
  } else if (config.template === "blueprint-grid") {
    // Technical coordinate grid + ruler ticks
    ctx.strokeStyle = config.accentColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.1;
    for (let gx = 0; gx < width; gx += 60) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = 0; gy < height; gy += 60) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }
  }
  ctx.restore();

  // ==========================================================================
  // 2. TOP BRAND HEADER + PROGRESS INDICATOR
  // ==========================================================================
  const padX = 76;
  const headerY = 72;
  if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
    const targetH = 54;
    const targetW = Math.min(
      180,
      (logoImg.naturalWidth / logoImg.naturalHeight) * targetH,
    );
    ctx.drawImage(logoImg, padX, headerY, targetW, targetH);
    ctx.fillStyle = config.textColor;
    ctx.font = "800 27px system-ui, -apple-system, sans-serif";
    ctx.fillText(config.brandName, padX + targetW + 16, headerY + 36);
  } else {
    ctx.save();
    drawRoundedRect(ctx, padX, headerY, 52, 52, 14);
    ctx.fillStyle = config.accentColor;
    ctx.fill();
    ctx.fillStyle = isLightTheme ? "#FFFFFF" : config.bgColor;
    ctx.font = "900 23px system-ui, sans-serif";
    const initials =
      (config.brandName || "AI")
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "AI";
    ctx.fillText(initials, padX + 13, headerY + 35);
    ctx.restore();

    ctx.fillStyle = config.textColor;
    ctx.font = "800 27px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      config.brandName || "Do It With AI Tools",
      padX + 68,
      headerY + 35,
    );
  }

  // Top-right slide role badge or progress bar
  const roleLabel =
    slide.kind === "cover"
      ? "COVER PLAYBOOK"
      : slide.kind === "cta"
        ? "FINAL CHECKLIST"
        : `STEP ${String(slide.number - 1).padStart(2, "0")} OF ${String(Math.max(1, totalSlides - 2)).padStart(2, "0")}`;
  ctx.save();
  ctx.font = "800 18px system-ui, sans-serif";
  const rlW = ctx.measureText(roleLabel).width + 36;
  drawRoundedRect(ctx, width - padX - rlW, headerY + 8, rlW, 38, 19);
  ctx.fillStyle = isLightTheme ? "rgba(37,99,235,0.12)" : "rgba(255,255,255,0.12)";
  ctx.fill();
  ctx.fillStyle = config.accentColor;
  ctx.fillText(roleLabel, width - padX - rlW + 18, headerY + 33);
  ctx.restore();

  // ==========================================================================
  // 3. ARCHETYPE A: FIRST SLIDE (`cover` — HERO INTRODUCTION SLIDE)
  // ==========================================================================
  if (slide.kind === "cover") {
    // Kicker pill
    const kicker = (slide.kicker || config.categoryKicker || "PRACTICAL PLAYBOOK").toUpperCase();
    ctx.save();
    ctx.font = "800 21px system-ui, sans-serif";
    const kw = ctx.measureText(kicker).width + 36;
    drawRoundedRect(ctx, padX, headerY + 86, kw, 42, 12);
    ctx.fillStyle = config.accentColor;
    ctx.fill();
    ctx.fillStyle = isLightTheme ? "#FFFFFF" : "#0F172A";
    ctx.fillText(kicker, padX + 18, headerY + 114);
    ctx.restore();

    // Giant Hero Headline (64px)
    ctx.font = "900 64px system-ui, -apple-system, sans-serif";
    const headLines = wrapCanvasText(ctx, slide.headline, width - padX * 2, 4);
    let y = headerY + 206;
    const hlLower = (slide.highlightPhrase || "").toLowerCase().trim();

    headLines.forEach((line, idx) => {
      const isHighlighted =
        (hlLower && line.toLowerCase().includes(hlLower)) ||
        (!hlLower && idx === headLines.length - 1 && headLines.length > 1);
      ctx.fillStyle = isHighlighted ? config.accentColor : config.textColor;
      ctx.fillText(line, padX, y);
      y += 76;
    });

    // Lead Hook Subtitle
    y += 8;
    ctx.font = "500 32px system-ui, sans-serif";
    ctx.fillStyle = config.textColor;
    ctx.globalAlpha = 0.9;
    const bodyLines = wrapCanvasText(ctx, slide.body, width - padX * 2, 3);
    for (const bl of bodyLines) {
      ctx.fillText(bl, padX, y);
      y += 45;
    }
    ctx.globalAlpha = 1;

    // Cover Preview Card: "WHAT YOU WILL LEARN IN THIS CAROUSEL"
    const boxTop = Math.max(y + 32, config.aspect === "portrait" ? 660 : 530);
    const boxH = config.aspect === "portrait" ? 430 : 320;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 12;
    drawRoundedRect(ctx, padX, boxTop, width - padX * 2, boxH, 28);
    ctx.fillStyle = config.cardBgColor;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = config.accentColor;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = config.accentColor;
    ctx.font = "800 22px system-ui, sans-serif";
    ctx.fillText(
      "INSIDE THIS STEP-BY-STEP BREAKDOWN:",
      padX + 38,
      boxTop + 52,
    );

    const previewItems =
      slide.bullets && slide.bullets.length >= 2
        ? slide.bullets.slice(0, 3)
        : [
            `01. ${slide.cardLeftBody.slice(0, 68)}`,
            `02. ${slide.cardRightBody.slice(0, 68)}`,
            `03. ${slide.stepThirdBody || "Complete implementation checklist"}`,
          ];

    const rowGap = config.aspect === "portrait" ? 110 : 78;
    previewItems.forEach((item, idx) => {
      const rowY = boxTop + 104 + idx * rowGap;
      ctx.save();
      drawRoundedRect(ctx, padX + 38, rowY - 32, 46, 46, 12);
      ctx.fillStyle = config.accentColor;
      ctx.fill();
      ctx.fillStyle = isLightTheme ? "#FFFFFF" : "#0F172A";
      ctx.font = "900 22px system-ui, sans-serif";
      ctx.fillText(`0${idx + 1}`, padX + 48, rowY - 1);
      ctx.restore();

      ctx.fillStyle = cardTextPrimary;
      ctx.font = "700 27px system-ui, sans-serif";
      const cleanItem = item.replace(/^0?\d+\.\s*/, "");
      const lines = wrapCanvasText(ctx, cleanItem, width - padX * 2 - 120, 2);
      lines.forEach((l, lIdx) => {
        ctx.fillText(l, padX + 102, rowY - 4 + lIdx * 34);
      });
    });

    // Cover Footer + "SWIPE TO EXPLORE ->" Pill Button
    const footerY = height - 76;
    ctx.fillStyle = config.accentColor;
    ctx.font = "800 25px system-ui, sans-serif";
    ctx.fillText(config.websiteUrl || "doitwithai.tools", padX, footerY);

    const swipeText = "SWIPE TO EXPLORE →";
    ctx.font = "900 23px system-ui, sans-serif";
    const swW = ctx.measureText(swipeText).width + 48;
    ctx.save();
    drawRoundedRect(ctx, width - padX - swW, footerY - 38, swW, 54, 27);
    ctx.fillStyle = config.accentColor;
    ctx.fill();
    ctx.fillStyle = isLightTheme ? "#FFFFFF" : "#0F172A";
    ctx.fillText(swipeText, width - padX - swW + 24, footerY - 3);
    ctx.restore();

    return canvas;
  }

  // ==========================================================================
  // 4. ARCHETYPE B: LAST SLIDE (`cta` — DEDICATED SUMMARY & CTA SLIDE)
  // ==========================================================================
  if (slide.kind === "cta") {
    ctx.font = "800 21px system-ui, sans-serif";
    ctx.fillStyle = config.accentColor;
    ctx.fillText(
      (slide.kicker || "FINAL SUMMARY & NEXT STEP").toUpperCase(),
      padX,
      headerY + 96,
    );

    ctx.font = "900 56px system-ui, -apple-system, sans-serif";
    const headLines = wrapCanvasText(ctx, slide.headline, width - padX * 2, 3);
    let y = headerY + 168;
    const hlLower = (slide.highlightPhrase || "").toLowerCase().trim();
    headLines.forEach((line, idx) => {
      const isHighlighted =
        (hlLower && line.toLowerCase().includes(hlLower)) ||
        idx === headLines.length - 1;
      ctx.fillStyle = isHighlighted ? config.accentColor : config.textColor;
      ctx.fillText(line, padX, y);
      y += 66;
    });

    y += 6;
    ctx.font = "500 29px system-ui, sans-serif";
    ctx.fillStyle = config.textColor;
    ctx.globalAlpha = 0.9;
    const bodyLines = wrapCanvasText(ctx, slide.body, width - padX * 2, 2);
    for (const bl of bodyLines) {
      ctx.fillText(bl, padX, y);
      y += 42;
    }
    ctx.globalAlpha = 1;

    // 1. Implementation Recap Checklist Box
    const checklistTop = Math.max(y + 20, config.aspect === "portrait" ? 500 : 430);
    const checklistH = config.aspect === "portrait" ? 390 : 270;
    ctx.save();
    drawRoundedRect(ctx, padX, checklistTop, width - padX * 2, checklistH, 24);
    ctx.fillStyle = config.cardBgColor;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = config.accentColor;
    ctx.font = "800 21px system-ui, sans-serif";
    ctx.fillText(
      "KEY IMPLEMENTATION CHECKLIST:",
      padX + 34,
      checklistTop + 46,
    );

    const recapItems =
      slide.bullets && slide.bullets.length >= 2
        ? slide.bullets.slice(0, 3)
        : [
            slide.cardLeftBody,
            slide.stepThirdBody || "Review every section for accuracy and tone.",
            "Connect your workflow to measurable audience outcomes.",
          ];

    const itemSpacing = config.aspect === "portrait" ? 102 : 68;
    recapItems.forEach((item, idx) => {
      const iy = checklistTop + 98 + idx * itemSpacing;
      ctx.save();
      ctx.beginPath();
      ctx.arc(padX + 52, iy - 10, 18, 0, Math.PI * 2);
      ctx.fillStyle = config.accentColor;
      ctx.fill();
      ctx.fillStyle = isLightTheme ? "#FFFFFF" : "#0F172A";
      ctx.font = "900 20px system-ui, sans-serif";
      ctx.fillText("✓", padX + 44, iy - 3);
      ctx.restore();

      ctx.fillStyle = cardTextPrimary;
      ctx.font = "600 25px system-ui, sans-serif";
      const lines = wrapCanvasText(
        ctx,
        item,
        width - padX * 2 - 108,
        config.aspect === "portrait" ? 2 : 1,
      );
      lines.forEach((l, lIdx) => {
        ctx.fillText(l, padX + 86, iy - 2 + lIdx * 32);
      });
    });

    // 2. Giant Highlighted Call-To-Action Banner Box at Bottom
    const ctaBoxTop = checklistTop + checklistH + 28;
    const ctaBoxH = config.aspect === "portrait" ? 230 : 185;
    ctx.save();
    drawRoundedRect(ctx, padX, ctaBoxTop, width - padX * 2, ctaBoxH, 26);
    ctx.fillStyle = config.accentColor;
    ctx.fill();
    ctx.restore();

    const ctaFg = isLightTheme ? "#FFFFFF" : "#0F172A";
    ctx.fillStyle = ctaFg;
    ctx.font = "900 22px system-ui, sans-serif";
    ctx.fillText(
      "READ THE COMPLETE GUIDE & TOOLS AT:",
      padX + 36,
      ctaBoxTop + 48,
    );

    // Website pill inside CTA box
    ctx.save();
    drawRoundedRect(
      ctx,
      padX + 36,
      ctaBoxTop + 68,
      width - padX * 2 - 72,
      74,
      18,
    );
    ctx.fillStyle = "#0F172A";
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 29px system-ui, sans-serif";
    const urlDisplay = (
      slide.cardRightBody ||
      config.websiteUrl ||
      "doitwithai.tools"
    )
      .replace(/^https?:\/\//i, "")
      .slice(0, 44);
    ctx.fillText(`🌐  ${urlDisplay}`, padX + 60, ctaBoxTop + 116);
    ctx.restore();

    if (config.aspect === "portrait") {
      ctx.fillStyle = ctaFg;
      ctx.font = "800 21px system-ui, sans-serif";
      ctx.fillText(
        "↻ Repost to help your network   ·   ♥ Save for later   ·   + Follow",
        padX + 36,
        ctaBoxTop + 190,
      );
    }

    // Bottom counter
    const counterStr = `${String(slide.number).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")}`;
    ctx.fillStyle = config.textColor;
    ctx.font = "800 24px system-ui, sans-serif";
    const cw = ctx.measureText(counterStr).width;
    ctx.fillText(counterStr, width - padX - cw, height - 44);

    return canvas;
  }

  // ==========================================================================
  // 5. ARCHETYPE C: MIDDLE SLIDES (`point` / `comparison` — 6 UNIQUE LAYOUTS)
  // ==========================================================================
  const kickerText = (
    slide.kicker ||
    config.categoryKicker ||
    `STEP 0${slide.number - 1}`
  ).toUpperCase();
  ctx.font = "800 21px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = config.accentColor;
  ctx.fillText(kickerText, padX, headerY + 96);

  ctx.font = "900 54px system-ui, -apple-system, sans-serif";
  const headLines = wrapCanvasText(ctx, slide.headline, width - padX * 2, 3);
  let y = headerY + 166;
  const hlLower = (slide.highlightPhrase || "").toLowerCase().trim();

  headLines.forEach((line, idx) => {
    const isHighlightedLine =
      (hlLower && line.toLowerCase().includes(hlLower)) ||
      (!hlLower && idx === headLines.length - 1 && headLines.length > 1);
    ctx.fillStyle = isHighlightedLine ? config.accentColor : config.textColor;
    ctx.fillText(line, padX, y);
    y += 64;
  });

  y += 8;
  ctx.font = "500 29px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = config.textColor;
  ctx.globalAlpha = 0.9;
  const bodyLines = wrapCanvasText(ctx, slide.body, width - padX * 2, 3);
  for (const bl of bodyLines) {
    ctx.fillText(bl, padX, y);
    y += 42;
  }
  ctx.globalAlpha = 1;

  const cardAreaTop = Math.max(y + 24, config.aspect === "portrait" ? 590 : 490);
  const cardAreaHeight = config.aspect === "portrait" ? 510 : 380;

  if (config.template === "before-after") {
    // ------------------------------------------------------------------------
    // TEMPLATE 2: Stacked BEFORE -> Transformation Badge -> AFTER Cards
    // ------------------------------------------------------------------------
    const boxH = Math.floor((cardAreaHeight - 48) / 2);
    const drawFlowBox = (
      topY: number,
      badge: string,
      content: string,
      isAfter: boolean,
    ) => {
      ctx.save();
      drawRoundedRect(ctx, padX, topY, width - padX * 2, boxH, 24);
      ctx.fillStyle = config.cardBgColor;
      ctx.globalAlpha = isAfter ? 0.98 : 0.82;
      ctx.fill();
      ctx.lineWidth = isAfter ? 4 : 2;
      ctx.strokeStyle = isAfter ? config.accentColor : "rgba(255,255,255,0.22)";
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = isAfter ? config.accentColor : "#F59E0B";
      ctx.font = "900 21px system-ui, sans-serif";
      ctx.fillText(
        isAfter ? `✓  ${badge.toUpperCase()}` : `✕  ${badge.toUpperCase()}`,
        padX + 32,
        topY + 44,
      );

      ctx.fillStyle = cardTextPrimary;
      ctx.font = "600 27px system-ui, sans-serif";
      const lines = wrapCanvasText(ctx, content, width - padX * 2 - 64, 3);
      lines.forEach((l, lIdx) => {
        ctx.fillText(l, padX + 32, topY + 88 + lIdx * 36);
      });
    };

    drawFlowBox(
      cardAreaTop,
      slide.cardLeftTitle || "OLD WAY / WITHOUT SYSTEM",
      slide.cardLeftBody,
      false,
    );
    drawFlowBox(
      cardAreaTop + boxH + 44,
      slide.cardRightTitle || "NEW SYSTEM / ACTIONABLE FIX",
      slide.cardRightBody,
      true,
    );

    // Center circular arrow connector badge
    const midY = cardAreaTop + boxH + 22;
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, midY, 26, 0, Math.PI * 2);
    ctx.fillStyle = config.accentColor;
    ctx.fill();
    ctx.fillStyle = "#0F172A";
    ctx.font = "900 26px system-ui, sans-serif";
    ctx.fillText("↓", width / 2 - 8, midY + 9);
    ctx.restore();
  } else if (config.template === "founder-playbook") {
    // ------------------------------------------------------------------------
    // TEMPLATE 3: 3-Node Vertical Connected Roadmap / Timeline Spine
    // ------------------------------------------------------------------------
    const steps = [
      {
        title: slide.cardLeftTitle || "01 · CORE PRINCIPLE",
        body: slide.cardLeftBody,
      },
      {
        title: slide.cardRightTitle || "02 · OPERATOR ACTION",
        body: slide.cardRightBody,
      },
      {
        title: slide.stepThirdTitle || "03 · QUALITY VERIFICATION",
        body:
          slide.stepThirdBody ||
          slide.footer ||
          "Verify accuracy and measure impact before scaling.",
      },
    ];
    const stepH = Math.floor((cardAreaHeight - 36) / 3);
    const spineX = padX + 32;

    // Vertical connecting spine line
    ctx.save();
    ctx.strokeStyle = config.accentColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(spineX, cardAreaTop + 36);
    ctx.lineTo(spineX, cardAreaTop + cardAreaHeight - 36);
    ctx.stroke();
    ctx.restore();

    steps.forEach((st, sIdx) => {
      const topY = cardAreaTop + sIdx * (stepH + 18);
      const nodeY = topY + stepH / 2;

      // Numbered circle node on spine
      ctx.save();
      ctx.beginPath();
      ctx.arc(spineX, nodeY, 26, 0, Math.PI * 2);
      ctx.fillStyle = config.accentColor;
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 20px system-ui, sans-serif";
      ctx.fillText(`0${sIdx + 1}`, spineX - 12, nodeY + 7);
      ctx.restore();

      // Step card to the right of the spine
      const cardX = padX + 82;
      const cardW = width - padX * 2 - 82;
      ctx.save();
      ctx.shadowColor = "rgba(15, 23, 42, 0.08)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      drawRoundedRect(ctx, cardX, topY, cardW, stepH, 20);
      ctx.fillStyle = config.cardBgColor;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = sIdx === 1 ? config.accentColor : "rgba(148,163,184,0.35)";
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = config.accentColor;
      ctx.font = "800 18px system-ui, sans-serif";
      ctx.fillText(st.title.toUpperCase(), cardX + 26, topY + 36);

      ctx.fillStyle = cardTextPrimary;
      ctx.font = "600 24px system-ui, sans-serif";
      const lines = wrapCanvasText(ctx, st.body, cardW - 52, 2);
      lines.forEach((l, lIdx) => {
        ctx.fillText(l, cardX + 26, topY + 72 + lIdx * 30);
      });
    });
  } else if (config.template === "executive-editorial") {
    // ------------------------------------------------------------------------
    // TEMPLATE 4: Magazine Pull-Quote Box + 2-Column Bottom Pillar Strip
    // ------------------------------------------------------------------------
    const quoteH = Math.floor(cardAreaHeight * 0.52);
    ctx.save();
    drawRoundedRect(ctx, padX, cardAreaTop, width - padX * 2, quoteH, 22);
    ctx.fillStyle = config.cardBgColor;
    ctx.fill();
    // Thick left editorial accent bar
    drawRoundedRect(ctx, padX, cardAreaTop, 16, quoteH, 8);
    ctx.fillStyle = config.accentColor;
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = config.accentColor;
    ctx.font = "900 72px Georgia, serif";
    ctx.fillText("“", padX + 36, cardAreaTop + 74);

    ctx.fillStyle = cardTextPrimary;
    ctx.font = "italic 600 29px Georgia, serif";
    const qLines = wrapCanvasText(
      ctx,
      slide.cardRightBody || slide.body,
      width - padX * 2 - 110,
      3,
    );
    qLines.forEach((ql, qIdx) => {
      ctx.fillText(ql, padX + 86, cardAreaTop + 68 + qIdx * 40);
    });

    // Bottom 2-column pillar strip
    const stripTop = cardAreaTop + quoteH + 24;
    const stripH = cardAreaHeight - quoteH - 24;
    const colW = Math.floor((width - padX * 2 - 24) / 2);

    [
      {
        label: slide.cardLeftTitle || "KEY OBSERVATION",
        text: slide.cardLeftBody,
        x: padX,
      },
      {
        label: slide.cardRightTitle || "OPERATOR RULE",
        text: slide.stepThirdBody || slide.cardRightBody,
        x: padX + colW + 24,
      },
    ].forEach((col) => {
      ctx.save();
      drawRoundedRect(ctx, col.x, stripTop, colW, stripH, 20);
      ctx.fillStyle = config.cardBgColor;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = config.accentColor;
      ctx.font = "800 18px system-ui, sans-serif";
      ctx.fillText(col.label.toUpperCase(), col.x + 26, stripTop + 40);

      ctx.fillStyle = cardTextPrimary;
      ctx.font = "600 24px system-ui, sans-serif";
      const lines = wrapCanvasText(ctx, col.text, colW - 52, 3);
      lines.forEach((l, lIdx) => {
        ctx.fillText(l, col.x + 26, stripTop + 78 + lIdx * 32);
      });
    });
  } else if (config.template === "cyber-dark") {
    // ------------------------------------------------------------------------
    // TEMPLATE 5: 3-Cell Asymmetric Bento Grid with Neon Checkmarks
    // ------------------------------------------------------------------------
    const topCellH = Math.floor(cardAreaHeight * 0.44);
    const botCellH = cardAreaHeight - topCellH - 24;
    const halfW = Math.floor((width - padX * 2 - 24) / 2);

    // Top Wide Bento Cell
    ctx.save();
    drawRoundedRect(ctx, padX, cardAreaTop, width - padX * 2, topCellH, 24);
    ctx.fillStyle = config.cardBgColor;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = config.accentColor;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = config.accentColor;
    ctx.font = "900 19px system-ui, sans-serif";
    ctx.fillText(
      `⚡  ${(slide.cardLeftTitle || "PRIMARY SYSTEM RULE").toUpperCase()}`,
      padX + 30,
      cardAreaTop + 44,
    );

    ctx.fillStyle = cardTextPrimary;
    ctx.font = "700 27px system-ui, sans-serif";
    const topLines = wrapCanvasText(
      ctx,
      slide.cardLeftBody,
      width - padX * 2 - 60,
      2,
    );
    topLines.forEach((tl, tIdx) => {
      ctx.fillText(tl, padX + 30, cardAreaTop + 88 + tIdx * 36);
    });

    // Bottom Left & Bottom Right Bento Cells
    [
      {
        title: slide.cardRightTitle || "ACTION STEP A",
        body: slide.cardRightBody,
        x: padX,
      },
      {
        title: slide.stepThirdTitle || "ACTION STEP B",
        body:
          slide.stepThirdBody ||
          "Verify output against your target reader task.",
        x: padX + halfW + 24,
      },
    ].forEach((cell) => {
      const cy = cardAreaTop + topCellH + 24;
      ctx.save();
      drawRoundedRect(ctx, cell.x, cy, halfW, botCellH, 24);
      ctx.fillStyle = config.cardBgColor;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = config.accentColor;
      ctx.font = "800 18px system-ui, sans-serif";
      ctx.fillText(`✓  ${cell.title.toUpperCase()}`, cell.x + 26, cy + 42);

      ctx.fillStyle = cardTextPrimary;
      ctx.font = "600 24px system-ui, sans-serif";
      const lines = wrapCanvasText(ctx, cell.body, halfW - 52, 3);
      lines.forEach((l, lIdx) => {
        ctx.fillText(l, cell.x + 26, cy + 82 + lIdx * 32);
      });
    });
  } else if (config.template === "blueprint-grid") {
    // ------------------------------------------------------------------------
    // TEMPLATE 6: 3-Node Horizontal Blueprint Architecture Diagram
    // ------------------------------------------------------------------------
    const nodeW = Math.floor((width - padX * 2 - 56) / 3);
    const nodeH = Math.floor(cardAreaHeight * 0.68);
    const nodes = [
      {
        tag: "[01 · INPUT]",
        title: slide.cardLeftTitle || "SOURCE SIGNAL",
        body: slide.cardLeftBody,
        active: false,
      },
      {
        tag: "[02 · ENGINE]",
        title: slide.cardRightTitle || "CORE PROCESS",
        body: slide.cardRightBody,
        active: true,
      },
      {
        tag: "[03 · OUTPUT]",
        title: slide.stepThirdTitle || "VERIFIED RESULT",
        body:
          slide.stepThirdBody || "Repeatable system ready for team execution.",
        active: false,
      },
    ];

    nodes.forEach((nd, nIdx) => {
      const nx = padX + nIdx * (nodeW + 28);
      ctx.save();
      drawRoundedRect(ctx, nx, cardAreaTop, nodeW, nodeH, 20);
      ctx.fillStyle = config.cardBgColor;
      ctx.fill();
      ctx.lineWidth = nd.active ? 4 : 2;
      ctx.strokeStyle = nd.active
        ? config.accentColor
        : "rgba(255,255,255,0.28)";
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = config.accentColor;
      ctx.font = "800 16px monospace";
      ctx.fillText(nd.tag, nx + 20, cardAreaTop + 38);

      ctx.fillStyle = cardTextPrimary;
      ctx.font = "800 21px system-ui, sans-serif";
      ctx.fillText(nd.title.slice(0, 18).toUpperCase(), nx + 20, cardAreaTop + 70);

      ctx.fillStyle = cardTextMuted;
      ctx.font = "600 22px system-ui, sans-serif";
      const lines = wrapCanvasText(ctx, nd.body, nodeW - 40, 4);
      lines.forEach((l, lIdx) => {
        ctx.fillText(l, nx + 20, cardAreaTop + 112 + lIdx * 31);
      });

      if (nIdx < 2) {
        const arrowX = nx + nodeW + 6;
        const arrowY = cardAreaTop + nodeH / 2;
        ctx.fillStyle = config.accentColor;
        ctx.font = "900 24px system-ui, sans-serif";
        ctx.fillText("→", arrowX, arrowY + 8);
      }
    });

    // Bottom technical specification bar
    const specTop = cardAreaTop + nodeH + 22;
    const specH = cardAreaHeight - nodeH - 22;
    ctx.save();
    drawRoundedRect(ctx, padX, specTop, width - padX * 2, specH, 16);
    ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = config.accentColor;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = config.accentColor;
    ctx.font = "700 20px monospace";
    ctx.fillText(
      `SPEC // ${slide.footer.slice(0, 56)}`,
      padX + 26,
      specTop + specH / 2 + 7,
    );
  } else {
    // ------------------------------------------------------------------------
    // TEMPLATE 1 (`saas-comparison`): Overlapping macOS UI Windows + Curved Arrow
    // ------------------------------------------------------------------------
    const cardW = 470;
    const cardH = config.aspect === "portrait" ? 250 : 205;
    const leftX = padX;
    const leftY = cardAreaTop;
    const rightX = width - padX - cardW;
    const rightY = cardAreaTop + (config.aspect === "portrait" ? 155 : 95);

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 12;
    drawRoundedRect(ctx, leftX, leftY, cardW, cardH, 24);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.restore();

    const dotColors = ["#EF4444", "#F59E0B", "#10B981"];
    dotColors.forEach((dc, dIdx) => {
      ctx.beginPath();
      ctx.arc(leftX + 32 + dIdx * 22, leftY + 30, 6, 0, Math.PI * 2);
      ctx.fillStyle = dc;
      ctx.fill();
    });

    ctx.fillStyle = "#475569";
    ctx.font = "800 18px system-ui, sans-serif";
    ctx.fillText(
      (slide.cardLeftTitle || "YOUR SOURCE INPUT").toUpperCase(),
      leftX + 28,
      leftY + 72,
    );

    ctx.fillStyle = "#0F172A";
    ctx.font = "700 26px system-ui, sans-serif";
    const leftLines = wrapCanvasText(ctx, slide.cardLeftBody, cardW - 56, 3);
    leftLines.forEach((ll, lIdx) => {
      ctx.fillText(ll, leftX + 28, leftY + 114 + lIdx * 36);
    });

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 14;
    drawRoundedRect(ctx, rightX, rightY, cardW, cardH, 24);
    ctx.fillStyle = config.cardBgColor || "#0F172A";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = config.accentColor;
    ctx.stroke();
    ctx.restore();

    dotColors.forEach((dc, dIdx) => {
      ctx.beginPath();
      ctx.arc(rightX + 32 + dIdx * 22, rightY + 30, 6, 0, Math.PI * 2);
      ctx.fillStyle = dc;
      ctx.fill();
    });

    ctx.fillStyle = config.accentColor;
    ctx.font = "800 18px system-ui, sans-serif";
    ctx.fillText(
      (slide.cardRightTitle || "RESULTING SYSTEM").toUpperCase(),
      rightX + 28,
      rightY + 72,
    );

    ctx.fillStyle = cardTextPrimary;
    ctx.font = "700 26px system-ui, sans-serif";
    const rightLines = wrapCanvasText(ctx, slide.cardRightBody, cardW - 56, 3);
    rightLines.forEach((rl, rIdx) => {
      ctx.fillText(rl, rightX + 28, rightY + 114 + rIdx * 36);
    });

    ctx.save();
    ctx.strokeStyle = config.accentColor;
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    const startX = leftX + cardW * 0.52;
    const startY = leftY + cardH - 18;
    const endX = rightX - 16;
    const endY = rightY + cardH * 0.52;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(startX + 20, endY, endX, endY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(endX - 18, endY - 14);
    ctx.lineTo(endX + 2, endY);
    ctx.lineTo(endX - 18, endY + 14);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================================
  // 6. BOTTOM FOOTER BAR (Takeaway + Website Domain + Slide Counter)
  // ==========================================================================
  const footerY = height - 115;
  ctx.fillStyle = config.textColor;
  ctx.font = "800 28px system-ui, -apple-system, sans-serif";
  ctx.fillText(slide.footer.slice(0, 56), padX, footerY);

  ctx.fillStyle = config.accentColor;
  ctx.font = "700 24px system-ui, -apple-system, sans-serif";
  ctx.fillText(config.websiteUrl || "doitwithai.tools", padX, height - 56);

  const counterStr = `${String(slide.number).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")}`;
  ctx.fillStyle = config.textColor;
  ctx.font = "800 24px system-ui, -apple-system, sans-serif";
  const cw = ctx.measureText(counterStr).width;
  ctx.fillText(counterStr, width - padX - cw, height - 56);

  return canvas;
}

export default function RepurposePanel({
  article,
  format,
  autoRunSignal = 0,
}: {
  article: Article;
  format: Exclude<ConversionFormat, "pdf" | "docx" | "audio">;
  autoRunSignal?: number;
}) {
  // Video Script options
  const [videoMode, setVideoMode] = useState<"youtube" | "shorts">("youtube");
  const [videoWpm, setVideoWpm] = useState<120 | 140 | 160>(140);
  const [videoHook, setVideoHook] = useState(0);
  const [videoCta, setVideoCta] = useState(
    "If you want the complete written breakdown and checklist, visit the link in the description.",
  );
  const [videoViewMode, setVideoViewMode] = useState<"storyboard" | "voiceover">(
    "storyboard",
  );

  // Social Posts options
  const [socialAngle, setSocialAngle] = useState<
    "takeaways" | "educational" | "discussion"
  >("takeaways");
  const [socialIncludeLink, setSocialIncludeLink] = useState(true);
  const [selectedIdeaByPlatform, setSelectedIdeaByPlatform] = useState<
    Record<string, number>
  >({});

  // Markdown options
  const [mdFrontmatter, setMdFrontmatter] = useState(true);
  const [mdReferences, setMdReferences] = useState(true);

  // EPUB options
  const [epubTheme, setEpubTheme] = useState<"serif" | "sans">("serif");
  const [epubLang, setEpubLang] = useState("en");

  // Newsletter options
  const [newsletterStyle, setNewsletterStyle] = useState<
    "executive" | "founder" | "checklist"
  >("executive");

  // Grand LinkedIn Carousel Studio options (Auto-matched to article on load!)
  const recommendedTemplate = recommendCarouselTemplate(article);
  const [carouselConfig, setCarouselConfig] = useState<CarouselBrandConfig>(() => {
    const preset = CAROUSEL_THEME_PRESETS[recommendedTemplate];
    return {
      ...preset,
      bgColor: article.brand?.themeColor || preset.bgColor,
      brandName: article.brand?.siteName || "Do It With AI Tools",
      websiteUrl: article.brand?.domain || "doitwithai.tools",
      categoryKicker: "PRACTICAL PLAYBOOK",
      aspect: "portrait",
    };
  });
  const [keepCustomColors, setKeepCustomColors] = useState(false);
  const [carouselCount, setCarouselCount] = useState(8);
  const [slidePreviewUrls, setSlidePreviewUrls] = useState<string[]>([]);
  const logoImageRef = useRef<HTMLImageElement | null>(null);

  // Podcast Script options
  const [podcastMode, setPodcastMode] = useState<"cohost" | "solo">("cohost");
  const [podcastWpm, setPodcastWpm] = useState<130 | 150 | 170>(150);

  // Generated Draft State
  const [videoDraft, setVideoDraft] = useState<VideoScriptDraft | null>(null);
  const [socialDraft, setSocialDraft] = useState<SocialPost[] | null>(null);
  const [markdownText, setMarkdownText] = useState("");
  const [newsletterDraft, setNewsletterDraft] =
    useState<NewsletterDraft | null>(null);
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[] | null>(
    null,
  );
  const [podcastDraft, setPodcastDraft] = useState<PodcastScriptDraft | null>(
    null,
  );

  const [assets, setAssets] = useState<DownloadAsset[]>([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [revision, setRevision] = useState(0);
  const doneRef = useRef<HTMLElement>(null);

  const baseName = filename(article.title).replace(/\.pdf$/, "");

  const updateCarouselPreviewsAndAssets = useCallback(
    (slides: CarouselSlide[], cfg: CarouselBrandConfig) => {
      if (typeof document === "undefined" || !slides.length) return;
      const previewUrls: string[] = [];
      const pngEntries: Record<string, Uint8Array> = {};
      const jpegPages: Array<{
        bytes: Uint8Array;
        width: number;
        height: number;
      }> = [];

      slides.forEach((s, i) => {
        const numbered = { ...s, number: i + 1 };
        const canvas = renderSlideCanvas(
          numbered,
          slides.length,
          cfg,
          logoImageRef.current,
        );
        const pngUrl = canvas.toDataURL("image/png");
        previewUrls.push(pngUrl);

        const pngB64 = pngUrl.split(",")[1] || "";
        if (pngB64) {
          const bin = atob(pngB64);
          const bytes = new Uint8Array(bin.length);
          for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
          pngEntries[`slide-${String(i + 1).padStart(2, "0")}.png`] = bytes;
        }

        const jpgUrl = canvas.toDataURL("image/jpeg", 0.92);
        const jpgB64 = jpgUrl.split(",")[1] || "";
        if (jpgB64) {
          const bin = atob(jpgB64);
          const bytes = new Uint8Array(bin.length);
          for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
          jpegPages.push({
            bytes,
            width: canvas.width,
            height: canvas.height,
          });
        }
      });

      setSlidePreviewUrls(previewUrls);

      const pageH = cfg.aspect === "portrait" ? 675 : 540;
      const pdfBytes =
        jpegPages.length > 0
          ? buildRasterCarouselPdf(jpegPages, 540, pageH)
          : carouselPdf(slides, cfg, cfg.aspect);
      const zipBytes = zipStored(pngEntries);

      setAssets((old) => {
        for (const a of old) URL.revokeObjectURL(a.url);
        return [
          {
            label: "Download Carousel PDF (.pdf)",
            url: URL.createObjectURL(
              new Blob([pdfBytes as any], { type: "application/pdf" }),
            ),
            downloadName: `${baseName}-linkedin-carousel.pdf`,
            primary: true,
          },
          {
            label: "Download All Slide PNGs (.zip)",
            url: URL.createObjectURL(
              new Blob([zipBytes as any], { type: "application/zip" }),
            ),
            downloadName: `${baseName}-carousel-slides.zip`,
          },
        ];
      });
    },
    [baseName],
  );

  // Automatically load the website's logo & brand theme when article changes in LinkedIn Carousel mode
  useEffect(() => {
    if (format !== "linkedin-carousel" || typeof window === "undefined") return;
    const bestTpl = recommendCarouselTemplate(article);
    const preset = CAROUSEL_THEME_PRESETS[bestTpl];
    const nextCfg: CarouselBrandConfig = {
      ...preset,
      bgColor: article.brand?.themeColor || preset.bgColor,
      brandName: article.brand?.siteName || "Do It With AI Tools",
      websiteUrl:
        article.brand?.domain ||
        (article.source
          ? article.source.replace(/^https?:\/\/(www\.)?/i, "").split("/")[0]
          : "doitwithai.tools"),
      categoryKicker: "PRACTICAL PLAYBOOK",
      aspect: carouselConfig.aspect,
    };
    setCarouselConfig(nextCfg);

    const candidateLogo = article.brand?.logoUrl || "";
    if (!candidateLogo || /doitwithai\.tools/i.test(candidateLogo)) {
      const localImg = new Image();
      localImg.crossOrigin = "anonymous";
      localImg.onload = () => {
        logoImageRef.current = localImg;
        const withLogo = { ...nextCfg, logoDataUrl: "/logoForHeader.png" };
        setCarouselConfig(withLogo);
        const slides = buildLinkedinCarousel(article, carouselCount);
        setCarouselSlides(slides);
        updateCarouselPreviewsAndAssets(slides, withLogo);
      };
      localImg.src = "/logoForHeader.png";
    } else {
      fetch("/api/ai-tools/article-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: candidateLogo }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.data) {
            const img = new Image();
            img.onload = () => {
              logoImageRef.current = img;
              const withLogo = { ...nextCfg, logoDataUrl: d.data };
              setCarouselConfig(withLogo);
              const slides = buildLinkedinCarousel(article, carouselCount);
              setCarouselSlides(slides);
              updateCarouselPreviewsAndAssets(slides, withLogo);
            };
            img.src = d.data;
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article, format]);

  const rebuildNonCarouselDownloads = useCallback(
    (
      nextVideo = videoDraft,
      nextSocial = socialDraft,
      nextMd = markdownText,
      nextNewsletter = newsletterDraft,
      nextPodcast = podcastDraft,
    ) => {
      const nextAssets: DownloadAsset[] = [];

      if (format === "video-script" && nextVideo) {
        const txt = videoScriptTxt(article, nextVideo);
        const docx = videoScriptDocx(article, nextVideo);
        const voiceoverOnly = nextVideo.scenes
          .map((s) => s.narration)
          .join("\n\n");
        nextAssets.push(
          {
            label: "Download Storyboard DOCX (.docx)",
            url: URL.createObjectURL(new Blob([docx as any], { type: docxMime })),
            downloadName: `${baseName}-video-script.docx`,
            primary: true,
          },
          {
            label: "Download Full Storyboard (.txt)",
            url: URL.createObjectURL(
              new Blob([txt], { type: "text/plain;charset=utf-8" }),
            ),
            downloadName: `${baseName}-video-storyboard.txt`,
          },
          {
            label: "Download Voiceover Only (.txt)",
            url: URL.createObjectURL(
              new Blob([voiceoverOnly], { type: "text/plain;charset=utf-8" }),
            ),
            downloadName: `${baseName}-voiceover-only.txt`,
          },
        );
      } else if (format === "social-posts" && nextSocial) {
        const txt = socialPostsTxt(article, nextSocial);
        const csv = socialPostsCsv(article, nextSocial);
        nextAssets.push(
          {
            label: "Download All 15 Ideas CSV (.csv)",
            url: URL.createObjectURL(
              new Blob([csv], { type: "text/csv;charset=utf-8" }),
            ),
            downloadName: `${baseName}-social-posts.csv`,
            primary: true,
          },
          {
            label: "Download Campaign Pack (.txt)",
            url: URL.createObjectURL(
              new Blob([txt], { type: "text/plain;charset=utf-8" }),
            ),
            downloadName: `${baseName}-social-posts.txt`,
          },
        );
      } else if (format === "markdown" && nextMd) {
        nextAssets.push(
          {
            label: "Download Markdown (.md)",
            url: URL.createObjectURL(
              new Blob([nextMd], { type: "text/markdown;charset=utf-8" }),
            ),
            downloadName: `${baseName}.md`,
            primary: true,
          },
          {
            label: "Download Plain Text (.txt)",
            url: URL.createObjectURL(
              new Blob([nextMd], { type: "text/plain;charset=utf-8" }),
            ),
            downloadName: `${baseName}.txt`,
          },
        );
      } else if (format === "epub") {
        const { epubBytes, xhtml } = articleToEpub(article, {
          theme: epubTheme,
          lang: epubLang,
        });
        nextAssets.push(
          {
            label: "Download EPUB E-Book (.epub)",
            url: URL.createObjectURL(
              new Blob([epubBytes as any], { type: "application/epub+zip" }),
            ),
            downloadName: `${baseName}.epub`,
            primary: true,
          },
          {
            label: "Download XHTML Copy (.xhtml)",
            url: URL.createObjectURL(
              new Blob([xhtml], { type: "application/xhtml+xml;charset=utf-8" }),
            ),
            downloadName: `${baseName}.xhtml`,
          },
        );
      } else if (format === "newsletter" && nextNewsletter) {
        const html = newsletterHtml(article, nextNewsletter);
        const txt = newsletterTxt(article, nextNewsletter);
        const docx = newsletterDocx(article, nextNewsletter);
        nextAssets.push(
          {
            label: "Download HTML Email (.html)",
            url: URL.createObjectURL(
              new Blob([html], { type: "text/html;charset=utf-8" }),
            ),
            downloadName: `${baseName}-newsletter.html`,
            primary: true,
          },
          {
            label: "Download Word Draft (.docx)",
            url: URL.createObjectURL(new Blob([docx as any], { type: docxMime })),
            downloadName: `${baseName}-newsletter.docx`,
          },
          {
            label: "Download Plain Text (.txt)",
            url: URL.createObjectURL(
              new Blob([txt], { type: "text/plain;charset=utf-8" }),
            ),
            downloadName: `${baseName}-newsletter.txt`,
          },
        );
      } else if (format === "podcast-script" && nextPodcast) {
        const txt = podcastScriptTxt(article, nextPodcast);
        const docx = podcastScriptDocx(article, nextPodcast);
        nextAssets.push(
          {
            label: "Download Podcast Script (.docx)",
            url: URL.createObjectURL(new Blob([docx as any], { type: docxMime })),
            downloadName: `${baseName}-podcast-script.docx`,
            primary: true,
          },
          {
            label: "Download Script & Show Notes (.txt)",
            url: URL.createObjectURL(
              new Blob([txt], { type: "text/plain;charset=utf-8" }),
            ),
            downloadName: `${baseName}-podcast-script.txt`,
          },
        );
      }

      setAssets((old) => {
        for (const a of old) URL.revokeObjectURL(a.url);
        return nextAssets;
      });
    },
    [
      article,
      baseName,
      epubLang,
      epubTheme,
      format,
      markdownText,
      newsletterDraft,
      podcastDraft,
      socialDraft,
      videoDraft,
    ],
  );

  const generateAll = useCallback(
    async (withAiEnhance = false) => {
      const err = validate(article);
      setError(err);
      if (err) return;

      try {
        if (!withAiEnhance) {
          if (format === "video-script") {
            const local = buildVideoScript(
              article,
              videoMode,
              videoWpm,
              videoHook,
              videoCta,
            );
            setVideoDraft(local);
            rebuildNonCarouselDownloads(local, null, "", null, null);
            setMessage(
              "Video script and sentence-by-sentence visual storyboard ready! Download your DOCX or TXT above.",
            );
          } else if (format === "social-posts") {
            const local = buildSocialPosts(
              article,
              socialAngle,
              socialIncludeLink,
            );
            setSocialDraft(local);
            rebuildNonCarouselDownloads(null, local, "", null, null);
            setMessage(
              "15 structured social media post ideas across 5 platforms are ready! Switch ideas or download the CSV/TXT pack above.",
            );
          } else if (format === "markdown") {
            const md = articleToMarkdown(article, {
              includeFrontmatter: mdFrontmatter,
              includeReferences: mdReferences,
            });
            setMarkdownText(md);
            rebuildNonCarouselDownloads(null, null, md, null, null);
            setMessage("Markdown file ready! Download your .md or .txt file above.");
          } else if (format === "epub") {
            rebuildNonCarouselDownloads(null, null, "", null, null);
            setMessage("EPUB 3 e-book ready! Download your .epub file above.");
          } else if (format === "newsletter") {
            const local = buildNewsletter(article, newsletterStyle);
            setNewsletterDraft(local);
            rebuildNonCarouselDownloads(null, null, "", local, null);
            setMessage(
              "Newsletter edition ready! Choose from 5 subject lines and download HTML, DOCX, or TXT above.",
            );
          } else if (format === "linkedin-carousel") {
            const localSlides = buildLinkedinCarousel(article, carouselCount);
            setCarouselSlides(localSlides);
            updateCarouselPreviewsAndAssets(localSlides, carouselConfig);
            setMessage(
              "LinkedIn Carousel Studio ready! Switch between 6 distinct layout templates, customize colors or logo, and download your PDF or PNG slides.",
            );
          } else if (format === "podcast-script") {
            const local = buildPodcastScript(article, podcastMode, podcastWpm);
            setPodcastDraft(local);
            rebuildNonCarouselDownloads(null, null, "", null, local);
            setMessage(
              "Broadcast podcast script and show notes ready! Download DOCX or TXT above.",
            );
          }
          setRevision((n) => n + 1);
          return;
        }

        // Explicit user-triggered AI Polish via /api/ai-tools/article-repurpose
        if (
          [
            "video-script",
            "social-posts",
            "newsletter",
            "linkedin-carousel",
            "podcast-script",
          ].includes(format) &&
          typeof window !== "undefined"
        ) {
          setAiBusy(true);
          setMessage("Polishing with AI synthesis…");
          try {
            const articleText = article.blocks
              .map((b) => (b.kind === "heading" ? `## ${b.text}` : b.text))
              .filter(Boolean)
              .join("\n\n")
              .slice(0, 24000);
            const res = await fetch("/api/ai-tools/article-repurpose", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                format,
                title: article.title,
                source: article.source,
                articleText,
                options: {
                  mode: videoMode,
                  cta: videoCta,
                  angle: socialAngle,
                  style: newsletterStyle,
                  slideCount: carouselCount,
                  format: podcastMode,
                },
              }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data?.result) {
                if (
                  format === "video-script" &&
                  Array.isArray(data.result.scenes)
                ) {
                  const localFallback = buildVideoScript(
                    article,
                    videoMode,
                    videoWpm,
                    videoHook,
                    videoCta,
                  );
                  const aiScenes = data.result.scenes.map(
                    (sc: any, sIdx: number) => {
                      const beats = (sc.beats || []).map(
                        (b: any, bIdx: number) => {
                          const words = countWords(b.spokenSentence || "");
                          return {
                            id: `ai-beat-${sIdx + 1}-${bIdx + 1}`,
                            spokenSentence: b.spokenSentence,
                            visualType: b.visualType || "B-ROLL VIDEO",
                            visualDirection: b.visualDirection,
                            onScreenText: b.onScreenText,
                            seconds: Math.max(
                              2,
                              Math.ceil((words / videoWpm) * 60),
                            ),
                          };
                        },
                      );
                      const narration = beats
                        .map((b: any) => b.spokenSentence)
                        .join(" ");
                      const seconds = beats.reduce(
                        (n: number, b: any) => n + b.seconds,
                        0,
                      );
                      return {
                        id: `ai-scene-${sIdx + 1}`,
                        title: sc.title,
                        narration,
                        visual: beats
                          .map(
                            (b: any) => `[${b.visualType}] ${b.visualDirection}`,
                          )
                          .join(" | "),
                        onScreenText: beats[0]?.onScreenText || sc.title,
                        seconds,
                        beats,
                      };
                    },
                  );
                  // Preserve full-article coverage if AI returned fewer scenes than local sections
                  const mergedScenes =
                    videoMode === "youtube" &&
                    aiScenes.length < localFallback.scenes.length
                      ? [
                          ...aiScenes,
                          ...localFallback.scenes.slice(aiScenes.length),
                        ]
                      : aiScenes;

                  const enhanced: VideoScriptDraft = {
                    mode: videoMode,
                    wpm: videoWpm,
                    hookIndex: videoHook,
                    cta: videoCta,
                    scenes: mergedScenes,
                    totalWords: mergedScenes.reduce(
                      (n: number, s: any) => n + countWords(s.narration),
                      0,
                    ),
                    totalSeconds: mergedScenes.reduce(
                      (n: number, s: any) => n + s.seconds,
                      0,
                    ),
                  };
                  setVideoDraft(enhanced);
                  rebuildNonCarouselDownloads(enhanced, null, "", null, null);
                } else if (
                  format === "social-posts" &&
                  Array.isArray(data.result.posts)
                ) {
                  const enhanced: SocialPost[] = data.result.posts.map(
                    (p: any, idx: number) => {
                      const ideas = (p.ideas || []).map(
                        (idObj: any, iIdx: number) => ({
                          id: `ai-idea-${idx}-${iIdx}`,
                          label: idObj.label,
                          content: ensureStructuredSocialText(
                            idObj.content || "",
                            p.platform,
                          ),
                        }),
                      );
                      return {
                        id: `ai-social-${idx}`,
                        platform: p.platform,
                        angle: socialAngle,
                        content: ideas[0]?.content || "",
                        charLimit: p.platform === "Threads" ? 500 : 3000,
                        ideas,
                      };
                    },
                  );
                  setSocialDraft(enhanced);
                  rebuildNonCarouselDownloads(null, enhanced, "", null, null);
                } else if (
                  format === "newsletter" &&
                  data.result.subjectOptions
                ) {
                  const enhanced: NewsletterDraft = {
                    style: newsletterStyle,
                    subjectOptions: data.result.subjectOptions,
                    selectedSubject: data.result.subjectOptions[0],
                    preheader: data.result.preheader,
                    greeting: "Hello,",
                    intro: data.result.intro,
                    whyItMatters: data.result.whyItMatters,
                    takeaways: data.result.takeaways,
                    sections: data.result.sections,
                    checklist: data.result.checklist,
                    ctaLabel: "🌐 Read the full article on our website →",
                    ctaUrl: article.source || "https://doitwithai.tools",
                  };
                  setNewsletterDraft(enhanced);
                  rebuildNonCarouselDownloads(null, null, "", enhanced, null);
                } else if (
                  format === "linkedin-carousel" &&
                  Array.isArray(data.result.slides)
                ) {
                  const total = data.result.slides.length;
                  const enhanced: CarouselSlide[] = data.result.slides.map(
                    (s: any, idx: number) => ({
                      number: idx + 1,
                      kind:
                        idx === 0
                          ? "cover"
                          : idx === total - 1
                            ? "cta"
                            : s.kind === "comparison"
                              ? "comparison"
                              : "point",
                      kicker: s.kicker || `SLIDE 0${idx + 1}`,
                      headline: s.headline,
                      highlightPhrase: s.highlightPhrase,
                      body: s.body,
                      cardLeftTitle: s.cardLeftTitle,
                      cardLeftBody: s.cardLeftBody,
                      cardRightTitle: s.cardRightTitle,
                      cardRightBody: s.cardRightBody,
                      stepThirdTitle: s.stepThirdTitle,
                      stepThirdBody: s.stepThirdBody,
                      bullets: s.bullets,
                      footer: s.footer,
                    }),
                  );
                  setCarouselSlides(enhanced);
                  updateCarouselPreviewsAndAssets(enhanced, carouselConfig);
                } else if (
                  format === "podcast-script" &&
                  Array.isArray(data.result.segments)
                ) {
                  const segs = data.result.segments.map(
                    (s: any, idx: number) => ({
                      id: `ai-pod-${idx + 1}`,
                      speaker: s.speaker,
                      topic: s.topic,
                      dialogue: s.dialogue,
                      cue: s.cue,
                      seconds: Math.max(
                        4,
                        Math.ceil((countWords(s.dialogue) / podcastWpm) * 60),
                      ),
                    }),
                  );
                  const enhanced: PodcastScriptDraft = {
                    format: podcastMode,
                    wpm: podcastWpm,
                    showNotes: data.result.showNotes || [],
                    segments: segs,
                    totalWords: segs.reduce(
                      (n: number, s: any) => n + countWords(s.dialogue),
                      0,
                    ),
                    totalSeconds: segs.reduce(
                      (n: number, s: any) => n + s.seconds,
                      0,
                    ),
                  };
                  setPodcastDraft(enhanced);
                  rebuildNonCarouselDownloads(null, null, "", null, enhanced);
                }
                setMessage("AI synthesis complete! Your downloads are updated.");
              } else {
                setMessage("Your structured draft is ready above.");
              }
            }
          } catch {
            setMessage("Your structured draft is ready above.");
          } finally {
            setAiBusy(false);
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Conversion failed.");
      }
    },
    [
      article,
      carouselConfig,
      carouselCount,
      format,
      mdFrontmatter,
      mdReferences,
      newsletterStyle,
      podcastMode,
      podcastWpm,
      rebuildNonCarouselDownloads,
      socialAngle,
      socialIncludeLink,
      updateCarouselPreviewsAndAssets,
      videoCta,
      videoHook,
      videoMode,
      videoWpm,
    ],
  );

  // Auto-generate immediately when article is imported (Single-Pass, Zero Background Blink!)
  const hasAutoRunRef = useRef(-1);
  useEffect(() => {
    if (hasAutoRunRef.current !== autoRunSignal) {
      hasAutoRunRef.current = autoRunSignal;
      generateAll(false);
    }
  }, [autoRunSignal, generateAll]);

  useEffect(() => {
    if (revision === 1) focusToolSection(doneRef.current);
  }, [revision]);

  function handleLogoUpload(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) return;
      const img = new Image();
      img.onload = () => {
        logoImageRef.current = img;
        const nextCfg = { ...carouselConfig, logoDataUrl: dataUrl };
        setCarouselConfig(nextCfg);
        if (carouselSlides) {
          updateCarouselPreviewsAndAssets(carouselSlides, nextCfg);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Copied to clipboard.");
    } catch {
      setError("Clipboard access was denied. Use the download button instead.");
    }
  }

  return (
    <div className="space-y-6">
      {/* STEP 2 TOP DOWNLOAD & INTERACTIVE STUDIO PANEL */}
      {assets.length > 0 && (
        <section
          ref={doneRef}
          tabIndex={-1}
          aria-labelledby="repurpose-result-title"
          className="scroll-mt-28 rounded-2xl border-2 border-[#3452d1] bg-blue-50/30 p-5 focus:outline focus:outline-2 focus:outline-[#5271ff] dark:border-[#5271ff] dark:bg-blue-950/20 sm:p-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-700">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#9A3412] dark:text-[#FDBA74]">
                Step 2 · Ready to download &amp; customize
              </p>
              <h2
                id="repurpose-result-title"
                className="mt-1 text-2xl font-extrabold"
              >
                {article.title}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {assets.map((a) => (
                <a
                  key={a.downloadName}
                  href={a.url}
                  download={a.downloadName}
                  className={a.primary ? primary : button}
                >
                  <Download size={16} aria-hidden />
                  {a.label}
                </a>
              ))}
            </div>
          </div>

          {message && (
            <p
              role="status"
              className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              {message}
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mt-4 text-sm font-bold text-red-700 dark:text-red-300"
            >
              {error}
            </p>
          )}

          {/* ============================================================== */}
          {/* 1. VIDEO SCRIPT STUDIO UI                                      */}
          {/* ============================================================== */}
          {format === "video-script" && videoDraft && (
            <div className="mt-6 space-y-5">
              <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-4">
                <div>
                  <label
                    htmlFor="video-mode"
                    className="mb-1 block text-xs font-bold"
                  >
                    Video Format
                  </label>
                  <select
                    id="video-mode"
                    className={field}
                    value={videoMode}
                    onChange={(e) => {
                      const nextMode = e.target.value as "youtube" | "shorts";
                      setVideoMode(nextMode);
                      const d = buildVideoScript(
                        article,
                        nextMode,
                        videoWpm,
                        videoHook,
                        videoCta,
                      );
                      setVideoDraft(d);
                      rebuildNonCarouselDownloads(d, null, "", null, null);
                    }}
                  >
                    <option value="youtube">
                      YouTube Full Deep-Dive (All Sections)
                    </option>
                    <option value="shorts">
                      Shorts / Reels / TikTok (60–90s)
                    </option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="video-wpm"
                    className="mb-1 block text-xs font-bold"
                  >
                    Speaking Pace
                  </label>
                  <select
                    id="video-wpm"
                    className={field}
                    value={videoWpm}
                    onChange={(e) => {
                      const nextWpm = Number(e.target.value) as
                        | 120
                        | 140
                        | 160;
                      setVideoWpm(nextWpm);
                      const d = buildVideoScript(
                        article,
                        videoMode,
                        nextWpm,
                        videoHook,
                        videoCta,
                      );
                      setVideoDraft(d);
                      rebuildNonCarouselDownloads(d, null, "", null, null);
                    }}
                  >
                    <option value={120}>120 WPM (Deliberate)</option>
                    <option value={140}>140 WPM (Natural YouTube)</option>
                    <option value={160}>160 WPM (Fast / Energetic)</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="video-hook"
                    className="mb-1 block text-xs font-bold"
                  >
                    Opening Hook Angle
                  </label>
                  <select
                    id="video-hook"
                    className={field}
                    value={videoHook}
                    onChange={(e) => {
                      const nextH = Number(e.target.value);
                      setVideoHook(nextH);
                      const d = buildVideoScript(
                        article,
                        videoMode,
                        videoWpm,
                        nextH,
                        videoCta,
                      );
                      setVideoDraft(d);
                      rebuildNonCarouselDownloads(d, null, "", null, null);
                    }}
                  >
                    <option value={0}>Problem → Solution Hook</option>
                    <option value={1}>Direct Premise Hook</option>
                    <option value={2}>Mistake / Warning Hook</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    className={`${button} w-full`}
                    onClick={() =>
                      setVideoViewMode((m) =>
                        m === "storyboard" ? "voiceover" : "storyboard",
                      )
                    }
                  >
                    {videoViewMode === "storyboard"
                      ? "Switch to Teleprompter View"
                      : "Switch to Visual Storyboard"}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold">
                  {videoDraft.scenes.length} Scenes ·{" "}
                  {videoDraft.scenes.reduce(
                    (n, s) => n + (s.beats?.length || 1),
                    0,
                  )}{" "}
                  Sentence-by-Sentence Visual Beats · {videoDraft.totalWords}{" "}
                  words (~
                  {Math.floor(videoDraft.totalSeconds / 60)}m{" "}
                  {videoDraft.totalSeconds % 60}s)
                </p>
                <button
                  type="button"
                  className={button}
                  onClick={() => copyText(videoScriptTxt(article, videoDraft))}
                >
                  <Copy size={15} aria-hidden />
                  Copy Complete Script
                </button>
              </div>

              {videoViewMode === "voiceover" ? (
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                  <h3 className="text-base font-bold">
                    Clean Teleprompter / Voiceover Script
                  </h3>
                  <textarea
                    rows={16}
                    className={`${field} mt-3 font-sans text-base leading-8`}
                    value={videoDraft.scenes
                      .map((s) => `[${s.title}]\n${s.narration}`)
                      .join("\n\n")}
                    readOnly
                  />
                </div>
              ) : (
                <div className="max-h-[620px] space-y-5 overflow-y-auto pr-1">
                  {videoDraft.scenes.map((scene, sIdx) => (
                    <div
                      key={scene.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                        <h3 className="text-base font-extrabold text-[#9A3412] dark:text-[#FDBA74]">
                          {scene.title}
                        </h3>
                        <span className="rounded-lg bg-orange-100 px-3 py-1 text-xs font-bold text-[#9A3412] dark:bg-orange-950/60 dark:text-orange-200">
                          ~{scene.seconds}s · {scene.beats?.length || 1} sentence
                          beats
                        </span>
                      </div>

                      <div className="mt-4 space-y-4">
                        {(scene.beats || []).map((beat, bIdx) => (
                          <div
                            key={beat.id}
                            className="grid gap-4 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 lg:grid-cols-[1.15fr_0.85fr]"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Spoken Sentence {sIdx + 1}.{bIdx + 1} (~
                                  {beat.seconds}s)
                                </span>
                              </div>
                              <textarea
                                rows={3}
                                className={`${field} mt-2 bg-white dark:bg-slate-900`}
                                value={beat.spokenSentence}
                                onChange={(e) => {
                                  const nextScenes = videoDraft.scenes.map(
                                    (sc, i) => {
                                      if (i !== sIdx) return sc;
                                      const nextBeats = sc.beats.map((b, j) =>
                                        j === bIdx
                                          ? {
                                              ...b,
                                              spokenSentence: e.target.value,
                                            }
                                          : b,
                                      );
                                      return {
                                        ...sc,
                                        beats: nextBeats,
                                        narration: nextBeats
                                          .map((b) => b.spokenSentence)
                                          .join(" "),
                                      };
                                    },
                                  );
                                  const next = {
                                    ...videoDraft,
                                    scenes: nextScenes,
                                  };
                                  setVideoDraft(next);
                                  rebuildNonCarouselDownloads(
                                    next,
                                    null,
                                    "",
                                    null,
                                    null,
                                  );
                                }}
                              />
                            </div>
                            <div className="flex flex-col justify-between rounded-xl border border-blue-200/70 bg-blue-50/40 p-3.5 dark:border-blue-900/50 dark:bg-blue-950/20">
                              <div>
                                <span className="inline-block rounded-md bg-[#3452d1] px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white">
                                  {beat.visualType}
                                </span>
                                <p className="mt-2 text-xs leading-6 text-slate-700 dark:text-slate-200">
                                  <strong>What to show in background:</strong>{" "}
                                  {beat.visualDirection}
                                </p>
                              </div>
                              <p className="mt-2 border-t border-blue-200/60 pt-2 text-xs font-semibold text-[#3452d1] dark:border-blue-900/50 dark:text-blue-300">
                                On-Screen Text: &ldquo;{beat.onScreenText}
                                &rdquo;
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. SOCIAL MEDIA MULTI-IDEA STUDIO UI                           */}
          {/* ============================================================== */}
          {format === "social-posts" && socialDraft && (
            <div className="mt-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-wrap items-center gap-4">
                  <label htmlFor="social-angle" className="text-sm font-bold">
                    Default Angle:
                  </label>
                  <select
                    id="social-angle"
                    className="rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-sm font-semibold dark:border-slate-600"
                    value={socialAngle}
                    onChange={(e) => {
                      const nextAngle = e.target.value as
                        | "takeaways"
                        | "educational"
                        | "discussion";
                      setSocialAngle(nextAngle);
                      const nextPosts = buildSocialPosts(
                        article,
                        nextAngle,
                        socialIncludeLink,
                      );
                      setSocialDraft(nextPosts);
                      rebuildNonCarouselDownloads(
                        null,
                        nextPosts,
                        "",
                        null,
                        null,
                      );
                    }}
                  >
                    <option value="takeaways">
                      Idea 1 · Problem → Checklist &amp; Practical Review
                    </option>
                    <option value="educational">
                      Idea 2 · Contrarian Hook &amp; Deep-Dive
                    </option>
                    <option value="discussion">
                      Idea 3 · Before vs. After Playbook
                    </option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-[#5271ff]"
                    checked={socialIncludeLink}
                    onChange={(e) => {
                      setSocialIncludeLink(e.target.checked);
                      const nextPosts = buildSocialPosts(
                        article,
                        socialAngle,
                        e.target.checked,
                      );
                      setSocialDraft(nextPosts);
                      rebuildNonCarouselDownloads(
                        null,
                        nextPosts,
                        "",
                        null,
                        null,
                      );
                    }}
                  />
                  <span>Include article CTA link (🌐)</span>
                </label>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {socialDraft.map((post, idx) => {
                  const activeIdeaIdx = selectedIdeaByPlatform[post.id] ?? 0;
                  const ideas = post.ideas || [];
                  return (
                    <div
                      key={post.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-base font-extrabold text-[#9A3412] dark:text-[#FDBA74]">
                          {post.platform}
                        </span>
                        <button
                          type="button"
                          className={button}
                          onClick={() => copyText(post.content)}
                        >
                          <Copy size={14} aria-hidden />
                          Copy {post.platform} Post
                        </button>
                      </div>

                      {ideas.length > 1 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {ideas.map((idea, iIdx) => (
                            <button
                              key={idea.id}
                              type="button"
                              className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                                activeIdeaIdx === iIdx
                                  ? "border-[#3452d1] bg-[#3452d1] text-white"
                                  : "border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-200"
                              }`}
                              onClick={() => {
                                setSelectedIdeaByPlatform((old) => ({
                                  ...old,
                                  [post.id]: iIdx,
                                }));
                                const next = socialDraft.map((p, pIndex) =>
                                  pIndex === idx
                                    ? {
                                        ...p,
                                        content: ensureStructuredSocialText(
                                          idea.content,
                                          p.platform,
                                        ),
                                      }
                                    : p,
                                );
                                setSocialDraft(next);
                                rebuildNonCarouselDownloads(
                                  null,
                                  next,
                                  "",
                                  null,
                                  null,
                                );
                              }}
                            >
                              {idea.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <textarea
                        rows={11}
                        className={`${field} mt-3 whitespace-pre-wrap font-sans text-sm leading-6`}
                        value={post.content}
                        onChange={(e) => {
                          const next = socialDraft.map((p, i) =>
                            i === idx ? { ...p, content: e.target.value } : p,
                          );
                          setSocialDraft(next);
                          rebuildNonCarouselDownloads(
                            null,
                            next,
                            "",
                            null,
                            null,
                          );
                        }}
                      />
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        {post.content.length} / {post.charLimit} characters
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. MARKDOWN STUDIO UI                                          */}
          {/* ============================================================== */}
          {format === "markdown" && (
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-5">
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[#5271ff]"
                      checked={mdFrontmatter}
                      onChange={(e) => {
                        setMdFrontmatter(e.target.checked);
                        const md = articleToMarkdown(article, {
                          includeFrontmatter: e.target.checked,
                          includeReferences: mdReferences,
                        });
                        setMarkdownText(md);
                        rebuildNonCarouselDownloads(null, null, md, null, null);
                      }}
                    />
                    <span>Include YAML frontmatter</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[#5271ff]"
                      checked={mdReferences}
                      onChange={(e) => {
                        setMdReferences(e.target.checked);
                        const md = articleToMarkdown(article, {
                          includeFrontmatter: mdFrontmatter,
                          includeReferences: e.target.checked,
                        });
                        setMarkdownText(md);
                        rebuildNonCarouselDownloads(null, null, md, null, null);
                      }}
                    />
                    <span>Append reference links</span>
                  </label>
                </div>
                <button
                  type="button"
                  className={button}
                  onClick={() => copyText(markdownText)}
                >
                  <Copy size={15} aria-hidden />
                  Copy Markdown
                </button>
              </div>
              <textarea
                rows={14}
                className={`${field} bg-white font-mono text-xs dark:bg-slate-900`}
                value={markdownText}
                onChange={(e) => {
                  setMarkdownText(e.target.value);
                  rebuildNonCarouselDownloads(
                    null,
                    null,
                    e.target.value,
                    null,
                    null,
                  );
                }}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* 4. EPUB STUDIO UI                                              */}
          {/* ============================================================== */}
          {format === "epub" && (
            <div className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="epub-theme"
                  className="mb-1 block text-xs font-bold"
                >
                  E-Reader Typography
                </label>
                <select
                  id="epub-theme"
                  className={field}
                  value={epubTheme}
                  onChange={(e) => {
                    const nextT = e.target.value as "serif" | "sans";
                    setEpubTheme(nextT);
                    rebuildNonCarouselDownloads(null, null, "", null, null);
                  }}
                >
                  <option value="serif">Book Serif (Georgia / Times)</option>
                  <option value="sans">Clean Sans-Serif (System UI)</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="epub-lang"
                  className="mb-1 block text-xs font-bold"
                >
                  Language Metadata Tag
                </label>
                <select
                  id="epub-lang"
                  className={field}
                  value={epubLang}
                  onChange={(e) => {
                    setEpubLang(e.target.value);
                    rebuildNonCarouselDownloads(null, null, "", null, null);
                  }}
                >
                  <option value="en">English (en)</option>
                  <option value="ur">Urdu (ur)</option>
                </select>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 5. NEWSLETTER STUDIO UI                                        */}
          {/* ============================================================== */}
          {format === "newsletter" && newsletterDraft && (
            <div className="mt-6 space-y-5">
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["executive", "Executive Briefing"],
                        ["founder", "Founder Deep-Dive"],
                        ["checklist", "Tactical Team Checklist"],
                      ] as const
                    ).map(([stId, stLabel]) => (
                      <button
                        key={stId}
                        type="button"
                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                          newsletterStyle === stId
                            ? "border-[#3452d1] bg-[#3452d1] text-white"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                        onClick={() => {
                          setNewsletterStyle(stId);
                          const d = buildNewsletter(article, stId);
                          setNewsletterDraft(d);
                          rebuildNonCarouselDownloads(null, null, "", d, null);
                        }}
                      >
                        {stLabel}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={button}
                    onClick={() =>
                      copyText(newsletterTxt(article, newsletterDraft))
                    }
                  >
                    <Copy size={15} aria-hidden />
                    Copy Newsletter Text
                  </button>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold uppercase text-slate-500">
                    Choose or edit subject line (5 angles):
                  </p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {newsletterDraft.subjectOptions.map((sub, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        className={`rounded-lg border px-3 py-1.5 text-left text-xs font-semibold ${
                          newsletterDraft.selectedSubject === sub
                            ? "border-[#9A3412] bg-orange-50 text-[#9A3412] dark:bg-orange-950/50 dark:text-orange-200"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                        onClick={() => {
                          const next = {
                            ...newsletterDraft,
                            selectedSubject: sub,
                          };
                          setNewsletterDraft(next);
                          rebuildNonCarouselDownloads(
                            null,
                            null,
                            "",
                            next,
                            null,
                          );
                        }}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                  <input
                    className={`${field} font-bold`}
                    value={newsletterDraft.selectedSubject}
                    onChange={(e) => {
                      const next = {
                        ...newsletterDraft,
                        selectedSubject: e.target.value,
                      };
                      setNewsletterDraft(next);
                      rebuildNonCarouselDownloads(null, null, "", next, null);
                    }}
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold">
                      Opening Hook
                    </label>
                    <textarea
                      rows={4}
                      className={field}
                      value={newsletterDraft.intro}
                      onChange={(e) => {
                        const next = {
                          ...newsletterDraft,
                          intro: e.target.value,
                        };
                        setNewsletterDraft(next);
                        rebuildNonCarouselDownloads(null, null, "", next, null);
                      }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold">
                      Why This Matters Callout
                    </label>
                    <textarea
                      rows={4}
                      className={field}
                      value={newsletterDraft.whyItMatters}
                      onChange={(e) => {
                        const next = {
                          ...newsletterDraft,
                          whyItMatters: e.target.value,
                        };
                        setNewsletterDraft(next);
                        rebuildNonCarouselDownloads(null, null, "", next, null);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 6. GRAND LINKEDIN CAROUSEL STUDIO UI                           */}
          {/* ============================================================== */}
          {format === "linkedin-carousel" && carouselSlides && (
            <div className="mt-6 space-y-6">
              {/* Template Picker + Visual Layout Thumbnails + Brand Identity */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold">
                      1. Choose a Carousel Layout Template (6 Distinct Visual Structures)
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                      Each template changes the background architecture, middle diagram structure, cover layout, and closing CTA slide.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#5271ff]"
                      checked={keepCustomColors}
                      onChange={(e) => setKeepCustomColors(e.target.checked)}
                    />
                    <span>Keep my current colors when switching template</span>
                  </label>
                </div>

                <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.values(CAROUSEL_THEME_PRESETS).map((preset) => {
                    const isRecommended =
                      preset.template === recommendedTemplate;
                    const isSelected =
                      carouselConfig.template === preset.template;
                    return (
                      <button
                        key={preset.template}
                        type="button"
                        className={`flex flex-col items-start rounded-xl border-2 p-3.5 text-left transition ${
                          isSelected
                            ? "border-[#3452d1] bg-blue-50/50 ring-2 ring-[#3452d1]/20 dark:border-[#5271ff] dark:bg-blue-950/30"
                            : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                        }`}
                        onClick={() => {
                          const nextCfg: CarouselBrandConfig = keepCustomColors
                            ? {
                                ...carouselConfig,
                                template: preset.template,
                              }
                            : {
                                ...carouselConfig,
                                template: preset.template,
                                bgColor: preset.bgColor,
                                bgSecondaryColor: preset.bgSecondaryColor,
                                accentColor: preset.accentColor,
                                textColor: preset.textColor,
                                cardBgColor: preset.cardBgColor,
                              };
                          setCarouselConfig(nextCfg);
                          updateCarouselPreviewsAndAssets(
                            carouselSlides,
                            nextCfg,
                          );
                        }}
                      >
                        <TemplateLayoutThumbnail
                          template={preset.template}
                          bgColor={
                            keepCustomColors && isSelected
                              ? carouselConfig.bgColor
                              : preset.bgColor
                          }
                          accentColor={
                            keepCustomColors && isSelected
                              ? carouselConfig.accentColor
                              : preset.accentColor
                          }
                          cardBgColor={
                            keepCustomColors && isSelected
                              ? carouselConfig.cardBgColor
                              : preset.cardBgColor
                          }
                          textColor={
                            keepCustomColors && isSelected
                              ? carouselConfig.textColor
                              : preset.textColor
                          }
                        />
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="text-xs font-extrabold">
                            {preset.name}
                          </span>
                          {isRecommended && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                              Auto-Matched
                            </span>
                          )}
                        </div>
                        <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {preset.layoutBadge}
                        </span>
                        <p className="mt-1.5 text-[11px] leading-5 text-slate-600 dark:text-slate-300">
                          {preset.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <h3 className="mt-6 text-base font-extrabold">
                  2. Customize Brand Colors, Logo, &amp; Website Identity
                </h3>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold">
                      Brand / Page Name
                    </label>
                    <input
                      className={field}
                      value={carouselConfig.brandName}
                      onChange={(e) => {
                        const nextCfg = {
                          ...carouselConfig,
                          brandName: e.target.value,
                        };
                        setCarouselConfig(nextCfg);
                        updateCarouselPreviewsAndAssets(
                          carouselSlides,
                          nextCfg,
                        );
                      }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold">
                      Website / Footer Domain
                    </label>
                    <input
                      className={field}
                      value={carouselConfig.websiteUrl}
                      onChange={(e) => {
                        const nextCfg = {
                          ...carouselConfig,
                          websiteUrl: e.target.value,
                        };
                        setCarouselConfig(nextCfg);
                        updateCarouselPreviewsAndAssets(
                          carouselSlides,
                          nextCfg,
                        );
                      }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold">
                      Brand Logo (Auto-Detected or Upload)
                    </label>
                    <div className="flex items-center gap-2">
                      <label
                        className={`${button} w-full cursor-pointer text-xs`}
                      >
                        <ImageIcon size={15} aria-hidden />
                        {carouselConfig.logoDataUrl
                          ? "Change Logo"
                          : "Upload Logo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) =>
                            handleLogoUpload(e.target.files?.[0])
                          }
                        />
                      </label>
                      {carouselConfig.logoDataUrl && (
                        <button
                          type="button"
                          className="rounded-lg border border-red-300 px-2.5 py-2 text-xs font-bold text-red-700"
                          onClick={() => {
                            logoImageRef.current = null;
                            const nextCfg = {
                              ...carouselConfig,
                              logoDataUrl: undefined,
                            };
                            setCarouselConfig(nextCfg);
                            updateCarouselPreviewsAndAssets(
                              carouselSlides,
                              nextCfg,
                            );
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="carousel-aspect"
                      className="mb-1 block text-xs font-bold"
                    >
                      Slide Dimensions
                    </label>
                    <select
                      id="carousel-aspect"
                      className={field}
                      value={carouselConfig.aspect}
                      onChange={(e) => {
                        const nextCfg = {
                          ...carouselConfig,
                          aspect: e.target.value as "portrait" | "square",
                        };
                        setCarouselConfig(nextCfg);
                        updateCarouselPreviewsAndAssets(
                          carouselSlides,
                          nextCfg,
                        );
                      }}
                    >
                      <option value="portrait">
                        Portrait 4:5 (1080 × 1350)
                      </option>
                      <option value="square">Square 1:1 (1080 × 1080)</option>
                    </select>
                  </div>
                </div>

                {/* Custom Color Pickers */}
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="h-10 w-12 cursor-pointer rounded border border-slate-300"
                        value={carouselConfig.bgColor}
                        onChange={(e) => {
                          setKeepCustomColors(true);
                          const nextCfg = {
                            ...carouselConfig,
                            bgColor: e.target.value,
                            bgSecondaryColor: e.target.value,
                          };
                          setCarouselConfig(nextCfg);
                          updateCarouselPreviewsAndAssets(
                            carouselSlides,
                            nextCfg,
                          );
                        }}
                      />
                      <input
                        className={`${field} py-2 font-mono text-xs`}
                        value={carouselConfig.bgColor}
                        onChange={(e) => {
                          setKeepCustomColors(true);
                          const nextCfg = {
                            ...carouselConfig,
                            bgColor: e.target.value,
                          };
                          setCarouselConfig(nextCfg);
                          updateCarouselPreviewsAndAssets(
                            carouselSlides,
                            nextCfg,
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold">
                      Accent / Highlight Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="h-10 w-12 cursor-pointer rounded border border-slate-300"
                        value={carouselConfig.accentColor}
                        onChange={(e) => {
                          setKeepCustomColors(true);
                          const nextCfg = {
                            ...carouselConfig,
                            accentColor: e.target.value,
                          };
                          setCarouselConfig(nextCfg);
                          updateCarouselPreviewsAndAssets(
                            carouselSlides,
                            nextCfg,
                          );
                        }}
                      />
                      <input
                        className={`${field} py-2 font-mono text-xs`}
                        value={carouselConfig.accentColor}
                        onChange={(e) => {
                          setKeepCustomColors(true);
                          const nextCfg = {
                            ...carouselConfig,
                            accentColor: e.target.value,
                          };
                          setCarouselConfig(nextCfg);
                          updateCarouselPreviewsAndAssets(
                            carouselSlides,
                            nextCfg,
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold">
                      Diagram Card Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="h-10 w-12 cursor-pointer rounded border border-slate-300"
                        value={carouselConfig.cardBgColor}
                        onChange={(e) => {
                          setKeepCustomColors(true);
                          const nextCfg = {
                            ...carouselConfig,
                            cardBgColor: e.target.value,
                          };
                          setCarouselConfig(nextCfg);
                          updateCarouselPreviewsAndAssets(
                            carouselSlides,
                            nextCfg,
                          );
                        }}
                      />
                      <input
                        className={`${field} py-2 font-mono text-xs`}
                        value={carouselConfig.cardBgColor}
                        onChange={(e) => {
                          setKeepCustomColors(true);
                          const nextCfg = {
                            ...carouselConfig,
                            cardBgColor: e.target.value,
                          };
                          setCarouselConfig(nextCfg);
                          updateCarouselPreviewsAndAssets(
                            carouselSlides,
                            nextCfg,
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="carousel-count"
                      className="mb-1 block text-xs font-bold"
                    >
                      Number of Slides
                    </label>
                    <select
                      id="carousel-count"
                      className={field}
                      value={carouselCount}
                      onChange={(e) => {
                        const cnt = Number(e.target.value);
                        setCarouselCount(cnt);
                        const nextSlides = buildLinkedinCarousel(article, cnt);
                        setCarouselSlides(nextSlides);
                        updateCarouselPreviewsAndAssets(
                          nextSlides,
                          carouselConfig,
                        );
                      }}
                    >
                      <option value={6}>6 Slides</option>
                      <option value={8}>8 Slides</option>
                      <option value={10}>10 Slides</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Live Visual Slide Gallery + Per-Slide Editor */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-extrabold">
                  3. Live Slide Previews &amp; Per-Slide Editor (
                  {carouselSlides.length} Slides: Cover +{" "}
                  {Math.max(0, carouselSlides.length - 2)} Topic Slides + Closing
                  CTA)
                </h3>
                <button
                  type="button"
                  className={button}
                  onClick={() => {
                    const insertIdx = Math.max(1, carouselSlides.length - 1);
                    const newSlide: CarouselSlide = {
                      number: insertIdx + 1,
                      kind: "point",
                      kicker: `STEP 0${insertIdx} · KEY INSIGHT`,
                      headline: "New carousel insight slide",
                      highlightPhrase: "insight slide",
                      body: "Edit this slide text and diagram boxes below.",
                      cardLeftTitle: "01 · OBSERVATION",
                      cardLeftBody: "Previous approach or common bottleneck.",
                      cardRightTitle: "02 · ACTION RULE",
                      cardRightBody: "Improved workflow or actionable fix.",
                      stepThirdTitle: "03 · IMPACT",
                      stepThirdBody: "Verified quality and audience clarity.",
                      footer: carouselConfig.websiteUrl,
                    };
                    const raw = [
                      ...carouselSlides.slice(0, insertIdx),
                      newSlide,
                      ...carouselSlides.slice(insertIdx),
                    ].map((s, i) => ({ ...s, number: i + 1 }));
                    setCarouselSlides(raw);
                    updateCarouselPreviewsAndAssets(raw, carouselConfig);
                  }}
                >
                  <Plus size={16} aria-hidden />
                  Add Topic Slide
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {carouselSlides.map((slide, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase text-[#9A3412] dark:text-[#FDBA74]">
                        Slide {String(idx + 1).padStart(2, "0")} ·{" "}
                        {slide.kind === "cover"
                          ? "Intro Cover Slide"
                          : slide.kind === "cta"
                            ? "Closing CTA Slide"
                            : "Topic Breakdown Slide"}
                      </span>
                      <div className="flex items-center gap-2">
                        {slidePreviewUrls[idx] && (
                          <a
                            href={slidePreviewUrls[idx]}
                            download={`${baseName}-slide-${String(idx + 1).padStart(2, "0")}.png`}
                            className="text-xs font-bold text-[#3452d1] underline dark:text-blue-300"
                          >
                            Save Slide PNG
                          </a>
                        )}
                        {carouselSlides.length > 3 && (
                          <button
                            type="button"
                            aria-label={`Remove slide ${idx + 1}`}
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                            onClick={() => {
                              const next = carouselSlides
                                .filter((_, i) => i !== idx)
                                .map((s, i) => ({ ...s, number: i + 1 }));
                              setCarouselSlides(next);
                              updateCarouselPreviewsAndAssets(
                                next,
                                carouselConfig,
                              );
                            }}
                          >
                            <Trash2 size={15} aria-hidden />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Live Rendered Canvas Image Preview */}
                    {slidePreviewUrls[idx] && (
                      <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slidePreviewUrls[idx]}
                          alt={`Slide ${idx + 1} preview`}
                          className="h-auto w-full object-contain"
                        />
                      </div>
                    )}

                    {/* Editable Fields for This Slide */}
                    <details className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                      <summary className="cursor-pointer text-xs font-bold">
                        Edit Slide {idx + 1} Content &amp; Layout Role
                      </summary>
                      <div className="mt-3 space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold">
                              Slide Role
                            </label>
                            <select
                              className={`${field} py-1.5 text-xs font-bold`}
                              value={slide.kind}
                              onChange={(e) => {
                                const next = carouselSlides.map((s, i) =>
                                  i === idx
                                    ? {
                                        ...s,
                                        kind: e.target.value as
                                          | "cover"
                                          | "point"
                                          | "comparison"
                                          | "cta",
                                      }
                                    : s,
                                );
                                setCarouselSlides(next);
                                updateCarouselPreviewsAndAssets(
                                  next,
                                  carouselConfig,
                                );
                              }}
                            >
                              <option value="cover">
                                Cover / Intro Slide
                              </option>
                              <option value="point">
                                Topic Explanation Slide
                              </option>
                              <option value="comparison">
                                Comparison Slide
                              </option>
                              <option value="cta">
                                Closing Summary &amp; CTA Slide
                              </option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold">
                              Top Kicker Label
                            </label>
                            <input
                              className={`${field} py-1.5 text-xs`}
                              value={slide.kicker}
                              onChange={(e) => {
                                const next = carouselSlides.map((s, i) =>
                                  i === idx
                                    ? { ...s, kicker: e.target.value }
                                    : s,
                                );
                                setCarouselSlides(next);
                                updateCarouselPreviewsAndAssets(
                                  next,
                                  carouselConfig,
                                );
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold">
                            Headline
                          </label>
                          <input
                            className={`${field} py-2 text-xs font-bold`}
                            value={slide.headline}
                            onChange={(e) => {
                              const next = carouselSlides.map((s, i) =>
                                i === idx
                                  ? { ...s, headline: e.target.value }
                                  : s,
                              );
                              setCarouselSlides(next);
                              updateCarouselPreviewsAndAssets(
                                next,
                                carouselConfig,
                              );
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold">
                            Highlighted Accent Words (painted in Accent Color)
                          </label>
                          <input
                            className={`${field} py-2 text-xs`}
                            value={slide.highlightPhrase}
                            onChange={(e) => {
                              const next = carouselSlides.map((s, i) =>
                                i === idx
                                  ? { ...s, highlightPhrase: e.target.value }
                                  : s,
                              );
                              setCarouselSlides(next);
                              updateCarouselPreviewsAndAssets(
                                next,
                                carouselConfig,
                              );
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold">
                            Subtitle / Lead Text
                          </label>
                          <textarea
                            rows={2}
                            className={`${field} py-2 text-xs`}
                            value={slide.body}
                            onChange={(e) => {
                              const next = carouselSlides.map((s, i) =>
                                i === idx ? { ...s, body: e.target.value } : s,
                              );
                              setCarouselSlides(next);
                              updateCarouselPreviewsAndAssets(
                                next,
                                carouselConfig,
                              );
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold">
                              Card 1 Title
                            </label>
                            <input
                              className={`${field} py-1.5 text-xs`}
                              value={slide.cardLeftTitle}
                              onChange={(e) => {
                                const next = carouselSlides.map((s, i) =>
                                  i === idx
                                    ? { ...s, cardLeftTitle: e.target.value }
                                    : s,
                                );
                                setCarouselSlides(next);
                                updateCarouselPreviewsAndAssets(
                                  next,
                                  carouselConfig,
                                );
                              }}
                            />
                            <textarea
                              rows={2}
                              className={`${field} mt-1 py-1.5 text-xs`}
                              value={slide.cardLeftBody}
                              onChange={(e) => {
                                const next = carouselSlides.map((s, i) =>
                                  i === idx
                                    ? { ...s, cardLeftBody: e.target.value }
                                    : s,
                                );
                                setCarouselSlides(next);
                                updateCarouselPreviewsAndAssets(
                                  next,
                                  carouselConfig,
                                );
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold">
                              Card 2 / CTA URL
                            </label>
                            <input
                              className={`${field} py-1.5 text-xs`}
                              value={slide.cardRightTitle}
                              onChange={(e) => {
                                const next = carouselSlides.map((s, i) =>
                                  i === idx
                                    ? { ...s, cardRightTitle: e.target.value }
                                    : s,
                                );
                                setCarouselSlides(next);
                                updateCarouselPreviewsAndAssets(
                                  next,
                                  carouselConfig,
                                );
                              }}
                            />
                            <textarea
                              rows={2}
                              className={`${field} mt-1 py-1.5 text-xs`}
                              value={slide.cardRightBody}
                              onChange={(e) => {
                                const next = carouselSlides.map((s, i) =>
                                  i === idx
                                    ? { ...s, cardRightBody: e.target.value }
                                    : s,
                                );
                                setCarouselSlides(next);
                                updateCarouselPreviewsAndAssets(
                                  next,
                                  carouselConfig,
                                );
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold">
                            Bottom Takeaway Line
                          </label>
                          <input
                            className={`${field} py-1.5 text-xs`}
                            value={slide.footer}
                            onChange={(e) => {
                              const next = carouselSlides.map((s, i) =>
                                i === idx ? { ...s, footer: e.target.value } : s,
                              );
                              setCarouselSlides(next);
                              updateCarouselPreviewsAndAssets(
                                next,
                                carouselConfig,
                              );
                            }}
                          />
                        </div>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 7. PODCAST SCRIPT STUDIO UI                                    */}
          {/* ============================================================== */}
          {format === "podcast-script" && podcastDraft && (
            <div className="mt-6 space-y-5">
              <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="podcast-mode"
                    className="mb-1 block text-xs font-bold"
                  >
                    Show Format
                  </label>
                  <select
                    id="podcast-mode"
                    className={field}
                    value={podcastMode}
                    onChange={(e) => {
                      const nextM = e.target.value as "cohost" | "solo";
                      setPodcastMode(nextM);
                      const d = buildPodcastScript(article, nextM, podcastWpm);
                      setPodcastDraft(d);
                      rebuildNonCarouselDownloads(null, null, "", null, d);
                    }}
                  >
                    <option value="cohost">
                      Two-Host Conversation (Host A &amp; Host B)
                    </option>
                    <option value="solo">Solo Host Episode</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="podcast-wpm"
                    className="mb-1 block text-xs font-bold"
                  >
                    Speaking Pace
                  </label>
                  <select
                    id="podcast-wpm"
                    className={field}
                    value={podcastWpm}
                    onChange={(e) => {
                      const nextW = Number(e.target.value) as 130 | 150 | 170;
                      setPodcastWpm(nextW);
                      const d = buildPodcastScript(
                        article,
                        podcastMode,
                        nextW,
                      );
                      setPodcastDraft(d);
                      rebuildNonCarouselDownloads(null, null, "", null, d);
                    }}
                  >
                    <option value={130}>130 WPM (Relaxed)</option>
                    <option value={150}>150 WPM (Natural Broadcast)</option>
                    <option value={170}>170 WPM (Upbeat)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    className={`${button} w-full`}
                    onClick={() =>
                      copyText(podcastScriptTxt(article, podcastDraft))
                    }
                  >
                    <Copy size={15} aria-hidden />
                    Copy Full Podcast Script
                  </button>
                </div>
              </div>

              <div className="max-h-[540px] space-y-3 overflow-y-auto pr-1">
                {podcastDraft.segments.map((seg, idx) => (
                  <div
                    key={seg.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-[#9A3412] dark:text-[#FDBA74]">
                        {seg.speaker} · {seg.topic} (~{seg.seconds}s)
                      </span>
                      <span className="text-xs text-slate-500">{seg.cue}</span>
                    </div>
                    <textarea
                      rows={3}
                      className={`${field} mt-2`}
                      value={seg.dialogue}
                      onChange={(e) => {
                        const nextSegs = podcastDraft.segments.map((s, i) =>
                          i === idx ? { ...s, dialogue: e.target.value } : s,
                        );
                        const next = { ...podcastDraft, segments: nextSegs };
                        setPodcastDraft(next);
                        rebuildNonCarouselDownloads(
                          null,
                          null,
                          "",
                          null,
                          next,
                        );
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              All edits above automatically update your download buttons.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "video-script",
                "social-posts",
                "newsletter",
                "linkedin-carousel",
                "podcast-script",
              ].includes(format) && (
                <button
                  type="button"
                  className={button}
                  disabled={aiBusy}
                  onClick={() => generateAll(true)}
                >
                  <Sparkles size={15} aria-hidden />
                  {aiBusy ? "AI Polishing…" : "AI Polish with Gemini / Groq"}
                </button>
              )}
              <button
                type="button"
                className={button}
                disabled={aiBusy}
                onClick={() => generateAll(false)}
              >
                <RefreshCw size={15} aria-hidden />
                Reset to Default Draft
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

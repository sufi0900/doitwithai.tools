/**
 * Phase 1 Foundation: Zero-Token 1000x1500 (2:3) Pinterest Pin & Section Visual SVG Renderer.
 *
 * Uses the 6-Layer Visual Pipeline rules (palette harmony, dynamic card sizing,
 * zero-clipping text wrapping, and domain footer attribution) to render live SVG
 * previews for all 3 Pinterest Pin variants per article job.
 */

import type { PinterestPinCandidate } from "./types";

function escapeXml(input: string): string {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapLines(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  return lines;
}

const PALETTE_THEMES: Record<
  string,
  { bgStart: string; bgEnd: string; cardBg: string; cardBorder: string; accent: string; badgeBg: string }
> = {
  "indigo-cyber": {
    bgStart: "#0B1021",
    bgEnd: "#131C38",
    cardBg: "#162244",
    cardBorder: "#3B82F6",
    accent: "#38BDF8",
    badgeBg: "#1E3A8A",
  },
  "emerald-growth": {
    bgStart: "#061A17",
    bgEnd: "#0B2B26",
    cardBg: "#113832",
    cardBorder: "#10B981",
    accent: "#34D399",
    badgeBg: "#065F46",
  },
  "blue-trust": {
    bgStart: "#081426",
    bgEnd: "#0F2544",
    cardBg: "#153059",
    cardBorder: "#60A5FA",
    accent: "#93C5FD",
    badgeBg: "#1D4ED8",
  },
};

export function renderPinterestPinPreviewSvg(
  pin: PinterestPinCandidate,
  brandName = "DoItWithAI.tools",
  brandPrimaryHex = "#38BDF8",
): string {
  const W = 1000;
  const H = 1500;
  const theme = PALETTE_THEMES[pin.paletteId] || PALETTE_THEMES["indigo-cyber"];
  const accentColor = brandPrimaryHex || theme.accent;

  const titleLines = wrapLines(pin.pinTitle, 30, 3);
  const subtitleLines = wrapLines(pin.pinDescription, 58, 2);
  const nodes = (pin.nodes || []).slice(0, 5);

  const headerBottomY = 330;
  const footerTopY = 1410;
  const availableBodyH = footerTopY - headerBottomY - 20;
  const count = Math.max(1, nodes.length);
  const gap = 20;
  const cardH = Math.min(220, Math.floor((availableBodyH - gap * (count - 1)) / count));

  const cardsSvg = nodes
    .map((node, idx) => {
      const y = headerBottomY + idx * (cardH + gap);
      const nodeTitleLines = wrapLines(node.title, 40, 2);
      const nodeDetailLines = wrapLines(node.detail, 56, 2);

      return `
      <g transform="translate(60, ${y})">
        <rect width="880" height="${cardH}" rx="22" fill="${theme.cardBg}" fill-opacity="0.92" stroke="${theme.cardBorder}" stroke-opacity="0.45" stroke-width="2" />
        <rect x="24" y="24" width="76" height="44" rx="12" fill="${theme.badgeBg}" stroke="${accentColor}" stroke-width="1.5" />
        <text x="62" y="53" text-anchor="middle" fill="#F8FAFC" font-family="Inter, system-ui, sans-serif" font-size="20" font-weight="800">${escapeXml(
          node.badge || `0${idx + 1}`,
        )}</text>
        ${nodeTitleLines
          .map(
            (line, lIdx) =>
              `<text x="122" y="${50 + lIdx * 30}" fill="#FFFFFF" font-family="Inter, system-ui, sans-serif" font-size="25" font-weight="700">${escapeXml(
                line,
              )}</text>`,
          )
          .join("")}
        ${nodeDetailLines
          .map(
            (line, dIdx) =>
              `<text x="122" y="${54 + nodeTitleLines.length * 30 + dIdx * 26}" fill="#CBD5E1" font-family="Inter, system-ui, sans-serif" font-size="19" font-weight="500">${escapeXml(
                line,
              )}</text>`,
          )
          .join("")}
      </g>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(
    pin.altText || pin.pinTitle,
  )}">
  <defs>
    <linearGradient id="pinBg-${escapeXml(pin.id)}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.bgStart}" />
      <stop offset="100%" stop-color="${theme.bgEnd}" />
    </linearGradient>
    <pattern id="pinDots-${escapeXml(pin.id)}" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="1.5" fill="${accentColor}" fill-opacity="0.16" />
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#pinBg-${escapeXml(pin.id)})" />
  <rect width="${W}" height="${H}" fill="url(#pinDots-${escapeXml(pin.id)})" />

  <!-- Top Eyebrow Pill -->
  <g transform="translate(60, 48)">
    <rect width="460" height="44" rx="22" fill="${theme.badgeBg}" fill-opacity="0.85" stroke="${accentColor}" stroke-width="1.5" />
    <text x="24" y="29" fill="${accentColor}" font-family="Inter, system-ui, sans-serif" font-size="17" font-weight="800" letter-spacing="1.2">${escapeXml(
      `PIN #${pin.pinVariantIndex} · ${pin.angleLabel.toUpperCase()}`,
    )}</text>
  </g>

  <!-- Main Headline -->
  <g transform="translate(60, 138)">
    ${titleLines
      .map(
        (line, idx) =>
          `<text x="0" y="${idx * 48}" fill="#FFFFFF" font-family="Inter, system-ui, sans-serif" font-size="40" font-weight="800">${escapeXml(
            line,
          )}</text>`,
      )
      .join("\n    ")}
  </g>

  <!-- Subtitle -->
  <g transform="translate(60, ${146 + titleLines.length * 46})">
    ${subtitleLines
      .map(
        (line, idx) =>
          `<text x="0" y="${idx * 26}" fill="#94A3B8" font-family="Inter, system-ui, sans-serif" font-size="19" font-weight="500">${escapeXml(
            line,
          )}</text>`,
      )
      .join("\n    ")}
  </g>

  <!-- Structured Cards -->
  ${cardsSvg}

  <!-- Footer Attribution Bar -->
  <line x1="60" y1="${footerTopY}" x2="940" y2="${footerTopY}" stroke="${accentColor}" stroke-opacity="0.3" stroke-width="1.5" />
  <text x="60" y="${footerTopY + 46}" fill="#94A3B8" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="600">Board: ${escapeXml(
    pin.boardName,
  )} · Day +${pin.scheduledDayOffset}</text>
  <text x="940" y="${footerTopY + 46}" text-anchor="end" fill="#FFFFFF" font-family="Inter, system-ui, sans-serif" font-size="20" font-weight="800">${escapeXml(
    brandName,
  )}</text>
</svg>`;
}

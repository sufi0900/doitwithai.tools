/** One SVG scene is used by the gallery, editor, PNG rasterizer and writer exports. */
import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
} from "@/lib/blog-writer/canonical-state";
import { buildPrismScene } from "./prism-renderer";
import { BLOG_INFOGRAPHIC_25_TEMPLATES } from "@/lib/blog-infographic-studio/templates";
import { ASPECT_RATIO_DIMENSIONS, BLOG_INFOGRAPHIC_PALETTES } from "./palettes";
import artwork from "./editorial-art.json";
export { ASPECT_RATIO_DIMENSIONS, BLOG_INFOGRAPHIC_PALETTES } from "./palettes";
export type { BlogInfographicPaletteTokens } from "./palettes";
export interface BlogInfographicCustomColorOverrides {
  bgStart?: string;
  surface?: string;
  accent?: string;
  textMain?: string;
}
export interface BlogInfographicRenderOptions {
  scale?: number;
  customColors?: BlogInfographicCustomColorOverrides;
}
export interface InfographicFitIssue {
  field: string;
  message: string;
}
type Box = { x: number; y: number; w: number; h: number };
const esc = (s: unknown) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
const num = (n: number) => Math.round(n * 100) / 100;
const safeColor = (v: string | undefined, fallback: string) =>
  /^#[a-f\d]{6}$/i.test(v || "") ? v! : fallback;
function luminance(hex: string): number {
  const values = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
function contrast(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
const onColor = (color: string) =>
  contrast(color, "#FFFFFF") >= 4.5 ? "#FFFFFF" : "#0F172A";

export const isSafeInfographicImage = (value: string | undefined) =>
  /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value || "") &&
  value!.length < 3_000_000;

const samples = [
  [
    "Clean the list",
    "Remove duplicates and queries outside your audience’s needs.",
  ],
  [
    "Group by intent",
    "Bring related questions together around one useful answer.",
  ],
  [
    "Map to a page",
    "Improve an existing page or plan a new one for each topic.",
  ],
  [
    "Publish and review",
    "Add useful examples, link related pages, and measure results.",
  ],
];
export function createSampleInfographicConfig(
  templateId = 1,
  paletteId: BlogInfographicConfig["paletteId"] = "blue-trust",
): BlogInfographicConfig {
  const t =
    BLOG_INFOGRAPHIC_25_TEMPLATES.find((t) => t.id === templateId) ||
    BLOG_INFOGRAPHIC_25_TEMPLATES[0];
  const data = templateId >= 11 && templateId <= 15;
  return {
    id: `infographic-tpl-${t.id}`,
    sectionId: "sample-section",
    templateId: t.id,
    templateSlug: t.slug,
    templateName: t.name,
    headline: data
      ? "A content audit, at a glance"
      : "Turn keyword research into a content plan",
    subheadline: data
      ? "Illustrative dataset · Replace with your own verified figures"
      : "Four decisions that turn a spreadsheet into useful pages",
    paletteId,
    aspectRatio: "4:5",
    nodes: samples.map(([title, detail], i) => ({
      id: `node-${i}`,
      badge: String(i + 1).padStart(2, "0"),
      title: data
        ? [
            "Pages reviewed",
            "Pages to update",
            "Pages to merge",
            "Pages to keep",
          ][i]
        : title,
      detail: data
        ? [
            "Total pages in this example audit.",
            "Refresh information and examples.",
            "Combine pages with the same purpose.",
            "Keep useful pages current.",
          ][i]
        : detail,
      metricValue: data ? ["40", "18", "8", "14"][i] : "",
    })),
    footerSourceLabel: data
      ? "Source: illustrative example, not research findings"
      : "DoItWithAI.tools · Content planning guide",
    altText: data
      ? "Example content audit showing 40 reviewed pages."
      : "Four steps from a keyword list to a published content plan.",
    brand: { illustration: "paper-steps" },
  };
}

// Conservative, DOM-independent text measurement keeps server SVG and browser PNG identical.
function textWidth(text: string, size: number, bold = false): number {
  return (
    Array.from(text).reduce(
      (sum, c) =>
        sum +
        (/\s/.test(c)
          ? 0.32
          : /[ilI.,'!:;|]/.test(c)
            ? 0.29
            : /[MW@%]/.test(c)
              ? 0.96
              : c.charCodeAt(0) > 255
                ? 1
                : 0.6),
      0,
    ) *
    size *
    (bold ? 1.04 : 1)
  );
}
function wrap(
  text: string,
  width: number,
  size: number,
  bold: boolean,
): string[] {
  const lines: string[] = [];
  for (const paragraph of String(text || "").split(/\n/)) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (textWidth(word, size, bold) > width) {
        if (line) {
          lines.push(line);
          line = "";
        }
        for (const char of Array.from(word)) {
          if (textWidth(line + char, size, bold) > width && line) {
            lines.push(line);
            line = "";
          }
          line += char;
        }
      } else if (line && textWidth(`${line} ${word}`, size, bold) > width) {
        lines.push(line);
        line = word;
      } else line += (line ? " " : "") + word;
    }
    if (line) lines.push(line);
  }
  return lines;
}

export function buildInfographicScene(
  config: BlogInfographicConfig,
  options: BlogInfographicRenderOptions = {},
): { svg: string; issues: InfographicFitIssue[] } {
  if (config.visualEngine === "prism-antv") return buildPrismScene({ ...config, brand: { ...config.brand, customColors: { ...config.brand?.customColors, ...options.customColors } } });
  const { width: W, height: H } =
    ASPECT_RATIO_DIMENSIONS[config.aspectRatio] ||
    ASPECT_RATIO_DIMENSIONS["16:9"];
  const base =
    BLOG_INFOGRAPHIC_PALETTES[config.paletteId] ||
    BLOG_INFOGRAPHIC_PALETTES["blue-trust"];
  const overrides = { ...config.brand?.customColors, ...options.customColors };
  const bg = safeColor(overrides.bgStart, base.bgStart),
    ink = safeColor(overrides.textMain, base.textMain),
    accent = safeColor(overrides.accent, base.accent),
    paper = safeColor(overrides.surface, base.surface);
  const light =
    parseInt(bg.slice(1, 3), 16) * 0.299 +
      parseInt(bg.slice(3, 5), 16) * 0.587 +
      parseInt(bg.slice(5, 7), 16) * 0.114 >
    145;
  const muted = light ? "#52617A" : "#B5C4DE",
    edge = light ? "#CBD5E1" : "#39455D";
  const colors = [
    accent,
    light ? "#087F8C" : "#5EEAD4",
    light ? "#8A4BCC" : "#C4B5FD",
    light ? "#B76510" : "#FBBF24",
  ];
  const spec =
    BLOG_INFOGRAPHIC_25_TEMPLATES.find((t) => t.id === config.templateId) ||
    BLOG_INFOGRAPHIC_25_TEMPLATES[0];
  const nodes = (config.nodes || []).slice(0, 8),
    N = nodes.length,
    id = spec.id;
  const parts: string[] = [],
    issues: InfographicFitIssue[] = [];
  if (contrast(ink, bg) < 3 || contrast(ink, paper) < 3)
    issues.push({
      field: "Colors",
      message:
        "Your text and background colors have low contrast. Choose a darker text color or a lighter background for readability.",
    });
  if ((config.nodes || []).length > 8)
    issues.push({
      field: "nodes",
      message:
        "Use at most 8 points per infographic. Extra points are not shown.",
    });
  function rect(b: Box, fill: string, r = 0, stroke?: string, opacity = 1) {
    parts.push(
      `<rect x="${num(b.x)}" y="${num(b.y)}" width="${num(Math.max(0, b.w))}" height="${num(Math.max(0, b.h))}" rx="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="1.5"` : ""} opacity="${opacity}"/>`,
    );
  }
  function path(d: string, stroke: string, sw = 3, fill = "none", opacity = 1) {
    parts.push(
      `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`,
    );
  }
  function circle(
    x: number,
    y: number,
    r: number,
    fill: string,
    stroke?: string,
    sw = 2,
  ) {
    parts.push(
      `<circle cx="${num(x)}" cy="${num(y)}" r="${num(r)}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ""}/>`,
    );
  }
  function text(
    value: string,
    b: Box,
    max = 28,
    min = 18,
    bold = false,
    color = ink,
    field = "text",
    align: "start" | "middle" = "start",
  ) {
    if (!value) return;
    let size = max,
      lines = wrap(value, b.w, size, bold);
    while (size > min && lines.length * size * 1.28 > b.h) {
      size--;
      lines = wrap(value, b.w, size, bold);
    }
    const limit = Math.max(1, Math.floor(b.h / (size * 1.28)));
    if (lines.length > limit || textWidth(lines[0] || "", size, bold) > b.w) {
      issues.push({
        field,
        message: `${field}: shorten the text or choose a taller format to show it in full.`,
      });
      lines = lines.slice(0, limit);
      let end = lines[lines.length - 1] || "";
      while (textWidth(end + "…", size, bold) > b.w && end.length)
        end = end.slice(0, -1);
      lines[lines.length - 1] = end + "…";
    }
    const x = align === "middle" ? b.x + b.w / 2 : b.x;
    const clipId = `text-${parts.length}`;
    parts.push(
      `<defs><clipPath id="${clipId}"><rect x="${b.x}" y="${b.y}" width="${Math.max(0, b.w)}" height="${Math.max(0, b.h)}"/></clipPath></defs>`,
    );
    parts.push(
      `<text clip-path="url(#${clipId})" fill="${color}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${bold ? 700 : 400}" text-anchor="${align}"><title>${esc(value)}</title>${lines.map((l, i) => `<tspan x="${num(x)}" y="${num(b.y + size + i * size * 1.28)}">${esc(l)}</tspan>`).join("")}</text>`,
    );
  }
  function badge(label: string, x: number, y: number, c: string, size = 44) {
    circle(x + size / 2, y + size / 2, size / 2, c);
    text(
      label,
      { x: x + 4, y: y + size * 0.16, w: size - 8, h: size * 0.7 },
      size * 0.42,
      12,
      true,
      onColor(c),
      "badge",
      "middle",
    );
  }
  function node(
    n: BlogInfographicNodeItem,
    b: Box,
    i: number,
    kind: "card" | "plain" | "metric" | "check" = "card",
  ) {
    const c = colors[i % 4],
      p = Math.max(16, Math.min(28, b.w * 0.07));
    if (kind !== "plain") {
      rect(b, paper, 18, edge);
      rect({ x: b.x, y: b.y + 18, w: 4, h: b.h - 36 }, c, 2);
    }
    const x = b.x + p,
      w = b.w - 2 * p;
    const top = b.y + p,
      titleH = Math.min(76, b.h * 0.28);
    if (kind === "metric") {
      text(
        n.metricValue || "—",
        { x, y: top, w, h: b.h * 0.32 },
        Math.min(78, b.h * 0.28),
        26,
        true,
        c,
        `Point ${i + 1} value`,
      );
      text(
        n.title,
        { x, y: top + b.h * 0.34, w, h: titleH },
        28,
        18,
        true,
        ink,
        `Point ${i + 1} title`,
      );
      text(
        n.detail,
        {
          x,
          y: top + b.h * 0.34 + titleH + 6,
          w,
          h: Math.max(28, b.h - p * 2 - b.h * 0.34 - titleH - 6),
        },
        23,
        18,
        false,
        muted,
        `Point ${i + 1} detail`,
      );
    } else {
      const compact = b.h < 260;
      badge(kind === "check" ? "✓" : n.badge || String(i + 1), x, top, c, 36);
      if (compact) {
        const th = Math.min(66, b.h * 0.35);
        text(
          n.title,
          { x: x + 48, y: top, w: w - 48, h: th },
          25,
          18,
          true,
          ink,
          `Point ${i + 1} title`,
        );
        text(
          [n.detail, n.metricValue].filter(Boolean).join(" · "),
          { x, y: top + th + 12, w, h: Math.max(24, b.h - p * 2 - th - 12) },
          22,
          17,
          false,
          muted,
          `Point ${i + 1} detail`,
        );
      } else {
        if (n.metricValue)
          text(
            n.metricValue,
            { x: x + 48, y: top + 4, w: Math.max(50, w - 48), h: 32 },
            22,
            16,
            true,
            c,
            `Point ${i + 1} value`,
          );
        text(
          n.title,
          { x, y: top + 48, w, h: titleH },
          28,
          18,
          true,
          ink,
          `Point ${i + 1} title`,
        );
        text(
          n.detail,
          {
            x,
            y: top + 48 + titleH + 8,
            w,
            h: Math.max(24, b.h - p * 2 - 56 - titleH),
          },
          23,
          18,
          false,
          muted,
          `Point ${i + 1} detail`,
        );
      }
    }
  }
  const margin = Math.round(Math.min(W, H) * 0.06),
    innerW = W - margin * 2;
  rect({ x: 0, y: 0, w: W, h: H }, bg);
  // A quiet editorial canvas: no repeated UI borders or template/debug labels.
  rect({ x: margin, y: margin, w: 62, h: 7 }, accent, 3);
  const logo = config.brand?.logoDataUrl;
  const logoW =
    Math.min(180, innerW * 0.22) *
    Math.max(0.7, Math.min(1.5, config.brand?.logoScale || 1));
  const hasLogo = isSafeInfographicImage(logo);
  if (hasLogo) {
    const lx = W - margin - logoW;
    if (config.brand?.logoStyle !== "plain")
      rect(
        { x: lx - 10, y: margin - 10, w: logoW + 20, h: 76 },
        config.brand?.logoStyle === "dark" ? "#0F172A" : "#FFFFFF",
        12,
      );
    parts.push(
      `<image xlink:href="${esc(logo)}" x="${num(lx)}" y="${margin}" width="${num(logoW)}" height="56" preserveAspectRatio="xMidYMid meet"/>`,
    );
  }
  const headerY = margin + (hasLogo ? 90 : 34),
    titleH = H > W ? 142 : 110;
  const artOn = config.brand?.illustration === "paper-steps" && id !== 25;
  const artW = artOn ? Math.min(innerW * 0.28, 230) : 0;
  text(
    config.headline || "Your section headline",
    { x: margin, y: headerY, w: innerW - artW - (artOn ? 28 : 0), h: titleH },
    W > 1300 ? 56 : 49,
    30,
    true,
    ink,
    "Headline",
  );
  if (artOn)
    parts.push(
      `<image xlink:href="${artwork.paperSteps}" x="${num(W - margin - artW)}" y="${num(headerY + 30)}" width="${num(artW)}" height="${num(titleH + 36)}" preserveAspectRatio="xMidYMid meet"/>`,
    );
  const subY = headerY + titleH + 12;
  text(
    config.subheadline,
    { x: margin, y: subY, w: innerW - artW - (artOn ? 28 : 0), h: 62 },
    24,
    18,
    false,
    muted,
    "Subtitle",
  );
  const footerY = H - margin - 34;
  path(`M ${margin} ${footerY - 18} H ${W - margin}`, edge, 1);
  text(
    config.footerSourceLabel,
    { x: margin, y: footerY, w: innerW, h: 40 },
    18,
    14,
    false,
    muted,
    "Source / brand",
  );
  const B: Box = {
    x: margin,
    y: subY + 94,
    w: innerW,
    h: footerY - 40 - (subY + 94),
  };
  const gap = 28;
  function grid(
    kind: "card" | "plain" | "metric" | "check" = "card",
    columns?: number,
  ) {
    const cols = columns || (W > H ? (N > 6 ? 4 : N > 4 ? 3 : 2) : 2),
      rows = Math.ceil(N / cols),
      w = (B.w - gap * (cols - 1)) / cols,
      h = (B.h - gap * (rows - 1)) / Math.max(1, rows);
    nodes.forEach((n, i) =>
      node(
        n,
        {
          x: B.x + (i % cols) * (w + gap),
          y: B.y + Math.floor(i / cols) * (h + gap),
          w,
          h,
        },
        i,
        kind,
      ),
    );
  }
  function rows(style: "timeline" | "list" | "ledger" | "check" | "bars") {
    const cols = style === "bars" && N > 4 && W > H ? 2 : 1,
      count = Math.ceil(N / cols),
      rowW = (B.w - gap * (cols - 1)) / cols;
    const h = (B.h - gap * (count - 1)) / Math.max(1, count),
      labelW = rowW * 0.24;
    if (h < 110 && style !== "bars") {
      grid(style === "check" ? "check" : "card", W > H ? 4 : 2);
      return;
    }
    if (style === "timeline")
      path(`M ${B.x + 29} ${B.y + 25} V ${B.y + B.h - 30}`, edge, 4);
    const numeric = nodes.map((n) => parseChartValue(n.metricValue));
    const valid =
      numeric.every((v) => v !== null && v.value >= 0) &&
      new Set(numeric.map((v) => v?.unit)).size <= 1;
    const max = Math.max(1, ...numeric.map((v) => Math.abs(v?.value || 0)));
    if (style === "bars" && !valid)
      issues.push({
        field: "Values",
        message:
          "Bars need a number in every Value field, using the same unit. Text values are displayed without a bar.",
      });
    nodes.forEach((n, i) => {
      const R = { ...B, x: B.x + (i % cols) * (rowW + gap), w: rowW };
      const y = B.y + Math.floor(i / cols) * (h + gap),
        c = colors[i % 4];
      if (style === "list" || style === "check" || style === "ledger")
        rect({ x: R.x, y, w: R.w, h }, paper, 16, edge);
      badge(
        style === "check" ? "✓" : n.badge || String(i + 1),
        R.x + (style === "timeline" ? 7 : 16),
        y + Math.max(0, (h - 42) / 2),
        c,
        42,
      );
      const x = R.x + 82;
      if (style === "bars") {
        text(
          n.title,
          { x, y, w: R.w * 0.67, h: 32 },
          25,
          18,
          true,
          ink,
          `Point ${i + 1} title`,
        );
        text(
          n.metricValue || "Add a value",
          { x: R.x + R.w * 0.78, y, w: R.w * 0.22, h: 36 },
          30,
          18,
          true,
          c,
          `Point ${i + 1} value`,
          "middle",
        );
        const barY = y + 42,
          barW = R.w - 82;
        rect({ x, y: barY, w: barW, h: 12 }, edge, 6);
        if (valid && numeric[i]!.value >= 0)
          rect(
            { x, y: barY, w: (barW * numeric[i]!.value) / max, h: 12 },
            c,
            6,
          );
        text(
          n.detail,
          { x, y: barY + 22, w: barW, h: Math.max(24, h - 70) },
          22,
          17,
          false,
          muted,
          `Point ${i + 1} detail`,
        );
      } else if (style === "ledger") {
        text(
          n.title,
          { x, y: y + 14, w: R.w - labelW - 110, h: Math.min(55, h * 0.38) },
          27,
          18,
          true,
          ink,
          `Point ${i + 1} title`,
        );
        text(
          n.detail,
          { x, y: y + h * 0.45, w: R.w - labelW - 110, h: h * 0.45 - 10 },
          22,
          17,
          false,
          muted,
          `Point ${i + 1} detail`,
        );
        text(
          n.metricValue || "—",
          {
            x: R.x + R.w - labelW,
            y: y + h * 0.15,
            w: labelW - 24,
            h: h * 0.65,
          },
          45,
          20,
          true,
          c,
          `Point ${i + 1} value`,
          "middle",
        );
      } else {
        const tw = R.w - 108;
        text(
          n.title,
          { x, y: y + 8, w: tw, h: Math.min(60, h * 0.39) },
          29,
          18,
          true,
          ink,
          `Point ${i + 1} title`,
        );
        text(
          [n.detail, n.metricValue].filter(Boolean).join(" · "),
          {
            x,
            y: y + Math.min(60, h * 0.39) + 16,
            w: tw,
            h: Math.max(22, h - Math.min(60, h * 0.39) - 24),
          },
          23,
          17,
          false,
          muted,
          `Point ${i + 1} detail`,
        );
      }
    });
  }
  function split() {
    const count = Math.ceil(N / 2),
      gutter = id === 6 ? 76 : 32,
      w = (B.w - gutter) / 2;
    const defaults: Record<number, string[]> = {
      6: ["Option A", "Option B"],
      8: ["Before", "After"],
      9: ["Advantages", "Trade-offs"],
      10: ["Do", "Avoid"],
      23: ["Assumption", "Evidence"],
    };
    const labels = config.comparisonLabels || defaults[id] || ["A", "B"];
    const rh = (B.h - 70 - gap * (count - 1)) / Math.max(1, count);
    // Different comparison jobs use different compositions, not relabelled copies.
    if (id === 6) {
      path(`M ${B.x + B.w / 2} ${B.y + 75} V ${B.y + B.h - 15}`, edge, 2);
      badge("VS", B.x + B.w / 2 - 22, B.y + 3, accent, 44);
    }
    labels.forEach((label, j) => {
      const x = B.x + j * (w + gutter),
        c = colors[j];
      if (id === 8 || id === 9) rect({ x, y: B.y, w, h: B.h }, paper, 20, edge);
      if (id === 10) rect({ x, y: B.y, w, h: 52 }, c, 12);
      text(
        label,
        {
          x: x + (id === 8 || id === 9 ? 22 : 12),
          y: B.y + 9,
          w: w - 44,
          h: 38,
        },
        29,
        20,
        true,
        id === 10 ? onColor(c) : c,
        `Column ${j + 1}`,
      );
    });
    nodes.forEach((n, i) => {
      const side = i % 2,
        row = Math.floor(i / 2),
        x = B.x + side * (w + gutter),
        y = B.y + 70 + row * (rh + gap),
        c = colors[side];
      if (id === 6) {
        node(n, { x, y, w, h: rh }, i, "plain");
        circle(B.x + B.w / 2, y + rh / 2, 7, c);
      } else if (id === 8) {
        const inset = 22;
        if (row) path(`M ${x + inset} ${y - 15} H ${x + w - inset}`, edge, 1);
        text(
          n.metricValue || n.badge,
          { x: x + inset, y: y + 8, w: w - inset * 2, h: rh * 0.25 },
          40,
          22,
          true,
          c,
          `Point ${i + 1} value`,
        );
        text(
          n.title,
          { x: x + inset, y: y + rh * 0.3, w: w - inset * 2, h: rh * 0.25 },
          28,
          18,
          true,
          ink,
          `Point ${i + 1} title`,
        );
        text(
          n.detail,
          { x: x + inset, y: y + rh * 0.6, w: w - inset * 2, h: rh * 0.34 },
          23,
          18,
          false,
          muted,
          `Point ${i + 1} detail`,
        );
      } else if (id === 9) {
        badge(side ? "−" : "+", x + 22, y + 10, c, 34);
        text(
          n.title,
          { x: x + 70, y: y + 8, w: w - 92, h: rh * 0.3 },
          27,
          18,
          true,
          ink,
          `Point ${i + 1} title`,
        );
        text(
          [n.detail, n.metricValue].filter(Boolean).join(" · "),
          { x: x + 22, y: y + rh * 0.38, w: w - 44, h: rh * 0.54 },
          23,
          18,
          false,
          muted,
          `Point ${i + 1} detail`,
        );
      } else if (id === 10) {
        node({ ...n, badge: side ? "×" : "✓" }, { x, y, w, h: rh }, i, "plain");
      } else {
        rect({ x, y, w, h: rh }, side ? paper : bg, 16, edge);
        rect({ x, y: y + 14, w: 4, h: rh - 28 }, c, 2);
        text(
          n.title,
          { x: x + 22, y: y + 16, w: w - 44, h: rh * 0.32 },
          28,
          18,
          true,
          side ? ink : muted,
          `Point ${i + 1} title`,
        );
        text(
          [n.detail, n.metricValue].filter(Boolean).join(" · "),
          { x: x + 22, y: y + rh * 0.4, w: w - 44, h: rh * 0.5 },
          23,
          18,
          false,
          muted,
          `Point ${i + 1} detail`,
        );
      }
    });
  }
  function orbit(hub = false) {
    if (N > 6) {
      rows("timeline");
      return;
    }
    const cx = B.x + B.w / 2,
      cy = B.y + B.h / 2;
    const r = Math.min(B.w * 0.15, B.h * 0.16),
      bw = B.w * 0.28,
      bh = Math.min(B.h * 0.23, 200);
    const positions = nodes.map((_, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(1, N);
      return {
        x: cx + Math.cos(a) * (B.w / 2 - bw / 2) - bw / 2,
        y: cy + Math.sin(a) * (B.h / 2 - bh / 2) - bh / 2,
        w: bw,
        h: bh,
      };
    });
    if (!hub) circle(cx, cy, Math.min(B.w * 0.32, B.h * 0.33), "none", edge, 5);
    positions.forEach((p) => {
      if (hub)
        path(`M ${cx} ${cy} L ${p.x + p.w / 2} ${p.y + p.h / 2}`, edge, 4);
    });
    circle(cx, cy, r, accent);
    text(
      config.centerLabel || (hub ? "TOPIC" : "CYCLE"),
      { x: cx - r * 0.82, y: cy - 20, w: r * 1.64, h: 42 },
      Math.min(28, r * 0.28),
      17,
      true,
      onColor(accent),
      "Center",
      "middle",
    );
    positions.forEach((p, i) => node(nodes[i], p, i));
  }
  if (!N)
    text(
      "Add your first point to build the infographic.",
      B,
      32,
      22,
      false,
      muted,
    );
  else
    switch (id) {
      case 1: {
        const cols = W > H ? Math.min(N, 4) : 2,
          rowsN = Math.ceil(N / cols),
          w = (B.w - gap * (cols - 1)) / cols,
          h = (B.h - gap * (rowsN - 1)) / rowsN;
        nodes.forEach((n, i) => {
          const x = B.x + (i % cols) * (w + gap),
            y = B.y + Math.floor(i / cols) * (h + gap);
          if (i % cols < cols - 1 && i < N - 1)
            path(
              `M ${x + w - 6} ${y + 35} H ${x + w + gap - 6} l -9 -7 m 9 7 l -9 7`,
              colors[i % 4],
              3,
            );
          node(n, { x, y, w, h }, i, "plain");
        });
        break;
      }
      case 2:
        rows("timeline");
        break;
      case 3:
        orbit();
        break;
      case 4: {
        if (W < H && N <= 6) {
          const mid = B.x + B.w / 2,
            step = B.h / N,
            w = B.w * 0.42;
          const positions = nodes.map((_, i) => ({
            x: i % 2 ? B.x + B.w - w : B.x,
            y: B.y + i * step,
            w,
            h: step - 18,
          }));
          const centers = positions.map((p, i) => ({
            x: mid + (i % 2 ? 30 : -30),
            y: p.y + 38,
          }));
          let curve = `M ${centers[0].x} ${centers[0].y}`;
          centers.slice(1).forEach((p, i) => {
            const prev = centers[i];
            curve += ` C ${prev.x} ${prev.y + step * 0.55}, ${p.x} ${p.y - step * 0.55}, ${p.x} ${p.y}`;
          });
          path(curve, edge, 5);
          positions.forEach((p, i) => {
            circle(centers[i].x, centers[i].y, 10, colors[i % 4]);
            node(nodes[i], p, i, "plain");
          });
        } else if (N > 5) {
          grid("plain", W > H ? 4 : 2);
        } else {
          const w = (B.w - gap * (N - 1)) / N,
            h = B.h * 0.7;
          nodes.forEach((n, i) => {
            const x = B.x + i * (w + gap),
              y = B.y + (i % 2 ? B.h - h : 0);
            if (i < N - 1)
              path(
                `M ${x + w / 2} ${y + 30} L ${x + w + gap + w / 2} ${B.y + ((i + 1) % 2 ? B.h - h : 0) + 30}`,
                edge,
                4,
              );
            node(n, { x, y, w, h }, i);
          });
        }
        break;
      }
      case 5:
      case 17: {
        const rowH = (B.h - gap * (N - 1)) / N;
        if (rowH < 100) {
          grid("plain", W > H ? 4 : 2);
          break;
        }
        nodes.forEach((n, i) => {
          const width =
              B.w *
              (id === 5
                ? 1 - (i / (N + 1)) * 0.5
                : 0.45 + (i / (N + 1)) * 0.55),
            x = B.x + (B.w - width) / 2,
            y = B.y + i * (rowH + gap),
            c = colors[i % 4];
          path(
            `M ${x} ${y} H ${x + width} L ${x + width + (id === 17 ? B.w * 0.04 : -B.w * 0.04)} ${y + rowH} H ${x + (id === 17 ? -B.w * 0.04 : B.w * 0.04)} Z`,
            c,
            0,
            c,
            0.13,
          );
          text(
            `${n.badge || i + 1}  ${n.title}`,
            { x: x + 24, y: y + 9, w: width - 48, h: rowH * 0.36 },
            28,
            18,
            true,
            c,
            `Point ${i + 1} title`,
          );
          text(
            [n.detail, n.metricValue].filter(Boolean).join(" · "),
            { x: x + 24, y: y + rowH * 0.43, w: width - 48, h: rowH * 0.48 },
            22,
            17,
            false,
            ink,
            `Point ${i + 1} detail`,
          );
        });
        break;
      }
      case 6:
      case 8:
      case 9:
      case 10:
      case 23:
        split();
        break;
      case 7:
        grid("card", W > H ? 3 : 2);
        break;
      case 11:
        grid("metric", W > H && N <= 4 ? N : undefined);
        break;
      case 12: {
        const first = nodes[0],
          vertical = W < H,
          lead = vertical
            ? { x: B.x, y: B.y, w: B.w, h: B.h * 0.34 }
            : { x: B.x, y: B.y, w: B.w * 0.4, h: B.h };
        rect(lead, accent, 24);
        text(
          first.metricValue || first.badge,
          { x: lead.x + 30, y: lead.y + 25, w: lead.w - 60, h: lead.h * 0.36 },
          100,
          40,
          true,
          onColor(accent),
          "Point 1 value",
        );
        text(
          first.title,
          {
            x: lead.x + 30,
            y: lead.y + lead.h * 0.43,
            w: lead.w - 60,
            h: lead.h * 0.22,
          },
          35,
          20,
          true,
          onColor(accent),
          "Point 1 title",
        );
        text(
          first.detail,
          {
            x: lead.x + 30,
            y: lead.y + lead.h * 0.68,
            w: lead.w - 60,
            h: lead.h * 0.24,
          },
          24,
          18,
          false,
          onColor(accent),
          "Point 1 detail",
        );
        const remaining = N - 1,
          r = {
            x: vertical ? B.x : B.x + lead.w + gap,
            y: vertical ? B.y + lead.h + gap : B.y,
            w: vertical ? B.w : B.w - lead.w - gap,
            h: vertical ? B.h - lead.h - gap : B.h,
          };
        nodes.slice(1).forEach((n, i) =>
          node(
            n,
            {
              x: r.x,
              y: r.y + i * (r.h / Math.max(1, remaining)),
              w: r.w,
              h: r.h / Math.max(1, remaining) - 16,
            },
            i + 1,
          ),
        );
        break;
      }
      case 13:
        rows("bars");
        break;
      case 14:
        rows("ledger");
        break;
      case 15: {
        const cols = W > H ? N : 2,
          rowsN = Math.ceil(N / cols),
          w = (B.w - gap * (cols - 1)) / cols,
          h = (B.h - gap * (rowsN - 1)) / rowsN;
        nodes.forEach((n, i) => {
          const x = B.x + (i % cols) * (w + gap),
            y = B.y + Math.floor(i / cols) * (h + gap),
            r = Math.min(w * 0.28, h * 0.22),
            cx = x + w / 2,
            cy = y + r + 12,
            c = colors[i % 4],
            v = parseChartValue(n.metricValue);
          circle(cx, cy, r, "none", edge, 12);
          if (v && v.unit === "%" && v.value >= 0 && v.value <= 100)
            parts.push(
              `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="12" pathLength="100" stroke-dasharray="${v.value} 100" transform="rotate(-90 ${cx} ${cy})"/>`,
            );
          text(
            n.metricValue || n.badge,
            { x: cx - r * 0.85, y: cy - 20, w: r * 1.7, h: 50 },
            36,
            18,
            true,
            c,
            `Point ${i + 1} value`,
            "middle",
          );
          text(
            n.title,
            {
              x: x + 8,
              y: y + r * 2 + 40,
              w: w - 16,
              h: Math.min(90, h * 0.22),
            },
            28,
            18,
            true,
            ink,
            `Point ${i + 1} title`,
            "middle",
          );
          text(
            n.detail,
            {
              x: x + 8,
              y: y + r * 2 + 50 + Math.min(90, h * 0.22),
              w: w - 16,
              h: Math.max(30, h - r * 2 - 70 - Math.min(90, h * 0.22)),
            },
            23,
            18,
            false,
            muted,
            `Point ${i + 1} detail`,
            "middle",
          );
        });
        break;
      }
      case 16: {
        grid("plain", 2);
        path(
          `M ${B.x + B.w / 2} ${B.y} V ${B.y + B.h} M ${B.x} ${B.y + B.h / 2} H ${B.x + B.w}`,
          edge,
          2,
        );
        break;
      }
      case 18: {
        const r = Math.min(B.w * 0.22, B.h * (N > 4 ? 0.08 : 0.2)),
          cx = B.x + B.w / 2,
          cy = B.y + r;
        [0, 1, 2].forEach((i) =>
          circle(
            cx + (i - 1) * r * 0.75,
            cy + (i === 1 ? 0 : r * 0.5),
            r,
            colors[i],
            undefined,
          ),
        );
        const old = { ...B };
        B.y += r * 2.8;
        B.h -= r * 2.8;
        grid("plain", W > H ? (N > 6 ? 4 : Math.min(3, N)) : 2);
        Object.assign(B, old);
        break;
      }
      case 19:
        orbit(true);
        break;
      case 20:
        rows("check");
        break;
      case 21:
        rows("list");
        break;
      case 22: {
        const wx = B.x + B.w * 0.37,
          ww = B.w * 0.25;
        rect({ x: wx, y: B.y, w: ww, h: B.h }, paper, 18, edge);
        for (let j = 0; j < 6; j++)
          rect(
            {
              x: wx + 20,
              y: B.y + 24 + (j * (B.h - 48)) / 6,
              w: ww - 40,
              h: (B.h - 80) / 7,
            },
            j === 0 ? accent : edge,
            6,
            undefined,
            j === 0 ? 0.9 : 0.35,
          );
        const per = Math.ceil(N / 2),
          nh = (B.h - gap * (per - 1)) / per;
        nodes.forEach((n, i) => {
          const left = i % 2 === 0,
            w = B.w * 0.31,
            x = left ? B.x : B.x + B.w - w,
            y = B.y + Math.floor(i / 2) * (nh + gap);
          path(
            `M ${left ? x + w : x} ${y + nh / 2} H ${left ? wx : wx + ww}`,
            colors[i % 4],
            2,
          );
          node(n, { x, y, w, h: nh }, i, "plain");
        });
        break;
      }
      case 24:
        grid("check", W > H ? 3 : 2);
        break;
      case 25: {
        const old = { ...B };
        if (config.brand?.illustration === "paper-steps") {
          const artBox =
            W > H
              ? { x: B.x + B.w * 0.53, y: B.y, w: B.w * 0.47, h: B.h }
              : { x: B.x, y: B.y, w: B.w, h: B.h * 0.4 };
          parts.push(
            `<image xlink:href="${artwork.paperSteps}" x="${artBox.x}" y="${artBox.y}" width="${artBox.w}" height="${artBox.h}" preserveAspectRatio="xMidYMid meet"/>`,
          );
          if (W > H) B.w = B.w * 0.49;
          else {
            B.y += artBox.h + 28;
            B.h -= artBox.h + 28;
          }
        }
        if (W > H) {
          const rowH = (B.h - 16 * (N - 1)) / N;
          nodes.forEach((n, i) => {
            const y = B.y + i * (rowH + 16);
            badge(n.badge || String(i + 1), B.x, y + 4, colors[i % 4], 28);
            text(
              n.title,
              { x: B.x + 42, y, w: B.w - 42, h: rowH * 0.34 },
              27,
              18,
              true,
              ink,
              `Point ${i + 1} title`,
            );
            text(
              [n.detail, n.metricValue].filter(Boolean).join(" · "),
              { x: B.x + 42, y: y + rowH * 0.42, w: B.w - 42, h: rowH * 0.56 },
              22,
              17,
              false,
              muted,
              `Point ${i + 1} detail`,
            );
          });
        } else grid("plain", 2);
        Object.assign(B, old);
        break;
      }
      default:
        grid();
    }
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(config.altText || config.headline)}"><title>${esc(config.headline)}</title><desc>${esc([config.subheadline, ...nodes.map((n) => [n.title, n.detail, n.metricValue].filter(Boolean).join(": ")), config.footerSourceLabel].join(". "))}</desc>${parts.join("")}</svg>`,
    issues,
  };
}

/** Charts accept only explicit numbers with consistent units; no invented percentages. */
export function parseChartValue(
  raw?: string,
): { value: number; unit: string } | null {
  const match =
    /^\s*([$€£]?)\s*(-?\d+(?:,\d{3})*(?:\.\d+)?)\s*(%|ms|s|x|k|m)?\s*$/i.exec(
      raw || "",
    );
  if (!match) return null;
  const value = Number(match[2].replace(/,/g, ""));
  return Number.isFinite(value)
    ? { value, unit: match[1] + (match[3] || "").toLowerCase() }
    : null;
}
export function generateBlogInfographicSvg(
  config: BlogInfographicConfig,
  options: BlogInfographicRenderOptions = {},
): string {
  const scene = buildInfographicScene(config, options);
  if (config.visualEngine === "prism-antv" && scene.issues.length) throw new Error(scene.issues.map(i => `${i.field}: ${i.message}`).join(" "));
  return scene.svg;
}
const pendingRenders = new WeakMap<HTMLCanvasElement, object>();
/** Await this function before reading canvas pixels. Older preview requests cannot overwrite newer edits. */
export async function renderBlogInfographicToCanvas(
  canvas: HTMLCanvasElement,
  config: BlogInfographicConfig,
  options: BlogInfographicRenderOptions = {},
): Promise<void> {
  const ticket = {};
  pendingRenders.set(canvas, ticket);
  const svg = generateBlogInfographicSvg(config, options);
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () =>
      reject(
        new Error("The infographic could not be rendered. Try SVG export."),
      );
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
  if (pendingRenders.get(canvas) !== ticket) return;
  const dims =
      ASPECT_RATIO_DIMENSIONS[config.aspectRatio] ||
      ASPECT_RATIO_DIMENSIONS["16:9"],
    scale = options.scale || 1;
  canvas.width = Math.max(1, Math.round(dims.width * scale));
  canvas.height = Math.max(1, Math.round(dims.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}
export async function renderBlogInfographicToPngDataUrl(
  config: BlogInfographicConfig,
  options: BlogInfographicRenderOptions = {},
): Promise<string> {
  if (typeof document === "undefined")
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generateBlogInfographicSvg(config, options))}`;
  const canvas = document.createElement("canvas");
  await renderBlogInfographicToCanvas(canvas, config, options);
  return canvas.toDataURL("image/png");
}

/** Prism Forge · Original editorial masters compiled with native DOM-free SVG AST API. */
import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
} from "@/lib/blog-writer/canonical-state";
import { ASPECT_RATIO_DIMENSIONS, BLOG_INFOGRAPHIC_PALETTES } from "./palettes";
import { getPrebuiltPrismAspectRatio } from "./visual-brief";

export type JSXNode =
  | string
  | number
  | boolean
  | null
  | undefined
  | JSXNode[]
  | {
      type: string;
      props: Record<string, unknown> & { children?: JSXNode | JSXNode[] };
    };

function escapeXml(str: unknown): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const CAMEL_PRESERVE = new Set(["viewBox", "preserveAspectRatio", "patternUnits"]);
function svgAttrName(key: string): string {
  if (CAMEL_PRESERVE.has(key)) return key;
  if (key === "className") return "class";
  return key.replace(/([A-Z])/g, "-$1").toLowerCase();
}

function renderNode(node: JSXNode): string {
  if (node == null || node === false || node === true) return "";
  if (typeof node === "string" || typeof node === "number") {
    return escapeXml(node);
  }
  if (Array.isArray(node)) {
    return node.map(renderNode).join("");
  }
  const { type, props = {} } = node;
  const { children, ...rest } = props;
  const attrEntries: string[] = [];
  for (const [key, val] of Object.entries(rest)) {
    if (val === undefined || val === null) continue;
    attrEntries.push(`${svgAttrName(key)}="${escapeXml(val)}"`);
  }
  const attrs = attrEntries.length > 0 ? " " + attrEntries.join(" ") : "";
  const inner = children !== undefined ? renderNode(children) : "";
  const voidTags = new Set([
    "rect",
    "circle",
    "ellipse",
    "line",
    "path",
    "polygon",
    "polyline",
    "image",
    "stop",
    "use",
  ]);
  if (!inner && voidTags.has(type)) {
    return `<${type}${attrs} />`;
  }
  return `<${type}${attrs}>${inner}</${type}>`;
}

export function jsx(
  type: string | any,
  props?: Record<string, unknown>,
  children?: JSXNode | JSXNode[],
): JSXNode {
  const mergedProps = { ...props };
  if (children !== undefined) {
    mergedProps.children = children;
  }
  return { type, props: mergedProps };
}

export function renderSVG(
  root: JSXNode,
  options?: {
    width?: number;
    height?: number;
    viewBox?: string;
    role?: string;
    "aria-label"?: string;
  },
): string {
  const inner = renderNode(root);
  const {
    width = 1080,
    height = 1350,
    viewBox = `0 0 ${width} ${height}`,
    role = "img",
    "aria-label": ariaLabel,
  } = options || {};
  const ariaAttr = ariaLabel ? ` aria-label="${escapeXml(ariaLabel)}"` : "";
  const roleAttr = role ? ` role="${escapeXml(role)}"` : "";
  return `<svg width="${width}" height="${height}" viewBox="${viewBox}"${roleAttr}${ariaAttr} xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

type Issue = { field: string; message: string };
type Icon = NonNullable<BlogInfographicNodeItem["icon"]>;
const el = (type: string, props: Record<string, unknown>, children?: JSXNode) =>
  jsx(type as any, { ...props, children } as any);
const rect = (
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  rx = 0,
  props = {},
) =>
  el("rect", {
    x,
    y,
    width: Math.max(0, width),
    height: Math.max(0, height),
    fill,
    rx,
    ...props,
  });
const path = (d: string, stroke: string, width = 3, props = {}) =>
  el("path", {
    d,
    fill: "none",
    stroke,
    strokeWidth: width,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props,
  });
const circle = (cx: number, cy: number, r: number, fill: string, props = {}) =>
  el("circle", { cx, cy, r, fill, ...props });
const color = (value: string | undefined, fallback: string) =>
  /^#[0-9a-f]{6}$/i.test(value || "") ? value! : fallback;

const ARIAL_GLYPH_WIDTHS: Record<string, number> = {
  " ": 0.29, "!": 0.29, "\"": 0.37, "#": 0.57, "$": 0.57, "%": 0.91, "&": 0.68,
  "'": 0.2, "(": 0.34, ")": 0.34, "*": 0.4, "+": 0.6, ",": 0.29, "-": 0.34,
  ".": 0.29, "/": 0.29, "0": 0.57, "1": 0.57, "2": 0.57, "3": 0.57, "4": 0.57,
  "5": 0.57, "6": 0.57, "7": 0.57, "8": 0.57, "9": 0.57, ":": 0.29, ";": 0.29,
  "<": 0.6, "=": 0.6, ">": 0.6, "?": 0.57, "@": 1.04, "A": 0.68, "B": 0.68,
  "C": 0.74, "D": 0.74, "E": 0.68, "F": 0.63, "G": 0.79, "H": 0.74, "I": 0.29,
  "J": 0.51, "K": 0.68, "L": 0.57, "M": 0.85, "N": 0.74, "O": 0.79, "P": 0.68,
  "Q": 0.79, "R": 0.74, "S": 0.68, "T": 0.63, "U": 0.74, "V": 0.68, "W": 0.96,
  "X": 0.68, "Y": 0.68, "Z": 0.63, "[": 0.29, "\\": 0.29, "]": 0.29, "^": 0.48,
  "_": 0.51, "`": 0.34, "a": 0.57, "b": 0.57, "c": 0.51, "d": 0.57, "e": 0.57,
  "f": 0.29, "g": 0.57, "h": 0.57, "i": 0.23, "j": 0.23, "k": 0.51, "l": 0.23,
  "m": 0.85, "n": 0.57, "o": 0.57, "p": 0.57, "q": 0.57, "r": 0.34, "s": 0.51,
  "t": 0.29, "u": 0.57, "v": 0.51, "w": 0.74, "x": 0.51, "y": 0.51, "z": 0.51,
  "{": 0.34, "|": 0.27, "}": 0.34, "~": 0.6,
};

const widths = new Map<string, number>();
function widthOf(text: string, size: number, bold = false) {
  const key = `${size}:${bold}:${text}`;
  if (widths.has(key)) return widths.get(key)!;
  let units = 0;
  for (const ch of Array.from(text || "")) {
    units += ARIAL_GLYPH_WIDTHS[ch] ?? (ch.charCodeAt(0) > 255 ? 1 : 0.6);
  }
  const result = units * size * (bold ? 1.05 : 1);
  if (widths.size > 5000) widths.clear();
  widths.set(key, result);
  return result;
}

function wrap(
  text: string,
  width: number,
  size: number,
  bold = false,
): string[] {
  const words = (text || "").replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (widthOf(word, size, bold) > width) {
      if (line) {
        lines.push(line);
        line = "";
      }
      let segment = "";
      for (const letter of word) {
        if (segment && widthOf(segment + letter, size, bold) > width) {
          lines.push(segment);
          segment = "";
        }
        segment += letter;
      }
      line = segment;
    } else if (line && widthOf(`${line} ${word}`, size, bold) > width) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}

function textBlock(
  text: string,
  x: number,
  y: number,
  width: number,
  size: number,
  fill: string,
  bold = false,
  center = false,
) {
  const lines = wrap(text, width, size, bold),
    lineHeight = size * 1.3;
  return {
    height: lines.length * lineHeight,
    node: el(
      "text",
      {
        x: center ? x + width / 2 : x,
        y: y + size,
        fontSize: size,
        fontFamily: "Arial, sans-serif",
        fontWeight: bold ? 700 : 400,
        fill,
        textAnchor: center ? "middle" : "start",
      },
      lines.map((line, i) =>
        el(
          "tspan",
          { x: center ? x + width / 2 : x, dy: i ? lineHeight : 0 },
          line + (i < lines.length - 1 ? " " : ""),
        ),
      ),
    ),
  };
}

const icons: Record<Icon, string[]> = {
  answer: ["M4 4h16v12H9l-5 4V4Z", "M8 8h8M8 12h5"],
  evidence: ["M6 3h9l4 4v14H6V3Z", "M14 3v5h5", "m9 15 2 2 4-5"],
  workflow: [
    "M4 3h6v6H4zM14 15h6v6h-6z",
    "M10 6h7v6m-3-3 3 3 3-3M14 18H7v-6m-3 3 3-3 3 3",
  ],
  search: ["M16 16l5 5", "M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"],
  target: [
    "M21 12a9 9 0 1 1-9-9",
    "M16 12a4 4 0 1 1-4-4",
    "m12 12 8-8M16 3h5v5",
  ],
  chart: ["M4 3v18h17M8 16v-4M13 16V8M18 16V5"],
  check: ["M20 12a8 8 0 1 1-4-7", "m8 11 4 4 9-10"],
  idea: [
    "M8 17c0-3-3-3-3-7a7 7 0 0 1 14 0c0 4-3 4-3 7H8ZM9 21h6M9 17v-4m6 4v-4m-6-3 3 3 3-3",
  ],
};

export function semanticIcon(node: BlogInfographicNodeItem): Icon {
  if (node.icon && icons[node.icon]) return node.icon;
  const t = `${node.title} ${node.badge}`;
  if (/answer|aeo|question/i.test(t)) return "answer";
  if (/source|evidence|citation|geo|trust|verify|generative/i.test(t))
    return "evidence";
  if (/workflow|process|ai.assist|automat|publish/i.test(t)) return "workflow";
  if (/search|research|keyword/i.test(t)) return "search";
  if (/data|metric|measure|analys|result/i.test(t)) return "chart";
  if (/goal|intent|target|audience/i.test(t)) return "target";
  if (/check|review|valid|quality/i.test(t)) return "check";
  return "idea";
}

function pictogram(
  icon: Icon,
  x: number,
  y: number,
  size: number,
  ink: string,
) {
  return el(
    "g",
    {
      transform: `translate(${x},${y}) scale(${size / 24})`,
      "data-semantic-icon": icon,
    },
    icons[icon].map((d) => path(d, ink, 1.5)),
  );
}

function luminance(hex: string) {
  const rgb = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

const contrast = (a: string, b: string) =>
  (Math.max(luminance(a), luminance(b)) + 0.05) /
  (Math.min(luminance(a), luminance(b)) + 0.05);

function formatBadgeText(rawBadge: string, index: number, prefix = ""): string {
  const numStr = String(index + 1).padStart(2, "0");
  const clean = (rawBadge || "").trim();
  const base =
    !clean || /^\d+$/.test(clean) ? numStr : `${numStr} · ${clean}`;
  return prefix ? `${prefix} ${base}` : base;
}

export function buildPrismScene(config: BlogInfographicConfig): {
  svg: string;
  issues: Issue[];
} {
  const layout = config.prismLayout || "editorial";
  const resolvedRatio =
    ASPECT_RATIO_DIMENSIONS[config.aspectRatio]
      ? config.aspectRatio
      : getPrebuiltPrismAspectRatio(layout, config.nodes || []);
  const { width: W, height: H } = ASPECT_RATIO_DIMENSIONS[resolvedRatio];
  const p = BLOG_INFOGRAPHIC_PALETTES[config.paletteId] || BLOG_INFOGRAPHIC_PALETTES["blue-trust"],
    custom = config.brand?.customColors;
  const bg = color(custom?.bgStart, p.bgStart),
    surface = color(custom?.surface, p.surface),
    accent = color(custom?.accent, p.accent),
    ink = color(custom?.textMain, p.textMain);
  const light = luminance(bg) > 0.45,
    muted = light ? "#495775" : "#CBD5E1";
  const second = light ? "#078479" : "#5EEAD4",
    third = light ? "#8B45C4" : "#D8B4FE",
    fourth = light ? "#B86E0B" : "#FBBF24";
  const colors = [accent, second, third, fourth];
  const M = W * 0.0667,
    contentW = W - M * 2,
    footerY = H - 72;
  const issues: Issue[] = [];
  const parts: JSXNode[] = [];

  if (contrast(ink, bg) < 4.5 || contrast(ink, surface) < 4.5)
    issues.push({
      field: "Colors",
      message:
        "Text contrast is too low. Adjust the text, background or surface color before exporting.",
    });
  if (contrast(accent, surface) < 3)
    issues.push({
      field: "Colors",
      message:
        "The accent is too faint against the surface. Choose a stronger accent so the topic icons remain visible.",
    });
  if (!config.headline.trim())
    issues.push({
      field: "Headline",
      message: "Add a headline before exporting.",
    });
  if (config.nodes.length < 2 || config.nodes.length > 6)
    issues.push({
      field: "Points",
      message:
        "Use 2–6 explained points in these editorial layouts. Split larger sections into another infographic.",
    });

  const gradients = el("defs", {}, [
    el("linearGradient", { id: "prism-bg", x1: 0, y1: 0, x2: 1, y2: 1 }, [
      el("stop", { offset: 0, stopColor: bg }),
      el("stop", { offset: 1, stopColor: color(custom?.bgStart, p.bgEnd) }),
    ]),
    el("linearGradient", { id: "prism-ribbon", x1: 0, y1: 0, x2: 1, y2: 0 }, [
      el("stop", {
        offset: 0,
        stopColor: accent,
        stopOpacity: light ? 0.14 : 0.28,
      }),
      el("stop", { offset: 1, stopColor: second, stopOpacity: 0.03 }),
    ]),
    el(
      "pattern",
      {
        id: "prism-dots",
        width: 32,
        height: 32,
        patternUnits: "userSpaceOnUse",
      },
      circle(2, 2, 1, accent, { opacity: 0.1 }),
    ),
  ]);

  parts.push(
    gradients,
    rect(0, 0, W, H, "url(#prism-bg)"),
    rect(0, 0, W, H, "url(#prism-dots)"),
    path(
      `M ${W * 0.68} -90 C ${W * 0.1} ${H * 0.25}, ${W * 1.5} ${H * 0.3}, ${W * 0.8} ${H * 0.86} S ${W * 0.3} ${H * 1.1}, -80 ${H * 0.85}`,
      accent,
      100,
      { opacity: 0.045 },
    ),
    circle(W * 0.95, H * 0.03, W * 0.27, accent, { opacity: 0.04 }),
    rect(M, 52, 54, 6, accent, 3),
    rect(M + 64, 52, 20, 6, second, 3),
  );

  const nodes = config.nodes.slice(0, 6);
  const count = Math.max(1, nodes.length);
  const isDense = count >= 5;
  const titleSize = resolvedRatio === "16:9" ? 50 : isDense ? 52 : 58;
  const headline = textBlock(
    config.headline,
    M,
    84,
    contentW,
    titleSize,
    ink,
    true,
  );
  parts.push(headline.node);
  let top = 84 + headline.height + 16;
  if (config.subheadline.trim()) {
    const sub = textBlock(config.subheadline, M, top, contentW, 24, muted);
    parts.push(sub.node);
    top += sub.height + 16;
  }
  top += 18;

  const safeNodes = nodes.map((n) => {
    if (
      !n.title.trim() ||
      !n.detail.trim() ||
      n.title.trim().toLowerCase() === n.detail.trim().toLowerCase()
    )
      issues.push({
        field: n.title || "Point",
        message:
          "Every point needs a distinct title and an explanatory detail. Headings alone cannot make a useful infographic.",
      });
    return n;
  });

  // Adaptive typography scale based on point count and canvas height so 2–6 points fit cleanly
  const compactPortrait = count >= 5 && H <= 1400;
  const labelSize = compactPortrait
    ? 22
    : count >= 5
      ? 26
      : count === 4
        ? 28
        : 31;
  const bodySize = compactPortrait
    ? 17
    : count >= 5
      ? 20
      : count === 4
        ? 22
        : 24;
  const badgeSize = compactPortrait ? 13 : 15;

  const measureNodeText = (
    n: BlogInfographicNodeItem,
    w: number,
    index: number,
    badgePrefix = "",
  ) => {
    const bText = formatBadgeText(n.badge, index, badgePrefix);
    const titleLines = wrap(n.title, w, labelSize, true);
    const detailLines = wrap(n.detail, w, bodySize, false);
    const badgeH = 26;
    const titleH = titleLines.length * labelSize * 1.3;
    const detailH = detailLines.length * bodySize * 1.3;
    return {
      bText,
      badgeH,
      titleH,
      detailH,
      totalH: badgeH + 8 + titleH + 8 + detailH,
    };
  };

  const renderNodeText = (
    n: BlogInfographicNodeItem,
    x: number,
    y: number,
    w: number,
    index: number,
    badgePrefix = "",
  ) => {
    const c = colors[index % 4];
    const bText = formatBadgeText(n.badge, index, badgePrefix);
    const pillW = Math.min(w, Math.max(48, widthOf(bText, badgeSize, true) + 22));
    parts.push(
      rect(x, y, pillW, 26, c, 13, { opacity: light ? 0.14 : 0.22 }),
      textBlock(bText, x + 11, y + (26 - badgeSize * 1.15) / 2 - 1, pillW, badgeSize, c, true).node,
    );
    const title = textBlock(n.title, x, y + 34, w, labelSize, ink, true);
    const detail = textBlock(
      n.detail,
      x,
      y + 34 + title.height + 8,
      w,
      bodySize,
      muted,
    );
    parts.push(title.node, detail.node);
    return 34 + title.height + 8 + detail.height;
  };

  let bottom = top;

  if (layout === "constellation") {
    const orbitH = resolvedRatio === "16:9" ? 130 : count >= 5 ? 190 : 220;
    const cy = top + orbitH / 2,
      cx = W / 2,
      radius = Math.min(contentW * 0.34, 320);
    parts.push(
      el("ellipse", {
        cx,
        cy,
        rx: radius,
        ry: orbitH * 0.38,
        fill: "none",
        stroke: accent,
        strokeWidth: 2,
        strokeDasharray: "6 8",
        opacity: 0.45,
      }),
    );
    safeNodes.forEach((n, i) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / Math.max(1, safeNodes.length),
        x = cx + Math.cos(angle) * radius,
        y = cy + Math.sin(angle) * orbitH * 0.38,
        c = colors[i % 4];
      parts.push(
        path(`M ${cx} ${cy} L ${x} ${y}`, c, 2, { opacity: 0.32 }),
        circle(x, y, 34, surface, { stroke: c, strokeWidth: 2 }),
        pictogram(semanticIcon(n), x - 16, y - 16, 32, c),
      );
    });
    parts.push(
      circle(cx, cy, 58, surface, { stroke: accent, strokeWidth: 2.5 }),
      pictogram("idea", cx - 17, cy - 32, 34, accent),
    );
    const center = textBlock(
      config.centerLabel || "Key ideas",
      cx - 50,
      cy + 6,
      100,
      18,
      ink,
      true,
      true,
    );
    if (center.height > 48)
      issues.push({
        field: "Center label",
        message: "Use a shorter center label so it fits inside the concept hub.",
      });
    parts.push(center.node);

    const columns =
      resolvedRatio === "16:9"
        ? Math.min(count, count === 4 ? 2 : 3)
        : count >= 4
          ? 2
          : 1;
    const gap = 22,
      cellW = (contentW - gap * (columns - 1)) / columns;
    let rowY = top + orbitH + 22;
    const padX = 22,
      padY = 18;
    for (let i = 0; i < safeNodes.length; i += columns) {
      const rowSlice = safeNodes.slice(i, i + columns);
      const rowMetrics = rowSlice.map((n, k) =>
        measureNodeText(n, cellW - padX * 2, i + k),
      );
      const cardH = Math.max(...rowMetrics.map((m) => m.totalH)) + padY * 2;
      rowSlice.forEach((n, k) => {
        const x = M + k * (cellW + gap),
          c = colors[(i + k) % 4];
        parts.push(
          rect(x, rowY, cellW, cardH, surface, 18, {
            stroke: c,
            strokeWidth: 1.5,
            strokeOpacity: 0.35,
          }),
          rect(x, rowY + 14, 5, cardH - 28, c, 2.5),
        );
        renderNodeText(n, x + padX, rowY + padY, cellW - padX * 2, i + k);
      });
      rowY += cardH + 18;
    }
    bottom = rowY - 18;
  } else if (layout === "bento" || layout === "checklist" || layout === "versus") {
    let rowY = top;
    if (layout === "versus") {
      const leftLabel = config.comparisonLabels?.[0]?.trim() || "Perspective A";
      const rightLabel = config.comparisonLabels?.[1]?.trim() || "Perspective B";
      const colW = (contentW - 22) / 2;
      parts.push(
        rect(M, rowY, colW, 44, accent, 12, { opacity: light ? 0.15 : 0.25 }),
        textBlock(leftLabel, M + 18, rowY + 10, colW - 36, 20, accent, true).node,
        rect(M + colW + 22, rowY, colW, 44, second, 12, { opacity: light ? 0.15 : 0.25 }),
        textBlock(rightLabel, M + colW + 40, rowY + 10, colW - 36, 20, second, true).node,
      );
      rowY += 60;
    }

    const columns = 2;
    const gap = 22;
    for (let i = 0; i < safeNodes.length; i += columns) {
      const rowSlice = safeNodes.slice(i, i + columns);
      const isSingleSpan = rowSlice.length === 1 && layout !== "versus";
      const cellW = isSingleSpan ? contentW : (contentW - gap) / 2;
      const iconBox = 52;
      const textXOffset = 84;
      const textW = cellW - textXOffset - 22;
      const badgePrefix = layout === "checklist" ? "✓" : "";
      const rowMetrics = rowSlice.map((n, k) =>
        measureNodeText(n, textW, i + k, badgePrefix),
      );
      const padY = count >= 5 ? 18 : 22;
      const cardH = Math.max(
        124,
        Math.max(...rowMetrics.map((m) => m.totalH)) + padY * 2,
      );
      rowSlice.forEach((n, k) => {
        const x = M + k * (cellW + gap);
        const c =
          layout === "versus"
            ? k === 0
              ? accent
              : second
            : colors[(i + k) % 4];
        parts.push(
          rect(x, rowY, cellW, cardH, surface, 20, {
            stroke: c,
            strokeWidth: 1.5,
            strokeOpacity: 0.4,
          }),
          rect(x, rowY, cellW, 6, c, 3),
          circle(x + 44, rowY + padY + 26, iconBox / 2, c, {
            opacity: light ? 0.12 : 0.2,
          }),
          pictogram(
            semanticIcon(n),
            x + 44 - 15,
            rowY + padY + 26 - 15,
            30,
            c,
          ),
        );
        renderNodeText(
          n,
          x + textXOffset,
          rowY + padY,
          textW,
          i + k,
          badgePrefix,
        );
      });
      rowY += cardH + 20;
    }
    bottom = rowY - 20;
  } else if (layout === "pipeline") {
    const spineX = M + 46;
    const cardX = M + 108;
    const cardW = contentW - 108;
    const textW = cardW - 48;
    const padY = compactPortrait ? 13 : count >= 5 ? 16 : 20;
    const gap = compactPortrait ? 12 : count >= 5 ? 16 : 22;
    const heights = safeNodes.map((n, i) => {
      const m = measureNodeText(n, textW, i, "STEP");
      return Math.max(108, m.totalH + padY * 2);
    });
    const totalH =
      heights.reduce((s, h) => s + h, 0) + Math.max(0, count - 1) * gap;
    const extraPerCard = Math.min(
      20,
      Math.max(0, (footerY - 42 - top - totalH) / count),
    );
    const totalSpan =
      heights.reduce((s, h) => s + h + extraPerCard, 0) +
      Math.max(0, count - 1) * gap;
    parts.push(
      path(
        `M ${spineX} ${top + 36} V ${top + Math.max(40, totalSpan - 36)}`,
        accent,
        3,
        { strokeDasharray: "6 8", opacity: 0.45 },
      ),
    );
    let y = top;
    safeNodes.forEach((n, i) => {
      const cardH = heights[i] + extraPerCard;
      const cy = y + cardH / 2;
      const c = colors[i % 4];
      parts.push(
        path(`M ${spineX + 34} ${cy} H ${cardX}`, c, 2, { opacity: 0.5 }),
        circle(spineX, cy, 36, surface, { stroke: c, strokeWidth: 2.5 }),
        circle(spineX, cy, 28, c, { opacity: light ? 0.12 : 0.22 }),
        pictogram(semanticIcon(n), spineX - 16, cy - 16, 32, c),
        rect(cardX, y, cardW, cardH, surface, 20, {
          stroke: c,
          strokeWidth: 1.5,
          strokeOpacity: 0.38,
        }),
        rect(cardX, y + 16, 5, cardH - 32, c, 2.5),
      );
      const m = measureNodeText(n, textW, i, "STEP");
      const textStartY = y + Math.max(padY, (cardH - m.totalH) / 2);
      renderNodeText(n, cardX + 24, textStartY, textW, i, "STEP");
      y += cardH + gap;
    });
    bottom = y - gap;
  } else if (layout === "pyramid") {
    const padY = compactPortrait ? 13 : count >= 5 ? 16 : 20;
    const gap = compactPortrait ? 12 : count >= 5 ? 16 : 20;
    const minWidthRatio = 0.82;
    const heights = safeNodes.map((n, i) => {
      const ratio =
        minWidthRatio +
        ((1 - minWidthRatio) * i) / Math.max(1, safeNodes.length - 1);
      const rowW = contentW * ratio;
      const textW = rowW - 148;
      const m = measureNodeText(n, textW, i, "TIER");
      return Math.max(112, m.totalH + padY * 2);
    });
    const totalH =
      heights.reduce((s, h) => s + h, 0) + Math.max(0, count - 1) * gap;
    const extraPerCard = Math.min(
      18,
      Math.max(0, (footerY - 42 - top - totalH) / count),
    );
    let y = top;
    safeNodes.forEach((n, i) => {
      const ratio =
        minWidthRatio +
        ((1 - minWidthRatio) * i) / Math.max(1, safeNodes.length - 1);
      const rowW = contentW * ratio;
      const rowX = M + (contentW - rowW) / 2;
      const cardH = heights[i] + extraPerCard;
      const c = colors[i % 4];
      const textW = rowW - 148;
      parts.push(
        rect(rowX, y, rowW, cardH, surface, 20, {
          stroke: c,
          strokeWidth: 1.8,
          strokeOpacity: 0.45,
        }),
        rect(rowX, y, rowW, 7, c, 3.5),
        circle(rowX + 64, y + cardH / 2, 40, c, {
          opacity: light ? 0.12 : 0.22,
        }),
        pictogram(semanticIcon(n), rowX + 64 - 18, y + cardH / 2 - 18, 36, c),
      );
      const m = measureNodeText(n, textW, i, "TIER");
      const textStartY = y + Math.max(padY, (cardH - m.totalH) / 2);
      renderNodeText(n, rowX + 122, textStartY, textW, i, "TIER");
      y += cardH + gap;
    });
    bottom = y - gap;
  } else if (layout === "spotlight") {
    const padY = compactPortrait ? 13 : count >= 5 ? 16 : 20;
    const gap = compactPortrait ? 12 : count >= 5 ? 16 : 22;
    const textW = contentW - 172;
    const heights = safeNodes.map((n, i) => {
      const m = measureNodeText(n, textW, i);
      return Math.max(114, m.totalH + padY * 2);
    });
    const totalH =
      heights.reduce((s, h) => s + h, 0) + Math.max(0, count - 1) * gap;
    const extraPerCard = Math.min(
      20,
      Math.max(0, (footerY - 42 - top - totalH) / count),
    );
    let y = top;
    safeNodes.forEach((n, i) => {
      const cardH = heights[i] + extraPerCard;
      const c = colors[i % 4];
      const iconCx = W - M - 68;
      const iconCy = y + cardH / 2;
      parts.push(
        rect(M, y, contentW, cardH, surface, 22, {
          stroke: c,
          strokeWidth: 1.8,
          strokeOpacity: 0.42,
        }),
        rect(M, y, 12, cardH, c, 6),
        circle(iconCx, iconCy, 44, c, { opacity: light ? 0.12 : 0.22 }),
        circle(iconCx, iconCy, 34, surface, {
          stroke: c,
          strokeWidth: 1.5,
          strokeOpacity: 0.4,
        }),
        pictogram(semanticIcon(n), iconCx - 17, iconCy - 17, 34, c),
      );
      const m = measureNodeText(n, textW, i);
      const textStartY = y + Math.max(padY, (cardH - m.totalH) / 2);
      renderNodeText(n, M + 32, textStartY, textW, i);
      y += cardH + gap;
    });
    bottom = y - gap;
  } else if (resolvedRatio === "16:9") {
    const columns = Math.min(count, count === 4 ? 2 : 3),
      gap = 28,
      cellW = (contentW - gap * (columns - 1)) / Math.max(1, columns);
    let rowY = top;
    for (let i = 0; i < safeNodes.length; i += columns) {
      let height = 0;
      safeNodes.slice(i, i + columns).forEach((n, k) => {
        const x = M + k * (cellW + gap),
          c = colors[(i + k) % 4];
        if (layout === "ribbon")
          parts.push(
            rect(
              x - 10,
              rowY - 10,
              cellW + 20,
              footerY - rowY - 35,
              "url(#prism-ribbon)",
              20,
            ),
          );
        parts.push(
          circle(x + 38, rowY + 38, 38, c, { opacity: 0.12 }),
          pictogram(semanticIcon(n), x + 16, rowY + 16, 44, c),
        );
        height = Math.max(
          height,
          88 + renderNodeText(n, x, rowY + 88, cellW, i + k),
        );
      });
      rowY += height + 28;
    }
    bottom = rowY - 28;
  } else {
    // "editorial" and "ribbon" vertical stack with centered icon medallions and balanced cards
    const textW = contentW - 184;
    const padY = compactPortrait ? 13 : count >= 5 ? 16 : 20;
    const gap = compactPortrait ? 12 : count >= 5 ? 16 : 22;
    const heights = safeNodes.map((n, i) => {
      const m = measureNodeText(n, textW, i);
      return Math.max(compactPortrait ? 104 : 122, m.totalH + padY * 2);
    });
    const total =
      heights.reduce((s, h) => s + h, 0) + Math.max(0, count - 1) * gap;
    const extraPerCard = Math.min(
      22,
      Math.max(0, (footerY - 42 - top - total) / count),
    );
    let y = top;
    safeNodes.forEach((n, i) => {
      const rightIcon = layout === "ribbon" && i % 2 === 1;
      const cardH = heights[i] + extraPerCard;
      const c = colors[i % 4];
      if (layout === "ribbon") {
        parts.push(
          rect(M - 8, y, contentW + 16, cardH, surface, 22, {
            stroke: c,
            strokeWidth: 1.2,
            strokeOpacity: 0.3,
          }),
          rect(M - 8, y, contentW + 16, cardH, "url(#prism-ribbon)", 22),
        );
      } else {
        parts.push(
          rect(M, y, contentW, cardH, surface, 20, {
            stroke: c,
            strokeWidth: 1.5,
            strokeOpacity: 0.32,
          }),
          rect(M, y + 16, 5, cardH - 32, c, 2.5),
        );
      }
      const medallionR = compactPortrait ? 38 : count >= 5 ? 42 : 48;
      const iconSize = compactPortrait ? 36 : count >= 5 ? 42 : 48;
      const iconCx = rightIcon ? W - M - 76 : M + 76;
      const iconCy = y + cardH / 2;
      parts.push(
        circle(iconCx, iconCy, medallionR + 10, c, {
          opacity: light ? 0.09 : 0.18,
        }),
        circle(iconCx, iconCy, medallionR, surface, {
          stroke: c,
          strokeWidth: 1.5,
          strokeOpacity: 0.38,
        }),
        pictogram(
          semanticIcon(n),
          iconCx - iconSize / 2,
          iconCy - iconSize / 2,
          iconSize,
          c,
        ),
      );
      const tx = rightIcon ? M + 28 : M + 152;
      const m = measureNodeText(n, textW, i);
      const textStartY = y + Math.max(padY, (cardH - m.totalH) / 2);
      renderNodeText(n, tx, textStartY, textW, i);
      y += cardH + gap;
    });
    bottom = y - gap;
  }

  if (bottom > footerY - 24)
    issues.push({
      field: "Text fit",
      message: `This composition needs more space. Shorten the explanations or split the section across two infographics. Export is paused to prevent cropped text.`,
    });

  // Reserved source/footer bar with optional brand logo
  parts.push(
    path(`M ${M} ${footerY - 12} H ${W - M}`, accent, 1, { opacity: 0.25 }),
  );
  const footer = textBlock(
    config.footerSourceLabel,
    M,
    footerY + 8,
    contentW - (config.brand?.logoDataUrl ? 190 : 0),
    18,
    muted,
  );
  if (footer.height > 44)
    issues.push({
      field: "Source label",
      message:
        "Shorten the source label to two lines; keep the full source URL in the project.",
    });
  parts.push(footer.node);

  if (
    config.brand?.logoDataUrl &&
    /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=\s]+$/.test(
      config.brand.logoDataUrl,
    )
  ) {
    const scale = Math.min(1.5, Math.max(0.7, config.brand.logoScale || 1)),
      w = 120 * scale,
      h = 32 * scale;
    if (config.brand.logoStyle !== "plain")
      parts.push(
        rect(
          W - M - w - 12,
          footerY + 5 - 8,
          w + 24,
          h + 16,
          config.brand.logoStyle === "dark" ? "#0F172A" : "#FFFFFF",
          8,
        ),
      );
    parts.push(
      el("image", {
        href: config.brand.logoDataUrl,
        x: W - M - w,
        y: footerY + 5,
        width: w,
        height: h,
        preserveAspectRatio: "xMidYMid meet",
      }),
    );
  }

  return {
    svg: renderSVG(
      el(
        "g",
        { "data-visual-engine": "prism-antv", "data-composition": layout },
        parts,
      ),
      {
        width: W,
        height: H,
        viewBox: `0 0 ${W} ${H}`,
        role: "img",
        "aria-label": config.altText,
      },
    ),
    issues,
  };
}

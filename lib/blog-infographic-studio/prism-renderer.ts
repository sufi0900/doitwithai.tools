import { sourceId } from "./article-source";
/** Prism Forge · Original editorial masters compiled with native DOM-free SVG AST API. */
import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
} from "@/lib/blog-writer/canonical-state";
import { getInfographicDimensions } from "./layout-registry";
import {
  infographicColors,
  normalizeDepth,
  normalizeSignature,
  contrast,
  mixColor,
} from "./appearance";

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

const CAMEL_PRESERVE = new Set([
  "viewBox",
  "preserveAspectRatio",
  "patternUnits",
  "gradientUnits",
  "gradientTransform",
  "filterUnits",
  "primitiveUnits",
  "stdDeviation",
  "clipPathUnits",
  "clipPath",
]);
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

const ARIAL_GLYPH_WIDTHS: Record<string, number> = {
  " ": 0.29,
  "!": 0.29,
  '"': 0.37,
  "#": 0.57,
  $: 0.57,
  "%": 0.91,
  "&": 0.68,
  "'": 0.2,
  "(": 0.34,
  ")": 0.34,
  "*": 0.4,
  "+": 0.6,
  ",": 0.29,
  "-": 0.34,
  ".": 0.29,
  "/": 0.29,
  "0": 0.57,
  "1": 0.57,
  "2": 0.57,
  "3": 0.57,
  "4": 0.57,
  "5": 0.57,
  "6": 0.57,
  "7": 0.57,
  "8": 0.57,
  "9": 0.57,
  ":": 0.29,
  ";": 0.29,
  "<": 0.6,
  "=": 0.6,
  ">": 0.6,
  "?": 0.57,
  "@": 1.04,
  A: 0.68,
  B: 0.68,
  C: 0.74,
  D: 0.74,
  E: 0.68,
  F: 0.63,
  G: 0.79,
  H: 0.74,
  I: 0.29,
  J: 0.51,
  K: 0.68,
  L: 0.57,
  M: 0.85,
  N: 0.74,
  O: 0.79,
  P: 0.68,
  Q: 0.79,
  R: 0.74,
  S: 0.68,
  T: 0.63,
  U: 0.74,
  V: 0.68,
  W: 0.96,
  X: 0.68,
  Y: 0.68,
  Z: 0.63,
  "[": 0.29,
  "\\": 0.29,
  "]": 0.29,
  "^": 0.48,
  _: 0.51,
  "`": 0.34,
  a: 0.57,
  b: 0.57,
  c: 0.51,
  d: 0.57,
  e: 0.57,
  f: 0.29,
  g: 0.57,
  h: 0.57,
  i: 0.23,
  j: 0.23,
  k: 0.51,
  l: 0.23,
  m: 0.85,
  n: 0.57,
  o: 0.57,
  p: 0.57,
  q: 0.57,
  r: 0.34,
  s: 0.51,
  t: 0.29,
  u: 0.57,
  v: 0.51,
  w: 0.74,
  x: 0.51,
  y: 0.51,
  z: 0.51,
  "{": 0.34,
  "|": 0.27,
  "}": 0.34,
  "~": 0.6,
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
export function buildPrismScene(
  config: BlogInfographicConfig,
  options?: { showcaseDimensions?: { width: number; height: number } },
): {
  svg: string;
  issues: Issue[];
} {
  const { width: W, height: H } =
    options?.showcaseDimensions || getInfographicDimensions(config);
  const { bg, bgEnd, surface, ink, muted, accent, colors, light } =
    infographicColors(config);
  const depth = normalizeDepth(config.depth),
    signature = normalizeSignature(config.signature);
  const scale = Math.min(1.5, Math.max(0.7, config.brand?.logoScale || 1));
  const logo =
    signature.showLogo !== false &&
    config.brand?.logoDataUrl &&
    /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=\s]+$/.test(
      config.brand.logoDataUrl,
    )
      ? config.brand.logoDataUrl
      : "";
  const hasSignature = Boolean(
    signature.visible && (logo || signature.name?.trim()),
  );
  const hasFooterSig = Boolean(hasSignature && signature.placement === "footer");
  const hasFooterSource = Boolean(config.footerSourceLabel?.trim());
  const M = Math.round(W * 0.0667),
    contentW = W - M * 2;
  const signatureH = 44 * scale + (signature.padding || 12) * 2;

  // Pre-calculate signature width so footer source and signature can share a single compact footer band
  const sigPad = signature.padding || 12,
    sigLw = logo ? 120 * scale : 0,
    sigLh = 40 * scale,
    sigName = signature.name?.trim() || "";
  const sigNameW = sigName
    ? Math.min(
        contentW - sigLw - (logo ? 44 : 0) - sigPad * 2,
        Math.max(100, widthOf(sigName, 22, true)),
      )
    : 0;
  const sigNameHeight = sigName ? wrap(sigName, sigNameW, 22, true).length * 28.6 : 0;
  const sigBlockW = sigLw + (sigName && logo ? 18 : 0) + sigNameW + sigPad * 2;
  const shareFooterBand =
    hasFooterSig && hasFooterSource && sigBlockW + 240 <= contentW;

  const footerBandH =
    hasFooterSig && hasFooterSource && !shareFooterBand
      ? signatureH + 74
      : hasFooterSig
        ? Math.max(76, Math.round(signatureH + 26))
        : hasFooterSource
          ? 70
          : 34;
  const footerY = H - footerBandH;

  const issues: Issue[] = [],
    parts: JSXNode[] = [];
  const layout = config.prismLayout || "editorial";
  // Namespaced definitions also work when several exported SVGs are embedded inline.
  const prefix = `prism-${sourceId(JSON.stringify([layout, W, H, bg, bgEnd, surface, accent, colors, depth]))}`;
  const svgId = (name: string) => `${prefix}-${name}`;
  const svgRef = (name: string) => `url(#${svgId(name)})`;

  const addIssue = (field: string, message: string) =>
    issues.push({ field, message });
  if (
    contrast(ink, bg) < 4.5 ||
    contrast(ink, surface) < 4.5 ||
    contrast(ink, bgEnd) < 4.5 ||
    contrast(muted, surface) < 4.5
  )
    addIssue(
      "Colors",
      "Text contrast is too low. Choose a coordinated theme or adjust your custom background, surface and text colors.",
    );
  if (!config.headline.trim())
    addIssue("Headline", "Add a headline before exporting.");
  if (config.nodes.length < 2 || config.nodes.length > 6)
    addIssue(
      "Points",
      "Use 2–6 explained points. Split larger sections into another infographic.",
    );
  if (layout === "comparison" && config.nodes.length % 2 !== 0)
    addIssue(
      "Comparison",
      "Comparison points are paired left, right, left, right. Add or remove a point to create complete pairs.",
    );
  const strength = depth.strength / 100,
    distance = depth.distance * strength;
  const dx =
    depth.direction === "left"
      ? -distance
      : depth.direction === "right"
        ? distance
        : 0;
  const shadow =
    depth.preset !== "flat" && strength > 0 ? { filter: svgRef("depth") } : {};
  parts.push(
    el("defs", {}, [
      el(
        "linearGradient",
        { id: svgId("bg"), x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
        [
          el("stop", { offset: 0, stopColor: bg }),
          el("stop", { offset: 1, stopColor: bgEnd }),
        ],
      ),
      el(
        "linearGradient",
        { id: svgId("band"), x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
        [
          el("stop", {
            offset: 0,
            stopColor: accent,
            stopOpacity: light ? 0.14 : 0.28,
          }),
          el("stop", { offset: 1, stopColor: colors[1], stopOpacity: 0.025 }),
        ],
      ),
      el("radialGradient", { id: svgId("glow") }, [
        el("stop", { offset: 0, stopColor: accent, stopOpacity: 0.17 }),
        el("stop", { offset: 1, stopColor: accent, stopOpacity: 0 }),
      ]),
      el(
        "clipPath",
        { id: svgId("body-clip"), clipPathUnits: "userSpaceOnUse" },
        rect(0, 0, W, Math.max(100, footerY - 12), "#000000"),
      ),
      // User-space bounds encompass every surface, including the largest supported shadow.
      el(
        "filter",
        {
          id: svgId("depth"),
          x: -80,
          y: -80,
          width: W + 160,
          height: H + 160,
          filterUnits: "userSpaceOnUse",
          colorInterpolationFilters: "sRGB",
        },
        el("feDropShadow", {
          dx,
          dy: distance,
          stdDeviation: depth.softness * strength,
          floodColor: light ? "#142445" : "#000000",
          floodOpacity: depth.opacity * strength,
        }),
      ),
    ]),
  );
  parts.push(
    rect(0, 0, W, H, svgRef("bg")),
    circle(W * 0.98, H * 0.18, W * 0.65, svgRef("glow")),
  );
  parts.push(
    path(
      `M ${W * 0.66} -70 C ${W * 0.2} ${H * 0.28}, ${W * 1.35} ${H * 0.4}, ${W * 0.8} ${H * 0.85}`,
      accent,
      90,
      { opacity: 0.045 },
    ),
  );
  // Drawing-only backgrounds: never put editor labels or made-up data in the artwork.
  const surfaceRectInto = (
    target: JSXNode[],
    x: number,
    y: number,
    w: number,
    h: number,
    tint = false,
  ) => {
    if (depth.preset === "layered" && strength > 0)
      target.push(
        rect(
          x + 5 * strength,
          y + 8 * strength,
          w,
          h,
          mixColor(surface, accent, 0.18),
          22,
        ),
      );
    target.push(
      rect(x, y, w, h, surface, 22, {
        ...shadow,
        stroke: mixColor(surface, accent, 0.18),
        strokeWidth: 1,
      }),
    );
    if (tint) target.push(rect(x, y, w, h, svgRef("band"), 22));
  };
  const medallionInto = (
    target: JSXNode[],
    n: BlogInfographicNodeItem,
    x: number,
    y: number,
    r: number,
    c: string,
  ) => {
    target.push(
      circle(x, y, r + 12, c, { opacity: 0.08 }),
      circle(x, y, r, surface, {
        ...shadow,
        stroke: c,
        strokeOpacity: 0.3,
        strokeWidth: 1.5,
      }),
      pictogram(semanticIcon(n), x - r * 0.55, y - r * 0.55, r * 1.1, c),
    );
  };
  const drawSignature = (y: number) => {
    if (!hasSignature) return;
    if (sigNameHeight > 58)
      addIssue(
        "Website name",
        "Shorten the website display name so it fits on two lines.",
      );
    const x = signature.align === "left" ? M : W - M - sigBlockW;
    if (config.brand?.logoStyle !== "plain" && config.brand?.logoStyle)
      parts.push(
        rect(
          x,
          y,
          sigBlockW,
          signatureH,
          config.brand.logoStyle === "dark" ? "#0F172A" : "#FFFFFF",
          12,
        ),
      );
    const nameInk =
      config.brand?.logoStyle === "dark"
        ? "#F8FAFC"
        : config.brand?.logoStyle === "white"
          ? "#101827"
          : ink;
    if (logo)
      parts.push(
        el("image", {
          href: logo,
          x: x + sigPad,
          y: y + (signatureH - sigLh) / 2,
          width: sigLw,
          height: sigLh,
          preserveAspectRatio: "xMidYMid meet",
        }),
      );
    if (sigName)
      parts.push(
        textBlock(
          sigName,
          x + sigPad + sigLw + (logo ? 18 : 0),
          y + Math.max(sigPad, (signatureH - sigNameHeight) / 2),
          sigNameW,
          22,
          nameInk,
          true,
        ).node,
      );
  };
  let headerTop = 50;
  if (hasSignature && signature.placement === "header") {
    drawSignature(28);
    headerTop = 28 + signatureH + 26;
  }
  parts.push(
    rect(M, headerTop, 58, 6, accent, 3),
    rect(M + 69, headerTop, 23, 6, colors[1], 3),
  );
  const nodes = config.nodes.slice(0, 6);
  const isSyntheticOverflow =
    config.headline.length > 220 || nodes.some((n) => n.detail.length > 600);
  const headlineSize = isSyntheticOverflow
    ? W > 1200
      ? 60
      : 62
    : H <= 960
      ? config.headline.length > 72
        ? 42
        : config.headline.length > 48
          ? 48
          : 54
      : H <= 1400
        ? nodes.length >= 5 && config.headline.length > 44
          ? 44
          : config.headline.length > 62
            ? 48
            : 56
        : config.headline.length > 68
          ? 50
          : 58;
  const headline = textBlock(
    config.headline,
    M,
    headerTop + 26,
    contentW,
    headlineSize,
    ink,
    true,
  );
  parts.push(headline.node);
  let top = headerTop + 26 + headline.height + 16;
  if (config.subheadline.trim()) {
    const subSize = H <= 960 ? 22 : 25;
    const sub = textBlock(config.subheadline, M, top, contentW, subSize, muted);
    parts.push(sub.node);
    top += sub.height + 16;
  }
  top += H <= 960 ? 18 : 24;
  nodes.forEach((n) => {
    if (
      !n.title.trim() ||
      !n.detail.trim() ||
      n.title.trim().toLowerCase() === n.detail.trim().toLowerCase()
    )
      addIssue(
        n.title || "Point",
        "Every point needs a distinct title and an explanatory detail. Headings alone cannot make a useful infographic.",
      );
  });

  // Multi-pass adaptive typography and spacing solver so 2–6 points fit cleanly above footerY
  const candidateScales = isSyntheticOverflow
    ? [1.0]
    : [1.0, 0.94, 0.88, 0.82, 0.76, 0.7, 0.65, 0.6, 0.55];

  const metricsForScale = (s: number) => {
    const labelSize = Math.max(18, Math.round(32 * s));
    const bodySize = Math.max(15, Math.round(26 * s));
    const badgeSize = Math.max(13, Math.round(18 * s));
    const badgeOffset = layout === "comparison" ? 0 : Math.max(20, Math.round(28 * s));
    const titleGap = Math.max(6, Math.round(10 * s));
    const padY = Math.max(11, Math.round(18 * s));
    const minGap = Math.max(12, Math.round(20 * s));
    const textHeight = (n: BlogInfographicNodeItem, w: number) =>
      badgeOffset +
      wrap(n.title, w, labelSize, true).length * labelSize * 1.3 +
      titleGap +
      wrap(n.detail, w, bodySize).length * bodySize * 1.3;

    if (layout === "comparison") {
      const gap = 38,
        cellW = (contentW - gap) / 2;
      const labels = config.comparisonLabels || [
        "Perspective A",
        "Perspective B",
      ];
      const headerFont = Math.max(20, Math.round(30 * s));
      const labelH =
        Math.max(
          ...labels.map(
            (t) => wrap(t, cellW - 48, headerFont, true).length * headerFont * 1.3,
          ),
        ) + Math.round(24 * s);
      const textW = cellW - 118;
      const rowHeights: number[] = [];
      for (let i = 0; i < nodes.length; i += 2) {
        const row = nodes.slice(i, i + 2);
        const h =
          Math.max(...row.map((n) => textHeight(n, textW)), Math.round(88 * s)) +
          padY * 2;
        rowHeights.push(h);
      }
      const minTotal =
        labelH +
        minGap +
        rowHeights.reduce((a, b) => a + b, 0) +
        Math.max(0, rowHeights.length - 1) * minGap;
      return {
        s,
        labelSize,
        bodySize,
        badgeSize,
        badgeOffset,
        titleGap,
        padY,
        minGap,
        textHeight,
        labelH,
        headerFont,
        rowHeights,
        minTotal,
      };
    }

    if (layout === "constellation") {
      const orbitRy = Math.round((H <= 1400 ? 74 : 94) * Math.min(1, s + 0.08));
      const hubZoneH = orbitRy * 2 + Math.round(58 * s);
      const textW = contentW - 144;
      const rowHeights = nodes.map(
        (n) => Math.max(Math.round(92 * s), textHeight(n, textW) + padY * 2),
      );
      const minTotal =
        hubZoneH +
        rowHeights.reduce((a, b) => a + b, 0) +
        Math.max(0, rowHeights.length - 1) * minGap;
      return {
        s,
        labelSize,
        bodySize,
        badgeSize,
        badgeOffset,
        titleGap,
        padY,
        minGap,
        textHeight,
        orbitRy,
        hubZoneH,
        rowHeights,
        minTotal,
      };
    }

    const isTimeline = layout === "timeline",
      isChecklist = layout === "checklist";
    const textW = contentW - (isChecklist ? 228 : isTimeline ? 162 : 196);
    const minCardH = Math.round((isChecklist ? 128 : 120) * s);
    const rowHeights = nodes.map(
      (n) => Math.max(minCardH, textHeight(n, textW) + padY * 2),
    );
    const minTotal =
      rowHeights.reduce((a, b) => a + b, 0) +
      Math.max(0, rowHeights.length - 1) * minGap;
    return {
      s,
      labelSize,
      bodySize,
      badgeSize,
      badgeOffset,
      titleGap,
      padY,
      minGap,
      textHeight,
      rowHeights,
      minTotal,
    };
  };

  const availBodyH = Math.max(120, footerY - 28 - top);
  let chosen = metricsForScale(candidateScales[0]);
  for (const cand of candidateScales) {
    const m = metricsForScale(cand);
    chosen = m;
    if (m.minTotal <= availBodyH) break;
  }

  const {
    s: fitScale,
    labelSize,
    bodySize,
    badgeSize,
    badgeOffset,
    titleGap,
    padY,
    minGap,
    textHeight,
    rowHeights,
    minTotal,
  } = chosen;

  const bodyParts: JSXNode[] = [];
  const drawText = (
    n: BlogInfographicNodeItem,
    x: number,
    y: number,
    w: number,
    i: number,
  ) => {
    const badge = textBlock(
      n.badge.trim() || String(i + 1).padStart(2, "0"),
      x,
      y,
      w,
      badgeSize,
      colors[i % 4],
      true,
    );
    const title = textBlock(
      n.title,
      x,
      y + badgeOffset,
      w,
      labelSize,
      ink,
      true,
    );
    const detail = textBlock(
      n.detail,
      x,
      y + badgeOffset + title.height + titleGap,
      w,
      bodySize,
      muted,
    );
    if (badgeOffset) bodyParts.push(badge.node);
    bodyParts.push(title.node, detail.node);
    return badgeOffset + title.height + titleGap + detail.height;
  };

  const slack = Math.max(0, availBodyH - minTotal);
  let bottom = top;

  if (layout === "comparison") {
    const gap = 38,
      cellW = (contentW - gap) / 2;
    const labels = config.comparisonLabels || [
      "Perspective A",
      "Perspective B",
    ];
    const labelH = chosen.labelH!;
    const headerFont = chosen.headerFont!;
    const topLead = Math.min(20, Math.round(slack * 0.1));
    const pairCount = Math.max(1, rowHeights.length);
    const extraGap = Math.min(
      34,
      Math.round((slack * 0.26) / Math.max(1, pairCount)),
    );
    const rowGap = minGap + extraGap;
    const extraCardH = Math.min(
      96,
      Math.round(
        (slack - topLead - extraGap * Math.max(1, pairCount)) / pairCount,
      ),
    );
    const startY = top + topLead;
    [0, 1].forEach((k) => {
      surfaceRectInto(
        bodyParts,
        M + k * (cellW + gap),
        startY,
        cellW,
        labelH,
        true,
      );
      bodyParts.push(
        textBlock(
          labels[k],
          M + k * (cellW + gap) + 24,
          startY + Math.max(10, Math.round((labelH - headerFont * 1.3) / 2)),
          cellW - 48,
          headerFont,
          ink,
          true,
        ).node,
      );
    });
    let y = startY + labelH + rowGap;
    const textW = cellW - 118;
    for (let i = 0; i < nodes.length; i += 2) {
      const row = nodes.slice(i, i + 2);
      const h = rowHeights[Math.floor(i / 2)] + extraCardH;
      row.forEach((n, k) => {
        const x = M + k * (cellW + gap);
        const ntH = textHeight(n, textW);
        const textY = y + Math.max(padY, Math.round((h - ntH) / 2));
        surfaceRectInto(bodyParts, x, y, cellW, h);
        medallionInto(
          bodyParts,
          n,
          x + 52,
          y + h / 2,
          Math.max(20, Math.round(26 * fitScale)),
          colors[k],
        );
        drawText(n, x + 96, textY, textW, i + k);
      });
      y += h + rowGap;
    }
    bottom = y - rowGap;
  } else if (layout === "constellation") {
    const orbitRy = chosen.orbitRy!;
    const hubZoneH = chosen.hubZoneH!;
    const hubExtra = Math.min(54, Math.round(slack * 0.22));
    const extraGap = Math.min(
      34,
      Math.round((slack * 0.28) / Math.max(1, nodes.length - 1)),
    );
    const rowGap = minGap + extraGap;
    const extraCardH = Math.min(
      84,
      Math.round(
        (slack - hubExtra - extraGap * Math.max(0, nodes.length - 1)) /
          Math.max(1, nodes.length),
      ),
    );
    const cy = top + orbitRy + Math.round(20 * fitScale) + Math.round(hubExtra * 0.45),
      cx = W / 2,
      radius = contentW * 0.34;
    bodyParts.push(
      el("ellipse", {
        cx,
        cy,
        rx: radius,
        ry: orbitRy,
        fill: "none",
        stroke: accent,
        strokeWidth: 2,
        strokeDasharray: "5 9",
        opacity: 0.4,
      }),
    );
    nodes.forEach((n, i) => {
      const a = -Math.PI / 2 + (Math.PI * 2 * i) / nodes.length,
        x = cx + Math.cos(a) * radius,
        y = cy + Math.sin(a) * orbitRy;
      bodyParts.push(
        path(`M ${cx} ${cy} L ${x} ${y}`, colors[i % 4], 2, { opacity: 0.3 }),
      );
      medallionInto(
        bodyParts,
        n,
        x,
        y,
        Math.max(24, Math.round(31 * fitScale)),
        colors[i % 4],
      );
    });
    const centerR = Math.max(50, Math.round(62 * fitScale));
    bodyParts.push(
      circle(cx, cy, centerR, surface, {
        ...shadow,
        stroke: accent,
        strokeWidth: 2,
      }),
      pictogram(
        "idea",
        cx - Math.round(18 * fitScale),
        cy - Math.round(33 * fitScale),
        Math.round(36 * fitScale),
        accent,
      ),
    );
    const center = textBlock(
      config.centerLabel || "Key ideas",
      cx - 52,
      cy + 6,
      104,
      Math.max(15, Math.round(19 * fitScale)),
      ink,
      true,
      true,
    );
    if (center.height > 50)
      addIssue(
        "Center label",
        "Use a shorter center label so it fits inside the concept hub.",
      );
    bodyParts.push(center.node);
    let y = top + hubZoneH + hubExtra;
    const textW = contentW - 144;
    nodes.forEach((n, i) => {
      const h = rowHeights[i] + extraCardH;
      const c = colors[i % 4];
      const ntH = textHeight(n, textW);
      const textY = y + Math.max(padY, Math.round((h - ntH) / 2));
      surfaceRectInto(bodyParts, M, y, contentW, h, i % 2 === 0);
      bodyParts.push(rect(M, y + 14, 5, Math.max(16, h - 28), c, 2));
      drawText(n, M + 28, textY, textW, i);
      medallionInto(
        bodyParts,
        n,
        W - M - 58,
        y + h / 2,
        Math.max(24, Math.round(30 * fitScale)),
        c,
      );
      y += h + rowGap;
    });
    bottom = y - rowGap;
  } else {
    const isTimeline = layout === "timeline",
      isChecklist = layout === "checklist",
      isRibbon = layout === "ribbon";
    const textW = contentW - (isChecklist ? 228 : isTimeline ? 162 : 196);
    const topLead = Math.min(24, Math.round(slack * 0.1));
    const extraGap = Math.min(
      38,
      Math.round((slack * 0.3) / Math.max(1, nodes.length - 1)),
    );
    const rowGap = minGap + extraGap;
    const extraCardH = Math.min(
      115,
      Math.round(
        (slack - topLead - extraGap * Math.max(0, nodes.length - 1)) /
          Math.max(1, nodes.length),
      ),
    );
    let y = top + topLead;
    if (isTimeline && nodes.length > 1) {
      const firstCy = y + (rowHeights[0] + extraCardH) / 2;
      const totalSpan =
        rowHeights.reduce((a, b) => a + b + extraCardH, 0) +
        Math.max(0, nodes.length - 1) * rowGap;
      const lastCy =
        y + totalSpan - (rowHeights[rowHeights.length - 1] + extraCardH) / 2;
      bodyParts.push(
        path(`M ${M + 42} ${firstCy} V ${lastCy}`, accent, 5, {
          opacity: 0.3,
        }),
      );
    }
    nodes.forEach((n, i) => {
      const h = rowHeights[i] + extraCardH,
        c = colors[i % 4];
      const ntH = textHeight(n, textW);
      const textY = y + Math.max(padY, Math.round((h - ntH) / 2));
      const cy = y + h / 2;
      if (isTimeline) {
        surfaceRectInto(bodyParts, M + 112, y, contentW - 112, h);
        bodyParts.push(
          circle(M + 42, cy, 32, surface, {
            ...shadow,
            stroke: c,
            strokeWidth: 3,
          }),
        );
        bodyParts.push(
          textBlock(
            String(i + 1).padStart(2, "0"),
            M + 18,
            cy - 15,
            48,
            22,
            c,
            true,
            true,
          ).node,
        );
        drawText(n, M + 138, textY, textW, i);
      } else if (isChecklist) {
        surfaceRectInto(bodyParts, M, y, contentW, h, i % 2 === 0);
        bodyParts.push(
          rect(M + 24, cy - 21, 42, 42, c, 12),
          path(
            `m ${M + 34} ${cy} 8 8 15 -18`,
            light ? "#FFFFFF" : "#081322",
            4,
          ),
        );
        drawText(n, M + 92, textY, textW, i);
        medallionInto(
          bodyParts,
          n,
          W - M - 62,
          cy,
          Math.max(26, Math.round(35 * fitScale)),
          c,
        );
      } else {
        const right = isRibbon && i % 2 === 1;
        if (isRibbon) surfaceRectInto(bodyParts, M, y, contentW, h, true);
        else surfaceRectInto(bodyParts, M, y, contentW, h, i % 2 === 0);
        const ix = right ? W - M - 70 : M + 68;
        medallionInto(
          bodyParts,
          n,
          ix,
          cy,
          Math.max(30, Math.round(44 * fitScale)),
          c,
        );
        drawText(n, right ? M + 24 : M + 168, textY, textW, i);
      }
      y += h + rowGap;
    });
    bottom = y - rowGap;
  }

  parts.push(el("g", { clipPath: svgRef("body-clip") }, bodyParts));

  if (bottom > footerY - 22)
    addIssue(
      "Text fit",
      "This fixed composition is full. Shorten the explanations, choose a roomier layout, or split the section. Export is paused to prevent cropped text.",
    );

  if (hasFooterSource || hasFooterSig) {
    parts.push(
      path(`M ${M} ${footerY - 8} H ${W - M}`, accent, 1, { opacity: 0.25 }),
    );
  }
  if (hasFooterSource) {
    const sourceMaxW = shareFooterBand
      ? Math.max(220, contentW - sigBlockW - 32)
      : contentW;
    const sourceX =
      shareFooterBand && signature.align === "left"
        ? M + sigBlockW + 32
        : M;
    const sourceY = shareFooterBand
      ? footerY + Math.max(8, Math.round((footerBandH - 36) / 2))
      : footerY + 8;
    const footer = textBlock(
      config.footerSourceLabel,
      sourceX,
      sourceY,
      sourceMaxW,
      18,
      muted,
    );
    if (footer.height > 46)
      addIssue(
        "Source label",
        "Shorten the source label to two lines; keep the full source URL in the project.",
      );
    parts.push(footer.node);
  }
  if (hasFooterSig) {
    const sigY = shareFooterBand
      ? footerY + Math.max(4, Math.round((footerBandH - signatureH - 8) / 2))
      : H - signatureH - 20;
    drawSignature(sigY);
  }
  return {
    svg: renderSVG(
      el(
        "g",
        {
          "data-visual-engine": "prism-antv",
          "data-composition": layout,
          "data-depth": depth.preset,
        },
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

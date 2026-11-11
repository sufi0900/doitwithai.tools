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
const color = (value: string | undefined, fallback: string) =>
  /^#[0-9a-f]{6}$/i.test(value || "") ? value! : fallback;

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
export function buildPrismScene(config: BlogInfographicConfig): {
  svg: string;
  issues: Issue[];
} {
  const { width: W, height: H } = getInfographicDimensions(config);
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
  const hasSignature = signature.visible && (logo || signature.name?.trim());
  const M = Math.round(W * 0.0667),
    contentW = W - M * 2;
  const signatureH = 44 * scale + (signature.padding || 12) * 2;
  const footerY =
    H -
    (hasSignature && signature.placement === "footer" ? signatureH + 78 : 78);
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
  const surfaceRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    tint = false,
  ) => {
    if (depth.preset === "layered" && strength > 0)
      parts.push(
        rect(
          x + 5 * strength,
          y + 8 * strength,
          w,
          h,
          mixColor(surface, accent, 0.18),
          22,
        ),
      );
    parts.push(
      rect(x, y, w, h, surface, 22, {
        ...shadow,
        stroke: mixColor(surface, accent, 0.18),
        strokeWidth: 1,
      }),
    );
    if (tint) parts.push(rect(x, y, w, h, svgRef("band"), 22));
  };
  const medallion = (
    n: BlogInfographicNodeItem,
    x: number,
    y: number,
    r: number,
    c: string,
  ) => {
    parts.push(
      circle(x, y, r + 14, c, { opacity: 0.08 }),
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
    const pad = signature.padding || 12,
      lw = logo ? 120 * scale : 0,
      lh = 40 * scale;
    const name = signature.name?.trim() || "";
    const nameW = name
      ? Math.min(
          contentW - lw - (logo ? 44 : 0) - pad * 2,
          Math.max(100, widthOf(name, 22, true)),
        )
      : 0;
    const nameHeight = name ? wrap(name, nameW, 22, true).length * 28.6 : 0;
    if (nameHeight > 58)
      addIssue(
        "Website name",
        "Shorten the website display name so it fits on two lines.",
      );
    const blockW = lw + (name && logo ? 18 : 0) + nameW + pad * 2;
    const x = signature.align === "left" ? M : W - M - blockW;
    if (config.brand?.logoStyle !== "plain" && config.brand?.logoStyle)
      parts.push(
        rect(
          x,
          y,
          blockW,
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
          x: x + pad,
          y: y + (signatureH - lh) / 2,
          width: lw,
          height: lh,
          preserveAspectRatio: "xMidYMid meet",
        }),
      );
    if (name)
      parts.push(
        textBlock(
          name,
          x + pad + lw + (logo ? 18 : 0),
          y + Math.max(pad, (signatureH - nameHeight) / 2),
          nameW,
          22,
          nameInk,
          true,
        ).node,
      );
  };
  let headerTop = 54;
  if (hasSignature && signature.placement === "header") {
    drawSignature(32);
    headerTop = 32 + signatureH + 30;
  }
  parts.push(
    rect(M, headerTop, 58, 6, accent, 3),
    rect(M + 69, headerTop, 23, 6, colors[1], 3),
  );
  const headline = textBlock(
    config.headline,
    M,
    headerTop + 32,
    contentW,
    W > 1200 ? 60 : 62,
    ink,
    true,
  );
  parts.push(headline.node);
  let top = headerTop + 32 + headline.height + 20;
  if (config.subheadline.trim()) {
    const sub = textBlock(config.subheadline, M, top, contentW, 26, muted);
    parts.push(sub.node);
    top += sub.height + 20;
  }
  top += 30;
  const nodes = config.nodes.slice(0, 6);
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
  const bodySize = 27,
    labelSize = 33,
    badgeOffset = layout === "comparison" ? 0 : 30;
  const textHeight = (n: BlogInfographicNodeItem, w: number) =>
    badgeOffset +
    wrap(n.title, w, labelSize, true).length * labelSize * 1.3 +
    12 +
    wrap(n.detail, w, bodySize).length * bodySize * 1.3;
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
      19,
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
      y + badgeOffset + title.height + 12,
      w,
      bodySize,
      muted,
    );
    if (badgeOffset) parts.push(badge.node);
    parts.push(title.node, detail.node);
    return badgeOffset + title.height + 12 + detail.height;
  };
  let bottom = top;
  if (layout === "comparison") {
    const gap = 42,
      cellW = (contentW - gap) / 2;
    const labels = config.comparisonLabels || [
      "Perspective A",
      "Perspective B",
    ];
    const labelH =
      Math.max(
        ...labels.map((t) => wrap(t, cellW - 48, 32, true).length * 41.6),
      ) + 30;
    [0, 1].forEach((k) => {
      surfaceRect(M + k * (cellW + gap), top, cellW, labelH, true);
      parts.push(
        textBlock(
          labels[k],
          M + k * (cellW + gap) + 24,
          top + 14,
          cellW - 48,
          32,
          ink,
          true,
        ).node,
      );
    });
    let y = top + labelH + 20;
    for (let i = 0; i < nodes.length; i += 2) {
      const row = nodes.slice(i, i + 2),
        textW = cellW - 124;
      const h = Math.max(...row.map((n) => textHeight(n, textW)), 110) + 28;
      row.forEach((n, k) => {
        const x = M + k * (cellW + gap);
        surfaceRect(x, y, cellW, h);
        medallion(n, x + 55, y + 57, 28, colors[k]);
        drawText(n, x + 100, y + 14, textW, i + k);
      });
      y += h + 20;
    }
    bottom = y - 20;
  } else if (layout === "constellation") {
    const cy = top + 125,
      cx = W / 2,
      radius = contentW * 0.34;
    parts.push(
      el("ellipse", {
        cx,
        cy,
        rx: radius,
        ry: 98,
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
        y = cy + Math.sin(a) * 98;
      parts.push(
        path(`M ${cx} ${cy} L ${x} ${y}`, colors[i % 4], 2, { opacity: 0.3 }),
      );
      medallion(n, x, y, 33, colors[i % 4]);
    });
    parts.push(
      circle(cx, cy, 64, surface, {
        ...shadow,
        stroke: accent,
        strokeWidth: 2,
      }),
      pictogram("idea", cx - 19, cy - 35, 38, accent),
    );
    const center = textBlock(
      config.centerLabel || "Key ideas",
      cx - 52,
      cy + 7,
      104,
      19,
      ink,
      true,
      true,
    );
    if (center.height > 50)
      addIssue(
        "Center label",
        "Use a shorter center label so it fits inside the concept hub.",
      );
    parts.push(center.node);
    let y = top + 280;
    nodes.forEach((n, i) => {
      const h = textHeight(n, contentW - 44);
      parts.push(rect(M, y + 4, 5, h - 8, colors[i % 4], 2));
      drawText(n, M + 28, y, contentW - 44, i);
      y += h + 30;
    });
    bottom = y;
  } else {
    const isTimeline = layout === "timeline",
      isChecklist = layout === "checklist",
      isRibbon = layout === "ribbon";
    const textW = contentW - (isChecklist ? 236 : isTimeline ? 166 : 205);
    const heights = nodes.map(
      (n) => Math.max(isChecklist ? 150 : 140, textHeight(n, textW)) + 38,
    );
    const total =
      heights.reduce((a, b) => a + b, 0) + Math.max(0, nodes.length - 1) * 26;
    const extra = Math.min(
      24,
      Math.max(0, footerY - 42 - top - total) / Math.max(1, nodes.length),
    );
    if (isTimeline && nodes.length > 1)
      parts.push(
        path(
          `M ${M + 42} ${top + 44} V ${top + total + extra * nodes.length - heights[heights.length - 1] + 44}`,
          accent,
          5,
          { opacity: 0.3 },
        ),
      );
    let y = top;
    nodes.forEach((n, i) => {
      const h = heights[i] + extra,
        c = colors[i % 4];
      if (isTimeline) {
        surfaceRect(M + 112, y, contentW - 112, h);
        parts.push(
          circle(M + 42, y + 44, 32, surface, {
            ...shadow,
            stroke: c,
            strokeWidth: 3,
          }),
        );
        parts.push(
          textBlock(
            String(i + 1).padStart(2, "0"),
            M + 18,
            y + 29,
            48,
            22,
            c,
            true,
            true,
          ).node,
        );
        drawText(n, M + 138, y + 18, textW, i);
      } else if (isChecklist) {
        surfaceRect(M, y, contentW, h, i % 2 === 0);
        parts.push(
          rect(M + 24, y + 26, 42, 42, c, 12),
          path(
            `m ${M + 34} ${y + 47} 8 8 15 -18`,
            light ? "#FFFFFF" : "#081322",
            4,
          ),
        );
        drawText(n, M + 92, y + 18, textW, i);
        medallion(n, W - M - 62, y + h / 2, 36, c);
      } else {
        const right = isRibbon && i % 2 === 1;
        if (isRibbon) surfaceRect(M, y, contentW, h, true);
        else
          parts.push(
            path(`M ${M + 180} ${y + h + 12} H ${W - M}`, c, 1, {
              opacity: 0.2,
            }),
          );
        const ix = right ? W - M - 70 : M + 68;
        medallion(n, ix, y + h / 2, 48, c);
        drawText(n, right ? M + 18 : M + 184, y + 18, textW, i);
      }
      y += h + 26;
    });
    bottom = y;
  }
  if (bottom > footerY - 26)
    addIssue(
      "Text fit",
      "This fixed composition is full. Shorten the explanations, choose a roomier layout, or split the section. Export is paused to prevent cropped text.",
    );
  parts.push(
    path(`M ${M} ${footerY - 8} H ${W - M}`, accent, 1, { opacity: 0.25 }),
  );
  const footer = textBlock(
    config.footerSourceLabel,
    M,
    footerY + 8,
    contentW,
    18,
    muted,
  );
  if (footer.height > 46)
    addIssue(
      "Source label",
      "Shorten the source label to two lines; keep the full source URL in the project.",
    );
  parts.push(footer.node);
  if (hasSignature && signature.placement === "footer")
    drawSignature(H - signatureH - 20);
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

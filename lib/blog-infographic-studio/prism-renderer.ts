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
  resolveFontStack,
} from "./appearance";
import {
  SEMANTIC_ICON_PATHS,
  assignDistinctSectionIcons,
  isInfographicTopicIcon,
  scoreSemanticIconCandidates,
} from "./skills/semantic-iconography";
import {
  getVectorSceneById,
  matchVectorSceneForTopic,
} from "@/lib/visual-stock/vector-scenes";

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

function isHex(v: unknown): v is string {
  return typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);
}

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
  if (type === "__raw_svg__") {
    return String(props.svg || "");
  }
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
const el = (
  type: string,
  props: Record<string, unknown>,
  ...children: JSXNode[]
) =>
  jsx(
    type as any,
    {
      ...props,
      children:
        children.length === 0
          ? undefined
          : children.length === 1
            ? children[0]
            : children,
    } as any,
  );
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

function segmentLineWithHighlights(
  lineText: string,
  highlights?: { phrase: string; color: string }[],
): JSXNode {
  if (!highlights || !highlights.length) return lineText;
  const active = highlights.filter((h) => h.phrase.trim().length >= 2);
  if (!active.length) return lineText;

  // Build non-overlapping matches sorted by start index
  const lower = lineText.toLowerCase();
  const spans: { start: number; end: number; color: string }[] = [];
  for (const h of active) {
    const target = h.phrase.trim().toLowerCase();
    let pos = 0;
    while (pos < lower.length) {
      const idx = lower.indexOf(target, pos);
      if (idx === -1) break;
      const end = idx + target.length;
      const overlaps = spans.some((s) => idx < s.end && end > s.start);
      if (!overlaps) {
        spans.push({ start: idx, end, color: h.color });
      }
      pos = end;
    }
  }
  if (!spans.length) return lineText;
  spans.sort((a, b) => a.start - b.start);

  const nodes: JSXNode[] = [];
  let cursor = 0;
  for (const s of spans) {
    if (s.start > cursor) {
      nodes.push(lineText.slice(cursor, s.start));
    }
    nodes.push(
      el("tspan", { fill: s.color }, lineText.slice(s.start, s.end)),
    );
    cursor = s.end;
  }
  if (cursor < lineText.length) {
    nodes.push(lineText.slice(cursor));
  }
  return nodes;
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
  fontStack = "Arial, sans-serif",
  highlights?: { phrase: string; color: string }[],
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
        fontFamily: fontStack,
        fontWeight: bold ? 700 : 400,
        fill,
        textAnchor: center ? "middle" : "start",
      },
      lines.map((line, i) => {
        const lineStr = line + (i < lines.length - 1 ? " " : "");
        return el(
          "tspan",
          { x: center ? x + width / 2 : x, dy: i ? lineHeight : 0 },
          segmentLineWithHighlights(lineStr, highlights),
        );
      }),
    ),
  };
}
const icons: Record<Icon, string[]> = SEMANTIC_ICON_PATHS;
export function semanticIcon(
  node: BlogInfographicNodeItem,
  sectionTitle?: string,
): Icon {
  if (node.icon && isInfographicTopicIcon(node.icon)) return node.icon;
  return scoreSemanticIconCandidates(node, sectionTitle)[0] || "idea";
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
    (icons[icon] || icons.idea).map((d) => path(d, ink, 1.5)),
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
  const bgPattern = config.backgroundPattern || "dots-glow";
  const cardStyle = config.cardStyle || "glass-editorial";
  const fontStack = resolveFontStack(config.fontFamily);
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
  const hasFooterSig = Boolean(
    hasSignature && signature.placement === "footer",
  );
  const hasFooterSource = Boolean(config.footerSourceLabel?.trim());
  const M = Math.round(W * 0.0667),
    contentW = W - M * 2;
  const signatureH = 44 * scale + (signature.padding || 12) * 2;

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
  const sigNameHeight = sigName
    ? wrap(sigName, sigNameW, 22, true).length * 28.6
    : 0;
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
  const prefix = `prism-${sourceId(
    JSON.stringify([
      layout,
      W,
      H,
      bg,
      bgEnd,
      surface,
      accent,
      colors,
      depth,
      bgPattern,
      cardStyle,
    ]),
  )}`;
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

  const defsChildren: JSXNode[] = [
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
      el("stop", { offset: 0, stopColor: accent, stopOpacity: 0.18 }),
      el("stop", { offset: 1, stopColor: accent, stopOpacity: 0 }),
    ]),
    el("radialGradient", { id: svgId("glow-secondary") }, [
      el("stop", {
        offset: 0,
        stopColor: colors[3],
        stopOpacity: light ? 0.1 : 0.14,
      }),
      el("stop", { offset: 1, stopColor: colors[3], stopOpacity: 0 }),
    ]),
    el(
      "clipPath",
      { id: svgId("body-clip"), clipPathUnits: "userSpaceOnUse" },
      rect(0, 0, W, Math.max(100, footerY - 12), "#000000"),
    ),
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
  ];

  if (bgPattern === "dots-glow") {
    defsChildren.push(
      el(
        "pattern",
        {
          id: svgId("dots"),
          width: 28,
          height: 28,
          patternUnits: "userSpaceOnUse",
        },
        circle(2, 2, 1.35, accent, { opacity: light ? 0.12 : 0.16 }),
      ),
    );
  } else if (bgPattern === "mesh-grid") {
    defsChildren.push(
      el(
        "pattern",
        {
          id: svgId("grid"),
          width: 48,
          height: 48,
          patternUnits: "userSpaceOnUse",
        },
        path("M 48 0 L 0 0 0 48", accent, 1, {
          opacity: light ? 0.08 : 0.11,
        }),
      ),
    );
  }

  parts.push(el("defs", {}, defsChildren));
  parts.push(
    rect(0, 0, W, H, svgRef("bg")),
    circle(W * 0.96, H * 0.16, W * 0.62, svgRef("glow")),
    circle(W * 0.06, H * 0.88, W * 0.52, svgRef("glow-secondary")),
  );

  // Render procedural background pattern shader layer
  if (bgPattern === "dots-glow") {
    parts.push(
      rect(0, 0, W, H, svgRef("dots")),
      path(
        `M ${W * 0.66} -70 C ${W * 0.2} ${H * 0.28}, ${W * 1.35} ${H * 0.4}, ${W * 0.8} ${H * 0.85}`,
        accent,
        90,
        { opacity: 0.045 },
      ),
    );
  } else if (bgPattern === "svg-waves") {
    parts.push(
      path(
        `M -80 ${H * 0.18} C ${W * 0.28} ${H * 0.04}, ${W * 0.68} ${H * 0.32}, ${W + 80} ${H * 0.14}`,
        accent,
        64,
        { opacity: light ? 0.055 : 0.08 },
      ),
      path(
        `M -80 ${H * 0.56} C ${W * 0.34} ${H * 0.42}, ${W * 0.72} ${H * 0.7}, ${W + 80} ${H * 0.52}`,
        colors[1],
        52,
        { opacity: light ? 0.045 : 0.07 },
      ),
      path(
        `M -80 ${H * 0.86} C ${W * 0.3} ${H * 0.74}, ${W * 0.74} ${H * 0.96}, ${W + 80} ${H * 0.82}`,
        colors[3],
        44,
        { opacity: light ? 0.04 : 0.06 },
      ),
    );
  } else if (bgPattern === "mesh-grid") {
    parts.push(
      rect(0, 0, W, H, svgRef("grid")),
      path(
        `M ${W * 0.72} -60 C ${W * 0.25} ${H * 0.25}, ${W * 1.25} ${H * 0.45}, ${W * 0.78} ${H * 0.88}`,
        accent,
        70,
        { opacity: 0.04 },
      ),
    );
  } else if (bgPattern === "concentric-rings") {
    parts.push(
      circle(W * 0.92, H * 0.12, W * 0.22, "none", {
        stroke: accent,
        strokeWidth: 2,
        strokeDasharray: "8 12",
        opacity: 0.14,
      }),
      circle(W * 0.92, H * 0.12, W * 0.34, "none", {
        stroke: colors[1],
        strokeWidth: 1.5,
        opacity: 0.09,
      }),
      circle(W * 0.08, H * 0.88, W * 0.28, "none", {
        stroke: colors[3],
        strokeWidth: 2,
        strokeDasharray: "6 10",
        opacity: 0.12,
      }),
    );
  } else {
    parts.push(
      path(
        `M ${W * 0.66} -70 C ${W * 0.2} ${H * 0.28}, ${W * 1.35} ${H * 0.4}, ${W * 0.8} ${H * 0.85}`,
        accent,
        90,
        { opacity: 0.045 },
      ),
    );
  }

  const ov = config.styleOverrides || {};
  const cardRadius =
    typeof ov.cardRadius === "number"
      ? Math.max(8, Math.min(36, ov.cardRadius))
      : 22;
  const accentBarW =
    typeof ov.accentBarWidth === "number"
      ? Math.max(0, Math.min(14, ov.accentBarWidth))
      : 6;

  const surfaceRectInto = (
    target: JSXNode[],
    x: number,
    y: number,
    w: number,
    h: number,
    tint = false,
    accentColor = accent,
    layerId?: string,
  ) => {
    const layerAttr = layerId
      ? { "data-layer-id": layerId, style: "cursor:pointer" }
      : {};
    const boxAttr = layerId
      ? { ...layerAttr, "data-layer-box": layerId }
      : {};
    if (depth.preset === "layered" && strength > 0)
      target.push(
        rect(
          x + 5 * strength,
          y + 8 * strength,
          w,
          h,
          mixColor(surface, accentColor, 0.18),
          cardRadius,
        ),
      );
    target.push(
      rect(x, y, w, h, surface, cardRadius, {
        ...shadow,
        ...boxAttr,
        stroke:
          cardStyle === "bordered-bento"
            ? mixColor(surface, accentColor, 0.45)
            : mixColor(surface, accentColor, 0.18),
        strokeWidth: cardStyle === "bordered-bento" ? 2 : 1,
      }),
    );
    if (tint || cardStyle === "playbook-contrast")
      target.push(rect(x, y, w, h, svgRef("band"), cardRadius, layerAttr));
    if (
      (cardStyle === "playbook-contrast" ||
        typeof ov.accentBarWidth === "number") &&
      accentBarW > 0
    ) {
      target.push(
        rect(
          x,
          y + 14,
          accentBarW,
          Math.max(20, h - 28),
          accentColor,
          Math.round(accentBarW / 2),
        ),
      );
    } else if (cardStyle === "minimal-stripe") {
      target.push(
        path(`M ${x + 22} ${y + h - 2} H ${x + w - 22}`, accentColor, 2, {
          opacity: 0.35,
        }),
      );
    }
  };
  const distinctSceneNodes = assignDistinctSectionIcons(
    config.nodes.slice(0, 6),
    config.headline,
  );
  const iconForNode = (n: BlogInfographicNodeItem): Icon => {
    const matched = distinctSceneNodes.find((d) => d.id === n.id);
    return matched?.icon || semanticIcon(n, config.headline);
  };
  const medallionInto = (
    target: JSXNode[],
    n: BlogInfographicNodeItem,
    x: number,
    y: number,
    r: number,
    c: string,
    nodeIndex?: number,
  ) => {
    const medallionChildren: JSXNode[] = [
      circle(x, y, r + 12, c, { opacity: 0.08 }),
      circle(x, y, r, surface, {
        ...shadow,
        stroke: c,
        strokeOpacity: 0.3,
        strokeWidth: 1.5,
      }),
      n.customIconDataUrl
        ? el("image", {
            href: n.customIconDataUrl,
            x: x - r * 0.65,
            y: y - r * 0.65,
            width: r * 1.3,
            height: r * 1.3,
            preserveAspectRatio: "xMidYMid meet",
          })
        : pictogram(iconForNode(n), x - r * 0.55, y - r * 0.55, r * 1.1, c),
    ];
    if (typeof nodeIndex === "number") {
      target.push(
        el(
          "g",
          {
            "data-layer-id": `node-icon-${nodeIndex}`,
            "data-layer-box": `node-icon-${nodeIndex}`,
            style: "cursor:pointer",
          },
          ...medallionChildren,
        ),
      );
    } else {
      target.push(...medallionChildren);
    }
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
          false,
          fontStack,
        ).node,
      );
  };
  let headerTop = 50;
  if (hasSignature && signature.placement === "header") {
    drawSignature(28);
    headerTop = 28 + signatureH + 26;
  }

  const eyebrowText = config.eyebrowLabel?.trim() || "";
  const slideCounterText = config.slideCounter?.trim() || "";
  if (eyebrowText || slideCounterText) {
    if (eyebrowText) {
      const pillW = Math.min(
        contentW - (slideCounterText ? 130 : 0),
        Math.max(140, widthOf(eyebrowText.toUpperCase(), 15, true) + 44),
      );
      parts.push(
        rect(M, headerTop - 8, pillW, 32, surface, 16, {
          stroke: accent,
          strokeOpacity: 0.45,
          strokeWidth: 1.5,
        }),
        circle(M + 16, headerTop + 8, 4.5, colors[3]),
        textBlock(
          eyebrowText.toUpperCase(),
          M + 28,
          headerTop - 1,
          pillW - 36,
          15,
          accent,
          true,
          false,
          fontStack,
        ).node,
      );
    } else {
      parts.push(
        rect(M, headerTop, 58, 6, accent, 3),
        rect(M + 69, headerTop, 23, 6, colors[1], 3),
      );
    }
    if (slideCounterText) {
      const counterW = Math.max(88, widthOf(slideCounterText, 16, true) + 32);
      parts.push(
        rect(W - M - counterW, headerTop - 8, counterW, 32, surface, 16, {
          stroke: mixColor(surface, ink, 0.2),
          strokeWidth: 1,
        }),
        textBlock(
          slideCounterText,
          W - M - counterW,
          headerTop - 1,
          counterW,
          15,
          muted,
          true,
          true,
          fontStack,
        ).node,
      );
    }
    headerTop += 14;
  } else {
    parts.push(
      rect(M, headerTop, 58, 6, accent, 3),
      rect(M + 69, headerTop, 23, 6, colors[1], 3),
    );
  }

  const nodes = config.nodes.slice(0, 6);
  const isSyntheticOverflow =
    config.headline.length > 220 || nodes.some((n) => n.detail.length > 600);
  const baseHeadlineSize = isSyntheticOverflow
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
  const hScale = config.styleOverrides?.headlineScale;
  const headlineSize =
    typeof hScale === "number" && hScale >= 0.7 && hScale <= 1.4
      ? Math.round(baseHeadlineSize * hScale)
      : baseHeadlineSize;

  const highlightPhrases = (config.highlightWords || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length >= 2)
    .slice(0, 3)
    .map((phrase, idx) => ({
      phrase,
      color: idx === 0 ? accent : idx === 1 ? colors[3] : colors[1],
    }));

  const hasHeaderScene =
    config.sceneIllustration !== "none" && !isSyntheticOverflow && W >= 1000;
  const headerTextW = hasHeaderScene ? contentW - 208 : contentW;

  const headline = textBlock(
    config.headline,
    M,
    headerTop + 26,
    headerTextW,
    headlineSize,
    ink,
    true,
    false,
    fontStack,
    highlightPhrases,
  );
  const headlineChildren: JSXNode[] = [headline.node];
  let top = headerTop + 26 + headline.height + 16;
  if (config.subheadline.trim()) {
    const subSize = H <= 960 ? 22 : 25;
    const sub = textBlock(
      config.subheadline,
      M,
      top,
      headerTextW,
      subSize,
      muted,
      false,
      false,
      fontStack,
    );
    headlineChildren.push(sub.node);
    top += sub.height + 16;
  }
  parts.push(
    el(
      "g",
      {
        "data-layer-id": "headline",
        "data-layer-box": "headline",
        style: "cursor:pointer",
      },
      rect(
        M - 6,
        headerTop + 18,
        headerTextW + 12,
        Math.max(48, top - (headerTop + 18)),
        "transparent",
        8,
      ),
      ...headlineChildren,
    ),
  );
  if (hasHeaderScene) {
    const headerBlockH = Math.max(118, top - (headerTop + 26));
    const sceneScale = 0.74;
    const sceneH = Math.round(160 * sceneScale);
    const sceneW = Math.round(240 * sceneScale);
    const sceneX = Math.round(W - M - sceneW);
    const sceneY = Math.round(
      headerTop + 26 + Math.max(0, (headerBlockH - sceneH) / 2),
    );
    if (
      config.customSceneImageUrl &&
      /^data:image\/(png|jpeg|webp);base64,/i.test(config.customSceneImageUrl)
    ) {
      parts.push(
        el("image", {
          href: config.customSceneImageUrl,
          x: sceneX,
          y: sceneY,
          width: sceneW,
          height: sceneH,
          preserveAspectRatio: "xMidYMid meet",
          "data-layer-id": "scene-illustration",
          "data-layer-box": "scene-illustration",
          style: "cursor:pointer",
        }),
      );
    } else {
      const activeScene =
        getVectorSceneById(config.sceneIllustration) ||
        matchVectorSceneForTopic(
          `${config.headline} ${config.subheadline}`,
          layout,
        );
      const sceneMarkup = activeScene.renderSvgNodes({
        primary: accent,
        secondary: colors[1] || accent,
        surface,
        ink,
        muted,
      });
      parts.push(
        el(
          "g",
          {
            transform: `translate(${sceneX}, ${sceneY}) scale(${sceneScale})`,
            opacity: light ? 0.88 : 0.92,
            "data-vector-scene": activeScene.id,
            "data-layer-id": "scene-illustration",
            "data-layer-box": "scene-illustration",
            style: "cursor:pointer",
          },
          rect(0, 0, 240, 160, "transparent", 12),
          el("__raw_svg__", { svg: sceneMarkup }),
        ),
      );
    }
    top = Math.max(top, sceneY + sceneH + 14);
  }
  top += H <= 960 ? 20 : 24;
  parts.push(
    rect(M, top - 16, 92, 5, accent, 2.5),
    rect(M + 102, top - 16, 34, 5, colors[3], 2.5),
  );
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

  const hasCallout =
    Boolean(config.calloutText?.trim()) && ov.calloutStyle !== "hidden";
  const calloutBadgeLabel = (
    config.calloutBadge?.trim() || "KEY TAKEAWAY"
  ).toUpperCase();
  const calloutBadgeW = Math.max(
    110,
    widthOf(calloutBadgeLabel, 14, true) + 28,
  );
  const calloutTextW = Math.max(200, contentW - calloutBadgeW - 44);
  const calloutLines = hasCallout
    ? wrap(config.calloutText!.trim(), calloutTextW, 18, true)
    : [];
  const calloutBoxH = hasCallout
    ? Math.max(54, calloutLines.length * 24 + 26)
    : 0;
  const calloutReserve = hasCallout ? calloutBoxH + 22 : 0;

  const titleScaleMult =
    typeof ov.cardTitleScale === "number"
      ? Math.max(0.75, Math.min(1.35, ov.cardTitleScale))
      : 1;
  const bodyScaleMult =
    typeof ov.bodyScale === "number"
      ? Math.max(0.75, Math.min(1.35, ov.bodyScale))
      : 1;
  const padYDelta =
    typeof ov.cardPaddingY === "number"
      ? Math.max(-12, Math.min(40, ov.cardPaddingY))
      : 0;
  const gapDelta =
    typeof ov.cardGap === "number"
      ? Math.max(-12, Math.min(48, ov.cardGap))
      : 0;

  // Multi-pass adaptive typography and spacing solver so 2–6 points fit cleanly above footerY
  const candidateScales = isSyntheticOverflow
    ? [1.0]
    : [1.0, 0.94, 0.88, 0.82, 0.76, 0.7, 0.65, 0.6, 0.55, 0.5];

  const metricsForScale = (s: number) => {
    const labelSize = Math.max(
      16,
      Math.round(32 * s * titleScaleMult),
    );
    const bodySize = Math.max(13, Math.round(26 * s * bodyScaleMult));
    const badgeSize = Math.max(12, Math.round(18 * s));
    const isFaqChecklist =
      layout === "checklist" &&
      nodes.length > 0 &&
      nodes.every((n) => /^Q\d+$/i.test(n.badge.trim()));
    const badgeOffset =
      layout === "comparison" ||
      layout === "before-after" ||
      layout === "timeline" ||
      layout === "pipeline-flow" ||
      layout === "split-equation" ||
      layout === "hierarchy-tree" ||
      layout === "donut-breakdown" ||
      layout === "cycle-wheel" ||
      layout === "kpi-bento" ||
      isFaqChecklist
        ? 0
        : Math.max(20, Math.round(28 * s));
    const titleGap = Math.max(6, Math.round(10 * s));
    const padY = Math.max(10, Math.round(18 * s) + padYDelta);
    const minGap = Math.max(10, Math.round(20 * s) + gapDelta);
    const textHeight = (n: BlogInfographicNodeItem, w: number) =>
      badgeOffset +
      wrap(n.title, w, labelSize, true).length * labelSize * 1.3 +
      titleGap +
      wrap(n.detail, w, bodySize).length * bodySize * 1.3;

    if (layout === "pipeline-flow") {
      const cols = Math.min(3, Math.max(2, nodes.length));
      const arrowGap = 44;
      const colW = Math.floor(
        (contentW - arrowGap * (cols - 1)) / cols,
      );
      const colTextW = colW - 44;
      const headReserve = Math.round(88 * s);
      const colHeights = nodes.slice(0, cols).map(
        (n) =>
          headReserve +
          wrap(n.title, colTextW, labelSize, true).length * labelSize * 1.28 +
          titleGap +
          wrap(n.detail, colTextW, bodySize).length * bodySize * 1.3 +
          padY * 2,
      );
      const cardH = Math.max(Math.round(220 * s), ...colHeights);
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
        rowHeights: [cardH],
        minTotal: cardH,
      };
    }

    if (layout === "split-equation") {
      const hubGap = 96;
      const colW = Math.floor((contentW - hubGap) / 2);
      const colTextW = colW - 48;
      const headReserve = Math.round(92 * s);
      const colHeights = nodes.slice(0, 2).map(
        (n) =>
          headReserve +
          wrap(n.title, colTextW, labelSize, true).length * labelSize * 1.28 +
          titleGap +
          wrap(n.detail, colTextW, bodySize).length * bodySize * 1.3 +
          padY * 2,
      );
      const cardH = Math.max(Math.round(220 * s), ...colHeights);
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
        rowHeights: [cardH],
        minTotal: cardH,
      };
    }

    if (layout === "hierarchy-tree") {
      const rootH = Math.round(52 * s);
      const busH = Math.round(46 * s);
      const topRowCount = nodes.length <= 4 ? nodes.length : Math.ceil(nodes.length / 2);
      const colGap = 22;
      const colW = Math.floor((contentW - colGap * (topRowCount - 1)) / topRowCount);
      const colTextW = Math.max(160, colW - 36);
      const headReserve = Math.round(64 * s);
      const rowHeights: number[] = [];
      for (let i = 0; i < nodes.length; i += topRowCount) {
        const slice = nodes.slice(i, i + topRowCount);
        const h = Math.max(
          Math.round(140 * s),
          ...slice.map(
            (n) =>
              headReserve +
              wrap(n.title, colTextW, labelSize, true).length * labelSize * 1.28 +
              titleGap +
              wrap(n.detail, colTextW, bodySize).length * bodySize * 1.3 +
              padY * 2,
          ),
        );
        rowHeights.push(h);
      }
      const minTotal =
        rootH +
        busH +
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
        rootH,
        busH,
        topRowCount,
        rowHeights,
        minTotal,
      };
    }

    if (layout === "donut-breakdown" || layout === "cycle-wheel") {
      const visualZoneH = Math.round((nodes.length >= 5 ? 186 : 220) * Math.min(1, s + 0.08));
      const colGap = 22;
      const cellW = (contentW - colGap) / 2;
      const textW = Math.max(180, cellW - 102);
      const rowHeights: number[] = [];
      for (let i = 0; i < nodes.length; i += 2) {
        const slice = nodes.slice(i, i + 2);
        const h = Math.max(
          Math.round(92 * s),
          ...slice.map((n) => textHeight(n, textW) + padY * 2),
        );
        rowHeights.push(h);
      }
      const minTotal =
        visualZoneH +
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
        visualZoneH,
        rowHeights,
        minTotal,
      };
    }

    if (layout === "kpi-bento") {
      const colGap = 26;
      const heroW = Math.round(contentW * 0.39);
      const rightW = contentW - heroW - colGap;
      const heroNode = nodes[0];
      const supportNodes = nodes.slice(1);
      const heroTextW = heroW - 48;
      const heroMinH = heroNode
        ? Math.round(132 * s) +
          wrap(heroNode.title, heroTextW, Math.round(labelSize * 1.1), true).length *
            Math.round(labelSize * 1.1) *
            1.28 +
          titleGap +
          wrap(heroNode.detail, heroTextW, bodySize).length * bodySize * 1.3 +
          padY * 2
        : 220;
      const useRightGrid = supportNodes.length >= 4;
      const rightColW = useRightGrid ? (rightW - 18) / 2 : rightW;
      const rightTextW = Math.max(180, rightColW - (useRightGrid ? 40 : 108));
      const rowHeights: number[] = [];
      if (useRightGrid) {
        for (let i = 0; i < supportNodes.length; i += 2) {
          const slice = supportNodes.slice(i, i + 2);
          const h = Math.max(
            Math.round(108 * s),
            ...slice.map((n) => Math.round(36 * s) + textHeight(n, rightTextW) + padY * 2),
          );
          rowHeights.push(h);
        }
      } else {
        for (const n of supportNodes) {
          rowHeights.push(
            Math.max(Math.round(88 * s), textHeight(n, rightTextW) + padY * 2),
          );
        }
      }
      const rightTotal =
        rowHeights.reduce((a, b) => a + b, 0) +
        Math.max(0, rowHeights.length - 1) * minGap;
      const minTotal = Math.max(heroMinH, rightTotal);
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
        heroW,
        rightW,
        useRightGrid,
        rowHeights,
        minTotal,
      };
    }

    if (layout === "comparison" || layout === "before-after") {
      const gap = layout === "before-after" ? 64 : 38,
        cellW = (contentW - gap) / 2;
      const labels =
        config.comparisonLabels ||
        (layout === "before-after"
          ? ["Before · Legacy State", "After · Optimized Result"]
          : ["Perspective A", "Perspective B"]);
      const headerFont = Math.max(18, Math.round(28 * s));
      const labelH =
        Math.max(
          ...labels.map(
            (t) =>
              wrap(t, cellW - 48, headerFont, true).length * headerFont * 1.3,
          ),
        ) + Math.round(24 * s);
      const textW = cellW - 118;
      const rowHeights: number[] = [];
      for (let i = 0; i < nodes.length; i += 2) {
        const row = nodes.slice(i, i + 2);
        const rowW = row.length === 1 && layout === "before-after" ? contentW - 140 : textW;
        const h =
          Math.max(...row.map((n) => textHeight(n, rowW)), Math.round(84 * s)) +
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
      const orbitRy = Math.round(
        (H <= 1400 ? 74 : 94) * Math.min(1, s + 0.08),
      );
      const hubZoneH = orbitRy * 2 + Math.round(58 * s);
      const textW = contentW - 144;
      const rowHeights = nodes.map((n) =>
        Math.max(Math.round(92 * s), textHeight(n, textW) + padY * 2),
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

    const isEditorialBento =
      (layout === "editorial" &&
        !isSyntheticOverflow &&
        (nodes.length === 4 || nodes.length === 6)) ||
      layout === "quadrant-matrix";
    if (isEditorialBento) {
      const colGap = 28;
      const cellW = (contentW - colGap) / 2;
      const bentoTextW = cellW - 48;
      const bentoHeadH = Math.max(58, Math.round(68 * s));
      const bentoTextHeight = (n: BlogInfographicNodeItem) =>
        bentoHeadH +
        wrap(n.title, bentoTextW, labelSize, true).length * labelSize * 1.3 +
        titleGap +
        wrap(n.detail, bentoTextW, bodySize).length * bodySize * 1.3;
      const rowHeights: number[] = [];
      for (let i = 0; i < nodes.length; i += 2) {
        const row = nodes.slice(i, i + 2);
        const h =
          Math.max(...row.map((n) => bentoTextHeight(n)), Math.round(156 * s)) +
          padY * 2;
        rowHeights.push(h);
      }
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
        isEditorialBento: true,
        bentoHeadH,
        bentoTextHeight,
        rowHeights,
        minTotal,
      };
    }

    const isTimeline = layout === "timeline",
      isChecklist = layout === "checklist",
      isStatBars = layout === "stat-bars",
      isPyramid = layout === "pyramid-tiers",
      isFlowchart = layout === "zigzag-flowchart";
    const baseTextW =
      contentW -
      (isChecklist ? 228 : isTimeline ? 250 : isFlowchart ? 260 : 196);
    const barExtraH = isStatBars ? Math.round(30 * s) : 0;
    const flowHeaderH = isFlowchart ? Math.round(52 * s) : 0;
    const flowStepGap = isFlowchart ? Math.max(minGap, Math.round(36 * s)) : minGap;
    const minCardH = Math.round((isChecklist ? 128 : 114) * s);
    const rowHeights = nodes.map((n, idx) => {
      const pyrInset = isPyramid
        ? Math.round(
            ((nodes.length - 1 - idx) / Math.max(1, nodes.length - 1)) * 108,
          )
        : 0;
      const rowTW = Math.max(240, baseTextW - pyrInset * 2);
      return Math.max(minCardH, textHeight(n, rowTW) + barExtraH + padY * 2);
    });
    const minTotal =
      flowHeaderH +
      rowHeights.reduce((a, b) => a + b, 0) +
      Math.max(0, rowHeights.length - 1) * flowStepGap;
    return {
      s,
      labelSize,
      bodySize,
      badgeSize,
      badgeOffset,
      titleGap,
      padY,
      minGap: flowStepGap,
      textHeight,
      flowHeaderH,
      barExtraH,
      rowHeights,
      minTotal,
    };
  };

  const availBodyH = Math.max(120, footerY - 28 - calloutReserve - top);
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
    const c = isHex(n.accentHex) ? n.accentHex : colors[i % 4];
    const badge = textBlock(
      n.badge.trim() || String(i + 1).padStart(2, "0"),
      x,
      y,
      w,
      badgeSize,
      c,
      true,
      false,
      fontStack,
    );
    const title = textBlock(
      n.title,
      x,
      y + badgeOffset,
      w,
      labelSize,
      ink,
      true,
      false,
      fontStack,
    );
    const detail = textBlock(
      n.detail,
      x,
      y + badgeOffset + title.height + titleGap,
      w,
      bodySize,
      muted,
      false,
      false,
      fontStack,
    );
    const textNodes: JSXNode[] = [];
    if (badgeOffset) textNodes.push(badge.node);
    const combinedStatText = `${n.title} ${n.detail}`;
    const pctStatMatch = combinedStatText.match(/\b(\d{1,3})\s*%/);
    const ratioStatMatch = combinedStatText.match(
      /\b(\d{1,4})\s+of\s+(\d{1,4})\b/i,
    );
    let statPct: number | undefined;
    if (pctStatMatch) {
      const val = Number(pctStatMatch[1]);
      if (val > 0 && val <= 100) statPct = val;
    } else if (ratioStatMatch) {
      const num = Number(ratioStatMatch[1]);
      const den = Number(ratioStatMatch[2]);
      if (den > 0 && num <= den) statPct = Math.round((num / den) * 100);
    }
    if (typeof statPct === "number" && w >= 240 && !isSyntheticOverflow) {
      const barW = Math.min(126, Math.round(w * 0.28));
      const barX = x + w - barW;
      const barY = y + 3;
      const fillW = Math.max(10, Math.round((barW * statPct) / 100));
      textNodes.push(
        rect(barX, barY, barW, 8, c, 4, { opacity: 0.18 }),
        rect(barX, barY, fillW, 8, c, 4),
      );
    }
    textNodes.push(title.node, detail.node);
    bodyParts.push(
      el(
        "g",
        { "data-layer-id": `node-${i}`, style: "cursor:pointer" },
        ...textNodes,
      ),
    );
    return badgeOffset + title.height + titleGap + detail.height;
  };

  const slack = Math.max(0, availBodyH - minTotal);
  let bottom = top;

  if (layout === "pipeline-flow") {
    const cols = Math.min(3, Math.max(2, nodes.length));
    const flowNodes = nodes.slice(0, cols);
    const arrowGap = 44;
    const colW = Math.floor((contentW - arrowGap * (cols - 1)) / cols);
    const colTextW = colW - 44;
    const cardH = Math.min(
      availBodyH,
      rowHeights[0] + Math.round(slack * 0.45),
    );
    const startY = top + Math.min(28, Math.round(slack * 0.2));
    flowNodes.forEach((n, idx) => {
      const x = M + idx * (colW + arrowGap);
      const c = isHex(n.accentHex) ? n.accentHex : colors[idx % 4];
      surfaceRectInto(
        bodyParts,
        x,
        startY,
        colW,
        cardH,
        idx === 1,
        c,
        `node-${idx}`,
      );
      const pillLabel = (
        n.badge.trim() ||
        (idx === 0 ? "START" : idx === cols - 1 ? "RESULT" : `STAGE ${idx + 1}`)
      ).toUpperCase();
      const pillW = Math.max(84, widthOf(pillLabel, 14, true) + 28);
      bodyParts.push(
        rect(
          x + Math.round((colW - pillW) / 2),
          startY - 14,
          pillW,
          28,
          c,
          14,
        ),
        textBlock(
          pillLabel,
          x + Math.round((colW - pillW) / 2),
          startY - 8,
          pillW,
          13,
          contrast("#FFFFFF", c) >= contrast("#081322", c)
            ? "#FFFFFF"
            : "#081322",
          true,
          true,
          fontStack,
        ).node,
      );
      medallionInto(
        bodyParts,
        n,
        x + Math.round(colW / 2),
        startY + 52,
        Math.max(22, Math.round(28 * fitScale)),
        c,
        idx,
      );
      const titleNode = textBlock(
        n.title,
        x + 22,
        startY + 94,
        colTextW,
        labelSize,
        ink,
        true,
        true,
        fontStack,
      );
      const detailNode = textBlock(
        n.detail,
        x + 22,
        startY + 94 + titleNode.height + titleGap,
        colTextW,
        bodySize,
        muted,
        false,
        false,
        fontStack,
      );
      bodyParts.push(
        el(
          "g",
          { "data-layer-id": `node-${idx}`, style: "cursor:pointer" },
          titleNode.node,
          detailNode.node,
        ),
      );
      if (idx < cols - 1) {
        const ax = x + colW + 8;
        const ay = startY + Math.round(cardH / 2);
        bodyParts.push(
          path(
            `M ${ax} ${ay} H ${ax + arrowGap - 18}`,
            colors[(idx + 1) % 4],
            4,
          ),
          path(
            `M ${ax + arrowGap - 24} ${ay - 8} L ${ax + arrowGap - 14} ${ay} L ${ax + arrowGap - 24} ${ay + 8}`,
            colors[(idx + 1) % 4],
            4,
          ),
        );
      }
    });
    bottom = startY + cardH;
  } else if (layout === "split-equation") {
    const pair = nodes.slice(0, 2);
    const hubGap = 96;
    const colW = Math.floor((contentW - hubGap) / 2);
    const colTextW = colW - 48;
    const cardH = Math.min(
      availBodyH,
      rowHeights[0] + Math.round(slack * 0.45),
    );
    const startY = top + Math.min(28, Math.round(slack * 0.2));
    pair.forEach((n, idx) => {
      const x = M + idx * (colW + hubGap);
      const c = isHex(n.accentHex) ? n.accentHex : colors[idx % 4];
      surfaceRectInto(
        bodyParts,
        x,
        startY,
        colW,
        cardH,
        idx === 1,
        c,
        `node-${idx}`,
      );
      const pillLabel = (n.badge.trim() || `PART ${idx + 1}`).toUpperCase();
      const pillW = Math.max(96, widthOf(pillLabel, 14, true) + 28);
      bodyParts.push(
        rect(
          x + Math.round((colW - pillW) / 2),
          startY - 14,
          pillW,
          28,
          c,
          14,
        ),
        textBlock(
          pillLabel,
          x + Math.round((colW - pillW) / 2),
          startY - 8,
          pillW,
          13,
          contrast("#FFFFFF", c) >= contrast("#081322", c)
            ? "#FFFFFF"
            : "#081322",
          true,
          true,
          fontStack,
        ).node,
      );
      medallionInto(
        bodyParts,
        n,
        x + 54,
        startY + 52,
        Math.max(22, Math.round(28 * fitScale)),
        c,
        idx,
      );
      const titleNode = textBlock(
        n.title,
        x + 96,
        startY + 34,
        colTextW - 72,
        labelSize,
        ink,
        true,
        false,
        fontStack,
      );
      const detailNode = textBlock(
        n.detail,
        x + 24,
        startY + Math.max(94, 42 + titleNode.height + titleGap),
        colTextW,
        bodySize,
        muted,
        false,
        false,
        fontStack,
      );
      bodyParts.push(
        el(
          "g",
          { "data-layer-id": `node-${idx}`, style: "cursor:pointer" },
          titleNode.node,
          detailNode.node,
        ),
      );
    });
    const plusCx = W / 2;
    const plusCy = startY + Math.round(cardH / 2);
    bodyParts.push(
      circle(plusCx, plusCy, 34, colors[3], {
        ...shadow,
        stroke: surface,
        strokeWidth: 4,
      }),
      path(
        `M ${plusCx - 13} ${plusCy} H ${plusCx + 13} M ${plusCx} ${plusCy - 13} V ${plusCy + 13}`,
        contrast("#FFFFFF", colors[3]) >= contrast("#081322", colors[3])
          ? "#FFFFFF"
          : "#081322",
        5,
      ),
    );
    bottom = startY + cardH;
  } else if (layout === "hierarchy-tree") {
    const rootH = (chosen as { rootH?: number }).rootH || Math.round(52 * fitScale);
    const busH = (chosen as { busH?: number }).busH || Math.round(46 * fitScale);
    const topRowCount =
      (chosen as { topRowCount?: number }).topRowCount ||
      (nodes.length <= 4 ? nodes.length : Math.ceil(nodes.length / 2));
    const colGap = 22;
    const rowCount = rowHeights.length;
    const extraCardH = Math.min(
      84,
      Math.round((slack * 0.6) / Math.max(1, rowCount)),
    );
    const rowGap = minGap + Math.min(28, Math.round((slack * 0.2) / Math.max(1, rowCount)));
    const rootW = Math.min(540, Math.round(contentW * 0.44));
    const rootX = Math.round((W - rootW) / 2);
    const rootY = top + Math.min(18, Math.round(slack * 0.12));
    const rootLabel = (
      config.centerLabel ||
      config.headline.split(":")[0] ||
      "Core Architecture"
    )
      .trim()
      .slice(0, 38);
    // Root node capsule
    bodyParts.push(
      rect(rootX, rootY, rootW, rootH, accent, 16, {
        ...shadow,
        stroke: colors[1],
        strokeWidth: 2,
      }),
      textBlock(
        rootLabel,
        rootX + 18,
        rootY + Math.max(10, Math.round((rootH - 22) / 2)),
        rootW - 36,
        Math.max(16, Math.round(21 * fitScale)),
        contrast("#FFFFFF", accent) >= contrast("#081322", accent)
          ? "#FFFFFF"
          : "#081322",
        true,
        true,
        fontStack,
      ).node,
    );
    const firstRowY = rootY + rootH + busH;
    const busY = rootY + rootH + Math.round(busH * 0.52);
    const firstSliceCount = Math.min(topRowCount, nodes.length);
    const firstColW = Math.floor(
      (contentW - colGap * (firstSliceCount - 1)) / firstSliceCount,
    );
    const firstCx = M + Math.round(firstColW / 2);
    const lastCx =
      M + (firstSliceCount - 1) * (firstColW + colGap) + Math.round(firstColW / 2);
    // Orthogonal trunk & distribution bus
    bodyParts.push(
      path(`M ${W / 2} ${rootY + rootH} V ${busY}`, accent, 3.5),
      path(`M ${firstCx} ${busY} H ${lastCx}`, accent, 3.5),
    );
    let y = firstRowY;
    for (let r = 0; r < rowCount; r++) {
      const slice = nodes.slice(r * topRowCount, (r + 1) * topRowCount);
      const cols = slice.length;
      const colW = Math.floor((contentW - colGap * (cols - 1)) / cols);
      const colTextW = Math.max(150, colW - 36);
      const h = rowHeights[r] + extraCardH;
      slice.forEach((n, k) => {
        const idx = r * topRowCount + k;
        const x = M + k * (colW + colGap);
        const cx = x + Math.round(colW / 2);
        const c = isHex(n.accentHex) ? n.accentHex : colors[idx % 4];
        if (r === 0) {
          bodyParts.push(
            path(`M ${cx} ${busY} V ${y}`, c, 3),
            circle(cx, y, 6, c),
          );
        } else {
          bodyParts.push(
            path(`M ${cx} ${y - rowGap} V ${y}`, c, 2.5, {
              strokeDasharray: "4 4",
              opacity: 0.65,
            }),
            circle(cx, y, 5, c),
          );
        }
        surfaceRectInto(bodyParts, x, y, colW, h, r % 2 === 1, c, `node-${idx}`);
        medallionInto(
          bodyParts,
          n,
          cx,
          y + Math.round(34 * fitScale),
          Math.max(18, Math.round(23 * fitScale)),
          c,
          idx,
        );
        const textStartY = y + Math.round(64 * fitScale);
        const titleNode = textBlock(
          n.title,
          x + 18,
          textStartY,
          colTextW,
          labelSize,
          ink,
          true,
          true,
          fontStack,
        );
        const detailNode = textBlock(
          n.detail,
          x + 18,
          textStartY + titleNode.height + titleGap,
          colTextW,
          bodySize,
          muted,
          false,
          true,
          fontStack,
        );
        bodyParts.push(
          el(
            "g",
            { "data-layer-id": `node-${idx}`, style: "cursor:pointer" },
            titleNode.node,
            detailNode.node,
          ),
        );
      });
      y += h + rowGap;
    }
    bottom = y - rowGap;
  } else if (layout === "donut-breakdown" || layout === "cycle-wheel") {
    const isDonut = layout === "donut-breakdown";
    const visualZoneH =
      (chosen as { visualZoneH?: number }).visualZoneH ||
      Math.round(210 * fitScale);
    const colGap = 22;
    const cellW = (contentW - colGap) / 2;
    const textW = Math.max(170, cellW - 102);
    const pairCount = Math.max(1, rowHeights.length);
    const extraGap = Math.min(
      28,
      Math.round((slack * 0.24) / Math.max(1, pairCount)),
    );
    const rowGap = minGap + extraGap;
    const extraCardH = Math.min(
      68,
      Math.round(
        (slack - extraGap * Math.max(1, pairCount)) / Math.max(1, pairCount),
      ),
    );
    const cx = W / 2;
    const cy = top + Math.round(visualZoneH / 2);
    const radius = Math.min(88, Math.round(visualZoneH * 0.39));

    if (isDonut) {
      // Multi-segment SVG Donut Chart using circumference dash segments
      const strokeW = Math.max(22, Math.round(radius * 0.34));
      const circ = 2 * Math.PI * radius;
      const rawWeights = nodes.map((n) => {
        const m = `${n.title} ${n.detail}`.match(/\b(\d{1,3})\s*%/);
        return m ? Math.max(8, Math.min(100, Number(m[1]))) : 1;
      });
      const totalW = rawWeights.reduce((a, b) => a + b, 0) || 1;
      let offset = 0;
      const gapLen = 6;
      bodyParts.push(
        circle(cx, cy, radius, "none", {
          stroke: muted,
          strokeWidth: strokeW,
          opacity: 0.14,
        }),
      );
      nodes.forEach((n, idx) => {
        const segLen = Math.max(
          10,
          (rawWeights[idx] / totalW) * circ - gapLen,
        );
        const c = isHex(n.accentHex) ? n.accentHex : colors[idx % 4];
        bodyParts.push(
          circle(cx, cy, radius, "none", {
            stroke: c,
            strokeWidth: strokeW,
            strokeDasharray: `${segLen.toFixed(1)} ${circ.toFixed(1)}`,
            strokeDashoffset: (-offset).toFixed(1),
            transform: `rotate(-90 ${cx} ${cy})`,
          }),
        );
        // Outer radial index dot on ring midline
        const midAngle =
          -Math.PI / 2 + ((offset + segLen / 2) / circ) * Math.PI * 2;
        const badgeR = radius + strokeW * 0.72 + 12;
        const bx = cx + Math.cos(midAngle) * badgeR;
        const by = cy + Math.sin(midAngle) * badgeR;
        bodyParts.push(
          circle(bx, by, 14, c, { stroke: surface, strokeWidth: 2 }),
          textBlock(
            String(idx + 1),
            bx - 12,
            by - 9,
            24,
            13,
            contrast("#FFFFFF", c) >= contrast("#081322", c)
              ? "#FFFFFF"
              : "#081322",
            true,
            true,
            fontStack,
          ).node,
        );
        offset += (rawWeights[idx] / totalW) * circ;
      });
      // Center summary hub
      const innerR = Math.max(38, radius - Math.round(strokeW * 0.65));
      bodyParts.push(
        circle(cx, cy, innerR, surface, {
          ...shadow,
          stroke: accent,
          strokeWidth: 2,
        }),
        textBlock(
          String(nodes.length),
          cx - 32,
          cy - 22,
          64,
          28,
          accent,
          true,
          true,
          fontStack,
        ).node,
        textBlock(
          (config.centerLabel || "PILLARS").slice(0, 12).toUpperCase(),
          cx - 42,
          cy + 8,
          84,
          12,
          muted,
          true,
          true,
          fontStack,
        ).node,
      );
    } else {
      // Continuous Flywheel Cycle Loop with directional arrows between orbital nodes
      bodyParts.push(
        circle(cx, cy, radius, "none", {
          stroke: accent,
          strokeWidth: 5,
          opacity: 0.32,
        }),
        circle(cx, cy, Math.round(radius * 0.48), surface, {
          ...shadow,
          stroke: accent,
          strokeWidth: 2.5,
        }),
        textBlock(
          (config.centerLabel || "FLYWHEEL").slice(0, 12).toUpperCase(),
          cx - 46,
          cy - 9,
          92,
          14,
          accent,
          true,
          true,
          fontStack,
        ).node,
      );
      nodes.forEach((n, idx) => {
        const a = -Math.PI / 2 + (Math.PI * 2 * idx) / nodes.length;
        const nx = cx + Math.cos(a) * radius;
        const ny = cy + Math.sin(a) * radius;
        const c = isHex(n.accentHex) ? n.accentHex : colors[idx % 4];
        // Directional chevron halfway to next orbital node
        const midA = a + Math.PI / nodes.length;
        const ax = cx + Math.cos(midA) * radius;
        const ay = cy + Math.sin(midA) * radius;
        const deg = Math.round(((midA + Math.PI / 2) * 180) / Math.PI);
        bodyParts.push(
          el(
            "g",
            { transform: `translate(${ax.toFixed(1)}, ${ay.toFixed(1)}) rotate(${deg})` },
            path("M -6 -5 L 5 0 L -6 5", c, 3.2),
          ),
        );
        medallionInto(
          bodyParts,
          n,
          nx,
          ny,
          Math.max(20, Math.round(24 * fitScale)),
          c,
          idx,
        );
      });
    }

    // Lower 2-column color-coded breakdown cards
    let y = top + visualZoneH + rowGap;
    for (let i = 0; i < nodes.length; i += 2) {
      const slice = nodes.slice(i, i + 2);
      const h = rowHeights[Math.floor(i / 2)] + extraCardH;
      slice.forEach((n, k) => {
        const idx = i + k;
        const isSolo = slice.length === 1;
        const wCard = isSolo ? contentW : cellW;
        const x = isSolo ? M : M + k * (cellW + colGap);
        const tw = isSolo ? contentW - 116 : textW;
        const c = isHex(n.accentHex) ? n.accentHex : colors[idx % 4];
        const ntH = textHeight(n, tw);
        const textY = y + Math.max(padY, Math.round((h - ntH) / 2));
        surfaceRectInto(bodyParts, x, y, wCard, h, k === 1, c, `node-${idx}`);
        medallionInto(
          bodyParts,
          n,
          x + 44,
          y + h / 2,
          Math.max(20, Math.round(24 * fitScale)),
          c,
          idx,
        );
        drawText(n, x + 84, textY, tw, idx);
      });
      y += h + rowGap;
    }
    bottom = y - rowGap;
  } else if (layout === "kpi-bento") {
    const colGap = 26;
    const heroW =
      (chosen as { heroW?: number }).heroW || Math.round(contentW * 0.39);
    const rightW =
      (chosen as { rightW?: number }).rightW || contentW - heroW - colGap;
    const useRightGrid = Boolean(
      (chosen as { useRightGrid?: boolean }).useRightGrid,
    );
    const supportNodes = nodes.slice(1);
    const totalH = Math.min(
      availBodyH,
      minTotal + Math.round(slack * 0.65),
    );
    const startY = top + Math.min(20, Math.round(slack * 0.16));

    // Left Hero Spotlight Card (Node 0) with decorative sparkline curve
    const hero = nodes[0];
    if (hero) {
      const hc = isHex(hero.accentHex) ? hero.accentHex : colors[0];
      surfaceRectInto(
        bodyParts,
        M,
        startY,
        heroW,
        totalH,
        true,
        hc,
        "node-0",
      );
      bodyParts.push(rect(M + 24, startY, heroW - 48, 5, hc, 2.5));
      medallionInto(
        bodyParts,
        hero,
        M + 58,
        startY + 56,
        Math.max(26, Math.round(32 * fitScale)),
        hc,
        0,
      );
      const pillTxt = (hero.badge.trim() || "CORE SIGNAL").toUpperCase();
      const pillW = Math.max(82, widthOf(pillTxt, 13, true) + 24);
      bodyParts.push(
        rect(M + heroW - 24 - pillW, startY + 38, pillW, 28, hc, 14),
        textBlock(
          pillTxt,
          M + heroW - 24 - pillW,
          startY + 44,
          pillW,
          13,
          contrast("#FFFFFF", hc) >= contrast("#081322", hc)
            ? "#FFFFFF"
            : "#081322",
          true,
          true,
          fontStack,
        ).node,
      );
      const heroTitleSize = Math.round(labelSize * 1.1);
      const heroTitleNode = textBlock(
        hero.title,
        M + 24,
        startY + Math.round(104 * fitScale),
        heroW - 48,
        heroTitleSize,
        ink,
        true,
        false,
        fontStack,
      );
      const heroDetailNode = textBlock(
        hero.detail,
        M + 24,
        startY + Math.round(104 * fitScale) + heroTitleNode.height + titleGap,
        heroW - 48,
        bodySize,
        muted,
        false,
        false,
        fontStack,
      );
      bodyParts.push(
        el(
          "g",
          { "data-layer-id": "node-0", style: "cursor:pointer" },
          heroTitleNode.node,
          heroDetailNode.node,
        ),
      );
      // Decorative telemetry sparkline at bottom of hero tile when room allows
      const sparkY = startY + totalH - 36;
      const textBottom =
        startY +
        Math.round(104 * fitScale) +
        heroTitleNode.height +
        titleGap +
        heroDetailNode.height;
      if (sparkY - textBottom >= 26) {
        const sx = M + 28;
        const sw = heroW - 56;
        bodyParts.push(
          path(
            `M ${sx} ${sparkY + 12} C ${sx + sw * 0.22} ${sparkY + 4}, ${sx + sw * 0.42} ${sparkY - 12}, ${sx + sw * 0.65} ${sparkY - 2} S ${sx + sw * 0.88} ${sparkY - 18}, ${sx + sw} ${sparkY - 22}`,
            hc,
            3.5,
            { opacity: 0.72 },
          ),
          circle(sx + sw, sparkY - 22, 6, colors[1]),
        );
      }
    }

    // Right Supporting Insight Tiles
    const rxBase = M + heroW + colGap;
    const rRows = Math.max(1, rowHeights.length);
    const rightRowGap = minGap;
    const rightSlack = Math.max(
      0,
      totalH -
        rowHeights.reduce((a, b) => a + b, 0) -
        Math.max(0, rRows - 1) * rightRowGap,
    );
    const extraRH = Math.floor(rightSlack / rRows);
    let ry = startY;
    if (useRightGrid) {
      const tileGap = 18;
      const tileW = (rightW - tileGap) / 2;
      const tileTextW = Math.max(160, tileW - 40);
      for (let i = 0; i < supportNodes.length; i += 2) {
        const slice = supportNodes.slice(i, i + 2);
        const h = rowHeights[Math.floor(i / 2)] + extraRH;
        slice.forEach((n, k) => {
          const idx = 1 + i + k;
          const isSolo = slice.length === 1;
          const wTile = isSolo ? rightW : tileW;
          const x = isSolo ? rxBase : rxBase + k * (tileW + tileGap);
          const tw = isSolo ? rightW - 44 : tileTextW;
          const c = isHex(n.accentHex) ? n.accentHex : colors[idx % 4];
          surfaceRectInto(bodyParts, x, ry, wTile, h, false, c, `node-${idx}`);
          medallionInto(
            bodyParts,
            n,
            x + 34,
            ry + 30,
            Math.max(16, Math.round(18 * fitScale)),
            c,
            idx,
          );
          const tNode = textBlock(
            n.title,
            x + 62,
            ry + 18,
            tw - 26,
            labelSize,
            ink,
            true,
            false,
            fontStack,
          );
          const dNode = textBlock(
            n.detail,
            x + 20,
            ry + Math.max(54, 22 + tNode.height + titleGap),
            tw,
            bodySize,
            muted,
            false,
            false,
            fontStack,
          );
          bodyParts.push(
            el(
              "g",
              { "data-layer-id": `node-${idx}`, style: "cursor:pointer" },
              tNode.node,
              dNode.node,
            ),
          );
        });
        ry += h + rightRowGap;
      }
    } else {
      const tileTextW = Math.max(180, rightW - 108);
      supportNodes.forEach((n, k) => {
        const idx = 1 + k;
        const h = rowHeights[k] + extraRH;
        const c = isHex(n.accentHex) ? n.accentHex : colors[idx % 4];
        const ntH = textHeight(n, tileTextW);
        const textY = ry + Math.max(padY, Math.round((h - ntH) / 2));
        surfaceRectInto(bodyParts, rxBase, ry, rightW, h, false, c, `node-${idx}`);
        medallionInto(
          bodyParts,
          n,
          rxBase + 46,
          ry + h / 2,
          Math.max(20, Math.round(24 * fitScale)),
          c,
          idx,
        );
        drawText(n, rxBase + 88, textY, tileTextW, idx);
        ry += h + rightRowGap;
      });
    }
    bottom = startY + totalH;
  } else if (layout === "comparison" || layout === "before-after") {
    const isBeforeAfter = layout === "before-after";
    const gap = isBeforeAfter ? 64 : 38,
      cellW = (contentW - gap) / 2;
    const labels =
      config.comparisonLabels ||
      (isBeforeAfter
        ? ["Before · Legacy State", "After · Optimized Result"]
        : ["Perspective A", "Perspective B"]);
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
      const colColor = isBeforeAfter
        ? k === 0
          ? colors[3]
          : colors[1]
        : colors[k];
      surfaceRectInto(
        bodyParts,
        M + k * (cellW + gap),
        startY,
        cellW,
        labelH,
        true,
        colColor,
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
          false,
          fontStack,
        ).node,
      );
    });
    // Central VS or Transformation Arrow medallion between the two column headers
    const vsCx = W / 2,
      vsCy = startY + labelH / 2;
    if (isBeforeAfter) {
      bodyParts.push(
        circle(vsCx, vsCy, 24, colors[1], {
          ...shadow,
          stroke: surface,
          strokeWidth: 3,
        }),
        path(
          `M ${vsCx - 8} ${vsCy} H ${vsCx + 6} M ${vsCx + 1} ${vsCy - 6} L ${vsCx + 8} ${vsCy} L ${vsCx + 1} ${vsCy + 6}`,
          contrast("#FFFFFF", colors[1]) >= contrast("#081322", colors[1])
            ? "#FFFFFF"
            : "#081322",
          3.2,
        ),
      );
    } else {
      bodyParts.push(
        circle(vsCx, vsCy, 22, surface, {
          ...shadow,
          stroke: accent,
          strokeWidth: 2,
        }),
        textBlock(
          "VS",
          vsCx - 18,
          vsCy - 10,
          36,
          15,
          accent,
          true,
          true,
          fontStack,
        ).node,
      );
    }
    let y = startY + labelH + rowGap;
    const textW = cellW - 118;
    for (let i = 0; i < nodes.length; i += 2) {
      const row = nodes.slice(i, i + 2);
      const h = rowHeights[Math.floor(i / 2)] + extraCardH;
      if (row.length === 2) {
        if (isBeforeAfter) {
          const midY = y + h / 2;
          bodyParts.push(
            path(`M ${M + cellW + 4} ${midY} H ${M + cellW + gap - 4}`, colors[1], 3),
            circle(W / 2, midY, 16, colors[1]),
            path(
              `M ${W / 2 - 5} ${midY} H ${W / 2 + 4} M ${W / 2 + 1} ${midY - 4} L ${W / 2 + 6} ${midY} L ${W / 2 + 1} ${midY + 4}`,
              contrast("#FFFFFF", colors[1]) >= contrast("#081322", colors[1])
                ? "#FFFFFF"
                : "#081322",
              2.6,
            ),
          );
        } else {
          bodyParts.push(
            path(`M ${M + cellW} ${y + h / 2} H ${M + cellW + gap}`, accent, 2, {
              strokeDasharray: "4 4",
              opacity: 0.45,
            }),
            circle(W / 2, y + h / 2, 5, colors[3]),
          );
        }
      }
      row.forEach((n, k) => {
        const idx = i + k;
        const isSoloAfter = isBeforeAfter && row.length === 1;
        const wCard = isSoloAfter ? contentW : cellW;
        const x = isSoloAfter ? M : M + k * (cellW + gap);
        const tw = isSoloAfter ? contentW - 140 : textW;
        const ntH = textHeight(n, tw);
        const textY = y + Math.max(padY, Math.round((h - ntH) / 2));
        const colAccent = isBeforeAfter
          ? k === 0 && !isSoloAfter
            ? colors[3]
            : colors[1]
          : colors[k];
        const c = isHex(n.accentHex) ? n.accentHex : colAccent;
        surfaceRectInto(bodyParts, x, y, wCard, h, isBeforeAfter && k === 1, c, `node-${idx}`);
        medallionInto(
          bodyParts,
          n,
          x + 52,
          y + h / 2,
          Math.max(20, Math.round(26 * fitScale)),
          c,
          idx,
        );
        drawText(n, x + 96, textY, tw, idx);
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
    const cy =
        top + orbitRy + Math.round(20 * fitScale) + Math.round(hubExtra * 0.45),
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
      const c = isHex(n.accentHex) ? n.accentHex : colors[i % 4];
      bodyParts.push(
        path(`M ${cx} ${cy} L ${x} ${y}`, c, 2, { opacity: 0.3 }),
      );
      medallionInto(
        bodyParts,
        n,
        x,
        y,
        Math.max(24, Math.round(31 * fitScale)),
        c,
        i,
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
      fontStack,
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
      const c = isHex(n.accentHex) ? n.accentHex : colors[i % 4];
      const ntH = textHeight(n, textW);
      const textY = y + Math.max(padY, Math.round((h - ntH) / 2));
      surfaceRectInto(
        bodyParts,
        M,
        y,
        contentW,
        h,
        i % 2 === 0,
        c,
        `node-${i}`,
      );
      bodyParts.push(rect(M, y + 14, 5, Math.max(16, h - 28), c, 2));
      drawText(n, M + 28, textY, textW, i);
      medallionInto(
        bodyParts,
        n,
        W - M - 58,
        y + h / 2,
        Math.max(24, Math.round(30 * fitScale)),
        c,
        i,
      );
      y += h + rowGap;
    });
    bottom = y - rowGap;
  } else if ("isEditorialBento" in chosen && chosen.isEditorialBento) {
    const colGap = 28;
    const cellW = (contentW - colGap) / 2;
    const bentoTextW = cellW - 48;
    const bentoHeadH = chosen.bentoHeadH!;
    const bentoTextHeight = chosen.bentoTextHeight!;
    const pairCount = Math.max(1, rowHeights.length);
    const extraGap = Math.min(
      36,
      Math.round((slack * 0.25) / Math.max(1, pairCount - 1 || 1)),
    );
    const rowGap = minGap + extraGap;
    const slackAfterGaps = Math.max(
      0,
      slack - extraGap * Math.max(0, pairCount - 1),
    );
    const extraCardH = Math.min(
      96,
      Math.round((slackAfterGaps * 0.65) / pairCount),
    );
    const topLead = Math.min(
      42,
      Math.round(Math.max(0, slackAfterGaps - extraCardH * pairCount) * 0.35),
    );
    let y = top + topLead;
    for (let i = 0; i < nodes.length; i += 2) {
      const row = nodes.slice(i, i + 2);
      const h = rowHeights[Math.floor(i / 2)] + extraCardH;
      row.forEach((n, k) => {
        const idx = i + k;
        const x = M + k * (cellW + colGap);
        const c = isHex(n.accentHex) ? n.accentHex : colors[idx % 4];
        surfaceRectInto(
          bodyParts,
          x,
          y,
          cellW,
          h,
          idx % 2 === 0,
          c,
          `node-${idx}`,
        );
        bodyParts.push(rect(x + 24, y, cellW - 48, 4, c, 2));
        medallionInto(
          bodyParts,
          n,
          x + 46,
          y + 42,
          Math.max(18, Math.round(23 * fitScale)),
          c,
          idx,
        );
        const badgeLabel = n.badge.trim() || String(idx + 1).padStart(2, "0");
        const pillW = Math.max(52, widthOf(badgeLabel, badgeSize, true) + 22);
        bodyParts.push(
          rect(x + cellW - 22 - pillW, y + 25, pillW, 30, surface, 15, {
            stroke: c,
            strokeOpacity: 0.55,
            strokeWidth: 1.5,
          }),
          textBlock(
            badgeLabel,
            x + cellW - 22 - pillW,
            y + 31,
            pillW,
            badgeSize,
            c,
            true,
            true,
            fontStack,
          ).node,
        );
        const contentStartY =
          y + Math.max(padY, Math.round((h - bentoTextHeight(n)) / 2)) + bentoHeadH;
        const titleNode = textBlock(
          n.title,
          x + 24,
          contentStartY,
          bentoTextW,
          labelSize,
          ink,
          true,
          false,
          fontStack,
        );
        const detailNode = textBlock(
          n.detail,
          x + 24,
          contentStartY + titleNode.height + titleGap,
          bentoTextW,
          bodySize,
          muted,
          false,
          false,
          fontStack,
        );
        bodyParts.push(
          el(
            "g",
            { "data-layer-id": `node-${idx}`, style: "cursor:pointer" },
            titleNode.node,
            detailNode.node,
          ),
        );
      });
      y += h + rowGap;
    }
    bottom = y - rowGap;
  } else {
    const isTimeline = layout === "timeline",
      isChecklist = layout === "checklist",
      isRibbon = layout === "ribbon",
      isFunnel = layout === "funnel-stages",
      isStatBars = layout === "stat-bars",
      isPyramid = layout === "pyramid-tiers",
      isFlowchart = layout === "zigzag-flowchart";
    const textW =
      contentW -
      (isChecklist ? 228 : isTimeline ? 250 : isFlowchart ? 260 : 196);
    const extraGap = Math.min(
      48,
      Math.round((slack * 0.34) / Math.max(1, nodes.length - 1)),
    );
    const rowGap = minGap + extraGap;
    const slackAfterGaps = Math.max(
      0,
      slack - extraGap * Math.max(0, nodes.length - 1),
    );
    const cardShareRatio = nodes.length <= 3 ? 0.56 : 0.72;
    const extraCardH = Math.min(
      110,
      Math.round((slackAfterGaps * cardShareRatio) / Math.max(1, nodes.length)),
    );
    const remainingSlack = Math.max(
      0,
      slackAfterGaps - extraCardH * nodes.length,
    );
    const topLead = Math.min(
      76,
      Math.max(
        Math.min(18, remainingSlack),
        Math.round(remainingSlack * 0.45),
      ),
    );
    let y = top + topLead;
    if (isStatBars) {
      // Subtle vertical statistical chart gridlines spanning behind bar rows
      const chartLeft = M + 150;
      const chartW = contentW - 180;
      const chartH =
        rowHeights.reduce((a, b) => a + b + extraCardH, 0) +
        Math.max(0, nodes.length - 1) * rowGap;
      [0.25, 0.5, 0.75, 1].forEach((frac) => {
        const gx = Math.round(chartLeft + chartW * frac);
        bodyParts.push(
          path(`M ${gx} ${y - 6} V ${y + chartH + 6}`, muted, 1.5, {
            strokeDasharray: "4 6",
            opacity: 0.2,
          }),
        );
      });
    }
    if (isFlowchart) {
      const flowH = (chosen as { flowHeaderH?: number }).flowHeaderH || Math.round(48 * fitScale);
      const pillW = 144;
      const pillX = Math.round(W / 2 - pillW / 2);
      bodyParts.push(
        rect(pillX, y, pillW, 34, accent, 17, { ...shadow }),
        textBlock(
          "START FLOW",
          pillX,
          y + 9,
          pillW,
          13,
          contrast("#FFFFFF", accent) >= contrast("#081322", accent)
            ? "#FFFFFF"
            : "#081322",
          true,
          true,
          fontStack,
        ).node,
        path(`M ${W / 2} ${y + 34} V ${y + flowH}`, accent, 3),
        path(`M ${W / 2 - 7} ${y + flowH - 8} L ${W / 2} ${y + flowH} L ${W / 2 + 7} ${y + flowH - 8}`, accent, 3),
      );
      y += flowH;
    }
    if (isTimeline && nodes.length > 1) {
      let trackY = y;
      for (let ti = 0; ti < nodes.length - 1; ti++) {
        const curH = rowHeights[ti] + extraCardH;
        const nextH = rowHeights[ti + 1] + extraCardH;
        const curCy = trackY + curH / 2;
        const nextCy = trackY + curH + rowGap + nextH / 2;
        const curCx = ti % 2 === 0 ? M + 42 : W - M - 42;
        const nextCx = (ti + 1) % 2 === 0 ? M + 42 : W - M - 42;
        const midY = Math.round((curCy + nextCy) / 2);
        bodyParts.push(
          path(
            `M ${curCx} ${curCy} C ${curCx} ${midY}, ${nextCx} ${midY}, ${nextCx} ${nextCy}`,
            accent,
            3.5,
            { strokeDasharray: "6 6", opacity: 0.32 },
          ),
        );
        trackY += curH + rowGap;
      }
    }
    nodes.forEach((n, i) => {
      const h = rowHeights[i] + extraCardH,
        c = isHex(n.accentHex) ? n.accentHex : colors[i % 4];
      const funnelInsetTop = isFunnel ? Math.min(110, i * 28) : 0;
      const funnelInsetBot = isFunnel ? Math.min(138, (i + 1) * 28) : 0;
      const pyrInsetTop = isPyramid
        ? Math.round(
            ((nodes.length - 1 - i) / Math.max(1, nodes.length - 1)) * 108,
          )
        : 0;
      const pyrInsetBot = isPyramid
        ? i === nodes.length - 1
          ? 0
          : Math.round(
              ((nodes.length - 1 - (i + 1)) / Math.max(1, nodes.length - 1)) *
                108,
            )
        : 0;
      const sideInset = isFunnel ? funnelInsetTop : isPyramid ? pyrInsetTop : 0;
      const rowX = M + sideInset;
      const rowW = contentW - sideInset * 2;
      const rowTextW = Math.max(240, textW - sideInset * 2);
      const ntH = textHeight(n, rowTextW);
      const textY = y + Math.max(padY, Math.round((h - ntH) / 2));
      const cy = y + h / 2;
      if (isTimeline) {
        const isOddStep = i % 2 === 1;
        const cardX = isOddStep ? M : M + 112;
        const cardW = contentW - 112;
        const milestoneCx = isOddStep ? W - M - 42 : M + 42;
        const armFromX = isOddStep ? cardX + cardW : milestoneCx + 32;
        const armToX = isOddStep ? milestoneCx - 32 : cardX;
        surfaceRectInto(
          bodyParts,
          cardX,
          y,
          cardW,
          h,
          isOddStep,
          c,
          `node-${i}`,
        );
        bodyParts.push(
          path(`M ${armFromX} ${cy} H ${armToX}`, c, 3, { opacity: 0.65 }),
          circle(milestoneCx, cy, 32, surface, {
            ...shadow,
            stroke: c,
            strokeWidth: 3.5,
          }),
          textBlock(
            String(i + 1).padStart(2, "0"),
            milestoneCx - 24,
            cy - 15,
            48,
            22,
            c,
            true,
            true,
            fontStack,
          ).node,
        );
        drawText(n, cardX + 26, textY, textW, i);
        medallionInto(
          bodyParts,
          n,
          cardX + cardW - 54,
          cy,
          Math.max(22, Math.round(30 * fitScale)),
          c,
          i,
        );
      } else if (isChecklist) {
        surfaceRectInto(
          bodyParts,
          M,
          y,
          contentW,
          h,
          i % 2 === 0,
          c,
          `node-${i}`,
        );
        if (/^Q\d+$/i.test(n.badge.trim())) {
          const badgeFg =
            contrast("#FFFFFF", c) >= contrast("#081322", c)
              ? "#FFFFFF"
              : "#081322";
          bodyParts.push(
            rect(M + 20, cy - 22, 48, 44, c, 12),
            textBlock(
              n.badge.trim(),
              M + 20,
              cy - 12,
              48,
              18,
              badgeFg,
              true,
              true,
              fontStack,
            ).node,
          );
        } else {
          bodyParts.push(
            rect(M + 24, cy - 21, 42, 42, c, 12),
            path(
              `m ${M + 34} ${cy} 8 8 15 -18`,
              light ? "#FFFFFF" : "#081322",
              4,
            ),
          );
        }
        drawText(n, M + 92, textY, textW, i);
        medallionInto(
          bodyParts,
          n,
          W - M - 62,
          cy,
          Math.max(26, Math.round(35 * fitScale)),
          c,
          i,
        );
      } else if (isStatBars) {
        // Dedicated Horizontal Bar Chart Row with real percentage extraction or qualitative rank meter (zero fake %!)
        surfaceRectInto(bodyParts, M, y, contentW, h, false, c, `node-${i}`);
        medallionInto(
          bodyParts,
          n,
          M + 64,
          cy,
          Math.max(28, Math.round(38 * fitScale)),
          c,
          i,
        );
        const pctMatch = `${n.title} ${n.detail}`.match(/\b(\d{1,3})\s*%/);
        const ratioMatch = `${n.title} ${n.detail}`.match(
          /\b(\d{1,4})\s+of\s+(\d{1,4})\b/i,
        );
        let fillRatio = Math.max(0.32, 0.94 - i * 0.13);
        let pillLabel = `RANK #${i + 1}`;
        if (pctMatch) {
          const val = Number(pctMatch[1]);
          if (val > 0 && val <= 100) {
            fillRatio = Math.max(0.14, val / 100);
            pillLabel = `${val}%`;
          }
        } else if (ratioMatch) {
          const num = Number(ratioMatch[1]);
          const den = Number(ratioMatch[2]);
          if (den > 0 && num <= den) {
            fillRatio = Math.max(0.14, num / den);
            pillLabel = `${num}/${den}`;
          }
        }
        const barX = M + 150;
        const barW = Math.max(180, contentW - 280);
        const barY = y + Math.max(14, Math.round(padY * 0.72));
        const fillW = Math.max(24, Math.round(barW * fillRatio));
        const pillW = Math.max(76, widthOf(pillLabel, 13, true) + 22);
        bodyParts.push(
          rect(barX, barY, barW, 14, c, 7, { opacity: 0.18 }),
          rect(barX, barY, fillW, 14, c, 7),
          rect(W - M - 20 - pillW, barY - 5, pillW, 24, c, 12),
          textBlock(
            pillLabel,
            W - M - 20 - pillW,
            barY,
            pillW,
            13,
            contrast("#FFFFFF", c) >= contrast("#081322", c)
              ? "#FFFFFF"
              : "#081322",
            true,
            true,
            fontStack,
          ).node,
        );
        const barTextY = barY + 26;
        const titleN = textBlock(
          n.title,
          barX,
          barTextY,
          contentW - 180,
          labelSize,
          ink,
          true,
          false,
          fontStack,
        );
        const detailN = textBlock(
          n.detail,
          barX,
          barTextY + titleN.height + titleGap,
          contentW - 180,
          bodySize,
          muted,
          false,
          false,
          fontStack,
        );
        bodyParts.push(
          el(
            "g",
            { "data-layer-id": `node-${i}`, style: "cursor:pointer" },
            titleN.node,
            detailN.node,
          ),
        );
      } else if (isPyramid) {
        // Geometric Stacked Pyramid Tiers widening from Apex (Tier 1) down to Base (Tier N)
        const tlX = M + pyrInsetTop;
        const trX = W - M - pyrInsetTop;
        const brX = W - M - pyrInsetBot;
        const blX = M + pyrInsetBot;
        bodyParts.push(
          el("polygon", {
            points: `${tlX},${y} ${trX},${y} ${brX},${y + h} ${blX},${y + h}`,
            fill: c,
            opacity: light ? 0.16 : 0.25,
            stroke: c,
            strokeWidth: 2.5,
          }),
        );
        surfaceRectInto(
          bodyParts,
          rowX,
          y + 4,
          rowW,
          Math.max(40, h - 8),
          i === 0,
          c,
          `node-${i}`,
        );
        if (i === 0) {
          // Apex crown triangle indicator above Tier 1
          bodyParts.push(
            el("polygon", {
              points: `${W / 2},${y - 16} ${W / 2 + 16},${y + 2} ${W / 2 - 16},${y + 2}`,
              fill: c,
            }),
          );
        }
        medallionInto(
          bodyParts,
          n,
          rowX + 58,
          cy,
          Math.max(24, Math.round(34 * fitScale)),
          c,
          i,
        );
        drawText(n, rowX + 132, textY, rowTextW, i);
      } else if (isFlowchart) {
        // Decision & Process Flowchart with alternating boxes and rotated diamond checkpoints
        const shiftX = i % 2 === 1 ? 68 : 0;
        const boxX = M + shiftX;
        const boxW = contentW - 68;
        surfaceRectInto(
          bodyParts,
          boxX,
          y,
          boxW,
          h,
          i % 2 === 1,
          c,
          `node-${i}`,
        );
        medallionInto(
          bodyParts,
          n,
          boxX + 58,
          cy,
          Math.max(24, Math.round(34 * fitScale)),
          c,
          i,
        );
        drawText(n, boxX + 130, textY, textW, i);
        if (i < nodes.length - 1) {
          const nextShiftX = (i + 1) % 2 === 1 ? 68 : 0;
          const fromCx = boxX + Math.round(boxW / 2);
          const toCx = M + nextShiftX + Math.round(boxW / 2);
          const midY = y + h + Math.round(rowGap / 2);
          bodyParts.push(
            path(
              `M ${fromCx} ${y + h} V ${midY} H ${toCx} V ${y + h + rowGap}`,
              c,
              3,
            ),
            path(
              `M ${toCx - 7} ${y + h + rowGap - 8} L ${toCx} ${y + h + rowGap} L ${toCx + 7} ${y + h + rowGap - 8}`,
              c,
              3,
            ),
            // Rotated diamond decision checkpoint at the elbow midpoint
            el("polygon", {
              points: `${W / 2},${midY - 11} ${W / 2 + 11},${midY} ${W / 2},${midY + 11} ${W / 2 - 11},${midY}`,
              fill: surface,
              stroke: c,
              strokeWidth: 2.5,
            }),
          );
        }
      } else if (isFunnel) {
        const tlX = M + Math.max(0, funnelInsetTop - 16);
        const trX = W - M - Math.max(0, funnelInsetTop - 16);
        const brX = W - M - funnelInsetBot;
        const blX = M + funnelInsetBot;
        bodyParts.push(
          el("polygon", {
            points: `${tlX},${y} ${trX},${y} ${brX},${y + h} ${blX},${y + h}`,
            fill: c,
            opacity: light ? 0.16 : 0.24,
            stroke: c,
            strokeWidth: 2.5,
          }),
        );
        surfaceRectInto(
          bodyParts,
          rowX,
          y + 4,
          rowW,
          Math.max(40, h - 8),
          i % 2 === 0,
          c,
          `node-${i}`,
        );
        if (i < nodes.length - 1) {
          const chevCy = y + h + Math.round(rowGap / 2);
          bodyParts.push(
            path(
              `M ${W / 2 - 12} ${chevCy - 5} L ${W / 2} ${chevCy + 6} L ${W / 2 + 12} ${chevCy - 5}`,
              c,
              3.5,
            ),
          );
        }
        medallionInto(
          bodyParts,
          n,
          rowX + 64,
          cy,
          Math.max(28, Math.round(38 * fitScale)),
          c,
          i,
        );
        drawText(n, rowX + 148, textY, rowTextW, i);
      } else {
        const right = isRibbon && i % 2 === 1;
        if (isRibbon)
          surfaceRectInto(bodyParts, rowX, y, rowW, h, true, c, `node-${i}`);
        else {
          surfaceRectInto(
            bodyParts,
            rowX,
            y,
            rowW,
            h,
            i % 2 === 0,
            c,
            `node-${i}`,
          );
          if (i < nodes.length - 1) {
            bodyParts.push(
              path(`M ${W / 2} ${y + h} V ${y + h + rowGap}`, accent, 2, {
                strokeDasharray: "4 4",
                opacity: 0.35,
              }),
              circle(W / 2, y + h + rowGap / 2, 4, accent, { opacity: 0.65 }),
            );
          }
        }
        const ix = right ? rowX + rowW - 70 : rowX + 68;
        medallionInto(
          bodyParts,
          n,
          ix,
          cy,
          Math.max(30, Math.round(44 * fitScale)),
          c,
          i,
        );
        drawText(n, right ? rowX + 24 : rowX + 168, textY, rowTextW, i);
      }
      y += h + rowGap;
    });
    bottom = y - rowGap;
  }

  if (hasCallout && bottom + calloutBoxH + 14 <= footerY - 12) {
    const calloutY = Math.min(footerY - calloutBoxH - 14, bottom + 18);
    const isGoldBanner =
      ov.calloutStyle === "gold-pill" || layout === "split-equation";
    const isAccentBanner = isGoldBanner || ov.calloutStyle === "accent-pill";
    const bannerBg = isGoldBanner
      ? "#FACC15"
      : isAccentBanner
        ? colors[3]
        : surface;
    const bannerInk = isAccentBanner
      ? contrast("#0F172A", bannerBg) >= contrast("#FFFFFF", bannerBg)
        ? "#0F172A"
        : "#FFFFFF"
      : ink;
    const badgeFill = isAccentBanner ? "#0F172A" : colors[3];
    const badgeFg =
      contrast("#FFFFFF", badgeFill) >= contrast("#0F172A", badgeFill)
        ? "#FFFFFF"
        : "#0F172A";
    const calloutTextNode = textBlock(
      config.calloutText!.trim(),
      M + calloutBadgeW + 26,
      calloutY + Math.max(12, Math.round((calloutBoxH - calloutLines.length * 23) / 2)),
      calloutTextW,
      18,
      bannerInk,
      true,
      false,
      fontStack,
    );
    bodyParts.push(
      el(
        "g",
        {
          "data-layer-id": "callout",
          "data-layer-box": "callout",
          style: "cursor:pointer",
        },
        rect(
          M,
          calloutY,
          contentW,
          calloutBoxH,
          bannerBg,
          ov.calloutStyle === "accent-pill" ? Math.round(calloutBoxH / 2) : 16,
          {
            stroke: colors[3],
            strokeOpacity: 0.65,
            strokeWidth: 1.5,
          },
        ),
        rect(
          M + 12,
          calloutY + Math.round((calloutBoxH - 30) / 2),
          calloutBadgeW,
          30,
          badgeFill,
          8,
        ),
        textBlock(
          calloutBadgeLabel,
          M + 12,
          calloutY + Math.round((calloutBoxH - 30) / 2) + 6,
          calloutBadgeW,
          14,
          badgeFg,
          true,
          true,
          fontStack,
        ).node,
        calloutTextNode.node,
      ),
    );
    bottom = calloutY + calloutBoxH;
  }

  parts.push(el("g", { clipPath: svgRef("body-clip") }, bodyParts));

  if (bottom > footerY - 22)
    addIssue(
      "Text fit",
      "This fixed composition is full. Shorten the explanations, choose a roomier layout, or split the section. Export is paused to prevent cropped text.",
    );

  const footerStyle = ov.footerBarStyle || "minimal";
  const footerNodes: JSXNode[] = [];
  if (hasFooterSource || hasFooterSig) {
    if (footerStyle !== "minimal") {
      const dockFill =
        footerStyle === "dark-dock"
          ? "#0B1120"
          : footerStyle === "light-dock"
            ? "#F8FAFC"
            : surface;
      footerNodes.push(
        rect(
          M - 12,
          footerY - 6,
          contentW + 24,
          Math.max(54, footerBandH + 8),
          dockFill,
          footerStyle === "pill-banner" ? 28 : 14,
          {
            stroke: accent,
            strokeOpacity: 0.35,
            strokeWidth: 1.5,
          },
        ),
      );
    } else {
      footerNodes.push(
        rect(
          M - 6,
          footerY - 8,
          contentW + 12,
          Math.max(46, footerBandH + 8),
          "transparent",
          8,
        ),
        path(`M ${M} ${footerY - 8} H ${W - M}`, accent, 1, {
          opacity: 0.25,
        }),
      );
    }
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
    const footerInk =
      footerStyle === "dark-dock"
        ? "#CBD5E1"
        : footerStyle === "light-dock"
          ? "#334155"
          : muted;
    const footer = textBlock(
      config.footerSourceLabel,
      sourceX,
      sourceY,
      sourceMaxW,
      18,
      footerInk,
      false,
      false,
      fontStack,
    );
    if (footer.height > 46)
      addIssue(
        "Source label",
        "Shorten the source label to two lines; keep the full source URL in the project.",
      );
    footerNodes.push(footer.node);
  }
  if (footerNodes.length > 0) {
    parts.push(
      el(
        "g",
        {
          "data-layer-id": "footer",
          "data-layer-box": "footer",
          style: "cursor:pointer",
        },
        ...footerNodes,
      ),
    );
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
          "data-bg-pattern": bgPattern,
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

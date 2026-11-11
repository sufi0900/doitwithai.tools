/** Prism Forge · Original editorial masters compiled with AntV's DOM-free JSX/SVG API. */
import { jsx, renderSVG, Text, getElementBounds } from "@antv/infographic";
import type { JSXNode } from "@antv/infographic";
import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
} from "@/lib/blog-writer/canonical-state";
import { ASPECT_RATIO_DIMENSIONS, BLOG_INFOGRAPHIC_PALETTES } from "./palettes";

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
const widths = new Map<string, number>();
function widthOf(text: string, size: number, bold = false) {
  const key = `${size}:${bold}:${text}`;
  if (widths.has(key)) return widths.get(key)!;
  // AntV delegates text metrics to Measury. Using the same font in SVG avoids character-count guessing.
  const bounds = getElementBounds(
    jsx(Text, {
      children: text,
      fontSize: size,
      fontFamily: "Arial",
      fontWeight: bold ? 700 : 400,
    }),
  );
  const result = bounds?.width || 0;
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

export function buildPrismScene(config: BlogInfographicConfig): {
  svg: string;
  issues: Issue[];
} {
  const { width: W, height: H } = ASPECT_RATIO_DIMENSIONS[config.aspectRatio];
  const p = BLOG_INFOGRAPHIC_PALETTES[config.paletteId],
    custom = config.brand?.customColors;
  const bg = color(custom?.bgStart, p.bgStart),
    surface = color(custom?.surface, p.surface),
    accent = color(custom?.accent, p.accent),
    ink = color(custom?.textMain, p.textMain);
  const light = luminance(bg) > 0.45,
    muted = light ? "#495775" : "#CBD5E1";
  const second = light ? "#078479" : "#5EEAD4",
    third = light ? "#8B45C4" : "#D8B4FE";
  const colors = [accent, second, third, light ? "#B86E0B" : "#FBBF24"];
  const M = W * 0.0667,
    contentW = W - M * 2,
    footerY = H - 70;
  const issues: Issue[] = [];
  const parts: JSXNode[] = [];
  const layout = config.prismLayout || "editorial";
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
        stopOpacity: light ? 0.13 : 0.3,
      }),
      el("stop", { offset: 1, stopColor: second, stopOpacity: 0.02 }),
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
  );
  parts.push(
    path(
      `M ${W * 0.68} -90 C ${W * 0.1} ${H * 0.25}, ${W * 1.5} ${H * 0.3}, ${W * 0.8} ${H * 0.86} S ${W * 0.3} ${H * 1.1}, -80 ${H * 0.85}`,
      accent,
      100,
      { opacity: 0.045 },
    ),
    circle(W * 0.95, H * 0.03, W * 0.27, accent, { opacity: 0.04 }),
  );
  // Quiet print-like framing belongs to the graphic; editor labels never enter the SVG.
  parts.push(rect(M, 58, 54, 6, accent, 3), rect(M + 64, 58, 20, 6, second, 3));
  const titleSize = config.aspectRatio === "16:9" ? 60 : 62;
  const headline = textBlock(
    config.headline,
    M,
    96,
    contentW,
    titleSize,
    ink,
    true,
  );
  parts.push(headline.node);
  let top = 96 + headline.height + 20;
  if (config.subheadline.trim()) {
    const sub = textBlock(config.subheadline, M, top, contentW, 26, muted);
    parts.push(sub.node);
    top += sub.height + 20;
  }
  top += 26;
  const nodes = config.nodes.slice(0, 6);
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
  const bodySize = 27,
    labelSize = 33;
  let bottom = top;
  const drawText = (
    n: BlogInfographicNodeItem,
    x: number,
    y: number,
    w: number,
    index: number,
  ) => {
    const badgeText = n.badge.trim() || String(index + 1).padStart(2, "0");
    const badge = textBlock(badgeText, x, y, w, 19, colors[index % 4], true);
    const title = textBlock(n.title, x, y + 34, w, labelSize, ink, true);
    const detail = textBlock(
      n.detail,
      x,
      y + 34 + title.height + 12,
      w,
      bodySize,
      muted,
    );
    parts.push(badge.node, title.node, detail.node);
    return 34 + title.height + 12 + detail.height;
  };
  if (layout === "constellation") {
    const orbitH = config.aspectRatio === "16:9" ? 140 : 240;
    const cy = top + orbitH / 2,
      cx = W / 2,
      radius = Math.min(contentW * 0.34, 330);
    parts.push(
      el("ellipse", {
        cx,
        cy,
        rx: radius,
        ry: orbitH * 0.36,
        fill: "none",
        stroke: accent,
        strokeWidth: 2,
        strokeDasharray: "5 9",
        opacity: 0.45,
      }),
    );
    nodes.forEach((n, i) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / nodes.length,
        x = cx + Math.cos(angle) * radius,
        y = cy + Math.sin(angle) * orbitH * 0.36;
      parts.push(
        path(`M ${cx} ${cy} L ${x} ${y}`, colors[i % 4], 2, { opacity: 0.3 }),
        circle(x, y, 37, surface, { stroke: colors[i % 4], strokeWidth: 2 }),
        pictogram(semanticIcon(n), x - 17, y - 17, 34, colors[i % 4]),
      );
    });
    parts.push(
      circle(cx, cy, 64, surface, { stroke: accent, strokeWidth: 2 }),
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
      issues.push({
        field: "Center label",
        message:
          "Use a shorter center label so it fits inside the concept hub.",
      });
    parts.push(center.node);
    const columns =
      config.aspectRatio === "16:9"
        ? Math.min(nodes.length, nodes.length === 4 ? 2 : 3)
        : config.aspectRatio === "1:1"
          ? 2
          : 1;
    const gap = 34,
      cellW = (contentW - gap * (columns - 1)) / columns;
    let rowY = top + orbitH + 26;
    for (let i = 0; i < safeNodes.length; i += columns) {
      let height = 0;
      safeNodes.slice(i, i + columns).forEach((n, k) => {
        const x = M + k * (cellW + gap),
          c = colors[(i + k) % 4];
        parts.push(rect(x, rowY, 4, 32, c, 2));
        height = Math.max(height, drawText(n, x + 20, rowY, cellW - 20, i + k));
      });
      rowY += height + 32;
    }
    bottom = rowY;
  } else if (config.aspectRatio === "16:9") {
    const columns = Math.min(nodes.length, nodes.length === 4 ? 2 : 3),
      gap = 34,
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
              x - 12,
              rowY - 14,
              cellW + 24,
              footerY - rowY - 35,
              "url(#prism-ribbon)",
              20,
            ),
          );
        parts.push(
          circle(x + 42, rowY + 42, 42, c, { opacity: 0.1 }),
          pictogram(semanticIcon(n), x + 16, rowY + 16, 52, c),
        );
        height = Math.max(
          height,
          100 + drawText(n, x, rowY + 100, cellW, i + k),
        );
      });
      rowY += height + 32;
    }
    bottom = rowY;
  } else {
    let y = top;
    const heights = safeNodes.map((n) => {
      const textW = contentW - 205;
      return (
        Math.max(
          148,
          34 +
            wrap(n.title, textW, labelSize, true).length * labelSize * 1.3 +
            12 +
            wrap(n.detail, textW, bodySize).length * bodySize * 1.3,
        ) + 36
      );
    });
    const total =
      heights.reduce((n, h) => n + h, 0) + Math.max(0, nodes.length - 1) * 22;
    const extra = Math.max(0, footerY - 44 - top - total);
    safeNodes.forEach((n, i) => {
      const rightIcon = layout === "ribbon" && i % 2 === 1;
      const h = heights[i] + Math.min(extra / Math.max(1, nodes.length), 26),
        c = colors[i % 4];
      if (layout === "ribbon") {
        parts.push(
          rect(M - 16, y - 4, contentW + 32, h + 4, surface, 22),
          rect(M - 16, y - 4, contentW + 32, h + 4, "url(#prism-ribbon)", 22),
        );
      } else {
        parts.push(
          path(`M ${M + 180} ${y + h + 10} H ${W - M}`, c, 1, { opacity: 0.2 }),
        );
      }
      const ix = rightIcon ? W - M - 136 : M + 7,
        iy = y + Math.max(0, (h - 132) / 2);
      parts.push(
        circle(ix + 64, iy + 64, 65, c, { opacity: light ? 0.09 : 0.18 }),
        circle(ix + 64, iy + 64, 48, surface, {
          stroke: c,
          strokeWidth: 1.5,
          strokeOpacity: 0.3,
        }),
        pictogram(semanticIcon(n), ix + 31, iy + 31, 66, c),
      );
      const tx = rightIcon ? M + 20 : M + 184;
      drawText(n, tx, y + 16, contentW - 205, i);
      y += h + 22;
    });
    bottom = y;
  }
  if (bottom > footerY - 30)
    issues.push({
      field: "Text fit",
      message: `This ${config.aspectRatio} composition needs more space. Switch to 9:16, shorten the explanations, or split the section. Export is paused to prevent cropped text.`,
    });
  // A real source/footer stays with the image, with room reserved for a raster brand mark.
  parts.push(
    path(`M ${M} ${footerY - 10} H ${W - M}`, accent, 1, { opacity: 0.25 }),
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
      } as any,
    ).replace("<svg ", `<svg width="${W}" height="${H}" `),
    issues,
  };
}

/**
 * Industrial Canvas Renderer for the Free AI Testimonial & Quote Card Studio.
 * Renders all 14 templates across 1:1 Square, 4:5 Portrait, and 16:9 Landscape
 * with strict non-overlapping column geometry, architectural portrait framing
 * (Circle-in-Ring, Rounded Arch, Adjustable-Radius Frame, Full-Bleed Gradient Split,
 * or Transparent Cutout), real-time Up/Down + Left/Right + Zoom + Radius controls,
 * and customizable Brand Logo scaling & badge styles.
 */
import type {
  CardAspectRatioId,
  LogoBadgeStyle,
  PortraitFrameMode,
  QuoteCardItem,
  QuoteStudioInput,
  QuoteVisualTemplateId,
} from "./model";

export type PortraitSource =
  | HTMLImageElement
  | HTMLCanvasElement
  | ImageBitmap;

export interface RenderTheme {
  bgStart: string;
  bgEnd: string;
  accent: string;
  textMain: string;
  textSub: string;
  cardBg: string;
  cardBorder: string;
}

export interface RenderParams {
  input: QuoteStudioInput;
  card: QuoteCardItem;
  theme: RenderTheme;
  portrait: PortraitSource | null;
  /** true = background-removed cutout canvas; false = raw image */
  portraitIsCutout: boolean;
  logo: HTMLImageElement | null;
  /** user-picked surface / text colors (override template defaults) */
  customSurface?: string;
  customText?: string;
}

const SANS =
  'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';

export function getCanvasSize(ratio: CardAspectRatioId | undefined) {
  if (ratio === "16:9") return { W: 1600, H: 900 };
  if (ratio === "4:5") return { W: 1080, H: 1350 };
  return { W: 1080, H: 1080 };
}

/* ------------------------------------------------------------------ */
/* Color & Geometry Helpers                                            */
/* ------------------------------------------------------------------ */

function isHex7(c: string) {
  return /^#[0-9a-fA-F]{6}$/.test(c);
}

function alpha(hex: string, a: number) {
  if (!isHex7(hex)) return hex;
  return `${hex}${Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, "0")}`;
}

function shade(hex: string, f: number) {
  if (!isHex7(hex)) return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `#${[r, g, b]
    .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
    .join("")}`;
}

function dims(img: PortraitSource) {
  if (
    typeof HTMLImageElement !== "undefined" &&
    img instanceof HTMLImageElement
  ) {
    return {
      w: img.naturalWidth || img.width,
      h: img.naturalHeight || img.height,
    };
  }
  return {
    w: (img as HTMLCanvasElement).width,
    h: (img as HTMLCanvasElement).height,
  };
}

type Zone = { x: number; y: number; w: number; h: number };

function normalizeTemplateId(
  id: QuoteVisualTemplateId,
): QuoteVisualTemplateId {
  switch (id) {
    case "aragon-split-testimonial":
      return "arch-aura-split";
    case "verified-post-screenshot":
      return "x-verified-post";
    case "highlighter-quote":
      return "flagship-footer-split";
    case "founder-memo-note":
      return "founder-memo-portrait";
    case "testimonial-5-star":
      return "wave-trust-pills";
    case "executive-pull-quote":
      return "editorial-dot-grid";
    case "oversized-kpi-stat":
      return "kpi-stat-portrait";
    case "glassmorphic-saas-card":
      return "obsidian-gold-rings";
    case "boardroom-white-frame":
      return "portrait-left-quote";
    default:
      return id;
  }
}

/* ------------------------------------------------------------------ */
/* Rich Auto-Fit Quote Typography + Brand Phrase Highlighting          */
/* ------------------------------------------------------------------ */

type Tok = { t: string; hl: boolean };

function tokenize(text: string, phrase: string): Tok[] {
  const segs: { s: string; hl: boolean }[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) segs.push({ s: text.slice(last, m.index), hl: false });
    segs.push({ s: m[1], hl: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) segs.push({ s: text.slice(last), hl: false });
  let out = segs;
  const p = (phrase || "").trim();
  if (segs.length <= 1 && !segs[0]?.hl && p.length >= 3) {
    const idx = text.toLowerCase().indexOf(p.toLowerCase());
    if (idx >= 0) {
      out = [
        { s: text.slice(0, idx), hl: false },
        { s: text.slice(idx, idx + p.length), hl: true },
        { s: text.slice(idx + p.length), hl: false },
      ];
    }
  }
  const toks: Tok[] = [];
  let prevEndsSpace = true;
  for (const seg of out) {
    const words = seg.s.split(/\s+/).filter(Boolean);
    words.forEach((w, wi) => {
      if (wi === 0 && !prevEndsSpace && !/^\s/.test(seg.s) && toks.length) {
        toks[toks.length - 1].t += w;
      } else {
        toks.push({ t: w, hl: seg.hl });
      }
    });
    if (seg.s.length) prevEndsSpace = /\s$/.test(seg.s);
  }
  return toks;
}

function wrapTokens(ctx: CanvasRenderingContext2D, toks: Tok[], maxW: number) {
  const lines: Tok[][] = [];
  const space = ctx.measureText(" ").width;
  let cur: Tok[] = [];
  let curW = 0;
  for (const tk of toks) {
    const w = ctx.measureText(tk.t).width;
    const add = cur.length ? space + w : w;
    if (cur.length && curW + add > maxW) {
      lines.push(cur);
      cur = [tk];
      curW = w;
    } else {
      cur.push(tk);
      curW += add;
    }
  }
  if (cur.length) lines.push(cur);
  return lines;
}

function drawRichQuote(
  ctx: CanvasRenderingContext2D,
  q: {
    box: Zone;
    text: string;
    phrase: string;
    maxSize: number;
    minSize: number;
    family: string;
    weight: number;
    color: string;
    hlColor: string;
    hlBg: string;
    lh?: number;
    valign?: "top" | "middle";
  },
): number {
  const toks = tokenize(q.text, q.phrase);
  const lhR = q.lh ?? 1.28;
  let size = q.maxSize;
  let lines: Tok[][] = [];
  for (; size >= q.minSize; size -= 2) {
    ctx.font = `${q.weight} ${size}px ${q.family}`;
    lines = wrapTokens(ctx, toks, q.box.w);
    if (lines.length * size * lhR <= q.box.h) break;
  }
  size = Math.max(size, q.minSize);
  ctx.font = `${q.weight} ${size}px ${q.family}`;
  lines = wrapTokens(ctx, toks, q.box.w);
  const maxLines = Math.max(1, Math.floor(q.box.h / (size * lhR)));
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    lines[maxLines - 1] = [...lines[maxLines - 1], { t: "…", hl: false }];
  }
  const totalH = lines.length * size * lhR;
  let y = q.box.y;
  if (q.valign === "middle")
    y = q.box.y + Math.max(0, (q.box.h - totalH) / 2);

  const space = ctx.measureText(" ").width;
  ctx.textBaseline = "alphabetic";
  for (const line of lines) {
    const base = y + size * (0.5 * (lhR - 1)) + size * 0.85;
    let x = q.box.x;
    const pos: { x: number; w: number; tk: Tok }[] = [];
    for (const tk of line) {
      const w = ctx.measureText(tk.t).width;
      pos.push({ x, w, tk });
      x += w + space;
    }
    let i = 0;
    while (i < pos.length) {
      if (pos[i].tk.hl) {
        let j = i;
        while (j + 1 < pos.length && pos[j + 1].tk.hl) j++;
        const rx = pos[i].x - 7;
        const rw = Math.min(
          q.box.w + 10,
          pos[j].x + pos[j].w - pos[i].x + 14,
        );
        ctx.fillStyle = q.hlBg;
        ctx.beginPath();
        ctx.roundRect(rx, base - size * 0.88, rw, size * 1.1, 8);
        ctx.fill();
        i = j + 1;
      } else i++;
    }
    for (const p of pos) {
      ctx.fillStyle = p.tk.hl ? q.hlColor : q.color;
      ctx.fillText(p.tk.t, p.x, base);
    }
    y += size * lhR;
  }
  return y;
}

/* ------------------------------------------------------------------ */
/* Primitives: Stars, Verified Check, Pills, Avatar, Portrait & Logo   */
/* ------------------------------------------------------------------ */

function drawStars(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  count = 5,
) {
  ctx.fillStyle = color;
  for (let s = 0; s < count; s++) {
    const cx = x + s * (size * 1.12) + size / 2;
    const cy = y + size / 2;
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const rad = k % 2 === 0 ? size / 2 : size / 4.2;
      const ang = (Math.PI / 5) * k - Math.PI / 2;
      const px = cx + Math.cos(ang) * rad;
      const py = cy + Math.sin(ang) * rad;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  return x + count * size * 1.12;
}

function drawVerified(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = Math.max(2, r * 0.18);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.42, cy + r * 0.02);
  ctx.lineTo(cx - r * 0.1, cy + r * 0.34);
  ctx.lineTo(cx + r * 0.46, cy - r * 0.3);
  ctx.stroke();
  ctx.restore();
}

function layoutPills(
  ctx: CanvasRenderingContext2D,
  labels: string[],
  maxW: number,
  fontPx: number,
) {
  ctx.font = `800 ${fontPx}px ${SANS}`;
  const padX = Math.round(fontPx * 0.85);
  const gap = Math.round(fontPx * 0.55);
  const iconW = Math.round(fontPx * 1.18);
  const rows: { label: string; w: number }[][] = [[]];
  let cur = 0;
  for (const rawLabel of labels) {
    const label = rawLabel.slice(0, 28);
    const w = Math.min(maxW, ctx.measureText(label).width + padX * 2 + iconW);
    if (rows[rows.length - 1].length && cur + gap + w > maxW) {
      rows.push([]);
      cur = 0;
    }
    rows[rows.length - 1].push({ label, w });
    cur += (cur ? gap : 0) + w;
  }
  const pillH = Math.round(fontPx * 2.18);
  return {
    rows,
    pillH,
    gap,
    padX,
    iconW,
    height: rows.length * pillH + (rows.length - 1) * gap,
  };
}

function drawPills(
  ctx: CanvasRenderingContext2D,
  labels: string[],
  x: number,
  y: number,
  maxW: number,
  fontPx: number,
  style: { fg: string; bg: string; border: string; icon: string },
) {
  const L = layoutPills(ctx, labels, maxW, fontPx);
  let yy = y;
  ctx.font = `800 ${fontPx}px ${SANS}`;
  ctx.textBaseline = "alphabetic";
  for (const row of L.rows) {
    let xx = x;
    for (const p of row) {
      ctx.fillStyle = style.bg;
      ctx.strokeStyle = style.border;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(xx, yy, p.w, L.pillH, L.pillH / 2);
      ctx.fill();
      ctx.stroke();
      drawVerified(
        ctx,
        xx + L.padX * 0.55 + fontPx * 0.5,
        yy + L.pillH / 2,
        fontPx * 0.5,
        style.icon,
      );
      ctx.fillStyle = style.fg;
      ctx.fillText(
        p.label,
        xx + L.padX * 0.55 + L.iconW,
        yy + L.pillH / 2 + fontPx * 0.34,
        p.w - L.padX - L.iconW,
      );
      xx += p.w + L.gap;
    }
    yy += L.pillH + L.gap;
  }
  return y + L.height;
}

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  P: RenderParams,
  cx: number,
  cy: number,
  r: number,
  ring: string,
  bg: string,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.clip();
  if (P.portrait) {
    const { w, h } = dims(P.portrait);
    if (w > 0 && h > 0) {
      const side = Math.min(w, h) * 0.78;
      const sx = (w - side) / 2;
      const sy = Math.max(0, (h - side) * 0.14);
      ctx.drawImage(
        P.portrait,
        sx,
        sy,
        side,
        side,
        cx - r,
        cy - r,
        r * 2,
        r * 2,
      );
    }
  } else {
    const initials = (P.input.authorName || "Customer")
      .split(/\s+/)
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `900 ${Math.round(r * 0.85)}px ${SANS}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, cx, cy + 2);
    ctx.textAlign = "left";
  }
  ctx.restore();
  ctx.strokeStyle = ring;
  ctx.lineWidth = Math.max(3, r * 0.09);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
}

/**
 * Architectural Portrait Framing Engine:
 * Supports 5 precision modes:
 * - "ring-circle": Concentric outer rings + portrait clipped inside the circular inner ring
 * - "arch": Portrait clipped inside a rounded-top architectural arch with accent border
 * - "rounded": Portrait clipped inside a bordered frame with adjustable Corner Radius (0-50%)
 * - "bleed": Full-height panel with seamless horizontal gradient blend into the card surface
 * - "cutout": Background-removed cutout with soft studio aura & bottom fade
 */
function drawFramedPortrait(
  ctx: CanvasRenderingContext2D,
  P: RenderParams,
  zone: Zone,
  defaultMode: "ring-circle" | "arch" | "rounded" | "bleed" | "cutout",
  accent: string,
  surfaceColor: string,
  isDark: boolean,
) {
  if (!P.portrait) return;
  const { w, h } = dims(P.portrait);
  if (!w || !h) return;

  const userMode: PortraitFrameMode = P.input.portraitFrame || "auto";
  const mode =
    defaultMode === "bleed" && userMode === "auto"
      ? "bleed"
      : userMode === "auto"
        ? defaultMode
        : userMode;

  const scale = Math.max(0.65, Math.min(1.6, P.input.portraitScale ?? 1));
  const offX = Math.max(-0.35, Math.min(0.35, P.input.portraitOffsetX ?? 0));
  const offY = Math.max(-0.35, Math.min(0.35, P.input.portraitOffsetY ?? 0));
  const radiusPct = Math.max(0, Math.min(50, P.input.portraitRadius ?? 24));
  const ringScale = Math.max(
    0.72,
    Math.min(1.22, P.input.portraitRingScale ?? 1),
  );

  ctx.save();

  const fillStudioInterior = (bx: number, by: number, bw: number, bh: number) => {
    const grad = ctx.createRadialGradient(
      bx + bw * 0.5,
      by + bh * 0.42,
      bw * 0.08,
      bx + bw * 0.5,
      by + bh * 0.5,
      Math.max(bw, bh) * 0.75,
    );
    if (isDark) {
      grad.addColorStop(0, shade(accent, 0.42));
      grad.addColorStop(0.6, "#1E293B");
      grad.addColorStop(1, "#0B1120");
    } else {
      grad.addColorStop(0, alpha(accent, 0.28));
      grad.addColorStop(0.65, "#E2E8F0");
      grad.addColorStop(1, "#CBD5E1");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(bx, by, bw, bh);
  };

  const drawCoverPortrait = (
    bx: number,
    by: number,
    bw: number,
    bh: number,
    verticalAnchor = 0.22,
  ) => {
    const baseS = Math.max(bw / w, bh / h) * scale;
    const dw = w * baseS;
    const dh = h * baseS;
    const dx = bx + (bw - dw) / 2 + offX * bw;
    const dy = by + (bh - dh) * verticalAnchor + offY * bh;
    ctx.drawImage(P.portrait!, dx, dy, dw, dh);
  };

  /* ---- MODE 1: CONCENTRIC RING + CIRCULAR PORTRAIT ---- */
  if (mode === "ring-circle") {
    const rcx = zone.x + zone.w * 0.5;
    const rcy = zone.y + zone.h * 0.5;
    const maxR = Math.min(zone.w, zone.h) * 0.46;
    const innerR = maxR * 0.76 * ringScale;
    const midR = innerR * 1.15;
    const outerR = innerR * 1.3;

    const aura = ctx.createRadialGradient(
      rcx,
      rcy,
      innerR * 0.2,
      rcx,
      rcy,
      outerR * 1.08,
    );
    aura.addColorStop(0, alpha(accent, isDark ? 0.38 : 0.22));
    aura.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(rcx, rcy, outerR * 1.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = alpha(accent, isDark ? 0.28 : 0.24);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(rcx, rcy, outerR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = alpha(accent, isDark ? 0.5 : 0.4);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(rcx, rcy, midR, 0, Math.PI * 2);
    ctx.stroke();

    for (const ang of [Math.PI * 0.2, Math.PI * 0.8, Math.PI * 1.25, Math.PI * 1.75]) {
      const nx = rcx + Math.cos(ang) * midR;
      const ny = rcy + Math.sin(ang) * midR;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(nx, ny, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(rcx, rcy, innerR, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const dBox = innerR * 2;
    fillStudioInterior(rcx - innerR, rcy - innerR, dBox, dBox);
    drawCoverPortrait(rcx - innerR, rcy - innerR, dBox, dBox, 0.18);
    ctx.restore();

    ctx.strokeStyle = alpha(accent, 0.32);
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(rcx, rcy, innerR + 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(rcx, rcy, innerR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.65)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(rcx, rcy, Math.max(4, innerR - 3.5), 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
    return;
  }

  /* ---- MODE 2: ARCHITECTURAL ARCH FRAME ---- */
  if (mode === "arch") {
    const archW = Math.min(zone.w * 0.88, zone.h * 0.82) * ringScale;
    const archH = Math.min(zone.h * 0.94, archW * 1.28);
    const archX = zone.x + (zone.w - archW) / 2;
    const archY = zone.y + zone.h - archH;
    const topR = archW / 2;
    const botR = Math.round((radiusPct / 50) * 28);

    ctx.fillStyle = alpha(accent, isDark ? 0.22 : 0.16);
    ctx.beginPath();
    ctx.roundRect(
      archX - 10,
      archY - 10,
      archW + 20,
      archH + 10,
      [topR + 10, topR + 10, botR + 6, botR + 6],
    );
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(archX, archY, archW, archH, [topR, topR, botR, botR]);
    ctx.closePath();
    ctx.clip();

    fillStudioInterior(archX, archY, archW, archH);
    drawCoverPortrait(archX, archY, archW, archH, 0.16);
    ctx.restore();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(archX, archY, archW, archH, [topR, topR, botR, botR]);
    ctx.stroke();

    ctx.restore();
    return;
  }

  /* ---- MODE 3: FULL-BLEED MAGAZINE SPLIT PANEL ---- */
  if (mode === "bleed") {
    ctx.save();
    ctx.beginPath();
    ctx.rect(zone.x, zone.y, zone.w, zone.h);
    ctx.closePath();
    ctx.clip();

    fillStudioInterior(zone.x, zone.y, zone.w, zone.h);
    drawCoverPortrait(zone.x, zone.y, zone.w, zone.h, 0.18);

    const baseHex = isHex7(surfaceColor) ? surfaceColor : "#0B132B";
    const seamW = Math.round(zone.w * 0.42);
    const seamGrad = ctx.createLinearGradient(
      zone.x,
      0,
      zone.x + seamW,
      0,
    );
    seamGrad.addColorStop(0, baseHex);
    seamGrad.addColorStop(0.38, alpha(baseHex, 0.72));
    seamGrad.addColorStop(1, alpha(baseHex, 0));
    ctx.fillStyle = seamGrad;
    ctx.fillRect(zone.x - 2, zone.y, seamW + 2, zone.h);

    const botGrad = ctx.createLinearGradient(
      0,
      zone.y + zone.h * 0.72,
      0,
      zone.y + zone.h,
    );
    botGrad.addColorStop(0, alpha(baseHex, 0));
    botGrad.addColorStop(1, alpha(baseHex, 0.65));
    ctx.fillStyle = botGrad;
    ctx.fillRect(zone.x, zone.y + zone.h * 0.72, zone.w, zone.h * 0.28);

    ctx.restore();
    ctx.restore();
    return;
  }

  /* ---- MODE 4: TRANSPARENT CUTOUT OVER STUDIO AURA ---- */
  if (mode === "cutout") {
    ctx.save();
    ctx.beginPath();
    ctx.rect(zone.x, zone.y, zone.w, zone.h);
    ctx.closePath();
    ctx.clip();

    const cx = zone.x + zone.w * 0.5;
    const cy = zone.y + zone.h * 0.54;
    const rAura = Math.min(zone.w, zone.h) * 0.44 * ringScale;
    const aura = ctx.createRadialGradient(cx, cy, rAura * 0.15, cx, cy, rAura);
    aura.addColorStop(0, alpha(accent, isDark ? 0.42 : 0.26));
    aura.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(cx, cy, rAura, 0, Math.PI * 2);
    ctx.fill();

    let dh = zone.h * 0.94 * scale;
    let dw = (dh * w) / h;
    const maxW = zone.w * 0.96 * scale;
    if (dw > maxW) {
      dw = maxW;
      dh = (dw * h) / w;
    }
    const dx = zone.x + (zone.w - dw) / 2 + offX * zone.w;
    const dy = zone.y + zone.h - dh + offY * zone.h;
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 8;
    ctx.drawImage(P.portrait, dx, dy, dw, dh);

    ctx.restore();
    ctx.restore();
    return;
  }

  /* ---- MODE 5 (DEFAULT): ROUNDED / ADJUSTABLE-RADIUS STUDIO FRAME ---- */
  const boxW = Math.min(zone.w * 0.9, zone.h * 0.84) * ringScale;
  const boxH = Math.min(zone.h * 0.9, boxW * 1.18);
  const boxX = zone.x + (zone.w - boxW) / 2;
  const boxY = zone.y + (zone.h - boxH) / 2;
  const maxCorner = Math.min(boxW, boxH) / 2;
  const rPx = Math.round((radiusPct / 50) * maxCorner);

  ctx.fillStyle = alpha(accent, isDark ? 0.22 : 0.16);
  ctx.strokeStyle = alpha(accent, 0.45);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(boxX + 10, boxY + 10, boxW, boxH, rPx);
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, rPx);
  ctx.closePath();
  ctx.clip();

  fillStudioInterior(boxX, boxY, boxW, boxH);
  drawCoverPortrait(boxX, boxY, boxW, boxH, 0.18);
  ctx.restore();

  ctx.strokeStyle = accent;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, rPx);
  ctx.stroke();

  ctx.restore();
}

function drawBrandMark(
  ctx: CanvasRenderingContext2D,
  P: RenderParams,
  right: number,
  midY: number,
  maxW: number,
  maxH: number,
  onDark: boolean,
  accent: string,
) {
  const logoScale = Math.max(0.65, Math.min(1.55, P.input.logoScale ?? 1));
  const bgStyle: LogoBadgeStyle = P.input.logoBgStyle || "auto";

  if (P.logo && P.logo.naturalWidth > 0) {
    const r = P.logo.naturalWidth / (P.logo.naturalHeight || 1);
    let dh = maxH * logoScale;
    let dw = dh * r;
    if (dw > maxW * logoScale) {
      dw = maxW * logoScale;
      dh = dw / r;
    }
    const lx = right - dw;
    const ly = midY - dh / 2;

    if (bgStyle !== "plain") {
      const padX = 14;
      const padY = 8;
      ctx.save();
      if (bgStyle === "white") {
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#CBD5E1";
      } else if (bgStyle === "dark") {
        ctx.fillStyle = "#0F172A";
        ctx.strokeStyle = accent;
      } else if (bgStyle === "pill") {
        ctx.fillStyle = alpha(accent, onDark ? 0.25 : 0.14);
        ctx.strokeStyle = accent;
      } else {
        ctx.fillStyle = onDark
          ? "rgba(255,255,255,0.10)"
          : "rgba(15,23,42,0.06)";
        ctx.strokeStyle = alpha(accent, 0.55);
      }
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(
        lx - padX,
        ly - padY,
        dw + padX * 2,
        dh + padY * 2,
        12,
      );
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.drawImage(P.logo, lx, ly, dw, dh);
    return;
  }

  const label = (P.input.brandDomain || "doitwithai.tools").toUpperCase();
  const fs = Math.round(Math.min(maxH * 0.42, 21) * logoScale);
  ctx.font = `900 ${fs}px ${SANS}`;
  const w = Math.min(
    maxW * 1.15,
    ctx.measureText(label).width + fs * 1.8,
  );
  ctx.fillStyle =
    bgStyle === "white"
      ? "#FFFFFF"
      : bgStyle === "dark"
        ? "#0F172A"
        : alpha(accent, onDark ? 0.24 : 0.12);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(right - w, midY - fs * 1.1, w, fs * 2.2, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle =
    bgStyle === "white"
      ? "#0F172A"
      : bgStyle === "dark" || onDark
        ? "#FFFFFF"
        : accent;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(label, right - w + fs * 0.9, midY + fs * 0.35, w - fs * 1.8);
}

function drawNameBlock(
  ctx: CanvasRenderingContext2D,
  P: RenderParams,
  x: number,
  y: number,
  maxW: number,
  opts: {
    avatarR: number;
    nameColor: string;
    subColor: string;
    accent: string;
    ring: string;
    avatarBg: string;
    nameSize?: number;
  },
) {
  const r = opts.avatarR;
  drawAvatar(ctx, P, x + r, y + r, r, opts.ring, opts.avatarBg);
  const tx = x + r * 2 + 20;
  const ns = opts.nameSize ?? Math.round(r * 0.62);
  ctx.textBaseline = "alphabetic";
  ctx.font = `900 ${ns}px ${SANS}`;
  ctx.fillStyle = opts.nameColor;
  const name = P.input.authorName || "Customer Name";
  const room = Math.max(80, maxW - (tx - x) - ns * 1.6);
  ctx.fillText(name, tx, y + r - 4, room);
  const nw = Math.min(room, ctx.measureText(name).width);
  drawVerified(
    ctx,
    tx + nw + ns * 0.75,
    y + r - ns * 0.35,
    ns * 0.42,
    opts.accent,
  );
  ctx.font = `600 ${Math.round(ns * 0.74)}px ${SANS}`;
  ctx.fillStyle = opts.subColor;
  ctx.fillText(
    P.input.authorHandleOrRole || "Verified Customer",
    tx,
    y + r + ns * 0.84,
    Math.max(80, maxW - (tx - x)),
  );
}

function extractStat(card: QuoteCardItem) {
  const m = `${card.highlightPhrase} ${card.quoteText}`.match(
    /\d+(?:\.\d+)?\s?(?:%|x|X|×|\+)/,
  );
  return m ? m[0].replace(/\s/g, "") : "2.8x";
}

/* ------------------------------------------------------------------ */
/* Template Specs for Split Portrait Layouts                           */
/* ------------------------------------------------------------------ */

interface Spec {
  surface: string;
  text: string;
  sub: string;
  dark: boolean;
  defaultFrame: "ring-circle" | "arch" | "rounded" | "bleed" | "cutout";
  dots?: boolean;
  side: "right" | "left";
  footer: "bar" | "wave" | "none";
  footerColor: string;
  border: string;
  serif?: boolean;
  kpi?: boolean;
  bleed?: boolean;
}

function specFor(id: QuoteVisualTemplateId, P: RenderParams): Spec | null {
  const a = P.theme.accent;
  const base: Record<string, Spec> = {
    "arch-aura-split": {
      surface: "#FAF8F5",
      text: "#1E1B2E",
      sub: "#5B5870",
      dark: false,
      defaultFrame: "arch",
      side: "right",
      footer: "bar",
      footerColor: "#261546",
      border: "#261546",
    },
    "obsidian-gold-rings": {
      surface: "#0F172A",
      text: "#F8FAFC",
      sub: "#94A3B8",
      dark: true,
      defaultFrame: "ring-circle",
      side: "right",
      footer: "bar",
      footerColor: "#070D19",
      border: a,
    },
    "flagship-footer-split": {
      surface: "#FFFDF9",
      text: "#0F172A",
      sub: "#475569",
      dark: false,
      defaultFrame: "rounded",
      side: "right",
      footer: "bar",
      footerColor: "#0B1325",
      border: "#0F172A",
    },
    "editorial-dot-grid": {
      surface: "#FDFBF7",
      text: "#111827",
      sub: "#4B5563",
      dark: false,
      defaultFrame: "rounded",
      dots: true,
      side: "right",
      footer: "bar",
      footerColor: shade(a, 0.34),
      border: shade(a, 0.34),
      serif: true,
    },
    "wave-trust-pills": {
      surface: "#FFFFFF",
      text: "#0F172A",
      sub: "#475569",
      dark: false,
      defaultFrame: "rounded",
      side: "right",
      footer: "wave",
      footerColor: a,
      border: shade(a, 0.45),
    },
    "portrait-left-quote": {
      surface: "#F8FAFC",
      text: "#0F172A",
      sub: "#475569",
      dark: false,
      defaultFrame: "rounded",
      side: "left",
      footer: "bar",
      footerColor: "#0F172A",
      border: "#334155",
    },
    "full-bleed-portrait": {
      surface: "#0B132B",
      text: "#FFFFFF",
      sub: "#B6C2E2",
      dark: true,
      defaultFrame: "bleed",
      side: "right",
      footer: "none",
      footerColor: "#0B132B",
      border: a,
      bleed: true,
    },
    "kpi-stat-portrait": {
      surface: "#0B132B",
      text: "#F8FAFC",
      sub: "#A9B6D8",
      dark: true,
      defaultFrame: "ring-circle",
      side: "right",
      footer: "bar",
      footerColor: "#060B19",
      border: a,
      kpi: true,
    },
  };
  const s = base[id];
  if (!s) return null;
  const out = { ...s };
  if (P.customSurface) out.surface = P.customSurface;
  if (P.customText) out.text = P.customText;
  return out;
}

/* ------------------------------------------------------------------ */
/* Main Entry: renderQuoteCard                                         */
/* ------------------------------------------------------------------ */

export function renderQuoteCard(
  canvas: HTMLCanvasElement,
  P: RenderParams,
  pixelScale = 1,
) {
  const { W, H } = getCanvasSize(P.input.aspectRatio);
  canvas.width = Math.round(W * pixelScale);
  canvas.height = Math.round(H * pixelScale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const accent = P.theme.accent;
  const hasPortrait = !!P.portrait;
  const tplId = normalizeTemplateId(P.input.template);

  // Outer Studio Backdrop
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, P.theme.bgStart);
  bg.addColorStop(1, P.theme.bgEnd);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(
    W * 0.85,
    H * 0.12,
    10,
    W * 0.85,
    H * 0.12,
    420,
  );
  glow.addColorStop(0, alpha(accent, 0.22));
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const m = Math.round(Math.min(W, H) * 0.045);
  const cx = m;
  const cy = m;
  const cw = W - m * 2;
  const ch = H - m * 2;
  const wide = W > H;
  const pad = Math.round(cw * 0.052);
  const pills = [
    P.input.trustBadge1,
    P.input.trustBadge2,
    P.input.trustBadge3,
  ].filter(Boolean) as string[];

  const cardPath = () => {
    ctx.beginPath();
    ctx.roundRect(cx, cy, cw, ch, 40);
  };

  /* ================================================================== */
  /* TEMPLATE 9: VERIFIED SOCIAL POST CARD (x-verified-post)            */
  /* ================================================================== */
  if (tplId === "x-verified-post") {
    const surface = P.customSurface || "#FFFFFF";
    const text = P.customText || "#0F172A";
    cardPath();
    ctx.fillStyle = surface;
    ctx.fill();
    ctx.save();
    cardPath();
    ctx.clip();

    drawNameBlock(ctx, P, cx + pad, cy + pad, cw * 0.62, {
      avatarR: 54,
      nameColor: text,
      subColor: "#64748B",
      accent,
      ring: accent,
      avatarBg: alpha(accent, 0.18),
      nameSize: 34,
    });
    drawStars(
      ctx,
      cx + cw - pad - 5 * 26 * 1.12,
      cy + pad + 26,
      26,
      "#F59E0B",
    );

    const pf = wide ? 19 : 21;
    const pl = layoutPills(ctx, pills, cw - pad * 2, pf);
    const brandH = 78;
    const bottomBlock = pl.height + brandH + 36;
    const qTop = cy + pad + 146;

    drawRichQuote(ctx, {
      box: {
        x: cx + pad,
        y: qTop,
        w: cw - pad * 2,
        h: Math.max(120, cy + ch - bottomBlock - qTop - pad * 0.35),
      },
      text: P.card.quoteText,
      phrase: P.card.highlightPhrase,
      maxSize: wide ? 54 : 50,
      minSize: 24,
      family: SANS,
      weight: 700,
      color: text,
      hlColor: accent,
      hlBg: alpha(accent, 0.14),
      lh: 1.32,
      valign: "middle",
    });

    const by = cy + ch - pad - pl.height - brandH - 10;
    drawPills(ctx, pills, cx + pad, by, cw - pad * 2, pf, {
      fg: accent,
      bg: alpha(accent, 0.1),
      border: alpha(accent, 0.4),
      icon: accent,
    });

    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + pad, cy + ch - pad - brandH + 6);
    ctx.lineTo(cx + cw - pad, cy + ch - pad - brandH + 6);
    ctx.stroke();

    ctx.font = `800 20px ${SANS}`;
    ctx.fillStyle = "#64748B";
    ctx.fillText(
      P.card.badgeLabel.toUpperCase(),
      cx + pad,
      cy + ch - pad - 18,
    );
    drawBrandMark(
      ctx,
      P,
      cx + cw - pad,
      cy + ch - pad - brandH / 2 + 12,
      230,
      52,
      false,
      accent,
    );
    ctx.restore();
    cardPath();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = alpha(accent, 0.55);
    ctx.stroke();
    return;
  }

  /* ================================================================== */
  /* TEMPLATE 10: FOUNDER MEMO NOTE (founder-memo-portrait)             */
  /* ================================================================== */
  if (tplId === "founder-memo-portrait") {
    const surface = P.customSurface || "#FFFDF7";
    const text = P.customText || "#1F2937";
    cardPath();
    ctx.fillStyle = surface;
    ctx.fill();
    ctx.save();
    cardPath();
    ctx.clip();

    ctx.fillStyle = accent;
    ctx.fillRect(cx, cy, cw, 20);
    ctx.font = `900 320px ${SERIF}`;
    ctx.fillStyle = alpha(accent, 0.09);
    ctx.fillText("\u201D", cx + cw - 260, cy + 300);

    ctx.font = `800 21px ${SANS}`;
    ctx.fillStyle = accent;
    ctx.fillText(
      `EXECUTIVE MEMO · ${(P.input.authorName || "").toUpperCase()}`,
      cx + pad,
      cy + 78,
    );
    drawStars(
      ctx,
      cx + cw - pad - 5 * 24 * 1.12,
      cy + 56,
      24,
      "#F59E0B",
    );

    const footerH = Math.round(ch * 0.17);
    const footerTop = cy + ch - footerH;

    drawRichQuote(ctx, {
      box: {
        x: cx + pad,
        y: cy + 118,
        w: cw - pad * 2,
        h: Math.max(140, footerTop - (cy + 118) - 28),
      },
      text: P.card.quoteText,
      phrase: P.card.highlightPhrase,
      maxSize: wide ? 54 : 50,
      minSize: 24,
      family: SERIF,
      weight: 700,
      color: text,
      hlColor: shade(accent, 0.85),
      hlBg: alpha(accent, 0.18),
      lh: 1.36,
      valign: "middle",
    });

    ctx.fillStyle = "#1E1B2E";
    ctx.fillRect(cx, footerTop, cw, footerH);
    const r = Math.min(46, footerH * 0.3);
    drawNameBlock(
      ctx,
      P,
      cx + pad,
      footerTop + (footerH - r * 2) / 2,
      cw * 0.6,
      {
        avatarR: r,
        nameColor: "#FFFFFF",
        subColor: "#CBD5E1",
        accent,
        ring: accent,
        avatarBg: alpha(accent, 0.3),
        nameSize: Math.round(r * 0.64),
      },
    );
    drawBrandMark(
      ctx,
      P,
      cx + cw - pad,
      footerTop + footerH / 2,
      220,
      footerH * 0.5,
      true,
      accent,
    );
    ctx.restore();
    cardPath();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = alpha(accent, 0.65);
    ctx.stroke();
    return;
  }

  /* ================================================================== */
  /* TEMPLATES 11 & 12: BEFORE/AFTER & MYTH/REALITY                     */
  /* ================================================================== */
  if (tplId === "before-after-proof" || tplId === "myth-vs-reality") {
    const isBA = tplId === "before-after-proof";
    const surface = P.customSurface || "#0F172A";
    const text = P.customText || "#F8FAFC";
    cardPath();
    ctx.fillStyle = surface;
    ctx.fill();
    ctx.save();
    cardPath();
    ctx.clip();

    const headerH = 112;
    drawNameBlock(ctx, P, cx + pad, cy + 32, cw * 0.58, {
      avatarR: 42,
      nameColor: text,
      subColor: "#94A3B8",
      accent,
      ring: accent,
      avatarBg: alpha(accent, 0.25),
      nameSize: 28,
    });
    drawBrandMark(
      ctx,
      P,
      cx + cw - pad,
      cy + 74,
      210,
      50,
      true,
      accent,
    );

    const footerH = 82;
    const contentTop = cy + headerH + 22;
    const contentH = ch - headerH - footerH - 36;
    const boxGap = 22;
    const singleBoxH = Math.floor((contentH - boxGap) / 2);

    ctx.fillStyle = "rgba(244, 63, 94, 0.12)";
    ctx.strokeStyle = "rgba(244, 63, 94, 0.45)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cx + pad, contentTop, cw - pad * 2, singleBoxH, 24);
    ctx.fill();
    ctx.stroke();

    ctx.font = `900 20px ${SANS}`;
    ctx.fillStyle = "#FB7185";
    ctx.fillText(
      isBA ? "❌ BEFORE (THE BOTTLENECK)" : "❌ COMMON INDUSTRY MYTH",
      cx + pad + 28,
      contentTop + 38,
    );

    drawRichQuote(ctx, {
      box: {
        x: cx + pad + 28,
        y: contentTop + 52,
        w: cw - pad * 2 - 56,
        h: singleBoxH - 68,
      },
      text: P.card.quoteText,
      phrase: "",
      maxSize: wide ? 36 : 34,
      minSize: 20,
      family: SANS,
      weight: 700,
      color: text,
      hlColor: accent,
      hlBg: alpha(accent, 0.2),
      lh: 1.28,
      valign: "middle",
    });

    const box2Y = contentTop + singleBoxH + boxGap;
    ctx.fillStyle = alpha(accent, 0.16);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cx + pad, box2Y, cw - pad * 2, singleBoxH, 24);
    ctx.fill();
    ctx.stroke();

    ctx.font = `900 20px ${SANS}`;
    ctx.fillStyle = accent;
    ctx.fillText(
      isBA
        ? "✅ AFTER (THE VERIFIED CUSTOMER WIN)"
        : "✅ PROVEN PRACTITIONER REALITY",
      cx + pad + 28,
      box2Y + 38,
    );

    drawRichQuote(ctx, {
      box: {
        x: cx + pad + 28,
        y: box2Y + 52,
        w: cw - pad * 2 - 56,
        h: singleBoxH - 68,
      },
      text:
        P.card.subContextOrReality ||
        `Result: ${P.card.highlightPhrase} with verified implementation.`,
      phrase: P.card.highlightPhrase,
      maxSize: wide ? 36 : 34,
      minSize: 20,
      family: SANS,
      weight: 800,
      color: "#FFFFFF",
      hlColor: "#FFFFFF",
      hlBg: alpha(accent, 0.35),
      lh: 1.28,
      valign: "middle",
    });

    if (pills.length) {
      drawPills(
        ctx,
        pills.slice(0, 3),
        cx + pad,
        cy + ch - footerH + 14,
        cw - pad * 2,
        18,
        {
          fg: "#FFFFFF",
          bg: "rgba(255,255,255,0.08)",
          border: alpha(accent, 0.55),
          icon: accent,
        },
      );
    }

    ctx.restore();
    cardPath();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = accent;
    ctx.stroke();
    return;
  }

  /* ================================================================== */
  /* TEMPLATE 13: PODCAST AUDIO WAVEFORM QUOTE (podcast-clip-quote)     */
  /* ================================================================== */
  if (tplId === "podcast-clip-quote") {
    const surface = P.customSurface || "#0B132B";
    const text = P.customText || "#F8FAFC";
    cardPath();
    ctx.fillStyle = surface;
    ctx.fill();
    ctx.save();
    cardPath();
    ctx.clip();

    const footerH = Math.round(ch * 0.17);
    const bodyH = ch - footerH;
    const pw = hasPortrait ? Math.round(cw * (wide ? 0.35 : 0.38)) : 0;
    const colGap = hasPortrait ? Math.round(cw * 0.032) : 0;
    const tw = cw - pad * 2 - pw - colGap;
    const tx = cx + pad;

    if (hasPortrait) {
      const pz: Zone = {
        x: cx + cw - pad - pw,
        y: cy + Math.round(bodyH * 0.08),
        w: pw,
        h: Math.round(bodyH * 0.84),
      };
      drawFramedPortrait(
        ctx,
        P,
        pz,
        "ring-circle",
        accent,
        surface,
        true,
      );
    }

    ctx.fillStyle = alpha(accent, 0.22);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(tx, cy + pad, 265, 42, 21);
    ctx.fill();
    ctx.stroke();
    ctx.font = `900 17px ${SANS}`;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("🎙️ AUDIO SOUNDBITE", tx + 18, cy + pad + 27);

    const waveY = cy + bodyH - 58;
    const barCount = 28;
    const barGap = 6;
    const barW = Math.max(
      4,
      Math.floor((tw - (barCount - 1) * barGap) / barCount),
    );
    for (let i = 0; i < barCount; i++) {
      const hVal = Math.round(Math.abs(Math.sin(i * 0.45 + 0.5)) * 38 + 14);
      ctx.fillStyle = i % 3 === 0 ? accent : alpha(accent, 0.48);
      ctx.beginPath();
      ctx.roundRect(
        tx + i * (barW + barGap),
        waveY - hVal / 2,
        barW,
        hVal,
        3,
      );
      ctx.fill();
    }

    drawRichQuote(ctx, {
      box: {
        x: tx,
        y: cy + pad + 64,
        w: tw,
        h: Math.max(120, waveY - 36 - (cy + pad + 64)),
      },
      text: P.card.quoteText,
      phrase: P.card.highlightPhrase,
      maxSize: wide ? 46 : 42,
      minSize: 22,
      family: SANS,
      weight: 800,
      color: text,
      hlColor: "#FFFFFF",
      hlBg: alpha(accent, 0.3),
      lh: 1.3,
      valign: "middle",
    });

    const footerTop = cy + bodyH;
    ctx.fillStyle = "#060B19";
    ctx.fillRect(cx, footerTop, cw, footerH);
    const r = Math.min(44, footerH * 0.3);
    drawNameBlock(
      ctx,
      P,
      cx + pad,
      footerTop + (footerH - r * 2) / 2,
      cw * 0.6,
      {
        avatarR: r,
        nameColor: "#FFFFFF",
        subColor: "#94A3B8",
        accent,
        ring: accent,
        avatarBg: alpha(accent, 0.3),
        nameSize: Math.round(r * 0.64),
      },
    );
    drawBrandMark(
      ctx,
      P,
      cx + cw - pad,
      footerTop + footerH / 2,
      220,
      footerH * 0.5,
      true,
      accent,
    );

    ctx.restore();
    cardPath();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = accent;
    ctx.stroke();
    return;
  }

  /* ================================================================== */
  /* TEMPLATE 14: QUOTE + 3 ACTION TAKEAWAYS (checklist-takeaway-card)  */
  /* ================================================================== */
  if (tplId === "checklist-takeaway-card") {
    const surface = P.customSurface || "#FFFDF9";
    const text = P.customText || "#0F172A";
    cardPath();
    ctx.fillStyle = surface;
    ctx.fill();
    ctx.save();
    cardPath();
    ctx.clip();

    const footerH = Math.round(ch * 0.17);
    const bodyH = ch - footerH;
    const pw = hasPortrait ? Math.round(cw * (wide ? 0.34 : 0.36)) : 0;
    const colGap = hasPortrait ? Math.round(cw * 0.032) : 0;
    const tw = cw - pad * 2 - pw - colGap;
    const tx = cx + pad;

    if (hasPortrait) {
      const pz: Zone = {
        x: cx + cw - pad - pw,
        y: cy + Math.round(bodyH * 0.06),
        w: pw,
        h: Math.round(bodyH * 0.88),
      };
      drawFramedPortrait(ctx, P, pz, "rounded", accent, surface, false);
    }

    drawStars(ctx, tx, cy + pad, 26, "#F59E0B");

    const takeaways = [
      P.card.highlightPhrase || "Verified ROI improvement",
      P.card.subContextOrReality || "Implemented with zero engineering bottleneck",
      `${P.input.trustBadge1 || "Verified Customer"} · ${P.input.trustBadge2 || "Easy to Use"}`,
    ];

    const rowH = wide ? 52 : 58;
    const rowGap = 12;
    const checklistTotalH = takeaways.length * rowH + (takeaways.length - 1) * rowGap;
    const checklistTop = cy + bodyH - checklistTotalH - 28;

    drawRichQuote(ctx, {
      box: {
        x: tx,
        y: cy + pad + 44,
        w: tw,
        h: Math.max(100, checklistTop - (cy + pad + 44) - 18),
      },
      text: P.card.quoteText,
      phrase: P.card.highlightPhrase,
      maxSize: wide ? 42 : 38,
      minSize: 20,
      family: SANS,
      weight: 800,
      color: text,
      hlColor: accent,
      hlBg: alpha(accent, 0.14),
      lh: 1.28,
      valign: "middle",
    });

    takeaways.forEach((item, idx) => {
      const ry = checklistTop + idx * (rowH + rowGap);
      ctx.fillStyle = alpha(accent, 0.1);
      ctx.strokeStyle = alpha(accent, 0.45);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(tx, ry, tw, rowH, 16);
      ctx.fill();
      ctx.stroke();

      drawVerified(ctx, tx + 26, ry + rowH / 2, 13, accent);
      ctx.font = `700 ${wide ? 19 : 20}px ${SANS}`;
      ctx.fillStyle = text;
      ctx.textBaseline = "alphabetic";
      ctx.fillText(item.slice(0, 58), tx + 50, ry + rowH / 2 + 7, tw - 66);
    });

    const footerTop = cy + bodyH;
    ctx.fillStyle = "#0F172A";
    ctx.fillRect(cx, footerTop, cw, footerH);
    const r = Math.min(44, footerH * 0.3);
    drawNameBlock(
      ctx,
      P,
      cx + pad,
      footerTop + (footerH - r * 2) / 2,
      cw * 0.6,
      {
        avatarR: r,
        nameColor: "#FFFFFF",
        subColor: "#CBD5E1",
        accent,
        ring: accent,
        avatarBg: alpha(accent, 0.3),
        nameSize: Math.round(r * 0.64),
      },
    );
    drawBrandMark(
      ctx,
      P,
      cx + cw - pad,
      footerTop + footerH / 2,
      220,
      footerH * 0.5,
      true,
      accent,
    );

    ctx.restore();
    cardPath();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = "#0F172A";
    ctx.stroke();
    return;
  }

  /* ================================================================== */
  /* TEMPLATES 1–8: ARCHITECTURAL PORTRAIT-LED SPLIT LAYOUTS            */
  /* ================================================================== */
  const spec = specFor(tplId, P) || specFor("arch-aura-split", P)!;
  const surface = spec.surface;
  cardPath();
  ctx.fillStyle = surface;
  ctx.fill();
  ctx.save();
  cardPath();
  ctx.clip();

  const fh =
    spec.footer === "bar"
      ? Math.round(ch * 0.17)
      : spec.footer === "wave"
        ? Math.round(ch * 0.2)
        : 0;
  const bodyH = ch - fh;
  const bodyBottom = cy + bodyH;

  const right = spec.side === "right";
  const pwFrac = spec.bleed ? 0.42 : wide ? 0.35 : 0.39;
  const pw = hasPortrait ? Math.round(cw * pwFrac) : 0;
  const colGap = hasPortrait ? Math.round(cw * 0.032) : 0;

  const pz: Zone = spec.bleed
    ? { x: cx + cw - pw, y: cy, w: pw, h: ch }
    : {
        x: right ? cx + cw - pad * 0.75 - pw : cx + pad * 0.75,
        y: cy + Math.round(bodyH * 0.05),
        w: pw,
        h: Math.round(bodyH * 0.91),
      };

  if (spec.dots && hasPortrait) {
    ctx.fillStyle = alpha(accent, 0.36);
    for (let gx = 0; gx < 7; gx++) {
      for (let gy = 0; gy < 7; gy++) {
        ctx.beginPath();
        ctx.arc(
          pz.x + pz.w - 14 - gx * 20,
          cy + 26 + gy * 20,
          3.2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
  }

  if (hasPortrait) {
    drawFramedPortrait(
      ctx,
      P,
      pz,
      spec.defaultFrame,
      accent,
      surface,
      spec.dark,
    );
  }

  const footerTop = cy + bodyH;
  if (spec.footer === "bar") {
    ctx.fillStyle = spec.footerColor;
    ctx.fillRect(cx, footerTop, cw, fh);
  } else if (spec.footer === "wave") {
    ctx.fillStyle = alpha(accent, 0.24);
    ctx.beginPath();
    ctx.moveTo(cx, footerTop + fh * 0.08);
    ctx.bezierCurveTo(
      cx + cw * 0.3,
      footerTop - fh * 0.22,
      cx + cw * 0.65,
      footerTop + fh * 0.36,
      cx + cw,
      footerTop - fh * 0.05,
    );
    ctx.lineTo(cx + cw, cy + ch);
    ctx.lineTo(cx, cy + ch);
    ctx.fill();

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(cx, footerTop + fh * 0.26);
    ctx.bezierCurveTo(
      cx + cw * 0.3,
      footerTop - fh * 0.04,
      cx + cw * 0.65,
      footerTop + fh * 0.54,
      cx + cw,
      footerTop + fh * 0.08,
    );
    ctx.lineTo(cx + cw, cy + ch);
    ctx.lineTo(cx, cy + ch);
    ctx.fill();
  }

  const tx = right ? cx + pad : pz.x + pz.w + colGap;
  const tw = hasPortrait
    ? spec.bleed
      ? pz.x - tx - Math.round(cw * 0.025)
      : right
        ? pz.x - tx - colGap
        : cx + cw - pad - tx
    : cw - pad * 2;

  const top = cy + Math.round(pad * 0.85);
  const textMain = spec.text;
  const onDarkText = spec.dark;
  const hlColor = onDarkText ? "#FFFFFF" : accent;

  ctx.font = `900 ${wide ? 112 : 128}px ${SERIF}`;
  ctx.fillStyle = accent;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("“", tx - 6, top + (wide ? 86 : 100));

  const starSize = wide ? 25 : 28;
  drawStars(
    ctx,
    tx + (wide ? 84 : 96),
    top + (wide ? 34 : 42),
    starSize,
    "#F59E0B",
  );

  if (spec.footer === "none") {
    drawBrandMark(
      ctx,
      P,
      tx + tw,
      top + (wide ? 46 : 54),
      Math.min(185, tw * 0.38),
      46,
      onDarkText,
      accent,
    );
  } else if (P.input.starRatingLabel) {
    ctx.font = `900 ${starSize - 3}px ${SANS}`;
    ctx.fillStyle = spec.sub;
    ctx.fillText(
      P.input.starRatingLabel,
      tx + (wide ? 84 : 96) + 5 * starSize * 1.12 + 12,
      top + (wide ? 34 : 42) + starSize * 0.8,
    );
  }

  let qTop = top + (wide ? 110 : 126);
  if (spec.kpi) {
    const stat = extractStat(P.card);
    ctx.font = `900 ${wide ? 88 : 104}px ${SANS}`;
    ctx.fillStyle = accent;
    ctx.fillText(stat, tx, qTop + (wide ? 64 : 78), tw);
    ctx.font = `800 ${wide ? 19 : 22}px ${SANS}`;
    ctx.fillStyle = spec.sub;
    ctx.fillText(
      P.card.badgeLabel.toUpperCase(),
      tx,
      qTop + (wide ? 92 : 112),
      tw,
    );
    qTop += wide ? 110 : 134;
  }

  const pf = wide ? 17 : 19;
  let bottomLimit = bodyBottom - Math.round(pad * 0.45);
  const attribInColumn = spec.footer !== "bar";

  if (spec.footer === "wave") {
    const maxPW = cw * 0.64;
    const pl = layoutPills(ctx, pills.slice(0, 3), maxPW, pf);
    drawPills(
      ctx,
      pills.slice(0, 3),
      cx + pad,
      footerTop + fh * 0.52 - pl.height / 2 + 4,
      maxPW,
      pf,
      {
        fg: "#FFFFFF",
        bg: "rgba(255,255,255,0.16)",
        border: "rgba(255,255,255,0.48)",
        icon: "#FFFFFF",
      },
    );
    drawBrandMark(
      ctx,
      P,
      cx + cw - pad,
      footerTop + fh * 0.55,
      220,
      fh * 0.42,
      true,
      "#FFFFFF",
    );
  } else if (pills.length) {
    const pl = layoutPills(ctx, pills.slice(0, 3), tw, pf);
    bottomLimit -= pl.height;
    drawPills(ctx, pills.slice(0, 3), tx, bottomLimit, tw, pf, {
      fg: onDarkText ? "#FFFFFF" : accent,
      bg: onDarkText ? "rgba(255,255,255,0.09)" : alpha(accent, 0.1),
      border: alpha(accent, 0.55),
      icon: accent,
    });
    bottomLimit -= 16;
  }

  if (attribInColumn) {
    const r = wide ? 36 : 40;
    bottomLimit -= r * 2;
    drawNameBlock(ctx, P, tx, bottomLimit, tw, {
      avatarR: r,
      nameColor: textMain,
      subColor: spec.sub,
      accent,
      ring: accent,
      avatarBg: alpha(accent, onDarkText ? 0.25 : 0.15),
    });
    bottomLimit -= 18;
  }

  drawRichQuote(ctx, {
    box: { x: tx, y: qTop, w: tw, h: Math.max(120, bottomLimit - qTop) },
    text: P.card.quoteText,
    phrase: P.card.highlightPhrase,
    maxSize: wide ? (spec.kpi ? 46 : 52) : spec.kpi ? 38 : 44,
    minSize: 21,
    family: spec.serif ? SERIF : SANS,
    weight: spec.serif ? 700 : 800,
    color: textMain,
    hlColor,
    hlBg: alpha(accent, onDarkText ? 0.28 : 0.14),
    lh: 1.28,
    valign: "middle",
  });

  if (spec.footer === "bar") {
    const r = Math.min(44, fh * 0.29);
    drawNameBlock(
      ctx,
      P,
      cx + pad,
      footerTop + (fh - r * 2) / 2,
      cw * 0.6,
      {
        avatarR: r,
        nameColor: "#FFFFFF",
        subColor: "#CBD5E1",
        accent,
        ring: "rgba(255,255,255,0.88)",
        avatarBg: alpha(accent, 0.3),
        nameSize: Math.round(r * 0.65),
      },
    );
    drawBrandMark(
      ctx,
      P,
      cx + cw - pad,
      footerTop + fh / 2,
      220,
      fh * 0.5,
      true,
      accent,
    );
  }

  ctx.restore();
  cardPath();
  ctx.lineWidth =
    tplId === "arch-aura-split" || tplId === "flagship-footer-split" ? 5 : 3.5;
  ctx.strokeStyle = spec.border;
  ctx.stroke();
}

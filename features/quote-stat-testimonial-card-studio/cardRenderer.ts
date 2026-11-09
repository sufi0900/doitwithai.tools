/**
 * Canvas renderer for the Testimonial / Quote Card Studio.
 * One function (renderQuoteCard) draws any of the 10 templates.
 * Every template shows the selected person (preset or uploaded) and the
 * uploaded brand logo. Quote text auto-fits its box.
 */
import type {
  CardAspectRatioId,
  QuoteCardItem,
  QuoteStudioInput,
  QuoteVisualTemplateId,
} from "./model";

export type PortraitSource = HTMLImageElement | HTMLCanvasElement | ImageBitmap;

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
  /** true = transparent-background person; false = ordinary photo (cover-cropped) */
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
/* small helpers                                                       */
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
  return `#${[r, g, b].map((v) => Math.min(255, v).toString(16).padStart(2, "0")).join("")}`;
}
function dims(img: PortraitSource) {
  if (typeof HTMLImageElement !== "undefined" && img instanceof HTMLImageElement) {
    return { w: img.naturalWidth || img.width, h: img.naturalHeight || img.height };
  }
  return { w: (img as HTMLCanvasElement).width, h: (img as HTMLCanvasElement).height };
}

type Zone = { x: number; y: number; w: number; h: number };

/* ------------------------------------------------------------------ */
/* rich quote text (auto-fit + inline highlight)                       */
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
      // a segment boundary with no whitespace (e.g. highlight followed by ".")
      // must stay glued to the previous word instead of becoming its own token
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
  if (q.valign === "middle") y = q.box.y + Math.max(0, (q.box.h - totalH) / 2);

  const space = ctx.measureText(" ").width;
  ctx.textBaseline = "alphabetic";
  for (const line of lines) {
    const base = y + size * (0.5 * (lhR - 1)) + size * 0.85;
    // positions
    let x = q.box.x;
    const pos: { x: number; w: number; tk: Tok }[] = [];
    for (const tk of line) {
      const w = ctx.measureText(tk.t).width;
      pos.push({ x, w, tk });
      x += w + space;
    }
    // highlight runs
    let i = 0;
    while (i < pos.length) {
      if (pos[i].tk.hl) {
        let j = i;
        while (j + 1 < pos.length && pos[j + 1].tk.hl) j++;
        const rx = pos[i].x - 8;
        const rw = pos[j].x + pos[j].w - pos[i].x + 16;
        ctx.fillStyle = q.hlBg;
        ctx.beginPath();
        ctx.roundRect(rx, base - size * 0.9, rw, size * 1.12, 8);
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
/* primitives: stars, verified check, pills, avatar, portrait, logo    */
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
  const padX = Math.round(fontPx * 0.9);
  const gap = Math.round(fontPx * 0.6);
  const iconW = Math.round(fontPx * 1.2);
  const rows: { label: string; w: number }[][] = [[]];
  let cur = 0;
  for (const label of labels) {
    const w = ctx.measureText(label).width + padX * 2 + iconW;
    if (rows[rows.length - 1].length && cur + gap + w > maxW) {
      rows.push([]);
      cur = 0;
    }
    rows[rows.length - 1].push({ label, w });
    cur += (cur ? gap : 0) + w;
  }
  const pillH = Math.round(fontPx * 2.25);
  return { rows, pillH, gap, padX, iconW, height: rows.length * pillH + (rows.length - 1) * gap };
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
      drawVerified(ctx, xx + L.padX * 0.55 + fontPx * 0.5, yy + L.pillH / 2, fontPx * 0.5, style.icon);
      ctx.fillStyle = style.fg;
      ctx.fillText(p.label, xx + L.padX * 0.55 + L.iconW, yy + L.pillH / 2 + fontPx * 0.34);
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
      let sx: number, sy: number, side: number;
      if (P.portraitIsCutout) {
        side = Math.min(w, h * 0.62);
        sx = (w - side) / 2;
        sy = h * 0.015;
      } else {
        side = Math.min(w, h) * 0.85;
        sx = (w - side) / 2;
        sy = (h - side) * 0.2;
      }
      ctx.drawImage(P.portrait, sx, sy, side, side, cx - r, cy - r, r * 2, r * 2);
    }
  }
  ctx.restore();
  ctx.strokeStyle = ring;
  ctx.lineWidth = Math.max(3, r * 0.08);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPortrait(
  ctx: CanvasRenderingContext2D,
  P: RenderParams,
  zone: Zone,
  radius = 28,
) {
  if (!P.portrait) return;
  const { w, h } = dims(P.portrait);
  if (!w || !h) return;
  const scale = P.input.portraitScale ?? 1;
  const offX = P.input.portraitOffsetX ?? 0;
  ctx.save();
  if (P.portraitIsCutout) {
    let dh = zone.h * scale;
    let dw = (dh * w) / h;
    const maxW = zone.w * 1.05 * scale;
    if (dw > maxW) {
      dw = maxW;
      dh = (dw * h) / w;
    }
    const dx = zone.x + (zone.w - dw) / 2 + offX * zone.w;
    const dy = zone.y + zone.h - dh;
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;
    ctx.drawImage(P.portrait, dx, dy, dw, dh);
  } else {
    ctx.beginPath();
    ctx.roundRect(zone.x, zone.y, zone.w, zone.h, radius);
    ctx.clip();
    const s = Math.max(zone.w / w, zone.h / h) * scale;
    const dw = w * s;
    const dh = h * s;
    ctx.drawImage(
      P.portrait,
      zone.x + (zone.w - dw) / 2 + offX * zone.w,
      zone.y + (zone.h - dh) * 0.15,
      dw,
      dh,
    );
  }
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
  if (P.logo && P.logo.naturalWidth > 0) {
    const r = P.logo.naturalWidth / (P.logo.naturalHeight || 1);
    let dh = maxH;
    let dw = dh * r;
    if (dw > maxW) {
      dw = maxW;
      dh = dw / r;
    }
    ctx.drawImage(P.logo, right - dw, midY - dh / 2, dw, dh);
    return;
  }
  const label = (P.input.brandDomain || "doitwithai.tools").toUpperCase();
  const fs = Math.round(Math.min(maxH * 0.42, 22));
  ctx.font = `900 ${fs}px ${SANS}`;
  const w = Math.min(maxW, ctx.measureText(label).width + fs * 1.8);
  ctx.fillStyle = alpha(accent, onDark ? 0.22 : 0.12);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(right - w, midY - fs * 1.1, w, fs * 2.2, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = onDark ? "#FFFFFF" : accent;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(label, right - w + fs * 0.9, midY + fs * 0.35, w - fs * 1.8);
}

function drawNameBlock(
  ctx: CanvasRenderingContext2D,
  P: RenderParams,
  x: number,
  y: number,
  maxW: number,
  opts: { avatarR: number; nameColor: string; subColor: string; accent: string; ring: string; avatarBg: string; nameSize?: number },
) {
  const r = opts.avatarR;
  drawAvatar(ctx, P, x + r, y + r, r, opts.ring, opts.avatarBg);
  const tx = x + r * 2 + 22;
  const ns = opts.nameSize ?? Math.round(r * 0.62);
  ctx.textBaseline = "alphabetic";
  ctx.font = `900 ${ns}px ${SANS}`;
  ctx.fillStyle = opts.nameColor;
  const name = P.input.authorName || "Customer Name";
  const room = maxW - (tx - x) - ns * 1.6;
  ctx.fillText(name, tx, y + r - 4, room);
  const nw = Math.min(room, ctx.measureText(name).width);
  drawVerified(ctx, tx + nw + ns * 0.8, y + r - ns * 0.35, ns * 0.42, opts.accent);
  ctx.font = `600 ${Math.round(ns * 0.76)}px ${SANS}`;
  ctx.fillStyle = opts.subColor;
  ctx.fillText(P.input.authorHandleOrRole || "Verified Customer", tx, y + r + ns * 0.85, maxW - (tx - x));
}

function extractStat(card: QuoteCardItem) {
  const m = `${card.highlightPhrase} ${card.quoteText}`.match(
    /\d+(?:\.\d+)?\s?(?:%|x|X|×|\+)/,
  );
  return m ? m[0].replace(/\s/g, "") : "5★";
}

/* ------------------------------------------------------------------ */
/* template specs for the generic portrait-led layout                  */
/* ------------------------------------------------------------------ */

interface Spec {
  surface: string;
  text: string;
  sub: string;
  dark: boolean;
  deco: "arch" | "rings" | "dots" | "glow" | "none";
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
    "arch-aura-split": { surface: "#FAF8F5", text: "#1E1B2E", sub: "#5B5870", dark: false, deco: "arch", side: "right", footer: "bar", footerColor: "#261546", border: "#261546" },
    "flagship-footer-split": { surface: "#FFFDF9", text: "#0F172A", sub: "#475569", dark: false, deco: "glow", side: "right", footer: "bar", footerColor: "#0B1325", border: "#0F172A" },
    "wave-trust-pills": { surface: "#FFFFFF", text: "#0F172A", sub: "#475569", dark: false, deco: "glow", side: "right", footer: "wave", footerColor: a, border: shade(a, 0.45) },
    "obsidian-gold-rings": { surface: "#0F172A", text: "#F1F5F9", sub: "#94A3B8", dark: true, deco: "rings", side: "right", footer: "none", footerColor: "#0B1220", border: a },
    "editorial-dot-grid": { surface: "#FDFBF7", text: "#111827", sub: "#4B5563", dark: false, deco: "dots", side: "right", footer: "bar", footerColor: shade(a, 0.34), border: shade(a, 0.34), serif: true },
    "portrait-left-quote": { surface: "#F8FAFC", text: "#0F172A", sub: "#475569", dark: false, deco: "glow", side: "left", footer: "none", footerColor: "#0F172A", border: "#CBD5E1" },
    "full-bleed-portrait": { surface: "#0B132B", text: "#FFFFFF", sub: "#B6C2E2", dark: true, deco: "none", side: "right", footer: "none", footerColor: "#0B132B", border: a, bleed: true },
    "kpi-stat-portrait": { surface: "#0B132B", text: "#F8FAFC", sub: "#A9B6D8", dark: true, deco: "glow", side: "right", footer: "none", footerColor: "#0B132B", border: a, kpi: true },
  };
  const s = base[id];
  if (!s) return null;
  const out = { ...s };
  if (P.customSurface) {
    out.surface = P.customSurface;
  }
  if (P.customText) out.text = P.customText;
  return out;
}

/* ------------------------------------------------------------------ */
/* main entry                                                          */
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

  // Backdrop
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, P.theme.bgStart);
  bg.addColorStop(1, P.theme.bgEnd);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.85, H * 0.12, 10, W * 0.85, H * 0.12, 420);
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
  const tplId = P.input.template;

  const cardPath = () => {
    ctx.beginPath();
    ctx.roundRect(cx, cy, cw, ch, 40);
  };

  /* ---------- Verified post ---------- */
  if (tplId === "x-verified-post") {
    const surface = P.customSurface || "#FFFFFF";
    const text = P.customText || "#0F172A";
    cardPath();
    ctx.fillStyle = surface;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#E2E8F0";
    ctx.stroke();
    ctx.save();
    cardPath();
    ctx.clip();
    const pad = Math.round(cw * 0.06);
    drawNameBlock(ctx, P, cx + pad, cy + pad, cw - pad * 2 - 20, {
      avatarR: 58, nameColor: text, subColor: "#64748B", accent, ring: alpha(accent, 0.6), avatarBg: alpha(accent, 0.18), nameSize: 36,
    });
    drawStars(ctx, cx + cw - pad - 5 * 28 * 1.12, cy + pad + 30, 28, "#F59E0B");
    const pills = [P.input.trustBadge1, P.input.trustBadge2, P.input.trustBadge3].filter(Boolean) as string[];
    const pf = wide ? 20 : 22;
    const pl = layoutPills(ctx, pills, cw - pad * 2, pf);
    const brandH = 80;
    const bottomBlock = pl.height + brandH + 40;
    const qTop = cy + pad + 160;
    drawRichQuote(ctx, {
      box: { x: cx + pad, y: qTop, w: cw - pad * 2, h: cy + ch - bottomBlock - qTop - pad * 0.4 },
      text: P.card.quoteText, phrase: P.card.highlightPhrase,
      maxSize: wide ? 58 : 54, minSize: 24, family: SANS, weight: 600, color: text, hlColor: accent, hlBg: alpha(accent, 0.14), lh: 1.34, valign: "middle",
    });
    const by = cy + ch - pad - pl.height - brandH - 10;
    drawPills(ctx, pills, cx + pad, by, cw - pad * 2, pf, { fg: accent, bg: alpha(accent, 0.1), border: alpha(accent, 0.4), icon: accent });
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + pad, cy + ch - pad - brandH + 6);
    ctx.lineTo(cx + cw - pad, cy + ch - pad - brandH + 6);
    ctx.stroke();
    ctx.font = `700 22px ${SANS}`;
    ctx.fillStyle = "#64748B";
    ctx.fillText(P.card.badgeLabel.toUpperCase(), cx + pad, cy + ch - pad - 18);
    drawBrandMark(ctx, P, cx + cw - pad, cy + ch - pad - brandH / 2 + 14, 240, 56, false, accent);
    ctx.restore();
    return;
  }

  /* ---------- Founder memo ---------- */
  if (tplId === "founder-memo-portrait") {
    const surface = P.customSurface || "#FFF8E7";
    const text = P.customText || "#1F2937";
    cardPath();
    ctx.fillStyle = surface;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = alpha(accent, 0.6);
    ctx.stroke();
    ctx.save();
    cardPath();
    ctx.clip();
    ctx.fillStyle = accent;
    ctx.fillRect(cx, cy, cw, 20);
    ctx.font = `900 360px ${SERIF}`;
    ctx.fillStyle = alpha(accent, 0.1);
    ctx.fillText("\u201D", cx + cw - 300, cy + 330);
    const pad = Math.round(cw * 0.065);
    ctx.font = `800 22px ${SANS}`;
    ctx.fillStyle = "#6B7280";
    ctx.fillText(`MEMO · ${(P.input.authorName || "").toUpperCase()}`, cx + pad, cy + 84);
    drawRichQuote(ctx, {
      box: { x: cx + pad, y: cy + 130, w: cw - pad * 2, h: ch - 130 - 190 },
      text: P.card.quoteText, phrase: P.card.highlightPhrase,
      maxSize: wide ? 60 : 56, minSize: 26, family: SERIF, weight: 700, color: text, hlColor: shade(accent, 0.85), hlBg: alpha(accent, 0.22), lh: 1.38, valign: "middle",
    });
    const ay = cy + ch - pad - 96;
    drawNameBlock(ctx, P, cx + pad, ay, cw * 0.62, {
      avatarR: 48, nameColor: text, subColor: "#6B7280", accent, ring: accent, avatarBg: alpha(accent, 0.2), nameSize: 30,
    });
    drawBrandMark(ctx, P, cx + cw - pad, ay + 48, 240, 60, false, accent);
    ctx.restore();
    return;
  }

  /* ---------- Generic portrait-led layouts ---------- */
  const spec = specFor(tplId, P) || specFor("flagship-footer-split", P)!;
  const surface = spec.surface;
  cardPath();
  ctx.fillStyle = surface;
  ctx.fill();
  ctx.save();
  cardPath();
  ctx.clip();

  const fh = spec.footer === "bar" ? Math.round(ch * 0.17) : spec.footer === "wave" ? Math.round(ch * 0.21) : 0;
  const bodyH = ch - fh;
  const bodyBottom = cy + bodyH;
  const pad = Math.round(cw * 0.055);

  const pwFrac = spec.bleed ? 0.55 : wide ? 0.36 : 0.42;
  const pw = hasPortrait ? Math.round(cw * pwFrac) : 0;
  const right = spec.side === "right";
  const pz: Zone = spec.bleed
    ? { x: cx + cw - pw, y: cy, w: pw, h: ch }
    : { x: right ? cx + cw - pw : cx, y: cy + Math.round(ch * 0.05), w: pw, h: bodyH - Math.round(ch * 0.05) };

  // decoration behind person
  const dz = pz;
  if (spec.deco === "arch" && hasPortrait) {
    const aw = dz.w * 0.82;
    ctx.fillStyle = alpha(accent, 0.2);
    ctx.beginPath();
    ctx.roundRect(dz.x + (dz.w - aw) / 2, dz.y + dz.h * 0.1, aw, dz.h * 0.9, [aw / 2, aw / 2, 0, 0]);
    ctx.fill();
  } else if (spec.deco === "rings" && hasPortrait) {
    ctx.strokeStyle = alpha(accent, 0.35);
    ctx.lineWidth = 2;
    for (const f of [0.95, 0.68, 0.42]) {
      ctx.beginPath();
      ctx.arc(dz.x + dz.w / 2, dz.y + dz.h * 0.62, dz.w * f * 0.62, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (spec.deco === "dots" && hasPortrait) {
    ctx.fillStyle = alpha(accent, 0.4);
    for (let gx = 0; gx < 8; gx++) {
      for (let gy = 0; gy < 8; gy++) {
        ctx.beginPath();
        ctx.arc(dz.x + dz.w - 40 - gx * 22, dz.y + 30 + gy * 22, 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (spec.deco === "glow" && hasPortrait) {
    const g = ctx.createRadialGradient(dz.x + dz.w / 2, dz.y + dz.h * 0.6, 10, dz.x + dz.w / 2, dz.y + dz.h * 0.6, dz.w * 0.75);
    g.addColorStop(0, alpha(accent, spec.dark ? 0.45 : 0.28));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(dz.x - 40, dz.y, dz.w + 80, dz.h);
  }

  if (hasPortrait) drawPortrait(ctx, P, pz);

  if (spec.bleed && hasPortrait) {
    const g = ctx.createLinearGradient(pz.x - 10, 0, pz.x + pz.w * 0.5, 0);
    g.addColorStop(0, surface);
    g.addColorStop(1, alpha(isHex7(surface) ? surface : "#0B132B", 0));
    ctx.fillStyle = g;
    ctx.fillRect(pz.x - 10, cy, pz.w * 0.5 + 10, ch);
  }

  // footer
  const footerTop = cy + bodyH;
  if (spec.footer === "bar") {
    ctx.fillStyle = spec.footerColor;
    ctx.fillRect(cx, footerTop, cw, fh);
  } else if (spec.footer === "wave") {
    ctx.fillStyle = alpha(accent, 0.25);
    ctx.beginPath();
    ctx.moveTo(cx, footerTop + fh * 0.1);
    ctx.bezierCurveTo(cx + cw * 0.3, footerTop - fh * 0.25, cx + cw * 0.65, footerTop + fh * 0.4, cx + cw, footerTop - fh * 0.05);
    ctx.lineTo(cx + cw, cy + ch);
    ctx.lineTo(cx, cy + ch);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(cx, footerTop + fh * 0.3);
    ctx.bezierCurveTo(cx + cw * 0.3, footerTop - fh * 0.05, cx + cw * 0.65, footerTop + fh * 0.6, cx + cw, footerTop + fh * 0.1);
    ctx.lineTo(cx + cw, cy + ch);
    ctx.lineTo(cx, cy + ch);
    ctx.fill();
  }

  // text column
  const tx = right ? cx + pad : cx + pw + Math.round(pad * 0.7);
  const tw = spec.bleed ? Math.round(cw * 0.6) - pad : cw - pw - pad * 1.7;
  const top = cy + Math.round(pad * 0.85);
  const textMain = spec.text;
  const onDarkText = spec.dark;
  const hlColor = onDarkText ? shade(accent, 1.0) : accent;

  // brand mark top-right of column for 'bleed' / 'none' layouts
  ctx.font = `900 ${wide ? 120 : 140}px ${SERIF}`;
  ctx.fillStyle = accent;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("“", tx - 6, top + (wide ? 92 : 110));
  const starSize = wide ? 26 : 30;
  drawStars(ctx, tx + (wide ? 90 : 104), top + (wide ? 38 : 46), starSize, "#F59E0B");
  if (P.input.starRatingLabel && spec.footer !== "none") {
    ctx.font = `900 ${starSize - 2}px ${SANS}`;
    ctx.fillStyle = spec.sub;
    ctx.fillText(P.input.starRatingLabel, tx + (wide ? 90 : 104) + 5 * starSize * 1.12 + 14, top + (wide ? 38 : 46) + starSize * 0.8);
  }

  if (spec.footer === "none") {
    drawBrandMark(ctx, P, tx + tw, top + (wide ? 36 : 44), Math.min(200, tw * 0.4), 54, onDarkText, accent);
  }

  let qTop = top + (wide ? 118 : 138);
  if (spec.kpi) {
    const stat = extractStat(P.card);
    ctx.font = `900 ${wide ? 96 : 118}px ${SANS}`;
    ctx.fillStyle = accent;
    ctx.fillText(stat, tx, qTop + (wide ? 70 : 90), tw);
    ctx.font = `800 ${wide ? 20 : 24}px ${SANS}`;
    ctx.fillStyle = spec.sub;
    ctx.fillText(P.card.badgeLabel.toUpperCase(), tx, qTop + (wide ? 100 : 128), tw);
    qTop += wide ? 120 : 150;
  }

  // bottom blocks
  const pills = [P.input.trustBadge1, P.input.trustBadge2, P.input.trustBadge3].filter(Boolean) as string[];
  const pf = wide ? 18 : 21;
  let bottomLimit = bodyBottom - Math.round(pad * 0.5);
  const attribInColumn = spec.footer !== "bar";
  const attribH = attribInColumn ? 2 * (wide ? 40 : 46) + 10 : 0;

  if (spec.footer === "wave") {
    // pills live inside the wave footer
    const maxPW = cw * 0.64;
    const pl = layoutPills(ctx, pills.slice(0, 3), maxPW, pf - 1);
    drawPills(ctx, pills.slice(0, 3), cx + pad, footerTop + fh * 0.5 - pl.height / 2 + 6, maxPW, pf - 1, {
      fg: "#FFFFFF", bg: "rgba(255,255,255,0.16)", border: "rgba(255,255,255,0.45)", icon: "#FFFFFF",
    });
    drawBrandMark(ctx, P, cx + cw - pad, footerTop + fh * 0.55, 230, fh * 0.42, true, "#FFFFFF");
  } else if (pills.length) {
    const pl = layoutPills(ctx, pills.slice(0, 3), tw, pf);
    bottomLimit -= pl.height;
    drawPills(ctx, pills.slice(0, 3), tx, bottomLimit, tw, pf, {
      fg: onDarkText ? "#FFFFFF" : accent,
      bg: onDarkText ? "rgba(255,255,255,0.08)" : alpha(accent, 0.1),
      border: alpha(accent, 0.55),
      icon: accent,
    });
    bottomLimit -= 18;
  }

  if (attribInColumn) {
    const r = wide ? 40 : 46;
    bottomLimit -= r * 2;
    drawNameBlock(ctx, P, tx, bottomLimit, tw, {
      avatarR: r, nameColor: textMain, subColor: spec.sub, accent, ring: accent,
      avatarBg: alpha(accent, onDarkText ? 0.25 : 0.15),
    });
    bottomLimit -= 22;
  }

  drawRichQuote(ctx, {
    box: { x: tx, y: qTop, w: tw, h: Math.max(140, bottomLimit - qTop) },
    text: P.card.quoteText,
    phrase: P.card.highlightPhrase,
    maxSize: wide ? (spec.kpi ? 50 : 58) : spec.kpi ? 40 : 48,
    minSize: 22,
    family: spec.serif ? SERIF : SANS,
    weight: spec.serif ? 700 : 800,
    color: textMain,
    hlColor,
    hlBg: alpha(accent, onDarkText ? 0.2 : 0.14),
    lh: 1.3,
  });

  // footer bar content
  if (spec.footer === "bar") {
    const r = Math.min(46, fh * 0.3);
    drawNameBlock(ctx, P, cx + pad, footerTop + (fh - r * 2) / 2, cw * 0.6, {
      avatarR: r, nameColor: "#FFFFFF", subColor: "#B6C2E2", accent, ring: "rgba(255,255,255,0.85)",
      avatarBg: alpha(accent, 0.3), nameSize: Math.round(r * 0.66),
    });
    drawBrandMark(ctx, P, cx + cw - pad, footerTop + fh / 2, 220, fh * 0.52, true, accent);
  }

  ctx.restore();
  // border on top
  cardPath();
  ctx.lineWidth = tplId === "arch-aura-split" || tplId === "flagship-footer-split" ? 5 : 3;
  ctx.strokeStyle = spec.border;
  ctx.stroke();
}

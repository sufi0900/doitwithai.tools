"use client";

import { TemplateThumbnail } from "@/features/tool-ui/InfographicArtwork";
import studioStyles from "@/features/tool-ui/visual-studio.module.css";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  FileText,
  MessageSquareQuote,
  PackageCheck,
  Palette,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Type,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";
import ToolRunOverlay, {
  focusToolSection,
} from "@/features/tool-ui/ToolRunOverlay";
import PlatformBrandIcon from "@/features/tool-ui/PlatformBrandIcon";
import {
  copyCanvasImageToClipboard,
  downloadCanvasAsEmbeddedSvg,
  downloadCanvasAsPng,
  printCanvasAsPdfPoster,
  resolveStudioTheme,
  STUDIO_COLOR_THEMES,
  type CustomStudioColorOverrides,
  type StudioColorThemeId,
} from "@/features/tool-ui/visualCardExport";
import {
  buildDeterministicQuotePack,
  DEFAULT_QUOTE_STUDIO_INPUT,
  type QuoteCardItem,
  type QuoteStudioInput,
  type QuoteStudioPack,
  type QuoteVisualTemplateId,
} from "./model";

const QUOTE_TEMPLATES: {
  id: QuoteVisualTemplateId;
  label: string;
  desc: string;
}[] = [
  {
    id: "verified-post-screenshot",
    label: "1. Verified Post / X Card",
    desc: "Clean social post card with avatar, verified check & metrics",
  },
  {
    id: "highlighter-quote",
    label: "2. Neon Highlighter Quote",
    desc: "Editorial card with highlighted key opening ribbon phrase",
  },
  {
    id: "founder-memo-note",
    label: "3. Founder Memo / Notes Card",
    desc: "Warm Apple-Notes / executive memo aesthetic that earns saves",
  },
  {
    id: "testimonial-5-star",
    label: "4. 5-Star Social Proof Review",
    desc: "Client testimonial card with 5 golden stars & attribution",
  },
  {
    id: "myth-vs-reality",
    label: "5. Contrarian Myth vs. Reality",
    desc: "Splits common industry myth vs. proven practitioner truth",
  },
  {
    id: "executive-pull-quote",
    label: "6. Magazine Pull-Quote Poster",
    desc: "Oversized quotation marks, serif typography & editorial frame",
  },
  {
    id: "oversized-kpi-stat",
    label: "7. Oversized KPI Metric Callout",
    desc: "Giant benchmark figure + supporting quote & takeaway bar",
  },
  {
    id: "before-after-proof",
    label: "8. Before vs. After Case Study",
    desc: "Contrasts old bottleneck state vs. new quantified outcome",
  },
  {
    id: "podcast-clip-quote",
    label: "9. Podcast Audio Waveform Card",
    desc: "Speaker badge, audio waveform bars & quotable soundbite",
  },
  {
    id: "glassmorphic-saas-card",
    label: "10. Glassmorphic SaaS Insight",
    desc: "Modern frosted glass frame with glowing gradient accents",
  },
  {
    id: "boardroom-white-frame",
    label: "11. Executive Boardroom Frame",
    desc: "Harvard/McKinsey style double-bordered editorial insight",
  },
  {
    id: "checklist-takeaway-card",
    label: "12. Quote + 3 Action Takeaways",
    desc: "Pairs the core quote with 3 checkmarked execution bullets",
  },
];

function wrapQuoteLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = w;
      if (lines.length >= maxLines - 1) break;
    } else {
      cur = test;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines;
}

const MIN_QUOTE_CARDS = 2;
const MAX_QUOTE_CARDS = 8;

export default function QuoteStatTestimonialCardStudioClient() {
  const [input, setInput] = useState<QuoteStudioInput>(
    DEFAULT_QUOTE_STUDIO_INPUT,
  );
  const [aiPack, setAiPack] = useState<QuoteStudioPack | null>(null);
  const [cards, setCards] = useState<QuoteCardItem[]>(
    () => buildDeterministicQuotePack(DEFAULT_QUOTE_STUDIO_INPUT).cards,
  );
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [themeId, setThemeId] = useState<StudioColorThemeId>("royal-cobalt");
  const [customColors, setCustomColors] = useState<CustomStudioColorOverrides>(
    {},
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const activeTheme = useMemo(
    () => resolveStudioTheme(themeId, customColors),
    [themeId, customColors],
  );

  const fallbackPack = useMemo(
    () => buildDeterministicQuotePack(input),
    [input],
  );
  const pack = aiPack || fallbackPack;

  useEffect(() => {
    setCards(pack.cards);
    setActiveCardIdx(0);
  }, [pack]);

  const activeCard = cards[activeCardIdx] || cards[0];
  const canAddCard = cards.length < MAX_QUOTE_CARDS;
  const canRemoveCard = cards.length > MIN_QUOTE_CARDS;

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function handleAddQuoteCard() {
    if (!canAddCard) return;
    const nextIdx = cards.length + 1;
    const newCard: QuoteCardItem = {
      id: `quote-custom-${Date.now()}`,
      badgeLabel: `INSIGHT #0${nextIdx}`,
      highlightPhrase: "Clarity compounds faster than volume.",
      quoteText:
        "Every high-performing visual card focuses on a single verifiable takeaway that your audience can apply immediately.",
      subContextOrReality:
        "Pair every post with a clean, high-contrast visual card.",
    };
    setCards((prev) => [...prev, newCard]);
    setActiveCardIdx(cards.length);
    notify(`Added Quote Card #0${nextIdx}!`);
  }

  function handleRemoveQuoteCard() {
    if (!canRemoveCard) return;
    const nextCards = cards.filter((_, idx) => idx !== activeCardIdx);
    setCards(nextCards);
    setActiveCardIdx(Math.max(0, activeCardIdx - 1));
    notify(`Removed quote card (${nextCards.length} cards remaining).`);
  }

  async function runGenerateAiQuotes(overrideInput?: QuoteStudioInput) {
    const payload = overrideInput || input;
    setLoading(true);
    try {
      const res = await fetch(
        "/api/ai-tools/quote-stat-testimonial-card-studio",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (data?.pack) {
        setAiPack(data.pack);
        setCards(data.pack.cards);
        setActiveCardIdx(0);
        notify("Extracted 5 high-impact quote cards!");
      }
      focusToolSection(resultsRef.current);
    } catch {
      notify("Updated visual quote cards.");
      focusToolSection(resultsRef.current);
    } finally {
      setLoading(false);
    }
  }

  function updateActiveCard(field: keyof QuoteCardItem, value: string) {
    setCards((prev) =>
      prev.map((c, idx) =>
        idx === activeCardIdx ? { ...c, [field]: value } : c,
      ),
    );
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeCard) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1080;
    const H = 1080;
    canvas.width = W;
    canvas.height = H;

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, activeTheme.bgStart);
    grad.addColorStop(1, activeTheme.bgEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Ambient corner glow
    const glow = ctx.createRadialGradient(
      W * 0.85,
      H * 0.15,
      20,
      W * 0.85,
      H * 0.15,
      360,
    );
    glow.addColorStop(0, `${activeTheme.accent}33`);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    const cardX = 80;
    const cardY = 96;
    const cardW = W - 160;
    const cardH = H - 192;

    ctx.fillStyle = activeTheme.cardBg;
    ctx.strokeStyle =
      input.template === "boardroom-white-frame" ||
      input.template === "glassmorphic-saas-card"
        ? activeTheme.accent
        : activeTheme.cardBorder;
    ctx.lineWidth = input.template === "boardroom-white-frame" ? 4 : 3;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 36);
    ctx.fill();
    ctx.stroke();

    if (input.template === "boardroom-white-frame") {
      ctx.strokeStyle = `${activeTheme.accent}55`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cardX + 16, cardY + 16, cardW - 32, cardH - 32, 26);
      ctx.stroke();
    }

    const innerX = cardX + 64;
    const innerW = cardW - 128;
    const bodyRegionTop = cardY + 150;
    const bodyRegionBottom = cardY + cardH - 76;
    const bodyRegionMid = (bodyRegionTop + bodyRegionBottom) / 2;

    if (input.template === "verified-post-screenshot") {
      ctx.fillStyle = activeTheme.accentSecondary;
      ctx.beginPath();
      ctx.arc(innerX + 42, cardY + 96, 42, 0, Math.PI * 2);
      ctx.fill();

      const initials = (input.authorName || "SM")
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 28px system-ui, -apple-system, sans-serif";
      ctx.fillText(initials, innerX + 22, cardY + 106);

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "800 28px system-ui, -apple-system, sans-serif";
      ctx.fillText(input.authorName, innerX + 104, cardY + 88);

      const nameW = ctx.measureText(input.authorName).width;
      ctx.fillStyle = "#1D9BF0";
      ctx.beginPath();
      ctx.arc(innerX + 124 + nameW, cardY + 79, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 16px system-ui, -apple-system, sans-serif";
      ctx.fillText("✓", innerX + 118 + nameW, cardY + 85);

      ctx.fillStyle = activeTheme.textSub;
      ctx.font = "500 21px system-ui, -apple-system, sans-serif";
      ctx.fillText(input.authorHandleOrRole, innerX + 104, cardY + 120);

      // Vertically center quote + callout box inside bodyRegion
      ctx.font = "600 37px system-ui, -apple-system, sans-serif";
      const qLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW, 6);
      const qH = qLines.length * 50;
      const calloutH = 88;
      const totalH = qH + 28 + calloutH;
      let qy = Math.max(bodyRegionTop + 34, bodyRegionMid - totalH / 2 + 34);

      ctx.fillStyle = activeTheme.textMain;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 50;
      }

      const boxY = qy - 16;
      ctx.fillStyle = `${activeTheme.accent}20`;
      ctx.strokeStyle = activeTheme.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(innerX, boxY, innerW, calloutH, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = activeTheme.accent;
      ctx.font = "800 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        `💡 ${activeCard.subContextOrReality.slice(0, 62)}`,
        innerX + 24,
        boxY + 52,
      );
    } else if (input.template === "testimonial-5-star") {
      ctx.fillStyle = "#F59E0B";
      ctx.font = "900 44px system-ui, -apple-system, sans-serif";
      ctx.fillText("★ ★ ★ ★ ★", innerX, cardY + 102);

      ctx.fillStyle = activeTheme.accent;
      ctx.font = "800 20px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        activeCard.badgeLabel.toUpperCase(),
        innerX + 275,
        cardY + 96,
      );

      // Vertically center the testimonial quote & author signature
      ctx.font = "700 39px Georgia, serif";
      const qLines = wrapQuoteLines(
        ctx,
        `"${activeCard.quoteText}"`,
        innerW,
        6,
      );
      const totalH = qLines.length * 52 + 110;
      let qy = Math.max(bodyRegionTop + 36, bodyRegionMid - totalH / 2 + 36);

      ctx.fillStyle = activeTheme.textMain;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 52;
      }

      ctx.fillStyle = activeTheme.accent;
      ctx.fillRect(innerX, qy + 4, 90, 6);

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "800 28px system-ui, -apple-system, sans-serif";
      ctx.fillText(input.authorName, innerX, qy + 52);

      ctx.fillStyle = activeTheme.textSub;
      ctx.font = "500 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(input.authorHandleOrRole, innerX, qy + 84);
    } else if (
      input.template === "myth-vs-reality" ||
      input.template === "before-after-proof"
    ) {
      const boxH = Math.floor((cardH - 175) / 2);
      const isBeforeAfter = input.template === "before-after-proof";

      ctx.fillStyle = "rgba(244, 63, 94, 0.14)";
      ctx.strokeStyle = "#F43F5E";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(innerX, cardY + 56, innerW, boxH, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#F43F5E";
      ctx.font = "900 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        isBeforeAfter ? "✗ BEFORE: OLD BOTTLENECK" : "✗ COMMON INDUSTRY MYTH",
        innerX + 28,
        cardY + 102,
      );

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "700 29px system-ui, -apple-system, sans-serif";
      const mLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW - 56, 4);
      const mBlockH = mLines.length * 39;
      let my =
        cardY +
        118 +
        Math.max(0, (boxH - 76 - mBlockH) / 2) +
        28;
      for (const l of mLines) {
        ctx.fillText(l, innerX + 28, my);
        my += 39;
      }

      const ryTop = cardY + 56 + boxH + 26;
      ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(innerX, ryTop, innerW, boxH, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#10B981";
      ctx.font = "900 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        isBeforeAfter
          ? "✓ AFTER: PROVEN WORKFLOW RESULT"
          : "✓ PRACTITIONER REALITY",
        innerX + 28,
        ryTop + 46,
      );

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "700 29px system-ui, -apple-system, sans-serif";
      const rLines = wrapQuoteLines(
        ctx,
        activeCard.subContextOrReality,
        innerW - 56,
        4,
      );
      const rBlockH = rLines.length * 39;
      let ry =
        ryTop +
        62 +
        Math.max(0, (boxH - 76 - rBlockH) / 2) +
        28;
      for (const l of rLines) {
        ctx.fillText(l, innerX + 28, ry);
        ry += 39;
      }
    } else if (input.template === "oversized-kpi-stat") {
      const statMatch =
        activeCard.quoteText.match(/\d+(?:\.\d+)?(?:\s*%|\s*x|\+)/i)?.[0] ||
        "2.4x";

      ctx.font = "700 36px system-ui, -apple-system, sans-serif";
      const qLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW, 5);
      const totalH = 148 + 44 + qLines.length * 48;
      const startY = Math.max(cardY + 64, bodyRegionMid - totalH / 2);

      ctx.fillStyle = `${activeTheme.accent}20`;
      ctx.strokeStyle = activeTheme.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(innerX, startY, 280, 148, 26);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = activeTheme.accent;
      ctx.font = "900 76px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(statMatch, innerX + 140, startY + 98);
      ctx.textAlign = "left";

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "900 28px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        activeCard.badgeLabel.toUpperCase(),
        innerX + 310,
        startY + 50,
      );
      ctx.fillStyle = activeTheme.textSub;
      ctx.font = "600 24px system-ui, -apple-system, sans-serif";
      const hlLines = wrapQuoteLines(
        ctx,
        activeCard.highlightPhrase,
        innerW - 310,
        2,
      );
      hlLines.forEach((l, li) =>
        ctx.fillText(l, innerX + 310, startY + 90 + li * 32),
      );

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "700 36px system-ui, -apple-system, sans-serif";
      let qy = startY + 148 + 44 + 30;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 48;
      }
    } else if (input.template === "podcast-clip-quote") {
      ctx.fillStyle = activeTheme.accent;
      ctx.beginPath();
      ctx.roundRect(innerX, cardY + 62, 260, 44, 22);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 18px system-ui, -apple-system, sans-serif";
      ctx.fillText("🎙️ AUDIO CLIP HIGHLIGHT", innerX + 20, cardY + 90);

      ctx.font = "800 36px system-ui, -apple-system, sans-serif";
      const qLines = wrapQuoteLines(
        ctx,
        `"${activeCard.quoteText}"`,
        innerW,
        5,
      );
      const qH = qLines.length * 48;
      const availMid = (cardY + 125 + (cardY + cardH - 185)) / 2;
      let qy = availMid - qH / 2 + 32;

      ctx.fillStyle = activeTheme.textMain;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 48;
      }

      const waveY = cardY + cardH - 175;
      const barCount = 38;
      const barGap = 8;
      const barW = Math.floor((innerW - barGap * (barCount - 1)) / barCount);
      for (let i = 0; i < barCount; i++) {
        const bh = 22 + ((i * 19 + 7) % 58);
        ctx.fillStyle =
          i < barCount * 0.62 ? activeTheme.accent : "rgba(148,163,184,0.32)";
        ctx.beginPath();
        ctx.roundRect(
          innerX + i * (barW + barGap),
          waveY + (80 - bh) / 2,
          barW,
          bh,
          4,
        );
        ctx.fill();
      }
    } else if (input.template === "checklist-takeaway-card") {
      ctx.font = "800 34px system-ui, -apple-system, sans-serif";
      const qLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW, 4);
      const bullets = [
        activeCard.highlightPhrase,
        activeCard.subContextOrReality,
        `Full breakdown at ${input.brandDomain}`,
      ];
      const totalH = 44 + qLines.length * 45 + 24 + bullets.length * 76;
      const startY = Math.max(cardY + 60, bodyRegionMid - totalH / 2);

      ctx.fillStyle = activeTheme.accent;
      ctx.font = "900 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        `⚡ ${activeCard.badgeLabel.toUpperCase()}`,
        innerX,
        startY + 24,
      );

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "800 34px system-ui, -apple-system, sans-serif";
      let qy = startY + 76;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 45;
      }

      qy += 16;
      bullets.forEach((b) => {
        ctx.fillStyle = `${activeTheme.accentSecondary}22`;
        ctx.beginPath();
        ctx.roundRect(innerX, qy, innerW, 62, 16);
        ctx.fill();
        ctx.fillStyle = activeTheme.accentSecondary;
        ctx.font = "900 24px system-ui, -apple-system, sans-serif";
        ctx.fillText("✓", innerX + 20, qy + 39);
        ctx.fillStyle = activeTheme.textMain;
        ctx.font = "700 22px system-ui, -apple-system, sans-serif";
        ctx.fillText(b.slice(0, 56), innerX + 56, qy + 39);
        qy += 76;
      });
    } else if (input.template === "founder-memo-note") {
      ctx.fillStyle = "#F59E0B";
      ctx.fillRect(cardX, cardY, cardW, 18);

      ctx.font = "800 38px system-ui, -apple-system, sans-serif";
      const qLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW, 5);
      ctx.font = "500 25px system-ui, -apple-system, sans-serif";
      const subLines = wrapQuoteLines(
        ctx,
        activeCard.subContextOrReality,
        innerW,
        3,
      );
      const totalH = 54 + qLines.length * 52 + 24 + subLines.length * 36;
      const startY = Math.max(cardY + 64, bodyRegionMid - totalH / 2);

      ctx.fillStyle = "#D97706";
      ctx.font = "800 21px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        `📝 FOUNDER MEMO · ${activeCard.badgeLabel.toUpperCase()}`,
        innerX,
        startY + 24,
      );

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "800 38px system-ui, -apple-system, sans-serif";
      let qy = startY + 84;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 52;
      }

      ctx.fillStyle = activeTheme.textSub;
      ctx.font = "500 25px system-ui, -apple-system, sans-serif";
      qy += 14;
      for (const l of subLines) {
        ctx.fillText(l, innerX, qy);
        qy += 36;
      }
    } else {
      // Highlighter Quote, Executive Pull-Quote, Glassmorphic, or Boardroom Frame — Vertically Centered!
      ctx.font =
        input.template === "executive-pull-quote"
          ? "700 38px Georgia, serif"
          : "800 37px system-ui, -apple-system, sans-serif";
      const qLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW, 6);
      const totalH = 140 + qLines.length * 50;
      const startY = Math.max(cardY + 64, bodyRegionMid - totalH / 2);

      ctx.fillStyle = activeTheme.accent;
      ctx.font = "900 110px Georgia, serif";
      ctx.fillText("“", innerX - 10, startY + 62);

      ctx.fillStyle = activeTheme.accent;
      ctx.beginPath();
      ctx.roundRect(innerX, startY + 74, innerW, 56, 14);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 25px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        activeCard.highlightPhrase.slice(0, 48),
        innerX + 22,
        startY + 110,
      );

      ctx.fillStyle = activeTheme.textMain;
      ctx.font =
        input.template === "executive-pull-quote"
          ? "700 38px Georgia, serif"
          : "800 37px system-ui, -apple-system, sans-serif";
      let qy = startY + 186;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 50;
      }
    }

    // Bottom Attribution Bar Inside Card
    ctx.fillStyle = activeTheme.textSub;
    ctx.font = "700 20px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      `${input.authorName} · ${input.brandDomain}`,
      innerX,
      cardY + cardH - 36,
    );
  }, [input, activeCard, activeTheme]);

  function downloadActiveQuotePng() {
    downloadCanvasAsPng(
      canvasRef.current,
      `quote-visual-card-0${activeCardIdx + 1}.png`,
    );
    notify(`Downloaded Quote Card #0${activeCardIdx + 1} (.PNG)!`);
  }

  function downloadQuoteAndCaptionPackage() {
    downloadActiveQuotePng();
    navigator.clipboard.writeText(pack.socialCaption);
    const blob = new Blob([pack.socialCaption], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quote-cards-social-caption.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded Quote PNG + Social Caption TXT!");
  }

  return (
    <section
      aria-label="Viral Quote, Stat Callout and Testimonial Card Studio"
      className={`${studioStyles.studio} mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6`}
    >
      <ToolRunOverlay
        active={loading}
        title="Extracting Best Quotes & Designing Visual Cards..."
        description="Building 5 shareable quote, tweet-style, and testimonial graphics."
      />

      <UrlArticleExtractorBar
        label="Option 1: Fetch Any Blog Post or Article URL to Auto-Extract the 5 Best Shareable Quotes"
        placeholder="Paste an article URL to extract quotable insights & build visual cards..."
        onExtracted={(data) => {
          setAiPack(null);
          let domain = "doitwithai.tools";
          try {
            domain = new URL(data.url).hostname.replace(/^www\./, "");
          } catch {}
          const nextInput: QuoteStudioInput = {
            ...input,
            authorName: data.author || input.authorName,
            brandDomain: domain,
            sourceContent:
              (data.paragraphs || []).slice(0, 6).join("\n\n") ||
              data.cleanText ||
              input.sourceContent,
          };
          setInput(nextInput);
          void runGenerateAiQuotes(nextInput);
        }}
        onSelectSubTopic={(sub) => {
          setAiPack(null);
          const nextInput: QuoteStudioInput = {
            ...input,
            sourceContent: sub.content,
          };
          setInput(nextInput);
          void runGenerateAiQuotes(nextInput);
        }}
      />

      <div
        ref={resultsRef}
        tabIndex={-1}
        className="shadow-xs space-y-6 rounded-2xl border-2 border-[#4058d0]/25 bg-white p-5 focus:outline-none dark:border-[#4058d0]/35 dark:bg-[#111827] sm:p-6"
      >
        {toast && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
          >
            <CheckCircle2 size={15} />
            <span>{toast}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <PlatformBrandIcon
              platform="x"
              slug="quote-stat-testimonial-card-studio"
              size={42}
            />
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#4058d0]">
                <MessageSquareQuote size={14} />
                12 Built-In Quote, Stat &amp; Testimonial Card Templates
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Viral Quote, Founder Memo &amp; Testimonial Visual Card Studio
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void runGenerateAiQuotes()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5]"
            >
              <Sparkles size={14} />
              AI Extract 5 Best Quotes
            </button>
            <button
              type="button"
              onClick={downloadQuoteAndCaptionPackage}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#4058d0] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#3452d1]"
            >
              <PackageCheck size={15} />
              Download Quote PNG + Caption Package
            </button>
          </div>
        </div>

        {/* OPEN BY DEFAULT SO ALL 12 QUOTE TEMPLATES ARE IMMEDIATELY VISIBLE */}
        <details open className="rounded-2xl border border-slate-400/30 p-4">
          <summary className="cursor-pointer font-extrabold text-slate-900 dark:text-white">
            Choose a Quote, Stat or Testimonial Card Template (12 Layouts)
          </summary>
          <div className="mt-4">
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {QUOTE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() =>
                    setInput((prev) => ({ ...prev, template: tpl.id }))
                  }
                  className={`rounded-xl border p-2.5 text-left transition ${
                    input.template === tpl.id
                      ? "border-[#4058d0] bg-[#4058d0]/10 dark:border-[#4058d0] dark:bg-[#4058d0]/20"
                      : "border-slate-200 bg-slate-50/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60"
                  }`}
                >
                  <TemplateThumbnail id={tpl.id} category="viral-list" />
                  <strong className="mt-1 block text-xs font-extrabold text-slate-900 dark:text-white">
                    {tpl.label}
                  </strong>
                  <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                    {tpl.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </details>

        {/* 10 Color Themes + Custom Brand Color Pickers */}
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              <Palette size={14} className="text-[#4058d0]" />
              10 Card Color Palettes &amp; Live Custom Brand Color Pickers
            </span>
            {Object.keys(customColors).length > 0 && (
              <button
                type="button"
                onClick={() => setCustomColors({})}
                className="text-[11px] font-bold text-[#4058d0] hover:underline"
              >
                Reset Custom Colors
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {STUDIO_COLOR_THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setThemeId(t.id);
                  setCustomColors({});
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-extrabold transition ${
                  themeId === t.id && Object.keys(customColors).length === 0
                    ? "shadow-xs border-[#4058d0] bg-[#4058d0] text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full border border-white/40"
                  style={{ background: t.accent }}
                />
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <input
                type="color"
                value={activeTheme.bgStart}
                onChange={(e) =>
                  setCustomColors((prev) => ({
                    ...prev,
                    bgStart: e.target.value,
                    bgEnd: e.target.value,
                  }))
                }
                className="h-5 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span>Backdrop BG</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <input
                type="color"
                value={
                  activeTheme.cardBg.startsWith("#")
                    ? activeTheme.cardBg
                    : "#1e293b"
                }
                onChange={(e) =>
                  setCustomColors((prev) => ({
                    ...prev,
                    cardBg: e.target.value,
                  }))
                }
                className="h-5 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span>Card Surface</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <input
                type="color"
                value={activeTheme.accent}
                onChange={(e) =>
                  setCustomColors((prev) => ({
                    ...prev,
                    accent: e.target.value,
                  }))
                }
                className="h-5 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span>Highlight Accent</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <input
                type="color"
                value={activeTheme.textMain}
                onChange={(e) =>
                  setCustomColors((prev) => ({
                    ...prev,
                    textMain: e.target.value,
                  }))
                }
                className="h-5 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span>Quote Text</span>
            </label>
          </div>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,0.7fr)_minmax(0,1.3fr)]">
          {/* LEFT: QUOTE SWITCHER & INLINE EDITOR */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {cards.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCardIdx(idx)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                      activeCardIdx === idx
                        ? "bg-[#4058d0] text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    }`}
                  >
                    Card #{idx + 1}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleAddQuoteCard}
                  disabled={!canAddCard}
                  style={{ cursor: canAddCard ? "pointer" : "not-allowed" }}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#4058d0] px-2.5 py-1 text-[11px] font-extrabold text-white disabled:opacity-45"
                >
                  <Plus size={12} /> Add Card
                </button>
                <button
                  type="button"
                  onClick={handleRemoveQuoteCard}
                  disabled={!canRemoveCard}
                  style={{
                    backgroundColor: "#e11d48",
                    cursor: canRemoveCard ? "pointer" : "not-allowed",
                  }}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-extrabold text-white disabled:opacity-45"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>

            {activeCard && (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Author / Attribution Name
                    </label>
                    <input
                      type="text"
                      value={input.authorName}
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          authorName: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Brand Domain Footer
                    </label>
                    <input
                      type="text"
                      value={input.brandDomain}
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          brandDomain: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Author Handle / Role
                    </label>
                    <input
                      type="text"
                      value={input.authorHandleOrRole}
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          authorHandleOrRole: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Highlighted Ribbon Phrase
                    </label>
                    <input
                      type="text"
                      value={activeCard.highlightPhrase}
                      onChange={(e) =>
                        updateActiveCard("highlightPhrase", e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                    <span>Main Quote / Testimonial Text</span>
                    <span className="text-[10px] text-[#4058d0]">
                      {activeCard.quoteText.length}/210c (~80% optimal)
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    value={activeCard.quoteText}
                    onChange={(e) =>
                      updateActiveCard("quoteText", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs leading-5 dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Secondary Takeaway / Practitioner Reality
                  </label>
                  <input
                    type="text"
                    value={activeCard.subContextOrReality}
                    onChange={(e) =>
                      updateActiveCard("subContextOrReality", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: LIVE 1080x1080 QUOTE CARD CANVAS WITH PERSISTENT TOP BAR & BOTTOM ZOOM */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-[#070b14] shadow-lg dark:border-slate-700">
              {/* Persistent Top Export Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-white">
                  Quote Card #{activeCardIdx + 1} (1080×1080)
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={downloadActiveQuotePng}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#4058d0] px-2.5 py-1.5 text-[11px] font-extrabold text-white hover:bg-[#3452d1]"
                  >
                    <Download size={12} /> PNG
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadCanvasAsEmbeddedSvg(
                        canvasRef.current,
                        `quote-visual-card-0${activeCardIdx + 1}.svg`,
                      );
                      notify("Downloaded Scalable Vector Quote Card (.SVG)!");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-[11px] font-extrabold text-white hover:bg-white/25"
                  >
                    <FileCode2 size={12} /> SVG
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      printCanvasAsPdfPoster(
                        canvasRef.current,
                        `${input.authorName} Quote Card #${activeCardIdx + 1}`,
                        activeCard?.quoteText || "",
                      );
                      notify("Opened Print-Ready PDF View!");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-[11px] font-extrabold text-white hover:bg-white/25"
                  >
                    <FileText size={12} /> PDF
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await copyCanvasImageToClipboard(
                        canvasRef.current,
                      );
                      notify(
                        ok
                          ? "Copied Quote Card Image to Clipboard!"
                          : "Use PNG Download on this browser.",
                      );
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-extrabold text-white hover:bg-emerald-500"
                  >
                    <Copy size={12} /> Copy
                  </button>
                </div>
              </div>

              {/* Direct In-Canvas Quote Editor Bar */}
              {activeCard && (
                <div className="flex items-center gap-2 border-b border-slate-800 bg-[#0d1424] px-3.5 py-2 text-xs text-white">
                  <span className="inline-flex shrink-0 items-center gap-1 font-extrabold text-[#9aabff]">
                    <Type size={13} /> Live Quote:
                  </span>
                  <input
                    type="text"
                    value={activeCard.quoteText}
                    onChange={(e) =>
                      updateActiveCard("quoteText", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white focus:border-[#5271ff] focus:outline-none"
                  />
                </div>
              )}

              {/* Zoomable Canvas Viewport */}
              <div
                onWheel={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    setZoomLevel((z) =>
                      Math.min(
                        2.25,
                        Math.max(
                          0.6,
                          +(z + (e.deltaY < 0 ? 0.12 : -0.12)).toFixed(2),
                        ),
                      ),
                    );
                  }
                }}
                className="overflow-auto p-3 sm:p-4"
              >
                <div
                  style={{
                    width:
                      zoomLevel === 1
                        ? "100%"
                        : `${Math.round(zoomLevel * 100)}%`,
                    maxWidth: zoomLevel === 1 ? "560px" : "none",
                    transition: "width 0.16s ease-out",
                  }}
                  className="mx-auto"
                >
                  <canvas
                    ref={canvasRef}
                    className="mx-auto block aspect-square h-auto w-full rounded-xl shadow-2xl"
                  />
                </div>
              </div>

              {/* Bottom Zoom Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-[#0d1424] px-3.5 py-2 text-xs text-slate-300">
                <span className="text-[11px] text-slate-400">
                  Ctrl + Scroll to zoom
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setZoomLevel((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))
                    }
                    className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-bold text-white hover:bg-slate-700"
                  >
                    <ZoomOut size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold ${
                      zoomLevel === 1
                        ? "bg-[#4058d0] text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    Auto Fit ({Math.round(zoomLevel * 100)}%)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setZoomLevel((z) =>
                        Math.min(2.25, +(z + 0.15).toFixed(2)),
                      )
                    }
                    className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-bold text-white hover:bg-slate-700"
                  >
                    <ZoomIn size={12} />
                  </button>
                  {[1.35, 1.75].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setZoomLevel(preset)}
                      className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                        Math.abs(zoomLevel - preset) < 0.04
                          ? "bg-[#3452d1] text-white"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {Math.round(preset * 100)}%
                    </button>
                  ))}
                  {zoomLevel !== 1 && (
                    <button
                      type="button"
                      onClick={() => setZoomLevel(1)}
                      className="rounded-lg border border-slate-700 px-2 py-1 text-[11px] font-bold text-slate-300"
                    >
                      <RotateCcw size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadActiveQuotePng}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#4058d0] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#3452d1]"
              >
                <Download size={14} />
                Download Quote Card #0{activeCardIdx + 1} (.PNG)
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadCanvasAsEmbeddedSvg(
                    canvasRef.current,
                    `quote-visual-card-0${activeCardIdx + 1}.svg`,
                  );
                  notify("Downloaded Scalable Vector Quote Card (.SVG)!");
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <FileCode2 size={14} /> SVG
              </button>
              <button
                type="button"
                onClick={() => {
                  printCanvasAsPdfPoster(
                    canvasRef.current,
                    `${input.authorName} Quote Card #${activeCardIdx + 1}`,
                    activeCard?.quoteText || "",
                  );
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <FileText size={14} /> PDF
              </button>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(pack.socialCaption);
                  notify("Copied Quote Social Caption!");
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <Copy size={14} />
                Copy Caption
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

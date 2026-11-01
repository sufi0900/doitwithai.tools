"use client";

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
  Sparkles,
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

export default function QuoteStatTestimonialCardStudioClient() {
  const [input, setInput] = useState<QuoteStudioInput>(
    DEFAULT_QUOTE_STUDIO_INPUT,
  );
  const [aiPack, setAiPack] = useState<QuoteStudioPack | null>(null);
  const [cards, setCards] = useState<QuoteCardItem[]>(() =>
    buildDeterministicQuotePack(DEFAULT_QUOTE_STUDIO_INPUT).cards,
  );
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [themeId, setThemeId] =
    useState<StudioColorThemeId>("midnight-executive");
  const [customColors, setCustomColors] = useState<CustomStudioColorOverrides>(
    {},
  );
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

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
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

    if (input.template === "verified-post-screenshot") {
      // Avatar Circle + Author Name + Verified Check + Post Text + Metrics Bar
      ctx.fillStyle = activeTheme.accentSecondary;
      ctx.beginPath();
      ctx.arc(innerX + 42, cardY + 100, 42, 0, Math.PI * 2);
      ctx.fill();

      const initials = (input.authorName || "SM")
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 28px system-ui, -apple-system, sans-serif";
      ctx.fillText(initials, innerX + 22, cardY + 110);

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "800 28px system-ui, -apple-system, sans-serif";
      ctx.fillText(input.authorName, innerX + 104, cardY + 92);

      const nameW = ctx.measureText(input.authorName).width;
      ctx.fillStyle = "#1D9BF0";
      ctx.beginPath();
      ctx.arc(innerX + 124 + nameW, cardY + 83, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 16px system-ui, -apple-system, sans-serif";
      ctx.fillText("✓", innerX + 118 + nameW, cardY + 89);

      ctx.fillStyle = activeTheme.textSub;
      ctx.font = "500 21px system-ui, -apple-system, sans-serif";
      ctx.fillText(input.authorHandleOrRole, innerX + 104, cardY + 124);

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "600 37px system-ui, -apple-system, sans-serif";
      const qLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW, 7);
      let qy = cardY + 210;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 50;
      }

      qy += 20;
      if (qy < cardY + cardH - 150) {
        ctx.fillStyle = `${activeTheme.accent}20`;
        ctx.strokeStyle = activeTheme.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(innerX, qy, innerW, 88, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = activeTheme.accent;
        ctx.font = "800 22px system-ui, -apple-system, sans-serif";
        ctx.fillText(
          `💡 ${activeCard.subContextOrReality.slice(0, 62)}`,
          innerX + 24,
          qy + 52,
        );
      }
    } else if (input.template === "testimonial-5-star") {
      ctx.fillStyle = "#F59E0B";
      ctx.font = "900 44px system-ui, -apple-system, sans-serif";
      ctx.fillText("★ ★ ★ ★ ★", innerX, cardY + 108);

      ctx.fillStyle = activeTheme.accent;
      ctx.font = "800 20px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        activeCard.badgeLabel.toUpperCase(),
        innerX + 275,
        cardY + 102,
      );

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "700 39px Georgia, serif";
      const qLines = wrapQuoteLines(
        ctx,
        `"${activeCard.quoteText}"`,
        innerW,
        7,
      );
      let qy = cardY + 190;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 52;
      }

      ctx.fillStyle = activeTheme.accent;
      ctx.fillRect(innerX, cardY + cardH - 165, 90, 6);

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "800 28px system-ui, -apple-system, sans-serif";
      ctx.fillText(input.authorName, innerX, cardY + cardH - 115);

      ctx.fillStyle = activeTheme.textSub;
      ctx.font = "500 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(input.authorHandleOrRole, innerX, cardY + cardH - 80);
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
        isBeforeAfter
          ? "✗ BEFORE: OLD BOTTLENECK"
          : "✗ COMMON INDUSTRY MYTH",
        innerX + 28,
        cardY + 102,
      );

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "700 29px system-ui, -apple-system, sans-serif";
      const mLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW - 56, 4);
      let my = cardY + 150;
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
      let ry = ryTop + 96;
      for (const l of rLines) {
        ctx.fillText(l, innerX + 28, ry);
        ry += 39;
      }
    } else if (input.template === "oversized-kpi-stat") {
      // Giant KPI Metric Badge + Quote Callout
      const statMatch =
        activeCard.quoteText.match(/\d+(?:\.\d+)?(?:\s*%|\s*x|\+)/i)?.[0] ||
        "2.4x";

      ctx.fillStyle = `${activeTheme.accent}20`;
      ctx.strokeStyle = activeTheme.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(innerX, cardY + 64, 280, 148, 26);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = activeTheme.accent;
      ctx.font = "900 76px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(statMatch, innerX + 140, cardY + 162);
      ctx.textAlign = "left";

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "900 28px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        activeCard.badgeLabel.toUpperCase(),
        innerX + 310,
        cardY + 114,
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
        ctx.fillText(l, innerX + 310, cardY + 154 + li * 32),
      );

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "700 36px system-ui, -apple-system, sans-serif";
      const qLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW, 6);
      let qy = cardY + 290;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 48;
      }
    } else if (input.template === "podcast-clip-quote") {
      // Podcast Clip / Audio Waveform Soundbite Card
      ctx.fillStyle = activeTheme.accent;
      ctx.beginPath();
      ctx.roundRect(innerX, cardY + 62, 260, 44, 22);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 18px system-ui, -apple-system, sans-serif";
      ctx.fillText("🎙️ AUDIO CLIP HIGHLIGHT", innerX + 20, cardY + 90);

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "800 36px system-ui, -apple-system, sans-serif";
      const qLines = wrapQuoteLines(
        ctx,
        `"${activeCard.quoteText}"`,
        innerW,
        6,
      );
      let qy = cardY + 175;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 48;
      }

      // Audio Waveform Bars at Bottom
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
      ctx.fillStyle = activeTheme.accent;
      ctx.font = "900 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        `⚡ ${activeCard.badgeLabel.toUpperCase()}`,
        innerX,
        cardY + 86,
      );

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "800 34px system-ui, -apple-system, sans-serif";
      const qLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW, 5);
      let qy = cardY + 146;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 45;
      }

      const bullets = [
        activeCard.highlightPhrase,
        activeCard.subContextOrReality,
        `Full breakdown at ${input.brandDomain}`,
      ];
      qy += 24;
      bullets.forEach((b) => {
        ctx.fillStyle = `${activeTheme.accentSecondary}22`;
        ctx.beginPath();
        ctx.roundRect(innerX, qy, innerW, 64, 16);
        ctx.fill();
        ctx.fillStyle = activeTheme.accentSecondary;
        ctx.font = "900 24px system-ui, -apple-system, sans-serif";
        ctx.fillText("✓", innerX + 20, qy + 40);
        ctx.fillStyle = activeTheme.textMain;
        ctx.font = "700 22px system-ui, -apple-system, sans-serif";
        ctx.fillText(b.slice(0, 56), innerX + 56, qy + 40);
        qy += 78;
      });
    } else if (input.template === "founder-memo-note") {
      ctx.fillStyle = "#F59E0B";
      ctx.fillRect(cardX, cardY, cardW, 18);

      ctx.fillStyle = "#D97706";
      ctx.font = "800 21px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        `📝 FOUNDER MEMO · ${activeCard.badgeLabel.toUpperCase()}`,
        innerX,
        cardY + 84,
      );

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "800 38px system-ui, -apple-system, sans-serif";
      const qLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW, 6);
      let qy = cardY + 156;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 52;
      }

      ctx.fillStyle = activeTheme.textSub;
      ctx.font = "500 25px system-ui, -apple-system, sans-serif";
      const subLines = wrapQuoteLines(
        ctx,
        activeCard.subContextOrReality,
        innerW,
        3,
      );
      qy += 18;
      for (const l of subLines) {
        ctx.fillText(l, innerX, qy);
        qy += 36;
      }
    } else {
      // Highlighter Quote, Executive Pull-Quote, Glassmorphic, or Boardroom Frame
      ctx.fillStyle = activeTheme.accent;
      ctx.font = "900 120px Georgia, serif";
      ctx.fillText("“", innerX - 10, cardY + 135);

      ctx.fillStyle = activeTheme.accent;
      ctx.beginPath();
      ctx.roundRect(innerX, cardY + 150, innerW, 56, 14);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 25px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        activeCard.highlightPhrase.slice(0, 48),
        innerX + 22,
        cardY + 186,
      );

      ctx.fillStyle = activeTheme.textMain;
      ctx.font =
        input.template === "executive-pull-quote"
          ? "700 38px Georgia, serif"
          : "800 37px system-ui, -apple-system, sans-serif";
      const qLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW, 6);
      let qy = cardY + 268;
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
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6 space-y-6"
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

      {toast && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 size={15} />
          <span>{toast}</span>
        </div>
      )}

      <div
        ref={resultsRef}
        tabIndex={-1}
        className="rounded-2xl border-2 border-[#ff6b35]/25 bg-white p-5 shadow-xs dark:border-[#ff6b35]/35 dark:bg-[#111827] sm:p-6 space-y-6 focus:outline-none"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <PlatformBrandIcon
              platform="x"
              slug="quote-stat-testimonial-card-studio"
              size={42}
            />
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#ff6b35]">
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#ff6b35] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#e85d2a]"
            >
              <PackageCheck size={15} />
              Download Quote PNG + Caption Package
            </button>
          </div>
        </div>

        {/* 12 Template Selector */}
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
                  ? "border-[#ff6b35] bg-[#ff6b35]/10 dark:border-[#ff6b35] dark:bg-[#ff6b35]/20"
                  : "border-slate-200 bg-slate-50/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60"
              }`}
            >
              <strong className="block text-xs font-extrabold text-slate-900 dark:text-white">
                {tpl.label}
              </strong>
              <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                {tpl.desc}
              </span>
            </button>
          ))}
        </div>

        {/* 10 Color Themes + Custom Brand Color Pickers */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              <Palette size={14} className="text-[#ff6b35]" />
              10 Card Color Palettes &amp; Live Custom Brand Color Pickers
            </span>
            {Object.keys(customColors).length > 0 && (
              <button
                type="button"
                onClick={() => setCustomColors({})}
                className="text-[11px] font-bold text-[#ff6b35] hover:underline"
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
                    ? "border-[#ff6b35] bg-[#ff6b35] text-white shadow-xs"
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

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-start">
          {/* LEFT: QUOTE SWITCHER & INLINE EDITOR */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {cards.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCardIdx(idx)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                    activeCardIdx === idx
                      ? "bg-slate-900 text-white dark:bg-[#5271ff]"
                      : "border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  }`}
                >
                  Quote Card #{idx + 1}
                </button>
              ))}
            </div>

            {activeCard && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/60">
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
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Main Quote / Testimonial Text
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

          {/* RIGHT: LIVE 1080x1080 QUOTE CARD CANVAS WITH HOVER DOWNLOAD BAR */}
          <div className="space-y-4">
            <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-300 bg-slate-950 p-2 shadow-lg dark:border-slate-700">
              {/* Floating Hover Download Bar */}
              <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/15 bg-slate-950/90 px-3.5 py-2.5 opacity-0 shadow-2xl backdrop-blur-md transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-white">
                  Quote Card #{activeCardIdx + 1} (1080×1080)
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={downloadActiveQuotePng}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#ff6b35] px-2.5 py-1.5 text-[11px] font-extrabold text-white hover:bg-[#e85d2a]"
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

              <canvas
                ref={canvasRef}
                className="mx-auto block aspect-square w-full h-auto rounded-xl"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadActiveQuotePng}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-slate-800 dark:bg-slate-800"
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

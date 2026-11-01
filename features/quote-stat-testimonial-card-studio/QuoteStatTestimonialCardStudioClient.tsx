"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  MessageSquareQuote,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";
import {
  focusToolSection,
  ToolRunOverlay,
} from "@/features/tool-ui/ToolRunOverlay";
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
    label: "1. Verified Post / Tweet Card",
    desc: "Clean social screenshot card with avatar, verified badge & metrics",
  },
  {
    id: "highlighter-quote",
    label: "2. Neon Highlighter Quote Card",
    desc: "Editorial paper/dark card with highlighted key opening phrase",
  },
  {
    id: "founder-memo-note",
    label: "3. Founder Memo / Notes Card",
    desc: "Warm Apple-Notes / executive memo aesthetic that earns high saves",
  },
  {
    id: "testimonial-5-star",
    label: "4. 5-Star Social Proof & Review",
    desc: "Client testimonial card with 5 golden stars & verified attribution",
  },
  {
    id: "myth-vs-reality",
    label: "5. Contrarian Myth vs. Reality",
    desc: "Splits common industry myth vs. your proven practitioner truth",
  },
  {
    id: "executive-pull-quote",
    label: "6. Magazine Pull-Quote Poster",
    desc: "Oversized quotation marks, bold serif/sans typography & footer",
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
  const [theme, setTheme] = useState<"dark-pro" | "editorial-cream" | "royal">(
    "dark-pro",
  );
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

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

  async function handleGenerateAiQuotes() {
    setLoading(true);
    try {
      const res = await fetch(
        "/api/ai-tools/quote-stat-testimonial-card-studio",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
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

    const isCream = theme === "editorial-cream";
    const bgStart =
      theme === "editorial-cream"
        ? "#FAF8F5"
        : theme === "royal"
          ? "#0F172A"
          : "#090D16";
    const bgEnd =
      theme === "editorial-cream"
        ? "#F3EFE6"
        : theme === "royal"
          ? "#1E3A8A"
          : "#161F33";
    const cardBg = isCream ? "#FFFFFF" : "rgba(24, 34, 56, 0.94)";
    const textMain = isCream ? "#111827" : "#FFFFFF";
    const textSub = isCream ? "#4B5563" : "#CBD5E1";
    const accent = "#FF6B35";

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, bgStart);
    grad.addColorStop(1, bgEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Outer Card Frame
    const cardX = 84;
    const cardY = 110;
    const cardW = W - 168;
    const cardH = H - 220;

    ctx.fillStyle = cardBg;
    ctx.strokeStyle = isCream ? "#E5E7EB" : "rgba(148,163,184,0.28)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 36);
    ctx.fill();
    ctx.stroke();

    const innerX = cardX + 64;
    const innerW = cardW - 128;

    if (input.template === "verified-post-screenshot") {
      // Avatar Circle + Author Name + Verified Check + Post Text
      ctx.fillStyle = "#3452D1";
      ctx.beginPath();
      ctx.arc(innerX + 42, cardY + 104, 42, 0, Math.PI * 2);
      ctx.fill();

      const initials = (input.authorName || "SM")
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 28px system-ui, -apple-system, sans-serif";
      ctx.fillText(initials, innerX + 22, cardY + 114);

      ctx.fillStyle = textMain;
      ctx.font = "800 28px system-ui, -apple-system, sans-serif";
      ctx.fillText(input.authorName, innerX + 104, cardY + 96);

      // Verified blue badge
      const nameW = ctx.measureText(input.authorName).width;
      ctx.fillStyle = "#1D9BF0";
      ctx.beginPath();
      ctx.arc(innerX + 124 + nameW, cardY + 87, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 16px system-ui, -apple-system, sans-serif";
      ctx.fillText("✓", innerX + 118 + nameW, cardY + 93);

      ctx.fillStyle = textSub;
      ctx.font = "500 21px system-ui, -apple-system, sans-serif";
      ctx.fillText(input.authorHandleOrRole, innerX + 104, cardY + 128);

      // Main Quote Post Text
      ctx.fillStyle = textMain;
      ctx.font = "600 38px system-ui, -apple-system, sans-serif";
      const qLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW, 7);
      let qy = cardY + 220;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 52;
      }

      // Highlighted Callout Box below
      qy += 24;
      if (qy < cardY + cardH - 150) {
        ctx.fillStyle = "rgba(255, 107, 53, 0.14)";
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(innerX, qy, innerW, 92, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = accent;
        ctx.font = "800 22px system-ui, -apple-system, sans-serif";
        ctx.fillText(
          `💡 ${activeCard.subContextOrReality.slice(0, 62)}`,
          innerX + 24,
          qy + 54,
        );
      }
    } else if (input.template === "testimonial-5-star") {
      // 5 Gold Stars + Quote + Author Footer
      ctx.fillStyle = "#F59E0B";
      ctx.font = "900 44px system-ui, -apple-system, sans-serif";
      ctx.fillText("★ ★ ★ ★ ★", innerX, cardY + 110);

      ctx.fillStyle = accent;
      ctx.font = "800 20px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        activeCard.badgeLabel.toUpperCase(),
        innerX + 275,
        cardY + 104,
      );

      ctx.fillStyle = textMain;
      ctx.font = "700 40px Georgia, serif";
      const qLines = wrapQuoteLines(
        ctx,
        `"${activeCard.quoteText}"`,
        innerW,
        7,
      );
      let qy = cardY + 195;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 54;
      }

      ctx.fillStyle = accent;
      ctx.fillRect(innerX, cardY + cardH - 165, 90, 6);

      ctx.fillStyle = textMain;
      ctx.font = "800 28px system-ui, -apple-system, sans-serif";
      ctx.fillText(input.authorName, innerX, cardY + cardH - 115);

      ctx.fillStyle = textSub;
      ctx.font = "500 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(input.authorHandleOrRole, innerX, cardY + cardH - 80);
    } else if (input.template === "myth-vs-reality") {
      // Split Myth (Top Red Card) vs. Reality (Bottom Emerald Card)
      const boxH = Math.floor((cardH - 180) / 2);

      // Myth Box
      ctx.fillStyle = "rgba(244, 63, 94, 0.14)";
      ctx.strokeStyle = "#F43F5E";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(innerX, cardY + 60, innerW, boxH, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#F43F5E";
      ctx.font = "900 22px system-ui, -apple-system, sans-serif";
      ctx.fillText("✗ COMMON INDUSTRY MYTH", innerX + 28, cardY + 108);

      ctx.fillStyle = textMain;
      ctx.font = "700 30px system-ui, -apple-system, sans-serif";
      const mLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW - 56, 4);
      let my = cardY + 158;
      for (const l of mLines) {
        ctx.fillText(l, innerX + 28, my);
        my += 40;
      }

      // Reality Box
      const ryTop = cardY + 60 + boxH + 28;
      ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(innerX, ryTop, innerW, boxH, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#10B981";
      ctx.font = "900 22px system-ui, -apple-system, sans-serif";
      ctx.fillText("✓ PRACTITIONER REALITY", innerX + 28, ryTop + 48);

      ctx.fillStyle = textMain;
      ctx.font = "700 30px system-ui, -apple-system, sans-serif";
      const rLines = wrapQuoteLines(
        ctx,
        activeCard.subContextOrReality,
        innerW - 56,
        4,
      );
      let ry = ryTop + 98;
      for (const l of rLines) {
        ctx.fillText(l, innerX + 28, ry);
        ry += 40;
      }
    } else if (input.template === "founder-memo-note") {
      // Apple Notes / Founder Memo Header Bar
      ctx.fillStyle = "#F59E0B";
      ctx.fillRect(cardX, cardY, cardW, 18);

      ctx.fillStyle = "#D97706";
      ctx.font = "800 21px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        `📝 FOUNDER MEMO · ${activeCard.badgeLabel.toUpperCase()}`,
        innerX,
        cardY + 84,
      );

      ctx.fillStyle = textMain;
      ctx.font = "800 40px system-ui, -apple-system, sans-serif";
      const qLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW, 6);
      let qy = cardY + 158;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 54;
      }

      ctx.fillStyle = textSub;
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
      // Highlighter Quote or Executive Pull-Quote
      ctx.fillStyle = accent;
      ctx.font = "900 120px Georgia, serif";
      ctx.fillText("“", innerX - 10, cardY + 135);

      // Highlighted Phrase Ribbon
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.roundRect(innerX, cardY + 150, innerW, 56, 14);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 26px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        activeCard.highlightPhrase.slice(0, 48),
        innerX + 22,
        cardY + 187,
      );

      ctx.fillStyle = textMain;
      ctx.font = "800 38px system-ui, -apple-system, sans-serif";
      const qLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW, 6);
      let qy = cardY + 270;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 52;
      }
    }

    // Bottom Attribution Bar Inside Card
    ctx.fillStyle = textSub;
    ctx.font = "700 20px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      `${input.authorName} · ${input.brandDomain}`,
      innerX,
      cardY + cardH - 36,
    );
  }, [input, activeCard, theme]);

  function downloadActiveQuotePng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `quote-visual-card-0${activeCardIdx + 1}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
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
        open={loading}
        title="Extracting Best Quotes & Designing Visual Cards..."
        subtitle="Building 5 shareable quote, tweet-style, and testimonial graphics."
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
          setInput((prev) => ({
            ...prev,
            authorName: data.author || prev.authorName,
            brandDomain: domain,
            sourceContent:
              (data.paragraphs || []).slice(0, 6).join("\n\n") ||
              data.cleanText ||
              prev.sourceContent,
          }));
          notify(`Extracted quotable passages from "${data.title}"!`);
          focusToolSection(resultsRef.current);
        }}
        onSelectSubTopic={(sub) => {
          setAiPack(null);
          setInput((prev) => ({
            ...prev,
            sourceContent: sub.content,
          }));
          notify(`Focused quote studio on sub-topic: "${sub.title}"!`);
          focusToolSection(resultsRef.current);
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
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#ff6b35]">
              <MessageSquareQuote size={14} />6 Built-In Quote, Tweet &amp;
              Testimonial Templates
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Viral Quote, Founder Memo &amp; Testimonial Visual Card Studio
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleGenerateAiQuotes}
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

        {/* 6 Template Selector */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {QUOTE_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() =>
                setInput((prev) => ({ ...prev, template: tpl.id }))
              }
              className={`rounded-xl border p-3 text-left transition ${
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
                      Card Color Theme
                    </label>
                    <select
                      value={theme}
                      onChange={(e) =>
                        setTheme(
                          e.target.value as
                            | "dark-pro"
                            | "editorial-cream"
                            | "royal",
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                    >
                      <option value="dark-pro">Dark Executive Slate</option>
                      <option value="editorial-cream">
                        Editorial Paper Cream
                      </option>
                      <option value="royal">Royal Navy &amp; Blue</option>
                    </select>
                  </div>
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

          {/* RIGHT: LIVE 1080x1080 QUOTE CARD CANVAS */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-slate-950 p-2 shadow-lg dark:border-slate-700">
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
                onClick={async () => {
                  await navigator.clipboard.writeText(pack.socialCaption);
                  notify("Copied Quote Social Caption!");
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <Copy size={14} />
                Copy Post Caption
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  Palette,
  Plus,
  Printer,
  Sparkles,
  Trash2,
} from "lucide-react";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";
import ToolRunOverlay, { focusToolSection } from "@/features/tool-ui/ToolRunOverlay";
import { PlatformBrandIcon } from "@/features/tool-ui/PlatformBrandIcon";
import {
  copyCanvasImageToClipboard,
  downloadCanvasAsEmbeddedSvg,
  downloadCanvasAsPng,
  printCanvasAsPdfPoster,
  resolveVisualTheme,
  SHARED_VISUAL_THEMES,
  type SharedVisualThemeId,
} from "@/features/tool-ui/visualCardExport";
import {
  buildDeterministicDataChart,
  DEFAULT_DATA_TO_CHART_INPUT,
  type ChartDataPoint,
  type ChartVisualTemplateId,
  type DataToChartInput,
  type DataToChartPack,
} from "./model";

const CHART_TEMPLATES: {
  id: ChartVisualTemplateId;
  label: string;
  desc: string;
}[] = [
  {
    id: "horizontal-bars",
    label: "1. Horizontal Ranking Bars",
    desc: "Ranked progress bars with bold percentage/multiplier pills",
  },
  {
    id: "vertical-column-bars",
    label: "2. Vertical Column Chart",
    desc: "Classic vertical bar columns with top value callouts",
  },
  {
    id: "kpi-bento-4",
    label: "3. 4-Card KPI Bento Grid",
    desc: "Executive 2×2 metric dashboard with supporting notes",
  },
  {
    id: "donut-breakdown",
    label: "4. Donut Ring + Legend",
    desc: "Multi-color proportional ring chart with labeled legend",
  },
  {
    id: "radial-gauge-rings",
    label: "5. 4-Ring Radial Gauges",
    desc: "Individual circular progress rings for 4 key metrics",
  },
  {
    id: "lollipop-benchmark",
    label: "6. Lollipop Dot-Stem Chart",
    desc: "Sleek horizontal stems with glowing circular value nodes",
  },
  {
    id: "before-after-lift",
    label: "7. Hero Before/After Lift",
    desc: "Oversized hero metric paired with supporting proof rows",
  },
  {
    id: "dual-versus-bars",
    label: "8. Head-to-Head Versus Bars",
    desc: "Compares baseline vs. top-performing benchmark bars",
  },
  {
    id: "waterfall-roi-bridge",
    label: "9. Stepped ROI Growth Bridge",
    desc: "Ascending stepped blocks showing cumulative impact",
  },
  {
    id: "funnel-conversion-bars",
    label: "10. Tapering Funnel Chart",
    desc: "Centered tapering funnel bars from top to bottom",
  },
  {
    id: "benchmark-scorecard",
    label: "11. Executive Data Table",
    desc: "Structured comparison rows with score badges & verdict",
  },
  {
    id: "stat-quote-spotlight",
    label: "12. Stat + Insight Spotlight",
    desc: "Giant headline number paired with 3 supporting proof points",
  },
];

const BAR_COLORS = [
  "#FF6B35",
  "#38BDF8",
  "#10B981",
  "#A855F7",
  "#F59E0B",
  "#EC4899",
];

function wrapChartText(
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

export default function DataToChartVisualCardMakerClient() {
  const [input, setInput] = useState<DataToChartInput>(
    DEFAULT_DATA_TO_CHART_INPUT,
  );
  const [aiPack, setAiPack] = useState<DataToChartPack | null>(null);
  const [points, setPoints] = useState<ChartDataPoint[]>(() =>
    buildDeterministicDataChart(DEFAULT_DATA_TO_CHART_INPUT).points,
  );
  const [themeId, setThemeId] =
    useState<SharedVisualThemeId>("midnight-orange");
  const [customColors, setCustomColors] = useState({
    bgStart: "#0B1120",
    cardBg: "#1E293B",
    accent: "#FF6B35",
    textMain: "#FFFFFF",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const deterministicPack = useMemo(
    () => buildDeterministicDataChart(input),
    [input],
  );
  const pack = aiPack || deterministicPack;
  const theme = useMemo(
    () => resolveVisualTheme(themeId, customColors),
    [themeId, customColors],
  );

  useEffect(() => {
    setPoints(pack.points);
  }, [pack]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  async function handleGenerateAiChart(overrideInput?: DataToChartInput) {
    const activeInput = overrideInput || input;
    setLoading(true);
    try {
      const res = await fetch(
        "/api/ai-tools/data-to-chart-visual-card-maker",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(activeInput),
        },
      );
      const data = await res.json();
      if (data?.pack) {
        setAiPack(data.pack);
        setPoints(data.pack.points);
        notify("Extracted quantitative metrics & rendered chart in 1 click!");
      }
      focusToolSection(resultsRef.current);
    } catch {
      notify("Rendered data chart visual card.");
      focusToolSection(resultsRef.current);
    } finally {
      setLoading(false);
    }
  }

  function updatePoint(
    id: string,
    field: keyof ChartDataPoint,
    value: string | number,
  ) {
    setPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  }

  function addPoint() {
    if (points.length >= 6) {
      notify("Maximum 6 data bars/cards per chart for crisp readability.");
      return;
    }
    const idx = points.length + 1;
    setPoints((prev) => [
      ...prev,
      {
        id: `dp-${Date.now()}`,
        label: `Benchmark Metric #${idx}`,
        valueNumber: 65,
        displayValue: "65%",
        note: "Key performance driver measured in study",
      },
    ]);
  }

  function removePoint(id: string) {
    if (points.length <= 2) return;
    setPoints((prev) => prev.filter((p) => p.id !== id));
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1080;
    const H = 1080;
    canvas.width = W;
    canvas.height = H;

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, theme.bgStart);
    grad.addColorStop(1, theme.bgEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle decorative glow orb
    ctx.save();
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.arc(W - 110, 110, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const padX = 68;
    let curY = 58;

    // Kicker Badge
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.roundRect(padX, curY, 320, 42, 21);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 18px system-ui, -apple-system, sans-serif";
    ctx.fillText(pack.kickerBadge.slice(0, 28), padX + 22, curY + 27);
    curY += 62;

    // Title
    ctx.fillStyle = theme.textMain;
    ctx.font = "900 40px system-ui, -apple-system, sans-serif";
    const tLines = wrapChartText(ctx, input.chartTitle, W - padX * 2, 2);
    for (const l of tLines) {
      ctx.fillText(l, padX, curY + 38);
      curY += 48;
    }

    // Subtitle
    ctx.fillStyle = theme.textMuted;
    ctx.font = "500 22px system-ui, -apple-system, sans-serif";
    const sLines = wrapChartText(ctx, input.chartSubtitle, W - padX * 2, 2);
    for (const l of sLines) {
      ctx.fillText(l, padX, curY + 24);
      curY += 30;
    }
    curY += 24;

    const bodyTop = curY;
    const bodyBottom = H - 88;
    const availH = bodyBottom - bodyTop;
    const activePts = points.slice(0, 6);

    if (
      input.template === "kpi-bento-4" ||
      input.template === "radial-gauge-rings"
    ) {
      const bentoPts = activePts.slice(0, 4);
      const gap = 22;
      const cardW = Math.floor((W - padX * 2 - gap) / 2);
      const cardH = Math.floor((availH - gap) / 2);

      bentoPts.forEach((pt, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = padX + col * (cardW + gap);
        const y = bodyTop + row * (cardH + gap);
        const barCol = idx === 0 ? theme.accent : BAR_COLORS[idx % BAR_COLORS.length];

        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = barCol;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 26);
        ctx.fill();
        ctx.stroke();

        if (input.template === "radial-gauge-rings") {
          const r = 46;
          const cx = x + 74;
          const cy = y + 76;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(148,163,184,0.22)";
          ctx.lineWidth = 12;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(
            cx,
            cy,
            r,
            -Math.PI / 2,
            -Math.PI / 2 + (Math.PI * 2 * Math.min(100, pt.valueNumber)) / 100,
          );
          ctx.strokeStyle = barCol;
          ctx.lineWidth = 12;
          ctx.stroke();

          ctx.fillStyle = theme.textMain;
          ctx.font = "900 22px system-ui, -apple-system, sans-serif";
          ctx.fillText(pt.displayValue.slice(0, 6), cx - 24, cy + 8);
        } else {
          ctx.fillStyle = barCol;
          ctx.font = "900 66px system-ui, -apple-system, sans-serif";
          ctx.fillText(pt.displayValue, x + 32, y + 94);
        }

        ctx.fillStyle = theme.textMain;
        ctx.font = "800 25px system-ui, -apple-system, sans-serif";
        const lblLines = wrapChartText(ctx, pt.label, cardW - 64, 2);
        let ly = y + 150;
        for (const l of lblLines) {
          ctx.fillText(l, x + 32, ly);
          ly += 30;
        }

        ctx.fillStyle = theme.textMuted;
        ctx.font = "500 19px system-ui, -apple-system, sans-serif";
        const nLines = wrapChartText(ctx, pt.note, cardW - 64, 2);
        ly += 6;
        for (const l of nLines) {
          ctx.fillText(l, x + 32, ly);
          ly += 25;
        }
      });
    } else if (input.template === "vertical-column-bars") {
      const cols = activePts.length;
      const chartLeft = padX + 20;
      const chartW = W - padX * 2 - 40;
      const colGap = 26;
      const colW = Math.floor((chartW - colGap * (cols - 1)) / cols);
      const maxBarH = availH - 110;

      activePts.forEach((pt, i) => {
        const x = chartLeft + i * (colW + colGap);
        const barH = Math.max(44, Math.floor((maxBarH * pt.valueNumber) / 100));
        const y = bodyBottom - 58 - barH;
        const barCol = i === 0 ? theme.accent : BAR_COLORS[i % BAR_COLORS.length];

        ctx.fillStyle = barCol;
        ctx.beginPath();
        ctx.roundRect(x, y, colW, barH, [18, 18, 6, 6]);
        ctx.fill();

        ctx.fillStyle = theme.textMain;
        ctx.font = "900 24px system-ui, -apple-system, sans-serif";
        ctx.fillText(pt.displayValue, x + 8, y - 14);

        ctx.fillStyle = theme.textMuted;
        ctx.font = "700 17px system-ui, -apple-system, sans-serif";
        ctx.fillText(pt.label.slice(0, 12), x + 4, bodyBottom - 24);
      });
    } else if (input.template === "donut-breakdown") {
      const cx = padX + 210;
      const cy = bodyTop + availH / 2;
      const radius = 165;
      const total = Math.max(
        1,
        activePts.reduce((acc, p) => acc + Math.max(1, p.valueNumber), 0),
      );

      let startAngle = -Math.PI / 2;
      activePts.forEach((pt, i) => {
        const sliceAngle =
          (Math.max(1, pt.valueNumber) / total) * (Math.PI * 2);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
        ctx.strokeStyle = i === 0 ? theme.accent : BAR_COLORS[i % BAR_COLORS.length];
        ctx.lineWidth = 54;
        ctx.stroke();
        startAngle += sliceAngle;
      });

      ctx.fillStyle = theme.textMain;
      ctx.font = "900 48px system-ui, -apple-system, sans-serif";
      const topVal = activePts[0]?.displayValue || "100%";
      const tw = ctx.measureText(topVal).width;
      ctx.fillText(topVal, cx - tw / 2, cy + 14);

      const legX = padX + 450;
      const legW = W - padX - legX;
      const rowH = Math.min(100, Math.floor(availH / activePts.length) - 10);

      activePts.forEach((pt, i) => {
        const y = bodyTop + i * (rowH + 10);
        const col = i === 0 ? theme.accent : BAR_COLORS[i % BAR_COLORS.length];
        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = col;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(legX, y, legW, rowH, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(legX + 26, y + rowH / 2, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = theme.textMain;
        ctx.font = "800 22px system-ui, -apple-system, sans-serif";
        ctx.fillText(
          `${pt.label.slice(0, 24)} — ${pt.displayValue}`,
          legX + 50,
          y + rowH / 2 - 4,
        );

        ctx.fillStyle = theme.textMuted;
        ctx.font = "500 17px system-ui, -apple-system, sans-serif";
        ctx.fillText(pt.note.slice(0, 42), legX + 50, y + rowH / 2 + 22);
      });
    } else if (
      input.template === "before-after-lift" ||
      input.template === "stat-quote-spotlight"
    ) {
      const heroH = 210;
      ctx.fillStyle = theme.cardBg;
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(padX, bodyTop, W - padX * 2, heroH, 26);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = theme.accent;
      ctx.font = "900 84px system-ui, -apple-system, sans-serif";
      const heroVal = activePts[0]?.displayValue || "+142%";
      ctx.fillText(heroVal, padX + 36, bodyTop + 118);

      const valW = ctx.measureText(heroVal).width;
      ctx.fillStyle = theme.textMain;
      ctx.font = "800 30px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        (activePts[0]?.label || "Primary Benchmark Lift").slice(0, 34),
        padX + valW + 64,
        bodyTop + 88,
      );

      ctx.fillStyle = theme.textMuted;
      ctx.font = "500 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        (activePts[0]?.note || "").slice(0, 52),
        padX + valW + 64,
        bodyTop + 128,
      );

      const rest = activePts.slice(1, 5);
      const restTop = bodyTop + heroH + 24;
      const rowH =
        Math.floor((availH - heroH - 24) / Math.max(1, rest.length)) - 12;

      rest.forEach((pt, idx) => {
        const y = restTop + idx * (rowH + 12);
        const col = BAR_COLORS[(idx + 1) % BAR_COLORS.length];
        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = col;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(padX, y, W - padX * 2, rowH, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = col;
        ctx.font = "900 34px system-ui, -apple-system, sans-serif";
        ctx.fillText(pt.displayValue, padX + 28, y + rowH / 2 + 12);

        ctx.fillStyle = theme.textMain;
        ctx.font = "800 24px system-ui, -apple-system, sans-serif";
        ctx.fillText(pt.label.slice(0, 38), padX + 170, y + rowH / 2 - 4);

        ctx.fillStyle = theme.textMuted;
        ctx.font = "500 18px system-ui, -apple-system, sans-serif";
        ctx.fillText(pt.note.slice(0, 58), padX + 170, y + rowH / 2 + 24);
      });
    } else {
      // Horizontal Ranking Bars, Lollipop, Funnel, Waterfall, Dual Versus, or Scorecard
      const rowGap = 14;
      const rowH = Math.min(
        118,
        Math.floor((availH - rowGap * (activePts.length - 1)) / activePts.length),
      );

      activePts.forEach((pt, i) => {
        const y = bodyTop + i * (rowH + rowGap);
        const barCol = i === 0 ? theme.accent : BAR_COLORS[i % BAR_COLORS.length];
        const cardW =
          input.template === "funnel-conversion-bars"
            ? Math.floor((W - padX * 2) * (1 - i * 0.08))
            : W - padX * 2;
        const cardX =
          input.template === "funnel-conversion-bars"
            ? Math.floor((W - cardW) / 2)
            : padX;

        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = barCol;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cardX, y, cardW, rowH, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = theme.textMain;
        ctx.font = "800 23px system-ui, -apple-system, sans-serif";
        ctx.fillText(
          `${i + 1}. ${pt.label.slice(0, 36)}`,
          cardX + 26,
          y + 36,
        );

        ctx.fillStyle = barCol;
        ctx.font = "900 26px system-ui, -apple-system, sans-serif";
        const vw = ctx.measureText(pt.displayValue).width;
        ctx.fillText(pt.displayValue, cardX + cardW - 26 - vw, y + 38);

        // Progress Bar or Lollipop Stem
        const barMaxW = cardW - 52;
        const fillW = Math.max(
          42,
          Math.floor((barMaxW * Math.min(100, pt.valueNumber)) / 100),
        );
        ctx.fillStyle = "rgba(148, 163, 184, 0.18)";
        ctx.beginPath();
        ctx.roundRect(cardX + 26, y + 52, barMaxW, 16, 8);
        ctx.fill();

        ctx.fillStyle = barCol;
        ctx.beginPath();
        ctx.roundRect(cardX + 26, y + 52, fillW, 16, 8);
        ctx.fill();

        if (input.template === "lollipop-benchmark") {
          ctx.beginPath();
          ctx.arc(cardX + 26 + fillW, y + 60, 13, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = theme.textMuted;
        ctx.font = "500 17px system-ui, -apple-system, sans-serif";
        ctx.fillText(pt.note.slice(0, 68), cardX + 26, y + 94);
      });
    }

    // Footer Attribution Bar
    ctx.fillStyle = "rgba(15, 23, 42, 0.72)";
    ctx.fillRect(0, H - 72, W, 72);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 22px system-ui, -apple-system, sans-serif";
    ctx.fillText(input.brandFooter || "doitwithai.tools", padX, H - 28);
    ctx.fillStyle = theme.accent;
    ctx.font = "700 19px system-ui, -apple-system, sans-serif";
    ctx.fillText("Save & Share Benchmark Data ★", W - padX - 285, H - 28);
  }, [input, pack.kickerBadge, points, theme]);

  return (
    <section
      aria-label="Data to Visual Chart Card Maker Studio"
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6 space-y-6"
    >
      <ToolRunOverlay
        active={loading}
        title="Extracting Metrics & Rendering Visual Data Chart..."
        description="Building high-contrast chart cards across 12 templates with hover PNG, SVG, and PDF export."
      />

      {/* 1-CLICK ARTICLE URL EXTRACTION */}
      <UrlArticleExtractorBar
        label="Option 1: Paste Any Article URL to Extract Statistics & Build a Visual Chart in 1 Click"
        placeholder="Paste a blog or report URL to extract numbers & render a chart..."
        buttonLabel="Extract Stats & Render Chart (1-Click)"
        onExtracted={(data) => {
          setAiPack(null);
          const cleanTitle = (data.title || input.chartTitle)
            .replace(/\s*\|\s*[^|]+$/g, "")
            .trim();
          let domain = "doitwithai.tools";
          try {
            domain = new URL(data.url).hostname.replace(/^www\./, "");
          } catch {}
          const nextInput: DataToChartInput = {
            ...input,
            chartTitle: cleanTitle,
            chartSubtitle: data.description || input.chartSubtitle,
            rawSourceText:
              (data.keyTakeaways || []).join("\n") ||
              data.cleanText.slice(0, 1200) ||
              input.rawSourceText,
            brandFooter: domain,
          };
          setInput(nextInput);
          void handleGenerateAiChart(nextInput);
        }}
        onSelectSubTopic={(sub, data) => {
          setAiPack(null);
          const nextInput: DataToChartInput = {
            ...input,
            chartTitle: sub.title,
            chartSubtitle: sub.summary,
            rawSourceText: sub.content,
          };
          setInput(nextInput);
          void handleGenerateAiChart(nextInput);
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
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6 space-y-5 focus:outline-none"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <PlatformBrandIcon brand="data-chart" size={36} />
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#ff6b35]">
                <BarChart3 size={14} /> 12 Visual Chart Templates · 10 Themes + Custom Pickers
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Interactive Data-to-Chart Studio (Hover Over Chart to Download)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleGenerateAiChart()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#ff6b35] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#e85d2a]"
          >
            <Sparkles size={14} />
            {loading ? "Building Chart…" : "Generate AI Chart Card (1-Click)"}
          </button>
        </div>

        {/* 12 Chart Template Selector Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {CHART_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() =>
                setInput((prev) => ({ ...prev, template: tpl.id }))
              }
              className={`rounded-xl border p-2.5 text-left transition ${
                input.template === tpl.id
                  ? "border-[#ff6b35] bg-[#ff6b35]/10 ring-1 ring-[#ff6b35]"
                  : "border-slate-200 bg-slate-50/70 hover:border-[#3452d1] dark:border-slate-800 dark:bg-slate-900/60"
              }`}
            >
              <strong className="block truncate text-xs font-extrabold text-slate-900 dark:text-white">
                {tpl.label}
              </strong>
              <span className="mt-0.5 line-clamp-1 block text-[10px] text-slate-500 dark:text-slate-400">
                {tpl.desc}
              </span>
            </button>
          ))}
        </div>

        {/* 10 Color Themes + Custom Brand Color Pickers */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-200">
              Designer Color Theme (10 Presets + Custom)
            </label>
            <select
              value={themeId}
              onChange={(e) =>
                setThemeId(e.target.value as SharedVisualThemeId)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
            >
              {Object.values(SHARED_VISUAL_THEMES).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
              <option value="custom-brand">
                🎨 Custom Brand Colors (Use Pickers →)
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Palette size={13} className="text-[#ff6b35]" /> Live Custom Color Pickers
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">
              <label className="flex items-center gap-1 text-[11px] font-bold">
                <input
                  type="color"
                  value={theme.bgStart}
                  onChange={(e) => {
                    setThemeId("custom-brand");
                    setCustomColors((p) => ({ ...p, bgStart: e.target.value }));
                  }}
                  className="h-6 w-6 cursor-pointer border-0 bg-transparent"
                />
                BG
              </label>
              <label className="flex items-center gap-1 text-[11px] font-bold">
                <input
                  type="color"
                  value={
                    theme.cardBg.startsWith("#") ? theme.cardBg : "#1E293B"
                  }
                  onChange={(e) => {
                    setThemeId("custom-brand");
                    setCustomColors((p) => ({ ...p, cardBg: e.target.value }));
                  }}
                  className="h-6 w-6 cursor-pointer border-0 bg-transparent"
                />
                Card
              </label>
              <label className="flex items-center gap-1 text-[11px] font-bold">
                <input
                  type="color"
                  value={theme.accent}
                  onChange={(e) => {
                    setThemeId("custom-brand");
                    setCustomColors((p) => ({ ...p, accent: e.target.value }));
                  }}
                  className="h-6 w-6 cursor-pointer border-0 bg-transparent"
                />
                Accent
              </label>
              <label className="flex items-center gap-1 text-[11px] font-bold">
                <input
                  type="color"
                  value={theme.textMain}
                  onChange={(e) => {
                    setThemeId("custom-brand");
                    setCustomColors((p) => ({
                      ...p,
                      textMain: e.target.value,
                    }));
                  }}
                  className="h-6 w-6 cursor-pointer border-0 bg-transparent"
                />
                Text
              </label>
            </div>
          </div>
        </div>

        {/* 2-COLUMN WORKSPACE: LEFT = DATA POINTS EDITOR, RIGHT = HOVERABLE CHART CANVAS */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] items-start">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/60">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Chart Headline
                </label>
                <input
                  type="text"
                  value={input.chartTitle}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      chartTitle: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={input.chartSubtitle}
                    onChange={(e) =>
                      setInput((prev) => ({
                        ...prev,
                        chartSubtitle: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Brand Footer
                  </label>
                  <input
                    type="text"
                    value={input.brandFooter}
                    onChange={(e) =>
                      setInput((prev) => ({
                        ...prev,
                        brandFooter: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#ff6b35]">
                  Edit Data Bars / Metrics ({points.length} / 6)
                </h3>
                <button
                  type="button"
                  onClick={addPoint}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#3452d1] px-2.5 py-1 text-xs font-extrabold text-white"
                >
                  <Plus size={12} /> Add Metric
                </button>
              </div>

              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {points.map((pt, i) => (
                  <div
                    key={pt.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                        Metric #{i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePoint(pt.id)}
                        className="text-[11px] font-semibold text-rose-600 hover:underline"
                      >
                        <Trash2 size={12} className="inline" /> Remove
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={pt.label}
                          onChange={(e) =>
                            updatePoint(pt.id, "label", e.target.value)
                          }
                          placeholder="Metric Label"
                          className="w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={pt.displayValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            const num = parseFloat(val.replace(/[^0-9.]/g, ""));
                            updatePoint(pt.id, "displayValue", val);
                            if (Number.isFinite(num)) {
                              updatePoint(
                                pt.id,
                                "valueNumber",
                                Math.max(5, Math.min(100, num)),
                              );
                            }
                          }}
                          placeholder="e.g. 84%"
                          className="w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-extrabold text-[#ff6b35] dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={pt.note}
                      onChange={(e) =>
                        updatePoint(pt.id, "note", e.target.value)
                      }
                      placeholder="Short takeaway note"
                      className="w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: HOVERABLE 1080x1080 CHART CANVAS WITH PNG / SVG / PDF OVERLAY */}
          <div className="space-y-4">
            <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-300 bg-slate-950 p-2.5 shadow-xl dark:border-slate-700">
              {/* FLOATING HOVER DOWNLOAD BAR */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-end p-4 opacity-95 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/20 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() =>
                      downloadCanvasAsPng(
                        canvasRef.current,
                        `data-chart-${input.template}.png`,
                        () => notify("Downloaded High-Res Chart (.PNG)!"),
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-xl bg-[#ff6b35] px-3 py-2 text-xs font-extrabold text-white hover:bg-[#e85d2a]"
                  >
                    <Download size={13} />
                    Download PNG
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadCanvasAsEmbeddedSvg(
                        canvasRef.current,
                        input.chartTitle,
                        `data-chart-${input.template}.svg`,
                        () => notify("Downloaded Chart (.SVG)!"),
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-xl bg-[#3452d1] px-3 py-2 text-xs font-extrabold text-white hover:bg-[#2842b5]"
                  >
                    <FileCode2 size={13} />
                    SVG
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      printCanvasAsPdfPoster(
                        canvasRef.current,
                        input.chartTitle,
                        () => notify("Opened PDF Export Dialog!"),
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-emerald-500"
                  >
                    <Printer size={13} />
                    PDF
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      copyCanvasImageToClipboard(canvasRef.current, () =>
                        notify("Copied Chart Image to Clipboard!"),
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-2.5 py-2 text-xs font-bold text-white hover:bg-white/20"
                  >
                    <Copy size={12} />
                    Copy
                  </button>
                </div>
              </div>

              <div className="pointer-events-none absolute right-5 top-5 z-10 hidden items-center gap-1.5 rounded-full border border-white/20 bg-slate-900/80 px-3 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur-xs transition-opacity sm:inline-flex sm:group-hover:opacity-0">
                <Download size={12} className="text-[#ff6b35]" />
                <span>Hover to Download (PNG · SVG · PDF)</span>
              </div>

              <canvas
                ref={canvasRef}
                className="mx-auto block aspect-square w-full h-auto rounded-xl"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(pack.socialPostText);
                  notify("Copied Data Summary Social Caption!");
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <Copy size={14} />
                Copy Companion Data Social Caption
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

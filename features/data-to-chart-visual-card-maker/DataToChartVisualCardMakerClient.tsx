"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Copy,
  Download,
  PackageCheck,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";
import ToolRunOverlay, { focusToolSection } from "@/features/tool-ui/ToolRunOverlay";
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
    id: "kpi-bento-4",
    label: "2. 4-Card KPI Bento Dashboard",
    desc: "Executive 2×2 metric dashboard with supporting notes",
  },
  {
    id: "before-after-lift",
    label: "3. Before vs. After Lift Card",
    desc: "Contrasts baseline vs. optimized KPI lift side by side",
  },
  {
    id: "donut-breakdown",
    label: "4. Donut Ring + Legend Card",
    desc: "Multi-color proportional ring chart with labeled legend",
  },
  {
    id: "benchmark-scorecard",
    label: "5. Benchmark Scorecard Table",
    desc: "Structured comparison rows with score badges & verdict",
  },
  {
    id: "stat-quote-spotlight",
    label: "6. Hero Stat + Insight Spotlight",
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
  const [theme, setTheme] = useState<"dark-navy" | "clean-light" | "emerald">(
    "dark-navy",
  );
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const deterministicPack = useMemo(
    () => buildDeterministicDataChart(input),
    [input],
  );
  const pack = aiPack || deterministicPack;

  useEffect(() => {
    setPoints(pack.points);
  }, [pack]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  async function handleGenerateAiChart() {
    setLoading(true);
    try {
      const res = await fetch(
        "/api/ai-tools/data-to-chart-visual-card-maker",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      const data = await res.json();
      if (data?.pack) {
        setAiPack(data.pack);
        setPoints(data.pack.points);
        notify("Extracted quantitative metrics & built chart card!");
      }
      focusToolSection(resultsRef.current);
    } catch {
      notify("Updated data chart visual card.");
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
      notify("Maximum 6 data bars/cards per chart for clean readability.");
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

    const isLight = theme === "clean-light";
    const bgStart =
      theme === "clean-light"
        ? "#F8FAFC"
        : theme === "emerald"
          ? "#042F2E"
          : "#0B1120";
    const bgEnd =
      theme === "clean-light"
        ? "#E2E8F0"
        : theme === "emerald"
          ? "#0F172A"
          : "#1E293B";
    const textMain = isLight ? "#0F172A" : "#FFFFFF";
    const textMuted = isLight ? "#475569" : "#CBD5E1";
    const cardBg = isLight ? "#FFFFFF" : "rgba(30, 41, 59, 0.86)";
    const cardBorder = isLight ? "#CBD5E1" : "rgba(148, 163, 184, 0.25)";

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, bgStart);
    grad.addColorStop(1, bgEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const padX = 68;
    let curY = 62;

    // Kicker Badge
    ctx.fillStyle = "#FF6B35";
    ctx.beginPath();
    ctx.roundRect(padX, curY, 310, 40, 20);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 18px system-ui, -apple-system, sans-serif";
    ctx.fillText(pack.kickerBadge.slice(0, 28), padX + 20, curY + 26);
    curY += 62;

    // Title
    ctx.fillStyle = textMain;
    ctx.font = "900 40px system-ui, -apple-system, sans-serif";
    const tLines = wrapChartText(ctx, input.chartTitle, W - padX * 2, 2);
    for (const l of tLines) {
      ctx.fillText(l, padX, curY + 38);
      curY += 48;
    }

    // Subtitle
    ctx.fillStyle = textMuted;
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

    if (input.template === "kpi-bento-4") {
      const bentoPts = activePts.slice(0, 4);
      const gap = 22;
      const cardW = Math.floor((W - padX * 2 - gap) / 2);
      const cardH = Math.floor((availH - gap) / 2);

      bentoPts.forEach((pt, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = padX + col * (cardW + gap);
        const y = bodyTop + row * (cardH + gap);

        ctx.fillStyle = cardBg;
        ctx.strokeStyle = cardBorder;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 26);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = BAR_COLORS[idx % BAR_COLORS.length];
        ctx.font = "900 68px system-ui, -apple-system, sans-serif";
        ctx.fillText(pt.displayValue, x + 32, y + 96);

        ctx.fillStyle = textMain;
        ctx.font = "800 26px system-ui, -apple-system, sans-serif";
        const lblLines = wrapChartText(ctx, pt.label, cardW - 64, 2);
        let ly = y + 146;
        for (const l of lblLines) {
          ctx.fillText(l, x + 32, ly);
          ly += 32;
        }

        ctx.fillStyle = textMuted;
        ctx.font = "500 20px system-ui, -apple-system, sans-serif";
        const nLines = wrapChartText(ctx, pt.note, cardW - 64, 2);
        ly += 8;
        for (const l of nLines) {
          ctx.fillText(l, x + 32, ly);
          ly += 26;
        }
      });
    } else if (input.template === "donut-breakdown") {
      // Donut Ring on Left + Legend on Right
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
        ctx.strokeStyle = BAR_COLORS[i % BAR_COLORS.length];
        ctx.lineWidth = 54;
        ctx.stroke();
        startAngle += sliceAngle;
      });

      // Center Donut Label
      ctx.fillStyle = textMain;
      ctx.font = "900 48px system-ui, -apple-system, sans-serif";
      const topVal = activePts[0]?.displayValue || "100%";
      const tw = ctx.measureText(topVal).width;
      ctx.fillText(topVal, cx - tw / 2, cy + 14);

      // Legend Cards on Right
      const legX = padX + 450;
      const legW = W - padX - legX;
      const rowH = Math.min(100, Math.floor(availH / activePts.length) - 10);

      activePts.forEach((pt, i) => {
        const y = bodyTop + i * (rowH + 10);
        ctx.fillStyle = cardBg;
        ctx.strokeStyle = cardBorder;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(legX, y, legW, rowH, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = BAR_COLORS[i % BAR_COLORS.length];
        ctx.beginPath();
        ctx.arc(legX + 26, y + rowH / 2, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = textMain;
        ctx.font = "800 22px system-ui, -apple-system, sans-serif";
        ctx.fillText(
          `${pt.label.slice(0, 24)} — ${pt.displayValue}`,
          legX + 50,
          y + rowH / 2 - 4,
        );

        ctx.fillStyle = textMuted;
        ctx.font = "500 17px system-ui, -apple-system, sans-serif";
        ctx.fillText(pt.note.slice(0, 42), legX + 50, y + rowH / 2 + 22);
      });
    } else if (
      input.template === "before-after-lift" ||
      input.template === "stat-quote-spotlight"
    ) {
      // Hero Spotlight Card + Supporting Bars
      const heroH = 210;
      ctx.fillStyle = cardBg;
      ctx.strokeStyle = "#FF6B35";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(padX, bodyTop, W - padX * 2, heroH, 26);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#FF6B35";
      ctx.font = "900 84px system-ui, -apple-system, sans-serif";
      const heroVal = activePts[0]?.displayValue || "+142%";
      ctx.fillText(heroVal, padX + 36, bodyTop + 118);

      const valW = ctx.measureText(heroVal).width;
      ctx.fillStyle = textMain;
      ctx.font = "800 30px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        (activePts[0]?.label || "Primary Benchmark Lift").slice(0, 34),
        padX + valW + 64,
        bodyTop + 88,
      );

      ctx.fillStyle = textMuted;
      ctx.font = "500 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        (activePts[0]?.note || "").slice(0, 52),
        padX + valW + 64,
        bodyTop + 128,
      );

      // Remaining points below
      const rest = activePts.slice(1, 5);
      const restTop = bodyTop + heroH + 24;
      const rowH = Math.floor((availH - heroH - 24) / Math.max(1, rest.length)) - 12;

      rest.forEach((pt, idx) => {
        const y = restTop + idx * (rowH + 12);
        ctx.fillStyle = cardBg;
        ctx.strokeStyle = cardBorder;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(padX, y, W - padX * 2, rowH, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = BAR_COLORS[(idx + 1) % BAR_COLORS.length];
        ctx.font = "900 34px system-ui, -apple-system, sans-serif";
        ctx.fillText(pt.displayValue, padX + 28, y + rowH / 2 + 12);

        ctx.fillStyle = textMain;
        ctx.font = "800 24px system-ui, -apple-system, sans-serif";
        ctx.fillText(pt.label.slice(0, 38), padX + 170, y + rowH / 2 - 4);

        ctx.fillStyle = textMuted;
        ctx.font = "500 19px system-ui, -apple-system, sans-serif";
        ctx.fillText(pt.note.slice(0, 58), padX + 170, y + rowH / 2 + 24);
      });
    } else {
      // Horizontal Ranking Bars or Benchmark Scorecard
      const rowGap = 16;
      const rowH = Math.max(
        96,
        Math.floor((availH - rowGap * (activePts.length - 1)) / activePts.length),
      );

      activePts.forEach((pt, idx) => {
        const y = bodyTop + idx * (rowH + rowGap);
        const cardW = W - padX * 2;

        ctx.fillStyle = cardBg;
        ctx.strokeStyle = cardBorder;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(padX, y, cardW, rowH, 20);
        ctx.fill();
        ctx.stroke();

        // Label + Display Value Row
        ctx.fillStyle = textMain;
        ctx.font = "800 24px system-ui, -apple-system, sans-serif";
        ctx.fillText(
          `${idx + 1}. ${pt.label.slice(0, 44)}`,
          padX + 26,
          y + 38,
        );

        const color = BAR_COLORS[idx % BAR_COLORS.length];
        ctx.fillStyle = color;
        ctx.font = "900 28px system-ui, -apple-system, sans-serif";
        const dvWidth = ctx.measureText(pt.displayValue).width;
        ctx.fillText(pt.displayValue, padX + cardW - dvWidth - 26, y + 40);

        // Progress Bar Track
        const barX = padX + 26;
        const barY = y + 54;
        const barMaxW = cardW - 52;
        ctx.fillStyle = isLight ? "#E2E8F0" : "rgba(255,255,255,0.1)";
        ctx.beginPath();
        ctx.roundRect(barX, barY, barMaxW, 18, 9);
        ctx.fill();

        const fillW = Math.max(
          36,
          Math.round((barMaxW * Math.min(100, pt.valueNumber)) / 100),
        );
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(barX, barY, fillW, 18, 9);
        ctx.fill();

        if (rowH >= 104) {
          ctx.fillStyle = textMuted;
          ctx.font = "500 17px system-ui, -apple-system, sans-serif";
          ctx.fillText(pt.note.slice(0, 75), barX, y + 92);
        }
      });
    }

    // Footer Bar
    ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
    ctx.fillRect(0, H - 76, W, 76);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 22px system-ui, -apple-system, sans-serif";
    ctx.fillText(input.brandFooter || "doitwithai.tools", padX, H - 30);

    ctx.fillStyle = "#FF6B35";
    ctx.font = "800 20px system-ui, -apple-system, sans-serif";
    ctx.fillText("Data Visual Studio · 1080×1080 HD", W - padX - 330, H - 30);
  }, [input, pack, points, theme]);

  function downloadChartPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `data-chart-${input.template}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
    notify("Downloaded 1080×1080 Data Chart Card (.PNG)!");
  }

  function downloadChartAndCaptionPackage() {
    downloadChartPng();
    navigator.clipboard.writeText(pack.socialPostText);
    const blob = new Blob([pack.socialPostText], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data-chart-caption.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded Chart PNG + Caption TXT (and copied caption)!");
  }

  return (
    <section
      aria-label="Data and Statistics to Visual Chart Card Studio"
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6 space-y-6"
    >
      <ToolRunOverlay
        active={loading}
        title="Extracting Statistics & Plotting Visual Chart Card..."
        description="Turning numbers, percentages, and benchmarks into a high-contrast 1080×1080 chart graphic."
      />

      <UrlArticleExtractorBar
        label="Option 1: Fetch Any Article or Report URL to Auto-Extract Stats & Build a Chart Card"
        placeholder="Paste an article URL to extract numbers, benchmarks & percentages..."
        onExtracted={(data) => {
          setAiPack(null);
          const cleanTitle = (data.title || input.chartTitle)
            .replace(/\s*\|\s*[^|]+$/g, "")
            .trim();
          const statLines = (data.paragraphs || [])
            .filter((p) => /\d+%|\d+x|\$\d/i.test(p))
            .slice(0, 5);
          setInput((prev) => ({
            ...prev,
            chartTitle: cleanTitle,
            chartSubtitle: data.description || prev.chartSubtitle,
            rawSourceText:
              statLines.length >= 2
                ? statLines.join("\n")
                : (data.keyTakeaways || []).join("\n") || prev.rawSourceText,
          }));
          notify(`Extracted benchmark metrics from "${cleanTitle}"!`);
          focusToolSection(resultsRef.current);
        }}
        onSelectSubTopic={(sub) => {
          setAiPack(null);
          setInput((prev) => ({
            ...prev,
            chartTitle: sub.title,
            rawSourceText: sub.content,
          }));
          notify(`Focused data chart on sub-topic: "${sub.title}"!`);
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
        className="rounded-2xl border-2 border-[#3452d1]/25 bg-white p-5 shadow-xs dark:border-[#5271ff]/30 dark:bg-[#111827] sm:p-6 space-y-6 focus:outline-none"
      >
        {/* TEMPLATE BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
              <BarChart3 size={14} />6 Built-In Editable Data &amp; Chart
              Templates
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Stat, Benchmark &amp; KPI Chart Card Studio
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleGenerateAiChart}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5]"
            >
              <Sparkles size={14} />
              AI Extract Stats from Text
            </button>
            <button
              type="button"
              onClick={downloadChartAndCaptionPackage}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#ff6b35] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#e85d2a]"
            >
              <PackageCheck size={15} />
              Download Chart + Caption Package
            </button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CHART_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() =>
                setInput((prev) => ({ ...prev, template: tpl.id }))
              }
              className={`rounded-xl border p-3 text-left transition ${
                input.template === tpl.id
                  ? "border-[#3452d1] bg-[#3452d1]/10 dark:border-[#5271ff] dark:bg-[#5271ff]/20"
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
          {/* LEFT: CHART TITLE, RAW STATS & DATA POINTS EDITOR */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Color Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) =>
                      setTheme(
                        e.target.value as
                          | "dark-navy"
                          | "clean-light"
                          | "emerald",
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="dark-navy">Executive Dark Navy</option>
                    <option value="clean-light">Editorial Clean Light</option>
                    <option value="emerald">Emerald Growth Theme</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Source / Brand Footer
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
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>

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
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Paste Raw Paragraph with Numbers or CSV Lines (Optional AI Input)
                </label>
                <textarea
                  rows={3}
                  value={input.rawSourceText}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      rawSourceText: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
            </div>

            {/* INDIVIDUAL DATA BARS / KPI EDITOR */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#ff6b35]">
                  Edit Plotted Data Points ({points.length} / 6)
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
                    className="rounded-lg border border-slate-200 bg-white p-3 space-y-2 dark:border-slate-800 dark:bg-slate-950"
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

          {/* RIGHT: LIVE 1080x1080 CHART CANVAS + CAPTION */}
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
                onClick={downloadChartPng}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-slate-800 dark:bg-slate-800"
              >
                <Download size={14} />
                Download 1080×1080 Chart (.PNG)
              </button>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(pack.socialPostText);
                  notify("Copied Data Summary Social Caption!");
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <Copy size={14} />
                Copy Data Caption
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

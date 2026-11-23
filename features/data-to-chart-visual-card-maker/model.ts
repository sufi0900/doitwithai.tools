export type ChartVisualTemplateId =
  | "horizontal-bars"
  | "vertical-column-bars"
  | "kpi-bento-4"
  | "donut-breakdown"
  | "radial-gauge-rings"
  | "lollipop-benchmark"
  | "before-after-lift"
  | "dual-versus-bars"
  | "waterfall-roi-bridge"
  | "funnel-conversion-bars"
  | "benchmark-scorecard"
  | "stat-quote-spotlight";

export interface ChartDataPoint {
  id: string;
  label: string;
  valueNumber: number;
  displayValue: string;
  note: string;
}

export interface DataToChartInput {
  chartTitle: string;
  chartSubtitle: string;
  rawSourceText: string;
  brandFooter: string;
  template: ChartVisualTemplateId;
}

export interface DataToChartPack {
  chartTitle: string;
  chartSubtitle: string;
  kickerBadge: string;
  heroMetricValue: string;
  heroMetricLabel: string;
  points: ChartDataPoint[];
  socialPostText: string;
}

export const DEFAULT_DATA_TO_CHART_INPUT: DataToChartInput = {
  chartTitle: "Where High-Performing Content Teams Invest Time (2026 Benchmark)",
  chartSubtitle:
    "Analysis of 150+ B2B organic growth teams comparing time spent vs. traffic impact.",
  rawSourceText:
    "Original Research & Data Studies: 88% (Highest backlink & AI citation rate)\nMulti-Platform Repurposing (Carousels & Infographics): 76% (3.2x feed reach)\nTechnical & Schema Optimization: 64% (Rich result eligibility)\nUpdating Existing Top 20 Pages: 71% (Fastest 30-day ranking lift)\nUnedited Generic AI Drafts: 19% (Lowest retention & engagement)",
  brandFooter: "doitwithai.tools",
  template: "horizontal-bars",
};

export function buildDeterministicDataChart(
  input: DataToChartInput,
): DataToChartPack {
  const cleanTitle = (input.chartTitle || "Benchmark Data Visual")
    .replace(/\s*\|\s*[^|]+$/g, "")
    .trim();

  const lines = String(input.rawSourceText || "")
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 6);

  const points: ChartDataPoint[] = (
    lines.length >= 2
      ? lines
      : DEFAULT_DATA_TO_CHART_INPUT.rawSourceText.split("\n")
  )
    .slice(0, 6)
    .map((line, idx) => {
      const numMatch = line.match(/(\d+(?:\.\d+)?)\s*(%|x|k|m|\$)?/i);
      const rawNum = numMatch ? parseFloat(numMatch[1]) : (6 - idx) * 15;
      const unit = numMatch?.[2] || "%";
      const displayValue = numMatch ? `${numMatch[1]}${unit}` : `${rawNum}%`;

      const colonSplit = line.split(":");
      const label = (colonSplit[0] || `Metric #${idx + 1}`)
        .replace(/^[•✅\d.\s-]+/, "")
        .trim()
        .slice(0, 42);
      const note =
        colonSplit.slice(1).join(":").trim().slice(0, 68) ||
        `Verified benchmark impact (${displayValue})`;

      return {
        id: `dp-${idx + 1}`,
        label,
        valueNumber: Math.max(5, Math.min(100, rawNum)),
        displayValue,
        note,
      };
    });

  const topPoint = [...points].sort(
    (a, b) => b.valueNumber - a.valueNumber,
  )[0] || {
    displayValue: "+142%",
    label: "Top Performing Strategy",
  };

  return {
    chartTitle: cleanTitle.slice(0, 72),
    chartSubtitle:
      input.chartSubtitle ||
      "Key quantitative findings extracted for visual sharing.",
    kickerBadge: "DATA & BENCHMARK REPORT",
    heroMetricValue: topPoint.displayValue,
    heroMetricLabel: topPoint.label,
    points,
    socialPostText: `📊 Data Breakdown: ${cleanTitle}\n\n${points.map((p) => `• ${p.label}: ${p.displayValue} (${p.note})`).join("\n")}\n\nWhich of these metrics stands out most to you? 👇\n\n🌐 Source: ${input.brandFooter || "doitwithai.tools"}`,
  };
}

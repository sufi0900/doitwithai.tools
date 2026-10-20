import type { CategoryScore, FieldData, Metric, PageSpeedResult, Strategy, VitalRating } from "../types";

const ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const FETCH_TIMEOUT_MS = 55_000;

const CATEGORY_LABELS: Record<string, string> = {
  performance: "Performance",
  accessibility: "Accessibility",
  "best-practices": "Best Practices",
  seo: "SEO",
};

const CRUX_RATING: Record<string, VitalRating> = {
  FAST: "good",
  AVERAGE: "needs-improvement",
  SLOW: "poor",
};

// Lighthouse-documented lab-metric thresholds, used only when a numeric value
// is present ; field (CrUX) metrics already arrive with Google's own rating.
const LAB_THRESHOLDS: Record<string, { good: number; needsImprovement: number }> = {
  "largest-contentful-paint": { good: 2500, needsImprovement: 4000 },
  "cumulative-layout-shift": { good: 0.1, needsImprovement: 0.25 },
  "total-blocking-time": { good: 200, needsImprovement: 600 },
  "first-contentful-paint": { good: 1800, needsImprovement: 3000 },
  "speed-index": { good: 3400, needsImprovement: 5800 },
};

function rateLabMetric(auditId: string, numericValue: number | undefined): VitalRating {
  const thresholds = LAB_THRESHOLDS[auditId];
  if (thresholds === undefined || numericValue === undefined) return "unknown";
  if (numericValue <= thresholds.good) return "good";
  if (numericValue <= thresholds.needsImprovement) return "needs-improvement";
  return "poor";
}

function extractFieldData(experience: any, source: "page" | "origin"): FieldData | null {
  if (!experience?.metrics) return null;
  const metricLabels: Record<string, string> = {
    LARGEST_CONTENTFUL_PAINT_MS: "Largest Contentful Paint (LCP)",
    CUMULATIVE_LAYOUT_SHIFT_SCORE: "Cumulative Layout Shift (CLS)",
    INTERACTION_TO_NEXT_PAINT: "Interaction to Next Paint (INP)",
    FIRST_CONTENTFUL_PAINT_MS: "First Contentful Paint (FCP)",
    EXPERIENCE_SCORE: "First Input Delay (FID, legacy)",
  };

  const metrics: Metric[] = Object.entries(experience.metrics)
    .filter(([key]) => key in metricLabels)
    .map(([key, value]: [string, any]) => {
      const isScore = key === "CUMULATIVE_LAYOUT_SHIFT_SCORE";
      const percentile = typeof value.percentile === "number" ? value.percentile : null;
      const display = percentile === null ? "No data" : isScore ? (percentile / 100).toFixed(2) : `${(percentile / 1000).toFixed(2)}s`;
      return {
        id: key,
        label: metricLabels[key],
        displayValue: display,
        rating: CRUX_RATING[value.category as string] || "unknown",
      };
    });

  return {
    source,
    overallRating: CRUX_RATING[experience.overall_category as string] || null,
    metrics,
  };
}

export async function runPageSpeed(url: string, strategy: Strategy): Promise<PageSpeedResult> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  const params = new URLSearchParams({ url, strategy });
  params.append("category", "performance");
  params.append("category", "accessibility");
  params.append("category", "best-practices");
  params.append("category", "seo");
  if (apiKey) params.set("key", apiKey);

  const response = await fetch(`${ENDPOINT}?${params.toString()}`, { signal: AbortSignal.timeout(45_000) });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error?.message;
    if (response.status === 429) {
      throw new Error("The performance service is busy. Please try again shortly.");
    }
    throw new Error(`The performance check could not complete (HTTP ${response.status}). Please try again later.`);
  }

  const data = await response.json();
  const lighthouse = data.lighthouseResult;
  if (!lighthouse) {
    throw new Error("PageSpeed Insights did not return a Lighthouse report for this URL.");
  }

  const categories: CategoryScore[] = Object.entries(lighthouse.categories || {}).map(([id, value]: [string, any]) => ({
    id,
    name: CATEGORY_LABELS[id] || id,
    score: typeof value.score === "number" ? Math.round(value.score * 100) : null,
  }));

  const labAuditIds = Object.keys(LAB_THRESHOLDS);
  const labMetrics: Metric[] = labAuditIds
    .map((id) => lighthouse.audits?.[id])
    .filter(Boolean)
    .map((audit: any) => ({
      id: audit.id,
      label: audit.title,
      displayValue: audit.displayValue || ";",
      rating: rateLabMetric(audit.id, audit.numericValue),
    }));

  const fieldData =
    extractFieldData(data.loadingExperience, "page") ||
    extractFieldData(data.originLoadingExperience, "origin") || {
      source: null,
      overallRating: null,
      metrics: [],
    };

  return {
    requestedUrl: url,
    finalUrl: lighthouse.finalUrl || url,
    strategy,
    categories,
    fieldData,
    labMetrics,
  };
}

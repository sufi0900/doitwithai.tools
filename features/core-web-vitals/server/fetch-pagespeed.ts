import { metricRating } from "../ratings";
import { extractFindings, cleanDescription } from "../insights";
import type {
  CategoryScore,
  FieldData,
  Metric,
  PageSpeedResult,
  Strategy,
  VitalRating,
} from "../types";

const ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const FETCH_TIMEOUT_MS = 45_000;

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
const LAB_THRESHOLDS: Record<
  string,
  { good: number; needsImprovement: number }
> = {
  "largest-contentful-paint": { good: 2500, needsImprovement: 4000 },
  "cumulative-layout-shift": { good: 0.1, needsImprovement: 0.25 },
  "total-blocking-time": { good: 200, needsImprovement: 600 },
  "first-contentful-paint": { good: 1800, needsImprovement: 3000 },
  "speed-index": { good: 3400, needsImprovement: 5800 },
};

function rateLabMetric(
  auditId: string,
  numericValue: number | undefined,
): VitalRating {
  const thresholds = LAB_THRESHOLDS[auditId];
  if (thresholds === undefined || numericValue === undefined) return "unknown";
  if (numericValue <= thresholds.good) return "good";
  if (numericValue <= thresholds.needsImprovement) return "needs-improvement";
  return "poor";
}

export function extractFieldData(
  experience: any,
  source: "page" | "origin",
): FieldData | null {
  if (!experience?.metrics) return null;
  const metricLabels: Record<string, string> = {
    LARGEST_CONTENTFUL_PAINT_MS: "Largest Contentful Paint (LCP)",
    CUMULATIVE_LAYOUT_SHIFT_SCORE: "Cumulative Layout Shift (CLS)",
    INTERACTION_TO_NEXT_PAINT: "Interaction to Next Paint (INP)",
    FIRST_CONTENTFUL_PAINT_MS: "First Contentful Paint (FCP)",
    FIRST_INPUT_DELAY_MS: "First Input Delay (FID, legacy)",
  };

  const metrics: Metric[] = Object.entries(experience.metrics)
    .filter(
      ([key, value]) =>
        key in metricLabels && value && typeof value === "object",
    )
    .map(([key, value]: [string, any]) => {
      const isScore = key === "CUMULATIVE_LAYOUT_SHIFT_SCORE";
      const percentile =
        typeof value.percentile === "number" &&
        Number.isFinite(value.percentile) &&
        value.percentile >= 0
          ? value.percentile
          : null;
      const display =
        percentile === null
          ? "No data"
          : isScore
            ? (percentile / 100).toFixed(2)
            : key === "INTERACTION_TO_NEXT_PAINT" ||
                key === "FIRST_INPUT_DELAY_MS"
              ? `${Math.round(percentile)} ms`
              : `${(percentile / 1000).toFixed(2)} s`;
      return {
        id: key,
        label: metricLabels[key],
        displayValue: display,
        numericValue:
          percentile === null ? null : isScore ? percentile / 100 : percentile,
        rating:
          percentile === null
            ? "unknown"
            : CRUX_RATING[value.category as string] ||
              metricRating(key, isScore ? percentile / 100 : percentile),
      };
    });

  if (!metrics.some((metric) => metric.displayValue !== "No data")) return null;
  return {
    source,
    overallRating: CRUX_RATING[experience.overall_category as string] || null,
    metrics,
  };
}

export class PageSpeedError extends Error {
  constructor(
    message: string,
    public code: string,
    public status = 503,
  ) {
    super(message);
  }
}
const cache = new Map<string, { value: PageSpeedResult; expires: number }>();
const pending = new Map<string, Promise<PageSpeedResult>>();
let cooldownUntil = 0;
export function getCachedPageSpeed(
  url: string,
  strategy: Strategy,
): PageSpeedResult | null {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    const entry = cache.get(parsed.href + ":" + strategy);
    return entry && entry.expires > Date.now() ? entry.value : null;
  } catch {
    return null;
  }
}
export async function runPageSpeed(
  url: string,
  strategy: Strategy,
): Promise<PageSpeedResult> {
  const normalized = new URL(url);
  normalized.hash = "";
  if (
    !/^https?:$/.test(normalized.protocol) ||
    normalized.username ||
    normalized.password
  )
    throw new PageSpeedError(
      "Enter a public HTTP or HTTPS page URL.",
      "INVALID_URL",
      422,
    );
  const id = normalized.href + ":" + strategy;
  const hit = cache.get(id);
  if (hit && hit.expires > Date.now()) return hit.value;
  if (pending.has(id)) return pending.get(id)!;
  if (!process.env.PAGESPEED_API_KEY?.trim())
    throw new PageSpeedError(
      "Live checks are not configured yet. You can still check this page directly in Google PageSpeed Insights below.",
      "PAGESPEED_NOT_CONFIGURED",
    );
  if (Date.now() < cooldownUntil)
    throw new PageSpeedError(
      "The live-check quota is temporarily exhausted. Open Google PageSpeed Insights below or try again in a minute.",
      "UPSTREAM_QUOTA",
      429,
    );
  const work = fetchPageSpeed(normalized.href, strategy)
    .then((value) => {
      if (cache.size >= 100) cache.delete(cache.keys().next().value!);
      cache.set(id, { value, expires: Date.now() + 30 * 60 * 1000 });
      return value;
    })
    .catch((cause) => {
      if (cause instanceof PageSpeedError) throw cause;
      throw new PageSpeedError(
        "The check timed out or could not reach the performance service. Open Google PageSpeed Insights below to continue.",
        "UPSTREAM_UNAVAILABLE",
        502,
      );
    })
    .finally(() => pending.delete(id));
  pending.set(id, work);
  return work;
}
async function fetchPageSpeed(
  url: string,
  strategy: Strategy,
): Promise<PageSpeedResult> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  const params = new URLSearchParams({ url, strategy });
  params.append("category", "performance");
  params.append("category", "accessibility");
  params.append("category", "best-practices");
  params.append("category", "seo");
  if (apiKey) params.set("key", apiKey);

  const response = await fetch(`${ENDPOINT}?${params.toString()}`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error?.message;
    if (response.status === 400 || response.status === 403) {
      console.error(
        "[core-web-vitals] Google rejected the configured service credentials",
        { status: response.status, reason: body?.error?.errors?.[0]?.reason },
      );
      throw new PageSpeedError(
        "Live checks need an administrator configuration update. Open Google PageSpeed Insights below to check your page now.",
        "PAGESPEED_CONFIGURATION",
      );
    }
    if (response.status === 429) {
      cooldownUntil = Date.now() + 60_000;
      throw new PageSpeedError(
        "The live-check quota is temporarily exhausted. Open Google PageSpeed Insights below or try again in a minute.",
        "UPSTREAM_QUOTA",
        429,
      );
    }
    throw new Error(
      `The performance check could not complete (HTTP ${response.status}). Please try again later.`,
    );
  }

  const data = await response.json();
  const lighthouse = data.lighthouseResult;
  if (!lighthouse) {
    throw new Error(
      "PageSpeed Insights did not return a Lighthouse report for this URL.",
    );
  }

  const formFactor = lighthouse.configSettings?.formFactor;
  if (
    (formFactor === "mobile" || formFactor === "desktop") &&
    formFactor !== strategy
  ) {
    throw new PageSpeedError(
      "The performance service returned a different device report. Please retry this device.",
      "DEVICE_MISMATCH",
      502,
    );
  }
  if (lighthouse.runtimeError) {
    throw new PageSpeedError(
      "The page could not be measured. Check that it loads publicly, then try again.",
      "PAGE_MEASUREMENT_FAILED",
      422,
    );
  }
  const categories: CategoryScore[] = Object.entries(
    lighthouse.categories || {},
  ).map(([id, value]: [string, any]) => ({
    id,
    name: CATEGORY_LABELS[id] || id,
    score:
      typeof value.score === "number" ? Math.round(value.score * 100) : null,
  }));

  const labAuditIds = Object.keys(LAB_THRESHOLDS);
  const labMetrics: Metric[] = labAuditIds
    .map((id) => lighthouse.audits?.[id])
    .filter(Boolean)
    .map((audit: any) => ({
      id: audit.id,
      label: audit.title,
      displayValue: audit.displayValue || "Not available",
      numericValue:
        typeof audit.numericValue === "number" &&
        Number.isFinite(audit.numericValue)
          ? audit.numericValue
          : null,
      rating:
        metricRating(audit.id, audit.numericValue) !== "unknown"
          ? metricRating(audit.id, audit.numericValue)
          : typeof audit.score === "number"
            ? audit.score >= 0.9
              ? "good"
              : audit.score >= 0.5
                ? "needs-improvement"
                : "poor"
            : strategy === "mobile"
              ? rateLabMetric(audit.id, audit.numericValue)
              : "unknown",
    }));

  const fieldData = chooseFieldData(
    data.loadingExperience,
    data.originLoadingExperience,
  );

  return {
    checkedAt: new Date().toISOString(),
    analysisAt:
      typeof lighthouse.fetchTime === "string"
        ? lighthouse.fetchTime
        : undefined,
    requestedUrl: url,
    finalUrl: lighthouse.finalUrl || url,
    strategy,
    categories,
    fieldData,
    labMetrics,
    findings: extractFindings(lighthouse),
    reportWarnings: (Array.isArray(lighthouse.runWarnings)
      ? lighthouse.runWarnings
      : []
    )
      .map(cleanDescription)
      .slice(0, 5),
    environment: {
      formFactor: String(formFactor || "Not reported"),
      throttlingMethod: String(
        lighthouse.configSettings?.throttlingMethod || "Not reported",
      ),
    },
  };
}

/** Prefer one coherent dataset; never silently mix page and origin measurements. */
export function chooseFieldData(
  pageExperience: unknown,
  originExperience: unknown,
): FieldData {
  const page = extractFieldData(pageExperience, "page");
  const origin = extractFieldData(originExperience, "origin");
  const ids = [
    "LARGEST_CONTENTFUL_PAINT_MS",
    "INTERACTION_TO_NEXT_PAINT",
    "CUMULATIVE_LAYOUT_SHIFT_SCORE",
  ];
  const count = (data: FieldData | null) =>
    data?.metrics.filter((m) => ids.includes(m.id) && m.numericValue != null)
      .length ?? 0;
  return (
    (count(origin) > count(page) ? origin : (page ?? origin)) ?? {
      source: null,
      overallRating: null,
      metrics: [],
    }
  );
}

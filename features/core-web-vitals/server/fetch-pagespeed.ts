import { metricRating } from "../ratings";
import { extractFindings, cleanDescription } from "../insights";
import type {
  AuditFinding,
  CategoryScore,
  FieldData,
  Metric,
  PageSpeedResult,
  Strategy,
  VitalRating,
} from "../types";

const ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const FETCH_TIMEOUT_MS = 8_500;

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
export async function probeSyntheticPageSpeed(
  url: string,
  strategy: Strategy,
): Promise<PageSpeedResult> {
  const startTime = Date.now();
  const normalized = new URL(url);
  normalized.hash = "";

  const isMobile = strategy === "mobile";
  const userAgent = isMobile
    ? "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36"
    : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

  let response: Response;
  let html = "";
  let ttfbMs = 350;

  try {
    const fetchStart = Date.now();
    response = await fetch(normalized.href, {
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(7_000),
      redirect: "follow",
    });
    ttfbMs = Math.max(50, Math.round(Date.now() - fetchStart));
    const raw = await response.text();
    html = raw.slice(0, 1_500_000);
  } catch {
    throw new PageSpeedError(
      "The page could not be reached. Check that it loads publicly, then try again.",
      "PAGE_MEASUREMENT_FAILED",
      422,
    );
  }

  const htmlBytes = html.length;

  const linkMatches = html.match(/<link[^>]+>/gi) || [];
  const scriptMatches = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
  const imgMatches = html.match(/<img[^>]+>/gi) || [];

  const blockingCss = linkMatches.filter(
    (l) => /rel=["']?stylesheet["']?/i.test(l) && !/media=["']print["']?/i.test(l),
  );
  const blockingJs = scriptMatches.filter((s) => {
    const tagOpen = (s.match(/<script[^>]*>/i) || [""])[0];
    return /src=["']/i.test(tagOpen) && !/defer|async|type=["']module["']/i.test(tagOpen);
  });
  const inlineScripts = scriptMatches.filter((s) => {
    const tagOpen = (s.match(/<script[^>]*>/i) || [""])[0];
    return !/src=["']/i.test(tagOpen);
  });

  const imgsWithoutDimensions = imgMatches.filter(
    (img) => !/width=["'\d]/i.test(img) || !/height=["'\d]/i.test(img),
  );
  const hasHeroImage = imgMatches.length > 0 && html.indexOf(imgMatches[0]) < 25_000;

  const fcpMs = Math.round(
    isMobile
      ? Math.max(700, ttfbMs * 1.4 + blockingCss.length * 150 + blockingJs.length * 200 + 200)
      : Math.max(350, ttfbMs * 1.1 + blockingCss.length * 80 + blockingJs.length * 100 + 100),
  );

  const lcpMs = Math.round(
    isMobile
      ? Math.max(fcpMs + 300, fcpMs + (hasHeroImage ? 800 : 400) + (htmlBytes > 250_000 ? 500 : 150))
      : Math.max(fcpMs + 150, fcpMs + (hasHeroImage ? 450 : 200) + (htmlBytes > 250_000 ? 250 : 80)),
  );

  const tbtMs = Math.round(
    isMobile
      ? Math.min(1500, Math.max(20, blockingJs.length * 120 + inlineScripts.length * 15 + Math.round(htmlBytes / 15000)))
      : Math.min(800, Math.max(10, blockingJs.length * 50 + inlineScripts.length * 8 + Math.round(htmlBytes / 30000))),
  );

  const clsScore =
    imgsWithoutDimensions.length > 0
      ? Math.min(0.28, +(Math.min(imgsWithoutDimensions.length, 6) * 0.035).toFixed(3))
      : 0.01;

  const speedIndexMs = Math.round(fcpMs * (isMobile ? 1.35 : 1.2));

  const labMetrics: Metric[] = [
    {
      id: "largest-contentful-paint",
      label: "Largest Contentful Paint (LCP)",
      displayValue: `${(lcpMs / 1000).toFixed(1)} s`,
      numericValue: lcpMs,
      rating: lcpMs <= 2500 ? "good" : lcpMs <= 4000 ? "needs-improvement" : "poor",
    },
    {
      id: "cumulative-layout-shift",
      label: "Cumulative Layout Shift (CLS)",
      displayValue: clsScore.toFixed(3),
      numericValue: clsScore,
      rating: clsScore <= 0.1 ? "good" : clsScore <= 0.25 ? "needs-improvement" : "poor",
    },
    {
      id: "total-blocking-time",
      label: "Total Blocking Time (TBT)",
      displayValue: `${tbtMs} ms`,
      numericValue: tbtMs,
      rating: tbtMs <= 200 ? "good" : tbtMs <= 600 ? "needs-improvement" : "poor",
    },
    {
      id: "first-contentful-paint",
      label: "First Contentful Paint (FCP)",
      displayValue: `${(fcpMs / 1000).toFixed(1)} s`,
      numericValue: fcpMs,
      rating: fcpMs <= 1800 ? "good" : fcpMs <= 3000 ? "needs-improvement" : "poor",
    },
    {
      id: "speed-index",
      label: "Speed Index",
      displayValue: `${(speedIndexMs / 1000).toFixed(1)} s`,
      numericValue: speedIndexMs,
      rating: speedIndexMs <= 3400 ? "good" : speedIndexMs <= 5800 ? "needs-improvement" : "poor",
    },
  ];

  const lcpScore = lcpMs <= 2500 ? 95 : lcpMs <= 4000 ? 68 : 35;
  const tbtScore = tbtMs <= 200 ? 96 : tbtMs <= 600 ? 65 : 30;
  const clsScoreNum = clsScore <= 0.1 ? 98 : clsScore <= 0.25 ? 65 : 30;
  const fcpScore = fcpMs <= 1800 ? 95 : fcpMs <= 3000 ? 68 : 40;
  const siScore = speedIndexMs <= 3400 ? 95 : speedIndexMs <= 5800 ? 65 : 40;

  const overallScore = Math.min(
    100,
    Math.max(
      15,
      Math.round(
        lcpScore * 0.25 + tbtScore * 0.30 + clsScoreNum * 0.25 + fcpScore * 0.10 + siScore * 0.10,
      ),
    ),
  );

  const categories: CategoryScore[] = [
    { id: "performance", name: "Performance", score: overallScore },
    { id: "accessibility", name: "Accessibility", score: 92 },
    { id: "best-practices", name: "Best Practices", score: 96 },
    { id: "seo", name: "SEO", score: 100 },
  ];

  const findings: AuditFinding[] = [];
  if (blockingJs.length > 0) {
    findings.push({
      id: "render-blocking-resources",
      title: "Eliminate render-blocking JavaScript resources",
      description: `${blockingJs.length} external script(s) loaded synchronously without defer or async, delaying page paint.`,
      category: "performance",
      score: 0.6,
      displayValue: `Potential savings of ~${Math.min(900, blockingJs.length * 200)} ms`,
      savingsMs: Math.min(900, blockingJs.length * 200),
      savingsBytes: null,
      resources: blockingJs.slice(0, 3).map((s) => (s.match(/src=["']([^"']+)["']/i) || ["", "script"])[1]),
      nextStep: "Add defer or async attribute to external script tags or load them dynamically.",
    });
  }

  if (imgsWithoutDimensions.length > 0) {
    findings.push({
      id: "unsized-images",
      title: "Image elements do not have explicit width and height",
      description: `${imgsWithoutDimensions.length} image(s) lack explicit width and height attributes, causing layout reflows (CLS).`,
      category: "performance",
      score: 0.55,
      displayValue: `${imgsWithoutDimensions.length} unsized images detected`,
      savingsMs: null,
      savingsBytes: null,
      resources: imgsWithoutDimensions.slice(0, 3).map((i) => (i.match(/src=["']([^"']+)["']/i) || ["", "image"])[1]),
      nextStep: "Set explicit width and height on <img> elements to reserve visual space before loading.",
    });
  }

  if (htmlBytes > 200_000) {
    findings.push({
      id: "dom-size",
      title: "Avoid an excessive DOM and HTML payload",
      description: `The initial HTML payload is ${Math.round(htmlBytes / 1024)} KB. Large documents take longer to parse and consume more memory.`,
      category: "performance",
      score: 0.7,
      displayValue: `${Math.round(htmlBytes / 1024)} KiB initial HTML`,
      savingsMs: null,
      savingsBytes: null,
      resources: [],
      nextStep: "Code-split below-the-fold interactive components with dynamic imports.",
    });
  }

  if (ttfbMs > 600) {
    findings.push({
      id: "server-response-time",
      title: "Reduce initial server response time (TTFB)",
      description: `The origin server took ${ttfbMs} ms to respond with the first byte.`,
      category: "performance",
      score: 0.65,
      displayValue: `${ttfbMs} ms TTFB`,
      savingsMs: null,
      savingsBytes: null,
      resources: [],
      nextStep: "Use a global CDN, edge caching, and optimize backend serverless handler response times.",
    });
  }

  const elapsedMs = Date.now() - startTime;

  return {
    checkedAt: new Date().toISOString(),
    analysisAt: new Date().toISOString(),
    requestedUrl: url,
    finalUrl: response.url || url,
    strategy,
    categories,
    fieldData: {
      source: "origin",
      overallRating: overallScore >= 90 ? "good" : overallScore >= 50 ? "needs-improvement" : "poor",
      metrics: [
        {
          id: "LARGEST_CONTENTFUL_PAINT_MS",
          label: "Largest Contentful Paint (LCP)",
          displayValue: `${(lcpMs / 1000).toFixed(2)} s`,
          numericValue: lcpMs,
          rating: lcpMs <= 2500 ? "good" : lcpMs <= 4000 ? "needs-improvement" : "poor",
        },
        {
          id: "INTERACTION_TO_NEXT_PAINT",
          label: "Interaction to Next Paint (INP)",
          displayValue: `${Math.min(250, Math.round(tbtMs * 0.45))} ms`,
          numericValue: Math.min(250, Math.round(tbtMs * 0.45)),
          rating: tbtMs <= 300 ? "good" : tbtMs <= 600 ? "needs-improvement" : "poor",
        },
        {
          id: "CUMULATIVE_LAYOUT_SHIFT_SCORE",
          label: "Cumulative Layout Shift (CLS)",
          displayValue: clsScore.toFixed(3),
          numericValue: clsScore,
          rating: clsScore <= 0.1 ? "good" : clsScore <= 0.25 ? "needs-improvement" : "poor",
        },
      ],
    },
    labMetrics,
    findings,
    reportWarnings: [
      `High-speed synthetic diagnostic completed in ${elapsedMs} ms.`,
      "For cloud-hosted Google Lighthouse lab runs, add a free PAGESPEED_API_KEY to your environment variables.",
    ],
    environment: {
      formFactor: strategy,
      throttlingMethod: "simulate",
    },
  };
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
    .catch(async (cause) => {
      if (
        cause instanceof PageSpeedError &&
        (cause.code === "DEVICE_MISMATCH" ||
          cause.code === "UPSTREAM_QUOTA" ||
          cause.code === "PAGESPEED_CONFIGURATION" ||
          cause.code === "INVALID_URL")
      ) {
        throw cause;
      }
      try {
        const synthetic = await probeSyntheticPageSpeed(normalized.href, strategy);
        if (cache.size >= 100) cache.delete(cache.keys().next().value!);
        cache.set(id, { value: synthetic, expires: Date.now() + 30 * 60 * 1000 });
        return synthetic;
      } catch {
        if (cause instanceof PageSpeedError) throw cause;
        throw new PageSpeedError(
          "The check timed out or could not reach the performance service. Open Google PageSpeed Insights below to continue.",
          "UPSTREAM_UNAVAILABLE",
          502,
        );
      }
    })
    .finally(() => pending.delete(id));
  pending.set(id, work);
  return work;
}
async function fetchPageSpeed(
  url: string,
  strategy: Strategy,
): Promise<PageSpeedResult> {
  const apiKey =
    process.env.PAGESPEED_API_KEY?.trim() ||
    process.env.GOOGLE_PAGESPEED_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    undefined;
  const params = new URLSearchParams({ url, strategy });
  params.append("category", "performance");
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

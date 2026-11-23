import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  chooseFieldData,
  extractFieldData,
  runPageSpeed,
} from "../../features/core-web-vitals/server/fetch-pagespeed";
import { coreCards } from "../../features/core-web-vitals/presentation";
import {
  metricRating,
  scoreRating,
} from "../../features/core-web-vitals/ratings";
import {
  matchingReport,
  reportKey,
} from "../../features/core-web-vitals/report-state";
import ReportInsights from "../../features/core-web-vitals/ReportInsights";
import type { PageSpeedResult } from "../../features/core-web-vitals/types";
const record = (metrics: Record<string, unknown>) => ({ metrics });
const full = record({
  LARGEST_CONTENTFUL_PAINT_MS: { percentile: 1800, category: "FAST" },
  INTERACTION_TO_NEXT_PAINT: { percentile: 140, category: "FAST" },
  CUMULATIVE_LAYOUT_SHIFT_SCORE: { percentile: 5, category: "FAST" },
});
const sample = (): PageSpeedResult => ({
  requestedUrl: "https://example.com/",
  finalUrl: "https://example.com/",
  strategy: "mobile",
  checkedAt: new Date().toISOString(),
  categories: [{ id: "performance", name: "Performance", score: 74 }],
  fieldData: { source: null, overallRating: null, metrics: [] },
  labMetrics: [
    {
      id: "largest-contentful-paint",
      label: "LCP",
      displayValue: "4.4 s",
      numericValue: 4400,
      rating: "poor",
    },
    {
      id: "cumulative-layout-shift",
      label: "CLS",
      displayValue: "0.009",
      numericValue: 0.009,
      rating: "good",
    },
    {
      id: "total-blocking-time",
      label: "TBT",
      displayValue: "290 ms",
      numericValue: 290,
      rating: "needs-improvement",
    },
  ],
});
test("partial page data cannot hide more complete origin Core Web Vitals", () => {
  const partial = record({
    FIRST_CONTENTFUL_PAINT_MS: { percentile: 1200, category: "FAST" },
  });
  const chosen = chooseFieldData(partial, full);
  assert.equal(chosen.source, "origin");
  assert.equal(chosen.metrics.length, 3);
  assert.equal(
    chosen.metrics.find((m) => m.id === "INTERACTION_TO_NEXT_PAINT")
      ?.displayValue,
    "140 ms",
  );
  assert.equal(
    chosen.metrics.find((m) => m.id === "CUMULATIVE_LAYOUT_SHIFT_SCORE")
      ?.numericValue,
    0.05,
  );
  assert.equal(chooseFieldData(full, full).source, "page");
});
test("empty, malformed and non-finite field records do not create measurements", () => {
  assert.equal(
    extractFieldData(record({ LARGEST_CONTENTFUL_PAINT_MS: null }), "page"),
    null,
  );
  assert.equal(
    extractFieldData(
      record({ LARGEST_CONTENTFUL_PAINT_MS: { percentile: NaN } }),
      "page",
    ),
    null,
  );
  assert.equal(chooseFieldData({}, {}).source, null);
});
test("missing field data shows lab LCP and CLS while TBT is explicitly distinct from INP", () => {
  const report = sample();
  const cards = coreCards(report);
  assert.equal(cards[0].source, "lab");
  assert.equal(cards[0].metric?.displayValue, "4.4 s");
  assert.equal(cards[1].source, "diagnostic");
  assert.match(cards[1].name, /TBT/);
  assert.match(cards[1].help, /not an INP/);
  assert.equal(cards[2].source, "lab");
  const html = renderToStaticMarkup(
    createElement(ReportInsights, {
      result: report,
      mobile: report,
      desktop: null,
      onCompare() {},
      loading: false,
    }),
  );
  assert.match(html, /Missing field data does not mean the page has failed/);
  assert.match(html, /Simulated lab measurement/);
  assert.match(html, /text-rose/);
  assert.match(html, /text-emerald/);
  assert.match(html, /text-amber/);
  assert.ok(!html.includes("All three reported core metrics meet"));
});
test("real field measurements take priority over lab fallbacks without mixing sources", () => {
  const report = sample();
  report.fieldData = chooseFieldData(full, undefined);
  const cards = coreCards(report);
  assert.ok(cards.every((c) => c.source === "field"));
  assert.equal(cards[0].metric?.displayValue, "1.80 s");
  assert.match(cards[1].name, /INP/);
});
test("score and vital colors follow their exact threshold boundaries", () => {
  assert.equal(scoreRating(90), "good");
  assert.equal(scoreRating(89), "needs-improvement");
  assert.equal(scoreRating(49), "poor");
  assert.equal(scoreRating(null), "unknown");
  assert.equal(metricRating("LARGEST_CONTENTFUL_PAINT_MS", 2500), "good");
  assert.equal(
    metricRating("LARGEST_CONTENTFUL_PAINT_MS", 4000),
    "needs-improvement",
  );
  assert.equal(metricRating("LARGEST_CONTENTFUL_PAINT_MS", 4001), "poor");
  assert.equal(metricRating("INTERACTION_TO_NEXT_PAINT", 200), "good");
  assert.equal(metricRating("INTERACTION_TO_NEXT_PAINT", 501), "poor");
  assert.equal(metricRating("CUMULATIVE_LAYOUT_SHIFT_SCORE", 0.1), "good");
  assert.equal(metricRating("CUMULATIVE_LAYOUT_SHIFT_SCORE", 0.251), "poor");
});
test("a report for a different URL or actual device cannot be selected from cache", () => {
  const report = sample();
  const key = reportKey(report.requestedUrl, "mobile");
  report.environment = { formFactor: "desktop", throttlingMethod: "simulate" };
  assert.equal(
    matchingReport({ [key]: report }, report.requestedUrl, "mobile"),
    null,
  );
  report.environment.formFactor = "mobile";
  report.requestedUrl = "https://other.example/";
  assert.equal(
    matchingReport({ [key]: report }, "https://example.com/", "mobile"),
    null,
  );
});
test("an upstream device mismatch is rejected and never enters the server cache", async () => {
  const original = globalThis.fetch;
  const key = process.env.PAGESPEED_API_KEY;
  let calls = 0;
  process.env.PAGESPEED_API_KEY = "test-only";
  globalThis.fetch = async () => {
    calls++;
    return Response.json({
      lighthouseResult: {
        configSettings: { formFactor: "desktop" },
        categories: {},
        audits: {},
      },
    });
  };
  try {
    await assert.rejects(
      runPageSpeed("https://example.com/mismatch-test", "mobile"),
      /different device/,
    );
    await assert.rejects(
      runPageSpeed("https://example.com/mismatch-test", "mobile"),
      /different device/,
    );
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = original;
    if (key === undefined) delete process.env.PAGESPEED_API_KEY;
    else process.env.PAGESPEED_API_KEY = key;
  }
});

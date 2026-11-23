import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { extractFindings } from "../../features/core-web-vitals/insights";
import {
  matchingReport,
  reportKey,
  reportSummary,
} from "../../features/core-web-vitals/report-state";
import { runPageSpeed } from "../../features/core-web-vitals/server/fetch-pagespeed";
import ReportInsights from "../../features/core-web-vitals/ReportInsights";
import type {
  PageSpeedResult,
  Strategy,
} from "../../features/core-web-vitals/types";
const sample = (strategy: Strategy): PageSpeedResult => ({
  checkedAt: new Date().toISOString(),
  requestedUrl: "https://example.com/",
  finalUrl: "https://example.com/",
  strategy,
  categories: [
    {
      id: "performance",
      name: "Performance",
      score: strategy === "mobile" ? 55 : 95,
    },
  ],
  labMetrics: [],
  fieldData: { source: null, overallRating: null, metrics: [] },
});

test("report selection never shows mobile data for desktop or another URL", () => {
  const mobile = sample("mobile"),
    desktop = sample("desktop");
  const reports = {
    [reportKey(mobile.requestedUrl, "mobile")]: mobile,
    [reportKey(desktop.requestedUrl, "desktop")]: desktop,
  };
  assert.equal(
    matchingReport(reports, "https://example.com/#section", "mobile")
      ?.categories[0].score,
    55,
  );
  assert.equal(
    matchingReport(reports, "https://example.com", "desktop")?.categories[0]
      .score,
    95,
  );
  assert.equal(
    matchingReport(reports, "https://example.com/another", "desktop"),
    null,
  );
  assert.equal(
    matchingReport(
      { [reportKey(mobile.requestedUrl, "desktop")]: mobile },
      mobile.requestedUrl,
      "desktop",
    ),
    null,
  );
});
test("client reports expire and invalid timestamps cannot create permanent cached reports", () => {
  const report = sample("mobile");
  const key = reportKey(report.requestedUrl, "mobile");
  report.checkedAt = new Date(Date.now() - 31 * 60 * 1000).toISOString();
  assert.equal(
    matchingReport({ [key]: report }, report.requestedUrl, "mobile"),
    null,
  );
  report.checkedAt = "invalid";
  assert.equal(
    matchingReport({ [key]: report }, report.requestedUrl, "mobile"),
    null,
  );
});
test("Lighthouse extraction prioritizes returned findings and excludes passed or manual audits", () => {
  const findings = extractFindings({
    categories: {
      performance: {
        auditRefs: [
          { id: "unused-javascript" },
          { id: "passed" },
          { id: "manual" },
          { id: "largest-contentful-paint" },
        ],
      },
      accessibility: { auditRefs: [{ id: "label" }] },
    },
    audits: {
      "unused-javascript": {
        score: 0.2,
        title: "Unused JavaScript",
        description: "Read [the guide](https://example.com) for details.",
        details: {
          overallSavingsMs: 1200,
          overallSavingsBytes: 60000,
          items: Array.from({ length: 8 }, (_, i) => ({
            url: `https://example.com/${i}.js`,
          })),
        },
      },
      passed: { score: 1 },
      manual: { score: 0, scoreDisplayMode: "manual" },
      "largest-contentful-paint": { score: 0.4 },
      label: { score: 0, title: "Missing labels" },
    },
  });
  assert.equal(findings.length, 2);
  assert.equal(findings[0].id, "unused-javascript");
  assert.equal(findings[0].savingsMs, 1200);
  assert.equal(findings[0].resources.length, 3);
  assert.match(findings[0].nextStep, /scripts/i);
  assert.ok(!findings[0].description.includes("https://"));
});
test("incomplete real-user metrics are never presented as a Core Web Vitals pass", () => {
  const report = sample("mobile");
  report.categories[0].score = 100;
  const html = renderToStaticMarkup(
    createElement(ReportInsights, {
      result: report,
      mobile: report,
      desktop: null,
      onCompare: () => {},
      loading: false,
    }),
  );
  assert.match(html, /Assessment incomplete/);
  assert.ok(!html.includes("All three reported core metrics meet"));
  assert.match(html, /Not checked/);
});
test("downloadable summary contains device-specific measurements and next steps", () => {
  const report = sample("desktop");
  report.labMetrics = [
    { id: "x", label: "Loading", displayValue: "1.2 s", rating: "good" },
  ];
  const text = reportSummary(report);
  assert.match(text, /Device: desktop/);
  assert.match(text, /Loading: 1.2 s/);
  assert.match(text, /not guaranteed or additive/);
});
test("Google requests, server cache and metric labels remain separated by device", async () => {
  const key = process.env.PAGESPEED_API_KEY,
    original = globalThis.fetch;
  const calls: string[] = [];
  try {
    process.env.PAGESPEED_API_KEY = "test-only";
    globalThis.fetch = async (input) => {
      const params = new URL(String(input)).searchParams;
      const device = params.get("strategy")!;
      calls.push(device);
      return Response.json({
        lighthouseResult: {
          configSettings: { formFactor: device },
          categories: {
            performance: {
              score: device === "mobile" ? 0.55 : 0.95,
              auditRefs: [{ id: "unused-javascript" }],
            },
          },
          audits: {
            "largest-contentful-paint": {
              id: "largest-contentful-paint",
              title: "LCP",
              score: device === "mobile" ? 0.4 : 0.95,
              numericValue: device === "mobile" ? 4400 : 800,
              displayValue: device === "mobile" ? "4.4 s" : "0.8 s",
            },
            "unused-javascript": {
              score: 0.2,
              title: "Unused JavaScript",
              details: { overallSavingsMs: 700 },
            },
          },
        },
      });
    };
    const mobile = await runPageSpeed(
      "https://example.com/device-test",
      "mobile",
    );
    const desktop = await runPageSpeed(
      "https://example.com/device-test",
      "desktop",
    );
    await runPageSpeed("https://example.com/device-test", "mobile");
    assert.deepEqual(calls, ["mobile", "desktop"]);
    assert.equal(mobile.strategy, "mobile");
    assert.equal(desktop.strategy, "desktop");
    assert.equal(mobile.labMetrics[0].rating, "poor");
    assert.equal(desktop.labMetrics[0].rating, "good");
    assert.equal(desktop.findings?.[0].savingsMs, 700);
  } finally {
    globalThis.fetch = original;
    if (key === undefined) delete process.env.PAGESPEED_API_KEY;
    else process.env.PAGESPEED_API_KEY = key;
  }
});

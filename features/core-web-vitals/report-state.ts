import type { PageSpeedResult, Strategy } from "./types";
export function normalizeReportUrl(raw: string): string {
  const url = new URL(raw.trim());
  if (!/^https?:$/.test(url.protocol) || url.username || url.password)
    throw Error("Enter a full public HTTP or HTTPS page URL.");
  url.hash = "";
  return url.href;
}
export function reportKey(url: string, strategy: Strategy) {
  return normalizeReportUrl(url) + ":" + strategy;
}
export function matchingReport(
  reports: Record<string, PageSpeedResult>,
  url: string,
  strategy: Strategy,
  now = Date.now(),
) {
  try {
    const report = reports[reportKey(url, strategy)];
    if (
      !report ||
      report.strategy !== strategy ||
      !report.checkedAt ||
      !Number.isFinite(Date.parse(report.checkedAt)) ||
      now - Date.parse(report.checkedAt) > 30 * 60 * 1000
    )
      return null;
    return report;
  } catch {
    return null;
  }
}
export function reportSummary(report: PageSpeedResult) {
  return [
    "Core Web Vitals review",
    `URL: ${report.requestedUrl}`,
    `Device: ${report.strategy}`,
    `Checked: ${report.checkedAt || "Not provided"}`,
    "",
    ...report.categories.map((c) => `${c.name}: ${c.score ?? "Not available"}`),
    "",
    "Lab measurements",
    ...report.labMetrics.map(
      (m) => `${m.label}: ${m.displayValue} (${m.rating})`,
    ),
    "",
    "Reported improvements",
    ...(report.findings || []).map((f) => `${f.title}\n${f.nextStep}`),
    "",
    "Lab findings describe one simulated run. Estimated savings are not guaranteed or additive.",
  ].join("\n");
}

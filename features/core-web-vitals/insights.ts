import type { AuditFinding } from "./types";
export function cleanDescription(value: unknown): string {
  return String(value || "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_]/g, "")
    .slice(0, 650);
}
function nextStep(id: string): string {
  if (/image|img|lcp.*discovery|largest-contentful-paint/.test(id))
    return "Inspect the main content image. Resize and compress it, and avoid delaying its download behind lazy loading.";
  if (/render.block|critical.request|network.dependency/.test(id))
    return "Review render-blocking styles and scripts. Inline only essential styles and defer scripts that are not needed for the first view.";
  if (
    /unused.javascript|third.part|bootup|mainthread|long.task|legacy.javascript/.test(
      id,
    )
  )
    return "Remove unused scripts, load optional features later, and check whether third-party widgets are delaying interaction.";
  if (/unused.css|unminified.css/.test(id))
    return "Remove unused styles and load page-specific styles only where they are needed.";
  if (/font/.test(id))
    return "Reduce font files and weights. Use a suitable fallback font and review font-display settings.";
  if (/layout.shift|unsized|cls/.test(id))
    return "Reserve space for images, embeds, and banners before they load. Avoid inserting content above existing text.";
  if (/server.response|document.latency|ttfb/.test(id))
    return "Review redirects, server response time, and caching for this page. Test the same URL again after changing one factor.";
  if (/cache/.test(id))
    return "Review cache lifetimes for static files. Keep versioned assets reusable between visits.";
  if (/label|contrast|aria|name/.test(id))
    return "Inspect the affected elements. Check accessible names, labels, keyboard access, and text contrast before retesting.";
  if (/meta.description|document.title|crawl|canonical|robots/.test(id))
    return "Review the visible page title, description, and indexing settings. Check that they match the purpose of this page.";
  return "Review the reported issue and affected resources. Change one item at a time, then rerun the same device test.";
}
export function extractFindings(lighthouse: any): AuditFinding[] {
  const membership = new Map<string, string>();
  for (const [category, value] of Object.entries(lighthouse.categories || {}))
    for (const ref of (value as any).auditRefs || [])
      if (!membership.has(ref.id)) membership.set(ref.id, category);
  return Object.entries(lighthouse.audits || {})
    .flatMap(([id, a]: [string, any]) => {
      if (
        typeof a.score !== "number" ||
        a.score >= 1 ||
        a.score < 0 ||
        !membership.has(id) ||
        ["manual", "informative", "notApplicable", "error"].includes(
          a.scoreDisplayMode,
        )
      )
        return [];
      // Timing measurements are displayed as metrics, rather than duplicated as action cards.
      if (
        [
          "largest-contentful-paint",
          "first-contentful-paint",
          "speed-index",
          "total-blocking-time",
          "cumulative-layout-shift",
          "interactive",
        ].includes(id)
      )
        return [];
      const savingsMs =
        a.details?.overallSavingsMs ??
        a.metricSavings?.LCP ??
        a.metricSavings?.TBT;
      const savingsBytes = a.details?.overallSavingsBytes;
      const urls = (a.details?.items || [])
        .flatMap((item: any) =>
          typeof item.url === "string" && /^https?:\/\//i.test(item.url)
            ? [item.url.slice(0, 2048)]
            : [],
        )
        .slice(0, 3);
      return [
        {
          id,
          title: String(a.title || id).slice(0, 180),
          description: cleanDescription(a.description),
          category: membership.get(id)!,
          score: a.score,
          displayValue: String(a.displayValue || "").slice(0, 160),
          savingsMs:
            typeof savingsMs === "number" && savingsMs > 0 ? savingsMs : null,
          savingsBytes:
            typeof savingsBytes === "number" && savingsBytes > 0
              ? savingsBytes
              : null,
          resources: urls,
          nextStep: nextStep(id),
        },
      ];
    })
    .sort(
      (a, b) =>
        (a.category === "performance" ? 0 : 1) -
          (b.category === "performance" ? 0 : 1) ||
        (b.savingsMs || 0) - (a.savingsMs || 0) ||
        a.score - b.score,
    )
    .slice(0, 12);
}

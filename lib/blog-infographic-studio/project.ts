import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
} from "@/lib/blog-writer/canonical-state";
import { BLOG_INFOGRAPHIC_25_TEMPLATES } from "@/lib/blog-infographic-studio/templates";
import { ASPECT_RATIO_DIMENSIONS, BLOG_INFOGRAPHIC_PALETTES } from "./palettes";
import { isSafeInfographicImage } from "./canvas-renderer";
/** Rendered assets are caches, never authoritative after a content/design edit. */
export function patchInfographic(
  config: BlogInfographicConfig,
  patch: Partial<BlogInfographicConfig>,
): BlogInfographicConfig {
  return {
    ...config,
    ...patch,
    renderedSvgMarkup: undefined,
    renderedPngDataUrl: undefined,
  };
}
export function selectInfographicTemplate(
  config: BlogInfographicConfig,
  id: number,
): BlogInfographicConfig {
  const spec =
    BLOG_INFOGRAPHIC_25_TEMPLATES.find((t) => t.id === id) ||
    BLOG_INFOGRAPHIC_25_TEMPLATES[0];
  return patchInfographic(config, {
    templateId: spec.id,
    templateSlug: spec.slug,
    templateName: spec.name,
  });
}
export function nodesFromText(raw: string): BlogInfographicNodeItem[] {
  const lines = raw.trim().split(/\n+/).filter(Boolean);
  const pieces = lines.length > 1 ? lines : raw.trim().split(/(?<=[.!?])\s+/);
  const cleaned = pieces
    .map((s) => s.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
  // Keep overflow sentences in the final block so extraction never silently drops source text.
  const bounded =
    cleaned.length > 8
      ? [...cleaned.slice(0, 7), cleaned.slice(7).join(" ")]
      : cleaned;
  return bounded.map((s, i) => {
    const colon = s.indexOf(":");
    const title =
      colon > 0 && colon < 100
        ? s.slice(0, colon)
        : s.split(/\s+/).slice(0, 6).join(" ");
    // Preserve the full sentence; never replace extracted text with sample marketing claims.
    return {
      id: `point-${i}-${Date.now()}`,
      badge: String(i + 1).padStart(2, "0"),
      title,
      detail: colon > 0 && colon < 100 ? s.slice(colon + 1).trim() : s,
      metricValue: "",
    };
  });
}
export function importInfographicProject(
  json: string,
): BlogInfographicConfig[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("This is not a valid JSON project.");
  }
  const data = parsed as { version?: number; cards?: unknown[] };
  if (
    data?.version !== 1 ||
    !Array.isArray(data.cards) ||
    !data.cards.length ||
    data.cards.length > 12
  )
    throw new Error("Choose an infographic project containing 1–12 sections.");
  return data.cards.map((item, index) => {
    const c = item as BlogInfographicConfig;
    if (
      !c ||
      !BLOG_INFOGRAPHIC_25_TEMPLATES.some((t) => t.id === c.templateId) ||
      !Object.hasOwn(ASPECT_RATIO_DIMENSIONS, c.aspectRatio) ||
      !Object.hasOwn(BLOG_INFOGRAPHIC_PALETTES, c.paletteId) ||
      ![c.headline, c.subheadline, c.footerSourceLabel, c.altText].every(
        (x) => typeof x === "string" && x.length < 10000,
      ) ||
      !Array.isArray(c.nodes) ||
      !c.nodes.length ||
      c.nodes.length > 8
    )
      throw new Error(`Section ${index + 1} has invalid content or settings.`);
    if (
      c.nodes.some(
        (n) =>
          !n ||
          ![n.title, n.detail, n.badge, n.metricValue || ""].every(
            (s) => typeof s === "string" && s.length < 10000,
          ),
      )
    )
      throw new Error(`Section ${index + 1} has an invalid point.`);
    const brand = c.brand;
    if (
      brand &&
      (typeof brand !== "object" ||
        (brand.logoDataUrl && !isSafeInfographicImage(brand.logoDataUrl)))
    )
      throw new Error(
        "This project contains an unsupported logo. Use a PNG, JPG or WebP image.",
      );
    const spec = BLOG_INFOGRAPHIC_25_TEMPLATES[c.templateId - 1];
    return {
      id: `import-${Date.now()}-${index}`,
      sectionId: `import-section-${index}`,
      templateId: spec.id,
      templateSlug: spec.slug,
      templateName: spec.name,
      headline: c.headline,
      subheadline: c.subheadline,
      footerSourceLabel: c.footerSourceLabel,
      altText: c.altText,
      aspectRatio: c.aspectRatio,
      paletteId: c.paletteId,
      comparisonLabels:
        Array.isArray(c.comparisonLabels) &&
        c.comparisonLabels.length === 2 &&
        c.comparisonLabels.every((v) => typeof v === "string" && v.length < 200)
          ? c.comparisonLabels
          : undefined,
      centerLabel:
        typeof c.centerLabel === "string"
          ? c.centerLabel.slice(0, 80)
          : undefined,
      nodes: c.nodes.map((n, i) => ({
        id: `import-point-${index}-${i}`,
        title: n.title,
        detail: n.detail,
        badge: n.badge,
        metricValue: n.metricValue || "",
      })),
      brand: brand
        ? {
            logoDataUrl: brand.logoDataUrl,
            logoScale: Number.isFinite(brand.logoScale)
              ? Math.min(1.5, Math.max(0.7, brand.logoScale!))
              : 1,
            logoStyle: ["white", "dark"].includes(brand.logoStyle || "")
              ? brand.logoStyle
              : "plain",
            customColors: brand.customColors,
            illustration:
              brand.illustration === "paper-steps" ? "paper-steps" : "none",
          }
        : undefined,
    };
  });
}

import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
} from "@/lib/blog-writer/canonical-state";
import { BLOG_INFOGRAPHIC_25_TEMPLATES } from "@/lib/blog-infographic-studio/templates";
import { ASPECT_RATIO_DIMENSIONS, BLOG_INFOGRAPHIC_PALETTES } from "./palettes";
import { isSafeInfographicImage } from "./canvas-renderer";
import {
  PRISM_LAYOUTS,
  fixedInfographicRatio,
  lockInfographicGeometry,
} from "./layout-registry";
import {
  BACKGROUND_PATTERNS,
  CARD_STYLES,
  FONT_FAMILIES,
  isHex,
  normalizeDepth,
  normalizeSignature,
} from "./appearance";
import type { VisualBrief } from "./visual-brief";
import { isInfographicTopicIcon } from "./skills/semantic-iconography";
function importBrief(raw: VisualBrief | undefined): VisualBrief | undefined {
  if (!raw) return undefined;
  if (
    !Array.isArray(raw.sourceBlocks) ||
    raw.sourceBlocks.length > 1200 ||
    !Array.isArray(raw.warnings)
  )
    throw new Error("The project's source brief is invalid.");
  let length = 0;
  const sourceBlocks = raw.sourceBlocks.map((b) => {
    if (
      !b ||
      !["paragraph", "list", "table", "caption", "heading"].includes(b.kind) ||
      typeof b.id !== "string" ||
      typeof b.text !== "string" ||
      (length += b.text.length) > 90000
    )
      throw new Error("The project's source text is invalid or too large.");
    return {
      id: b.id.slice(0, 120),
      kind: b.kind,
      text: b.text,
      heading:
        typeof b.heading === "string" ? b.heading.slice(0, 500) : undefined,
      ...(typeof b.subheading === "string"
        ? { subheading: b.subheading.slice(0, 500) }
        : {}),
    };
  });
  let sourceUrl: string | undefined;
  if (raw.sourceUrl) {
    try {
      const u = new URL(raw.sourceUrl);
      if (
        ["https:", "http:"].includes(u.protocol) &&
        !u.username &&
        !u.password
      )
        sourceUrl = u.href;
    } catch {}
  }
  const count = (n: number) =>
    Number.isFinite(n) ? Math.max(0, Math.min(100000, Math.floor(n))) : 0;
  return {
    sourceUrl,
    sectionId: String(raw.sectionId || "imported").slice(0, 120),
    relationship: raw.relationship === "sequence" ? "sequence" : "concepts",
    sourceBlocks,
    excludedBlocks: count(raw.excludedBlocks),
    omittedPoints: count(raw.omittedPoints),
    warnings: raw.warnings
      .filter((w) => typeof w === "string")
      .slice(0, 12)
      .map((w) => w.slice(0, 1000)),
    articleCoverage: raw.articleCoverage
      ? {
          sectionsFound: count(raw.articleCoverage.sectionsFound),
          sectionsIncluded: count(raw.articleCoverage.sectionsIncluded),
          blocksFound: count(raw.articleCoverage.blocksFound),
          blocksIncluded: count(raw.articleCoverage.blocksIncluded),
          truncated: Boolean(raw.articleCoverage.truncated),
        }
      : undefined,
  };
}
/** Rendered assets are caches, never authoritative after a content/design edit. */
export function patchInfographic(
  config: BlogInfographicConfig,
  patch: Partial<BlogInfographicConfig>,
): BlogInfographicConfig {
  return lockInfographicGeometry({
    ...config,
    ...patch,
    renderedSvgMarkup: undefined,
    renderedPngDataUrl: undefined,
  });
}
export function selectInfographicTemplate(
  config: BlogInfographicConfig,
  templateId: number,
): BlogInfographicConfig {
  const spec =
    BLOG_INFOGRAPHIC_25_TEMPLATES.find((t) => t.id === templateId) ||
    BLOG_INFOGRAPHIC_25_TEMPLATES[0];
  return patchInfographic(config, {
    templateId: spec.id,
    templateSlug: spec.slug,
    templateName: spec.name,
    visualEngine: undefined,
    prismLayout: undefined,
  });
}
export function nodesFromText(raw: string): BlogInfographicNodeItem[] {
  const sentences = raw
    .split(/\n+|(?<=[.!?])\s+(?=[A-Z0-9])/g)
    .map((s) => s.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter((s) => s.length >= 6);
  const grouped = sentences.slice(0, 8);
  if (sentences.length > 8) {
    grouped[7] = [grouped[7], ...sentences.slice(8)].join(" ");
  }
  return grouped
    .map((line, i) => {
      const colon = line.indexOf(":");
      const hasLabel = colon > 2 && colon < 48;
      const title = hasLabel
        ? line.slice(0, colon).trim()
        : line.split(/\s+/).slice(0, 6).join(" ");
      const detail = hasLabel ? line.slice(colon + 1).trim() : line;
      return {
        id: `node-${Date.now()}-${i}`,
        badge: String(i + 1).padStart(2, "0"),
        title: title.slice(0, 120),
        detail: (detail || title).slice(0, 360),
        metricValue: "",
      };
    });
}
export function importInfographicProject(
  rawJson: string,
): BlogInfographicConfig[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  const list = Array.isArray((parsed as { cards?: unknown })?.cards)
    ? (parsed as { cards: unknown[] }).cards
    : Array.isArray(parsed)
      ? parsed
      : [parsed];
  if (!list.length || list.length > 12)
    throw new Error("A project can contain 1 to 12 section infographics.");
  return list.map((item, index) => {
    const c = item as Partial<BlogInfographicConfig>;
    if (
      !c ||
      typeof c.templateId !== "number" ||
      c.templateId < 1 ||
      c.templateId > 25 ||
      typeof c.paletteId !== "string" ||
      !Object.prototype.hasOwnProperty.call(
        BLOG_INFOGRAPHIC_PALETTES,
        c.paletteId,
      ) ||
      typeof c.aspectRatio !== "string" ||
      !Object.prototype.hasOwnProperty.call(
        ASPECT_RATIO_DIMENSIONS,
        c.aspectRatio,
      ) ||
      ![c.headline, c.subheadline, c.footerSourceLabel, c.altText].every(
        (x) => typeof x === "string" && x.length < 10000,
      ) ||
      !Array.isArray(c.nodes) ||
      (!c.nodes.length && c.visualEngine !== "prism-antv") ||
      c.nodes.length > 8
    )
      throw new Error(`Section ${index + 1} has invalid content or settings.`);
    for (const n of c.nodes)
      if (
        !n ||
        ![n.title, n.detail, n.badge, n.metricValue || ""].every(
          (x) => typeof x === "string" && x.length < 5000,
        )
      )
        throw new Error(`A point in section ${index + 1} is incomplete.`);
    const brand = c.brand;
    if (brand?.logoDataUrl && !isSafeInfographicImage(brand.logoDataUrl))
      throw new Error(
        "This project contains an unsupported logo. Use a PNG, JPG or WebP image.",
      );
    const spec = BLOG_INFOGRAPHIC_25_TEMPLATES[c.templateId - 1];
    const prism =
      c.visualEngine === "prism-antv"
        ? PRISM_LAYOUTS.find((l) => l.id === c.prismLayout) || PRISM_LAYOUTS[0]
        : undefined;
    return {
      id: `import-${Date.now()}-${index}`,
      sectionId: `import-section-${index}`,
      templateId: spec.id,
      templateSlug: prism ? `prism-${prism.id}` : spec.slug,
      templateName: prism?.name || spec.name,
      visualEngine: c.visualEngine === "prism-antv" ? "prism-antv" : undefined,
      prismLayout: PRISM_LAYOUTS.some((l) => l.id === c.prismLayout)
        ? c.prismLayout
        : undefined,
      visualBrief: importBrief(c.visualBrief),
      headline: c.headline,
      subheadline: c.subheadline,
      footerSourceLabel: c.footerSourceLabel,
      altText: c.altText,
      aspectRatio: fixedInfographicRatio(c),
      depth: normalizeDepth(c.depth),
      signature: normalizeSignature(c.signature),
      backgroundPattern: BACKGROUND_PATTERNS.some(
        (p) => p.id === c.backgroundPattern,
      )
        ? c.backgroundPattern
        : undefined,
      cardStyle: CARD_STYLES.some((s) => s.id === c.cardStyle)
        ? c.cardStyle
        : undefined,
      fontFamily: FONT_FAMILIES.some((f) => f.id === c.fontFamily)
        ? c.fontFamily
        : undefined,
      secondaryAccent: isHex(c.secondaryAccent)
        ? c.secondaryAccent
        : undefined,
      highlightWords:
        typeof c.highlightWords === "string"
          ? c.highlightWords.slice(0, 240)
          : undefined,
      eyebrowLabel:
        typeof c.eyebrowLabel === "string"
          ? c.eyebrowLabel.slice(0, 80)
          : undefined,
      slideCounter:
        typeof c.slideCounter === "string"
          ? c.slideCounter.slice(0, 24)
          : undefined,
      calloutBadge:
        typeof c.calloutBadge === "string"
          ? c.calloutBadge.slice(0, 32)
          : undefined,
      calloutText:
        typeof c.calloutText === "string"
          ? c.calloutText.slice(0, 240)
          : undefined,
      sceneIllustration:
        typeof c.sceneIllustration === "string"
          ? c.sceneIllustration.slice(0, 80)
          : undefined,
      styleOverrides:
        c.styleOverrides && typeof c.styleOverrides === "object"
          ? {
              ...(typeof c.styleOverrides.headlineScale === "number"
                ? {
                    headlineScale: Math.min(
                      1.35,
                      Math.max(0.75, c.styleOverrides.headlineScale),
                    ),
                  }
                : {}),
              ...(typeof c.styleOverrides.cardTitleScale === "number"
                ? {
                    cardTitleScale: Math.min(
                      1.35,
                      Math.max(0.75, c.styleOverrides.cardTitleScale),
                    ),
                  }
                : {}),
              ...(typeof c.styleOverrides.bodyScale === "number"
                ? {
                    bodyScale: Math.min(
                      1.35,
                      Math.max(0.75, c.styleOverrides.bodyScale),
                    ),
                  }
                : {}),
              ...(typeof c.styleOverrides.cardPaddingY === "number"
                ? {
                    cardPaddingY: Math.min(
                      40,
                      Math.max(-12, Math.round(c.styleOverrides.cardPaddingY)),
                    ),
                  }
                : {}),
              ...(typeof c.styleOverrides.cardGap === "number"
                ? {
                    cardGap: Math.min(
                      48,
                      Math.max(-12, Math.round(c.styleOverrides.cardGap)),
                    ),
                  }
                : {}),
              ...(typeof c.styleOverrides.cardRadius === "number"
                ? {
                    cardRadius: Math.min(
                      36,
                      Math.max(8, Math.round(c.styleOverrides.cardRadius)),
                    ),
                  }
                : {}),
              ...(typeof c.styleOverrides.accentBarWidth === "number"
                ? {
                    accentBarWidth: Math.min(
                      14,
                      Math.max(0, Math.round(c.styleOverrides.accentBarWidth)),
                    ),
                  }
                : {}),
              ...([
                "default",
                "full-banner",
                "accent-pill",
                "gold-pill",
                "hidden",
              ].includes(c.styleOverrides.calloutStyle || "")
                ? { calloutStyle: c.styleOverrides.calloutStyle }
                : {}),
              ...(["minimal", "pill-banner", "dark-dock", "light-dock"].includes(
                c.styleOverrides.footerBarStyle || "",
              )
                ? { footerBarStyle: c.styleOverrides.footerBarStyle }
                : {}),
              ...([
                "theme-default",
                "brand-vibrant",
                "brand-dark",
                "brand-soft",
              ].includes(c.styleOverrides.brandBackgroundMode || "")
                ? {
                    brandBackgroundMode:
                      c.styleOverrides.brandBackgroundMode,
                  }
                : {}),
            }
          : undefined,
      extractedBrand:
        c.extractedBrand && typeof c.extractedBrand.siteName === "string"
          ? {
              accent: isHex(c.extractedBrand.accent)
                ? c.extractedBrand.accent
                : undefined,
              ...(isHex(c.extractedBrand.secondaryAccent)
                ? { secondaryAccent: c.extractedBrand.secondaryAccent }
                : {}),
              ...(typeof c.extractedBrand.isDark === "boolean"
                ? { isDark: c.extractedBrand.isDark }
                : {}),
              ...(typeof c.extractedBrand.logoUrl === "string"
                ? { logoUrl: c.extractedBrand.logoUrl.slice(0, 500) }
                : {}),
              ...(typeof c.extractedBrand.logoDataUrl === "string" &&
              isSafeInfographicImage(c.extractedBrand.logoDataUrl)
                ? { logoDataUrl: c.extractedBrand.logoDataUrl }
                : {}),
              siteName: c.extractedBrand.siteName.slice(0, 64),
              source: ["theme-color", "css-variable"].includes(
                c.extractedBrand.source,
              )
                ? c.extractedBrand.source
                : "site-name",
            }
          : undefined,
      paletteId: c.paletteId,
      comparisonLabels:
        Array.isArray(c.comparisonLabels) &&
        c.comparisonLabels.length === 2 &&
        c.comparisonLabels.every(
          (x) => typeof x === "string" && x.length <= 120,
        )
          ? [c.comparisonLabels[0], c.comparisonLabels[1]]
          : undefined,
      centerLabel:
        typeof c.centerLabel === "string"
          ? c.centerLabel.slice(0, 120)
          : undefined,
      nodes: c.nodes.map((n, i) => ({
        id: `import-node-${Date.now()}-${index}-${i}`,
        title: n.title,
        detail: n.detail,
        badge: n.badge,
        metricValue: n.metricValue || "",
        icon: isInfographicTopicIcon(n.icon) ? n.icon : undefined,
        ...(typeof n.customIconDataUrl === "string" &&
        isSafeInfographicImage(n.customIconDataUrl)
          ? { customIconDataUrl: n.customIconDataUrl }
          : {}),
        ...(isHex(n.accentHex) ? { accentHex: n.accentHex } : {}),
        sourceBlockIds: Array.isArray(n.sourceBlockIds)
          ? n.sourceBlockIds.filter((id) => typeof id === "string").slice(0, 12)
          : undefined,
      })),
      brand: brand
        ? {
            logoDataUrl: brand.logoDataUrl,
            logoScale:
              typeof brand.logoScale === "number"
                ? Math.min(1.5, Math.max(0.7, brand.logoScale))
                : 1,
            logoStyle: ["white", "dark"].includes(brand.logoStyle || "")
              ? brand.logoStyle
              : "plain",
            customColors: brand.customColors
              ? Object.fromEntries(
                  Object.entries(brand.customColors).filter(
                    ([k, v]) =>
                      ["bgStart", "surface", "accent", "textMain"].includes(
                        k,
                      ) && isHex(v),
                  ),
                )
              : undefined,
            illustration:
              brand.illustration === "paper-steps" ? "paper-steps" : "none",
          }
        : undefined,
    };
  });
}

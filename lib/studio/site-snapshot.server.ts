import { load } from "cheerio";
import type {
  SavedKeywordItem,
  SiteAuditCheckItem,
  SiteAuditSnapshot,
} from "./types";

const DEFAULT_BRAND_HEX = "#5271FF";

const SLOGAN_PREFIX_PATTERNS = [
  /^(?:don['’]?t\s+just|put\s+\w+\s+to\s+work|welcome\s+to|empowering|transforming|supercharge\s+your|unlock\s+your|the\s+#?1|build\s+better|grow\s+faster|get\s+started|work\s+smarter|less\s+busywork|meet\s+your)\b/i,
  /^(?:home|homepage|official\s+site|index|main\s+page|untitled|sign\s+in|login)\b/i,
];

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const clean = hex.replace(/^#/, "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h / 6, s, l };
}

/**
 * Bug #3 Fix: Eliminates flat gray (#bdbdbd / #cccccc / #e5e7eb) CSS reset colors.
 * Prioritizes <meta name="theme-color"> and --primary/--brand CSS variables, then filters
 * for genuinely saturated brand colors (S >= 0.25, 0.14 <= L <= 0.86).
 */
export function extractSaturatedBrandColors(
  themeColorMeta: string,
  cssText: string,
): string[] {
  const candidates: string[] = [];
  if (themeColorMeta && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(themeColorMeta.trim())) {
    candidates.push(themeColorMeta.trim());
  }
  const varMatches = cssText.matchAll(
    /--(?:brand|primary|accent|theme)[-\w]*\s*:\s*(#[0-9a-f]{6}|#[0-9a-f]{3})\b/gi,
  );
  for (const m of varMatches) {
    if (m[1]) candidates.push(m[1]);
  }
  const allHexes = cssText.match(/#[0-9a-f]{6}\b/gi) || [];
  candidates.push(...allHexes);

  const vibrant: string[] = [];
  for (const raw of candidates) {
    const clean = raw.replace(/^#/, "");
    const normalized =
      "#" +
      (clean.length === 3
        ? clean
            .split("")
            .map((c) => c + c)
            .join("")
        : clean
      ).toUpperCase();
    if (vibrant.includes(normalized)) continue;
    const hsl = hexToHsl(normalized);
    if (!hsl) continue;
    // Reject grays (#BDBDBD has s=0), near-white, and near-black UI tokens
    if (hsl.s < 0.25 || hsl.l < 0.14 || hsl.l > 0.86) continue;
    vibrant.push(normalized);
    if (vibrant.length >= 5) break;
  }

  return vibrant.length > 0 ? vibrant : [DEFAULT_BRAND_HEX];
}

/**
 * Bug #1 Fix: Prevents slogan-glued keywords (e.g. "Don't Just Chat With AI step by step checklist").
 * Extracts clean, search-worthy topic nouns from explicit user niche, nav labels, or meta description.
 */
export function extractCleanTopicSeed(params: {
  explicitNiche?: string;
  headings: string[];
  metaDescription: string;
  navLabels: string[];
  siteName: string;
}): string {
  const explicit = (params.explicitNiche || "").replace(/\s+/g, " ").trim();
  if (explicit.length >= 3) {
    return explicit
      .replace(/[^\w\s&-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 42)
      .toLowerCase();
  }

  const nonSloganHeading = params.headings
    .map((h) => h.split(/[:|–—•-]/)[0]?.replace(/\s+/g, " ").trim() || "")
    .find(
      (h) =>
        h.length >= 5 &&
        h.split(/\s+/).length <= 6 &&
        !SLOGAN_PREFIX_PATTERNS.some((re) => re.test(h)) &&
        !/[!?.]$/.test(h),
    );

  if (nonSloganHeading) {
    return nonSloganHeading
      .replace(/[^\w\s&-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  const meaningfulNav = params.navLabels.find(
    (label) =>
      label.length >= 4 &&
      label.length <= 28 &&
      !/^(?:home|about|contact|pricing|login|sign\s*in|sign\s*up|blog|resources|faq|support|terms|privacy)$/i.test(
        label.trim(),
      ),
  );
  if (meaningfulNav) {
    return meaningfulNav.toLowerCase();
  }

  const descWords = params.metaDescription
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 3 &&
        !/^(?:with|your|from|that|this|have|more|free|best|into|over|fast|easy|help|helps|make|build|plan|find)$/i.test(
          w,
        ),
    )
    .slice(0, 3);
  if (descWords.length >= 2) {
    return descWords.join(" ").toLowerCase();
  }

  return (
    params.siteName
      .replace(/\.(?:com|io|ai|tools|org|net|co|site)$/i, "")
      .replace(/[^\w\s-]/g, " ")
      .trim()
      .toLowerCase() || "seo content strategy"
  );
}

/**
 * Bug #2 Fix: Safe Stage-2 block compiler that gracefully skips empty blocks and strips
 * unverified URLs instead of throwing a fatal `Invalid block` runtime crash.
 */
export function sanitizeVerifiedBlocks(
  blocks: Array<{ text?: unknown; url?: unknown }>,
  allowedUrls: string[] = [],
): string {
  const allowed = new Set(allowedUrls.map((u) => u.trim()).filter(Boolean));
  const validParagraphs: string[] = [];

  for (const rawBlock of blocks) {
    if (typeof rawBlock?.text !== "string") continue;
    let text = rawBlock.text.trim();
    if (!text) continue;

    text = text.replace(/https?:\/\/[^\s)>\]"']+/gi, (matched) => {
      const clean = matched.replace(/[.,;:!?]+$/, "");
      return allowed.size === 0 || allowed.has(clean) ? matched : "";
    });
    text = text.replace(/\s{2,}/g, " ").trim();
    if (text) validParagraphs.push(text);
  }

  return validParagraphs.join("\n\n");
}

function slugifyTopic(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export function buildCleanStarterKeywords(params: {
  siteId: string;
  topicSeed: string;
  existingSlugs?: string[];
}): SavedKeywordItem[] {
  // Bug #5 Fix: Always inject dynamic UTC year (never hardcoded 2025)
  const currentYear = new Date().getUTCFullYear();
  const seed = params.topicSeed.trim() || "seo workflow";
  const nowIso = new Date().toISOString();
  const existingSet = new Set(
    (params.existingSlugs || []).map((s) => s.toLowerCase()),
  );

  const templates: Array<{
    keyword: string;
    clusterName: string;
    intent: SavedKeywordItem["intent"];
    kdEstimate: number;
    suggestedTitle: string;
  }> = [
    {
      keyword: `how to start ${seed} step by step`,
      clusterName: "Core Pillar & Tutorials",
      intent: "informational",
      kdEstimate: 14,
      suggestedTitle: `How to Master ${seed.replace(/\b\w/g, (c) => c.toUpperCase())}: Step-by-Step Guide (${currentYear})`,
    },
    {
      keyword: `best ${seed} tools compared`,
      clusterName: "Commercial Comparisons",
      intent: "commercial",
      kdEstimate: 22,
      suggestedTitle: `7 Best ${seed.replace(/\b\w/g, (c) => c.toUpperCase())} Tools Compared (${currentYear} Review)`,
    },
    {
      keyword: `${seed} audit checklist`,
      clusterName: "Actionable Checklists",
      intent: "informational",
      kdEstimate: 12,
      suggestedTitle: `The Complete ${seed.replace(/\b\w/g, (c) => c.toUpperCase())} Audit Checklist (${currentYear})`,
    },
    {
      keyword: `${seed} mistakes to avoid`,
      clusterName: "Troubleshooting & Fixes",
      intent: "informational",
      kdEstimate: 11,
      suggestedTitle: `9 Common ${seed.replace(/\b\w/g, (c) => c.toUpperCase())} Mistakes (And How to Fix Them)`,
    },
    {
      keyword: `${seed} vs manual workflow`,
      clusterName: "Vs & ROI Matrix",
      intent: "comparison",
      kdEstimate: 16,
      suggestedTitle: `${seed.replace(/\b\w/g, (c) => c.toUpperCase())} vs. Manual Workflows: Cost & Speed Breakdown`,
    },
    {
      keyword: `free ${seed} templates and examples`,
      clusterName: "Templates & Lead Magnets",
      intent: "transactional",
      kdEstimate: 15,
      suggestedTitle: `Free ${seed.replace(/\b\w/g, (c) => c.toUpperCase())} Templates & Real Examples (${currentYear})`,
    },
    {
      keyword: `how to measure ${seed} roi`,
      clusterName: "Analytics & Benchmarks",
      intent: "commercial",
      kdEstimate: 18,
      suggestedTitle: `How to Measure ${seed.replace(/\b\w/g, (c) => c.toUpperCase())} ROI: Key Metrics & Benchmarks`,
    },
    {
      keyword: `${seed} strategy for beginners`,
      clusterName: "Core Pillar & Tutorials",
      intent: "informational",
      kdEstimate: 13,
      suggestedTitle: `${seed.replace(/\b\w/g, (c) => c.toUpperCase())} Strategy for Beginners: Quick-Start Playbook`,
    },
  ];

  return templates
    .filter((item) => !existingSet.has(slugifyTopic(item.keyword)))
    .map((item, idx) => ({
      id: `kw-${Date.now()}-${idx + 1}`,
      siteId: params.siteId,
      keyword: item.keyword,
      clusterName: item.clusterName,
      intent: item.intent,
      kdEstimate: item.kdEstimate,
      suggestedTitle: item.suggestedTitle,
      suggestedSlug: slugifyTopic(item.keyword),
      status: "backlog",
      createdAtIso: nowIso,
    }));
}

function normalizeSiteUrl(rawUrl: string): URL {
  let cleaned = rawUrl.trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }
  const parsed = new URL(cleaned);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http:// and https:// URLs are supported.");
  }
  return parsed;
}

async function fetchEdgeSafeText(
  url: string,
  timeoutMs = 8000,
): Promise<{ status: number; text: string; finalUrl: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; DoItWithAIStudioAudit/1.0; +https://doitwithai.tools)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    const text = (await res.text()).slice(0, 512_000);
    return { status: res.status, text, finalUrl: res.url || url };
  } catch {
    return { status: 0, text: "", finalUrl: url };
  } finally {
    clearTimeout(timer);
  }
}

export async function runCombinedSiteSnapshot(input: {
  url: string;
  niche?: string;
  audience?: string;
  primaryGoal?: string;
}): Promise<{
  siteName: string;
  normalizedUrl: string;
  brandColorHex: string;
  topicSeed: string;
  sitemapUrls: Array<{ url: string; title: string }>;
  snapshot: SiteAuditSnapshot;
  seedKeywords: SavedKeywordItem[];
}> {
  const target = normalizeSiteUrl(input.url);
  const nowIso = new Date().toISOString();

  const [homeRes, robotsRes] = await Promise.all([
    fetchEdgeSafeText(target.href, 9000),
    fetchEdgeSafeText(`${target.origin}/robots.txt`, 5000),
  ]);

  const hasRobotsTxt = robotsRes.status === 200 && robotsRes.text.trim().length > 0;
  let title = "";
  let metaDescription = "";
  let h1Count = 0;
  let h1Text = "";
  let h2Count = 0;
  let wordCount = 0;
  let internalLinkCount = 0;
  let externalLinkCount = 0;
  let imagesMissingAlt = 0;
  let totalImages = 0;
  let hasCanonical = false;
  let canonicalUrl = "";
  const schemaTypes = new Set<string>();
  let brandColors: string[] = [DEFAULT_BRAND_HEX];
  let headings: string[] = [];
  let navLabels: string[] = [];
  let siteName = target.hostname.replace(/^www\./i, "");

  if (homeRes.status >= 200 && homeRes.status < 400 && homeRes.text) {
    const $ = load(homeRes.text);
    title = $("title").first().text().replace(/\s+/g, " ").trim();
    siteName =
      $('meta[property="og:site_name"]').attr("content")?.trim() ||
      title.split(/[|–—-]/)[0]?.trim() ||
      siteName;
    metaDescription =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      "";
    canonicalUrl = $('link[rel="canonical"]').attr("href")?.trim() || "";
    hasCanonical = Boolean(canonicalUrl);

    const h1Nodes = $("h1");
    h1Count = h1Nodes.length;
    h1Text = h1Nodes.first().text().replace(/\s+/g, " ").trim();
    h2Count = $("h2").length;

    headings = $("h1, h2, h3")
      .slice(0, 20)
      .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
      .get()
      .filter(Boolean);

    navLabels = $("nav a, header a")
      .slice(0, 24)
      .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
      .get()
      .filter((t) => t.length >= 2 && t.length <= 36);

    $("img").each((_, img) => {
      totalImages += 1;
      const alt = $(img).attr("alt");
      if (!alt || !alt.trim()) imagesMissingAlt += 1;
    });

    $("a[href]").each((_, a) => {
      const rawHref = ($(a).attr("href") || "").trim();
      if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:")) return;
      try {
        const resolved = new URL(rawHref, target.origin);
        if (resolved.hostname === target.hostname) internalLinkCount += 1;
        else if (["http:", "https:"].includes(resolved.protocol)) externalLinkCount += 1;
      } catch {
        // Ignore malformed hrefs
      }
    });

    $('script[type="application/ld+json"]').each((_, el) => {
      const rawJson = $(el).contents().text().trim();
      if (!rawJson) return;
      try {
        const parsed = JSON.parse(rawJson) as unknown;
        const collectTypes = (node: unknown) => {
          if (!node || typeof node !== "object") return;
          if (Array.isArray(node)) {
            node.forEach(collectTypes);
            return;
          }
          const rec = node as Record<string, unknown>;
          if (typeof rec["@type"] === "string") schemaTypes.add(rec["@type"]);
          else if (Array.isArray(rec["@type"])) {
            rec["@type"].forEach((t) => typeof t === "string" && schemaTypes.add(t));
          }
          if (Array.isArray(rec["@graph"])) rec["@graph"].forEach(collectTypes);
        };
        collectTypes(parsed);
      } catch {
        // Ignore invalid JSON-LD
      }
    });

    const themeColorMeta = $('meta[name="theme-color"]').attr("content")?.trim() || "";
    const cssText = $("style").text().slice(0, 100_000);
    brandColors = extractSaturatedBrandColors(themeColorMeta, cssText);

    $("script, style, noscript").remove();
    wordCount = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean).length;
  }

  // Bug #5 Fix: Crawl up to 12 sitemap files and up to 500 discovered URLs (lifted 3-page limit)
  const sitemapQueue: string[] = [];
  if (hasRobotsTxt) {
    for (const match of robotsRes.text.matchAll(/^sitemap:\s*(\S+)/gim)) {
      if (match[1]) sitemapQueue.push(match[1].trim());
    }
  }
  if (sitemapQueue.length === 0) {
    sitemapQueue.push(`${target.origin}/sitemap.xml`);
  }

  const discoveredPages = new Map<string, { url: string; title: string }>();
  if (target.href) {
    discoveredPages.set(target.href, {
      url: target.href,
      title: h1Text || title || siteName,
    });
  }

  const visitedSitemaps = new Set<string>();
  while (
    sitemapQueue.length > 0 &&
    visitedSitemaps.size < 12 &&
    discoveredPages.size < 500
  ) {
    const nextSitemapUrl = sitemapQueue.shift()!;
    if (visitedSitemaps.has(nextSitemapUrl)) continue;
    visitedSitemaps.add(nextSitemapUrl);

    const xmlRes = await fetchEdgeSafeText(nextSitemapUrl, 6000);
    if (xmlRes.status !== 200 || !xmlRes.text) continue;
    const xml = load(xmlRes.text, { xmlMode: true });
    xml("sitemap > loc").each((_, el) => {
      const loc = xml(el).text().trim();
      if (loc && !visitedSitemaps.has(loc) && sitemapQueue.length < 20) {
        sitemapQueue.push(loc);
      }
    });
    xml("url > loc").each((_, el) => {
      if (discoveredPages.size >= 500) return;
      const loc = xml(el).text().trim();
      if (!loc || discoveredPages.has(loc)) return;
      try {
        const parsedLoc = new URL(loc);
        const slugPart =
          parsedLoc.pathname
            .split("/")
            .filter(Boolean)
            .pop()
            ?.replace(/[-_]/g, " ") || siteName;
        discoveredPages.set(loc, { url: loc, title: slugPart });
      } catch {
        // Ignore invalid sitemap URL
      }
    });
  }

  const titlePixelEstimate = Math.round(title.length * 9.4);
  const checks: SiteAuditCheckItem[] = [
    {
      id: "meta-title",
      category: "metadata",
      label: "Meta Title Length & Pixel Width (<580px)",
      status:
        title.length >= 30 && titlePixelEstimate <= 580
          ? "pass"
          : title.length > 0
            ? "warn"
            : "fail",
      value: title
        ? `${title.length} chars (~${titlePixelEstimate}px)`
        : "Missing <title>",
      recommendation:
        title.length === 0
          ? "Add a descriptive keyword-led <title> tag under 580px."
          : titlePixelEstimate > 580
            ? "Shorten your title below ~60 chars (580px) to prevent Google SERP truncation."
            : "Pixel width is clean and SERP-safe.",
      fixToolHref: "/tools/meta-title-generator",
      fixToolLabel: "Fix in Meta Title Generator",
    },
    {
      id: "meta-description",
      category: "metadata",
      label: "Meta Description Presence & Length (120–160 chars)",
      status:
        metaDescription.length >= 110 && metaDescription.length <= 165
          ? "pass"
          : metaDescription.length > 0
            ? "warn"
            : "fail",
      value: metaDescription
        ? `${metaDescription.length} chars`
        : "Missing meta description",
      recommendation:
        metaDescription.length === 0
          ? "Write a clear 140–158 character meta description summarizing page value."
          : "Keep meta descriptions between 120–160 characters for clean snippet display.",
      fixToolHref: "/tools/meta-description-generator",
      fixToolLabel: "Fix in Meta Description Tool",
    },
    {
      id: "h1-heading",
      category: "on-page",
      label: "Single Primary H1 Heading",
      status: h1Count === 1 ? "pass" : h1Count > 1 ? "warn" : "fail",
      value: h1Count === 1 ? `1 H1 ("${h1Text.slice(0, 52)}")` : `${h1Count} H1 tags found`,
      recommendation:
        h1Count === 1
          ? "Exactly one clear H1 heading detected."
          : "Ensure each page uses one primary H1 aligned with search intent.",
      fixToolHref: "/tools/h1-heading-generator",
      fixToolLabel: "Open H1 Heading Generator",
    },
    {
      id: "json-ld-schema",
      category: "schema",
      label: "Structured Data (@graph JSON-LD Schema)",
      status: schemaTypes.size > 0 ? "pass" : "warn",
      value:
        schemaTypes.size > 0
          ? Array.from(schemaTypes).join(", ")
          : "No JSON-LD detected",
      recommendation:
        schemaTypes.size > 0
          ? "JSON-LD structured data is active on the page."
          : "Add Organization, WebSite, or Article JSON-LD schema for richer search & AI citations.",
      fixToolHref: "/tools/schema-markup-generator",
      fixToolLabel: "Build JSON-LD Schema",
    },
    {
      id: "canonical-sitemap",
      category: "technical",
      label: "Canonical Tag, robots.txt & XML Sitemap",
      status:
        hasCanonical && discoveredPages.size > 1
          ? "pass"
          : hasCanonical || hasRobotsTxt
            ? "warn"
            : "fail",
      value: `${hasCanonical ? "Canonical OK" : "No Canonical"} · ${discoveredPages.size} URLs indexed`,
      recommendation:
        hasCanonical && discoveredPages.size > 1
          ? "Canonical tag and XML sitemap discovery are healthy."
          : "Verify self-referencing canonical tags and expose /sitemap.xml in robots.txt.",
      fixToolHref: "/tools/on-page-ai-seo-analyzer",
      fixToolLabel: "Run Deep On-Page Analyzer",
    },
    {
      id: "images-links",
      category: "links",
      label: "Internal Links & Image Alt Coverage",
      status:
        internalLinkCount >= 3 && imagesMissingAlt === 0
          ? "pass"
          : internalLinkCount >= 1
            ? "warn"
            : "fail",
      value: `${internalLinkCount} internal links · ${imagesMissingAlt}/${totalImages} missing alt`,
      recommendation:
        imagesMissingAlt > 0
          ? `Add descriptive alt text to ${imagesMissingAlt} image(s) for accessibility & image SEO.`
          : "Internal linking and image alt attributes look clean.",
      fixToolHref: "/tools/image-alt-text-generator",
      fixToolLabel: "Generate Image Alt Text",
    },
  ];

  const passPoints = checks.reduce(
    (sum, c) => sum + (c.status === "pass" ? 100 : c.status === "warn" ? 60 : 20),
    0,
  );
  const overallScore = Math.round(passPoints / checks.length);

  const snapshot: SiteAuditSnapshot = {
    auditedUrl: target.href,
    auditedAtIso: nowIso,
    overallScore,
    title,
    titleLength: title.length,
    titlePixelEstimate,
    metaDescription,
    metaDescriptionLength: metaDescription.length,
    h1Count,
    h1Text,
    h2Count,
    wordCount,
    internalLinkCount,
    externalLinkCount,
    imagesMissingAlt,
    totalImages,
    schemaTypes: Array.from(schemaTypes),
    hasCanonical,
    canonicalUrl,
    hasRobotsTxt,
    sitemapPageCount: discoveredPages.size,
    brandColors,
    checks,
  };

  const topicSeed = extractCleanTopicSeed({
    explicitNiche: input.niche,
    headings,
    metaDescription,
    navLabels,
    siteName,
  });

  const existingSlugs = Array.from(discoveredPages.values()).map((p) => {
    try {
      return new URL(p.url).pathname.split("/").filter(Boolean).pop() || "";
    } catch {
      return "";
    }
  });

  const seedKeywords = buildCleanStarterKeywords({
    siteId: "pending",
    topicSeed,
    existingSlugs,
  });

  return {
    siteName,
    normalizedUrl: target.href,
    brandColorHex: brandColors[0] || DEFAULT_BRAND_HEX,
    topicSeed,
    sitemapUrls: Array.from(discoveredPages.values()).slice(0, 250),
    snapshot,
    seedKeywords,
  };
}

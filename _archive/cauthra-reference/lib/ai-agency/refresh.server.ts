import { load } from "cheerio";
import {
  fetchPublic,
  publicUrl,
} from "@/features/backlink-verifier/fetch.server";
import { robotsAllows } from "@/features/internal-linking/server";

export type PageFields = {
  heading: string;
  title: string;
  description: string;
};

export type PageImageAudit = {
  src: string;
  alt: string;
  missingAlt: boolean;
  sizeKb: number | null;
  isWebpOrAvif: boolean;
  isOversized: boolean;
};

export type MetaHealthStatus = "ok" | "needs_fix";

export type PageCriteriaCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
  weight: number;
};

export type PageDiagnostics = {
  score: number;
  wordCount: number;
  h2Count: number;
  h3Count: number;
  h2List: string[];
  internalLinkCount: number;
  externalLinkCount: number;
  hasCanonical: boolean;
  hasSchemaJsonLd: boolean;
  schemaTypes: string[];
  criteriaChecks: PageCriteriaCheck[];
};

export function fieldFindings(fields: PageFields) {
  const findings: string[] = [];
  if (!fields.heading.trim()) findings.push("Missing H1");
  if (!fields.title.trim() || fields.title.length > 70)
    findings.push("Missing or long page title");
  if (!fields.description.trim() || fields.description.length > 170)
    findings.push("Missing or long meta description");
  return findings;
}

export function classifyPageMetaHealth(fields: PageFields): MetaHealthStatus {
  const headingOk = fields.heading.trim().length >= 3 && fields.heading.trim().length <= 120;
  const titleOk = fields.title.trim().length >= 10 && fields.title.trim().length <= 65;
  const descOk =
    fields.description.trim().length >= 50 && fields.description.trim().length <= 165;
  return headingOk && titleOk && descOk ? "ok" : "needs_fix";
}

export function repairFields(fields: PageFields, excerpt: string): PageFields {
  const trim = (value: string, max: number) =>
    value.trim().replace(/\s+/g, " ").slice(0, max).trimEnd();
  return {
    heading: trim(fields.heading || fields.title, 120),
    title: trim(fields.title || fields.heading, 70),
    description: trim(fields.description || excerpt, 170),
  };
}

export function evaluatePageDiagnostics(input: {
  fields: PageFields;
  h1Count: number;
  wordCount: number;
  h2Count: number;
  h3Count: number;
  h2List: string[];
  internalLinkCount: number;
  externalLinkCount: number;
  hasCanonical: boolean;
  hasSchemaJsonLd: boolean;
  schemaTypes: string[];
  images: PageImageAudit[];
}): PageDiagnostics {
  const h1Len = input.fields.heading.trim().length;
  const titleLen = input.fields.title.trim().length;
  const descLen = input.fields.description.trim().length;
  const missingAlt = input.images.filter((i) => i.missingAlt).length;
  const oversized = input.images.filter((i) => i.isOversized).length;

  const criteriaChecks: PageCriteriaCheck[] = [
    {
      id: "h1",
      label: "Primary H1 Heading",
      passed: input.h1Count === 1 && h1Len >= 10 && h1Len <= 90,
      detail:
        input.h1Count === 0
          ? "Missing H1 tag"
          : input.h1Count > 1
            ? `${input.h1Count} H1 tags detected (use exactly 1)`
            : `${h1Len} chars (ideal 10–90)`,
      weight: 15,
    },
    {
      id: "title",
      label: "SEO Title Length",
      passed: titleLen >= 25 && titleLen <= 60,
      detail: `${titleLen} chars (ideal 25–60 to avoid SERP truncation)`,
      weight: 15,
    },
    {
      id: "description",
      label: "Meta Description",
      passed: descLen >= 110 && descLen <= 160,
      detail:
        descLen === 0
          ? "Missing meta description"
          : `${descLen} chars (ideal 110–160)`,
      weight: 15,
    },
    {
      id: "headings",
      label: "Section Hierarchy (H2/H3)",
      passed: input.h2Count >= 2,
      detail: `${input.h2Count} H2s · ${input.h3Count} H3s (recommend ≥ 2 H2s)`,
      weight: 10,
    },
    {
      id: "internal_links",
      label: "Internal Linking",
      passed: input.internalLinkCount >= 3,
      detail: `${input.internalLinkCount} internal links · ${input.externalLinkCount} external`,
      weight: 15,
    },
    {
      id: "canonical",
      label: "Canonical Tag",
      passed: input.hasCanonical,
      detail: input.hasCanonical ? "Canonical link present" : "Missing rel=canonical",
      weight: 10,
    },
    {
      id: "schema",
      label: "Structured Data (JSON-LD)",
      passed: input.hasSchemaJsonLd,
      detail: input.hasSchemaJsonLd
        ? input.schemaTypes.length > 0
          ? `Detected: ${input.schemaTypes.slice(0, 3).join(", ")}`
          : "JSON-LD script detected"
        : "No JSON-LD schema detected",
      weight: 10,
    },
    {
      id: "media",
      label: "Image Alt-Text & Weight",
      passed: missingAlt === 0 && oversized === 0,
      detail:
        input.images.length === 0
          ? "No images detected"
          : `${input.images.length} images · ${missingAlt} missing alt · ${oversized} >200 KB`,
      weight: 10,
    },
  ];

  const score = criteriaChecks.reduce(
    (sum, c) => sum + (c.passed ? c.weight : 0),
    0,
  );

  return {
    score,
    wordCount: input.wordCount,
    h2Count: input.h2Count,
    h3Count: input.h3Count,
    h2List: input.h2List,
    internalLinkCount: input.internalLinkCount,
    externalLinkCount: input.externalLinkCount,
    hasCanonical: input.hasCanonical,
    hasSchemaJsonLd: input.hasSchemaJsonLd,
    schemaTypes: input.schemaTypes,
    criteriaChecks,
  };
}

async function probeImageSizeKb(imageUrl: string): Promise<number | null> {
  try {
    const res = await fetch(imageUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(2500),
      headers: {
        "User-Agent": "DoItWithAI-TechnicalAudit/6.0 (+https://doitwithai.tools)",
      },
    });
    if (!res.ok) return null;
    const len = res.headers.get("content-length");
    if (!len) return null;
    const bytes = Number(len);
    return Number.isFinite(bytes) && bytes > 0 ? Math.round(bytes / 1024) : null;
  } catch {
    return null;
  }
}

export async function inspectPage(raw: string, domain: string) {
  const target = publicUrl(raw);
  const origin = new URL(domain).origin;
  let policy = "";
  const beforeRequest = async (url: URL) => {
    if (url.origin !== origin || !robotsAllows(policy, url.href))
      throw Error("Outside crawl scope");
  };
  const signal = AbortSignal.timeout(12000);
  const robots = await fetchPublic(origin + "/robots.txt", {
    signal,
    beforeRequest,
    text: true,
    maxDecodedBytes: 128000,
  });
  if (![200, 404, 410].includes(robots.status))
    throw Error("Robots policy unavailable");
  if (robots.status === 200) policy = robots.html;
  const page = await fetchPublic(target.href, {
    signal,
    beforeRequest,
    maxDecodedBytes: 512000,
  });
  if (page.status !== 200)
    return {
      url: target.href,
      status: page.status,
      fields: null,
      metaHealth: "needs_fix" as MetaHealthStatus,
      images: [] as PageImageAudit[],
      findings: ["HTTP " + page.status],
      diagnostics: null as PageDiagnostics | null,
    };

  const $ = load(page.html);
  const fields: PageFields = {
    heading: $("h1").first().text().trim(),
    title: $("title").first().text().trim(),
    description:
      $('meta[name="description" i]').first().attr("content")?.trim() || "",
  };
  const h1Count = $("h1").length;
  const hasCanonical = $('link[rel="canonical"]').length > 0;
  const findings = fieldFindings(fields);
  if (h1Count > 1) findings.push("Multiple H1 elements");
  if (!hasCanonical) findings.push("Missing canonical link");

  // Extract structural headings, word count, internal/external links, and JSON-LD schema (Zero-LLM)
  const h2List: string[] = [];
  $("h2").each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, " ");
    if (text && h2List.length < 10) h2List.push(text.slice(0, 120));
  });
  const h2Count = $("h2").length;
  const h3Count = $("h3").length;

  let internalLinkCount = 0;
  let externalLinkCount = 0;
  $("a[href]").each((_, el) => {
    const href = ($(el).attr("href") || "").trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    try {
      const resolved = new URL(href, target.href);
      if (resolved.origin === origin) internalLinkCount += 1;
      else if (/^https?:$/.test(resolved.protocol)) externalLinkCount += 1;
    } catch {
      // ignore malformed href
    }
  });

  const schemaTypes: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const rawJson = $(el).text().trim();
    if (!rawJson) return;
    try {
      const parsed = JSON.parse(rawJson) as { "@type"?: unknown; "@graph"?: Array<{ "@type"?: unknown }> };
      if (typeof parsed["@type"] === "string") schemaTypes.push(parsed["@type"]);
      if (Array.isArray(parsed["@graph"])) {
        for (const node of parsed["@graph"]) {
          if (typeof node?.["@type"] === "string") schemaTypes.push(node["@type"]);
        }
      }
    } catch {
      // ignore invalid JSON-LD block
    }
  });
  const hasSchemaJsonLd = $('script[type="application/ld+json"]').length > 0;

  const bodyClone = $("body").clone();
  bodyClone.find("script,style,noscript,svg,nav,footer").remove();
  const visibleText = bodyClone.text().replace(/\s+/g, " ").trim();
  const wordCount = visibleText ? visibleText.split(" ").filter(Boolean).length : 0;

  // Zero-LLM Media & Alt-Text Audit (up to 12 images per page, bounded HEAD size probes)
  const rawImages: Array<{ src: string; alt: string }> = [];
  const seenSrc = new Set<string>();
  $("img").each((_, el) => {
    if (rawImages.length >= 12) return;
    const rawSrc = ($(el).attr("src") || $(el).attr("data-src") || "").trim();
    if (!rawSrc || rawSrc.startsWith("data:")) return;
    try {
      const absUrl = new URL(rawSrc, target.href).href;
      if (!/^https?:\/\//i.test(absUrl) || seenSrc.has(absUrl)) return;
      seenSrc.add(absUrl);
      rawImages.push({ src: absUrl, alt: ($(el).attr("alt") || "").trim() });
    } catch {
      // Skip malformed image src
    }
  });

  const images: PageImageAudit[] = await Promise.all(
    rawImages.map(async (img, idx) => {
      const isWebpOrAvif = /\.(webp|avif|svg)(\?|$)/i.test(img.src);
      const sizeKb = idx < 6 ? await probeImageSizeKb(img.src) : null;
      const isOversized = sizeKb !== null && sizeKb > 200;
      return {
        src: img.src,
        alt: img.alt,
        missingAlt: img.alt.length < 3,
        sizeKb,
        isWebpOrAvif,
        isOversized,
      };
    }),
  );

  const missingAltCount = images.filter((i) => i.missingAlt).length;
  const oversizedCount = images.filter((i) => i.isOversized).length;
  if (missingAltCount > 0) {
    findings.push(`${missingAltCount} image(s) missing alt text`);
  }
  if (oversizedCount > 0) {
    findings.push(`${oversizedCount} oversized image(s) (>200 KB)`);
  }

  const diagnostics = evaluatePageDiagnostics({
    fields,
    h1Count,
    wordCount,
    h2Count,
    h3Count,
    h2List,
    internalLinkCount,
    externalLinkCount,
    hasCanonical,
    hasSchemaJsonLd,
    schemaTypes: Array.from(new Set(schemaTypes)),
    images,
  });

  // V6 Phase 2: Never return fake string-sliced `suggested` fields on passive page inspection.
  // Real optimization diffs are generated strictly on demand via /api/ai-employee-agency/optimize-page.
  return {
    url: target.href,
    status: page.status,
    fields,
    metaHealth: classifyPageMetaHealth(fields),
    images,
    findings,
    diagnostics,
  };
}

export async function inspectCrawlFiles(domain: string) {
  const origin = publicUrl(domain).origin;
  const signal = AbortSignal.timeout(12000);
  let policy = "";
  const beforeRequest = async (url: URL) => {
    if (url.origin !== origin || !robotsAllows(policy, url.href))
      throw Error("Outside crawl scope");
  };
  const robotsUrl = origin + "/robots.txt";
  const robots = await fetchPublic(robotsUrl, {
    signal,
    beforeRequest,
    text: true,
    maxDecodedBytes: 128000,
  }).catch(() => null);
  const files = [{ url: robotsUrl, status: robots?.status ?? null }];
  if (!robots || ![200, 404, 410].includes(robots.status)) return files;
  if (robots.status === 200) policy = robots.html;
  const declared = policy.match(/^sitemap:\s*(\S+)/im)?.[1];
  const urls = [declared || origin + "/sitemap.xml", origin + "/llms.txt"];
  files.push(
    ...(await Promise.all(
      urls.map(async (url) => {
        const page = await fetchPublic(url, {
          signal,
          beforeRequest,
          html: false,
        }).catch(() => null);
        return { url, status: page?.status ?? null };
      }),
    )),
  );
  return files;
}

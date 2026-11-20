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

async function probeImageSizeKb(imageUrl: string): Promise<number | null> {
  try {
    const res = await fetch(imageUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(2500),
      headers: {
        "User-Agent": "DoItWithAI-TechnicalAudit/5.0 (+https://doitwithai.tools)",
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
    };
  const $ = load(page.html);
  const fields: PageFields = {
    heading: $("h1").first().text().trim(),
    title: $("title").first().text().trim(),
    description:
      $('meta[name="description" i]').first().attr("content")?.trim() || "",
  };
  const findings = fieldFindings(fields);
  if ($("h1").length > 1) findings.push("Multiple H1 elements");
  if (!$('link[rel="canonical"]').length)
    findings.push("Missing canonical link");

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

  return {
    url: target.href,
    status: page.status,
    fields,
    metaHealth: classifyPageMetaHealth(fields),
    images,
    findings,
    suggested: repairFields(
      fields,
      $("main p,article p,body p").first().text(),
    ),
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

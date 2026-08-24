import { load } from "cheerio";
import { SITE_ASSISTANT_BASE_URL, siteProfileAsMarkdown } from "../config";
import type { KnowledgeDocument } from "../types";

const ESSENTIAL_PATHS = [
  "/",
  "/about",
  "/contact",
  "/faq",
  "/author/sufian-mustafa",
  "/ai-seo",
  "/ai-tools",
  "/ai-code",
  "/ai-learn-earn",
  "/free-ai-resources",
  "/blogs",
];

const EXCLUDED_PATHS = [
  "/api/",
  "/test",
  "/studio",
  "/image-sitemap.xml",
  "/sitemap.xml",
  "/ai-seo/opengraph-image",
];

const MAX_RESPONSE_BYTES = 2_500_000;

function cleanWhitespace(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export function isApprovedKnowledgeUrl(
  rawUrl: string,
  baseUrl = SITE_ASSISTANT_BASE_URL,
) {
  try {
    const candidate = new URL(rawUrl, baseUrl);
    const base = new URL(baseUrl);
    if (candidate.protocol !== "https:" && candidate.protocol !== "http:") {
      return false;
    }
    if (
      candidate.hostname !== base.hostname &&
      candidate.hostname !== `www.${base.hostname}`
    ) {
      return false;
    }
    if (EXCLUDED_PATHS.some((path) => candidate.pathname.startsWith(path))) {
      return false;
    }
    return !/\.(?:xml|json|png|jpe?g|gif|webp|svg|pdf|zip)$/i.test(
      candidate.pathname,
    );
  } catch {
    return false;
  }
}

function normalizeUrl(rawUrl: string, baseUrl = SITE_ASSISTANT_BASE_URL) {
  const url = new URL(rawUrl, baseUrl);
  url.hash = "";
  url.search = "";
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString();
}

async function fetchSiteResource(rawUrl: string, baseUrl: string) {
  let current = new URL(rawUrl, baseUrl);
  const allowSitemap = current.pathname === "/sitemap.xml";
  for (let redirect = 0; redirect <= 3; redirect += 1) {
    const base = new URL(baseUrl);
    const sitemapAllowed =
      allowSitemap &&
      current.pathname === "/sitemap.xml" &&
      (current.hostname === base.hostname ||
        current.hostname === `www.${base.hostname}`);
    if (
      !sitemapAllowed &&
      !isApprovedKnowledgeUrl(current.toString(), baseUrl)
    ) {
      throw new Error(`Knowledge sync rejected URL: ${current.toString()}`);
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    let response: Response;
    try {
      response = await fetch(current, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "DoItWithAI-SiteAssistantSync/1.0 (+https://doitwithai.tools)",
          Accept: "text/html, application/xml;q=0.9, text/xml;q=0.9",
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirect === 3) {
        throw new Error(`Too many redirects while fetching ${rawUrl}`);
      }
      current = new URL(location, current);
      continue;
    }
    if (!response.ok) {
      throw new Error(
        `Page returned ${response.status}: ${current.toString()}`,
      );
    }
    const declaredSize = Number(response.headers.get("content-length") || 0);
    if (declaredSize > MAX_RESPONSE_BYTES) {
      throw new Error(`Page is too large to index: ${current.toString()}`);
    }
    const text = await response.text();
    if (Buffer.byteLength(text, "utf8") > MAX_RESPONSE_BYTES) {
      throw new Error(`Page is too large to index: ${current.toString()}`);
    }
    return {
      text,
      finalUrl: current.toString(),
      contentType: response.headers.get("content-type") || "",
    };
  }
  throw new Error(`Could not fetch ${rawUrl}`);
}

function kindForPath(pathname: string) {
  if (pathname === "/") return "homepage";
  if (pathname.startsWith("/ai-seo/")) {
    return pathname.endsWith("generator") ? "seo-tool" : "ai-seo-article";
  }
  if (pathname.startsWith("/ai-tools/")) return "ai-tool-review";
  if (pathname.startsWith("/ai-code/")) return "coding-guide";
  if (pathname.startsWith("/ai-learn-earn/")) return "learning-guide";
  if (pathname.startsWith("/free-ai-resources/")) return "free-resource";
  if (pathname.startsWith("/author/")) return "author-profile";
  return "site-page";
}

export function extractPageKnowledge(
  html: string,
  pageUrl: string,
): KnowledgeDocument {
  const $ = load(html);
  const canonical = $("link[rel='canonical']").attr("href");
  const resolvedUrl = normalizeUrl(canonical || pageUrl, pageUrl);
  const title = cleanWhitespace(
    $("h1").first().text() ||
      $("meta[property='og:title']").attr("content") ||
      $("title").text() ||
      new URL(resolvedUrl).pathname,
  );
  const description = cleanWhitespace(
    $("meta[name='description']").attr("content") ||
      $("meta[property='og:description']").attr("content") ||
      "",
  );
  const updatedAt =
    $("meta[property='article:modified_time']").attr("content") ||
    $("time[datetime]").first().attr("datetime") ||
    undefined;

  const root = $("main").first().length
    ? $("main").first().clone()
    : $("body").clone();
  root
    .find(
      "script, style, noscript, nav, footer, header, form, button, input, textarea, select, svg, canvas, iframe, [aria-hidden='true'], .sr-only",
    )
    .remove();

  const lines: string[] = [];
  const selectors = "h1,h2,h3,h4,p,li,blockquote,pre,dt,dd,th,td,figcaption";
  root.find(selectors).each((_, element) => {
    const node = $(element);
    if (node.parents(selectors).length > 0) return;
    const text = cleanWhitespace(node.text());
    if (!text || text.length < 2) return;
    const tag = element.tagName.toLowerCase();
    const prefix =
      tag === "h1"
        ? "# "
        : tag === "h2"
          ? "## "
          : tag === "h3"
            ? "### "
            : tag === "h4"
              ? "#### "
              : tag === "li"
                ? "- "
                : tag === "blockquote"
                  ? "> "
                  : "";
    lines.push(`${prefix}${text}`);
  });

  root.find("img[alt]").each((_, element) => {
    const alt = cleanWhitespace($(element).attr("alt") || "");
    if (alt.length >= 12) lines.push(`[Image description] ${alt}`);
  });

  const uniqueLines = lines.filter(
    (line, index) => index === 0 || line !== lines[index - 1],
  );
  const content = uniqueLines.join("\n\n").slice(0, 180_000);

  return {
    title: title || "Do It With AI Tools page",
    url: resolvedUrl,
    kind: kindForPath(new URL(resolvedUrl).pathname),
    description,
    content,
    updatedAt,
  };
}

export function knowledgeDocumentAsMarkdown(document: KnowledgeDocument) {
  return `# ${document.title}\n\nURL: ${document.url}\nContent type: ${document.kind}\n${document.updatedAt ? `Last updated: ${document.updatedAt}\n` : ""}${document.description ? `Summary: ${document.description}\n` : ""}\n## Page content\n\n${document.content}\n`;
}

export async function discoverKnowledgeUrls(
  baseUrl = process.env.SITE_ASSISTANT_BASE_URL || SITE_ASSISTANT_BASE_URL,
) {
  const urls = new Set(
    ESSENTIAL_PATHS.map((path) => normalizeUrl(path, baseUrl)),
  );
  try {
    const sitemapUrl = new URL("/sitemap.xml", baseUrl).toString();
    const sitemap = await fetchSiteResource(sitemapUrl, baseUrl);
    const $ = load(sitemap.text, { xmlMode: true });
    $("url > loc").each((_, element) => {
      const candidate = cleanWhitespace($(element).text());
      if (candidate && isApprovedKnowledgeUrl(candidate, baseUrl)) {
        urls.add(normalizeUrl(candidate, baseUrl));
      }
    });
  } catch (error) {
    console.warn(
      "Site assistant sitemap discovery used essential-page fallback",
      error,
    );
  }

  const maxPages = Math.max(
    1,
    Math.min(250, Number(process.env.SITE_ASSISTANT_MAX_PAGES || 100)),
  );
  return [...urls].slice(0, maxPages);
}

export async function crawlKnowledgeUrl(
  url: string,
  baseUrl = process.env.SITE_ASSISTANT_BASE_URL || SITE_ASSISTANT_BASE_URL,
) {
  if (!isApprovedKnowledgeUrl(url, baseUrl)) {
    throw new Error(`URL is outside the assistant knowledge scope: ${url}`);
  }
  const result = await fetchSiteResource(url, baseUrl);
  if (!result.contentType.includes("text/html")) {
    throw new Error(`Only HTML pages can be indexed: ${url}`);
  }
  const document = extractPageKnowledge(result.text, result.finalUrl);
  if (document.content.length < 120) {
    throw new Error(`Page did not expose enough readable content: ${url}`);
  }
  return document;
}

export async function buildKnowledgeDocuments(
  baseUrl = process.env.SITE_ASSISTANT_BASE_URL || SITE_ASSISTANT_BASE_URL,
) {
  const urls = await discoverKnowledgeUrls(baseUrl);
  const documents: KnowledgeDocument[] = [
    {
      title: "Verified Do It With AI Tools site profile",
      url: normalizeUrl("/about", baseUrl),
      kind: "verified-site-profile",
      description:
        "Curated public facts covering the platform, contact methods, founder, technology, and official social channels.",
      content: siteProfileAsMarkdown(),
    },
  ];

  const concurrency = 4;
  for (let index = 0; index < urls.length; index += concurrency) {
    const batch = urls.slice(index, index + concurrency);
    const results = await Promise.allSettled(
      batch.map((url) => crawlKnowledgeUrl(url, baseUrl)),
    );
    results.forEach((result, batchIndex) => {
      if (result.status === "fulfilled") documents.push(result.value);
      else
        console.warn(
          `Skipped knowledge page ${batch[batchIndex]}`,
          result.reason,
        );
    });
  }

  return documents;
}

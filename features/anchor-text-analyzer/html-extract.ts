import { load } from "cheerio";
import { getDomain } from "tldts";
import {
  classifyAnchor,
  inferFollowStatus,
  normalizeText,
} from "./analyze";
import type { AnchorRow, PlacementZone } from "./types";

const clean = (s: string, max = 260) =>
  s.replace(/\s+/g, " ").trim().slice(0, max);

const rootDomain = (rawUrl: string) => {
  try {
    const u = new URL(rawUrl);
    return (
      getDomain(u.hostname, { allowPrivateDomains: true }) ||
      u.hostname.replace(/^www\./i, "").toLowerCase()
    );
  } catch {
    return rawUrl
      .toLowerCase()
      .replace(/^https?:\/\/|^www\./g, "")
      .split("/")[0];
  }
};

export function extractAnchorsFromHtml(params: {
  html: string;
  sourceUrl: string;
  targetDomain: string;
  brandTerms: string[];
  targetKeywords: string[];
  scope: "all-links" | "external-only" | "target-domain-only";
}): { rows: AnchorRow[]; pageTitle: string } {
  const $ = load(params.html);
  $("script,style,noscript,template").remove();
  const pageTitle = clean($("title").first().text(), 180);

  let baseOrigin = "https://example.com";
  try {
    baseOrigin = new URL(params.sourceUrl).href;
  } catch {
    baseOrigin = "https://example.com";
  }
  const sourceDomain = rootDomain(baseOrigin);
  const cleanTargetDomain = rootDomain(
    params.targetDomain.startsWith("http")
      ? params.targetDomain
      : `https://${params.targetDomain}`,
  );

  const rows: AnchorRow[] = [];
  let counter = 0;

  $("a[href]").each((_, el) => {
    if (rows.length >= 600) return;
    const node = $(el);
    const rawHref = node.attr("href")?.trim();
    if (
      !rawHref ||
      rawHref.startsWith("#") ||
      /^(javascript:|mailto:|tel:)/i.test(rawHref)
    ) {
      return;
    }

    let resolvedHref = rawHref;
    try {
      resolvedHref = new URL(rawHref, baseOrigin).href;
    } catch {
      return;
    }

    const linkDomain = rootDomain(resolvedHref);
    const isInternal = Boolean(sourceDomain && linkDomain === sourceDomain);

    if (params.scope === "external-only" && isInternal) return;
    if (
      params.scope === "target-domain-only" &&
      cleanTargetDomain &&
      linkDomain !== cleanTargetDomain &&
      !linkDomain.endsWith(`.${cleanTargetDomain}`)
    ) {
      return;
    }

    const visibleText = clean(node.text(), 200);
    const imgAlt = clean(node.find("img").first().attr("alt") || "", 180);
    const isImageLink = !visibleText && node.find("img").length > 0;
    const anchorText = visibleText
      ? visibleText
      : isImageLink
        ? imgAlt
          ? `[Image: ${imgAlt}]`
          : "[Empty anchor]"
        : clean(node.attr("aria-label") || node.attr("title") || "", 180) ||
          "[Empty anchor]";

    let zone: PlacementZone = "editorial-body";
    if (node.closest("nav,header,[role='navigation']").length > 0) {
      zone = "navigation";
    } else if (node.closest("footer,[role='contentinfo']").length > 0) {
      zone = "footer";
    } else if (node.closest("aside,[class*='sidebar']").length > 0) {
      zone = "sidebar";
    } else if (
      node.closest("[class*='author'],[class*='bio'],[rel='author']").length > 0
    ) {
      zone = "author-bio";
    }

    const relTokens = (node.attr("rel") || "")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const classified = classifyAnchor({
      anchorText,
      isImageLink,
      targetDomain: params.targetDomain || linkDomain,
      brandTerms: params.brandTerms,
      targetKeywords: params.targetKeywords,
    });

    counter++;
    rows.push({
      id: `live-${counter}`,
      sourceUrl: params.sourceUrl,
      targetUrl: resolvedHref,
      anchorText,
      normalizedAnchor: normalizeText(anchorText) || "[empty anchor]",
      category: classified.category,
      matchedKeyword: classified.matchedKeyword,
      followStatus: inferFollowStatus(relTokens),
      relTokens,
      zone,
      isInternal,
      isImageLink,
      contextSnippet:
        clean(
          node.closest("p,li,blockquote,td,dd,section,div").text() ||
            node.parent().text(),
          240,
        ) || anchorText,
    });
  });

  return { rows, pageTitle };
}

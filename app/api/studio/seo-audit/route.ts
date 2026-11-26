import { NextResponse } from "next/server";
import { load } from "cheerio";
import { z } from "zod";
import {
  checkStudioRateLimit,
  generateStudioStructured,
  isStudioAiConfigured,
} from "@/lib/studio/studio-llm-gateway.server";
import {
  fetchEdgeSafeText,
  normalizeSiteUrl,
} from "@/lib/studio/site-snapshot.server";
import type {
  ExistingPageOptimizationPlan,
  OnPageRubricCategoryScore,
} from "@/lib/studio/types";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

const onPageAiPatchSchema = z.object({
  currentKeyword: z.string().min(2).max(90),
  coverageStatus: z.enum([
    "covered",
    "under-optimized",
    "missing",
    "cannibalization-risk",
  ]),
  recommendedTitle: z.string().min(20).max(65),
  recommendedMetaDescription: z.string().min(90).max(162),
  recommendedH1: z.string().min(10).max(95),
  quickAnswer50Words: z.string().min(30).max(380),
  missingSubtopics: z.array(z.string().min(4).max(110)).min(3).max(6),
  recommendedFaqs: z
    .array(
      z.object({
        question: z.string().min(8).max(160),
        answer: z.string().min(20).max(360),
      }),
    )
    .min(2)
    .max(4),
});

const offPageAiPlanSchema = z.object({
  linkableAssets: z
    .array(
      z.object({
        title: z.string().min(8).max(120),
        assetFormat: z.string().min(4).max(60),
        whyJournalistsAndBlogsLink: z.string().min(20).max(260),
        targetLinkerPersona: z.string().min(5).max(120),
      }),
    )
    .min(3)
    .max(4),
  competitorGapAngles: z.array(z.string().min(12).max(200)).min(3).max(5),
  outreachTemplates: z
    .array(
      z.object({
        scenario: z.string().min(5).max(90),
        subjectLine: z.string().min(8).max(110),
        bodyTemplate: z.string().min(60).max(900),
      }),
    )
    .min(2)
    .max(3),
});

function inferPageType(
  urlObj: URL,
  wordCount: number,
): ExistingPageOptimizationPlan["pageType"] {
  const path = urlObj.pathname.toLowerCase();
  if (path === "/" || path === "") return "homepage";
  if (/\/(?:tools|calculators|generators)(?:\/|$)/.test(path)) return "tool";
  if (/\/(?:services|solutions|pricing|enterprise)(?:\/|$)/.test(path))
    return "service";
  if (
    /\/(?:blog|blogs|articles|guides|ai-seo|prompts|learn|news)(?:\/|$)/.test(
      path,
    ) ||
    wordCount >= 900
  ) {
    return "blog";
  }
  return "landing";
}

export async function POST(request: Request) {
  try {
    const limit = await checkStudioRateLimit(request, "studio-seo-audit", {
      dailyLimit: 120,
      burstLimit: 18,
    });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Audit rate limit reached. Please retry in a moment." },
        { status: 429 },
      );
    }

    const raw = (await request.json()) as Record<string, unknown>;
    const mode = String(raw.mode || "on-page");

    /* ========================================================================
     * MODE 1: 100-POINT OBJECTIVE ON-PAGE SEO RUBRIC + PAGE-TYPE SAFE AI PATCH
     * ====================================================================== */
    if (mode === "on-page") {
      const pageUrlRaw = String(raw.url || "").trim();
      if (!pageUrlRaw) {
        return NextResponse.json(
          { error: "Provide a page URL to audit." },
          { status: 400 },
        );
      }
      const siteId = String(raw.siteId || "studio-site");
      const explicitKeyword = String(raw.targetKeyword || "")
        .trim()
        .toLowerCase();

      const target = normalizeSiteUrl(pageUrlRaw);
      const pageRes = await fetchEdgeSafeText(target.href, 9500);
      if (pageRes.status < 200 || pageRes.status >= 400 || !pageRes.text) {
        return NextResponse.json(
          {
            error: `Unable to fetch live HTML from ${target.href} (HTTP ${pageRes.status || "timeout"}).`,
          },
          { status: 400 },
        );
      }

      const $ = load(pageRes.text);
      const title = $("title").first().text().replace(/\s+/g, " ").trim();
      const metaDescription =
        $('meta[name="description"]').attr("content")?.trim() ||
        $('meta[property="og:description"]').attr("content")?.trim() ||
        "";
      const canonicalUrl = $('link[rel="canonical"]').attr("href")?.trim() || "";
      const hasCanonical = Boolean(canonicalUrl);

      const h1Nodes = $("h1");
      const h1Count = h1Nodes.length;
      const currentH1 = h1Nodes.first().text().replace(/\s+/g, " ").trim();
      const h2Headings = $("h2")
        .slice(0, 16)
        .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
        .get()
        .filter(Boolean);

      let totalImages = 0;
      let imagesMissingAlt = 0;
      $("img").each((_, img) => {
        totalImages += 1;
        if (!($(img).attr("alt") || "").trim()) imagesMissingAlt += 1;
      });

      let internalLinksCount = 0;
      let externalLinksCount = 0;
      $("a[href]").each((_, a) => {
        const href = ($(a).attr("href") || "").trim();
        if (!href || href.startsWith("#") || href.startsWith("javascript:"))
          return;
        try {
          const resolved = new URL(href, target.origin);
          if (resolved.hostname === target.hostname) internalLinksCount += 1;
          else if (["http:", "https:"].includes(resolved.protocol))
            externalLinksCount += 1;
        } catch {
          // ignore
        }
      });

      const schemaTypes = new Set<string>();
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const parsed = JSON.parse($(el).contents().text().trim()) as unknown;
          const walk = (n: unknown) => {
            if (!n || typeof n !== "object") return;
            if (Array.isArray(n)) return n.forEach(walk);
            const r = n as Record<string, unknown>;
            if (typeof r["@type"] === "string") schemaTypes.add(r["@type"]);
            if (Array.isArray(r["@graph"])) r["@graph"].forEach(walk);
          };
          walk(parsed);
        } catch {
          // ignore
        }
      });

      $("script, style, noscript, svg").remove();
      const bodyText = $("body").text().replace(/\s+/g, " ").trim();
      const words = bodyText.split(" ").filter(Boolean);
      const wordCount = words.length;
      const first100Words = words.slice(0, 100).join(" ").toLowerCase();
      const pageType = inferPageType(target, wordCount);

      const inferredKeyword =
        explicitKeyword ||
        (currentH1 || title)
          .split(/[|–—:-]/)[0]
          ?.replace(/[^\w\s]/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase()
          .split(" ")
          .slice(0, 5)
          .join(" ") ||
        target.hostname;

      // Objective 100-Point On-Page Rubric
      // 1. Meta Title & Description CTR (20 pts)
      let metaScore = 0;
      const metaFindings: string[] = [];
      if (title.length >= 42 && title.length <= 62) {
        metaScore += 10;
        metaFindings.push(`Title length (${title.length} chars) fits SERP window.`);
      } else if (title.length > 0) {
        metaScore += 5;
        metaFindings.push(
          `Title is ${title.length} chars (aim for 48–60 chars to maximize CTR without truncation).`,
        );
      } else {
        metaFindings.push("Missing <title> tag.");
      }

      if (metaDescription.length >= 125 && metaDescription.length <= 162) {
        metaScore += 10;
        metaFindings.push(
          `Meta description (${metaDescription.length} chars) is clean and snippet-ready.`,
        );
      } else if (metaDescription.length > 0) {
        metaScore += 5;
        metaFindings.push(
          `Meta description is ${metaDescription.length} chars (aim for 135–158 chars).`,
        );
      } else {
        metaFindings.push("Missing meta description.");
      }

      // 2. Slug URL & Canonical Hygiene (10 pts)
      const slugWords =
        target.pathname === "/"
          ? 1
          : (target.pathname.split("/").filter(Boolean).pop() || "")
              .split(/[-_]/)
              .filter(Boolean).length;
      let slugScore = 0;
      const slugFindings: string[] = [];
      if (slugWords <= 6) {
        slugScore += 5;
        slugFindings.push("URL slug is concise and readable.");
      } else {
        slugScore += 2;
        slugFindings.push(`Slug contains ${slugWords} words (keep <= 5–6 words).`);
      }
      if (hasCanonical) {
        slugScore += 5;
        slugFindings.push("Canonical tag detected.");
      } else {
        slugFindings.push("Missing <link rel='canonical'> tag.");
      }

      // 3. Heading Hierarchy & Page-Type Fit (15 pts)
      let headingScore = 0;
      const headingFindings: string[] = [];
      if (h1Count === 1) {
        headingScore += 9;
        headingFindings.push("Single clear H1 heading present.");
      } else {
        headingScore += h1Count > 1 ? 4 : 0;
        headingFindings.push(
          h1Count === 0
            ? "No H1 heading found."
            : `${h1Count} H1 tags found (use exactly 1 primary H1).`,
        );
      }
      if (h2Headings.length >= 2) {
        headingScore += 6;
        headingFindings.push(`${h2Headings.length} H2 section headings structure the page.`);
      } else {
        headingScore += 2;
        headingFindings.push("Add clear H2 subheadings to improve scannability.");
      }

      // 4. Keyword Placement & Natural Salience (15 pts)
      const kwTokens = inferredKeyword
        .split(" ")
        .filter((w) => w.length > 3);
      const kwInTitle = kwTokens.some((t) => title.toLowerCase().includes(t));
      const kwInH1 = kwTokens.some((t) => currentH1.toLowerCase().includes(t));
      const kwInIntro = kwTokens.some((t) => first100Words.includes(t));
      const kwScore = (kwInTitle ? 5 : 1) + (kwInH1 ? 5 : 1) + (kwInIntro ? 5 : 1);
      const kwFindings = [
        kwInTitle
          ? "Primary topic terms appear in <title>."
          : "Include primary keyword near the front of <title>.",
        kwInH1
          ? "Primary topic aligns with H1."
          : "Align H1 more closely with primary search query.",
        kwInIntro
          ? "Primary topic appears within the opening 100 words."
          : "Introduce the core topic within the first 100 words.",
      ];

      // 5. Internal & External Authority Links (15 pts)
      let linkScore = 0;
      const linkFindings: string[] = [];
      if (internalLinksCount >= 3) {
        linkScore += 10;
        linkFindings.push(`${internalLinksCount} internal links connect related pages.`);
      } else {
        linkScore += internalLinksCount > 0 ? 5 : 0;
        linkFindings.push(
          `Only ${internalLinksCount} internal link(s) found (add at least 3 contextual internal links).`,
        );
      }
      if (externalLinksCount >= 1 || pageType === "homepage" || pageType === "service") {
        linkScore += 5;
        linkFindings.push(
          pageType === "blog"
            ? `${externalLinksCount} external reference link(s) detected.`
            : `Conversion/Core page type (${pageType}) link balance verified.`,
        );
      } else {
        linkScore += 2;
        linkFindings.push("Cite 1–2 authoritative primary sources to strengthen E-E-A-T.");
      }

      // 6. Schema Markup & AI Overview (GEO) Readiness (15 pts)
      let schemaScore = 0;
      const schemaFindings: string[] = [];
      if (schemaTypes.size > 0) {
        schemaScore += 10;
        schemaFindings.push(`Active JSON-LD types: ${Array.from(schemaTypes).join(", ")}.`);
      } else {
        schemaFindings.push("No JSON-LD structured data detected on this URL.");
      }
      if (wordCount >= 180) {
        schemaScore += 5;
        schemaFindings.push("Sufficient crawlable copy for passage extraction.");
      } else {
        schemaScore += 2;
        schemaFindings.push("Thin visible copy (<180 words) limits AI citation readiness.");
      }

      // 7. Media & Alt Text Hygiene (10 pts)
      let mediaScore = 10;
      const mediaFindings: string[] = [];
      if (totalImages === 0) {
        mediaScore = 6;
        mediaFindings.push("No <img> elements detected (consider adding an explanatory diagram or visual).");
      } else if (imagesMissingAlt === 0) {
        mediaScore = 10;
        mediaFindings.push(`All ${totalImages} image(s) include descriptive alt attributes.`);
      } else {
        mediaScore = Math.max(3, 10 - imagesMissingAlt * 2);
        mediaFindings.push(`${imagesMissingAlt} of ${totalImages} image(s) are missing alt text.`);
      }

      const rubricCategories: OnPageRubricCategoryScore[] = [
        {
          id: "meta",
          label: "Meta Title & Description CTR",
          score: metaScore,
          maxScore: 20,
          status: metaScore >= 17 ? "strong" : metaScore >= 12 ? "polish" : "fix",
          findings: metaFindings,
        },
        {
          id: "slug",
          label: "Slug URL & Canonical Hygiene",
          score: slugScore,
          maxScore: 10,
          status: slugScore >= 8 ? "strong" : slugScore >= 5 ? "polish" : "fix",
          findings: slugFindings,
        },
        {
          id: "headings",
          label: "Heading Hierarchy & Page-Type Fit",
          score: headingScore,
          maxScore: 15,
          status:
            headingScore >= 13 ? "strong" : headingScore >= 9 ? "polish" : "fix",
          findings: headingFindings,
        },
        {
          id: "keywords",
          label: "Keyword Placement & Salience",
          score: kwScore,
          maxScore: 15,
          status: kwScore >= 13 ? "strong" : kwScore >= 9 ? "polish" : "fix",
          findings: kwFindings,
        },
        {
          id: "links",
          label: "Internal & Authority External Links",
          score: linkScore,
          maxScore: 15,
          status: linkScore >= 13 ? "strong" : linkScore >= 8 ? "polish" : "fix",
          findings: linkFindings,
        },
        {
          id: "schema",
          label: "Schema Markup & GEO Readiness",
          score: schemaScore,
          maxScore: 15,
          status:
            schemaScore >= 12 ? "strong" : schemaScore >= 7 ? "polish" : "fix",
          findings: schemaFindings,
        },
        {
          id: "media",
          label: "Media & Image Alt Text",
          score: mediaScore,
          maxScore: 10,
          status: mediaScore >= 9 ? "strong" : mediaScore >= 6 ? "polish" : "fix",
          findings: mediaFindings,
        },
      ];

      const overallScore = rubricCategories.reduce((acc, c) => acc + c.score, 0);
      const year = new Date().getUTCFullYear();

      // Default deterministic recommendations
      let aiPatch: z.infer<typeof onPageAiPatchSchema> = {
        currentKeyword: inferredKeyword,
        coverageStatus: overallScore >= 82 ? "covered" : "under-optimized",
        recommendedTitle: (
          title || `${inferredKeyword} — Complete Guide (${year})`
        ).slice(0, 60),
        recommendedMetaDescription: (
          metaDescription ||
          `Explore practical ${inferredKeyword} strategies, clear steps, and verified examples updated for ${year}.`
        ).slice(0, 156),
        recommendedH1: currentH1 || title || inferredKeyword,
        quickAnswer50Words: `${
          currentH1 || title || inferredKeyword
        } helps teams execute ${inferredKeyword} with measurable structure, clear verification checkpoints, and search-aligned clarity.`,
        missingSubtopics: [
          `${inferredKeyword} decision checklist`,
          `Common ${inferredKeyword} implementation mistakes`,
          `How to measure ${inferredKeyword} results`,
        ],
        recommendedFaqs: [
          {
            question: `What is the fastest way to improve ${inferredKeyword}?`,
            answer: `Start by aligning your primary title, H1, and opening summary around user intent, then connect related internal pages and validate structured data.`,
          },
          {
            question: `How often should this page be updated?`,
            answer: `Review search queries, examples, and internal links quarterly so the page stays accurate and competitive.`,
          },
        ],
      };

      if (isStudioAiConfigured()) {
        try {
          const { data } = await generateStudioStructured({
            schema: onPageAiPatchSchema,
            schemaName: "studio_onpage_optimization_patch",
            maxOutputTokens: 2200,
            timeoutMs: 25_000,
            systemPrompt: `You are a Senior On-Page SEO & GEO Specialist. Optimize this live ${pageType} page for ${year}.
CRITICAL PAGE-TYPE RULE:
- Detected pageType is "${pageType}". If pageType is "homepage", "landing", "service", or "tool", NEVER turn it into a generic blog essay—keep recommendedTitle, recommendedH1, quickAnswer50Words, and FAQs commercial/product-focused!
- Keep recommendedTitle 48–60 chars, recommendedMetaDescription 135–158 chars, and quickAnswer50Words 40–55 words. Return valid JSON only.`,
            userPrompt: JSON.stringify({
              url: target.href,
              pageType,
              explicitTargetKeyword: explicitKeyword || null,
              currentTitle: title,
              currentMetaDescription: metaDescription,
              currentH1,
              h2Headings,
              bodyExcerpt: bodyText.slice(0, 1400),
            }),
          });
          aiPatch = data;
        } catch {
          // Retain clean deterministic patch
        }
      }

      const plan: ExistingPageOptimizationPlan = {
        id: `onpage-${Date.now()}`,
        siteId,
        pageUrl: target.href,
        pageType,
        overallScore,
        currentTitle: title,
        currentMetaDescription: metaDescription,
        currentH1,
        currentKeyword: aiPatch.currentKeyword,
        wordCount,
        h2Headings,
        internalLinksCount,
        externalLinksCount,
        imagesMissingAlt,
        totalImages,
        schemaTypes: Array.from(schemaTypes),
        hasCanonical,
        canonicalUrl,
        coverageStatus: aiPatch.coverageStatus,
        recommendedTitle: aiPatch.recommendedTitle,
        recommendedMetaDescription: aiPatch.recommendedMetaDescription,
        recommendedH1: aiPatch.recommendedH1,
        quickAnswer50Words: aiPatch.quickAnswer50Words,
        missingSubtopics: aiPatch.missingSubtopics,
        recommendedFaqs: aiPatch.recommendedFaqs,
        rubricCategories,
        auditedAtIso: new Date().toISOString(),
      };

      return NextResponse.json({ ok: true, plan });
    }

    /* ========================================================================
     * MODE 2: LIVE TECHNICAL SEO & BROKEN LINK / SCHEMA DIAGNOSTICS
     * ====================================================================== */
    if (mode === "technical") {
      const urlRaw = String(raw.url || "").trim();
      if (!urlRaw) {
        return NextResponse.json(
          { error: "Provide a website URL for technical inspection." },
          { status: 400 },
        );
      }
      const target = normalizeSiteUrl(urlRaw);

      const [homeRes, robotsRes, llmsRes, sitemapRes] = await Promise.all([
        fetchEdgeSafeText(target.href, 9000),
        fetchEdgeSafeText(`${target.origin}/robots.txt`, 5000),
        fetchEdgeSafeText(`${target.origin}/llms.txt`, 4000),
        fetchEdgeSafeText(`${target.origin}/sitemap.xml`, 6000),
      ]);

      const $ = homeRes.text ? load(homeRes.text) : null;
      const metaRobots =
        $?.('meta[name="robots"]').attr("content")?.trim() || "index, follow";
      const canonical = $?.('link[rel="canonical"]').attr("href")?.trim() || "";
      const viewport = $?.('meta[name="viewport"]').attr("content")?.trim() || "";
      const ogTitle =
        $?.('meta[property="og:title"]').attr("content")?.trim() || "";
      const ogImage =
        $?.('meta[property="og:image"]').attr("content")?.trim() || "";
      const htmlLang = $?.("html").attr("lang")?.trim() || "";

      const rawJsonLdBlocks: string[] = [];
      const schemaTypes: string[] = [];
      $?.('script[type="application/ld+json"]').each((_, el) => {
        const txt = $?.(el).contents().text().trim() || "";
        if (txt) {
          rawJsonLdBlocks.push(txt.slice(0, 4000));
          try {
            const parsed = JSON.parse(txt) as Record<string, unknown>;
            if (typeof parsed["@type"] === "string")
              schemaTypes.push(parsed["@type"]);
            if (Array.isArray(parsed["@graph"])) {
              for (const g of parsed["@graph"] as Array<Record<string, unknown>>) {
                if (g && typeof g["@type"] === "string")
                  schemaTypes.push(g["@type"]);
              }
            }
          } catch {
            schemaTypes.push("Invalid JSON-LD Syntax");
          }
        }
      });

      // Sample up to 10 unique links on the page to check live HTTP status
      const sampleLinks: string[] = [];
      $?.("a[href]").each((_, a) => {
        if (sampleLinks.length >= 10) return;
        const href = ($?.(a).attr("href") || "").trim();
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:"))
          return;
        try {
          const resolved = new URL(href, target.origin).href;
          if (!sampleLinks.includes(resolved)) sampleLinks.push(resolved);
        } catch {
          // ignore
        }
      });

      const linkChecks = await Promise.all(
        sampleLinks.map(async (linkUrl) => {
          const r = await fetchEdgeSafeText(linkUrl, 4500);
          return {
            url: linkUrl,
            status: r.status,
            ok: r.status >= 200 && r.status < 400,
          };
        }),
      );

      const siteName =
        $?.('meta[property="og:site_name"]').attr("content")?.trim() ||
        $?.("title").first().text().split(/[|–—-]/)[0]?.trim() ||
        target.hostname;

      const generatedGraphSchema = JSON.stringify(
        {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${target.origin}/#organization`,
              name: siteName,
              url: target.origin,
            },
            {
              "@type": "WebSite",
              "@id": `${target.origin}/#website`,
              url: target.origin,
              name: siteName,
              publisher: { "@id": `${target.origin}/#organization` },
            },
            {
              "@type": "WebPage",
              "@id": `${target.href}#webpage`,
              url: target.href,
              name: $?.("title").first().text().trim() || siteName,
              isPartOf: { "@id": `${target.origin}/#website` },
            },
          ],
        },
        null,
        2,
      );

      return NextResponse.json({
        ok: true,
        technical: {
          inspectedUrl: target.href,
          httpStatus: homeRes.status,
          httpsEnabled: target.protocol === "https:",
          metaRobots,
          isIndexable: !/noindex/i.test(metaRobots),
          canonical,
          viewportConfigured: Boolean(viewport),
          htmlLang,
          openGraphComplete: Boolean(ogTitle && ogImage),
          hasRobotsTxt:
            robotsRes.status === 200 && robotsRes.text.trim().length > 0,
          robotsTxtPreview:
            robotsRes.status === 200 ? robotsRes.text.slice(0, 2000) : "",
          hasLlmsTxt:
            llmsRes.status === 200 &&
            llmsRes.text.trim().length > 20 &&
            !/<!doctype html/i.test(llmsRes.text.slice(0, 120)),
          llmsTxtPreview:
            llmsRes.status === 200 ? llmsRes.text.slice(0, 1500) : "",
          hasSitemapXml:
            sitemapRes.status === 200 && /<urlset|<sitemapindex/i.test(sitemapRes.text),
          schemaTypes: Array.from(new Set(schemaTypes)),
          rawJsonLdCount: rawJsonLdBlocks.length,
          generatedGraphSchema,
          linkChecks,
          checkedAtIso: new Date().toISOString(),
        },
      });
    }

    /* ========================================================================
     * MODE 3: OFF-PAGE SEO (LIVE BACKLINK VERIFIER + AI PR & OUTREACH PLAN)
     * ====================================================================== */
    if (mode === "off-page") {
      const siteUrlRaw = String(raw.siteUrl || "").trim();
      const siteName = String(raw.siteName || siteUrlRaw || "Your Brand").trim();
      const niche = String(raw.niche || "Digital Business").trim();
      const competitorDomains = Array.isArray(raw.competitorDomains)
        ? raw.competitorDomains.map((d) => String(d).trim()).filter(Boolean).slice(0, 5)
        : [];
      const verifyUrls = Array.isArray(raw.verifyUrls)
        ? raw.verifyUrls.map((u) => String(u).trim()).filter(Boolean).slice(0, 10)
        : [];

      const targetHost = siteUrlRaw
        ? normalizeSiteUrl(siteUrlRaw).hostname.replace(/^www\./i, "").toLowerCase()
        : "";

      // 1. Live Backlink & Anchor Verification (if referring URLs supplied)
      const verifiedBacklinks = await Promise.all(
        verifyUrls.map(async (refUrl) => {
          try {
            const parsedRef = normalizeSiteUrl(refUrl);
            const res = await fetchEdgeSafeText(parsedRef.href, 6500);
            if (res.status < 200 || res.status >= 400 || !res.text) {
              return {
                referringUrl: parsedRef.href,
                httpStatus: res.status,
                found: false,
                anchorText: "",
                relType: "unreachable",
                targetHref: "",
              };
            }
            const $ = load(res.text);
            let matchedAnchor = "";
            let matchedHref = "";
            let relAttr = "";

            $("a[href]").each((_, a) => {
              if (matchedHref) return;
              const href = ($(a).attr("href") || "").trim();
              try {
                const resolved = new URL(href, parsedRef.origin);
                const linkHost = resolved.hostname.replace(/^www\./i, "").toLowerCase();
                if (targetHost && (linkHost === targetHost || linkHost.endsWith(`.${targetHost}`))) {
                  matchedHref = resolved.href;
                  matchedAnchor = $(a).text().replace(/\s+/g, " ").trim() || "[Image / Empty Anchor]";
                  relAttr = ($(a).attr("rel") || "").toLowerCase();
                }
              } catch {
                // ignore
              }
            });

            const relType = !matchedHref
              ? "missing"
              : /nofollow/.test(relAttr)
                ? "nofollow"
                : /sponsored/.test(relAttr)
                  ? "sponsored"
                  : /ugc/.test(relAttr)
                    ? "ugc"
                    : "dofollow";

            return {
              referringUrl: parsedRef.href,
              httpStatus: res.status,
              found: Boolean(matchedHref),
              anchorText: matchedAnchor,
              relType,
              targetHref: matchedHref,
            };
          } catch {
            return {
              referringUrl: refUrl,
              httpStatus: 0,
              found: false,
              anchorText: "",
              relType: "invalid-url",
              targetHref: "",
            };
          }
        }),
      );

      // 2. AI Digital PR, Competitor Gap & Outreach Blueprint (when requested)
      let strategy: z.infer<typeof offPageAiPlanSchema> | null = null;
      if (raw.generateStrategy) {
        if (isStudioAiConfigured()) {
          try {
            const { data } = await generateStudioStructured({
              schema: offPageAiPlanSchema,
              schemaName: "studio_offpage_pr_strategy",
              maxOutputTokens: 2400,
              timeoutMs: 26_000,
              systemPrompt:
                "You are a Digital PR & White-Hat Authority Strategist. Propose concrete linkable assets (interactive micro-tools, benchmark datasets, cheat-sheets), competitor backlink gap angles, and concise human outreach email templates tailored to the brand's niche. Never suggest paid link farms or spam. Return valid JSON only.",
              userPrompt: JSON.stringify({
                siteName,
                siteUrl: siteUrlRaw,
                niche,
                competitorDomains,
              }),
            });
            strategy = data;
          } catch {
            // Fall through to deterministic fallback below
          }
        }

        if (!strategy) {
          strategy = {
            linkableAssets: [
              {
                title: `${niche} Interactive ROI & Cost Benchmark Calculator`,
                assetFormat: "Free Interactive Calculator / Micro-Tool",
                whyJournalistsAndBlogsLink:
                  "Writers love citing interactive calculators instead of static formulas when explaining ROI.",
                targetLinkerPersona: `B2B bloggers, industry newsletters, and ${niche} educators`,
              },
              {
                title: `State of ${niche}: Original Checklist & Benchmark Matrix`,
                assetFormat: "Data-Backed Reference Guide + SVG Diagrams",
                whyJournalistsAndBlogsLink:
                  "Embeddable comparison tables and clean visual charts earn natural editorial citations.",
                targetLinkerPersona: "Niche journalists and SaaS content editors",
              },
              {
                title: `Copy-Paste ${niche} Templates & Audit Scorecard`,
                assetFormat: "Downloadable / Web Template Hub",
                whyJournalistsAndBlogsLink:
                  "Resource roundups regularly link to genuinely free, ungated practitioner templates.",
                targetLinkerPersona: "Resource page curators and community leaders",
              },
            ],
            competitorGapAngles: [
              `Audit resource pages linking to ${competitorDomains[0] || "top niche competitors"} where outdated guides can be complemented by an interactive tool.`,
              `Claim unlinked brand mentions of "${siteName}" across blogs and roundups.`,
              `Co-author niche benchmark comparisons with non-competing partner tools.`,
            ],
            outreachTemplates: [
              {
                scenario: "Unlinked Brand / Topic Resource Addition",
                subjectLine: `Quick resource note on your ${niche} guide`,
                bodyTemplate: `Hi {{FirstName}},\n\nEnjoyed your breakdown on {{ArticleTopic}}—especially your point on {{SpecificTakeaway}}.\n\nWe recently built a free ${niche} resource at ${siteUrlRaw || "{{YourURL}}"} that covers {{UniqueValueAdd}}. If you ever update that section, feel free to reference it if useful for your readers.\n\nBest,\n${siteName}`,
              },
              {
                scenario: "Original Data / Visual Diagram Citation Pitch",
                subjectLine: `Embeddable ${niche} chart for your {{ArticleTopic}} post`,
                bodyTemplate: `Hi {{FirstName}},\n\nSaw your guide ranking for {{Keyword}}. We put together a clean benchmark diagram on ${niche} (${siteUrlRaw || "{{YourURL}}"})—happy for you to embed the visual with attribution if it saves your team design time.\n\nCheers,\n${siteName}`,
              },
            ],
          };
        }
      }

      return NextResponse.json({
        ok: true,
        verifiedBacklinks,
        strategy,
      });
    }

    return NextResponse.json({ error: "Unsupported audit mode." }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "SEO audit request failed.",
      },
      { status: 400 },
    );
  }
}

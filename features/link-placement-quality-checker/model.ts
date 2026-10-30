import { load } from "cheerio";
import { getDomain } from "tldts";
import { zipStored } from "@/features/outreach-email/docx";

export type CheckStatus = "pass" | "warn" | "fail";

export type VettingCheckpoint = {
  id: string;
  label: string;
  status: CheckStatus;
  observed: string;
  guidance: string;
};

export type ProspectVettingResult = {
  id: string;
  url: string;
  finalUrl: string;
  domain: string;
  httpStatus: number | null;
  method: "live" | "html" | "sample";
  pageTitle: string;
  h1Text: string;
  wordCount: number;
  headingCount: number;
  internalLinkCount: number;
  externalLinkCount: number;
  uniqueExternalDomains: number;
  externalLinksPer1kWords: number;
  dofollowExternalCount: number;
  nofollowExternalCount: number;
  sponsoredExternalCount: number;
  dofollowSharePct: number;
  isIndexable: boolean;
  robotsDirective: string;
  canonicalUrl: string;
  canonicalMatchesSelf: boolean;
  authorName: string;
  publishedDate: string;
  schemaTypes: string[];
  footprintFlags: string[];
  matchedNicheKeywords: string[];
  topicalOverlapPct: number;
  verdict: "strong-prospect" | "review-carefully" | "high-risk";
  verdictLabel: string;
  verdictSummary: string;
  passedChecksCount: number;
  totalChecksCount: number;
  checkpoints: VettingCheckpoint[];
  sampleExternalAnchors: Array<{
    anchor: string;
    href: string;
    rel: string;
  }>;
  error?: string;
};

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

const FOOTPRINT_PATTERNS: Array<{ label: string; regex: RegExp }> = [
  {
    label: "'Write for us' / guest-post solicitation footprint",
    regex:
      /\b(write for us|submit a guest post|guest post guidelines|become a contributor|paid guest post|advertise with us|sponsored post guidelines)\b/i,
  },
  {
    label: "Gambling / casino / sports betting co-citation",
    regex:
      /\b(online casino|slot machine|sports betting|poker bonus|crypto casino|free spins no deposit|betting odds)\b/i,
  },
  {
    label: "Adult / pharma / high-risk commercial co-citation",
    regex:
      /\b(buy cbd gummies|kratom|vape juice|essay writing service|buy cheap backlinks|payday loan|viagra)\b/i,
  },
];

export function analyzePublisherProspectHtml(params: {
  html: string;
  url: string;
  finalUrl?: string;
  httpStatus?: number | null;
  headers?: Record<string, string>;
  nicheKeywords: string[];
  method: "live" | "html" | "sample";
}): ProspectVettingResult {
  const finalUrl = params.finalUrl || params.url;
  const domain = rootDomain(finalUrl);
  const $ = load(params.html);

  const pageTitle = clean($("title").first().text(), 200) || domain;
  const h1Text = clean($("h1").first().text(), 200);

  // 1. Robots & Indexability
  const metaRobots = [
    $("meta[name='robots']").attr("content") || "",
    $("meta[name='googlebot']").attr("content") || "",
    params.headers?.["x-robots-tag"] || "",
  ]
    .filter(Boolean)
    .join(", ")
    .toLowerCase();

  const hasNoindex = /\b(noindex|none)\b/i.test(metaRobots);
  const hasPageNofollow = /\b(nofollow|none)\b/i.test(metaRobots);
  const isIndexable = !hasNoindex;

  // 2. Canonical check
  const rawCanonical = $("link[rel='canonical']").first().attr("href")?.trim() || "";
  let canonicalUrl = "";
  let canonicalMatchesSelf = true;
  if (rawCanonical) {
    try {
      canonicalUrl = new URL(rawCanonical, finalUrl).href;
      const normFinal = finalUrl.replace(/\/$/, "").toLowerCase();
      const normCanon = canonicalUrl.replace(/\/$/, "").toLowerCase();
      canonicalMatchesSelf = normFinal === normCanon;
    } catch {
      canonicalUrl = rawCanonical;
      canonicalMatchesSelf = false;
    }
  }

  // 3. Schema & Author & Date detection
  const schemaTypes = new Set<string>();
  let schemaAuthor = "";
  let schemaDate = "";

  $("script[type='application/ld+json']").each((_, el) => {
    const rawJson = $(el).html() || "";
    try {
      const parsed = JSON.parse(rawJson);
      const walk = (node: unknown) => {
        if (!node || typeof node !== "object") return;
        if (Array.isArray(node)) {
          node.forEach(walk);
          return;
        }
        const obj = node as Record<string, unknown>;
        if (typeof obj["@type"] === "string") schemaTypes.add(obj["@type"]);
        if (Array.isArray(obj["@type"])) {
          obj["@type"].forEach((t) => {
            if (typeof t === "string") schemaTypes.add(t);
          });
        }
        if (!schemaDate && typeof obj.dateModified === "string") {
          schemaDate = obj.dateModified;
        } else if (!schemaDate && typeof obj.datePublished === "string") {
          schemaDate = obj.datePublished;
        }
        if (!schemaAuthor && obj.author) {
          if (typeof obj.author === "string") schemaAuthor = obj.author;
          else if (
            typeof obj.author === "object" &&
            !Array.isArray(obj.author) &&
            typeof (obj.author as Record<string, unknown>).name === "string"
          ) {
            schemaAuthor = String((obj.author as Record<string, unknown>).name);
          }
        }
        Object.values(obj).forEach(walk);
      };
      walk(parsed);
    } catch {
      /* ignore malformed JSON-LD */
    }
  });

  const authorName =
    clean(
      schemaAuthor ||
        $("meta[name='author']").attr("content") ||
        $("[rel='author'], .author-name, .byline, [class*='author']").first().text() ||
        "",
      90,
    ) || "Not detected";

  const publishedDate =
    clean(
      schemaDate ||
        $("meta[property='article:modified_time']").attr("content") ||
        $("meta[property='article:published_time']").attr("content") ||
        $("time[datetime]").first().attr("datetime") ||
        "",
      40,
    ) || "Not detected";

  // 4. Clean body & extract links
  $("script,style,noscript,template").remove();
  const fullPageText = clean($("body").text(), 25000);
  const editorialRoot = $("main").first().length
    ? $("main").first()
    : $("article").first().length
      ? $("article").first()
      : $("body");

  const editorialClone = editorialRoot.clone();
  editorialClone.find("nav,header,footer").remove();
  const editorialText = editorialClone.text().replace(/\s+/g, " ").trim();
  const words = editorialText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const headingCount = editorialClone.find("h1,h2,h3").length;

  let internalLinkCount = 0;
  let externalLinkCount = 0;
  let dofollowExternalCount = 0;
  let nofollowExternalCount = 0;
  let sponsoredExternalCount = 0;
  const externalDomains = new Set<string>();
  const sampleExternalAnchors: Array<{
    anchor: string;
    href: string;
    rel: string;
  }> = [];

  editorialClone.find("a[href]").each((_, el) => {
    const node = $(el);
    const rawHref = node.attr("href")?.trim();
    if (
      !rawHref ||
      rawHref.startsWith("#") ||
      /^(javascript:|mailto:|tel:)/i.test(rawHref)
    ) {
      return;
    }
    let resolved: URL;
    try {
      resolved = new URL(rawHref, finalUrl);
    } catch {
      return;
    }
    const targetDom = rootDomain(resolved.href);
    const isInternal = Boolean(domain && targetDom === domain);
    const rel = (node.attr("rel") || "").toLowerCase().trim();
    const anchor =
      clean(node.text() || node.find("img").attr("alt") || "", 100) ||
      "[Image/Empty]";

    if (isInternal) {
      internalLinkCount++;
    } else {
      externalLinkCount++;
      if (targetDom) externalDomains.add(targetDom);
      if (/\bsponsored\b/.test(rel)) {
        sponsoredExternalCount++;
        nofollowExternalCount++;
      } else if (/\b(nofollow|ugc)\b/.test(rel) || hasPageNofollow) {
        nofollowExternalCount++;
      } else {
        dofollowExternalCount++;
      }
      if (sampleExternalAnchors.length < 8) {
        sampleExternalAnchors.push({
          anchor,
          href: resolved.href,
          rel: rel || (hasPageNofollow ? "page-nofollow" : "dofollow"),
        });
      }
    }
  });

  const uniqueExternalDomains = externalDomains.size;
  const externalLinksPer1kWords =
    wordCount > 0
      ? Math.round((externalLinkCount / Math.max(wordCount, 100)) * 10000) / 10
      : externalLinkCount * 10;
  const dofollowSharePct =
    externalLinkCount > 0
      ? Math.round((dofollowExternalCount / externalLinkCount) * 100)
      : 100;

  // 5. Check Footprint Flags
  const footprintFlags: string[] = [];
  for (const fp of FOOTPRINT_PATTERNS) {
    if (fp.regex.test(fullPageText)) {
      footprintFlags.push(fp.label);
    }
  }
  if (externalLinkCount >= 18 && internalLinkCount <= 1) {
    footprintFlags.push(
      `High external (${externalLinkCount}) vs minimal internal (${internalLinkCount}) link imbalance`,
    );
  }

  // 6. Topical Relevance Overlap
  const cleanKeywords = params.nicheKeywords
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
  const searchableContent =
    `${pageTitle} ${h1Text} ${editorialText}`.toLowerCase();
  const matchedNicheKeywords = cleanKeywords.filter((kw) => {
    if (searchableContent.includes(kw)) return true;
    const tokens = kw.split(/\s+/).filter((t) => t.length > 3);
    return (
      tokens.length >= 2 &&
      tokens.filter((t) => searchableContent.includes(t)).length >=
        Math.ceil(tokens.length * 0.6)
    );
  });

  const topicalOverlapPct =
    cleanKeywords.length > 0
      ? Math.round((matchedNicheKeywords.length / cleanKeywords.length) * 100)
      : 100;

  // 7. Build the 10 transparent Vetting Checkpoints
  const checkpoints: VettingCheckpoint[] = [
    {
      id: "indexability",
      label: "1. Search Engine Indexability",
      status: isIndexable ? "pass" : "fail",
      observed: isIndexable
        ? `Indexable (${metaRobots || "no blocking robots directives"})`
        : `Blocked by ${metaRobots}`,
      guidance:
        "A link on a noindex page passes zero search visibility or link equity.",
    },
    {
      id: "canonical",
      label: "2. Canonical Tag Alignment",
      status: canonicalMatchesSelf ? "pass" : "fail",
      observed: !rawCanonical
        ? "No conflicting canonical tag declared"
        : canonicalMatchesSelf
          ? `Self-referencing canonical (${canonicalUrl})`
          : `Mismatched canonical points to ${canonicalUrl}`,
      guidance:
        "If a page canonicalizes to another URL, search engines consolidate signals away from this page.",
    },
    {
      id: "follow-policy",
      label: "3. Outbound Link Follow Policy",
      status:
        hasPageNofollow || (externalLinkCount > 0 && dofollowSharePct === 0)
          ? "warn"
          : "pass",
      observed:
        externalLinkCount === 0
          ? "No external links in body yet (no page-wide nofollow)"
          : `${dofollowExternalCount} dofollow (${dofollowSharePct}%) vs ${nofollowExternalCount} nofollow/sponsored`,
      guidance:
        "Verify whether the publisher allows editorial dofollow links or forces rel='nofollow'/'sponsored' sitewide.",
    },
    {
      id: "outbound-density",
      label: "4. Outbound External Link Density",
      status:
        externalLinksPer1kWords > 22 || uniqueExternalDomains > 20
          ? "fail"
          : externalLinksPer1kWords > 14
            ? "warn"
            : "pass",
      observed: `${externalLinkCount} external links across ${uniqueExternalDomains} domains (${externalLinksPer1kWords} per 1k words)`,
      guidance:
        "Pages packed with >15–20 external links per 1,000 words dilute link equity and resemble link farms.",
    },
    {
      id: "internal-balance",
      label: "5. Internal vs. External Link Balance",
      status:
        internalLinkCount === 0 && externalLinkCount >= 4
          ? "fail"
          : internalLinkCount < 2
            ? "warn"
            : "pass",
      observed: `${internalLinkCount} internal link(s) vs ${externalLinkCount} external link(s)`,
      guidance:
        "Genuine editorial articles interlink with related pages on their own domain; orphan pages with only outbound links are a PBN red flag.",
    },
    {
      id: "footprints",
      label: "6. Link-Farm & Paid Footprint Scan",
      status: footprintFlags.length > 0 ? "fail" : "pass",
      observed:
        footprintFlags.length > 0
          ? footprintFlags.join("; ")
          : "Zero guest-post solicitation or high-risk niche footprints detected",
      guidance:
        "Avoid sites openly advertising 'Write for Us / Paid Guest Posts' alongside gambling, CBD, or adult anchors.",
    },
    {
      id: "content-depth",
      label: "7. Editorial Content Depth & Structure",
      status:
        wordCount >= 600 && headingCount >= 2
          ? "pass"
          : wordCount >= 300
            ? "warn"
            : "fail",
      observed: `${wordCount} words in main body with ${headingCount} headings (H1–H3)`,
      guidance:
        "Substantive articles (600+ words with clear subheadings) retain indexation and rankings far better than thin 250-word posts.",
    },
    {
      id: "topical-relevance",
      label: "8. Topical Relevance to Your Niche",
      status:
        cleanKeywords.length === 0
          ? "pass"
          : topicalOverlapPct >= 50
            ? "pass"
            : topicalOverlapPct > 0
              ? "warn"
              : "fail",
      observed:
        cleanKeywords.length === 0
          ? "No target keywords entered (skipped)"
          : `Matched ${matchedNicheKeywords.length} of ${cleanKeywords.length} topic keywords (${topicalOverlapPct}%)`,
      guidance:
        "Links from topically aligned pages carry stronger contextual weight than general multi-topic news farms.",
    },
    {
      id: "attribution",
      label: "9. Author Attribution & Structured Data",
      status:
        authorName !== "Not detected" || schemaTypes.size > 0 ? "pass" : "warn",
      observed: `Author: ${authorName} | Schema: ${schemaTypes.size > 0 ? [...schemaTypes].join(", ") : "None"}`,
      guidance:
        "Named authors and Article/Organization schema indicate editorial accountability.",
    },
    {
      id: "freshness",
      label: "10. Publication / Update Timestamp",
      status: publishedDate !== "Not detected" ? "pass" : "warn",
      observed: `Timestamp: ${publishedDate}`,
      guidance:
        "Visible publication or modification dates help confirm an active editorial calendar.",
    },
  ];

  const passedChecksCount = checkpoints.filter(
    (c) => c.status === "pass",
  ).length;
  const criticalFail =
    !isIndexable || !canonicalMatchesSelf || footprintFlags.length > 0;

  let verdict: "strong-prospect" | "review-carefully" | "high-risk" =
    "strong-prospect";
  let verdictLabel = "Strong Editorial Prospect";
  let verdictSummary =
    "Passes indexability, canonical, link density, and footprint checks with healthy editorial signals.";

  if (criticalFail || passedChecksCount <= 5) {
    verdict = "high-risk";
    verdictLabel = "High Risk / Reject Placement";
    verdictSummary = !isIndexable
      ? "Page is blocked by noindex — links here pass zero SEO value."
      : !canonicalMatchesSelf
        ? "Canonical tag points away from this page."
        : footprintFlags.length > 0
          ? `Detected link-seller or high-risk co-citation footprints (${footprintFlags[0]}).`
          : "Failed multiple editorial and link-density thresholds.";
  } else if (passedChecksCount <= 7 || dofollowSharePct === 0) {
    verdict = "review-carefully";
    verdictLabel = "Review Carefully Before Outreach";
    verdictSummary =
      dofollowSharePct === 0 && externalLinkCount > 0
        ? "Indexable editorial page, but all observed external links use nofollow/sponsored attributes."
        : "Acceptable core technical setup, but review warnings on topical overlap, content depth, or outbound link ratio.";
  }

  return {
    id: `${domain}-${Math.random().toString(36).slice(2, 7)}`,
    url: params.url,
    finalUrl,
    domain,
    httpStatus: params.httpStatus ?? 200,
    method: params.method,
    pageTitle,
    h1Text,
    wordCount,
    headingCount,
    internalLinkCount,
    externalLinkCount,
    uniqueExternalDomains,
    externalLinksPer1kWords,
    dofollowExternalCount,
    nofollowExternalCount,
    sponsoredExternalCount,
    dofollowSharePct,
    isIndexable,
    robotsDirective: metaRobots || "index, follow",
    canonicalUrl: canonicalUrl || "Self (implicit)",
    canonicalMatchesSelf,
    authorName,
    publishedDate,
    schemaTypes: [...schemaTypes],
    footprintFlags,
    matchedNicheKeywords,
    topicalOverlapPct,
    verdict,
    verdictLabel,
    verdictSummary,
    passedChecksCount,
    totalChecksCount: checkpoints.length,
    checkpoints,
    sampleExternalAnchors,
  };
}

export function exportProspectVettingCsv(
  results: ProspectVettingResult[],
): string {
  const esc = (v: string | number | boolean) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;
  const headers = [
    "Prospect URL",
    "Domain",
    "Verdict",
    "Checks Passed",
    "Indexable",
    "Canonical Valid",
    "Word Count",
    "Internal Links",
    "External Links",
    "External Links / 1k Words",
    "Dofollow Share (%)",
    "Topical Overlap (%)",
    "Author",
    "Published Date",
    "Footprint Flags",
    "Summary Note",
  ];
  const rows = results.map((r) =>
    [
      r.finalUrl,
      r.domain,
      r.verdictLabel,
      `${r.passedChecksCount}/${r.totalChecksCount}`,
      r.isIndexable ? "YES" : "NO",
      r.canonicalMatchesSelf ? "YES" : "NO",
      r.wordCount,
      r.internalLinkCount,
      r.externalLinkCount,
      r.externalLinksPer1kWords,
      r.dofollowSharePct,
      r.topicalOverlapPct,
      r.authorName,
      r.publishedDate,
      r.footprintFlags.join(" | ") || "None",
      r.verdictSummary,
    ]
      .map(esc)
      .join(","),
  );
  return [headers.map(esc).join(","), ...rows].join("\r\n");
}

export function buildProspectVettingDocx(
  results: ProspectVettingResult[],
): Uint8Array {
  const escape = (text: string) =>
    text
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const paragraph = (text: string, style = "Normal") =>
    `<w:p><w:pPr><w:pStyle w:val="${style}"/><w:widowControl/></w:pPr><w:r><w:t xml:space="preserve">${escape(text)}</w:t></w:r></w:p>`;

  const p: string[] = [
    paragraph("Guest Post & Link Placement Quality Vetting Report", "Title"),
    paragraph(
      `Evaluated ${results.length} candidate publisher page(s) across 10 technical, editorial, and link-footprint checkpoints.`,
    ),
    ...results.flatMap((r, idx) => [
      paragraph(
        `${idx + 1}. ${r.domain} — ${r.verdictLabel} (${r.passedChecksCount}/${r.totalChecksCount} Checks Passed)`,
        "Heading1",
      ),
      paragraph(`URL: ${r.finalUrl}`),
      paragraph(`Title: ${r.pageTitle}`),
      paragraph(`Summary: ${r.verdictSummary}`),
      paragraph(
        `Metrics: ${r.wordCount} words | ${r.internalLinkCount} internal links | ${r.externalLinkCount} external links (${r.dofollowSharePct}% dofollow) | Topical match: ${r.topicalOverlapPct}%`,
      ),
      ...r.checkpoints.map((c) =>
        paragraph(
          `[${c.status.toUpperCase()}] ${c.label}: ${c.observed}`,
        ),
      ),
    ]),
  ];

  return zipStored({
    "[Content_Types].xml":
      '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>',
    "_rels/.rels":
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    "word/document.xml": `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${p.join("")}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/></w:sectPr></w:body></w:document>`,
    "word/_rels/document.xml.rels":
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    "word/styles.xml":
      '<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:color w:val="000000"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="100" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="0" w:after="200"/></w:pPr><w:rPr><w:b/><w:color w:val="182235"/><w:sz w:val="36"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="220" w:after="100"/></w:pPr><w:rPr><w:b/><w:color w:val="3452D1"/><w:sz w:val="26"/></w:rPr></w:style></w:styles>',
  });
}

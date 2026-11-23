import type {
  AnchorAnalysisReport,
  AnchorCategory,
  AnchorRow,
  CategoryBreakdown,
  DiversificationSuggestion,
  FollowStatus,
  PageBenchmarkProfile,
  PlacementZone,
  RepeatedAnchorItem,
  RiskFinding,
} from "./types";

export const CATEGORY_META: Record<
  AnchorCategory,
  { label: string; description: string; badgeClass: string }
> = {
  "exact-match": {
    label: "Exact Match",
    description:
      "Matches one of your target keywords word-for-word. High relevance signal, but excessive ratios trigger over-optimization filters.",
    badgeClass:
      "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:border-rose-800",
  },
  "partial-match": {
    label: "Partial / Phrase Match",
    description:
      "Blends a target keyword or core keyword tokens into a longer phrase without brand terms.",
    badgeClass:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800",
  },
  "brand-keyword": {
    label: "Brand + Keyword",
    description:
      "Combines your brand name with a target topic or keyword phrase — a natural editorial anchor format.",
    badgeClass:
      "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-200 dark:border-indigo-800",
  },
  branded: {
    label: "Branded",
    description:
      "Uses your brand or company name without commercial target keywords.",
    badgeClass:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800",
  },
  "naked-url": {
    label: "Naked URL / Domain",
    description:
      "Links using a raw URL, hostname, or domain string (e.g., https://example.com or example.com).",
    badgeClass:
      "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-800",
  },
  "topical-natural": {
    label: "Natural / Topical Context",
    description:
      "Descriptive editorial text that neither repeats target keywords nor uses generic click prompts.",
    badgeClass:
      "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/50 dark:text-teal-200 dark:border-teal-800",
  },
  generic: {
    label: "Generic CTA",
    description:
      "Action or pointer words like 'click here', 'read more', 'source', 'website', or 'this guide'.",
    badgeClass:
      "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
  },
  "image-empty": {
    label: "Image / Empty Anchor",
    description:
      "Image link using alt text or an anchor tag with missing visible text.",
    badgeClass:
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-200 dark:border-purple-800",
  },
};

export const BENCHMARK_PROFILES: Record<
  PageBenchmarkProfile,
  {
    name: string;
    subtitle: string;
    ranges: Record<AnchorCategory, [number, number]>;
  }
> = {
  homepage: {
    name: "Homepage / Root Brand",
    subtitle:
      "Homepages naturally attract mostly branded and naked-URL citations, with very low exact-match keyword anchors.",
    ranges: {
      branded: [35, 55],
      "naked-url": [15, 30],
      "brand-keyword": [5, 15],
      "topical-natural": [10, 25],
      "partial-match": [5, 15],
      generic: [5, 15],
      "exact-match": [0, 6],
      "image-empty": [0, 10],
    },
  },
  commercial: {
    name: "Commercial / Product / Landing Page",
    subtitle:
      "Service and product pages benefit from partial-match and brand+keyword anchors while keeping exact-match under 10%.",
    ranges: {
      branded: [20, 35],
      "naked-url": [10, 22],
      "brand-keyword": [10, 22],
      "topical-natural": [15, 30],
      "partial-match": [12, 25],
      generic: [5, 15],
      "exact-match": [0, 10],
      "image-empty": [0, 8],
    },
  },
  editorial: {
    name: "Blog Post / Research Guide / Tool",
    subtitle:
      "Deep articles, studies, and free tools naturally earn more descriptive topical and partial-match anchors.",
    ranges: {
      branded: [12, 28],
      "naked-url": [8, 20],
      "brand-keyword": [8, 18],
      "topical-natural": [20, 40],
      "partial-match": [15, 30],
      generic: [5, 15],
      "exact-match": [0, 14],
      "image-empty": [0, 8],
    },
  },
};

const GENERIC_PATTERNS = new Set([
  "click here",
  "here",
  "read more",
  "learn more",
  "more info",
  "more information",
  "website",
  "visit website",
  "visit site",
  "official site",
  "official website",
  "source",
  "link",
  "this link",
  "this page",
  "this article",
  "this post",
  "this guide",
  "check it out",
  "find out more",
  "view more",
  "see more",
  "continue reading",
  "full article",
  "original source",
  "go to site",
  "homepage",
  "web page",
  "reference",
  "study",
  "report",
]);

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "our",
  "that",
  "the",
  "their",
  "this",
  "to",
  "with",
  "your",
]);

export function normalizeText(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/https?:\/\/|www\./g, "")
    .replace(/[^\p{L}\p{N}\s.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function significantTokens(phrase: string): string[] {
  return normalizeText(phrase)
    .split(/[\s.-]+/)
    .filter((tok) => tok.length > 2 && !STOPWORDS.has(tok));
}

export function isNakedUrlAnchor(anchor: string, targetDomain: string): boolean {
  const trimmed = anchor.trim().toLowerCase();
  if (!trimmed) return false;
  if (/^https?:\/\/\S+$/i.test(trimmed)) return true;
  if (/^www\.[a-z0-9.-]+\.[a-z]{2,}(\/\S*)?$/i.test(trimmed)) return true;
  if (
    /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/[^\s]*)?$/i.test(trimmed) &&
    !/\s/.test(trimmed)
  ) {
    return true;
  }
  const cleanDomain = targetDomain
    .toLowerCase()
    .replace(/^https?:\/\/|^www\./g, "")
    .replace(/\/.*$/, "")
    .trim();
  if (cleanDomain && (trimmed === cleanDomain || trimmed === `www.${cleanDomain}`)) {
    return true;
  }
  return false;
}

export function classifyAnchor(params: {
  anchorText: string;
  isImageLink?: boolean;
  targetDomain: string;
  brandTerms: string[];
  targetKeywords: string[];
}): { category: AnchorCategory; matchedKeyword?: string } {
  const raw = params.anchorText.trim();
  if (
    !raw ||
    raw === "[Empty anchor]" ||
    raw === "Unlabelled link" ||
    /^\[image:/i.test(raw) ||
    params.isImageLink
  ) {
    return { category: "image-empty" };
  }

  if (isNakedUrlAnchor(raw, params.targetDomain)) {
    return { category: "naked-url" };
  }

  const norm = normalizeText(raw);
  if (!norm) return { category: "image-empty" };

  if (
    GENERIC_PATTERNS.has(norm) ||
    /^(click|tap|visit|read|view|see|check|open)\s+(here|this|more|now|link|page|site|article)$/i.test(
      norm,
    )
  ) {
    return { category: "generic" };
  }

  const cleanDomainRoot = params.targetDomain
    .toLowerCase()
    .replace(/^https?:\/\/|^www\./g, "")
    .split("/")[0]
    .split(".")[0];

  const brandList = Array.from(
    new Set(
      [
        ...params.brandTerms.map((b) => normalizeText(b)),
        cleanDomainRoot && cleanDomainRoot.length >= 3 ? cleanDomainRoot : "",
      ].filter(Boolean),
    ),
  );

  const hasBrand = brandList.some(
    (b) =>
      norm === b ||
      norm.includes(b) ||
      norm.replace(/\s+/g, "") === b.replace(/\s+/g, ""),
  );

  const normalizedKeywords = params.targetKeywords
    .map((kw) => ({ raw: kw.trim(), norm: normalizeText(kw) }))
    .filter((k) => k.norm.length > 0);

  // Check exact match first
  for (const kw of normalizedKeywords) {
    if (norm === kw.norm) {
      return { category: "exact-match", matchedKeyword: kw.raw };
    }
  }

  // Check partial / phrase match against target keywords
  let matchedKw: string | undefined;
  for (const kw of normalizedKeywords) {
    if (norm.includes(kw.norm)) {
      matchedKw = kw.raw;
      break;
    }
    const kwTokens = significantTokens(kw.norm);
    const anchorTokens = new Set(significantTokens(norm));
    if (kwTokens.length >= 2) {
      const overlap = kwTokens.filter((t) => anchorTokens.has(t)).length;
      if (overlap >= Math.ceil(kwTokens.length * 0.6)) {
        matchedKw = kw.raw;
        break;
      }
    } else if (kwTokens.length === 1 && anchorTokens.has(kwTokens[0])) {
      matchedKw = kw.raw;
      break;
    }
  }

  if (hasBrand && matchedKw) {
    return { category: "brand-keyword", matchedKeyword: matchedKw };
  }
  if (matchedKw) {
    return { category: "partial-match", matchedKeyword: matchedKw };
  }
  if (hasBrand) {
    return { category: "branded" };
  }

  return { category: "topical-natural" };
}

export function inferFollowStatus(relTokens: string[]): FollowStatus {
  const lower = relTokens.map((r) => r.toLowerCase().trim());
  if (lower.includes("sponsored")) return "sponsored";
  if (lower.includes("ugc")) return "ugc";
  if (lower.includes("nofollow")) return "nofollow";
  return "dofollow";
}

function splitDelimitedLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      out.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  out.push(current.trim());
  return out;
}

export function parseSubmittedBacklinkTable(
  rawText: string,
  options: {
    targetDomain: string;
    brandTerms: string[];
    targetKeywords: string[];
  },
): { rows: AnchorRow[]; notes: string[] } {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return { rows: [], notes: [] };

  const delimiter = lines[0].includes("\t")
    ? "\t"
    : lines[0].includes(",")
      ? ","
      : "|";

  const firstCells = splitDelimitedLine(lines[0], delimiter).map((c) =>
    c.toLowerCase().replace(/^["']|["']$/g, "").trim(),
  );

  const hasHeader =
    firstCells.length > 1 &&
    firstCells.some((c) =>
      /^(anchor|anchor text|link text|linking text|source|source url|referring page|target|target url|rel|type|nofollow)$/i.test(
        c,
      ),
    );

  let anchorIdx = 0;
  let sourceIdx = -1;
  let targetIdx = -1;
  let relIdx = -1;
  let contextIdx = -1;

  if (hasHeader) {
    anchorIdx = firstCells.findIndex((c) =>
      /anchor|link text|linking text|text/i.test(c),
    );
    sourceIdx = firstCells.findIndex((c) =>
      /source|referring|from url|page url|origin/i.test(c),
    );
    targetIdx = firstCells.findIndex((c) =>
      /target|destination|to url|linked page/i.test(c),
    );
    relIdx = firstCells.findIndex((c) => /rel|follow|attribute|type/i.test(c));
    contextIdx = firstCells.findIndex((c) => /context|snippet|surrounding/i.test(c));
    if (anchorIdx === -1) anchorIdx = 0;
  }

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const rows: AnchorRow[] = [];
  const notes: string[] = [];

  dataLines.slice(0, 1500).forEach((line, idx) => {
    const cells = splitDelimitedLine(line, delimiter).map((c) =>
      c.replace(/^["']|["']$/g, "").trim(),
    );
    if (!cells.length) return;

    let anchorText = "";
    let sourceUrl = "";
    let targetUrl = "";
    let relRaw = "";
    let contextSnippet = "";

    if (hasHeader) {
      anchorText = cells[anchorIdx] || "";
      sourceUrl = sourceIdx >= 0 ? cells[sourceIdx] || "" : "";
      targetUrl = targetIdx >= 0 ? cells[targetIdx] || "" : "";
      relRaw = relIdx >= 0 ? cells[relIdx] || "" : "";
      contextSnippet = contextIdx >= 0 ? cells[contextIdx] || "" : "";
    } else if (cells.length === 1) {
      anchorText = cells[0];
    } else if (cells.length === 2) {
      // Heuristic: if cell 0 is a URL and cell 1 is not, cell 0 = sourceUrl, cell 1 = anchorText
      if (/^https?:\/\//i.test(cells[0]) && !/^https?:\/\//i.test(cells[1])) {
        sourceUrl = cells[0];
        anchorText = cells[1];
      } else {
        anchorText = cells[0];
        sourceUrl = cells[1];
      }
    } else {
      anchorText = cells[0];
      sourceUrl = cells[1] || "";
      targetUrl = cells[2] || "";
      relRaw = cells[3] || "";
      contextSnippet = cells[4] || "";
    }

    if (!anchorText && !sourceUrl) return;
    const isImageLink = /^\[image:/i.test(anchorText);
    const relTokens = relRaw
      .toLowerCase()
      .split(/[\s,;]+/)
      .filter(Boolean);
    if (relRaw.toLowerCase() === "true" || relRaw.toLowerCase() === "yes") {
      relTokens.push("nofollow");
    }

    const classified = classifyAnchor({
      anchorText: anchorText || "[Empty anchor]",
      isImageLink,
      targetDomain: options.targetDomain,
      brandTerms: options.brandTerms,
      targetKeywords: options.targetKeywords,
    });

    rows.push({
      id: `row-${idx + 1}`,
      sourceUrl: sourceUrl || `Entry #${idx + 1}`,
      targetUrl: targetUrl || options.targetDomain || "—",
      anchorText: anchorText || "[Empty anchor]",
      normalizedAnchor: normalizeText(anchorText) || "[empty anchor]",
      category: classified.category,
      matchedKeyword: classified.matchedKeyword,
      followStatus: inferFollowStatus(relTokens),
      relTokens,
      zone: "imported-row",
      isInternal: false,
      isImageLink,
      contextSnippet: contextSnippet || "Imported from backlink table / CSV",
    });
  });

  if (dataLines.length > 1500) {
    notes.push("Truncated at 1,500 rows to keep browser inspection responsive.");
  }

  return { rows, notes };
}

export function buildAnchorAnalysisReport(params: {
  mode: "csv" | "live" | "html";
  profile: PageBenchmarkProfile;
  targetDomain: string;
  brandTerms: string[];
  targetKeywords: string[];
  rows: AnchorRow[];
  notes?: string[];
}): AnchorAnalysisReport {
  const { mode, profile, targetDomain, brandTerms, targetKeywords, rows } =
    params;
  const totalLinks = rows.length;
  const benchmark = BENCHMARK_PROFILES[profile];

  const categoryOrder: AnchorCategory[] = [
    "branded",
    "naked-url",
    "brand-keyword",
    "topical-natural",
    "partial-match",
    "exact-match",
    "generic",
    "image-empty",
  ];

  const categories: CategoryBreakdown[] = categoryOrder.map((category) => {
    const matching = rows.filter((r) => r.category === category);
    const count = matching.length;
    const percentage =
      totalLinks > 0 ? Math.round((count / totalLinks) * 1000) / 10 : 0;
    const dofollowCount = matching.filter(
      (r) => r.followStatus === "dofollow",
    ).length;
    const [recommendedMin, recommendedMax] = benchmark.ranges[category];
    const status =
      percentage > recommendedMax
        ? "above-target"
        : percentage < recommendedMin
          ? "below-target"
          : "within-target";
    const sampleAnchors = Array.from(
      new Set(matching.map((m) => m.anchorText)),
    ).slice(0, 4);

    return {
      category,
      label: CATEGORY_META[category].label,
      description: CATEGORY_META[category].description,
      count,
      percentage,
      dofollowCount,
      recommendedMin,
      recommendedMax,
      status,
      sampleAnchors,
    };
  });

  // Group repeated anchors
  const grouped = new Map<
    string,
    {
      display: string;
      category: AnchorCategory;
      count: number;
      sources: Set<string>;
      dofollowCount: number;
    }
  >();

  for (const row of rows) {
    const key = row.normalizedAnchor || row.anchorText.toLowerCase();
    const existing = grouped.get(key);
    if (existing) {
      existing.count++;
      existing.sources.add(row.sourceUrl);
      if (row.followStatus === "dofollow") existing.dofollowCount++;
    } else {
      grouped.set(key, {
        display: row.anchorText,
        category: row.category,
        count: 1,
        sources: new Set([row.sourceUrl]),
        dofollowCount: row.followStatus === "dofollow" ? 1 : 0,
      });
    }
  }

  const repeatedAnchors: RepeatedAnchorItem[] = [...grouped.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
    .map((item) => {
      const pct =
        totalLinks > 0 ? Math.round((item.count / totalLinks) * 1000) / 10 : 0;
      let riskNote = "Natural repetition level";
      if (
        item.category === "exact-match" &&
        item.count >= 3 &&
        pct > 8
      ) {
        riskNote = "Over-repeated exact-match keyword footprint";
      } else if (
        item.category === "partial-match" &&
        item.count >= 4 &&
        pct > 15
      ) {
        riskNote = "Repeated commercial phrase — vary wording";
      } else if (item.count >= 5 && item.category === "generic") {
        riskNote = "Repeated generic CTA — low topical context";
      }
      return {
        anchor: item.display,
        category: item.category,
        count: item.count,
        percentage: pct,
        uniqueSources: item.sources.size,
        dofollowCount: item.dofollowCount,
        riskNote,
      };
    });

  // Compute Shannon diversity + benchmark compliance score (0-100)
  const uniqueAnchors = grouped.size;
  const uniqueSources = new Set(rows.map((r) => r.sourceUrl)).size;

  const exactPct =
    categories.find((c) => c.category === "exact-match")?.percentage ?? 0;
  const partialPct =
    categories.find((c) => c.category === "partial-match")?.percentage ?? 0;
  const brandedPct =
    (categories.find((c) => c.category === "branded")?.percentage ?? 0) +
    (categories.find((c) => c.category === "naked-url")?.percentage ?? 0) +
    (categories.find((c) => c.category === "brand-keyword")?.percentage ?? 0);
  const imageEmptyPct =
    categories.find((c) => c.category === "image-empty")?.percentage ?? 0;

  const exactMax = benchmark.ranges["exact-match"][1];
  let score = 88;
  if (exactPct > exactMax * 2) score -= 35;
  else if (exactPct > exactMax) score -= 18;
  if (exactPct + partialPct > 55) score -= 20;
  if (brandedPct < 20 && totalLinks >= 5) score -= 15;
  if (imageEmptyPct > 20) score -= 10;
  if (totalLinks >= 6 && uniqueAnchors / totalLinks < 0.4) score -= 12;
  const diversityScore = Math.max(12, Math.min(98, Math.round(score)));

  const riskLevel: "low" | "moderate" | "high" =
    exactPct > exactMax * 1.8 || exactPct + partialPct > 60 || diversityScore < 55
      ? "high"
      : exactPct > exactMax || brandedPct < 22 || diversityScore < 74
        ? "moderate"
        : "low";

  // Build actionable findings
  const findings: RiskFinding[] = [];
  if (exactPct > exactMax) {
    findings.push({
      id: "exact-match-excess",
      severity: exactPct > exactMax * 1.8 ? "high" : "medium",
      title: `Exact-match anchors represent ${exactPct}% of analyzed links (recommended ≤${exactMax}% for ${benchmark.name})`,
      detail: `A high concentration of exact-match keyword anchors (${categories.find((c) => c.category === "exact-match")?.count || 0} of ${totalLinks} links) creates an unnatural link footprint.`,
      recommendation:
        "Pause exact-match anchor placements and dilute the profile using Branded, Naked URL, and Brand + Topic phrases on your next placements.",
    });
  } else {
    findings.push({
      id: "exact-match-safe",
      severity: "good",
      title: `Exact-match keyword ratio is within safe bounds (${exactPct}% vs ≤${exactMax}% target)`,
      detail:
        "Your analyzed link set avoids aggressive exact-match keyword stuffing.",
      recommendation:
        "Maintain this balance by reserving exact-match anchors only for high-relevance editorial citations.",
    });
  }

  if (brandedPct < 25 && totalLinks >= 4) {
    findings.push({
      id: "low-brand-footprint",
      severity: "medium",
      title: `Low Brand + Naked URL foundation (${Math.round(brandedPct * 10) / 10}% combined)`,
      detail:
        "Natural backlink profiles rely on Branded, Brand + Keyword, and Naked URL links as a trust baseline.",
      recommendation:
        "Prioritize branded mentions, homepage citations, and author-bio or directory links using your brand name or raw URL.",
    });
  } else if (totalLinks >= 4) {
    findings.push({
      id: "healthy-brand-footprint",
      severity: "good",
      title: `Strong Brand & URL anchor foundation (${Math.round(brandedPct * 10) / 10}% combined)`,
      detail:
        "Branded, Brand + Keyword, and Naked URL anchors provide a natural authority baseline.",
      recommendation:
        "Continue pairing brand citations with descriptive topical phrases in body paragraphs.",
    });
  }

  const repeatedExact = repeatedAnchors.find(
    (item) => item.category === "exact-match" && item.count >= 3,
  );
  if (repeatedExact) {
    findings.push({
      id: "repeated-exact-footprint",
      severity: "high",
      title: `Identical exact-match anchor "${repeatedExact.anchor}" repeated ${repeatedExact.count} times`,
      detail: `Repeating the exact same commercial phrase across ${repeatedExact.uniqueSources} source(s) is one of the easiest manipulative link patterns for search engines to flag.`,
      recommendation:
        "Never reuse identical keyword anchors across multiple guest posts or link insertions; vary word order and surrounding context.",
    });
  }

  if (imageEmptyPct > 15) {
    findings.push({
      id: "missing-alt-anchors",
      severity: "medium",
      title: `${imageEmptyPct}% of analyzed links are image or empty anchors`,
      detail:
        "For image links, search engines use the image alt attribute as the anchor text. Blank alt attributes pass weak topical context.",
      recommendation:
        "Ensure linked badges, logos, or infographics include descriptive alt text.",
    });
  }

  // Build concrete Anchor Diversification Plan
  const brandSample =
    brandTerms[0] ||
    targetDomain
      .replace(/^https?:\/\/|^www\./g, "")
      .split("/")[0]
      .split(".")[0] ||
    "YourBrand";
  const domainSample =
    targetDomain.replace(/^https?:\/\//i, "").replace(/\/$/, "") ||
    "yourwebsite.com";
  const primaryKw = targetKeywords[0] || "your target topic";
  const secondaryKw = targetKeywords[1] || `${primaryKw} guide`;

  const diversificationPlan: DiversificationSuggestion[] = [
    {
      category: "branded",
      categoryLabel: "Branded Anchors",
      recommendedNextCount: Math.max(
        2,
        Math.ceil((totalLinks || 10) * 0.25) -
          (categories.find((c) => c.category === "branded")?.count || 0),
      ),
      rationale:
        "Reinforces entity recognition and dilutes commercial keyword density safely.",
      examples: [
        brandSample,
        `${brandSample} team`,
        `according to ${brandSample}`,
        `published by ${brandSample}`,
      ],
    },
    {
      category: "brand-keyword",
      categoryLabel: "Brand + Topic Hybrid Anchors",
      recommendedNextCount: Math.max(
        2,
        Math.ceil((totalLinks || 10) * 0.15) -
          (categories.find((c) => c.category === "brand-keyword")?.count || 0),
      ),
      rationale:
        "Connects your brand entity directly to your core topic without triggering exact-match spam filters.",
      examples: [
        `${brandSample}'s ${primaryKw} workflow`,
        `${primaryKw} research from ${brandSample}`,
        `${brandSample} ${secondaryKw}`,
      ],
    },
    {
      category: "partial-match",
      categoryLabel: "Partial & Semantic Variation Anchors",
      recommendedNextCount: Math.max(1, Math.ceil((totalLinks || 10) * 0.15)),
      rationale:
        "Passes topical relevance using natural multi-word variations instead of rigid exact keywords.",
      examples: [
        `practical guide to ${primaryKw}`,
        `how teams approach ${primaryKw}`,
        `comparing ${secondaryKw} options`,
      ],
    },
    {
      category: "naked-url",
      categoryLabel: "Naked URL & Citation Anchors",
      recommendedNextCount: Math.max(
        1,
        Math.ceil((totalLinks || 10) * 0.15) -
          (categories.find((c) => c.category === "naked-url")?.count || 0),
      ),
      rationale:
        "Every organic backlink profile includes bare URLs in resource lists, footnotes, and references.",
      examples: [
        `https://${domainSample}`,
        domainSample,
        `www.${domainSample.replace(/^www\./, "")}`,
      ],
    },
  ];

  return {
    mode,
    profile,
    targetDomain,
    brandTerms,
    targetKeywords,
    totalLinks,
    dofollowLinks: rows.filter((r) => r.followStatus === "dofollow").length,
    nofollowLinks: rows.filter((r) => r.followStatus === "nofollow").length,
    sponsoredLinks: rows.filter((r) => r.followStatus === "sponsored").length,
    ugcLinks: rows.filter((r) => r.followStatus === "ugc").length,
    uniqueAnchors,
    uniqueSources,
    diversityScore,
    riskLevel,
    categories,
    repeatedAnchors,
    findings,
    diversificationPlan,
    rows,
    notes: params.notes || [],
    analyzedAt: new Date().toISOString(),
  };
}

export function exportAnchorRowsCsv(report: AnchorAnalysisReport): string {
  const esc = (val: string | number) =>
    `"${String(val ?? "").replace(/"/g, '""')}"`;
  const headers = [
    "Row ID",
    "Anchor Text",
    "Category",
    "Matched Keyword",
    "Follow Status",
    "Rel Attributes",
    "Placement Zone",
    "Source URL",
    "Target URL",
    "Context Snippet",
  ];
  const lines = [
    headers.map(esc).join(","),
    ...report.rows.map((r) =>
      [
        r.id,
        r.anchorText,
        CATEGORY_META[r.category].label,
        r.matchedKeyword || "",
        r.followStatus,
        r.relTokens.join(" "),
        r.zone,
        r.sourceUrl,
        r.targetUrl,
        r.contextSnippet,
      ]
        .map(esc)
        .join(","),
    ),
  ];
  return lines.join("\r\n");
}

export function exportAnchorSummaryCsv(report: AnchorAnalysisReport): string {
  const esc = (val: string | number) =>
    `"${String(val ?? "").replace(/"/g, '""')}"`;
  const headers = [
    "Anchor Category",
    "Link Count",
    "Observed Share (%)",
    "Dofollow Count",
    "Recommended Min (%)",
    "Recommended Max (%)",
    "Benchmark Status",
    "Sample Anchors",
  ];
  const lines = [
    headers.map(esc).join(","),
    ...report.categories.map((c) =>
      [
        c.label,
        c.count,
        c.percentage,
        c.dofollowCount,
        c.recommendedMin,
        c.recommendedMax,
        c.status,
        c.sampleAnchors.join(" | "),
      ]
        .map(esc)
        .join(","),
    ),
  ];
  return lines.join("\r\n");
}

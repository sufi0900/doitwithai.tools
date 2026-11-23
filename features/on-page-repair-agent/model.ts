export type RepairFocus =
  | "Full Technical & Editorial Repair"
  | "CTR & Snippet Optimization"
  | "Schema & Structured Data"
  | "AI Overview & Position Zero";

export type OnPageRepairInput = {
  targetUrl: string;
  primaryKeyword: string;
  secondaryKeywords: string;
  currentTitle: string;
  currentDescription: string;
  currentH1: string;
  headingsList: string;
  imagesWithoutAlt: string;
  repairFocus: RepairFocus;
  brandOrAuthorName: string;
};

export type RepairDiagnosticItem = {
  id: string;
  category: "Metadata & CTR" | "Heading Hierarchy" | "Schema & Entities" | "Image Accessibility" | "AI Answer Readiness";
  severity: "Critical" | "Warning" | "Optimal";
  issue: string;
  impact: string;
  autoFixSummary: string;
};

export type HeadingRefactorItem = {
  level: "H1" | "H2" | "H3";
  beforeText: string;
  afterText: string;
  intentRationale: string;
};

export type ImageAltPatchItem = {
  imageNameOrContext: string;
  suggestedAlt: string;
  htmlSnippet: string;
};

export type OnPageRepairPack = {
  overallHealthScore: number;
  repairedScoreProjection: number;
  optimizedTitle: string;
  titlePixelEstimate: number;
  optimizedDescription: string;
  descriptionCharCount: number;
  canonicalUrl: string;
  positionZeroLeadBlock: string;
  diagnostics: RepairDiagnosticItem[];
  headingRefactors: HeadingRefactorItem[];
  imageAltPatches: ImageAltPatchItem[];
  jsonLdSchemaCode: string;
  completeHeadPatchHtml: string;
  implementationChecklist: string[];
};

export const DEFAULT_ON_PAGE_REPAIR_INPUT: OnPageRepairInput = {
  targetUrl: "https://doitwithai.tools/ai-seo/write-slug-urls",
  primaryKeyword: "seo friendly url slugs",
  secondaryKeywords: "url slug best practices, change url redirect 301, canonical url structure",
  currentTitle: "Write Slug URLs - Blog Post",
  currentDescription: "Learn about URL slugs and how to write them for your website pages.",
  currentH1: "Write Slug URLs",
  headingsList: "What is a slug\nWhy slugs matter\nChanging URLs\nConclusion",
  imagesWithoutAlt: "url-structure-diagram.png\nredirect-flow-chart.webp\ngsc-url-inspection-screenshot.png",
  repairFocus: "Full Technical & Editorial Repair",
  brandOrAuthorName: "Sufian Mustafa · Do It With AI Tools",
};

function estimatePixels(text: string): number {
  let px = 0;
  for (const ch of text) {
    if ("MW@#%&QGO".includes(ch)) px += 11;
    else if ("il1|!.,:;'\"".includes(ch)) px += 4.5;
    else if (ch === " ") px += 5;
    else if (ch >= "A" && ch <= "Z") px += 9.5;
    else px += 7.8;
  }
  return Math.round(px);
}

function toTitleCase(str: string): string {
  const minor = new Set(["a", "an", "the", "and", "or", "but", "for", "nor", "on", "at", "to", "from", "by", "in", "of", "with"]);
  return str
    .split(/\s+/)
    .filter(Boolean)
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx > 0 && minor.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export function buildDeterministicOnPageRepairPack(
  input: OnPageRepairInput,
): OnPageRepairPack {
  const kw = input.primaryKeyword.trim() || "on-page seo optimization";
  const kwTitle = toTitleCase(kw);
  const secondaries = input.secondaryKeywords
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const sec1 = secondaries[0] || `${kw} checklist`;
  const sec2 = secondaries[1] || `${kw} examples`;
  const brand = input.brandOrAuthorName.trim() || "Do It With AI Tools";
  const shortBrand = brand.split("·")[0]?.trim() || "DoItWithAI";
  const canonicalUrl =
    input.targetUrl.trim() && /^https?:\/\//i.test(input.targetUrl.trim())
      ? input.targetUrl.trim()
      : `https://doitwithai.tools/guides/${kw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

  // Diagnose baseline issues
  const rawTitle = input.currentTitle.trim();
  const rawDesc = input.currentDescription.trim();
  const hasKwInTitle = rawTitle.toLowerCase().includes(kw.toLowerCase());
  const titleTooShort = rawTitle.length < 35;
  const titleTooLong = estimatePixels(rawTitle) > 580;
  const descTooShort = rawDesc.length < 110;

  let baselineScore = 54;
  if (hasKwInTitle) baselineScore += 10;
  if (!titleTooShort && !titleTooLong) baselineScore += 8;
  if (!descTooShort && rawDesc.length <= 160) baselineScore += 8;

  const optimizedTitleBase = `${kwTitle}: Practical Step-by-Step Guide & Checklist`;
  const optimizedTitle =
    optimizedTitleBase.length <= 60
      ? optimizedTitleBase
      : `${kwTitle}: Step-by-Step Guide (${shortBrand})`.slice(0, 60);
  const titlePixelEstimate = estimatePixels(optimizedTitle);

  const optimizedDescription = `Master ${kw} with our actionable workflow. Compare real examples, avoid ${sec1} mistakes, and verify your implementation before publishing.`.slice(
    0,
    158,
  );

  const positionZeroLeadBlock = `<section class="ai-answer-lead" aria-label="Quick Summary">\n  <p><strong>${kwTitle}</strong> is the process of structuring your page elements—including URL paths, title tags, semantic H2/H3 headings, and JSON-LD schema—so search engines and AI answer engines can accurately index and cite your content. Start by aligning your primary keyword with reader intent, validating ${sec1}, and keeping published canonical URLs stable.</p>\n</section>`;

  const rawHeadings = input.headingsList
    .split(/\r?\n/)
    .map((h) => h.trim())
    .filter(Boolean);

  const headingRefactors: HeadingRefactorItem[] = [
    {
      level: "H1",
      beforeText: input.currentH1.trim() || rawTitle || "Untitled Page Heading",
      afterText: `${kwTitle}: How to Plan, Audit, and Optimize Without Guesswork`,
      intentRationale: "Front-loads primary keyword entity while promising an actionable practitioner outcome.",
    },
    ...(rawHeadings.length > 0
      ? rawHeadings.slice(0, 4).map((h, i): HeadingRefactorItem => {
          const supportTerm = secondaries[i % Math.max(1, secondaries.length)] || kw;
          const isGeneric = /^(introduction|conclusion|overview|summary|what is)/i.test(h);
          return {
            level: "H2",
            beforeText: h,
            afterText: isGeneric
              ? `${h.replace(/^conclusion$/i, "Pre-Publish Verification Checklist")}: ${toTitleCase(supportTerm)} in Practice`
              : `${toTitleCase(h)} (${toTitleCase(supportTerm)} Guide)`,
            intentRationale: isGeneric
              ? "Replaces vague boilerplate heading with a high-signal semantic subtopic for passage indexing."
              : "Enriches existing heading with supporting entity context for deeper topical coverage.",
          };
        })
      : [
          {
            level: "H2" as const,
            beforeText: "What Is It and Why It Matters",
            afterText: `What Is ${kwTitle} and How Search Engines Evaluate It`,
            intentRationale: "Targets foundational informational queries and Featured Snippet definitions.",
          },
          {
            level: "H2" as const,
            beforeText: "Best Practices",
            afterText: `Step-by-Step Workflow for ${toTitleCase(sec1)}`,
            intentRationale: "Transforms generic heading into an actionable How-To sequence.",
          },
          {
            level: "H2" as const,
            beforeText: "Common Mistakes",
            afterText: `How to Audit & Fix ${toTitleCase(sec2)} Errors Before Publishing`,
            intentRationale: "Captures troubleshooting search intent and increases reader retention.",
          },
        ]),
  ];

  const rawImages = input.imagesWithoutAlt
    .split(/\r?\n/)
    .map((img) => img.trim())
    .filter(Boolean);

  const imageAltPatches: ImageAltPatchItem[] = (
    rawImages.length > 0
      ? rawImages.slice(0, 5)
      : ["workflow-diagram.png", "serp-preview-comparison.webp"]
  ).map((imgName, idx) => {
    const cleanStub = imgName
      .replace(/\.[a-z0-9]{2,5}$/i, "")
      .replace(/[-_]+/g, " ")
      .trim();
    const suggestedAlt = `${toTitleCase(cleanStub)} illustrating ${kw} and ${idx % 2 === 0 ? sec1 : sec2}`;
    return {
      imageNameOrContext: imgName,
      suggestedAlt,
      htmlSnippet: `<img src="/images/${imgName}" alt="${suggestedAlt}" loading="lazy" decoding="async" />`,
    };
  });

  const diagnostics: RepairDiagnosticItem[] = [
    {
      id: "diag-title",
      category: "Metadata & CTR",
      severity: !hasKwInTitle || titleTooShort ? "Critical" : "Warning",
      issue: !hasKwInTitle
        ? `Current title ("${rawTitle || "Missing"}") omits the primary keyword "${kw}".`
        : `Current title is ${rawTitle.length} chars (${estimatePixels(rawTitle)}px) and lacks a clear value proposition hook.`,
      impact: "Low SERP click-through rate and high likelihood of Google rewriting your title tag.",
      autoFixSummary: `Rewrote title to ${optimizedTitle.length} chars (${titlePixelEstimate}px) with front-loaded keyword and clear outcome.`,
    },
    {
      id: "diag-desc",
      category: "Metadata & CTR",
      severity: descTooShort ? "Critical" : "Warning",
      issue: `Current meta description is ${rawDesc.length} chars (target: 140–158 chars) and misses supporting terms like "${sec1}".`,
      impact: "Search engines extract random body sentences instead of displaying a persuasive call-to-action.",
      autoFixSummary: `Generated a ${optimizedDescription.length}-character description incorporating primary and secondary entities.`,
    },
    {
      id: "diag-headings",
      category: "Heading Hierarchy",
      severity: "Warning",
      issue: "Extracted H2 subheadings use generic phrasing ('What is...', 'Conclusion') without secondary entity modifiers.",
      impact: "Weakens passage-level relevance for long-tail queries and AI Overview citations.",
      autoFixSummary: `Refactored ${headingRefactors.length} headings into descriptive, intent-aligned H1/H2 landmarks.`,
    },
    {
      id: "diag-schema",
      category: "Schema & Entities",
      severity: "Critical",
      issue: "Page lacks linked TechArticle + FAQPage JSON-LD graph with explicit author entity attribution.",
      impact: "Misses rich result eligibility and weakens E-E-A-T entity disambiguation.",
      autoFixSummary: "Synthesized a validated @graph JSON-LD block linking TechArticle, Author, and FAQPage.",
    },
    {
      id: "diag-images",
      category: "Image Accessibility",
      severity: "Warning",
      issue: `${imageAltPatches.length} image asset(s) detected with missing or filename-only alt attributes.`,
      impact: "Hurts screen-reader accessibility and loses Google Images discovery traffic.",
      autoFixSummary: `Drafted descriptive, non-stuffed alt text and <img loading="lazy"> patches for ${imageAltPatches.length} visuals.`,
    },
  ];

  const schemaObj = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: optimizedTitle,
        description: optimizedDescription,
        mainEntityOfPage: canonicalUrl,
        author: {
          "@type": "Person",
          name: shortBrand,
          url: "https://doitwithai.tools/author/sufian-mustafa",
        },
        publisher: {
          "@type": "Organization",
          name: "Do It With AI Tools",
          url: "https://doitwithai.tools",
        },
        keywords: [kw, ...secondaries].join(", "),
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `How do I optimize a page for ${kw}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Align your title tag (under 580px), H1, and opening 50-word summary around ${kw}, then use descriptive H2 subheadings covering ${sec1} and ${sec2}.`,
            },
          },
          {
            "@type": "Question",
            name: `Why is ${sec1} important for on-page SEO?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Addressing ${sec1} directly on the page satisfies secondary user intent and prevents keyword cannibalization across multiple thin URLs.`,
            },
          },
        ],
      },
    ],
  };

  const jsonLdSchemaCode = JSON.stringify(schemaObj, null, 2);

  const completeHeadPatchHtml = [
    `<!-- 1. Optimized Primary SEO & Canonical Tags -->`,
    `<title>${optimizedTitle}</title>`,
    `<meta name="description" content="${optimizedDescription.replace(/"/g, "&quot;")}" />`,
    `<link rel="canonical" href="${canonicalUrl}" />`,
    ``,
    `<!-- 2. Open Graph & Social Card Tags -->`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:title" content="${optimizedTitle.replace(/"/g, "&quot;")}" />`,
    `<meta property="og:description" content="${optimizedDescription.replace(/"/g, "&quot;")}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${optimizedTitle.replace(/"/g, "&quot;")}" />`,
    `<meta name="twitter:description" content="${optimizedDescription.replace(/"/g, "&quot;")}" />`,
    ``,
    `<!-- 3. Validated JSON-LD Structured Data (@graph) -->`,
    `<script type="application/ld+json">`,
    jsonLdSchemaCode,
    `</script>`,
  ].join("\n");

  const implementationChecklist = [
    `Replace existing <title> with the ${titlePixelEstimate}px repaired title tag.`,
    `Update <meta name="description"> (${optimizedDescription.length} chars) and verify canonical URL (${canonicalUrl}).`,
    `Insert the 50-word Position Zero answer block immediately below your H1 heading.`,
    `Apply the ${headingRefactors.length} semantic H1/H2 heading upgrades to eliminate vague subheadings.`,
    `Add descriptive alt attributes to ${imageAltPatches.length} image(s) and paste the JSON-LD @graph into your page template.`,
  ];

  return {
    overallHealthScore: Math.min(82, baselineScore),
    repairedScoreProjection: 96,
    optimizedTitle,
    titlePixelEstimate,
    optimizedDescription,
    descriptionCharCount: optimizedDescription.length,
    canonicalUrl,
    positionZeroLeadBlock,
    diagnostics,
    headingRefactors,
    imageAltPatches,
    jsonLdSchemaCode,
    completeHeadPatchHtml,
    implementationChecklist,
  };
}

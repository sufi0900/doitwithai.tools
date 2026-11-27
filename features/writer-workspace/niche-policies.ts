import type { BlogSectionNode } from "@/lib/blog-writer/canonical-state";
import type {
  BrandVoiceProfile,
  CanonicalBriefContract,
  ClaimVerificationEntry,
  ContentArchetypeId,
  InternalCapabilityRecord,
  NicheDomainId,
  Project,
  ResearchCompetitorBenchmarks,
  ResearchLinkItem,
  VerificationLogReport,
} from "./types";

type ArchetypePolicy = {
  id: ContentArchetypeId;
  label: string;
  minWords: number;
  maxWords: number;
  recommendedWords: number;
  defaultTone: string;
  requiredAssets: string[];
};

const ARCHETYPE_POLICIES: Record<ContentArchetypeId, ArchetypePolicy> = {
  "how-to-tutorial": {
    id: "how-to-tutorial",
    label: "Actionable How-To & Workflow Guide",
    minWords: 1750,
    maxWords: 3200,
    recommendedWords: 2400,
    defaultTone: "Authoritative & Practical",
    requiredAssets: [
      "Clear prerequisites and exact data/tool inputs (e.g., exact CSV/report column names where applicable)",
      "Step-by-step execution workflow with copyable prompts, templates, or concrete commands when helpful",
      "Decision criteria matrix comparing options and when NOT to act",
      "At least one worked counterexample or edge case plus a post-change verification checklist",
    ],
  },
  "comparison-versus": {
    id: "comparison-versus",
    label: "Side-by-Side Comparison & Decision Guide",
    minWords: 1650,
    maxWords: 2800,
    recommendedWords: 2150,
    defaultTone: "Analytical & Objective",
    requiredAssets: [
      "Explicit evaluation criteria stated before scoring options",
      "Concrete Markdown comparison table with factual capabilities and real constraints (zero vague placeholder labels)",
      "Context-dependent verdict ('Choose X if... / Choose Y if...') with version or pricing date qualifier",
    ],
  },
  "listicle-roundup": {
    id: "listicle-roundup",
    label: "Curated Tools / Options Roundup",
    minWords: 1500,
    maxWords: 2600,
    recommendedWords: 1950,
    defaultTone: "Authoritative & Practical",
    requiredAssets: [
      "Upfront selection methodology and inclusion boundaries",
      "Consistent per-item rubric covering best use case, verified strength, and honest limitation",
      "Quick scannable comparison table for fast selection",
    ],
  },
  "news-update": {
    id: "news-update",
    label: "News & Industry Update Analysis",
    minWords: 650,
    maxWords: 1200,
    recommendedWords: 900,
    defaultTone: "Crisp & Journalistic",
    requiredAssets: [
      "Inverted-pyramid lead stating what happened, who confirmed it, and date in paragraph 1",
      "Explicit separation between verified primary-source facts and unconfirmed industry implications",
      "Practical next steps or impact checklist for affected readers",
    ],
  },
  "conceptual-explainer": {
    id: "conceptual-explainer",
    label: "Deep Conceptual Explainer",
    minWords: 1150,
    maxWords: 2050,
    recommendedWords: 1550,
    defaultTone: "Clear & Educator-Led",
    requiredAssets: [
      "Plain-English mental model in the first 60 words",
      "Concrete mechanism walkthrough + real-world analogy or example",
      "Common misconceptions and clear scope boundaries",
    ],
  },
  "product-review": {
    id: "product-review",
    label: "Independent Product / Method Review",
    minWords: 1350,
    maxWords: 2350,
    recommendedWords: 1800,
    defaultTone: "Balanced & Transparent",
    requiredAssets: [
      "Transparent scope disclosure separating documented capabilities from hands-on observations",
      "Verified pros, real tradeoffs/limitations, and alternative options by buyer type",
    ],
  },
  "opinion-essay": {
    id: "opinion-essay",
    label: "Strategic Opinion & Perspective",
    minWords: 900,
    maxWords: 1650,
    recommendedWords: 1250,
    defaultTone: "Direct & Thoughtful",
    requiredAssets: [
      "Clear central thesis supported by grounded evidence",
      "Steelmanned counterargument explaining when the opposite view holds",
      "Actionable strategic takeaway",
    ],
  },
};

type NichePolicy = {
  id: NicheDomainId;
  label: string;
  editorialStrictness: CanonicalBriefContract["editorialStrictness"];
  toneHint: string;
  requiredQualifiers: string[];
  prohibitedClaims: string[];
};

const NICHE_POLICIES: Record<NicheDomainId, NichePolicy> = {
  "seo-marketing": {
    id: "seo-marketing",
    label: "SEO & Digital Marketing",
    editorialStrictness: "strict",
    toneHint: "Practitioner-led & Evidence-Grounded",
    requiredQualifiers: [
      "Distinguish official search engine documentation from practitioner heuristics",
      "Name exact Google Search Console reports accurately (Performance report for queries/pages/impressions vs Page Indexing for index status)",
      "Clarify URL/redirect mechanics accurately (rewriting content on the same URL keeps backlinks; changing URLs without redirects risks losing link equity)",
    ],
    prohibitedClaims: [
      "Invented fixed rank-threshold rules (e.g. 'hover around positions 8 to 20' stated as universal truth)",
      "Conflating Index Coverage / Page Indexing with the Performance report for query impressions",
      "Overclaiming vector embeddings compute 'exact conceptual distance'",
      "Guaranteeing #1 rankings or traffic multipliers",
    ],
  },
  "software-dev": {
    id: "software-dev",
    label: "Software Engineering & AI Tech",
    editorialStrictness: "strict",
    toneHint: "Technical, Precise & Practical",
    requiredQualifiers: [
      "Specify framework/API version, prerequisites, and edge-case failure modes",
      "Use accurate terminology for APIs, schemas, embeddings, and evaluation checks",
    ],
    prohibitedClaims: [
      "Invented CLI flags, undocumented SDK parameters, or fabricated latency benchmarks",
    ],
  },
  "health-medical": {
    id: "health-medical",
    label: "Health & Medical (YMYL)",
    editorialStrictness: "maximum",
    toneHint: "Calm, Empathetic & Clinical-Evidence-Led",
    requiredQualifiers: [
      "Include non-diagnostic guidance qualifier ('Consult a licensed clinician for individualized medical decisions')",
      "Separate established clinical consensus from emerging or limited evidence",
    ],
    prohibitedClaims: [
      "Uncited dosage regimens, guaranteed cure claims, or fabricated clinical trial percentages",
    ],
  },
  "finance-tax": {
    id: "finance-tax",
    label: "Finance, Tax & Investing (YMYL)",
    editorialStrictness: "maximum",
    toneHint: "Measured, Clear & Jurisdiction-Aware",
    requiredQualifiers: [
      "State jurisdiction and tax/regulatory year context clearly",
      "Label worked calculations as illustrative scenarios and include non-personalized financial disclaimer",
    ],
    prohibitedClaims: [
      "Guaranteed investment returns or unqualified statutory tax advice",
    ],
  },
  "legal-compliance": {
    id: "legal-compliance",
    label: "Legal & Compliance (YMYL)",
    editorialStrictness: "maximum",
    toneHint: "Precise, Objective & Jurisdiction-Specific",
    requiredQualifiers: [
      "Specify applicable jurisdiction/regulation and note this is informational rather than formal legal counsel",
    ],
    prohibitedClaims: [
      "Fabricated statute citations or treating single-country regulations as universal global law",
    ],
  },
  "gardening-home": {
    id: "gardening-home",
    label: "Gardening, Home & Lifestyle",
    editorialStrictness: "high",
    toneHint: "Warm, Encouraging & Practical",
    requiredQualifiers: [
      "Note regional climate, hardiness/sunlight, soil drainage, or seasonal dependencies where care varies",
    ],
    prohibitedClaims: [
      "One-size-fits-all bloom/harvest guarantees or fabricated botanical timings",
    ],
  },
  "travel-local": {
    id: "travel-local",
    label: "Travel & Local Guides",
    editorialStrictness: "high",
    toneHint: "Engaging, Helpful & Logistics-Minded",
    requiredQualifiers: [
      "Note seasonal variations and that prices, transit hours, and entry rules are subject to change",
    ],
    prohibitedClaims: [
      "Unverified exact ticket prices or guaranteed open hours presented as permanent",
    ],
  },
  "ecommerce-product": {
    id: "ecommerce-product",
    label: "E-Commerce & Buying Guides",
    editorialStrictness: "high",
    toneHint: "Helpful, Candid & Specification-Backed",
    requiredQualifiers: [
      "Disclose when insights are based on manufacturer specs or aggregated user feedback vs supplied first-hand testing",
    ],
    prohibitedClaims: [
      "Fabricated hands-on lab tests or unverified battery/durability metrics",
    ],
  },
  "entertainment-culture": {
    id: "entertainment-culture",
    label: "Entertainment, Media & Culture",
    editorialStrictness: "standard",
    toneHint: "Conversational, Sharp & Informed",
    requiredQualifiers: [
      "Separate verified release/credit facts from critical interpretation and flag major spoilers if applicable",
    ],
    prohibitedClaims: [
      "Hallucinated box-office figures, cast credits, or misattributed interviews",
    ],
  },
  "general-business": {
    id: "general-business",
    label: "Operations, Strategy & General",
    editorialStrictness: "high",
    toneHint: "Clear, Pragmatic & Reader-First",
    requiredQualifiers: [
      "Make assumptions, team-size constraints, and practical tradeoffs explicit",
    ],
    prohibitedClaims: [
      "Invented ROI percentages, fake customer case studies, or hollow corporate buzzwords",
    ],
  },
};

export const DOITWITHAI_CAPABILITY_CATALOG: InternalCapabilityRecord[] = [
  {
    url: "/tools/keyword-cannibalization-finder",
    title: "Keyword Cannibalization Finder",
    anchorText: "keyword cannibalization finder",
    pageType: "tool",
    verifiedCapabilities: [
      "Detect multiple internal pages competing for the same target query or topic overlap",
      "Highlight URL pairs splitting impressions, clicks, or relevance signals for remediation",
    ],
    supportedInputs: [
      "Target topic/keyword list or exported search/site page candidates",
    ],
    nonCapabilities: [
      "Does not merge PDFs or interview transcripts",
      "Does not automatically configure server-side 301 redirects",
    ],
    keywords:
      "keyword cannibalization duplicate intent competing urls overlapping pages gsc query page split",
  },
  {
    url: "/tools/gsc-striking-distance-finder",
    title: "GSC Striking Distance & Opportunity Finder",
    anchorText: "GSC striking-distance finder",
    pageType: "tool",
    verifiedCapabilities: [
      "Analyze Google Search Console query and page performance exports to prioritize optimization candidates",
    ],
    supportedInputs: ["GSC Performance query/page CSV data"],
    nonCapabilities: [
      "Does not crawl private intranet servers or replace canonical redirect planning",
    ],
    keywords:
      "google search console gsc csv query page impressions clicks ctr optimization",
  },
  {
    url: "/tools/on-page-ai-seo-analyzer",
    title: "On-Page AI SEO Analyzer",
    anchorText: "on-page AI SEO analyzer",
    pageType: "tool",
    verifiedCapabilities: [
      "Audit headings, page focus, copy structure, and on-page topical clarity on an existing page",
    ],
    supportedInputs: ["Public page URL or draft HTML/text"],
    nonCapabilities: [
      "Does not compute vector embeddings across an entire Search Console export",
    ],
    keywords:
      "on-page seo analyzer audit headings meta title canonical focus clarify page intent",
  },
  {
    url: "/tools/keyword-clustering-tool",
    title: "AI Keyword Clustering & Topic Map Tool",
    anchorText: "keyword clustering tool",
    pageType: "tool",
    verifiedCapabilities: [
      "Group raw keyword research lists into shared-intent topic clusters for planning future pages",
    ],
    supportedInputs: ["Keyword list / CSV"],
    nonCapabilities: [
      "Does not audit live URL-by-URL GSC query impression splits on existing pages",
      "Does not serve as a redirect or canonical merge tool",
    ],
    keywords:
      "keyword clustering topic map new content hubs topical authority semantic grouping",
  },
  {
    url: "/tools/internal-link-opportunity-finder",
    title: "Internal Link Opportunity Finder",
    anchorText: "internal link opportunity finder",
    pageType: "tool",
    verifiedCapabilities: [
      "Identify internal linking and anchor-text alignment opportunities between supporting and primary canonical pages",
    ],
    supportedInputs: ["Site URLs / topic targets"],
    nonCapabilities: [
      "Does not execute CMS redirects or delete duplicate pages",
    ],
    keywords:
      "internal links anchor text site architecture consolidate signals canonical page support",
  },
  {
    url: "/tools/content-decay-refresh-analyzer",
    title: "Content Decay & Refresh Analyzer",
    anchorText: "content refresh analyzer",
    pageType: "tool",
    verifiedCapabilities: [
      "Evaluate outdated or overlapping articles when deciding whether to refresh, differentiate, or update existing copy",
    ],
    supportedInputs: ["Existing article text or URL"],
    nonCapabilities: ["Does not perform Search Console CSV ingestion by itself"],
    keywords:
      "content refresh decay update consolidate rewrite differentiate existing article",
  },
  {
    url: "/tools/ai-citation-readiness-checker",
    title: "AI Citation & GEO Readiness Checker",
    anchorText: "AI citation readiness checker",
    pageType: "tool",
    verifiedCapabilities: [
      "Check how clearly a page answers user intent for generative search systems and AI citations",
    ],
    supportedInputs: ["Page URL or article text"],
    nonCapabilities: ["Does not inspect server logs or live Google Search Console accounts"],
    keywords:
      "ai seo geo aeo citation readiness ai overviews ai mode generative search",
  },
  {
    url: "/tools/schema-markup-generator",
    title: "Schema Markup & JSON-LD Generator",
    anchorText: "JSON-LD schema markup generator",
    pageType: "tool",
    verifiedCapabilities: [
      "Generate valid Article, FAQPage, or entity JSON-LD structured data templates",
    ],
    supportedInputs: ["Structured page fields"],
    nonCapabilities: ["Does not guarantee rich snippets"],
    keywords: "schema markup json-ld structured data article faqpage rich results",
  },
  {
    url: "/tools/readability-checker",
    title: "AI Readability & Clarity Checker",
    anchorText: "readability and clarity checker",
    pageType: "tool",
    verifiedCapabilities: [
      "Measure sentence length, readability ease, and dense multi-clause prose",
    ],
    supportedInputs: ["Draft text"],
    nonCapabilities: ["Does not verify factual accuracy or external citations"],
    keywords: "readability clarity flesch grade level sentence rhythm editorial polish",
  },
  {
    url: "/tools/serp-rich-result-preview-generator",
    title: "Google SERP & Rich Result Simulator",
    anchorText: "Google SERP preview simulator",
    pageType: "tool",
    verifiedCapabilities: [
      "Preview meta title and meta description pixel width truncation before publishing",
    ],
    supportedInputs: ["Meta title, meta description, URL slug"],
    nonCapabilities: ["Does not crawl live SERP competitors"],
    keywords: "serp preview meta title description pixel width ctr optimization",
  },
  {
    url: "/tools/search-intent-checker",
    title: "Search Intent & SERP Alignment Checker",
    anchorText: "search intent checker",
    pageType: "tool",
    verifiedCapabilities: [
      "Classify dominant query intent (informational, commercial, transactional, navigational) to separate overlapping page roles",
    ],
    supportedInputs: ["Target query or topic"],
    nonCapabilities: ["Does not replace live SERP inspection"],
    keywords: "search intent informational commercial transactional query intent differentiation",
  },
  {
    url: "/tools/source-pdf-to-article-generator",
    title: "Source, PDF, Interview & NotebookLM-to-Article Studio",
    anchorText: "source and PDF to article studio",
    pageType: "tool",
    verifiedCapabilities: [
      "Synthesize original articles from uploaded source notes, PDFs, or interview transcripts",
    ],
    supportedInputs: ["Source notes, PDFs, interview transcripts"],
    nonCapabilities: [
      "Does not merge competing cannibalized URLs, evaluate GSC performance exports, or manage 301 redirects",
    ],
    keywords: "pdf to article interview transcript notebooklm source synthesis",
  },
  {
    url: "/tools/eeat-content-auditor",
    title: "E-E-A-T & Evidence Auditor",
    anchorText: "E-E-A-T content auditor",
    pageType: "tool",
    verifiedCapabilities: [
      "Check draft transparency, qualifier coverage, and first-hand/evidence attribution hygiene",
    ],
    supportedInputs: ["Draft copy and references"],
    nonCapabilities: ["Does not browse external citations independently"],
    keywords: "eeat experience expertise authoritativeness trustworthiness audit review",
  },
  {
    url: "/ai-content-writer",
    title: "AI Content Writer & Publishing Studio",
    anchorText: "AI Content Writer Studio",
    pageType: "page",
    verifiedCapabilities: [
      "Draft, verify, and package structured long-form articles from grounded briefs",
    ],
    supportedInputs: ["Brief, outline, and optional connected website"],
    nonCapabilities: ["Does not execute live Search Console API pulls on its own"],
    keywords: "ai content writer article drafting studio editorial workflow",
  },
];

export function isSeoOrWebTopic(text: string): boolean {
  return /\b(seo|search console|gsc|serp|cannibalization|backlink|canonical|schema\.org|json-ld|llms\.txt|ai overview|geo|aeo|indexing|crawlability|internal link|keyword research|ranking)\b/i.test(
    text,
  );
}

export function detectContentArchetype(
  combinedText: string,
): ContentArchetypeId {
  const lower = combinedText.toLowerCase();
  if (
    /\b(vs\.?|versus|compare|comparison|difference between|which wins|alternative to)\b/i.test(
      lower,
    )
  ) {
    return "comparison-versus";
  }
  if (
    /\b(top \d+|best \d*|\d+ best|tools for|roundup|alternatives)\b/i.test(
      lower,
    )
  ) {
    return "listicle-roundup";
  }
  if (
    /\b(update|announced|announcement|releases|launched|breaking|march 202|2026 update|2027 update|news)\b/i.test(
      lower,
    ) &&
    !/\bhow to\b/i.test(lower)
  ) {
    return "news-update";
  }
  if (/\b(review|is .* worth it|pros and cons)\b/i.test(lower)) {
    return "product-review";
  }
  if (
    /\b(opinion|why .* broken|unpopular truth|hot take|future of)\b/i.test(
      lower,
    )
  ) {
    return "opinion-essay";
  }
  if (
    /\b(how to|fix|step[- ]by[- ]step|workflow|audit|setup|set up|troubleshoot|guide to|tutorial|build a)\b/i.test(
      lower,
    )
  ) {
    return "how-to-tutorial";
  }
  return "conceptual-explainer";
}

export function detectNicheDomain(combinedText: string): NicheDomainId {
  if (isSeoOrWebTopic(combinedText)) return "seo-marketing";
  if (
    /\b(typescript|javascript|python|react|next\.js|api|sdk|database|postgres|docker|kubernetes|cloudflare worker|llm prompt|rag|cli|code|github)\b/i.test(
      combinedText,
    )
  ) {
    return "software-dev";
  }
  if (
    /\b(symptom|treatment|dosage|medication|clinical|patient|disease|therapy|mental health|nutrition|supplement|diagnosis)\b/i.test(
      combinedText,
    )
  ) {
    return "health-medical";
  }
  if (
    /\b(tax|irs|hmrc|investing|portfolio|mortgage|credit score|retirement|401k|etf|stock|interest rate|accounting|invoice)\b/i.test(
      combinedText,
    )
  ) {
    return "finance-tax";
  }
  if (
    /\b(law|legal|gdpr|ccpa|compliance|statute|contract|liability|copyright|trademark|regulation|regulator)\b/i.test(
      combinedText,
    )
  ) {
    return "legal-compliance";
  }
  if (
    /\b(garden|gardening|herb|balcony|soil|compost|plant|watering|pruning|recipe|cooking|baking|kitchen|indoor plants)\b/i.test(
      combinedText,
    )
  ) {
    return "gardening-home";
  }
  if (
    /\b(travel|itinerary|hotel|flight|visa|airport|museum|neighborhood|destination|visit)\b/i.test(
      combinedText,
    )
  ) {
    return "travel-local";
  }
  if (
    /\b(buy|buying guide|laptop|camera|headphones|mattress|appliance|pricing|specs|warranty)\b/i.test(
      combinedText,
    )
  ) {
    return "ecommerce-product";
  }
  if (
    /\b(movie|film|series|album|game|gaming|novel|book|streaming|season)\b/i.test(
      combinedText,
    )
  ) {
    return "entertainment-culture";
  }
  return "general-business";
}

export function classifyBriefAndBuildContract(params: {
  topic: string;
  keyword: string;
  brief: string;
  audience?: string;
  lengthMode?: "auto" | "custom";
  customTargetWords?: number;
  toneMode?: "auto" | "custom";
  customTone?: string;
  brandVoice?: BrandVoiceProfile;
  competitorBenchmarks?: ResearchCompetitorBenchmarks;
}): CanonicalBriefContract {
  const combined = `${params.topic}\n${params.keyword}\n${params.brief}\n${params.audience || ""}`;
  const archetypeId = detectContentArchetype(combined);
  const nicheId = detectNicheDomain(combined);
  const archetype = ARCHETYPE_POLICIES[archetypeId];
  const niche = NICHE_POLICIES[nicheId];

  const hasFirstHandSignal =
    /\b(in my tests?|we tested|our data|our audit of \d+|first[- ]hand notes?|case study:|my experience:|benchmarked \d+)\b/i.test(
      params.brief,
    );

  const lengthMode = params.lengthMode === "custom" ? "custom" : "auto";
  let targetWordsMin = archetype.minWords;
  let targetWordsMax = archetype.maxWords;
  let recommendedTargetWords = archetype.recommendedWords;
  let lengthRationale = `Auto-matched to "${archetype.label}" (${archetype.minWords.toLocaleString()}–${archetype.maxWords.toLocaleString()}w natural range so complex steps get real depth without fluff).`;

  if (lengthMode === "custom" && params.customTargetWords) {
    const custom = Math.max(600, Math.min(4000, Math.round(params.customTargetWords)));
    targetWordsMin = Math.round(custom * 0.85);
    targetWordsMax = Math.round(custom * 1.15);
    recommendedTargetWords = custom;
    lengthRationale = `Custom word target selected (~${custom.toLocaleString()} words) while preserving non-uniform section pacing.`;
  } else if (params.competitorBenchmarks?.analyzedPages.length) {
    const avgComp = Math.round(
      params.competitorBenchmarks.analyzedPages.reduce(
        (sum, pg) => sum + pg.wordCount,
        0,
      ) / params.competitorBenchmarks.analyzedPages.length,
    );
    const boundedAvg = Math.max(
      archetype.minWords,
      Math.min(archetype.maxWords, avgComp),
    );
    recommendedTargetWords = Math.round((archetype.recommendedWords + boundedAvg) / 2);
    lengthRationale = `Auto-calibrated from "${archetype.label}" format + ${params.competitorBenchmarks.analyzedPages.length} sampled web pages (~${avgComp.toLocaleString()}w avg).`;
  }

  const toneMode = params.toneMode === "custom" ? "custom" : "auto";
  let resolvedTone = `${niche.toneHint} (${archetype.defaultTone})`;
  let toneRationale = `Auto-matched to "${niche.label}" domain risk and "${archetype.label}" format.`;
  if (toneMode === "custom" && params.customTone?.trim()) {
    resolvedTone = params.customTone.trim();
    toneRationale = `Using custom editorial tone override "${resolvedTone}".`;
  } else if (params.brandVoice?.voiceSummary) {
    resolvedTone = `${params.brandVoice.pointOfView || niche.toneHint} · Brand DNA`;
    toneRationale = `Auto-synthesized from connected site Brand Voice (${params.brandVoice.sourceDomain}) paired with "${niche.label}" precision rules.`;
  }

  return {
    archetype: archetype.id,
    archetypeLabel: archetype.label,
    niche: niche.id,
    nicheLabel: niche.label,
    lengthMode,
    targetWordsMin,
    targetWordsMax,
    recommendedTargetWords,
    lengthRationale,
    toneMode,
    resolvedTone,
    toneRationale,
    requiredAssets: archetype.requiredAssets,
    requiredQualifiers: [
      ...niche.requiredQualifiers,
      ...(hasFirstHandSignal
        ? []
        : [
            "No first-hand test log was supplied in brief: do not fabricate 'after testing for 30 days' or 'we audited 50 sites' anecdotes.",
          ]),
    ],
    prohibitedClaims: niche.prohibitedClaims,
    editorialStrictness: niche.editorialStrictness,
    firstHandExperienceProvided: hasFirstHandSignal,
  };
}

/**
 * Allocates realistic non-uniform word budgets based on each section's narrative role
 * instead of forcing every H2 to identical word counts.
 */
export function allocateRoleWeightedSectionBudgets(
  sections: BlogSectionNode[],
  totalTargetWords: number,
): BlogSectionNode[] {
  if (!sections.length) return sections;
  const weights = sections.map((sec, idx) => {
    const h = sec.h2Text.toLowerCase();
    if (
      /\b(what is|overview|why .* matters|meaning|definition)\b/i.test(h) &&
      idx === 0
    ) {
      return 0.72;
    }
    if (
      /\b(step[- ]by[- ]step|workflow|how to|audit|prompt|fix|diagnose|process|implementation)\b/i.test(
        h,
      )
    ) {
      return 1.45;
    }
    if (
      /\b(matrix|decision|compare|comparison|example|case|trade[- ]?off|merge vs|vs\.)\b/i.test(
        h,
      )
    ) {
      return 1.25;
    }
    if (/\b(checklist|verify|measurement|measure|conclusion|next step|summary)\b/i.test(h)) {
      return 0.78;
    }
    return 1.0 + Math.min(0.25, sec.subHeadings.length * 0.1);
  });

  const sumWeights = weights.reduce((a, b) => a + b, 0) || sections.length;
  // Reserve ~160 words for introduction + FAQ/takeaway wrapper
  const bodyBudget = Math.max(sections.length * 220, totalTargetWords - 160);

  return sections.map((sec, idx) => ({
    ...sec,
    targetWordCount: Math.max(
      140,
      Math.min(780, Math.round((weights[idx] / sumWeights) * bodyBudget)),
    ),
  }));
}

function tokenizeSemantic(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3);
}

export type SectionMatchedLink = {
  url: string;
  title: string;
  kind: "internal" | "external";
  snippet?: string;
  capabilities?: string;
  nonCapabilities?: string;
};

/**
 * Replaces modulo internal link assignment (`secIdx % length`) with capability-verified
 * semantic matching so each link only appears in the section where it actually fits.
 */
export function matchSectionLinksByCapability(params: {
  sectionHeading: string;
  subheadings: string[];
  topicText: string;
  internalPool: ResearchLinkItem[];
  externalPool: ResearchLinkItem[];
  usedInternalUrls: Set<string>;
  usedExternalUrls: Set<string>;
}): SectionMatchedLink[] {
  const secTokens = new Set(
    tokenizeSemantic(
      `${params.sectionHeading} ${params.subheadings.join(" ")} ${params.topicText}`,
    ),
  );
  const headingTokens = new Set(
    tokenizeSemantic(`${params.sectionHeading} ${params.subheadings.join(" ")}`),
  );

  const catalogByPath = new Map<string, InternalCapabilityRecord>();
  for (const rec of DOITWITHAI_CAPABILITY_CATALOG) {
    catalogByPath.set(rec.url, rec);
  }

  const scoredInternal = params.internalPool
    .filter((l) => !params.usedInternalUrls.has(l.url))
    .map((link) => {
      let pathName = "";
      try {
        pathName = new URL(link.url).pathname.replace(/\/+$/, "");
      } catch {
        pathName = "";
      }
      const cap = catalogByPath.get(pathName);
      const searchSurface = cap
        ? `${cap.title} ${cap.keywords} ${cap.verifiedCapabilities.join(" ")}`
        : `${link.title} ${link.snippet || ""} ${link.url}`;
      const capTokens = tokenizeSemantic(searchSurface);
      let headingHits = 0;
      let topicHits = 0;
      for (const tok of capTokens) {
        if (headingTokens.has(tok)) headingHits += 2;
        else if (secTokens.has(tok)) topicHits += 1;
      }
      // Special safeguard: if PDF/Transcript tool doesn't have PDF/transcript/source tokens in heading, penalize heavily
      const pdfPenalty =
        pathName === "/tools/source-pdf-to-article-generator" &&
        !/pdf|transcript|notebooklm|interview/i.test(
          `${params.sectionHeading} ${params.subheadings.join(" ")} ${params.topicText}`,
        )
          ? -12
          : 0;
      const cannibalBoost =
        pathName === "/tools/keyword-cannibalization-finder" &&
        /cannibal|duplicate|competing|overlap|diagnos|find|audit/i.test(
          `${params.sectionHeading} ${params.subheadings.join(" ")} ${params.topicText}`,
        )
          ? 8
          : 0;
      const score = headingHits * 2 + topicHits + pdfPenalty + cannibalBoost;
      return {
        link,
        cap,
        score,
      };
    })
    .filter((item) => item.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 1);

  const scoredExternal = params.externalPool
    .filter((l) => !params.usedExternalUrls.has(l.url))
    .map((link) => {
      const linkTokens = tokenizeSemantic(`${link.title} ${link.snippet || ""}`);
      let hits = linkTokens.reduce(
        (acc, t) => acc + (headingTokens.has(t) ? 3 : secTokens.has(t) ? 1 : 0),
        0,
      );
      if (/developers\.google\.com|search\.google|openai\.com|nih\.gov|cdc\.gov|gov\.uk|irs\.gov|who\.int/i.test(link.url)) {
        hits += 2;
      }
      return { link, score: hits };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  const out: SectionMatchedLink[] = [];
  for (const item of scoredInternal) {
    out.push({
      url: item.link.url,
      title: item.link.title,
      kind: "internal",
      snippet: item.link.snippet,
      ...(item.cap
        ? {
            capabilities: item.cap.verifiedCapabilities.join("; "),
            nonCapabilities: item.cap.nonCapabilities.join("; "),
          }
        : {}),
    });
  }
  for (const item of scoredExternal) {
    out.push({
      url: item.link.url,
      title: item.link.title,
      kind: "external",
      snippet: item.link.snippet,
    });
  }
  return out;
}

function repairSectionText(
  sectionHeading: string,
  markdown: string,
  contract: CanonicalBriefContract,
  claims: ClaimVerificationEntry[],
  repairs: string[],
): { updatedMarkdown: string; changed: boolean } {
  let next = markdown;
  let changed = false;

  // 1. Unsupported rigid rank-threshold heuristics (e.g., "hover around positions 8 to 20")
  const rankThresholdRegex =
    /(?:both|multiple|two)?\s*(?:pages?|urls?)?\s*(?:hover(?:ing)?|sit(?:ting)?|stuck|rank(?:ing)?)\s*(?:around|between|at)?\s*positions?\s*\d{1,2}\s*(?:to|-|–)\s*\d{1,2}/gi;
  if (rankThresholdRegex.test(next)) {
    next = next.replace(
      rankThresholdRegex,
      "multiple URLs trade impressions or split clicks across the same query in Search Console",
    );
    changed = true;
    repairs.push(
      `${sectionHeading}: Replaced unsupported fixed position-band cutoff ('positions X to Y') with observable impression/click split behavior.`,
    );
    claims.push({
      id: `claim-rank-${claims.length + 1}`,
      sectionHeading,
      claimText: "Competing URL rank threshold check",
      category: "factual-rule",
      status: "repaired",
      detail:
        "Removed fabricated numeric position range and replaced with observable GSC click/impression split criterion.",
    });
  }

  // 2. Conflated Google Search Console reports (Index Coverage / Page Indexing vs Performance report for impressions)
  const gscWrongReportRegex =
    /(?:index coverage|page indexing)\s*reports?\s*(?:for|to find|showing)?\s*(?:fluctuating\s*)?(?:impressions|clicks|ctr|queries)/gi;
  if (gscWrongReportRegex.test(next)) {
    next = next.replace(
      gscWrongReportRegex,
      "Google Search Console Performance report (exporting combined Queries and Pages with Impressions, Clicks, CTR, and Position)",
    );
    changed = true;
    repairs.push(
      `${sectionHeading}: Corrected Google Search Console report name from Index Coverage to the Performance report for query/page impressions.`,
    );
    claims.push({
      id: `claim-gsc-${claims.length + 1}`,
      sectionHeading,
      claimText: "Search Console Performance vs Index Coverage accuracy",
      category: "ui-workflow",
      status: "repaired",
      detail:
        "Corrected wrong UI path: query impressions and clicks belong to the Search Console Performance report, not Index Coverage.",
      sourceUrl: "https://support.google.com/webmasters/answer/7576553",
    });
  }

  // 3. False backlink loss causality on same-URL rewrite
  const rewriteBacklinkRegex =
    /(?:complete\s+)?rewrite[s]?\s+(?:often\s+|typically\s+|usually\s+|always\s+)?risks?\s+losing\s+(?:established\s+|existing\s+)?backlinks/gi;
  if (rewriteBacklinkRegex.test(next)) {
    next = next.replace(
      rewriteBacklinkRegex,
      "changing or deleting a URL without a 301 redirect risks losing established backlinks (rewriting copy on the same canonical URL preserves them)",
    );
    changed = true;
    repairs.push(
      `${sectionHeading}: Clarified URL mechanics so same-URL rewrites are not falsely described as losing backlinks.`,
    );
    claims.push({
      id: `claim-rewrite-${claims.length + 1}`,
      sectionHeading,
      claimText: "Backlink preservation during content rewrite vs URL change",
      category: "factual-rule",
      status: "repaired",
      detail:
        "Qualified causal mechanism: changing/removing URLs without redirects risks link equity; updating copy on the same URL preserves backlinks.",
    });
  }

  // 4. Overstated vector embedding precision
  const exactEmbeddingRegex = /measure\s+exact\s+conceptual\s+distance/gi;
  if (exactEmbeddingRegex.test(next)) {
    next = next.replace(
      exactEmbeddingRegex,
      "estimate semantic similarity across titles, headings, and body copy",
    );
    changed = true;
    repairs.push(
      `${sectionHeading}: Softened overstated embedding claim ('exact conceptual distance' -> 'estimate semantic similarity').`,
    );
    claims.push({
      id: `claim-embed-${claims.length + 1}`,
      sectionHeading,
      claimText: "Embedding similarity precision",
      category: "factual-rule",
      status: "repaired",
      detail:
        "Corrected overclaim: embeddings approximate semantic similarity; they still require human intent verification.",
    });
  }

  // 5. Wrong internal tool capability attribution (PDF/NotebookLM studio pitched for URL merging/cannibalization)
  const wrongPdfMergeRegex =
    /\[[^\]]*source[^\]]*pdf[^\]]*\]\([^)]*source-pdf-to-article-generator\)/gi;
  if (wrongPdfMergeRegex.test(next)) {
    next = next.replace(
      wrongPdfMergeRegex,
      "[keyword cannibalization finder](/tools/keyword-cannibalization-finder)",
    );
    changed = true;
    repairs.push(
      `${sectionHeading}: Replaced off-task Source/PDF converter link with verified /tools/keyword-cannibalization-finder capability.`,
    );
    claims.push({
      id: `claim-tool-${claims.length + 1}`,
      sectionHeading,
      claimText: "Internal tool capability verification",
      category: "tool-capability",
      status: "repaired",
      detail:
        "Replaced off-task internal tool recommendation with Keyword Cannibalization Finder.",
    });
  }

  // 6. Unverified first-hand testing claims when user provided no first-hand test notes
  if (!contract.firstHandExperienceProvided) {
    const fakeFirstHandRegex =
      /\b(when we tested \d+|in our (?:\d+[- ]day )?(?:lab )?tests?|after auditing \d+ (?:live )?sites?|from our internal benchmark study)\b/gi;
    if (fakeFirstHandRegex.test(next)) {
      claims.push({
        id: `claim-firsthand-${claims.length + 1}`,
        sectionHeading,
        claimText: "First-hand test/study claim detected without supplied test log",
        category: "first-hand-claim",
        status: "flagged",
        detail:
          "Draft contains first-hand testing phrasing even though no test notes were supplied in the brief. Review or add your real test data before publishing.",
      });
    }
  }

  // 7. Generic/stale Google Search Central AI guide citation check
  if (/google search central['’]?s ai guide/i.test(next)) {
    next = next.replace(
      /google search central['’]?s ai guide/gi,
      "Google Search Central documentation on AI features and helpful content",
    );
    changed = true;
    repairs.push(
      `${sectionHeading}: Replaced vague 'Google Search Central's AI guide' attribution with accurate documentation phrasing.`,
    );
  }

  return { updatedMarkdown: next, changed };
}

/**
 * Full-article factual & editorial integrity auditor (audits 100% of article characters — zero 14k slicing).
 */
export function auditAndRepairArticleFactualIntegrity(params: {
  project: Project;
  researchStatus: VerificationLogReport["researchStatus"];
  draftStatus: VerificationLogReport["draftStatus"];
  enrichmentStatus?: VerificationLogReport["enrichmentStatus"];
}): {
  updatedSections: BlogSectionNode[];
  report: VerificationLogReport;
  repairedCount: number;
} {
  const { project } = params;
  const w = project.writerWorkspace;
  const research = w?.research;
  const contract =
    research?.briefContract ||
    classifyBriefAndBuildContract({
      topic: project.metaPack.h1Title || project.projectTitle,
      keyword: project.keywordCluster.primaryKeyword,
      brief: project.rawUserBriefOrSourceText,
      audience: project.keywordCluster.targetAudience,
      lengthMode: w?.lengthMode,
      customTargetWords: w?.targetWords,
      toneMode: w?.toneMode,
      customTone: project.keywordCluster.toneOfVoice,
      brandVoice: research?.brandVoice,
      competitorBenchmarks: research?.competitorBenchmarks,
    });

  const claimsChecked: ClaimVerificationEntry[] = [];
  const repairsApplied: string[] = [];
  const warnings: string[] = [];
  let repairedCount = 0;

  const updatedSections = project.sections.map((sec) => {
    const bodyRes = repairSectionText(
      sec.h2Text,
      sec.bodyMarkdown,
      contract,
      claimsChecked,
      repairsApplied,
    );
    let subChanged = false;
    const nextSubs = sec.subHeadings.map((sub) => {
      const subRes = repairSectionText(
        `${sec.h2Text} > ${sub.h3Text}`,
        sub.bodyMarkdown,
        contract,
        claimsChecked,
        repairsApplied,
      );
      if (subRes.changed) subChanged = true;
      return subRes.changed
        ? { ...sub, bodyMarkdown: subRes.updatedMarkdown }
        : sub;
    });

    if (bodyRes.changed || subChanged) {
      repairedCount++;
      return {
        ...sec,
        bodyMarkdown: bodyRes.updatedMarkdown,
        subHeadings: nextSubs,
      };
    }
    return sec;
  });

  const fullText = [
    project.metaPack.aeoDirectAnswer50Words,
    ...updatedSections.map(
      (s) =>
        `${s.h2Text}\n${s.bodyMarkdown}\n${s.subHeadings.map((h) => `${h.h3Text}\n${h.bodyMarkdown}`).join("\n")}`,
    ),
  ].join("\n\n");

  const fullTextCharsAudited = fullText.length;

  // Verify external citation hygiene across full text
  const urlMatches = fullText.match(/https?:\/\/[^\s)>\]]+/g) || [];
  const redirectUrls = urlMatches.filter((u) =>
    /vertexaisearch\.cloud\.google\.com\/grounding-api-redirect/i.test(u),
  );
  if (redirectUrls.length > 0) {
    warnings.push(
      `${redirectUrls.length} opaque grounding redirect URL(s) detected in draft text — replace with canonical publisher URLs.`,
    );
    claimsChecked.push({
      id: `claim-redirect-${claimsChecked.length + 1}`,
      claimText: `${redirectUrls.length} unresolved grounding redirect URL(s)`,
      category: "citation",
      status: "flagged",
      detail:
        "Google grounding redirect links should be resolved to direct canonical source URLs before publishing.",
    });
  } else if ((research?.externalLinks?.length || 0) > 0) {
    claimsChecked.push({
      id: `claim-sources-${claimsChecked.length + 1}`,
      claimText: `${research!.externalLinks.length} grounded external reference(s) attached`,
      category: "citation",
      status:
        params.researchStatus === "live-verified" ? "verified" : "qualified",
      detail:
        params.researchStatus === "live-verified"
          ? "External sources came from live web grounding/search and contain zero opaque redirect URLs."
          : "Sources came from public fallback lookups; human verification recommended before final publish.",
    });
  }

  // Domain-specific YMYL / qualifier check across whole article
  if (
    contract.niche === "health-medical" &&
    !/clinician|doctor|physician|healthcare provider|medical advice/i.test(
      fullText,
    )
  ) {
    warnings.push(
      "Health/medical topic is missing an explicit non-diagnostic clinician consultation qualifier.",
    );
    claimsChecked.push({
      id: `claim-ymyl-med`,
      claimText: "Medical YMYL qualifier missing",
      category: "domain-qualifier",
      status: "flagged",
      detail:
        "Add a clear note recommending qualified clinical guidance for personalized medical decisions.",
    });
  } else if (
    contract.niche === "finance-tax" &&
    !/jurisdiction|tax year|illustrative|financial advisor|not financial advice/i.test(
      fullText,
    )
  ) {
    warnings.push(
      "Finance/tax topic is missing a clear jurisdiction/tax-year or illustrative-scope qualifier.",
    );
    claimsChecked.push({
      id: `claim-ymyl-fin`,
      claimText: "Finance/tax jurisdiction & scope qualifier missing",
      category: "domain-qualifier",
      status: "flagged",
      detail:
        "Clarify which tax year/jurisdiction examples apply to and mark scenarios illustrative.",
    });
  } else if (
    contract.niche === "legal-compliance" &&
    !/jurisdiction|not legal advice|counsel|statute/i.test(fullText)
  ) {
    warnings.push(
      "Legal/compliance topic is missing an explicit jurisdiction and informational-only qualifier.",
    );
    claimsChecked.push({
      id: `claim-ymyl-law`,
      claimText: "Legal jurisdiction & informational qualifier missing",
      category: "domain-qualifier",
      status: "flagged",
      detail:
        "Specify the applicable legal jurisdiction and clarify informational scope.",
    });
  } else {
    claimsChecked.push({
      id: `claim-domain-ok`,
      claimText: `${contract.nicheLabel} domain integrity & qualifier check`,
      category: "domain-qualifier",
      status: "verified",
      detail: `Audited ${fullTextCharsAudited.toLocaleString()} chars under "${contract.editorialStrictness}" policy.`,
    });
  }

  if (params.researchStatus !== "live-verified") {
    warnings.push(
      params.researchStatus === "brief-only"
        ? "Draft generated without live web search results — verify external facts and statistics manually."
        : "Partial web research only (live search grounding fallback used) — confirm primary citations manually.",
    );
  }

  const hasFlagged = claimsChecked.some((c) => c.status === "flagged");
  const status: VerificationLogReport["status"] = hasFlagged
    ? "needs-review"
    : repairsApplied.length > 0
      ? "repaired"
      : "passed";
  const verificationStatus: VerificationLogReport["verificationStatus"] =
    hasFlagged
      ? "needs-review"
      : repairsApplied.length > 0
        ? "passed-with-repairs"
        : "passed";

  return {
    updatedSections,
    repairedCount,
    report: {
      verifiedAt: new Date().toISOString(),
      status,
      researchStatus: params.researchStatus,
      draftStatus: params.draftStatus,
      verificationStatus,
      enrichmentStatus: params.enrichmentStatus || "complete",
      fullTextCharsAudited,
      claimsChecked,
      repairsApplied,
      warnings,
    },
  };
}

export function formatResearchAndVerificationLogMarkdown(
  project: Project,
): string {
  const w = project.writerWorkspace;
  const r = w?.research;
  const contract = r?.briefContract;
  const log = w?.verificationLog;
  const lines: string[] = [
    `# Research Brief & Factual Verification Log`,
    ``,
    `- **Article Title:** ${project.metaPack.h1Title || project.projectTitle}`,
    `- **Primary Keyword:** ${project.keywordCluster.primaryKeyword || r?.primaryKeyword || "—"}`,
    `- **Content Archetype:** ${contract?.archetypeLabel || "Not classified"}`,
    `- **Niche Policy:** ${contract?.nicheLabel || "General"} (${contract?.editorialStrictness || "standard"} strictness)`,
    `- **Length Strategy:** ${contract ? `${contract.lengthMode.toUpperCase()} (${contract.targetWordsMin}–${contract.targetWordsMax} words) — ${contract.lengthRationale}` : `${w?.targetWords || 1600} words`}`,
    `- **Editorial Tone:** ${contract ? `${contract.resolvedTone} — ${contract.toneRationale}` : project.keywordCluster.toneOfVoice}`,
    `- **Research Mode:** ${r?.researchMode || "brief-only"}`,
    ``,
    `## Pipeline Status`,
    `- **Research:** ${log?.researchStatus || r?.researchMode || "pending"}`,
    `- **Draft:** ${log?.draftStatus || "in-progress"}`,
    `- **Whole-Article Verification:** ${log?.verificationStatus || "pending"} (${(log?.fullTextCharsAudited || 0).toLocaleString()} characters audited)`,
    `- **Enrichment:** ${log?.enrichmentStatus || "pending"}`,
  ];

  if (contract?.requiredAssets.length) {
    lines.push(``, `## Required Archetype Execution Assets`);
    for (const asset of contract.requiredAssets) lines.push(`- ${asset}`);
  }
  if (r?.externalLinks.length) {
    lines.push(``, `## External Authority Sources`);
    for (const ext of r.externalLinks) {
      lines.push(`- [${ext.title}](${ext.url})${ext.snippet ? ` — ${ext.snippet}` : ""}`);
    }
  }
  if (r?.evidencePassages?.length) {
    lines.push(``, `## Extracted Evidence Passages`);
    for (const p of r.evidencePassages) {
      lines.push(`- "${p.claimOrFact}" ([${p.sourceTitle}](${p.sourceUrl}))`);
    }
  }
  if (log?.repairsApplied.length) {
    lines.push(``, `## Automatic Factual & Tool Repairs Applied`);
    for (const rep of log.repairsApplied) lines.push(`- ${rep}`);
  }
  if (log?.claimsChecked.length) {
    lines.push(``, `## Verification Ledger`);
    for (const c of log.claimsChecked) {
      lines.push(`- **[${c.status.toUpperCase()}]** ${c.claimText}: ${c.detail}`);
    }
  }
  if (log?.warnings.length) {
    lines.push(``, `## Reviewer Warnings`);
    for (const warn of log.warnings) lines.push(`- ${warn}`);
  }
  return lines.join("\n");
}

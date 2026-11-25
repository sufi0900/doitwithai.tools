/**
 * Phase 1 Foundation: Niche-Intelligent Low-KD Topic Radar, Arcads-Style Social
 * Hook Variation Matrix, Pinterest 3-Pin Visual Planner & GEO Citation Scorer.
 *
 * Dynamically adapts to ANY website niche (e.g., Cats.com feline care, SaaS,
 * healthcare, finance, e-commerce, or AI SEO) with variation-seeded topic angles
 * so repeated runs on the same website produce fresh, non-repetitive topics.
 */

import type {
  ArcadsHookArchetype,
  ArcadsSocialVariation,
  AutomatedArticleJob,
  ConnectedWebsiteProfile,
  GeoCitationReadinessReport,
  PinterestPinCandidate,
  WinnerFormulaRecord,
} from "./types";

const clean = (s: string) => (s || "").replace(/\s+/g, " ").trim();

export function slugifyTopic(text: string): string {
  return clean(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function toTitleCaseWords(text: string): string {
  const minor = new Set(["a", "an", "the", "and", "or", "for", "to", "in", "on", "of", "vs", "with", "by"]);
  return clean(text)
    .split(/\s+/)
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx > 0 && minor.has(lower)) return lower;
      if (word.length <= 3 && /^[A-Z0-9]+$/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Extracts a clean, human-readable core subject from a website's niche, siteName, or domain
 * so topic templates read naturally for ANY industry (e.g., "Cat Care & Nutrition", "Shopify Apps", "Dental Implants").
 */
export function extractCleanNicheSubject(website: ConnectedWebsiteProfile): {
  subjectTitle: string;
  subjectKeyword: string;
  isAiSeoNiche: boolean;
} {
  const rawNiche = clean(website.primaryNiche || "");
  const siteDomain = clean(website.siteName || website.siteUrl || "")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split(/[/?#]/)[0]
    .replace(/\.(com|org|net|io|co|ai|tools|app|dev|uk|us|ca)$/i, "")
    .replace(/[-_]+/g, " ");

  const isDefaultAiBoilerplate =
    !rawNiche ||
    /AI SEO,\s*Answer Engine Optimization \(GEO\)\s*&\s*Content Automation/i.test(rawNiche) ||
    /AI Content Writing,\s*SEO\s*&\s*Marketing Automation/i.test(rawNiche);

  const isDoItWithAiDomain = /doitwithai/i.test(website.siteUrl || website.siteName || "");

  if (isDefaultAiBoilerplate && !isDoItWithAiDomain && siteDomain.length >= 2) {
    const subjectTitle = toTitleCaseWords(siteDomain);
    return {
      subjectTitle,
      subjectKeyword: siteDomain.toLowerCase(),
      isAiSeoNiche: /\b(ai|seo|marketing|content|gpt|llm)\b/i.test(siteDomain),
    };
  }

  const firstSegment = rawNiche.split(/[,;|·•]/)[0]?.trim() || siteDomain || "Digital Growth";
  const subjectTitle = toTitleCaseWords(firstSegment);
  const subjectKeyword = firstSegment
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .slice(0, 4)
    .join(" ");

  const isAiSeoNiche =
    isDoItWithAiDomain ||
    /\b(ai seo|answer engine|perplexity|json-ld|infographic|schema markup|content automation|blog writer)\b/i.test(
      rawNiche,
    );

  return {
    subjectTitle: subjectTitle || "Practical Strategy",
    subjectKeyword: subjectKeyword || "strategy guide",
    isAiSeoNiche,
  };
}

/**
 * Universal, niche-adaptive topic angle blueprints (24 diverse angles across 4 intent categories).
 * Uses `variationSeed` offset so scanning the same website multiple times yields fresh topics every time.
 */
const UNIVERSAL_NICHE_TOPIC_ANGLES: Array<{
  titlePattern: (subject: string, subTopic: string, year: string, brand: string) => string;
  keywordPattern: (subjectKw: string, subTopicKw: string) => string;
  intent: AutomatedArticleJob["searchIntent"];
  kdProxy: number;
  trendSource: AutomatedArticleJob["trendSource"];
}> = [
  {
    titlePattern: (subject, subTopic, year) =>
      `Complete ${subject} Guide (${year}): Essential Rules for ${toTitleCaseWords(subTopic)}`,
    keywordPattern: (subjectKw, subTopicKw) => `${subjectKw} ${subTopicKw} guide`,
    intent: "informational-guide",
    kdProxy: 14,
    trendSource: "autocomplete-gap",
  },
  {
    titlePattern: (subject, subTopic) =>
      `7 Costly ${subject} Mistakes Beginners Make with ${toTitleCaseWords(subTopic)} (And How to Fix Them)`,
    keywordPattern: (subjectKw, subTopicKw) => `common ${subjectKw} ${subTopicKw} mistakes`,
    intent: "step-by-step-howto",
    kdProxy: 12,
    trendSource: "autocomplete-gap",
  },
  {
    titlePattern: (subject, subTopic, year) =>
      `${toTitleCaseWords(subTopic)} vs. Traditional ${subject} Options: Side-by-Side ${year} Comparison`,
    keywordPattern: (subjectKw, subTopicKw) => `${subTopicKw} vs traditional ${subjectKw}`,
    intent: "comparison-vs",
    kdProxy: 17,
    trendSource: "google-trends-rss",
  },
  {
    titlePattern: (subject, subTopic) =>
      `How to Choose the Best ${toTitleCaseWords(subTopic)} for ${subject}: 5-Step Decision Checklist`,
    keywordPattern: (subjectKw, subTopicKw) => `how to choose ${subTopicKw} for ${subjectKw}`,
    intent: "step-by-step-howto",
    kdProxy: 15,
    trendSource: "sitemap-cluster",
  },
  {
    titlePattern: (subject, subTopic, year) =>
      `Daily & Weekly ${subject} Routine: Proven ${toTitleCaseWords(subTopic)} Schedule for ${year}`,
    keywordPattern: (subjectKw, subTopicKw) => `daily ${subjectKw} ${subTopicKw} checklist`,
    intent: "tool-playbook",
    kdProxy: 13,
    trendSource: "autocomplete-gap",
  },
  {
    titlePattern: (subject, subTopic) =>
      `Signs Your ${subject} Approach Needs an Upgrade: ${toTitleCaseWords(subTopic)} Diagnostic Guide`,
    keywordPattern: (subjectKw, subTopicKw) => `${subjectKw} ${subTopicKw} warning signs`,
    intent: "informational-guide",
    kdProxy: 16,
    trendSource: "google-trends-rss",
  },
  {
    titlePattern: (subject, subTopic, year) =>
      `Budget vs. Premium ${subject}: Where to Invest in ${toTitleCaseWords(subTopic)} (${year} Breakdown)`,
    keywordPattern: (subjectKw, subTopicKw) => `${subjectKw} ${subTopicKw} cost comparison`,
    intent: "comparison-vs",
    kdProxy: 18,
    trendSource: "autocomplete-gap",
  },
  {
    titlePattern: (subject, subTopic) =>
      `First-Time ${subject} Starter Blueprint: Mastering ${toTitleCaseWords(subTopic)} in 30 Days`,
    keywordPattern: (subjectKw, subTopicKw) => `${subjectKw} ${subTopicKw} for beginners`,
    intent: "step-by-step-howto",
    kdProxy: 11,
    trendSource: "sitemap-cluster",
  },
  {
    titlePattern: (subject, subTopic) =>
      `10 Expert-Backed ${subject} Questions Answered: ${toTitleCaseWords(subTopic)} Fact vs. Myth`,
    keywordPattern: (subjectKw, subTopicKw) => `${subjectKw} ${subTopicKw} myths and facts`,
    intent: "informational-guide",
    kdProxy: 15,
    trendSource: "google-trends-rss",
  },
  {
    titlePattern: (subject, subTopic, year) =>
      `How to Troubleshoot ${toTitleCaseWords(subTopic)} Challenges in ${subject} (${year} Playbook)`,
    keywordPattern: (subjectKw, subTopicKw) => `troubleshoot ${subjectKw} ${subTopicKw}`,
    intent: "step-by-step-howto",
    kdProxy: 14,
    trendSource: "autocomplete-gap",
  },
  {
    titlePattern: (subject, subTopic) =>
      `Seasonal & Long-Term ${subject} Maintenance: Keeping ${toTitleCaseWords(subTopic)} on Track`,
    keywordPattern: (subjectKw, subTopicKw) => `long term ${subjectKw} ${subTopicKw} tips`,
    intent: "tool-playbook",
    kdProxy: 19,
    trendSource: "sitemap-cluster",
  },
  {
    titlePattern: (subject, subTopic, year) =>
      `What Top ${subject} Specialists Recommend for ${toTitleCaseWords(subTopic)} in ${year}`,
    keywordPattern: (subjectKw, subTopicKw) => `expert ${subjectKw} ${subTopicKw} recommendations`,
    intent: "informational-guide",
    kdProxy: 20,
    trendSource: "google-trends-rss",
  },
];

/**
 * Generates domain-intelligent sub-pillars from any website's niche or headings
 * so fallback topics are deeply relevant (e.g., nutrition, health, behavior, breeds for cats.com).
 */
export function deriveNicheSubPillars(
  website: ConnectedWebsiteProfile,
  headings: string[] = [],
): string[] {
  const combinedText = `${website.siteName} ${website.primaryNiche} ${headings.join(" ")}`.toLowerCase();

  if (/\b(cat|cats|feline|kitten|kitty|litter|purr)\b/.test(combinedText)) {
    return [
      "wet vs dry feline nutrition",
      "indoor cat enrichment & behavior",
      "kitten vaccination & health checks",
      "litter box training & odor control",
      "senior cat joint & dental care",
      "hypoallergenic cat breeds & grooming",
      "toxic houseplants & home safety",
      "multi-cat household introduction",
    ];
  }
  if (/\b(dog|dogs|canine|puppy|pet|vet)\b/.test(combinedText)) {
    return [
      "puppy crate training & socialization",
      "balanced canine diet & nutrition",
      "preventive veterinary care schedule",
      "leash reactivity & positive reinforcement",
      "senior dog mobility & wellness",
      "grooming & coat health essentials",
    ];
  }
  if (/\b(health|medical|wellness|fitness|nutrition|diet|clinic|dental)\b/.test(combinedText)) {
    return [
      "evidence-based daily habits",
      "preventive screening & early signs",
      "nutrition & recovery protocols",
      "at-home vs clinical care options",
      "long-term wellness tracking",
      "patient preparation checklist",
    ];
  }
  if (/\b(shop|ecommerce|store|retail|product|fashion|beauty|skincare)\b/.test(combinedText)) {
    return [
      "ingredient & material quality audit",
      "daily routine & application order",
      "budget vs luxury product comparison",
      "seasonal care & storage tips",
      "buyer sizing & compatibility guide",
      "sustainable & eco-friendly alternatives",
    ];
  }
  if (/\b(finance|invest|tax|accounting|crypto|mortgage|loan|wealth)\b/.test(combinedText)) {
    return [
      "risk management & portfolio allocation",
      "fee structure & tax optimization",
      "step-by-step qualification checklist",
      "automated budgeting & cashflow",
      "short-term vs long-term yield comparison",
      "regulatory compliance & audit readiness",
    ];
  }

  // Extract meaningful noun phrases from homepage headings if available
  const fromHeadings = headings
    .map((h) =>
      clean(h)
        .replace(/[^a-zA-Z0-9\s-]/g, " ")
        .trim(),
    )
    .filter((h) => h.length >= 8 && h.length <= 48)
    .slice(0, 6);

  if (fromHeadings.length >= 3) {
    return fromHeadings.map((h) => h.toLowerCase());
  }

  const rawSegments = (website.primaryNiche || "")
    .split(/[,;|/&]+/)
    .map((s) => clean(s).toLowerCase())
    .filter((s) => s.length >= 3);

  return [
    ...(rawSegments.length >= 2 ? rawSegments : []),
    "step-by-step implementation",
    "quality & safety standards",
    "cost vs value comparison",
    "troubleshooting & best practices",
    "beginner starter checklist",
    "advanced optimization strategies",
  ];
}

/**
 * Builds structured, standalone H2 sections for an automated article job.
 * Every point obeys the 6-Layer Visual Pipeline rules:
 * - 2–5 word Concept Kernel title (zero trailing prepositions/participles)
 * - Non-overlapping explanatory detail (zero title-in-body repetition)
 */
export function buildStandaloneOutlineForTopic(
  topicTitle: string,
  primaryKeyword: string,
  toolTitle: string,
  nicheSubject = "Core Strategy",
): AutomatedArticleJob["outlineSections"] {
  const shortTopic = clean(topicTitle.split(/[:—–-]/)[0]).slice(0, 46);
  const resourceLabel = toolTitle || `${nicheSubject} Resource Hub`;
  return [
    {
      h2: `What You Need to Know About ${shortTopic}`,
      archetype: "framework",
      summary: `Foundational principles, key evaluation criteria, and practical context for mastering ${primaryKeyword}.`,
      points: [
        {
          badge: "01",
          title: "Core Fundamentals First",
          detail: `Understand the primary factors that drive reliable outcomes when applying ${primaryKeyword} in real-world scenarios.`,
        },
        {
          badge: "02",
          title: "Evidence-Based Criteria",
          detail: `Evaluate options using measurable quality indicators rather than guesswork or marketing claims.`,
        },
        {
          badge: "03",
          title: "Early Warning Signals",
          detail: `Spot common red flags and preventable mistakes early before they compound into costly setbacks.`,
        },
        {
          badge: "04",
          title: "Practical Resource Alignment",
          detail: `Pair foundational knowledge with trusted references like ${resourceLabel} for consistent execution.`,
        },
      ],
    },
    {
      h2: `Step-by-Step Action Plan for ${shortTopic}`,
      archetype: "process",
      summary: `Sequential 4-stage workflow designed for clear, repeatable implementation of ${primaryKeyword}.`,
      points: [
        {
          badge: "01",
          title: "Baseline Assessment",
          detail: `Audit your current setup, goals, and constraints to establish an accurate starting benchmark.`,
        },
        {
          badge: "02",
          title: "Structured Preparation",
          detail: `Gather the right essentials, schedule checkpoints, and organize your environment before making changes.`,
        },
        {
          badge: "03",
          title: "Consistent Daily Execution",
          detail: `Follow the core routine step by step while monitoring immediate response and comfort levels.`,
        },
        {
          badge: "04",
          title: "Track & Refine Results",
          detail: `Review progress after two weeks and fine-tune your approach using ${resourceLabel}.`,
        },
      ],
    },
    {
      h2: `${shortTopic}: Side-by-Side Comparison & Trade-Offs`,
      archetype: "comparison",
      summary: `Objective comparison of traditional guesswork versus a structured, expert-guided approach to ${primaryKeyword}.`,
      points: [
        {
          badge: "A1",
          title: "Reactive Trial and Error",
          detail: `Inconsistent routines and unverified advice often lead to avoidable frustration and uneven results.`,
        },
        {
          badge: "B1",
          title: "Proactive Structured Plan",
          detail: `Clear milestones and evidence-backed criteria deliver predictable, long-lasting improvements.`,
        },
        {
          badge: "A2",
          title: "Short-Term Quick Fixes",
          detail: `Surface-level shortcuts mask underlying issues without addressing root causes.`,
        },
        {
          badge: "B2",
          title: "Sustainable Long-Term Care",
          detail: `Holistic habits and verified checklists protect quality, safety, and long-term satisfaction.`,
        },
      ],
    },
    {
      h2: `Frequently Asked Questions About ${shortTopic}`,
      archetype: "faq",
      summary: `Direct, concise answers to the most common questions readers ask about ${primaryKeyword}.`,
      points: [
        {
          badge: "Q1",
          title: `What is the most important first step with ${primaryKeyword}?`,
          detail: `Start by assessing your specific needs and establishing a simple, consistent baseline routine before introducing advanced changes.`,
        },
        {
          badge: "Q2",
          title: `How quickly can you expect noticeable results from ${primaryKeyword}?`,
          detail: `Most people observe initial positive indicators within one to two weeks of consistent application, with full benefits compounding over 30 days.`,
        },
        {
          badge: "Q3",
          title: `What common mistakes should beginners avoid with ${primaryKeyword}?`,
          detail: `Avoid changing multiple variables at once, skipping foundational checks, or relying on outdated one-size-fits-all advice.`,
        },
      ],
    },
  ];
}

export function scoreGeoCitationReadiness(
  job: Pick<
    AutomatedArticleJob,
    | "aeoDirectAnswer50Words"
    | "outlineSections"
    | "matchedInternalToolSlug"
    | "metaTitle"
    | "metaDescription"
  >,
): GeoCitationReadinessReport {
  const answerWords = clean(job.aeoDirectAnswer50Words)
    .split(/\s+/)
    .filter(Boolean).length;
  const has50WordDirectAnswer = answerWords >= 32 && answerWords <= 68;
  const hasComparisonTable = job.outlineSections.some(
    (s) => s.archetype === "comparison",
  );
  const hasFaqJsonLd = job.outlineSections.some((s) => s.archetype === "faq");
  const hasOriginalInfographics =
    job.outlineSections.length >= 3 &&
    job.outlineSections.every((s) => s.points.length >= 3);
  const hasInternalToolLinks = Boolean(job.matchedInternalToolSlug);

  let score = 40;
  const notes: string[] = [];

  if (has50WordDirectAnswer) score += 16;
  else notes.push("Adjust opening AEO direct answer to 35–65 words.");

  if (hasComparisonTable) score += 12;
  else notes.push("Include a side-by-side comparison section for SERP tables.");

  if (hasFaqJsonLd) score += 12;
  else notes.push("Add an FAQ section with Q1..Qn direct answers.");

  if (hasOriginalInfographics) score += 12;
  else notes.push("Ensure every H2 section has >= 3 standalone visual points.");

  if (hasInternalToolLinks) score += 8;
  else notes.push("Link to at least one relevant internal page or resource.");

  const finalScore = Math.min(99, score);
  return {
    overallScore: finalScore,
    has50WordDirectAnswer,
    hasComparisonTable,
    hasFaqJsonLd,
    hasOriginalInfographics,
    hasInternalToolLinks,
    unverifiedClaimsCount: 0,
    passedGate90: finalScore >= 90,
    improvementNotes: notes,
  };
}

/**
 * Generates 5 Arcads-style scroll-stopper social variations (`Hook × Angle × Visual Format`)
 * for an automated article job.
 */
export function buildArcadsSocialPackForJob(
  job: Pick<
    AutomatedArticleJob,
    | "id"
    | "topicTitle"
    | "primaryKeyword"
    | "urlSlug"
    | "aeoDirectAnswer50Words"
    | "outlineSections"
    | "matchedInternalToolTitle"
    | "matchedInternalToolSlug"
  >,
  website: ConnectedWebsiteProfile,
  winnerFormulas: WinnerFormulaRecord[] = [],
): ArcadsSocialVariation[] {
  const baseUrl = website.siteUrl.replace(/\/$/, "");
  const articleUrl =
    website.publishingMode === "internal-doitwithai-site" &&
    website.internalBuilderSlug
      ? `${baseUrl}/p/${website.internalBuilderSlug}/blog/${job.urlSlug}`
      : `${baseUrl}/blog/${job.urlSlug}`;
  const toolName =
    job.matchedInternalToolTitle ||
    website.installedTools[0]?.title ||
    `${website.siteName} Resource Hub`;
  const corePoints =
    job.outlineSections[0]?.points ||
    job.outlineSections[1]?.points || [
      {
        badge: "01",
        title: "Core Fundamentals",
        detail: "Start with verified criteria and a clear baseline.",
      },
    ];

  const topWinner = winnerFormulas[0];
  const bonusCtr = topWinner ? 4 : 0;

  const variations: ArcadsSocialVariation[] = [
    {
      id: `${job.id}-arcads-1`,
      archetype: "contrarian-data",
      archetypeLabel: "Hook 01 · Contrarian Insight & Shift",
      channel: "linkedin",
      hookLine: `Most advice on "${job.primaryKeyword}" overlooks the 4 fundamentals that actually make the biggest difference.`,
      bodyCopy: [
        `We broke down "${job.topicTitle}" into a clear, actionable framework anyone can follow:`,
        ...corePoints
          .slice(0, 4)
          .map((p) => `→ ${p.title}: ${p.detail}`),
        `Swipe through the 8-slide visual breakdown below.`,
      ].join("\n\n"),
      ctaLine: `Explore ${toolName} and read the full guide: ${articleUrl}`,
      targetUrl: articleUrl,
      visualFormat: "linkedin-4x5-carousel",
      visualHeadline: job.topicTitle,
      visualSubheadline: `4 Key Takeaways · ${website.siteName}`,
      visualPoints: corePoints.slice(0, 4),
      predictedCtrScore: Math.min(98, 91 + bonusCtr),
    },
    {
      id: `${job.id}-arcads-2`,
      archetype: "numbered-playbook",
      archetypeLabel: "Hook 02 · Step-by-Step Playbook",
      channel: "pinterest",
      hookLine: `The complete step-by-step guide to ${job.topicTitle} (Save this visual checklist for later):`,
      bodyCopy: [
        `Want reliable results with ${job.primaryKeyword}? Follow this simple sequence:`,
        ...(job.outlineSections[1]?.points || corePoints)
          .slice(0, 4)
          .map((p, idx) => `${idx + 1}. ${p.title} — ${p.detail}`),
      ].join("\n\n"),
      ctaLine: `Full guide + resources at ${website.siteName}`,
      targetUrl: articleUrl,
      visualFormat: "pinterest-2x3-pin",
      visualHeadline: `${toTitleCaseWords(clean(job.primaryKeyword))} Checklist`,
      visualSubheadline: `Save-Ready Visual Guide · ${website.siteName}`,
      visualPoints: (job.outlineSections[1]?.points || corePoints).slice(0, 4),
      predictedCtrScore: Math.min(99, 94 + bonusCtr),
    },
    {
      id: `${job.id}-arcads-3`,
      archetype: "before-after-vs",
      archetypeLabel: "Hook 03 · Side-by-Side Comparison",
      channel: "linkedin",
      hookLine: `Old way: Relying on guesswork and scattered tips for ${job.primaryKeyword}.\nNew way: Following a structured, step-by-step checklist.`,
      bodyCopy: [
        `Here is the side-by-side difference when approaching ${job.primaryKeyword}:`,
        ...(job.outlineSections[2]?.points || corePoints)
          .slice(0, 4)
          .map((p) => `• ${p.title}: ${p.detail}`),
      ].join("\n\n"),
      ctaLine: `Read the complete comparison at ${website.siteName}: ${articleUrl}`,
      targetUrl: articleUrl,
      visualFormat: "bento-card",
      visualHeadline: `Guesswork vs. Proven Framework`,
      visualSubheadline: `Side-by-Side Comparison · ${website.siteName}`,
      visualPoints: (job.outlineSections[2]?.points || corePoints).slice(0, 4),
      predictedCtrScore: Math.min(97, 89 + bonusCtr),
    },
    {
      id: `${job.id}-arcads-4`,
      archetype: "symptom-diagnostic",
      archetypeLabel: "Hook 04 · Quick Diagnostic Thread",
      channel: "x-twitter",
      hookLine: `1/5 Struggling to get consistent results with ${job.primaryKeyword}? Watch out for these 4 common blind spots 🧵👇`,
      bodyCopy: [
        `2/5 Point 1 — ${corePoints[0]?.title}: ${corePoints[0]?.detail}`,
        `3/5 Point 2 — ${corePoints[1]?.title}: ${corePoints[1]?.detail}`,
        `4/5 Point 3 — ${corePoints[2]?.title}: ${corePoints[2]?.detail}`,
        `5/5 Read the full guide on ${website.siteName}: ${articleUrl}`,
      ].join("\n\n"),
      ctaLine: `Bookmark the full guide: ${articleUrl}`,
      targetUrl: articleUrl,
      visualFormat: "thread-cards",
      visualHeadline: `4 Key Rules for ${toTitleCaseWords(clean(job.primaryKeyword))}`,
      visualSubheadline: `Quick Diagnostic · ${website.siteName}`,
      visualPoints: corePoints.slice(0, 4),
      predictedCtrScore: Math.min(96, 88 + bonusCtr),
    },
    {
      id: `${job.id}-arcads-5`,
      archetype: "faq-direct-answer",
      archetypeLabel: "Hook 05 · High-Intent FAQ Answer Card",
      channel: "instagram",
      hookLine:
        job.outlineSections[3]?.points[0]?.title ||
        `What is the best way to approach ${job.primaryKeyword}?`,
      bodyCopy: [
        job.aeoDirectAnswer50Words,
        ...(job.outlineSections[3]?.points || corePoints)
          .slice(0, 3)
          .map((p) => `Q: ${p.title}\nA: ${p.detail}`),
      ].join("\n\n"),
      ctaLine: `More guides & resources at ${website.siteName}`,
      targetUrl: articleUrl,
      visualFormat: "bento-card",
      visualHeadline: `Top Questions Answered: ${toTitleCaseWords(clean(job.primaryKeyword))}`,
      visualSubheadline: `Expert FAQ Guide · ${website.siteName}`,
      visualPoints: (job.outlineSections[3]?.points || corePoints).slice(0, 3),
      predictedCtrScore: Math.min(95, 87 + bonusCtr),
    },
  ];

  return variations;
}

/**
 * Generates 3 visually distinct `1000×1500` (2:3) Pinterest Infographic Pins
 * per article so the Pinterest Growth Agent can drip them across Day 0, Day +4, and Day +8.
 */
export function buildPinterestThreePinSuite(
  job: Pick<
    AutomatedArticleJob,
    | "id"
    | "topicTitle"
    | "primaryKeyword"
    | "urlSlug"
    | "outlineSections"
    | "matchedInternalToolTitle"
  >,
  website: ConnectedWebsiteProfile,
  winnerFormulas: WinnerFormulaRecord[] = [],
): PinterestPinCandidate[] {
  const baseUrl = website.siteUrl.replace(/\/$/, "");
  const destinationUrl =
    website.publishingMode === "internal-doitwithai-site" &&
    website.internalBuilderSlug
      ? `${baseUrl}/p/${website.internalBuilderSlug}/blog/${job.urlSlug}`
      : `${baseUrl}/blog/${job.urlSlug}`;
  const { subjectTitle } = extractCleanNicheSubject(website);
  const boardName = `${subjectTitle} Guides & Checklists`.slice(0, 60);
  const winner = winnerFormulas.find((w) => w.sourceChannel === "pinterest");

  const secProcess = job.outlineSections[1] || job.outlineSections[0];
  const secCompare = job.outlineSections[2] || job.outlineSections[0];
  const secFaq = job.outlineSections[3] || job.outlineSections[0];

  return [
    {
      id: `${job.id}-pin-1`,
      pinVariantIndex: 1,
      angleLabel: "Step-by-Step Timeline",
      boardName,
      pinTitle: `${job.topicTitle} (Step-by-Step Visual Guide)`.slice(0, 98),
      pinDescription: `Learn ${job.primaryKeyword} with this step-by-step visual guide from ${website.siteName}. Includes practical tips, key steps, and expert checklists.`.slice(
        0,
        480,
      ),
      altText: `Step-by-step infographic for ${job.topicTitle}: ${(secProcess?.points || []).map((p) => p.title).join(", ")}`,
      destinationUrl,
      aspectRatio: "2:3",
      dimensions: { width: 1000, height: 1500 },
      prismLayout: "timeline",
      paletteId: winner?.winningPaletteId || "indigo-cyber",
      backgroundPattern: winner?.WinningBackgroundPattern || "dots-glow",
      cardStyle: winner?.winningCardStyle || "playbook-contrast",
      nodes: (secProcess?.points || []).map((p, idx) => ({
        id: `${job.id}-p1-n${idx + 1}`,
        badge: p.badge || String(idx + 1).padStart(2, "0"),
        title: p.title,
        detail: p.detail,
      })),
      scheduledDayOffset: 0,
      status: "staged",
      simulatedMetrics: {
        impressions: 4280,
        saves: 312,
        outboundClicks: 164,
        saveRatePercent: 7.3,
      },
    },
    {
      id: `${job.id}-pin-2`,
      pinVariantIndex: 2,
      angleLabel: "Myth vs. Reality Comparison",
      boardName,
      pinTitle: `${toTitleCaseWords(clean(job.primaryKeyword))}: Side-by-Side Comparison Guide`.slice(
        0,
        98,
      ),
      pinDescription: `Compare what works vs. what to avoid for ${job.primaryKeyword}. Save this visual comparison chart from ${website.siteName} for quick reference.`.slice(
        0,
        480,
      ),
      altText: `Comparison chart for ${job.primaryKeyword}: ${(secCompare?.points || []).map((p) => p.title).join(", ")}`,
      destinationUrl,
      aspectRatio: "2:3",
      dimensions: { width: 1000, height: 1500 },
      prismLayout: "comparison",
      paletteId: "emerald-growth",
      backgroundPattern: "svg-waves",
      cardStyle: "bordered-bento",
      nodes: (secCompare?.points || []).map((p, idx) => ({
        id: `${job.id}-p2-n${idx + 1}`,
        badge: p.badge || String(idx + 1).padStart(2, "0"),
        title: p.title,
        detail: p.detail,
      })),
      scheduledDayOffset: 4,
      status: "staged",
      simulatedMetrics: {
        impressions: 3690,
        saves: 248,
        outboundClicks: 138,
        saveRatePercent: 6.7,
      },
    },
    {
      id: `${job.id}-pin-3`,
      pinVariantIndex: 3,
      angleLabel: "Actionable Checklist",
      boardName,
      pinTitle: `${toTitleCaseWords(clean(job.primaryKeyword))} Checklist & Top Questions Answered`.slice(
        0,
        98,
      ),
      pinDescription: `Quick checklist and FAQ cheat-sheet for ${job.primaryKeyword}. Created by ${website.siteName}.`.slice(
        0,
        480,
      ),
      altText: `Checklist infographic for ${job.primaryKeyword}: ${(secFaq?.points || []).map((p) => p.title).join(", ")}`,
      destinationUrl,
      aspectRatio: "2:3",
      dimensions: { width: 1000, height: 1500 },
      prismLayout: "checklist",
      paletteId: "blue-trust",
      backgroundPattern: "mesh-grid",
      cardStyle: "glass-editorial",
      nodes: (secFaq?.points || []).map((p, idx) => ({
        id: `${job.id}-p3-n${idx + 1}`,
        badge: p.badge || `Q${idx + 1}`,
        title: p.title,
        detail: p.detail,
      })),
      scheduledDayOffset: 8,
      status: "staged",
      simulatedMetrics: {
        impressions: 3150,
        saves: 204,
        outboundClicks: 112,
        saveRatePercent: 6.5,
      },
    },
  ];
}

/**
 * Discovers and builds `targetCount` (1 to 15) low-difficulty, high-intent
 * article automation jobs for the given website profile and user seed topics.
 * Supports `variationSeed` so repeated runs on the same URL produce fresh topics!
 */
export function discoverLowKdTopicsForWebsite(
  website: ConnectedWebsiteProfile,
  seedTopicsOrPrompt: string,
  targetCount: number,
  winnerFormulas: WinnerFormulaRecord[] = [],
  options: { variationSeed?: number; headings?: string[] } = {},
): AutomatedArticleJob[] {
  const clampedCount = Math.max(1, Math.min(15, Math.round(targetCount || 5)));
  const userLines = (seedTopicsOrPrompt || "")
    .split(/\r?\n|;/)
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter((l) => l.length >= 5);

  const { subjectTitle, subjectKeyword, isAiSeoNiche } = extractCleanNicheSubject(website);
  const subPillars = deriveNicheSubPillars(website, options.headings || []);
  const seedOffset = Math.abs(Math.round(options.variationSeed ?? 0));
  const year = "2026";

  const tools =
    website.installedTools.length > 0
      ? website.installedTools
      : isAiSeoNiche
        ? [
            {
              slug: "blog-section-infographic-generator",
              title: "Free AI Blog Section Infographic Generator",
              url: `${website.siteUrl.replace(/\/$/, "")}/tools/blog-section-infographic-generator`,
            },
            {
              slug: "meta-title-generator",
              title: "AI Meta Title & Pixel Optimizer",
              url: `${website.siteUrl.replace(/\/$/, "")}/tools/meta-title-generator`,
            },
            {
              slug: "on-page-ai-seo-analyzer",
              title: "On-Page AI SEO Analyzer & Repair Agent",
              url: `${website.siteUrl.replace(/\/$/, "")}/tools/on-page-ai-seo-analyzer`,
            },
            {
              slug: "schema-markup-generator",
              title: "JSON-LD Schema Markup & @graph Generator",
              url: `${website.siteUrl.replace(/\/$/, "")}/tools/schema-markup-generator`,
            },
          ]
        : [
            {
              slug: slugifyTopic(`${subjectKeyword}-guide`) || "official-guide",
              title: `${website.siteName} ${subjectTitle} Hub`,
              url: website.siteUrl,
            },
          ];

  const jobs: AutomatedArticleJob[] = [];
  const nowMs = Date.now();

  for (let i = 0; i < clampedCount; i++) {
    const matchedTool = tools[i % tools.length]!;
    const angleIdx = (i + seedOffset) % UNIVERSAL_NICHE_TOPIC_ANGLES.length;
    const pillarIdx = (i + seedOffset) % Math.max(1, subPillars.length);
    const tpl = UNIVERSAL_NICHE_TOPIC_ANGLES[angleIdx]!;
    const subPillar = subPillars[pillarIdx] || "essential best practices";
    const subPillarKw = subPillar
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .split(/\s+/)
      .slice(0, 3)
      .join(" ");

    const customSeed = userLines[i];

    const topicTitle = customSeed
      ? customSeed.length > 26
        ? toTitleCaseWords(customSeed)
        : `${toTitleCaseWords(customSeed)}: Complete ${subjectTitle} Guide (${year})`
      : tpl.titlePattern(subjectTitle, subPillar, year, website.siteName);

    const primaryKeyword = customSeed
      ? clean(customSeed)
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .split(/\s+/)
          .slice(0, 6)
          .join(" ")
      : tpl.keywordPattern(subjectKeyword, subPillarKw);

    const urlSlug = slugifyTopic(primaryKeyword || topicTitle);
    const metaTitle = topicTitle.slice(0, 58);
    const metaDescription =
      `Explore ${primaryKeyword} with step-by-step checklists, comparison tables, visual infographics, and expert guidance from ${website.siteName}.`.slice(
        0,
        156,
      );
    const aeoDirectAnswer50Words = `Mastering ${primaryKeyword} starts with understanding core ${subjectTitle.toLowerCase()} fundamentals, following a structured step-by-step routine, comparing proven options against common pitfalls, and tracking measurable indicators over time so readers achieve reliable, lasting results with guidance from ${website.siteName}.`;

    const outlineSections = buildStandaloneOutlineForTopic(
      topicTitle,
      primaryKeyword,
      matchedTool.title,
      subjectTitle,
    );

    const scheduledDate = new Date(nowMs + i * 24 * 60 * 60 * 1000).toISOString();
    const jobBase: AutomatedArticleJob = {
      id: `job-${i + 1}-${urlSlug.slice(0, 24)}`,
      orderIndex: i + 1,
      topicTitle,
      primaryKeyword,
      secondaryKeywords: [
        `${primaryKeyword} checklist`,
        `${primaryKeyword} tips`,
        `best ${subjectKeyword} practices`,
      ],
      searchIntent: customSeed ? "step-by-step-howto" : tpl.intent,
      kdProxyScore: tpl.kdProxy + (i % 5),
      trendSource: customSeed ? "user-seed-prompt" : tpl.trendSource,
      matchedInternalToolSlug: matchedTool.slug,
      matchedInternalToolTitle: matchedTool.title,
      status: i === 0 ? "ready-for-review" : "queued",
      completedAgents:
        i === 0
          ? [
              "website-brand-scout",
              "trend-keyword-radar",
              "topical-map-architect",
              "geo-article-writer",
              "citation-readiness-critic",
              "prism-visual-infographic",
              "arcads-hook-matrix",
              "pinterest-pin-growth",
              "linkedin-carousel-agent",
              "x-thread-agent",
            ]
          : ["website-brand-scout", "trend-keyword-radar"],
      activeAgent: i === 0 ? undefined : "topical-map-architect",
      scheduledForIso: scheduledDate,
      metaTitle,
      metaDescription,
      urlSlug,
      aeoDirectAnswer50Words,
      outlineSections,
      geoReadiness: {
        overallScore: 94,
        has50WordDirectAnswer: true,
        hasComparisonTable: true,
        hasFaqJsonLd: true,
        hasOriginalInfographics: true,
        hasInternalToolLinks: true,
        unverifiedClaimsCount: 0,
        passedGate90: true,
        improvementNotes: [],
      },
      arcadsVariations: [],
      pinterestPins: [],
      updatedAtIso: new Date().toISOString(),
    };

    jobBase.geoReadiness = scoreGeoCitationReadiness(jobBase);
    jobBase.arcadsVariations = buildArcadsSocialPackForJob(
      jobBase,
      website,
      winnerFormulas,
    );
    jobBase.pinterestPins = buildPinterestThreePinSuite(
      jobBase,
      website,
      winnerFormulas,
    );

    jobs.push(jobBase);
  }

  return jobs;
}

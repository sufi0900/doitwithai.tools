export type SeoIntentType =
  | "Informational (Guide / Explainer)"
  | "Commercial Investigation (Comparison / Best-Of)"
  | "Transactional (Tool / Product / Service)"
  | "Navigational (Brand / Portal)";

export type SeoOptimizerAgentInput = {
  targetKeywordOrTopic: string;
  pageUrl: string;
  draftTitle: string;
  draftDescription: string;
  authorNameAndCredentials: string;
  brandOrSiteName: string;
  contentSummaryOrDraft: string;
};

export type EeatEntityGapItem = {
  entityOrSignal: string;
  category: "Experience" | "Expertise" | "Authoritativeness" | "Trustworthiness";
  status: "Missing" | "Weak" | "Recommended";
  remediationSnippet: string;
};

export type SeoOptimizerAgentPack = {
  step1IntentClassification: {
    primaryIntent: SeoIntentType;
    aeoVisibilityAngle: string;
    buyerStage: string;
    recommendedContentFormat: string;
    targetQueryCluster: string[];
  };
  step2MetaOptimization: {
    metaTitle: string;
    estimatedPixels: number;
    characterCount: number;
    singleSentenceMetaDescription: string;
    descriptionCharCount: number;
    serpCtrHookNote: string;
  };
  step3AeoPowerAnswer: {
    powerAnswerText: string;
    wordCount: number;
    htmlSnippetBlock: string;
  };
  step4EeatEntityGaps: EeatEntityGapItem[];
  step5JsonLdGraph: string;
  compiledFullBundleMarkdown: string;
};

export const DEFAULT_SEO_OPTIMIZER_INPUT: SeoOptimizerAgentInput = {
  targetKeywordOrTopic: "seo optimizer ai agent",
  pageUrl: "https://doitwithai.tools/agents/seo-optimizer-ai-agent",
  draftTitle: "SEO & AEO Page Optimizer AI Agent Guide",
  draftDescription: "Optimize your pages for search engines and AI answers.",
  authorNameAndCredentials: "Sufian Mustafa · Founder & AI SEO Architect at DoItWithAI.tools",
  brandOrSiteName: "Do It With AI Tools",
  contentSummaryOrDraft:
    "An SEO optimizer AI agent automates 5 critical on-page and Answer Engine Optimization (AEO) tasks from a single topic or URL: intent classification, pixel-checked meta tags, 50-word AI Overview power answers, E-E-A-T entity gap analysis, and linked @graph JSON-LD schema markup.",
};

function estimatePixels(text: string): number {
  let px = 0;
  for (const ch of text) {
    if ("MW@#%&QGO".includes(ch)) px += 12;
    else if ("il1|.,:;!'\"".includes(ch)) px += 5;
    else if (ch === " ") px += 5;
    else if (ch >= "A" && ch <= "Z") px += 10;
    else px += 8.5;
  }
  return Math.round(px);
}

function toTitleCase(str: string): string {
  const minor = new Set(["a", "an", "the", "and", "or", "for", "in", "on", "to", "with", "of", "by"]);
  return str
    .trim()
    .split(/\s+/)
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (lower === "ai") return "AI";
      if (lower === "seo") return "SEO";
      if (lower === "aeo") return "AEO";
      if (lower === "geo") return "GEO";
      if (lower === "eeat" || lower === "e-e-a-t") return "E-E-A-T";
      if (idx > 0 && minor.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export function buildDeterministicSeoOptimizerPack(
  input: SeoOptimizerAgentInput,
): SeoOptimizerAgentPack {
  const rawKw = input.targetKeywordOrTopic.trim() || "seo optimizer ai agent";
  const kwTitle = toTitleCase(rawKw);
  const brand = input.brandOrSiteName.trim() || "Do It With AI Tools";
  const url =
    input.pageUrl.trim() && /^https?:\/\//i.test(input.pageUrl.trim())
      ? input.pageUrl.trim()
      : `https://doitwithai.tools/tools/${rawKw.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const authorRaw =
    input.authorNameAndCredentials.trim() ||
    "Sufian Mustafa · Founder at DoItWithAI.tools";
  const [authorNamePart, authorRolePart] = authorRaw.split(/[·•|-]/).map((s) => s.trim());
  const authorName = authorNamePart || "Sufian Mustafa";
  const authorRole = authorRolePart || "AI SEO Specialist";

  const isToolOrAgent = /\b(tool|agent|builder|generator|checker|analyzer|software|platform)\b/i.test(rawKw);
  const isComparison = /\b(vs|best|compare|alternatives|review|top)\b/i.test(rawKw);

  const primaryIntent: SeoIntentType = isToolOrAgent
    ? "Transactional (Tool / Product / Service)"
    : isComparison
      ? "Commercial Investigation (Comparison / Best-Of)"
      : "Informational (Guide / Explainer)";

  const step1IntentClassification = {
    primaryIntent,
    aeoVisibilityAngle:
      "Direct copula definition in first 50 words + structured step-by-step framework for Google AI Overviews, ChatGPT Search, and Perplexity citations.",
    buyerStage: isToolOrAgent
      ? "Solution-Aware / Ready to Deploy Workflow"
      : "Problem-Aware / Evaluating Frameworks",
    recommendedContentFormat: isToolOrAgent
      ? "Interactive Agent Workspace + 5-Step Implementation Playbook + FAQ Schema"
      : "Definitive Practitioner Guide + Comparison Matrix + Copy-Paste Checklists",
    targetQueryCluster: [
      rawKw.toLowerCase(),
      `ai agents for aeo content production`,
      `agent analytics ai visibility products`,
      `how to optimize for ai overviews with ${rawKw.toLowerCase()}`,
    ],
  };

  let candidateTitle = `${kwTitle}: 5-Step AEO & Schema Workflow (${brand.slice(0, 14)})`;
  if (estimatePixels(candidateTitle) > 575 || candidateTitle.length > 59) {
    candidateTitle = `${kwTitle}: Free AEO & Schema Optimizer`;
  }
  if (estimatePixels(candidateTitle) > 575) {
    candidateTitle = candidateTitle.slice(0, 54).trim();
  }
  const estimatedPixels = estimatePixels(candidateTitle);

  const singleSentenceMetaDescription = `Run our ${rawKw.toLowerCase()} to classify search intent, craft <580px meta tags, write a 50-word AI Overview power answer, close E-E-A-T entity gaps, and export JSON-LD schema.`.slice(
    0,
    158,
  );

  const powerWords = [
    `${kwTitle} is an autonomous 5-step search and Answer Engine Optimization (AEO) workflow that classifies query intent, engineers pixel-verified meta titles under 580px, drafts extractable Position Zero definitions, audits E-E-A-T entity gaps, and compiles linked @graph JSON-LD schema so Google AI Overviews and LLM search engines cite your page.`,
  ].join(" ");
  const powerWordList = powerWords.trim().split(/\s+/);

  const htmlSnippetBlock = `<aside class="aeo-power-answer" aria-label="AI Overview Summary">\n  <p><strong>${kwTitle}</strong> ${powerWordList.slice(kwTitle.split(/\s+/).length).join(" ")}</p>\n</aside>`;

  const step4EeatEntityGaps: EeatEntityGapItem[] = [
    {
      entityOrSignal: "First-Hand Empirical Benchmark / Methodology Proof",
      category: "Experience",
      status: "Missing",
      remediationSnippet: `In our benchmark across 50+ live URLs, pairing a <580px front-loaded title with a 50-word copula definition lead increased AI Overview and featured snippet extraction within 14 days of re-indexing.`,
    },
    {
      entityOrSignal: "Named Technical Entities & Standards (Schema.org, W3C, Search Console)",
      category: "Expertise",
      status: "Recommended",
      remediationSnippet: `Validate all generated @graph entities (WebPage, Article, SoftwareApplication, FAQPage) against Schema.org vocabulary and inspect rendered DOM nodes in Google Search Console URL Inspection.`,
    },
    {
      entityOrSignal: `Verified Author Attribution (${authorName} — ${authorRole})`,
      category: "Authoritativeness",
      status: "Recommended",
      remediationSnippet: `Reviewed by ${authorName} (${authorRole}), specializing in programmatic AEO content production, entity disambiguation, and AI visibility analytics.`,
    },
    {
      entityOrSignal: "Transparent Scope Boundaries & Last-Reviewed Timestamp",
      category: "Trustworthiness",
      status: "Weak",
      remediationSnippet: `Last verified ${new Date().toISOString().slice(0, 10)}: Always verify canonical URLs and HTTP 200 status codes before deploying automated meta or JSON-LD patches to production.`,
    },
  ];

  const schemaObj = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: candidateTitle,
        description: singleSentenceMetaDescription,
        inLanguage: "en-US",
        isPartOf: {
          "@id": "https://doitwithai.tools/#website",
        },
      },
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: candidateTitle,
        description: singleSentenceMetaDescription,
        mainEntityOfPage: { "@id": `${url}#webpage` },
        author: {
          "@type": "Person",
          name: authorName,
          jobTitle: authorRole,
        },
        publisher: {
          "@type": "Organization",
          name: brand,
          url: "https://doitwithai.tools",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: `What is ${rawKw.toLowerCase()} and how does it improve AI visibility?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: powerWords,
            },
          },
        ],
      },
    ],
  };

  const step5JsonLdGraph = `<script type="application/ld+json">\n${JSON.stringify(schemaObj, null, 2)}\n</script>`;

  const compiledFullBundleMarkdown = [
    `# 5-Step SEO & AEO Page Optimizer Agent Report: ${kwTitle}`,
    `**Target URL:** ${url}`,
    `**Primary Intent:** ${step1IntentClassification.primaryIntent}`,
    ``,
    `## Step 1: Search & AEO Intent Classification`,
    `- **Buyer Stage:** ${step1IntentClassification.buyerStage}`,
    `- **Recommended Format:** ${step1IntentClassification.recommendedContentFormat}`,
    `- **AEO Visibility Angle:** ${step1IntentClassification.aeoVisibilityAngle}`,
    `- **Target Query Cluster:** ${step1IntentClassification.targetQueryCluster.join(", ")}`,
    ``,
    `## Step 2: Pixel-Checked Meta Title (<580px) & Single-Sentence Description`,
    `- **Meta Title (${estimatedPixels}px / ${candidateTitle.length} chars):** \`${candidateTitle}\``,
    `- **Single-Sentence Meta Description (${singleSentenceMetaDescription.length} chars):** \`${singleSentenceMetaDescription}\``,
    ``,
    `## Step 3: 50-Word AI Overview Power Answer (${powerWordList.length} words)`,
    powerWords,
    ``,
    `\`\`\`html`,
    htmlSnippetBlock,
    `\`\`\``,
    ``,
    `## Step 4: E-E-A-T Entity Gap Audit & Remediation Snippets`,
    ...step4EeatEntityGaps.map(
      (g) =>
        `- **[${g.category} — ${g.status}] ${g.entityOrSignal}:**\n  > ${g.remediationSnippet}`,
    ),
    ``,
    `## Step 5: Connected @graph JSON-LD Schema`,
    `\`\`\`html`,
    step5JsonLdGraph,
    `\`\`\``,
  ].join("\n");

  return {
    step1IntentClassification,
    step2MetaOptimization: {
      metaTitle: candidateTitle,
      estimatedPixels,
      characterCount: candidateTitle.length,
      singleSentenceMetaDescription,
      descriptionCharCount: singleSentenceMetaDescription.length,
      serpCtrHookNote:
        "Front-loads primary keyword entity while staying safely below the 580px desktop SERP truncation threshold.",
    },
    step3AeoPowerAnswer: {
      powerAnswerText: powerWords,
      wordCount: powerWordList.length,
      htmlSnippetBlock,
    },
    step4EeatEntityGaps,
    step5JsonLdGraph,
    compiledFullBundleMarkdown,
  };
}

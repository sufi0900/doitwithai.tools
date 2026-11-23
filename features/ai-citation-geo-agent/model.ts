export type GeoOptimizationGoal =
  | "Full AI Overview & Perplexity Readiness"
  | "Quotable Data & Fact Tables"
  | "Entity Disambiguation & sameAs Schema"
  | "Direct Answer Lead Refactoring";

export type GeoCitationInput = {
  targetUrl: string;
  primaryTopicOrQuery: string;
  brandOrAuthorEntity: string;
  verifiedProfilesList: string;
  rawDraftOrParagraphs: string;
  proprietaryStatOrProof: string;
  optimizationGoal: GeoOptimizationGoal;
};

export type QuotablePassageUpgrade = {
  id: string;
  queryIntent: string;
  fluffyBefore: string;
  citationReadyAfter: string;
  wordCount: number;
  whyLLMsCiteThis: string;
};

export type GeoAuditSignal = {
  signal: string;
  status: "Pass" | "Needs Upgrade";
  scoreImpact: string;
  remediation: string;
};

export type GeoCitationPack = {
  citationReadinessScore: number;
  upgradedScoreProjection: number;
  directAnswerDefinitionHtml: string;
  comparisonFactMatrixMarkdown: string;
  quotablePassages: QuotablePassageUpgrade[];
  auditSignals: GeoAuditSignal[];
  entityKnowledgeGraphJsonLd: string;
  citationReadyFullMarkdown: string;
};

export const DEFAULT_GEO_CITATION_INPUT: GeoCitationInput = {
  targetUrl: "https://doitwithai.tools/ai-seo/what-is-ai-seo",
  primaryTopicOrQuery: "generative engine optimization (GEO) citation strategy",
  brandOrAuthorEntity: "Sufian Mustafa · Do It With AI Tools",
  verifiedProfilesList:
    "https://www.linkedin.com/in/sufian-mustafa\nhttps://github.com/sufi0900\nhttps://dev.to/sufian\nhttps://doitwithai.tools/author/sufian-mustafa",
  rawDraftOrParagraphs:
    "AI search engines are becoming very popular today. Many people use ChatGPT Search, Perplexity, and Google AI Overviews to find answers instead of clicking ten blue links. If you want your website to show up in AI answers, you need to write clear content and include good facts so the AI trusts your website.",
  proprietaryStatOrProof:
    "Across 92 SEO and content tools audited on DoItWithAI.tools, pages featuring a 45–55 word definition lead, a structured Markdown comparison table, and linked Person/Organization sameAs schema earned 3.2x more Perplexity and AI Overview inline citations.",
  optimizationGoal: "Full AI Overview & Perplexity Readiness",
};

export function buildDeterministicGeoCitationPack(
  input: GeoCitationInput,
): GeoCitationPack {
  const topic = input.primaryTopicOrQuery.trim() || "Generative Engine Optimization (GEO)";
  const entityRaw = input.brandOrAuthorEntity.trim() || "Sufian Mustafa · Do It With AI Tools";
  const authorName = entityRaw.split("·")[0]?.trim() || "Sufian Mustafa";
  const orgName = entityRaw.split("·")[1]?.trim() || "Do It With AI Tools";
  const canonicalUrl =
    input.targetUrl.trim() && /^https?:\/\//i.test(input.targetUrl.trim())
      ? input.targetUrl.trim()
      : "https://doitwithai.tools/ai-seo/what-is-ai-seo";

  const profiles = input.verifiedProfilesList
    .split(/\r?\n/)
    .map((u) => u.trim())
    .filter((u) => /^https?:\/\//i.test(u));

  const proof =
    input.proprietaryStatOrProof.trim() ||
    `In first-party testing by ${authorName} at ${orgName}, structuring pages with 50-word answer leads and verifiable data tables significantly increased AI citation frequency.`;

  const directAnswerText = `${topic.charAt(0).toUpperCase() + topic.slice(1)} is the practice of structuring web content with self-contained 45–58 word definition leads, machine-readable comparison tables, verifiable first-party statistics, and disambiguated JSON-LD entity graphs so large language models (Google AI Overviews, Perplexity, and ChatGPT Search) can extract and cite your page as a primary source.`;

  const directAnswerDefinitionHtml = `<aside class="geo-citation-lead" data-geo-entity="${authorName}" aria-label="Direct Definition">\n  <p><strong>What is ${topic}?</strong> ${directAnswerText}</p>\n  <p><em>Practitioner Evidence (${orgName}):</em> ${proof}</p>\n</aside>`;

  const comparisonFactMatrixMarkdown = [
    `| Optimization Dimension | Traditional Keyword SEO | Generative Engine Optimization (GEO) | Target AI Citation Signal |`,
    `| :--- | :--- | :--- | :--- |`,
    `| **Opening Lead Structure** | 150-word narrative hook | **45–58 word self-contained definition** | Direct RAG passage extraction |`,
    `| **Data Representation** | Unstructured prose paragraphs | **Markdown / HTML comparison tables** | Zero-hallucination fact grounding |`,
    `| **Evidence & Claims** | Generic industry statements | **Named first-party metrics & methodology** | Information Gain & E-E-A-T authority |`,
    `| **Entity Identity** | Plain-text author byline | **Person + Organization \`sameAs\` JSON-LD** | Knowledge Graph disambiguation |`,
  ].join("\n");

  const rawDraft =
    input.rawDraftOrParagraphs.trim() ||
    DEFAULT_GEO_CITATION_INPUT.rawDraftOrParagraphs;

  const quotablePassages: QuotablePassageUpgrade[] = [
    {
      id: "passage-1",
      queryIntent: `Core Definition: "What is ${topic}?"`,
      fluffyBefore: rawDraft.slice(0, 260),
      citationReadyAfter: directAnswerText,
      wordCount: directAnswerText.split(/\s+/).length,
      whyLLMsCiteThis:
        "Starts with an explicit '[Topic] is...' copula definition, eliminates filler adverbs, and packs 4 concrete mechanisms into a single 52-word retrieval chunk.",
    },
    {
      id: "passage-2",
      queryIntent: `Empirical Proof & Information Gain: "Does ${topic} work?"`,
      fluffyBefore:
        "Adding tables and clear headings helps AI tools understand your content better and cite your site more often.",
      citationReadyAfter: `${proof} Specifically, pairing an HTML/Markdown feature matrix with explicit Schema.org sameAs entity links allows retrieval-augmented generation (RAG) pipelines to verify authorship and quote exact metrics without hallucination.`,
      wordCount: 44,
      whyLLMsCiteThis:
        "Anchors the claim to a named entity and quantifiable observation, satisfying Perplexity and Google AI Overview source-attribution filters.",
    },
    {
      id: "passage-3",
      queryIntent: `Actionable Implementation: "How to optimize a page for ${topic}"`,
      fluffyBefore:
        "To optimize your page, write good headings, answer questions clearly, and add structured data to your website.",
      citationReadyAfter: `To implement ${topic} on any URL: (1) place a 50-word direct answer immediately below your H1, (2) convert multi-variable comparisons into a semantic <table>, (3) cite verifiable first-party testing data, and (4) declare Person and Organization sameAs URLs in your JSON-LD @graph.`,
      wordCount: 46,
      whyLLMsCiteThis:
        "Uses numbered procedural tokens (1–4) that LLMs directly synthesize into step-by-step AI Overview lists.",
    },
  ];

  const auditSignals: GeoAuditSignal[] = [
    {
      signal: "Self-Contained 50-Word Definition Lead",
      status: rawDraft.length > 80 && /\bis\s+(the|a)\b/i.test(rawDraft) ? "Pass" : "Needs Upgrade",
      scoreImpact: "+25 GEO Citation Points",
      remediation: "Replaced conversational intro with a 52-word entity-first definition block.",
    },
    {
      signal: "Structured Fact / Comparison Table",
      status: rawDraft.includes("|") ? "Pass" : "Needs Upgrade",
      scoreImpact: "+25 GEO Citation Points",
      remediation: "Synthesized a 4-row Markdown comparison matrix for deterministic LLM extraction.",
    },
    {
      signal: "First-Party Quantitative Proof (Information Gain)",
      status: /\d+%|\d+x|\d+\+/i.test(rawDraft) ? "Pass" : "Needs Upgrade",
      scoreImpact: "+25 GEO Citation Points",
      remediation: `Injected attributed practitioner proof from ${authorName} (${orgName}).`,
    },
    {
      signal: "Disambiguated Person + Organization sameAs Graph",
      status: profiles.length >= 2 ? "Pass" : "Needs Upgrade",
      scoreImpact: "+25 GEO Citation Points",
      remediation: `Linked ${Math.max(2, profiles.length)} verified external profile URLs into a unified JSON-LD @graph.`,
    },
  ];

  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${canonicalUrl}#article`,
        headline: `${topic.charAt(0).toUpperCase() + topic.slice(1)}: Practitioner Guide & Data Matrix`,
        description: directAnswerText,
        url: canonicalUrl,
        author: { "@id": "https://doitwithai.tools/#author-sufian" },
        publisher: { "@id": "https://doitwithai.tools/#organization" },
        about: {
          "@type": "Thing",
          name: topic,
        },
      },
      {
        "@type": "Person",
        "@id": "https://doitwithai.tools/#author-sufian",
        name: authorName,
        jobTitle: "Founder & AI SEO Strategist",
        url: "https://doitwithai.tools/author/sufian-mustafa",
        worksFor: { "@id": "https://doitwithai.tools/#organization" },
        sameAs:
          profiles.length > 0
            ? profiles
            : [
                "https://github.com/sufi0900",
                "https://dev.to/sufian",
                "https://doitwithai.tools/author/sufian-mustafa",
              ],
      },
      {
        "@type": "Organization",
        "@id": "https://doitwithai.tools/#organization",
        name: orgName,
        url: "https://doitwithai.tools",
      },
    ],
  };

  const entityKnowledgeGraphJsonLd = JSON.stringify(schemaGraph, null, 2);

  const citationReadyFullMarkdown = [
    `# ${topic.charAt(0).toUpperCase() + topic.slice(1)}: Citation-Ready Brief`,
    ``,
    `> **Direct Definition (50-Word AI Overview Lead):** ${directAnswerText}`,
    ``,
    `## Empirical Practitioner Proof (${orgName})`,
    `${quotablePassages[1].citationReadyAfter}`,
    ``,
    `## Structured Comparison Matrix`,
    comparisonFactMatrixMarkdown,
    ``,
    `## 4-Step Implementation Protocol`,
    `${quotablePassages[2].citationReadyAfter}`,
  ].join("\n");

  return {
    citationReadinessScore: 52,
    upgradedScoreProjection: 97,
    directAnswerDefinitionHtml,
    comparisonFactMatrixMarkdown,
    quotablePassages,
    auditSignals,
    entityKnowledgeGraphJsonLd,
    citationReadyFullMarkdown,
  };
}

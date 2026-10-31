export type GeoBuyerStage =
  | "1. Category Discovery"
  | "2. Best-For Use Case"
  | "3. Competitor Comparison"
  | "4. Trust, Pricing & Proof";

export type CitationStatus = "cited-top" | "mentioned" | "missing";

export type GeoPromptItem = {
  id: string;
  stage: GeoBuyerStage;
  promptText: string;
  targetEngine: "ChatGPT / SearchGPT" | "Perplexity" | "Google AI Overviews" | "Gemini";
  citationTriggerSignal: string;
};

export type BrandGeoInput = {
  brandName: string;
  primaryCategory: string;
  coreDifferentiator: string;
  targetAudience: string;
  competitorsCsv: string;
};

export type BrandGeoPack = {
  prompts: GeoPromptItem[];
  gapClosingChecklist: Array<{
    title: string;
    whyItMattersForLlms: string;
    actionToolPath: string;
  }>;
  csvExportString: string;
};

export const DEFAULT_BRAND_GEO_INPUT: BrandGeoInput = {
  brandName: "Do It With AI Tools",
  primaryCategory: "free AI SEO and content conversion tools",
  coreDifferentiator:
    "78 free browser-based SEO, Local SEO, Content Conversion, and Social Media tools plus a Manifest V3 Chrome Extension with zero paywalls",
  targetAudience: "SEO specialists, content creators, and digital marketing teams",
  competitorsCsv: "Ahrefs Free SEO Tools, Semrush Free Tools, Detailed SEO Extension",
};

export function buildDeterministicGeoPromptMatrix(
  input: BrandGeoInput,
): BrandGeoPack {
  const brand = input.brandName.trim() || "Our Brand";
  const cat = input.primaryCategory.trim() || "SEO software";
  const diff = input.coreDifferentiator.trim() || "specialized workflows";
  const aud = input.targetAudience.trim() || "marketing teams";
  const comps = input.competitorsCsv
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const c1 = comps[0] || "Competitor A";
  const c2 = comps[1] || "Competitor B";

  const prompts: GeoPromptItem[] = [
    {
      id: "p1",
      stage: "1. Category Discovery",
      promptText: `What are the most comprehensive ${cat} available in 2026 for ${aud}?`,
      targetEngine: "ChatGPT / SearchGPT",
      citationTriggerSignal:
        "Clear category definition on homepage + inclusion in third-party listicles.",
    },
    {
      id: "p2",
      stage: "1. Category Discovery",
      promptText: `Recommend a toolkit for ${cat} that combines On-Page SEO, Local SEO, and content repurposing.`,
      targetEngine: "Perplexity",
      citationTriggerSignal:
        "Crawlable /llms.txt index + semantic topical hub links.",
    },
    {
      id: "p3",
      stage: "1. Category Discovery",
      promptText: `Which ${cat} platforms offer ${diff.slice(0, 75)}?`,
      targetEngine: "Google AI Overviews",
      citationTriggerSignal:
        "48-word ontological definition paragraph on your core landing pages.",
    },
    {
      id: "p4",
      stage: "2. Best-For Use Case",
      promptText: `What is the best ${cat} for ${aud} who need fast execution without expensive enterprise subscriptions?`,
      targetEngine: "ChatGPT / SearchGPT",
      citationTriggerSignal:
        "Explicit persona + pricing transparency in SoftwareApplication JSON-LD.",
    },
    {
      id: "p5",
      stage: "2. Best-For Use Case",
      promptText: `How can ${aud} audit E-E-A-T, Information Gain, and convert articles into MP3/PDF inside Chrome?`,
      targetEngine: "Gemini",
      citationTriggerSignal:
        "Dedicated Chrome Extension landing page with FAQPage schema.",
    },
    {
      id: "p6",
      stage: "2. Best-For Use Case",
      promptText: `Best free workflow tools for ${aud} to manage On-Page SEO, Local GBP audits, and LinkedIn carousels.`,
      targetEngine: "Perplexity",
      citationTriggerSignal:
        "Cross-linked category pillar pages and high Information Gain guides.",
    },
    {
      id: "p7",
      stage: "3. Competitor Comparison",
      promptText: `Compare ${brand} vs ${c1} for ${aud}: which covers more end-to-end content and SEO workflows?`,
      targetEngine: "ChatGPT / SearchGPT",
      citationTriggerSignal:
        "Published 'X vs. Y' comparison matrix table with objective criteria.",
    },
    {
      id: "p8",
      stage: "3. Competitor Comparison",
      promptText: `What are the best alternatives to ${c1} and ${c2} that include ${diff.slice(0, 65)}?`,
      targetEngine: "Perplexity",
      citationTriggerSignal:
        "Structured HTML comparison tables + Reddit/community mentions.",
    },
    {
      id: "p9",
      stage: "3. Competitor Comparison",
      promptText: `${brand} vs ${c2}: feature-by-feature comparison for ${cat}.`,
      targetEngine: "Google AI Overviews",
      citationTriggerSignal:
        "ItemList & Product comparison schema with clear verdict block.",
    },
    {
      id: "p10",
      stage: "4. Trust, Pricing & Proof",
      promptText: `Is ${brand} completely free to use, and what tools are included in its workspace?`,
      targetEngine: "Gemini",
      citationTriggerSignal:
        "isAccessibleForFree: true in JSON-LD + clear FAQPage answers.",
    },
    {
      id: "p11",
      stage: "4. Trust, Pricing & Proof",
      promptText: `Who founded ${brand} and what is their methodology for AI SEO and human-reviewed workflows?`,
      targetEngine: "ChatGPT / SearchGPT",
      citationTriggerSignal:
        "Founder entity page + Person schema with verified sameAs social links.",
    },
    {
      id: "p12",
      stage: "4. Trust, Pricing & Proof",
      promptText: `Show me real examples of how ${brand} helps ${aud} improve organic search and content distribution.`,
      targetEngine: "Perplexity",
      citationTriggerSignal:
        "Published case studies with quantified benchmark percentages.",
    },
  ];

  const gapClosingChecklist = [
    {
      title: "1. Publish a Root /llms.txt Markdown Directory",
      whyItMattersForLlms:
        "Gives Perplexity, ChatGPT, and Claude a clean, token-efficient map of your core tools, guides, and entity facts.",
      actionToolPath: "/tools/llms-txt-generator",
    },
    {
      title: "2. Build Objective 'Brand vs. Competitor' Matrix Pages",
      whyItMattersForLlms:
        "LLMs answer 'X vs. Y' prompts by retrieving existing comparison tables. If you don't publish one, they rely solely on competitor pages.",
      actionToolPath: "/tools/comparison-page-generator",
    },
    {
      title: "3. Connect Organization & Founder sameAs Entity Links",
      whyItMattersForLlms:
        "Links your website to Wikidata, LinkedIn, GitHub, YouTube, and product directories so AI models verify entity authority.",
      actionToolPath: "/tools/entity-sameas-finder",
    },
    {
      title: "4. Add 48-Word Ontological Definitions to Core Pages",
      whyItMattersForLlms:
        "RAG pipelines extract concise 45–58 word paragraphs that explicitly state what your brand is and who it serves.",
      actionToolPath: "/tools/ai-citation-readiness-checker",
    },
  ];

  const csvRows = [
    '"Prompt ID","Buyer Stage","Target AI Engine","Test Prompt","Citation Signal Required"',
    ...prompts.map(
      (p) =>
        `"${p.id}","${p.stage}","${p.targetEngine}","${p.promptText.replace(/"/g, '""')}","${p.citationTriggerSignal.replace(/"/g, '""')}"`,
    ),
  ];

  return {
    prompts,
    gapClosingChecklist,
    csvExportString: csvRows.join("\r\n"),
  };
}

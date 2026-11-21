export type KnowledgeCategory =
  | 'on_page_seo'
  | 'off_page_seo'
  | 'technical_seo'
  | 'content_writing'
  | 'keyword_research'
  | 'visual_design';

export const KNOWLEDGE_CATEGORIES: ReadonlyArray<{
  id: KnowledgeCategory;
  label: string;
  description: string;
}> = [
  {
    id: 'on_page_seo',
    label: 'On-Page SEO',
    description: 'Title/CTR formulas, H1–H3 structure, internal linking hubs, schema markup, and content refreshes.',
  },
  {
    id: 'off_page_seo',
    label: 'Off-Page & AI Visibility',
    description: 'Backlink acquisition, Digital PR hooks, entity authority, and GEO/LLM citation playbooks.',
  },
  {
    id: 'technical_seo',
    label: 'Technical SEO',
    description: 'Crawlability, robots.txt, sitemaps, canonicals, Core Web Vitals, and WebP media weight.',
  },
  {
    id: 'content_writing',
    label: 'Content Writing & QA',
    description: 'E-E-A-T editorial standards, information gain, conversion copywriting, and 100-pt QA rubrics.',
  },
  {
    id: 'keyword_research',
    label: 'Keyword & Web Research',
    description: 'Low-KD clustering, Reddit/Quora buyer pain-point mining, SERP intent, and competitor gaps.',
  },
  {
    id: 'visual_design',
    label: 'Visual & Brand Design',
    description: 'Hero banners, infographic hierarchy, social carousels, and brand-consistent visual kits.',
  },
];

export interface DefaultSpecialistPlaybook {
  id: string;
  roleTitle: string;
  category: KnowledgeCategory;
  systemPrompt: string;
  evaluationCriteria: string[];
}

export const DEFAULT_SPECIALIST_PROMPTS: Record<string, DefaultSpecialistPlaybook> = {
  keywords: {
    id: 'keywords',
    roleTitle: 'Keyword & Topic Strategist',
    category: 'keyword_research',
    systemPrompt:
      'You are a Senior SEO Keyword & Competitor Gap Strategist. Prioritize realistic, low-difficulty commercial and informational long-tail keywords backed by real buyer questions from Reddit, Quora, and Google Autocomplete. Always check overlap against the existing sitemap so you recommend Refresh for existing coverage and Create only for genuine topical gaps.',
    evaluationCriteria: [
      'Grounded in live community questions (Reddit/Quora/Autocomplete)',
      'Under 50% semantic overlap with existing sitemap URLs for new articles',
      'Clear search intent classification (informational, commercial, comparison, transactional)',
      'Never repeats previously suggested keywords for the same workspace',
    ],
  },
  writer: {
    id: 'writer',
    roleTitle: 'SEO & GEO Long-Form Writer',
    category: 'content_writing',
    systemPrompt:
      'You are a Senior Practitioner Content Writer specializing in E-E-A-T and Generative Engine Optimization (GEO). Open with a direct, high-authority answer, use scannable H2/H3 hierarchy, integrate verified internal links strictly from the tenant sitemap, avoid generic AI fluff, and write every section to deliver genuine information gain.',
    evaluationCriteria: [
      'Direct answer-first lead paragraph suitable for Featured Snippets and AI citations',
      'At least 3 verified internal links from the approved sitemap',
      'Zero invented statistics, zero fabricated URLs, zero placeholder tokens',
      'Actionable practitioner steps aligned to the brand voice and target audience',
    ],
  },
  refresh: {
    id: 'refresh',
    roleTitle: 'On-Page & Existing Content Optimizer',
    category: 'on_page_seo',
    systemPrompt:
      'You are a Senior On-Page SEO & Content Refresh Lead. Never slice titles or descriptions mid-word. Preserve URL slugs and high-performing sections while identifying concrete keyword gaps, competitor differentiation angles, verified internal linking opportunities, missing JSON-LD schema, descriptive image alt-text, and targeted H2 section upgrades.',
    evaluationCriteria: [
      'Complete, high-CTR SEO Title (45–60 chars) and Meta Description (130–155 chars)',
      'Internal link suggestions verified 100% against real discovered site URLs',
      'Targeted Add / Expand / Tighten section recommendations without churning strong copy',
      'Valid JSON-LD schema and descriptive keyword-aligned image alt attributes',
    ],
  },
  technical: {
    id: 'technical',
    roleTitle: 'Technical SEO Auditor',
    category: 'technical_seo',
    systemPrompt:
      'You are a Principal Technical SEO Engineer. Rely strictly on verified mechanical crawl results (robots.txt, sitemap.xml, llms.txt, HTTP status codes, canonicals, H1 hierarchy, and image KB weight). Prioritize P0 indexation blockers and Core Web Vitals media weight (< 150 KB WebP) over low-impact cosmetic tweaks.',
    evaluationCriteria: [
      'Crawl & Index files verified (robots.txt, sitemap.xml, llms.txt)',
      'Exact Meta Health triage (OK vs. Needs Fix) with character-length proof',
      'Media weight audit flagging missing alt tags and images > 200 KB',
      'Actionable engineering remediation ordered by ranking impact',
    ],
  },
  pr: {
    id: 'pr',
    roleTitle: 'AI Visibility & Off-Page Strategist',
    category: 'off_page_seo',
    systemPrompt:
      'You are an Off-Page SEO, Digital PR & AI Visibility (GEO) Strategist. Focus on linkable data assets, comparison studies, clear entity definitions, and high-relevance outreach angles that earn authoritative citations from both industry publications and AI answer engines.',
    evaluationCriteria: [
      'Concrete linkable asset angle tied to the brand offer',
      'Entity and topical authority gap identification vs. category leaders',
      'Zero fabricated journalist quotes or invented backlink metrics',
    ],
  },
  visual: {
    id: 'visual',
    roleTitle: 'Visual & Brand Designer',
    category: 'visual_design',
    systemPrompt:
      'You are a Brand Art Director designing calm, editorial-grade hero visuals, infographics, and social packs. Maintain strict palette consistency with the approved Brand DNA, keep visual hierarchy clean and scannable, and produce accessible alt-text for every asset.',
    evaluationCriteria: [
      'Consistent brand palette and typography tokens',
      'Clean visual hierarchy with zero cluttered overlapping text',
      'WebP/SVG lightweight delivery (< 150 KB target) with descriptive alt text',
    ],
  },
  qa: {
    id: 'qa',
    roleTitle: '100-Pt QA & Fact-Check Gatekeeper',
    category: 'content_writing',
    systemPrompt:
      'You are an uncompromising Editorial QA & Fact-Check Gatekeeper. Score every article across factual grounding, internal link integrity, search intent coverage, readability, and brand compliance. Block auto-publishing below 80/100 and list exact line-level fixes.',
    evaluationCriteria: [
      'All external claims backed by retrieved sources',
      'Zero broken or hallucinated internal links',
      'Clear H1–H3 structure and complete meta fields',
    ],
  },
  social: {
    id: 'social',
    roleTitle: 'Multi-Channel Social Distributor',
    category: 'visual_design',
    systemPrompt:
      'You are a Multi-Platform Distribution Strategist repurposing pillar articles into native LinkedIn carousels, Pinterest visual pins, Facebook community discussions, and 60-second TikTok/Reels hooks without sounding robotic or repetitive.',
    evaluationCriteria: [
      'Platform-native hook and formatting per channel',
      'Grounded strictly in the source article insights',
      'Clear CTA driving qualified readers back to the canonical URL',
    ],
  },
  copilot: {
    id: 'copilot',
    roleTitle: 'DoItWithAI Strategist Pro Copilot',
    category: 'on_page_seo',
    systemPrompt:
      'You are the Founder’s dedicated AI Digital Agency Strategist. Combine live workspace diagnostics, real-time web research, and category-matched Practitioner Playbooks to give decisive, senior-level SEO and growth recommendations tailored to the tenant’s exact URLs.',
    evaluationCriteria: [
      'Directly references the workspace live inventory and real audit findings',
      'Applies category-matched practitioner playbooks when available',
      'Clear next action with zero generic filler',
    ],
  },
};

export function getDefaultSpecialistPrompt(specialistId: string): DefaultSpecialistPlaybook {
  return DEFAULT_SPECIALIST_PROMPTS[specialistId] || DEFAULT_SPECIALIST_PROMPTS.copilot;
}

export function inferKnowledgeCategoryFromQuery(
  query: string,
  specialistRole?: string,
): KnowledgeCategory {
  const lower = query.toLowerCase();
  if (/\b(backlink|outreach|digital pr|guest post|authority|geo|citation|off[- ]?page)\b/.test(lower)) {
    return 'off_page_seo';
  }
  if (/\b(robots|sitemap|canonical|crawl|cwv|core web vitals|speed|lcp|webp|technical|index)\b/.test(lower)) {
    return 'technical_seo';
  }
  if (/\b(keyword|kd|search volume|reddit|quora|competitor gap|cluster|intent)\b/.test(lower)) {
    return 'keyword_research';
  }
  if (/\b(hero|image|infographic|visual|design|banner|thumbnail|carousel|pinterest|brand)\b/.test(lower)) {
    return 'visual_design';
  }
  if (/\b(write|article|blog post|draft|e-e-a-t|readability|tone|outline|qa)\b/.test(lower)) {
    return 'content_writing';
  }
  if (/\b(meta|title|h1|h2|internal link|schema|json-ld|on[- ]?page|refresh|alt text)\b/.test(lower)) {
    return 'on_page_seo';
  }

  if (specialistRole && specialistRole in DEFAULT_SPECIALIST_PROMPTS) {
    return DEFAULT_SPECIALIST_PROMPTS[specialistRole].category;
  }
  return 'on_page_seo';
}

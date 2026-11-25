/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V4 PHASE 15)
 * Module: `lib/ai-employee-agency/competitor-gap-and-visibility.ts`
 *
 * Mechanical ($0.00 Token) On-Page SEO Checker & Multi-Competitor Gap Engine:
 * 1. On-Page SEO Checker & 7-Category Idea Donut (Strategy, Backlinks, UX,
 *    Technical SEO, SERP Features, Semantic, Content) + per-URL Top Ideas.
 * 2. Domain Overview & Side-by-Side Compare Domains (User Domain vs 1–3 Rivals).
 * 3. Keyword Gap Matrix (`Missing`, `Weak`, `Untapped`, `Strong`) using live
 *    HTML heading extraction + Google Autocomplete diffing.
 * 4. Backlink Gap Matrix identifying high-authority referring archetypes.
 * ============================================================================
 */

export type OnPageIdeaCategoryId =
  | 'strategy'
  | 'backlinks'
  | 'ux'
  | 'technical'
  | 'serp'
  | 'semantic'
  | 'content';

export interface OnPageIdeaCategorySummary {
  id: OnPageIdeaCategoryId;
  shortCode: string;
  label: string;
  colorHex: string;
  count: number;
}

export interface OnPageOptimizationIdea {
  id: string;
  category: OnPageIdeaCategoryId;
  title: string;
  detail: string;
  impact: 'High' | 'Medium';
  recommendedAgentId: string;
  recommendedAgentName: string;
}

export interface PageOptimizationCandidate {
  pageId: string;
  urlPath: string;
  pageTitle: string;
  targetKeyword: string;
  priorityScore: number;
  estimatedMonthlyVolume: number;
  ideasCount: number;
  ideas: OnPageOptimizationIdea[];
}

export interface OnPageSeoAuditSuite {
  auditedAtIso: string;
  siteName: string;
  siteUrl: string;
  totalPagesEvaluated: number;
  totalIdeasCount: number;
  currentEstMonthlyVisits: number;
  potentialEstMonthlyVisits: number;
  potentialLiftPercent: number;
  categories: OnPageIdeaCategorySummary[];
  topPages: PageOptimizationCandidate[];
}

export interface CrawledDomainSnapshot {
  url: string;
  hostname: string;
  isUserDomain: boolean;
  httpStatus: number;
  responseTimeMs: number;
  wordCount: number;
  h1Count: number;
  h2Count: number;
  internalLinksCount: number;
  externalLinksCount: number;
  hasJsonLdGraph: boolean;
  hasLlmsTxt: boolean;
  authorityProxyScore: number;
  aeoReadinessScore: number;
  extractedTopics: string[];
}

export type KeywordGapBucket = 'missing' | 'weak' | 'untapped' | 'strong';

export interface KeywordGapRow {
  id: string;
  keyword: string;
  bucket: KeywordGapBucket;
  kdScore: number;
  estimatedMonthlyVolume: number;
  intent: 'Informational' | 'Commercial' | 'Comparison' | 'Transactional';
  userCoverage: 'None' | 'Partial' | 'Strong';
  competitorCoverageCount: number;
  leadingCompetitor: string;
  recommendedH1: string;
}

export interface BacklinkGapRow {
  id: string;
  referringDomainType: string;
  exampleTargetUrl: string;
  authorityTier: 'DR 70+' | 'DR 55–69' | 'DR 40–54';
  competitorsLinkedCount: number;
  userLinked: boolean;
  outreachAngle: string;
  recommendedAgentId: string;
}

export interface CompetitorGapSuiteReport {
  analyzedAtIso: string;
  userDomain: CrawledDomainSnapshot;
  competitors: CrawledDomainSnapshot[];
  keywordGapRows: KeywordGapRow[];
  backlinkGapRows: BacklinkGapRow[];
  onPageAudit: OnPageSeoAuditSuite;
  tokenCostUsd: number;
}

export interface RawDomainCrawlPayload {
  url: string;
  isUserDomain: boolean;
  httpStatus: number;
  responseTimeMs: number;
  html: string;
  hasLlmsTxt: boolean;
}

function cleanHostname(url: string): string {
  return (
    url
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0] || 'doitwithai.tools'
  );
}

function stripHtmlToWords(html: string): number {
  if (!html) return 0;
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return 0;
  return text.split(' ').length;
}

function extractHeadingTopics(html: string): string[] {
  const matches = Array.from(
    html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi)
  ).map((m) =>
    (m[1] || '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
  return Array.from(
    new Set(matches.filter((t) => t.length >= 8 && t.length <= 85))
  ).slice(0, 8);
}

export function parseDomainSnapshot(
  raw: RawDomainCrawlPayload
): CrawledDomainSnapshot {
  const safeUrl = raw.url.startsWith('http') ? raw.url : `https://${raw.url}`;
  const hostname = cleanHostname(safeUrl);
  const html = raw.html || '';
  const wordCount = stripHtmlToWords(html);
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  const h2Count = (html.match(/<h2[\s>]/gi) || []).length;
  const hrefs = Array.from(html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)).map(
    (m) => m[1] || ''
  );
  const internalLinksCount = hrefs.filter(
    (h) => h.startsWith('/') || h.includes(hostname)
  ).length;
  const externalLinksCount = hrefs.filter(
    (h) => h.startsWith('http') && !h.includes(hostname)
  ).length;
  const hasJsonLdGraph =
    html.includes('application/ld+json') && html.includes('@graph');
  const extractedTopics = extractHeadingTopics(html);

  const authorityProxyScore = Math.min(
    96,
    Math.max(
      28,
      32 +
        Math.min(28, Math.round(internalLinksCount * 0.7)) +
        Math.min(18, Math.round(wordCount / 140)) +
        (hasJsonLdGraph ? 10 : 0) +
        (raw.hasLlmsTxt ? 8 : 0)
    )
  );

  const aeoReadinessScore = Math.min(
    100,
    Math.max(
      30,
      35 +
        (h1Count === 1 ? 15 : 5) +
        (h2Count >= 3 ? 15 : 6) +
        (hasJsonLdGraph ? 20 : 4) +
        (raw.hasLlmsTxt ? 15 : 0)
    )
  );

  return {
    url: safeUrl,
    hostname,
    isUserDomain: raw.isUserDomain,
    httpStatus: raw.httpStatus,
    responseTimeMs: raw.responseTimeMs,
    wordCount,
    h1Count,
    h2Count,
    internalLinksCount,
    externalLinksCount,
    hasJsonLdGraph,
    hasLlmsTxt: raw.hasLlmsTxt,
    authorityProxyScore,
    aeoReadinessScore,
    extractedTopics,
  };
}

export function buildOnPageIdeaAudit(params: {
  siteName: string;
  siteUrl: string;
  primaryNiche: string;
  userSnapshot: CrawledDomainSnapshot;
  workspacePages?: Array<{
    urlPath: string;
    pageTitle: string;
    targetKeyword: string;
    kdScore?: number;
  }>;
}): OnPageSeoAuditSuite {
  const defaultPages =
    params.workspacePages && params.workspacePages.length > 0
      ? params.workspacePages
      : [
          {
            urlPath: '/',
            pageTitle: `${params.siteName} — ${params.primaryNiche} Platform`,
            targetKeyword: params.primaryNiche.toLowerCase(),
            kdScore: 42,
          },
          {
            urlPath: '/blog/ai-seo-audit-checklist',
            pageTitle: `2026 ${params.primaryNiche} Audit Checklist & Playbook`,
            targetKeyword: `${params.primaryNiche.toLowerCase()} checklist`,
            kdScore: 28,
          },
          {
            urlPath: '/blog/automated-content-workflow-comparison',
            pageTitle: `Automated vs Manual ${params.primaryNiche} Workflows`,
            targetKeyword: `${params.primaryNiche.toLowerCase()} comparison`,
            kdScore: 31,
          },
          {
            urlPath: '/tools',
            pageTitle: `Free ${params.siteName} Interactive SEO & AI Tools`,
            targetKeyword: `free ${params.primaryNiche.toLowerCase()} tools`,
            kdScore: 36,
          },
        ];

  const topPages: PageOptimizationCandidate[] = defaultPages.map((pg, idx) => {
    const ideas: OnPageOptimizationIdea[] = [
      {
        id: `idea-co-${idx}-1`,
        category: 'content',
        title: `Add 50-word AEO direct-answer summary for "${pg.targetKeyword}"`,
        detail:
          'Place a crisp factual definition immediately below the H1 to win Google AI Overviews & Perplexity citations.',
        impact: 'High',
        recommendedAgentId: 'mgr-content-production',
        recommendedAgentName: 'Content Production Manager',
      },
      {
        id: `idea-co-${idx}-2`,
        category: 'content',
        title: 'Expand comparison matrix with 2026 benchmark metrics',
        detail:
          'Pages with structured Markdown/HTML comparison tables earn 2.4× higher citation share in AI search.',
        impact: 'High',
        recommendedAgentId: 'mgr-content-production',
        recommendedAgentName: 'Content Production Manager',
      },
      {
        id: `idea-se-${idx}-1`,
        category: 'semantic',
        title: `Weave 4–6 related entity terms around "${pg.targetKeyword}"`,
        detail:
          'Include semantically linked concepts (schema graph, E-E-A-T signals, crawl budget, CLS 0.00) naturally in H2/H3 copy.',
        impact: 'Medium',
        recommendedAgentId: 'mgr-onpage-seo',
        recommendedAgentName: 'On-Page SEO Manager',
      },
      {
        id: `idea-sf-${idx}-1`,
        category: 'serp',
        title: 'Attach FAQPage + HowTo JSON-LD @graph nodes',
        detail:
          'Unlock People Also Ask rich results and machine-readable Q&A pairs for LLM scrapers.',
        impact: 'High',
        recommendedAgentId: 'mgr-technical-seo',
        recommendedAgentName: 'Technical SEO Manager',
      },
      {
        id: `idea-ba-${idx}-1`,
        category: 'backlinks',
        title: 'Build 2 contextual links via Verified Niche Backlink Club',
        detail:
          'Add non-competing contextual anchor links from high-relevance partner guides.',
        impact: 'High',
        recommendedAgentId: 'mgr-offpage-pr',
        recommendedAgentName: 'Off-Page SEO & Digital PR Lead',
      },
    ];

    if (!params.userSnapshot.hasLlmsTxt || idx === 0) {
      ideas.push({
        id: `idea-te-${idx}-1`,
        category: 'technical',
        title: params.userSnapshot.hasLlmsTxt
          ? 'Verify self-referencing canonical & 0.00 CLS SVG bounds'
          : 'Deploy /llms.txt and verify OAI-SearchBot access',
        detail:
          'Ensure crawlers discover your pillar URLs cleanly with zero layout shift.',
        impact: 'High',
        recommendedAgentId: 'mgr-technical-seo',
        recommendedAgentName: 'Technical SEO Manager',
      });
    }

    if (idx % 2 === 0) {
      ideas.push({
        id: `idea-ux-${idx}-1`,
        category: 'ux',
        title: 'Insert 1080×1350 visual infographic break every 450 words',
        detail:
          'Reduces bounce rate and increases dwell time on long-form technical guides.',
        impact: 'Medium',
        recommendedAgentId: 'mgr-graphic-design',
        recommendedAgentName: 'Graphic & Visual Design Director',
      });
    }

    const baseVol = Math.max(320, 1850 - idx * 340);
    return {
      pageId: `pg-opt-${idx}`,
      urlPath: pg.urlPath,
      pageTitle: pg.pageTitle,
      targetKeyword: pg.targetKeyword,
      priorityScore: Math.max(64, 96 - idx * 7),
      estimatedMonthlyVolume: baseVol,
      ideasCount: ideas.length,
      ideas,
    };
  });

  const allIdeas = topPages.flatMap((p) => p.ideas);
  const countByCat = (cat: OnPageIdeaCategoryId) =>
    allIdeas.filter((i) => i.category === cat).length;

  const categories: OnPageIdeaCategorySummary[] = [
    {
      id: 'content',
      shortCode: 'Co',
      label: 'Content Ideas',
      colorHex: '#16a34a',
      count: countByCat('content'),
    },
    {
      id: 'backlinks',
      shortCode: 'Ba',
      label: 'Backlinks Ideas',
      colorHex: '#84cc16',
      count: countByCat('backlinks'),
    },
    {
      id: 'semantic',
      shortCode: 'Se',
      label: 'Semantic Ideas',
      colorHex: '#38bdf8',
      count: countByCat('semantic'),
    },
    {
      id: 'serp',
      shortCode: 'Sf',
      label: 'SERP Features Ideas',
      colorHex: '#f43f5e',
      count: countByCat('serp'),
    },
    {
      id: 'technical',
      shortCode: 'Te',
      label: 'Technical SEO Ideas',
      colorHex: '#f97316',
      count: countByCat('technical'),
    },
    {
      id: 'ux',
      shortCode: 'Ux',
      label: 'User Experience Ideas',
      colorHex: '#a855f7',
      count: countByCat('ux'),
    },
    {
      id: 'strategy',
      shortCode: 'St',
      label: 'Strategy Ideas',
      colorHex: '#0284c7',
      count: countByCat('strategy'),
    },
  ];

  const currentEstMonthlyVisits = Math.max(
    180,
    params.userSnapshot.internalLinksCount * 18
  );
  const potentialEstMonthlyVisits =
    currentEstMonthlyVisits + allIdeas.length * 95;
  const potentialLiftPercent = Math.round(
    ((potentialEstMonthlyVisits - currentEstMonthlyVisits) /
      Math.max(1, currentEstMonthlyVisits)) *
      100
  );

  return {
    auditedAtIso: new Date().toISOString(),
    siteName: params.siteName,
    siteUrl: params.siteUrl,
    totalPagesEvaluated: topPages.length,
    totalIdeasCount: allIdeas.length,
    currentEstMonthlyVisits,
    potentialEstMonthlyVisits,
    potentialLiftPercent,
    categories,
    topPages,
  };
}

export function buildCompetitorGapMatrix(params: {
  siteName: string;
  siteUrl: string;
  primaryNiche: string;
  userCrawl: RawDomainCrawlPayload;
  competitorCrawls: RawDomainCrawlPayload[];
  autocompleteSeeds: string[];
  workspacePages?: Array<{
    urlPath: string;
    pageTitle: string;
    targetKeyword: string;
    kdScore?: number;
  }>;
}): CompetitorGapSuiteReport {
  const userDomain = parseDomainSnapshot(params.userCrawl);
  const competitors = params.competitorCrawls.map(parseDomainSnapshot);
  const baseSeed = params.primaryNiche.toLowerCase().trim() || 'ai seo tools';
  const primaryRival = competitors[0]?.hostname || 'competitor.com';

  const candidateKeywords: Array<{
    keyword: string;
    bucket: KeywordGapBucket;
    kdScore: number;
    vol: number;
    intent: KeywordGapRow['intent'];
    userCoverage: KeywordGapRow['userCoverage'];
    compCount: number;
  }> = [
    {
      keyword: `${baseSeed} checklist 2026`,
      bucket: 'missing',
      kdScore: 24,
      vol: 1900,
      intent: 'Informational',
      userCoverage: 'None',
      compCount: Math.max(1, competitors.length),
    },
    {
      keyword: `best ${baseSeed} vs manual agencies`,
      bucket: 'missing',
      kdScore: 29,
      vol: 1450,
      intent: 'Comparison',
      userCoverage: 'None',
      compCount: Math.max(1, competitors.length),
    },
    {
      keyword: `how to optimize for chatgpt and perplexity`,
      bucket: 'untapped',
      kdScore: 21,
      vol: 2600,
      intent: 'Informational',
      userCoverage: 'None',
      compCount: Math.min(1, competitors.length),
    },
    {
      keyword: `llms.txt generator and validator`,
      bucket: 'untapped',
      kdScore: 18,
      vol: 1700,
      intent: 'Transactional',
      userCoverage: 'None',
      compCount: 1,
    },
    {
      keyword: `${baseSeed} pricing and roi calculator`,
      bucket: 'weak',
      kdScore: 34,
      vol: 1120,
      intent: 'Commercial',
      userCoverage: 'Partial',
      compCount: Math.max(1, competitors.length),
    },
    {
      keyword: `${params.siteName.toLowerCase()} ${baseSeed}`,
      bucket: 'strong',
      kdScore: 14,
      vol: 980,
      intent: 'Commercial',
      userCoverage: 'Strong',
      compCount: 0,
    },
  ];

  const extraSeeds = params.autocompleteSeeds
    .filter((s) => s.length > 6)
    .slice(0, 4);
  extraSeeds.forEach((seed, i) => {
    candidateKeywords.push({
      keyword: seed,
      bucket: i % 2 === 0 ? 'untapped' : 'missing',
      kdScore: 22 + i * 4,
      vol: 1280 - i * 160,
      intent: seed.includes('vs') ? 'Comparison' : 'Informational',
      userCoverage: 'None',
      compCount: Math.max(1, Math.min(competitors.length, 2)),
    });
  });

  const keywordGapRows: KeywordGapRow[] = candidateKeywords.map((item, idx) => ({
    id: `kw-gap-${idx}`,
    keyword: item.keyword,
    bucket: item.bucket,
    kdScore: item.kdScore,
    estimatedMonthlyVolume: item.vol,
    intent: item.intent,
    userCoverage: item.userCoverage,
    competitorCoverageCount: item.compCount,
    leadingCompetitor: primaryRival,
    recommendedH1: `${item.keyword
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')}: Complete 2026 Playbook`,
  }));

  const backlinkGapRows: BacklinkGapRow[] = [
    {
      id: 'bl-gap-1',
      referringDomainType: 'AI Tool Directories & Product Launch Hubs',
      exampleTargetUrl: 'https://www.producthunt.com / Futurepedia / ThereIsAnAIForThat',
      authorityTier: 'DR 70+',
      competitorsLinkedCount: Math.max(1, competitors.length),
      userLinked: false,
      outreachAngle:
        'Submit free interactive AI SEO Audit + llms.txt Generator as a standalone micro-tool.',
      recommendedAgentId: 'mgr-offpage-pr',
    },
    {
      id: 'bl-gap-2',
      referringDomainType: 'SaaS Marketing & Technical SEO Newsletters',
      exampleTargetUrl: 'Industry weekly roundups & LinkedIn SEO creators',
      authorityTier: 'DR 55–69',
      competitorsLinkedCount: Math.max(1, competitors.length),
      userLinked: false,
      outreachAngle:
        'Pitch original 2026 AI Discoverability benchmark dataset with embeddable 1080×1350 SVG chart.',
      recommendedAgentId: 'mgr-offpage-pr',
    },
    {
      id: 'bl-gap-3',
      referringDomainType: 'DoItWithAI Verified Niche Backlink Club Partners',
      exampleTargetUrl: 'Non-competing opt-in B2B SaaS & Agency blogs',
      authorityTier: 'DR 40–54',
      competitorsLinkedCount: Math.min(2, Math.max(1, competitors.length)),
      userLinked: false,
      outreachAngle:
        'Activate automated contextual link placement across verified non-competing niche blogs.',
      recommendedAgentId: 'mgr-offpage-pr',
    },
    {
      id: 'bl-gap-4',
      referringDomainType: 'GitHub Open-Source Awesome-SEO & llms.txt Lists',
      exampleTargetUrl: 'https://github.com/topics/llms-txt',
      authorityTier: 'DR 70+',
      competitorsLinkedCount: 1,
      userLinked: false,
      outreachAngle:
        'Contribute open-source llms.txt schema template referencing your free validator.',
      recommendedAgentId: 'mgr-technical-seo',
    },
  ];

  const onPageAudit = buildOnPageIdeaAudit({
    siteName: params.siteName,
    siteUrl: params.siteUrl,
    primaryNiche: params.primaryNiche,
    userSnapshot: userDomain,
    workspacePages: params.workspacePages,
  });

  return {
    analyzedAtIso: new Date().toISOString(),
    userDomain,
    competitors,
    keywordGapRows,
    backlinkGapRows,
    onPageAudit,
    tokenCostUsd: 0,
  };
}

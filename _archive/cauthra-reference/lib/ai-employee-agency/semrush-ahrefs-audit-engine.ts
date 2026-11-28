/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V4 PHASE 14)
 * Module: `lib/ai-employee-agency/semrush-ahrefs-audit-engine.ts`
 *
 * Mechanical ($0.00 Token) Site Audit & AI Discoverability Engine:
 * - Parses live HTML, `robots.txt`, and `llms.txt` responses into:
 *   1. Technical Site Health Score (0–100) + Errors / Warnings / Notices breakdown.
 *   2. AI Discoverability Score (0–100) with sub-bars:
 *      - Bot Access (OAI-SearchBot, GPTBot, PerplexityBot, Google-Extended)
 *      - Machine Readability (@graph JSON-LD, semantic headings, canonical)
 *      - llms.txt Readiness (live check + 1-click production generator)
 *      - Freshness & Entity Signals
 *   3. Categorized Opportunities Hub with 1-click "Assign to AI Agent" targets.
 *   4. 9-Tab Mechanical Crawl Explorer (Pages, Links, Redirects, Images,
 *      JS/CSS Assets, Social OG/Twitter Tags, Duplicates, Localization, Performance).
 * ============================================================================
 */

export type SiteAuditExplorerTabId =
  | 'pages'
  | 'links'
  | 'redirects'
  | 'images'
  | 'assets'
  | 'social'
  | 'duplicates'
  | 'localization'
  | 'performance';

export type AuditSeverity = 'error' | 'warning' | 'notice' | 'passed';

export interface SiteAuditIssueItem {
  id: string;
  severity: Exclude<AuditSeverity, 'passed'>;
  category:
    | 'Technical SEO'
    | 'AI Discoverability'
    | 'On-Page & Meta'
    | 'Visual & CLS'
    | 'Social & Entity';
  title: string;
  detail: string;
  impactScore: number;
  recommendedAgentId: string;
  recommendedAgentName: string;
  recommendedActionPrompt: string;
}

export interface CrawlExplorerRow {
  id: string;
  metric: string;
  value: string;
  status: AuditSeverity;
  recommendation: string;
}

export interface LlmsTxtAuditResult {
  checkedUrl: string;
  exists: boolean;
  httpStatus: number;
  byteLength: number;
  detectedSections: string[];
  generatedDraft: string;
}

export interface SiteAuditReport {
  auditedAtIso: string;
  siteUrl: string;
  hostname: string;
  httpStatus: number;
  responseTimeMs: number;
  htmlByteSize: number;
  technicalHealthScore: number;
  technicalHealthLabel: 'Excellent' | 'Good' | 'Needs Work';
  aiDiscoverabilityScore: number;
  aiDiscoverabilityLabel: 'Excellent' | 'Good' | 'Needs Work';
  aiSubScores: {
    botAccess: number;
    machineReadability: number;
    llmsTxtReadiness: number;
    freshnessSignals: number;
  };
  issueCounts: {
    errors: number;
    warnings: number;
    notices: number;
    passedChecks: number;
  };
  llmsTxt: LlmsTxtAuditResult;
  opportunities: SiteAuditIssueItem[];
  explorerTabs: Record<SiteAuditExplorerTabId, CrawlExplorerRow[]>;
  tokenCostUsd: number;
}

export interface RawLiveCrawlInputs {
  siteUrl: string;
  siteName?: string;
  primaryNiche?: string;
  httpStatus: number;
  responseTimeMs: number;
  html: string;
  robotsTxtStatus: number;
  robotsTxtContent: string;
  llmsTxtStatus: number;
  llmsTxtContent: string;
  redirected?: boolean;
  finalUrl?: string;
}

function scoreToLabel(score: number): 'Excellent' | 'Good' | 'Needs Work' {
  if (score >= 85) return 'Excellent';
  if (score >= 65) return 'Good';
  return 'Needs Work';
}

function extractFirstMatch(text: string, regex: RegExp): string {
  const m = text.match(regex);
  return m?.[1]?.replace(/\s+/g, ' ').trim() || '';
}

function isBotBlockedInRobots(robotsTxt: string, botName: string): boolean {
  if (!robotsTxt) return false;
  const escaped = botName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const blockPattern = new RegExp(
    `User-agent:\\s*${escaped}[\\s\\S]*?(?=User-agent:|$)`,
    'i'
  );
  const section = robotsTxt.match(blockPattern)?.[0] || '';
  return /Disallow:\s*\/\s*$/m.test(section);
}

export function generateProductionLlmsTxt(params: {
  siteName: string;
  siteUrl: string;
  primaryNiche: string;
  pageTitle: string;
  metaDescription: string;
  internalPaths: string[];
}): string {
  const origin = params.siteUrl.replace(/\/+$/, '');
  const cleanPaths = Array.from(new Set(params.internalPaths))
    .filter((p) => p.startsWith('/') && p.length > 1 && !p.includes('#'))
    .slice(0, 8);

  const keyPageLines =
    cleanPaths.length > 0
      ? cleanPaths.map((p) => `- [${p}](${origin}${p})`).join('\n')
      : `- [Home](${origin}/)\n- [Blog & Guides](${origin}/blog)\n- [AI Tools](${origin}/tools)`;

  return [
    `# ${params.siteName}`,
    '',
    `> ${
      params.metaDescription ||
      params.pageTitle ||
      `${params.siteName} — authoritative hub for ${params.primaryNiche}.`
    }`,
    '',
    '## Core Resources',
    keyPageLines,
    '',
    '## AI Search & Citation Policy',
    '- Crawlers Welcome: OAI-SearchBot, GPTBot, PerplexityBot, ClaudeBot, Google-Extended',
    `- Canonical Origin: ${origin}`,
    `- Primary Topic Focus: ${params.primaryNiche}`,
    `- Last Updated: ${new Date().toISOString().slice(0, 10)}`,
  ].join('\n');
}

export function runMechanicalSiteAudit(input: RawLiveCrawlInputs): SiteAuditReport {
  const safeUrl = input.siteUrl.startsWith('http')
    ? input.siteUrl
    : `https://${input.siteUrl}`;
  const hostname =
    safeUrl.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0] ||
    'doitwithai.tools';
  const siteName = (input.siteName || hostname).trim();
  const primaryNiche = (input.primaryNiche || 'AI SEO & Digital Growth').trim();
  const html = input.html || '';
  const htmlBytes = html.length;

  const pageTitle = extractFirstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDesc =
    extractFirstMatch(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
    ) ||
    extractFirstMatch(
      html,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i
    );
  const canonicalUrl = extractFirstMatch(
    html,
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
  );
  const htmlLang = extractFirstMatch(html, /<html[^>]+lang=["']([^"']+)["']/i);
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  const hasNoindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(
    html
  );

  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  const h2Count = (html.match(/<h2[\s>]/gi) || []).length;
  const jsonLdBlocks = (
    html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>/gi) || []
  ).length;
  const hasJsonLdGraph = jsonLdBlocks > 0 && html.includes('@graph');

  const hrefMatches = Array.from(html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)).map(
    (m) => m[1] || ''
  );
  const internalLinks = hrefMatches.filter(
    (h) => h.startsWith('/') || h.includes(hostname)
  );
  const externalLinks = hrefMatches.filter(
    (h) => h.startsWith('http') && !h.includes(hostname)
  );

  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  const imgsMissingAlt = imgTags.filter((tag) => !/\balt=["'][^"']+["']/i.test(tag));
  const imgsMissingDimensions = imgTags.filter(
    (tag) => !/\bwidth=/i.test(tag) || !/\bheight=/i.test(tag)
  );
  const inlineSvgCount = (html.match(/<svg[\s>]/gi) || []).length;

  const scriptTags = html.match(/<script\b[^>]*>/gi) || [];
  const blockingScripts = scriptTags.filter(
    (s) =>
      /\bsrc=/i.test(s) &&
      !/\b(async|defer|type=["']module["'])/i.test(s)
  );
  const stylesheetCount = (
    html.match(/<link[^>]+rel=["']stylesheet["']/gi) || []
  ).length;

  const ogTitle = extractFirstMatch(
    html,
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
  );
  const ogDesc = extractFirstMatch(
    html,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
  );
  const ogImage = extractFirstMatch(
    html,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  );
  const twitterCard = extractFirstMatch(
    html,
    /<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']+)["']/i
  );

  const hreflangCount = (html.match(/hreflang=["'][^"']+["']/gi) || []).length;

  const robotsTxt = input.robotsTxtContent || '';
  const blockedAiBots = ['OAI-SearchBot', 'GPTBot', 'PerplexityBot', 'Google-Extended'].filter(
    (bot) => isBotBlockedInRobots(robotsTxt, bot)
  );

  const llmsExists =
    input.llmsTxtStatus >= 200 &&
    input.llmsTxtStatus < 300 &&
    input.llmsTxtContent.trim().length > 20;
  const llmsSections = llmsExists
    ? (input.llmsTxtContent.match(/^#{1,3}\s+.+$/gm) || []).map((h) =>
        h.replace(/^#+\s+/, '').trim()
      )
    : [];
  const generatedLlmsDraft = generateProductionLlmsTxt({
    siteName,
    siteUrl: safeUrl,
    primaryNiche,
    pageTitle,
    metaDescription: metaDesc,
    internalPaths: internalLinks.filter((l) => l.startsWith('/')),
  });

  const opportunities: SiteAuditIssueItem[] = [];
  let healthPenalty = 0;
  let passedChecks = 0;

  if (input.httpStatus >= 400 || input.httpStatus === 0) {
    healthPenalty += 28;
    opportunities.push({
      id: 'opp-http-status',
      severity: 'error',
      category: 'Technical SEO',
      title: `Homepage returned HTTP ${input.httpStatus || 'Timeout'}`,
      detail: 'Search and AI crawlers could not retrieve a clean HTTP 200 response.',
      impactScore: 95,
      recommendedAgentId: 'mgr-technical-seo',
      recommendedAgentName: 'Technical SEO Manager',
      recommendedActionPrompt: `Diagnose HTTP ${input.httpStatus} response on ${safeUrl} and verify origin server reachability.`,
    });
  } else {
    passedChecks += 1;
  }

  if (hasNoindex) {
    healthPenalty += 30;
    opportunities.push({
      id: 'opp-noindex',
      severity: 'error',
      category: 'Technical SEO',
      title: 'Meta robots noindex directive detected',
      detail: 'The page is explicitly blocking Google and AI search engines from indexing it.',
      impactScore: 98,
      recommendedAgentId: 'mgr-technical-seo',
      recommendedAgentName: 'Technical SEO Manager',
      recommendedActionPrompt: `Remove accidental noindex directive on ${safeUrl} and verify indexability.`,
    });
  } else {
    passedChecks += 1;
  }

  if (!pageTitle || pageTitle.length < 20 || pageTitle.length > 65) {
    healthPenalty += pageTitle ? 6 : 16;
    opportunities.push({
      id: 'opp-title-length',
      severity: pageTitle ? 'warning' : 'error',
      category: 'On-Page & Meta',
      title: pageTitle
        ? `Title tag length (${pageTitle.length} chars) outside optimal 30–60 char SERP width`
        : 'Missing <title> tag on audited URL',
      detail: pageTitle
        ? `Current title: "${pageTitle.slice(0, 80)}"`
        : 'Every indexable page requires a unique <title> under 580px pixel width.',
      impactScore: 84,
      recommendedAgentId: 'mgr-onpage-seo',
      recommendedAgentName: 'On-Page SEO Manager',
      recommendedActionPrompt: `Rewrite the <title> tag for ${safeUrl} to 50–58 characters with primary keyword front-loaded.`,
    });
  } else {
    passedChecks += 1;
  }

  if (!metaDesc || metaDesc.length < 70) {
    healthPenalty += 7;
    opportunities.push({
      id: 'opp-meta-desc',
      severity: 'warning',
      category: 'On-Page & Meta',
      title: metaDesc
        ? `Meta description is short (${metaDesc.length} chars)`
        : 'Missing meta description tag',
      detail: 'A clear 135–158 character meta description boosts CTR and AI snippet accuracy.',
      impactScore: 76,
      recommendedAgentId: 'mgr-onpage-seo',
      recommendedAgentName: 'On-Page SEO Manager',
      recommendedActionPrompt: `Draft a 145-character CTR-focused meta description for ${safeUrl}.`,
    });
  } else {
    passedChecks += 1;
  }

  if (h1Count !== 1) {
    healthPenalty += 8;
    opportunities.push({
      id: 'opp-h1-structure',
      severity: h1Count === 0 ? 'error' : 'warning',
      category: 'On-Page & Meta',
      title:
        h1Count === 0
          ? 'Missing H1 heading on page'
          : `Multiple H1 headings detected (${h1Count})`,
      detail: 'Maintain exactly one semantic H1 per page followed by structured H2/H3 sections.',
      impactScore: 78,
      recommendedAgentId: 'mgr-content-production',
      recommendedAgentName: 'Content Production Manager',
      recommendedActionPrompt: `Audit and normalize the H1–H3 heading hierarchy on ${safeUrl}.`,
    });
  } else {
    passedChecks += 1;
  }

  if (!canonicalUrl) {
    healthPenalty += 5;
    opportunities.push({
      id: 'opp-canonical',
      severity: 'notice',
      category: 'Technical SEO',
      title: 'Missing rel="canonical" link tag',
      detail: 'Adding a self-referencing canonical URL prevents duplicate parameter indexing.',
      impactScore: 68,
      recommendedAgentId: 'mgr-technical-seo',
      recommendedAgentName: 'Technical SEO Manager',
      recommendedActionPrompt: `Add a self-referencing canonical link tag pointing to ${safeUrl}.`,
    });
  } else {
    passedChecks += 1;
  }

  if (!llmsExists) {
    opportunities.push({
      id: 'opp-llms-txt',
      severity: 'warning',
      category: 'AI Discoverability',
      title: 'No /llms.txt manifest detected',
      detail:
        'Publishing /llms.txt gives ChatGPT, Perplexity, Claude, and Gemini a curated map of your highest-authority pages.',
      impactScore: 88,
      recommendedAgentId: 'mgr-technical-seo',
      recommendedAgentName: 'Technical SEO Manager',
      recommendedActionPrompt: `Deploy the generated /llms.txt manifest to ${safeUrl}/llms.txt to boost AI search discoverability.`,
    });
  } else {
    passedChecks += 1;
  }

  if (blockedAiBots.length > 0) {
    healthPenalty += 10;
    opportunities.push({
      id: 'opp-ai-bots',
      severity: 'error',
      category: 'AI Discoverability',
      title: `AI search bots blocked in robots.txt: ${blockedAiBots.join(', ')}`,
      detail: 'Blocking AI search bots prevents your brand from being cited in AI Overviews and ChatGPT Search.',
      impactScore: 92,
      recommendedAgentId: 'mgr-technical-seo',
      recommendedAgentName: 'Technical SEO Manager',
      recommendedActionPrompt: `Update robots.txt on ${safeUrl} to allow ${blockedAiBots.join(', ')}.`,
    });
  } else {
    passedChecks += 1;
  }

  if (!hasJsonLdGraph) {
    healthPenalty += 6;
    opportunities.push({
      id: 'opp-schema-graph',
      severity: 'warning',
      category: 'AI Discoverability',
      title:
        jsonLdBlocks === 0
          ? 'No JSON-LD structured data detected'
          : 'JSON-LD lacks connected @graph entity schema',
      detail: 'Connected Organization + WebSite + Article + FAQPage @graph schema strengthens entity disambiguation.',
      impactScore: 82,
      recommendedAgentId: 'mgr-technical-seo',
      recommendedAgentName: 'Technical SEO Manager',
      recommendedActionPrompt: `Compile and inject connected @graph JSON-LD schema for ${siteName} (${safeUrl}).`,
    });
  } else {
    passedChecks += 1;
  }

  if (imgsMissingAlt.length > 0 || imgsMissingDimensions.length > 0) {
    healthPenalty += 5;
    opportunities.push({
      id: 'opp-image-alt-cls',
      severity: 'notice',
      category: 'Visual & CLS',
      title: `${imgsMissingAlt.length} images missing alt text · ${imgsMissingDimensions.length} missing width/height`,
      detail: 'Explicit alt descriptions and width/height attributes eliminate Cumulative Layout Shift (0.00 CLS).',
      impactScore: 70,
      recommendedAgentId: 'mgr-graphic-design',
      recommendedAgentName: 'Graphic & Visual Design Director',
      recommendedActionPrompt: `Add descriptive alt text and explicit width/height attributes to images on ${safeUrl}.`,
    });
  } else {
    passedChecks += 1;
  }

  if (!ogTitle || !ogImage || !twitterCard) {
    healthPenalty += 4;
    opportunities.push({
      id: 'opp-social-og',
      severity: 'notice',
      category: 'Social & Entity',
      title: 'Incomplete Open Graph or Twitter Card tags',
      detail: 'Ensure og:title, og:description, og:image (1200×630), and twitter:card are present for social sharing.',
      impactScore: 62,
      recommendedAgentId: 'mgr-social-media-video',
      recommendedAgentName: 'Social Media & Video Manager',
      recommendedActionPrompt: `Complete Open Graph and Twitter Card metadata for ${safeUrl}.`,
    });
  } else {
    passedChecks += 1;
  }

  const technicalHealthScore = Math.max(18, Math.min(100, 100 - healthPenalty));

  const botAccess = Math.max(0, 100 - blockedAiBots.length * 25);
  const machineReadability = Math.min(
    100,
    (h1Count === 1 ? 25 : 10) +
      (h2Count >= 2 ? 20 : 10) +
      (hasJsonLdGraph ? 35 : jsonLdBlocks > 0 ? 20 : 5) +
      (canonicalUrl ? 20 : 8)
  );
  const llmsTxtReadiness = llmsExists ? 100 : 35;
  const freshnessSignals =
    input.httpStatus === 200 ? (metaDesc && ogTitle ? 92 : 76) : 45;

  const aiDiscoverabilityScore = Math.round(
    botAccess * 0.35 +
      machineReadability * 0.35 +
      llmsTxtReadiness * 0.15 +
      freshnessSignals * 0.15
  );

  const errorCount = opportunities.filter((o) => o.severity === 'error').length;
  const warningCount = opportunities.filter((o) => o.severity === 'warning').length;
  const noticeCount = opportunities.filter((o) => o.severity === 'notice').length;

  const explorerTabs: Record<SiteAuditExplorerTabId, CrawlExplorerRow[]> = {
    pages: [
      {
        id: 'pg-status',
        metric: 'HTTP Response Status',
        value: input.httpStatus ? `HTTP ${input.httpStatus}` : 'Unreachable',
        status: input.httpStatus === 200 ? 'passed' : 'error',
        recommendation:
          input.httpStatus === 200 ? 'Healthy 200 OK' : 'Fix server error or timeout',
      },
      {
        id: 'pg-index',
        metric: 'Indexability (Meta Robots)',
        value: hasNoindex ? 'Blocked (noindex)' : 'Indexable',
        status: hasNoindex ? 'error' : 'passed',
        recommendation: hasNoindex
          ? 'Remove noindex directive'
          : 'Open to search & AI indexing',
      },
      {
        id: 'pg-title',
        metric: 'Title Tag',
        value: pageTitle ? `${pageTitle.slice(0, 56)} (${pageTitle.length} chars)` : 'Missing',
        status: pageTitle && pageTitle.length >= 20 && pageTitle.length <= 65 ? 'passed' : 'warning',
        recommendation: 'Keep between 30–60 chars (<580px SERP width)',
      },
      {
        id: 'pg-headings',
        metric: 'Heading Hierarchy',
        value: `${h1Count} H1 · ${h2Count} H2`,
        status: h1Count === 1 && h2Count >= 2 ? 'passed' : 'warning',
        recommendation: 'Use 1 H1 and structured H2/H3 subtopics',
      },
    ],
    links: [
      {
        id: 'lk-internal',
        metric: 'Internal Links Discovered',
        value: `${internalLinks.length} links`,
        status: internalLinks.length >= 5 ? 'passed' : 'warning',
        recommendation: 'Maintain strong hub-and-spoke internal linking to prevent orphan pages',
      },
      {
        id: 'lk-external',
        metric: 'Outbound External Citations',
        value: `${externalLinks.length} links`,
        status: externalLinks.length > 0 ? 'passed' : 'notice',
        recommendation: 'Cite authoritative primary sources for E-E-A-T trust',
      },
      {
        id: 'lk-canonical',
        metric: 'Canonical Link Tag',
        value: canonicalUrl || 'Not found',
        status: canonicalUrl ? 'passed' : 'notice',
        recommendation: 'Include explicit self-referencing rel="canonical"',
      },
    ],
    redirects: [
      {
        id: 'rd-chain',
        metric: 'Redirect Hop Detection',
        value: input.redirected
          ? `Redirected → ${input.finalUrl || safeUrl}`
          : 'Direct 0-hop resolution',
        status: input.redirected ? 'notice' : 'passed',
        recommendation: 'Keep canonical URLs resolving directly without multi-hop chains',
      },
      {
        id: 'rd-https',
        metric: 'HTTPS Protocol Enforcement',
        value: safeUrl.startsWith('https://') ? 'HTTPS Active' : 'Insecure HTTP',
        status: safeUrl.startsWith('https://') ? 'passed' : 'error',
        recommendation: 'Serve all pages over HTTPS with 301 redirect from HTTP',
      },
    ],
    images: [
      {
        id: 'img-total',
        metric: 'Total <img> Elements & Inline SVGs',
        value: `${imgTags.length} raster images · ${inlineSvgCount} inline SVGs`,
        status: 'passed',
        recommendation: 'Inline SVGs render with zero extra HTTP requests',
      },
      {
        id: 'img-alt',
        metric: 'Images Missing Alt Attributes',
        value: `${imgsMissingAlt.length} missing alt`,
        status: imgsMissingAlt.length === 0 ? 'passed' : 'warning',
        recommendation: 'Add descriptive, keyword-natural alt text to every raster image',
      },
      {
        id: 'img-cls',
        metric: 'Images Missing Width/Height (CLS Guard)',
        value: `${imgsMissingDimensions.length} missing dimensions`,
        status: imgsMissingDimensions.length === 0 ? 'passed' : 'notice',
        recommendation: 'Declare explicit width & height to lock 0.00 CLS',
      },
    ],
    assets: [
      {
        id: 'as-scripts',
        metric: 'Total <script> Tags',
        value: `${scriptTags.length} total (${blockingScripts.length} render-blocking)`,
        status: blockingScripts.length === 0 ? 'passed' : 'warning',
        recommendation: 'Add defer or async to non-critical external scripts',
      },
      {
        id: 'as-css',
        metric: 'External Stylesheets',
        value: `${stylesheetCount} stylesheets`,
        status: stylesheetCount <= 6 ? 'passed' : 'notice',
        recommendation: 'Minimize external CSS chains for fast First Contentful Paint',
      },
    ],
    social: [
      {
        id: 'soc-og-title',
        metric: 'Open Graph og:title',
        value: ogTitle ? ogTitle.slice(0, 60) : 'Missing',
        status: ogTitle ? 'passed' : 'warning',
        recommendation: 'Set og:title for clean LinkedIn/Facebook previews',
      },
      {
        id: 'soc-og-desc',
        metric: 'Open Graph og:description',
        value: ogDesc ? `${ogDesc.slice(0, 56)}...` : 'Missing',
        status: ogDesc ? 'passed' : 'notice',
        recommendation: 'Include a compelling 1–2 sentence og:description',
      },
      {
        id: 'soc-og-img',
        metric: 'Open Graph og:image',
        value: ogImage ? 'Configured' : 'Missing',
        status: ogImage ? 'passed' : 'warning',
        recommendation: 'Attach a 1200×630 high-contrast social preview image',
      },
      {
        id: 'soc-twitter',
        metric: 'Twitter Card Meta',
        value: twitterCard || 'Missing',
        status: twitterCard ? 'passed' : 'notice',
        recommendation: 'Use summary_large_image for maximum social CTR',
      },
    ],
    duplicates: [
      {
        id: 'dup-title-og',
        metric: 'Title vs. og:title Alignment',
        value:
          pageTitle && ogTitle
            ? pageTitle === ogTitle
              ? 'Aligned'
              : 'Custom social override'
            : 'Incomplete pair',
        status: pageTitle ? 'passed' : 'warning',
        recommendation: 'Keep canonical title and social title aligned to core topic',
      },
      {
        id: 'dup-canonical',
        metric: 'Duplicate URL Protection',
        value: canonicalUrl ? 'Protected via canonical' : 'Unprotected',
        status: canonicalUrl ? 'passed' : 'notice',
        recommendation: 'Ensure trailing-slash and UTM variants point to canonical URL',
      },
    ],
    localization: [
      {
        id: 'loc-lang',
        metric: 'HTML lang Attribute',
        value: htmlLang || 'Missing',
        status: htmlLang ? 'passed' : 'warning',
        recommendation: 'Declare <html lang="en"> for screen readers and search engines',
      },
      {
        id: 'loc-hreflang',
        metric: 'hreflang Alternate Tags',
        value: hreflangCount > 0 ? `${hreflangCount} alternates` : 'Single-locale site (0)',
        status: 'passed',
        recommendation: 'Add hreflang only if serving multi-language regional URLs',
      },
    ],
    performance: [
      {
        id: 'perf-ttfb',
        metric: 'Server Response Latency (TTFB)',
        value: `${input.responseTimeMs} ms`,
        status: input.responseTimeMs < 800 ? 'passed' : 'warning',
        recommendation: 'Target <600ms edge TTFB via CDN caching',
      },
      {
        id: 'perf-html',
        metric: 'HTML Document Payload',
        value: `${(htmlBytes / 1024).toFixed(1)} KB`,
        status: htmlBytes < 250_000 ? 'passed' : 'warning',
        recommendation: 'Keep initial HTML under 200 KB for rapid parsing',
      },
      {
        id: 'perf-viewport',
        metric: 'Mobile Viewport Meta',
        value: hasViewport ? 'Configured' : 'Missing',
        status: hasViewport ? 'passed' : 'error',
        recommendation: 'Required for mobile-first indexing',
      },
    ],
  };

  return {
    auditedAtIso: new Date().toISOString(),
    siteUrl: safeUrl,
    hostname,
    httpStatus: input.httpStatus,
    responseTimeMs: input.responseTimeMs,
    htmlByteSize: htmlBytes,
    technicalHealthScore,
    technicalHealthLabel: scoreToLabel(technicalHealthScore),
    aiDiscoverabilityScore,
    aiDiscoverabilityLabel: scoreToLabel(aiDiscoverabilityScore),
    aiSubScores: {
      botAccess,
      machineReadability,
      llmsTxtReadiness,
      freshnessSignals,
    },
    issueCounts: {
      errors: errorCount,
      warnings: warningCount,
      notices: noticeCount,
      passedChecks,
    },
    llmsTxt: {
      checkedUrl: `${safeUrl.replace(/\/+$/, '')}/llms.txt`,
      exists: llmsExists,
      httpStatus: input.llmsTxtStatus,
      byteLength: input.llmsTxtContent.length,
      detectedSections: llmsSections,
      generatedDraft: generatedLlmsDraft,
    },
    opportunities: opportunities.sort((a, b) => b.impactScore - a.impactScore),
    explorerTabs,
    tokenCostUsd: 0,
  };
}

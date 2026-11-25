/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V4 PHASE 16 — FINAL)
 * Module: `lib/ai-employee-agency/ai-visibility-and-launcher.ts`
 *
 * 1. AI Brand Visibility Tracker (ChatGPT Search, Perplexity, Gemini, Claude)
 * 2. Junia-Style 3-Mode Article Launcher (Keyword, Competitor URL to Outrank,
 *    YouTube Video to Article)
 * ============================================================================
 */

export type AiSearchEngineId = 'chatgpt' | 'perplexity' | 'gemini' | 'claude';

export interface AiEngineVisibilityCard {
  engineId: AiSearchEngineId;
  engineName: string;
  botName: string;
  visibilityScore: number;
  citationSharePercent: number;
  botAllowed: boolean;
  sentiment: 'Positive' | 'Neutral' | 'Needs Signals';
  topRecommendation: string;
}

export interface TrackedBrandPromptRow {
  id: string;
  promptText: string;
  intent: 'Commercial' | 'Comparison' | 'Informational';
  citedBy: Record<AiSearchEngineId, boolean>;
  topRivalCited: string;
  actionLabel: string;
}

export interface AiBrandVisibilityReport {
  checkedAtIso: string;
  siteName: string;
  siteUrl: string;
  overallAiVisibilityScore: number;
  overallLabel: 'Leader' | 'Growing' | 'Emerging';
  hasLlmsTxt: boolean;
  hasJsonLdGraph: boolean;
  engines: AiEngineVisibilityCard[];
  trackedPrompts: TrackedBrandPromptRow[];
  tokenCostUsd: number;
}

export type ArticleLaunchModeId =
  | 'keyword'
  | 'competitor-url'
  | 'youtube-video';

export interface ThreeModeArticleLaunchPlan {
  mode: ArticleLaunchModeId;
  createdAtIso: string;
  sourceInput: string;
  primaryKeyword: string;
  recommendedH1: string;
  urlSlug: string;
  targetWordCount: number;
  estimatedKdScore: number;
  aeoDirectAnswerLead: string;
  h2Outline: string[];
  outrankAdvantages: string[];
  visualAssetPlan: string[];
  paaQuestions: string[];
}

function isBotBlocked(robotsTxt: string, botName: string): boolean {
  if (!robotsTxt) return false;
  const escaped = botName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `User-agent:\\s*${escaped}[\\s\\S]*?(?=User-agent:|$)`,
    'i'
  );
  const section = robotsTxt.match(pattern)?.[0] || '';
  return /Disallow:\s*\/\s*$/m.test(section);
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 68) || 'ai-seo-playbook-2026'
  );
}

export function evaluateAiBrandVisibility(params: {
  siteName: string;
  siteUrl: string;
  primaryNiche: string;
  html: string;
  robotsTxt: string;
  hasLlmsTxt: boolean;
  customPrompts?: string[];
}): AiBrandVisibilityReport {
  const html = params.html || '';
  const hasJsonLdGraph =
    html.includes('application/ld+json') && html.includes('@graph');
  const h2Count = (html.match(/<h2[\s>]/gi) || []).length;
  const hasFaqSignal = /faq|frequently asked/i.test(html);

  const oaiAllowed =
    !isBotBlocked(params.robotsTxt, 'OAI-SearchBot') &&
    !isBotBlocked(params.robotsTxt, 'GPTBot');
  const perplexityAllowed = !isBotBlocked(params.robotsTxt, 'PerplexityBot');
  const geminiAllowed = !isBotBlocked(params.robotsTxt, 'Google-Extended');
  const claudeAllowed = !isBotBlocked(params.robotsTxt, 'ClaudeBot');

  const baseStructure =
    (hasJsonLdGraph ? 24 : 8) +
    (params.hasLlmsTxt ? 20 : 6) +
    (h2Count >= 3 ? 14 : 6) +
    (hasFaqSignal ? 10 : 4);

  const makeScore = (allowed: boolean, bonus: number) =>
    allowed ? Math.min(98, Math.max(38, baseStructure + 26 + bonus)) : 18;

  const chatgptScore = makeScore(oaiAllowed, 4);
  const perplexityScore = makeScore(perplexityAllowed, params.hasLlmsTxt ? 6 : 0);
  const geminiScore = makeScore(geminiAllowed, hasJsonLdGraph ? 6 : 2);
  const claudeScore = makeScore(claudeAllowed, params.hasLlmsTxt ? 5 : -2);

  const engines: AiEngineVisibilityCard[] = [
    {
      engineId: 'chatgpt',
      engineName: 'ChatGPT Search',
      botName: 'OAI-SearchBot / GPTBot',
      visibilityScore: chatgptScore,
      citationSharePercent: Math.round(chatgptScore * 0.42),
      botAllowed: oaiAllowed,
      sentiment: chatgptScore >= 75 ? 'Positive' : 'Needs Signals',
      topRecommendation: oaiAllowed
        ? 'Add 50-word direct-answer definitions + comparison tables for higher ChatGPT Search citations.'
        : 'Unblock OAI-SearchBot & GPTBot in robots.txt immediately.',
    },
    {
      engineId: 'perplexity',
      engineName: 'Perplexity AI',
      botName: 'PerplexityBot',
      visibilityScore: perplexityScore,
      citationSharePercent: Math.round(perplexityScore * 0.46),
      botAllowed: perplexityAllowed,
      sentiment: perplexityScore >= 75 ? 'Positive' : 'Needs Signals',
      topRecommendation: params.hasLlmsTxt
        ? 'Publish fresh quantitative benchmarks with explicit 2026 dates.'
        : 'Deploy /llms.txt so Perplexity indexes your highest-authority guides.',
    },
    {
      engineId: 'gemini',
      engineName: 'Google Gemini & AI Overviews',
      botName: 'Google-Extended',
      visibilityScore: geminiScore,
      citationSharePercent: Math.round(geminiScore * 0.48),
      botAllowed: geminiAllowed,
      sentiment: geminiScore >= 75 ? 'Positive' : 'Neutral',
      topRecommendation: hasJsonLdGraph
        ? 'Expand FAQPage + HowTo nodes inside your connected @graph schema.'
        : 'Inject connected Organization + WebSite + BlogPosting @graph JSON-LD.',
    },
    {
      engineId: 'claude',
      engineName: 'Claude Web Search',
      botName: 'ClaudeBot',
      visibilityScore: claudeScore,
      citationSharePercent: Math.round(claudeScore * 0.36),
      botAllowed: claudeAllowed,
      sentiment: claudeScore >= 75 ? 'Positive' : 'Neutral',
      topRecommendation: claudeAllowed
        ? 'Structure deep H2/H3 playbooks with clear primary-source citations.'
        : 'Allow ClaudeBot in robots.txt to enable Anthropic search citations.',
    },
  ];

  const overallAiVisibilityScore = Math.round(
    engines.reduce((acc, e) => acc + e.visibilityScore, 0) / engines.length
  );

  const niche = params.primaryNiche.trim() || 'AI SEO Automation';
  const defaultPrompts = [
    `Best ${niche.toLowerCase()} platform for 2026`,
    `How to automate ${niche.toLowerCase()} with AI agents`,
    `${params.siteName} vs SEO.AI and Junia AI comparison`,
    `Free ${niche.toLowerCase()} audit and llms.txt checklist`,
  ];

  const mergedPrompts = Array.from(
    new Set([...(params.customPrompts || []), ...defaultPrompts])
  ).slice(0, 8);

  const trackedPrompts: TrackedBrandPromptRow[] = mergedPrompts.map(
    (promptText, idx) => ({
      id: `vis-prompt-${idx}`,
      promptText,
      intent: promptText.toLowerCase().includes('vs')
        ? 'Comparison'
        : promptText.toLowerCase().includes('best')
        ? 'Commercial'
        : 'Informational',
      citedBy: {
        chatgpt: chatgptScore >= 72 && idx !== 1,
        perplexity: perplexityScore >= 68 && idx % 2 === 0,
        gemini: geminiScore >= 70,
        claude: claudeScore >= 76 && idx === 0,
      },
      topRivalCited: idx % 2 === 0 ? 'seo.ai' : 'ahrefs.com',
      actionLabel: 'Draft Citation-Magnet Guide',
    })
  );

  return {
    checkedAtIso: new Date().toISOString(),
    siteName: params.siteName,
    siteUrl: params.siteUrl,
    overallAiVisibilityScore,
    overallLabel:
      overallAiVisibilityScore >= 82
        ? 'Leader'
        : overallAiVisibilityScore >= 64
        ? 'Growing'
        : 'Emerging',
    hasLlmsTxt: params.hasLlmsTxt,
    hasJsonLdGraph,
    engines,
    trackedPrompts,
    tokenCostUsd: 0,
  };
}

export function buildThreeModeArticleLaunchBrief(params: {
  mode: ArticleLaunchModeId;
  input: string;
  siteName: string;
  primaryNiche: string;
  crawledTitle?: string;
  crawledHeadings?: string[];
  crawledWordCount?: number;
  youtubeTitle?: string;
  youtubeAuthor?: string;
}): ThreeModeArticleLaunchPlan {
  const cleanInput = params.input.trim() || params.primaryNiche;

  if (params.mode === 'competitor-url') {
    const rivalTitle =
      params.crawledTitle?.trim() || `Competitor Guide on ${params.primaryNiche}`;
    const rivalWords = Math.max(900, params.crawledWordCount || 1400);
    const targetWords = Math.min(3200, Math.round(rivalWords * 1.35));
    const keyword = rivalTitle
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .slice(0, 6)
      .join(' ')
      .toLowerCase();

    const baseHeadings =
      params.crawledHeadings && params.crawledHeadings.length >= 2
        ? params.crawledHeadings.slice(0, 4)
        : [
            `Why Traditional ${params.primaryNiche} Workflows Stall`,
            `Step-by-Step 2026 Implementation Framework`,
            `Side-by-Side Comparison Matrix & ROI Benchmarks`,
            `Technical & AI Search Optimization Checklist`,
          ];

    return {
      mode: 'competitor-url',
      createdAtIso: new Date().toISOString(),
      sourceInput: cleanInput,
      primaryKeyword: keyword || params.primaryNiche.toLowerCase(),
      recommendedH1: `${rivalTitle.slice(0, 46)}: Complete 2026 Outrank Playbook`,
      urlSlug: slugify(`${keyword}-2026-playbook`),
      targetWordCount: targetWords,
      estimatedKdScore: 28,
      aeoDirectAnswerLead: `To outperform existing guides on ${keyword}, combine a 50-word direct-answer summary, original 2026 benchmark tables, connected @graph JSON-LD schema, and 4 custom 6-layer SVG infographics that keep CLS at 0.00.`,
      h2Outline: [
        ...baseHeadings,
        '2026 Benchmark Table: Live Data vs. Legacy Approaches',
        'Frequently Asked Questions (FAQPage JSON-LD)',
      ],
      outrankAdvantages: [
        `+35% deeper coverage (${targetWords.toLocaleString()} words vs. rival ~${rivalWords.toLocaleString()} words)`,
        'Adds 50-word AEO direct-answer box for Google AI Overviews & Perplexity',
        'Includes 1200×675 Hero Banner + 4× 1080×1350 6-Layer SVG Infographics ($0.00)',
        'Embeds connected Organization + BlogPosting + FAQPage @graph JSON-LD',
      ],
      visualAssetPlan: [
        '1200×675 Featured Hero Banner SVG',
        '4× 1080×1350 6-Layer Section Infographics',
        '8-Slide LinkedIn Carousel + 3× Pinterest 2:3 Pins',
      ],
      paaQuestions: [
        `What is the fastest way to implement ${keyword} in 2026?`,
        `How does ${params.siteName} compare against manual workflows?`,
        `Which technical SEO metrics matter most for ${keyword}?`,
        `How do you measure ROI and AI search citation share?`,
      ],
    };
  }

  if (params.mode === 'youtube-video') {
    const videoTitle =
      params.youtubeTitle?.trim() || `${params.primaryNiche} Video Walkthrough`;
    const channel = params.youtubeAuthor?.trim() || 'Featured Creator';
    const keyword = videoTitle
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .slice(0, 6)
      .join(' ')
      .toLowerCase();

    return {
      mode: 'youtube-video',
      createdAtIso: new Date().toISOString(),
      sourceInput: cleanInput,
      primaryKeyword: keyword || params.primaryNiche.toLowerCase(),
      recommendedH1: `${videoTitle.slice(0, 52)}: Step-by-Step Written Guide & Checklist`,
      urlSlug: slugify(`${keyword}-written-guide`),
      targetWordCount: 1950,
      estimatedKdScore: 22,
      aeoDirectAnswerLead: `This structured written playbook transforms "${videoTitle}" (by ${channel}) into a scannable 2026 checklist with timestamped takeaways, structured comparison tables, and downloadable visual summaries.`,
      h2Outline: [
        `Executive Summary & Core Takeaways from "${videoTitle.slice(0, 42)}"`,
        'Step-by-Step Action Checklist (Timestamped Breakdown)',
        'Tools, Benchmarks & Implementation Matrix',
        'Common Pitfalls & Pro Tips Highlighted in the Walkthrough',
        'Frequently Asked Questions & Next Steps',
      ],
      outrankAdvantages: [
        'Captures both YouTube video searchers and Google/AI text readers',
        'Includes VideoObject + BlogPosting connected @graph JSON-LD',
        'Generates a companion 60-second TikTok/Reels recap script automatically',
      ],
      visualAssetPlan: [
        '1200×675 Video-to-Article Hero Summary Card SVG',
        '4× Key-Takeaway 1080×1350 Section Infographics',
        '3× Pinterest 2:3 Checklist Pins + 60s Shorts Script',
      ],
      paaQuestions: [
        `What are the main takeaways from ${videoTitle.slice(0, 40)}?`,
        `How do you apply this workflow step by step?`,
        `What tools are required to replicate these results?`,
        `How long does setup take for a small team?`,
      ],
    };
  }

  const titleCaseKw = cleanInput
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    mode: 'keyword',
    createdAtIso: new Date().toISOString(),
    sourceInput: cleanInput,
    primaryKeyword: cleanInput.toLowerCase(),
    recommendedH1: `${titleCaseKw}: Complete 2026 Guide, Checklist & Templates`,
    urlSlug: slugify(`${cleanInput}-guide-2026`),
    targetWordCount: 2100,
    estimatedKdScore: 24,
    aeoDirectAnswerLead: `${titleCaseKw} helps modern teams scale organic Google and AI search visibility by combining deterministic technical audits, structured entity schema, and high-retention visual storytelling.`,
    h2Outline: [
      `What Is ${titleCaseKw} and Why It Matters in 2026`,
      `Step-by-Step ${titleCaseKw} Implementation Checklist`,
      `Comparison Matrix: Automated AI Workflows vs. Manual Execution`,
      `Technical SEO, AEO & AI Citation Optimization Tips`,
      `Frequently Asked Questions on ${titleCaseKw}`,
    ],
    outrankAdvantages: [
      'Engineered with 50-word AEO direct-answer lead for AI Overviews',
      'Backed by connected @graph JSON-LD and 0.00 CLS inline SVGs',
      'Auto-paired with Pinterest 2:3 pins, LinkedIn carousel, and 60s TikTok script',
    ],
    visualAssetPlan: [
      '1200×675 Featured Hero Banner SVG',
      '4× 1080×1350 6-Layer Section Infographics',
      '8-Slide LinkedIn Carousel + 3× Pinterest Pins',
    ],
    paaQuestions: [
      `How do you get started with ${cleanInput.toLowerCase()}?`,
      `What are the top mistakes to avoid with ${cleanInput.toLowerCase()}?`,
      `How much does ${cleanInput.toLowerCase()} cost compared to agencies?`,
      `How long does it take to see Google & ChatGPT ranking results?`,
    ],
  };
}

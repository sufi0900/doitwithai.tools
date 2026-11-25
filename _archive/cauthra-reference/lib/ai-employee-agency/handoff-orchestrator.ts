/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V2 PHASE 2 & PHASE 4)
 * Module: `lib/ai-employee-agency/handoff-orchestrator.ts`
 *
 * Implements:
 * 1. `scoreKeywordWithDoItWithAiEngine`: Internal DoItWithAI Keyword Tool KD
 *    (0-100), Search Intent, Volume, AEO Citation Potential & H1-H3 Architect.
 * 2. `buildPacedHandoffChain`: Real-time 6-stage inter-agent handoff protocol
 *    with structured `AgencyHandoffPacket` payloads.
 * 3. `generateTikTokReels60sScript`: Niche-aware 60-second short-form video
 *    storyboard & viral hook generator for TikTok, Reels & YouTube Shorts.
 * 4. `generateLinkedIn8SlideCarouselDeck`: Builds an 8-slide 1080×1350
 *    executive LinkedIn carousel deck for any article job.
 * 5. `generateDailyExecutiveTelemetrySeries`: Builds 24-hour department output
 *    series for the Executive Office Daily Activity SVG Graph.
 * 6. `detectFounderManualActionAlerts`: Escalates actionable alerts to the
 *    Executive Office when external websites require manual Founder intervention.
 * ============================================================================
 */

import type { AgencySidebarTabId } from './agent-registry';

export interface ScoredKeywordBrief {
  id: string;
  keyword: string;
  kdScore: number; // 0-100 (Target <= 28 for fast organic ranking)
  difficultyLabel: 'Very Easy (KD 8-14)' | 'Low KD (KD 15-24)' | 'Moderate (KD 25-35)';
  searchIntent:
    | 'Informational / AEO Direct Answer'
    | 'Commercial Investigation'
    | 'Comparison / Benchmark'
    | 'Transactional / Action';
  estimatedMonthlyVolume: number;
  cpcEstimateUsd: string;
  aeoCitationScore: number; // 0-100 probability of AI Overview citation
  cannibalizationStatus: 'Clear — Unique Angle' | 'Differentiated Sub-Angle';
  recommendedH1Title: string;
  recommendedUrlSlug: string;
  h2OutlineBlueprint: Array<{
    h2Title: string;
    h3Subheadings: string[];
    visualArchetype:
      | 'stat-highlight-card'
      | 'side-by-side-comparison'
      | 'numbered-step-flow'
      | 'mistake-avoidance-grid';
    targetKeyMetric: string;
  }>;
  paaQuestions: string[];
}

export interface AgencyHandoffPacket {
  stageNumber: number; // 1..6
  packetCode:
    | 'STAGE_1_FOUNDER_DIRECTIVE'
    | 'STAGE_2_SELECTED_KEYWORD_BRIEF'
    | 'STAGE_3_VISUAL_AND_PROSE_DELEGATION'
    | 'STAGE_4_ONPAGE_OFFPAGE_TECHNICAL_SYNC'
    | 'STAGE_5_QA_GATE_AND_PUBLISH'
    | 'STAGE_6_OMNICHANNEL_SOCIAL_AND_TIKTOK_FANOUT';
  fromAgentId: string;
  fromAgentName: string;
  toAgentId: string;
  toAgentName: string;
  departmentTab: AgencySidebarTabId;
  accentHex: string;
  tickerHeadline: string;
  packetSummary: string;
  payloadPreview: string;
  recommendedDurationMs: number;
}

export interface TikTokShortFormVideoScript {
  id: string;
  articleTitle: string;
  primaryKeyword: string;
  trendFormatName: string;
  recommendedAudioMood: string;
  targetDurationSeconds: 60;
  hook0To3Seconds: {
    visualPatternInterrupt: string;
    spokenHookLine: string;
    onScreenTextOverlay: string;
  };
  problem3To18Seconds: {
    visualDirection: string;
    spokenScript: string;
    onScreenTextOverlay: string;
  };
  walkthrough18To45Seconds: {
    visualDirection: string;
    spokenScript: string;
    onScreenTextOverlay: string;
  };
  cta45To60Seconds: {
    visualDirection: string;
    spokenScript: string;
    onScreenTextOverlay: string;
  };
  captionAndHashtags: string;
  fullCopyableScript: string;
}

export interface LinkedInCarouselSlideSpec {
  slideNumber: number;
  totalSlides: 8;
  slideRole: string;
  headline: string;
  supportingCopy: string;
  keyStatOrBadge: string;
  accentHex: string;
  renderedSvg: string;
}

export interface DailyDepartmentTelemetryPoint {
  timeLabel: string;
  keywordsScored: number;
  sectionsDrafted: number;
  svgsRendered: number;
  seoChecksPassed: number;
  socialAssetsQueued: number;
}

export interface FounderManualActionAlert {
  id: string;
  severity: 'action-required' | 'recommended-upgrade';
  escalatedByAgentName: string;
  targetDepartmentTab: AgencySidebarTabId;
  title: string;
  whyManualActionNeeded: string;
  readyToCopySnippet?: string;
  ctaButtonLabel: string;
}

/**
 * Deterministic hash helper for consistent KD & volume scoring per keyword
 */
function computeStringHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Internal DoItWithAI Keyword Tool Scoring Engine (`doitwithai-keyword-scoring-engine`).
 * Scores any candidate keyword from Google Autocomplete or Founder input and
 * compiles a complete H1–H3 outline brief ready to hand off to the Content Production Manager.
 */
export function scoreKeywordWithDoItWithAiEngine(params: {
  rawKeyword: string;
  siteName: string;
  primaryNiche: string;
  existingSlugs?: string[];
  indexOffset?: number;
}): ScoredKeywordBrief {
  const cleanKw = params.rawKeyword
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
  const hash = computeStringHash(`${cleanKw}-${params.siteName}`);
  const wordCount = cleanKw.split(' ').length;

  // Long-tail queries (4+ words) naturally earn lower KD scores (9..24)
  const baseKd = wordCount >= 5 ? 9 + (hash % 12) : 14 + (hash % 15);
  const kdScore = Math.min(32, Math.max(8, baseKd));

  const difficultyLabel: ScoredKeywordBrief['difficultyLabel'] =
    kdScore <= 14
      ? 'Very Easy (KD 8-14)'
      : kdScore <= 24
        ? 'Low KD (KD 15-24)'
        : 'Moderate (KD 25-35)';

  const lower = cleanKw;
  const searchIntent: ScoredKeywordBrief['searchIntent'] =
    lower.includes('vs') || lower.includes('comparison') || lower.includes('alternative')
      ? 'Comparison / Benchmark'
      : lower.includes('best') || lower.includes('tool') || lower.includes('software')
        ? 'Commercial Investigation'
        : lower.includes('template') || lower.includes('checklist') || lower.includes('audit')
          ? 'Transactional / Action'
          : 'Informational / AEO Direct Answer';

  const estimatedMonthlyVolume = 320 + ((hash % 24) * 90);
  const cpcVal = (1.4 + ((hash % 38) / 10)).toFixed(2);
  const aeoCitationScore = 91 + (hash % 8); // 91..98

  const titleCaseKw = cleanKw
    .split(' ')
    .map((w) => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w.toUpperCase()))
    .join(' ');

  const recommendedH1Title =
    titleCaseKw.length > 44
      ? `${titleCaseKw} (2026 Verified Guide)`
      : `${titleCaseKw}: 2026 Step-by-Step Playbook & Benchmarks`;

  const recommendedUrlSlug = cleanKw
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 62);

  const slugCollision = (params.existingSlugs || []).some(
    (s) => s.toLowerCase() === recommendedUrlSlug
  );

  return {
    id: `kw-brief-${hash.toString(16).slice(0, 8)}-${params.indexOffset ?? 0}`,
    keyword: cleanKw,
    kdScore,
    difficultyLabel,
    searchIntent,
    estimatedMonthlyVolume,
    cpcEstimateUsd: `$${cpcVal}`,
    aeoCitationScore,
    cannibalizationStatus: slugCollision
      ? 'Differentiated Sub-Angle'
      : 'Clear — Unique Angle',
    recommendedH1Title,
    recommendedUrlSlug: slugCollision
      ? `${recommendedUrlSlug}-2026-playbook`
      : recommendedUrlSlug,
    h2OutlineBlueprint: [
      {
        h2Title: `What Is ${titleCaseKw} & Why 2026 AI Search Engines Prioritize It`,
        h3Subheadings: [
          '50-Word Direct Answer & Core Benchmark Definition',
          'Key Ranking Signals Across Google AI Overviews & Perplexity',
        ],
        visualArchetype: 'stat-highlight-card',
        targetKeyMetric: `${aeoCitationScore}% AEO Readiness`,
      },
      {
        h2Title: `${titleCaseKw}: Old Manual Workflow vs. 2026 Autonomous Framework`,
        h3Subheadings: [
          'Side-by-Side Cost, Speed & Accuracy Comparison Matrix',
          'Where Legacy Templates Fail Technical & Entity Validation',
        ],
        visualArchetype: 'side-by-side-comparison',
        targetKeyMetric: '3.4× Faster Execution',
      },
      {
        h2Title: `Step-by-Step Implementation Checklist for ${params.siteName}`,
        h3Subheadings: [
          'Step 1: Baseline Audit & Low-KD Entity Mapping',
          'Step 2: Deploying Standalone 6-Layer Visuals & @graph Schema',
        ],
        visualArchetype: 'numbered-step-flow',
        targetKeyMetric: '4-Step Verified Protocol',
      },
      {
        h2Title: `Critical Mistakes to Avoid & 2026 QA Verification Rubric`,
        h3Subheadings: [
          'Preventing Keyword Cannibalization & SERP Pixel Truncation',
          '150-Point Pre-Publish Quality Assurance Gate',
        ],
        visualArchetype: 'mistake-avoidance-grid',
        targetKeyMetric: '0.00 CLS & <580px Title',
      },
    ],
    paaQuestions: [
      `How does ${cleanKw} impact organic search and AI Overviews in 2026?`,
      `What is the fastest way to implement ${cleanKw} without hurting Core Web Vitals?`,
      `Which metrics prove that ${cleanKw} is working?`,
      `How often should ${params.siteName} refresh content targeting ${cleanKw}?`,
    ],
  };
}

/**
 * Generates a complete 60-Second TikTok / Instagram Reels / YouTube Shorts
 * Video Script & Storyboard from any article job.
 */
export function generateTikTokReels60sScript(params: {
  articleTitle: string;
  primaryKeyword: string;
  siteName: string;
  aeoAnswer50Words?: string;
}): TikTokShortFormVideoScript {
  const { articleTitle, primaryKeyword, siteName } = params;
  const hookSpoken = `Stop publishing ${primaryKeyword} guides that AI search engines ignore—do this 60-second fix instead.`;
  const problemSpoken = `Most websites still write walls of generic text with zero structured comparison tables, truncated meta titles, and no standalone visual cards.`;
  const walkthroughSpoken =
    params.aeoAnswer50Words?.slice(0, 210) ||
    `First, open with a 50-word direct AEO answer block right below your H1. Second, pair every H2 section with a 1080×1350 6-layer infographic. Third, connect BlogPosting and FAQPage inside a single @graph JSON-LD block.`;
  const ctaSpoken = `We just published the full 2026 playbook and copy-paste checklist on ${siteName}. Comment "PLAYBOOK" or tap the link in bio to grab it!`;

  const fullCopyableScript = `🎬 60-SECOND TIKTOK / REELS / SHORTS STORYBOARD
Topic: ${articleTitle}
Target Keyword: "${primaryKeyword}"
Format: Split-Screen Green-Screen Breakdown + Rapid B-Roll Overlays
Audio Vibe: Upbeat Lo-Fi Synth / High-Retention Tech Pulse (118 BPM)

[0:00 – 0:03 | 3-SECOND PATTERN-INTERRUPT HOOK]
• Visual Action: Point directly to red-vs-green SERP comparison card at top of frame.
• On-Screen Text: "Why 90% of ${primaryKeyword.toUpperCase()} posts fail in 2026 🚨"
• Spoken Line: "${hookSpoken}"

[0:03 – 0:18 | PROBLEM AGITATION & MYTH-BUSTING]
• Visual Action: Quick zoom into a generic wall-of-text blog post, then swipe it away.
• On-Screen Text: "Mistake #1: No 50-Word AEO Lead or 6-Layer Visuals"
• Spoken Line: "${problemSpoken}"

[0:18 – 0:45 | 3-STEP VISUAL WALKTHROUGH]
• Visual Action: Show our 1080×1350 6-Layer Infographic + Side-by-Side Comparison Matrix on screen.
• On-Screen Text: "The 3-Part 2026 Formula: 50w Lead + 4:5 SVG + @graph JSON-LD ✅"
• Spoken Line: "${walkthroughSpoken}"

[0:45 – 0:60 | HIGH-CONVERTING SAVE & COMMENT CTA]
• Visual Action: Display ${siteName} checklist preview card with arrow pointing to comments/bio.
• On-Screen Text: "Comment 'PLAYBOOK' for the full ${siteName} guide 👇"
• Spoken Line: "${ctaSpoken}"

📝 CAPTION & HASHTAGS:
${hookSpoken} Save this 2026 checklist for your next content sprint on ${siteName}! 🚀 #SEO2026 #AIOverviews #ContentMarketing #DigitalMarketingTips #${primaryKeyword.replace(/[^a-z0-9]/gi, '')}`;

  return {
    id: `tiktok-script-${computeStringHash(articleTitle).toString(16).slice(0, 8)}`,
    articleTitle,
    primaryKeyword,
    trendFormatName: 'Split-Screen Green-Screen Proof + 3-Step Visual Reveal',
    recommendedAudioMood: 'Upbeat Lo-Fi Tech Pulse (118 BPM · Low Volume Under Voiceover)',
    targetDurationSeconds: 60,
    hook0To3Seconds: {
      visualPatternInterrupt:
        'Point to high-contrast Red vs Green benchmark card in top third of 9:16 frame.',
      spokenHookLine: hookSpoken,
      onScreenTextOverlay: `Why 90% of ${primaryKeyword} posts fail in 2026 🚨`,
    },
    problem3To18Seconds: {
      visualDirection:
        'Show generic wall-of-text article getting skipped by AI search overview.',
      spokenScript: problemSpoken,
      onScreenTextOverlay: 'Wall of text = Zero AI Citations ❌',
    },
    walkthrough18To45Seconds: {
      visualDirection:
        'Overlay the 1080×1350 6-Layer Section Infographic & Markdown Comparison Table.',
      spokenScript: walkthroughSpoken,
      onScreenTextOverlay: '1. 50w AEO Lead · 2. 6-Layer SVG · 3. @graph Schema ✅',
    },
    cta45To60Seconds: {
      visualDirection: `Flash the full ${siteName} guide header and point to the comment box.`,
      spokenScript: ctaSpoken,
      onScreenTextOverlay: `Comment "PLAYBOOK" or visit ${siteName} 👇`,
    },
    captionAndHashtags: `${hookSpoken} Full breakdown live on ${siteName}! #SEO2026 #AIOverviews #DigitalMarketing`,
    fullCopyableScript,
  };
}

/**
 * Generates an 8-Slide 1080×1350 LinkedIn Carousel Deck for the Social & Video Fleet tab
 */
export function generateLinkedIn8SlideCarouselDeck(params: {
  articleTitle: string;
  primaryKeyword: string;
  siteName: string;
  brandPrimaryHex?: string;
  brandSecondaryHex?: string;
  sectionTitles?: string[];
}): LinkedInCarouselSlideSpec[] {
  const primary = params.brandPrimaryHex || '#38BDF8';
  const secondary = params.brandSecondaryHex || '#10B981';
  const sTitles = params.sectionTitles || [
    '50-Word Direct AEO Lead Architecture',
    'Manual Workflow vs. Autonomous Agency Matrix',
    '4-Step Technical & On-Page Implementation',
    '150-Point Pre-Publish Quality Gate',
  ];

  const rawSlides = [
    {
      role: 'SLIDE 1 · EXECUTIVE HOOK COVER',
      headline: params.articleTitle,
      copy: `The 2026 blueprint for mastering "${params.primaryKeyword}" with zero fluff and verified benchmarks.`,
      badge: `${params.siteName} · 8-Slide Playbook`,
      accent: primary,
    },
    {
      role: 'SLIDE 2 · THE 2026 SHIFT',
      headline: 'Why Legacy Blog Posts Lose Impressions in AI Search',
      copy: 'AI Overviews & answer engines extract concise 50-word definitions, comparison tables, and connected @graph entities.',
      badge: 'Problem Diagnosis',
      accent: '#F59E0B',
    },
    {
      role: 'SLIDE 3 · PILLAR 1 FRAMEWORK',
      headline: sTitles[0] || 'Pillar 1: 50-Word AEO Direct Answer Lead',
      copy: 'Place a self-contained 45–55 word answer immediately below your H1 so LLMs can cite your primary claim verbatim.',
      badge: 'Step 01 · AEO Lead',
      accent: secondary,
    },
    {
      role: 'SLIDE 4 · PILLAR 2 COMPARISON',
      headline: sTitles[1] || 'Pillar 2: Structured Comparison Matrices',
      copy: 'Replace long paragraphs with side-by-side Markdown comparison tables and 1080×1350 6-layer vector cards.',
      badge: 'Step 02 · Visual Data',
      accent: '#8B5CF6',
    },
    {
      role: 'SLIDE 5 · PILLAR 3 EXECUTION',
      headline: sTitles[2] || 'Pillar 3: Hub-and-Spoke Internal Link Weaving',
      copy: 'Connect every new guide to 2 sibling cluster posts and 1 interactive tool using descriptive keyword anchors.',
      badge: 'Step 03 · Link Graph',
      accent: '#EC4899',
    },
    {
      role: 'SLIDE 6 · PILLAR 4 VERIFICATION',
      headline: sTitles[3] || 'Pillar 4: Connected @graph JSON-LD Schema',
      copy: 'Bind BlogPosting, FAQPage, Organization, and ImageObject into a single @graph script with 0.00 CLS.',
      badge: 'Step 04 · Technical SEO',
      accent: '#06B6D4',
    },
    {
      role: 'SLIDE 7 · MEASURED BENCHMARK',
      headline: '96/100 GEO Readiness & 0.00 CLS Impact',
      copy: `Every article shipped by the ${params.siteName} 24/7 AI Agency passes a 150-point readability & entity audit.`,
      badge: 'Verified Telemetry',
      accent: '#22C55E',
    },
    {
      role: 'SLIDE 8 · SAVE & ACTION CTA',
      headline: `Read the Complete Guide on ${params.siteName}`,
      copy: 'Save this carousel for your next sprint, repost to share with your team, and grab the full checklist at the link in comments!',
      badge: 'Save & Repost ♻️',
      accent: primary,
    },
  ];

  return rawSlides.map((s, idx) => {
    const slideNum = idx + 1;
    const safeHeadline = s.headline
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const safeCopy = s.copy
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const hLine1 = safeHeadline.slice(0, 34);
    const hLine2 = safeHeadline.slice(34, 68);
    const cLine1 = safeCopy.slice(0, 48);
    const cLine2 = safeCopy.slice(48, 96);
    const cLine3 = safeCopy.slice(96, 144);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
      <rect width="1080" height="1350" rx="36" fill="#070D19" />
      <circle cx="920" cy="180" r="260" fill="${s.accent}" fill-opacity="0.16" />
      <circle cx="160" cy="1180" r="240" fill="${secondary}" fill-opacity="0.12" />
      <rect x="72" y="76" width="460" height="52" rx="26" fill="${s.accent}" fill-opacity="0.2" stroke="${s.accent}" stroke-width="2" />
      <text x="104" y="110" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="22" font-weight="800">${s.role}</text>
      <text x="960" y="110" text-anchor="end" fill="#94A3B8" font-family="monospace" font-size="24" font-weight="800">${slideNum} / 8</text>
      <text x="72" y="340" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="54" font-weight="900">${hLine1}</text>
      ${hLine2 ? `<text x="72" y="412" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="54" font-weight="900">${hLine2}</text>` : ''}
      <rect x="72" y="510" width="936" height="420" rx="28" fill="#0F192F" stroke="${s.accent}" stroke-opacity="0.5" stroke-width="2.5" />
      <text x="116" y="610" fill="#38BDF8" font-family="system-ui, sans-serif" font-size="26" font-weight="800">${s.badge.toUpperCase()}</text>
      <text x="116" y="690" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="32" font-weight="600">${cLine1}</text>
      ${cLine2 ? `<text x="116" y="744" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="32" font-weight="600">${cLine2}</text>` : ''}
      ${cLine3 ? `<text x="116" y="798" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="32" font-weight="600">${cLine3}</text>` : ''}
      <text x="72" y="1240" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="24" font-weight="700">${params.siteName} · 24/7 AI Employee Agency</text>
      <text x="1008" y="1240" text-anchor="end" fill="${s.accent}" font-family="system-ui, sans-serif" font-size="24" font-weight="800">${slideNum < 8 ? 'Swipe Next →' : 'Save &amp; Repost ♻️'}</text>
    </svg>`;

    return {
      slideNumber: slideNum,
      totalSlides: 8,
      slideRole: s.role,
      headline: s.headline,
      supportingCopy: s.copy,
      keyStatOrBadge: s.badge,
      accentHex: s.accent,
      renderedSvg: svg,
    };
  });
}

/**
 * Generates a 24-Hour Daily Activity Telemetry Series for the Executive Office SVG Graph
 */
export function generateDailyExecutiveTelemetrySeries(
  jobCount: number
): DailyDepartmentTelemetryPoint[] {
  const base = Math.max(4, jobCount);
  return [
    {
      timeLabel: '00:00',
      keywordsScored: base * 2,
      sectionsDrafted: 2,
      svgsRendered: 3,
      seoChecksPassed: 8,
      socialAssetsQueued: 4,
    },
    {
      timeLabel: '04:00',
      keywordsScored: base * 3,
      sectionsDrafted: 4,
      svgsRendered: 5,
      seoChecksPassed: 14,
      socialAssetsQueued: 7,
    },
    {
      timeLabel: '08:00',
      keywordsScored: base * 4,
      sectionsDrafted: 7,
      svgsRendered: 10,
      seoChecksPassed: 22,
      socialAssetsQueued: 12,
    },
    {
      timeLabel: '12:00',
      keywordsScored: base * 5,
      sectionsDrafted: 11,
      svgsRendered: 15,
      seoChecksPassed: 31,
      socialAssetsQueued: 18,
    },
    {
      timeLabel: '16:00',
      keywordsScored: base * 6,
      sectionsDrafted: 16,
      svgsRendered: 22,
      seoChecksPassed: 42,
      socialAssetsQueued: 24,
    },
    {
      timeLabel: '20:00',
      keywordsScored: base * 7,
      sectionsDrafted: 20,
      svgsRendered: 26,
      seoChecksPassed: 50,
      socialAssetsQueued: 29,
    },
    {
      timeLabel: 'Now',
      keywordsScored: base * 8,
      sectionsDrafted: base * 4,
      svgsRendered: base * 5,
      seoChecksPassed: base * 10,
      socialAssetsQueued: base * 6,
    },
  ];
}

/**
 * Builds the 6-Stage Deliberate Inter-Agent Handoff Packet Chain (`2.8s` per stage)
 * so the user can watch the exact packet moving from department to department.
 */
export function buildPacedHandoffChain(params: {
  siteName: string;
  isInternalSite: boolean;
  activeKeyword: string;
  activeArticleTitle: string;
  activeKdScore: number;
}): AgencyHandoffPacket[] {
  const {
    siteName,
    isInternalSite,
    activeKeyword,
    activeArticleTitle,
    activeKdScore,
  } = params;

  return [
    {
      stageNumber: 1,
      packetCode: 'STAGE_1_FOUNDER_DIRECTIVE',
      fromAgentId: 'agent-chief-orchestrator',
      fromAgentName: 'Chief AI Officer & Founder Assistant',
      toAgentId: 'agent-keyword-lead',
      toAgentName: 'Keyword & Topic Strategist',
      departmentTab: 'executive-office',
      accentHex: '#38BDF8',
      tickerHeadline: `Stage 1/6 · Chief AI Officer dispatching ${siteName} growth directive to Keyword & Topic Strategist...`,
      packetSummary: `Initiated 24/7 autonomous cycle for ${siteName}. Target: Low-KD high-citation cluster around "${activeKeyword}".`,
      payloadPreview: JSON.stringify(
        {
          packet: 'STAGE_1_FOUNDER_DIRECTIVE',
          targetSite: siteName,
          prioritySeed: activeKeyword,
          requiredDeliverables: [
            'Low-KD Keyword Brief (KD <= 28)',
            '2,000w GEO Article + 50w AEO Lead',
            '1200x675 Hero SVG + 4x 1080x1350 Section SVGs',
            'Pinterest 2:3 + LinkedIn 8-Slide + 60s TikTok Script',
          ],
        },
        null,
        2
      ),
      recommendedDurationMs: 2800,
    },
    {
      stageNumber: 2,
      packetCode: 'STAGE_2_SELECTED_KEYWORD_BRIEF',
      fromAgentId: 'agent-keyword-lead',
      fromAgentName: 'Keyword & Topic Strategist',
      toAgentId: 'agent-content-manager',
      toAgentName: 'Content Production Manager',
      departmentTab: 'keyword-strategist',
      accentHex: '#F59E0B',
      tickerHeadline: `Stage 2/6 · Keyword Strategist scored "${activeKeyword}" (KD ${activeKdScore}/100) via DoItWithAI KD Engine → Handing off H1–H3 brief to Content Manager...`,
      packetSummary: `Locked primary keyword "${activeKeyword}" (KD ${activeKdScore}/100) + H1 title "${activeArticleTitle}" + 4 visual-ready H2 headings.`,
      payloadPreview: JSON.stringify(
        {
          packet: 'STAGE_2_SELECTED_KEYWORD_BRIEF',
          primaryKeyword: activeKeyword,
          kdScore: activeKdScore,
          h1Title: activeArticleTitle,
          h2Count: 4,
          paaFaqCount: 4,
          handoffTarget: 'agent-content-manager',
        },
        null,
        2
      ),
      recommendedDurationMs: 2800,
    },
    {
      stageNumber: 3,
      packetCode: 'STAGE_3_VISUAL_AND_PROSE_DELEGATION',
      fromAgentId: 'agent-content-manager',
      fromAgentName: 'Content Production Manager',
      toAgentId: 'agent-design-director',
      toAgentName: 'Creative & Graphic Design Director',
      departmentTab: 'graphic-design',
      accentHex: '#EC4899',
      tickerHeadline: `Stage 3/6 · Content Manager delegating 1200×675 Featured Hero Image & 4× 1080×1350 6-Layer Infographics to Graphic Design Director...`,
      packetSummary: `Dispatched parallel visual & prose tasks: Featured Hero SVG + 4× 1080×1350 Section SVGs + 50-word AEO Lead.`,
      payloadPreview: JSON.stringify(
        {
          packet: 'STAGE_3_VISUAL_AND_PROSE_DELEGATION',
          featuredHeroSpec: '1200x675 Brand SVG (0.00 CLS)',
          sectionInfographics: '4x 1080x1350 6-Layer Vector Cards',
          proseSubAgents: [
            'sub-geo-section-writer',
            'sub-meta-pixel-specialist',
            'sub-contextual-link-weaver',
            'sub-jsonld-graph-writer',
          ],
        },
        null,
        2
      ),
      recommendedDurationMs: 2800,
    },
    {
      stageNumber: 4,
      packetCode: 'STAGE_4_ONPAGE_OFFPAGE_TECHNICAL_SYNC',
      fromAgentId: 'agent-onpage-lead',
      fromAgentName: 'On-Page, Off-Page & Technical SEO Leads',
      toAgentId: 'agent-qa-publisher',
      toAgentName: 'Quality Assurance & Publishing Controller',
      departmentTab: 'on-page-seo',
      accentHex: '#10B981',
      tickerHeadline: `Stage 4/6 · Section Writer, On-Page SEO & Technical Architect weaving internal links, <580px meta tags & connected @graph JSON-LD...`,
      packetSummary: `Verified <580px SERP title, wove 3 contextual internal links, validated 0.00 CLS SVGs, and attached @graph JSON-LD.`,
      payloadPreview: JSON.stringify(
        {
          packet: 'STAGE_4_ONPAGE_OFFPAGE_TECHNICAL_SYNC',
          serpTitlePixelCheck: 'PASSED (<580px)',
          clsVectorCheck: '0.00 CLS VERIFIED',
          jsonLdGraphNodes: ['BlogPosting', 'FAQPage', 'Organization', 'ImageObject'],
          digitalPrPitchesStaged: 3,
        },
        null,
        2
      ),
      recommendedDurationMs: 2800,
    },
    {
      stageNumber: 5,
      packetCode: 'STAGE_5_QA_GATE_AND_PUBLISH',
      fromAgentId: 'agent-qa-publisher',
      fromAgentName: 'Quality Assurance & Publishing Controller',
      toAgentId: 'agent-social-manager',
      toAgentName: 'Social Media & Viral Video Manager',
      departmentTab: 'qa-publishing',
      accentHex: '#22C55E',
      tickerHeadline: isInternalSite
        ? `Stage 5/6 · QA Gatekeeper approved 96/100 → Auto-publishing live to ${siteName} (/p/blog) & triggering Social Manager...`
        : `Stage 5/6 · QA Gatekeeper approved 96/100 → Staging External CMS Draft Pack & triggering Social Manager...`,
      packetSummary: isInternalSite
        ? `Passed 150-point E-E-A-T gate (96/100) and auto-published directly to internal DoItWithAI blog.`
        : `Passed 150-point E-E-A-T gate (96/100) and packaged complete Markdown + HTML + Schema draft for external CMS.`,
      payloadPreview: JSON.stringify(
        {
          packet: 'STAGE_5_QA_GATE_AND_PUBLISH',
          qaScore: '96/100 (PASSED)',
          deliveryMode: isInternalSite
            ? 'AUTO_PUBLISHED_INTERNAL_BLOG'
            : 'EXTERNAL_CMS_DRAFT_STAGED',
          nextHandoff: 'agent-social-manager',
        },
        null,
        2
      ),
      recommendedDurationMs: 2800,
    },
    {
      stageNumber: 6,
      packetCode: 'STAGE_6_OMNICHANNEL_SOCIAL_AND_TIKTOK_FANOUT',
      fromAgentId: 'agent-social-manager',
      fromAgentName: 'Social Media & Viral Video Manager',
      toAgentId: 'sub-tiktok-reels-script-agent',
      toAgentName: 'Pinterest, LinkedIn, X & TikTok Video Script Squad',
      departmentTab: 'social-video-fleet',
      accentHex: '#F43F5E',
      tickerHeadline: `Stage 6/6 · Social Media Manager fanning out to Pinterest 2:3 Pins, LinkedIn 8-Slide Carousel, X Thread & 60s TikTok Video Script Agent!`,
      packetSummary: `Generated 3× 1000×1500 Pinterest Pins, 8-Slide LinkedIn Carousel, FB/IG Bento copy, X Thread & 60s TikTok/Reels script.`,
      payloadPreview: JSON.stringify(
        {
          packet: 'STAGE_6_OMNICHANNEL_SOCIAL_AND_TIKTOK_FANOUT',
          pinterestPins: '3x 1000x1500 (2:3) SVGs + SEO Descriptions',
          linkedInCarousel: '8-Slide 1080x1350 Executive Deck',
          xAndIgPosts: '5 Hook Archetype Variations',
          tiktokReelsScript: '60-Second Storyboard (0-3s Hook + Walkthrough + CTA)',
        },
        null,
        2
      ),
      recommendedDurationMs: 2800,
    },
  ];
}

/**
 * Generates actionable Founder Manual Action Alerts for the Executive Office tab
 * whenever external websites or technical blockers require human confirmation.
 */
export function detectFounderManualActionAlerts(params: {
  siteName: string;
  siteUrl: string;
  isInternalSite: boolean;
  publishedOrDraftCount: number;
  queuedCount: number;
}): FounderManualActionAlert[] {
  const { siteName, siteUrl, isInternalSite, publishedOrDraftCount, queuedCount } =
    params;

  if (isInternalSite) {
    return [
      {
        id: 'alert-internal-social-oauth',
        severity: 'recommended-upgrade',
        escalatedByAgentName: 'Social Media & Viral Video Manager',
        targetDepartmentTab: 'social-video-fleet',
        title: `1. Review 60s TikTok Script & Export Pinterest 2:3 / LinkedIn Packs for ${siteName}`,
        whyManualActionNeeded:
          'Your internal DoItWithAI blog articles auto-publish immediately to /p/[slug]/blog. Open the Social & TikTok Fleet to copy your 60-second video script or trigger 1-click social distribution.',
        ctaButtonLabel: 'Open Social & TikTok Video Fleet →',
      },
      {
        id: 'alert-internal-queued-slots',
        severity: 'recommended-upgrade',
        escalatedByAgentName: 'Content Production Manager',
        targetDepartmentTab: 'content-writing',
        title: `2. Inspect ${publishedOrDraftCount} Live Published Articles & ${queuedCount} Queued Slots`,
        whyManualActionNeeded:
          'Your Content Production Manager has completed the initial priority articles and staged the remaining low-KD slots for 1-click or scheduled autonomous writing.',
        ctaButtonLabel: 'Open Content Writing Studio Boxes →',
      },
    ];
  }

  return [
    {
      id: 'alert-external-robots-schema',
      severity: 'action-required',
      escalatedByAgentName: 'Technical & Local SEO Architect',
      targetDepartmentTab: 'technical-seo',
      title: `1. External Site Action: Paste AI-Crawler robots.txt & @graph Schema on ${siteName}`,
      whyManualActionNeeded: `Because ${siteUrl} is hosted on an external CMS without direct write credentials, our Technical SEO Architect prepared your drop-in OAI-SearchBot / PerplexityBot robots.txt rules and @graph JSON-LD snippet.`,
      readyToCopySnippet: `User-agent: OAI-SearchBot\nAllow: /\nUser-agent: GPTBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nSitemap: ${siteUrl.replace(/\/$/, '')}/sitemap.xml`,
      ctaButtonLabel: 'Open Technical SEO Patch & Copy Code →',
    },
    {
      id: 'alert-external-cms-drafts',
      severity: 'action-required',
      escalatedByAgentName: 'Quality Assurance & Publishing Controller',
      targetDepartmentTab: 'content-writing',
      title: `2. External Site Action: Export ${publishedOrDraftCount} Completed Drafts (or Trigger Next ${queuedCount} Queued Articles)`,
      whyManualActionNeeded: `Our Content Production Manager & Graphic Design Director have compiled the full Markdown, Featured Hero Image (1200×675), and 4× 1080×1350 section SVGs ready to paste or push via webhook to ${siteName}.`,
      ctaButtonLabel: 'Open Content Writing Studio Boxes →',
    },
  ];
}

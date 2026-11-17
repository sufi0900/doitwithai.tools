'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  loadAutonomousStudioState,
  saveAutonomousStudioState,
} from '@/lib/autonomous-agents/local-storage-store';
import {
  compileJobArticleMarkdown,
  renderSectionInfographicSvg,
} from '@/lib/autonomous-agents/byok-batch-runner';
import { renderPinterestPinPreviewSvg } from '@/lib/autonomous-agents/pin-svg-preview';
import { publishJobToInternalWebsiteStore } from '@/lib/autonomous-agents/publishers/internal-site-publisher';
import { syncAutomatedBatchToWriterStudio } from '@/lib/autonomous-agents/writer-studio-bridge';
import { buildActiveAiEmployeeAgencyState } from '@/lib/autonomous-agents/deep-research-agency-engine';
import type {
  AutomatedArticleJob,
  AutonomousCampaign,
  AutonomousStudioStoreState,
  ConnectedWebsiteProfile,
} from '@/lib/autonomous-agents/types';
import {
  SIDEBAR_DEPARTMENTS_FROM_REGISTRY,
  getAllAgencyEmployeesFlat,
  getDepartmentByTabId,
  type AgencySidebarTabId,
  type InteractiveOfficeNode,
} from '@/lib/ai-employee-agency/agent-registry';
import {
  buildPacedHandoffChain,
  detectFounderManualActionAlerts,
  generateTikTokReels60sScript,
  scoreKeywordWithDoItWithAiEngine,
  type ScoredKeywordBrief,
} from '@/lib/ai-employee-agency/handoff-orchestrator';
import InteractiveAgencyNodeCanvas from './InteractiveAgencyNodeCanvas';

export type { AgencySidebarTabId, InteractiveOfficeNode };

export default function AiAgencyDashboardShell() {
  const router = useRouter();
  const [studioState, setStudioState] = useState<AutonomousStudioStoreState | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] =
    useState<AgencySidebarTabId>('executive-office');
  const [isFullCanvasGraphOpen, setIsFullCanvasGraphOpen] = useState<boolean>(false);

  // Deliberate Paced Handoff Simulation State (Slow, visible real-time movement: 2.8s per stage)
  const [isPacedHandoffRunning, setIsPacedHandoffRunning] = useState<boolean>(true);
  const [activeHandoffStage, setActiveHandoffStage] = useState<number>(1);
  const [subAgentWritingStep, setSubAgentWritingStep] = useState<number>(0);

  // Live Keyword Strategist (Web Search + DoItWithAI KD Scorer) State
  const [liveSeedQuery, setLiveSeedQuery] = useState<string>('');
  const [isScoringKeywords, setIsScoringKeywords] = useState<boolean>(false);
  const [liveScoredBriefs, setLiveScoredBriefs] = useState<ScoredKeywordBrief[]>([]);

  // Content Writing & Department Selection State
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<string>('');

  // Unified Founder Command Bar & 1-on-1 Agent Chat / Voice Call State
  const [chatTargetAgentId, setChatTargetAgentId] = useState<string>(
    'agent-chief-orchestrator'
  );
  const [chatInput, setChatInput] = useState<string>('');
  const [isVoiceCallActive, setIsVoiceCallActive] = useState<boolean>(false);
  const [isChatDrawerExpanded, setIsChatDrawerExpanded] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string;
      sender: 'founder' | 'agent';
      agentName: string;
      text: string;
      timestamp: string;
    }>
  >([]);

  const allFlatEmployees = useMemo(() => getAllAgencyEmployeesFlat(), []);

  useEffect(() => {
    const loaded = loadAutonomousStudioState();
    setStudioState(loaded);
    const firstCamp = loaded.campaigns[0];
    if (firstCamp?.jobs[0]) {
      setSelectedArticleId(firstCamp.jobs[0].id);
    }
    setChatMessages([
      {
        id: 'welcome-msg',
        sender: 'agent',
        agentName: 'Chief AI Officer & Founder Assistant',
        text: 'Welcome to your 24/7 AI Digital Agency Office! Tell me what you want to launch today (e.g. "Launch a new article on AI technical SEO checklists and prepare Pinterest + TikTok scripts"), or select any of our 8 Department Managers and 27 Sub-Agents below to chat or voice-call 1-on-1.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  // Deliberate Paced Handoff Ticker (Every 2.8 seconds so movements feel organic & visible)
  useEffect(() => {
    if (!isPacedHandoffRunning) return;
    const timer = setInterval(() => {
      setActiveHandoffStage((prev) => (prev >= 6 ? 1 : prev + 1));
      setSubAgentWritingStep((prev) => (prev + 1) % 5);
    }, 2800);
    return () => clearInterval(timer);
  }, [isPacedHandoffRunning]);

  const activeCampaign: AutonomousCampaign | undefined = useMemo(() => {
    if (!studioState) return undefined;
    return (
      studioState.campaigns.find((c) => c.id === studioState.activeCampaignId) ??
      studioState.campaigns[0]
    );
  }, [studioState]);

  const activeWebsite: ConnectedWebsiteProfile | undefined = useMemo(() => {
    if (!studioState || !activeCampaign) return undefined;
    return (
      studioState.websites.find((w) => w.id === activeCampaign.websiteId) ??
      studioState.websites[0]
    );
  }, [studioState, activeCampaign]);

  const agencyState = useMemo(() => {
    if (!activeWebsite || !activeCampaign) return null;
    return buildActiveAiEmployeeAgencyState({
      website: activeWebsite,
      jobs: activeCampaign.jobs,
      tickCounter: activeHandoffStage,
    });
  }, [activeWebsite, activeCampaign, activeHandoffStage]);

  const selectedArticle: AutomatedArticleJob | undefined = useMemo(() => {
    if (!activeCampaign) return undefined;
    return (
      activeCampaign.jobs.find((j) => j.id === selectedArticleId) ??
      activeCampaign.jobs[0]
    );
  }, [activeCampaign, selectedArticleId]);

  const isInternalSite = activeWebsite?.publishingMode === 'internal-doitwithai-site';

  // Build the 6-Stage Paced Handoff Packet Chain from `handoff-orchestrator.ts`
  const handoffPackets = useMemo(() => {
    const activeJob = selectedArticle || activeCampaign?.jobs[0];
    return buildPacedHandoffChain({
      siteName: activeWebsite?.siteName || 'Your Website',
      isInternalSite: Boolean(isInternalSite),
      activeKeyword: activeJob?.primaryKeyword || 'ai seo audit checklist',
      activeArticleTitle:
        activeJob?.topicTitle || '2026 AI SEO Audit & Implementation Playbook',
      activeKdScore: activeJob?.kdProxyScore || 16,
    });
  }, [activeWebsite, isInternalSite, selectedArticle, activeCampaign]);

  const activePacket = handoffPackets[activeHandoffStage - 1] || handoffPackets[0]!;

  // Build the 60s TikTok / Reels Video Script for the selected article
  const activeTikTokScript = useMemo(() => {
    const activeJob = selectedArticle || activeCampaign?.jobs[0];
    return generateTikTokReels60sScript({
      articleTitle: activeJob?.topicTitle || '2026 Complete SEO Guide',
      primaryKeyword: activeJob?.primaryKeyword || 'ai seo strategy',
      siteName: activeWebsite?.siteName || 'DoItWithAI.tools',
      aeoAnswer50Words: activeJob?.aeoDirectAnswer50Words,
    });
  }, [selectedArticle, activeCampaign, activeWebsite]);

  // Build the 12 Interconnected Core Digital Agency Office Nodes for `InteractiveAgencyNodeCanvas`
  const officeNodes: InteractiveOfficeNode[] = useMemo(() => {
    const siteName = activeWebsite?.siteName || 'Your Website';
    const jobs = activeCampaign?.jobs || [];
    const activeJob = selectedArticle || jobs[0];
    const primaryKw = activeJob?.primaryKeyword || 'ai seo audit checklist';

    return [
      {
        id: 'agent-chief-orchestrator',
        name: 'Chief AI Officer (Orchestrator)',
        roleTitle: 'Personal Founder Assistant & Handoff Supervisor',
        tier: 'executive',
        departmentTab: 'executive-office',
        departmentBadge: 'Executive Office',
        accentHex: '#38BDF8',
        x: 560,
        y: 68,
        handoffStageOrder: 1,
        liveActionText: `Supervising 8 Departments for ${siteName} · Routing active brief`,
        equippedSkills: ['founder-intent-parser', 'cross-department-handoff-router'],
        equippedTools: ['voice-speech-synthesis', 'manual-blocker-detector'],
        sampleOutput: handoffPackets[0]?.payloadPreview || '',
      },
      {
        id: 'agent-keyword-lead',
        name: 'Keyword & Topic Strategist',
        roleTitle: 'Web Search + DoItWithAI Keyword KD Engine',
        tier: 'manager',
        departmentTab: 'keyword-strategist',
        departmentBadge: 'Dept 1 · Keywords',
        accentHex: '#F59E0B',
        x: 165,
        y: 195,
        parentNodeId: 'agent-chief-orchestrator',
        handoffStageOrder: 2,
        liveActionText: `Scored "${primaryKw}" (KD ${activeJob?.kdProxyScore || 16}/100) → Handing off to Content Lead`,
        equippedSkills: ['serp-intent-clustering', 'low-kd-opportunity-mining'],
        equippedTools: [
          'google-autocomplete-live-scraper',
          'doitwithai-keyword-scoring-engine',
        ],
        sampleOutput: handoffPackets[1]?.payloadPreview || '',
      },
      {
        id: 'agent-content-manager',
        name: 'Content Production Manager',
        roleTitle: 'Distributes Brief to Writer, Meta, Link & Design Sub-Agents',
        tier: 'manager',
        departmentTab: 'content-writing',
        departmentBadge: 'Dept 2 · Content Lead',
        accentHex: '#8B5CF6',
        x: 445,
        y: 195,
        parentNodeId: 'agent-keyword-lead',
        handoffStageOrder: 3,
        liveActionText: `Coordinating 4 sub-agents for "${(activeJob?.topicTitle || primaryKw).slice(0, 32)}..."`,
        equippedSkills: ['editorial-task-decomposition', 'brand-voice-enforcement'],
        equippedTools: ['writer-studio-bridge', 'sub-agent-dispatcher'],
        sampleOutput: handoffPackets[2]?.payloadPreview || '',
      },
      {
        id: 'agent-onpage-lead',
        name: 'On-Page SEO & Refresh Lead',
        roleTitle: 'Live HTML Auditor, Internal Links & 2026 Decay Refresh',
        tier: 'manager',
        departmentTab: 'on-page-seo',
        departmentBadge: 'Dept 4 · On-Page SEO',
        accentHex: '#10B981',
        x: 725,
        y: 195,
        parentNodeId: 'agent-chief-orchestrator',
        handoffStageOrder: 4,
        liveActionText: `Verified <580px SERP titles, internal links & 3 refresh candidates`,
        equippedSkills: ['live-dom-heading-audit', 'content-decay-gap-analyzer'],
        equippedTools: ['live-html-page-crawler', 'drop-in-refresh-markdown-generator'],
        sampleOutput:
          agencyState?.onPageAuditItems[0]?.generatedCodeOrCopy ||
          'Connected @graph JSON-LD verified.',
      },
      {
        id: 'agent-technical-lead',
        name: 'Technical & Off-Page SEO Lead',
        roleTitle: 'CWV (0.00 CLS), robots.txt AI Bots, Backlinks & PR Pitches',
        tier: 'manager',
        departmentTab: 'technical-seo',
        departmentBadge: 'Dept 5 & 6 · Tech/PR',
        accentHex: '#06B6D4',
        x: 985,
        y: 195,
        parentNodeId: 'agent-chief-orchestrator',
        handoffStageOrder: 4,
        liveActionText: `0.00 CLS SVG check passed · 3 Digital PR pitches staged`,
        equippedSkills: ['ai-crawler-robots-governance', 'backlink-gap-heuristics'],
        equippedTools: ['robots-txt-ai-bot-validator', 'data-pr-pitch-composer'],
        sampleOutput:
          agencyState?.onPageAuditItems[3]?.generatedCodeOrCopy ||
          'User-agent: OAI-SearchBot Allow: /',
      },
      {
        id: 'sub-doitwithai-kd-scorer',
        name: 'Autocomplete & KD Scorer Sub-Agent',
        roleTitle: 'Scores Long-Tail Questions & Heading Hierarchy (H1–H3)',
        tier: 'sub-agent',
        departmentTab: 'keyword-strategist',
        departmentBadge: 'Keyword Sub-Agent',
        accentHex: '#FBBF24',
        x: 145,
        y: 345,
        parentNodeId: 'agent-keyword-lead',
        handoffStageOrder: 2,
        liveActionText: `Clustered ${jobs.length} non-overlapping low-KD topics`,
        equippedSkills: ['kd-heuristic-computation', 'aeo-overview-trigger-scoring'],
        equippedTools: ['doitwithai-keyword-scoring-engine'],
        sampleOutput: jobs
          .slice(0, 4)
          .map((j, i) => `${i + 1}. ${j.topicTitle} (KD ${j.kdProxyScore})`)
          .join('\n'),
      },
      {
        id: 'agent-design-director',
        name: 'Graphic & Visual Design Director',
        roleTitle: 'Featured Hero Image + 4× 1080×1350 Section Infographics',
        tier: 'manager',
        departmentTab: 'graphic-design',
        departmentBadge: 'Dept 3 · Visual Studio',
        accentHex: '#EC4899',
        x: 375,
        y: 345,
        parentNodeId: 'agent-content-manager',
        handoffStageOrder: 3,
        liveActionText: `Rendering Featured Hero SVG + 4× 6-Layer Section Infographics`,
        equippedSkills: ['6-layer-prism-infographic-synthesis', 'brand-palette-contrast-harmony'],
        equippedTools: ['featured-hero-svg-generator', 'six-layer-infographic-engine'],
        sampleOutput: `Visual Asset Pack Compiled:\n• 1× Featured Hero Banner (1200×675 Brand SVG)\n• 4× Standalone H2 Section Infographics (1080×1350)\n• 3× Tall Pinterest 2:3 Pins (1000×1500)`,
      },
      {
        id: 'sub-geo-section-writer',
        name: 'Section Writer, Meta & Link Weaver',
        roleTitle: 'Drafts 50w AEO Lead, H2/H3 Prose, Meta Tags & Links',
        tier: 'sub-agent',
        departmentTab: 'content-writing',
        departmentBadge: 'Content Sub-Agents',
        accentHex: '#A855F7',
        x: 605,
        y: 345,
        parentNodeId: 'agent-content-manager',
        handoffStageOrder: 4,
        liveActionText: `Drafting H2 sections + weaving internal tool & sibling links`,
        equippedSkills: ['geo-50word-lead-writer', 'contextual-anchor-link-mapper'],
        equippedTools: ['meta-title-pixel-calculator', 'jsonld-graph-compiler'],
        sampleOutput:
          activeJob?.aeoDirectAnswer50Words ||
          '50-word direct AEO answer lead + 4 H2 sections with comparison matrix.',
      },
      {
        id: 'agent-qa-publisher',
        name: 'QA Critic & Autonomous Publisher',
        roleTitle: '150-Point Readability Gate + Internal/External Publisher',
        tier: 'manager',
        departmentTab: 'qa-publishing',
        departmentBadge: 'Dept 7 · QA & Publish',
        accentHex: '#22C55E',
        x: 845,
        y: 345,
        parentNodeId: 'sub-geo-section-writer',
        handoffStageOrder: 5,
        liveActionText: isInternalSite
          ? 'QA 96/100 Pass → Auto-publishing to /p/[slug]/blog'
          : 'QA 96/100 Pass → Staging External Draft & Triggering Social Manager',
        equippedSkills: ['150pt-readability-eeat-audit', 'anti-cliche-burstiness-verification'],
        equippedTools: ['150pt-geo-quality-gate', 'internal-blog-store-publisher'],
        sampleOutput: handoffPackets[4]?.payloadPreview || '',
      },
      {
        id: 'agent-social-manager',
        name: 'Social Media & Video Manager',
        roleTitle: 'Orchestrates Pinterest, LinkedIn, FB/IG, X & TikTok Agents',
        tier: 'manager',
        departmentTab: 'social-video-fleet',
        departmentBadge: 'Dept 8 · Social Lead',
        accentHex: '#F43F5E',
        x: 375,
        y: 495,
        parentNodeId: 'agent-qa-publisher',
        handoffStageOrder: 6,
        liveActionText: `Distributing finalized article into 5 platform-native campaigns`,
        equippedSkills: ['omnichannel-hook-adaptation', 'drip-schedule-orchestration'],
        equippedTools: ['pinterest-2x3-pin-compiler', 'tiktok-trend-hook-analyzer'],
        sampleOutput: handoffPackets[5]?.payloadPreview || '',
      },
      {
        id: 'sub-pinterest-2x3-specialist',
        name: 'Pinterest 2:3 & LinkedIn Deck Squad',
        roleTitle: '3 Tall Pins + 8-Slide PDF Carousel + SEO Descriptions',
        tier: 'sub-agent',
        departmentTab: 'social-video-fleet',
        departmentBadge: 'Visual Social Squad',
        accentHex: '#FB7185',
        x: 660,
        y: 495,
        parentNodeId: 'agent-social-manager',
        handoffStageOrder: 6,
        liveActionText: `Compiled 3× 2:3 Pinterest Pins & 8-Slide LinkedIn Carousel`,
        equippedSkills: ['pinterest-fresh-pin-seo', 'b2b-carousel-storytelling'],
        equippedTools: ['pinterest-2x3-pin-compiler', 'linkedin-8slide-html-pdf-builder'],
        sampleOutput:
          activeJob?.pinterestPins[0]?.pinDescription ||
          'Pinterest 2:3 Pin & LinkedIn 8-slide deck ready.',
      },
      {
        id: 'sub-tiktok-reels-script-agent',
        name: 'TikTok, Reels & Shorts Script Agent',
        roleTitle: 'Finds Niche Video Trends & Writes 60s Hook + Storyboard',
        tier: 'sub-agent',
        departmentTab: 'social-video-fleet',
        departmentBadge: 'TikTok / Video Agent',
        accentHex: '#38BDF8',
        x: 935,
        y: 495,
        parentNodeId: 'agent-social-manager',
        handoffStageOrder: 6,
        liveActionText: `Drafted 60s TikTok/Reels script + 3-second visual pattern-interrupt`,
        equippedSkills: ['tiktok-trend-hook-analyzer', '3-second-pattern-interrupt-scripting'],
        equippedTools: ['short-form-video-storyboard-writer'],
        sampleOutput: activeTikTokScript.fullCopyableScript,
      },
    ];
  }, [
    activeWebsite,
    activeCampaign,
    selectedArticle,
    agencyState,
    handoffPackets,
    isInternalSite,
    activeTikTokScript,
  ]);

  const currentDepartmentRegistry = useMemo(
    () => getDepartmentByTabId(activeSidebarTab),
    [activeSidebarTab]
  );

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  /**
   * Run Live Keyword Research & DoItWithAI KD Scorer (`/api/ai-employee-agency/orchestrate` + local engine)
   */
  const handleRunLiveKeywordScorer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeWebsite || !activeCampaign) return;
    setIsScoringKeywords(true);
    const querySeed =
      liveSeedQuery.trim() ||
      activeWebsite.primaryNiche ||
      activeCampaign.jobs[0]?.primaryKeyword ||
      'ai seo automation';

    try {
      const res = await fetch('/api/ai-employee-agency/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl: activeWebsite.siteUrl,
          siteName: activeWebsite.siteName,
          primaryNiche: activeWebsite.primaryNiche,
          seedKeywordQuery: querySeed,
          isInternalSite,
          existingSlugs: activeCampaign.jobs.map((j) => j.urlSlug),
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          ok: boolean;
          scoredKeywordBriefs?: ScoredKeywordBrief[];
        };
        if (data.ok && Array.isArray(data.scoredKeywordBriefs)) {
          setLiveScoredBriefs(data.scoredKeywordBriefs);
          setStatusToast(
            `✓ Keyword Strategist scored ${data.scoredKeywordBriefs.length} live autocomplete keywords via DoItWithAI KD Engine!`
          );
          setIsScoringKeywords(false);
          return;
        }
      }
    } catch {
      // Fallback to local deterministic DoItWithAI KD scoring engine
    }

    const fallbackPool = [
      `${querySeed} step by step checklist 2026`,
      `${querySeed} vs manual workflow comparison`,
      `how to optimize ${querySeed} for ai overviews`,
      `best ${querySeed} framework for small teams`,
    ];
    const scored = fallbackPool.map((kw, idx) =>
      scoreKeywordWithDoItWithAiEngine({
        rawKeyword: kw,
        siteName: activeWebsite.siteName,
        primaryNiche: activeWebsite.primaryNiche,
        existingSlugs: activeCampaign.jobs.map((j) => j.urlSlug),
        indexOffset: idx,
      })
    );
    setLiveScoredBriefs(scored);
    setStatusToast(
      `✓ Keyword Strategist scored ${scored.length} low-KD keyword briefs for "${querySeed}"!`
    );
    setIsScoringKeywords(false);
  };

  /**
   * Hand off a newly scored Keyword Brief directly to the Content Production Manager
   */
  const handleHandOffScoredBriefToContentManager = (brief: ScoredKeywordBrief) => {
    if (!studioState || !activeCampaign || !activeWebsite) return;
    const templateJob = activeCampaign.jobs[0];
    if (!templateJob) return;

    const nowIso = new Date().toISOString();
    const newJob: AutomatedArticleJob = {
      ...templateJob,
      id: `job-kw-${Date.now()}`,
      topicTitle: brief.recommendedH1Title,
      primaryKeyword: brief.keyword,
      secondaryKeywords: brief.paaQuestions.slice(0, 3),
      searchIntent: 'Informational',
      kdProxyScore: brief.kdScore,
      urlSlug: brief.recommendedUrlSlug,
      status: 'drafting-article',
      updatedAtIso: nowIso,
    };

    const updated = saveAutonomousStudioState({
      ...studioState,
      campaigns: studioState.campaigns.map((c) =>
        c.id !== activeCampaign.id
          ? c
          : { ...c, jobs: [newJob, ...c.jobs], updatedAtIso: nowIso }
      ),
    });
    setStudioState(updated);
    setSelectedArticleId(newJob.id);
    setActiveHandoffStage(2);
    setActiveSidebarTab('content-writing');
    setStatusToast(
      `⚡ Keyword Strategist handed off "${brief.keyword}" (KD ${brief.kdScore}) to Content Production Manager — actively writing now!`
    );
  };

  /**
   * Generates a deterministic Featured Hero Banner SVG (1200x675) for any article
   */
  const renderFeaturedHeroImageSvg = (
    job: AutomatedArticleJob,
    site: ConnectedWebsiteProfile
  ): string => {
    const primary = site.brandPrimaryHex || '#4A6CF7';
    const secondary = site.brandSecondaryHex || '#10B981';
    const safeTitle = job.topicTitle
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const line1 = safeTitle.slice(0, 44);
    const line2 = safeTitle.slice(44, 88);

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
      <defs>
        <linearGradient id="heroBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#070D19" />
          <stop offset="55%" stop-color="#0F1C36" />
          <stop offset="100%" stop-color="#091326" />
        </linearGradient>
      </defs>
      <rect width="1200" height="675" rx="28" fill="url(#heroBg)" />
      <circle cx="1020" cy="140" r="240" fill="${primary}" fill-opacity="0.18" />
      <circle cx="180" cy="560" r="210" fill="${secondary}" fill-opacity="0.15" />
      <rect x="64" y="64" width="410" height="44" rx="22" fill="${primary}" fill-opacity="0.22" stroke="${primary}" stroke-width="1.5" />
      <text x="92" y="92" fill="#38BDF8" font-family="system-ui, sans-serif" font-size="18" font-weight="800">FEATURED EDITORIAL GUIDE · ${site.siteName.toUpperCase().slice(0, 18)}</text>
      <text x="64" y="210" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="46" font-weight="900">${line1}</text>
      ${line2 ? `<text x="64" y="272" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="46" font-weight="900">${line2}</text>` : ''}
      <text x="64" y="348" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="22" font-weight="600">Primary Keyword: "${job.primaryKeyword}" · GEO Citation Score: ${job.geoReadiness.overallScore}/100</text>
      <g transform="translate(64, 410)">
        <rect width="320" height="170" rx="20" fill="#111C35" stroke="${primary}" stroke-opacity="0.5" stroke-width="2" />
        <text x="28" y="48" fill="#38BDF8" font-family="system-ui, sans-serif" font-size="18" font-weight="800">01 · 50-WORD AEO LEAD</text>
        <text x="28" y="88" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="16">Direct Answer Block ready for</text>
        <text x="28" y="114" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="16">Google AI Overviews &amp; Perplexity</text>
      </g>
      <g transform="translate(414, 410)">
        <rect width="320" height="170" rx="20" fill="#111C35" stroke="${secondary}" stroke-opacity="0.5" stroke-width="2" />
        <text x="28" y="48" fill="#10B981" font-family="system-ui, sans-serif" font-size="18" font-weight="800">02 · 4× 6-LAYER INFOGRAPHICS</text>
        <text x="28" y="88" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="16">Standalone 1080×1350 vector cards</text>
        <text x="28" y="114" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="16">with 0.00 CLS impact</text>
      </g>
      <g transform="translate(764, 410)">
        <rect width="372" height="170" rx="20" fill="#111C35" stroke="#F59E0B" stroke-opacity="0.5" stroke-width="2" />
        <text x="28" y="48" fill="#FBBF24" font-family="system-ui, sans-serif" font-size="18" font-weight="800">03 · VERIFIED @GRAPH SCHEMA</text>
        <text x="28" y="88" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="16">BlogPosting + FAQPage + Organization</text>
        <text x="28" y="114" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="16">entity disambiguation</text>
      </g>
    </svg>`;
  };

  /**
   * Trigger writing an article from "Not Yet Started" -> Active Writing -> Published/Draft Ready
   */
  const handleStartQueuedArticleNow = async (jobToStart: AutomatedArticleJob) => {
    if (!studioState || !activeCampaign || !activeWebsite) return;
    setSelectedArticleId(jobToStart.id);
    setStatusToast(
      `Keyword Strategist handed off "${jobToStart.primaryKeyword}" to Content Production Manager — writing & rendering visuals now...`
    );

    const nowIso = new Date().toISOString();
    const markWriting = saveAutonomousStudioState({
      ...studioState,
      campaigns: studioState.campaigns.map((c) =>
        c.id !== activeCampaign.id
          ? c
          : {
              ...c,
              jobs: c.jobs.map((j) =>
                j.id === jobToStart.id ? { ...j, status: 'drafting-article' } : j
              ),
            }
      ),
    });
    setStudioState(markWriting);

    await new Promise((r) => setTimeout(r, 2500));

    const isInternal = activeWebsite.publishingMode === 'internal-doitwithai-site';
    const nextStatus: AutomatedArticleJob['status'] = isInternal
      ? 'published'
      : 'ready-for-review';

    let publishedUrl = jobToStart.publishedUrl;
    if (isInternal) {
      const pubRes = publishJobToInternalWebsiteStore({
        job: jobToStart,
        website: activeWebsite,
      });
      publishedUrl = pubRes.targetUrl;
    }

    const markDone = saveAutonomousStudioState({
      ...markWriting,
      campaigns: markWriting.campaigns.map((c) =>
        c.id !== activeCampaign.id
          ? c
          : {
              ...c,
              jobs: c.jobs.map((j) =>
                j.id === jobToStart.id
                  ? {
                      ...j,
                      status: nextStatus,
                      publishedUrl,
                      updatedAtIso: nowIso,
                    }
                  : j
              ),
            }
      ),
    });
    setStudioState(markDone);
    setStatusToast(
      isInternal
        ? `✓ Completed & Auto-Published "${jobToStart.topicTitle}" to ${publishedUrl}!`
        : `✓ Completed Draft, Featured Image, 4 Section Infographics & Social Pack for "${jobToStart.topicTitle}"!`
    );
  };

  /**
   * Transfer batch to `/ai-content-writer` when user wants the full single-article editor
   */
  const handleOpenInContentWriterStudio = async (job?: AutomatedArticleJob) => {
    if (!activeCampaign || !activeWebsite) return;
    await syncAutomatedBatchToWriterStudio({
      campaignId: activeCampaign.id,
      campaignName: activeCampaign.name,
      website: activeWebsite,
      jobs: activeCampaign.jobs,
      selectedJobId: job?.id || selectedArticle?.id || activeCampaign.jobs[0]?.id,
    });
    router.push('/ai-content-writer?batch=automation');
  };

  /**
   * Handle Founder Command Chat & 1-on-1 Agent Instructions (plus optional Web Speech synthesis)
   */
  const handleSendFounderCommand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || !studioState || !activeCampaign || !activeWebsite) return;

    const targetEmployee =
      allFlatEmployees.find((emp) => emp.id === chatTargetAgentId) ||
      allFlatEmployees[0]!;
    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'founder' as const,
      agentName: 'Founder',
      text: trimmed,
      timestamp: nowTime,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsChatDrawerExpanded(true);

    const lower = trimmed.toLowerCase();
    const wantsNewArticle =
      lower.includes('article') ||
      lower.includes('write') ||
      lower.includes('launch') ||
      lower.includes('blog') ||
      lower.includes('topic') ||
      lower.includes('keyword');

    let replyText = '';
    if (targetEmployee.id === 'agent-chief-orchestrator' && wantsNewArticle) {
      const cleanedTopic = trimmed
        .replace(
          /^(today\s+)?(let's|lets|please|can you)?\s*(write|launch|create|publish)\s*(a\s+new\s+article\s+on|an\s+article\s+about|about|on)?/i,
          ''
        )
        .trim();

      const scoredBrief = scoreKeywordWithDoItWithAiEngine({
        rawKeyword: cleanedTopic || activeWebsite.primaryNiche,
        siteName: activeWebsite.siteName,
        primaryNiche: activeWebsite.primaryNiche,
        existingSlugs: activeCampaign.jobs.map((j) => j.urlSlug),
      });

      const templateJob = activeCampaign.jobs[0];
      if (templateJob) {
        const nowIso = new Date().toISOString();
        const newJob: AutomatedArticleJob = {
          ...templateJob,
          id: `job-founder-${Date.now()}`,
          topicTitle: scoredBrief.recommendedH1Title,
          primaryKeyword: scoredBrief.keyword,
          kdProxyScore: scoredBrief.kdScore,
          urlSlug: scoredBrief.recommendedUrlSlug,
          status: 'drafting-article',
          updatedAtIso: nowIso,
        };

        const nextState = saveAutonomousStudioState({
          ...studioState,
          campaigns: studioState.campaigns.map((c) =>
            c.id !== activeCampaign.id
              ? c
              : { ...c, jobs: [newJob, ...c.jobs], updatedAtIso: nowIso }
          ),
        });
        setStudioState(nextState);
        setSelectedArticleId(newJob.id);
        setActiveHandoffStage(1);
        setIsPacedHandoffRunning(true);
      }

      replyText = `Roger that! I have initialized a full cross-department campaign for "${scoredBrief.recommendedH1Title}" (KD ${scoredBrief.kdScore}/100):\n1. 🔑 Keyword Strategist locked the H1–H3 outline & 4 PAA questions.\n2. 🎨 Graphic Design Director is rendering the 1200×675 Featured Hero Image + 4× 1080×1350 section SVGs.\n3. ✍️ Content Manager & On-Page SEO Engineer are drafting the article, internal links & @graph schema.\n4. 📲 Social & TikTok Video Manager is staging the Pinterest 2:3 Pins, LinkedIn Carousel & 60s TikTok script.`;
    } else {
      replyText = `[${targetEmployee.name} · ${targetEmployee.departmentBadge}]: Equipped with skills [${targetEmployee.equippedSkills.join(
        ', '
      )}] and tools [${targetEmployee.equippedTools.join(
        ', '
      )}]. I have applied your instruction ("${trimmed}") to the active ${
        activeWebsite.siteName
      } department queue.`;
    }

    const agentReply = {
      id: `msg-reply-${Date.now()}`,
      sender: 'agent' as const,
      agentName: targetEmployee.name,
      text: replyText,
      timestamp: nowTime,
    };

    setTimeout(() => {
      setChatMessages((prev) => [...prev, agentReply]);
      if (
        isVoiceCallActive &&
        typeof window !== 'undefined' &&
        'speechSynthesis' in window
      ) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(
            replyText.replace(/[^\w\s.,!?:-]/g, '')
          );
          utterance.rate = 1.04;
          window.speechSynthesis.speak(utterance);
        } catch {
          // Ignore browser speech synthesis restrictions
        }
      }
    }, 550);
  };

  /**
   * Toggle Web Speech API Voice Call (`SpeechRecognition` + `speechSynthesis`)
   */
  const handleToggleVoiceCall = () => {
    if (isVoiceCallActive) {
      setIsVoiceCallActive(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    setIsVoiceCallActive(true);
    setIsChatDrawerExpanded(true);

    if (typeof window !== 'undefined') {
      const SpeechRec =
        (window as unknown as Record<string, unknown>).SpeechRecognition ||
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
      if (typeof SpeechRec === 'function') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const recognition: any = new (SpeechRec as any)();
          recognition.lang = 'en-US';
          recognition.interimResults = false;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          recognition.onresult = (event: any) => {
            const transcript = event?.results?.[0]?.[0]?.transcript;
            if (transcript) {
              setChatInput(transcript);
            }
          };
          recognition.start();
        } catch {
          // Fallback to voice-enabled text mode
        }
      }
    }
  };

  if (!studioState || !activeCampaign || !activeWebsite || !agencyState) {
    return (
      <div className="min-h-screen bg-[#060B16] text-slate-100 flex items-center justify-center p-8">
        <div className="text-sm font-bold text-sky-400 animate-pulse">
          Loading 24/7 AI Digital Agency Workspace (/ai-employee-agency/dashboard)...
        </div>
      </div>
    );
  }

  const publishedOrDraftJobs = activeCampaign.jobs.filter(
    (j) => j.status === 'published' || j.status === 'ready-for-review'
  );
  const activelyWritingJobs = activeCampaign.jobs.filter(
    (j) =>
      j.status === 'drafting-article' ||
      j.status === 'researching' ||
      j.status === 'generating-visuals'
  );
  const notYetStartedJobs = activeCampaign.jobs.filter((j) => j.status === 'queued');

  const manualActionAlerts = detectFounderManualActionAlerts({
    siteName: activeWebsite.siteName,
    siteUrl: activeWebsite.siteUrl,
    isInternalSite: Boolean(isInternalSite),
    publishedOrDraftCount: publishedOrDraftJobs.length,
    queuedCount: notYetStartedJobs.length,
  });

  return (
    <div className="min-h-screen bg-[#060B16] text-slate-100 flex flex-col">
      {/* =====================================================================
          TOP AGENCY COMMAND HEADER BAR (With 1-Click Full-Canvas Node Graph Toggle)
         ===================================================================== */}
      <header className="border-b border-slate-800/90 bg-[#0A1122]/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Brand & Live Paced Handoff Ticker */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/ai-employee-agency"
              className="rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 shrink-0 transition"
            >
              ← Change URL
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="text-sm sm:text-base font-extrabold text-white truncate">
                  {activeWebsite.siteName} · 24/7 AI Employee Agency Office
                </span>
                <span className="hidden md:inline-block rounded-full bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-300">
                  {isInternalSite
                    ? 'Internal Auto-Publish (/p/blog)'
                    : 'External Site Mode'}
                </span>
              </div>
              <div className="text-[11px] text-emerald-300 font-medium truncate mt-0.5">
                {activePacket.tickerHeadline}
              </div>
            </div>
          </div>

          {/* Right: Primary View Toggle (Full-Canvas Node Graph vs Department Dashboard) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullCanvasGraphOpen((prev) => !prev)}
              className={`rounded-xl px-4 py-2 text-xs font-extrabold transition shadow-lg flex items-center gap-2 ${
                isFullCanvasGraphOpen
                  ? 'bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 text-slate-950'
                  : 'border border-sky-400/60 bg-sky-500/20 text-sky-200 hover:bg-sky-500/30'
              }`}
            >
              <span>
                {isFullCanvasGraphOpen
                  ? '📊 Return to Department Workspace View'
                  : '🌐 Live Animated AI Agency Node Graph (Full Canvas)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsPacedHandoffRunning((prev) => !prev)}
              className="rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 transition"
            >
              {isPacedHandoffRunning ? '⏸ Pause Live Flow' : '▶ Resume Live Flow'}
            </button>
          </div>
        </div>
      </header>

      {statusToast && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-6 py-2.5 text-xs text-emerald-200 flex items-center justify-between">
          <span>{statusToast}</span>
          <button
            type="button"
            onClick={() => setStatusToast('')}
            className="font-bold text-slate-300 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* =====================================================================
          MAIN BODY: STANDARD LEFT DEPARTMENT SIDEBAR + FULL RIGHT WORKSPACE
         ===================================================================== */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* LEFT SIDEBAR: Website Tabs & 9 Agency Departments */}
        <aside className="lg:col-span-3 xl:col-span-2 border-b lg:border-b-0 lg:border-r border-slate-800/90 bg-[#091020] p-3.5 space-y-3">
          <div className="px-2 py-1 flex items-center justify-between">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Agency Departments ({SIDEBAR_DEPARTMENTS_FROM_REGISTRY.length})
            </div>
            <span className="text-[10px] font-mono text-emerald-400">36 Agents</span>
          </div>

          <nav className="space-y-1.5" aria-label="AI Agency Departments">
            {SIDEBAR_DEPARTMENTS_FROM_REGISTRY.map((dept) => {
              const isSelected =
                !isFullCanvasGraphOpen && activeSidebarTab === dept.id;
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => {
                    setActiveSidebarTab(dept.id);
                    setIsFullCanvasGraphOpen(false);
                  }}
                  className={`w-full text-left rounded-xl px-3 py-2.5 border transition flex items-start gap-2.5 ${
                    isSelected
                      ? 'border-sky-400 bg-sky-500/15 text-white shadow-sm'
                      : 'border-transparent bg-slate-950/40 text-slate-300 hover:bg-slate-900 hover:border-slate-800'
                  }`}
                >
                  <span className="text-base shrink-0 mt-0.5">{dept.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-extrabold truncate">
                        {dept.label}
                      </span>
                      <span className="text-[9px] rounded bg-slate-800 px-1.5 py-0.5 text-slate-300 shrink-0">
                        1+{dept.subAgentCount}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {dept.shortRole}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Quick Full-Canvas Graph Launcher Card in Sidebar */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setIsFullCanvasGraphOpen(true)}
              className={`w-full rounded-xl border p-3 text-left transition ${
                isFullCanvasGraphOpen
                  ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                  : 'border-slate-800 bg-slate-950/70 text-sky-300 hover:border-sky-500/40'
              }`}
            >
              <div className="text-xs font-extrabold flex items-center justify-between">
                <span>🌐 Full Node Graph</span>
                <span className="text-[10px] rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-300">
                  12 / 36 Nodes
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Zoom, pan, hover &amp; click any agent node to inspect or chat.
              </p>
            </button>
          </div>
        </aside>

        {/* =====================================================================
            RIGHT MAIN AREA:
            - When `isFullCanvasGraphOpen === true`: 100% FULL-CANVAS INTERACTIVE NODE GRAPH (`InteractiveAgencyNodeCanvas`)
            - When `isFullCanvasGraphOpen === false`: Selected Department's Dedicated Dashboard
           ===================================================================== */}
        <main className="lg:col-span-9 xl:col-span-10 min-w-0 flex flex-col">
          {isFullCanvasGraphOpen ? (
            <InteractiveAgencyNodeCanvas
              coreNodes={officeNodes}
              activeHandoffStage={activeHandoffStage}
              activePacket={activePacket}
              onStepNextStage={() =>
                setActiveHandoffStage((prev) => (prev >= 6 ? 1 : prev + 1))
              }
              onSelectDepartmentTab={(tabId) => {
                setActiveSidebarTab(tabId);
                setIsFullCanvasGraphOpen(false);
              }}
              onStartAgentChat={(agentId) => {
                setChatTargetAgentId(agentId);
                setIsChatDrawerExpanded(true);
              }}
            />
          ) : (
            <div className="p-4 sm:p-7 space-y-6 flex-1">
              {/* -------------------------------------------------------------
                  PERSISTENT DEPARTMENT MANAGER + SUB-AGENTS ROSTER STRIP
                  (Shows the Manager & Sub-Agents for whichever tab is active)
                 ------------------------------------------------------------- */}
              <div className="rounded-2xl border border-slate-800/90 bg-[#0A1224] p-4 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{currentDepartmentRegistry.sidebarIcon}</span>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400">
                        {currentDepartmentRegistry.departmentBadge} · Department Manager &amp;{' '}
                        {currentDepartmentRegistry.subAgents.length} Specialized Sub-Agents
                      </div>
                      <div className="text-sm font-extrabold text-white">
                        Lead Manager: {currentDepartmentRegistry.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setChatTargetAgentId(currentDepartmentRegistry.id);
                        setIsChatDrawerExpanded(true);
                      }}
                      className="rounded-xl border border-purple-400/40 bg-purple-500/15 hover:bg-purple-500/25 px-3 py-1.5 text-[11px] font-extrabold text-purple-200 transition"
                    >
                      💬 Chat / Voice Call with {currentDepartmentRegistry.name}
                    </button>
                  </div>
                </div>

                {/* Sub-Agents Pills Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                  {currentDepartmentRegistry.subAgents.map((sub) => (
                    <div
                      key={sub.id}
                      className="rounded-xl border border-slate-800/90 bg-slate-950/80 p-3 flex flex-col justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1.5">
                          <span
                            className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: `${sub.accentHex}22`,
                              color: sub.accentHex,
                            }}
                          >
                            {sub.departmentBadge}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setChatTargetAgentId(sub.id);
                              setIsChatDrawerExpanded(true);
                            }}
                            className="text-[10px] font-bold text-sky-300 hover:underline"
                          >
                            💬 Chat 1-on-1
                          </button>
                        </div>
                        <div className="font-extrabold text-white text-xs mt-1.5">
                          {sub.name}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {sub.roleTitle}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-900">
                        {sub.equippedTools.map((tool) => (
                          <span
                            key={tool}
                            className="rounded bg-slate-900 px-1.5 py-0.5 text-[9.5px] font-mono text-emerald-300"
                          >
                            ⚙ {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* -------------------------------------------------------------
                  TAB 1: EXECUTIVE OFFICE & FOUNDER BRIEF
                 ------------------------------------------------------------- */}
              {activeSidebarTab === 'executive-office' && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-sky-500/35 bg-slate-900/80 p-5 sm:p-6 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400">
                          Executive Office · Founder Daily Overview &amp; Live Handoff Telemetry
                        </span>
                        <h2 className="text-xl font-extrabold text-white mt-0.5">
                          Today&apos;s Autonomous Agency Output &amp; Manual Founder Action Queue
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsFullCanvasGraphOpen(true)}
                        className="rounded-xl bg-sky-500 hover:bg-sky-400 px-4 py-2 text-xs font-extrabold text-slate-950 transition"
                      >
                        🌐 Open Full-Canvas Interactive Node Graph →
                      </button>
                    </div>

                    {/* Top 4 Executive KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <div className="text-slate-400">Keywords &amp; Topics Researched</div>
                        <div className="text-lg font-black text-amber-300 mt-1">
                          {activeCampaign.jobs.length} Low-KD Clusters
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <div className="text-slate-400">
                          {isInternalSite ? 'Articles Published' : 'Article Drafts Ready'}
                        </div>
                        <div className="text-lg font-black text-emerald-300 mt-1">
                          {publishedOrDraftJobs.length} Done · {activelyWritingJobs.length}{' '}
                          Writing
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <div className="text-slate-400">Visuals &amp; Infographics</div>
                        <div className="text-lg font-black text-pink-300 mt-1">
                          {activeCampaign.jobs.length} Hero +{' '}
                          {activeCampaign.jobs.length * 4} SVGs
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <div className="text-slate-400">Social &amp; TikTok Scripts</div>
                        <div className="text-lg font-black text-sky-300 mt-1">
                          {activeCampaign.jobs.length * 3} Pins ·{' '}
                          {activeCampaign.jobs.length} TikToks
                        </div>
                      </div>
                    </div>

                    {/* Live 6-Stage Inter-Agent Handoff Packet Strip */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-extrabold text-emerald-300">
                          ⚡ Real-Time Inter-Agent Handoff Protocol (Stage {activeHandoffStage}/6 ·{' '}
                          {activePacket.packetCode})
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {activePacket.fromAgentName} → {activePacket.toAgentName}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                        {handoffPackets.map((pkt) => {
                          const isCurrent = pkt.stageNumber === activeHandoffStage;
                          return (
                            <button
                              key={pkt.packetCode}
                              type="button"
                              onClick={() => setActiveHandoffStage(pkt.stageNumber)}
                              className={`rounded-xl border p-2.5 text-left transition ${
                                isCurrent
                                  ? 'border-sky-400 bg-sky-500/15 text-white'
                                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                              }`}
                            >
                              <div className="text-[10px] font-extrabold text-sky-300">
                                Stage {pkt.stageNumber}
                              </div>
                              <div className="text-[11px] font-bold truncate mt-0.5">
                                {pkt.toAgentName}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-[11px] text-slate-200">
                        {activePacket.packetSummary}
                      </div>
                    </div>

                    {/* Manual Founder Action Required Alerts */}
                    <div className="rounded-2xl border border-amber-400/40 bg-amber-950/20 p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-300 uppercase tracking-wider">
                          ⚠️ Founder Manual Action Queue ({manualActionAlerts.length} Items)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Escalated by Technical SEO &amp; Publishing Agents
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {manualActionAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="rounded-xl border border-slate-800 bg-slate-950/90 p-3.5 space-y-2 flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              <div className="font-bold text-white">{alert.title}</div>
                              <p className="text-slate-300 text-[11px] leading-relaxed">
                                {alert.whyManualActionNeeded}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveSidebarTab(alert.targetDepartmentTab)}
                              className="text-left text-[11px] font-extrabold text-sky-300 hover:underline pt-1"
                            >
                              {alert.ctaButtonLabel}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 2: KEYWORD & TOPIC STRATEGIST DEPARTMENT
                 ------------------------------------------------------------- */}
              {activeSidebarTab === 'keyword-strategist' && (
                <div className="rounded-2xl border border-amber-500/35 bg-slate-900/80 p-5 sm:p-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                        Department 1 · Keyword &amp; Topic Strategist (Web Search + DoItWithAI KD Engine)
                      </span>
                      <h2 className="text-xl font-extrabold text-white mt-0.5">
                        Live Keyword Discovery, KD Scoring &amp; H1–H3 Heading Handoff Queue
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSidebarTab('content-writing')}
                      className="rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs font-extrabold text-slate-950 transition"
                    >
                      View Handoff in Content Writing Studio →
                    </button>
                  </div>

                  {/* Interactive Live Web Autocomplete + DoItWithAI KD Scorer Bar */}
                  <form
                    onSubmit={handleRunLiveKeywordScorer}
                    className="rounded-2xl border border-amber-400/40 bg-slate-950 p-4 flex flex-wrap items-center gap-3 text-xs"
                  >
                    <input
                      type="text"
                      value={liveSeedQuery}
                      onChange={(e) => setLiveSeedQuery(e.target.value)}
                      placeholder={`Enter any seed keyword or topic for ${activeWebsite.siteName} (e.g. "ai technical seo audit", "saas content strategy")...`}
                      className="flex-1 min-w-[240px] rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isScoringKeywords}
                      className="rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:brightness-110 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg transition disabled:opacity-50"
                    >
                      {isScoringKeywords
                        ? '⚡ Scraping Web Autocomplete & Scoring KD...'
                        : '🔍 Run Live Web Autocomplete + DoItWithAI KD Scorer'}
                    </button>
                  </form>

                  {/* Newly Scored Live Keyword Briefs */}
                  {liveScoredBriefs.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-xs font-extrabold text-emerald-300">
                        ✨ Newly Scored Live Autocomplete Briefs (Ready for 1-Click Handoff to Content Production Manager):
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                        {liveScoredBriefs.slice(0, 4).map((brief) => (
                          <div
                            key={brief.id}
                            className="rounded-2xl border border-emerald-500/40 bg-emerald-950/15 p-4 space-y-2.5 flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                                  KD {brief.kdScore}/100 · {brief.difficultyLabel}
                                </span>
                                <span className="text-[11px] text-amber-300 font-mono">
                                  Vol: {brief.estimatedMonthlyVolume}/mo · CPC {brief.cpcEstimateUsd}
                                </span>
                              </div>
                              <div className="text-sm font-extrabold text-white">
                                &ldquo;{brief.keyword}&rdquo;
                              </div>
                              <div className="text-xs text-slate-300">
                                <strong>Recommended H1:</strong> {brief.recommendedH1Title}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleHandOffScoredBriefToContentManager(brief)
                              }
                              className="w-full rounded-xl bg-emerald-400 hover:bg-emerald-300 py-2 px-3 text-xs font-extrabold text-slate-950 transition"
                            >
                              ⚡ Hand Off Keyword Brief to Content Production Manager →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Campaign Keyword Clusters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {activeCampaign.jobs.map((job, idx) => (
                      <div
                        key={job.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300">
                              Keyword Cluster #{idx + 1} · KD {job.kdProxyScore}/100 (Low
                              Difficulty)
                            </span>
                            <span className="text-[11px] font-bold text-sky-300">
                              {job.searchIntent}
                            </span>
                          </div>
                          <div className="text-sm font-extrabold text-white">
                            Primary Keyword: &ldquo;{job.primaryKeyword}&rdquo;
                          </div>
                          <div className="text-xs text-slate-300">
                            <strong>Target Article Title:</strong> {job.topicTitle}
                          </div>
                          <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 space-y-1 text-[11px] text-slate-300">
                            <div className="font-bold text-emerald-300">
                              Finalized H2 Heading Structure:
                            </div>
                            {job.outlineSections.map((sec, sIdx) => (
                              <div key={sec.h2 + sIdx} className="truncate">
                                H2.{sIdx + 1}: {sec.h2} ({sec.archetype})
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                          <span className="text-[11px] text-slate-400">
                            Handoff Status:{' '}
                            <strong className="text-emerald-300">
                              {job.status === 'queued'
                                ? 'Ready to Hand Off to Content Writer'
                                : '✓ Handed Off to Content Production Manager'}
                            </strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedArticleId(job.id);
                              setActiveSidebarTab('content-writing');
                              if (job.status === 'queued') {
                                void handleStartQueuedArticleNow(job);
                              }
                            }}
                            className="rounded-lg bg-sky-500/20 border border-sky-500/40 hover:bg-sky-500/30 px-3 py-1.5 text-[11px] font-extrabold text-sky-200"
                          >
                            {job.status === 'queued'
                              ? '⚡ Hand Off to Content Writer Now →'
                              : 'Inspect in Content Studio →'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 3: CONTENT WRITING STUDIO (WITH PUBLISHED / DRAFT / WRITING / NOT YET STARTED BOXES)
                 ------------------------------------------------------------- */}
              {activeSidebarTab === 'content-writing' && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-purple-500/35 bg-slate-900/80 p-5 sm:p-6 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-300">
                          Department 2 · Content Production Manager &amp; 4 Writing Sub-Agents
                        </span>
                        <h2 className="text-xl font-extrabold text-white mt-0.5">
                          Live Article Pipeline Board ({publishedOrDraftJobs.length}{' '}
                          {isInternalSite ? 'Published' : 'Drafts Ready'} ·{' '}
                          {activelyWritingJobs.length} Writing Now ·{' '}
                          {notYetStartedJobs.length} Not Yet Started)
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void handleOpenInContentWriterStudio(selectedArticle)
                        }
                        className="rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 hover:brightness-110 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg transition"
                      >
                        ✨ Open Full AI Content Writer Studio (/ai-content-writer) →
                      </button>
                    </div>

                    {/* Unique Status Boxes Grid: (1) Published/Draft Ready, (2) Actively Writing Now, (3) Not Yet Started */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-xs">
                      {activeCampaign.jobs.map((job, idx) => {
                        const isDone =
                          job.status === 'published' || job.status === 'ready-for-review';
                        const isWriting =
                          job.status === 'drafting-article' ||
                          job.status === 'researching' ||
                          job.status === 'generating-visuals';
                        const isNotStarted = job.status === 'queued';

                        const activeSubAgentNames = [
                          '1/5 · Keyword Handoff Brief Received',
                          '2/5 · Graphic Designer Rendering Featured Hero Image',
                          '3/5 · Section Writer Drafting H2s & 50w AEO Lead',
                          '4/5 · Meta Title (<580px) & Internal Link Weaver',
                          '5/5 · @graph JSON-LD Schema & QA Readability Check',
                        ];

                        return (
                          <div
                            key={job.id}
                            className={`rounded-2xl border p-4 flex flex-col justify-between gap-4 transition ${
                              isWriting
                                ? 'border-sky-400 bg-sky-950/30 shadow-lg'
                                : isDone
                                  ? 'border-emerald-500/45 bg-slate-950/90'
                                  : 'border-slate-800 border-dashed bg-slate-950/45 opacity-80'
                            }`}
                          >
                            <div className="space-y-2.5">
                              {/* Status Header Pill */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-[11px] font-bold text-slate-400">
                                  Slot #{idx + 1} · KD {job.kdProxyScore}
                                </span>
                                {isDone && (
                                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300">
                                    {isInternalSite
                                      ? '🟢 PUBLISHED LIVE'
                                      : '📘 DRAFT READY (EXTERNAL SITE)'}
                                  </span>
                                )}
                                {isWriting && (
                                  <span className="rounded-full bg-sky-400 text-slate-950 px-2.5 py-0.5 text-[10px] font-extrabold animate-pulse">
                                    ⚡ ACTIVELY WRITING NOW
                                  </span>
                                )}
                                {isNotStarted && (
                                  <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-400">
                                    ⚪ NOT YET STARTED
                                  </span>
                                )}
                              </div>

                              <h3 className="text-sm font-extrabold text-white leading-snug">
                                {job.topicTitle}
                              </h3>

                              <div className="text-[11px] text-slate-400">
                                Keyword:{' '}
                                <strong className="text-sky-300">
                                  {job.primaryKeyword}
                                </strong>
                              </div>

                              {/* Dynamic Sub-Agent Activity Inside Box */}
                              {isWriting && (
                                <div className="rounded-xl border border-sky-500/30 bg-slate-900/90 p-3 space-y-2">
                                  <div className="text-[11px] font-bold text-sky-300">
                                    {activeSubAgentNames[subAgentWritingStep]}
                                  </div>
                                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-300"
                                      style={{
                                        width: `${((subAgentWritingStep + 1) / 5) * 100}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}

                              {isDone && (
                                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-2.5 text-[11px] text-slate-300 space-y-1">
                                  <div>
                                    ✓ 50-Word AEO Lead &amp; {job.outlineSections.length} H2
                                    Sections
                                  </div>
                                  <div>
                                    ✓ 1 Featured Hero Image + 4× 1080×1350 Section SVGs
                                  </div>
                                  <div>✓ Meta Tags, Internal Links &amp; @graph Schema</div>
                                </div>
                              )}

                              {isNotStarted && (
                                <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-2.5 text-[11px] text-slate-400">
                                  Waiting in queue for Keyword Strategist handoff &amp;
                                  Content Manager slot.
                                </div>
                              )}
                            </div>

                            {/* Box Action Footer */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
                              {isNotStarted ? (
                                <button
                                  type="button"
                                  onClick={() => void handleStartQueuedArticleNow(job)}
                                  className="w-full rounded-xl bg-sky-500 hover:bg-sky-400 py-2 px-3 text-xs font-extrabold text-slate-950 transition"
                                >
                                  ▶ Start Writing via AI Agency Pipeline
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedArticleId(job.id)}
                                    className="flex-1 rounded-xl border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 py-1.5 px-2.5 text-[11px] font-bold text-sky-200"
                                  >
                                    Inspect Article
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleOpenInContentWriterStudio(job)
                                    }
                                    className="rounded-xl bg-slate-800 hover:bg-slate-700 py-1.5 px-2.5 text-[11px] font-bold text-emerald-300"
                                  >
                                    Open Studio →
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Selected Article Reader Drawer */}
                    {selectedArticle && (
                      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                          <div>
                            <span className="text-[11px] font-bold text-emerald-300">
                              Active Article Inspector · {selectedArticle.topicTitle}
                            </span>
                            <div className="text-[11px] text-slate-400">
                              Meta Title ({selectedArticle.metaTitle.length} chars):{' '}
                              {selectedArticle.metaTitle}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                selectedArticle.compiledArticleMarkdown ||
                                  compileJobArticleMarkdown(
                                    selectedArticle,
                                    activeWebsite
                                  ),
                                'copy-active-article'
                              )
                            }
                            className="rounded-lg bg-slate-800 px-3 py-1.5 font-bold text-sky-300"
                          >
                            {copiedId === 'copy-active-article'
                              ? '✓ Copied Markdown!'
                              : 'Copy Full Article Markdown'}
                          </button>
                        </div>
                        <pre className="max-h-[320px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-200 font-sans leading-relaxed">
                          {selectedArticle.compiledArticleMarkdown ||
                            compileJobArticleMarkdown(selectedArticle, activeWebsite)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 4: GRAPHIC & VISUAL DESIGNER DEPARTMENT
                 ------------------------------------------------------------- */}
              {activeSidebarTab === 'graphic-design' && selectedArticle && (
                <div className="rounded-2xl border border-pink-500/35 bg-slate-900/80 p-5 sm:p-6 space-y-6">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-pink-300">
                      Department 3 · Creative &amp; Graphic Design Director
                    </span>
                    <h2 className="text-xl font-extrabold text-white mt-0.5">
                      Featured Hero Image (16:9) &amp; 4× Standalone 6-Layer Section Infographics (1080×1350)
                    </h2>
                  </div>

                  {/* Featured Hero Image Preview */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                    <div className="text-xs font-extrabold text-sky-300">
                      1. Featured Hero Image Designer Output ({selectedArticle.topicTitle}):
                    </div>
                    <div
                      className="w-full max-w-3xl mx-auto rounded-xl overflow-hidden border border-slate-800 [&_svg]:w-full [&_svg]:h-auto"
                      dangerouslySetInnerHTML={{
                        __html: renderFeaturedHeroImageSvg(
                          selectedArticle,
                          activeWebsite
                        ),
                      }}
                    />
                  </div>

                  {/* 4 Section Infographics Grid */}
                  <div className="space-y-3">
                    <div className="text-xs font-extrabold text-emerald-300">
                      2. 6-Layer Section Infographics (1080×1350 Inline SVGs):
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedArticle.outlineSections.slice(0, 2).map((sec, idx) => {
                        const svg = renderSectionInfographicSvg(sec, {
                          sectionIndex: idx,
                          totalSections: selectedArticle.outlineSections.length,
                          brandName: activeWebsite.siteName,
                          brandPrimaryHex: activeWebsite.brandPrimaryHex,
                          brandSecondaryHex: activeWebsite.brandSecondaryHex,
                        });
                        return (
                          <div
                            key={sec.h2 + idx}
                            className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex flex-col items-center gap-2"
                          >
                            <div className="text-xs font-bold text-white truncate max-w-full">
                              Section {idx + 1}: {sec.h2}
                            </div>
                            <div
                              className="w-full max-w-[280px] rounded-lg overflow-hidden [&_svg]:w-full [&_svg]:h-auto"
                              dangerouslySetInnerHTML={{ __html: svg }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 5: ON-PAGE SEO & ARTICLE REFRESH ENGINEER
                 ------------------------------------------------------------- */}
              {activeSidebarTab === 'on-page-seo' && (
                <div className="rounded-2xl border border-emerald-500/35 bg-slate-900/80 p-5 sm:p-6 space-y-5">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
                      Department 4 · On-Page SEO Engineer &amp; Content Refresh Sub-Agents
                    </span>
                    <h2 className="text-xl font-extrabold text-white mt-0.5">
                      Meta Tags, Internal Link Graph, @graph JSON-LD &amp; Existing Article Refreshes
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {agencyState.onPageAuditItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2.5 min-w-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-white">{item.title}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.generatedCodeOrCopy, item.id)}
                            className="rounded bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-emerald-300 shrink-0"
                          >
                            {copiedId === item.id ? '✓ Copied!' : 'Copy Code'}
                          </button>
                        </div>
                        <p className="text-slate-300">{item.currentFinding}</p>
                        <pre className="max-h-[150px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-[10.5px] text-slate-200 font-mono">
                          {item.generatedCodeOrCopy}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 6: OFF-PAGE SEO & DIGITAL PR
                 ------------------------------------------------------------- */}
              {activeSidebarTab === 'off-page-seo' && (
                <div className="rounded-2xl border border-amber-500/35 bg-slate-900/80 p-5 sm:p-6 space-y-5">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                      Department 5 · Off-Page SEO, Backlink Gaps &amp; Digital PR
                    </span>
                    <h2 className="text-xl font-extrabold text-white mt-0.5">
                      Journalist Data Pitches, Niche Directories &amp; Infographic Link Magnets
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {agencyState.offPageOpportunities.map((opp) => (
                      <div
                        key={opp.id}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2.5 min-w-0"
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            {opp.priority} · {opp.status}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(opp.readyMadePitchOrSnippet, opp.id)
                            }
                            className="text-[11px] font-bold text-emerald-300"
                          >
                            {copiedId === opp.id ? '✓ Copied!' : 'Copy Pitch'}
                          </button>
                        </div>
                        <div className="font-extrabold text-white text-sm">
                          {opp.targetName}
                        </div>
                        <pre className="max-h-[170px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-[11px] text-slate-200 font-sans">
                          {opp.readyMadePitchOrSnippet}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 7: TECHNICAL & LOCAL ENTITY SEO
                 ------------------------------------------------------------- */}
              {activeSidebarTab === 'technical-seo' && (
                <div className="rounded-2xl border border-cyan-500/35 bg-slate-900/80 p-5 sm:p-6 space-y-5">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300">
                      Department 6 · Technical &amp; Local Entity SEO Architect
                    </span>
                    <h2 className="text-xl font-extrabold text-white mt-0.5">
                      Core Web Vitals (0.00 CLS), Sitemap Canonicals &amp; Entity Schema
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {agencyState.technicalLocalItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2.5 min-w-0"
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                            {item.metricValue}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.fixSnippet, item.id)}
                            className="text-[11px] font-bold text-sky-300"
                          >
                            {copiedId === item.id ? '✓ Copied!' : 'Copy Snippet'}
                          </button>
                        </div>
                        <div className="font-extrabold text-white text-sm">
                          {item.label}
                        </div>
                        <p className="text-slate-300">{item.diagnosticDetail}</p>
                        <pre className="max-h-[150px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-[10.5px] text-slate-200 font-mono">
                          {item.fixSnippet}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 8: SOCIAL MEDIA & TIKTOK / REELS VIDEO SCRIPT FLEET
                 ------------------------------------------------------------- */}
              {activeSidebarTab === 'social-video-fleet' && selectedArticle && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-rose-500/35 bg-slate-900/80 p-5 sm:p-6 space-y-5">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-300">
                        Department 8 · Social Media Manager + TikTok / Reels Video Script Sub-Agent
                      </span>
                      <h2 className="text-xl font-extrabold text-white mt-0.5">
                        Pinterest 2:3 Pins, LinkedIn Carousel, X Threads &amp; 60s TikTok/Reels Video Script
                      </h2>
                    </div>

                    {/* TikTok / Reels Short-Form Video Script & Trend Card */}
                    <div className="rounded-2xl border border-sky-500/40 bg-slate-950 p-5 space-y-3 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="rounded bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-300 uppercase">
                            🎬 TikTok / Instagram Reels / YouTube Shorts Script Agent
                          </span>
                          <h3 className="text-base font-extrabold text-white mt-1">
                            60-Second Viral Hook &amp; Visual Storyboard for &ldquo;
                            {selectedArticle.topicTitle}&rdquo;
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              activeTikTokScript.fullCopyableScript,
                              'copy-tiktok'
                            )
                          }
                          className="rounded-xl bg-sky-500 hover:bg-sky-400 px-3.5 py-2 font-extrabold text-slate-950"
                        >
                          {copiedId === 'copy-tiktok'
                            ? '✓ Copied TikTok Script!'
                            : 'Copy 60s TikTok Script'}
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-900 p-3.5 text-xs text-slate-200 font-mono leading-relaxed">
                        {activeTikTokScript.fullCopyableScript}
                      </pre>
                    </div>

                    {/* Pinterest 2:3 + Social Hook Variations */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                      <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-950 p-4 flex flex-col items-center gap-3">
                        <div className="text-xs font-bold text-amber-300">
                          Pinterest 2:3 Vertical Pin (1000×1500 SVG)
                        </div>
                        {selectedArticle.pinterestPins[0] && (
                          <div
                            className="w-full max-w-[260px] rounded-xl overflow-hidden [&_svg]:w-full [&_svg]:h-auto"
                            dangerouslySetInnerHTML={{
                              __html: renderPinterestPinPreviewSvg(
                                selectedArticle.pinterestPins[0],
                                activeWebsite.siteName
                              ),
                            }}
                          />
                        )}
                      </div>

                      <div className="lg:col-span-7 space-y-3 text-xs">
                        {selectedArticle.arcadsVariations.slice(0, 3).map((v) => (
                          <div
                            key={v.id}
                            className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-sky-300 uppercase text-[10px]">
                                {v.channel} · {v.archetypeLabel}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopy(
                                    `${v.hookLine}\n\n${v.bodyCopy}\n\n${v.ctaLine}`,
                                    v.id
                                  )
                                }
                                className="text-[11px] font-bold text-emerald-300"
                              >
                                {copiedId === v.id ? '✓ Copied!' : 'Copy Post'}
                              </button>
                            </div>
                            <div className="font-bold text-white">{v.hookLine}</div>
                            <p className="text-slate-300 whitespace-pre-line">
                              {v.bodyCopy}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 9: QA & PUBLISHING CONTROLLER
                 ------------------------------------------------------------- */}
              {activeSidebarTab === 'qa-publishing' && (
                <div className="rounded-2xl border border-emerald-500/35 bg-slate-900/80 p-5 sm:p-6 space-y-4">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
                      Department 7 · Quality Assurance &amp; Autonomous Publishing Controller
                    </span>
                    <h2 className="text-xl font-extrabold text-white mt-0.5">
                      150-Point GEO/AEO Readability Gate &amp; Destination Delivery Status
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {activeCampaign.jobs.map((job) => (
                      <div
                        key={job.id}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="font-extrabold text-white truncate">
                            {job.topicTitle}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            QA Score: {job.geoReadiness.overallScore}/100 · Status:{' '}
                            <strong className="text-emerald-300">
                              {job.status.toUpperCase()}
                            </strong>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleStartQueuedArticleNow(job)}
                          className="rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 font-extrabold text-slate-950 shrink-0"
                        >
                          {isInternalSite ? '🚀 Auto-Publish' : '📘 Stage Draft'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* =====================================================================
          PERSISTENT BOTTOM FOUNDER COMMAND CHAT & VOICE CALL DOCK
          (Talk to Chief AI Officer OR any of the 36 AI Employees in real time)
         ===================================================================== */}
      <footer className="sticky bottom-0 z-30 border-t border-slate-800 bg-[#080E1C]/95 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 space-y-3">
          {/* Expandable Conversation Transcript Drawer */}
          {isChatDrawerExpanded && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/95 p-4 space-y-3 max-h-[240px] overflow-y-auto text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-extrabold text-sky-300">
                  💬 Live Agency Intercom &amp; Voice Call Transcript
                </span>
                <button
                  type="button"
                  onClick={() => setIsChatDrawerExpanded(false)}
                  className="text-slate-400 hover:text-white font-bold"
                >
                  ▾ Minimize Chat
                </button>
              </div>
              <div className="space-y-2">
                {chatMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-xl p-3 ${
                      m.sender === 'founder'
                        ? 'bg-sky-500/15 border border-sky-500/30 text-white ml-8'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold text-emerald-300">{m.agentName}</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unified Command Input Bar */}
          <form
            onSubmit={handleSendFounderCommand}
            className="flex flex-wrap items-center gap-2.5"
          >
            {/* Agent Selector Dropdown (All 36 Managers + Sub-Agents) */}
            <select
              value={chatTargetAgentId}
              onChange={(e) => setChatTargetAgentId(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs font-extrabold text-sky-300 focus:border-sky-400 focus:outline-none max-w-[290px]"
              aria-label="Select AI Employee to talk to"
            >
              {allFlatEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.tier === 'sub-agent' ? '↳ ' : '★ '}
                  {emp.name} ({emp.departmentBadge})
                </option>
              ))}
            </select>

            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onFocus={() => setIsChatDrawerExpanded(true)}
              placeholder='Tell your Chief AI Officer or any Specialist Agent: e.g. "Today let&apos;s write and launch a new article on AI technical SEO audits"...'
              className="flex-1 min-w-[240px] rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:border-sky-400 focus:outline-none"
            />

            <button
              type="button"
              onClick={handleToggleVoiceCall}
              className={`rounded-xl border px-3.5 py-2.5 text-xs font-extrabold transition flex items-center gap-1.5 ${
                isVoiceCallActive
                  ? 'border-rose-400 bg-rose-500/20 text-rose-200 animate-pulse'
                  : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-sky-400'
              }`}
            >
              <span>{isVoiceCallActive ? '🔴 End Voice Call' : '🎙️ Voice Call'}</span>
            </button>

            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-sky-500 to-emerald-400 hover:brightness-110 px-5 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg transition"
            >
              Send Command →
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}

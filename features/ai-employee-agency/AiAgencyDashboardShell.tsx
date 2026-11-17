'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
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

export type AgencySidebarTabId =
  | 'executive-office'
  | 'keyword-strategist'
  | 'content-writing'
  | 'graphic-design'
  | 'on-page-seo'
  | 'off-page-seo'
  | 'technical-seo'
  | 'social-video-fleet'
  | 'qa-publishing';

export interface InteractiveOfficeNode {
  id: string;
  name: string;
  roleTitle: string;
  tier: 'executive' | 'manager' | 'sub-agent';
  departmentTab: AgencySidebarTabId;
  departmentBadge: string;
  accentHex: string;
  x: number;
  y: number;
  parentNodeId?: string;
  handoffStageOrder: number;
  liveActionText: string;
  equippedSkills: string[];
  equippedTools: string[];
  sampleOutput: string;
}

const SIDEBAR_DEPARTMENTS: Array<{
  id: AgencySidebarTabId;
  icon: string;
  label: string;
  shortRole: string;
  accentHex: string;
}> = [
  {
    id: 'executive-office',
    icon: '🏢',
    label: 'Executive Office & Brief',
    shortRole: 'Daily graph & Founder manual alerts',
    accentHex: '#38BDF8',
  },
  {
    id: 'keyword-strategist',
    icon: '🔑',
    label: 'Keyword & Topic Strategist',
    shortRole: 'Web search + KD engine → Content brief',
    accentHex: '#F59E0B',
  },
  {
    id: 'content-writing',
    icon: '✍️',
    label: 'Content Writing Studio',
    shortRole: 'Published / Drafts / Writing / Not Started',
    accentHex: '#8B5CF6',
  },
  {
    id: 'graphic-design',
    icon: '🎨',
    label: 'Graphic & Visual Designer',
    shortRole: 'Featured hero + 4× 6-layer SVGs + Pins',
    accentHex: '#EC4899',
  },
  {
    id: 'on-page-seo',
    icon: '🛠️',
    label: 'On-Page SEO & Refresh',
    shortRole: 'Meta, H1-H3, internal links & 2026 refresh',
    accentHex: '#10B981',
  },
  {
    id: 'off-page-seo',
    icon: '📣',
    label: 'Off-Page SEO & Digital PR',
    shortRole: 'Backlink gaps, directories & PR pitches',
    accentHex: '#F97316',
  },
  {
    id: 'technical-seo',
    icon: '⚙️',
    label: 'Technical & Local SEO',
    shortRole: 'CWV, robots.txt AI bots & manual fixes',
    accentHex: '#06B6D4',
  },
  {
    id: 'social-video-fleet',
    icon: '📲',
    label: 'Social & TikTok Video Fleet',
    shortRole: 'Pinterest, LinkedIn, X, IG & TikTok scripts',
    accentHex: '#F43F5E',
  },
  {
    id: 'qa-publishing',
    icon: '✅',
    label: 'QA & Publishing Queue',
    shortRole: '150-pt readability gate & auto-publish',
    accentHex: '#22C55E',
  },
];

const HANDOFF_SEQUENCE_LABELS = [
  'Stage 1/6 · Chief AI Officer dispatching niche brief to Keyword & Topic Strategist...',
  'Stage 2/6 · Keyword Strategist running Web Autocomplete + DoItWithAI KD Scorer → Handing off winning keyword to Content Manager...',
  'Stage 3/6 · Content Production Manager delegating Featured Hero Image & 4× 6-Layer Infographics to Graphic Design Director...',
  'Stage 4/6 · Section Writer, Meta Specialist & Internal Link Weaver drafting article + @graph JSON-LD schema...',
  'Stage 5/6 · QA & Readability Gatekeeper verifying 150-point E-E-A-T rubric → Passing to Publisher Agent...',
  'Stage 6/6 · Social Media Manager fanning out to Pinterest 2:3, LinkedIn 8-Slide, X Thread & TikTok 60s Video Script Agents!',
];

export default function AiAgencyDashboardShell() {
  const router = useRouter();
  const [studioState, setStudioState] = useState<AutonomousStudioStoreState | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] =
    useState<AgencySidebarTabId>('executive-office');
  const [isFullCanvasGraphOpen, setIsFullCanvasGraphOpen] = useState<boolean>(false);

  // Deliberate Paced Handoff Simulation State (Slow, visible real-time movement)
  const [isPacedHandoffRunning, setIsPacedHandoffRunning] = useState<boolean>(true);
  const [activeHandoffStage, setActiveHandoffStage] = useState<number>(1);
  const [subAgentWritingStep, setSubAgentWritingStep] = useState<number>(0);

  // Full-Canvas Interactive Pan & Zoom Node Graph State
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [clickedNodeId, setClickedNodeId] = useState<string | null>(null);

  // Content Writing & Department Selection State
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<string>('');

  // Unified Founder Command Bar & 1-on-1 Agent Chat / Voice Call State
  const [chatTargetAgentId, setChatTargetAgentId] = useState<string>('exec-chief-officer');
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
        agentName: 'Chief AI Officer (Personal Executive Assistant)',
        text: 'Welcome to your 24/7 AI Digital Agency Office! Tell me what you want to launch today (e.g. "Launch a new article on AI technical SEO checklists and prepare Pinterest + TikTok scripts"), or select any specialist agent below to chat or voice-call 1-on-1.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

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

  const officeNodes: InteractiveOfficeNode[] = useMemo(() => {
    const siteName = activeWebsite?.siteName || 'Your Website';
    const jobs = activeCampaign?.jobs || [];
    const activeJob = jobs[1] || jobs[0];
    const primaryKw = activeJob?.primaryKeyword || 'ai seo audit checklist';

    return [
      {
        id: 'exec-chief-officer',
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
        equippedTools: ['voice-speech-bridge', 'manual-blocker-detector'],
        sampleOutput: `Active Directive for ${siteName}:\n1. Keyword Strategist: Lock low-KD cluster for "${primaryKw}"\n2. Content + Design: Draft H2 sections + Featured Hero + 4× 1080×1350 SVGs\n3. QA + Social: Verify 150-pt gate & generate Pinterest/LinkedIn/TikTok scripts.`,
      },
      {
        id: 'mgr-keyword-strategist',
        name: 'Keyword & Topic Strategist',
        roleTitle: 'Web Search + DoItWithAI Keyword KD Engine',
        tier: 'manager',
        departmentTab: 'keyword-strategist',
        departmentBadge: 'Dept 1 · Keywords',
        accentHex: '#F59E0B',
        x: 165,
        y: 195,
        parentNodeId: 'exec-chief-officer',
        handoffStageOrder: 2,
        liveActionText: `Selected "${primaryKw}" (KD ${activeJob?.kdProxyScore || 16}/100) → Handing off to Content Lead`,
        equippedSkills: ['serp-intent-clustering', 'anti-cannibalization-guard'],
        equippedTools: ['google-autocomplete-live-scraper', 'doitwithai-kd-scorer'],
        sampleOutput: `Winning Keyword Handoff Packet:\n• Primary Keyword: "${primaryKw}" (KD ${activeJob?.kdProxyScore || 16} · Low Difficulty)\n• Target Article: "${activeJob?.topicTitle || 'Complete Guide'}"\n• H2 Blueprint: 4 Standalone Visual-Ready Sections`,
      },
      {
        id: 'mgr-content-production',
        name: 'Content Production Manager',
        roleTitle: 'Distributes Brief to Writer, Meta, Link & Design Sub-Agents',
        tier: 'manager',
        departmentTab: 'content-writing',
        departmentBadge: 'Dept 2 · Content Lead',
        accentHex: '#8B5CF6',
        x: 445,
        y: 195,
        parentNodeId: 'mgr-keyword-strategist',
        handoffStageOrder: 3,
        liveActionText: `Coordinating sub-agents for "${(activeJob?.topicTitle || primaryKw).slice(0, 32)}..."`,
        equippedSkills: ['editorial-task-decomposition', 'brand-voice-enforcement'],
        equippedTools: ['writer-studio-bridge', 'sub-agent-dispatcher'],
        sampleOutput: `Content Manager Delegation Log:\n→ Dispatched Featured Image + 4 Section SVGs to Graphic Design Director\n→ Dispatched 50-word AEO Lead + H2 Drafting to Section Writer\n→ Dispatched Internal Link Weaving & @graph Schema`,
      },
      {
        id: 'mgr-onpage-seo',
        name: 'On-Page SEO & Refresh Lead',
        roleTitle: 'Live HTML Auditor, Internal Links & 2026 Decay Refresh',
        tier: 'manager',
        departmentTab: 'on-page-seo',
        departmentBadge: 'Dept 4 · On-Page SEO',
        accentHex: '#10B981',
        x: 725,
        y: 195,
        parentNodeId: 'exec-chief-officer',
        handoffStageOrder: 4,
        liveActionText: `Verified <580px SERP titles, internal links & 3 refresh candidates`,
        equippedSkills: ['serp-pixel-validator', 'content-decay-refresher'],
        equippedTools: ['live-html-dom-crawler', 'jsonld-graph-compiler'],
        sampleOutput:
          agencyState?.onPageAuditItems[0]?.generatedCodeOrCopy ||
          'Connected @graph JSON-LD verified.',
      },
      {
        id: 'mgr-technical-offpage',
        name: 'Technical & Off-Page SEO Lead',
        roleTitle: 'CWV, robots.txt AI Bots, Backlink Gaps & PR Pitches',
        tier: 'manager',
        departmentTab: 'technical-seo',
        departmentBadge: 'Dept 5 & 6 · Tech/PR',
        accentHex: '#06B6D4',
        x: 985,
        y: 195,
        parentNodeId: 'exec-chief-officer',
        handoffStageOrder: 4,
        liveActionText: `0.00 CLS SVG check passed · 3 Digital PR pitches staged`,
        equippedSkills: ['ai-crawler-robots-guard', 'digital-pr-pitch-writer'],
        equippedTools: ['cwv-cls-verifier', 'backlink-gap-scanner'],
        sampleOutput:
          agencyState?.onPageAuditItems[3]?.generatedCodeOrCopy ||
          'User-agent: OAI-SearchBot Allow: /',
      },
      {
        id: 'sub-keyword-cluster',
        name: 'Autocomplete & KD Scorer Sub-Agent',
        roleTitle: 'Scores Long-Tail Questions & Heading Hierarchy',
        tier: 'sub-agent',
        departmentTab: 'keyword-strategist',
        departmentBadge: 'Keyword Sub-Agent',
        accentHex: '#FBBF24',
        x: 145,
        y: 345,
        parentNodeId: 'mgr-keyword-strategist',
        handoffStageOrder: 2,
        liveActionText: `Clustered ${jobs.length} non-overlapping low-KD topics`,
        equippedSkills: ['long-tail-question-mining', 'jaccard-deduplication'],
        equippedTools: ['keyword-clustering-tool'],
        sampleOutput: jobs
          .slice(0, 4)
          .map((j, i) => `${i + 1}. ${j.topicTitle} (KD ${j.kdProxyScore})`)
          .join('\n'),
      },
      {
        id: 'mgr-graphic-designer',
        name: 'Graphic & Visual Design Director',
        roleTitle: 'Featured Hero Image + 4× 1080×1350 Section Infographics',
        tier: 'manager',
        departmentTab: 'graphic-design',
        departmentBadge: 'Dept 3 · Visual Studio',
        accentHex: '#EC4899',
        x: 375,
        y: 345,
        parentNodeId: 'mgr-content-production',
        handoffStageOrder: 3,
        liveActionText: `Rendering Featured Hero SVG + 4× 6-Layer Section Infographics`,
        equippedSkills: ['6-layer-prism-infographic-synthesis', 'brand-color-harmony'],
        equippedTools: ['featured-hero-svg-engine', 'blog-section-infographic-generator'],
        sampleOutput: `Visual Asset Pack Compiled:\n• 1× Featured Hero Banner (1200×675 Brand SVG)\n• 4× Standalone H2 Section Infographics (1080×1350)\n• 3× Tall Pinterest 2:3 Pins (1000×1500)`,
      },
      {
        id: 'sub-section-link-writer',
        name: 'Section Writer, Meta & Link Weaver',
        roleTitle: 'Drafts 50w AEO Lead, H2/H3 Prose, Meta Tags & Links',
        tier: 'sub-agent',
        departmentTab: 'content-writing',
        departmentBadge: 'Content Sub-Agents',
        accentHex: '#A855F7',
        x: 605,
        y: 345,
        parentNodeId: 'mgr-content-production',
        handoffStageOrder: 4,
        liveActionText: `Drafting H2 sections + weaving internal tool & sibling links`,
        equippedSkills: ['50-word-aeo-lead-crafting', 'contextual-anchor-weaving'],
        equippedTools: ['meta-title-pixel-optimizer', 'schema-markup-generator'],
        sampleOutput:
          activeJob?.aeoDirectAnswer50Words ||
          '50-word direct AEO answer lead + 4 H2 sections with comparison matrix.',
      },
      {
        id: 'mgr-qa-publisher',
        name: 'QA Critic & Autonomous Publisher',
        roleTitle: '150-Point Readability Gate + Internal/External Publisher',
        tier: 'manager',
        departmentTab: 'qa-publishing',
        departmentBadge: 'Dept 7 · QA & Publish',
        accentHex: '#22C55E',
        x: 845,
        y: 345,
        parentNodeId: 'sub-section-link-writer',
        handoffStageOrder: 5,
        liveActionText:
          activeWebsite?.publishingMode === 'internal-doitwithai-site'
            ? 'QA 96/100 Pass → Auto-publishing to /p/[slug]/blog'
            : 'QA 96/100 Pass → Staging External Draft & Triggering Social Manager',
        equippedSkills: ['150pt-readability-eeat-audit', 'zero-cliche-verification'],
        equippedTools: ['internal-site-publisher', 'external-cms-draft-packager'],
        sampleOutput: `Quality Assurance Gate: 96 / 100 (PASSED)\n• 50-Word AEO Lead: Verified\n• Comparison Table & FAQ Schema: Verified\n• Action: Handing off finalized URL to Social & Video Manager`,
      },
      {
        id: 'mgr-social-video-lead',
        name: 'Social Media & Video Manager',
        roleTitle: 'Orchestrates Pinterest, LinkedIn, FB/IG, X & TikTok Agents',
        tier: 'manager',
        departmentTab: 'social-video-fleet',
        departmentBadge: 'Dept 8 · Social Lead',
        accentHex: '#F43F5E',
        x: 375,
        y: 495,
        parentNodeId: 'mgr-qa-publisher',
        handoffStageOrder: 6,
        liveActionText: `Distributing finalized article into 5 platform-native campaigns`,
        equippedSkills: ['omnichannel-hook-adaptation', 'drip-schedule-orchestration'],
        equippedTools: ['arcads-5hook-matrix', 'social-analytics-rebalancer'],
        sampleOutput: `Social Manager Fan-Out Complete:\n→ Pinterest Agent: 3× 1000×1500 (2:3) Pins\n→ LinkedIn Agent: 8-Slide 1080×1350 PDF Carousel\n→ TikTok/Reels Agent: 60s Viral Hook + Visual Storyboard`,
      },
      {
        id: 'sub-pinterest-linkedin',
        name: 'Pinterest 2:3 & LinkedIn Deck Squad',
        roleTitle: '3 Tall Pins + 8-Slide PDF Carousel + SEO Descriptions',
        tier: 'sub-agent',
        departmentTab: 'social-video-fleet',
        departmentBadge: 'Visual Social Squad',
        accentHex: '#FB7185',
        x: 660,
        y: 495,
        parentNodeId: 'mgr-social-video-lead',
        handoffStageOrder: 6,
        liveActionText: `Compiled 3× 2:3 Pinterest Pins & 8-Slide LinkedIn Carousel`,
        equippedSkills: ['pinterest-fresh-pin-seo', 'b2b-carousel-storytelling'],
        equippedTools: ['pin-svg-renderer', 'linkedin-html-pdf-exporter'],
        sampleOutput:
          activeJob?.pinterestPins[0]?.pinDescription ||
          'Pinterest 2:3 Pin & LinkedIn 8-slide deck ready.',
      },
      {
        id: 'sub-tiktok-video-script',
        name: 'TikTok, Reels & Shorts Script Agent',
        roleTitle: 'Finds Niche Video Trends & Writes 60s Hook + Storyboard',
        tier: 'sub-agent',
        departmentTab: 'social-video-fleet',
        departmentBadge: 'TikTok / Video Agent',
        accentHex: '#38BDF8',
        x: 935,
        y: 495,
        parentNodeId: 'mgr-social-video-lead',
        handoffStageOrder: 6,
        liveActionText: `Drafted 60s TikTok/Reels script + 3-second visual pattern-interrupt`,
        equippedSkills: ['tiktok-viral-hook-mining', '60s-scene-storyboard-scripting'],
        equippedTools: ['short-form-retention-scorer', 'b-roll-overlay-planner'],
        sampleOutput: `[0:00–0:03 HOOK]: "Stop writing blog posts that AI search engines ignore—fix these 3 tags instead."\n[0:03–0:18 SCENE 1]: Show side-by-side comparison table on screen.\n[0:18–0:45 SCENE 2]: Walk through the 50-word AEO answer block + 6-layer infographic.\n[0:45–0:60 CTA]: "Comment 'AUDIT' or grab the free checklist at ${siteName}!"`,
      },
    ];
  }, [activeWebsite, activeCampaign, agencyState]);

  const hoveredNode = useMemo(
    () => officeNodes.find((n) => n.id === hoveredNodeId) || null,
    [officeNodes, hoveredNodeId]
  );

  const clickedNode = useMemo(
    () => officeNodes.find((n) => n.id === clickedNodeId) || null,
    [officeNodes, clickedNodeId]
  );

  const selectedArticle: AutomatedArticleJob | undefined = useMemo(() => {
    if (!activeCampaign) return undefined;
    return (
      activeCampaign.jobs.find((j) => j.id === selectedArticleId) ??
      activeCampaign.jobs[0]
    );
  }, [activeCampaign, selectedArticleId]);

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

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
      <rect x="64" y="64" width="380" height="44" rx="22" fill="${primary}" fill-opacity="0.22" stroke="${primary}" stroke-width="1.5" />
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

  const handleSendFounderCommand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || !studioState || !activeCampaign || !activeWebsite) return;

    const targetNode =
      officeNodes.find((n) => n.id === chatTargetAgentId) || officeNodes[0]!;
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
    if (targetNode.id === 'exec-chief-officer' && wantsNewArticle) {
      const cleanedTopic = trimmed
        .replace(
          /^(today\s+)?(let's|lets|please|can you)?\s*(write|launch|create|publish)\s*(a\s+new\s+article\s+on|an\s+article\s+about|about|on)?/i,
          ''
        )
        .trim();
      const topicTitle =
        cleanedTopic.length > 8
          ? `${cleanedTopic.charAt(0).toUpperCase() + cleanedTopic.slice(1)}: 2026 Complete Playbook`
          : `2026 ${activeWebsite.primaryNiche} Benchmark & Implementation Playbook`;

      const templateJob = activeCampaign.jobs[0];
      if (templateJob) {
        const nowIso = new Date().toISOString();
        const slug = topicTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 60);
        const newJob: AutomatedArticleJob = {
          ...templateJob,
          id: `job-founder-${Date.now()}`,
          topicTitle,
          primaryKeyword: cleanedTopic.toLowerCase().slice(0, 45) || templateJob.primaryKeyword,
          urlSlug: slug,
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

      replyText = `Roger that! I have initialized a full cross-department campaign for "${topicTitle}":\n1. 🔑 Keyword Strategist is validating low-KD long-tail headings.\n2. 🎨 Graphic Design Director is generating the Featured Hero Image + 4× 1080×1350 section SVGs.\n3. ✍️ Content Manager & On-Page SEO Engineer are drafting the article, internal links & @graph schema.\n4. 📲 Social & TikTok Video Manager is staging the Pinterest 2:3 Pins, LinkedIn Carousel & 60s TikTok script.`;
    } else {
      replyText = `[${targetNode.name}]: Currently ${targetNode.liveActionText.toLowerCase()}. Equipped with [${targetNode.equippedSkills.join(
        ', '
      )}]. I have logged your instruction ("${trimmed}") into the active ${
        activeWebsite.siteName
      } workflow queue and updated my output preview.`;
    }

    const agentReply = {
      id: `msg-reply-${Date.now()}`,
      sender: 'agent' as const,
      agentName: targetNode.name,
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

  const isInternalSite = activeWebsite.publishingMode === 'internal-doitwithai-site';
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

  return (
    <div className="min-h-screen bg-[#060B16] text-slate-100 flex flex-col">
      <header className="border-b border-slate-800/90 bg-[#0A1122]/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
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
                {HANDOFF_SEQUENCE_LABELS[activeHandoffStage - 1]}
              </div>
            </div>
          </div>

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

      <div className="flex-1 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
        <aside className="lg:col-span-3 xl:col-span-2 border-b lg:border-b-0 lg:border-r border-slate-800/90 bg-[#091020] p-3.5 space-y-3">
          <div className="px-2 py-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Agency Departments ({SIDEBAR_DEPARTMENTS.length})
            </div>
          </div>

          <nav className="space-y-1.5" aria-label="AI Agency Departments">
            {SIDEBAR_DEPARTMENTS.map((dept) => {
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
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold truncate">{dept.label}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {dept.shortRole}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

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
                  12 Nodes
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Zoom, pan, hover &amp; click any agent node to inspect or chat.
              </p>
            </button>
          </div>
        </aside>

        <main className="lg:col-span-9 xl:col-span-10 min-w-0 flex flex-col">
          {isFullCanvasGraphOpen ? (
            <div className="relative flex-1 min-h-[680px] w-full bg-[#050914] overflow-hidden select-none">
              <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur px-3.5 py-2 shadow-xl text-xs">
                <span className="font-extrabold text-sky-300 mr-1">
                  🌐 Digital Agency Office Canvas
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.min(1.6, Number((z + 0.15).toFixed(2))))}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 font-bold text-white"
                  title="Zoom In"
                >
                  ＋ Zoom In
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.max(0.65, Number((z - 0.15).toFixed(2))))}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 font-bold text-white"
                  title="Zoom Out"
                >
                  － Zoom Out
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoomScale(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 font-bold text-slate-300"
                >
                  ⊡ Fit View ({Math.round(zoomScale * 100)}%)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveHandoffStage((prev) => (prev >= 6 ? 1 : prev + 1))
                  }
                  className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 px-2.5 py-1 font-extrabold text-emerald-300"
                >
                  ⏭ Step Next Handoff ({activeHandoffStage}/6)
                </button>
              </div>

              <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur px-3.5 py-2 text-[11px]">
                <span className="text-slate-400">Drag canvas to pan · Hover or click any node</span>
              </div>

              <div
                onMouseDown={(e) => {
                  setIsDraggingCanvas(true);
                  dragStartRef.current = {
                    x: e.clientX - panOffset.x,
                    y: e.clientY - panOffset.y,
                  };
                }}
                onMouseMove={(e) => {
                  if (!isDraggingCanvas) return;
                  setPanOffset({
                    x: e.clientX - dragStartRef.current.x,
                    y: e.clientY - dragStartRef.current.y,
                  });
                }}
                onMouseUp={() => setIsDraggingCanvas(false)}
                onMouseLeave={() => setIsDraggingCanvas(false)}
                className={`w-full h-full min-h-[680px] flex items-center justify-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] ${
                  isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              >
                <svg
                  viewBox="0 0 1140 590"
                  className="w-full h-full max-w-[1360px] transition-transform duration-150"
                  style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                    transformOrigin: 'center center',
                  }}
                >
                  <defs>
                    <linearGradient id="activeEdgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.95" />
                      <stop offset="50%" stopColor="#10B981" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.95" />
                    </linearGradient>
                  </defs>

                  {officeNodes.map((node) => {
                    if (!node.parentNodeId) return null;
                    const parent = officeNodes.find((n) => n.id === node.parentNodeId);
                    if (!parent) return null;

                    const x1 = parent.x;
                    const y1 = parent.y + 38;
                    const x2 = node.x;
                    const y2 = node.y - 38;
                    const midY = (y1 + y2) / 2;
                    const pathD = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
                    const isStageActive =
                      node.handoffStageOrder === activeHandoffStage ||
                      clickedNodeId === node.id ||
                      hoveredNodeId === node.id;

                    return (
                      <g key={`edge-${parent.id}-${node.id}`}>
                        <path
                          d={pathD}
                          fill="none"
                          stroke={isStageActive ? 'url(#activeEdgeGrad)' : '#1E293B'}
                          strokeWidth={isStageActive ? 3.2 : 2}
                        />
                        <path
                          d={pathD}
                          fill="none"
                          stroke={node.accentHex}
                          strokeWidth={2.2}
                          strokeDasharray="7 10"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="34"
                            to="0"
                            dur={isStageActive ? '0.9s' : '2.4s'}
                            repeatCount="indefinite"
                          />
                        </path>
                        <circle
                          r={isStageActive ? 5 : 3.2}
                          fill={isStageActive ? '#38BDF8' : node.accentHex}
                        >
                          <animateMotion
                            dur={isStageActive ? '1.5s' : '3.2s'}
                            repeatCount="indefinite"
                            path={pathD}
                          />
                        </circle>
                      </g>
                    );
                  })}

                  {officeNodes.map((node) => {
                    const isHovered = hoveredNodeId === node.id;
                    const isClicked = clickedNodeId === node.id;
                    const isWorkingNow = node.handoffStageOrder === activeHandoffStage;
                    const boxW = 236;
                    const boxH = 78;
                    const rx = node.x - boxW / 2;
                    const ry = node.y - boxH / 2;

                    return (
                      <g
                        key={node.id}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setClickedNodeId(node.id);
                        }}
                        className="cursor-pointer"
                      >
                        {(isWorkingNow || isHovered || isClicked) && (
                          <rect
                            x={rx - 6}
                            y={ry - 6}
                            width={boxW + 12}
                            height={boxH + 12}
                            rx={18}
                            fill="none"
                            stroke={node.accentHex}
                            strokeWidth={isClicked ? 2.8 : 1.8}
                            strokeOpacity={0.85}
                          >
                            {isWorkingNow && (
                              <animate
                                attributeName="stroke-opacity"
                                values="0.95;0.25;0.95"
                                dur="1.5s"
                                repeatCount="indefinite"
                              />
                            )}
                          </rect>
                        )}

                        <rect
                          x={rx}
                          y={ry}
                          width={boxW}
                          height={boxH}
                          rx={14}
                          fill={isClicked || isHovered ? '#13203B' : '#0B1325'}
                          stroke={
                            isClicked || isHovered || isWorkingNow
                              ? node.accentHex
                              : '#334155'
                          }
                          strokeWidth={isClicked || isWorkingNow ? 2.4 : 1.4}
                        />

                        <circle
                          cx={rx + 16}
                          cy={ry + 19}
                          r={5}
                          fill={isWorkingNow ? '#38BDF8' : '#10B981'}
                        />

                        <text
                          x={rx + 28}
                          y={ry + 22}
                          fill={node.accentHex}
                          fontSize="9.5"
                          fontWeight="800"
                          fontFamily="system-ui, sans-serif"
                        >
                          {node.departmentBadge.toUpperCase()} ·{' '}
                          {isWorkingNow ? '⚡ WORKING' : '✓ ACTIVE'}
                        </text>

                        <text
                          x={rx + 14}
                          y={ry + 43}
                          fill="#FFFFFF"
                          fontSize="11.5"
                          fontWeight="800"
                          fontFamily="system-ui, sans-serif"
                        >
                          {node.name.slice(0, 31)}
                        </text>

                        <text
                          x={rx + 14}
                          y={ry + 61}
                          fill="#94A3B8"
                          fontSize="9.5"
                          fontFamily="system-ui, sans-serif"
                        >
                          {node.liveActionText.slice(0, 35)}...
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {hoveredNode && !clickedNode && (
                <div className="pointer-events-none absolute bottom-6 left-6 z-20 max-w-md rounded-2xl border border-sky-400/50 bg-slate-950/95 p-4 shadow-2xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="font-extrabold uppercase text-[10px] px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${hoveredNode.accentHex}22`,
                        color: hoveredNode.accentHex,
                      }}
                    >
                      {hoveredNode.departmentBadge}
                    </span>
                    <span className="text-[11px] text-emerald-300 font-bold">
                      Click node for full card &amp; redirect →
                    </span>
                  </div>
                  <div className="font-extrabold text-white text-sm">{hoveredNode.name}</div>
                  <div className="text-slate-300">{hoveredNode.liveActionText}</div>
                  <div className="text-[11px] text-sky-300">
                    Skills: {hoveredNode.equippedSkills.join(' · ')}
                  </div>
                </div>
              )}

              {clickedNode && (
                <div className="absolute top-16 right-6 z-30 w-full max-w-sm rounded-3xl border border-sky-400/60 bg-[#0B1325]/95 backdrop-blur-xl p-5 shadow-2xl space-y-4 text-xs">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span
                        className="rounded px-2 py-0.5 text-[10px] font-extrabold uppercase"
                        style={{
                          backgroundColor: `${clickedNode.accentHex}22`,
                          color: clickedNode.accentHex,
                        }}
                      >
                        {clickedNode.departmentBadge}
                      </span>
                      <h3 className="text-base font-extrabold text-white mt-1">
                        {clickedNode.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">{clickedNode.roleTitle}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setClickedNodeId(null)}
                      className="rounded-lg bg-slate-800 px-2 py-1 text-slate-300 hover:text-white font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-emerald-300">
                      Live Status &amp; Handoff Activity:
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-200">
                      {clickedNode.liveActionText}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-sky-300">
                      Equipped Skills &amp; Backend Tools:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[...clickedNode.equippedSkills, ...clickedNode.equippedTools].map(
                        (item) => (
                          <span
                            key={item}
                            className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-300"
                          >
                            {item}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-300">
                      Latest Work Output Preview:
                    </div>
                    <pre className="max-h-[130px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-[10.5px] text-slate-200 font-mono">
                      {clickedNode.sampleOutput}
                    </pre>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSidebarTab(clickedNode.departmentTab);
                        setIsFullCanvasGraphOpen(false);
                      }}
                      className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-emerald-400 hover:brightness-110 py-2.5 px-4 text-xs font-extrabold text-slate-950 shadow-lg transition"
                    >
                      Open {clickedNode.departmentBadge} Dashboard →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setChatTargetAgentId(clickedNode.id);
                        setIsChatDrawerExpanded(true);
                      }}
                      className="w-full rounded-xl border border-purple-400/50 bg-purple-500/15 hover:bg-purple-500/25 py-2 px-4 text-xs font-extrabold text-purple-200 transition"
                    >
                      💬 Chat / Voice Call 1-on-1 with {clickedNode.name}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 sm:p-7 space-y-6 flex-1">
              {activeSidebarTab === 'executive-office' && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-sky-500/35 bg-slate-900/80 p-5 sm:p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400">
                          Executive Office · Founder Daily Overview
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
                          {publishedOrDraftJobs.length} Done · {activelyWritingJobs.length} Writing
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <div className="text-slate-400">Visuals &amp; Infographics</div>
                        <div className="text-lg font-black text-pink-300 mt-1">
                          {activeCampaign.jobs.length} Hero + {activeCampaign.jobs.length * 4} SVGs
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <div className="text-slate-400">Social &amp; TikTok Scripts</div>
                        <div className="text-lg font-black text-sky-300 mt-1">
                          {activeCampaign.jobs.length * 3} Pins · {activeCampaign.jobs.length} TikToks
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-amber-400/40 bg-amber-950/20 p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-300 uppercase tracking-wider">
                          ⚠️ Founder Manual Action Required ({isInternalSite ? '1 Optional Item' : '2 External Site Items'})
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Escalated by Technical SEO &amp; Publishing Agents
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3.5 space-y-1.5">
                          <div className="font-bold text-white">
                            1. {isInternalSite ? 'Connect Social OAuth for 1-Tap Auto-Posting' : `Paste @graph JSON-LD & robots.txt on ${activeWebsite.siteName}`}
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {isInternalSite
                              ? 'Your internal DoItWithAI blog posts auto-publish immediately. Connect Pinterest/LinkedIn OAuth (or download the 1-click packs in Social Fleet) to publish social pins.'
                              : `Because ${activeWebsite.siteName} is an external domain, our Technical SEO Agent prepared your AI-friendly robots.txt and @graph JSON-LD patch ready to paste into your CMS header.`}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveSidebarTab(
                                isInternalSite ? 'social-video-fleet' : 'technical-seo'
                              )
                            }
                            className="text-[11px] font-extrabold text-sky-300 hover:underline"
                          >
                            Open {isInternalSite ? 'Social & TikTok Fleet' : 'Technical SEO Patch'} →
                          </button>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3.5 space-y-1.5">
                          <div className="font-bold text-white">
                            2. Review {publishedOrDraftJobs.length} Completed Article{publishedOrDraftJobs.length === 1 ? '' : 's'} &amp; {notYetStartedJobs.length} Queued Slots
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {activelyWritingJobs.length > 0
                              ? `Content Production Manager is actively writing "${activelyWritingJobs[0]?.topicTitle}".`
                              : 'All active drafts are ready for inspection in the Content Writing Studio.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveSidebarTab('content-writing')}
                            className="text-[11px] font-extrabold text-emerald-300 hover:underline"
                          >
                            Open Content Writing Studio Boxes →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSidebarTab === 'keyword-strategist' && (
                <div className="rounded-2xl border border-amber-500/35 bg-slate-900/80 p-5 sm:p-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                        Department 1 · Keyword &amp; Topic Strategist (Web Search + DoItWithAI KD Engine)
                      </span>
                      <h2 className="text-xl font-extrabold text-white mt-0.5">
                        Discovered Low-KD Keywords &amp; H1–H3 Heading Handoff Queue
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {activeCampaign.jobs.map((job, idx) => (
                      <div
                        key={job.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300">
                              Keyword Cluster #{idx + 1} · KD {job.kdProxyScore}/100 (Low Difficulty)
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
                          {activelyWritingJobs.length} Writing Now · {notYetStartedJobs.length}{' '}
                          Not Yet Started)
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleOpenInContentWriterStudio(selectedArticle)}
                        className="rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 hover:brightness-110 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg transition"
                      >
                        ✨ Open Full AI Content Writer Studio (/ai-content-writer) →
                      </button>
                    </div>

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
                                <strong className="text-sky-300">{job.primaryKeyword}</strong>
                              </div>

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
                                  <div>✓ 50-Word AEO Lead &amp; {job.outlineSections.length} H2 Sections</div>
                                  <div>✓ 1 Featured Hero Image + 4× 1080×1350 Section SVGs</div>
                                  <div>✓ Meta Tags, Internal Links &amp; @graph Schema</div>
                                </div>
                              )}

                              {isNotStarted && (
                                <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-2.5 text-[11px] text-slate-400">
                                  Waiting in queue for Keyword Strategist handoff &amp; Content Manager slot.
                                </div>
                              )}
                            </div>

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
                                    onClick={() => void handleOpenInContentWriterStudio(job)}
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
                                  compileJobArticleMarkdown(selectedArticle, activeWebsite),
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

                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                    <div className="text-xs font-extrabold text-sky-300">
                      1. Featured Hero Image Designer Output ({selectedArticle.topicTitle}):
                    </div>
                    <div
                      className="w-full max-w-3xl mx-auto rounded-xl overflow-hidden border border-slate-800 [&_svg]:w-full [&_svg]:h-auto"
                      dangerouslySetInnerHTML={{
                        __html: renderFeaturedHeroImageSvg(selectedArticle, activeWebsite),
                      }}
                    />
                  </div>

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
                            onClick={() => handleCopy(opp.readyMadePitchOrSnippet, opp.id)}
                            className="text-[11px] font-bold text-emerald-300"
                          >
                            {copiedId === opp.id ? '✓ Copied!' : 'Copy Pitch'}
                          </button>
                        </div>
                        <div className="font-extrabold text-white text-sm">{opp.targetName}</div>
                        <pre className="max-h-[170px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-[11px] text-slate-200 font-sans">
                          {opp.readyMadePitchOrSnippet}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                        <div className="font-extrabold text-white text-sm">{item.label}</div>
                        <p className="text-slate-300">{item.diagnosticDetail}</p>
                        <pre className="max-h-[150px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-[10.5px] text-slate-200 font-mono">
                          {item.fixSnippet}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                              officeNodes.find((n) => n.id === 'sub-tiktok-video-script')
                                ?.sampleOutput || '',
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
                        {
                          officeNodes.find((n) => n.id === 'sub-tiktok-video-script')
                            ?.sampleOutput
                        }
                      </pre>
                    </div>

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
                            <p className="text-slate-300 whitespace-pre-line">{v.bodyCopy}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

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

      <footer className="sticky bottom-0 z-30 border-t border-slate-800 bg-[#080E1C]/95 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 space-y-3">
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

          <form
            onSubmit={handleSendFounderCommand}
            className="flex flex-wrap items-center gap-2.5"
          >
            <select
              value={chatTargetAgentId}
              onChange={(e) => setChatTargetAgentId(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs font-extrabold text-sky-300 focus:border-sky-400 focus:outline-none"
              aria-label="Select AI Employee to talk to"
            >
              {officeNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  💬 Talk to: {n.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onFocus={() => setIsChatDrawerExpanded(true)}
              placeholder='Tell your Chief AI Officer or selected Agent: e.g. "Today let&apos;s write and launch a new article on AI technical SEO audits"...'
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

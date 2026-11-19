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
  getAllAgencyEmployeesFlat,
  getDepartmentByTabId,
  type AgencySidebarTabId,
  type InteractiveOfficeNode,
} from '@/lib/ai-employee-agency/agent-registry';
import {
  buildPacedHandoffChain,
  detectFounderManualActionAlerts,
  generateDailyExecutiveTelemetrySeries,
  generateLinkedIn8SlideCarouselDeck,
  generateTikTokReels60sScript,
  scoreKeywordWithDoItWithAiEngine,
  type ScoredKeywordBrief,
} from '@/lib/ai-employee-agency/handoff-orchestrator';
import {
  CHAT_BOX_LEDGER_ROW_ID,
  MODEL_PRICING_CATALOG,
  buildAgencyCircleTelemetrySnapshot,
  createZeroBasedSessionTokenLedger,
  loadTokenTelemetrySnapshot,
  loadZeroBasedSessionTokenLedger,
  recordCircleOrchestrationIntoLedger,
  recordSessionTokenUsage,
  resetZeroBasedSessionTokenLedger,
  saveTokenTelemetrySnapshot,
  saveZeroBasedSessionTokenLedger,
  type AgencyCircleTelemetrySnapshot,
  type AgencyLlmModelId,
  type ApiKeySlotId,
  type ZeroBasedSessionTokenLedger,
} from '@/lib/ai-employee-agency/token-telemetry-store';
import {
  loadAgencyMemoryStore,
  routeSelectiveWorkflowInterrupt,
  saveAgencyMemoryStore,
  type AgencyMemoryStoreState,
  type SelectiveInterruptRoutingPlan,
} from '@/lib/ai-employee-agency/agent-memory-store';
import {
  buildVerifiedBacklinkClubNetwork,
  loadBacklinkClubState,
  saveBacklinkClubState,
  type BacklinkClubNetworkState,
} from '@/lib/ai-employee-agency/backlink-exchange-club';
import {
  evaluate150PointQaAndSpotCheck,
  generateGoogleAdsRsaCampaignPack,
} from '@/lib/ai-employee-agency/google-ads-agent';
import {
  CMS_PLATFORM_SPECS,
  buildCmsCurlPreview,
  loadCmsConnectionConfig,
  saveCmsConnectionConfig,
  type CmsConnectionConfig,
  type CmsPlatformId,
  type CmsPublishExecutionResult,
} from '@/lib/ai-employee-agency/cms-connectors';
import {
  loadHeartbeatScheduleState,
  saveHeartbeatScheduleState,
  type AgencyHeartbeatScheduleState,
} from '@/lib/ai-employee-agency/heartbeat-scheduler';
import InteractiveAgencyNodeCanvas from './InteractiveAgencyNodeCanvas';
import type { WorkspaceKnowledgeSnapshot } from '@/lib/ai-employee-agency/workspace-knowledge-snapshot';
import SiteAuditSuitePanel from './SiteAuditSuitePanel';
import OnPageAndCompetitorGapPanel from './OnPageAndCompetitorGapPanel';
import AiVisibilityAndLauncherPanel from './AiVisibilityAndLauncherPanel';
import FounderCommandChatDock, {
  type FounderChatMessage,
} from './FounderCommandChatDock';
import { AgencyUiIcon, DepartmentSvgIcon } from './AgencySvgIcons';

export type { AgencySidebarTabId, InteractiveOfficeNode };

/**
 * Clean, single-line sidebar navigation items with zero-truncation labels
 */
type AgencyThemeMode = 'dark' | 'light';
type OuterRailDomainId =
  | 'agency'
  | 'audit'
  | 'keywords'
  | 'content'
  | 'social'
  | 'publish'
  | 'settings';
type ExecutiveSubViewId = 'overview' | 'tokens' | 'memory' | 'heartbeat';

interface InnerRailLink {
  id: string;
  label: string;
  modeBadge: '24/7 Auto' | 'On-Demand' | 'Live Meter';
  targetTab: AgencySidebarTabId;
  execSubView?: ExecutiveSubViewId;
  openGraph?: boolean;
}

const V4_OUTER_RAIL_DOMAINS: Array<{
  id: OuterRailDomainId;
  shortLabel: string;
  panelTitle: string;
  iconTab: AgencySidebarTabId;
  items: InnerRailLink[];
}> = [
  {
    id: 'agency',
    shortLabel: 'Agency',
    panelTitle: 'Agency Command',
    iconTab: 'executive-office',
    items: [
      {
        id: 'ag-overview',
        label: 'Executive Overview',
        modeBadge: '24/7 Auto',
        targetTab: 'executive-office',
        execSubView: 'overview',
      },
      {
        id: 'ag-graph',
        label: '36-Agent Live Graph',
        modeBadge: '24/7 Auto',
        targetTab: 'executive-office',
        openGraph: true,
      },
      {
        id: 'ag-tokens',
        label: 'Token & API Ledger',
        modeBadge: 'Live Meter',
        targetTab: 'executive-office',
        execSubView: 'tokens',
      },
      {
        id: 'ag-heartbeat',
        label: '24/7 Heartbeat Cron',
        modeBadge: '24/7 Auto',
        targetTab: 'executive-office',
        execSubView: 'heartbeat',
      },
    ],
  },
  {
    id: 'audit',
    shortLabel: 'Audit',
    panelTitle: 'Site Audit & Health',
    iconTab: 'technical-seo',
    items: [
      {
        id: 'au-tech',
        label: 'Technical & AI Bots',
        modeBadge: '24/7 Auto',
        targetTab: 'technical-seo',
      },
      {
        id: 'au-onpage',
        label: 'On-Page & Decay',
        modeBadge: 'On-Demand',
        targetTab: 'on-page-seo',
      },
    ],
  },
  {
    id: 'keywords',
    shortLabel: 'Keywords',
    panelTitle: 'Keywords & Gaps',
    iconTab: 'keyword-strategist',
    items: [
      {
        id: 'kw-strategist',
        label: 'Autocomplete & KD',
        modeBadge: '24/7 Auto',
        targetTab: 'keyword-strategist',
      },
      {
        id: 'kw-ads',
        label: 'Google Ads RSA Pack',
        modeBadge: 'On-Demand',
        targetTab: 'keyword-strategist',
      },
    ],
  },
  {
    id: 'content',
    shortLabel: 'Content',
    panelTitle: 'Content & Visuals',
    iconTab: 'content-writing',
    items: [
      {
        id: 'ct-pipeline',
        label: 'Article Pipeline',
        modeBadge: '24/7 Auto',
        targetTab: 'content-writing',
      },
      {
        id: 'ct-svg',
        label: 'Hero & 6-Layer SVGs',
        modeBadge: '24/7 Auto',
        targetTab: 'graphic-design',
      },
      {
        id: 'ct-onpage',
        label: 'On-Page & Schema',
        modeBadge: '24/7 Auto',
        targetTab: 'on-page-seo',
      },
    ],
  },
  {
    id: 'social',
    shortLabel: 'Social',
    panelTitle: 'Social & Video Fleet',
    iconTab: 'social-video-fleet',
    items: [
      {
        id: 'sc-fleet',
        label: 'TikTok, LinkedIn & Pins',
        modeBadge: '24/7 Auto',
        targetTab: 'social-video-fleet',
      },
    ],
  },
  {
    id: 'publish',
    shortLabel: 'Publish',
    panelTitle: 'Publish & Backlinks',
    iconTab: 'qa-publishing',
    items: [
      {
        id: 'pb-cms',
        label: '150-Pt QA & CMS Push',
        modeBadge: 'On-Demand',
        targetTab: 'qa-publishing',
      },
      {
        id: 'pb-club',
        label: 'Backlink Club & PR',
        modeBadge: '24/7 Auto',
        targetTab: 'off-page-seo',
      },
    ],
  },
  {
    id: 'settings',
    shortLabel: 'Settings',
    panelTitle: 'Workspace Settings',
    iconTab: 'executive-office',
    items: [
      {
        id: 'st-memory',
        label: '3-Layer Agent Skills',
        modeBadge: 'On-Demand',
        targetTab: 'executive-office',
        execSubView: 'memory',
      },
      {
        id: 'st-tokens',
        label: 'API Keys & Model',
        modeBadge: 'Live Meter',
        targetTab: 'executive-office',
        execSubView: 'tokens',
      },
    ],
  },
];

const AGENCY_THEME_STORAGE_KEY = 'doitwithai_agency_v4_theme_v1';

const CLEAN_SIDEBAR_NAV: Array<{
  id: AgencySidebarTabId;
  title: string;
  subtitle: string;
  accentHex: string;
  teamCountLabel: string;
}> = [
  {
    id: 'executive-office',
    title: 'Executive Office',
    subtitle: '24h graph, token cost & cron',
    accentHex: '#38BDF8',
    teamCountLabel: '4 Agents',
  },
  {
    id: 'keyword-strategist',
    title: 'Keyword Strategist',
    subtitle: 'Autocomplete, KD & Google Ads',
    accentHex: '#F59E0B',
    teamCountLabel: '4 Agents',
  },
  {
    id: 'content-writing',
    title: 'Content Studio',
    subtitle: 'Published, writing & queued',
    accentHex: '#8B5CF6',
    teamCountLabel: '5 Agents',
  },
  {
    id: 'graphic-design',
    title: 'Visual & SVG Studio',
    subtitle: 'Hero banner & 4× 6-layer SVGs',
    accentHex: '#EC4899',
    teamCountLabel: '4 Agents',
  },
  {
    id: 'on-page-seo',
    title: 'On-Page SEO',
    subtitle: 'DOM audit, links & 2026 refresh',
    accentHex: '#10B981',
    teamCountLabel: '4 Agents',
  },
  {
    id: 'off-page-seo',
    title: 'Off-Page & Backlink Club',
    subtitle: 'Link exchange, PR & directories',
    accentHex: '#F97316',
    teamCountLabel: '4 Agents',
  },
  {
    id: 'technical-seo',
    title: 'Technical & Entity SEO',
    subtitle: '0.00 CLS, robots.txt & schema',
    accentHex: '#06B6D4',
    teamCountLabel: '4 Agents',
  },
  {
    id: 'social-video-fleet',
    title: 'Social & TikTok Fleet',
    subtitle: 'Pinterest, LinkedIn & 60s video',
    accentHex: '#F43F5E',
    teamCountLabel: '6 Agents',
  },
  {
    id: 'qa-publishing',
    title: 'QA & CMS Auto-Publish',
    subtitle: '150-pt gate, WP/Shopify/Webhook',
    accentHex: '#22C55E',
    teamCountLabel: '4 Agents',
  },
];

export default function AiAgencyDashboardShell() {
  const router = useRouter();
  const [studioState, setStudioState] = useState<AutonomousStudioStoreState | null>(null);
  const [themeMode, setThemeMode] = useState<AgencyThemeMode>('dark');
  const [activeOuterDomain, setActiveOuterDomain] =
    useState<OuterRailDomainId>('agency');
  const [isInnerRailCollapsed, setIsInnerRailCollapsed] = useState<boolean>(false);
  const [executiveSubView, setExecutiveSubView] =
    useState<ExecutiveSubViewId>('overview');
  const [activeSidebarTab, setActiveSidebarTab] =
    useState<AgencySidebarTabId>('executive-office');
  const [isFullCanvasGraphOpen, setIsFullCanvasGraphOpen] = useState<boolean>(false);
  const [isGraphFullScreenViewport, setIsGraphFullScreenViewport] =
    useState<boolean>(false);

  // Deliberate Paced Handoff Simulation State (Slow, visible real-time movement: 2.8s per stage)
  const [isPacedHandoffRunning, setIsPacedHandoffRunning] = useState<boolean>(true);
  const [activeHandoffStage, setActiveHandoffStage] = useState<number>(1);
  const [subAgentWritingStep, setSubAgentWritingStep] = useState<number>(0);

  // Live Keyword Strategist (Web Search + DoItWithAI KD Scorer) State
  const [liveSeedQuery, setLiveSeedQuery] = useState<string>('');
  const [isScoringKeywords, setIsScoringKeywords] = useState<boolean>(false);
  const [liveScoredBriefs, setLiveScoredBriefs] = useState<ScoredKeywordBrief[]>([]);

  // V3 Phase 7: Real-Time 1-Circle Token & Cost Telemetry HUD State
  const [selectedLlmModel, setSelectedLlmModel] =
    useState<AgencyLlmModelId>('gemini-2.5-flash');
  const [isFreeTierKeyMode, setIsFreeTierKeyMode] = useState<boolean>(true);
  const [testApiKeyInput, setTestApiKeyInput] = useState<string>('');
  const [isRunningTokenAudit, setIsRunningTokenAudit] = useState<boolean>(false);
  const [tokenTelemetrySnapshot, setTokenTelemetrySnapshot] =
    useState<AgencyCircleTelemetrySnapshot | null>(null);
  // V4 Phase 12: Zero-Based Real-Time Per-Agent & Chat Token Telemetry Ledger (Starts at 0 tokens / $0.0000)
  const [sessionTokenLedger, setSessionTokenLedger] =
    useState<ZeroBasedSessionTokenLedger>(() =>
      createZeroBasedSessionTokenLedger({
        siteName: 'DoItWithAI.tools',
        modelId: 'gemini-2.5-flash',
        isFreeTierKeyActive: true,
      })
    );
  const [ledgerFilterMode, setLedgerFilterMode] = useState<'all' | 'active' | 'chat'>('all');
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState<string>('');
  const [llmGatewayNote, setLlmGatewayNote] = useState<string>(
    'Free-Tier Shadow Telemetry Active · 90% Mechanical ($0.00) + 10% LLM Reasoning'
  );

  // V3 Phase 8: 3-Layer Agent Memory Bus, User-Taught Skills & Selective Interrupts
  const [memoryStore, setMemoryStore] = useState<AgencyMemoryStoreState>(() =>
    loadAgencyMemoryStore()
  );
  const [newSkillAgentId, setNewSkillAgentId] = useState<string>(
    'sub-pinterest-2x3-specialist'
  );
  const [newSkillRuleInput, setNewSkillRuleInput] = useState<string>('');
  const [customAssetTitleInput, setCustomAssetTitleInput] = useState<string>('');

  // V3 Phase 9: SEO.AI Challenger Suite — Backlink Club, Google Ads RSA & Spot-Check QA State
  const [backlinkClubState, setBacklinkClubState] =
    useState<BacklinkClubNetworkState | null>(null);
  const [isSpotCheckOptedIn, setIsSpotCheckOptedIn] = useState<boolean>(false);

  // V3 Phase 10: 1-Click No-Code CMS Connectors & Staggered 24/7 Heartbeat Scheduler State
  const [cmsConfig, setCmsConfig] = useState<CmsConnectionConfig | null>(null);
  const [isPublishingToCms, setIsPublishingToCms] = useState<boolean>(false);
  const [lastCmsPublishReceipt, setLastCmsPublishReceipt] =
    useState<CmsPublishExecutionResult | null>(null);
  const [heartbeatSchedule, setHeartbeatSchedule] =
    useState<AgencyHeartbeatScheduleState | null>(null);

  // Content Writing, LinkedIn Slide & Department Selection State
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [activeLinkedInSlideIdx, setActiveLinkedInSlideIdx] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<string>('');

  // Unified Founder Command Bar & 1-on-1 Agent Chat / Voice Call State
  const [chatTargetAgentId, setChatTargetAgentId] = useState<string>(
    'agent-chief-orchestrator'
  );
  const [isChatDrawerExpanded, setIsChatDrawerExpanded] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<FounderChatMessage[]>([]);

  const allFlatEmployees = useMemo(() => getAllAgencyEmployeesFlat(), []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = window.localStorage.getItem(AGENCY_THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeMode(savedTheme);
      }
    }
    const loaded = loadAutonomousStudioState();
    setStudioState(loaded);
    const firstCamp = loaded.campaigns[0];
    const firstSite = loaded.websites[0];
    const firstJob = firstCamp?.jobs[0];
    if (firstJob) {
      setSelectedArticleId(firstJob.id);
    }
    const initialSnap = loadTokenTelemetrySnapshot({
      siteName: firstSite?.siteName || 'DoItWithAI.tools',
      activeTopicTitle:
        firstJob?.topicTitle || '2026 AI SEO Audit & Implementation Playbook',
      modelId: 'gemini-2.5-flash',
    });
    setTokenTelemetrySnapshot(initialSnap);
    const initialZeroLedger = loadZeroBasedSessionTokenLedger({
      siteName: firstSite?.siteName || 'DoItWithAI.tools',
      modelId: 'gemini-2.5-flash',
      isFreeTierKeyActive: true,
    });
    setSessionTokenLedger(initialZeroLedger);
    setMemoryStore(loadAgencyMemoryStore());

    const loadedBacklinkClub = loadBacklinkClubState({
      siteName: firstSite?.siteName || 'DoItWithAI.tools',
      siteUrl: firstSite?.siteUrl || 'https://doitwithai.tools',
      primaryNiche: firstSite?.primaryNiche || 'AI SEO & Digital Marketing',
      activeArticleTitle:
        firstJob?.topicTitle || '2026 AI SEO Audit & Implementation Playbook',
      activeKeyword: firstJob?.primaryKeyword || 'ai seo audit checklist',
      activeArticleSlug: firstJob?.urlSlug || 'ai-seo-audit-checklist',
    });
    setBacklinkClubState(loadedBacklinkClub);

    const isInternal = firstSite?.publishingMode === 'internal-doitwithai-site';
    setCmsConfig(
      loadCmsConnectionConfig(
        firstSite?.siteUrl || 'https://doitwithai.tools',
        Boolean(isInternal)
      )
    );
    setHeartbeatSchedule(
      loadHeartbeatScheduleState(firstSite?.siteName || 'DoItWithAI.tools')
    );

    setChatMessages([
      {
        id: 'welcome-msg',
        sender: 'agent',
        agentName: 'Chief AI Officer & Founder Assistant',
        departmentBadge: 'Executive Office',
        text: 'Welcome to your 24/7 AI Digital Agency Office. All V3 Phases (Phases 1–10) are active: 1-Circle Token Telemetry, 3-Layer Trainable Agent Memory, Verified Backlink Exchange Club, Google Ads RSA Builder, and 1-Click WordPress/Shopify/Webflow/Webhook Auto-Publishing.',
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

  // V3 Phase 9: Active Backlink Exchange Club Network State
  const activeBacklinkClub: BacklinkClubNetworkState = useMemo(() => {
    return buildVerifiedBacklinkClubNetwork({
      siteName: activeWebsite?.siteName || 'DoItWithAI.tools',
      siteUrl: activeWebsite?.siteUrl || 'https://doitwithai.tools',
      primaryNiche: activeWebsite?.primaryNiche || 'AI SEO & Digital Marketing',
      activeArticleTitle:
        selectedArticle?.topicTitle || '2026 AI SEO Audit & Implementation Playbook',
      activeKeyword: selectedArticle?.primaryKeyword || 'ai seo audit checklist',
      activeArticleSlug: selectedArticle?.urlSlug || 'ai-seo-audit-checklist',
      isOptedIn: backlinkClubState?.isOptedIn ?? true,
      wovenPartnerIds: backlinkClubState?.wovenPartnerIds,
    });
  }, [
    activeWebsite?.siteName,
    activeWebsite?.siteUrl,
    activeWebsite?.primaryNiche,
    selectedArticle?.topicTitle,
    selectedArticle?.primaryKeyword,
    selectedArticle?.urlSlug,
    backlinkClubState?.isOptedIn,
    backlinkClubState?.wovenPartnerIds,
  ]);

  // V3 Phase 9: Active Google Ads RSA Campaign Pack (15 Headlines <=30c + 4 Descriptions <=90c + CSV)
  const activeGoogleAdsPack = useMemo(() => {
    return generateGoogleAdsRsaCampaignPack({
      siteName: activeWebsite?.siteName || 'DoItWithAI.tools',
      siteUrl: activeWebsite?.siteUrl || 'https://doitwithai.tools',
      primaryKeyword: selectedArticle?.primaryKeyword || 'ai seo audit checklist',
      articleTitle:
        selectedArticle?.topicTitle || '2026 AI SEO Audit & Implementation Playbook',
      urlSlug: selectedArticle?.urlSlug || 'ai-seo-audit-checklist',
    });
  }, [
    activeWebsite?.siteName,
    activeWebsite?.siteUrl,
    selectedArticle?.primaryKeyword,
    selectedArticle?.topicTitle,
    selectedArticle?.urlSlug,
  ]);

  // V3 Phase 9: Active 150-Point Automated QA + Opt-In Expert Spot-Check Evaluation
  const active150PtQaEvaluation = useMemo(() => {
    return evaluate150PointQaAndSpotCheck({
      articleTitle:
        selectedArticle?.topicTitle || '2026 AI SEO Audit & Implementation Playbook',
      primaryKeyword: selectedArticle?.primaryKeyword || 'ai seo audit checklist',
      isSpotCheckOptedIn,
    });
  }, [selectedArticle?.topicTitle, selectedArticle?.primaryKeyword, isSpotCheckOptedIn]);

  // Recompute telemetry snapshot whenever model or free-tier toggle changes
  const activeTelemetry: AgencyCircleTelemetrySnapshot = useMemo(() => {
    if (
      tokenTelemetrySnapshot &&
      tokenTelemetrySnapshot.modelId === selectedLlmModel &&
      tokenTelemetrySnapshot.isFreeTierKeyActive === isFreeTierKeyMode
    ) {
      return tokenTelemetrySnapshot;
    }
    return buildAgencyCircleTelemetrySnapshot({
      siteName: activeWebsite?.siteName || 'DoItWithAI.tools',
      activeTopicTitle:
        selectedArticle?.topicTitle || '2026 AI SEO Audit & Implementation Playbook',
      modelId: selectedLlmModel,
      isFreeTierKeyActive: isFreeTierKeyMode,
    });
  }, [
    tokenTelemetrySnapshot,
    selectedLlmModel,
    isFreeTierKeyMode,
    activeWebsite?.siteName,
    selectedArticle?.topicTitle,
  ]);

  // Build the 6-Stage Paced Handoff Packet Chain
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

  // Build the 8-Slide LinkedIn Carousel Deck (1080×1350) for the selected article
  const activeLinkedInSlides = useMemo(() => {
    const activeJob = selectedArticle || activeCampaign?.jobs[0];
    return generateLinkedIn8SlideCarouselDeck({
      articleTitle: activeJob?.topicTitle || '2026 Complete SEO Guide',
      primaryKeyword: activeJob?.primaryKeyword || 'ai seo strategy',
      siteName: activeWebsite?.siteName || 'DoItWithAI.tools',
      brandPrimaryHex: activeWebsite?.brandPrimaryHex,
      brandSecondaryHex: activeWebsite?.brandSecondaryHex,
      sectionTitles: activeJob?.outlineSections.map((s) => s.h2),
    });
  }, [selectedArticle, activeCampaign, activeWebsite]);

  // Build the 24-Hour Daily Executive Telemetry Series
  const dailyTelemetrySeries = useMemo(
    () => generateDailyExecutiveTelemetrySeries(activeCampaign?.jobs.length || 6),
    [activeCampaign?.jobs.length]
  );

  // Build the 12 Interconnected Core Digital Agency Office Nodes
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
        roleTitle: 'Web Search + DoItWithAI Keyword KD Engine + Google Ads RSA',
        tier: 'manager',
        departmentTab: 'keyword-strategist',
        departmentBadge: 'Dept 1 · Keywords',
        accentHex: '#F59E0B',
        x: 165,
        y: 195,
        parentNodeId: 'agent-chief-orchestrator',
        handoffStageOrder: 2,
        liveActionText: `Scored "${primaryKw}" (KD ${activeJob?.kdProxyScore || 16}/100) + 15 Google Ads RSA Headlines`,
        equippedSkills: ['serp-intent-clustering', 'low-kd-opportunity-mining'],
        equippedTools: [
          'google-autocomplete-live-scraper',
          'doitwithai-keyword-scoring-engine',
          'google-ads-rsa-builder',
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
        roleTitle: 'CWV (0.00 CLS), robots.txt AI Bots, Backlink Club & PR Pitches',
        tier: 'manager',
        departmentTab: 'technical-seo',
        departmentBadge: 'Dept 5 & 6 · Tech/PR',
        accentHex: '#06B6D4',
        x: 985,
        y: 195,
        parentNodeId: 'agent-chief-orchestrator',
        handoffStageOrder: 4,
        liveActionText: `0.00 CLS SVG check passed · ${activeBacklinkClub.activeVerifiedBacklinksCount} Backlink Club links active`,
        equippedSkills: ['ai-crawler-robots-governance', 'backlink-club-exchange-matcher'],
        equippedTools: ['robots-txt-ai-bot-validator', 'verified-backlink-club-engine'],
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
        roleTitle: '150-Point Readability Gate + Spot-Check + CMS Publisher',
        tier: 'manager',
        departmentTab: 'qa-publishing',
        departmentBadge: 'Dept 7 · QA & Publish',
        accentHex: '#22C55E',
        x: 845,
        y: 345,
        parentNodeId: 'sub-geo-section-writer',
        handoffStageOrder: 5,
        liveActionText: isInternalSite
          ? `QA ${active150PtQaEvaluation.totalScore}/150 Pass → Auto-publishing to /p/[slug]/blog`
          : `QA ${active150PtQaEvaluation.totalScore}/150 Pass → Ready for 1-Click WP/Shopify/Webhook`,
        equippedSkills: ['150pt-readability-eeat-audit', 'anti-cliche-burstiness-verification'],
        equippedTools: [
          '150pt-geo-quality-gate',
          'wordpress-app-password-rest-connector',
          'shopify-webflow-webhook-publisher',
        ],
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
    activeBacklinkClub.activeVerifiedBacklinksCount,
    active150PtQaEvaluation.totalScore,
  ]);

  const currentDepartmentRegistry = useMemo(
    () => getDepartmentByTabId(activeSidebarTab),
    [activeSidebarTab]
  );

  const isLightTheme = themeMode === 'light';

  const handleToggleThemeMode = () => {
    setThemeMode((prev) => {
      const next: AgencyThemeMode = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(AGENCY_THEME_STORAGE_KEY, next);
        } catch {
          // Ignore storage errors
        }
      }
      return next;
    });
  };

  const activeOuterDomainConfig = useMemo(
    () =>
      V4_OUTER_RAIL_DOMAINS.find((d) => d.id === activeOuterDomain) ??
      V4_OUTER_RAIL_DOMAINS[0]!,
    [activeOuterDomain]
  );

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  /**
   * V3 Phase 10: Execute 1-Click No-Code CMS Auto-Publishing (`/api/ai-employee-agency/publish-cms`)
   */
  const handleExecuteCmsAutoPublish = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeWebsite || !selectedArticle || !cmsConfig) return;
    setIsPublishingToCms(true);
    saveCmsConnectionConfig(cmsConfig);

    const compiledMd =
      selectedArticle.compiledArticleMarkdown ||
      compileJobArticleMarkdown(selectedArticle, activeWebsite);
    const heroSvg = renderFeaturedHeroImageSvg(selectedArticle, activeWebsite);
    const jsonLdScript =
      agencyState?.onPageAuditItems[0]?.generatedCodeOrCopy ||
      '<script type="application/ld+json">{}</script>';

    try {
      const res = await fetch('/api/ai-employee-agency/publish-cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: cmsConfig,
          article: {
            title: selectedArticle.topicTitle,
            slug: selectedArticle.urlSlug,
            metaTitle: selectedArticle.metaTitle,
            metaDescription: selectedArticle.metaDescription,
            aeoDirectAnswer50Words: selectedArticle.aeoDirectAnswer50Words,
            compiledHtmlBody: '',
            compiledMarkdownBody: compiledMd,
            featuredHeroSvg: heroSvg,
            jsonLdGraphScript: jsonLdScript,
            primaryKeyword: selectedArticle.primaryKeyword,
          },
        }),
      });

      if (res.ok) {
        const receipt = (await res.json()) as CmsPublishExecutionResult;
        setLastCmsPublishReceipt(receipt);
        setStatusToast(receipt.diagnosticMessage);
        setIsPublishingToCms(false);
        return;
      }
    } catch {
      // Deterministic local receipt if offline
    }

    const spec = CMS_PLATFORM_SPECS[cmsConfig.platformId];
    const fallbackReceipt: CmsPublishExecutionResult = {
      ok: true,
      platformId: cmsConfig.platformId,
      platformDisplayName: spec.displayName,
      executedMode: 'simulated-dry-run',
      postStatus:
        cmsConfig.autoPublishMode === 'auto-publish-live' ? 'published' : 'draft',
      publishedOrStagedUrl: `${activeWebsite.siteUrl.replace(/\/$/, '')}/blog/${
        selectedArticle.urlSlug
      }`,
      externalPostId: `${cmsConfig.platformId}-${Date.now().toString().slice(-5)}`,
      timestampIso: new Date().toISOString(),
      diagnosticMessage: `Staged "${selectedArticle.topicTitle}" (HTML + 5 SVGs + @graph Schema) for ${spec.displayName}.`,
      curlEquivalentSnippet: buildCmsCurlPreview(
        cmsConfig,
        selectedArticle.urlSlug,
        selectedArticle.topicTitle
      ),
    };
    setLastCmsPublishReceipt(fallbackReceipt);
    setStatusToast(fallbackReceipt.diagnosticMessage);
    setIsPublishingToCms(false);
  };

  /**
   * V3 Phase 10: Toggle a Staggered 24/7 Heartbeat Cron Slot
   */
  const handleToggleHeartbeatSlot = (slotId: string) => {
    if (!heartbeatSchedule) return;
    const updated: AgencyHeartbeatScheduleState = {
      ...heartbeatSchedule,
      slots: heartbeatSchedule.slots.map((s) =>
        s.slotId === slotId ? { ...s, isEnabled: !s.isEnabled } : s
      ),
    };
    saveHeartbeatScheduleState(updated);
    setHeartbeatSchedule(updated);
  };

  /**
   * V3 Phase 9: Toggle Backlink Exchange Club Opt-In or Weave a Partner Link Pair
   */
  const handleToggleBacklinkClubOptIn = () => {
    const nextState: BacklinkClubNetworkState = {
      ...activeBacklinkClub,
      isOptedIn: !activeBacklinkClub.isOptedIn,
    };
    saveBacklinkClubState(nextState);
    setBacklinkClubState(nextState);
    setStatusToast(
      nextState.isOptedIn
        ? `Opted into the DoItWithAI Verified Backlink Exchange Club (${nextState.matchedPartners.length} non-competing niche partners matched).`
        : 'Paused automatic Backlink Exchange Club placements.'
    );
  };

  const handleWeavePartnerLinkPair = (partnerId: string, brandName: string) => {
    const exists = activeBacklinkClub.wovenPartnerIds.includes(partnerId);
    const nextWoven = exists
      ? activeBacklinkClub.wovenPartnerIds.filter((id) => id !== partnerId)
      : [...activeBacklinkClub.wovenPartnerIds, partnerId];
    const nextState: BacklinkClubNetworkState = {
      ...activeBacklinkClub,
      isOptedIn: true,
      wovenPartnerIds: nextWoven,
    };
    saveBacklinkClubState(nextState);
    setBacklinkClubState(nextState);
    setStatusToast(
      exists
        ? `Removed reciprocal link placement with ${brandName}.`
        : `Wove contextual reciprocal backlink pair with ${brandName} into active article markdown!`
    );
  };

  /**
   * V3 Phase 8: Record a Selective Workflow Interrupt or User-Taught Skill in Shared Memory Bus
   */
  const handleRecordSelectiveInterrupt = (plan: SelectiveInterruptRoutingPlan) => {
    setMemoryStore((prev) => {
      const nextSkills = plan.learnedSkillRule
        ? [plan.learnedSkillRule, ...prev.learnedSkills]
        : prev.learnedSkills;
      const nextEvents = [plan.memoryBusEvent, ...prev.sharedMemoryEvents].slice(
        0,
        15
      );
      return saveAgencyMemoryStore({
        ...prev,
        learnedSkills: nextSkills,
        sharedMemoryEvents: nextEvents,
      });
    });
  };

  /**
   * V3 Phase 8: Teach a Permanent Custom Skill Rule directly from the Executive Office UI
   */
  const handleTeachSkillFromForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newSkillRuleInput.trim();
    if (!cleaned) return;
    const plan = routeSelectiveWorkflowInterrupt({
      agentId: newSkillAgentId,
      rawMessage: `Remember: ${cleaned}`,
    });
    handleRecordSelectiveInterrupt(plan);
    setNewSkillRuleInput('');
    setStatusToast(
      `Taught permanent skill to ${plan.primaryAgentName}. Woke only ${plan.wokenAgentNames.join(
        ' + '
      )} (${plan.uninterruptedAgentCount} other agents uninterrupted).`
    );
  };

  /**
   * V3 Phase 8: Trigger a Selective Custom Visual Asset Override without interrupting other departments
   */
  const handleSelectiveCustomAssetUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const assetTitle =
      customAssetTitleInput.trim() || 'Founder Custom Product Screenshot (1000×1500)';
    const plan = routeSelectiveWorkflowInterrupt({
      agentId: 'sub-pinterest-2x3-specialist',
      rawMessage: `Use uploaded custom image "${assetTitle}" for the active Pinterest 2:3 pin and LinkedIn carousel`,
      customAssetUrl: `custom-upload://${encodeURIComponent(assetTitle)}`,
    });
    setMemoryStore((prev) =>
      saveAgencyMemoryStore({
        learnedSkills: prev.learnedSkills,
        sharedMemoryEvents: [plan.memoryBusEvent, ...prev.sharedMemoryEvents].slice(
          0,
          15
        ),
        customUploadedAssets: [
          {
            id: `asset-${Date.now()}`,
            title: assetTitle,
            targetDepartmentTab: 'social-video-fleet',
            assignedAgentId: 'sub-pinterest-2x3-specialist',
            dataUriOrUrl: `custom-upload://${encodeURIComponent(assetTitle)}`,
            uploadedAtIso: new Date().toISOString(),
          },
          ...prev.customUploadedAssets,
        ],
      })
    );
    setCustomAssetTitleInput('');
    setStatusToast(
      `Selective Asset Override Complete: Woke only ${plan.wokenAgentNames.join(
        ' + '
      )} while ${plan.uninterruptedAgentCount} other agents continued uninterrupted.`
    );
  };

  /**
   * V4 Phase 12: Reset Zero-Based Session Token Ledger back to 0 tokens ($0.0000)
   */
  const handleResetSessionTokenLedger = () => {
    const fresh = resetZeroBasedSessionTokenLedger({
      siteName: activeWebsite?.siteName || 'DoItWithAI.tools',
      modelId: selectedLlmModel,
      isFreeTierKeyActive: isFreeTierKeyMode,
    });
    setSessionTokenLedger(fresh);
    setStatusToast(
      'Session Token Ledger reset to 0 tokens ($0.0000) across Chat Box & all 36 AI Employees.'
    );
  };

  /**
   * V4 Phase 12: Record real-time Chat Box + Target Agent token consumption
   */
  const handleRecordChatTokenUsage = (usage: {
    agentId: string;
    agentName: string;
    promptTokens: number;
    completionTokens: number;
    thinkingTokens: number;
    totalTokens: number;
    shadowPaidCostUsd: number;
    actualCostUsd: number;
    apiKeySlot: ApiKeySlotId;
    modelId: AgencyLlmModelId;
    usedLiveApiKey: boolean;
    actionLabel: string;
  }) => {
    setSessionTokenLedger((prev) => {
      const updated = recordSessionTokenUsage(prev, {
        rowId: CHAT_BOX_LEDGER_ROW_ID,
        actionLabel: usage.actionLabel,
        modelId: usage.modelId,
        apiKeySlot: usage.apiKeySlot,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        thinkingTokens: usage.thinkingTokens,
        shadowCostUsd: usage.shadowPaidCostUsd,
        actualCostUsd: usage.actualCostUsd,
        usedLiveApiKey: usage.usedLiveApiKey,
        isFreeTierKey: isFreeTierKeyMode,
      });
      return saveZeroBasedSessionTokenLedger(updated);
    });
  };

  /**
   * V3 Phase 7 + V4 Phase 12: Run Live 1-Circle Token & Cost Audit via `/api/ai-employee-agency/orchestrate`
   */
  const handleRunLiveCircleTokenAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeWebsite || !activeCampaign) return;
    setIsRunningTokenAudit(true);

    try {
      const res = await fetch('/api/ai-employee-agency/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl: activeWebsite.siteUrl,
          siteName: activeWebsite.siteName,
          primaryNiche: activeWebsite.primaryNiche,
          seedKeywordQuery:
            selectedArticle?.primaryKeyword || activeWebsite.primaryNiche,
          isInternalSite,
          existingSlugs: activeCampaign.jobs.map((j) => j.urlSlug),
          modelId: selectedLlmModel,
          apiKeyOverride: testApiKeyInput.trim() || undefined,
          isFreeTierKey: isFreeTierKeyMode,
          userLearnedSkills: memoryStore.learnedSkills,
          isSpotCheckOptedIn,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          ok: boolean;
          circleTokenTelemetry?: AgencyCircleTelemetrySnapshot;
          llmGatewayStatus?: {
            telemetryNote?: string;
            usedLiveApiKey?: boolean;
            apiKeySlot?: ApiKeySlotId;
          };
        };
        if (data.ok && data.circleTokenTelemetry) {
          saveTokenTelemetrySnapshot(data.circleTokenTelemetry);
          setTokenTelemetrySnapshot(data.circleTokenTelemetry);
          setSessionTokenLedger((prev) => {
            const nextLedger = recordCircleOrchestrationIntoLedger(
              prev,
              data.circleTokenTelemetry!,
              {
                apiKeySlot: data.llmGatewayStatus?.apiKeySlot,
                usedLiveApiKey: data.llmGatewayStatus?.usedLiveApiKey,
              }
            );
            return saveZeroBasedSessionTokenLedger(nextLedger);
          });
          if (data.llmGatewayStatus?.telemetryNote) {
            setLlmGatewayNote(data.llmGatewayStatus.telemetryNote);
          }
          setStatusToast(
            `Live Circle Metered: +${data.circleTokenTelemetry.totalCircleTokens.toLocaleString()} tokens ($${data.circleTokenTelemetry.singleCircleShadowCostUsd.toFixed(
              4
            )} shadow · $${data.circleTokenTelemetry.singleCircleActualCostUsd.toFixed(
              4
            )} billed) added to Session Ledger.`
          );
          setIsRunningTokenAudit(false);
          return;
        }
      }
    } catch {
      // Deterministic local fallback if offline
    }

    const fallbackSnap = buildAgencyCircleTelemetrySnapshot({
      siteName: activeWebsite.siteName,
      activeTopicTitle:
        selectedArticle?.topicTitle || '2026 AI SEO Audit & Implementation Playbook',
      modelId: selectedLlmModel,
      isFreeTierKeyActive: isFreeTierKeyMode,
    });
    saveTokenTelemetrySnapshot(fallbackSnap);
    setTokenTelemetrySnapshot(fallbackSnap);
    setSessionTokenLedger((prev) => {
      const nextLedger = recordCircleOrchestrationIntoLedger(prev, fallbackSnap, {
        apiKeySlot: 'KEY_SLOT_MECHANICAL_ZERO',
        usedLiveApiKey: false,
      });
      return saveZeroBasedSessionTokenLedger(nextLedger);
    });
    setIsRunningTokenAudit(false);
  };

  /**
   * Run Live Keyword Research & DoItWithAI KD Scorer
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
          modelId: selectedLlmModel,
          apiKeyOverride: testApiKeyInput.trim() || undefined,
          isFreeTierKey: isFreeTierKeyMode,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          ok: boolean;
          scoredKeywordBriefs?: ScoredKeywordBrief[];
          circleTokenTelemetry?: AgencyCircleTelemetrySnapshot;
          llmGatewayStatus?: {
            apiKeySlot?: ApiKeySlotId;
            usedLiveApiKey?: boolean;
          };
        };
        if (data.circleTokenTelemetry) {
          saveTokenTelemetrySnapshot(data.circleTokenTelemetry);
          setTokenTelemetrySnapshot(data.circleTokenTelemetry);
          setSessionTokenLedger((prev) => {
            const nextLedger = recordCircleOrchestrationIntoLedger(
              prev,
              data.circleTokenTelemetry!,
              {
                apiKeySlot: data.llmGatewayStatus?.apiKeySlot,
                usedLiveApiKey: data.llmGatewayStatus?.usedLiveApiKey,
                stageOnly: 1,
              }
            );
            return saveZeroBasedSessionTokenLedger(nextLedger);
          });
        }
        if (data.ok && Array.isArray(data.scoredKeywordBriefs)) {
          setLiveScoredBriefs(data.scoredKeywordBriefs);
          setStatusToast(
            `Keyword Strategist scored ${data.scoredKeywordBriefs.length} live autocomplete keywords via DoItWithAI KD Engine.`
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
      `Keyword Strategist scored ${scored.length} low-KD keyword briefs for "${querySeed}".`
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
      searchIntent: templateJob.searchIntent,
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
      `Keyword Strategist handed off "${brief.keyword}" (KD ${brief.kdScore}) to Content Production Manager.`
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
      `Keyword Strategist handed off "${jobToStart.primaryKeyword}" to Content Production Manager — drafting & rendering visuals now...`
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
        ? `Completed & Auto-Published "${jobToStart.topicTitle}" to ${publishedUrl}.`
        : `Completed Draft, Featured Image, 4 Section Infographics & Social Pack for "${jobToStart.topicTitle}".`
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

  const currentLinkedInSlide =
    activeLinkedInSlides[activeLinkedInSlideIdx] || activeLinkedInSlides[0]!;

  return (
    <div
      data-agency-theme={themeMode}
      className={`h-[calc(100dvh-80px)] overflow-hidden flex flex-col transition-colors duration-200 ${
        isLightTheme
          ? 'agency-v4-light bg-[#F8FAFC] text-slate-900'
          : 'bg-[#060B16] text-slate-100'
      }`}
    >
      {isLightTheme && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .agency-v4-light [class*="bg-slate-950"],
              .agency-v4-light [class*="bg-[#0A1"],
              .agency-v4-light [class*="bg-[#080"] {
                background-color: #ffffff !important;
              }
              .agency-v4-light [class*="bg-slate-900"],
              .agency-v4-light [class*="bg-[#0"] {
                background-color: #f8fafc !important;
              }
              .agency-v4-light [class*="bg-slate-800"] {
                background-color: #f1f5f9 !important;
              }
              .agency-v4-light [class*="border-slate-8"],
              .agency-v4-light [class*="border-slate-7"] {
                border-color: #cbd5e1 !important;
              }
              .agency-v4-light .text-white {
                color: #0f172a !important;
              }
              .agency-v4-light .text-slate-100,
              .agency-v4-light .text-slate-200 {
                color: #1e293b !important;
              }
              .agency-v4-light .text-slate-300,
              .agency-v4-light .text-slate-400 {
                color: #475569 !important;
              }
              .agency-v4-light .text-sky-200,
              .agency-v4-light .text-sky-300,
              .agency-v4-light .text-sky-400 {
                color: #1d4ed8 !important;
              }
              .agency-v4-light .text-emerald-200,
              .agency-v4-light .text-emerald-300,
              .agency-v4-light .text-emerald-400 {
                color: #047857 !important;
              }
              .agency-v4-light .text-amber-300 {
                color: #b45309 !important;
              }
              .agency-v4-light .text-purple-200,
              .agency-v4-light .text-purple-300 {
                color: #6d28d9 !important;
              }
              .agency-v4-light .text-cyan-300,
              .agency-v4-light .text-rose-300 {
                color: #0e7490 !important;
              }
              .agency-v4-light [class*="bg-sky-950"],
              .agency-v4-light [class*="bg-emerald-950"],
              .agency-v4-light [class*="bg-amber-950"] {
                background-color: #eff6ff !important;
              }
            `,
          }}
        />
      )}
      {/* =====================================================================
          SLEEK TOP AGENCY COMMAND HEADER BAR (SVG Icons · Zero Noise)
         ===================================================================== */}
      <header className="border-b border-slate-800/90 bg-[#0A1122]/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Change URL + Website Identity + Active Stage Pill */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/ai-employee-agency"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 shrink-0 transition"
            >
              <AgencyUiIcon name="arrow-left" className="w-3.5 h-3.5" />
              <span>Change Website</span>
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="text-sm sm:text-base font-extrabold text-white truncate">
                  {activeWebsite.siteName}
                </span>
                <span className="hidden md:inline-block rounded-md bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                  {isInternalSite ? 'Internal Auto-Publish' : 'External Domain'}
                </span>
                <div className="hidden lg:inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveOuterDomain('agency');
                      setActiveSidebarTab('executive-office');
                      setExecutiveSubView('tokens');
                      setIsFullCanvasGraphOpen(false);
                      setIsGraphFullScreenViewport(false);
                    }}
                    className="inline-flex items-center gap-1.5 font-bold text-emerald-300 hover:underline"
                    title="Open Zero-Based Per-Agent & Chat Token Telemetry Ledger"
                  >
                    <AgencyUiIcon name="activity" className="w-3 h-3 text-emerald-400" />
                    <span>
                      Session: {sessionTokenLedger.totalSessionTokens.toLocaleString()} tok · $
                      {sessionTokenLedger.totalShadowCostUsd.toFixed(4)}
                    </span>
                  </button>
                  <span className="hidden xl:inline-block rounded bg-slate-900/80 border border-slate-700/80 px-1.5 py-0.2 text-[9px] text-sky-300">
                    {sessionTokenLedger.activeKeySlot}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetSessionTokenLedger}
                    className="rounded bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 text-[9px] font-bold text-slate-300 transition"
                    title="Reset Session Token Counter to 0"
                  >
                    Reset 0
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Theme Toggle + Workspace vs Node Graph Toggle + Direct Full-Screen Expand + Flow Pause */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleThemeMode}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                isLightTheme
                  ? 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                  : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
              }`}
              title={isLightTheme ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              <AgencyUiIcon
                name={isLightTheme ? 'moon' : 'sun'}
                className="w-3.5 h-3.5 text-amber-400"
              />
              <span className="hidden sm:inline">
                {isLightTheme ? 'Dark Mode' : 'Light Mode'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFullCanvasGraphOpen((prev) => !prev);
                if (isFullCanvasGraphOpen) {
                  setIsGraphFullScreenViewport(false);
                }
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition shadow ${
                isFullCanvasGraphOpen
                  ? 'bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 text-slate-950'
                  : 'border border-sky-400/60 bg-sky-500/20 text-sky-200 hover:bg-sky-500/30'
              }`}
            >
              <AgencyUiIcon
                name={isFullCanvasGraphOpen ? 'dashboard-grid' : 'node-graph'}
                className="w-3.5 h-3.5"
              />
              <span>
                {isFullCanvasGraphOpen
                  ? 'Return to Department Tabs'
                  : 'Live Agency Node Graph'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsFullCanvasGraphOpen(true);
                setIsGraphFullScreenViewport(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/50 bg-emerald-500/15 hover:bg-emerald-500/25 px-3 py-2 text-xs font-extrabold text-emerald-200 transition"
              title="Open Node Graph in 100% Full Screen"
            >
              <AgencyUiIcon name="expand-fullscreen" className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Full Screen Graph</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPacedHandoffRunning((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 transition"
            >
              <AgencyUiIcon
                name={isPacedHandoffRunning ? 'pause' : 'play'}
                className="w-3.5 h-3.5 text-sky-400"
              />
              <span>{isPacedHandoffRunning ? 'Pause Flow' : 'Resume Flow'}</span>
            </button>
          </div>
        </div>
      </header>

      {statusToast && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-6 py-2 text-xs text-emerald-200 flex items-center justify-between">
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
          MAIN BODY: V4 DUAL-RAIL LEFT NAVIGATION (64px ICON RAIL + 216px SUB-MENU) + LOCKED WORKSPACE
         ===================================================================== */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* RAIL 1: 64px Outer Icon Rail (Semrush/Ahrefs Ergonomics) */}
        <nav
          aria-label="Primary Agency Domains"
          className={`w-[68px] shrink-0 border-r flex flex-col items-center justify-between py-3 px-1.5 ${
            isLightTheme
              ? 'bg-slate-100 border-slate-200'
              : 'bg-[#050A14] border-slate-800/90'
          }`}
        >
          <div className="w-full space-y-1.5">
            {V4_OUTER_RAIL_DOMAINS.filter((d) => d.id !== 'settings').map((domain) => {
              const isActive = activeOuterDomain === domain.id;
              return (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => {
                    setActiveOuterDomain(domain.id);
                    setIsInnerRailCollapsed(false);
                    const firstItem = domain.items[0];
                    if (firstItem) {
                      setActiveSidebarTab(firstItem.targetTab);
                      if (firstItem.execSubView) {
                        setExecutiveSubView(firstItem.execSubView);
                      }
                      setIsFullCanvasGraphOpen(Boolean(firstItem.openGraph));
                      setIsGraphFullScreenViewport(false);
                    }
                  }}
                  className={`w-full rounded-xl py-2 px-1 flex flex-col items-center gap-1 transition ${
                    isActive
                      ? isLightTheme
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-sky-500/15 text-sky-300 border border-sky-500/40'
                      : isLightTheme
                        ? 'text-slate-600 hover:bg-slate-200/70'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <DepartmentSvgIcon tabId={domain.iconTab} className="w-4 h-4" />
                  <span className="text-[10px] font-bold leading-none">
                    {domain.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom-Pinned Settings & Collapse Controls */}
          <div className="w-full space-y-1.5 pt-2 border-t border-slate-800/50">
            <button
              type="button"
              onClick={() => {
                setActiveOuterDomain('settings');
                setIsInnerRailCollapsed(false);
                setActiveSidebarTab('executive-office');
                setExecutiveSubView('memory');
                setIsFullCanvasGraphOpen(false);
              }}
              className={`w-full rounded-xl py-2 px-1 flex flex-col items-center gap-1 transition ${
                activeOuterDomain === 'settings'
                  ? isLightTheme
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-sky-500/15 text-sky-300 border border-sky-500/40'
                  : isLightTheme
                    ? 'text-slate-600 hover:bg-slate-200/70'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <AgencyUiIcon name="settings" className="w-4 h-4" />
              <span className="text-[10px] font-bold leading-none">Settings</span>
            </button>
            <button
              type="button"
              onClick={() => setIsInnerRailCollapsed((prev) => !prev)}
              className={`w-full rounded-xl py-1.5 flex items-center justify-center transition ${
                isLightTheme
                  ? 'text-slate-500 hover:bg-slate-200'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
              title={isInnerRailCollapsed ? 'Expand Tool Menu' : 'Collapse Tool Menu'}
            >
              <AgencyUiIcon
                name={isInnerRailCollapsed ? 'panel-left-open' : 'panel-left-close'}
                className="w-4 h-4"
              />
            </button>
          </div>
        </nav>

        {/* RAIL 2: 216px Contextual Tool Sub-Menu */}
        {!isInnerRailCollapsed && (
          <aside
            className={`hidden md:flex w-[224px] shrink-0 border-r flex-col justify-between p-3 overflow-y-auto ${
              isLightTheme
                ? 'bg-white border-slate-200'
                : 'bg-[#080F1E] border-slate-800/90'
            }`}
          >
            <div className="space-y-4">
              <div className="px-2 flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  {activeOuterDomainConfig.panelTitle}
                </span>
                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                  36 AI
                </span>
              </div>

              <div className="space-y-1">
                {activeOuterDomainConfig.items.map((item) => {
                  const isItemActive =
                    (item.openGraph && isFullCanvasGraphOpen) ||
                    (!isFullCanvasGraphOpen &&
                      !item.openGraph &&
                      activeSidebarTab === item.targetTab &&
                      (!item.execSubView || executiveSubView === item.execSubView));
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveSidebarTab(item.targetTab);
                        if (item.execSubView) {
                          setExecutiveSubView(item.execSubView);
                        }
                        setIsFullCanvasGraphOpen(Boolean(item.openGraph));
                        setIsGraphFullScreenViewport(false);
                      }}
                      className={`w-full text-left rounded-lg px-2.5 py-2 text-xs font-semibold transition flex items-center justify-between gap-2 ${
                        isItemActive
                          ? isLightTheme
                            ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                            : 'bg-sky-500/15 text-white border-l-2 border-sky-400'
                          : isLightTheme
                            ? 'text-slate-700 hover:bg-slate-100'
                            : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 text-[9.5px] font-mono ${
                          item.modeBadge === '24/7 Auto'
                            ? 'text-emerald-400'
                            : item.modeBadge === 'Live Meter'
                              ? 'text-amber-400'
                              : 'text-sky-400'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.modeBadge === '24/7 Auto'
                              ? 'bg-emerald-400'
                              : item.modeBadge === 'Live Meter'
                                ? 'bg-amber-400'
                                : 'bg-sky-400'
                          }`}
                        />
                        {item.modeBadge === '24/7 Auto'
                          ? 'Auto'
                          : item.modeBadge === 'Live Meter'
                            ? 'Live'
                            : 'Tool'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-800/40 space-y-1">
                <div className="px-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  All 9 Departments
                </div>
                {CLEAN_SIDEBAR_NAV.map((dept) => {
                  const isSelected =
                    !isFullCanvasGraphOpen && activeSidebarTab === dept.id;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => {
                        setActiveSidebarTab(dept.id);
                        setIsFullCanvasGraphOpen(false);
                        setIsGraphFullScreenViewport(false);
                      }}
                      className={`w-full text-left rounded-lg px-2.5 py-1.5 text-[11.5px] transition flex items-center justify-between gap-2 ${
                        isSelected
                          ? isLightTheme
                            ? 'bg-slate-100 font-bold text-slate-900'
                            : 'bg-slate-900 font-bold text-white'
                          : isLightTheme
                            ? 'text-slate-600 hover:bg-slate-50'
                            : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{dept.title}</span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {dept.teamCountLabel.replace(' Agents', '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Theme & Node Graph Card */}
            <div className="pt-3 border-t border-slate-800/40 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsFullCanvasGraphOpen(true);
                  setIsGraphFullScreenViewport(true);
                }}
                className="w-full rounded-xl border border-sky-500/35 bg-sky-500/10 hover:bg-sky-500/20 px-3 py-2 text-left transition flex items-center justify-between text-xs font-bold text-sky-300"
              >
                <span className="inline-flex items-center gap-1.5">
                  <AgencyUiIcon name="expand-fullscreen" className="w-3.5 h-3.5" />
                  <span>Full-Screen Graph</span>
                </span>
                <span className="text-[10px] font-mono">100%</span>
              </button>
            </div>
          </aside>
        )}

        {/* =====================================================================
            RIGHT MAIN WORKSPACE AREA (SCROLLS CLEANLY INSIDE 100dvh SHELL)
           ===================================================================== */}
        <main className="flex-1 min-w-0 overflow-y-auto flex flex-col">
          {isFullCanvasGraphOpen ? (
            <InteractiveAgencyNodeCanvas
              coreNodes={officeNodes}
              activeHandoffStage={activeHandoffStage}
              activePacket={activePacket}
              isFullScreenViewport={isGraphFullScreenViewport}
              onToggleFullScreenViewport={() =>
                setIsGraphFullScreenViewport((prev) => !prev)
              }
              onStepNextStage={() =>
                setActiveHandoffStage((prev) => (prev >= 6 ? 1 : prev + 1))
              }
              onSelectDepartmentTab={(tabId) => {
                setActiveSidebarTab(tabId);
                setIsFullCanvasGraphOpen(false);
                setIsGraphFullScreenViewport(false);
              }}
              onStartAgentChat={(agentId) => {
                setChatTargetAgentId(agentId);
                setIsChatDrawerExpanded(true);
              }}
            />
          ) : (
            <div className="p-4 sm:p-6 space-y-5 flex-1">
              {/* -------------------------------------------------------------
                  COMPACT DEPARTMENT MANAGER & SUB-AGENTS HEADER BAR
                 ------------------------------------------------------------- */}
              <div className="rounded-2xl border border-slate-800/90 bg-[#0A1224] p-4 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                      style={{
                        backgroundColor: `${currentDepartmentRegistry.accentHex}18`,
                        borderColor: `${currentDepartmentRegistry.accentHex}50`,
                        color: currentDepartmentRegistry.accentHex,
                      }}
                    >
                      <DepartmentSvgIcon
                        tabId={activeSidebarTab}
                        className="w-4 h-4"
                      />
                    </span>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400">
                        {currentDepartmentRegistry.departmentBadge} · 1 Lead Manager +{' '}
                        {currentDepartmentRegistry.subAgents.length} Sub-Agents
                      </div>
                      <div className="text-sm font-extrabold text-white">
                        {currentDepartmentRegistry.name}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setChatTargetAgentId(currentDepartmentRegistry.id);
                      setIsChatDrawerExpanded(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-purple-400/40 bg-purple-500/15 hover:bg-purple-500/25 px-3 py-1.5 text-[11px] font-extrabold text-purple-200 transition"
                  >
                    <AgencyUiIcon name="chat" className="w-3.5 h-3.5" />
                    <span>Message {currentDepartmentRegistry.name}</span>
                  </button>
                </div>

                {/* Compact Sub-Agents Row */}
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
                              backgroundColor: `${sub.accentHex}20`,
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
                            Chat 1-on-1 →
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
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* -------------------------------------------------------------
                  TAB 1: EXECUTIVE OFFICE (KPIs + PHASE 7 TOKEN HUD + PHASE 8 MEMORY + PHASE 10 HEARTBEATS)
                 ------------------------------------------------------------- */}
              {activeSidebarTab === 'executive-office' && (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-sky-500/35 bg-slate-900/80 p-5 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400">
                          Executive Command Center (V3 Phases 1–10 Active)
                        </span>
                        <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                          24/7 Agency Output, Live 1-Circle Token Telemetry, 3-Layer Memory &amp; Cron Heartbeats
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsFullCanvasGraphOpen(true);
                          setIsGraphFullScreenViewport(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 transition"
                      >
                        <AgencyUiIcon name="expand-fullscreen" className="w-3.5 h-3.5" />
                        <span>Launch Full-Screen Node Graph</span>
                      </button>
                    </div>

                    {/* Horizontal Executive Sub-Navigation Tabs (Semrush / Ahrefs Style) */}
                    <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800/70 pb-3">
                      {(
                        [
                          { id: 'overview', label: 'Overview & 24h Flow' },
                          { id: 'tokens', label: 'Token & API Telemetry' },
                          { id: 'memory', label: 'Trainable Skills & Memory' },
                          { id: 'heartbeat', label: '24/7 Heartbeat Schedule' },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setExecutiveSubView(tab.id)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                            executiveSubView === tab.id
                              ? 'bg-sky-500 text-slate-950'
                              : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Top 5 Executive KPI & Token Cost Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                        <div className="text-slate-400 text-[11px]">Low-KD Clusters</div>
                        <div className="text-base font-black text-amber-300 mt-1">
                          {activeCampaign.jobs.length} Topics Locked
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                        <div className="text-slate-400 text-[11px]">
                          {isInternalSite ? 'Published Live' : 'Drafts Staged'}
                        </div>
                        <div className="text-base font-black text-emerald-300 mt-1">
                          {publishedOrDraftJobs.length} Done · {activelyWritingJobs.length}{' '}
                          Active
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                        <div className="text-slate-400 text-[11px]">Backlink Club &amp; Ads</div>
                        <div className="text-base font-black text-pink-300 mt-1">
                          {activeBacklinkClub.activeVerifiedBacklinksCount} Links · 15 RSA
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                        <div className="text-slate-400 text-[11px]">30-Day Monthly Cost</div>
                        <div className="text-base font-black text-sky-300 font-mono mt-1">
                          ${activeTelemetry.projected30DayMonthlyCostUsd.toFixed(2)}/mo
                        </div>
                      </div>
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-3.5">
                        <div className="flex items-center justify-between gap-1 text-[11px] text-emerald-300">
                          <span>Live Session Tokens</span>
                          <span className="text-[9.5px] font-mono text-sky-300">
                            {sessionTokenLedger.activeAgentsCount}/36 active
                          </span>
                        </div>
                        <div className="text-lg font-extrabold text-emerald-300 mt-1 font-mono">
                          {sessionTokenLedger.totalSessionTokens.toLocaleString()} tok · $
                          {sessionTokenLedger.totalShadowCostUsd.toFixed(4)}
                        </div>
                      </div>
                    </div>

                    {/* =============================================================
                        V3 PHASE 7: REAL-TIME 1-CIRCLE TOKEN & SHADOW COST TELEMETRY HUD
                       ============================================================= */}
                    {executiveSubView === 'tokens' && (
                    <div className="space-y-4">
                      {/* =============================================================
                          V4 PHASE 12: ZERO-BASED PER-AGENT & CHAT TOKEN TELEMETRY LEDGER
                         ============================================================= */}
                      <div className="rounded-2xl border border-sky-500/40 bg-slate-950 p-4 space-y-4 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                          <div className="space-y-0.5">
                            <div className="inline-flex items-center gap-2 font-extrabold text-sky-300">
                              <AgencyUiIcon name="activity" className="w-4 h-4 text-sky-400" />
                              <span>
                                Zero-Based Live Session Token Ledger (Chat Box + All 36 AI Employees)
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Starts strictly at <strong className="text-emerald-300">0 tokens ($0.0000)</strong> and increments in real time per API call · Active Slot:{' '}
                              <span className="font-mono font-bold text-sky-300">
                                {sessionTokenLedger.activeKeySlot}
                              </span>
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[10.5px] font-mono text-slate-400">
                              Calls: <strong className="text-white">{sessionTokenLedger.totalApiCalls}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={handleResetSessionTokenLedger}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 px-3 py-1.5 text-[11px] font-extrabold text-rose-300 transition"
                            >
                              <AgencyUiIcon name="refresh" className="w-3.5 h-3.5" />
                              <span>Reset Session to 0</span>
                            </button>
                          </div>
                        </div>

                        {/* 4 Zero-Based Live Session KPI Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                            <div className="text-[10.5px] text-slate-400">Session Total Tokens</div>
                            <div className="text-lg font-extrabold font-mono text-white mt-0.5">
                              {sessionTokenLedger.totalSessionTokens.toLocaleString()}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                              In: {sessionTokenLedger.totalPromptTokens.toLocaleString()} · Out:{' '}
                              {sessionTokenLedger.totalCompletionTokens.toLocaleString()}
                            </div>
                          </div>
                          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                            <div className="text-[10.5px] text-slate-400">Shadow Commercial Cost</div>
                            <div className="text-lg font-extrabold font-mono text-emerald-300 mt-0.5">
                              ${sessionTokenLedger.totalShadowCostUsd.toFixed(4)}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                              Model: {sessionTokenLedger.activeModelId}
                            </div>
                          </div>
                          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                            <div className="text-[10.5px] text-slate-400">Actual Billed Cost</div>
                            <div className="text-lg font-extrabold font-mono text-sky-300 mt-0.5">
                              ${sessionTokenLedger.totalActualCostUsd.toFixed(4)}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                              {isFreeTierKeyMode ? 'Free API Key ($0 billed)' : 'Commercial Paid Key'}
                            </div>
                          </div>
                          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                            <div className="text-[10.5px] text-slate-400">Chat Box &amp; Active Agents</div>
                            <div className="text-lg font-extrabold font-mono text-amber-300 mt-0.5">
                              {sessionTokenLedger.chatBoxTokens.toLocaleString()} tok
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                              Active Agents: {sessionTokenLedger.activeAgentsCount} / 36
                            </div>
                          </div>
                        </div>

                        {/* Filter & Search Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/80 p-1 gap-1">
                            {(
                              [
                                { id: 'all', label: `All (${sessionTokenLedger.rows.length})` },
                                {
                                  id: 'active',
                                  label: `Active Only (${
                                    sessionTokenLedger.rows.filter((r) => r.totalTokens > 0).length
                                  })`,
                                },
                                { id: 'chat', label: 'Chat Box Only' },
                              ] as const
                            ).map((tab) => (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => setLedgerFilterMode(tab.id)}
                                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                                  ledgerFilterMode === tab.id
                                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={ledgerSearchQuery}
                            onChange={(e) => setLedgerSearchQuery(e.target.value)}
                            placeholder="Filter by agent, department, or KEY_SLOT..."
                            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:border-sky-400 focus:outline-none w-64"
                          />
                        </div>

                        {/* 37-Row Per-Agent & Chat Box Zero-Based Token Table */}
                        <div className="overflow-x-auto max-h-[380px] overflow-y-auto rounded-xl border border-slate-800/80">
                          <table className="w-full text-left border-collapse text-[11px]">
                            <thead className="sticky top-0 bg-slate-900 z-10">
                              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                                <th className="py-2 px-3">Agent / Channel</th>
                                <th className="py-2 px-2">Department</th>
                                <th className="py-2 px-2">API Key Slot</th>
                                <th className="py-2 px-2 text-right">Calls</th>
                                <th className="py-2 px-2 text-right">Prompt</th>
                                <th className="py-2 px-2 text-right">Output</th>
                                <th className="py-2 px-2 text-right">Total Tok</th>
                                <th className="py-2 px-2 text-right">Shadow ($)</th>
                                <th className="py-2 px-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900">
                              {sessionTokenLedger.rows
                                .filter((row) => {
                                  if (ledgerFilterMode === 'active' && row.totalTokens === 0)
                                    return false;
                                  if (ledgerFilterMode === 'chat' && !row.isChatBox) return false;
                                  const q = ledgerSearchQuery.trim().toLowerCase();
                                  if (!q) return true;
                                  return (
                                    row.displayName.toLowerCase().includes(q) ||
                                    row.departmentName.toLowerCase().includes(q) ||
                                    row.apiKeySlot.toLowerCase().includes(q)
                                  );
                                })
                                .map((row) => (
                                  <tr
                                    key={row.rowId}
                                    className={`hover:bg-slate-900/60 ${
                                      row.isChatBox ? 'bg-sky-950/20' : ''
                                    }`}
                                  >
                                    <td className="py-2 px-3">
                                      <div className="font-bold text-white flex items-center gap-1.5">
                                        {row.isChatBox && (
                                          <span className="rounded bg-sky-500/20 border border-sky-400/40 px-1.5 py-0.2 text-[9px] font-mono text-sky-300">
                                            CHAT
                                          </span>
                                        )}
                                        <span>{row.displayName}</span>
                                      </div>
                                      <div className="text-[10px] text-slate-500 truncate max-w-[260px]">
                                        {row.lastActionSummary}
                                      </div>
                                    </td>
                                    <td className="py-2 px-2 text-slate-300">
                                      {row.departmentName}
                                    </td>
                                    <td className="py-2 px-2">
                                      <span className="rounded bg-slate-900 border border-slate-700/80 px-1.5 py-0.5 text-[9.5px] font-mono text-sky-300">
                                        {row.apiKeySlot}
                                      </span>
                                    </td>
                                    <td className="py-2 px-2 text-right font-mono text-slate-300">
                                      {row.apiCallsCount}
                                    </td>
                                    <td className="py-2 px-2 text-right font-mono text-slate-300">
                                      {row.promptTokens.toLocaleString()}
                                    </td>
                                    <td className="py-2 px-2 text-right font-mono text-slate-300">
                                      {row.completionTokens.toLocaleString()}
                                    </td>
                                    <td className="py-2 px-2 text-right font-mono font-bold text-sky-300">
                                      {row.totalTokens.toLocaleString()}
                                    </td>
                                    <td className="py-2 px-2 text-right font-mono font-bold text-emerald-300">
                                      ${row.shadowCostUsd.toFixed(4)}
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                      <span
                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold ${
                                          row.status === 'active'
                                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                            : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                                        }`}
                                      >
                                        <span
                                          className={`h-1.5 w-1.5 rounded-full ${
                                            row.status === 'active'
                                              ? 'bg-emerald-400'
                                              : 'bg-slate-500'
                                          }`}
                                        />
                                        {row.status === 'active' ? 'Metered' : 'Idle'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Recent Real-Time Metered Events */}
                        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 space-y-2">
                          <div className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider">
                            Live Metered Event Feed ({sessionTokenLedger.recentEvents.length})
                          </div>
                          {sessionTokenLedger.recentEvents.length === 0 ? (
                            <p className="text-[11px] text-slate-400">
                              Session initialized at 0 tokens ($0.0000). Send a chat command, score live keywords, or click &ldquo;Meter 1 Full Circle Now&rdquo; below to watch real-time per-agent token increments.
                            </p>
                          ) : (
                            <div className="space-y-1.5 max-h-36 overflow-y-auto">
                              {sessionTokenLedger.recentEvents.slice(0, 8).map((ev) => (
                                <div
                                  key={ev.eventId}
                                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-950/70 border border-slate-800/80 px-2.5 py-1.5 text-[10.5px]"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono text-sky-300 shrink-0">
                                      {ev.apiKeySlot}
                                    </span>
                                    <span className="font-bold text-white shrink-0">
                                      {ev.actorName}
                                    </span>
                                    <span className="text-slate-400 truncate max-w-[320px]">
                                      {ev.actionLabel}
                                    </span>
                                  </div>
                                  <span className="font-mono font-bold text-emerald-300 shrink-0">
                                    +{ev.totalTokens.toLocaleString()} tok · $
                                    {ev.shadowCostUsd.toFixed(4)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* =============================================================
                          1-CIRCLE REFERENCE UNIT ECONOMICS & MODEL SWITCHER (PHASE 7)
                         ============================================================= */}
                      <div className="rounded-2xl border border-emerald-500/40 bg-slate-950 p-4 space-y-4 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                        <div className="space-y-0.5">
                          <div className="inline-flex items-center gap-2 font-extrabold text-emerald-300">
                            <AgencyUiIcon name="cpu" className="w-4 h-4 text-emerald-400" />
                            <span>
                              Real-Time 1-Circle LLM Token &amp; Shadow Cost Telemetry Meter (Phase 7)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {llmGatewayNote} · Gross Margin:{' '}
                            <strong className="text-emerald-300">
                              {activeTelemetry.grossMarginAt49UsdPlanPercent}%
                            </strong>{' '}
                            (on $49/mo plan) or{' '}
                            <strong className="text-sky-300">
                              {activeTelemetry.grossMarginAt149UsdSeoAiTierPercent}%
                            </strong>{' '}
                            (vs SEO.AI $149/mo tier)
                          </p>
                        </div>

                        {/* Model Switcher + Free/Paid Toggle + Run Live Circle Audit */}
                        <form
                          onSubmit={handleRunLiveCircleTokenAudit}
                          className="flex flex-wrap items-center gap-2"
                        >
                          <select
                            value={selectedLlmModel}
                            onChange={(e) =>
                              setSelectedLlmModel(e.target.value as AgencyLlmModelId)
                            }
                            className="rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[11px] font-bold text-sky-300 focus:border-sky-400 focus:outline-none"
                            aria-label="Select LLM model for token telemetry"
                          >
                            {Object.values(MODEL_PRICING_CATALOG).map((m) => (
                              <option key={m.modelId} value={m.modelId}>
                                {m.displayName} (${m.inputUsdPer1M}/1M in · ${m.outputUsdPer1M}
                                /1M out)
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => setIsFreeTierKeyMode((prev) => !prev)}
                            className={`rounded-xl border px-2.5 py-1.5 text-[11px] font-extrabold transition ${
                              isFreeTierKeyMode
                                ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300'
                                : 'border-amber-400/50 bg-amber-500/15 text-amber-300'
                            }`}
                          >
                            {isFreeTierKeyMode
                              ? 'Free API Key ($0 Billed + Shadow Meter)'
                              : 'Paid Commercial Key Mode'}
                          </button>

                          <input
                            type="password"
                            value={testApiKeyInput}
                            onChange={(e) => setTestApiKeyInput(e.target.value)}
                            placeholder="Optional test key (AIza... / gsk_... / sk-...)"
                            className="rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:border-sky-400 focus:outline-none w-52"
                          />

                          <button
                            type="submit"
                            disabled={isRunningTokenAudit}
                            className="rounded-xl bg-emerald-400 hover:bg-emerald-300 px-3 py-1.5 text-[11px] font-extrabold text-slate-950 transition disabled:opacity-50"
                          >
                            {isRunningTokenAudit
                              ? 'Metering Circle...'
                              : 'Meter 1 Full Circle Now'}
                          </button>
                        </form>
                      </div>

                      {/* 5-Stage Token & Mechanical Breakdown Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 font-mono">
                              <th className="py-2 pr-3">Circle Stage &amp; Department</th>
                              <th className="py-2 pr-3">
                                Zero-Cost Mechanical Work (90% · $0.00)
                              </th>
                              <th className="py-2 pr-3 text-right">Prompt Tok</th>
                              <th className="py-2 pr-3 text-right">Output Tok</th>
                              <th className="py-2 pr-3 text-right">Total Tok</th>
                              <th className="py-2 text-right">Shadow Paid Cost</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900">
                            {activeTelemetry.stages.map((st) => (
                              <tr key={st.stageNumber} className="hover:bg-slate-900/50">
                                <td className="py-2.5 pr-3">
                                  <div className="font-extrabold text-white">
                                    Stage {st.stageNumber} · {st.departmentName}
                                  </div>
                                  <div className="text-[10.5px] text-slate-400">
                                    {st.taskDescription}
                                  </div>
                                </td>
                                <td className="py-2.5 pr-3">
                                  <div className="flex flex-wrap gap-1">
                                    {st.mechanicalZeroCostTasks.map((mTask) => (
                                      <span
                                        key={mTask}
                                        className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[10px] text-emerald-300"
                                      >
                                        {mTask}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-2.5 pr-3 text-right font-mono text-slate-300">
                                  {st.promptTokens.toLocaleString()}
                                </td>
                                <td className="py-2.5 pr-3 text-right font-mono text-slate-300">
                                  {st.completionTokens.toLocaleString()}
                                </td>
                                <td className="py-2.5 pr-3 text-right font-mono font-bold text-sky-300">
                                  {st.totalTokens.toLocaleString()}
                                </td>
                                <td className="py-2.5 text-right font-mono font-bold text-emerald-300">
                                  ${st.shadowPaidCostUsd.toFixed(4)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t border-slate-800 font-mono font-extrabold text-white">
                              <td className="pt-2.5 pr-3" colSpan={2}>
                                Total for 1 Complete End-to-End Agency Circle (All 36 Agents)
                              </td>
                              <td className="pt-2.5 pr-3 text-right text-slate-300">
                                {activeTelemetry.totalPromptTokens.toLocaleString()}
                              </td>
                              <td className="pt-2.5 pr-3 text-right text-slate-300">
                                {activeTelemetry.totalCompletionTokens.toLocaleString()}
                              </td>
                              <td className="pt-2.5 pr-3 text-right text-sky-300">
                                {activeTelemetry.totalCircleTokens.toLocaleString()} tok
                              </td>
                              <td className="pt-2.5 text-right text-emerald-300">
                                ${activeTelemetry.singleCircleShadowCostUsd.toFixed(4)} (Billed: $
                                {activeTelemetry.singleCircleActualCostUsd.toFixed(4)})
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      </div>
                    </div>

                    )}

                    {/* =============================================================
                        V3 PHASE 8: 3-LAYER AGENT MEMORY BUS, USER-TAUGHT SKILLS & SELECTIVE INTERRUPTS
                       ============================================================= */}
                    {executiveSubView === 'memory' && (
                    <div className="rounded-2xl border border-purple-500/40 bg-slate-950 p-4 space-y-4 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <div className="inline-flex items-center gap-2 font-extrabold text-purple-300">
                            <AgencyUiIcon name="sparkle" className="w-4 h-4 text-purple-400" />
                            <span>
                              3-Layer Trainable Agent Memory &amp; Selective Workflow Interruption (Phase 8)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Teach permanent custom skills to any specialist or override a single visual asset—only the targeted agents wake up while up to 34/36 other agents continue working uninterrupted.
                          </p>
                        </div>
                        <span className="rounded-xl border border-purple-500/40 bg-purple-500/15 px-3 py-1 text-[11px] font-mono font-bold text-purple-200">
                          {memoryStore.learnedSkills.length} Learned Skills ·{' '}
                          {memoryStore.sharedMemoryEvents.length} Memory Bus Events
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Left: Teach Permanent Custom Skill to Any Specialist */}
                        <form
                          onSubmit={handleTeachSkillFromForm}
                          className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 space-y-2.5"
                        >
                          <div className="font-extrabold text-sky-300">
                            1. Teach Permanent Custom Skill Rule (Layer 2 Memory):
                          </div>
                          <select
                            value={newSkillAgentId}
                            onChange={(e) => setNewSkillAgentId(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-[11px] font-bold text-slate-200"
                            aria-label="Select specialist agent to train"
                          >
                            {allFlatEmployees.map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.name} ({emp.departmentBadge})
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newSkillRuleInput}
                              onChange={(e) => setNewSkillRuleInput(e.target.value)}
                              placeholder='e.g. "Always include a 3-row pricing table in every H2 section"'
                              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-[11px] text-white placeholder-slate-500"
                            />
                            <button
                              type="submit"
                              className="rounded-xl bg-purple-500 hover:bg-purple-400 px-3.5 py-1.5 text-[11px] font-extrabold text-slate-950 shrink-0 transition"
                            >
                              Teach Skill
                            </button>
                          </div>

                          <div className="space-y-1.5 pt-1 max-h-28 overflow-y-auto">
                            {memoryStore.learnedSkills.slice(0, 4).map((sk) => (
                              <div
                                key={sk.id}
                                className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-[10.5px] text-slate-300"
                              >
                                <strong className="text-purple-300">{sk.agentName}:</strong>{' '}
                                {sk.skillRuleText}
                              </div>
                            ))}
                          </div>
                        </form>

                        {/* Right: Selective Visual Asset Override & Shared Memory Bus Log */}
                        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 space-y-2.5">
                          <div className="font-extrabold text-emerald-300">
                            2. Selective Custom Asset Override &amp; Shared Memory Bus:
                          </div>
                          <form
                            onSubmit={handleSelectiveCustomAssetUpload}
                            className="flex gap-2"
                          >
                            <input
                              type="text"
                              value={customAssetTitleInput}
                              onChange={(e) => setCustomAssetTitleInput(e.target.value)}
                              placeholder='Custom image label (e.g. "Founder Dashboard Screenshot 2:3")'
                              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-[11px] text-white placeholder-slate-500"
                            />
                            <button
                              type="submit"
                              className="rounded-xl bg-sky-500 hover:bg-sky-400 px-3 py-1.5 text-[11px] font-extrabold text-slate-950 shrink-0 transition"
                            >
                              Selective Override
                            </button>
                          </form>

                          <div className="space-y-1.5 pt-1 max-h-36 overflow-y-auto">
                            {memoryStore.sharedMemoryEvents.slice(0, 4).map((ev) => (
                              <div
                                key={ev.id}
                                className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-[10.5px] text-slate-300"
                              >
                                <span className="font-mono text-emerald-300 font-bold">
                                  [{ev.eventType}]
                                </span>{' '}
                                {ev.summary}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    )}

                    {/* =============================================================
                        V3 PHASE 10: STAGGERED 24/7 AUTONOMOUS HEARTBEAT SCHEDULER
                       ============================================================= */}
                    {executiveSubView === 'heartbeat' && heartbeatSchedule && (
                      <div className="rounded-2xl border border-sky-500/40 bg-slate-950 p-4 space-y-3 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                          <div>
                            <span className="font-extrabold text-sky-300">
                              Staggered 24/7 Autonomous Heartbeat Scheduler (Phase 10 — Zero Rate-Limit Collisions)
                            </span>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Staggers background department jobs across 2h, 4h, 6h, 12h, and 24h windows so Free-Tier and Paid API keys never hit RPM spikes.
                            </p>
                          </div>
                          <span className="rounded-xl bg-sky-500/15 border border-sky-500/30 px-3 py-1 font-mono font-bold text-sky-300">
                            Est. Daily Total: {heartbeatSchedule.totalDailyTokensEstimate.toLocaleString()} tok · $
                            {heartbeatSchedule.totalDailyShadowCostUsd.toFixed(4)}/day
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                          {heartbeatSchedule.slots.map((slot) => (
                            <div
                              key={slot.slotId}
                              className={`rounded-xl border p-3 flex flex-col justify-between gap-2 ${
                                slot.isEnabled
                                  ? 'border-slate-800 bg-slate-900/80'
                                  : 'border-slate-900 bg-slate-950/40 opacity-60'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-mono font-extrabold text-emerald-300">
                                    {slot.cadenceLabel}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {slot.llmTokenBudgetPerRun} tok
                                  </span>
                                </div>
                                <div className="font-extrabold text-white text-[11.5px] leading-snug">
                                  {slot.taskTitle}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {slot.lastExecutedLabel}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleHeartbeatSlot(slot.slotId)}
                                className={`w-full rounded-lg py-1 text-[10.5px] font-extrabold transition ${
                                  slot.isEnabled
                                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {slot.isEnabled ? '✓ Active (24/7)' : 'Paused'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 24-Hour Daily Agency Throughput & Telemetry Bar Graph */}
                    {executiveSubView === 'overview' && (
                    <>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-extrabold text-sky-300">
                          24-Hour Autonomous Department Throughput &amp; Verification Graph
                        </span>
                        <div className="flex items-center gap-3 text-[10px]">
                          <span className="text-amber-300">■ Keywords Scored</span>
                          <span className="text-purple-300">■ Sections &amp; SVGs</span>
                          <span className="text-emerald-300">■ SEO &amp; QA Checks</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-2 pt-2 items-end h-28">
                        {dailyTelemetrySeries.map((pt) => {
                          const hPct = Math.min(100, Math.max(18, pt.seoChecksPassed + 20));
                          return (
                            <div
                              key={pt.timeLabel}
                              className="flex flex-col items-center justify-end h-full gap-1.5"
                            >
                              <div className="w-full flex items-end justify-center gap-1 h-20">
                                <div
                                  className="w-2.5 rounded-t bg-amber-400/85"
                                  style={{
                                    height: `${Math.min(100, pt.keywordsScored * 1.8)}%`,
                                  }}
                                  title={`Keywords: ${pt.keywordsScored}`}
                                />
                                <div
                                  className="w-2.5 rounded-t bg-purple-400/85"
                                  style={{
                                    height: `${Math.min(100, pt.svgsRendered * 2.5)}%`,
                                  }}
                                  title={`SVGs: ${pt.svgsRendered}`}
                                />
                                <div
                                  className="w-2.5 rounded-t bg-emerald-400/90"
                                  style={{ height: `${hPct}%` }}
                                  title={`SEO Checks: ${pt.seoChecksPassed}`}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">
                                {pt.timeLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Live 6-Stage Inter-Agent Handoff Packet Strip */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-extrabold text-emerald-300">
                          Active Inter-Agent Handoff (Stage {activeHandoffStage}/6 ·{' '}
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
                        <span className="inline-flex items-center gap-1.5 font-extrabold text-amber-300 uppercase tracking-wider">
                          <AgencyUiIcon name="alert-triangle" className="w-4 h-4" />
                          <span>
                            Founder Manual Action Queue ({manualActionAlerts.length})
                          </span>
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
                    </>
                    )}
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 2: KEYWORD & TOPIC STRATEGIST + PHASE 9 GOOGLE ADS RSA BUILDER
                 ------------------------------------------------------------- */}
              {activeSidebarTab === 'keyword-strategist' && (
                <div className="rounded-2xl border border-amber-500/35 bg-slate-900/80 p-5 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                        Department 1 · Keyword &amp; Topic Strategist + Google Ads RSA Agent
                      </span>
                      <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                        Live Keyword Discovery, KD Scoring &amp; Google Ads RSA Builder (15 Headlines &le;30c)
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSidebarTab('content-writing')}
                      className="rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs font-extrabold text-slate-950 transition"
                    >
                      Open Content Writing Studio →
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
                      placeholder={`Enter any seed keyword or topic for ${activeWebsite.siteName} (e.g. "ai technical seo audit")...`}
                      className="flex-1 min-w-[240px] rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isScoringKeywords}
                      className="rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:brightness-110 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg transition disabled:opacity-50"
                    >
                      {isScoringKeywords
                        ? 'Scraping Web Autocomplete & Scoring KD...'
                        : 'Run Live Autocomplete + DoItWithAI KD Scorer'}
                    </button>
                  </form>

                  {/* Newly Scored Live Keyword Briefs */}
                  {liveScoredBriefs.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-xs font-extrabold text-emerald-300">
                        Newly Scored Live Autocomplete Briefs (Ready for 1-Click Handoff):
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
                                  Vol: {brief.estimatedMonthlyVolume}/mo · CPC{' '}
                                  {brief.cpcEstimateUsd}
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
                              Hand Off Brief to Content Production Manager →
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
                              Cluster #{idx + 1} · KD {job.kdProxyScore}/100
                            </span>
                            <span className="text-[11px] font-bold text-sky-300">
                              {job.searchIntent}
                            </span>
                          </div>
                          <div className="text-sm font-extrabold text-white">
                            &ldquo;{job.primaryKeyword}&rdquo;
                          </div>
                          <div className="text-xs text-slate-300">
                            <strong>H1 Title:</strong> {job.topicTitle}
                          </div>
                          <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 space-y-1 text-[11px] text-slate-300">
                            {job.outlineSections.map((sec, sIdx) => (
                              <div key={sec.h2 + sIdx} className="truncate">
                                H2.{sIdx + 1}: {sec.h2}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                          <span className="text-[11px] text-emerald-300 font-semibold">
                            {job.status === 'queued'
                              ? 'Queued for Handoff'
                              : 'Handed Off to Content Studio'}
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
                              ? 'Start Writing Now →'
                              : 'Inspect in Studio →'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* V3 PHASE 9: GOOGLE ADS RESPONSIVE SEARCH ADS (RSA) & KEYWORD CAMPAIGN BUILDER */}
                  <div className="rounded-2xl border border-sky-500/40 bg-slate-950 p-5 space-y-4 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <span className="rounded bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-300 uppercase">
                          SEO.AI ($149/mo) Challenger · Google Ads RSA Builder Sub-Agent (Phase 9)
                        </span>
                        <h3 className="text-base font-extrabold text-white mt-1">
                          {activeGoogleAdsPack.campaignName} ·{' '}
                          <span className="text-emerald-300">
                            {activeGoogleAdsPack.estimatedQualityScore}
                          </span>
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            activeGoogleAdsPack.googleAdsEditorCsv,
                            'copy-gads-csv'
                          )
                        }
                        className="rounded-xl bg-sky-500 hover:bg-sky-400 px-3.5 py-2 font-extrabold text-slate-950 transition"
                      >
                        {copiedId === 'copy-gads-csv'
                          ? 'Copied Google Ads Editor CSV'
                          : 'Copy Google Ads Editor CSV'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* 15 RSA Headlines (Strictly <= 30 chars) */}
                      <div className="lg:col-span-7 space-y-2">
                        <div className="font-extrabold text-amber-300">
                          15 Character-Validated RSA Headlines (&le; 30 chars each):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activeGoogleAdsPack.headlines15.map((hl) => (
                            <div
                              key={hl.slotNumber}
                              className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <div className="text-[10px] text-slate-400 font-mono">
                                  H{hl.slotNumber} · {hl.intentAngle}
                                </div>
                                <div className="font-bold text-white truncate">
                                  {hl.text}
                                </div>
                              </div>
                              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-mono text-emerald-300 shrink-0">
                                {hl.charCount}/30
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4 RSA Descriptions (Strictly <= 90 chars) + Keywords & Negatives */}
                      <div className="lg:col-span-5 space-y-3">
                        <div className="font-extrabold text-emerald-300">
                          4 RSA Descriptions (&le; 90 chars each):
                        </div>
                        <div className="space-y-2">
                          {activeGoogleAdsPack.descriptions4.map((desc) => (
                            <div
                              key={desc.slotNumber}
                              className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 space-y-1"
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                                <span>
                                  D{desc.slotNumber} · {desc.focusAngle}
                                </span>
                                <span className="text-sky-300">
                                  {desc.charCount}/90 chars
                                </span>
                              </div>
                              <div className="text-white font-semibold">
                                {desc.text}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-2">
                          <div className="font-extrabold text-sky-300">
                            Exact/Phrase Bid Syntax &amp; Negative Exclusions:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {activeGoogleAdsPack.keywordTargets.map((kt) => (
                              <span
                                key={kt.formattedGoogleAdsSyntax}
                                className="rounded bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 text-[10.5px] font-mono text-sky-200"
                              >
                                {kt.formattedGoogleAdsSyntax} ({kt.suggestedMaxCpcUsd})
                              </span>
                            ))}
                          </div>
                          <div className="text-[10.5px] text-rose-300 font-mono">
                            Negative Keywords:{' '}
                            {activeGoogleAdsPack.negativeKeywords
                              .map((n) => `-${n}`)
                              .join(', ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 3: CONTENT WRITING STUDIO (PUBLISHED / WRITING / NOT STARTED BOXES)
                 ------------------------------------------------------------- */}
              {activeSidebarTab === 'content-writing' && (
                <div className="space-y-5">
                  <AiVisibilityAndLauncherPanel
                    siteUrl={activeWebsite.siteUrl}
                    siteName={activeWebsite.siteName}
                    primaryNiche={activeWebsite.primaryNiche}
                    isLightTheme={isLightTheme}
                    initialSubTab="launcher"
                    onQueueLaunchPlan={(plan) => {
                      if (!studioState || !activeCampaign) return;
                      const templateJob = activeCampaign.jobs[0];
                      if (!templateJob) return;
                      const nowIso = new Date().toISOString();
                      const newJob: AutomatedArticleJob = {
                        ...templateJob,
                        id: `job-launch-${Date.now()}`,
                        topicTitle: plan.recommendedH1,
                        primaryKeyword: plan.primaryKeyword,
                        secondaryKeywords: plan.paaQuestions.slice(0, 3),
                        kdProxyScore: plan.estimatedKdScore,
                        urlSlug: plan.urlSlug,
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
                      setStatusToast(
                        `Queued "${plan.recommendedH1}" (${plan.mode}) in Content Studio.`
                      );
                    }}
                  />
                  <div className="rounded-2xl border border-purple-500/35 bg-slate-900/80 p-5 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-300">
                          Department 2 · Content Production Studio
                        </span>
                        <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                          Article Pipeline ({publishedOrDraftJobs.length}{' '}
                          {isInternalSite ? 'Published' : 'Drafts Ready'} ·{' '}
                          {activelyWritingJobs.length} Writing · {notYetStartedJobs.length}{' '}
                          Queued)
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void handleOpenInContentWriterStudio(selectedArticle)
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 hover:brightness-110 px-4 py-2 text-xs font-extrabold text-slate-950 shadow-lg transition"
                      >
                        <AgencyUiIcon name="external-link" className="w-3.5 h-3.5" />
                        <span>Open in AI Content Writer Studio</span>
                      </button>
                    </div>

                    {/* Unique Status Boxes Grid */}
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
                          'Step 1/5 · Keyword Handoff Brief Locked',
                          'Step 2/5 · Rendering 1200×675 Featured Hero SVG',
                          'Step 3/5 · Drafting H2 Sections & 50w AEO Lead',
                          'Step 4/5 · Verifying <580px Meta & Internal Links',
                          'Step 5/5 · Compiling @graph Schema & QA Gate',
                        ];

                        return (
                          <div
                            key={job.id}
                            className={`rounded-2xl border p-4 flex flex-col justify-between gap-4 transition ${
                              isWriting
                                ? 'border-sky-400 bg-sky-950/30 shadow-lg'
                                : isDone
                                  ? 'border-emerald-500/45 bg-slate-950/90'
                                  : 'border-slate-800 border-dashed bg-slate-950/45 opacity-85'
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
                                      ? 'PUBLISHED LIVE'
                                      : 'DRAFT READY'}
                                  </span>
                                )}
                                {isWriting && (
                                  <span className="rounded-full bg-sky-400 text-slate-950 px-2.5 py-0.5 text-[10px] font-extrabold animate-pulse">
                                    ACTIVELY WRITING
                                  </span>
                                )}
                                {isNotStarted && (
                                  <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-400">
                                    NOT YET STARTED
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
                                    • 50-Word AEO Lead &amp; {job.outlineSections.length} H2
                                    Sections
                                  </div>
                                  <div>
                                    • 1 Hero Banner + 4× 1080×1350 Section SVGs
                                  </div>
                                  <div>• Meta Tags, Internal Links &amp; @graph Schema</div>
                                </div>
                              )}

                              {isNotStarted && (
                                <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-2.5 text-[11px] text-slate-400">
                                  Queued for Keyword Strategist handoff &amp; Content Manager
                                  slot.
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
                                  Start Writing via Agency Pipeline →
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedArticleId(job.id)}
                                    className="flex-1 rounded-xl border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 py-1.5 px-2.5 text-[11px] font-bold text-sky-200"
                                  >
                                    Inspect Draft
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleOpenInContentWriterStudio(job)
                                    }
                                    className="rounded-xl bg-slate-800 hover:bg-slate-700 py-1.5 px-2.5 text-[11px] font-bold text-emerald-300"
                                  >
                                    Edit in Studio →
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
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 font-bold text-sky-300"
                          >
                            <AgencyUiIcon
                              name={copiedId === 'copy-active-article' ? 'check' : 'copy'}
                              className="w-3.5 h-3.5"
                            />
                            <span>
                              {copiedId === 'copy-active-article'
                                ? 'Copied Markdown'
                                : 'Copy Full Article Markdown'}
                            </span>
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
                  TAB 4: GRAPHIC & VISUAL DESIGNER DEPARTMENT (ALL 4 SECTION SVGS + HERO)
                 ------------------------------------------------------------- */}
              {activeSidebarTab === 'graphic-design' && selectedArticle && (
                <div className="rounded-2xl border border-pink-500/35 bg-slate-900/80 p-5 space-y-6">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-pink-300">
                      Department 3 · Visual &amp; SVG Infographic Studio
                    </span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                      Featured Hero Image (1200×675) &amp; All 4× Standalone 6-Layer Section Infographics (1080×1350)
                    </h2>
                  </div>

                  {/* Featured Hero Image Preview */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-extrabold text-sky-300">
                        1. Featured Hero Banner SVG ({selectedArticle.topicTitle}):
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            renderFeaturedHeroImageSvg(selectedArticle, activeWebsite),
                            'copy-hero-svg'
                          )
                        }
                        className="rounded-lg bg-slate-800 px-3 py-1 text-[11px] font-bold text-emerald-300"
                      >
                        {copiedId === 'copy-hero-svg'
                          ? 'Copied Hero SVG'
                          : 'Copy 1200×675 Hero SVG'}
                      </button>
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

                  {/* All 4 Section Infographics Grid */}
                  <div className="space-y-3">
                    <div className="text-xs font-extrabold text-emerald-300">
                      2. All 4× Standalone 6-Layer Section Infographics (1080×1350 Vector Cards · 0.00 CLS):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {selectedArticle.outlineSections.slice(0, 4).map((sec, idx) => {
                        const svg = renderSectionInfographicSvg(sec, {
                          sectionIndex: idx,
                          totalSections: selectedArticle.outlineSections.length,
                          brandName: activeWebsite.siteName,
                          brandPrimaryHex: activeWebsite.brandPrimaryHex,
                          brandSecondaryHex: activeWebsite.brandSecondaryHex,
                        });
                        const copyKey = `copy-sec-svg-${idx}`;
                        return (
                          <div
                            key={sec.h2 + idx}
                            className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex flex-col items-center justify-between gap-2.5"
                          >
                            <div className="text-xs font-bold text-white truncate max-w-full">
                              H2.{idx + 1}: {sec.h2}
                            </div>
                            <div
                              className="w-full max-w-[240px] rounded-lg overflow-hidden [&_svg]:w-full [&_svg]:h-auto"
                              dangerouslySetInnerHTML={{ __html: svg }}
                            />
                            <button
                              type="button"
                              onClick={() => handleCopy(svg, copyKey)}
                              className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 py-1.5 text-[10.5px] font-bold text-sky-300"
                            >
                              {copiedId === copyKey
                                ? 'Copied SVG'
                                : `Copy Section ${idx + 1} SVG`}
                            </button>
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
                <div className="space-y-5">
                  <OnPageAndCompetitorGapPanel
                    siteUrl={activeWebsite.siteUrl}
                    siteName={activeWebsite.siteName}
                    primaryNiche={activeWebsite.primaryNiche}
                    isLightTheme={isLightTheme}
                    workspacePages={activeCampaign.jobs.slice(0, 6).map((j) => ({
                      urlPath: `/blog/${j.urlSlug}`,
                      pageTitle: j.topicTitle,
                      targetKeyword: j.primaryKeyword,
                      kdScore: j.kdProxyScore,
                    }))}
                    onAssignIdeaToAgent={(idea, pageUrl) => {
                      setChatTargetAgentId(idea.recommendedAgentId);
                      setIsChatDrawerExpanded(true);
                      setStatusToast(
                        `Assigned "${idea.title}" (${pageUrl}) to ${idea.recommendedAgentName}.`
                      );
                    }}
                    onLaunchKeywordArticle={(keyword, recommendedH1) => {
                      setLiveSeedQuery(keyword);
                      setActiveSidebarTab('content-writing');
                      setStatusToast(
                        `Prepared "${recommendedH1}" for Content Production Studio.`
                      );
                    }}
                  />
                  <div className="rounded-2xl border border-emerald-500/35 bg-slate-900/80 p-5 space-y-5">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
                      Department 4 · On-Page SEO &amp; Content Decay Refresh
                    </span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                      Meta Tags, Internal Link Graph, @graph JSON-LD &amp; 2026 Article Refreshes
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
                            {copiedId === item.id ? 'Copied' : 'Copy Code'}
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
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 6: OFF-PAGE SEO, DIGITAL PR & V3 PHASE 9 BACKLINK EXCHANGE CLUB
                 ------------------------------------------------------------- */}
              {activeSidebarTab === 'off-page-seo' && (
                <div className="space-y-5">
                  <AiVisibilityAndLauncherPanel
                    siteUrl={activeWebsite.siteUrl}
                    siteName={activeWebsite.siteName}
                    primaryNiche={activeWebsite.primaryNiche}
                    isLightTheme={isLightTheme}
                    initialSubTab="visibility"
                  />
                  <div className="rounded-2xl border border-amber-500/35 bg-slate-900/80 p-5 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                        Department 5 · Off-Page SEO, Digital PR &amp; Verified Backlink Exchange Club
                      </span>
                      <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                        Automatic Non-Competing Backlink Exchange Network (Phase 9) &amp; PR Pitches
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleBacklinkClubOptIn}
                      className={`rounded-xl px-4 py-2 text-xs font-extrabold transition shadow ${
                        activeBacklinkClub.isOptedIn
                          ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                          : 'border border-slate-700 bg-slate-900 text-slate-300'
                      }`}
                    >
                      {activeBacklinkClub.isOptedIn
                        ? 'Backlink Club Active (DR ' +
                          activeBacklinkClub.currentDomainRatingEstimate +
                          ' → DR ' +
                          activeBacklinkClub.projected90DayDomainRating +
                          ')'
                        : 'Enable Backlink Exchange Club'}
                    </button>
                  </div>

                  {/* V3 PHASE 9: THE BACKLINK CLUB PARTNER EXCHANGE GRID */}
                  <div className="rounded-2xl border border-emerald-500/40 bg-slate-950 p-4 space-y-4 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <span className="font-extrabold text-emerald-300">
                          DoItWithAI Verified Niche Link-Exchange Network (&ldquo;The Backlink Club&rdquo; — $0 Marginal Cost)
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Matches non-competing customer websites in adjacent niches (Spam Score &lt; 2%) to weave natural contextual backlinks automatically.
                        </p>
                      </div>
                      <span className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 font-mono font-bold text-emerald-300">
                        {activeBacklinkClub.activeVerifiedBacklinksCount} Active Contextual Links ·{' '}
                        {activeBacklinkClub.monthlyLinkVelocityTarget}/mo Velocity
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeBacklinkClub.matchedPartners.map((partner) => {
                        const isWoven = activeBacklinkClub.wovenPartnerIds.includes(
                          partner.partnerId
                        );
                        return (
                          <div
                            key={partner.partnerId}
                            className={`rounded-2xl border p-4 space-y-3 flex flex-col justify-between ${
                              isWoven
                                ? 'border-emerald-500/50 bg-emerald-950/15'
                                : 'border-slate-800 bg-slate-900/70'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-mono font-extrabold text-sky-300">
                                  DR {partner.domainRating} ·{' '}
                                  {partner.monthlyOrganicTraffic.toLocaleString()}/mo · Spam{' '}
                                  {partner.spamScorePercent}%
                                </span>
                                <span className="text-[10px] font-bold text-amber-300">
                                  {partner.cmsPlatform} · {partner.nonCompetingOverlapScore}% Match
                                </span>
                              </div>
                              <div className="text-sm font-extrabold text-white">
                                {partner.brandName} ({partner.domain})
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Niche: {partner.nicheCategory}
                              </div>

                              <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 space-y-1 text-[10.5px]">
                                <div className="font-bold text-emerald-300">
                                  Inbound Backlink to {activeWebsite.siteName}:
                                </div>
                                <div className="text-slate-300 font-mono break-all">
                                  Anchor: &ldquo;{partner.inboundPlacement.targetAnchorText}&rdquo;
                                </div>
                              </div>

                              <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 space-y-1 text-[10.5px]">
                                <div className="font-bold text-sky-300">
                                  Outbound Contextual Citation (Markdown):
                                </div>
                                <div className="text-slate-300">
                                  {partner.outboundPlacement.contextualParagraphMarkdown}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                              <button
                                type="button"
                                onClick={() =>
                                  handleWeavePartnerLinkPair(
                                    partner.partnerId,
                                    partner.brandName
                                  )
                                }
                                className={`flex-1 rounded-xl py-2 px-3 text-xs font-extrabold transition ${
                                  isWoven
                                    ? 'bg-emerald-400 text-slate-950'
                                    : 'bg-sky-500/20 border border-sky-400/50 text-sky-200 hover:bg-sky-500/30'
                                }`}
                              >
                                {isWoven
                                  ? '✓ Reciprocal Link Pair Active'
                                  : 'Weave Reciprocal Link Pair →'}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopy(
                                    partner.outboundPlacement.contextualParagraphMarkdown,
                                    partner.partnerId
                                  )
                                }
                                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-[11px] font-bold text-slate-200"
                              >
                                {copiedId === partner.partnerId ? 'Copied' : 'Copy MD'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Digital PR & Directory Opportunities */}
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
                            {copiedId === opp.id ? 'Copied' : 'Copy Pitch'}
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
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 7: TECHNICAL & LOCAL ENTITY SEO
                 ------------------------------------------------------------- */}
              {activeSidebarTab === 'technical-seo' && (
                <div className="space-y-5">
                  <SiteAuditSuitePanel
                    defaultSiteUrl={activeWebsite.siteUrl}
                    siteName={activeWebsite.siteName}
                    primaryNiche={activeWebsite.primaryNiche}
                    isLightTheme={isLightTheme}
                    onAssignOpportunityToAgent={(issue) => {
                      setChatTargetAgentId(issue.recommendedAgentId);
                      setIsChatDrawerExpanded(true);
                      setStatusToast(
                        `Assigned "${issue.title}" to ${issue.recommendedAgentName}.`
                      );
                    }}
                  />
                  <div className="rounded-2xl border border-cyan-500/35 bg-slate-900/80 p-5 space-y-5">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300">
                      Department 6 · Technical &amp; Local Entity SEO Architect
                    </span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                      Core Web Vitals (0.00 CLS), AI Crawler robots.txt &amp; Entity Schema
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
                            {copiedId === item.id ? 'Copied' : 'Copy Snippet'}
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
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB 8: SOCIAL MEDIA & TIKTOK / REELS VIDEO SCRIPT FLEET
                 ------------------------------------------------------------- */}
              {activeSidebarTab === 'social-video-fleet' && selectedArticle && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-rose-500/35 bg-slate-900/80 p-5 space-y-6">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-300">
                        Department 8 · Omnichannel Social &amp; Short-Form Video Fleet
                      </span>
                      <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                        60s TikTok/Reels Storyboard, 3× Pinterest 2:3 Pins, 8-Slide LinkedIn Carousel &amp; X Threads
                      </h2>
                    </div>

                    {/* PART 1: TikTok / Reels Short-Form Video Script */}
                    <div className="rounded-2xl border border-sky-500/40 bg-slate-950 p-5 space-y-3 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="rounded bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-300 uppercase">
                            TikTok / Instagram Reels / YouTube Shorts Script Agent
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
                            ? 'Copied TikTok Script'
                            : 'Copy 60s TikTok Script'}
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-900 p-3.5 text-xs text-slate-200 font-mono leading-relaxed">
                        {activeTikTokScript.fullCopyableScript}
                      </pre>
                    </div>

                    {/* PART 2: Interactive 8-Slide LinkedIn Carousel Previewer */}
                    <div className="rounded-2xl border border-indigo-500/40 bg-slate-950 p-5 space-y-4 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="rounded bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-300 uppercase">
                            LinkedIn 8-Slide PDF Carousel Specialist (1080×1350)
                          </span>
                          <h3 className="text-sm font-extrabold text-white mt-1">
                            Interactive 8-Slide Executive Carousel Deck
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {activeLinkedInSlides.map((slide, sIdx) => (
                            <button
                              key={slide.slideNumber}
                              type="button"
                              onClick={() => setActiveLinkedInSlideIdx(sIdx)}
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition ${
                                activeLinkedInSlideIdx === sIdx
                                  ? 'bg-sky-500 text-slate-950'
                                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              Slide {slide.slideNumber}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                        <div className="lg:col-span-5 flex flex-col items-center">
                          <div
                            className="w-full max-w-[270px] rounded-xl overflow-hidden border border-slate-800 [&_svg]:w-full [&_svg]:h-auto"
                            dangerouslySetInnerHTML={{
                              __html: currentLinkedInSlide.renderedSvg,
                            }}
                          />
                        </div>
                        <div className="lg:col-span-7 space-y-3">
                          <div className="text-xs font-extrabold text-sky-300">
                            {currentLinkedInSlide.slideRole}
                          </div>
                          <div className="text-base font-extrabold text-white">
                            {currentLinkedInSlide.headline}
                          </div>
                          <p className="text-slate-300 leading-relaxed">
                            {currentLinkedInSlide.supportingCopy}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                activeLinkedInSlides
                                  .map(
                                    (s) =>
                                      `[Slide ${s.slideNumber}/8 - ${s.slideRole}]\n${s.headline}\n${s.supportingCopy}`
                                  )
                                  .join('\n\n'),
                                'copy-linkedin-deck'
                              )
                            }
                            className="rounded-xl bg-indigo-500 hover:bg-indigo-400 px-4 py-2 font-extrabold text-slate-950"
                          >
                            {copiedId === 'copy-linkedin-deck'
                              ? 'Copied All 8 Slides'
                              : 'Copy All 8 LinkedIn Carousel Slides'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* PART 3: All 3× Tall Pinterest 2:3 Vertical Pins */}
                    <div className="space-y-3">
                      <div className="text-xs font-extrabold text-amber-300">
                        All 3× Tall Pinterest 2:3 Vertical Pins (1000×1500 SVGs + SEO Pin Copy):
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedArticle.pinterestPins.slice(0, 3).map((pin, pIdx) => (
                          <div
                            key={pin.id || pIdx}
                            className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex flex-col items-center justify-between gap-3 text-xs"
                          >
                            <div
                              className="w-full max-w-[210px] rounded-xl overflow-hidden [&_svg]:w-full [&_svg]:h-auto"
                              dangerouslySetInnerHTML={{
                                __html: renderPinterestPinPreviewSvg(
                                  pin,
                                  activeWebsite.siteName
                                ),
                              }}
                            />
                            <div className="w-full space-y-1">
                              <div className="font-bold text-white truncate">
                                {pin.pinTitle}
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-2">
                                {pin.pinDescription}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  `${pin.pinTitle}\n\n${pin.pinDescription}`,
                                  `pin-copy-${pIdx}`
                                )
                              }
                              className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 py-1.5 text-[11px] font-bold text-amber-300"
                            >
                              {copiedId === `pin-copy-${pIdx}`
                                ? 'Copied Pin SEO'
                                : `Copy Pin #${pIdx + 1} Title & Desc`}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* PART 4: X/Threads, Facebook & Instagram Hook Variations */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
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
                              {copiedId === v.id ? 'Copied' : 'Copy Post'}
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
              )}

              {/* -------------------------------------------------------------
                  TAB 9: QA, SPOT-CHECK & V3 PHASE 10 1-CLICK CMS AUTO-PUBLISHING HUB
                 ------------------------------------------------------------- */}
              {activeSidebarTab === 'qa-publishing' && (
                <div className="rounded-2xl border border-emerald-500/35 bg-slate-900/80 p-5 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
                        Department 7 · 150-Point QA Gate, Spot-Check &amp; 1-Click CMS Auto-Publisher (Phases 9 &amp; 10)
                      </span>
                      <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                        150-Point E-E-A-T Gate ({active150PtQaEvaluation.totalScore}/150) &amp; No-Code WordPress / Shopify / Webflow / Webhook Connector
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSpotCheckOptedIn((prev) => !prev);
                        setStatusToast(
                          !isSpotCheckOptedIn
                            ? 'Opt-In Human SEO Specialist Spot-Check enabled for this article draft.'
                            : 'Returned to 100% Private Automated 150-Point Gate mode.'
                        );
                      }}
                      className={`rounded-xl px-4 py-2 text-xs font-extrabold transition shadow ${
                        isSpotCheckOptedIn
                          ? 'bg-sky-400 text-slate-950'
                          : 'border border-emerald-400/50 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
                      }`}
                    >
                      {isSpotCheckOptedIn
                        ? '✓ Opt-In Expert Spot-Check Active'
                        : '100% Private Automated Gate (Click to Request Spot-Check)'}
                    </button>
                  </div>

                  {/* V3 PHASE 10: 1-CLICK NO-CODE CMS AUTO-PUBLISHING HUB */}
                  {cmsConfig && selectedArticle && (
                    <div className="rounded-2xl border border-sky-500/40 bg-slate-950 p-5 space-y-4 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <span className="rounded bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-300 uppercase">
                            Phase 10 · 60-Second No-Code CMS Auto-Publishing Connector
                          </span>
                          <h3 className="text-base font-extrabold text-white mt-1">
                            Connect WordPress, Shopify, Webflow, or Universal Webhook in 60 Seconds
                          </h3>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-300">
                          {CMS_PLATFORM_SPECS[cmsConfig.platformId].setupTimeLabel}
                        </span>
                      </div>

                      <form
                        onSubmit={handleExecuteCmsAutoPublish}
                        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
                      >
                        <div className="md:col-span-4 space-y-1">
                          <label className="text-[10.5px] font-bold text-slate-400">
                            CMS Platform Connector
                          </label>
                          <select
                            value={cmsConfig.platformId}
                            onChange={(e) =>
                              setCmsConfig({
                                ...cmsConfig,
                                platformId: e.target.value as CmsPlatformId,
                              })
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-sky-300"
                          >
                            {Object.values(CMS_PLATFORM_SPECS).map((sp) => (
                              <option key={sp.platformId} value={sp.platformId}>
                                {sp.displayName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[10.5px] font-bold text-slate-400">
                            Delivery Mode
                          </label>
                          <select
                            value={cmsConfig.autoPublishMode}
                            onChange={(e) =>
                              setCmsConfig({
                                ...cmsConfig,
                                autoPublishMode: e.target.value as
                                  | 'auto-publish-live'
                                  | 'stage-as-draft',
                              })
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-emerald-300"
                          >
                            <option value="stage-as-draft">
                              Stage as CMS Draft (Safe Review)
                            </option>
                            <option value="auto-publish-live">
                              Auto-Publish Live Immediately (24/7)
                            </option>
                          </select>
                        </div>

                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[10.5px] font-bold text-slate-400">
                            {cmsConfig.platformId === 'wordpress-rest'
                              ? 'WP Application Password (Optional for Dry-Run)'
                              : cmsConfig.platformId === 'universal-webhook'
                                ? 'Webhook Endpoint URL'
                                : 'API Access Token (Optional for Dry-Run)'}
                          </label>
                          <input
                            type="password"
                            value={
                              cmsConfig.platformId === 'universal-webhook'
                                ? cmsConfig.webhookEndpointUrl || ''
                                : cmsConfig.wpApplicationPassword || ''
                            }
                            onChange={(e) =>
                              setCmsConfig(
                                cmsConfig.platformId === 'universal-webhook'
                                  ? {
                                      ...cmsConfig,
                                      webhookEndpointUrl: e.target.value,
                                    }
                                  : {
                                      ...cmsConfig,
                                      wpApplicationPassword: e.target.value,
                                    }
                              )
                            }
                            placeholder={
                              cmsConfig.platformId === 'wordpress-rest'
                                ? 'xxxx xxxx xxxx xxxx'
                                : 'https://... or token'
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <button
                            type="submit"
                            disabled={isPublishingToCms}
                            className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 hover:brightness-110 py-2 px-3 text-xs font-extrabold text-slate-950 shadow-lg transition disabled:opacity-50"
                          >
                            {isPublishingToCms
                              ? 'Publishing...'
                              : 'Publish to CMS →'}
                          </button>
                        </div>
                      </form>

                      {lastCmsPublishReceipt && (
                        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3.5 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-extrabold text-emerald-300">
                              ✓ {lastCmsPublishReceipt.platformDisplayName} Receipt (
                              {lastCmsPublishReceipt.postStatus.toUpperCase()})
                            </span>
                            <span className="font-mono text-[10.5px] text-sky-300">
                              Target URL: {lastCmsPublishReceipt.publishedOrStagedUrl}
                            </span>
                          </div>
                          <p className="text-slate-200 text-[11px]">
                            {lastCmsPublishReceipt.diagnosticMessage}
                          </p>
                          <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-[10px] font-mono text-slate-300">
                            {lastCmsPublishReceipt.curlEquivalentSnippet}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* V3 PHASE 9: 150-POINT AUTOMATED QA RUBRIC + PRIVACY-FIRST SPOT-CHECK NOTES */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {active150PtQaEvaluation.categories.map((cat) => (
                        <div
                          key={cat.id}
                          className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-extrabold text-emerald-300">
                              {cat.earnedPoints}/{cat.maxPoints} pts
                            </span>
                            <AgencyUiIcon
                              name="check-shield"
                              className="w-3.5 h-3.5 text-emerald-400"
                            />
                          </div>
                          <div className="font-bold text-white leading-snug">
                            {cat.label}
                          </div>
                          <p className="text-[10.5px] text-slate-400 leading-relaxed">
                            {cat.verificationNote}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-sky-500/30 bg-slate-900/90 p-3.5 space-y-1.5">
                      <div className="font-extrabold text-sky-300">
                        Spot-Check Mode: {active150PtQaEvaluation.spotCheckStatus}
                      </div>
                      {active150PtQaEvaluation.spotCheckSpecialistNotes.map(
                        (note, nIdx) => (
                          <div key={nIdx} className="text-[11px] text-slate-200">
                            • {note}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Destination Delivery Status Queue */}
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
                          {isInternalSite ? 'Auto-Publish' : 'Stage Draft'}
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
         ===================================================================== */}
      <FounderCommandChatDock
        siteName={activeWebsite.siteName}
        siteUrl={activeWebsite.siteUrl}
        primaryNiche={activeWebsite.primaryNiche}
        activeArticleTitle={
          selectedArticle?.topicTitle || '2026 AI SEO Audit & Implementation Playbook'
        }
        activeKeyword={
          selectedArticle?.primaryKeyword || 'ai seo audit checklist'
        }
        isInternalSite={Boolean(isInternalSite)}
        existingSlugs={activeCampaign.jobs.map((j) => j.urlSlug)}
        chatTargetAgentId={chatTargetAgentId}
        onChangeTargetAgentId={setChatTargetAgentId}
        isChatDrawerExpanded={isChatDrawerExpanded}
        onToggleChatDrawer={setIsChatDrawerExpanded}
        messages={chatMessages}
        onAppendMessage={(msg) => setChatMessages((prev) => [...prev, msg])}
        onSpawnArticleFromBrief={handleHandOffScoredBriefToContentManager}
        onSelectDepartmentTab={(tabId) => {
          setActiveSidebarTab(tabId);
          setIsFullCanvasGraphOpen(false);
          setIsGraphFullScreenViewport(false);
        }}
        learnedSkills={memoryStore.learnedSkills}
        sharedMemoryEvents={memoryStore.sharedMemoryEvents}
        onRecordSelectiveInterrupt={handleRecordSelectiveInterrupt}
        selectedLlmModel={selectedLlmModel}
        isFreeTierKeyMode={isFreeTierKeyMode}
        testApiKeyInput={testApiKeyInput}
        onRecordChatTokenUsage={handleRecordChatTokenUsage}
        isLightTheme={isLightTheme}
        workspaceKnowledge={{
          capturedAtIso: new Date().toISOString(),
          siteName: activeWebsite.siteName,
          siteUrl: activeWebsite.siteUrl,
          primaryNiche: activeWebsite.primaryNiche,
          isInternalSite: Boolean(isInternalSite),
          publishedArticlesCount: activeCampaign.jobs.filter(
            (j) => j.status === 'published'
          ).length,
          draftArticlesCount: activeCampaign.jobs.filter(
            (j) => j.status !== 'published' && j.status !== 'queued'
          ).length,
          queuedArticlesCount: activeCampaign.jobs.filter(
            (j) => j.status === 'queued'
          ).length,
          totalArticlesCount: activeCampaign.jobs.length,
          recentArticles: activeCampaign.jobs.slice(0, 6).map((j) => ({
            title: j.topicTitle,
            primaryKeyword: j.primaryKeyword,
            status: j.status,
            kdScore: j.kdProxyScore,
          })),
          activeArticleTitle:
            selectedArticle?.topicTitle ||
            '2026 AI SEO Audit & Implementation Playbook',
          activeKeyword:
            selectedArticle?.primaryKeyword || 'ai seo audit checklist',
          heroBannersCount: activeCampaign.jobs.length,
          sectionInfographicsCount: activeCampaign.jobs.length * 4,
          socialVisualAssetsCount: activeCampaign.jobs.length * 11,
          totalVisualAssetsCount: activeCampaign.jobs.length * 16,
          seoHealthScore: 86,
          aiDiscoverabilityScore: 94,
          backlinkClubMatchesCount: backlinkClubState?.matchedPartners.length ?? 0,
          heartbeatJobsCount: heartbeatSchedule?.slots.length ?? 0,
          nextHeartbeatSummary:
            heartbeatSchedule?.slots[0]?.taskTitle || '24/7 Staggered Heartbeat Active',
          learnedSkillsCount: memoryStore.learnedSkills.length,
          sessionTokensUsed: sessionTokenLedger.totalSessionTokens,
          sessionShadowCostUsd: sessionTokenLedger.totalShadowCostUsd,
          sessionActualCostUsd: sessionTokenLedger.totalActualCostUsd,
          activeKeySlot: sessionTokenLedger.activeKeySlot,
          activeAgentsCount: sessionTokenLedger.activeAgentsCount,
        }}
      />
    </div>
  );
}

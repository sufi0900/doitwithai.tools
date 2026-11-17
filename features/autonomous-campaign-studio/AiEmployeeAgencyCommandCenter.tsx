'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { AutomationKeyOverrides } from '@/lib/autonomous-agents/automation-ai-router';
import {
  buildActiveAiEmployeeAgencyState,
  type AgencyDepartmentId,
  type AgencySubAgentNode,
} from '@/lib/autonomous-agents/deep-research-agency-engine';
import {
  buildCloudHeartbeatMorningBriefing,
  loadLatestMorningBriefing,
  saveLatestMorningBriefing,
  type CloudHeartbeatMorningBriefing,
} from '@/lib/autonomous-agents/cloud-heartbeat-briefing';
import type { WebsiteScoutReport } from '@/lib/autonomous-agents/sitemap-trend-scout';
import type {
  AutomatedArticleJob,
  ConnectedWebsiteProfile,
  WinnerFormulaRecord,
} from '@/lib/autonomous-agents/types';

export interface LivePageAuditResponseData {
  auditedAtIso: string;
  pageUrl: string;
  liveCrawlSucceeded: boolean;
  aiProviderUsed: string;
  extractedMetrics: {
    pageTitle: string;
    metaDescription: string;
    h1Heading: string;
    h2Headings: string[];
    wordCountEstimate: number;
    jsonLdScriptsFound: number;
    internalLinksCount: number;
    imagesOrSvgsCount: number;
  };
  freshnessScore: number;
  aeoCitationScore: number;
  detectedGaps: string[];
  upgraded50WordAeoLead: string;
  suggestedNewH2: string;
  dropInRefreshMarkdown: string;
  upgradedJsonLdPatch: string;
  refreshInfographicSvg?: string;
}

export interface SocialNetworkTelemetrySnapshot {
  networkId: 'pinterest' | 'linkedin' | 'x-threads';
  networkLabel: string;
  connectionSource: 'live-oauth-api' | 'telemetry-benchmark-simulator';
  impressions7d: number;
  savesOrBookmarks7d: number;
  outboundClicks7d: number;
  saveRatePercent: number;
  ctrPercent: number;
  winningVisualArchetype: string;
  winningHookFormula: string;
  autoRebalanceAction: string;
}

export interface SocialAnalyticsSyncData {
  syncedAtIso: string;
  siteName: string;
  overallSocialVelocityScore: number;
  outperformanceMultiplier: string;
  networkSnapshots: SocialNetworkTelemetrySnapshot[];
  promotedWinnerFormula: {
    visualArchetype: string;
    colorPalettePair: string;
    hookFormula: string;
    rationale: string;
  };
  winnerRecordForStore?: WinnerFormulaRecord;
}

export interface AiEmployeeAgencyCommandCenterProps {
  website: ConnectedWebsiteProfile;
  jobs: AutomatedArticleJob[];
  scoutReport: WebsiteScoutReport | null;
  activeWritingJobId?: string;
  isRunningBatch: boolean;
  keyOverrides?: AutomationKeyOverrides;
  onSelectArticleForStudio: (job: AutomatedArticleJob) => void;
  onRunNext24hCycle: () => void;
  onOpenInWriterStudio: (job?: AutomatedArticleJob) => void;
  onApplyArticleRefreshPatch?: (params: {
    pageUrl: string;
    suggestedNewH2: string;
    upgraded50WordAeoLead: string;
    dropInRefreshMarkdown: string;
    refreshInfographicSvg?: string;
  }) => void;
  onPromoteSocialWinnerFormula?: (winner: WinnerFormulaRecord) => void;
}

const DEPARTMENT_TABS: Array<{
  id: AgencyDepartmentId;
  badge: string;
  label: string;
  accentClass: string;
}> = [
  {
    id: 'deep-research',
    badge: 'Dept 1',
    label: '🔬 Deep Research & Competitors',
    accentClass: 'border-sky-500/50 bg-sky-500/15 text-sky-200',
  },
  {
    id: 'on-page-seo',
    badge: 'Dept 2',
    label: '🛠️ On-Page SEO & Article Refresh',
    accentClass: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200',
  },
  {
    id: 'off-page-seo',
    badge: 'Dept 3',
    label: '📣 Off-Page SEO & Digital PR',
    accentClass: 'border-amber-500/50 bg-amber-500/15 text-amber-200',
  },
  {
    id: 'technical-local-seo',
    badge: 'Dept 4',
    label: '⚙️ Technical & Local Entity SEO',
    accentClass: 'border-cyan-500/50 bg-cyan-500/15 text-cyan-200',
  },
  {
    id: 'content-production',
    badge: 'Dept 5',
    label: '✍️ Autonomous Article & Visual Studio',
    accentClass: 'border-purple-500/50 bg-purple-500/15 text-purple-200',
  },
  {
    id: 'social-media-fleet',
    badge: 'Dept 6',
    label: '📲 Multi-Network Social Agent Trees',
    accentClass: 'border-pink-500/50 bg-pink-500/15 text-pink-200',
  },
];

export default function AiEmployeeAgencyCommandCenter({
  website,
  jobs,
  scoutReport,
  activeWritingJobId,
  isRunningBatch,
  keyOverrides,
  onSelectArticleForStudio,
  onRunNext24hCycle,
  onOpenInWriterStudio,
  onApplyArticleRefreshPatch,
  onPromoteSocialWinnerFormula,
}: AiEmployeeAgencyCommandCenterProps) {
  const [viewMode, setViewMode] = useState<'animated-node-graph' | 'text-dashboard'>(
    'animated-node-graph'
  );
  const [activeDepartmentTab, setActiveDepartmentTab] =
    useState<AgencyDepartmentId>('on-page-seo');
  const [tickCounter, setTickCounter] = useState<number>(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-onpage-schema');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Phase B: Live Existing Article Crawler & One-Click Refresh State
  const [customAuditUrl, setCustomAuditUrl] = useState<string>('');
  const [isAuditingPage, setIsAuditingPage] = useState<boolean>(false);
  const [liveAuditResult, setLiveAuditResult] = useState<LivePageAuditResponseData | null>(
    null
  );
  const [appliedRefreshUrls, setAppliedRefreshUrls] = useState<string[]>([]);

  // Phase C: Persistent 24/7 Cloud Heartbeat & Morning Briefing State
  const [showMorningBriefing, setShowMorningBriefing] = useState<boolean>(false);
  const [isRunningCloudHeartbeat, setIsRunningCloudHeartbeat] = useState<boolean>(false);
  const [morningBriefing, setMorningBriefing] =
    useState<CloudHeartbeatMorningBriefing | null>(null);

  // Phase D: Live Social Analytics Ingestion & Winner Auto-Rebalancing State
  const [isSyncingSocialAnalytics, setIsSyncingSocialAnalytics] = useState<boolean>(false);
  const [socialAnalytics, setSocialAnalytics] = useState<SocialAnalyticsSyncData | null>(
    null
  );

  // Rotate active agent pulse every 3.5 seconds so the 24/7 AI Employee Agency feels alive
  useEffect(() => {
    const timer = setInterval(() => {
      setTickCounter((prev) => prev + 1);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Load or initialize the 24/7 Morning Briefing for the active website
  useEffect(() => {
    const stored = loadLatestMorningBriefing();
    if (stored && stored.websiteUrl === website.siteUrl) {
      setMorningBriefing(stored);
    } else {
      const initial = buildCloudHeartbeatMorningBriefing({
        website,
        jobs,
        scoutReport,
        executionMode: 'browser-active-loop',
      });
      setMorningBriefing(initial);
    }
  }, [website, jobs, scoutReport]);

  const agencyState = useMemo(() => {
    return buildActiveAiEmployeeAgencyState({
      website,
      jobs,
      scoutReport,
      activeWritingJobId,
      tickCounter,
    });
  }, [website, jobs, scoutReport, activeWritingJobId, tickCounter]);

  const selectedNode: AgencySubAgentNode = useMemo(() => {
    return (
      agencyState.subAgentNodes.find((n) => n.id === selectedNodeId) ??
      agencyState.subAgentNodes[0]!
    );
  }, [agencyState.subAgentNodes, selectedNodeId]);

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  /**
   * Phase B: Run Live HTML Page Crawl & 2026 Refresh Synthesis (`/api/autonomous-agents/audit-page`)
   */
  const handleRunLivePageAudit = async (targetUrl?: string) => {
    const urlToAudit = (
      targetUrl ||
      customAuditUrl ||
      agencyState.existingArticleRefreshes[0]?.url ||
      website.siteUrl
    ).trim();
    if (!urlToAudit) return;

    setCustomAuditUrl(urlToAudit);
    setIsAuditingPage(true);
    try {
      const res = await fetch('/api/autonomous-agents/audit-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageUrl: urlToAudit,
          siteName: website.siteName,
          primaryNiche: website.primaryNiche,
          brandPrimaryHex: website.brandPrimaryHex,
          brandSecondaryHex: website.brandSecondaryHex,
          isInternalSite: agencyState.isInternalSite,
          internalBuilderSlug: website.internalBuilderSlug,
          keyOverrides,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          ok: boolean;
          auditResult?: LivePageAuditResponseData;
        };
        if (data.ok && data.auditResult) {
          setLiveAuditResult(data.auditResult);
        }
      }
    } catch {
      // Keep UI responsive even offline
    } finally {
      setIsAuditingPage(false);
    }
  };

  /**
   * Phase C: Trigger Persistent 24/7 Cloud Heartbeat Worker (`/api/autonomous-agents/cron-24h`)
   */
  const handleRunCloudHeartbeatNow = async () => {
    setIsRunningCloudHeartbeat(true);
    setShowMorningBriefing(true);
    try {
      const res = await fetch('/api/autonomous-agents/cron-24h', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          jobs,
          scoutReport,
          keyOverrides,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          ok: boolean;
          briefing?: CloudHeartbeatMorningBriefing;
        };
        if (data.ok && data.briefing) {
          const saved = saveLatestMorningBriefing(data.briefing);
          setMorningBriefing(saved);
          return;
        }
      }
      const fallback = saveLatestMorningBriefing(
        buildCloudHeartbeatMorningBriefing({
          website,
          jobs,
          scoutReport,
          executionMode: 'manual-cloud-heartbeat',
        })
      );
      setMorningBriefing(fallback);
    } catch {
      const fallback = saveLatestMorningBriefing(
        buildCloudHeartbeatMorningBriefing({
          website,
          jobs,
          scoutReport,
          executionMode: 'manual-cloud-heartbeat',
        })
      );
      setMorningBriefing(fallback);
    } finally {
      setIsRunningCloudHeartbeat(false);
    }
  };

  /**
   * Phase D: Sync Live Pinterest v5 & LinkedIn Analytics + Auto-Rebalance Winner Palettes/Hooks
   */
  const handleSyncSocialAnalyticsAndRebalance = async () => {
    setIsSyncingSocialAnalytics(true);
    try {
      const res = await fetch('/api/autonomous-agents/social-analytics-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          jobs,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          ok: boolean;
          analytics?: SocialAnalyticsSyncData;
        };
        if (data.ok && data.analytics) {
          setSocialAnalytics(data.analytics);
          if (data.analytics.winnerRecordForStore && onPromoteSocialWinnerFormula) {
            onPromoteSocialWinnerFormula(data.analytics.winnerRecordForStore);
          }
        }
      }
    } catch {
      // Keep UI responsive even offline
    } finally {
      setIsSyncingSocialAnalytics(false);
    }
  };

  const completedArticlesCount = jobs.filter(
    (j) => j.status === 'published' || j.status === 'ready-for-review'
  ).length;

  return (
    <div className="space-y-6 min-w-0">
      {/* Top 24/7 Active AI Employee Agency Header & View Switcher */}
      <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-r from-slate-900 via-[#111A2E] to-slate-900 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 border border-amber-400/40 px-3 py-1 text-xs font-extrabold text-amber-300">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="truncate">
                24/7 Active Digital AI Employee Agency · Working Continuously for {website.siteName}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-white">
              Autonomous SEO, Content &amp; Multi-Network Social Agency OS
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Your 6 AI Departments (22 Specialized Sub-Agents) continuously research competitors, audit On-Page/Off-Page/Technical SEO, live-crawl &amp; refresh existing articles, write new articles with 6-layer infographics, and build Pinterest/LinkedIn social packs.
            </p>
          </div>

          {/* Primary View Mode Switcher: Animated Node Graph vs Text Dashboard + Morning Briefing */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex flex-wrap rounded-xl border border-slate-700 bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => setViewMode('animated-node-graph')}
                className={`rounded-lg px-3 py-2 text-xs font-extrabold transition ${
                  viewMode === 'animated-node-graph'
                    ? 'bg-gradient-to-r from-sky-500 to-emerald-400 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🌐 Live Animated AI Agency Node Graph
              </button>
              <button
                type="button"
                onClick={() => setViewMode('text-dashboard')}
                className={`rounded-lg px-3 py-2 text-xs font-extrabold transition ${
                  viewMode === 'text-dashboard'
                    ? 'bg-gradient-to-r from-sky-500 to-emerald-400 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                📊 Multi-Department Text Dashboard
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowMorningBriefing((prev) => !prev)}
              className={`rounded-xl border px-3.5 py-2.5 text-xs font-extrabold transition ${
                showMorningBriefing
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                  : 'border-slate-700 bg-slate-950 text-sky-300 hover:border-sky-400'
              }`}
            >
              ☀️ {showMorningBriefing ? 'Hide Morning Briefing' : '24/7 Morning Briefing'}
            </button>

            <button
              type="button"
              disabled={isRunningBatch}
              onClick={onRunNext24hCycle}
              className="rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 px-4 py-2.5 text-xs font-extrabold text-slate-950 transition"
            >
              {isRunningBatch ? '⏳ Running Cycle...' : '🔄 Trigger Next 24h Cycle'}
            </button>
          </div>
        </div>

        {/* Live Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2.5">
            <div className="text-slate-400">Overall Site SEO &amp; GEO Health</div>
            <div className="text-sm font-extrabold text-emerald-300 mt-0.5">
              {agencyState.overallHealthScore}/100 · Active Monitoring
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2.5">
            <div className="text-slate-400">Articles &amp; 6-Layer Visuals</div>
            <div className="text-sm font-extrabold text-sky-300 mt-0.5">
              {completedArticlesCount} / {jobs.length} Completed ({jobs.length * 4} SVGs)
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2.5">
            <div className="text-slate-400">On-Page / Off-Page / Tech Checks</div>
            <div className="text-sm font-extrabold text-amber-300 mt-0.5">
              {agencyState.onPageAuditItems.length +
                agencyState.offPageOpportunities.length +
                agencyState.technicalLocalItems.length}{' '}
              Live Action Items
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2.5">
            <div className="text-slate-400">Social Agent Fleet Output</div>
            <div className="text-sm font-extrabold text-pink-300 mt-0.5">
              {jobs.length * 3} Pins · {jobs.length} Carousels · {jobs.length * 5} Hooks
            </div>
          </div>
        </div>

        {/* PHASE C: 24/7 Cloud Heartbeat & Daily AI Employee Morning Briefing Drawer */}
        {showMorningBriefing && morningBriefing && (
          <div className="rounded-2xl border border-emerald-500/40 bg-slate-950/95 p-4 sm:p-5 space-y-4 text-xs mt-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Phase C · Persistent 24/7 Cloud Heartbeat &amp; Morning Briefing (`/api/autonomous-agents/cron-24h`)
                </span>
                <h3 className="text-base font-extrabold text-white mt-0.5">
                  Daily AI Employee Morning Briefing for {morningBriefing.websiteName} (
                  {morningBriefing.overallHealthDelta})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Last Heartbeat: {new Date(morningBriefing.generatedAtIso).toLocaleString()} ·
                  Next Scheduled 24h Run:{' '}
                  {new Date(morningBriefing.nextScheduledRunIso).toLocaleString()} · Engine:{' '}
                  {morningBriefing.aiProviderUsed}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isRunningCloudHeartbeat}
                  onClick={() => void handleRunCloudHeartbeatNow()}
                  className="rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 hover:brightness-110 disabled:opacity-50 px-4 py-2 text-xs font-extrabold text-slate-950 transition"
                >
                  {isRunningCloudHeartbeat
                    ? '⏳ Running 24h Cloud Heartbeat...'
                    : '⚡ Run 24h Cloud Heartbeat Now'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(morningBriefing.vercelCronConfigSnippet, 'vercel-cron-cfg')
                  }
                  className="rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-bold text-sky-300"
                >
                  {copiedId === 'vercel-cron-cfg'
                    ? '✓ Copied vercel.json!'
                    : 'Copy vercel.json Cron'}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-1.5">
              <div className="font-bold text-emerald-300">Executive Overnight Summary:</div>
              <p className="text-slate-200 leading-relaxed">
                {morningBriefing.executiveMorningSummary}
              </p>
              <div className="text-sky-300 pt-1">
                <strong>Next Queued Low-KD Topic Hook:</strong>{' '}
                {morningBriefing.newlyGeneratedTopicHook}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {morningBriefing.departmentLogs.map((log) => (
                <div
                  key={log.departmentId}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-white">{log.departmentName}</span>
                    <span
                      className="rounded px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        backgroundColor: `${log.accentHex}22`,
                        color: log.accentHex,
                      }}
                    >
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">{log.actionSummary}</p>
                  <div className="text-[11px] text-emerald-300 font-medium">
                    → {log.measurableImpact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          VIEW 1: INTERACTIVE ANIMATED AI EMPLOYEE AGENCY NODE GRAPH
          (Click any sub-agent node to inspect its live output & jump to dashboard)
         ===================================================================== */}
      {viewMode === 'animated-node-graph' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 Columns: Animated Interconnected SVG Node Workflow Canvas */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-[#080D1A] p-4 sm:p-5 space-y-4 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                  Interactive Motion Workflow · Click Any AI Agent Node to Inspect
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Live Interconnected AI Employee Agency Graph ({website.siteName})
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1.5 text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Completed
                </span>
                <span className="inline-flex items-center gap-1.5 text-sky-300">
                  <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" /> Active Working
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-300">
                  <span className="h-2 w-2 rounded-full bg-amber-400" /> 24/7 Monitoring
                </span>
              </div>
            </div>

            {/* SVG + HTML Overlay Node Canvas */}
            <div className="relative w-full overflow-x-auto rounded-2xl border border-slate-800/90 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] p-3 sm:p-4">
              <svg
                viewBox="0 0 880 500"
                className="w-full min-w-[680px] h-auto select-none"
                role="img"
                aria-label="Animated AI Employee Agency Node Workflow"
              >
                <defs>
                  <linearGradient id="edgeGradActive" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#10B981" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.85" />
                  </linearGradient>
                </defs>

                {/* Animated Bezier Edges + Traveling Glowing Data Pulses */}
                {agencyState.subAgentNodes.map((node) => {
                  if (!node.parentNodeId) return null;
                  const parent = agencyState.subAgentNodes.find(
                    (n) => n.id === node.parentNodeId
                  );
                  if (!parent) return null;
                  const x1 = parent.nodePosition.x;
                  const y1 = parent.nodePosition.y;
                  const x2 = node.nodePosition.x;
                  const y2 = node.nodePosition.y;
                  const midX = (x1 + x2) / 2;
                  const pathId = `edge-path-${parent.id}-${node.id}`;
                  const pathD = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
                  const isEdgeActive =
                    node.status === 'active-working' || selectedNode.id === node.id;

                  return (
                    <g key={`edge-${parent.id}-${node.id}`}>
                      <path
                        id={pathId}
                        d={pathD}
                        fill="none"
                        stroke={isEdgeActive ? 'url(#edgeGradActive)' : '#1E293B'}
                        strokeWidth={isEdgeActive ? 3 : 2}
                      />
                      <path
                        d={pathD}
                        fill="none"
                        stroke={node.accentHex}
                        strokeWidth={2.2}
                        strokeDasharray="6 10"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          from="32"
                          to="0"
                          dur={isEdgeActive ? '1.1s' : '2.4s'}
                          repeatCount="indefinite"
                        />
                      </path>
                      <circle r={isEdgeActive ? 4 : 3} fill={node.accentHex}>
                        <animateMotion
                          dur={isEdgeActive ? '1.8s' : '3.4s'}
                          repeatCount="indefinite"
                          path={pathD}
                        />
                      </circle>
                    </g>
                  );
                })}

                {/* Render Each Interactive Sub-Agent Node */}
                {agencyState.subAgentNodes.map((node) => {
                  const isSelected = selectedNode.id === node.id;
                  const isWorking = node.status === 'active-working';
                  const boxW = 216;
                  const boxH = 74;
                  const rx = node.nodePosition.x - boxW / 2;
                  const ry = node.nodePosition.y - boxH / 2;

                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className="cursor-pointer transition-transform"
                    >
                      {/* Pulsing Halo for Active Working or Selected Node */}
                      {(isWorking || isSelected) && (
                        <rect
                          x={rx - 5}
                          y={ry - 5}
                          width={boxW + 10}
                          height={boxH + 10}
                          rx={16}
                          fill="none"
                          stroke={node.accentHex}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                          strokeOpacity={isSelected ? 0.95 : 0.55}
                        >
                          {isWorking && (
                            <animate
                              attributeName="stroke-opacity"
                              values="0.9;0.25;0.9"
                              dur="1.6s"
                              repeatCount="indefinite"
                            />
                          )}
                        </rect>
                      )}

                      {/* Node Card Body */}
                      <rect
                        x={rx}
                        y={ry}
                        width={boxW}
                        height={boxH}
                        rx={13}
                        fill={isSelected ? '#131F38' : '#0D1526'}
                        stroke={isSelected ? node.accentHex : '#334155'}
                        strokeWidth={isSelected ? 2.2 : 1.2}
                      />

                      {/* Status Dot */}
                      <circle
                        cx={rx + 16}
                        cy={ry + 18}
                        r={4.5}
                        fill={
                          isWorking
                            ? '#38BDF8'
                            : node.status === 'completed'
                              ? '#10B981'
                              : '#F59E0B'
                        }
                      />

                      {/* Department Kicker */}
                      <text
                        x={rx + 27}
                        y={ry + 21}
                        fill={node.accentHex}
                        fontSize="9.5"
                        fontWeight="800"
                        fontFamily="system-ui, sans-serif"
                      >
                        {node.departmentLabel.toUpperCase()}
                      </text>

                      {/* Agent Name */}
                      <text
                        x={rx + 14}
                        y={ry + 40}
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="700"
                        fontFamily="system-ui, sans-serif"
                      >
                        {node.name.slice(0, 30)}
                      </text>

                      {/* Live Task Ticker */}
                      <text
                        x={rx + 14}
                        y={ry + 57}
                        fill="#94A3B8"
                        fontSize="9.5"
                        fontFamily="system-ui, sans-serif"
                      >
                        {node.currentTaskTicker.slice(0, 34)}...
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Responsive Quick-Select Sub-Agent Pill Strip (Effortless on Mobile & Desktop) */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold text-slate-400">
                Quick-Select Any Sub-Agent Node ({agencyState.subAgentNodes.length} Active Nodes):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {agencyState.subAgentNodes.map((node) => {
                  const isSel = selectedNode.id === node.id;
                  return (
                    <button
                      key={`pill-${node.id}`}
                      type="button"
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${
                        isSel
                          ? 'border-sky-400 bg-sky-500/20 text-white'
                          : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {node.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Clicked Node Live Inspector Card + 1-Click Jump to Text Dashboard */}
          <div className="lg:col-span-4 rounded-2xl border border-sky-500/40 bg-slate-900/90 p-5 space-y-4 lg:sticky lg:top-20 min-w-0">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="min-w-0">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded inline-block"
                  style={{
                    backgroundColor: `${selectedNode.accentHex}22`,
                    color: selectedNode.accentHex,
                  }}
                >
                  {selectedNode.departmentLabel}
                </span>
                <h3 className="text-base font-extrabold text-white mt-1">
                  {selectedNode.name}
                </h3>
                <p className="text-xs text-slate-400">{selectedNode.shortRole}</p>
              </div>
            </div>

            {/* Live Metrics for Clicked Agent */}
            <div className="space-y-2">
              {selectedNode.liveSummaryMetrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 flex items-center justify-between gap-2 text-xs"
                >
                  <span className="text-slate-400">{m.label}</span>
                  <span
                    className={`font-bold text-right ${
                      m.status === 'good'
                        ? 'text-emerald-300'
                        : m.status === 'warning'
                          ? 'text-amber-300'
                          : 'text-sky-300'
                    }`}
                  >
                    {m.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Live Code / Analysis Snippet for Clicked Agent */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">
                  Live Agent Output ({website.siteName}):
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(selectedNode.liveOutputSnippet, selectedNode.id)}
                  className="text-[11px] font-bold text-sky-300 hover:text-sky-200"
                >
                  {copiedId === selectedNode.id ? '✓ Copied!' : 'Copy Output'}
                </button>
              </div>
              <pre className="max-h-[210px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-950 p-3 text-[11px] leading-relaxed text-slate-200 font-mono">
                {selectedNode.liveOutputSnippet}
              </pre>
            </div>

            {/* 1-Click Button to Switch to That Agent's Full Text Dashboard Tab */}
            <button
              type="button"
              onClick={() => {
                setActiveDepartmentTab(selectedNode.targetDashboardTab);
                setViewMode('text-dashboard');
              }}
              className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-emerald-400 hover:brightness-110 px-4 py-3 text-xs font-extrabold text-slate-950 shadow-lg transition"
            >
              Open Full {selectedNode.departmentLabel} Dashboard →
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: MULTI-DEPARTMENT TEXT DASHBOARD VIEW
          (Distinct, purpose-built layout & tools for each of the 6 Departments)
         ===================================================================== */}
      {viewMode === 'text-dashboard' && (
        <div className="space-y-6 min-w-0">
          {/* 6 Department Navigation Pills */}
          <div className="flex flex-wrap gap-2">
            {DEPARTMENT_TABS.map((tab) => {
              const active = activeDepartmentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDepartmentTab(tab.id)}
                  className={`rounded-xl border px-3.5 py-2.5 text-xs font-extrabold transition flex items-center gap-2 ${
                    active
                      ? tab.accentClass
                      : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: DEEP RESEARCH & COMPETITOR INTELLIGENCE */}
          {activeDepartmentTab === 'deep-research' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 rounded-2xl border border-sky-500/35 bg-slate-900/80 p-5 space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                    Hidden Background Deep Research Engine
                  </span>
                  <h3 className="text-lg font-extrabold text-white mt-0.5">
                    Extracted Brand Voice &amp; Editorial Rubric
                  </h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1.5">
                    <div className="font-bold text-sky-300">Brand Voice Descriptors</div>
                    <div className="flex flex-wrap gap-1.5">
                      {agencyState.deepResearch.brandVoiceRubric.toneDescriptors.map((t) => (
                        <span
                          key={t}
                          className="rounded-lg bg-sky-500/15 px-2.5 py-1 text-[11px] font-bold text-sky-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                    <div className="font-bold text-emerald-300">Sentence Rhythm &amp; AEO Rule</div>
                    <p className="text-slate-300 leading-relaxed">
                      {agencyState.deepResearch.brandVoiceRubric.sentenceRhythmRule}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                    <div className="font-bold text-amber-300">E-E-A-T Authority Angle</div>
                    <p className="text-slate-300 leading-relaxed">
                      {agencyState.deepResearch.brandVoiceRubric.eeatAuthorityAngle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    SERP Intent Gap Analysis
                  </span>
                  <h3 className="text-lg font-extrabold text-white mt-0.5">
                    Competitor Teardowns &amp; Exploitable Content Gaps
                  </h3>
                </div>
                <div className="space-y-3 text-xs">
                  {agencyState.deepResearch.competitorTeardowns.map((comp) => (
                    <div
                      key={comp.competitorArchetype}
                      className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 space-y-2"
                    >
                      <div className="font-extrabold text-white text-sm">
                        {comp.competitorArchetype}
                      </div>
                      <div className="text-slate-400">
                        <strong className="text-slate-200">Their Strength:</strong> {comp.strengths}
                      </div>
                      <div className="text-rose-300">
                        <strong>Exploitable Gap:</strong> {comp.exploitableContentGap}
                      </div>
                      <div className="text-emerald-300">
                        <strong>Our Winning Strategy:</strong> {comp.ourWinningAngle}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ON-PAGE SEO & EXISTING ARTICLE REFRESH (WITH PHASE B LIVE CRAWLER + SVG) */}
          {activeDepartmentTab === 'on-page-seo' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-emerald-500/35 bg-slate-900/80 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      On-Page SEO Sub-Agent Fleet (Schema, Internal Links, Meta/Headers, robots.txt)
                    </span>
                    <h3 className="text-lg font-extrabold text-white mt-0.5">
                      Continuous On-Page SEO Audit &amp; Ready-Made Code Patches
                    </h3>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-extrabold text-emerald-300">
                    {agencyState.isInternalSite
                      ? 'Internal Site: Auto-Applied to /p/[slug]'
                      : 'External Site: 1-Click Copy Patches Ready'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agencyState.onPageAuditItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 space-y-2.5 text-xs min-w-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-white">{item.title}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                            item.status === 'auto-fixed' || item.status === 'healthy'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {item.status === 'auto-fixed'
                            ? '✓ Auto-Applied'
                            : item.status === 'healthy'
                              ? '✓ Healthy'
                              : '⚡ Improvement Ready'}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{item.currentFinding}</p>
                      <p className="text-sky-300 font-medium">{item.recommendedAction}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400">Generated Code / Map:</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.generatedCodeOrCopy, item.id)}
                          className="rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-bold text-emerald-300"
                        >
                          {copiedId === item.id ? '✓ Copied!' : 'Copy Snippet'}
                        </button>
                      </div>
                      <pre className="max-h-[140px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-[10.5px] text-slate-200 font-mono">
                        {item.generatedCodeOrCopy}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>

              {/* PHASE B: Live HTML Page Crawler & Existing Article Refresh Injector */}
              <div className="rounded-2xl border border-sky-500/40 bg-slate-900/80 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                      Phase B · Deep Live HTML Page Crawler (`/api/autonomous-agents/audit-page`)
                    </span>
                    <h3 className="text-lg font-extrabold text-white mt-0.5">
                      Live Existing Article Gap Crawler &amp; 1-Click 2026 Refresh Injector
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Paste any existing blog post URL (or click <strong>🔍 Live-Crawl &amp; Refresh</strong> on any discovered article below) to crawl its live HTML headings, word count, and schema, and generate a drop-in 2026 refresh section + 6-layer SVG infographic.
                    </p>
                  </div>
                </div>

                {/* Live URL Audit Bar */}
                <div className="flex flex-wrap gap-2">
                  <input
                    type="url"
                    value={customAuditUrl}
                    onChange={(e) => setCustomAuditUrl(e.target.value)}
                    placeholder={`Enter any existing article URL on ${website.siteName} to live-crawl & refresh...`}
                    className="flex-1 min-w-[240px] rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-sky-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isAuditingPage}
                    onClick={() => void handleRunLivePageAudit()}
                    className="rounded-xl bg-gradient-to-r from-sky-500 to-emerald-400 hover:brightness-110 disabled:opacity-50 px-4 py-2.5 text-xs font-extrabold text-slate-950 transition"
                  >
                    {isAuditingPage
                      ? '⏳ Crawling Live HTML & Auditing Gaps...'
                      : '🔍 Live-Crawl & Generate 2026 Refresh Patch'}
                  </button>
                </div>

                {/* Live Audit Result Drawer when a URL has been crawled */}
                {liveAuditResult && (
                  <div className="rounded-2xl border border-emerald-500/40 bg-slate-950 p-4 space-y-4 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-emerald-300">
                          ✓ Live Page Audit Complete · {liveAuditResult.aiProviderUsed}
                        </span>
                        <div className="font-extrabold text-white text-sm mt-0.5 truncate">
                          {liveAuditResult.extractedMetrics.pageTitle}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {liveAuditResult.pageUrl}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-amber-500/15 border border-amber-400/30 px-2.5 py-1 font-bold text-amber-300">
                          Freshness: {liveAuditResult.freshnessScore}/100
                        </span>
                        <span className="rounded-lg bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-1 font-bold text-emerald-300">
                          AEO Readiness: {liveAuditResult.aeoCitationScore}/100
                        </span>
                      </div>
                    </div>

                    {/* Extracted Live HTML Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
                        <div className="text-slate-400 text-[11px]">Crawled Word Count</div>
                        <div className="font-extrabold text-white text-sm">
                          ~{liveAuditResult.extractedMetrics.wordCountEstimate} words
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
                        <div className="text-slate-400 text-[11px]">H2 Headings Found</div>
                        <div className="font-extrabold text-sky-300 text-sm">
                          {liveAuditResult.extractedMetrics.h2Headings.length} H2 Sections
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
                        <div className="text-slate-400 text-[11px]">JSON-LD Scripts</div>
                        <div className="font-extrabold text-amber-300 text-sm">
                          {liveAuditResult.extractedMetrics.jsonLdScriptsFound} Detected
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
                        <div className="text-slate-400 text-[11px]">Internal Links / Visuals</div>
                        <div className="font-extrabold text-emerald-300 text-sm">
                          {liveAuditResult.extractedMetrics.internalLinksCount} Links ·{' '}
                          {liveAuditResult.extractedMetrics.imagesOrSvgsCount} Visuals
                        </div>
                      </div>
                    </div>

                    {/* Side-by-Side Drop-In Refresh Markdown + Upgraded JSON-LD Patch + Refresh SVG */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-emerald-300">
                              1. Drop-In 2026 Markdown Refresh Section:
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setAppliedRefreshUrls((prev) =>
                                    prev.includes(liveAuditResult.pageUrl)
                                      ? prev
                                      : [...prev, liveAuditResult.pageUrl]
                                  );
                                  onApplyArticleRefreshPatch?.({
                                    pageUrl: liveAuditResult.pageUrl,
                                    suggestedNewH2: liveAuditResult.suggestedNewH2,
                                    upgraded50WordAeoLead:
                                      liveAuditResult.upgraded50WordAeoLead,
                                    dropInRefreshMarkdown:
                                      liveAuditResult.dropInRefreshMarkdown,
                                    refreshInfographicSvg:
                                      liveAuditResult.refreshInfographicSvg,
                                  });
                                }}
                                className="rounded bg-emerald-500 hover:bg-emerald-400 px-2.5 py-1 text-[11px] font-extrabold text-slate-950"
                              >
                                {appliedRefreshUrls.includes(liveAuditResult.pageUrl)
                                  ? '✓ Injected into Article'
                                  : '⚡ 1-Click Inject Refresh'}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopy(
                                    liveAuditResult.dropInRefreshMarkdown,
                                    'live-refresh-md'
                                  )
                                }
                                className="rounded bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-sky-300"
                              >
                                {copiedId === 'live-refresh-md' ? '✓ Copied!' : 'Copy'}
                              </button>
                            </div>
                          </div>
                          <pre className="max-h-[210px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-900 p-3 text-[11px] text-slate-200 font-mono">
                            {liveAuditResult.dropInRefreshMarkdown}
                          </pre>
                        </div>

                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sky-300">
                              2. Upgraded @graph JSON-LD Patch:
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  liveAuditResult.upgradedJsonLdPatch,
                                  'live-refresh-schema'
                                )
                              }
                              className="rounded bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-emerald-300"
                            >
                              {copiedId === 'live-refresh-schema' ? '✓ Copied!' : 'Copy JSON-LD'}
                            </button>
                          </div>
                          <pre className="max-h-[210px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-900 p-3 text-[11px] text-slate-200 font-mono">
                            {liveAuditResult.upgradedJsonLdPatch}
                          </pre>
                        </div>
                      </div>

                      {liveAuditResult.refreshInfographicSvg && (
                        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900 p-3 flex flex-col items-center gap-2">
                          <div className="text-[11px] font-bold text-purple-300">
                            3. New 1080×1350 Refresh Infographic SVG
                          </div>
                          <div
                            className="w-full max-w-[220px] rounded-lg overflow-hidden [&_svg]:w-full [&_svg]:h-auto"
                            dangerouslySetInnerHTML={{
                              __html: liveAuditResult.refreshInfographicSvg,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Discovered Existing Articles Queue */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {agencyState.existingArticleRefreshes.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2.5 flex flex-col justify-between min-w-0"
                    >
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            Freshness: {item.freshnessScore}/100
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.dropInRefreshParagraph, item.id)}
                            className="text-[11px] font-bold text-sky-300 hover:underline"
                          >
                            {copiedId === item.id ? '✓ Copied Refresh!' : 'Copy Refresh Block'}
                          </button>
                        </div>
                        <div className="font-bold text-white truncate">{item.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{item.url}</div>
                        <ul className="space-y-1 text-[11px] text-rose-300">
                          {item.detectedGaps.map((g) => (
                            <li key={g}>• Gap: {g}</li>
                          ))}
                        </ul>
                        <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-[11px] text-emerald-200">
                          <strong>New H2 ({item.suggestedNewH2}):</strong>{' '}
                          {item.dropInRefreshParagraph}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isAuditingPage}
                        onClick={() => void handleRunLivePageAudit(item.url)}
                        className="w-full rounded-lg border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 px-3 py-2 text-[11px] font-extrabold text-sky-200 transition"
                      >
                        🔍 Live-Crawl &amp; Generate Full 2026 Patch →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFF-PAGE SEO & DIGITAL PR */}
          {activeDepartmentTab === 'off-page-seo' && (
            <div className="rounded-2xl border border-amber-500/35 bg-slate-900/80 p-5 space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Off-Page Authority, Niche Directories &amp; Journalist PR Agent
                </span>
                <h3 className="text-lg font-extrabold text-white mt-0.5">
                  Ready-to-Send Backlink Outreach, Directory Bios &amp; Data Pitches
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {agencyState.offPageOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 space-y-2.5 min-w-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        {opp.priority} Priority · {opp.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(opp.readyMadePitchOrSnippet, opp.id)}
                        className="rounded bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-emerald-300"
                      >
                        {copiedId === opp.id ? '✓ Copied!' : 'Copy Pitch / Bio'}
                      </button>
                    </div>
                    <div className="font-extrabold text-white text-sm">{opp.targetName}</div>
                    <div className="text-[11px] text-sky-300">{opp.authorityEstimate}</div>
                    <div className="text-[11px] text-slate-400 font-mono break-words">
                      Search / Target: {opp.actionUrlOrQuery}
                    </div>
                    <pre className="max-h-[160px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-[11px] text-slate-200 font-sans">
                      {opp.readyMadePitchOrSnippet}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TECHNICAL & LOCAL ENTITY SEO */}
          {activeDepartmentTab === 'technical-local-seo' && (
            <div className="rounded-2xl border border-cyan-500/35 bg-slate-900/80 p-5 space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                  Technical &amp; Local Entity SEO Monitor
                </span>
                <h3 className="text-lg font-extrabold text-white mt-0.5">
                  Core Web Vitals, Sitemap Indexation &amp; Brand Entity Disambiguation
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {agencyState.technicalLocalItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 space-y-2.5 min-w-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          item.status === 'passing'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {item.metricValue}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.fixSnippet, item.id)}
                        className="text-[11px] font-bold text-sky-300"
                      >
                        {copiedId === item.id ? '✓ Copied!' : 'Copy Code'}
                      </button>
                    </div>
                    <div className="font-extrabold text-white text-sm">{item.label}</div>
                    <p className="text-slate-300 leading-relaxed">{item.diagnosticDetail}</p>
                    <pre className="max-h-[140px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-[10.5px] text-slate-200 font-mono">
                      {item.fixSnippet}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AUTONOMOUS ARTICLE & VISUAL PRODUCTION QUEUE */}
          {activeDepartmentTab === 'content-production' && (
            <div className="rounded-2xl border border-purple-500/35 bg-slate-900/80 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                    Autonomous Content &amp; 6-Layer Infographic Department
                  </span>
                  <h3 className="text-lg font-extrabold text-white mt-0.5">
                    Active &amp; Completed Articles ({completedArticlesCount} of {jobs.length} Ready)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenInWriterStudio(jobs[0])}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 px-4 py-2 text-xs font-extrabold text-slate-950"
                >
                  ✨ Open All {jobs.length} Articles in Full Content Writer Studio →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                {jobs.map((job, idx) => {
                  const isDone =
                    job.status === 'published' || job.status === 'ready-for-review';
                  const isWritingNow = activeWritingJobId === job.id && isRunningBatch;
                  return (
                    <div
                      key={job.id}
                      className={`rounded-xl border p-4 flex flex-col justify-between gap-3 min-w-0 ${
                        isWritingNow
                          ? 'border-sky-400 bg-sky-950/30'
                          : isDone
                            ? 'border-emerald-500/35 bg-slate-950/90'
                            : 'border-slate-800 bg-slate-950/60'
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                            Article #{idx + 1} · KD {job.kdProxyScore}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                              isWritingNow
                                ? 'bg-sky-400 text-slate-950 animate-pulse'
                                : isDone
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isWritingNow
                              ? '⚡ Actively Writing Now...'
                              : isDone
                                ? '✓ Completed (Article + 4 SVGs + 3 Pins)'
                                : '⏳ Queued in 24/7 Pipeline'}
                          </span>
                        </div>
                        <div className="text-sm font-extrabold text-white">{job.topicTitle}</div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {job.aeoDirectAnswer50Words}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => onSelectArticleForStudio(job)}
                          className="rounded-lg bg-sky-500/20 border border-sky-500/40 hover:bg-sky-500/30 px-3 py-1.5 text-[11px] font-bold text-sky-200"
                        >
                          Preview Article, 4 Infographics &amp; Pins →
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenInWriterStudio(job)}
                          className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-[11px] font-bold text-emerald-300"
                        >
                          Edit in Studio →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: MULTI-NETWORK SOCIAL MEDIA SUB-AGENT TREES + PHASE D LIVE ANALYTICS REBALANCER */}
          {activeDepartmentTab === 'social-media-fleet' && (
            <div className="space-y-6">
              {/* PHASE D: Live Social Analytics Ingestion & Winner Auto-Rebalancer */}
              <div className="rounded-2xl border border-pink-500/40 bg-slate-900/85 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-pink-300">
                      Phase D · Live Social Analytics Ingestion &amp; Auto-Rebalancing (`/api/autonomous-agents/social-analytics-sync`)
                    </span>
                    <h3 className="text-lg font-extrabold text-white mt-0.5">
                      Pinterest v5 &amp; LinkedIn Telemetry Sync + Winner Palette/Hook Auto-Rebalancer
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Ingests 7-day Save Rate, Outbound Clicks, and Carousel Swipe-Through metrics to automatically re-weight visual layout archetypes and scroll-stopper hooks for your next 24/7 cycle.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isSyncingSocialAnalytics}
                    onClick={() => void handleSyncSocialAnalyticsAndRebalance()}
                    className="rounded-xl bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400 hover:brightness-110 disabled:opacity-50 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg transition"
                  >
                    {isSyncingSocialAnalytics
                      ? '⏳ Syncing Pinterest v5 & LinkedIn Telemetry...'
                      : '📈 Sync Live Social Analytics & Auto-Rebalance Winners'}
                  </button>
                </div>

                {socialAnalytics && (
                  <div className="space-y-4 pt-2 border-t border-slate-800 text-xs">
                    <div className="rounded-xl border border-emerald-500/35 bg-slate-950 p-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-emerald-300">
                          ★ Promoted &amp; Saved Winner Formula ({socialAnalytics.outperformanceMultiplier})
                        </div>
                        <div className="font-extrabold text-white text-sm">
                          {socialAnalytics.promotedWinnerFormula.visualArchetype} ·{' '}
                          {socialAnalytics.promotedWinnerFormula.hookFormula}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {socialAnalytics.promotedWinnerFormula.rationale}
                        </div>
                      </div>
                      <span className="rounded-xl bg-emerald-500/15 border border-emerald-400/30 px-3 py-1.5 font-extrabold text-emerald-300">
                        Velocity Score: {socialAnalytics.overallSocialVelocityScore}/100
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {socialAnalytics.networkSnapshots.map((snap) => (
                        <div
                          key={snap.networkId}
                          className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 min-w-0"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-white">{snap.networkLabel}</span>
                            <span className="rounded bg-pink-500/15 px-2 py-0.5 text-[10px] font-bold text-pink-300 shrink-0">
                              Save Rate: {snap.saveRatePercent}%
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                            <div className="rounded bg-slate-900 p-2">
                              <div className="text-slate-400">Impr (7d)</div>
                              <div className="font-bold text-white">
                                {snap.impressions7d.toLocaleString()}
                              </div>
                            </div>
                            <div className="rounded bg-slate-900 p-2">
                              <div className="text-slate-400">Saves</div>
                              <div className="font-bold text-emerald-300">
                                {snap.savesOrBookmarks7d.toLocaleString()}
                              </div>
                            </div>
                            <div className="rounded bg-slate-900 p-2">
                              <div className="text-slate-400">Clicks</div>
                              <div className="font-bold text-sky-300">
                                {snap.outboundClicks7d.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-[11px] text-amber-300">
                            <strong>Winning Layout:</strong> {snap.winningVisualArchetype}
                          </div>
                          <div className="text-[11px] text-emerald-300">
                            → {snap.autoRebalanceAction}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {agencyState.socialAgentTrees.map((tree) => (
                  <div
                    key={tree.networkId}
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 min-w-0"
                  >
                    <div>
                      <span
                        className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded inline-block"
                        style={{
                          backgroundColor: `${tree.accentHex}22`,
                          color: tree.accentHex,
                        }}
                      >
                        Dedicated Sub-Agent Tree
                      </span>
                      <h3 className="text-base font-extrabold text-white mt-1">
                        {tree.networkName}
                      </h3>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Active Node: <strong className="text-white">{tree.activeSubAgentName}</strong>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {tree.subAgents.map((sub) => (
                        <div
                          key={sub.id}
                          className="rounded-xl border border-slate-800 bg-slate-950/90 p-3 space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-white">{sub.name}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9.5px] font-extrabold shrink-0 ${
                                sub.status === 'active-working'
                                  ? 'bg-sky-500/20 text-sky-300 animate-pulse'
                                  : sub.status === 'completed'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {sub.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">{sub.role}</div>
                          <div className="text-[11px] text-emerald-300 pt-0.5">
                            → {sub.liveOutputSummary}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

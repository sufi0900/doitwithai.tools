'use client';

import React from 'react';
import type { AutomatedArticleJob } from '@/lib/autonomous-agents/types';
import type { AgencySidebarTabId } from '@/lib/ai-employee-agency/agent-registry';
import type {
  AgencyLlmModelId,
  SessionTokenLedgerEvent,
} from '@/lib/ai-employee-agency/token-telemetry-store';
import { AgencyUiIcon } from './AgencySvgIcons';

/**
 * ============================================================================
 * DOITWITHAI.TOOLS — AI EMPLOYEE AGENCY DASHBOARD (V6 REDESIGN)
 * Component: `features/ai-employee-agency/V5ExecutiveOverviewPanel.tsx`
 *
 * Berry MUI & Materially Inspired Overview Grid:
 * - Row 1: 4 Hero KPI Cards with inline SVG sparklines & tabular metrics
 * - Row 2: 8-Col Live 5-Step Pipeline & Activity Bar Chart + 4-Col Concentric Circular Progress Card
 * - Row 3: 8-Col Clean Editorial Campaign Table + 4-Col Live Agent Activity Stream
 * ============================================================================
 */

export interface V5ExecutiveOverviewPanelProps {
  isLightTheme: boolean;
  siteName: string;
  siteUrl: string;
  jobs: AutomatedArticleJob[];
  completedCount: number;
  queuedCount: number;
  totalSessionTokens: number;
  totalShadowCostUsd: number;
  activeModelId: AgencyLlmModelId;
  isFreeTierKeyActive: boolean;
  overallSiteHealthScore: number;
  aiSearchScore: number;
  isLivePipelineRunning: boolean;
  activeLiveStepIndex: number | null;
  liveStepStatusLabel: string;
  livePipelineError: string | null;
  lastStepOutputPreview: string;
  recentEvents: SessionTokenLedgerEvent[];
  selectedOverviewStageIdx: number;
  onSelectOverviewStageIdx: (idx: number) => void;
  onStartLivePipeline: (job?: AutomatedArticleJob) => void;
  onNavigateTab: (tabId: AgencySidebarTabId) => void;
  onOpenTokensView: () => void;
  onOpenChatWithPrompt: (prompt: string) => void;
}

const LIVE_FIVE_STEP_LABELS = [
  { idx: 0, label: 'Keyword Brief' },
  { idx: 1, label: 'Article Draft' },
  { idx: 2, label: 'Visual Assets' },
  { idx: 3, label: 'On-Page QA' },
  { idx: 4, label: 'Social Pack' },
] as const;

const DEPARTMENT_STAGE_BARS: Array<{
  title: string;
  owner: string;
  tabId: AgencySidebarTabId;
  handoffNote: string;
  baseHeight: number;
  colorHex: string;
}> = [
  {
    title: 'Discovery',
    owner: 'Keyword Strategist',
    tabId: 'keyword-strategist',
    handoffNote: 'Live keyword clustering & difficulty scoring.',
    baseHeight: 74,
    colorHex: '#2563EB',
  },
  {
    title: 'Editorial',
    owner: 'Long-Form Writer',
    tabId: 'content-writing',
    handoffNote: 'Structured direct-answer drafts & headings.',
    baseHeight: 88,
    colorHex: '#4F46E5',
  },
  {
    title: 'Visuals',
    owner: 'Design Director',
    tabId: 'graphic-design',
    handoffNote: 'Featured heroes & 6-layer data infographics.',
    baseHeight: 68,
    colorHex: '#7C3AED',
  },
  {
    title: 'Tech QA',
    owner: 'QA & Publisher',
    tabId: 'qa-publishing',
    handoffNote: '150-point quality check, schema & CMS staging.',
    baseHeight: 92,
    colorHex: '#10B981',
  },
  {
    title: 'Social',
    owner: 'Social Manager',
    tabId: 'social-video-fleet',
    handoffNote: 'LinkedIn slides, Pinterest pins & short scripts.',
    baseHeight: 76,
    colorHex: '#0EA5E9',
  },
  {
    title: 'Authority',
    owner: 'Off-Page Lead',
    tabId: 'off-page-seo',
    handoffNote: 'Niche link placements & citation monitoring.',
    baseHeight: 62,
    colorHex: '#F59E0B',
  },
];

function MiniSparkline({
  colorHex,
  points,
}: {
  colorHex: string;
  points: string;
}) {
  return (
    <svg
      width="68"
      height="28"
      viewBox="0 0 68 28"
      fill="none"
      aria-hidden="true"
      className="shrink-0 opacity-90"
    >
      <polyline
        fill="none"
        stroke={colorHex}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function ConcentricHealthGauge({
  technicalScore,
  aiScore,
  isLightTheme,
}: {
  technicalScore: number;
  aiScore: number;
  isLightTheme: boolean;
}) {
  const techClamped = Math.max(0, Math.min(100, Math.round(technicalScore)));
  const aiClamped = Math.max(0, Math.min(100, Math.round(aiScore)));
  const combinedScore = Math.round((techClamped + aiClamped) / 2);

  const outerRadius = 72;
  const innerRadius = 54;
  const outerCirc = 2 * Math.PI * outerRadius;
  const innerCirc = 2 * Math.PI * innerRadius;
  const outerOffset = outerCirc - (techClamped / 100) * outerCirc;
  const innerOffset = innerCirc - (aiClamped / 100) * innerCirc;

  return (
    <div className="relative h-[176px] w-[176px] mx-auto flex items-center justify-center">
      <svg
        className="h-[176px] w-[176px] -rotate-90"
        viewBox="0 0 176 176"
        aria-hidden="true"
      >
        {/* Outer Ring Track & Fill (#2563EB) */}
        <circle
          cx="88"
          cy="88"
          r={outerRadius}
          fill="none"
          strokeWidth="10"
          className={isLightTheme ? 'stroke-slate-100' : 'stroke-slate-800'}
        />
        <circle
          cx="88"
          cy="88"
          r={outerRadius}
          fill="none"
          strokeWidth="10"
          stroke="#2563EB"
          strokeLinecap="round"
          strokeDasharray={outerCirc}
          strokeDashoffset={outerOffset}
          style={{ transition: 'stroke-dashoffset 600ms ease' }}
        />

        {/* Inner Ring Track & Fill (#10B981) */}
        <circle
          cx="88"
          cy="88"
          r={innerRadius}
          fill="none"
          strokeWidth="10"
          className={isLightTheme ? 'stroke-slate-100' : 'stroke-slate-800'}
        />
        <circle
          cx="88"
          cy="88"
          r={innerRadius}
          fill="none"
          strokeWidth="10"
          stroke="#10B981"
          strokeLinecap="round"
          strokeDasharray={innerCirc}
          strokeDashoffset={innerOffset}
          style={{ transition: 'stroke-dashoffset 600ms ease' }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-[28px] leading-none font-bold tabular-nums">
          {combinedScore}%
        </span>
        <span
          className={`text-xs font-medium mt-1.5 ${
            isLightTheme ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          Overall Health
        </span>
      </div>
    </div>
  );
}

export default function V5ExecutiveOverviewPanel({
  isLightTheme,
  siteName,
  jobs,
  completedCount,
  queuedCount,
  totalSessionTokens,
  totalShadowCostUsd,
  activeModelId,
  isFreeTierKeyActive,
  overallSiteHealthScore,
  aiSearchScore,
  isLivePipelineRunning,
  activeLiveStepIndex,
  liveStepStatusLabel,
  livePipelineError,
  lastStepOutputPreview,
  recentEvents,
  selectedOverviewStageIdx,
  onSelectOverviewStageIdx,
  onStartLivePipeline,
  onNavigateTab,
  onOpenTokensView,
  onOpenChatWithPrompt,
}: V5ExecutiveOverviewPanelProps) {
  const cardSurface = isLightTheme
    ? 'border-[#E9EEF5] bg-white shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] text-[#0F172A]'
    : 'border-slate-800/90 bg-[#111927] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.35)] text-slate-100';
  const mutedText = isLightTheme ? 'text-slate-500' : 'text-slate-400';

  const activeTargetJob =
    jobs.find((j) => j.status === 'drafting-article' || j.status === 'generating-visuals') ||
    jobs.find((j) => j.status === 'queued') ||
    jobs[0];

  const activeStageBar =
    DEPARTMENT_STAGE_BARS[selectedOverviewStageIdx] || DEPARTMENT_STAGE_BARS[0];

  const avgKd =
    jobs.length > 0
      ? Math.round(jobs.reduce((acc, j) => acc + (j.kdProxyScore || 18), 0) / jobs.length)
      : 18;
  const combinedHealth = Math.round((overallSiteHealthScore + aiSearchScore) / 2);

  const getJobStatusPill = (status: AutomatedArticleJob['status']) => {
    if (status === 'published' || status === 'ready-for-review') {
      return {
        label: status === 'published' ? 'Published' : 'Ready',
        classes: isLightTheme
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-emerald-500/15 text-emerald-300',
      };
    }
    if (
      status === 'drafting-article' ||
      status === 'generating-visuals' ||
      status === 'qa-critic-review'
    ) {
      return {
        label: 'Drafting',
        classes: isLightTheme
          ? 'bg-blue-50 text-[#2563EB]'
          : 'bg-blue-500/15 text-sky-300',
      };
    }
    return {
      label: 'Queued',
      classes: isLightTheme
        ? 'bg-slate-100 text-slate-600'
        : 'bg-slate-800 text-slate-300',
    };
  };

  return (
    <div className="space-y-5">
      {/* ====================================================================
          ROW 1: 4 HERO KPI CARDS (BERRY & MATERIALLY ERGONOMICS)
         ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Content Pipeline */}
        <div className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 ${cardSurface}`}>
          <div className="flex items-center justify-between gap-3">
            <span className={`text-xs font-semibold ${mutedText}`}>Content Pipeline</span>
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
                isLightTheme ? 'bg-blue-50 text-[#2563EB]' : 'bg-blue-500/15 text-blue-400'
              }`}
            >
              <AgencyUiIcon name="dashboard-grid" className="w-[18px] h-[18px]" />
            </span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="font-mono text-[28px] leading-tight font-bold tabular-nums">
              {jobs.length} Topics
            </div>
            <MiniSparkline colorHex="#2563EB" points="2,22 14,18 26,20 38,11 52,14 66,5" />
          </div>
          <div className={`text-xs font-medium ${mutedText}`}>
            {queuedCount} queued · Avg. KD {avgKd}
          </div>
        </div>

        {/* Card 2: Published & Ready */}
        <div className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 ${cardSurface}`}>
          <div className="flex items-center justify-between gap-3">
            <span className={`text-xs font-semibold ${mutedText}`}>Published &amp; Ready</span>
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
                isLightTheme
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-emerald-500/15 text-emerald-400'
              }`}
            >
              <AgencyUiIcon name="check-shield" className="w-[18px] h-[18px]" />
            </span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="font-mono text-[28px] leading-tight font-bold tabular-nums">
              {completedCount}{' '}
              <span className={`text-base font-semibold ${mutedText}`}>/ {jobs.length}</span>
            </div>
            <MiniSparkline colorHex="#10B981" points="2,24 16,20 30,17 42,15 54,9 66,4" />
          </div>
          <div className={`text-xs font-medium ${mutedText}`}>
            {isLivePipelineRunning ? 'Live execution running' : '150-pt QA verified'}
          </div>
        </div>

        {/* Card 3: Site & AI Readiness */}
        <div className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 ${cardSurface}`}>
          <div className="flex items-center justify-between gap-3">
            <span className={`text-xs font-semibold ${mutedText}`}>Site &amp; AI Readiness</span>
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
                isLightTheme
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'bg-indigo-500/15 text-indigo-400'
              }`}
            >
              <AgencyUiIcon name="technical" className="w-[18px] h-[18px]" />
            </span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="font-mono text-[28px] leading-tight font-bold tabular-nums">
              {combinedHealth}%
            </div>
            <MiniSparkline colorHex="#6366F1" points="2,20 15,16 28,18 40,12 53,10 66,7" />
          </div>
          <div className={`text-xs font-medium ${mutedText}`}>
            CWV {overallSiteHealthScore}% · AI Citation {aiSearchScore}%
          </div>
        </div>

        {/* Card 4: Session API Usage */}
        <div className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 ${cardSurface}`}>
          <div className="flex items-center justify-between gap-3">
            <span className={`text-xs font-semibold ${mutedText}`}>Session API Usage</span>
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
                isLightTheme ? 'bg-amber-50 text-amber-600' : 'bg-amber-500/15 text-amber-400'
              }`}
            >
              <AgencyUiIcon name="activity" className="w-[18px] h-[18px]" />
            </span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="font-mono text-[28px] leading-tight font-bold tabular-nums">
              {totalSessionTokens.toLocaleString()}
            </div>
            <MiniSparkline colorHex="#F59E0B" points="2,23 18,22 30,19 44,16 55,11 66,8" />
          </div>
          <div className={`text-xs font-medium truncate ${mutedText}`}>
            ${totalShadowCostUsd.toFixed(4)} eq. · {isFreeTierKeyActive ? 'Free Key' : activeModelId}
          </div>
        </div>
      </div>

      {/* ====================================================================
          ROW 2: 8-COL LIVE PIPELINE & ACTIVITY CHART + 4-COL CONCENTRIC RINGS
         ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Cols: Live 5-Step Runner & Department Activity */}
        <section className={`lg:col-span-8 rounded-2xl border p-6 space-y-5 ${cardSurface}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2.5">
                <h3 className="text-[15px] font-semibold">Live Editorial Pipeline</h3>
                {activeTargetJob && (
                  <span
                    className={`rounded-lg px-2.5 py-0.5 text-xs font-medium ${
                      isLightTheme
                        ? 'bg-blue-50 text-[#2563EB]'
                        : 'bg-blue-500/15 text-sky-300'
                    }`}
                  >
                    {activeTargetJob.primaryKeyword}
                  </span>
                )}
              </div>
              <p className={`text-sm font-medium truncate ${mutedText}`}>
                {activeTargetJob ? activeTargetJob.topicTitle : `Workspace ready for ${siteName}`}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() =>
                  onOpenChatWithPrompt(
                    `Review live progress for "${activeTargetJob?.topicTitle || siteName}".`
                  )
                }
                className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                  isLightTheme
                    ? 'border-[#E2E8F0] bg-white text-slate-700 hover:bg-slate-50'
                    : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                }`}
              >
                Ask Copilot
              </button>
              <button
                type="button"
                data-v5-solid="true"
                disabled={isLivePipelineRunning || !activeTargetJob}
                onClick={() => onStartLivePipeline(activeTargetJob)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 px-4 py-2 text-xs font-semibold text-white shadow-sm transition"
              >
                <AgencyUiIcon name="play" className="w-3.5 h-3.5" />
                <span>
                  {isLivePipelineRunning && activeLiveStepIndex !== null
                    ? `Step ${activeLiveStepIndex + 1} of 5...`
                    : 'Start Writing Live'}
                </span>
              </button>
            </div>
          </div>

          {/* Connected 5-Step Horizontal Stepper */}
          <div
            className={`rounded-xl border p-4 ${
              isLightTheme ? 'border-[#E9EEF5] bg-[#F8FAFC]' : 'border-slate-800 bg-[#0F172A]'
            }`}
          >
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {LIVE_FIVE_STEP_LABELS.map((step) => {
                const isCurrent = isLivePipelineRunning && activeLiveStepIndex === step.idx;
                const isDone =
                  (activeLiveStepIndex !== null && step.idx < activeLiveStepIndex) ||
                  (!isLivePipelineRunning &&
                    (activeTargetJob?.status === 'ready-for-review' ||
                      activeTargetJob?.status === 'published'));
                return (
                  <div key={step.idx} className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                            ? 'bg-[#2563EB] text-white ring-4 ring-blue-500/20'
                            : isLightTheme
                              ? 'bg-white border border-slate-200 text-slate-500'
                              : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isDone ? '✓' : step.idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{step.label}</div>
                      <div className={`text-xs truncate ${mutedText}`}>
                        {isDone ? 'Done' : isCurrent ? 'Running' : 'Pending'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={`mt-3 pt-2.5 border-t text-xs flex items-center justify-between gap-2 ${
              isLightTheme ? 'border-slate-200/80 text-slate-500' : 'border-slate-800 text-slate-400'
            }`}>
              <span className="truncate">{liveStepStatusLabel}</span>
              <span className="font-mono shrink-0">{activeModelId}</span>
            </div>
          </div>

          {livePipelineError && (
            <div
              className={`rounded-xl border px-4 py-2.5 text-xs font-medium ${
                isLightTheme
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-amber-500/30 bg-amber-950/30 text-amber-300'
              }`}
            >
              {livePipelineError}
            </div>
          )}

          {/* Department Output Chart or Live Draft Preview */}
          {lastStepOutputPreview ? (
            <div
              className={`rounded-xl border p-4 text-xs font-mono whitespace-pre-wrap max-h-44 overflow-y-auto ${
                isLightTheme
                  ? 'border-[#E9EEF5] bg-[#F8FAFC] text-slate-700'
                  : 'border-slate-800 bg-[#0F172A] text-slate-300'
              }`}
            >
              {lastStepOutputPreview}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-semibold ${mutedText}`}>
                  Workflow Throughput by Department
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateTab(activeStageBar.tabId)}
                  className="text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  Open {activeStageBar.title} →
                </button>
              </div>
              <div className="grid grid-cols-6 gap-3 pt-2 items-end h-32">
                {DEPARTMENT_STAGE_BARS.map((stage, idx) => {
                  const selected = idx === selectedOverviewStageIdx;
                  return (
                    <button
                      key={stage.title}
                      type="button"
                      onClick={() => onSelectOverviewStageIdx(idx)}
                      className="flex flex-col items-center justify-end h-full gap-2 group"
                    >
                      <div
                        className={`w-full max-w-[36px] rounded-t-lg transition-all ${
                          selected ? 'opacity-100 ring-2 ring-offset-2 ring-blue-500/40' : 'opacity-75 group-hover:opacity-100'
                        }`}
                        style={{
                          height: `${stage.baseHeight}%`,
                          backgroundColor: stage.colorHex,
                        }}
                      />
                      <span
                        className={`text-xs font-medium truncate max-w-full ${
                          selected ? 'text-[#2563EB] font-semibold' : mutedText
                        }`}
                      >
                        {stage.title}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className={`text-xs ${mutedText}`}>
                <strong className={isLightTheme ? 'text-slate-700' : 'text-slate-200'}>
                  {activeStageBar.owner}:
                </strong>{' '}
                {activeStageBar.handoffNote}
              </div>
            </div>
          )}
        </section>

        {/* Right 4 Cols: Materially-Style Concentric Circular Progress Card */}
        <section className={`lg:col-span-4 rounded-2xl border p-6 flex flex-col justify-between gap-5 ${cardSurface}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold">Site &amp; AI Health</h3>
              <p className={`text-xs mt-0.5 ${mutedText}`}>Live technical &amp; citation score</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('technical-seo')}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              Audit →
            </button>
          </div>

          <ConcentricHealthGauge
            technicalScore={overallSiteHealthScore}
            aiScore={aiSearchScore}
            isLightTheme={isLightTheme}
          />

          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={() => onNavigateTab('technical-seo')}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs transition ${
                isLightTheme ? 'bg-[#F8FAFC] hover:bg-slate-100' : 'bg-[#0F172A] hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5 font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
                Technical &amp; CWV
              </span>
              <span className="font-mono font-bold tabular-nums">{overallSiteHealthScore}%</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('off-page-seo')}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs transition ${
                isLightTheme ? 'bg-[#F8FAFC] hover:bg-slate-100' : 'bg-[#0F172A] hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5 font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                AI Search Discoverability
              </span>
              <span className="font-mono font-bold tabular-nums">{aiSearchScore}%</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('on-page-seo')}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs transition ${
                isLightTheme ? 'bg-[#F8FAFC] hover:bg-slate-100' : 'bg-[#0F172A] hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5 font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-[#6366F1]" />
                On-Page Readiness
              </span>
              <span className="font-mono font-bold tabular-nums text-[#2563EB]">View Gaps →</span>
            </button>
          </div>
        </section>
      </div>

      {/* ====================================================================
          ROW 3: 8-COL CLEAN CAMPAIGN TABLE + 4-COL RECENT ACTIVITY TIMELINE
         ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className={`lg:col-span-8 rounded-2xl border p-6 space-y-4 ${cardSurface}`}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[15px] font-semibold">
              Campaign Article Queue ({jobs.length})
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('qa-publishing')}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              Open Publish Queue →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className={`border-b text-xs font-semibold ${
                    isLightTheme
                      ? 'border-[#E9EEF5] text-slate-500'
                      : 'border-slate-800 text-slate-400'
                  }`}
                >
                  <th className="pb-3 pr-4">Article Topic</th>
                  <th className="pb-3 px-4">Target Keyword</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody
                className={
                  isLightTheme ? 'divide-y divide-[#E9EEF5]' : 'divide-y divide-slate-800/80'
                }
              >
                {jobs.slice(0, 5).map((job) => {
                  const isDone = job.status === 'published' || job.status === 'ready-for-review';
                  const pill = getJobStatusPill(job.status);
                  return (
                    <tr
                      key={job.id}
                      className={isLightTheme ? 'hover:bg-slate-50/80' : 'hover:bg-slate-900/40'}
                    >
                      <td className="py-3.5 pr-4">
                        <div className="text-sm font-medium leading-snug max-w-md truncate">
                          {job.topicTitle}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className={`text-xs font-mono ${mutedText}`}>
                          {job.primaryKeyword} · KD {job.kdProxyScore}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${pill.classes}`}
                        >
                          {pill.label}
                        </span>
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <button
                          type="button"
                          disabled={isLivePipelineRunning}
                          onClick={() =>
                            isDone ? onNavigateTab('content-writing') : onStartLivePipeline(job)
                          }
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            isDone
                              ? isLightTheme
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                              : isLightTheme
                                ? 'bg-blue-50 text-[#2563EB] hover:bg-blue-100'
                                : 'bg-blue-500/15 text-sky-300 hover:bg-blue-500/25'
                          }`}
                        >
                          {isDone ? 'Open Draft' : 'Run Live'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className={`lg:col-span-4 rounded-2xl border p-6 space-y-4 ${cardSurface}`}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[15px] font-semibold">Recent Activity</h3>
            <button
              type="button"
              onClick={onOpenTokensView}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              View Ledger →
            </button>
          </div>

          {recentEvents.length === 0 ? (
            <div
              className={`rounded-xl border border-dashed p-6 text-center space-y-2 ${
                isLightTheme ? 'border-slate-200 bg-[#F8FAFC]' : 'border-slate-800 bg-[#0F172A]'
              }`}
            >
              <div className="font-mono text-base font-bold">0 Tokens Used</div>
              <p className={`text-xs ${mutedText}`}>
                Start a live article pipeline or ask Copilot to view real-time API usage here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvents.slice(0, 5).map((ev) => (
                <div
                  key={ev.eventId}
                  className={`flex items-start justify-between gap-3 rounded-xl px-3.5 py-2.5 ${
                    isLightTheme ? 'bg-[#F8FAFC]' : 'bg-[#0F172A]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{ev.actorName}</div>
                    <div className={`text-xs truncate mt-0.5 ${mutedText}`}>
                      {ev.actionLabel}
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#2563EB] shrink-0 tabular-nums">
                    +{ev.totalTokens.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

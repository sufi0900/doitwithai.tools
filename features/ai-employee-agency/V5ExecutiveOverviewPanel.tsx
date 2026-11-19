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
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V5 PHASE 19)
 * Component: `features/ai-employee-agency/V5ExecutiveOverviewPanel.tsx`
 *
 * Frontier SaaS Executive Overview Dashboard:
 * - Clean Light (#FFFFFF / #F6F8FC) & Dark (#0F172A / #060B16) surfaces
 * - Tabular monospace KPI metrics + 5-Step Live Execution Pipeline Card
 * - Original SVG Circular Progress Rings (Technical CWV + AI Visibility)
 * - Compact Campaign Approval Queue & Live Token Activity Feed
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
  { idx: 0, label: 'Keyword Brief', role: 'Keyword Lead' },
  { idx: 1, label: 'GEO Draft', role: 'Section Writer' },
  { idx: 2, label: 'Visual Pack', role: 'Design Director' },
  { idx: 3, label: '150-Pt QA', role: 'QA Publisher' },
  { idx: 4, label: 'Social Dist.', role: 'Social Manager' },
] as const;

const AGENCY_SIX_STAGE_HANDOFFS: Array<{
  title: string;
  owner: string;
  tabId: AgencySidebarTabId;
  handoffNote: string;
}> = [
  {
    title: '01 · Discovery',
    owner: 'Keyword & Trend Lead',
    tabId: 'keyword-strategist',
    handoffNote: 'Live DOM crawl + low-KD cluster brief delivered.',
  },
  {
    title: '02 · Editorial',
    owner: 'Long-Form GEO Writer',
    tabId: 'content-writing',
    handoffNote: 'Direct-answer + comparison Markdown synthesized.',
  },
  {
    title: '03 · Visuals',
    owner: 'Design & Infographic Lead',
    tabId: 'graphic-design',
    handoffNote: 'Hero & 6-block infographic SVGs prepared.',
  },
  {
    title: '04 · Technical QA',
    owner: '150-Pt QA & Schema Gate',
    tabId: 'qa-publishing',
    handoffNote: 'JSON-LD, slug, links & readability verified.',
  },
  {
    title: '05 · Social Matrix',
    owner: 'Omnichannel Social Lead',
    tabId: 'social-video-fleet',
    handoffNote: 'LinkedIn, X & Pinterest asset variants generated.',
  },
  {
    title: '06 · Authority',
    owner: 'Off-Page & Backlink Lead',
    tabId: 'off-page-seo',
    handoffNote: 'Niche partner placement & citation loop active.',
  },
];

function CircularHealthRing({
  score,
  label,
  sublabel,
  strokeHex,
  isLightTheme,
}: {
  score: number;
  label: string;
  sublabel: string;
  strokeHex: string;
  isLightTheme: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={`rounded-2xl border p-4 flex items-center gap-4 ${
        isLightTheme ? 'border-slate-200 bg-[#F8FAFC]' : 'border-slate-800 bg-[#0B1120]'
      }`}
    >
      <div className="relative h-24 w-24 shrink-0 flex items-center justify-center">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96" aria-hidden="true">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            strokeWidth="8"
            className={isLightTheme ? 'stroke-slate-200' : 'stroke-slate-800'}
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            strokeWidth="8"
            stroke={strokeHex}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 600ms ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-lg font-black tabular-nums">{clamped}%</span>
        </div>
      </div>

      <div className="min-w-0 space-y-1">
        <div className="text-sm font-extrabold truncate">{label}</div>
        <div className={`text-xs ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>
          {sublabel}
        </div>
      </div>
    </div>
  );
}

export default function V5ExecutiveOverviewPanel({
  isLightTheme,
  siteName,
  siteUrl,
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
    ? 'border-slate-200 bg-white shadow-sm'
    : 'border-slate-800/90 bg-[#0F172A]';
  const subSurface = isLightTheme
    ? 'border-slate-200 bg-[#F8FAFC]'
    : 'border-slate-800 bg-[#0B1120]';
  const mutedText = isLightTheme ? 'text-slate-500' : 'text-slate-400';

  const activeTargetJob =
    jobs.find((j) => j.status === 'drafting-article' || j.status === 'generating-visuals') ||
    jobs.find((j) => j.status === 'queued') ||
    jobs[0];

  const activeHandoff =
    AGENCY_SIX_STAGE_HANDOFFS[selectedOverviewStageIdx] || AGENCY_SIX_STAGE_HANDOFFS[0];

  const getJobStatusBadge = (status: AutomatedArticleJob['status']) => {
    if (status === 'published' || status === 'ready-for-review') {
      return isLightTheme
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
    if (status === 'drafting-article' || status === 'generating-visuals' || status === 'qa-critic-review') {
      return isLightTheme
        ? 'bg-blue-50 text-[#1D4ED8] border-blue-200'
        : 'bg-blue-500/15 text-sky-300 border-blue-500/30';
    }
    return isLightTheme
      ? 'bg-slate-100 text-slate-600 border-slate-200'
      : 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="space-y-5">
      {/* Row 1: Top 4-Card KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className={`rounded-2xl border p-5 ${cardSurface}`}>
          <div className={`text-[11px] font-bold uppercase tracking-wider ${mutedText}`}>
            Completed / Ready
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono text-2xl font-black tabular-nums">
              {completedCount}
              <span className={`text-sm font-semibold ${mutedText}`}> / {jobs.length}</span>
            </span>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-bold text-emerald-500">
              Live Queue
            </span>
          </div>
          <div className={`mt-1.5 text-xs ${mutedText}`}>
            {queuedCount} topic(s) queued next
          </div>
        </div>

        <div className={`rounded-2xl border p-5 ${cardSurface}`}>
          <div className={`text-[11px] font-bold uppercase tracking-wider ${mutedText}`}>
            Session Tokens Burned
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono text-2xl font-black tabular-nums">
              {totalSessionTokens.toLocaleString()}
            </span>
            <span className="font-mono text-xs font-bold text-[#2563EB]">
              ${totalShadowCostUsd.toFixed(4)} eq.
            </span>
          </div>
          <div className={`mt-1.5 text-xs ${mutedText}`}>
            {isFreeTierKeyActive ? 'Free API Slot · $0.00 billed' : 'Paid API Key Active'}
          </div>
        </div>

        <div className={`rounded-2xl border p-5 ${cardSurface}`}>
          <div className={`text-[11px] font-bold uppercase tracking-wider ${mutedText}`}>
            Active Execution Engine
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="font-mono text-sm font-extrabold truncate">{activeModelId}</span>
            <button
              type="button"
              onClick={onOpenTokensView}
              className="text-xs font-bold text-[#2563EB] hover:underline shrink-0"
            >
              Configure →
            </button>
          </div>
          <div className={`mt-1.5 text-xs ${mutedText}`}>36 specialists ready on call</div>
        </div>

        <div className={`rounded-2xl border p-5 ${cardSurface}`}>
          <div className={`text-[11px] font-bold uppercase tracking-wider ${mutedText}`}>
            Workspace Site
          </div>
          <div className="mt-2 text-base font-extrabold truncate">{siteName}</div>
          <div className={`mt-1 text-xs font-mono truncate ${mutedText}`}>{siteUrl}</div>
        </div>
      </div>

      {/* Row 2: Live 5-Step Autonomous Execution Card */}
      <section className={`rounded-2xl border p-5 sm:p-6 space-y-4 ${cardSurface}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                  isLivePipelineRunning
                    ? 'bg-blue-500/15 text-[#2563EB] border-blue-500/30'
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isLivePipelineRunning ? 'bg-[#2563EB] animate-ping' : 'bg-emerald-500'
                  }`}
                />
                {isLivePipelineRunning ? 'Executing Live LLM Pipeline' : 'Real-Time Pipeline Ready'}
              </span>
              <span className={`text-xs font-mono ${mutedText}`}>{liveStepStatusLabel}</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold truncate">
              {activeTargetJob ? activeTargetJob.topicTitle : 'No queued topic selected'}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                onOpenChatWithPrompt(
                  `Inspect live status of "${activeTargetJob?.topicTitle || siteName}" and suggest improvements.`
                )
              }
              className={`rounded-xl border px-3.5 py-2.5 text-xs font-bold transition ${
                isLightTheme
                  ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
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
              className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-60 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition"
            >
              <AgencyUiIcon name="play" className="w-3.5 h-3.5" />
              <span>
                {isLivePipelineRunning && activeLiveStepIndex !== null
                  ? `Running Step ${activeLiveStepIndex + 1}/5...`
                  : 'Start Writing Live →'}
              </span>
            </button>
          </div>
        </div>

        {/* 5 Sequential Specialist Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {LIVE_FIVE_STEP_LABELS.map((step) => {
            const isCurrent = isLivePipelineRunning && activeLiveStepIndex === step.idx;
            const isCompleted =
              (activeLiveStepIndex !== null && step.idx < activeLiveStepIndex) ||
              (!isLivePipelineRunning &&
                (activeTargetJob?.status === 'ready-for-review' ||
                  activeTargetJob?.status === 'published'));

            return (
              <div
                key={step.idx}
                className={`rounded-xl border p-3 transition ${
                  isCurrent
                    ? 'border-[#2563EB] bg-blue-500/10'
                    : isCompleted
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : subSurface
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                  <span>Step 0{step.idx + 1}</span>
                  {isCompleted ? (
                    <span className="text-emerald-500">DONE</span>
                  ) : isCurrent ? (
                    <span className="text-[#2563EB] animate-pulse">LIVE</span>
                  ) : (
                    <span className={mutedText}>WAIT</span>
                  )}
                </div>
                <div className="text-xs font-extrabold mt-1 truncate">{step.label}</div>
                <div className={`text-[11px] truncate ${mutedText}`}>{step.role}</div>
              </div>
            );
          })}
        </div>

        {livePipelineError && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-500">
            API Diagnostic Notice: {livePipelineError}
          </div>
        )}

        {lastStepOutputPreview && (
          <div className={`rounded-xl border p-3.5 text-xs font-mono whitespace-pre-wrap max-h-36 overflow-y-auto ${subSurface}`}>
            {lastStepOutputPreview}
          </div>
        )}
      </section>

      {/* Row 3: Original Circular Health Rings (7 cols) + Interactive Stage Flow (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className={`lg:col-span-7 rounded-2xl border p-5 space-y-4 ${cardSurface}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold">Site Health &amp; AI Visibility Rings</h3>
              <p className={`text-xs mt-0.5 ${mutedText}`}>
                Live technical readiness and generative citation telemetry for {siteName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab('technical-seo')}
                className="text-xs font-bold text-[#2563EB] hover:underline"
              >
                Full Audit →
              </button>
              <span className={mutedText}>·</span>
              <button
                type="button"
                onClick={() => onNavigateTab('off-page-seo')}
                className="text-xs font-bold text-[#2563EB] hover:underline"
              >
                AI Radar →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CircularHealthRing
              score={overallSiteHealthScore}
              label="Technical & CWV Health"
              sublabel="Meta tags, canonicals, LCP & Schema"
              strokeHex="#2563EB"
              isLightTheme={isLightTheme}
            />
            <CircularHealthRing
              score={aiSearchScore}
              label="AI Search Discoverability"
              sublabel="Perplexity, ChatGPT & AI Overviews"
              strokeHex="#10B981"
              isLightTheme={isLightTheme}
            />
          </div>
        </section>

        <section className={`lg:col-span-5 rounded-2xl border p-5 space-y-3.5 ${cardSurface}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold">6-Department Handoff Chain</h3>
            <span className={`text-[11px] font-mono ${mutedText}`}>Click stage</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AGENCY_SIX_STAGE_HANDOFFS.map((stage, idx) => {
              const selected = idx === selectedOverviewStageIdx;
              return (
                <button
                  key={stage.title}
                  type="button"
                  onClick={() => onSelectOverviewStageIdx(idx)}
                  className={`rounded-xl border px-2.5 py-2 text-left text-xs font-bold transition ${
                    selected
                      ? 'border-[#2563EB] bg-blue-500/10 text-[#2563EB]'
                      : subSurface
                  }`}
                >
                  <div className="truncate">{stage.title}</div>
                </button>
              );
            })}
          </div>

          <div className={`rounded-xl border p-3.5 space-y-2 ${subSurface}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold">{activeHandoff.owner}</span>
              <button
                type="button"
                onClick={() => onNavigateTab(activeHandoff.tabId)}
                className="text-xs font-bold text-[#2563EB] hover:underline shrink-0"
              >
                Open Office →
              </button>
            </div>
            <p className={`text-xs leading-relaxed ${mutedText}`}>{activeHandoff.handoffNote}</p>
          </div>
        </section>
      </div>

      {/* Row 4: Founder Approval Queue (7 cols) + Live Token Activity Feed (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className={`lg:col-span-7 rounded-2xl border p-5 space-y-3.5 ${cardSurface}`}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-extrabold">Active Editorial Pipeline ({jobs.length})</h3>
            <button
              type="button"
              onClick={() => onNavigateTab('qa-publishing')}
              className="text-xs font-bold text-[#2563EB] hover:underline"
            >
              QA &amp; Publish Queue →
            </button>
          </div>

          <div className="space-y-2.5">
            {jobs.slice(0, 5).map((job) => {
              const isDone = job.status === 'published' || job.status === 'ready-for-review';
              return (
                <div
                  key={job.id}
                  className={`rounded-xl border p-3.5 flex flex-wrap items-center justify-between gap-3 ${subSurface}`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${getJobStatusBadge(
                          job.status
                        )}`}
                      >
                        {job.status}
                      </span>
                      <span className={`font-mono text-[11px] ${mutedText}`}>
                        KD {job.kdProxyScore} · {job.primaryKeyword}
                      </span>
                    </div>
                    <div className="text-sm font-bold truncate">{job.topicTitle}</div>
                  </div>

                  <button
                    type="button"
                    data-v5-solid={!isDone ? 'true' : undefined}
                    disabled={isLivePipelineRunning}
                    onClick={() =>
                      isDone ? onNavigateTab('qa-publishing') : onStartLivePipeline(job)
                    }
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition shrink-0 ${
                      isDone
                        ? isLightTheme
                          ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          : 'border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                        : 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white'
                    }`}
                  >
                    {isDone ? 'Inspect Draft →' : 'Run Live →'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className={`lg:col-span-5 rounded-2xl border p-5 space-y-3.5 ${cardSurface}`}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-extrabold">Live Token Feed</h3>
            <button
              type="button"
              onClick={onOpenTokensView}
              className="text-xs font-bold text-[#2563EB] hover:underline"
            >
              37-Row Ledger →
            </button>
          </div>

          {recentEvents.length === 0 ? (
            <div className={`rounded-xl border p-6 text-center text-xs space-y-2 ${subSurface}`}>
              <div className="font-mono font-bold text-sm">0 Tokens · $0.0000</div>
              <p className={mutedText}>
                Session initialized cleanly at zero. Click &quot;Start Writing Live&quot; or send a copilot prompt to stream live API usage.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentEvents.slice(0, 5).map((ev) => (
                <div
                  key={ev.eventId}
                  className={`rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs ${subSurface}`}
                >
                  <div className="min-w-0">
                    <div className="font-bold truncate">{ev.actorName}</div>
                    <div className={`truncate ${mutedText}`}>{ev.actionLabel}</div>
                  </div>
                  <div className="text-right font-mono shrink-0">
                    <div className="font-extrabold text-[#2563EB]">
                      +{ev.totalTokens.toLocaleString()} tok
                    </div>
                    <div className={mutedText}>${ev.shadowCostUsd.toFixed(4)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

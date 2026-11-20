'use client';

import { useEffect, useRef, useState } from 'react';
import { agencyRequest } from './agency-request';
import type { KnowledgeRow } from './KnowledgeReview';

interface QueuedTopicItem {
  id: string;
  content: {
    topic?: string;
    priority_at?: string;
  };
}

interface StepResponse {
  ok?: boolean;
  error?: string;
  runId?: string;
  contentItemId?: string;
  topic?: string;
  targetSlug?: string;
  evidence?: Array<{ url: string; excerpt: string }>;
  articleMeta?: {
    title: string;
    description: string;
    slug: string;
  };
  heroSvg?: string;
  qaScore?: {
    disposition: string;
    total?: number;
    feedback: string;
  };
  socialDraftsSaved?: number;
  generatedContent?: string;
  tokenUsage?: {
    modelId?: string;
    totalTokens?: number;
    shadowPaidCostUsd?: number;
  };
}

const PIPELINE_STAGES = [
  { idx: 0, agentId: 'keywords', label: 'Keyword & Web Research', specialist: 'Keyword Strategist' },
  { idx: 1, agentId: 'writer', label: 'Article Writing', specialist: 'SEO & GEO Writer' },
  { idx: 2, agentId: 'visual', label: 'Brand Visuals', specialist: 'Visual Designer' },
  { idx: 3, agentId: 'qa', label: '100-Pt QA Gate', specialist: 'QA & Fact-Check' },
  { idx: 4, agentId: 'social', label: 'Social & Delivery Queue', specialist: 'Social Distributor' },
] as const;

export function LivePipelineTracker({
  website,
  counts,
  autoRunTopic,
  onClearAutoRun,
  onStageChange,
  onCompleted,
  onOpenQa,
}: {
  website: KnowledgeRow;
  counts: { published: number; ready: number; queued: number };
  autoRunTopic?: string;
  onClearAutoRun?: () => void;
  onStageChange?: (agentId: string | null) => void;
  onCompleted: () => Promise<void>;
  onOpenQa: () => void;
}) {
  const [queue, setQueue] = useState<QueuedTopicItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [running, setRunning] = useState(false);
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [activeTopicLabel, setActiveTopicLabel] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [previewOutput, setPreviewOutput] = useState('');
  const [previewHeroSvg, setPreviewHeroSvg] = useState('');
  const [runTokens, setRunTokens] = useState(0);
  const [runUsd, setRunUsd] = useState(0);
  const [lastModel, setLastModel] = useState('');
  const [qaVerdict, setQaVerdict] = useState<string>('');
  const autoTriggeredRef = useRef(false);

  async function loadQueue() {
    try {
      const res = await agencyRequest('/api/ai-employee-agency/calendar');
      if (!res.ok) return;
      const data = (await res.json()) as { queue?: QueuedTopicItem[] };
      const items = Array.isArray(data.queue) ? data.queue : [];
      setQueue(items);
      if (items.length > 0 && !selectedItemId) {
        setSelectedItemId(items[0].id);
      }
    } catch {
      // Queue load is non-fatal
    }
  }

  useEffect(() => {
    void loadQueue();
  }, [counts.queued, counts.ready, counts.published]);

  useEffect(() => {
    return () => {
      onStageChange?.(null);
    };
  }, [onStageChange]);

  async function executeLiveRun(overrideItem?: QueuedTopicItem, fallbackTopic?: string) {
    if (running) return;
    const chosen =
      overrideItem ||
      queue.find((q) => q.id === selectedItemId) ||
      queue[0];
    const topicText =
      chosen?.content?.topic?.trim() ||
      fallbackTopic?.trim() ||
      '';

    if (!topicText) {
      setErrorMessage('Queue at least one topic in Keyword & Topics before starting a live run.');
      return;
    }

    setRunning(true);
    setErrorMessage('');
    setCompletedStages([]);
    setActiveStage(0);
    onStageChange?.(PIPELINE_STAGES[0].agentId);
    setActiveTopicLabel(topicText);
    setPreviewOutput('');
    setPreviewHeroSvg('');
    setRunTokens(0);
    setRunUsd(0);
    setQaVerdict('');
    setStatusMessage(`Starting live 5-stage run for "${topicText}"…`);

    let runId: string | undefined;
    let contentItemId = chosen?.id;
    let targetSlug: string | undefined;
    let evidence: Array<{ url: string; excerpt: string }> = [];
    let previousOutput = '';
    let articleTitle = topicText;
    let articleDescription = '';
    let articleBody = '';
    let heroSvg = '';

    try {
      for (let stepIdx = 0; stepIdx <= 4; stepIdx += 1) {
        setActiveStage(stepIdx);
        onStageChange?.(PIPELINE_STAGES[stepIdx].agentId);
        setStatusMessage(
          `Stage ${stepIdx + 1}/5 · ${PIPELINE_STAGES[stepIdx].label} (${PIPELINE_STAGES[stepIdx].specialist})…`,
        );

        const res = await agencyRequest('/api/ai-employee-agency/run-agent-step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stepIndex: stepIdx,
            contentItemId,
            runId,
            siteName: website.profile.name || website.domain,
            siteUrl: website.domain,
            niche: website.profile.industry || '',
            jobTitle: articleTitle,
            targetKeyword: topicText,
            targetSlug,
            previousStepOutput: previousOutput,
            articleTitle,
            articleDescription,
            articleBody,
            heroSvg,
            evidence,
          }),
        });

        const data = (await res.json().catch(() => ({}))) as StepResponse;
        if (!res.ok || !data.ok) {
          throw new Error(
            data.error || `Stage ${stepIdx + 1} failed (HTTP ${res.status}).`,
          );
        }

        if (data.runId) runId = data.runId;
        if (data.contentItemId) contentItemId = data.contentItemId;
        if (data.targetSlug) targetSlug = data.targetSlug;
        if (Array.isArray(data.evidence)) evidence = data.evidence;
        if (data.articleMeta) {
          articleTitle = data.articleMeta.title;
          articleDescription = data.articleMeta.description;
          targetSlug = data.articleMeta.slug;
        }
        if (data.heroSvg) {
          heroSvg = data.heroSvg;
          setPreviewHeroSvg(data.heroSvg);
        }
        if (data.generatedContent) {
          previousOutput = data.generatedContent;
          setPreviewOutput(data.generatedContent);
          if (stepIdx === 1) {
            articleBody = data.generatedContent;
          }
        }
        if (data.qaScore) {
          setQaVerdict(
            `${data.qaScore.disposition.replace('_', ' ')}${
              data.qaScore.total !== undefined ? ` · ${data.qaScore.total}/100` : ''
            }`,
          );
        }
        if (data.tokenUsage) {
          setRunTokens((prev) => prev + (data.tokenUsage?.totalTokens || 0));
          setRunUsd((prev) => prev + (data.tokenUsage?.shadowPaidCostUsd || 0));
          if (data.tokenUsage.modelId) setLastModel(data.tokenUsage.modelId);
        }

        setCompletedStages((prev) => [...prev, stepIdx]);
      }

      setStatusMessage(
        `Completed all 5 stages for "${articleTitle}". Saved draft, QA scorecard, and social kit to Supabase.`,
      );
      await onCompleted();
      await loadQueue();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Live production pipeline failed.',
      );
      setStatusMessage('');
    } finally {
      setRunning(false);
      setActiveStage(null);
      onStageChange?.(null);
    }
  }

  // Trigger Live Production Run #1 automatically when coming from Guided Onboarding Studio primary CTA
  useEffect(() => {
    if (!autoRunTopic || autoTriggeredRef.current || running) return;
    autoTriggeredRef.current = true;
    onClearAutoRun?.();
    const timer = setTimeout(() => {
      void executeLiveRun(undefined, autoRunTopic);
    }, 600);
    return () => clearTimeout(timer);
  }, [autoRunTopic]);

  const writtenCount = counts.published + counts.ready;
  const remainingCount = counts.queued;

  return (
    <section className="space-y-4 rounded-xl border border-slate-800 bg-[#111827] p-5">
      {/* Header + Written vs. Remaining Counters + Primary Action */}
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  running ? 'bg-blue-400 animate-ping' : 'bg-emerald-400'
                }`}
              />
              {running ? 'Live 5-Stage Pipeline Running' : 'Real-Time Production Pipeline'}
            </span>
            {qaVerdict && (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-medium capitalize text-emerald-300">
                QA: {qaVerdict}
              </span>
            )}
          </div>
          <h2 className="truncate text-base font-semibold text-white">
            {activeTopicLabel
              ? `Active Run: ${activeTopicLabel}`
              : 'Execute your queued articles live across all 5 specialists'}
          </h2>
        </div>

        {/* Written vs. Remaining Quota Strip */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-[#0B0F17] px-3 py-1.5 text-xs">
            <div>
              <span className="text-slate-400">Written </span>
              <strong className="font-mono text-emerald-300">{writtenCount}</strong>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span className="text-slate-400">Remaining </span>
              <strong className="font-mono text-blue-300">{remainingCount}</strong>
            </div>
          </div>

          <button
            type="button"
            disabled={running || (queue.length === 0 && !autoRunTopic)}
            onClick={() => void executeLiveRun()}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {running && activeStage !== null
              ? `Running Stage ${activeStage + 1}/5…`
              : 'Run Next Queued Topic Live →'}
          </button>
        </div>
      </div>

      {/* Topic Selector + Live Token Telemetry Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <label className="sr-only" htmlFor="live-pipeline-topic">
            Select queued topic
          </label>
          <select
            id="live-pipeline-topic"
            disabled={running || queue.length === 0}
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none disabled:opacity-60"
          >
            {queue.length === 0 ? (
              <option value="">No queued topics — add one in Keyword &amp; Topics</option>
            ) : (
              queue.map((item, idx) => (
                <option key={item.id} value={item.id}>
                  #{idx + 1} · {item.content.topic || 'Queued topic'}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 font-mono text-[11px] text-slate-400">
          <span className="rounded-md border border-slate-800 bg-[#0B0F17] px-2.5 py-1 text-slate-300">
            {runTokens.toLocaleString()} tokens · ${runUsd.toFixed(4)}
          </span>
          {lastModel && (
            <span className="rounded-md border border-slate-800 bg-[#0B0F17] px-2.5 py-1 text-blue-300">
              {lastModel}
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Animated 5-Stage Stepper */}
      <ol className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        {PIPELINE_STAGES.map((stage) => {
          const isCurrent = running && activeStage === stage.idx;
          const isDone = completedStages.includes(stage.idx);
          return (
            <li
              key={stage.idx}
              className={`rounded-xl border p-3 transition-all duration-300 ${
                isCurrent
                  ? 'border-[#2563EB] bg-blue-500/15 text-white shadow-sm'
                  : isDone
                    ? 'border-emerald-500/40 bg-[#0B0F17] text-slate-100'
                    : 'border-slate-800 bg-[#0B0F17]/70 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between gap-2 font-mono text-[10px] font-semibold">
                <span className={isCurrent ? 'text-blue-300' : 'text-slate-500'}>
                  0{stage.idx + 1}
                </span>
                {isDone ? (
                  <span className="text-emerald-400">DONE</span>
                ) : isCurrent ? (
                  <span className="inline-flex items-center gap-1 text-blue-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
                    LIVE
                  </span>
                ) : (
                  <span className="text-slate-600">WAIT</span>
                )}
              </div>
              <p className="mt-1.5 truncate text-xs font-semibold">{stage.label}</p>
              <p className="truncate text-[11px] text-slate-400">{stage.specialist}</p>
            </li>
          );
        })}
      </ol>

      {statusMessage && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-blue-500/30 bg-blue-950/30 px-3.5 py-2 text-xs text-blue-200"
        >
          <span className="min-w-0 flex-1 break-words">{statusMessage}</span>
          {completedStages.length === 5 && (
            <button
              type="button"
              onClick={onOpenQa}
              className="shrink-0 rounded-md border border-blue-400/40 bg-blue-500/20 px-2.5 py-1 text-[11px] font-semibold text-blue-100 hover:bg-blue-500/30"
            >
              Open QA &amp; Auto-Publish →
            </button>
          )}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-3.5 py-2.5 text-xs text-rose-200"
        >
          {errorMessage}
        </div>
      )}

      {/* Expandable Live Output Preview */}
      {(previewOutput || previewHeroSvg) && (
        <details
          open={running || completedStages.length === 5}
          className="rounded-xl border border-slate-800 bg-[#0B0F17] p-3.5 text-xs"
        >
          <summary className="cursor-pointer font-semibold text-slate-200">
            Live Stage Output Preview
          </summary>
          <div className="mt-3 space-y-3 border-t border-slate-800 pt-3">
            {previewHeroSvg && (
              <div
                className="mx-auto max-w-lg overflow-hidden rounded-lg border border-slate-800"
                dangerouslySetInnerHTML={{ __html: previewHeroSvg }}
              />
            )}
            {previewOutput && (
              <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-slate-300">
                {previewOutput}
              </pre>
            )}
          </div>
        </details>
      )}
    </section>
  );
}

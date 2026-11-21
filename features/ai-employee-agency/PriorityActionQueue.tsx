'use client';

import { useEffect, useState } from 'react';
import { agencyRequest } from './agency-request';
import type { KnowledgeRow } from './KnowledgeReview';

interface AssetQuotaRow {
  kind: string;
  day_count: number;
  month_count: number;
  month_limit: number;
}

interface UsageSummary {
  tier?: string;
  assets?: AssetQuotaRow[];
}

interface ScanSummary {
  totalChecked?: number;
  metaOk?: number;
  metaNeedsFix?: number;
  missingAltCount?: number;
  oversizedImageCount?: number;
}

interface PriorityActionItem {
  id: string;
  priority: 'P0' | 'P1' | 'P2';
  title: string;
  detail: string;
  targetView: string;
  ctaLabel: string;
}

export function PriorityActionQueue({
  website,
  counts,
  onNavigate,
}: {
  website: KnowledgeRow;
  counts: { published: number; ready: number; queued: number };
  onNavigate: (view: string) => void;
}) {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [scanSummary, setScanSummary] = useState<ScanSummary | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    agencyRequest('/api/ai-employee-agency/usage', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!controller.signal.aborted && data) setUsage(data);
      })
      .catch(() => undefined);

    agencyRequest('/api/ai-employee-agency/refresh', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!controller.signal.aborted && data?.scan?.report?.summary) {
          setScanSummary(data.scan.report.summary);
        }
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [website.revision, counts.published, counts.ready, counts.queued]);

  const isEstablished = website.profile.domain_maturity === 'established_site';
  const assets = usage?.assets || [];
  const articleQuota = assets.find((a) => a.kind === 'article');
  const optimizeQuota = assets.find((a) => a.kind === 'existing_page_optimization');
  const optimizeLimit =
    optimizeQuota?.month_limit ??
    (usage?.tier === 'agency-scale' ? 100 : usage?.tier === 'growth' ? 30 : 10);
  const optimizeUsed = optimizeQuota?.month_count ?? 0;
  const articleLimit =
    articleQuota?.month_limit ??
    (usage?.tier === 'agency-scale' ? 200 : usage?.tier === 'growth' ? 60 : 20);
  const articleUsed = articleQuota?.month_count ?? 0;

  const actions: PriorityActionItem[] = [];

  if (!scanSummary) {
    actions.push({
      id: 'p0-run-audit',
      priority: 'P0',
      title: 'Run Stage 1 Zero-LLM Technical & Media Audit ($0.00)',
      detail: `Check robots.txt, sitemap.xml, llms.txt, Meta OK/Fix status, missing alt-text, and >200 KB images across ${website.domain}.`,
      targetView: 'Technical Site Audit',
      ctaLabel: 'Open Technical Audit →',
    });
  } else if ((scanSummary.metaNeedsFix || 0) > 0 || (scanSummary.oversizedImageCount || 0) > 0) {
    actions.push({
      id: 'p0-fix-meta-media',
      priority: 'P0',
      title: `Fix ${scanSummary.metaNeedsFix || 0} pages needing Meta updates & ${scanSummary.missingAltCount || 0} missing alt tags`,
      detail: `Batch cap active: Top ${optimizeLimit} Priority Pages this month (${optimizeUsed}/${optimizeLimit} used).`,
      targetView: 'On-Page & Refresh',
      ctaLabel: 'Fix Priority Pages →',
    });
  }

  if (counts.ready > 0) {
    actions.push({
      id: 'p1-qa-release',
      priority: 'P1',
      title: `Review & deliver ${counts.ready} QA-ready article draft(s)`,
      detail: 'Sign off on scored drafts and publish directly to your connected CMS or Builder blog.',
      targetView: 'QA & Auto-Publish',
      ctaLabel: 'Open QA Queue →',
    });
  }

  if (counts.queued > 0) {
    actions.push({
      id: 'p1-run-pipeline',
      priority: 'P1',
      title: `Produce ${counts.queued} queued article topic(s) live`,
      detail: 'Run the 5-stage specialist pipeline to draft, generate hero SVGs, score QA, and build 4-channel social kits.',
      targetView: 'Article Studio',
      ctaLabel: 'Open Article Studio →',
    });
  }

  actions.push({
    id: 'p2-ai-visibility',
    priority: 'P2',
    title: isEstablished
      ? 'Benchmark rival blogs & AI answer-engine citations'
      : 'Expand topical authority with 6 new low-KD keyword gaps',
    detail: isEstablished
      ? 'Run $0.00 ChatGPT/Perplexity/Gemini readiness and 1–3 competitor keyword gap teardowns.'
      : 'Use live Google Autocomplete + sitemap overlap gate to queue your next batch of topics.',
    targetView: isEstablished ? 'AI Visibility & Links' : 'Keyword & Topics',
    ctaLabel: isEstablished ? 'Open AI Visibility →' : 'Discover Keywords →',
  });

  const badgeClass = (p: PriorityActionItem['priority']) =>
    p === 'P0'
      ? 'border-rose-500/40 bg-rose-500/15 text-rose-300'
      : p === 'P1'
        ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
        : 'border-blue-500/40 bg-blue-500/15 text-blue-300';

  return (
    <section className="space-y-4 rounded-xl border border-slate-800 bg-[#111827] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
            Dual-Track Priority Action Queue · {isEstablished ? 'Established Site' : 'New Site'}
          </p>
          <h2 className="text-base font-semibold text-white">
            Ranked Next Actions &amp; Monthly Dual-Quota Pacing
          </h2>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('Token & API Usage')}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300"
        >
          Full Quota Ledger →
        </button>
      </div>

      {/* Dual-Quota Live Meters (Existing Page Optimizations vs. New Articles) */}
      <div className="grid gap-3 md:grid-cols-2">
        {[
          {
            label: `Existing Page Optimizations (Top ${optimizeLimit}/mo)`,
            used: optimizeUsed,
            limit: optimizeLimit,
          },
          {
            label: 'New Articles Produced (Monthly Pool)',
            used: articleUsed,
            limit: articleLimit,
          },
        ].map((meter) => {
          const pct = Math.min(100, Math.round((meter.used / Math.max(1, meter.limit)) * 100));
          return (
            <div
              key={meter.label}
              className="min-w-0 space-y-2 rounded-xl border border-slate-800 bg-[#0B0F17] p-3.5 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="min-w-0 font-medium text-slate-200">{meter.label}</span>
                <span className="shrink-0 font-mono text-blue-300">
                  {meter.used} / {meter.limit}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct >= 90 ? 'bg-amber-500' : 'bg-[#2563EB]'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Ranked P0 -> P1 -> P2 Action Rows */}
      <div className="space-y-2">
        {actions.slice(0, 4).map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0B0F17] p-3.5 text-xs"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold ${badgeClass(
                    item.priority,
                  )}`}
                >
                  {item.priority}
                </span>
                <strong className="break-words text-slate-100">{item.title}</strong>
              </div>
              <p className="break-words text-slate-400">{item.detail}</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(item.targetView)}
              className="w-full shrink-0 rounded-lg border border-slate-700 bg-[#111827] px-3 py-1.5 text-center text-xs font-semibold text-slate-200 transition hover:border-blue-500/60 hover:text-white sm:w-auto"
            >
              {item.ctaLabel}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

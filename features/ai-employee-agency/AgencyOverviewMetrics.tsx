'use client';

import React from 'react';

interface ReadinessRingProps {
  label: string;
  sublabel: string;
  score: number;
  detail: string;
}

function ConcentricReadinessRing({ label, sublabel, score, detail }: ReadinessRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-start gap-3.5 rounded-xl border border-slate-800 bg-[#111827] p-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#1E293B" strokeWidth="7" />
          <circle cx="50" cy="50" r={31} fill="none" stroke="#1E293B" strokeWidth="3" strokeOpacity="0.6" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#2563EB"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-lg font-bold text-white">{clamped}%</span>
        </div>
      </div>

      <div className="min-w-0 space-y-1 break-words">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">{sublabel}</p>
        <h3 className="text-sm font-semibold text-white">{label}</h3>
        <p className="text-xs leading-relaxed text-slate-400">{detail}</p>
      </div>
    </div>
  );
}

export function AgencyOverviewMetrics({
  approved,
  indexedPages,
  coverage,
  activeProvidersCount,
  counts,
  onNavigate,
}: {
  approved: boolean;
  indexedPages: number;
  coverage?: string;
  activeProvidersCount: number;
  counts?: { published: number; ready: number; queued: number };
  onNavigate: (view: string) => void;
}) {
  // Grounded readiness score strictly from verified live workspace state (zero fake scores)
  const knowledgeScore =
    (approved ? 45 : 10) +
    (indexedPages > 0 ? Math.min(35, Math.round((indexedPages / 10) * 35)) : 0) +
    (coverage === 'complete' ? 20 : coverage === 'partial' ? 10 : 0);

  const totalItems = (counts?.published ?? 0) + (counts?.ready ?? 0) + (counts?.queued ?? 0);
  const pipelineScore =
    (activeProvidersCount > 0 ? 40 : 0) +
    (approved ? 20 : 0) +
    (totalItems > 0 ? Math.min(40, Math.round((((counts?.published ?? 0) * 2 + (counts?.ready ?? 0) + (counts?.queued ?? 0) * 0.5) / Math.max(1, totalItems * 2)) * 40)) : 0);

  const kpis = [
    {
      key: 'published',
      label: 'Published articles',
      value: counts?.published ?? '—',
      hint: 'Confirmed live deliveries',
      targetView: 'QA & Auto-Publish',
      barPct: totalItems > 0 ? Math.round(((counts?.published ?? 0) / totalItems) * 100) : 0,
    },
    {
      key: 'ready',
      label: 'Ready for review',
      value: counts?.ready ?? '—',
      hint: 'Awaiting QA sign-off',
      targetView: 'QA & Auto-Publish',
      barPct: totalItems > 0 ? Math.round(((counts?.ready ?? 0) / totalItems) * 100) : 0,
    },
    {
      key: 'queued',
      label: 'Queued topics',
      value: counts?.queued ?? '—',
      hint: 'Scheduled in calendar',
      targetView: 'Agency Calendar',
      barPct: totalItems > 0 ? Math.round(((counts?.queued ?? 0) / totalItems) * 100) : 0,
    },
    {
      key: 'pages',
      label: 'Indexed sitemap URLs',
      value: indexedPages,
      hint: coverage ? `${coverage} inventory` : 'manual inventory',
      targetView: 'Technical Site Audit',
      barPct: indexedPages > 0 ? Math.min(100, indexedPages * 5) : 0,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 4 Calm Monochrome KPI Cards */}
      <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onNavigate(item.targetView)}
            className="group min-w-0 rounded-xl border border-slate-800 bg-[#111827] p-4 text-left transition hover:border-blue-600/60"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {item.label}
            </p>
            <strong className="mt-1.5 block font-mono text-2xl font-semibold text-white">
              {item.value}
            </strong>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-[#2563EB] transition-all duration-500"
                style={{ width: `${item.barPct}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-500 group-hover:text-slate-300">
              {item.hint} →
            </p>
          </button>
        ))}
      </section>

      {/* Dual Concentric Readiness Rings */}
      <section className="grid gap-4 md:grid-cols-2">
        <ConcentricReadinessRing
          sublabel="Domain Knowledge"
          label="SEO & Sitemap Readiness"
          score={knowledgeScore}
          detail={
            indexedPages > 0
              ? `${indexedPages} live pages indexed (${coverage || 'synced'}). Overlap gate active.`
              : '0 live pages indexed yet. Click "Crawl Live Sitemap" above to populate real URLs.'
          }
        />
        <ConcentricReadinessRing
          sublabel="Automation Engine"
          label="Agency Pipeline Readiness"
          score={pipelineScore}
          detail={
            activeProvidersCount > 0
              ? `${activeProvidersCount} LLM provider binding active · ${totalItems} tracked content items.`
              : 'No active LLM provider detected. Verify environment bindings in Token & API Usage.'
          }
        />
      </section>
    </div>
  );
}

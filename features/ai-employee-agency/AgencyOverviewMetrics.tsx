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
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const strokeColor = clamped >= 80 ? '#34D399' : '#3B82F6';

  return (
    <div className="flex items-center gap-4 p-4 sm:p-5">
      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label={`${label}: ${clamped}%`}>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#1E293B" strokeWidth="7" />
          <circle cx="50" cy="50" r={30} fill="none" stroke="#1E293B" strokeWidth="2.5" strokeOpacity="0.55" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-base font-bold text-white">{clamped}%</span>
        </div>
      </div>

      <div className="min-w-0 space-y-1">
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
  const knowledgeScore =
    (approved ? 45 : 10) +
    (indexedPages > 0 ? Math.min(35, Math.round((indexedPages / 10) * 35)) : 0) +
    (coverage === 'complete' ? 20 : coverage === 'partial' ? 10 : 0);

  const totalItems = (counts?.published ?? 0) + (counts?.ready ?? 0) + (counts?.queued ?? 0);
  const pipelineScore =
    (activeProvidersCount > 0 ? 40 : 0) +
    (approved ? 20 : 0) +
    (totalItems > 0
      ? Math.min(
          40,
          Math.round(
            (((counts?.published ?? 0) * 2 + (counts?.ready ?? 0) + (counts?.queued ?? 0) * 0.5) /
              Math.max(1, totalItems * 2)) *
              40,
          ),
        )
      : 0);

  const kpis = [
    {
      key: 'published',
      label: 'Published articles',
      value: counts?.published ?? '—',
      hint: 'Live deliveries',
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
      hint: 'Scheduled in pipeline',
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
      {/* Unified Linear-style Hairline KPI Strip (zero repetitive nested cards) */}
      <section className="grid divide-y divide-slate-800/80 overflow-hidden rounded-xl border border-slate-800 bg-[#111827] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {kpis.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onNavigate(item.targetView)}
            className="group flex flex-col justify-between p-4 text-left transition hover:bg-slate-800/40"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {item.label}
              </span>
              <span className="text-[11px] text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-blue-400">
                →
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <strong className="font-mono text-2xl font-semibold tracking-tight text-white">
                {item.value}
              </strong>
              <span className="truncate text-[11px] text-slate-500">{item.hint}</span>
            </div>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-800/90">
              <div
                className="h-full rounded-full bg-[#2563EB] transition-all duration-500"
                style={{ width: `${item.barPct}%` }}
              />
            </div>
          </button>
        ))}
      </section>

      {/* Unified Readiness Band with Concentric SVG Rings */}
      <section className="grid divide-y divide-slate-800/80 overflow-hidden rounded-xl border border-slate-800 bg-[#111827] md:grid-cols-2 md:divide-x md:divide-y-0">
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

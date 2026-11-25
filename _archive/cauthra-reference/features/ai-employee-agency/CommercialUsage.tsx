'use client';

import { useEffect, useState } from 'react';
import { agencyRequest } from './agency-request';

type Budget = {
  tier: string;
  byok: boolean;
  assets: { kind: string; day_count: number; month_count: number; month_limit: number }[];
  specialists: { operation: string; tokens: number; usd: number; pending: number }[];
} & Record<`${'day' | 'month'}_${'tokens' | 'usd' | 'token_limit' | 'usd_limit'}`, number>;

const ASSET_LABELS: Record<string, string> = {
  article: 'New Articles',
  existing_page_optimization: 'Page Optimizations',
  social: 'Social Drafts',
  image: 'AI Images',
  audit: 'Site Audits',
};

const OPERATION_LABELS: Record<string, string> = {
  web_research: 'Web Research (Reddit / Quora / SERP)',
  keywords: 'Keyword & Topic Strategist',
  writer: 'SEO & GEO Article Writer',
  refresh: 'On-Page & Page Optimizer',
  technical: 'Technical Site Auditor',
  visual: 'Visual & Brand Designer',
  qa: '100-Pt QA & Fact-Check',
  social: 'Social Distribution',
  chief: 'Chief AI Officer',
  copilot: 'Workspace Copilot',
};

export function CommercialUsage() {
  const [budget, setBudget] = useState<Budget>();
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const res = await agencyRequest('/api/ai-employee-agency/usage', {
          signal: controller.signal,
        });
        if (!res.ok) throw Error('Workspace usage unavailable.');
        const data = await res.json();
        if (!controller.signal.aborted) {
          setBudget(data);
          setError('');
        }
      } catch {
        if (!controller.signal.aborted) setError('Unable to refresh workspace usage.');
      }
    }
    void load();
    const timer = setInterval(load, 30000);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, []);

  return (
    <section className="space-y-5 rounded-xl border border-slate-800 bg-[#111827] p-5">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3.5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
            Metered Token, Web Research &amp; Dual-Quota Ledger
          </p>
          <h2 className="text-base font-semibold text-white">Workspace allowance</h2>
        </div>
        {budget && (
          <span className="rounded-full border border-slate-700 bg-[#0B0F17] px-3 py-1 text-xs font-semibold capitalize text-slate-200">
            {budget.tier}
            {budget.byok ? ' · BYOK' : ''}
          </span>
        )}
      </header>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-xs text-rose-200" role="status">
          {error}
        </p>
      )}

      {budget ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {(['day', 'month'] as const).map((period) => {
              const tokens = budget[`${period}_tokens`];
              const usd = budget[`${period}_usd`];
              const tokenLimit = budget[`${period}_token_limit`];
              const usdLimit = budget[`${period}_usd_limit`];
              const percent = Math.max(tokens / Math.max(1, tokenLimit), usd / Math.max(0.0001, usdLimit)) * 100;
              const barColor =
                percent >= 100 ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-[#2563EB]';

              return (
                <div
                  key={period}
                  className="space-y-2.5 rounded-xl border border-slate-800 bg-[#0B0F17] p-4"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-semibold text-white">
                      {period === 'day' ? 'Today (UTC)' : 'This month (UTC)'}
                    </strong>
                    <span className="font-mono text-xs text-slate-400">
                      {Math.min(100, Math.round(percent))}%
                    </span>
                  </div>
                  <p className="break-words font-mono text-xs text-slate-300">
                    {tokens.toLocaleString()} / {tokenLimit.toLocaleString()} tokens · $
                    {Number(usd).toFixed(4)} / ${Number(usdLimit).toFixed(2)}
                  </p>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-slate-800"
                    role="progressbar"
                    aria-label={period + ' quota used'}
                    aria-valuenow={Math.min(100, Math.round(percent))}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                  {percent >= 80 && (
                    <p
                      role="status"
                      className={`text-xs font-medium ${
                        percent >= 100 ? 'text-rose-300' : 'text-amber-300'
                      }`}
                    >
                      {percent >= 100 ? 'Allowance reached' : 'Approaching allowance'} ·{' '}
                      {Math.floor(percent)}%
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {budget.assets.map((a) => {
              const dailyMax = Math.ceil(a.month_limit / 10);
              const alert =
                a.month_limit > 0 &&
                Math.max(a.month_count / a.month_limit, a.day_count / Math.max(1, dailyMax)) >= 0.8;
              return (
                <div
                  key={a.kind}
                  className="min-w-0 rounded-lg border border-slate-800 bg-[#0B0F17] p-3"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-xs font-semibold text-slate-200">
                      {ASSET_LABELS[a.kind] || a.kind}
                    </span>
                    {alert && (
                      <span className="shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                        Alert
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 font-mono text-xs text-slate-400">
                    Today: <span className="text-slate-200">{a.day_count}</span> / {dailyMax}
                  </p>
                  <p className="font-mono text-xs text-slate-400">
                    Month: <span className="text-slate-200">{a.month_count}</span> / {a.month_limit}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-400">
            Zero-LLM mechanical checks (crawl, meta/image audit) and live Reddit/Quora web research are tracked separately from paid Gemini/OpenAI specialist tokens.
          </p>

          {budget.specialists.length ? (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0B0F17]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    {['Specialist / Operation', 'Mode', 'Tokens', 'USD', 'Pending'].map((h) => (
                      <th key={h} className="px-4 py-2.5 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {budget.specialists.map((s) => {
                    const isWebResearch = s.operation === 'web_research';
                    return (
                      <tr key={s.operation} className="text-slate-200">
                        <td className="px-4 py-2.5 font-medium">
                          {OPERATION_LABELS[s.operation] || s.operation}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                              isWebResearch
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-blue-500/15 text-blue-300'
                            }`}
                          >
                            {isWebResearch ? 'Live Web ($0)' : 'LLM Metered'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono">{s.tokens.toLocaleString()}</td>
                        <td className="px-4 py-2.5 font-mono">${Number(s.usd).toFixed(6)}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-400">{s.pending}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-lg border border-slate-800 bg-[#0B0F17] p-4 text-xs text-slate-400">
              No specialist or web research calls recorded this month yet.
            </p>
          )}
        </>
      ) : (
        !error && <p className="text-xs text-slate-400">Loading usage…</p>
      )}
    </section>
  );
}

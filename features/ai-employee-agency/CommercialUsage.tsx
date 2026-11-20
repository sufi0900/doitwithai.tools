'use client';

import { useEffect, useState } from 'react';
import { agencyRequest } from './agency-request';

type Budget = {
  tier: string; byok: boolean;
  assets: { kind: string; day_count: number; month_count: number; month_limit: number }[];
  specialists: { operation: string; tokens: number; usd: number; pending: number }[];
} & Record<`${'day' | 'month'}_${'tokens' | 'usd' | 'token_limit' | 'usd_limit'}`, number>;

export function CommercialUsage() {
  const [budget, setBudget] = useState<Budget>();
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const res = await agencyRequest('/api/ai-employee-agency/usage', { signal: controller.signal });
        if (!res.ok) throw Error('Workspace usage unavailable.');
        const data = await res.json();
        if (!controller.signal.aborted) { setBudget(data); setError(''); }
      } catch {
        if (!controller.signal.aborted) setError('Unable to refresh workspace usage.');
      }
    }
    void load();
    const timer = setInterval(load, 30000);
    return () => { clearInterval(timer); controller.abort(); };
  }, []);
  return <section className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-5">
    <h2 className="text-lg font-semibold">Workspace allowance</h2>
    {error && <p role="status">{error}</p>}
    {budget ? <>
      <p className="capitalize">{budget.tier}{budget.byok && ' · BYOK'}</p>
      {(['day', 'month'] as const).map(period => {
        const tokens = budget[`${period}_tokens`];
        const usd = budget[`${period}_usd`];
        const tokenLimit = budget[`${period}_token_limit`], usdLimit = budget[`${period}_usd_limit`];
        const percent = Math.max(tokens / tokenLimit, usd / usdLimit) * 100;
        return <div key={period}><strong>{period === 'day' ? 'Today' : 'This month'} (UTC)</strong>
          <p>{tokens.toLocaleString()} / {tokenLimit.toLocaleString()} tokens · ${Number(usd).toFixed(4)} / ${Number(usdLimit).toFixed(2)}</p>
          <progress aria-label={period + ' quota used'} value={Math.min(100, percent)} max={100}/>
          {percent >= 80 && <p role="status">{percent >= 100 ? 'Allowance reached' : 'Approaching allowance'} · {Math.floor(percent)}%</p>}
        </div>;
      })}
      {budget.assets.map(a => <p key={a.kind}>{a.kind} · {a.day_count} / {Math.ceil(a.month_limit / 10)} today · {a.month_count} / {a.month_limit} this month
        {a.month_limit > 0 && Math.max(a.month_count / a.month_limit, a.day_count / Math.ceil(a.month_limit / 10)) >= 0.8 && ' · Allowance alert'}</p>)}
      <p className="text-sm text-slate-300">Allowances include pending reservations. Specialist totals show reported tokens and their calculated cost at model rates.</p>
      {budget.specialists.length ? <table className="w-full text-left"><thead><tr>{['Specialist','Tokens','USD','Pending'].map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{budget.specialists.map(s => <tr key={s.operation}><td>{s.operation}</td><td>{s.tokens.toLocaleString()}</td><td>{Number(s.usd).toFixed(6)}</td><td>{s.pending}</td></tr>)}</tbody></table> : <p>No calls recorded this month.</p>}
    </> : !error && <p>Loading usage…</p>}
  </section>;
}

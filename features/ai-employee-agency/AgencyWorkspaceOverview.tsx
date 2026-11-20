'use client';

import { V6_SINGLE_SIDEBAR_GROUPS } from './navigation';
import { KnowledgeReview, type KnowledgeRow } from './KnowledgeReview';
import { specialists } from '@/lib/ai-agency/specialists';
import { ProductionProgress } from './ProductionProgress';
import { AgencyCalendar } from './AgencyCalendar';
import { QualityReview } from './QualityReview';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { agencyRequest } from './agency-request';

type Summary = {
  counts: { published: number; ready: number; queued: number };
  lastCall: { created_at: string; model: string; total_tokens: number | null; calculated_usd: number | null } | null;
  website: KnowledgeRow | null;
};
const panel = 'rounded-xl border border-slate-700 bg-slate-900 p-5';

export default function AgencyWorkspaceOverview() {
  const [summary, setSummary] = useState<Summary>();
  const [status, setStatus] = useState('Loading workspace…');
  const [bindings, setBindings] = useState<Record<string, boolean>>({});
  const [view, setView] = useState('Overview');
  const [agentId,setAgentId] = useState('copilot');
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  async function refresh() {
    const res = await agencyRequest('/api/ai-employee-agency/workspace');
    const data = await res.json();
    if (!res.ok) { setSummary(undefined); setStatus(data.error); return; }
    setSummary(data);
    setStatus('');
  }
  useEffect(() => {
    refresh().catch(() => setStatus('Workspace connection unavailable.'));
    fetch('/api/ai-employee-agency/diagnostics', { cache: 'no-store' }).then(r => r.json())
      .then(data => setBindings(data.configured)).catch(() => setBindings({}));
  }, []);
  async function send(event: FormEvent) {
    event.preventDefault();
    if (busy || !message.trim()) return;
    setBusy(true);
    try {
      const res = await agencyRequest('/api/ai-employee-agency/agent-chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, agentId }),
      });
      const data = await res.json();
      setReply(data.replyText || data.error);
      if (res.ok) setMessage('');
      if (data.llmGatewayStatus) await refresh();
    } catch { setReply('Could not reach Copilot. Please retry.'); }
    finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-slate-950 text-slate-100 md:flex">
    <nav aria-label="Workspace navigation" className="flex flex-wrap gap-4 border-b border-slate-800 p-5 md:w-60 md:flex-col md:border-b-0 md:border-r">
      <strong>Agency workspace</strong>
      {V6_SINGLE_SIDEBAR_GROUPS.map(group => <div key={group.groupLabel} className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-400">{group.groupLabel}</p>
        {group.groupLabel === 'Workspace' && <button className="block w-full rounded-lg px-3 py-1.5 text-left hover:bg-slate-800" aria-current={view === 'Agency Calendar' ? 'page' : undefined} onClick={() => setView('Agency Calendar')}>Agency Calendar</button>}
        {group.items.map(item => <button key={item.id} aria-current={view === item.label ? 'page' : undefined}
          className={`block w-full rounded-lg px-3 py-1.5 text-left ${view === item.label ? 'bg-blue-900 text-blue-100' : 'hover:bg-slate-800'}`}
          onClick={() => setView(item.label)}>{item.label}</button>)}</div>)}
      <a href="#copilot" onClick={() => {setAgentId('copilot'); setReply('');}}>Ask Copilot</a>
      <Link href="/ai-employee-agency">Website setup</Link>
      <Link href="/ai-employee-agency/dashboard?view=legacy">Previous local workspace</Link>
    </nav>
    <div className="mx-auto w-full max-w-5xl space-y-6 p-5 md:p-9">
      <h1 id="overview" className="text-3xl font-semibold">{view}</h1>
      {status && <p role="status">{status} {status.includes('Sign in') && <Link className="underline" href="/do-it-ai?signin=1">Sign in</Link>}</p>}
      {view === 'Overview' && <section className="grid gap-3 sm:grid-cols-3">{(['published','ready','queued'] as const).map(key =>
        <div className={panel} key={key}><p>{ {published:'Published articles',ready:'Ready for review',queued:'Queued'}[key]}</p>
        <strong className="text-3xl">{summary?.counts[key] ?? '—'}</strong></div>)}</section>}
      <section className={panel}><h2 className="text-lg font-semibold">{view === 'Overview' ? 'Website knowledge base' : 'Workspace setup'}</h2>
        {summary?.website ? <KnowledgeReview key={summary.website.revision} row={summary.website} refresh={refresh} topics={view === 'Keyword & Topics'} /> :
          <p>{summary ? 'Register your website to begin setup.' : 'Workspace data unavailable.'}</p>}</section>
      {view === 'Overview' && summary && <ProductionProgress/>}
      {view === 'Agency Calendar' && <AgencyCalendar/>}
      {view === 'QA & Auto-Publish' && summary?.website?.approved_at && <QualityReview domain={summary.website.domain} revision={summary.website.revision}/>}
      <section id="copilot" className={panel}><h2 className="text-lg font-semibold">Workspace Copilot</h2>
        <label className="mt-3 block">Talk to <select className="rounded bg-slate-800 p-2" value={agentId} disabled={busy} onChange={e => {setAgentId(e.target.value);setReply('');}}>
          <option value="copilot">Workspace Copilot</option><option value="chief">Chief AI Officer</option>
          {specialists.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label>
        <form onSubmit={send} className="mt-3 flex gap-2"><input aria-label="Message Copilot" className="min-w-0 flex-1 rounded bg-slate-800 p-3" value={message} onChange={e => setMessage(e.target.value)} maxLength={8000} placeholder="Ask about your workspace" />
        <button disabled={busy || !message.trim()} className="rounded bg-blue-600 px-4">{busy ? 'Sending…' : 'Send'}</button></form>
        <p className="mt-2 whitespace-pre-wrap" role="status">{reply}</p></section>
      <section id="usage" className={panel}><h2 className="text-lg font-semibold">Provider connections</h2>
        {Object.keys(bindings).length === 0 && <p>Diagnostics unavailable</p>}
        {Object.entries(bindings).map(([provider, present]) => <p key={provider}>{provider} · {present ? 'Binding configured' : 'Missing binding'}</p>)}
        {summary && <p className="mt-3">{summary.lastCall ? `Last successful call · ${summary.lastCall.model} · ${summary.lastCall.created_at} · ${summary.lastCall.total_tokens ?? 'unavailable'} tokens · calculated USD ${summary.lastCall.calculated_usd ?? 'unavailable'}` : 'No successful provider calls recorded.'}</p>}</section>
    </div></main>;
}

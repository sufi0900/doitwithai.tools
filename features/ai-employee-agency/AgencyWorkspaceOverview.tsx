'use client';

import { V6_SINGLE_SIDEBAR_GROUPS } from './navigation';
import { KnowledgeReview, type KnowledgeRow } from './KnowledgeReview';
import { agentName, channels, commercialLabel, panelAgents, socialHub, visualStudio } from '@/lib/ai-agency/panels';
import { PanelChat, PanelLedger } from './PanelWorkspace';
import { VisualBrandStudio } from './VisualBrandStudio';
import { ProductionProgress } from './ProductionProgress';
import { AgencyCalendar } from './AgencyCalendar';
import { QualityReview } from './QualityReview';
import Link from 'next/link';
import { useEffect, useState, Fragment } from 'react';
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
  const [chat,setChat] = useState<string>();
  const [expanded,setExpanded] = useState(false);
  const [version,setVersion] = useState(0);
  const agent=panelAgents[view];
  const channel=channels.find(c=>c.label===view);
  function navigate(next:string) {
    setView(next);setChat(undefined);
    if(next===socialHub)setExpanded(true);
    if(channels.some(c=>c.label===next))setExpanded(true);
  }
  function navButton(label:string) {
    return <button aria-current={view===label?'page':undefined} className={`block w-full rounded-lg px-3 py-1.5 text-left ${view===label?'bg-blue-900 text-blue-100':'hover:bg-slate-800'}`} onClick={()=>navigate(label)}>{label}</button>;
  }
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
  return <main className="min-h-screen bg-slate-950 text-slate-100 md:flex">
    <nav aria-label="Workspace navigation" className="flex flex-wrap gap-4 border-b border-slate-800 p-5 md:w-60 md:flex-col md:border-b-0 md:border-r">
      <strong>Agency workspace</strong>
      {V6_SINGLE_SIDEBAR_GROUPS.map(group => <div key={group.groupLabel} className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-400">{group.groupLabel}</p>
        {group.items.map(item=><Fragment key={item.id}>
          {item.id==='nav-social' ? <>
            <div className="flex items-center">{navButton(socialHub)}<button onClick={()=>setExpanded(!expanded)} aria-expanded={expanded} aria-controls="agency-social-channels" aria-label="Toggle social channels" className="rounded px-3 py-2">{expanded?'▴':'▾'}</button></div>
            <div id="agency-social-channels" hidden={!expanded} className="ml-3 border-l border-slate-700 pl-1">{channels.map(c=><Fragment key={c.id}>{navButton(c.label)}</Fragment>)}</div>
          </> : navButton(commercialLabel(item.id,item.label))}
          {item.id==='nav-overview' && navButton('Agency Calendar')}
        </Fragment>)}</div>)}
      <button className="rounded-lg bg-blue-700 px-3 py-2" onClick={()=>setChat('copilot')}>Ask Copilot</button>
      <Link href="/ai-employee-agency">Website setup</Link>
      <Link href="/ai-employee-agency/dashboard?view=legacy">Previous local workspace</Link>
    </nav>
    <div className="mx-auto w-full max-w-5xl space-y-6 p-5 md:p-9">
      <h1 id="overview" className="text-3xl font-semibold">{view}</h1>
      {status && <p role="status">{status} {status.includes('Sign in') && <Link className="underline" href="/do-it-ai?signin=1">Sign in</Link>}</p>}
      {view === 'Overview' && <section className="grid gap-3 sm:grid-cols-3">{(['published','ready','queued'] as const).map(key =>
        <div className={panel} key={key}><p>{ {published:'Published articles',ready:'Ready for review',queued:'Queued'}[key]}</p>
        <strong className="text-3xl">{summary?.counts[key] ?? '—'}</strong></div>)}</section>}
      {(['Overview','Keyword & Topics','Agent Skills & Cron'].includes(view) || !summary?.website?.approved_at) && <section className={panel}><h2 className="text-lg font-semibold">{view === 'Overview' ? 'Website knowledge base' : 'Workspace setup'}</h2>
        {summary?.website ? <KnowledgeReview key={summary.website.revision} row={summary.website} refresh={refresh} topics={view === 'Keyword & Topics'} /> :
          <p>{summary ? 'Register your website to begin setup.' : 'Workspace data unavailable.'}</p>}</section>}
      {view === 'Overview' && summary && <ProductionProgress/>}
      {view === 'Agency Calendar' && <AgencyCalendar/>}
      {view === 'QA & Auto-Publish' && summary?.website?.approved_at && <QualityReview domain={summary.website.domain} revision={summary.website.revision}/>}
      {view===socialHub && <PanelLedger key={view} agent="hub" openChannel={navigate}/>}
      {view===visualStudio && summary?.website?.approved_at && <VisualBrandStudio website={summary.website}/>}
      {view==='Live Node Canvas' && <div className="grid gap-3 sm:grid-cols-3">{Object.entries(panelAgents).filter(([,id])=>id!=='chief').map(([name,id])=><button key={id} onClick={()=>navigate(name)} className={panel}>{agentName(id)}</button>)}</div>}
      {agent && (channel || agent!=='chief') && <PanelLedger key={agent} agent={agent} version={version}/>}
      {['Overview','Token & API Usage'].includes(view) && <section id="usage"  className={panel}><h2 className="text-lg font-semibold">Provider connections</h2>
        {Object.keys(bindings).length === 0 && <p>Diagnostics unavailable</p>}
        {Object.entries(bindings).map(([provider, present]) => <p key={provider}>{provider} · {present ? 'Binding configured' : 'Missing binding'}</p>)}
        {summary && <p className="mt-3">{summary.lastCall ? `Last successful call · ${summary.lastCall.model} · ${summary.lastCall.created_at} · ${summary.lastCall.total_tokens ?? 'unavailable'} tokens · calculated USD ${summary.lastCall.calculated_usd ?? 'unavailable'}` : 'No successful provider calls recorded.'}</p>}</section>}
      {chat ? <PanelChat key={chat} agent={chat} close={()=>setChat(undefined)} onSaved={()=>{setVersion(v=>v+1);void refresh();}}/> :
        agent && <button onClick={()=>setChat(agent)} className="sticky bottom-2 z-10 w-full rounded-xl border border-blue-600 bg-slate-900 p-3 font-semibold text-blue-200">Chat with {agentName(agent)}</button>}
    </div></main>;
}

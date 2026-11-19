'use client';
import { useState, type FormEvent } from 'react';
import { agencyRequest } from './agency-request';
import type { SiteKnowledge } from '@/lib/ai-employee-agency/site-knowledge';

export type KnowledgeRow = { domain: string; approved_at: string | null; revision: number; profile: Partial<SiteKnowledge> };
const fields = { name:'Business name', industry:'Industry or niche', audience:'Target audience', offer:'Priority product or service', goal:'Business goal', locale:'Audience locale', currency:'Currency' } as const;
export function KnowledgeReview({ row, refresh, topics }: { row: KnowledgeRow; refresh: () => Promise<void>; topics: boolean }) {
  const [busy,setBusy] = useState(false);
  const [notice,setNotice] = useState('');
  const [match,setMatch] = useState('');
  const profile = row.profile;
  async function submit(action: string, form?: FormEvent<HTMLFormElement>) {
    form?.preventDefault();
    if (busy) return;
    const values = form ? Object.fromEntries(new FormData(form.currentTarget)) : {};
    setBusy(true);
    setNotice('');
    setMatch('');
    try {
      const route = action === 'topic' ? 'topics' : 'knowledge';
      const response = await agencyRequest('/api/ai-employee-agency/' + route,{method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...values, humanReview:values.humanReview === 'on', action, revision:row.revision})});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed.');
      if (action === 'topic') {
        setNotice(data.action === 'review' ? 'Overlap or incomplete inventory requires review. Refine the topic or review the existing page.' : data.action === 'refresh' ? 'Queued an update to the existing page.' : 'Queued a new article topic.');
        setMatch(data.match?.url || '');
      }
      await refresh();
    } catch (e) { setNotice(e instanceof Error ? e.message : 'Unable to save changes.'); }
    finally { setBusy(false); }
  }
  return <div className="mt-4 space-y-4">
    <p>{row.domain} · {row.approved_at ? 'Approved' : 'Awaiting approval'}</p>
    {profile.checkedAt && <details><summary>Discovery evidence · {profile.pages?.length || 0} pages · {profile.coverage} inventory</summary>
      <p>{profile.source} · {profile.checkedAt}</p><p>{profile.note}</p>
      <p>{[...(profile.colors || []), ...(profile.fonts || []), ...(profile.headings || [])].join(' · ')}</p>
      <ul className="max-h-52 overflow-y-auto">{profile.pages?.map(p => <li key={p.url}><a href={p.url} target="_blank" rel="noreferrer">{p.title || p.url}</a></li>)}</ul></details>}
    {!row.approved_at && <button className="rounded border px-3 py-2" disabled={busy} onClick={() => submit('discover')}>{busy ? 'Working…' : profile.checkedAt ? 'Repeat discovery' : 'Discover website'}</button>}
    {profile.checkedAt && !row.approved_at && <form className="grid gap-3 sm:grid-cols-2" onSubmit={e => submit('approve',e)}>
      {Object.entries(fields).map(([key,label]) => <label key={key}>{label}<input className="block w-full rounded bg-slate-800 p-2" name={key} maxLength={500} required={['name','industry','audience'].includes(key)} defaultValue={profile[key as keyof typeof fields] || ''}/></label>)}
      <details className="sm:col-span-2"><summary>Brand and editorial preferences</summary>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <label>Business model<select name="business_model" className="block rounded bg-slate-800 p-2"><option value="">Unspecified</option>{['b2b_saas','ecommerce','local_service','publisher','agency'].map(v => <option key={v}>{v}</option>)}</select></label>
          <label>Reading level<select name="reading_grade_target" className="block rounded bg-slate-800 p-2"><option value="">Unspecified</option>{['grade_7_9','grade_10_12','executive'].map(v => <option key={v}>{v}</option>)}</select></label>
          {Object.entries({sub_niche:'Specialty', brand_voice:'Voice traits (comma separated)', out_of_scope_topics:'Excluded topics', competitor_blocklist:'Competitor domains',ctaLabel:'CTA label',ctaUrl:'CTA destination'}).map(([key,label]) =>
            <label key={key}>{label}<input className="block w-full rounded bg-slate-800 p-2" name={key} maxLength={500}/></label>)}
        </div></details>
      <label><input name="humanReview" type="checkbox" defaultChecked={profile.humanReview}/> Require human editorial review</label>
      <button className="rounded bg-blue-600 p-2" disabled={busy}>Approve knowledge base &amp; start agency</button>
    </form>}
    {row.approved_at && topics && <form onSubmit={e => submit('topic',e)} className="flex flex-wrap gap-2">
      <input className="flex-1 rounded bg-slate-800 p-2" aria-label="Proposed topic" name="topic" required maxLength={240} placeholder="Propose a topic"/>
      <button className="rounded bg-blue-600 px-3" disabled={busy}>Check overlap and queue</button></form>}
    <p role="status">{notice} {match && <a className="underline" href={match}>Review matched page</a>}</p>
  </div>;
}

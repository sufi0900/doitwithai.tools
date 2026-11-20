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
  const inputClass =
    'block w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none';
  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 break-words font-mono text-xs text-slate-200">{row.domain}</p>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
            row.approved_at
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
          }`}
        >
          {row.approved_at ? 'Approved' : 'Awaiting approval'}
        </span>
      </div>

      {profile.checkedAt && (
        <details className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3.5 text-xs text-slate-300">
          <summary className="cursor-pointer font-medium text-slate-200">
            Discovery evidence · {profile.pages?.length || 0} pages · {profile.coverage} inventory
          </summary>
          <div className="mt-2.5 space-y-1.5 border-t border-slate-800/80 pt-2.5 text-slate-400">
            <p className="break-words">
              {profile.source} · {profile.checkedAt}
            </p>
            {profile.note && <p className="break-words">{profile.note}</p>}
            {Boolean((profile.colors?.length || 0) + (profile.fonts?.length || 0) + (profile.headings?.length || 0)) && (
              <p className="break-words">
                {[...(profile.colors || []), ...(profile.fonts || []), ...(profile.headings || [])].join(' · ')}
              </p>
            )}
            {profile.pages && profile.pages.length > 0 && (
              <ul className="max-h-48 space-y-1 overflow-y-auto pt-1">
                {profile.pages.map((p) => (
                  <li key={p.url} className="min-w-0">
                    <a
                      className="block truncate text-blue-400 underline hover:text-blue-300"
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {p.title || p.url}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>
      )}

      {!row.approved_at && (
        <button
          type="button"
          className="rounded-lg border border-slate-700 bg-[#0B0F17] px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-500/60 hover:text-white disabled:opacity-50"
          disabled={busy}
          onClick={() => submit('discover')}
        >
          {busy ? 'Working…' : profile.checkedAt ? 'Repeat discovery' : 'Discover website'}
        </button>
      )}

      {profile.checkedAt && !row.approved_at && (
        <form className="grid gap-3.5 sm:grid-cols-2" onSubmit={(e) => submit('approve', e)}>
          {Object.entries(fields).map(([key, label]) => (
            <label key={key} className="block min-w-0 space-y-1.5 text-xs font-medium text-slate-300">
              <span>{label}</span>
              <input
                className={inputClass}
                name={key}
                maxLength={500}
                required={['name', 'industry', 'audience'].includes(key)}
                defaultValue={profile[key as keyof typeof fields] || ''}
              />
            </label>
          ))}
          <details className="rounded-lg border border-slate-800 bg-[#0B0F17]/60 p-3.5 sm:col-span-2">
            <summary className="cursor-pointer text-xs font-semibold text-slate-200">
              Brand and editorial preferences
            </summary>
            <div className="mt-3 grid gap-3.5 sm:grid-cols-2">
              <label className="block min-w-0 space-y-1.5 text-xs font-medium text-slate-300">
                <span>Business model</span>
                <select name="business_model" className={inputClass}>
                  <option value="">Unspecified</option>
                  {['b2b_saas', 'ecommerce', 'local_service', 'publisher', 'agency'].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0 space-y-1.5 text-xs font-medium text-slate-300">
                <span>Reading level</span>
                <select name="reading_grade_target" className={inputClass}>
                  <option value="">Unspecified</option>
                  {['grade_7_9', 'grade_10_12', 'executive'].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              {Object.entries({
                sub_niche: 'Specialty',
                brand_voice: 'Voice traits (comma separated)',
                out_of_scope_topics: 'Excluded topics',
                competitor_blocklist: 'Competitor domains',
                ctaLabel: 'CTA label',
                ctaUrl: 'CTA destination',
              }).map(([key, label]) => (
                <label key={key} className="block min-w-0 space-y-1.5 text-xs font-medium text-slate-300">
                  <span>{label}</span>
                  <input className={inputClass} name={key} maxLength={500} />
                </label>
              ))}
            </div>
          </details>
          <div className="flex flex-col gap-3 border-t border-slate-800/80 pt-3.5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input name="humanReview" type="checkbox" defaultChecked={profile.humanReview} />
              <span>Require human editorial review</span>
            </label>
            <button
              className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
              disabled={busy}
            >
              Approve knowledge base &amp; start agency
            </button>
          </div>
        </form>
      )}

      {row.approved_at && topics && (
        <form onSubmit={(e) => submit('topic', e)} className="flex flex-col gap-2.5 sm:flex-row">
          <input
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            aria-label="Proposed topic"
            name="topic"
            required
            maxLength={240}
            placeholder="Propose a topic"
          />
          <button
            className="shrink-0 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            disabled={busy}
          >
            Check overlap and queue
          </button>
        </form>
      )}

      {(notice || match) && (
        <p role="status" className="break-words text-xs text-slate-300">
          {notice}{' '}
          {match && (
            <a className="text-blue-400 underline hover:text-blue-300" href={match}>
              Review matched page
            </a>
          )}
        </p>
      )}
    </div>
  );
}

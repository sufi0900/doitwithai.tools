'use client';
import { useState, type FormEvent } from 'react';
import { agencyRequest } from './agency-request';
import type { SiteKnowledge } from '@/lib/ai-employee-agency/site-knowledge';

export type KnowledgeRow = {
  domain: string;
  approved_at: string | null;
  revision: number;
  profile: Partial<SiteKnowledge>;
};

export function KnowledgeReview({
  row,
  refresh,
  topics,
}: {
  row: KnowledgeRow;
  refresh: () => Promise<void>;
  topics: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [match, setMatch] = useState('');
  const [pendingTopic, setPendingTopic] = useState('');
  const [canForce, setCanForce] = useState(false);
  const profile = row.profile;

  async function queueTopic(topicText: string, forceDifferentiated = false) {
    if (busy || !topicText.trim()) return;
    setBusy(true);
    setNotice('');
    setMatch('');
    setCanForce(false);
    try {
      const response = await agencyRequest('/api/ai-employee-agency/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicText.trim(),
          forceDifferentiated,
          revision: row.revision,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed.');
      if (data.action === 'review' && !data.queued) {
        setPendingTopic(topicText.trim());
        setCanForce(Boolean(data.canForceDifferentiated));
        setNotice(
          `Partial overlap (${data.score ?? 50}%) detected with an existing page. Review the matched page or confirm queueing as a differentiated angle.`,
        );
        setMatch(data.match?.url || '');
      } else {
        setPendingTopic('');
        setNotice(
          data.action === 'refresh'
            ? 'Queued an optimization refresh for the matched existing page.'
            : 'Queued a new article topic into your production pipeline.',
        );
        setMatch(data.match?.url || '');
        await refresh();
      }
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Unable to save topic.');
    } finally {
      setBusy(false);
    }
  }

  function handleTopicSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const topicVal = String(formData.get('topic') || '').trim();
    if (topicVal) {
      void queueTopic(topicVal, false);
      e.currentTarget.reset();
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 break-words font-mono text-xs text-slate-200">{row.domain}</p>
        <div className="flex flex-wrap items-center gap-2">
          {profile.domain_maturity && (
            <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-200">
              {profile.domain_maturity === 'established_site' ? 'Established Site' : 'New Site'}
            </span>
          )}
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
      </div>

      {profile.checkedAt && (
        <details className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3.5 text-xs text-slate-300">
          <summary className="cursor-pointer font-medium text-slate-200">
            Brand Dossier &amp; Discovery Evidence · {profile.pages?.length || 0} pages ·{' '}
            {profile.coverage || 'partial'} inventory
          </summary>
          <div className="mt-2.5 space-y-1.5 border-t border-slate-800/80 pt-2.5 text-slate-400">
            <p className="break-words">
              <strong className="text-slate-200">{profile.name || row.domain}</strong> ·{' '}
              {profile.industry || 'General'} · {profile.audience || 'Target audience'}
            </p>
            <p className="break-words">
              {profile.source} · {profile.checkedAt}
            </p>
            {profile.note && <p className="break-words">{profile.note}</p>}
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

      {row.approved_at && topics && (
        <form onSubmit={handleTopicSubmit} className="flex flex-col gap-2.5 sm:flex-row">
          <input
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            aria-label="Proposed topic"
            name="topic"
            required
            maxLength={240}
            placeholder="Propose a topic or keyword to check sitemap overlap and queue…"
          />
          <button
            className="shrink-0 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            disabled={busy}
          >
            {busy ? 'Checking…' : 'Check overlap & queue'}
          </button>
        </form>
      )}

      {(notice || match || canForce) && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-[#0B0F17] px-3.5 py-2.5 text-xs text-slate-300"
        >
          <p className="min-w-0 flex-1 break-words">
            {notice}{' '}
            {match && (
              <a
                className="text-blue-400 underline hover:text-blue-300"
                href={match}
                target="_blank"
                rel="noreferrer"
              >
                Review matched page
              </a>
            )}
          </p>
          {canForce && pendingTopic && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void queueTopic(pendingTopic, true)}
              className="shrink-0 rounded-lg border border-blue-500/40 bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-500/25 disabled:opacity-50"
            >
              Queue as differentiated article
            </button>
          )}
        </div>
      )}
    </div>
  );
}

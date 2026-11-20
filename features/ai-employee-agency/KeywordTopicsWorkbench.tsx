'use client';

import { useEffect, useState } from 'react';
import { agencyRequest } from './agency-request';
import type { KnowledgeRow } from './KnowledgeReview';
import type { SuggestedKeywordCard } from '@/lib/ai-employee-agency/site-knowledge';

interface QueuedTopicRow {
  id: string;
  content: {
    topic?: string;
    priority_at?: string;
  };
}

export function KeywordTopicsWorkbench({
  website,
  refresh,
  onQueueAndWrite,
}: {
  website: KnowledgeRow;
  refresh: () => Promise<void>;
  onQueueAndWrite: (topic: string) => void;
}) {
  const [discovering, setDiscovering] = useState(false);
  const [busyKeyword, setBusyKeyword] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueuedTopicRow[]>([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const suggestedCards: SuggestedKeywordCard[] = Array.isArray(
    website.profile.suggestedKeywords,
  )
    ? website.profile.suggestedKeywords
    : [];

  async function loadQueue() {
    try {
      const res = await agencyRequest('/api/ai-employee-agency/calendar');
      if (!res.ok) return;
      const data = (await res.json()) as { queue?: QueuedTopicRow[] };
      setQueue(Array.isArray(data.queue) ? data.queue : []);
    } catch {
      // Non-fatal
    }
  }

  useEffect(() => {
    void loadQueue();
  }, [website.revision]);

  async function handleDiscoverKeywords() {
    if (discovering) return;
    setDiscovering(true);
    setError('');
    setNotice('Scanning live sitemap, Google Autocomplete & niche keyword gaps…');
    try {
      const res = await agencyRequest('/api/ai-employee-agency/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rescan', revision: website.revision }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Keyword discovery failed.');
      await refresh();
      setNotice('Refreshed 6 overlap-checked low-KD keyword opportunities.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Keyword discovery failed.');
      setNotice('');
    } finally {
      setDiscovering(false);
    }
  }

  async function handleQueueCard(card: SuggestedKeywordCard, writeImmediately: boolean) {
    if (busyKeyword) return;
    setBusyKeyword(card.keyword);
    setError('');
    setNotice('');
    try {
      const res = await agencyRequest('/api/ai-employee-agency/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: card.keyword,
          forceDifferentiated: true,
          revision: website.revision,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Unable to queue keyword.');
      await refresh();
      await loadQueue();
      if (writeImmediately) {
        onQueueAndWrite(card.keyword);
      } else {
        setNotice(`Queued "${card.keyword}" into your active production pipeline.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to queue keyword.');
    } finally {
      setBusyKeyword(null);
    }
  }

  async function prioritizeItem(itemId: string) {
    try {
      const res = await agencyRequest('/api/ai-employee-agency/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'prioritize', itemId }),
      });
      if (!res.ok) return;
      await loadQueue();
      setNotice('Moved topic to the top of your production queue.');
    } catch {
      // Non-fatal
    }
  }

  return (
    <section className="space-y-5 rounded-xl border border-slate-800 bg-[#111827] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
            Keyword Strategist Workbench
          </p>
          <h2 className="text-base font-semibold text-white">
            Low-KD Keyword Opportunities &amp; Overlap Gate
          </h2>
          <p className="text-xs text-slate-400">
            Every candidate is checked against your discovered sitemap URLs before entering the queue.
          </p>
        </div>

        <button
          type="button"
          disabled={discovering}
          onClick={() => void handleDiscoverKeywords()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
        >
          {discovering && (
            <span className="h-2 w-2 rounded-full bg-white animate-ping" />
          )}
          <span>
            {discovering
              ? 'Discovering Live Gaps…'
              : 'Discover 6 Low-KD Keywords & Competitor Gaps'}
          </span>
        </button>
      </div>

      {notice && (
        <p
          role="status"
          className="rounded-lg border border-blue-500/30 bg-blue-950/30 px-3.5 py-2 text-xs text-blue-200"
        >
          {notice}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-3.5 py-2 text-xs text-rose-200"
        >
          {error}
        </p>
      )}

      {suggestedCards.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#0B0F17] p-5 text-center text-xs text-slate-400">
          No keyword cards cached yet. Click{' '}
          <strong className="text-slate-200">
            Discover 6 Low-KD Keywords &amp; Competitor Gaps
          </strong>{' '}
          above to run live Autocomplete + sitemap gap discovery.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {suggestedCards.map((card) => {
            const isBusy = busyKeyword === card.keyword;
            const alreadyQueued = queue.some(
              (q) =>
                (q.content.topic || '').trim().toLowerCase() ===
                card.keyword.trim().toLowerCase(),
            );
            return (
              <article
                key={card.keyword}
                className="flex flex-col justify-between space-y-3 rounded-xl border border-slate-800 bg-[#0B0F17] p-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-blue-300">
                      KD {card.estimatedKd} · {card.intent}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        card.overlapAction === 'refresh'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-emerald-500/15 text-emerald-300'
                      }`}
                    >
                      {card.overlapAction === 'refresh'
                        ? `Refresh (${card.overlapScore}%)`
                        : `Verified Gap (${card.overlapScore}%)`}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{card.keyword}</h3>
                  <p className="text-xs leading-relaxed text-slate-400">
                    {card.recommendedTitle}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-3">
                  <button
                    type="button"
                    disabled={Boolean(busyKeyword) || alreadyQueued}
                    onClick={() => void handleQueueCard(card, false)}
                    className="rounded-lg border border-slate-700 bg-[#111827] px-3 py-1.5 text-[11px] font-semibold text-slate-200 transition hover:border-blue-500/60 hover:text-white disabled:opacity-50"
                  >
                    {alreadyQueued ? 'Queued' : isBusy ? 'Queuing…' : 'Queue Topic'}
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busyKeyword)}
                    onClick={() => void handleQueueCard(card, true)}
                    className="flex-1 rounded-lg bg-[#2563EB] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                  >
                    Queue &amp; Write Now →
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Active Topic Queue */}
      <div className="space-y-2.5 rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">
            Active Production Queue ({queue.length})
          </h3>
          <span className="font-mono text-[11px] text-slate-400">
            Ordered by priority
          </span>
        </div>
        {queue.length === 0 ? (
          <p className="text-xs text-slate-400">
            No topics queued yet. Click Queue Topic on any card above or enter a custom keyword below.
          </p>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {queue.slice(0, 12).map((item, idx) => {
              const topicName = item.content.topic || 'Queued topic';
              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2.5 py-2.5 text-xs"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-500">
                      #{idx + 1}
                    </span>
                    <span className="truncate font-medium text-slate-200">
                      {topicName}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => void prioritizeItem(item.id)}
                        className="rounded-md border border-slate-700 bg-[#111827] px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-blue-500/60 hover:text-white"
                      >
                        Move to Front
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onQueueAndWrite(topicName)}
                      className="rounded-md bg-[#2563EB] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-500"
                    >
                      Write Live →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

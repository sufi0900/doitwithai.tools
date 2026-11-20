'use client';

import { V6_SINGLE_SIDEBAR_GROUPS } from './navigation';
import { KnowledgeReview, type KnowledgeRow } from './KnowledgeReview';
import { agentName, channels, commercialLabel, panelAgents, socialHub, visualStudio } from '@/lib/ai-agency/panels';
import { PanelChat, PanelLedger } from './PanelWorkspace';
import { VisualBrandStudio } from './VisualBrandStudio';
import { ProductionProgress } from './ProductionProgress';
import { AgencyCalendar } from './AgencyCalendar';
import { QualityReview } from './QualityReview';
import { CommercialUsage } from './CommercialUsage';
import { RefreshWorkbench } from './RefreshWorkbench';
import Link from 'next/link';
import { useEffect, useState, Fragment } from 'react';
import { agencyRequest } from './agency-request';

type Summary = {
  counts: { published: number; ready: number; queued: number };
  lastCall: { created_at: string; model: string; total_tokens: number | null; calculated_usd: number | null } | null;
  website: KnowledgeRow | null;
};

const panel = 'rounded-xl border border-slate-800 bg-[#111827] p-5';

export default function AgencyWorkspaceOverview() {
  const [summary, setSummary] = useState<Summary>();
  const [status, setStatus] = useState('Loading workspace…');
  const [bindings, setBindings] = useState<Record<string, boolean>>({});
  const [view, setView] = useState('Overview');
  const [chat, setChat] = useState<string>();
  const [expanded, setExpanded] = useState(false);
  const [version, setVersion] = useState(0);
  const [crawling, setCrawling] = useState(false);
  const [crawlNotice, setCrawlNotice] = useState('');

  const agent = panelAgents[view];
  const channel = channels.find((c) => c.label === view);
  const indexedPagesCount = summary?.website?.profile?.pages?.length ?? 0;

  function navigate(next: string) {
    setView(next);
    setChat(undefined);
    if (next === socialHub) setExpanded(true);
    if (channels.some((c) => c.label === next)) setExpanded(true);
  }

  function navButton(label: string) {
    return (
      <button
        aria-current={view === label ? 'page' : undefined}
        className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${
          view === label
            ? 'bg-[#2563EB] font-medium text-white'
            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
        }`}
        onClick={() => navigate(label)}
      >
        {label}
      </button>
    );
  }

  async function refresh() {
    const res = await agencyRequest('/api/ai-employee-agency/workspace');
    const data = await res.json();
    if (!res.ok) {
      setSummary(undefined);
      setStatus(data.error);
      return;
    }
    setSummary(data);
    setStatus('');
  }

  async function crawlLiveSitemap() {
    if (!summary?.website || crawling) return;
    setCrawling(true);
    setCrawlNotice('');
    try {
      const action = summary.website.approved_at ? 'rescan' : 'discover';
      const res = await agencyRequest('/api/ai-employee-agency/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, revision: summary.website.revision }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Live sitemap crawl failed.');
      await refresh();
      setCrawlNotice(
        `Sitemap synced · ${data.pagesFound ?? 0} pages discovered (${data.coverage || 'updated'} inventory).`,
      );
    } catch (err) {
      setCrawlNotice(err instanceof Error ? err.message : 'Live sitemap crawl failed.');
    } finally {
      setCrawling(false);
    }
  }

  useEffect(() => {
    refresh().catch(() => setStatus('Workspace connection unavailable.'));
    fetch('/api/ai-employee-agency/diagnostics', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => setBindings(data.configured))
      .catch(() => setBindings({}));
  }, []);

  return (
    <main className="min-h-screen bg-[#0B0F17] text-slate-100 md:flex">
      <nav
        aria-label="Workspace navigation"
        className="flex flex-wrap gap-4 border-b border-slate-800/90 bg-[#0D131F] p-5 md:w-64 md:shrink-0 md:flex-col md:border-b-0 md:border-r"
      >
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-400">
            DoItWithAI Agency OS
          </p>
          <strong className="block text-base font-semibold text-white">Agency workspace</strong>
        </div>

        {V6_SINGLE_SIDEBAR_GROUPS.map((group) => (
          <div key={group.groupLabel} className="space-y-1">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {group.groupLabel}
            </p>
            {group.items.map((item) => (
              <Fragment key={item.id}>
                {item.id === 'nav-social' ? (
                  <>
                    <div className="flex items-center">
                      {navButton(socialHub)}
                      <button
                        onClick={() => setExpanded(!expanded)}
                        aria-expanded={expanded}
                        aria-controls="agency-social-channels"
                        aria-label="Toggle social channels"
                        className="rounded px-2.5 py-1.5 text-slate-400 hover:text-white"
                      >
                        {expanded ? '▴' : '▾'}
                      </button>
                    </div>
                    <div
                      id="agency-social-channels"
                      hidden={!expanded}
                      className="ml-3 space-y-0.5 border-l border-slate-800 pl-2"
                    >
                      {channels.map((c) => (
                        <Fragment key={c.id}>{navButton(c.label)}</Fragment>
                      ))}
                    </div>
                  </>
                ) : (
                  navButton(commercialLabel(item.id, item.label))
                )}
                {item.id === 'nav-overview' && navButton('Agency Calendar')}
              </Fragment>
            ))}
          </div>
        ))}

        <div className="mt-auto space-y-2 border-t border-slate-800 pt-4 text-sm">
          <button
            className="w-full rounded-lg bg-[#2563EB] px-3 py-2 font-medium text-white transition hover:bg-blue-500"
            onClick={() => setChat(agent || 'copilot')}
          >
            Ask Copilot
          </button>
          <Link className="block px-2 py-1 text-slate-400 hover:text-white" href="/ai-employee-agency">
            Website setup
          </Link>
          <Link
            className="block px-2 py-1 text-slate-500 hover:text-slate-300"
            href="/ai-employee-agency/dashboard?view=legacy"
          >
            Previous local workspace
          </Link>
        </div>
      </nav>

      <div className="mx-auto w-full max-w-6xl space-y-6 p-5 md:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h1 id="overview" className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              {view}
            </h1>
            {summary?.website && (
              <p className="mt-1 text-xs text-slate-400">
                <span className="font-mono text-slate-200">{summary.website.domain}</span> ·{' '}
                {summary.website.approved_at ? 'Approved' : 'Awaiting approval'} · {indexedPagesCount} indexed{' '}
                {indexedPagesCount === 1 ? 'page' : 'pages'} ({summary.website.profile.coverage || 'manual'})
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {summary?.website && (
              <button
                type="button"
                disabled={crawling}
                onClick={() => void crawlLiveSitemap()}
                className="rounded-lg border border-slate-700 bg-[#111827] px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-500/70 hover:text-white disabled:opacity-50"
              >
                {crawling ? 'Crawling Sitemap…' : 'Crawl Live Sitemap'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setChat(agent || 'copilot')}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
            >
              {agent && agent !== 'chief' ? `Chat with ${agentName(agent)}` : 'Open Copilot Drawer'}
            </button>
          </div>
        </header>

        {crawlNotice && (
          <p
            role="status"
            className="rounded-lg border border-blue-500/30 bg-blue-950/30 px-4 py-2.5 text-sm text-blue-200"
          >
            {crawlNotice}
          </p>
        )}

        {status && (
          <p role="status" className="rounded-lg border border-slate-800 bg-[#111827] px-4 py-3 text-sm text-slate-300">
            {status}{' '}
            {status.includes('Sign in') && (
              <Link className="text-blue-400 underline" href="/do-it-ai?signin=1">
                Sign in
              </Link>
            )}
          </p>
        )}

        {view === 'Overview' && (
          <section className="grid gap-4 sm:grid-cols-3">
            {(['published', 'ready', 'queued'] as const).map((key) => (
              <div className={panel} key={key}>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  {{ published: 'Published articles', ready: 'Ready for review', queued: 'Queued' }[key]}
                </p>
                <strong className="mt-2 block text-3xl font-semibold text-white">
                  {summary?.counts[key] ?? '—'}
                </strong>
              </div>
            ))}
          </section>
        )}

        {(['Overview', 'Keyword & Topics', 'Agent Skills & Cron'].includes(view) ||
          !summary?.website?.approved_at) && (
          <section className={panel}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-white">
                {view === 'Overview' ? 'Website knowledge base' : 'Workspace setup'}
              </h2>
              {summary?.website && indexedPagesCount === 0 && (
                <button
                  type="button"
                  disabled={crawling}
                  onClick={() => void crawlLiveSitemap()}
                  className="rounded-md border border-blue-500/40 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300 hover:bg-blue-500/20 disabled:opacity-50"
                >
                  {crawling ? 'Scanning…' : 'Sync sitemap now'}
                </button>
              )}
            </div>
            {summary?.website ? (
              <KnowledgeReview
                key={summary.website.revision}
                row={summary.website}
                refresh={refresh}
                topics={view === 'Keyword & Topics'}
              />
            ) : (
              <p className="mt-2 text-sm text-slate-400">
                {summary ? 'Register your website to begin setup.' : 'Workspace data unavailable.'}
              </p>
            )}
          </section>
        )}

        {view === 'Overview' && summary && <ProductionProgress />}
        {view === 'Agency Calendar' && <AgencyCalendar />}
        {view === 'QA & Auto-Publish' && summary?.website?.approved_at && (
          <QualityReview
            internal={summary.website.profile.source === 'internal_direct'}
            domain={summary.website.domain}
            revision={summary.website.revision}
          />
        )}
        {['Technical Site Audit', 'On-Page & Refresh'].includes(view) &&
          summary?.website?.approved_at && (
            <RefreshWorkbench
              key={view + summary.website.revision}
              website={summary.website}
              audit={view === 'Technical Site Audit'}
            />
          )}
        {view === socialHub && <PanelLedger key={view} agent="hub" openChannel={navigate} />}
        {view === visualStudio && summary?.website?.approved_at && (
          <VisualBrandStudio website={summary.website} />
        )}
        {view === 'Live Node Canvas' && (
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(panelAgents)
              .filter(([, id]) => id !== 'chief')
              .map(([name, id]) => (
                <button
                  key={id}
                  onClick={() => navigate(name)}
                  className={`${panel} text-left transition hover:border-blue-600/60 hover:bg-slate-900`}
                >
                  <span className="block text-xs uppercase tracking-wider text-blue-400">{name}</span>
                  <strong className="mt-1 block text-sm font-semibold text-white">{agentName(id)}</strong>
                </button>
              ))}
          </div>
        )}
        {agent && (channel || agent !== 'chief') && (
          <PanelLedger key={agent} agent={agent} version={version} />
        )}
        {view === 'Token & API Usage' && <CommercialUsage />}

        {['Overview', 'Token & API Usage'].includes(view) && (
          <section id="usage" className={panel}>
            <h2 className="text-base font-semibold text-white">Provider connections</h2>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {Object.keys(bindings).length === 0 && (
                <p className="text-sm text-slate-400">Diagnostics unavailable</p>
              )}
              {Object.entries(bindings).map(([provider, present]) => (
                <span
                  key={provider}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                    present
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-800 bg-[#0B0F17] text-slate-400'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${present ? 'bg-emerald-400' : 'bg-slate-600'}`}
                  />
                  {provider} · {present ? 'Configured' : 'Not configured'}
                </span>
              ))}
            </div>
            {summary && (
              <p className="mt-3 text-xs text-slate-400">
                {summary.lastCall
                  ? `Last successful call · ${summary.lastCall.model} · ${summary.lastCall.created_at} · ${summary.lastCall.total_tokens ?? 'unavailable'} tokens · calculated USD ${summary.lastCall.calculated_usd ?? 'unavailable'}`
                  : 'No successful provider calls recorded yet.'}
              </p>
            )}
          </section>
        )}

        {chat && (
          <PanelChat
            key={chat}
            agent={chat}
            close={() => setChat(undefined)}
            onSaved={() => {
              setVersion((v) => v + 1);
              void refresh();
            }}
          />
        )}
      </div>
    </main>
  );
}

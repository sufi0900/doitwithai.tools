'use client';

import { V6_SINGLE_SIDEBAR_GROUPS } from './navigation';
import { KnowledgeReview, type KnowledgeRow } from './KnowledgeReview';
import { GuidedOnboardingStudio } from './GuidedOnboardingStudio';
import { LivePipelineTracker } from './LivePipelineTracker';
import { KeywordTopicsWorkbench } from './KeywordTopicsWorkbench';
import { AiVisibilityWorkbench } from './AiVisibilityWorkbench';
import { PriorityActionQueue } from './PriorityActionQueue';
import { PanelChat, PanelLedger } from './PanelWorkspace';
import { agentName, channels, commercialLabel, panelAgents, socialHub, visualStudio } from '@/lib/ai-agency/panels';
import { VisualBrandStudio } from './VisualBrandStudio';
import { ProductionProgress } from './ProductionProgress';
import { AgencyCalendar } from './AgencyCalendar';
import { QualityReview } from './QualityReview';
import { CommercialUsage } from './CommercialUsage';
import { RefreshWorkbench } from './RefreshWorkbench';
import { AgencyOverviewMetrics } from './AgencyOverviewMetrics';
import { CalmAgencyNodeCanvas } from './CalmAgencyNodeCanvas';
import { SidebarNavIcon } from './SidebarNavIcons';
import { PractitionerBrainPanel } from './PractitionerBrainPanel';
import Link from 'next/link';
import { useEffect, useState, useRef, Fragment } from 'react';
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
  const [chatSeedPrompt, setChatSeedPrompt] = useState<string>('');
  const [expanded, setExpanded] = useState(false);
  const [version, setVersion] = useState(0);
  const [crawling, setCrawling] = useState(false);
  const [crawlNotice, setCrawlNotice] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [launchNotice, setLaunchNotice] = useState('');
  const [autoRunTopic, setAutoRunTopic] = useState<string | undefined>();
  const [activePipelineAgent, setActivePipelineAgent] = useState<string | null>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  const agent = panelAgents[view];
  const channel = channels.find((c) => c.label === view);
  const indexedPagesCount = summary?.website?.profile?.pages?.length ?? 0;
  const activeProviders = Object.entries(bindings)
    .filter(([, configured]) => configured)
    .map(([provider]) => provider);
  const isSetupView = ['Overview', 'Keyword & Topics', 'Agent Skills & Cron'].includes(view);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileNavOpen]);

  function openChatWith(agentId: string, prompt = '') {
    setChatSeedPrompt(prompt);
    setChat(agentId);
  }

  function navigate(next: string) {
    setView(next);
    setChat(undefined);
    setChatSeedPrompt('');
    setMobileNavOpen(false);
    contentScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    if (next === socialHub) setExpanded(true);
    if (channels.some((c) => c.label === next)) setExpanded(true);
  }

  function badgeForNav(label: string): number | null {
    if (!summary) return null;
    if (label === 'Keyword & Topics' || label === 'Article Studio') {
      return summary.counts.queued > 0 ? summary.counts.queued : null;
    }
    if (label === 'QA & Auto-Publish') {
      return summary.counts.ready > 0 ? summary.counts.ready : null;
    }
    return null;
  }

  function navButton(label: string) {
    const isActive = view === label;
    const badgeCount = badgeForNav(label);
    const showLiveDot = label === 'Live Node Canvas' && Boolean(activePipelineAgent);

    return (
      <button
        type="button"
        aria-current={isActive ? 'page' : undefined}
        className={`group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition ${
          isActive
            ? 'bg-[#2563EB] font-medium text-white shadow-sm'
            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
        }`}
        onClick={() => navigate(label)}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <SidebarNavIcon label={label} active={isActive} />
          <span className="truncate">{label}</span>
        </span>
        {showLiveDot ? (
          <span
            aria-label="Live pipeline active"
            className="inline-flex h-2 w-2 shrink-0 rounded-full bg-blue-300 animate-ping"
          />
        ) : badgeCount !== null ? (
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none ${
              isActive
                ? 'bg-white/20 text-white'
                : 'border border-slate-700/80 bg-[#0B0F17] text-slate-300'
            }`}
          >
            {badgeCount}
          </span>
        ) : null}
      </button>
    );
  }

  function renderSidebarContent(isMobileDrawer: boolean) {
    const isWorking = Boolean(activePipelineAgent) || crawling;
    return (
      <>
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800/80 px-4 py-3.5">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  isWorking
                    ? 'bg-blue-400 animate-ping'
                    : activeProviders.length > 0
                      ? 'bg-emerald-400'
                      : 'bg-slate-600'
                }`}
              />
              <p className="truncate text-[11px] font-semibold uppercase tracking-widest text-blue-400">
                DoItWithAI Agency OS
              </p>
            </div>
            <strong className="block truncate text-base font-semibold text-white">
              Agency workspace
            </strong>
          </div>
          {isMobileDrawer && (
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close workspace navigation"
              className="shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Close
            </button>
          )}
        </div>

        <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-3 py-3">
          {V6_SINGLE_SIDEBAR_GROUPS.map((group) => (
            <div key={group.groupLabel} className="space-y-1">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {group.groupLabel}
              </p>
              {group.items.map((item) => (
                <Fragment key={item.id}>
                  {item.id === 'nav-social' ? (
                    <>
                      <div className="flex items-center gap-1">
                        {navButton(socialHub)}
                        <button
                          type="button"
                          onClick={() => setExpanded(!expanded)}
                          aria-expanded={expanded}
                          aria-controls={
                            isMobileDrawer
                              ? 'agency-social-channels-mobile'
                              : 'agency-social-channels'
                          }
                          aria-label="Toggle social channels"
                          className="shrink-0 rounded px-2 py-1.5 text-slate-400 hover:bg-slate-800/70 hover:text-white"
                        >
                          {expanded ? '▴' : '▾'}
                        </button>
                      </div>
                      <div
                        id={
                          isMobileDrawer
                            ? 'agency-social-channels-mobile'
                            : 'agency-social-channels'
                        }
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
        </div>

        <div className="shrink-0 space-y-1.5 border-t border-slate-800/90 p-3.5 text-xs">
          <button
            type="button"
            className="w-full rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            onClick={() => {
              setMobileNavOpen(false);
              openChatWith(agent || 'copilot');
            }}
          >
            Ask Copilot
          </button>
          <Link
            className="block rounded px-2 py-1 text-slate-400 hover:bg-slate-800/60 hover:text-white"
            href="/ai-employee-agency"
            onClick={() => setMobileNavOpen(false)}
          >
            Website setup
          </Link>
          <Link
            className="block rounded px-2 py-1 text-slate-500 hover:bg-slate-800/60 hover:text-slate-300"
            href="/ai-employee-agency/dashboard?view=legacy"
            onClick={() => setMobileNavOpen(false)}
          >
            Previous local workspace
          </Link>
        </div>
      </>
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

  // STRICT DASHBOARD LOCK GATE:
  // Lock the 13-panel dashboard behind the focused 4-Step Guided Onboarding Studio until approved_at is set.
  if (summary?.website && !summary.website.approved_at) {
    return (
      <GuidedOnboardingStudio
        row={summary.website}
        refresh={refresh}
        onApproved={({ autoRun, firstTopic }) => {
          setView('Overview');
          if (autoRun) {
            if (firstTopic) setAutoRunTopic(firstTopic);
            setLaunchNotice(
              firstTopic
                ? `Digital Agency activated · Starting Live Production Run #1 for "${firstTopic}".`
                : 'Digital Agency activated · Your starter topics are queued and ready for live execution.',
            );
          }
        }}
      />
    );
  }

  // Clean unauthenticated or no-website-yet state (prevents broken 0% dashboard shell)
  if (!summary?.website) {
    return (
      <div className="flex h-full min-h-0 w-full items-center justify-center overflow-y-auto bg-[#0B0F17] p-6 text-slate-100">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-[#111827] p-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-400">
            DoItWithAI Agency OS
          </p>
          <h1 className="text-xl font-semibold text-white">
            {status ? 'Workspace Access' : 'Connect your website to begin'}
          </h1>
          <p className="text-sm text-slate-400">
            {status || 'Register your external website or DoItWithAI Builder slug to run automatic Brand DNA & keyword discovery.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {status.includes('Sign in') ? (
              <Link
                href="/do-it-ai?signin=1"
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Sign in to Workspace →
              </Link>
            ) : !status ? (
              <Link
                href="/ai-employee-agency"
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Register Website →
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#0B0F17] text-slate-100 lg:flex-row">
      {/* Mobile & Tablet compact bar */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800/90 bg-[#0D131F] px-4 py-2.5 lg:hidden">
        <button
          type="button"
          aria-label="Open workspace navigation"
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen(true)}
          className="flex min-w-0 items-center gap-2.5 rounded-lg border border-slate-700/80 bg-[#111827] px-2.5 py-1.5 text-left text-sm text-slate-200 hover:border-blue-500/60 hover:text-white"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4 shrink-0 text-slate-300"
          >
            <path
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
          <SidebarNavIcon label={view} active={false} />
          <span className="truncate font-semibold text-white">{view}</span>
        </button>
        <button
          type="button"
          onClick={() => openChatWith(agent || 'copilot')}
          className="shrink-0 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500"
        >
          Ask Copilot
        </button>
      </div>

      {/* Desktop persistent scrollable sidebar */}
      <nav
        aria-label="Workspace navigation"
        className="hidden lg:flex lg:h-full lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-slate-800/90 lg:bg-[#0D131F]"
      >
        {renderSidebarContent(false)}
      </nav>

      {/* Mobile / Tablet slide-over navigation drawer */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-[10000] flex bg-black/60 backdrop-blur-[2px] lg:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileNavOpen(false);
          }}
        >
          <nav
            aria-label="Workspace navigation"
            className="flex h-full w-72 max-w-[85vw] flex-col border-r border-slate-800 bg-[#0D131F] shadow-2xl"
          >
            {renderSidebarContent(true)}
          </nav>
        </div>
      )}

      {/* Independent vertically scrollable workspace pane */}
      <div
        ref={contentScrollRef}
        className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div className="mx-auto w-full max-w-[1400px] space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <header className="flex flex-col gap-3 border-b border-slate-800/80 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1
                id="overview"
                className="truncate text-2xl font-semibold tracking-tight text-white md:text-3xl"
              >
                {view}
              </h1>
              <p className="mt-1 break-words text-xs text-slate-400">
                <span className="font-mono text-slate-200">{summary.website.domain}</span> · Approved ·{' '}
                {indexedPagesCount} indexed {indexedPagesCount === 1 ? 'page' : 'pages'} (
                {summary.website.profile.coverage || 'partial'})
                {summary.website.profile.domain_maturity && (
                  <>
                    {' '}
                    ·{' '}
                    <span className="text-blue-300">
                      {summary.website.profile.domain_maturity === 'established_site'
                        ? 'Established Site Mode'
                        : 'New Site Mode'}
                    </span>
                  </>
                )}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={crawling}
                onClick={() => void crawlLiveSitemap()}
                className="rounded-lg border border-slate-700 bg-[#111827] px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-500/70 hover:text-white disabled:opacity-50"
              >
                {crawling ? 'Crawling Sitemap…' : 'Crawl Live Sitemap'}
              </button>
              <button
                type="button"
                onClick={() => openChatWith(agent || 'copilot')}
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
              >
                {agent && agent !== 'chief'
                  ? `Chat with ${agentName(agent)}`
                  : 'Open Copilot Drawer'}
              </button>
            </div>
          </header>

          {launchNotice && (
            <p
              role="status"
              className="break-words rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200"
            >
              {launchNotice}
            </p>
          )}

          {crawlNotice && (
            <p
              role="status"
              className="break-words rounded-lg border border-blue-500/30 bg-blue-950/30 px-4 py-2.5 text-sm text-blue-200"
            >
              {crawlNotice}
            </p>
          )}

          {view === 'Overview' && (
            <AgencyOverviewMetrics
              approved={Boolean(summary.website.approved_at)}
              indexedPages={indexedPagesCount}
              coverage={summary.website.profile?.coverage}
              activeProvidersCount={activeProviders.length}
              counts={summary.counts}
              onNavigate={navigate}
            />
          )}

          {(view === 'Overview' || view === 'Article Studio') && (
            <LivePipelineTracker
              website={summary.website}
              counts={summary.counts}
              autoRunTopic={autoRunTopic}
              onClearAutoRun={() => setAutoRunTopic(undefined)}
              onStageChange={setActivePipelineAgent}
              onCompleted={async () => {
                setVersion((v) => v + 1);
                await refresh();
              }}
              onOpenQa={() => navigate('QA & Auto-Publish')}
            />
          )}

          {view === 'Overview' && (
            <PriorityActionQueue
              website={summary.website}
              counts={summary.counts}
              onNavigate={navigate}
            />
          )}

          {view === 'Keyword & Topics' && (
            <KeywordTopicsWorkbench
              website={summary.website}
              refresh={refresh}
              onQueueAndWrite={(topic) => {
                setAutoRunTopic(topic);
                navigate('Article Studio');
              }}
            />
          )}

          {view === 'AI Visibility & Links' && (
            <AiVisibilityWorkbench
              website={summary.website}
              onTopicQueued={async () => {
                setVersion((v) => v + 1);
                await refresh();
              }}
            />
          )}

          {isSetupView && (
            <section className={panel}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-white">
                  {view === 'Overview' ? 'Website knowledge base' : 'Workspace setup'}
                </h2>
                {indexedPagesCount === 0 && (
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
              <KnowledgeReview
                key={summary.website.revision}
                row={summary.website}
                refresh={refresh}
                topics={view === 'Keyword & Topics'}
              />
            </section>
          )}

          {view === 'Overview' && <ProductionProgress />}
          {view === 'Agency Calendar' && <AgencyCalendar />}
          {view === 'QA & Auto-Publish' && (
            <QualityReview
              internal={summary.website.profile.source === 'internal_direct'}
              domain={summary.website.domain}
              revision={summary.website.revision}
            />
          )}
          {['Technical Site Audit', 'On-Page & Refresh'].includes(view) && (
            <RefreshWorkbench
              key={view + summary.website.revision}
              website={summary.website}
              audit={view === 'Technical Site Audit'}
            />
          )}
          {view === socialHub && (
            <PanelLedger
              key={view}
              agent="hub"
              website={summary.website}
              openChannel={navigate}
              onStartAction={openChatWith}
            />
          )}
          {view === visualStudio && <VisualBrandStudio website={summary.website} />}
          {view === 'Live Node Canvas' && (
            <CalmAgencyNodeCanvas
              domain={summary.website.domain}
              approved={Boolean(summary.website.approved_at)}
              indexedPages={indexedPagesCount}
              counts={summary.counts}
              activeProviders={activeProviders}
              activeAgentId={activePipelineAgent}
              onOpenPanel={navigate}
              onOpenChat={(id) => openChatWith(id)}
            />
          )}
          {agent && (channel || agent !== 'chief') && (
            <PanelLedger
              key={agent}
              agent={agent}
              website={summary.website}
              version={version}
              onStartAction={openChatWith}
              onOpenQa={() => navigate('QA & Auto-Publish')}
            />
          )}
          {view === 'Agent Skills & Cron' && <PractitionerBrainPanel />}
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
              <p className="mt-3 break-words text-xs text-slate-400">
                {summary.lastCall
                  ? `Last successful call · ${summary.lastCall.model} · ${summary.lastCall.created_at} · ${summary.lastCall.total_tokens ?? 'unavailable'} tokens · calculated USD ${summary.lastCall.calculated_usd ?? 'unavailable'}`
                  : 'No successful provider calls recorded yet.'}
              </p>
            </section>
          )}
        </div>
      </div>

      {chat && (
        <PanelChat
          key={chat + chatSeedPrompt}
          agent={chat}
          initialPrompt={chatSeedPrompt}
          website={summary.website}
          counts={summary.counts}
          close={() => {
            setChat(undefined);
            setChatSeedPrompt('');
          }}
          onSaved={() => {
            setVersion((v) => v + 1);
            void refresh();
          }}
        />
      )}
    </div>
  );
}

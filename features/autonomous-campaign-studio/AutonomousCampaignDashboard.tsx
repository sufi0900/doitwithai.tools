'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AUTONOMOUS_AGENT_ROLES,
  calculateCampaignTokenBudget,
} from '@/lib/autonomous-agents/agent-roles';
import {
  advanceCampaignJobStep,
  loadAutonomousStudioState,
  lockPinAsWinnerFormula,
  resetAutonomousStudioState,
  saveAutonomousStudioState,
} from '@/lib/autonomous-agents/local-storage-store';
import { discoverLowKdTopicsForWebsite } from '@/lib/autonomous-agents/arcads-social-engine';
import { renderPinterestPinPreviewSvg } from '@/lib/autonomous-agents/pin-svg-preview';
import type {
  AutomatedArticleJob,
  AutonomousCampaign,
  AutonomousStudioStoreState,
  ConnectedWebsiteProfile,
  WebsitePublishingMode,
} from '@/lib/autonomous-agents/types';

type StudioTab =
  | 'campaign-autopilot'
  | 'arcads-pinterest-lab'
  | 'agent-roles'
  | 'connectors-byok'
  | 'phase-roadmap';

export const SIX_IMPLEMENTATION_PHASES = [
  {
    phaseNumber: 1,
    title: 'Phase 1: 12 Agent Roles, Contracts, Universal Visual Rules & No-Auth LocalStorage Sandbox',
    status: 'completed' as const,
    summary:
      'Complete 12-agent registry, deterministic Low-KD Topic Radar, Arcads 5-hook social matrix, 3x 1000x1500 (2:3) Pinterest Pin SVG engine, and 100% browser localStorage persistence (`doitwithai_autonomous_studio_v1`) with zero compulsory sign-in.',
    deliverables: [
      'lib/autonomous-agents/types.ts & lib/autonomous-agents/agent-roles.ts',
      'lib/autonomous-agents/arcads-social-engine.ts & lib/autonomous-agents/pin-svg-preview.ts',
      'lib/autonomous-agents/local-storage-store.ts (No-Auth LocalStorage State Machine)',
      'features/autonomous-campaign-studio/AutonomousCampaignDashboard.tsx & /ai-content-writer/automation',
    ],
    verificationCommand: 'npx tsx --test tests/ai-tools/autonomous-agents-phase1.test.ts',
    handoffPromptForNextAi:
      'Phase 1 is complete in lib/autonomous-agents/* and features/autonomous-campaign-studio/*. Proceed to Phase 2 in docs/AUTONOMOUS_AGENTS_PHASE_TRACKER.md.',
  },
  {
    phaseNumber: 2,
    title: 'Phase 2: Live Sitemap Crawler, Google Trends RSS & Low-KD Topical Map Engine',
    status: 'ready' as const,
    summary:
      'Server-side sitemap.xml parser, Google Trends Public RSS feed ingestion, and Google Autocomplete question expander with anti-cannibalization deduplication.',
    deliverables: [
      'lib/autonomous-agents/sitemap-trend-scout.ts',
      'app/api/autonomous-agents/scout/route.ts',
      'tests/ai-tools/autonomous-agents-phase2.test.ts',
    ],
    verificationCommand: 'npx tsx --test tests/ai-tools/autonomous-agents-phase2.test.ts',
    handoffPromptForNextAi:
      'Read docs/AUTONOMOUS_AGENTS_PHASE_TRACKER.md and lib/autonomous-agents/types.ts. Implement Phase 2 (Website Sitemap Crawler, Google Trends RSS & Low-KD Topical Map Engine) in lib/autonomous-agents/sitemap-trend-scout.ts and app/api/autonomous-agents/scout/route.ts.',
  },
  {
    phaseNumber: 3,
    title: 'Phase 3: Free-Tier BYOK Multi-Agent Article & 6-Layer Visual Batch Runner',
    status: 'ready' as const,
    summary:
      'Client-side BYOK execution for Gemini 2.5 Flash & Groq Llama 3.3 70B with automatic RPM cooldown pacing and 0-token 6-layer SVG section infographic embedding.',
    deliverables: [
      'lib/autonomous-agents/byok-batch-runner.ts',
      'tests/ai-tools/autonomous-agents-phase3.test.ts',
    ],
    verificationCommand: 'npx tsx --test tests/ai-tools/autonomous-agents-phase3.test.ts',
    handoffPromptForNextAi:
      'Read docs/AUTONOMOUS_AGENTS_PHASE_TRACKER.md and lib/autonomous-agents/agent-roles.ts. Implement Phase 3 (Free-Tier BYOK Multi-Agent Article & 6-Layer Visual Batch Runner) in lib/autonomous-agents/byok-batch-runner.ts.',
  },
  {
    phaseNumber: 4,
    title: 'Phase 4: Arcads 5-Hook Social Atomizer, Pinterest 2:3 PNG Exporter & LinkedIn PDF Deck',
    status: 'ready' as const,
    summary:
      'Batch rasterizer exporting 3x 1000x1500 Pinterest PNGs, 8-slide 1080x1350 LinkedIn PDF carousels, and Buffer/Pinterest bulk CSV schedules.',
    deliverables: [
      'lib/autonomous-agents/pinterest-carousel-exporter.ts',
      'tests/ai-tools/autonomous-agents-phase4.test.ts',
    ],
    verificationCommand: 'npx tsx --test tests/ai-tools/autonomous-agents-phase4.test.ts',
    handoffPromptForNextAi:
      'Read docs/AUTONOMOUS_AGENTS_PHASE_TRACKER.md and lib/autonomous-agents/arcads-social-engine.ts. Implement Phase 4 (Pinterest 2:3 PNG Batch Exporter & LinkedIn PDF Carousel) in lib/autonomous-agents/pinterest-carousel-exporter.ts.',
  },
  {
    phaseNumber: 5,
    title: 'Phase 5: Dual-Destination Auto-Publisher (Internal /p/[slug]/blog + External WP/Buffer MCP)',
    status: 'ready' as const,
    summary:
      'Direct publishing into DoItWithAI Website Builder sites (/p/[slug]/blog) and external WordPress REST API v2 Application Passwords + Buffer MCP / Pinterest API v5.',
    deliverables: [
      'lib/autonomous-agents/publishers/internal-site-publisher.ts',
      'app/api/autonomous-agents/publish/route.ts',
      'tests/ai-tools/autonomous-agents-phase5.test.ts',
    ],
    verificationCommand: 'npx tsx --test tests/ai-tools/autonomous-agents-phase5.test.ts',
    handoffPromptForNextAi:
      'Read docs/AUTONOMOUS_AGENTS_PHASE_TRACKER.md and lib/autonomous-agents/types.ts. Implement Phase 5 (Dual-Destination Auto-Publisher for Internal /p/[slug]/blog and External WordPress REST API / Buffer MCP).',
  },
  {
    phaseNumber: 6,
    title: 'Phase 6: Closed-Loop Analytics, Winner-Clone Feedback & Optional Cloud Sync',
    status: 'ready' as const,
    summary:
      'Automated Winner-Clone weighting for future 5–15 post batches plus optional 1-click migration from browser localStorage to Supabase + Inngest durable cron queues.',
    deliverables: [
      'lib/autonomous-agents/winner-clone-loop.ts',
      'tests/ai-tools/autonomous-agents-phase6.test.ts',
    ],
    verificationCommand: 'npx tsx --test tests/ai-tools/autonomous-agents-phase6.test.ts',
    handoffPromptForNextAi:
      'Read docs/AUTONOMOUS_AGENTS_PHASE_TRACKER.md and lib/autonomous-agents/local-storage-store.ts. Implement Phase 6 (Winner-Clone Loop & Optional Cloud Sync).',
  },
];

export default function AutonomousCampaignDashboard() {
  const [studioState, setStudioState] = useState<AutonomousStudioStoreState | null>(null);
  const [activeTab, setActiveTab] = useState<StudioTab>('campaign-autopilot');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedPinIndex, setSelectedPinIndex] = useState<number>(0);

  // Campaign creation form state
  const [newCampaignName, setNewCampaignName] = useState<string>(
    'Q1 2027 Programmatic SEO & Pinterest Growth Batch'
  );
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>('site-doitwithai-flagship');
  const [newSiteUrl, setNewSiteUrl] = useState<string>('https://doitwithai.tools');
  const [newSiteNiche, setNewSiteNiche] = useState<string>(
    'AI SEO, GEO Answer Engine Optimization & Autonomous Workflows'
  );
  const [newPublishingMode, setNewPublishingMode] = useState<WebsitePublishingMode>(
    'internal-doitwithai-site'
  );
  const [newInternalSlug, setNewInternalSlug] = useState<string>(
    'doitwithai-multi-tool-directory-publication'
  );
  const [seedPrompts, setSeedPrompts] = useState<string>(
    [
      'How to Rank in Perplexity & ChatGPT Search with 50-Word Answer Blocks',
      'Programmatic 6-Layer Blog Section Infographics vs Stock Photos',
      'Pinterest 2:3 Fresh Pin Automation for SaaS & AI Directories',
    ].join('\n')
  );
  const [newCampaignCount, setNewCampaignCount] = useState<number>(5);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadAutonomousStudioState();
    setStudioState(loaded);
    const firstCampaign =
      loaded.campaigns.find((c) => c.id === loaded.activeCampaignId) || loaded.campaigns[0];
    if (firstCampaign) {
      setSelectedWebsiteId(firstCampaign.websiteId);
      if (firstCampaign.jobs[0]) {
        setSelectedJobId(firstCampaign.jobs[0].id);
      }
    }
  }, []);

  const updateState = (
    updater: (prev: AutonomousStudioStoreState) => AutonomousStudioStoreState
  ) => {
    setStudioState((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      return saveAutonomousStudioState(next);
    });
  };

  const activeCampaign: AutonomousCampaign | undefined = useMemo(() => {
    if (!studioState) return undefined;
    return (
      studioState.campaigns.find((c) => c.id === studioState.activeCampaignId) ||
      studioState.campaigns[0]
    );
  }, [studioState]);

  const activeWebsite: ConnectedWebsiteProfile | undefined = useMemo(() => {
    if (!studioState || !activeCampaign) return undefined;
    return (
      studioState.websites.find((w) => w.id === activeCampaign.websiteId) ||
      studioState.websites[0]
    );
  }, [studioState, activeCampaign]);

  const selectedJob: AutomatedArticleJob | undefined = useMemo(() => {
    if (!activeCampaign) return undefined;
    return (
      activeCampaign.jobs.find((j) => j.id === selectedJobId) || activeCampaign.jobs[0]
    );
  }, [activeCampaign, selectedJobId]);

  const tokenBudget = useMemo(
    () =>
      calculateCampaignTokenBudget(
        activeCampaign?.targetArticleCount || 5,
        studioState?.byokConfig.rpmCooldownSeconds || 45
      ),
    [activeCampaign?.targetArticleCount, studioState?.byokConfig.rpmCooldownSeconds]
  );

  const selectedPin =
    selectedJob?.pinterestPins[selectedPinIndex] || selectedJob?.pinterestPins[0];

  const pinSvgMarkup = useMemo(() => {
    if (!selectedPin) return '';
    return renderPinterestPinPreviewSvg(
      selectedPin,
      activeWebsite?.siteName || 'DoItWithAI.tools',
      activeWebsite?.brandPrimaryHex || '#38BDF8'
    );
  }, [selectedPin, activeWebsite]);

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCreateCampaign = () => {
    if (!studioState) return;
    const nowIso = new Date().toISOString();
    const customWebsite: ConnectedWebsiteProfile = {
      id: `site-${Date.now()}`,
      siteName: newSiteUrl.replace(/^https?:\/\//, '').split('/')[0] || 'Custom Website',
      siteUrl: newSiteUrl,
      publishingMode: newPublishingMode,
      internalBuilderSlug:
        newPublishingMode === 'internal-doitwithai-site' ? newInternalSlug : undefined,
      primaryNiche: newSiteNiche,
      brandPrimaryHex: '#38BDF8',
      brandSecondaryHex: '#10B981',
      darkThemePreferred: true,
      installedTools: studioState.websites[0]?.installedTools || [],
    };

    const jobs = discoverLowKdTopicsForWebsite(
      customWebsite,
      seedPrompts,
      newCampaignCount,
      studioState.winnerFormulas
    );

    const newCampaign: AutonomousCampaign = {
      id: `campaign-${Date.now()}`,
      name: newCampaignName,
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
      websiteId: customWebsite.id,
      seedTopicsOrPrompt: seedPrompts,
      targetArticleCount: newCampaignCount,
      cadence: 'weekly-2-articles',
      approvalMode: 'confidence-gated-90',
      confidenceThreshold: 90,
      status: 'running',
      jobs,
    };

    updateState((prev) => ({
      ...prev,
      activeCampaignId: newCampaign.id,
      websites: [customWebsite, ...prev.websites],
      campaigns: [newCampaign, ...prev.campaigns],
    }));

    if (jobs[0]) setSelectedJobId(jobs[0].id);
  };

  const handleAdvanceStep = (jobId: string, completeAll = false) => {
    if (!activeCampaign) return;
    updateState((prev) =>
      advanceCampaignJobStep(prev, activeCampaign.id, jobId, completeAll)
    );
  };

  const handleLockWinnerFormula = () => {
    if (!selectedPin) return;
    updateState((prev) => lockPinAsWinnerFormula(prev, selectedPin, 'numbered-playbook'));
  };

  const handleResetDemo = () => {
    const fresh = resetAutonomousStudioState();
    setStudioState(fresh);
    if (fresh.campaigns[0]?.jobs[0]) {
      setSelectedJobId(fresh.campaigns[0].jobs[0].id);
    }
  };

  if (!studioState || !activeCampaign) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="text-sm uppercase tracking-widest text-sky-400 font-semibold">
            Loading Autonomous Agent OS (LocalStorage Sandbox)
          </div>
          <p className="text-xs text-slate-400">
            Zero sign-in required · Initializing 12-Agent Registry & Campaign Store...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Phase 1 Live · LocalStorage No-Auth Sandbox
            </span>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
              DoItWithAI 2027 Autonomous Content, Visual & Social Agent OS
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/ai-content-writer"
              className="rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-slate-200 hover:border-sky-500/50 hover:text-sky-300 transition"
            >
              ← Content Writer Studio
            </Link>
            <Link
              href="/tools/blog-section-infographic-generator"
              className="rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-slate-200 hover:border-sky-500/50 hover:text-sky-300 transition"
            >
              6-Layer Visual Studio
            </Link>
            <Link
              href="/founder-hub/autonomous-agents"
              className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 font-medium text-sky-300 hover:bg-sky-500/20 transition"
            >
              6-Phase Blueprint Docs ↗
            </Link>
            <button
              type="button"
              onClick={handleResetDemo}
              className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-rose-300 hover:bg-rose-500/20 transition"
            >
              Reset Local Cache
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto pb-2.5">
          {[
            {
              id: 'campaign-autopilot',
              label: '1. Campaign Autopilot (1–15 Posts)',
              badge: `${activeCampaign.jobs.length} Jobs`,
            },
            {
              id: 'arcads-pinterest-lab',
              label: '2. Arcads 5-Hook & Pinterest 2:3 Lab',
              badge: '3 Pins / Post',
            },
            {
              id: 'agent-roles',
              label: '3. 12 Autonomous Agent Roles & Rules',
              badge: '12 Agents',
            },
            {
              id: 'connectors-byok',
              label: '4. Internal /p/[slug] vs External & BYOK',
              badge: '$0 Free Tier',
            },
            {
              id: 'phase-roadmap',
              label: '5. 6-Phase AI Expert Execution Tracker',
              badge: 'Phase 1 Complete',
            },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as StudioTab)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                  active
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    active
                      ? 'bg-slate-950/20 text-slate-950 font-bold'
                      : 'bg-slate-800 text-sky-300'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Top KPI Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Active Storage Mode
            </div>
            <div className="mt-1 text-base font-bold text-emerald-400">
              Browser localStorage (No Sign-In)
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Key: <code className="text-slate-300">doitwithai_autonomous_studio_v1</code>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Active Publishing Route
            </div>
            <div className="mt-1 text-base font-bold text-sky-400">
              {activeWebsite?.publishingMode === 'internal-doitwithai-site'
                ? `Internal (/p/${activeWebsite.internalBuilderSlug || 'demo'}/blog)`
                : `External (${activeWebsite?.publishingMode || 'staging'})`}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Supports DoItWithAI Builder sites + External WP/Webhooks
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Campaign Token & Cost Budget
            </div>
            <div className="mt-1 text-base font-bold text-amber-300">
              ~{tokenBudget.totalCampaignTokens.toLocaleString()} Tokens ($0.00 Free Tier)
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {tokenBudget.tokensPerArticle.toLocaleString()} tokens/post · Saves{' '}
              {tokenBudget.tokenSavingsPercent}% vs legacy
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Winner Formulas Locked
            </div>
            <div className="mt-1 text-base font-bold text-purple-300">
              {studioState.winnerFormulas.length} Proven Hook Formula(s)
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Arcads 5-Hook Matrix + Pinterest 2:3 Fresh Pin Cloner
            </div>
          </div>
        </section>

        {/* TAB 1: CAMPAIGN AUTOPILOT */}
        {activeTab === 'campaign-autopilot' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Campaign Creator & Selector */}
            <div className="lg:col-span-4 space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-sky-400">
                    Launch Autonomous Batch
                  </h2>
                  <span className="text-[11px] text-slate-400">1 to 15 Posts</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Website or Sitemap URL
                    </label>
                    <input
                      type="text"
                      value={newSiteUrl}
                      onChange={(e) => setNewSiteUrl(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Primary Niche & Topic Pillar
                    </label>
                    <input
                      type="text"
                      value={newSiteNiche}
                      onChange={(e) => setNewSiteNiche(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Seed Topics / Prompts (Optional — 1 per line)
                    </label>
                    <textarea
                      rows={3}
                      value={seedPrompts}
                      onChange={(e) => setSeedPrompts(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Destination Mode
                      </label>
                      <select
                        value={newPublishingMode}
                        onChange={(e) =>
                          setNewPublishingMode(e.target.value as WebsitePublishingMode)
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-slate-100"
                      >
                        <option value="internal-doitwithai-site">
                          Internal (/p/[slug]/blog)
                        </option>
                        <option value="external-workspace-staging">
                          External Staging Queue
                        </option>
                        <option value="external-wordpress-rest">
                          WordPress REST API v2
                        </option>
                        <option value="external-custom-webhook">
                          Custom Webhook JSON
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Batch Size ({newCampaignCount} Posts)
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={15}
                        value={newCampaignCount}
                        onChange={(e) => setNewCampaignCount(Number(e.target.value))}
                        className="w-full accent-sky-400 mt-2"
                      />
                    </div>
                  </div>

                  {newPublishingMode === 'internal-doitwithai-site' && (
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Internal DoItWithAI Builder Site Slug
                      </label>
                      <input
                        type="text"
                        value={newInternalSlug}
                        onChange={(e) => setNewInternalSlug(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleCreateCampaign}
                    className="w-full rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2.5 transition"
                  >
                    + Generate {newCampaignCount}-Article Autonomous Queue
                  </button>
                </div>
              </div>

              {/* Saved Campaigns in LocalStorage */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Saved Campaigns in LocalStorage ({studioState.campaigns.length})
                </h3>
                <div className="space-y-2">
                  {studioState.campaigns.map((camp) => {
                    const isSelected = camp.id === activeCampaign.id;
                    return (
                      <button
                        key={camp.id}
                        type="button"
                        onClick={() => {
                          updateState((prev) => ({
                            ...prev,
                            activeCampaignId: camp.id,
                          }));
                          if (camp.jobs[0]) setSelectedJobId(camp.jobs[0].id);
                        }}
                        className={`w-full text-left rounded-xl p-3 border transition ${
                          isSelected
                            ? 'border-sky-500/60 bg-sky-500/10'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{camp.name}</div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Status: {camp.status}</span>
                          <span>{camp.jobs.length} Articles</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Queue & Active Job Inspector */}
            <div className="lg:col-span-8 space-y-5">
              {/* Article Queue List */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-white">
                      {activeCampaign.name}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Site: {activeWebsite?.siteName} ({activeWebsite?.siteUrl}) · Confidence Gate:{' '}
                      {activeCampaign.confidenceThreshold}/100
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-sky-300 font-medium">
                    Cadence: {activeCampaign.cadence.replace(/-/g, ' ')}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeCampaign.jobs.map((job, idx) => {
                    const isSelected = selectedJob?.id === job.id;
                    const progressPct = Math.round(
                      (job.completedAgents.length / AUTONOMOUS_AGENT_ROLES.length) * 100
                    );
                    const isDone =
                      job.status === 'published' || job.status === 'ready-for-review';

                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        className={`cursor-pointer rounded-xl border p-3.5 transition ${
                          isSelected
                            ? 'border-sky-500 bg-sky-950/25'
                            : 'border-slate-800/90 bg-slate-950/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-sky-300">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="text-sm font-bold text-white">
                                {job.topicTitle}
                              </div>
                              <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3 mt-0.5">
                                <span>
                                  Keyword:{' '}
                                  <strong className="text-slate-200">
                                    {job.primaryKeyword}
                                  </strong>
                                </span>
                                <span>
                                  KD Proxy:{' '}
                                  <strong className="text-emerald-400">
                                    {job.kdProxyScore}/100
                                  </strong>
                                </span>
                                <span>
                                  Source:{' '}
                                  <strong className="text-sky-300">
                                    {job.trendSource}
                                  </strong>
                                </span>
                                <span>
                                  GEO Score:{' '}
                                  <strong className="text-amber-300">
                                    {job.geoReadiness.overallScore}/100
                                  </strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                isDone
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {job.status.toUpperCase()} ({progressPct}%)
                            </span>
                            {!isDone && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAdvanceStep(job.id, false);
                                  }}
                                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-medium text-sky-300 transition"
                                >
                                  Step +1 Agent
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAdvanceStep(job.id, true);
                                  }}
                                  className="rounded-lg bg-sky-500 hover:bg-sky-400 px-2.5 py-1 text-xs font-bold text-slate-950 transition"
                                >
                                  Complete All 12 Agents
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Job Deep Dive */}
              {selectedJob && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-sky-400 font-semibold">
                        Selected Job Output & GEO Audit
                      </span>
                      <h3 className="text-base font-bold text-white">
                        {selectedJob.topicTitle}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('arcads-pinterest-lab')}
                        className="rounded-lg bg-amber-400/15 border border-amber-400/40 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-400/25 transition"
                      >
                        Open 3 Pinterest Pins & Arcads Matrix →
                      </button>
                    </div>
                  </div>

                  {/* 50-Word AEO Direct Answer Block */}
                  <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-3.5 text-xs space-y-1">
                    <div className="font-bold text-sky-300 uppercase tracking-wider text-[11px]">
                      50-Word AEO / GEO Direct Answer Target
                    </div>
                    <p className="text-slate-200 leading-relaxed">
                      {selectedJob.aeoDirectAnswer50Words}
                    </p>
                  </div>

                  {/* Outline + GEO Report Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Standalone H2 Blueprint + Visual Archetypes
                      </div>
                      <div className="space-y-2">
                        {selectedJob.outlineSections.map((sec, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-slate-800/80 bg-slate-900/70 p-2.5 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">
                                H2 {i + 1}: {sec.h2}
                              </span>
                              <span className="rounded bg-sky-500/15 px-2 py-0.5 text-[10px] text-sky-300">
                                {sec.archetype}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-400">{sec.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          AI Search Citation Radar (0-Token Deterministic Critic)
                        </span>
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                          {selectedJob.geoReadiness.overallScore}/100
                        </span>
                      </div>

                      <ul className="space-y-1.5 text-xs text-slate-300">
                        <li className="flex items-center justify-between">
                          <span>50-Word Direct Answer Block</span>
                          <span className="text-emerald-400 font-semibold">
                            {selectedJob.geoReadiness.has50WordDirectAnswer ? 'PASS' : 'WARN'}
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Markdown Comparison Table Included</span>
                          <span className="text-emerald-400 font-semibold">
                            {selectedJob.geoReadiness.hasComparisonTable ? 'PASS' : 'WARN'}
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>FAQ JSON-LD Schema Readiness</span>
                          <span className="text-emerald-400 font-semibold">
                            {selectedJob.geoReadiness.hasFaqJsonLd ? 'PASS' : 'WARN'}
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>6-Layer Original Section Infographics</span>
                          <span className="text-emerald-400 font-semibold">
                            {selectedJob.geoReadiness.hasOriginalInfographics ? 'PASS' : 'WARN'}
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Internal Tool Contextual Callout</span>
                          <span className="text-sky-300 font-semibold">
                            {selectedJob.matchedInternalToolTitle || 'Auto-Matched'}
                          </span>
                        </li>
                      </ul>

                      {selectedJob.publishedUrl && (
                        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-200">
                          Published Target Route:{' '}
                          <code className="font-mono text-emerald-300">
                            {selectedJob.publishedUrl}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ARCADS 5-HOOK MATRIX & PINTEREST 2:3 PIN LAB */}
        {activeTab === 'arcads-pinterest-lab' && selectedJob && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Live 2:3 Vertical Pin SVG Preview & Pin Switcher */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold">
                      Agent #8 · Pinterest 2:3 Visual Engine
                    </span>
                    <h2 className="text-base font-bold text-white">
                      3 Fresh Vertical Pins (1000×1500)
                    </h2>
                  </div>
                  <div className="flex gap-1.5">
                    {selectedJob.pinterestPins.map((pin, idx) => (
                      <button
                        key={pin.id}
                        type="button"
                        onClick={() => setSelectedPinIndex(idx)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          selectedPinIndex === idx
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Pin #{pin.pinVariantIndex} (Day +{pin.scheduledDayOffset})
                      </button>
                    ))}
                  </div>
                </div>

                {selectedPin && (
                  <>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex items-center justify-center overflow-hidden">
                      <div
                        className="w-full max-w-[340px] rounded-lg overflow-hidden shadow-2xl border border-slate-800 [&_svg]:w-full [&_svg]:h-auto"
                        dangerouslySetInnerHTML={{ __html: pinSvgMarkup }}
                      />
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300">
                          Board: {selectedPin.boardName}
                        </span>
                        <span className="text-slate-400">
                          Layout: {selectedPin.prismLayout} · {selectedPin.paletteId}
                        </span>
                      </div>
                      <div className="font-semibold text-white">
                        Pin Title: {selectedPin.pinTitle}
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {selectedPin.pinDescription}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              `${selectedPin.pinTitle}\n\n${selectedPin.pinDescription}\n\nDestination: ${selectedPin.destinationUrl}`,
                              selectedPin.id
                            )
                          }
                          className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 font-medium text-sky-300 transition"
                        >
                          {copiedId === selectedPin.id
                            ? '✓ Copied Pin SEO Copy'
                            : 'Copy Pin Title + SEO Description'}
                        </button>
                        <button
                          type="button"
                          onClick={handleLockWinnerFormula}
                          className="rounded-lg bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 px-3 py-1.5 font-semibold text-purple-200 transition"
                        >
                          ★ Lock as Winner Formula
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Arcads 5-Hook Matrix */}
            <div className="lg:col-span-7 space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-sky-400 font-semibold">
                      Agent #7 · Arcads.ai Variation Methodology
                    </span>
                    <h3 className="text-base font-bold text-white">
                      5-Hook × Multi-Channel Creative Variation Matrix
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    1 Article → {selectedJob.arcadsVariations.length} Psychological Hook Angles
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedJob.arcadsVariations.map((variation) => (
                    <div
                      key={variation.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-sky-500/15 px-2.5 py-0.5 font-bold uppercase text-[10px] text-sky-300">
                          {variation.archetypeLabel} · {variation.channel.toUpperCase()} (
                          {variation.visualFormat})
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-semibold">
                            Predicted CTR: {variation.predictedCtrScore}/100
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                `${variation.hookLine}\n\n${variation.bodyCopy}\n\n${variation.ctaLine}`,
                                variation.id
                              )
                            }
                            className="rounded bg-slate-800 px-2.5 py-0.5 text-[11px] text-slate-200 hover:bg-slate-700"
                          >
                            {copiedId === variation.id ? '✓ Copied' : 'Copy Hook + Copy'}
                          </button>
                        </div>
                      </div>
                      <div className="font-bold text-white text-sm">
                        {variation.hookLine}
                      </div>
                      <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                        {variation.bodyCopy}
                      </p>
                      <div className="text-sky-300 font-medium">
                        CTA: {variation.ctaLine}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 12 AUTONOMOUS AGENT ROLES & CONTRACTS */}
        {activeTab === 'agent-roles' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-base font-bold text-white">
                12 Specialized Autonomous Agent Roles & Strict Contracts
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Defined in <code className="text-sky-300">lib/autonomous-agents/agent-roles.ts</code>.
                Deterministic pre-steps and 0-token SVG visual synthesis cut LLM token usage by{' '}
                {tokenBudget.tokenSavingsPercent}% so a 10-post batch runs comfortably inside free-tier limits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AUTONOMOUS_AGENT_ROLES.map((role) => (
                <div
                  key={role.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
                        {role.shortBadge}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400">
                        {role.estimatedTokensPerArticle === 0
                          ? '0 Tokens (Deterministic)'
                          : `~${role.estimatedTokensPerArticle} Tokens`}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{role.name}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {role.responsibility}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-semibold">Inputs: </span>
                      <span className="text-slate-300">{role.inputContract.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold">Outputs: </span>
                      <span className="text-slate-300">{role.outputContract.join(', ')}</span>
                    </div>
                    <ul className="space-y-1 text-slate-400 list-disc pl-4">
                      {role.qualityGateRules.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INTERNAL vs EXTERNAL CONNECTORS & FREE-TIER BYOK */}
        {activeTab === 'connectors-byok' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dual Destination Publishing Connectors */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
              <h2 className="text-base font-bold text-white">
                Dual-Destination Publishing & Social Connectors
              </h2>
              <p className="text-xs text-slate-400">
                Supports both Internal DoItWithAI Website Builder sites (
                <code className="text-sky-300">/p/[slug]/blog</code>) and External user websites (WordPress REST API Application Passwords, Custom Webhooks, Buffer MCP, Postiz, and Pinterest API v5).
              </p>

              <div className="space-y-2.5 text-xs">
                {studioState.socialConnections.map((conn) => (
                  <div
                    key={conn.channel}
                    className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white">{conn.label}</div>
                      <div className="text-[11px] text-slate-400">
                        Handle: {conn.accountHandle} · Target: {conn.defaultBoardOrTarget}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        conn.enabled
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {conn.connectorMode}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Free-Tier BYOK Configuration */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
              <h2 className="text-base font-bold text-white">
                $0 Free-Tier BYOK Engine & RPM Pacing Calculator
              </h2>
              <p className="text-xs text-slate-400">
                Uses user-supplied free-tier keys (Google AI Studio Gemini 2.5 Flash or Groq Llama 3.3 70B) stored strictly in browser localStorage with automatic RPM pacing.
              </p>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Gemini Free-Tier Key (Local Only)
                    </label>
                    <input
                      type="password"
                      placeholder="AIzaSy... (Saved in localStorage)"
                      value={studioState.byokConfig.geminiFreeKeyMasked}
                      onChange={(e) =>
                        updateState((prev) => ({
                          ...prev,
                          byokConfig: {
                            ...prev.byokConfig,
                            geminiFreeKeyMasked: e.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      RPM Cooldown Pacing (Seconds)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={120}
                      value={studioState.byokConfig.rpmCooldownSeconds}
                      onChange={(e) =>
                        updateState((prev) => ({
                          ...prev,
                          byokConfig: {
                            ...prev.byokConfig,
                            rpmCooldownSeconds: Number(e.target.value) || 45,
                          },
                        }))
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1.5">
                  <div className="font-bold text-emerald-300">
                    Token Efficiency Breakdown ({activeCampaign.targetArticleCount} Articles)
                  </div>
                  <div className="text-slate-300">
                    • Per Article (Outline + Sections + Social Pack):{' '}
                    <strong>{tokenBudget.tokensPerArticle.toLocaleString()} tokens</strong>
                  </div>
                  <div className="text-slate-300">
                    • 6-Layer SVG Blog Visuals + 3 Pinterest 2:3 Pins:{' '}
                    <strong>0 LLM tokens (Programmatic SVG Engine)</strong>
                  </div>
                  <div className="text-slate-300">
                    • Total Campaign Duration with {studioState.byokConfig.rpmCooldownSeconds}s RPM Pacing:{' '}
                    <strong>~{tokenBudget.estimatedMinutesWithCooldown} minutes</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: 6-PHASE AI EXPERT EXECUTION TRACKER */}
        {activeTab === 'phase-roadmap' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">
                  6-Phase Master Implementation Roadmap & AI Expert Handoff Prompts
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Each phase has explicit file targets, acceptance tests, and a ready-to-copy prompt so any AI engineer can execute the next phase without losing context.
                </p>
              </div>
              <Link
                href="/founder-hub/autonomous-agents"
                className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-sky-400 transition"
              >
                Read Full Blueprint in Founder Hub →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SIX_IMPLEMENTATION_PHASES.map((phase) => (
                <div
                  key={phase.phaseNumber}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                      Phase {phase.phaseNumber}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        phase.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {phase.status === 'completed'
                        ? '✓ COMPLETED IN REPO'
                        : 'READY FOR NEXT PASS'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{phase.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{phase.summary}</p>

                  <div className="text-[11px] space-y-1">
                    <div className="font-semibold text-slate-400">Deliverables:</div>
                    <ul className="list-disc pl-4 text-slate-300 space-y-0.5">
                      {phase.deliverables.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <span className="text-[11px] text-slate-400">
                      Test: <code className="text-slate-300">{phase.verificationCommand}</code>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(phase.handoffPromptForNextAi, `phase-${phase.phaseNumber}`)
                      }
                      className="rounded-lg bg-sky-500/15 border border-sky-500/40 px-3 py-1 text-xs font-semibold text-sky-300 hover:bg-sky-500/25 transition"
                    >
                      {copiedId === `phase-${phase.phaseNumber}`
                        ? '✓ Copied AI Prompt'
                        : 'Copy Prompt for AI Expert'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

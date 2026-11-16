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
import {
  deduplicateAndRankLowKdTopics,
  type WebsiteScoutReport,
} from '@/lib/autonomous-agents/sitemap-trend-scout';
import { renderPinterestPinPreviewSvg } from '@/lib/autonomous-agents/pin-svg-preview';
import {
  compileJobArticleMarkdown,
  renderSectionInfographicSvg,
  runByokJobWithCheckpoints,
} from '@/lib/autonomous-agents/byok-batch-runner';
import {
  buildCompleteJobExportBundle,
  buildLinkedinCarouselHtmlDeck,
  buildPinterestBulkCsvSchedule,
} from '@/lib/autonomous-agents/pinterest-carousel-exporter';
import { publishJobToInternalWebsiteStore } from '@/lib/autonomous-agents/publishers/internal-site-publisher';
import { dispatchExternalCmsAndSocialPublish } from '@/lib/autonomous-agents/publishers/external-cms-publisher';
import {
  evaluateCampaignWinnerCandidates,
  exportStudioStateForCloudSync,
  importStudioStateFromCloudSync,
  runWinnerCloneAutoOptimizer,
} from '@/lib/autonomous-agents/winner-clone-loop';
import type {
  AutomatedArticleJob,
  AutonomousCampaign,
  AutonomousStudioStoreState,
  ConnectedWebsiteProfile,
  PinterestPinCandidate,
  SocialChannelConnection,
  WebsitePublishingMode,
} from '@/lib/autonomous-agents/types';

type StudioTab =
  | 'campaign-autopilot'
  | 'arcads-pinterest-lab'
  | 'agent-roles'
  | 'connectors-byok'
  | 'phase-roadmap';

import {
  SIX_IMPLEMENTATION_PHASES,
} from '@/lib/autonomous-agents/phases-roadmap';

export default function AutonomousCampaignDashboard() {
  const [studioState, setStudioState] = useState<AutonomousStudioStoreState | null>(null);
  const [activeTab, setActiveTab] = useState<StudioTab>('campaign-autopilot');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedPinIndex, setSelectedPinIndex] = useState<number>(0);

  // Campaign creation & Phase 2 Live Scout state
  const [newCampaignName, setNewCampaignName] = useState<string>(
    'Q1 2027 Programmatic SEO & Pinterest Growth Batch'
  );
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
  const [existingSiteSlugsInput, setExistingSiteSlugsInput] = useState<string>(
    'how-to-optimize-blog-sections-for-ai-search-citations'
  );
  const [newCampaignCount, setNewCampaignCount] = useState<number>(5);
  const [isScoutingLive, setIsScoutingLive] = useState<boolean>(false);
  const [isRunningByokJob, setIsRunningByokJob] = useState<boolean>(false);
  const [isPublishingJob, setIsPublishingJob] = useState<boolean>(false);
  const [selectedSectionIdx, setSelectedSectionIdx] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [cloudSyncInput, setCloudSyncInput] = useState<string>('');
  const [latestScoutReport, setLatestScoutReport] = useState<WebsiteScoutReport | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadAutonomousStudioState();
    setStudioState(loaded);
    const firstCampaign =
      loaded.campaigns.find((c) => c.id === loaded.activeCampaignId) || loaded.campaigns[0];
    if (firstCampaign?.jobs[0]) {
      setSelectedJobId(firstCampaign.jobs[0].id);
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

  const downloadTextFile = (filename: string, content: string, mimeType: string) => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const selectedSectionSvg = useMemo(() => {
    if (!selectedJob) return '';
    if (selectedJob.sectionInfographicSvgs?.[selectedSectionIdx]) {
      return selectedJob.sectionInfographicSvgs[selectedSectionIdx];
    }
    const sec =
      selectedJob.outlineSections[selectedSectionIdx] || selectedJob.outlineSections[0];
    if (!sec) return '';
    return renderSectionInfographicSvg(sec, {
      sectionIndex: selectedSectionIdx,
      totalSections: selectedJob.outlineSections.length,
      brandName: activeWebsite?.siteName || 'DoItWithAI.tools',
      brandPrimaryHex: activeWebsite?.brandPrimaryHex || '#38BDF8',
      brandSecondaryHex: activeWebsite?.brandSecondaryHex || '#10B981',
    });
  }, [selectedJob, selectedSectionIdx, activeWebsite]);

  const winnerEvaluations = useMemo(() => {
    if (!activeCampaign) return [];
    return evaluateCampaignWinnerCandidates(activeCampaign);
  }, [activeCampaign]);

  const handleRunByokJob = async (jobId: string) => {
    if (!studioState || !activeCampaign) return;
    setIsRunningByokJob(true);
    setStatusMessage('Phase 3 BYOK + 6-Layer Visual Runner executing section checkpoints...');
    try {
      const res = await runByokJobWithCheckpoints({
        state: studioState,
        campaignId: activeCampaign.id,
        jobId,
        skipCooldownInTests: true,
        onCheckpoint: (nextState) => {
          setStudioState(nextState);
        },
      });
      setStudioState(res.state);
      setStatusMessage(
        `Phase 3 Complete (${res.providerUsed}): Compiled Markdown + ${res.sectionInfographicSvgs.length}× 1080×1350 Section Infographics.`
      );
    } finally {
      setIsRunningByokJob(false);
    }
  };

  const handlePublishSelectedJob = async () => {
    if (!studioState || !activeCampaign || !selectedJob || !activeWebsite) return;
    setIsPublishingJob(true);
    setStatusMessage('Dispatching Phase 5 Dual-Destination Publisher...');
    const nowIso = new Date().toISOString();

    try {
      let targetUrl = selectedJob.publishedUrl || '';
      let effectiveStatus: 'published' | 'draft' | 'staged' = 'staged';
      let socialCount = 0;
      let summaryMsg = '';

      if (activeWebsite.publishingMode === 'internal-doitwithai-site') {
        const res = publishJobToInternalWebsiteStore({
          job: selectedJob,
          website: activeWebsite,
        });
        targetUrl = res.targetUrl;
        effectiveStatus = 'published';
        socialCount = selectedJob.arcadsVariations.length;
        summaryMsg = `Published live to internal Website Builder store at ${res.targetUrl} with ${res.embeddedInfographicsCount} embedded 6-layer SVG infographics.`;
      } else {
        let externalResult: Awaited<
          ReturnType<typeof dispatchExternalCmsAndSocialPublish>
        > | null = null;
        try {
          const apiRes = await fetch('/api/autonomous-agents/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              job: selectedJob,
              website: activeWebsite,
              approvalMode: activeCampaign.approvalMode,
              confidenceThreshold: activeCampaign.confidenceThreshold,
              socialConnections: studioState.socialConnections,
            }),
          });
          if (apiRes.ok) {
            const parsed = (await apiRes.json()) as {
              ok: boolean;
              result?: Awaited<ReturnType<typeof dispatchExternalCmsAndSocialPublish>>;
            };
            if (parsed.ok && parsed.result) externalResult = parsed.result;
          }
        } catch {
          // Offline fallback handled below
        }
        if (!externalResult) {
          externalResult = await dispatchExternalCmsAndSocialPublish({
            job: selectedJob,
            website: activeWebsite,
            approvalMode: activeCampaign.approvalMode,
            confidenceThreshold: activeCampaign.confidenceThreshold,
            socialConnections: studioState.socialConnections,
          });
        }
        targetUrl = externalResult.targetUrl;
        effectiveStatus = externalResult.effectiveStatus;
        socialCount = externalResult.socialDispatched.length;
        summaryMsg = externalResult.message;
      }

      updateState((prev): AutonomousStudioStoreState => {
        const campaigns: AutonomousCampaign[] = prev.campaigns.map(
          (camp): AutonomousCampaign => {
            if (camp.id !== activeCampaign.id) return camp;
            const jobs: AutomatedArticleJob[] = camp.jobs.map(
              (job): AutomatedArticleJob => {
                if (job.id !== selectedJob.id) return job;
                const nextStatus: AutomatedArticleJob['status'] =
                  effectiveStatus === 'published' ? 'published' : 'ready-for-review';
                const nextPins: PinterestPinCandidate[] = job.pinterestPins.map(
                  (pin): PinterestPinCandidate => ({
                    ...pin,
                    status:
                      effectiveStatus === 'published'
                        ? 'scheduled-buffer'
                        : pin.status,
                  })
                );
                return {
                  ...job,
                  status: nextStatus,
                  publishedUrl: targetUrl,
                  pinterestPins: nextPins,
                  lastPublishReport: {
                    destination: activeWebsite.publishingMode,
                    status: effectiveStatus,
                    targetUrl,
                    socialDispatchedCount: socialCount,
                    publishedAtIso: nowIso,
                  },
                  updatedAtIso: nowIso,
                };
              }
            );
            return { ...camp, jobs, updatedAtIso: nowIso };
          }
        );
        return { ...prev, campaigns, lastSavedAtIso: nowIso };
      });
      setStatusMessage(summaryMsg);
    } finally {
      setIsPublishingJob(false);
    }
  };

  const handleDownloadCompleteBundle = () => {
    if (!selectedJob || !activeWebsite) return;
    const bundle = buildCompleteJobExportBundle(selectedJob, activeWebsite);
    downloadTextFile(
      `${selectedJob.urlSlug}-autonomous-asset-pack.json`,
      JSON.stringify(bundle, null, 2),
      'application/json'
    );
    setStatusMessage(
      `Exported complete Phase 4 bundle (${bundle.sectionInfographicSvgs.length} section SVGs, ${bundle.pinterestPins.length} Pinterest 2:3 SVGs, 8-slide LinkedIn deck, JSON-LD @graph, Markdown & CSV).`
    );
  };

  const handleDownloadPinterestCsv = () => {
    if (!selectedJob || !activeWebsite) return;
    const csv = buildPinterestBulkCsvSchedule(selectedJob, activeWebsite);
    downloadTextFile(
      `${selectedJob.urlSlug}-pinterest-day0-day8-schedule.csv`,
      csv,
      'text/csv;charset=utf-8'
    );
    setStatusMessage('Downloaded Day 0 / Day +4 / Day +8 Pinterest & Buffer bulk CSV.');
  };

  const handleDownloadLinkedinCarousel = () => {
    if (!selectedJob || !activeWebsite) return;
    const html = buildLinkedinCarouselHtmlDeck(selectedJob, activeWebsite);
    downloadTextFile(
      `${selectedJob.urlSlug}-linkedin-8-slide-carousel.html`,
      html,
      'text/html;charset=utf-8'
    );
    setStatusMessage('Downloaded 8-slide 1080×1350 print-to-PDF LinkedIn Carousel Deck.');
  };

  const handleRunWinnerCloneOptimizer = () => {
    if (!studioState || !activeCampaign) return;
    const res = runWinnerCloneAutoOptimizer(studioState, activeCampaign.id);
    updateState(() => res.nextState);
    setStatusMessage(
      res.promotedWinners.length > 0
        ? `Phase 6 Winner-Clone promoted ${res.promotedWinners.length} high-performing Pin/Hook formula(s) & cloned visual DNA to upcoming queued jobs.`
        : `Phase 6 audited ${res.evaluations.length} Pinterest Pins against campaign median Save Rate and preserved top Winner Formulas.`
    );
  };

  const handleExportCloudSync = () => {
    if (!studioState) return;
    const envelope = exportStudioStateForCloudSync(studioState);
    const json = JSON.stringify(envelope, null, 2);
    setCloudSyncInput(json);
    handleCopy(json, 'cloud-sync');
    setStatusMessage(`Exported checksummed Cloud Sync JSON (${envelope.workspaceChecksum}).`);
  };

  const handleImportCloudSync = () => {
    if (!cloudSyncInput.trim()) return;
    try {
      const restored = importStudioStateFromCloudSync(cloudSyncInput);
      setStudioState(restored);
      setStatusMessage('Restored Autonomous Studio state cleanly from Cloud Sync JSON.');
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : 'Invalid Cloud Sync JSON payload.'
      );
    }
  };

  const handleScoutAndCreateCampaign = async () => {
    if (!studioState) return;
    setIsScoutingLive(true);
    const nowIso = new Date().toISOString();
    const existingSlugsList = existingSiteSlugsInput
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const response = await fetch('/api/autonomous-agents/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl: newSiteUrl,
          primaryNiche: newSiteNiche,
          seedTopicsOrPrompt: seedPrompts,
          targetArticleCount: newCampaignCount,
          publishingMode: newPublishingMode,
          internalBuilderSlug:
            newPublishingMode === 'internal-doitwithai-site' ? newInternalSlug : undefined,
          existingSlugs: existingSlugsList,
          winnerFormulas: studioState.winnerFormulas,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          ok: boolean;
          scoutReport: WebsiteScoutReport;
          websiteProfile: ConnectedWebsiteProfile;
          jobs: AutomatedArticleJob[];
        };
        if (data.ok && data.websiteProfile && Array.isArray(data.jobs)) {
          setLatestScoutReport(data.scoutReport);
          const newCampaign: AutonomousCampaign = {
            id: `campaign-${Date.now()}`,
            name: newCampaignName,
            createdAtIso: nowIso,
            updatedAtIso: nowIso,
            websiteId: data.websiteProfile.id,
            seedTopicsOrPrompt: seedPrompts,
            targetArticleCount: newCampaignCount,
            cadence: 'weekly-2-articles',
            approvalMode: 'confidence-gated-90',
            confidenceThreshold: 90,
            status: 'running',
            jobs: data.jobs,
          };

          updateState((prev) => ({
            ...prev,
            activeCampaignId: newCampaign.id,
            websites: [
              data.websiteProfile,
              ...prev.websites.filter((w) => w.id !== data.websiteProfile.id),
            ],
            campaigns: [newCampaign, ...prev.campaigns],
          }));
          if (data.jobs[0]) setSelectedJobId(data.jobs[0].id);
          setIsScoutingLive(false);
          return;
        }
      }
    } catch {
      // Fall back to deterministic client-side Phase 2 anti-cannibalization engine
    }

    const fallbackWebsite: ConnectedWebsiteProfile = {
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

    const { jobs, cannibalizedCandidates } = deduplicateAndRankLowKdTopics({
      website: fallbackWebsite,
      seedTopicsOrPrompt: seedPrompts,
      targetCount: newCampaignCount,
      existingBlogSlugs: existingSlugsList,
      trendSignals: [
        {
          title: `${newSiteNiche.split(',')[0]} Workflow Automation 2027`,
          approxTraffic: '25K+ Rising',
          source: 'google-trends-rss',
        },
      ],
      winnerFormulas: studioState.winnerFormulas,
    });

    setLatestScoutReport({
      scoutedAtIso: nowIso,
      targetSiteUrl: newSiteUrl,
      liveFetchSucceeded: false,
      sitemapUrlsFound: existingSlugsList.length,
      existingBlogSlugsCount: existingSlugsList.length,
      installedToolsCount: fallbackWebsite.installedTools.length,
      cannibalizationBlockedCount: cannibalizedCandidates.length,
      cannibalizedCandidates,
      extractedBrand: {
        siteName: fallbackWebsite.siteName,
        brandPrimaryHex: fallbackWebsite.brandPrimaryHex,
        brandSecondaryHex: fallbackWebsite.brandSecondaryHex,
        darkThemePreferred: true,
      },
      trendSignals: [
        {
          title: `${newSiteNiche.split(',')[0]} Workflow Automation 2027`,
          approxTraffic: '25K+ Rising',
          source: 'google-trends-rss',
        },
      ],
      sampleIndexedUrls: [],
    });

    const newCampaign: AutonomousCampaign = {
      id: `campaign-${Date.now()}`,
      name: newCampaignName,
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
      websiteId: fallbackWebsite.id,
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
      websites: [fallbackWebsite, ...prev.websites],
      campaigns: [newCampaign, ...prev.campaigns],
    }));

    if (jobs[0]) setSelectedJobId(jobs[0].id);
    setIsScoutingLive(false);
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
    setLatestScoutReport(null);
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
            Zero sign-in required · Initializing 12-Agent Registry & Phase 2 Scout Engine...
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
              All 6 Phases Live · Zero-Auth LocalStorage + BYOK + Dual Publisher + Winner-Clone OS
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
              label: '1. Sitemap Scout & Campaign Autopilot (1–15 Posts)',
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
              label: '4. Connectors, BYOK & Winner-Clone Loop',
              badge: '$0 Free + Cloud Sync',
            },
            {
              id: 'phase-roadmap',
              label: '5. 6-Phase AI Expert Execution Tracker',
              badge: 'All 6 Phases Complete',
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
        {statusMessage && (
          <div className="rounded-xl border border-sky-500/40 bg-sky-950/30 px-4 py-3 text-xs text-sky-200 flex items-center justify-between gap-3">
            <span>{statusMessage}</span>
            <button
              type="button"
              onClick={() => setStatusMessage('')}
              className="text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>
        )}
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

        {/* TAB 1: CAMPAIGN AUTOPILOT + PHASE 2 SITEMAP & TRENDS SCOUT */}
        {activeTab === 'campaign-autopilot' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Campaign Creator & Phase 2 Live Scout */}
            <div className="lg:col-span-4 space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-sky-400">
                    Scout Sitemap & Launch Batch
                  </h2>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    Phase 2 Live Engine
                  </span>
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
                      Website or Sitemap URL (`/sitemap.xml` Auto-Crawled)
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

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Existing Published Slugs (Anti-Cannibalization Guard)
                    </label>
                    <input
                      type="text"
                      value={existingSiteSlugsInput}
                      onChange={(e) => setExistingSiteSlugsInput(e.target.value)}
                      placeholder="already-published-slug-1, slug-2"
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
                    disabled={isScoutingLive}
                    onClick={handleScoutAndCreateCampaign}
                    className="w-full rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-slate-950 font-bold py-2.5 transition"
                  >
                    {isScoutingLive
                      ? 'Scouting Sitemap & Google Trends RSS...'
                      : `+ Scout Sitemap & Generate ${newCampaignCount}-Post Queue`}
                  </button>
                </div>
              </div>

              {/* Phase 2 Live Sitemap & Trend Scout Telemetry Card */}
              {latestScoutReport && (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/15 p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-emerald-300">
                      Phase 2 Sitemap & Trend Scout Report
                    </span>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-200 font-semibold">
                      {latestScoutReport.liveFetchSucceeded ? 'Live Crawl' : 'Local Fallback'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div>
                      Sitemap URLs:{' '}
                      <strong className="text-white">{latestScoutReport.sitemapUrlsFound}</strong>
                    </div>
                    <div>
                      Tools Indexed:{' '}
                      <strong className="text-white">
                        {latestScoutReport.installedToolsCount}
                      </strong>
                    </div>
                    <div>
                      Cannibalized Blocked:{' '}
                      <strong className="text-amber-300">
                        {latestScoutReport.cannibalizationBlockedCount}
                      </strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>Brand:</span>
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-white/30"
                        style={{
                          backgroundColor: latestScoutReport.extractedBrand.brandPrimaryHex,
                        }}
                      />
                      <code className="text-[10px]">
                        {latestScoutReport.extractedBrand.brandPrimaryHex}
                      </code>
                    </div>
                  </div>
                  {latestScoutReport.trendSignals.length > 0 && (
                    <div className="pt-1 border-t border-emerald-500/20 space-y-1">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        Matched Rising Trend Signals:
                      </div>
                      {latestScoutReport.trendSignals.slice(0, 3).map((sig, i) => (
                        <div key={i} className="text-[11px] text-slate-300 truncate">
                          • {sig.title} ({sig.approxTraffic})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={isRunningByokJob}
                        onClick={() => handleRunByokJob(selectedJob.id)}
                        className="rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-60 px-3 py-1.5 text-xs font-bold text-slate-950 transition"
                      >
                        {isRunningByokJob
                          ? 'Running Phase 3 Checkpoints...'
                          : '▶ Run Phase 3 BYOK + 6-Layer Visuals'}
                      </button>
                      <button
                        type="button"
                        disabled={isPublishingJob}
                        onClick={handlePublishSelectedJob}
                        className="rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 px-3 py-1.5 text-xs font-bold text-slate-950 transition"
                      >
                        {isPublishingJob
                          ? 'Publishing...'
                          : 'Publish / Stage Pack (Phase 5)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('arcads-pinterest-lab')}
                        className="rounded-lg bg-amber-400/15 border border-amber-400/40 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-400/25 transition"
                      >
                        Open 3 Pins & Arcads Matrix →
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
                      {selectedJob.lastPublishReport && (
                        <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-2.5 text-xs text-sky-200 space-y-1">
                          <div>
                            Last Dispatch: <strong>{selectedJob.lastPublishReport.destination}</strong> (
                            {selectedJob.lastPublishReport.status.toUpperCase()}) ·{' '}
                            {selectedJob.lastPublishReport.socialDispatchedCount} social payloads
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Phase 3 Live 1080x1350 Section Infographic SVG & Compiled Markdown Preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2 border-t border-slate-800/80">
                    <div className="lg:col-span-5 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                          6-Layer Section Infographic (1080×1350 SVG)
                        </span>
                        <div className="flex gap-1">
                          {selectedJob.outlineSections.map((s, idx) => (
                            <button
                              key={s.h2 + idx}
                              type="button"
                              onClick={() => setSelectedSectionIdx(idx)}
                              className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                                selectedSectionIdx === idx
                                  ? 'bg-sky-500 text-slate-950'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              S{idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-2 flex items-center justify-center overflow-hidden">
                        <div
                          className="w-full max-w-[300px] rounded-lg overflow-hidden [&_svg]:w-full [&_svg]:h-auto"
                          dangerouslySetInnerHTML={{ __html: selectedSectionSvg }}
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-7 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                          Compiled SEO / GEO Markdown Article
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              selectedJob.compiledArticleMarkdown ||
                                compileJobArticleMarkdown(selectedJob, activeWebsite!),
                              `md-${selectedJob.id}`
                            )
                          }
                          className="rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] text-sky-300 font-semibold"
                        >
                          {copiedId === `md-${selectedJob.id}`
                            ? '✓ Copied Markdown'
                            : 'Copy Complete Article MD'}
                        </button>
                      </div>
                      <pre className="h-[340px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-[11px] leading-relaxed text-slate-300 font-mono">
                        {selectedJob.compiledArticleMarkdown ||
                          (activeWebsite
                            ? compileJobArticleMarkdown(selectedJob, activeWebsite)
                            : '')}
                      </pre>
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
                  <div className="text-xs text-slate-400">
                    1 Article → {selectedJob.arcadsVariations.length} Psychological Hook Angles
                  </div>
                </div>

                {/* Phase 4 Batch Asset Exporter Bar */}
                <div className="rounded-xl border border-amber-400/30 bg-amber-950/15 p-3.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <div>
                    <div className="font-bold text-amber-300">
                      Phase 4 Multi-Channel Batch Exporter (0 Tokens)
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Package Markdown + JSON-LD + 4 Section SVGs + 3 Pinterest 2:3 Pins + 8-Slide LinkedIn Deck + CSV.
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadCompleteBundle}
                      className="rounded-lg bg-amber-400 hover:bg-amber-300 px-3 py-1.5 font-bold text-slate-950 transition"
                    >
                      ⬇ Download Complete Asset Pack (MD + 3 Pins + LinkedIn + CSV)
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPinterestCsv}
                      className="rounded-lg border border-slate-700 bg-slate-900 hover:border-sky-500/50 px-3 py-1.5 font-semibold text-sky-300 transition"
                    >
                      Pinterest/Buffer CSV
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadLinkedinCarousel}
                      className="rounded-lg border border-slate-700 bg-slate-900 hover:border-emerald-500/50 px-3 py-1.5 font-semibold text-emerald-300 transition"
                    >
                      8-Slide LinkedIn Deck (HTML/PDF)
                    </button>
                  </div>
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

        {/* TAB 4: INTERNAL vs EXTERNAL CONNECTORS, FREE-TIER BYOK & PHASE 6 WINNER-CLONE LOOP */}
        {activeTab === 'connectors-byok' && (
          <div className="space-y-6">
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
                      className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-white">{conn.label}</div>
                        <div className="text-[11px] text-slate-400">
                          Handle: {conn.accountHandle} · Target: {conn.defaultBoardOrTarget}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateState((prev) => ({
                            ...prev,
                            socialConnections: prev.socialConnections.map(
                              (item): SocialChannelConnection =>
                                item.channel === conn.channel
                                  ? { ...item, enabled: !item.enabled }
                                  : item
                            ),
                          }))
                        }
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition ${
                          conn.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {conn.enabled ? `${conn.connectorMode} · ON` : 'OFF'}
                      </button>
                    </div>
                  ))}
                </div>

                {activeWebsite && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-2.5 text-xs">
                    <div className="font-bold text-sky-300 uppercase tracking-wider text-[11px]">
                      External WordPress / Webhook Destination ({activeWebsite.siteName})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        placeholder="WP Site URL (https://example.com)"
                        value={activeWebsite.wordpressConfig?.endpointUrl || ''}
                        onChange={(e) =>
                          updateState((prev) => ({
                            ...prev,
                            websites: prev.websites.map(
                              (w): ConnectedWebsiteProfile =>
                                w.id === activeWebsite.id
                                  ? {
                                      ...w,
                                      wordpressConfig: {
                                        endpointUrl: e.target.value,
                                        username: w.wordpressConfig?.username || '',
                                        appPasswordMasked:
                                          w.wordpressConfig?.appPasswordMasked || '',
                                        defaultStatus:
                                          w.wordpressConfig?.defaultStatus || 'draft',
                                      },
                                    }
                                  : w
                            ),
                          }))
                        }
                        className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-slate-100"
                      />
                      <input
                        type="text"
                        placeholder="Custom Webhook URL (Optional)"
                        value={activeWebsite.webhookUrl || ''}
                        onChange={(e) =>
                          updateState((prev) => ({
                            ...prev,
                            websites: prev.websites.map(
                              (w): ConnectedWebsiteProfile =>
                                w.id === activeWebsite.id
                                  ? { ...w, webhookUrl: e.target.value }
                                  : w
                            ),
                          }))
                        }
                        className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-slate-100"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Free-Tier BYOK Configuration */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
                <h2 className="text-base font-bold text-white">
                  $0 Free-Tier BYOK Engine (Gemini + Groq) & RPM Pacing
                </h2>
                <p className="text-xs text-slate-400">
                  Uses user-supplied free-tier keys (Google AI Studio Gemini 2.5 Flash or Groq Llama 3.3 70B) stored strictly in browser localStorage with automatic 429 fallback & RPM pacing.
                </p>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Gemini Free-Tier Key
                      </label>
                      <input
                        type="password"
                        placeholder="AIzaSy... (Local Only)"
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
                        Groq Llama 3.3 Key
                      </label>
                      <input
                        type="password"
                        placeholder="gsk_... (Fallback Key)"
                        value={studioState.byokConfig.groqFreeKeyMasked}
                        onChange={(e) =>
                          updateState((prev) => ({
                            ...prev,
                            byokConfig: {
                              ...prev.byokConfig,
                              groqFreeKeyMasked: e.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        RPM Cooldown (Sec)
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

            {/* Phase 6: Closed-Loop Winner-Clone Optimizer & Optional Cloud Sync */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 rounded-2xl border border-purple-500/30 bg-slate-900/70 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-purple-300 font-semibold">
                      Phase 6 · Closed-Loop Analytics Agent
                    </span>
                    <h3 className="text-base font-bold text-white">
                      Winner-Clone Auto-Optimizer (&gt;= 20% Above Median Promoter)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleRunWinnerCloneOptimizer}
                    className="rounded-lg bg-purple-500 hover:bg-purple-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition"
                  >
                    ★ Run Winner-Clone Optimizer
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2 pr-3">Pin Variant</th>
                        <th className="py-2 pr-3">Save Rate</th>
                        <th className="py-2 pr-3">CTR</th>
                        <th className="py-2 pr-3">vs Median</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {winnerEvaluations.slice(0, 6).map((ev) => (
                        <tr key={ev.pinId} className="text-slate-300">
                          <td className="py-2 pr-3 font-medium text-white max-w-[240px] truncate">
                            {ev.pinTitle}
                          </td>
                          <td className="py-2 pr-3 text-emerald-300 font-semibold">
                            {ev.saveRatePercent}%
                          </td>
                          <td className="py-2 pr-3">{ev.outboundCtrPercent}%</td>
                          <td className="py-2 pr-3 font-mono">{ev.outperformanceRatio}x</td>
                          <td className="py-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                ev.qualifiesAsWinner
                                  ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {ev.qualifiesAsWinner ? 'WINNER PROMOTED' : 'BASELINE'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3.5 text-xs">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-sky-400 font-semibold">
                    Optional Cloud Sync Bridge
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Export / Restore Autonomous Workspace JSON
                  </h3>
                  <p className="text-slate-400 mt-1">
                    Sync <code className="text-slate-300">doitwithai_autonomous_studio_v1</code> with Supabase or migrate workspaces across browsers with checksum verification.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleExportCloudSync}
                    className="rounded-lg bg-sky-500 hover:bg-sky-400 px-3 py-1.5 font-bold text-slate-950 transition"
                  >
                    {copiedId === 'cloud-sync'
                      ? '✓ Copied Cloud Sync Envelope'
                      : 'Export & Copy Sync JSON'}
                  </button>
                  <button
                    type="button"
                    onClick={handleImportCloudSync}
                    className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 font-semibold text-white transition"
                  >
                    Restore from JSON
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={cloudSyncInput}
                  onChange={(e) => setCloudSyncInput(e.target.value)}
                  placeholder="Paste Cloud Sync JSON envelope here to restore campaigns, websites, BYOK settings & winner formulas..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-[11px] text-slate-300"
                />
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

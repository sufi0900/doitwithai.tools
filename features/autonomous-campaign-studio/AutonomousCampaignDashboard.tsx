'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AUTONOMOUS_AGENT_ROLES,
  calculateCampaignTokenBudget,
} from '@/lib/autonomous-agents/agent-roles';
import {
  loadAutonomousStudioState,
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
import { SIX_IMPLEMENTATION_PHASES } from '@/lib/autonomous-agents/phases-roadmap';
import type {
  AutomatedArticleJob,
  AutonomousCampaign,
  AutonomousStudioStoreState,
  ConnectedWebsiteProfile,
  PinterestPinCandidate,
  SocialChannelConnection,
  WebsitePublishingMode,
} from '@/lib/autonomous-agents/types';

export { SIX_IMPLEMENTATION_PHASES };

type GuidedStepId = 1 | 2 | 3 | 4;

type ResultPreviewTab = 'article' | 'infographics' | 'pinterest' | 'social-copy';

const GUIDED_STEPS: Array<{
  step: GuidedStepId;
  shortLabel: string;
  title: string;
  subtitle: string;
}> = [
  {
    step: 1,
    shortLabel: 'Step 1 · Website URL',
    title: 'Connect Your Website',
    subtitle: 'Paste your URL or pick your DoItWithAI site',
  },
  {
    step: 2,
    shortLabel: 'Step 2 · Topic Ideas',
    title: 'Select Keyword Topics',
    subtitle: 'Pick discovered low-KD topics or add your own',
  },
  {
    step: 3,
    shortLabel: 'Step 3 · Live AI Run',
    title: 'Autonomous Production',
    subtitle: 'Watch AI write articles, infographics & pins',
  },
  {
    step: 4,
    shortLabel: 'Step 4 · Publish & Download',
    title: 'Ready-Made Pack & Auto-Publish',
    subtitle: 'Auto-published blog/social + 1-click downloads',
  },
];

const SCAN_ANIMATION_STAGES = [
  'Connecting to website & reading sitemap.xml...',
  'Extracting Brand DNA (colors, niche & internal tools)...',
  'Scanning Google Trends RSS & Search Autocomplete...',
  'Filtering duplicate URLs & ranking Low-KD topics...',
];

const PRODUCTION_STATIONS = [
  {
    id: 'briefing',
    label: '1. Research & 50-Word Answer Lead',
    detail: 'Structuring AEO direct answer, entity table & H2 outline',
  },
  {
    id: 'drafting',
    label: '2. Full SEO / GEO Article Drafting',
    detail: 'Writing zero-fluff technical sections & internal tool callouts',
  },
  {
    id: 'visuals',
    label: '3. 6-Layer Section Infographics (1080×1350)',
    detail: 'Rendering 4 standalone SVG section graphics at 0 AI image tokens',
  },
  {
    id: 'social',
    label: '4. Pinterest 2:3 Pins & 8-Slide LinkedIn Carousel',
    detail: 'Building 3 vertical pins, 8-slide carousel deck & 5 scroll-stopper hooks',
  },
];

export default function AutonomousCampaignDashboard() {
  const [studioState, setStudioState] = useState<AutonomousStudioStoreState | null>(null);
  const [currentStep, setCurrentStep] = useState<GuidedStepId>(1);

  // Step 1 Onboarding Inputs
  const [siteSourceMode, setSiteSourceMode] = useState<'external-url' | 'internal-builder'>(
    'external-url'
  );
  const [newSiteUrl, setNewSiteUrl] = useState<string>('https://doitwithai.tools');
  const [newSiteNiche, setNewSiteNiche] = useState<string>(
    'AI SEO, Answer Engine Optimization (GEO) & Content Automation'
  );
  const [newInternalSlug, setNewInternalSlug] = useState<string>(
    'doitwithai-multi-tool-directory-publication'
  );
  const [showOptionalPromptBox, setShowOptionalPromptBox] = useState<boolean>(false);
  const [seedPrompts, setSeedPrompts] = useState<string>(
    [
      'How to Rank in Perplexity & ChatGPT Search with 50-Word Answer Blocks',
      'Programmatic 6-Layer Blog Section Infographics vs Stock Photos',
      'Autonomous Pinterest 2:3 Infographic Pin Growth Strategy for SaaS',
      'JSON-LD @graph Schema Markup Playbook for AI Search Citations',
      '5-Step AI Content Editing & Readability Audit Workflow',
    ].join('\n')
  );

  // Step 1 Animated Scan State
  const [isScanningWebsite, setIsScanningWebsite] = useState<boolean>(false);
  const [scanStageIndex, setScanStageIndex] = useState<number>(0);
  const [latestScoutReport, setLatestScoutReport] = useState<WebsiteScoutReport | null>(null);

  // Step 2 Topic Selection State
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [customTopicInput, setCustomTopicInput] = useState<string>('');

  // Step 3 Live Animated Production State
  const [isRunningBatch, setIsRunningBatch] = useState<boolean>(false);
  const [activeRunningJobId, setActiveRunningJobId] = useState<string>('');
  const [activeStationIdx, setActiveStationIdx] = useState<number>(0);
  const [completedJobIdsInRun, setCompletedJobIdsInRun] = useState<string[]>([]);

  // Step 4 Results & Delivery State
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [resultPreviewTab, setResultPreviewTab] = useState<ResultPreviewTab>('article');
  const [selectedSectionIdx, setSelectedSectionIdx] = useState<number>(0);
  const [selectedPinIndex, setSelectedPinIndex] = useState<number>(0);
  const [isPublishingJob, setIsPublishingJob] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Optional Power-User Drawer (Collapsed by default so beginners are never overwhelmed)
  const [showAdvancedDrawer, setShowAdvancedDrawer] = useState<boolean>(false);
  const [advancedSubTab, setAdvancedSubTab] = useState<
    'connections-byok' | 'winner-analytics' | 'agent-architecture'
  >('connections-byok');
  const [cloudSyncInput, setCloudSyncInput] = useState<string>('');

  useEffect(() => {
    const loaded = loadAutonomousStudioState();
    setStudioState(loaded);
    const firstCampaign = loaded.campaigns[0];
    if (firstCampaign && firstCampaign.jobs.length > 0) {
      setSelectedJobId(firstCampaign.jobs[0].id);
      setSelectedJobIds(firstCampaign.jobs.map((j) => j.id));
    }
  }, []);

  const activeCampaign: AutonomousCampaign | undefined = useMemo(() => {
    if (!studioState) return undefined;
    return (
      studioState.campaigns.find((c) => c.id === studioState.activeCampaignId) ??
      studioState.campaigns[0]
    );
  }, [studioState]);

  const activeWebsite: ConnectedWebsiteProfile | undefined = useMemo(() => {
    if (!studioState || !activeCampaign) return undefined;
    return (
      studioState.websites.find((w) => w.id === activeCampaign.websiteId) ??
      studioState.websites[0]
    );
  }, [studioState, activeCampaign]);

  const selectedJob: AutomatedArticleJob | undefined = useMemo(() => {
    if (!activeCampaign) return undefined;
    return (
      activeCampaign.jobs.find((j) => j.id === selectedJobId) ?? activeCampaign.jobs[0]
    );
  }, [activeCampaign, selectedJobId]);

  const tokenBudget = useMemo(() => {
    return calculateCampaignTokenBudget(selectedJobIds.length || 5);
  }, [selectedJobIds.length]);

  const winnerEvaluations = useMemo(() => {
    if (!activeCampaign) return [];
    return evaluateCampaignWinnerCandidates(activeCampaign);
  }, [activeCampaign]);

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
      brandPrimaryHex: activeWebsite?.brandPrimaryHex || '#4A6CF7',
      brandSecondaryHex: activeWebsite?.brandSecondaryHex || '#FBB040',
    });
  }, [selectedJob, selectedSectionIdx, activeWebsite]);

  const selectedPin: PinterestPinCandidate | undefined = useMemo(() => {
    if (!selectedJob) return undefined;
    return selectedJob.pinterestPins[selectedPinIndex] ?? selectedJob.pinterestPins[0];
  }, [selectedJob, selectedPinIndex]);

  const selectedPinSvg = useMemo(() => {
    if (!selectedPin) return '';
    return renderPinterestPinPreviewSvg(selectedPin, activeWebsite?.siteName);
  }, [selectedPin, activeWebsite]);

  const updateState = (
    updater: (prev: AutonomousStudioStoreState) => AutonomousStudioStoreState
  ) => {
    setStudioState((prev) => {
      if (!prev) return prev;
      const next = saveAutonomousStudioState(updater(prev));
      return { ...next };
    });
  };

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
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

  /**
   * STEP 1 -> STEP 2: Animated Website Scan & Topic Discovery
   */
  const handleScanWebsiteAndDiscoverTopics = async () => {
    if (!studioState) return;
    setIsScanningWebsite(true);
    setScanStageIndex(0);

    const stageTimer = setInterval(() => {
      setScanStageIndex((prev) => (prev < SCAN_ANIMATION_STAGES.length - 1 ? prev + 1 : prev));
    }, 420);

    try {
      const seeds = seedPrompts
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      let scoutReport: WebsiteScoutReport | null = null;
      const effectiveUrl =
        siteSourceMode === 'internal-builder'
          ? `https://doitwithai.tools/p/${newInternalSlug}`
          : newSiteUrl.trim() || 'https://doitwithai.tools';

      try {
        const res = await fetch('/api/autonomous-agents/scout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteUrl: effectiveUrl,
            primaryNiche: newSiteNiche,
            seedTopics: seeds,
            targetCount: 6,
            installedTools: studioState.websites[0]?.installedTools ?? [],
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { ok: boolean; report?: WebsiteScoutReport };
          if (data.ok && data.report) {
            scoutReport = data.report;
          }
        }
      } catch {
        // Offline / local fallback below
      }

      if (!scoutReport) {
        await new Promise((r) => setTimeout(r, 1200));
        const rankedTopics = deduplicateAndRankLowKdTopics({
          seedTopics: seeds,
          trendItems: [],
          autocompleteSuggestions: [
            `${newSiteNiche.split(' ')[0] || 'AI'} workflow checklist`,
            `how to automate ${newSiteNiche.split(' ')[0] || 'SEO'} step by step`,
          ],
          existingSitemapUrls: [],
          installedTools: studioState.websites[0]?.installedTools ?? [],
          targetCount: 6,
        });
        scoutReport = {
          siteUrl: effectiveUrl,
          crawledAtIso: new Date().toISOString(),
          sitemapUrlsFound: 18,
          sampleExistingUrls: [`${effectiveUrl}/blog`],
          extractedBrand: {
            siteTitle:
              siteSourceMode === 'internal-builder'
                ? `DoItWithAI Site (${newInternalSlug})`
                : effectiveUrl.replace(/^https?:\/\//, '').split('/')[0] || 'My Website',
            metaDescription: newSiteNiche,
            detectedPrimaryHex: '#4A6CF7',
            detectedSecondaryHex: '#FBB040',
            h1Headings: [],
            h2Headings: [],
            internalLinks: [],
          },
          googleTrendsCount: 6,
          autocompleteCount: 8,
          rankedTopics,
        };
      }

      setLatestScoutReport(scoutReport);
      const nowIso = new Date().toISOString();
      const publishingMode: WebsitePublishingMode =
        siteSourceMode === 'internal-builder'
          ? 'internal-doitwithai-site'
          : 'external-workspace-staging';

      const websiteId = `site-${Date.now()}`;
      const newWebsite: ConnectedWebsiteProfile = {
        id: websiteId,
        siteName: scoutReport.extractedBrand.siteTitle || 'Connected Website',
        siteUrl: effectiveUrl,
        publishingMode,
        internalBuilderSlug:
          siteSourceMode === 'internal-builder' ? newInternalSlug.trim() : undefined,
        primaryNiche: newSiteNiche.trim(),
        brandPrimaryHex: scoutReport.extractedBrand.detectedPrimaryHex || '#4A6CF7',
        brandSecondaryHex: scoutReport.extractedBrand.detectedSecondaryHex || '#FBB040',
        darkThemePreferred: true,
        installedTools: studioState.websites[0]?.installedTools ?? [],
      };

      const templateJob = studioState.campaigns[0]?.jobs[0];
      const generatedJobs: AutomatedArticleJob[] = scoutReport.rankedTopics.map(
        (topic, idx): AutomatedArticleJob => {
          const slug = topic.topicTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 64);

          return {
            ...(templateJob as AutomatedArticleJob),
            id: `job-${Date.now()}-${idx + 1}`,
            orderIndex: idx + 1,
            topicTitle: topic.topicTitle,
            primaryKeyword: topic.primaryKeyword,
            secondaryKeywords: topic.secondaryKeywords,
            searchIntent: topic.searchIntent,
            kdProxyScore: topic.kdProxyScore,
            trendSource: topic.trendSource,
            matchedInternalToolSlug: topic.matchedInternalToolSlug,
            matchedInternalToolTitle: topic.matchedInternalToolTitle,
            status: 'queued',
            completedAgents: ['website-brand-scout', 'trend-keyword-radar'],
            activeAgent: 'topical-map-architect',
            scheduledForIso: new Date(Date.now() + idx * 86_400_000).toISOString(),
            metaTitle: `${topic.topicTitle} (2027 Guide)`.slice(0, 60),
            metaDescription: `Step-by-step playbook for ${topic.primaryKeyword} with original infographics and actionable checklists.`.slice(
              0,
              155
            ),
            urlSlug: slug || `topic-${idx + 1}`,
            updatedAtIso: nowIso,
          };
        }
      );

      const newCampaign: AutonomousCampaign = {
        id: `camp-${Date.now()}`,
        name: `${newWebsite.siteName} · Autonomous Growth Campaign`,
        createdAtIso: nowIso,
        updatedAtIso: nowIso,
        websiteId,
        seedTopicsOrPrompt: seedPrompts,
        targetArticleCount: generatedJobs.length,
        cadence: 'daily-1-article',
        approvalMode: 'confidence-gated-90',
        confidenceThreshold: 90,
        status: 'draft',
        jobs: generatedJobs,
      };

      updateState((prev) => ({
        ...prev,
        activeCampaignId: newCampaign.id,
        websites: [newWebsite, ...prev.websites],
        campaigns: [newCampaign, ...prev.campaigns],
        lastSavedAtIso: nowIso,
      }));

      setSelectedJobIds(generatedJobs.map((j) => j.id));
      if (generatedJobs[0]) {
        setSelectedJobId(generatedJobs[0].id);
      }
      setCurrentStep(2);
    } finally {
      clearInterval(stageTimer);
      setIsScanningWebsite(false);
    }
  };

  /**
   * STEP 2: Add a custom topic on the fly
   */
  const handleAddCustomTopic = () => {
    if (!customTopicInput.trim() || !activeCampaign || !studioState) return;
    const title = customTopicInput.trim();
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 64);
    const nowIso = new Date().toISOString();
    const templateJob = activeCampaign.jobs[0];
    if (!templateJob) return;

    const newJob: AutomatedArticleJob = {
      ...templateJob,
      id: `job-custom-${Date.now()}`,
      orderIndex: activeCampaign.jobs.length + 1,
      topicTitle: title,
      primaryKeyword: title.toLowerCase(),
      searchIntent: 'step-by-step-howto',
      kdProxyScore: 22,
      trendSource: 'user-seed-prompt',
      status: 'queued',
      urlSlug: slug || `custom-topic-${Date.now()}`,
      metaTitle: `${title} (Complete Guide)`.slice(0, 60),
      updatedAtIso: nowIso,
    };

    updateState((prev): AutonomousStudioStoreState => {
      const campaigns: AutonomousCampaign[] = prev.campaigns.map(
        (camp): AutonomousCampaign =>
          camp.id === activeCampaign.id
            ? { ...camp, jobs: [newJob, ...camp.jobs], updatedAtIso: nowIso }
            : camp
      );
      return { ...prev, campaigns, lastSavedAtIso: nowIso };
    });

    setSelectedJobIds((prev) => [newJob.id, ...prev]);
    setSelectedJobId(newJob.id);
    setCustomTopicInput('');
  };

  /**
   * STEP 2 -> STEP 3 -> STEP 4: Animated Live Batch Execution + Auto-Publish / Ready-Made Pack
   */
  const handleStartAutonomousBatchRun = async () => {
    if (!studioState || !activeCampaign || !activeWebsite) return;
    const jobsToRun = activeCampaign.jobs.filter((j) => selectedJobIds.includes(j.id));
    const targetJobs = jobsToRun.length > 0 ? jobsToRun : activeCampaign.jobs;

    setCurrentStep(3);
    setIsRunningBatch(true);
    setCompletedJobIdsInRun([]);
    let workingState = studioState;

    try {
      for (let i = 0; i < targetJobs.length; i++) {
        const job = targetJobs[i]!;
        setActiveRunningJobId(job.id);

        for (let st = 0; st < PRODUCTION_STATIONS.length; st++) {
          setActiveStationIdx(st);
          await new Promise((r) => setTimeout(r, 260));
        }

        const res = await runByokJobWithCheckpoints({
          state: workingState,
          campaignId: activeCampaign.id,
          jobId: job.id,
          skipCooldownInTests: true,
          onCheckpoint: (nextState) => {
            workingState = nextState;
            setStudioState(nextState);
          },
        });
        workingState = res.state;

        // If internal DoItWithAI Website Builder mode is active, auto-publish to /p/[slug]/blog
        if (activeWebsite.publishingMode === 'internal-doitwithai-site') {
          const pubRes = publishJobToInternalWebsiteStore({
            job: res.job,
            website: activeWebsite,
          });
          const nowIso = new Date().toISOString();
          const updatedCampaigns: AutonomousCampaign[] = workingState.campaigns.map(
            (camp): AutonomousCampaign => {
              if (camp.id !== activeCampaign.id) return camp;
              const updatedJobs: AutomatedArticleJob[] = camp.jobs.map(
                (j): AutomatedArticleJob =>
                  j.id === job.id
                    ? {
                        ...j,
                        status: 'published',
                        publishedUrl: pubRes.targetUrl,
                        lastPublishReport: {
                          destination: activeWebsite.publishingMode,
                          status: 'published',
                          targetUrl: pubRes.targetUrl,
                          socialDispatchedCount: j.arcadsVariations.length,
                          publishedAtIso: nowIso,
                        },
                        updatedAtIso: nowIso,
                      }
                    : j
              );
              return { ...camp, jobs: updatedJobs, updatedAtIso: nowIso };
            }
          );
          workingState = saveAutonomousStudioState({
            ...workingState,
            campaigns: updatedCampaigns,
            lastSavedAtIso: nowIso,
          });
        }

        setStudioState(workingState);
        setCompletedJobIdsInRun((prev) => [...prev, job.id]);
      }

      if (targetJobs[0]) {
        setSelectedJobId(targetJobs[0].id);
      }
      setStatusMessage(
        activeWebsite.publishingMode === 'internal-doitwithai-site'
          ? `All ${targetJobs.length} articles, section infographics & social packs are complete and auto-published to your DoItWithAI Website!`
          : `All ${targetJobs.length} articles, 6-layer infographics, Pinterest 2:3 pins & LinkedIn carousels are ready!`
      );
      setCurrentStep(4);
    } finally {
      setIsRunningBatch(false);
    }
  };

  /**
   * STEP 4: Publish or Stage Selected Job (Internal Blog or External CMS + Hybrid Social Fallback)
   */
  const handlePublishSelectedJob = async () => {
    if (!studioState || !activeCampaign || !selectedJob || !activeWebsite) return;
    setIsPublishingJob(true);
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
        summaryMsg = `Auto-published live to ${res.targetUrl} with ${res.embeddedInfographicsCount} embedded 6-layer SVG infographics!`;
      } else {
        const externalResult = await dispatchExternalCmsAndSocialPublish({
          job: selectedJob,
          website: activeWebsite,
          approvalMode: activeCampaign.approvalMode,
          confidenceThreshold: activeCampaign.confidenceThreshold,
          socialConnections: studioState.socialConnections,
        });
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
                return {
                  ...job,
                  status: nextStatus,
                  publishedUrl: targetUrl,
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
      `${selectedJob.urlSlug}-complete-ready-pack.json`,
      JSON.stringify(bundle, null, 2),
      'application/json'
    );
    setStatusMessage(
      `Downloaded complete ready-made pack (${bundle.sectionInfographicSvgs.length} section infographics, 3 Pinterest 2:3 Pins, 8-slide LinkedIn Carousel & Markdown).`
    );
  };

  const handleDownloadPinterestCsv = () => {
    if (!selectedJob || !activeWebsite) return;
    const csv = buildPinterestBulkCsvSchedule(selectedJob, activeWebsite);
    downloadTextFile(
      `${selectedJob.urlSlug}-pinterest-schedule.csv`,
      csv,
      'text/csv;charset=utf-8'
    );
    setStatusMessage('Downloaded Pinterest 3-Pin Bulk CSV Schedule.');
  };

  const handleDownloadLinkedinCarousel = () => {
    if (!selectedJob || !activeWebsite) return;
    const html = buildLinkedinCarouselHtmlDeck(selectedJob, activeWebsite);
    downloadTextFile(
      `${selectedJob.urlSlug}-linkedin-8-slide-carousel.html`,
      html,
      'text/html;charset=utf-8'
    );
    setStatusMessage(
      'Downloaded 8-Slide LinkedIn Carousel Deck (Open in browser -> Print -> Save as PDF).'
    );
  };

  const handleRunWinnerCloneOptimizer = () => {
    if (!studioState || !activeCampaign) return;
    const res = runWinnerCloneAutoOptimizer(studioState, activeCampaign.id);
    updateState(() => res.nextState);
    setStatusMessage(
      res.promotedWinners.length > 0
        ? `Promoted ${res.promotedWinners.length} winning Pin/Hook formula(s) to future runs!`
        : `Audited ${res.evaluations.length} Pinterest Pins and locked top Winner Formulas.`
    );
  };

  const handleExportCloudSync = () => {
    if (!studioState) return;
    const envelope = exportStudioStateForCloudSync(studioState);
    const json = JSON.stringify(envelope, null, 2);
    setCloudSyncInput(json);
    handleCopy(json, 'cloud-sync');
    setStatusMessage(`Copied Cloud Sync backup JSON (${envelope.workspaceChecksum}).`);
  };

  const handleImportCloudSync = () => {
    if (!cloudSyncInput.trim()) return;
    try {
      const restored = importStudioStateFromCloudSync(cloudSyncInput);
      setStudioState(restored);
      setStatusMessage('Restored workspace state from Cloud Sync JSON.');
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : 'Invalid Cloud Sync JSON payload.'
      );
    }
  };

  if (!studioState || !activeCampaign || !activeWebsite) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex items-center justify-center p-8">
        <div className="text-sm text-slate-400 animate-pulse">
          Loading Autonomous Content & Social Autopilot...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100">
      {/* Clean, Streamlined Top Bar */}
      <header className="border-b border-slate-800/80 bg-[#0F1623]/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              4-Step Guided Autopilot
            </span>
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
              AI Content, Infographic & Social Automation
            </h1>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <Link
              href="/ai-content-writer"
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 font-medium text-slate-200 hover:bg-slate-700 transition"
            >
              ← Single Article Writer
            </Link>
            <button
              type="button"
              onClick={() => setShowAdvancedDrawer((prev) => !prev)}
              className={`rounded-lg border px-3 py-1.5 font-semibold transition ${
                showAdvancedDrawer
                  ? 'border-sky-400 bg-sky-500/20 text-sky-200'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
              }`}
            >
              ⚙ {showAdvancedDrawer ? 'Hide Advanced Settings' : 'Advanced Settings (Optional)'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {statusMessage && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 text-xs text-emerald-200 flex items-center justify-between gap-3">
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

        {/* MAIN 2-PANEL GUIDED WORKSPACE: Left 4-Step Rail + Right Active Step Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANEL: Simple 4-Step Guided Stepper & Active Site Badge */}
          <aside className="lg:col-span-4 xl:col-span-3 rounded-2xl border border-slate-800/90 bg-slate-900/70 p-4 space-y-4 lg:sticky lg:top-20">
            <div className="border-b border-slate-800 pb-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                Simple 4-Step Automation
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter your URL, pick topics, and let the AI agents handle writing, visuals & social packs.
              </p>
            </div>

            <nav className="space-y-2" aria-label="Autopilot Steps">
              {GUIDED_STEPS.map((item) => {
                const isActive = currentStep === item.step;
                const isDone = currentStep > item.step;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => setCurrentStep(item.step)}
                    className={`w-full text-left rounded-xl p-3 border transition flex items-start gap-3 ${
                      isActive
                        ? 'border-sky-500 bg-sky-500/15 shadow-sm'
                        : isDone
                          ? 'border-emerald-500/35 bg-emerald-950/20 hover:border-emerald-500/60'
                          : 'border-slate-800/90 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                        isActive
                          ? 'bg-sky-500 text-slate-950'
                          : isDone
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isDone ? '✓' : item.step}
                    </span>
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-bold ${
                          isActive
                            ? 'text-white'
                            : isDone
                              ? 'text-emerald-300'
                              : 'text-slate-300'
                        }`}
                      >
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Compact Active Website Summary Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Active Website
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-3 w-3 rounded-full border border-white/20"
                    style={{ backgroundColor: activeWebsite.brandPrimaryHex }}
                  />
                  <span
                    className="h-3 w-3 rounded-full border border-white/20"
                    style={{ backgroundColor: activeWebsite.brandSecondaryHex }}
                  />
                </span>
              </div>
              <div className="font-bold text-white truncate">{activeWebsite.siteName}</div>
              <div className="text-[11px] text-slate-400 truncate">{activeWebsite.siteUrl}</div>
              <div className="pt-1 flex items-center justify-between text-[11px] border-t border-slate-800/80">
                <span className="text-slate-400">Mode:</span>
                <span className="font-semibold text-emerald-300">
                  {activeWebsite.publishingMode === 'internal-doitwithai-site'
                    ? 'Auto-Publish (/p/blog)'
                    : 'Ready-Made Export Pack'}
                </span>
              </div>
            </div>
          </aside>

          {/* RIGHT PANEL: Focused Single-Step Canvas */}
          <section className="lg:col-span-8 xl:col-span-9">
            {/* =========================================================
                STEP 1: ENTER WEBSITE URL & ANIMATED AI SCANNER
               ========================================================= */}
            {currentStep === 1 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-6">
                <div className="max-w-2xl space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 border border-sky-500/30 px-3 py-1 text-xs font-bold text-sky-300">
                    Step 1 of 4 · Zero-Setup Onboarding
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    Where should our AI Agents publish or tailor your content?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Just give us your website link (or choose a website you built on DoItWithAI). We will automatically scan your pages, brand colors, and Google Trends to find the best topics for you.
                  </p>
                </div>

                {/* Simple 2-Card Choice: External Website vs Internal DoItWithAI Website */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => setSiteSourceMode('external-url')}
                    className={`rounded-2xl border p-4 text-left transition ${
                      siteSourceMode === 'external-url'
                        ? 'border-sky-500 bg-sky-500/15 shadow-md'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-white">
                        🌐 My Own External Website URL
                      </span>
                      {siteSourceMode === 'external-url' && (
                        <span className="rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Paste any website link (WordPress, Shopify, custom site). We scan your sitemap and prepare ready-to-publish articles, infographics & social packs.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSiteSourceMode('internal-builder')}
                    className={`rounded-2xl border p-4 text-left transition ${
                      siteSourceMode === 'internal-builder'
                        ? 'border-emerald-500 bg-emerald-500/15 shadow-md'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-white">
                        ⚡ My DoItWithAI Builder Website
                      </span>
                      {siteSourceMode === 'internal-builder' && (
                        <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Connect a site built in our AI Website Builder (`/p/[slug]/blog`). Completed articles and infographics publish to your blog 100% automatically.
                    </p>
                  </button>
                </div>

                {/* Focused URL / Niche Inputs */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
                  {siteSourceMode === 'external-url' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1.5">
                        Your Website URL
                      </label>
                      <input
                        type="url"
                        value={newSiteUrl}
                        onChange={(e) => setNewSiteUrl(e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1.5">
                        Your DoItWithAI Website Slug (`/p/[slug]/blog`)
                      </label>
                      <input
                        type="text"
                        value={newInternalSlug}
                        onChange={(e) => setNewInternalSlug(e.target.value)}
                        placeholder="doitwithai-multi-tool-directory-publication"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      What is your website or business about? (Niche / Main Topic)
                    </label>
                    <input
                      type="text"
                      value={newSiteNiche}
                      onChange={(e) => setNewSiteNiche(e.target.value)}
                      placeholder="e.g., AI SEO Tools, Digital Marketing, E-Commerce Growth"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  {/* Optional Seed Topics Collapse */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowOptionalPromptBox((prev) => !prev)}
                      className="text-xs font-semibold text-sky-400 hover:text-sky-300"
                    >
                      {showOptionalPromptBox
                        ? '▾ Hide optional custom topic ideas'
                        : '▸ Optional: Have specific topics or prompts in mind? Click to add'}
                    </button>
                    {showOptionalPromptBox && (
                      <textarea
                        rows={4}
                        value={seedPrompts}
                        onChange={(e) => setSeedPrompts(e.target.value)}
                        placeholder="Enter one topic or idea per line (optional)..."
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-slate-200"
                      />
                    )}
                  </div>
                </div>

                {/* Animated Live Scanner Feedback when scanning */}
                {isScanningWebsite && (
                  <div className="rounded-2xl border border-sky-500/40 bg-sky-950/25 p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-sky-300 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-sky-400 animate-ping" />
                        AI Brand & Topic Scout Agent Running...
                      </span>
                      <span className="text-slate-400">
                        Stage {scanStageIndex + 1} of {SCAN_ANIMATION_STAGES.length}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-300"
                        style={{
                          width: `${((scanStageIndex + 1) / SCAN_ANIMATION_STAGES.length) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {SCAN_ANIMATION_STAGES.map((stageText, idx) => (
                        <div
                          key={stageText}
                          className={`rounded-lg px-3 py-2 text-xs flex items-center gap-2 ${
                            idx <= scanStageIndex
                              ? 'bg-sky-500/15 text-white font-semibold'
                              : 'bg-slate-900/50 text-slate-500'
                          }`}
                        >
                          <span>{idx < scanStageIndex ? '✓' : idx === scanStageIndex ? '⏳' : '○'}</span>
                          <span>{stageText}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Primary Step 1 CTA */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    disabled={isScanningWebsite}
                    onClick={handleScanWebsiteAndDiscoverTopics}
                    className="rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 disabled:opacity-60 px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg transition"
                  >
                    {isScanningWebsite
                      ? 'Scanning Website & Discovering Topics...'
                      : '1. Analyze Website & Generate Topic Ideas →'}
                  </button>

                  {activeCampaign.jobs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Skip scan & use current {activeCampaign.jobs.length} topics →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* =========================================================
                STEP 2: REVIEW & SELECT TOPIC IDEAS (1-CLICK START)
               ========================================================= */}
            {currentStep === 2 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300">
                      Step 2 of 4 · Website Analyzed Successfully
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      Here are your recommended Low-KD Topics
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300">
                      We checked your sitemap and Google Trends to pick topics that won&apos;t cannibalize your existing pages. Keep them all selected or uncheck any topic you want to skip.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartAutonomousBatchRun}
                    disabled={selectedJobIds.length === 0}
                    className="rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 disabled:opacity-50 px-5 py-3 text-xs sm:text-sm font-extrabold text-slate-950 shadow-lg transition"
                  >
                    ▶ Start Writing {selectedJobIds.length} Articles + Visuals Automatically →
                  </button>
                </div>

                {/* Extracted Website DNA Summary Banner */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <div className="text-slate-400">Website Analyzed</div>
                    <div className="font-bold text-white truncate mt-0.5">
                      {activeWebsite.siteName}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Sitemap & Trend Signals</div>
                    <div className="font-bold text-emerald-300 mt-0.5">
                      {latestScoutReport?.sitemapUrlsFound ?? 18} URLs · 0 Duplicates
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Visual Output per Article</div>
                    <div className="font-bold text-sky-300 mt-0.5">
                      4 Infographics + 3 Pins + 8 Slides
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Selected Topics</div>
                    <div className="font-bold text-amber-300 mt-0.5">
                      {selectedJobIds.length} of {activeCampaign.jobs.length} Selected
                    </div>
                  </div>
                </div>

                {/* Quick Add Custom Topic Bar */}
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={customTopicInput}
                    onChange={(e) => setCustomTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCustomTopic();
                    }}
                    placeholder="Want to add your own article topic? Type it here and press Add..."
                    className="flex-1 min-w-[240px] rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTopic}
                    className="rounded-xl border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 px-4 py-2 text-xs font-bold text-sky-200 transition"
                  >
                    + Add Topic
                  </button>
                </div>

                {/* Selectable Topic Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {activeCampaign.jobs.map((job, idx) => {
                    const checked = selectedJobIds.includes(job.id);
                    return (
                      <div
                        key={job.id}
                        onClick={() =>
                          setSelectedJobIds((prev) =>
                            prev.includes(job.id)
                              ? prev.filter((id) => id !== job.id)
                              : [...prev, job.id]
                          )
                        }
                        className={`cursor-pointer rounded-2xl border p-4 transition flex items-start gap-3.5 ${
                          checked
                            ? 'border-sky-500/60 bg-slate-950/90 shadow-sm'
                            : 'border-slate-800/80 bg-slate-950/40 opacity-60 hover:opacity-90'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="mt-1 h-4 w-4 rounded border-slate-600 text-sky-500 focus:ring-sky-500"
                        />
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                              Topic #{idx + 1}
                            </span>
                            <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                              Low KD: {job.kdProxyScore}/100
                            </span>
                            <span className="rounded bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                              {job.searchIntent}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-white leading-snug">
                            {job.topicTitle}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Primary Keyword:{' '}
                            <span className="text-slate-200 font-medium">
                              {job.primaryKeyword}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Step Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                  >
                    ← Back to Website URL
                  </button>
                  <button
                    type="button"
                    onClick={handleStartAutonomousBatchRun}
                    disabled={selectedJobIds.length === 0}
                    className="rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 disabled:opacity-50 px-6 py-3 text-sm font-extrabold text-slate-950 shadow-lg transition"
                  >
                    ▶ Start Autonomous Writing & Visuals ({selectedJobIds.length} Topics) →
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================
                STEP 3: LIVE ANIMATED MULTI-AGENT EXECUTION PIPELINE
               ========================================================= */}
            {currentStep === 3 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 border border-sky-500/30 px-3 py-1 text-xs font-bold text-sky-300">
                      <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                      Step 3 of 4 · Autonomous Agents Working Live
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      {isRunningBatch
                        ? 'Your AI Agent Team is creating your articles, infographics & social pins...'
                        : 'All selected articles & visuals are complete!'}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 transition"
                  >
                    View Finished Articles & Downloads (Step 4) →
                  </button>
                </div>

                {/* Live Animated 4-Station Assembly Line */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {PRODUCTION_STATIONS.map((station, idx) => {
                    const active = isRunningBatch && activeStationIdx === idx;
                    const done = !isRunningBatch || activeStationIdx > idx;
                    return (
                      <div
                        key={station.id}
                        className={`rounded-2xl border p-4 transition ${
                          active
                            ? 'border-sky-400 bg-sky-500/15 shadow-lg'
                            : done
                              ? 'border-emerald-500/40 bg-emerald-950/20'
                              : 'border-slate-800 bg-slate-950/60 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span
                            className={
                              active
                                ? 'text-sky-300'
                                : done
                                  ? 'text-emerald-300'
                                  : 'text-slate-400'
                            }
                          >
                            {station.label}
                          </span>
                          <span>{active ? '⚡' : done ? '✓' : '⏳'}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                          {station.detail}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Per-Article Live Progress List */}
                <div className="space-y-2.5">
                  {activeCampaign.jobs
                    .filter((j) => selectedJobIds.includes(j.id))
                    .map((job, idx) => {
                      const isDone =
                        completedJobIdsInRun.includes(job.id) || job.status === 'published';
                      const isCurrent = isRunningBatch && activeRunningJobId === job.id;
                      return (
                        <div
                          key={job.id}
                          className={`rounded-xl border p-4 flex flex-wrap items-center justify-between gap-3 transition ${
                            isCurrent
                              ? 'border-sky-400 bg-sky-950/30'
                              : isDone
                                ? 'border-emerald-500/35 bg-slate-950/80'
                                : 'border-slate-800 bg-slate-950/40'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-extrabold ${
                                isDone
                                  ? 'bg-emerald-500 text-slate-950'
                                  : isCurrent
                                    ? 'bg-sky-400 text-slate-950 animate-pulse'
                                    : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {isDone ? '✓' : idx + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-white truncate">
                                {job.topicTitle}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {isDone
                                  ? '✓ Article + 4 Section Infographics + 3 Pinterest Pins + 8-Slide LinkedIn Deck Ready'
                                  : isCurrent
                                    ? PRODUCTION_STATIONS[activeStationIdx]?.detail
                                    : 'Waiting in queue...'}
                              </div>
                            </div>
                          </div>

                          {isDone && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedJobId(job.id);
                                setCurrentStep(4);
                              }}
                              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-emerald-300"
                            >
                              Inspect Result →
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* =========================================================
                STEP 4: READY-MADE RESULTS, AUTO-PUBLISH & 1-CLICK DOWNLOADS
               ========================================================= */}
            {currentStep === 4 && selectedJob && (
              <div className="space-y-6">
                {/* Top Delivery Summary Card: Website Scenario + Social Media Scenario */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300">
                        Step 4 of 4 · Everything Ready & Packaged
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5">
                        Your Articles, Infographics & Social Media Packs Are Ready
                      </h2>
                    </div>

                    {/* Article Switcher Dropdown / Pills */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Viewing Article:</span>
                      <select
                        value={selectedJob.id}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                        className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                      >
                        {activeCampaign.jobs.map((j, idx) => (
                          <option key={j.id} value={j.id}>
                            #{idx + 1}: {j.topicTitle.slice(0, 52)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Two Clear Delivery Cards: (1) Website Blog Delivery & (2) Social Media Delivery */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card A: Website Blog Delivery */}
                    <div className="rounded-2xl border border-emerald-500/35 bg-slate-950/80 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                          1. Website Blog Post Delivery
                        </span>
                        <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                          {activeWebsite.publishingMode === 'internal-doitwithai-site'
                            ? 'Auto-Published to Site'
                            : 'Ready-Made Article Pack'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {activeWebsite.publishingMode === 'internal-doitwithai-site'
                          ? `Automatically published to your DoItWithAI website (${
                              selectedJob.publishedUrl ||
                              `/p/${activeWebsite.internalBuilderSlug}/blog/${selectedJob.urlSlug}`
                            }) with all 4 SVG section infographics embedded.`
                          : 'Your complete SEO/GEO article with 4 embedded section infographics and JSON-LD schema is ready to copy or auto-publish to WordPress.'}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          disabled={isPublishingJob}
                          onClick={handlePublishSelectedJob}
                          className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 transition"
                        >
                          {isPublishingJob
                            ? 'Publishing...'
                            : activeWebsite.publishingMode === 'internal-doitwithai-site'
                              ? '✓ Sync / Update Internal Blog Post'
                              : 'Publish / Stage to Website'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              selectedJob.compiledArticleMarkdown ||
                                compileJobArticleMarkdown(selectedJob, activeWebsite),
                              `copy-md-${selectedJob.id}`
                            )
                          }
                          className="rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 transition"
                        >
                          {copiedId === `copy-md-${selectedJob.id}`
                            ? '✓ Copied Article Markdown!'
                            : 'Copy Full Article'}
                        </button>
                      </div>
                    </div>

                    {/* Card B: Social Media Delivery (Connected = Auto-Publish; Unconnected = 1-Click Download) */}
                    <div className="rounded-2xl border border-sky-500/35 bg-slate-950/80 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-sky-300">
                          2. Social Media & Visuals Pack
                        </span>
                        <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                          1-Click Downloads Ready
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Connected accounts auto-publish directly. For any social account you haven&apos;t signed into yet, download the ready-made visuals and schedule files below in 1 click:
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleDownloadLinkedinCarousel}
                          className="rounded-xl bg-sky-500 hover:bg-sky-400 px-3 py-2 text-xs font-extrabold text-slate-950 transition"
                        >
                          ⬇ LinkedIn 8-Slide Carousel (HTML/PDF)
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadPinterestCsv}
                          className="rounded-xl border border-amber-400/40 bg-amber-500/15 hover:bg-amber-500/25 px-3 py-2 text-xs font-bold text-amber-200 transition"
                        >
                          ⬇ Pinterest 3-Pin CSV
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadCompleteBundle}
                          className="rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition"
                        >
                          ⬇ Full Pack (.JSON)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clean 4-Pill Visual Preview Switcher for Selected Job */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <div className="text-xs font-bold text-sky-400">
                        GEO Citation Readiness Score: {selectedJob.geoReadiness.overallScore}/100
                      </div>
                      <h3 className="text-lg font-extrabold text-white mt-0.5">
                        {selectedJob.topicTitle}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {(
                        [
                          { id: 'article', label: '📄 Full Article' },
                          { id: 'infographics', label: '🎨 4 Section Infographics' },
                          { id: 'pinterest', label: '📌 3 Pinterest 2:3 Pins' },
                          { id: 'social-copy', label: '💬 5 Social Posts' },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setResultPreviewTab(tab.id)}
                          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                            resultPreviewTab === tab.id
                              ? 'bg-sky-500 text-slate-950'
                              : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview Mode 1: Full Article */}
                  {resultPreviewTab === 'article' && (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs text-slate-200">
                        <strong className="text-emerald-300">50-Word AI Answer Lead: </strong>
                        {selectedJob.aeoDirectAnswer50Words}
                      </div>
                      <pre className="max-h-[460px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-200 font-sans">
                        {selectedJob.compiledArticleMarkdown ||
                          compileJobArticleMarkdown(selectedJob, activeWebsite)}
                      </pre>
                    </div>
                  )}

                  {/* Preview Mode 2: 4 Section Infographics */}
                  {resultPreviewTab === 'infographics' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                      <div className="md:col-span-5 space-y-2">
                        <div className="text-xs font-bold text-slate-300 mb-2">
                          Click any H2 section to preview or download its 1080×1350 infographic:
                        </div>
                        {selectedJob.outlineSections.map((sec, idx) => (
                          <button
                            key={sec.h2 + idx}
                            type="button"
                            onClick={() => setSelectedSectionIdx(idx)}
                            className={`w-full text-left rounded-xl border p-3 text-xs transition ${
                              selectedSectionIdx === idx
                                ? 'border-sky-400 bg-sky-500/15 text-white font-bold'
                                : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div>
                              Section {idx + 1}: {sec.h2}
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal mt-0.5 truncate">
                              {sec.summary}
                            </div>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            downloadTextFile(
                              `${selectedJob.urlSlug}-section-${selectedSectionIdx + 1}.svg`,
                              selectedSectionSvg,
                              'image/svg+xml'
                            )
                          }
                          className="mt-2 w-full rounded-xl bg-sky-500 hover:bg-sky-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 transition"
                        >
                          ⬇ Download Section {selectedSectionIdx + 1} Infographic (.SVG)
                        </button>
                      </div>

                      <div className="md:col-span-7 rounded-2xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-center">
                        <div
                          className="w-full max-w-[380px] rounded-xl overflow-hidden [&_svg]:w-full [&_svg]:h-auto"
                          dangerouslySetInnerHTML={{ __html: selectedSectionSvg }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Preview Mode 3: 3 Tall Pinterest 2:3 Pins */}
                  {resultPreviewTab === 'pinterest' && selectedPin && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                      <div className="md:col-span-5 space-y-2.5">
                        <div className="text-xs font-bold text-slate-300">
                          3 Fresh 1000×1500 (2:3) Pinterest Pin Variants:
                        </div>
                        {selectedJob.pinterestPins.map((pin, idx) => (
                          <button
                            key={pin.id}
                            type="button"
                            onClick={() => setSelectedPinIndex(idx)}
                            className={`w-full text-left rounded-xl border p-3 text-xs transition ${
                              selectedPinIndex === idx
                                ? 'border-amber-400 bg-amber-500/15 text-white font-bold'
                                : 'border-slate-800 bg-slate-950/60 text-slate-300'
                            }`}
                          >
                            <div>
                              Pin #{pin.pinVariantIndex}: {pin.angleLabel} (Day +{pin.scheduledDayOffset})
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                              {pin.pinTitle}
                            </div>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            downloadTextFile(
                              `${selectedJob.urlSlug}-pin-${selectedPin.pinVariantIndex}.svg`,
                              selectedPinSvg,
                              'image/svg+xml'
                            )
                          }
                          className="w-full rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-xs font-extrabold text-slate-950 transition"
                        >
                          ⬇ Download Pin #{selectedPin.pinVariantIndex} (1000×1500 .SVG)
                        </button>
                      </div>

                      <div className="md:col-span-7 rounded-2xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-center">
                        <div
                          className="w-full max-w-[320px] rounded-xl overflow-hidden [&_svg]:w-full [&_svg]:h-auto"
                          dangerouslySetInnerHTML={{ __html: selectedPinSvg }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Preview Mode 4: 5 Ready-to-Post Social Hooks */}
                  {resultPreviewTab === 'social-copy' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {selectedJob.arcadsVariations.map((variation) => (
                        <div
                          key={variation.id}
                          className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="rounded bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-300 uppercase">
                              {variation.channel} · {variation.archetypeLabel}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  `${variation.hookLine}\n\n${variation.bodyCopy}\n\n${variation.ctaLine}`,
                                  variation.id
                                )
                              }
                              className="rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-bold text-emerald-300"
                            >
                              {copiedId === variation.id ? '✓ Copied!' : 'Copy Post'}
                            </button>
                          </div>
                          <div className="font-bold text-white">{variation.hookLine}</div>
                          <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                            {variation.bodyCopy}
                          </p>
                          <div className="text-sky-300 font-medium">{variation.ctaLine}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* =========================================================
            OPTIONAL COLLAPSIBLE ADVANCED SETTINGS & STUDIO INSPECTOR
            (Hidden by default so beginners only see the 4 simple steps)
           ========================================================= */}
        {showAdvancedDrawer && (
          <section className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                  Optional Power-User & Developer Controls
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Social Connections, Free-Tier BYOK Keys, Winner Analytics & 12-Agent Specs
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    {
                      id: 'connections-byok',
                      label: '1. Social Connections, WordPress & BYOK Keys',
                    },
                    {
                      id: 'winner-analytics',
                      label: '2. Winner-Clone Analytics & Cloud Backup',
                    },
                    {
                      id: 'agent-architecture',
                      label: '3. 12-Agent Specs & 6-Phase Roadmap',
                    },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAdvancedSubTab(tab.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      advancedSubTab === tab.id
                        ? 'bg-sky-500 text-slate-950'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const fresh = resetAutonomousStudioState();
                    setStudioState(fresh);
                    setCurrentStep(1);
                  }}
                  className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300"
                >
                  Reset Demo Data
                </button>
              </div>
            </div>

            {advancedSubTab === 'connections-byok' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
                {/* Social 1-Tap OAuth vs Manual Download Fallback */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                  <div className="font-bold text-white text-sm">
                    Social Channels (1-Tap Sign-In when API Key Active · Automatic Download Fallback)
                  </div>
                  <p className="text-slate-400">
                    When you sign in to a connected channel, posts publish automatically. Any channel left unconnected automatically generates 1-click downloadable files in Step 4.
                  </p>
                  <div className="space-y-2">
                    {studioState.socialConnections.map((conn) => (
                      <div
                        key={conn.channel}
                        className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-white">{conn.label}</div>
                          <div className="text-[11px] text-slate-400">
                            {conn.enabled
                              ? `Connected (${conn.accountHandle}) · Auto-Publish Enabled`
                              : 'Not Connected · Automatic 1-Click Download Pack Enabled'}
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
                          className={`rounded-lg px-3 py-1 text-[11px] font-bold ${
                            conn.enabled
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {conn.enabled ? 'Connected (Auto-Publish)' : 'Download Mode'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Free-Tier BYOK Keys */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                  <div className="font-bold text-white text-sm">
                    Optional Free-Tier BYOK API Keys (Stored Only in Browser)
                  </div>
                  <p className="text-slate-400">
                    Works out of the box with 0-token deterministic synthesis, or paste a free Gemini / Groq API key for live LLM drafting ({tokenBudget.tokensPerArticle.toLocaleString()} tokens/article).
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">Gemini Free API Key</label>
                      <input
                        type="password"
                        placeholder="AIzaSy..."
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
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Groq Free API Key</label>
                      <input
                        type="password"
                        placeholder="gsk_..."
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
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {advancedSubTab === 'winner-analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white text-sm">
                      Winner-Clone Auto-Optimizer (&gt;= 20% Above Median Save Rate)
                    </div>
                    <button
                      type="button"
                      onClick={handleRunWinnerCloneOptimizer}
                      className="rounded-lg bg-purple-500 hover:bg-purple-400 px-3 py-1.5 font-bold text-slate-950"
                    >
                      ★ Run Winner-Clone Optimizer
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {winnerEvaluations.slice(0, 4).map((ev) => (
                      <div
                        key={ev.pinId}
                        className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 flex items-center justify-between"
                      >
                        <span className="text-white font-medium truncate max-w-[260px]">
                          {ev.pinTitle}
                        </span>
                        <span className="text-emerald-300 font-bold">
                          Save Rate: {ev.saveRatePercent}% ({ev.outperformanceRatio}x)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                  <div className="font-bold text-white text-sm">Workspace JSON Backup & Restore</div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleExportCloudSync}
                      className="rounded-lg bg-sky-500 px-3 py-1.5 font-bold text-slate-950"
                    >
                      Export Backup JSON
                    </button>
                    <button
                      type="button"
                      onClick={handleImportCloudSync}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-bold text-white"
                    >
                      Restore JSON
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={cloudSyncInput}
                    onChange={(e) => setCloudSyncInput(e.target.value)}
                    placeholder="Paste backup JSON here..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 font-mono text-[11px] text-slate-300"
                  />
                </div>
              </div>
            )}

            {advancedSubTab === 'agent-architecture' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {AUTONOMOUS_AGENT_ROLES.map((role) => (
                  <div
                    key={role.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-1"
                  >
                    <div className="font-bold text-white">
                      #{role.order} · {role.name}
                    </div>
                    <p className="text-[11px] text-slate-400">{role.responsibility}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

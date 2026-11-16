'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AUTONOMOUS_AGENT_ROLES,
  calculateCampaignTokenBudget,
} from '@/lib/autonomous-agents/agent-roles';
import { FREE_LLM_AUTOMATION_PROVIDERS_GUIDE } from '@/lib/autonomous-agents/automation-ai-router';
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
import { syncAutomatedBatchToWriterStudio } from '@/lib/autonomous-agents/writer-studio-bridge';
import { SIX_IMPLEMENTATION_PHASES } from '@/lib/autonomous-agents/phases-roadmap';
import AiEmployeeAgencyCommandCenter from './AiEmployeeAgencyCommandCenter';
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
type AutomationWorkflowMode = 'multi-article-batch' | 'autopilot-24h';
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
    subtitle: 'Paste any URL or pick your DoItWithAI site',
  },
  {
    step: 2,
    shortLabel: 'Step 2 · Topic Ideas',
    title: 'Select Keyword Topics',
    subtitle: 'Pick real-time AI topics or add your own',
  },
  {
    step: 3,
    shortLabel: 'Step 3 · Live AI Run',
    title: 'Autonomous Production',
    subtitle: 'Watch AI research, write, link, schema & design',
  },
  {
    step: 4,
    shortLabel: 'Step 4 · Agency & Studio',
    title: '24/7 Agency & Article Studio',
    subtitle: 'Node graph, 6 SEO/Social depts & article studio',
  },
];

const SCAN_ANIMATION_STAGES = [
  'Fetching live homepage HTML, <title>, headings & sitemap.xml...',
  'Running Background Deep Research: Brand Voice, Niche & Competitor Gaps...',
  'Querying niche-specific Google Autocomplete & long-tail questions...',
  'Generating fresh Low-KD article topics with zero cannibalization...',
];

const PRODUCTION_STATIONS = [
  {
    id: 'deep-research',
    label: '1. Background Deep Research & Competitor Gap Audit',
    detail: 'Analyzing SERP intent gaps, brand voice rubric & 50-word AEO answer lead',
  },
  {
    id: 'drafting',
    label: '2. Humanized H2/H3 Section Drafting & Editing',
    detail: 'Writing zero-fluff paragraphs, comparison tables & FAQ pairs',
  },
  {
    id: 'linking-schema',
    label: '3. Internal/External Linking & JSON-LD @graph Schema',
    detail: 'Weaving contextual anchor links & compiling connected @graph schema markup',
  },
  {
    id: 'visuals',
    label: '4. 6-Layer Section Infographics (1080×1350 SVG)',
    detail: 'Rendering 4 standalone SVG section graphics tailored to your brand palette',
  },
  {
    id: 'social',
    label: '5. Pinterest 2:3 Pins & 8-Slide LinkedIn Carousel',
    detail: 'Building 3 vertical 1000×1500 pins, 8-slide carousel deck & 5 social hooks',
  },
];

export default function AutonomousCampaignDashboard() {
  const router = useRouter();
  const [studioState, setStudioState] = useState<AutonomousStudioStoreState | null>(null);
  const [currentStep, setCurrentStep] = useState<GuidedStepId>(1);
  const [workflowMode, setWorkflowMode] = useState<AutomationWorkflowMode>('multi-article-batch');

  // Step 1 Onboarding Inputs (Clean & Non-Hardcoded so any URL works out of the box)
  const [siteSourceMode, setSiteSourceMode] = useState<'external-url' | 'internal-builder'>(
    'external-url'
  );
  const [newSiteUrl, setNewSiteUrl] = useState<string>('https://doitwithai.tools');
  const [newSiteNiche, setNewSiteNiche] = useState<string>('');
  const [newInternalSlug, setNewInternalSlug] = useState<string>(
    'doitwithai-multi-tool-directory-publication'
  );
  const [showOptionalPromptBox, setShowOptionalPromptBox] = useState<boolean>(false);
  const [seedPrompts, setSeedPrompts] = useState<string>('');
  const [targetBatchSize, setTargetBatchSize] = useState<number>(6);
  const [scanVariationCounter, setScanVariationCounter] = useState<number>(1);

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
  const [transitionBannerText, setTransitionBannerText] = useState<string>('');
  const [autopilotActiveBanner, setAutopilotActiveBanner] = useState<boolean>(false);
  const [show24hAgencyCommandCenter, setShow24hAgencyCommandCenter] = useState<boolean>(true);

  // Step 4 Results & Delivery State
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [resultPreviewTab, setResultPreviewTab] = useState<ResultPreviewTab>('article');
  const [selectedSectionIdx, setSelectedSectionIdx] = useState<number>(0);
  const [selectedPinIndex, setSelectedPinIndex] = useState<number>(0);
  const [isPublishingJob, setIsPublishingJob] = useState<boolean>(false);
  const [isOpeningWriterStudio, setIsOpeningWriterStudio] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Optional Power-User Drawer
  const [showAdvancedDrawer, setShowAdvancedDrawer] = useState<boolean>(false);
  const [advancedSubTab, setAdvancedSubTab] = useState<
    'connections-byok' | 'free-api-guide' | 'winner-analytics' | 'agent-architecture'
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
   * STEP 1: Real-Time Website Scan, Hidden Background Deep Research & Dynamic AI Topic Discovery
   */
  const executeWebsiteScanAndTopicDiscovery = async (options?: {
    autoStartWriting?: boolean;
    forceFreshVariation?: boolean;
  }): Promise<{
    nextState: AutonomousStudioStoreState;
    campaign: AutonomousCampaign;
    website: ConnectedWebsiteProfile;
    jobs: AutomatedArticleJob[];
  } | null> => {
    if (!studioState) return null;
    setIsScanningWebsite(true);
    setScanStageIndex(0);

    const nextVariation = scanVariationCounter + (options?.forceFreshVariation ? 7 : 1);
    setScanVariationCounter(nextVariation);
    const variationSeed = Math.floor(Math.random() * 90000) + nextVariation * 13;

    const stageTimer = setInterval(() => {
      setScanStageIndex((prev) => (prev < SCAN_ANIMATION_STAGES.length - 1 ? prev + 1 : prev));
    }, 380);

    try {
      const publishingMode: WebsitePublishingMode =
        siteSourceMode === 'internal-builder'
          ? 'internal-doitwithai-site'
          : 'external-workspace-staging';
      const effectiveUrl =
        siteSourceMode === 'internal-builder'
          ? `https://doitwithai.tools/p/${newInternalSlug.trim()}`
          : newSiteUrl.trim() || 'https://doitwithai.tools';
      const nowIso = new Date().toISOString();

      let scoutReport: WebsiteScoutReport | null = null;
      let newWebsite: ConnectedWebsiteProfile | null = null;
      let generatedJobs: AutomatedArticleJob[] = [];

      const previousSlugsForUrl = studioState.campaigns
        .flatMap((c) => c.jobs.map((j) => j.urlSlug))
        .slice(0, 40);

      try {
        const res = await fetch('/api/autonomous-agents/scout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteUrl: effectiveUrl,
            primaryNiche: newSiteNiche.trim(),
            seedTopicsOrPrompt: showOptionalPromptBox ? seedPrompts.trim() : '',
            targetArticleCount: targetBatchSize,
            publishingMode,
            internalBuilderSlug:
              siteSourceMode === 'internal-builder' ? newInternalSlug.trim() : undefined,
            existingSlugs: previousSlugsForUrl,
            winnerFormulas: studioState.winnerFormulas,
            variationSeed,
            keyOverrides: {
              geminiKey: studioState.byokConfig.geminiFreeKeyMasked,
              groqKey: studioState.byokConfig.groqFreeKeyMasked,
            },
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            ok: boolean;
            scoutReport?: WebsiteScoutReport;
            websiteProfile?: ConnectedWebsiteProfile;
            jobs?: AutomatedArticleJob[];
          };
          if (data.ok && data.scoutReport && data.websiteProfile && Array.isArray(data.jobs)) {
            scoutReport = data.scoutReport;
            newWebsite = data.websiteProfile;
            generatedJobs = data.jobs.map(
              (job, idx): AutomatedArticleJob => ({
                ...job,
                id: `job-${Date.now()}-${idx + 1}`,
                status: 'queued',
                completedAgents: ['website-brand-scout', 'trend-keyword-radar'],
                activeAgent: 'topical-map-architect',
                updatedAtIso: nowIso,
              })
            );
          }
        }
      } catch {
        // Offline / local fallback below
      }

      if (!scoutReport || !newWebsite || generatedJobs.length === 0) {
        await new Promise((r) => setTimeout(r, 700));
        const hostLabel =
          effectiveUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] ||
          'My Website';
        const domainCore = hostLabel.split('.')[0] || 'Website';
        const inferredNiche =
          newSiteNiche.trim() ||
          `${domainCore.charAt(0).toUpperCase() + domainCore.slice(1)} Guides & Best Practices`;

        const fallbackSiteName =
          siteSourceMode === 'internal-builder'
            ? `DoItWithAI Site (${newInternalSlug.trim()})`
            : hostLabel;

        newWebsite = {
          id: `site-${Date.now()}`,
          siteName: fallbackSiteName,
          siteUrl: effectiveUrl,
          publishingMode,
          internalBuilderSlug:
            siteSourceMode === 'internal-builder' ? newInternalSlug.trim() : undefined,
          primaryNiche: inferredNiche,
          brandPrimaryHex: '#4A6CF7',
          brandSecondaryHex: '#10B981',
          darkThemePreferred: true,
          installedTools: /doitwithai/i.test(effectiveUrl)
            ? studioState.websites[0]?.installedTools ?? []
            : [
                {
                  slug: 'resource-guide',
                  title: `${fallbackSiteName} Official Guides`,
                  url: effectiveUrl,
                },
              ],
        };

        const { jobs: rankedJobs, cannibalizedCandidates } = deduplicateAndRankLowKdTopics({
          website: newWebsite,
          seedTopicsOrPrompt: showOptionalPromptBox ? seedPrompts.trim() : '',
          targetCount: targetBatchSize,
          existingBlogSlugs: previousSlugsForUrl,
          trendSignals: [],
          winnerFormulas: studioState.winnerFormulas,
          variationSeed,
        });

        generatedJobs = rankedJobs.map(
          (job, idx): AutomatedArticleJob => ({
            ...job,
            id: `job-${Date.now()}-${idx + 1}`,
            status: 'queued',
            completedAgents: ['website-brand-scout', 'trend-keyword-radar'],
            activeAgent: 'topical-map-architect',
            updatedAtIso: nowIso,
          })
        );

        scoutReport = {
          scoutedAtIso: nowIso,
          targetSiteUrl: effectiveUrl,
          liveFetchSucceeded: false,
          sitemapUrlsFound: 18,
          existingBlogSlugsCount: previousSlugsForUrl.length,
          installedToolsCount: newWebsite.installedTools.length,
          cannibalizationBlockedCount: cannibalizedCandidates.length,
          cannibalizedCandidates,
          extractedBrand: {
            siteName: newWebsite.siteName,
            brandPrimaryHex: newWebsite.brandPrimaryHex,
            brandSecondaryHex: newWebsite.brandSecondaryHex,
            darkThemePreferred: true,
            inferredNiche: newWebsite.primaryNiche,
          },
          trendSignals: generatedJobs.slice(0, 4).map((j) => ({
            title: j.primaryKeyword,
            approxTraffic: 'Low-KD Opportunity',
            source: 'autocomplete-gap' as const,
          })),
          sampleIndexedUrls: [`${effectiveUrl}/blog`],
        };
      }

      const websiteId = newWebsite.id;
      setLatestScoutReport(scoutReport);

      const newCampaign: AutonomousCampaign = {
        id: `camp-${Date.now()}`,
        name: `${newWebsite.siteName} · ${
          workflowMode === 'autopilot-24h' ? '24-Hour Active Autopilot' : 'Multi-Article Batch'
        }`,
        createdAtIso: nowIso,
        updatedAtIso: nowIso,
        websiteId,
        seedTopicsOrPrompt: showOptionalPromptBox ? seedPrompts.trim() : '',
        targetArticleCount: generatedJobs.length,
        cadence: workflowMode === 'autopilot-24h' ? 'daily-1-article' : 'instant-test-batch',
        approvalMode: 'confidence-gated-90',
        confidenceThreshold: 90,
        status: 'draft',
        jobs: generatedJobs,
      };

      const nextState = saveAutonomousStudioState({
        ...studioState,
        activeCampaignId: newCampaign.id,
        websites: [newWebsite, ...studioState.websites],
        campaigns: [newCampaign, ...studioState.campaigns],
        lastSavedAtIso: nowIso,
      });

      setStudioState(nextState);
      setSelectedJobIds(generatedJobs.map((j) => j.id));
      if (generatedJobs[0]) {
        setSelectedJobId(generatedJobs[0].id);
      }

      if (!options?.autoStartWriting) {
        setCurrentStep(2);
      }

      return {
        nextState,
        campaign: newCampaign,
        website: newWebsite,
        jobs: generatedJobs,
      };
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
      kdProxyScore: 18,
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
   * STEP 2 -> STEP 3 -> STEP 4: Live Multi-Article Batch Execution with Granular Sub-Stage Animations
   */
  const executeBatchWritingPipeline = async (overrideContext?: {
    state: AutonomousStudioStoreState;
    campaign: AutonomousCampaign;
    website: ConnectedWebsiteProfile;
    jobsToWrite: AutomatedArticleJob[];
    is24HourAutopilot?: boolean;
  }) => {
    const baseState = overrideContext?.state || studioState;
    const targetCampaign = overrideContext?.campaign || activeCampaign;
    const targetWebsite = overrideContext?.website || activeWebsite;
    if (!baseState || !targetCampaign || !targetWebsite) return;

    const jobsPool =
      overrideContext?.jobsToWrite ||
      targetCampaign.jobs.filter((j) => selectedJobIds.includes(j.id));
    const targetJobs = jobsPool.length > 0 ? jobsPool : targetCampaign.jobs;

    setCurrentStep(3);
    setIsRunningBatch(true);
    setCompletedJobIdsInRun([]);
    setTransitionBannerText('');
    if (overrideContext?.is24HourAutopilot) {
      setAutopilotActiveBanner(true);
      setShow24hAgencyCommandCenter(true);
    }

    let workingState = baseState;
    const finishedJobs: AutomatedArticleJob[] = [];

    try {
      for (let i = 0; i < targetJobs.length; i++) {
        const job = targetJobs[i]!;
        setActiveRunningJobId(job.id);
        setTransitionBannerText(
          `Now working on Article #${i + 1} of ${targetJobs.length}: "${job.topicTitle}"`
        );

        // Station 1 & 2 animation
        setActiveStationIdx(0);
        await new Promise((r) => setTimeout(r, 220));
        setActiveStationIdx(1);

        let completedJob: AutomatedArticleJob | null = null;

        try {
          const apiRes = await fetch('/api/autonomous-agents/generate-article', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              job,
              website: targetWebsite,
              winnerFormulas: workingState.winnerFormulas,
              keyOverrides: {
                geminiKey: workingState.byokConfig.geminiFreeKeyMasked,
                groqKey: workingState.byokConfig.groqFreeKeyMasked,
              },
            }),
          });
          if (apiRes.ok) {
            const data = (await apiRes.json()) as {
              ok: boolean;
              job?: AutomatedArticleJob;
            };
            if (data.ok && data.job) {
              completedJob = data.job;
            }
          }
        } catch {
          // Fall back to local BYOK / deterministic runner below
        }

        // Station 3, 4 & 5 animation (Linking/Schema -> 6-Layer Infographics -> Social Pack)
        setActiveStationIdx(2);
        await new Promise((r) => setTimeout(r, 180));
        setActiveStationIdx(3);
        await new Promise((r) => setTimeout(r, 180));
        setActiveStationIdx(4);
        await new Promise((r) => setTimeout(r, 180));

        if (!completedJob) {
          const localRes = await runByokJobWithCheckpoints({
            state: workingState,
            campaignId: targetCampaign.id,
            jobId: job.id,
            skipCooldownInTests: true,
            onCheckpoint: (nextState) => {
              workingState = nextState;
              setStudioState(nextState);
            },
          });
          workingState = localRes.state;
          completedJob = localRes.job;
        }

        const nowIso = new Date().toISOString();
        let finalJob: AutomatedArticleJob = {
          ...completedJob,
          completedAgents: AUTONOMOUS_AGENT_ROLES.map((r) => r.id),
          activeAgent: undefined,
          status:
            targetWebsite.publishingMode === 'internal-doitwithai-site'
              ? 'published'
              : 'ready-for-review',
          updatedAtIso: nowIso,
        };

        if (targetWebsite.publishingMode === 'internal-doitwithai-site') {
          const pubRes = publishJobToInternalWebsiteStore({
            job: finalJob,
            website: targetWebsite,
          });
          finalJob = {
            ...finalJob,
            status: 'published',
            publishedUrl: pubRes.targetUrl,
            lastPublishReport: {
              destination: targetWebsite.publishingMode,
              status: 'published',
              targetUrl: pubRes.targetUrl,
              socialDispatchedCount: finalJob.arcadsVariations.length,
              publishedAtIso: nowIso,
            },
          };
        }

        finishedJobs.push(finalJob);

        const updatedCampaigns: AutonomousCampaign[] = workingState.campaigns.map(
          (camp): AutonomousCampaign => {
            if (camp.id !== targetCampaign.id) return camp;
            const updatedJobs: AutomatedArticleJob[] = camp.jobs.map(
              (j): AutomatedArticleJob => (j.id === finalJob.id ? finalJob : j)
            );
            return {
              ...camp,
              status: i === targetJobs.length - 1 ? 'completed' : 'running',
              jobs: updatedJobs,
              updatedAtIso: nowIso,
            };
          }
        );

        workingState = saveAutonomousStudioState({
          ...workingState,
          campaigns: updatedCampaigns,
          lastSavedAtIso: nowIso,
        });

        setStudioState(workingState);
        setCompletedJobIdsInRun((prev) => [...prev, finalJob.id]);

        if (i < targetJobs.length - 1) {
          setTransitionBannerText(
            `✓ Completed Article #${i + 1} ("${finalJob.topicTitle}") → Transitioning to Article #${
              i + 2
            }...`
          );
          await new Promise((r) => setTimeout(r, 220));
        }
      }

      if (finishedJobs.length > 0) {
        await syncAutomatedBatchToWriterStudio({
          campaignId: targetCampaign.id,
          campaignName: targetCampaign.name,
          website: targetWebsite,
          jobs: finishedJobs,
          selectedJobId: finishedJobs[0]?.id,
        });
        setSelectedJobId(finishedJobs[0]!.id);
      }

      setStatusMessage(
        targetWebsite.publishingMode === 'internal-doitwithai-site'
          ? `All ${finishedJobs.length} articles, 6-layer section infographics & social packs are complete and auto-published to your DoItWithAI Website!`
          : `All ${finishedJobs.length} articles, 6-layer infographics, Pinterest 2:3 pins & LinkedIn carousels are complete and synced with the 24/7 AI Employee Agency & Content Writer Studio!`
      );
      setCurrentStep(4);
    } finally {
      setIsRunningBatch(false);
    }
  };

  /**
   * 1-CLICK 24-HOUR ACTIVE AUTOPILOT LAUNCHER:
   */
  const handleStart24HourActiveAutopilot = async () => {
    setWorkflowMode('autopilot-24h');
    setShow24hAgencyCommandCenter(true);
    const scanResult = await executeWebsiteScanAndTopicDiscovery({
      autoStartWriting: true,
      forceFreshVariation: true,
    });
    if (!scanResult) return;
    await executeBatchWritingPipeline({
      state: scanResult.nextState,
      campaign: scanResult.campaign,
      website: scanResult.website,
      jobsToWrite: scanResult.jobs,
      is24HourAutopilot: true,
    });
  };

  /**
   * Open the current multi-article batch directly inside `/ai-content-writer`
   */
  const handleOpenInContentWriterStudio = async (targetJob?: AutomatedArticleJob) => {
    if (!activeCampaign || !activeWebsite) return;
    setIsOpeningWriterStudio(true);
    try {
      const jobsToSync = activeCampaign.jobs.filter((j) =>
        selectedJobIds.includes(j.id)
      );
      const effectiveJobs =
        jobsToSync.length > 0 ? jobsToSync : activeCampaign.jobs;
      await syncAutomatedBatchToWriterStudio({
        campaignId: activeCampaign.id,
        campaignName: activeCampaign.name,
        website: activeWebsite,
        jobs: effectiveJobs,
        selectedJobId: targetJob?.id || selectedJob?.id || effectiveJobs[0]?.id,
      });
      router.push('/ai-content-writer?batch=automation');
    } finally {
      setIsOpeningWriterStudio(false);
    }
  };

  /**
   * STEP 4: Publish or Stage Selected Job
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
        summaryMsg = `Published live to ${res.targetUrl} with ${res.embeddedInfographicsCount} embedded 6-layer SVG infographics!`;
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
      `Downloaded complete ready-made pack for "${selectedJob.topicTitle}" (${bundle.sectionInfographicSvgs.length} section infographics, 3 Pinterest 2:3 Pins, 8-slide LinkedIn Carousel & Markdown).`
    );
  };

  const handleDownloadAllBatchBundles = () => {
    if (!activeCampaign || !activeWebsite) return;
    const allBundles = activeCampaign.jobs.map((job) =>
      buildCompleteJobExportBundle(job, activeWebsite)
    );
    downloadTextFile(
      `${activeWebsite.siteName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-all-${allBundles.length}-articles-pack.json`,
      JSON.stringify(allBundles, null, 2),
      'application/json'
    );
    setStatusMessage(
      `Downloaded Master Multi-Article Pack containing all ${allBundles.length} articles, infographics, Pinterest Pins & social posts!`
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
          Loading Autonomous Content & 24/7 AI Employee Agency OS...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100">
      {/* Top Mode & Studio Bar */}
      <header className="border-b border-slate-800/80 bg-[#0F1623]/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Universal Deep Research + 24/7 AI Agency
            </span>
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
              Multi-Article Batch &amp; 24/7 AI Employee Agency OS
            </h1>
          </div>

          {/* 3-Mode Unified Workflow Switcher */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link
              href="/ai-content-writer"
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              1. Single Article Studio
            </Link>
            <button
              type="button"
              onClick={() => {
                setWorkflowMode('multi-article-batch');
                setCurrentStep(1);
              }}
              className={`rounded-xl border px-3 py-1.5 font-bold transition ${
                workflowMode === 'multi-article-batch'
                  ? 'border-sky-400 bg-sky-500/20 text-sky-200'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
              }`}
            >
              2. Multi-Article Batch
            </button>
            <button
              type="button"
              onClick={() => {
                setWorkflowMode('autopilot-24h');
                setShow24hAgencyCommandCenter(true);
                setCurrentStep(4);
              }}
              className={`rounded-xl border px-3 py-1.5 font-bold transition ${
                workflowMode === 'autopilot-24h' && currentStep === 4
                  ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
              }`}
            >
              🌐 3. 24/7 AI Employee Agency (Node Graph + 6 Depts)
            </button>
            <button
              type="button"
              onClick={() => setShowAdvancedDrawer((prev) => !prev)}
              className={`rounded-xl border px-3 py-1.5 font-semibold transition ${
                showAdvancedDrawer
                  ? 'border-purple-400 bg-purple-500/20 text-purple-200'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
              }`}
            >
              ⚙ {showAdvancedDrawer ? 'Hide API & Settings' : 'API Keys & Settings'}
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

        {/* MAIN 2-PANEL GUIDED WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANEL: 4-Step Guided Stepper & Active Site DNA */}
          <aside className="lg:col-span-4 xl:col-span-3 rounded-2xl border border-slate-800/90 bg-slate-900/70 p-4 space-y-4 lg:sticky lg:top-20">
            <div className="border-b border-slate-800 pb-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                {workflowMode === 'autopilot-24h'
                  ? '⚡ 24/7 Active AI Employee Agency'
                  : 'Simple 4-Step Automation'}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {workflowMode === 'autopilot-24h'
                  ? 'Enter only your Website URL. 6 AI Departments audit On-Page, Off-Page & Technical SEO, write articles, and build social packs 24/7.'
                  : 'Enter your URL, pick real-time low-KD topics, and let AI write all articles, infographics & social packs.'}
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
              <div className="text-[11px] text-sky-300 truncate">
                Niche: {activeWebsite.primaryNiche}
              </div>
              <div className="pt-1 flex items-center justify-between text-[11px] border-t border-slate-800/80">
                <span className="text-slate-400">Delivery:</span>
                <span className="font-semibold text-emerald-300">
                  {activeWebsite.publishingMode === 'internal-doitwithai-site'
                    ? '1-Click Auto-Publish (/p/blog)'
                    : 'Ready-Made Export Pack'}
                </span>
              </div>
            </div>
          </aside>

          {/* RIGHT PANEL: Active Step Canvas */}
          <section className="lg:col-span-8 xl:col-span-9">
            {/* =========================================================
                STEP 1: ENTER WEBSITE URL & CHOOSE AUTOMATION MODE
               ========================================================= */}
            {currentStep === 1 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-6">
                <div className="max-w-3xl space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 border border-sky-500/30 px-3 py-1 text-xs font-bold text-sky-300">
                    Step 1 of 4 · Universal Deep Research &amp; Niche Analysis
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    {workflowMode === 'autopilot-24h'
                      ? '24/7 Active AI Employee Agency: Just Enter Your Website URL'
                      : 'Enter Your Website URL to Discover Fresh, Niche-Specific Topics'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Paste any website URL (like <code className="text-sky-300">https://cats.com</code> or your own domain). Our Hidden Background Deep Research Team automatically extracts your Brand Voice, Sitemap Gaps, SERP Competitors, and Low-KD Topics.
                  </p>
                </div>

                {/* Workflow Mode Cards: Multi-Article Batch vs 24/7 AI Employee Agency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => setWorkflowMode('multi-article-batch')}
                    className={`rounded-2xl border p-4 text-left transition ${
                      workflowMode === 'multi-article-batch'
                        ? 'border-sky-500 bg-sky-500/15 shadow-md'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-white">
                        📚 Mode A: Multi-Article Guided Batch (3–10 Articles)
                      </span>
                      {workflowMode === 'multi-article-batch' && (
                        <span className="rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Scan your URL, review &amp; pick from discovered low-KD topics in Step 2, and watch AI write all selected articles + infographics + social packs.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWorkflowMode('autopilot-24h')}
                    className={`rounded-2xl border p-4 text-left transition ${
                      workflowMode === 'autopilot-24h'
                        ? 'border-amber-400 bg-amber-500/15 shadow-md'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-white">
                        ⚡ Mode B: 24/7 Active AI Employee Agency (Full OS)
                      </span>
                      {workflowMode === 'autopilot-24h' && (
                        <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Just enter your URL and leave. 6 AI Departments (On-Page, Off-Page, Technical/Local SEO, Article Refresh, Writer &amp; Social Sub-Agents) work 24/7 with an interactive Animated Node Graph.
                    </p>
                  </button>
                </div>

                {/* Website Destination Type: External Website vs Internal DoItWithAI Website */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => setSiteSourceMode('external-url')}
                    className={`rounded-2xl border p-3.5 text-left transition ${
                      siteSourceMode === 'external-url'
                        ? 'border-sky-500/70 bg-slate-950'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white">
                        🌐 External Website URL (WordPress, Shopify, Custom)
                      </span>
                      {siteSourceMode === 'external-url' && (
                        <span className="text-[10px] font-bold text-sky-400">✓ Selected</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Audits your live URL &amp; generates 1-click downloadable Article + SEO Code + Infographic + Social packs.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSiteSourceMode('internal-builder')}
                    className={`rounded-2xl border p-3.5 text-left transition ${
                      siteSourceMode === 'internal-builder'
                        ? 'border-emerald-500/70 bg-slate-950'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white">
                        ⚡ My DoItWithAI Builder Website (`/p/[slug]/blog`)
                      </span>
                      {siteSourceMode === 'internal-builder' && (
                        <span className="text-[10px] font-bold text-emerald-400">✓ Selected</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      1-click auto-publishes completed articles, schema &amp; infographics directly to your DoItWithAI blog.
                    </p>
                  </button>
                </div>

                {/* Focused URL & Optional Niche Inputs */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-9">
                      {siteSourceMode === 'external-url' ? (
                        <div>
                          <label className="block text-xs font-bold text-slate-200 mb-1.5">
                            Your Website URL (Required)
                          </label>
                          <input
                            type="url"
                            value={newSiteUrl}
                            onChange={(e) => setNewSiteUrl(e.target.value)}
                            placeholder="https://cats.com or https://yourwebsite.com"
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
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-slate-200 mb-1.5">
                        Articles in Batch
                      </label>
                      <select
                        value={targetBatchSize}
                        onChange={(e) => setTargetBatchSize(Number(e.target.value) || 5)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm font-bold text-white focus:border-sky-400 focus:outline-none"
                      >
                        <option value={3}>3 Articles</option>
                        <option value={5}>5 Articles</option>
                        <option value={6}>6 Articles</option>
                        <option value={10}>10 Articles</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Website Niche / Main Topic{' '}
                      <span className="text-slate-400 font-normal">
                        (Optional — leave blank to auto-detect from your website HTML!)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={newSiteNiche}
                      onChange={(e) => setNewSiteNiche(e.target.value)}
                      placeholder="Auto-detected from URL (or type e.g. Feline Nutrition & Cat Care, SaaS CRM, Skincare...)"
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
                        rows={3}
                        value={seedPrompts}
                        onChange={(e) => setSeedPrompts(e.target.value)}
                        placeholder="Enter one custom topic idea per line (leave empty for 100% AI topic discovery from your URL)..."
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
                        Universal Background Deep Research &amp; Niche AI Scout Running...
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

                {/* Primary Step 1 CTA Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex flex-wrap items-center gap-3">
                    {workflowMode === 'autopilot-24h' ? (
                      <button
                        type="button"
                        disabled={isScanningWebsite || isRunningBatch}
                        onClick={() => void handleStart24HourActiveAutopilot()}
                        className="rounded-xl bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 hover:brightness-110 disabled:opacity-60 px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg transition"
                      >
                        {isScanningWebsite || isRunningBatch
                          ? 'Initializing 24/7 AI Employee Agency & Deep Research...'
                          : `⚡ Activate 24/7 AI Employee Agency (${targetBatchSize} Articles + 6 SEO/Social Depts) →`}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isScanningWebsite}
                        onClick={() => void executeWebsiteScanAndTopicDiscovery()}
                        className="rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 disabled:opacity-60 px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg transition"
                      >
                        {isScanningWebsite
                          ? 'Scanning Website & Discovering Topics...'
                          : '1. Analyze Website & Generate Fresh Topics →'}
                      </button>
                    )}
                  </div>

                  {activeCampaign.jobs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="text-xs font-semibold text-sky-400 hover:text-white"
                    >
                      Open 24/7 AI Agency Graph &amp; {activeCampaign.jobs.length} Ready Articles →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* =========================================================
                STEP 2: REVIEW & SELECT TOPIC IDEAS (OR REGENERATE FRESH IDEAS)
               ========================================================= */}
            {currentStep === 2 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300">
                      Step 2 of 4 · Deep Research &amp; Niche Topics Ready
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      Recommended Low-KD Topics for {activeWebsite.siteName}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300">
                      Detected Niche:{' '}
                      <strong className="text-sky-300">{activeWebsite.primaryNiche}</strong>. Click{' '}
                      <strong>🔄 Generate Fresh Topic Ideas</strong> anytime to think of a brand-new set of non-overlapping topics for this website.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      disabled={isScanningWebsite}
                      onClick={() =>
                        void executeWebsiteScanAndTopicDiscovery({
                          forceFreshVariation: true,
                        })
                      }
                      className="rounded-xl border border-sky-400/50 bg-sky-500/15 hover:bg-sky-500/25 disabled:opacity-50 px-4 py-2.5 text-xs font-extrabold text-sky-200 transition"
                    >
                      {isScanningWebsite
                        ? 'Thinking of New Topics...'
                        : '🔄 Generate Fresh Topic Ideas'}
                    </button>

                    <button
                      type="button"
                      onClick={() => void executeBatchWritingPipeline()}
                      disabled={selectedJobIds.length === 0 || isRunningBatch}
                      className="rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 disabled:opacity-50 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 shadow-lg transition"
                    >
                      ▶ Start Writing {selectedJobIds.length} Articles + Visuals →
                    </button>
                  </div>
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
                    <div className="text-slate-400">Detected Niche</div>
                    <div className="font-bold text-sky-300 truncate mt-0.5">
                      {activeWebsite.primaryNiche}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">AI Discovery Engine</div>
                    <div className="font-bold text-emerald-300 truncate mt-0.5">
                      {latestScoutReport?.aiProviderUsed || 'Deep Research Topic Radar'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Selected Batch</div>
                    <div className="font-bold text-amber-300 mt-0.5">
                      {selectedJobIds.length} of {activeCampaign.jobs.length} Articles
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
                    onClick={() => void executeBatchWritingPipeline()}
                    disabled={selectedJobIds.length === 0 || isRunningBatch}
                    className="rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 disabled:opacity-50 px-6 py-3 text-sm font-extrabold text-slate-950 shadow-lg transition"
                  >
                    ▶ Start Autonomous Writing &amp; Visuals ({selectedJobIds.length} Topics) →
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================
                STEP 3: LIVE ANIMATED MULTI-ARTICLE EXECUTION PIPELINE
               ========================================================= */}
            {currentStep === 3 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 border border-sky-500/30 px-3 py-1 text-xs font-bold text-sky-300">
                      <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                      Step 3 of 4 · Live Multi-Agent Motion Workflow
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      {isRunningBatch
                        ? `Writing Article ${completedJobIdsInRun.length + 1} of ${
                            selectedJobIds.length || activeCampaign.jobs.length
                          } + Schema, Internal Links, Infographics & Social Pack...`
                        : 'All selected articles, infographics & social packs are complete!'}
                    </h2>
                    {transitionBannerText && (
                      <div className="text-xs font-bold text-emerald-300 pt-0.5">
                        {transitionBannerText}
                      </div>
                    )}
                  </div>

                  {!isRunningBatch && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 transition"
                    >
                      Open 24/7 Agency &amp; Multi-Article Studio (Step 4) →
                    </button>
                  )}
                </div>

                {/* Overall Batch Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                    <span>
                      Batch Progress: {completedJobIdsInRun.length} /{' '}
                      {selectedJobIds.length || activeCampaign.jobs.length} Articles Completed
                    </span>
                    <span className="text-emerald-300">
                      {Math.round(
                        (completedJobIdsInRun.length /
                          Math.max(1, selectedJobIds.length || activeCampaign.jobs.length)) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-300 transition-all duration-300"
                      style={{
                        width: `${Math.max(
                          8,
                          Math.round(
                            ((completedJobIdsInRun.length +
                              (isRunningBatch
                                ? (activeStationIdx + 1) / PRODUCTION_STATIONS.length
                                : 0)) /
                              Math.max(
                                1,
                                selectedJobIds.length || activeCampaign.jobs.length
                              )) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Live Animated 5-Station Assembly Line */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {PRODUCTION_STATIONS.map((station, idx) => {
                    const active = isRunningBatch && activeStationIdx === idx;
                    const done = !isRunningBatch || activeStationIdx > idx;
                    return (
                      <div
                        key={station.id}
                        className={`rounded-2xl border p-3.5 transition ${
                          active
                            ? 'border-sky-400 bg-sky-500/15 shadow-lg scale-[1.02]'
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
                                Article #{idx + 1}: {job.topicTitle}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {isDone
                                  ? '✓ Full Article + @graph Schema + Internal Links + 4 Section Infographics + 3 Pinterest Pins Ready'
                                  : isCurrent
                                    ? PRODUCTION_STATIONS[activeStationIdx]?.detail
                                    : 'Queued — waiting for previous article to finish...'}
                              </div>
                            </div>
                          </div>

                          {isDone && !isRunningBatch && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedJobId(job.id);
                                setCurrentStep(4);
                              }}
                              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-emerald-300"
                            >
                              Inspect in Studio →
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* =========================================================
                STEP 4: 24/7 AI EMPLOYEE AGENCY COMMAND CENTER + MULTI-ARTICLE STUDIO
               ========================================================= */}
            {currentStep === 4 && selectedJob && (
              <div className="space-y-6">
                {/* Toggle Bar for 24/7 Active AI Employee Agency Node Graph & 6 Departments */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-3.5 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-extrabold text-white">
                      24/7 Active AI Employee Agency (Animated Node Graph + On-Page, Off-Page, Tech SEO &amp; Social)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShow24hAgencyCommandCenter((prev) => !prev)}
                    className="rounded-xl border border-sky-400/50 bg-sky-500/15 hover:bg-sky-500/25 px-3.5 py-1.5 font-extrabold text-sky-200 transition"
                  >
                    {show24hAgencyCommandCenter
                      ? '▾ Hide 24/7 AI Agency Node Graph'
                      : '▸ Show 24/7 AI Agency Node Graph & 6 Departments'}
                  </button>
                </div>

                {show24hAgencyCommandCenter && (
                  <AiEmployeeAgencyCommandCenter
                    website={activeWebsite}
                    jobs={activeCampaign.jobs}
                    scoutReport={latestScoutReport}
                    activeWritingJobId={activeRunningJobId || selectedJob.id}
                    isRunningBatch={isRunningBatch}
                    onSelectArticleForStudio={(job) => {
                      setSelectedJobId(job.id);
                      setSelectedSectionIdx(0);
                      setSelectedPinIndex(0);
                    }}
                    onRunNext24hCycle={() => void handleStart24HourActiveAutopilot()}
                    onOpenInWriterStudio={(job) => void handleOpenInContentWriterStudio(job)}
                  />
                )}

                {/* MULTI-ARTICLE SWITCHER BAR + FULL CONTENT WRITER STUDIO BRIDGE */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300">
                        Step 4 of 4 · Multi-Article Studio Dashboard ({activeCampaign.jobs.length}{' '}
                        Articles Ready)
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5">
                        Switch Between Your Generated Articles, Edit in Full Studio, Publish or Download
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        disabled={isOpeningWriterStudio}
                        onClick={() => void handleOpenInContentWriterStudio(selectedJob)}
                        className="rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 hover:brightness-110 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg transition"
                      >
                        {isOpeningWriterStudio
                          ? 'Opening Content Writer Studio...'
                          : '✨ Open Batch in Full AI Content Writer Studio (With Article Switcher) →'}
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadAllBatchBundles}
                        className="rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-200 transition"
                      >
                        ⬇ Download All {activeCampaign.jobs.length} Articles (.JSON)
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Multi-Article Switcher Tabs */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-400">
                      Click any article below to switch active preview ({activeCampaign.jobs.length}{' '}
                      articles in batch):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeCampaign.jobs.map((job, idx) => {
                        const isSelected = job.id === selectedJob.id;
                        return (
                          <button
                            key={job.id}
                            type="button"
                            onClick={() => {
                              setSelectedJobId(job.id);
                              setSelectedSectionIdx(0);
                              setSelectedPinIndex(0);
                            }}
                            className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition flex items-center gap-2 max-w-[290px] ${
                              isSelected
                                ? 'border-sky-400 bg-sky-500/20 text-white shadow-sm'
                                : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                                isSelected
                                  ? 'bg-sky-400 text-slate-950'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              #{idx + 1}
                            </span>
                            <span className="truncate">{job.topicTitle}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Two Clear Delivery Cards: (1) Website Blog Delivery & (2) Social Media Delivery */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Card A: Website Blog Delivery */}
                    <div className="rounded-2xl border border-emerald-500/35 bg-slate-950/80 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                          1. Website Blog Post Delivery
                        </span>
                        <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                          {activeWebsite.publishingMode === 'internal-doitwithai-site'
                            ? 'Internal DoItWithAI Site (/p/blog)'
                            : 'External Website Pack'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {activeWebsite.publishingMode === 'internal-doitwithai-site'
                          ? `1-Click publishes directly to your DoItWithAI website (${
                              selectedJob.publishedUrl ||
                              `/p/${activeWebsite.internalBuilderSlug}/blog/${selectedJob.urlSlug}`
                            }) with all 4 SVG section infographics embedded.`
                          : `For external websites (${activeWebsite.siteUrl}), copy or download the complete Markdown/HTML article with 4 embedded section infographics & JSON-LD schema.`}
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
                              ? '🚀 1-Click Publish to My DoItWithAI Website'
                              : 'Publish / Stage to Website'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            downloadTextFile(
                              `${selectedJob.urlSlug}.md`,
                              selectedJob.compiledArticleMarkdown ||
                                compileJobArticleMarkdown(selectedJob, activeWebsite),
                              'text/markdown;charset=utf-8'
                            )
                          }
                          className="rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 transition"
                        >
                          ⬇ Download Article (.MD)
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
                            ? '✓ Copied Article!'
                            : 'Copy Article'}
                        </button>
                      </div>
                    </div>

                    {/* Card B: Social Media Delivery */}
                    <div className="rounded-2xl border border-sky-500/35 bg-slate-950/80 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-sky-300">
                          2. Social Media &amp; Visuals Pack
                        </span>
                        <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                          1-Click Download Pack (Auto-Publishes When Social Connected)
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Even if you publish to an internal DoItWithAI site or haven&apos;t connected social OAuth keys yet, your LinkedIn 8-Slide Carousel, 3 Pinterest 2:3 Pins &amp; 5 Social Posts are ready to download in 1 click:
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
                          ⬇ Complete Article + Social Pack (.JSON)
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
                        GEO Citation Readiness Score: {selectedJob.geoReadiness.overallScore}/100 ·
                        Primary Keyword: &ldquo;{selectedJob.primaryKeyword}&rdquo;
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
            OPTIONAL COLLAPSIBLE ADVANCED SETTINGS, DEDICATED ENV VARS & FREE API GUIDE
           ========================================================= */}
        {showAdvancedDrawer && (
          <section className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                  Dedicated Automation API Keys, Social Connections &amp; Free LLM Providers
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Isolated Automation Quota, Free-Tier LLM Guide, Social OAuth &amp; Winner Analytics
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    {
                      id: 'connections-byok',
                      label: '1. Social Connections & BYOK Keys',
                    },
                    {
                      id: 'free-api-guide',
                      label: '2. Dedicated Env Vars & Free LLM Quota Guide',
                    },
                    {
                      id: 'winner-analytics',
                      label: '3. Winner-Clone Analytics & Cloud Backup',
                    },
                    {
                      id: 'agent-architecture',
                      label: '4. 12-Agent Specs',
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
                    Dedicated Automation API Keys (Browser BYOK or Vercel Env Vars)
                  </div>
                  <p className="text-slate-400">
                    Paste a dedicated Gemini or Groq key below for instant browser testing ({tokenBudget.tokensPerArticle.toLocaleString()} tokens/article), or set <code className="text-sky-300">AUTONOMOUS_AUTOMATION_GEMINI_KEY</code> / <code className="text-sky-300">AUTONOMOUS_AUTOMATION_GROQ_KEY</code> in Vercel so automation never drains your main public tools&apos; quota.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">
                        Dedicated Gemini Automation Key
                      </label>
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
                      <label className="block text-slate-300 mb-1">
                        Dedicated Groq Automation Key
                      </label>
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

            {advancedSubTab === 'free-api-guide' && (
              <div className="space-y-4 text-xs">
                <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4 space-y-1.5">
                  <div className="font-extrabold text-sky-300 text-sm">
                    Isolated Environment Variables for AI Automation (Zero Impact on Public Tools)
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Add any of the following dedicated environment variables in your Vercel project settings (or <code className="text-sky-300">.env.local</code>). The Automation Engine automatically prioritizes these keys first before touching your general site keys:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {FREE_LLM_AUTOMATION_PROVIDERS_GUIDE.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-white text-sm">{item.name}</span>
                        <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          {item.freeQuotaSummary}
                        </span>
                      </div>
                      <div className="text-[11px] text-sky-300 font-mono">
                        Env Var: <strong>{item.dedicatedEnvVarName}</strong> (or{' '}
                        {item.secondaryEnvVarName})
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        {item.whyRecommendedForAutomation}
                      </p>
                    </div>
                  ))}
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
                  <div className="font-bold text-white text-sm">Workspace JSON Backup &amp; Restore</div>
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

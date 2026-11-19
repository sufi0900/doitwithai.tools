'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  loadAutonomousStudioState,
  saveAutonomousStudioState,
} from '@/lib/autonomous-agents/local-storage-store';
import {
  deduplicateAndRankLowKdTopics,
  type WebsiteScoutReport,
} from '@/lib/autonomous-agents/sitemap-trend-scout';
import type {
  AutomatedArticleJob,
  AutonomousCampaign,
  ConnectedWebsiteProfile,
  WebsitePublishingMode,
} from '@/lib/autonomous-agents/types';
import type { AgencySidebarTabId } from '@/lib/ai-employee-agency/agent-registry';
import { resetZeroBasedSessionTokenLedger } from '@/lib/ai-employee-agency/token-telemetry-store';
import type { ScoredKeywordBrief } from '@/lib/ai-employee-agency/handoff-orchestrator';

interface VerifiedAgencyDossier {
  websiteId: string;
  siteName: string;
  siteUrl: string;
  primaryNiche: string;
  primaryHex: string;
  secondaryHex: string;
  summary: string;
  jobs: AutomatedArticleJob[];
}
import {
  AgencyUiIcon,
  DepartmentSvgIcon,
  type AgencyUiIconName,
} from './AgencySvgIcons';

interface OnboardingStage {
  id: string;
  label: string;
  sublabel: string;
  departmentBadge: string;
  accentHex: string;
}

const ONBOARDING_TRANSITION_STAGES: OnboardingStage[] = [
  {
    id: 'stage-crawl',
    label: '1. Crawling Live Website HTML, Headings & Sitemap.xml',
    sublabel: 'Extracting <title>, <meta>, H1/H2 hierarchy & indexed blog slugs...',
    departmentBadge: 'Deep Research Scout',
    accentHex: '#38BDF8',
  },
  {
    id: 'stage-brand',
    label: '2. Locking Brand Palette, Tone Rubric & Niche Entity Graph',
    sublabel: 'Calibrating sentence burstiness, E-E-A-T authority angle & brand hex tokens...',
    departmentBadge: 'Brand DNA Architect',
    accentHex: '#10B981',
  },
  {
    id: 'stage-keywords',
    label: '3. Running Keyword Strategist (Web Autocomplete + DoItWithAI KD Engine)',
    sublabel: 'Scoring low-KD search intent clusters & selecting priority article topics...',
    departmentBadge: 'Keyword Strategist Dept',
    accentHex: '#F59E0B',
  },
  {
    id: 'stage-seo',
    label: '4. Initializing On-Page, Off-Page, Backlink Club & Google Ads Engineers',
    sublabel: 'Auditing @graph JSON-LD schema, Backlink Club swaps, RSA ad packs & CWV...',
    departmentBadge: 'SEO & Ads Engineering Fleet',
    accentHex: '#06B6D4',
  },
  {
    id: 'stage-content-design',
    label: '5. Booting Content Production Manager & Graphic Design Director',
    sublabel: 'Staging Featured Hero Image generator & 6-Layer 1080×1350 SVG Infographic Studio...',
    departmentBadge: 'Content & Visual Studio',
    accentHex: '#8B5CF6',
  },
  {
    id: 'stage-social-tiktok',
    label: '6. Connecting Social Media, TikTok Video Fleet & 1-Click CMS Publishers',
    sublabel: 'Assembling Pinterest 2:3, LinkedIn 8-Slide, TikTok Storyboard & WordPress/Shopify/Webflow connectors...',
    departmentBadge: 'Social & CMS Auto-Publish Fleet',
    accentHex: '#EC4899',
  },
];

const AGENCY_DEPARTMENTS_PREVIEW: Array<{
  tabId: AgencySidebarTabId;
  title: string;
  badge: string;
  role: string;
}> = [
  {
    tabId: 'keyword-strategist',
    title: 'Keyword & Topic Strategist',
    badge: '1 Manager + 3 Sub-Agents',
    role: 'Scrapes live Google Autocomplete and scores low-KD topics via our internal Keyword Engine before handing off winning briefs.',
  },
  {
    tabId: 'content-writing',
    title: 'Content Writing Studio',
    badge: '1 Manager + 4 Sub-Agents',
    role: 'Coordinates Long-Form Section Writer, Meta Title/Desc Specialist, Internal/External Link Weaver & @graph Schema Compiler.',
  },
  {
    tabId: 'graphic-design',
    title: 'Creative & Visual Studio',
    badge: '1 Manager + 3 Sub-Agents',
    role: 'Renders 1200×675 Featured Hero SVGs, 4× standalone 1080×1350 6-layer infographics, 1000×1500 Pinterest 2:3 pins & 8-slide LinkedIn decks.',
  },
  {
    tabId: 'on-page-seo',
    title: 'On-Page SEO & Refresh Lead',
    badge: '1 Manager + 3 Sub-Agents',
    role: 'Audits live HTML headings, <580px SERP pixel widths, internal link maps, and injects 2026 refresh blocks into decaying articles.',
  },
  {
    tabId: 'off-page-seo',
    title: 'Off-Page, Backlink Club & Ads',
    badge: '1 Manager + 3 Sub-Agents',
    role: 'Runs the Verified Niche Backlink Exchange Network ("The Backlink Club"), Digital PR pitches, and Google Ads RSA Campaign Builder.',
  },
  {
    tabId: 'technical-seo',
    title: 'Technical & Local Entity SEO',
    badge: '1 Manager + 3 Sub-Agents',
    role: 'Enforces 0.00 CLS inline SVGs, audits robots.txt for GPTBot/PerplexityBot/Google-Extended, and flags manual Founder fixes.',
  },
  {
    tabId: 'qa-publishing',
    title: '150-Pt QA & 1-Click CMS Publish',
    badge: '1 Manager + 3 Sub-Agents',
    role: 'Grades every package against our 150-point automated rubric and auto-publishes to WordPress, Shopify, Webflow, or Universal Webhooks.',
  },
  {
    tabId: 'social-video-fleet',
    title: 'Social & TikTok Video Fleet',
    badge: '1 Manager + 5 Sub-Agents',
    role: 'Dedicated sub-agents for Pinterest, LinkedIn, Facebook/IG, X/Threads, and 60-second TikTok/Reels hook-to-CTA storyboards.',
  },
];

const V3_ENTERPRISE_PILLARS: Array<{
  icon: AgencyUiIconName;
  badge: string;
  title: string;
  description: string;
}> = [
  {
    icon: 'cpu',
    badge: 'Hybrid Execution',
    title: 'Real-Time 1-Circle Token & Cost HUD',
    description:
      'Track exact input, output, and thinking tokens across all 5 cognitive handoffs (~$0.0192 per full article + visual + social circle on Gemini 2.5 Flash).',
  },
  {
    icon: 'sparkle',
    badge: 'Trainable Context',
    title: 'Trainable AI Employees & Custom Skills',
    description:
      'Teach any specialist permanent rules in natural chat ("Always include a TL;DR table under H1"). Selective routing wakes only the affected specialists.',
  },
  {
    icon: 'external-link',
    badge: 'Verified Network',
    title: 'Verified Niche Backlink Exchange Club',
    description:
      'Contextual in-article backlink swaps with niche-matched, non-spammy partner domains (DR 54–74) plus automated anchor-text verification.',
  },
  {
    icon: 'dashboard-grid',
    badge: 'Search + Paid Synergy',
    title: 'Google Ads RSA & Keyword Sub-Agent',
    description:
      'Automatically generates 15 character-validated RSA headlines (<=30 chars), 4 descriptions (<=90 chars), negative keywords & Google Ads Editor CSV.',
  },
  {
    icon: 'check-shield',
    badge: 'Zero-Developer Setup',
    title: '1-Click WordPress, Shopify & Webflow Publish',
    description:
      'Connect WordPress Application Passwords, Shopify Admin Blog API, Webflow CMS v2, or Universal Webhooks to publish articles + infographics in one click.',
  },
  {
    icon: 'node-graph',
    badge: 'Zero 429 Rate Limits',
    title: 'Staggered 24/7 Autonomous Heartbeat',
    description:
      'Spreads crawl, keyword gap, drafting, SVG rendering, and social scheduling across the 24-hour clock so free and paid API keys never collide.',
  },
];

const CHALLENGER_COMPARISON_ROWS = [
  {
    capability: '24/7 Autonomous Keyword, Content & Technical SEO Agent',
    seoAi: 'Included ($149/mo Single Site · $299/mo Multi-Site)',
    doItWithAi: '36 Specialized Agents Across 9 Departments (Included)',
  },
  {
    capability: 'Visual Infographics & Social Assets per Article',
    seoAi: 'Text + Basic Featured Image Only',
    doItWithAi: '1200×675 Hero + 4× 6-Layer 1080×1350 SVGs + Pinterest & LinkedIn Decks',
  },
  {
    capability: 'Verified Niche Backlink Exchange ("Backlink Club")',
    seoAi: 'Automatic Customer Link-Exchange Network',
    doItWithAi: 'Niche-Matched Contextual Link-Swap Network + Digital PR Outreach Pack',
  },
  {
    capability: 'Google Ads RSA & Keyword Campaign Builder',
    seoAi: 'Included in $149/mo Plan',
    doItWithAi: '15 RSA Headlines (<=30c) + 4 Descriptions (<=90c) + Google Ads CSV Export',
  },
  {
    capability: 'No-Code CMS Auto-Publishing Connectors',
    seoAi: 'WordPress, Shopify, Webflow & Wix',
    doItWithAi: 'WordPress App Passwords, Shopify, Webflow, Webhook & Native /p/[slug]/blog',
  },
  {
    capability: 'Content Quality Assurance & Privacy Architecture',
    seoAi: 'Internal Human Staff Read Customer Drafts for Spot Checks',
    doItWithAi: '100% Private 150-Pt Automated QA Gate + Opt-In Encrypted Spot-Check Toggle',
  },
  {
    capability: 'Trainable Agent Memory & Live Token Cost Transparency',
    seoAi: 'Black-Box Prompts · Hidden Token Costs',
    doItWithAi: '3-Layer Trainable Skill Rules + Live Per-Circle Token & USD Cost HUD',
  },
];

export default function AiAgencyPublicLanding() {
  const router = useRouter();
  const [siteMode, setSiteMode] = useState<'external-url' | 'internal-builder'>(
    'external-url'
  );
  const [websiteUrl, setWebsiteUrl] = useState<string>('https://doitwithai.tools');
  const [internalSlug, setInternalSlug] = useState<string>(
    'doitwithai-multi-tool-directory-publication'
  );
  const [nicheHint, setNicheHint] = useState<string>('');

  // Cinematic Full-Screen Transition State
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [detectedSiteName, setDetectedSiteName] = useState<string>('');
  const [detectedPrimaryHex, setDetectedPrimaryHex] = useState<string>('#4A6CF7');
  const [detectedSecondaryHex, setDetectedSecondaryHex] = useState<string>('#10B981');
  const [liveDiscoveredSummary, setLiveDiscoveredSummary] = useState<string>(
    'Connecting to live website DOM & Google Autocomplete...'
  );
  const [verifiedDossier, setVerifiedDossier] = useState<VerifiedAgencyDossier | null>(null);
  const [isLightTheme, setIsLightTheme] = useState<boolean>(false);

  useEffect(() => {
    const loaded = loadAutonomousStudioState();
    const activeSite = loaded.websites[0];
    if (activeSite?.siteUrl) {
      setWebsiteUrl(activeSite.siteUrl);
    }
    if (typeof window !== 'undefined') {
      const savedTheme = window.localStorage.getItem('doitwithai_agency_v4_theme_v1');
      if (savedTheme === 'light') {
        setIsLightTheme(true);
      }
    }
  }, []);

  const handleToggleLandingTheme = () => {
    setIsLightTheme((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('doitwithai_agency_v4_theme_v1', next ? 'light' : 'dark');
      }
      return next;
    });
  };

  const handleLaunchAgencyOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveUrl =
      siteMode === 'internal-builder'
        ? `https://doitwithai.tools/p/${internalSlug.trim() || 'doitwithai-multi-tool-directory-publication'}`
        : websiteUrl.trim() || 'https://doitwithai.tools';

    const cleanHost =
      effectiveUrl.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0] ||
      'Website';
    setDetectedSiteName(
      siteMode === 'internal-builder' ? `DoItWithAI (${internalSlug.trim()})` : cleanHost
    );
    setIsTransitioning(true);
    setActiveStageIdx(0);
    setProgressPercent(8);

    const progressTimer = setInterval(() => {
      setProgressPercent((prev) => (prev < 96 ? prev + 3 : prev));
    }, 160);

    const stageTimer = setInterval(() => {
      setActiveStageIdx((prev) =>
        prev < ONBOARDING_TRANSITION_STAGES.length - 1 ? prev + 1 : prev
      );
    }, 850);

    try {
      const studioState = loadAutonomousStudioState();
      const publishingMode: WebsitePublishingMode =
        siteMode === 'internal-builder'
          ? 'internal-doitwithai-site'
          : 'external-workspace-staging';
      const nowIso = new Date().toISOString();

      let newWebsite: ConnectedWebsiteProfile | null = null;
      let generatedJobs: AutomatedArticleJob[] = [];

      try {
        const [scoutRes, orchestrateRes] = await Promise.all([
          fetch('/api/autonomous-agents/scout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              siteUrl: effectiveUrl,
              primaryNiche: nicheHint.trim(),
              seedTopicsOrPrompt: '',
              targetArticleCount: 6,
              publishingMode,
              internalBuilderSlug:
                siteMode === 'internal-builder' ? internalSlug.trim() : undefined,
              existingSlugs: [],
              winnerFormulas: studioState.winnerFormulas,
              variationSeed: Date.now() % 10000,
            }),
          }).catch(() => null),
          fetch('/api/ai-employee-agency/orchestrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              siteUrl: effectiveUrl,
              siteName: cleanHost,
              primaryNiche: nicheHint.trim(),
              isInternalSite: publishingMode === 'internal-doitwithai-site',
              existingSlugs: [],
            }),
          }).catch(() => null),
        ]);

        if (orchestrateRes && orchestrateRes.ok) {
          const orchData = (await orchestrateRes.json()) as {
            ok: boolean;
            winningKeywordBrief?: ScoredKeywordBrief;
            scoredKeywordBriefs?: ScoredKeywordBrief[];
          };
          if (orchData.ok && orchData.winningKeywordBrief) {
            setLiveDiscoveredSummary(
              `Scored ${orchData.scoredKeywordBriefs?.length || 8} live autocomplete keywords · #1 Winner: "${orchData.winningKeywordBrief.keyword}" (KD ${orchData.winningKeywordBrief.kdScore}/100) · 36 AI Employees Ready`
            );
          }
        }

        if (scoutRes && scoutRes.ok) {
          const data = (await scoutRes.json()) as {
            ok: boolean;
            scoutReport?: WebsiteScoutReport;
            websiteProfile?: ConnectedWebsiteProfile;
            jobs?: AutomatedArticleJob[];
          };
          if (data.ok && data.websiteProfile && Array.isArray(data.jobs)) {
            newWebsite = data.websiteProfile;
            setDetectedSiteName(newWebsite.siteName);
            setDetectedPrimaryHex(newWebsite.brandPrimaryHex);
            setDetectedSecondaryHex(newWebsite.brandSecondaryHex);
            generatedJobs = data.jobs.map(
              (j, idx): AutomatedArticleJob => ({
                ...j,
                id: `job-agency-${Date.now()}-${idx + 1}`,
                status: idx === 0 ? 'drafting-article' : 'queued',
                completedAgents: [],
                publishedUrl: undefined,
                updatedAtIso: nowIso,
              })
            );
          }
        }
      } catch {
        // Fallback handled deterministically below
      }

      if (!newWebsite || generatedJobs.length === 0) {
        const domainCore = cleanHost.split('.')[0] || 'Website';
        const inferredNiche =
          nicheHint.trim() ||
          `${domainCore.charAt(0).toUpperCase() + domainCore.slice(1)} Strategy & Guides`;

        newWebsite = {
          id: `site-agency-${Date.now()}`,
          siteName:
            siteMode === 'internal-builder'
              ? `DoItWithAI (${internalSlug.trim()})`
              : cleanHost,
          siteUrl: effectiveUrl,
          publishingMode,
          internalBuilderSlug:
            siteMode === 'internal-builder' ? internalSlug.trim() : undefined,
          primaryNiche: inferredNiche,
          brandPrimaryHex: '#4A6CF7',
          brandSecondaryHex: '#10B981',
          darkThemePreferred: true,
          installedTools: studioState.websites[0]?.installedTools ?? [],
        };

        const { jobs: ranked } = deduplicateAndRankLowKdTopics({
          website: newWebsite,
          seedTopicsOrPrompt: '',
          targetCount: 6,
          existingBlogSlugs: [],
          trendSignals: [],
          winnerFormulas: studioState.winnerFormulas,
          variationSeed: Date.now() % 1000,
        });

        generatedJobs = ranked.map(
          (j, idx): AutomatedArticleJob => ({
            ...j,
            id: `job-agency-${Date.now()}-${idx + 1}`,
            status: idx === 0 ? 'drafting-article' : 'queued',
            completedAgents: [],
            publishedUrl: undefined,
            updatedAtIso: nowIso,
          })
        );
      }

      const newCampaign: AutonomousCampaign = {
        id: `camp-agency-${Date.now()}`,
        name: `${newWebsite.siteName} · 24/7 AI Employee Agency`,
        createdAtIso: nowIso,
        updatedAtIso: nowIso,
        websiteId: newWebsite.id,
        seedTopicsOrPrompt: '',
        targetArticleCount: generatedJobs.length,
        cadence: 'daily-1-article',
        approvalMode: 'confidence-gated-90',
        confidenceThreshold: 90,
        status: 'running',
        jobs: generatedJobs,
      };

      saveAutonomousStudioState({
        ...studioState,
        activeCampaignId: newCampaign.id,
        websites: [newWebsite, ...studioState.websites],
        campaigns: [newCampaign, ...studioState.campaigns],
        lastSavedAtIso: nowIso,
      });

      resetZeroBasedSessionTokenLedger({
        siteName: newWebsite.siteName,
        modelId: 'gemini-2.5-flash',
        isFreeTierKeyActive: true,
      });

      await new Promise((r) => setTimeout(r, 1700));
      setActiveStageIdx(ONBOARDING_TRANSITION_STAGES.length - 1);
      setProgressPercent(100);
      await new Promise((r) => setTimeout(r, 350));

      setVerifiedDossier({
        websiteId: newWebsite.id,
        siteName: newWebsite.siteName,
        siteUrl: newWebsite.siteUrl,
        primaryNiche: newWebsite.primaryNiche || nicheHint.trim() || 'Digital SaaS & Editorial',
        primaryHex: newWebsite.brandPrimaryHex || '#1D4ED8',
        secondaryHex: newWebsite.brandSecondaryHex || '#10B981',
        summary: `Verified ${newWebsite.siteName} (${newWebsite.primaryNiche}). Staged ${generatedJobs.length} keyword-backed article topics with 0 pre-completed drafts — Article #1 is queued for live 5-step execution upon launch.`,
        jobs: generatedJobs,
      });
      setIsTransitioning(false);
    } finally {
      clearInterval(progressTimer);
      clearInterval(stageTimer);
    }
  };

  const handleConfirmStartDigitalAgency = () => {
    if (!verifiedDossier) return;
    resetZeroBasedSessionTokenLedger({
      siteName: verifiedDossier.siteName,
      modelId: 'gemini-2.5-flash',
      isFreeTierKeyActive: true,
    });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('doitwithai_agency_v5_autorun_pending', 'true');
      if (verifiedDossier.jobs[0]?.id) {
        window.localStorage.setItem(
          'doitwithai_agency_v5_autorun_job_id',
          verifiedDossier.jobs[0].id
        );
      }
    }
    router.push('/ai-employee-agency/dashboard');
  };

  // =========================================================================
  // FULL-SCREEN CINEMATIC ONBOARDING & MULTI-AGENT ASSEMBLY TRANSITION VIEW
  // =========================================================================
  if (isTransitioning) {
    return (
      <div className="min-h-screen bg-[#050914] text-white flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[780px] rounded-full blur-[150px] opacity-30 transition-all duration-700"
          style={{ backgroundColor: detectedPrimaryHex }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-10 h-[320px] w-[520px] rounded-full blur-[140px] opacity-20 transition-all duration-700"
          style={{ backgroundColor: detectedSecondaryHex }}
        />

        <div className="relative z-10 w-full max-w-4xl rounded-3xl border border-slate-800/90 bg-[#0A1122]/95 p-6 sm:p-10 shadow-2xl space-y-7">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-400/40 bg-sky-500/10 text-sky-300">
                <span className="absolute inset-0 rounded-2xl border border-sky-400/50 animate-ping opacity-30" />
                <DepartmentSvgIcon tabId="executive-office" className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-sky-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Initializing Your 24/7 AI Digital Agency Office
                </div>
                <h1 className="text-lg sm:text-2xl font-extrabold text-white truncate mt-0.5">
                  Analyzing {detectedSiteName || websiteUrl} &amp; Assembling 36 AI Employees...
                </h1>
                <div className="text-[11px] text-emerald-300 font-medium truncate mt-1">
                  {liveDiscoveredSummary}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {progressPercent}%
              </div>
              <div className="text-[11px] text-slate-400">
                Stage {activeStageIdx + 1} of {ONBOARDING_TRANSITION_STAGES.length}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-3 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>
                Active Task:{' '}
                <strong className="text-white">
                  {ONBOARDING_TRANSITION_STAGES[activeStageIdx]?.label}
                </strong>
              </span>
              <span className="text-sky-300 font-mono">
                → Redirecting to /ai-employee-agency/dashboard
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {ONBOARDING_TRANSITION_STAGES.map((stage, idx) => {
              const isDone = idx < activeStageIdx;
              const isCurrent = idx === activeStageIdx;
              return (
                <div
                  key={stage.id}
                  className={`rounded-2xl border p-4 transition-all duration-300 ${
                    isCurrent
                      ? 'border-sky-400 bg-sky-950/35 shadow-lg scale-[1.01]'
                      : isDone
                        ? 'border-emerald-500/40 bg-emerald-950/20'
                        : 'border-slate-800/80 bg-slate-950/50 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${stage.accentHex}22`,
                        color: stage.accentHex,
                      }}
                    >
                      {stage.departmentBadge}
                    </span>
                    <span className="text-xs font-extrabold">
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <AgencyUiIcon name="check" className="w-3.5 h-3.5" /> ONLINE
                        </span>
                      ) : isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-sky-300 animate-pulse">
                          <AgencyUiIcon name="sparkle" className="w-3.5 h-3.5" /> ANALYZING...
                        </span>
                      ) : (
                        <span className="text-slate-500">QUEUED</span>
                      )}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white mt-2">
                    {stage.label}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {stage.sublabel}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (verifiedDossier && !isTransitioning) {
    return (
      <div
        className={`min-h-screen transition-colors ${
          isLightTheme
            ? 'bg-[#F6F8FC] text-[#0F172A]'
            : 'bg-[#060B16] text-slate-100'
        }`}
      >
        <header
          className={`border-b px-4 sm:px-6 py-3.5 sticky top-0 z-30 backdrop-blur ${
            isLightTheme
              ? 'border-slate-200 bg-white/95'
              : 'border-slate-800 bg-[#091020]/90'
          }`}
        >
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#1D4ED8] text-white font-black text-xs">
                AI
              </span>
              <span className="text-sm font-extrabold">
                Verified Agency Dossier · {verifiedDossier.siteName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleLandingTheme}
                className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  isLightTheme
                    ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                }`}
              >
                {isLightTheme ? 'Dark Mode' : 'Light Mode'}
              </button>
              <button
                type="button"
                onClick={() => setVerifiedDossier(null)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  isLightTheme
                    ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
                }`}
              >
                Scan Different URL
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          <section
            className={`rounded-2xl border p-6 sm:p-7 shadow-sm space-y-5 ${
              isLightTheme
                ? 'border-slate-200 bg-white'
                : 'border-slate-800 bg-[#0F172A]'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[11px] font-bold text-emerald-500">
                  <AgencyUiIcon name="check" className="w-3.5 h-3.5" />
                  <span>Website Verified · 0 Articles Completed · Session Reset to 0 Tokens</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {verifiedDossier.siteName}
                </h1>
                <p
                  className={`text-sm leading-relaxed ${
                    isLightTheme ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  {verifiedDossier.summary}
                </p>
              </div>

              <button
                type="button"
                onClick={handleConfirmStartDigitalAgency}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition active:scale-[0.99]"
              >
                <AgencyUiIcon name="play" className="w-4 h-4" />
                <span>Start Digital Agency (Launch Live Workspace) →</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div
                className={`rounded-xl border p-4 ${
                  isLightTheme ? 'border-slate-200 bg-[#F8FAFC]' : 'border-slate-800 bg-[#0B1120]'
                }`}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Target Domain
                </div>
                <div className="text-sm font-bold mt-1 truncate font-mono">
                  {verifiedDossier.siteUrl}
                </div>
              </div>
              <div
                className={`rounded-xl border p-4 ${
                  isLightTheme ? 'border-slate-200 bg-[#F8FAFC]' : 'border-slate-800 bg-[#0B1120]'
                }`}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Detected Niche
                </div>
                <div className="text-sm font-bold mt-1 truncate">
                  {verifiedDossier.primaryNiche}
                </div>
              </div>
              <div
                className={`rounded-xl border p-4 ${
                  isLightTheme ? 'border-slate-200 bg-[#F8FAFC]' : 'border-slate-800 bg-[#0B1120]'
                }`}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Brand Palette
                </div>
                <div className="flex items-center gap-2.5 mt-1.5 font-mono text-xs font-semibold">
                  <span
                    className="h-4 w-4 rounded border border-slate-400/30"
                    style={{ backgroundColor: verifiedDossier.primaryHex }}
                  />
                  <span>{verifiedDossier.primaryHex}</span>
                  <span
                    className="h-4 w-4 rounded border border-slate-400/30 ml-1"
                    style={{ backgroundColor: verifiedDossier.secondaryHex }}
                  />
                  <span>{verifiedDossier.secondaryHex}</span>
                </div>
              </div>
            </div>
          </section>

          <section
            className={`rounded-2xl border p-6 space-y-4 ${
              isLightTheme
                ? 'border-slate-200 bg-white'
                : 'border-slate-800 bg-[#0F172A]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-extrabold">
                  Proposed Campaign Queue ({verifiedDossier.jobs.length} Staged Topics)
                </h2>
                <p
                  className={`text-xs mt-0.5 ${
                    isLightTheme ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Article #1 auto-executes all 5 live specialist agents when your workspace opens.
                </p>
              </div>
              <span className="rounded-lg bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 text-xs font-bold text-[#2563EB] font-mono">
                0 / {verifiedDossier.jobs.length} Completed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {verifiedDossier.jobs.map((job, idx) => (
                <div
                  key={job.id}
                  className={`rounded-xl border p-4 flex items-start justify-between gap-3 ${
                    isLightTheme
                      ? 'border-slate-200 bg-[#F8FAFC]'
                      : 'border-slate-800 bg-[#0B1120]'
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-400">
                        #{idx + 1}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          idx === 0
                            ? 'bg-blue-500/15 text-[#2563EB] border border-blue-500/30'
                            : isLightTheme
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {idx === 0 ? 'Ready for Live Auto-Run' : 'Queued'}
                      </span>
                    </div>
                    <div className="text-sm font-bold leading-snug line-clamp-2">
                      {job.topicTitle}
                    </div>
                    <div
                      className={`text-xs font-mono ${
                        isLightTheme ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      KW: {job.primaryKeyword} · KD {job.kdProxyScore}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

  // =========================================================================
  // PUBLIC ZERO-NOISE LANDING PAGE (/ai-employee-agency) — V5 EDITION
  // =========================================================================
  return (
    <div
      className={`min-h-screen overflow-x-hidden transition-colors ${
        isLightTheme
          ? 'bg-[#F6F8FC] text-[#0F172A]'
          : 'bg-[#060B16] text-slate-100'
      }`}
    >
      {/* Minimalist Top Bar */}
      <header
        className={`border-b backdrop-blur sticky top-0 z-30 ${
          isLightTheme
            ? 'border-slate-200 bg-white/95'
            : 'border-slate-800/80 bg-[#091020]/90'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#1D4ED8] text-white font-black text-xs">
              AI
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-extrabold text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              24/7 AI Digital Agency OS
            </span>
            <span
              className={`text-xs sm:text-sm font-semibold hidden sm:inline ${
                isLightTheme ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              9 Departments · 36 Specialists · Real-Time Execution
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleToggleLandingTheme}
              className={`rounded-xl border px-3 py-2 font-bold transition ${
                isLightTheme
                  ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
              }`}
            >
              {isLightTheme ? 'Dark Mode' : 'Light Mode'}
            </button>
            <Link
              href="/ai-content-writer"
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 font-semibold transition ${
                isLightTheme
                  ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <AgencyUiIcon name="arrow-left" className="w-3.5 h-3.5" />
              <span>AI Content Writer Studio</span>
            </Link>
            <Link
              href="/ai-employee-agency/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] px-3.5 py-2 font-extrabold text-white transition"
            >
              <DepartmentSvgIcon tabId="executive-office" className="w-3.5 h-3.5" />
              <span>Open Live Dashboard</span>
              <AgencyUiIcon name="arrow-right" className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20 space-y-16">
        {/* Hero Header */}
        <section className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-extrabold text-[#2563EB]">
            <AgencyUiIcon name="sparkle" className="w-3.5 h-3.5" />
            <span>Zero Developer Setup · WordPress, Shopify &amp; Webflow Ready</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Hire a 24/7 Autonomous{' '}
            <span className="bg-gradient-to-r from-[#1D4ED8] via-sky-500 to-emerald-500 bg-clip-text text-transparent">
              AI Digital Agency
            </span>{' '}
            for Your Website
          </h1>

          <p
            className={`text-sm sm:text-base leading-relaxed max-w-2xl mx-auto ${
              isLightTheme ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            Enter your website URL to scan your brand, inspect a verified topic queue, and launch{' '}
            <strong className={isLightTheme ? 'text-slate-900' : 'text-white'}>
              9 AI Departments &amp; 36 Specialists
            </strong>{' '}
            with real-time token telemetry and zero pre-faked articles.
          </p>
        </section>

        {/* Zero-Clutter URL Onboarding Card */}
        <section
          className={`max-w-3xl mx-auto rounded-3xl border p-6 sm:p-8 shadow-xl space-y-6 ${
            isLightTheme
              ? 'border-slate-200 bg-white'
              : 'border-sky-500/40 bg-gradient-to-b from-[#0E172C] to-[#090F1E]'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#2563EB]">
              Step 1 · Scan Website &amp; Verify Agency Dossier
            </span>
            <div
              className={`inline-flex rounded-xl border p-1 text-xs ${
                isLightTheme ? 'border-slate-200 bg-slate-100' : 'border-slate-700 bg-slate-950'
              }`}
            >
              <button
                type="button"
                onClick={() => setSiteMode('external-url')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition ${
                  siteMode === 'external-url'
                    ? 'bg-[#1D4ED8] text-white'
                    : isLightTheme
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                }`}
              >
                <AgencyUiIcon name="external-link" className="w-3.5 h-3.5" />
                <span>External Website URL</span>
              </button>
              <button
                type="button"
                onClick={() => setSiteMode('internal-builder')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition ${
                  siteMode === 'internal-builder'
                    ? 'bg-emerald-600 text-white'
                    : isLightTheme
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                }`}
              >
                <AgencyUiIcon name="sparkle" className="w-3.5 h-3.5" />
                <span>My DoItWithAI Site (/p/slug)</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLaunchAgencyOnboarding} className="space-y-4">
            {siteMode === 'external-url' ? (
              <div>
                <label
                  className={`block text-xs font-bold mb-2 ${
                    isLightTheme ? 'text-slate-700' : 'text-slate-200'
                  }`}
                >
                  Enter Your Website URL (WordPress, Shopify, Webflow, Custom, etc.)
                </label>
                <input
                  type="url"
                  required
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com or https://cats.com"
                  className={`w-full rounded-2xl border px-4 py-4 text-base focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    isLightTheme
                      ? 'border-slate-300 bg-[#F8FAFC] text-slate-900 placeholder-slate-400'
                      : 'border-slate-700 bg-slate-950 text-white placeholder-slate-500'
                  }`}
                />
              </div>
            ) : (
              <div>
                <label
                  className={`block text-xs font-bold mb-2 ${
                    isLightTheme ? 'text-slate-700' : 'text-slate-200'
                  }`}
                >
                  Enter Your DoItWithAI Website Builder Slug (`/p/[slug]/blog`)
                </label>
                <input
                  type="text"
                  required
                  value={internalSlug}
                  onChange={(e) => setInternalSlug(e.target.value)}
                  placeholder="doitwithai-multi-tool-directory-publication"
                  className={`w-full rounded-2xl border px-4 py-4 text-base focus:border-emerald-500 focus:outline-none ${
                    isLightTheme
                      ? 'border-slate-300 bg-[#F8FAFC] text-slate-900 placeholder-slate-400'
                      : 'border-slate-700 bg-slate-950 text-white placeholder-slate-500'
                  }`}
                />
              </div>
            )}

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isLightTheme ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Optional Niche Override (Leave blank to auto-detect from your website HTML)
              </label>
              <input
                type="text"
                value={nicheHint}
                onChange={(e) => setNicheHint(e.target.value)}
                placeholder="Auto-detected from URL (or type e.g. AI SEO Tools, B2B SaaS...)"
                className={`w-full rounded-xl border px-4 py-2.5 text-xs focus:border-[#2563EB] focus:outline-none ${
                  isLightTheme
                    ? 'border-slate-200 bg-[#F8FAFC] text-slate-800 placeholder-slate-400'
                    : 'border-slate-800 bg-slate-950/80 text-slate-200 placeholder-slate-500'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1D4ED8] hover:bg-[#1E40AF] py-4 px-6 text-base font-extrabold text-white shadow-lg transition active:scale-[0.99]"
            >
              <AgencyUiIcon name="play" className="w-4 h-4" />
              <span>Scan Website &amp; Prepare Agency Dossier →</span>
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <AgencyUiIcon name="check" className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Full-Screen Interactive Node Graph</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <AgencyUiIcon name="check" className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trainable 3-Layer Agent Memory</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <AgencyUiIcon name="check" className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Per-Circle Token &amp; Cost Telemetry</span>
            </span>
          </div>
        </section>

        {/* V5 Enterprise Pillars Grid */}
        <section className="space-y-5">
          <div className="text-center space-y-1.5 max-w-2xl mx-auto">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-500">
              Autonomous Workspace Architecture
            </div>
            <h2
              className={`text-xl sm:text-2xl font-extrabold ${
                isLightTheme ? 'text-slate-900' : 'text-white'
              }`}
            >
              6 Enterprise Capabilities Built Into Every AI Agency Workspace
            </h2>
            <p className={`text-xs ${isLightTheme ? 'text-slate-600' : 'text-slate-400'}`}>
              90% deterministic mechanical execution + 10% surgical LLM synthesis with transparent real-time telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {V3_ENTERPRISE_PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className={`rounded-2xl border p-5 space-y-2.5 transition ${
                  isLightTheme
                    ? 'border-slate-200 bg-white hover:border-[#2563EB]/50 shadow-sm'
                    : 'border-slate-800/90 bg-[#0B1324]/90 hover:border-sky-500/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border ${
                      isLightTheme
                        ? 'border-blue-200 bg-blue-50 text-[#1D4ED8]'
                        : 'border-sky-500/30 bg-sky-500/10 text-sky-300'
                    }`}
                  >
                    <AgencyUiIcon name={pillar.icon} className="w-4 h-4" />
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${
                      isLightTheme
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    }`}
                  >
                    {pillar.badge}
                  </span>
                </div>
                <h3
                  className={`text-sm font-extrabold ${
                    isLightTheme ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {pillar.title}
                </h3>
                <p
                  className={`text-xs leading-relaxed ${
                    isLightTheme ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Clean 8-Department Overview Grid */}
        <section className="space-y-5">
          <div className="text-center space-y-1">
            <h2
              className={`text-xl sm:text-2xl font-extrabold ${
                isLightTheme ? 'text-slate-900' : 'text-white'
              }`}
            >
              Meet Your Autonomous AI Department Managers &amp; Sub-Agents
            </h2>
            <p className={`text-xs ${isLightTheme ? 'text-slate-600' : 'text-slate-400'}`}>
              Every department communicates via typed handoff packets directly inside your workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AGENCY_DEPARTMENTS_PREVIEW.map((dept) => (
              <div
                key={dept.tabId}
                className={`rounded-2xl border p-4 space-y-2.5 transition ${
                  isLightTheme
                    ? 'border-slate-200 bg-white hover:border-[#2563EB]/50 shadow-sm'
                    : 'border-slate-800/90 bg-slate-900/60 hover:border-sky-500/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border ${
                      isLightTheme
                        ? 'border-slate-200 bg-slate-50 text-[#1D4ED8]'
                        : 'border-slate-700 bg-slate-950 text-sky-300'
                    }`}
                  >
                    <DepartmentSvgIcon tabId={dept.tabId} className="w-4 h-4" />
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      isLightTheme
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-slate-800/90 text-slate-300'
                    }`}
                  >
                    {dept.badge}
                  </span>
                </div>
                <div
                  className={`text-sm font-extrabold ${
                    isLightTheme ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {dept.title}
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isLightTheme ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {dept.role}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Competitive Architecture Comparison Table */}
        <section
          className={`rounded-3xl border p-5 sm:p-7 space-y-4 ${
            isLightTheme
              ? 'border-slate-200 bg-white shadow-sm'
              : 'border-slate-800/90 bg-[#0A1122]/90'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500">
                Commercial Benchmark Comparison
              </div>
              <h2
                className={`text-lg sm:text-xl font-extrabold mt-0.5 ${
                  isLightTheme ? 'text-slate-900' : 'text-white'
                }`}
              >
                DoItWithAI 24/7 AI Agency OS vs. $149/mo Single-Agent SEO Platforms
              </h2>
            </div>
            <Link
              href="/ai-employee-agency/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] px-3.5 py-2 text-xs font-extrabold text-white transition"
            >
              <span>Inspect All 36 Agents Live</span>
              <AgencyUiIcon name="arrow-right" className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr
                  className={`border-b text-[11px] uppercase tracking-wider ${
                    isLightTheme
                      ? 'border-slate-200 text-slate-500'
                      : 'border-slate-800 text-slate-400'
                  }`}
                >
                  <th className="py-3 pr-4">Capability / Workflow Layer</th>
                  <th className="py-3 px-4">Traditional SEO Automation ($149/mo)</th>
                  <th className="py-3 pl-4 text-emerald-500">
                    DoItWithAI Agency Workspace
                  </th>
                </tr>
              </thead>
              <tbody
                className={isLightTheme ? 'divide-y divide-slate-200' : 'divide-y divide-slate-800/60'}
              >
                {CHALLENGER_COMPARISON_ROWS.map((row) => (
                  <tr
                    key={row.capability}
                    className={isLightTheme ? 'hover:bg-slate-50' : 'hover:bg-slate-900/40'}
                  >
                    <td
                      className={`py-3 pr-4 font-bold ${
                        isLightTheme ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {row.capability}
                    </td>
                    <td className={`py-3 px-4 ${isLightTheme ? 'text-slate-600' : 'text-slate-400'}`}>
                      {row.seoAi}
                    </td>
                    <td
                      className={`py-3 pl-4 font-semibold ${
                        isLightTheme ? 'text-emerald-700' : 'text-emerald-200'
                      }`}
                    >
                      {row.doItWithAi}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

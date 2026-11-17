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
import type { ScoredKeywordBrief } from '@/lib/ai-employee-agency/handoff-orchestrator';

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
    label: '4. Initializing On-Page, Off-Page & Technical SEO Engineers',
    sublabel: 'Auditing @graph JSON-LD schema, internal link spokes, robots.txt & CWV...',
    departmentBadge: 'SEO Engineering Fleet',
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
    label: '6. Connecting Social Media & TikTok/Reels Video Script Fleet',
    sublabel: 'Assembling Pinterest 2:3, LinkedIn 8-Slide, X/Threads & TikTok Storyboard Agents...',
    departmentBadge: 'Social & Video Fleet',
    accentHex: '#EC4899',
  },
];

const AGENCY_DEPARTMENTS_PREVIEW = [
  {
    title: '🔑 Keyword & Topic Strategist',
    role: 'Finds low-KD keywords via live web autocomplete + our internal Keyword Engine and hands off the winning brief to Content Writing.',
  },
  {
    title: '✍️ Content Writing Manager + 4 Sub-Agents',
    role: 'Coordinates Long-Form Section Writer, Meta Title/Desc Specialist, Internal/External Link Weaver & @graph Schema Compiler.',
  },
  {
    title: '🎨 Creative & Graphic Design Director',
    role: 'Generates Featured Hero Images, 4× standalone 1080×1350 section infographics, 1000×1500 Pinterest 2:3 pins & LinkedIn carousels.',
  },
  {
    title: '🛠️ On-Page SEO & Content Refresh Lead',
    role: 'Audits live HTML headings, SERP pixel limits, internal link maps, and injects 2026 refresh blocks into decaying articles.',
  },
  {
    title: '📣 Off-Page SEO & Digital PR Manager',
    role: 'Identifies competitor backlink gaps, niche resource directories, and ready-to-send journalist data pitches.',
  },
  {
    title: '⚙️ Technical & Local Entity SEO Architect',
    role: 'Monitors zero-CLS inline SVGs, robots.txt AI crawler permissions, canonicals, and escalates manual Founder fixes.',
  },
  {
    title: '📲 Social Media & TikTok Video Fleet',
    role: 'Dedicated sub-agents for Pinterest, LinkedIn, Facebook/IG, X/Threads, and 60-second TikTok/Reels video scripts.',
  },
  {
    title: '🎙️ Founder Executive Assistant (Chat & Voice)',
    role: 'Talk or voice-call with your Chief AI Officer or any individual AI Employee in real time to launch new campaigns.',
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

  useEffect(() => {
    const loaded = loadAutonomousStudioState();
    const activeSite = loaded.websites[0];
    if (activeSite?.siteUrl) {
      setWebsiteUrl(activeSite.siteUrl);
    }
  }, []);

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
        // Call both `/api/autonomous-agents/scout` and `/api/ai-employee-agency/orchestrate` in parallel
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
              `✓ Scored ${orchData.scoredKeywordBriefs?.length || 8} live autocomplete keywords · #1 Winner: "${orchData.winningKeywordBrief.keyword}" (KD ${orchData.winningKeywordBrief.kdScore}/100) · 36 AI Employees Ready`
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
                status:
                  idx === 0
                    ? publishingMode === 'internal-doitwithai-site'
                      ? 'published'
                      : 'ready-for-review'
                    : idx === 1
                      ? 'drafting-article'
                      : 'queued',
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
            status:
              idx === 0
                ? publishingMode === 'internal-doitwithai-site'
                  ? 'published'
                  : 'ready-for-review'
                : idx === 1
                  ? 'drafting-article'
                  : 'queued',
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

      await new Promise((r) => setTimeout(r, 4200));
      setActiveStageIdx(ONBOARDING_TRANSITION_STAGES.length - 1);
      setProgressPercent(100);
      await new Promise((r) => setTimeout(r, 450));

      router.push('/ai-employee-agency/dashboard');
    } finally {
      clearInterval(progressTimer);
      clearInterval(stageTimer);
    }
  };

  // =========================================================================
  // FULL-SCREEN CINEMATIC ONBOARDING & MULTI-AGENT ASSEMBLY TRANSITION VIEW
  // =========================================================================
  if (isTransitioning) {
    return (
      <div className="min-h-screen bg-[#050914] text-white flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Ambient Animated Glows */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[780px] rounded-full blur-[150px] opacity-30 transition-all duration-700"
          style={{ backgroundColor: detectedPrimaryHex }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-10 h-[320px] w-[520px] rounded-full blur-[140px] opacity-20 transition-all duration-700"
          style={{ backgroundColor: detectedSecondaryHex }}
        />

        <div className="relative z-10 w-full max-w-4xl rounded-3xl border border-slate-800/90 bg-[#0A1122]/95 p-6 sm:p-10 shadow-2xl space-y-7">
          {/* Top Radar & Progress Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-400/40 bg-sky-500/10">
                <span className="absolute inset-0 rounded-2xl border border-sky-400/50 animate-ping opacity-30" />
                <span className="text-2xl">🏢</span>
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-sky-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Initializing Your 24/7 AI Digital Agency Office
                </div>
                <h1 className="text-lg sm:text-2xl font-extrabold text-white truncate mt-0.5">
                  Analyzing {detectedSiteName || websiteUrl} &amp; Assembling 8 AI Departments...
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

          {/* Animated Gradient Progress Bar */}
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

          {/* 6 Animated Telemetry Cards Grid */}
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
                        <span className="text-emerald-400">✓ ONLINE</span>
                      ) : isCurrent ? (
                        <span className="text-sky-300 animate-pulse">⚡ ANALYZING...</span>
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

  // =========================================================================
  // PUBLIC ZERO-NOISE LANDING PAGE (/ai-employee-agency)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#060B16] text-slate-100 overflow-x-hidden">
      {/* Minimalist Top Bar */}
      <header className="border-b border-slate-800/80 bg-[#091020]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-extrabold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              24/7 AI Digital Agency OS
            </span>
            <span className="text-sm font-bold text-slate-300 hidden sm:inline">
              8 AI Department Managers · 27 Specialized Sub-Agents
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <Link
              href="/ai-content-writer"
              className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 font-semibold text-slate-300 hover:text-white transition"
            >
              ← AI Content Writer Studio
            </Link>
            <Link
              href="/ai-employee-agency/dashboard"
              className="rounded-xl bg-sky-500/20 border border-sky-400/50 hover:bg-sky-500/30 px-3.5 py-2 font-extrabold text-sky-200 transition"
            >
              🏢 Open Live Agency Dashboard →
            </Link>
          </div>
        </div>
      </header>

      {/* Focused Single-Action Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-20 space-y-14">
        <section className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-xs font-extrabold text-amber-300">
            <span>⚡ Zero Complex Setup · Just Enter Your Website URL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Hire a 24/7 Autonomous{' '}
            <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-300 bg-clip-text text-transparent">
              AI Digital Agency
            </span>{' '}
            for Your Website
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Enter your website URL once. Your dedicated team of{' '}
            <strong className="text-white">
              8 AI Department Managers &amp; 27 Sub-Agents
            </strong>{' '}
            continuously researches low-KD keywords, writes articles, designs 6-layer infographics, audits On-Page/Off-Page/Technical SEO, and scripts Pinterest, LinkedIn &amp; TikTok campaigns in real time.
          </p>
        </section>

        {/* Zero-Clutter URL Onboarding Card */}
        <section className="max-w-3xl mx-auto rounded-3xl border border-sky-500/40 bg-gradient-to-b from-[#0E172C] to-[#090F1E] p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Destination Pill Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-sky-400">
              Step 1 · Connect Your Website to Initialize Your AI Agency
            </span>
            <div className="inline-flex rounded-xl border border-slate-700 bg-slate-950 p-1 text-xs">
              <button
                type="button"
                onClick={() => setSiteMode('external-url')}
                className={`rounded-lg px-3 py-1.5 font-bold transition ${
                  siteMode === 'external-url'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🌐 External Website URL
              </button>
              <button
                type="button"
                onClick={() => setSiteMode('internal-builder')}
                className={`rounded-lg px-3 py-1.5 font-bold transition ${
                  siteMode === 'internal-builder'
                    ? 'bg-emerald-400 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ My DoItWithAI Site (/p/slug)
              </button>
            </div>
          </div>

          <form onSubmit={handleLaunchAgencyOnboarding} className="space-y-4">
            {siteMode === 'external-url' ? (
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-2">
                  Enter Your Website URL
                </label>
                <input
                  type="url"
                  required
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com or https://cats.com"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-2">
                  Enter Your DoItWithAI Website Builder Slug (`/p/[slug]/blog`)
                </label>
                <input
                  type="text"
                  required
                  value={internalSlug}
                  onChange={(e) => setInternalSlug(e.target.value)}
                  placeholder="doitwithai-multi-tool-directory-publication"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Optional Niche Override (Leave blank to auto-detect from your website HTML)
              </label>
              <input
                type="text"
                value={nicheHint}
                onChange={(e) => setNicheHint(e.target.value)}
                placeholder="Auto-detected from URL (or type e.g. AI SEO Tools, Feline Nutrition, B2B SaaS...)"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-sky-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-sky-500 via-emerald-400 to-amber-400 hover:brightness-110 py-4 px-6 text-base font-black text-slate-950 shadow-xl transition active:scale-[0.99]"
            >
              🚀 Analyze My Website &amp; Launch 24/7 AI Digital Agency →
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>✓ Real-Time Animated Inter-Agent Handoffs</span>
            <span>✓ Full-Canvas Zoom/Pan Node Graph</span>
            <span>✓ Direct 1-on-1 Agent Chat &amp; Voice Call</span>
          </div>
        </section>

        {/* Clean 8-Department Overview Grid */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Meet Your 8 Autonomous AI Department Managers
            </h2>
            <p className="text-xs text-slate-400">
              Every department communicates in real time and reports directly to your `/ai-employee-agency/dashboard`.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AGENCY_DEPARTMENTS_PREVIEW.map((dept) => (
              <div
                key={dept.title}
                className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 space-y-2 hover:border-sky-500/40 transition"
              >
                <div className="text-sm font-extrabold text-white">{dept.title}</div>
                <p className="text-xs text-slate-400 leading-relaxed">{dept.role}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

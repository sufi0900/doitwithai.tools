'use client';

import { agencyRequest } from './agency-request';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AgencySidebarTabId } from '@/lib/ai-employee-agency/agent-registry';
import {
  AgencyUiIcon,
  DepartmentSvgIcon,
  type AgencyUiIconName,
} from './AgencySvgIcons';

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
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [internalSlug, setInternalSlug] = useState<string>(
    ''
  );
  const [nicheHint, setNicheHint] = useState<string>('');

  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);
  useEffect(() => {
    setIsLightTheme(localStorage.getItem('doitwithai_agency_v4_theme_v1') === 'light');
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
    setBusy(true);
    setNotice('');
    try {
      const siteUrl = siteMode === 'internal-builder'
        ? 'https://doitwithai.tools/p/' + encodeURIComponent(internalSlug.trim()) : websiteUrl.trim();
      const res = await agencyRequest('/api/ai-employee-agency/workspace', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteUrl, goal: nicheHint }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const registration = await res.json();
      if (registration.discover) {
        await agencyRequest('/api/ai-employee-agency/knowledge', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'discover', revision: registration.revision }),
        });
      }
      router.push('/ai-employee-agency/dashboard');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Website registration failed.');
    } finally { setBusy(false); }
  };

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

          <div className="flex flex-wrap items-center gap-2 text-xs">
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
              Register your website
            </span>
            <div
              className={`flex w-full flex-wrap gap-1 rounded-xl border p-1 text-xs sm:inline-flex sm:w-auto ${
                isLightTheme ? 'border-slate-200 bg-slate-100' : 'border-slate-700 bg-slate-950'
              }`}
            >
              <button
                type="button"
                onClick={() => setSiteMode('external-url')}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition sm:flex-none ${
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
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition sm:flex-none ${
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

          {notice && (
            <p
              role="status"
              className="break-words rounded-xl border border-rose-500/30 bg-rose-950/30 px-3.5 py-2 text-xs text-rose-300"
            >
              {notice}{' '}
              {notice.includes('Sign in') && (
                <a className="underline hover:text-white" href="/do-it-ai?signin=1">
                  Sign in
                </a>
              )}
            </p>
          )}
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
              type="submit" disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1D4ED8] hover:bg-[#1E40AF] py-4 px-6 text-base font-extrabold text-white shadow-lg transition active:scale-[0.99]"
            >
              <AgencyUiIcon name="play" className="w-4 h-4" />
              <span>{busy ? 'Saving…' : 'Register website'}</span>
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
            <table className="w-full min-w-[600px] text-left border-collapse text-xs">
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

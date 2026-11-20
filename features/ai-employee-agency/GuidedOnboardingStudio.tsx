'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { agencyRequest } from './agency-request';
import type { KnowledgeRow } from './KnowledgeReview';
import type {
  AgencyPriorityPreset,
  SuggestedKeywordCard,
} from '@/lib/ai-employee-agency/site-knowledge';

const CRAWL_STEPS = [
  'Crawling robots.txt & sitemap.xml…',
  'Classifying New vs. Established site inventory…',
  'Synthesizing Brand DNA (niche, audience & voice)…',
  'Discovering 6 low-KD keywords & overlap gate…',
] as const;

const PRIORITY_PRESETS: Array<{
  id: AgencyPriorityPreset;
  title: string;
  split: string;
  detail: string;
}> = [
  {
    id: 'growth_launch',
    title: 'Growth Launch',
    split: '80% New Content · 20% Polish',
    detail: 'Best for new sites building topical authority fast.',
  },
  {
    id: 'balanced_scale',
    title: 'Balanced Scale',
    split: '50% Existing Fixes · 50% New Blogs',
    detail: 'Best for established sites optimizing current pages while scaling.',
  },
  {
    id: 'optimization_sprint',
    title: 'Optimization Sprint',
    split: '80% Existing Fixes · 20% New Blogs',
    detail: 'Focus first on fixing existing blogs, metas, and service pages.',
  },
];

export function GuidedOnboardingStudio({
  row,
  refresh,
  onApproved,
}: {
  row: KnowledgeRow;
  refresh: () => Promise<void>;
  onApproved: (opts: { autoRun: boolean; firstTopic?: string }) => void;
}) {
  const profile = row.profile || {};
  const autoTriggeredRef = useRef(false);

  const [discovering, setDiscovering] = useState(false);
  const [crawlStepIdx, setCrawlStepIdx] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [submittingMode, setSubmittingMode] = useState<'auto' | 'manual' | null>(null);
  const [error, setError] = useState('');

  // Editable Brand DNA state (pre-populated automatically; optional drawer)
  const [name, setName] = useState(profile.name || '');
  const [industry, setIndustry] = useState(profile.industry || '');
  const [audience, setAudience] = useState(profile.audience || '');
  const [offer, setOffer] = useState(profile.offer || '');
  const [goal, setGoal] = useState(profile.goal || '');
  const [locale, setLocale] = useState(profile.locale || 'en-US');
  const [currency, setCurrency] = useState(profile.currency || 'USD');
  const [businessModel, setBusinessModel] = useState(profile.business_model || 'b2b_saas');
  const [readingGrade, setReadingGrade] = useState(profile.reading_grade_target || 'grade_10_12');
  const [subNiche, setSubNiche] = useState(profile.sub_niche || '');
  const [brandVoice, setBrandVoice] = useState(
    Array.isArray(profile.brand_voice) ? profile.brand_voice.join(', ') : '',
  );
  const [humanReview, setHumanReview] = useState(Boolean(profile.humanReview));
  const [priorityPreset, setPriorityPreset] = useState<AgencyPriorityPreset>(
    profile.priority_preset ||
      (profile.domain_maturity === 'established_site' ? 'balanced_scale' : 'growth_launch'),
  );

  // Sync local state whenever discovery updates the revision
  useEffect(() => {
    setName(profile.name || '');
    setIndustry(profile.industry || '');
    setAudience(profile.audience || '');
    setOffer(profile.offer || '');
    setGoal(profile.goal || '');
    setLocale(profile.locale || 'en-US');
    setCurrency(profile.currency || 'USD');
    setBusinessModel(profile.business_model || 'b2b_saas');
    setReadingGrade(profile.reading_grade_target || 'grade_10_12');
    setSubNiche(profile.sub_niche || '');
    setBrandVoice(Array.isArray(profile.brand_voice) ? profile.brand_voice.join(', ') : '');
    setHumanReview(Boolean(profile.humanReview));
    setPriorityPreset(
      profile.priority_preset ||
        (profile.domain_maturity === 'established_site' ? 'balanced_scale' : 'growth_launch'),
    );
  }, [row.revision, profile.checkedAt]);

  const suggestedCards: SuggestedKeywordCard[] = useMemo(
    () => (Array.isArray(profile.suggestedKeywords) ? profile.suggestedKeywords : []),
    [profile.suggestedKeywords],
  );

  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [customKeyword, setCustomKeyword] = useState('');

  useEffect(() => {
    if (suggestedCards.length > 0) {
      setSelectedKeywords(suggestedCards.slice(0, 3).map((c) => c.keyword));
    }
  }, [suggestedCards]);

  // Animated crawl telemetry while discovery is running
  useEffect(() => {
    if (!discovering) return;
    setCrawlStepIdx(0);
    setElapsedSec(0);
    const stepTimer = setInterval(() => {
      setCrawlStepIdx((prev) => (prev < CRAWL_STEPS.length - 1 ? prev + 1 : prev));
    }, 1400);
    const secTimer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => {
      clearInterval(stepTimer);
      clearInterval(secTimer);
    };
  }, [discovering]);

  async function runDiscovery() {
    if (discovering) return;
    setDiscovering(true);
    setError('');
    try {
      const res = await agencyRequest('/api/ai-employee-agency/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discover', revision: row.revision }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Website discovery failed.');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Website discovery failed.');
    } finally {
      setDiscovering(false);
    }
  }

  // Automatically trigger discovery on first entry if site has not been crawled yet
  useEffect(() => {
    if (!profile.checkedAt && !autoTriggeredRef.current) {
      autoTriggeredRef.current = true;
      void runDiscovery();
    }
  }, [profile.checkedAt]);

  function toggleKeyword(kw: string) {
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((item) => item !== kw) : [...prev, kw],
    );
  }

  function addCustomKeyword(e: FormEvent) {
    e.preventDefault();
    const clean = customKeyword.trim();
    if (!clean) return;
    if (!selectedKeywords.some((k) => k.toLowerCase() === clean.toLowerCase())) {
      setSelectedKeywords((prev) => [...prev, clean]);
    }
    setCustomKeyword('');
  }

  async function approveAndLaunch(mode: 'auto' | 'manual') {
    if (submittingMode || discovering) return;
    setSubmittingMode(mode);
    setError('');
    try {
      const keywordsToQueue = mode === 'auto' ? selectedKeywords : [];
      const res = await agencyRequest('/api/ai-employee-agency/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          revision: row.revision,
          name: name.trim() || profile.name || row.domain,
          industry: industry.trim() || profile.industry || 'Digital Business',
          audience: audience.trim() || profile.audience || 'Online buyers and researchers',
          offer: offer.trim() || profile.offer || '',
          goal: goal.trim() || profile.goal || '',
          locale: locale.trim() || 'en-US',
          currency: currency.trim() || 'USD',
          business_model: businessModel,
          reading_grade_target: readingGrade,
          sub_niche: subNiche,
          brand_voice: brandVoice,
          humanReview,
          priority_preset: priorityPreset,
          selectedKeywords: keywordsToQueue,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not approve website knowledge base.');

      // Ensure an active 30-day starter calendar plan exists on auto-launch (best-effort)
      if (mode === 'auto') {
        const start = new Date().toISOString().slice(0, 10);
        const endDate = new Date();
        endDate.setUTCDate(endDate.getUTCDate() + 29);
        const end = endDate.toISOString().slice(0, 10);
        await agencyRequest('/api/ai-employee-agency/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            start,
            end,
            articles: Math.max(4, keywordsToQueue.length * 2),
            pins: 12,
            cooldown: 10,
          }),
        }).catch(() => undefined);
      }

      await refresh();
      onApproved({
        autoRun: mode === 'auto',
        firstTopic: keywordsToQueue[0],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to launch agency.');
    } finally {
      setSubmittingMode(null);
    }
  }

  const pagesCount = profile.pages?.length || 0;
  const inventory = profile.asset_inventory;
  const isEstablished = profile.domain_maturity === 'established_site';
  const inputClass =
    'block w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none';

  return (
    <div className="min-h-full w-full overflow-y-auto bg-[#0B0F17] text-slate-100">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Top Guided Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/90 pb-5">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                Guided Onboarding Studio
              </span>
              <span className="font-mono text-xs text-slate-400">{row.domain}</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Review your verified Brand Dossier &amp; launch your 24/7 AI Agency
            </h1>
            <p className="text-xs text-slate-400">
              Your dashboard unlocks as soon as you confirm your auto-detected Brand DNA and starter keywords below.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={discovering || Boolean(submittingMode)}
              onClick={() => void runDiscovery()}
              className="rounded-lg border border-slate-700 bg-[#111827] px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-500/60 hover:text-white disabled:opacity-50"
            >
              {discovering ? 'Analyzing Site…' : 'Re-scan Live Website'}
            </button>
            <Link
              href="/ai-employee-agency"
              className="rounded-lg border border-slate-800 bg-[#0D131F] px-3 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Change URL
            </Link>
          </div>
        </header>

        {/* 4-Step Progress Indicator */}
        <ol className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            { num: '01', label: 'Site & Sitemap Crawl', done: Boolean(profile.checkedAt) && !discovering },
            { num: '02', label: 'Brand DNA & Maturity', done: Boolean(profile.checkedAt) && !discovering },
            { num: '03', label: '6 Low-KD Keywords', done: suggestedCards.length > 0 && !discovering },
            { num: '04', label: 'Unlock & Launch', done: false },
          ].map((step, i) => (
            <li
              key={step.num}
              className={`rounded-xl border px-3.5 py-2.5 text-xs transition ${
                discovering && i === 0
                  ? 'border-blue-500/60 bg-blue-500/10 text-blue-100'
                  : step.done
                    ? 'border-emerald-500/30 bg-[#111827] text-slate-200'
                    : 'border-slate-800 bg-[#111827]/70 text-slate-400'
              }`}
            >
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                Step {step.num}
              </span>
              <p className="mt-0.5 font-medium">{step.label}</p>
            </li>
          ))}
        </ol>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-xs text-rose-200"
          >
            {error}
          </div>
        )}

        {/* Live Animated Crawl View */}
        {discovering || !profile.checkedAt ? (
          <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6 sm:p-8">
            <div className="mx-auto max-w-2xl space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-[#2563EB]" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-white">
                      AI Specialists are analyzing {row.domain} in real time…
                    </h2>
                    <p className="text-xs text-slate-400">
                      Reading sitemap, HTML metadata, industry signals, and low-KD keyword gaps.
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-md border border-slate-700 bg-[#0B0F17] px-2.5 py-1 font-mono text-xs text-blue-300">
                  {elapsedSec}s
                </span>
              </div>

              <div className="space-y-2.5">
                {CRAWL_STEPS.map((label, idx) => {
                  const isActive = idx === crawlStepIdx;
                  const isDone = idx < crawlStepIdx;
                  return (
                    <div
                      key={label}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs transition-all duration-300 ${
                        isActive
                          ? 'border-blue-500/50 bg-blue-500/10 text-white'
                          : isDone
                            ? 'border-emerald-500/30 bg-[#0B0F17] text-emerald-300'
                            : 'border-slate-800/80 bg-[#0B0F17]/60 text-slate-500'
                      }`}
                    >
                      <span className="font-medium">{label}</span>
                      <span className="font-mono text-[11px]">
                        {isDone ? 'DONE' : isActive ? 'RUNNING…' : 'QUEUED'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Two-Column Dossier + 6 Clickable Keyword Cards */}
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left Column: Verified Brand Dossier & Maturity Split */}
              <section className="space-y-5 rounded-2xl border border-slate-800 bg-[#111827] p-5 lg:col-span-5">
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                      Verified Brand Dossier
                    </p>
                    <h2 className="mt-1 truncate text-lg font-semibold text-white">
                      {name || row.domain}
                    </h2>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      isEstablished
                        ? 'border-blue-500/40 bg-blue-500/15 text-blue-200'
                        : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                    }`}
                  >
                    {isEstablished ? 'Established Site' : 'New Site'}
                  </span>
                </div>

                {/* Key Auto-Detected Facts */}
                <dl className="space-y-3 text-xs">
                  <div className="rounded-xl border border-slate-800/90 bg-[#0B0F17] p-3">
                    <dt className="text-[11px] font-medium text-slate-400">Industry &amp; Niche</dt>
                    <dd className="mt-1 font-medium text-slate-100">{industry || 'Detected automatically'}</dd>
                  </div>
                  <div className="rounded-xl border border-slate-800/90 bg-[#0B0F17] p-3">
                    <dt className="text-[11px] font-medium text-slate-400">Target Audience</dt>
                    <dd className="mt-1 text-slate-200">{audience || 'Detected automatically'}</dd>
                  </div>
                  <div className="rounded-xl border border-slate-800/90 bg-[#0B0F17] p-3">
                    <dt className="text-[11px] font-medium text-slate-400">Core Services / Offer</dt>
                    <dd className="mt-1 text-slate-200">{offer || 'Core website offering'}</dd>
                  </div>
                </dl>

                {/* Sitemap & Asset Inventory */}
                <div className="rounded-xl border border-slate-800 bg-[#0B0F17] p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">Discovered Asset Inventory</span>
                    <span className="font-mono text-[11px] text-blue-300">
                      {pagesCount} URLs · {profile.coverage || 'partial'}
                    </span>
                  </div>
                  {inventory && (
                    <div className="mt-2.5 grid grid-cols-4 gap-2 text-center">
                      {[
                        { label: 'Blogs', val: inventory.blogs },
                        { label: 'Services', val: inventory.services },
                        { label: 'Tools/Prod', val: inventory.products },
                        { label: 'Landing', val: inventory.landingPages },
                      ].map((m) => (
                        <div key={m.label} className="rounded-lg border border-slate-800 bg-[#111827] py-2">
                          <div className="font-mono text-sm font-semibold text-white">{m.val}</div>
                          <div className="text-[10px] text-slate-400">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {profile.colors && profile.colors.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-2.5">
                      <span className="text-[11px] text-slate-400">Brand palette:</span>
                      {profile.colors.slice(0, 4).map((hex) => (
                        <span
                          key={hex}
                          className="inline-flex items-center gap-1.5 rounded border border-slate-800 bg-[#111827] px-2 py-0.5 font-mono text-[10px] text-slate-300"
                        >
                          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: hex }} />
                          {hex}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dual-Track Priority Split Selector */}
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Agency Priority Mode
                  </p>
                  <div className="space-y-2">
                    {PRIORITY_PRESETS.map((preset) => {
                      const active = priorityPreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setPriorityPreset(preset.id)}
                          className={`block w-full rounded-xl border p-3 text-left transition ${
                            active
                              ? 'border-[#2563EB] bg-blue-500/10'
                              : 'border-slate-800 bg-[#0B0F17] hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-white">{preset.title}</span>
                            <span className="font-mono text-[10px] text-blue-300">{preset.split}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-400">{preset.detail}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Collapsible Manual Edit Drawer (No Compulsory Form Wall) */}
                <details className="rounded-xl border border-slate-800 bg-[#0B0F17] p-3.5">
                  <summary className="cursor-pointer text-xs font-semibold text-slate-200">
                    Customize Brand Details (Optional)
                  </summary>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1 text-[11px] text-slate-400">
                      <span>Business name</span>
                      <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={500} />
                    </label>
                    <label className="space-y-1 text-[11px] text-slate-400">
                      <span>Industry / Niche</span>
                      <input className={inputClass} value={industry} onChange={(e) => setIndustry(e.target.value)} maxLength={500} />
                    </label>
                    <label className="space-y-1 text-[11px] text-slate-400 sm:col-span-2">
                      <span>Target audience</span>
                      <input className={inputClass} value={audience} onChange={(e) => setAudience(e.target.value)} maxLength={500} />
                    </label>
                    <label className="space-y-1 text-[11px] text-slate-400 sm:col-span-2">
                      <span>Core product or service</span>
                      <input className={inputClass} value={offer} onChange={(e) => setOffer(e.target.value)} maxLength={500} />
                    </label>
                    <label className="space-y-1 text-[11px] text-slate-400">
                      <span>Business model</span>
                      <select className={inputClass} value={businessModel} onChange={(e) => setBusinessModel(e.target.value)}>
                        {['b2b_saas', 'ecommerce', 'local_service', 'publisher', 'agency'].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1 text-[11px] text-slate-400">
                      <span>Locale / Currency</span>
                      <div className="flex gap-2">
                        <input className={inputClass} value={locale} onChange={(e) => setLocale(e.target.value)} maxLength={20} />
                        <input className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)} maxLength={10} />
                      </div>
                    </label>
                    <label className="space-y-1 text-[11px] text-slate-400 sm:col-span-2">
                      <span>Brand voice traits (comma separated)</span>
                      <input className={inputClass} value={brandVoice} onChange={(e) => setBrandVoice(e.target.value)} maxLength={240} />
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={humanReview}
                        onChange={(e) => setHumanReview(e.target.checked)}
                      />
                      <span>Require human editorial review before publishing</span>
                    </label>
                  </div>
                </details>
              </section>

              {/* Right Column: 6 Clickable Low-KD Keyword Cards */}
              <section className="flex flex-col justify-between space-y-5 rounded-2xl border border-slate-800 bg-[#111827] p-5 lg:col-span-7">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                        Keyword Strategist · Overlap-Gate Checked
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-white">
                        Select starter keywords for your first live run
                      </h2>
                    </div>
                    <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 font-mono text-xs text-blue-200">
                      {selectedKeywords.length} selected
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {suggestedCards.map((card) => {
                      const checked = selectedKeywords.includes(card.keyword);
                      return (
                        <button
                          key={card.keyword}
                          type="button"
                          onClick={() => toggleKeyword(card.keyword)}
                          className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition ${
                            checked
                              ? 'border-[#2563EB] bg-blue-500/10'
                              : 'border-slate-800 bg-[#0B0F17] hover:border-slate-700'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold text-blue-300">
                                <span
                                  className={`inline-block h-3.5 w-3.5 rounded border text-center leading-3 ${
                                    checked
                                      ? 'border-blue-400 bg-[#2563EB] text-white'
                                      : 'border-slate-600 bg-transparent text-transparent'
                                  }`}
                                >
                                  ✓
                                </span>
                                KD {card.estimatedKd}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  card.overlapAction === 'refresh'
                                    ? 'bg-amber-500/15 text-amber-300'
                                    : 'bg-emerald-500/15 text-emerald-300'
                                }`}
                              >
                                {card.overlapAction === 'refresh' ? 'Refresh Existing' : 'Verified Gap'}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-white">{card.keyword}</p>
                            <p className="text-[11px] leading-relaxed text-slate-400">
                              {card.recommendedTitle}
                            </p>
                          </div>
                          <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] text-slate-400">
                            <span className="uppercase tracking-wider">{card.intent}</span>
                            <span>{card.overlapScore}% overlap</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Keyword Input */}
                  <form onSubmit={addCustomKeyword} className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={customKeyword}
                      onChange={(e) => setCustomKeyword(e.target.value)}
                      maxLength={240}
                      placeholder="Add your own target keyword or article topic…"
                      className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!customKeyword.trim()}
                      className="shrink-0 rounded-lg border border-slate-700 bg-[#0B0F17] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-blue-500/60 hover:text-white disabled:opacity-50"
                    >
                      + Add Keyword
                    </button>
                  </form>
                </div>

                {/* Step 4: Two Clear Launch CTAs */}
                <div className="space-y-3 border-t border-slate-800 pt-5">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      disabled={Boolean(submittingMode) || selectedKeywords.length === 0}
                      onClick={() => void approveAndLaunch('auto')}
                      className="flex-1 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500 disabled:opacity-50"
                    >
                      {submittingMode === 'auto'
                        ? 'Starting Digital Agency…'
                        : `Approve & Start Digital Agency Now (${selectedKeywords.length} topics) →`}
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(submittingMode)}
                      onClick={() => void approveAndLaunch('manual')}
                      className="rounded-xl border border-slate-700 bg-[#0B0F17] px-4 py-3 text-xs font-semibold text-slate-200 transition hover:border-blue-500/60 hover:text-white disabled:opacity-50"
                    >
                      {submittingMode === 'manual'
                        ? 'Unlocking…'
                        : 'Approve & Enter Dashboard Manually'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Starting now approves your Brand DNA, queues your selected keywords, activates a 30-day starter schedule, and kicks off Live Production Run #1 inside the dashboard.
                  </p>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

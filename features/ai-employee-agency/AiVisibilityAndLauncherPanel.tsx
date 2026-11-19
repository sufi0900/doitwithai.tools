'use client';

import React, { useMemo, useState } from 'react';
import {
  buildThreeModeArticleLaunchBrief,
  evaluateAiBrandVisibility,
  type AiBrandVisibilityReport,
  type ArticleLaunchModeId,
  type ThreeModeArticleLaunchPlan,
} from '@/lib/ai-employee-agency/ai-visibility-and-launcher';
import { AgencyUiIcon } from './AgencySvgIcons';

interface AiVisibilityAndLauncherPanelProps {
  siteUrl: string;
  siteName: string;
  primaryNiche: string;
  isLightTheme?: boolean;
  initialSubTab?: 'launcher' | 'visibility';
  onQueueLaunchPlan?: (plan: ThreeModeArticleLaunchPlan) => void;
}

const LAUNCH_MODES: Array<{
  id: ArticleLaunchModeId;
  title: string;
  subtitle: string;
  placeholder: string;
  badge: string;
}> = [
  {
    id: 'keyword',
    title: 'Keyword to Article',
    subtitle: 'Enter a target keyword to generate an AEO-first outline, FAQ schema & 4 SVGs.',
    placeholder: 'e.g. ai seo audit checklist 2026',
    badge: 'AEO Pillar',
  },
  {
    id: 'competitor-url',
    title: 'Competitor URL to Outrank',
    subtitle: 'Paste a rival article URL to crawl its headings and build a +35% deeper blueprint.',
    placeholder: 'https://competitor.com/blog/seo-guide',
    badge: 'Live Outrank',
  },
  {
    id: 'youtube-video',
    title: 'YouTube Video to Article',
    subtitle: 'Paste a YouTube video link to extract metadata into a full guide + 60s Shorts script.',
    placeholder: 'https://www.youtube.com/watch?v=...',
    badge: 'Video → Blog',
  },
];

export default function AiVisibilityAndLauncherPanel({
  siteUrl,
  siteName,
  primaryNiche,
  isLightTheme = false,
  initialSubTab = 'launcher',
  onQueueLaunchPlan,
}: AiVisibilityAndLauncherPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'launcher' | 'visibility'>(
    initialSubTab
  );
  const [launchMode, setLaunchMode] = useState<ArticleLaunchModeId>('keyword');
  const [launchInput, setLaunchInput] = useState<string>('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [activePlan, setActivePlan] = useState<ThreeModeArticleLaunchPlan | null>(
    null
  );

  const [customPromptInput, setCustomPromptInput] = useState<string>('');
  const [customPrompts, setCustomPrompts] = useState<string[]>([]);
  const [isScanningVisibility, setIsScanningVisibility] =
    useState<boolean>(false);

  const initialVisibility = useMemo<AiBrandVisibilityReport>(
    () =>
      evaluateAiBrandVisibility({
        siteName,
        siteUrl,
        primaryNiche,
        html: `<script type="application/ld+json">{"@graph":[]}</script><h2>Overview</h2><h2>Comparison</h2><h2>FAQ</h2>`,
        robotsTxt: 'User-agent: *\nAllow: /\n',
        hasLlmsTxt: false,
      }),
    [siteName, siteUrl, primaryNiche]
  );

  const [visibilityReport, setVisibilityReport] =
    useState<AiBrandVisibilityReport>(initialVisibility);

  const activeModeSpec =
    LAUNCH_MODES.find((m) => m.id === launchMode) || LAUNCH_MODES[0]!;

  const handleGenerateLaunchPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = launchInput.trim() || primaryNiche;
    setIsGeneratingPlan(true);
    try {
      const res = await fetch('/api/ai-employee-agency/visibility-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'launch-3-mode',
          mode: launchMode,
          input: cleaned,
          siteUrl,
          siteName,
          primaryNiche,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          ok?: boolean;
          plan?: ThreeModeArticleLaunchPlan;
        };
        if (data.ok && data.plan) {
          setActivePlan(data.plan);
          setIsGeneratingPlan(false);
          return;
        }
      }
    } catch {
      // Deterministic local fallback
    }
    setActivePlan(
      buildThreeModeArticleLaunchBrief({
        mode: launchMode,
        input: cleaned,
        siteName,
        primaryNiche,
      })
    );
    setIsGeneratingPlan(false);
  };

  const handleRunVisibilityScan = async (extraPrompts?: string[]) => {
    const promptList = extraPrompts ?? customPrompts;
    setIsScanningVisibility(true);
    try {
      const res = await fetch('/api/ai-employee-agency/visibility-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'visibility-audit',
          siteUrl,
          siteName,
          primaryNiche,
          customPrompts: promptList,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          ok?: boolean;
          report?: AiBrandVisibilityReport;
        };
        if (data.ok && data.report) {
          setVisibilityReport(data.report);
        }
      }
    } catch {
      // Retain current visibility report
    } finally {
      setIsScanningVisibility(false);
    }
  };

  const handleAddCustomPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customPromptInput.trim();
    if (!trimmed) return;
    const nextPrompts = [trimmed, ...customPrompts].slice(0, 6);
    setCustomPrompts(nextPrompts);
    setCustomPromptInput('');
    void handleRunVisibilityScan(nextPrompts);
  };

  const cardClass = isLightTheme
    ? 'rounded-2xl border border-[#E9EEF5] bg-white shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] text-[#0F172A]'
    : 'rounded-2xl border border-slate-800/90 bg-[#111927] text-slate-100';
  const mutedText = isLightTheme ? 'text-slate-600' : 'text-slate-400';
  const inputClass = isLightTheme
    ? 'border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] placeholder-slate-400'
    : 'border-slate-700 bg-slate-900 text-white placeholder-slate-400';

  return (
    <div className="space-y-5 text-xs">
      <div
        className={`${cardClass} p-5 flex flex-wrap items-center justify-between gap-3`}
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 font-bold text-[15px]">
            <AgencyUiIcon name="sparkle" className="w-4 h-4 text-[#2563EB]" />
            <span>Article Launcher &amp; AI Brand Visibility</span>
          </div>
          <p className={`text-[11px] ${mutedText}`}>
            Launch Keyword, Competitor Outrank, or YouTube-to-Article briefs and
            track ChatGPT, Perplexity, Gemini &amp; Claude citation share.
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-slate-800/40 p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('launcher')}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
              activeSubTab === 'launcher'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-400/40'
                : mutedText
            }`}
          >
            3-Mode Article Launcher
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('visibility')}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
              activeSubTab === 'visibility'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40'
                : mutedText
            }`}
          >
            AI Brand Visibility ({visibilityReport.overallAiVisibilityScore}/100)
          </button>
        </div>
      </div>

      {activeSubTab === 'launcher' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {LAUNCH_MODES.map((m) => {
              const selected = launchMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setLaunchMode(m.id)}
                  className={`text-left rounded-2xl border p-4 space-y-1.5 transition ${
                    selected
                      ? 'border-sky-400 bg-sky-500/10 ring-1 ring-sky-400/40'
                      : isLightTheme
                      ? 'border-slate-200 bg-white hover:border-sky-300'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-xs">{m.title}</span>
                    <span className="rounded-md bg-sky-500/15 border border-sky-400/30 px-2 py-0.5 text-[9.5px] font-mono font-bold text-sky-400">
                      {m.badge}
                    </span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${mutedText}`}>
                    {m.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          <form
            onSubmit={handleGenerateLaunchPlan}
            className={`${cardClass} p-4 flex flex-wrap items-center gap-2.5`}
          >
            <input
              type="text"
              value={launchInput}
              onChange={(e) => setLaunchInput(e.target.value)}
              placeholder={activeModeSpec.placeholder}
              className={`flex-1 min-w-[240px] rounded-xl border px-3.5 py-2 text-xs focus:border-sky-400 focus:outline-none ${inputClass}`}
            />
            <button
              type="submit"
              data-v5-solid="true"
              disabled={isGeneratingPlan}
              className="rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] px-4 py-2 text-xs font-extrabold text-white transition disabled:opacity-50"
            >
              {isGeneratingPlan
                ? 'Building Launch Brief...'
                : `Generate ${activeModeSpec.title} Brief`}
            </button>
          </form>

          {activePlan && (
            <div className={`${cardClass} p-5 space-y-4`}>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/40 pb-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2">
                    <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 uppercase">
                      {activePlan.mode}
                    </span>
                    <span className={`text-[10.5px] font-mono ${mutedText}`}>
                      Slug: /{activePlan.urlSlug} · Target:{' '}
                      {activePlan.targetWordCount.toLocaleString()} words · KD{' '}
                      {activePlan.estimatedKdScore}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold">
                    {activePlan.recommendedH1}
                  </h3>
                </div>

                <button
                  type="button"
                  data-v5-solid="true"
                  onClick={() => onQueueLaunchPlan?.(activePlan)}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-extrabold text-white transition shrink-0"
                >
                  Queue in Content Studio →
                </button>
              </div>

              <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 space-y-1">
                <div className="text-[10px] font-mono font-bold uppercase text-sky-400">
                  50-Word AEO Direct-Answer Lead
                </div>
                <p className="text-xs leading-relaxed">
                  {activePlan.aeoDirectAnswerLead}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="font-extrabold text-xs">
                    Structured H2 Outline ({activePlan.h2Outline.length})
                  </div>
                  <ul className={`space-y-1 text-[11px] ${mutedText}`}>
                    {activePlan.h2Outline.map((h2) => (
                      <li key={h2}>• {h2}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <div className="font-extrabold text-xs">
                    Outrank &amp; Visual Asset Plan
                  </div>
                  <ul className={`space-y-1 text-[11px] ${mutedText}`}>
                    {activePlan.outrankAdvantages.map((adv) => (
                      <li key={adv}>✓ {adv}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'visibility' && (
        <div className="space-y-4">
          <div
            className={`${cardClass} p-4 flex flex-wrap items-center justify-between gap-3`}
          >
            <div className="space-y-0.5">
              <div className="text-xs font-extrabold">
                Overall AI Search Visibility:{' '}
                <span className="text-emerald-400 font-mono text-base">
                  {visibilityReport.overallAiVisibilityScore}/100 (
                  {visibilityReport.overallLabel})
                </span>
              </div>
              <div className={`text-[11px] ${mutedText}`}>
                /llms.txt:{' '}
                <strong>
                  {visibilityReport.hasLlmsTxt ? 'Live' : 'Missing'}
                </strong>{' '}
                · @graph Schema:{' '}
                <strong>
                  {visibilityReport.hasJsonLdGraph ? 'Verified' : 'Incomplete'}
                </strong>
              </div>
            </div>

            <button
              type="button"
              data-v5-solid="true"
              onClick={() => void handleRunVisibilityScan()}
              disabled={isScanningVisibility}
              className="rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] px-4 py-2 text-xs font-extrabold text-white transition disabled:opacity-50"
            >
              {isScanningVisibility
                ? 'Scanning Live Bots...'
                : 'Re-Scan Live AI Signals ($0.00)'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {visibilityReport.engines.map((eng) => (
              <div key={eng.engineId} className={`${cardClass} p-4 space-y-2.5`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-xs">{eng.engineName}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold ${
                      eng.botAllowed
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-rose-500/15 text-rose-400'
                    }`}
                  >
                    {eng.botAllowed ? 'Bot Allowed' : 'Blocked'}
                  </span>
                </div>
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-2xl font-black text-sky-400">
                    {eng.visibilityScore}
                  </span>
                  <span className={`text-[10.5px] ${mutedText}`}>
                    Est. Share: {eng.citationSharePercent}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                    style={{ width: `${eng.visibilityScore}%` }}
                  />
                </div>
                <div className={`text-[10.5px] leading-relaxed ${mutedText}`}>
                  {eng.topRecommendation}
                </div>
              </div>
            ))}
          </div>

          <div className={`${cardClass} p-4 space-y-3`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-extrabold text-sm">
                Monitored Brand Prompts ({visibilityReport.trackedPrompts.length})
              </div>
              <form
                onSubmit={handleAddCustomPrompt}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={customPromptInput}
                  onChange={(e) => setCustomPromptInput(e.target.value)}
                  placeholder="Add brand prompt to track..."
                  className={`rounded-xl border px-3 py-1.5 text-xs focus:border-sky-400 focus:outline-none w-60 ${inputClass}`}
                />
                <button
                  type="submit"
                  className="rounded-xl border border-sky-400/50 bg-sky-500/15 hover:bg-sky-500/25 px-3 py-1.5 text-[11px] font-extrabold text-sky-400 transition"
                >
                  Track Prompt
                </button>
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-slate-800/60 font-mono text-slate-400">
                    <th className="py-2 pr-3">Tracked Prompt</th>
                    <th className="py-2 px-2 text-center">ChatGPT</th>
                    <th className="py-2 px-2 text-center">Perplexity</th>
                    <th className="py-2 px-2 text-center">Gemini</th>
                    <th className="py-2 px-2 text-center">Claude</th>
                    <th className="py-2 pl-2 text-right">Top Rival</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {visibilityReport.trackedPrompts.map((row) => (
                    <tr key={row.id}>
                      <td className="py-2.5 pr-3">
                        <div className="font-bold">{row.promptText}</div>
                        <div className={`text-[10px] ${mutedText}`}>
                          Intent: {row.intent}
                        </div>
                      </td>
                      {(['chatgpt', 'perplexity', 'gemini', 'claude'] as const).map(
                        (eng) => (
                          <td key={eng} className="py-2.5 px-2 text-center">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[9.5px] font-extrabold ${
                                row.citedBy[eng]
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-slate-800/40 text-slate-500'
                              }`}
                            >
                              {row.citedBy[eng] ? 'Cited' : 'Gap'}
                            </span>
                          </td>
                        )
                      )}
                      <td className="py-2.5 pl-2 text-right font-mono">
                        {row.topRivalCited}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

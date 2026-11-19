'use client';

import React, { useMemo, useState } from 'react';
import {
  buildCompetitorGapMatrix,
  type CompetitorGapSuiteReport,
  type KeywordGapBucket,
  type OnPageOptimizationIdea,
  type PageOptimizationCandidate,
} from '@/lib/ai-employee-agency/competitor-gap-and-visibility';
import { AgencyUiIcon } from './AgencySvgIcons';

interface OnPageAndCompetitorGapPanelProps {
  siteUrl: string;
  siteName: string;
  primaryNiche: string;
  isLightTheme?: boolean;
  workspacePages?: Array<{
    urlPath: string;
    pageTitle: string;
    targetKeyword: string;
    kdScore?: number;
  }>;
  onAssignIdeaToAgent?: (idea: OnPageOptimizationIdea, pageUrl: string) => void;
  onLaunchKeywordArticle?: (keyword: string, recommendedH1: string) => void;
}

type SuiteSubTabId =
  | 'on-page-checker'
  | 'compare-domains'
  | 'keyword-gap'
  | 'backlink-gap';

function MultiSegmentIdeaDonut({
  totalIdeas,
  totalPages,
  segments,
  isLightTheme,
}: {
  totalIdeas: number;
  totalPages: number;
  segments: Array<{ id: string; colorHex: string; count: number }>;
  isLightTheme: boolean;
}) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const safeTotal = Math.max(1, totalIdeas);
  let cumulativeFraction = 0;

  return (
    <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 144 144" className="w-40 h-40 -rotate-90">
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke={isLightTheme ? '#e2e8f0' : '#1e293b'}
          strokeWidth="16"
        />
        {segments
          .filter((s) => s.count > 0)
          .map((seg) => {
            const frac = seg.count / safeTotal;
            const dashLength = Math.max(2, frac * circumference - 2);
            const dashOffset = -cumulativeFraction * circumference;
            cumulativeFraction += frac;
            return (
              <circle
                key={seg.id}
                cx="72"
                cy="72"
                r={radius}
                fill="none"
                stroke={seg.colorHex}
                strokeWidth="16"
                strokeDasharray={`${dashLength} ${circumference}`}
                strokeDashoffset={dashOffset}
              />
            );
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black font-mono text-sky-400 leading-none">
          {totalIdeas}
        </span>
        <span
          className={`text-[10.5px] mt-1 ${
            isLightTheme ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          for {totalPages} pages
        </span>
      </div>
    </div>
  );
}

export default function OnPageAndCompetitorGapPanel({
  siteUrl,
  siteName,
  primaryNiche,
  isLightTheme = false,
  workspacePages,
  onAssignIdeaToAgent,
  onLaunchKeywordArticle,
}: OnPageAndCompetitorGapPanelProps) {
  const [activeSubTab, setActiveSubTab] =
    useState<SuiteSubTabId>('on-page-checker');
  const [competitorInput, setCompetitorInput] = useState<string>(
    'https://seo.ai, https://www.junia.ai'
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [kwBucketFilter, setKwBucketFilter] = useState<
    'all' | KeywordGapBucket
  >('all');
  const [selectedPageForIdeas, setSelectedPageForIdeas] =
    useState<PageOptimizationCandidate | null>(null);

  const initialSuite = useMemo<CompetitorGapSuiteReport>(
    () =>
      buildCompetitorGapMatrix({
        siteName,
        siteUrl,
        primaryNiche,
        userCrawl: {
          url: siteUrl,
          isUserDomain: true,
          httpStatus: 200,
          responseTimeMs: 220,
          html: `<html><head><script type="application/ld+json">{"@graph":[]}</script></head><body><h1>${siteName}</h1><h2>AI SEO</h2><h2>Automation</h2><h2>Pricing</h2><a href="/blog">Blog</a><a href="/tools">Tools</a><a href="/pricing">Pricing</a></body></html>`,
          hasLlmsTxt: false,
        },
        competitorCrawls: [
          {
            url: 'https://seo.ai',
            isUserDomain: false,
            httpStatus: 200,
            responseTimeMs: 310,
            html: '<html><body><h1>SEO.AI</h1><h2>AI SEO Writer</h2><h2>Backlink Club</h2><h2>Google Ads</h2><a href="/pricing">Pricing</a><a href="/blog">Blog</a></body></html>',
            hasLlmsTxt: true,
          },
          {
            url: 'https://www.junia.ai',
            isUserDomain: false,
            httpStatus: 200,
            responseTimeMs: 280,
            html: '<html><body><h1>Junia AI</h1><h2>AI Visibility Tracker</h2><h2>SEO Content</h2><a href="/tools">Tools</a></body></html>',
            hasLlmsTxt: false,
          },
        ],
        autocompleteSeeds: [
          `${primaryNiche.toLowerCase()} automation workflow`,
          `best ${primaryNiche.toLowerCase()} for agencies 2026`,
        ],
        workspacePages,
      }),
    [siteName, siteUrl, primaryNiche, workspacePages]
  );

  const [suite, setSuite] = useState<CompetitorGapSuiteReport>(initialSuite);

  const handleRunLiveGapAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    const competitorUrls = competitorInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 3)
      .slice(0, 3);

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai-employee-agency/competitor-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl,
          siteName,
          primaryNiche,
          competitorUrls,
          workspacePages,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          ok?: boolean;
          suite?: CompetitorGapSuiteReport;
        };
        if (data.ok && data.suite) {
          setSuite(data.suite);
          setSelectedPageForIdeas(null);
        }
      }
    } catch {
      // Retain current matrix if offline
    } finally {
      setIsAnalyzing(false);
    }
  };

  const cardClass = isLightTheme
    ? 'rounded-2xl border border-slate-200 bg-white text-slate-900'
    : 'rounded-2xl border border-slate-800 bg-slate-950 text-slate-100';
  const mutedText = isLightTheme ? 'text-slate-500' : 'text-slate-400';

  const allDomains = [suite.userDomain, ...suite.competitors];
  const filteredKwRows =
    kwBucketFilter === 'all'
      ? suite.keywordGapRows
      : suite.keywordGapRows.filter((r) => r.bucket === kwBucketFilter);

  return (
    <div className="space-y-4 text-xs">
      <div className={`${cardClass} p-4 space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-2 font-extrabold text-sm">
              <AgencyUiIcon name="onpage" className="w-4 h-4 text-sky-400" />
              <span>On-Page SEO Checker &amp; Competitor Gap Suite</span>
              <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                $0.00 Live Diff
              </span>
            </div>
            <p className={`text-[11px] ${mutedText}`}>
              Compare {suite.userDomain.hostname} against up to 3 live competitor
              URLs for On-Page Ideas, Keyword Gaps, and Backlink Opportunities.
            </p>
          </div>

          <form
            onSubmit={handleRunLiveGapAnalysis}
            className="flex flex-wrap items-center gap-2"
          >
            <input
              type="text"
              value={competitorInput}
              onChange={(e) => setCompetitorInput(e.target.value)}
              placeholder="Competitor URLs (comma-separated, max 3)"
              className={`rounded-xl border px-3 py-1.5 text-xs focus:border-sky-400 focus:outline-none w-72 ${
                isLightTheme
                  ? 'border-slate-300 bg-slate-50 text-slate-900'
                  : 'border-slate-700 bg-slate-900 text-white'
              }`}
            />
            <button
              type="submit"
              data-v5-solid="true"
              disabled={isAnalyzing}
              className="rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] px-4 py-2 text-xs font-extrabold text-white transition disabled:opacity-50"
            >
              {isAnalyzing ? 'Analyzing Rivals...' : 'Re-Run Live Gap Audit'}
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-1.5 border-t border-slate-800/40 pt-3">
          {(
            [
              {
                id: 'on-page-checker',
                label: `On-Page SEO Checker (${suite.onPageAudit.totalIdeasCount} Ideas)`,
              },
              {
                id: 'compare-domains',
                label: `Domain Overview & Compare (${allDomains.length})`,
              },
              {
                id: 'keyword-gap',
                label: `Keyword Gap Matrix (${suite.keywordGapRows.length})`,
              },
              {
                id: 'backlink-gap',
                label: `Backlink Gap Matrix (${suite.backlinkGapRows.length})`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-[11px] font-bold transition ${
                activeSubTab === tab.id
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-400/40'
                  : `${mutedText} hover:text-sky-400`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'on-page-checker' && (
        <div className="space-y-4">
          <div className={`${cardClass} p-5 space-y-5`}>
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <MultiSegmentIdeaDonut
                totalIdeas={suite.onPageAudit.totalIdeasCount}
                totalPages={suite.onPageAudit.totalPagesEvaluated}
                segments={suite.onPageAudit.categories}
                isLightTheme={isLightTheme}
              />

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 w-full">
                {suite.onPageAudit.categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between gap-2 border-b border-slate-800/30 pb-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex h-5 w-6 items-center justify-center rounded text-[10px] font-extrabold text-white"
                        style={{ backgroundColor: cat.colorHex }}
                      >
                        {cat.shortCode}
                      </span>
                      <span className="font-semibold">{cat.label}</span>
                    </div>
                    <span className="font-mono font-extrabold text-sky-400">
                      {cat.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`rounded-xl border p-4 flex flex-wrap items-center justify-between gap-4 ${
                isLightTheme
                  ? 'border-slate-200 bg-slate-50'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div>
                <div className={`text-[11px] ${mutedText}`}>
                  Implementing these On-Page SEO ideas could increase organic
                  visibility by
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">
                  +{suite.onPageAudit.potentialLiftPercent}% Potential Lift
                </div>
              </div>
              <div className="flex-1 min-w-[220px] max-w-md space-y-2 text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <span className={`w-16 ${mutedText}`}>Current</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-800/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sky-400"
                      style={{
                        width: `${Math.max(
                          8,
                          Math.round(
                            (suite.onPageAudit.currentEstMonthlyVisits /
                              Math.max(
                                1,
                                suite.onPageAudit.potentialEstMonthlyVisits
                              )) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="w-16 text-right font-bold">
                    {suite.onPageAudit.currentEstMonthlyVisits.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-16 ${mutedText}`}>Potential</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-800/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <span className="w-16 text-right font-bold text-emerald-400">
                    {suite.onPageAudit.potentialEstMonthlyVisits.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`${cardClass} p-4 space-y-3`}>
            <div className="font-extrabold text-sm">Top Pages to Optimize</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-slate-800/60 font-mono text-slate-400">
                    <th className="py-2 pr-3">Priority</th>
                    <th className="py-2 pr-3">Page &amp; Target Keyword</th>
                    <th className="py-2 pr-3 text-right">Est. Volume</th>
                    <th className="py-2 text-right">Optimization Ideas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {suite.onPageAudit.topPages.map((pg) => (
                    <tr key={pg.pageId}>
                      <td className="py-2.5 pr-3 font-mono font-bold text-amber-400">
                        {pg.priorityScore}/100
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="font-bold">{pg.pageTitle}</div>
                        <div className={`text-[10px] font-mono ${mutedText}`}>
                          {pg.urlPath} · Keyword: &ldquo;{pg.targetKeyword}&rdquo;
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono">
                        {pg.estimatedMonthlyVolume.toLocaleString()}/mo
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedPageForIdeas(
                              selectedPageForIdeas?.pageId === pg.pageId
                                ? null
                                : pg
                            )
                          }
                          className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 px-3 py-1 text-[11px] font-extrabold text-emerald-400 transition"
                        >
                          {selectedPageForIdeas?.pageId === pg.pageId
                            ? 'Hide Ideas'
                            : `${pg.ideasCount} Ideas →`}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedPageForIdeas && (
              <div
                className={`rounded-xl border p-4 space-y-2.5 mt-3 ${
                  isLightTheme
                    ? 'border-sky-200 bg-sky-50/50'
                    : 'border-sky-500/30 bg-slate-900/70'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-extrabold text-sky-400">
                    Top Ideas for {selectedPageForIdeas.urlPath} (
                    {selectedPageForIdeas.ideas.length})
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPageForIdeas(null)}
                    className={`text-[11px] font-bold ${mutedText}`}
                  >
                    Close
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedPageForIdeas.ideas.map((idea) => (
                    <div
                      key={idea.id}
                      className={`rounded-xl border p-3 flex flex-wrap items-center justify-between gap-3 ${
                        isLightTheme
                          ? 'border-slate-200 bg-white'
                          : 'border-slate-800 bg-slate-950/80'
                      }`}
                    >
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[9.5px] font-mono font-bold uppercase text-sky-400">
                            {idea.category}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400">
                            {idea.impact} Impact
                          </span>
                        </div>
                        <div className="font-bold text-xs">{idea.title}</div>
                        <div className={`text-[11px] ${mutedText}`}>
                          {idea.detail}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onAssignIdeaToAgent?.(
                            idea,
                            selectedPageForIdeas.urlPath
                          )
                        }
                        className="rounded-xl border border-sky-400/50 bg-sky-500/15 hover:bg-sky-500/25 px-3 py-1.5 text-[11px] font-extrabold text-sky-400 transition shrink-0"
                      >
                        Assign to {idea.recommendedAgentName}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'compare-domains' && (
        <div className={`${cardClass} p-4 space-y-3`}>
          <div className="font-extrabold text-sm">
            Side-by-Side Domain Comparison ({allDomains.length} Domains)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-slate-800/60 font-mono text-slate-400">
                  <th className="py-2 pr-3">Domain</th>
                  <th className="py-2 px-2 text-right">Authority Proxy</th>
                  <th className="py-2 px-2 text-right">AEO Score</th>
                  <th className="py-2 px-2 text-right">Words</th>
                  <th className="py-2 px-2 text-right">Internal Links</th>
                  <th className="py-2 px-2 text-center">@graph Schema</th>
                  <th className="py-2 px-2 text-center">/llms.txt</th>
                  <th className="py-2 pl-2 text-right">TTFB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {allDomains.map((dom) => (
                  <tr
                    key={dom.hostname}
                    className={dom.isUserDomain ? 'bg-sky-500/10' : ''}
                  >
                    <td className="py-2.5 pr-3 font-bold">
                      <div className="flex items-center gap-2">
                        <span>{dom.hostname}</span>
                        {dom.isUserDomain && (
                          <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[9.5px] font-mono text-sky-400">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-400">
                      {dom.authorityProxyScore}/100
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-sky-400">
                      {dom.aeoReadinessScore}/100
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono">
                      {dom.wordCount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono">
                      {dom.internalLinksCount}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {dom.hasJsonLdGraph ? 'Yes' : 'No'}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {dom.hasLlmsTxt ? 'Live' : 'Missing'}
                    </td>
                    <td className="py-2.5 pl-2 text-right font-mono">
                      {dom.responseTimeMs}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'keyword-gap' && (
        <div className={`${cardClass} p-4 space-y-3`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-extrabold text-sm">
              Keyword Gap Matrix ({filteredKwRows.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'missing', label: 'Missing' },
                  { id: 'untapped', label: 'Untapped' },
                  { id: 'weak', label: 'Weak' },
                  { id: 'strong', label: 'Strong' },
                ] as const
              ).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setKwBucketFilter(b.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    kwBucketFilter === b.id
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-400/40'
                      : `${mutedText} hover:text-sky-400`
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-slate-800/60 font-mono text-slate-400">
                  <th className="py-2 pr-3">Keyword Opportunity</th>
                  <th className="py-2 px-2">Gap Type</th>
                  <th className="py-2 px-2">Intent</th>
                  <th className="py-2 px-2 text-right">KD</th>
                  <th className="py-2 px-2 text-right">Est. Vol</th>
                  <th className="py-2 pl-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredKwRows.map((row) => (
                  <tr key={row.id}>
                    <td className="py-2.5 pr-3">
                      <div className="font-bold">{row.keyword}</div>
                      <div className={`text-[10px] ${mutedText}`}>
                        Rival leader: {row.leadingCompetitor}
                      </div>
                    </td>
                    <td className="py-2.5 px-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9.5px] font-extrabold uppercase ${
                          row.bucket === 'missing'
                            ? 'bg-rose-500/15 text-rose-400'
                            : row.bucket === 'untapped'
                            ? 'bg-sky-500/15 text-sky-400'
                            : row.bucket === 'weak'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-emerald-500/15 text-emerald-400'
                        }`}
                      >
                        {row.bucket}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">{row.intent}</td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold">
                      {row.kdScore}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono">
                      {row.estimatedMonthlyVolume.toLocaleString()}
                    </td>
                    <td className="py-2.5 pl-2 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          onLaunchKeywordArticle?.(
                            row.keyword,
                            row.recommendedH1
                          )
                        }
                        className="rounded-lg border border-emerald-400/40 bg-emerald-500/15 hover:bg-emerald-500/25 px-2.5 py-1 text-[10.5px] font-extrabold text-emerald-400 transition"
                      >
                        Send to Content Studio
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'backlink-gap' && (
        <div className={`${cardClass} p-4 space-y-3`}>
          <div className="font-extrabold text-sm">
            Backlink Gap Opportunities ({suite.backlinkGapRows.length})
          </div>
          <div className="space-y-2">
            {suite.backlinkGapRows.map((bl) => (
              <div
                key={bl.id}
                className={`rounded-xl border p-3 flex flex-wrap items-center justify-between gap-3 ${
                  isLightTheme
                    ? 'border-slate-200 bg-slate-50/70'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                      {bl.authorityTier}
                    </span>
                    <span className={`text-[10px] font-mono ${mutedText}`}>
                      {bl.competitorsLinkedCount} rival(s) linked · Your site: Not
                      yet linked
                    </span>
                  </div>
                  <div className="font-bold text-xs">
                    {bl.referringDomainType}
                  </div>
                  <div className={`text-[11px] ${mutedText}`}>
                    {bl.outreachAngle}
                  </div>
                </div>
                <span className="rounded-xl border border-sky-400/40 bg-sky-500/15 px-3 py-1.5 text-[10.5px] font-extrabold text-sky-400 shrink-0">
                  Target: {bl.exampleTargetUrl.slice(0, 32)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

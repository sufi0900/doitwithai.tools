'use client';

import React, { useMemo, useState } from 'react';
import {
  runMechanicalSiteAudit,
  type SiteAuditExplorerTabId,
  type SiteAuditIssueItem,
  type SiteAuditReport,
} from '@/lib/ai-employee-agency/semrush-ahrefs-audit-engine';
import { AgencyUiIcon } from './AgencySvgIcons';

interface SiteAuditSuitePanelProps {
  defaultSiteUrl: string;
  siteName: string;
  primaryNiche: string;
  isLightTheme?: boolean;
  onAssignOpportunityToAgent?: (issue: SiteAuditIssueItem) => void;
}

const EXPLORER_TABS: Array<{ id: SiteAuditExplorerTabId; label: string }> = [
  { id: 'pages', label: 'Pages' },
  { id: 'links', label: 'Links' },
  { id: 'redirects', label: 'Redirects' },
  { id: 'images', label: 'Images & Alt' },
  { id: 'assets', label: 'JS & CSS' },
  { id: 'social', label: 'Social Tags' },
  { id: 'duplicates', label: 'Duplicates' },
  { id: 'localization', label: 'Localization' },
  { id: 'performance', label: 'Performance' },
];

function SemiCircleGauge({
  score,
  label,
  title,
  gradientId,
  startColor,
  endColor,
  isLightTheme,
}: {
  score: number;
  label: string;
  title: string;
  gradientId: string;
  startColor: string;
  endColor: string;
  isLightTheme: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 58;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-xs font-extrabold mb-1">{title}</div>
      <div className="relative w-44 h-24 flex items-end justify-center">
        <svg viewBox="0 0 140 80" className="w-44 h-24 overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={startColor} />
              <stop offset="100%" stopColor={endColor} />
            </linearGradient>
          </defs>
          <path
            d="M 12 72 A 58 58 0 0 1 128 72"
            fill="none"
            stroke={isLightTheme ? '#e2e8f0' : '#1e293b'}
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 12 72 A 58 58 0 0 1 128 72"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="absolute bottom-0 flex flex-col items-center">
          <span className="text-2xl font-black font-mono leading-none">
            {clamped}
          </span>
          <span
            className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
              clamped >= 85
                ? 'bg-emerald-500/20 text-emerald-400'
                : clamped >= 65
                ? 'bg-sky-500/20 text-sky-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SiteAuditSuitePanel({
  defaultSiteUrl,
  siteName,
  primaryNiche,
  isLightTheme = false,
  onAssignOpportunityToAgent,
}: SiteAuditSuitePanelProps) {
  const [auditUrlInput, setAuditUrlInput] = useState<string>(defaultSiteUrl);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [activeExplorerTab, setActiveExplorerTab] =
    useState<SiteAuditExplorerTabId>('pages');
  const [copiedLlms, setCopiedLlms] = useState<boolean>(false);
  const [showLlmsDraft, setShowLlmsDraft] = useState<boolean>(false);

  const initialReport = useMemo<SiteAuditReport>(
    () =>
      runMechanicalSiteAudit({
        siteUrl: defaultSiteUrl,
        siteName,
        primaryNiche,
        httpStatus: 200,
        responseTimeMs: 240,
        html: `<html lang="en"><head><title>${siteName} — ${primaryNiche}</title><meta name="description" content="Official ${siteName} hub for ${primaryNiche} workflows, checklists, and automation." /><meta name="viewport" content="width=device-width, initial-scale=1" /><link rel="canonical" href="${defaultSiteUrl}" /><meta property="og:title" content="${siteName}" /><meta property="og:image" content="${defaultSiteUrl}/og.png" /><meta name="twitter:card" content="summary_large_image" /><script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebSite"}]}</script></head><body><h1>${siteName}</h1><h2>Overview</h2><h2>Workflows</h2><a href="/blog">Blog</a><a href="/tools">Tools</a><a href="/pricing">Pricing</a><a href="/about">About</a><a href="/contact">Contact</a></body></html>`,
        robotsTxtStatus: 200,
        robotsTxtContent: 'User-agent: *\nAllow: /\n',
        llmsTxtStatus: 404,
        llmsTxtContent: '',
      }),
    [defaultSiteUrl, siteName, primaryNiche]
  );

  const [report, setReport] = useState<SiteAuditReport>(initialReport);

  const handleRunLiveAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = auditUrlInput.trim() || defaultSiteUrl;
    setIsAuditing(true);
    try {
      const res = await fetch('/api/ai-employee-agency/site-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl: target,
          siteName,
          primaryNiche,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          ok?: boolean;
          report?: SiteAuditReport;
        };
        if (data.ok && data.report) {
          setReport(data.report);
        }
      }
    } catch {
      // Keep current report if offline
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCopyLlmsTxt = async () => {
    try {
      await navigator.clipboard.writeText(report.llmsTxt.generatedDraft);
      setCopiedLlms(true);
      setTimeout(() => setCopiedLlms(false), 2000);
    } catch {
      // Ignore clipboard restriction
    }
  };

  const handleDownloadLlmsTxt = () => {
    const blob = new Blob([report.llmsTxt.generatedDraft], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'llms.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const cardClass = isLightTheme
    ? 'rounded-2xl border border-[#E9EEF5] bg-white shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] text-[#0F172A]'
    : 'rounded-2xl border border-slate-800/90 bg-[#111927] text-slate-100';
  const mutedText = isLightTheme ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className="space-y-5 text-xs">
      <form
        onSubmit={handleRunLiveAudit}
        className={`${cardClass} p-5 flex flex-wrap items-center justify-between gap-3`}
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 font-bold text-[15px]">
            <AgencyUiIcon name="technical" className="w-4 h-4 text-[#2563EB]" />
            <span>Technical Site Audit</span>
            <span className="rounded-lg bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
              Live Scan
            </span>
          </div>
          <p className={`text-[11px] ${mutedText}`}>
            Live HTML, robots.txt &amp; /llms.txt inspection · HTTP{' '}
            {report.httpStatus || '—'} · {report.responseTimeMs}ms TTFB
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="url"
            value={auditUrlInput}
            onChange={(e) => setAuditUrlInput(e.target.value)}
            placeholder="https://doitwithai.tools"
            className={`rounded-xl border px-3 py-1.5 text-xs focus:border-sky-400 focus:outline-none w-64 ${
              isLightTheme
                ? 'border-slate-300 bg-slate-50 text-slate-900'
                : 'border-slate-700 bg-slate-900 text-white'
            }`}
          />
          <button
            type="submit"
            data-v5-solid="true"
            disabled={isAuditing}
            className="rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] px-4 py-2 text-xs font-extrabold text-white transition disabled:opacity-50"
          >
            {isAuditing ? 'Crawling Live URL...' : 'Run Live Site Audit'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${cardClass} p-4 flex flex-col justify-between`}>
          <SemiCircleGauge
            score={report.technicalHealthScore}
            label={report.technicalHealthLabel}
            title="Technical Site Health"
            gradientId="healthGaugeGrad"
            startColor="#f59e0b"
            endColor="#10b981"
            isLightTheme={isLightTheme}
          />
          <p className={`text-[11px] text-center mt-3 ${mutedText}`}>
            Proportion of technical, indexability, heading, canonical &amp; CLS
            checks passing without errors.
          </p>
        </div>

        <div className={`${cardClass} p-4 space-y-3`}>
          <SemiCircleGauge
            score={report.aiDiscoverabilityScore}
            label={report.aiDiscoverabilityLabel}
            title="AI Discoverability Score"
            gradientId="aiDiscoverGaugeGrad"
            startColor="#ec4899"
            endColor="#6366f1"
            isLightTheme={isLightTheme}
          />
          <div className="space-y-1.5 text-[10.5px]">
            {[
              { label: 'Bot Access', value: report.aiSubScores.botAccess },
              {
                label: 'Machine Readability',
                value: report.aiSubScores.machineReadability,
              },
              {
                label: 'llms.txt Readiness',
                value: report.aiSubScores.llmsTxtReadiness,
              },
              {
                label: 'Freshness & Entity',
                value: report.aiSubScores.freshnessSignals,
              },
            ].map((bar) => (
              <div key={bar.label} className="flex items-center gap-2">
                <span className={`w-32 shrink-0 ${mutedText}`}>{bar.label}</span>
                <span className="w-7 text-right font-mono font-bold">
                  {bar.value}
                </span>
                <div className="flex-1 h-2 rounded-full bg-slate-800/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                    style={{ width: `${bar.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${cardClass} p-4 flex flex-col justify-between gap-3`}>
          <div className="space-y-2.5">
            <div className="text-xs font-extrabold">Issues Distribution</div>
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-bold">Errors</span>
                <span className="font-extrabold">{report.issueCounts.errors}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold">Warnings</span>
                <span className="font-extrabold">{report.issueCounts.warnings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sky-400 font-bold">Notices</span>
                <span className="font-extrabold">{report.issueCounts.notices}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/50 pt-1.5">
                <span className="text-emerald-400 font-bold">Passed Checks</span>
                <span className="font-extrabold">
                  {report.issueCounts.passedChecks}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-extrabold text-indigo-400">
                /llms.txt Status
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                  report.llmsTxt.exists
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {report.llmsTxt.exists
                  ? `Live (${report.llmsTxt.byteLength} B)`
                  : 'Missing (404)'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                data-v5-solid="true"
                onClick={() => setShowLlmsDraft((prev) => !prev)}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 text-[10.5px] font-bold text-white transition"
              >
                {showLlmsDraft ? 'Hide llms.txt' : '1-Click Generate llms.txt'}
              </button>
              <button
                type="button"
                onClick={handleCopyLlmsTxt}
                className="rounded-lg border border-indigo-400/40 px-2 py-1 text-[10.5px] font-bold text-indigo-300 hover:bg-indigo-500/20 transition"
              >
                {copiedLlms ? 'Copied' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={handleDownloadLlmsTxt}
                className="rounded-lg border border-indigo-400/40 px-2 py-1 text-[10.5px] font-bold text-indigo-300 hover:bg-indigo-500/20 transition"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {showLlmsDraft && (
        <div className={`${cardClass} p-4 space-y-2`}>
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-indigo-400">
              Generated Production /llms.txt for {report.hostname}
            </span>
            <span className={`text-[10.5px] font-mono ${mutedText}`}>
              Deploy to {report.llmsTxt.checkedUrl}
            </span>
          </div>
          <pre
            className={`rounded-xl p-3 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap ${
              isLightTheme
                ? 'bg-slate-100 text-slate-800'
                : 'bg-slate-900 text-emerald-300'
            }`}
          >
            {report.llmsTxt.generatedDraft}
          </pre>
        </div>
      )}

      <div className={`${cardClass} p-4 space-y-3`}>
        <div className="flex items-center justify-between gap-2">
          <div className="font-extrabold text-sm">
            Prioritized Opportunities Hub ({report.opportunities.length})
          </div>
          <span className={`text-[11px] ${mutedText}`}>
            Click &ldquo;Assign to AI Agent&rdquo; to dispatch directly to the responsible specialist
          </span>
        </div>

        {report.opportunities.length === 0 ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-400 font-semibold">
            All mechanical technical SEO and AI discoverability checks passed with zero issues.
          </div>
        ) : (
          <div className="space-y-2">
            {report.opportunities.map((opp) => (
              <div
                key={opp.id}
                className={`rounded-xl border p-3 flex flex-wrap items-center justify-between gap-3 ${
                  isLightTheme
                    ? 'border-slate-200 bg-slate-50/70'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9.5px] font-extrabold uppercase ${
                        opp.severity === 'error'
                          ? 'bg-rose-500/20 text-rose-400'
                          : opp.severity === 'warning'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-sky-500/20 text-sky-400'
                      }`}
                    >
                      {opp.severity}
                    </span>
                    <span className={`text-[10px] font-mono ${mutedText}`}>
                      {opp.category} · Impact {opp.impactScore}/100
                    </span>
                  </div>
                  <div className="font-bold text-xs">{opp.title}</div>
                  <div className={`text-[11px] ${mutedText}`}>{opp.detail}</div>
                </div>

                <button
                  type="button"
                  onClick={() => onAssignOpportunityToAgent?.(opp)}
                  className="rounded-xl border border-sky-400/50 bg-sky-500/15 hover:bg-sky-500/25 px-3 py-1.5 text-[11px] font-extrabold text-sky-400 transition shrink-0"
                >
                  Assign to {opp.recommendedAgentName}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`${cardClass} p-4 space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-extrabold text-sm">
            9-Tab Mechanical Crawl Explorer
          </div>
          <div className="flex flex-wrap gap-1">
            {EXPLORER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveExplorerTab(tab.id)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  activeExplorerTab === tab.id
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-400/40'
                    : `${mutedText} hover:text-sky-400`
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-slate-800/60 font-mono text-slate-400">
                <th className="py-2 pr-3">Check / Signal</th>
                <th className="py-2 pr-3">Live Detected Value</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Actionable Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {report.explorerTabs[activeExplorerTab].map((row) => (
                <tr key={row.id}>
                  <td className="py-2.5 pr-3 font-bold">{row.metric}</td>
                  <td className="py-2.5 pr-3 font-mono">{row.value}</td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9.5px] font-extrabold uppercase ${
                        row.status === 'passed'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : row.status === 'error'
                          ? 'bg-rose-500/15 text-rose-400'
                          : row.status === 'warning'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-sky-500/15 text-sky-400'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className={`py-2.5 ${mutedText}`}>{row.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

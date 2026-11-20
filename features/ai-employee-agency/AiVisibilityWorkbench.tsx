'use client';

import { useState, type FormEvent } from 'react';
import { agencyRequest } from './agency-request';
import type { KnowledgeRow } from './KnowledgeReview';

interface VisibilityPlatformRow {
  platformName?: string;
  engine?: string;
  score?: number;
  status?: string;
  recommendation?: string;
}

interface VisibilityReport {
  overallVisibilityScore?: number;
  hasLlmsTxt?: boolean;
  robotsAllowsAiCrawlers?: boolean;
  summary?: string;
  platformBreakdowns?: VisibilityPlatformRow[];
  engines?: VisibilityPlatformRow[];
}

interface CompetitorGapKeywordRow {
  keyword: string;
  kdScore?: number;
  opportunity?: string;
  intent?: string;
}

interface CompetitorGapSuite {
  summary?: string;
  keywordGaps?: CompetitorGapKeywordRow[];
  backlinkGaps?: Array<{ domain?: string; authorityScore?: number; angle?: string }>;
  domainComparisons?: Array<{
    domain?: string;
    url?: string;
    wordCount?: number;
    hasLlmsTxt?: boolean;
    httpStatus?: number;
  }>;
}

export function AiVisibilityWorkbench({
  website,
  onTopicQueued,
}: {
  website: KnowledgeRow;
  onTopicQueued: () => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<'visibility' | 'competitors' | 'pr'>('visibility');
  const [runningAudit, setRunningAudit] = useState(false);
  const [visibilityReport, setVisibilityReport] = useState<VisibilityReport | null>(null);

  const [competitorInput, setCompetitorInput] = useState(
    (((website.profile as { competitor_blocklist?: string[] }).competitor_blocklist) || []).slice(0, 3).join(', '),
  );
  const [runningGap, setRunningGap] = useState(false);
  const [gapSuite, setGapSuite] = useState<CompetitorGapSuite | null>(null);

  const [prAngle, setPrAngle] = useState('');
  const [runningPr, setRunningPr] = useState(false);
  const [prDraft, setPrDraft] = useState('');

  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function runVisibilityAudit() {
    if (runningAudit) return;
    setRunningAudit(true);
    setError('');
    setNotice('');
    try {
      const res = await agencyRequest('/api/ai-employee-agency/visibility-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'visibility-audit',
          siteUrl: website.domain,
          siteName: website.profile.name || website.domain,
          primaryNiche: website.profile.industry || 'Digital Business',
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        report?: VisibilityReport;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'AI Visibility audit failed.');
      }
      setVisibilityReport(data.report || null);
      setNotice('Completed live $0.00 AI Brand Visibility & llms.txt audit.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI Visibility audit failed.');
    } finally {
      setRunningAudit(false);
    }
  }

  async function runCompetitorGap(e?: FormEvent) {
    e?.preventDefault();
    if (runningGap) return;
    setRunningGap(true);
    setError('');
    setNotice('');
    try {
      const competitorUrls = competitorInput
        .split(/[,\n]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 3)
        .slice(0, 3);

      const res = await agencyRequest('/api/ai-employee-agency/competitor-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl: website.domain,
          siteName: website.profile.name || website.domain,
          primaryNiche: website.profile.industry || 'Digital Business',
          competitorUrls: competitorUrls.length > 0 ? competitorUrls : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        suite?: CompetitorGapSuite;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Competitor gap scan failed.');
      }
      setGapSuite(data.suite || null);
      setNotice('Completed live $0.00 Competitor & Keyword Gap teardown.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Competitor gap scan failed.');
    } finally {
      setRunningGap(false);
    }
  }

  async function queueGapKeyword(keyword: string) {
    setError('');
    try {
      const res = await agencyRequest('/api/ai-employee-agency/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: keyword,
          forceDifferentiated: true,
          revision: website.revision,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Could not queue gap keyword.');
      await onTopicQueued();
      setNotice(`Queued competitor gap topic "${keyword}" into your pipeline.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not queue gap keyword.');
    }
  }

  async function generatePrPitch(e: FormEvent) {
    e.preventDefault();
    if (runningPr) return;
    setRunningPr(true);
    setError('');
    setNotice('');
    try {
      const prompt = prAngle.trim()
        ? `Draft a concise Digital PR & authority backlink outreach email + 3 journalist citation angles for ${website.domain} focused on: ${prAngle.trim()}.`
        : `Draft a concise Digital PR & authority backlink outreach pitch + 3 AI-citation angles tailored to ${website.profile.name || website.domain} (${website.profile.industry || 'our niche'}).`;
      const res = await agencyRequest('/api/ai-employee-agency/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, agentId: 'pr' }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        replyText?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || 'PR draft generation failed.');
      setPrDraft(data.replyText || '');
      setNotice('Generated Digital PR outreach draft and saved to specialist ledger.');
      await onTopicQueued();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PR draft generation failed.');
    } finally {
      setRunningPr(false);
    }
  }

  const platforms =
    visibilityReport?.platformBreakdowns || visibilityReport?.engines || [];

  return (
    <section className="space-y-5 rounded-xl border border-slate-800 bg-[#111827] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
            AI Visibility, Competitor Gap &amp; Digital PR
          </p>
          <h2 className="text-base font-semibold text-white">
            Live Answer-Engine Radar &amp; Authority Link Workbench
          </h2>
        </div>

        <div className="inline-flex rounded-lg border border-slate-800 bg-[#0B0F17] p-1 text-xs">
          {(
            [
              { id: 'visibility', label: 'AI Visibility Radar' },
              { id: 'competitors', label: 'Competitor Gap' },
              { id: 'pr', label: 'Digital PR Pitch' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-3 py-1.5 font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-[#2563EB] text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <p
          role="status"
          className="rounded-lg border border-blue-500/30 bg-blue-950/30 px-3.5 py-2 text-xs text-blue-200"
        >
          {notice}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-3.5 py-2 text-xs text-rose-200"
        >
          {error}
        </p>
      )}

      {/* TAB 1: AI VISIBILITY RADAR */}
      {activeTab === 'visibility' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white">
                Check ChatGPT, Perplexity, Gemini &amp; Claude crawlability for{' '}
                <span className="font-mono text-blue-300">{website.domain}</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Inspects live HTML schema, /robots.txt AI bot directives, and /llms.txt at $0.00 LLM cost.
              </p>
            </div>
            <button
              type="button"
              disabled={runningAudit}
              onClick={() => void runVisibilityAudit()}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {runningAudit ? 'Scanning AI Bots…' : 'Run Live AI Visibility Audit →'}
            </button>
          </div>

          {visibilityReport && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">
                    Overall AI Visibility
                  </p>
                  <p className="mt-1 font-mono text-2xl font-semibold text-white">
                    {visibilityReport.overallVisibilityScore ?? 0}/100
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">
                    /llms.txt Status
                  </p>
                  <p
                    className={`mt-1 text-sm font-semibold ${
                      visibilityReport.hasLlmsTxt ? 'text-emerald-300' : 'text-amber-300'
                    }`}
                  >
                    {visibilityReport.hasLlmsTxt ? 'Detected & Valid' : 'Missing / Needs Setup'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">
                    AI Crawler Access
                  </p>
                  <p className="mt-1 text-sm font-semibold text-blue-300">
                    {visibilityReport.robotsAllowsAiCrawlers === false
                      ? 'Restricted in robots.txt'
                      : 'Open to AI Crawlers'}
                  </p>
                </div>
              </div>

              {platforms.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {platforms.map((p, idx) => (
                    <div
                      key={p.platformName || p.engine || idx}
                      className="rounded-xl border border-slate-800 bg-[#0B0F17] p-3.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-slate-100">
                          {p.platformName || p.engine || `Engine ${idx + 1}`}
                        </strong>
                        {p.score !== undefined && (
                          <span className="font-mono text-blue-300">{p.score}%</span>
                        )}
                      </div>
                      {p.status && (
                        <p className="mt-1 text-[11px] text-emerald-300">{p.status}</p>
                      )}
                      {p.recommendation && (
                        <p className="mt-1.5 text-[11px] text-slate-400">
                          {p.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPETITOR GAP MATRIX */}
      {activeTab === 'competitors' && (
        <div className="space-y-4">
          <form
            onSubmit={runCompetitorGap}
            className="flex flex-col gap-2.5 sm:flex-row"
          >
            <input
              type="text"
              value={competitorInput}
              onChange={(e) => setCompetitorInput(e.target.value)}
              placeholder="Enter 1–3 competitor URLs (comma separated), or leave blank for defaults…"
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={runningGap}
              className="shrink-0 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {runningGap ? 'Analyzing Rivals…' : 'Analyze Competitor Gaps →'}
            </button>
          </form>

          {gapSuite && (
            <div className="space-y-4">
              {gapSuite.summary && (
                <p className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3 text-xs text-slate-300">
                  {gapSuite.summary}
                </p>
              )}
              {Array.isArray(gapSuite.keywordGaps) && gapSuite.keywordGaps.length > 0 && (
                <div className="space-y-2 rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Missing Keyword Gaps ({gapSuite.keywordGaps.length})
                  </h3>
                  <div className="divide-y divide-slate-800/80">
                    {gapSuite.keywordGaps.slice(0, 8).map((row) => (
                      <div
                        key={row.keyword}
                        className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-slate-200">{row.keyword}</span>
                          {row.kdScore !== undefined && (
                            <span className="ml-2 font-mono text-[11px] text-slate-400">
                              KD {row.kdScore}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => void queueGapKeyword(row.keyword)}
                          className="shrink-0 rounded-md border border-blue-500/40 bg-blue-500/15 px-2.5 py-1 text-[11px] font-semibold text-blue-200 hover:bg-blue-500/25"
                        >
                          + Queue Gap Topic
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DIGITAL PR OUTREACH */}
      {activeTab === 'pr' && (
        <div className="space-y-4">
          <form onSubmit={generatePrPitch} className="flex flex-col gap-2.5 sm:flex-row">
            <input
              type="text"
              value={prAngle}
              onChange={(e) => setPrAngle(e.target.value)}
              placeholder="Optional PR angle (e.g. new benchmark study, free tool launch, industry report)…"
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={runningPr}
              className="shrink-0 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {runningPr ? 'Drafting PR Pitch…' : 'Generate Digital PR Pitch →'}
            </button>
          </form>

          {prDraft && (
            <div className="space-y-2 rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-emerald-300">
                  PR Outreach Draft Saved
                </span>
                <button
                  type="button"
                  onClick={() => void navigator.clipboard?.writeText(prDraft)}
                  className="rounded-md border border-slate-700 bg-[#111827] px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white"
                >
                  Copy Pitch
                </button>
              </div>
              <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-slate-200">
                {prDraft}
              </pre>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

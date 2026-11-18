'use client';

import React, { useMemo, useState } from 'react';
import type { ZeroBasedSessionTokenLedger } from '@/lib/ai-employee-agency/token-telemetry-store';
import { AgencyUiIcon } from './AgencySvgIcons';

/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V4 PHASE 12)
 * Component: `features/ai-employee-agency/ZeroBasedTokenLedgerPanel.tsx`
 *
 * Modular Zero-Based Real-Time Per-Agent & Chat Token Telemetry Ledger:
 * - Always initializes sessions at `0 tokens ($0.0000)` with a 1-click Reset button.
 * - Renders all 37 rows (Founder Copilot Chat Box + 36 AI Employees) with
 *   `KEY_SLOT_*` badges, API call counters, prompt/output/total tokens, shadow
 *   commercial USD cost, and a live metered event feed.
 * ============================================================================
 */

interface ZeroBasedTokenLedgerPanelProps {
  ledger: ZeroBasedSessionTokenLedger;
  isFreeTierKeyMode: boolean;
  onResetSession: () => void;
}

export default function ZeroBasedTokenLedgerPanel({
  ledger,
  isFreeTierKeyMode,
  onResetSession,
}: ZeroBasedTokenLedgerPanelProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'chat'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ledger.rows.filter((row) => {
      if (filterMode === 'active' && row.totalTokens === 0) return false;
      if (filterMode === 'chat' && !row.isChatBox) return false;
      if (!q) return true;
      return (
        row.displayName.toLowerCase().includes(q) ||
        row.departmentName.toLowerCase().includes(q) ||
        row.apiKeySlot.toLowerCase().includes(q)
      );
    });
  }, [ledger.rows, filterMode, searchQuery]);

  const activeRowsCount = useMemo(
    () => ledger.rows.filter((r) => r.totalTokens > 0).length,
    [ledger.rows]
  );

  return (
    <div className="rounded-2xl border border-sky-500/40 bg-slate-950 p-4 space-y-4 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-2 font-extrabold text-sky-300">
            <AgencyUiIcon name="activity" className="w-4 h-4 text-sky-400" />
            <span>
              Zero-Based Live Session Token Ledger (Chat Box + All 36 AI Employees)
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Starts strictly at{' '}
            <strong className="text-emerald-300">0 tokens ($0.0000)</strong> and
            increments in real time per API call · Active Slot:{' '}
            <span className="font-mono font-bold text-sky-300">
              {ledger.activeKeySlot}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[10.5px] font-mono text-slate-400">
            Calls: <strong className="text-white">{ledger.totalApiCalls}</strong>
          </span>
          <button
            type="button"
            onClick={onResetSession}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 px-3 py-1.5 text-[11px] font-extrabold text-rose-300 transition"
          >
            <AgencyUiIcon name="refresh" className="w-3.5 h-3.5" />
            <span>Reset Session to 0</span>
          </button>
        </div>
      </div>

      {/* 4 Zero-Based Live Session KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="text-[10.5px] text-slate-400">Session Total Tokens</div>
          <div className="text-lg font-extrabold font-mono text-white mt-0.5">
            {ledger.totalSessionTokens.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
            In: {ledger.totalPromptTokens.toLocaleString()} · Out:{' '}
            {ledger.totalCompletionTokens.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="text-[10.5px] text-slate-400">Shadow Commercial Cost</div>
          <div className="text-lg font-extrabold font-mono text-emerald-300 mt-0.5">
            ${ledger.totalShadowCostUsd.toFixed(4)}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
            Model: {ledger.activeModelId}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="text-[10.5px] text-slate-400">Actual Billed Cost</div>
          <div className="text-lg font-extrabold font-mono text-sky-300 mt-0.5">
            ${ledger.totalActualCostUsd.toFixed(4)}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
            {isFreeTierKeyMode ? 'Free API Key ($0 billed)' : 'Commercial Paid Key'}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="text-[10.5px] text-slate-400">
            Chat Box &amp; Active Agents
          </div>
          <div className="text-lg font-extrabold font-mono text-amber-300 mt-0.5">
            {ledger.chatBoxTokens.toLocaleString()} tok
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
            Active Agents: {ledger.activeAgentsCount} / 36
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/80 p-1 gap-1">
          {(
            [
              { id: 'all', label: `All (${ledger.rows.length})` },
              { id: 'active', label: `Active Only (${activeRowsCount})` },
              { id: 'chat', label: 'Chat Box Only' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                filterMode === tab.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by agent, department, or KEY_SLOT..."
          className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:border-sky-400 focus:outline-none w-64"
        />
      </div>

      {/* 37-Row Per-Agent & Chat Box Zero-Based Token Table */}
      <div className="overflow-x-auto max-h-[380px] overflow-y-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead className="sticky top-0 bg-slate-900 z-10">
            <tr className="border-b border-slate-800 text-slate-400 font-mono">
              <th className="py-2 px-3">Agent / Channel</th>
              <th className="py-2 px-2">Department</th>
              <th className="py-2 px-2">API Key Slot</th>
              <th className="py-2 px-2 text-right">Calls</th>
              <th className="py-2 px-2 text-right">Prompt</th>
              <th className="py-2 px-2 text-right">Output</th>
              <th className="py-2 px-2 text-right">Total Tok</th>
              <th className="py-2 px-2 text-right">Shadow ($)</th>
              <th className="py-2 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {filteredRows.map((row) => (
              <tr
                key={row.rowId}
                className={`hover:bg-slate-900/60 ${
                  row.isChatBox ? 'bg-sky-950/20' : ''
                }`}
              >
                <td className="py-2 px-3">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    {row.isChatBox && (
                      <span className="rounded bg-sky-500/20 border border-sky-400/40 px-1.5 py-0.2 text-[9px] font-mono text-sky-300">
                        CHAT
                      </span>
                    )}
                    <span>{row.displayName}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[260px]">
                    {row.lastActionSummary}
                  </div>
                </td>
                <td className="py-2 px-2 text-slate-300">{row.departmentName}</td>
                <td className="py-2 px-2">
                  <span className="rounded bg-slate-900 border border-slate-700/80 px-1.5 py-0.5 text-[9.5px] font-mono text-sky-300">
                    {row.apiKeySlot}
                  </span>
                </td>
                <td className="py-2 px-2 text-right font-mono text-slate-300">
                  {row.apiCallsCount}
                </td>
                <td className="py-2 px-2 text-right font-mono text-slate-300">
                  {row.promptTokens.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-right font-mono text-slate-300">
                  {row.completionTokens.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-right font-mono font-bold text-sky-300">
                  {row.totalTokens.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-right font-mono font-bold text-emerald-300">
                  ${row.shadowCostUsd.toFixed(4)}
                </td>
                <td className="py-2 px-3 text-right">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold ${
                      row.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        row.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'
                      }`}
                    />
                    {row.status === 'active' ? 'Metered' : 'Idle'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Real-Time Metered Events */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 space-y-2">
        <div className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider">
          Live Metered Event Feed ({ledger.recentEvents.length})
        </div>
        {ledger.recentEvents.length === 0 ? (
          <p className="text-[11px] text-slate-400">
            Session initialized at 0 tokens ($0.0000). Send a chat command, score live
            keywords, or click &ldquo;Meter 1 Full Circle Now&rdquo; below to watch
            real-time per-agent token increments.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {ledger.recentEvents.slice(0, 8).map((ev) => (
              <div
                key={ev.eventId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-950/70 border border-slate-800/80 px-2.5 py-1.5 text-[10.5px]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-sky-300 shrink-0">
                    {ev.apiKeySlot}
                  </span>
                  <span className="font-bold text-white shrink-0">
                    {ev.actorName}
                  </span>
                  <span className="text-slate-400 truncate max-w-[320px]">
                    {ev.actionLabel}
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-300 shrink-0">
                  +{ev.totalTokens.toLocaleString()} tok · $
                  {ev.shadowCostUsd.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

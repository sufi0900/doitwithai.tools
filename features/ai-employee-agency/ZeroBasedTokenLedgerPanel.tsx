'use client';

import React, { useMemo, useState } from 'react';
import {
  MODEL_PRICING_CATALOG,
  type AgencyLlmModelId,
  type ZeroBasedSessionTokenLedger,
} from '@/lib/ai-employee-agency/token-telemetry-store';
import { AgencyUiIcon } from './AgencySvgIcons';

/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V5 PHASE 20)
 * Component: `features/ai-employee-agency/ZeroBasedTokenLedgerPanel.tsx`
 *
 * Modular Zero-Based Real-Time Per-Agent & Chat Token Telemetry Ledger:
 * - Always initializes sessions at `0 tokens ($0.0000)` with a 1-click Reset button.
 * - Includes V5 Model Selector, Free/Paid API Key Slot Toggle, optional session
 *   API Key override input, Live 5-Step Pipeline & Circle Metering buttons,
 *   and real-time API Diagnostic warnings (`lastApiErrorDetail`).
 * ============================================================================
 */

interface ZeroBasedTokenLedgerPanelProps {
  ledger: ZeroBasedSessionTokenLedger;
  isFreeTierKeyMode: boolean;
  isLightTheme?: boolean;
  activeModelId?: AgencyLlmModelId;
  customApiKey?: string;
  lastApiErrorDetail?: string | null;
  isLivePipelineRunning?: boolean;
  onResetSession: () => void;
  onChangeModel?: (modelId: AgencyLlmModelId) => void;
  onToggleFreeTierKey?: (isFree: boolean) => void;
  onChangeCustomApiKey?: (key: string) => void;
  onRunLiveArticlePipeline?: () => void;
  onMeterFullCircle?: () => void;
}

export default function ZeroBasedTokenLedgerPanel({
  ledger,
  isFreeTierKeyMode,
  isLightTheme = false,
  activeModelId,
  customApiKey = '',
  lastApiErrorDetail = null,
  isLivePipelineRunning = false,
  onResetSession,
  onChangeModel,
  onToggleFreeTierKey,
  onChangeCustomApiKey,
  onRunLiveArticlePipeline,
  onMeterFullCircle,
}: ZeroBasedTokenLedgerPanelProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'chat'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const selectedModelId = activeModelId || ledger.activeModelId;
  const activePricing =
    MODEL_PRICING_CATALOG[selectedModelId] || MODEL_PRICING_CATALOG['gemini-2.5-flash'];

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

  const outerCard = isLightTheme
    ? 'border-[#E9EEF5] bg-white text-[#0F172A] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)]'
    : 'border-slate-800/90 bg-[#111927] text-slate-100';
  const subCard = isLightTheme
    ? 'border-[#E9EEF5] bg-[#F8FAFC]'
    : 'border-slate-800 bg-[#0F172A]';
  const mutedText = isLightTheme ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`rounded-2xl border p-6 space-y-5 text-xs ${outerCard}`}>
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 ${
          isLightTheme ? 'border-[#E9EEF5]' : 'border-slate-800'
        }`}
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 font-bold text-[15px]">
            <AgencyUiIcon name="activity" className="w-4 h-4 text-[#2563EB]" />
            <span>Live Session Token &amp; API Usage Ledger</span>
          </div>
          <p className={`text-xs ${mutedText}`}>
            Real-time token metering starting at{' '}
            <strong className="text-emerald-500">0 tokens ($0.0000)</strong> · Active Slot:{' '}
            <span className="font-mono font-semibold text-[#2563EB]">
              {ledger.activeKeySlot}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-mono ${subCard}`}
          >
            Calls: <strong>{ledger.totalApiCalls}</strong>
          </span>
          {onRunLiveArticlePipeline && (
            <button
              type="button"
              data-v5-solid="true"
              disabled={isLivePipelineRunning}
              onClick={onRunLiveArticlePipeline}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-60 px-3.5 py-1.5 text-[11px] font-extrabold text-white transition"
            >
              <AgencyUiIcon name="play" className="w-3.5 h-3.5" />
              <span>
                {isLivePipelineRunning
                  ? 'Executing Pipeline...'
                  : 'Run Live 5-Step Pipeline'}
              </span>
            </button>
          )}
          {onMeterFullCircle && (
            <button
              type="button"
              onClick={onMeterFullCircle}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold transition ${
                isLightTheme
                  ? 'border-blue-200 bg-blue-50 text-[#1D4ED8] hover:bg-blue-100'
                  : 'border-sky-500/40 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25'
              }`}
            >
              <span>Meter 1 Full Circle</span>
            </button>
          )}
          <button
            type="button"
            onClick={onResetSession}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-extrabold transition ${
              isLightTheme
                ? 'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700'
                : 'border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300'
            }`}
          >
            <AgencyUiIcon name="refresh" className="w-3.5 h-3.5" />
            <span>Reset Session to 0</span>
          </button>
        </div>
      </div>

      {/* Model, API Key Slot & Live Diagnostic Bar */}
      {(onChangeModel || onToggleFreeTierKey || onChangeCustomApiKey) && (
        <div className={`rounded-xl border p-4 grid grid-cols-1 lg:grid-cols-3 gap-3 ${subCard}`}>
          {onChangeModel && (
            <div className="space-y-1">
              <label className={`block text-[10.5px] font-bold uppercase ${mutedText}`}>
                Execution LLM Model (${activePricing.inputUsdPer1M}/1M in · ${activePricing.outputUsdPer1M}/1M out)
              </label>
              <select
                value={selectedModelId}
                onChange={(e) => onChangeModel(e.target.value as AgencyLlmModelId)}
                className={`w-full rounded-xl border px-3 py-2 text-xs font-bold focus:border-[#2563EB] focus:outline-none ${
                  isLightTheme
                    ? 'border-slate-200 bg-white text-slate-900'
                    : 'border-slate-700 bg-slate-900 text-slate-100'
                }`}
              >
                {Object.values(MODEL_PRICING_CATALOG).map((spec) => (
                  <option key={spec.modelId} value={spec.modelId}>
                    {spec.displayName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {onToggleFreeTierKey && (
            <div className="space-y-1">
              <label className={`block text-[10.5px] font-bold uppercase ${mutedText}`}>
                API Key Slot Mode
              </label>
              <div
                className={`inline-flex w-full rounded-xl border p-1 ${
                  isLightTheme ? 'border-slate-200 bg-white' : 'border-slate-700 bg-slate-900'
                }`}
              >
                <button
                  type="button"
                  data-v5-solid={isFreeTierKeyMode ? 'true' : undefined}
                  onClick={() => onToggleFreeTierKey(true)}
                  className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold transition ${
                    isFreeTierKeyMode ? 'bg-emerald-600 text-white' : mutedText
                  }`}
                >
                  Free Tier ($0.00 billed)
                </button>
                <button
                  type="button"
                  data-v5-solid={!isFreeTierKeyMode ? 'true' : undefined}
                  onClick={() => onToggleFreeTierKey(false)}
                  className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold transition ${
                    !isFreeTierKeyMode ? 'bg-[#1D4ED8] text-white' : mutedText
                  }`}
                >
                  Commercial Paid Key
                </button>
              </div>
            </div>
          )}

          {onChangeCustomApiKey && (
            <div className="space-y-1">
              <label className={`block text-[10.5px] font-bold uppercase ${mutedText}`}>
                Session API Key Override (Optional)
              </label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => onChangeCustomApiKey(e.target.value)}
                placeholder="Uses Cloudflare/server env key if empty"
                className={`w-full rounded-xl border px-3 py-2 text-xs font-mono focus:border-[#2563EB] focus:outline-none ${
                  isLightTheme
                    ? 'border-slate-200 bg-white text-slate-900 placeholder-slate-400'
                    : 'border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500'
                }`}
              />
            </div>
          )}
        </div>
      )}

      {lastApiErrorDetail && (
        <div
          className={`rounded-xl border px-4 py-2.5 text-xs font-semibold ${
            isLightTheme
              ? 'border-amber-300 bg-amber-50 text-amber-800'
              : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
          }`}
        >
          Live Gateway Diagnostic: {lastApiErrorDetail}
        </div>
      )}

      {/* 4 Zero-Based Live Session KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={`rounded-xl border p-3 ${subCard}`}>
          <div className={`text-[10.5px] ${mutedText}`}>Session Total Tokens</div>
          <div className="text-lg font-extrabold font-mono tabular-nums mt-0.5">
            {ledger.totalSessionTokens.toLocaleString()}
          </div>
          <div className={`text-[10px] font-mono mt-0.5 ${mutedText}`}>
            In: {ledger.totalPromptTokens.toLocaleString()} · Out:{' '}
            {ledger.totalCompletionTokens.toLocaleString()}
          </div>
        </div>
        <div className={`rounded-xl border p-3 ${subCard}`}>
          <div className={`text-[10.5px] ${mutedText}`}>Shadow Commercial Cost</div>
          <div className="text-lg font-extrabold font-mono tabular-nums text-emerald-500 mt-0.5">
            ${ledger.totalShadowCostUsd.toFixed(4)}
          </div>
          <div className={`text-[10px] font-mono mt-0.5 ${mutedText}`}>
            Model: {ledger.activeModelId}
          </div>
        </div>
        <div className={`rounded-xl border p-3 ${subCard}`}>
          <div className={`text-[10.5px] ${mutedText}`}>Actual Billed Cost</div>
          <div className="text-lg font-extrabold font-mono tabular-nums text-[#2563EB] mt-0.5">
            ${ledger.totalActualCostUsd.toFixed(4)}
          </div>
          <div className={`text-[10px] font-mono mt-0.5 ${mutedText}`}>
            {isFreeTierKeyMode ? 'Free API Key ($0 billed)' : 'Commercial Paid Key'}
          </div>
        </div>
        <div className={`rounded-xl border p-3 ${subCard}`}>
          <div className={`text-[10.5px] ${mutedText}`}>
            Chat Box &amp; Active Agents
          </div>
          <div className="text-lg font-extrabold font-mono tabular-nums text-amber-500 mt-0.5">
            {ledger.chatBoxTokens.toLocaleString()} tok
          </div>
          <div className={`text-[10px] font-mono mt-0.5 ${mutedText}`}>
            Active Agents: {ledger.activeAgentsCount} / 36
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className={`inline-flex rounded-xl border p-1 gap-1 ${
            isLightTheme ? 'border-slate-200 bg-slate-100' : 'border-slate-800 bg-slate-900/80'
          }`}
        >
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
              data-v5-solid={filterMode === tab.id ? 'true' : undefined}
              onClick={() => setFilterMode(tab.id)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                filterMode === tab.id
                  ? 'bg-[#1D4ED8] text-white'
                  : isLightTheme
                    ? 'text-slate-600 hover:text-slate-900'
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
          className={`rounded-xl border px-3 py-1.5 text-[11px] focus:border-[#2563EB] focus:outline-none w-64 ${
            isLightTheme
              ? 'border-slate-200 bg-[#F8FAFC] text-slate-900 placeholder-slate-400'
              : 'border-slate-800 bg-slate-900 text-slate-200 placeholder-slate-500'
          }`}
        />
      </div>

      {/* 37-Row Per-Agent & Chat Box Zero-Based Token Table */}
      <div
        className={`overflow-x-auto max-h-[380px] overflow-y-auto rounded-xl border ${
          isLightTheme ? 'border-slate-200' : 'border-slate-800/80'
        }`}
      >
        <table className="w-full text-left border-collapse text-[11px]">
          <thead
            className={`sticky top-0 z-10 ${
              isLightTheme ? 'bg-[#F8FAFC]' : 'bg-slate-900'
            }`}
          >
            <tr
              className={`border-b font-mono ${
                isLightTheme
                  ? 'border-slate-200 text-slate-500'
                  : 'border-slate-800 text-slate-400'
              }`}
            >
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
          <tbody
            className={isLightTheme ? 'divide-y divide-slate-200' : 'divide-y divide-slate-900'}
          >
            {filteredRows.map((row) => (
              <tr
                key={row.rowId}
                className={`${
                  isLightTheme
                    ? `hover:bg-slate-50 ${row.isChatBox ? 'bg-blue-50/70' : 'bg-white'}`
                    : `hover:bg-slate-900/60 ${row.isChatBox ? 'bg-sky-950/20' : ''}`
                }`}
              >
                <td className="py-2 px-3">
                  <div className="font-bold flex items-center gap-1.5">
                    {row.isChatBox && (
                      <span className="rounded bg-blue-500/15 border border-blue-500/30 px-1.5 py-0.2 text-[9px] font-mono text-[#2563EB]">
                        CHAT
                      </span>
                    )}
                    <span>{row.displayName}</span>
                  </div>
                  <div className={`text-[10px] truncate max-w-[260px] ${mutedText}`}>
                    {row.lastActionSummary}
                  </div>
                </td>
                <td className={`py-2 px-2 ${isLightTheme ? 'text-slate-600' : 'text-slate-300'}`}>
                  {row.departmentName}
                </td>
                <td className="py-2 px-2">
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[9.5px] font-mono ${
                      isLightTheme
                        ? 'bg-slate-100 border-slate-200 text-[#1D4ED8]'
                        : 'bg-slate-900 border-slate-700/80 text-sky-300'
                    }`}
                  >
                    {row.apiKeySlot}
                  </span>
                </td>
                <td
                  className={`py-2 px-2 text-right font-mono tabular-nums ${
                    isLightTheme ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {row.apiCallsCount}
                </td>
                <td
                  className={`py-2 px-2 text-right font-mono tabular-nums ${
                    isLightTheme ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {row.promptTokens.toLocaleString()}
                </td>
                <td
                  className={`py-2 px-2 text-right font-mono tabular-nums ${
                    isLightTheme ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {row.completionTokens.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-right font-mono tabular-nums font-bold text-[#2563EB]">
                  {row.totalTokens.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-right font-mono tabular-nums font-bold text-emerald-500">
                  ${row.shadowCostUsd.toFixed(4)}
                </td>
                <td className="py-2 px-3 text-right">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold ${
                      row.status === 'active'
                        ? isLightTheme
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : isLightTheme
                          ? 'bg-slate-100 text-slate-500 border border-slate-200'
                          : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        row.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
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
      <div className={`rounded-xl border p-3.5 space-y-2 ${subCard}`}>
        <div
          className={`text-[10.5px] font-bold uppercase tracking-wider ${
            isLightTheme ? 'text-slate-600' : 'text-slate-300'
          }`}
        >
          Live Metered Event Feed ({ledger.recentEvents.length})
        </div>
        {ledger.recentEvents.length === 0 ? (
          <p className={`text-[11px] ${mutedText}`}>
            Session initialized at 0 tokens ($0.0000). Send a chat command, run the live
            5-step pipeline, or click &ldquo;Meter 1 Full Circle&rdquo; to watch real-time
            per-agent token increments.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {ledger.recentEvents.slice(0, 8).map((ev) => (
              <div
                key={ev.eventId}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-[10.5px] ${
                  isLightTheme
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-950/70 border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[#2563EB] shrink-0">
                    {ev.apiKeySlot}
                  </span>
                  <span className="font-bold shrink-0">{ev.actorName}</span>
                  <span className={`truncate max-w-[320px] ${mutedText}`}>
                    {ev.actionLabel}
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-500 shrink-0 tabular-nums">
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

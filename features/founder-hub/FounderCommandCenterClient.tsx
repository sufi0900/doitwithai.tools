"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  FOUNDER_WORKBOOK_CORE,
  MULTI_AI_COLLABORATION_PROTOCOL,
  EXECUTIVE_KPI_CARDS,
  WEEKLY_EXECUTION_SEQUENCE,
  SYSTEM_ARCHITECTURE_DEPENDENCY_MAP,
  FOUNDER_AI_CHANGELOG,
  type TableSheetData,
} from "@/lib/founder-hub/data";

interface Props {
  initialAuthenticated: boolean;
  handbookMarkdown: string;
  masterPromptText: string;
}

type MainTabId =
  | "overview"
  | "keyword-plan-64"
  | "expansion-370"
  | "ctr-guides-brand"
  | "gsc-technical-audit"
  | "large-semrush-review"
  | "handbook-prompt"
  | "architecture-manual"
  | "founder-ai-log";

function exportRowsToCsv(filename: string, headers: string[], rows: string[][]) {
  const escapeCell = (val: string) => {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const csvLines = [
    headers.map(escapeCell).join(","),
    ...rows.map((r) => r.map(escapeCell).join(",")),
  ];
  const blob = new Blob([csvLines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function InteractiveSheetViewer({
  title,
  subtitle,
  sheet,
  csvFilename,
  filterColIdx,
  filterLabel,
  defaultPageSize = 50,
}: {
  title: string;
  subtitle?: string;
  sheet: TableSheetData;
  csvFilename: string;
  filterColIdx?: number;
  filterLabel?: string;
  defaultPageSize?: number;
}) {
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const filterOptions = useMemo(() => {
    if (filterColIdx === undefined) return [];
    const set = new Set<string>();
    for (const r of sheet.rows) {
      const val = (r[filterColIdx] || "").trim();
      if (val) set.add(val);
    }
    return Array.from(set);
  }, [sheet.rows, filterColIdx]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = sheet.rows.filter((r) => {
      if (
        filterColIdx !== undefined &&
        selectedFilter !== "ALL" &&
        (r[filterColIdx] || "").trim() !== selectedFilter
      ) {
        return false;
      }
      if (!q) return true;
      return r.some((cell) => String(cell).toLowerCase().includes(q));
    });

    if (sortCol !== null) {
      list = [...list].sort((a, b) => {
        const va = a[sortCol] ?? "";
        const vb = b[sortCol] ?? "";
        const na = parseFloat(String(va).replace(/[^0-9.-]/g, ""));
        const nb = parseFloat(String(vb).replace(/[^0-9.-]/g, ""));
        if (!Number.isNaN(na) && !Number.isNaN(nb) && String(va).match(/^[0-9.,%-]+$/)) {
          return sortAsc ? na - nb : nb - na;
        }
        return sortAsc
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va));
      });
    }
    return list;
  }, [sheet.rows, search, selectedFilter, filterColIdx, sortCol, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safePage, pageSize]);

  const handleSort = (idx: number) => {
    if (sortCol === idx) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(idx);
      setSortAsc(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
            <span>{title}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {filteredRows.length.toLocaleString()} / {sheet.rows.length.toLocaleString()} rows
            </span>
          </h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search keyword, URL, brief, cluster..."
            className="w-full sm:w-64 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />

          {filterColIdx !== undefined && filterOptions.length > 0 && (
            <select
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setPage(1);
              }}
              aria-label={filterLabel || "Filter"}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All {filterLabel || "Categories"} ({sheet.rows.length})</option>
              {filterOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            aria-label="Rows per page"
            className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
          >
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
            <option value={250}>250 / page</option>
          </select>

          <button
            type="button"
            onClick={() => exportRowsToCsv(csvFilename, sheet.headers, filteredRows)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition"
          >
            ⬇ Export CSV ({filteredRows.length})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[680px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-950/95 sticky top-0 z-10 border-b border-slate-800">
            <tr>
              {sheet.headers.map((h, i) => (
                <th
                  key={i}
                  onClick={() => handleSort(i)}
                  className="py-3 px-3.5 font-semibold text-slate-300 cursor-pointer hover:text-white select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>{h || `Col ${i + 1}`}</span>
                    {sortCol === i && (
                      <span className="text-blue-400">{sortAsc ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={sheet.headers.length}
                  className="py-10 text-center text-slate-500"
                >
                  No matching rows found for your current search/filter.
                </td>
              </tr>
            ) : (
              visibleRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-slate-800/50 transition-colors align-top"
                >
                  {sheet.headers.map((_, cIdx) => {
                    const cell = row[cIdx] ?? "";
                    const isUrl =
                      typeof cell === "string" &&
                      (cell.startsWith("http://") ||
                        cell.startsWith("https://") ||
                        cell.startsWith("/tools/") ||
                        cell.startsWith("/ai-"));
                    const href = cell.startsWith("/")
                      ? cell
                      : cell.replace("https://doitwithai.tools", "") || "/";

                    // Highlight Nov 9 Batch 2 or high-priority badges
                    const isBadgeCol =
                      sheet.headers[cIdx]?.toLowerCase().includes("when") ||
                      sheet.headers[cIdx]?.toLowerCase().includes("priority") ||
                      sheet.headers[cIdx]?.toLowerCase().includes("strategic view") ||
                      sheet.headers[cIdx]?.toLowerCase().includes("disposition");

                    return (
                      <td
                        key={cIdx}
                        className="py-2.5 px-3.5 text-slate-300 max-w-[340px] break-words leading-relaxed"
                      >
                        {isUrl ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 font-mono text-[11px] break-all"
                          >
                            {cell}
                          </a>
                        ) : isBadgeCol && cell ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                              cell.toLowerCase().includes("flagship") ||
                              cell.toLowerCase().includes("quick win") ||
                              cell.toLowerCase().includes("high") ||
                              cell.toLowerCase().includes("1 -")
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : cell.toLowerCase().includes("improve") ||
                                  cell.toLowerCase().includes("tools-based")
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : cell.toLowerCase().includes("agents") ||
                                  cell.toLowerCase().includes("publish")
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}
                          >
                            {cell}
                          </span>
                        ) : (
                          cell
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing page <span className="text-white font-semibold">{safePage}</span> of{" "}
            <span className="text-white font-semibold">{totalPages}</span> (
            {filteredRows.length.toLocaleString()} total rows)
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-medium"
            >
              ← Prev
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-medium"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FounderCommandCenterClient({
  initialAuthenticated,
  handbookMarkdown,
  masterPromptText,
}: Props) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<MainTabId>("overview");
  const [ctrSubTab, setCtrSubTab] = useState<"ctr" | "guides32" | "brand6" | "aitask">("ctr");
  const [gscSubTab, setGscSubTab] = useState<
    "pages" | "queries" | "countries" | "daily" | "indexing" | "live-audit"
  >("pages");

  // On-demand state for large datasets (2,621 Keyword Review & 3,700 Raw Semrush)
  const [largeSheets, setLargeSheets] = useState<Record<string, TableSheetData> | null>(null);
  const [largeLoading, setLargeLoading] = useState(false);
  const [largeActiveSheet, setLargeActiveSheet] = useState<"Keyword Review" | "Raw Semrush">(
    "Keyword Review"
  );

  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/founder-hub/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: passkeyInput }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAuthError(data.error || "Invalid passkey");
      } else {
        setAuthenticated(true);
      }
    } catch {
      setAuthError("Network error while verifying Founder passkey.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/founder-hub/auth", { method: "DELETE" });
    setAuthenticated(false);
    setPasskeyInput("");
  };

  const loadLargeSheetsIfNeeded = useCallback(async () => {
    if (largeSheets || largeLoading) return;
    setLargeLoading(true);
    try {
      const res = await fetch("/api/founder-hub/large-sheets");
      const json = await res.json();
      if (json.ok && json.sheets) {
        setLargeSheets(json.sheets);
      }
    } catch (err) {
      console.error("Failed to load large sheets:", err);
    } finally {
      setLargeLoading(false);
    }
  }, [largeSheets, largeLoading]);

  const handleCopyMasterPrompt = async () => {
    try {
      await navigator.clipboard.writeText(masterPromptText);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch {
      // Fallback
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4">
            <span>🔒 Protected Founder & Multi-AI Route</span>
            <span>·</span>
            <span>NoIndex / NoFollow</span>
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            DoItWithAI Founder Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Restricted to <strong className="text-slate-200">Sufian Mustafa (Founder)</strong> and
            authorized AI coding agents with repository access. Blocked from Googlebot, search
            crawlers, and public navigation.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Founder Passkey / Credential
              </label>
              <input
                type="password"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Enter Founder Passkey..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg transition disabled:opacity-50"
            >
              {authLoading ? "Verifying Credential..." : "Unlock Founder Command Center →"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <p className="font-semibold text-slate-300">🤖 Note for AI Coding Agents:</p>
            <p>
              If you have GitHub / repository access, all structured data powering this dashboard is
              stored directly in{" "}
              <code className="text-blue-400 font-mono">lib/founder-hub/data.ts</code>,{" "}
              <code className="text-blue-400 font-mono">lib/founder-hub/workbook-core.json</code>,
              and <code className="text-blue-400 font-mono">docs/TOOL_OPTIMIZATION_RULES.md</code>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sheets = FOUNDER_WORKBOOK_CORE.sheets;

  const navTabs: { id: MainTabId; label: string; badge?: string }[] = [
    { id: "overview", label: "1. Command Hub & AI Protocol", badge: "Start Here" },
    { id: "keyword-plan-64", label: "2. Master 64 Keyword & Tool Plan", badge: "Nov 9 Batch 2" },
    { id: "expansion-370", label: "3. 370 Curated Expansion Views", badge: "88.2K Vol" },
    { id: "ctr-guides-brand", label: "4. CTR Playbook, 32 Guides & Brand", badge: "48 Items" },
    { id: "gsc-technical-audit", label: "5. GSC Pages, Queries, Indexing & Audit", badge: "6 Tabs" },
    { id: "large-semrush-review", label: "6. Full 2,621 Review & 3,700 Semrush DB", badge: "6,321 Rows" },
    { id: "handbook-prompt", label: "7. Industrial Tool Handbook & Master Prompt", badge: "Copy Prompt" },
    { id: "architecture-manual", label: "8. System Architecture & /do-it-ai Manual", badge: "Dependencies" },
    { id: "founder-ai-log", label: "9. Founder & Multi-AI Changelog", badge: `${FOUNDER_AI_CHANGELOG.length} Logs` },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Command Bar */}
      <div className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-black text-white text-sm shadow">
              AI
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-extrabold text-white">
                  DoItWithAI.tools — Founder & Multi-AI Command Center
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Protected · NoIndex
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Updated Nov 9, 2026 (Batch 2)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Unified Documentation, 15-Sheet SEO/Keyword Studio, Architecture Dependency Map &
                Multi-AI Progress Log
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <a
              href="/tools/quote-stat-testimonial-card-studio"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-blue-300 border border-slate-700"
            >
              ★ Gold-Standard Tool Reference ↗
            </a>
            <a
              href="/do-it-ai"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 border border-slate-700"
            >
              ⚡ Open /do-it-ai ↗
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-xs font-semibold text-rose-300 border border-rose-500/30"
            >
              Lock Session
            </button>
          </div>
        </div>

        {/* Navigation Pills */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {navTabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveTab(t.id);
                  if (t.id === "large-semrush-review") {
                    loadLargeSheetsIfNeeded();
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border ${
                  active
                    ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/25"
                    : "bg-slate-950/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                }`}
              >
                <span>{t.label}</span>
                {t.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* TAB 1: OVERVIEW & MULTI-AI PROTOCOL */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Prominent Multi-AI Collaboration Protocol Banner */}
            <div className="rounded-3xl border border-blue-500/40 bg-gradient-to-br from-blue-950/70 via-slate-900 to-indigo-950/70 p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-blue-500/20 pb-5">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                    🤖 Mandatory Multi-AI Collaboration Protocol
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                    {MULTI_AI_COLLABORATION_PROTOCOL.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    {MULTI_AI_COLLABORATION_PROTOCOL.subtitle}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("handbook-prompt")}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow"
                  >
                    📋 Get Universal AI Upgrade Prompt →
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("keyword-plan-64")}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
                  >
                    📊 Open 64-Item Master Plan →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {MULTI_AI_COLLABORATION_PROTOCOL.agentDuties.map((d, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-slate-950/75 border border-slate-800 p-4 space-y-2"
                  >
                    <div className="text-xs font-extrabold text-blue-400 uppercase tracking-wide">
                      {d.step}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{d.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-200">Key Files for AI Agents:</span>
                  <code className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-blue-300">
                    lib/founder-hub/data.ts
                  </code>
                  <code className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-blue-300">
                    lib/founder-hub/workbook-core.json
                  </code>
                  <code className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-blue-300">
                    docs/TOOL_OPTIMIZATION_RULES.md
                  </code>
                </div>
                <span className="text-emerald-400 font-semibold">
                  ✓ 100% Blocked from Googlebot & Public Visitors
                </span>
              </div>
            </div>

            {/* Executive KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {EXECUTIVE_KPI_CARDS.map((card) => (
                <div
                  key={card.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-400">{card.label}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                      {card.badge}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-3">
                    {card.value}
                  </div>
                  <div className="text-xs text-slate-400 mt-1.5">{card.subtext}</div>
                </div>
              ))}
            </div>

            {/* Nov 9 Batch 2 Breakout Additions (#57 - #64) Spotlight */}
            <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    🚀 Latest Nov 9, 2026 (Batch 2) Additions — Orders #57 to #64
                  </span>
                  <h3 className="text-lg font-extrabold text-white mt-0.5">
                    High-Volume AI Content Writer, Pricing Calculator & Quiz Generator Cluster
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("keyword-plan-64")}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold"
                >
                  View All 64 Items in Sheet →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {sheets["Keyword Plan"].rows.slice(56, 64).map((r) => (
                  <div
                    key={r[0]}
                    className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                        Order #{r[0]} · {r[1]}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Vol: <strong className="text-white">{r[4]}</strong> · KD:{" "}
                        <strong className="text-emerald-300">{r[5]}%</strong>
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">{r[2]}</div>
                    <div className="text-xs text-blue-300 font-mono break-all">
                      Keyword: &ldquo;{r[3]}&rdquo; → {r[7]}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {r[8]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 8–12 Week Execution Sequence */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                🗓️ Master 8–12 Week Execution Sequence
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {WEEKLY_EXECUTION_SEQUENCE.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-extrabold text-blue-400">
                          {item.window}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {item.status}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white mb-1.5">{item.focus}</div>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 64-ITEM KEYWORD & TOOL EXECUTION PLAN */}
        {activeTab === "keyword-plan-64" && (
          <InteractiveSheetViewer
            title="Sheet 2: 64-Item Master Keyword & Tool Execution Plan (Updated Nov 9 Batch 2)"
            subtitle="Includes Orders #1–#56 plus the new Nov 9 Batch 2 additions (#57 Flagship AI Content Writer Studio, #58 SEO Pricing Calculator Vol 3,600 KD 7, #59 Article-to-Quiz Generator Vol 1,600 KD 14, #60–#64)."
            sheet={sheets["Keyword Plan"]}
            csvFilename="doitwithai-64-keyword-plan-nov9.csv"
            filterColIdx={1}
            filterLabel="Sprint Priority (When)"
            defaultPageSize={100}
          />
        )}

        {/* TAB 3: 370 CURATED EXPANSION KEYWORDS & 4 STRATEGIC VIEWS */}
        {activeTab === "expansion-370" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {sheets["Filtered Expansion Views"].summary.rows.map((r, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border p-4 ${
                    i === 4
                      ? "border-emerald-500/40 bg-emerald-950/30"
                      : "border-slate-800 bg-slate-900/90"
                  }`}
                >
                  <div className="text-xs font-bold text-slate-300">{r[0]}</div>
                  <div className="text-2xl font-black text-white mt-2">
                    {Number(r[1]).toLocaleString()}{" "}
                    <span className="text-xs font-normal text-slate-400">keywords</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Vol:{" "}
                    <strong className="text-emerald-300">
                      {Number(r[2]).toLocaleString()}/mo
                    </strong>{" "}
                    · Avg KD:{" "}
                    <strong className="text-blue-300">
                      {Number(r[3]).toFixed(1)}%
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            <InteractiveSheetViewer
              title="Sheet 3: Filtered Keyword Expansion Master View (370 Curated Keywords · 88,281 Monthly Volume)"
              subtitle="Filter by Strategic View (Tools-Based Keyword, AI Agents & Chatbot Expansion, Blog & Informational Guide, Prompts-Based Keyword) or search any cluster."
              sheet={sheets["Filtered Expansion Views"].table}
              csvFilename="doitwithai-370-curated-expansion-keywords.csv"
              filterColIdx={0}
              filterLabel="Strategic View"
              defaultPageSize={100}
            />
          </div>
        )}

        {/* TAB 4: CTR PLAYBOOK, 32 GUIDES & 6 BRAND DOMINANCE LAYERS */}
        {activeTab === "ctr-guides-brand" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              {[
                {
                  id: "ctr" as const,
                  label: "1. CTR & Code Conversion Playbook (10 Actions)",
                },
                {
                  id: "guides32" as const,
                  label: "2. 2026–2027 'What AI Can Do' Blog Plan (32 Guides)",
                },
                {
                  id: "brand6" as const,
                  label: "3. 'Do It With AI' Brand Dominance Blueprint (6 Layers)",
                },
                {
                  id: "aitask" as const,
                  label: "4. Conversational 'AI Do It' Task Queries (34 Seeds)",
                },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setCtrSubTab(st.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    ctrSubTab === st.id
                      ? "bg-emerald-600 text-white border-emerald-500"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {ctrSubTab === "ctr" && (
              <InteractiveSheetViewer
                title="Sheet 13: CTR, AI-Overview Defense & Code-Level Conversion Playbook (10 Priority Actions)"
                subtitle="Solves the 22,522 Impressions / 38 Clicks gap with copy-paste SEO titles, meta descriptions, and above-the-fold interactive widgets."
                sheet={sheets["CTR & Conversion Playbook"]}
                csvFilename="doitwithai-ctr-conversion-playbook.csv"
                filterColIdx={8}
                filterLabel="Target Sprint"
              />
            )}

            {ctrSubTab === "guides32" && (
              <InteractiveSheetViewer
                title="Sheet 14: 2026–2027 'What AI Can Do' General & Vertical Content Plan (32 High-Intent Guides)"
                subtitle="Organized across 7 Category Pillars (General AI, AI for SEO, Content Writing, Digital Marketing, Social & Video, Web & Code, 2026–2027 AI Agents & Models)."
                sheet={sheets["2026-2027 AI Capabilities"]}
                csvFilename="doitwithai-32-what-ai-can-do-guides.csv"
                filterColIdx={1}
                filterLabel="Category Pillar"
              />
            )}

            {ctrSubTab === "brand6" && (
              <InteractiveSheetViewer
                title="Sheet 15: 'Do It With AI' Brand & Conversational Query Dominance Blueprint (6 Layers)"
                subtitle="Turns our exact domain phrase ('Do It With AI') into a repeatable task-verb authority system across Homepage, /tools, tool studios, and blog guides."
                sheet={sheets["Do It With AI Brand Plan"]}
                csvFilename="doitwithai-brand-dominance-blueprint.csv"
              />
            )}

            {ctrSubTab === "aitask" && (
              <InteractiveSheetViewer
                title="Sheet 12: AI Task & Conversational Queries ('ai do it', 'can ai do it for me')"
                subtitle="34 conversational and task-routing query seeds mapped to target hubs and specific tool demonstrations."
                sheet={sheets["AI Task Queries"]}
                csvFilename="doitwithai-ai-task-queries.csv"
                filterColIdx={4}
                filterLabel="Topic Group"
              />
            )}
          </div>
        )}

        {/* TAB 5: GSC PAGES, QUERIES, COUNTRIES, DAILY, INDEXING & LIVE AUDIT */}
        {activeTab === "gsc-technical-audit" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "pages" as const, label: "Existing Pages (81 URLs)" },
                { id: "queries" as const, label: "GSC Queries (892 Queries)" },
                { id: "countries" as const, label: "GSC Countries (146 Countries)" },
                { id: "daily" as const, label: "GSC Daily Chart (92 Days)" },
                { id: "indexing" as const, label: "Indexing Coverage (63 Indexed / 81 Excluded)" },
                { id: "live-audit" as const, label: "Live Technical & 144-URL Sitemap Audit" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setGscSubTab(st.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    gscSubTab === st.id
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {gscSubTab === "pages" && (
              <InteractiveSheetViewer
                title="Sheet 4: Existing Pages Performance & Action Plan (81 URLs in GSC)"
                subtitle="Sorted by priority and impressions with concrete page-level actions."
                sheet={sheets["Existing Pages"]}
                csvFilename="doitwithai-gsc-existing-pages-81.csv"
                filterColIdx={5}
                filterLabel="Priority"
                defaultPageSize={100}
              />
            )}

            {gscSubTab === "queries" && (
              <InteractiveSheetViewer
                title="Sheet 8: Google Search Console Queries (892 Exported Queries)"
                subtitle="Search or sort by Clicks, Impressions, CTR, or Position."
                sheet={sheets["GSC Queries"]}
                csvFilename="doitwithai-gsc-queries-892.csv"
                defaultPageSize={100}
              />
            )}

            {gscSubTab === "countries" && (
              <InteractiveSheetViewer
                title="Sheet 9: Google Search Console Countries (146 Countries)"
                subtitle="Geographic breakdown of clicks, impressions, CTR, and average position."
                sheet={sheets["GSC Countries"]}
                csvFilename="doitwithai-gsc-countries-146.csv"
                defaultPageSize={100}
              />
            )}

            {gscSubTab === "daily" && (
              <InteractiveSheetViewer
                title="Sheet 7: Google Search Console Daily Performance (92 Days)"
                subtitle="Daily clicks, impressions, CTR, and average position."
                sheet={sheets["GSC Daily"]}
                csvFilename="doitwithai-gsc-daily-92.csv"
                defaultPageSize={100}
              />
            )}

            {gscSubTab === "indexing" && (
              <div className="space-y-6">
                <InteractiveSheetViewer
                  title="Sheet 10A: Google Search Console Indexing Exclusions Breakdown (81 Excluded / 63 Indexed)"
                  subtitle="31 redirects, 25 404s, 7 noindex, 4 duplicates, 2 5xx, 1 redirect error, 9 crawled-not-indexed, 2 discovered-not-indexed."
                  sheet={sheets.Indexing.exclusions}
                  csvFilename="doitwithai-indexing-exclusions.csv"
                />
                <InteractiveSheetViewer
                  title="Sheet 10B: Indexing Growth Timeline (Indexed Pages Climbed from 32 -> 63)"
                  subtitle="Historical coverage snapshot progression."
                  sheet={sheets.Indexing.timeline}
                  csvFilename="doitwithai-indexing-timeline.csv"
                  defaultPageSize={100}
                />
              </div>
            )}

            {gscSubTab === "live-audit" && (
              <div className="space-y-6">
                <InteractiveSheetViewer
                  title="Sheet 11A: Live Technical SEO Audit Findings (8 Priority Checks)"
                  subtitle="Public HTML, PortableText table renderer, TOC consistency, and Core Web Vitals checks."
                  sheet={sheets["Live Audit"].findings}
                  csvFilename="doitwithai-live-audit-findings.csv"
                  filterColIdx={0}
                  filterLabel="Priority"
                />
                <InteractiveSheetViewer
                  title="Sheet 11B: Live Sitemap HTTP Status Verification (144 URLs · 144 HTTP 200 OK)"
                  subtitle="Every URL in https://doitwithai.tools/sitemap.xml verified."
                  sheet={sheets["Live Audit"].sitemapChecks}
                  csvFilename="doitwithai-144-sitemap-http-checks.csv"
                  defaultPageSize={100}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 6: FULL 2,621 KEYWORD REVIEW & 3,700 RAW SEMRUSH DB */}
        {activeTab === "large-semrush-review" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {(["Keyword Review", "Raw Semrush"] as const).map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setLargeActiveSheet(name)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                      largeActiveSheet === name
                        ? "bg-purple-600 text-white border-purple-500"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {name === "Keyword Review"
                      ? "Sheet 5: Keyword Review (2,621 Deduplicated Phrases)"
                      : "Sheet 6: Raw Semrush Database (3,700 Source Records)"}
                  </button>
                ))}
              </div>
            </div>

            {largeLoading && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-12 text-center text-sm text-slate-300">
                ⏳ Loading 6,321 keyword records from protected server store...
              </div>
            )}

            {!largeLoading && largeSheets && largeSheets[largeActiveSheet] && (
              <InteractiveSheetViewer
                title={
                  largeActiveSheet === "Keyword Review"
                    ? "Sheet 5: Complete Keyword Review Ledger (2,621 Unique Phrases After Nov 9 Batch 2)"
                    : "Sheet 6: Complete Raw Semrush Export Database (3,700 Records Across All Batches)"
                }
                subtitle="Full searchable, sortable, filterable database with 1-click CSV export."
                sheet={largeSheets[largeActiveSheet]}
                csvFilename={
                  largeActiveSheet === "Keyword Review"
                    ? "doitwithai-2621-keyword-review.csv"
                    : "doitwithai-3700-raw-semrush.csv"
                }
                filterColIdx={largeActiveSheet === "Keyword Review" ? 3 : 1}
                filterLabel={largeActiveSheet === "Keyword Review" ? "Disposition" : "Search Intent"}
                defaultPageSize={100}
              />
            )}
          </div>
        )}

        {/* TAB 7: INDUSTRIAL TOOL OPTIMIZATION HANDBOOK & MASTER PROMPT */}
        {activeTab === "handbook-prompt" && (
          <div className="space-y-6">
            {/* 1-Click Copy Universal AI Upgrade Prompt Box */}
            <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-emerald-500/20">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Section 8 · Universal Copy-Paste Prompt
                  </span>
                  <h2 className="text-xl font-extrabold text-white mt-1.5">
                    Copy-Paste Master Prompt for Any AI Agent (Gemini, Claude, Cursor, Windsurf)
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Replace <code className="text-emerald-300">[TOOL_NAME]</code>,{" "}
                    <code className="text-emerald-300">[TOOL_SLUG]</code>, and{" "}
                    <code className="text-emerald-300">[PRIMARY_KEYWORDS]</code> when instructing any
                    AI to build or upgrade a tool.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyMasterPrompt}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition whitespace-nowrap"
                >
                  {copiedPrompt ? "✓ Copied Master Prompt!" : "📋 Copy Master AI Prompt"}
                </button>
              </div>

              <pre className="mt-4 p-4 rounded-2xl bg-slate-950/95 border border-slate-800 text-xs text-emerald-200 font-mono whitespace-pre-wrap overflow-x-auto max-h-[360px] leading-relaxed">
                {masterPromptText}
              </pre>
            </div>

            {/* Full Handbook Renderer */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    📘 Complete Industrial Tool Optimization Handbook (`docs/TOOL_OPTIMIZATION_RULES.md`)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Documents the 7-stage evolution post-mortem of `/tools/quote-stat-testimonial-card-studio`, mathematical zero-overlap canvas rules, architectural portrait framing, and SEO/AEO standards.
                  </p>
                </div>
              </div>
              <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {handbookMarkdown}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 8: SYSTEM ARCHITECTURE, TOOL DEPENDENCIES & /DO-IT-AI MANUAL */}
        {activeTab === "architecture-manual" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-indigo-500/40 bg-slate-900/90 p-6 sm:p-8">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Architecture & Dependency Manual
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                How All 104+ Tools, `/do-it-ai`, Portable Apps & the 4-Tier AI Failover Engine Connect
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Every AI agent MUST check this dependency map before adding a new tool or modifying
                shared components so nothing breaks across `/tools`, `/do-it-ai`, or `app/sitemap.js`.
              </p>

              <div className="grid grid-cols-1 gap-5 mt-6">
                {SYSTEM_ARCHITECTURE_DEPENDENCY_MAP.map((node) => (
                  <div
                    key={node.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/85 p-5 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="text-base font-extrabold text-white">{node.title}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {node.filePaths.map((fp) => (
                          <code
                            key={fp}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-blue-300 font-mono"
                          >
                            {fp}
                          </code>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{node.role}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="rounded-xl bg-slate-900/80 border border-slate-800/80 p-3.5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Connected Routes & Modules
                        </div>
                        <ul className="space-y-1 text-xs text-slate-300 font-mono">
                          {node.dependencies.map((dep, i) => (
                            <li key={i}>• {dep}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-xl bg-emerald-950/25 border border-emerald-500/25 p-3.5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
                          Mandatory Checklist When Adding / Upgrading a Tool
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-200">
                          {node.whenAddingOrUpgradingTool.map((rule, i) => (
                            <li key={i}>✓ {rule}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: FOUNDER DISCUSSIONS & MULTI-AI WORK LOG */}
        {activeTab === "founder-ai-log" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-extrabold text-white">
                    📜 Chronological Founder Discussions & Multi-AI Implementation Ledger
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Tracks every Founder request, architectural decision, AI implementation, touched
                    file list, and commit hash. Whenever any AI completes a task, append a new entry
                    to <code className="text-blue-400">FOUNDER_AI_CHANGELOG</code> in{" "}
                    <code className="text-blue-400">lib/founder-hub/data.ts</code>.
                  </p>
                </div>
              </div>

              <div className="space-y-6 mt-6">
                {FOUNDER_AI_CHANGELOG.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/85 p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold font-mono">
                          {entry.date}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                          {entry.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                          {entry.status}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-400">
                        Commits: <span className="text-slate-200">{entry.commits.join(", ")}</span>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold text-white">
                      {entry.title}
                    </h3>

                    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
                      <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                        Founder Request & Strategic Discussion
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {entry.founderRequestSummary}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                        What the AI Engineered & Shipped
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                        {entry.aiImplementationDetails.map((detail, i) => (
                          <li key={i}>• {detail}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1">
                        Files Touched:
                      </span>
                      {entry.filesTouched.map((f) => (
                        <code
                          key={f}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono"
                        >
                          {f}
                        </code>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

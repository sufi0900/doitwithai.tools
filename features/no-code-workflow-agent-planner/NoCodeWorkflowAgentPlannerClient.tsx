"use client";

import React, { useRef, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  Download,
  GitBranch,
  RotateCcw,
  Sheet,
  Terminal,
  Wand2,
} from "lucide-react";
import {
  DEFAULT_NOCODE_WORKFLOW_INPUT,
  buildDeterministicNoCodeWorkflowPack,
  type NoCodeWorkflowPlannerInput,
  type NoCodeWorkflowPlannerPack,
} from "./model";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";

export default function NoCodeWorkflowAgentPlannerClient() {
  const [input, setInput] = useState<NoCodeWorkflowPlannerInput>(
    DEFAULT_NOCODE_WORKFLOW_INPUT,
  );
  const [pack, setPack] = useState<NoCodeWorkflowPlannerPack>(() =>
    buildDeterministicNoCodeWorkflowPack(DEFAULT_NOCODE_WORKFLOW_INPUT),
  );
  const [activeTab, setActiveTab] = useState<
    "architecture" | "sheets-formulas" | "prompts-vs" | "n8n-json"
  >("architecture");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  function updateField<K extends keyof NoCodeWorkflowPlannerInput>(
    key: K,
    value: NoCodeWorkflowPlannerInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRunAgent(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    await paintToolFeedback();
    try {
      const res = await fetch(
        "/api/ai-tools/no-code-workflow-agent-planner",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      const data = await res.json().catch(() => null);
      if (res.ok && data?.pack) {
        setPack(data.pack);
        notify("No-Code AI Agent Architecture & n8n Blueprint generated!");
      } else {
        setPack(buildDeterministicNoCodeWorkflowPack(input));
        notify("No-Code AI Agent Architecture & n8n Blueprint built!");
      }
      setTimeout(() => focusToolSection(resultsRef.current), 60);
    } catch {
      setPack(buildDeterministicNoCodeWorkflowPack(input));
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadSample() {
    setLoading(true);
    await paintToolFeedback(400);
    setInput(DEFAULT_NOCODE_WORKFLOW_INPUT);
    setPack(
      buildDeterministicNoCodeWorkflowPack(DEFAULT_NOCODE_WORKFLOW_INPUT),
    );
    setLoading(false);
    notify("Loaded sample Google Sheets + Calendar + n8n AI Agent workflow.");
  }

  function downloadFile(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section
      id="no-code-workflow-agent-planner"
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6"
    >
      <ToolRunOverlay
        active={loading}
        title="Architecting No-Code AI Agent & Capacity Blueprint"
        description="Designing your 4-node n8n / Sheets / Calendar workflow, spreadsheet formulas, system prompts, and downloadable n8n JSON blueprint."
      />

      {toast && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300"
        >
          <Check size={15} />
          {toast}
        </div>
      )}

      <div className="grid items-start gap-7 lg:grid-cols-12">
        <form
          onSubmit={handleRunAgent}
          className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6 lg:col-span-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                No-Code Agent Planner
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Task, Sheets &amp; Capacity Setup
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void handleLoadSample()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <RotateCcw size={13} />
              Sample Workflow
            </button>
          </div>

          <div>
            <label
              htmlFor="ncwp-task"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Describe Your Repetitive Business Task *
            </label>
            <textarea
              id="ncwp-task"
              rows={3}
              required
              value={input.workflowTaskDescription}
              onChange={(e) =>
                updateField("workflowTaskDescription", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs leading-relaxed text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="ncwp-platform"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              AI Agent Orchestration Platform
            </label>
            <select
              id="ncwp-platform"
              value={input.orchestrationPlatform}
              onChange={(e) =>
                updateField(
                  "orchestrationPlatform",
                  e.target
                    .value as NoCodeWorkflowPlannerInput["orchestrationPlatform"],
                )
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="n8n + Google Sheets & Google Calendar API">
                n8n + Google Sheets &amp; Google Calendar API
              </option>
              <option value="Excel / Microsoft 365 + Make / Power Automate">
                Excel / Microsoft 365 + Make / Power Automate
              </option>
              <option value="n8n vs LangChain Hybrid Orchestration">
                n8n vs LangChain Hybrid Orchestration
              </option>
              <option value="Zapier + Airtable + Slack AI Agent">
                Zapier + Airtable + Slack AI Agent
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ncwp-trigger"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Trigger Data Source (e.g., Google Sheets, Excel, Webhook)
            </label>
            <input
              id="ncwp-trigger"
              type="text"
              value={input.triggerDataSource}
              onChange={(e) => updateField("triggerDataSource", e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="ncwp-dest"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Destination Apps &amp; APIs
            </label>
            <input
              id="ncwp-dest"
              type="text"
              value={input.destinationAppsAndApis}
              onChange={(e) =>
                updateField("destinationAppsAndApis", e.target.value)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="ncwp-team"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Team Members
              </label>
              <input
                id="ncwp-team"
                type="number"
                min={1}
                max={200}
                value={input.teamMembersCount}
                onChange={(e) =>
                  updateField("teamMembersCount", Number(e.target.value))
                }
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="ncwp-vol"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Daily Task Volume
              </label>
              <input
                id="ncwp-vol"
                type="number"
                min={1}
                max={5000}
                value={input.dailyTaskVolume}
                onChange={(e) =>
                  updateField("dailyTaskVolume", Number(e.target.value))
                }
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3452d1] via-[#5271ff] to-indigo-600 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            <Wand2 size={17} />
            {loading
              ? "Architecting No-Code Agent..."
              : "Generate No-Code Workflow & n8n Blueprint"}
          </button>
        </form>

        <div ref={resultsRef} className="space-y-5 lg:col-span-7">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {pack.capacityAndSpreadsheetFormulas.capacityUtilizationSummary}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {input.orchestrationPlatform}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      pack.downloadableN8nBlueprintJson,
                    );
                    notify("Copied n8n Workflow JSON Blueprint!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2 text-xs font-extrabold text-white shadow hover:bg-[#2841b5]"
                >
                  <Copy size={13} />
                  Copy n8n JSON
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadFile(
                      "n8n-sheets-calendar-ai-agent-workflow.json",
                      pack.downloadableN8nBlueprintJson,
                      "application/json",
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <Download size={13} />
                  Download n8n .JSON
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  ["architecture", "Node Architecture", GitBranch],
                  ["sheets-formulas", "Sheets / Excel AI", Sheet],
                  ["prompts-vs", "Prompts & n8n vs LC", Terminal],
                  ["n8n-json", "n8n Blueprint JSON", Code2],
                ] as const
              ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-extrabold transition ${
                    activeTab === id
                      ? "bg-[#3452d1] text-white shadow"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "architecture" && (
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                Step-by-Step No-Code AI Agent Node Architecture
              </span>
              {pack.stepByStepArchitecture.map((n) => (
                <div
                  key={n.nodeOrder}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Node {n.nodeOrder}: {n.nodeName}
                    </span>
                    <span className="rounded-lg bg-[#3452d1]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                      {n.nodeType}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-700 dark:text-slate-300">
                    {n.apiOrFormulaAction}
                  </p>
                  <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                    <strong>Fallback Guardrail:</strong> {n.failureFallbackRule}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "sheets-formulas" && (
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Google Sheets, Calendar &amp; Excel AI Capacity Formulas
              </span>
              {pack.capacityAndSpreadsheetFormulas.googleSheetsAndExcelAiFormulas.map(
                (f) => (
                  <div
                    key={f.purpose}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {f.purpose}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(f.formulaCode);
                          notify("Copied Formula / Apps Script!");
                        }}
                        className="text-xs font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-emerald-300">
                      {f.formulaCode}
                    </pre>
                  </div>
                ),
              )}
            </div>
          )}

          {activeTab === "prompts-vs" && (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                  No-Code Orchestrator Agent System Prompt
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      pack.agentSystemPrompts.orchestratorSystemPrompt,
                    );
                    notify("Copied Orchestrator System Prompt!");
                  }}
                  className="text-xs font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                >
                  Copy Prompt
                </button>
              </div>
              <pre className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-emerald-300 dark:border-slate-800">
                {pack.agentSystemPrompts.orchestratorSystemPrompt}
              </pre>

              <span className="block pt-2 text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                n8n vs. LangChain vs. Native Sheets/Calendar Comparison
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2 pr-3 font-black">Criterion</th>
                      <th className="py-2 pr-3 font-black text-emerald-600 dark:text-emerald-400">
                        n8n Visual Agent
                      </th>
                      <th className="py-2 pr-3 font-black text-indigo-600 dark:text-indigo-400">
                        LangChain (Code)
                      </th>
                      <th className="py-2 font-black text-sky-600 dark:text-sky-400">
                        Sheets / Excel Native
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {pack.platformComparisonMatrix.map((row) => (
                      <tr key={row.criterion}>
                        <td className="py-2.5 pr-3 font-bold">
                          {row.criterion}
                        </td>
                        <td className="py-2.5 pr-3">{row.n8nVisualAgent}</td>
                        <td className="py-2.5 pr-3">
                          {row.langchainCodeFramework}
                        </td>
                        <td className="py-2.5">{row.sheetsCalendarNative}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "n8n-json" && (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111A2E] sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                  Downloadable n8n Workflow JSON Blueprint (Import Directly into n8n)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      pack.downloadableN8nBlueprintJson,
                    );
                    notify("Copied n8n Workflow JSON!");
                  }}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#3452d1] px-3 py-1.5 text-xs font-extrabold text-white"
                >
                  <Copy size={12} />
                  Copy JSON
                </button>
              </div>
              <pre className="max-h-96 overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-sky-300 dark:border-slate-800">
                {pack.downloadableN8nBlueprintJson}
              </pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

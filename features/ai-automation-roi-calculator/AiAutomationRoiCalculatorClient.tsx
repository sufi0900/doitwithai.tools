"use client";

import React, { useMemo, useState } from "react";

export default function AiAutomationRoiCalculatorClient() {
  const [taskName, setTaskName] = useState<string>("Manual Lead Qualification, CRM Data Entry & Weekly Reporting");
  const [teamMembers, setTeamMembers] = useState<number>(5);
  const [hoursPerWeekPerPerson, setHoursPerWeekPerPerson] = useState<number>(8);
  const [hourlyRateUsd, setHourlyRateUsd] = useState<number>(45);
  const [automationCoveragePct, setAutomationCoveragePct] = useState<number>(75);
  const [monthlyToolCostUsd, setMonthlyToolCostUsd] = useState<number>(120);
  const [copied, setCopied] = useState<boolean>(false);

  const metrics = useMemo(() => {
    const weeklyManualHours = teamMembers * hoursPerWeekPerPerson;
    const annualManualHours = weeklyManualHours * 52;
    const annualManualCostUsd = annualManualHours * hourlyRateUsd;

    const weeklyHoursSaved = Number((weeklyManualHours * (automationCoveragePct / 100)).toFixed(1));
    const annualHoursSaved = Math.round(weeklyHoursSaved * 52);
    const grossAnnualSavingsUsd = Math.round(annualHoursSaved * hourlyRateUsd);
    const annualAutomationCostUsd = monthlyToolCostUsd * 12;
    const netAnnualSavingsUsd = grossAnnualSavingsUsd - annualAutomationCostUsd;
    const roiMultiple = Number((grossAnnualSavingsUsd / Math.max(1, annualAutomationCostUsd)).toFixed(1));

    const summaryMarkdown = `# AI Automation Agency & Manual Task ROI Report
- **Workflow Audited**: ${taskName}
- **Manual Baseline**: ${weeklyManualHours} hrs/week (${annualManualHours.toLocaleString()} hrs/yr) across ${teamMembers} team members @ $${hourlyRateUsd}/hr = **$${annualManualCostUsd.toLocaleString()}/year**
- **AI Automation Coverage (${automationCoveragePct}%)**: Saves **${weeklyHoursSaved} hrs/week (${annualHoursSaved.toLocaleString()} hrs/year)**
- **Net 12-Month Savings**: **$${netAnnualSavingsUsd.toLocaleString()}/year** (${roiMultiple}x ROI over $${monthlyToolCostUsd}/mo n8n/Make/API stack)`;

    return {
      weeklyManualHours,
      annualManualHours,
      annualManualCostUsd,
      weeklyHoursSaved,
      annualHoursSaved,
      netAnnualSavingsUsd,
      roiMultiple,
      summaryMarkdown
    };
  }, [taskName, teamMembers, hoursPerWeekPerPerson, hourlyRateUsd, automationCoveragePct, monthlyToolCostUsd]);

  return (
    <div id="ai-automation-roi-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-5 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/85 p-5">
        <h2 className="text-base font-bold text-white">1. Manual Task & Team Cost Inputs</h2>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
            Repetitive Manual Task Description
          </label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
          />
        </div>
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
            <span>Team Members Performing Task</span>
            <span className="text-indigo-400">{teamMembers} people</span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={teamMembers}
            onChange={(e) => setTeamMembers(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
            <span>Manual Hours / Week per Person</span>
            <span className="text-indigo-400">{hoursPerWeekPerPerson} hrs/wk</span>
          </div>
          <input
            type="range"
            min={1}
            max={35}
            value={hoursPerWeekPerPerson}
            onChange={(e) => setHoursPerWeekPerPerson(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
              Loaded Hourly Rate ($ USD)
            </label>
            <input
              type="number"
              value={hourlyRateUsd}
              onChange={(e) => setHourlyRateUsd(Math.max(10, Number(e.target.value) || 25))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
              Monthly AI/n8n Stack ($)
            </label>
            <input
              type="number"
              value={monthlyToolCostUsd}
              onChange={(e) => setMonthlyToolCostUsd(Math.max(10, Number(e.target.value) || 50))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
            <span>AI Automation Coverage (%)</span>
            <span className="text-emerald-400">{automationCoveragePct}% automated</span>
          </div>
          <input
            type="range"
            min={30}
            max={95}
            step={5}
            value={automationCoveragePct}
            onChange={(e) => setAutomationCoveragePct(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>
      </div>

      <div className="lg:col-span-7 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="text-[11px] uppercase text-slate-400">Hours Saved / Wk</div>
            <div className="mt-1 text-2xl font-extrabold text-emerald-400">{metrics.weeklyHoursSaved}h</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="text-[11px] uppercase text-slate-400">Hours Saved / Yr</div>
            <div className="mt-1 text-2xl font-extrabold text-cyan-400">{metrics.annualHoursSaved.toLocaleString()}h</div>
          </div>
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4">
            <div className="text-[11px] uppercase text-emerald-300">Net Annual Saved</div>
            <div className="mt-1 text-2xl font-extrabold text-emerald-400">${metrics.netAnnualSavingsUsd.toLocaleString()}</div>
          </div>
          <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/30 p-4">
            <div className="text-[11px] uppercase text-indigo-300">ROI Multiple</div>
            <div className="mt-1 text-2xl font-extrabold text-indigo-300">{metrics.roiMultiple}x</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-indigo-300">
              Executive AI Automation ROI Summary Memo
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(metrics.summaryMarkdown);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white"
            >
              {copied ? "✓ Copied Memo" : "Copy ROI Memo"}
            </button>
          </div>
          <pre className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-200 whitespace-pre-wrap font-mono">
            {metrics.summaryMarkdown}
          </pre>
        </div>
      </div>
    </div>
  );
}

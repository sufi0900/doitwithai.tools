"use client";

import React, { useMemo, useState } from "react";

export default function AiWorkflowBlueprintGeneratorClient() {
  const [platform, setPlatform] = useState<"n8n" | "Make.com" | "Zapier">("n8n");
  const [triggerApp, setTriggerApp] = useState<string>("Shopify / Webhook Order & Lead Event");
  const [aiAction, setAiAction] = useState<string>("Classify buyer intent, enrich company profile, and draft personalized onboarding email");
  const [destinationApp, setDestinationApp] = useState<string>("HubSpot CRM + Slack Alert + Gmail Draft");
  const [copied, setCopied] = useState<boolean>(false);

  const blueprint = useMemo(() => {
    const jsonBlueprint = JSON.stringify(
      {
        workflowName: `${platform} AI Automation: ${triggerApp} -> ${destinationApp}`,
        platform,
        nodes: [
          { step: 1, type: "Trigger", app: triggerApp, config: "Instant Webhook / New Record Listener + Deduplication Check" },
          { step: 2, type: "AI Agent Node", model: "gemini-2.5-flash / llama-3.3-70b", task: aiAction },
          { step: 3, type: "Router & Action", app: destinationApp, config: "Update CRM fields, post Slack summary, and log status" }
        ]
      },
      null,
      2
    );
    return { jsonBlueprint };
  }, [platform, triggerApp, aiAction, destinationApp]);

  return (
    <div id="ai-workflow-blueprint-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-5 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/85 p-5">
        <h2 className="text-base font-bold text-white">1. Make, Zapier & n8n Workflow Inputs</h2>
        <div className="grid grid-cols-3 gap-2">
          {(["n8n", "Make.com", "Zapier"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`rounded-xl border py-2 text-xs font-bold transition ${
                platform === p
                  ? "border-indigo-500 bg-indigo-950/60 text-white"
                  : "border-slate-800 bg-slate-950 text-slate-400"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
            1. Trigger App / Event
          </label>
          <input
            type="text"
            value={triggerApp}
            onChange={(e) => setTriggerApp(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-indigo-300 mb-1">
            2. AI Agent Reasoning & Transformation Step
          </label>
          <textarea
            rows={3}
            value={aiAction}
            onChange={(e) => setAiAction(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-emerald-300 mb-1">
            3. Destination CRM / Notification Apps
          </label>
          <input
            type="text"
            value={destinationApp}
            onChange={(e) => setDestinationApp(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
          />
        </div>
      </div>

      <div className="lg:col-span-7 space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-indigo-300">
              {platform} Importable Workflow Architecture JSON
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(blueprint.jsonBlueprint);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white"
            >
              {copied ? "✓ Copied JSON" : "Copy Blueprint JSON"}
            </button>
          </div>
          <pre className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-emerald-300 whitespace-pre-wrap font-mono">
            {blueprint.jsonBlueprint}
          </pre>
        </div>
      </div>
    </div>
  );
}

export type OrchestrationPlatformChoice =
  | "n8n + Google Sheets & Google Calendar API"
  | "Excel / Microsoft 365 + Make / Power Automate"
  | "n8n vs LangChain Hybrid Orchestration"
  | "Zapier + Airtable + Slack AI Agent";

export type NoCodeWorkflowPlannerInput = {
  workflowTaskDescription: string;
  triggerDataSource: string;
  destinationAppsAndApis: string;
  teamMembersCount: number;
  dailyTaskVolume: number;
  orchestrationPlatform: OrchestrationPlatformChoice;
};

export type WorkflowNodeStep = {
  nodeOrder: number;
  nodeName: string;
  nodeType: string;
  apiOrFormulaAction: string;
  failureFallbackRule: string;
};

export type PlatformComparisonRow = {
  criterion: string;
  n8nVisualAgent: string;
  langchainCodeFramework: string;
  sheetsCalendarNative: string;
};

export type NoCodeWorkflowPlannerPack = {
  stepByStepArchitecture: WorkflowNodeStep[];
  capacityAndSpreadsheetFormulas: {
    estimatedWeeklyHoursSaved: number;
    capacityUtilizationSummary: string;
    googleSheetsAndExcelAiFormulas: {
      purpose: string;
      formulaCode: string;
    }[];
  };
  platformComparisonMatrix: PlatformComparisonRow[];
  agentSystemPrompts: {
    orchestratorSystemPrompt: string;
    calendarAndSheetsSyncPrompt: string;
  };
  downloadableN8nBlueprintJson: string;
  compiledArchitectureMarkdown: string;
};

export const DEFAULT_NOCODE_WORKFLOW_INPUT: NoCodeWorkflowPlannerInput = {
  workflowTaskDescription:
    "Sync new Google Sheets inbound leads to Google Calendar capacity slots, score buyer fit with an AI agent, update Excel/Sheets status columns, and send personalized follow-up emails.",
  triggerDataSource: "Google Sheets / Excel Lead Intake Row Added or Updated",
  destinationAppsAndApis:
    "Google Calendar API (free/busy check), OpenAI/Gemini Agent Node, Gmail / Slack Notification",
  teamMembersCount: 4,
  dailyTaskVolume: 35,
  orchestrationPlatform: "n8n + Google Sheets & Google Calendar API",
};

export function buildDeterministicNoCodeWorkflowPack(
  input: NoCodeWorkflowPlannerInput,
): NoCodeWorkflowPlannerPack {
  const taskDesc =
    input.workflowTaskDescription.trim() ||
    "Sync Google Sheets leads to Google Calendar & send AI follow-up";
  const trigger =
    input.triggerDataSource.trim() || "Google Sheets / Excel Row Added";
  const destinations =
    input.destinationAppsAndApis.trim() ||
    "Google Calendar API, AI Agent Node, Email/Slack";
  const teamCount = Math.max(1, Math.min(200, Number(input.teamMembersCount) || 4));
  const dailyVol = Math.max(1, Math.min(5000, Number(input.dailyTaskVolume) || 35));

  const weeklyHoursSaved = Number(((dailyVol * 4.5 * 5) / 60).toFixed(1));
  const totalTeamWeeklyCapacity = teamCount * 40;

  const stepByStepArchitecture: WorkflowNodeStep[] = [
    {
      nodeOrder: 1,
      nodeName: "Trigger & Deduplication Guard",
      nodeType: `Trigger Node (${trigger})`,
      apiOrFormulaAction:
        "Polls or receives webhook on new row/record; checks unique Email/Row_ID hash to prevent duplicate runs.",
      failureFallbackRule:
        "If required fields (Email or Task Title) are blank, write 'INVALID_INPUT' to Status column and halt.",
    },
    {
      nodeOrder: 2,
      nodeName: "Google Calendar & Sheets Capacity Lookup",
      nodeType: "Google Calendar API (freebusy.query) + Sheets Lookup",
      apiOrFormulaAction: `Queries available slots across ${teamCount} team member calendars and checks current daily load (< ${Math.ceil(dailyVol / teamCount)} tasks/person).`,
      failureFallbackRule:
        "If primary assignee calendar is full, round-robin assign to next available team member.",
    },
    {
      nodeOrder: 3,
      nodeName: "AI Reasoning, Classification & Drafting Node",
      nodeType: "n8n AI Agent / LLM Structured Output Node",
      apiOrFormulaAction: `Executes task logic ("${taskDesc.slice(0, 80)}...") and outputs strict JSON: { priorityScore, assignedSlot, followUpDraft }.`,
      failureFallbackRule:
        "Retry once with deterministic template fallback if LLM API times out (>15s).",
    },
    {
      nodeOrder: 4,
      nodeName: "Multi-App Sync & Audit Log Writeback",
      nodeType: `Action Router (${destinations})`,
      apiOrFormulaAction:
        "Creates Google Calendar event, sends follow-up notification, and writes timestamp + Calendar_Event_ID back to Google Sheets / Excel.",
      failureFallbackRule:
        "Log error payload to dead-letter Sheet tab and alert ops channel.",
    },
  ];

  const googleSheetsAndExcelAiFormulas = [
    {
      purpose: "Google Sheets — Capacity Utilization & Overload Status Formula",
      formulaCode: `=IF(COUNTIFS(D:D, A2, E:E, TODAY()) >= ${Math.ceil(dailyVol / teamCount)}, "🔴 At Capacity (Route to Next Rep)", "🟢 Available (" & COUNTIFS(D:D, A2, E:E, TODAY()) & "/" & ${Math.ceil(dailyVol / teamCount)} & " slots)")`,
    },
    {
      purpose: "Excel / Office 365 — Dynamic Priority & SLA Deadline Calculator",
      formulaCode: `=LET(score, C2, created, B2, IF(score>=80, WORKDAY(created, 1), WORKDAY(created, 3)))`,
    },
    {
      purpose: "Google Sheets Apps Script Webhook Trigger (Copy-Paste Helper)",
      formulaCode: `function onEditTrigger(e) { UrlFetchApp.fetch("https://your-n8n-instance.com/webhook/sheets-capacity-agent", { method: "post", contentType: "application/json", payload: JSON.stringify(e.values) }); }`,
    },
  ];

  const platformComparisonMatrix: PlatformComparisonRow[] = [
    {
      criterion: "Setup Speed for Non-Coders",
      n8nVisualAgent: "15–30 mins (Visual drag-and-drop nodes + JSON import)",
      langchainCodeFramework: "4–12 hours (Requires Python/TS deployment & hosting)",
      sheetsCalendarNative: "10 mins (Built-in formulas + Apps Script trigger)",
    },
    {
      criterion: "Google Calendar & Sheets API Integration",
      n8nVisualAgent: "Native OAuth2 nodes for Sheets append/update & Calendar free/busy",
      langchainCodeFramework: "Requires manual Google Cloud SDK & token refresh code",
      sheetsCalendarNative: "Direct native binding inside Google Workspace",
    },
    {
      criterion: "AI Agent Memory & Tool Calling",
      n8nVisualAgent: "Built-in visual AI Agent node with Window Buffer Memory",
      langchainCodeFramework: "Full custom state-graph & multi-agent control",
      sheetsCalendarNative: "Best for deterministic row-by-row transformations",
    },
  ];

  const orchestratorSystemPrompt = [
    `You are an Autonomous Operations & Capacity Planning AI Agent running inside ${input.orchestrationPlatform}.`,
    `OBJECTIVE: ${taskDesc}`,
    `INPUT SCHEMA: { recordId, contactName, contactEmail, requestSummary, preferredDate, currentTeamLoad }`,
    `OUTPUT SCHEMA (STRICT JSON):`,
    `{`,
    `  "priorityTier": "HIGH | MEDIUM | LOW",`,
    `  "estimatedMinutes": 30,`,
    `  "recommendedAssignee": "team_member_id",`,
    `  "calendarEventTitle": "string",`,
    `  "personalizedFollowUpBody": "string"`,
    `}`,
    `GUARDRAILS: Never schedule over an existing busy block returned by Google Calendar API. Keep follow-up messages concise and actionable.`,
  ].join("\n");

  const calendarAndSheetsSyncPrompt = `Given ${teamCount} team members and ${dailyVol} daily tasks, balance calendar assignments so no single member exceeds ${Math.ceil(dailyVol / teamCount)} scheduled blocks per day. Always write the resulting Calendar Event URL back to Column H in Google Sheets/Excel.`;

  const n8nBlueprintObj = {
    name: `No-Code AI Agent: ${taskDesc.slice(0, 56)}`,
    nodes: [
      {
        parameters: {
          pollTimes: { item: [{ mode: "everyMinute" }] },
          documentId: "{{YOUR_GOOGLE_SHEET_ID}}",
          sheetName: "Intake_Leads",
        },
        id: "node-1",
        name: "Google Sheets Trigger",
        type: "n8n-nodes-base.googleSheetsTrigger",
        typeVersion: 1,
        position: [220, 300],
      },
      {
        parameters: {
          resource: "calendar",
          operation: "availability",
          calendar: "primary",
        },
        id: "node-2",
        name: "Google Calendar Capacity Check",
        type: "n8n-nodes-base.googleCalendar",
        typeVersion: 1,
        position: [460, 300],
      },
      {
        parameters: {
          promptType: "define",
          text: "={{ $json.requestSummary }}",
          options: {
            systemMessage: orchestratorSystemPrompt,
          },
        },
        id: "node-3",
        name: "AI Capacity & Follow-Up Agent",
        type: "@n8n/n8n-nodes-langchain.agent",
        typeVersion: 1,
        position: [700, 300],
      },
      {
        parameters: {
          operation: "update",
          documentId: "{{YOUR_GOOGLE_SHEET_ID}}",
          sheetName: "Intake_Leads",
        },
        id: "node-4",
        name: "Writeback Status to Sheets / Excel",
        type: "n8n-nodes-base.googleSheets",
        typeVersion: 4,
        position: [940, 300],
      },
    ],
    connections: {
      "Google Sheets Trigger": {
        main: [[{ node: "Google Calendar Capacity Check", type: "main", index: 0 }]],
      },
      "Google Calendar Capacity Check": {
        main: [[{ node: "AI Capacity & Follow-Up Agent", type: "main", index: 0 }]],
      },
      "AI Capacity & Follow-Up Agent": {
        main: [[{ node: "Writeback Status to Sheets / Excel", type: "main", index: 0 }]],
      },
    },
  };

  const downloadableN8nBlueprintJson = JSON.stringify(n8nBlueprintObj, null, 2);

  const compiledArchitectureMarkdown = [
    `# No-Code Workflow & Capacity Planning Agent Blueprint`,
    `**Task:** ${taskDesc}`,
    `**Platform:** ${input.orchestrationPlatform}`,
    `**Estimated Time Saved:** ~${weeklyHoursSaved} hrs/week across ${teamCount} team members (${totalTeamWeeklyCapacity}h total weekly capacity)`,
    ``,
    `## 1. 4-Node No-Code Agent Architecture`,
    ...stepByStepArchitecture.map(
      (n) =>
        `### Node ${n.nodeOrder}: ${n.nodeName} (${n.nodeType})\n- **Action:** ${n.apiOrFormulaAction}\n- **Fallback:** ${n.failureFallbackRule}\n`,
    ),
    `## 2. Google Sheets & Excel AI Capacity Formulas`,
    ...googleSheetsAndExcelAiFormulas.map(
      (f) => `- **${f.purpose}:**\n  \`${f.formulaCode}\``,
    ),
    ``,
    `## 3. Agent System Prompt`,
    `\`\`\`text`,
    orchestratorSystemPrompt,
    `\`\`\``,
    ``,
    `## 4. Downloadable n8n Workflow JSON Blueprint`,
    `\`\`\`json`,
    downloadableN8nBlueprintJson,
    `\`\`\``,
  ].join("\n");

  return {
    stepByStepArchitecture,
    capacityAndSpreadsheetFormulas: {
      estimatedWeeklyHoursSaved: weeklyHoursSaved,
      capacityUtilizationSummary: `Saves ~${weeklyHoursSaved} manual hours/week (${dailyVol} tasks/day across ${teamCount} team members).`,
      googleSheetsAndExcelAiFormulas,
    },
    platformComparisonMatrix,
    agentSystemPrompts: {
      orchestratorSystemPrompt,
      calendarAndSheetsSyncPrompt,
    },
    downloadableN8nBlueprintJson,
    compiledArchitectureMarkdown,
  };
}

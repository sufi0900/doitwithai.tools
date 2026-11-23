import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import {
  buildDeterministicNoCodeWorkflowPack,
  type NoCodeWorkflowPlannerInput,
} from "@/features/no-code-workflow-agent-planner/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  workflowTaskDescription: z.string().trim().min(5).max(1600),
  triggerDataSource: z.string().trim().max(240).default("Google Sheets / Excel Row Added"),
  destinationAppsAndApis: z.string().trim().max(400).default("Google Calendar API, AI Agent, Email"),
  teamMembersCount: z.number().min(1).max(500).default(4),
  dailyTaskVolume: z.number().min(1).max(10000).default(35),
  orchestrationPlatform: z
    .enum([
      "n8n + Google Sheets & Google Calendar API",
      "Excel / Microsoft 365 + Make / Power Automate",
      "n8n vs LangChain Hybrid Orchestration",
      "Zapier + Airtable + Slack AI Agent",
    ])
    .default("n8n + Google Sheets & Google Calendar API"),
});

export async function POST(request: NextRequest) {
  let input: NoCodeWorkflowPlannerInput;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 120_000));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Describe your repetitive business task to generate the No-Code Workflow & Capacity Agent blueprint.",
        },
      },
      { status: 422 },
    );
  }

  const pack = buildDeterministicNoCodeWorkflowPack(input);
  return NextResponse.json({
    pack,
    provider: "deterministic",
  });
}

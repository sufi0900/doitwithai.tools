import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import {
  buildDeterministicSupportAgentPack,
  type SupportAgentBuilderInput,
} from "@/features/ai-support-agent-builder/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  companyOrProductName: z.string().trim().min(2).max(160),
  websiteOrDocsUrl: z.string().trim().max(2048).default(""),
  supportTone: z.string().trim().max(200).default("Helpful, concise, zero hallucination"),
  escalationContactOrEmail: z.string().trim().max(180).default("support@doitwithai.tools"),
  helpdeskIntegration: z
    .enum([
      "Standalone Website Widget + Email Escalation",
      "Zendesk / Intercom Ticket Escalation",
      "HubSpot / Crisp Live Chat Handoff",
      "Slack / Discord Support Channel Webhook",
    ])
    .default("Standalone Website Widget + Email Escalation"),
  rawDocsPricingFaqs: z.string().trim().min(10).max(8000),
  strictOutOfScopeTopics: z.string().trim().max(600).default(""),
});

export async function POST(request: NextRequest) {
  let input: SupportAgentBuilderInput;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 120_000));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide your company name and internal FAQs/docs to build the Support Agent.",
        },
      },
      { status: 422 },
    );
  }

  const pack = buildDeterministicSupportAgentPack(input);
  return NextResponse.json({
    pack,
    provider: "deterministic",
  });
}

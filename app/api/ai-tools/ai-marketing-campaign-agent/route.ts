import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import {
  buildDeterministicMarketingCampaignPack,
  type MarketingCampaignAgentInput,
} from "@/features/ai-marketing-campaign-agent/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  campaignNameOrProductLaunch: z.string().trim().min(3).max(200),
  destinationLandingPageUrl: z.string().trim().max(2048).default(""),
  coreValuePropsAndTakeaways: z.string().trim().max(4000).default(""),
  targetAudienceSegment: z.string().trim().max(240).default(""),
  teamWeeklyHoursCapacity: z.number().min(2).max(200).default(16),
  paidTrafficBudget: z.string().trim().max(160).default("$1,500 test sprint"),
});

export async function POST(request: NextRequest) {
  let input: MarketingCampaignAgentInput;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 120_000));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide a campaign name and destination URL to run the Omnichannel Marketing Campaign Agent.",
        },
      },
      { status: 422 },
    );
  }

  const pack = buildDeterministicMarketingCampaignPack(input);
  return NextResponse.json({
    pack,
    provider: "deterministic",
  });
}

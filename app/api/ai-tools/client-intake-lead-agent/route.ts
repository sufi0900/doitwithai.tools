import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import {
  buildDeterministicClientIntakePack,
  type ClientIntakeAgentInput,
} from "@/features/client-intake-lead-agent/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  serviceOrProductOffer: z.string().trim().min(3).max(240),
  targetBuyerPersonaAndIcp: z.string().trim().min(3).max(400),
  minimumBudgetThreshold: z.string().trim().max(120).default("$2,500+/mo"),
  primaryPainPointsSolved: z.string().trim().max(800).default(""),
  bookingCalendarOrCtaUrl: z.string().trim().max(2048).default(""),
  agencyOrCompanyName: z.string().trim().max(140).default("DoItWithAI Growth Studio"),
});

export async function POST(request: NextRequest) {
  let input: ClientIntakeAgentInput;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 120_000));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide your service offer and target buyer persona to build the B2B Client Intake Agent.",
        },
      },
      { status: 422 },
    );
  }

  const pack = buildDeterministicClientIntakePack(input);
  return NextResponse.json({
    pack,
    provider: "deterministic",
  });
}

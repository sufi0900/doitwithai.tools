import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
  geminiTextFormat,
} from "@/lib/ai-tools/gemini";
import { runLocalSeoAudit } from "@/features/local-seo-audit-tool/LocalSeoAuditClient";

export const runtime = "nodejs";
export const maxDuration = 45;
export const dynamic = "force-dynamic";

const localAuditAiSchema = z.object({
  gbpDiagnostic: z.string().trim().min(30).max(650),
  nearMeDiagnostic: z.string().trim().min(30).max(650),
  napDiagnostic: z.string().trim().min(30).max(650),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      businessName?: string;
      primaryService?: string;
      targetCityAreas?: string;
      napDetails?: string;
      gbpMetrics?: string;
      currentPageSignals?: string;
    };

    const params = {
      businessName: (body.businessName || "Apex Hydro Plumbing & Drain").slice(
        0,
        140,
      ),
      primaryService: (
        body.primaryService || "Emergency Plumber & Water Heater Repair"
      ).slice(0, 160),
      targetCityAreas: (
        body.targetCityAreas || "Austin, Round Rock & Cedar Park, TX"
      ).slice(0, 180),
      napDetails: (body.napDetails || "").slice(0, 400),
      gbpMetrics: (body.gbpMetrics || "").slice(0, 400),
      currentPageSignals: (body.currentPageSignals || "").slice(0, 400),
    };

    const basePack = runLocalSeoAudit(params);
    const model = getGeminiModel();

    if (isAiConfigured(model)) {
      try {
        const res = await getGeminiClient().generate(
          {
            model,
            max_output_tokens: 1000,
            input: [
              {
                role: "system",
                content:
                  "You are a Senior Local SEO & Google Business Profile Strategist. Provide a concrete local audit for the user's SMB covering (1) Google Map Pack & GBP Category/Review actions, (2) 'Near Me' and City Landing Page on-page upgrades, and (3) NAP & Local Citation consistency.",
              },
              {
                role: "user",
                content: JSON.stringify(params),
              },
            ],
            text: {
              format: geminiTextFormat(
                localAuditAiSchema,
                "local_seo_audit_pack",
                { compact: true },
              ),
            },
          },
          { timeout: 18_000 },
        );

        const out = res.output_parsed;
        basePack.cards[0].bodyText = out.gbpDiagnostic;
        basePack.cards[1].bodyText = out.nearMeDiagnostic;
        basePack.cards[2].bodyText = out.napDiagnostic;
        return NextResponse.json({ ok: true, pack: basePack });
      } catch {
        return NextResponse.json({ ok: true, pack: basePack });
      }
    }

    return NextResponse.json({ ok: true, pack: basePack });
  } catch {
    const fallback = runLocalSeoAudit({
      businessName: "Apex Hydro Plumbing & Drain",
      primaryService: "Emergency Plumber & Water Heater Repair",
      targetCityAreas: "Austin, Round Rock & Cedar Park, TX",
      napDetails: "",
      gbpMetrics: "",
      currentPageSignals: "",
    });
    return NextResponse.json({ ok: true, pack: fallback });
  }
}

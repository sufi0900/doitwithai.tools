import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
  geminiTextFormat,
} from "@/lib/ai-tools/gemini";

export const runtime = "nodejs";
export const maxDuration = 45;
export const dynamic = "force-dynamic";

const memoSchema = z.object({
  headline: z.string().trim().min(10).max(180),
  executiveSummary: z.string().trim().min(30).max(700),
  keyRecommendations: z.array(z.string().trim().min(15).max(260)).length(3),
  riskMitigation: z.string().trim().min(15).max(320),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      monthlyBudget?: number;
      monthlyVolume?: number;
      expectedCtr?: number;
      conversionRate?: number;
      closeRate?: number;
      customerLtv?: number;
      pagesPerMonth?: number;
      context?: string;
      roiPercentage?: number;
      breakEvenMonth?: number | null;
      total12MonthRevenue?: number;
      total12MonthCost?: number;
    };

    const budget = Number(body.monthlyBudget) || 3500;
    const volume = Number(body.monthlyVolume) || 22000;
    const ctr = Number(body.expectedCtr) || 11;
    const conv = Number(body.conversionRate) || 3.2;
    const close = Number(body.closeRate) || 25;
    const ltv = Number(body.customerLtv) || 2400;
    const pages = Number(body.pagesPerMonth) || 8;
    const roi = Number(body.roiPercentage) || 0;
    const breakEven = body.breakEvenMonth ? `Month ${body.breakEvenMonth}` : "Month 13+";
    const rev12 = Number(body.total12MonthRevenue) || 0;
    const cost12 = Number(body.total12MonthCost) || budget * 12;
    const context = (body.context || "Digital business investing in organic search").slice(0, 300);

    const model = getGeminiModel();
    if (isAiConfigured(model)) {
      try {
        const res = await getGeminiClient().generate(
          {
            model,
            max_output_tokens: 900,
            input: [
              {
                role: "system",
                content:
                  "You are an SEO financial strategist preparing a concise, realistic executive investment memo for a founder or CFO. Base all advice strictly on the supplied numbers without promising guaranteed rankings.",
              },
              {
                role: "user",
                content: `Business Context: ${context}
Monthly SEO Budget: $${budget}/mo ($${cost12}/yr)
Target Search Volume: ${volume}/mo at ${ctr}% expected CTR
Conversion Rate: ${conv}% visitor-to-lead, ${close}% lead-to-customer close rate
Customer LTV: $${ltv}
Content Velocity: ${pages} pages/month
Projected 12-Month Revenue: $${rev12} (Net ROI: ${roi}%, Break-Even: ${breakEven})`,
              },
            ],
            text: {
              format: geminiTextFormat(memoSchema, "seo_roi_memo", {
                compact: true,
              }),
            },
          },
          { timeout: 18_000 },
        );
        return NextResponse.json({ ok: true, memo: res.output_parsed });
      } catch {
        // Fall through to deterministic CFO memo
      }
    }

    const fallbackMemo = {
      headline: `Executive SEO Investment Brief: $${budget.toLocaleString()}/mo Plan Targeting ${roi >= 0 ? `+${roi}%` : `${roi}%`} Year-1 ROI`,
      executiveSummary: `Investing $${budget.toLocaleString()}/month ($${cost12.toLocaleString()}/year) across ${pages} high-intent pages per month targets a ${volume.toLocaleString()}-search keyword pool. At a ${ctr}% average SERP click-through rate and ${conv}% conversion rate ($${ltv.toLocaleString()} LTV), the model projects $${rev12.toLocaleString()} in Year-1 revenue with break-even around ${breakEven}.`,
      keyRecommendations: [
        `Prioritize Bottom-of-Funnel Commercial & Tool Pages in Months 1–3: Publish interactive calculators, comparison matrices, and service pages first to accelerate early conversions before broad informational guides mature.`,
        `Protect SERP Click-Through Rate (${ctr}% Target): Pair every page with pixel-verified Meta Titles (<580px), single-sentence Meta Descriptions, and FAQPage JSON-LD schema to capture AI Overview citations.`,
        `Compound Existing Striking-Distance Pages (Positions 6–25): Dedicate 25% of monthly content velocity to refreshing pages already earning impressions in Google Search Console for faster Month 3–5 wins.`,
      ],
      riskMitigation:
        "SEO returns compound nonlinearly—Months 1 to 4 are primarily an indexing and authority investment phase. Validate search intent and actual SERP competition before scaling production volume.",
    };

    return NextResponse.json({ ok: true, memo: fallbackMemo });
  } catch {
    return NextResponse.json(
      { error: "Could not generate SEO ROI memo." },
      { status: 500 },
    );
  }
}

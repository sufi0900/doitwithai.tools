import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
  geminiTextFormat,
} from "@/lib/ai-tools/gemini";
import { generateExcelSeoReportPack } from "@/features/excel-seo-report-generator/ExcelSeoReportClient";

export const runtime = "nodejs";
export const maxDuration = 45;
export const dynamic = "force-dynamic";

const excelReportAiSchema = z.object({
  indexingDiagnostic: z.string().trim().min(30).max(700),
  executiveSummaryMarkdown: z.string().trim().min(50).max(1400),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      clientOrDomain?: string;
      reportingPeriod?: string;
      gscSummaryStats?: string;
      indexingSnapshot?: string;
      topStrikingKeywords?: string;
      priorityGoal?: string;
    };

    const params = {
      clientOrDomain: (body.clientOrDomain || "doitwithai.tools").slice(0, 140),
      reportingPeriod: (
        body.reportingPeriod || "Last 90 Days (GSC + Site Audit)"
      ).slice(0, 140),
      gscSummaryStats: (body.gscSummaryStats || "").slice(0, 400),
      indexingSnapshot: (body.indexingSnapshot || "").slice(0, 400),
      topStrikingKeywords: (body.topStrikingKeywords || "").slice(0, 500),
      priorityGoal: (body.priorityGoal || "").slice(0, 300),
    };

    const basePack = generateExcelSeoReportPack(params);
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
                  "You are a Senior Agency SEO Reporting Director. Synthesize the user's Search Console metrics and indexing snapshot into a concise executive Markdown website analysis report and technical indexing diagnostic.",
              },
              {
                role: "user",
                content: JSON.stringify(params),
              },
            ],
            text: {
              format: geminiTextFormat(
                excelReportAiSchema,
                "excel_seo_report_pack",
                { compact: true },
              ),
            },
          },
          { timeout: 18_000 },
        );

        const out = res.output_parsed;
        basePack.cards[2].bodyText = out.indexingDiagnostic;
        basePack.cards[3].bodyText = out.executiveSummaryMarkdown;
        basePack.printableReportMarkdown = out.executiveSummaryMarkdown;
        return NextResponse.json({ ok: true, pack: basePack });
      } catch {
        return NextResponse.json({ ok: true, pack: basePack });
      }
    }

    return NextResponse.json({ ok: true, pack: basePack });
  } catch {
    const fallback = generateExcelSeoReportPack({
      clientOrDomain: "doitwithai.tools",
      reportingPeriod: "Last 90 Days",
      gscSummaryStats: "",
      indexingSnapshot: "",
      topStrikingKeywords: "",
      priorityGoal: "",
    });
    return NextResponse.json({ ok: true, pack: fallback });
  }
}

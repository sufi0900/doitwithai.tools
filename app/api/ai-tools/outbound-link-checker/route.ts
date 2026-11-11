import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
  geminiTextFormat,
} from "@/lib/ai-tools/gemini";
import { analyzeOutboundLinks } from "@/features/outbound-link-checker/OutboundLinkCheckerClient";

export const runtime = "nodejs";
export const maxDuration = 45;
export const dynamic = "force-dynamic";

const outboundAiSchema = z.object({
  relDiagnostic: z.string().trim().min(30).max(600),
  anchorDiagnostic: z.string().trim().min(30).max(600),
  authorityDiagnostic: z.string().trim().min(30).max(600),
  cleanedHtmlSnippet: z.string().trim().min(30).max(1200),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      pageTargetKeyword?: string;
      yourDomain?: string;
      contentMode?: string;
      rawLinksInput?: string;
    };

    const params = {
      pageTargetKeyword: (
        body.pageTargetKeyword || "outbound link checker"
      ).slice(0, 140),
      yourDomain: (body.yourDomain || "doitwithai.tools").slice(0, 140),
      contentMode: (body.contentMode || "Editorial Blog / Guide").slice(0, 80),
      rawLinksInput: (body.rawLinksInput || "").slice(0, 3500),
    };

    const basePack = analyzeOutboundLinks(params);
    const model = getGeminiModel();

    if (isAiConfigured(model)) {
      try {
        const res = await getGeminiClient().generate(
          {
            model,
            max_output_tokens: 1100,
            input: [
              {
                role: "system",
                content:
                  "You are a Senior Technical SEO & Link Compliance Auditor. Audit the user's outbound links for Google rel='sponsored'/'ugc'/'nofollow' compliance, anchor text keyword cannibalization leaks, and primary source deep-link quality. Output repaired HTML <a> tags.",
              },
              {
                role: "user",
                content: JSON.stringify(params),
              },
            ],
            text: {
              format: geminiTextFormat(
                outboundAiSchema,
                "outbound_link_seo_audit",
                { compact: true },
              ),
            },
          },
          { timeout: 18_000 },
        );

        const out = res.output_parsed;
        basePack.cards[0].bodyText = out.relDiagnostic;
        basePack.cards[1].bodyText = out.anchorDiagnostic;
        basePack.cards[2].bodyText = out.authorityDiagnostic;
        basePack.cards[3].bodyText = out.cleanedHtmlSnippet;
        basePack.cleanedHtmlSnippet = out.cleanedHtmlSnippet;
        return NextResponse.json({ ok: true, pack: basePack });
      } catch {
        return NextResponse.json({ ok: true, pack: basePack });
      }
    }

    return NextResponse.json({ ok: true, pack: basePack });
  } catch {
    const fallback = analyzeOutboundLinks({
      pageTargetKeyword: "outbound link checker",
      yourDomain: "doitwithai.tools",
      contentMode: "Editorial Blog / Guide",
      rawLinksInput: "",
    });
    return NextResponse.json({ ok: true, pack: fallback });
  }
}

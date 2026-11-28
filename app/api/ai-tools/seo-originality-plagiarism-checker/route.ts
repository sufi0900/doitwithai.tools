import { NextResponse } from "next/server";
import { analyzeOriginalityAndIndexReadiness } from "@/features/seo-originality-plagiarism-checker/SeoOriginalityPlagiarismClient";
import { runMultiModelTextFailover } from "@/lib/ai/multi-model-router";

export const runtime = "nodejs";

interface OriginalityRequest {
  draft?: string;
  competitorNotes?: string;
  firstHandProof?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OriginalityRequest;
    const draft = (body.draft || "").trim();
    const competitorNotes = (body.competitorNotes || "").trim();
    const firstHandProof = (body.firstHandProof || "").trim();

    if (!draft) {
      return NextResponse.json(
        { error: "Please provide an article paragraph or draft to analyze." },
        { status: 400 }
      );
    }

    const report = analyzeOriginalityAndIndexReadiness(draft, competitorNotes, firstHandProof);

    const prompt = `You are a senior technical SEO editor and anti-AI-footprint humanizer.
Rewrite the following article draft so it reads with high sentence-length burstiness (mixing crisp 7-word punchy sentences with 22-word empirical clauses), removes every predictable AI cliché (${report.flaggedCliches.join(", ") || "none"}), converts passive voice to active first-person editorial voice, and naturally weaves in this first-hand proof: "${firstHandProof || "verified across our Q1 2026 production benchmarks"}".

Return ONLY the polished, human-like rewritten draft text (no markdown wrapper, no preamble):

DRAFT:
${draft.slice(0, 3500)}`;

    const aiResult = await runMultiModelTextFailover({
      prompt,
      temperature: 0.55,
      maxOutputTokens: 1200,
    });

    return NextResponse.json({
      report,
      aiPolishedDraft: aiResult ? aiResult.text.trim() : report.humanizedFullDraft,
      aiAuditSummary: `Analyzed ${report.wordCount} words across ${report.sentenceCount} sentences. Human Likelihood: ${report.humanLikelihoodPct}%, Burstiness: ${report.burstinessScore}/100, E-E-A-T Proof: ${report.eeatProofScore}/100.`,
      sourceTier: aiResult ? aiResult.tier : "Tier 4 · Deterministic Forensic Humanizer Engine"
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process originality audit request." },
      { status: 500 }
    );
  }
}

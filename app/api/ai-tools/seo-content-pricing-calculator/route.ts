import { NextResponse } from "next/server";
import { runMultiModelTextFailover } from "@/lib/ai/multi-model-router";

export const runtime = "nodejs";

interface PricingRequest {
  nicheTopic?: string;
  articlesPerMonth?: number;
  wordsPerArticle?: number;
  complexity?: string;
  agencyPerArticle?: number;
  hybridPerArticle?: number;
  annualSavingsVsAgency?: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PricingRequest;
    const niche = body.nicheTopic || "B2B SaaS & AI Workflows";
    const articles = body.articlesPerMonth || 12;
    const words = body.wordsPerArticle || 2000;
    const complexity = body.complexity || "saas-b2b";
    const agencyCost = body.agencyPerArticle || 650;
    const hybridCost = body.hybridPerArticle || 95;
    const annualSavings = body.annualSavingsVsAgency || 66000;

    const prompt = `Write a concise, data-backed 2026 SEO Content Production Budget & Editorial Allocation Memo for a founder in the "${niche}" space publishing ${articles} articles/month (${words} words/article, ${complexity} tier).
Compare the traditional agency rate ($${agencyCost}/article) with an AI + Human SME E-E-A-T studio workflow ($${hybridCost}/article, saving $${annualSavings.toLocaleString()}/year).
Include:
1. Per-Article Cost Breakdown (Research, Drafting, SME Proof Injection, Schema)
2. Recommended 90-Day Cluster Rollout Plan
3. Where to invest human SME hours for maximum Google AI Overview citations.`;

    const aiRes = await runMultiModelTextFailover({
      prompt,
      temperature: 0.45,
      maxOutputTokens: 900,
    });

    const fallbackMemo = `# 2026 Executive Content Budget & Allocation Memo: ${niche}
- **Publishing Cadence**: ${articles} articles/month (${words.toLocaleString()} words/article · ${complexity.toUpperCase()} tier)
- **Unit Economics**: $${hybridCost}/article via AI + Human SME Studio vs. $${agencyCost}/article via Traditional SEO Agency
- **12-Month Capital Saved**: **$${annualSavings.toLocaleString()}/year**

## Recommended Per-Article Editorial Time Allocation (45 Mins Total)
1. **SERP Entity & Competitor Gap Extraction (5 mins — AI Automated)**: Pull missing subtopics and quantitative questions.
2. **Long-Form Structured Drafting + FAQPage Schema (10 mins — AI Studio)**: Generate H2/H3 structure, 50-word AEO summary box, and comparison tables.
3. **Human SME First-Hand Proof Injection (30 mins — Human Editor)**: Add real screenshots, internal benchmark numbers, and first-person testing logs.`;

    return NextResponse.json({
      advisorMemo: aiRes ? aiRes.text.trim() : fallbackMemo,
      sourceTier: aiRes ? aiRes.tier : "Tier 4 · Deterministic Financial Benchmark Engine"
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to calculate SEO content pricing advisor memo." },
      { status: 500 }
    );
  }
}

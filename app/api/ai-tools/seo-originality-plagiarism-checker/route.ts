import { NextResponse } from "next/server";
import { analyzeOriginalityAndIndexReadiness } from "@/features/seo-originality-plagiarism-checker/SeoOriginalityPlagiarismClient";

export const runtime = "nodejs";

interface OriginalityRequest {
  draft?: string;
  competitorNotes?: string;
  firstHandProof?: string;
}

async function callFourTierAiPolisher(prompt: string): Promise<{ text: string; tier: string } | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.55, maxOutputTokens: 1200 }
          })
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { text, tier: "Tier 1 · Gemini 2.5 Flash" };
      }
    } catch {
      // Fall through
    }
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.55,
          max_tokens: 1200
        })
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) return { text, tier: "Tier 2 · Groq Llama-3.3-70B" };
      }
    } catch {
      // Fall through
    }
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: [{ role: "user", content: prompt }]
        })
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) return { text, tier: "Tier 3 · OpenRouter LLM" };
      }
    } catch {
      // Fall through
    }
  }

  return null;
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

    const aiResult = await callFourTierAiPolisher(prompt);

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

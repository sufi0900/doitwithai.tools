import { NextResponse } from "next/server";
import {
  runAutomationJsonPrompt,
  type AutomationKeyOverrides,
} from "@/lib/autonomous-agents/automation-ai-router";
import {
  buildArcadsSocialPackForJob,
  buildPinterestThreePinSuite,
  buildStandaloneOutlineForTopic,
  scoreGeoCitationReadiness,
  slugifyTopic,
} from "@/lib/autonomous-agents/arcads-social-engine";
import {
  compileJobArticleMarkdown,
  renderSectionInfographicSvg,
  type ByokSectionDraftResult,
} from "@/lib/autonomous-agents/byok-batch-runner";
import type {
  AutomatedArticleJob,
  ConnectedWebsiteProfile,
  WinnerFormulaRecord,
} from "@/lib/autonomous-agents/types";

export const maxDuration = 55;

interface AiFullArticleDraftResponse {
  metaTitle: string;
  metaDescription: string;
  aeoDirectAnswer50Words: string;
  sections: Array<{
    h2: string;
    archetype: "framework" | "process" | "comparison" | "checklist" | "faq";
    summary: string;
    proseParagraphs: string[];
    markdownComparisonTable?: string;
    points: Array<{
      badge: string;
      title: string;
      detail: string;
    }>;
  }>;
}

const clean = (s: string) => String(s || "").replace(/\s+/g, " ").trim();

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      job?: AutomatedArticleJob;
      website?: ConnectedWebsiteProfile;
      winnerFormulas?: WinnerFormulaRecord[];
      keyOverrides?: AutomationKeyOverrides;
    };

    if (!body.job || !body.website) {
      return NextResponse.json(
        { ok: false, error: "Missing required job or website profile." },
        { status: 400 },
      );
    }

    const job = body.job;
    const website = body.website;
    const winnerFormulas = Array.isArray(body.winnerFormulas)
      ? body.winnerFormulas
      : [];

    const fallbackOutline =
      job.outlineSections && job.outlineSections.length >= 3
        ? job.outlineSections
        : buildStandaloneOutlineForTopic(
            job.topicTitle,
            job.primaryKeyword,
            job.matchedInternalToolTitle || website.siteName,
            website.primaryNiche,
          );

    const buildDeterministicPayload = (): AiFullArticleDraftResponse => ({
      metaTitle: job.metaTitle || `${job.topicTitle}`.slice(0, 58),
      metaDescription:
        job.metaDescription ||
        `Complete step-by-step guide to ${job.primaryKeyword} with comparison tables, visual infographics, and expert checklists from ${website.siteName}.`.slice(
          0,
          156,
        ),
      aeoDirectAnswer50Words:
        job.aeoDirectAnswer50Words ||
        `Mastering ${job.primaryKeyword} requires understanding core ${website.primaryNiche} fundamentals, following a structured step-by-step plan, comparing proven options against common mistakes, and tracking measurable indicators over time so readers achieve reliable, lasting outcomes with guidance from ${website.siteName}.`,
      sections: fallbackOutline.map((sec) => ({
        h2: sec.h2,
        archetype: sec.archetype,
        summary: sec.summary,
        proseParagraphs: [
          `${sec.summary} When approaching ${job.primaryKeyword} inside "${job.topicTitle}", focusing on clear, verifiable steps eliminates guesswork and builds immediate momentum for readers of ${website.siteName}.`,
          `Key operational priorities include ${sec.points
            .map((p) => `**${p.title}** (${p.detail.replace(/\.$/, "")})`)
            .join("; ")}. Applying these structured principles ensures consistent, high-quality outcomes across every stage.`,
        ],
        ...(sec.archetype === "comparison"
          ? {
              markdownComparisonTable: [
                `| Evaluation Factor | Unstructured Guesswork | Structured ${website.siteName} Approach |`,
                `| --- | --- | --- |`,
                ...sec.points.slice(0, 3).map(
                  (pt) =>
                    `| **${pt.title.replace(/\|/g, "/")}** | Reactive trial-and-error with inconsistent results | ${pt.detail.replace(/\|/g, "/")} |`,
                ),
              ].join("\n"),
            }
          : {}),
        points: sec.points,
      })),
    });

    const systemPrompt = `You are the Flagship Long-Form Editorial & SEO/GEO Architect for "${website.siteName}" (${website.siteUrl}).
Write a complete, deeply researched, human-like article for the topic "${job.topicTitle}" targeting the primary keyword "${job.primaryKeyword}" within the niche "${website.primaryNiche}".
Strict Quality Rules:
1. Stay 100% focused on the website's actual subject matter ("${website.primaryNiche}"). Never insert unrelated AI/SEO marketing unless the topic itself is about AI/SEO.
2. Open with a 42-to-56 word "aeoDirectAnswer50Words" paragraph that directly answers the reader's core question.
3. Return 4 rich H2 sections in "sections" covering:
   - Section 1 (archetype: "framework"): Core fundamentals & what matters most
   - Section 2 (archetype: "process"): Step-by-step actionable plan
   - Section 3 (archetype: "comparison"): Side-by-side comparison (include a valid Markdown table in "markdownComparisonTable")
   - Section 4 (archetype: "faq"): 3 to 4 realistic Frequently Asked Questions
4. For each section, write 2–3 substantive, specific paragraphs in "proseParagraphs" (mixing concise 8-word punchy sentences with detailed 18–22 word explanations) and 4 standalone concept points in "points" (each with badge, 2–5 word title, and 1 clear explanatory sentence for the 6-layer section infographic).
5. Never use robotic AI clichés ("delve into", "testament to", "tapestry of", "in today's fast-paced world").`;

    const userPrompt = JSON.stringify({
      topicTitle: job.topicTitle,
      primaryKeyword: job.primaryKeyword,
      secondaryKeywords: job.secondaryKeywords,
      searchIntent: job.searchIntent,
      websiteName: website.siteName,
      websiteUrl: website.siteUrl,
      websiteNiche: website.primaryNiche,
      outlineHint: fallbackOutline.map((s) => s.h2),
    });

    const aiRes = await runAutomationJsonPrompt<AiFullArticleDraftResponse>({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxOutputTokens: 3400,
      timeoutMs: 22_000,
      keyOverrides: body.keyOverrides,
      deterministicFallback: buildDeterministicPayload,
    });

    const fallbackData = buildDeterministicPayload();
    const raw = aiRes.data || fallbackData;

    const rawSections =
      Array.isArray(raw.sections) && raw.sections.length >= 3
        ? raw.sections
        : fallbackData.sections;

    const draftedSections: ByokSectionDraftResult[] = rawSections
      .slice(0, 5)
      .map((sec, idx) => {
        const fbSec = fallbackData.sections[idx % fallbackData.sections.length]!;
        const validPoints =
          Array.isArray(sec.points) && sec.points.length >= 3
            ? sec.points.slice(0, 6).map((p, pIdx) => ({
                badge:
                  clean(p.badge || "") ||
                  (sec.archetype === "faq"
                    ? `Q${pIdx + 1}`
                    : String(pIdx + 1).padStart(2, "0")),
                title: clean(p.title || fbSec.points[pIdx]?.title || `Key Step ${pIdx + 1}`),
                detail: clean(p.detail || fbSec.points[pIdx]?.detail || fbSec.summary),
              }))
            : fbSec.points;

        const proseParagraphs =
          Array.isArray(sec.proseParagraphs) && sec.proseParagraphs.length > 0
            ? sec.proseParagraphs.map(clean).filter((p) => p.length > 20)
            : fbSec.proseParagraphs;

        return {
          h2: clean(sec.h2 || fbSec.h2),
          archetype: sec.archetype || fbSec.archetype,
          summary: clean(sec.summary || fbSec.summary),
          proseParagraphs:
            proseParagraphs.length > 0 ? proseParagraphs : fbSec.proseParagraphs,
          markdownComparisonTable:
            sec.markdownComparisonTable || fbSec.markdownComparisonTable,
          points: validPoints,
          providerUsed: aiRes.isLiveAi ? "gemini-2.5-flash" : "deterministic-zero-token",
          tokensUsed: aiRes.isLiveAi ? 1450 : 0,
        };
      });

    const updatedOutline: AutomatedArticleJob["outlineSections"] = draftedSections.map(
      (sec) => ({
        h2: sec.h2,
        archetype: sec.archetype,
        summary: sec.summary,
        points: sec.points,
      }),
    );

    const sectionInfographicSvgs = updatedOutline.map((sec, idx) =>
      renderSectionInfographicSvg(sec, {
        sectionIndex: idx,
        totalSections: updatedOutline.length,
        brandName: website.siteName,
        brandPrimaryHex: website.brandPrimaryHex,
        brandSecondaryHex: website.brandSecondaryHex,
      }),
    );

    const updatedJob: AutomatedArticleJob = {
      ...job,
      metaTitle: clean(raw.metaTitle || fallbackData.metaTitle).slice(0, 60),
      metaDescription: clean(
        raw.metaDescription || fallbackData.metaDescription,
      ).slice(0, 158),
      urlSlug: job.urlSlug || slugifyTopic(job.primaryKeyword || job.topicTitle),
      aeoDirectAnswer50Words: clean(
        raw.aeoDirectAnswer50Words || fallbackData.aeoDirectAnswer50Words,
      ),
      outlineSections: updatedOutline,
      sectionInfographicSvgs,
      byokProviderUsed: aiRes.isLiveAi
        ? aiRes.providerUsed.toLowerCase().includes("groq")
          ? "groq-llama-3.3-70b"
          : "gemini-2.5-flash"
        : "deterministic-zero-token",
      status: "ready-for-review",
      updatedAtIso: new Date().toISOString(),
    };

    updatedJob.compiledArticleMarkdown = compileJobArticleMarkdown(
      updatedJob,
      website,
      draftedSections,
    );
    updatedJob.geoReadiness = scoreGeoCitationReadiness(updatedJob);
    updatedJob.arcadsVariations = buildArcadsSocialPackForJob(
      updatedJob,
      website,
      winnerFormulas,
    );
    updatedJob.pinterestPins = buildPinterestThreePinSuite(
      updatedJob,
      website,
      winnerFormulas,
    );

    return NextResponse.json({
      ok: true,
      job: updatedJob,
      providerUsed: aiRes.providerUsed,
      isLiveAi: aiRes.isLiveAi,
      latencyMs: aiRes.latencyMs,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate automated article & visual pack.",
      },
      { status: 500 },
    );
  }
}

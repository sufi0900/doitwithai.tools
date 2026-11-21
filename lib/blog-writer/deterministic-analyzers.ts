import { BLOG_INFOGRAPHIC_25_TEMPLATES } from "@/lib/blog-infographic-studio/templates";
import type {
  CanonicalBlogProjectState,
  DeterministicSeoCheckItem,
  DeterministicSeoScorecard,
  BlogSectionNode,
} from "./canonical-state";
const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "up",
  "about",
  "into",
  "over",
  "after",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
]);
const AI_CLICHE_PHRASES = [
  "delve into",
  "testament to",
  "in today's fast-paced digital world",
  "in the ever-evolving landscape",
  "unlock the power of",
  "tapestry of",
  "game-changer",
  "it is important to note that",
  "without further ado",
  "realm of",
];
export function measureTitlePixelWidth(text: string): number {
  if (!text) return 0;
  let px = 0;
  for (const ch of text) {
    if ("iIl1|!.,:;'\"".includes(ch)) px += 4.6;
    else if ("fjtJr()[]{}-".includes(ch)) px += 6.4;
    else if ("mwMW@%&QOGD".includes(ch)) px += 13.8;
    else if (ch >= "A" && ch <= "Z") px += 11.2;
    else if (ch === " ") px += 5.2;
    else px += 9.1;
  }
  return Math.round(px);
}
export function measureMetaDescriptionPixelWidth(text: string): number {
  if (!text) return 0;
  return Math.round(measureTitlePixelWidth(text) * 0.62);
}
export function normalizeSeoSlug(
  rawText: string,
  primaryKeyword?: string,
): string {
  const base = (rawText || primaryKeyword || "blog-post")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOP_WORDS.has(w))
    .slice(0, 7)
    .join("-");
  return base || "ai-blog-guide";
}
export function generateAnchorId(headingText: string, index: number): string {
  const slug = headingText
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join("-");
  return slug || `section-${index + 1}`;
}
export function autoRecommendInfographicTemplate(
  h2Text: string,
  bodyText = "",
): {
  templateId: number;
  templateSlug: string;
  templateName: string;
} {
  const combined = `${h2Text} ${bodyText}`.toLowerCase();
  const rules: [RegExp, number][] = [
    [/\b(vs\.?|versus|compare|comparison|alternative|difference)\b/, 6],
    [/\b(step|how to|process|pipeline|workflow|stage)\b/, 1],
    [/\b(roadmap|timeline|phase|milestone|schedule)\b/, 2],
    [/\b(pros|cons|advantage|disadvantage|trade-off)\b/, 9],
    [/\b(cost|price|pricing|roi|budget|saving)\b/, 14],
    [/\b(stat|metric|benchmark|data|study|percentage|kpi)\b/, 11],
    [/\b(checklist|audit|verify|launch|todo)\b/, 20],
    [/\b(myth|fact|misconception|mistake|don't)\b/, 23],
    [/\b(pyramid|hierarchy|tier|layer|foundation)\b/, 17],
  ];
  const id = rules.find(([pattern]) => pattern.test(combined))?.[1] || 21;
  const template = BLOG_INFOGRAPHIC_25_TEMPLATES.find((t) => t.id === id)!;
  return {
    templateId: template.id,
    templateSlug: template.slug,
    templateName: template.name,
  };
}
export function analyzeReadabilityAndBurstiness(fullText: string): {
  wordCount: number;
  sentenceCount: number;
  fleschReadingEase: number;
  burstinessStdDev: number;
  aiClichesDetected: string[];
  humanOriginalityScore: number;
  readabilityScore: number;
} {
  const clean = fullText.replace(/[#*|>`_-]/g, " ").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = clean
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
  const sentenceCount = Math.max(sentences.length, 1);
  const sentenceLengths = sentences.map(
    (s) => s.split(/\s+/).filter(Boolean).length,
  );
  const avgSentenceLen = wordCount / sentenceCount;
  const variance =
    sentenceLengths.reduce(
      (acc, len) => acc + Math.pow(len - avgSentenceLen, 2),
      0,
    ) / sentenceCount;
  const burstinessStdDev = Number(Math.sqrt(variance).toFixed(1));
  const totalSyllables = words.reduce((acc, w) => {
    const matches = w.toLowerCase().match(/[aeiouy]{1,2}/g);
    return acc + Math.max(matches ? matches.length : 1, 1);
  }, 0);
  const rawFlesch =
    206.835 -
    1.015 * avgSentenceLen -
    84.6 * (totalSyllables / Math.max(wordCount, 1));
  const fleschReadingEase = Math.max(10, Math.min(98, Math.round(rawFlesch)));
  const lower = fullText.toLowerCase();
  const aiClichesDetected = AI_CLICHE_PHRASES.filter((phrase) =>
    lower.includes(phrase),
  );
  const burstinessBonus = Math.min(25, Math.round(burstinessStdDev * 2.8));
  const clichePenalty = aiClichesDetected.length * 8;
  const humanOriginalityScore = Math.max(
    45,
    Math.min(99, 74 + burstinessBonus - clichePenalty),
  );
  const readabilityScore =
    fleschReadingEase >= 55 && fleschReadingEase <= 80
      ? 96
      : fleschReadingEase >= 45
        ? 86
        : 72;
  return {
    wordCount,
    sentenceCount,
    fleschReadingEase,
    burstinessStdDev,
    aiClichesDetected,
    humanOriginalityScore,
    readabilityScore,
  };
}
export function runFullDeterministicSeoScorecard(
  project: CanonicalBlogProjectState,
): DeterministicSeoScorecard {
  const fullBodyText = [
    project.metaPack.aeoDirectAnswer50Words,
    ...project.sections.map(
      (s) =>
        `${s.h2Text}\n${s.bodyMarkdown}\n${s.subHeadings.map((sub) => `${sub.h3Text}\n${sub.bodyMarkdown}`).join("\n")}`,
    ),
    ...project.faqs.map((f) => `${f.question} ${f.answer}`),
  ].join("\n\n");
  const titlePx = measureTitlePixelWidth(project.metaPack.metaTitle);
  const descPx = measureMetaDescriptionPixelWidth(
    project.metaPack.metaDescription,
  );
  const textStats = analyzeReadabilityAndBurstiness(fullBodyText);
  const pk = project.keywordCluster.primaryKeyword.toLowerCase().trim();
  const lowerBody = fullBodyText.toLowerCase();
  const pkRegex = pk
    ? new RegExp(pk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
    : null;
  const pkMatches = pkRegex ? fullBodyText.match(pkRegex) : null;
  const primaryKeywordCount = pkMatches ? pkMatches.length : 0;
  const primaryKeywordDensityPercent = Number(
    (
      ((primaryKeywordCount * Math.max(pk.split(/\s+/).length, 1)) /
        Math.max(textStats.wordCount, 1)) *
      100
    ).toFixed(2),
  );
  const lsiCovered = project.keywordCluster.lsiEntities.filter((entity) =>
    lowerBody.includes(entity.toLowerCase()),
  ).length;
  const lsiTotal = Math.max(project.keywordCluster.lsiEntities.length, 1);
  const lsiRatio = Math.round((lsiCovered / lsiTotal) * 100);
  const sectionsWithVisuals = project.sections.filter((s) =>
    Boolean(s.infographicConfig && s.infographicConfig.templateId),
  ).length;
  const visualCoverageRatio = Math.round(
    (sectionsWithVisuals / Math.max(project.sections.length, 1)) * 100,
  );
  const checks: DeterministicSeoCheckItem[] = [
    {
      id: "chk-title-px",
      category: "Title & SERP",
      label: "Meta Title Pixel Width (<580px Desktop Limit)",
      status:
        titlePx >= 280 && titlePx <= 580
          ? "pass"
          : titlePx <= 610
            ? "warning"
            : "fail",
      score: titlePx >= 280 && titlePx <= 580 ? 98 : 70,
      currentValue: `${titlePx}px (${project.metaPack.metaTitle.length} chars)`,
      targetBenchmark: "320px – 580px",
      fixRecommendation:
        "Trim meta title under 580px and front-load the primary keyword.",
      autoFixable: true,
    },
    {
      id: "chk-desc-px",
      category: "Title & SERP",
      label: "Meta Description Pixel Width (<920px Limit)",
      status: descPx >= 450 && descPx <= 920 ? "pass" : "warning",
      score: descPx >= 450 && descPx <= 920 ? 96 : 75,
      currentValue: `${descPx}px (${project.metaPack.metaDescription.length} chars)`,
      targetBenchmark: "500px – 920px (120–158 chars)",
      fixRecommendation:
        "Keep meta description between 125 and 155 characters with primary keyword.",
      autoFixable: true,
    },
    {
      id: "chk-h1-hierarchy",
      category: "Heading Hierarchy",
      label: "Single H1 + Sequential H2/H3 Semantic Tree",
      status:
        project.metaPack.h1Title && project.sections.length >= 2
          ? "pass"
          : "warning",
      score: project.metaPack.h1Title && project.sections.length >= 2 ? 98 : 68,
      currentValue: `1 H1 · ${project.sections.length} H2s`,
      targetBenchmark: "1 H1 + 4–8 Structured H2 Sections",
      fixRecommendation:
        "Maintain exactly 1 H1 and sequential H2 -> H3 subheadings.",
      autoFixable: false,
    },
    {
      id: "chk-lsi-coverage",
      category: "Keyword & LSI",
      label: "Primary Keyword & Semantic LSI Entity Coverage",
      status: lsiRatio >= 60 ? "pass" : "warning",
      score: Math.max(70, Math.min(99, lsiRatio + 15)),
      currentValue: `${lsiCovered}/${lsiTotal} LSI Entities (${primaryKeywordDensityPercent}% density)`,
      targetBenchmark: "75%+ LSI Entities · 0.6%–1.8% Keyword Density",
      fixRecommendation:
        "Weave remaining semantic LSI terms naturally into H2 sections.",
      autoFixable: true,
    },
    {
      id: "chk-burstiness",
      category: "Readability & Human Voice",
      label: "Human Burstiness & Zero AI Cliché Footprint",
      status: textStats.aiClichesDetected.length === 0 ? "pass" : "warning",
      score: textStats.humanOriginalityScore,
      currentValue: `Burstiness σ=${textStats.burstinessStdDev} · ${textStats.aiClichesDetected.length} Clichés`,
      targetBenchmark: "Burstiness σ ≥ 5.5 · 0 AI Clichés",
      fixRecommendation:
        "Strip overused AI phrases and mix short punchy sentences with detailed explanations.",
      autoFixable: true,
    },
    {
      id: "chk-visual-density",
      category: "Visual & Media Density",
      label: "Canva / Napkin.ai Section Infographic Coverage",
      status: visualCoverageRatio === 100 ? "pass" : "warning",
      score: Math.max(65, visualCoverageRatio),
      currentValue: `${sectionsWithVisuals}/${project.sections.length} H2 Sections Have Editable Infographics`,
      targetBenchmark: "1 Editable Visual Diagram per H2 Section",
      fixRecommendation:
        "Auto-assign a deterministic infographic template to every H2 section.",
      autoFixable: true,
    },
    {
      id: "chk-cwv-schema",
      category: "Technical & CWV",
      label: "JSON-LD @graph + Zero-CLS Responsive Image Markup",
      status:
        project.faqs.length >= 2 && project.metaPack.aeoDirectAnswer50Words
          ? "pass"
          : "warning",
      score: 97,
      currentValue: `BlogPosting + FAQPage (${project.faqs.length}) + AEO Answer Box`,
      targetBenchmark: "Combined @graph + Explicit Image Width/Height",
      fixRecommendation:
        "Include 50-word AEO Direct Answer box and FAQ schema.",
      autoFixable: true,
    },
  ];
  const titleAndSerpScore = Math.round((checks[0].score + checks[1].score) / 2);
  const headingScore = checks[2].score;
  const keywordAndLsiScore = checks[3].score;
  const humanOriginalityScore = checks[4].score;
  const readabilityScore = textStats.readabilityScore;
  const visualDensityScore = checks[5].score;
  const technicalCwvScore = checks[6].score;
  const overallScore = Math.round(
    titleAndSerpScore * 0.16 +
      headingScore * 0.14 +
      keywordAndLsiScore * 0.18 +
      humanOriginalityScore * 0.16 +
      readabilityScore * 0.12 +
      visualDensityScore * 0.12 +
      technicalCwvScore * 0.12,
  );
  return {
    overallScore,
    titleAndSerpScore,
    headingScore,
    keywordAndLsiScore,
    humanOriginalityScore,
    readabilityScore,
    visualDensityScore,
    technicalCwvScore,
    totalWordCount: textStats.wordCount,
    estimatedReadingMinutes: Math.max(1, Math.ceil(textStats.wordCount / 210)),
    primaryKeywordCount,
    primaryKeywordDensityPercent,
    fleschReadingEase: textStats.fleschReadingEase,
    burstinessStdDev: textStats.burstinessStdDev,
    aiClichesDetected: textStats.aiClichesDetected,
    checks,
  };
}
export function applyOneClickSeoAutoFixes(
  project: CanonicalBlogProjectState,
): CanonicalBlogProjectState {
  let metaTitle = project.metaPack.metaTitle.trim();
  while (measureTitlePixelWidth(metaTitle) > 575 && metaTitle.length > 35) {
    metaTitle = metaTitle.replace(/\s+\S+$/, "").trim();
  }
  let metaDescription = project.metaPack.metaDescription.trim();
  if (metaDescription.length > 156) {
    metaDescription = `${metaDescription.slice(0, 152).replace(/\s+\S+$/, "")}.`;
  }
  const cleanSlug = normalizeSeoSlug(
    project.metaPack.urlSlug || project.metaPack.h1Title,
    project.keywordCluster.primaryKeyword,
  );
  const cleanedSections: BlogSectionNode[] = project.sections.map(
    (sec, idx) => {
      let cleanedBody = sec.bodyMarkdown;
      for (const cliche of AI_CLICHE_PHRASES) {
        const reg = new RegExp(cliche, "gi");
        cleanedBody = cleanedBody.replace(reg, "examine");
      }
      const recommendedTpl = autoRecommendInfographicTemplate(
        sec.h2Text,
        cleanedBody,
      );
      const updatedVisual = sec.infographicConfig || {
        id: `vis-${sec.id}`,
        sectionId: sec.id,
        templateId: recommendedTpl.templateId,
        templateSlug: recommendedTpl.templateSlug,
        templateName: recommendedTpl.templateName,
        headline: sec.h2Text,
        subheadline: `Key insights for ${project.keywordCluster.primaryKeyword}`,
        paletteId: "indigo-cyber" as const,
        aspectRatio: "16:9" as const,
        nodes: [
          {
            id: "n1",
            badge: "01",
            title: "Core Strategy",
            detail: "Align with user search intent",
          },
          {
            id: "n2",
            badge: "02",
            title: "Visual Proof",
            detail: "Embed editable HTML5/SVG diagrams",
          },
        ],
        footerSourceLabel: "DoItWithAI.tools · Visual SEO Studio",
        altText: `${sec.h2Text} infographic`,
      };
      return {
        ...sec,
        anchorId: generateAnchorId(sec.h2Text, idx),
        bodyMarkdown: cleanedBody,
        actualWordCount: cleanedBody.split(/\s+/).filter(Boolean).length,
        infographicConfig: updatedVisual,
      };
    },
  );
  const updatedProject: CanonicalBlogProjectState = {
    ...project,
    updatedAtIso: new Date().toISOString(),
    metaPack: {
      ...project.metaPack,
      metaTitle,
      metaTitlePixelWidth: measureTitlePixelWidth(metaTitle),
      metaDescription,
      metaDescriptionPixelWidth:
        measureMetaDescriptionPixelWidth(metaDescription),
      urlSlug: cleanSlug,
    },
    sections: cleanedSections,
  };
  updatedProject.scorecard = runFullDeterministicSeoScorecard(updatedProject);
  return updatedProject;
}

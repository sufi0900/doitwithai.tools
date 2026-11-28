/**
 * Phase 3: Free-Tier BYOK Multi-Agent Article & 6-Layer Visual Batch Runner.
 *
 * Executes sequential section-by-section GEO/AEO article drafting using user-supplied
 * free-tier API keys (Google AI Studio Gemini 2.5 Flash or Groq Llama 3.3 70B) with
 * automatic fallback to 0-token deterministic synthesis, generates 1080x1350 6-layer
 * SVG section infographics, runs scoreGeoCitationReadiness(), and checkpoints every
 * completed step directly to browser localStorage (`doitwithai_autonomous_studio_v1`).
 */

import { synthesizeInfographicHeadlineAndSubheadline } from "../blog-infographic-studio/skills/topic-intelligence";
import { matchVectorSceneForTopic } from "../visual-stock/vector-scenes";
import { AUTONOMOUS_AGENT_ROLES } from "./agent-roles";
import {
  buildArcadsSocialPackForJob,
  buildPinterestThreePinSuite,
  scoreGeoCitationReadiness,
} from "./arcads-social-engine";
import { saveAutonomousStudioState } from "./local-storage-store";
import type {
  AutomatedArticleJob,
  AutonomousAgentId,
  AutonomousCampaign,
  AutonomousStudioStoreState,
  ConnectedWebsiteProfile,
  FreeTierByokConfig,
  PinterestPinCandidate,
} from "./types";

export type ByokProviderId =
  | "gemini-2.5-flash"
  | "groq-llama-3.3-70b"
  | "deterministic-zero-token";

export interface ByokSectionDraftInput {
  topicTitle: string;
  primaryKeyword: string;
  section: AutomatedArticleJob["outlineSections"][number];
  sectionIndex: number;
  toolTitle?: string;
  toolUrl?: string;
  byokConfig: FreeTierByokConfig;
  fetchImpl?: typeof fetch;
}

export interface ByokSectionDraftResult {
  h2: string;
  archetype: AutomatedArticleJob["outlineSections"][number]["archetype"];
  summary: string;
  proseParagraphs: string[];
  markdownComparisonTable?: string;
  points: Array<{ badge: string; title: string; detail: string }>;
  providerUsed: ByokProviderId;
  tokensUsed: number;
}

const clean = (s: string) => String(s || "").replace(/\s+/g, " ").trim();

function escapeXml(input: string): string {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapLines(
  text: string,
  maxCharsPerLine: number,
  maxLines: number,
): string[] {
  const words = clean(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let current = "";
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
    } else if (lines.length < maxLines - 1) {
      if (current) lines.push(current);
      current = word;
    } else {
      // Final line: append with soft ellipsis only if overflowing a 2x wide box
      if (current) {
        lines.push(`${current}…`);
      } else {
        lines.push(word.slice(0, maxCharsPerLine));
      }
      current = "";
      break;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  return lines;
}

function isUsableApiKey(key: string | undefined): key is string {
  const trimmed = String(key || "").trim();
  return trimmed.length >= 12 && !trimmed.includes("***") && !trimmed.includes("...");
}

function buildDeterministicComparisonTable(
  section: AutomatedArticleJob["outlineSections"][number],
): string | undefined {
  if (section.archetype !== "comparison") return undefined;
  const rows = [
    "| Dimension | Traditional Manual Approach | Autonomous Agentic Architecture |",
    "| --- | --- | --- |",
  ];
  for (let i = 0; i < section.points.length; i += 2) {
    const a = section.points[i];
    const b = section.points[i + 1];
    if (a && b) {
      rows.push(
        `| ${a.title.replace(/\|/g, "/")} vs. ${b.title.replace(/\|/g, "/")} | ${a.detail.replace(/\|/g, "/")} | ${b.detail.replace(/\|/g, "/")} |`,
      );
    } else if (a) {
      rows.push(
        `| ${a.title.replace(/\|/g, "/")} | Legacy ad-hoc review | ${a.detail.replace(/\|/g, "/")} |`,
      );
    }
  }
  return rows.join("\n");
}

function buildDeterministicSectionDraft(
  input: ByokSectionDraftInput,
): ByokSectionDraftResult {
  const { topicTitle, primaryKeyword, section, toolTitle, toolUrl } = input;
  const toolCta = toolTitle
    ? toolUrl
      ? `[${toolTitle}](${toolUrl})`
      : toolTitle
    : "the interactive workflow studio";

  const leadParagraph = `${section.summary} When engineering ${primaryKeyword} workflows around "${topicTitle}", every subsection opens with an explicit entity claim, measurable execution criteria, and direct reader guidance without generic filler.`;
  const mechanicsParagraph =
    section.points.length > 0
      ? `Core operational pillars include ${section.points
          .map((p) => `${p.title} (${p.detail.replace(/\.$/, "")})`)
          .join("; ")}. Teams can validate these steps live inside ${toolCta} before scheduling downstream social assets.`
      : `Apply ${toolCta} to benchmark readability, entity density, and structural clarity before publishing.`;

  return {
    h2: section.h2,
    archetype: section.archetype,
    summary: section.summary,
    proseParagraphs: [leadParagraph, mechanicsParagraph],
    markdownComparisonTable: buildDeterministicComparisonTable(section),
    points: section.points.map((p, idx) => ({
      badge: p.badge || String(idx + 1).padStart(2, "0"),
      title: clean(p.title),
      detail: clean(p.detail),
    })),
    providerUsed: "deterministic-zero-token",
    tokensUsed: 0,
  };
}

function parseJsonObjectFromModelText(rawText: string): {
  summary?: string;
  proseParagraphs?: string[];
  points?: Array<{ badge?: string; title?: string; detail?: string }>;
} | null {
  const trimmed = String(rawText || "").trim();
  if (!trimmed) return null;
  const jsonStart = trimmed.indexOf("{");
  const jsonEnd = trimmed.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd <= jsonStart) return null;
  try {
    return JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1)) as {
      summary?: string;
      proseParagraphs?: string[];
      points?: Array<{ badge?: string; title?: string; detail?: string }>;
    };
  } catch {
    return null;
  }
}

function buildSectionMicroPrompt(input: ByokSectionDraftInput): string {
  return [
    `Write a concise, E-E-A-T and GEO-ready article section in strict JSON only.`,
    `Article Topic: "${input.topicTitle}"`,
    `Primary Keyword: "${input.primaryKeyword}"`,
    `Section H2: "${input.section.h2}" (Archetype: ${input.section.archetype})`,
    input.toolTitle ? `Natural Tool Mention: ${input.toolTitle}` : "",
    `Return valid JSON matching: {"summary": string, "proseParagraphs": [string, string], "points": [{"badge": string, "title": "2-5 word standalone concept", "detail": "1 non-redundant sentence"}]}.`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Drafts a single H2 section using BYOK Gemini 2.5 Flash or Groq Llama 3.3 70B,
 * falling back seamlessly to 0-token deterministic synthesis on missing keys or HTTP 429.
 */
export async function draftSectionWithByokOrFallback(
  input: ByokSectionDraftInput,
): Promise<ByokSectionDraftResult> {
  const fetcher = input.fetchImpl || (typeof fetch === "function" ? fetch : undefined);
  const geminiKey = input.byokConfig.geminiFreeKeyMasked;
  const groqKey = input.byokConfig.groqFreeKeyMasked;
  const prompt = buildSectionMicroPrompt(input);

  // Provider 1: Google AI Studio Gemini 2.5 Flash BYOK
  if (fetcher && isUsableApiKey(geminiKey)) {
    try {
      const response = await fetcher(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
          geminiKey.trim(),
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.25,
              maxOutputTokens: 700,
              responseMimeType: "application/json",
            },
          }),
        },
      );
      if (response.ok) {
        const data = (await response.json()) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
          usageMetadata?: { totalTokenCount?: number };
        };
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const parsed = parseJsonObjectFromModelText(rawText);
        if (
          parsed &&
          Array.isArray(parsed.proseParagraphs) &&
          parsed.proseParagraphs.length > 0
        ) {
          const validPoints =
            Array.isArray(parsed.points) && parsed.points.length >= 2
              ? parsed.points.slice(0, 6).map((p, idx) => ({
                  badge: clean(p.badge || "") || String(idx + 1).padStart(2, "0"),
                  title: clean(p.title || input.section.points[idx]?.title || `Key Step ${idx + 1}`),
                  detail: clean(
                    p.detail || input.section.points[idx]?.detail || input.section.summary,
                  ),
                }))
              : input.section.points;
          return {
            h2: input.section.h2,
            archetype: input.section.archetype,
            summary: clean(parsed.summary || input.section.summary),
            proseParagraphs: parsed.proseParagraphs.map(clean).filter(Boolean),
            markdownComparisonTable: buildDeterministicComparisonTable(input.section),
            points: validPoints,
            providerUsed: "gemini-2.5-flash",
            tokensUsed: data.usageMetadata?.totalTokenCount || 520,
          };
        }
      }
    } catch {
      // Fall through cleanly to Groq or deterministic synthesis
    }
  }

  // Provider 2: GroqCloud Llama 3.3 70B Free Tier Fallback BYOK
  if (fetcher && isUsableApiKey(groqKey)) {
    try {
      const response = await fetcher(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey.trim()}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            temperature: 0.25,
            max_tokens: 700,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content:
                  "You are an expert technical SEO & GEO editor. Respond with valid JSON only.",
              },
              { role: "user", content: prompt },
            ],
          }),
        },
      );
      if (response.ok) {
        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
          usage?: { total_tokens?: number };
        };
        const rawText = data?.choices?.[0]?.message?.content || "";
        const parsed = parseJsonObjectFromModelText(rawText);
        if (
          parsed &&
          Array.isArray(parsed.proseParagraphs) &&
          parsed.proseParagraphs.length > 0
        ) {
          const validPoints =
            Array.isArray(parsed.points) && parsed.points.length >= 2
              ? parsed.points.slice(0, 6).map((p, idx) => ({
                  badge: clean(p.badge || "") || String(idx + 1).padStart(2, "0"),
                  title: clean(p.title || input.section.points[idx]?.title || `Key Step ${idx + 1}`),
                  detail: clean(
                    p.detail || input.section.points[idx]?.detail || input.section.summary,
                  ),
                }))
              : input.section.points;
          return {
            h2: input.section.h2,
            archetype: input.section.archetype,
            summary: clean(parsed.summary || input.section.summary),
            proseParagraphs: parsed.proseParagraphs.map(clean).filter(Boolean),
            markdownComparisonTable: buildDeterministicComparisonTable(input.section),
            points: validPoints,
            providerUsed: "groq-llama-3.3-70b",
            tokensUsed: data.usage?.total_tokens || 480,
          };
        }
      }
    } catch {
      // Fall back to deterministic zero-token drafting
    }
  }

  return buildDeterministicSectionDraft(input);
}

const SECTION_THEMES = [
  {
    bgStart: "#0B1021",
    bgEnd: "#131C38",
    surface: "#152142",
    border: "#38BDF8",
    accent: "#38BDF8",
    badgeBg: "#1E3A8A",
  },
  {
    bgStart: "#061A17",
    bgEnd: "#0B2B26",
    surface: "#10352F",
    border: "#10B981",
    accent: "#34D399",
    badgeBg: "#065F46",
  },
  {
    bgStart: "#160D28",
    bgEnd: "#22133D",
    surface: "#29184A",
    border: "#A855F7",
    accent: "#C084FC",
    badgeBg: "#581C87",
  },
  {
    bgStart: "#081426",
    bgEnd: "#0F2544",
    surface: "#153059",
    border: "#60A5FA",
    accent: "#93C5FD",
    badgeBg: "#1D4ED8",
  },
];

/**
 * Generates a standalone 1080x1350 6-Layer Section Infographic SVG at 0 LLM tokens.
 */
export function renderSectionInfographicSvg(
  section: AutomatedArticleJob["outlineSections"][number],
  options: {
    sectionIndex?: number;
    totalSections?: number;
    brandName?: string;
    brandPrimaryHex?: string;
    brandSecondaryHex?: string;
    paletteId?: string;
  } = {},
): string {
  const W = 1080;
  const H = 1350;
  const secIdx = options.sectionIndex ?? 0;
  const totalSec = options.totalSections ?? 4;
  const theme = SECTION_THEMES[secIdx % SECTION_THEMES.length];
  const accent = options.brandPrimaryHex || theme.accent;
  const secondary = options.brandSecondaryHex || theme.border;
  const brandName = options.brandName || "DoItWithAI.tools";
  const gradId = `secBg-${secIdx}-${String(section.archetype)}`;
  const patternId = `secDots-${secIdx}`;

  const { headline } = synthesizeInfographicHeadlineAndSubheadline(section.h2);
  const headlineLines = wrapLines(headline, 34, 2);
  const summaryLines = wrapLines(section.summary, 66, 2);
  const points = (section.points || []).slice(0, 6);

  const headerBottomY = 278;
  const footerTopY = 1264;
  const availH = footerTopY - headerBottomY - 16;
  const isTwoCol = points.length >= 4 && section.archetype !== "process";

  let cardsSvg = "";
  if (isTwoCol) {
    const rows = Math.ceil(points.length / 2);
    const colGap = 24;
    const rowGap = 22;
    const colW = (960 - colGap) / 2;
    const cardH = Math.min(310, Math.floor((availH - rowGap * (rows - 1)) / rows));

    cardsSvg = points
      .map((pt, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const spanFull = idx === points.length - 1 && points.length % 2 === 1;
        const w = spanFull ? 960 : colW;
        const x = 60 + col * (colW + colGap);
        const y = headerBottomY + row * (cardH + rowGap);
        const tLines = wrapLines(pt.title, spanFull ? 60 : 34, 2);
        const dLines = wrapLines(pt.detail, spanFull ? 84 : 44, 5);

        return `<g transform="translate(${x}, ${y})" data-infographic-node="${idx + 1}">
          <rect width="${w}" height="${cardH}" rx="20" fill="${theme.surface}" fill-opacity="0.92" stroke="${secondary}" stroke-opacity="0.45" stroke-width="2" />
          <rect x="24" y="22" width="64" height="36" rx="10" fill="${theme.badgeBg}" stroke="${accent}" stroke-width="1.5" />
          <text x="56" y="46" text-anchor="middle" fill="#FFFFFF" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="800">${escapeXml(
            pt.badge || String(idx + 1).padStart(2, "0"),
          )}</text>
          ${tLines
            .map(
              (line, li) =>
                `<text x="24" y="${88 + li * 28}" fill="#FFFFFF" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="700">${escapeXml(
                  line,
                )}</text>`,
            )
            .join("")}
          ${dLines
            .map(
              (line, di) =>
                `<text x="24" y="${96 + tLines.length * 28 + di * 24}" fill="#CBD5E1" font-family="Inter, system-ui, sans-serif" font-size="17" font-weight="500">${escapeXml(
                  line,
                )}</text>`,
            )
            .join("")}
        </g>`;
      })
      .join("\n");
  } else {
    const gap = 20;
    const count = Math.max(1, points.length);
    const cardH = Math.min(220, Math.floor((availH - gap * (count - 1)) / count));
    cardsSvg = points
      .map((pt, idx) => {
        const y = headerBottomY + idx * (cardH + gap);
        const tLines = wrapLines(pt.title, 44, 2);
        const detailStart = 58 + tLines.length * 30;
        const detailCapacity = Math.floor((cardH - 12 - detailStart) / 25) + 1;
        const dLines = wrapLines(pt.detail, 64, Math.min(3, Math.max(1, detailCapacity)));
        return `<g transform="translate(60, ${y})" data-infographic-node="${idx + 1}">
          <rect width="960" height="${cardH}" rx="20" fill="${theme.surface}" fill-opacity="0.92" stroke="${secondary}" stroke-opacity="0.45" stroke-width="2" />
          <rect x="26" y="26" width="70" height="42" rx="12" fill="${theme.badgeBg}" stroke="${accent}" stroke-width="1.5" />
          <text x="61" y="53" text-anchor="middle" fill="#FFFFFF" font-family="Inter, system-ui, sans-serif" font-size="19" font-weight="800">${escapeXml(
            pt.badge || String(idx + 1).padStart(2, "0"),
          )}</text>
          ${tLines
            .map(
              (line, li) =>
                `<text x="118" y="${52 + li * 30}" fill="#FFFFFF" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="700">${escapeXml(
                  line,
                )}</text>`,
            )
            .join("")}
          ${dLines
            .map(
              (line, di) =>
                `<text x="118" y="${58 + tLines.length * 30 + di * 25}" fill="#CBD5E1" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="500">${escapeXml(
                  line,
                )}</text>`,
            )
            .join("")}
        </g>`;
      })
      .join("\n");
  }

  const matchedScene = matchVectorSceneForTopic(
    `${section.h2} ${section.summary}`,
    section.archetype === "comparison"
      ? "comparison"
      : section.archetype === "process"
        ? "timeline"
        : "editorial",
    secIdx,
  );
  const sceneMarkup = matchedScene.renderSvgNodes({
    primary: accent,
    secondary,
    surface: theme.surface,
    ink: "#FFFFFF",
    muted: "#94A3B8",
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" style="max-width:100%;height:auto" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(
    section.h2,
  )}">
  <defs>
    <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.bgStart}" />
      <stop offset="100%" stop-color="${theme.bgEnd}" />
    </linearGradient>
    <pattern id="${patternId}" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="1.5" fill="${accent}" fill-opacity="0.16" />
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${gradId})" />
  <rect width="${W}" height="${H}" fill="url(#${patternId})" />
  <g transform="translate(800, 34) scale(0.92)" opacity="0.82" data-vector-scene="${matchedScene.id}">
    ${sceneMarkup}
  </g>
  <g transform="translate(60, 44)">
    <rect width="380" height="40" rx="20" fill="${theme.badgeBg}" fill-opacity="0.9" stroke="${accent}" stroke-width="1.5" />
    <text x="20" y="26" fill="${accent}" font-family="Inter, system-ui, sans-serif" font-size="15" font-weight="800" letter-spacing="1">${escapeXml(
      `SECTION ${String(secIdx + 1).padStart(2, "0")} / ${String(totalSec).padStart(2, "0")} · ${section.archetype.toUpperCase()}`,
    )}</text>
  </g>
  <g transform="translate(60, 132)">
    ${headlineLines
      .map(
        (line, idx) =>
          `<text x="0" y="${idx * 46}" fill="${idx === headlineLines.length - 1 ? accent : "#FFFFFF"}" font-family="Inter, system-ui, sans-serif" font-size="38" font-weight="800">${escapeXml(
            line,
          )}</text>`,
      )
      .join("\n    ")}
  </g>
  <g transform="translate(60, ${138 + headlineLines.length * 46})">
    ${summaryLines
      .map(
        (line, idx) =>
          `<text x="0" y="${idx * 26}" fill="#94A3B8" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="500">${escapeXml(
            line,
          )}</text>`,
      )
      .join("\n    ")}
  </g>
  ${cardsSvg}
  <line x1="60" y1="${footerTopY}" x2="1020" y2="${footerTopY}" stroke="${accent}" stroke-opacity="0.3" stroke-width="1.5" />
  <text x="60" y="${footerTopY + 46}" fill="#94A3B8" font-family="Inter, system-ui, sans-serif" font-size="17" font-weight="600">6-Layer Autonomous Infographic · 1080×1350</text>
  <text x="1020" y="${footerTopY + 46}" text-anchor="end" fill="#FFFFFF" font-family="Inter, system-ui, sans-serif" font-size="19" font-weight="800">${escapeXml(
    brandName,
  )}</text>
</svg>`;
}

/**
 * Compiles the full SEO + GEO Markdown article with 50-word AEO direct answer lead,
 * section breakdowns, Markdown comparison table, FAQ pairs, and contextual internal tool links.
 */
export function compileJobArticleMarkdown(
  job: AutomatedArticleJob,
  website: ConnectedWebsiteProfile,
  draftedSections?: ByokSectionDraftResult[],
): string {
  const toolSlug =
    job.matchedInternalToolSlug ||
    website.installedTools[0]?.slug ||
    "blog-section-infographic-generator";
  const toolTitle =
    job.matchedInternalToolTitle ||
    website.installedTools[0]?.title ||
    "Free AI Blog Section Infographic Generator";
  const baseUrl = website.siteUrl.replace(/\/$/, "");
  const toolUrl =
    website.installedTools.find((t) => t.slug === toolSlug)?.url ||
    `${baseUrl}/tools/${toolSlug}`;

  const sectionsToRender: ByokSectionDraftResult[] =
    draftedSections && draftedSections.length > 0
      ? draftedSections
      : job.outlineSections.map((sec, idx) =>
          buildDeterministicSectionDraft({
            topicTitle: job.topicTitle,
            primaryKeyword: job.primaryKeyword,
            section: sec,
            sectionIndex: idx,
            toolTitle,
            toolUrl,
            byokConfig: {
              usePlatformFreeTier: true,
              geminiFreeKeyMasked: "",
              groqFreeKeyMasked: "",
              rpmCooldownSeconds: 45,
              maxArticlesPerCampaign: 15,
              dailyTokenCap: 250000,
            },
          }),
        );

  const lines: string[] = [
    `# ${job.topicTitle}`,
    "",
    `**Primary Keyword:** \`${job.primaryKeyword}\` · **Publisher:** [${website.siteName}](${baseUrl})`,
    "",
    `> **50-Word Direct Answer:** ${job.aeoDirectAnswer50Words}`,
    "",
  ];

  sectionsToRender.forEach((sec, idx) => {
    lines.push(`## ${sec.h2}`, "");
    for (const para of sec.proseParagraphs) {
      lines.push(para, "");
    }
    if (sec.markdownComparisonTable) {
      lines.push(sec.markdownComparisonTable, "");
    }
    if (sec.points.length > 0) {
      lines.push(`### Key Takeaways (Section Infographic ${idx + 1}/${sectionsToRender.length})`, "");
      for (const pt of sec.points) {
        if (sec.archetype === "faq") {
          lines.push(`**${pt.badge}: ${pt.title}**`, "", pt.detail, "");
        } else {
          lines.push(`- **${pt.badge} · ${pt.title}**: ${pt.detail}`);
        }
      }
      lines.push("");
    }
    if (idx === 1) {
      lines.push(
        `> **Interactive Tool Recommendation:** Apply these rules immediately inside [${toolTitle}](${toolUrl}).`,
        "",
      );
    }
  });

  lines.push(
    `---`,
    `*Published via ${website.siteName} Autonomous Content, Visual & Social Agent OS · Target Tool: [${toolTitle}](${toolUrl})*`,
  );

  return lines.join("\n");
}

function sleepMs(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes Phase 3 step-by-step across a job's H2 sections with optional BYOK LLM
 * calls, generates 1080x1350 6-layer SVG section infographics, scores GEO Citation
 * Readiness, and checkpoints every completed section into browser localStorage.
 */
export async function runByokJobWithCheckpoints(params: {
  state: AutonomousStudioStoreState;
  campaignId: string;
  jobId: string;
  onCheckpoint?: (
    nextState: AutonomousStudioStoreState,
    completedSectionIndex: number,
  ) => void;
  storage?: Pick<Storage, "setItem">;
  fetchImpl?: typeof fetch;
  skipCooldownInTests?: boolean;
}): Promise<{
  state: AutonomousStudioStoreState;
  job: AutomatedArticleJob;
  sectionInfographicSvgs: string[];
  compiledArticleMarkdown: string;
  providerUsed: ByokProviderId;
}> {
  let currentState = params.state;
  const campaign = currentState.campaigns.find((c) => c.id === params.campaignId);
  if (!campaign) {
    throw new Error(`Campaign "${params.campaignId}" not found.`);
  }
  const initialJob = campaign.jobs.find((j) => j.id === params.jobId);
  if (!initialJob) {
    throw new Error(`Job "${params.jobId}" not found in campaign.`);
  }
  const website =
    currentState.websites.find((w) => w.id === campaign.websiteId) ||
    currentState.websites[0];

  const matchedToolUrl =
    website.installedTools.find((t) => t.slug === initialJob.matchedInternalToolSlug)?.url ||
    `${website.siteUrl.replace(/\/$/, "")}/tools/${
      initialJob.matchedInternalToolSlug || "blog-section-infographic-generator"
    }`;

  const draftedSections: ByokSectionDraftResult[] = [];
  const sectionSvgs: string[] = [];
  let providerUsed: ByokProviderId = "deterministic-zero-token";

  const cooldownMs = params.skipCooldownInTests
    ? 0
    : Math.min(250, Math.max(0, (currentState.byokConfig.rpmCooldownSeconds || 0) * 5));

  for (let i = 0; i < initialJob.outlineSections.length; i++) {
    const sec = initialJob.outlineSections[i];
    const drafted = await draftSectionWithByokOrFallback({
      topicTitle: initialJob.topicTitle,
      primaryKeyword: initialJob.primaryKeyword,
      section: sec,
      sectionIndex: i,
      toolTitle: initialJob.matchedInternalToolTitle,
      toolUrl: matchedToolUrl,
      byokConfig: currentState.byokConfig,
      fetchImpl: params.fetchImpl,
    });
    if (drafted.providerUsed !== "deterministic-zero-token") {
      providerUsed = drafted.providerUsed;
    }
    draftedSections.push(drafted);

    const svg = renderSectionInfographicSvg(
      { ...sec, summary: drafted.summary, points: drafted.points },
      {
        sectionIndex: i,
        totalSections: initialJob.outlineSections.length,
        brandName: website.siteName,
        brandPrimaryHex: website.brandPrimaryHex,
        brandSecondaryHex: website.brandSecondaryHex,
      },
    );
    sectionSvgs.push(svg);

    const nowIso = new Date().toISOString();
    const partialCompletedAgents: AutonomousAgentId[] =
      i + 1 < initialJob.outlineSections.length
        ? [
            "website-brand-scout",
            "trend-keyword-radar",
            "topical-map-architect",
            "geo-article-writer",
            "citation-readiness-critic",
          ]
        : AUTONOMOUS_AGENT_ROLES.map((r) => r.id);

    const nextOutline = initialJob.outlineSections.map((orig, oIdx) =>
      oIdx <= i && draftedSections[oIdx]
        ? {
            ...orig,
            summary: draftedSections[oIdx].summary,
            points: draftedSections[oIdx].points,
          }
        : orig,
    );

    const isLastSection = i === initialJob.outlineSections.length - 1;
    const compiledMarkdown = compileJobArticleMarkdown(
      { ...initialJob, outlineSections: nextOutline },
      website,
      draftedSections,
    );

    const updatedCampaigns: AutonomousCampaign[] = currentState.campaigns.map(
      (camp): AutonomousCampaign => {
        if (camp.id !== params.campaignId) return camp;
        const updatedJobs: AutomatedArticleJob[] = camp.jobs.map(
          (job): AutomatedArticleJob => {
            if (job.id !== params.jobId) return job;
            const nextJobDraft: AutomatedArticleJob = {
              ...job,
              outlineSections: nextOutline,
              compiledArticleMarkdown: compiledMarkdown,
              sectionInfographicSvgs: [...sectionSvgs],
              byokProviderUsed: providerUsed,
              completedAgents: partialCompletedAgents,
              activeAgent: isLastSection ? undefined : "prism-visual-infographic",
              updatedAtIso: nowIso,
            };
            nextJobDraft.geoReadiness = scoreGeoCitationReadiness(nextJobDraft);
            if (isLastSection) {
              nextJobDraft.arcadsVariations =
                nextJobDraft.arcadsVariations.length > 0
                  ? nextJobDraft.arcadsVariations
                  : buildArcadsSocialPackForJob(
                      nextJobDraft,
                      website,
                      currentState.winnerFormulas,
                    );
              const rawPins =
                nextJobDraft.pinterestPins.length > 0
                  ? nextJobDraft.pinterestPins
                  : buildPinterestThreePinSuite(
                      nextJobDraft,
                      website,
                      currentState.winnerFormulas,
                    );
              const autoPublishAllowed =
                camp.approvalMode === "confidence-gated-90" &&
                nextJobDraft.geoReadiness.overallScore >= camp.confidenceThreshold;
              nextJobDraft.status = autoPublishAllowed
                ? "published"
                : "ready-for-review";
              if (autoPublishAllowed && !nextJobDraft.publishedUrl) {
                nextJobDraft.publishedUrl =
                  website.publishingMode === "internal-doitwithai-site" &&
                  website.internalBuilderSlug
                    ? `/p/${website.internalBuilderSlug}/blog/${nextJobDraft.urlSlug}`
                    : `${website.siteUrl.replace(/\/$/, "")}/blog/${nextJobDraft.urlSlug}`;
              }
              nextJobDraft.pinterestPins = rawPins.map(
                (pin): PinterestPinCandidate => ({
                  ...pin,
                  status:
                    nextJobDraft.status === "published"
                      ? "scheduled-buffer"
                      : pin.status,
                }),
              );
            } else {
              nextJobDraft.status = "generating-visuals";
            }
            return nextJobDraft;
          },
        );

        const allDone = updatedJobs.every(
          (j) => j.status === "published" || j.status === "ready-for-review",
        );
        const nextCampStatus: AutonomousCampaign["status"] = allDone
          ? "completed"
          : "running";

        return {
          ...camp,
          status: nextCampStatus,
          jobs: updatedJobs,
          updatedAtIso: nowIso,
        };
      },
    );

    currentState = saveAutonomousStudioState(
      {
        ...currentState,
        campaigns: updatedCampaigns,
        lastSavedAtIso: nowIso,
      },
      params.storage,
    );

    params.onCheckpoint?.(currentState, i);

    if (!isLastSection && isUsableApiKey(currentState.byokConfig.geminiFreeKeyMasked)) {
      await sleepMs(cooldownMs);
    }
  }

  const finalCampaign = currentState.campaigns.find(
    (c) => c.id === params.campaignId,
  )!;
  const finalJob = finalCampaign.jobs.find((j) => j.id === params.jobId)!;

  return {
    state: currentState,
    job: finalJob,
    sectionInfographicSvgs: finalJob.sectionInfographicSvgs || sectionSvgs,
    compiledArticleMarkdown: finalJob.compiledArticleMarkdown || "",
    providerUsed,
  };
}

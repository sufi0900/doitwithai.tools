import { inferNodeIcon } from "@/features/tool-ui/infographicIcons";
import { sourceMetric } from "@/features/tool-ui/visualText";
import {
  type InfographicNodeItem,
  type InfographicTemplateId,
} from "@/features/tool-ui/EditableInfographicStudio";

export interface BlogToInfographicInput {
  title: string;
  sourceContent: string;
  sourceUrl?: string;
  brandFooter?: string;
  preferredTemplate?: InfographicTemplateId;
  sideImageUrl?: string;
}

export interface BlogToInfographicPack {
  infographicTitle: string;
  infographicSubtitle: string;
  kickerLabel: string;
  recommendedTemplate: InfographicTemplateId;
  nodes: InfographicNodeItem[];
  seoAltText: string;
  socialCaption: string;
  evidenceSummary: string[];
}

export const DEFAULT_BLOG_INFOGRAPHIC_INPUT: BlogToInfographicInput = {
  title: "6-Step AI Content Repurposing System for Compounding Organic Traffic",
  sourceContent:
    "1. Choose a source article: Start with an article you know well and identify its main lesson.\n2. Select useful takeaways: Extract a few practical points that stand on their own.\n3. Draw a visual explanation: Choose a timeline, comparison, hierarchy, or illustrated list to fit the message.\n4. Build a carousel: Give each slide one clear idea and a readable headline.\n5. Draft a short video: Turn the key lesson into a hook, explanation, and next step.\n6. Review and share: Check facts, add the source, and adapt each version to its channel.",
  sourceUrl: "https://doitwithai.tools",
  brandFooter: "doitwithai.tools",
  preferredTemplate: "side-image-editorial-split",
};

function cleanSentence(raw: string): string {
  return String(raw || "")
    .replace(/\s*\|\s*[^|]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectBestTemplateForTopic(
  title: string,
  content: string,
  hasSideImage?: boolean,
): InfographicTemplateId {
  const combined = `${title} ${content}`.toLowerCase();
  if (hasSideImage) return "side-image-editorial-split";
  if (
    /\b(vs\.?|versus|compare|comparison|difference between|old way|new way)\b/.test(
      combined,
    )
  ) {
    return "versus-battle-comparison";
  }
  if (
    /\b(mistake|avoid|do and don't|dos and donts|pitfall|error)\b/.test(
      combined,
    )
  ) {
    return "dos-and-donts-matrix";
  }
  if (
    /\b(funnel|conversion stage|pipeline|drop-off|retention)\b/.test(combined)
  ) {
    return "conversion-funnel-stages";
  }
  if (/\b(pyramid|hierarchy|maslow|tier|foundation|level)\b/.test(combined)) {
    return "isometric-3d-pyramid";
  }
  if (
    /\b(timeline|history|evolution|year|2024|2025|2026|chronolog|milestone)\b/.test(
      combined,
    )
  ) {
    return "alternating-spine-timeline";
  }
  if (
    /\b(stat|benchmark|metric|percentage|survey|report|data|kpi|roi)\b/.test(
      combined,
    )
  ) {
    return "stat-donut-kpi-dashboard";
  }
  if (
    /\b(cluster|ecosystem|mind map|hub|spoke|pillar|network|architecture)\b/.test(
      combined,
    )
  ) {
    return "radial-hub-and-spoke";
  }
  if (/\b(matrix|quadrant|2x2|swot|impact vs effort)\b/.test(combined)) {
    return "quadrant-2x2-strategy";
  }
  if (/\b(checklist|audit|scorecard|verify|inspection)\b/.test(combined)) {
    return "checklist-audit-scorecard";
  }
  if (/\b(flywheel|cycle|loop|continuous)\b/.test(combined)) {
    return "circular-flywheel-cycle";
  }
  return "winding-s-roadmap";
}

function synthesizeTopicEvidenceLines(topicTitle: string): string[] {
  const topic = cleanSentence(topicTitle);
  return [
    `1. Define the question: Explain what your reader needs to understand about ${topic}.`,
    "2. Add source material: Paste relevant notes, examples, or an article before making factual claims.",
    "3. Select key points: Choose a few distinct ideas that support the main message.",
    "4. Explain the relationships: Show the sequence, comparison, or hierarchy that connects those ideas.",
    "5. Add an example: Use a concrete example from your source to make the explanation useful.",
    "6. Review and attribute: Verify facts and link to the original source before publishing.",
  ];
}

export function buildDeterministicBlogInfographic(
  input: BlogToInfographicInput,
): BlogToInfographicPack {
  const cleanTitle =
    cleanSentence(input.title) || "Step-by-Step Visual Implementation Guide";

  const rawLines = String(input.sourceContent || "")
    .split(/\n+|(?<=[.!?])\s+/)
    .map((l) => cleanSentence(l))
    .filter(
      (l) =>
        l.length >= 18 &&
        !/^(table of contents|in this article|overview|conclusion|related posts|frequently asked questions)$/i.test(
          l,
        ),
    );

  const selected = (
    rawLines.length > 0 ? rawLines : synthesizeTopicEvidenceLines(cleanTitle)
  ).slice(0, 6);

  const nodes: InfographicNodeItem[] = selected.map((line, idx) => {
    const stripped = line.replace(/^\d+[\).\s-]+|^[•✅📌-]\s*/, "").trim();
    const colonParts = stripped.split(":");
    let nodeTitle = "";
    let nodeBody = "";

    if (colonParts.length >= 2 && colonParts[0].length <= 48) {
      nodeTitle = colonParts[0].trim();
      nodeBody = colonParts.slice(1).join(":").trim();
    } else {
      const words = stripped.split(/\s+/);
      nodeTitle = words.slice(0, 5).join(" ");
      nodeBody = stripped;
    }

    const metricVal = sourceMetric(stripped);

    return {
      id: `info-node-${idx + 1}`,
      badge: `0${idx + 1}`,
      title: nodeTitle.slice(0, 48),
      body: nodeBody.slice(0, 135),
      metricValue: metricVal,
      compareRight: "",
      icon: inferNodeIcon(`${nodeTitle} ${nodeBody}`, idx),
    };
  });

  const recommendedTemplate =
    input.preferredTemplate ||
    detectBestTemplateForTopic(
      cleanTitle,
      selected.join(" "),
      Boolean(input.sideImageUrl),
    );

  const evidenceSummary = nodes.map(
    (n, i) =>
      `Finding #${i + 1} (${n.metricValue || `Step ${i + 1}`}): ${n.title} — ${n.body}`,
  );

  return {
    infographicTitle: cleanTitle.slice(0, 78),
    infographicSubtitle: input.sourceContent.trim()
      ? `A visual summary of ${nodes.length} takeaways from your supplied content.`
      : "An editable outline. Add source material to turn it into a factual infographic.",
    kickerLabel: "VISUAL GUIDE",
    recommendedTemplate,
    nodes,
    seoAltText: `Infographic showing ${cleanTitle}: ${nodes.map((n) => `${n.title}${n.metricValue ? ` (${n.metricValue})` : ""}`).join(", ")}.`,
    socialCaption: `📌 Visual Breakdown: ${cleanTitle}\n\n${nodes.map((n, i) => `${i + 1}. ${n.title}${n.metricValue ? ` (${n.metricValue})` : ""} — ${n.body}`).join("\n")}\n\nSave this infographic for your workflow! 👇\n🌐 ${input.sourceUrl || "https://doitwithai.tools"}`,
    evidenceSummary: [
      input.sourceContent.trim()
        ? "Based on the supplied text; no independent web research was performed."
        : "Topic-only outline; no sources have been retrieved or verified.",
      ...evidenceSummary,
    ],
  };
}

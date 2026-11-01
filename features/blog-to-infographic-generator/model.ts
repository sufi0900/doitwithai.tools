import type {
  InfographicNodeItem,
  InfographicTemplateId,
} from "@/features/tool-ui/EditableInfographicStudio";

export interface BlogToInfographicInput {
  title: string;
  sourceContent: string;
  sourceUrl?: string;
  brandFooter?: string;
  preferredTemplate?: InfographicTemplateId;
}

export interface BlogToInfographicPack {
  infographicTitle: string;
  infographicSubtitle: string;
  kickerLabel: string;
  recommendedTemplate: InfographicTemplateId;
  nodes: InfographicNodeItem[];
  seoAltText: string;
  socialCaption: string;
}

export const DEFAULT_BLOG_INFOGRAPHIC_INPUT: BlogToInfographicInput = {
  title: "6-Step AI Content Repurposing Framework for Organic Traffic",
  sourceContent:
    "1. Publish Pillar Guide: Start with a 2,000-word authoritative article solving a high-intent search problem.\n2. Slice H2 Sub-Topics: Extract 5 to 6 standalone sub-topics so each section becomes its own social post.\n3. Design Visual Infographic: Convert core steps and metrics into a vertical infographic poster that earns backlinks.\n4. Build 5-Slide Carousel: Package the top lessons into a swipeable LinkedIn and Instagram carousel deck.\n5. Record 45s Short Video: Read the connected voiceover script for YouTube Shorts, Reels, and TikTok.\n6. Distribute & Syndicate: Share across social channels with a First-Comment link to drive compounding traffic.",
  sourceUrl: "https://doitwithai.tools",
  brandFooter: "doitwithai.tools",
  preferredTemplate: "step-roadmap",
};

function cleanSentence(raw: string): string {
  return String(raw || "")
    .replace(/\s*\|\s*[^|]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildDeterministicBlogInfographic(
  input: BlogToInfographicInput,
): BlogToInfographicPack {
  const cleanTitle =
    cleanSentence(input.title) ||
    "Step-by-Step Visual Implementation Guide";

  const lines = String(input.sourceContent || "")
    .split(/\n+|(?<=[.!?])\s+/)
    .map((l) => cleanSentence(l))
    .filter(
      (l) =>
        l.length >= 18 &&
        !/^(table of contents|in this article|overview|conclusion|related posts)$/i.test(
          l,
        ),
    );

  const selected = (lines.length >= 3 ? lines : DEFAULT_BLOG_INFOGRAPHIC_INPUT.sourceContent.split("\n")).slice(0, 6);

  const nodes: InfographicNodeItem[] = selected.map((line, idx) => {
    const stripped = line.replace(/^\d+[\).\s-]+|^[•✅📌-]\s*/, "").trim();
    const colonParts = stripped.split(":");
    let nodeTitle = "";
    let nodeBody = "";

    if (colonParts.length >= 2 && colonParts[0].length <= 45) {
      nodeTitle = colonParts[0].trim();
      nodeBody = colonParts.slice(1).join(":").trim();
    } else {
      const words = stripped.split(/\s+/);
      nodeTitle = words.slice(0, 5).join(" ");
      nodeBody = stripped;
    }

    const numMatch = stripped.match(/\b\d+(?:\.\d+)?%|\b\d+x\b|\$\d[\d,.]*/i);
    return {
      id: `info-node-${idx + 1}`,
      badge: `0${idx + 1}`,
      title: nodeTitle.slice(0, 48),
      body: nodeBody.slice(0, 130),
      metricValue: numMatch ? numMatch[0] : `Step 0${idx + 1}`,
      compareRight: `Apply ${nodeTitle.toLowerCase()} with structured workflows for 2x faster execution.`,
    };
  });

  return {
    infographicTitle: cleanTitle.slice(0, 75),
    infographicSubtitle: `A visual breakdown of ${nodes.length} actionable takeaways you can save, implement, and share with your team.`,
    kickerLabel: "VISUAL INFOGRAPHIC GUIDE",
    recommendedTemplate: input.preferredTemplate || "step-roadmap",
    nodes,
    seoAltText: `Infographic showing ${cleanTitle}: ${nodes.map((n) => n.title).join(", ")}.`,
    socialCaption: `📌 Visual Breakdown: ${cleanTitle}\n\n${nodes.map((n, i) => `${i + 1}. ${n.title} — ${n.body}`).join("\n")}\n\nSave this infographic for your next project! 👇\n🌐 ${input.sourceUrl || "https://doitwithai.tools"}`,
  };
}

import { createPrismSample, withPrismLayout } from "./visual-brief";
import type { PrismLayout } from "./layout-registry";
import type { BlogInfographicConfig } from "@/lib/blog-writer/canonical-state";

/** Curated examples are only for the showcase and QA. Never mix them into extracted article data. */
export function createLayoutSample(layout: PrismLayout): BlogInfographicConfig {
  const sample = withPrismLayout(createPrismSample(), layout);
  sample.footerSourceLabel = "DoItWithAI.tools · Example, not measured results";
  const themes: Record<PrismLayout, BlogInfographicConfig["paletteId"]> = {
    editorial: "indigo-cyber",
    constellation: "violet-saas",
    ribbon: "emerald-growth",
    timeline: "blue-trust",
    comparison: "amber-executive",
    checklist: "rose-editorial",
  };
  sample.paletteId = themes[layout];
  sample.depth = {
    preset:
      layout === "ribbon"
        ? "layered"
        : layout === "constellation"
          ? "raised"
          : "soft",
    strength: 65,
  };
  if (["timeline", "checklist", "comparison"].includes(layout)) {
    const sets = {
      timeline: {
        headline: "From keyword list to useful content",
        subheadline:
          "Four decisions that turn research into a publishing plan.",
        items: [
          [
            "Keep relevant queries",
            "Remove unrelated searches and keep questions your audience actually needs answered.",
            "search",
          ],
          [
            "Group shared intent",
            "Combine queries that belong on the same page. Separate topics with different search intent.",
            "target",
          ],
          [
            "Build a useful brief",
            "Match the page format to the reader’s goal, then outline the evidence and examples it needs.",
            "evidence",
          ],
          [
            "Review and improve",
            "Publish the page, check its search performance and update the parts readers still find unclear.",
            "workflow",
          ],
        ],
      },
      checklist: {
        headline: "A clearer answer starts here",
        subheadline: "A practical quality check before publishing.",
        items: [
          [
            "Answer the real question",
            "Start with an explanation that resolves the reader’s main problem before adding supporting detail.",
            "answer",
          ],
          [
            "Show your evidence",
            "Support claims with sources, useful examples or clearly labeled original observations.",
            "evidence",
          ],
          [
            "Make the next step easy",
            "Give readers an action they can take and link to the tool or guide that helps them do it.",
            "workflow",
          ],
          [
            "Check the finished page",
            "Read the content on a small screen and confirm that links, images and headings make sense.",
            "check",
          ],
        ],
      },
      comparison: {
        headline: "Human judgment & AI assistance",
        subheadline: "Different responsibilities within one reviewed workflow.",
        items: [
          [
            "Connect with the reader",
            "Define the audience and decide what evidence makes an answer useful.",
            "answer",
          ],
          [
            "Organize the material",
            "Group related ideas and suggest an outline for closer review.",
            "search",
          ],
          [
            "Take responsibility",
            "Verify sources and approve the final wording before publishing.",
            "evidence",
          ],
          [
            "Support the process",
            "Summarize material and revise drafts while preserving sources for review.",
            "workflow",
          ],
        ],
      },
    } as const;
    const set = sets[layout as keyof typeof sets];
    sample.headline = set.headline;
    sample.subheadline = set.subheadline;
    sample.nodes = set.items.map(([title, detail, icon], i) => ({
      id: `${layout}-${i}`,
      badge: String(i + 1).padStart(2, "0"),
      title,
      detail,
      icon,
      metricValue: "",
    }));
    if (layout === "comparison")
      sample.comparisonLabels = ["Human judgment", "AI assistance"];
  }
  sample.altText = `${sample.headline}: ${sample.nodes.map((n) => n.title).join("; ")}`;
  return sample;
}

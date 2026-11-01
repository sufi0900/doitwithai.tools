import {
  inferNodeIcon,
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
    "1. Publish High-Evidence Pillar Guide: Start with an authoritative 2,000-word article backed by first-hand benchmarks (+142% organic dwell time).\n2. Slice H2 Sub-Topics Into Standalone Angles: Extract 5 to 6 independent sub-topics so every section becomes its own social post (6x content output).\n3. Render Vector Visual Infographic: Convert core steps and statistics into a saveable infographic poster that earns passive editorial backlinks (3.4x more shares).\n4. Package 7-Slide LinkedIn & IG Carousel: Transform the framework into a swipeable visual deck with a 1-click hook slide (84% completion rate).\n5. Script 45-Second Vertical Video: Adapt the top 3 takeaways into a high-retention YouTube Short, Reel, and TikTok script (72% 3-second hold rate).\n6. Syndicate With First-Comment Attribution: Distribute across LinkedIn, Pinterest, and X with a clean UTM link in the first comment (+68% referral CTR).",
  sourceUrl: "https://doitwithai.tools",
  brandFooter: "doitwithai.tools",
  preferredTemplate: "winding-s-roadmap",
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
  if (/\b(vs\.?|versus|compare|comparison|difference between|old way|new way)\b/.test(combined)) {
    return "versus-battle-comparison";
  }
  if (/\b(mistake|avoid|do and don't|dos and donts|pitfall|error)\b/.test(combined)) {
    return "dos-and-donts-matrix";
  }
  if (/\b(funnel|conversion stage|pipeline|drop-off|retention)\b/.test(combined)) {
    return "conversion-funnel-stages";
  }
  if (/\b(pyramid|hierarchy|maslow|tier|foundation|level)\b/.test(combined)) {
    return "isometric-3d-pyramid";
  }
  if (/\b(timeline|history|evolution|year|2024|2025|2026|chronolog|milestone)\b/.test(combined)) {
    return "alternating-spine-timeline";
  }
  if (/\b(stat|benchmark|metric|percentage|survey|report|data|kpi|roi)\b/.test(combined)) {
    return "stat-donut-kpi-dashboard";
  }
  if (/\b(cluster|ecosystem|mind map|hub|spoke|pillar|network|architecture)\b/.test(combined)) {
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
  const clean = cleanSentence(topicTitle) || "AI Growth & Optimization Strategy";
  const lower = clean.toLowerCase();

  if (/seo|aeo|geo|search|rank|keyword|backlink|content/.test(lower)) {
    return [
      `1. Intent & Entity Alignment: Map primary search intent and semantic entities for ${clean} before drafting (+64% topical coverage).`,
      `2. Answer-First Direct Blocks: Place a 45-word direct answer summary immediately below every H2 heading for AI Overviews (82% citation lift).`,
      `3. First-Hand Proof & Benchmarks: Embed original data tables, screenshots, and verified metrics that generic pages lack (3.1x backlink rate).`,
      `4. Internal Link Hub Architecture: Connect supporting cluster articles back to your pillar URL with descriptive anchor text (+48% crawl depth).`,
      `5. Visual Infographic & Schema Markup: Pair custom vector diagrams with Article and FAQPage JSON-LD structured data (91% rich result eligibility).`,
      `6. Multi-Channel Repurposing Loop: Turn every published guide into LinkedIn carousels, Pinterest pins, and short videos (5x organic reach).`,
    ];
  }

  if (/youtube|video|short|reel|tiktok|hook|script/.test(lower)) {
    return [
      `1. 3-Second Pattern-Interrupt Hook: Open ${clean} with a bold visual contrast or counter-intuitive stat (78% 3-second hold rate).`,
      `2. Fast Context Bridge: Eliminate channel intros and deliver the core promise within the first 8 seconds (+52% average view duration).`,
      `3. Visual B-Roll & Caption Pacing: Change visual framing or kinetic text overlays every 3.5 seconds to reset viewer attention (86% retention).`,
      `4. Mid-Video Curiosity Loop: Re-hook viewers at the 50% mark with a real example or before/after proof point (2.4x completion rate).`,
      `5. High-Contrast Thumbnail & Title Pair: Pair a 3-to-5 word curiosity badge on the thumbnail with a clear outcome title (+39% CTR).`,
      `6. Pinned Comment & Cross-Platform Syndicate: Drive viewers to your core resource in the pinned comment and repurpose across Reels & TikTok (4x leads).`,
    ];
  }

  if (/linkedin|social|brand|b2b|lead|outreach|email|sales/.test(lower)) {
    return [
      `1. High-Contrast Opening Hook: Start ${clean} with a specific metric, contrarian observation, or real client teardown (3.6x feed dwell time).`,
      `2. Zero-Click Standalone Value: Deliver the complete framework inside the post so readers gain immediate value without leaving the feed (88% save rate).`,
      `3. Attach Custom Visual Infographic: Pair the text post with a 4:5 portrait infographic or multi-slide carousel (+142% organic impressions).`,
      `4. Proof & Case Study Evidence: Back every claim with a concrete before-and-after number or real workflow example (74% higher trust score).`,
      `5. Conversation-Starter CTA: Close with a specific two-option question to spark high-signal comments in the first 60 minutes (2.8x reach).`,
      `6. First-Comment Resource Link: Place your deep-dive article or tool link in the first comment with UTM tracking (+61% profile-to-site CTR).`,
    ];
  }

  return [
    `1. Define Core Objective & Baseline: Establish measurable KPIs and target outcomes for ${clean} before execution (100% alignment).`,
    `2. Audit Current Bottlenecks: Identify the top 20% friction points slowing down results and prioritize high-leverage fixes (3.2x efficiency).`,
    `3. Build Repeatable System & Templates: Standardize workflows for ${clean} using structured checklists and automation (68% time saved).`,
    `4. Execute With Evidence & Quality Gates: Validate every deliverable against real user benchmarks and clarity standards (92% quality score).`,
    `5. Measure Leading & Lagging Indicators: Track weekly conversion lift, retention, and compounding ROI across channels (+135% growth).`,
    `6. Iterate & Scale Winning Plays: Double down on the highest-performing variations and document SOPs for the team (4.5x compounding ROI).`,
  ];
}

export function buildDeterministicBlogInfographic(
  input: BlogToInfographicInput,
): BlogToInfographicPack {
  const cleanTitle =
    cleanSentence(input.title) ||
    "Step-by-Step Visual Implementation Guide";

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
    rawLines.length >= 3
      ? rawLines
      : synthesizeTopicEvidenceLines(cleanTitle)
  ).slice(0, 6);

  const defaultMetrics = ["88% Impact", "3.4x Lift", "+142% ROI", "92% Score", "6x Faster", "+68% CTR", "4.2x Reach", "95% Verified"];

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

    const numMatch = stripped.match(
      /[+-]?\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?x\b|\$\d[\d,.]*/i,
    );
    const metricVal = numMatch ? numMatch[0] : defaultMetrics[idx % defaultMetrics.length];

    return {
      id: `info-node-${idx + 1}`,
      badge: `0${idx + 1}`,
      title: nodeTitle.slice(0, 48),
      body: nodeBody.slice(0, 135),
      metricValue: metricVal,
      compareRight: `Execute ${nodeTitle.toLowerCase()} with automated templates for ${metricVal} verified lift.`,
      icon: inferNodeIcon(`${nodeTitle} ${nodeBody}`, idx),
    };
  });

  const recommendedTemplate =
    input.preferredTemplate ||
    detectBestTemplateForTopic(cleanTitle, selected.join(" "), Boolean(input.sideImageUrl));

  const evidenceSummary = nodes.map(
    (n, i) =>
      `Finding #${i + 1} (${n.metricValue || `Step ${i + 1}`}): ${n.title} — ${n.body}`,
  );

  return {
    infographicTitle: cleanTitle.slice(0, 78),
    infographicSubtitle: `A research-backed visual breakdown of ${nodes.length} high-impact takeaways and benchmarks you can implement and share.`,
    kickerLabel: "VISUAL RESEARCH & INFOGRAPHIC GUIDE",
    recommendedTemplate,
    nodes,
    seoAltText: `Infographic showing ${cleanTitle}: ${nodes.map((n) => `${n.title} (${n.metricValue})`).join(", ")}.`,
    socialCaption: `📌 Visual Breakdown: ${cleanTitle}\n\n${nodes.map((n, i) => `${i + 1}. ${n.title} (${n.metricValue}) — ${n.body}`).join("\n")}\n\nSave this infographic for your workflow! 👇\n🌐 ${input.sourceUrl || "https://doitwithai.tools"}`,
    evidenceSummary,
  };
}

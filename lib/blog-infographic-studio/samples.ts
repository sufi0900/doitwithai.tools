import { createPrismSample, withPrismLayout } from "./visual-brief";
import type { PrismLayout } from "./layout-registry";
import type { BlogInfographicConfig } from "@/lib/blog-writer/canonical-state";

export const PRISM_LAYOUT_THEMES: Record<
  PrismLayout,
  BlogInfographicConfig["paletteId"]
> = {
  editorial: "indigo-cyber",
  constellation: "violet-saas",
  ribbon: "emerald-growth",
  timeline: "blue-trust",
  comparison: "amber-executive",
  checklist: "rose-editorial",
  "pipeline-flow": "blue-trust",
  "split-equation": "indigo-cyber",
  "funnel-stages": "emerald-growth",
  "quadrant-matrix": "violet-saas",
  "stat-bars": "cyan-tech",
  "donut-breakdown": "violet-saas",
  "hierarchy-tree": "indigo-cyber",
  "pyramid-tiers": "amber-executive",
  "cycle-wheel": "emerald-growth",
  "before-after": "rose-editorial",
  "zigzag-flowchart": "blue-trust",
  "kpi-bento": "slate-minimal",
  "pie-chart": "indigo-cyber",
  "vertical-bars": "cyan-tech",
  "winding-roadmap": "emerald-growth",
};

/** Curated examples are only for the showcase and QA. Never mix them into extracted article data. */
export function createLayoutSample(layout: PrismLayout): BlogInfographicConfig {
  const sample = withPrismLayout(createPrismSample(), layout);
  sample.footerSourceLabel = "DoItWithAI.tools · Example, not measured results";
  sample.paletteId = PRISM_LAYOUT_THEMES[layout];
  sample.depth = {
    preset:
      layout === "ribbon"
        ? "layered"
        : layout === "constellation"
          ? "raised"
          : "soft",
    strength: 65,
  };
  if (
    [
      "constellation",
      "ribbon",
      "timeline",
      "checklist",
      "comparison",
      "pipeline-flow",
      "split-equation",
      "funnel-stages",
      "quadrant-matrix",
      "stat-bars",
      "donut-breakdown",
      "hierarchy-tree",
      "pyramid-tiers",
      "cycle-wheel",
      "before-after",
      "zigzag-flowchart",
      "kpi-bento",
      "pie-chart",
      "vertical-bars",
      "winding-roadmap",
    ].includes(layout)
  ) {
    const sets = {
      constellation: {
        headline: "Four pillars of AI search visibility",
        subheadline:
          "How direct answers, citations, structure and review work together.",
        items: [
          [
            "Answer the question",
            "Answer engine optimization makes useful answers easy to find and understand. Lead with a direct explanation, then add context.",
            "answer",
          ],
          [
            "Make claims supportable",
            "Generative engine optimization focuses on content that can inform AI-generated answers with original explanations and verifiable sources.",
            "evidence",
          ],
          [
            "Structure topic hubs",
            "Group closely related questions and connect supporting guides so search engines and readers understand the full subject.",
            "target",
          ],
          [
            "Review the workflow",
            "AI-assisted SEO supports research, drafting and analysis while human editors verify accuracy and usefulness before publishing.",
            "workflow",
          ],
        ],
      },
      ribbon: {
        headline: "Four layers of a modern SEO workflow",
        subheadline:
          "Combine structured research, clear answers, cited evidence and human review.",
        items: [
          [
            "Answer the question",
            "Answer engine optimization makes useful answers easy to find and understand. Lead with a direct explanation, then add context.",
            "answer",
          ],
          [
            "Make the answer supportable",
            "Generative engine optimization focuses on content that can inform AI-generated answers. Use original explanations and verifiable sources.",
            "evidence",
          ],
          [
            "Align search intent",
            "Match every section to the specific problem the reader is trying to solve rather than repeating broad keywords.",
            "search",
          ],
          [
            "Improve the workflow",
            "AI-assisted SEO supports research, drafting and analysis. Review its output for accuracy and usefulness before publishing.",
            "workflow",
          ],
        ],
      },
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
      "pipeline-flow": {
        headline: "AEO: Answer Engine Optimization",
        subheadline:
          "Optimizing content so AI systems extract and display direct answers.",
        items: [
          [
            "Traditional SEO",
            "Search query maps to a ranked list of blue links where the user clicks through to read a full article.",
            "search",
          ],
          [
            "Answer Engine",
            "AI engine synthesizes cited sources and delivers a direct answer before the click.",
            "sparkle",
          ],
          [
            "Your AEO Content",
            "Structured headings, concise 40-60 word answer blocks, and FAQ schema win the citation.",
            "check",
          ],
        ],
      },
      "split-equation": {
        headline: "What Exactly Is AI SEO?",
        subheadline:
          "Two complementary meanings that work together in modern search.",
        items: [
          [
            "Using AI to Do SEO",
            "Accelerating keyword research, topic clustering, content briefs, and technical audits with AI workflows.",
            "workflow",
          ],
          [
            "Optimizing for AI Search",
            "Structuring pages so ChatGPT, Perplexity, and Google AI Overviews cite and recommend your brand.",
            "target",
          ],
        ],
      },
      "funnel-stages": {
        headline: "AI Search Visibility Funnel",
        subheadline:
          "How technical crawlability converts into verified AI citations.",
        items: [
          [
            "Crawlable Entity Architecture",
            "Ensure AI crawlers can parse clean HTML, structured schema, and unambiguous entity definitions.",
            "search",
          ],
          [
            "Answer-First Formatting",
            "Lead every section with a self-contained answer block backed by verifiable data.",
            "answer",
          ],
          [
            "Cross-Web Authority Citations",
            "Earn consistent brand mentions across trusted publications and community discussions.",
            "evidence",
          ],
        ],
      },
      "quadrant-matrix": {
        headline: "Four Quadrants of Search Optimization",
        subheadline:
          "Aligning traditional rankings, direct answers, AI citations, and brand entities.",
        items: [
          [
            "SEO: Organic Rankings",
            "Build topical authority, technical health, and backlinks for traditional search results.",
            "search",
          ],
          [
            "AEO: Direct Answers",
            "Format concise question-and-answer blocks for featured snippets and voice assistants.",
            "answer",
          ],
          [
            "GEO: Generative Citations",
            "Publish original statistics and expert quotes that generative engines synthesize.",
            "sparkle",
          ],
          [
            "LLMO: Brand Entity Memory",
            "Reinforce consistent entity associations across authoritative third-party sources.",
            "target",
          ],
        ],
      },
      "stat-bars": {
        headline: "AI Search Signal Weight Breakdown",
        subheadline:
          "How technical crawlability, answer clarity, and citations drive visibility.",
        items: [
          [
            "Server-Rendered HTML",
            "Ensure crawlers can read primary content and tables without client-side rendering gaps.",
            "server",
          ],
          [
            "Answer-First Structure",
            "Place direct, verified definitions right below key headings for extraction.",
            "answer",
          ],
          [
            "Verified Source Evidence",
            "Back claims with named studies, primary data, and transparent attribution.",
            "evidence",
          ],
          [
            "Cross-Web Authority",
            "Build consistent brand mentions across trusted industry publications.",
            "backlink",
          ],
        ],
      },
      "donut-breakdown": {
        headline: "Core Pillars of Modern Content Mix",
        subheadline:
          "Balancing discovery guides, comparisons, original research, and technical upkeep.",
        items: [
          [
            "Answer Guides",
            "Solve specific reader questions with clear summaries and structured steps.",
            "book-open",
          ],
          [
            "Comparison Hubs",
            "Clarify trade-offs between methods, platforms, and workflows.",
            "scale",
          ],
          [
            "Original Data",
            "Publish repeatable audits, benchmarks, and verifiable examples.",
            "bar-chart-2",
          ],
          [
            "Technical Upkeep",
            "Keep pages fast, indexable, and linked cleanly across topic clusters.",
            "code",
          ],
        ],
      },
      "hierarchy-tree": {
        headline: "AI Search Architecture Tree",
        subheadline:
          "How one authoritative domain branches into crawlable, citable topic clusters.",
        items: [
          [
            "Technical Crawl Layer",
            "Clean HTML, XML sitemaps, and clear crawler policies for search bots.",
            "server",
          ],
          [
            "Topic Hub Pages",
            "Comprehensive pillar guides linking directly to focused subtopic answers.",
            "sitemap",
          ],
          [
            "Verified Evidence Layer",
            "Primary citations, author credentials, and transparent editorial checks.",
            "shield-check",
          ],
          [
            "Measurement Feedback",
            "Track impressions, citations, and referral traffic to guide updates.",
            "gauge",
          ],
        ],
      },
      "pyramid-tiers": {
        headline: "Hierarchy of AI Search Readiness",
        subheadline:
          "Build from a crawlable technical foundation up to market-leading authority.",
        items: [
          [
            "Apex: Cited Brand Authority",
            "Earn repeated citations in AI answers and trusted editorial roundups.",
            "crown",
          ],
          [
            "Tier 2: Verified Original Evidence",
            "Publish transparent examples, checklists, and clear source documentation.",
            "evidence",
          ],
          [
            "Tier 3: Answer-First Content",
            "Organize sections around real audience intent with concise summaries.",
            "answer",
          ],
          [
            "Base: Crawlable Technical SEO",
            "Ensure fast, indexable, server-rendered pages with healthy internal links.",
            "server",
          ],
        ],
      },
      "cycle-wheel": {
        headline: "Continuous AI SEO Growth Flywheel",
        subheadline:
          "Four recurring stages that compound search visibility month after month.",
        items: [
          [
            "Research Real Intent",
            "Pull real audience queries from Search Console and customer questions.",
            "search",
          ],
          [
            "Draft & Fact-Check",
            "Structure answer-first drafts and verify every claim against primary sources.",
            "clipboard-check",
          ],
          [
            "Publish & Distribute",
            "Ship clean HTML pages and repurpose visuals across social channels.",
            "rocket",
          ],
          [
            "Measure & Refresh",
            "Monitor impressions, citations, and referrals to update winning pages.",
            "repeat",
          ],
        ],
      },
      "before-after": {
        headline: "Legacy SEO vs. AI-Ready Content",
        subheadline:
          "How modern editorial workflows shift from keyword stuffing to verified answers.",
        items: [
          [
            "Buried Long Introductions",
            "Readers scroll past fluff paragraphs before finding a clear answer.",
            "alert-triangle",
          ],
          [
            "Direct Answer Blocks",
            "Key takeaways sit immediately below headings for readers and AI engines.",
            "check",
          ],
          [
            "Unchecked AI Drafts",
            "Generic claims without source verification erode trust and rankings.",
            "bug",
          ],
          [
            "Source-Checked Publishing",
            "Every claim maps back to real documentation and editorial review.",
            "shield-check",
          ],
        ],
      },
      "zigzag-flowchart": {
        headline: "Editorial Publishing Decision Flowchart",
        subheadline:
          "Step-by-step verification path before any AI-assisted page goes live.",
        items: [
          [
            "Validate Search Intent",
            "Confirm the query maps to a clear reader problem and existing crawlable page.",
            "search",
          ],
          [
            "Outline Evidence & Structure",
            "List primary sources, headings, and visual callouts before drafting.",
            "workflow-diamond",
          ],
          [
            "Audit Claims & Readability",
            "Remove unsupported figures, sharpen prose, and confirm clear formatting.",
            "clipboard-check",
          ],
          [
            "Ship & Monitor Citations",
            "Publish server-rendered HTML and review Search Console performance monthly.",
            "rocket",
          ],
        ],
      },
      "kpi-bento": {
        headline: "AI SEO Executive Scorecard",
        subheadline:
          "The core operational signals that separate resilient sites from flat traffic.",
        items: [
          [
            "Editorial Cadence & Quality",
            "Consistent publishing paired with strict claim checking compounds both traditional rankings and AI search citations over time.",
            "trending-up",
          ],
          [
            "Index & Crawl Health",
            "Confirm priority pages render cleanly in server HTML without bot blocks.",
            "server",
          ],
          [
            "AI Citation Impressions",
            "Track Search Console AI performance and Bing citation reports monthly.",
            "eye",
          ],
          [
            "Verified Referral Visits",
            "Measure engaged visitors arriving from ChatGPT, Perplexity, and search.",
            "users",
          ],
        ],
      },
      "pie-chart": {
        headline: "AI Search Visibility Mix by Channel",
        subheadline:
          "How organic discovery distributes across classic search, AI answers, and authority hubs.",
        items: [
          [
            "Core Organic Rankings",
            "Server-rendered evergreen guides that anchor crawlable domain authority.",
            "search",
          ],
          [
            "AI Overviews & Citations",
            "Direct answer blocks and verified tables cited inside generative responses.",
            "sparkle",
          ],
          [
            "Structured Entity Hubs",
            "Consistent brand definitions, schema graphs, and internal topic links.",
            "sitemap",
          ],
          [
            "Earned Editorial Mentions",
            "Original benchmarks and visual studies referenced by third-party publishers.",
            "globe",
          ],
        ],
      },
      "vertical-bars": {
        headline: "Priority Impact Pillars for AI Search",
        subheadline:
          "Comparing the four levers that compound long-term citations and organic clicks.",
        items: [
          [
            "Direct Answer Clarity",
            "Lead each section with a crisp, self-contained explanation readers can quote.",
            "answer",
          ],
          [
            "Primary Source Evidence",
            "Back claims with original studies, documentation, and real test data.",
            "evidence",
          ],
          [
            "Technical Crawlability",
            "Keep HTML fast, indexable, and open to chosen search crawlers.",
            "server",
          ],
          [
            "Freshness & Audits",
            "Refresh top guides quarterly as AI engine guidance evolves.",
            "repeat",
          ],
        ],
      },
      "winding-roadmap": {
        headline: "90-Day AI SEO Execution Roadmap",
        subheadline:
          "Four sequential milestones from technical audit to compounding AI citations.",
        items: [
          [
            "Audit Crawl & Indexing",
            "Confirm priority URLs render in server HTML and allow search bots cleanly.",
            "search",
          ],
          [
            "Restructure Core Guides",
            "Add clear definitions, comparison tables, and verified takeaways above the fold.",
            "layers",
          ],
          [
            "Publish Visual Proof",
            "Embed crisp diagrams and data charts that editors and readers share.",
            "bar-chart-2",
          ],
          [
            "Measure & Compound",
            "Track Search Console AI impressions and refresh high-intent pages monthly.",
            "rocket",
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
    if (layout === "before-after")
      sample.comparisonLabels = ["Before · Legacy Approach", "After · AI-Ready Workflow"];
  }
  sample.altText = `${sample.headline}: ${sample.nodes.map((n) => n.title).join("; ")}`;
  return sample;
}

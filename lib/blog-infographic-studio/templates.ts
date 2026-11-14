/** Public presentation metadata only. Keep internal founder strategy out of the visual runtime. */
export interface BlogInfographicTemplateSpec {
  id: number;
  slug: string;
  name: string;
  family:
    | "Process & Step Flows"
    | "Comparison & Versus"
    | "Data, KPI & Stat Callouts"
    | "Frameworks & Pyramids"
    | "Checklists & Cheat Sheets"
    | "Hero & Blog Covers";
  bestForSectionType: string;
  editableFields: string;
}

export const BLOG_INFOGRAPHIC_25_TEMPLATES: BlogInfographicTemplateSpec[] = [
  {
    id: 1,
    slug: "horizontal-step-pipeline",
    name: "Connected Process Steps",
    family: "Process & Step Flows",
    bestForSectionType: "How-To Steps & Workflows",
    editableFields:
      "Title, Subtitle, 4–6 Step Badges, Step Titles, Step Descriptions, Accent Color",
  },
  {
    id: 2,
    slug: "vertical-numbered-roadmap",
    name: "Vertical Milestone Roadmap",
    family: "Process & Step Flows",
    bestForSectionType: "Implementation Phases & Timelines",
    editableFields:
      "Header, Phase Tags, Milestone Titles, Deliverables List, Footer Note",
  },
  {
    id: 3,
    slug: "circular-growth-flywheel",
    name: "Circular Process Flywheel",
    family: "Process & Step Flows",
    bestForSectionType: "Compound Loops & Flywheels",
    editableFields: "Headline, Numbered Orbit Points, Explanations, Palette",
  },
  {
    id: 4,
    slug: "zigzag-journey-path",
    name: "Zig-Zag Customer / Reader Journey",
    family: "Process & Step Flows",
    bestForSectionType: "Onboarding & Transformation Guides",
    editableFields: "5 Touchpoints, Metrics Badges, Action Labels",
  },
  {
    id: 5,
    slug: "conversion-funnel-breakdown",
    name: "Conversion Funnel",
    family: "Process & Step Flows",
    bestForSectionType: "TOFU / MOFU / BOFU Strategy Sections",
    editableFields: "4 Funnel Stages, Conversion %, Key Tactics per Tier",
  },
  {
    id: 6,
    slug: "two-column-versus-card",
    name: "Side-by-Side Comparison",
    family: "Comparison & Versus",
    bestForSectionType: "Tool A vs. Tool B Comparisons",
    editableFields:
      "Alternating Left/Right Points, Titles, Explanations, Optional Values",
  },
  {
    id: 7,
    slug: "three-tier-feature-matrix",
    name: "Three-Column Comparison Board",
    family: "Comparison & Versus",
    bestForSectionType: "Software & Pricing Comparisons",
    editableFields:
      "Up to 8 Comparison Points, Titles, Explanations, Optional Values",
  },
  {
    id: 8,
    slug: "before-after-transformation",
    name: "Before vs. After Impact Split Card",
    family: "Comparison & Versus",
    bestForSectionType: "Case Studies & Optimization Results",
    editableFields:
      "Old Way Pain Points (Red), New Way Wins (Emerald), Delta KPI Badge",
  },
  {
    id: 9,
    slug: "pros-and-cons-dual-grid",
    name: "Pros & Cons Executive Grid",
    family: "Comparison & Versus",
    bestForSectionType: "Product Reviews & Trade-Off Analysis",
    editableFields: "Product Title, 5 Pros, 5 Cons, Bottom-Line Rating Score",
  },
  {
    id: 10,
    slug: "dos-and-donts-board",
    name: "Best Practices: Do's vs. Don'ts Board",
    family: "Comparison & Versus",
    bestForSectionType: "Mistakes to Avoid & Guidelines",
    editableFields:
      "4 Green Do's with Icons, 4 Red Don'ts with Icons, Pro Tip Banner",
  },
  {
    id: 11,
    slug: "bento-four-kpi-grid",
    name: "4-Card Bento KPI & Metric Callout",
    family: "Data, KPI & Stat Callouts",
    bestForSectionType: "Key Statistics & Benchmark Sections",
    editableFields:
      "4 Big Metric Numbers, Trend Arrows (+%), Context Captions, Source Citation",
  },
  {
    id: 12,
    slug: "hero-stat-three-takeaways",
    name: "Spotlight Stat + 3 Key Insights",
    family: "Data, KPI & Stat Callouts",
    bestForSectionType: "Industry Research & Survey Findings",
    editableFields:
      "Primary Giant Percentage/Number, 3 Supporting Bullet Cards, Source URL",
  },
  {
    id: 13,
    slug: "horizontal-benchmark-bars",
    name: "Horizontal Performance Bar Chart",
    family: "Data, KPI & Stat Callouts",
    bestForSectionType: "Speed, ROI & Score Comparisons",
    editableFields:
      "Chart Title, 5 Labeled Bars, Numeric Values, Unit Suffix, Highlight Bar",
  },
  {
    id: 14,
    slug: "cost-roi-savings-breakdown",
    name: "Cost & Resource Ledger",
    family: "Data, KPI & Stat Callouts",
    bestForSectionType: "Budgeting & Financial Breakdowns",
    editableFields:
      "User-Provided Cost/Resource Values, Labels, Explanations, Source",
  },
  {
    id: 15,
    slug: "five-metric-scorecard",
    name: "Metric Ring Scorecard",
    family: "Data, KPI & Stat Callouts",
    bestForSectionType: "SEO, Performance & Quality Audits",
    editableFields:
      "User-Provided Values, Percentage Rings Only for 0–100% Values, Source",
  },
  {
    id: 16,
    slug: "two-by-two-priority-quadrant",
    name: "2x2 Impact vs. Effort Quadrant",
    family: "Frameworks & Pyramids",
    bestForSectionType: "Prioritization & Strategy Frameworks",
    editableFields:
      "Headline, Four Priority Areas or Paired Points, Details, Optional Values",
  },
  {
    id: 17,
    slug: "three-tier-authority-pyramid",
    name: "Strategy Hierarchy",
    family: "Frameworks & Pyramids",
    bestForSectionType: "Foundational vs. Advanced Concepts",
    editableFields:
      "Foundation Layer, Execution Layer, Apex Layer, Side Annotations",
  },
  {
    id: 18,
    slug: "three-circle-venn-synergy",
    name: "Three-Pillar Synergy",
    family: "Frameworks & Pyramids",
    bestForSectionType: "Core Intersection Concepts (e.g. SEO + UX + AI)",
    editableFields:
      "Three-Circle Motif, Editable Pillar Titles and Explanations",
  },
  {
    id: 19,
    slug: "hub-and-spoke-architecture",
    name: "Hub-and-Spoke Topic Cluster Map",
    family: "Frameworks & Pyramids",
    bestForSectionType: "System Architecture & Internal Linking Maps",
    editableFields:
      "Center Pillar Node, 6 Connected Spoke Nodes, Connection Labels",
  },
  {
    id: 20,
    slug: "actionable-audit-checklist",
    name: "8-Point Actionable Launch Checklist",
    family: "Checklists & Cheat Sheets",
    bestForSectionType: "Pre-Publish & Implementation Checklists",
    editableFields:
      "Checklist Title, 8 Checkboxes with Labels & Priority Tags, Completion Badge",
  },
  {
    id: 21,
    slug: "five-point-tldr-summary",
    name: "Executive 5-Point TL;DR Takeaway Card",
    family: "Checklists & Cheat Sheets",
    bestForSectionType: "Top-of-Article Key Takeaways & Summaries",
    editableFields: "Header Badge, 5 Numbered Key Takeaways, Reading Time Pill",
  },
  {
    id: 22,
    slug: "anatomy-annotated-breakdown",
    name: "Anatomy of a High-Converting Page",
    family: "Checklists & Cheat Sheets",
    bestForSectionType: "Structural & Template Teardowns",
    editableFields:
      "Central Wireframe Box, 6 Numbered Callout Pointers & Explanations",
  },
  {
    id: 23,
    slug: "myth-vs-reality-buster",
    name: "Assumptions vs. Evidence",
    family: "Checklists & Cheat Sheets",
    bestForSectionType: "Debunking Misconceptions & FAQ Sections",
    editableFields:
      "Editable Assumption/Evidence Column Labels, Alternating Points, Source Credit",
  },
  {
    id: 24,
    slug: "quick-reference-cheat-sheet",
    name: "6-Box Quick Reference Cheat Sheet",
    family: "Checklists & Cheat Sheets",
    bestForSectionType: "Formulas, Prompts & Command Reference",
    editableFields:
      "6 Categorized Mini-Cards with Copyable Formula/Rule Snippets",
  },
  {
    id: 25,
    slug: "widescreen-blog-hero-og-banner",
    name: "Editorial Blog Cover",
    family: "Hero & Blog Covers",
    bestForSectionType: "Article Featured Image & Social Share Card",
    editableFields:
      "Headline, Subtitle, Optional Editorial Illustration, Points, Brand Logo",
  },
];

/**
 * Commercial-Safe Editable Vector Scene Library (MIT unDraw / CC0 OpenPeeps Style)
 * File: lib/visual-stock/vector-scenes.ts
 *
 * Provides 16 multi-layered, recolorable vector scene illustrations that adapt
 * dynamically to any client's brand palette (`primary`, `secondary`, `surface`,
 * `ink`, `muted`) with zero network dependency, zero copyright risk, and zero
 * `<script>` or `<foreignObject>` tags.
 */

export type VectorSceneCategory =
  | "ai-seo"
  | "analytics-data"
  | "workflow-automation"
  | "comparison-strategy"
  | "ecommerce-growth"
  | "lifestyle-care"
  | "editorial-knowledge"
  | "audit-security";

export interface VectorScenePalette {
  primary: string;
  secondary: string;
  surface: string;
  ink: string;
  muted: string;
}

export interface VectorSceneIllustration {
  id: string;
  title: string;
  category: VectorSceneCategory;
  keywords: string[];
  license: "MIT-unDraw-Style" | "CC0-OpenPeeps-Style";
  attributionRequired: false;
  /**
   * Renders pure SVG group nodes inside a 240x160 coordinate space.
   * Safe for direct embedding inside `<svg>` or `<g transform="...">`.
   */
  renderSvgNodes: (palette: VectorScenePalette) => string;
}

function sanitizeHexOrColor(value: string, fallback: string): string {
  const cleaned = String(value || "").trim();
  return /^#[0-9a-fA-F]{3,8}$|^rgba?\([0-9,\s.%+-]+\)$/.test(cleaned)
    ? cleaned
    : fallback;
}

function normalizePalette(palette: Partial<VectorScenePalette>): VectorScenePalette {
  return {
    primary: sanitizeHexOrColor(palette.primary || "", "#6366f1"),
    secondary: sanitizeHexOrColor(palette.secondary || "", "#06b6d4"),
    surface: sanitizeHexOrColor(palette.surface || "", "#1e293b"),
    ink: sanitizeHexOrColor(palette.ink || "", "#f8fafc"),
    muted: sanitizeHexOrColor(palette.muted || "", "#94a3b8"),
  };
}

export const VECTOR_SCENE_CATALOG: VectorSceneIllustration[] = [
  {
    id: "ai-search-intelligence",
    title: "AI Search & Answer Engine Discovery",
    category: "ai-seo",
    keywords: [
      "ai",
      "seo",
      "search",
      "aeo",
      "geo",
      "answer engine",
      "citation",
      "generative",
      "serp",
      "query",
      "ranking",
      "discovery",
    ],
    license: "MIT-unDraw-Style",
    attributionRequired: false,
    renderSvgNodes: (raw) => {
      const p = normalizePalette(raw);
      return `<g data-scene="ai-search-intelligence">
        <rect x="14" y="18" width="148" height="106" rx="14" fill="${p.surface}" stroke="${p.primary}" stroke-width="2" opacity="0.92"/>
        <circle cx="32" cy="34" r="4" fill="${p.primary}"/>
        <circle cx="46" cy="34" r="4" fill="${p.secondary}"/>
        <rect x="60" y="30" width="84" height="8" rx="4" fill="${p.muted}" opacity="0.35"/>
        <rect x="28" y="50" width="92" height="12" rx="6" fill="${p.primary}" opacity="0.25"/>
        <rect x="28" y="70" width="116" height="8" rx="4" fill="${p.ink}" opacity="0.5"/>
        <rect x="28" y="84" width="98" height="8" rx="4" fill="${p.muted}" opacity="0.4"/>
        <rect x="28" y="98" width="76" height="8" rx="4" fill="${p.secondary}" opacity="0.45"/>
        <circle cx="172" cy="82" r="36" fill="${p.surface}" stroke="${p.secondary}" stroke-width="4"/>
        <circle cx="172" cy="82" r="24" fill="${p.primary}" opacity="0.18"/>
        <path d="M172 64 L177 76 L190 81 L177 86 L172 98 L167 86 L154 81 L167 76 Z" fill="${p.secondary}"/>
        <line x1="198" y1="108" x2="222" y2="132" stroke="${p.primary}" stroke-width="7" stroke-linecap="round"/>
      </g>`;
    },
  },
  {
    id: "editorial-workflow-pipeline",
    title: "Editorial Brief & Content Workflow",
    category: "workflow-automation",
    keywords: [
      "workflow",
      "process",
      "steps",
      "pipeline",
      "brief",
      "content",
      "draft",
      "publish",
      "automation",
      "roadmap",
      "sequence",
    ],
    license: "MIT-unDraw-Style",
    attributionRequired: false,
    renderSvgNodes: (raw) => {
      const p = normalizePalette(raw);
      return `<g data-scene="editorial-workflow-pipeline">
        <rect x="12" y="34" width="60" height="86" rx="12" fill="${p.surface}" stroke="${p.primary}" stroke-width="2"/>
        <rect x="22" y="48" width="40" height="8" rx="4" fill="${p.primary}"/>
        <rect x="22" y="64" width="34" height="6" rx="3" fill="${p.ink}" opacity="0.55"/>
        <rect x="22" y="76" width="28" height="6" rx="3" fill="${p.muted}" opacity="0.45"/>
        <circle cx="42" cy="100" r="8" fill="${p.secondary}" opacity="0.3"/>
        <path d="M74 76 L92 76" stroke="${p.secondary}" stroke-width="3" stroke-dasharray="4 3"/>
        <rect x="92" y="22" width="64" height="108" rx="12" fill="${p.surface}" stroke="${p.secondary}" stroke-width="2.5"/>
        <circle cx="124" cy="48" r="14" fill="${p.primary}" opacity="0.22"/>
        <path d="M118 48 L123 53 L132 43" fill="none" stroke="${p.secondary}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="104" y="72" width="40" height="8" rx="4" fill="${p.ink}" opacity="0.7"/>
        <rect x="104" y="86" width="32" height="6" rx="3" fill="${p.muted}" opacity="0.45"/>
        <rect x="104" y="98" width="36" height="6" rx="3" fill="${p.primary}" opacity="0.45"/>
        <path d="M158 76 L176 76" stroke="${p.primary}" stroke-width="3" stroke-dasharray="4 3"/>
        <rect x="176" y="38" width="52" height="80" rx="12" fill="${p.surface}" stroke="${p.primary}" stroke-width="2"/>
        <path d="M192 78 L202 64 L212 78 Z" fill="${p.secondary}"/>
        <rect x="188" y="88" width="28" height="7" rx="3.5" fill="${p.primary}" opacity="0.6"/>
      </g>`;
    },
  },
  {
    id: "side-by-side-comparison-scale",
    title: "Strategic Comparison & Tradeoff Matrix",
    category: "comparison-strategy",
    keywords: [
      "comparison",
      "vs",
      "versus",
      "difference",
      "compare",
      "tradeoff",
      "option",
      "choice",
      "traditional",
      "modern",
      "before",
      "after",
    ],
    license: "MIT-unDraw-Style",
    attributionRequired: false,
    renderSvgNodes: (raw) => {
      const p = normalizePalette(raw);
      return `<g data-scene="side-by-side-comparison-scale">
        <rect x="14" y="26" width="92" height="108" rx="14" fill="${p.surface}" stroke="${p.primary}" stroke-width="2.5"/>
        <rect x="28" y="42" width="46" height="10" rx="5" fill="${p.primary}"/>
        <rect x="28" y="62" width="64" height="7" rx="3.5" fill="${p.ink}" opacity="0.6"/>
        <rect x="28" y="76" width="54" height="7" rx="3.5" fill="${p.muted}" opacity="0.45"/>
        <circle cx="36" cy="104" r="9" fill="${p.primary}" opacity="0.25"/>
        <path d="M32 104 L35 107 L41 100" fill="none" stroke="${p.primary}" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="120" cy="80" r="16" fill="${p.secondary}"/>
        <path d="M114 80 L126 80 M120 74 L120 86" stroke="${p.surface}" stroke-width="2.6" stroke-linecap="round"/>
        <rect x="134" y="26" width="92" height="108" rx="14" fill="${p.surface}" stroke="${p.secondary}" stroke-width="2.5"/>
        <rect x="148" y="42" width="46" height="10" rx="5" fill="${p.secondary}"/>
        <rect x="148" y="62" width="64" height="7" rx="3.5" fill="${p.ink}" opacity="0.6"/>
        <rect x="148" y="76" width="54" height="7" rx="3.5" fill="${p.muted}" opacity="0.45"/>
        <circle cx="156" cy="104" r="9" fill="${p.secondary}" opacity="0.25"/>
        <path d="M152 104 L155 107 L161 100" fill="none" stroke="${p.secondary}" stroke-width="2.4" stroke-linecap="round"/>
      </g>`;
    },
  },
  {
    id: "analytics-benchmark-telemetry",
    title: "Analytics Telemetry & KPI Benchmarks",
    category: "analytics-data",
    keywords: [
      "analytics",
      "data",
      "metrics",
      "kpi",
      "benchmark",
      "chart",
      "performance",
      "roi",
      "conversion",
      "statistics",
      "growth",
      "traffic",
    ],
    license: "MIT-unDraw-Style",
    attributionRequired: false,
    renderSvgNodes: (raw) => {
      const p = normalizePalette(raw);
      return `<g data-scene="analytics-benchmark-telemetry">
        <rect x="16" y="20" width="208" height="120" rx="16" fill="${p.surface}" stroke="${p.primary}" stroke-width="2"/>
        <line x1="36" y1="116" x2="204" y2="116" stroke="${p.muted}" stroke-width="2" opacity="0.4"/>
        <rect x="46" y="82" width="22" height="34" rx="5" fill="${p.muted}" opacity="0.45"/>
        <rect x="82" y="64" width="22" height="52" rx="5" fill="${p.primary}" opacity="0.65"/>
        <rect x="118" y="48" width="22" height="68" rx="5" fill="${p.primary}"/>
        <rect x="154" y="34" width="22" height="82" rx="5" fill="${p.secondary}"/>
        <path d="M52 74 L92 56 L128 42 L166 28" fill="none" stroke="${p.ink}" stroke-width="3" stroke-linecap="round"/>
        <circle cx="52" cy="74" r="4.5" fill="${p.primary}"/>
        <circle cx="92" cy="56" r="4.5" fill="${p.primary}"/>
        <circle cx="128" cy="42" r="4.5" fill="${p.secondary}"/>
        <circle cx="166" cy="28" r="5.5" fill="${p.secondary}"/>
      </g>`;
    },
  },
  {
    id: "verification-trust-shield",
    title: "Fact Verification & E-E-A-T Governance",
    category: "audit-security",
    keywords: [
      "audit",
      "verify",
      "verification",
      "trust",
      "eeat",
      "quality",
      "security",
      "compliance",
      "accuracy",
      "fact",
      "checklist",
      "review",
    ],
    license: "MIT-unDraw-Style",
    attributionRequired: false,
    renderSvgNodes: (raw) => {
      const p = normalizePalette(raw);
      return `<g data-scene="verification-trust-shield">
        <rect x="18" y="24" width="126" height="112" rx="14" fill="${p.surface}" stroke="${p.muted}" stroke-width="1.8" opacity="0.88"/>
        <rect x="34" y="44" width="68" height="8" rx="4" fill="${p.primary}"/>
        <rect x="34" y="62" width="90" height="7" rx="3.5" fill="${p.ink}" opacity="0.55"/>
        <rect x="34" y="78" width="82" height="7" rx="3.5" fill="${p.muted}" opacity="0.45"/>
        <rect x="34" y="94" width="60" height="7" rx="3.5" fill="${p.secondary}" opacity="0.55"/>
        <path d="M178 28 L218 44 L218 82 C218 108 198 126 178 136 C158 126 138 108 138 82 L138 44 Z" fill="${p.surface}" stroke="${p.secondary}" stroke-width="3"/>
        <path d="M178 40 L206 52 L206 80 C206 99 192 113 178 121 C164 113 150 99 150 80 L150 52 Z" fill="${p.primary}" opacity="0.22"/>
        <path d="M164 80 L174 90 L194 68" fill="none" stroke="${p.secondary}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
      </g>`;
    },
  },
  {
    id: "knowledge-hub-architecture",
    title: "Topic Cluster & Semantic Knowledge Graph",
    category: "ai-seo",
    keywords: [
      "cluster",
      "hub",
      "spoke",
      "entity",
      "semantic",
      "schema",
      "internal link",
      "architecture",
      "pillar",
      "taxonomy",
      "graph",
    ],
    license: "MIT-unDraw-Style",
    attributionRequired: false,
    renderSvgNodes: (raw) => {
      const p = normalizePalette(raw);
      return `<g data-scene="knowledge-hub-architecture">
        <line x1="120" y1="80" x2="52" y2="38" stroke="${p.primary}" stroke-width="2.5" opacity="0.7"/>
        <line x1="120" y1="80" x2="190" y2="38" stroke="${p.secondary}" stroke-width="2.5" opacity="0.7"/>
        <line x1="120" y1="80" x2="48" y2="124" stroke="${p.secondary}" stroke-width="2.5" opacity="0.7"/>
        <line x1="120" y1="80" x2="192" y2="124" stroke="${p.primary}" stroke-width="2.5" opacity="0.7"/>
        <circle cx="52" cy="38" r="18" fill="${p.surface}" stroke="${p.primary}" stroke-width="2.5"/>
        <circle cx="190" cy="38" r="18" fill="${p.surface}" stroke="${p.secondary}" stroke-width="2.5"/>
        <circle cx="48" cy="124" r="18" fill="${p.surface}" stroke="${p.secondary}" stroke-width="2.5"/>
        <circle cx="192" cy="124" r="18" fill="${p.surface}" stroke="${p.primary}" stroke-width="2.5"/>
        <circle cx="120" cy="80" r="28" fill="${p.surface}" stroke="${p.primary}" stroke-width="3.5"/>
        <circle cx="120" cy="80" r="14" fill="${p.secondary}" opacity="0.85"/>
      </g>`;
    },
  },
  {
    id: "autonomous-agent-orchestrator",
    title: "Multi-Agent Automation & Digital Workforce",
    category: "workflow-automation",
    keywords: [
      "agent",
      "autonomous",
      "bot",
      "employee",
      "agency",
      "orchestrator",
      "cron",
      "24/7",
      "copilot",
      "assistant",
    ],
    license: "MIT-unDraw-Style",
    attributionRequired: false,
    renderSvgNodes: (raw) => {
      const p = normalizePalette(raw);
      return `<g data-scene="autonomous-agent-orchestrator">
        <rect x="68" y="24" width="104" height="92" rx="22" fill="${p.surface}" stroke="${p.primary}" stroke-width="3"/>
        <line x1="120" y1="10" x2="120" y2="24" stroke="${p.secondary}" stroke-width="3"/>
        <circle cx="120" cy="10" r="5" fill="${p.secondary}"/>
        <circle cx="98" cy="60" r="10" fill="${p.primary}"/>
        <circle cx="142" cy="60" r="10" fill="${p.secondary}"/>
        <rect x="94" y="86" width="52" height="10" rx="5" fill="${p.ink}" opacity="0.7"/>
        <rect x="18" y="52" width="36" height="44" rx="10" fill="${p.surface}" stroke="${p.secondary}" stroke-width="2"/>
        <rect x="186" y="52" width="36" height="44" rx="10" fill="${p.surface}" stroke="${p.primary}" stroke-width="2"/>
        <line x1="54" y1="74" x2="68" y2="74" stroke="${p.secondary}" stroke-width="2.5"/>
        <line x1="172" y1="74" x2="186" y2="74" stroke="${p.primary}" stroke-width="2.5"/>
      </g>`;
    },
  },
  {
    id: "conversion-funnel-velocity",
    title: "Conversion Funnel & Lead Velocity",
    category: "ecommerce-growth",
    keywords: [
      "funnel",
      "conversion",
      "lead",
      "sales",
      "pipeline",
      "revenue",
      "customer",
      "retention",
      "acquisition",
      "pricing",
      "checkout",
    ],
    license: "MIT-unDraw-Style",
    attributionRequired: false,
    renderSvgNodes: (raw) => {
      const p = normalizePalette(raw);
      return `<g data-scene="conversion-funnel-velocity">
        <polygon points="28,24 212,24 184,58 56,58" fill="${p.primary}" opacity="0.85"/>
        <polygon points="60,64 180,64 156,98 84,98" fill="${p.secondary}" opacity="0.85"/>
        <polygon points="88,104 152,104 138,138 102,138" fill="${p.surface}" stroke="${p.primary}" stroke-width="2.5"/>
        <circle cx="120" cy="121" r="7" fill="${p.secondary}"/>
      </g>`;
    },
  },
  {
    id: "editorial-publishing-studio",
    title: "Editorial Publishing & Structured Guide",
    category: "editorial-knowledge",
    keywords: [
      "article",
      "blog",
      "guide",
      "editorial",
      "writing",
      "copywriting",
      "story",
      "newsletter",
      "book",
      "documentation",
      "summary",
    ],
    license: "MIT-unDraw-Style",
    attributionRequired: false,
    renderSvgNodes: (raw) => {
      const p = normalizePalette(raw);
      return `<g data-scene="editorial-publishing-studio">
        <rect x="26" y="18" width="136" height="124" rx="14" fill="${p.surface}" stroke="${p.primary}" stroke-width="2.5"/>
        <rect x="44" y="36" width="58" height="10" rx="5" fill="${p.secondary}"/>
        <rect x="44" y="56" width="100" height="8" rx="4" fill="${p.ink}" opacity="0.75"/>
        <rect x="44" y="72" width="88" height="8" rx="4" fill="${p.muted}" opacity="0.5"/>
        <rect x="44" y="88" width="94" height="8" rx="4" fill="${p.muted}" opacity="0.4"/>
        <rect x="44" y="106" width="64" height="16" rx="8" fill="${p.primary}" opacity="0.3"/>
        <path d="M150 112 L198 64 L212 78 L164 126 L146 130 Z" fill="${p.secondary}"/>
      </g>`;
    },
  },
  {
    id: "social-carousel-distribution",
    title: "Omnichannel Social Pin & Carousel Engine",
    category: "ecommerce-growth",
    keywords: [
      "social",
      "pinterest",
      "linkedin",
      "carousel",
      "pin",
      "instagram",
      "distribution",
      "viral",
      "hook",
      "engagement",
      "share",
    ],
    license: "MIT-unDraw-Style",
    attributionRequired: false,
    renderSvgNodes: (raw) => {
      const p = normalizePalette(raw);
      return `<g data-scene="social-carousel-distribution">
        <rect x="22" y="28" width="64" height="98" rx="12" fill="${p.surface}" stroke="${p.muted}" stroke-width="2" opacity="0.75"/>
        <rect x="154" y="28" width="64" height="98" rx="12" fill="${p.surface}" stroke="${p.muted}" stroke-width="2" opacity="0.75"/>
        <rect x="76" y="16" width="88" height="124" rx="14" fill="${p.surface}" stroke="${p.primary}" stroke-width="3"/>
        <rect x="92" y="34" width="56" height="44" rx="8" fill="${p.primary}" opacity="0.25"/>
        <circle cx="120" cy="56" r="12" fill="${p.secondary}"/>
        <rect x="92" y="90" width="56" height="8" rx="4" fill="${p.ink}" opacity="0.75"/>
        <rect x="98" y="104" width="44" height="7" rx="3.5" fill="${p.muted}" opacity="0.5"/>
      </g>`;
    },
  },
  {
    id: "lifestyle-home-companion",
    title: "Lifestyle, Wellness & Everyday Care",
    category: "lifestyle-care",
    keywords: [
      "lifestyle",
      "pet",
      "cat",
      "dog",
      "home",
      "wellness",
      "health",
      "care",
      "nutrition",
      "habit",
      "daily",
      "family",
      "comfort",
    ],
    license: "CC0-OpenPeeps-Style",
    attributionRequired: false,
    renderSvgNodes: (raw) => {
      const p = normalizePalette(raw);
      return `<g data-scene="lifestyle-home-companion">
        <circle cx="120" cy="82" r="56" fill="${p.primary}" opacity="0.14"/>
        <path d="M58 84 L120 32 L182 84 L168 84 L168 132 L72 132 L72 84 Z" fill="${p.surface}" stroke="${p.primary}" stroke-width="2.8" stroke-linejoin="round"/>
        <path d="M120 74 C112 62 94 66 94 82 C94 98 120 112 120 118 C120 112 146 98 146 82 C146 66 128 62 120 74 Z" fill="${p.secondary}"/>
      </g>`;
    },
  },
  {
    id: "technical-code-schema",
    title: "Technical Schema, API & Speed Optimization",
    category: "ai-seo",
    keywords: [
      "technical",
      "code",
      "json-ld",
      "schema",
      "cwv",
      "speed",
      "api",
      "crawl",
      "index",
      "html",
      "developer",
      "server",
    ],
    license: "MIT-unDraw-Style",
    attributionRequired: false,
    renderSvgNodes: (raw) => {
      const p = normalizePalette(raw);
      return `<g data-scene="technical-code-schema">
        <rect x="18" y="20" width="204" height="120" rx="14" fill="${p.surface}" stroke="${p.primary}" stroke-width="2.5"/>
        <circle cx="38" cy="38" r="5" fill="${p.secondary}"/>
        <circle cx="54" cy="38" r="5" fill="${p.primary}"/>
        <path d="M78 68 L56 86 L78 104" fill="none" stroke="${p.secondary}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M162 68 L184 86 L162 104" fill="none" stroke="${p.secondary}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="130" y1="62" x2="110" y2="110" stroke="${p.primary}" stroke-width="4" stroke-linecap="round"/>
      </g>`;
    },
  },
  {
    id: "quadrant-priority-matrix",
    title: "2x2 Priority & Impact Matrix",
    category: "comparison-strategy",
    keywords: [
      "quadrant",
      "matrix",
      "priority",
      "impact",
      "effort",
      "framework",
      "positioning",
      "segment",
      "grid",
    ],
    license: "MIT-unDraw-Style",
    attributionRequired: false,
    renderSvgNodes: (raw) => {
      const p = normalizePalette(raw);
      return `<g data-scene="quadrant-priority-matrix">
        <rect x="28" y="18" width="84" height="56" rx="10" fill="${p.surface}" stroke="${p.primary}" stroke-width="2"/>
        <rect x="124" y="18" width="84" height="56" rx="10" fill="${p.primary}" opacity="0.28" stroke="${p.secondary}" stroke-width="2.5"/>
        <rect x="28" y="84" width="84" height="56" rx="10" fill="${p.surface}" stroke="${p.muted}" stroke-width="2"/>
        <rect x="124" y="84" width="84" height="56" rx="10" fill="${p.surface}" stroke="${p.primary}" stroke-width="2"/>
        <circle cx="166" cy="46" r="12" fill="${p.secondary}"/>
        <circle cx="70" cy="46" r="8" fill="${p.primary}"/>
        <circle cx="166" cy="112" r="8" fill="${p.primary}"/>
      </g>`;
    },
  },
  {
    id: "executive-roadmap-milestone",
    title: "Timeline Milestones & Quarterly Roadmap",
    category: "workflow-automation",
    keywords: [
      "timeline",
      "milestone",
      "history",
      "phase",
      "quarter",
      "schedule",
      "launch",
      "evolution",
      "future",
      "year",
    ],
    license: "MIT-unDraw-Style",
    attributionRequired: false,
    renderSvgNodes: (raw) => {
      const p = normalizePalette(raw);
      return `<g data-scene="executive-roadmap-milestone">
        <line x1="24" y1="82" x2="216" y2="82" stroke="${p.primary}" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="52" cy="82" r="11" fill="${p.surface}" stroke="${p.primary}" stroke-width="3"/>
        <circle cx="120" cy="82" r="13" fill="${p.secondary}"/>
        <circle cx="188" cy="82" r="11" fill="${p.surface}" stroke="${p.secondary}" stroke-width="3"/>
        <rect x="28" y="34" width="48" height="30" rx="8" fill="${p.surface}" stroke="${p.primary}" stroke-width="1.8"/>
        <rect x="96" y="104" width="48" height="30" rx="8" fill="${p.surface}" stroke="${p.secondary}" stroke-width="1.8"/>
        <rect x="164" y="34" width="48" height="30" rx="8" fill="${p.surface}" stroke="${p.primary}" stroke-width="1.8"/>
      </g>`;
    },
  },
  {
    id: "audience-persona-collaboration",
    title: "Audience Intent & Human Collaboration",
    category: "editorial-knowledge",
    keywords: [
      "audience",
      "user",
      "persona",
      "customer",
      "team",
      "community",
      "intent",
      "human",
      "voice",
      "reader",
    ],
    license: "CC0-OpenPeeps-Style",
    attributionRequired: false,
    renderSvgNodes: (raw) => {
      const p = normalizePalette(raw);
      return `<g data-scene="audience-persona-collaboration">
        <rect x="26" y="28" width="84" height="52" rx="14" fill="${p.surface}" stroke="${p.primary}" stroke-width="2.2"/>
        <rect x="42" y="44" width="52" height="8" rx="4" fill="${p.primary}"/>
        <rect x="42" y="58" width="38" height="6" rx="3" fill="${p.muted}" opacity="0.55"/>
        <rect x="128" y="56" width="86" height="56" rx="14" fill="${p.surface}" stroke="${p.secondary}" stroke-width="2.2"/>
        <rect x="144" y="72" width="54" height="8" rx="4" fill="${p.secondary}"/>
        <rect x="144" y="86" width="40" height="6" rx="3" fill="${p.ink}" opacity="0.6"/>
        <path d="M110 54 L128 74" stroke="${p.primary}" stroke-width="2.5" stroke-dasharray="4 3"/>
      </g>`;
    },
  },
  {
    id: "roi-value-calculator",
    title: "Cost Efficiency & ROI Value Engine",
    category: "ecommerce-growth",
    keywords: [
      "cost",
      "budget",
      "price",
      "free",
      "roi",
      "value",
      "savings",
      "investment",
      "profit",
      "finance",
      "calculator",
    ],
    license: "MIT-unDraw-Style",
    attributionRequired: false,
    renderSvgNodes: (raw) => {
      const p = normalizePalette(raw);
      return `<g data-scene="roi-value-calculator">
        <rect x="30" y="22" width="86" height="116" rx="14" fill="${p.surface}" stroke="${p.primary}" stroke-width="2.5"/>
        <rect x="44" y="38" width="58" height="22" rx="6" fill="${p.primary}" opacity="0.25"/>
        <circle cx="54" cy="80" r="7" fill="${p.secondary}"/>
        <circle cx="74" cy="80" r="7" fill="${p.primary}" opacity="0.6"/>
        <circle cx="94" cy="80" r="7" fill="${p.primary}" opacity="0.6"/>
        <circle cx="54" cy="104" r="7" fill="${p.primary}" opacity="0.6"/>
        <rect x="68" y="97" width="34" height="14" rx="7" fill="${p.secondary}"/>
        <circle cx="170" cy="80" r="38" fill="${p.surface}" stroke="${p.secondary}" stroke-width="3"/>
        <path d="M156 86 L168 72 L178 80 L190 62" fill="none" stroke="${p.secondary}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>`;
    },
  },
];

export function getVectorSceneById(
  id: string | undefined,
): VectorSceneIllustration | undefined {
  if (!id || id === "none") return undefined;
  return VECTOR_SCENE_CATALOG.find((scene) => scene.id === id);
}

/**
 * Deterministically picks the best-fitting vector scene illustration for a section
 * based on its headline, node text, layout archetype, and section index (so adjacent
 * sections in the same article receive varied visual scenes).
 */
export function matchVectorSceneForTopic(
  text: string,
  prismLayout?: string,
  sectionIndex = 0,
): VectorSceneIllustration {
  const lower = String(text || "").toLowerCase();

  const layoutPreferredCategory: Record<string, VectorSceneCategory> = {
    comparison: "comparison-strategy",
    "process-flow": "workflow-automation",
    timeline: "workflow-automation",
    funnel: "ecommerce-growth",
    "kpi-metrics": "analytics-data",
    quadrant: "comparison-strategy",
    "hub-spoke": "ai-seo",
    "anatomy-diagram": "ai-seo",
    checklist: "audit-security",
    "quote-spotlight": "editorial-knowledge",
  };

  const preferredCat = prismLayout
    ? layoutPreferredCategory[prismLayout]
    : undefined;

  const scored = VECTOR_SCENE_CATALOG.map((scene, idx) => {
    let score = 0;
    for (const kw of scene.keywords) {
      if (lower.includes(kw)) {
        score += kw.includes(" ") ? 4 : 2;
      }
    }
    if (preferredCat && scene.category === preferredCat) {
      score += 2.5;
    }
    // Slight deterministic rotation by sectionIndex when scores tie
    const tieBreak = ((idx + sectionIndex) % VECTOR_SCENE_CATALOG.length) * 0.01;
    return { scene, score: score + tieBreak };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.scene || VECTOR_SCENE_CATALOG[sectionIndex % VECTOR_SCENE_CATALOG.length];
}

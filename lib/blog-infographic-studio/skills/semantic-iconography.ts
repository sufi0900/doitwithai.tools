/**
 * Layer 3: High-Variety Semantic Vector Iconography & Sibling Deduplication
 *
 * Provides 48 vector icons across 8 semantic families (preserving all 8 original
 * icon keys) and assigns unique, context-scored icons per sibling card so no
 * infographic repeats the same icon across cards.
 */

export const INFOGRAPHIC_TOPIC_ICONS = [
  // Original 8 icons preserved first for complete backwards compatibility
  "answer",
  "evidence",
  "workflow",
  "search",
  "target",
  "chart",
  "check",
  "idea",
  // Strategy & Discovery
  "compass",
  "sparkle",
  "key",
  "flag",
  "eye",
  // Process & Workflow
  "git-branch",
  "layers",
  "sliders",
  "refresh-cw",
  "zap",
  "clock",
  "play-circle",
  // Audit, QA & Verification
  "shield-check",
  "scale",
  "alert-triangle",
  "clipboard-check",
  "lock",
  "filter",
  "bug",
  // Data, Metrics & Signals
  "trending-up",
  "pie-chart",
  "activity",
  "gauge",
  "percent",
  "award",
  "hash",
  // Editorial, Copy & Prompting
  "file-text",
  "edit-3",
  "book-open",
  "quote",
  "list-checks",
  "type",
  // AI, Code & Architecture
  "cpu",
  "terminal",
  "code",
  "database",
  "bot",
  "network",
  "backlink",
  "fingerprint",
  "braces",
  "stopwatch",
  // Users, Collaboration & FAQ
  "help-circle",
  "message-circle",
  "users",
  "user-check",
  "globe",
  "share-2",
] as const;

export type InfographicTopicIcon = (typeof INFOGRAPHIC_TOPIC_ICONS)[number];

const ICON_SET = new Set<string>(INFOGRAPHIC_TOPIC_ICONS);

export function isInfographicTopicIcon(
  value: unknown,
): value is InfographicTopicIcon {
  return typeof value === "string" && ICON_SET.has(value);
}

/**
 * 24x24 Lucide-grade SVG path strings for every InfographicTopicIcon.
 * Every primitive (circles, rounded boxes, lines, arrows) is authored as pure `d`
 * commands for the native DOM-free `<path>` renderer.
 */
export const SEMANTIC_ICON_PATHS: Record<InfographicTopicIcon, string[]> = {
  backlink: [
    "M10 14l4-4",
    "M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0",
    "M13 17a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-1 1",
  ],
  fingerprint: [
    "M3 12a9 9 0 0 1 18 0",
    "M6 15v-3a6 6 0 0 1 12 0c0 3 0 6-2 9",
    "M9 19c1-2 0-5 0-7a3 3 0 0 1 6 0c0 4 0 7-2 10",
    "M12 12v5",
  ],
  braces: [
    "M9 3H7v6c0 2-1 3-3 3 2 0 3 1 3 3v6h2",
    "M15 3h2v6c0 2 1 3 3 3-2 0-3 1-3 3v6h-2",
  ],
  stopwatch: [
    "M9 2h6M12 2v3m6 1 2-2",
    "M12 6a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z",
    "m12 14 3-4",
  ],
  // Original 8
  answer: ["M4 4h16v12H9l-5 4V4Z", "M8 8h8M8 12h5"],
  evidence: ["M6 3h9l4 4v14H6V3Z", "M14 3v5h5", "m9 15 2 2 4-5"],
  workflow: [
    "M4 3h6v6H4zM14 15h6v6h-6z",
    "M10 6h7v6m-3-3 3 3 3-3M14 18H7v-6m-3 3 3-3 3 3",
  ],
  search: ["M16 16l5 5", "M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"],
  target: [
    "M21 12a9 9 0 1 1-9-9",
    "M16 12a4 4 0 1 1-4-4",
    "m12 12 8-8M16 3h5v5",
  ],
  chart: ["M4 3v18h17M8 16v-4M13 16V8M18 16V5"],
  check: ["M20 12a8 8 0 1 1-4-7", "m8 11 4 4 9-10"],
  idea: [
    "M8 17c0-3-3-3-3-7a7 7 0 0 1 14 0c0 4-3 4-3 7H8ZM9 21h6M9 17v-4m6 4v-4m-6-3 3 3 3-3",
  ],

  // Strategy & Discovery
  compass: [
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z",
    "m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12Z",
  ],
  sparkle: [
    "m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z",
    "M5 3v4M3 5h4M19 17v4M17 19h4",
  ],
  key: [
    "M7.5 19a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z",
    "m10.7 11.3 8.8-8.8M16 6l2.5 2.5M18.5 3.5 21 6",
  ],
  flag: [
    "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z",
    "M4 22v-7",
  ],
  eye: [
    "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",
    "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  ],

  // Process & Workflow
  "git-branch": [
    "M6 3v12",
    "M18 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
    "M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
    "M18 9a9 9 0 0 1-9 9",
  ],
  layers: [
    "m12 2 10 5-10 5L2 7l10-5Z",
    "m2 17 10 5 10-5",
    "m2 12 10 5 10-5",
  ],
  sliders: [
    "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
  ],
  "refresh-cw": [
    "M3 12a9 9 0 0 1 15-6.7L21 8",
    "M21 3v5h-5",
    "M21 12a9 9 0 0 1-15 6.7L3 16",
    "M8 16H3v5",
  ],
  zap: ["M13 2 3 14h9l-1 8 10-12h-9l1-8Z"],
  clock: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z", "M12 6v6l4 2"],
  "play-circle": [
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z",
    "m10 8 6 4-6 4V8Z",
  ],

  // Audit, QA & Verification
  "shield-check": [
    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
    "m9 12 2 2 4-4",
  ],
  scale: [
    "m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",
    "m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",
    "M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2",
  ],
  "alert-triangle": [
    "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",
    "M12 9v4M12 17h.01",
  ],
  "clipboard-check": [
    "M9 3h6v4H9V3Z",
    "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
    "m9 14 2 2 4-4",
  ],
  lock: [
    "M5 11h14v10H5V11Z",
    "M7 11V7a5 5 0 0 1 10 0v4",
    "M12 15v2",
  ],
  filter: ["M22 3H2l8 9.46V19l4 2v-8.54L22 3Z"],
  bug: [
    "m8 2 1.88 1.88M14.12 3.88 16 2M9 7.13v-1a3 3 0 1 1 6 0v1",
    "M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6Z",
    "M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-2.1 1.7-3.9 3.8-4M20.97 5c0 2.1-1.6 3.8-3.5 4M22 13h-4M17.2 17c2.1.1 3.8 1.9 3.8 4",
  ],

  // Data, Metrics & Signals
  "trending-up": ["m22 7-8.5 8.5-5-5L2 17", "M16 7h6v6"],
  "pie-chart": [
    "M21.21 15.89A10 10 0 1 1 8 2.83",
    "M22 12A10 10 0 0 0 12 2v10Z",
  ],
  activity: ["M22 12h-4l-3 9L9 3l-3 9H2"],
  gauge: [
    "m12 14 4-4",
    "M3.34 19a10 10 0 1 1 17.32 0",
    "M12 4v2M5.5 7.5 7 9M18.5 7.5 17 9",
  ],
  percent: [
    "M19 5 5 19",
    "M6.5 4a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z",
    "M17.5 15a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z",
  ],
  award: [
    "M12 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z",
    "m15.48 12.89 1.52 9.11-5-3-5 3 1.52-9.11",
  ],
  hash: ["M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"],

  // Editorial, Copy & Prompting
  "file-text": [
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z",
    "M14 2v6h6M16 13H8M16 17H8M10 9H8",
  ],
  "edit-3": ["M12 20h9", "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"],
  "book-open": [
    "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z",
    "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z",
  ],
  quote: [
    "M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 1.97V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.03V20c0 1 0 1 1 1Z",
    "M15 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 1.97V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1Z",
  ],
  "list-checks": ["m3 17 2 2 4-4", "m3 7 2 2 4-4", "M13 6h8M13 12h8M13 18h8"],
  type: ["M4 7V4h16v3M9 20h6M12 4v16"],

  // AI, Code & Architecture
  cpu: [
    "M6 4h12v12H6V4Z",
    "M9 9h6v6H9V9Z",
    "M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3",
  ],
  terminal: ["m4 17 6-6-6-6", "M12 19h8"],
  code: ["m16 18 6-6-6-6", "m8 6-6 6 6 6"],
  database: [
    "M3 5a9 3 0 1 0 18 0 9 3 0 1 0-18 0Z",
    "M3 5v14a9 3 0 0 0 18 0V5",
    "M3 12a9 3 0 0 0 18 0",
  ],
  bot: [
    "M12 8V4H8",
    "M4 8h16v12H4V8Z",
    "M2 14h2M20 14h2M15 13v2M9 13v2",
  ],
  network: [
    "M9 2h6v6H9V2ZM16 16h6v6h-6v-6ZM2 16h6v6H2v-6Z",
    "M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8",
  ],

  // Users, Collaboration & FAQ
  "help-circle": [
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z",
    "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",
    "M12 17h.01",
  ],
  "message-circle": [
    "M7.9 20A9 9 0 1 0 4 16.1L2 22Z",
    "M8 12h.01M12 12h.01M16 12h.01",
  ],
  users: [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
    "M22 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  "user-check": [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
    "m16 11 2 2 4-4",
  ],
  globe: [
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z",
    "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20Z",
    "M2 12h20",
  ],
  "share-2": [
    "M18 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
    "M6 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
    "M18 16a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
    "m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98",
  ],
};

const ICON_RULES: Array<[InfographicTopicIcon, RegExp]> = [
  ["terminal", /\b(?:prompt|prompts|cli|command|template|instruction|system prompt)\b/i],
  ["bot", /\b(?:chatgpt|gpt|llm|ai model|assistant|agent|autonomous|model)\b/i],
  ["sliders", /\b(?:constraint|constraints|parameter|setting|rule|threshold|cap|length rule|rigid)\b/i],
  ["layers", /\b(?:section|coherent|context|structure|layer|stack|nearby|module|pillar)\b/i],
  ["scale", /\b(?:compare|comparison|original|benchmark|balance|trade-?off|difference|vs\.?|same)\b/i],
  ["search", /\b(?:identify|diagnose|audit|unclear|search|research|query|find|gap|missing)\b/i],
  ["filter", /\b(?:dense|prune|filter|trim|clarity|noise|ambigu|vague)\b/i],
  ["backlink", /\b(?:backlinks?|link authority|referring domains?)\b/i],
  ["fingerprint", /\b(?:original insights?|firsthand|first-hand|unique value)\b/i],
  ["braces", /\b(?:structured data|json-ld|schema markup)\b/i],
  ["stopwatch", /\b(?:page speed|load time|latency|core web vitals)\b/i],
  ["alert-triangle", /\b(?:risk|uncertain|error|pitfall|warning|weak|hallucinat|caution)\b/i],
  ["edit-3", /\b(?:revise|revision|rewrite|rewriting|edit|editing|draft|prose|phrasing)\b/i],
  ["shield-check", /\b(?:preserve|protect|safe|guard|meaning|accurate|fact|facts|trust|eeat|e-e-a-t|reliable)\b/i],
  ["clipboard-check", /\b(?:check|verify|validation|checklist|audit|confirm|condition|actors)\b/i],
  ["eye", /\b(?:preview|layout|visible|inspect|look|scan|scannability|page layout|in-page|monitor|reader flow)\b/i],
  ["user-check", /\b(?:responsible|responsibility|accountability|human|owner|ownership|final output|approve)\b/i],
  ["users", /\b(?:audience|team|readers|users|collaboration|stakeholder)\b/i],
  ["gauge", /\b(?:score|readability|flesch|grade level|speed|cwv|performance|metric|rating)\b/i],
  ["workflow", /\b(?:workflows?|pipeline|process|sequence|automate|chain|ai-assisted)\b/i],
  ["trending-up", /\b(?:seo|ranking|rankings|traffic|growth|ctr|conversion|boost|lift)\b/i],
  ["chart", /\b(?:data|analytics|statistics|chart|report|ratio|benchmark)\b/i],
  ["percent", /\b(?:percent|%|rate|share|proportion|conversion rate)\b/i],
  ["help-circle", /\b(?:what is|who is|why does|why do|question|faq|wonder)\?/i],
  ["message-circle", /\b(?:answer|reply|respond|conversation|tone|voice|dialogue)\b/i],
  ["book-open", /\b(?:definition|definitions|explain|guide|learn|knowledge|glossary)\b/i],
  ["file-text", /\b(?:article|document|page|heading|paragraph|text|content|body)\b/i],
  ["type", /\b(?:sentence|sentences|words|word count|typography|headline|title|copy)\b/i],
  ["list-checks", /\b(?:criteria|steps|items|list|bullet|requirements|every sentence)\b/i],
  ["git-branch", /\b(?:branch|variation|version|diff|revision vs|parallel)\b/i],
  ["refresh-cw", /\b(?:iterate|iteration|refresh|update|loop|re-run)\b/i],
  ["zap", /\b(?:fast|instant|quick|speed|accelerate|trigger)\b/i],
  ["clock", /\b(?:time|minute|duration|schedule|daily|cadence)\b/i],
  ["play-circle", /\b(?:start|begin|launch|run|execute|test)\b/i],
  ["compass", /\b(?:strategy|direction|navigate|intent|roadmap|plan)\b/i],
  ["target", /\b(?:goal|objective|target|focus|intended task|intent)\b/i],
  ["key", /\b(?:key|essential|secret|unlock|access|token)\b/i],
  ["flag", /\b(?:milestone|flag|priority|highlight|signal)\b/i],
  ["sparkle", /\b(?:quality|polish|clarity|insight|enhance|best)\b/i],
  ["code", /\b(?:code|schema|json-ld|html|markup|tag)\b/i],
  ["database", /\b(?:source|dataset|storage|index|cache|repository)\b/i],
  ["cpu", /\b(?:engine|compute|algorithm|processing|ai-powered)\b/i],
  ["network", /\b(?:cluster|link|internal link|topic hub|graph|connect)\b/i],
  ["globe", /\b(?:web|website|domain|url|serp|public|live page)\b/i],
  ["award", /\b(?:authority|expert|winner|top|best practice|guarantee)\b/i],
  ["evidence", /\b(?:evidence|citations?|cite[ds]?|citing|referenced?|proof|stud(?:y|ies)|geo|generative engine)\b/i],
  ["answer", /\b(?:aeo|answer engine|direct(?:ly)? answer|snippet|position zero)\b/i],
  ["check", /\b(?:pass|complete|valid|confirmed|done|ready)\b/i],
  ["idea", /\b(?:idea|concept|principle|theory|takeaway)\b/i],
];

const TOPIC_DIVERSE_FALLBACKS: InfographicTopicIcon[] = [
  "compass",
  "layers",
  "search",
  "edit-3",
  "clipboard-check",
  "eye",
  "shield-check",
  "target",
  "gauge",
  "terminal",
  "scale",
  "user-check",
  "book-open",
  "zap",
  "trending-up",
  "workflow",
];

export interface SemanticIconNodeLike {
  title?: string;
  detail?: string;
  badge?: string;
  metricValue?: string;
  icon?: InfographicTopicIcon;
}

/**
 * Returns a ranked list of semantic icon candidates for a single node based on
 * weighted keyword signals across title (3x), badge/metric (2x), detail (1.5x), and sectionTitle (0.5x).
 */
export function scoreSemanticIconCandidates(
  node: SemanticIconNodeLike,
  sectionTitle?: string,
): InfographicTopicIcon[] {
  const title = node.title || "";
  const badge = `${node.badge || ""} ${node.metricValue || ""}`;
  const detail = node.detail || "";
  const section = sectionTitle || "";
  const isQuestion = title.trim().endsWith("?") || /^Q\d+$/i.test(node.badge || "");

  const scores = new Map<InfographicTopicIcon, number>();
  for (const icon of INFOGRAPHIC_TOPIC_ICONS) {
    scores.set(icon, 0);
  }

  for (const [icon, rx] of ICON_RULES) {
    let pts = 0;
    if (rx.test(title)) pts += 6;
    if (rx.test(badge)) pts += 4;
    if (rx.test(detail)) pts += 3;
    if (rx.test(section)) pts += 1;
    if (pts > 0) {
      if (
        (icon === "workflow" || icon === "evidence" || icon === "answer") &&
        (rx.test(title) || rx.test(detail))
      ) {
        pts += 2;
      }
      scores.set(icon, (scores.get(icon) || 0) + pts);
    }
  }

  // Named disciplines are more specific than incidental words such as "engine".
  if (/\banswer engine optimization\b/i.test(title)) scores.set("answer", 18);
  if (/\bgenerative engine optimization\b/i.test(title))
    scores.set("evidence", 18);
  if (/\bAI-assisted SEO\b/i.test(title)) scores.set("workflow", 18);

  if (isQuestion) {
    scores.set("help-circle", (scores.get("help-circle") || 0) + 2.5);
    scores.set("message-circle", (scores.get("message-circle") || 0) + 2);
    scores.set("book-open", (scores.get("book-open") || 0) + 1.5);
  }

  if (node.icon && isInfographicTopicIcon(node.icon)) {
    scores.set(node.icon, (scores.get(node.icon) || 0) + 1.2);
  }

  const ranked = [...scores.entries()]
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([icon]) => icon);

  for (const fb of TOPIC_DIVERSE_FALLBACKS) {
    if (!ranked.includes(fb)) ranked.push(fb);
  }
  for (const icon of INFOGRAPHIC_TOPIC_ICONS) {
    if (!ranked.includes(icon)) ranked.push(icon);
  }

  return ranked;
}

/**
 * Assigns distinct, semantically relevant icons to every sibling card in a section.
 * Preserves unique user-chosen icons when already distinct; resolves collisions
 * automatically so no two cards on the same infographic share an icon.
 */
export function assignDistinctSectionIcons<T extends SemanticIconNodeLike>(
  nodes: T[],
  sectionTitle?: string,
  forceAutoDiversify = false,
): Array<T & { icon: InfographicTopicIcon }> {
  const explicitIcons = nodes.map((n) => n.icon).filter(Boolean);
  const hasDuplicates = new Set(explicitIcons).size < explicitIcons.length;
  const shouldPreserveUniqueExplicit = !forceAutoDiversify && !hasDuplicates;

  const used = new Set<InfographicTopicIcon>();
  return nodes.map((node) => {
    if (
      shouldPreserveUniqueExplicit &&
      node.icon &&
      isInfographicTopicIcon(node.icon) &&
      !used.has(node.icon)
    ) {
      used.add(node.icon);
      return { ...node, icon: node.icon };
    }

    const candidates = scoreSemanticIconCandidates(node, sectionTitle);
    const chosen =
      candidates.find((c) => !used.has(c)) || candidates[0] || "idea";
    used.add(chosen);
    return { ...node, icon: chosen };
  });
}

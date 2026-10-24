import { answerReadiness } from "../on-page-analyzer/readiness";
import { crawlerReadiness } from "../on-page-analyzer/crawlers";
import type { PageSnapshot } from "../on-page-analyzer/types";
export type ReviewState = "restriction" | "review" | "observed" | "unknown";
export type ReviewRow = {
  id: string;
  label: string;
  state: ReviewState;
  evidence: string;
  action: string;
  tool: string;
};
// These rules describe Google directives only. Other engines can interpret directives differently.
export function googleRestrictions(raw: string[]) {
  let noindex = false,
    nosnippet = false;
  const limits: number[] = [];
  for (const line of raw) {
    const match = /^(robots|googlebot|HTTP X-Robots-Tag):\s*(.*)$/i.exec(line);
    if (!match) continue;
    let agent = match[1].toLowerCase() === "googlebot" ? "googlebot" : "";
    for (const part of match[2].toLowerCase().split(",")) {
      // A numeric max-snippet value is a directive, never a user-agent scope.
      const scoped = /^\s*([\w-]+):\s*(.*)$/.exec(part);
      const directive =
        scoped &&
        !/^(?:max-snippet|max-image-preview|max-video-preview|unavailable_after)$/.test(
          scoped[1],
        );
      if (directive && scoped) agent = scoped[1];
      if (agent && agent !== "googlebot") continue;
      const value = directive && scoped ? scoped[2] : part;
      noindex ||= /(?:^|[\s;])(?:noindex|none)(?:$|[\s;])/.test(value.trim());
      nosnippet ||= /(?:^|[\s;])nosnippet(?:$|[\s;])/.test(value.trim());
      const limit = /(?:^|[\s;])max-snippet\s*:\s*(-?\d+)(?:$|[\s;])/.exec(
        value.trim(),
      );
      if (limit && Number(limit[1]) >= 0) limits.push(Number(limit[1]));
    }
  }
  const maxSnippet = limits.length ? Math.min(...limits) : null;
  return { noindex, nosnippet: nosnippet || maxSnippet === 0, maxSnippet };
}
export function citationReview(page: PageSnapshot) {
  const answer = answerReadiness(page),
    policy = googleRestrictions(page.robots);
  const live = page.source === "url",
    complete = !page.partial;
  const rows: ReviewRow[] = [];
  const add = (
    id: string,
    label: string,
    state: ReviewState,
    evidence: string,
    action: string,
    tool: string,
  ) => rows.push({ id, label, state, evidence, action, tool });
  add(
    "scope",
    "Extraction coverage",
    complete ? "observed" : "unknown",
    `${page.blocks.length} retained blocks; ${page.scope}.`,
    complete
      ? "Compare important passages with the rendered page. Dynamic content may be absent."
      : "Review omitted content separately before drawing page-wide conclusions.",
    "on-page-ai-seo-analyzer",
  );
  add(
    "response",
    "Live page response",
    !live || !page.status
      ? "unknown"
      : page.status >= 200 && page.status < 300
        ? "observed"
        : "restriction",
    live && page.status
      ? `HTTP ${page.status}; ${page.redirects} redirects.`
      : "No live response was checked.",
    "Confirm that the published page remains publicly accessible. This request does not test every crawler or firewall.",
    "on-page-ai-seo-analyzer",
  );
  add(
    "indexing",
    "Google indexing directives",
    policy.noindex ? "restriction" : live && complete ? "observed" : "unknown",
    page.robots.join("; ") || "No indexing directives retained.",
    policy.noindex
      ? "Review the detected exclusion before changing it. Confirm actual indexing in Search Console."
      : "The absence of a detected exclusion does not establish indexing or eligibility. Confirm the published URL in Search Console.",
    "robots-txt-generator",
  );
  add(
    "snippets",
    "Google text snippet controls",
    policy.nosnippet
      ? "restriction"
      : policy.maxSnippet !== null
        ? "review"
        : live && complete
          ? "observed"
          : "unknown",
    policy.nosnippet
      ? "A nosnippet or max-snippet:0 restriction was detected."
      : policy.maxSnippet !== null
        ? `The most restrictive detected max-snippet value is ${policy.maxSnippet}.`
        : "No restrictive Google snippet directive detected in retained evidence.",
    "Check whether snippet restrictions are intentional. Google AI supporting links require indexing and snippet eligibility; inclusion is never guaranteed.",
    "on-page-ai-seo-analyzer",
  );
  for (const crawler of crawlerReadiness(page).filter((r) => r.scored))
    add(
      `crawler-${crawler.token}`,
      `${crawler.token} robots policy`,
      crawler.status === "blocked"
        ? "restriction"
        : crawler.status === "allowed"
          ? "observed"
          : "unknown",
      `${crawler.rule}. ${crawler.reason}`,
      "Review this path rule and hosting restrictions. Robots permission does not prove network access or actual citations.",
      "robots-txt-generator",
    );
  add(
    "schema",
    "Structured data evidence",
    page.schemas.invalid
      ? "review"
      : page.schemas.valid || page.schemas.types.length
        ? "observed"
        : "unknown",
    `${page.schemas.valid} parsed source blocks; ${page.schemas.invalid} invalid blocks. Types: ${page.schemas.types.slice(0, 12).join(", ") || "none retained"}.`,
    "Validate extracted markup and compare it with visible content. No special AI schema is required; parsed markup does not certify eligibility.",
    "structured-data-validator",
  );
  const h1 = page.blocks.filter((b) => b.tag === "h1").length;
  const subheadings = page.blocks.filter((b) => /^h[2-6]$/.test(b.tag)).length;
  add(
    "structure",
    "Headings and reading structure",
    h1 > 1 || (h1 === 0 && complete)
      ? "review"
      : complete
        ? "observed"
        : "unknown",
    `${h1} H1 headings and ${subheadings} subheadings retained.`,
    "Check the main topic and section hierarchy. Multiple H1 headings are an editorial review cue, not proof of a search violation.",
    "heading-structure-analyzer",
  );
  const long = page.blocks.filter(
    (b) => b.tag === "p" && b.text.split(/\s+/).length > 150,
  ).length;
  add(
    "paragraphs",
    "Dense paragraphs",
    long ? "review" : complete ? "observed" : "unknown",
    `${long} retained paragraphs exceed 150 words. This threshold is an editorial cue, not an AI requirement.`,
    "Keep useful detail and exceptions. Split dense passages only when doing so improves reading flow.",
    "readability-checker",
  );
  const openings = [answer.opening, ...answer.sections];
  add(
    "openings",
    "Opening paragraph review",
    openings.some((s) => s.status === "review")
      ? "review"
      : openings.some((s) => s.status === "unknown") || !complete
        ? "unknown"
        : "observed",
    `${openings.filter((s) => s.status === "review").length} opening review cues; ${openings.filter((s) => s.status === "unknown").length} unavailable openings.`,
    "Read complete opening paragraphs below. Check definitions, useful results, scope, and exceptions without forcing every heading into one format.",
    "readability-checker",
  );
  add(
    "attribution",
    "Authorship evidence",
    answer.authors.length
      ? "observed"
      : live && complete
        ? "review"
        : "unknown",
    answer.authors.length
      ? `${answer.authors.length} authorship entries retained.`
      : "No author metadata was resolved; a visible byline may still exist.",
    "Confirm the actual author and relevant experience. A name or metadata cannot establish expertise or authority.",
    "content-evidence-review",
  );
  add(
    "sources",
    "Claims and supporting context",
    answer.claims.length ? "review" : "unknown",
    `${answer.claims.length} passages contain claim cues. Their accuracy and source support were not verified.`,
    "Review factual statements and original methods in Content Evidence Review. Inspect link context in External Link and Source Review.",
    "content-evidence-review",
  );
  return {
    version: 1,
    url: page.url,
    checkedAt: page.checkedAt,
    source: page.source,
    scope: page.scope,
    partial: page.partial,
    warnings: page.warnings,
    rows,
    openings: openings.map((s) => ({
      heading: s.heading?.text || page.title,
      state: s.status,
      reason: s.reason,
      paragraph: s.passage?.text || "",
      context: s.paragraphs.slice(1).map((p) => p.text),
    })),
    limits:
      "English editorial cues only. No factual verification, authority rating, actual indexing check, or citation prediction. Rendered content, data-nosnippet attributes, and firewall access remain unverified.",
  };
}
const cell = (value: unknown) => {
  const raw = String(value ?? "");
  return `"${(/^[\s]*[=+\-@]/.test(raw) ? "'" : "") + raw.replace(/"/g, '""')}"`;
};
export function readinessCsv(report: ReturnType<typeof citationReview>) {
  return [
    ["Type", "Item", "State", "Evidence", "Action or context"],
    ...report.rows.map((r) => [
      "Check",
      r.label,
      r.state,
      r.evidence,
      r.action,
    ]),
    ...report.openings.map((r) => [
      "Opening",
      r.heading,
      r.state,
      r.paragraph,
      `${r.reason}\n${r.context.join("\n")}`,
    ]),
    ...report.warnings.map((warning) => [
      "Scope warning",
      "Extraction",
      "unknown",
      warning,
      "Review omitted evidence separately.",
    ]),
    [
      "Scope",
      report.url || "Pasted content",
      report.partial ? "partial" : report.scope,
      report.checkedAt,
      report.limits,
    ],
  ]
    .map((row) => row.map(cell).join(","))
    .join("\r\n");
}

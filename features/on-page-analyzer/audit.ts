import type { Block, Change, Finding, PageSnapshot, Section } from "./types";
export const words = (text: string) =>
  text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || [];
export const normalize = (text: string) => words(text.toLowerCase()).join(" ");
export function phraseCount(text: string, phrase: string) {
  const source = ` ${normalize(text)} `,
    target = normalize(phrase);
  if (!target) return 0;
  let count = 0,
    at = 0;
  while ((at = source.indexOf(` ${target} `, at)) >= 0) {
    count++;
    at += target.length + 1;
  }
  return count;
}
export function applyDraft(
  page: PageSnapshot,
  changes: Change[],
): PageSnapshot {
  const next = {
    ...page,
    schemas: {
      ...page.schemas,
      samples: [...page.schemas.samples],
      types: [...page.schemas.types],
    },
    blocks: page.blocks.map((b) => ({ ...b })),
    images: page.images.map((i) => ({ ...i })),
  };
  for (const c of changes) {
    if (c.field === "title") {
      next.title = c.after;
      next.titleCount = Math.max(1, next.titleCount);
    }
    if (c.field === "description") {
      next.description = c.after;
      next.descriptionCount = Math.max(1, next.descriptionCount);
    }
    if (c.field.startsWith("level:")) {
      const heading = next.blocks.find((b) => b.id === c.field.slice(6));
      if (heading && /^h[1-6]$/.test(c.after)) heading.tag = c.after;
    }
    const block = next.blocks.find((b) => b.id === c.field);
    if (block) block.text = c.after;
    if (c.field.startsWith("schema:")) {
      const index = Number(c.field.split(":")[1]);
      if (
        Number.isInteger(index) &&
        index >= 0 &&
        index <= next.schemas.samples.length
      ) {
        next.schemas.samples[index] = c.after;
        next.schemas.valid = next.schemas.samples.length;
      }
    }
    const alt = /^image:(\d+)$/.exec(c.field);
    if (alt && next.images[Number(alt[1])])
      next.images[Number(alt[1])].alt = c.after;
  }
  // Draft estimates retain duplicate tag counts, directives, links, and published evidence.
  if (changes.some((c) => c.field.startsWith("schema:"))) {
    const types = new Set<string>();
    const visit = (value: unknown, depth = 0) => {
      if (!value || typeof value !== "object" || depth > 20) return;
      if (Array.isArray(value)) {
        value.slice(0, 100).forEach((v) => visit(v, depth + 1));
        return;
      }
      const record = value as Record<string, unknown>;
      for (const type of Array.isArray(record["@type"])
        ? record["@type"]
        : [record["@type"]])
        if (typeof type === "string") types.add(type);
      Object.values(record)
        .slice(0, 100)
        .forEach((v) => visit(v, depth + 1));
    };
    for (const sample of next.schemas.samples)
      try {
        visit(JSON.parse(sample));
      } catch {}
    next.schemas.types = [...types].slice(0, 80);
  }
  return next;
}
export function auditPage(page: PageSnapshot, keyword = ""): Finding[] {
  const findings: Finding[] = [];
  const add = (
    id: string,
    section: Finding["section"],
    status: Finding["status"],
    title: string,
    evidence: string,
    advice: string,
    tool: string,
    weight = 0,
    field?: string,
  ) =>
    findings.push({
      id,
      section,
      status,
      title,
      evidence,
      advice,
      tool,
      weight,
      field,
    });
  const bodyStatus = (status: Finding["status"]): Finding["status"] =>
    page.partial && status === "passed" ? "unchecked" : status;
  const headings = page.blocks.filter((b) => /^h[1-6]$/.test(b.tag));
  const h1 = headings.filter((b) => b.tag === "h1");
  const text = page.blocks.map((b) => b.text).join("\n");
  const wordCount = words(text).length;
  const live = page.source === "url";
  add(
    "response",
    "technical",
    live ? (page.status === 200 ? "passed" : "warning") : "unchecked",
    "Page response",
    live
      ? `HTTP ${page.status}; ${page.redirects} redirect(s).`
      : "Pasted content has no live HTTP response.",
    "Use a public URL to verify the response and redirect path.",
    "redirect-rule-generator",
    10,
  );
  const noindex = page.robots.some((raw) => {
    const value = raw.replace(
      /^(?:HTTP X-Robots-Tag|robots|googlebot):\s*/i,
      "",
    );
    let agent = "";
    return value.split(",").some((part) => {
      const scoped = /^\s*([a-z][\w-]*):\s*(.*)$/i.exec(part);
      if (scoped) agent = scoped[1].toLowerCase();
      return (
        (!agent || agent === "googlebot") &&
        /(?:^|[\s;])(?:noindex|none)(?:$|[\s;])/i.test(
          scoped ? scoped[2] : part,
        )
      );
    });
  });
  add(
    "indexing",
    "technical",
    noindex ? "critical" : live ? "passed" : "info",
    "Indexing directives",
    page.robots.join("; ") ||
      "No explicit robots directives found in this response.",
    noindex
      ? "If this page should appear in search, review the noindex directive. Confirm its purpose before changing it."
      : "No detected noindex is not proof of Google indexing. Verify indexing in Search Console.",
    "robots-txt-generator",
    10,
  );
  add(
    "canonical",
    "technical",
    page.canonicalCount > 1
      ? "warning"
      : !page.canonical
        ? "warning"
        : "passed",
    "Canonical declaration",
    page.canonical
      ? `${page.canonicalCount} declaration(s): ${page.canonical}`
      : "No valid canonical link was extracted.",
    "Choose the preferred URL and check that the canonical matches that intent. A missing canonical is not always an error.",
    "slug-generator",
    3,
  );
  if (page.canonical && page.url)
    add(
      "canonical-target",
      "technical",
      page.canonical.split("#")[0] === page.url.split("#")[0]
        ? "passed"
        : "info",
      "Canonical target",
      page.canonical,
      "A different canonical can be intentional. Its response and indexability need a separate check.",
      "slug-generator",
    );
  add(
    "language",
    "technical",
    page.language ? "passed" : "warning",
    "Document language",
    page.language || "No HTML language declaration was found.",
    "Declare the document language for browsers and assistive technology. Hreflang requires a separate multilingual review.",
    "hreflang-generator",
    1,
  );
  add(
    "viewport",
    "technical",
    page.viewport ? "passed" : "warning",
    "Mobile viewport",
    page.viewport || "No viewport metadata was found.",
    "Check responsive behavior and add an appropriate viewport declaration where needed.",
    "core-web-vitals-checker",
    2,
  );
  add(
    "title",
    "search",
    !page.title ? "warning" : page.titleCount > 1 ? "warning" : "passed",
    "Page title",
    page.title
      ? `${page.titleCount} title element(s). “${page.title}”`
      : "No nonempty title element was found.",
    "Use one descriptive title that reflects the page. Preview changes before publishing.",
    "meta-title-generator",
    5,
    "title",
  );
  add(
    "description",
    "search",
    !page.description || page.descriptionCount > 1 ? "warning" : "passed",
    "Meta description",
    page.description
      ? `${page.descriptionCount} description tag(s). “${page.description}”`
      : "No nonempty meta description was found.",
    "Write a specific summary. Search engines can choose different snippet text.",
    "meta-description-generator",
    2,
    "description",
  );
  add(
    "snippet",
    "search",
    "info",
    "Search preview",
    "Preview uses your title, description, and URL.",
    "Pixel measurements are estimates. Display width, device, and search engine rewrites can change the final appearance.",
    "serp-rich-result-preview-generator",
  );
  add(
    "social",
    "search",
    page.ogTitle && page.ogImage ? "passed" : "info",
    "Social sharing fields",
    `Open Graph title: ${page.ogTitle || "missing"}. Image: ${page.ogImage || "missing"}.`,
    "Review sharing metadata separately from search ranking. Check the image in the social preview tool.",
    "og-twitter-preview-generator",
  );
  add(
    "h1",
    "headings",
    bodyStatus(
      page.partial && !h1.length
        ? "unchecked"
        : h1.length === 1 && h1[0].text
          ? "passed"
          : "warning",
    ),
    "Main heading",
    `${h1.length} H1 heading(s) in ${page.scope}.`,
    "A clear main heading helps readers identify the page. Multiple H1s are a review item, not an automatic ranking penalty.",
    "h1-heading-generator",
    4,
    h1[0]?.id,
  );
  const empty = headings.filter((b) => !b.text),
    skips = headings.filter(
      (b, i) => i > 0 && Number(b.tag[1]) > Number(headings[i - 1].tag[1]) + 1,
    );
  add(
    "heading-order",
    "headings",
    bodyStatus(
      !headings.length || empty.length || skips.length ? "warning" : "passed",
    ),
    "Heading hierarchy",
    `${headings.length} headings; ${skips.length} skipped level(s); ${empty.length} empty heading(s).`,
    "Nest subsections logically. Returning from H4 to H2 is valid. Review skipped levels in context.",
    "heading-structure-analyzer",
    3,
  );
  const seenHeadingText = new Set<string>();
  const duplicates = headings.filter((b) => {
    const text = normalize(b.text);
    if (!text) return false;
    const repeated = seenHeadingText.has(text);
    seenHeadingText.add(text);
    return repeated;
  });
  add(
    "heading-repeats",
    "headings",
    bodyStatus(duplicates.length ? "warning" : "passed"),
    "Repeated heading text",
    duplicates.length
      ? duplicates
          .slice(0, 5)
          .map((b) => b.text)
          .join("; ")
      : "No repeated heading text found in the extracted outline.",
    "Use distinctive section labels where repetition makes navigation confusing.",
    "heading-structure-analyzer",
    1,
  );
  add(
    "content",
    "content",
    bodyStatus(wordCount < 30 ? "warning" : "passed"),
    "Readable content extracted",
    `${wordCount.toLocaleString()} words in ${page.blocks.length} structured blocks.`,
    "Confirm that the extracted main content matches the page. There is no universal minimum word count for SEO.",
    "readability-checker",
    4,
  );
  const longBlocks = page.blocks.filter(
    (b) => !/^h/.test(b.tag) && words(b.text).length > 120,
  );
  add(
    "paragraphs",
    "content",
    bodyStatus(longBlocks.length ? "warning" : "passed"),
    "Dense content blocks",
    `${longBlocks.length} block(s) contain more than 120 words. List items are counted separately.`,
    "Review dense passages for your audience. The threshold is an editing prompt, not a search engine requirement.",
    "readability-checker",
    1,
    longBlocks[0]?.id,
  );
  const seenPassageText = new Set<string>();
  const repeated = page.blocks.filter((b) => {
    if (b.text.length <= 80) return false;
    const text = normalize(b.text),
      duplicate = seenPassageText.has(text);
    seenPassageText.add(text);
    return duplicate;
  });
  add(
    "content-repeats",
    "content",
    bodyStatus(repeated.length ? "warning" : "passed"),
    "Repeated passages",
    `${repeated.length} exact repeated passage(s) in the extracted content.`,
    "Remove accidental repetition. This does not check plagiarism or duplicates across other pages.",
    "keyword-density-checker",
    1,
    repeated[0]?.id,
  );
  if (normalize(keyword)) {
    const count = phraseCount(text, keyword);
    add(
      "keyword",
      "content",
      "info",
      "Target phrase context",
      `“${keyword}”: ${count} occurrence(s) in extracted content; title: ${phraseCount(page.title, keyword)}; H1: ${h1.reduce((n, b) => n + phraseCount(b.text, keyword), 0)}.`,
      "Review natural relevance and synonyms. Exact matches and a fixed keyword density are not required.",
      "search-intent-checker",
    );
  } else
    add(
      "keyword",
      "content",
      "unchecked",
      "Target phrase context",
      "No target phrase supplied.",
      "Add an optional phrase to inspect placement. We do not infer search volume or actual search results.",
      "search-intent-checker",
    );
  let internal: typeof page.links = [],
    external: typeof page.links = [];
  for (const link of page.links) {
    if (!page.url || !/^https?:/.test(link.href)) continue;
    if (new URL(link.href).origin === new URL(page.url).origin)
      internal.push(link);
    else external.push(link);
  }
  add(
    "internal-links",
    "links",
    !page.url ? "unchecked" : bodyStatus(internal.length ? "passed" : "info"),
    "Internal links",
    `${internal.length} extracted link(s) to the same origin.`,
    "Add helpful links where readers need context. Discovering new targets needs additional website pages.",
    "internal-link-opportunity-finder",
    1,
  );
  const generic = page.links.filter(
    (l) => /^(click here|here|read more|learn more)$/i.test(l.text) || !l.text,
  );
  add(
    "anchors",
    "links",
    bodyStatus(generic.length ? "warning" : "passed"),
    "Anchor clarity",
    `${generic.length} empty or generic text anchor(s). Image-only links need an accessibility review.`,
    "Use descriptive anchors where appropriate. Inspect image links before treating missing text as an error.",
    "internal-link-opportunity-finder",
    1,
  );
  add(
    "link-status",
    "links",
    "unchecked",
    "Destination health & link opportunities",
    `${external.length} external link(s). Linked destinations were not fetched.`,
    "Broken links, orphan pages, incoming links, and new target opportunities require a separate crawl.",
    "internal-link-opportunity-finder",
  );
  const noAlt = page.images.filter((i) => i.alt === null),
    emptyAlt = page.images.filter((i) => i.alt === "");
  add(
    "alt",
    "media",
    bodyStatus(noAlt.length ? "warning" : "passed"),
    "Image alternatives",
    `${page.images.length} image(s); ${noAlt.length} missing alt attribute(s); ${emptyAlt.length} empty alternative(s).`,
    "Describe informative images. Empty alt text can be correct for decorative images; filenames cannot establish image meaning.",
    "image-alt-text-generator",
    2,
    noAlt.length ? `image:${page.images.indexOf(noAlt[0])}` : undefined,
  );
  const noDimensions = page.images.filter((i) => !i.width || !i.height);
  add(
    "dimensions",
    "media",
    bodyStatus(noDimensions.length ? "info" : "passed"),
    "Image space reservation",
    `${noDimensions.length} image(s) lack explicit width or height attributes.`,
    "CSS aspect-ratio may already reserve space. Confirm layout shifts with performance testing before changing markup.",
    "core-web-vitals-checker",
  );
  add(
    "schema-json",
    "schema",
    page.schemas.invalid
      ? "warning"
      : page.schemas.valid
        ? bodyStatus("passed")
        : "info",
    "Structured data syntax",
    `${page.schemas.valid} valid JSON-LD block(s); ${page.schemas.invalid} invalid block(s).`,
    "JSON validity does not establish rich result eligibility. Validate relevant types and compare markup with visible content.",
    "schema-markup-generator",
    page.schemas.valid || page.schemas.invalid ? 2 : 0,
  );
  add(
    "schema-types",
    "schema",
    "info",
    "Detected schema types",
    page.schemas.types.join(", ") ||
      "No JSON-LD types extracted. Microdata and RDFa were not assessed.",
    "Add markup only when appropriate. Missing schema is not a universal SEO failure, and special AI schema is not required.",
    "schema-markup-generator",
  );
  add(
    "schema-eligibility",
    "schema",
    "unchecked",
    "Rich result eligibility",
    "Only JSON-LD parsing and type extraction completed.",
    "Use the schema tool and Google's Rich Results Test for supported feature requirements. Display is never guaranteed.",
    "schema-markup-generator",
  );
  add(
    "author",
    "ai-search",
    page.author ? "info" : "info",
    "Authorship evidence",
    page.author ||
      "No author metadata extracted. A visible byline may still exist.",
    "For relevant content, make authorship and experience easy to understand. This is not an E-E-A-T score.",
    "ai-citation-readiness-checker",
  );
  const claims = page.blocks.filter((b) =>
    /\d+(?:\.\d+)?\s?%|\b(?:research shows|studies show|guaranteed|always|never)\b/i.test(
      b.text,
    ),
  );
  add(
    "claims",
    "ai-search",
    "info",
    "Claims worth reviewing",
    `${claims.length} passage(s) contain statistics or broad claims.`,
    "Inspect the highlighted wording and support relevant claims with reliable evidence. Detection does not prove a claim is false.",
    "ai-citation-readiness-checker",
    0,
    claims[0]?.id,
  );
  add(
    "intent",
    "ai-search",
    "unchecked",
    "Intent & answer completeness",
    "No live search-result comparison or factual verification was performed.",
    "Review whether the page delivers its promise. Use the intent tool for a separate editorial assessment.",
    "search-intent-checker",
  );
  add(
    "robots-file",
    "technical",
    page.resources.robots === "unknown" ? "unchecked" : "info",
    "Robots.txt availability",
    page.resources.robots === "found"
      ? "Robots.txt retrieved; review individual crawler rules below."
      : page.resources.robots === "missing"
        ? "No robots.txt file found. This alone does not block crawling."
        : "Robots.txt could not be checked.",
    "File availability alone cannot confirm access. Check matching crawler rules, hosting restrictions, and indexing directives separately.",
    "robots-txt-generator",
  );
  add(
    "llms",
    "ai-search",
    page.resources.llms === "unknown" ? "unchecked" : "info",
    "Optional llms.txt",
    page.resources.llms === "found"
      ? "An llms.txt text file was found."
      : page.resources.llms === "missing"
        ? "No llms.txt text file found. No score deduction."
        : "Optional file was not checked.",
    "This file is optional. It is not required for Google Search or its AI features and does not guarantee citations.",
    "llms-txt-generator",
  );
  add(
    "performance",
    "technical",
    "unchecked",
    "Core Web Vitals",
    "A performance test has not been requested in this audit.",
    "Run the optional mobile or desktop check. Missing real-user field data is not a failed measurement.",
    "core-web-vitals-checker",
  );
  add(
    "sitewide",
    "technical",
    "unchecked",
    "Sitewide coverage",
    "This report covers one page's returned HTML, without executing JavaScript.",
    "Sitewide duplicates, cannibalization, hreflang reciprocity, and rendered content need additional checks.",
    "keyword-cannibalization-finder",
  );
  return findings;
}
export function summarize(findings: Finding[], section?: Section) {
  const selected = findings.filter(
    (f) => !section || section === "overview" || f.section === section,
  );
  const eligible = selected.filter(
    (f) => f.weight > 0 && ["passed", "critical", "warning"].includes(f.status),
  );
  const total = eligible.reduce((n, f) => n + f.weight, 0);
  const earned = eligible.reduce(
    (n, f) =>
      n +
      (f.status === "passed"
        ? f.weight
        : f.status === "warning"
          ? f.weight * 0.5
          : 0),
    0,
  );
  return {
    score: total ? Math.round((100 * earned) / total) : null,
    assessed: selected.filter((f) => f.status !== "unchecked").length,
    total: selected.length,
    critical: selected.filter((f) => f.status === "critical").length,
    warnings: selected.filter((f) => f.status === "warning").length,
    passed: selected.filter((f) => f.status === "passed").length,
  };
}
export function changesCsv(changes: Change[]) {
  const quote = (s: string) =>
    `"${(/^[\s]*[=+@-]/.test(s) ? "'" : "") + s.replace(/"/g, '""')}"`;
  return (
    "Field,Original,Proposed\r\n" +
    changes
      .map((c) => [c.field, c.before, c.after].map(quote).join(","))
      .join("\r\n")
  );
}

export function sampleReviewBlocks(blocks: Block[]) {
  const candidates = blocks.filter((b) => b.text.length >= 10);
  if (candidates.length <= 30)
    return candidates.map((b) => ({ ...b, text: b.text.slice(0, 1000) }));
  const chosen = new Set<number>([0, candidates.length - 1]);
  candidates.forEach((b, i) => {
    if (/^h/.test(b.tag) && chosen.size < 12) chosen.add(i);
  });
  for (let i = 0; i < 30 && chosen.size < 30; i++)
    chosen.add(Math.round((i * (candidates.length - 1)) / 29));
  for (let i = 0; i < candidates.length && chosen.size < 30; i++) chosen.add(i);
  return [...chosen]
    .sort((a, b) => a - b)
    .map((i) => ({
      ...candidates[i],
      text: candidates[i].text.slice(0, 1000),
    }));
}

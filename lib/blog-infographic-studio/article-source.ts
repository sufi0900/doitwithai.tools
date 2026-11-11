/** Article-only source tree. No generated claims or layout decisions belong here. */
export interface ArticleSourceBlock {
  id: string;
  kind: "paragraph" | "list" | "table" | "caption" | "heading";
  text: string;
  heading?: string;
}
export interface ArticleSourceSection {
  id: string;
  title: string;
  blocks: ArticleSourceBlock[];
  role: "content" | "introduction" | "promotional";
}
export interface ArticleSourceCoverage {
  sectionsFound: number;
  sectionsIncluded: number;
  blocksFound: number;
  blocksIncluded: number;
  truncated: boolean;
}
const tidy = (s: string | null) => (s || "").replace(/\s+/g, " ").trim();
export function sourceId(text: string) {
  let hash = 2166136261;
  for (const char of text)
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(36);
}
const excluded =
  'nav, aside, footer, script, style, [hidden], [aria-hidden="true"], [role="navigation"], .toc, .table-of-contents, .related-posts, .author-bio, .newsletter, .share-buttons';
export function classifySection(title: string): ArticleSourceSection["role"] {
  if (
    /about (?:the |this )?author|note before|before we begin|my (?:story|journey)|how i (?:wrote|created)|meet the founder/i.test(
      title,
    )
  )
    return "introduction";
  if (
    /subscribe|related (?:posts|articles|tools)|newsletter|leave a (?:reply|comment)|table of contents|^sources$|^references$/i.test(
      title,
    )
  )
    return "promotional";
  return "content";
}

/** Traversal crosses nested wrappers and keeps H3 context; it does not stop after ten siblings. */
export function extractArticleSource(document: Document, title: string) {
  const candidates = Array.from(
    document.querySelectorAll(
      'article, [itemprop="articleBody"], main .prose, main .article-content, main',
    ),
  );
  const score = (el: Element) =>
    Array.from(el.querySelectorAll("p, li"))
      .filter((p) => !p.closest(excluded))
      .reduce((n, p) => n + tidy(p.textContent).length, 0);
  const root =
    candidates.sort((a, b) => score(b) - score(a))[0] || document.body;
  const sections: ArticleSourceSection[] = [];
  let current: ArticleSourceSection | undefined,
    h3 = "",
    blocksFound = 0,
    blocksIncluded = 0,
    chars = 0,
    sectionsFound = 0;
  const begin = (heading: string) => {
    sectionsFound++;
    current = {
      id: `section-${sourceId(`${sectionsFound}:${heading}`)}`,
      title: heading,
      role: classifySection(heading),
      blocks: [],
    };
    if (sections.length < 36) sections.push(current);
    h3 = "";
  };
  for (const el of Array.from(
    root.querySelectorAll("h2,h3,p,li,table,figcaption"),
  )) {
    if (el.closest(excluded)) continue;
    if (el.parentElement?.closest("table, li") && !/^H[23]$/.test(el.tagName))
      continue;
    let text = tidy(el.textContent);
    if (!text) continue;
    if (el.tagName === "H2") {
      begin(text);
      continue;
    }
    if (!current) begin(title);
    const kind: ArticleSourceBlock["kind"] =
      el.tagName === "H3"
        ? "heading"
        : el.tagName === "LI"
          ? "list"
          : el.tagName === "TABLE"
            ? "table"
            : el.tagName === "FIGCAPTION"
              ? "caption"
              : "paragraph";
    if (kind === "heading") h3 = text;
    if (kind === "table")
      text = Array.from(el.querySelectorAll("tr"))
        .map((tr) =>
          Array.from(tr.querySelectorAll("th,td"))
            .map((td) => tidy(td.textContent))
            .join(" | "),
        )
        .join("\n");
    blocksFound++;
    if (
      chars + text.length > 90000 ||
      blocksIncluded >= 1200 ||
      !sections.includes(current!)
    )
      continue;
    chars += text.length;
    blocksIncluded++;
    current!.blocks.push({
      id: `block-${sourceId(`${current!.id}:${blocksFound}:${text}`)}`,
      kind,
      text,
      heading: h3 || undefined,
    });
  }
  const useful = sections.filter((s) =>
    s.blocks.some((b) => b.kind !== "heading"),
  );
  const substantive = useful.filter((s) => s.role === "content");
  const rank = (s: ArticleSourceSection) => {
    const body = s.blocks.filter((b) => b.kind !== "heading");
    return (
      Math.min(
        body.reduce((n, b) => n + b.text.length, 0),
        2400,
      ) /
        120 +
      Math.min(new Set(body.map((b) => b.heading).filter(Boolean)).size, 5) *
        5 +
      (/framework|how .*works|key (?:steps|components)|process/i.test(s.title)
        ? 10
        : 0)
    );
  };
  const recommended = [...substantive].sort((a, b) => rank(b) - rank(a))[0];
  return {
    sections: useful,
    recommendedSectionId: recommended?.id,
    coverage: {
      sectionsFound,
      sectionsIncluded: useful.length,
      blocksFound,
      blocksIncluded,
      truncated: blocksIncluded < blocksFound || sectionsFound > 36,
    } satisfies ArticleSourceCoverage,
  };
}

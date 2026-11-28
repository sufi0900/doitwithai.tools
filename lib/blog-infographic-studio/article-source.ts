import { decontextualizeProse } from "./skills/standalone-copywriter";
import {
  classifySectionArchetype,
  type SectionArchetype,
} from "./skills/topic-intelligence";

/** Article-only source tree. No generated claims or layout decisions belong here. */
export interface ArticleSourceBlock {
  id: string;
  kind: "paragraph" | "list" | "table" | "caption" | "heading";
  text: string;
  heading?: string;
  subheading?: string;
}

const blockHeadingLevels = new Map<string, 3 | 4>();
export function getBlockHeadingLevel(block: { id: string }): 3 | 4 {
  return blockHeadingLevels.get(block.id) ?? 3;
}
export interface ArticleSourceSection {
  id: string;
  title: string;
  blocks: ArticleSourceBlock[];
  role: "content" | "introduction" | "promotional";
  archetype?: SectionArchetype;
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
    /about (?:the |this )?author|a note before|note before|before we begin|before you read|author['’]?s note|my (?:story|journey)|how i (?:wrote|created)|meet the founder|^introduction$|^(?:conclusion|final thoughts|wrapping up|closing thoughts|in closing|summary and next steps)\b/i.test(
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

/** Traversal crosses nested wrappers and keeps H3/H4 context; it does not stop after ten siblings. */
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
  const articleRoots = candidates.filter(
    (el) => !el.matches("main") && score(el) > 0,
  );
  const root =
    (articleRoots.length ? articleRoots : candidates).sort(
      (a, b) => score(b) - score(a),
    )[0] || document.body;
  const sections: ArticleSourceSection[] = [];
  let current: ArticleSourceSection | undefined,
    preH2Section: ArticleSourceSection | undefined,
    h3 = "",
    h4 = "",
    hLevel: 3 | 4 = 3,
    blocksFound = 0,
    blocksIncluded = 0,
    chars = 0,
    sectionsFound = 0;
  const begin = (heading: string, isPreH2 = false) => {
    sectionsFound++;
    current = {
      id: `section-${sourceId(`${sectionsFound}:${heading}`)}`,
      title: heading,
      role: classifySection(heading),
      blocks: [],
    };
    if (isPreH2) preH2Section = current;
    if (sections.length < 36) sections.push(current);
    h3 = "";
    h4 = "";
    hLevel = 3;
  };
  for (const el of Array.from(
    root.querySelectorAll(
      "h2,h3,h4,h5,summary,dt,dd,button,p,li,table,figcaption",
    ),
  )) {
    if (el.closest(excluded)) continue;
    const tag = el.tagName;
    if (
      el.parentElement?.closest("table, li") &&
      !/^(?:H[2345]|SUMMARY|DT)$/.test(tag)
    )
      continue;
    // Skip <dd> wrapper when it already contains <p> or <li> blocks so content is never duplicated
    if (tag === "DD" && el.querySelector("p, li")) continue;
    // Skip <p> or <div> text nested inside <summary>, <dt>, or <button> so the heading is not emitted twice
    if (
      (tag === "P" || tag === "LI") &&
      el.parentElement?.closest("summary, dt, button")
    )
      continue;
    // Only treat <button> as a section/FAQ question heading when it is an accordion trigger or a real question
    if (tag === "BUTTON") {
      const btnText = tidy(el.textContent);
      const isAccordionBtn =
        el.hasAttribute("aria-expanded") ||
        el.hasAttribute("aria-controls") ||
        el.hasAttribute("data-state") ||
        el.hasAttribute("data-accordion-trigger");
      const looksLikeQuestion =
        btnText.endsWith("?") &&
        btnText.length >= 12 &&
        btnText.length <= 160 &&
        !/^(?:missing something\?|need help\?|have questions\?)$/i.test(btnText);
      const looksLikeFaqAccordion =
        isAccordionBtn &&
        btnText.length >= 14 &&
        btnText.length <= 160 &&
        (btnText.endsWith("?") ||
          Boolean(
            current &&
              /\b(?:faq|frequently asked|common questions|questions about)\b/i.test(
                current.title,
              ),
          ));
      if (!looksLikeQuestion && !looksLikeFaqAccordion) continue;
    }
    const needsClone = Boolean(
      el.querySelector("br, ul, ol, p, div, strong, b"),
    );
    const copy = needsClone ? (el.cloneNode(true) as Element) : el;
    if (copy !== el) {
      // Separate nested list items so `<li>Check robots.txt</li><li>Detect GPTBot</li>` never glues words
      for (const nestedLi of Array.from(copy.querySelectorAll("li"))) {
        const liTxt = tidy(nestedLi.textContent);
        if (!liTxt) continue;
        const hasTrailPunct = /[.!?;:]$/.test(liTxt);
        nestedLi.textContent = hasTrailPunct ? ` ${liTxt} ` : ` ${liTxt}; `;
      }
      // Ensure block children inside <li> (e.g., <li><p>Tool</p><p>Desc</p></li>) stay separated
      if (copy.tagName === "LI") {
        const blocks = Array.from(copy.querySelectorAll("p, div"));
        for (let bi = 0; bi < blocks.length; bi++) {
          const blk = blocks[bi];
          const bTxt = tidy(blk.textContent);
          if (!bTxt) continue;
          if (bi === 0 && blocks.length > 1 && bTxt.length <= 56 && !/[.!?;:]$/.test(bTxt)) {
            blk.textContent = `${bTxt} — `;
          } else if (bi < blocks.length - 1 && !/[.!?;:]$/.test(bTxt)) {
            blk.textContent = `${bTxt}. `;
          } else {
            blk.textContent = `${bTxt} `;
          }
        }
      }
      // Replace <br> with " — " when preceded by a short label without sentence punctuation, else " "
      for (const br of Array.from(copy.querySelectorAll("br"))) {
        const prevText = tidy(br.previousSibling?.textContent || "");
        const prevIsShortLabel =
          prevText.length >= 2 &&
          prevText.length <= 56 &&
          !/[.!?;:]$/.test(prevText) &&
          (copy.tagName === "LI" ||
            (br.previousSibling?.nodeType === 1 &&
              /^(?:STRONG|B|A|SPAN)$/i.test(
                (br.previousSibling as Element).tagName || "",
              )));
        br.replaceWith(prevIsShortLabel ? " — " : " ");
      }
      // If a list item or paragraph starts with <strong>Concept Title</strong> followed by explanatory text
      if (copy.tagName === "LI" || copy.tagName === "P" || copy.tagName === "DD") {
        const firstEl = copy.firstElementChild;
        const hasLeadingTextBeforeFirstEl =
          copy.firstChild &&
          copy.firstChild !== firstEl &&
          tidy(copy.firstChild.textContent).length > 0;
        if (
          !hasLeadingTextBeforeFirstEl &&
          firstEl &&
          /^(?:STRONG|B|A)$/i.test(firstEl.tagName || "") &&
          firstEl.nextSibling
        ) {
          const lead = tidy(firstEl.textContent).replace(/[.!?:]+$/, "");
          const next = tidy(firstEl.nextSibling.textContent || "");
          if (
            lead.length >= 3 &&
            lead.length <= 68 &&
            next.length >= 16 &&
            !/[;—–-]$/.test(lead) &&
            !/^[:—–-]/.test(next)
          ) {
            firstEl.textContent = `${lead} — `;
          }
        }
      }
    }
    let rawContent = copy.textContent || "";
    if (tag === "LI") {
      rawContent = rawContent.replace(
        /^\s*([A-Za-z0-9.+#&/\-\s]{2,48}?)\s*\n+\s*([A-Z][^\n]{12,})/,
        "$1 — $2",
      );
    }
    let text = tidy(rawContent)
      .replace(/:\s*([A-Z])/g, ": $1")
      .replace(/;\s*$/g, "")
      .replace(/\s+;/g, ";")
      .replace(/\s+—\s+—\s+/g, " — ");
    if (!text) continue;
    // Skip inline SaaS pricing/CTA button rows embedded inside articles
    if (
      tag !== "H2" &&
      (/^(?:US?\$\d+\s+for\s+your\s+first\b.*?\$\d+\/month\.?|get started\s+(?:see the agent|how claim checking works)|missing something\?\s*ask us directly\.?)$/i.test(
        text,
      ) ||
        /\bUS?\$\d+\s+for\s+your\s+first\s+\d+\s+articles,\s+then\s+(?:a\s+flat\s+)?US?\$\d+\/month\b/i.test(
          text,
        ))
    ) {
      continue;
    }
    if (tag === "H2") {
      begin(text, false);
      continue;
    }
    if (!current) begin(title, true);
    const isH3 =
      tag === "H3" ||
      tag === "SUMMARY" ||
      tag === "DT" ||
      tag === "BUTTON";
    const isH4 = tag === "H4" || tag === "H5";
    const kind: ArticleSourceBlock["kind"] =
      isH3 || isH4
        ? "heading"
        : tag === "LI"
          ? "list"
          : tag === "TABLE"
            ? "table"
            : tag === "FIGCAPTION"
              ? "caption"
              : "paragraph";
    if (isH3) {
      h3 = text;
      h4 = "";
      hLevel = 3;
    } else if (isH4) {
      h4 = text;
      if (!h3) h3 = text;
      hLevel = 4;
    }
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
    const normalizedText =
      kind === "heading" || kind === "table"
        ? text
        : decontextualizeProse(text) || text;
    const blockId = `block-${sourceId(`${current!.id}:${blocksFound}:${normalizedText}`)}`;
    if (h3 || h4) blockHeadingLevels.set(blockId, hLevel);
    current!.blocks.push({
      id: blockId,
      kind,
      text: normalizedText,
      heading: h3 || undefined,
      ...(h4 ? { subheading: h4 } : {}),
    });
  }
  const useful = sections.filter((s) =>
    s.blocks.some((b) => b.kind !== "heading"),
  );
  // If the article has real H2 content sections, classify the pre-H2 lead-in hook as introduction
  // unless it already contains structured H3 subheadings or definition lists.
  if (
    preH2Section &&
    useful.some((s) => s !== preH2Section && s.role === "content")
  ) {
    const hasStructuredSubheadings = preH2Section.blocks.some(
      (b) => b.kind === "heading" || Boolean(b.heading),
    );
    const hasDefinitionList = preH2Section.blocks.some(
      (b) => b.kind === "list" && /\s[—–:]\s/.test(b.text),
    );
    if (!hasStructuredSubheadings && !hasDefinitionList) {
      preH2Section.role = "introduction";
    }
  }
  const hasMultipleContentSections =
    useful.filter((s) => s.role === "content").length >= 3;
  for (const s of useful) {
    const nonHeadingBlocks = s.blocks.filter((b) => b.kind !== "heading");
    const combinedText = `${s.title} ${nonHeadingBlocks.map((b) => b.text).join(" ")}`;
    const totalBodyChars = nonHeadingBlocks.reduce(
      (sum, b) => sum + b.text.length,
      0,
    );
    // Filter out bottom/inline product sales CTAs or 1-paragraph video embed blurbs when real article sections exist
    const isProductSalesCta =
      /\b(?:cancel in one click|publishes natively to wordpress,\s*webflow|US?\$\d+\/month|start your free trial)\b/i.test(
        combinedText,
      ) ||
      (/^answer-first,\s*source-checked articles every day/i.test(s.title) &&
        nonHeadingBlocks.length <= 2);
    const isShortVideoTeaser =
      hasMultipleContentSections &&
      nonHeadingBlocks.length === 1 &&
      totalBodyChars < 240 &&
      !/^\d+[.)]\s/.test(s.title);
    if ((isProductSalesCta || isShortVideoTeaser) && s.role === "content") {
      s.role = "promotional";
      continue;
    }
    s.archetype = classifySectionArchetype(s, title).archetype;
    if (s.archetype === "skip" && s.role === "content") {
      s.role = "introduction";
    }
  }
  const substantive = useful.filter((s) => s.role === "content");
  const rank = (s: ArticleSourceSection) => {
    const body = s.blocks.filter((b) => b.kind !== "heading");
    const defLists = body.filter(
      (b) => b.kind === "list" && /^.{3,76}\s[—–:]\s.{20,}$/.test(b.text),
    ).length;
    return (
      Math.min(
        body.reduce((n, b) => n + b.text.length, 0),
        2400,
      ) /
        120 +
      Math.min(new Set(body.map((b) => b.heading).filter(Boolean)).size, 5) *
        5 +
      Math.min(defLists, 5) * 4 +
      (/framework|how .*works|key (?:steps|components|pillars)|process|explained/i.test(
        s.title,
      )
        ? 10
        : 0)
    );
  };
  const pool = substantive.length ? substantive : useful;
  const recommended = [...pool].sort((a, b) => rank(b) - rank(a))[0];
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

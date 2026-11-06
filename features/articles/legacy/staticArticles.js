// features/articles/legacy/staticArticles.js
// Code-managed full SEO articles rendered through the exact same BlogLayout,
// SeoAndSchemaWrapper, TableOfContents, FAQSection, and ArticleQuickStart pipeline
// as Sanity Studio articles.

let keyCounter = 1;
function nextKey(prefix = "k") {
  keyCounter += 1;
  return `${prefix}_${keyCounter}`;
}

/**
 * Parses inline markdown (`**bold**`, `*italic*`, `` `code` ``, `[text](href)`)
 * into Sanity PortableText `children` spans and `markDefs`.
 */
export function parseInlineSpans(text = "") {
  const children = [];
  const markDefs = [];
  const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;

  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      children.push({
        _type: "span",
        _key: nextKey("s"),
        text: text.slice(lastIndex, match.index),
        marks: [],
      });
    }

    if (match[2] !== undefined) {
      // **bold**
      children.push({
        _type: "span",
        _key: nextKey("s"),
        text: match[2],
        marks: ["strong"],
      });
    } else if (match[3] !== undefined) {
      // *italic*
      children.push({
        _type: "span",
        _key: nextKey("s"),
        text: match[3],
        marks: ["em"],
      });
    } else if (match[4] !== undefined) {
      // `code`
      children.push({
        _type: "span",
        _key: nextKey("s"),
        text: match[4],
        marks: ["code"],
      });
    } else if (match[5] !== undefined && match[6] !== undefined) {
      // [label](href) — also parse nested **bold** or `code` inside link label
      const linkKey = nextKey("link");
      const rawHref = match[6].trim();
      const normalizedHref = rawHref.startsWith("https://doitwithai.tools/")
        ? rawHref.replace("https://doitwithai.tools", "")
        : rawHref;

      markDefs.push({
        _type: "link",
        _key: linkKey,
        href: normalizedHref,
      });

      const rawLabel = match[5];
      if (rawLabel.startsWith("**") && rawLabel.endsWith("**") && rawLabel.length > 4) {
        children.push({
          _type: "span",
          _key: nextKey("s"),
          text: rawLabel.slice(2, -2),
          marks: ["strong", linkKey],
        });
      } else {
        children.push({
          _type: "span",
          _key: nextKey("s"),
          text: rawLabel,
          marks: [linkKey],
        });
      }
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length || children.length === 0) {
    children.push({
      _type: "span",
      _key: nextKey("s"),
      text: text.slice(lastIndex),
      marks: [],
    });
  }

  return { children, markDefs };
}

export function block(style, text, extra = {}) {
  const { children, markDefs } = parseInlineSpans(text);
  return {
    _type: "block",
    _key: nextKey("b"),
    style,
    markDefs,
    children,
    ...extra,
  };
}

export const p = (text) => block("normal", text);
export const h2 = (text) => block("h2", text);
export const h3 = (text) => block("h3", text);
export const h4 = (text) => block("h4", text);
export const quote = (text) => block("blockquote", text);
export const bullet = (text, level = 1) =>
  block("normal", text, { listItem: "bullet", level });
export const numberItem = (text, level = 1) =>
  block("normal", text, { listItem: "number", level });

export function tableBlock(caption, rows) {
  return {
    _type: "table",
    _key: nextKey("tbl"),
    caption,
    headerRows: 1,
    rows: rows.map((cells, rIdx) => ({
      _key: nextKey(`r${rIdx}`),
      cells: cells.map((cellText) => {
        const str = String(cellText ?? "");
        if (/(\*\*|\*|`|\[[^\]]+\]\([^)]+\))/.test(str)) {
          return block("normal", str);
        }
        return str;
      }),
    })),
  };
}

export function toolPromo({
  badge = "Do It With AI Tools",
  title,
  description,
  ctaText = "Open Free Tool",
  link,
  secondaryText,
  secondaryLink,
  image,
  imageAlt,
}) {
  return {
    _type: "toolPromoCard",
    _key: nextKey("promo"),
    badge,
    title,
    description,
    ctaText,
    link,
    secondaryText,
    secondaryLink,
    image,
    imageAlt,
  };
}

export function imageSlot({
  label = "Visual Placeholder",
  title,
  captureInstructions,
  recommendedFilename,
  altText,
}) {
  return {
    _type: "imagePlaceholder",
    _key: nextKey("imgslot"),
    label,
    title,
    captureInstructions,
    recommendedFilename,
    altText,
  };
}

function buildHeadingsAndToc(contentBlocks) {
  const headings = [];
  const tableOfContents = [];
  let currentH2 = null;

  for (const b of contentBlocks) {
    if (!b || b._type !== "block") continue;
    if (!["h1", "h2", "h3", "h4", "h5", "h6"].includes(b.style)) continue;
    const text = (b.children || [])
      .map((c) => c.text || "")
      .join("")
      .trim();
    if (!text) continue;

    headings.push({
      text,
      level: b.style,
      anchor: text.toLowerCase(),
    });

    if (b.style === "h2") {
      currentH2 = {
        _key: nextKey("toc"),
        heading: text,
        subheadings: [],
      };
      tableOfContents.push(currentH2);
    } else if (b.style === "h3" && currentH2) {
      currentH2.subheadings.push({
        _key: nextKey("subtoc"),
        subheading: text,
      });
    }
  }

  return { headings, tableOfContents };
}

// ============================================================================
// ARTICLE 1: /ai-seo/what-to-do-after-keyword-research
// ============================================================================
const afterKeywordResearchContent = [
  p(
    "After completing keyword research, the next step is to turn your raw keyword list into an organized, page-by-page content and optimization plan before writing a single word. Start by cleaning out irrelevant or outdated queries, analyzing the search intent behind each phrase, and grouping related keywords into topic clusters around a shared reader task. From there, map each keyword cluster to an existing URL you can upgrade or a new page you need to create, prioritize the best-fit opportunities, build a structured content brief, write and optimize the page with natural on-page keyword placement and internal links, and measure impressions, clicks, and positions in [Google Search Console](/ai-seo/check-google-keyword-rankings)."
  ),
  p(
    "Collecting hundreds of keywords in a spreadsheet is the easy part—the difficult part is deciding which searches actually deserve to be written and which page on your website should serve each task."
  ),
  p(
    "When **Do It With AI Tools** first launched, new pages often started with an idea that sounded helpful on paper: an SEO tutorial, a prompt template, or a browser utility. Serving the reader mattered from day one, yet topics were frequently chosen before checking real search demand, query phrasing, and page-level competition."
  ),
  p(
    "During the November 2026 SEO audit, the **Do It With AI Tools** team brought keyword exports and Google Search Console query logs directly into the editorial planning workflow. That data created a brand-new challenge: dozens of phrases looked promising on the surface, but some belonged on existing tool pages, others required a standalone step-by-step guide, and several did not fit the website's audience at all."
  ),
  p(
    "Here is the exact 10-step workflow **Do It With AI Tools** used to turn that raw keyword research into an actionable content plan—and how you can apply the same system to your own keyword list."
  ),

  imageSlot({
    label: "Visual Placeholder #1 — Post-Research Workflow Overview",
    title: "The 10-Step Workflow After Keyword Research (From Raw CSV to Measured Rankings)",
    captureInstructions:
      "Clean horizontal or 2-row workflow diagram showing: (1) Clean & Filter List → (2) Verify Search Intent → (3) Cluster by Reader Task → (4) Map to Existing or New URLs → (5) Prioritize Queue → (6) Build Content Brief → (7) Draft with Evidence & ChatGPT → (8) Place Keywords Naturally → (9) Add Internal Links & Publish → (10) Measure in GSC.",
    recommendedFilename: "what-to-do-after-keyword-research-10-step-workflow.webp",
    altText:
      "Ten-step SEO workflow diagram showing what to do after keyword research from cleaning a raw keyword list to measuring rankings in Google Search Console",
  }),

  h2("1. Clean your keyword research before choosing what to write"),
  p(
    "An exported keyword spreadsheet is a collection of possibilities, not an automatic publishing queue. Review and filter the raw list before assigning any topic to a writer or opening a blank document."
  ),
  p(
    "For every keyword on your sheet, ask whether your website can genuinely help the person making that search. Check for accidental duplicates, unrelated meanings, obsolete years, and queries that require a product, software feature, or service your business does not offer."
  ),
  p(
    "During the November 2026 **Do It With AI Tools** audit, the raw research export included the following real examples:"
  ),

  tableBlock(
    "Real Keyword Filtering Decisions from the Do It With AI Tools Audit (November 2026)",
    [
      [
        "Keyword from the audit",
        "Supplied volume",
        "Supplied KD",
        "Decision in the content plan",
      ],
      [
        "`keyword grouping software`",
        "260",
        "6",
        "Improve the existing [Keyword Clustering Tool](/tools/keyword-clustering-tool) page",
      ],
      [
        "`semantic keyword grouping`",
        "260",
        "14",
        "Cover within the same grouping-tool opportunity",
      ],
      [
        "`keyword grouper software`",
        "210",
        "10",
        "Group with related tool wording on the clustering utility",
      ],
      [
        "`what to do after keyword research`",
        "320",
        "4",
        "Create this dedicated step-by-step supporting guide",
      ],
      [
        "`market research resume keywords`",
        "320",
        "7",
        "Exclude from the SEO content queue (job-seeker intent)",
      ],
      [
        "`best keyword research tools 2015`",
        "260",
        "2",
        "Exclude the obsolete-year opportunity",
      ],
    ]
  ),

  p(
    "These figures came from the keyword datasets recorded in the November 2026 **Do It With AI Tools** audit. Because the target-country database was not locked to a single region for every row in that batch, treat the numbers as planning estimates rather than universal traffic guarantees. This real example documents editorial planning decisions rather than a finished traffic claim."
  ),
  p(
    "Notice why two low-difficulty keywords were immediately cut: the query `market research resume keywords` contains the words *research* and *keywords*, but the searcher is writing a job application—a completely different task from organizing website SEO keywords. Similarly, `best keyword research tools 2015` had a supplied Keyword Difficulty (KD) of just `2`, yet publishing an outdated 2015 roundup would waste crawl budget and fail current readers."
  ),
  p(
    "Removing those off-topic rows immediately gave the remaining high-fit opportunities the focus they deserved."
  ),

  h3("Keep the original export and a reason for each decision"),
  p(
    "Always save an untouched master copy of your raw keyword export. In your active working tab, keep the keyword, data provider, target country/market, collection date, available metrics, and a short column recording *why* each term was kept, merged, or excluded."
  ),
  p(
    "Remove exact duplicates while preserving meaningful modifiers that signal a different user need—such as a software category, local city, or specific workflow stage. Leave missing measurements blank rather than replacing an unknown KD with `0`: an unmeasured difficulty score is not a zero-competition keyword."
  ),

  h2("2. Match search intent before deciding on a content format"),
  p(
    "Once irrelevant rows are removed, work out what the searcher actually wants to accomplish. In SEO, this is **search intent**: the real-world job behind the words typed into Google."
  ),
  p("Compare the difference between these two searches from the audit:"),
  bullet(
    "**\"Keyword grouping software\"** signals someone looking for an interactive utility they can use right away or evaluating software."
  ),
  bullet(
    "**\"What to do after keyword research\"** signals someone who already has a list of keywords and needs a clear sequence of decisions, templates, and next actions."
  ),
  p(
    "Wording clues give you a strong starting hypothesis, but they are never a substitute for inspecting live Google search results. Search representative queries in your target market and study Page 1: are the top results interactive calculators, step-by-step tutorials, software comparison roundups, category hubs, or product landing pages? Open the top three results and note what a visitor can actually complete on those pages."
  ),
  p(
    "Instead of writing a vague label like *\"Informational\"* in your spreadsheet, write a specific task note such as: *\"The reader needs a reviewed keyword-to-page action plan, including how to decide between updating an existing page and writing a new article.\"* Specific intent notes ensure your title tag, opening paragraph, and call-to-action all pull in the same direction."
  ),
  p(
    "To speed up this step, the free [Search Intent Checker](/tools/search-intent-checker) on **Do It With AI Tools** helps classify query wording and supplied SERP notes into primary and secondary intent buckets. Always confirm borderline terms against live search results before locking in your page format."
  ),

  toolPromo({
    badge: "STEP 2 HELPER • BROWSER UTILITY",
    title: "Classify Your Keyword List by Search Intent in Seconds",
    description:
      "Paste your cleaned keyword list into the free Search Intent Checker to separate tool queries from step-by-step guides and commercial comparisons before choosing page formats.",
    ctaText: "Open Search Intent Checker",
    link: "/tools/search-intent-checker",
    secondaryText: "Explore Search Intent Prompts",
    secondaryLink: "/prompts/chatgpt-prompts-for-search-intent",
  }),

  h2("3. Cluster related keywords around a shared reader task"),
  p(
    "After clarifying search intent, group the keywords that can be satisfied by the exact same page. This process—**keyword clustering** (or keyword grouping)—prevents you from publishing five thin pages that compete against each other in Google."
  ),
  p(
    "In the **Do It With AI Tools** plan, `keyword grouping software`, `keyword grouper software`, and `semantic keyword grouping` all pointed to one shared reader task: organizing a raw keyword list into topic groups. Instead of spinning up a separate landing page for every wording variation, all three terms were consolidated into a single upgrade plan for the existing [Keyword Clustering Tool](/tools/keyword-clustering-tool)."
  ),
  p(
    "Consolidating those terms also created an editorial responsibility: the tool page must accurately explain how its grouping method works and where human review is still required. Targeting a variation never justifies promising automated features a tool does not actually perform."
  ),

  h3("Use ChatGPT and clustering tools as a first draft you can inspect"),
  p(
    "You can sort a 20-row list manually in Google Sheets or Excel, or use the free [Keyword Clustering Tool](/tools/keyword-clustering-tool) on **Do It With AI Tools** to generate editable topic clusters from your pasted keyword list. Inside the tool, you can inspect every proposed group, split or merge clusters, record target URLs, and export a clean implementation sheet."
  ),
  p(
    "Keep in mind that rule-based and ChatGPT-assisted grouping tools analyze wording and topical overlap—they do not compare live top-10 ranking URLs on Google. Keep your search volume and KD columns in your master spreadsheet, and write one clear sentence for each cluster explaining the shared reader task. If your sentence requires two or three unrelated outcomes (for example, *\"learn the history of title tags\"* and *\"use an interactive meta title generator right now\"*), split the cluster into separate pages: a tutorial guide like the [Meta Title Optimization Guide](/ai-seo/meta-title) and an interactive utility like the [Meta Title Generator](/tools/meta-title-generator)."
  ),

  toolPromo({
    badge: "PAUSE BEFORE EXPANDING YOUR LIST",
    title: "Make the reader's next task clear",
    description:
      "Use six focused search intent prompts to review mixed queries, compare evidence, and choose a useful page format before writing.",
    ctaText: "Explore the search intent prompts",
    link: "/prompts/chatgpt-prompts-for-search-intent",
    image: "/prompts/search-intent-prompts-hero.webp",
    imageAlt: "Search intent prompt guide with a desktop prompt mockup.",
  }),

  h3("Leave uncertain terms in a review queue"),
  p(
    "Not every keyword has an obvious home on day one. Keeping a dedicated *Review Queue* tab lets you hold ambiguous queries until you inspect live SERPs, rather than forcing a weak page assignment just to finish the spreadsheet. You can also use the curated [Topic Clustering & Topical Authority Prompts](/prompts/topic-clustering-topical-authority-prompts) with ChatGPT to stress-test your proposed topic buckets."
  ),

  toolPromo({
    badge: "STEP 3 HELPER • KEYWORD GROUPING UTILITY",
    title: "Group Raw Keywords into Topic Clusters & Page Assignments",
    description:
      "Turn an unorganized keyword export into clean topic clusters with editable group names, intent labels, and target URL mapping.",
    ctaText: "Use Free Keyword Clustering Tool",
    link: "/tools/keyword-clustering-tool",
    secondaryText: "Read ChatGPT Keyword Research Guide",
    secondaryLink: "/ai-seo/chatgpt-keyword-research",
  }),

  h2("4. Map keyword groups to existing pages before creating new ones"),
  p(
    "Once your keyword clusters are defined, assign each cluster a destination URL. **Keyword mapping** is the bridge between research and production—and the golden rule is to check your existing pages *before* planning a brand-new URL."
  ),
  p(
    "In the **Do It With AI Tools** audit, the grouping-software cluster already had a natural home on `/tools/keyword-clustering-tool`, whereas the broader workflow question (`what to do after keyword research`) required this dedicated guide. Meanwhile, discovery-focused queries belonged on the existing [ChatGPT Keyword Research Guide](/ai-seo/chatgpt-keyword-research) and [AI vs. Traditional Keyword Research Comparison](/ai-seo/ai-vs-traditional-keyword-research)."
  ),

  tableBlock(
    "Keyword-to-Page Mapping Matrix from the Do It With AI Tools Content Plan",
    [
      [
        "Shared reader task",
        "Mapped destination URL",
        "Content action",
        "Editorial reason",
      ],
      [
        "Organize and group a supplied keyword list",
        "[/tools/keyword-clustering-tool](/tools/keyword-clustering-tool)",
        "**Improve existing tool page**",
        "The site already offers a working clustering utility that serves this exact task",
      ],
      [
        "Turn completed keyword research into a content plan",
        "[/ai-seo/what-to-do-after-keyword-research](/ai-seo/what-to-do-after-keyword-research)",
        "**Create new supporting guide**",
        "Readers need the complete 10-step post-research workflow, not only a grouping box",
      ],
      [
        "Generate and validate seed keyword ideas with ChatGPT",
        "[/ai-seo/chatgpt-keyword-research](/ai-seo/chatgpt-keyword-research)",
        "**Retain & cross-link**",
        "Keyword discovery precedes post-research planning; cross-linking connects both stages",
      ],
      [
        "Check where existing pages rank in Google",
        "[/ai-seo/check-google-keyword-rankings](/ai-seo/check-google-keyword-rankings)",
        "**Create companion measurement guide**",
        "Measuring post-publish rankings is the natural follow-up after publishing mapped pages",
      ],
      [
        "Add market research keywords to a job resume",
        "No destination on site",
        "**Exclude**",
        "Outside the SEO and content marketing workflow scope",
      ],
    ]
  ),

  toolPromo({
    badge: "START WITH A CLEAR RESEARCH PROCESS",
    title: "Put your keyword prompts into a useful workflow",
    description:
      "Follow our guide to exploring keyword ideas, reviewing evidence, and choosing a clear purpose for each page.",
    ctaText: "Read the keyword research guide",
    link: "/ai-seo/chatgpt-keyword-research",
    image: "https://cdn.sanity.io/images/qyshio4a/production/cf24e38598d79ac7da9528c47648168f24667c61-1400x788.png",
    imageAlt: "Cover of guide to keyword research with ChatGPT.",
  }),

  h3("Choose a specific editorial action, not just a URL"),
  p("Assign every keyword cluster one of five concrete actions:"),
  bullet(
    "**Improve an existing page** that already targets the same core task but lacks depth, examples, or clear subheadings."
  ),
  bullet(
    "**Create a new page** when the reader needs a distinct format or workflow that no current URL satisfies."
  ),
  bullet(
    "**Investigate overlapping coverage** when two existing URLs split impressions for the same query."
  ),
  bullet(
    "**Hold for future release** when you need original test data, screenshots, or a new tool feature first."
  ),
  bullet(
    "**Exclude** when the query does not serve your target audience."
  ),
  p(
    "Be careful not to merge two pages just because both receive impressions for a broad term. Inspect their primary purpose and conversion role first. If you have a Google Search Console query-and-page export, run it through the free [Keyword Cannibalization Finder](/tools/keyword-cannibalization-finder) on **Do It With AI Tools** to spot genuine URL conflicts before consolidating or redirecting anything."
  ),

  imageSlot({
    label: "Visual Placeholder #2 — Keyword Mapping Spreadsheet",
    title: "Annotated Keyword-to-Page Mapping Sheet (Improve vs. Create vs. Exclude)",
    captureInstructions:
      "Screenshot of the Do It With AI Tools keyword plan spreadsheet showing Cluster Name, Primary Keyword, Search Intent, Target URL, Action Badge (Improve Existing / Create New / Exclude), and Editorial Notes.",
    recommendedFilename: "keyword-to-page-mapping-spreadsheet-example.webp",
    altText:
      "Keyword mapping spreadsheet assigning keyword clusters to existing tool pages and new SEO guides with action labels",
  }),

  h2("5. Prioritize content you can make useful and distinctive"),
  p(
    "When you have 20 or 50 mapped pages on your spreadsheet, you still can't publish all of them today. Prioritization decides which page earns your focus first."
  ),
  p(
    "In the **Do It With AI Tools** plan, `what to do after keyword research` had a supplied KD of `4` and a monthly volume estimate of `320`. Low competition made it attractive, but the decisive factor was **capability fit**: the site already had live interactive tools for intent checking, clustering, content briefing, internal linking, and GSC rank auditing, plus real audit decisions that could be shown transparently."
  ),
  p("Score each candidate topic against these five practical questions:"),
  numberItem(
    "**Audience fit:** Does this task directly help the website's target audience and users?"
  ),
  numberItem(
    "**Promise delivery:** Can the proposed page completely solve what its headline promises without fluff?"
  ),
  numberItem(
    "**Information gain:** Does the team have original data, real workflow examples, screenshots, or interactive utilities that make the answer noticeably better than existing Page-1 results?"
  ),
  numberItem(
    "**Existing search traction:** Does the website already earn impressions between Positions 8 and 20 for closely related queries in Google Search Console?"
  ),
  numberItem(
    "**Production effort vs. impact:** Is the time required to produce this page sensible compared to upgrading an existing striking-distance URL?"
  ),
  p(
    "Sort your approved topics into four simple buckets—**Now**, **Next**, **Research Needed**, and **Hold**—and pair related tool upgrades with their supporting guides. If your site already has Search Console data, drop your export into the free [GSC Striking Distance Keyword Finder](/tools/gsc-striking-distance-finder) to see which existing pages are sitting at Positions 8–20 and can be pushed onto Page 1 before you write new articles from scratch."
  ),

  toolPromo({
    badge: "STEP 4 & 5 HELPER • AUDIT UTILITIES",
    title: "Audit Existing Pages Before You Write New Ones",
    description:
      "Check whether two of your existing URLs are splitting rankings with the Keyword Cannibalization Finder, or uncover Page-2 quick wins with the GSC Striking Distance Finder.",
    ctaText: "Check Keyword Cannibalization",
    link: "/tools/keyword-cannibalization-finder",
    secondaryText: "Open GSC Striking Distance Finder",
    secondaryLink: "/tools/gsc-striking-distance-finder",
  }),

  h2("6. Turn the selected keyword cluster into a structured content brief"),
  p(
    "A keyword tells you what someone typed into Google; a **content brief** defines what the finished page must help that person accomplish. Jumping straight from a keyword string into drafting is the #1 reason articles wander off-topic."
  ),
  p(
    "Here is the exact editorial brief created for this article during the **Do It With AI Tools** planning sprint:"
  ),
  bullet(
    "**Target reader:** A website owner, blogger, or marketer who has exported a list of keywords and needs to know what to do next."
  ),
  bullet(
    "**Reader outcome:** Turn a raw keyword list into clean clusters, mapped page decisions (improve vs. create), a prioritized publishing queue, and a post-publish GSC measurement loop."
  ),
  bullet(
    "**Primary keyword:** `what to do after keyword research` (supported naturally by `how to use keywords after keyword research` and `turning keyword research into a content plan`)."
  ),
  bullet(
    "**Page format:** Chronological, step-by-step implementation guide anchored by real decisions from the November 2026 **Do It With AI Tools** SEO audit."
  ),
  bullet(
    "**Original contribution (Information Gain):** Show the exact keywords retained, grouped, mapped to `/tools/keyword-clustering-tool`, or excluded (`market research resume keywords`, `best keyword research tools 2015`), and explain the reasoning behind each call."
  ),
  bullet(
    "**Scope boundary:** Link readers to the [ChatGPT Keyword Research Guide](/ai-seo/chatgpt-keyword-research) for initial seed discovery, and link to [How to Check Keyword Rankings in Google](/ai-seo/check-google-keyword-rankings) for deep post-publish rank tracking."
  ),
  bullet(
    "**Immediate next action for the reader:** Take one reviewed keyword cluster, record its target URL decision, and open the [Keyword Clustering Tool](/tools/keyword-clustering-tool) or [SEO Content Brief Generator](/tools/seo-content-brief-generator)."
  ),
  p(
    "You can generate this exact structure for any topic in under two minutes using the free [SEO Content Brief Generator](/tools/seo-content-brief-generator), and then map out your H2 and H3 hierarchy in chronological decision order using the [Article Outline Generator](/tools/article-outline-generator)."
  ),

  toolPromo({
    badge: "STEP 6 HELPER • CONTENT PLANNING",
    title: "Build a Complete SEO Content Brief & H2/H3 Outline",
    description:
      "Turn your primary keyword cluster, search intent notes, and unique evidence into a structured writer handoff with the SEO Content Brief Generator and Article Outline Generator.",
    ctaText: "Open SEO Content Brief Generator",
    link: "/tools/seo-content-brief-generator",
    secondaryText: "Generate H2/H3 Article Outline",
    secondaryLink: "/tools/article-outline-generator",
  }),

  h2("7. Write useful content with your own evidence and ChatGPT assistance"),
  p(
    "With your brief locked in, draft the page by answering the main question in the very first paragraph (see the [Blog Introduction Guide](/ai-seo/blog-introduction)) and then walking through each step with real examples, tables, and trade-offs."
  ),
  p(
    "Generic advice like *\"write high-quality content that matches search intent\"* does not help a reader make a decision. Showing *why* `market research resume keywords` was cut, *why* three keyword-grouping phrases were consolidated onto a single tool URL, and *how* to structure a page brief gives readers a concrete pattern they can copy immediately."
  ),

  h3("Use ChatGPT to organize the workflow, then verify every claim"),
  p(
    "ChatGPT and specialized SEO utilities are powerful accelerators when you supply the real data and constraints first. During the **Do It With AI Tools** audit, ChatGPT helped stress-test cluster boundaries, spot missing steps in briefs, and tighten draft prose—while human editorial review controlled all data tables, tool capabilities, and strategic calls."
  ),
  p(
    "When using ChatGPT to review a raw keyword list, use a constraint-driven prompt that forbids fabricated metrics:"
  ),
  quote(
    "Review this supplied keyword list for a website serving [describe audience] with these existing pages: [list URLs and their purpose]. Group the keywords by shared reader task and propose one action per group: Improve Existing Page, Create New Page, Investigate Overlap, Hold, or Exclude. Preserve all supplied volume and KD figures exactly as given and flag any missing data. Do not invent search volume, keyword difficulty, live Google SERP rankings, or traffic outcomes. Explain any ambiguous queries that require a live SERP check."
  ),
  p(
    "Google's official [guidance on using generative AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content) makes it clear that automation itself is not against Google Search rules—what matters is accuracy, originality, E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness), and genuine value for searchers. Never publish unreviewed AI text that invents statistics or rehashes ten other blog posts without adding your own evidence. You can audit your draft's unique depth before publishing with the free [Information Gain Auditor](/tools/information-gain-auditor) and [E-E-A-T Content Auditor](/tools/eeat-content-auditor)."
  ),

  h3("Structure your page for Google AI Overviews as well as human readers"),
  p(
    "When someone searches a workflow question like `what to do after keyword research`, Google frequently displays an **AI Overview (Position Zero)** at the very top of the search results summarizing the core steps (*group and cluster keywords, analyze search intent, map keywords to pages, optimize on-page elements, and track performance*)."
  ),
  p(
    "Google's official [AI features documentation](https://developers.google.com/search/docs/appearance/ai-features) and [generative search optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) emphasize that pages cited in AI Overviews must be indexed, eligible for standard snippets, and structured clearly. To maximize both AI Overview citation eligibility and human click-throughs:"
  ),
  bullet(
    "**Place a chronological 40–60 word direct answer right under your H1** so both readers and language models can extract the complete sequence immediately."
  ),
  bullet(
    "**Use clear, action-oriented H2 and H3 headings** that mirror the exact steps of the process (and validate your hierarchy with the [Heading Structure Analyzer](/tools/heading-structure-analyzer))."
  ),
  bullet(
    "**Present comparisons and audits in clean HTML tables** (`<table><thead><tbody>`) rather than flattening everything into dense paragraphs."
  ),
  bullet(
    "**Pair your written explanation with interactive tools and templates** that a static AI summary cannot replicate on the SERP—giving users a compelling reason to click through to your site."
  ),

  h2("8. Place your keywords naturally across your website and on-page elements"),
  p(
    "A common question after keyword research is *\"Where do I actually put these keywords?\"* Keyword placement starts at the website architecture level before you ever tweak a sentence."
  ),
  p(
    "Every page type on your site has a distinct job: the homepage introduces your brand and core platform; category hubs organize topic areas; interactive tool or product pages complete a specific action; and articles teach a complete process. Assigning each cluster to the right page type keeps your site from competing with itself."
  ),

  tableBlock(
    "How to Use Keywords Naturally Across Different Website Page Types",
    [
      [
        "Website area",
        "Primary job of the page",
        "How Do It With AI Tools applies keyword research",
      ],
      [
        "**Homepage** (`/`) ",
        "Explain the brand, audience, and core platform capabilities",
        "Highlights free AI SEO, content, and Search Console workflow tools with direct paths to major tasks",
      ],
      [
        "**Category / Hub page** (`/ai-seo`, `/tools`)",
        "Help visitors browse and choose the right guide or utility",
        "Organizes SEO guides and interactive utilities around keyword research, on-page optimization, and GSC analysis",
      ],
      [
        "**Interactive Tool page** (`/tools/keyword-clustering-tool`)",
        "Let the user complete a specific task immediately in the browser",
        "Targets `keyword clustering tool`, `keyword grouping tool`, and `keyword grouper` with a working utility + workflow FAQs",
      ],
      [
        "**Step-by-Step Article** (`/ai-seo/what-to-do-after-keyword-research`)",
        "Answer a multi-step process question with real examples and tables",
        "Walks through the 10-step post-keyword-research workflow using the November 2026 audit case study",
      ],
      [
        "**Navigation, Breadcrumbs & Internal Links**",
        "Show clear hierarchy and guide readers to the next logical step",
        "Connects `Home → AI SEO → Article` and links directly to the paired clustering, brief, and GSC tools",
      ],
    ]
  ),

  h3("Title tag, H1 heading, and URL slug"),
  p(
    "Your `<title>` tag, visible `H1` heading, and URL slug are the three strongest topical signals on the page. Google's official [title link documentation](https://developers.google.com/search/docs/appearance/title-link) recommends concise, descriptive titles that accurately state the page's subject without repetitive keyword stuffing. Your title tag and H1 should align closely in promise while staying within pixel limits:"
  ),
  bullet(
    "**SEO Title Tag (`<title>`):** `What to Do After Keyword Research: 10-Step SEO Content Plan` (see the [Meta Title Guide](/ai-seo/meta-title) and test yours in the [Meta Title Generator](/tools/meta-title-generator))"
  ),
  bullet(
    "**Visible H1 Heading:** `What to Do After Keyword Research: Turn Your List Into a Content Plan` (follow the [H1 Heading SEO Guide](/ai-seo/h1-heading) and [H1 Heading Generator](/tools/h1-heading-generator))"
  ),
  bullet(
    "**URL Slug:** `/ai-seo/what-to-do-after-keyword-research` (keep new URLs short, lowercase, and hyphen-separated using the [SEO Slug URL Guide](/ai-seo/write-slug-urls) and [Slug Generator](/tools/slug-generator); never change an existing ranking URL just to squeeze in an extra word without a full redirect reason)"
  ),

  h3("Introduction, H2/H3 subheadings, and body copy"),
  p(
    "Include your primary keyword naturally in the opening 100 words where you directly answer the reader's question. Use your `H2` and `H3` subheadings to break down the logical steps of the task (`Clean your keyword research`, `Match search intent`, `Cluster related keywords`, `Map keyword groups to existing pages`), and weave secondary phrases (`keyword mapping`, `search intent`, `content brief`, `topic clusters`) into the sections where you actually explain those concepts."
  ),
  p(
    "Read your draft out loud before publishing: if a keyword phrase sounds forced or robotic, rewrite the sentence in plain English. There is no magic keyword-density percentage that unlocks Page 1."
  ),

  h3("Meta description, image filenames, alt text, and FAQs"),
  p(
    "Write a specific `<meta name=\"description\">` that summarizes the outcome and invites the searcher to click (learn how in the [Meta Description Guide](/ai-seo/meta-description) and test pixel length in the [Meta Description Generator](/tools/meta-description-generator)). While Google's official [snippet documentation](https://developers.google.com/search/docs/appearance/snippet) notes that Google may dynamically pull text from the page body when it better matches a query, a sharp meta description improves click-through rates whenever it is shown."
  ),
  p(
    "When adding screenshots or diagrams, follow [Google's image SEO documentation](https://developers.google.com/search/docs/appearance/google-images): use descriptive filenames like `keyword-to-page-mapping-spreadsheet-example.webp` instead of `IMG_0042.png`, and write clear, accessible alt text that describes what the graphic actually shows (or generate clean attributes with the [Image Alt Text Generator](/tools/image-alt-text-generator)). Finally, answer genuine follow-up questions in an on-page FAQ section backed by matching `FAQPage` structured data."
  ),

  h2("9. Connect the page with bidirectional internal links and publish carefully"),
  p(
    "Once your page is drafted and optimized, connect it to the rest of your website using **bidirectional internal links**:"
  ),
  bullet(
    "**Outgoing internal links (from this page to next steps):** Link readers naturally to the tools and companion guides that help them execute each step—such as the [Keyword Clustering Tool](/tools/keyword-clustering-tool), [Search Intent Checker](/tools/search-intent-checker), [SEO Content Brief Generator](/tools/seo-content-brief-generator), and [How to Check Keyword Rankings in Google](/ai-seo/check-google-keyword-rankings)."
  ),
  bullet(
    "**Incoming internal links (from existing pages to this new page):** Open your existing related articles—such as the [ChatGPT Keyword Research Guide](/ai-seo/chatgpt-keyword-research) and [AI vs. Traditional Keyword Research](/ai-seo/ai-vs-traditional-keyword-research)—and add contextual links pointing forward to this new implementation guide."
  ),
  p(
    "Following Google's official [crawlable link guidelines](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), always use descriptive anchor text that tells readers and crawlers exactly what the destination page covers (for example, *\"use the free Keyword Clustering Tool to group your list\"* rather than *\"click here\"*). You can scan your draft for missing internal link placements using the free [Internal Link Opportunity Finder](/tools/internal-link-opportunity-finder) and run a final pre-publish check with the [On-Page AI SEO Analyzer](/tools/on-page-ai-seo-analyzer)."
  ),
  p("Before hitting publish, run through this 6-point pre-flight checklist:"),
  numberItem(
    "The opening paragraph answers the primary question clearly in chronological order."
  ),
  numberItem(
    "Every data table, metric, and case-study example is accurately labeled."
  ),
  numberItem(
    "Referenced tools and templates match their real live functionality."
  ),
  numberItem(
    "All H2/H3 headings, tables, and callout cards render cleanly on mobile screens."
  ),
  numberItem(
    "Canonical URL, meta title, meta description, and JSON-LD schema (`Article` + `FAQPage` + `BreadcrumbList`) are valid."
  ),
  numberItem(
    "Bidirectional internal links are live and resolve with `200 OK` status codes."
  ),

  toolPromo({
    badge: "STEP 8 & 9 HELPER • ON-PAGE & LINK AUDIT",
    title: "Run a Pre-Publish On-Page SEO & Internal Link Check",
    description:
      "Verify your title tag, H1/H2 hierarchy, entity coverage, and internal link anchor text before publishing using the free On-Page AI SEO Analyzer and Internal Link Opportunity Finder.",
    ctaText: "Open On-Page AI SEO Analyzer",
    link: "/tools/on-page-ai-seo-analyzer",
    secondaryText: "Find Internal Link Opportunities",
    secondaryLink: "/tools/internal-link-opportunity-finder",
  }),

  h2("10. Measure performance in Google Search Console before making changes"),
  p(
    "Publishing the page is the beginning of the feedback loop, not the finish line. Once your URL is live and submitted in [Google Search Console](https://search.google.com/search-console/about), monitor indexation first and then track **Impressions**, **Clicks**, **CTR**, and **Average Position** over 28-day windows (see the complete companion tutorial on [How to Check Ranking for Keywords in Google](/ai-seo/check-google-keyword-rankings))."
  ),
  p(
    "Use Google's official [Search Console metric documentation](https://support.google.com/webmasters/answer/7042828) and filter by specific page, query, country, and device before diagnosing what to update next:"
  ),

  tableBlock(
    "Post-Publish Google Search Console Diagnostic Playbook",
    [
      [
        "What you observe in Search Console",
        "What to investigate and optimize next",
      ],
      [
        "**The URL is not indexed after 7–14 days**",
        "Inspect URL access, `noindex` directives, canonical tags, sitemap inclusion, and incoming internal links from indexed pages",
      ],
      [
        "**Impressions appear at Positions 11–20 (Page 2)**",
        "Add a dedicated question-matched H2/H3 for the exact striking-distance query, deepen examples, and add 3–5 internal links",
      ],
      [
        "**Page-1 rankings (Positions 1–10) earn <2% CTR**",
        "Inspect the live SERP for AI Overviews and rewrite your `<title>` and `<meta name=\"description\">` using the [GSC CTR Optimizer](/tools/gsc-ctr-optimizer)",
      ],
      [
        "**Visitors read the guide but rarely click into paired tools**",
        "Place a clear above-the-fold Quick Start box and align mid-article tool callouts with the exact step being explained",
      ],
      [
        "**An older ranking page loses clicks over 60–90 days**",
        "Compare consistent country/query filters and audit with the [Content Decay & Refresh Analyzer](/tools/content-decay-refresh-analyzer)",
      ],
    ]
  ),

  p(
    "Avoid rewriting a newly published article after just a few days of impressions. Unless there is a technical indexing bug or factual error, give search engines 3 to 4 weeks of consistent impression data before running a targeted refresh."
  ),

  imageSlot({
    label: "Visual Placeholder #3 — Post-Publish GSC Measurement Loop",
    title: "Google Search Console Page-Level Query Inspection After Publishing",
    captureInstructions:
      "Screenshot of Google Search Console Performance report filtered to a single article URL showing Impressions, Clicks, CTR, and Average Position across its mapped keyword cluster.",
    recommendedFilename: "gsc-post-publish-keyword-cluster-measurement.webp",
    altText:
      "Google Search Console performance report filtered by page URL to measure impressions, clicks, and average position after keyword research implementation",
  }),

  h2("11. Common mistakes to avoid after keyword research"),
  p(
    "Even strong keyword research can fail during execution if the editorial plan gets sidelined. Keep this 7-point checklist beside your content calendar:"
  ),

  tableBlock(
    "7 Common Post-Keyword-Research Mistakes and What to Do Instead",
    [
      [
        "Common mistake after keyword research",
        "Better editorial action",
      ],
      [
        "Choosing a topic solely because Keyword Difficulty (KD) is low",
        "Confirm audience fit and your ability to provide a genuinely useful, evidence-backed answer (e.g., excluding `best keyword research tools 2015`)",
      ],
      [
        "Publishing a separate article for every close keyword variation",
        "Group variations around a shared reader task so one authoritative page ranks for the entire cluster",
      ],
      [
        "Writing a brand-new post without checking existing pages first",
        "Audit your current URLs and upgrade an existing tool or guide when it already serves the same intent",
      ],
      [
        "Treating raw AI or automated clusters as final without checking Google",
        "Verify borderline queries in live Google search results to confirm whether Page 1 rewards a tool, tutorial, or comparison",
      ],
      [
        "Adding up monthly search volumes of 10 variations as a traffic forecast",
        "Treat supplied volumes as rough relative estimates and evaluate the cluster as one unified topic",
      ],
      [
        "Stuffing the primary keyword into every H2, paragraph, and image alt attribute",
        "Use natural, task-focused subheadings and keep image alt text faithful to what the visual actually shows",
      ],
      [
        "Overhauling a page's title and structure after only 20 impressions",
        "Wait for 3–4 weeks of filtered Search Console query data before diagnosing snippet CTR or ranking position",
      ],
    ]
  ),

  p(
    "Google's official [Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies) specifically target keyword stuffing and scaled content abuse—publishing large amounts of unoriginal content that adds little value for users. Focusing on reader tasks, real examples, and honest tool integration keeps your site aligned with long-term search quality."
  ),

  h2("12. Start with one reviewed keyword group today"),
  p(
    "You do not need to map 500 keywords before publishing your next improvement. Pick **one reviewed keyword group** from your list right now: write down the reader's core task in one sentence, decide whether to upgrade an existing URL or create a new page, and build a focused brief."
  ),
  p(
    "If your spreadsheet is still an unsorted export, paste your list into the free [Keyword Clustering Tool](/tools/keyword-clustering-tool) to organize your initial groups, generate your writer handoff in the [SEO Content Brief Generator](/tools/seo-content-brief-generator), and then track your post-publish progress using the step-by-step guide on [How to Check Ranking for Keywords in Google](/ai-seo/check-google-keyword-rankings)."
  ),
  p(
    "*Editorial & Data Note: Keyword volume estimates, difficulty scores, and mapping decisions in this guide are drawn directly from the **Do It With AI Tools** SEO audit and keyword plan completed in November 2026. This article documents a transparent content-planning workflow combined with human editorial review.*"
  ),
];

const afterKeywordResearchMeta = buildHeadingsAndToc(afterKeywordResearchContent);

const afterKeywordResearchFaqs = [
  {
    question: "Should I start writing immediately after keyword research?",
    answer:
      "Not before cleaning your list, checking search intent, grouping related variations, and confirming whether an existing page on your site should be updated instead. Taking 15 minutes to map the cluster and write a short content brief prevents keyword cannibalization and wasted drafts.",
  },
  {
    question: "Do I need to write a separate blog post for every keyword?",
    answer:
      "No. Close keyword variations that share the same search intent and reader task belong on a single page. For example, in the Do It With AI Tools audit, 'keyword grouping software', 'keyword grouper software', and 'semantic keyword grouping' were all mapped to one existing clustering tool page rather than three separate URLs.",
  },
  {
    question: "How many keywords should I target on one page?",
    answer:
      "Choose one primary keyword that best represents the core topic for your title tag, H1, and opening answer, and then naturally address all closely related secondary queries and sub-questions within your H2/H3 sections and FAQs. Focus on complete task coverage rather than hitting an arbitrary keyword count.",
  },
  {
    question: "How do I decide between updating an existing page and creating a new one?",
    answer:
      "Inspect the live Google results for the keyword and compare them with your existing page's purpose. If your current page already serves the same user task and format, upgrade it with better sections, examples, and internal links. If the keyword requires a completely different page experience (for example, a step-by-step tutorial vs. an interactive calculator), create a dedicated page and cross-link the two.",
  },
  {
    question: "Can ChatGPT handle the post-keyword-research process for me?",
    answer:
      "ChatGPT and interactive utilities like the Keyword Clustering Tool and SEO Content Brief Generator are excellent for organizing supplied keyword lists, drafting topic clusters, and structuring content briefs. However, you should always supply real search data, verify live Google SERPs yourself, and add your own first-hand examples and product knowledge.",
  },
  {
    question: "Where should I put keywords besides the article body?",
    answer:
      "Place your primary keyword naturally in the SEO title tag (<title>), visible H1 heading, URL slug, opening 100 words, and meta description. Use secondary variations and sub-questions in H2/H3 subheadings, table headers, and FAQ items. Across your site, use descriptive anchor text when linking related guides and tools together.",
  },
  {
    question: "What should I do if my published page gets impressions in Search Console but zero clicks?",
    answer:
      "Open Google Search Console → Performance → Search results, filter to that specific URL and your target country, and check your Average Position. If you rank at Positions 11–20, add a sharp question-matched H2 section and internal links to push the page onto Page 1. If you already rank in Positions 1–10 with <2% CTR, rewrite your title tag and meta description to stand out below AI Overviews.",
  },
  {
    question: "How long after publishing should I wait before measuring keyword rankings?",
    answer:
      "Confirm technical indexing in Google Search Console within the first few days, then allow 3 to 4 weeks of consistent impression data before judging ranking positions or rewriting your snippet. Reacting to 48-hour fluctuations often disrupts pages while Google is still testing them.",
  },
];

// ============================================================================
// ARTICLE 2: /ai-seo/check-google-keyword-rankings
// ============================================================================
const checkKeywordRankingsContent = [
  p(
    "To check where a website ranks for specific keywords on Google, use **three main approaches** depending on whether you need a **free, accurate internal audit** of your own website, a **quick public lookup** in live search results, or **automated competitor tracking**:"
  ),
  numberItem(
    "**For a website you own (Most Accurate & 100% Free):** Open [Google Search Console](https://search.google.com/search-console/about), click **Performance → Search results**, toggle on the orange **Average position** metric card, and scroll down to the **Queries** table to see every keyword real users typed to find your pages."
  ),
  numberItem(
    "**For a quick live lookup on any domain (30 Seconds, No Login):** Enter your URL, target keyword, and country into a depersonalized live SERP checker to inspect the current top 100 organic positions without account setup."
  ),
  numberItem(
    "**For turning Page-2 rankings into immediate clicks (60 Seconds, Free Browser Tool):** Export your Search Console queries and drop the file into the free [GSC Striking Distance Keyword Finder](/tools/gsc-striking-distance-finder) on **Do It With AI Tools** to isolate every keyword ranking between **Positions 8 and 20** with high impressions and low click-through rates (CTR)."
  ),
  p(
    "If you just finished building your keyword list and haven't mapped or published your pages yet, start with the companion workflow guide on [What to Do After Keyword Research: Turn Your List Into a Content Plan](/ai-seo/what-to-do-after-keyword-research). Once your pages are live, use the methods below to track and grow your rankings."
  ),

  toolPromo({
    badge: "100% PRIVATE IN YOUR BROWSER",
    title: "Already Have a Google Search Console Export?",
    description:
      "Drop your Search Console Queries.csv or ZIP file into the free GSC Striking Distance Keyword Finder to instantly filter Positions 8–20 quick wins and calculate estimated extra clicks—zero login required.",
    ctaText: "Open GSC Striking Distance Finder",
    link: "/tools/gsc-striking-distance-finder",
    secondaryText: "Optimize Low-CTR Snippets",
    secondaryLink: "/tools/gsc-ctr-optimizer",
  }),

  tableBlock(
    "Comparison of the Ways to Check Keyword Rankings in Google",
    [
      [
        "Ranking Check Method",
        "Best Used For",
        "Cost",
        "Data Source & Accuracy",
        "Time Required",
      ],
      [
        "**[Google Search Console](https://search.google.com/search-console/about)**",
        "Checking all keywords your own verified website ranks for over time",
        "Free",
        "Direct from Google's real search impression logs (16 months of history)",
        "2 minutes",
      ],
      [
        "**[GSC Striking Distance Finder](/tools/gsc-striking-distance-finder)**",
        "Filtering your GSC export for Positions 8–20 quick wins and low-CTR pages",
        "Free",
        "Exact match to your exported GSC CSV/ZIP (runs 100% locally in browser)",
        "30 seconds",
      ],
      [
        "**Public Live SERP Checkers**",
        "Spot-checking 1–10 specific keywords on any website or competitor right now",
        "Free",
        "Exact for 1 depersonalized search in 1 selected country at 1 moment",
        "30 seconds",
      ],
      [
        "**Dedicated Scheduled Rank Trackers**",
        "Daily automated tracking of fixed keyword lists, local ZIP codes, and competitors",
        "Paid",
        "Scheduled daily SERP snapshots across desktop and mobile",
        "10 minutes setup",
      ],
      [
        "**Manual Browser Search (Incognito Mode)**",
        "Visually inspecting SERP layout (AI Overviews, videos, ads)",
        "Free",
        "**Low accuracy** for position numbers (still biased by IP location and device)",
        "1 minute",
      ],
    ]
  ),

  h2("Method 1: The Best Free & Most Accurate Option — Google Search Console (GSC)"),
  p(
    "If you own or manage the website you want to check, [Google Search Console](https://search.google.com/search-console/about) is the gold standard for checking keyword rankings. Unlike third-party rank trackers that simulate a single search from one server location, Search Console records the exact queries real people typed into Google and where your page appeared across millions of live searches."
  ),

  h3("Step-by-Step: How to Check Your Keyword Positions in GSC"),
  p(
    "Follow these five steps to see every keyword your site ranks for and your exact position for any target phrase:"
  ),
  bullet(
    "**Step 1: Log in to your Google Search Console dashboard:** Open [Google Search Console](https://search.google.com/search-console/about) and select your verified **Domain property** (`yourdomain.com`), which tracks all subdomains and both `http` and `https` URLs in one place."
  ),
  bullet(
    "**Step 2: Open Performance → Search results:** In the left-hand navigation sidebar, click **Performance** (or **Search results**). By default, Google displays the last 3 months of organic web search data."
  ),
  bullet(
    "**Step 3: Toggle on the \"Average position\" metric card:** At the top of the main performance chart, you will see four colored metric boxes: **Total clicks**, **Total impressions**, **Average CTR**, and **Average position**. Click **Average position** (highlighted in orange) and **Average CTR** (green) so all four metrics are active."
  ),
  bullet(
    "**Step 4: Scroll down to the \"Queries\" table:** Below the graph, make sure the **Queries** tab is selected. You will now see a complete table of search terms your website appeared for, alongside the exact **Clicks**, **Impressions**, **CTR**, and **Position** for each keyword."
  ),
  bullet(
    "**Step 5: Filter by a specific keyword, page, country, or device:** Click **`+ Add filter`** (or **`+ New`**) right above the chart: choose **Query → Queries containing** to check your ranking for one specific keyword cluster; choose **Page** and paste a single blog post URL to see every keyword that specific article ranks for; and choose **Country** and **Device** to see your true ranking in your target market (such as United States on Mobile vs. Desktop)."
  ),

  imageSlot({
    label: "Screenshot Placeholder #1 — GSC Performance Dashboard",
    title: "Google Search Console Performance Report with Average Position Enabled",
    captureInstructions:
      "Open Google Search Console → Performance → Search results, enable all 4 metric cards (Total clicks, Total impressions, Average CTR, Average position), and highlight the orange Average position box and the Queries tab below.",
    recommendedFilename: "gsc-average-position-queries-tab.webp",
    altText:
      "Google Search Console Performance report showing the orange Average position metric toggled on and the Queries ranking table below",
  }),

  h3("Why Unfiltered \"Average Position\" Can Mislead You (Real Data Example)"),
  p(
    "The biggest mistake site owners make inside Search Console is looking at the single **Average position** number at the top of the screen without adding a **Country** or **Query** filter. Because Google averages your ranking across every country in the world, strong rankings in one region can hide weak rankings in another—or vice versa."
  ),
  p(
    "Here is a real 3-month snapshot from the **Do It With AI Tools** Search Console property showing how drastically the same website's average position shifts across countries:"
  ),

  tableBlock(
    "Real 3-Month Google Search Console Country Breakdown (Do It With AI Tools Audit)",
    [
      [
        "Country Filter in GSC",
        "3-Month Impressions",
        "3-Month Clicks",
        "Average Position in GSC",
        "What the Number Actually Means",
      ],
      [
        "**Nigeria**",
        "224",
        "0",
        "**8.97** (Page 1)",
        "Queries appearing in Nigeria rank on the first page on average",
      ],
      [
        "**India**",
        "4,383",
        "21",
        "**19.35** (Page 2)",
        "Strong Page-2 visibility across 4,300+ searches",
      ],
      [
        "**United States**",
        "7,600",
        "1",
        "**41.45** (Page 5)",
        "High impression volume, but mostly ranking on Pages 4–5 in the US",
      ],
      [
        "**United Kingdom**",
        "1,507",
        "1",
        "**62.59** (Page 7)",
        "Early indexation stage for broader high-difficulty keywords",
      ],
    ]
  ),

  p(
    "If you only look at the unfiltered global chart, you get a blended number around Position `38` that doesn't reflect **any** real searcher's screen. Always click **`+ Add filter → Country`** and select your primary target audience before judging your rankings."
  ),

  imageSlot({
    label: "Screenshot Placeholder #2 — GSC Country Filter Comparison",
    title: "Google Search Console Countries Tab Showing Position Variance by Region",
    captureInstructions:
      "In Google Search Console → Performance → Search results, click the Countries tab below the chart (or show + Add filter → Country → United States) to visually illustrate how Average Position differs across India, Nigeria, the US, and the UK.",
    recommendedFilename: "gsc-country-filter-average-position-comparison.webp",
    altText:
      "Google Search Console Countries tab showing how average keyword ranking position varies between India, the United States, and the United Kingdom",
  }),

  h3("4 Google Search Console Ranking Traps to Avoid in 2026"),
  p(
    "When you audit your rankings in Search Console, keep these four platform quirks in mind so you never misread your progress:"
  ),
  bullet(
    "**Trap 1: Your sitewide Average Position drops right after you publish great content.** Site owners frequently worry when their overall Average Position drops from `20` to `45` while impressions go up. This happens because your new articles just started ranking at Positions `50–85` for hundreds of brand-new keywords you never ranked for before—which pulls down the sitewide math average even while your core pages are climbing."
  ),
  bullet(
    "**Trap 2: Two of your own URLs are splitting rankings for the same keyword (Cannibalization).** Search Console's Average Position records the **topmost result from your site** for each search. If you filter by a single keyword and click the **Pages** tab, and you see two or three of your own blog URLs sharing impressions for that same phrase, your pages are competing against each other. Run your export through the free [Keyword Cannibalization Finder](/tools/keyword-cannibalization-finder) on **Do It With AI Tools** to spot and resolve competing URLs."
  ),
  bullet(
    "**Trap 3: The 1,000-row UI limit and \"anonymized queries.\"** The Search Console web table only displays up to `1,000` query rows and hides rare, low-volume searches for user privacy. That is why adding up the clicks in the table never equals the total clicks shown on the top chart."
  ),
  bullet(
    "**Trap 4: Automated scraping fluctuations.** In late 2025, changes to automated scraping parameters caused third-party tools to stop polling low-tier SERP pages. Across many sites, bot impressions on Pages 3–10 vanished, causing total impressions to drop and Average Position to jump upward without any real change in human traffic."
  ),

  h2("Method 2: The Free & Quick Public Lookup — Dedicated Live Rank Checkers"),
  p(
    "What if you want to check where a page ranks in live Google search results **right now**—either for a brand-new post published this morning (before Search Console updates), or for a **competitor's website** that you don't have Search Console access to?"
  ),

  h3("How Free Live SERP Rank Checkers Work"),
  p(
    "A dedicated live rank checker runs a fresh, unpersonalized Google query from a neutral server in the country and device you choose, scans the top 100 organic results, and tells you the exact position (`#1` to `#100`) and ranking URL:"
  ),
  bullet(
    "**Single Keyword Spot-Checks:** Enter one target keyword, your domain name, and your target country to see your live desktop or mobile position alongside the top ranking URLs."
  ),
  bullet(
    "**Domain SERP Inspection:** Inspect which queries a specific URL currently ranks for in Google's top results to identify page-level rankings."
  ),
  bullet(
    "**Local City-Level Spot-Checks:** Select a specific city or metropolitan area when testing localized queries or regional service pages."
  ),

  imageSlot({
    label: "Screenshot Placeholder #3 — Live Free Keyword Rank Checker",
    title: "Live SERP Position Check Example Showing Depersonalized Results",
    captureInstructions:
      "Run a live check on doitwithai.tools (for a query like 'h1 length' or 'merlin chrome extension') inside a free live rank checker set to United States, showing the live position result and ranking URL.",
    recommendedFilename: "live-keyword-rank-checker-google-serp.webp",
    altText:
      "Live keyword rank checker showing the exact organic Google search position and ranking URL for a target keyword",
  }),

  h3("Why Manual Searching in Chrome Incognito Still Shows Biased Rankings"),
  p(
    "A common piece of advice is to open a Chrome Incognito window, type your keyword into Google, press `Ctrl + F`, and count where your website appears."
  ),
  p(
    "While Incognito mode strips away your logged-in Google account history and browser cookies, **it does not show a universal ranking**. As experienced SEO practitioners emphasize, an Incognito search is still heavily skewed by:"
  ),
  bullet(
    "**Your physical IP address and city:** Searching from different regions triggers different Google data centers and localized SERP weighting."
  ),
  bullet(
    "**Your device viewport (Desktop vs. Mobile):** Because Google uses mobile-first indexing, a page can rank `#4` on Mobile and `#9` on Desktop at the exact same moment."
  ),
  bullet(
    "**Time-of-day SERP testing:** Google continuously tests different result orders throughout the day."
  ),

  h3("How to Run a Clean Manual Spot-Check (When You Have No Other Choice)"),
  p(
    "Manual Google searches are still hugely valuable for **one specific job**: seeing the visual layout of Page 1 (such as whether an **AI Overview**, a YouTube video pack, or a Reddit carousel sits above Position #1). When you do a manual check, follow these four rules:"
  ),
  numberItem(
    "Open a private/Incognito window and confirm you are completely signed out of Google."
  ),
  numberItem(
    "Append `&gl=us&hl=en&pws=0` to the end of the Google search URL (for example, `https://www.google.com/search?q=your+keyword&gl=us&hl=en&pws=0`) to set the country to the US (`gl=us`), language to English (`hl=en`), and disable session personalization (`pws=0`)."
  ),
  numberItem(
    "Check Mobile and Desktop separately using Chrome DevTools (`F12` → Toggle Device Toolbar)."
  ),
  numberItem(
    "Count **only standard organic links**—skip Sponsored Ads at the top, \"People Also Ask\" accordions, and Local Map Packs."
  ),

  h2("Method 3: How to Find \"Striking Distance\" Rankings (Positions 8–20) That Turn Into Immediate Clicks"),
  p(
    "Checking your rank for one keyword at a time is slow. If your website has been live for even 4 to 8 weeks, Google Search Console is already sitting on a goldmine of **\"Striking Distance Keywords\"**—search queries where your site ranks between **Positions 8 and 20** (the bottom of Page 1 or on Page 2) and earns hundreds of impressions, but gets **zero or almost zero clicks**."
  ),
  p(
    "Because Google already trusts your URL enough to rank it in the top 20 for these queries, optimizing them is **the fastest way in SEO to generate new clicks** without waiting months for a brand-new post to get indexed."
  ),

  h3("Step-by-Step: Auditing Your Exported CSV with the Free GSC Striking Distance Finder"),
  p(
    "Instead of building complex spreadsheet formulas every week, you can audit your entire Search Console export in 30 seconds using the free **[GSC Striking Distance Keyword Finder](/tools/gsc-striking-distance-finder)** on **Do It With AI Tools**:"
  ),
  bullet(
    "**Step 1: Export your Search Console Performance data:** In [Google Search Console](https://search.google.com/search-console/about), open **Performance → Search results**, set the date range to **Last 3 months**, and click **Export → Download CSV** in the top-right corner. Google will download a `.zip` archive containing `Queries.csv`, `Pages.csv`, `Countries.csv`, and `Devices.csv`."
  ),
  bullet(
    "**Step 2: Load the file into the tool (100% private in your browser):** Open the [Free GSC Striking Distance Keyword Finder](/tools/gsc-striking-distance-finder) and drag-and-drop either the downloaded `.zip` archive or `Queries.csv` directly into the upload box. Everything is parsed locally inside your browser tab—nothing is uploaded to any external server."
  ),
  bullet(
    "**Step 3: Filter for Positions 8 to 20 and set your minimum impression floor:** Keep the default range of **Min Position: `8`** and **Max Position: `20`** (or widen it to `6–25`), set **Min Impressions: `100`**, and type your brand name into **Exclude Terms** so navigational brand searches don't clutter your list."
  ),
  bullet(
    "**Step 4: Sort by \"Estimated Extra Clicks\" or \"Lowest CTR First\":** Toggle between **Page 1 Bottom (Pos 8–10)** and **Page 2 (Pos 11–20)** to get an instant, prioritized action plan showing how many extra monthly clicks you could capture if you lift each query to a realistic target CTR (such as `10%`)."
  ),

  imageSlot({
    label: "Screenshot Placeholder #4 — GSC Striking Distance Finder Tool",
    title: "Do It With AI Tools Free GSC Striking Distance Keyword Finder Interface",
    captureInstructions:
      "Open https://doitwithai.tools/tools/gsc-striking-distance-finder, load your exported GSC ZIP/CSV (or click 'Try sample data'), and capture the filtered table showing Positions 8–20, Impressions, Current CTR, Estimated Extra Clicks, and the recommended action badge for each row.",
    recommendedFilename: "doitwithai-gsc-striking-distance-keyword-finder-tool.webp",
    altText:
      "Do It With AI Tools Free GSC Striking Distance Keyword Finder analyzing Google Search Console queries ranking in positions 8 to 20",
  }),

  h3("Real Worked Example: Diagnosing High-Impression, Zero-Click Keywords"),
  p(
    "When the **Do It With AI Tools** 3-month Search Console export (`892` exported queries) was audited through this exact workflow, it revealed why the site was earning thousands of impressions with very few clicks:"
  ),

  tableBlock(
    "Real Striking-Distance Audit from the Do It With AI Tools Search Console Export",
    [
      [
        "Exported GSC Query",
        "3-Month Impressions",
        "Clicks (CTR)",
        "Average Position",
        "Ranking Zone & Diagnosis",
        "Exact Optimization Action",
      ],
      [
        "**`what is an h1 header`**",
        "347",
        "0 (0.00%)",
        "**6.99**",
        "**Page 1 (Pos 6–7), Zero Clicks:** Ranking on Page 1, but Google's AI Overview answers the basic definition before users scroll.",
        "Rewrite the meta snippet on the [H1 Heading SEO Guide](/ai-seo/h1-heading) to promise copy-paste HTML templates and pixel limits, and add a crisp 45-word answer block at the top to win the AI Overview citation.",
      ],
      [
        "**`optimize h1 tag`**",
        "255",
        "0 (0.00%)",
        "**6.30**",
        "**Page 1 (Pos 6), Zero Clicks:** Strong transactional/how-to intent, but the previous title tag was too generic.",
        "Test a high-contrast title using the [GSC CTR Optimizer](/tools/gsc-ctr-optimizer) and link directly to the interactive [H1 Heading Generator](/tools/h1-heading-generator).",
      ],
      [
        "**`merlin chrome extension`**",
        "536",
        "0 (0.00%)",
        "**10.14**",
        "**Border of Page 1 / Page 2:** Sitting at Position 10 on the [Merlin AI Review](/ai-tools/merlin-ai-review).",
        "Add a quick-verdict summary box, updated pricing pros/cons, and 3 contextual internal links to push it into Positions 3–5.",
      ],
      [
        "**`h1 length`**",
        "730",
        "0 (0.00%)",
        "**11.92**",
        "**Top of Page 2 Striking Distance:** Highest-impression quick win (`730` impressions at Pos 11.9).",
        "Add an exact-match `H2: Ideal H1 Tag Length in Characters and Pixels` near the top of the [H1 Heading Guide](/ai-seo/h1-heading).",
      ],
      [
        "**`why use ai for keyword research`**",
        "112",
        "0 (0.00%)",
        "**21.30**",
        "**Top of Page 3:** Ranking on the [AI vs. Traditional Keyword Research Guide](/ai-seo/ai-vs-traditional-keyword-research).",
        "Add a dedicated H2 section with a side-by-side workflow table and link to the [ChatGPT Keyword Research Guide](/ai-seo/chatgpt-keyword-research).",
      ],
    ]
  ),

  h2("Method 4: Professional Platforms for Automated Daily & Competitor Tracking"),
  p(
    "Google Search Console only tracks websites you verify, and free live rank checkers only check a handful of keywords one at a time. If you run an agency, manage a local business across multiple cities, or want to inspect broad competitor rankings across thousands of keywords, automated tracking platforms offer scheduled daily monitoring:"
  ),

  tableBlock(
    "Overview of Rank Tracking Approaches",
    [
      [
        "Tracking Category",
        "Best Suited For",
        "Core Rank Tracking Strength",
        "Access Type",
      ],
      [
        "**Google Search Console**",
        "Internal performance & real search queries",
        "100% verified first-party search query logs across all pages and countries",
        "Free for verified site owners",
      ],
      [
        "**Browser Striking Distance Audits**",
        "Finding Positions 8–20 quick wins",
        "Direct calculation of extra clicks and prioritized CTR action zones",
        "Free in-browser utility",
      ],
      [
        "**Public Live SERP Checkers**",
        "Immediate spot-checks on any URL",
        "Depersonalized live SERP scan for single keywords in specific countries",
        "Free public lookup",
      ],
      [
        "**Enterprise Scheduled Trackers**",
        "Daily automated competitor monitoring",
        "Scheduled daily SERP snapshots, ZIP code localization, and historical tracking",
        "Paid subscription",
      ],
    ]
  ),

  h2("The \"Position Zero\" Problem: Why Google AI Overviews Eat Top Rankings (And How to Get Cited)"),
  p(
    "In traditional SEO, ranking between **Positions #1 and #3** guaranteed a flood of organic clicks. Today, there is a new layer sitting above Position #1: **Position Zero (Google AI Overviews)**."
  ),
  p(
    "When a user searches an informational or how-to query—including `\"how to check ranking for keywords in google\"`—Google generates a detailed AI summary right at the top of the page. If the user only needs a quick 3-step answer, they read the AI Overview and never scroll down to click the traditional organic results. Industry search performance studies show that median Google impressions more than doubled between late 2025 and 2026 while median CTR fell by up to **40%** due to zero-click SERP features and AI Overviews."
  ),

  imageSlot({
    label: "Screenshot Placeholder #5 — Live Google AI Overview at Position Zero",
    title: "Live Google AI Overview for 'how to check ranking for keywords in google'",
    captureInstructions:
      "Use the screenshot of the Google search result for 'how to check ranking for keywords in google', highlighting two key details: (1) how the AI Overview takes up the entire first fold above organic results, and (2) how Google cited YouTube videos inside the numbered GSC steps while showing tool pages in the right-hand citation panel.",
    recommendedFilename: "google-ai-overview-position-zero-keyword-ranking-citations.webp",
    altText:
      "Google AI Overview for how to check ranking for keywords in Google citing YouTube tutorials and free rank checker tools at Position Zero",
  }),

  h3("How to Tell If an AI Overview Is Stealing Your Clicks"),
  p(
    "Here is the strategic secret most bloggers miss: **traditional Google rankings and AI Overview citations are directly connected.** Generative search research across hundreds of high-value digital marketing and SEO queries reveals that **over 67% of URLs cited inside Google AI Overviews** already rank in **Google's Top 10 organic results**."
  ),
  p(
    "Even more revealing: when you inspect the live AI Overview for `\"how to check ranking for keywords in google\"`, notice *who* Google cited for the step-by-step Search Console instructions—**video tutorials with clear transcripts** rather than tool landing pages! Why? Because many tool landing pages only placed an input box on the page without writing clean, step-by-step HTML instructions that Google's LLM could extract."
  ),

  toolPromo({
    badge: "UNDERSTAND THE AI SEARCH SHIFT",
    title: "AI SEO explained through a practical, human-reviewed workflow",
    description:
      "Learn how generative search engines and Google AI Overviews extract answers, index entities, and select citation links from Top 10 content.",
    ctaText: "Read the AI SEO guide",
    link: "/ai-seo/what-is-ai-seo",
    image: "https://cdn.sanity.io/images/qyshio4a/production/71f4396b9759402ea2249cf2103164ece7f2c773-1278x733.png",
    imageAlt: "AI SEO workflow guide cover.",
  }),

  h3("5 Steps to Optimize Your Content for Google AI Overviews (Position Zero)"),
  p(
    "Instead of letting AI Overviews eat your traffic, structure every article so Google cites **your page** inside the AI Overview *and* gives searchers a compelling reason to click through (learn more in the complete guide on [What Is AI SEO and How AI Search Works](/ai-seo/what-is-ai-seo)):"
  ),
  numberItem(
    "**Write a \"First-Fold Direct Answer Block\" (40–60 Words Immediately Under Your H1):** Before telling a long story, answer the core query in your very first paragraph using clear categories or a numbered list—just like the opening of this guide. Start every post with the [Blog Introduction Guide](/ai-seo/blog-introduction) framework so both human readers and LLMs get immediate clarity."
  ),
  numberItem(
    "**Format Steps as Scannable Bullet Lists Under Question-Matched H2/H3 Headings:** Google's AI Overview parser prioritizes `Step 1 → Step 2 → Step 3` lists that sit directly beneath an explicit `H2` or `H3` heading. Audit your heading hierarchy before publishing with the free [Heading Structure Analyzer](/tools/heading-structure-analyzer)."
  ),
  numberItem(
    "**Include Semantic HTML Comparison Tables (`<table><thead><tbody>`):** AI models frequently lift structured comparison tables directly into Position Zero summaries. Always present tool comparisons, pricing, and diagnostic matrices in real HTML tables rather than static images."
  ),
  numberItem(
    "**Offer What an AI Overview Can Never Replicate in Text (Interactive Tools & Templates):** A user might read a 4-line definition inside an AI Overview and leave—but an AI Overview **cannot** parse their Search Console CSV file, validate their schema markup, or generate custom titles. Pairing your guides with interactive utilities (like the [GSC Striking Distance Keyword Finder](/tools/gsc-striking-distance-finder) or [On-Page AI SEO Analyzer](/tools/on-page-ai-seo-analyzer)) gives searchers a concrete reason to click through."
  ),
  numberItem(
    "**Audit Your URL for AI Citation Readiness:** Once your draft is live, run the URL through the free [AI Citation Readiness Checker](/tools/ai-citation-readiness-checker) and use the curated [AI Search, AEO & GEO Visibility Prompts](/prompts/ai-search-aeo-geo-visibility-prompts) to verify that your entities, citations, and answer blocks are easy for Gemini, ChatGPT, and Perplexity to extract."
  ),

  toolPromo({
    badge: "POSITION ZERO HELPER • CITATION AUDIT",
    title: "Test Whether Your Page Is Ready for Google AI Overviews",
    description:
      "Check if your opening answer block, heading hierarchy, HTML tables, and schema markup are structured for Google AI Overviews and generative engine citations.",
    ctaText: "Run AI Citation Readiness Checker",
    link: "/tools/ai-citation-readiness-checker",
    secondaryText: "Get AEO & GEO Visibility Prompts",
    secondaryLink: "/prompts/ai-search-aeo-geo-visibility-prompts",
  }),

  h2("How to Improve Your Google Keyword Rankings After Checking Them (The 4-Zone Action Playbook)"),
  p(
    "Checking your keyword ranking is only diagnostic—**traffic grows when you act on what the position number tells you**. Once you check your positions in Search Console or the [GSC Striking Distance Finder](/tools/gsc-striking-distance-finder), match every keyword to one of these four zones:"
  ),

  h3("Zone 1: Positions 1–10 with Low CTR (<2%) — Fix Your Snippet Packaging"),
  p(
    "If your page already ranks on Page 1 (`Positions 1 to 10`) and earns hundreds of impressions, **you do not have a ranking problem—you have a click-through rate (CTR) problem**. Searchers are seeing your link in Google results (or below an AI Overview) and choosing another headline instead."
  ),
  bullet(
    "**Rewrite your Meta Title (`<title>`) to promise a concrete outcome, tool, or template:** Instead of a flat label like *\"H1 Tag Guide\"*, use specifics like *\"H1 Tag Length & SEO Guide (2026 Pixel Limits + Free Generator)\"*. Read the full [Meta Title Optimization Guide](/ai-seo/meta-title) and test variations in the free [Meta Title Generator](/tools/meta-title-generator) or [GSC CTR Optimizer](/tools/gsc-ctr-optimizer)."
  ),
  bullet(
    "**Upgrade your Meta Description (`<meta name=\"description\">`) within pixel limits:** Make sure your description isn't getting truncated mid-sentence on mobile screens. Follow the [Meta Description Length & CTR Guide](/ai-seo/meta-description) and generate click-worthy copy using the [Meta Description Generator](/tools/meta-description-generator) or [ChatGPT Prompts for Meta Titles and Meta Descriptions](/prompts/chatgpt-prompts-for-meta-title-and-meta-description)."
  ),
  bullet(
    "**Preview how your result looks on Google Mobile & Desktop:** Before publishing your new tags, test them inside the free [SERP & Rich Result Preview Generator](/tools/serp-rich-result-preview-generator)."
  ),

  toolPromo({
    badge: "CLICK-THROUGH RATE OPTIMIZATION",
    title: "Create better meta titles with AI and a clear page brief",
    description:
      "Learn how to craft high-CTR title tags within pixel limits that stand out under Google AI Overviews and search carousels.",
    ctaText: "Read the meta title guide",
    link: "/ai-seo/meta-title",
    image: "https://cdn.sanity.io/images/qyshio4a/production/d8df7ab08b12fb08b726a72649576b3828d2b3e6-2257x1261.webp",
    imageAlt: "Meta title optimization guide cover.",
  }),

  h3("Zone 2: Positions 8–10 with Healthy CTR — Strengthen Topical Authority & Internal Links"),
  p(
    "When a page sits at the bottom of Page 1 (`Positions 8 to 10`) and already gets a solid CTR, Google likes your snippet—it just needs stronger on-page evidence and internal link equity to crack the Top 3:"
  ),
  bullet(
    "**Point 3 to 5 contextual internal links from related articles on your site:** Internal links with descriptive anchor text pass authority and help Google understand which page is your primary hub. Find exact linking opportunities across your site using the free [Internal Link Opportunity Finder](/tools/internal-link-opportunity-finder) and [Internal Link Anchor Auditor](/tools/internal-link-anchor-auditor)."
  ),
  bullet(
    "**Add first-hand evidence, original data tables, and E-E-A-T signals:** Replace generic filler sentences with real test data, screenshots, and verified external citations. Audit your page's depth with the [Information Gain Auditor](/tools/information-gain-auditor), [Content Evidence Review Tool](/tools/content-evidence-review), and [E-E-A-T Content Auditor](/tools/eeat-content-auditor)."
  ),

  toolPromo({
    badge: "ZONE 2 HELPER • INTERNAL LINK EQUITY",
    title: "Find High-Impact Contextual Internal Links Across Your Site",
    description:
      "Scan your existing blog posts and guides to spot missing contextual links that pass authority to pages sitting at the bottom of Page 1.",
    ctaText: "Open Internal Link Finder",
    link: "/tools/internal-link-opportunity-finder",
    secondaryText: "Audit Link Anchors",
    secondaryLink: "/tools/internal-link-anchor-auditor",
  }),

  h3("Zone 3: Positions 11–15 (Top of Page 2) — Add Answer-First Sections & Schema"),
  p(
    "Keywords sitting at `Positions 11 to 15` are your highest-ROI striking-distance opportunities. Often, your page ranks at `#12` for a query simply because it never explicitly answers that exact phrase in a dedicated subheading."
  ),
  bullet(
    "**Align your H1 and add a dedicated H2/H3 matching the query:** Check the [H1 Heading SEO Guide](/ai-seo/h1-heading) to ensure your main heading is crystal clear, then add a new `H2` or `H3` section that uses the exact striking-distance query and answers it in 2–3 direct sentences right underneath. Map out missing subtopics with the [Article Outline Generator](/tools/article-outline-generator) and [Semantic Entity Gap Analyzer](/tools/semantic-entity-gap-analyzer)."
  ),
  bullet(
    "**Keep your URL slug short and keyword-focused:** If you are publishing a new page or consolidating an old draft, avoid long, bloated URLs. Follow the [How to Write SEO-Friendly Slug URLs Guide](/ai-seo/write-slug-urls) and generate clean paths with the [Slug Generator](/tools/slug-generator)."
  ),
  bullet(
    "**Add valid Schema Markup (`Article` & `FAQPage`) and Descriptive Image Alt Text:** Help search engines and AI engines parse your page structure by following our [Schema Markup Optimization Guide](/ai-seo/schema-markup-optimization), generating JSON-LD in the [Schema Markup Generator](/tools/schema-markup-generator), validating it in the [Structured Data Validator](/tools/structured-data-validator), and adding descriptive image attributes using the [AI Alt Text Generators Guide](/ai-seo/ai-alt-text-generators) and [Image Alt Text Generator](/tools/image-alt-text-generator)."
  ),
  bullet(
    "**Keep your writing easy to scan:** Dense walls of text increase bounce rates. Check your draft with the [Readability Checker](/tools/readability-checker) and explore the best tools in the [AI Readability Tools Guide](/ai-seo/ai-readability-tools)."
  ),

  h3("Zone 4: Positions 16–30+ — Fix Search Intent Mismatches & Keyword Cannibalization"),
  p(
    "When a keyword is stuck between `Positions 16 and 35`, tweaking a meta tag won't be enough. One of two structural issues is holding you back:"
  ),
  bullet(
    "**Issue A: Search Intent Mismatch:** You wrote a beginner informational blog post, but Google's Page 1 for that keyword is 90% interactive calculators, software comparison pages, or product reviews. Verify what Google actually rewards for that query using the free [Search Intent Checker](/tools/search-intent-checker) and [ChatGPT Prompts for Search Intent](/prompts/chatgpt-prompts-for-search-intent). If the query deserves its own dedicated page, plan the cluster properly using the [What to Do After Keyword Research Guide](/ai-seo/what-to-do-after-keyword-research), [ChatGPT Keyword Research Guide](/ai-seo/chatgpt-keyword-research), [AI Keyword Research Tools Comparison](/ai-tools/ai-keyword-research-tools), and [Free Keyword Clustering Tool](/tools/keyword-clustering-tool)."
  ),
  bullet(
    "**Issue B: Content Decay or Keyword Cannibalization:** Either an older article has lost freshness over the last 6 months, or two of your pages are splitting impressions for the same topic. Diagnose declining traffic with the [Content Decay & Refresh Analyzer](/tools/content-decay-refresh-analyzer) and spot duplicate targeting with the [Keyword Cannibalization Finder](/tools/keyword-cannibalization-finder)."
  ),

  imageSlot({
    label: "Screenshot Placeholder #6 — The 4-Zone Keyword Ranking Action Matrix",
    title: "4-Quadrant SEO Action Matrix (Positions 1–10, 8–10, 11–15, and 16–30+)",
    captureInstructions:
      "Clean 4-quadrant visual flowchart showing Zone 1 (Pos 1–10 Low CTR → Snippet Rewrite), Zone 2 (Pos 8–10 Healthy CTR → Internal Links + Evidence), Zone 3 (Pos 11–15 → Direct Answer H2 + Schema), and Zone 4 (Pos 16–30+ → Intent Check or New Dedicated Page).",
    recommendedFilename: "keyword-ranking-4-zone-optimization-matrix.webp",
    altText:
      "Four-zone SEO action matrix showing how to optimize Google keyword rankings for positions 1 to 10, 8 to 10, 11 to 15, and 16 to 30",
  }),

  h2("Your 15-Minute Weekly Google Rank Tracking Routine"),
  p(
    "Even Google's official Search Console documentation notes that you do not need to check your rankings every single day. Daily positions bounce up and down naturally as Google tests SERP layouts, and reacting to 24-hour noise often hurts pages that were already climbing."
  ),
  p("Instead, follow this **15-minute weekly routine** every Monday morning:"),
  numberItem(
    "**Minutes 1–3 (Compare 28-Day Trends in GSC):** Open [Google Search Console](https://search.google.com/search-console/about) → **Performance → Search results**, set the date filter to **Compare last 28 days to previous period**, switch the chart view to **Weekly** so weekend dips align, and filter to **Non-branded queries**."
  ),
  numberItem(
    "**Minutes 4–6 (Find Your Top 3 Striking-Distance Queries):** Export your 3-month `Queries.csv` and drop it into the free [GSC Striking Distance Keyword Finder](/tools/gsc-striking-distance-finder). Filter for **Positions 8–20** with at least `50–100` impressions."
  ),
  numberItem(
    "**Minutes 7–11 (Upgrade 1 Page Sitting at Positions 11–15):** Open the page ranking at the top of Page 2, add a sharp question-matched `H2` with a 45-word direct answer block for AI Overviews, and add 3 internal links from related articles using the [Internal Link Opportunity Finder](/tools/internal-link-opportunity-finder)."
  ),
  numberItem(
    "**Minutes 12–14 (Fix 1 Page-1 Snippet with Low CTR):** Find one query where you rank between `Positions 1 and 10` with a CTR below `2%`, and rewrite its `<title>` and `<meta name=\"description\">` using the [GSC CTR Optimizer](/tools/gsc-ctr-optimizer)."
  ),
  numberItem(
    "**Minute 15 (Log Your Change):** Add an annotation on your calendar or audit sheet to log what you updated. In 3 to 4 weeks, compare the before-and-after clicks for that exact URL in Google Search Console."
  ),
];

const checkKeywordRankingsMeta = buildHeadingsAndToc(checkKeywordRankingsContent);

const checkKeywordRankingsFaqs = [
  {
    question: "How do I check my Google keyword ranking for free?",
    answer:
      "For a website you own, Google Search Console is 100% free and provides the most accurate ranking data: open Performance → Search results, click the orange Average position box at the top of the chart, and check the Queries table below. To check a single keyword in live Google search results for any domain without an account, use a depersonalized live SERP checker.",
  },
  {
    question: "Why is my Google ranking different when I search for my keyword myself in Incognito mode?",
    answer:
      "Even in Chrome Incognito mode, Google tailors search results based on your physical IP address (city/region), whether you are on a mobile phone or desktop computer, and real-time SERP experiments. Meanwhile, Google Search Console averages the topmost position of your site across every real user search over your selected date range. Both numbers are real—use a location-specific live rank checker for a single-city snapshot, and trust Search Console for overall ranking trends.",
  },
  {
    question: "How do I find all the keywords my website already ranks for on Google?",
    answer:
      "Open Google Search Console → Performance → Search results, enable all four metric cards (Clicks, Impressions, CTR, Position), set the date range to Last 3 months, and sort the Queries tab by Impressions from highest to lowest. You can then export that CSV and upload it into the free GSC Striking Distance Keyword Finder on Do It With AI Tools to automatically filter out your highest-potential Page-1 and Page-2 keywords.",
  },
  {
    question: "Why did my Average Position in Google Search Console drop when my impressions went up?",
    answer:
      "A sudden drop in your sitewide Average Position accompanied by rising impressions is usually a positive sign. When Google begins testing your pages for hundreds of brand-new keywords at Positions 40–80, those new impressions pull down your overall sitewide average even if your top-performing keywords stayed at Position #1 or #2. Always filter by a specific query or page before evaluating average position.",
  },
  {
    question: "Does Google Search Console show rankings inside Google AI Overviews?",
    answer:
      "Yes, but Google does not separate AI Overview citations into a standalone filter. When your webpage is cited as a source link inside a Google AI Overview or AI Mode, Search Console records those impressions, clicks, and positions inside the standard Web search type in your Performance report. To maximize your chances of getting cited in Position Zero, structure your content with a 40–60 word direct answer in the first fold and test your URL with the free AI Citation Readiness Checker.",
  },
  {
    question: "How can I check a competitor's keyword rankings on Google?",
    answer:
      "Because Google Search Console only lets you view properties you verify, you need an external index or live SERP checker to inspect competitors. For a quick spot-check on target keywords, enter the competitor's URL into a public SERP checker. For historical tracking across thousands of competitor queries, use dedicated keyword research and monitoring platforms.",
  },
  {
    question: "What are 'striking distance' keywords in Google Search Console, and why do they matter?",
    answer:
      "Striking distance keywords (also known as low-hanging-fruit keywords) are search queries where your website already ranks between Positions 8 and 20 (bottom of Page 1 or on Page 2) with steady impressions. Because Google already considers your page relevant to the topic, improving the subheadings, snippet CTR, and internal links on those pages typically moves them into the Top 5 much faster than publishing a brand-new article from scratch.",
  },
  {
    question: "How often should I check my keyword rankings on Google?",
    answer:
      "For most websites, checking rankings once a week (comparing the last 28 days against the previous 28 days on a weekly chart view) is the sweet spot. Check daily only after a site migration, a major technical overhaul, or a confirmed Google Core Update.",
  },
];

// ============================================================================
// REGISTRY OF CODE-PUBLISHED ARTICLES
// ============================================================================
export const STATIC_ARTICLES = {
  "seo:what-to-do-after-keyword-research": {
    _id: "static-seo-what-to-do-after-keyword-research",
    _type: "seo",
    title: "What to Do After Keyword Research: Turn Your List Into a Content Plan",
    slug: { current: "what-to-do-after-keyword-research" },
    publishedAt: "2026-11-07T00:00:00.000Z",
    _updatedAt: "2026-11-07T02:00:00.000Z",
    _createdAt: "2026-11-07T00:00:00.000Z",
    metatitle: "What to Do After Keyword Research: 10-Step SEO Content Plan",
    metadesc:
      "Learn what to do after keyword research: clean your list, match search intent, cluster keywords, map URLs, write briefs, and track rankings with a real audit.",
    schematitle:
      "What to Do After Keyword Research: Turn Your List Into a Content Plan (10-Step SEO Guide)",
    schemadesc:
      "Step-by-step guide to turning raw keyword research into an organized content plan: filtering irrelevant terms, matching search intent, clustering keywords, mapping pages, writing briefs, and measuring results in Google Search Console.",
    overview:
      "After completing keyword research, turn your raw list into a structured content plan: filter out irrelevant terms, verify search intent, cluster related keywords around shared tasks, map groups to existing or new URLs, build content briefs, and measure results in Search Console.",
    readTime: { minutes: 12 },
    mainImage: {
      isPlaceholder: true,
      localUrl: "https://doitwithai.tools/logoForHeader.png",
      badge: "Do It With AI Tools • Post-Research SEO Playbook",
      recommendedFilename: "what-to-do-after-keyword-research-hero.webp",
      placeholderTitle:
        "What to Do After Keyword Research: The 10-Step Content & Page Mapping Workflow",
      placeholderSubtitle:
        "From raw keyword exports to intent-checked clusters, page decisions, briefs, and post-publish measurement.",
      placeholderSteps: [
        "Filter & Verify Intent",
        "Cluster by Reader Task",
        "Map Existing vs. New URLs",
        "Brief, Publish & Measure in GSC",
      ],
      alt: "Workflow diagram showing what to do after keyword research: clean list, check search intent, cluster keywords, map to pages, write content brief, and measure in Search Console",
    },
    tags: [
      { name: "Keyword Research", slug: { current: "keyword-research" } },
      { name: "Keyword Clustering", slug: { current: "keyword-clustering" } },
      { name: "Content Strategy", slug: { current: "content-strategy" } },
      { name: "On-Page SEO", slug: { current: "on-page-seo" } },
      { name: "Google Search Console", slug: { current: "google-search-console" } },
    ],
    relatedToolSlugs: [
      "keyword-clustering-tool",
      "search-intent-checker",
      "seo-content-brief-generator",
      "keyword-cannibalization-finder",
      "gsc-striking-distance-finder",
      "internal-link-opportunity-finder",
    ],
    content: afterKeywordResearchContent,
    headings: afterKeywordResearchMeta.headings,
    tableOfContents: afterKeywordResearchMeta.tableOfContents,
    faqs: afterKeywordResearchFaqs,
    displaySettings: {
      isOwnPageFeature: false,
    },
  },

  "seo:check-google-keyword-rankings": {
    _id: "static-seo-check-google-keyword-rankings",
    _type: "seo",
    title:
      "How to Check Ranking for Keywords in Google: 4 Free & Accurate Methods (Plus How to Beat AI Overviews)",
    slug: { current: "check-google-keyword-rankings" },
    publishedAt: "2026-11-07T00:30:00.000Z",
    _updatedAt: "2026-11-07T02:00:00.000Z",
    _createdAt: "2026-11-07T00:30:00.000Z",
    metatitle: "How to Check Keyword Rankings in Google (Free GSC & Tools)",
    metadesc:
      "Learn how to check ranking for keywords in Google using Search Console, live rank checkers, and the free Pos 8–20 finder—plus how to win AI Overviews.",
    schematitle:
      "How to Check Ranking for Keywords in Google (Step-by-Step SEO Guide)",
    schemadesc:
      "Complete step-by-step guide to checking your website's keyword rankings in Google Search results and Google Search Console, avoiding the Incognito trap, and optimizing for AI Overviews.",
    overview:
      "To check where a website ranks for specific keywords on Google, use three main approaches depending on whether you need a free internal audit in Google Search Console, a quick public SERP lookup, or daily competitor tracking—and then turn Positions 8 to 20 into real clicks.",
    readTime: { minutes: 14 },
    mainImage: {
      isPlaceholder: true,
      localUrl: "https://doitwithai.tools/logoForHeader.png",
      badge: "Do It With AI Tools • Google Rank Tracking & Position Zero Guide",
      recommendedFilename: "how-to-check-keyword-rankings-in-google-hero.webp",
      placeholderTitle:
        "How to Check Keyword Rankings in Google (And Turn Positions 8–20 Into Clicks)",
      placeholderSubtitle:
        "Compare Google Search Console, public live SERP checkers, and Striking Distance audits—plus how to get cited in Google AI Overviews.",
      placeholderSteps: [
        "GSC Average Position Audit",
        "Depersonalized Live SERP Check",
        "Positions 8–20 Quick-Win Filter",
        "4-Zone Action Playbook + AI Overviews",
      ],
      alt: "Step-by-step guide showing how to check ranking for keywords in Google using Search Console, live SERP rank checkers, and the GSC Striking Distance Keyword Finder",
    },
    tags: [
      { name: "Google Search Console", slug: { current: "google-search-console" } },
      { name: "Keyword Rankings", slug: { current: "keyword-rankings" } },
      { name: "AI Overviews", slug: { current: "ai-overviews" } },
      { name: "Striking Distance SEO", slug: { current: "striking-distance-seo" } },
      { name: "CTR Optimization", slug: { current: "ctr-optimization" } },
    ],
    relatedToolSlugs: [
      "gsc-striking-distance-finder",
      "gsc-ctr-optimizer",
      "keyword-cannibalization-finder",
      "ai-citation-readiness-checker",
      "internal-link-opportunity-finder",
      "serp-rich-result-preview-generator",
    ],
    content: checkKeywordRankingsContent,
    headings: checkKeywordRankingsMeta.headings,
    tableOfContents: checkKeywordRankingsMeta.tableOfContents,
    faqs: checkKeywordRankingsFaqs,
    displaySettings: {
      isOwnPageFeature: false,
    },
  },
};

export function getStaticArticle(slug, schemaType = "seo") {
  if (!slug) return null;
  const key = `${schemaType}:${slug}`;
  const doc = STATIC_ARTICLES[key];
  if (!doc) return null;
  return { ...doc, __source: "code-static" };
}

export function getStaticArticlesByType(schemaType = "seo") {
  const types = Array.isArray(schemaType) ? schemaType : [schemaType];
  return Object.values(STATIC_ARTICLES)
    .filter((doc) => types.includes(doc._type))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getStaticArticleSlugs(schemaType = "seo") {
  return getStaticArticlesByType(schemaType).map((doc) => ({
    slug: doc.slug.current,
  }));
}

export function getAllStaticArticleSitemapEntries() {
  return Object.values(STATIC_ARTICLES).map((doc) => ({
    slug: doc.slug.current,
    title: doc.title,
    _type: doc._type,
    _updatedAt: doc._updatedAt,
    publishedAt: doc.publishedAt,
  }));
}

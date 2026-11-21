/**
 * Layer 2: Standalone Infographic Copywriting & Anti-Duplication Engine
 *
 * Ensures every card title is a self-contained 2–5 word Concept Kernel (or complete
 * FAQ question ending in `?`), never ends mid-clause on a preposition/participle/verb,
 * scrubs deictic article references ("prompt above", "table below"), eliminates
 * title-body prefix duplication, and scores high-signal 2-tone headline highlights.
 */

const clean = (s: string) =>
  (s || "")
    .replace(/\*\*|__|`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

export const normText = (s: string) =>
  (s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

export const TRAILING_CLIFFHANGER_WORDS = new Set([
  // Articles & determiners
  "a",
  "an",
  "the",
  "this",
  "that",
  "these",
  "those",
  "such",
  "my",
  "your",
  "&",
  "practical",
  "his",
  "her",
  "its",
  "our",
  "their",
  "some",
  "any",
  "each",
  "every",
  "all",
  "both",
  "either",
  "neither",
  "another",
  "other",
  // Conjunctions & subordinators
  "and",
  "or",
  "but",
  "nor",
  "so",
  "yet",
  "because",
  "although",
  "though",
  "unless",
  "until",
  "since",
  "while",
  "whereas",
  "whether",
  "if",
  "than",
  // Prepositions
  "in",
  "on",
  "at",
  "to",
  "from",
  "by",
  "with",
  "of",
  "as",
  "for",
  "into",
  "onto",
  "upon",
  "within",
  "without",
  "through",
  "throughout",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "among",
  "under",
  "over",
  "across",
  "toward",
  "towards",
  "against",
  "about",
  "around",
  "like",
  "via",
  "per",
  "vs",
  // Pronouns & interrogatives
  "who",
  "whom",
  "whose",
  "which",
  "what",
  "where",
  "when",
  "why",
  "how",
  "you",
  "we",
  "they",
  "it",
  "he",
  "she",
  // Auxiliaries, copulas & dangling transitive verbs
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "can",
  "could",
  "will",
  "would",
  "shall",
  "should",
  "may",
  "might",
  "must",
  "not",
  "remain",
  "remains",
  "stay",
  "stays",
  "keep",
  "keeps",
  "make",
  "makes",
  "made",
  "get",
  "gets",
  "got",
  "need",
  "needs",
  "require",
  "requires",
  "preserve",
  "preserves",
  "include",
  "includes",
  "ensure",
  "ensures",
  "provide",
  "provides",
  "allow",
  "allows",
  "help",
  "helps",
  "check",
  "checks",
  "identify",
  "identifies",
  "compare",
  "compares",
  "start",
  "starts",
  "triggers",
  "trigger",
  "killed",
  "guarantees",
  "guarantee",
  "publish",
  // Participles / gerunds that dangle at clause cuts (e.g. "... section, including")
  "including",
  "missing",
  "checking",
  "using",
  "covering",
  "avoiding",
  "making",
  "creating",
  "building",
  "preserving",
  "requiring",
  "containing",
  "involving",
  "following",
  "preceding",
  "regarding",
  "concerning",
  "depending",
  "according",
  "comparing",
  "testing",
  "auditing",
  "reviewing",
  "editing",
  "rewriting",
  "responsible",
]);

const LEADING_DISCOURSE_RE =
  /^(?:however|therefore|moreover|furthermore|in addition|for example|for instance|in practice|specifically|ultimately|instead|meanwhile|as a result|on the other hand|at the same time|in short|simply put|first|second|third|finally),\s+/i;

const MINOR_TITLE_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "for",
  "nor",
  "on",
  "at",
  "to",
  "from",
  "by",
  "of",
  "in",
  "with",
  "as",
  "vs",
  "vs.",
]);

const UPPER_ACRONYMS = new Set([
  "ai",
  "seo",
  "aeo",
  "geo",
  "sxo",
  "aio",
  "nlp",
  "eeat",
  "api",
  "llm",
  "llms",
  "url",
  "cta",
  "serp",
  "faq",
  "faqs",
  "ui",
  "ux",
  "html",
  "json",
  "css",
  "svg",
  "png",
  "cwv",
  "roi",
]);

function formatCasePart(rawPart: string, allowMinorLower: boolean): string {
  const m = rawPart.match(/^([^\p{L}\p{N}]*)([\p{L}\p{N}'’]+?)([^\p{L}\p{N}]*)$/u);
  if (!m) return rawPart;
  const [, pre, core, post] = m;
  const low = core.toLowerCase();
  if (UPPER_ACRONYMS.has(low)) return `${pre}${core.toUpperCase()}${post}`;
  if (/^[A-Z0-9&/]{2,}$/.test(core)) return rawPart;
  if (allowMinorLower && MINOR_TITLE_WORDS.has(low) && !pre.includes("(")) {
    return `${pre}${low}${post}`;
  }
  const titled = low.replace(/^\p{Ll}/u, (c) => c.toUpperCase());
  return `${pre}${titled}${post}`;
}

export function toHeadlineCase(phrase: string): string {
  const words = clean(phrase).split(/\s+/).filter(Boolean);
  return words
    .map((w, idx) => {
      if (/[A-Z].*[A-Z]|[a-z][A-Z]|^\([A-Z]/.test(w)) return w;
      if (/^[A-Z0-9&/.-]{2,}$/.test(w)) {
        // Keep acronyms like E-E-A-T, AEO, SEO intact
        if (!/[a-z]/.test(w)) return w;
      }
      const prevEndsColon = idx > 0 && /[:—–-]$/.test(words[idx - 1]);
      const allowMinor = idx > 0 && idx < words.length - 1 && !prevEndsColon;
      return w
        .split("-")
        .map((part, pIdx) => formatCasePart(part, allowMinor && pIdx === 0))
        .join("-");
    })
    .join(" ");
}

/** Strips trailing cliffhangers, prepositions, auxiliaries, and participles while keeping >= 2 words. */
export function stripTrailingCliffhangers(raw: string): string {
  const cleaned = clean(raw);
  if (!cleaned) return "";
  if (cleaned.endsWith("?")) return cleaned;

  let out = cleaned.replace(/[,;:.!?\s]+$/, "");
  for (let i = 0; i < 8; i++) {
    const words = out.split(/\s+/).filter(Boolean);
    if (words.length <= 2) break;
    const lastWord = words[words.length - 1]
      .toLowerCase()
      .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
    const twoWordTail =
      words.length >= 3
        ? `${words[words.length - 2].toLowerCase().replace(/[^\p{L}]/gu, "")} ${lastWord}`
        : "";
    if (
      [
        "such as",
        "based on",
        "instead of",
        "due to",
        "prior to",
        "responsible for",
        "rather than",
      ].includes(twoWordTail) &&
      words.length - 2 >= 2
    ) {
      out = words
        .slice(0, -2)
        .join(" ")
        .replace(/[,;:.!?\s]+$/, "");
      continue;
    }
    if (TRAILING_CLIFFHANGER_WORDS.has(lastWord)) {
      out = words
        .slice(0, -1)
        .join(" ")
        .replace(/[,;:.!?\s]+$/, "");
      continue;
    }
    break;
  }
  return out;
}

/** Returns true when a non-question title ends with a cliffhanger word or trailing punctuation. */
export function hasTrailingCliffhanger(title: string): boolean {
  const t = clean(title);
  if (!t || t.endsWith("?")) return false;
  if (/[,;:\-–—]$/.test(t)) return true;
  const words = t.split(/\s+/).filter(Boolean);
  if (!words.length) return false;
  const last = words[words.length - 1]
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
  return TRAILING_CLIFFHANGER_WORDS.has(last);
}

/**
 * Scrubs deictic document references ("prompt above", "table below", "as mentioned earlier")
 * so every infographic card reads as a self-contained visual artifact.
 */
export function decontextualizeProse(text: string): string {
  let out = clean(text);
  if (!out) return "";

  out = out.replace(
    /^(?:use|apply|copy|run|try|follow|adapt)\s+the\s+(?:revised\s+|updated\s+|sample\s+|example\s+)?(prompt|template|checklist|workflow|framework|table|chart|formula|script|rubric)\s+(?:above|below|earlier|previously|shown above|shown below|in this section)\b/gi,
    "Use a structured $1",
  );
  out = out.replace(
    /\bthe\s+(?:revised\s+|updated\s+|sample\s+|example\s+)?(prompt|template|checklist|workflow|framework|table|chart|formula|script|rubric)\s+(?:above|below|earlier|previously|shown above|shown below|in this section|from earlier)\b/gi,
    "a structured $1",
  );
  out = out.replace(
    /\b(?:as\s+)?(?:mentioned|noted|shown|discussed|explained|seen|outlined)\s+(?:above|below|earlier|previously|in the (?:previous|above) section)[,:\s-]*/gi,
    "",
  );
  out = out.replace(
    /\b(?:in the (?:section|paragraph|table|example|list|chart|step) (?:above|below|earlier)|see (?:above|below) for details)\b[,.\s]*/gi,
    "",
  );
  // Collapse accidental word/phrase stutters from source HTML (e.g. "became central became a central")
  out = out.replace(
    /\b(became|is|was|are|were)\s+(\w+)\s+\1\s+(?:a|an|the)?\s*\2\b/gi,
    "$1 a $2",
  );
  out = out.replace(/\s{2,}/g, " ").trim();
  return out ? out.replace(/^\p{Ll}/u, (c) => c.toUpperCase()) : "";
}

/**
 * Detects whether a card's body text repeats its title verbatim, starts with it,
 * or shares >55% of significant title tokens inside its opening 6 words.
 */
export function hasTitleBodyDuplication(title: string, detail: string): boolean {
  const nt = normText(title);
  const nd = normText(detail);
  if (!nt || !nd) return false;
  if (nd === nt || nd.startsWith(`${nt} `) || nd.startsWith(nt)) return true;

  const stop = new Set([
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "from",
    "into",
    "your",
  "&",
  "practical",
    "our",
    "are",
    "was",
    "can",
  ]);
  const titleTokens = nt
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stop.has(w));
  const detailLeadTokens = new Set(nd.split(/\s+/).slice(0, 6));
  if (!titleTokens.length) return false;

  const hits = titleTokens.filter((w) => detailLeadTokens.has(w)).length;
  return hits / titleTokens.length > 0.55;
}

function splitSentences(text: string): string[] {
  return clean(text)
    .split(/(?<=[.!?])\s+(?=[\p{Lu}\d])/u)
    .filter(Boolean);
}

function finalizePair(
  rawTitle: string,
  rawDetail: string,
  fullSourceText: string,
  isFaq = false,
): { title: string; detail: string } {
  let title = clean(rawTitle);
  let detail = decontextualizeProse(rawDetail);

  if (isFaq || title.endsWith("?")) {
    const q = title.endsWith("?")
      ? title
      : `${stripTrailingCliffhangers(title)}?`;
    const bodySentences = splitSentences(decontextualizeProse(fullSourceText));
    const answerText =
      bodySentences.find((s) => !s.trim().endsWith("?")) || detail;
    const subject = q.match(/^what is (.+?)\?$/i)?.[1];
    const standaloneAnswer = subject
      ? answerText.replace(/^it\s+/i, () => `${subject} `)
      : answerText;
    return {
      title: q.replace(/^\p{Ll}/u, (c) => c.toUpperCase()),
      detail: clean(standaloneAnswer || detail).replace(/^\p{Ll}/u, (c) =>
        c.toUpperCase(),
      ),
    };
  }

  title = stripTrailingCliffhangers(title);

  // Hard anti-duplication & cliffhanger guard
  if (hasTitleBodyDuplication(title, detail)) {
    const allSentences = splitSentences(decontextualizeProse(fullSourceText));
    const secondSentence = allSentences[1];
    if (
      secondSentence &&
      secondSentence.length >= 24 &&
      !hasTitleBodyDuplication(title, secondSentence)
    ) {
      detail = secondSentence;
    } else {
      // Compress title to 2–4 core concept words or rewrite lead of detail
      const strippedLead = detail
        .replace(
          new RegExp(
            `^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[.,:;!?\\s\\-–—•·]*`,
            "i",
          ),
          "",
        )
        .replace(/^[.,:;!?\-–—•·]+\s*/, "")
        .replace(/^(?:including|that|which|to|by|with|and|for)\s+/i, "")
        .trim();

      if (strippedLead.split(/\s+/).length >= 5) {
        const cap = strippedLead.replace(/^\p{Ll}/u, (c) => c.toUpperCase());
        detail = /[.!?]$/.test(cap) ? cap : `${cap}.`;
      }

      // If still overlapping, elevate the title into an abstract Concept Kernel
      if (hasTitleBodyDuplication(title, detail)) {
        const nounTokens = clean(title)
          .split(/\s+/)
          .filter(
            (w) =>
              w.length >= 3 &&
              !TRAILING_CLIFFHANGER_WORDS.has(w.toLowerCase()),
          );
        const coreConcept =
          nounTokens.length >= 2
            ? `Focus: ${toHeadlineCase(nounTokens.slice(-2).join(" "))}`
            : "Core Principle";
        if (!hasTitleBodyDuplication(coreConcept, detail)) {
          title = coreConcept;
        }
      }
    }
  }

  const finalDetail = clean(detail)
    .replace(/^[.,:;!?\-–—•·]+\s*/, "")
    .replace(/^\p{Ll}/u, (c) => c.toUpperCase());
  return {
    title: toHeadlineCase(stripTrailingCliffhangers(title)),
    detail: /[.!?]$/.test(finalDetail) ? finalDetail : `${finalDetail}.`,
  };
}

const RHETORICAL_OR_FRAGMENT_RE =
  /^(?:you decide whether|most people only|and optimizing|is not a fixed|not because|but because|so i went|i wanted to|a lot of what you see|in this guide|this guide took|let['’]?s look|here is why|think about|that is why|you have probably noticed|we have seen a huge|this guide is not|if you have read other|if you want (?:a |to )|but something else was happening)\b|\b(?:you can explore our|detailed guide on|framework you used earlier|happened on your side)\b/i;

/** Returns true when a sentence is conversational filler or a sentence fragment unsuitable as standalone card copy. */
export function isRhetoricalOrFragmentSentence(sentence: string): boolean {
  const s = clean(sentence);
  if (!s || s.length < 22) return true;
  if (RHETORICAL_OR_FRAGMENT_RE.test(s)) return true;
  if (/[:;]$/.test(s) || /\b(?:including|such as|covering)[.:]?$/i.test(s)) {
    return true;
  }
  return false;
}

/**
 * Compresses verbose, conversational, or parenthetical H3/H4 headings (>5 words)
 * into sharp 2–5 word standalone Concept Kernels while keeping short technical
 * headings and FAQ questions intact.
 */
export function compressHeadingToConceptTitle(
  rawHeading: string,
  bodyContext?: string,
  isFaq = false,
): string {
  const raw = clean(rawHeading);
  if (!raw) return "";
  if (isFaq) return raw;

  // Preserve short, already-crisp headings (<= 5 words and <= 42 chars, without conversational parens)
  const rawWords = raw.split(/\s+/).filter(Boolean);
  if (
    rawWords.length <= 5 &&
    raw.length <= 42 &&
    !/\(/.test(raw) &&
    !/^(?:so\s+what|and\s+)/i.test(raw)
  ) {
    return raw.replace(/^\d+\.\s+/, "");
  }

  let working = raw
    // Strip conversational parentheticals
    .replace(
      /\s*\((?:and why|why most|simple definition|what most|and how|see below|overview|explained)[^)]*\)/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();

  // Pattern 1: Acronym expansion ("What Is AEO (Answer Engine Optimization) ...", "SXO ( Search Experience Optimization)")
  const acronymMatch = working.match(
    /^(?:what\s+is\s+)?([A-Z]{2,6})\s*\(\s*([^)]{3,44}?)\s*\)/i,
  );
  if (acronymMatch) {
    const code = acronymMatch[1].toUpperCase();
    const expansion = toHeadlineCase(
      stripTrailingCliffhangers(clean(acronymMatch[2])),
    );
    return `${code}: ${expansion}`;
  }

  // Pattern 2: Conversational non-FAQ question headings ("So What Exactly Is AI SEO?")
  const whatIsMatch = working.match(
    /^(?:so\s+)?what\s+(?:exactly\s+)?is\s+([^?]+)\??$/i,
  );
  if (whatIsMatch) {
    const subj = stripTrailingCliffhangers(clean(whatIsMatch[1]));
    return `Core ${toHeadlineCase(subj)} Definition`;
  }

  // Pattern 3: Numbered / Phased / Myth / Mistake headings with colons or em-dashes
  const strippedNum = working.replace(/^\d+\.\s+/, "");
  const colonIdx = strippedNum.search(/:\s+|\s+[—–]\s+/);
  if (colonIdx > 2) {
    const left = clean(strippedNum.slice(0, colonIdx)).replace(
      /\s*\(\d{4}\s*[–-]\s*\d{4}\)/,
      "",
    );
    const right = clean(
      strippedNum.slice(colonIdx).replace(/^[:\s—–-]+/, ""),
    );

    if (/^(?:phase|step|myth|mistake|revolution|factor)\b/i.test(left)) {
      const cleanedRight = right
        .replace(
          /^(?:the\s+rise\s+of|you\s+can|practitioners|search\s+engines\s+became|the\s+multi-platform)\s+/i,
          (m) => {
            if (/the\s+multi-platform/i.test(m)) return "Multi-Platform ";
            if (/search\s+engines\s+became/i.test(m)) return "AI Search ";
            return "";
          },
        )
        .replace(/^AI Search AI-Powered$/i, "AI-Powered Search")
        .replace(/\bautomatically\s+/gi, "")
        .replace(/\s+at\s+scale\s+without\s+editing\b/i, " Unedited")
        .replace(/\s+without\s+editing\b/i, " Unedited")
        .replace(/\bbrief\s+creation$/i, "Briefs")
        .replace(/\s+and\s+/gi, " & ")
        .trim();
      const rightWords = cleanedRight.split(/\s+/).filter(Boolean);
      const compactRight = stripTrailingCliffhangers(
        (rightWords.length > 6 || cleanedRight.length > 40
          ? rightWords.slice(0, 5)
          : rightWords
        ).join(" "),
      );
      if (compactRight) {
        return `${toHeadlineCase(left)}: ${toHeadlineCase(compactRight)}`;
      }
    }

    // If right side starts with "Using..." or is a long subtitle for an already named concept
    if (
      left.split(/\s+/).length <= 3 &&
      left.length <= 24 &&
      (/^(?:using|how to|two more|a practical|understanding)\b/i.test(right) ||
        right.length > 42)
    ) {
      if (/\bworkflow/i.test(right) && !/\bworkflow/i.test(left)) {
        return `${toHeadlineCase(left)} Workflows`;
      }
      if (/signals/i.test(right)) {
        return `${toHeadlineCase(left.replace(/\band\b/gi, "&"))} Signals`;
      }
      return left.length >= 6
        ? `${toHeadlineCase(left)} Pillars`
        : toHeadlineCase(stripTrailingCliffhangers(right.split(/\s+/).slice(0, 5).join(" ")));
    }

    if (left.split(/\s+/).length <= 3 && right.split(/\s+/).length <= 5) {
      return `${toHeadlineCase(left)}: ${toHeadlineCase(right)}`;
    }
  }

  // Pattern 4: Structural narrative H3s
  const twoNounsMatch = working.match(
    /^(?:the\s+)?(two|three|four|five|key|core)\s+([a-z]+)\s+that\s+(?:created|shaped|drive|define|power)\s+(.+)$/i,
  );
  if (twoNounsMatch) {
    return `${toHeadlineCase(twoNounsMatch[1])} ${toHeadlineCase(twoNounsMatch[2])} of ${toHeadlineCase(stripTrailingCliffhangers(twoNounsMatch[3]))}`;
  }

  const mergedMatch = working.match(
    /^how\s+(.{4,32}?)\s+merged\s+into\s+one\s+discipline$/i,
  );
  if (mergedMatch) {
    return `${toHeadlineCase(clean(mergedMatch[1]).replace(/\s+and\s+/i, " & "))} Convergence`;
  }

  const whyImportantMatch = working.match(
    /^why\s+(.{3,24}?)\s+is\s+(?:even\s+)?more\s+important\s+for\s+(.{3,24}?)\s+than\b.+$/i,
  );
  if (whyImportantMatch) {
    return `Why ${toHeadlineCase(clean(whyImportantMatch[1]))} Powers ${toHeadlineCase(clean(whyImportantMatch[2]))}`;
  }

  // Strip trailing relative clauses ("that still matter...", "that determine whether...")
  let compact = strippedNum
    .replace(
      /\s+(?:that|which|where|when|while|and why|and how|for sustainable)\b.*$/i,
      "",
    )
    .replace(/\b(?:how|why)\s+user\s+/i, "")
    .replace(/\bhas\s+changed\s+in\s+the\s+/i, " in ")
    .replace(/^turning\s+/i, "")
    .replace(/\s+and\s+/gi, " & ")
    .trim();

  const words = compact.split(/\s+/).filter(Boolean);
  if (words.length > 6 || compact.length > 46) {
    compact = stripTrailingCliffhangers(words.slice(0, 6).join(" "));
  } else {
    compact = stripTrailingCliffhangers(compact);
  }

  if (!compact && bodyContext) {
    const firstTopic = clean(bodyContext)
      .split(/\s+/)
      .slice(0, 4)
      .join(" ");
    return toHeadlineCase(stripTrailingCliffhangers(firstTopic));
  }
  return toHeadlineCase(compact || working);
}

/**
 * Picks 1–2 high-signal informative sentences from `sentencesList`, rejecting
 * rhetorical fragments and lines that duplicate `title`.
 */
function buildSubstantiveDetail(
  title: string,
  primarySentence: string,
  fullSentences: string[],
): string {
  const cleanPrimary = decontextualizeProse(primarySentence).replace(
    LEADING_DISCOURSE_RE,
    "",
  );
  const pool = fullSentences.filter(
    (s) =>
      !isRhetoricalOrFragmentSentence(s) &&
      !hasTitleBodyDuplication(title, s),
  );

  let chosen =
    !isRhetoricalOrFragmentSentence(cleanPrimary) &&
    !hasTitleBodyDuplication(title, cleanPrimary)
      ? cleanPrimary
      : pool[0] || cleanPrimary;

  // Enrich very short (<36 char) details with a complementary sentence from the same block when available
  if (chosen.length < 36 && pool.length >= 2) {
    const second = pool.find(
      (s) => normText(s) !== normText(chosen) && chosen.length + s.length + 1 <= 185,
    );
    if (second) {
      chosen = `${chosen.replace(/[.]$/, "")}. ${second}`;
    }
  }

  return chosen.replace(/^\p{Ll}/u, (c) => c.toUpperCase());
}

/**
 * Synthesizes a standalone 2–5 word Concept Kernel title (or full FAQ question)
 * and a non-overlapping explanatory detail from article prose or preset titles.
 */
export function synthesizeStandaloneTitleAndDetail(
  rawBlockText: string,
  primarySentence: string,
  presetTitle?: string,
  options?: { isFaq?: boolean; index?: number },
): { title: string; detail: string } {
  const full = decontextualizeProse(rawBlockText);
  const candidate = decontextualizeProse(primarySentence || rawBlockText).replace(
    LEADING_DISCOURSE_RE,
    "",
  );
  const fullSentences = splitSentences(full);
  const firstQuestionSentence = fullSentences.find((s) =>
    s.trim().endsWith("?"),
  );

  // Rule A: FAQ Question Preservation — only when section is an FAQ or heading itself is a genuine Q&A question
  const cleanPreset = clean(presetTitle || "");
  if (
    options?.isFaq ||
    (cleanPreset.endsWith("?") &&
      !/\b(?:so what|what exactly)\b/i.test(cleanPreset))
  ) {
    const qTitle = cleanPreset.endsWith("?")
      ? cleanPreset
      : firstQuestionSentence || cleanPreset || candidate;
    const answerCandidates = fullSentences.filter(
      (s) => normText(s) !== normText(qTitle) && !s.trim().endsWith("?"),
    );
    const answerText =
      answerCandidates.slice(0, 2).join(" ") ||
      decontextualizeProse(rawBlockText)
        .replace(qTitle, "")
        .trim() ||
      candidate;
    return finalizePair(qTitle, answerText, full, true);
  }

  // Compress verbose/conversational preset headings (H3/H4) into Concept Kernels
  if (cleanPreset) {
    const compressedPreset = compressHeadingToConceptTitle(
      cleanPreset,
      full,
      false,
    );
    const builtDetail = buildSubstantiveDetail(
      compressedPreset,
      candidate,
      fullSentences,
    );
    if (
      compressedPreset &&
      !hasTrailingCliffhanger(compressedPreset) &&
      !hasTitleBodyDuplication(compressedPreset, builtDetail)
    ) {
      return {
        title: compressedPreset,
        detail: builtDetail,
      };
    }
    return finalizePair(compressedPreset || cleanPreset, builtDetail, full);
  }

  // Rule B: Explicit defined concept ("known as / defined as ...")
  const definedMatch = full.match(
    /\b(?:described as|known as|called|termed|referred to as|defined as)\s+["“]?([a-z0-9][\w\s-]{2,36}?)(?:["”.,;]|(?:\s+(?:because|where|when|which|that|since|as|in)\b))/i,
  );
  if (definedMatch) {
    const rawTerm = stripTrailingCliffhangers(definedMatch[1]);
    const termWords = rawTerm.split(/\s+/).filter(Boolean);
    const title = toHeadlineCase(
      termWords.length <= 2 ? `${rawTerm} Behavior` : rawTerm,
    );
    const afterBecause = full.match(
      /\b(?:described as|known as|called|termed|referred to as|defined as)\s+["“]?[a-z0-9][\w\s-]{2,36}?["”]?\s+because\s+(.+)/i,
    );
    const detail = afterBecause?.[1] ? afterBecause[1] : candidate;
    return finalizePair(title, detail, full);
  }

  // Rule C: Quantitative study / benchmark pattern
  const studyPctMatch = full.match(
    /\b(?:studies|research|data|reports?|surveys?|analysis)\b.*?\b(?:indicate|show|find|reveal|suggest|estimate)s?\s+that\s+(?:approximately\s+|roughly\s+|about\s+|nearly\s+|over\s+|more\s+than\s+)?(\d+(?:\s*(?:to|–|-)\s*\d+)?)\s*(?:percent|%)\s+of\s+([a-z0-9][\w\s-]{3,32}?)(?:[.,;(]|\s+(?:now\s+|currently\s+|already\s+)?(?:end|result|happen|occur|take|use|rely|are|is|were|was)\b)/i,
  );
  if (studyPctMatch) {
    const pct = studyPctMatch[1].replace(/\s*(?:to|-)\s*/i, "–");
    const title = /without a click|zero-click/i.test(full)
      ? `${pct}% Zero-Click Searches`
      : toHeadlineCase(`${pct}% ${stripTrailingCliffhangers(studyPctMatch[2])}`);
    return finalizePair(title, candidate, full);
  }

  // Rule D: Explicit colon or em-dash delimiter ("Title: Detail" / "Title — Detail")
  const delimiter = full.match(/\s[—–]\s|:/);
  const colon = delimiter?.index ?? -1;
  if (colon > 3 && colon < 78) {
    const rawPrefix = full.slice(0, colon).trim();
    const rhs = full.slice(colon + (delimiter?.[0].length || 1)).trim();
    if (/has two (?:meanings|parts|pillars|sides)/i.test(rawPrefix)) {
      const subj = rawPrefix
        .replace(/\s+has two (?:meanings|parts|pillars|sides).*$/i, "")
        .trim();
      return finalizePair(
        `${subj || "Core Topic"}: Two Core Meanings`,
        rhs,
        full,
      );
    }
    return finalizePair(rawPrefix, rhs || candidate, full);
  }

  // Rule E: High-signal structural patterns on procedural/editorial prose
  // E1. Human ownership / verification ("You remain responsible for checking...")
  if (
    /\b(?:you remain responsible for|remain responsible for|final accountability|human verification)\b/i.test(
      candidate,
    )
  ) {
    const targetObj = candidate
      .replace(/^.*?\bresponsible for\s+(?:checking|verifying|reviewing)?\s*/i, "")
      .replace(/[.]$/, "");
    const title = "Verify Final Output Accuracy";
    const detail = targetObj
      ? `Maintain final accountability by verifying ${targetObj} before publishing.`
      : "Maintain final editorial accountability by verifying the output before publishing.";
    return finalizePair(title, detail, full);
  }

  // E2. Comma-series audit/diagnostic enumeration ("Identify A, B, C, and D" / "Check A, B, C, and D")
  const seriesAuditMatch = candidate.match(
    /^(identify|audit|spot|detect|flag|check|verify|review|inspect)\s+(.+)/i,
  );
  if (seriesAuditMatch && (seriesAuditMatch[2].match(/,/g) || []).length >= 2) {
    const verb = seriesAuditMatch[1].toLowerCase();
    const listBody = seriesAuditMatch[2];
    let title = "Audit Key Quality Factors";
    if (
      /references|sentences|definitions|transitions|clarity|prose|dense|weak/i.test(
        listBody,
      )
    ) {
      title = "Audit Structural Clarity Gaps";
    } else if (/facts|uncertainty|conditions|performs|action|actor/i.test(listBody)) {
      title = "Verify Facts, Conditions & Actors";
    } else if (["check", "verify", "inspect"].includes(verb)) {
      title = "Run Pre-Publish Quality Audit";
    } else {
      title = "Diagnose Priority Text Issues";
    }
    return finalizePair(title, candidate, full);
  }

  // E3. Preservation / requirement clause ("Request a revision that preserves...")
  const preserveMatch = candidate.match(
    /^(?:request|ask for|aim for|apply|generate)\s+(?:a|an)?\s*revision\s+that\s+(?:preserves?|keeps?|maintains?)\s+(.+)/i,
  );
  if (preserveMatch) {
    const preserved = clean(preserveMatch[1]).replace(/[.]$/, "");
    return finalizePair(
      "Preserve Core Meaning & Details",
      `Apply editorial improvements while keeping ${preserved} intact.`,
      full,
    );
  }

  // E4. Scope + inclusion clause ("Start with one coherent section, including nearby context.")
  const inclusionMatch = candidate.match(
    /^(.{12,56}?),?\s+including\s+(.+)/i,
  );
  if (inclusionMatch) {
    const lead = inclusionMatch[1]
      .replace(/^(?:start with|begin with|focus on)\s+/i, "")
      .replace(/^(?:one|a|the)\s+/i, "");
    const title = toHeadlineCase(
      /^coherent section$/i.test(lead)
        ? "Isolate One Coherent Section"
        : stripTrailingCliffhangers(lead).split(/\s+/).slice(0, 4).join(" "),
    );
    const detail = `Include ${clean(inclusionMatch[2])}`;
    return finalizePair(title, detail, full);
  }

  // E5. Compound "Preview ... and test whether ..." or Purpose split ("<Lead> to <Purpose>")
  const andTestMatch = candidate.match(
    /^(.{12,64}?)\s+and\s+(?:test|check|verify|confirm)\s+(?:whether\s+)?(.+)/i,
  );
  if (andTestMatch) {
    const leftClause = clean(andTestMatch[1]);
    const rightGoal = clean(andTestMatch[2]).replace(/[.]$/, "");
    const title = /page layout/i.test(leftClause)
      ? "Test In-Page Reader Flow"
      : toHeadlineCase(
          stripTrailingCliffhangers(
            rightGoal.split(/\s+/).slice(0, 4).join(" "),
          ),
        );
    const detail = `${leftClause.replace(/^\p{Ll}/u, (c) => c.toUpperCase())} so ${rightGoal}.`;
    return finalizePair(title, detail, full);
  }

  // E6. Structured prompt / purpose split ("Use a structured prompt to avoid rigid sentence-length rules.")
  const purposeMatch = candidate.match(
    /^(.{10,52}?)\s+(?:to|so that|in order to)\s+(.+)/i,
  );
  if (purposeMatch) {
    const leadClause = clean(purposeMatch[1]);
    const purposeClause = clean(purposeMatch[2]).replace(/[.]$/, "");
    const isGenericLead = /^(?:use a structured|apply a structured|run a)\b/i.test(
      leadClause,
    );
    if (isGenericLead) {
      const purposeWords = stripTrailingCliffhangers(
        purposeClause.split(/\s+/).slice(0, 5).join(" "),
      );
      return finalizePair(
        toHeadlineCase(purposeWords),
        `${leadClause.replace(/^\p{Ll}/u, (c) => c.toUpperCase())} specifically designed to ${purposeClause}.`,
        full,
      );
    }
    const leadTitle = stripTrailingCliffhangers(
      leadClause.split(/\s+/).slice(0, 5).join(" "),
    );
    return finalizePair(toHeadlineCase(leadTitle), candidate, full);
  }

  // E7. Provide / supply <X> with <Y> ("Provide context and important constraints with the section being edited.")
  const supplyMatch = candidate.match(
    /^(?:provide|supply|include|attach|share)\s+(.{8,48}?)\s+(?:with|for|alongside)\s+(.+)/i,
  );
  if (supplyMatch) {
    const rawObjects = clean(supplyMatch[1])
      .replace(/\bimportant\b/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();
    const title = toHeadlineCase(
      `Supply ${rawObjects.replace(/\band\b/i, "&")}`,
    );
    const detail = `Pair ${clean(supplyMatch[2]).replace(/[.]$/, "")} with ${rawObjects}.`;
    return finalizePair(title, detail, full);
  }

  // E8. Compare X with Y ("Compare the revision with the original...")
  const compareMatch = candidate.match(
    /^compare\s+(?:the\s+)?(\w+)\s+(?:with|against|to)\s+(?:the\s+)?(.+)/i,
  );
  if (compareMatch) {
    const lhs = toHeadlineCase(compareMatch[1]);
    const rhsClause = compareMatch[2].split(
      /(?:[,.]|\s+(?:before|when|while|after|in order to|to ensure)\b)/i,
    )[0];
    const rhs = toHeadlineCase(stripTrailingCliffhangers(rhsClause));
    return finalizePair(`Benchmark ${lhs} vs. ${rhs}`, candidate, full);
  }

  // E9. General subject/verb sentence
  const subjectMatch = candidate.match(
    /^([A-Z0-9][\w\s&/-]{3,42}?)\s+(?:is|are|was|were|focuses\s+on|helps|enables|requires|means|refers\s+to|combines|connects|provides|allows|turns|supports)\b/,
  );
  if (
    subjectMatch &&
    !/^(?:this|that|these|those|it|they|we|you)\b/i.test(subjectMatch[1].trim())
  ) {
    const subj = stripTrailingCliffhangers(subjectMatch[1]);
    const words = subj.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 5) {
      return finalizePair(toHeadlineCase(subj), candidate, full);
    }
  }

  // General fallback: extract up to 5 words from lead clause, scrub cliffhangers, and enforce non-overlap
  const clause = candidate.split(
    /[;—–]|,\s+(?:which|while|because|and|so|but|including)\b/,
  )[0];
  const compressed = stripTrailingCliffhangers(
    clause.split(/\s+/).filter(Boolean).slice(0, 5).join(" "),
  );
  return finalizePair(
    compressed || candidate.split(/\s+/).slice(0, 4).join(" "),
    candidate,
    full,
  );
}

const HIGHLIGHT_STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "and",
  "or",
  "by",
  "at",
  "from",
  "into",
  "is",
  "are",
  "was",
  "were",
  "be",
  "how",
  "why",
  "what",
  "when",
  "where",
  "your",
  "&",
  "practical",
  "our",
  "their",
  "this",
  "that",
  "these",
  "those",
  "can",
  "should",
  "does",
  "do",
]);

const GENERIC_META_WORDS = new Set([
  "section",
  "sections",
  "article",
  "articles",
  "post",
  "posts",
  "guide",
  "guides",
  "page",
  "pages",
  "part",
  "parts",
  "step",
  "steps",
  "asked",
  "questions",
  "frequently",
]);

const HIGH_SIGNAL_ACTION_VERBS = new Set([
  "diagnose",
  "revise",
  "audit",
  "optimize",
  "verify",
  "benchmark",
  "automate",
  "structure",
  "improve",
  "measure",
  "build",
  "compare",
  "scale",
  "accelerate",
  "validate",
]);

function isLowSignalPhrase(phrase: string): boolean {
  const words = clean(phrase)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return true;
  const first = words[0];
  const last = words[words.length - 1];
  if (HIGHLIGHT_STOPWORDS.has(first) || HIGHLIGHT_STOPWORDS.has(last)) {
    return true;
  }
  const hasStrongWord = words.some(
    (w) => !HIGHLIGHT_STOPWORDS.has(w) && !GENERIC_META_WORDS.has(w),
  );
  if (!hasStrongWord) {
    // Allow highlighting "Frequently Asked" only if the entire headline is purely meta words
    return words.length <= 2 && GENERIC_META_WORDS.has(last);
  }
  return false;
}

/**
 * Selects 1–2 high-signal concept phrases from a section headline for 2-tone
 * accent rendering, rejecting weak stop-word/meta tails like "a section".
 */
export function scoreHeadlineHighlightPhrases(
  headline: string,
  customHighlightWords?: string,
): string[] {
  const cleanHeadline = clean(headline);
  if (!cleanHeadline) return [];

  if (customHighlightWords !== undefined) {
    const manual = customHighlightWords
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length >= 2)
      .filter((s) => {
        const lowerWords = s.toLowerCase().split(/\s+/);
        // Reject legacy auto-picked junk like "a section" if it leaked from older saves
        if (
          lowerWords.length <= 2 &&
          lowerWords.every(
            (w) => HIGHLIGHT_STOPWORDS.has(w) || GENERIC_META_WORDS.has(w),
          )
        ) {
          return false;
        }
        return !HIGHLIGHT_STOPWORDS.has(lowerWords[0]);
      })
      .slice(0, 3);
    if (manual.length > 0) return manual;
    if (!customHighlightWords.trim()) {
      // Fall through to auto-scoring if caller passed empty string? No: empty string explicitly clears highlights if no auto-fallback desired,
      // EXCEPT when existing stale auto-pick "a section" was scrubbed above — in that case re-score!
      return [];
    }
  }

  // If headline uses "Part A: Part B" or "Part A — Part B", keep colon strategy
  const colonParts = cleanHeadline.split(/:\s+|\s+[—–]\s+/);
  if (colonParts.length >= 2 && colonParts[0].length <= 42) {
    const first = colonParts[0].trim();
    const secondWords = colonParts[1]
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .join(" ")
      .replace(/[?.!,;:]$/, "");
    const picks = [first, secondWords].filter(
      (s) => s.length >= 3 && !isLowSignalPhrase(s),
    );
    if (picks.length > 0) return picks;
  }

  // Special clean handling for pure meta FAQ titles like "Frequently Asked Questions"
  if (/^frequently asked questions$/i.test(cleanHeadline)) {
    return ["Frequently Asked"];
  }

  const rawWords = cleanHeadline
    .split(/\s+/)
    .map((w) => w.replace(/^[“"'(]+|[”"')?!.,;:]+$/g, ""))
    .filter(Boolean);

  if (!rawWords.length) return [];

  const candidates: Array<{ phrase: string; score: number }> = [];
  const maxSpan = Math.min(3, rawWords.length);

  for (let len = 2; len <= maxSpan; len++) {
    for (let i = 0; i <= rawWords.length - len; i++) {
      const span = rawWords.slice(i, i + len);
      const firstLow = span[0].toLowerCase();
      const lastLow = span[span.length - 1].toLowerCase();
      if (HIGHLIGHT_STOPWORDS.has(firstLow) || HIGHLIGHT_STOPWORDS.has(lastLow)) {
        continue;
      }

      let score = len === 3 ? 2 : 1;
      let strongTokens = 0;

      for (const tok of span) {
        const low = tok.toLowerCase();
        if (HIGHLIGHT_STOPWORDS.has(low)) {
          score -= 1;
          continue;
        }
        if (GENERIC_META_WORDS.has(low)) {
          score -= 3;
          continue;
        }
        strongTokens++;
        if (HIGH_SIGNAL_ACTION_VERBS.has(low)) score += 5;
        else if (/^[A-Z]{2,}|[A-Z][a-z]+[A-Z]/.test(tok)) score += 6;
        else if (/[-–]/.test(tok)) score += 4;
        else if (tok.length >= 5) score += 3;
        else score += 1.5;
      }

      if (strongTokens === 0) continue;
      // Bonus when span forms an action phrase ("diagnose and revise") or technical compound ("ChatGPT editing workflow")
      if (span.length === 3 && span[1].toLowerCase() === "and") score += 2;
      candidates.push({ phrase: span.join(" "), score });
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score);
    return [candidates[0].phrase];
  }

  // Fallback to strongest single word (never a stopword)
  const bestSingle = rawWords.find(
    (w) =>
      !HIGHLIGHT_STOPWORDS.has(w.toLowerCase()) &&
      !GENERIC_META_WORDS.has(w.toLowerCase()),
  );
  return bestSingle ? [bestSingle] : [rawWords[0]];
}

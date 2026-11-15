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

export function toHeadlineCase(phrase: string): string {
  const words = clean(phrase).split(/\s+/).filter(Boolean);
  return words
    .map((w, idx) => {
      if (/^[A-Z0-9&/-]{2,}$/.test(w)) return w;
      const lower = w.toLowerCase();
      if (idx > 0 && idx < words.length - 1 && MINOR_TITLE_WORDS.has(lower)) {
        return lower;
      }
      return lower
        .split("-")
        .map((part) => part.replace(/^\p{Ll}/u, (c) => c.toUpperCase()))
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
    return {
      title: q.replace(/^\p{Ll}/u, (c) => c.toUpperCase()),
      detail: clean(answerText || detail).replace(/^\p{Ll}/u, (c) =>
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
            `^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[,:;\\s-]*`,
            "i",
          ),
          "",
        )
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

  const finalDetail = clean(detail).replace(/^\p{Ll}/u, (c) => c.toUpperCase());
  return {
    title: toHeadlineCase(stripTrailingCliffhangers(title)),
    detail: /[.!?]$/.test(finalDetail) ? finalDetail : `${finalDetail}.`,
  };
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

  // Rule A: FAQ Question Preservation — never truncate or strip "What is / What are"
  const cleanPreset = clean(presetTitle || "");
  if (
    options?.isFaq ||
    cleanPreset.endsWith("?") ||
    (firstQuestionSentence && firstQuestionSentence.length <= 110)
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

  // Respect non-overlapping clean preset titles (e.g. strong H3 headings)
  if (
    cleanPreset &&
    !hasTrailingCliffhanger(cleanPreset) &&
    !hasTitleBodyDuplication(cleanPreset, candidate)
  ) {
    return {
      title: cleanPreset,
      detail: candidate.replace(/^\p{Ll}/u, (c) => c.toUpperCase()),
    };
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
    const tail = clean(inclusionMatch[2]).replace(/[.]$/, "");
    const title = toHeadlineCase(
      /^coherent section$/i.test(lead)
        ? "Isolate One Coherent Section"
        : stripTrailingCliffhangers(lead).split(/\s+/).slice(0, 4).join(" "),
    );
    const detail = `Include ${tail} while focusing edits on a single complete block.`;
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
    return finalizePair(
      toHeadlineCase(leadTitle),
      `Applied cleanly to ${purposeClause} without adding friction.`,
      full,
    );
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
    const tail = clean(supplyMatch[2]).replace(/[.]$/, "");
    const title = toHeadlineCase(
      `Supply ${rawObjects.replace(/\band\b/i, "&")}`,
    );
    const detail = `Pair ${tail} directly with essential background context and constraints.`;
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
    return finalizePair(
      `Benchmark ${lhs} vs. ${rhs}`,
      `Inspect side-by-side changes against the source draft to catch drift or omissions.`,
      full,
    );
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

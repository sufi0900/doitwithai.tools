/**
 * Source-Grounded Percentage & Qualifier Verification
 * File: lib/blog-infographic-studio/percentage-review.ts
 *
 * Direct TypeScript port of `scripts/visual_engine/percentage_review.py`.
 * Prevents LLM-planned or edited infographic cards from inventing percentages
 * or silently dropping qualifier words (`up to`, `about`, `nearly`, `projected`, etc.)
 * that appear in the cited source blocks.
 */

const PERCENT_RE =
  /(?:[~≈+-]\s*)?\d+(?:\.\d+)?(?:\s*(?:[-–—]|to)\s*\d+(?:\.\d+)?)?\s*%/gi;

const QUALIFIER_RE =
  /\b(?:about|approximately|around|roughly|nearly|almost|up\s+to|at\s+least|at\s+most|more\s+than|less\s+than|over|under|between|estimated|projected|reported|typical|average|median|can|may|might|could)\b/i;

function normalizeToken(token: string): string {
  return token
    .replace(/[–—]/g, "-")
    .replace(/\bto\b/gi, "-")
    .replace(/\s+/g, "");
}

function splitClauses(text: string): string[] {
  return String(text || "")
    .split(/(?:[.!?;:\n]|,(?=\s*[A-Za-z]))+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Extracts normalized percentage expressions from text, along with whether
 * each percentage expression appears in a qualified or approximate clause.
 */
export function percentageValues(
  text: string,
): Array<{ value: string; qualified: boolean }> {
  const results: Array<{ value: string; qualified: boolean }> = [];
  for (const clause of splitClauses(text)) {
    const clauseQualified = QUALIFIER_RE.test(clause);
    const matches = clause.matchAll(PERCENT_RE);
    for (const match of matches) {
      const raw = match[0];
      const prefixQualified = /^[~≈]/.test(raw.trim());
      results.push({
        value: normalizeToken(raw.replace(/^[~≈]\s*/, "")),
        qualified: clauseQualified || prefixQualified,
      });
    }
  }
  return results;
}

export interface PercentageReviewResult {
  valid: boolean;
  warnings: string[];
}

/**
 * Verifies that every percentage in `cardText` exists in `citedSourceTexts`
 * and preserves qualifiers when the source percentage was qualified.
 */
export function reviewCardPercentages(
  cardText: string,
  citedSourceTexts: string[],
): PercentageReviewResult {
  const cardPercentages = percentageValues(cardText);
  if (cardPercentages.length === 0) {
    return { valid: true, warnings: [] };
  }

  const sourceText = citedSourceTexts.join(" ");
  const sourcePercentages = percentageValues(sourceText);
  const warnings: string[] = [];

  for (const item of cardPercentages) {
    const matchingSources = sourcePercentages.filter(
      (src) => src.value === item.value,
    );
    if (matchingSources.length === 0) {
      warnings.push(
        `Percentage ${item.value} in card text does not appear in the cited source blocks.`,
      );
      continue;
    }
    const allSourcesQualified = matchingSources.every((src) => src.qualified);
    if (allSourcesQualified && !item.qualified) {
      warnings.push(
        `Percentage ${item.value} is qualified in the cited source (e.g., 'up to' or 'approximately') and must retain its qualifier.`,
      );
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

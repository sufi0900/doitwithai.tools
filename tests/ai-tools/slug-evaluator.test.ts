import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalizeSlug,
  evaluateSlug,
  slugSimilarity,
} from "../../features/slug-generator/evaluator";
import {
  slugInputSchema,
  slugOutputSchema,
  type SlugInput,
} from "../../features/slug-generator/schema";

const input: SlugInput = slugInputSchema.parse({
  pageContext:
    "A detailed review of the Merlin AI Chrome extension covering features, pricing, use cases, strengths, and limitations for writers and marketers.",
  primaryKeyword: "Merlin AI review",
  currentSlug: "a-review-blog-for-merlin-ai-chrome-extension",
  baseUrl: "https://doitwithai.tools/ai-tools",
  timeSensitive: false,
});

test("canonicalizes text into lowercase hyphenated slug format", () => {
  assert.equal(
    canonicalizeSlug("  Merlin AI: Review & Chrome Extension  "),
    "merlin-ai-review-and-chrome-extension",
  );
});

test("rewards a concise slug that preserves the primary topic", () => {
  const evaluation = evaluateSlug("merlin-ai-review", input);
  assert.equal(evaluation.canonical, true);
  assert.equal(evaluation.words, 3);
  assert.equal(evaluation.keywordCoverage, 1);
  assert.ok(evaluation.score >= 80);
});

test("flags noncanonical separators and unnecessary evergreen dates", () => {
  const evaluation = evaluateSlug("merlin_ai_review_2026", input);
  assert.equal(evaluation.canonical, false);
  assert.equal(evaluation.hasDateRisk, true);
  assert.equal(
    evaluation.checks.find((check) => check.id === "format")?.status,
    "fail",
  );
  assert.equal(
    evaluation.checks.find((check) => check.id === "stability")?.status,
    "warn",
  );
});

test("detects word-set similarity even when term order changes", () => {
  assert.equal(slugSimilarity("merlin-ai-review", "review-merlin-ai"), 1);
});

test("accepts the exact structured slug generation contract", () => {
  const makeCandidate = (slug: string) => ({
    slug,
    angle: "Focused editorial angle",
    rationale:
      "This option keeps the permanent topic clear while removing headline-style detail that does not belong in the URL.",
    bestFor:
      "An evergreen review page that needs an immediately clear topic label.",
    tradeoff:
      "The shorter structure leaves supporting feature detail to the title and page copy.",
  });

  const parsed = slugOutputSchema.parse({
    analysis: {
      pageType: "Product review",
      searchIntent: "Commercial investigation",
      coreTopic: "Merlin AI review",
      primaryEntity: "Merlin AI",
      stableConcepts: ["Merlin AI", "review", "browser extension"],
      detailsCompressed: [
        {
          detail: "Chrome extension feature list",
          decision:
            "The product format supports the article but does not need to make the permanent page label longer.",
        },
      ],
      summary:
        "The page is an evergreen product review for searchers evaluating Merlin AI, with supporting information about its extension, plans, uses, and limitations.",
      recommendedDirection:
        "Lead with the product entity and review intent, then reserve features, pricing, and audience detail for the title and content.",
    },
    topRecommendation: makeCandidate("merlin-ai-review"),
    alternatives: {
      concise: [
        makeCandidate("merlin-review"),
        makeCandidate("review-merlin-ai"),
      ],
      keywordAligned: [
        makeCandidate("merlin-ai-extension-review"),
        makeCandidate("merlin-ai-tool-review"),
      ],
      intentLed: [
        makeCandidate("is-merlin-ai-worth-it"),
        makeCandidate("merlin-ai-features-review"),
      ],
    },
    editorNotes: [
      "Confirm that the final slug still describes the visible page topic accurately.",
      "Do not add a year unless the page itself is deliberately time-bound.",
      "If the supplied URL is published, implement a permanent redirect before changing it.",
    ],
  });

  assert.equal(parsed.alternatives.concise.length, 2);
  assert.equal(parsed.alternatives.keywordAligned.length, 2);
  assert.equal(parsed.alternatives.intentLed.length, 2);
});

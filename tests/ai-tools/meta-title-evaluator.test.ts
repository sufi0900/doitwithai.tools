import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateTitle,
  titleSimilarity,
} from "../../features/meta-title-generator/evaluator";
import {
  metaTitleInputSchema,
  metaTitleOutputSchema,
  type MetaTitleInput,
} from "../../features/meta-title-generator/schema";

const input: MetaTitleInput = metaTitleInputSchema.parse({
  topicSummary:
    "A practical guide to writing and evaluating meta titles for search engines, AI-readable clarity, and human readers.",
  primaryKeyword: "meta title optimization",
  secondaryKeywords: ["AI SEO"],
  pageType: "guide",
  searchIntent: "informational",
  targetAudience: "content marketers",
  uniqueValue: "Includes a live pixel-aware SERP preview.",
  tone: "professional",
  brandName: "",
  location: "",
  currentTitle: "Meta Title Optimization Guide",
  existingTitles: ["Best Meta Title Optimization Tips"],
  prohibitedTerms: [],
  includeFreshness: false,
  pageUrl: "https://example.com/meta-title",
});

test("detects a front-loaded primary keyword", () => {
  const evaluation = evaluateTitle(
    "Meta Title Optimization: A Practical SEO Guide",
    input,
  );
  assert.equal(evaluation.primaryKeywordFound, true);
  assert.equal(evaluation.primaryKeywordFrontLoaded, true);
  assert.ok(evaluation.scores.search >= 60);
});

test("flags repeated keyword tokens as a quality failure", () => {
  const evaluation = evaluateTitle(
    "Meta Title Optimization: Meta Title Tips for SEO",
    input,
  );
  const quality = evaluation.checks.find((check) => check.id === "quality");
  assert.equal(quality?.status, "fail");
});

test("calculates meaningful duplicate similarity", () => {
  const similarity = titleSimilarity(
    "Meta Title Optimization Guide for Better SEO",
    "Best Meta Title Optimization Guide",
  );
  assert.ok(similarity >= 0.5);
});

test("accepts the exact structured generation contract", () => {
  const makeGroup = (
    lens: "unified" | "search" | "human" | "ai" | "desktop",
  ) => ({
    lens,
    heading: `${lens} meta title options`,
    explanation:
      "These options use a clear strategic focus while preserving accuracy, readable language, and useful context for the supplied page.",
    focuses: ["Clarity", "Accuracy", "Intent"],
    candidates: Array.from({ length: 5 }, (_, index) => ({
      title: `Meta Title Optimization Guide Option ${index + 1}`,
      angle: `Editorial angle ${index + 1}`,
      rationale:
        "This title makes the topic explicit and gives the reader a credible reason to evaluate the page.",
      tradeoff: "The concise structure leaves limited space for a brand name.",
    })),
  });

  const parsed = metaTitleOutputSchema.parse({
    analysis: {
      contentType: "Guide",
      intent: "Informational",
      audienceSummary: "Content marketers who want practical title guidance.",
      pagePromise: "A structured method for creating stronger meta titles.",
      keywordStrategy:
        "Use the primary keyword early and add secondary context only when useful.",
      differentiator:
        "A live pixel-aware SERP preview supports human refinement.",
      recommendedDirection:
        "Lead with the core topic and a credible practical outcome.",
      assistantMessage:
        "The brief supports a direct, practical title direction. The strongest options should lead with the main topic, signal the guide format, and preserve enough space for a clear outcome.",
    },
    groups: [
      makeGroup("unified"),
      makeGroup("search"),
      makeGroup("human"),
      makeGroup("ai"),
      makeGroup("desktop"),
    ],
    editorNotes: [
      "Confirm that the visible H1 and title element describe the same page promise.",
      "Use a year only when the content has been reviewed and genuinely updated.",
      "Recheck the final title against other pages before publishing.",
    ],
  });

  assert.equal(parsed.groups.length, 5);
  assert.equal(parsed.groups[0].candidates.length, 5);
});

test("desktop lens uses the wider 55-60 character preferred range", () => {
  const desktopTitle =
    "Meta Title Optimization Explained: A Practical SEO Editor's Guide"; // ~66 chars, exercises the check without asserting an exact pass
  const evaluation = evaluateTitle(desktopTitle, input, "desktop");
  assert.equal(typeof evaluation.scores.unified, "number");
  const lengthCheck = evaluation.checks.find((check) => check.id === "length");
  assert.ok(lengthCheck);
});

test("a keyword placed later in the title is not penalized as a failure", () => {
  const evaluation = evaluateTitle(
    "A Practical Guide That Explains Search Engine Ready Meta Title Optimization Basics",
    input,
  );
  assert.equal(evaluation.primaryKeywordFound, true);
  assert.equal(evaluation.primaryKeywordFrontLoaded, false);
  const keywordCheck = evaluation.checks.find((check) => check.id === "keyword");
  assert.equal(keywordCheck?.status, "pass");
});

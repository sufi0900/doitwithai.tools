import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  wrapVisualText,
  sourceMetric,
  percentageMetric,
} from "../../features/tool-ui/visualText";
import { buildDeterministicBlogInfographic } from "../../features/blog-to-infographic-generator/model";
import { SocialCardArtwork } from "../../features/tool-ui/SocialCardArtwork";

test("short copy wraps completely; overflowing copy is visibly marked", () => {
  assert.equal(
    wrapVisualText("One clear thought stays together", 12, 4).join(" "),
    "One clear thought stays together",
  );
  const lines = wrapVisualText(
    "One clear thought stays together and includes another sentence that must not disappear silently",
    18,
    2,
  );
  assert.equal(lines.length, 2);
  assert.ok(lines[1].endsWith("…"));
  assert.deepEqual(wrapVisualText("", 20, 3), [""]);
});

test("a topic without evidence creates an explicitly unresearched outline without fabricated metrics", () => {
  const result = buildDeterministicBlogInfographic({
    title: "Improve customer onboarding",
    sourceContent: "",
  });
  assert.equal(result.nodes.length, 6);
  assert.ok(
    result.nodes.every((n) => n.metricValue === "" && n.compareRight === ""),
  );
  assert.match(result.infographicSubtitle, /outline/i);
  assert.match(result.evidenceSummary[0], /no sources/i);
  assert.doesNotMatch(JSON.stringify(result), /\d+%|\d+(?:\.\d+)?x\b/);
});

test("supplied statistics are retained without manufacturing a metric for every node", () => {
  const result = buildDeterministicBlogInfographic({
    title: "User survey",
    sourceContent:
      "1. Survey result: 42% of the supplied sample chose email.\n2. Follow up: Interview participants about their reasons.\n3. Review context: Explain how the sample was recruited.",
  });
  assert.equal(result.nodes[0].metricValue, "42%");
  assert.equal(result.nodes[1].metricValue, "");
  assert.equal(result.nodes[2].metricValue, "");
  assert.doesNotMatch(result.socialCaption, /\(\)/);
  assert.match(result.evidenceSummary[0], /no independent web research/i);
});

test("percentages are never inferred from multipliers, currencies or missing data", () => {
  assert.equal(percentageMetric("42%"), 42);
  assert.equal(percentageMetric("0%"), 0);
  for (const value of ["3.4x", "$80", "142%", undefined, "", "-5%"])
    assert.equal(percentageMetric(value), null);
  assert.equal(sourceMetric("A reported 3.4x increase"), "3.4x");
  assert.equal(sourceMetric("No measurements supplied"), "");
});

test("social layouts fit square, portrait and landscape without negative shapes or invented gauges", () => {
  const palette = {
    textPrimary: "#18234b",
    textSecondary: "#475569",
    accent: "#5271ff",
    accentSecondary: "#8094ff",
    cardSurface: "#ffffff",
  };
  for (const [width, height] of [
    [1080, 1080],
    [1080, 1350],
    [1200, 675],
  ]) {
    for (const kind of [
      "framework-steps",
      "checklist-card",
      "stat-spotlight",
      "before-after-split",
      "founder-memo",
      "carousel-slide",
      "quote-card",
      "article-photo-card",
    ]) {
      const output = renderToStaticMarkup(
        React.createElement(SocialCardArtwork, {
          kind,
          width,
          height,
          palette,
          headline: "A useful visual guide",
          body: "Choose one lesson. Explain the steps. Share an example.",
          image: "data:image/png;base64,example",
          metric: "",
        }),
      );
      assert.doesNotMatch(output, /(?:height|width|r)="-\d|NaN|undefined/);
      assert.ok(output.includes("A useful visual guide"), kind);
      assert.doesNotMatch(output, /84%|88%|520 660/);
    }
  }
});

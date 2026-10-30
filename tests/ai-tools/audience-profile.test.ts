import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import ProposedProfile from "../../features/audience-research/ProposedProfile";
import {
  exampleReport,
  inputSchema,
  profileTopics,
  reportCsv,
  validateOutput,
} from "../../features/audience-research/schema";
const input = inputSchema.parse({
  brief: "A learning website for independent business bloggers.",
});

test("proposed demographic profiles survive website-only validation as separate planning assumptions", () => {
  const raw = exampleReport();
  raw.audienceClues[0].source = "Website text";
  const report = validateOutput(raw, {
    ...input,
    brief: "",
    websiteText: input.brief,
  });
  const profile = report.segments[0].proposedProfile;
  assert.deepEqual(
    profile.map((p) => p.topic),
    [...profileTopics],
  );
  assert.equal(profile.length, 8);
  assert.ok(
    profile.every(
      (p) =>
        p.value !== "Unknown" && p.reason.length > 20 && p.test.length > 20,
    ),
  );
  assert.match(profile.find((p) => p.topic === "Age range")!.value, /25–44/);
  assert.match(
    profile.find((p) => p.topic === "Countries and markets")!.reason,
    /not measured/,
  );
  assert.equal(
    report.segments[0].findings.filter((f) => f.state === "Hypothesis").length,
    8,
  );
});

test("profile topic coverage and resource bounds prevent missing or duplicated profile sections", () => {
  const duplicate = exampleReport();
  duplicate.segments[0].proposedProfile[1].topic = "Age range";
  assert.throws(() => validateOutput(duplicate, input), /each topic once/);
  const missing = exampleReport();
  missing.segments[0].proposedProfile.pop();
  assert.throws(() => validateOutput(missing, input));
  const oversized = exampleReport();
  oversized.segments[0].proposedProfile[0].value = "x".repeat(181);
  assert.throws(() => validateOutput(oversized, input));
});

test("personal wealth figures become affordability questions without erasing the other planning fields", () => {
  const raw = exampleReport();
  const field = raw.segments[0].proposedProfile.find(
    (p) => p.topic === "Financial fit",
  )!;
  field.value = "Estimated bank balance: USD 50,000";
  field.reason = "An unsupported estimate of personal savings.";
  const result = validateOutput(raw, input);
  const financial = result.segments[0].proposedProfile.find(
    (p) => p.topic === "Financial fit",
  )!;
  assert.doesNotMatch(
    financial.value + financial.reason,
    /50,000|personal savings|bank balance/i,
  );
  assert.match(financial.test, /comfortable spending/);
  assert.match(result.segments[0].proposedProfile[0].value, /25–44/);
  assert.deepEqual(validateOutput(result, input), result);
});

test("profile quotations must match supplied context without promoting assumptions into verified demographics", () => {
  const raw = exampleReport();
  raw.segments[0].proposedProfile[0].evidence = [
    { source: "Business brief", quote: "independent business bloggers" },
  ];
  raw.segments[0].proposedProfile[1].evidence = [
    { source: "Customer notes", quote: "Ninety percent of buyers are women" },
  ];
  const result = validateOutput(raw, input);
  assert.equal(result.segments[0].proposedProfile[0].evidence.length, 1);
  assert.equal(result.segments[0].proposedProfile[1].evidence.length, 0);
  assert.ok(
    result.reviewNotes!.some((note) => note.includes("remains an assumption")),
  );
  const csv = reportCsv(result);
  assert.match(csv, /"Proposed Age range"/);
  assert.match(csv, /"Planning assumption"/);
  assert.match(csv, /"Planning rationale"/);
  result.segments[0].proposedProfile[0].value = '=HYPERLINK("unsafe")';
  assert.ok(reportCsv(result).includes('"\'=HYPERLINK(""unsafe"")"'));
});

test("profile cards expose their rationale, test questions, accessible controls, and independent review states", () => {
  const profile = exampleReport().segments[0].proposedProfile;
  profile[0].value = '<img src=x onerror="alert(1)">';
  const $ = load(
    renderToStaticMarkup(
      React.createElement(
        "div",
        null,
        React.createElement(ProposedProfile, {
          profile,
          decisions: { "profile-0-Age range": "Use for initial test" },
          segmentIndex: 0,
          onDecision: () => {},
        }),
        React.createElement(ProposedProfile, {
          profile,
          decisions: {},
          segmentIndex: 1,
          onDecision: () => {},
        }),
      ),
    ),
  );
  assert.equal($("article").length, 16);
  assert.equal($("img").length, 0);
  const ids = $("[id]")
    .toArray()
    .map((n) => $(n).attr("id"));
  assert.equal(new Set(ids).size, ids.length);
  assert.equal($("select").first().val(), "Use for initial test");
  assert.equal($("select").eq(8).val(), "Not reviewed");
  $("article").each((_, element) => {
    const card = $(element);
    assert.match(card.text(), /Why test this:/);
    assert.match(card.text(), /Validate:/);
    assert.equal(card.find("label select").length, 1);
    assert.ok(
      card
        .find("label")
        .text()
        .toLowerCase()
        .includes(card.find("h5").text().toLowerCase()),
    );
  });
  assert.match($("section").first().text(), /Assumptions to test/);
  assert.match(
    $("section").first().text(),
    /not bank balances or personal wealth/,
  );
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  compileSchema,
  serializeJsonLd,
  serializeSchemaScript,
} from "../../features/schema-generator/compiler";
import {
  createSchemaState,
  SCHEMA_DEFINITIONS,
} from "../../features/schema-generator/config";
import {
  assertSafeFetchUrl,
  extractPageSignals,
} from "../../features/schema-generator/server/fetch-page";
import { evaluateSchema } from "../../features/schema-generator/validation";

test("compiles the article sample into a connected graph", () => {
  const state = createSchemaState("article", true);
  const output = compileSchema(state);
  const graph = output["@graph"];
  assert.ok(Array.isArray(graph));
  assert.ok(
    graph.some(
      (node) => typeof node === "object" && node?.["@type"] === "BlogPosting",
    ),
  );
  assert.ok(
    graph.some(
      (node) => typeof node === "object" && node?.["@type"] === "WebPage",
    ),
  );
  assert.ok(
    graph.some(
      (node) => typeof node === "object" && node?.["@type"] === "Organization",
    ),
  );
});

test("creates complete FAQ Question and Answer pairs", () => {
  const state = createSchemaState("faq", true);
  const graph = compileSchema(state)["@graph"] as Array<
    Record<string, unknown>
  >;
  const faq = graph.find((node) => node["@type"] === "FAQPage");
  assert.ok(faq);
  const entities = faq.mainEntity as Array<Record<string, unknown>>;
  assert.equal(entities.length, 2);
  assert.equal(entities[0]["@type"], "Question");
  assert.equal(
    (entities[0].acceptedAnswer as Record<string, unknown>)["@type"],
    "Answer",
  );
});

test("omits empty optional properties and always emits parseable JSON", () => {
  const state = createSchemaState("product", true);
  const json = serializeJsonLd(state);
  assert.doesNotThrow(() => JSON.parse(json));
  assert.equal(json.includes('"mpn": ""'), false);
  assert.equal(json.includes('"aggregateRating"'), false);
  assert.match(
    serializeSchemaScript(state),
    /^<script type="application\/ld\+json">/,
  );
});

test("requires visible-content confirmation before publication readiness", () => {
  const state = createSchemaState("article", true);
  state.visibleContentConfirmed = false;
  const evaluation = evaluateSchema(state);
  assert.equal(evaluation.publishReady, false);
  assert.ok(
    evaluation.issues.some(
      (entry) => entry.id === "visible-content-confirmation",
    ),
  );
});

test("enforces physical event location rules", () => {
  const state = createSchemaState("event", true);
  state.values.venueName = "";
  const evaluation = evaluateSchema(state);
  assert.equal(evaluation.publishReady, false);
  assert.ok(
    evaluation.issues.some((entry) => entry.id === "event-physical-location"),
  );
});

test("adds the reviewed UTC offset to event date-times", () => {
  const state = createSchemaState("event", true);
  const graph = compileSchema(state)["@graph"] as Array<
    Record<string, unknown>
  >;
  const event = graph.find((node) => node["@type"] === "Event");
  assert.equal(event?.startDate, "2026-10-10T10:00+05:00");
  assert.equal(event?.endDate, "2026-10-10T16:00+05:00");
});

test("compiles a remote job with explicit applicant countries", () => {
  const state = createSchemaState("jobPosting", true);
  const graph = compileSchema(state)["@graph"] as Array<
    Record<string, unknown>
  >;
  const job = graph.find((node) => node["@type"] === "JobPosting");
  assert.equal(job?.jobLocationType, "TELECOMMUTE");
  assert.ok(Array.isArray(job?.applicantLocationRequirements));
  assert.equal(job?.jobLocation, undefined);
});

test("emits service outputs as typed entities", () => {
  const state = createSchemaState("service", true);
  const graph = compileSchema(state)["@graph"] as Array<
    Record<string, unknown>
  >;
  const service = graph.find((node) => node["@type"] === "Service");
  const outputs = service?.serviceOutput as Array<Record<string, unknown>>;
  assert.ok(Array.isArray(outputs));
  assert.equal(outputs[0]?.["@type"], "Thing");
  assert.ok(typeof outputs[0]?.name === "string");
});

test("all shipped type examples pass required tool checks", () => {
  for (const definition of SCHEMA_DEFINITIONS) {
    const evaluation = evaluateSchema(createSchemaState(definition.id, true));
    const errors = evaluation.issues.filter(
      (entry) => entry.severity === "error",
    );
    assert.deepEqual(
      errors,
      [],
      `${definition.id} sample errors: ${errors.map((entry) => entry.id).join(", ")}`,
    );
  }
});

test("extracts metadata and existing JSON-LD without trusting it as output", () => {
  const html = `<!doctype html><html lang="en"><head>
    <title>Schema Guide</title>
    <meta name="description" content="A clear schema guide">
    <meta property="og:image" content="/schema.jpg">
    <link rel="canonical" href="https://example.com/schema-guide">
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"Old value"}</script>
  </head><body><main><h1>Build Better Schema</h1><p>Visible implementation guidance.</p></main></body></html>`;
  const signals = extractPageSignals(html, "https://example.com/schema-guide");
  assert.equal(signals.title, "Schema Guide");
  assert.equal(signals.imageUrl, "https://example.com/schema.jpg");
  assert.deepEqual(signals.existingSchemaTypes, ["Article"]);
  assert.match(signals.visibleText, /Visible implementation guidance/);
});

test("blocks local and private URL fetch targets", async () => {
  await assert.rejects(() => assertSafeFetchUrl("http://127.0.0.1/admin"));
  await assert.rejects(() => assertSafeFetchUrl("http://10.0.0.8/metadata"));
  await assert.rejects(() => assertSafeFetchUrl("http://localhost:3000"));
});

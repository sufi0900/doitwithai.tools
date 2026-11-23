import test from "node:test";
import assert from "node:assert/strict";
import {
  buildDraft,
  defaults,
  draftText,
  example,
  validate,
  webUrl,
} from "../../features/outreach-email/model";
import { draftDocx, zipStored } from "../../features/outreach-email/docx";
test("required fields produce specific errors and valid example is complete", () => {
  const e = validate(defaults);
  for (const name of [
    "sourceUrl",
    "context",
    "resourceUrl",
    "benefit",
    "sender",
  ])
    assert(e[name as keyof typeof e]);
  assert.deepEqual(validate(example), {});
  assert.throws(() => buildDraft(defaults));
});
test("URLs normalize common input and reject unsafe schemes, credentials, custom ports and local targets", () => {
  assert.equal(webUrl("example.com/page#section"), "https://example.com/page");
  assert.equal(webUrl("https://bücher.de"), "https://xn--bcher-kva.de/");
  for (const value of [
    "javascript:alert(1)",
    "ftp://example.com",
    "https://user:pass@example.com",
    "http://localhost",
    "http://127.0.0.1",
    "https://site.local",
    "https://example.com:9000",
  ])
    assert.throws(() => webUrl(value), value);
});
test("resource draft includes source, factual reference, resource, benefit and sender without invented history", () => {
  const d = buildDraft(example);
  for (const value of [
    example.sourceUrl,
    example.context,
    example.resourceUrl,
    example.benefit,
    example.sender,
  ])
    assert(d.body.includes(value));
  assert.equal(d.subjects.length, 3);
  assert.equal(new Set(d.subjects).size, 3);
  assert(
    !/longtime|loved your|guarantee|increase.*rank|followed you/i.test(d.body),
  );
});
test("broken-link draft requires destination and keeps current availability conditional", () => {
  assert(validate({ ...example, purpose: "broken-link" }).brokenUrl);
  const d = buildDraft({
    ...example,
    purpose: "broken-link",
    brokenUrl: "https://old.example/page",
  });
  assert(d.body.includes("https://old.example/page"));
  assert.match(d.body, /If it is still unavailable/);
  assert(!/verified.*404|definitely broken/i.test(d.body));
});
test("brand mention request requires the actual brand and suggests context rather than claiming verification", () => {
  assert(validate({ ...example, purpose: "brand-mention" }).brand);
  const d = buildDraft({ ...example, purpose: "brand-mention", brand: "Acme" });
  assert.match(d.body, /mention of Acme/);
  assert.match(d.body, /would a link/);
});
test("greeting and tone work without optional personal data", () => {
  const d = buildDraft({
    ...example,
    recipient: "",
    pageTitle: "",
    tone: "friendly",
    followUp: false,
  });
  assert(d.body.startsWith("Hello,"));
  assert(d.body.includes("Thanks for considering it."));
  assert(d.subject.includes("your resource page"));
  assert.equal(d.followUp, "");
});
test("optional follow-up only appears when requested and includes a stopping point", () => {
  assert.match(buildDraft(example).followUp, /earlier note/);
  assert.match(buildDraft(example).followUp, /no further response is needed/);
  assert.equal(buildDraft({ ...example, followUp: false }).followUp, "");
});
test("single-line fields cannot inject subject headers and size limits remain enforced", () => {
  const d = buildDraft({
    ...example,
    pageTitle: "Resources\r\nBCC: nobody@example.com",
    sender: "Alex\nExtra",
  });
  assert(!d.subject.includes("\n"));
  assert(d.body.endsWith("Alex Extra"));
  assert(validate({ ...example, context: "x".repeat(601) }).context);
  assert(validate({ ...example, benefit: "x".repeat(401) }).benefit);
});
test("TXT export preserves the current edited message and excludes empty follow-ups", () => {
  const d = {
    ...buildDraft(example),
    subject: "Edited subject",
    body: "Edited body\nUnicode text ✓",
    followUp: "",
  };
  const text = draftText(d);
  assert(text.startsWith("Subject: Edited subject\n"));
  assert(text.includes("Edited body\nUnicode text ✓"));
  assert(!text.includes("Optional follow-up"));
});
test("ZIP uses correct CRC32 and central directory signatures", () => {
  const zip = zipStored({ "test.txt": "123456789" });
  const view = new DataView(zip.buffer);
  assert.equal(view.getUint32(0, true), 0x04034b50);
  assert.equal(view.getUint32(14, true), 0xcbf43926);
  assert.equal(view.getUint32(zip.length - 22, true), 0x06054b50);
});
test("DOCX contains native WordprocessingML, styles, editable Unicode and XML escaping", () => {
  const d = {
    ...buildDraft(example),
    body: 'Text <tag> & "quote"\nاردو ✓',
    followUp: "",
  };
  const bytes = draftDocx(d),
    text = new TextDecoder().decode(bytes);
  assert.equal(new DataView(bytes.buffer).getUint32(0, true), 0x04034b50);
  for (const name of [
    "[Content_Types].xml",
    "_rels/.rels",
    "word/document.xml",
    "word/styles.xml",
  ])
    assert(text.includes(name));
  assert(text.includes("&lt;tag&gt; &amp; &quot;quote&quot;"));
  assert(text.includes("اردو ✓"));
  assert(text.includes('w:pgSz w:w="12240" w:h="15840"'));
  assert(!text.includes("<tag>"));
});

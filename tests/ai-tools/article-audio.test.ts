import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fromText } from "../../features/article-conversion/model";
import {
  inputError,
  segments,
  splitText,
  wave,
  narrate,
  prepareSpokenText,
  detectCalloutBlockIds,
  VOICES,
  SAMPLE_RATE,
  MAX_SECONDS,
} from "../../features/read-aloud/audio";
import { encodeMp3 } from "../../features/read-aloud/mp3";

test("narration keeps selected readable text in source order and omits unsupported content", () => {
  const a = fromText(
    "# Heading\n\nA source sentence [12].\n\nAnother sentence.",
  );
  a.blocks.push({
    id: "table",
    kind: "table",
    text: "Not spoken",
    cells: [["table"]],
  });
  a.blocks.push({ id: "ref", kind: "paragraph", text: "[99]" });
  a.blocks.push({
    id: "clutter",
    kind: "paragraph",
    text: "Leia também: AEO vs GEO vs LLMO",
  });
  a.blocks.push({
    id: "source-caption",
    kind: "paragraph",
    text: "Source",
  });
  assert.deepEqual(
    segments(a, ["b2"]).map((b) => b.text),
    ["Heading", "A source sentence."],
  );
});
test("narration rejects empty selection, too much text and unsupported settings", () => {
  assert.match(inputError([], "gmw/en", 160), /Select at least/);
  const s = [{ id: "a", text: "x".repeat(20001), label: "A" }];
  assert.match(inputError(s, "gmw/en", 160), /20,000/);
  s[0].text = "Hello";
  assert.match(inputError(s, "other", 160), /voice/);
  assert.match(inputError(s, "gmw/en", 99), /120/);
  for (const voiceKey of Object.keys(VOICES)) {
    assert.equal(inputError(s, voiceKey, 200), "");
  }
});
test("prepareSpokenText normalizes acronyms, arrows, bullets, and terminal punctuation for clear speech", () => {
  assert.equal(
    prepareSpokenText("• AEO vs. GEO and FAQs"),
    "A. E. O. versus G. E. O. and F. A. Q. s.",
  );
  assert.equal(
    prepareSpokenText("Plan → Create → Publish"),
    "Plan, then Create, then Publish.",
  );
  assert.equal(prepareSpokenText("Key Takeaways"), "Key Takeaways.");
});
test("detectCalloutBlockIds identifies Key Takeaways heading and following bullet items", () => {
  const a = fromText(
    "# Key Takeaways\n\n• Point one\n\n• Point two\n\nFirst real paragraph.",
  );
  a.blocks[1].kind = "list";
  a.blocks[2].kind = "list";
  assert.deepEqual(detectCalloutBlockIds(a), ["b0", "b1", "b2"]);
});
test("synthesis chunks bound unbroken words and preserve Unicode pairs", () => {
  const text = "x".repeat(999) + "😀" + "y".repeat(2500);
  const chunks = splitText(text);
  assert.equal(chunks.join(""), text);
  assert(chunks.every((s) => s.length <= 1000 && !/[\uD800-\uDBFF]$/.test(s)));
  assert.equal(chunks.length, 4);
  const spaced = "A complete sentence. ".repeat(150);
  assert.equal(
    splitText(spaced).join(" ").replace(/\s+/g, " ").trim(),
    spaced.trim(),
  );
});
test("WAV stores correctly sized little endian PCM, not a renamed text file", () => {
  const b = wave([new Int16Array([-32768, 0, 32767]), new Int16Array([42])]);
  const v = new DataView(b.buffer);
  assert.equal(new TextDecoder().decode(b.slice(0, 4)), "RIFF");
  assert.equal(new TextDecoder().decode(b.slice(8, 12)), "WAVE");
  assert.equal(v.getUint32(24, true), SAMPLE_RATE);
  assert.equal(v.getUint16(22, true), 1);
  assert.equal(v.getUint32(40, true), 8);
  assert.equal(v.getInt16(44, true), -32768);
  assert.equal(v.getInt16(50, true), 42);
  assert.throws(() => wave([]), /empty/);
  assert.throws(
    () => wave([new Int16Array(SAMPLE_RATE * MAX_SECONDS + 1)]),
    /20 minute/,
  );
});

class SpeechWorker {
  static samples = [0.1, 0.1, -0.2, -0.2];
  static last: SpeechWorker;
  static fail = false;
  static calls: any[] = [];
  onmessage: ((e: { data: any }) => void) | null = null;
  onerror: (() => void) | null = null;
  terminated = false;
  constructor() {
    SpeechWorker.last = this;
    SpeechWorker.calls = [];
    queueMicrotask(() =>
      SpeechWorker.fail
        ? this.onerror?.()
        : this.onmessage?.({ data: "ready" }),
    );
  }
  postMessage(message: any) {
    SpeechWorker.calls.push(message);
    if (message.method === "synthesize")
      queueMicrotask(() => {
        this.onmessage?.({
          data: {
            callback: "speech",
            result: [new Float32Array(SpeechWorker.samples).buffer],
          },
        });
        this.onmessage?.({ data: { callback: "speech", done: true } });
      });
  }
  terminate() {
    this.terminated = true;
  }
}
const input = [{ id: "a", text: "An audible sentence.", label: "A" }];
test("speech integration interprets duplicated samples and records chapter timing", async () => {
  const original = globalThis.Worker;
  globalThis.Worker = SpeechWorker as any;
  try {
    const r = await narrate(
      input,
      "gmw/en",
      160,
      new AbortController().signal,
      () => {},
    );
    assert.equal(r.bytes.length, 48);
    assert.equal(r.seconds, 2 / SAMPLE_RATE);
    assert.equal(r.chapters[0].end, r.seconds);
    assert.equal(SpeechWorker.last.terminated, true);
    assert(
      SpeechWorker.calls.some(
        (c) => c.method === "set_voice" && c.args[0] === "gmw/en+m1",
      ),
    );
    assert(
      SpeechWorker.calls.some(
        (c) => c.method === "set_pitch" && c.args[0] === 38,
      ),
    );
  } finally {
    globalThis.Worker = original;
  }
});
test("multi-section narration inserts natural silence pauses between sections and re-applies voice variant", async () => {
  const original = globalThis.Worker;
  globalThis.Worker = SpeechWorker as any;
  try {
    const twoItems = [
      { id: "s1", text: "First section", label: "Section 1" },
      { id: "s2", text: "Second section", label: "Section 2" },
    ];
    const r = await narrate(
      twoItems,
      "gmw/en-US",
      160,
      new AbortController().signal,
      () => {},
    );
    const voiceCalls = SpeechWorker.calls.filter(
      (c) => c.method === "set_voice",
    );
    assert.equal(voiceCalls.length, 2);
    assert.equal(voiceCalls[0].args[0], "gmw/en-US+f3");
    assert(r.seconds > 4 / SAMPLE_RATE);
  } finally {
    globalThis.Worker = original;
  }
});
test("speech errors discard malformed, silent and failed engine output", async () => {
  const original = globalThis.Worker;
  globalThis.Worker = SpeechWorker as any;
  try {
    for (const samples of [
      [0, 0],
      [0.1, 0.2],
      [NaN, NaN],
    ]) {
      SpeechWorker.samples = samples;
      await assert.rejects(
        narrate(input, "gmw/en", 160, new AbortController().signal, () => {}),
        /silent|Unexpected/,
      );
      assert.equal(SpeechWorker.last.terminated, true);
    }
    SpeechWorker.fail = true;
    await assert.rejects(
      narrate(input, "gmw/en", 160, new AbortController().signal, () => {}),
      /could not load/,
    );
  } finally {
    SpeechWorker.fail = false;
    SpeechWorker.samples = [0.1, 0.1];
    globalThis.Worker = original;
  }
});
test("cancellation terminates synthesis before returning an incomplete file", async () => {
  const original = globalThis.Worker;
  globalThis.Worker = SpeechWorker as any;
  try {
    const c = new AbortController();
    const p = narrate(input, "gmw/en", 160, c.signal, () => {});
    c.abort();
    await assert.rejects(p, /cancelled/);
    assert.equal(SpeechWorker.last.terminated, true);
  } finally {
    globalThis.Worker = original;
  }
});
test("MP3 cancellation stops encoding without returning partial bytes", async () => {
  const original = globalThis.Worker;
  globalThis.Worker = SpeechWorker as any;
  try {
    const c = new AbortController();
    const p = encodeMp3(wave([new Int16Array([1, 2])]), c.signal, () => {});
    c.abort();
    await assert.rejects(p, /cancelled/);
    assert.equal(SpeechWorker.last.terminated, true);
  } finally {
    globalThis.Worker = original;
  }
});
test("shipped engine assets retain their pinned upstream blob identities", async () => {
  const { createHash } = await import("node:crypto");
  for (const [file, expected] of [
    ["espeakng.worker.js", "3996ba9e59054ae0de6bf1604058991a94cddbe4"],
    ["espeakng.worker.data", "6ccd2f8055e559549165e5fccd6439eb0471177c"],
  ]) {
    const b = readFileSync(`public/vendor/espeak-ng/${file}`);
    const sha = createHash("sha1")
      .update(`blob ${b.length}\0`)
      .update(b)
      .digest("hex");
    assert.equal(sha, expected);
  }
});

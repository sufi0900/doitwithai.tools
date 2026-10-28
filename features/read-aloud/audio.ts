import type { Article } from "../article-conversion/model";
export const SAMPLE_RATE = 22050,
  MAX_SECONDS = 1200;
export type Segment = { id: string; text: string; label: string };
export type Chapter = { id: string; text: string; start: number; end: number };
export function segments(a: Article, excluded: string[] = []): Segment[] {
  return a.blocks
    .filter(
      (b) =>
        ["heading", "paragraph", "list", "quote"].includes(b.kind) &&
        b.text.trim() &&
        !excluded.includes(b.id),
    )
    .map((b, i) => ({
      id: b.id,
      text: b.text.replace(/\s*\[\d+\]/g, ""),
      label: `Section ${i + 1}`,
    }))
    .filter((b) => b.text.trim());
}
export function inputError(items: Segment[], voice: string, rate: number) {
  if (!items.length) return "Select at least one text section.";
  if (items.reduce((n, s) => n + s.text.length, 0) > 20000)
    return "Select up to 20,000 characters for one audio file. Uncheck sections or shorten the source.";
  if (!["gmw/en", "gmw/en-US"].includes(voice))
    return "Choose an available English voice.";
  if (![120, 160, 200].includes(rate))
    return "Choose 120, 160, or 200 words per minute.";
  return "";
}
export function splitText(text: string) {
  const chunks: string[] = [];
  let rest = text;
  while (rest.length > 1000) {
    const boundary = rest.lastIndexOf(" ", 1000);
    let end = boundary > 0 ? boundary : 1000;
    // Do not split a Unicode surrogate pair in an unbroken URL or word.
    if (/[\uD800-\uDBFF]/.test(rest[end - 1])) end--;
    chunks.push(rest.slice(0, end));
    rest = rest.slice(end).trimStart();
  }
  if (rest) chunks.push(rest);
  return chunks;
}
export function wave(chunks: Int16Array[]) {
  const length = chunks.reduce((n, s) => n + s.length, 0);
  if (!length || length > SAMPLE_RATE * MAX_SECONDS)
    throw Error(
      "Audio is empty or exceeds the 20 minute file limit. Select less text.",
    );
  const bytes = new Uint8Array(44 + length * 2),
    v = new DataView(bytes.buffer);
  const str = (n: number, s: string) => {
    for (let i = 0; i < s.length; i++) bytes[n + i] = s.charCodeAt(i);
  };
  str(0, "RIFF");
  v.setUint32(4, bytes.length - 8, true);
  str(8, "WAVE");
  str(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, SAMPLE_RATE, true);
  v.setUint32(28, SAMPLE_RATE * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, "data");
  v.setUint32(40, length * 2, true);
  let offset = 44;
  for (const chunk of chunks)
    for (const s of chunk) {
      v.setInt16(offset, s, true);
      offset += 2;
    }
  return bytes;
}
export async function narrate(
  items: Segment[],
  voice: string,
  rate: number,
  signal: AbortSignal,
  onProgress: (completed: number, total: number) => void,
) {
  const err = inputError(items, voice, rate);
  if (err) throw Error(err);
  signal.throwIfAborted();
  const worker = new Worker("/vendor/espeak-ng/espeakng.worker.js"),
    chunks: Int16Array[] = [],
    chapters: Chapter[] = [];
  let samples = 0,
    audible = false,
    activeReject: (error: Error) => void;
  const cancelled = () => {
    worker.terminate();
    activeReject?.(new Error("Audio generation cancelled."));
  };
  signal.addEventListener("abort", cancelled, { once: true });
  function waitFor(start: () => void, ready = false): Promise<void> {
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (err?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        activeReject = undefined;
        worker.onmessage = null;
        worker.onerror = null;
        err ? reject(err) : resolve();
      };
      activeReject = (e) => finish(e);
      const timer = setTimeout(
        () => {
          worker.terminate();
          finish(
            new Error(
              "The speech engine timed out. Retry or select less text.",
            ),
          );
        },
        ready ? 20000 : 30000,
      );
      worker.onerror = () =>
        finish(
          new Error(
            "The local speech engine could not load or process this text. Retry in a current browser.",
          ),
        );
      worker.onmessage = (e) => {
        if (ready) {
          if (e.data === "ready") finish();
          return;
        }
        if (!e.data || e.data.callback !== "speech") return;
        if (e.data.done) {
          finish();
          return;
        }
        try {
          const a = new Float32Array(e.data.result[0]);
          if (a.length % 2) throw Error("Unexpected speech samples.");
          const data = new Int16Array(a.length / 2);
          for (let i = 0; i < a.length; i += 2) {
            if (!Number.isFinite(a[i]) || a[i] !== a[i + 1])
              throw Error("Unexpected speech sample format.");
            data[i / 2] = Math.round(Math.max(-1, Math.min(1, a[i])) * 32767);
            if (data[i / 2]) audible = true;
          }
          samples += data.length;
          if (samples > SAMPLE_RATE * MAX_SECONDS)
            throw Error("Audio exceeds 20 minutes. Select less text.");
          chunks.push(data);
        } catch (e) {
          worker.terminate();
          finish(
            e instanceof Error ? e : new Error("Audio processing failed."),
          );
        }
      };
      start();
    });
  }
  try {
    await waitFor(() => {}, true);
    signal.throwIfAborted();
    worker.postMessage({ method: "set_voice", args: [voice] });
    worker.postMessage({ method: "set_rate", args: [rate] });
    for (let i = 0; i < items.length; i++) {
      signal.throwIfAborted();
      const start = samples / SAMPLE_RATE;
      for (const text of splitText(items[i].text)) {
        await waitFor(() =>
          worker.postMessage({
            method: "synthesize",
            args: [text],
            callback: "speech",
          }),
        );
        signal.throwIfAborted();
      }
      chapters.push({
        id: items[i].id,
        text: items[i].text,
        start,
        end: samples / SAMPLE_RATE,
      });
      onProgress(i + 1, items.length);
    }
    if (!audible)
      throw Error(
        "The speech engine returned silent audio. Check the text and retry.",
      );
    return { bytes: wave(chunks), chapters, seconds: samples / SAMPLE_RATE };
  } finally {
    signal.removeEventListener("abort", cancelled);
    worker.terminate();
  }
}

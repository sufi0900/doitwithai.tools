import type { Article } from "../article-conversion/model";
export const SAMPLE_RATE = 22050,
  MAX_SECONDS = 1200;
export type Segment = {
  id: string;
  text: string;
  label: string;
  kind?: string;
};
export type Chapter = { id: string; text: string; start: number; end: number };

export const VOICES: Record<
  string,
  {
    label: string;
    espeakVoice: string;
    pitch: number;
    gender: "female" | "male";
    fallbackRateScale: number;
  }
> = {
  "gmw/en-US": {
    label: "English (US) · Aria (Female · Natural)",
    espeakVoice: "gmw/en-US+f3",
    pitch: 68,
    gender: "female",
    fallbackRateScale: 1.0,
  },
  "gmw/en": {
    label: "English (UK) · Ryan (Male · Natural)",
    espeakVoice: "gmw/en+m1",
    pitch: 38,
    gender: "male",
    fallbackRateScale: 1.08,
  },
  "gmw/en-US-male": {
    label: "English (US) · Guy (Male · Deep)",
    espeakVoice: "gmw/en-US+m3",
    pitch: 34,
    gender: "male",
    fallbackRateScale: 1.1,
  },
  "gmw/en-GB-female": {
    label: "English (UK) · Sonia (Female · Warm)",
    espeakVoice: "gmw/en+f2",
    pitch: 64,
    gender: "female",
    fallbackRateScale: 0.98,
  },
  "gmw/en-IN": {
    label: "English (India) · Neerja (Female · Clear)",
    espeakVoice: "gmw/en+f4",
    pitch: 72,
    gender: "female",
    fallbackRateScale: 1.0,
  },
  "gmw/en-AU": {
    label: "English (Australia) · William (Male · Crisp)",
    espeakVoice: "gmw/en+m2",
    pitch: 42,
    gender: "male",
    fallbackRateScale: 1.07,
  },
};

const CLUTTER_SEGMENT_RE =
  /^(?:•\s*|\d+\.\s*)?(?:leia tamb[eé]m|veja tamb[eé]m|read also|also read|related (?:posts|articles|reads|stories)|further reading|recommended reading|share this (?:article|post)|table of contents)\s*(?:[:\-–]|$)/i;

const SOURCE_LINE_RE =
  /^(?:•\s*)?(?:image\s+)?(?:source|photo\s+credit|image\s+credit)\s*(?:[:\-–].*)?$/i;

const ACRONYM_MAP: Array<[RegExp, string]> = [
  [/\s*(?:→|➔|➜|⟶|⇒|->|=>)\s*/g, ", then "],
  [/\bvs\.?(?=\s|$)/gi, "versus"],
  [/\be\.g\.(?=\s|,|$)/gi, "for example"],
  [/\bi\.e\.(?=\s|,|$)/gi, "that is"],
  [/\bFAQs\b/g, "F. A. Q. s"],
  [/\bFAQ\b/g, "F. A. Q."],
  [/\bAEO\b/g, "A. E. O."],
  [/\bGEO\b/g, "G. E. O."],
  [/\bSEO\b/g, "S. E. O."],
  [/\bLLMO\b/g, "L. L. M. O."],
  [/\bLLMs\b/g, "L. L. M. s"],
  [/\bLLM\b/g, "L. L. M."],
  [/\bSERPs\b/g, "S. E. R. P. s"],
  [/\bSERP\b/g, "S. E. R. P."],
  [/\bCTAs\b/g, "C. T. A. s"],
  [/\bCTA\b/g, "C. T. A."],
  [/\bURLs\b/g, "U. R. L. s"],
  [/\bURL\b/g, "U. R. L."],
  [/\bHTML\b/g, "H. T. M. L."],
  [/\bJSON-LD\b/g, "J. S. O. N. L. D."],
  [/\bJSON\b/g, "J. S. O. N."],
  [/\bCWV\b/g, "C. W. V."],
  [/\bGSC\b/g, "G. S. C."],
  [/\bAPIs\b/g, "A. P. I. s"],
  [/\bAPI\b/g, "A. P. I."],
  [/\bUI\b/g, "U. I."],
  [/\bUX\b/g, "U. X."],
];

export function prepareSpokenText(raw: string): string {
  let s = raw
    .replace(/\s*\[\d+\]/g, "")
    .replace(/^\s*(?:[•▪▸◦–—-]+)\s*/, "")
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return "";
  for (const [pattern, replacement] of ACRONYM_MAP) {
    s = s.replace(pattern, replacement);
  }
  s = s.replace(/\s+/g, " ").trim();
  if (!/[.!?;:]$/.test(s)) {
    s += ".";
  }
  return s;
}

export function detectCalloutBlockIds(a: Article): string[] {
  const ids: string[] = [];
  let inCallout = false;
  for (let i = 0; i < Math.min(a.blocks.length, 15); i++) {
    const b = a.blocks[i];
    const t = b.text.trim();
    if (
      b.kind === "heading" &&
      /^(?:key takeaways|tl;?dr|summary|highlights|in brief|quick summary|table of contents)$/i.test(
        t,
      )
    ) {
      inCallout = true;
      ids.push(b.id);
      continue;
    }
    if (inCallout) {
      if (b.kind === "list") {
        ids.push(b.id);
      } else {
        break;
      }
    }
  }
  return ids;
}

export function segments(a: Article, excluded: string[] = []): Segment[] {
  return a.blocks
    .filter((b) => {
      if (!["heading", "paragraph", "list", "quote"].includes(b.kind))
        return false;
      const cleaned = b.text.replace(/\s*\[\d+\]/g, "").trim();
      if (!cleaned) return false;
      if (CLUTTER_SEGMENT_RE.test(cleaned)) return false;
      if (cleaned.length < 45 && SOURCE_LINE_RE.test(cleaned)) return false;
      return !excluded.includes(b.id);
    })
    .map((b, i) => ({
      id: b.id,
      text: b.text.replace(/\s*\[\d+\]/g, ""),
      label: `Section ${i + 1}`,
      kind: b.kind,
    }))
    .filter((b) => b.text.trim());
}

export function inputError(items: Segment[], voice: string, rate: number) {
  if (!items.length) return "Select at least one text section.";
  if (items.reduce((n, s) => n + s.text.length, 0) > 20000)
    return "Select up to 20,000 characters for one audio file. Uncheck sections or shorten the source.";
  if (!Object.prototype.hasOwnProperty.call(VOICES, voice))
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

function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes.buffer;
}

function decodeBufferToPcm(
  audioBuf: AudioBuffer,
  pitchStep: number,
): Int16Array {
  const ch0 = audioBuf.getChannelData(0);
  const ch1 =
    audioBuf.numberOfChannels > 1 ? audioBuf.getChannelData(1) : null;
  const ratio = (audioBuf.sampleRate / SAMPLE_RATE) * pitchStep;
  const outLen = Math.max(1, Math.floor(ch0.length / ratio));
  const pcm = new Int16Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const pos = i * ratio;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const s0 = ch1 ? (ch0[idx] + ch1[idx]) * 0.5 : ch0[idx] || 0;
    const nextIdx = Math.min(ch0.length - 1, idx + 1);
    const s1 = ch1
      ? (ch0[nextIdx] + ch1[nextIdx]) * 0.5
      : ch0[nextIdx] || 0;
    const val = s0 + (s1 - s0) * frac;
    pcm[i] = Math.round(Math.max(-1, Math.min(1, val)) * 32767);
  }
  return pcm;
}

async function synthesizeCloudNeural(
  text: string,
  voice: string,
  rate: number,
  sharedCtx: AudioContext | null,
  signal: AbortSignal,
): Promise<Int16Array | null> {
  if (!sharedCtx || typeof window === "undefined" || typeof fetch !== "function")
    return null;

  const voiceCfg = VOICES[voice] || VOICES["gmw/en-US"];
  for (let attempt = 0; attempt < 2; attempt++) {
    signal.throwIfAborted();
    try {
      const res = await fetch("/api/ai-tools/article-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ text, voice, rate, format: "chunks" }),
        signal,
      });
      if (!res.ok) continue;

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        const b64Chunks: string[] = Array.isArray(data?.chunks)
          ? data.chunks
          : [];
        if (!b64Chunks.length) continue;

        const engine = typeof data?.engine === "string" ? data.engine : "";
        const pitchStep =
          engine === "google-tts" ? voiceCfg.fallbackRateScale : 1.0;
        const decodedParts: Int16Array[] = [];
        const sentencePause = new Int16Array(Math.round(SAMPLE_RATE * 0.08));

        for (let c = 0; c < b64Chunks.length; c++) {
          signal.throwIfAborted();
          const buf = base64ToArrayBuffer(b64Chunks[c]);
          if (buf.byteLength < 64) continue;
          const audioBuf = await sharedCtx.decodeAudioData(buf);
          const pcm = decodeBufferToPcm(audioBuf, pitchStep);
          if (pcm.length > 0) {
            decodedParts.push(pcm);
            if (c < b64Chunks.length - 1) {
              decodedParts.push(sentencePause);
            }
          }
        }
        if (!decodedParts.length) continue;
        const totalLen = decodedParts.reduce((acc, p) => acc + p.length, 0);
        const merged = new Int16Array(totalLen);
        let offset = 0;
        for (const part of decodedParts) {
          merged.set(part, offset);
          offset += part.length;
        }
        return merged;
      } else {
        const engine = res.headers.get("X-Speech-Engine") || "";
        const arrayBuf = await res.arrayBuffer();
        if (!arrayBuf || arrayBuf.byteLength < 100) continue;
        const pitchStep =
          engine === "google-tts" ? voiceCfg.fallbackRateScale : 1.0;
        const audioBuf = await sharedCtx.decodeAudioData(arrayBuf.slice(0));
        return decodeBufferToPcm(audioBuf, pitchStep);
      }
    } catch {
      if (signal.aborted) throw new Error("Audio generation cancelled.");
    }
  }
  return null;
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
  const voiceConfig = VOICES[voice] || VOICES["gmw/en-US"];
  const worker = new Worker("/vendor/espeak-ng/espeakng.worker.js"),
    chunks: Int16Array[] = [],
    chapters: Chapter[] = [];
  let samples = 0,
    audible = false,
    activeReject: ((error: Error) => void) | undefined;
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
          if (data.length > 100) {
            let prev = data[0];
            for (let j = 1; j < data.length - 1; j++) {
              const cur = data[j];
              data[j] = Math.round(prev * 0.2 + cur * 0.6 + data[j + 1] * 0.2);
              prev = cur;
            }
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

  let sharedAudioCtx: AudioContext | null = null;
  if (typeof window !== "undefined") {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (typeof AudioCtx === "function") {
      try {
        sharedAudioCtx = new AudioCtx();
      } catch {}
    }
  }

  try {
    await waitFor(() => {}, true);
    signal.throwIfAborted();

    const preparedTexts = items.map(
      (item) => prepareSpokenText(item.text) || item.text,
    );
    const cloudResults: (Int16Array | null)[] = new Array(items.length).fill(
      null,
    );

    // Parallel cloud synthesis pool (up to 6 sections synthesized concurrently)
    if (sharedAudioCtx) {
      let nextIdx = 0;
      let completedCloud = 0;
      let consecutiveFailures = 0;
      const concurrency = Math.min(6, items.length);

      const runPoolWorker = async () => {
        while (consecutiveFailures < 3) {
          const idx = nextIdx++;
          if (idx >= items.length) break;
          signal.throwIfAborted();
          const pcm = await synthesizeCloudNeural(
            preparedTexts[idx],
            voice,
            rate,
            sharedAudioCtx,
            signal,
          );
          signal.throwIfAborted();
          if (pcm && pcm.length > 0) {
            cloudResults[idx] = pcm;
            consecutiveFailures = 0;
            completedCloud++;
            onProgress(completedCloud, items.length);
          } else {
            consecutiveFailures++;
          }
        }
      };

      await Promise.all(
        Array.from({ length: concurrency }, () => runPoolWorker()),
      );
    }

    for (let i = 0; i < items.length; i++) {
      signal.throwIfAborted();
      const start = samples / SAMPLE_RATE;
      const cloudPcm = cloudResults[i];

      if (cloudPcm && cloudPcm.length > 0) {
        for (let k = 0; k < cloudPcm.length; k++) {
          if (cloudPcm[k]) {
            audible = true;
            break;
          }
        }
        samples += cloudPcm.length;
        if (samples > SAMPLE_RATE * MAX_SECONDS)
          throw Error("Audio exceeds 20 minutes. Select less text.");
        chunks.push(cloudPcm);
      } else {
        for (const text of splitText(preparedTexts[i])) {
          worker.postMessage({
            method: "set_voice",
            args: [voiceConfig.espeakVoice],
          });
          worker.postMessage({
            method: "set_pitch",
            args: [voiceConfig.pitch],
          });
          worker.postMessage({ method: "set_rate", args: [rate] });
          await waitFor(() =>
            worker.postMessage({
              method: "synthesize",
              args: [text],
              callback: "speech",
            }),
          );
          signal.throwIfAborted();
        }
        onProgress(i + 1, items.length);
      }

      if (items.length > 1 && i < items.length - 1) {
        const pauseLen = Math.round(SAMPLE_RATE * 0.38);
        if (samples + pauseLen <= SAMPLE_RATE * MAX_SECONDS) {
          chunks.push(new Int16Array(pauseLen));
          samples += pauseLen;
        }
      }

      chapters.push({
        id: items[i].id,
        text: items[i].text,
        start,
        end: samples / SAMPLE_RATE,
      });
    }
    if (!audible)
      throw Error(
        "The speech engine returned silent audio. Check the text and retry.",
      );
    return { bytes: wave(chunks), chapters, seconds: samples / SAMPLE_RATE };
  } finally {
    signal.removeEventListener("abort", cancelled);
    worker.terminate();
    if (sharedAudioCtx) {
      try {
        await sharedAudioCtx.close();
      } catch {}
    }
  }
}

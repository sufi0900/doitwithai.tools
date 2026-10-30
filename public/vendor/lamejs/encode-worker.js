/* Do It With AI Tools MP3 bridge. LAME is loaded separately and remains replaceable.
 * See NOTICE.md and LGPL-3.0.txt for the unmodified third-party encoder. */
"use strict";
importScripts("lame.min.js");
self.onmessage = async ({ data }) => {
  try {
    if (!(data.wav instanceof ArrayBuffer) || data.wav.byteLength < 46)
      throw Error("No valid narration was available for MP3 encoding.");
    const view = new DataView(data.wav);
    const ascii = (offset, size) =>
      String.fromCharCode(...new Uint8Array(data.wav, offset, size));
    if (
      ascii(0, 4) !== "RIFF" ||
      ascii(8, 4) !== "WAVE" ||
      ascii(12, 4) !== "fmt " ||
      ascii(36, 4) !== "data" ||
      view.getUint16(20, true) !== 1 ||
      view.getUint16(22, true) !== 1 ||
      view.getUint32(24, true) !== 22050 ||
      view.getUint16(34, true) !== 16 ||
      view.getUint32(40, true) !== data.wav.byteLength - 44 ||
      (data.wav.byteLength - 44) % 2 ||
      data.wav.byteLength > 44 + 22050 * 1200 * 2
    )
      throw Error(
        "The narration has an unsupported audio format or exceeds 20 minutes.",
      );
    const samples = new Int16Array((data.wav.byteLength - 44) / 2);
    for (let i = 0; i < samples.length; i++)
      samples[i] = view.getInt16(44 + i * 2, true);
    const encoder = new lamejs.Mp3Encoder(1, 22050, 64);
    const parts = [];
    for (let i = 0; i < samples.length; i += 1152) {
      const part = encoder.encodeBuffer(samples.subarray(i, i + 1152));
      if (part.length) parts.push(new Uint8Array(part));
      if (i % (1152 * 100) === 0) {
        self.postMessage({ progress: Math.floor((i / samples.length) * 100) });
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
    const tail = encoder.flush();
    if (tail.length) parts.push(new Uint8Array(tail));
    const size = parts.reduce((n, p) => n + p.length, 0);
    if (!size) throw Error("MP3 encoding returned an empty file.");
    const output = new Uint8Array(size);
    let offset = 0;
    for (const part of parts) {
      output.set(part, offset);
      offset += part.length;
    }
    self.postMessage({ bytes: output.buffer }, [output.buffer]);
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : "MP3 encoding failed.",
    });
  }
};

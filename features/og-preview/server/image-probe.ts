import { assertSafeFetchUrl } from "@/features/schema-generator/server/fetch-page";
import type { ImageProbeResult } from "../types";

const MAX_HEADER_BYTES = 65_536;
const FETCH_TIMEOUT_MS = 10_000;

function readUInt32BE(bytes: Uint8Array, offset: number) {
  return (bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3];
}
function readUInt16BE(bytes: Uint8Array, offset: number) {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function parsePng(bytes: Uint8Array): { width: number; height: number } | null {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 24 || !signature.every((byte, index) => bytes[index] === byte)) return null;
  // IHDR chunk always starts at byte 8: 4-byte length, 4-byte "IHDR", then width/height.
  return { width: readUInt32BE(bytes, 16), height: readUInt32BE(bytes, 20) };
}

function parseJpeg(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    // Markers with no payload length to skip.
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    const segmentLength = readUInt16BE(bytes, offset + 2);
    const isSofMarker = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSofMarker) {
      return { height: readUInt16BE(bytes, offset + 5), width: readUInt16BE(bytes, offset + 7) };
    }
    offset += 2 + segmentLength;
  }
  return null;
}

function detectFormat(bytes: Uint8Array): string | null {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50) return "png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8) return "jpeg";
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return "webp";
  if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "gif";
  return null;
}

export async function probeImage(rawUrl: string): Promise<ImageProbeResult> {
  let current = await assertSafeFetchUrl(rawUrl);
  let response: Response | undefined;
  const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    response = await fetch(current, {
      redirect: "manual",
      signal,
      headers: {
        Range: `bytes=0-${MAX_HEADER_BYTES - 1}`,
        "User-Agent": "DoItWithAI-OgPreviewChecker/1.0 (+https://doitwithai.tools)",
      },
    });
    if (response.status < 300 || response.status >= 400) break;
    const location = response.headers.get("location");
    await response.body?.cancel();
    if (!location || redirects === 3) throw new Error("The image redirected too many times.");
    current = await assertSafeFetchUrl(new URL(location, current).toString());
  }
  if (!response) throw new Error("The image could not be read.");

  if (!response.ok && response.status !== 206) {
    throw new Error(`The image URL returned HTTP ${response.status}.`);
  }
  const contentType = response.headers.get("content-type") || "";
  if (!/^image\//i.test(contentType)) {
    throw new Error("That URL did not return an image.");
  }

  const contentRange = response.headers.get("content-range");
  const totalBytes = contentRange ? Number(contentRange.split("/")[1]) || null : Number(response.headers.get("content-length")) || null;

  const buffer = new Uint8Array(MAX_HEADER_BYTES);
  let length = 0;
  const reader = response.body?.getReader();
  if (reader) {
    try {
      while (length < MAX_HEADER_BYTES) {
        const { value, done } = await reader.read();
        if (done) break;
        const part = value.subarray(0, MAX_HEADER_BYTES - length);
        buffer.set(part, length);
        length += part.length;
      }
    } finally {
      await reader.cancel().catch(() => undefined);
    }
  }
  const header = buffer.subarray(0, length);
  const format = detectFormat(header);
  let dimensions: { width: number; height: number } | null = null;
  if (format === "png") dimensions = parsePng(header);
  else if (format === "jpeg") dimensions = parseJpeg(header);

  return {
    width: dimensions?.width ?? null,
    height: dimensions?.height ?? null,
    format,
    bytes: totalBytes,
  };
}

export class BodyError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
// Check streamed bytes too: content-length can be absent or inaccurate.
export async function readBoundedJson(request: Pick<Request, "headers" | "body">, maximum = 20_000): Promise<unknown> {
  if (Number(request.headers.get("content-length")) > maximum) throw new BodyError(413, "The page brief is too large.");
  if (!request.body) throw new BodyError(400, "Send a valid JSON request body.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > maximum) { await reader.cancel(); throw new BodyError(413, "The page brief is too large."); }
      chunks.push(chunk.value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { throw new BodyError(400, "Send a valid JSON request body."); }
}

/** Strips markdown code fences and extracts the outermost JSON object/array when present. */
export function extractJsonText(raw: string): string {
  const stripped = String(raw || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const firstBrace = stripped.indexOf("{");
  const lastBrace = stripped.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return stripped.slice(firstBrace, lastBrace + 1);
  }
  const firstBracket = stripped.indexOf("[");
  const lastBracket = stripped.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    return stripped.slice(firstBracket, lastBracket + 1);
  }
  return stripped;
}

/** Emits structured JSON diagnostics to stderr while safely falling back to console.error on Workers runtimes. */
export function safeStderrLog(payload: Record<string, unknown>): void {
  const line = JSON.stringify(payload) + "\n";
  try {
    if (typeof process !== "undefined" && typeof process.stderr?.write === "function") {
      process.stderr.write(line);
      return;
    }
  } catch {
    // Fall through to console.error when Workers stderr proxy rejects writes
  }
  console.error(line.trimEnd());
}

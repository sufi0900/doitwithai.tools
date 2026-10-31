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

import { assertSafeFetchUrl } from "@/features/schema-generator/server/fetch-page";

const MAX_BYTES = 500_000;
const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 10_000;

async function readLimitedText(response: Response) {
  const declared = Number(response.headers.get("content-length") || 0);
  if (declared > MAX_BYTES)
    throw new Error("That robots.txt is too large to read safely.");
  if (!response.body) return "";

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    size += value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel();
      throw new Error("That robots.txt is too large to read safely.");
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(body);
}

export async function fetchRobotsTxt(
  rawUrl: string,
): Promise<{ text: string; finalUrl: string }> {
  const deadline = Date.now() + 15_000;
  let current = await assertSafeFetchUrl(rawUrl);

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    const remaining = deadline - Date.now();
    if (remaining <= 0)
      throw new Error("This page took too long to respond. Please try again.");
    const signal = AbortSignal.timeout(Math.min(FETCH_TIMEOUT_MS, remaining));
    const response = await fetch(current, {
      redirect: "manual",
      signal,
      headers: {
        Accept: "text/plain,*/*;q=0.5",
        "User-Agent":
          "DoItWithAI-RobotsTxtChecker/1.0 (+https://doitwithai.tools)",
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location)
        throw new Error("The request returned an invalid redirect.");
      if (redirect === MAX_REDIRECTS)
        throw new Error("The request redirected too many times.");
      current = await assertSafeFetchUrl(new URL(location, current).toString());
      continue;
    }
    if (response.status === 404) {
      throw new Error(
        "No robots.txt was found at that location (404). Every page on the site is implicitly crawlable.",
      );
    }
    if (!response.ok)
      throw new Error(`The request returned HTTP ${response.status}.`);

    return {
      text: await readLimitedText(response),
      finalUrl: current.toString(),
    };
  }
  throw new Error("robots.txt could not be fetched.");
}

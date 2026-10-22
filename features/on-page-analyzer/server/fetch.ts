import { assertSafeFetchUrl } from "@/features/schema-generator/server/fetch-page";
import { PageCollector } from "./extract";
const MAX_BYTES = 8_000_000;
const userAgent = "DoItWithAI-OnPageAudit/1.0 (+https://doitwithai.tools)";
export async function fetchAuditPage(
  rawUrl: string,
  deps = { safeUrl: assertSafeFetchUrl, fetcher: fetch },
) {
  let url = await deps.safeUrl(rawUrl);
  url.hash = "";
  const signal = AbortSignal.timeout(20000);
  for (let hop = 0; hop <= 3; hop++) {
    const response = await deps.fetcher(url, {
      redirect: "manual",
      signal,
      cache: "no-store",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": userAgent,
      },
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location || hop === 3)
        throw new Error(
          "The page redirected too many times. Enter its final public URL.",
        );
      url = await deps.safeUrl(new URL(location, url).toString());
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(
        `The website returned HTTP ${response.status}. Try Paste HTML if you can access the page.`,
      );
    }
    if (
      !/text\/html|application\/xhtml\+xml/i.test(
        response.headers.get("content-type") || "",
      )
    ) {
      await response.body?.cancel();
      throw new Error("The URL did not return an HTML page.");
    }
    if (!response.body) throw new Error("The page response was empty.");
    const collector = new PageCollector(url.toString(), "url"),
      reader = response.body.getReader(),
      decoder = new TextDecoder();
    collector.page.status = response.status;
    collector.page.redirects = hop;
    const directives = response.headers.get("x-robots-tag");
    if (directives)
      collector.page.robots.push(
        `HTTP X-Robots-Tag: ${directives.slice(0, 2000)}`,
      );
    try {
      while (true) {
        let chunk: ReadableStreamReadResult<Uint8Array>;
        try {
          chunk = await reader.read();
        } catch (error) {
          if (collector.page.bytesRead < 2000) throw error;
          collector.page.partial = true;
          collector.page.warnings.push(
            "The connection ended early. Available evidence was retained.",
          );
          break;
        }
        if (chunk.done) {
          collector.write(decoder.decode());
          break;
        }
        const value = chunk.value.subarray(
          0,
          MAX_BYTES - collector.page.bytesRead,
        );
        collector.page.bytesRead += value.byteLength;
        collector.write(decoder.decode(value, { stream: true }));
        if (collector.page.bytesRead >= MAX_BYTES) {
          collector.page.partial = true;
          collector.page.warnings.push(
            "The first 8 MB were checked. Content beyond this point was not analyzed.",
          );
          await reader.cancel();
          break;
        }
      }
    } finally {
      reader.releaseLock();
    }
    const page = collector.finish();
    // Optional files have a separate short deadline. Failure never erases the main report.
    const files = await Promise.allSettled(
      ["robots.txt", "llms.txt"].map(async (path) => {
        const target = await deps.safeUrl(new URL(`/${path}`, url).toString());
        const res = await deps.fetcher(target, {
          redirect: "manual",
          signal: AbortSignal.timeout(3500),
          cache: "no-store",
          headers: { "User-Agent": userAgent },
        });
        if (res.status === 404 || res.status === 410) {
          await res.body?.cancel();
          return { status: "missing" as const, text: "" };
        }
        if (
          !res.ok ||
          !/text\/plain|text\/markdown/i.test(
            res.headers.get("content-type") || "",
          )
        ) {
          await res.body?.cancel();
          return { status: "unknown" as const, text: "" };
        }
        let text = "",
          bytes = 0;
        const stream = res.body?.getReader(),
          decode = new TextDecoder();
        if (stream)
          try {
            while (true) {
              const v = await stream.read();
              if (v.done) break;
              const part = v.value.subarray(0, 32000 - bytes);
              bytes += part.byteLength;
              text += decode.decode(part, { stream: true });
              if (bytes >= 32000) {
                await stream.cancel();
                break;
              }
            }
            text += decode.decode();
          } finally {
            stream.releaseLock();
          }
        return { status: "found" as const, text };
      }),
    );
    if (files[0].status === "fulfilled") {
      page.resources.robots = files[0].value.status;
      page.resources.robotsText = files[0].value.text;
    }
    if (files[1].status === "fulfilled")
      page.resources.llms = files[1].value.status;
    return page;
  }
  throw new Error("The page could not be imported.");
}

import {
  inspectCrawlerPath,
  parseCrawlerPolicy,
} from "../robots-generator/access";
import { fetchPublic, publicUrl } from "../backlink-verifier/fetch.server";
import { mapLimit } from "../backlink-verifier/verify.server";
import { analyzeMentions, emptyMentionReport, ownSource } from "./analyze";
import type { Settings } from "./types";

export async function verifyMentions(
  sources: string[],
  settings: Settings,
  signal?: AbortSignal,
  fetcher = fetchPublic,
) {
  const policies = new Map<string, Promise<string>>();
  const blocked = async (raw: string) => {
    const url = publicUrl(raw);
    if (!policies.has(url.origin))
      policies.set(
        url.origin,
        fetcher(new URL("/robots.txt", url).href, {
          text: true,
          bytes: 64000,
          timeout: 4000,
          signal,
        }).then((result) => {
          if ([404, 410].includes(result.status)) return "";
          if (result.status !== 200) throw new Error("Robots unavailable");
          return result.html;
        }),
      );
    const text = await policies.get(url.origin)!;
    return (
      inspectCrawlerPath(
        parseCrawlerPolicy(text),
        "doitwithai-backlinkverifier",
        url.pathname + url.search,
      ).status === "blocked"
    );
  };
  return mapLimit([...new Set(sources)], 3, async (source) => {
    const report = emptyMentionReport(source);
    try {
      const url = publicUrl(source);
      if (ownSource(url.href, settings.target)) {
        report.status = "own-site";
        report.notes.push(
          "This source belongs to your website and was excluded before fetching.",
        );
        return report;
      }
      try {
        if (await blocked(url.href)) {
          report.error =
            "Robots.txt disallows this checker. Inspect supplied HTML instead.";
          return report;
        }
      } catch {
        report.notes.push(
          "Robots policy could not be verified. No crawl-access conclusion was drawn.",
        );
      }
      const page = await fetcher(url.href, { signal });
      report.finalUrl = page.url;
      report.httpStatus = page.status;
      if (page.status < 200 || page.status >= 300) {
        report.error = `The source returned HTTP ${page.status}. Mention and link presence remain unverified.`;
        return report;
      }
      if (page.url !== url.href) {
        try {
          if (await blocked(page.url)) {
            report.error =
              "The final page's robots policy disallows this checker. Its content was not analyzed.";
            return report;
          }
        } catch {
          report.notes.push(
            "The final source robots policy could not be verified.",
          );
        }
      }
      return analyzeMentions(page.html, source, settings, {
        ...report,
        method: "live",
      });
    } catch (error) {
      report.error = signal?.aborted
        ? "This check stopped before a complete result was received."
        : error instanceof Error &&
            /private|reserved|public|HTML|redirect|compressed|credentials|port/i.test(
              error.message,
            )
          ? error.message
          : "This source could not be fetched completely. It may be blocked, unavailable, or timed out. Try supplied HTML.";
      return report;
    }
  });
}

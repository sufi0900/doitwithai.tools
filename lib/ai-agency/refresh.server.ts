import { load } from "cheerio";
import {
  fetchPublic,
  publicUrl,
} from "@/features/backlink-verifier/fetch.server";
import { robotsAllows } from "@/features/internal-linking/server";

export type PageFields = {
  heading: string;
  title: string;
  description: string;
};
export function fieldFindings(fields: PageFields) {
  const findings: string[] = [];
  if (!fields.heading.trim()) findings.push("Missing H1");
  if (!fields.title.trim() || fields.title.length > 70)
    findings.push("Missing or long page title");
  if (!fields.description.trim() || fields.description.length > 170)
    findings.push("Missing or long meta description");
  return findings;
}

export function repairFields(fields: PageFields, excerpt: string): PageFields {
  const trim = (value: string, max: number) =>
    value.trim().replace(/\s+/g, " ").slice(0, max).trimEnd();
  return {
    heading: trim(fields.heading || fields.title, 120),
    title: trim(fields.title || fields.heading, 70),
    description: trim(fields.description || excerpt, 170),
  };
}

export async function inspectPage(raw: string, domain: string) {
  const target = publicUrl(raw);
  const origin = new URL(domain).origin;
  let policy = "";
  const beforeRequest = async (url: URL) => {
    if (url.origin !== origin || !robotsAllows(policy, url.href))
      throw Error("Outside crawl scope");
  };
  const signal = AbortSignal.timeout(12000);
  const robots = await fetchPublic(origin + "/robots.txt", {
    signal,
    beforeRequest,
    text: true,
    maxDecodedBytes: 128000,
  });
  if (![200, 404, 410].includes(robots.status))
    throw Error("Robots policy unavailable");
  if (robots.status === 200) policy = robots.html;
  const page = await fetchPublic(target.href, {
    signal,
    beforeRequest,
    maxDecodedBytes: 512000,
  });
  if (page.status !== 200)
    return {
      url: target.href,
      status: page.status,
      fields: null,
      findings: ["HTTP " + page.status],
    };
  const $ = load(page.html);
  const fields = {
    heading: $("h1").first().text().trim(),
    title: $("title").first().text().trim(),
    description:
      $('meta[name="description" i]').first().attr("content")?.trim() || "",
  };
  const findings = fieldFindings(fields);
  if ($("h1").length > 1) findings.push("Multiple H1 elements");
  if (!$('link[rel="canonical"]').length)
    findings.push("Missing canonical link");
  return {
    url: target.href,
    status: page.status,
    fields,
    findings,
    suggested: repairFields(
      fields,
      $("main p,article p,body p").first().text(),
    ),
  };
}

export async function inspectCrawlFiles(domain: string) {
  const origin = publicUrl(domain).origin;
  const signal = AbortSignal.timeout(12000);
  let policy = "";
  const beforeRequest = async (url: URL) => {
    if (url.origin !== origin || !robotsAllows(policy, url.href))
      throw Error("Outside crawl scope");
  };
  const robotsUrl = origin + "/robots.txt";
  const robots = await fetchPublic(robotsUrl, {
    signal,
    beforeRequest,
    text: true,
    maxDecodedBytes: 128000,
  }).catch(() => null);
  const files = [{ url: robotsUrl, status: robots?.status ?? null }];
  if (!robots || ![200, 404, 410].includes(robots.status)) return files;
  if (robots.status === 200) policy = robots.html;
  const declared = policy.match(/^sitemap:\s*(\S+)/im)?.[1];
  const urls = [declared || origin + "/sitemap.xml", origin + "/llms.txt"];
  files.push(
    ...(await Promise.all(
      urls.map(async (url) => {
        const page = await fetchPublic(url, {
          signal,
          beforeRequest,
          html: false,
        }).catch(() => null);
        return { url, status: page?.status ?? null };
      }),
    )),
  );
  return files;
}

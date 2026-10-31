import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import http from "node:http";
import https from "node:https";
import * as cheerio from "cheerio";
import { normalizeUrl, sameSite, words, type Page } from "./core";
import { readDocument } from "./document-reader";

export function publicIpv4(address: string) {
  if (isIP(address) !== 4) return false;
  const [a, b, c] = address.split(".").map(Number);
  return !(
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 168 || b === 0 || (b === 88 && c === 99))) ||
    (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
    (a === 203 && b === 0 && c === 113)
  );
}
// Pin the validated address to the actual connection. A second DNS lookup cannot rebind it.
export async function readPublic(
  raw: string,
  site: string,
  signal: AbortSignal,
  kind: "html" | "xml" | "text",
  allowed: (url: string) => boolean = () => true,
): Promise<{ url: string; body: string; truncated?: boolean }> {
  let url = new URL(normalizeUrl(raw));
  for (let redirects = 0; redirects <= 3; redirects++) {
    url = new URL(normalizeUrl(url.toString()));
    if (signal.aborted) throw new Error("Analysis time limit reached.");
    if (!allowed(url.toString())) throw new Error("Blocked by robots.txt");
    if (
      !sameSite(url.toString(), site) ||
      url.port ||
      /(^localhost$|\.(local|internal|localhost)$)/i.test(url.hostname)
    )
      throw new Error("Use a standard public URL on the same hostname.");
    const addresses = await new Promise<{ address: string; family: number }[]>(
      (resolve, reject) => {
        const stop = () => reject(new Error("Analysis time limit reached."));
        const timer = setTimeout(
          () => reject(new Error("DNS lookup timed out.")),
          5000,
        );
        signal.addEventListener("abort", stop, { once: true });
        lookup(url.hostname, { all: true })
          .then(resolve, reject)
          .finally(() => {
            clearTimeout(timer);
            signal.removeEventListener("abort", stop);
          });
      },
    );
    const v4 = addresses.filter((a) => a.family === 4);
    if (!v4.length || v4.some((a) => !publicIpv4(a.address)))
      throw new Error(
        "Private, reserved, and unsupported network addresses are blocked.",
      );
    const response = await new Promise<{
      status: number;
      location?: string;
      type: string;
      body: string;
      truncated?: boolean;
    }>((resolve, reject) => {
      const req = (url.protocol === "https:" ? https : http).request(
        url,
        {
          signal,
          method: "GET",
          headers: {
            "User-Agent":
              "DoItWithAI-LinkFinder/1.0 (+https://doitwithai.tools)",
            Accept:
              kind === "html"
                ? "text/html,application/xhtml+xml"
                : kind === "xml"
                  ? "application/xml,text/xml"
                  : "text/plain",
            "Accept-Encoding": "gzip, br, deflate",
          },
          lookup: (_hostname, options, callback) => {
            const chosen = v4[0];
            if (typeof options === "object" && options.all)
              callback(null, [chosen]);
            else callback(null, chosen.address, 4);
          },
        },
        (res) => {
          const status = res.statusCode || 0;
          if (status >= 300 && status < 400) {
            res.resume();
            resolve({
              status,
              location: res.headers.location,
              type: "",
              body: "",
            });
            return;
          }
          if (status !== 200) {
            res.resume();
            reject(new Error(`HTTP ${status}`));
            return;
          }
          const type = String(res.headers["content-type"] || "");
          if (
            kind === "html" &&
            /noindex/i.test(String(res.headers["x-robots-tag"] || ""))
          ) {
            res.resume();
            reject(new Error("Page contains a noindex directive."));
            return;
          }
          if (
            (kind === "html" &&
              !/text\/html|application\/xhtml\+xml/i.test(type)) ||
            (kind === "xml" && !/xml|text\/plain/i.test(type))
          ) {
            res.resume();
            reject(
              new Error(
                `The URL did not return ${kind === "html" ? "HTML" : "XML"}.`,
              ),
            );
            return;
          }
          readDocument(
            res,
            String(res.headers["content-encoding"] || ""),
            kind,
            signal,
          ).then((document) => resolve({ status, type, ...document }), reject);
        },
      );
      req.setTimeout(5000, () =>
        req.destroy(new Error("Page download timed out.")),
      );
      const timer = setTimeout(
        () => req.destroy(new Error("Page download timed out.")),
        kind === "html" ? 12000 : 6000,
      );
      req.on("close", () => clearTimeout(timer));
      req.on("error", reject);
      req.end();
    });
    if (response.location) {
      if (redirects === 3) throw new Error("Too many redirects.");
      url = new URL(response.location, url);
      continue;
    }
    return {
      url: normalizeUrl(url.toString()),
      body: response.body,
      truncated: response.truncated || false,
    };
  }
  throw new Error("Cannot fetch this URL.");
}
export function extractPage(html: string, url: string): Page {
  const $ = cheerio.load(html);
  if (/noindex/i.test($("meta[name='robots']").attr("content") || ""))
    throw new Error("Page contains a noindex directive.");
  // Some templates place a small teaser article before the actual article.
  const articles = $("article")
    .toArray()
    .sort(
      (a, b) =>
        $(b).find("p,li").text().length - $(a).find("p,li").text().length,
    );
  const root = articles.length
    ? $(articles[0])
    : $("main").first().length
      ? $("main").first()
      : $("body");
  const title =
    root.find("h1").first().text().trim() ||
    $("h1").first().text().trim() ||
    $("title").text().trim();
  root
    .find(
      "script,style,noscript,nav,footer,aside,form,template,video,audio,iframe,canvas,svg,[hidden],[aria-hidden='true']",
    )
    .remove();
  const links: Page["links"] = [];
  root.find("a[href]").each((_, el) => {
    try {
      links.push({
        url: normalizeUrl($(el).attr("href")!, url),
        text: $(el).text().replace(/\s+/g, " ").trim(),
      });
    } catch {}
  });
  const paragraphs: string[] = [];
  const unlinkedParagraphs: string[] = [];
  let chars = 0,
    truncated = false;
  const blocks = root
    .find("p,li")
    .filter((_, el) => $(el).text().replace(/\s+/g, " ").trim().length >= 40);
  const fallbackBlocks = root
    .find("div,section")
    .filter((_, el) => !$(el).find("p,li,div,section").length);
  (blocks.length ? blocks : fallbackBlocks).each((_, el) => {
    if ($(el).is("li") && $(el).find("p,li").length) return;
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text.length < 40) return;
    const unlinked = $(el).clone();
    unlinked.find("a").each((_, a) => {
      $(a).replaceWith("█".repeat($(a).text().replace(/\s+/g, " ").length));
    });
    const unlinkedText = unlinked.text().replace(/\s+/g, " ").trim();
    for (let start = 0; start < text.length; start += 2000) {
      const passage = text.slice(start, start + 2000);
      if (chars + passage.length > 240000 || paragraphs.length >= 1200) {
        truncated = true;
        break;
      }
      paragraphs.push(passage);
      unlinkedParagraphs.push(unlinkedText.slice(start, start + 2000));
      chars += passage.length;
    }
  });
  if (!paragraphs.length)
    throw new Error(
      "No readable article paragraphs found. Paste the article text instead.",
    );
  return {
    url,
    title: title.slice(0, 200),
    paragraphs,
    unlinkedParagraphs,
    links,
    truncated,
  };
}
export function sitemapEntries(xml: string, site: string) {
  const $ = cheerio.load(xml, { xmlMode: true });
  const index = $("sitemapindex").length > 0;
  const urls: string[] = [];
  $(index ? "sitemap > loc" : "url > loc").each((_, el) => {
    try {
      const url = normalizeUrl($(el).text().trim());
      if (sameSite(url, site) && !urls.includes(url)) urls.push(url);
    } catch {}
  });
  return { index, urls: urls.slice(0, index ? 10 : 1000) };
}
export function robotsAllows(text: string, raw: string) {
  const groups: {
    agents: string[];
    rules: { allow: boolean; path: string }[];
  }[] = [];
  let current = {
    agents: [] as string[],
    rules: [] as { allow: boolean; path: string }[],
  };
  for (const line of text.split(/\r?\n/)) {
    const match = /^\s*([\w-]+)\s*:\s*(.*?)\s*$/.exec(line.split("#")[0]);
    if (!match) continue;
    const key = match[1].toLowerCase(),
      value = match[2];
    if (key === "user-agent") {
      if (current.rules.length) {
        groups.push(current);
        current = { agents: [], rules: [] };
      }
      current.agents.push(value.toLowerCase());
    } else if ((key === "allow" || key === "disallow") && value)
      current.rules.push({ allow: key === "allow", path: value });
  }
  groups.push(current);
  const specific = groups.filter((g) =>
    g.agents.some((a) => a !== "*" && "doitwithai-linkfinder".includes(a)),
  );
  const active = specific.length
    ? specific
    : groups.filter((g) => g.agents.includes("*"));
  const url = new URL(raw),
    path = url.pathname + url.search;
  const matches = active
    .flatMap((g) => g.rules)
    .filter((rule) => {
      const pattern = rule.path
        .replace(/[.+?^{}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*");
      return new RegExp(`^${pattern}`).test(path);
    })
    .sort(
      (a, b) =>
        b.path.length - a.path.length || Number(b.allow) - Number(a.allow),
    );
  return !matches.length || matches[0].allow;
}
export async function collectPages(
  input: {
    sourceUrl: string;
    sourceText: string;
    sitemapUrl: string;
    destinationUrls: string[];
  },
  signal: AbortSignal,
  read = readPublic,
) {
  const sourceUrl = normalizeUrl(input.sourceUrl),
    origin = new URL(sourceUrl).origin;
  let robots = "";
  const notes: string[] = [];
  try {
    robots = (await read(`${origin}/robots.txt`, sourceUrl, signal, "text"))
      .body;
  } catch (e) {
    if (!(e instanceof Error && /^HTTP (404|410)$/.test(e.message)))
      throw new Error(
        "Could not verify robots.txt. Try again when the website is accessible.",
      );
    notes.push(
      "This site has no robots.txt (404/410). Public pages were checked without robots exclusions.",
    );
  }
  const fetchPage = async (url: string) => {
    if (!robotsAllows(robots, url)) throw new Error("Blocked by robots.txt");
    const result = await read(url, sourceUrl, signal, "html", (u) =>
      robotsAllows(robots, u),
    );
    const page = extractPage(result.body, result.url);
    page.truncated = page.truncated || result.truncated;
    return page;
  };
  const source: Page = input.sourceText.trim()
    ? {
        url: sourceUrl,
        title: "Pasted article",
        paragraphs: input.sourceText
          .trim()
          .split(/\n\s*\n|\n/)
          .map((p) => p.trim())
          .filter(Boolean)
          .slice(0, 1200),
        links: [],
      }
    : await fetchPage(sourceUrl);
  let candidates = input.destinationUrls.map((u) => normalizeUrl(u));
  if (source.truncated)
    notes.push(
      "This large source page was partially read within safety limits. Suggestions cover the extracted passages only.",
    );
  let discovery = candidates.length ? "Supplied URLs" : "Sitemap discovery";
  if (!candidates.length) {
    const declared = [...robots.matchAll(/^\s*Sitemap:\s*(\S+)/gim)].map(
      (m) => m[1],
    );
    const queue = input.sitemapUrl
      ? [input.sitemapUrl]
      : [...declared, `${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];
    const seen = new Set<string>();
    while (
      queue.length &&
      seen.size < 4 &&
      candidates.length < 100 &&
      !signal.aborted
    ) {
      const raw = queue.shift()!;
      if (
        candidates.length &&
        !input.sitemapUrl &&
        !declared.includes(raw) &&
        (raw === `${origin}/sitemap.xml` ||
          raw === `${origin}/sitemap_index.xml`)
      )
        continue;
      if (
        seen.has(raw) ||
        !sameSite(raw, sourceUrl) ||
        !robotsAllows(robots, raw)
      )
        continue;
      seen.add(raw);
      try {
        const response = await read(raw, sourceUrl, signal, "xml", (u) =>
          robotsAllows(robots, u),
        );
        const parsed = sitemapEntries(response.body, sourceUrl);
        if (parsed.index) queue.unshift(...parsed.urls);
        else candidates.push(...parsed.urls);
      } catch {
        notes.push(`Could not read sitemap: ${raw}`);
      }
    }
  }
  candidates = [...new Set(candidates)].filter(
    (u) =>
      sameSite(u, sourceUrl) &&
      u !== source.url &&
      u !== sourceUrl &&
      !/\.(?:jpg|png|pdf|xml|zip|webp)$/i.test(new URL(u).pathname),
  );
  // Existing links are reported separately and need no destination download.
  const discovered = candidates.length;
  const existing = new Set(source.links.map((link) => normalizeUrl(link.url)));
  const alreadyLinked = candidates.filter((url) => existing.has(url)).length;
  const linkedCandidates = candidates.filter((url) => existing.has(url));
  candidates = candidates.filter((url) => !existing.has(url));
  const sourceTerms = new Set(
    words(source.title + " " + source.paragraphs.join(" ")),
  );
  const pathScore = (url: string) =>
    words(new URL(url).pathname.replace(/[-/]/g, " ")).reduce(
      (score, word) => score + Number(sourceTerms.has(word)),
      0,
    );
  candidates = candidates
    .sort((a, b) => pathScore(b) - pathScore(a) || a.localeCompare(b))
    .slice(0, 100);
  if (!candidates.length)
    notes.push(
      "No destination URLs found. Supply page URLs or a sitemap and try again.",
    );
  const pages: { url: string; status: string; title?: string }[] =
    linkedCandidates.map((url) => ({
      url,
      status: "Already linked from source",
    }));
  const destinations: Page[] = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (cursor < Math.min(20, candidates.length) && !signal.aborted) {
        const url = candidates[cursor++];
        try {
          const page = await fetchPage(url);
          destinations.push(page);
          pages.push({
            url,
            status: page.truncated ? "Analyzed partially" : "Analyzed",
            title: page.title,
          });
        } catch (e) {
          pages.push({
            url,
            status:
              e instanceof Error &&
              /HTTP|robots|noindex|paragraph|timed out/.test(e.message)
                ? e.message
                : "Could not safely fetch this page",
          });
        }
      }
    }),
  );
  for (const url of candidates)
    if (!pages.some((p) => p.url === url))
      pages.push({ url, status: "Not fetched within this run's limits" });
  if (signal.aborted)
    notes.push(
      "The download time limit was reached. Results cover the successfully analyzed pages.",
    );
  if (input.sourceText)
    notes.push(
      "Pasted text cannot reveal existing hyperlinks. Check for duplicate links before publishing.",
    );
  destinations.sort((a, b) => a.url.localeCompare(b.url));
  return {
    source,
    destinations,
    pages,
    notes,
    discovered,
    discovery,
    alreadyLinked,
  };
}

import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import {
  safeLink,
  type Article,
  type ArticleBrandMeta,
  type Block,
} from "./model";

const plain = (s: string) => s.replace(/\s+/g, " ").trim();

const TRAILING_CLUTTER_RE =
  /^(?:•\s*|\d+\.\s*)?(?:leia tamb[eé]m|veja tamb[eé]m|read also|also read|related (?:posts|articles|reads|stories)|further reading|recommended reading|share this (?:article|post))\s*[:\-–]/i;

const SOURCE_CAPTION_RE =
  /^(?:•\s*)?(?:image\s+)?(?:source|photo\s+credit|image\s+credit|credit)\s*(?:[:\-–]\s*\S.*)?$/i;

function pickBestImgSrc(img: any, base: string): string {
  if (!img) return "";
  const candidates = [
    img.getAttribute?.("src"),
    img.getAttribute?.("data-src"),
    img.getAttribute?.("data-lazy-src"),
    img.getAttribute?.("data-original"),
  ].filter(Boolean);

  const srcset =
    img.getAttribute?.("srcset") || img.getAttribute?.("data-srcset") || "";
  if (srcset) {
    const firstPart = srcset.split(",")[0]?.trim()?.split(/\s+/)[0];
    if (firstPart) candidates.push(firstPart);
  }

  for (const raw of candidates) {
    if (typeof raw === "string" && !raw.startsWith("data:")) {
      const resolved = safeLink(raw, base);
      if (resolved && !resolved.includes("article.invalid")) {
        return resolved;
      }
    }
  }
  return "";
}

function extractJsonLdLogo(doc: any, base: string): string {
  try {
    const scripts = Array.from(
      doc.querySelectorAll('script[type="application/ld+json"]'),
    ) as any[];
    for (const s of scripts) {
      const text = s.textContent || "";
      if (!text.trim()) continue;
      const parsed = JSON.parse(text);
      const queue = Array.isArray(parsed) ? [...parsed] : [parsed];
      while (queue.length) {
        const node = queue.shift();
        if (!node || typeof node !== "object") continue;
        if (Array.isArray(node["@graph"])) queue.push(...node["@graph"]);
        const logoCandidate =
          node.logo?.url ||
          (typeof node.logo === "string" ? node.logo : "") ||
          node.publisher?.logo?.url ||
          (typeof node.publisher?.logo === "string"
            ? node.publisher.logo
            : "") ||
          node.organization?.logo?.url ||
          "";
        if (logoCandidate && typeof logoCandidate === "string") {
          const clean = safeLink(logoCandidate, base);
          if (clean && !clean.includes("article.invalid")) return clean;
        }
      }
    }
  } catch {}
  return "";
}

function extractBrandMetadata(
  doc: any,
  base: string,
): ArticleBrandMeta | undefined {
  try {
    let domain = "doitwithai.tools";
    try {
      const u = new URL(base);
      if (u.hostname && !u.hostname.includes("article.invalid")) {
        domain = u.hostname.replace(/^www\./i, "");
      }
    } catch {}

    const siteName =
      plain(
        doc
          .querySelector('meta[property="og:site_name"]')
          ?.getAttribute("content") ||
          doc
            .querySelector('meta[name="application-name"]')
            ?.getAttribute("content") ||
          domain,
      ).slice(0, 80) || domain;

    const rawTheme =
      doc
        .querySelector('meta[name="theme-color"]')
        ?.getAttribute("content")
        ?.trim() ||
      doc
        .querySelector('meta[name="msapplication-TileColor"]')
        ?.getAttribute("content")
        ?.trim() ||
      "";
    const themeColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(rawTheme)
      ? rawTheme
      : undefined;

    const jsonLdLogo = extractJsonLdLogo(doc, base);
    const headerImg =
      doc.querySelector(
        'header img[src], header img[data-src], .custom-logo, .site-logo img, [class*="logo"] img',
      ) || null;
    const headerLogoUrl = pickBestImgSrc(headerImg, base);

    const metaLogo =
      doc
        .querySelector('meta[property="og:logo"], meta[itemprop="logo"]')
        ?.getAttribute("content") || "";

    const iconLink =
      doc
        .querySelector(
          'link[rel="apple-touch-icon"][href], link[rel="icon"][type="image/png"][href], link[rel="icon"][href], link[rel="shortcut icon"][href]',
        )
        ?.getAttribute("href") || "";

    const logoUrl =
      jsonLdLogo ||
      headerLogoUrl ||
      (metaLogo ? safeLink(metaLogo, base) : "") ||
      (iconLink ? safeLink(iconLink, base) : "") ||
      "";

    return {
      siteName,
      domain,
      ...(logoUrl && !logoUrl.includes("article.invalid") ? { logoUrl } : {}),
      ...(themeColor ? { themeColor } : {}),
    };
  } catch {
    return undefined;
  }
}

export function extractArticle(html: string, source = ""): Article {
  if (!html.trim()) throw Error("Supply non-empty HTML within 500 KB.");

  const hasHtmlMarkup = /<(article|main|body|div|p|h1|h2|section|html)\b/i.test(
    html,
  );
  const rawBytes = new TextEncoder().encode(html).length;
  if (!hasHtmlMarkup && rawBytes > 500000)
    throw Error("Supply non-empty HTML within 500 KB.");
  if (rawBytes > 6000000) throw Error("Supply non-empty HTML within 500 KB.");

  const preCleanedHtml =
    rawBytes > 350000
      ? html
          .replace(/<!--[\s\S]*?-->/g, "")
          .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, "")
      : html;

  const { document } = parseHTML(
    /<html[\s>]/i.test(preCleanedHtml)
      ? preCleanedHtml
      : `<html><body>${preCleanedHtml}</body></html>`,
  );
  const base = safeLink(source) || "https://article.invalid/";
  for (const key of ["documentURI", "baseURI", "URL"])
    Object.defineProperty(document, key, { value: base, configurable: true });

  const brand = extractBrandMetadata(document, base);

  const title = plain(
    document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content") ||
      document.querySelector("h1")?.textContent ||
      document.title ||
      "Untitled article",
  ).slice(0, 300);
  const byline = plain(
      document.querySelector('meta[name="author"]')?.getAttribute("content") ||
        "",
    ).slice(0, 300),
    published = plain(
      document
        .querySelector('meta[property="article:published_time"]')
        ?.getAttribute("content") ||
        document.querySelector("time[datetime]")?.getAttribute("datetime") ||
        "",
    ).slice(0, 100);
  const embedded = !!document.querySelector(
    "iframe,video,audio,svg,canvas,form",
  );
  document
    .querySelectorAll(
      'script,style,noscript,template,iframe,video,audio,svg,canvas,form,nav,footer,header,aside,figcaption,[hidden],[aria-hidden="true"],.toc,#toc,[id*="ez-toc"],[class*="ez-toc"],[class*="table-of-contents"],[class*="related-post"],[class*="jp-relatedposts"],[class*="sharedaddy"],[class*="share-"],[class*="social-"],[class*="breadcrumb"],[class*="newsletter"],[class*="author-bio"],[class*="comment"]',
    )
    .forEach((n: any) => n.remove());
  let parsed: ReturnType<Readability["parse"]> = null;
  try {
    parsed = new Readability(document.cloneNode(true) as unknown as Document, {
      charThreshold: 100,
      maxElemsToParse: 12000,
    }).parse();
  } catch {}
  const warnings = [
    "Compare this preview with the original. Extraction may omit sections or retain unrelated text.",
  ];
  if (embedded)
    warnings.push(
      "Interactive content, embedded media, forms, and SVG graphics are omitted.",
    );
  let body: any;
  if (parsed?.content && plain(parsed.textContent || "").length >= 100)
    body = parseHTML(`<html><body>${parsed.content}</body></html>`).document
      .body;
  else {
    body =
      document.querySelector("article") ||
      document.querySelector("main") ||
      (document.body.textContent?.trim()
        ? document.body
        : document.documentElement);
    warnings.push(
      "Reader extraction was uncertain. A fallback content area is shown for manual review.",
    );
  }
  const blocks: Block[] = [],
    links: Article["links"] = [];
  let chars = 0,
    limited = false,
    images = 0;
  function inline(n: any): string {
    if (n.nodeType === 3) return n.textContent || "";
    if (n.nodeType !== 1 || /^(SCRIPT|STYLE|SVG|IFRAME|FORM)$/.test(n.tagName))
      return "";
    if (n.tagName === "BR") return "\n";
    const text = Array.from(n.childNodes).map(inline).join("");
    if (n.tagName === "A") {
      const url = safeLink(n.getAttribute("href") || "", base);
      if (url && !url.includes("article.invalid")) {
        let index = links.findIndex((l) => l.url === url);
        if (index < 0 && links.length < 80) {
          links.push({ label: plain(text).slice(0, 200) || url, url });
          index = links.length - 1;
        }
        if (index >= 0) return `${text} [${index + 1}]`;
      }
    }
    return text;
  }
  function add(b: Omit<Block, "id">) {
    const trimmed = b.text ? b.text.trim() : "";
    if (trimmed && TRAILING_CLUTTER_RE.test(trimmed)) return;
    if (
      trimmed &&
      trimmed.length < 60 &&
      SOURCE_CAPTION_RE.test(trimmed.replace(/\s*\[\d+\]/g, "").trim())
    )
      return;
    const len = b.text.length + (b.cells?.flat().join("").length || 0);
    if (blocks.length >= 300 || chars + len > 80000) {
      limited = true;
      return;
    }
    if (b.text.length > 12000) {
      b.text = b.text.slice(0, 12000);
      limited = true;
    }
    chars += len;
    blocks.push({ ...b, id: `b${blocks.length}` });
  }
  function walk(n: any, depth = 0) {
    if (limited || depth > 50) return;
    if (n.nodeType === 3) {
      const text = plain(n.textContent || "");
      if (text) add({ kind: "paragraph", text });
      return;
    }
    if (n.nodeType !== 1) return;
    const tag = n.tagName;
    if (
      /^(SCRIPT|STYLE|SVG|IFRAME|FORM|NAV|FOOTER|HEADER|ASIDE|FIGCAPTION)$/.test(
        tag,
      )
    )
      return;
    if (tag === "IMG") {
      images++;
      if (images > 6) return;
      const src = safeLink(
        n.getAttribute("src") || n.getAttribute("data-src") || "",
        base,
      );
      if (src && !src.includes("article.invalid"))
        add({
          kind: "image",
          text: "",
          src,
          alt: plain(n.getAttribute("alt") || "Article image").slice(0, 500),
          included: false,
        });
      else
        warnings.push("An image without a supported public URL was omitted.");
      return;
    }
    if (tag === "TABLE") {
      const rows = Array.from(n.querySelectorAll("tr")).slice(0, 101) as any[];
      if (
        rows.length > 100 ||
        rows.some((r) => r.querySelectorAll("th,td").length > 8)
      )
        warnings.push(
          "A table was limited to 100 rows and eight columns. Compare omitted cells with the source.",
        );
      const cells = rows.slice(0, 100).map((r) =>
        Array.from(r.querySelectorAll("th,td"))
          .slice(0, 8)
          .map((c: any) => plain(inline(c))),
      );
      if (cells.length)
        add({
          kind: "table",
          text: "",
          cells,
          header: !!rows[0]?.querySelector("th"),
        });
      return;
    }
    if (/^(H[1-6]|P|LI|BLOCKQUOTE|PRE)$/.test(tag)) {
      let text =
        tag === "PRE" ? (n.textContent || "").trim() : plain(inline(n));
      if (tag === "LI") {
        const clone = n.cloneNode(true);
        clone.querySelectorAll("ul,ol").forEach((x) => x.remove());
        const start = Number(n.parentElement?.getAttribute("start") || 1),
          number = Number(
            n.getAttribute("value") ||
              Array.from(n.parentElement?.children || []).indexOf(n) + start,
          );
        text = `${n.parentElement?.tagName === "OL" ? number + "." : "•"} ${plain(inline(clone))}`;
      }
      if (text && !(tag === "H1" && text === title))
        add({
          kind: tag.startsWith("H")
            ? "heading"
            : tag === "LI"
              ? "list"
              : tag === "PRE"
                ? "code"
                : tag === "BLOCKQUOTE"
                  ? "quote"
                  : "paragraph",
          text,
          ...(tag.startsWith("H") ? { level: Number(tag[1]) } : {}),
        });
      n.querySelectorAll("img").forEach((x) => walk(x, depth + 1));
      if (tag === "LI")
        Array.from(n.children)
          .filter((x: any) => /^(UL|OL)$/.test(x.tagName))
          .forEach((x) => walk(x, depth + 1));
      return;
    }
    Array.from(n.childNodes || []).forEach((x) => walk(x, depth + 1));
  }
  walk(body);
  if (images > 6)
    warnings.push("Only the first six article images were retained.");
  if (links.length >= 80)
    warnings.push(
      "Up to 80 unique links were retained; further references may be omitted.",
    );
  if (limited)
    warnings.push(
      "Content was limited to 80,000 characters, 300 blocks, and 12,000 characters per text block. Further content is omitted.",
    );
  const joined = blocks.map((b) => b.text).join(" ");
  if (
    joined.length < 1500 &&
    /captcha|verify you are human|checking your browser|access denied|just a moment/i.test(
      joined + title,
    )
  )
    throw Error(
      "The source returned an access challenge. Paste content you have permission to use.",
    );
  if (!blocks.some((b) => b.kind !== "image" && (b.text || b.cells?.length)))
    throw Error(
      "No readable article text was found. Paste the article text instead.",
    );
  return {
    title,
    byline: byline || plain(parsed?.byline || "").slice(0, 300),
    published: published || plain(parsed?.publishedTime || "").slice(0, 100),
    source: safeLink(source),
    blocks,
    links,
    warnings: [...new Set(warnings)],
    method: parsed ? "Reader extraction" : "Fallback extraction",
    ...(brand ? { brand } : {}),
  };
}

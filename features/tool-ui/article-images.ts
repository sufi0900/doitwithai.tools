import { parseHTML } from "linkedom";
import type { ExtractedImageAsset } from "@/app/api/ai-tools/universal-extract/route";

function imageUrl(raw: string, base: string): string | null {
  try {
    let url = new URL(raw.trim(), base);
    // Next.js serves a resized preview; retain the original asset for exports.
    if (url.pathname.endsWith("/_next/image") && url.searchParams.get("url")) {
      url = new URL(url.searchParams.get("url")!, base);
    }
    if (!/^https?:$/.test(url.protocol) || url.username || url.password)
      return null;
    url.hash = "";
    if (
      /(?:^|[/_-])(?:spacer|transparent|tracking-pixel)(?:[._/-]|$)/i.test(
        url.pathname,
      )
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}

function largestSource(srcset: string): string {
  return (
    srcset
      .split(",")
      .map((entry) => {
        const [src, descriptor = "1x"] = entry.trim().split(/\s+/);
        return { src, size: parseFloat(descriptor) || 1 };
      })
      .sort((a, b) => b.size - a.size)[0]?.src || ""
  );
}

/** Keep every distinct discovered image, including lazy/responsive article media. */
export function extractArticleImages(
  document: Document,
  baseUrl: string,
  title: string,
): ExtractedImageAsset[] {
  const images: ExtractedImageAsset[] = [];
  const seen = new Set<string>();
  function add(
    raw: string,
    alt: string,
    width: number,
    height: number,
    role: ExtractedImageAsset["role"],
  ) {
    if (!raw) return;
    const src = imageUrl(raw, baseUrl);
    if (!src || seen.has(src)) return;
    seen.add(src);
    const extension = new URL(src).pathname.match(/\.([a-z0-9]+)$/i)?.[1];
    images.push({
      src,
      alt: alt.trim() || title,
      width,
      height,
      format: extension?.toUpperCase() || "IMAGE",
      role,
    });
  }
  document
    .querySelectorAll(
      'meta[property="og:image"], meta[property="og:image:secure_url"], meta[name="twitter:image"], meta[property="twitter:image"]',
    )
    .forEach((meta) => {
      add(
        meta.getAttribute("content") || "",
        `${title} — Social cover`,
        0,
        0,
        "Open Graph / Social",
      );
    });
  function addImage(img: Element) {
    const width = Number(img.getAttribute("width")) || 0;
    const height = Number(img.getAttribute("height")) || 0;
    if (width > 0 && height > 0 && width <= 2 && height <= 2) return;
    const picture =
      img.parentElement?.tagName.toLowerCase() === "picture"
        ? img.parentElement
        : null;
    const sources = [
      img.getAttribute("data-srcset"),
      img.getAttribute("srcset"),
      ...Array.from(picture?.querySelectorAll("source") || []).map(
        (source) =>
          source.getAttribute("data-srcset") || source.getAttribute("srcset"),
      ),
    ].filter(Boolean);
    const candidates = [
      ...sources.map((source) => largestSource(source!)),
      img.getAttribute("data-src"),
      img.getAttribute("data-lazy-src"),
      img.getAttribute("data-original"),
      img.getAttribute("data-lazy"),
      img.getAttribute("src"),
    ];
    const src = candidates
      .map((raw) => (raw ? imageUrl(raw, baseUrl) : null))
      .find(Boolean);
    if (!src) return;
    const alt = (img.getAttribute("alt") || title).replace(/\s+/g, " ");
    add(
      src,
      alt,
      width,
      height,
      /logo|icon|avatar/i.test(src + " " + alt)
        ? "Logo / Icon"
        : "Article Content",
    );
  }
  // Content comes before site chrome, without excluding images outside an article.
  const content =
    document.querySelector("article") || document.querySelector("main");
  content?.querySelectorAll("img").forEach(addImage);
  document.querySelectorAll("img").forEach(addImage);
  document.querySelectorAll("noscript").forEach((node) => {
    const { document: fallback } = parseHTML(
      node.textContent || node.innerHTML,
    );
    fallback.querySelectorAll("img").forEach(addImage);
  });
  return images;
}

import { Parser } from "htmlparser2";
import type { Block, PageSnapshot } from "../types";
const clean = (text: string) => text.replace(/\s+/g, " ").trim();
const BLOCK_TAG = /^(?:h[1-6]|p|li|blockquote|pre|td|th|dt|dd)$/;
export function absoluteUrl(value: string, base: string) {
  try {
    const url = new URL(value, base || undefined);
    return /^https?:$/.test(url.protocol) && !url.username && !url.password
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}
/** Streaming extraction retains bounded evidence, never script bundles or media payloads. */
export class PageCollector {
  page: PageSnapshot;
  private frames: {
    name: string;
    attrs: Record<string, string>;
    hidden: boolean;
    landmark: boolean;
    main: boolean;
    text: string;
  }[] = [];
  private blocks: (Block & { main: boolean })[] = [];
  private links: (PageSnapshot["links"][number] & { main: boolean })[] = [];
  private images: (PageSnapshot["images"][number] & { main: boolean })[] = [];
  private sequence = 0;
  private textSize = 0;
  private warnings = new Set<string>();
  private parser: Parser;
  constructor(url: string, source: PageSnapshot["source"] = "paste") {
    this.page = {
      url,
      source,
      checkedAt: new Date().toISOString(),
      status: null,
      title: "",
      titleCount: 0,
      description: "",
      descriptionCount: 0,
      canonical: "",
      canonicalCount: 0,
      robots: [],
      language: "",
      viewport: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      siteName: "",
      blocks: [],
      links: [],
      images: [],
      schemas: { types: [], valid: 0, invalid: 0, samples: [] },
      author: "",
      modified: "",
      scope: "page body",
      partial: false,
      warnings: [],
      bytesRead: 0,
      redirects: 0,
      resources: { robots: "unknown", robotsText: "", llms: "unknown" },
    };
    this.parser = new Parser(
      {
        onopentag: (name, attrs) => {
          const parent = this.frames[this.frames.length - 1];
          const hidden = Boolean(
            parent?.hidden ||
            attrs.hidden !== undefined ||
            attrs["aria-hidden"] === "true" ||
            /display:none|visibility:hidden/i.test(
              (attrs.style || "").replace(/\s/g, ""),
            ),
          );
          const landmark = Boolean(
            parent?.landmark || ["nav", "footer", "aside"].includes(name),
          );
          const main = Boolean(
            parent?.main ||
            name === "main" ||
            name === "article" ||
            attrs.role === "main",
          );
          const frame = { name, attrs, hidden, landmark, main, text: "" };
          if (this.frames.length >= 200)
            throw new Error(
              "This HTML is nested too deeply to analyze safely. Paste the main article section instead.",
            );
          this.frames.push(frame);
          if (name === "html")
            this.page.language = (attrs.lang || "").slice(0, 80);
          if (name === "meta") {
            const key = (attrs.name || attrs.property || "").toLowerCase(),
              content = (attrs.content || "").trim().slice(0, 3000);
            if (key === "description") {
              this.page.descriptionCount++;
              if (this.page.descriptionCount === 1)
                this.page.description = content;
            }
            if (["robots", "googlebot"].includes(key))
              this.page.robots.push(`${key}: ${content}`);
            const fields: Record<string, keyof PageSnapshot> = {
              viewport: "viewport",
              "og:title": "ogTitle",
              "og:description": "ogDescription",
              "og:site_name": "siteName",
              author: "author",
              "article:author": "author",
              "article:modified_time": "modified",
            };
            if (fields[key] && !this.page[fields[key]])
              (this.page as any)[fields[key]] = content;
            if (key === "og:image" && !this.page.ogImage)
              this.page.ogImage = absoluteUrl(content, url);
          }
          if (
            name === "link" &&
            /(?:^|\s)canonical(?:$|\s)/i.test(attrs.rel || "")
          ) {
            this.page.canonicalCount++;
            if (this.page.canonicalCount === 1)
              this.page.canonical = absoluteUrl(attrs.href || "", url);
          }
          if (name === "img" && !hidden && !landmark) {
            if (this.images.length < 300)
              this.images.push({
                src: absoluteUrl(attrs.src || attrs["data-src"] || "", url),
                alt: attrs.alt === undefined ? null : attrs.alt.slice(0, 1000),
                width: attrs.width || "",
                height: attrs.height || "",
                loading: attrs.loading || "",
                main,
              });
            else this.truncated();
          }
          if (name === "br") this.addText(" ");
        },
        ontext: (text) => this.addText(text),
        onclosetag: (name) => {
          const frame = this.frames.pop();
          if (!frame || frame.name !== name) return;
          const text = clean(frame.text);
          if (name === "title") {
            this.page.titleCount++;
            if (this.page.titleCount === 1)
              this.page.title = text.slice(0, 1000);
          }
          if (
            name === "script" &&
            (frame.attrs.type || "").toLowerCase() === "application/ld+json"
          ) {
            if (
              this.page.schemas.valid + this.page.schemas.invalid >= 40 ||
              frame.text.length >= 100000
            ) {
              this.truncated();
              return;
            }
            try {
              const parsed = JSON.parse(frame.text);
              this.page.schemas.valid++;
              if (
                this.page.schemas.samples.join("").length +
                  (this.page.schemas.invalidSamples || []).reduce(
                    (n, s) => n + s.raw.length,
                    0,
                  ) +
                  frame.text.length <=
                150000
              )
                this.page.schemas.samples.push(frame.text);
              const visit = (v: unknown, depth = 0) => {
                if (!v || typeof v !== "object" || depth > 20) return;
                if (Array.isArray(v)) {
                  v.slice(0, 100).forEach((x) => visit(x, depth + 1));
                  return;
                }
                const obj = v as Record<string, unknown>,
                  types = Array.isArray(obj["@type"])
                    ? obj["@type"]
                    : [obj["@type"]];
                for (const type of types)
                  if (
                    typeof type === "string" &&
                    !this.page.schemas.types.includes(type) &&
                    this.page.schemas.types.length < 80
                  )
                    this.page.schemas.types.push(type.slice(0, 100));
                Object.values(obj)
                  .slice(0, 100)
                  .forEach((x) => visit(x, depth + 1));
              };
              visit(parsed);
            } catch {
              this.page.schemas.invalid++;
              const used =
                this.page.schemas.samples.join("").length +
                (this.page.schemas.invalidSamples || []).reduce(
                  (n, s) => n + s.raw.length,
                  0,
                );
              if (used + frame.text.length <= 150000) {
                this.page.schemas.invalidSamples ||= [];
                this.page.schemas.invalidSamples.push({
                  raw: frame.text,
                  block: this.page.schemas.valid + this.page.schemas.invalid,
                });
              } else this.truncated();
            }
          }
          if (!frame.hidden && !frame.landmark) {
            if (BLOCK_TAG.test(name) && (text || /^h[1-6]$/.test(name))) {
              if (
                this.blocks.length < 1200 &&
                this.textSize + text.length <= 160000
              ) {
                this.blocks.push({
                  id: `block:${this.sequence++}`,
                  tag: name,
                  text,
                  main: frame.main,
                });
                this.textSize += text.length;
              } else this.truncated();
            }
            if (name === "a" && frame.attrs.href) {
              const href = absoluteUrl(frame.attrs.href, url);
              if (href && this.links.length < 1000)
                this.links.push({
                  href,
                  text: text.slice(0, 300),
                  rel: frame.attrs.rel || "",
                  main: frame.main,
                });
              else if (this.links.length >= 1000) this.truncated();
            }
          }
        },
      },
      { decodeEntities: true },
    );
  }
  private truncated() {
    this.page.partial = true;
    this.warnings.add(
      "Some content exceeded the evidence limits. Counts reflect the retained sample.",
    );
  }
  private addText(text: string) {
    if (this.frames.length > 200) return;
    const raw = this.frames.findLast
      ? this.frames.findLast((f) =>
          [
            "script",
            "style",
            "noscript",
            "template",
            "svg",
            "textarea",
          ].includes(f.name),
        )
      : [...this.frames]
          .reverse()
          .find((f) =>
            [
              "script",
              "style",
              "noscript",
              "template",
              "svg",
              "textarea",
            ].includes(f.name),
          );
    if (raw) {
      if (
        raw.name === "script" &&
        (raw.attrs.type || "").toLowerCase() === "application/ld+json"
      )
        raw.text += text.slice(0, Math.max(0, 100000 - raw.text.length));
      return;
    }
    // Assign text to its nearest content block. Nested list items remain independent.
    const block = [...this.frames]
      .reverse()
      .find((f) => BLOCK_TAG.test(f.name));
    const title = this.frames.find((f) => f.name === "title");
    const anchor = [...this.frames].reverse().find((f) => f.name === "a");
    for (const item of new Set([block, title, anchor]))
      if (item) {
        if (item.text.length + text.length > 12000 && item === block)
          this.truncated();
        item.text += text.slice(
          0,
          Math.max(0, (item === title ? 1000 : 12000) - item.text.length),
        );
      }
  }
  write(chunk: string) {
    this.parser.write(chunk);
  }
  finish() {
    this.parser.end();
    const main = this.blocks.some((b) => b.main);
    this.page.scope = main
      ? "main content"
      : "page body excluding navigation, footer, and sidebars";
    const strip = <T extends { main: boolean }>(items: T[]) =>
      items.filter((i) => !main || i.main).map(({ main: _, ...i }) => i);
    this.page.blocks = strip(this.blocks);
    this.page.links = strip(this.links);
    this.page.images = strip(this.images);
    this.page.warnings.push(...this.warnings);
    if (!this.page.blocks.length)
      this.page.warnings.push(
        "No structured text blocks were extracted. Content may require JavaScript or use unsupported markup.",
      );
    return this.page;
  }
}
export function extractHtml(html: string, url = "") {
  const collector = new PageCollector(url);
  collector.write(html);
  collector.page.bytesRead = new TextEncoder().encode(html).byteLength;
  return collector.finish();
}

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
    order: number;
    entity?: Record<string, unknown>;
    format?: "Microdata" | "RDFa";
  }[] = [];
  private blocks: (Block & { main: boolean; order: number })[] = [];
  private links: (PageSnapshot["links"][number] & { main: boolean })[] = [];
  private images: (PageSnapshot["images"][number] & { main: boolean })[] = [];
  private sequence = 0;
  private iconPriority = 0;
  private nestedMarkup = new WeakSet<object>();
  private markupProperties = 0;
  private markupSize = 0;
  private markupEntities: {
    value: Record<string, unknown>;
    format: "Microdata" | "RDFa";
  }[] = [];
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
            parent?.landmark ||
            ["nav", "footer", "aside"].includes(name) ||
            ["navigation", "contentinfo", "complementary"].includes(
              attrs.role || "",
            ) ||
            /(?:^|[\s_-])(?:byline|author-card|author-info|post-meta|entry-meta|toc|table-of-contents|tableofcontents|breadcrumbs?|share-buttons)(?:$|[\s_-])/i.test(
              `${attrs.class || ""} ${attrs.id || ""}`,
            ),
          );
          const main = Boolean(
            parent?.main ||
            name === "main" ||
            name === "article" ||
            attrs.role === "main",
          );
          const frame: PageCollector["frames"][number] = {
            name,
            attrs,
            hidden,
            landmark,
            main,
            text: "",
            order: this.sequence++,
          };
          const rawTypes =
            attrs.itemscope !== undefined ? attrs.itemtype : attrs.typeof;
          const rdfaSchema =
            attrs.vocab?.replace(/\/$/, "") === "https://schema.org" ||
            attrs.vocab?.replace(/\/$/, "") === "http://schema.org" ||
            this.frames.some((f) =>
              /schema\.org/.test(
                `${f.attrs.vocab || ""} ${f.attrs.prefix || ""}`,
              ),
            );
          if (
            rawTypes &&
            (attrs.itemscope !== undefined ||
              rdfaSchema ||
              /https?:\/\/schema\.org\//.test(rawTypes))
          ) {
            const types = rawTypes
              .split(/\s+/)
              .map((t) =>
                t
                  .replace(/^https?:\/\/schema\.org\//, "")
                  .replace(/^schema:/, ""),
              )
              .filter((t) => /^[A-Za-z][A-Za-z0-9]*$/.test(t));
            if (types.length && this.markupEntities.length < 200) {
              frame.entity = Object.create(null);
              frame.entity!["@context"] = "https://schema.org";
              frame.entity!["@type"] = types.length === 1 ? types[0] : types;
              const id = absoluteUrl(attrs.itemid || attrs.about || "", url);
              if ((attrs.itemid || attrs.about) && id)
                frame.entity!["@id"] = id;
              frame.format =
                attrs.itemscope !== undefined ? "Microdata" : "RDFa";
              this.markupEntities.push({
                value: frame.entity!,
                format: frame.format,
              });
            } else this.truncated();
          }
          if (attrs.itemref || attrs.inlist !== undefined) {
            this.page.schemas.markupWarnings ||= [];
            if (
              !this.page.schemas.markupWarnings.includes(
                "Advanced itemref and RDFa list relationships require a dedicated rendered inspection.",
              )
            )
              this.page.schemas.markupWarnings.push(
                "Advanced itemref and RDFa list relationships require a dedicated rendered inspection.",
              );
          }
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
              "twitter:title": "twitterTitle",
              "twitter:description": "twitterDescription",
              "twitter:card": "twitterCard",
              author: "author",
              "article:author": "author",
              "article:modified_time": "modified",
            };
            if (fields[key] && !this.page[fields[key]])
              (this.page as any)[fields[key]] = content;
            if (key === "og:image" && !this.page.ogImage)
              this.page.ogImage = absoluteUrl(content, url);
            if (
              ["twitter:image", "twitter:image:src"].includes(key) &&
              !this.page.twitterImage
            )
              this.page.twitterImage = absoluteUrl(content, url);
          }
          if (
            name === "link" &&
            /(?:^|\s)(?:icon|apple-touch-icon)(?:$|\s)/i.test(attrs.rel || "")
          ) {
            const priority = /(?:^|\s)icon(?:$|\s)/i.test(attrs.rel || "")
              ? 2
              : 1;
            const icon = absoluteUrl(attrs.href || "", url);
            if (icon && priority > this.iconPriority) {
              this.page.favicon = icon;
              this.iconPriority = priority;
            }
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
            const anchor = [...this.frames]
              .reverse()
              .find((f) => f.name === "a");
            if (anchor && attrs.alt)
              anchor.text += attrs.alt.slice(
                0,
                Math.max(0, 300 - anchor.text.length),
              );
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
          const property = frame.attrs.itemprop || frame.attrs.property;
          const owner = [...this.frames].reverse().find((f) => f.entity);
          if (
            property &&
            owner?.entity &&
            this.markupProperties < 1000 &&
            this.markupSize < 100000
          ) {
            if (frame.entity) this.nestedMarkup.add(frame.entity);
            let value: unknown =
              frame.entity ||
              frame.attrs.content ||
              frame.attrs.datetime ||
              text;
            const rawUrl =
              frame.attrs.href || frame.attrs.src || frame.attrs.resource;
            if (!frame.entity && rawUrl)
              value = absoluteUrl(rawUrl, this.page.url);
            for (const raw of property.split(/\s+/).slice(0, 10)) {
              const key = raw
                .replace(/^https?:\/\/schema\.org\//, "")
                .replace(/^schema:/, "");
              if (
                !/^[a-zA-Z][a-zA-Z0-9]*$/.test(key) ||
                ["constructor", "prototype"].includes(key)
              )
                continue;
              this.markupProperties++;
              this.markupSize += typeof value === "string" ? value.length : 10;
              if (this.markupProperties > 1000 || this.markupSize > 100000) {
                this.truncated();
                break;
              }
              const current = owner.entity[key];
              if (current === undefined) owner.entity[key] = value;
              else
                owner.entity[key] = Array.isArray(current)
                  ? [...current.slice(0, 99), value]
                  : [current, value];
            }
          }
          if (name === "title") {
            this.page.titleCount++;
            if (this.page.titleCount === 1)
              this.page.title = text.slice(0, 1000);
          }
          if (
            name === "script" &&
            (frame.attrs.type || "").split(";")[0].trim().toLowerCase() ===
              "application/ld+json"
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
              ) {
                this.page.schemas.samples.push(frame.text);
                this.page.schemas.sampleFormats ||= [];
                this.page.schemas.sampleFormats.push("JSON-LD");
              }
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
                  id: `block:${frame.order}`,
                  order: frame.order,
                  tag: name,
                  listItem:
                    name === "li"
                      ? frame.order
                      : [...this.frames].reverse().find((f) => f.name === "li")
                          ?.order,
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
        (raw.attrs.type || "").split(";")[0].trim().toLowerCase() ===
          "application/ld+json"
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
    for (const item of new Set([
      block,
      title,
      anchor,
      ...this.frames.filter((f) => f.attrs.itemprop || f.attrs.property),
    ]))
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
    this.page.blocks = strip(this.blocks.sort((a, b) => a.order - b.order)).map(
      ({ order: _, ...block }) => block,
    );
    // Normalize bounded embedded markup for the shared inspector. JavaScript is never executed.
    for (const format of ["Microdata", "RDFa"] as const) {
      const entities = this.markupEntities.filter((e) => e.format === format);
      if (!entities.length) continue;
      const raw = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": entities
          .filter((e) => !this.nestedMarkup.has(e.value))
          .map((e) => e.value),
      });
      const used =
        this.page.schemas.samples.reduce((n, s) => n + s.length, 0) +
        (this.page.schemas.invalidSamples || []).reduce(
          (n, s) => n + s.raw.length,
          0,
        );
      if (
        used + raw.length > 150000 ||
        this.page.schemas.samples.length >= 40
      ) {
        this.truncated();
        continue;
      }
      this.page.schemas.samples.push(raw);
      this.page.schemas.sampleFormats ||= [];
      this.page.schemas.sampleFormats.push(format);
      for (const e of entities)
        for (const type of [e.value["@type"]].flat())
          if (
            typeof type === "string" &&
            !this.page.schemas.types.includes(type)
          )
            this.page.schemas.types.push(type);
    }
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

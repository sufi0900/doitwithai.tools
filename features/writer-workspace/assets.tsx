"use client";
import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import JSZip from "jszip";
import { serializeBlogProjectToJson } from "@/lib/blog-writer/project-storage-db";
import {
  buildInfographicScene,
  generateBlogInfographicSvg,
} from "@/lib/blog-infographic-studio/canvas-renderer";
import { buildSocialInfographicConfigFromProject } from "@/lib/studio/social-infographic-bridge";
import {
  buildNewsletter,
  newsletterHtml,
  buildVideoScript,
  videoScriptTxt,
  buildLinkedinCarousel,
  buildRasterCarouselPdf,
  articleToEpub,
} from "@/features/article-conversion/formats";
import { articlePdf, loadFonts } from "@/features/article-conversion/pdf";
import { articleDocx, docxMime } from "@/features/article-conversion/docx";
import { prepareVisualSvg } from "@/features/tool-ui/svgExport";
import { defaults } from "@/features/article-conversion/model";
import { SOCIAL_VISUAL_REGISTRY } from "./adapters/socialVisualRegistry";
import type { Project, SocialOverride, RichNode } from "./types";
import {
  buildArticleSchemaJsonLd,
  projectDocument,
  articleModel,
  articleMarkdown,
  articleRevision,
  workspace,
  escapeHtml,
  safeUrl,
  safeImageSrc,
  textOf,
  bodyOf,
  hash,
} from "./model";
export const CHANNELS = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "X",
  "Pinterest",
  "Threads",
  "Reddit",
  "Quora",
  "YouTube",
] as const;
export type Channel = (typeof CHANNELS)[number];
export const sizes: Record<Channel, [number, number]> = {
  Facebook: [SOCIAL_VISUAL_REGISTRY.Facebook.width, SOCIAL_VISUAL_REGISTRY.Facebook.height],
  Instagram: [SOCIAL_VISUAL_REGISTRY.Instagram.width, SOCIAL_VISUAL_REGISTRY.Instagram.height],
  LinkedIn: [SOCIAL_VISUAL_REGISTRY.LinkedIn.width, SOCIAL_VISUAL_REGISTRY.LinkedIn.height],
  X: [SOCIAL_VISUAL_REGISTRY.X.width, SOCIAL_VISUAL_REGISTRY.X.height],
  Pinterest: [SOCIAL_VISUAL_REGISTRY.Pinterest.width, SOCIAL_VISUAL_REGISTRY.Pinterest.height],
  Threads: [SOCIAL_VISUAL_REGISTRY.Threads.width, SOCIAL_VISUAL_REGISTRY.Threads.height],
  Reddit: [SOCIAL_VISUAL_REGISTRY.Reddit.width, SOCIAL_VISUAL_REGISTRY.Reddit.height],
  Quora: [SOCIAL_VISUAL_REGISTRY.Quora.width, SOCIAL_VISUAL_REGISTRY.Quora.height],
  YouTube: [SOCIAL_VISUAL_REGISTRY.YouTube.width, SOCIAL_VISUAL_REGISTRY.YouTube.height],
};
const plain = (s: string) =>
  s
    .replace(/\*\*|__|`|#{1,6}\s*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
export const short = (s: string, n: number) =>
  s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…";
/** Source-derived excerpts, with no canned claims about teams, rankings or results. */
export function storyExcerpts(p: Project) {
  const a = articleModel(p),
    prose = a.blocks
      .filter(
        (b) =>
          b.kind === "paragraph" || b.kind === "quote" || b.kind === "list",
      )
      .map((b) => plain(b.text))
      .filter(Boolean);
  const lead = plain(p.metaPack.aeoDirectAnswer50Words) || prose[0] || a.title;
  const points = p.sections
    .filter(
      (s) =>
        s.bodyMarkdown.trim() ||
        s.subHeadings.some((h) => h.bodyMarkdown.trim()),
    )
    .map((s) => ({
      heading: s.h2Text,
      text: plain(
        s.subHeadings.find((h) => h.bodyMarkdown.trim())?.bodyMarkdown ||
          s.bodyMarkdown,
      ),
    }))
    .filter((s) => s.text);
  return { a, lead, points };
}
function ensureValidConversionArticle(
  a: ReturnType<typeof articleModel>,
  p: Project,
) {
  const safeTitle =
    a.title.trim() ||
    p.metaPack?.h1Title?.trim() ||
    p.metaPack?.metaTitle?.trim() ||
    p.projectTitle?.trim() ||
    p.keywordCluster?.primaryKeyword?.trim() ||
    "Untitled Article";
  const hasText = a.blocks.some(
    (b) =>
      b.kind !== "image" &&
      (b.text.trim() || b.cells?.some((r) => r.some((c) => c.trim()))),
  );
  const fallbackBody =
    plain(p.metaPack?.aeoDirectAnswer50Words || "") ||
    plain(p.metaPack?.metaDescription || "") ||
    plain(p.rawUserBriefOrSourceText || "") ||
    `Key takeaways and implementation guide for ${safeTitle}.`;
  const normalizedBlocks = (
    hasText
      ? a.blocks
      : [
          ...a.blocks,
          { id: "fallback-intro", kind: "paragraph" as const, text: fallbackBody },
        ]
  )
    .slice(0, 280)
    .map((b) =>
      b.text.length > 11000 ? { ...b, text: b.text.slice(0, 11000) } : b,
    );
  return {
    ...a,
    title: safeTitle.slice(0, 280),
    byline: a.byline.slice(0, 280),
    published: a.published.slice(0, 90),
    blocks: normalizedBlocks,
  };
}
export function socialDrafts(p: Project) {
  const { a, lead, points } = storyExcerpts(p),
    revision = articleRevision(p);
  if (!a.blocks.some((b) => b.kind !== "heading" && b.text.trim())) return [];
  const link = a.source ? `\n\nRead the full article: ${a.source}` : "";
  const summary =
    [
      a.title,
      short(lead, 500),
      ...points.slice(0, 3).map((s) => `• ${s.heading}: ${short(s.text, 190)}`),
    ]
      .filter(Boolean)
      .join("\n\n") + link;
  const takeaways =
    [
      a.title,
      ...points
        .slice(0, 5)
        .map((s, i) => `${i + 1}. ${s.heading}\n${short(s.text, 240)}`),
    ].join("\n\n") + link;
  const discussion =
    [
      a.title,
      short(lead, 600),
      "Which part would you approach differently?",
    ].join("\n\n") + link;
  return CHANNELS.map((channel) => {
    const w = workspace(p);
    const selected = w.social[channel] || {},
      video = (mode: "shorts" | "youtube") =>
        videoScriptTxt(
          a,
          buildVideoScript(
            a,
            mode,
            140,
            1,
            a.source
              ? `Read the full article: ${a.source}`
              : "Thanks for watching.",
          ),
        );
    const variants =
      channel === "YouTube"
        ? [
            ...(w.videoScripts?.shortForm
              ? [{ label: "AI Short script", content: w.videoScripts.shortForm }]
              : []),
            { label: "Short video", content: video("shorts") },
            ...(w.videoScripts?.youtubeLong
              ? [{ label: "AI Long outline", content: w.videoScripts.youtubeLong }]
              : []),
            { label: "Long-form script", content: video("youtube") },
          ]
        : channel === "X"
          ? [
              {
                label: "Thread",
                content: [
                  short(a.title, 220),
                  short(lead, 240),
                  ...points.map((s) => short(`${s.heading}: ${s.text}`, 240)),
                  ...(a.source ? [a.source] : []),
                ]
                  .map((t, i, all) => `${i + 1}/${all.length} ${t}`)
                  .join("\n\n"),
              },
              {
                label: "Single post",
                content:
                  short(`${a.title}\n\n${lead}`, a.source ? 230 : 275) +
                  (a.source ? `\n${a.source}` : ""),
              },
            ]
          : [
              { label: "Article summary", content: summary },
              { label: "Key takeaways", content: takeaways },
              { label: "Discussion", content: discussion },
            ];
    const defaultHeadline =
      channel === "YouTube" && w.videoScripts?.thumbnailHeadline
        ? short(w.videoScripts.thumbnailHeadline, 90)
        : short(a.title, 100);
    return {
      channel,
      revision,
      caption: selected.caption ?? variants[0].content,
      headline: selected.headline ?? defaultHeadline,
      body: selected.body ?? short(lead, 240),
      variants,
      settings: selected,
      stale: Boolean(
        selected.sourceRevision && selected.sourceRevision !== revision,
      ),
    };
  });
}
export function SocialPoster({
  p,
  channel,
  headline,
  body,
  settings = {},
  width,
  height,
}: {
  p: Project;
  channel: Channel | string;
  headline: string;
  body: string;
  settings?: SocialOverride;
  width: number;
  height: number;
}) {
  const isPortrait = height > width;
  const templateId =
    settings.variant === "framework-steps"
      ? isPortrait
        ? 2
        : 1
      : settings.variant === "quote-card"
        ? isPortrait
          ? 12
          : 11
        : isPortrait
          ? 21
          : 25;
  const paletteId = settings.theme === "paper" ? "blue-trust" : "indigo-cyber";
  const config = buildSocialInfographicConfigFromProject(p, {
    channel: String(channel),
    templateId,
    paletteId,
    customHeadline: headline,
    customSubheadline: body,
  });
  const scene = buildInfographicScene(config);
  const viewBoxMatch = scene.svg.match(/viewBox="([^"]+)"/i);
  const viewBox = viewBoxMatch?.[1] || `0 0 ${width} ${height}`;
  const innerSvg = scene.svg
    .replace(/^<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "");

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={width}
      height={height}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`${channel}: ${headline}`}
      dangerouslySetInnerHTML={{ __html: innerSvg }}
    />
  );
}
export async function posterSvg(
  p: Project,
  channel: Channel | string,
  headline: string,
  body: string,
  settings: SocialOverride = {},
  dimensions?: [number, number],
) {
  const [width, height] = dimensions ||
    sizes[channel as Channel] || [1080, 1350];
  const holder = document.createElement("div");
  holder.style.cssText =
    "position:fixed;left:-10000px;top:0;pointer-events:none";
  holder.setAttribute("aria-hidden", "true");
  document.body.appendChild(holder);
  const root = createRoot(holder);
  try {
    flushSync(() =>
      root.render(
        <SocialPoster
          p={p}
          channel={channel}
          headline={headline}
          body={body}
          settings={settings}
          width={width}
          height={height}
        />,
      ),
    );
    const svg = holder.querySelector("svg");
    if (!svg) throw new Error("The image renderer did not create a preview.");
    return await prepareVisualSvg(svg, width, height);
  } finally {
    root.unmount();
    holder.remove();
  }
}
export async function svgRaster(
  svg: string,
  format: "png" | "jpeg" | "webp" = "png",
) {
  const m = svg.match(/<svg[^>]*\bwidth="(\d+)"[^>]*\bheight="(\d+)"/);
  const width = Number(m?.[1] || 1080),
    height = Number(m?.[2] || 1350);
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Image decoding timed out.")),
      12000,
    );
    image.onload = () => {
      clearTimeout(timeout);
      resolve();
    };
    image.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Image rendering failed. Try SVG export."));
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");
  if (format === "jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(image, 0, 0);
  return canvas.toDataURL(`image/${format}`, 0.9);
}
export function saveBlob(
  data: BlobPart | Blob | Uint8Array,
  name: string,
  type = "text/plain;charset=utf-8",
) {
  const blob =
    data instanceof Blob
      ? data
      : new Blob(
          [data instanceof Uint8Array ? Uint8Array.from(data).buffer : data],
          { type },
        );
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
const uriBytes = (uri: string) => {
  const raw = atob(uri.split(",")[1]);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};
function dataImageMeta(src: string): { mime: string; ext: string; bytes: Uint8Array } | null {
  const m = /^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,([A-Za-z0-9+/=]+)$/i.exec(
    src.trim(),
  );
  if (!m) return null;
  const rawMime = m[1].toLowerCase() === "image/jpg" ? "image/jpeg" : m[1].toLowerCase();
  const ext = rawMime === "image/jpeg" ? "jpg" : rawMime.split("/")[1] || "png";
  return { mime: rawMime, ext, bytes: uriBytes(src) };
}
export function htmlArticle(p: Project) {
  const w = workspace(p);
  const render = (n: RichNode): string => {
    if (n.type === "text")
      return (n.marks || []).reduce(
        (s, m) =>
          m.type === "bold"
            ? `<strong>${s}</strong>`
            : m.type === "italic"
              ? `<em>${s}</em>`
              : m.type === "code"
                ? `<code>${s}</code>`
                : m.type === "link" && safeUrl(m.attrs?.href)
                  ? `<a href="${escapeHtml(safeUrl(m.attrs?.href))}">${s}</a>`
                  : s,
        escapeHtml(n.text || ""),
      );
    if (n.type === "sectionVisual") {
      const s = p.sections.find((sec) => sec.id === n.attrs?.sectionId);
      if (!s) return "";
      const override = w.sectionVisualOverrides?.[s.id];
      const overrideSrc = override?.dataUrl ? safeImageSrc(override.dataUrl) : "";
      if (overrideSrc) {
        const alt =
          override?.altText ||
          w.sectionAltTexts?.[s.id]?.altText ||
          s.infographicConfig.altText ||
          s.h2Text;
        return `<figure><img alt="${escapeHtml(alt)}" src="${escapeHtml(overrideSrc)}" />${override?.caption ? `<figcaption>${escapeHtml(override.caption)}</figcaption>` : ""}</figure>`;
      }
      try {
        const svg = generateBlogInfographicSvg(s.infographicConfig),
          v = svg.match(/<svg[^>]*width="(\d+)"[^>]*height="(\d+)"/);
        return `<figure><img width="${v?.[1]}" height="${v?.[2]}" alt="${escapeHtml(s.infographicConfig.altText)}" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}" /></figure>`;
      } catch {
        return `<p>Image needs review: ${escapeHtml(s.h2Text)}</p>`;
      }
    }
    if (n.type === "articleImage") {
      const imageId = String(n.attrs?.imageId || "");
      const stored = imageId ? w.customImages?.[imageId] : undefined;
      const src = stored?.src || safeImageSrc(n.attrs?.src);
      if (!src) return "";
      const alt = stored?.alt || String(n.attrs?.alt || "Article image");
      const caption = stored?.caption || String(n.attrs?.caption || "");
      return `<figure><img alt="${escapeHtml(alt)}" src="${escapeHtml(src)}" />${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}</figure>`;
    }
    const tags: Record<string, string> = {
      doc: "article",
      paragraph: "p",
      bulletList: "ul",
      orderedList: "ol",
      listItem: "li",
      blockquote: "blockquote",
      codeBlock: "pre",
      table: "table",
      tableRow: "tr",
      tableHeader: "th",
      tableCell: "td",
    };
    if (n.type === "hardBreak") return "<br>";
    const tag =
      n.type === "heading"
        ? `h${Math.min(6, Math.max(1, Number(n.attrs?.level) || 2))}`
        : tags[n.type];
    return tag
      ? `<${tag}>${(n.content || []).map(render).join("")}</${tag}>`
      : escapeHtml(textOf(n));
  };
  const body = render(projectDocument(p));
  const quizList = w.quizQuestions || [];
  const focusLabel =
    p.keywordCluster?.primaryKeyword ||
    p.metaPack?.h1Title ||
    p.projectTitle ||
    "Key Concepts";
  const quizHtml = quizList.length
    ? `<section aria-label="Reader Comprehension Quiz" data-dwell-widget="comprehension-quiz"><h2>Quick Knowledge Check: ${escapeHtml(focusLabel)}</h2>${quizList.map((q, idx) => `<div class="quiz-card"><p><strong>Q${idx + 1}. ${escapeHtml(q.question)}</strong></p><ol>${q.options.map((opt, optIdx) => `<li data-correct="${optIdx === q.correctIndex ? "true" : "false"}">${escapeHtml(opt)}</li>`).join("")}</ol><p><em>Why:</em> ${escapeHtml(q.explanation)}</p></div>`).join("")}</section>`
    : "";
  const combinedSchema = buildArticleSchemaJsonLd(p).combinedGraph;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(p.metaPack.metaTitle || p.metaPack.h1Title)}</title><meta name="description" content="${escapeHtml(p.metaPack.metaDescription)}"><meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">${safeUrl(p.metaPack.canonicalUrl) ? `<link rel="canonical" href="${escapeHtml(safeUrl(p.metaPack.canonicalUrl))}">` : ""}<script type="application/ld+json">${JSON.stringify(combinedSchema).replace(/</g, "\\u003c")}</script><style>body{max-width:800px;margin:40px auto;padding:0 24px;color:#18223b;font:17px/1.75 Arial}img{max-width:100%;height:auto}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccd4e4;padding:10px}pre{white-space:pre-wrap}figure{margin:32px 0}</style></head><body>${body}${quizHtml}</body></html>`;
}
async function imageResources(p: Project) {
  const w = workspace(p);
  const article = articleModel(p);
  const images: Record<string, string> = {};
  for (const b of article.blocks) {
    if (b.kind !== "image" || b.included === false) continue;
    try {
      if (b.src?.startsWith("writer-override:")) {
        const sectionId = b.src.slice("writer-override:".length);
        const overrideSrc = safeImageSrc(w.sectionVisualOverrides?.[sectionId]?.dataUrl);
        if (overrideSrc) images[b.id] = overrideSrc;
      } else if (b.src?.startsWith("writer-visual:")) {
        const sectionId = b.src.slice("writer-visual:".length);
        const s = p.sections.find((sec) => sec.id === sectionId);
        if (s) {
          images[b.id] = await svgRaster(
            generateBlogInfographicSvg(s.infographicConfig),
          );
        }
      } else if (b.src?.startsWith("writer-image:")) {
        const imageId = b.src.slice("writer-image:".length);
        const customSrc = safeImageSrc(w.customImages?.[imageId]?.src);
        if (customSrc) images[b.id] = customSrc;
      } else if (b.src && safeImageSrc(b.src)) {
        images[b.id] = b.src;
      }
    } catch {}
  }
  return images;
}
export async function pdfBytes(p: Project) {
  const [fonts, images] = await Promise.all([loadFonts(), imageResources(p)]);
  return articlePdf(articleModel(p), defaults, { ...fonts, images });
}
export async function docxBytes(p: Project) {
  return articleDocx(articleModel(p), defaults, {
    images: await imageResources(p),
    maxImages: 10,
  });
}
/** Extend the shared EPUB package with the same section images and anchor IDs as the editor model. */
export async function epubBytes(p: Project) {
  const a = articleModel(p),
    base = articleToEpub(a),
    zip = await JSZip.loadAsync(base.epubBytes),
    images: string[] = [],
    warnings: string[] = [];
  const content = a.blocks
    .map((b, index) => {
      const text = escapeHtml(b.text);
      if (b.kind === "heading") {
        const level = Math.min(6, Math.max(2, b.level || 2));
        return `<h${level} id="sec-${index + 1}">${text}</h${level}>`;
      }
      if (b.kind === "image" && b.included) {
        const w = workspace(p);
        try {
          if (b.src?.startsWith("writer-override:") || b.src?.startsWith("writer-image:") || b.src?.startsWith("data:")) {
            const rawSrc = b.src.startsWith("writer-override:")
              ? w.sectionVisualOverrides?.[b.src.slice("writer-override:".length)]?.dataUrl
              : b.src.startsWith("writer-image:")
                ? w.customImages?.[b.src.slice("writer-image:".length)]?.src
                : b.src;
            const meta = rawSrc ? dataImageMeta(rawSrc) : null;
            if (meta) {
              const file = `images/image-${index + 1}.${meta.ext}`;
              zip.file(`OEBPS/${file}`, meta.bytes);
              images.push(
                `<item id="image-${index + 1}" href="${file}" media-type="${meta.mime}"/>`,
              );
              return `<figure><img src="${file}" alt="${escapeHtml(b.alt || "Article image")}" style="max-width:100%;height:auto"/></figure>`;
            }
            const safeRemote = rawSrc ? safeImageSrc(rawSrc) : "";
            if (safeRemote && /^https?:\/\//i.test(safeRemote)) {
              warnings.push(`External image kept as URL in EPUB: ${b.alt || b.id}`);
              return `<figure><img src="${escapeHtml(safeRemote)}" alt="${escapeHtml(b.alt || "Article image")}" style="max-width:100%;height:auto"/></figure>`;
            }
            return "";
          }
          const sectionId = b.src?.startsWith("writer-visual:")
            ? b.src.slice("writer-visual:".length)
            : b.id.replace(/^visual-/, "");
          const section = p.sections.find((s) => s.id === sectionId);
          if (!section) return "";
          const file = `images/section-${index + 1}.svg`;
          zip.file(
            `OEBPS/${file}`,
            generateBlogInfographicSvg(section.infographicConfig),
          );
          images.push(
            `<item id="image-${index + 1}" href="${file}" media-type="image/svg+xml"/>`,
          );
          return `<figure><img src="${file}" alt="${escapeHtml(b.alt || "Section infographic")}" style="max-width:100%;height:auto"/></figure>`;
        } catch {
          warnings.push(`EPUB image needs review: ${b.alt || b.id}`);
          return "";
        }
      }
      if (b.kind === "table")
        return `<table><tbody>${b.cells?.map((r, i) => `<tr>${r.map((c) => `<${i === 0 && b.header ? "th" : "td"}>${escapeHtml(c)}</${i === 0 && b.header ? "th" : "td"}>`).join("")}</tr>`).join("") || ""}</tbody></table>`;
      if (b.kind === "list")
        return `<ul>${b.text
          .split("\n")
          .map((t) => `<li>${escapeHtml(t)}</li>`)
          .join("")}</ul>`;
      return b.kind === "quote"
        ? `<blockquote>${text}</blockquote>`
        : b.kind === "code"
          ? `<pre><code>${text}</code></pre>`
          : `<p>${text.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");
  const refs = a.links
    .filter((l) => safeUrl(l.url))
    .map(
      (l) =>
        `<li><a href="${escapeHtml(safeUrl(l.url))}">${escapeHtml(l.label)}</a></li>`,
    )
    .join("");
  const xhtml = base.xhtml.replace(
    /<body>[\s\S]*<\/body>/,
    () =>
      `<body><h1 id="top">${escapeHtml(a.title)}</h1>${a.byline ? `<p>${escapeHtml(a.byline)}</p>` : ""}${content}${refs ? `<h2 id="references">References</h2><ul>${refs}</ul>` : ""}</body>`,
  );
  zip.file("OEBPS/article.xhtml", xhtml);
  let opf = await zip.file("OEBPS/content.opf")!.async("string");
  opf = opf.replace("</manifest>", images.join("") + "</manifest>");
  if (images.length)
    opf = opf.replace(
      'id="article" href="article.xhtml" media-type="application/xhtml+xml"',
      'id="article" href="article.xhtml" media-type="application/xhtml+xml" properties="svg"',
    );
  zip.file("OEBPS/content.opf", opf);
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  return {
    bytes: await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
    }),
    warnings,
  };
}
export async function downloadArticle(p: Project, format: string) {
  const stem = p.metaPack.urlSlug || "article";
  if (format === "pdf") {
    const out = await pdfBytes(p);
    saveBlob(out.bytes, `${stem}.pdf`, "application/pdf");
    return out.warnings;
  }
  if (format === "docx") {
    const out = await docxBytes(p);
    saveBlob(out.bytes, `${stem}.docx`, docxMime);
    return out.warnings;
  }
  if (format === "epub") {
    const out = await epubBytes(p);
    saveBlob(out.bytes, `${stem}.epub`, "application/epub+zip");
    return out.warnings;
  }
  saveBlob(
    format === "html" ? htmlArticle(p) : articleMarkdown(p),
    `${stem}.${format === "markdown" ? "md" : format}`,
    format === "html" ? "text/html;charset=utf-8" : "text/plain;charset=utf-8",
  );
  return [];
}
export function newsletter(p: Project) {
  const { a, lead, points } = storyExcerpts(p),
    safeA = ensureValidConversionArticle(a, p),
    custom = workspace(p).email;
  let base: ReturnType<typeof buildNewsletter>;
  try {
    base = buildNewsletter(safeA);
  } catch {
    base = {
      style: "executive",
      subjectOptions: [
        safeA.title,
        `Key takeaways: ${safeA.title}`,
        `A closer look at ${safeA.title}`,
      ],
      selectedSubject: safeA.title,
      preheader: short(lead || safeA.title, 140),
      greeting: "Hello,",
      intro: lead || safeA.title,
      whyItMatters: "",
      takeaways: points.slice(0, 4).map((s) => s.heading),
      sections: points.slice(0, 6).map((s) => ({
        heading: s.heading,
        summary: short(s.text, 500),
        actionItem: "",
      })),
      checklist: [],
      ctaLabel: "Read the full article",
      ctaUrl: safeA.source,
    };
  }
  const subjects = [
    safeA.title,
    `${points.length || 1} takeaways: ${safeA.title}`,
    `A closer look at ${safeA.title}`,
  ];
  const draft = {
    ...base,
    subjectOptions: subjects,
    selectedSubject: subjects[0],
    preheader: short(lead || safeA.title, 140),
    intro: lead || safeA.title,
    whyItMatters: "",
    takeaways: points.slice(0, 4).map((s) => s.heading),
    sections: points.slice(0, 6).map((s) => ({
      heading: s.heading,
      summary: short(s.text, 500),
      actionItem: "",
    })),
    checklist: [],
    ctaLabel: "Read the full article",
    ctaUrl: safeA.source,
  };
  let fallbackHtml = `<!doctype html><html><body><h1>${escapeHtml(draft.selectedSubject)}</h1><p>${escapeHtml(draft.intro)}</p></body></html>`;
  if (!custom) {
    try {
      fallbackHtml = newsletterHtml(safeA, draft);
    } catch {
      fallbackHtml = `<!doctype html><html><body><h1>${escapeHtml(draft.selectedSubject)}</h1><p>${escapeHtml(draft.intro)}</p></body></html>`;
    }
  }
  return {
    draft,
    text: custom
      ? `Subject: ${custom.subject}\n\n${custom.body}`
      : [
          `Subject: ${draft.selectedSubject}`,
          "",
          "Hello,",
          "",
          lead || safeA.title,
          ...points
            .slice(0, 6)
            .flatMap((s) => ["", s.heading, short(s.text, 500)]),
          ...(safeA.source ? ["", "Read the full article: " + safeA.source] : []),
        ].join("\n"),
    html: custom
      ? `<!doctype html><html><body><h1>${escapeHtml(custom.subject)}</h1>${custom.body
          .split(/\n\s*\n/)
          .map((t) => `<p>${escapeHtml(t).replace(/\n/g, "<br>")}</p>`)
          .join("")}</body></html>`
      : fallbackHtml,
  };
}
export function carouselSlides(p: Project) {
  const { a, lead, points } = storyExcerpts(p),
    safeA = ensureValidConversionArticle(a, p);
  let base: ReturnType<typeof buildLinkedinCarousel>;
  try {
    base = buildLinkedinCarousel(safeA);
  } catch {
    base = [
      {
        number: 1,
        kind: "cover",
        kicker: "GUIDE",
        headline: safeA.title,
        highlightPhrase: safeA.title,
        body: short(lead || safeA.title, 240),
        cardLeftTitle: "OVERVIEW",
        cardLeftBody: short(lead || safeA.title, 120),
        cardRightTitle: "KEY FOCUS",
        cardRightBody: short(points[0]?.text || safeA.title, 120),
        footer: safeA.source || "",
      },
    ];
  }
  const slides = [
    {
      ...base[0],
      number: 1,
      kind: "cover",
      headline: safeA.title,
      body: short(lead || safeA.title, 240),
    },
    ...points.slice(0, 7).map((s, i) => ({
      ...base[Math.min(i + 1, base.length - 1)],
      number: i + 2,
      kind: "point",
      headline: s.heading,
      body: short(s.text, 240),
    })),
  ];
  return slides;
}
export async function carousel(p: Project) {
  const slides = carouselSlides(p);
  const pages = [];
  for (const s of slides) {
    const svg = await posterSvg(
      p,
      `Slide ${s.number}`,
      short(s.headline, 100),
      short(s.body || s.cardLeftBody || s.footer, 240),
      { variant: s.kind === "cover" ? "executive-minimal" : "framework-steps" },
      [1080, 1350],
    );
    const uri = await svgRaster(svg, "jpeg");
    pages.push({ bytes: uriBytes(uri), width: 1080, height: 1350 });
  }
  return { slides, pdf: buildRasterCarouselPdf(pages) };
}
export async function narration(
  p: Project,
  signal: AbortSignal,
  onProgress: (value: string) => void,
) {
  const raw = articleModel(p)
    .blocks.filter((b) => b.kind !== "image")
    .map((b) => b.text || b.cells?.flat().join(" ") || "")
    .join("\n\n");
  const chunks: string[] = [];
  let current = "";
  for (const word of raw.match(/[^\s]{1,3900}/gu) || []) {
    if (current.length + word.length + 1 > 4000) {
      chunks.push(current);
      current = "";
    }
    current += (current ? " " : "") + word;
  }
  if (current) chunks.push(current);
  if (chunks.length > 12)
    throw new Error(
      "Narration supports up to twelve chapters. Shorten the article or narrate it in the read-aloud tool.",
    );
  const files: Blob[] = [];
  for (let i = 0; i < chunks.length; i++) {
    signal.throwIfAborted();
    onProgress(`Narrating chapter ${i + 1} of ${chunks.length}`);
    const res = await fetch("/api/ai-tools/article-speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: chunks[i],
        voice: "gmw/en-US-male",
        rate: 160,
      }),
      signal,
    });
    if (!res.ok || !res.headers.get("Content-Type")?.includes("audio/"))
      throw new Error(
        `Narration failed at chapter ${i + 1}. Retry when the speech service is available.`,
      );
    files.push(await res.blob());
  }
  return { files, revision: articleRevision(p) };
}
export async function downloadBundle(
  p: Project,
  onProgress: (s: string) => void,
  audio?: { files: Blob[]; revision: string },
) {
  const zip = new JSZip(),
    manifest: { revision: string; included: string[]; warnings: string[] } = {
      revision: articleRevision(p),
      included: [],
      warnings: [],
    };
  const add = (path: string, data: any) => {
    zip.file(path, data);
    manifest.included.push(path);
  };
  add(
    "seo/metadata.json",
    JSON.stringify(
      {
        title: p.metaPack.metaTitle,
        description: p.metaPack.metaDescription,
        slug: p.metaPack.urlSlug,
        canonical: safeUrl(p.metaPack.canonicalUrl),
      },
      null,
      2,
    ),
  );
  add("article/article.html", htmlArticle(p));
  add("article/article.md", articleMarkdown(p));
  add("project.json", serializeBlogProjectToJson(p));
  try {
    onProgress("Preparing PDF");
    const out = await pdfBytes(p);
    add("article/article.pdf", out.bytes);
    manifest.warnings.push(...out.warnings);
  } catch (e) {
    manifest.warnings.push(
      `PDF: ${e instanceof Error ? e.message : "unavailable"}`,
    );
  }
  try {
    const out = await docxBytes(p);
    add("article/article.docx", out.bytes);
    manifest.warnings.push(...out.warnings);
  } catch {
    manifest.warnings.push("DOCX could not be prepared.");
  }
  try {
    const out = await epubBytes(p);
    add("article/article.epub", out.bytes);
    manifest.warnings.push(...out.warnings);
  } catch {
    manifest.warnings.push("EPUB could not be prepared.");
  }
  const w = workspace(p);
  for (let i = 0; i < p.sections.length; i++) {
    const s = p.sections[i];
    const override = w.sectionVisualOverrides?.[s.id];
    const overrideMeta = override?.dataUrl ? dataImageMeta(override.dataUrl) : null;
    if (overrideMeta) {
      onProgress(`Preparing uploaded section image ${i + 1}`);
      add(`visuals/section-${i + 1}.${overrideMeta.ext}`, overrideMeta.bytes);
      continue;
    }
    if (!s.infographicConfig.nodes.length) {
      manifest.warnings.push(`Section ${i + 1} has no prepared image.`);
      continue;
    }
    onProgress(`Rendering article image ${i + 1}`);
    try {
      const svg = generateBlogInfographicSvg(s.infographicConfig);
      add(`visuals/section-${i + 1}.svg`, svg);
      add(`visuals/section-${i + 1}.png`, uriBytes(await svgRaster(svg)));
    } catch (e) {
      manifest.warnings.push(
        `Section ${i + 1} image: ${e instanceof Error ? e.message : "needs review"}`,
      );
    }
  }
  const customList = Object.values(w.customImages || {});
  for (let i = 0; i < customList.length; i++) {
    const meta = dataImageMeta(customList[i].src);
    if (meta) {
      add(`visuals/custom-${i + 1}.${meta.ext}`, meta.bytes);
    }
  }
  for (const post of socialDrafts(p)) {
    onProgress(`Preparing ${post.channel}`);
    const base = `social/${post.channel.toLowerCase()}`;
    add(`${base}/caption.txt`, post.caption);
    if (post.stale)
      manifest.warnings.push(
        `${post.channel} caption was edited for an earlier revision; review it.`,
      );
    try {
      const svg = await posterSvg(
        p,
        post.channel,
        post.headline,
        post.body,
        post.settings,
      );
      add(`${base}/image.svg`, svg);
      add(`${base}/image.png`, uriBytes(await svgRaster(svg)));
    } catch {
      manifest.warnings.push(`${post.channel} image could not be prepared.`);
    }
  }
  const email = newsletter(p);
  add("email/newsletter.txt", email.text);
  add("email/newsletter.html", email.html);
  try {
    onProgress("Preparing carousel");
    const c = await carousel(p);
    add("social/linkedin/carousel.pdf", c.pdf);
  } catch {
    manifest.warnings.push("Carousel PDF could not be prepared.");
  }
  if (audio?.revision === manifest.revision)
    for (let i = 0; i < audio.files.length; i++)
      add(`audio/chapter-${i + 1}.mp3`, audio.files[i]);
  else
    manifest.warnings.push(
      audio
        ? "Narration belongs to an earlier article revision and was excluded."
        : "Narration was not requested or is not available; no placeholder MP3 is included.",
    );
  add("manifest.json", JSON.stringify(manifest, null, 2));
  onProgress("Compressing your files");
  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 3 },
  });
  saveBlob(blob, `${p.metaPack.urlSlug || "article"}-publication-kit.zip`);
  return manifest;
}

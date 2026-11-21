/**
 * Phase 9 Core Deliverable: Client-Side Master .ZIP Production Bundle Exporter
 * File: lib/blog-writer/zip-bundle-builder.ts
 *
 * Pure TypeScript PKZIP Store + IEEE 802.3 CRC32 Binary Archive Builder (0 external npm dependencies).
 * Packages the complete multi-folder SEO, Content, Visuals, Schema, Quiz, Social & Backup bundle:
 *  - README-PUBLISHING-MANIFEST.md
 *  - article/article-cwv-optimized.html
 *  - article/article-standalone-inline-visuals.html
 *  - article/article.md
 *  - article/article-wordpress-gutenberg.html
 *  - visuals/section-1-infographic.svg ... visuals/section-N-infographic.svg (+ .png renders when in browser)
 *  - seo-technical/schema-graph.json
 *  - seo-technical/head-meta-tags.html
 *  - seo-technical/sitemap-and-robots.txt
 *  - engagement/interactive-reader-quiz.html
 *  - social-distribution/omnichannel-social-pack.md
 *  - social-distribution/utm-campaign-links.csv
 *  - project-backup/blog-project-state.json
 *
 * — Signed by: Nova-Forge (Flagship Studio Persistence & Workspace Engineer)
 */

import type { CanonicalBlogProjectState } from "@/lib/blog-writer/canonical-state";
import {
  compileCleanArticleMarkdown,
  compileCleanCwvArticleHtml,
  compileCompleteJsonLdGraph,
  compileHeadMetaTagsHtml,
  compileRobotsAndSitemapSnippet,
  compileWordPressGutenbergHtml,
  resolveCanonicalAndSlug,
} from "@/lib/blog-writer/technical-seo-compiler";
import {
  generateBlogInfographicSvg,
  renderBlogInfographicToPngDataUrl,
} from "@/lib/blog-infographic-studio/canvas-renderer";
import {
  compileEmbeddableQuizHtml,
  compileOmnichannelSocialMarkdown,
  compileUtmCampaignCsv,
} from "@/features/blog-writer-studio/components/Stage6DistributionAndQuizPack";

export interface ZipArchiveEntry {
  path: string;
  data: Uint8Array;
}

export interface MasterZipExportOptions {
  /**
   * When true (default in browser), also renders full-resolution PNG files for each H2 section infographic
   * alongside the crisp vector SVG files inside `/visuals/`.
   */
  includeRenderedPngs?: boolean;
}

export interface MasterZipExportResult {
  filename: string;
  fileCount: number;
  byteSize: number;
}

// ============================================================================
// IEEE 802.3 CRC32 IMPLEMENTATION
// ============================================================================

const CRC32_TABLE: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

export function computeCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function base64DataUrlToBytes(dataUrl: string): Uint8Array | null {
  const match = /^data:[^;]+;base64,(.+)$/i.exec(dataUrl.trim());
  if (!match) return null;
  const base64 = match[1];
  if (typeof atob === "function") {
    const binaryStr = atob(base64);
    const out = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      out[i] = binaryStr.charCodeAt(i);
    }
    return out;
  }
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }
  return null;
}

/**
 * Pure TypeScript PKZIP Store Archive Encoder.
 * Produces a standard, universally compatible `.zip` binary buffer.
 */
export function encodePkZipArchive(entries: ZipArchiveEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  const now = new Date();
  const dosTime =
    ((now.getHours() & 0x1f) << 11) |
    ((now.getMinutes() & 0x3f) << 5) |
    ((now.getSeconds() >> 1) & 0x1f);
  const dosDate =
    (((now.getFullYear() - 1980) & 0x7f) << 9) |
    (((now.getMonth() + 1) & 0x0f) << 5) |
    (now.getDate() & 0x1f);

  const prepared = entries.map((entry) => {
    const cleanPath = entry.path.replace(/^\/+/, "");
    const nameBytes = encoder.encode(cleanPath);
    const crc = computeCrc32(entry.data);
    return {
      nameBytes,
      data: entry.data,
      crc,
      size: entry.data.byteLength,
    };
  });

  let localTotalSize = 0;
  let centralTotalSize = 0;
  for (const item of prepared) {
    localTotalSize += 30 + item.nameBytes.byteLength + item.size;
    centralTotalSize += 46 + item.nameBytes.byteLength;
  }

  const totalSize = localTotalSize + centralTotalSize + 22;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  let localOffset = 0;
  const offsets: number[] = [];

  // 1. Write Local File Headers + File Payloads
  for (const item of prepared) {
    offsets.push(localOffset);

    view.setUint32(localOffset, 0x04034b50, true); // Local file header signature
    view.setUint16(localOffset + 4, 20, true); // Version needed to extract (2.0)
    view.setUint16(localOffset + 6, 0x0800, true); // General purpose bit flag (UTF-8 filenames)
    view.setUint16(localOffset + 8, 0, true); // Compression method: 0 (Store)
    view.setUint16(localOffset + 10, dosTime, true);
    view.setUint16(localOffset + 12, dosDate, true);
    view.setUint32(localOffset + 14, item.crc, true);
    view.setUint32(localOffset + 18, item.size, true); // Compressed size
    view.setUint32(localOffset + 22, item.size, true); // Uncompressed size
    view.setUint16(localOffset + 26, item.nameBytes.byteLength, true);
    view.setUint16(localOffset + 28, 0, true); // Extra field length

    bytes.set(item.nameBytes, localOffset + 30);
    bytes.set(item.data, localOffset + 30 + item.nameBytes.byteLength);

    localOffset += 30 + item.nameBytes.byteLength + item.size;
  }

  const centralDirectoryStart = localOffset;
  let centralOffset = centralDirectoryStart;

  // 2. Write Central Directory Headers
  for (let i = 0; i < prepared.length; i++) {
    const item = prepared[i];
    const relOffset = offsets[i];

    view.setUint32(centralOffset, 0x02014b50, true); // Central directory signature
    view.setUint16(centralOffset + 4, 20, true); // Version made by
    view.setUint16(centralOffset + 6, 20, true); // Version needed
    view.setUint16(centralOffset + 8, 0x0800, true); // UTF-8 flag
    view.setUint16(centralOffset + 10, 0, true); // Store method
    view.setUint16(centralOffset + 12, dosTime, true);
    view.setUint16(centralOffset + 14, dosDate, true);
    view.setUint32(centralOffset + 16, item.crc, true);
    view.setUint32(centralOffset + 20, item.size, true);
    view.setUint32(centralOffset + 24, item.size, true);
    view.setUint16(centralOffset + 28, item.nameBytes.byteLength, true);
    view.setUint16(centralOffset + 30, 0, true); // Extra field length
    view.setUint16(centralOffset + 32, 0, true); // File comment length
    view.setUint16(centralOffset + 34, 0, true); // Disk number start
    view.setUint16(centralOffset + 36, 0, true); // Internal file attributes
    view.setUint32(centralOffset + 38, 0, true); // External file attributes
    view.setUint32(centralOffset + 42, relOffset, true); // Relative offset of local header

    bytes.set(item.nameBytes, centralOffset + 46);
    centralOffset += 46 + item.nameBytes.byteLength;
  }

  // 3. Write End of Central Directory Record (EOCD)
  view.setUint32(centralOffset, 0x06054b50, true);
  view.setUint16(centralOffset + 4, 0, true); // Number of this disk
  view.setUint16(centralOffset + 6, 0, true); // Disk where central directory starts
  view.setUint16(centralOffset + 8, prepared.length, true); // Entries on this disk
  view.setUint16(centralOffset + 10, prepared.length, true); // Total central directory entries
  view.setUint32(centralOffset + 12, centralTotalSize, true); // Size of central directory
  view.setUint32(centralOffset + 16, centralDirectoryStart, true); // Offset of start of central directory
  view.setUint16(centralOffset + 20, 0, true); // Comment length

  return bytes;
}

/**
 * Builds the executive publishing manifest README included at the root of the Master .ZIP bundle.
 */
function buildPublishingManifestMarkdown(
  project: CanonicalBlogProjectState,
  slug: string,
  canonicalUrl: string
): string {
  return [
    `# Master SEO, Content, Visuals & Omnichannel Production Bundle`,
    `> **Generated by:** DoItWithAI.tools — Grand AI Blog, Article & Visual Studio`,
    `> **Project H1:** ${project.metaPack.h1Title}`,
    `> **Primary Keyword:** ${project.keywordCluster.primaryKeyword}`,
    `> **Canonical URL:** ${canonicalUrl}`,
    `> **Export Timestamp:** ${new Date().toISOString()}`,
    ``,
    `---`,
    ``,
    `## 📂 Bundle Directory & File Guide`,
    ``,
    `### 1. \`/article/\` — Multi-Format Article Deliverables`,
    `- **\`article/article-cwv-optimized.html\`**: Clean semantic \`<article>\` HTML with explicit image dimensions matching the selected infographic format, hero LCP \`fetchpriority="high"\`, Table of Contents jump links, 50-word AEO Direct Answer box, and native zero-JS \`<details>\` FAQ accordion.`,
    `- **\`article/article-standalone-inline-visuals.html\`**: Complete standalone \`<!DOCTYPE html>\` document with all 25-template vector SVG diagrams embedded inline as Data URIs, plus \`<head>\` meta tags and the 7-entity JSON-LD \`@graph\`. Double-click this file to preview the full article offline in any browser.`,
    `- **\`article/article.md\`**: Clean Markdown with YAML frontmatter for Next.js MDX, Astro, Ghost, Hugo, or Notion.`,
    `- **\`article/article-wordpress-gutenberg.html\`**: Native WordPress Gutenberg block markup (\`<!-- wp:heading -->\`, \`<!-- wp:image -->\`, \`<!-- wp:table -->\`). Paste directly into the WordPress Code Editor.`,
    ``,
    `### 2. \`/visuals/\` — 25-Template Canva / Napkin.ai Section Infographics`,
    `- Contains \`section-1-infographic.svg\` through \`section-${project.sections.length}-infographic.svg\` (plus high-resolution PNG renders when exported from a browser).`,
    ``,
    `### 3. \`/seo-technical/\` — Schema \`@graph\`, Head Meta & Indexing Rules`,
    `- **\`seo-technical/schema-graph.json\`**: Unified 7-entity Schema.org \`@graph\` (\`Organization\`, \`Person\`, \`WebPage\`, \`BlogPosting\`, \`BreadcrumbList\`, \`FAQPage\`, \`HowTo\`).`,
    `- **\`seo-technical/head-meta-tags.html\`**: Pixel-verified \`<title>\` (<580px), \`<meta name="description">\` (<920px), canonical link, LCP preload hint, OpenGraph, and X/Twitter Card tags.`,
    `- **\`seo-technical/sitemap-and-robots.txt\`**: AI Search Bot allow rules (\`Googlebot\`, \`OAI-SearchBot\`, \`GPTBot\`, \`PerplexityBot\`, \`ClaudeBot\`), XML sitemap entry with \`<image:image>\` extensions, and IndexNow JSON payload.`,
    ``,
    `### 4. \`/engagement/\` — Interactive Dwell-Time Widget`,
    `- **\`engagement/interactive-reader-quiz.html\`**: Self-contained 5-question multiple-choice reader comprehension quiz widget.`,
    ``,
    `### 5. \`/social-distribution/\` — 6-Channel Omnichannel Campaign Pack`,
    `- **\`social-distribution/omnichannel-social-pack.md\`**: LinkedIn Carousel outline, LinkedIn long-form post, 7-post X/Twitter thread, Reddit value breakdown, Quora authority answer, Email newsletter digest, and 60s short video script.`,
    `- **\`social-distribution/utm-campaign-links.csv\`**: Ready-to-track UTM attribution links for every social channel.`,
    ``,
    `### 6. \`/project-backup/\` — Full Studio Workspace Backup`,
    `- **\`project-backup/blog-project-state.json\`**: Complete \`CanonicalBlogProjectState\` JSON backup. Re-import this file anytime in the Grand AI Blog Writer Studio to resume editing.`,
    ``,
    `---`,
    `*— Signed by: Nova-Forge (Flagship Studio Persistence & Workspace Engineer) · DoItWithAI.tools (${slug})*`,
  ].join("\n");
}

/**
 * Compiles all text and binary files into a single `Uint8Array` PKZIP archive.
 */
export async function buildMasterBlogZipBytes(
  project: CanonicalBlogProjectState,
  options: MasterZipExportOptions = {}
): Promise<{ zipBytes: Uint8Array; fileCount: number; slug: string }> {
  const encoder = new TextEncoder();
  const { slug, canonicalUrl } = resolveCanonicalAndSlug(project);
  const includePngs = options.includeRenderedPngs ?? true;

  const entries: ZipArchiveEntry[] = [];
  const addTextFile = (path: string, content: string) => {
    entries.push({
      path,
      data: encoder.encode(content),
    });
  };

  // Root Manifest
  addTextFile(
    "README-PUBLISHING-MANIFEST.md",
    buildPublishingManifestMarkdown(project, slug, canonicalUrl)
  );

  // 1. /article/ Deliverables
  addTextFile(
    "article/article-cwv-optimized.html",
    compileCleanCwvArticleHtml(project, {
      inlineSvgDataUri: false,
      includeFullHtmlDocumentShell: false,
    })
  );
  addTextFile(
    "article/article-standalone-inline-visuals.html",
    compileCleanCwvArticleHtml(project, {
      inlineSvgDataUri: true,
      includeFullHtmlDocumentShell: true,
    })
  );
  addTextFile("article/article.md", compileCleanArticleMarkdown(project));
  addTextFile(
    "article/article-wordpress-gutenberg.html",
    compileWordPressGutenbergHtml(project)
  );

  // 2. /visuals/ Section Infographics (Vector SVG + Optional High-Res PNG)
  for (let i = 0; i < project.sections.length; i++) {
    const sec = project.sections[i];
    if (!sec.infographicConfig) continue;

    const svgMarkup =
      generateBlogInfographicSvg(sec.infographicConfig);

    addTextFile(`visuals/section-${i + 1}-infographic.svg`, svgMarkup);

    if (includePngs && typeof document !== "undefined") {
      try {
        const pngDataUrl =
          await renderBlogInfographicToPngDataUrl(sec.infographicConfig);
        if (pngDataUrl) {
          const pngBytes = base64DataUrlToBytes(pngDataUrl);
          if (pngBytes) {
            entries.push({
              path: `visuals/section-${i + 1}-infographic.png`,
              data: pngBytes,
            });
          }
        }
      } catch {
        // Ignore PNG rasterization error in non-canvas environments; SVG is always included
      }
    }
  }

  // 3. /seo-technical/ Deliverables
  addTextFile(
    "seo-technical/schema-graph.json",
    compileCompleteJsonLdGraph(project, { asScriptTag: false })
  );
  addTextFile(
    "seo-technical/head-meta-tags.html",
    compileHeadMetaTagsHtml(project)
  );
  addTextFile(
    "seo-technical/sitemap-and-robots.txt",
    compileRobotsAndSitemapSnippet(project)
  );

  // 4. /engagement/ Interactive Quiz Widget
  addTextFile(
    "engagement/interactive-reader-quiz.html",
    compileEmbeddableQuizHtml(project)
  );

  // 5. /social-distribution/ Omnichannel Pack & UTM CSV
  addTextFile(
    "social-distribution/omnichannel-social-pack.md",
    compileOmnichannelSocialMarkdown(project)
  );
  addTextFile(
    "social-distribution/utm-campaign-links.csv",
    compileUtmCampaignCsv(project)
  );

  // 6. /project-backup/ Full Project JSON State
  const backupPayload = {
    format: "doitwithai-blog-project-v1",
    exportedAtIso: new Date().toISOString(),
    project,
  };
  addTextFile(
    "project-backup/blog-project-state.json",
    JSON.stringify(backupPayload, null, 2)
  );

  const zipBytes = encodePkZipArchive(entries);
  return {
    zipBytes,
    fileCount: entries.length,
    slug,
  };
}

/**
 * Triggers an instant client-side browser download of `<slug>-master-seo-bundle.zip`.
 */
export async function downloadMasterBlogZipBundle(
  project: CanonicalBlogProjectState,
  options: MasterZipExportOptions = {}
): Promise<MasterZipExportResult> {
  const { zipBytes, fileCount, slug } = await buildMasterBlogZipBytes(
    project,
    options
  );
  const filename = `${slug}-master-seo-bundle.zip`;

  if (typeof document !== "undefined") {
    const safeBuffer = new Uint8Array(zipBytes.byteLength);
    safeBuffer.set(zipBytes);
    const blob = new Blob([safeBuffer.buffer], {
      type: "application/zip",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    filename,
    fileCount,
    byteSize: zipBytes.byteLength,
  };
}

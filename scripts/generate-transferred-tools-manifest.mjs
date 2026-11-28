/**
 * Generates the deterministic Transferred Tool Manifest, pure-JSON lookup helper,
 * server SSR stub, and client-only React.lazy import registry from every real tool
 * landing page under app/tools/<slug>/page.tsx.
 *
 * Output:
 *  - features/website-builder/tools/transferred-tools-manifest.json
 *  - features/website-builder/tools/transferred-tool-manifest.ts
 *  - features/website-builder/tools/transferred-tool-registry.server-stub.ts
 *  - features/website-builder/tools/transferred-tool-registry.ts
 *
 * Pure & deterministic (no timestamps) so git diff stays clean unless upstream tools change.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const toolsDir = path.join(root, "app", "tools");
const toolsOutDir = path.join(root, "features", "website-builder", "tools");
const outManifestPath = path.join(toolsOutDir, "transferred-tools-manifest.json");
const outManifestTsPath = path.join(toolsOutDir, "transferred-tool-manifest.ts");
const outServerStubPath = path.join(
  toolsOutDir,
  "transferred-tool-registry.server-stub.ts",
);
const outRegistryPath = path.join(toolsOutDir, "transferred-tool-registry.ts");

function isRedirectOnlyPage(source) {
  return (
    /\b(?:permanentRedirect|redirect)\s*\(/.test(source) &&
    !/\breturn\s*(?:\(\s*)?</.test(source)
  );
}

function listToolSlugs() {
  if (!fs.existsSync(toolsDir)) return [];
  return fs
    .readdirSync(toolsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => {
      const pagePath = path.join(toolsDir, slug, "page.tsx");
      if (!fs.existsSync(pagePath)) return false;
      const src = fs.readFileSync(pagePath, "utf8");
      return !isRedirectOnlyPage(src);
    })
    .sort((a, b) => a.localeCompare(b));
}

function resolveLocalImport(fromFile, specifier) {
  let base = null;
  if (specifier.startsWith("@/")) {
    base = path.join(root, specifier.slice(2));
  } else if (specifier.startsWith("./") || specifier.startsWith("../")) {
    base = path.resolve(path.dirname(fromFile), specifier);
  }
  if (!base) return null;

  // Exclude shared website-builder shell & chrome from upstream version hash
  const relNormalized = path.relative(root, base).replace(/\\/g, "/");
  if (
    relNormalized.startsWith("features/website-builder") ||
    relNormalized.includes("PortableToolHeroBar") ||
    relNormalized.includes("ToolResources")
  ) {
    return null;
  }

  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

function collectDependencyFiles(entryFile, maxDepth = 2) {
  const visited = new Map();
  const queue = [{ file: entryFile, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    const { file, depth } = current;
    const rel = path.relative(root, file).replace(/\\/g, "/");
    if (visited.has(rel)) continue;

    let content = "";
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    visited.set(rel, content);

    if (depth >= maxDepth) continue;

    const importRegex = /(?:from|import)\s+["']([^"']+)["']/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const resolved = resolveLocalImport(file, match[1]);
      if (resolved) {
        queue.push({ file: resolved, depth: depth + 1 });
      }
    }
  }

  return Array.from(visited.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

function computeVersionHash(files) {
  const hash = crypto.createHash("sha256");
  for (const [relPath, content] of files) {
    // Normalize CRLF -> LF so hashes match identically across Windows & Linux CI
    hash.update(relPath);
    hash.update("\0");
    hash.update(content.replace(/\r\n/g, "\n"));
    hash.update("\0");
  }
  return hash.digest("hex").slice(0, 8);
}

function stripMainBrandSuffix(text) {
  return text
    .replace(/\s*[|·–—-]\s*DoItWithAI\.tools.*$/i, "")
    .replace(/\bDoItWithAI\.tools\b/gi, "this workspace")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanJsxText(raw) {
  return raw
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\{"\s*"\}/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&rsquo;|&lsquo;|&#39;/g, "'")
    .replace(/&ldquo;|&rdquo;|&quot;/g, '"')
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/\s+/g, " ")
    .trim();
}

function extractStringField(source, fieldName) {
  // Matches: title: "..." or title: '...' or multi-line title:\n  "..."
  const regex = new RegExp(
    `(?:^|[\\s,{])${fieldName}\\s*:\\s*(?:"((?:[^"\\\\]|\\\\.)*)"|'((?:[^'\\\\]|\\\\.)*)')`,
    "m",
  );
  const match = regex.exec(source);
  const value = match?.[1] ?? match?.[2] ?? "";
  return value.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\s+/g, " ").trim();
}

function extractHeroTitle(source, fallbackTitle) {
  const h1Match = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(source);
  if (h1Match?.[1]) {
    const cleaned = cleanJsxText(h1Match[1]);
    if (cleaned && !cleaned.includes("{") && cleaned.length >= 4 && cleaned.length <= 160) {
      return cleaned;
    }
  }
  return fallbackTitle;
}

function extractHeroDescription(source, fallbackDescription) {
  const h1Index = source.search(/<h1\b/i);
  if (h1Index >= 0) {
    const afterH1 = source.slice(h1Index, h1Index + 1600);
    const pMatch = /<p\b[^>]*>([\s\S]*?)<\/p>/i.exec(afterH1);
    if (pMatch?.[1]) {
      const cleaned = cleanJsxText(pMatch[1]);
      if (cleaned && !cleaned.includes("{") && cleaned.length >= 16 && cleaned.length <= 420) {
        return stripMainBrandSuffix(cleaned);
      }
    }
  }
  return fallbackDescription;
}

function extractFaqs(source) {
  const faqs = [];
  const detailsRegex =
    /<details\b[^>]*>[\s\S]*?<summary\b[^>]*>([\s\S]*?)<\/summary>[\s\S]*?<p\b[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/details>/gi;
  let match;
  while ((match = detailsRegex.exec(source)) !== null && faqs.length < 8) {
    const question = cleanJsxText(match[1]);
    const answer = stripMainBrandSuffix(cleanJsxText(match[2]));
    if (question && answer && !question.includes("{") && !answer.includes("{")) {
      faqs.push({ question, answer });
    }
  }
  return faqs;
}

function slugToTitle(slug) {
  return slug
    .split("-")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ""))
    .join(" ");
}

function build() {
  const slugs = listToolSlugs();
  const manifestTools = {};

  for (const slug of slugs) {
    const pageFile = path.join(toolsDir, slug, "page.tsx");
    const pageSource = fs.readFileSync(pageFile, "utf8");
    const depFiles = collectDependencyFiles(pageFile, 2);
    const versionHash = computeVersionHash(depFiles);
    const versionLabel = `v2026.11.${versionHash}`;

    const extractedMetaTitle = extractStringField(pageSource, "title");
    const extractedMetaDescription = extractStringField(pageSource, "description");

    const heroTitle = extractHeroTitle(
      pageSource,
      stripMainBrandSuffix(extractedMetaTitle) || slugToTitle(slug),
    );
    const heroDescription = extractHeroDescription(
      pageSource,
      stripMainBrandSuffix(extractedMetaDescription) ||
        `Run ${heroTitle} natively inside your workspace.`,
    );

    const metaTitle = stripMainBrandSuffix(extractedMetaTitle) || heroTitle || slugToTitle(slug);
    const metaDescription =
      stripMainBrandSuffix(extractedMetaDescription) || heroDescription;
    const faqs = extractFaqs(pageSource);

    manifestTools[slug] = {
      slug,
      sourcePage: `app/tools/${slug}/page.tsx`,
      versionHash,
      versionLabel,
      metaTitle,
      metaDescription,
      heroTitle,
      heroDescription,
      faqs,
    };
  }

  fs.mkdirSync(path.dirname(outManifestPath), { recursive: true });
  fs.writeFileSync(
    outManifestPath,
    `${JSON.stringify(
      {
        generatedBy: "scripts/generate-transferred-tools-manifest.mjs",
        toolCount: slugs.length,
        tools: manifestTools,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  const manifestTs = `// AUTO-GENERATED BY scripts/generate-transferred-tools-manifest.mjs
// Do not edit manually. Re-run \`node scripts/generate-transferred-tools-manifest.mjs\` after adding/updating tool pages.

import manifestJson from "./transferred-tools-manifest.json";

export interface TransferredToolFaq {
  question: string;
  answer: string;
}

export interface TransferredToolManifestEntry {
  slug: string;
  sourcePage: string;
  versionHash: string;
  versionLabel: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroDescription: string;
  faqs: TransferredToolFaq[];
}

const manifest = manifestJson as {
  generatedBy: string;
  toolCount: number;
  tools: Record<string, TransferredToolManifestEntry>;
};

export const TRANSFERRED_TOOLS_MANIFEST = manifest.tools;

export function hasTransferredToolComponent(slug?: string): boolean {
  if (!slug) return false;
  return Boolean(manifest.tools[slug]);
}

export function getTransferredToolManifestEntry(
  slug?: string,
): TransferredToolManifestEntry | null {
  if (!slug) return null;
  return manifest.tools[slug] ?? null;
}

export function getAllTransferredToolManifestEntries(): TransferredToolManifestEntry[] {
  return Object.values(manifest.tools);
}
`;

  const serverStubTs = `// AUTO-GENERATED BY scripts/generate-transferred-tools-manifest.mjs
// Server-side Webpack stub so SSR builds do not compile all 120 transferred client tool trees.

import type { ComponentType } from "react";
export * from "./transferred-tool-manifest";

export type TransferredToolPageComponent = ComponentType<{
  params?: Record<string, string>;
  searchParams?: Record<string, string | string[] | undefined>;
}>;

export function getTransferredToolComponent(
  _slug?: string,
): TransferredToolPageComponent | null {
  void _slug;
  return null;
}
`;

  const loaderEntries = slugs
    .map(
      (slug) =>
        `  ${JSON.stringify(slug)}: () => import(${JSON.stringify(`@/app/tools/${slug}/page`)}) as Promise<{ default: TransferredToolPageComponent }>,`,
    )
    .join("\n");

  const registryTs = `"use client";

// AUTO-GENERATED BY scripts/generate-transferred-tools-manifest.mjs
// Do not edit manually. Re-run \`node scripts/generate-transferred-tools-manifest.mjs\` after adding/updating tool pages.

import React from "react";
import type { ComponentType } from "react";
export * from "./transferred-tool-manifest";

export type TransferredToolPageComponent = ComponentType<{
  params?: Record<string, string>;
  searchParams?: Record<string, string | string[] | undefined>;
}>;

export const TRANSFERRED_TOOL_LOADERS: Record<
  string,
  () => Promise<{ default: TransferredToolPageComponent }>
> = {
${loaderEntries}
};

const lazyComponentCache = new Map<string, TransferredToolPageComponent>();

export function getTransferredToolComponent(
  slug?: string,
): TransferredToolPageComponent | null {
  if (!slug || typeof window === "undefined") return null;
  const loader = TRANSFERRED_TOOL_LOADERS[slug];
  if (!loader) return null;
  let cached = lazyComponentCache.get(slug);
  if (!cached) {
    cached = React.lazy(loader);
    lazyComponentCache.set(slug, cached);
  }
  return cached;
}
`;

  fs.writeFileSync(outManifestTsPath, manifestTs, "utf8");
  fs.writeFileSync(outServerStubPath, serverStubTs, "utf8");
  fs.writeFileSync(outRegistryPath, registryTs, "utf8");
  console.log(
    `Generated transferred-tools-manifest.json, transferred-tool-manifest.ts, transferred-tool-registry.server-stub.ts & transferred-tool-registry.ts for ${slugs.length} tools.`,
  );
}

build();

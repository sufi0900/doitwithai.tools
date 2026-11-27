#!/usr/bin/env node
/**
 * Phase 2 & Phase 3 Codemod: Migrate /tools/[slug]/page.tsx to Ahrefs-style <ToolLandingHero>.
 *
 * Guarantees:
 *  - Fixes JSX multiline <h1><span> missing-space bugs (e.g. "SEOAnalyzer" -> "SEO Analyzer").
 *  - Replaces the old 2-column hero (eyebrow, pills, right card, PortableToolHeroBar) with
 *    <ToolLandingHero> (matte charcoal #14171D + Option A ToolUtilityMenu + white workspace card).
 *  - Preserves 100% of metadata, JSON-LD scripts, bottom static SEO sections, ToolFaq, and ToolResources.
 *
 * Usage:
 *  node scripts/migrate-tool-heroes.mjs --audit
 *  node scripts/migrate-tool-heroes.mjs --pilot --dry-run
 *  node scripts/migrate-tool-heroes.mjs --pilot
 *  node scripts/migrate-tool-heroes.mjs --all --dry-run
 *  node scripts/migrate-tool-heroes.mjs --all
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const TOOLS_DIR = path.resolve(process.cwd(), "app/tools");

const PILOT_SLUGS = [
  "on-page-ai-seo-analyzer",
  "article-outline-generator",
  "blog-section-infographic-generator",
];

const EXCLUDED_DIRS = new Set([
  "categories",
  "downloadable-ai-tools",
  "ai-article-writer",
  "ai-blog-article-writer",
  "ai-blog-writer",
  "ai-content-writer",
  "ai-website-builder",
]);

function collapseWhitespace(raw) {
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\{\s*["']\s*["']\s*\}/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function escapeTsString(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function detectMissingSpaceH1(source) {
  const h1Match = source.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/);
  if (!h1Match) return null;
  const inner = h1Match[1];
  const hasMultilineSpanSplit = /[A-Za-z0-9]\s*\r?\n\s*<span\b/.test(inner);
  return {
    rawInner: inner,
    fixedTitle: collapseWhitespace(inner),
    hasMissingSpaceBug: hasMultilineSpanSplit,
  };
}

function extractHeroSubtitle(heroSection) {
  const afterH1 = heroSection.split(/<\/h1>/)[1] || "";
  const pMatch = afterH1.match(/<p\b[^>]*>([\s\S]*?)<\/p>/);
  if (!pMatch) return "";
  return collapseWhitespace(pMatch[1]);
}

function extractCategoryFromBreadcrumb(heroSection) {
  const navMatch = heroSection.match(
    /<nav\b[^>]*aria-label=["']Breadcrumb["'][^>]*>([\s\S]*?)<\/nav>/i,
  );
  if (!navMatch) {
    return { label: "AI SEO Tools", href: "/tools" };
  }
  const links = [
    ...navMatch[1].matchAll(
      /<Link\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/Link>/g,
    ),
  ];
  const categoryLink = links.find((m) => m[1].startsWith("/tools/categories/"));
  if (categoryLink) {
    return {
      label: collapseWhitespace(categoryLink[2]) || "AI SEO Tools",
      href: categoryLink[1],
    };
  }
  return { label: "AI SEO Tools", href: "/tools" };
}

function findMatchingSectionEnd(source, startIdx) {
  const tagRe = /<\/?section\b[^>]*>/g;
  tagRe.lastIndex = startIdx;
  let depth = 0;
  let match;
  while ((match = tagRe.exec(source)) !== null) {
    if (match[0].startsWith("</section")) {
      depth -= 1;
      if (depth === 0) {
        return tagRe.lastIndex;
      }
    } else {
      depth += 1;
    }
  }
  return -1;
}

export function transformToolPageSource(source, slug) {
  if (source.includes("<ToolLandingHero")) {
    return { changed: false, reason: "already-migrated", output: source };
  }

  const h1Idx = source.indexOf("<h1");
  if (h1Idx === -1) {
    return { changed: false, reason: "no-h1-found", output: source };
  }

  const beforeH1 = source.slice(0, h1Idx);
  const heroStartIdx = beforeH1.lastIndexOf("<section");
  if (heroStartIdx === -1) {
    return { changed: false, reason: "no-hero-section-found", output: source };
  }

  const heroEndIdx = findMatchingSectionEnd(source, heroStartIdx);
  if (heroEndIdx === -1) {
    return { changed: false, reason: "unbalanced-hero-section", output: source };
  }

  const heroSection = source.slice(heroStartIdx, heroEndIdx);
  const h1Info = detectMissingSpaceH1(heroSection);
  if (!h1Info || !h1Info.fixedTitle) {
    return { changed: false, reason: "empty-h1", output: source };
  }

  const description = extractHeroSubtitle(heroSection);
  const category = extractCategoryFromBreadcrumb(heroSection);

  const afterHero = source.slice(heroEndIdx);
  const wsMatch = afterHero.match(/^(\s*)<section\b([^>]*)>/);
  if (!wsMatch) {
    return {
      changed: false,
      reason: "workspace-section-not-adjacent",
      output: source,
    };
  }

  const wsStartIdx = heroEndIdx + wsMatch[1].length;
  const wsEndIdx = findMatchingSectionEnd(source, wsStartIdx);
  if (wsEndIdx === -1) {
    return {
      changed: false,
      reason: "unbalanced-workspace-section",
      output: source,
    };
  }

  const wsSection = source.slice(wsStartIdx, wsEndIdx);
  const wsIdMatch = wsMatch[2].match(/\bid=["']([^"']+)["']/);
  const workspaceId = wsIdMatch ? wsIdMatch[1] : "tool-studio-workspace";

  const wsOpenEnd = wsSection.indexOf(">") + 1;
  const wsCloseStart = wsSection.lastIndexOf("</section>");
  const wsInner = wsSection.slice(wsOpenEnd, wsCloseStart).trim();

  const replacement = [
    `<ToolLandingHero`,
    `        slug="${escapeTsString(slug)}"`,
    `        title="${escapeTsString(h1Info.fixedTitle)}"`,
    `        description="${escapeTsString(description)}"`,
    `        categoryLabel="${escapeTsString(category.label)}"`,
    `        categoryHref="${escapeTsString(category.href)}"`,
    `        workspaceId="${escapeTsString(workspaceId)}"`,
    `      >`,
    `        ${wsInner}`,
    `      </ToolLandingHero>`,
  ].join("\n");

  let next = source.slice(0, heroStartIdx) + replacement + source.slice(wsEndIdx);

  next = next.replace(
    /^import\s+PortableToolHeroBar\s+from\s+["']@\/features\/portable-tool-kit\/PortableToolHeroBar["'];?\r?\n/gm,
    "",
  );
  next = next.replace(
    /^import\s*\{[\s\S]*?\}\s*from\s+["']@\/features\/tool-ui\/ToolHero["'];?\r?\n/gm,
    "",
  );

  if (!/import\s+ToolLandingHero\b/.test(next)) {
    next = next.replace(
      /^(import\s+[^\n]+\n)/,
      `$1import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";\n`,
    );
  }

  return {
    changed: true,
    reason: "migrated",
    fixedMissingSpace: h1Info.hasMissingSpaceBug,
    title: h1Info.fixedTitle,
    output: next,
  };
}

function getTargetSlugs(args) {
  if (args.includes("--pilot")) {
    return PILOT_SLUGS;
  }
  if (!fs.existsSync(TOOLS_DIR)) return [];
  return fs
    .readdirSync(TOOLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !EXCLUDED_DIRS.has(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function main() {
  const args = process.argv.slice(2);
  const isAudit = args.includes("--audit");
  const isDryRun = args.includes("--dry-run");
  const isPilot = args.includes("--pilot");
  const isAll = args.includes("--all");

  if (!isAudit && !isPilot && !isAll) {
    console.log(
      "Usage: node scripts/migrate-tool-heroes.mjs [--audit | --pilot | --all] [--dry-run]",
    );
    process.exit(0);
  }

  const slugs = getTargetSlugs(args);
  let migrated = 0;
  let skipped = 0;
  let missingSpaceHits = 0;

  for (const slug of slugs) {
    const filePath = path.join(TOOLS_DIR, slug, "page.tsx");
    if (!fs.existsSync(filePath)) {
      skipped += 1;
      continue;
    }

    const source = fs.readFileSync(filePath, "utf8");
    const h1Check = detectMissingSpaceH1(source);
    if (h1Check?.hasMissingSpaceBug) {
      missingSpaceHits += 1;
    }

    if (isAudit) {
      if (h1Check?.hasMissingSpaceBug) {
        console.log(`[MISSING-SPACE-H1] ${slug} -> "${h1Check.fixedTitle}"`);
      }
      continue;
    }

    const result = transformToolPageSource(source, slug);
    if (!result.changed) {
      console.log(`[SKIP:${result.reason}] ${slug}`);
      skipped += 1;
      continue;
    }

    migrated += 1;
    const tag = isDryRun ? "DRY-RUN" : "UPDATED";
    console.log(
      `[${tag}] ${slug} | H1="${result.title}"${result.fixedMissingSpace ? " (fixed missing space)" : ""}`,
    );

    if (!isDryRun) {
      fs.writeFileSync(filePath, result.output, "utf8");
    }
  }

  console.log(
    `\nSummary: scanned=${slugs.length}, missingSpaceH1=${missingSpaceHits}, migrated=${migrated}, skipped=${skipped}${isDryRun ? " (dry-run, no files written)" : ""}`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main();
}

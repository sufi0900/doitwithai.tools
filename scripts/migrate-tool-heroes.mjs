#!/usr/bin/env node
/**
 * Phase 2 & Phase 3 Codemod: Migrate /tools/[slug]/page.tsx to Ahrefs-style <ToolLandingHero>.
 *
 * Supports all 3 hero wrapper patterns across /app/tools:
 *  1. <section ... toolHeroSurface> + adjacent <section> workspace
 *  2. <header ... toolHeroSurface> + adjacent <*Client /> or <section> workspace
 *  3. <div ... toolHeroSurface> containing <*Client /> inside
 *
 * Guarantees:
 *  - Fixes JSX multiline <h1><span> missing-space bugs (e.g. "SEOAnalyzer" -> "SEO Analyzer").
 *  - Replaces old hero + PortableToolHeroBar with <ToolLandingHero>.
 *  - Preserves 100% of metadata, JSON-LD scripts, bottom static SEO sections, ToolFaq, and ToolResources.
 *  - Preserves client component imports & used icon imports while stripping unused ToolHero/PortableToolHeroBar/lucide icons.
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
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
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
  if (navMatch) {
    const links = [
      ...navMatch[1].matchAll(
        /<Link\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/Link>/g,
      ),
    ];
    const categoryLink = links.find((m) =>
      m[1].startsWith("/tools/categories/"),
    );
    if (categoryLink) {
      return {
        label: collapseWhitespace(categoryLink[2]) || "AI SEO Tools",
        href: categoryLink[1],
      };
    }
  }

  // Fallback: infer concise category from eyebrow if present
  const eyebrowMatch = heroSection.match(
    /<p\b[^>]*className=["'][^"']*uppercase[^"']*["'][^>]*>([\s\S]*?)<\/p>/i,
  );
  if (eyebrowMatch) {
    const raw = collapseWhitespace(eyebrowMatch[1]).split("·")[0]?.trim();
    if (raw && raw.length >= 3 && raw.length <= 36) {
      return { label: raw, href: "/tools" };
    }
  }

  return { label: "AI SEO Tools", href: "/tools" };
}

function findMatchingTagEnd(source, startIdx, tagName) {
  const tagRe = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "g");
  tagRe.lastIndex = startIdx;
  let depth = 0;
  let match;
  while ((match = tagRe.exec(source)) !== null) {
    if (match[0].startsWith(`</${tagName}`)) {
      depth -= 1;
      if (depth === 0) {
        return tagRe.lastIndex;
      }
    } else if (!match[0].endsWith("/>")) {
      depth += 1;
    }
  }
  return -1;
}

function findHeroContainer(source) {
  const exportIdx = Math.max(0, source.indexOf("export default"));
  let surfaceIdx = source.indexOf("${toolHeroSurface}", exportIdx);
  if (surfaceIdx === -1) {
    surfaceIdx = source.indexOf("toolHeroSurface", exportIdx);
  }
  if (surfaceIdx === -1) return null;

  const before = source.slice(0, surfaceIdx);
  const candidates = [
    { tag: "section", idx: before.lastIndexOf("<section") },
    { tag: "header", idx: before.lastIndexOf("<header") },
    { tag: "div", idx: before.lastIndexOf("<div") },
  ].filter((c) => c.idx !== -1);

  if (!candidates.length) return null;
  candidates.sort((a, b) => b.idx - a.idx);
  const best = candidates[0];
  const endIdx = findMatchingTagEnd(source, best.idx, best.tag);
  if (endIdx === -1) return null;

  return { tag: best.tag, startIdx: best.idx, endIdx };
}

function stripUnusedLucideImports(source) {
  const bodyAfterImports = source.replace(/^import\s+[^;]+;\s*\r?\n/gm, "");
  return source.replace(
    /^import\s*\{([^}]*)\}\s*from\s*["']lucide-react["'];?\r?\n/gm,
    (full, inner) => {
      const names = inner
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean);
      const kept = names.filter((spec) => {
        const localName = spec.includes(" as ")
          ? spec.split(/\s+as\s+/)[1].trim()
          : spec;
        const re = new RegExp(`\\b${localName}\\b`);
        return re.test(bodyAfterImports);
      });
      if (!kept.length) return "";
      if (kept.length === 1) {
        return `import { ${kept[0]} } from "lucide-react";\n`;
      }
      return `import {\n  ${kept.join(",\n  ")},\n} from "lucide-react";\n`;
    },
  );
}

function wrapWorkspaceInner(wsInner) {
  const trimmed = wsInner.trim();
  if (/^<div\s+className=["']p-4 sm:p-6["']>/.test(trimmed)) {
    return trimmed;
  }
  return `<div className="p-4 sm:p-6">\n          ${trimmed}\n        </div>`;
}

export function transformToolPageSource(source, slug) {
  if (source.includes("<ToolLandingHero")) {
    return { changed: false, reason: "already-migrated", output: source };
  }

  const h1Idx = source.indexOf("<h1");
  if (h1Idx === -1) {
    return { changed: false, reason: "no-h1-found", output: source };
  }

  const heroBox = findHeroContainer(source);
  if (!heroBox) {
    return { changed: false, reason: "no-hero-section-found", output: source };
  }

  const heroBlock = source.slice(heroBox.startIdx, heroBox.endIdx);
  const h1Info = detectMissingSpaceH1(heroBlock);
  if (!h1Info || !h1Info.fixedTitle) {
    return { changed: false, reason: "empty-h1", output: source };
  }

  const description = extractHeroSubtitle(heroBlock);
  const category = extractCategoryFromBreadcrumb(heroBlock);

  let replaceEndIdx = heroBox.endIdx;
  let wsInner = "";
  let workspaceId = "tool-studio-workspace";

  // Pattern A: Workspace <*Client /> or <div className="mt-8"><*Client /></div> embedded INSIDE the hero container
  // Look for the closing of the hero copy grid/header inside heroBlock
  const heroInnerOpenEnd = heroBlock.indexOf(">") + 1;
  const heroInner = heroBlock.slice(heroInnerOpenEnd, heroBlock.lastIndexOf(`</${heroBox.tag}>`));

  // Check if a <*Client /> or <*Studio /> component is embedded inside heroBlock
  const embeddedClientMatch = heroBlock.match(
    /<([A-Z][A-Za-z0-9]*(?:Client|Studio|Workspace))\b[^>]*\/>/,
  );

  if (embeddedClientMatch) {
    const clientTag = embeddedClientMatch[0];
    // Preserve optional outer <div id="tool-studio-workspace" ...> or <div className="mt-8"> around embedded client?
    // Better: extract clean client tag (plus its wrapper if it has custom props, or just the client component tag)
    const idOnHeroInner = heroInner.match(/\bid=["'](tool-studio-workspace|[a-z0-9-]+workspace)["']/);
    if (idOnHeroInner) workspaceId = idOnHeroInner[1];
    wsInner = clientTag;
  } else {
    // Pattern B: Adjacent <section> workspace right after heroBox
    const afterHero = source.slice(heroBox.endIdx);
    const wsSecMatch = afterHero.match(/^(\s*)<section\b([^>]*)>/);
    const wsClientMatch = afterHero.match(
      /^(\s*)(?:<div\b([^>]*)>\s*)?(<[A-Z][A-Za-z0-9]*(?:Client|Studio|Workspace)\b[^>]*\/>)/,
    );

    if (wsSecMatch) {
      const wsStartIdx = heroBox.endIdx + wsSecMatch[1].length;
      const wsEndIdx = findMatchingTagEnd(source, wsStartIdx, "section");
      if (wsEndIdx === -1) {
        return {
          changed: false,
          reason: "unbalanced-workspace-section",
          output: source,
        };
      }
      const wsSection = source.slice(wsStartIdx, wsEndIdx);
      const wsIdMatch = wsSecMatch[2].match(/\bid=["']([^"']+)["']/);
      if (wsIdMatch) workspaceId = wsIdMatch[1];
      const wsOpenEnd = wsSection.indexOf(">") + 1;
      const wsCloseStart = wsSection.lastIndexOf("</section>");
      wsInner = wsSection.slice(wsOpenEnd, wsCloseStart).trim();
      replaceEndIdx = wsEndIdx;
    } else if (wsClientMatch) {
      wsInner = wsClientMatch[3];
      if (wsClientMatch[2]) {
        const divStart = heroBox.endIdx + wsClientMatch[1].length;
        const divEnd = findMatchingTagEnd(source, divStart, "div");
        replaceEndIdx = divEnd !== -1 ? divEnd : heroBox.endIdx + wsClientMatch[0].length;
      } else {
        replaceEndIdx = heroBox.endIdx + wsClientMatch[0].length;
      }
    } else {
      return {
        changed: false,
        reason: "workspace-section-not-adjacent",
        output: source,
      };
    }
  }

  const wrappedInner = wrapWorkspaceInner(wsInner);

  const replacement = [
    `<ToolLandingHero`,
    `        slug="${escapeTsString(slug)}"`,
    `        title="${escapeTsString(h1Info.fixedTitle)}"`,
    `        description="${escapeTsString(description)}"`,
    `        categoryLabel="${escapeTsString(category.label)}"`,
    `        categoryHref="${escapeTsString(category.href)}"`,
    `        workspaceId="${escapeTsString(workspaceId)}"`,
    `      >`,
    `        ${wrappedInner}`,
    `      </ToolLandingHero>`,
  ].join("\n");

  let next =
    source.slice(0, heroBox.startIdx) + replacement + source.slice(replaceEndIdx);

  next = next.replace(
    /^import\s+PortableToolHeroBar\s+from\s+["']@\/features\/portable-tool-kit\/PortableToolHeroBar["'];?\r?\n/gm,
    "",
  );
  next = next.replace(
    /^import\s*\{[^}]*\}\s*from\s+["']@\/features\/tool-ui\/ToolHero["'];?\r?\n/gm,
    "",
  );
  next = next.replace(
    /^import\s+[^\n;]*\bToolHero\b[^\n;]*;\r?\n/gm,
    "",
  );

  if (!/import\s+ToolLandingHero\b/.test(next)) {
    if (/^(import\s+[^\n]+\n)/.test(next)) {
      next = next.replace(
        /^(import\s+[^\n]+\n)/,
        `$1import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";\n`,
      );
    } else {
      next = `import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";\n${next}`;
    }
  }

  next = stripUnusedLucideImports(next);

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

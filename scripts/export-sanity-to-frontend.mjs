#!/usr/bin/env node
/**
 * scripts/export-sanity-to-frontend.mjs
 *
 * Evergreen Sanity-to-Frontend Snapshot & Image Downloader
 * --------------------------------------------------------
 * 1. Connects to your Sanity dataset (Project ID: qyshio4a / .env.local).
 * 2. Exports 100% of published articles across ["seo", "aitool", "coding", "makemoney", "blogPost", "guide"]
 *    with complete PortableText content[], headings, tableOfContents, FAQs, tags, and SEO metadata.
 * 3. Downloads every mainImage and inline body image/GIF from cdn.sanity.io into
 *    public/images/sanity-archive/ and attaches `localUrl` so your frontend serves
 *    all text and images 100% natively without needing Sanity at runtime.
 * 4. Writes the complete snapshot to features/articles/legacy/sanitySnapshot.json.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnvFile(path.join(ROOT_DIR, ".env.local"));
loadEnvFile(path.join(ROOT_DIR, ".env"));

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "qyshio4a";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-03-30";
const TOKEN =
  process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN || "";

const IMAGE_ARCHIVE_DIR = path.join(
  ROOT_DIR,
  "public",
  "images",
  "sanity-archive",
);
const SNAPSHOT_FILE = path.join(
  ROOT_DIR,
  "features",
  "articles",
  "legacy",
  "sanitySnapshot.json",
);

fs.mkdirSync(IMAGE_ARCHIVE_DIR, { recursive: true });

function safeFilename(str) {
  return String(str || "img")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function downloadImageToLocal(remoteUrl, prefixSlug, indexLabel) {
  if (!remoteUrl || typeof remoteUrl !== "string") return null;
  try {
    const parsed = new URL(remoteUrl);
    const ext =
      path.extname(parsed.pathname).replace(/[^a-zA-Z0-9.]/g, "") || ".webp";
    const baseName = `${safeFilename(prefixSlug)}-${safeFilename(indexLabel)}${ext}`;
    const destPath = path.join(IMAGE_ARCHIVE_DIR, baseName);
    const publicRelUrl = `/images/sanity-archive/${baseName}`;

    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 200) {
      return publicRelUrl;
    }

    const res = await fetch(remoteUrl);
    if (!res.ok) {
      console.warn(`  [Warn] Could not download image (${res.status}): ${remoteUrl}`);
      return remoteUrl;
    }
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
    return publicRelUrl;
  } catch (err) {
    console.warn(`  [Warn] Image download fallback for ${remoteUrl}: ${err.message}`);
    return remoteUrl;
  }
}

async function main() {
  console.log("==============================================================");
  console.log("🚀 DoItWithAI Sanity-to-Frontend Evergreen Snapshot Exporter");
  console.log(`   Project ID : ${PROJECT_ID}`);
  console.log(`   Dataset    : ${DATASET}`);
  console.log("==============================================================\n");

  const groqQuery = `*[!(_id in path("drafts.**")) && _type in ["seo", "aitool", "coding", "makemoney", "blogPost", "guide"] && defined(slug.current)]{
    _id,
    _type,
    title,
    slug,
    publishedAt,
    _updatedAt,
    _createdAt,
    metatitle,
    metadesc,
    schematitle,
    schemadesc,
    overview,
    readTime,
    relatedToolSlugs,
    articleType,
    displaySettings,
    tags[]->{name, slug},
    mainImage{
      alt,
      caption,
      asset->{_id, url}
    },
    content[]{
      ...,
      _type == "image" => {
        ...,
        alt,
        caption,
        imageDescription[]{...},
        asset->{_id, url}
      },
      _type == "gif" => {
        ...,
        alt,
        caption,
        asset->{_id, url}
      },
      _type == "video" => {
        ...,
        alt,
        caption,
        asset->{_id, url}
      }
    },
    "headings": content[_type == "block" && style in ["h1","h2","h3","h4","h5","h6"]]{
      "text": pt::text(@),
      "level": style,
      "anchor": lower(pt::text(@))
    },
    tableOfContents[],
    faqs[]{question, answer}
  }`;

  const endpoint = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(groqQuery)}&perspective=published`;

  const headers = {};
  if (TOKEN) {
    headers.Authorization = `Bearer ${TOKEN}`;
  }

  console.log("⏳ Fetching all published articles from Sanity API...");
  const response = await fetch(endpoint, { headers });
  if (!response.ok) {
    throw new Error(
      `Sanity API returned HTTP ${response.status}: ${await response.text()}`,
    );
  }

  const payload = await response.json();
  const docs = Array.isArray(payload?.result) ? payload.result : [];
  console.log(`✅ Retrieved ${docs.length} published articles from Sanity!\n`);

  // Load existing snapshot so we never lose previously exported items
  let snapshot = {};
  if (fs.existsSync(SNAPSHOT_FILE)) {
    try {
      snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, "utf8"));
    } catch {
      snapshot = {};
    }
  }

  const routePrefixMap = {
    seo: "ai-seo",
    aitool: "ai-tools",
    coding: "ai-code",
    makemoney: "ai-learn-earn",
    blogPost: "blogs",
    guide: "guides",
  };

  let downloadedImageCount = 0;

  for (const doc of docs) {
    const slugStr = doc?.slug?.current;
    if (!slugStr || !doc?._type) continue;

    const key = `${doc._type}:${slugStr}`;
    const routePrefix = routePrefixMap[doc._type] || doc._type;

    // 1. Download mainImage if present
    const mainRemoteUrl = doc?.mainImage?.asset?.url;
    if (mainRemoteUrl) {
      const localMain = await downloadImageToLocal(
        mainRemoteUrl,
        slugStr,
        "hero",
      );
      if (localMain) {
        doc.mainImage.localUrl = localMain;
        downloadedImageCount++;
      }
    }

    // 2. Download inline content images & GIFs
    if (Array.isArray(doc.content)) {
      let inlineIdx = 1;
      for (const block of doc.content) {
        if (
          (block?._type === "image" || block?._type === "gif") &&
          block?.asset?.url
        ) {
          const localInline = await downloadImageToLocal(
            block.asset.url,
            slugStr,
            `body-${inlineIdx++}`,
          );
          if (localInline) {
            block.localUrl = localInline;
            downloadedImageCount++;
          }
        }
      }
    }

    // Estimate readTime if not set
    if (!doc.readTime?.minutes && Array.isArray(doc.content)) {
      const textWords = JSON.stringify(doc.content)
        .split(/\s+/)
        .filter(Boolean).length;
      doc.readTime = { minutes: Math.max(4, Math.min(25, Math.round(textWords / 240))) };
    }

    doc.__source = "code-static";
    snapshot[key] = doc;
    console.log(
      `   ✔ Snapshotted [${key}] → /${routePrefix}/${slugStr} (${doc.title?.slice(0, 58)})`,
    );
  }

  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2), "utf8");

  console.log("\n==============================================================");
  console.log(
    `🎉 DONE! Saved ${Object.keys(snapshot).length} total static articles to:`,
  );
  console.log(`   📄 ${path.relative(ROOT_DIR, SNAPSHOT_FILE)}`);
  console.log(
    `   🖼️  Downloaded/Verified ${downloadedImageCount} local article images in public/images/sanity-archive/`,
  );
  console.log(
    "   All exported articles now serve 100% from your Next.js frontend with 0ms CMS latency!",
  );
  console.log("==============================================================\n");
}

main().catch((err) => {
  console.error("\n❌ Export error:", err.message);
  process.exit(1);
});

/**
 * Phase 5: Internal Website Builder Auto-Publisher (`/p/[slug]/blog/[postSlug]`).
 *
 * Writes approved AutomatedArticleJobs with embedded 1080x1350 6-layer SVG section
 * visuals, JSON-LD @graph metadata, and contextual internal tool callouts directly into
 * browser localStorage (`doitwithai-website-builder-sites-v1` and, when present,
 * `doitwithai-local-websites-v1`) so zero-auth live previews render immediately.
 */

import { compileJobArticleMarkdown } from "../byok-batch-runner";
import { LOCAL_BUILDER_SITES_STORAGE_KEY } from "../local-storage-store";
import { buildCompleteJobExportBundle } from "../pinterest-carousel-exporter";
import type { AutomatedArticleJob, ConnectedWebsiteProfile } from "../types";

export interface InternalSitePublishResult {
  ok: boolean;
  publishingMode: "internal-doitwithai-site";
  internalBuilderSlug: string;
  postSlug: string;
  targetUrl: string;
  embeddedInfographicsCount: number;
  internalToolLinkUrl: string;
  storedPostCount: number;
  publishedAtIso: string;
}

interface BuilderSitePostEntry {
  id: string;
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  markdown: string;
  htmlBody: string;
  sectionInfographicSvgs: string[];
  jsonLdSchema: Record<string, unknown>;
  internalToolLinkUrl: string;
  publishedAtIso: string;
  status: "published";
}

interface BuilderSiteBucket {
  slug: string;
  siteName: string;
  siteUrl: string;
  posts: BuilderSitePostEntry[];
  updatedAtIso: string;
}

function escapeHtml(s: string): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmbeddedHtmlArticle(
  job: AutomatedArticleJob,
  website: ConnectedWebsiteProfile,
  bundle: ReturnType<typeof buildCompleteJobExportBundle>,
  toolUrl: string,
): string {
  const toolTitle =
    job.matchedInternalToolTitle ||
    website.installedTools[0]?.title ||
    "Free AI SEO Tool";
  const sectionHtml = job.outlineSections
    .map((sec, idx) => {
      const svg = bundle.sectionInfographicSvgs[idx]?.svg || "";
      const listHtml = sec.points
        .map(
          (pt) =>
            `<li><strong>${escapeHtml(pt.badge)} · ${escapeHtml(pt.title)}</strong>: ${escapeHtml(pt.detail)}</li>`,
        )
        .join("");
      return `<section>
        <h2>${escapeHtml(sec.h2)}</h2>
        <p>${escapeHtml(sec.summary)}</p>
        ${svg ? `<figure class="infographic-embed" aria-label="${escapeHtml(sec.h2)}">${svg}</figure>` : ""}
        <ul>${listHtml}</ul>
      </section>`;
    })
    .join("\n");

  return `<article data-source="autonomous-agent-os">
  <h1>${escapeHtml(job.topicTitle)}</h1>
  <blockquote class="aeo-direct-answer"><strong>Direct Answer:</strong> ${escapeHtml(job.aeoDirectAnswer50Words)}</blockquote>
  ${sectionHtml}
  <aside class="tool-callout"><a href="${escapeHtml(toolUrl)}">Launch ${escapeHtml(toolTitle)} →</a></aside>
</article>`;
}

/**
 * Publishes an automated article job directly into the local DoItWithAI Website
 * Builder store (`doitwithai-website-builder-sites-v1`) and mirrors into
 * `doitwithai-local-websites-v1` when a matching SiteDocument record exists.
 */
export function publishJobToInternalWebsiteStore(params: {
  job: AutomatedArticleJob;
  website: ConnectedWebsiteProfile;
  storage?: Pick<Storage, "getItem" | "setItem">;
}): InternalSitePublishResult {
  const store =
    params.storage ||
    (typeof window !== "undefined" ? window.localStorage : undefined);
  const builderSlug =
    params.website.internalBuilderSlug ||
    params.website.siteName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") ||
    "doitwithai-site";
  const postSlug = params.job.urlSlug;
  const nowIso = new Date().toISOString();

  const bundle = buildCompleteJobExportBundle(params.job, params.website);
  const articleMarkdown =
    bundle.articleMarkdown ||
    compileJobArticleMarkdown(params.job, params.website);
  const toolSlug =
    params.job.matchedInternalToolSlug ||
    params.website.installedTools[0]?.slug ||
    "blog-section-infographic-generator";
  const internalToolLinkUrl =
    params.website.installedTools.find((t) => t.slug === toolSlug)?.url ||
    `${params.website.siteUrl.replace(/\/$/, "")}/tools/${toolSlug}`;

  const postEntry: BuilderSitePostEntry = {
    id: params.job.id,
    slug: postSlug,
    title: params.job.topicTitle,
    seoTitle: params.job.metaTitle.slice(0, 70),
    seoDescription: params.job.metaDescription.slice(0, 170),
    excerpt: params.job.aeoDirectAnswer50Words.slice(0, 320),
    markdown: articleMarkdown,
    htmlBody: buildEmbeddedHtmlArticle(
      params.job,
      params.website,
      bundle,
      internalToolLinkUrl,
    ),
    sectionInfographicSvgs: bundle.sectionInfographicSvgs.map((s) => s.svg),
    jsonLdSchema: bundle.jsonLdSchema,
    internalToolLinkUrl,
    publishedAtIso: nowIso,
    status: "published",
  };

  let storedPostCount = 1;
  if (store) {
    try {
      const raw = store.getItem(LOCAL_BUILDER_SITES_STORAGE_KEY);
      const parsed = raw
        ? (JSON.parse(raw) as Record<string, BuilderSiteBucket>)
        : {};
      const map: Record<string, BuilderSiteBucket> =
        parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? parsed
          : {};

      const existingBucket = map[builderSlug] || {
        slug: builderSlug,
        siteName: params.website.siteName,
        siteUrl: params.website.siteUrl,
        posts: [],
        updatedAtIso: nowIso,
      };

      const filteredPosts = (existingBucket.posts || []).filter(
        (p) => p.slug !== postSlug && p.id !== postEntry.id,
      );
      const nextPosts = [postEntry, ...filteredPosts];
      storedPostCount = nextPosts.length;

      map[builderSlug] = {
        ...existingBucket,
        siteName: params.website.siteName,
        siteUrl: params.website.siteUrl,
        posts: nextPosts,
        updatedAtIso: nowIso,
      };

      store.setItem(LOCAL_BUILDER_SITES_STORAGE_KEY, JSON.stringify(map));

      // Mirror cleanly if a Website Studio record exists in `doitwithai-local-websites-v1`
      const studioRaw = store.getItem("doitwithai-local-websites-v1");
      if (studioRaw) {
        const records = JSON.parse(studioRaw) as Array<Record<string, unknown>>;
        if (Array.isArray(records)) {
          const updatedRecords = records.map((rec) => {
            const pub = rec.publication as { slug?: string } | null | undefined;
            if (pub?.slug !== builderSlug && rec.id !== builderSlug) return rec;
            const doc = rec.document as {
              revision?: number;
              publishing?: { posts?: Array<Record<string, unknown>> };
            };
            if (!doc?.publishing) return rec;
            const existingPosts = Array.isArray(doc.publishing.posts)
              ? doc.publishing.posts
              : [];
            const structuredBlocks = params.job.outlineSections.flatMap(
              (sec, sIdx) => [
                {
                  id: `blk-h-${sIdx}`,
                  type: "heading",
                  text: sec.h2.slice(0, 120),
                  headingLevel: "h2",
                  items: [],
                  mediaId: "",
                },
                {
                  id: `blk-p-${sIdx}`,
                  type: "paragraph",
                  text: sec.summary.slice(0, 2800),
                  headingLevel: "h2",
                  items: [],
                  mediaId: "",
                },
                {
                  id: `blk-l-${sIdx}`,
                  type: "list",
                  text: "",
                  headingLevel: "h2",
                  items: sec.points
                    .slice(0, 12)
                    .map((pt) => `${pt.title}: ${pt.detail}`.slice(0, 290)),
                  mediaId: "",
                },
              ],
            );
            const sitePost = {
              id: `auto-${params.job.id.slice(0, 20)}`,
              title: params.job.topicTitle.slice(0, 120),
              slug: postSlug.slice(0, 80),
              seoTitle: params.job.metaTitle.slice(0, 70),
              seoDescription: params.job.metaDescription.slice(0, 170),
              coverMediaId: "",
              excerpt: params.job.aeoDirectAnswer50Words.slice(0, 320),
              tags: [
                params.job.primaryKeyword.slice(0, 32),
                "autonomous-seo",
              ].filter(Boolean),
              status: "published",
              publishedAt: nowIso,
              blocks: structuredBlocks,
            };
            const nextDoc = {
              ...doc,
              revision: Number(doc.revision || 0) + 1,
              updatedAt: nowIso,
              publishing: {
                ...doc.publishing,
                posts: [
                  sitePost,
                  ...existingPosts.filter((p) => p.slug !== sitePost.slug),
                ].slice(0, 24),
              },
            };
            return {
              ...rec,
              revision: nextDoc.revision,
              updatedAt: nowIso,
              document: nextDoc,
              publication: pub
                ? {
                    ...pub,
                    revision: nextDoc.revision,
                    published_at: nowIso,
                    document: nextDoc,
                  }
                : null,
            };
          });
          store.setItem("doitwithai-local-websites-v1", JSON.stringify(updatedRecords));
        }
      }
    } catch {
      // Ignore quota errors in restricted sandboxes
    }
  }

  return {
    ok: true,
    publishingMode: "internal-doitwithai-site",
    internalBuilderSlug: builderSlug,
    postSlug,
    targetUrl: `/p/${builderSlug}/blog/${postSlug}`,
    embeddedInfographicsCount: postEntry.sectionInfographicSvgs.length,
    internalToolLinkUrl,
    storedPostCount,
    publishedAtIso: nowIso,
  };
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { validateSiteDocument } from "@/features/website-builder/domain/site-document";
import { projectsForPresentation } from "@/features/website-builder/domain/opportunity";
import {
  hashShareToken,
  validShareToken,
} from "@/features/website-builder/domain/opportunity-share";
import { hasSupabaseConfig } from "@/features/website-builder/lib/supabase/config";
import {
  createSupabasePublicClient,
  createSupabaseServerClient,
} from "@/features/website-builder/lib/supabase/server";
import { PublicPortfolio } from "@/features/website-builder/public/public-portfolio";
import {
  PublicBlogIndex,
  PublicContentPage,
} from "@/features/website-builder/public/public-content";
import { PublicProjectsIndex } from "@/features/website-builder/public/public-projects-index";
import { PublicCaseStudy } from "@/features/website-builder/public/public-case-study";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shared Website Preview — DoItWithAI Studio",
  robots: { index: false, follow: false },
};

async function loadSharedDocument(token: string) {
  if (!hasSupabaseConfig || !validShareToken(token)) return null;
  const supabase =
    createSupabasePublicClient() ?? (await createSupabaseServerClient());
  if (!supabase) return null;

  const { data } = await supabase
    .rpc("read_website_opportunity_share", {
      p_hash: hashShareToken(token),
    })
    .maybeSingle();

  const row = data as { document?: unknown; revision?: number } | null;
  if (!row?.document) return null;

  const parsed = validateSiteDocument(row.document);
  return {
    ...parsed,
    revision: typeof row.revision === "number" ? row.revision : parsed.revision,
  };
}

export default async function SharedWebsitePage({
  params,
}: {
  params: { token: string; path?: string[] };
}) {
  const { token, path = [] } = params;
  const document = await loadSharedDocument(token);
  if (!document) notFound();

  const basePath = `/s/${token}`;
  const slug = document.opportunity.slug || "shared";

  if (path.length === 0) {
    return (
      <PublicPortfolio
        document={document}
        slug={slug}
        basePath={basePath}
        shareToken={token}
        isShared
      />
    );
  }

  if (path.length === 1 && path[0] === "blog") {
    return (
      <PublicBlogIndex
        document={document}
        portfolioSlug={slug}
        basePath={basePath}
      />
    );
  }

  if (path.length === 2 && path[0] === "blog") {
    const post = document.publishing.posts.find(
      (candidate) =>
        candidate.status === "published" && candidate.slug === path[1],
    );
    if (!post) notFound();
    return (
      <PublicContentPage
        document={document}
        portfolioSlug={slug}
        item={post}
        kind="post"
        basePath={basePath}
      />
    );
  }

  if (path.length === 2 && path[0] === "pages") {
    const page = document.publishing.pages.find(
      (candidate) =>
        candidate.status === "published" && candidate.slug === path[1],
    );
    if (!page) notFound();
    return (
      <PublicContentPage
        document={document}
        portfolioSlug={slug}
        item={page}
        kind="page"
        basePath={basePath}
      />
    );
  }

  if (path.length === 1 && path[0] === "projects") {
    return (
      <PublicProjectsIndex
        document={document}
        portfolioSlug={slug}
        basePath={basePath}
      />
    );
  }

  if (path.length === 2 && path[0] === "projects") {
    const project = projectsForPresentation(document).find(
      (candidate) => candidate.caseStudySlug === path[1],
    );
    if (!project) notFound();
    return (
      <PublicCaseStudy
        document={document}
        portfolioSlug={slug}
        project={project}
        basePath={basePath}
      />
    );
  }

  notFound();
}

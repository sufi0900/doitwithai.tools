import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/features/website-builder/lib/supabase/config";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";
import { siteDocumentSchema } from "@/features/website-builder/domain/site-document";
import { UNIFIED_WEBSITE_TEMPLATES } from "@/features/website-builder/ecosystem-bridge";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

export async function GET() {
  if (!hasSupabaseConfig) {
    return NextResponse.json({
      authenticated: false,
      userEmail: null,
      websites: [],
      internalLinks: [],
      storageConfigured: false,
    });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({
      authenticated: false,
      userEmail: null,
      websites: [],
      internalLinks: [],
      storageConfigured: false,
    });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({
      authenticated: false,
      userEmail: null,
      websites: [],
      internalLinks: [],
      storageConfigured: true,
    });
  }

  const { data: rows, error } = await supabase
    .from("website_projects")
    .select(
      "id, name, creation_mode, template_id, revision, document, updated_at, variant_of_project_id",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const projects = (rows ?? []).filter(
    (row) => !row.variant_of_project_id,
  ) as Array<{
    id: string;
    name: string;
    creation_mode: string;
    template_id: string | null;
    revision: number;
    document: unknown;
    updated_at: string;
  }>;

  const projectIds = projects.map((p) => p.id);
  const pubMap = new Map<
    string,
    { slug: string; revision: number; published_at: string }
  >();

  if (projectIds.length > 0) {
    const { data: pubs } = await supabase
      .from("website_publications")
      .select("project_id, slug, revision, published_at")
      .in("project_id", projectIds)
      .is("superseded_at", null);

    for (const pub of pubs ?? []) {
      pubMap.set(pub.project_id as string, {
        slug: pub.slug as string,
        revision: pub.revision as number,
        published_at: pub.published_at as string,
      });
    }
  }

  const internalLinks: Array<{
    siteProjectId: string;
    siteName: string;
    publicSlug: string;
    postId: string;
    title: string;
    slug: string;
    url: string;
    tags: string[];
  }> = [];

  const websites = projects.map((row) => {
    const parsed = siteDocumentSchema.safeParse(row.document);
    const doc = parsed.success ? parsed.data : null;
    const pub = pubMap.get(row.id);
    const templateId = doc?.design.template ?? row.template_id ?? "doitwithai-flagship";
    const templateMeta = UNIFIED_WEBSITE_TEMPLATES.find(
      (t) => t.id === templateId,
    );
    const posts = doc?.publishing.posts ?? [];
    const pages = doc?.publishing.pages ?? [];
    const publishedPosts = posts.filter((post) => post.status === "published");

    const publishedPages = pages.filter((page) => page.status === "published");
    const seoHealthScore = Math.min(
      100,
      40 +
        (pub?.slug ? 20 : 0) +
        (doc?.identity.intro?.trim() ? 15 : 0) +
        (publishedPosts.some(
          (post) =>
            Boolean(post.seoTitle?.trim() && post.seoDescription?.trim()),
        )
          ? 25
          : publishedPosts.length > 0
            ? 15
            : 0),
    );

    if (pub?.slug) {
      for (const post of publishedPosts) {
        internalLinks.push({
          siteProjectId: row.id,
          siteName: row.name,
          publicSlug: pub.slug,
          postId: post.id,
          title: post.title,
          slug: post.slug,
          url: `/p/${pub.slug}/blog/${post.slug}`,
          tags: post.tags ?? [],
        });
      }
    }

    return {
      projectId: row.id,
      name: row.name,
      templateId,
      templateName: templateMeta?.name ?? templateId.replaceAll("-", " "),
      templateCategory: templateMeta?.category ?? "blog-editorial",
      mode:
        templateMeta?.mode ??
        (doc?.scene.family === "professional-2d" ||
        doc?.scene.family === "doitwithai-editorial-grid"
          ? "2d"
          : "3d"),
      publicSlug: pub?.slug ?? null,
      customDomain: null,
      isPublished: Boolean(pub?.slug),
      publishedAt: pub?.published_at ?? null,
      publishedPostCount: publishedPosts.length,
      draftPostCount: posts.filter((post) => post.status !== "published").length,
      publishedPageCount: publishedPages.length,
      totalPageCount: pages.length,
      revision: row.revision,
      updatedAt: row.updated_at,
      visitorAgentEnabled: Boolean(doc?.visitor.enabled),
      seoHealthScore,
    };
  });

  return NextResponse.json({
    authenticated: true,
    userEmail: user.email ?? null,
    websites,
    internalLinks,
    storageConfigured: true,
  });
}

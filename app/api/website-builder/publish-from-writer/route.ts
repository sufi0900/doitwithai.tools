import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseConfig } from "@/features/website-builder/lib/supabase/config";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";
import { validateSiteDocument } from "@/features/website-builder/domain/site-document";
import {
  applyUpsertFromWriterStudioCommand,
  upsertFromWriterStudioCommandSchema,
} from "@/features/website-builder/domain/writer-publishing-commands";
import {
  buildPublicationSnapshot,
  homePublicationGroups,
  missingPublicationFields,
} from "@/features/website-builder/domain/publication-selection";

export const maxDuration = 30;

const requestSchema = z.object({
  websiteId: z.string().min(1),
  payload: upsertFromWriterStudioCommandSchema,
  publishImmediately: z.boolean().optional(),
  slug: z.string().trim().min(3).max(64).optional(),
});

export async function POST(request: Request) {
  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase storage is not configured on this deployment." },
      { status: 503 },
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database client unavailable." },
      { status: 503 },
    );
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { error: "Sign in with Google to publish articles to your website." },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid article sync payload.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const { websiteId, payload } = parsed.data;
  const wantPublish = Boolean(
    parsed.data.publishImmediately ?? payload.publishImmediately,
  );

  const { data: project, error: projectError } = await supabase
    .from("website_projects")
    .select("id, owner_id, name, revision, document")
    .eq("id", websiteId)
    .maybeSingle();

  if (projectError || !project) {
    return NextResponse.json(
      { error: "Website project not found." },
      { status: 404 },
    );
  }
  if (project.owner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let currentDoc;
  try {
    currentDoc = {
      ...validateSiteDocument(project.document),
      projectId: project.id as string,
      revision: project.revision as number,
    };
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? `Website draft validation failed: ${err.message}`
            : "Website draft is invalid.",
      },
      { status: 400 },
    );
  }

  let updatedDoc;
  try {
    updatedDoc = applyUpsertFromWriterStudioCommand(currentDoc, {
      ...payload,
      publishImmediately: wantPublish,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not convert article.",
      },
      { status: 400 },
    );
  }

  const syncedPost = updatedDoc.publishing.posts.find(
    (post) => post.sourceArticleProjectId === payload.sourceArticleProjectId,
  );
  if (!syncedPost) {
    return NextResponse.json(
      { error: "Synced post was not found after transformation." },
      { status: 500 },
    );
  }

  const { data: nextRevision, error: saveError } = await supabase.rpc(
    "save_website_project",
    {
      p_project_id: websiteId,
      p_document: updatedDoc,
      p_expected_revision: project.revision as number,
      p_source: "writer-studio-bridge",
    },
  );

  if (saveError || typeof nextRevision !== "number") {
    return NextResponse.json(
      {
        error: saveError?.message?.includes("revision_conflict")
          ? "Another tab modified this website. Reload and try syncing again."
          : saveError?.message || "Failed to save website draft.",
      },
      { status: 409 },
    );
  }

  const savedDoc = { ...updatedDoc, revision: nextRevision };

  const { data: live } = await supabase
    .from("website_publications")
    .select("id, slug, revision, document")
    .eq("project_id", websiteId)
    .is("superseded_at", null)
    .maybeSingle();

  const targetSlug = (live?.slug as string | undefined) || parsed.data.slug;

  if (!wantPublish || !targetSlug) {
    return NextResponse.json({
      ok: true,
      published: false,
      projectId: websiteId,
      postId: syncedPost.id,
      postSlug: syncedPost.slug,
      revision: nextRevision,
      liveUrl: `/do-it-ai/website-studio/${websiteId}`,
      message:
        wantPublish && !targetSlug
          ? `Saved "${syncedPost.title}" to "${project.name}". Open Website Studio once to choose your /p/[slug] and take the site live.`
          : `Saved "${syncedPost.title}" as a draft in "${project.name}".`,
    });
  }

  const missing = missingPublicationFields(syncedPost, "post", savedDoc);
  if (missing.length > 0) {
    return NextResponse.json({
      ok: true,
      published: false,
      projectId: websiteId,
      postId: syncedPost.id,
      postSlug: syncedPost.slug,
      revision: nextRevision,
      liveUrl: `/do-it-ai/website-studio/${websiteId}`,
      message: `Saved draft in "${project.name}", but could not auto-publish because fields are incomplete: ${missing.join(", ")}.`,
    });
  }

  const liveDoc = live?.document
    ? validateSiteDocument(live.document)
    : undefined;

  const selection = liveDoc
    ? [`post:${syncedPost.id}`]
    : [...homePublicationGroups.map(String), `post:${syncedPost.id}`];

  let snapshot;
  try {
    snapshot = buildPublicationSnapshot(savedDoc, liveDoc, selection, {
      kind: "post",
      id: syncedPost.id,
      status: "published",
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not build live publication snapshot.",
      },
      { status: 400 },
    );
  }

  const { data: pubData, error: pubError } = await supabase.rpc(
    "publish_website_snapshot",
    {
      p_project_id: websiteId,
      p_slug: targetSlug,
      p_expected_revision: nextRevision,
      p_snapshot: snapshot,
      p_expected_publication_id: live?.id ?? null,
    },
  );

  if (pubError) {
    return NextResponse.json(
      {
        error:
          pubError.message ||
          "Saved to draft, but failed to publish snapshot.",
      },
      { status: 400 },
    );
  }

  revalidatePath(`/p/${targetSlug}`);
  revalidatePath(`/p/${targetSlug}/blog`);
  revalidatePath(`/p/${targetSlug}/blog/${syncedPost.slug}`);

  return NextResponse.json({
    ok: true,
    published: true,
    projectId: websiteId,
    postId: syncedPost.id,
    postSlug: syncedPost.slug,
    publicSlug: targetSlug,
    publication: Array.isArray(pubData) ? pubData[0] : pubData,
    liveUrl: `/p/${targetSlug}/blog/${syncedPost.slug}`,
  });
}

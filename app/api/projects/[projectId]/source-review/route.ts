import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";
import { validateSiteDocument } from "@/features/website-builder/domain/site-document";
import { acceptSourceChanges, reviewSourceChanges, type SourceField } from "@/features/website-builder/domain/opportunity-source-review";

export const maxDuration = 30;


const applySchema = z.object({ expectedRevision: z.number().int().nonnegative(), sourceRevision: z.number().int().nonnegative(), selected: z.array(z.string().max(120)).min(1).max(12) }).strict();
type Context = { params: { projectId: string } };

async function contextFor({ params }: Context) {
  const { projectId } = params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: variant } = await supabase.from("website_projects").select("id,revision,document,variant_of_project_id").eq("id", projectId).eq("owner_id", user.id).maybeSingle();
  if (!variant?.variant_of_project_id) return null;
  const { data: source } = await supabase.from("website_projects").select("id,revision,document,variant_of_project_id").eq("id", variant.variant_of_project_id).eq("owner_id", user.id).maybeSingle();
  if (!source || source.variant_of_project_id) return null;
  const variantDocument = validateSiteDocument(variant.document);
  const sourceDocument = validateSiteDocument(source.document);
  if (variantDocument.projectId !== projectId || sourceDocument.projectId !== source.id || variantDocument.revision !== variant.revision || sourceDocument.revision !== source.revision) return null;
  return { supabase, projectId, variant, source, variantDocument, sourceDocument };
}

export async function GET(_: Request, route: Context) {
  const context = await contextFor(route);
  if (!context) return NextResponse.json({ error: "Opportunity source not found." }, { status: 404 });
  try { return NextResponse.json({ sourceRevision: context.source.revision, variantRevision: context.variant.revision, lastReviewedRevision: context.variantDocument.opportunity.sourceRevision,
    changes: reviewSourceChanges(context.variantDocument, context.sourceDocument) }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Opportunity source does not match." }, { status: 409 }); }
}

export async function POST(request: Request, route: Context) {
  const input = applySchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Select valid source changes to review." }, { status: 400 });
  const context = await contextFor(route);
  if (!context) return NextResponse.json({ error: "Opportunity source not found." }, { status: 404 });
  if (context.variant.revision !== input.data.expectedRevision || context.source.revision !== input.data.sourceRevision) {
    return NextResponse.json({ error: "The source or opportunity changed. Review the latest comparison before applying." }, { status: 409 });
  }
  let next;
  try { next = acceptSourceChanges(context.variantDocument, context.sourceDocument, input.data.selected as SourceField[]); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not validate source changes." }, { status: 400 }); }
  const { data, error } = await context.supabase.rpc("apply_website_source_review", { p_variant_id: context.projectId, p_source_id: context.source.id, p_source_revision: context.source.revision, p_expected_revision: context.variant.revision, p_document: next });
  if (error) return NextResponse.json({ error: error.message.includes("revision_conflict") ? "The source or opportunity changed. Reload before applying updates." : "Could not save the selected updates. Apply migration 011." }, { status: error.message.includes("revision_conflict") ? 409 : 500 });
  return NextResponse.json({ revision: data, applied: input.data.selected.length });
}

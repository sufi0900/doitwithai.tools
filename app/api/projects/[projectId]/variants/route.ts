import { NextResponse } from "next/server";
import { z } from "zod";
import { validateSiteDocument } from "@/features/website-builder/domain/site-document";
import { createOpportunityVariant } from "@/features/website-builder/domain/opportunity-variant";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";

export const maxDuration = 30;


const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(120),
  brief: z.string().trim().min(20).max(2_400),
  audience: z.string().trim().max(160).default(""),
  visibility: z.enum(["private", "shared", "public"]).default("private"),
});

/** Creates an isolated, revisioned opportunity variant from an owned canonical project. */
export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const input = createSchema.safeParse(await request.json());
  if (!input.success) return NextResponse.json({ error: "Add a name, a clear title, and an opportunity brief of at least 20 characters." }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: canonical, error } = await supabase
    .from("website_projects")
    .select("id,document,revision,variant_of_project_id")
    .eq("id", projectId)
    .single();
  if (error || !canonical) return NextResponse.json({ error: "Canonical portfolio not found." }, { status: 404 });
  if (canonical.variant_of_project_id) return NextResponse.json({ error: "Create opportunity variants from the canonical portfolio, not from another variant." }, { status: 409 });

  const variantId = crypto.randomUUID();
  const source = validateSiteDocument(canonical.document);
  const generated = createOpportunityVariant(source, { variantOfProjectId: projectId, name: input.data.name, opportunityType: "custom", audience: input.data.audience, objective: input.data.brief, confidentiality: input.data.visibility });
  const variant = validateSiteDocument({ ...generated, projectId: variantId, opportunity: { ...generated.opportunity, title: input.data.title } });

  // The RPC performs the final owner check and records revision zero atomically.
  const { data: createdId, error: createError } = await supabase.rpc("create_website_opportunity_variant", {
    p_canonical_project_id: projectId,
    p_variant_id: variantId,
    p_name: input.data.name,
    p_document: variant,
  });
  if (createError || !createdId) {
    const nested = createError?.message.includes("variants_cannot_be_nested");
    return NextResponse.json({ error: nested ? "Variants cannot be nested." : createError?.message ?? "Could not create the opportunity variant." }, { status: nested ? 409 : 500 });
  }
  // Keep the document id authoritative even if a database implementation returns a generated id.
  if (createdId !== variantId) return NextResponse.json({ error: "Variant identity could not be confirmed. No change was opened." }, { status: 500 });
  return NextResponse.json({ projectId: createdId }, { status: 201 });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";
import { buildGuidedDocument, getTemplate } from "@/features/website-builder/domain/templates";
import { siteDocumentSchema } from "@/features/website-builder/domain/site-document";
import { guidedCreateSchema, describeCreationIssue } from "@/features/website-builder/domain/project-creation";

export const maxDuration = 30;


const createSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("template"), templateId: z.string().min(1), projectName: z.string().trim().min(1).max(80) }),
  guidedCreateSchema,
  z.object({ mode: z.literal("demo"), projectName: z.string().trim().min(1).max(80), document: siteDocumentSchema }),
]);

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("website_projects").select("id,name,creation_mode,template_id,revision,created_at,updated_at,variant_of_project_id,source_revision,opportunity_status").order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projects: data });
}

export async function POST(request: Request) {
  const input = createSchema.safeParse(await request.json());
  if (!input.success) return NextResponse.json({ error: describeCreationIssue(input.error.issues[0]), issues: input.error.issues }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const projectId = crypto.randomUUID();
  const document = input.data.mode === "template"
    ? { ...getTemplate(input.data.templateId)?.document, projectId, updatedAt: new Date().toISOString() }
    : input.data.mode === "guided" ? buildGuidedDocument({
      ...input.data,
      projectId,
      style: input.data.interview.tone === "structured" ? "technical" : input.data.interview.tone === "minimal" ? "minimal" : "creative",
    }) : { ...input.data.document, projectId, revision: 0, updatedAt: new Date().toISOString() };
  if (!document) return NextResponse.json({ error: "Template not found" }, { status: 404 });
  const row = { id: projectId, owner_id: user.id, name: input.data.projectName, creation_mode: input.data.mode === "demo" ? "guided" : input.data.mode, template_id: input.data.mode === "template" || input.data.mode === "guided" ? input.data.templateId ?? null : null, document, revision: 0 };
  const { error } = await supabase.from("website_projects").insert(row);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { error: revisionError } = await supabase.from("website_revisions").insert({ project_id: projectId, owner_id: user.id, revision: 0, document, source: "created" });
  if (revisionError) return NextResponse.json({ error: revisionError.message }, { status: 500 });
  return NextResponse.json({ projectId }, { status: 201 });
}

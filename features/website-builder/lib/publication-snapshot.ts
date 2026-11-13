import { validateSiteDocument } from "@/features/website-builder/domain/site-document";
import { createSupabasePublicClient, createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";

export async function getPublicationSnapshot(slug: string) {
  const supabase = createSupabasePublicClient() ?? (await createSupabaseServerClient());
  if (!supabase) return null;
  const { data } = await supabase.from("website_publications").select("document,revision,published_at").eq("slug", slug).is("superseded_at", null).maybeSingle();
  if (!data) return null;
  const document = validateSiteDocument(data.document);
  if (document.opportunity.status !== "canonical" && document.opportunity.visibility !== "public") return null;
  return { document: { ...document, revision: data.revision }, publishedAt: data.published_at };
}

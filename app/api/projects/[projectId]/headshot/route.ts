import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";

export const maxDuration = 30;


const MAX_BYTES = 3 * 1024 * 1024;
const allowed = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);

function signatureMatches(type: string, bytes: Uint8Array) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: project } = await supabase.from("website_projects").select("id").eq("id", projectId).eq("owner_id", user.id).maybeSingle();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const form = await request.formData();
  const file = form.get("headshot");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  const extension = allowed.get(file.type);
  if (!extension) return NextResponse.json({ error: "Use a JPG, PNG, or WebP image." }, { status: 415 });
  if (file.size < 1 || file.size > MAX_BYTES) return NextResponse.json({ error: "The image must be smaller than 3 MB." }, { status: 413 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!signatureMatches(file.type, bytes)) return NextResponse.json({ error: "The file content does not match its image type." }, { status: 415 });
  const path = `${user.id}/${projectId}/headshot-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("website-media").upload(path, bytes, { contentType: file.type, cacheControl: "3600", upsert: false });
  if (error) {
    const blocked = /row-level security|permission|policy/i.test(error.message);
    return NextResponse.json({ error: blocked ? "Supabase blocked the upload. Run migration 005_fix_portfolio_media_policies.sql, then sign out and back in." : error.message }, { status: blocked ? 403 : 500 });
  }
  const { data } = supabase.storage.from("website-media").getPublicUrl(path);
  return NextResponse.json({ url: `${data.publicUrl}?v=${Date.now()}` });
}

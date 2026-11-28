import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";
import { deriveImageAlt } from "@/features/website-builder/domain/media";

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
  const file = form.get("image");
  const suppliedAlt = String(form.get("alt") ?? "").trim();
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  if (suppliedAlt.length > 180) return NextResponse.json({ error: "Alternative text must be 180 characters or fewer." }, { status: 400 });
  const extension = allowed.get(file.type);
  if (!extension) return NextResponse.json({ error: "Use a JPG, PNG, or WebP image." }, { status: 415 });
  if (file.size < 1 || file.size > MAX_BYTES) return NextResponse.json({ error: "The image must be smaller than 3 MB." }, { status: 413 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!signatureMatches(file.type, bytes)) return NextResponse.json({ error: "The file content does not match its image type." }, { status: 415 });
  const alt = deriveImageAlt(file.name, suppliedAlt);

  const id = crypto.randomUUID();
  const storagePath = `${user.id}/${projectId}/library/${id}.${extension}`;
  const { error } = await supabase.storage.from("website-media").upload(storagePath, bytes, { contentType: file.type, cacheControl: "3600", upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: /row-level security|permission|policy/i.test(error.message) ? 403 : 500 });
  const { data } = supabase.storage.from("website-media").getPublicUrl(storagePath);
  return NextResponse.json({ asset: { id, url: data.publicUrl, storagePath, alt, createdAt: new Date().toISOString() } });
}

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";

export const maxDuration = 60;


export const runtime = "nodejs";
export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { data: project } = await supabase.from("website_projects").select("id").eq("id", projectId).eq("owner_id", user.id).maybeSingle();
  if (!project) return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size < 1 || file.size > 2_000_000) return NextResponse.json({ error: "Choose a file smaller than 2 MB." }, { status: 400 });
  const format = file.name.toLowerCase().split(".").pop();
  if (!["txt", "md", "pdf", "docx"].includes(format ?? "")) return NextResponse.json({ error: "Use TXT, MD, PDF or DOCX." }, { status: 415 });
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    let text: string;
    if (format === "pdf") {
      if (buffer.subarray(0, 4).toString() !== "%PDF") throw new Error("Invalid PDF");
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      try { text = (await parser.getText()).text; } finally { await parser.destroy(); }
    } else if (format === "docx") {
      if (buffer.subarray(0, 2).toString() !== "PK") throw new Error("Invalid DOCX");
      const mammoth = await import("mammoth");
      text = (await mammoth.extractRawText({ buffer })).value;
    } else text = buffer.toString("utf8");
    const excerpts = text.replace(/\r/g, "").split(/\n\s*\n|(?<=[.!?])\s+(?=[A-Z])/).map((part) => part.replace(/\s+/g, " ").trim()).filter((part) => part.length >= 10).map((part) => part.slice(0, 900)).slice(0, 24);
    if (!excerpts.length) return NextResponse.json({ error: "No reviewable text found in this document." }, { status: 422 });
    return NextResponse.json({ excerpts, source: file.name.slice(0, 120), notice: "Nothing was stored. Review and approve each excerpt before saving it to the portfolio draft." });
  } catch {
    return NextResponse.json({ error: "Could not read this document. Try a text export." }, { status: 422 });
  }
}

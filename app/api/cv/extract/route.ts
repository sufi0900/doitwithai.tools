import { NextResponse } from "next/server";
import { acceptedCvTypes, cvExtractionSchema, extractCvCandidates, MAX_CV_BYTES } from "@/features/website-builder/domain/cv-ingestion";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";
import { CvAiError, extractCvWithOpenAI, type CvAiFailureCode } from "@/features/website-builder/lib/openai/cv-extractor";

export const maxDuration = 60;


export const runtime = "nodejs";

const aiFailureNotices: Record<CvAiFailureCode, string> = {
  not_configured: "AI extraction is not configured. Add OPENAI_API_KEY to .env.local, then restart the development server.",
  authentication: "OpenAI rejected the API key. Check that OPENAI_API_KEY is valid, then restart the server.",
  rate_limited: "OpenAI usage is temporarily rate-limited or has no available quota. Verified local extraction was used.",
  request_rejected: "OpenAI rejected the selected model or document request. Check OPENAI_CV_MODEL; verified local extraction was used.",
  timeout: "AI analysis exceeded the configured processing limit. Verified local extraction was used; retry once or increase OPENAI_CV_TIMEOUT_MS.",
  incomplete_response: "AI analysis stopped before its structured result was complete. Verified local extraction was used; retry once.",
  invalid_response: "AI analysis returned an invalid structured result. Verified local extraction was used.",
  ungrounded_response: "AI suggestions could not be verified against the CV text, so they were discarded safely.",
  provider_unavailable: "OpenAI could not be reached. Verified local extraction was used.",
};

async function extractText(file: File, buffer: Buffer) {
  if (file.type === "text/plain") return buffer.toString("utf8");
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const mammoth = await import("mammoth");
    return (await mammoth.extractRawText({ buffer })).value;
  }
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    return (await parser.getText()).text;
  } finally {
    await parser.destroy();
  }
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("cv");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a CV file first." }, { status: 400 });
  if (!acceptedCvTypes.includes(file.type as typeof acceptedCvTypes[number])) {
    return NextResponse.json({ error: "Use a PDF, DOCX, or TXT file." }, { status: 415 });
  }
  if (!file.size || file.size > MAX_CV_BYTES) return NextResponse.json({ error: "The CV must be between 1 byte and 5 MB." }, { status: 413 });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    if (file.type === "application/pdf" && buffer.subarray(0, 4).toString() !== "%PDF") {
      return NextResponse.json({ error: "The uploaded file is not a valid PDF." }, { status: 400 });
    }
    if (file.type.includes("wordprocessingml") && buffer.subarray(0, 2).toString() !== "PK") {
      return NextResponse.json({ error: "The uploaded file is not a valid DOCX file." }, { status: 400 });
    }
    const text = (await extractText(file, buffer)).slice(0, 50_000);
    const aiEnhanced = form.get("aiEnhanced") === "true";
    let candidates = extractCvCandidates(text);
    let engine: "local" | "ai-hybrid" = "local";
    let notice: string | undefined;
    let diagnosticCode: CvAiFailureCode | undefined;
    if (aiEnhanced) {
      try {
        const ai = await extractCvWithOpenAI({ file, buffer, extractedText: text });
        candidates = ai.candidates;
        engine = "ai-hybrid";
        notice = ai.warnings[0]?.slice(0, 240) ?? "AI-enhanced extraction completed. Review every fact before approval.";
      } catch (error) {
        diagnosticCode = error instanceof CvAiError ? error.code : "provider_unavailable";
        notice = aiFailureNotices[diagnosticCode];
        console.warn("CV AI extraction fallback", { code: diagnosticCode, status: error instanceof CvAiError ? error.status : undefined });
      }
    }
    const result = cvExtractionSchema.parse({
      sourceId: crypto.randomUUID(),
      fileName: file.name.slice(0, 180),
      mediaType: file.type,
      originalStored: false,
      engine,
      notice,
      diagnosticCode,
      candidates,
    });
    if (!result.candidates.length) return NextResponse.json({ error: "No reviewable text could be extracted from this CV." }, { status: 422 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "The CV could not be read. Try exporting it again or upload a TXT version." }, { status: 422 });
  }
}

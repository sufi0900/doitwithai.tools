import { matchVisitorEvidence, type VisitorEvidence } from "@/features/website-builder/lib/visitor-evidence";

export const MAX_VISITOR_DOCUMENT_TEXT = 200_000;
export const MAX_VISITOR_DOCUMENT_COUNT = 10;

export async function extractVisitorText(file: File) {
  if (file.size < 1 || file.size > 2_000_000) throw new Error("Choose a document under 2 MB.");
  const format = file.name.toLowerCase().split(".").pop();
  if (!["txt", "md", "pdf", "docx"].includes(format ?? "")) throw new Error("Use TXT, MD, PDF or DOCX.");
  const buffer = Buffer.from(await file.arrayBuffer());
  let content: string;
  if (format === "pdf") {
    if (buffer.subarray(0, 4).toString() !== "%PDF") throw new Error("Invalid PDF file.");
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try { content = (await parser.getText()).text; } finally { await parser.destroy(); }
  } else if (format === "docx") {
    if (buffer.subarray(0, 2).toString() !== "PK") throw new Error("Invalid DOCX file.");
    const mammoth = await import("mammoth");
    content = (await mammoth.extractRawText({ buffer })).value;
  } else content = buffer.toString("utf8");
  const text = content.replace(/\r/g, "").trim();
  if (text.length < 10) throw new Error("No readable text found. Scanned images require OCR before upload.");
  if (text.length > MAX_VISITOR_DOCUMENT_TEXT) throw new Error("This document contains more than 200,000 characters. Divide it into smaller complete documents; no text was silently dropped.");
  return text;
}

/** Chunk the entire extracted document, then rank passages only when a question arrives. */
export function documentEvidence(rows: Array<{ id: string; file_name: string; body: string }>, question: string): VisitorEvidence[] {
  const passages: VisitorEvidence[] = [];
  for (const row of rows) {
    const paragraphs = row.body.split(/\n\s*\n/);
    let part = ""; let index = 0;
    const add = () => { if (part.trim()) passages.push({ id: `document:${row.id}:${index++}`, text: `${row.file_name}: ${part.trim()}` }); part = ""; };
    for (const para of paragraphs) {
      for (const segment of para.match(/[\s\S]{1,850}/g) ?? []) {
        if (part.length + segment.length > 900) add();
        part += `${part ? "\n" : ""}${segment}`;
      }
    }
    add();
  }
  return matchVisitorEvidence(question, passages);
}

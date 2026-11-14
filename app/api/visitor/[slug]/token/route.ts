import { NextResponse } from "next/server";
import { getPublicationSnapshot } from "@/features/website-builder/lib/publication-snapshot";
import { claimVisitorUse } from "@/features/website-builder/lib/visitor-rate";
import { visitorEvidence } from "@/features/website-builder/lib/visitor-evidence";

export const maxDuration = 30;


export const runtime = "nodejs";
export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const snapshot = await getPublicationSnapshot(slug);
  if (!snapshot?.document.visitor.enabled || snapshot.document.opportunity.status !== "canonical") return NextResponse.json({ error: "Visitor AI Agent is unavailable." }, { status: 404 });
  const key = process.env.ASSEMBLYAI_API_KEY;
  if (!key) return NextResponse.json({ error: "Voice is temporarily unavailable. Please type your question." }, { status: 503 });
  if (!await claimVisitorUse(request, slug, "voice")) return NextResponse.json({ error: "Voice usage limit reached. Please type your question." }, { status: 429 });
  const url = new URL("https://agents.assemblyai.com/v1/token");
  url.searchParams.set("expires_in_seconds", "60");
  url.searchParams.set("max_session_duration_seconds", "180");
  try {
    const result = await fetch(url, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store", signal: AbortSignal.timeout(9000) });
    if (!result.ok) throw new Error("Provider unavailable");
    const { token } = await result.json() as { token?: string };
    if (!token) throw new Error("Provider unavailable");
    return NextResponse.json({ token, name: snapshot.document.identity.name, evidence: visitorEvidence(snapshot.document, slug).map(({ id, text }) => ({ id, text })).slice(0, 45) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Voice is temporarily unavailable. Please type your question." }, { status: 503 }); }
}

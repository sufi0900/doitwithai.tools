import { NextResponse } from "next/server";
import { z } from "zod";
import { getPublicationSnapshot } from "@/features/website-builder/lib/publication-snapshot";
import { visitorEvidence, matchVisitorEvidence } from "@/features/website-builder/lib/visitor-evidence";
import { claimVisitorUse } from "@/features/website-builder/lib/visitor-rate";
import { connectionAdmin } from "@/features/website-builder/lib/external-connection";
import { documentEvidence } from "@/features/website-builder/lib/visitor-document";

export const maxDuration = 60;


const input = z.object({ question: z.string().trim().min(3).max(350) });
export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const snapshot = await getPublicationSnapshot(slug);
  if (!snapshot?.document.visitor.enabled || snapshot.document.opportunity.status !== "canonical") return NextResponse.json({ error: "Visitor AI Agent is unavailable." }, { status: 404 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a question under 350 characters." }, { status: 400 });
  if (!await claimVisitorUse(request, slug, "text")) return NextResponse.json({ error: "Visitor AI Agent is temporarily unavailable or has reached its usage limit." }, { status: 429 });
  const publicFacts = visitorEvidence(snapshot.document, slug);
  const identityMatches = matchVisitorEvidence(parsed.data.question, publicFacts);
  const isIdentityQuestion = identityMatches[0]?.id === "identity";
  // Basic published identity is always answerable even when document storage is unavailable.
  if (isIdentityQuestion) return NextResponse.json({ answer: identityMatches.map((item) => item.text).join(" ").slice(0, 600), references: identityMatches.map(({ id, href }) => ({ id, href })) }, { headers: { "Cache-Control": "no-store" } });
  const { data: documents, error: documentError } = await connectionAdmin().from("website_visitor_documents").select("id,file_name,body").eq("project_id", snapshot.document.projectId).eq("published", true).limit(10);
  if (documentError) return NextResponse.json({ error: "Knowledge is temporarily unavailable." }, { status: 503 });
  const matches = matchVisitorEvidence(parsed.data.question, [...publicFacts, ...documentEvidence(documents ?? [], parsed.data.question)]);
  const answer = matches.length ? matches[0].text.slice(0, 600) : "I don't have an approved public answer to that question. Please use the portfolio contact details for more information.";
  return NextResponse.json({ answer, references: matches.map(({ id, href }) => ({ id, href })) }, { headers: { "Cache-Control": "no-store" } });
}

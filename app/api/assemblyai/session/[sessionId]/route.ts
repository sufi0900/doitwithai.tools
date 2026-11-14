import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;


export const runtime = "nodejs";

export async function DELETE(request: NextRequest, context: { params: { sessionId: string } }) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AssemblyAI is not configured." }, { status: 503 });

  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Cross-origin deletion is not allowed." }, { status: 403 });
  }

  const { sessionId } = context.params;
  if (!/^sess_[A-Za-z0-9]+$/.test(sessionId)) {
    return NextResponse.json({ error: "Invalid session identifier." }, { status: 400 });
  }

  try {
    const response = await fetch(`https://agents.assemblyai.com/v1/sessions/${sessionId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (response.status === 204 || response.status === 404) return new NextResponse(null, { status: 204 });
    return NextResponse.json({ error: "AssemblyAI did not delete the session." }, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Could not reach AssemblyAI to delete the session." }, { status: 502 });
  }
}

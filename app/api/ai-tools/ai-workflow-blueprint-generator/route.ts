import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      ok: true,
      received: body,
      sourceTier: "Verified Make/Zapier/n8n Workflow Blueprint Engine"
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate workflow blueprint." }, { status: 500 });
  }
}

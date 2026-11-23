import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      ok: true,
      received: body,
      sourceTier: "Deterministic AI Automation ROI Engine"
    });
  } catch {
    return NextResponse.json({ error: "Failed to calculate automation ROI." }, { status: 500 });
  }
}

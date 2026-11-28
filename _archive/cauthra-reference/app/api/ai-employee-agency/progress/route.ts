import { NextResponse } from "next/server";
import { agencyWorkspace } from "@/lib/ai-employee-agency/workspace.server";

export async function GET(request: Request) {
  const ws = await agencyWorkspace(request);
  if (ws instanceof NextResponse) return ws;
  const days = Number(new URL(request.url).searchParams.get("days") || 7);
  if (![7, 30, 90].includes(days))
    return NextResponse.json(
      { error: "Choose 7, 30 or 90 days." },
      { status: 400 },
    );
  const result = await ws.db.rpc("agency_progress", { days });
  return result.error
    ? NextResponse.json(
        { error: "Progress ledger unavailable." },
        { status: 503 },
      )
    : NextResponse.json({ days: result.data });
}

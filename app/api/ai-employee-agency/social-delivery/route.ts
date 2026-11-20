import { NextResponse } from "next/server";
import { agencyWorkspace } from "@/lib/ai-employee-agency/workspace.server";
import { deliverChannelDraft } from "@/lib/ai-agency/social-delivery.server";
export async function POST(request: Request) {
  const ws = await agencyWorkspace(request);
  if (ws instanceof NextResponse) return ws;
  const input = await request.json().catch(() => null);
  if (input?.approve !== true || typeof input.id !== "string")
    return NextResponse.json(
      { error: "Approve one channel draft first." },
      { status: 400 },
    );
  try {
    return NextResponse.json(await deliverChannelDraft(ws.id, input.id, false));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delivery failed." },
      { status: 409 },
    );
  }
}

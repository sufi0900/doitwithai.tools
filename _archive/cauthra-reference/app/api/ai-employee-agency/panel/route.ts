import { NextResponse } from "next/server";
import { agencyWorkspace } from "@/lib/ai-employee-agency/workspace.server";
import { deliveryConnection } from "@/lib/ai-agency/mcp-delivery.server";
import { channels } from "@/lib/ai-agency/panels";
import { specialists } from "@/lib/ai-agency/specialists";
import { panelHistory } from "@/lib/ai-agency/panel-history.server";

export async function GET(request: Request) {
  const ws = await agencyWorkspace(request);
  if (ws instanceof NextResponse) return ws;
  const agent = new URL(request.url).searchParams.get("agent");
  try {
    if (agent === "hub") {
      const counts = await Promise.all(
        channels.map(async (c) => {
          const result = await ws.db
            .from("social_ledger")
            .select("id", { head: true, count: "exact" })
            .eq("workspace_id", ws.id)
            .eq("payload->>channel", c.id);
          if (result.error || result.count === null) throw Error();
          return [c.id, result.count];
        }),
      );
      const upcoming = await ws.db
        .from("social_ledger")
        .select("id,payload")
        .eq("workspace_id", ws.id)
        .in(
          "payload->>channel",
          channels.map((c) => c.id),
        )
        .gte("payload->>day", new Date().toISOString().slice(0, 10))
        .order("payload->>day")
        .limit(12);
      if (upcoming.error) throw upcoming.error;
      return NextResponse.json({
        counts: Object.fromEntries(counts),
        upcoming: upcoming.data,
      });
    }
    if (
      !agent ||
      (!specialists.some((s) => s.id === agent) && agent !== "chief")
    )
      return NextResponse.json({ error: "Unknown panel." }, { status: 400 });
    const connection=deliveryConnection(ws.id,agent);
    return NextResponse.json({...await panelHistory(ws.db,ws.id,agent,20),connected:Boolean(connection),autoPublish:connection?.autoPublish || false});
  } catch {
    return NextResponse.json(
      { error: "Workspace history unavailable." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const ws = await agencyWorkspace(request);
  if (ws instanceof NextResponse) return ws;
  const body = await request.json().catch(() => null);
  if (typeof body?.workId !== "string")
    return NextResponse.json(
      { error: "Select a specialist draft." },
      { status: 400 },
    );
  const saved = await ws.db.rpc("agency_save_channel_draft", {
    work: body.workId,
  });
  return saved.error
    ? NextResponse.json(
        { error: "This draft is unavailable for the current strategy." },
        { status: 409 },
      )
    : NextResponse.json({ ok: true });
}

import { createSupabaseServiceClient } from "@/features/website-builder/lib/supabase/server";
import { callDeliveryTool, deliveryConnection } from "./mcp-delivery.server";
import { channels } from "./panels";

export async function deliverChannelDraft(
  workspace: string,
  id: string,
  automatic: boolean,
) {
  const db = createSupabaseServiceClient();
  if (!db) throw Error("Delivery storage unavailable.");
  const row = await db
    .from("social_ledger")
    .select("payload")
    .eq("workspace_id", workspace)
    .eq("id", id)
    .single();
  if (row.error) throw Error("Draft unavailable.");
  const draft = row.data.payload;
  if (draft.status === "published") return { status: "published" };
  if (
    !channels.some((c) => c.id === draft.channel) ||
    !["draft", "needs_review"].includes(draft.status)
  )
    throw Error("This entry cannot be sent.");
  const connector = deliveryConnection(workspace, draft.channel);
  if (!connector || (automatic && !connector.autoPublish))
    throw Error(
      "Connector is unavailable or automatic publishing is disabled.",
    );
  const claim = await db.rpc("agency_claim_channel_delivery", {
    owner: workspace,
    entry: id,
    automatic,
  });
  if (claim.error) throw Error("Delivery is unavailable or already claimed.");
  if (!claim.data) return { status: "needs_review" };
  if (claim.data.status === "published") return { status: "published" };
  try {
    const receipt = await callDeliveryTool(
      connector,
      {
        draft: claim.data,
        status: "published",
        idempotencyKey: workspace + "/" + id,
      },
      "published",
    );
    const saved = await db
      .from("social_ledger")
      .update({
        payload: {
          ...claim.data,
          status: "published",
          receipt,
          published_at: new Date().toISOString(),
        },
      })
      .eq("workspace_id", workspace)
      .eq("id", id)
      .eq("payload->>status", "sending")
      .select("id")
      .single();
    if (saved.error) throw saved.error;
    return receipt;
  } catch {
    throw Error(
      "Delivery is reserved. Verify the remote post before reconciling.",
    );
  }
}

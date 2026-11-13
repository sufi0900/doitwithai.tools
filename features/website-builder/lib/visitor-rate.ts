import { createHash, createHmac } from "node:crypto";
import { connectionAdmin } from "@/features/website-builder/lib/external-connection";

export async function claimVisitorUse(request: Request, slug: string, kind: "voice" | "text") {
  const secret = process.env.VISITOR_AGENT_HASH_SECRET;
  if (!secret || secret.length < 32) return false;
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) return false;
  // This is a pseudonymous daily rate identifier, not a stored raw IP address.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const digest = createHmac("sha256", secret).update(`${new Date().toISOString().slice(0,10)}:${ip}`).digest("hex");
  const hash = createHash("sha256").update(digest).digest("hex");
  try {
    const { data, error } = await connectionAdmin().rpc("claim_website_visitor_use", { p_slug: slug, p_hash: hash, p_kind: kind });
    return !error && data === true;
  } catch { return false; }
}

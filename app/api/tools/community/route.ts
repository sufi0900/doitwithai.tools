import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { tools } from "@/features/tool-catalog/catalog";
import { readBoundedJson, BodyError } from "@/lib/ai-tools/request-body";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;
const input = z.object({
  toolId: z.string().max(100),
  kind: z.enum(["bookmark", "like"]),
  active: z.boolean(),
});
const fail = (message: string, status: number) =>
  NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
export async function POST(request: NextRequest) {
  // Next.js may construct nextUrl using an internal hostname behind a proxy.
  // Match the browser Origin against the incoming Host, never X-Forwarded-Host.
  let sameOrigin = false;
  try {
    const origin = new URL(request.headers.get("origin") || "");
    const host = (
      request.headers.get("host") || request.nextUrl.host
    ).toLowerCase();
    const protocol =
      request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ||
      request.nextUrl.protocol.slice(0, -1);
    sameOrigin =
      ["http:", "https:"].includes(origin.protocol) &&
      origin.host === host &&
      origin.protocol === protocol + ":" &&
      !origin.username &&
      !origin.password;
  } catch {}
  if (!sameOrigin)
    return fail("This action must start from this website.", 403);
  const token = /^Bearer ([^\s]+)$/.exec(
    request.headers.get("authorization") || "",
  )?.[1];
  if (!token || token.length > 10000)
    return fail("Sign in to save this action.", 401);
  let body: z.infer<typeof input>;
  try {
    const parsed = input.safeParse(await readBoundedJson(request, 2000));
    if (!parsed.success) return fail("Invalid tool action.", 422);
    body = parsed.data;
  } catch (e) {
    return fail(
      e instanceof BodyError ? e.message : "Invalid request.",
      e instanceof BodyError ? e.status : 400,
    );
  }
  if (!tools.some((tool) => tool.id === body.toolId))
    return fail("This tool is unavailable.", 404);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key)
    return fail(
      "Account saving is temporarily unavailable. Your tools remain available.",
      503,
    );
  try {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (url, init) =>
          fetch(url, { ...init, signal: AbortSignal.timeout(8000) }),
      },
    });
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user)
      return fail(
        "Your session expired. Sign in again to save this action.",
        401,
      );
    const result = await client.rpc("set_tool_action", {
      p_user_id: data.user.id,
      p_tool_id: body.toolId,
      p_kind: body.kind,
      p_active: body.active,
    });
    if (result.error)
      return fail(
        result.error.message.includes("ACTION_LIMIT")
          ? "Please wait a minute before saving more actions."
          : "Could not save this change. Please try again.",
        result.error.message.includes("ACTION_LIMIT") ? 429 : 503,
      );
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return fail(
      "Account saving took too long. Please retry. Your tools remain available.",
      503,
    );
  }
}

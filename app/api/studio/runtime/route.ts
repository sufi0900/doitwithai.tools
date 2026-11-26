import { NextResponse } from "next/server";
import { getStudioRuntimeDiagnostics } from "@/lib/studio/studio-llm-gateway.server";
import {
  PLAN_ENTITLEMENTS,
  UNLIMITED_TESTING_ENTITLEMENTS,
  normalizePlanTier,
} from "@/lib/studio/quotas.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tier = normalizePlanTier(url.searchParams.get("tier"));
  const runtime = getStudioRuntimeDiagnostics();

  return NextResponse.json(
    {
      ok: true,
      ...runtime,
      tier,
      entitlements: runtime.unlimitedTesting
        ? UNLIMITED_TESTING_ENTITLEMENTS
        : PLAN_ENTITLEMENTS[tier],
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}

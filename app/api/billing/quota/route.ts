import { NextResponse } from "next/server";
import {
  PLAN_ENTITLEMENTS,
  UNLIMITED_TESTING_ENTITLEMENTS,
  enforceStudioQuota,
  normalizePlanTier,
} from "@/lib/studio/quotas.server";
import { isStudioUnlimitedTesting } from "@/lib/studio/studio-llm-gateway.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tier = normalizePlanTier(url.searchParams.get("tier"));
  const unlimitedTesting = isStudioUnlimitedTesting();
  return NextResponse.json({
    tier,
    unlimitedTesting,
    entitlements: unlimitedTesting
      ? UNLIMITED_TESTING_ENTITLEMENTS
      : PLAN_ENTITLEMENTS[tier],
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: "snapshot" | "article";
      planTier?: string;
      userId?: string;
    };
    const action = body.action === "article" ? "article" : "snapshot";
    const planTier = normalizePlanTier(body.planTier);
    const result = await enforceStudioQuota({
      request,
      action,
      planTier,
      userId: body.userId,
    });

    return NextResponse.json(result, {
      status: result.allowed ? 200 : 429,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to verify studio quota." },
      { status: 400 },
    );
  }
}

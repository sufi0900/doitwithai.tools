import { NextResponse } from "next/server";
import { normalizePlanTier } from "@/lib/studio/quotas.server";

export const dynamic = "force-dynamic";

/**
 * Unified Checkout Router supporting Paddle, LemonSqueezy, or Stripe Payment Links
 * via environment variables, with an automatic Preview Sandbox Checkout unlock when
 * testing on preview branches before live merchant keys are attached.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      planTier?: string;
      billingCycle?: "monthly" | "yearly";
      returnPath?: string;
    };

    const tier = normalizePlanTier(body.planTier);
    const cycle = body.billingCycle === "monthly" ? "monthly" : "yearly";
    const returnPath =
      typeof body.returnPath === "string" && body.returnPath.startsWith("/studio")
        ? body.returnPath
        : "/studio";

    const checkoutEnvMap: Record<string, string | undefined> = {
      "pro_creator:monthly":
        process.env.CHECKOUT_URL_PRO_CREATOR_MONTHLY ||
        process.env.NEXT_PUBLIC_CHECKOUT_PRO_CREATOR_MONTHLY,
      "pro_creator:yearly":
        process.env.CHECKOUT_URL_PRO_CREATOR_YEARLY ||
        process.env.NEXT_PUBLIC_CHECKOUT_PRO_CREATOR_YEARLY,
      "pro_plus:monthly":
        process.env.CHECKOUT_URL_PRO_PLUS_MONTHLY ||
        process.env.NEXT_PUBLIC_CHECKOUT_PRO_PLUS_MONTHLY,
      "pro_plus:yearly":
        process.env.CHECKOUT_URL_PRO_PLUS_YEARLY ||
        process.env.NEXT_PUBLIC_CHECKOUT_PRO_PLUS_YEARLY,
    };

    const externalCheckoutUrl = checkoutEnvMap[`${tier}:${cycle}`]?.trim();
    if (externalCheckoutUrl && /^https:\/\//i.test(externalCheckoutUrl)) {
      return NextResponse.json({
        mode: "external-checkout",
        checkoutUrl: externalCheckoutUrl,
        planTier: tier,
        billingCycle: cycle,
      });
    }

    // Preview Sandbox Mode: unlocks full /studio entitlements immediately for QA verification
    const previewSandboxEnabled =
      process.env.AGENCY_UNLIMITED_TESTING === "true" ||
      process.env.NODE_ENV !== "production" ||
      !process.env.STRIPE_SECRET_KEY;

    if (previewSandboxEnabled) {
      return NextResponse.json({
        mode: "preview-sandbox-unlocked",
        planTier: tier,
        billingCycle: cycle,
        redirectUrl: `${returnPath}?upgraded=${tier}&cycle=${cycle}`,
        message: `Preview Test Checkout Complete: ${tier === "pro_plus" ? "Pro Plus" : "Pro Creator"} quotas unlocked in /studio.`,
      });
    }

    return NextResponse.json(
      { error: "Checkout provider URL is not configured." },
      { status: 503 },
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid checkout request." },
      { status: 400 },
    );
  }
}

import { NextResponse } from "next/server";
import {
  detectConfiguredPlatformOAuthProviders,
  SOCIAL_OAUTH_PROVIDER_SPECS,
  type OneTapOAuthProviderId,
} from "@/lib/autonomous-agents/social-oauth-registry";

/**
 * GET /api/autonomous-agents/oauth/status
 *
 * Returns which social media platforms currently have official OAuth API keys
 * configured on the server (`platformOAuthAvailable`).
 * - Platforms with `platformOAuthAvailable: true` display a "1-Tap Sign In & Connect" button.
 * - Platforms with `platformOAuthAvailable: false` automatically operate in
 *   "Manual Downloadable Pack Mode" with zero user friction.
 */
export async function GET() {
  const availability = detectConfiguredPlatformOAuthProviders();
  const providers = (Object.keys(SOCIAL_OAUTH_PROVIDER_SPECS) as OneTapOAuthProviderId[]).map(
    (providerId) => {
      const spec = SOCIAL_OAUTH_PROVIDER_SPECS[providerId];
      const available = availability[providerId];
      return {
        provider: providerId,
        channel: spec.channel,
        displayName: spec.displayName,
        platformOAuthAvailable: available,
        scopes: spec.scopes,
        modeLabel: available
          ? "1-Tap OAuth Sign-In Enabled"
          : "Manual Downloadable Asset Pack Mode (API Key Pending)",
      };
    }
  );

  return NextResponse.json({
    ok: true,
    availability,
    providers,
  });
}

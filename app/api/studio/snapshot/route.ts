import { NextResponse } from "next/server";
import { runCombinedSiteSnapshot } from "@/lib/studio/site-snapshot.server";

export const dynamic = "force-dynamic";
export const maxDuration = 25;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      url?: string;
      niche?: string;
      audience?: string;
      primaryGoal?: string;
    };

    if (!body?.url || typeof body.url !== "string" || !body.url.trim()) {
      return NextResponse.json(
        { error: "Please enter a valid website URL (e.g. https://example.com)." },
        { status: 400 },
      );
    }

    const result = await runCombinedSiteSnapshot({
      url: body.url,
      niche: body.niche,
      audience: body.audience,
      primaryGoal: body.primaryGoal,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Could not inspect that website URL. Please verify the address and try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

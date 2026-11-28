import { NextResponse } from "next/server";
import { dispatchExternalCmsAndSocialPublish } from "@/lib/autonomous-agents/publishers/external-cms-publisher";
import type {
  AutomatedArticleJob,
  AutopilotApprovalMode,
  ConnectedWebsiteProfile,
  SocialChannelConnection,
} from "@/lib/autonomous-agents/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      job?: AutomatedArticleJob;
      website?: ConnectedWebsiteProfile;
      approvalMode?: AutopilotApprovalMode;
      confidenceThreshold?: number;
      socialConnections?: SocialChannelConnection[];
    };

    if (!body.job || !body.website) {
      return NextResponse.json(
        { ok: false, error: "Both `job` and `website` are required." },
        { status: 400 },
      );
    }

    const result = await dispatchExternalCmsAndSocialPublish({
      job: body.job,
      website: body.website,
      approvalMode: body.approvalMode || "copilot-review-queue",
      confidenceThreshold: Number(body.confidenceThreshold) || 90,
      socialConnections: Array.isArray(body.socialConnections)
        ? body.socialConnections
        : [],
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to dispatch Phase 5 publish pipeline.",
      },
      { status: 500 },
    );
  }
}

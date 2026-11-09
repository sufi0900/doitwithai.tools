import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedFounderRequest } from "@/lib/founder-hub/auth";
import { FOUNDER_WORKBOOK_CORE } from "@/lib/founder-hub/data";

export async function GET(req: NextRequest) {
  if (!isAuthorizedFounderRequest(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized. Valid Founder session required." },
      {
        status: 401,
        headers: {
          "X-Robots-Tag": "noindex, nofollow, noarchive",
          "Cache-Control": "private, no-store",
        },
      }
    );
  }

  return NextResponse.json(
    { ok: true, data: FOUNDER_WORKBOOK_CORE },
    {
      status: 200,
      headers: {
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "Cache-Control": "private, no-store",
      },
    }
  );
}

import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedFounderRequest } from "@/lib/founder-hub/auth";
import workbookLargeJson from "@/lib/founder-hub/workbook-large.json";

export async function GET(req: NextRequest) {
  if (!isAuthorizedFounderRequest(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized. Founder session required." },
      {
        status: 401,
        headers: {
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      }
    );
  }

  const sheet = req.nextUrl.searchParams.get("sheet") || "all";
  const data = workbookLargeJson as Record<string, { headers: string[]; rows: string[][] }>;

  if (sheet !== "all" && data[sheet]) {
    return NextResponse.json(
      { ok: true, sheet, data: data[sheet] },
      {
        status: 200,
        headers: {
          "X-Robots-Tag": "noindex, nofollow, noarchive",
          "Cache-Control": "private, no-store",
        },
      }
    );
  }

  return NextResponse.json(
    { ok: true, sheets: data },
    {
      status: 200,
      headers: {
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "Cache-Control": "private, no-store",
      },
    }
  );
}

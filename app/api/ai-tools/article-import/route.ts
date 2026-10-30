import { NextRequest } from "next/server";
import { handleImport } from "@/features/article-conversion/route.server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
export async function POST(request: NextRequest) {
  return handleImport(request, false);
}

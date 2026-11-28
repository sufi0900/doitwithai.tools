import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";

export const maxDuration = 30;


export const runtime = "nodejs";
export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in before starting your voice interview." }, { status: 401 });
  const key = process.env.ASSEMBLYAI_API_KEY;
  if (!key) return NextResponse.json({ error: "Voice is unavailable. Use the typed interview instead." }, { status: 503 });
  const url = new URL("https://agents.assemblyai.com/v1/token");
  url.searchParams.set("expires_in_seconds", "60");
  url.searchParams.set("max_session_duration_seconds", "300");
  try {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store", signal: AbortSignal.timeout(9000) });
    if (response.status === 429) return NextResponse.json({ error: "The voice provider has reached its usage or rate limit. Check your AssemblyAI account usage before retrying." }, { status: 429 });
    if (!response.ok) return NextResponse.json({ error: "The voice provider could not start an interview. Check its service and API key configuration." }, { status: 503 });
    const { token } = await response.json() as { token?: string };
    if (!token) throw new Error("unavailable");
    // Do not charge the user's daily session allowance when the provider rejects
    // the request or the token response is malformed.
    const { data: allowed, error: limitError } = await supabase.rpc("claim_website_interview_use");
    if (limitError) {
      console.error("Voice interview limit check failed", { code: limitError.code });
      return NextResponse.json({ error: "Voice interview setup is temporarily unavailable. Contact the site owner." }, { status: 503 });
    }
    if (!allowed) return NextResponse.json({ error: "You have used today's 20 voice interview starts. Your saved answers remain available; try again after the daily reset or continue by typing." }, { status: 429 });
    return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "The voice provider could not be reached. Your saved interview answers are safe; please retry later." }, { status: 503 }); }
}

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";

export const maxDuration = 30;


export const runtime = "nodejs";

export async function GET(request: Request) {
  const projectId = new URL(request.url).searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "Select a portfolio." }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to use voice editing." }, { status: 401 });
  const { data: project } = await supabase.from("website_projects").select("id").eq("id", projectId).eq("owner_id", user.id).maybeSingle();
  if (!project) return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "AssemblyAI is not configured. Add ASSEMBLYAI_API_KEY to .env.local and restart the server." },
      { status: 503 },
    );
  }

  const url = new URL("https://agents.assemblyai.com/v1/token");
  url.searchParams.set("expires_in_seconds", "120");
  url.searchParams.set("max_session_duration_seconds", "600");

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { error: "AssemblyAI rejected the temporary-token request.", detail },
        { status: response.status },
      );
    }

    const payload = (await response.json()) as { token?: string };
    if (!payload.token) {
      return NextResponse.json({ error: "AssemblyAI returned no token." }, { status: 502 });
    }

    return NextResponse.json({ token: payload.token });
  } catch {
    return NextResponse.json({ error: "Could not reach AssemblyAI." }, { status: 502 });
  }
}

import { NextResponse } from 'next/server';
import { agencyWorkspace } from '@/lib/ai-employee-agency/workspace.server';
import { runLiveWebResearch } from '@/lib/ai-agency/live-web-research.server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const ws = await agencyWorkspace(request);
  if (ws instanceof NextResponse) return ws;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const query = typeof body?.query === 'string' ? body.query.trim() : '';
  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Enter a topic or niche query to run live web research.' },
      { status: 400 },
    );
  }

  const excludeKeywords = Array.isArray(body?.excludeKeywords)
    ? body.excludeKeywords.map((k) => String(k).trim()).filter(Boolean)
    : [];

  const report = await runLiveWebResearch({
    workspaceId: ws.id,
    query,
    excludeKeywords,
  });

  return NextResponse.json(
    { ok: true, report },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}

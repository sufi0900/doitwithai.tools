import { NextResponse } from 'next/server';
import { agencyWorkspace } from '@/lib/ai-employee-agency/workspace.server';

export async function GET(request: Request) {
  const workspace = await agencyWorkspace(request);
  if (workspace instanceof NextResponse) return workspace;
  const { data, error } = await workspace.db.rpc('agency_usage_summary');
  if (error) return NextResponse.json({ error: 'Usage data unavailable.' }, { status: 503 });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
}

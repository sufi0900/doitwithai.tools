import { NextResponse } from 'next/server';
import { agencyWorkspace, contentCounts } from '@/lib/ai-employee-agency/workspace.server';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const workspace = await agencyWorkspace(request);
  if (workspace instanceof NextResponse) return workspace;
  const latest = await workspace.db.from('token_usage_ledger').select('created_at,model,total_tokens,calculated_usd').eq('workspace_id', workspace.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (latest.error) return NextResponse.json({ error: 'Usage history unavailable.' }, { status: 503 });
  const website = await workspace.db.from('tenant_brand_dna').select('domain,approved_at').eq('workspace_id', workspace.id).maybeSingle();
  if (website.error) return NextResponse.json({ error: 'Knowledge base unavailable.' }, { status: 503 });
  return NextResponse.json({ website: website.data, counts: await contentCounts(workspace), lastCall: latest.data });
}

export async function POST(request: Request) {
  const workspace = await agencyWorkspace(request);
  if (workspace instanceof NextResponse) return workspace;
  const body = await request.json().catch(() => null);
  let url: URL;
  try {
    url = new URL(body?.siteUrl);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error();
  } catch {
    return NextResponse.json({ error: 'Enter a valid website URL.' }, { status: 400 });
  }
  const { error } = await workspace.db.rpc('agency_register_website', { site: url.href, goal: String(body?.goal || '').slice(0, 500) });
  if (error) return NextResponse.json({ error: 'Website registration failed. Check your current workspace.' }, { status: 409 });
  return NextResponse.json({ ok: true });
}

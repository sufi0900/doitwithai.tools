import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/features/website-builder/lib/supabase/server';
import type { AgencyLlmResponse } from './llm-gateway';

export async function agencyWorkspace(request: Request) {
  try {
    const db = await createSupabaseServerClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Sign in to open your agency workspace.' }, { status: 401 });
    const id = request.headers.get('x-workspace-id') || user.id;
    if (id !== user.id) return NextResponse.json({ error: 'Workspace access denied.' }, { status: 403 });
    const { error } = await db.from('agency_workspaces').upsert({ id }, { onConflict: 'id', ignoreDuplicates: true });
    if (error) throw error;
    return { db, id };
  } catch {
    return NextResponse.json({ error: 'Workspace storage is unavailable. Check Supabase configuration and migrations.' }, { status: 503 });
  }
}

export async function contentCounts(workspace: Exclude<Awaited<ReturnType<typeof agencyWorkspace>>, NextResponse>) {
  const statuses = ['published', 'ready', 'queued'] as const;
  const counts = await Promise.all(statuses.map(async status => {
    const { count, error } = await workspace.db.from('content_items').select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspace.id).eq('status', status);
    if (error || count === null) throw new Error('Content counts unavailable.');
    return count;
  }));
  return { published: counts[0], ready: counts[1], queued: counts[2] };
}

export async function recordAgencyUsage(workspaceId: string, operation: string, call: AgencyLlmResponse) {
  const db = createSupabaseServiceClient();
  if (!db) throw new Error('Usage ledger unavailable.');
  const { error } = await db.from('token_usage_ledger').insert({
    workspace_id: workspaceId, operation, model: call.modelId, provider: call.provider,
    prompt_tokens: call.usageReported ? call.promptTokens : null,
    completion_tokens: call.usageReported ? call.completionTokens : null,
    thinking_tokens: call.usageReported ? call.thinkingTokens : null,
    total_tokens: call.usageReported ? call.totalTokens : null,
    calculated_usd: call.usageReported ? call.shadowPaidCostUsd : null,
  });
  if (error) throw new Error('Unable to record provider usage.');
}

export async function requireApprovedWebsite(workspace: Exclude<Awaited<ReturnType<typeof agencyWorkspace>>, NextResponse>) {
  const { data, error } = await workspace.db.from('tenant_brand_dna').select('approved_at').eq('workspace_id', workspace.id).maybeSingle();
  if (error) return NextResponse.json({ error: 'Knowledge base unavailable.' }, { status: 503 });
  if (!data?.approved_at) return NextResponse.json({ error: 'Approve the website knowledge base before starting agency work.' }, { status: 409 });
}

import { NextResponse } from 'next/server';
import { agencyWorkspace } from '@/lib/ai-employee-agency/workspace.server';
import { topicDecision } from '@/lib/ai-employee-agency/site-knowledge';
import { createSupabaseServiceClient } from '@/features/website-builder/lib/supabase/server';

export async function POST(request: Request) {
  const workspace = await agencyWorkspace(request);
  if (workspace instanceof NextResponse) return workspace;
  const input = await request.json().catch(() => null);
  const topic = typeof input?.topic === 'string' ? input.topic.trim() : '';
  if (topic.length > 240 || !/[\p{L}\p{N}]/u.test(topic)) return NextResponse.json({error:'Enter a topic of up to 240 characters.'},{status:400});
  const { data } = await workspace.db.from('tenant_brand_dna').select('revision,profile,approved_at').eq('workspace_id',workspace.id).maybeSingle();
  if (!data?.approved_at || !Array.isArray(data.profile?.pages)) return NextResponse.json({error:'Approve the website knowledge base first.'},{status:409});
  const decision = topicDecision(topic,data.profile);
  if (decision.action === 'review') return NextResponse.json({ ...decision, queued:false });
  const db = createSupabaseServiceClient();
  if (!db) return NextResponse.json({error:'Queue unavailable.'},{status:503});
  const item = { topic, kind: decision.action, target: decision.action === 'refresh' ? decision.match?.url : null, brandRevision:data.revision };
  const { error } = await db.rpc('agency_queue_reviewed_topic',{owner:workspace.id,version:data.revision,item});
  if (error) return NextResponse.json({error:'Could not queue this item. Refresh the workspace.'},{status:409});
  return NextResponse.json({ ...decision, queued:true });
}

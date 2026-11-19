import { NextResponse } from 'next/server';
import { agencyWorkspace, contentCounts, recordAgencyUsage } from '@/lib/ai-employee-agency/workspace.server';
import { classifyCopilotIntent } from '@/lib/ai-employee-agency/copilot-intent';
import { executeAgencyLlmCall, providerBindings } from '@/lib/ai-employee-agency/llm-gateway';
import { MODEL_PRICING_CATALOG } from '@/lib/ai-employee-agency/token-telemetry-store';
import type { AgencyLlmModelId } from '@/lib/ai-employee-agency/token-telemetry-store';
import { specialists } from '@/lib/ai-agency/specialists';
import { compilePrompt, promptVersion, verifiedReply } from '@/lib/ai-agency/prompt-compiler';
import { research } from '@/lib/ai-agency/web-research';
import { createSupabaseServiceClient } from '@/features/website-builder/lib/supabase/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!message || message.length > 8000) return NextResponse.json({ error: 'Enter a message of up to 8,000 characters.' }, { status: 400 });
  const intent = classifyCopilotIntent(message);
  const target = message.match(/\bto (?:the )?(.+)$/i)?.[1] || message;
  const specialist = specialists.find(role => role.id === body.agentId) ||
    (intent === 'delegate_task' ? specialists.find(role => role.match.test(target)) : undefined);
  const chief = body.agentId === 'chief';
  const response = (replyText: string) => ({ ok: true, intent, agentName: specialist?.name || (chief ? 'Chief AI Officer' : 'Workspace Copilot'), replyText });
  if (intent === 'greeting') return NextResponse.json(response('Hi! What would you like to work on today?'));
  const workspace = await agencyWorkspace(request);
  if (workspace instanceof NextResponse) return workspace;
  const counts = await contentCounts(workspace);
  if (intent === 'workspace_read') return NextResponse.json(response(`You have ${counts.published} published, ${counts.ready} ready for review, and ${counts.queued} queued.`));
  const {data: brand, error} = await workspace.db.from('tenant_brand_dna').select('profile,revision,approved_at').eq('workspace_id',workspace.id).maybeSingle();
  if (error) return NextResponse.json({error:'Could not read brand knowledge.'},{status:503});
  if (!brand?.approved_at && (specialist || chief || intent !== 'casual_chat')) return NextResponse.json({error:'Approve the website knowledge base first.'},{status:409});
  const profile = brand?.approved_at ? brand.profile : {};
  if (intent === 'strategy_pivot' && !specialist && !chief) {
    const retirement = message.match(/^(?:stop promoting|retire)\s+(.+?)(?:\s+(?:and|instead)\b|$)/i)?.[1] ||
      message.match(/^switch from (.+?) to /i)?.[1] || '';
    const { data, error } = await workspace.db.rpc('agency_change_strategy',{expected:brand.revision,directive:message,retiring:retirement.replace(/^['"]|['".!]$/g,'')});
    if (error) return NextResponse.json({error:'Strategy changed or could not be saved. Refresh before retrying.'},{status:409});
    return NextResponse.json(response(`Strategy updated. ${data} conflicting queued items paused. All specialists will use the revised direction.`));
  }
  if (intent === 'delegate_task' && !specialist) return NextResponse.json(response('Choose a specialist for this assignment.'));
  const needsResearch = intent === 'web_research' || ['writer','keywords','qa'].includes(specialist?.id || '');
  const evidence = needsResearch ? await research(message,profile.competitor_blocklist || []) : [];
  if (intent === 'web_research' && !evidence.length) return NextResponse.json({error:'No readable source was retrieved. Include a public source URL to research.'},{status:422});
  const roleId = specialist?.id || (chief ? 'chief' : 'copilot');
  const recent = await workspace.db.from('agency_specialist_work').select('task,result').eq('workspace_id',workspace.id)
    .eq('specialist',roleId).order('created_at',{ascending:false}).limit(3);
  if (recent.error) return NextResponse.json({error:'Specialist history unavailable. Check the Phase 3 migration.'},{status:503});
  const context = compilePrompt(specialist,chief,{...profile, counts},(recent.data || []).map(r => ({task:r.task.slice(0,300),result:r.result.slice(0,1000)})),evidence,message);
  const configured = providerBindings();
  const models = Object.keys(MODEL_PRICING_CATALOG) as AgencyLlmModelId[];
  const modelId = models.includes(body.modelId) ? body.modelId as AgencyLlmModelId : models.find(id => configured[MODEL_PRICING_CATALOG[id].provider]);
  const call = await executeAgencyLlmCall({modelId, ...context, maxOutputTokens: specialist?.id === 'writer' ? 3200 : 1000});
  if (!call.ok) return NextResponse.json({ error: call.apiErrorDetail || 'The provider returned no answer.' }, { status: 503 });
  await recordAgencyUsage(workspace.id, roleId, call);
  let reply: string;
  try { reply = verifiedReply(call.outputText,evidence); }
  catch { return NextResponse.json({error:'The response did not meet the citation or output format requirements. No draft was saved.'},{status:422}); }
  if (specialist) {
    const db = createSupabaseServiceClient();
    const saved = await db?.rpc('agency_save_specialist_work',{owner:workspace.id,expected:brand.revision,role_id:roleId,prompt_id:promptVersion,task_text:message,result_text:reply});
    if (!saved || saved.error) return NextResponse.json({error:'The workspace changed or the draft could not be saved. Reload the brief.'},{status:409});
  }
  return NextResponse.json({ ...response(reply), tokenUsage: call.usageReported ? call : null, llmGatewayStatus: { usedLiveApiKey: true, apiKeySlot: call.apiKeySlot } });
}

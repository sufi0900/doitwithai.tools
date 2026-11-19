import { NextResponse } from 'next/server';
import { agencyWorkspace, contentCounts, recordAgencyUsage } from '@/lib/ai-employee-agency/workspace.server';
import { classifyCopilotIntent } from '@/lib/ai-employee-agency/copilot-intent';
import { executeAgencyLlmCall, providerBindings } from '@/lib/ai-employee-agency/llm-gateway';
import { MODEL_PRICING_CATALOG } from '@/lib/ai-employee-agency/token-telemetry-store';
import type { AgencyLlmModelId } from '@/lib/ai-employee-agency/token-telemetry-store';
import { getAllAgencyEmployeesFlat } from '@/lib/ai-employee-agency/agent-registry';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!message || message.length > 8000) return NextResponse.json({ error: 'Enter a message of up to 8,000 characters.' }, { status: 400 });
  const intent = classifyCopilotIntent(message);
  const specialist = getAllAgencyEmployeesFlat().find(employee => employee.id === body.agentId);
  const response = (replyText: string) => ({ ok: true, intent, agentName: specialist?.name || 'Workspace Copilot', replyText });
  if (intent === 'greeting') return NextResponse.json(response('Hi! What would you like to work on today?'));
  const workspace = await agencyWorkspace(request);
  if (workspace instanceof NextResponse) return workspace;
  const counts = await contentCounts(workspace);
  if (intent === 'workspace_read') return NextResponse.json(response(`You have ${counts.published} published, ${counts.ready} ready for review, and ${counts.queued} queued.`));
  if (['strategy_pivot','delegate_task','web_research'].includes(intent)) {
    return NextResponse.json({ error: 'This action needs an approved website knowledge base and an enabled workflow.' }, { status: 409 });
  }
  const configured = providerBindings();
  const models = Object.keys(MODEL_PRICING_CATALOG) as AgencyLlmModelId[];
  const modelId = models.includes(body.modelId) ? body.modelId as AgencyLlmModelId : models.find(id => configured[MODEL_PRICING_CATALOG[id].provider]);
  const call = await executeAgencyLlmCall({
    modelId, userPrompt: message,
    systemPrompt: `You are ${specialist?.name || 'the neutral workspace Copilot'}. Answer conversationally. You can discuss tasks but cannot execute them in conversation. Verified workspace counts: ${JSON.stringify(counts)}.`,
  });
  if (!call.ok) return NextResponse.json({ error: call.apiErrorDetail || 'The provider returned no answer.' }, { status: 503 });
  await recordAgencyUsage(workspace.id, 'copilot', call);
  return NextResponse.json({ ...response(call.outputText), tokenUsage: call.usageReported ? call : null, llmGatewayStatus: { usedLiveApiKey: true, apiKeySlot: call.apiKeySlot } });
}

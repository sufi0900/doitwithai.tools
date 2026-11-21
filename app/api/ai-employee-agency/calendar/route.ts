import { NextResponse } from 'next/server';
import { agencyWorkspace } from '@/lib/ai-employee-agency/workspace.server';

export async function GET(request: Request) {
  const ws = await agencyWorkspace(request);
  if (ws instanceof NextResponse) return ws;
  const plans = await ws.db.from('agency_calendar_quotas')
    .select('id,start_date,end_date,articles,pins,cooldown_minutes,ramp_start')
    .eq('workspace_id', ws.id).order('start_date', { ascending: false }).limit(30);
  if (plans.error) return NextResponse.json({ error: 'Calendar unavailable. Check the calendar migration.' }, { status: 503 });
  const queue = await ws.db.from('content_items').select('id,content').eq('workspace_id',ws.id)
    .eq('status','queued').order('content->>priority_at',{ascending:false,nullsFirst:false}).order('id').limit(100);
  if (queue.error) return NextResponse.json({error:'Priority queue unavailable.'},{status:503});
  return NextResponse.json({ plans: plans.data, queue:queue.data });
}

export async function POST(request: Request) {
  const ws = await agencyWorkspace(request);
  if (ws instanceof NextResponse) return ws;
  const body = await request.json().catch(() => null);
  if (body?.action === 'prioritize') {
    if (typeof body.itemId !== 'string') return NextResponse.json({error:'Choose a queued topic.'},{status:400});
    const item = await ws.db.rpc('agency_prioritize_topic',{item_id:body.itemId});
    return item.error ? NextResponse.json({error:'Could not prioritize the queued item.'},{status:409}) : NextResponse.json({ok:true});
  }
  const date = (s: unknown) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
    && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().startsWith(s);
  const integer = (n: number, min: number, max: number) => Number.isInteger(n) && n >= min && n <= max;
  if (!body || !date(body.start) || !date(body.end) || body.start > body.end ||
    Date.parse(body.end) - Date.parse(body.start) > 365 * 86400000 ||
    !integer(body.articles, 0, 10000) || !integer(body.pins, 0, 20000) ||
    body.articles + body.pins === 0 || !integer(body.cooldown, 10, 1440)) {
    return NextResponse.json({ error: 'Check the dates, asset totals and cooldown.' }, { status: 400 });
  }
  const result = await ws.db.rpc('agency_plan_calendar', {
    first_day: body.start, last_day: body.end, article_goal: body.articles, pin_goal: body.pins, cooldown: body.cooldown,
  });
  if (result.error) return NextResponse.json({
    error: result.error.code === 'P0001' ? result.error.message : 'Calendar plan could not be saved.',
  }, { status: result.error.code === 'P0001' ? 409 : 503 });
  return NextResponse.json({ id: result.data });
}

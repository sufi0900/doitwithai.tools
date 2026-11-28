'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { calendarDays, type CalendarPlan } from '@/lib/ai-agency/calendar';
import { agencyRequest } from './agency-request';

const endpoint = '/api/ai-employee-agency/calendar';
const field =
  'block w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none';
export function AgencyCalendar() {
  const [plans, setPlans] = useState<CalendarPlan[]>([]);
  const [queue,setQueue] = useState<{id:string;content:{topic?:string;priority_at?:string}}[]>([]);
  const [notice, setNotice] = useState('Loading calendar…');
  const [busy, setBusy] = useState(false);
  async function refresh() {
    const response = await agencyRequest(endpoint);
    const data = await response.json();
    if (!response.ok) throw Error(data.error);
    setPlans(data.plans);
    setQueue(data.queue);
    setNotice('');
  }
  useEffect(() => { refresh().catch(err => setNotice(err.message)); }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const response = await agencyRequest(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: form.get('start'), end: form.get('end'), articles: Number(form.get('articles')),
          pins: Number(form.get('pins')), cooldown: Number(form.get('cooldown')) }),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error);
      await refresh();
      setNotice('Quota plan saved.');
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Calendar unavailable.'); }
    finally { setBusy(false); }
  }
  async function prioritize(itemId:string) {
    setBusy(true);
    try {
      const response = await agencyRequest(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'prioritize',itemId})});
      if (!response.ok) throw Error('Could not prioritize the queued item.');
      await refresh();
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Priority unavailable.'); }
    finally {setBusy(false);}
  }
  const today = new Date().toISOString().slice(0,10);
  return (
    <section className="space-y-5 rounded-xl border border-slate-800 bg-[#111827] p-5">
      <div className="border-b border-slate-800 pb-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
          Production Schedule &amp; Quotas
        </p>
        <h2 className="text-base font-semibold text-white">Plan production targets</h2>
      </div>

      <form onSubmit={save} className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block min-w-0 space-y-1.5 text-xs font-medium text-slate-300">
          <span>First day (UTC)</span>
          <input className={field} required type="date" name="start" min={today} />
        </label>
        <label className="block min-w-0 space-y-1.5 text-xs font-medium text-slate-300">
          <span>Last day (UTC)</span>
          <input className={field} required type="date" name="end" min={today} />
        </label>
        <label className="block min-w-0 space-y-1.5 text-xs font-medium text-slate-300">
          <span>Article target</span>
          <input className={field} required type="number" name="articles" min="0" max="10000" defaultValue="0" />
        </label>
        <label className="block min-w-0 space-y-1.5 text-xs font-medium text-slate-300">
          <span>Pinterest pin target</span>
          <input className={field} required type="number" name="pins" min="0" max="20000" defaultValue="0" />
        </label>
        <label className="block min-w-0 space-y-1.5 text-xs font-medium text-slate-300">
          <span>Cooldown (minutes)</span>
          <input className={field} required type="number" name="cooldown" min="10" max="1440" defaultValue="10" />
        </label>
        <div className="flex items-end">
          <button
            className="w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            disabled={busy}
          >
            {busy ? 'Saving…' : 'Save targets'}
          </button>
        </div>
      </form>

      {notice && (
        <p role="status" className="break-words text-xs text-slate-300">
          {notice}
        </p>
      )}

      {queue.length > 0 && (
        <div className="space-y-2.5 rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
          <h3 className="text-sm font-semibold text-white">Queued topics ({queue.length})</h3>
          <div className="divide-y divide-slate-800/80">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-xs"
              >
                <span className="min-w-0 flex-1 break-words font-medium text-slate-200">
                  {item.content.topic || 'Queued work item'}
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => prioritize(item.id)}
                  className="shrink-0 rounded-lg border border-slate-700 bg-[#111827] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-blue-500/60 hover:text-white disabled:opacity-50"
                >
                  Move to front
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {plans.map((plan) => (
        <details key={plan.id} className="rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
          <summary className="cursor-pointer break-words text-xs font-semibold text-slate-200">
            {plan.start_date} – {plan.end_date} · {plan.articles} articles · {plan.pins} pins
          </summary>
          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">Daily production targets</caption>
              <thead className="border-b border-slate-800 bg-[#111827] text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-semibold">Date</th>
                  <th className="px-3 py-2 font-semibold">Articles</th>
                  <th className="px-3 py-2 font-semibold">Pins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {calendarDays(plan).map((day) => (
                  <tr key={day.date} className="text-slate-300">
                    <td className="px-3 py-2 font-mono">{day.date}</td>
                    <td className="px-3 py-2 font-mono">{day.articles}</td>
                    <td className="px-3 py-2 font-mono">{day.pins}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ))}
    </section>
  );
}

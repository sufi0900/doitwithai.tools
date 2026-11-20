'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { calendarDays, type CalendarPlan } from '@/lib/ai-agency/calendar';
import { agencyRequest } from './agency-request';

const endpoint = '/api/ai-employee-agency/calendar';
const field = 'block w-full rounded bg-slate-800 p-2';
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
  return <section className="space-y-4 rounded-xl border border-slate-700 p-5">
    <h2 className="text-lg font-semibold">Plan production targets</h2>
    <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
      <label>First day (UTC)<input className={field} required type="date" name="start" min={today}/></label>
      <label>Last day (UTC)<input className={field} required type="date" name="end" min={today}/></label>
      <label>Article target<input className={field} required type="number" name="articles" min="0" max="10000" defaultValue="0"/></label>
      <label>Pinterest pin target<input className={field} required type="number" name="pins" min="0" max="20000" defaultValue="0"/></label>
      <label>Cooldown (minutes)<input className={field} required type="number" name="cooldown" min="10" max="1440" defaultValue="10"/></label>
      <button className="self-end rounded bg-blue-700 p-2" disabled={busy}>Save targets</button>
    </form>
    <p role="status">{notice}</p>
    {queue.length > 0 && <div><h3>Queued topics</h3>{queue.map(item => <div key={item.id} className="flex items-center justify-between gap-4">
      <span>{item.content.topic || 'Queued work item'}</span><button disabled={busy} onClick={() => prioritize(item.id)}>Move to front</button>
    </div>)}</div>}
    {plans.map(plan => <details key={plan.id}>
      <summary>{plan.start_date} – {plan.end_date} · {plan.articles} articles · {plan.pins} pins</summary>
      <table className="mt-3 w-full text-left"><caption>Daily production targets</caption>
        <thead><tr><th>Date</th><th>Articles</th><th>Pins</th></tr></thead>
        <tbody>{calendarDays(plan).map(day => <tr key={day.date}><td>{day.date}</td><td>{day.articles}</td><td>{day.pins}</td></tr>)}</tbody>
      </table>
    </details>)}
  </section>;
}

export interface CalendarPlan {
  id: string;
  start_date: string;
  end_date: string;
  articles: number;
  pins: number;
  cooldown_minutes: number;
  ramp_start: string | null;
}

const dayMs = 86400000;

// Integer cumulative targets preserve the requested total, including sparse plans.
export function calendarDays(plan: CalendarPlan) {
  const start = Date.parse(plan.start_date);
  const length = Math.round((Date.parse(plan.end_date) - start) / dayMs) + 1;
  const share = (total: number, day: number) =>
    Math.floor(total * (day + 1) / length) - Math.floor(total * day / length);
  let assigned = 0;
  const ramp = plan.ramp_start ? Date.parse(plan.ramp_start) : -Infinity;
  return Array.from({ length }, (_, day) => {
    const age = (start + day * dayMs - ramp) / dayMs;
    const limit = Math.min(Math.floor(1440 / plan.cooldown_minutes), age < 7 ? 1 : age < 14 ? 2 : Infinity);
    const articles = Math.min(limit, Math.ceil((plan.articles - assigned) / (length - day)));
    assigned += articles;
    return {
      date: new Date(start + day * dayMs).toISOString().slice(0, 10),
      articles,
      pins: share(plan.pins, day),
    };
  });
}

import { ChevronDown, MessageCircleQuestion } from "lucide-react";
export default function ToolFaq({
  title = "Frequently asked questions",
  faqs,
}: {
  title?: string;
  faqs: { question: string; answer: string }[];
}) {
  return (
    <section className="border-t border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-8 flex items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#5271ff]/10 text-[#5271ff]">
            <MessageCircleQuestion />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#5271ff]">
              Questions and answers
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">
              {title}
            </h2>
          </div>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <details
              key={f.question}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm open:border-[#5271ff]/40 dark:border-slate-800 dark:bg-slate-900"
            >
              <summary className="flex cursor-pointer list-none items-center gap-4 text-sm font-bold text-slate-950 focus-visible:outline-[#5271ff] dark:text-white">
                <span aria-hidden className="text-xs font-black text-[#5271ff]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">{f.question}</span>
                <ChevronDown
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-[#5271ff] transition group-open:rotate-180"
                />
              </summary>
              <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:text-slate-300">
                {f.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

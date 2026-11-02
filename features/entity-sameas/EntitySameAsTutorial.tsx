import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  ListChecks,
  RefreshCw,
  Search,
  UserCheck,
} from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Search for your brand, person, product, or place",
    body: "Type the name exactly as people know it and choose a language. Review matching Wikidata entries, then choose the correct entity.",
  },
  {
    icon: UserCheck,
    title: "Pick the entry that is genuinely yours",
    body: "Many names are shared, so read each short description before choosing. Selecting the wrong entry would point your markup at someone else's profiles.",
  },
  {
    icon: ListChecks,
    title: "Review the profile links Wikidata knows about",
    body: "The tool lists the official website, Wikipedia page, Wikidata page, and any social or reference profiles stored for that entry. Open each link to confirm it still works and belongs to you, then untick anything that doesn't.",
  },
  {
    icon: ClipboardCheck,
    title: "Add profiles Wikidata doesn't have",
    body: "Paste your own official profile URLs, one per line, such as LinkedIn, YouTube, or GitHub pages. Invalid entries are flagged and ignored.",
  },
  {
    icon: Copy,
    title: "Set the schema type, name, and website, then copy the JSON-LD",
    body: "Choose Organization, Person, Brand, Product, or Place, check the name and URL, and optionally add a description in your own words. Copy the finished JSON-LD or download it.",
  },
  {
    icon: RefreshCw,
    title: "Publish it and test it",
    body: "Add the markup to the page it describes, usually your homepage or About page. Check it with the Schema Markup Validator or Google's Rich Results Test, and revisit it when your profiles change.",
  },
];

const PRACTICES = [
  {
    title: "Link only to pages about the same entity",
    body: "Every sameAs URL should clearly describe your brand or person, not a similarly named one.",
  },
  {
    title: "Keep it current",
    body: "Remove links to closed accounts and add new official profiles when you create them.",
  },
  {
    title: "Match the on-page facts",
    body: "The name, website, and description in your markup should agree with what the page visibly says.",
  },
  {
    title: "Put it where it belongs",
    body: "Organization markup usually goes on the homepage or About page, and Person markup on an author or About page.",
  },
  {
    title: "Pair it with consistent naming",
    body: "Use the same name and spelling across your site, profiles, and directories so the entity is easy to recognise.",
  },
];

const MISTAKES = [
  "Adding unverified or unrelated profile URLs just to make the list longer.",
  "Treating sameAs as a ranking factor. It helps systems recognise who or what you are; it doesn't guarantee rankings or a Knowledge Panel.",
  "Creating a Wikidata or Wikipedia entry purely for SEO. Both have notability and neutrality rules, and promotional entries are often removed.",
];

export default function EntitySameAsTutorial() {
  return (
    <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Step-by-step
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            How to build sameAs schema markup for your brand
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Six steps from a name search to JSON-LD you can review and publish.
          </p>
        </div>

        <ol className="mt-10 space-y-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5271ff]/10 text-[#4662df] dark:text-blue-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                    <span className="mr-2 text-[#5271ff]">{index + 1}.</span>
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-7 text-slate-600 dark:text-slate-300">{step.body}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
              <RefreshCw className="h-5 w-5 text-[#4662df] dark:text-blue-300" />
              sameAs best practices
            </h3>
            <ul className="mt-4 space-y-3">
              {PRACTICES.map((practice) => (
                <li key={practice.title} className="flex gap-2.5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>
                    <span className="font-bold text-slate-900 dark:text-white">{practice.title}.</span> {practice.body}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Common mistakes to avoid
            </h3>
            <ul className="mt-4 space-y-3">
              {MISTAKES.map((mistake) => (
                <li key={mistake} className="flex gap-2.5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-amber-500" />
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

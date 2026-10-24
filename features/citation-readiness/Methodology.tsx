import { criterionBasis } from "./criteria";
const entries = [
  {
    id: "indexing",
    name: "Indexing and snippet controls",
    measure: "Retained directives, not actual indexing.",
    limit:
      "Google eligibility controls are documented. Inclusion still requires separate verification.",
  },
  {
    id: "crawler-OAI-SearchBot",
    name: "Search crawler rules",
    measure: "Retrieved robots rules for the supplied path.",
    limit:
      "Search and training agents differ. Permission does not verify firewall access.",
  },
  {
    id: "openings",
    name: "Whole opening paragraphs",
    measure:
      "English framing phrases, topic-word overlap, and explanatory cues.",
    limit:
      "Our editorial heuristic. It cannot determine answer completeness, storytelling quality, or citation likelihood.",
  },
  {
    id: "structure",
    name: "Headings and paragraph length",
    measure: "Optional writing context without a citation penalty.",
    limit:
      "A single H1, short paragraph, or informative first sentence is not a universal citation requirement.",
  },
  {
    id: "sources",
    name: "Claims and sourcing cues",
    measure:
      "Passages mentioning statistics, research, comparisons, guarantees, or experience.",
    limit:
      "A nearby link is only a candidate. Factual accuracy and source support require evidence review.",
  },
  {
    id: "schema",
    name: "Structured data and optional files",
    measure: "Extracted markup and llms.txt availability.",
    limit:
      "Presence does not earn a citation bonus. No special AI markup or llms.txt file is required for Google AI features.",
  },
  {
    id: "response",
    name: "Optional performance test",
    measure: "Published-page lab scores and available real-user measurements.",
    limit:
      "Performance describes page experience, not citation probability. Missing field data remains unavailable evidence.",
  },
];
export default function Methodology() {
  return (
    <section
      id="citation-methodology"
      className="scroll-mt-28 border-t border-slate-200 bg-white py-14 text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          Methodology and evidence
        </p>
        <h2 className="mt-3 text-3xl font-bold">
          What each check actually measures
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-8">
          Access rules and editorial suggestions have different evidence.
          Neither produces a citation probability or an authority score.
        </p>
        <div className="mt-7 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-[680px] text-left text-sm leading-7">
            <caption className="sr-only">
              Criterion scope, limitations, and primary references
            </caption>
            <thead className="bg-blue-50 dark:bg-slate-900">
              <tr>
                <th scope="col" className="p-4">
                  Check
                </th>
                <th scope="col" className="p-4">
                  Measured evidence
                </th>
                <th scope="col" className="p-4">
                  Limits and basis
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const basis = criterionBasis(entry.id);
                return (
                  <tr
                    key={entry.id}
                    className="border-t border-slate-200 align-top dark:border-slate-700"
                  >
                    <th scope="row" className="p-4 font-semibold">
                      {entry.name}
                    </th>
                    <td className="p-4">{entry.measure}</td>
                    <td className="p-4">
                      <p>{entry.limit}</p>
                      <span className="mt-2 block text-xs font-semibold">
                        {basis.label}
                      </span>
                      {basis.references.map((ref) => (
                        <a
                          key={ref.url}
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block text-[#4058d0] underline dark:text-blue-200"
                        >
                          {ref.name}
                        </a>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-sm leading-7">
          A five-word paragraph can be incomplete. An engaging introduction can
          be useful. Our tool does not label either citation-ready from length
          alone.
        </p>
        <p className="mt-3 text-sm leading-7">
          GEO research reports effects within specific experiments. Those
          findings do not validate a universal page score or guarantee results
          across search systems.
        </p>
        <a
          href="https://arxiv.org/abs/2311.09735"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex text-sm text-[#4058d0] underline dark:text-blue-200"
        >
          Read the original GEO research
        </a>
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          References reviewed October 24, 2026. Actual citations and indexing
          require separate measurements.
        </p>
      </div>
    </section>
  );
}

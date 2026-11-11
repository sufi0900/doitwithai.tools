import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import {
  ToolHeroBackground,
  toolHeroSurface,
  toolHeroHeading,
} from "@/features/tool-ui/ToolHero";
import type { Metadata } from "next";
import Link from "next/link";
import SeoRoiCalculatorClient from "@/features/seo-roi-calculator/SeoRoiCalculatorClient";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/seo-roi-calculator";
const description =
  "Calculate your projected 12-month SEO return on investment, monthly organic budget, and break-even timeline using real traffic, conversion, and LTV metrics.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({
  title: "SEO ROI, Cost & Budget Calculator",
  category: "AI SEO · Financial Modeling",
  ctaText: "Forecast. Budget. Scale.",
  features: "12-Month ROI Curve,Break-Even Timeline,CFO Budget Split",
})}`;

export const metadata: Metadata = {
  title: "Free SEO ROI & Cost Calculator: Forecast Traffic & Revenue",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free SEO ROI & Cost Calculator: Forecast Traffic & Revenue",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free SEO ROI & Cost Calculator: Forecast Traffic & Revenue",
    description,
    images: [image],
  },
};

const faqs = [
  [
    "How do you calculate SEO ROI?",
    "The standard SEO ROI formula is: ((Organic Revenue from SEO − Total SEO Cost) ÷ Total SEO Cost) × 100. For example, if you invest $42,000 over 12 months and generate $147,000 in attributed organic customer revenue, your net profit is $105,000 and your 12-month SEO ROI is +250% (a 3.5x return multiple).",
  ],
  [
    "Why does this SEO ROI calculator use a 12-month ramp curve instead of flat monthly numbers?",
    "Unlike paid ads that turn on and off immediately, new SEO pages require crawling, indexing, internal link authority, and SERP testing before reaching peak positions. Modeling a gradual 12-month maturity curve (starting around 12% in Month 1 and compounding past 100% by Months 9–12) produces realistic break-even expectations.",
  ],
  [
    "How much should a small business, SaaS startup, or enterprise budget for SEO?",
    "Local and small businesses typically invest $1,000 to $2,500 per month focused on Google Business Profile and local service pages; growth-stage SaaS and e-commerce brands usually invest $3,000 to $7,500 per month on topic clusters and interactive tools; enterprise SEO programs often invest $10,000 to $25,000+ per month across technical architecture, digital PR, and programmatic scale.",
  ],
  [
    "What is a realistic organic click-through rate (CTR) to enter into the calculator?",
    "Average organic CTR depends heavily on your average ranking position and whether Google displays an AI Overview or Local Map Pack. Typical desktop benchmarks are ~27.6% for Position #1, ~15.8% for Position #2, ~11.0% for Position #3, ~6.5%–8.0% for Positions #4–5, and ~2.5%–3.5% for Positions #6–10.",
  ],
  [
    "How should I split my monthly SEO cost across different activities?",
    "For most content- and tool-driven websites, a balanced allocation dedicates 45% to high-intent content and interactive tools, 25% to technical SEO, schema markup, and AEO/GEO optimization, 20% to digital PR and authority building, and 10% to analytics, Search Console audits, and testing.",
  ],
  [
    "What is a healthy Organic Customer Acquisition Cost (CAC) to LTV ratio?",
    "In B2B, SaaS, and recurring service businesses, a Customer Lifetime Value to CAC ratio (LTV:CAC) of 3:1 or higher is considered healthy, while 5:1+ indicates strong compounding organic efficiency once initial content production costs are amortized.",
  ],
];

const ROI_PROMPTS = [
  {
    title: "1. SEO Budget Allocation & Sprint Planner Prompt",
    badge: "Budget Planning",
    prompt: `Act as a VP of Organic Growth. I have a monthly SEO budget of $[Monthly Budget] for a [B2B SaaS / E-Commerce / Local Service] business with an average customer LTV of $[LTV]. Break this budget down into a 90-day execution roadmap across technical fixes, bottom-of-funnel pages, interactive tools, and authority building.`,
  },
  {
    title: "2. Bottom-of-Funnel vs. Top-of-Funnel ROI Prioritizer",
    badge: "Conversion Modeling",
    prompt: `Compare the 6-month revenue potential of targeting 5,000 monthly searches of high-intent commercial keywords (3.5% conversion rate) versus 50,000 monthly searches of top-of-funnel informational keywords (0.3% conversion rate) for a product priced at $[Price].`,
  },
];

const prose = "mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300";

export default function SeoRoiCalculatorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "SEO ROI, Cost & Budget Calculator",
        alternateName: [
          "Enterprise SEO ROI Calculator",
          "SEO Cost Calculator",
          "SEO Budget Calculator",
        ],
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "HowTo",
        name: "How to Forecast SEO ROI and Monthly SEO Cost",
        description:
          "Calculate 12-month organic search revenue, break-even timeline, and monthly budget allocation in 4 steps.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Enter your monthly SEO investment",
            text: "Input your planned monthly SEO budget (in-house, agency, content, and tooling costs) or choose one of the 4 industry benchmark presets.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Set target search volume and expected CTR",
            text: "Enter the combined monthly search volume of your target keyword clusters and select a realistic organic click-through rate based on target ranking positions.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Input conversion rate and customer LTV",
            text: "Add your visitor-to-lead conversion rate, lead-to-customer close rate, and average Customer Lifetime Value (LTV) or order value.",
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "Review 12-month break-even and export CSV",
            text: "Inspect the month-by-month compounding schedule, budget allocation split, and download the 12-month CSV financial model.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "SEO ROI, Cost & Budget Calculator", item: pageUrl },
        ].map((s, i) => ({ "@type": "ListItem", position: i + 1, ...s })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <div className={`relative overflow-hidden ${toolHeroSurface} text-white`}>
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">SEO ROI, Cost &amp; Budget Calculator</span>
          </nav>

          <div className="mb-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                AI SEO · FINANCIAL FORECASTING &amp; BUDGET MODELING
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                SEO ROI, Cost &amp;{" "}
                <span className={toolHeroHeading}>
                  Budget Calculator
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Forecast your 12-month organic traffic, customer acquisition
                cost (CAC), break-even month, and net return on investment—built
                for solo founders, agencies, and enterprise SEO teams.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  12-Month Compounding Curve
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  4 Industry Presets (SaaS, Enterprise, E-Com, Local)
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  CSV Financial Export
                </span>
              </div>
              <PortableToolHeroBar />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                What This Calculator Models
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">
                    Net ROI % &amp; Return Multiple:
                  </strong>{" "}
                  Calculates exact 12-month profit and return multiple on your
                  SEO spend.
                </li>
                <li>
                  <strong className="text-indigo-300">
                    Break-Even Timeline:
                  </strong>{" "}
                  Pinpoints the exact month cumulative revenue overtakes
                  cumulative budget.
                </li>
                <li>
                  <strong className="text-sky-300">
                    Smart Budget Allocation:
                  </strong>{" "}
                  Splits monthly spend across Content, Technical/AEO, Digital
                  PR, and Tooling.
                </li>
                <li>
                  <strong className="text-amber-300">
                    AI CFO Investment Memo:
                  </strong>{" "}
                  Generates an executive summary ready for stakeholders or
                  clients.
                </li>
              </ul>
            </div>
          </div>

          <SeoRoiCalculatorClient />
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        {/* 50-WORD FORMULA & QUICK ANSWER */}
        <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-7 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
            Core Formula &amp; Methodology
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            How to Calculate SEO ROI, Monthly Cost, and Break-Even
          </h2>
          <p className={prose}>
            To calculate <strong>SEO Return on Investment (ROI)</strong>,
            subtract your total SEO investment from the organic revenue
            generated, divide by your total SEO cost, and multiply by 100:{" "}
            <code>
              SEO ROI (%) = ((Organic Revenue − SEO Cost) ÷ SEO Cost) × 100
            </code>
            . Because organic rankings build progressively over time, our model
            applies a 12-month indexing and authority ramp curve rather than
            assuming instant Month-1 traffic.
          </p>
        </section>

        {/* BENCHMARK TABLE */}
        <section>
          <h2 className="text-3xl font-black">
            2026 SEO Cost &amp; ROI Benchmarks by Business Model
          </h2>
          <p className={prose}>
            Use these typical monthly investment ranges and conversion
            benchmarks when stress-testing your forecast:
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Business Tier</th>
                  <th className="px-4 py-3.5">Typical Monthly SEO Budget</th>
                  <th className="px-4 py-3.5">Primary Traffic &amp; Conversion Driver</th>
                  <th className="px-4 py-3.5">Typical Break-Even Window</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    Local Business &amp; Service SMB
                  </td>
                  <td className="px-4 py-3.5">$1,000 – $2,500 / mo</td>
                  <td className="px-4 py-3.5">
                    Google Business Profile (Map Pack) + City Service Pages
                  </td>
                  <td className="px-4 py-3.5">Months 3 – 5</td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    Growth B2B SaaS &amp; Startups
                  </td>
                  <td className="px-4 py-3.5">$3,000 – $7,500 / mo</td>
                  <td className="px-4 py-3.5">
                    Free Interactive Tools + Comparison &amp; Problem Guides
                  </td>
                  <td className="px-4 py-3.5">Months 5 – 8</td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    E-Commerce &amp; DTC Brands
                  </td>
                  <td className="px-4 py-3.5">$2,500 – $6,000 / mo</td>
                  <td className="px-4 py-3.5">
                    Category Pages + Product Schema + Buying Guides
                  </td>
                  <td className="px-4 py-3.5">Months 4 – 7</td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    Enterprise SEO Programs
                  </td>
                  <td className="px-4 py-3.5">$10,000 – $25,000+ / mo</td>
                  <td className="px-4 py-3.5">
                    Programmatic Architecture + Digital PR + AEO Citations
                  </td>
                  <td className="px-4 py-3.5">Months 4 – 6</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* PROMPTS */}
        <section>
          <h2 className="text-3xl font-black">
            Copy-Paste Prompts for SEO Budgeting &amp; Forecasting
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {ROI_PROMPTS.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-[#4662df] dark:text-blue-300">
                  {item.badge}
                </span>
                <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-200">
                  {item.prompt}
                </pre>
              </article>
            ))}
          </div>
        </section>

        {/* FAQS */}
        <section>
          <h2 className="text-3xl font-black">
            Frequently Asked Questions: SEO ROI &amp; Cost Calculator
          </h2>
          <div className="mt-7 divide-y divide-slate-200 rounded-3xl border border-slate-200 px-6 dark:divide-slate-800 dark:border-slate-800">
            {faqs.map(([q, a]) => (
              <details key={q} className="py-5" open>
                <summary className="cursor-pointer text-base font-bold leading-7">
                  {q}
                </summary>
                <p className={prose}>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <ToolResources slug="seo-roi-calculator" />
      </div>
    </>
  );
}

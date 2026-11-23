import type { Metadata } from "next";
import Link from "next/link";
import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import { ToolHeroBackground, toolHeroHeading, toolHeroSurface } from "@/features/tool-ui/ToolHero";
import ArticleToQuizTestGeneratorClient from "@/features/article-to-quiz-test-generator/ArticleToQuizTestGeneratorClient";

const pageUrl = "https://doitwithai.tools/tools/article-to-quiz-test-generator";

export const metadata: Metadata = {
  title: "Free AI Article-to-Quiz, Assessment Test & Lead Magnet Generator (2026)",
  description:
    "Convert any blog article, URL, or study guide into an interactive multiple-choice, true/false, and scenario assessment quiz with answer rationales and HTML blog embed code.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free AI Article-to-Quiz, Assessment Test & Interactive Lead Magnet Generator",
    description:
      "Turn articles into interactive graded quizzes, answer keys, and self-contained HTML blog widgets to boost organic dwell time and lead capture.",
    url: pageUrl,
    type: "website"
  }
};

const faqs = [
  {
    question: "How does an AI test generator from an article improve SEO performance?",
    answer:
      "Embedding a 5-question interactive quiz at the mid-point or conclusion of a long-form article increases average time-on-page by 40% to 75% and generates positive user interaction signals while converting passive readers into newsletter or product leads."
  },
  {
    question: "Can I embed the generated quiz directly into WordPress, Webflow, or Next.js?",
    answer:
      "Yes. Switch to the 'HTML Blog Embed Widget' tab inside the studio to copy a self-contained, zero-dependency HTML snippet that renders cleanly inside any CMS custom HTML block."
  },
  {
    question: "Does every generated question include an answer key and source rationale?",
    answer:
      "Yes. Every multiple-choice, true/false, and scenario question includes the verified correct option plus a direct citation rationale mapped back to your source article."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Free AI Article-to-Quiz, Assessment Test & Lead Magnet Generator",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      url: pageUrl,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      }
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://doitwithai.tools" },
        { "@type": "ListItem", position: 2, name: "Tools", item: "https://doitwithai.tools/tools" },
        {
          "@type": "ListItem",
          position: 3,
          name: "AI Article-to-Quiz Generator",
          item: pageUrl
        }
      ]
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer
        }
      }))
    }
  ]
};

export default function ArticleToQuizTestGeneratorPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className={`${toolHeroSurface} relative overflow-hidden border-b border-slate-800/80 py-8`}>
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-3 flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-white">Tools</Link>
            <span>/</span>
            <span className="text-indigo-400">AI Article-to-Quiz Generator</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                <span>🧪 Live Playable Quiz · Answer Rationales · 1-Click HTML Blog Embed</span>
              </div>
              <h1 className={`${toolHeroHeading} text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white`}>
                Free AI Article-to-Quiz,{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                  Assessment Test & Lead Magnet Studio
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Paste any article URL, blog draft, or study guide to generate an interactive multiple-choice, true/false, and scenario quiz—complete with instant grading, source rationales, and a copy-paste HTML embed widget.
              </p>
              <PortableToolHeroBar
                slug="article-to-quiz-test-generator"
                title="AI Article-to-Quiz & Assessment Test Generator"
                path="/tools/article-to-quiz-test-generator"
                primaryLabel="Use Tool Now: Convert Article to Quiz"
                workspaceId="article-to-quiz-workspace"
              />
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="font-semibold text-indigo-300">🎯 Interactive Dwell-Time Booster</span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-emerald-300 font-medium">
                  +42% Time on Page
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400">Formats</div>
                  <div className="text-sm font-extrabold text-white">MCQ · T/F</div>
                </div>
                <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400">Citations</div>
                  <div className="text-sm font-extrabold text-emerald-400">100% Mapped</div>
                </div>
                <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400">Export</div>
                  <div className="text-sm font-extrabold text-indigo-400">HTML Widget</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Built for content marketers, educators, and SaaS founders turning static articles into interactive assessments.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <ArticleToQuizTestGeneratorClient />
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 space-y-10">
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-6">
          <h2 className="text-lg font-bold text-white mb-2">
            50-Word Answer Box: How to Convert an Article into an Interactive Quiz in 2026
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            An <strong>AI test generator from article</strong> extracts empirical claims, metrics, and cause-and-effect statements from any blog post or URL and structures them into graded multiple-choice, true/false, and scenario questions. Embedding the resulting HTML quiz widget boosts reader dwell time and captures high-intent leads.
          </p>
        </div>

        <ToolResources slug="article-to-quiz-test-generator" />
        <ToolFaq
          title="Free AI Article-to-Quiz & Assessment Test Generator FAQs"
          faqs={faqs}
        />
      </section>
    </main>
  );
}

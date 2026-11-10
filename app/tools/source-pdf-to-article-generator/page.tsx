import type { Metadata } from "next";
import Link from "next/link";
import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import { ToolHeroBackground, toolHeroHeading, toolHeroSurface } from "@/features/tool-ui/ToolHero";
import SourcePdfToArticleGeneratorClient from "@/features/source-pdf-to-article-generator/SourcePdfToArticleGeneratorClient";

const pageUrl = "https://doitwithai.tools/tools/source-pdf-to-article-generator";

export const metadata: Metadata = {
  title: "Free AI Source, PDF, Interview & NotebookLM-to-Article Converter Studio",
  description:
    "Convert NotebookLM research notes, PDF whitepaper extracts, and SME interview transcripts into a citation-mapped, E-E-A-T SEO article with [S1]/[S2]/[S3] footnotes.",
  alternates: {
    canonical: pageUrl
  },
  openGraph: {
    title: "Free AI Source, PDF, Interview & NotebookLM-to-Article Converter Studio",
    description:
      "Unlimited free PDF-to-article, NotebookLM source synthesizer, and Pressmaster-style interview-to-article converter with explicit source footnotes.",
    url: pageUrl,
    type: "website"
  }
};

const faqs = [
  {
    question: "How do I turn NotebookLM sources and notes into an SEO-ready article?",
    answer:
      "Paste your NotebookLM study guide or audio overview notes into Source [S1], add a founder or practitioner quote into Source [S2], and include your benchmark metrics in Source [S3]. The studio synthesizes all three into an H1/H2 structured article with a 50-word AEO answer box and inline [S1]–[S3] citations."
  },
  {
    question: "Is this PDF-to-article AI converter completely free and unlimited?",
    answer:
      "Yes. Unlike credit-capped PDF-to-blog SaaS tools or paid Pressmaster AI interview plans, our browser + 4-tier AI synthesis studio is 100% free with no signup wall or daily word limit."
  },
  {
    question: "Why does multi-source synthesis rank better than 1-click keyword prompts?",
    answer:
      "Google's March 2026 systems reward verifiable information gain. Combining PDF research ([S1]), human interview quotes ([S2]), and empirical benchmarks ([S3]) creates original cross-source connections that generic single-prompt AI writers cannot replicate."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Free AI Source, PDF, Interview & NotebookLM-to-Article Converter Studio",
      applicationCategory: "BusinessApplication",
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
          name: "Source, PDF & NotebookLM-to-Article Studio",
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

export default function SourcePdfToArticleGeneratorPage() {
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
            <span className="text-indigo-400">Source, PDF & NotebookLM-to-Article Studio</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                <span>📑 NotebookLM + PDF + Interview Synthesis · [S1]/[S2]/[S3] Footnotes</span>
              </div>
              <h1 className={`${toolHeroHeading} text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white`}>
                Free AI Source, PDF, Interview &{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                  NotebookLM-to-Article Converter
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Combine NotebookLM research briefs, PDF whitepaper extracts, and founder or SME interview transcripts into a citation-mapped long-form SEO article with explicit <code className="text-indigo-300">[S1]</code>, <code className="text-emerald-300">[S2]</code>, and <code className="text-amber-300">[S3]</code> footnotes.
              </p>
              <PortableToolHeroBar
                slug="source-pdf-to-article-generator"
                title="AI Source, PDF & NotebookLM-to-Article Studio"
                path="/tools/source-pdf-to-article-generator"
                primaryLabel="Use Tool Now: Synthesize Sources into Article"
                workspaceId="source-pdf-to-article-workspace"
              />
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="font-semibold text-indigo-300">🔬 Zero-Hallucination Citation Ledger</span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-emerald-300 font-medium">
                  Free Unlimited
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                  <div className="text-[10px] uppercase text-cyan-300">[S1] Input</div>
                  <div className="text-xs font-extrabold text-white mt-0.5">PDF / Notes</div>
                </div>
                <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                  <div className="text-[10px] uppercase text-emerald-300">[S2] Input</div>
                  <div className="text-xs font-extrabold text-white mt-0.5">SME Interview</div>
                </div>
                <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                  <div className="text-[10px] uppercase text-amber-300">[S3] Input</div>
                  <div className="text-xs font-extrabold text-white mt-0.5">Metrics Proof</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Replaces single-source PDF converters and paid interview-to-article apps with a unified 3-source E-E-A-T studio.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <SourcePdfToArticleGeneratorClient />
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 space-y-10">
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-6">
          <h2 className="text-lg font-bold text-white mb-2">
            50-Word Answer Box: AI NotebookLM Source, PDF & Interview-to-Article Generator
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            An <strong>AI NotebookLM source to article generator</strong> and <strong>PDF-to-article converter</strong> transforms raw research notes, technical documents, and voice interview transcripts into structured H2/H3 blog posts. By attaching explicit <code className="text-indigo-300">[S1]</code>, <code className="text-indigo-300">[S2]</code>, and <code className="text-indigo-300">[S3]</code> footnotes to every claim, it guarantees high E-E-A-T information gain.
          </p>
        </div>

        <ToolResources slug="source-pdf-to-article-generator" />
        <ToolFaq
          title="Free AI Source, PDF & NotebookLM-to-Article Converter FAQs"
          faqs={faqs}
        />
      </section>
    </main>
  );
}

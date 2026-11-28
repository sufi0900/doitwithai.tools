import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import ArticleToQuizTestGeneratorClient from "@/features/article-to-quiz-test-generator/ArticleToQuizTestGeneratorClient";

const pageUrl = "https://doitwithai.tools/tools/article-to-quiz-test-generator";

export const metadata: Metadata = {
  title: "Free AI Article-to-Quiz & Test Generator (MCQ + HTML Embed)",
  description:
    "Paste any article, URL, or study guide to generate an interactive MCQ & True/False assessment quiz with answer rationales and 1-click HTML blog embed code.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free AI Article-to-Quiz & Test Generator (MCQ + HTML Embed)",
    description:
      "Turn blog articles and study notes into interactive graded quizzes, answer keys, and zero-dependency HTML widgets to boost dwell time.",
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
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ToolLandingHero
        slug="article-to-quiz-test-generator"
        title="Free AI Article-to-Quiz, Assessment Test & Lead Magnet Studio"
        description="Paste any article URL, blog draft, or study guide to generate an interactive multiple-choice, true/false, and scenario quiz—complete with instant grading, source rationales, and a copy-paste HTML embed widget."
        categoryLabel="AI SEO Tools"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <ArticleToQuizTestGeneratorClient />
        </div>
      </ToolLandingHero>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 space-y-10">
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-6">
          <h2 className="text-lg font-bold text-white mb-2">
            How to Convert Any Article or URL into an Interactive Quiz
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            An <strong>AI test generator from article</strong> extracts key facts, definitions, and cause-and-effect takeaways from your blog post or study guide and turns them into graded multiple-choice, true/false, and scenario questions with source rationales. Draft your post first in our{" "}
            <Link href="/ai-content-writer" className="font-semibold text-indigo-300 underline hover:text-white">
              Flagship AI Content Writer
            </Link>
            , check clarity with the{" "}
            <Link href="/tools/readability-checker" className="font-semibold text-indigo-300 underline hover:text-white">
              Readability Checker
            </Link>
            , or embed your quiz directly inside a site built with our{" "}
            <Link href="/ai-website-builder" className="font-semibold text-indigo-300 underline hover:text-white">
              AI Tool &amp; Blog Website Builder
            </Link>
            .
          </p>
        </div>

        <ToolResources slug="article-to-quiz-test-generator" />
        <ToolFaq
          title="Free AI Article-to-Quiz & Assessment Test Generator FAQs"
          faqs={faqs}
        />
      </section>
    </div>
  );
}

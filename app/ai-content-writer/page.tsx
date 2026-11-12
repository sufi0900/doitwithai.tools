import type { Metadata } from "next";
import WriterWorkspace from "@/features/writer-workspace/WriterWorkspace";
import RecentUrlsProvider from "@/features/tool-ui/recent-urls/RecentUrlsProvider";
import ToolFaq from "@/features/tool-ui/ToolFaq";
const pageUrl = "https://doitwithai.tools/ai-content-writer";
const title =
  "AI Content Writer: Your Article & Publishing Studio | DoItWithAI";
const description =
  "Turn an idea, keyword or outline into an editable article. Plan, write and review your draft, then create section images, social posts and a downloadable publishing kit.";
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title,
    description,
    url: pageUrl,
    type: "website",
    images: ["https://doitwithai.tools/ogimage.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://doitwithai.tools/ogimage.png"],
  },
};
const faqs = [
  {
    question: "What can I use to start an article?",
    answer:
      "Start with a rough idea, keywords, a detailed prompt or your own H2/H3 outline. Writing preferences and reference URLs are optional. You can also type or paste a draft directly into the editor.",
  },
  {
    question: "Can I edit the outline and article?",
    answer:
      "Yes. Review and edit the outline before drafting. The article stays in a rich-text editor, with separate fields for its meta title, description and page address. AI suggestions are reviewable and your manual edits are preserved.",
  },
  {
    question: "Where are my projects saved?",
    answer:
      "Projects are saved in this browser when local storage is available. Export a project backup to keep a portable copy or move to another browser. Open preview testing does not require sign-in; cloud synchronization is not part of this workspace.",
  },
  {
    question: "What does the publishing kit contain?",
    answer:
      "Download the article, section infographics, editable social drafts and images, an email newsletter, and a LinkedIn carousel. PDF, DOCX, HTML, Markdown and EPUB formats are available. Optional narration uses the configured speech service. The ZIP manifest lists any files that could not be prepared.",
  },
  {
    question: "Does the review score guarantee rankings or accuracy?",
    answer:
      "No. It explains local readability, structure, metadata and source-presence checks. Review factual claims, references, originality and brand voice before publishing. Nothing is published automatically.",
  },
];
export default function AiContentWriterPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "DoItWithAI AI Content Writer",
    url: pageUrl,
    description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
  };
  return (
    <div className="bg-[#f4f6fc] px-3 pb-12 pt-5 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-1">
          <div>
            <h1 className="text-[23px] font-bold tracking-tight text-[#18243e]">
              AI Content Writer
            </h1>
            <p className="mt-1 text-[13px] text-[#71809a]">
              Start with an idea, an outline, or a draft. Make it yours in the
              editor.
            </p>
          </div>
          <a
            href="#writer-help"
            className="text-xs font-semibold text-[#4867ff] hover:underline"
          >
            How it works ↓
          </a>
        </div>
        <RecentUrlsProvider>
          <WriterWorkspace />
        </RecentUrlsProvider>
        <section
          id="writer-help"
          className="mx-auto mt-12 max-w-4xl text-[#18243e]"
        >
          <ToolFaq faqs={faqs} />
        </section>
      </div>
    </div>
  );
}

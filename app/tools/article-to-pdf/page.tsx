import type { Metadata } from "next";
import Link from "next/link";
import ArticlePdfClient from "@/features/article-conversion/ArticlePdfClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
const pageUrl = "https://doitwithai.tools/tools/article-to-pdf",
  title = "Article to PDF Converter | Review, Edit and Download",
  description =
    "Convert an article URL or pasted content into a clean PDF. Review the extracted text, choose A4 or Letter, and include supported article images.";
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
    question: "How do I convert an article to PDF?",
    answer:
      "Enter a public article URL and create a preview. Review the title, source details, and article sections. Edit or remove sections, choose layout settings, then create and download the PDF.",
  },
  {
    question: "Can I save an article when URL import fails?",
    answer:
      "Use Paste text or Paste HTML for content you have permission to save. Login walls, paywalls, browser challenges, and JavaScript-only pages cannot be reliably imported. The tool does not bypass access controls.",
  },
  {
    question: "Is this an actual downloadable PDF?",
    answer:
      "Yes. The tool creates a real PDF in your browser with embedded fonts, page numbers, article text, table cells, and supported selected images. It does not require a browser print dialog.",
  },
  {
    question: "Does it preserve the exact website design?",
    answer:
      "No. It creates a reading copy rather than a screenshot. Headings, paragraphs, lists, table cells, and link references are retained where extraction supports them. Website layouts, scripts, and interactive media are omitted.",
  },
  {
    question: "Can I edit the extracted article?",
    answer:
      "Yes. Change the title, byline, and date. Edit or remove text sections and edit table cells as tab-separated rows. Check that numbered link references still match after editing.",
  },
  {
    question: "What happens to links and images?",
    answer:
      "HTTP and HTTPS links become numbered references and a clickable list. Up to six image references can be selected. Only selected images are requested. Public PNG/JPEG files up to 1.5 MB and 12 megapixels are supported. Failed images are omitted with warnings.",
  },
  {
    question: "Can I change the PDF layout?",
    answer:
      "Optional controls provide A4 or Letter, text sizes from 10 to 14 points, three margin choices, and automatic or explicit text direction.",
  },
  {
    question: "Does it support Urdu?",
    answer:
      "The export embeds Latin and Arabic-script fonts and uses shaping and text-direction controls. English and Urdu exports are checked. Review mixed-language text and unusual symbols. Unsupported font characters produce an explicit error.",
  },
  {
    question: "How much content can I convert?",
    answer:
      "The preview supports 80,000 characters and 300 blocks, with 12,000 characters per text block. Tables are limited to 100 rows and eight columns. Import notes disclose limited content. Split long articles when needed.",
  },
  {
    question: "Is source metadata verified?",
    answer:
      "No. A byline or date is copied only when found. Missing fields remain blank. Review attribution and publication information against the original before saving.",
  },
  {
    question: "Where is article processing performed?",
    answer:
      "URL imports and selected image requests use our server. Pasted text, pasted HTML parsing, editing, and PDF creation happen in your browser. This feature does not send article text to an AI provider or save edits between visits.",
  },
  {
    question: "Do edits update an existing PDF automatically?",
    answer:
      "No. An existing PDF remains available. A notice appears when the article or layout changes. Create the PDF again to include your latest edits, and download before leaving the page.",
  },
];
const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6",
  text = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Article to PDF",
        url: pageUrl,
        description,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Article to PDF", item: pageUrl },
        ].map((item, i) => ({ "@type": "ListItem", position: i + 1, ...item })),
      },
    ],
  };
  return (
    <div className="bg-white text-slate-900 dark:bg-[#0F1523] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <header className="relative isolate overflow-hidden bg-[#241B25] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <nav
            aria-label="Breadcrumb"
            className="mb-7 flex flex-wrap gap-2 text-xs text-orange-100/80"
          >
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <Link href="/tools/categories/content-conversion">
              Content conversion
            </Link>
            <span>/</span>
            <span aria-current="page">Article to PDF</span>
          </nav>
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.8fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-200">
                Content conversion · Clean reading copies
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Article to PDF{" "}
                <span className="text-orange-300">keep a readable copy</span>
              </h1>
              <p className="mt-5 text-base leading-8 text-orange-50/80">
                Turn an article URL or pasted content into a clean PDF. Review
                the source, make corrections, and choose a comfortable reading
                layout.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-orange-100">
                {[
                  "Review before export",
                  "A4 and Letter",
                  "Real PDF download",
                ].map((label) => (
                  <span
                    key={label}
                    className="rounded-lg border border-orange-200/25 px-3 py-2"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-orange-200/25 bg-[#352630] p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-orange-200">
                Your reading copy
              </p>
              <ol className="mt-5 space-y-4 text-sm leading-7">
                <li>1. Import an article or paste its content</li>
                <li>2. Review and edit the extracted preview</li>
                <li>3. Create the PDF and save it</li>
              </ol>
            </div>
          </div>
        </div>
      </header>
      <ArticlePdfClient />
      <section className={section}>
        <h2 className="text-2xl font-extrabold">
          Save an article without the page clutter
        </h2>
        <p className={text}>
          An article PDF is useful for offline reading, printing, sharing a
          reference, or keeping notes beside a stable copy. Menus,
          advertisements, and unrelated recommendations can make a normal
          webpage difficult to read on paper.
        </p>
        <p className={text}>
          This converter focuses on the article rather than the entire website
          design. It extracts a reading structure, lets you remove unwanted
          sections, and creates a paginated file. Compare the preview with the
          source so that important context is not lost.
        </p>
      </section>
      <section
        className={`${section} border-y border-slate-100 dark:border-slate-800`}
      >
        <h2 className="text-2xl font-extrabold">Three ways to start</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            [
              "Article URL",
              "Use one public article page. The importer reads a bounded HTML response and looks for the main article. It cannot sign in, execute page scripts, or recover hidden paywalled text.",
            ],
            [
              "Pasted text",
              "Use this when you already have a reading copy. Blank lines separate paragraphs, and # headings create sections. Plain text cannot recover original image files or link destinations.",
            ],
            [
              "Copied HTML",
              "Use HTML when you need headings, lists, tables, or relative references. Supply a source URL for relative addresses. Supported structure becomes text fields without running scripts.",
            ],
          ].map(([heading, body]) => (
            <div key={heading}>
              <h3 className="text-lg font-bold text-[#9A3412] dark:text-[#FDBA74]">
                {heading}
              </h3>
              <p className={text}>{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className={section}>
        <h2 className="text-2xl font-extrabold">
          Review the details that make a PDF useful
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {[
            [
              "Keep the context",
              "Check the title, source, byline, date, and limitations stated in the article. Missing metadata stays blank rather than being guessed.",
            ],
            [
              "Clean up extraction",
              "Remove navigation fragments and unrelated sections. Correct heading text, repair table cells, and keep the explanation that makes quotations meaningful.",
            ],
            [
              "Choose images deliberately",
              "Image references start unselected. Include illustrations needed to understand the text, then check export warnings for blocked or unsupported files.",
            ],
            [
              "Check the finished file",
              "Open the PDF before sharing. Review page breaks, tables, links, and mixed-language text. A readable layout still needs a final content check.",
            ],
          ].map(([heading, body]) => (
            <div key={heading}>
              <h3 className="text-lg font-bold">{heading}</h3>
              <p className={text}>{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className={`${section} bg-orange-50/50 dark:bg-orange-950/10`}>
        <h2 className="text-2xl font-extrabold">
          Example: prepare a reading copy for a review meeting
        </h2>
        <p className={text}>
          Suppose an article contains a useful explanation, a comparison table,
          and several decorative images. Import it, check the attribution, and
          remove unrelated recommendations. Keep the table and select only the
          illustration that explains the process.
        </p>
        <p className={text}>
          Choose Letter for a team using that paper size, or keep A4. Increase
          the text size for comfortable reading. Create the file, check it, and
          download before leaving. The fictional example in the form lets you
          test this workflow first.
        </p>
      </section>
      <section className={section}>
        <h2 className="text-2xl font-extrabold">
          Understand the export limits
        </h2>
        <p className={text}>
          The output retains reviewed wording, headings, list content, bounded
          table cells, source attribution, numbered link references, and
          selected PNG/JPEG images. Complex layouts, merged table styling,
          embedded media, and script-drawn charts are simplified or omitted.
        </p>
        <p className={text}>
          Use content you own or have permission to save and share. If
          extraction is incomplete, use pasted content and compare it with the
          original. For a separate editorial check before exporting, try the{" "}
          <Link
            href="/tools/readability-checker"
            className="text-[#3452d1] underline dark:text-[#b4c3ff]"
          >
            AI Readability Checker
          </Link>
          .
        </p>
        <Link
          href="/tools/categories/content-conversion"
          className="mt-6 inline-flex rounded-xl border border-orange-200 px-5 py-3 text-sm font-bold text-[#9A3412] dark:border-orange-800 dark:text-[#FDBA74]"
        >
          Explore Content Conversion Tools
        </Link>
      </section>
      <ToolFaq title="Article to PDF questions" faqs={faqs} />
    </div>
  );
}

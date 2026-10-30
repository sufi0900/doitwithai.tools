import type { Metadata } from "next";
import Link from "next/link";
import ArticlePdfClient from "@/features/article-conversion/ArticlePdfClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
const pageUrl = "https://doitwithai.tools/tools/article-to-word";
const title = "Article to Word Converter | Editable DOCX Download";
const description =
  "Convert a public article URL or pasted text and HTML to an editable Word document. Review headings, lists, tables, source links, and selected images before downloading DOCX.";
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
    question: "How do I convert an article URL to Word?",
    answer:
      "Enter one public article URL and create a preview. Check the extracted title, source details, and text. Edit or remove sections, select useful images, then create and download DOCX. Open the file in Word or another compatible editor.",
  },
  {
    question: "Is the Word file actually editable?",
    answer:
      "Yes. The download is a native DOCX package with paragraphs, heading styles, numbered or bulleted lists, and editable table cells. It is not a screenshot or HTML file renamed as Word. Text embedded inside images remains an image; there is no OCR.",
  },
  {
    question: "What if the website blocks the importer?",
    answer:
      "Use Paste text or Paste HTML for content you have permission to use. Login walls, paywalls, challenges, and JavaScript-only content cannot be reliably imported. The tool does not bypass access controls. Plain text retains paragraphs and # headings; HTML can retain more structure.",
  },
  {
    question: "Will the document look exactly like the webpage?",
    answer:
      "No. The converter produces a clean editing layout. Website CSS, complex columns, merged table styling, scripts, videos, and interactive content are simplified or omitted. Nested list indentation is flattened. Compare the preview with the original before exporting.",
  },
  {
    question: "Can I keep images and links?",
    answer:
      "Source and article link references are clickable. Up to six selected public PNG/JPEG images can be embedded, with a 1.5 MB and 12 megapixel limit per image. Unselected images are not requested. Blocked or unsupported images are omitted with warnings in both the result and document.",
  },
  {
    question: "Does it support Urdu and other Unicode text?",
    answer:
      "DOCX stores Unicode text and uses paragraph direction settings. English and Urdu outputs are checked. Fonts are not embedded, so your editor needs suitable fonts and may substitute missing ones. Review mixed-language text, glyph coverage, and pagination after opening.",
  },
  {
    question: "Can I choose A4 or Letter?",
    answer:
      "Yes. Optional document layout controls offer A4 or Letter, 10–14 point body text, three margin settings, and automatic or explicit text direction. Page counts are not estimated because the final editor determines pagination.",
  },
  {
    question: "How much content can I export?",
    answer:
      "The shared preview supports up to 80,000 characters and 300 blocks, with 12,000 characters per text block. Tables are limited to 100 rows and eight columns; up to 80 link references are retained. Import notes disclose limits and uncertain extraction.",
  },
  {
    question: "Are my article and edits saved?",
    answer:
      "URL imports and selected image requests use our server. Pasted text/HTML, editing, and DOCX creation run in your browser. Article text is not sent to an AI provider. Edits and generated files are not saved between visits, so download before leaving. Recreate the DOCX after any edits.",
  },
  {
    question: "Is the source byline or date verified?",
    answer:
      "No. Metadata is copied only when found, and missing fields stay blank. Review attribution and date against the source. This tool converts content without fact-checking, rewriting, translating, or establishing reuse rights.",
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
        name: "Article to Word",
        url: pageUrl,
        description,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        isAccessibleForFree: true,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Tools",
            item: "https://doitwithai.tools/tools",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Content Conversion",
            item: "https://doitwithai.tools/tools/categories/content-conversion",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Article to Word",
            item: pageUrl,
          },
        ],
      },
    ],
  };
  return (
    <main className="bg-white text-slate-900 dark:bg-[#0F1523] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <header className="overflow-hidden bg-[#241B25] text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap gap-2 text-xs text-orange-100/80"
          >
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <Link href="/tools/categories/content-conversion">
              Content conversion
            </Link>
            <span>/</span>
            <span aria-current="page">Article to Word</span>
          </nav>
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.8fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-200">
                Content conversion · Editable documents
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Article to Word{" "}
                <span className="text-orange-300">ready for your edits</span>
              </h1>
              <p className="mt-5 text-base leading-8 text-orange-50/80">
                Turn a public article URL or pasted content into a clean DOCX.
                Review the source, remove unwanted sections, and keep the
                structure you need for editing in Word.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-orange-100">
                {[
                  "Native heading styles",
                  "Editable lists and tables",
                  "Real DOCX download",
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
                From article to working document
              </p>
              <ol className="mt-5 space-y-4 text-sm leading-7">
                <li>1. Import a URL or paste article content</li>
                <li>2. Check attribution and edit the preview</li>
                <li>3. Download DOCX and open it in your editor</li>
              </ol>
            </div>
          </div>
        </div>
      </header>
      <ArticlePdfClient format="docx" />
      <section className={section}>
        <h2 className="text-2xl font-extrabold">
          Keep the article structure for your next edit
        </h2>
        <p className={text}>
          An editable article copy helps when you need to annotate a source,
          prepare a training handout, revise your own published post, or collect
          material for a review meeting. Copying a webpage into Word can bring
          navigation, advertisements, and inconsistent formatting along with the
          useful text.
        </p>
        <p className={text}>
          This article to Word converter starts with a reviewable reading
          structure. The exported DOCX uses actual paragraph and heading styles,
          list numbering, and table cells so you can continue working in a
          document editor. Source attribution and a clickable reference list
          keep the original context close to the text.
        </p>
      </section>
      <section
        className={`${section} border-y border-slate-100 dark:border-slate-800`}
      >
        <h2 className="text-2xl font-extrabold">
          How to save a webpage article as DOCX
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            [
              "Import one article",
              "Use a public URL. If the page needs JavaScript or blocks access, paste permitted text or copied article HTML. Add a source URL to resolve relative links and image references.",
            ],
            [
              "Review before exporting",
              "Check headings, quotations, table cells, attribution, and date. Correct extraction mistakes, remove unrelated sections, and select only useful images. Original metadata is not independently verified.",
            ],
            [
              "Create and check the Word file",
              "Choose optional layout settings, create DOCX, and download. Open it in Word or another DOCX editor to inspect fonts, tables, and page breaks. Recreate the file after changing the preview.",
            ],
          ].map(([h, p]) => (
            <div key={h}>
              <h3 className="text-lg font-bold text-[#9A3412] dark:text-[#FDBA74]">
                {h}
              </h3>
              <p className={text}>{p}</p>
            </div>
          ))}
        </div>
      </section>
      <section className={section}>
        <h2 className="text-2xl font-extrabold">
          Example: turn your own blog post into a workshop handout
        </h2>
        <p className={text}>
          Import a published post you own. Remove promotional sections that the
          workshop does not need, correct the title, and retain the comparison
          table and relevant diagram. Use the source byline only after checking
          it. Choose A4 or Letter to match the workshop’s paper size, then
          create the DOCX.
        </p>
        <p className={text}>
          After downloading, open the document and add exercises or comments in
          your editor. Heading styles make the sections easier to navigate.
          Native table cells let you add a row or change a value. The form’s
          fictional example lets you test the entire conversion flow without
          supplying a real article.
        </p>
      </section>
      <section className={`${section} bg-orange-50/50 dark:bg-orange-950/10`}>
        <h2 className="text-2xl font-extrabold">
          Choose Word for editing or PDF for a reading copy
        </h2>
        <p className={text}>
          DOCX is useful when the wording or structure will change. A PDF is
          useful when you want a paginated copy to read or print. Document
          editors may use different fonts and page-break rules, so the Word
          file’s final layout can vary. This converter does not promise a
          pixel-perfect copy of the website.
        </p>
        <Link
          href="/tools/article-to-pdf"
          className="mt-6 inline-flex rounded-xl border border-orange-300 px-5 py-3 text-sm font-bold text-[#9A3412] dark:border-orange-800 dark:text-[#FDBA74]"
        >
          Create a reading copy with Article to PDF
        </Link>
      </section>
      <section className={section}>
        <h2 className="text-2xl font-extrabold">
          What the conversion retains and simplifies
        </h2>
        <p className={text}>
          Supported headings, paragraphs, list content, quotations, code text,
          bounded tables, link references, and selected PNG/JPEG images become
          document elements. Website styles, interactive charts, videos, merged
          table layout, and nested list indentation are not reproduced.
          Plain-text input cannot recover original links, tables, or images.
        </p>
        <p className={text}>
          Use material you own or have permission to save and adapt. Compare
          uncertain extraction with the source, and read any image omission
          warnings before sharing. The converter does not rewrite, translate,
          fact-check, unlock restricted pages, or make image text editable.
          Download before leaving because the working copy is not retained
          between visits.
        </p>
        <Link
          href="/tools/categories/content-conversion"
          className="mt-6 inline-flex rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold dark:border-slate-700"
        >
          Explore Content Conversion Tools
        </Link>
      </section>
      <ToolFaq title="Article to Word questions" faqs={faqs} />
    </main>
  );
}

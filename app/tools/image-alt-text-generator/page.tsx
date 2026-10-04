import type { Metadata } from "next";
import Link from "next/link";
import { ImagePlus, ScanEye, FileCheck2 } from "lucide-react";
import AltTextClient from "@/features/alt-text/AltTextClient";
import ToolResources from "@/features/tool-catalog/ToolResources";
const pageUrl = "https://doitwithai.tools/tools/image-alt-text-generator";
const description =
  "Draft image alt text from an upload or description. Compare editable alternatives, consider image purpose, and copy an escaped HTML alt attribute.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({ title: "AI Image Alt Text Generator", category: "AI SEO · Content Writing", ctaText: "Describe. Review. Refine.", features: "Image Upload,Context-Aware Drafts,Editable Alternatives" })}`;
export const metadata: Metadata = {
  title: "AI Image Alt Text Generator: Upload, Edit and Copy",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "AI Image Alt Text Generator",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Image Alt Text Generator",
    description,
    images: [image],
  },
};
const examples = [
  {
    title: "An article image",
    context:
      "A guide about checking AI-assisted drafts shows a writer reviewing a printed article.",
    weak: "AI SEO writing content best AI tools",
    useful: "Writer reviewing a printed article beside a laptop and notebook.",
    reason:
      "The alternative describes the meaningful action. It does not add unrelated keywords or make claims about the writer.",
  },
  {
    title: "An image-only button",
    context:
      "A printer icon is the only visible content inside a button that prints the current article.",
    weak: "Printer icon",
    useful: "Print this article",
    reason:
      "The action matters more than the icon's appearance. Check whether the complete button already has an accessible name.",
  },
  {
    title: "A chart with data",
    context:
      "An example chart compares 4, 6, and 5 reviewed articles across three weeks. These are illustrative values.",
    weak: "Graph showing success",
    useful:
      "Articles reviewed across three weeks. Detailed values follow in the page text.",
    reason:
      "Add the exact values and relevant relationships nearby. A short alt attribute cannot carry every part of a complex chart.",
  },
  {
    title: "A decorative separator",
    context:
      "A blue wave separates sections without adding meaning, a function, or necessary text.",
    weak: "Beautiful blue wave graphic",
    useful: 'alt=""',
    reason:
      "An empty alternative avoids adding decorative detail to the reading experience. Confirm the image truly has no informative purpose.",
  },
];
const faqs = [
  [
    "Can I upload an image instead of describing it?",
    "Yes. Choose one PNG, JPEG, or WebP image. The browser prepares a smaller raster copy before generation. You can add notes for unclear details.",
  ],
  [
    "Can I use the tool without uploading anything?",
    "Yes. Write a description of at least 20 characters. The AI uses your description and page context. It cannot confirm the actual image contents.",
  ],
  [
    "Should I include my target keyword?",
    "Include relevant words when they help explain the image. Do not add a keyword simply because the page targets it. Describe the image's meaning and purpose.",
  ],
  [
    "Does every image need descriptive alt text?",
    "No. Purely decorative images can use an empty alt attribute. Image-only links and buttons need an accessible name that communicates their function.",
  ],
  [
    "Is 125 characters a universal alt text limit?",
    "This tool does not impose a 125-character rule. Keep alternatives concise and useful. Put extensive information from charts or diagrams in nearby page text.",
  ],
  [
    "Can the AI read all small text and chart values?",
    "No. Small labels, dense layouts, and unclear images can cause mistakes. Supply verified labels or values in your notes, then compare the result with the original.",
  ],
  [
    "Does the tool guarantee accessibility or search rankings?",
    "No. It helps draft and review text alternatives. Human review and correct page implementation remain necessary. The local checks do not certify accessibility or verify facts.",
  ],
  [
    "What happens to my uploaded image?",
    "Selecting a file prepares it locally. Generating sends that prepared image and brief through our API to the AI provider. Drafts are not saved between visits.",
  ],
];
const prose = "mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300";
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "AI Image Alt Text Generator",
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Image Alt Text Generator", item: pageUrl },
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
      <div className="relative overflow-hidden bg-slate-950 pb-20 pt-10 sm:pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[size:28px_28px]"
        />
        <div
          aria-hidden
          className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-[#5271ff]/25 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap gap-2 text-xs text-slate-400"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page" className="text-blue-200">
              Image Alt Text Generator
            </span>
          </nav>
          <header className="mx-auto mb-14 mt-12 max-w-5xl text-center text-white">
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-100">
              AI SEO · Content Writing
            </p>
            <h1 className="mt-7 text-balance text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              AI Image Alt Text Generator
              <span className="mt-3 block text-balance bg-gradient-to-r from-blue-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                Describe the Meaning That Matters
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Give your image a purpose, compare useful alternatives, and refine
              the wording before it reaches your readers.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[
                [ImagePlus, "Upload or describe"],
                [ScanEye, "Purpose-aware drafts"],
                [FileCheck2, "Human accuracy review"],
              ].map(([Icon, label]) => {
                const I = Icon as typeof ImagePlus;
                return (
                  <span
                    key={label as string}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2"
                  >
                    <I aria-hidden className="h-4 w-4 text-blue-300" />
                    {label as string}
                  </span>
                );
              })}
            </div>
          </header>
          <AltTextClient />
        </div>
      </div>
      <div className="mx-auto max-w-7xl space-y-20 px-4 py-20 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
              Meaning before keywords
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Write an alternative that serves the reader
            </h2>
            <p className={prose}>
              Alt text provides a text alternative for an image. Useful wording
              depends on what the image contributes to its specific page.
            </p>
            <p className={prose}>
              The same picture may support different information in different
              articles. Page context helps you select relevant details without
              inventing what the image shows.
            </p>
            <p className={prose}>
              Google uses alt text together with the image and page content to
              understand its subject. Adding unrelated keywords can make the
              alternative less useful.
            </p>
            <p className={prose}>
              This generator offers drafts, editing cues, and an attribute you
              can copy. It does not evaluate the full page or predict search
              results.
            </p>
          </div>
          <aside className="rounded-3xl bg-slate-950 p-8 text-white">
            <h3 className="text-xl font-extrabold">
              Describe only what you can support
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              AI can misread small text, invent details, or miss why an image
              matters. Check the draft against your original image and page.
            </p>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
              <li>
                Supply confirmed product details instead of asking the model to
                guess them.
              </li>
              <li>
                Transcribe important chart values when labels are too small to
                read.
              </li>
              <li>Explain the action of an image-only link or button.</li>
              <li>
                Remove identities, locations, or claims that the source does not
                support.
              </li>
            </ul>
          </aside>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Four image purposes, four different decisions
          </h2>
          <p className={`${prose} max-w-3xl`}>
            Choose the role the image has on the page. A decorative graphic and
            an image-only button should not receive the same treatment.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {examples.map((e) => (
              <article
                key={e.title}
                className="rounded-3xl border border-slate-200 p-6 dark:border-slate-700 sm:p-8"
              >
                <h3 className="text-xl font-bold">{e.title}</h3>
                <p className={prose}>{e.context}</p>
                <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Wording to review
                  </p>
                  <p className="mt-2 text-sm leading-7">{e.weak}</p>
                </div>
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#4662df] dark:text-blue-200">
                    Useful direction
                  </p>
                  <p className="mt-2 text-sm leading-7">{e.useful}</p>
                </div>
                <p className={prose}>{e.reason}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 p-7 dark:border-slate-700 sm:p-10">
          <h2 className="text-3xl font-black">
            A practical workflow from image to published page
          </h2>
          <ol className="mt-7 grid gap-6 md:grid-cols-2">
            {[
              [
                "Prepare a clear source",
                "Upload a supported image or describe its subject and action. Add verified notes for small text, labels, and details that may be unclear.",
              ],
              [
                "Explain the page purpose",
                "Add surrounding text or a caption. For functional images, describe the actual destination or action rather than only the visible symbol.",
              ],
              [
                "Compare the alternatives",
                "Choose wording that preserves the important meaning. Edit it freely. Each option keeps its own edits while you compare different directions.",
              ],
              [
                "Check the source again",
                "Review names, numbers, visible text, and uncertain details. Local checks identify certain wording patterns, but cannot confirm image accuracy or reader comprehension.",
              ],
              [
                "Use the right output",
                "Copy plain text into your CMS alt field. Use the escaped alt attribute when editing HTML. Do not paste the whole attribute into a plain-text field.",
              ],
              [
                "Review the complete page",
                "Check captions, nearby descriptions, link labels, and the image's placement. For charts, keep detailed information in accessible page text and connect it clearly to the image.",
              ],
            ].map(([title, text], i) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-sm font-bold text-[#4662df] dark:bg-blue-950 dark:text-blue-200">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-base font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black">
              Separate alt text, captions, and longer explanations
            </h2>
            <p className={prose}>
              A caption can explain an image to everyone reading the page. Alt
              text conveys the image&apos;s relevant meaning when the image is
              unavailable.
            </p>
            <p className={prose}>
              Avoid copying nearby text word for word without checking whether
              the image adds anything else. Redundant information can make the
              reading experience harder to follow.
            </p>
            <p className={prose}>
              A complex diagram may need a brief alternative and a separate
              explanation. Supply exact data yourself and verify any
              relationships the AI describes.
            </p>
            <p className={prose}>
              The tool keeps an extended description separate from the alt
              attribute. Your page must still provide and connect that
              information where readers can access it.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-8 dark:bg-slate-900">
            <h3 className="text-xl font-bold">
              Know what the review cues can tell you
            </h3>
            <p className={prose}>
              The local review checks count characters and words, then flag a
              small set of wording patterns. They do not inspect image pixels.
            </p>
            <p className={prose}>
              A long alternative can be appropriate. The length cue asks you to
              consider nearby text, rather than enforcing a universal character
              limit.
            </p>
            <p className={prose}>
              No warning does not mean the draft is correct. A short, fluent
              alternative can still describe the wrong subject or miss an
              important function.
            </p>
            <p className={prose}>
              AI explanations describe the original generated drafts. After
              editing, review your wording again and complete your own
              checklist.
            </p>
          </div>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Image alt text generator questions
          </h2>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {faqs.map(([q, a]) => (
              <details
                key={q}
                className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700"
              >
                <summary className="cursor-pointer text-base font-bold leading-7">
                  {q}
                </summary>
                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 p-7 dark:border-slate-700">
          <h2 className="text-xl font-bold">
            Sources behind the image-purpose guidance
          </h2>
          <p className={prose}>
            Use these primary references when reviewing the complete
            implementation. This tool helps with wording; these guides cover
            broader image decisions and page requirements.
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                className="text-[#4662df] underline dark:text-blue-200"
                href="https://www.w3.org/WAI/tutorials/images/decision-tree/"
                target="_blank"
                rel="noopener noreferrer"
              >
                W3C WAI: the alt decision tree
              </a>
            </li>
            <li>
              <a
                className="text-[#4662df] underline dark:text-blue-200"
                href="https://www.w3.org/WAI/tutorials/images/complex/"
                target="_blank"
                rel="noopener noreferrer"
              >
                W3C WAI: complex images and detailed descriptions
              </a>
            </li>
            <li>
              <a
                className="text-[#4662df] underline dark:text-blue-200"
                href="https://developers.google.com/search/docs/appearance/google-images"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Search Central: image SEO guidance
              </a>
            </li>
          </ul>
        </section>
      </div>
      <ToolResources slug="image-alt-text-generator" />
    </>
  );
}

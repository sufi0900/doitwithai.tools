import type { Metadata } from "next";
import Link from "next/link";
import ArticlePdfClient from "@/features/article-conversion/ArticlePdfClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";

const pageUrl = "https://doitwithai.tools/tools/article-to-mp3";
const title = "Article to MP3 Converter & Read Aloud | Free Audio Download";
const description =
  "Turn an article URL or pasted text into synthetic English narration. Review the text, listen with playback controls, and download a real MP3 or WAV file.";
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
    question: "How do I turn an article into an MP3?",
    answer:
      "Import one public article URL or paste text or HTML. Review the extracted title and wording, then create downloadable audio. Press play to check the narration and save the MP3. A WAV alternative is also available.",
  },
  {
    question: "Is this a real MP3 download?",
    answer:
      "Yes. The tool synthesizes speech into PCM audio and encodes it as MPEG Layer III at 64 kbps, mono, 22.05 kHz. It does not rename a text or WAV file as MP3. The WAV alternative retains the PCM source. MP3 encoder padding can make the downloaded duration slightly longer than the displayed source duration.",
  },
  {
    question: "Are the voices natural or AI voice clones?",
    answer:
      "These are basic synthetic English voices from eSpeak NG, with UK and US choices. They can sound robotic. This is not a neural studio voice, voice clone, or human recording. Listen to names, abbreviations, numbers, and pronunciation before sharing.",
  },
  {
    question: "Does it support Urdu or translate articles?",
    answer:
      "This version exposes English voices only and does not translate. Other languages may be mispronounced. Use reviewed English text for the supported narration workflow.",
  },
  {
    question: "Why did importing an article fail?",
    answer:
      "Login walls, paywalls, bot challenges, inaccessible sites, and pages that require JavaScript can prevent extraction. Paste text or HTML that you have permission to use, then compare the preview with your source. The importer does not bypass access controls.",
  },
  {
    question: "How much can I convert at once?",
    answer:
      "Select up to 20,000 characters of narratable text. Audio is limited to 20 minutes per file. Shorten the text or deselect sections if you exceed a limit. Long articles can take time and memory, particularly on a phone. Keep the tab open while generating.",
  },
  {
    question: "Which parts of an article are spoken?",
    answer:
      "Selected headings, paragraphs, lists, and quotations are spoken in source order. Image pixels, code, and tables are omitted. Numbered citation markers are removed from narration. Review any references or context that the omitted material supplied; this is not OCR or an audiobook adaptation.",
  },
  {
    question: "Where is my article processed?",
    answer:
      "URL importing uses our server. Pasted content, editing, speech synthesis, and MP3 encoding run in your browser. Article text is not sent to a voice provider. Engine files load from this website. Edits and audio are temporary, so download before leaving.",
  },
  {
    question: "Can I pause, skip sections, or change speed?",
    answer:
      "Yes. Use the audio controls to play, pause, and seek. Section buttons navigate the narration, and a playback-speed selector changes listening speed. To change the speed in the downloaded file, choose a generated speaking rate and create the audio again.",
  },
  {
    question: "Can I reuse the downloaded audio?",
    answer:
      "Use content you own or have permission to convert and distribute. Review attribution, source rights, and generated pronunciation. Converting a webpage does not establish permission to republish it, verify its claims, or make you its author.",
  },
];
const section = "mx-auto max-w-6xl px-4 py-10 sm:px-6";
const text = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Article to MP3 & Read Aloud",
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
            name: "Article to MP3",
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
      <header className="relative overflow-hidden bg-[#291B26] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-20 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl"
        />
        <div className={`${section} relative py-12 sm:py-16`}>
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap gap-2 text-xs text-orange-100/80"
          >
            <Link href="/tools">Tools</Link>
            <span aria-hidden>/</span>
            <Link href="/tools/categories/content-conversion">
              Content conversion
            </Link>
            <span aria-hidden>/</span>
            <span aria-current="page">Article to MP3</span>
          </nav>
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.8fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-200">
                Content conversion · Listen and save
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Article to MP3{" "}
                <span className="text-orange-300">and read aloud</span>
              </h1>
              <p className="mt-5 text-base leading-8 text-orange-50/85">
                Give a useful article a listening format. Review the text,
                create synthetic English narration, and download an MP3 for
                offline listening.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-orange-100">
                {[
                  "Real MP3 + WAV",
                  "Editable source text",
                  "No voice API key",
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
            <div className="rounded-2xl border border-orange-200/25 bg-white/5 p-6">
              <h2 className="text-lg font-bold">A simple listening workflow</h2>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-orange-50/85">
                <li>1. Import a URL or paste permitted content</li>
                <li>2. Check the text and choose an English voice</li>
                <li>3. Listen, review, and save the MP3</li>
              </ol>
              <p className="mt-5 border-t border-orange-200/20 pt-4 text-xs leading-6 text-orange-100/80">
                Basic synthetic voices. Up to 20,000 selected characters and 20
                minutes. No voice cloning or translation.
              </p>
            </div>
          </div>
        </div>
      </header>
      <ArticlePdfClient format="audio" />
      <section className={section}>
        <h2 className="text-2xl font-extrabold">
          Listen now or save a reading queue for later
        </h2>
        <p className={text}>
          An audio copy is useful when you want to revisit your own article,
          listen to a permitted training note, or hear awkward wording during an
          editorial review. Start with a short section and check the voice
          before converting a longer piece.
        </p>
        <p className={text}>
          The preview gives you control over what becomes speech. Remove
          navigation or unrelated text, correct extraction errors, and turn a
          table into a written explanation if its context matters. The tool
          reads the selected wording; it does not summarize, fact-check, or
          rewrite it.
        </p>
      </section>
      <section
        className={`${section} border-y border-slate-200 bg-orange-50/50 dark:border-slate-800 dark:bg-orange-950/10`}
      >
        <h2 className="text-2xl font-extrabold">
          How to convert an article into downloadable audio
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            [
              "Bring the article",
              "Enter one public URL. If importing fails, paste text or HTML you are allowed to use. The fictional example lets you try the workflow without a live website.",
            ],
            [
              "Review the narration",
              "Check the title, source, wording, and omissions. Choose UK or US English. Optional settings let you select sections and generate at 120, 160, or 200 words per minute.",
            ],
            [
              "Listen and download",
              "Create the audio, then check it with playback and section controls. Download the MP3 or the larger WAV alternative. Regenerate after changing the source or speaking rate.",
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
          Example: hear your own draft before publishing
        </h2>
        <p className={text}>
          Paste a short English article you wrote. Correct the title, remove a
          promotional block, and replace a complicated abbreviation with the
          wording you want spoken. Generate a short sample using the UK or US
          voice. If a sentence sounds awkward, edit the source and create it
          again.
        </p>
        <p className={text}>
          MP3 is a smaller listening copy; WAV preserves the uncompressed
          narration. Playback speed affects only the player. For a slower
          download, change the generated speaking rate before creating a new
          file. Save your file before leaving the page.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm font-bold text-[#9A3412] dark:text-[#FDBA74]">
          <Link className="underline" href="/tools/readability-checker">
            Review readability
          </Link>
          <Link className="underline" href="/tools/article-to-pdf">
            Save a PDF reading copy
          </Link>
          <Link className="underline" href="/tools/article-to-word">
            Create an editable Word document
          </Link>
        </div>
      </section>
      <ToolFaq title="Article to MP3 questions" faqs={faqs} />
    </main>
  );
}

import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import type { Metadata } from "next";
import Link from "next/link";
import ArticlePdfClient from "@/features/article-conversion/ArticlePdfClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";

const pageUrl = "https://doitwithai.tools/tools/article-to-mp3";
const title = "Article to MP3 Converter & Read Aloud | Free Audio Download";
const description =
  "Turn an article URL or pasted text into clear English narration. Review the text, choose from six distinct voices, listen with playback controls, and download a real MP3 or WAV file.";
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
      "Import one public article URL or paste text or HTML. Review the extracted title and wording, choose an English voice and starting section, then create downloadable audio. Press play to check the narration and save the MP3. A WAV alternative is also available.",
  },
  {
    question: "Is this a real MP3 download?",
    answer:
      "Yes. The tool synthesizes speech into PCM audio and encodes it as MPEG Layer III at 64 kbps, mono, 22.05 kHz. It does not rename a text or WAV file as MP3. The WAV alternative retains the PCM source. MP3 encoder padding can make the downloaded duration slightly longer than the displayed source duration.",
  },
  {
    question: "What voices are included and can I preview them?",
    answer:
      "You can choose from six distinct English voices across US, UK, Indian, and Australian accents (both female and male voices). Use the Preview voice button to hear a short sample before converting the full article.",
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
      "Selected headings, paragraphs, lists, and quotations are spoken in source order with natural pauses between sections. You can choose to include the article title at the start, skip a Key Takeaways summary box, or start narration from any section. Image pixels, code, and tables are omitted, and numbered citation markers are removed.",
  },
  {
    question: "Where is my article processed?",
    answer:
      "URL importing and speech synthesis run on demand without storing your article. Pasted content, editing, and MP3 encoding run in your browser, with a local fallback speech engine built in. Edits and audio are temporary, so download before leaving.",
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
      <ToolLandingHero
        slug="article-to-mp3"
        title="Article to MP3 and read aloud"
        description={description}
        categoryLabel="Content Conversion"
        categoryHref="/tools/categories/content-conversion"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <ArticlePdfClient format="audio" />
        </div>
      </ToolLandingHero>
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
        className={`${section} border-y border-slate-200 bg-[#5271ff]/10/50 dark:border-slate-800 dark:bg-orange-950/10`}
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
              "Check the title, source, wording, and starting section. Choose from six English voices across US, UK, Indian, and Australian accents, and generate at 120, 160, or 200 words per minute.",
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
          wording you want spoken. Generate a short sample using your preferred
          English voice. If a sentence sounds awkward, edit the source and
          create it again.
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

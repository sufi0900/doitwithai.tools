import type { Metadata } from "next";
import Link from "next/link";
import OutreachClient from "@/features/outreach-email/OutreachClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
const pageUrl = "https://doitwithai.tools/tools/outreach-email-builder";
const title =
  "Personalized Outreach Email Builder | Editable TXT and DOCX Drafts";
const description =
  "Build personalized link outreach emails from your page references and reader benefits. Edit subjects, messages, and optional follow-ups. Download TXT or DOCX.";
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
    question: "What does the outreach email builder create?",
    answer:
      "It assembles an editable subject and message from your supplied facts. Choose a resource suggestion, broken-link replacement, or unlinked brand-mention request.",
  },
  {
    question: "Is this an AI email generator?",
    answer:
      "This version is a guided template builder. It uses deterministic drafting rules, rather than an AI provider, and does not claim independent research.",
  },
  {
    question: "What information is required?",
    answer:
      "Provide the publisher page, a specific reference, your resource URL, its reader benefit, and your name. Some outreach purposes require an additional field.",
  },
  {
    question: "Does it read or verify the publisher page?",
    answer:
      "No. Page URLs are references for the draft. You must check the page, factual details, link status, and suitability of your proposed resource.",
  },
  {
    question: "What makes the draft personalized?",
    answer:
      "Your exact page reference, source URL, reader benefit, and optional names shape the wording. Accurate details matter more than changing a greeting.",
  },
  {
    question: "Does the tool send emails or find contact addresses?",
    answer:
      "No. It does not connect to a mailbox, identify recipients, send outreach, track opens, or schedule follow-ups.",
  },
  {
    question: "Can I edit the generated wording?",
    answer:
      "Yes. Edit the subject, message, and optional follow-up directly. Downloads and copying use those edits, while rebuilding replaces them from the form.",
  },
  {
    question: "Can I download a Word document?",
    answer:
      "Yes. The DOCX export is an editable WordprocessingML document, rather than renamed HTML. TXT is available for a plain-text copy.",
  },
  {
    question: "Does the draft guarantee replies or backlinks?",
    answer:
      "No. Recipient interest, editorial context, resource quality, timing, and your relationship affect whether a request is useful. No response probability is calculated.",
  },
  {
    question: "How should I use the optional follow-up?",
    answer:
      "Use it only after sending the first message. Review the recipient’s preferences, avoid repetitive messages, and stop after a decline.",
  },
  {
    question: "What happens when I load the example?",
    answer:
      "The form receives fictional names and example URLs. Replace them with checked details before using the resulting draft.",
  },
  {
    question: "Where does draft processing happen?",
    answer:
      "Draft assembly, editing, copying, and export happen in your browser. This feature does not upload the draft to an AI provider or email service.",
  },
];
const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const text = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Personalized Outreach Email Builder",
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Outreach Email Builder", item: pageUrl },
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
      <header
        className={`relative overflow-hidden ${toolHeroSurface} text-white`}
      >
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <nav
            aria-label="Breadcrumb"
            className="mb-7 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">Outreach email builder</span>
          </nav>
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.8fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Off-page SEO · Guided drafting
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Personalized Outreach Email Builder{" "}
                <span className={toolHeroHeading}>
                  with a useful reason to connect
                </span>
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-300">
                Turn a checked page reference and a clear reader benefit into a
                focused outreach draft. Edit every word before using it.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                {[
                  "Three outreach purposes",
                  "Editable subjects and messages",
                  "TXT and DOCX downloads",
                ].map((label) => (
                  <span
                    key={label}
                    className="rounded-lg border border-white/15 px-3 py-2"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-[#b4c3ff]">
                Specific detail before a generic pitch
              </p>
              <p className="mt-5 text-lg leading-8">
                What does this page discuss, and how would your resource help
                its readers?
              </p>
              <p className="mt-5 border-t border-slate-700 pt-4 text-sm leading-7 text-slate-300">
                This builder organizes your answer. It does not invent a
                relationship, verify a claim, or send the email.
              </p>
            </div>
          </div>
        </div>
      </header>
      <OutreachClient />
      <section className={section}>
        <h2 className="text-3xl font-extrabold">
          Write an outreach email with a clear purpose
        </h2>
        <p className={text}>
          A useful link outreach email connects a specific publisher reference
          with a resource that serves the same reader need. A name alone adds
          little context.
        </p>
        <p className={text}>
          Start with what you actually checked. Describe the relevant section,
          explain the benefit, and make one request the recipient can assess.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              "Resource suggestion",
              "Suggest an additional reference when your page supplies a useful workflow, explanation, dataset, or tool for that audience.",
            ],
            [
              "Broken-link replacement",
              "Flag the destination you inspected, then invite the publisher to confirm its availability and consider a suitable replacement.",
            ],
            [
              "Unlinked brand mention",
              "Explain which brand reference you mean and why a direct page link would add helpful context.",
            ],
          ].map(([heading, body]) => (
            <div
              key={heading}
              className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700"
            >
              <h3 className="text-lg font-bold">{heading}</h3>
              <p className={text}>{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className={section}>
        <h2 className="text-3xl font-extrabold">How to build your draft</h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              "Bring the facts",
              "Choose a purpose and enter the publisher page. Add a specific reference and the benefit of your proposed resource.",
            ],
            [
              "Build and refine",
              "Build the draft, compare subject options, and edit the message. Optional settings add names, tone, and one follow-up.",
            ],
            [
              "Download and review",
              "Save the current text as TXT or editable DOCX. Confirm links, claims, recipient preferences, and relevance before sending separately.",
            ],
          ].map(([heading, body], i) => (
            <li
              key={heading}
              className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-900"
            >
              <span className="font-black text-[#3452d1] dark:text-blue-200">
                0{i + 1}
              </span>
              <h3 className="mt-3 text-lg font-bold">{heading}</h3>
              <p className={text}>{body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className={`${section} grid gap-7 lg:grid-cols-2`}>
        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700">
          <h2 className="text-2xl font-extrabold">
            Give the recipient something concrete to assess
          </h2>
          <p className={text}>
            A resource list about editorial planning might benefit from an
            editable update worksheet. A broad product homepage may not meet
            that same need.
          </p>
          <p className={text}>
            Name the section and describe the task your resource supports.
            Remove generic praise, unsupported claims, and details unrelated to
            the recipient’s page.
          </p>
          <p className={text}>
            The builder preserves your supplied information. It cannot decide
            whether your statement is accurate or your page deserves a
            reference.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700">
          <h2 className="text-2xl font-extrabold">
            Keep follow-ups considered and separate
          </h2>
          <p className={text}>
            An optional follow-up is a draft for later review. Its wording
            assumes that you already sent the initial message.
          </p>
          <p className={text}>
            Check the recipient’s preferences and your own sending context. A
            decline is a reason to stop, rather than send a different version
            repeatedly.
          </p>
          <p className={text}>
            This tool does not provide legal clearance, assess deliverability,
            schedule messages, or calculate the best time to contact someone.
          </p>
        </div>
      </section>
      <section className={section}>
        <div className="rounded-3xl border border-[#5271ff]/30 bg-[#5271ff]/5 p-7 sm:p-9">
          <h2 className="text-2xl font-extrabold">
            Keep control of the final wording
          </h2>
          <p className={text}>
            Subject suggestions and draft text are starting points. Edit them to
            fit your voice, relationship, and resource, then verify every claim.
          </p>
          <p className={text}>
            Input changes do not silently rewrite your edited draft. Rebuild
            when you want a new version, or export the wording you already
            refined.
          </p>
          <p className={text}>
            Draft processing stays in the browser. No AI key, mailbox
            connection, or contact list is required by this builder.
          </p>
        </div>
      </section>
      <ToolFaq title="Outreach drafting questions" faqs={faqs} />
      <aside className={section} aria-label="Related tools">
        <h2 className="text-2xl font-extrabold">
          Check the evidence before writing
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {[
            [
              "broken-link-opportunity-finder",
              "Broken Link Opportunity Finder",
              "Inspect supplied resource pages for missing external destinations.",
            ],
            [
              "unlinked-brand-mention-checker",
              "Unlinked Brand Mention Checker",
              "Review a brand reference and its surrounding link context.",
            ],
          ].map(([slug, name, body]) => (
            <Link
              key={slug}
              href={`/tools/${slug}`}
              className="rounded-2xl border border-slate-200 p-6 hover:border-[#5271ff] focus-visible:outline-[#5271ff] dark:border-slate-700"
            >
              <h3 className="text-lg font-bold">{name}</h3>
              <p className={text}>{body}</p>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}

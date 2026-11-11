import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import {
  ToolHeroBackground,
  toolHeroSurface,
  toolHeroHeading,
} from "@/features/tool-ui/ToolHero";
import type { Metadata } from "next";
import Link from "next/link";
import UgcVideoPromptClient from "@/features/ugc-video-prompt-generator/UgcVideoPromptClient";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/ugc-video-prompt-generator";
const description =
  "Generate scene-by-scene UGC ad scripts, cinematic Sora and Runway text-to-video prompts, and Suno background audio prompts with camera and lighting controls.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({
  title: "UGC Ad, Sora Video & Audio Prompt Studio",
  category: "Content Writing · AI Video & UGC",
  ctaText: "Script. Prompt. Produce.",
  features: "4-Scene UGC Storyboard,Sora & Runway Prompts,Suno Audio Builder",
})}`;

export const metadata: Metadata = {
  title: "Free UGC Ad, Sora Video & Text-to-Video Prompt Generator",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free UGC Ad, Sora Video & Text-to-Video Prompt Generator",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free UGC Ad, Sora Video & Text-to-Video Prompt Generator",
    description,
    images: [image],
  },
};

const faqs = [
  [
    "Which tool is capable of generating videos from textual prompts?",
    "Leading AI tools capable of generating high-definition videos directly from textual prompts include OpenAI Sora, Google Veo 2, Runway Gen-3 Alpha, Kling AI, Luma Dream Machine, and Hailuo Minimax. Our prompt generator formats camera lenses, lighting, motion physics, and aspect ratios specifically for these text-to-video models.",
  ],
  [
    "What makes a high-converting UGC ad prompt and script?",
    "Effective User-Generated Content (UGC) ads follow a 4-part 30-second structure: a 0–3 second pattern-interrupt visual and spoken hook, a 3–10 second relatable problem statement, a 10–22 second product demonstration showing tangible proof, and a 22–30 second direct call to action.",
  ],
  [
    "How should I structure a prompt for OpenAI Sora, Runway Gen-3, or Google Veo?",
    "Always order your text-to-video prompt across five distinct layers: (1) Aspect Ratio & Shot Framing, (2) Subject & Physical Action, (3) Camera Lens & Movement (such as '35mm anamorphic slow dolly push-in'), (4) Lighting & Atmosphere, and (5) Physics & Texture Guardrails.",
  ],
  [
    "Why does this tool also generate a Suno v4 / Udio audio prompt?",
    "Short-form UGC ads and AI video clips perform significantly better with custom, royalty-free background music that leaves a clean midrange vocal pocket for spoken voiceovers without triggering platform copyright claims.",
  ],
  [
    "How do I prevent warped hands or garbled screen text in AI video generators?",
    "Copy the Negative Prompt Guardrails included in every generated pack above and avoid asking video diffusion models to render dense small typography; instead, generate clean B-roll motion and overlay crisp UI text during editing.",
  ],
  [
    "Can I export the entire 4-scene storyboard for my creative team?",
    "Yes, click 'Download .MD Storyboard' or 'Copy Full Prompt Pack' above to save the master video prompt, negative guardrails, Suno audio prompt, and all four timed UGC scenes.",
  ],
];

const VIDEO_PROMPTS = [
  {
    title: "1. Universal Text-to-Video Formula (Sora / Veo / Runway)",
    badge: "Text-to-Video",
    prompt: `[Aspect Ratio: 9:16 or 16:9] [Shot Type & Lens: e.g., 35mm medium tracking shot] of [Subject performing specific physical action] in [Detailed environment]. Lighting: [e.g., soft golden hour rim light with volumetric haze]. Camera Motion: [e.g., smooth gimbal push-in at 24fps, shallow depth of field f/1.8, physically accurate reflections].`,
  },
  {
    title: "2. 30-Second Direct-Response UGC Ad Script Prompt",
    badge: "UGC Ad Script",
    prompt: `Write a 30-second TikTok/Reels UGC ad script for [Product/App] targeting [Target Audience]. Break it into 4 timed rows (0-3s Hook, 3-10s Pain Point, 10-22s Visual Proof, 22-30s CTA) with exact spoken dialogue in Column A and matching AI B-roll video prompts in Column B.`,
  },
];

const prose = "mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300";

export default function UgcVideoPromptGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "UGC Ad, Sora Video & Text-to-Video Prompt Studio",
        alternateName: [
          "UGC Prompt Generator",
          "Sora Prompts Generator",
          "Text-to-Video Prompt Generator",
          "Suno Prompt Generator",
        ],
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "HowTo",
        name: "How to Generate UGC Ad Scripts and Sora Text-to-Video Prompts",
        description:
          "Create a 4-scene UGC storyboard, text-to-video prompts, and Suno music prompts in 4 steps.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Describe your product offer and target audience",
            text: "Enter your product, app, or video concept along with the main pain point your audience wants to solve.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Select your target AI video engine and aspect ratio",
            text: "Choose OpenAI Sora, Google Veo 2, Runway Gen-3, Kling AI, or TikTok/Reels UGC in 9:16, 16:9, or 1:1.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Customize camera lens, lighting, and Suno audio mood",
            text: "Set your camera movement, lighting atmosphere, and background music BPM/style.",
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "Copy or download your 4-scene storyboard",
            text: "Copy the Master Video Prompt, Suno Audio Prompt, and 4-scene UGC script + B-roll pack or download as Markdown.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          {
            name: "UGC Ad, Sora Video & Text-to-Video Prompt Generator",
            item: pageUrl,
          },
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
      <div className={`relative overflow-hidden ${toolHeroSurface} text-white`}>
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">
              UGC Ad &amp; Sora Video Prompt Generator
            </span>
          </nav>

          <div className="mb-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                CONTENT &amp; VIDEO STUDIO · UGC ADS, SORA, RUNWAY &amp; SUNO
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                UGC Ad, Sora Video &amp;{" "}
                <span className={toolHeroHeading}>
                  Text-to-Video Prompt Studio
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Build high-converting <strong>4-scene UGC ad scripts</strong>,
                cinematic <strong>OpenAI Sora</strong>,{" "}
                <strong>Google Veo 2</strong>, and <strong>Runway Gen-3</strong>{" "}
                text-to-video prompts, plus synchronized{" "}
                <strong>Suno v4 background music prompts</strong> in seconds.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  4-Scene Timed UGC Storyboard
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Sora, Veo, Runway &amp; Kling Camera Tokens
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Suno v4 Audio Prompt Builder
                </span>
              </div>
              <PortableToolHeroBar />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                What Every Prompt Pack Includes
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-violet-300">
                    Master Text-to-Video Prompt:
                  </strong>{" "}
                  Calibrated lens, camera motion, lighting, and physics tokens.
                </li>
                <li>
                  <strong className="text-sky-300">
                    4-Scene UGC Script + B-Roll:
                  </strong>{" "}
                  0–3s Hook, 3–10s Problem, 10–22s Proof, and 22–30s CTA.
                </li>
                <li>
                  <strong className="text-emerald-300">
                    Suno v4 Audio Prompt:
                  </strong>{" "}
                  Custom BPM, instrumentation, and voiceover-safe EQ structure.
                </li>
                <li>
                  <strong className="text-amber-300">
                    Negative Guardrails:
                  </strong>{" "}
                  Prevents hand warping, text distortion, and motion flicker.
                </li>
              </ul>
            </div>
          </div>

          <UgcVideoPromptClient />
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        {/* 50-WORD QUICK ANSWER */}
        <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-7 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
            Quick Answer · Text-to-Video Tools
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Which Tool Is Capable of Generating Videos from Textual Prompts?
          </h2>
          <p className={prose}>
            The top AI tools capable of generating realistic videos from textual
            prompts in 2026 are <strong>OpenAI Sora</strong>,{" "}
            <strong>Google Veo 2</strong>, <strong>Runway Gen-3 Alpha</strong>,{" "}
            <strong>Kling AI</strong>, and <strong>Luma Dream Machine</strong>.
            To get broadcast-quality clips from any of these models, your prompt
            must specify five parameters: shot framing, subject action, camera
            movement, lighting atmosphere, and physical motion consistency.
          </p>
        </section>

        {/* COMPARISON TABLE */}
        <section>
          <h2 className="text-3xl font-black">
            Comparing Top Text-to-Video &amp; Audio AI Generators
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-3.5">AI Video / Audio Model</th>
                  <th className="px-4 py-3.5">Core Strength</th>
                  <th className="px-4 py-3.5">Best Prompt Tokens to Include</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                <tr>
                  <td className="px-4 py-3.5 font-bold">OpenAI Sora &amp; Google Veo 2</td>
                  <td className="px-4 py-3.5">
                    Cinematic multi-second world physics &amp; realistic lighting
                  </td>
                  <td className="px-4 py-3.5">
                    35mm/85mm focal length, dolly/gimbal tracking, volumetric light
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">Runway Gen-3 Alpha</td>
                  <td className="px-4 py-3.5">
                    Precise camera motion control &amp; image-to-video keyframes
                  </td>
                  <td className="px-4 py-3.5">
                    Explicit camera direction first (e.g., &quot;Low angle tracking shot:&quot;)
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">Kling AI &amp; Luma Dream Machine</td>
                  <td className="px-4 py-3.5">
                    Fast 9:16 vertical B-roll &amp; product macro movement
                  </td>
                  <td className="px-4 py-3.5">
                    Handheld iPhone POV, natural facial expressions, 60fps pan
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">Suno v4 &amp; Udio</td>
                  <td className="px-4 py-3.5">
                    Royalty-free backing tracks &amp; sonic branding
                  </td>
                  <td className="px-4 py-3.5">
                    Exact BPM, genre tags, and &quot;instrumental only, vocal-safe midrange&quot;
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={prose}>
            Need full spoken scripts or platform captions next? Pair this prompt
            studio with our{" "}
            <Link
              href="/tools/short-form-video-script-generator"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              Short-Form Video Script Generator
            </Link>
            ,{" "}
            <Link
              href="/tools/tiktok-script-caption-generator"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              TikTok Script &amp; SEO Caption Studio
            </Link>
            , and{" "}
            <Link
              href="/prompts"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              952+ AI Prompts Library
            </Link>
            .
          </p>
        </section>

        {/* PROMPTS */}
        <section>
          <h2 className="text-3xl font-black">
            Copy-Paste Templates for Text-to-Video &amp; UGC Ads
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {VIDEO_PROMPTS.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-[#4662df] dark:text-blue-300">
                  {item.badge}
                </span>
                <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-200">
                  {item.prompt}
                </pre>
              </article>
            ))}
          </div>
        </section>

        {/* FAQS */}
        <section>
          <h2 className="text-3xl font-black">
            Frequently Asked Questions: UGC &amp; Text-to-Video Prompts
          </h2>
          <div className="mt-7 divide-y divide-slate-200 rounded-3xl border border-slate-200 px-6 dark:divide-slate-800 dark:border-slate-800">
            {faqs.map(([q, a]) => (
              <details key={q} className="py-5" open>
                <summary className="cursor-pointer text-base font-bold leading-7">
                  {q}
                </summary>
                <p className={prose}>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <ToolResources slug="ugc-video-prompt-generator" />
      </div>
    </>
  );
}

import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import {
  ToolHeroBackground,
  toolHeroSurface,
  toolHeroHeading,
} from "@/features/tool-ui/ToolHero";
import type { Metadata } from "next";
import Link from "next/link";
import AiArtImagePromptClient from "@/features/ai-art-image-prompt-generator/AiArtImagePromptClient";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/ai-art-image-prompt-generator";
const description =
  "Generate detailed AI art prompts, 8K photo restoration and upscaling instructions, and Grok/Midjourney/Flux image prompts with one-click randomizers.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({
  title: "AI Art, Grok & 8K Image Prompt Generator",
  category: "Content Writing · Visual & Image Prompts",
  ctaText: "Imagine. Restore. Upscale.",
  features: "Random Art Generator,Grok & Midjourney v6.1,8K Photo Restoration",
})}`;

export const metadata: Metadata = {
  title: "Free AI Art, Grok & 8K Image Upscaling Prompt Generator",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free AI Art, Grok & 8K Image Upscaling Prompt Generator",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Art, Grok & 8K Image Upscaling Prompt Generator",
    description,
    images: [image],
  },
};

const faqs = [
  [
    "What are the best generative AI prompts for image restoration and 8K upscaling?",
    "The most effective 8K image restoration and upscaling prompts explicitly instruct the model to recover fine micro-textures (natural skin pores, fabric weave, architectural lines), remove JPEG compression artifacts, motion blur, and scratches, balance dynamic range lighting, and preserve 100% of the original facial and structural geometry without plastic airbrushing.",
  ],
  [
    "How does the Random Art Prompt Generator button work?",
    "Clicking 'Random Art Prompt' cycles through curated creative concepts combining an evocative subject, artistic medium, cinema lens, lighting atmosphere, and color palette—automatically building four model-specific prompts for Midjourney, Grok, Flux, and 8K upscalers.",
  ],
  [
    "How do Grok Aurora and Flux prompts differ from Midjourney v6.1 prompts?",
    "Midjourney v6.1 responds best to comma-separated visual descriptors paired with parameter flags (--ar 16:9 --v 6.1 --style raw --stylize 250), whereas Grok Aurora, Flux.1 Pro, and Ideogram 2.0 use large language model text encoders that prefer natural, full-sentence spatial descriptions and quoted text strings.",
  ],
  [
    "How can I include exact readable text inside my generated AI image?",
    "Enter your desired headline or badge text into Input #7 ('Exact Text Overlay') above. The generator wraps your phrase in quotation marks and positions it for high-accuracy typography models like Grok Aurora, Ideogram 2.0, and Flux.1 Pro.",
  ],
  [
    "What denoise or creativity strength should I use when upscaling to 8K?",
    "When running our 8K Restoration & Upscaling prompt in tools like Magnific AI, Krea Enhancer, Topaz Photo AI, or ComfyUI ControlNet Tile, keep Denoise / Creativity between 0.25 and 0.40 so the model sharpens textures without altering the subject's identity.",
  ],
  [
    "After generating my blog hero or product image, how do I optimize it for Google Image SEO?",
    "Convert the image to lightweight WebP format, give it a descriptive hyphenated filename, and run it through our Image Alt Text Generator to craft an accessible, keyword-grounded alt attribute.",
  ],
];

const ART_PROMPTS = [
  {
    title: "1. Universal 8K Photo Restoration & De-Blurring Prompt",
    badge: "8K Upscaling",
    prompt: `Restore, de-blur, and upscale this image to native 8K resolution (7680x4320). Recover authentic micro-textures (natural skin pores, hair strands, fabric weave, crisp edges), eliminate JPEG artifacts, film grain noise, and scratches, balance exposure with soft natural daylight, and preserve 100% original facial geometry without plastic smoothing.`,
  },
  {
    title: "2. Grok Aurora & Ideogram Blog Hero Graphic Prompt",
    badge: "Grok & Flux",
    prompt: `Create a sleek 16:9 3D isometric editorial illustration on a deep midnight navy background (#0B1120) showing [Topic/Concept], illuminated by sapphire blue and emerald rim lighting, featuring crisp legible typography reading "[Headline Text]" in the center.`,
  },
];

const prose = "mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300";

export default function AiArtImagePromptGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "AI Art, Grok & 8K Image Upscaling Prompt Generator",
        alternateName: [
          "Prompt Generator Art",
          "Random Art Prompt Generator",
          "Grok Prompt Generator",
          "8K Image Restoration Prompt Generator",
        ],
        url: pageUrl,
        description,
        applicationCategory: "DesignApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "HowTo",
        name: "How to Generate AI Art, Grok, and 8K Image Restoration Prompts",
        description:
          "Build multi-model AI art and 8K upscaling prompts in 4 steps.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Describe your visual subject or click Random Art Prompt",
            text: "Enter your scene, blog hero concept, or photo restoration task—or click 'Random Art Prompt' for instant creative inspiration.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Configure medium, lighting, lens, and color palette",
            text: "Select your artistic medium, lighting atmosphere, camera focal length, and color palette.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Choose aspect ratio and optional text overlay",
            text: "Pick 16:9, 1:1, 4:5, or 9:16 and enter any exact text string you want rendered inside Grok or Ideogram.",
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "Copy your model-specific prompt card",
            text: "Copy the tailored prompt for Midjourney v6.1, Grok Aurora / Flux, or 8K Image Restoration & Upscaling.",
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
            name: "AI Art, Grok & 8K Image Prompt Generator",
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
              AI Art, Grok &amp; 8K Image Prompt Generator
            </span>
          </nav>

          <div className="mb-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                VISUAL &amp; IMAGE STUDIO · MIDJOURNEY, GROK, FLUX &amp; 8K UPSCALING
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                AI Art, Grok &amp; 8K{" "}
                <span className={toolHeroHeading}>
                  Image Prompt Generator
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Generate structured prompts for <strong>Midjourney v6.1</strong>,{" "}
                <strong>Grok Aurora</strong>, <strong>Flux.1 Pro</strong>, and{" "}
                <strong>8K photo restoration &amp; upscaling</strong>—or click{" "}
                <strong>Random Art Prompt</strong> for instant creative ideas.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  🎲 1-Click Random Art Prompt Generator
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  8K Restoration &amp; Upscaling Prompts
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Midjourney, Grok &amp; Flux Ready
                </span>
              </div>
              <PortableToolHeroBar />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 Prompts Generated in Every Run
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-violet-300">
                    Midjourney v6.1 &amp; Flux Pro:
                  </strong>{" "}
                  Includes lens, lighting, and <code>--ar --v 6.1 --style raw</code> flags.
                </li>
                <li>
                  <strong className="text-sky-300">
                    Grok Aurora &amp; Ideogram 2.0:
                  </strong>{" "}
                  Natural-language spatial prompt with exact typography support.
                </li>
                <li>
                  <strong className="text-emerald-300">
                    8K Restoration &amp; Upscaling:
                  </strong>{" "}
                  Micro-texture recovery, de-blurring, and artifact removal.
                </li>
                <li>
                  <strong className="text-amber-300">
                    Negative Guardrails:
                  </strong>{" "}
                  Blocks plastic skin, warped hands, and compression noise.
                </li>
              </ul>
            </div>
          </div>

          <AiArtImagePromptClient />
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        {/* 50-WORD QUICK ANSWER */}
        <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-7 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
            Quick Answer · 8K Upscaling &amp; AI Art
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            How to Write Generative AI Prompts for 8K Image Restoration and Art
          </h2>
          <p className={prose}>
            Whether you are generating new digital artwork or restoring a
            low-resolution photo to <strong>8K UHD</strong>, the best prompts
            specify five visual layers: <strong>Subject &amp; Geometry</strong>,{" "}
            <strong>Medium &amp; Surface Micro-Textures</strong> (such as
            natural skin pores or fine fabric weave),{" "}
            <strong>Camera Optics</strong> (focal length and aperture),{" "}
            <strong>Lighting Dynamic Range</strong>, and{" "}
            <strong>Negative Artifact Guardrails</strong>.
          </p>
        </section>

        {/* COMPARISON TABLE */}
        <section>
          <h2 className="text-3xl font-black">
            Midjourney v6.1 vs. Grok Aurora vs. Flux.1 vs. 8K Upscalers
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Image Engine</th>
                  <th className="px-4 py-3.5">Best Use Case</th>
                  <th className="px-4 py-3.5">Prompt Syntax Style</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                <tr>
                  <td className="px-4 py-3.5 font-bold">Midjourney v6.1</td>
                  <td className="px-4 py-3.5">
                    Cinematic concept art, editorial photography &amp; textures
                  </td>
                  <td className="px-4 py-3.5">
                    Descriptor clauses + <code>--ar 16:9 --v 6.1 --style raw</code>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">Grok Aurora &amp; Ideogram 2.0</td>
                  <td className="px-4 py-3.5">
                    Blog hero graphics, posters &amp; exact embedded text
                  </td>
                  <td className="px-4 py-3.5">
                    Conversational sentences + quoted <code>&quot;EXACT TEXT&quot;</code>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">Flux.1 Pro / Dev</td>
                  <td className="px-4 py-3.5">
                    Photorealistic human anatomy, hands &amp; product shots
                  </td>
                  <td className="px-4 py-3.5">
                    Detailed camera lens + lighting + color hex codes
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">Magnific / Topaz / SDXL Tile</td>
                  <td className="px-4 py-3.5">
                    8K photo restoration, de-blurring &amp; detail upscaling
                  </td>
                  <td className="px-4 py-3.5">
                    Micro-texture recovery prompts at 0.25–0.40 denoise
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={prose}>
            Publishing your generated visuals on your website? Use our{" "}
            <Link
              href="/tools/image-alt-text-generator"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              Image Alt Text Generator
            </Link>{" "}
            to write accessible SEO alt attributes, or turn your static visuals
            into motion clips in the{" "}
            <Link
              href="/tools/ugc-video-prompt-generator"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              UGC Ad &amp; Sora Video Prompt Studio
            </Link>
            .
          </p>
        </section>

        {/* PROMPTS */}
        <section>
          <h2 className="text-3xl font-black">
            Copy-Paste Prompts for 8K Image Upscaling &amp; Grok Graphics
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {ART_PROMPTS.map((item) => (
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
            Frequently Asked Questions: AI Art &amp; 8K Upscaling Prompts
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

        <ToolResources slug="ai-art-image-prompt-generator" />
      </div>
    </>
  );
}

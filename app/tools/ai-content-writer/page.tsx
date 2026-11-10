import type { Metadata } from "next";
import Link from "next/link";
import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import { ToolHeroBackground, toolHeroHeading, toolHeroSurface } from "@/features/tool-ui/ToolHero";
import AiContentWriterStudioClient from "@/features/ai-content-writer/AiContentWriterStudioClient";

const pageUrl = "https://doitwithai.tools/tools/ai-content-writer";

export const metadata: Metadata = {
  title: "Free AI Content Writer, Blog & Article Studio (8-Stage SEO & AEO Pipeline)",
  description:
    "Generate rank-ready SEO articles with an 8-stage AI Content Writer pipeline: search intent, URL slug, <580px meta title, H1–H3 outline, 50-word AI Overview box, E-E-A-T tables, and FAQ schema.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free AI Content Writer, Blog & Article Studio (8-Stage SEO Pipeline)",
    description:
      "All-in-one AI Content Writer, Blog Writer & Article Generator chaining intent, meta tags, 50-word AEO summary boxes, E-E-A-T proof, and FAQPage JSON-LD.",
    url: pageUrl,
    type: "website"
  }
};

const faqs = [
  {
    question: "How is this 8-Stage AI Content Writer different from Jasper, Copy.ai, or raw ChatGPT?",
    answer:
      "Single-prompt AI writers output generic text walls without search intent verification, pixel-checked meta tags, or structured data. Our 8-stage pipeline chains Search Intent -> Clean Slug -> <580px Meta Title -> H1/H2 Architecture -> 50-Word AI Overview Answer Box -> First-Hand E-E-A-T Proof Table -> FAQPage JSON-LD -> Multi-Format Visual Export."
  },
  {
    question: "Is this AI article writer completely free to use?",
    answer:
      "Yes. You can run the entire 8-stage SEO & AEO article pipeline in your browser with zero signup wall, copy the full Markdown/HTML draft and FAQ schema, or chain directly into our companion studios."
  }
];

export default function AiContentWriterPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <section className={`${toolHeroSurface} relative overflow-hidden border-b border-slate-800/80 py-8`}>
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-3 flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-white">Tools</Link>
            <span>/</span>
            <span className="text-indigo-400">Free AI Content Writer Studio</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                <span>✍️ Flagship 8-Stage Pipeline · 50-Word AEO Box · E-E-A-T Tables · FAQ Schema</span>
              </div>
              <h1 className={`${toolHeroHeading} text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white`}>
                Free AI Content Writer,{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                  Blog & Article Studio
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Chain all 8 SEO and Answer Engine Optimization (AEO) stages in one workspace—from search intent and pixel-safe meta tags to a 50-word Google AI Overview summary box, comparison tables, and FAQPage JSON-LD.
              </p>
              <PortableToolHeroBar
                slug="ai-content-writer"
                title="Free AI Content Writer, Blog & Article Studio"
                path="/tools/ai-content-writer"
                primaryLabel="Use Tool Now: Run 8-Stage Article Pipeline"
                workspaceId="ai-content-writer-workspace"
              />
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="font-semibold text-indigo-300">🔗 8 Connected SEO Stages</span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-emerald-300 font-medium">
                  100% Free
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">1. Search Intent & Entities</div>
                <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">2. SEO Slug & Meta (&lt;580px)</div>
                <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">3. 50-Word AI Overview Box</div>
                <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">4. E-E-A-T Draft + JSON-LD</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <AiContentWriterStudioClient />
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 space-y-10">
        <ToolResources slug="ai-content-writer" />
        <ToolFaq title="Free AI Content Writer, Blog & Article Studio FAQs" faqs={faqs} />
      </section>
    </main>
  );
}

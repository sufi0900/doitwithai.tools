import { articleSlug } from "@/features/prompts/meta-workflow";
import Link from "next/link";
import { getRelatedGuides } from "@/features/guides/data";
import { tools, toolPath } from "./catalog";

const TOPIC_PROMPT_GUIDES: Record<
  string,
  Array<{ href: string; title: string }>
> = {
  conversion: [
    {
      href: "/prompts/content-repurposing-social-media-prompts",
      title: "87 ChatGPT prompts for content repurposing & social media",
    },
    {
      href: "/prompts/infographic-data-visualization-prompts",
      title: "77 AI prompts for infographics, data charts & 2×2 diagrams",
    },
  ],
  "on-page": [
    {
      href: "/prompts/on-page-seo-content-writing-prompts",
      title: "84 ChatGPT prompts for on-page SEO, headings, E-E-A-T & readability",
    },
    {
      href: `/prompts/${articleSlug}`,
      title: "ChatGPT prompts for meta titles and meta descriptions",
    },
  ],
  writing: [
    {
      href: "/prompts/on-page-seo-content-writing-prompts",
      title: "84 ChatGPT prompts for on-page SEO, headings, E-E-A-T & readability",
    },
    {
      href: "/prompts/topic-clustering-topical-authority-prompts",
      title: "94 ChatGPT prompts for topic clustering, pillar pages & topical authority",
    },
  ],
  keywords: [
    {
      href: "/prompts/keyword-research-prompts",
      title: "100 keyword research prompts for SEO and YouTube",
    },
    {
      href: "/prompts/topic-clustering-topical-authority-prompts",
      title: "94 ChatGPT prompts for topic clustering, pillar pages & topical authority",
    },
  ],
  technical: [
    {
      href: "/prompts/technical-seo-audit-schema-prompts",
      title: "76 ChatGPT prompts for Technical SEO audits, JSON-LD schema & Core Web Vitals",
    },
    {
      href: "/prompts/ai-search-aeo-geo-visibility-prompts",
      title: "91 prompts for AI Search, AEO, GEO & LLM citation optimization",
    },
  ],
  "ai-search": [
    {
      href: "/prompts/ai-search-aeo-geo-visibility-prompts",
      title: "91 prompts for AI Search, AEO, GEO & LLM citation optimization",
    },
    {
      href: "/prompts/on-page-seo-content-writing-prompts",
      title: "84 ChatGPT prompts for on-page SEO, headings, E-E-A-T & readability",
    },
  ],
  "local-seo": [
    {
      href: "/prompts/local-seo-google-business-profile-prompts",
      title: "79 ChatGPT prompts for Local SEO & Google Business Profile",
    },
    {
      href: "/prompts/technical-seo-audit-schema-prompts",
      title: "76 ChatGPT prompts for Technical SEO audits & JSON-LD schema",
    },
  ],
  "off-page": [
    {
      href: "/prompts/link-building-digital-pr-outreach-prompts",
      title: "88 ChatGPT prompts for link building, Digital PR & journalist outreach",
    },
    {
      href: "/prompts/infographic-data-visualization-prompts",
      title: "77 AI prompts for citable infographics, data charts & 2×2 diagrams",
    },
  ],
  social: [
    {
      href: "/prompts/linkedin-personal-branding-b2b-prompts",
      title: "83 ChatGPT prompts for LinkedIn personal branding, carousels & B2B growth",
    },
    {
      href: "/prompts/youtube-shorts-video-script-prompts",
      title: "93 AI prompts for YouTube scripts, Shorts, Reels & TikTok hooks",
    },
  ],
};

export default async function ToolResources({ slug }: { slug: string }) {
  const tool = tools.find((item) => item.slug === slug);
  if (!tool) return null;
  // The executable tool remains available if optional CMS recommendations fail.
  let guides: Array<{ _id: string; slug: string; title: string }> = [];
  try {
    guides = await getRelatedGuides(slug);
  } catch {
    console.error("Unable to load supporting guides");
  }
  const related = tools.filter((item) =>
    tool.relatedToolSlugs.includes(item.slug),
  );
  const primaryTopic = tool.topics?.[0] || "on-page";
  const promptGuides = TOPIC_PROMPT_GUIDES[primaryTopic] || TOPIC_PROMPT_GUIDES["on-page"];

  return (
    <aside
      aria-label="Supporting guides and related tools"
      className="mx-auto my-12 max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 sm:p-8"
    >
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
        Continue your workflow
      </h2>
      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Companion prompt libraries &amp; guides
          </h3>
          <ul className="mt-3 space-y-3">
            {promptGuides.map((pg) => (
              <li key={pg.href}>
                <Link
                  href={pg.href}
                  className="text-primary underline hover:text-[#3453d1] dark:text-blue-200"
                >
                  {pg.title}
                </Link>
              </li>
            ))}
            {tool.relatedGuides.map((guide) => (
              <li key={guide.path}>
                <Link
                  href={guide.path}
                  className="text-primary underline hover:text-[#3453d1] dark:text-blue-200"
                >
                  {guide.title}
                </Link>
              </li>
            ))}
            {guides.map((guide) => (
              <li key={guide._id}>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="text-primary underline hover:text-[#3453d1] dark:text-blue-200"
                >
                  {guide.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Try a related studio tool
          </h3>
          <ul className="mt-3 space-y-3">
            {related.map((item) => (
              <li key={item.id}>
                <Link
                  href={toolPath(item.slug)}
                  className="text-primary underline hover:text-[#3453d1] dark:text-blue-200"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

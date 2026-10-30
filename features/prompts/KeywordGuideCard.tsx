import Image from "next/image";
import Link from "next/link";
import React from "react";

export type KeywordGuide = {
  href: string;
  image: string;
  alt: string;
  label: string;
  title: string;
  description: string;
  action: string;
};

export const keywordGuides = {
  research: {
    href: "/ai-seo/chatgpt-keyword-research",
    image:
      "https://cdn.sanity.io/images/qyshio4a/production/cf24e38598d79ac7da9528c47648168f24667c61-1400x788.png?auto=format&w=800&q=80",
    alt: "Cover of our guide to keyword research with ChatGPT.",
    label: "Start with a clear research process",
    title: "Put your keyword prompts into a useful workflow",
    description:
      "Follow our guide to exploring keyword ideas, reviewing evidence, and choosing a clear purpose for each page.",
    action: "Read the keyword research guide",
  },
  intent: {
    href: "/prompts/chatgpt-prompts-for-search-intent",
    image: "/prompts/search-intent-prompts-hero.webp",
    alt: "Search intent prompt guide with a desktop prompt mockup.",
    label: "Pause before expanding your list",
    title: "Make the reader’s next task clear",
    description:
      "Use six focused search intent prompts to review mixed queries, compare evidence, and choose a useful page format.",
    action: "Explore the search intent prompts",
  },
  evidence: {
    href: "/ai-seo/ai-vs-traditional-keyword-research",
    image:
      "https://cdn.sanity.io/images/qyshio4a/production/fe173a72a133b1a3dca918c3f4296676d8df4d72-1539x866.png?auto=format&w=800&q=80",
    alt: "Cover of our guide to combining AI ideas with traditional keyword research.",
    label: "Give your shortlist a reality check",
    title: "Connect AI keyword ideas with research data",
    description:
      "See where AI suggestions help, which measurements need a research source, and how to review both before planning content.",
    action: "Read the AI keyword research comparison",
  },
} satisfies Record<string, KeywordGuide>;

export default function KeywordGuideCard({ guide }: { guide: KeywordGuide }) {
  return (
    <aside
      className="my-10 grid min-w-0 overflow-hidden rounded-2xl border border-[#a9b9ff] bg-[#f3f5ff] text-slate-900 dark:border-[#7388e6] dark:bg-[#18243e] dark:text-slate-50 min-[701px]:grid-cols-[0.95fr_1.05fr]"
      aria-label={guide.label}
    >
      <div className="flex min-w-0 items-center bg-[#e6ebff] dark:bg-[#12203c]">
        <Image
          src={guide.image}
          alt={guide.alt}
          width={800}
          height={450}
          sizes="(max-width: 700px) 100vw, 480px"
          className="block aspect-video h-auto w-full object-contain"
        />
      </div>
      <div className="min-w-0 p-6 lg:p-9">
        <div className="flex items-center gap-2.5 text-xs font-semibold">
          <Image
            src="/doitwithai-logo-square.png"
            width={32}
            height={32}
            alt=""
            className="!h-8 !w-8 shrink-0 rounded-lg object-contain"
          />
          <span>Do It With AI Tools</span>
        </div>
        <p className="mb-2.5 mt-5 text-xs font-bold uppercase leading-6 tracking-wider text-[#364cb4] dark:text-[#b7c5ff]">
          {guide.label}
        </p>
        <h3 className="text-2xl font-extrabold leading-snug lg:text-3xl">
          {guide.title}
        </h3>
        <p className="mb-6 mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
          {guide.description}
        </p>
        <Link
          href={guide.href}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4058d0] px-4 py-3 text-sm font-bold leading-6 text-white hover:bg-[#3147b6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] sm:w-auto"
        >
          {guide.action} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </aside>
  );
}

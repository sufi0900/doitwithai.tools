import React from "react";
import Link from "next/link";
import ToolUtilityMenu from "./ToolUtilityMenu";

export interface ToolLandingHeroProps {
  /** Tool slug used for Do It AI and Embed/PC App deep links. */
  slug: string;
  /** Plain single-string H1 title (prevents JSX span missing-space bugs). */
  title: string;
  /** Concise 1–2 sentence description rendered directly under the H1. */
  description: string;
  /** Breadcrumb category label (e.g. "AI SEO Tools", "Content Writing"). */
  categoryLabel: string;
  /** Optional category hub link (defaults to "/tools"). */
  categoryHref?: string;
  /** Optional workspace anchor ID (defaults to "tool-studio-workspace"). */
  workspaceId?: string;
  /** Set true if the child tool already renders its own crisp white outer card. */
  unwrapWorkspaceCard?: boolean;
  /** Interactive tool workspace rendered directly above the fold. */
  children: React.ReactNode;
}

export default function ToolLandingHero({
  slug,
  title,
  description,
  categoryLabel,
  categoryHref = "/tools",
  workspaceId = "tool-studio-workspace",
  unwrapWorkspaceCard = false,
  children,
}: ToolLandingHeroProps) {
  return (
    <section className="relative bg-white dark:bg-slate-950">
      {/* Matte charcoal Ahrefs-style top hero band */}
      <div className="bg-[#14171D] pb-28 pt-8 text-white sm:pb-32 sm:pt-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Row 1: Minimal Breadcrumb (left) + Option A Utility Actions (right) */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-slate-400"
            >
              <Link href="/tools" className="transition hover:text-white">
                Tools
              </Link>
              <span aria-hidden="true" className="text-slate-600">
                /
              </span>
              <Link href={categoryHref} className="transition hover:text-white">
                {categoryLabel}
              </Link>
              <span aria-hidden="true" className="text-slate-600">
                /
              </span>
            </nav>

            <ToolUtilityMenu slug={slug} title={title} />
          </div>

          {/* Row 2 & 3: Solid white H1 + short plain description */}
          <div className="mt-5 max-w-3xl">
            <h1 className="text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-[17px]">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Row 4: Crisp white tool card overlapping the charcoal-to-white fold */}
      <div
        id={workspaceId}
        data-tool-workspace="true"
        className="relative z-10 mx-auto -mt-20 max-w-6xl px-4 pb-12 sm:-mt-24 sm:px-6 lg:px-8"
      >
        {unwrapWorkspaceCard ? (
          children
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

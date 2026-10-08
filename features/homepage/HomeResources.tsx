"use client";
import { useRef, useState, useCallback, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Copy, X, Gift } from "lucide-react";
import OriginalResourceCard from "@/app/free-ai-resources/UnifiedResourceCard";
import ResourceCarousel from "@/app/free-ai-resources/ResourceCarousel";
import type { HomeResource } from "./data";
const CarouselResourceCard = memo(function CarouselResourceCard({
  resource,
  onPrompt,
}: {
  resource: HomeResource;
  onPrompt: (resource: HomeResource) => void;
}) {
  return (
    <OriginalResourceCard
      resource={
        resource.source || {
          _id: resource._id,
          title: resource.title,
          overview: resource.overview,
          resourceFormat: resource.prompt ? "text" : resource.format,
          resourceFile: { url: resource.href },
          promptContent: resource.prompt
            ? [{ promptTitle: "Prompt", promptText: resource.prompt }]
            : [],
        }
      }
      previewRenderer={
        resource.image
          ? () => (
              <Image
                src={resource.image}
                alt={resource.imageAlt || resource.title}
                width={480}
                height={600}
                sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 30vw"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )
          : undefined
      }
      variant="carousel"
      onOpen={() => onPrompt(resource)}
    />
  );
});
export default function HomeResources({
  resources,
}: {
  resources: HomeResource[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<HomeResource | null>(null);
  const [copied, setCopied] = useState("");
  const openPrompt = useCallback((resource: HomeResource) => {
    setSelected(resource);
    setCopied("");
    dialog.current?.showModal();
  }, []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(selected?.prompt || "");
      setCopied("Prompt copied.");
    } catch {
      setCopied(
        "Copy is unavailable. Select the prompt text and copy it manually.",
      );
    }
  };
  return (
    <section
      aria-labelledby="resources-title"
      className="home-section bg-slate-50 dark:bg-[#0D1422]"
    >
      <div className="home-shell">
        <div className="home-section-head">
          <div>
            <p className="home-eyebrow">Useful starting points</p>
            <h2 id="resources-title" className="home-title">
              Free resources to put AI into practice
            </h2>
            <p className="home-description">
              Explore prompts and learning resources you can adapt to your next
              task, with clear details about what each resource provides.
            </p>
          </div>
          <Link className="home-text-link shrink-0" href="/free-ai-resources">
            Explore free resources{" "}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
        {resources.length ? (
          <ResourceCarousel
            className="home-original-resource-carousel"
            autoplaySpeed={5500}
            modalOpen={!!selected}
          >
            {resources.map((r) => (
              <div key={r._id} className="home-resource-slide">
                <CarouselResourceCard resource={r} onPrompt={openPrompt} />
              </div>
            ))}
          </ResourceCarousel>
        ) : (
          <div className="home-fallback">
            <Gift aria-hidden className="h-7 w-7 text-[#5271ff]" />
            <p>Find prompts and learning resources in our free collection.</p>
            <Link className="home-text-link" href="/free-ai-resources">
              Open the resource collection{" "}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        )}
        <dialog
          ref={dialog}
          aria-labelledby="home-resource-prompt-title"
          className="home-prompt-dialog"
          onClose={() => setSelected(null)}
          onClick={(e) => {
            if (e.target === e.currentTarget) dialog.current?.close();
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <h4 id="home-resource-prompt-title" className="text-xl font-bold">
              {selected?.title}
            </h4>
            <button
              type="button"
              aria-label="Close prompt"
              className="home-focus grid min-h-11 min-w-11 place-items-center rounded-lg"
              onClick={() => dialog.current?.close()}
            >
              <X aria-hidden className="h-5 w-5" />
            </button>
          </div>
          {selected?.prompt ? (
            <p className="mt-5 whitespace-pre-wrap rounded-xl bg-slate-50 p-5 text-sm leading-7 dark:bg-slate-800">
              {selected.prompt}
            </p>
          ) : (
            <div className="mt-5">
              {selected?.image && (
                <Image
                  src={selected.image}
                  alt={selected.imageAlt || selected.title}
                  width={640}
                  height={400}
                  className="h-auto w-full rounded-xl"
                />
              )}
              <p className="mt-4 text-sm leading-7">{selected?.overview}</p>
              {selected?.href && (
                <a
                  href={selected.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home-primary-button mt-4"
                >
                  {selected.action}
                  <ArrowRight aria-hidden size={16} />
                </a>
              )}
            </div>
          )}
          {selected?.prompt && (
            <button
              type="button"
              onClick={copy}
              className="home-primary-button mt-5"
            >
              <Copy aria-hidden className="h-4 w-4" />
              Copy prompt
            </button>
          )}
          <p role="status" className="mt-3 text-sm">
            {copied}
          </p>
        </dialog>
      </div>
    </section>
  );
}

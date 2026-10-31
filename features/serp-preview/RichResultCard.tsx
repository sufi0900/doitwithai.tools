import { ChevronDown, Clock, MapPin, Star } from "lucide-react";
import type { RichResultBlock } from "./types";
function StarRating({
  value,
  count,
}: {
  value: number | null;
  count: number | null;
}) {
  value =
    value !== null && Number.isFinite(value) && value >= 0 && value <= 5
      ? value
      : null;
  count = count !== null && Number.isFinite(count) && count >= 0 ? count : null;
  if (value === null && count === null)
    return (
      <span className="text-xs text-slate-500">No valid rating supplied</span>
    );
  const rating = value ?? 0;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((index) => (
          <Star
            key={index}
            className={`h-3.5 w-3.5 ${index <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
          />
        ))}
      </div>
      {value !== null && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {value.toFixed(1)}
        </span>
      )}
      {count !== null && (
        <span className="text-xs text-slate-400">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}

export default function RichResultCard({ block }: { block: RichResultBlock }) {
  if (block.type === "FAQPage") {
    return (
      <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
        {block.data.slice(0, 4).map((item) => (
          <div key={item.question} className="p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {item.question}
              </p>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            </div>
            <p className="mt-1.5 text-xs leading-6 text-slate-500 dark:text-slate-400">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    );
  }
  if (block.type === "HowTo") {
    return (
      <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        {block.data.name && (
          <p className="mb-2 text-sm font-bold text-slate-800 dark:text-slate-100">
            {block.data.name}
          </p>
        )}
        <ol className="space-y-2">
          {block.data.steps.slice(0, 5).map((step, index) => (
            <li
              key={index}
              className="flex gap-2 text-xs leading-6 text-slate-600 dark:text-slate-300"
            >
              <span className="font-bold text-blue-700 dark:text-blue-300">
                {index + 1}.
              </span>
              <span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {step.name}
                </span>
                {step.text ? ` - ${step.text}` : ""}
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  if (block.type === "Review" || block.type === "AggregateRating") {
    return (
      <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        {block.data.itemName && (
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {block.data.itemName}
          </p>
        )}
        <div className="mt-1.5">
          <StarRating
            value={block.data.ratingValue}
            count={block.data.reviewCount}
          />
        </div>
      </div>
    );
  }
  if (block.type === "BreadcrumbList") {
    return (
      <div className="rounded-xl border border-slate-200 p-3 text-xs text-emerald-700 dark:border-slate-700 dark:text-emerald-400">
        {block.data.join(" › ")}
      </div>
    );
  }
  if (block.type === "Article") {
    return (
      <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {block.data.headline}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {[block.data.author, block.data.datePublished]
            .filter(Boolean)
            .join(" · ") || "No author/date set"}
        </p>
      </div>
    );
  }
  if (block.type === "Product") {
    return (
      <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {block.data.name}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
          {block.data.price && (
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {block.data.currency || ""} {block.data.price}
            </span>
          )}
          {block.data.availability && (
            <span className="text-emerald-600 dark:text-emerald-400">
              {block.data.availability}
            </span>
          )}
          {(block.data.ratingValue || block.data.reviewCount) && (
            <StarRating
              value={block.data.ratingValue}
              count={block.data.reviewCount}
            />
          )}
        </div>
      </div>
    );
  }
  if (block.type === "Recipe") {
    return (
      <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {block.data.name}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          {block.data.totalTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {block.data.totalTime}
            </span>
          )}
          {(block.data.ratingValue || block.data.reviewCount) && (
            <StarRating
              value={block.data.ratingValue}
              count={block.data.reviewCount}
            />
          )}
        </div>
      </div>
    );
  }
  if (block.type === "Event") {
    return (
      <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {block.data.name}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          {block.data.startDate && <span>{block.data.startDate}</span>}
          {block.data.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {block.data.location}
            </span>
          )}
        </div>
      </div>
    );
  }
  return null;
}

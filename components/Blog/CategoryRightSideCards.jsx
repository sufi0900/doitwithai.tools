// components/Blog/CategoryRightSideCards.js (or HomeSmallCard.js)
import React from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { CalendarMonthOutlined, LocalOfferOutlined as LocalOfferIcon } from "@mui/icons-material";
import { urlForImage } from "@/sanity/lib/image";
import ImageOptimizer from "./ImageOptimizer";

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const HomeSmallCard = ({ post, categoryType, categoryColor, CategoryIcon }) => {
  const imageUrl = post.mainImage ? urlForImage(post.mainImage).url() : `https://placehold.co/400x200/CCCCCC/333333?text=Image+Not+Found`;
  const schemaSlugMap = {
    makemoney: "ai-learn-earn",
    aitool: "ai-tools",
    coding: "ai-code",
    seo: "ai-seo",
  };
  const postSlug = `/${schemaSlugMap[post._type] || 'blog'}/${post.slug.current}`;

  return (
    <Link href={postSlug} className="block h-full">
      <div className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow transition-all duration-300 hover:shadow-lg hover:scale-[1.03] dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 h-full flex flex-col">
        {/*
          Reverted styling for the card container itself to align with the vertical layout.
          - `rounded-lg` for consistency with big card.
          - `border border-gray-200 shadow` for base styling.
          - `hover:shadow-lg hover:scale-[1.03]` for big card like hover.
          - `h-full flex flex-col` for vertical stacking and height stretching.
        */}

        {/* Image Section */}
        <div className="relative overflow-hidden h-32 md:h-40">
          <img
            src={imageUrl}
            alt={post.title}
            // Keep the image scale effect as it's a nice interaction.
            // If you want the more aggressive rotate/scale from the big card, apply it here.
            // For now, keeping the subtle scale.
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x200/CCCCCC/333333?text=Image+Not+Found`; }}
          />
          {/* Category Tag - Absolute position on the image */}
          {categoryType && (
            <div className={`absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full ${categoryColor} px-3 py-1 text-xs font-semibold capitalize text-white transition duration-300 hover:bg-stone-50 hover:text-primary`}>
              {CategoryIcon && <CategoryIcon size={14} style={{ fontSize: "14px", marginRight: "4px" }} />}
              <span>{categoryType}</span>
            </div>
          )}
          {/* Removed the dark overlay on image hover for simplicity, can be added back if desired. */}
          {/* <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
        </div>

        {/* Content Section: This needs to be `flex-col` and `justify-between` to push elements */}
        <div className="p-4 flex flex-col flex-1"> {/* Removed `justify-between` from here initially */}
          {/* Top content block (title, overview) */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-2">
              {post.title}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-400 line-clamp-3 mb-3"> {/* Increased line-clamp to 3 for more overview text */}
              {post.overview}
            </p>
          </div>

          {/* Bottom content block (metadata, read more button) */}
          <div className="mt-auto"> {/* `mt-auto` pushes this block to the bottom */}
            {/* Metadata (Date and Read Time) */}
            <div className="flex items-center justify-start gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3"> {/* Changed `justify-between` to `justify-start` and increased gap */}
              <div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
                <CalendarMonthOutlined style={{ fontSize: "14px", marginRight: "4px" }} className="text-body-color transition duration-300 hover:text-blue-500" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center">
                <Clock style={{ fontSize: "14px", marginRight: "4px" }} size={14} className="text-body-color transition duration-300 hover:text-blue-500" />
                {post.readTime?.minutes || 5} min read
              </div>
            </div>

            {/* Read More Button */}
            <Link
              href={postSlug}
              className="inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Read more
              <svg
                className="ms-2 h-3.5 w-3.5 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HomeSmallCard;
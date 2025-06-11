"use client";
import Link from "next/link";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { CalendarMonth } from "@mui/icons-material";

// Import your BlogCardImageOptimizer component
import BlogCardImageOptimizer from "./ImageOptimizer"; // Adjust path as needed

export default function SingleBlog({
  publishedAt,
  mainImage,
  title,
  overview,
  ReadTime,
  slug,
  tags,
}) {
  return (
    <section>
      <Link
        href={slug}
        // Overall card scale hover effect remains here.
        className="lg:h-[151px] transition duration-200 ease-in-out hover:scale-[1.03]
                   flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow
                   md:flex-row hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        {/* Outer Image Container: Defines the space, applies overflow-hidden, and rounded corners. */}
        <div
          className="relative overflow-hidden flex-shrink-0
                     w-full aspect-[4/3] 
                     md:w-48 md:h-full 
                     lg:w-[198px] lg:h-[151px] 
                     rounded-t-lg md:rounded-none md:rounded-s-lg 
                     "
        >
          {/* Inner Wrapper for Hover Effects: This div will receive the scale and rotate transformations. */}
          <div
            className="w-full h-full 
                       transition-transform duration-200 ease-in-out 
                       hover:rotate-3 hover:scale-[1.5]" // Image specific hover effects applied to this inner wrapper
          >
            <BlogCardImageOptimizer
              src={mainImage}
              alt={title} // Use actual title for alt text for better accessibility
              width={500} // Intrinsic width, used by Next.js for aspect ratio and placeholder
              height={500} // Intrinsic height, used by Next.js for aspect ratio and placeholder
              // No hover classes here. Only pass rounded classes for consistent styling.
              className="rounded-t-lg md:rounded-none md:rounded-s-lg"
            />
          </div>
        </div>
        <div className="flex flex-col justify-between p-4 leading-normal">
          <h5 className="lg:leading-6 line-clamp-2 lg:text-lg font-medium text-start text-black dark:text-white sm:text-[16px] sm:leading-tight">
            {title}
          </h5>
          <div className="mb-1 mt-1 flex items-center justify-start gap-2">
            <div className="flex items-center pr-3 border-r border-gray-300 dark:border-gray-600">
              <p className="text-sm font-medium text-body-color">
                {publishedAt}
              </p>
            </div>
            <div className="flex items-center">
              <p className="text-sm font-medium text-body-color">
                Read Time: {ReadTime} min
              </p>
            </div>
          </div>
          <div>
            <Link
              href={slug}
              className="my-2 inline-flex items-center rounded-lg bg-blue-700 px-3 py-1 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Read more
              <svg
                className="ms-2 h-3 w-3 rtl:rotate-180"
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
      </Link>
    </section>
  );
}

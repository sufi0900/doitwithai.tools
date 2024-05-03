/* eslint-disable @next/next/no-img-element */
import { urlForImage } from "@/sanity/lib/image";

import Image from "next/image";
import Link from "next/link";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventNoteIcon from "@mui/icons-material/EventNote"; // Import MUI icon for date
export default function SingleBlog({
  publishedAt,
  mainImage,
  title,
  overview,
  slug,
}) {
  const formattedDate = new Date(publishedAt).toLocaleDateString();
  const slugUrl = slug?.current;
  const imageUrl = mainImage?.url;
  const formattedTitle = title
    ? `${title.split(" ").slice(0, 3).join(" ")}${
        title.split(" ").length > 3 ? " ..." : ""
      }`
    : "";
  // const formattedOverview = overview
  //   ? `${overview.split(" ").slice(0, 12).join(" ")}${
  //       overview.split(" ").length > 12 ? " ..." : ""
  //     }`
  //   : "";
  return (
    <>
      <div className="px-2 py-4">
        <div className="card max-w-sm transform cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white text-black shadow transition duration-200 ease-in-out  hover:scale-105 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
          {" "}
          <Link
            href={`/ai-trending-news/${slugUrl}`}
            className="relative block aspect-[37/22] w-full"
          >
            <span className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold capitalize text-white transition duration-300 hover:bg-stone-50 hover:text-primary">
              Computer
            </span>

            {/* Image */}
            <div className="relative aspect-[37/22] overflow-hidden">
              <img
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5]"
                src={urlForImage(mainImage).url()}
                alt={title}
              />
            </div>
          </Link>
          {/* Content */}
          <div className="p-5">
            {/* Title */}
            <Link 
         href={`/ai-trending-news/${slugUrl}`}
            >
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {formattedTitle}
              </h5>
            </Link>
            {/* Overview */}
            <p className="mb-3 line-clamp-5 font-normal text-gray-700 dark:text-gray-400">
              {overview}
            </p>
            {/* Meta Data */}
            <div className="mb-3 mt-3 flex items-center justify-between">
              <div className="flex items-center">
                <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
                <p className="text-sm font-medium text-dark dark:text-white">
                  Read Time: 5 min
                </p>
              </div>
              <div className="flex items-center">
                <EventNoteIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
                <p className="text-sm font-medium text-dark dark:text-white">
                  {formattedDate}
                </p>
              </div>
            </div>
            {/* Read more link */}
            <Link
             href={`/ai-trending-news/${slugUrl}`}
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
    </>
  );
}

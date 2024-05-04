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
  ReadTime,
  slug,
  tags
}) {

  

  return (
    <>
          
      <div className="px-2 py-4">
        <div className="card transition duration-300 hover:scale-[1.05] max-w-sm transform cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white text-black shadow  hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
          {" "}
          <Link
            href={ slug}
           
          >
            {/* <span className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold capitalize text-white transition duration-300 hover:bg-stone-50 hover:text-primary"> */}
            {tags && tags.slice(0, 1).map((tag, index) => (
              <Link
                key={index}
                href={tag.link} 
           
              >
                <span className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold capitalize text-white transition duration-300 hover:bg-stone-50 hover:text-primary">
                  {tag.name}
                </span>
              </Link>
            ))}
            {/* </span> */}

            {/* Image */}
            <div className="relative  aspect-[37/22] overflow-hidden">
              <Image
                className="duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5] absolute inset-0 h-full w-full object-cover transition-transform "
                src={mainImage}
                alt={title}
                fill
              />
            </div>
          </Link>
          {/* Content */}
          <div className="p-5">
            {/* Title */}
            <Link href={slug}>
              <h5 className="mb-2 line-clamp-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {title   }
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
                Read Time:  {ReadTime} min
                </p>
              </div>
              <div className="flex items-center">
                <EventNoteIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
                <p className="text-sm font-medium text-dark dark:text-white">
                  {publishedAt}
                </p>
              </div>
            </div>
            {/* Read more link */}
            <Link
              href={slug}
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
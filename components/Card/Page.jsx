/* eslint-disable @next/next/no-img-element */
import { urlForImage } from "@/sanity/lib/image";

import Image from "next/image"; // Keep this import, though OptimizeImage wraps it
import Link from "next/link";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { Box, Card, CardMedia } from "@mui/material";
import OptimizeImage from "@/components/Blog/ImageOptimizer"

export default function CardComponent({
  publishedAt,
  mainImage,
  title,
  overview,
  readTime,
  slug,
  tags
}) {
  return (
    <>
      <div className="px-2 py-4 ">
        <Card
          sx={{
            height: { xs: "auto", lg: "522px" },
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "scale(1.04)",
            }
          }}
          className="card4 max-w-sm transform cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white text-black shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        >
          <Link href={slug}>
            {tags && tags.slice(0, 1).map((tag, index) => (
              <Link key={index} href={tag.link}>
                <span className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold capitalize text-white transition duration-300 hover:bg-stone-50 hover:text-primary">
                  {tag.name}
                </span>
              </Link>
            ))}

            {/* Image */}
            <Box position="relative" sx={{ overflow: "hidden" }}>
              <CardMedia
                component="div"
                sx={{
                  position: "relative",
                  // Set a fixed height for CardMedia on all devices,
                  // or at least a responsive min-height.
                  // This ensures the parent of Next.js Image (with fill) has a dimension.
                  // For a card image, a fixed aspect ratio or a minimum height is often best.
                  height: { xs: 200, sm: 250, md: 222, lg: 222 }, // Example: fixed heights for different breakpoints
                  // Or, if you want a fixed aspect ratio regardless of width (e.g., 16:9)
                  // paddingTop: '56.25%', // This creates a 16:9 aspect ratio (height / width = 9 / 16 = 0.5625)
                  // height: 0, // When using paddingTop for aspect ratio, set height to 0
                  overflow: "hidden",
                }}
                className="transition-transform duration-200 ease-in-out hover:rotate-3 hover:scale-[1.5]"
              >
                <OptimizeImage
                  src={mainImage}
                  alt={title}
                  // Remove layout="responsive", it's replaced by `fill` and `sizes`
                  // width={500} // Remove width/height when using `fill`
                  // height={500} // Remove width/height when using `fill`
                  // The `priority` prop can be passed down if you want to eager load,
                  // as discussed in the previous response.
                  priority={true} // Add priority to ensure it loads immediately on page load
                />
              </CardMedia>
            </Box>
          </Link>

          <div className="p-5">
            <Link href={slug}>
              <h5 className="mb-2 line-clamp-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {title}
              </h5>
            </Link>

            <p className="mb-3 line-clamp-4 font-normal text-gray-700 dark:text-gray-400">
              {overview}
            </p>

            <div className="mb-3 mt-3 flex items-center justify-between">
              <div className="flex items-center">
                <AccessTimeIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
                <p className="text-sm font-medium text-dark dark:text-white">
                  Read Time: {readTime} min
                </p>
              </div>
              <div className="flex items-center">
                <EventNoteIcon className="mr-2 text-body-color transition duration-300 hover:text-blue-500" />
                <p className="text-sm font-medium text-dark dark:text-white">
                  {publishedAt}
                </p>
              </div>
            </div>
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
        </Card>
      </div>
    </>
  );
}
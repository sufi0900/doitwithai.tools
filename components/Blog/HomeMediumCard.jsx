// homemedium card
"use client";
import {
  Card,
  CardContent,
} from "@mui/material";
import Box from "@mui/material/Box";
import Link from "next/link";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { CalendarMonth } from "@mui/icons-material";
import ImageOptimizer from "@/app/ai-seo/[slug]/OptimizedImage";

export default function MediumCard({
  publishedAt,
  mainImage,
  title,
  overview,
  ReadTime,
  slug,
  tags,
}) {
  return (
     <Card
      sx={{
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px) scale(1.02)",
          boxShadow: "0 20px 40px -12px rgba(37, 99, 235, 0.25)",
        },
        height: { xs: "auto", lg: "329px" },
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: { xs: "column", sm: "column", lg: "column" }, // Vertical for all sizes
      }}
      className="group cursor-pointer shadow-md hover:shadow-xl dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      {/* The Link container uses the same responsive flex direction */}
      <Link href={slug} className="h-full flex flex-col">
        {/* Image Section */}
        <Box
          position="relative"
          sx={{
            overflow: "hidden",
            background: "linear-gradient(135deg, #2563eb10, #8b5cf610)",
            flexShrink: 0,
            height: { xs: "auto", sm: "auto", lg: "140px" }, // Dynamic height for xs/sm
            width: { xs: "100%", sm: "100%", lg: "100%" }, // Full width for all sizes
            aspectRatio: { xs: "3/2", sm: "3/2", lg: "unset" }, // Maintain aspect ratio for xs/sm
          }}
        >
          <div className="w-full h-full">
            <div className="absolute inset-0 h-full w-full transition-all duration-500 ease-out group-hover:scale-110">
              <ImageOptimizer
                src={mainImage}
                alt={title}
                width={400}
                height={200}
                quality={80}
                className="object-cover w-full h-full"
                blurDataURL={undefined}
                style={{ width: "100%", height: "100%" }} // Ensure image fills container
                onClick={undefined}
              />
            </div>
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Enhanced Tag */}
          {tags && tags.length > 0 && (
            <Link
              href={tags[0].link}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-3 top-3 z-20 inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 text-xs font-semibold capitalize text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:scale-105 backdrop-blur-sm border border-white/20"
            >
              <LocalOfferIcon style={{ fontSize: "10px" }} />
              {tags[0].name}
            </Link>
          )}

          {/* Reading Progress Indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </Box>

        {/* Content Section */}
        <CardContent
          className="flex-1 flex flex-col p-4"
          sx={{
            padding: { xs: "12px !important", sm: "16px !important", lg: "16px !important" },
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
            justifyContent: "flex-start", // Consistent for all sizes
          }}
        >
          {/* Title */}
          <div className="mb-3">
            <h3 className="line-clamp-2 text-base font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 min-h-[2.4rem] lg:min-h-[3rem]">
              {title}
            </h3>
          </div>

          {/* Overview */}
          <div className="flex-1 mb-3 min-h-0">
            <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
              {overview}
            </p>
          </div>

          {/* Meta Information - Vertical for xs/sm, Horizontal for lg */}
          <div className="mt-auto">
            <div
              className="flex gap-3 text-xs"
              style={{
                flexDirection: { xs: "column", sm: "column", lg: "row" },
                alignItems: { xs: "flex-start", sm: "flex-start", lg: "center" },
                justifyContent: { xs: "flex-start", sm: "flex-start", lg: "space-between" },
              }}
            >
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-full bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/50 transition-colors duration-300">
                    <CalendarMonth
                      className="text-blue-600 dark:text-blue-400"
                      sx={{ fontSize: 12 }}
                    />
                  </div>
                  <p className="font-medium text-gray-600 dark:text-gray-400">
                    {publishedAt}
                  </p>
                </div>

                <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 hidden lg:block" />

                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-full bg-green-50 dark:bg-green-900/30 group-hover:bg-green-100 dark:group-hover:bg-green-800/50 transition-colors duration-300">
                    <AccessTimeIcon
                      className="text-green-600 dark:text-green-400"
                      sx={{ fontSize: 12 }}
                    />
                  </div>
                  <p className="font-medium text-gray-600 dark:text-gray-400">
                    {ReadTime} min
                  </p>
                </div>
              </div>

              {/* Read indicator */}
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs font-medium">Read</span>
                <svg
                  className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>

      {/* Corner Accent */}
      <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-2xl transform scale-0 group-hover:scale-100 transition-transform duration-500" />

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-xl border-2 border-blue-500/0 group-hover:border-blue-500/20 transition-all duration-300 pointer-events-none" />
    </Card>
  );
}
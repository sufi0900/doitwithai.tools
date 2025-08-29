"use client";
import { urlForImage } from "@/sanity/lib/image";
import Link from "next/link";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { CalendarMonth, ArrowForward } from "@mui/icons-material";
import { Box, Card, CardContent } from "@mui/material";
// import Image from "next/image";
import OptimizedImage from "@/app/ai-seo/[slug]/OptimizedImage";

export default function CardComponent({
  publishedAt,
  mainImage,
  title,
  overview,
  readTime,
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
        height: "auto", // Removed fixed height for dynamic content
        width: "100%",
        maxWidth: { xs: "100%", sm: "400px", md: "100%" },
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
      }}
      className="group cursor-pointer shadow-md hover:shadow-xl dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      <Link href={slug}>
        {/* Image Section - Better aspect ratio control */}
        <Box
          position="relative"
          sx={{
            overflow: "hidden",
            background: "linear-gradient(135deg, #2563eb10, #8b5cf610)",
            flexShrink: 0,
            width: "100%",
            height: { 
              xs: "200px", 
              sm: "220px", 
              md: "240px",
              lg: "250px",
              xl: "260px"
            },
          }}
        >
          <div className="w-full h-full">
            <div className="absolute inset-0 h-full w-full transition-all duration-500 ease-out group-hover:scale-110">
            <OptimizedImage
  src={urlForImage(mainImage).width(800).height(600).fit("crop").auto("format").url()}
  alt={title}
    width={800}
     height={600}
                
  quality={80}
  priority={false} // set to true only for above-the-fold images
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>

            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          {/* Tag positioning */}
          {tags && tags.length > 0 && (
            <Link
              href={tags[0].link}
              className="absolute right-3 top-3 z-20 inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 text-xs font-semibold capitalize text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:scale-105 backdrop-blur-sm border border-white/20"
            >
              <LocalOfferIcon style={{ fontSize: "10px" }} />
              {tags[0].name}
            </Link>
          )}
          
          {/* Bottom gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </Box>
      </Link>

      {/* Content Section - Better content distribution */}
      <CardContent
        sx={{
          padding: { 
            xs: "16px !important", 
            sm: "20px !important",
            md: "24px !important" 
          },
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {/* Main content area */}
        <div className="flex flex-col flex-grow">
          <Link href={slug}>
            <h5 
              className="font-bold leading-tight text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 mb-3"
              style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                lineHeight: '1.4',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: 'clamp(3.6rem, 8vw, 4.2rem)'
              }}
            >
              {title}
            </h5>
          </Link>
          
          <p 
            className="font-normal text-gray-700 dark:text-gray-400"
            style={{
              fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 'clamp(3.75rem, 6vw, 4.5rem)', // Consistent height for overview
              marginBottom: '1rem',
            }}
          >
            {overview}
          </p>
        </div>

        {/* Bottom section with metadata and button */}
        <div className="mt-auto">
          {/* Metadata row */}
          <div className="flex items-center justify-start gap-3 text-xs mb-4">
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
            
            <div className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
            
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-full bg-green-50 dark:bg-green-900/30 group-hover:bg-green-100 dark:group-hover:bg-green-800/50 transition-colors duration-300">
                <AccessTimeIcon
                  className="text-green-600 dark:text-green-400"
                  sx={{ fontSize: 12 }}
                />
              </div>
              <p className="font-medium text-gray-600 dark:text-gray-400">
                {readTime} min
              </p>
            </div>
          </div>

          {/* Read More Button - Enhanced with proper spacing */}
          <Link
            href={slug}
            className="group/button relative inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800 overflow-hidden w-fit"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-700 ease-out" />
            
            <span className="relative z-10">Read Full Article</span>
            
            <ArrowForward
              className="relative z-10 transition-all duration-300 group-hover/button:translate-x-0.5 group-hover/button:scale-110"
              sx={{ fontSize: 16 }}
            />
            
            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover/button:opacity-20 transition-opacity duration-300 blur-sm" />
          </Link>
        </div>
      </CardContent>

      {/* Decorative corner element */}
      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-3xl transform scale-0 group-hover:scale-100 transition-transform duration-500" />
    </Card>
  );
}
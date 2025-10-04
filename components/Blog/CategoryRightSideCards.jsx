// components/Blog/CategoryRightSideCards.js (or HomeSmallCard.js)
import React from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { CalendarMonth, ArrowForward } from "@mui/icons-material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { urlForImage } from "@/sanity/lib/image";
import ImageOptimizer from "@/app/ai-seo/[slug]/OptimizedImage";

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const CategoryRightSideCards = ({ post, categoryType, categoryColor, CategoryIcon }) => {
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
      <div 
        className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-400 ease-out hover:scale-[1.02] hover:translate-y-[-4px] hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 h-full flex flex-col"
        style={{
          boxShadow: "0 20px 40px -12px rgba(37, 99, 235, 0.25)",
        }}
      >
        {/* Image Section */}
        <div className="relative overflow-hidden h-32 md:h-40">
          <div className="absolute inset-0 h-full w-full transition-all duration-500 ease-out group-hover:scale-110">
            <ImageOptimizer
              src={imageUrl}
              alt={post.title}
              width={400}
              height={200}
              className="h-full w-full object-cover"
            />
          </div>
          
          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category Tag - Absolute position on the image */}
          {categoryType && (
            <div className="absolute right-3 top-3 z-20 inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 text-xs font-semibold capitalize text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:scale-105 backdrop-blur-sm border border-white/20">
              {CategoryIcon && <CategoryIcon size={14} style={{ fontSize: "14px", marginRight: "4px" }} />}
              <span>{categoryType}</span>
            </div>
          )}
        </div>

        {/* Content Section: This needs to be `flex-col` and `justify-between` to push elements */}
        <div className="p-4 flex flex-col flex-1">
          {/* Top content block (title, overview) */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              {post.title}
            </h3>
            <p className="text-base text-gray-700 dark:text-gray-400 line-clamp-3 mb-3">
              {post.overview}
            </p>
          </div>

          {/* Bottom content block (metadata, read more button) */}
          <div className="mt-auto">
            {/* ⚡ Here's the key change: Make the meta info responsive */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded-full bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/50 transition-colors duration-300">
                  <CalendarMonth 
                    className="text-blue-600 dark:text-blue-400" 
                    sx={{ fontSize: 12 }}
                  />
                </div>
                <p className="font-medium text-gray-600 dark:text-gray-400">
                  {formatDate(post.publishedAt)}
                </p>
              </div>
              
              <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 hidden sm:block" />
              
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded-full bg-green-50 dark:bg-green-900/30 group-hover:bg-green-100 dark:group-hover:bg-green-800/50 transition-colors duration-300">
                  <AccessTimeIcon 
                    className="text-green-600 dark:text-green-400" 
                    sx={{ fontSize: 12 }}
                  />
                </div>
                <p className="font-medium text-gray-600 dark:text-gray-400">
                  {post.readTime?.minutes || 5} min
                </p>
              </div>
            </div>

            {/* Enhanced Read More Button */}
            <Link
              href={postSlug}
              className="group/button relative inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800 overflow-hidden w-fit"
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-700 ease-out" />
              
              {/* Button Content */}
              <span className="relative z-10">Read More</span>
              <ArrowForward 
                className="relative z-10 transition-all duration-300 group-hover/button:translate-x-0.5 group-hover/button:scale-110" 
                sx={{ fontSize: 14 }}
              />
            </Link>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryRightSideCards;
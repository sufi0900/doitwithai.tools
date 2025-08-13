import React from "react";
import Image from "next/image";
import { urlForImage } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";
import ReadingProgressCircle from "@/app/ai-seo/[slug]/ReadingProgressCircle";

const ArticleHeader = ({ data, imgdesc }) => {
  // If data is not available, return a minimal fallback
  if (!data || !data.title || !data.mainImage) {
    return (
      <div className="w-full">
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-4 text-xl font-bold leading-tight text-gray-800 dark:text-gray-200 text-left sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
            Loading Article...
          </h1>
          <div className="w-16 sm:w-24 h-1 bg-blue-500 rounded-full"></div>
        </div>
        <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center h-48 sm:h-64 md:h-80 lg:h-96">
          <p className="text-gray-500 dark:text-gray-400">Content loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      
      {/* Enhanced Responsive Title Section - Left Aligned */}
      <div className="mb-6 sm:mb-8 text-left">
        <h1 className="mb-4 text-xl font-bold leading-tight tracking-tight text-blue-600 dark:text-blue-400 sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
          {data.title}
        </h1>
        <div className="w-16 sm:w-24 h-1 bg-blue-500 rounded-full"></div>
      </div>

      {/* Reading Progress Circle */}
      <ReadingProgressCircle />

      {/* Enhanced Main Image Section - Full Impact Design */}
      <div className="w-full my-6 sm:my-8">
        <div className="relative group">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300 ease-out">
            
            {/* Enhanced gradient border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 p-[1px]">
              <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-900"/>
            </div>
            
            {/* Minimal padding for full impact */}
            <div className="relative p-1 sm:p-2">
              <figure className="relative">
                
                {/* Main Image Container */}
                <div className="relative overflow-hidden rounded-xl">
                  <div className="relative aspect-[16/9] sm:aspect-[20/10] lg:aspect-[28/16]">
                    <Image
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                      src={urlForImage(data.mainImage).url()}
                      alt={data.mainImage.alt || `${data.title}`}
                      fill
                      priority
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                    />
                    
                    {/* Subtle overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"/>
                  </div>
                </div>

                {/* Enhanced Image Caption with Info Icon and Proper Mobile Sizing */}
                {data.mainImage.imageDescription && (
                  <figcaption className="mt-3 sm:mt-4 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-start gap-2 sm:gap-3">
                      {/* Info Icon - Smaller on Mobile */}
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      {/* Caption Text - Properly Sized for Mobile */}
                      <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        <PortableText value={data.mainImage.imageDescription} components={imgdesc} />
                      </div>
                    </div>
                  </figcaption>
                )}
              </figure>
            </div>
          </div>
          
          {/* Background glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"/>
        </div>
      </div>
    </div>
  );
};

export default ArticleHeader;
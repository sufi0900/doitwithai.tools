// app/blogs/BlogHeader.jsx (Rename from app/ai-seo/[slug]/BlogHeader if it's generic)
// This component is optimized for Server-Side Rendering (SSR) for best FCP.
// NO "use client" directive here.

import React from "react";
import Image from "next/image";
import { urlForImage } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";

// Assuming ReadingProgressCircle might still need 'use client'
// and will handle its own mounting. We'll keep it here but ensure it doesn't block.
import ReadingProgressCircle from "@/app/ai-seo/[slug]/ReadingProgressCircle";

// We no longer need useInView for initial render optimization.
// import { useInView } from "react-intersection-observer";

// We remove articleLoading and any state tied to it for FCP
const BlogHeader = ({ data, imgdesc }) => {
  // If data is not available, return a minimal fallback to avoid errors
  // This should ideally not happen if data fetching is robust before rendering.
  if (!data || !data.title || !data.mainImage) {
    return (
      <div className="lg:-mx-5 w-full overflow-hidden rounded">
        <div className="lg:m-4">
          <div className="mb-8 text-center lg:text-left relative">
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-800 dark:text-gray-200 md:text-5xl lg:text-6xl">
              Loading Article...
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-gray-300 to-gray-400 mx-auto lg:mx-0 rounded-full animate-pulse"></div>
          </div>
          <div className="card4 rounded-xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center h-96">
            <p className="text-gray-500 dark:text-gray-400">Content loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Directly render content using the provided data
  return (
    <div className="lg:-mx-5 w-full overflow-hidden rounded">
      <div className="lg:m-4">
        {/*
          Removed the "Refreshing header content..." overlay.
          If there's an article refresh, that loading state should be handled
          by a less blocking UI element elsewhere on the page, or by the
          parent component that triggers the refresh (e.g., a subtle spinner
          within the main article body after the header has rendered).
        */}

        {/* Enhanced Title Section */}
        <div className="mb-8 text-center lg:text-left relative">
          {/*
            Removed all title loading skeletons and associated states.
            The title is now directly rendered from server-fetched `data`.
            The animations below are purely for aesthetic and won't block FCP.
          */}
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-300 md:text-5xl lg:text-6xl transition-all duration-300 hover:scale-[1.02] transform animate-text-shimmer">
            {data.title}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto lg:mx-0 rounded-full animate-gradient-x"></div>
        </div>

        {/* ReadingProgressCircle is a client component, it will hydrate independently */}
        <ReadingProgressCircle />

        {/* Enhanced Image Card */}
        <div className="card4 rounded-xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
          <figure className="relative overflow-hidden">
            <div className="overflow-hidden lg:aspect-[28/16] relative group">
              {/* Actual Image */}
              {/*
                Removed all complex image loading states and skeletons here.
                Next.js Image component handles loading efficiently,
                and placeholder="blur" with blurDataURL ensures a fast visual.
              */}
              <a href={urlForImage(data.mainImage).url()} aria-label={`View full image: ${data.title}`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                <Image
                  className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-110 dark:brightness-90"
                  src={urlForImage(data.mainImage).url()}
                  alt={data.mainImage.alt || `${data.title}`}
                  // layout="responsive" is deprecated in Next.js 13+ in favor of fill or width/height
                  // For a responsive image that maintains aspect ratio, width/height is better.
                  width={1200} // Set appropriate default width based on common max display
                  height={675} // Maintain 28/16 aspect ratio (1200 * 16 / 28 = 685.7, rounded to 675 for common sizes)
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxofwCdABmX/9k="
                  // No need for onLoadingComplete or onError to manage local component state for FCP
                />
              </a>

              {/*
                Removed static placeholder, complex loading indicator, and error states from here.
                Next.js Image handles these internally. If the image fails to load, the `alt` text
                will show, or you can implement a basic `onError` for a visual fallback
                without blocking initial render.
              */}
              {/* Optional: Add a simple overlay if image fails to load via onError */}
               {/* <div className="absolute inset-0 bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400"
                    style={{ display: imageError ? 'flex' : 'none' }}>
                    <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                    Image Load Error
               </div> */}
            </div>

            {/* Image Description */}
            <figcaption className="custom anchor my-4 px-4 text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 py-3 rounded-b-xl transition-all duration-500 opacity-100 translate-y-0">
              <PortableText value={data.mainImage.imageDescription} components={imgdesc} />
            </figcaption>
          </figure>
        </div>
      </div>

      {/* CSS Animations (still relevant for subtle effects once loaded) */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-size: 200% 200%; background-position: left center; }
          50% { background-size: 200% 200%; background-position: right center; }
        }
        @keyframes text-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        /* No need for shimmer-fast, shimmer-reverse, float if no complex skeletons */

        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        .animate-text-shimmer {
          background-size: 200% auto;
          animation: text-shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default BlogHeader;
"use client"; // Added "use client" directive for client-side functionality

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { urlForImage } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";
import ReadingProgressCircle from "@/app/ai-seo/[slug]/ReadingProgressCircle";
import { useInView } from "react-intersection-observer";
const BlogHeader = ({ data, imgdesc }) => {
  // Main image states, similar to OptimizedImage
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [showStaticPlaceholder, setShowStaticPlaceholder] = useState(true);

  const imageRef = useRef(null); // Ref for the Image component
  const { ref, inView } = useInView({
    triggerOnce: true, // Only trigger once when it enters the viewport
    rootMargin: "100px 0px", // Start loading when 100px from viewport
  });

  // Hide static placeholder after an short delay to simulate instant content load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowStaticPlaceholder(false);
    }, 500); // Adjust this delay as needed, e.g., 500ms

    return () => clearTimeout(timer);
  }, []);

  // Enhanced loading progress simulation, only runs when in view and static placeholder is hidden
  useEffect(() => {
    // Only run if in view, static placeholder is hidden, and image is still loading
    if (!inView || showStaticPlaceholder || !isLoading) return;

    let progressInterval;
    progressInterval = setInterval(() => {
      setLoadingProgress((current) => {
        if (current >= 95) { // Stop simulating at 95% to wait for actual image load
          clearInterval(progressInterval);
          return current;
        }
        return current + Math.random() * 15; // Simulate progress
      });
    }, 150); // Update every 150ms

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [inView, isLoading, showStaticPlaceholder]);


  return (
    <div className="lg:-mx-5 w-full overflow-hidden rounded">
      <div className="lg:m-4 ">
        <div className="mb-8 text-center lg:text-left">
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 md:text-5xl lg:text-6xl transition-all duration-300 hover:scale-[1.02] transform">
            {data.title}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto lg:mx-0 rounded-full"></div>
        </div>

        <ReadingProgressCircle />

        <div className="card4 rounded-xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
          <figure className="relative overflow-hidden">
            <div ref={ref} className="overflow-hidden lg:aspect-[28/16] relative group">
              {/* Actual Image component: Always rendered when in view, visibility controlled by opacity */}
              {inView && ( // Only render Image when it's in view
                <a href={urlForImage(data.mainImage).url()} aria-label={`View full image: ${data.title}`}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                  <Image
                    ref={imageRef} // Attach ref to the Image
                    className={`h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-110 dark:brightness-90 ${
                      isLoading ? "opacity-0" : "opacity-100" // Control visibility with opacity
                    }`}
                    src={urlForImage(data.mainImage).url()}
                    alt={data.mainImage.alt || `${data.title}`}
                    layout="responsive"
                    width={500}
                    height={500}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxofwCdABmX/9k="
                    // Removed priority, loading="eager", fetchPriority="high" for controlled loading
                    onLoadingComplete={() => {
                      setLoadingProgress(100); // Ensure progress is 100% on completion
                      setTimeout(() => setIsLoading(false), 200); // Small delay for smooth transition
                    }}
                    onError={() => {
                      setImageError(true);
                      setIsLoading(false); // Stop loading on error
                    }}
                  />
                </a>
              )}

              {/* Conditionally render skeleton or error state on top of the image */}
              {(showStaticPlaceholder || (isLoading && inView && !imageError)) ? (
                // Skeleton for the main image: Shows a pulsing gray box with loading text
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 animate-pulse flex flex-col items-center justify-center rounded-lg">
                  {/* Animated shimmer skeleton */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                       style={{
                         backgroundSize: '200% 100%',
                         animation: 'shimmer 2s infinite linear'
                       }} />

                  {/* Loading icon and circular progress indicator */}
                  <div className="relative mb-4">
                    <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 animate-pulse"
                         fill="currentColor" viewBox="0 0 20 18">
                      <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
                    </svg>

                    <div className="absolute -inset-2">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" stroke="currentColor"
                                strokeWidth="8" fill="none"
                                className="text-gray-200 dark:text-gray-700" />
                        <circle cx="50" cy="50" r="45" stroke="currentColor"
                                strokeWidth="8" fill="none" strokeLinecap="round"
                                className="text-blue-500 transition-all duration-300 ease-out"
                                strokeDasharray={`${loadingProgress * 2.83} 283`} /> {/* Dynamic progress */}
                      </svg>
                    </div>
                  </div>

                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Loading Main Image... {Math.round(loadingProgress)}% {/* Updated text */}
                  </div>
                </div>
              ) : null}

              {/* Error state for the image (displayed when image fails to load and not loading anymore) */}
              {imageError && !isLoading && (
                <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Failed to load main image</p>
                  </div>
                </div>
              )}
            </div>
            <figcaption className="customanchor my-4 px-4 text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 py-3 rounded-b-xl">
              <PortableText value={data.mainImage.imageDescription} components={imgdesc} />
            </figcaption>
          </figure>
        </div>
      </div>
      {/* Tailwind CSS keyframes for shimmer effect and new animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
        @keyframes spin-fast {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .animate-spin-fast {
          animation: spin-fast 1s linear infinite;
        }
        @keyframes pulse-fade {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-fade {
          animation: pulse-fade 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BlogHeader;

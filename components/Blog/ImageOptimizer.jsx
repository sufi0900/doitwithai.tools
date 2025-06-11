"use client"; // This directive is necessary for client-side components in Next.js

import React, { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import Image from "next/image"; // Import the Next.js Image component

const BlogCardImageOptimizer = ({
  src,
  alt,
  width, // Keep width and height for Next.js Image's aspect ratio calculation
  height,
  className = "",
}) => {
  // State to manage loading status of the image
  const [isLoading, setIsLoading] = useState(true);
  // State to simulate loading progress for the animation
  const [loadingProgress, setLoadingProgress] = useState(0);
  // State to track if there was an error loading the image
  const [imageError, setImageError] = useState(false);
  // State to control the display of a static placeholder initially
  const [showStaticPlaceholder, setShowStaticPlaceholder] = useState(true);
const [imageLoaded, setImageLoaded] = useState(false);
const imageRef = useRef(null);
  // useInView hook for lazy loading: image loads only when it enters the viewport
  const { ref, inView } = useInView({
    triggerOnce: true, // Trigger the callback only once when the element enters the viewport
    rootMargin: "100px 0px", // Start loading when the element is 100px from the viewport
  });

  // Static placeholder component with animated shimmer and loading icon/progress
  const StaticPlaceholder = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
      {/* Animated shimmer skeleton effect */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
        style={{
          backgroundSize: "200% 100%",
          animation: "shimmer 2s infinite linear",
        }}
      />

      {/* Loading icon and circular progress indicator */}
      <div className="relative mb-4">
        {/* Image icon */}
        <svg
          className="w-12 h-12 text-gray-300 dark:text-gray-600 animate-pulse"
          fill="currentColor"
          viewBox="0 0 20 18"
        >
          <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
        </svg>

        {/* Circular progress overlay */}
        <div className="absolute -inset-2">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle (static for initial placeholder) */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className="text-blue-500 transition-all duration-300 ease-out"
              strokeDasharray="50 283" // A small segment to indicate activity
            />
          </svg>
        </div>
      </div>

      <div className="absolute bottom-6 text-sm font-medium text-gray-500 dark:text-gray-400">
        Preparing...
      </div>
    </div>
  );

  // Effect to hide the static placeholder after a short delay
  // This gives a quick visual cue before the dynamic loading animation starts
 useEffect(() => {
  // Check if image is likely cached (for same-origin images)
  if (src && typeof window !== 'undefined') {
    const img = new window.Image();
    img.onload = () => {
      setImageLoaded(true);
      setShowStaticPlaceholder(false);
      setIsLoading(false);
    };
    img.onerror = () => {
      setShowStaticPlaceholder(false);
    };
    img.src = src;
    
    // If image loads immediately (cached), it will trigger onload
    // Otherwise, fall back to timer
    const timer = setTimeout(() => {
      if (!imageLoaded) {
        setShowStaticPlaceholder(false);
      }
    }, 300); // Reduced from 500ms for faster response

    return () => {
      clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
    };
  }
}, [src, imageLoaded]);

  // Effect to simulate loading progress when the component is in view
useEffect(() => {
  if (!inView || showStaticPlaceholder || imageLoaded) return;

  let progressInterval;
  progressInterval = setInterval(() => {
    setLoadingProgress((current) => {
      if (current >= 95) {
        clearInterval(progressInterval);
        return current;
      }
      return current + Math.random() * 15;
    });
  }, 150);

  return () => {
    if (progressInterval) clearInterval(progressInterval);
  };
}, [inView, src, showStaticPlaceholder, imageLoaded]);

  // Handle image load completion for Next.js Image
const handleImageLoad = () => {
  setImageLoaded(true);
  setLoadingProgress(100);
  setTimeout(() => setIsLoading(false), imageLoaded ? 0 : 200);
};
useEffect(() => {
  // Reset states when src changes
  setIsLoading(true);
  setImageLoaded(false);
  setLoadingProgress(0);
  setImageError(false);
  setShowStaticPlaceholder(true);
}, [src]);

  // Handle image load error for Next.js Image
  const handleImageError = () => {
    setImageError(true); // Set error state if image fails to load
    setIsLoading(false); // Hide loading state
  };

  return (
    <>
      {/* Main image container with intersection observer ref */}
      <div ref={ref} className="relative w-full h-full overflow-hidden">
        {/* Display static placeholder initially */}
        {showStaticPlaceholder && <StaticPlaceholder />}

        {/* Display dynamic loading state when not static placeholder, loading, in view, and no error */}
        {!showStaticPlaceholder && isLoading && inView && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl flex flex-col items-center justify-center">
            {/* Shimmer effect for dynamic loading */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
              style={{
                backgroundSize: "200% 100%",
                animation: "shimmer 2s infinite linear",
              }}
            />

            {/* Loading icon and circular progress indicator for dynamic loading */}
            <div className="relative mb-4">
              <svg
                className="w-12 h-12 text-gray-300 dark:text-gray-600 animate-pulse"
                fill="currentColor"
                viewBox="0 0 20 18"
              >
                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
              </svg>

              <div className="absolute -inset-2">
                <svg
                  className="w-16 h-16 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    className="text-blue-500 transition-all duration-300 ease-out"
                    strokeDasharray={`${loadingProgress * 2.83} 283`} // Progress based on loadingProgress state
                  />
                </svg>
              </div>
            </div>

            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Loading... {Math.round(loadingProgress)}%
            </div>
          </div>
        )}

        {/* Actual Next.js Image component, loaded when in view and not showing static placeholder */}
        {!showStaticPlaceholder && inView && (
          <div className="relative w-full h-full">
            <Image
              src={src}
              alt={alt}
              fill // Make the image fill its parent container
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Optimize for responsive images
              style={{ objectFit: 'cover' }} // Ensure the image covers the container
              className={`${className} ${
                isLoading ? "opacity-0" : "opacity-100"
              } transition-opacity duration-500 ease-out`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              // Next.js Image handles lazy loading by default, no need for loading="lazy"
            />

            {/* Error state display */}
            {imageError && (
              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Failed to load image
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inline CSS for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        @keyframes pulse-fade {
          0%,
          100% {
            opacity: 0.9;
          }
          50% {
            opacity: 0.7;
          }
        }
        .animate-pulse-fade {
          animation: pulse-fade 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default BlogCardImageOptimizer;

// OptimizedVideo.jsx
import React, { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

const OptimizedVideo = ({ src, alt, caption, className = "", children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const videoRef = useRef(null);
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "50px 0px",
  });

  useEffect(() => {
    if (!inView) return;

    let progressInterval;

    const updateProgress = (progress) => {
      setLoadingProgress((current) =>
        Math.min(100, Math.max(current, progress))
      );
    };

    if ("connection" in navigator) {
      const connection = navigator.connection;
      if (connection.downlink < 5) {
        updateProgress(20);
      }
    }

    progressInterval = setInterval(() => {
      setLoadingProgress((current) =>
        current >= 90 ? 90 : current + Math.random() * 10
      );
    }, 200);

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [inView]);

  return (
    <div ref={ref} className="relative w-full overflow-hidden">
      {isLoading && inView && (
        <>
          <div className="absolute inset-0 bg-gray-300 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
            {/* Video Player Icon */}
            <svg 
              className="w-16 h-16 text-gray-200 dark:text-gray-600" 
              aria-hidden="true" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M4 2.69127C4 1.93067 4.81547 1.44851 5.48192 1.81506L22.4069 11.1238C23.0977 11.5037 23.0977 12.4963 22.4069 12.8762L5.48192 22.1849C4.81546 22.5515 4 22.0693 4 21.3087V2.69127Z" />
              {/* Optional: Add circular border around the play icon */}
              <circle 
                cx="12" 
                cy="12" 
                r="11" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeDasharray="4 4"
                className="animate-spin-slow"
              />
            </svg>
            {/* Loading Text */}
            <div className="absolute bottom-4 text-gray-200 dark:text-gray-600 text-sm font-medium">
              Loading Video...
            </div>
          </div>
          {/* Loading Progress Bar */}
          <div className="absolute top-0 left-0 h-2 bg-gray-200 w-full">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-primary rounded-full animate-pulse"
              style={{
                width: `${loadingProgress}%`,
                transition: "width 0.3s ease-out",
              }}
            />
          </div>
        </>
      )}

      {inView && (
        <div className="relative">
          <video
            ref={videoRef}
            className={`w-full rounded-lg ${className} ${
              isLoading ? "opacity-0" : "opacity-100"
            } transition-opacity duration-300`}
            controls
            preload="metadata"
            onLoadedData={() => {
              setLoadingProgress(100);
              setIsLoading(false);
            }}
          >
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {children}
    </div>
  );
};

export default OptimizedVideo;

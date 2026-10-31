// OptimizedVideo.jsx
import React, { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

const OptimizedVideo = ({ src, alt, caption, className = "", thumbnailUrl, children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);
  
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);
  
  // Enhanced intersection observer with earlier trigger
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "200px 0px", // Start loading 200px before video comes into view
    threshold: 0,
  });

  // Cleanup function
  const cleanup = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Enhanced loading progress simulation
  useEffect(() => {
    if (!inView || hasStartedLoading) return;
    
    setHasStartedLoading(true);
    cleanup();

    // Simulate initial loading progress
    const updateProgress = (progress) => {
      setLoadingProgress((current) => Math.min(90, Math.max(current, progress)));
    };

    // Check network connection for better progress estimation
    if ("connection" in navigator) {
      const connection = navigator.connection;
      const downlink = connection.downlink || 1;
      
      if (downlink < 2) {
        updateProgress(10); // Very slow connection
      } else if (downlink < 5) {
        updateProgress(25); // Slow connection
      } else {
        updateProgress(40); // Good connection
      }
    } else {
      updateProgress(20); // Default for unknown connection
    }

    // Progressive loading simulation
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress((current) => {
        if (current >= 90) return current;
        // Slower progress as it approaches completion
        const increment = current > 70 ? Math.random() * 3 : Math.random() * 8;
        return Math.min(90, current + increment);
      });
    }, 300);

    return cleanup;
  }, [inView, hasStartedLoading]);

  // Video event handlers
  const handleVideoLoad = () => {
    setLoadingProgress(100);
    setTimeout(() => {
      setIsLoading(false);
    }, 200); // Small delay for smooth transition
    cleanup();
  };

  const handleVideoError = () => {
    setVideoError(true);
    setIsLoading(false);
    cleanup();
  };

  const handleVideoLoadStart = () => {
    setLoadingProgress(50); // Jump to 50% when video actually starts loading
  };

  const handleVideoProgress = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          const progress = Math.min(95, 50 + (bufferedEnd / duration) * 45);
          setLoadingProgress(progress);
        }
      }
    }
  };

  // Calculate responsive dimensions
  const getResponsiveClasses = () => {
    return `
      w-full 
      h-auto 
      min-h-[200px] 
      sm:min-h-[250px] 
      md:min-h-[300px] 
      lg:min-h-[350px] 
      xl:min-h-[400px]
      max-h-[80vh]
      object-cover
      ${className}
    `.trim();
  };

  // Loading skeleton with exact video dimensions
  const LoadingSkeleton = () => (
    <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden animate-pulse">
      {/* Maintain aspect ratio container */}
      <div className="aspect-video w-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px] xl:min-h-[400px] max-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900">
        
        {/* Enhanced loading content */}
        <div className="flex flex-col items-center justify-center space-y-4 p-4">
          
          {/* Video player icon with pulse animation */}
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <svg 
                className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 dark:text-blue-400" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            {/* Ripple effect */}
            <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 dark:bg-blue-400 opacity-20 rounded-full animate-ping"></div>
          </div>

          {/* Loading text */}
          <div className="text-center space-y-2">
            <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-300">
              Loading Video...
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {loadingProgress.toFixed(0)}%
            </p>
          </div>

          {/* Enhanced progress bar */}
          <div className="w-full max-w-xs">
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 transition-all duration-300 ease-out rounded-full"
                style={{ 
                  width: `${loadingProgress}%`,
                  transform: `translateX(${loadingProgress < 100 ? '0' : '0'})`,
                }}
              />
            </div>
            
            {/* Connection indicator */}
            {"connection" in navigator && (
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {navigator.connection.downlink < 2 ? 'Slow connection' :
                   navigator.connection.downlink < 5 ? 'Good connection' : 'Fast connection'}
                </span>
                <span>{navigator.connection.effectiveType || 'Unknown'}</span>
              </div>
              )}
          </div>
        </div>

        {/* Shimmer overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full animate-shimmer"></div>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="relative w-full bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 overflow-hidden">
      <div className="aspect-video w-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px] xl:min-h-[400px] max-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4 p-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mx-auto">
            <svg 
              className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 dark:text-red-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm sm:text-base font-medium text-red-600 dark:text-red-400 mb-1">
              Video failed to load
            </p>
            <p className="text-xs sm:text-sm text-red-500 dark:text-red-500">
              Please check your connection and try again
            </p>
          </div>
          <button
            onClick={() => {
              setVideoError(false);
              setIsLoading(true);
              setLoadingProgress(0);
              setHasStartedLoading(false);
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={ref} className="w-full">
      {/* Always show skeleton initially or when loading */}
      {(!hasStartedLoading || (isLoading && !videoError)) && <LoadingSkeleton />}
      
      {/* Show error state */}
      {videoError && <ErrorState />}

      {/* Video element - only render when in view */}
      {hasStartedLoading && !videoError && (
        <div className={`${isLoading ? 'opacity-0 absolute inset-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-500`}>
          <video
            ref={videoRef}
            className={getResponsiveClasses()}
            controls
            preload="metadata" // Changed to metadata for better performance
            onLoadStart={handleVideoLoadStart}
            onCanPlay={handleVideoLoad}
            onError={handleVideoError}
            onProgress={handleVideoProgress}
            onLoadedData={() => setLoadingProgress(85)}
            poster={thumbnailUrl} // Use the new thumbnailUrl prop
            aria-label={caption || alt || "Video content"}
          >
            <source src={src} type="video/mp4" />
            <source src={src} type="video/webm" />
            <source src={src} type="video/ogg" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Children content (caption, etc.) */}
      {children}
    </div>
  );
};

export default OptimizedVideo;
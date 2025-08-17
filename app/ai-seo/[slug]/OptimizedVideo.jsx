/* eslint-disable @next/next/no-img-element */
// OptimizedVideo.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useInView } from "react-intersection-observer";

const OptimizedVideo = ({ 
  src, 
  alt, 
  caption, 
  className = "", 
  children,
  poster, // Optional poster image
  autoPlay = false,
  muted = false,
  loop = false,
  preloadDistance = "200px" // How early to start loading
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [bufferingProgress, setBufferingProgress] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoMetadata, setVideoMetadata] = useState(null);

  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const bufferCheckRef = useRef(null);

  // Enhanced intersection observer with earlier trigger
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: preloadDistance, // Start loading before reaching the video
    threshold: 0.1,
  });

  // Simulate loading progress more realistically
  const updateLoadingProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    let progress = 0;
    const increment = Math.random() * 5 + 2; // 2-7% increments
    
    progressIntervalRef.current = setInterval(() => {
      progress += increment;
      
      // Slow down as we approach completion
      if (progress > 70) {
        progress += Math.random() * 2;
      }
      if (progress > 90) {
        progress = Math.min(95, progress + Math.random() * 0.5);
      }
      
      setLoadingProgress(Math.min(95, progress));
    }, 150);
  }, []);

  // Check buffering status
  const checkBuffering = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const buffered = video.buffered;
    const currentTime = video.currentTime;
    
    if (buffered.length > 0) {
      const bufferEnd = buffered.end(buffered.length - 1);
      const bufferProgress = (bufferEnd / video.duration) * 100;
      setBufferingProgress(bufferProgress);
      
      // Check if we're buffering (current time is close to buffer end)
      const isCurrentlyBuffering = currentTime >= bufferEnd - 0.5;
      setIsBuffering(isCurrentlyBuffering && !video.paused);
    }
  }, []);

  // Start loading when in view
  useEffect(() => {
    if (inView && src && !isLoading && !videoReady && !hasError) {
      setIsLoading(true);
      setLoadingProgress(5); // Start with 5%
      updateLoadingProgress();
    }
  }, [inView, src, isLoading, videoReady, hasError, updateLoadingProgress]);

  // Video event handlers
  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setVideoMetadata({
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      });
    }
  }, []);

  const handleLoadedData = useCallback(() => {
    setLoadingProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setVideoReady(true);
    }, 300); // Small delay for smooth transition
  }, []);

  const handleError = useCallback((e) => {
    console.error('Video loading error:', e);
    setHasError(true);
    setIsLoading(false);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  }, []);

  const handleProgress = useCallback(() => {
    checkBuffering();
  }, [checkBuffering]);

  const handleWaiting = useCallback(() => {
    setIsBuffering(true);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsBuffering(false);
  }, []);

  // Cleanup intervals
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (bufferCheckRef.current) {
        clearInterval(bufferCheckRef.current);
      }
    };
  }, []);

  // Set up buffer checking interval when video is ready
  useEffect(() => {
    if (videoReady && videoRef.current) {
      bufferCheckRef.current = setInterval(checkBuffering, 1000);
      return () => {
        if (bufferCheckRef.current) {
          clearInterval(bufferCheckRef.current);
        }
      };
    }
  }, [videoReady, checkBuffering]);

  // Calculate aspect ratio for responsive container
  const aspectRatio = videoMetadata 
    ? (videoMetadata.videoHeight / videoMetadata.videoWidth) * 100
    : 56.25; // Default to 16:9

  return (
    <div ref={ref} className="relative w-full overflow-hidden group">
      {/* Skeleton/Placeholder - Always show when not in view */}
      {!inView && (
       <div 
    className="w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center animate-pulse"
    // Add the padding-bottom here
    style={{ paddingBottom: `${aspectRatio}%`, position: 'relative' }} 
  >
    <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <svg 
                className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4 mx-auto" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z"/>
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Video will load when visible
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State - Show when loading */}
      {inView && isLoading && !hasError && (
        <div 
          className="w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden"
          style={{ paddingBottom: `${aspectRatio}%` }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Animated Play Icon */}
            <div className="relative mb-4">
              <svg 
                className="w-20 h-20 text-gray-300 dark:text-gray-600" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z"/>
              </svg>
              {/* Spinning loader around play icon */}
              <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700">
                <div 
                  className="rounded-full border-4 border-blue-500 border-r-transparent animate-spin"
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              </div>
            </div>

            {/* Loading Text with Progress */}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Loading Video...
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(loadingProgress)}%
              </p>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${loadingProgress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-shimmer" />
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div 
          className="w-full bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 rounded-lg flex items-center justify-center border-2 border-red-200 dark:border-red-800"
          style={{ paddingBottom: `${aspectRatio}%` }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <svg 
              className="w-16 h-16 text-red-400 mb-4" 
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
            <p className="text-red-600 dark:text-red-400 font-medium mb-2">
              Failed to load video
            </p>
            <button 
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                setVideoReady(false);
                updateLoadingProgress();
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Video Element */}
      {inView && !hasError && (
        <div className="relative">
          {/* Video Container with aspect ratio */}
          <div 
            className="relative w-full overflow-hidden rounded-lg"
            style={{ paddingBottom: `${aspectRatio}%` }}
          >
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                videoReady ? 'opacity-100' : 'opacity-0'
              } ${className}`}
              controls
              preload="metadata"
              poster={poster}
              autoPlay={autoPlay}
              muted={muted}
              loop={loop}
              onLoadStart={handleLoadStart}
              onLoadedMetadata={handleLoadedMetadata}
              onLoadedData={handleLoadedData}
              onError={handleError}
              onProgress={handleProgress}
              onWaiting={handleWaiting}
              onCanPlay={handleCanPlay}
              aria-label={alt}
            >
              <source src={src} type="video/mp4" />
              <source src={src.replace('.mp4', '.webm')} type="video/webm" />
              <p className="text-center text-gray-600 dark:text-gray-400 p-4">
                Your browser does not support the video tag. 
                <a href={src} className="text-blue-500 hover:underline ml-1">
                  Download video
                </a>
              </p>
            </video>

            {/* Buffering Overlay */}
            {videoReady && isBuffering && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2" />
                  <p className="text-white text-sm font-medium">Buffering...</p>
                </div>
              </div>
            )}

            {/* Buffer Progress Indicator (subtle) */}
            {videoReady && bufferingProgress > 0 && bufferingProgress < 100 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/20">
                <div 
                  className="h-full bg-white/60 transition-all duration-300"
                  style={{ width: `${bufferingProgress}%` }}
                />
              </div>
            )}

            {/* Video Quality Badge */}
            {videoMetadata && videoReady && (
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {videoMetadata.videoWidth}x{videoMetadata.videoHeight}
                {videoMetadata.duration && (
                  <span className="ml-2">
                    {Math.floor(videoMetadata.duration / 60)}:
                    {String(Math.floor(videoMetadata.duration % 60)).padStart(2, '0')}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Caption */}
        
        </div>
      )}

      {children}

      {/* Add shimmer animation styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default OptimizedVideo;
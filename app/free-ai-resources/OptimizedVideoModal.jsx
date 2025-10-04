// components/OptimizedVideoModal.js
import React, { useState, useEffect, useRef } from 'react';
import { urlForImage } from "@/sanity/lib/image";

const OptimizedVideoModal = ({ resource, getResourceFileUrl, altText }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };
  }, []);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
    setVideoError(false);
  };

  const handleVideoError = (e) => {
    console.error('Video load error:', e);
    setVideoError(true);
    setVideoLoaded(true);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const getPosterUrl = () => {
    if (resource.mainImage) {
      try {
        return urlForImage(resource.mainImage).width(800).height(450).format('webp').url();
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  if (resource.resourceFormat === 'video' && resource.resourceFile) {
    return (
      <div className="relative rounded-xl overflow-hidden shadow-lg bg-black">
        {/* Loading State */}
        {!videoLoaded && !videoError && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-white text-sm">Loading video...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {videoError && (
          <div className="aspect-video bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-lg font-medium mb-2">Video Unavailable</p>
              <p className="text-sm opacity-75">This video cannot be loaded at the moment</p>
            </div>
          </div>
        )}

        {/* Optimized Video Element */}
        <video
          ref={videoRef}
          src={getResourceFileUrl(resource.resourceFile)}
          controls
          className={`w-full h-auto object-contain max-h-[60vh] ${
            videoLoaded && !videoError ? 'block' : 'hidden'
          }`}
          itemProp="contentUrl"
          preload="metadata" // Only load metadata initially
          poster={getPosterUrl()}
          title={resource.title}
          playsInline
          controlsList="nodownload"
          onLoadedMetadata={handleVideoLoad}
          onError={handleVideoError}
          onPlay={handlePlay}
          onPause={handlePause}
          onLoadStart={() => console.log('Video loading started')}
          // Add these performance optimizations
          onLoadedData={() => console.log('Video data loaded')}
          onCanPlay={() => console.log('Video can start playing')}
          crossOrigin="anonymous" // If needed for CORS
        />

        {/* Video Info Overlay */}
        {videoLoaded && !videoError && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-white text-sm font-medium">
                    {isPlaying ? 'Playing' : 'Paused'}
                  </span>
                </div>
                {resource.videoMetadata?.duration && (
                  <span className="text-white/80 text-sm">
                    {resource.videoMetadata.duration}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Video Quality Badge */}
        {resource.videoMetadata?.resolution && (
          <div className="absolute top-4 right-4">
            <div className="bg-black/80 text-white text-xs px-2 py-1 rounded">
              {resource.videoMetadata.resolution}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
export default OptimizedVideoModal;

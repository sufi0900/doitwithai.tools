// Simplified alternative using next/image with custom enhancements
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

const SimplifiedOptimizedImage = ({ 
  src, 
  alt, 
  className = "",
  showModal = true,
  priority = false 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "50px",
    threshold: 0.1
  });

const handleImageLoad = () => {
  // Small delay to ensure smooth transition
  setTimeout(() => {
    setIsLoading(false);
    setImageLoaded(true);
  }, 50);
};

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  const openModal = () => {
    if (showModal && imageLoaded && !error) {
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // Simple placeholder component

// Enhanced Placeholder component - replace your existing Placeholder
const Placeholder = () => (
  <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
    {/* Enhanced shimmer effect */}
    <div 
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent animate-shimmer"
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 2.5s infinite linear'
      }}
    />
    
    {/* Main loading content */}
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      {/* Circular progress indicator with animated dot */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-4">
        <svg className="w-full h-full absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-gray-200/60 dark:text-gray-700/60"
          />
          
          {/* Animated glowing dot */}
          <circle r="6" fill="url(#enhancedGlow)" className="drop-shadow-lg">
            <animateMotion dur="2.5s" repeatCount="indefinite" rotate="auto">
              <mpath href="#circlePath"/>
            </animateMotion>
          </circle>
          
          {/* Path for the dot to follow */}
          <path id="circlePath" d="M 50, 8 A 42, 42 0 1, 1 49.99, 8" fill="none" stroke="none"/>
          
          {/* Enhanced gradient definition */}
          <defs>
            <radialGradient id="enhancedGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#f8fafc" stopOpacity="1"/>
              <stop offset="20%" stopColor="#3b82f6" stopOpacity="1"/>
              <stop offset="40%" stopColor="#1d4ed8" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.3"/>
            </radialGradient>
          </defs>
        </svg>
        
        {/* Image icon in center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg className="w-8 h-8 text-gray-400/80 dark:text-gray-500/80" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
          </svg>
        </div>
      </div>
      
      {/* Status text */}
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Preparing image...
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-blue-50/90 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50">
          <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></div>
          <span>Loading...</span>
        </div>
      </div>
    </div>
  </div>
);


  // Error component
  const ErrorState = () => (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl aspect-[4/3] flex items-center justify-center">
      <div className="text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-sm text-gray-500">Failed to load image</p>
      </div>
    </div>
  );

useEffect(() => {
  if (modalOpen) {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    // Calculate and apply scrollbar width to prevent content shifting
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  } else {
    // Restore body scroll when modal is closed
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
  
  // Cleanup on unmount
  return () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };
}, [modalOpen]);

  return (
    <>
      <div ref={ref} className="relative w-full">
        {!inView ? (
          <Placeholder />
        ) : error ? (
          <ErrorState />
        ) : (
          <div className="relative group">
            {/* Loading overlay */}
            {isLoading && (
  <div className="absolute inset-0 z-10 transition-opacity duration-300">
                <Placeholder />
              </div>
            )}
            
            {/* Main image */}
            <div 
              className={`relative overflow-hidden rounded-xl ${showModal && imageLoaded ? 'cursor-zoom-in' : ''}`}
              onClick={openModal}
            >
             <Image
  src={src}
  alt={alt}
  className={`${className} transition-opacity duration-500 ease-out ${isLoading ? 'opacity-0' : 'opacity-100'}`}
  width={800}
  height={600}
  quality={90}
  priority={priority}
  onLoad={handleImageLoad}
  onError={handleError}
  loading={priority ? "eager" : "lazy"}
/>
              
              {/* Zoom indicator */}
              {showModal && imageLoaded && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                    Click to zoom
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Simple Modal */}
      {modalOpen && (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6" // Added p-4/p-6 for padding
    onClick={closeModal}
  >
    {/* Modal container with proper sizing and padding */}
    <div 
      className="relative w-full h-full max-w-7xl max-h-full flex items-center justify-center p-4" // Added p-4 here for inner padding
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button - positioned outside image area */}
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 z-20 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white transition-all duration-200 backdrop-blur-sm border border-white/20"
        aria-label="Close modal"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      
      {/* Image container with proper responsive sizing */}
      <div className="relative w-full h-full flex items-center justify-center">
        <Image
          src={src}
          alt={alt}
          // --- MODIFIED CLASSES FOR RESPONSIVENESS AND CENTERING ---
          className="max-w-full max-h-[85vh] md:max-h-[90vh] object-contain rounded-lg shadow-2xl" // Adjusted max-h, object-contain
          // --- END MODIFIED CLASSES ---
          width={1920}
          height={1080}
          quality={100}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
        />
      </div>
      
      {/* Optional: Image info overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10 text-center">
        <div className="inline-block bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-white/20">
          {alt || 'Image'}
        </div>
      </div>
    </div>
  </div>
)}
    </>
  );
};

export default SimplifiedOptimizedImage;
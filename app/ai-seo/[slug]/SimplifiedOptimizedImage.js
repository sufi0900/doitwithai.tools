import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

const SimplifiedOptimizedImage = ({
  src,
  alt,
  className = "",
  showModal = true,
  priority = false,
  // NEW PROPS for enhanced performance
  eager = false,
  blurDataURL,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}) => {
  const [isLoading, setIsLoading] = useState(!eager);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(eager || priority);
  
  // Enhanced intersection observer with better thresholds
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "100px", // Increased for better UX
    threshold: 0.1,
    skip: shouldLoad // Skip if already should load
  });

  // Memoize placeholder to prevent re-renders
  const placeholderComponent = useMemo(() => (
    <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent animate-shimmer" 
           style={{ backgroundSize: '200% 100%', animation: 'shimmer 2.5s infinite linear' }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 text-gray-400/80 dark:text-gray-500/80 mb-2">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
          </svg>
        </div>
        <div className="text-xs text-gray-500">Loading image...</div>
      </div>
    </div>
  ), []);

  // Enhanced error state
  const errorComponent = useMemo(() => (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl aspect-[4/3] flex items-center justify-center">
      <div className="text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <p className="text-sm text-gray-500">Failed to load image</p>
      </div>
    </div>
  ), []);

  // Effect to handle loading state based on viewport
  useEffect(() => {
    if (inView && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [inView, shouldLoad]);

  const handleImageLoad = () => {
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

  // Enhanced modal effect
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [modalOpen]);

  return (
    <>
      <div ref={ref} className="relative w-full">
        {/* Show placeholder until should load */}
        {!shouldLoad ? (
          placeholderComponent
        ) : error ? (
          errorComponent
        ) : (
          <div className="relative group">
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-10 transition-opacity duration-300">
                {placeholderComponent}
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
                sizes={sizes}
                placeholder={blurDataURL ? "blur" : "empty"}
                blurDataURL={blurDataURL}
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

      {/* Modal remains the same */}
      {modalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6"
          onClick={closeModal}
        >
          <div 
            className="relative w-full h-full max-w-7xl max-h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white transition-all duration-200 backdrop-blur-sm border border-white/20"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={src}
                alt={alt}
                className="max-w-full max-h-[85vh] md:max-h-[90vh] object-contain rounded-lg shadow-2xl"
                width={1920}
                height={1080}
                quality={100}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
              />
            </div>
            
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
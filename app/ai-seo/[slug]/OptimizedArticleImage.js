import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

// Image cache utility - add this BEFORE the OptimizedImage component
const ImageCache = {
  cache: new Map(),
  getCacheKey: (src) => {
    return btoa(src).replace(/[^a-zA-Z0-9]/g, "").substring(0, 32);
  },
  has: (src) => {
    const key = ImageCache.getCacheKey(src);
    const cached = ImageCache.cache.get(key);
    if (!cached) return false;
    const now = Date.now();
    const cacheAge = now - cached.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (cacheAge > maxAge) {
      ImageCache.cache.delete(key);
      return false;
    }
    return true;
  },
  get: (src) => {
    const key = ImageCache.getCacheKey(src);
    return ImageCache.cache.get(key);
  },
  set: (src, imageData) => {
    const key = ImageCache.getCacheKey(src);
    ImageCache.cache.set(key, { ...imageData, timestamp: Date.now() });
    if (ImageCache.cache.size > 50) {
      const firstKey = ImageCache.cache.keys().next().value;
      ImageCache.cache.delete(firstKey);
    }
  },
  preload: (src) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          ImageCache.set(src, { dataUrl, width: img.naturalWidth, height: img.naturalHeight, loaded: true });
          resolve(dataUrl);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = reject;
      img.src = src;
    });
  }
};

const OptimizedImage = ({ src, alt, className = "", children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [showStaticPlaceholder, setShowStaticPlaceholder] = useState(true);
  const [isCachedImage, setIsCachedImage] = useState(false); // Only for internal image cache status

  const imageRef = useRef(null);
  const modalRef = useRef(null); // Assuming modal functionality is still there

  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "100px 0px",
  });

  // Helper function to clamp a value
  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  // Static placeholder component (simplified)
  const StaticPlaceholder = () => (
    <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden">
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Preparing...
        </span>
      </div>
    </div>
  );

  // Effect to handle image loading once in view
  useEffect(() => {
    if (!inView || !src) {
      return;
    }

    const loadImage = async () => {
      setIsLoading(true);
      setImageError(false);
      setShowStaticPlaceholder(true); // Always show placeholder initially

      if (ImageCache.has(src)) {
        setIsCachedImage(true);
        // If cached, show placeholder briefly then transition quickly
        setTimeout(() => {
          setShowStaticPlaceholder(false);
          setIsLoading(false);
          setLoadingProgress(100);
        }, 100); // Very quick transition for cached images
      } else {
        setIsCachedImage(false);
        try {
          // Attempt to preload and cache
          await ImageCache.preload(src);
          // If successful, transition after a slight delay
          setTimeout(() => {
            setShowStaticPlaceholder(false);
            setIsLoading(false);
            setLoadingProgress(100);
          }, 300); // Slightly longer for fresh images
        } catch (error) {
          console.error("Error preloading image:", error);
          setImageError(true);
          setIsLoading(false);
          setShowStaticPlaceholder(false); // Hide placeholder on error
        }
      }
    };

    loadImage();

  }, [inView, src]); // Dependency on inView and src

  // Loading progress simulation for fresh images
  useEffect(() => {
    let progressInterval;
    if (isLoading && !isCachedImage && inView) { // Only simulate for fresh, loading images
      progressInterval = setInterval(() => {
        setLoadingProgress((current) => {
          if (current >= 95) return current;
          return clamp(current + Math.random() * 15, 0, 95); // Don't reach 100 until fully loaded
        });
      }, 150);
    } else {
      setLoadingProgress(100); // Reset or set to 100 when not loading or is cached
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isLoading, isCachedImage, inView]);


  // Functions for modal (keep your existing logic)
  const openModal = () => { /* ... your existing logic ... */ };
  const closeModal = () => { /* ... your existing logic ... */ };
  // ... other modal related functions (resetZoomAndPan, handleEscapeKey etc.)

  return (
    <>
      <div ref={ref} className="relative w-full overflow-hidden">
        {showStaticPlaceholder && <StaticPlaceholder />}

        {!showStaticPlaceholder && isLoading && inView && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="relative mb-4">
                {isCachedImage ? (
                  <div className="bg-green-500 text-white rounded-full p-1 animate-pulse"></div>
                ) : (
                  <div className="bg-blue-500 text-white rounded-full p-1 animate-pulse"></div>
                )}
                <div className="absolute -inset-2"></div>
              </div>
              <div className="text-center">
                {isCachedImage ? 'Loading from cache...' : `Loading...${Math.round(loadingProgress)}%`}
              </div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${isCachedImage ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                {isCachedImage ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>Cached
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>Fresh • {Math.round(loadingProgress)}%
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {!showStaticPlaceholder && inView && (
          <div  className={`cursor-zoom-in relative ${imageError ? 'pointer-events-none' : ''}`}>
            <Image
              ref={imageRef}
              src={src}
              alt={alt}
              className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-all duration-500 ease-out`}
              onLoad={() => {
                // Image has genuinely loaded
                setIsLoading(false);
                setLoadingProgress(100);
              }}
              onError={() => {
                setImageError(true);
                setIsLoading(false);
              }}
              layout="responsive"
              width={800}
              height={600}
              quality={90}
              loading="lazy"
              // placeholder="blur" // Only if you have a blurDataURL ready
            />
            {imageError && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Failed to load image</p>
            )}
          </div>
        )}
        {children}
      </div>

      {/* Modal (keeping your existing modal code) */}
      {/* ... your existing modal JSX ... */}
    </>
  );
};

export default OptimizedImage;
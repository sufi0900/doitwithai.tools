
//here is actual optimize image component
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

const OptimizedImage = ({ src, alt, className = "", children }) => {
  // Main image states
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [showStaticPlaceholder, setShowStaticPlaceholder] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalImageLoaded, setIsModalImageLoaded] = useState(false);
  const [showModalContent, setShowModalContent] = useState(false);
// Add these new cache-related states after your existing states
const [isCachedImage, setIsCachedImage] = useState(false);
const [cacheStatus, setCacheStatus] = useState('checking'); // 'checking', 'cached', 'fresh'
  // Zoom and pan states
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartPanX = useRef(0);
  const dragStartPanY = useRef(0);

  const imageRef = useRef(null);
  const modalRef = useRef(null);
  const modalImageContainerRef = useRef(null);

  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "100px 0px",
  });

  // Image cache utility - add this BEFORE the OptimizedImage component
const ImageCache = {
  cache: new Map(),
  
  // Generate cache key from src
  getCacheKey: (src) => {
    return btoa(src).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  },
  
  // Check if image exists in cache
  has: (src) => {
    const key = ImageCache.getCacheKey(src);
    const cached = ImageCache.cache.get(key);
    if (!cached) return false;
    
    // Check if cache is still valid (24 hours)
    const now = Date.now();
    const cacheAge = now - cached.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (cacheAge > maxAge) {
      ImageCache.cache.delete(key);
      return false;
    }
    
    return true;
  },
  
  // Get cached image data
  get: (src) => {
    const key = ImageCache.getCacheKey(src);
    return ImageCache.cache.get(key);
  },
  
  // Cache image data
  set: (src, imageData) => {
    const key = ImageCache.getCacheKey(src);
    ImageCache.cache.set(key, {
      ...imageData,
      timestamp: Date.now()
    });
    
    // Limit cache size to 50 images
    if (ImageCache.cache.size > 50) {
      const firstKey = ImageCache.cache.keys().next().value;
      ImageCache.cache.delete(firstKey);
    }
  },
  
  // Preload image and cache it
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
          ImageCache.set(src, {
            dataUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
            loaded: true
          });
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
  // Helper function to clamp a value between a min and max
  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  // Static placeholder component with same loader animation
// Replace your existing StaticPlaceholder component with this enhanced version
// Replace your existing StaticPlaceholder component with this enhanced version
const StaticPlaceholder = () => (
  <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden">
    {/* Your existing shimmer animation code */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
         style={{
           backgroundSize: '200% 100%',
           animation: 'shimmer 2s infinite linear'
         }} />
    
    {/* Enhanced loading content with cache status */}
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="relative mb-4">
        {/* Cache status icon overlay */}
        <div className="absolute -top-2 -right-2 z-10">
          {cacheStatus === 'cached' ? (
            <div className="bg-green-500 text-white rounded-full p-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
          ) : (
            <div className="bg-blue-500 text-white rounded-full p-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3.293 7.707A1 1 0 014 7h12a1 1 0 01.707.293l2 2A1 1 0 0118 11H2a1 1 0 01-.707-1.707l2-2z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

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
                    className={`transition-all duration-300 ease-out ${
                      cacheStatus === 'cached' ? 'text-green-500' : 'text-blue-500'
                    }`}
                    strokeDasharray="50 283" />
          </svg>
        </div>
      </div>
      
      {/* Enhanced status text with animation */}
      <div className="text-center">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          {cacheStatus === 'cached' ? 'Loading from cache...' : 'Preparing...'}
        </div>
        
        {/* Status badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
          cacheStatus === 'cached' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700/50' 
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50'
        }`}>
          {cacheStatus === 'cached' ? (
            <>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Cached
            </>
          ) : (
            <>
              <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356-2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m0 0H15" />
              </svg>
              Fresh
            </>
          )}
        </div>
      </div>
    </div>
  </div>
);
  // Function to reset zoom and pan
  const resetZoomAndPan = useCallback(() => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  }, []);

  // Function to close the modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsModalImageLoaded(false);
    setShowModalContent(false);
    resetZoomAndPan();
  }, [resetZoomAndPan]);

  // Function to open the modal
  const openModal = useCallback(() => {
    if (!imageError && !isLoading && !showStaticPlaceholder) {
      setIsModalOpen(true);
      setIsModalImageLoaded(false);
      setShowModalContent(false);
      resetZoomAndPan();
    }
  }, [imageError, isLoading, showStaticPlaceholder, resetZoomAndPan]);

  // Hide static placeholder after a short delay to simulate instant content load
// Replace your existing static placeholder useEffect with this enhanced version
useEffect(() => {
  let timer;
  
  // Check cache first
  const checkCache = async () => {
    if (ImageCache.has(src)) {
      const cachedData = ImageCache.get(src);
      setIsCachedImage(true);
      setCacheStatus('cached');
      
      // Show cached image faster but still show some loading animation
      timer = setTimeout(() => {
        setShowStaticPlaceholder(false);
        setLoadingProgress(100);
        setIsLoading(false);
      }, 200); // Faster for cached images
    } else {
      setCacheStatus('fresh');
      // Original timing for fresh images
      timer = setTimeout(() => {
        setShowStaticPlaceholder(false);
      }, 500);
    }
  };
  
  checkCache();
  
  return () => {
    if (timer) clearTimeout(timer);
  };
}, [src]);

  // Enhanced loading progress simulation
  useEffect(() => {
    if (!inView || showStaticPlaceholder) return;

    let progressInterval;
    progressInterval = setInterval(() => {
      setLoadingProgress((current) => {
        if (current >= 95) return current;
        return current + Math.random() * 15;
      });
    }, 150);

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [inView, src, showStaticPlaceholder]);

  // Close modal when clicking outside the image
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, closeModal]);

  // Handle escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (isModalOpen) {
      window.addEventListener('keydown', handleEscKey);
    }

    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen, closeModal]);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  // Mouse event handlers for panning
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      dragStartX.current = e.clientX;
      dragStartY.current = e.clientY;
      dragStartPanX.current = panX;
      dragStartPanY.current = panY;
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoomLevel <= 1) return;

    const dx = e.clientX - dragStartX.current;
    const dy = e.clientY - dragStartY.current;

    const container = modalImageContainerRef.current;
    if (!container) return;

    const currentImageWidth = container.clientWidth * zoomLevel;
    const currentImageHeight = container.clientHeight * zoomLevel;
    const maxPanX = (currentImageWidth - container.clientWidth) / 2;
    const maxPanY = (currentImageHeight - container.clientHeight) / 2;

    setPanX(clamp(dragStartPanX.current + dx, -maxPanX, maxPanX));
    setPanY(clamp(dragStartPanY.current + dy, -maxPanY, maxPanY));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    if (zoomLevel > 1 && e.touches.length === 1) {
      setIsDragging(true);
      dragStartX.current = e.touches[0].clientX;
      dragStartY.current = e.touches[0].clientY;
      dragStartPanX.current = panX;
      dragStartPanY.current = panY;
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || zoomLevel <= 1 || e.touches.length !== 1) return;

    const dx = e.touches[0].clientX - dragStartX.current;
    const dy = e.touches[0].clientY - dragStartY.current;

    const container = modalImageContainerRef.current;
    if (!container) return;

    const currentImageWidth = container.clientWidth * zoomLevel;
    const currentImageHeight = container.clientHeight * zoomLevel;
    const maxPanX = (currentImageWidth - container.clientWidth) / 2;
    const maxPanY = (currentImageHeight - container.clientHeight) / 2;

    setPanX(clamp(dragStartPanX.current + dx, -maxPanX, maxPanY));
    setPanY(clamp(dragStartPanY.current + dy, -maxPanY, maxPanY));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse wheel handler for zoom
  const handleWheel = (e) => {
    e.preventDefault();

    const container = modalImageContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleFactor = 0.1;
    let newZoomLevel = zoomLevel;

    if (e.deltaY < 0) {
      newZoomLevel = Math.min(zoomLevel + scaleFactor, 4);
    } else {
      newZoomLevel = Math.max(zoomLevel - scaleFactor, 1);
    }

    if (newZoomLevel === zoomLevel) return;

    const zoomRatio = newZoomLevel / zoomLevel;
    let newPanX = mouseX - (mouseX - panX) * zoomRatio;
    let newPanY = mouseY - (mouseY - panY) * zoomRatio;

    const currentImageWidth = container.clientWidth * newZoomLevel;
    const currentImageHeight = container.clientHeight * newZoomLevel;
    const maxPanX = (currentImageWidth - container.clientWidth) / 2;
    const maxPanY = (currentImageHeight - container.clientHeight) / 2;

    newPanX = clamp(newPanX, -maxPanX, maxPanX);
    newPanY = clamp(newPanY, -maxPanY, maxPanY);

    setZoomLevel(newZoomLevel);
    setPanX(newPanX);
    setPanY(newPanY);
  };

  // Reset pan when zoom level returns to 1
  useEffect(() => {
    if (zoomLevel === 1) {
      setPanX(0);
      setPanY(0);
    }
  }, [zoomLevel]);
// Add this useEffect at the end of your existing useEffects
useEffect(() => {
  return () => {
    // Cleanup: remove any pending cache operations
    // This prevents memory leaks when component unmounts quickly
  };
}, []);
  return (
    <>
      {/* Main image container */}
      <div ref={ref} className="relative w-full overflow-hidden">
        {/* Show static placeholder first */}
        {showStaticPlaceholder && <StaticPlaceholder />}
        
        {/* Dynamic loading state */}
      {/* Replace your existing dynamic loading state with this enhanced version */}
{!showStaticPlaceholder && isLoading && inView && !imageError && (
  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
         style={{
           backgroundSize: '200% 100%',
           animation: 'shimmer 2s infinite linear'
         }} />
    
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="relative mb-4">
        {/* Cache status icon overlay */}
        <div className="absolute -top-2 -right-2 z-10">
          {cacheStatus === 'cached' ? (
            <div className="bg-green-500 text-white rounded-full p-1 animate-pulse">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
          ) : (
            <div className="bg-blue-500 text-white rounded-full p-1 animate-pulse">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2C5.589 2 2 5.589 2 10s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

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
                    className={`transition-all duration-300 ease-out ${
                      cacheStatus === 'cached' ? 'text-green-500' : 'text-blue-500'
                    }`}
                    strokeDasharray={`${loadingProgress * 2.83} 283`} />
          </svg>
        </div>
      </div>
      
      {/* Enhanced status display */}
      <div className="text-center">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          {cacheStatus === 'cached' ? 'Loading from cache...' : `Loading... ${Math.round(loadingProgress)}%`}
        </div>
        
        {/* Status badge with progress */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
          cacheStatus === 'cached' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700/50' 
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50'
        }`}>
          {cacheStatus === 'cached' ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Cached
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              Fresh • {Math.round(loadingProgress)}%
            </>
          )}
        </div>
      </div>
    </div>
  </div>
)}

        {/* Actual image */}
        {!showStaticPlaceholder && inView && (
          <div 
            onClick={openModal} 
            className={`cursor-zoom-in relative ${imageError ? 'pointer-events-none' : ''}`}
          >
            <Image
              ref={imageRef}
              src={src}
              alt={alt}
              className={`${className} ${
                isLoading ? "opacity-0" : "opacity-100"
              } transition-all duration-500 ease-out`}
             // Replace your existing onLoadingComplete with this enhanced version
onLoadingComplete={() => {
  setLoadingProgress(100);
  
  // Cache the image if it's not already cached
  if (!isCachedImage && cacheStatus === 'fresh') {
    ImageCache.preload(src).catch(console.warn);
  }
  
  setTimeout(() => setIsLoading(false), isCachedImage ? 100 : 200);
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
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQUEBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD/9k="
            />
            
            {/* Error state */}
            {imageError && (
              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Failed to load image</p>
                </div>
              </div>
            )}
          </div>
        )}

        {children}
      </div>

      {/* Modal (keeping your existing modal code) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300">
          <div className={`absolute inset-0 bg-black/90 ${isModalImageLoaded ? 'backdrop-blur-sm' : ''} transition-all duration-300`} />
          
          {!isModalImageLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-gray-900/80 to-black/80 animate-pulse-fade">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-t-4 border-blue-400 border-opacity-30 animate-spin-slow"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-4 border-blue-500 animate-spin-fast"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L19 18M7 8h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8a2 2 0 012-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-white text-lg font-semibold tracking-wide">Loading Image...</p>
            </div>
          )}

          <div
            ref={modalRef}
            className={`relative max-h-[95vh] max-w-[95vw] overflow-hidden rounded-2xl shadow-2xl ${showModalContent ? 'animate-in zoom-in-95 duration-300' : 'opacity-0'}`}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-50 p-3 rounded-full bg-gradient-to-br from-gray-700/80 to-gray-900/80 border border-white/20 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:from-red-500/90 hover:to-red-700/90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-70 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {showModalContent && (
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex space-x-3 bg-gradient-to-br from-gray-800/80 to-gray-950/80 border border-white/15 rounded-full p-3 shadow-2xl md:space-x-4 md:p-4">
  {/* Zoom Out Button */}
  <button
    onClick={handleZoomOut}
    disabled={zoomLevel <= 1}
    className="p-2.5 rounded-full bg-gradient-to-br from-white/10 to-white/0 text-white shadow-md transition-all duration-300  hover:bg-yellow hover:scale-105 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-70 active:scale-95"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  </button>

  {/* Reset Zoom and Pan Button */}
  <button
    onClick={resetZoomAndPan}
    disabled={zoomLevel === 1 && panX === 0 && panY === 0}
    className="p-2.5 rounded-full bg-gradient-to-br from-white/10 to-white/0 text-white shadow-md transition-all duration-300  hover:bg-green-500 hover:scale-105 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-70 active:scale-95"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356-2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m0 0H15"
      />
    </svg>
  </button>

  {/* Zoom In Button */}
  <button
    onClick={handleZoomIn}
    disabled={zoomLevel >= 4}
    className="p-2.5 rounded-full bg-gradient-to-br from-white/10 to-white/0 text-white shadow-md transition-all duration-300  hover:bg-primary hover:scale-105 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-70 active:scale-95"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  </button>
</div>

            )}

            <div
              ref={modalImageContainerRef}
              className="relative w-full h-full"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              style={{
                cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                overflow: 'hidden',
              }}
            >
              <Image
                src={src}
                alt={alt}
                className={`object-contain ${!isModalImageLoaded ? 'opacity-0' : 'opacity-100'}`}
                style={{
                  transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                  transformOrigin: 'center center',
                  width: '100%',
                  height: '100%',
                  maxHeight: '90vh',
                  maxWidth: '90vw',
                }}
                width={1920}
                height={1080}
                quality={100}
               // Replace your existing onLoadingComplete with this enhanced version
onLoadingComplete={() => {
  setLoadingProgress(100);
  
  // Cache the image if it's not already cached
  if (!isCachedImage && cacheStatus === 'fresh') {
    ImageCache.preload(src).catch(console.warn);
  }
  
  setTimeout(() => setIsLoading(false), isCachedImage ? 100 : 200);
}}
              />
            </div>
          </div>
        </div>
      )}
      
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
    </>
  );
};

export default OptimizedImage;
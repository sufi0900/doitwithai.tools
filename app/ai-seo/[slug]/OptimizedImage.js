import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

const OptimizedImage = ({
  src,
  alt,
  className = "",
  children,
  showStaticPlaceholder = false
}) => {
  // Main image states  
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const stableInViewRef = useRef(false);
  const mountedRef = useRef(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalImageLoaded, setIsModalImageLoaded] = useState(false);
  const [showModalContent, setShowModalContent] = useState(false);
  const [modalImageError, setModalImageError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [estimatedHeight, setEstimatedHeight] = useState(400);
  const [shouldPreserveSpace, setShouldPreserveSpace] = useState(false);
  // 1. Add shimmer control state
const [shimmerActive, setShimmerActive] = useState(false);

// 2. Stabilize shimmer activation with useRef to prevent rapid re-triggers
const shimmerTimeoutRef = useRef(null);
const hasShimmerStarted = useRef(false);

  // FIX: Added missing const
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartPanX = useRef(0);
  const dragStartPanY = useRef(0);
  const imageRef = useRef(null);
  const modalRef = useRef(null);
  const modalImageContainerRef = useRef(null);

  // FIX: Correct handler for main image loading
  const handleImageLoadWithRetry = useCallback(() => {
    if (!mountedRef.current) return;
    setLoadingProgress(100);
    setTimeout(() => {
      if (mountedRef.current) {
        setIsLoading(false);
        setHasLoadedOnce(true);
      }
    }, 100);
  }, []);

  const handleImageError = useCallback(() => {
    if (!mountedRef.current) return;
    setImageError(true);
    setIsLoading(false);
  }, []);

  // FIX: Separate handler for modal image loading
  const handleModalImageLoad = useCallback(() => {
    if (!mountedRef.current) return;
    setIsModalImageLoaded(true);
    setTimeout(() => {
      if (mountedRef.current) {
        setShowModalContent(true);
      }
    }, 100);
  }, []);

  const handleModalImageError = useCallback(() => {
    if (mountedRef.current) {
      setModalImageError(true);
      setIsModalImageLoaded(false);
    }
  }, []);

  // FIX: Improved intersection observer setup
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "300px 0px",
    threshold: 0.05,
    skip: !mountedRef.current // Skip if component is unmounted
  });

  // Debounce utility
  const useDebounceCallback = (callback, delay) => {
    const timeoutRef = useRef();
    
    return useCallback((...args) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          callback(...args);
        }
      }, delay);
    }, [callback, delay]);
  };

  // Helper function to clamp a value between a min and max
  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  const StaticPlaceholder = () => (
    <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent animate-shimmer" />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="relative flex items-center justify-center mb-6 sm:mb-8">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28">
            <svg className="w-full h-full absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-gray-200/60 dark:text-gray-700/60"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                className="text-blue-500 dark:text-blue-400 transition-all duration-700 ease-out"
                strokeDasharray="263.9"
                strokeDashoffset="131.95"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400/80 dark:text-gray-500/80" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        <div className="text-center space-y-3 sm:space-y-4 max-w-xs sm:max-w-sm">
          <div className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200 tracking-wide">
            Loading image...
          </div>
          <div className="inline-flex items-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-500 shadow-lg backdrop-blur-sm border-2 bg-blue-50/90 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-700/50 shadow-blue-200/50 dark:shadow-blue-900/30">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse shadow-lg shadow-blue-500/50"></div>
            <span className="font-semibold tracking-wide">Loading</span>
          </div>
        </div>
      </div>
    </div>
  );

  const DynamicLoadingState = () => (
    !showPlaceholder && isLoading && inView && !imageError && !hasLoadedOnce && (
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="relative mb-4">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 animate-pulse" fill="currentColor" viewBox="0 0 20 18">
              <path d="M18 0H2a2 2 0 00-2 2v14a2 2 0 002 2h16a2 2 0 002-2V2a2 2 0 00-2-2Zm-5.5 4a1.5 1.5 0 11 3 0 1.5 1.5 0 01-3 0Zm4.376 10.481A1 1 0 0116 15H4a1 1 0 01-.895-1.447l3.5-7A1 1 0 017.468 6a.965.965 0 01.9.5l2.775 4.757 1.546-1.887a1 1 0 011.618.1l2.541 4a1 1 0 01.028 1.011Z" />
            </svg>
            <div className="absolute -inset-2">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
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
                  strokeDasharray={`${loadingProgress * 2.83} 283`}
                />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Loading... {Math.round(loadingProgress)}%
            </div>
          </div>
        </div>
      </div>
    )
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
    setModalImageError(false);
    resetZoomAndPan();
  }, [resetZoomAndPan]);

  // Function to open the modal
  const openModal = useCallback(() => {
    if (!imageError && !isLoading && !showPlaceholder && hasLoadedOnce) {
      setIsModalOpen(true);
      setIsModalImageLoaded(false);
      setShowModalContent(false);
      setModalImageError(false);
      resetZoomAndPan();
    }
  }, [imageError, isLoading, showPlaceholder, hasLoadedOnce, resetZoomAndPan]);

  // FIX: Improved component lifecycle management
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (inView && !stableInViewRef.current) {
      stableInViewRef.current = true;
    }
  }, [inView]);



useEffect(() => {
  if (!inView || !mountedRef.current) return;
  
  // Clear any existing timeout
  if (shimmerTimeoutRef.current) {
    clearTimeout(shimmerTimeoutRef.current);
  }
  
  if (showStaticPlaceholder && !hasShimmerStarted.current) {
    hasShimmerStarted.current = true;
    setShimmerActive(true);
    
    shimmerTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setShowPlaceholder(false);
        setShimmerActive(false);
        hasShimmerStarted.current = false;
      }
    }, 500);
  } else if (!showStaticPlaceholder && !hasShimmerStarted.current) {
    setShowPlaceholder(false);
    setShimmerActive(false);
  }
  
  return () => {
    if (shimmerTimeoutRef.current) {
      clearTimeout(shimmerTimeoutRef.current);
    }
  };
}, [inView, showStaticPlaceholder]);
  
useEffect(() => {
  if (!inView || showPlaceholder || hasLoadedOnce || imageError || !mountedRef.current) return;
  
  let progressInterval;
  let startTime = performance.now();
  let hasCompleted = false; // Add this flag to prevent restart
  
  const updateProgress = () => {
    if (!mountedRef.current || hasCompleted) return;
    
    const elapsed = performance.now() - startTime;
    const targetTime = 1000;
    const baseProgress = Math.min((elapsed / targetTime) * 100, 95);
    
    setLoadingProgress(prev => {
      const newProgress = Math.min(prev + 5, baseProgress);
      if (newProgress >= 95) {
        hasCompleted = true; // Set flag when complete
      }
      return newProgress;
    });
  };

  progressInterval = setInterval(updateProgress, 100);
  
  return () => {
    hasCompleted = true; // Cleanup flag
    if (progressInterval) clearInterval(progressInterval);
  };
}, [inView, showPlaceholder, hasLoadedOnce, imageError]); // Remove dependencies that might cause restart


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

  const debouncedHandleMouseMove = useDebounceCallback((e) => {
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
  }, 50);

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

  const debouncedHandleTouchMove = useDebounceCallback((e) => {
    if (!isDragging || zoomLevel <= 1 || e.touches.length !== 1) return;

    const dx = e.touches[0].clientX - dragStartX.current;
    const dy = e.touches[0].clientY - dragStartY.current;
    const container = modalImageContainerRef.current;
    if (!container) return;

    const currentImageWidth = container.clientWidth * zoomLevel;
    const currentImageHeight = container.clientHeight * zoomLevel;
    const maxPanX = (currentImageWidth - container.clientWidth) / 2;
    const maxPanY = (currentImageHeight - container.clientHeight) / 2;

    setPanX(clamp(dragStartPanX.current + dx, -maxPanX, maxPanX));
    setPanY(clamp(dragStartPanY.current + dy, -maxPanY, maxPanY));
  }, 50);

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

  // Session storage for scroll position
  useEffect(() => {
    const handleBeforeUnload = () => {
      const scrollY = window.scrollY;
      const imageElements = document.querySelectorAll('[data-optimized-image]');
      const imagePositions = Array.from(imageElements).map(el => ({
        src: el.dataset.src,
        offsetTop: el.offsetTop,
        height: el.offsetHeight
      }));
      sessionStorage.setItem('scrollPosition', scrollY.toString());
      sessionStorage.setItem('imagePositions', JSON.stringify(imagePositions));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Restore scroll position
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedScrollPosition = sessionStorage.getItem('scrollPosition');
      const savedImagePositions = sessionStorage.getItem('imagePositions');
      
      if (savedScrollPosition && savedImagePositions) {
        const positions = JSON.parse(savedImagePositions);
        const currentImagePosition = positions.find(pos => pos.src === src);
        
        if (currentImagePosition) {
          setEstimatedHeight(currentImagePosition.height || 400);
          setShouldPreserveSpace(true);
          
          setTimeout(() => {
            window.scrollTo(0, parseInt(savedScrollPosition));
            sessionStorage.removeItem('scrollPosition');
            sessionStorage.removeItem('imagePositions');
          }, 100);
        }
      }
    }
  }, [src]);

  return (
    <>
      <div
        ref={ref}
        className="relative w-full overflow-hidden"
        data-optimized-image
        data-src={src}
      >
        {showStaticPlaceholder && showPlaceholder && !hasLoadedOnce && (
          <StaticPlaceholder />
        )}
        
        <DynamicLoadingState />
        
        {(!showPlaceholder || hasLoadedOnce) && (inView || stableInViewRef.current) && (
          <div
            onClick={openModal}
            className={`cursor-zoom-in relative ${imageError ? 'pointer-events-none' : ''}`}
          >
            <Image
              ref={imageRef}
              src={src}
              alt={alt}
              className={`${className} ${
                (isLoading && !hasLoadedOnce) ? "opacity-0" : "opacity-100"
              } transition-all duration-500 ease-out`}
              onLoadingComplete={handleImageLoadWithRetry} // FIX: Correct handler
              onError={handleImageError}
              layout="responsive"
              width={800}
              height={600}
              quality={90}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQUEBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD/9k="
            />
            
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300">
          <div className={`absolute inset-0 bg-black/90 ${isModalImageLoaded ? 'backdrop-blur-sm' : ''} transition-all duration-300`} />
          
          {!isModalImageLoaded && !modalImageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-gray-900/80 to-black/80 animate-pulse-fade">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-t-4 border-blue-400 border-opacity-30 animate-spin-slow"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-4 border-blue-500 animate-spin-fast"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-white text-lg font-semibold tracking-wide">Loading Image...</p>
            </div>
          )}

          {modalImageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-red-900/80 to-black/80">
              <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-white text-lg font-semibold">Failed to load image</p>
            </div>
          )}

          <div
            ref={modalRef}
            className={`relative max-h-[95vh] max-w-[95vw] overflow-hidden rounded-2xl shadow-2xl ${
              showModalContent ? 'animate-in zoom-in-95 duration-300' : 'opacity-0'
            }`}
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
              onMouseMove={debouncedHandleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={debouncedHandleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              style={{
                cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                overflow: 'hidden',
              }}
            >
            <Image
  ref={imageRef}
  src={src}
  alt={alt}
  className={`${className} ${(isLoading && !hasLoadedOnce) ? "opacity-0" : "opacity-100"} transition-all duration-500 ease-out`}
  onLoadingComplete={handleImageLoadWithRetry} // Remove the extra ()
  onError={handleImageError}
  layout="responsive"
  width={800}
  height={600}
  quality={90}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQUEBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD/9k="
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
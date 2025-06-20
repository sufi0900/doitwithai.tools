
//here is actual optimize image component
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

const OptimizedImage = ({ src, alt, className = "", children, showStaticPlaceholder = false }) => {
  // Main image states
const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false); // NEW: Track if image loaded before
  
  const stableInViewRef = useRef(false);
  const mountedRef = useRef(false);
  const imageLoadedRef = useRef(false); // NEW: Ref to track actual loading state
  
  // Modal states  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalImageLoaded, setIsModalImageLoaded] = useState(false);
  const [showModalContent, setShowModalContent] = useState(false);
  const [modalImageError, setModalImageError] = useState(false); // NEW: Modal specific error
  
  // Cache-related states
  const [isCachedImage, setIsCachedImage] = useState(false);
  const [cacheStatus, setCacheStatus] = useState('checking'); // 'checking', 'cached', 'fresh'
  const [realTimeStatus, setRealTimeStatus] = useState('checking'); // NEW: Real-time status display

  // Your existing zoom and pan states...
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Your existing refs...
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartPanX = useRef(0);
  const dragStartPanY = useRef(0);
  const imageRef = useRef(null);
  const modalRef = useRef(null);
  const modalImageContainerRef = useRef(null);



const [shouldPreserveSpace, setShouldPreserveSpace] = useState(false);
const [estimatedHeight, setEstimatedHeight] = useState(0);
const containerRef = useRef(null);


 const handleImageLoadWithRetry = useCallback((retryCount = 0) => {
  const maxRetries = 2;
  return () => {
    setLoadingProgress(100);
    
    // Set correct status based on actual cache state
    const finalStatus = isCachedImage ? 'cached' : 'fresh';
    setRealTimeStatus(finalStatus);
    
    const delay = isCachedImage ? 50 : 200;
    setTimeout(() => {
      setIsLoading(false);
      setHasLoadedOnce(true);
      imageLoadedRef.current = true;
      
      // Ensure status remains consistent after load
      setRealTimeStatus(finalStatus);
    }, delay);
  };
}, [isCachedImage]);
  
  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
    setRealTimeStatus('error');
    
    // Optional: Implement retry logic for temporary network issues
    // This could be useful for high-traffic scenarios
  }, []);



  useEffect(() => {
  if (hasLoadedOnce && !isLoading) {
    // Ensure status is correct after image has loaded
    const correctStatus = isCachedImage ? 'cached' : 'fresh';
    if (realTimeStatus !== correctStatus) {
      setRealTimeStatus(correctStatus);
    }
  }
}, [hasLoadedOnce, isLoading, isCachedImage, realTimeStatus]);

 useEffect(() => {
    const currentSrc = src; // Capture src for cleanup closure

    return () => {
      // Cleanup any pending operations for this specific image
      if (ImageCache.pendingRequests?.has(ImageCache.getCacheKey(currentSrc))) {
        ImageCache.pendingRequests.delete(ImageCache.getCacheKey(currentSrc));
        // console.log(`Cleaned up pending request for: ${currentSrc}`); // Optional: for debugging
      }

      // General cleanup for the ImageCache system
      ImageCache.cleanup();
      // console.log('ImageCache general cleanup executed.'); // Optional: for debugging
    };
  }, [src]); // Dependency array: run effect and its cleanup when src changes


 const handleModalImageLoad = useCallback(() => {
    setIsModalImageLoaded(true);
    setTimeout(() => {
      setShowModalContent(true);
    }, 100);
  }, []);

  // Image cache utility - add this BEFORE the OptimizedImage component
 const ImageCache = {
  cache: new Map(),
  observers: new Set(),
  pendingRequests: new Map(),
  maxCacheSize: 25, // Reduced for better memory management
  
  getCacheKey: (src) => {
    return btoa(encodeURIComponent(src)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  },
  
  has: (src) => {
    const key = ImageCache.getCacheKey(src);
    const cached = ImageCache.cache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    const cacheAge = now - cached.timestamp;
    const maxAge = 30 * 60 * 1000; // Reduced to 30 minutes
    
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
  
  set: (src, data) => {
    const key = ImageCache.getCacheKey(src);
    
    // Implement LRU eviction
    if (ImageCache.cache.size >= ImageCache.maxCacheSize) {
      const firstKey = ImageCache.cache.keys().next().value;
      ImageCache.cache.delete(firstKey);
    }
    
    ImageCache.cache.set(key, {
      ...data,
      timestamp: Date.now()
    });
  },
  
  preload: (src) => {
    const key = ImageCache.getCacheKey(src);
    
    if (ImageCache.pendingRequests.has(key)) {
      return ImageCache.pendingRequests.get(key);
    }
    
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const cleanup = () => {
        img.onload = null;
        img.onerror = null;
        ImageCache.pendingRequests.delete(key);
      };
      
      img.onload = () => {
        try {
          ImageCache.set(src, {
            loaded: true,
            width: img.naturalWidth,
            height: img.naturalHeight
          });
          cleanup();
          resolve(true);
        } catch (error) {
          cleanup();
          reject(error);
        }
      };
      
      img.onerror = () => {
        cleanup();
        reject(new Error('Failed to load image'));
      };
      
      // Add timeout
      setTimeout(() => {
        cleanup();
        reject(new Error('Image load timeout'));
      }, 8000);
      
      img.src = src;
    });
    
    ImageCache.pendingRequests.set(key, promise);
    return promise;
  },
  
  cleanup: () => {
    ImageCache.pendingRequests.clear();
    
    // Clean old entries
    const now = Date.now();
    const maxAge = 30 * 60 * 1000;
    
    for (const [key, data] of ImageCache.cache.entries()) {
      if (now - data.timestamp > maxAge) {
        ImageCache.cache.delete(key);
      }
    }
  }
};

const useDebounceCallback = (callback, delay) => {
  const timeoutRef = useRef();

  return useCallback((...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};



const { ref, inView } = useInView({
  triggerOnce: true,
  rootMargin: "150px 0px", // Increased margin for better pre-loading
  threshold: 0.1 // Load when 10% visible
});

const checkImageCache = useCallback(async () => {
  try {
    setRealTimeStatus('checking');
    
    if (ImageCache.has(src)) {
      const cachedData = ImageCache.get(src);
      setIsCachedImage(true);
      setCacheStatus('cached');
      setRealTimeStatus('cached');
      return true;
    } else {
      setIsCachedImage(false);
      setCacheStatus('fresh');
      setRealTimeStatus('fresh');
      
      // Preload in background for next time
      if (inView) {
        ImageCache.preload(src).catch(() => {
          // Silent fail
        });
      }
      return false;
    }
  } catch (error) {
    console.warn('Cache check failed:', error);
    setIsCachedImage(false);
    setCacheStatus('fresh');
    setRealTimeStatus('fresh');
    return false;
  }
}, [src, inView]);



  // Helper function to clamp a value between a min and max
  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  // Static placeholder component with same loader animation
// Enhanced StaticPlaceholder component with improved responsive design
const StaticPlaceholder = () => (
  <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
    {/* Enhanced shimmer with better visibility */}
    <div 
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent animate-shimmer"
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 2.5s infinite linear'
      }}
    />
    
    {/* Main loading content container */}
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6">
      
      {/* Enhanced cache status indicator */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
        {realTimeStatus === 'cached' ? (
          <div className="bg-emerald-500/95 backdrop-blur-sm text-white rounded-full p-2 shadow-lg border border-emerald-400/20">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
        ) : realTimeStatus === 'fresh' ? (
          <div className="bg-blue-500/95 backdrop-blur-sm text-white rounded-full p-2 shadow-lg border border-blue-400/20">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1z" clipRule="evenodd"/>
            </svg>
          </div>
        ) : (
          <div className="bg-slate-500/95 backdrop-blur-sm text-white rounded-full p-2 shadow-lg border border-slate-400/20">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Enhanced main loading container with improved spacing */}
      <div className="relative flex items-center justify-center mb-6 sm:mb-8">
        
        {/* Improved circular progress indicator */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28">
          <svg className="w-full h-full absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            
            {/* Background circle with subtle styling */}
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-gray-200/60 dark:text-gray-700/60"
            />
            
            {/* Enhanced animated checking state */}
            {realTimeStatus === 'checking' ? (
              <>
                {/* Glowing animated dot - SIGNIFICANTLY ENHANCED */}
                <circle
                  r="8"  // Increased from 5 to 8
                  fill="url(#enhancedGlow)"
                  className="drop-shadow-2xl"
                  filter="url(#glowFilter)"
                >
                  <animateMotion
                    dur="2.5s"
                    repeatCount="indefinite"
                    rotate="auto"
                  >
                    <mpath href="#circlePath"/>
                  </animateMotion>
                </circle>
                
                {/* Path for the dot to follow */}
                <path
                  id="circlePath"
                  d="M 50,8 A 42,42 0 1,1 49.99,8"
                  fill="none"
                  stroke="none"
                />
                
                {/* Enhanced gradient and glow definitions */}
                <defs>
                  {/* Glow filter for extra visual impact */}
                  <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  
                  {/* Enhanced radial gradient */}
                  <radialGradient id="enhancedGlow" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#f8fafc" stopOpacity="1"/>
                    <stop offset="20%" stopColor="#3b82f6" stopOpacity="1"/>
                    <stop offset="40%" stopColor="#1d4ed8" stopOpacity="0.9"/>
                    <stop offset="70%" stopColor="#1e40af" stopOpacity="0.7"/>
                    <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.3"/>
                  </radialGradient>
                </defs>
                
                {/* Subtle pulsing background ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="url(#pulseGradient)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  className="animate-pulse"
                  opacity="0.4"
                />
                
                <defs>
                  <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" className="dark:stop-color-blue-400"/>
                    <stop offset="100%" stopColor="#1d4ed8" className="dark:stop-color-blue-500"/>
                  </linearGradient>
                </defs>
              </>
            ) : (
              /* Static progress circle for other states */
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                className={`transition-all duration-700 ease-out ${
                  realTimeStatus === 'cached'
                    ? 'text-emerald-500 dark:text-emerald-400'
                    : realTimeStatus === 'fresh'
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
                strokeDasharray="263.9"
                strokeDashoffset="131.95"
              />
            )}
          </svg>
          
          {/* Enhanced image placeholder icon */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400/80 dark:text-gray-500/80"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Enhanced status text and badge */}
      <div className="text-center space-y-3 sm:space-y-4 max-w-xs sm:max-w-sm">
        
        {/* Improved main status text */}
        <div className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200 tracking-wide">
          {realTimeStatus === 'cached' ? 'Ready from cache...' :
           realTimeStatus === 'fresh' ? 'Preparing image...' : 
           'Checking cache...'}
        </div>
        
        {/* Enhanced status badge */}
        <div className={`inline-flex items-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-500 shadow-lg backdrop-blur-sm border-2 ${
          realTimeStatus === 'cached'
            ? 'bg-emerald-50/90 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-700/50 shadow-emerald-200/50 dark:shadow-emerald-900/30'
            : realTimeStatus === 'fresh'
            ? 'bg-blue-50/90 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-700/50 shadow-blue-200/50 dark:shadow-blue-900/30'
            : 'bg-slate-50/90 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-slate-700/50 shadow-slate-200/50 dark:shadow-slate-900/30'
        }`}>
          
          {/* Enhanced status indicator dot */}
          <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
            realTimeStatus === 'cached'
              ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50'
              : realTimeStatus === 'fresh'
              ? 'bg-blue-500 dark:bg-blue-400 animate-bounce shadow-lg shadow-blue-500/50'
              : 'bg-slate-500 dark:bg-slate-400 animate-pulse shadow-lg shadow-slate-500/50'
          }`}></div>
          
          {/* Status text */}
          <span className="font-semibold tracking-wide">
            {realTimeStatus === 'cached' ? 'Cached' :
             realTimeStatus === 'fresh' ? 'Fresh' : 
             'Loading...'}
          </span>
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
    if (!imageError && !isLoading && !showPlaceholder && hasLoadedOnce) {
      setIsModalOpen(true);
      setIsModalImageLoaded(false);
      setShowModalContent(false);
      setModalImageError(false); // Reset modal error state
      resetZoomAndPan();
    }
  }, [imageError, isLoading, showPlaceholder, hasLoadedOnce, resetZoomAndPan]);

  useEffect(() => {
  if (inView && !stableInViewRef.current) {
    stableInViewRef.current = true;
  }
}, [inView]);

// Track component mount state
useEffect(() => {
  mountedRef.current = true;
  return () => {
    mountedRef.current = false;
  };
}, []);

  // Hide static placeholder after a short delay to simulate instant content load
// Replace your existing static placeholder useEffect with this enhanced version


useEffect(() => {
  let timer;
  let isMounted = true; // Add mounting check
  
  const initImageLoading = async () => {
    // Check cache status BEFORE showing placeholder
    const isImageCached = await checkImageCache();
    
    if (!isMounted) return; // Prevent state updates if unmounted
    
    if (isImageCached) {
      // For cached images: minimal or no placeholder
      if (showStaticPlaceholder && inView) {
        // Only show placeholder if user is at image position during reload
        const wasAtImagePosition = window.scrollY > (imageRef.current?.offsetTop - window.innerHeight) || false;
        
        if (wasAtImagePosition) {
          // Very brief placeholder for smooth transition
          timer = setTimeout(() => {
            if (isMounted) {
              setShowPlaceholder(false);
              setLoadingProgress(100);
              setIsLoading(false);
              setHasLoadedOnce(true);
              imageLoadedRef.current = true;
            }
          }, 50); // Much faster for cached at position
        } else {
          // Instant load if not at image position
          setShowPlaceholder(false);
          setLoadingProgress(100);
          setIsLoading(false);
          setHasLoadedOnce(true);
          imageLoadedRef.current = true;
        }
      } else {
        // No static placeholder, instant load
        setShowPlaceholder(false);
        setLoadingProgress(100);
        setIsLoading(false);
        setHasLoadedOnce(true);
        imageLoadedRef.current = true;
      }
    } else {
      // For fresh images: normal timing only if in view
      if (showStaticPlaceholder && inView) {
        timer = setTimeout(() => {
          if (isMounted) {
            setShowPlaceholder(false);
          }
        }, 500);
      } else if (inView) {
        // If not showing static placeholder but in view, start loading
        setShowPlaceholder(false);
      }
    }
  };

  // Only initialize if component is in view or about to be
  if (inView || stableInViewRef.current) {
    initImageLoading();
  }

  return () => {
    isMounted = false;
    if (timer) clearTimeout(timer);
  };
}, [src, showStaticPlaceholder, checkImageCache, inView]); // Add inView to dependencies

  // Enhanced loading progress simulation
// Enhanced loading progress simulation
 useEffect(() => {
  if (!inView || showPlaceholder || hasLoadedOnce || imageError) return;
  
  let progressInterval;
  let startTime = performance.now();
  
  const updateProgress = () => {
    const elapsed = performance.now() - startTime;
    const targetTime = isCachedImage ? 150 : 1200; // Faster timing
    const baseProgress = Math.min((elapsed / targetTime) * 100, 95);
    
    setLoadingProgress(prev => {
      if (prev >= 95) return prev;
      
      // Smoother progress updates
      const increment = isCachedImage ? 20 : 8;
      return Math.min(prev + increment, baseProgress);
    });
  };
  
  // More frequent updates for smoother animation
  progressInterval = setInterval(updateProgress, isCachedImage ? 15 : 80);
  
  return () => {
    if (progressInterval) clearInterval(progressInterval);
  };
}, [inView, src, showPlaceholder, isCachedImage, hasLoadedOnce, imageError]);

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
  }, 50); // Debounce by 50ms, adjust as needed

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
    setPanX(clamp(dragStartPanX.current + dx, -maxPanX, maxPanY));
    setPanY(clamp(dragStartPanY.current + dy, -maxPanY, maxPanY));
  }, 50); // Debounce by 50ms, adjust as needed

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
  const handleBeforeUnload = () => {
    // Store scroll position and image positions before page unload
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

// Add this effect to restore scroll position
useEffect(() => {
  if (typeof window !== 'undefined') {
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    const savedImagePositions = sessionStorage.getItem('imagePositions');
    
    if (savedScrollPosition && savedImagePositions) {
      const positions = JSON.parse(savedImagePositions);
      const currentImagePosition = positions.find(pos => pos.src === src);
      
      if (currentImagePosition) {
        // Set estimated height to prevent layout shift
        setEstimatedHeight(currentImagePosition.height || 400);
        setShouldPreserveSpace(true);
        
        // Restore scroll position after a brief delay
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScrollPosition));
          // Clear saved positions after use
          sessionStorage.removeItem('scrollPosition');
          sessionStorage.removeItem('imagePositions');
        }, 100);
      }
    }
  }
}, [src]);


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




 {hasLoadedOnce && shouldPreserveSpace && (
    <div style={{ display: 'none' }}>
      {setTimeout(() => setShouldPreserveSpace(false), 100)}
    </div>
  )}


  {/* 2. Add performance monitoring in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-0 left-0 z-50 bg-black/50 text-white text-xs p-1">
            Cache: {cacheStatus} | Status: {realTimeStatus}
          </div>
        )}
        


        {/* Show static placeholder first */}
        {showStaticPlaceholder && showPlaceholder && !hasLoadedOnce && <StaticPlaceholder />}
  {hasLoadedOnce && isCachedImage && !isLoading && (
          <div className="absolute top-2 right-2 z-10 bg-green-500/90 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            cached
          </div>
        )}
        
        {/* Dynamic loading state */}
      {/* Replace your existing dynamic loading state with this enhanced version */}
        {!showPlaceholder && isLoading && inView && !imageError && !hasLoadedOnce && (
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
 onLoadingComplete={handleImageLoadWithRetry()} // Call it as a function to get the actual handler
      onError={handleImageError} // Directly use the new error handler
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
          
          {!isModalImageLoaded && !modalImageError && (
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
   {modalImageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-red-900/80 to-black/80">
              <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <p className="text-white text-lg font-semibold">Failed to load image</p>
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
                onLoadingComplete={handleModalImageLoad}
                onError={() => {
                  setModalImageError(true);
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

//RangeError: Maximum call stack size exceeded


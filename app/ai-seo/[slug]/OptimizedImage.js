import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { createPortal } from 'react-dom';

// Device detection hook
const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState('desktop');
  
  useEffect(() => {
    const checkDevice = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTablet = /(iPad|Android(?!.*Mobile))/i.test(navigator.userAgent) || 
        (window.innerWidth >= 768 && window.innerWidth <= 1024);
      
      if (isMobile) {
        setDeviceType('mobile');
      } else if (isTablet) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return deviceType;
};

const OptimizedImage = ({
  src,
  alt,
  className = "",
  children,
  priority = false,
  blurDataURL,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  fill = false,
  width,
  height,
  quality = 85,
  style,
  onClick,
  enableModal = true,
  ...restProps
}) => {
  const deviceType = useDeviceType();
  const isMobileOrTablet = deviceType === 'mobile' || deviceType === 'tablet';
  
  // Simplified states for better performance
  const [isImageReady, setIsImageReady] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Simple modal state for mobile/tablet - no complex zoom/pan logic
  const [simpleModalOpen, setSimpleModalOpen] = useState(false);
  
  // Complex modal state only for desktop
  const [desktopModalState, setDesktopModalState] = useState(() => ({
    isOpen: false,
    imageLoaded: false,
    showContent: false,
    hasError: false,
    zoomLevel: 1,
    panX: 0,
    panY: 0,
    isDragging: false
  }));

  // References
  const mountedRef = useRef(true);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const modalImageContainerRef = useRef(null);
  const modalRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Memoized handlers to prevent recreation
  const handleImageLoad = useCallback(() => {
    if (!mountedRef.current) return;
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    setLoadingProgress(100);
    setTimeout(() => {
      if (mountedRef.current) {
        setIsImageReady(true);
        setImageError(false);
      }
    }, 50);
  }, []);

  const handleImageError = useCallback(() => {
    if (!mountedRef.current) return;
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    setImageError(true);
    setIsImageReady(false);
    setLoadingProgress(0);
  }, []);

  const startProgressSimulation = useCallback(() => {
    setLoadingProgress(0);
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);
    
    loadingTimeoutRef.current = setTimeout(() => {
      setLoadingProgress(85);
    }, 3000);
  }, []);

  // Simplified modal handlers
  const openModal = useCallback(() => {
    if (!enableModal || imageError || !isImageReady) return;
    
    if (isMobileOrTablet) {
      setSimpleModalOpen(true);
    } else {
      setDesktopModalState(prev => ({
        ...prev,
        isOpen: true,
        imageLoaded: false,
        showContent: false,
        hasError: false
      }));
    }
  }, [enableModal, imageError, isImageReady, isMobileOrTablet]);

  const closeModal = useCallback(() => {
    if (isMobileOrTablet) {
      setSimpleModalOpen(false);
    } else {
      setDesktopModalState({
        isOpen: false,
        imageLoaded: false,
        showContent: false,
        hasError: false,
        zoomLevel: 1,
        panX: 0,
        panY: 0,
        isDragging: false
      });
    }
  }, [isMobileOrTablet]);

  // Desktop modal handlers (only created when needed)
  const desktopHandlers = useMemo(() => {
    if (isMobileOrTablet) return {};
    
    return {
      handleModalImageLoad: () => {
        if (!mountedRef.current) return;
        setDesktopModalState(prev => ({ ...prev, imageLoaded: true }));
        setTimeout(() => {
          if (mountedRef.current) {
            setDesktopModalState(prev => ({ ...prev, showContent: true }));
          }
        }, 100);
      },

      handleModalImageError: () => {
        if (mountedRef.current) {
          setDesktopModalState(prev => ({
            ...prev,
            hasError: true,
            imageLoaded: false
          }));
        }
      },

      handleZoomIn: () => {
        setDesktopModalState(prev => ({
          ...prev,
          zoomLevel: Math.min(prev.zoomLevel + 0.5, 4)
        }));
      },

      handleZoomOut: () => {
        setDesktopModalState(prev => ({
          ...prev,
          zoomLevel: Math.max(prev.zoomLevel - 0.5, 1)
        }));
      },

      resetZoomAndPan: () => {
        setDesktopModalState(prev => ({
          ...prev,
          zoomLevel: 1,
          panX: 0,
          panY: 0
        }));
      },

      handleMouseDown: (e) => {
        if (desktopModalState.zoomLevel > 1) {
          e.preventDefault();
          setDesktopModalState(prev => ({ ...prev, isDragging: true }));
          dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            panX: desktopModalState.panX,
            panY: desktopModalState.panY
          };
        }
      },

      handleMouseMove: (e) => {
        if (!desktopModalState.isDragging || desktopModalState.zoomLevel <= 1) return;
        
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        const container = modalImageContainerRef.current;
        
        if (!container) return;
        
        const currentImageWidth = container.clientWidth * desktopModalState.zoomLevel;
        const currentImageHeight = container.clientHeight * desktopModalState.zoomLevel;
        const maxPanX = (currentImageWidth - container.clientWidth) / 2;
        const maxPanY = (currentImageHeight - container.clientHeight) / 2;
        
        const newPanX = Math.max(-maxPanX, Math.min(maxPanX, dragStartRef.current.panX + dx));
        const newPanY = Math.max(-maxPanY, Math.min(maxPanY, dragStartRef.current.panY + dy));
        
        setDesktopModalState(prev => ({ ...prev, panX: newPanX, panY: newPanY }));
      },

      handleMouseUp: () => {
        setDesktopModalState(prev => ({ ...prev, isDragging: false }));
      },

      handleWheel: (e) => {
        e.preventDefault();
        const container = modalImageContainerRef.current;
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const scaleFactor = 0.1;
        
        let newZoomLevel = desktopModalState.zoomLevel;
        if (e.deltaY < 0) {
          newZoomLevel = Math.min(desktopModalState.zoomLevel + scaleFactor, 4);
        } else {
          newZoomLevel = Math.max(desktopModalState.zoomLevel - scaleFactor, 1);
        }
        
        if (newZoomLevel === desktopModalState.zoomLevel) return;
        
        const zoomRatio = newZoomLevel / desktopModalState.zoomLevel;
        let newPanX = mouseX - (mouseX - desktopModalState.panX) * zoomRatio;
        let newPanY = mouseY - (mouseY - desktopModalState.panY) * zoomRatio;
        
        const currentImageWidth = container.clientWidth * newZoomLevel;
        const currentImageHeight = container.clientHeight * newZoomLevel;
        const maxPanX = (currentImageWidth - container.clientWidth) / 2;
        const maxPanY = (currentImageHeight - container.clientHeight) / 2;
        
        newPanX = Math.max(-maxPanX, Math.min(maxPanX, newPanX));
        newPanY = Math.max(-maxPanY, Math.min(maxPanY, newPanY));
        
        setDesktopModalState(prev => ({
          ...prev,
          zoomLevel: newZoomLevel,
          panX: newPanX,
          panY: newPanY
        }));
      }
    };
  }, [isMobileOrTablet, desktopModalState]);

  // Effects
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setIsImageReady(false);
    setImageError(false);
    setLoadingProgress(0);
    startProgressSimulation();
  }, [src, startProgressSimulation]);

  // Modal effects - simplified for mobile
  useEffect(() => {
    const isModalOpen = isMobileOrTablet ? simpleModalOpen : desktopModalState.isOpen;
    
    if (isModalOpen) {
      const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
          closeModal();
        }
      };
      
      const handleEscKey = (event) => {
        if (event.key === 'Escape') {
          closeModal();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscKey);
        document.body.style.overflow = 'unset';
      };
    }
  }, [simpleModalOpen, desktopModalState.isOpen, isMobileOrTablet, closeModal]);

  // Reset pan when zoom returns to 1 (desktop only)
  useEffect(() => {
    if (!isMobileOrTablet && desktopModalState.zoomLevel === 1) {
      setDesktopModalState(prev => ({ ...prev, panX: 0, panY: 0 }));
    }
  }, [desktopModalState.zoomLevel, isMobileOrTablet]);

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (enableModal) {
      openModal();
    }
  };

  // Simple mobile modal component
  const SimpleMobileModal = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95">
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/50 text-white shadow-lg hover:bg-black/70 focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="w-full h-full flex items-center justify-center p-4">
        <Image
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain"
          width={1920}
          height={1080}
          quality={100}
          priority
          sizes="100vw"
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Main image container */}
      <div className="relative w-full overflow-hidden">
        {/* Loading state */}
        {!isImageReady && !imageError && (
          <div className="absolute inset-0 z-10 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent animate-shimmer" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-4">
              <div className="relative flex items-center justify-center mb-2 sm:mb-4 md:mb-6">
                <div className="relative w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20">
                  <svg className="w-full h-full absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-200/60 dark:text-gray-700/60" />
                    <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" className="text-blue-500 dark:text-blue-400 transition-all duration-700 ease-out" strokeDasharray="263.9" strokeDashoffset="131.95" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-gray-400/80 dark:text-gray-500/80" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-1 sm:space-y-2 max-w-xs">
                <div className="text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-wide">Loading...</div>
              </div>
            </div>
          </div>
        )}

        {/* Image container with click handler */}
        <div
          onClick={handleClick}
          className={`relative group image-hover-container ${
            isImageReady && !imageError && (enableModal || onClick) ? 'cursor-pointer' : ''
          }`}
        >
          <Image
            src={src}
            alt={alt}
            className={`${className} transition-opacity duration-300 ease-out ${
              isImageReady ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            {...(fill ? { fill: true } : { width: width || 800, height: height || 600 })}
            quality={quality}
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            placeholder={blurDataURL ? "blur" : "empty"}
            blurDataURL={blurDataURL}
            sizes={sizes}
            style={style}
            {...restProps}
          />

          {/* Error state */}
          {imageError && (
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
              <div className="text-center p-4">
                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Failed to load image</p>
              </div>
            </div>
          )}

          {/* Zoom indicator - only show on desktop */}
          {isImageReady && !imageError && enableModal && !isMobileOrTablet && (
            <div className="absolute top-4 right-4 zoom-indicator opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                Click to zoom
              </div>
            </div>
          )}

          {/* Mobile/Tablet tap indicator */}
          {isImageReady && !imageError && enableModal && isMobileOrTablet && (
            <div className="absolute top-4 right-4 zoom-indicator opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Tap to view
              </div>
            </div>
          )}
        </div>
        {children}
      </div>

      {/* Modal - Different implementations for mobile vs desktop */}
      {((isMobileOrTablet && simpleModalOpen) || (!isMobileOrTablet && desktopModalState.isOpen)) && 
        createPortal(
          isMobileOrTablet ? (
            <SimpleMobileModal />
          ) : (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300">
              <div className={`absolute inset-0 bg-black/90 ${desktopModalState.imageLoaded ? 'backdrop-blur-sm' : ''} transition-all duration-300`} />
              
              {/* Desktop loading state */}
              {!desktopModalState.imageLoaded && !desktopModalState.hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-gray-900/80 to-black/80 animate-pulse-fade">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-t-4 border-blue-400 border-opacity-30 animate-spin-slow"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-4 border-blue-500 animate-spin-fast"></div>
                  </div>
                  <p className="text-white text-lg font-semibold tracking-wide">Loading</p>
                </div>
              )}

              {/* Desktop error state */}
             {!desktopModalState.imageLoaded && !desktopModalState.hasError && (
  <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-gray-900/80 to-black/80">
    <div className="animated-spinner mb-4" />
    <p className="text-white text-lg font-semibold tracking-wide animate-pulse">
      Loading Image...
    </p>
  </div>
)}
              <div
                ref={modalRef}
                className={`relative max-h-[95vh] max-w-[95vw] overflow-hidden rounded-2xl shadow-2xl ${
                  desktopModalState.showContent ? 'animate-in zoom-in-95 duration-300' : 'opacity-0'
                }`}
              >
                {/* Close button */}
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 z-50 p-3 rounded-full bg-gradient-to-br from-gray-700/80 to-gray-900/80 border border-white/20 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:from-red-500/90 hover:to-red-700/90 focus:outline-none focus:ring-2 focus:ring-red-400 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Control buttons */}
                {desktopModalState.showContent && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center space-x-3 bg-gradient-to-br from-gray-800/80 to-gray-950/80 border border-white/15 rounded-full p-3 shadow-2xl">
                    <button
                      onClick={desktopHandlers.handleZoomOut}
                      disabled={desktopModalState.zoomLevel <= 1}
                      className="p-2.5 rounded-full bg-gradient-to-br from-white/10 to-white/0 text-white shadow-md transition-all duration-300 hover:bg-gray-700 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <button
                      onClick={desktopHandlers.resetZoomAndPan}
                      disabled={desktopModalState.zoomLevel === 1 && desktopModalState.panX === 0 && desktopModalState.panY === 0}
                      className="p-2.5 rounded-full bg-gradient-to-br from-white/10 to-white/0 text-white shadow-md transition-all duration-300 hover:bg-green-500/50 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={desktopHandlers.handleZoomIn}
                      disabled={desktopModalState.zoomLevel >= 4}
                      className="p-2.5 rounded-full bg-gradient-to-br from-white/10 to-white/0 text-white shadow-md transition-all duration-300 hover:bg-blue-500 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Modal image container */}
                <div
                  ref={modalImageContainerRef}
                  className="relative w-full h-full flex items-center justify-center"
                  onMouseDown={desktopHandlers.handleMouseDown}
                  onMouseMove={desktopHandlers.handleMouseMove}
                  onMouseUp={desktopHandlers.handleMouseUp}
                  onMouseLeave={desktopHandlers.handleMouseUp}
                  onWheel={desktopHandlers.handleWheel}
                  style={{
                    cursor: desktopModalState.zoomLevel > 1
                      ? (desktopModalState.isDragging ? 'grabbing' : 'grab')
                      : 'default',
                    overflow: 'hidden'
                  }}
                >
                  <Image
                    src={src}
                    alt={alt}
                    className="transition-all duration-500 ease-out max-w-full max-h-[85vh] md:max-h-[90vh] object-contain"
                    onLoad={desktopHandlers.handleModalImageLoad}
                    onError={desktopHandlers.handleModalImageError}
                    width={1920}
                    height={1080}
                    quality={100}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                    style={{
                      transform: `scale(${desktopModalState.zoomLevel}) translate(${desktopModalState.panX}px, ${desktopModalState.panY}px)`,
                      transformOrigin: 'center center'
                    }}
                  />
                </div>
              </div>
            </div>
          ),
          document.body
        )}
    </>
  );
};

export default OptimizedImage;
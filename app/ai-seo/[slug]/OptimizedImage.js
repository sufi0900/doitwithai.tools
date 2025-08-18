import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { createPortal } from 'react-dom';

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
  // Simplified loading state - only track what we need
  const [isImageReady, setIsImageReady] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Modal states
  const [modalState, setModalState] = useState({
    isOpen: false,
    imageLoaded: false,
    showContent: false,
    hasError: false,
    zoomLevel: 1,
    panX: 0,
    panY: 0,
    isDragging: false
  });

  // References
  const mountedRef = useRef(true);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const modalImageContainerRef = useRef(null);
  const modalRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Enhanced image load handler with progress simulation
  const handleImageLoad = useCallback(() => {
    if (!mountedRef.current) return;
    
    // Clear any ongoing progress simulation
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    // Complete the progress and set image as ready
    setLoadingProgress(100);
    
    // Small delay to ensure smooth transition
    setTimeout(() => {
      if (mountedRef.current) {
        setIsImageReady(true);
        setImageError(false);
      }
    }, 50);
  }, []);

  const handleImageError = useCallback(() => {
    if (!mountedRef.current) return;
    
    // Clear progress simulation
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

  // Progress simulation for better UX
  const startProgressSimulation = useCallback(() => {
    setLoadingProgress(0);
    
    // Simulate loading progress
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev; // Stop at 90%, let actual load complete it
        return prev + Math.random() * 15;
      });
    }, 200);

    // Fallback timeout
    loadingTimeoutRef.current = setTimeout(() => {
      setLoadingProgress(85);
    }, 3000);
  }, []);

  // Modal handlers
  const openModal = useCallback(() => {
    if (!enableModal || imageError || !isImageReady) return;
    
    setModalState(prev => ({
      ...prev,
      isOpen: true,
      imageLoaded: false,
      showContent: false,
      hasError: false
    }));
  }, [enableModal, imageError, isImageReady]);

  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      imageLoaded: false,
      showContent: false,
      hasError: false,
      zoomLevel: 1,
      panX: 0,
      panY: 0,
      isDragging: false
    });
  }, []);

  const handleModalImageLoad = useCallback(() => {
    if (!mountedRef.current) return;
    
    setModalState(prev => ({ ...prev, imageLoaded: true }));
    
    setTimeout(() => {
      if (mountedRef.current) {
        setModalState(prev => ({ ...prev, showContent: true }));
      }
    }, 100);
  }, []);

  const handleModalImageError = useCallback(() => {
    if (mountedRef.current) {
      setModalState(prev => ({
        ...prev,
        hasError: true,
        imageLoaded: false
      }));
    }
  }, []);

  // Zoom and pan handlers (keeping your existing functionality)
  const handleZoomIn = () => {
    setModalState(prev => ({
      ...prev,
      zoomLevel: Math.min(prev.zoomLevel + 0.5, 4)
    }));
  };

  const handleZoomOut = () => {
    setModalState(prev => ({
      ...prev,
      zoomLevel: Math.max(prev.zoomLevel - 0.5, 1)
    }));
  };

  const resetZoomAndPan = () => {
    setModalState(prev => ({
      ...prev,
      zoomLevel: 1,
      panX: 0,
      panY: 0
    }));
  };

  // Mouse/touch handlers (keeping your existing functionality)
  const handleMouseDown = (e) => {
    if (modalState.zoomLevel > 1) {
      e.preventDefault();
      setModalState(prev => ({ ...prev, isDragging: true }));
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: modalState.panX,
        panY: modalState.panY
      };
    }
  };

  const handleMouseMove = (e) => {
    if (!modalState.isDragging || modalState.zoomLevel <= 1) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const container = modalImageContainerRef.current;
    if (!container) return;

    const currentImageWidth = container.clientWidth * modalState.zoomLevel;
    const currentImageHeight = container.clientHeight * modalState.zoomLevel;
    const maxPanX = (currentImageWidth - container.clientWidth) / 2;
    const maxPanY = (currentImageHeight - container.clientHeight) / 2;

    const newPanX = Math.max(-maxPanX, Math.min(maxPanX, dragStartRef.current.panX + dx));
    const newPanY = Math.max(-maxPanY, Math.min(maxPanY, dragStartRef.current.panY + dy));

    setModalState(prev => ({
      ...prev,
      panX: newPanX,
      panY: newPanY
    }));
  };

  const handleMouseUp = () => {
    setModalState(prev => ({ ...prev, isDragging: false }));
  };

  const handleTouchStart = (e) => {
    if (modalState.zoomLevel > 1 && e.touches.length === 1) {
      setModalState(prev => ({ ...prev, isDragging: true }));
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        panX: modalState.panX,
        panY: modalState.panY
      };
    }
  };

  const handleTouchMove = (e) => {
    if (!modalState.isDragging || modalState.zoomLevel <= 1 || e.touches.length !== 1) return;

    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    const container = modalImageContainerRef.current;
    if (!container) return;

    const currentImageWidth = container.clientWidth * modalState.zoomLevel;
    const currentImageHeight = container.clientHeight * modalState.zoomLevel;
    const maxPanX = (currentImageWidth - container.clientWidth) / 2;
    const maxPanY = (currentImageHeight - container.clientHeight) / 2;

    const newPanX = Math.max(-maxPanX, Math.min(maxPanX, dragStartRef.current.panX + dx));
    const newPanY = Math.max(-maxPanY, Math.min(maxPanY, dragStartRef.current.panY + dy));

    setModalState(prev => ({
      ...prev,
      panX: newPanX,
      panY: newPanY
    }));
  };

  const handleTouchEnd = () => {
    setModalState(prev => ({ ...prev, isDragging: false }));
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const container = modalImageContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const scaleFactor = 0.1;
    let newZoomLevel = modalState.zoomLevel;

    if (e.deltaY < 0) {
      newZoomLevel = Math.min(modalState.zoomLevel + scaleFactor, 4);
    } else {
      newZoomLevel = Math.max(modalState.zoomLevel - scaleFactor, 1);
    }

    if (newZoomLevel === modalState.zoomLevel) return;

    const zoomRatio = newZoomLevel / modalState.zoomLevel;
    let newPanX = mouseX - (mouseX - modalState.panX) * zoomRatio;
    let newPanY = mouseY - (mouseY - modalState.panY) * zoomRatio;

    const currentImageWidth = container.clientWidth * newZoomLevel;
    const currentImageHeight = container.clientHeight * newZoomLevel;
    const maxPanX = (currentImageWidth - container.clientWidth) / 2;
    const maxPanY = (currentImageHeight - container.clientHeight) / 2;

    newPanX = Math.max(-maxPanX, Math.min(maxPanX, newPanX));
    newPanY = Math.max(-maxPanY, Math.min(maxPanY, newPanY));

    setModalState(prev => ({
      ...prev,
      zoomLevel: newZoomLevel,
      panX: newPanX,
      panY: newPanY
    }));
  };

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

  // Reset states when src changes
  useEffect(() => {
    setIsImageReady(false);
    setImageError(false);
    setLoadingProgress(0);
    startProgressSimulation();
  }, [src, startProgressSimulation]);

  // Modal effects
  useEffect(() => {
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

    if (modalState.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [modalState.isOpen, closeModal]);

  // Reset pan when zoom returns to 1
  useEffect(() => {
    if (modalState.zoomLevel === 1) {
      setModalState(prev => ({
        ...prev,
        panX: 0,
        panY: 0
      }));
    }
  }, [modalState.zoomLevel]);

  // Handle custom onClick vs modal
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (enableModal) {
      openModal();
    }
  };

  return (
    <>
      {/* Main image container */}
      <div className="relative w-full overflow-hidden">
        {/* Enhanced loading state - only show when image is not ready */}
     {/* Enhanced loading state - responsive for all sizes */}
{!isImageReady && !imageError && (
  <div className="absolute inset-0 z-10 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent animate-shimmer" />
    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="relative flex items-center justify-center mb-2 sm:mb-4 md:mb-6">
        {/* Responsive loader size */}
        <div className="relative w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20">
          <svg className="w-full h-full absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gray-200/60 dark:text-gray-700/60"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              className="text-blue-500 dark:text-blue-400 transition-all duration-700 ease-out"
              strokeDasharray="263.9"
              strokeDashoffset="131.95"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-gray-400/80 dark:text-gray-500/80" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Responsive text and status */}
      <div className="text-center space-y-1 sm:space-y-2 max-w-xs">
        <div className="text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-wide">
          Loading...
        </div>
        <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-[9px] xs:text-[10px] sm:text-xs font-semibold transition-all duration-500 shadow-lg backdrop-blur-sm border-2 bg-blue-50/90 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-700/50">
          <div className="w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse shadow-lg shadow-blue-500/50"></div>
          <span className="font-semibold tracking-wide hidden xs:inline">Loading</span>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-blue-500 dark:bg-blue-400 animate-dot-1"></div>
            <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-blue-500 dark:bg-blue-400 animate-dot-2"></div>
            <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-blue-500 dark:bg-blue-400 animate-dot-3"></div>
          </div>
        </div>
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
          {/* Next.js Image with proper props */}
          <Image
            src={src}
            alt={alt}
            className={`${className} transition-opacity duration-300 ease-out ${
              isImageReady ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            {...(fill
              ? { fill: true }
              : {
                  width: width || 800,
                  height: height || 600
                })}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Failed to load image</p>
              </div>
            </div>
          )}

          {/* Zoom indicator - only show when image is loaded and modal is enabled */}
          {isImageReady && !imageError && enableModal && (
            <div className="absolute top-4 right-4 zoom-indicator opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                </svg>
                Click to zoom
              </div>
            </div>
          )}
        </div>

        {children}
      </div>

      {/* Modal - keeping your existing modal functionality */}
{modalState.isOpen && createPortal(
  <div className="fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300">
    
          <div className={`absolute inset-0 bg-black/90 ${modalState.imageLoaded ? 'backdrop-blur-sm' : ''} transition-all duration-300`} />

          {/* Loading state */}
 {/* Modal Loading state - responsive */}
{!modalState.imageLoaded && !modalState.hasError && (
  <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-gray-900/80 to-black/80 animate-pulse-fade">
    <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mb-2 sm:mb-4">
      <div className="absolute inset-0 rounded-full border-3 sm:border-4 border-t-3 sm:border-t-4 border-blue-400 border-opacity-30 animate-spin-slow"></div>
      <div className="absolute inset-0 rounded-full border-3 sm:border-4 border-t-3 sm:border-t-4 border-blue-500 animate-spin-fast"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
    <div className="flex items-center gap-1 sm:gap-2">
      <p className="text-white text-sm sm:text-lg font-semibold tracking-wide">Loading</p>
      <div className="flex items-center gap-0.5 sm:gap-1">
        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white animate-dot-1"></div>
        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white animate-dot-2"></div>
        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white animate-dot-3"></div>
      </div>
    </div>
  </div>
)}
          {/* Error state */}
          {modalState.hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-red-900/80 to-black/80">
              <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <p className="text-white text-lg font-semibold">Failed to load image</p>
            </div>
          )}

          <div
            ref={modalRef}
            className={`relative max-h-[95vh] max-w-[95vw] overflow-hidden rounded-2xl shadow-2xl ${
              modalState.showContent ? 'animate-in zoom-in-95 duration-300' : 'opacity-0'
            }`}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-50 p-3 rounded-full bg-gradient-to-br from-gray-700/80 to-gray-900/80 border border-white/20 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:from-red-500/90 hover:to-red-700/90 focus:outline-none focus:ring-2 focus:ring-red-400 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            {/* Control buttons */}
            {modalState.showContent && (
<div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center space-x-3 bg-gradient-to-br from-gray-800/80 to-gray-950/80 border border-white/15 rounded-full p-3 shadow-2xl">
                <button
                  onClick={handleZoomOut}
                  disabled={modalState.zoomLevel <= 1}
                  className="p-2.5 rounded-full bg-gradient-to-br from-white/10 to-white/0 text-white shadow-md transition-all duration-300 hover:bg-gray-700 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4"/>
                  </svg>
                </button>

                <button
                  onClick={resetZoomAndPan}
                  disabled={modalState.zoomLevel === 1 && modalState.panX === 0 && modalState.panY === 0}
                  className="p-2.5 rounded-full bg-gradient-to-br from-white/10 to-white/0 text-white shadow-md transition-all duration-300 hover:bg-green-500/50 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </button>

                <button
                  onClick={handleZoomIn}
                  disabled={modalState.zoomLevel >= 4}
                  className="p-2.5 rounded-full bg-gradient-to-br from-white/10 to-white/0 text-white shadow-md transition-all duration-300 hover:bg-blue-500 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Modal image container */}
            <div
              ref={modalImageContainerRef}
              className="relative w-full h-full flex items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              style={{
                cursor: modalState.zoomLevel > 1 
                  ? (modalState.isDragging ? 'grabbing' : 'grab') 
                  : 'default',
                overflow: 'hidden'
              }}
            >
              <Image
                src={src}
                alt={alt}
                className="transition-all duration-500 ease-out max-w-full max-h-[85vh] md:max-h-[90vh] object-contain"
                onLoad={handleModalImageLoad}
                onError={handleModalImageError}
                width={1920}
                height={1080}
                quality={100}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                style={{
                  transform: `scale(${modalState.zoomLevel}) translate(${modalState.panX}px, ${modalState.panY}px)`,
                  transformOrigin: 'center center'
                }}
              />
            </div>
          </div>
       </div>,
  document.body
)}

     <style jsx>{`

/* Add hover effect with proper duration */
.image-hover-container {
  transition: transform 0.3s ease-out;
}

.image-hover-container:hover {
  transform: scale(1.05);
}

/* Zoom indicator with proper transition */
.zoom-indicator {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  transform: translateY(4px);
}

.zoom-indicator-visible {
  opacity: 1;
  transform: translateY(0);
}

@keyframes shimmer { /* keep existing */ }
@keyframes spin-slow { /* keep existing */ }
@keyframes spin-fast { /* keep existing */ }
@keyframes pulse-fade { /* keep existing */ }

@keyframes dot-bounce {
    0%, 80%, 100% { 
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% { 
      transform: scale(1.2);
      opacity: 1;
    }
  }
  
  .animate-dot-1 {
    animation: dot-bounce 1.4s infinite ease-in-out;
    animation-delay: 0s;
  }
  
  .animate-dot-2 {
    animation: dot-bounce 1.4s infinite ease-in-out;
    animation-delay: 0.2s;
  }
  
  .animate-dot-3 {
    animation: dot-bounce 1.4s infinite ease-in-out;
    animation-delay: 0.4s;
  }

/* Improved modal loading animation */
@keyframes breathe {
  0%, 100% { 
    transform: scale(1);
    opacity: 0.8;
  }
  50% { 
    transform: scale(1.05);
    opacity: 1;
  }
}

.animate-breathe {
  animation: breathe 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

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
     /* Add to your existing style jsx */
@media (max-width: 360px) {
  .xs\:w-10 { width: 2.5rem; }
  .xs\:h-10 { height: 2.5rem; }
  .xs\:w-4 { width: 1rem; }
  .xs\:h-4 { height: 1rem; }
  .xs\:text-xs { font-size: 0.75rem; }
  .xs\:text-\[10px\] { font-size: 10px; }
  .xs\:inline { display: inline; }
}

@media (max-width: 320px) {
  .text-\[9px\] { font-size: 9px; }
  .w-0\.5 { width: 0.125rem; }
  .h-0\.5 { height: 0.125rem; }
  .gap-0\.5 { gap: 0.125rem; }
}

/* Enhanced dot animations for smaller sizes */
@keyframes dot-bounce-small {
  0%, 80%, 100% { 
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% { 
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .animate-dot-1,
  .animate-dot-2,
  .animate-dot-3 {
    animation: dot-bounce-small 1.4s infinite ease-in-out;
  }
}
@media (max-width: 640px) {
  .border-3 {
    border-width: 3px;
  }
  .border-t-3 {
    border-top-width: 3px;
  }
}
      `}</style>
    </>
  );
};

export default OptimizedImage;
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import ModalLoadingAnimation from "./ModalLoadingAnimation"; // Import the new component

const ImageModal = ({ src, alt, onClose }) => {
  const [modalState, setModalState] = useState({
    imageLoaded: false,
    showContent: false,
    hasError: false,
    zoomLevel: 1,
    panX: 0,
    panY: 0,
    isDragging: false,
  });

  const mountedRef = useRef(true);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const modalImageRef = useRef(null);

  const handleModalImageLoad = useCallback(() => {
    if (!mountedRef.current) return;
    setModalState((prev) => ({ ...prev, imageLoaded: true }));
    setTimeout(() => {
      if (mountedRef.current) {
        setModalState((prev) => ({ ...prev, showContent: true }));
      }
    }, 100);
  }, []);

  const handleModalImageError = useCallback(() => {
    if (mountedRef.current) {
      setModalState((prev) => ({ ...prev, hasError: true, imageLoaded: false }));
    }
  }, []);

  const handleZoomIn = () => {
    setModalState((prev) => ({ ...prev, zoomLevel: Math.min(prev.zoomLevel + 0.5, 4) }));
  };

  const handleZoomOut = () => {
    setModalState((prev) => ({ ...prev, zoomLevel: Math.max(prev.zoomLevel - 0.5, 1) }));
  };

  const resetZoomAndPan = () => {
    setModalState((prev) => ({ ...prev, zoomLevel: 1, panX: 0, panY: 0 }));
  };

  // Pan and drag handlers (simplified, keeping your logic)
  const handleMouseDown = (e) => {
    if (modalState.zoomLevel > 1) {
      e.preventDefault();
      setModalState((prev) => ({ ...prev, isDragging: true }));
      dragStartRef.current = { x: e.clientX, y: e.clientY, panX: modalState.panX, panY: modalState.panY };
    }
  };

  const handleMouseMove = (e) => {
    if (!modalState.isDragging || modalState.zoomLevel <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setModalState((prev) => ({ ...prev, panX: dragStartRef.current.panX + dx, panY: dragStartRef.current.panY + dy }));
  };

  const handleMouseUp = () => {
    setModalState((prev) => ({ ...prev, isDragging: false }));
  };

  const handleWheel = (e) => {
    e.preventDefault();
    let newZoomLevel = modalState.zoomLevel;
    if (e.deltaY < 0) {
      newZoomLevel = Math.min(modalState.zoomLevel + 0.5, 4);
    } else {
      newZoomLevel = Math.max(modalState.zoomLevel - 0.5, 1);
    }
    setModalState((prev) => ({ ...prev, zoomLevel: newZoomLevel }));
  };

  // Keyboard and outside click handlers
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    const handleClickOutside = (event) => {
      if (!modalImageRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscKey);
    document.addEventListener("click", handleClickOutside, { capture: true }); // Use capture to avoid conflicts

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscKey);
      document.removeEventListener("click", handleClickOutside, { capture: true });
    };
  }, [onClose]);

  // Reset pan when zoom returns to 1
  useEffect(() => {
    if (modalState.zoomLevel === 1) {
      setModalState((prev) => ({ ...prev, panX: 0, panY: 0 }));
    }
  }, [modalState.zoomLevel]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300">
      <div className={`absolute inset-0 bg-black/90 ${modalState.imageLoaded ? "backdrop-blur-sm" : ""} transition-all duration-300`} />
      
      {/* Loading and Error states */}
           {!modalState.imageLoaded && !modalState.hasError && <ModalLoadingAnimation />}

      {modalState.hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-red-900/80 to-black/80">
          <p className="text-white text-lg font-semibold">Failed to load image</p>
        </div>
      )}

      {/* Modal Content */}
      <div
        ref={modalImageRef}
        className={`relative max-h-[95vh] max-w-[95vw] overflow-hidden rounded-2xl shadow-2xl ${modalState.showContent ? "animate-in zoom-in-95 duration-300" : "opacity-0"}`}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-3 rounded-full bg-gradient-to-br from-gray-700/80 to-gray-900/80 border border-white/20 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:from-red-500/90 hover:to-red-700/90 focus:outline-none focus:ring-2 focus:ring-red-400 active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {modalState.showContent && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center space-x-3 bg-gradient-to-br from-gray-800/80 to-gray-950/80 border border-white/15 rounded-full p-3 shadow-2xl">
            <button onClick={handleZoomOut} disabled={modalState.zoomLevel <= 1} className="p-2.5 rounded-full bg-gradient-to-br from-white/10 to-white/0 text-white shadow-md transition-all duration-300 hover:bg-gray-700 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button onClick={resetZoomAndPan} disabled={modalState.zoomLevel === 1 && modalState.panX === 0 && modalState.panY === 0} className="p-2.5 rounded-full bg-gradient-to-br from-white/10 to-white/0 text-white shadow-md transition-all duration-300 hover:bg-green-500/50 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button onClick={handleZoomIn} disabled={modalState.zoomLevel >= 4} className="p-2.5 rounded-full bg-gradient-to-br from-white/10 to-white/0 text-white shadow-md transition-all duration-300 hover:bg-blue-500 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
        <div ref={modalImageRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel} style={{ cursor: modalState.zoomLevel > 1 ? (modalState.isDragging ? "grabbing" : "grab") : "default", overflow: "hidden" }}>
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
            style={{ transform: `scale(${modalState.zoomLevel}) translate(${modalState.panX}px,${modalState.panY}px)`, transformOrigin: "center center" }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageModal;
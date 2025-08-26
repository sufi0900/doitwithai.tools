import React, { useState, useEffect } from "react";
import Image from "next/image";
import ImageModal from "./ImageModal"; // Your existing modal component
import LoadingAnimation from './LoadingAnimation'; // Import the new component

const OptimizedImage = ({
  src,
  alt,
  className = "",
  children,
  priority = false,
  blurDataURL,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  width,
  height,
  quality = 85,
  style,
  onClick,
  enableModal = true,
  ...restProps
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isImageReady, setIsImageReady] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Check if the window object is available (client-side)
    if (typeof window !== 'undefined') {
      const checkIsMobile = () => {
        // Use a standard mobile user-agent check or screen width
        const isMobileDevice = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
        setIsMobile(isMobileDevice);
      };

      checkIsMobile();
      window.addEventListener('resize', checkIsMobile);
      return () => window.removeEventListener('resize', checkIsMobile);
    }
  }, []);

  const handleImageLoad = () => setIsImageReady(true);
  const handleImageError = () => setImageError(true);

  const openModal = () => {
    // Only open the modal if it's enabled and not a mobile device
    if (enableModal && !imageError && !isMobile) {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (enableModal) {
      openModal();
    }
  };

  return (
    <>
      <div className="relative w-full overflow-hidden">
        {/* Simplified loading and error states */}
         {!isImageReady && !imageError && <LoadingAnimation />}

        <div onClick={handleClick} className={`relative group image-hover-container ${isImageReady && !imageError && enableModal && !isMobile ? "cursor-pointer" : ""}`}>
          <Image
            src={src}
            alt={alt}
            className={`${className} transition-opacity duration-300 ease-out ${isImageReady ? "opacity-100" : "opacity-0"}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            {...(width && height ? { width, height } : {})}
            quality={quality}
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            placeholder={blurDataURL ? "blur" : "empty"}
            blurDataURL={blurDataURL}
            sizes={sizes}
            style={style}
            {...restProps}
          />
        </div>
        {children}
      </div>

      {/* Conditionally render the modal only when it's open AND NOT a mobile device */}
      {isModalOpen && !isMobile && <ImageModal src={src} alt={alt} onClose={closeModal} />}

      {/* Mobile-specific modal-like view */}
      {isModalOpen && isMobile && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">
          <button onClick={closeModal} className="absolute top-4 right-4 z-50 p-3 rounded-full bg-red-500/90 text-white shadow-lg transition-all duration-300 hover:scale-110">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Image
            src={src}
            alt={alt}
            width={1000}
            height={1000}
            quality={100}
            priority
            className="w-full h-auto object-contain max-h-[95vh]"
          />
        </div>
      )}
    </>
  );
};

export default OptimizedImage;
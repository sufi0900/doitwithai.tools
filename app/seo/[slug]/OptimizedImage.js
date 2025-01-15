// OptimizedImage.jsx
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

const OptimizedImage = ({ src, alt, className = "", children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const imageRef = useRef(null);
  const modalRef = useRef(null);
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "50px 0px",
  });

  // Close modal when clicking outside the image
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

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
  }, [isModalOpen]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

 

  useEffect(() => {
    if (!inView) return;

    let observer;
    let progressInterval;

    const updateProgress = (progress) => {
      setLoadingProgress((current) =>
        Math.min(100, Math.max(current, progress))
      );
    };

    // Simulate initial progress based on network conditions
    if ("connection" in navigator) {
      const connection = navigator.connection;
      if (connection.downlink < 5) {
        updateProgress(20);
      }
    }

    // PerformanceObserver to track resource loading
    if ("PerformanceObserver" in window) {
      observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === src) {
            const progress = Math.min(
              90,
              (entry.transferSize / entry.encodedBodySize) * 100
            );
            updateProgress(progress);
          }
        });
      });

      observer.observe({ entryTypes: ["resource"] });
    }

    // Fallback simulation
    progressInterval = setInterval(() => {
      setLoadingProgress((current) =>
        current >= 90 ? 90 : current + Math.random() * 10
      );
    }, 200);

    return () => {
      if (observer) observer.disconnect();
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [inView, src]);

  return (
    <>
       <div ref={ref} className="relative w-full overflow-hidden">
      {isLoading && inView && (
        <>
          {/* Loading Skeleton */}
          <div className="absolute inset-0 bg-gray-300 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
          <svg class="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
        </svg>
          </div>

          {/* Loading Bar */}
          <div className="absolute top-0 left-0 h-2 bg-gray-200 w-full">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-primary rounded-full animate-pulse"
              style={{
                width: `${loadingProgress}%`,
                transition: "width 0.3s ease-out",
              }}
            />
          </div>
          </>
        )}

        {/* Clickable Image */}
        {inView && (
          <div onClick={openModal} className="cursor-zoom-in">
            <Image
              ref={imageRef}
              src={src}
              alt={alt}
              className={`${className} ${
                isLoading ? "opacity-0" : "opacity-100"
              } transition-opacity duration-300`}
              onLoadingComplete={() => {
                setLoadingProgress(100);
                setIsLoading(false);
              }}
              layout="responsive"
              width={500}
              height={500}
              quality={90}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/..."
            />
          </div>
        )}

        {/* Caption */}
        {children}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300">
          <div 
            ref={modalRef}
            className="relative max-h-[90vh] max-w-[90vw] overflow-auto"
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-50 p-2 rounded-full shadow-lg bg-neutral-900 hover:bg-gray-100 bg- transition-colors duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="red"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Image */}
            <Image
              src={src}
              alt={alt}
              className="z-40 w-auto h-auto max-h-[90vh] object-contain transform transition-transform duration-300 ease-out"
              width={1920}
              height={1080}
              quality={100}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default OptimizedImage;

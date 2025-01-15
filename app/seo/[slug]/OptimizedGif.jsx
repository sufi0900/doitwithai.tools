import React, { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

const OptimizedGif = ({ src, alt, caption, className = "" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const gifRef = useRef(null);
  const modalRef = useRef(null);
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "50px 0px",
  });

  useEffect(() => {
    if (inView) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setDimensions({
          width: img.width,
          height: img.height
        });
      };
    }
  }, [inView, src]);

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
  }, [isModalOpen]);

  useEffect(() => {
    if (!inView) return;

    let progressInterval;
    const updateProgress = (progress) => {
      setLoadingProgress((current) =>
        Math.min(100, Math.max(current, progress))
      );
    };

    if ("connection" in navigator) {
      const connection = navigator.connection;
      if (connection.downlink < 5) {
        updateProgress(20);
      }
    }

    progressInterval = setInterval(() => {
      setLoadingProgress((current) =>
        current >= 90 ? 90 : current + Math.random() * 10
      );
    }, 200);

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [inView]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Calculate aspect ratio padding
  const paddingTop = dimensions.height && dimensions.width 
    ? `${(dimensions.height / dimensions.width) * 100}%`
    : '56.25%'; // 16:9 default

  return (
    <>
      <div ref={ref} className="relative w-full overflow-hidden">
        <div style={{ paddingTop }} className="relative">
          {isLoading && inView && (
            <>
              <div className="absolute inset-0 bg-gray-300 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/>
                </svg>
              </div>
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

          {inView && (
            <div onClick={openModal} className="cursor-zoom-in absolute inset-0">
              <img
                ref={gifRef}
                src={src}
                alt={alt}
                className={`w-full h-full object-cover ${className} ${
                  isLoading ? "opacity-0" : "opacity-100"
                } transition-opacity duration-300`}
                onLoad={() => {
                  setLoadingProgress(100);
                  setIsLoading(false);
                }}
              />
            </div>
          )}
        </div>

        {caption && (
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {caption}
          </p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300">
          <div ref={modalRef} className="relative max-h-[90vh] max-w-[90vw]">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-50 p-2 rounded-full shadow-lg bg-neutral-900 hover:bg-gray-100 transition-colors duration-200"
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
            <img
              src={src}
              alt={alt}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default OptimizedGif;
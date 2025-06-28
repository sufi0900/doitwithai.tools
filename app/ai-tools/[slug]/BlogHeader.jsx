"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { urlForImage } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";
import ReadingProgressCircle from "@/app/ai-seo/[slug]/ReadingProgressCircle";
import { useInView } from "react-intersection-observer";
// import { useArticleCache } from "@/app/ai-learn-earn/[slug]/ArticleCacheContext"; // REMOVED: This context is for caching

const BlogHeader = ({ data, imgdesc, articleLoading = false }) => {
  // REMOVED: isRefreshing state and useArticleCache hook
  // const { isRefreshing } = useArticleCache();

  // Title loading states
  const [titleLoading, setTitleLoading] = useState(true);
  const [titleVisible, setTitleVisible] = useState(false);

  // Main image states
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [showStaticPlaceholder, setShowStaticPlaceholder] = useState(true);
  const [imageVisible, setImageVisible] = useState(false);

  // Keep track of the *previous* image ID/ref to know if the image itself changed
  const prevImageIdRef = useRef(null);

  const imageRef = useRef(null);
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "100px 0px",
  });

  // Effect for handling overall refresh/article loading
  useEffect(() => {
    // Only reset image loading states if the image itself changes,
    // OR if it's an initial load/major articleLoading event.
    const currentImageId = data?.mainImage?.asset?._ref;
    const imageChanged = currentImageId !== prevImageIdRef.current;

    // The logic here now solely depends on the `articleLoading` prop and `imageChanged`
    if (articleLoading || imageChanged) {
      setTitleLoading(true);
      setTitleVisible(false);

      setIsLoading(true);
      setLoadingProgress(0);
      setImageError(false);
      setShowStaticPlaceholder(true);
      setImageVisible(false);
    } else {
      // If the image itself didn't change and it's not a full article re-load,
      // try to keep the image visible if it was already loaded.
      setIsLoading(false); // Assume image is already loaded if not changed
      setImageVisible(true);
      setShowStaticPlaceholder(false);
    }

    // Update the ref for the next render
    prevImageIdRef.current = data?.mainImage?.asset?._ref;
  }, [articleLoading, data?.mainImage?.asset?._ref]); // isRefreshing is removed from dependencies

  // Title loading animation
  useEffect(() => {
    // isRefreshing check is removed
    if (data?.title && !articleLoading) {
      const titleTimer = setTimeout(() => {
        setTitleLoading(false);
        setTimeout(() => setTitleVisible(true), 100);
      }, 300);
      return () => clearTimeout(titleTimer);
    }
  }, [data?.title, articleLoading]); // isRefreshing is removed from dependencies

  // Hide static placeholder after delay
  useEffect(() => {
    // isRefreshing check is removed
    if (articleLoading) return;
    const timer = setTimeout(() => {
      setShowStaticPlaceholder(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [articleLoading]); // isRefreshing is removed from dependencies

  // Enhanced loading progress simulation
  useEffect(() => {
    // Only run simulation if the image is actually loading AND visible
    if (!inView || !isLoading || imageVisible) return;

    let progressInterval;
    progressInterval = setInterval(() => {
      setLoadingProgress((current) => {
        if (current >= 95) {
          clearInterval(progressInterval);
          return current;
        }
        return current + Math.random() * 15;
      });
    }, 150);
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [inView, isLoading, imageVisible]);

  // Show loading overlay when article is loading (no more "refreshing")
  const shouldShowLoadingOverlay = articleLoading && data;

  return (
     <div className="lg:-mx-5 w-full overflow-hidden rounded">
          <div className="lg:m-4">
            {/* Article refresh loading overlay */}
            {/* {shouldShowLoadingOverlay && ( */}
              <div className="relative mb-4">
                <div className="flex items-center justify-center py-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                  <span className="text-sm text-blue-600 dark:text-blue-400">Refreshing header content...</span>
                </div>
              </div>
      
    
            {/* Main content with opacity control during refresh */}
            <div className={`transition-opacity duration-500 ${shouldShowLoadingOverlay ? 'opacity-30' : 'opacity-100'}`}>
              
              {/* Enhanced Title Section */}
              <div className="mb-8 text-center lg:text-left relative">
                {/* Title Loading Skeleton */}
                {(titleLoading || shouldShowLoadingOverlay) && (
                  <div className="absolute inset-0 z-10">
                    <div className="space-y-4">
                      {/* Main title skeleton */}
                      <div className="animate-pulse">
                        <div className="h-12 md:h-16 lg:h-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg mb-4 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-gray-500/30 to-transparent animate-shimmer-fast" />
                        </div>
                        {/* Secondary line for longer titles */}
                        <div className="h-8 md:h-12 lg:h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg mb-6 w-4/5 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-gray-500/30 to-transparent animate-shimmer-fast" style={{ animationDelay: '0.5s' }} />
                        </div>
                      </div>
                      {/* Gradient line skeleton */}
                      <div className="w-24 h-1 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 mx-auto lg:mx-0 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                )}
    
                {/* Actual Title */}
                <div className={`transition-all duration-700 ease-out transform ${
                  titleVisible && !shouldShowLoadingOverlay 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-4 scale-95'
                }`}>
                  <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 md:text-5xl lg:text-6xl transition-all duration-300 hover:scale-[1.02] transform animate-text-shimmer">
                    {data?.title}
                  </h1>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto lg:mx-0 rounded-full animate-gradient-x"></div>
                </div>
              </div>
    
              <ReadingProgressCircle />
    
              {/* Enhanced Image Card */}
              <div className="card4 rounded-xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                <figure className="relative overflow-hidden">
                  <div ref={ref} className="overflow-hidden lg:aspect-[28/16] relative group">
                    
                    {/* Actual Image */}
                    {inView && (
                      <a href={urlForImage(data.mainImage).url()} aria-label={`View full image: ${data.title}`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                        <Image
                          ref={imageRef}
                          className={`h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-110 dark:brightness-90 ${
                            imageVisible && !isLoading ? "opacity-100 scale-100" : "opacity-0 scale-105"
                          }`}
                          src={urlForImage(data.mainImage).url()}
                          alt={data.mainImage.alt || `${data.title}`}
                          layout="responsive"
                          width={500}
                          height={500}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxofwCdABmX/9k="
                          onLoadingComplete={() => {
                            setLoadingProgress(100);
                            setTimeout(() => {
                              setIsLoading(false);
                              setTimeout(() => setImageVisible(true), 100);
                            }, 200);
                          }}
                          onError={() => {
                            setImageError(true);
                            setIsLoading(false);
                          }}
                        />
                      </a>
                    )}
    
                    {/* Enhanced Loading Skeleton */}
                    {(showStaticPlaceholder || (isLoading && inView && !imageError) || shouldShowLoadingOverlay) && (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 flex flex-col items-center justify-center rounded-lg overflow-hidden">
                        
                        {/* Multiple shimmer layers for depth */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-blue-100/30 dark:via-blue-900/30 to-transparent animate-shimmer-reverse" />
                        
                        {/* Floating particles effect */}
                        <div className="absolute inset-0 overflow-hidden">
                          {[...Array(6)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-2 h-2 bg-blue-400/20 dark:bg-blue-500/20 rounded-full animate-float"
                              style={{
                                left: `${20 + i * 15}%`,
                                animationDelay: `${i * 0.5}s`,
                                animationDuration: `${3 + i * 0.5}s`
                              }}
                            />
                          ))}
                        </div>
                        
                        {/* Central loading indicator */}
                        <div className="relative mb-4 z-10">
                          <div className="relative">
                            {/* Pulsing background circle */}
                            <div className="absolute inset-0 w-16 h-16 bg-blue-200 dark:bg-blue-800 rounded-full animate-ping opacity-20"></div>
                            
                            {/* Main icon */}
                            <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 animate-pulse relative z-10" fill="currentColor" viewBox="0 0 20 18">
                              <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
                            </svg>
                            
                            {/* Progress ring */}
                            <div className="absolute -inset-2">
                              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200 dark:text-gray-700"/>
                                <circle 
                                  cx="50" cy="50" r="45" 
                                  stroke="currentColor" 
                                  strokeWidth="6" 
                                  fill="none" 
                                  strokeLinecap="round" 
                                  className="text-blue-500 dark:text-blue-400 transition-all duration-300 ease-out drop-shadow-sm" 
                                  strokeDasharray={`${loadingProgress * 2.83} 283`}
                                  style={{
                                    filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))'
                                  }}
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        {/* Loading text with typewriter effect */}
                        <div className="text-center z-10">
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                            {shouldShowLoadingOverlay ? (
                              <span className="animate-pulse">Refreshing Header...</span>
                            ) : (
                              <span>Loading Main Image...</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center">
                              {Math.round(loadingProgress)}%
                              <div className="flex space-x-1 ml-2">
                                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
    
                    {/* Enhanced Error State */}
                    {imageError && !isLoading && !shouldShowLoadingOverlay && (
                      <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="relative mb-3">
                            <div className="absolute inset-0 w-12 h-12 bg-red-200 dark:bg-red-800 rounded-full animate-ping opacity-20"></div>
                            <svg className="w-12 h-12 text-red-400 dark:text-red-500 mx-auto relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                            </svg>
                          </div>
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium">Failed to load image</p>
                          <p className="text-xs text-red-500 dark:text-red-500 mt-1">Please try refreshing the page</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Image Description */}
                  <figcaption className={`custom anchor my-4 px-4 text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 py-3 rounded-b-xl transition-all duration-500 ${
                    imageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}>
                    <PortableText value={data.mainImage.imageDescription} components={imgdesc} />
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
    
          {/* Enhanced CSS Animations */}
          <style jsx>{`
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            @keyframes shimmer-fast {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            @keyframes shimmer-reverse {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
            @keyframes gradient-x {
              0%, 100% { background-size: 200% 200%; background-position: left center; }
              50% { background-size: 200% 200%; background-position: right center; }
            }
            @keyframes text-shimmer {
              0% { background-position: -200% center; }
              100% { background-position: 200% center; }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
              50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
            }
            
            .animate-shimmer {
              animation: shimmer 2s infinite linear;
            }
            .animate-shimmer-fast {
              animation: shimmer-fast 1.5s infinite linear;
            }
            .animate-shimmer-reverse {
              animation: shimmer-reverse 2.5s infinite linear;
            }
            .animate-gradient-x {
              animation: gradient-x 3s ease infinite;
            }
            .animate-text-shimmer {
              background-size: 200% auto;
              animation: text-shimmer 3s linear infinite;
            }
            .animate-float {
              animation: float 3s ease-in-out infinite;
            }
          `}</style>
        </div>
      );
    };
    
    export default BlogHeader;
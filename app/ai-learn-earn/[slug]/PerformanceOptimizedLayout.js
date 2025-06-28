// components/PerformanceOptimizedLayout.js
'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { useInView } from 'react-intersection-observer';

// Optimized components
const OptimizedImage = memo(({ src, alt, width, height, priority = false, className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: `${width}/${height}` }}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        quality={priority ? 90 : 75}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRNbOBTHZqcdFpIbHkqBRNKJpOJbjEEqd3zKCkFyoUqQ6ZFzBJJJJKkZJJJ/mRmBkBhcKzlE/j/pHBIJJJJJJJJJMIJJJHAIJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ/9k="
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        sizes={priority ? '100vw' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      />
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Lazy loading container for non-critical content
const LazyContainer = memo(({ children, threshold = 0.1 }) => {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: true,
    rootMargin: '50px 0px', // Start loading 50px before coming into view
  });

  return (
    <div ref={ref}>
      {inView ? children : <div className="h-32 bg-gray-100 animate-pulse rounded"></div>}
    </div>
  );
});

LazyContainer.displayName = 'LazyContainer';

// Optimized portable text components
const optimizedPortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      
      return (
        <LazyContainer>
          <OptimizedImage
            src={value.asset.url}
            alt={value.alt || 'Article image'}
            width={value.asset.metadata?.dimensions?.width || 800}
            height={value.asset.metadata?.dimensions?.height || 600}
            className="rounded-lg shadow-md my-6"
          />
        </LazyContainer>
      );
    },
    // Optimize other content types
    code: ({ value }) => (
      <LazyContainer>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto my-4">
          <code>{value.code}</code>
        </pre>
      </LazyContainer>
    ),
  },
  block: {
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        {children}
      </p>
    ),
  },
};

// Main layout component
const PerformanceOptimizedLayout = memo(({ data, slug }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    
    setReadingProgress(Math.min(progress, 100));
    setIsScrolled(scrollTop > 100);
  }, []);

  useEffect(() => {
    let ticking = false;
    
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [handleScroll]);

  // Prevent layout shift by reserving space
  const articleHeaderHeight = 'min-h-[400px]';
  const contentMinHeight = 'min-h-[800px]';

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Reading progress bar - Fixed position to prevent CLS */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-blue-600 transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Article header with reserved space */}
      <header className={`${articleHeaderHeight} mb-8`}>
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-4">
            {data.title}
          </h1>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-6">
            <time dateTime={data.publishedAt}>
              {new Date(data.publishedAt).toLocaleDateString()}
            </time>
            {data.readTime && (
              <>
                <span className="mx-2">•</span>
                <span>{data.readTime} min read</span>
              </>
            )}
            {data.author?.name && (
              <>
                <span className="mx-2">•</span>
                <span>By {data.author.name}</span>
              </>
            )}
          </div>

          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            {data.overview}
          </p>
        </div>

        {/* Hero image with LCP optimization */}
        {data.mainImage?.asset && (
          <OptimizedImage
            src={data.mainImage.asset.url}
            alt={data.mainImage.alt || data.title}
            width={data.mainImage.asset.metadata?.dimensions?.width || 1200}
            height={data.mainImage.asset.metadata?.dimensions?.height || 600}
            priority={true} // Critical for LCP
            className="rounded-lg shadow-lg"
          />
        )}
      </header>

      {/* Table of contents - Lazy loaded */}
      {data.tableOfContents && (
        <LazyContainer>
          <nav className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
            <ul className="space-y-2">
              {data.tableOfContents.map((item, index) => (
                <li key={index}>
                  <a 
                    href={`#${item.slug}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </LazyContainer>
      )}

      {/* Main content with reserved space */}
      <div className={`${contentMinHeight} prose prose-lg max-w-none dark:prose-invert`}>
        <PortableText
          value={data.content}
          components={optimizedPortableTextComponents}
        />
      </div>

      {/* FAQ section - Lazy loaded */}
      {data.faqs && data.faqs.length > 0 && (
        <LazyContainer>
          <section className="mt-12 mb-8">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {data.faqs.map((faq, index) => (
                <details key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <summary className="font-semibold cursor-pointer text-gray-900 dark:text-gray-100">
                    {faq.question}
                  </summary>
                  <div className="mt-3 text-gray-700 dark:text-gray-300">
                    <PortableText value={faq.answer} />
                  </div>
                </details>
              ))}
            </div>
          </section>
        </LazyContainer>
      )}

      {/* Tags section */}
      {data.tags && data.tags.length > 0 && (
        <LazyContainer>
          <div className="flex flex-wrap gap-2 mt-8">
            {data.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </LazyContainer>
      )}
    </article>
  );
});

PerformanceOptimizedLayout.displayName = 'PerformanceOptimizedLayout';

export default PerformanceOptimizedLayout;
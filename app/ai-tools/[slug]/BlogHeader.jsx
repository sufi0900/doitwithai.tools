import React, { useMemo } from "react";
import Image from "next/image";
import { urlForImage } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";
// import ReadingProgressCircle from "@/app/ai-seo/[slug]/ReadingProgressCircle";

// Optimized Portable Text component for image descriptions
const ImgDescPortableText = React.memo(({ value }) => {
  const components = useMemo(() => ({
    block: {
      normal: ({ children }) => {
        // More robust empty content check
        const hasContent = children.some(child => 
          typeof child === "string" ? child.trim() : true
        );
        
        if (!hasContent) return null;

        return (
          <p className="text-[11px] sm:text-xs md:text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-300 transition-colors duration-300 hover:text-gray-900 dark:hover:text-gray-100 m-0">
            {children}
          </p>
        );
      },
    },
    marks: {
      link: ({ children, value }) => {
        const isExternal = value.href && !value.href.startsWith('/');
        return (
          <a
            className="text-blue-600 dark:text-blue-400 font-medium transition-all duration-300 ease-in-out hover:text-blue-700 dark:hover:text-blue-300 bg-gradient-to-r from-current to-current bg-[length:100%_1.5px] bg-no-repeat bg-[position:0_100%] hover:bg-[length:0_1.5px] break-words"
            href={value.href}
            rel={isExternal ? 'noreferrer noopener' : undefined}
            target={isExternal ? '_blank' : undefined}
          >
            {children}
          </a>
        );
      },
    },
  }), []);

  return <PortableText value={value} components={components} />;
});

ImgDescPortableText.displayName = 'ImgDescPortableText';

// Enhanced loading skeleton component
const LoadingSkeleton = React.memo(() => (
  <div className="w-full animate-pulse">
    <div className="mb-6 sm:mb-8">
      <div className="h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 w-3/4"></div>
      <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full sm:w-24"></div>
    </div>
    <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';


const ArticleHeader = ({ data }) => {
  // Memoize image URLs to prevent recalculation on re-renders
  const imageUrls = useMemo(() => {
    if (!data?.mainImage) return null;
    
    return {
      main: urlForImage(data.mainImage)
        .quality(85)
        .format('webp')
        .url(),
      blur: urlForImage(data.mainImage)
        .width(20)
        .height(11)
        .blur(10)
        .quality(20)
        .format('webp')
        .url()
    };
  }, [data?.mainImage]);

  // Check if image description has actual content
  const hasImageDescription = useMemo(() => {
    if (!data?.mainImage?.imageDescription) return false;
    
    // More thorough content check for Portable Text
    return data.mainImage.imageDescription.some(block => 
      block.children?.some(child => 
        child.text && child.text.trim().length > 0
      )
    );
  }, [data?.mainImage?.imageDescription]);

  // Early return for loading state
  if (!data || !data.title || !data.mainImage) {
    return <LoadingSkeleton />;
  }

  return (
    <article className="w-full">
      {/* Article Title Section with improved typography */}
      <header className="mb-6 text-left sm:mb-8 lg:mb-10">
        <h1 className="mb-4 text-xl font-bold leading-[1.1] tracking-tight text-blue-600 dark:text-blue-400 sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl transition-colors duration-300 hover:text-blue-700 dark:hover:text-blue-300">
          {data.title}
        </h1>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full sm:w-24 transition-all duration-300 hover:w-20 sm:hover:w-28"></div>
      </header>



      {/* Main Image Section with enhanced responsiveness */}
      <section className="my-6 w-full sm:my-8 lg:my-10" aria-label="Article featured image">
        <div className="group relative isolate">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl transition-all duration-500 ease-out hover:shadow-2xl dark:from-gray-800 dark:to-gray-900">
            {/* Enhanced gradient border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 p-[1px] opacity-60 transition-opacity duration-300 group-hover:opacity-100">
              <div className="h-full w-full rounded-2xl bg-white dark:bg-gray-900" />
            </div>

            <div className="relative p-1 sm:p-2 lg:p-3">
              <figure className="relative">
                {/* Main Image Container with improved aspect ratio handling */}
                <div className="relative overflow-hidden rounded-xl shadow-lg">
                  <div className="relative aspect-[16/9] sm:aspect-[4/3] lg:aspect-[16/9]">
                    <Image
                      className="h-full w-full object-cover transition-transform duration-700 ease-out  will-change-transform"
                      src={imageUrls.main}
                      alt={data.mainImage.alt || `Featured image for ${data.title}`}
                      fill
                      priority
                      placeholder="blur"
                      blurDataURL={imageUrls.blur}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, (max-width: 1280px) 80vw, 70vw"
                      quality={85}
                    />
                    
                    {/* Enhanced overlay with better gradient */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    
                    {/* Corner accent for visual enhancement */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>

                {/* Enhanced Image Caption with better spacing and layout */}
                {hasImageDescription && (
                  <figcaption className="mt-3 rounded-xl border border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm px-3 py-2.5 sm:mt-4 sm:px-4 sm:py-3 md:px-5 md:py-4 dark:border-gray-700/60 dark:from-gray-800/80 dark:to-gray-900/80 transition-all duration-300 hover:shadow-md group-hover:border-gray-300/60 dark:group-hover:border-gray-600/60">
                    <div className="flex items-start gap-2 sm:gap-3">
                      {/* Icon container */}
                      <div className="flex-shrink-0 p-1 rounded-full bg-blue-100 dark:bg-blue-900/30 transition-colors duration-300">
                        <svg
                          className="h-3 w-3 text-blue-600 dark:text-blue-400 sm:h-3.5 sm:w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      
                      {/* Caption text container */}
                      <div className="min-w-0 flex-1">
                        <ImgDescPortableText value={data.mainImage.imageDescription} />
                      </div>
                    </div>
                  </figcaption>
                )}
              </figure>
            </div>
          </div>
          
          {/* Enhanced background glow effect */}
          <div className="absolute -inset-2 -z-10 rounded-2xl bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-pink-500/15 blur-2xl opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105" />
        </div>
      </section>
    </article>
  );
};

export default React.memo(ArticleHeader);
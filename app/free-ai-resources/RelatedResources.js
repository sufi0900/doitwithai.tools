// components/RelatedResources.js
import React from 'react';
import ResourceCard from './UnifiedResourceCard';
import ResourceSkeleton from './ResourceSkeleton';
import ResourceModalsProvider from './ResourceModalsProvider';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import the carousel to avoid SSR issues with window object
const DynamicResourceCarousel = dynamic(() => import('./ResourceCarousel'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-wrap -mx-2 sm:-mx-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="w-full sm:w-1/2 lg:w-1/3 px-2 sm:px-3 mb-4 sm:mb-6">
          <ResourceSkeleton />
        </div>
      ))}
    </div>
  ),
});

const RelatedResources = ({ resources, isLoading = false, slidesToShow = 2 }) => {
  // If loading, show skeletons
  if (isLoading) {
    return (
      <div className="py-6 sm:py-8 md:py-12 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Responsive heading with proper mobile sizing */}
          <h2 className="mb-4 sm:mb-6 mt-4 sm:mt-6 text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide text-black dark:text-white leading-tight">
            <span className="relative mr-1 sm:mr-2 inline-block">
              Related
              {/* Responsive underline */}
              <span className="absolute bottom-[-4px] sm:bottom-[-6px] md:bottom-[-8px] left-0 h-0.5 sm:h-1 w-full bg-blue-500"></span>
            </span>
            <span className="text-blue-500">Resources</span>
          </h2>
          
          {/* Responsive skeleton grid */}
          <div className="flex flex-wrap -mx-2 sm:-mx-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="w-full sm:w-1/2 lg:w-1/3 px-2 sm:px-3 mb-4 sm:mb-6">
                <ResourceSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
 
  // If no resources and not loading, don't render anything
  if (!resources || resources.length === 0) {
    return null;
  }

  return (
    <>
      <div className="container mx-auto px-3 sm:px-4">
        {/* Fully responsive flex container for the heading and button */}
        <div className="mb-6 sm:mb-8 mt-6 sm:mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-0">
          
          {/* Responsive heading with proper mobile typography */}
          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide text-black dark:text-white leading-tight">
            <span className="relative mr-1 sm:mr-2 inline-block">
              Related
              {/* Responsive underline that scales with text size */}
              <span className="absolute bottom-[-3px] xs:bottom-[-4px] sm:bottom-[-6px] md:bottom-[-8px] left-0 h-0.5 sm:h-1 w-full bg-blue-500"></span>
            </span>
            <span className="text-blue-500">Resources</span>
          </h2>
          
          {/* Responsive button with proper mobile sizing */}
          <Link href="/free-ai-resources" passHref>
            <span className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border-2 border-blue-500 bg-transparent px-4 sm:px-6 py-2 sm:py-2.5 text-center text-sm sm:text-base font-medium text-blue-500 transition-all duration-300 ease-in-out hover:bg-blue-500 hover:text-white min-h-[44px] sm:min-h-auto">
              <span className="truncate">Visit All Resources</span>
              <span className="ml-1 sm:ml-2 flex-shrink-0">➔</span>
            </span>
          </Link>
        </div>
        
        {/* Responsive carousel container with proper mobile margins */}
        <div className="-mx-2 sm:-mx-3">
          <DynamicResourceCarousel>
            {resources.map((resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                variant="carousel"
              />
            ))}
          </DynamicResourceCarousel>
        </div>
      </div>
      
      <ResourceModalsProvider resources={resources} />
    </>
  );
};

export default RelatedResources;
//components/RelatedResources.js
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
    <div className="flex flex-wrap -mx-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="w-full sm:w-1/2 lg:w-1/3 px-3 mb-6">
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
      <div className="py-12 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 mt-6 text-3xl font-bold tracking-wide text-black dark:text-white sm:text-4xl">
          <span className="relative mr-2 inline-block">
            Related
            <span className="absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
          </span>
          <span className="text-blue-500">Resources</span>
        </h2>
          <div className="flex flex-wrap -mx-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="w-full sm:w-1/2 lg:w-1/3 px-3 mb-6">
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
      <div className="container">
        <h2 className="mb-8 mt-8 text-3xl font-bold tracking-wide text-black dark:text-white sm:text-4xl">
          <span className="relative mr-2 inline-block">
            Related
            <span className="absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
          </span>
          <span className="text-blue-500">Resources</span>
        </h2>
        {/* FIX: Add a negative margin to the container to offset the card padding */}
        <div className="-mx-3">
          <DynamicResourceCarousel slidesToShow={slidesToShow}>
            {resources.map((resource) => (
              <ResourceCard 
                key={resource._id} 
                resource={resource} 
                wrapperClassName="h-full"
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

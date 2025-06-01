// components/RelatedResources.js
import React from 'react';
import ResourceCard from './RelatedesourceCard'; // Make sure this points to the correct file
import ResourceSkeleton from './ResourceSkeleton';
import ResourceCarousel from './ResourceCarousel'; // Import the new carousel component
import ResourceModalsProvider from './ResourceModalsProvider'; // Import our modals provider
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

const RelatedResources = ({ resources, isLoading = false }) => {
  // If loading, show skeletons
  if (isLoading) {
    return (
      <div className="py-12 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Related Resources</h2>
            <div className="w-16 h-1 bg-primary rounded mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl text-center">
              Explore more resources related to this article
            </p>
          </div>
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
      <section className="py-12 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Related Resources</h2>
            <div className="w-16 h-1 bg-primary rounded mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl text-center">
              Explore more resources related to this article
            </p>
          </div>
          
          {/* Carousel for resources */}
          <DynamicResourceCarousel>
            {resources.map((resource) => (
              <ResourceCard 
                key={resource._id} 
                resource={resource} 
                wrapperClassName="h-full"
              />
            ))}
          </DynamicResourceCarousel>
        </div>
      </section>
      
      <div className="mt-10 text-center">
          <Link href="/free-ai-resources" className="inline-flex items-center bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-md transition-colors">
            View All Resources
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </Link>
        </div>
      <ResourceModalsProvider resources={resources} />
    </>
  );
};

export default RelatedResources;
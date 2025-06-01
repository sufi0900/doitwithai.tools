import React, { useState, useEffect } from 'react';
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";

import dynamic from 'next/dynamic';

import ResourceCard from '@/app/free-ai-resources/RelatedesourceCard';
import Link from 'next/link';
import ResourceSkeleton from '@/app/free-ai-resources/ResourceSkeleton';
import ResourceModalsProvider from '@/app/free-ai-resources/ResourceModalsProvider';
const DynamicResourceCarousel = dynamic(() => import('@/app/free-ai-resources/ResourceCarousel'), {
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
const FeaturedResourcesHorizontal = ({ resource }) => {
  const [featuredResources, setFeaturedResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch featured resources on component mount
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const query = groq`*[_type == "freeResources" && isHomePageFeature == true] | order(publishedAt desc) {
          _id, title, slug, tags, mainImage, overview, resourceType, resourceFormat,
          resourceLink, resourceLinkType, content, publishedAt,
          "resourceFile": resourceFile.asset->,
          promptContent, previewSettings
        }`;
        const featuredData = await client.fetch(query);
        setFeaturedResources(featuredData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch featured resources", error);
        setIsLoading(false);
      }
    };
  
    fetchFeatured();
  }, []);


 
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Featured Resources</h2>
          <div className="w-16 h-1 bg-primary rounded mb-4"></div>
        </div>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (featuredResources.length === 0) {
    return null;
  }

 
  // Display for multiple featured resources
  return (
    <section className="py-16 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-10 text-center">
          <h2 className="text-3xl font-bold mb-2">Featured Resources</h2>
          <div className="w-20 h-1 bg-primary rounded mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
            Discover our curated collection of premium AI resources, templates, and tools
          </p>
        </div>
        <DynamicResourceCarousel>
            {featuredResources.map((resource) => (
              <ResourceCard 
                key={resource._id} 
                resource={resource} 
                wrapperClassName="h-full"
              />
            ))}
          </DynamicResourceCarousel>



        <div className="mt-10 text-center">
          <Link href="/free-ai-resources" className="inline-flex items-center bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-md transition-colors">
            View All Resources
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </Link>
        </div>
      </div>
      <ResourceModalsProvider resources={featuredResources} />

    </section>
  );
};

export default FeaturedResourcesHorizontal;
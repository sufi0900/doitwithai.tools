"use client";

import { useCachedSanityData } from '@/components/Blog/useSanityCache';
import React from 'react';
import Link from "next/link";
import groq from "groq";
import { CACHE_KEYS } from '@/components/Blog/cacheKeys';

const ReusableCachedSEOSubcategories = () => {
  const {
    data: subcategories,
    isLoading: isLoadingSubcategories,
    error: subcategoriesError,
  } = useCachedSanityData(
    CACHE_KEYS.SEO_SUBCATEGORIES,
    groq`*[_type == "seoSubcategory"]{title, slug, description}`,
    {
      componentName: "SEO-Subcategories",
      usePageContext: true
    }
  );

  if (isLoadingSubcategories) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="card p-6 bg-white border border-gray-200 rounded-lg shadow animate-pulse dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-4 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-300 rounded w-full mb-3 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-4 dark:bg-gray-700"></div>
            <div className="h-8 bg-blue-300 rounded w-1/3 dark:bg-blue-700"></div>
          </div>
        ))}
      </div>
    );
  }

  if (subcategoriesError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load subcategories.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {subcategories?.map((subcategory) => (
        <Link
          href={`/ai-seo/categories/${subcategory.slug.current}`}
          key={subcategory.slug.current}
          className="card hover:shadow-lg mt-4 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:scale-[1.03] max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow"
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            {subcategory.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            {subcategory.description}
          </p>
          <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            Read more
            <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
            </svg>
          </button>
        </Link>
      ))}
    </div>
  );
};

export default ReusableCachedSEOSubcategories;
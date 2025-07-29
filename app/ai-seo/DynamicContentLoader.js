// components/DynamicContentLoader.js
"use client";
import React, { useState, useEffect } from 'react';
import BlogListingPageContent from "@/app/ai-tools/AllBlogs";

export default function DynamicContentLoader({
  schemaType,
  pageSlugPrefix,
  pageTitle,
  pageTitleHighlight,
  pageDescription,
  breadcrumbProps,
  showSubcategoriesSection,
  subcategoriesSectionTitle,
  subcategoriesSectionDescription,
  SubcategoriesComponent,
  subcategoriesLimit,
  serverData // This will be null initially
}) {
  const [dynamicData, setDynamicData] = useState(serverData);
  const [isLoading, setIsLoading] = useState(!serverData);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we already have server data, don't fetch again
    if (serverData) {
      setDynamicData(serverData);
      setIsLoading(false);
      return;
    }

    // Fetch dynamic data
    const fetchDynamicData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/blog-data/${schemaType}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setDynamicData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dynamic data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure static content renders first
    const timer = setTimeout(fetchDynamicData, 100);
    return () => clearTimeout(timer);
  }, [schemaType, serverData]);

  // Show loading state
  if (isLoading) {
    return null; // Static shell is already showing skeletons
  }

  // Show error state
  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-8 shadow-xl dark:bg-red-900/20">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-400">
            Error Loading Content
          </h3>
          <p className="mt-2 text-red-600 dark:text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render the full dynamic content
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
      <BlogListingPageContent
        schemaType={schemaType}
        pageSlugPrefix={pageSlugPrefix}
        pageTitle={pageTitle}
        pageTitleHighlight={pageTitleHighlight}
        pageDescription={pageDescription}
        breadcrumbProps={breadcrumbProps}
        serverData={dynamicData}
        showSubcategoriesSection={showSubcategoriesSection}
        subcategoriesSectionTitle={subcategoriesSectionTitle}
        subcategoriesSectionDescription={subcategoriesSectionDescription}
        SubcategoriesComponent={SubcategoriesComponent}
        subcategoriesLimit={subcategoriesLimit}
      />
    </div>
  );
}
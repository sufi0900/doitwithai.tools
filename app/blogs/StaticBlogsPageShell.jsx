// components/Common/StaticBlogsPageShell.jsx
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import React from 'react';

export default function StaticBlogsPageShell({ initialServerData, children }) {
  // Determine current count for display in Hero Section Stats Bar
  // This value is based on the initial server fetch, so it can be rendered instantly.
  const currentDisplayCount = initialServerData?.totalCount || 0;

  return (
    // Adjusted background gradient to emphasize blue and indigo
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950/30">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">

        <div className="mb-6 sm:mb-8 flex justify-end">
          <div className="rounded-lg bg-white p-2 shadow-lg dark:bg-gray-800">
            {/* <PageCacheStatusButton /> */}
          </div>
        </div>

        {/* Hero Section - Fully Responsive */}
        <section className="text-center mb-12 sm:mb-16 lg:mb-20">
          {/* Title with proper spacing and responsive text sizes */}
          <h1 className="mb-4 sm:mb-6 text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
            {/* First part with proper margin/spacing */}
            <span className="relative inline-block mr-2 sm:mr-3 md:mr-4">
              AI-Powered
              {/* Responsive highlight bar */}
              <span className="absolute bottom-0 left-0 h-1 xs:h-1.5 sm:h-2 md:h-2.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></span>
            </span>
            <br className="block xs:hidden" />
            {/* Second part with gradient text */}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Blog Hub
            </span>
          </h1>
          
          {/* Description with better responsive text sizing */}
          <p className="mx-auto max-w-2xl sm:max-w-3xl lg:max-w-4xl px-4 sm:px-6 text-sm xs:text-base sm:text-lg md:text-xl lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed sm:leading-relaxed md:leading-relaxed">
Discover advanced AI insights and actionable articles across all of our AI-powered categories. Get the latest human-AI workflows and strategies for mastering content creation, modern SEO (GEO/AEO), and scaling your business. This is your complete resource hub for transforming your work and achieving superior results with AI.          </p>

          {/* Stats Bar - Fully Responsive Layout */}
          <div className="mt-6 sm:mt-8 md:mt-10 flex flex-col xs:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            <div className="text-center min-w-[80px]">
              <div className="text-xl xs:text-2xl sm:text-3xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{currentDisplayCount}+</div>
              <div className="text-xs xs:text-sm text-gray-600 dark:text-gray-400 mt-1">Articles</div>
            </div>
            <div className="text-center min-w-[80px]">
              <div className="text-xl xs:text-2xl sm:text-3xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">4</div>
              <div className="text-xs xs:text-sm text-gray-600 dark:text-gray-400 mt-1">Categories</div>
            </div>
            <div className="text-center min-w-[80px]">
              <div className="text-xl xs:text-2xl sm:text-3xl md:text-3xl font-bold text-teal-600 dark:text-teal-400">Weekly</div>
              <div className="text-xs xs:text-sm text-gray-600 dark:text-gray-400 mt-1">Updates</div>
            </div>
          </div>
        </section>

        {/* The dynamic client component content will be rendered here */}
        {children}

      </div>
    </div>
  );
}
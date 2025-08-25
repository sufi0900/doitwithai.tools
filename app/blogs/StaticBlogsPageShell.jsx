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

      <div className="container mx-auto px-4 py-12">

        <div className="mb-8 flex justify-end">
          <div className="rounded-lg bg-white p-2 shadow-lg dark:bg-gray-800">
            {/* <PageCacheStatusButton /> */}
          </div>
        </div>

        {/* Hero Section - New Styling */}
        <section className="text-center mb-16">
          <h1 className="mb-6 text-3xl xs:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white">
            <span className="relative inline-block md:mr-3">
              AI-Powered
              {/* Highlight now uses main blue and secondary indigo */}
              <span className="absolute bottom-0 left-0 h-1.5 xs:h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></span>
            </span>
            {/* Text gradient now uses main blue and secondary indigo */}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Blog Hub
            </span>
          </h1>
          <p className="mx-auto max-w-3xl text-base xs:text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Discover cutting-edge AI insights and articles across our AI-powered categories. Get the best AI tools, SEO strategies, coding techniques, and monetization opportunities. It's your complete resource for mastering AI in the digital world.
          </p>

          {/* Stats Bar - Adjusted colors for better consistency */}
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentDisplayCount}+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Articles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">4</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">Weekly</div> {/* Kept a vibrant color for contrast */}
              <div className="text-sm text-gray-600 dark:text-gray-400">Updates</div>
            </div>
          </div>
        </section>

        {/* The dynamic client component content will be rendered here */}
        {children}

      </div>
    </div>
  );
}
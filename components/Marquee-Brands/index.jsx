/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";

const Marquee = () => {
  const [brands, setBrands] = useState([]); // State to store fetched brands data

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const query = `*[_type == "brands"]`; // Fetch all documents of type 'brands'
        const data = await client.fetch(query); // Fetch data from Sanity
        setBrands(data); // Set fetched data to state
      } catch (error) {
        console.error("Failed to fetch brands data:", error);
      }
    };

    fetchBrands(); // Fetch brands data on component mount
  }, []);

  const AiTools = ({ brand, index }) => (
    <div className="inline-flex min-w-max">
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-gray-50 to-gray-100 p-3 shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 dark:hover:shadow-blue-400/20 sm:p-4">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-cyan-400/10" />
        
        {/* Animated border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 p-[1px] opacity-0 transition-opacity duration-500 group-hover:opacity-30">
          <div className="h-full w-full rounded-2xl bg-white dark:bg-gray-800" />
        </div>
        
        <div className="relative flex items-center space-x-3 sm:space-x-4">
          {/* Enhanced image container */}
          <div className="relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <img
              src={brand.image}
              alt={`${brand.title} logo`}
              className="h-12 w-12 rounded-xl object-cover transition-transform duration-500 group-hover:scale-110 sm:h-16 sm:w-16"
            />
            {/* Sparkle effect */}
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:animate-pulse" />
          </div>
          
          {/* Content section */}
          <div className="flex min-w-0 flex-col justify-center">
            <h3 className="mb-1 text-base font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 sm:text-lg">
              {brand.title}
            </h3>
            <p className="text-xs font-medium leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-700 dark:text-gray-300 dark:group-hover:text-gray-200 sm:text-sm">
              {brand.subtitle}
            </p>
            
            {/* AI-themed accent line */}
            <div className="mt-2 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 group-hover:w-full" />
          </div>
          
          {/* AI-themed icon overlay */}
          <div className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="relative border-b border-body-color/[.15] pb-8 dark:border-white/[.15] md:pb-10 lg:pb-12 lg:mt-16 mt-10 ">
        {/* Section header */}
        <h1 className="mb-8 text-2xl font-bold tracking-wide text-black dark:text-white md:text-3xl lg:text-4xl">
            <span className="group inline-block cursor-pointer">
              <span className="relative text-blue-500">AI Tools We Use
                <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
              </span>
              {" "}
              <span className="relative inline-block"> & Recommend
                <span className="underline-span absolute bottom-[-8px] left-0 h-1 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </span>
          </h1>

        {/* Enhanced gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/10" />
        
        {/* First marquee row */}
        <div className="relative overflow-hidden">
          <div className="animate-marquee hover:pause-marquee flex space-x-4 lg:space-x-8 whitespace-nowrap pb-4 pt-4">
            {brands.map((brand, index) => (
              <AiTools key={`row1-${index}`} brand={brand} index={index} />
            ))}
            {/* Duplicate for seamless loop */}
            {brands.map((brand, index) => (
              <AiTools key={`row1-dup-${index}`} brand={brand} index={index} />
            ))}
          </div>
          
          {/* Fade effect at edges */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 sm:w-32" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 sm:w-32" />
        </div>
        
        {/* Second marquee row (reverse direction) */}
        <div className="relative overflow-hidden">
          <div className="animate-marquee-reverse hover:pause-marquee flex space-x-4 lg:space-x-8 whitespace-nowrap py-4">
            {brands.map((brand, index) => (
              <AiTools key={`row2-${index}`} brand={brand} index={index} />
            ))}
            {/* Duplicate for seamless loop */}
            {brands.map((brand, index) => (
              <AiTools key={`row3-dup-${index}`} brand={brand} index={index} />
            ))}
          </div>
          
          {/* Fade effect at edges */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 sm:w-32" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 sm:w-32" />
        </div>

      </div>
    </div>
  );
};

export default Marquee;
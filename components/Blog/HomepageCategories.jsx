"use client";

import React from 'react';
import {
  Search,
  Code,
  BookOpen,
  Wrench,
  ArrowRight,
  Download, // Icon for Free AI Resources
} from 'lucide-react';

export default function HomepageCategories() {
  // Reordered categories to match the desired display layout
  // Updated gradients to provide more visual variety as requested.
  const categories = [
    {
      id: 'ai-seo',
      title: 'AI SEO Mastery',
      description: 'Boost your search rankings with cutting-edge AI tools and strategies.',
      icon: Search,
      link: '/ai-seo',
      gradientFrom: 'from-blue-700', // Deep blue for primary category
      gradientTo: 'to-blue-900',
      tagColor: 'text-blue-200', // Light text for dark gradient backgrounds
    },
    {
      // Placed here for the second row's desired order: AI Tools, AI Learn & Earn, AI Code
      id: 'ai-tools',
      title: 'AI Tools Collection',
      description: 'Discover and master powerful AI tools for productivity, creativity, and business growth.',
      icon: Wrench, // Using Wrench for tools
      link: '/ai-tools',
      gradientFrom: 'from-purple-600', // Distinct color for middle category
      gradientTo: 'to-fuchsia-700',
      tagColor: 'text-purple-100',
    },
    {
      id: 'ai-learn-earn',
      title: 'AI Learn & Earn',
      description: 'Unlock new income streams and master AI skills for freelancing and products.',
      icon: BookOpen, // Using BookOpen for learning
      link: '/ai-learn-earn',
      gradientFrom: 'from-orange-500', // Distinct color for middle category
      gradientTo: 'to-red-600',
      tagColor: 'text-orange-100',
    },
    {
      id: 'ai-code',
      title: 'AI Code Assistant',
      description: 'Accelerate development with AI-powered code generation, debugging, and optimization.',
      icon: Code,
      link: '/ai-code',
      gradientFrom: 'from-emerald-500', // Distinct color for middle category
      gradientTo: 'to-teal-600',
      tagColor: 'text-emerald-100',
    },
    {
      id: 'free-ai-resources',
      title: 'Free AI Resources',
      description: 'Access an extensive library of free AI assets including prompts, templates, and more.',
      icon: Download,
      link: '/free-ai-resources',
      // Updated to use a blue gradient, removing the dark mode white background
      gradientFrom: 'from-blue-600',
      gradientTo: 'to-blue-800',
      // Adjusted text and icon colors for better contrast on the new blue background
      tagColor: 'text-blue-100',
      iconColor: 'text-white',
    },
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900 font-inter"> {/* Section wrapper with light/dark background */}
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Explore Our AI <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Categories</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Dive into our curated sections to find exactly what you need to master artificial intelligence.
          </p>
        </div>

        {/* Grid layout with responsive column spanning */}
        {/* On small screens, items stack (grid-cols-1). */}
        {/* On medium screens, 2 columns (md:grid-cols-2). AI SEO and Free Resources span both. */}
        {/* On large screens, 3 columns (lg:grid-cols-3). AI SEO and Free Resources span all three. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            // Apply conditional col-span based on category ID for responsive layout
            <a
              key={category.id}
              href={category.link}
              className={`${
                (category.id === 'ai-seo' || category.id === 'free-ai-resources')
                  ? 'md:col-span-2 lg:col-span-3' // Full width on md and lg screens
                  : 'md:col-span-1 lg:col-span-1' // Occupy one column on md and lg screens
              } flex`} // Use flex to ensure content within card takes full height for consistent card heights
            >
              <div
                className={`relative group h-full w-full p-6 rounded-2xl cursor-pointer
                           bg-gradient-to-br ${category.gradientFrom} ${category.gradientTo}
                           shadow-lg transition-all duration-300 hover:scale-[1.03]
                           overflow-hidden transform flex flex-col`} // Added flex flex-col to push content to bottom
              >
                {/* Background glow/shimmer effect on hover */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-10
                              bg-gradient-to-br ${category.gradientFrom.replace('from-', 'from-')}/40 ${category.gradientTo.replace('to-', 'to-')}/40
                              transition-opacity duration-300 blur-xl`}
                ></div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      {/* Dynamically apply icon color for 'Free AI Resources' */}
                      <category.icon className={`w-7 h-7 ${category.id === 'free-ai-resources' ? category.iconColor : 'text-white'}`} />
                    </div>
                  </div>

                  {/* Updated heading color for 'Free AI Resources' to ensure visibility in both light and dark modes */}
                  {/* Changed the heading color for 'Free AI Resources' to 'text-white' for dark backgrounds and 'dark:text-black' for light backgrounds */}
                  <h3 className={`text-xl font-bold ${category.id === 'free-ai-resources' ? 'text-white' : 'text-white'} mb-3`}>
                    {category.title}
                  </h3>
                  <p className={`${category.tagColor} mb-6 flex-grow leading-relaxed text-sm`}>
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto"> {/* mt-auto pushes to bottom */}
                    <span className={`${category.tagColor} text-sm font-medium`}>
                      Explore Now
                    </span>
                    <ArrowRight className={`${category.id === 'free-ai-resources' ? 'text-blue-100' : 'text-white'} transform group-hover:translate-x-1 transition-transform duration-300`} />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

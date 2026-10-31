//components/HomepageCategories.js
"use client";

import React from 'react';
import Link from 'next/link';
import {
  Search,
  Code,
  BookOpen,
  Wrench,
  ArrowRight,
  Download,
  BookText,
  Sparkles,
} from 'lucide-react';
import Breadcrumb from '../Common/Breadcrumb';

export default function HomepageCategories() {
  const categories = [
    {
      id: 'ai-seo',
      title: 'AI SEO Mastery',
      description: 'AI is revolutionizing SEO by transforming how we optimize content, analyze search trends, and improve site visibility. Discover smarter, faster ways to boost your rankings and stay ahead in the ever-changing search landscape.',
      icon: Search,
      link: '/ai-seo',
      iconColor: 'text-blue-600 dark:text-blue-400', // Your brand blue
      featured: true,
    },
    {
      id: 'ai-tools',
      title: 'AI Tools Collection',
      description: 'Explore a handpicked collection of versatile AI tools designed to support everything from daily productivity and creative work to smarter SEO, marketing, and content optimization.',
      icon: Wrench,
      link: '/ai-tools',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'ai-learn-earn',
      title: 'AI Learn & Earn',
      description: 'Learn essential AI skills and turn them into income—freelance smarter, build digital products, or start an AI side hustle with practical tutorials and real use cases.',
      icon: BookOpen,
      link: '/ai-learn-earn',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      id: 'ai-code',
      title: 'AI Code Assistant',
      description: 'Use AI to write, refactor, and debug code faster. Explore AI tools that assist with logic building, documentation, and deploying efficient solutions in less time.',
      icon: Code,
      link: '/ai-code',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
  ];

  const specialCategories = [
    {
      id: 'free-ai-resources',
      title: 'Free AI Resources',
      description: 'Access our extensive library of free AI assets including prompts, templates, and productivity tools.',
      icon: Download,
      link: '/free-ai-resources',
      iconColor: 'text-teal-600 dark:text-teal-400',
      badge: 'FREE',
      badgeColor: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
    },
    {
      id: 'explore-all-blogs',
      title: 'Explore All Blogs',
      description: 'Dive into our complete collection of articles, guides, and insights on AI technology.',
      icon: BookText,
      link: '/blogs',
      iconColor: 'text-orange-600 dark:text-orange-400',
      badge: 'NEW',
      badgeColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
    }
  ];

  // Enhanced Card component with transparent background
  const CategoryCard = ({ category }) => (
    <Link href={category.link} className="flex h-full w-full group">
      <div
        className={`relative h-full w-full p-6 rounded-2xl cursor-pointer
                   bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                   border border-gray-200/50 dark:border-gray-700/50
                   shadow-lg hover:shadow-2xl transition-all duration-500 ease-out
                   overflow-hidden transform flex flex-col
                   ${category.featured ? 'ring-2 ring-blue-400/30 dark:ring-blue-500/30' : ''}
                   group-hover:bg-white/90 dark:group-hover:bg-gray-800/90
                   group-hover:border-gray-300/70 dark:group-hover:border-gray-600/70`}
      >
        {/* Animated shimmer effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100
                     bg-gradient-to-r from-transparent via-blue-500/10 to-transparent
                     transition-opacity duration-700 ease-out
                     translate-x-[-100%] group-hover:translate-x-[100%]
                     transform transition-transform duration-1000 ease-out"
          style={{
            maskImage: 'linear-gradient(90deg, transparent, black, transparent)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent, black, transparent)',
          }}
        ></div>

        {/* Subtle glow effect on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-10
                     bg-gradient-to-br from-blue-500/20 to-purple-500/20
                     transition-opacity duration-500 blur-xl scale-110"
        ></div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-100/80 dark:bg-gray-700/80 rounded-xl backdrop-blur-sm 
                           transform group-hover:scale-110 group-hover:rotate-3 
                           transition-all duration-300 ease-out
                           group-hover:bg-gray-100 dark:group-hover:bg-gray-700">
              <category.icon className={`w-7 h-7 ${category.iconColor} drop-shadow-sm transition-colors duration-300`} />
            </div>
            
            {/* Badge for special categories */}
            {category.badge && (
              <div className={`inline-flex items-center justify-center text-xs font-bold 
                           ${category.badgeColor} rounded-full px-3 py-1
                           backdrop-blur-sm border
                           animate-pulse`}>
                {category.badge === 'FREE' && <Download className="w-3 h-3 mr-1" />}
                {category.badge === 'NEW' && <Sparkles className="w-3 h-3 mr-1" />}
                {category.badge}
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 
                        group-hover:text-blue-600 dark:group-hover:text-blue-400 
                        transition-colors duration-300">
            {category.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 group-hover:text-gray-700 
                       dark:group-hover:text-gray-200 mb-6 flex-grow 
                       leading-relaxed text-sm transition-colors duration-300">
            {category.description}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <span className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 
                           dark:group-hover:text-blue-300 text-sm font-medium
                           transition-colors duration-300">
              Explore Now
            </span>
            <div className="flex items-center space-x-2">
              <ArrowRight className="text-blue-600 dark:text-blue-400 w-5 h-5 transform 
                                   group-hover:translate-x-2 group-hover:scale-110
                                   group-hover:text-blue-700 dark:group-hover:text-blue-300
                                   transition-all duration-300 ease-out" />
            </div>
          </div>
        </div>

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full
                       transform group-hover:scale-150 transition-transform duration-500"></div>
      </div>
    </Link>
  );

  return (
    <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900 font-inter relative">
      {/* Background pattern - Adjusted to be more subtle and use theme colors */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"></div>
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`,
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Breadcrumb */}
        <Breadcrumb
          pageName="Navigate All Our"
          pageName2="AI Categories"
          description="Navigate through focused sections covering SEO, coding, productivity tools, learning resources, and more—all designed to level up your AI journey."
          firstlinktext="Home"
          firstlink="/"
          link="/navigation"
          linktext="Categories"
        />

        {/* Main categories with enhanced layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`${
                category.id === 'ai-seo' 
                  ? 'md:col-span-2 lg:col-span-3' 
                  : 'md:col-span-1 lg:col-span-1'
              } flex`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <CategoryCard category={category} />
            </div>
          ))}
        </div>

        {/* Special categories section with improved spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {specialCategories.map((category, index) => (
            <div 
              key={category.id} 
              className="flex"
              style={{
                animationDelay: `${(categories.length + index) * 100}ms`,
              }}
            >
              <CategoryCard category={category} />
            </div>
          ))}
        </div>

       
      </div>
    </section>
  );
}
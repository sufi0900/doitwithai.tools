// components/HomepageCategories.js
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
import Breadcrumb from '../Common/Breadcrumb'; // Assuming this is your custom Breadcrumb component

export default function HomepageCategories() {
  const categories = [
    {
      id: 'ai-seo',
      title: 'AI SEO Mastery',
      description: 'AI is revolutionizing SEO by transforming how we optimize content, analyze search trends, and improve site visibility. Discover smarter, faster ways to boost your rankings and stay ahead in the ever-changing search landscape.',
      icon: Search,
      link: '/ai-seo',
      bgGradient: 'from-blue-600 to-blue-800', // Primary brand blue - matches hero
      hoverGradient: 'group-hover:from-blue-700 group-hover:to-blue-900',
      iconBg: 'bg-white/20', // White/transparent for primary card
      shimmer: 'from-blue-400/20 via-white/30 to-blue-400/20',
      featured: true,
    },
    {
      id: 'ai-tools',
      title: 'AI Tools Collection',
      description: 'Explore a handpicked collection of versatile AI tools designed to support everything from daily productivity and creative work to smarter SEO, marketing, and content optimization.',
      icon: Wrench,
      link: '/ai-tools',
      bgGradient: 'from-purple-600 to-purple-800', // Consistent purple from hero badges
      hoverGradient: 'group-hover:from-purple-700 group-hover:to-purple-900',
      iconBg: 'bg-purple-100/30',
      shimmer: 'from-purple-400/20 via-white/30 to-purple-400/20',
    },
    {
      id: 'ai-learn-earn',
      title: 'AI Learn & Earn',
      description: 'Learn essential AI skills and turn them into income—freelance smarter, build digital products, or start an AI side hustle with practical tutorials and real use cases.',
      icon: BookOpen,
      link: '/ai-learn-earn',
      bgGradient: 'from-green-600 to-green-800', // Consistent green from hero badges
      hoverGradient: 'group-hover:from-green-700 group-hover:to-green-900',
      iconBg: 'bg-green-100/30',
      shimmer: 'from-green-400/20 via-white/30 to-green-400/20',
    },
    {
      id: 'ai-code',
      title: 'AI Code Assistant',
      description: 'Use AI to write, refactor, and debug code faster. Explore AI tools that assist with logic building, documentation, and deploying efficient solutions in less time.',
      icon: Code,
      link: '/ai-code',
       bgGradient: 'from-gray-700 to-gray-800', // Less dark gray for code, blending more
      hoverGradient: 'group-hover:from-gray-800 group-hover:to-gray-900',
      iconBg: 'bg-white/20',
      shimmer: 'from-indigo-400/20 via-white/30 to-indigo-400/20',
    },
  ];

  const specialCategories = [
    {
      id: 'free-ai-resources',
      title: 'Free AI Resources',
      description: 'Access our extensive library of free AI assets including prompts, templates, and productivity tools.',
      icon: Download,
      link: '/free-ai-resources',
    bgGradient: 'from-sky-500 to-blue-600', // A lighter blue family, distinct from main blue
      hoverGradient: 'group-hover:from-sky-600 group-hover:to-blue-700',
      iconBg: 'bg-white/20', // White/transparent for a clean look
      shimmer: 'from-orange-400/20 via-white/30 to-orange-400/20',
      badge: 'FREE',
    },
    {
      id: 'explore-all-blogs',
      title: 'Explore All Blogs',
      description: 'Dive into our complete collection of articles, guides, and insights on AI technology.',
      icon: BookText,
      link: '/blogs',
      bgGradient: 'from-teal-600 to-teal-800', // Deeper teal, provides better contrast for white text
      hoverGradient: 'group-hover:from-teal-700 group-hover:to-teal-900',
      iconBg: 'bg-white/20',
      shimmer: 'from-teal-400/20 via-white/30 to-teal-400/20',
      badge: 'NEW',
    }
  ];

  // Enhanced Card component with improved hover effects
  const CategoryCard = ({ category }) => (
    <Link href={category.link} className="flex h-full w-full group">
      <div
        className={`relative h-full w-full p-6 rounded-2xl cursor-pointer
                   bg-gradient-to-br ${category.bgGradient} ${category.hoverGradient}
                   shadow-lg hover:shadow-2xl transition-all duration-500 ease-out
                   overflow-hidden transform flex flex-col
                   ${category.featured ? 'ring-2 ring-blue-400/50' : ''}
                   backdrop-blur-sm border border-white/10 dark:border-white/5`}
      >
        {/* Animated shimmer effect */}
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100
                      bg-gradient-to-r ${category.shimmer}
                      transition-opacity duration-700 ease-out
                      translate-x-[-100%] group-hover:translate-x-[100%]
                      transform `}
          style={{
            maskImage: 'linear-gradient(90deg, transparent, black, transparent)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent, black, transparent)',
          }}
        ></div>

        {/* Glow effect on hover */}
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-20
                      bg-gradient-to-br ${category.bgGradient}
                      transition-opacity duration-500 blur-xl scale-110`}
        ></div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 ${category.iconBg} rounded-xl backdrop-blur-sm 
                           transform group-hover:scale-110 group-hover:rotate-3 
                           transition-all duration-300 ease-out`}>
              <category.icon className="w-7 h-7 text-white drop-shadow-sm" />
            </div>
            
            {/* Badge for special categories */}
            {category.badge && (
              <div className="inline-flex items-center justify-center text-xs font-bold 
                           text-white bg-white/20 rounded-full px-3 py-1
                           backdrop-blur-sm border border-white/30
                           animate-pulse">
                {category.badge === 'FREE' && <Download className="w-3 h-3 mr-1" />}
                {category.badge === 'NEW' && <Sparkles className="w-3 h-3 mr-1" />}
                {category.badge}
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-white mb-3 
                        group-hover:text-white/95 transition-colors duration-300">
            {category.title}
          </h3>
          
          <p className="text-white/80 group-hover:text-white/90 mb-6 flex-grow 
                       leading-relaxed text-sm transition-colors duration-300">
            {category.description}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <span className="text-white/90 group-hover:text-white text-sm font-medium
                           transition-colors duration-300">
              Explore Now
            </span>
            <div className="flex items-center space-x-2">
              <ArrowRight className="text-white w-5 h-5 transform 
                                   group-hover:translate-x-2 group-hover:scale-110
                                   transition-all duration-300 ease-out" />
            </div>
          </div>
        </div>

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-bl-full
                       transform group-hover:scale-150 transition-transform duration-500"></div>
      </div>
    </Link>
  );

  return (
    <section className="py-12 md:py-16 font-inter relative">
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
          {categories.map((category) => (
            <div key={category.id} className={`${
                category.id === 'ai-seo' 
                  ? 'md:col-span-2 lg:col-span-3' 
                  : 'md:col-span-1 lg:col-span-1'
              } flex`}>
              <CategoryCard category={category} />
            </div>
          ))}
        </div>

        {/* Special categories section with improved spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {specialCategories.map((category) => (
            <div key={category.id} className="flex">
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
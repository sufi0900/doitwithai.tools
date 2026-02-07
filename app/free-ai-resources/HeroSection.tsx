// /app/free-ai-resources/HeroSection.tsx
// UPDATED: Generic SEO content + 4 cards layout matching AI SEO page

"use client";

import { useEffect, useRef } from 'react';
import { Download, Target, Clock, Award, Sparkles, CheckCircle, ArrowRight, Zap, TrendingUp, RefreshCw, Layout } from 'lucide-react';
import { useAnimationCleanup } from '@/components/Hero/useAnimationCleanup';

const criticalContentSelectors = {
  mainHeading: '.resources-heading',
  primarySubheading: '.resources-content',
  primaryCTA: '.download-button',
};

const FreeAIResourcesHero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { addCleanup } = useAnimationCleanup();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const criticalElements = document.querySelectorAll(
      `${criticalContentSelectors.mainHeading}, ${criticalContentSelectors.primarySubheading}, ${criticalContentSelectors.primaryCTA}`
    );
    criticalElements.forEach(el => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'none';
    });

    const deferAnimations = () => {
      if (heroRef.current) {
        heroRef.current.classList.add('resources-animations-active');
        if (prefersReducedMotion) {
          heroRef.current.classList.add('reduced-motion');
          document.querySelectorAll(
            '.resource-badge, .benefit-card, .stat-card, .download-button-secondary, .background-resource-svg'
          ).forEach(el => {
            const htmlEl = el as HTMLElement;
            htmlEl.style.opacity = '1';
            htmlEl.style.transform = 'none';
          });
        }
      }
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(deferAnimations, { timeout: 200 });
    } else {
      setTimeout(deferAnimations, 200);
    }
  }, [addCleanup]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const targetElement = entry.target as HTMLElement | SVGElement;
        if (heroRef.current?.classList.contains('resources-animations-active')) {
          if (entry.isIntersecting) {
            (targetElement as HTMLElement).style.animationPlayState = 'running';
          } else {
            (targetElement as HTMLElement).style.animationPlayState = 'paused';
          }
        }
      });
    }, { threshold: 0.1 });

    const elementsToObserve = document.querySelectorAll(
      '.svg-animated-element, [style*="animation"], .animate-pulse, .animate-shimmer-custom'
    );
    elementsToObserve.forEach((el) => observer.observe(el));

    addCleanup(() => observer.disconnect());
    return () => observer.disconnect();
  }, [addCleanup]);

  // GENERIC STATISTICS
  const resourceStats = [
    { 
      icon: Zap, 
      label: 'SEO Resources', 
      value: '100+', 
      color: 'text-blue-600 dark:text-blue-400' 
    },
    { 
      icon: TrendingUp, 
      label: 'Quality First', 
      value: 'Curated', 
      color: 'text-green-600 dark:text-green-400' 
    },
    { 
      icon: Clock, 
      label: 'Updated Weekly', 
      value: 'Fresh', 
      color: 'text-purple-600 dark:text-purple-400' 
    },
  ];

  // GENERIC RESOURCE CATEGORIES (3 Cards)
  const resourceCategories = [
    {
      icon: Sparkles,
      title: 'AI SEO Prompts & Guides',
      description: 'Ready-to-use AI prompts and comprehensive guides designed to help you optimize content, improve search visibility, and rank higher across all platforms.',
      badge: 'Growing Library',
      badgeColor: 'bg-blue-500',
    },
    {
      icon: Download,
      title: 'SEO Templates & Resources',
      description: 'Downloadable templates, checklists, and resources to streamline your SEO workflow, track progress, and implement proven optimization strategies.',
      badge: 'Instant Download',
      badgeColor: 'bg-green-500',
    },
    {
      icon: Target,
      title: 'AI SEO Tools & Automation',
      description: 'Curated collection of free AI-powered tools and automation resources to enhance your SEO efforts and save time on repetitive tasks.',
      badge: 'Expert Curated',
      badgeColor: 'bg-purple-500',
    },
  ];

  return (
    <section
      id="free-resources"
      className="relative resources-hero bg z-10 overflow-hidden bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen flex items-center justify-center pt-[20px]"
      ref={heroRef}
      aria-labelledby="resources-heading"
      aria-describedby="resources-description"
      role="banner"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 z-[-1] opacity-20 lg:opacity-60 background-resource-svg">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1200 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="scale-150 sm:scale-100"
          preserveAspectRatio="xMidYMid slice"
          style={{ transform: 'translateZ(0)', willChange: 'auto' }}
          role="img"
          aria-label="Abstract SEO resource pattern"
        >
          <g aria-hidden="true">
            <path
              d="M200 200 Q400 150, 600 200 T1000 200"
              stroke="#3B82F6"
              strokeWidth="2"
              opacity="0.4"
              strokeDasharray="15 10"
              className="svg-animated-element"
              style={{ animation: 'svgDataFlow 8s linear infinite' }}
            />
            <path
              d="M150 300 Q350 250, 550 300 T950 300"
              stroke="#8B5CF6"
              strokeWidth="2"
              opacity="0.4"
              strokeDasharray="20 5"
              className="svg-animated-element"
              style={{ animation: 'svgDataFlowSlow 10s linear infinite', animationDelay: '2s' }}
            />
            <circle cx="300" cy="180" r="8" fill="#3B82F6" opacity="0.6" className="svg-animated-element" style={{ animation: 'svgFloatSlow 6s ease-in-out infinite' }} />
            <circle cx="500" cy="320" r="6" fill="#8B5CF6" opacity="0.7" className="svg-animated-element" style={{ animation: 'svgFloatSlow 8s ease-in-out infinite', animationDelay: '3s' }} />
            <circle cx="800" cy="250" r="10" fill="#10B981" opacity="0.5" className="svg-animated-element" style={{ animation: 'svgGlowPulse 4s ease-in-out infinite' }} />
            <g className="svg-animated-element" style={{ animation: 'svgGlowPulse 3s ease-in-out infinite' }}>
              <rect x="100" y="500" width="80" height="60" rx="8" fill="#3B82F6" opacity="0.1" />
              <circle cx="140" cy="530" r="4" fill="#3B82F6" opacity="0.8" />
            </g>
          </g>
        </svg>
      </div>

      <div className="container mx-auto flex flex-col items-center justify-center px-2 lg:px-8 max-w-7xl">
        <div className="resources-section w-full">
          
          {/* HEADER */}
          <header className="text-center mb-12">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold shadow-lg">
                <Target className="w-4 h-4 mr-2" />
                100% Free SEO Resources
              </span>
            </div>

            <h1
              id="resources-heading"
              className="resources-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white no-shift"
              itemProp="headline"
            >
              <span className="block mb-2">Free AI </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600">
               SEO Resource Library
              </span>
            </h1>

            <p
              className="resources-content text-xl md:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-200 mb-8 max-w-4xl mx-auto no-shift"
              id="resources-description"
            >
              Access our comprehensive collection of{' '}
              <span className="font-bold text-blue-600 dark:text-blue-400">AI-powered SEO resources</span>{' '}
              including prompts, templates, and automation tools - all completely free and ready to boost your search rankings.
            </p>
          </header>

          {/* STATISTICS */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {resourceStats.map((stat, index) => (
              <div
                key={stat.label}
                className={`stat-card stat-${index + 1} flex items-center space-x-3 px-6 py-4 bg-white/70 dark:bg-gray-800/70 rounded-2xl backdrop-blur-sm border border-gray-200 dark:border-gray-600 shadow-lg no-shift`}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-600`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* WHY STAND OUT - 4 CARDS IN SINGLE ROW (Matches AI SEO Page) */}
<div className="mb-12">
  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-white text-center">
    Why Our Free AI SEO Resource Library Stands Out
  </h2>

<div className="grid md:grid-cols-3 gap-6 mb-8">
  {/* Card 1: Quality & Battle-Tested (Blue Theme) */}
  <div className="ai-seo-benefit-card card-1 group p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl backdrop-blur-sm border border-blue-200 dark:border-blue-700 ring-blue-200 dark:ring-blue-700 no-shift shadow-sm hover:shadow-md hover:shadow-blue-200/50 dark:hover:shadow-none transition-all duration-300 cursor-pointer">
    <div className="ai-icon-pulse flex items-center justify-center w-12 h-12 mb-3 bg-[#5271ff] rounded-lg mx-auto transform group-hover:-translate-y-1 transition-transform duration-300">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-200 text-center">
      Quality Focused & Battle Tested
    </h3>
    <p className="text-gray-600 dark:text-gray-300 text-center">
      Every resource is <span className="font-semibold text-blue-800 dark:text-blue-300">carefully curated and battle-tested</span> by experienced SEO professional to ensure you get real value, not generic content or recycled ideas.
    </p>
  </div>

  {/* Card 2: Resource Formats (Purple Theme) */}
  <div className="ai-seo-benefit-card card-2 group p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-300 dark:border-gray-700 cursor-pointer no-shift shadow-sm hover:shadow-md hover:shadow-purple-200/50 dark:hover:shadow-none transition-all duration-300">
    <div className="ai-icon-pulse pulse-purple flex items-center justify-center w-12 h-12 mb-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto transform group-hover:-translate-y-1 transition-transform duration-300">
      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200 text-center">
      5 Useful Resource Formats
    </h3>
    <p className="text-gray-600 dark:text-gray-300 text-center">
      Get AI SEO tools, prompts, Templates, infographics, and videos <span className="font-semibold text-purple-600 dark:text-purple-400"> all in one centralized hub </span> designed to support different learning styles.
    </p>
  </div>

  {/* Card 3: Free & Downloadable (Green Theme) */}
  <div className="ai-seo-benefit-card card-3 group p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-300 dark:border-gray-700 cursor-pointer no-shift shadow-sm hover:shadow-md hover:shadow-green-200/50 dark:hover:shadow-none transition-all duration-300">
    <div className="ai-icon-pulse pulse-green flex items-center justify-center w-12 h-12 mb-3 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto transform group-hover:-translate-y-1 transition-transform duration-300">
      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-200 text-center">
      Free Forever, Always Fresh
    </h3>
    <p className="text-gray-600 dark:text-gray-300 text-center">
      Access our entire AI SEO resource library for free, with 
      <span className="font-semibold text-green-600 dark:text-green-400"> no signup or limits</span>, 
      instant downloads, and regularly updates to stay ahead of AI SEO trends.
    </p>
  </div>
</div>
</div>


          {/* CTA SECTION */}
          <div className="text-center">
            <div className="max-w-2xl mx-auto mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                Ready to Access{' '}
                <span style={{color: '#5271ff'}} className="dark:text-blue-400">Everything for Free</span>?
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                No signup required. No hidden fees. Just instant access to SEO-focused AI resources.
              </p>
            </div>

            {/* TRUST INDICATORS */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
                Quality Guaranteed
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                <Target className="w-4 h-4 mr-2" />
                SEO-Focused
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                Instant Access
              </span>
            </div>

            {/* PRIMARY CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
              <button
                onClick={() => {
                  document.getElementById('resource-formats')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
                className="download-button w-full sm:w-auto inline-flex items-center justify-center min-h-[56px] px-8 py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 no-shift group relative z-10"
                style={{background: 'linear-gradient(to right, #5271ff, #8B5CF6)'}}
                aria-label="Browse all free AI SEO resources"
              >
                <Download className="w-6 h-6 mr-3 group-hover:animate-bounce pointer-events-none" />
                <span className="pointer-events-none">Browse All Resources</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300 pointer-events-none" />
              </button>
            </div>

            {/* Bottom Trust Text */}
            <div className="mt-8 mb-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                🎯 Perfect for: SEO Professionals • Content Marketers • Digital Agencies • Bloggers
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Curated AI-powered SEO resources for better rankings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    </section>
  );
};

export default FreeAIResourcesHero;
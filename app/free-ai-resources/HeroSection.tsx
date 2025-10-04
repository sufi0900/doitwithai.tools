"use client";

import { useEffect, useRef } from 'react';
import { Download, Gift, Sparkles, Users, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { useAnimationCleanup } from '@/components/Hero/useAnimationCleanup'; // Adjust path as needed

// Critical content selectors for FCP optimization
const criticalContentSelectors = {
  mainHeading: '.resources-heading',
  primarySubheading: '.resources-content',
  primaryCTA: '.download-button',
};

const FreeAIResourcesHero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { addCleanup } = useAnimationCleanup();

  // Animation setup similar to homepage but optimized for resources page
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Ensure critical elements are never hidden by initial CSS animations
    const criticalElements = document.querySelectorAll(
      `${criticalContentSelectors.mainHeading}, ${criticalContentSelectors.primarySubheading}, ${criticalContentSelectors.primaryCTA}`
    );
    criticalElements.forEach(el => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'none';
    });

    // Defer heavy animations until after FCP
    const deferAnimations = () => {
      if (heroRef.current) {
        heroRef.current.classList.add('resources-animations-active');
        if (prefersReducedMotion) {
          heroRef.current.classList.add('reduced-motion');
          // Make all animated items instantly visible for reduced motion
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

    // Use requestIdleCallback for better performance
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(deferAnimations, { timeout: 200 });
    } else {
      setTimeout(deferAnimations, 200);
    }
  }, [addCleanup]);

  // Intersection Observer for background animations
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

  // Resource statistics
  const resourceStats = [
    { icon: Download, label: 'Free Resources', value: 'Growing', color: 'text-blue-600 dark:text-blue-400' },
    { icon: Sparkles, label: 'Quality Focus', value: 'Curated', color: 'text-green-600 dark:text-green-400' },
    { icon: Clock, label: 'Updated Weekly', value: 'Fresh', color: 'text-purple-600 dark:text-purple-400' },
  ];

  // Resource categories
  const resourceCategories = [
    {
      icon: Gift,
      title: 'AI Prompts Library',
      description: 'Carefully crafted prompts for ChatGPT, Claude, and other AI models to get you started.',
      badge: 'Growing',
      badgeColor: 'bg-green-500',
    },
    {
      icon: Download,
      title: 'Templates & Tools',
      description: 'Ready-to-use spreadsheets, documents, and automation templates for productivity.',
      badge: 'New',
      badgeColor: 'bg-blue-500',
    },
    {
      icon: Sparkles,
      title: 'Curated Resources',
      description: 'High-quality resources and tools to help you get started with AI efficiently.',
      badge: 'Curated',
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
      {/* Animated Background Elements */}
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
          aria-label="Abstract resource download pattern with floating elements"
        >
          <g aria-hidden="true">
            {/* Resource Flow Lines */}
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
            
            {/* Floating Resource Icons */}
            <circle
              cx="300"
              cy="180"
              r="8"
              fill="#3B82F6"
              opacity="0.6"
              className="svg-animated-element"
              style={{ animation: 'svgFloatSlow 6s ease-in-out infinite' }}
            />
            <circle
              cx="500"
              cy="320"
              r="6"
              fill="#8B5CF6"
              opacity="0.7"
              className="svg-animated-element"
              style={{ animation: 'svgFloatSlow 8s ease-in-out infinite', animationDelay: '3s' }}
            />
            <circle
              cx="800"
              cy="250"
              r="10"
              fill="#10B981"
              opacity="0.5"
              className="svg-animated-element"
              style={{ animation: 'svgGlowPulse 4s ease-in-out infinite' }}
            />
            
            {/* Download Pattern */}
            <g className="svg-animated-element" style={{ animation: 'svgGlowPulse 3s ease-in-out infinite' }}>
              <rect x="100" y="500" width="80" height="60" rx="8" fill="#3B82F6" opacity="0.1" />
              <circle cx="140" cy="530" r="4" fill="#3B82F6" opacity="0.8" />
            </g>
          </g>
        </svg>
      </div>

      <div className="container mx-auto flex flex-col items-center justify-center px-2 lg:px-8 max-w-7xl">
        <div className="resources-section w-full">
          {/* Header Section */}
          <header className="text-center mb-12">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold shadow-lg">
                <Gift className="w-4 h-4 mr-2" />
                100% Free Forever
              </span>
            </div>

            <h1
              id="resources-heading"
              className="resources-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white no-shift"
              itemProp="headline"
            >
              <span className="block mb-2">Free AI</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600">
                Resource Library
              </span>
            </h1>

            <p
              className="resources-content text-xl md:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-200 mb-8 max-w-4xl mx-auto no-shift"
              id="resources-description"
            >
              Access our comprehensive collection of{' '}
              <span className="font-bold text-blue-600 dark:text-blue-400">AI prompts, templates, and premium tools</span>{' '}
              - all completely free and ready to supercharge your productivity.
            </p>
          </header>

          {/* Statistics Section */}
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

          {/* Resource Categories */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {resourceCategories.map((category, index) => (
              <div
                key={category.title}
                className={`benefit-card card-${index + 1} group relative p-6 bg-white/80 dark:bg-gray-800/80 rounded-2xl backdrop-blur-sm border border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer no-shift`}
              >
                {/* Badge */}
                <div className={`absolute -top-3 -right-3 px-3 py-1 ${category.badgeColor} text-white text-xs font-bold rounded-full shadow-lg`}>
                  {category.badge}
                </div>

                <div className="flex items-center justify-center w-14 h-14 mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto group-hover:scale-110 transition-transform duration-300">
                  <category.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {category.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                  {category.description}
                </p>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="max-w-2xl mx-auto mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                Ready to Access{' '}
                <span className="text-blue-600 dark:text-blue-400">Everything for Free</span>?
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                No signup required. No hidden fees. Just instant access to quality AI resources.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
                No Email Required
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                <Download className="w-4 h-4 mr-2" />
                Instant Download
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
                <Clock className="w-4 h-4 mr-2" />
                Updated Weekly
              </span>
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
             <button
  onClick={() => {
    document.getElementById('resource-formats').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }}
  className="download-button w-full sm:w-auto inline-flex items-center justify-center min-h-[56px] px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 no-shift group relative z-10" // Add `relative z-10`
  aria-label="Browse all free AI resources"
>
  <Download className="w-6 h-6 mr-3 group-hover:animate-bounce pointer-events-none" />
  <span className="pointer-events-none">Browse All Resources</span>
  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300 pointer-events-none" />
</button>


            </div>

            {/* Bottom Trust Text */}
            <div className="mt-8 mb-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                🎯 Perfect for: Content Creators • Marketers • Developers • AI Enthusiasts
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Growing collection of curated AI resources
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional decorative elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    </section>
  );
};

export default FreeAIResourcesHero;
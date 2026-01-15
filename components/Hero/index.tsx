/*eslint-disable@next/next/no-img-element*/
/*eslint-disable react/no-unescaped-entities*/
"use client";

import { useEffect, useRef,  useState } from 'react';
import { useAnimationCleanup } from './useAnimationCleanup'; // Adjust path

// Key Changes for FCP Optimization (already implemented, retaining here for context):
const criticalContentSelectors = {
  mainHeading: '.ai-heading',
  primarySubheading: '.primary-content',
  primaryCTA: '.press-button',
};

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { addCleanup } = useAnimationCleanup();
 // 1. ADDED: State to track if the screen is small
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // 2. ADDED: useEffect to check screen size on mount and resize
  useEffect(() => {
    const handleResize = () => {
      // Use window.innerWidth for a more direct check
      // Tailwind's 'sm' breakpoint is 640px. You can adjust this value.
      setIsSmallScreen(window.innerWidth < 640);
    };

    // Set initial value
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => window.removeEventListener('resize', handleResize);
  }, []);

// Replace the first useEffect (line ~20) with this:
useEffect(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // CRITICAL: Ensure these elements are NEVER hidden by initial CSS animations
  const criticalElements = document.querySelectorAll(`${criticalContentSelectors.mainHeading}, ${criticalContentSelectors.primarySubheading}, ${criticalContentSelectors.primaryCTA}`);
  criticalElements.forEach(el => {
    (el as HTMLElement).style.opacity = '1';
    (el as HTMLElement).style.transform = 'none';
  });

  // DEFER heavy animations until after FCP
  const deferAnimations = () => {
    if (heroRef.current) {
      heroRef.current.classList.add('hero-animations-active');
      
      if (prefersReducedMotion) {
        heroRef.current.classList.add('reduced-motion');
        // Make all animated items instantly visible for reduced motion
        document.querySelectorAll('.audience-badge, .ai-benefit-card, .value-indicator, .press-button-secondary, .background-svg-container').forEach(el => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.opacity = '1';
          htmlEl.style.transform = 'none';
        });
      }
    }
  };

  // Use requestIdleCallback for better performance, fallback to setTimeout
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(deferAnimations, { timeout: 200 });
  } else {
    setTimeout(deferAnimations, 200);
  }

}, [addCleanup]);

  // IntersectionObserver for continuous background animations (SVGs, shimmer)
  // This useEffect will now primarily *pause* and *resume* animations, not trigger initial render.
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // In reduced motion, we want to ensure SVGs don't animate at all
      document.querySelectorAll('svg circle, svg path, svg rect, svg polygon').forEach(el => {
        el.classList.remove('animate-svg'); // Remove classes that apply animations
        (el as HTMLElement).style.animation = 'none'; // Directly disable any inline animations
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const targetElement = entry.target as HTMLElement | SVGElement;
        if (targetElement.classList.contains('ai-benefit-card')) {
          // No direct style.animationPlayState here, as it's controlled by hover in CSS.
        } else if (targetElement.classList.contains('svg-animated-element') || (targetElement instanceof HTMLElement || targetElement instanceof SVGElement) && (targetElement.style.animation || targetElement.classList.contains('animate-pulse') || targetElement.classList.contains('animate-shimmer-custom'))) {
          // Only play animations if the `hero-animations-active` class is present on the hero section
          // And the element is intersecting
          if (heroRef.current?.classList.contains('hero-animations-active')) {
            if (entry.isIntersecting) {
              (targetElement as HTMLElement).style.animationPlayState = 'running';
            } else {
              (targetElement as HTMLElement).style.animationPlayState = 'paused';
            }
          } else {
            // If hero-animations-active is not yet present, ensure they remain paused or unrendered
            (targetElement as HTMLElement).style.animationPlayState = 'paused';
          }
        }
      });
    }, { threshold: 0.1 });

    const elementsToObserve = document.querySelectorAll(
      '.svg-animated-element,' +
      '[style*="animation"],' +
      '.animate-pulse,' +
      '.animate-shimmer-custom,' +
      '.ai-benefit-card'
    );
    elementsToObserve.forEach((el) => observer.observe(el));

    addCleanup(() => observer.disconnect());
    return () => observer.disconnect();
  }, [addCleanup]);

  // THIS useEffect for pausing animations when tab is not active (essential for continuous animations)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const animatedElements = document.querySelectorAll(
        '[style*="animation"],.animate-pulse,.animate-shimmer-custom,.svg-animated-element,.ai-benefit-card'
      );
      animatedElements.forEach(el => {
        const targetElement = el as HTMLElement;
        if (document.hidden) {
          if (targetElement.classList.contains('ai-benefit-card')) {
            targetElement.style.setProperty('--animation-play-state', 'paused');
          } else {
            targetElement.style.animationPlayState = 'paused';
          }
        } else {
          // Only resume if hero-animations-active is also present
          if (heroRef.current?.classList.contains('hero-animations-active')) {
            if (targetElement.classList.contains('ai-benefit-card')) {
              targetElement.style.setProperty('--animation-play-state', 'running');
            } else {
              targetElement.style.animationPlayState = 'running';
            }
          }
        }
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    addCleanup(() => document.removeEventListener('visibilitychange', handleVisibilityChange));
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [addCleanup]);


  // --- MODIFIED JSX Structure - Add Specific Staggering Classes ---
  return (
    <section
      id="home"
      className="relative herobg z-10 mb-10 overflow-hidden bg-teal-50 dark:bg-gray-800 min-h-screen flex items-center justify-center   pt-[135px]"
      ref={heroRef}
      aria-labelledby="hero-heading"
      aria-describedby="hero-description"
      role="banner"
    >
            {!isSmallScreen && (

       <div className="absolute inset-0 z-[-1] opacity-30 lg:opacity-100 background-svg-container top-left-svg"> {/* Left SVG */}
        <svg width="100%" height="100%" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-150 sm:scale-100" preserveAspectRatio="xMidYMid slice" style={{ transform: 'translateZ(0)', willChange: 'auto' }} role="img" aria-label="Abstract AI network background with pulsating nodes and dataflow lines">
          {/* All SVG graphical elements are decorative and complex. Using aria-hidden="true" on the entire SVG or the main groups is the most appropriate way to prevent screen readers from announcing their individual complex paths/circles. The overall SVG element already has role="img" and aria-label. */}
          <g aria-hidden="true">
            {/* Replace the existing center sphere */}
            {/* SEO growth lines with subtle flow animation */}
        
<circle r="3" fill="#3B82F6" opacity="0.8">
  <animateMotion dur="6s" repeatCount="indefinite" 
    path="M100 700 C300 600, 500 500, 700 450"/>
</circle>
            <path d="M100 700 C300 600, 500 500, 700 450" stroke="#3B82F6" strokeWidth="2" opacity="0.4" strokeDasharray="20 10" style={{ animation: 'svgDataFlowSlow 12s linear infinite' }} />
            <path d="M150 750 C350 650, 550 550, 750 500" stroke="#A855F7" strokeWidth="2" opacity="0.4" strokeDasharray="15 8" style={{ animation: 'svgDataFlowSlow 15s linear infinite', animationDelay: '3s' }} />
            {/* Animated smaller nodes (datapoints) */}
            <circle cx="700" cy="700" r="18" fill="#4A6CF7" opacity="0.4" style={{ animation: 'svgGlowPulse 9s ease-in-out infinite', animationDelay: '3s' }} />
          </g>
        </svg>
      </div> 
)}

      <div className="container mx-auto flex flex-col items-center justify-center px-2 lg:px-8 max-w-7xl">
        <div className="hero-section w-full">

 <header className="text-center mb-8">
  {/* SEO-Optimized H1: Brand + Value Proposition */}
  <h1
    id="hero-heading"
    className="ai-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 dark:text-white no-shift leading-tight"
    itemProp="headline"
  >
    <span className="block text-blue-600 dark:text-blue-400 transition-all duration-300 mb-2">
      Do It With AI Tools
    </span>
    <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 dark:text-gray-100">
      Helps You Master AI for SEO and Productivity
      {/* Animated AI Star Icon */}
      <span className="inline-block ml-2 align-middle" aria-hidden="true">
        <svg
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="ai-star-icon"
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            // animation: 'sparkle 2s ease-in-out infinite'
          }}
        >
          {/* Main star shape */}
          <path
            d="M12 2L14.09 8.26L20 10L14.09 11.74L12 18L9.91 11.74L4 10L9.91 8.26L12 2Z"
            fill="#5271ff"
            className="star-main"
          >
            <animate
              attributeName="opacity"
              values="1;0.6;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
          {/* Secondary sparkle */}
          <path
            d="M19 4L19.5 5.5L21 6L19.5 6.5L19 8L18.5 6.5L17 6L18.5 5.5L19 4Z"
            fill="#5271ff"
            className="star-secondary"
          >
            <animate
              attributeName="opacity"
              values="0.5;1;0.5"
              dur="2s"
              repeatCount="indefinite"
              begin="0.3s"
            />
          </path>
          {/* Tertiary sparkle */}
          <path
            d="M7 20L7.35 21L8.5 21.35L7.35 21.7L7 23L6.65 21.7L5.5 21.35L6.65 21L7 20Z"
            fill="#5271ff"
            className="star-tertiary"
          >
            <animate
              attributeName="opacity"
              values="0.4;1;0.4"
              dur="2s"
              repeatCount="indefinite"
              begin="0.6s"
            />
          </path>
        </svg>
      </span>
    </span>
  </h1>
  
  {/* Supporting Description */}
  <p className="primary-content hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-6 text-lg font-medium leading-relaxed text-gray-600 dark:text-gray-200 sm:text-xl lg:text-lg xl:text-xl no-shift max-w-4xl mx-auto">
    <span className="block sm:inline">
      <span className="font-semibold text-blue-600 dark:text-blue-400">More than just another AI blog</span>
      — we're your modern resource hub for mastering
    </span>
    <br className="hidden sm:inline"/>
    <span className="block sm:inline">
      generative AI tools that <span className="font-bold text-blue-600 dark:text-blue-400">boost SEO, scale businesses, and 10x productivity.</span>
    </span>
  </p>
</header>

          {/* --- AUDIENCE TARGETING BADGES SECTION START --- */}
          {/* Removed conditional rendering as CSS handles initial state */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {/* Added badge-X classes */}
           <span className="audience-badge badge-1 inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium whitespace-nowrap shadow-sm no-shift">
  <svg
 
    className="w-4 h-4 mr-1 text-blue-500 dark:text-blue-300"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 19a8 8 0 100-16 8 8 0 000 16z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-4.35-4.35"
    />
  </svg>
  SEO Experts
</span>

            <span className="audience-badge badge-2 inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium whitespace-nowrap shadow-sm no-shift">
  <svg
    className="w-4 h-4 mr-1 text-green-500 dark:text-green-300"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 3v18h18M8 17V9m4 8V5m4 12v-6"
    />
  </svg>
  Digital Marketers
</span>

            <span className="audience-badge badge-3 inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium whitespace-nowrap shadow-sm no-shift">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              Content Creators
            </span>
            <span className="audience-badge badge-4 inline-flex items-center px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium whitespace-nowrap shadow-sm no-shift">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
              Developers
            </span>
            <span className="audience-badge badge-5 inline-flex items-center px-4 py-2 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-sm font-medium whitespace-nowrap shadow-sm no-shift">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
              AI Beginners
            </span>
          </div>

          <main className="max-w-6xl mx-auto text-center">
            {/* BENEFITS SECTION - Animated */}
<div className="mb-8">
  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-white">Why DoItWithAI.tools Stands Out</h2>
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    
    {/* Benefit 1 - SEO + AI Search */}
    <div className="ai-benefit-card card-1 group p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl backdrop-blur-sm border border-blue-200 dark:border-blue-700 cursor-pointer ring-blue-200 dark:ring-blue-700 no-shift">
      <div className="ai-icon-pulse flex items-center justify-center w-12 h-12 mb-3 bg-[#2563eb] dark:bg-blue-600 rounded-lg mx-auto">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-200">Rank Higher with AI-Powered SEO</h3>
      <p className="text-gray-700 dark:text-gray-300  text-base">
        Master ChatGPT & other AI tools for SEO that
        <span className="font-semibold text-blue-800 dark:text-blue-300 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors duration-200"> saves 10+ hours weekly&nbsp;</span>
{/* and AI tools for SEO to save 10+ hours weekly, rank higher, and optimize content for AI-powered search.    */}
   and optimizes content for AI-powered search.
   </p>
    </div>

    {/* Benefit 2 - Productivity + Scaling */}
    <div className="ai-benefit-card card-2 card-purple group p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 cursor-pointer no-shift">
      <div className="ai-icon-pulse pulse-purple flex items-center justify-center w-12 h-12 mb-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto">
        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10l3-3m0 0l-3-3m3 3H4"/></svg>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200">10x Your Business Growth</h3>
      <p className="text-gray-600 dark:text-gray-300">
        Discover AI tools, workflows, and free AI resources that help you
        <span className="font-semibold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200">&nbsp;grow your business&nbsp;</span>
and boost overall Productivity     </p>
    </div>

    {/* Benefit 3 - Human + AI */}
    <div className="ai-benefit-card card-3 card-green group p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 cursor-pointer no-shift">
      <div className="ai-icon-pulse pulse-green flex items-center justify-center w-12 h-12 mb-3 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto">
        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-200">Master Human+AI Collaboration</h3>
      <p className="text-gray-600 dark:text-gray-300">
      We bridge the gap between AI potential and real use through
        <span className="font-medium text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-200">&nbsp;simple human + AI tutorials&nbsp;</span>
for all skill level to  work smarter with AI.      </p>
    </div>
  </div>
</div>
            {/* Call to Action with Original Closing Message */}
            {/* Removed conditional rendering as CSS handles initial state */}
            <div className="mb-8">
              <div className="max-w-2xl mx-auto text-center mb-8">
    <p className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Ready to make AI <span className="text-blue-600 dark:text-blue-400">work smarter for you</span>?</p>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Start with strategies that enhance SEO rankings and streamline productivity—perfect for any skill level.</p>
              </div>

              {/* Enhanced value proposition */}
              {/* Added value-X classes, removed p4-animate */}
           <div className="flex flex-wrap justify-center gap-2 mb-6">
          <span className="value-indicator value-1 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium whitespace-nowrap no-shift">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            AI Content Mastery
          </span>
          <span className="value-indicator value-2 inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium whitespace-nowrap no-shift">
            <svg className="w-4 h-4 mr-1 text-green-500 dark:text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            SEO + GEO + AEO
          </span>
          <span className="value-indicator value-3 inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium whitespace-nowrap no-shift">
            <svg className="w-4 h-4 mr-1 text-purple-500 dark:text-purple-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"/>
            </svg>
            50+ Free Resources
          </span>
          <span className="value-indicator value-4 inline-flex items-center px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-medium whitespace-nowrap no-shift">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Weekly Updates
          </span>
        </div>

              {/* CRITICAL FIX: Clear CTA hierarchy with primary/secondary structure */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
                {/* PRIMARY CTA - NO ANIMATION */}
                
                <a
                  href="/blogs"
                  className="press-button  w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg no-shift"
                  aria-label="Explore practical AI guides and tutorials"
                  itemProp="url"
                  style={{    transition: 'all 0.3s ease',
}}
                >
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5.75 8.55 5.518S4.168 5.477 3.62 5.253v13C4.168 18.477 5.754 18.75 7.25 18.518s3.332.477 4.51.253m0-13C13.168 5.477 14.754 5.16 15.518 5.253c1.746 0 3.332.477 4.518.253v13C20.168 18.477 18.582 18.16 17.518 18.253c-1.746 0-3.332.477-4.518.253"/></svg>
                  Start Learning Now
                </a>

                {/* SECONDARY CTA - Animated */}
                {/* Removed conditional rendering for showCTA from this element */}
                <a
                  href="/free-resources"
                  className="press-button-secondary w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-8 py-4 border border-gray-400 dark:border-gray-600 bg-transparent text-gray-800 dark:text-white font-semibold rounded-lg no-shift"
                  aria-label="Get free AI resources and join our community"
                  itemProp="url"
                >
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  Get Free Resources
                </a>
              </div>

              {/* CRITICAL FIX: Enhanced trust indicator with social proof */}
              <div className="mt-6 text-center">
                <p className="trust-text text-xs text-gray-500 dark:text-gray-400 mb-2 cursor-pointer">🔒No signup required for most content • 📧Weekly practical tips • 🎁Instant free downloads</p>
                <p className="trust-text text-xs text-gray-400 dark:text-gray-500 cursor-pointer">Perfect for: Digital Marketers • Content Creators • Developers • SEO Experts • AI Beginners</p>
              </div>
            </div>
          </main>
        </div>
      </div>
      
          </section>
        );
      };
      
export default Hero;
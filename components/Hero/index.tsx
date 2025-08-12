/*eslint-disable@next/next/no-img-element*/
/*eslint-disable react/no-unescaped-entities*/
"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import AnimatedBinaryText from './AnimatedBinaryText'; // Adjust path if needed
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
      <div className="container mx-auto flex flex-col items-center justify-center px-2 lg:px-8 max-w-7xl">
        <div className="hero-section w-full">

          {/* CRITICAL CONTENT - NO ANIMATION DELAYS */}
          <header className="text-center mb-8">

  <h1
    id="hero-heading"
    className="ai-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 dark:text-white no-shift"
    itemProp="headline"
  >
    <span className="block">Welcome to</span>
    
    {/* Main title with original badge for larger devices */}
    <span className="text-blue-600 dark:text-blue-400 transition-all duration-300 relative inline-block">
      DO IT WITH AI&nbsp;
      <span className="inline-flex items-center whitespace-nowrap last-group">
        TOOLS
        <span className="new-launch-badge inline-flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-sm ml-1">
          NEW!
        </span>
      </span>
    </span>
    
  <div className="new-launch-badge-mobile">
  {/* This outer div will manage flex layout but won't animate its transform */}
  
  <div className="new-launch-badge-inner"> {/* NEW ELEMENT FOR ANIMATION */}
    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>
    {/* This span holds the text and will now be a child of the animating inner div */}
    <span className="inline-flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-sm ml-1">
      NEW LAUNCH!
    </span>
  </div>
</div>
  </h1>
            
<p className="primary-content hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-6 text-lg font-medium leading-relaxed text-gray-600 dark:text-gray-200 sm:text-xl lg:text-lg xl:text-xl no-shift">
  <span className="block sm:inline">
    <span className="font-semibold text-blue-600 dark:text-blue-400">More than just another AI blog</span>
    — we're your go-to resource hub
  </span>
  <br className="hidden sm:inline"/>
  <span className="block sm:inline">
    for mastering AI tools that <span className="font-bold text-blue-600 dark:text-blue-400">boost SEO and everyday productivity</span>
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
            {/* Removed conditional rendering as CSS handles initial state */}
          <div className="mb-8">
  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-white">Why DoItWithAI.tools Stands Out</h2>
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    {/* Benefit 1 - SEO Focus (PRIMARY) */}
    <div className="ai-benefit-card card-1 group p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl backdrop-blur-sm border border-blue-200 dark:border-blue-700 cursor-pointer ring-blue-200 dark:ring-blue-700 no-shift">
      <div className="ai-icon-pulse flex items-center justify-center w-12 h-12 mb-3 bg-[#2563eb] dark:bg-blue-600 rounded-lg mx-auto">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
      </div>
      {/* H3: Changes to brand blue on hover */}
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-200">Rank Higher with AI-Powered SEO</h3>
      <p className="text-gray-700 dark:text-gray-300  text-base">
               <span className="font-semibold text-blue-800 dark:text-blue-300 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors duration-200">Master ChatGPT&nbsp;</span>

        and other AI tools for SEO with strategies that  
        <span className="font-semibold text-blue-800 dark:text-blue-300 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors duration-200">&nbsp;save 10+ hours weekly
</span> and boost your overall rankings.


      </p>
    </div>
    {/* Benefit 2 - Productivity (SECONDARY) */}
    <div className="ai-benefit-card card-2 card-purple group p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 cursor-pointer no-shift">
      <div className="ai-icon-pulse pulse-purple flex items-center justify-center w-12 h-12 mb-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto">
        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10l3-3m0 0l-3-3m3 3H4"/></svg>
      </div>
      {/* H3: Changes to purple on hover */}
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200">10x Your Daily Productivity</h3>
    <p className="text-gray-600 dark:text-gray-300">
  <span className="font-semibold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200">
    &nbsp;Improve your daily workflow&nbsp;
  </span>
  with the best AI tools, AI learning content, and premium AI assets—all completely
  <span className="font-semibold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200">
    &nbsp;FREE&nbsp;
  </span>.
</p>

    </div>
    {/* Benefit 3 - Accessibility (SUPPORTING) */}
    <div className="ai-benefit-card card-3 card-green group p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 cursor-pointer no-shift">
      <div className="ai-icon-pulse pulse-green flex items-center justify-center w-12 h-12 mb-3 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto">
        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
      </div>
      {/* H3: Changes to green on hover */}
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-200">From Beginner to AI Expert</h3>
      <p className="text-gray-600 dark:text-gray-300">
        We bridge the gap between AI potential and real use, offering
        {/* Span 1: Matches card theme (green) */}
        <span className="font-medium text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-200">&nbsp;simple tutorials&nbsp;</span>
        for        all levels

        to work         <span className="font-medium text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-200">&nbsp;smarter with AI.</span>

      </p>
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
                  AI-Powered SEO
                </span>
               <span className="value-indicator value-2 inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium whitespace-nowrap no-shift">
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
      d="M5 12h14M12 5l7 7-7 7"
    />
  </svg>
  10x Productivity
</span>

<span className="value-indicator value-3 inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium whitespace-nowrap no-shift">
 
 
  <svg
    className="w-4 h-4 mr-1 text-purple-500 dark:text-purple-300"
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
      d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"
    />
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
      
          {/* AI-Themed Background Elements - TopRight */}
            {/* ADDED background-svg-container class for initial hiding */}
            <div className="absolute right-0 top-0 z-[-1] opacity-30 lg:opacity-100 background-svg-container top-right-svg">
              <svg width="450" height="556" viewBox="0 0 450 556" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Decorative neural network and circuit pattern in background">
                <defs>
                  {/* Gradients */}
                 
                  <linearGradient id="paint0_neural_gradient" x1="220" y1="40" x2="380" y2="200" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" /><stop offset="1" stopColor="#06B6D4" stopOpacity="0.3" /></linearGradient>
                  <linearGradient id="paint1_connection" x1="250" y1="80" x2="320" y2="160" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" /><stop offset="1" stopColor="#06B6D4" /></linearGradient>
                  <linearGradient id="paint2_connection" x1="280" y1="60" x2="380" y2="110" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6" /><stop offset="1" stopColor="#10B981" /></linearGradient>
                  <radialGradient id="paint3_node" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" /><stop offset="1" stopColor="#4A6CF7" stopOpacity="0.3" /></radialGradient>
                  <radialGradient id="paint4_node" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"><stop stopColor="#06B6D4" /><stop offset="1" stopColor="#06B6D4" stopOpacity="0.3" /></radialGradient>
                  <linearGradient id="paint5_circuit" x1="200" y1="250" x2="400" y2="400" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" stopOpacity="0.6" /><stop offset="1" stopColor="#06B6D4" stopOpacity="0.2" /></linearGradient>
                  <linearGradient id="paint6_circuit_lines" x1="220" y1="270" x2="380" y2="330" gradientUnits="userSpaceOnUse"><stop stopColor="#2563EB" /><stop offset="1" stopColor="#7C3AED" /></linearGradient>
                  <linearGradient id="paint7_binary" x1="100" y1="160" x2="200" y2="200" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6"/><stop offset="1" stopColor="#06B6D4"/></linearGradient> {/* Added missing gradient for binary text */}
                  <linearGradient id="paint8_geometric" x1="100" y1="450" x2="200" y2="450" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" stopOpacity="0.5"/><stop offset="1" stopColor="#06B6D4" stopOpacity="0.1"/></linearGradient>
                  <linearGradient id="paint9_geometric" x1="320" y1="480" x2="420" y2="480" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6" stopOpacity="0.4"/><stop offset="1" stopColor="#10B981" stopOpacity="0.1"/></linearGradient>
                  <linearGradient id="paint10_dataflow" x1="50" y1="350" x2="450" y2="350" gradientUnits="userSpaceOnUse"><stop stopColor="#2563EB"/><stop offset="1" stopColor="#7C3AED"/></linearGradient>
                </defs>
                <g aria-hidden="true">
                  <circle cx="300" cy="120" r="80" fill="url(#paint0_neural_gradient)" opacity="0.6" />
                  <path d="M250 80L320 100L280 140L350 120L320 160" stroke="url(#paint1_connection)" strokeWidth="2" opacity="0.7" strokeDasharray="15 5" className="svg-animated-element" style={{ animation: 'neuralFlow 12s linear infinite' }} />
                  <path d="M280 60L350 90L320 130L380 110" stroke="url(#paint2_connection)" strokeWidth="1.5" opacity="0.6" strokeDasharray="10 3" className="svg-animated-element" style={{ animation: 'neuralFlowReverse 15s linear infinite', animationDelay: '2s' }} />
                  <circle cx="250" cy="80" r="8" fill="#4A6CF7" opacity="0.8" />
                  <circle cx="320" cy="100" r="6" fill="#8B5CF6" opacity="0.9" />
                  <circle cx="280" cy="140" r="7" fill="#4A6CF7" opacity="0.8" />
                  <circle cx="350" cy="120" r="5" fill="#8B5CF6" opacity="0.9" />
                  <circle cx="320" cy="160" r="6" fill="#10B981" opacity="0.8" />
                  <circle cx="380" cy="110" r="4" fill="#10B981" opacity="0.9" />
                  {/*Circuit Pattern - STATIC */}
                  <rect x="200" y="250" width="200" height="150" rx="10" fill="none" stroke="url(#paint5_circuit)" strokeWidth="1" opacity="0.4" />
                  <path d="M220 270L380 270" stroke="url(#paint6_circuit_lines)" strokeWidth="1" opacity="0.7" strokeDasharray="8 4" className="svg-animated-element" style={{ animation: 'svgDataFlow 8s linear infinite' }} />
                  <path d="M220 290L350 290" stroke="url(#paint6_circuit_lines)" strokeWidth="1" opacity="0.7" strokeDasharray="8 4" className="svg-animated-element" style={{ animation: 'svgDataFlow 8s linear infinite', animationDelay: '0.5s' }} />
                  <path d="M220 310L380 310" stroke="url(#paint6_circuit_lines)" strokeWidth="1" opacity="0.7" strokeDasharray="8 4" className="svg-animated-element" style={{ animation: 'svgDataFlow 8s linear infinite', animationDelay: '1s' }} />
                  <path d="M220 330L350 330" stroke="url(#paint6_circuit_lines)" strokeWidth="1" opacity="0.7" strokeDasharray="8 4" className="svg-animated-element" style={{ animation: 'svgDataFlow 8s linear infinite', animationDelay: '1.5s' }} />
                  <circle cx="220" cy="270" r="4" fill="#4A6CF7" opacity="0.8" className="svg-animated-element" />
                  <circle cx="380" cy="270" r="4" fill="#4A6CF7" opacity="0.8" className="svg-animated-element" />
                  <circle cx="220" cy="290" r="4" fill="#06B6D4" opacity="0.8" className="svg-animated-element" />
                  <circle cx="350" cy="290" r="4" fill="#06B6D4" opacity="0.8" className="svg-animated-element" />
                  <circle cx="220" cy="310" r="4" fill="#8B5CF6" opacity="0.8" className="svg-animated-element" />
                  <circle cx="380" cy="310" r="4" fill="#8B5CF6" opacity="0.8" className="svg-animated-element" />
                  <circle cx="220" cy="330" r="4" fill="#10B981" opacity="0.8" className="svg-animated-element" />
                  <circle cx="350" cy="330" r="4" fill="#10B981" opacity="0.8" className="svg-animated-element" />
                  <g aria-label="Floating binary code display">
                    <AnimatedBinaryText initialText="01001001" x="150" y="175" fill="url(#paint7_binary)" fontSize="12" fontFamily="monospace" className="animated-binary-text" interval={2500} aria-label="Binary code" />
                    <AnimatedBinaryText initialText="11010110" x="160" y="190" fill="url(#paint7_binary)" fontSize="12" fontFamily="monospace" className="animated-binary-text" interval={2000} aria-label="Binary code" />
                    <AnimatedBinaryText initialText="00110101" x="140" y="205" fill="url(#paint7_binary)" fontSize="12" fontFamily="monospace" className="animated-binary-text" interval={3000} aria-label="Binary code" />
                  </g>
                  <path d="M50 350 Q150 320, 250 350 Q350 380, 450 350" stroke="url(#paint10_dataflow)" strokeWidth="2" fill="none" opacity="0" />
                </g>
              </svg>
            </div>
            {/* BottomLeftAI-ThemedBackgroundElements */}
            {/* ADDED background-svg-container class for initial hiding */}
            <div className="absolute bottom-0 left-0 z-[-1] opacity-30 lg:opacity-100 background-svg-container bottom-left-svg">
              <svg width="364" height="201" viewBox="0 0 364 201" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Decorative dataflow and machine learning pattern in background">
                <defs>
                  {/* DataFlow Gradients */}
                  <linearGradient id="paint0_dataflow_main" x1="184.389" y1="69.2405" x2="184.389" y2="212.24" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" stopOpacity="0" /><stop offset="0.5" stopColor="#06B6D4" /><stop offset="1" stopColor="#4A6CF7" /></linearGradient>
                  <linearGradient id="paint1_dataflow_secondary" x1="156.389" y1="69.2405" x2="156.389" y2="212.24" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6" stopOpacity="0" /><stop offset="1" stopColor="#8B5CF6" /></linearGradient>
                  <linearGradient id="paint2_dataflow_tertiary" x1="125.389" y1="69.2405" x2="125.389" y2="212.24" gradientUnits="userSpaceOnUse"><stop stopColor="#10B981" stopOpacity="0" /><stop offset="1" stopColor="#10B981" /></linearGradient>
                  {/* Analytics Core */}
                  <radialGradient id="paint3_analytics_core" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(220 63) rotate(90) scale(35)"><stop offset="0" stopColor="#4A6CF7" stopOpacity="0.3" /><stop offset="1" stopColor="#06B6D4" stopOpacity="0.1" /></radialGradient>
                  {/* Connection Lines */}
                  <linearGradient id="paint4_connections" x1="190" y1="35" x2="250" y2="85" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" /><stop offset="1" stopColor="#06B6D4" /></linearGradient>
                  {/* ML Pattern */}
                  <linearGradient id="paint5_ml_pattern" x1="50" y1="120" x2="130" y2="160" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6" /><stop offset="1" stopColor="#10B981" /></linearGradient>
                  {/* Algorithm Flow */}
                  <linearGradient id="paint6_algorithm" x1="280" y1="100" x2="360" y2="140" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" /><stop offset="1" stopColor="#10B981" /></linearGradient>
                </defs>
                <g aria-hidden="true">
                  {/*DataFlowCurves*/}
                  <circle cx="220" cy="63" r="35" fill="url(#paint3_analytics_core)" opacity="0.8" />
                  <g className="svg-animated-element rotating-needle" style={{ animation: 'smoothOrbitRotation 25s linear infinite' }}>
  <circle cx="255" cy="63" r="3" fill="#2563EB" opacity="0.8" />
  <path d="M220 63L255 63" stroke="#2563EB" strokeWidth="1.5" opacity="0.9" />
</g>
                  <circle cx="240" cy="40" r="3" fill="#8B5CF6" opacity="0.6" className="svg-animated-element" style={{ animation: 'svgGlowPulse 12s ease-in-out infinite', animationDelay: '2s' }} />
                  <circle cx="195" cy="85" r="3" fill="#F59E0B" opacity="0.6" className="svg-animated-element" style={{ animation: 'svgFloatSlow 8s ease-in-out infinite', animationDelay: '4s' }} />
                  <circle cx="253" cy="72" r="3" fill="#10B981" opacity="0.8"  />
                  <circle cx="195" cy="85" r="3" fill="#F59E0B" opacity="0.8" />
                  {/* Connection Lines to Data Points */}
                  <path d="M220 63L190 45M220 63L210 35M220 63L240 40M220 63L250 70M220 63L195 85" stroke="url(#paint4_connections)" strokeWidth="1" opacity="0.4" />
                  {/* Machine Learning Pattern */}
                  <rect x="50" y="120" width="80" height="40" rx="5" fill="none" stroke="url(#paint5_ml_pattern)" strokeWidth="1" opacity="0.4" />
                  {/* ML Nodes */}
                  <circle cx="70" cy="130" r="2" fill="#4A6CF7" className="svg-animated-element" style={{ animation: 'gentleStrike 4s ease-in-out infinite', animationDelay: '0s' }} />
                  <circle cx="90" cy="135" r="2" fill="#06B6D4" className="svg-animated-element" style={{ animation: 'gentleStrikeReverse 4s ease-in-out infinite', animationDelay: '0.5s' }} />
                  <circle cx="110" cy="140" r="2" fill="#8B5CF6" className="svg-animated-element" style={{ animation: 'gentleStrike 4s ease-in-out infinite', animationDelay: '1s' }} />
                  <circle cx="70" cy="150" r="2" fill="#10B981" className="svg-animated-element" style={{ animation: 'gentleStrikeReverse 4s ease-in-out infinite', animationDelay: '1.5s' }} />
                  <circle cx="90" cy="145" r="2" fill="#F59E0B"  className="svg-animated-element" style={{ animation: 'gentleStrike 4s ease-in-out infinite', animationDelay: '2s' }} />
                  <circle cx="110" cy="150" r="2" fill="#EF4444" className="svg-animated-element" style={{ animation: 'gentleStrikeReverse 4s ease-in-out infinite', animationDelay: '2.5s' }} />
                  {/* Algorithm Flow */}
                  <path d="M280 100L320 110L340 130L360 140" stroke="url(#paint6_algorithm)" strokeWidth="2" fill="none" opacity="0.6" />
                  {/* Algorithm Nodes */}
                  <circle cx="280" cy="100" r="4" fill="#4A6CF7" />
                  <circle cx="320" cy="110" r="3" fill="#06B6D4" />
                  <circle cx="340" cy="130" r="3" fill="#8B5CF6" />
                  <circle cx="360" cy="140" r="4" fill="#10B981" />
                </g>
              </svg>
            </div>
          </section>
        );
      };
      
export default Hero;
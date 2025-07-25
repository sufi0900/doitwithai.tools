/*eslint-disable @next/next/no-img-element */
/*eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useRef, useCallback, useState } from 'react'; // Added useState
import AnimatedBinaryText from './AnimatedBinaryText'; // Adjust path if needed
import "./critical-hero.css"; // Ensure this CSS contains the optimized animations
import { useAnimationCleanup } from './useAnimationCleanup'; // Adjust path


const Hero = () => {
  const heroRef = useRef<HTMLElement>(null); // Specify HTMLElement for heroRef
  const { addCleanup } = useAnimationCleanup();

  // State variables for controlling section visibility and animation
  const [showSecondaryContent, setShowSecondaryContent] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  // THIS useEffect for initial hero animations and reduced motion preference
  // This is crucial for your text to appear with its initial animation
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer: NodeJS.Timeout; // Type for setTimeout return

    // We use a short timeout + rAF to ensure the element is painted
    // before applying the animation class, preventing FOUC.
    timer = setTimeout(() => {
      if (heroRef.current) {
        requestAnimationFrame(() => {
          heroRef.current!.classList.add('hero-animations-active'); // Use ! for non-null assertion
          if (prefersReducedMotion) {
            heroRef.current!.classList.add('reduced-motion');
            // For reduced motion, ensure stagger animations immediately go to final state
            document.querySelectorAll('.animated-staggered-item').forEach(el => {
                // Assert el as HTMLElement to access .style
                const htmlEl = el as HTMLElement;
                htmlEl.style.opacity = '1';
                htmlEl.style.transform = 'none';
            });
            // Immediately show all content for reduced motion
            setShowSecondaryContent(true);
            setShowBenefits(true);
            setShowCTA(true);
          } else {
            // Start the sequential animations for non-reduced motion users
            setShowSecondaryContent(true);
          }
        });
      }
    }, 100); // Small delay to allow initial render

    // Add cleanup for the timer
    addCleanup(() => clearTimeout(timer));
    return () => clearTimeout(timer);
  }, [addCleanup]); // Depend on addCleanup so it's always available

  // Intersection Observer for secondary content (Audience Badges)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return; // Skip for reduced motion, as content is already shown

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setShowBenefits(true); // Show benefits when secondary content is visible
          observer.unobserve(entry.target); // Stop observing once triggered
        }
      });
    }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

    // Observe the header's paragraph (the main description)
    const headerP = heroRef.current?.querySelector('header p');
    if (headerP) {
      observer.observe(headerP);
    }

    addCleanup(() => observer.disconnect());
    return () => observer.disconnect();
  }, [addCleanup]); // Dependency array

  // Intersection Observer for benefits section
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return; // Skip for reduced motion

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setShowCTA(true); // Show CTA when benefits are visible
          observer.unobserve(entry.target); // Stop observing once triggered
        }
      });
    }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

    // Observe the 'Why DoItWithAI.tools Stands Out' heading or the entire benefits grid
    const benefitsHeading = heroRef.current?.querySelector('h2');
    if (benefitsHeading) {
      observer.observe(benefitsHeading);
    } else {
      // Fallback: observe the benefits grid if heading isn't found
      const benefitsGrid = heroRef.current?.querySelector('.grid.md\\:grid-cols-2');
      if (benefitsGrid) observer.observe(benefitsGrid);
    }

    addCleanup(() => observer.disconnect());
    return () => observer.disconnect();
  }, [addCleanup]); // Dependency array

  // Consolidated Intersection Observer for continuous background animations (SVGs, shimmer)
  // This useEffect remains largely the same
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        document.querySelectorAll('svg circle, svg path, svg rect, svg polygon').forEach(el => {
            el.classList.remove('animate-svg');
            // If you had inline style.animation for SVG, you'd need to cast here too
            // Example: (el as SVGElement).style.animationPlayState = 'paused';
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Assert entry.target as HTMLElement or SVGElement for style access
        const targetElement = entry.target as HTMLElement | SVGElement;

        // Handle SVG animations controlled by the 'animate-svg' class
        if (targetElement.classList.contains('svg-animated-element')) {
          if (entry.isIntersecting) {
            targetElement.classList.add('animate-svg');
          } else {
            targetElement.classList.remove('animate-svg');
          }
        }
        // Handle other continuous animations (like shimmer, pulse) via inline style.animationPlayState
        else if (
            // Check if it's an element that *can* have style.animation
            (targetElement instanceof HTMLElement || targetElement instanceof SVGElement) &&
            (targetElement.style.animation || // Elements with inline animation property
            targetElement.classList.contains('animate-pulse') || // Add specific classes if their animations are continuous
            targetElement.classList.contains('animate-shimmer-custom'))
        ) {
          if (entry.isIntersecting) {
            targetElement.style.animationPlayState = 'running';
          } else {
            targetElement.style.animationPlayState = 'paused';
          }
        }
      });
    }, { threshold: 0.1 });

    const elementsToObserve = document.querySelectorAll(
        '.svg-animated-element, ' +
        '[style*="animation"], ' +
        '.animate-pulse, ' +
        '.animate-shimmer-custom'
    );

    elementsToObserve.forEach((el) => observer.observe(el));

    addCleanup(() => observer.disconnect());
    return () => observer.disconnect();
  }, [addCleanup]);

  // THIS useEffect for pausing animations when tab is not active (essential for continuous animations)
  // This useEffect remains largely the same
  useEffect(() => {
    const handleVisibilityChange = () => {
      const animatedElements = document.querySelectorAll(
        '[style*="animation"], .animate-pulse, .animate-shimmer-custom, .svg-animated-element'
      );

      animatedElements.forEach(el => {
        // Assert el as HTMLElement or SVGElement to access .style
        const targetElement = el as HTMLElement | SVGElement;

        if (document.hidden) {
          targetElement.style.animationPlayState = 'paused';
        } else {
          targetElement.style.animationPlayState = 'running';
        }
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    addCleanup(() => document.removeEventListener('visibilitychange', handleVisibilityChange));
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [addCleanup]); // Depend on addCleanup

  return (
    <section
      id="home"
      className="relative z-10 overflow-hidden bg-teal-50 dark:bg-gray-800 min-h-screen flex items-center justify-center py-16 md:py-[75px]"
      ref={heroRef}
      aria-labelledby="hero-heading"
      aria-describedby="hero-description"
      role="banner"
    >

      {/* Background SVG elements - these are decorative */}


      {/* Main content area */}
      <div className="container mx-auto flex flex-col items-center justify-center px-2 lg:px-8 max-w-7xl">
        <div className="hero-section w-full">
          {/* H1 is always visible */}
          <header className="text-center mb-8">
            <h1
              id="hero-heading"
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 dark:text-white"
              itemProp="headline"
            >
              <span className="block">Welcome to</span>
              <span className="block text-blue-600 dark:text-blue-400">
                DO IT WITH AI TOOLS
              </span>
            </h1>
            <p
              className="hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-6 text-lg font-medium leading-relaxed text-gray-600 dark:text-gray-200 sm:text-xl lg:text-lg xl:text-xl animated-staggered-item p1-animate"
              style={{ transform: 'translateY(20px)', opacity: 0, willChange: 'transform,opacity' }}
            >
              {/* REVISED: Sharpened USP focus on SEO with AI */}
              <span className="block sm:inline">
                <span className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-200">More than just another AI blog</span>—we’re your
                <span className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-200"> go-to resource hub </span>
                for mastering AI tools that actually work.
              </span>
              <br className="hidden sm:inline" />
              <span className="block sm:inline">
                Learn to <span className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors duration-200">boost SEO and productivity</span>
                with hands-on tutorials, expert reviews, and a wealth of
                <span className="font-bold text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors duration-200"> free resources</span>.
              </span>
            </p>

            {/* NEW: Optional Sub-headline for further clarity on SEO focus */}
            <p className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-6">
                Unlock higher rankings and save hours with AI-powered strategies.
            </p>

          </header>
          {/* --- AUDIENCE TARGETING BADGES SECTION START --- */}
          {/* Conditional rendering + class for animation */}
          <div className={`flex flex-wrap justify-center gap-3 mb-8 transition-all duration-700 ${showSecondaryContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium whitespace-nowrap shadow-sm hover:bg-blue-200 dark:hover:bg-blue-800/50 hover:text-blue-800 dark:hover:text-blue-200 transition-all duration-200 cursor-pointer">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              SEO Experts
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium whitespace-nowrap shadow-sm hover:bg-green-200 dark:hover:bg-green-800/50 hover:text-green-800 dark:hover:text-green-200 transition-all duration-200 cursor-pointer">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13.488m0-13.488a8.253 8.253 0 00-6.141 3.518c-.808 1.155-1.127 2.47-1.106 3.737.02 1.282.355 2.545.975 3.637.62.903 1.401 1.623 2.298 2.091 1.056.54 2.203.826 3.376.826.837 0 1.657-.14 2.417-.417.822-.294 1.572-.738 2.222-1.312a8.25 8.25 0 002.775-6.52c-.012-1.116-.279-2.226-.788-3.238-.508-1.011-1.226-1.89-2.09-2.585-1.111-.887-2.45-1.353-3.805-1.353z"></path></svg>
              Digital Marketers
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium whitespace-nowrap shadow-sm hover:bg-purple-200 dark:hover:bg-purple-800/50 hover:text-purple-800 dark:hover:text-purple-200 transition-all duration-200 cursor-pointer">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              Content Creators
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium whitespace-nowrap shadow-sm hover:bg-orange-200 dark:hover:bg-orange-800/50 hover:text-orange-800 dark:hover:text-orange-200 transition-all duration-200 cursor-pointer">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
              Developers
            </span>
             <span className="inline-flex items-center px-4 py-2 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-sm font-medium whitespace-nowrap shadow-sm hover:bg-pink-200 dark:hover:bg-pink-800/50 hover:text-pink-800 dark:hover:text-pink-200 transition-all duration-200 cursor-pointer">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
              AI Beginners
            </span>
          </div>
          {/* Content Restructuring with Strategic Adjustments */}
          <main className="max-w-6xl mx-auto text-center">
            {/* Conditional rendering + class for animation */}
            <div className={`mb-8 transition-all duration-700 ${showBenefits ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-white">
                Why DoItWithAI.tools Stands Out
              </h2>
              {/* Trust Indicators with Star Rating */}


              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Benefit 1 - SEO Focus (PRIMARY) */}
                <div
                  className="group relative p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl backdrop-blur-sm border border-blue-200 dark:border-blue-700 animated-staggered-item p1-animate overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer"
                  style={{ transform: 'translateY(20px)', opacity: 0 }}
                >
                  {/* AI Vision Overlay Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-200/20 to-blue-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>
                  <div className="absolute inset-0 border border-blue-400/0 group-hover:border-blue-400/50 rounded-xl transition-all duration-300 z-0"></div> {/* Subtle border grow */}
                  <div className="relative z-10"> {/* Ensure content is above overlay */}
                    <div className="flex items-center justify-center w-12 h-12 mb-3 bg-[#2563eb] dark:bg-blue-600 rounded-lg mx-auto">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                      Rank Higher with AI-Powered SEO
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Master
                      <span className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-200">
                        &nbsp;ChatGPT and other AI tools for SEO&nbsp;
                      </span>
                      with strategies that
                      <span className="font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors duration-200">
                        &nbsp;save 10+ hours weekly and&nbsp;
                      </span>
                      boost your overall rankings and online visibility.
                    </p>
                  </div> {/* End relative z-10 */}
                </div>

                {/* Benefit 2 - Productivity (SECONDARY) */}
                <div
                  className="group relative p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 animated-staggered-item p2-animate overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-purple-500 dark:hover:border-purple-400 cursor-pointer"
                  style={{ transform: 'translateY(20px)', opacity: 0 }}
                >
                  {/* AI Vision Overlay Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-200/20 to-purple-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>
                  <div className="absolute inset-0 border border-purple-400/0 group-hover:border-purple-400/50 rounded-xl transition-all duration-300 z-0"></div> {/* Subtle border grow */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-center w-12 h-12 mb-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto">
                      <svg
                        className="w-6 h-6 text-purple-600 dark:text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10l3-3m0 0l-3-3m3 3H4"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                      10x Your Daily Productivity
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors duration-200">
                        &nbsp;Improve your daily workflow&nbsp;
                      </span>
                      with the best AI tools, upskilling resources, and premium AI assets—all completely
                      <span className="font-bold text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors duration-200">
                        &nbsp;FREE&nbsp;
                      </span>
                      .
                    </p>
                  </div> {/* End relative z-10 */}
                </div>

                {/* Benefit 3 - Accessibility (SUPPORTING) */}
                <div
                  className="group relative p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 animated-staggered-item p3-animate overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-green-500 dark:hover:border-green-400 cursor-pointer"
                  style={{ transform: 'translateY(20px)', opacity: 0 }}
                >
                  {/* AI Vision Overlay Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-green-200/20 to-green-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>
                  <div className="absolute inset-0 border border-green-400/0 group-hover:border-green-400/50 rounded-xl transition-all duration-300 z-0"></div> {/* Subtle border grow */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-center w-12 h-12 mb-3 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto">
                      <svg
                        className="w-6 h-6 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 14l9-5-9-5-9 5 9 5z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                      From Beginner to AI Expert
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      We bridge the gap between AI's potential and real use, offering
                      <span className="font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors duration-200">
                        &nbsp;easy-to-follow tutorials&nbsp;
                      </span>
                      for all levels to grow and work smarter with AI.
                    </p>
                  </div> {/* End relative z-10 */}
                </div>
              </div>
            </div>

            {/* Call to Action with Original Closing Message */}
            {/* Conditional rendering + class for animation */}
            <div className={`mb-8 transition-all duration-700 ${showCTA ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="max-w-2xl mx-auto text-center mb-8">
                 <p className="text-xl font-medium mb-4 text-gray-700 dark:text-gray-200">
                   Ready to make AI work smarter for you?
                 </p>
                 <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                   From boosting your SEO rankings to automating tasks and sparking new ideas, find all the AI tools and tutorials you need here.
                 </p>
              </div>

              {/* Enhanced value proposition */}
              <div className="flex flex-wrap justify-center gap-2 mb-6 animated-staggered-item p4-animate" style={{transform: 'translateY(20px)', opacity: 0}}>
                {/* Beginner-Friendly */}
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium whitespace-nowrap hover:bg-blue-200 dark:hover:bg-blue-800/50 hover:text-blue-800 dark:hover:text-blue-200 transition-all duration-200 cursor-pointer">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                  Easy Start
                </span>
                {/* Boost SEO & Visibility */}
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium whitespace-nowrap hover:bg-green-200 dark:hover:bg-green-800/50 hover:text-green-800 dark:hover:text-green-200 transition-all duration-200 cursor-pointer">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  SEO Growth
                </span>
                {/* Productivity-First Content */}
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium whitespace-nowrap hover:bg-purple-200 dark:hover:bg-purple-800/50 hover:text-purple-800 dark:hover:text-purple-200 transition-all duration-200 cursor-pointer">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-1.25-3M15 10V5a3 3 0 00-3-3l-2 2H6a3 3 0 00-3 3v2a3 3 0 003 3h12a3 3 0 003-3v-2a3 3 0 00-3-3h-1.5"></path></svg>
                  Boost Productivity
                </span>
                {/* Free Resources Library */}
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium whitespace-nowrap hover:bg-orange-200 dark:hover:bg-orange-800/50 hover:text-orange-800 dark:hover:text-orange-200 transition-all duration-200 cursor-pointer">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m12 12a2 2 0 100-4m0 4a2 2 0 110-4m12 12a2 2 0 100-4m0 4a2 2 0 110-4m-6 4a2 2 0 100-4m0 4a2 2 0 110-4"></path></svg>
                  Free Resources
                </span>
                {/* Weekly Practical Guides */}
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-medium whitespace-nowrap hover:bg-teal-200 dark:hover:bg-teal-800/50 hover:text-teal-800 dark:hover:text-teal-200 transition-all duration-200 cursor-pointer">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13.488m0-13.488a8.253 8.253 0 00-6.141 3.518c-.808 1.155-1.127 2.47-1.106 3.737.02 1.282.355 2.545.975 3.637.62.903 1.401 1.623 2.298 2.091 1.056.54 2.203.826 3.376.826.837 0 1.657-.14 2.417-.417.822-.294 1.572-.738 2.222-1.312a8.25 8.25 0 002.775-6.52c-.012-1.116-.279-2.226-.788-3.238-.508-1.011-1.226-1.89-2.09-2.585-1.111-.887-2.45-1.353-3.805-1.353z"></path></svg>
                  Weekly Guides
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
                <a href="/blogs"
                  className="w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-8 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Explore practical AI guides and tutorials"
                  itemProp="url">
                  📖 Start Learning Now
                </a>
                <a href="/free-resources"
                  className="w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-8 py-4 border border-gray-400 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg transition-all duration-200 transform hover:translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  aria-label="Get free AI resources and join our community"
                  itemProp="url">
                  🎁 Get Free Resources
                </a>
              </div>

              {/* NEW: Social proof */}
              <p className="mt-8 text-sm text-gray-600 dark:text-gray-300">
                  Join a growing community of AI enthusiasts and SEO pros already boosting their strategies!
              </p>

              {/* KEY CHANGE 7: Updated Trust Indicator */}
              {/* Replace your trust indicator with this: */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  🔒 No signup required for most content • 📧 Weekly practical tips • 🎁 Free downloads
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Perfect for: Digital Marketers • Content Creators • Developers • SEO Experts • AI Beginners
                </p>
              </div>

            </div>
          </main>

        </div>
      </div>

      {/* AI-Themed Background Elements - Top Right */}

    </section>
  );
};

export default Hero;
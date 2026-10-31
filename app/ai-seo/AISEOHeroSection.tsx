"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAnimationCleanup } from '@/components/Hero/useAnimationCleanup';

// Critical content selectors for FCP optimization
const criticalContentSelectors = {
  mainHeading: '.ai-seo-heading',
  primarySubheading: '.ai-seo-content',
  primaryCTA: '.ai-seo-cta-button',
};

const AISEOHero = ({ }) => {
  const heroRef = useRef(null);
  const { addCleanup } = useAnimationCleanup();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Screen size detection
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation setup
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Ensure critical elements are never hidden
    const criticalElements = document.querySelectorAll(
      `${criticalContentSelectors.mainHeading}, ${criticalContentSelectors.primarySubheading}, ${criticalContentSelectors.primaryCTA}`
    );
    criticalElements.forEach(el => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'none';
    });

    // Defer heavy animations
    const deferAnimations = () => {
      if (heroRef.current) {
        heroRef.current.classList.add('ai-seo-animations-active');
        if (prefersReducedMotion) {
          heroRef.current.classList.add('reduced-motion');
          document.querySelectorAll('.ai-seo-badge, .ai-seo-benefit-card, .ai-seo-value, .ai-seo-cta-secondary, .ai-seo-background-svg').forEach(el => {
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

  // Intersection Observer for animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const targetElement = entry.target as HTMLElement | SVGElement;
        if (heroRef.current?.classList.contains('ai-seo-animations-active')) {
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

  return (
    <section
      id="ai-seo-hero"
      className="relative ai-seo-hero bgz-10  overflow-hidden bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900  flex items-center justify-center pt-[40px] pb-[60px]"
      ref={heroRef}
      aria-labelledby="ai-seo-heading"
      aria-describedby="ai-seo-description"
      role="banner"
    >
      {/* Animated Background SVG */}
      {!isSmallScreen && (
        <div className="absolute inset-0 z-[-1] opacity-30 lg:opacity-100 ai-seo-background-svg">
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
            aria-label="Abstract AI SEO network background with data flow"
          >
            <g aria-hidden="true">
              {/* SEO Data Flow Lines */}
              <path
                d="M 100 400 Q 300 350, 500 400 T 900 400"
                stroke="#3B82F6"
                strokeWidth="2"
                opacity="0.5"
                strokeDasharray="15 10"
                className="svg-animated-element"
                style={{ animation: 'svgDataFlow 10s linear infinite' }}
              />
              <path
                d="M 150 500 Q 350 450, 550 500 T 950 500"
                stroke="#8B5CF6"
                strokeWidth="2"
                opacity="0.4"
                strokeDasharray="20 8"
                className="svg-animated-element"
                style={{ animation: 'svgDataFlowSlow 12s linear infinite', animationDelay: '2s' }}
              />
              
              {/* Animated Search Nodes */}
              <circle
                cx="300"
                cy="380"
                r="12"
                fill="#3B82F6"
                opacity="0.6"
                className="svg-animated-element"
                style={{ animation: 'svgGlowPulse 4s ease-in-out infinite' }}
              />
              <circle
                cx="600"
                cy="480"
                r="10"
                fill="#8B5CF6"
                opacity="0.7"
                className="svg-animated-element"
                style={{ animation: 'svgGlowPulse 5s ease-in-out infinite', animationDelay: '1s' }}
              />
              <circle
                cx="900"
                cy="420"
                r="14"
                fill="#10B981"
                opacity="0.5"
                className="svg-animated-element"
                style={{ animation: 'svgFloatSlow 6s ease-in-out infinite' }}
              />
            </g>
          </svg>
        </div>
      )}

      <div className="container mx-auto flex flex-col items-center justify-center px-2 lg:px-8 max-w-7xl">
        <div className="ai-seo-section w-full">
          {/* Header Section */}
          <header className="text-center mb-8">
            {/* Free Badge */}
          
            {/* Main Heading */}
 
   <header className="text-center mb-8">
  {/* SEO-Optimized H1: Category + Value Proposition */}
  <h1
        id="ai-seo-heading"
        className="ai-seo-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 dark:text-white no-shift leading-tight"
        itemProp="headline"
      >
        {/* Brand/Category Name - Matches homepage blue styling */}
        <span className="block text-blue-600 dark:text-blue-400 transition-all duration-300 mb-2">
Free AI SEO Hub {/* The colon tells Google: "The following text is about this category" */}        </span>
        
        {/* Value Proposition - Matches homepage structure */}
        <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 dark:text-gray-100">
        {" "}  Master Modern Search Optimization with AI
          
          {/* Animated AI Star Icon - Same as homepage */}
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
                verticalAlign: 'middle'
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

 <p className="primary-content hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-6 text-lg font-medium leading-relaxed text-gray-600 dark:text-gray-200 sm:text-xl lg:text-lg xl:text-xl no-shift max-w-4xl mx-auto">
        <span className="block sm:inline">
          Learn how to use Artificial Intelligence to boost your rankings, create better content,
        </span>
        <br className="hidden sm:inline"/>
        <span className="block sm:inline">
          and get cited as a trusted source <span className="font-semibold text-blue-600 dark:text-blue-400">across all modern search and discovery engines.</span>
        </span>
      </p>

  {/* Supporting Description */}
  {/* <p className="primary-content hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-6 text-lg font-medium leading-relaxed text-gray-600 dark:text-gray-200 sm:text-xl lg:text-lg xl:text-xl no-shift max-w-4xl mx-auto">
    <span className="block sm:inline">
      Your go-to hub for learning how to use AI to 
      <span className="font-semibold text-blue-600 dark:text-blue-400"> boost rankings and optimize content,</span>
    </span>
    <br className="hidden sm:inline"/>
    <span className="block sm:inline">
      helping you <span className="font-bold text-blue-600 dark:text-blue-400">maximize citations and visibility</span> across all modern search and discovery engines.
    </span>
  </p> */}



</header>
      
      {/* Supporting Description - Matches homepage structure */}
   
          </header>

          {/* Topic Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="ai-seo-badge badge-2 inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium whitespace-nowrap shadow-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              AI SEO Fundamentals
            </span>
           
            <span className="ai-seo-badge badge-4 inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium whitespace-nowrap shadow-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
              Content Creation
            </span>
             <span className="ai-seo-badge badge-3 inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium whitespace-nowrap shadow-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              GEO & AEO Strategies
            </span>
            <span className="ai-seo-badge badge-5 inline-flex items-center px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium whitespace-nowrap shadow-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Free Tools & Prompts
            </span>
          </div>

          <main className="max-w-6xl mx-auto">
            {/* Benefits Section */}
           <div className="mb-12">
  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-white text-center">
    Why This AI SEO Hub Stands Out
  </h2>


<div className="grid md:grid-cols-3 gap-6 mb-8">
  {/* Card 1: Practical Guidance (Blue Highlight) */}
  <div className="ai-seo-benefit-card card-1 group p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl backdrop-blur-sm border border-blue-200 dark:border-blue-700 ring-blue-200 dark:ring-blue-700 no-shift shadow-sm hover:shadow-md hover:shadow-blue-100/50 dark:hover:shadow-none transition-all duration-300">
    <div className="ai-icon-pulse flex items-center justify-center w-12 h-12 mb-3 bg-[#5271ff] rounded-lg mx-auto group-hover:-translate-y-1 transition-transform duration-300">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-200 text-center">
      Step-by-Step, Real-World AI SEO
    </h3>
    <p className="text-gray-700 dark:text-gray-300 text-base text-center">
      Every article breaks down AI SEO concepts into <span className="font-semibold text-blue-800 dark:text-blue-300">clear steps</span> that help you improve rankings, user engagement, and visibility across modern search engines.
    </p>
  </div>

  {/* Card 2: Examples & Prompts (Purple) */}
  <div className="ai-seo-benefit-card card-2 group p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-300 dark:border-gray-700 cursor-pointer no-shift shadow-sm hover:shadow-md hover:shadow-purple-100/50 dark:hover:shadow-none transition-all duration-300">
    <div className="ai-icon-pulse pulse-purple flex items-center justify-center w-12 h-12 mb-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto group-hover:-translate-y-1 transition-transform duration-300">
      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200 text-center">
      Built with Real Workflows
    </h3>
    <p className="text-gray-600 dark:text-gray-300 text-base text-center">
      You get real examples, tested prompts, and tools based on <span className="font-semibold text-purple-600 dark:text-purple-400">proven techniques</span> we actively use in our own content and AI-driven workflows.
    </p>
  </div>

  {/* Card 3: Free & Updated (Green) */}
  <div className="ai-seo-benefit-card card-3 group p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-300 dark:border-gray-700 cursor-pointer no-shift shadow-sm hover:shadow-md hover:shadow-green-100/50 dark:hover:shadow-none transition-all duration-300">
    <div className="ai-icon-pulse pulse-green flex items-center justify-center w-12 h-12 mb-3 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto group-hover:-translate-y-1 transition-transform duration-300">
      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-200 text-center">
      Free Resources, Always Updated
    </h3>
    <p className="text-gray-600 dark:text-gray-300 text-base text-center">
      All guides and resources are free and <span className="font-semibold text-green-600 dark:text-green-400">regularly updated</span> to reflect modern changes in AI models, search behavior, and optimization.
    </p>
  </div>
</div>


</div>


{/* Call to Action Buttons */}
<div className="mt-10 ">
  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
    {/* Primary CTA */}
    <a
      href="#explore-topics"
      className="group w-full sm:w-auto inline-flex items-center justify-center min-h-[56px] px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
      aria-label="Browse all AI SEO topics and guides"
    >
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
      
      <svg className="w-6 h-6 mr-3 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
      <span  onClick={() => {
    document.getElementById('seo-search-section').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }} className="relative z-10">Browse AI SEO Blogs</span>
      <svg className="w-5 h-5 ml-3 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </a>
    
    {/* Secondary CTA */}
   <a
  href="/free-ai-resources"
  className="
    w-full sm:w-auto inline-flex items-center justify-center min-h-[56px] px-10 py-4 
    /* Base Styling */
    border-2 border-blue-600 dark:border-blue-500 
    bg-transparent text-blue-600 dark:text-blue-400 
    text-lg font-semibold rounded-xl 
    /* Interaction & Animation */
    transition-all duration-300 ease-out transform
    /* Light Mode Hover: Soft shadow, subtle scale, and brand-tinted background */
    hover:bg-blue-50/50 hover:shadow-lg hover:shadow-blue-200/50 hover:-translate-y-0.5
    /* Dark Mode Hover: Border glow and deep blue tint */
    dark:hover:bg-blue-950/30 dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] dark:hover:border-blue-400
    active:scale-95
  "
  aria-label="Access free AI tools and resources"
>
  <svg 
    className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:translate-y-1" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    strokeWidth="2.5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
  Free AI SEO Resources
</a>
  </div>
  
  {/* Small Scroll Indicator */}
  <div className="text-center mt-6">
    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
      <svg className="w-4 h-4 mr-1 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
      Scroll to explore by category
    </p>
  </div>
</div>          
          </main>
        </div>
      </div>
    </section>
  );
};

export default AISEOHero;
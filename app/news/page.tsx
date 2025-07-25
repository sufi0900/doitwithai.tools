// /* eslint-disable @next/next/no-img-element */
// /* eslint-disable react/no-unescaped-entities */
// "use client";


// import { useEffect, useRef, useCallback, useState } from 'react'; // Added useCallback
// import AnimatedBinaryText from '@/components/Hero/AnimatedBinaryText'; // Adjust path if needed
// import { useAnimationCleanup } from '@/components/Hero/useAnimationCleanup'; // Adjust path
// import "./css.css"
// // Key Changes for FCP Optimization (already implemented, retaining here for context):
// const criticalContentSelectors = {
//   mainHeading: '.ai-heading',
//   primarySubheading: '.primary-content',
//   primaryCTA: '.press-button',
// };

// const Hero = () => {
//   const heroRef = useRef<HTMLElement>(null);
//   const { addCleanup } = useAnimationCleanup();
//   // Removed showSecondaryContent, showBenefits, showCTA as their animation
//   // will now be handled purely by CSS transitions triggered by hero-animations-active
//   // and specific staggered classes.
//   // We keep them as state if you still need to control other JS-driven behaviors,
//   // but for the visual animation of these elements, CSS is taking over.
//   // For the purpose of this animation enhancement, these states are no longer
//   // *directly* controlling opacity/transform for these specific elements.

//   // --- MODIFIED useEffect for initial hero animations and reduced motion preference ---
//   useEffect(() => {
//     const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

//     // CRITICAL: Ensure these elements are NEVER hidden by initial CSS animations
//     const criticalElements = document.querySelectorAll(
//       `${criticalContentSelectors.mainHeading},
//        ${criticalContentSelectors.primarySubheading},
//        ${criticalContentSelectors.primaryCTA}`
//     );

//     criticalElements.forEach(el => {
//       (el as HTMLElement).style.opacity = '1';
//       (el as HTMLElement).style.transform = 'none';
//       el.classList.remove('animated-staggered-item'); // Remove animation class if present
//       el.classList.remove('p1-animate', 'p1-span-animate'); // Remove other animation classes
//     });

//     let timer: NodeJS.Timeout;
//     timer = setTimeout(() => {
//       if (heroRef.current) {
//         requestAnimationFrame(() => {
//           heroRef.current!.classList.add('hero-animations-active');
//           if (prefersReducedMotion) {
//             heroRef.current!.classList.add('reduced-motion');
//             // For reduced motion, ensure all animated items are instantly visible
//             // We still need to target the specific new classes for this
//             document.querySelectorAll(
//               '.audience-badge, .ai-benefit-card, .value-indicator, .press-button-secondary' // Target the new animated elements
//             ).forEach(el => {
//               const htmlEl = el as HTMLElement;
//               htmlEl.style.opacity = '1';
//               htmlEl.style.transform = 'none';
//               // Remove transition-delay for instant appearance in reduced motion
//               htmlEl.style.transitionDelay = '0s';
//             });
//           }
//         });
//       }
//     }, 100); // Small delay to allow critical elements to render before animations start

//     addCleanup(() => clearTimeout(timer));
//     return () => clearTimeout(timer);
//   }, [addCleanup]);

//   // --- Keep other useEffects as they are for non-visual logic if still needed ---
//   // IntersectionObserver for continuous background animations (SVGs, shimmer)
//   useEffect(() => {
//     const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
//     if (prefersReducedMotion) {
//       document.querySelectorAll('svg circle, svg path, svg rect, svg polygon').forEach(el => {
//         el.classList.remove('animate-svg');
//       });
//       return;
//     }

//     const observer = new IntersectionObserver((entries) => {
//       entries.forEach((entry) => {
//         const targetElement = entry.target as HTMLElement | SVGElement;
//         if (targetElement.classList.contains('ai-benefit-card')) {
//           // No direct style.animationPlayState here, as it's controlled by hover in CSS.
//         } else if (targetElement.classList.contains('svg-animated-element')) {
//           if (entry.isIntersecting) {
//             targetElement.classList.add('animate-svg');
//           } else {
//             targetElement.classList.remove('animate-svg');
//           }
//         } else if ((targetElement instanceof HTMLElement || targetElement instanceof SVGElement) &&
//           (targetElement.style.animation || targetElement.classList.contains('animate-pulse') || targetElement.classList.contains('animate-shimmer-custom'))) {
//           if (entry.isIntersecting) {
//             (targetElement as HTMLElement).style.animationPlayState = 'running';
//           } else {
//             (targetElement as HTMLElement).style.animationPlayState = 'paused';
//           }
//         }
//       });
//     }, { threshold: 0.1 });

//     const elementsToObserve = document.querySelectorAll(
//       '.svg-animated-element,' +
//       '[style*="animation"],' +
//       '.animate-pulse,' +
//       '.animate-shimmer-custom,' +
//       '.ai-benefit-card'
//     );
//     elementsToObserve.forEach((el) => observer.observe(el));

//     addCleanup(() => observer.disconnect());
//     return () => observer.disconnect();
//   }, [addCleanup]);

//   // THIS useEffect for pausing animations when tab is not active (essential for continuous animations)
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       const animatedElements = document.querySelectorAll(
//         '[style*="animation"],.animate-pulse,.animate-shimmer-custom,.svg-animated-element,.ai-benefit-card'
//       );
//       animatedElements.forEach(el => {
//         const targetElement = el as HTMLElement;
//         if (document.hidden) {
//           if (targetElement.classList.contains('ai-benefit-card')) {
//             targetElement.style.setProperty('--animation-play-state', 'paused');
//           } else {
//             targetElement.style.animationPlayState = 'paused';
//           }
//         } else {
//           if (targetElement.classList.contains('ai-benefit-card')) {
//             targetElement.style.setProperty('--animation-play-state', 'running');
//           } else {
//             targetElement.style.animationPlayState = 'running';
//           }
//         }
//       });
//     };

//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     addCleanup(() => document.removeEventListener('visibilitychange', handleVisibilityChange));
//     return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
//   }, [addCleanup]);


//   // --- MODIFIED JSX Structure - Add Specific Staggering Classes ---
//   return (
//     <section
//       id="home"
//       className="relative z-10 overflow-hidden bg-teal-50 dark:bg-gray-800 min-h-screen flex items-center justify-center py-16 md:py-[75px]"
//       ref={heroRef}
//       aria-labelledby="hero-heading"
//       aria-describedby="hero-description"
//       role="banner"
//     >
//       <div className="container mx-auto flex flex-col items-center justify-center px-2 lg:px-8 max-w-7xl">
//         <div className="hero-section w-full">

//           {/* CRITICAL CONTENT - NO ANIMATION DELAYS */}
//           <header className="text-center mb-8">
//             <h1
//               id="hero-heading"
//               className="ai-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 dark:text-white no-shift"
//               itemProp="headline"
//             >
//               <span className="block">Welcome to</span>
//               <span className="block text-blue-600 dark:text-blue-400 transition-all duration-300">
//                 DO IT WITH AI TOOLS
//               </span>
//             </h1>
//   <p className="primary-content hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-6 text-lg font-medium leading-relaxed text-gray-600 dark:text-gray-200 sm:text-xl lg:text-lg xl:text-xl no-shift">
//             <span className="block sm:inline">
//               <span className="font-semibold text-blue-600 dark:text-blue-400">More than just another AI blog</span>
//               — we're your <span className="font-semibold text-blue-600 dark:text-blue-400">go-to resource hub</span>
//             </span>
//             <br className="hidden sm:inline"/>
//             <span className="block sm:inline">
//               for mastering AI tools that <span className="font-semibold text-purple-600 dark:text-purple-400">boost SEO and productivity</span>
//             </span>
//           </p>
//           </header>

//           {/* --- AUDIENCE TARGETING BADGES SECTION START --- */}
//           {/* Removed conditional rendering as CSS handles initial state */}
//           <div className="flex flex-wrap justify-center gap-3 mb-8">
//             {/* Added badge-X classes */}
//             <span className="audience-badge badge-1 inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium whitespace-nowrap shadow-sm no-shift">
//               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
//               SEO Experts
//             </span>
//             <span className="audience-badge badge-2 inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium whitespace-nowrap shadow-sm no-shift">
//               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13.488m0-13.488a8.253 8.253 0 00-6.141 3.518c-.808 1.155-1.127 2.47-1.106 3.737.021.282.355 2.545.975 3.637.62.903 1.401 1.623 2.298 2.091 1.056.542 2.203.826 3.376.826.837 0 1.657-.142.417-.417.822-.294 1.572-.738 2.222-1.312a8.258 8.25 0 002.775-6.52c-.012-1.116-.279-2.226-.788-3.238-.508-1.011-1.226-1.89-2.09-2.585-1.111-.887-2.45-1.353-3.805-1.353z"></path></svg>
//               Digital Marketers
//             </span>
//             <span className="audience-badge badge-3 inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium whitespace-nowrap shadow-sm no-shift">
//               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
//               Content Creators
//             </span>
//             <span className="audience-badge badge-4 inline-flex items-center px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium whitespace-nowrap shadow-sm no-shift">
//               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
//               Developers
//             </span>
//             <span className="audience-badge badge-5 inline-flex items-center px-4 py-2 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-sm font-medium whitespace-nowrap shadow-sm no-shift">
//               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
//               AI Beginners
//             </span>
//           </div>

//           <main className="max-w-6xl mx-auto text-center">
//             {/* BENEFITS SECTION - Animated */}
//             {/* Removed conditional rendering as CSS handles initial state */}
//             <div className="mb-8">
//               <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-white">Why DoItWithAI.tools Stands Out</h2>
//               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//                 {/* Benefit 1 - SEO Focus (PRIMARY) */}
//                 {/* Added card-X classes, removed p1-animate from card as we have specific card animation now */}
//                 <div className="ai-benefit-card card-1 group p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl backdrop-blur-sm border border-blue-200 dark:border-blue-700 cursor-pointer ring-blue-200 dark:ring-blue-700 no-shift">
//                   <div className="ai-icon-pulse flex items-center justify-center w-12 h-12 mb-3 bg-[#2563eb] dark:bg-blue-600 rounded-lg mx-auto">
//                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
//                   </div>
//                   <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Rank Higher with AI-Powered SEO</h3>
//                   <p className="text-gray-600 dark:text-gray-300">Master<span className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-200">&nbsp;ChatGPT and other AI tools for SEO&nbsp;</span>with strategies that<span className="font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors duration-200">&nbsp;save 10+ hours weekly and&nbsp;</span>boost your overall rankings.</p>
//                 </div>
//                 {/* Benefit 2 - Productivity (SECONDARY) */}
//                 {/* Added card-X classes, removed p2-animate from card */}
//                 <div className="ai-benefit-card card-2 card-purple group p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 cursor-pointer no-shift">
//                   <div className="ai-icon-pulse pulse-purple flex items-center justify-center w-12 h-12 mb-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto">
//                     <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10l3-3m0 0l-3-3m3 3H4"/></svg>
//                   </div>
//                   <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">10x Your Daily Productivity</h3>
//                   <p className="text-gray-600 dark:text-gray-300"><span className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors duration-200">&nbsp;Improve your daily workflow&nbsp;</span>with the best AI tools, upskilling resources, and premium AI assets—all completely<span className="font-bold text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors duration-200">&nbsp;FREE&nbsp;</span>.</p>
//                 </div>
//                 {/* Benefit 3 - Accessibility (SUPPORTING) */}
//                 {/* Added card-X classes, removed p3-animate from card */}
//                 <div className="ai-benefit-card card-3 card-green group p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 cursor-pointer no-shift">
//                   <div className="ai-icon-pulse pulse-green flex items-center justify-center w-12 h-12 mb-3 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto">
//                     <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
//                   </div>
                
                
                
//             <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">From Beginner to AI Expert</h3>


// <p className="text-gray-600 dark:text-gray-300">
//   We bridge the gap between AI's potential and real use, offering
//   <span className="font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors duration-200">&nbsp;simple tutorials&nbsp;</span>
//   for all levels to work smarter with AI.
// </p>



// </div>
//  </div>
//             </div>

//             {/* Call to Action with Original Closing Message */}
//             {/* Removed conditional rendering as CSS handles initial state */}
//             <div className="mb-8">
//               <div className="max-w-2xl mx-auto text-center mb-8">
//     <p className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Ready to make AI <span className="text-blue-600 dark:text-blue-400">work smarter for you</span>?</p>
//                 <p className="text-base text-gray-600 dark:text-gray-300 mb-6">From boosting your SEO ranking to automating tasks and sparking new ideas, find all the AI tools and tutorials you need here.</p>
//               </div>

//               {/* Enhanced value proposition */}
//               {/* Added value-X classes, removed p4-animate */}
//               <div className="flex flex-wrap justify-center gap-2 mb-6">
//                 <span className="value-indicator value-1 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium whitespace-nowrap no-shift">
//                   <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
//                   AI-Powered SEO
//                 </span>
//                 <span className="value-indicator value-2 inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium whitespace-nowrap no-shift">
//                   <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1H8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
//                   10x Productivity
//                 </span>
//                 <span className="value-indicator value-3 inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium whitespace-nowrap no-shift">
//                   <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
//                   50+ Free Resources
//                 </span>
//                 <span className="value-indicator value-4 inline-flex items-center px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-medium whitespace-nowrap no-shift">
//                   <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13.488m0-13.488a8.253 8.253 0 00-6.141 3.518c-.808 1.155-1.127 2.47-1.106 3.737.021.282.355 2.545.975 3.637.62.903 1.401 1.623 2.298 2.091 1.056.542 2.203.826 3.376.826.837 0 1.657-.142.417-.417.822-.294 1.572-.738 2.222-1.312a8.258 8.25 0 002.775-6.52c-.012-1.116-.279-2.226-.788-3.238-.508-1.011-1.226-1.89-2.09-2.585-1.111-.887-2.45-1.353-3.805-1.353z"></path></svg>
//                   Weekly Updates
//                 </span>
//               </div>

//               {/* CRITICAL FIX: Clear CTA hierarchy with primary/secondary structure */}
//               <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
//                 {/* PRIMARY CTA - NO ANIMATION */}
//                 <a
//                   href="/blogs"
//                   className="press-button w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-8 py-4  text-white font-semibold rounded-lg no-shift"
//                   aria-label="Explore practical AI guides and tutorials"
//                   itemProp="url"
//                 >
//                   <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5.75 8.55 5.518S4.168 5.477 3.62 5.253v13C4.168 18.477 5.754 18.75 7.25 18.518s3.332.477 4.51.253m0-13C13.168 5.477 14.754 5.16 15.518 5.253c1.746 0 3.332.477 4.518.253v13C20.168 18.477 18.582 18.16 17.518 18.253c-1.746 0-3.332.477-4.518.253"/></svg>
//                   Start Learning Now
//                 </a>

//                 {/* SECONDARY CTA - Animated */}
//                 {/* Removed conditional rendering for showCTA from this element */}
//                 <a
//                   href="/free-resources"
//                   className="press-button-secondary w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-8 py-4 border border-gray-400 dark:border-gray-600 bg-transparent text-gray-800 dark:text-white font-semibold rounded-lg no-shift"
//                   aria-label="Get free AI resources and join our community"
//                   itemProp="url"
//                 >
//                   <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
//                   Get Free Resources
//                 </a>
//               </div>

//               {/* CRITICAL FIX: Enhanced trust indicator with social proof */}
//               <div className="mt-6 text-center">
//                 <p className="trust-text text-xs text-gray-500 dark:text-gray-400 mb-2 cursor-pointer">🔒No signup required for most content • 📧Weekly practical tips • 🎁Instant free downloads</p>
//                 <p className="trust-text text-xs text-gray-400 dark:text-gray-500 cursor-pointer">Perfect for: Digital Marketers • Content Creators • Developers • SEO Experts • AI Beginners</p>
//               </div>
//             </div>
//           </main>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Hero;
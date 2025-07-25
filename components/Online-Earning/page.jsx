// /*eslint-disable@next/next/no-img-element*/
// /*eslint-disable react/no-unescaped-entities*/
// "use client";

// import { useEffect, useRef, useCallback, useState } from 'react';
// import AnimatedBinaryText from './AnimatedBinaryText'; // Adjust path if needed
// import "./critical-hero.css"; // Ensure this CSS contains the optimized animations
// import { useAnimationCleanup } from './useAnimationCleanup'; // Adjust path
// import "./non-critical-hero.css"

// // Key Changes for FCP Optimization (already implemented, retaining here for context):
// const criticalContentSelectors = {
//   mainHeading: '.ai-heading',
//   primarySubheading: '.primary-content',
//   primaryCTA: '.press-button',
// };

// const Hero = () => {
//   const heroRef = useRef<HTMLElement>(null);
//   const { addCleanup } = useAnimationCleanup();

//   // --- MODIFIED useEffect for initial hero animations and reduced motion preference ---
//   useEffect(() => {
//     const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

//     // CRITICAL: Ensure these elements are NEVER hidden by initial CSS animations
//     const criticalElements = document.querySelectorAll(
//       `${criticalContentSelectors.mainHeading},${criticalContentSelectors.primarySubheading},${criticalContentSelectors.primaryCTA}`
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
//             document.querySelectorAll(
//               '.audience-badge,.ai-benefit-card,.value-indicator,.press-button-secondary,.background-svg-container' // <-- ADDED .background-svg-container
//             ).forEach(el => {
//               const htmlEl = el as HTMLElement;
//               htmlEl.style.opacity = '1';
//               htmlEl.style.transform = 'none';
//               htmlEl.style.transitionDelay = '0s'; // Remove transition-delay for instant appearance in reduced motion
//               // Also ensure SVG animations are not running in reduced motion
//               el.querySelectorAll('[style*="animation"], [class*="animate-"]').forEach(svgAnimEl => {
//                 (svgAnimEl as HTMLElement).style.animation = 'none';
//               });
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
//   // This useEffect will now primarily *pause* and *resume* animations, not trigger initial render.
//   useEffect(() => {
//     const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
//     if (prefersReducedMotion) {
//       // In reduced motion, we want to ensure SVGs don't animate at all
//       document.querySelectorAll('svg circle, svg path, svg rect, svg polygon').forEach(el => {
//         el.classList.remove('animate-svg'); // Remove classes that apply animations
//         (el as HTMLElement).style.animation = 'none'; // Directly disable any inline animations
//       });
//       return;
//     }

//     const observer = new IntersectionObserver((entries) => {
//       entries.forEach((entry) => {
//         const targetElement = entry.target as HTMLElement | SVGElement;
//         if (targetElement.classList.contains('ai-benefit-card')) {
//           // No direct style.animationPlayState here, as it's controlled by hover in CSS.
//         } else if (targetElement.classList.contains('svg-animated-element') || (targetElement instanceof HTMLElement || targetElement instanceof SVGElement) && (targetElement.style.animation || targetElement.classList.contains('animate-pulse') || targetElement.classList.contains('animate-shimmer-custom'))) {
//           // Only play animations if the `hero-animations-active` class is present on the hero section
//           // And the element is intersecting
//           if (heroRef.current?.classList.contains('hero-animations-active')) {
//             if (entry.isIntersecting) {
//               (targetElement as HTMLElement).style.animationPlayState = 'running';
//             } else {
//               (targetElement as HTMLElement).style.animationPlayState = 'paused';
//             }
//           } else {
//             // If hero-animations-active is not yet present, ensure they remain paused or unrendered
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
//           // Only resume if hero-animations-active is also present
//           if (heroRef.current?.classList.contains('hero-animations-active')) {
//             if (targetElement.classList.contains('ai-benefit-card')) {
//               targetElement.style.setProperty('--animation-play-state', 'running');
//             } else {
//               targetElement.style.animationPlayState = 'running';
//             }
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
//     <section id="home" className="relative z-10 overflow-hidden bg-teal-50 dark:bg-gray-800 min-h-screen flex items-center justify-center py-16 md:py-[75px]" ref={heroRef} aria-labelledby="hero-heading" aria-describedby="hero-description" role="banner">
//       {/* Background SVG elements - these are decorative */}
//       {/* ADDED background-svg-container class for initial hiding */}
//       <div className="absolute inset-0 z-[-1] opacity-30 lg:opacity-100 background-svg-container top-left-svg"> {/* Left SVG */}
//         <svg width="100%" height="100%" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-150 sm:scale-100" preserveAspectRatio="xMidYMid slice" style={{ transform: 'translateZ(0)', willChange: 'auto' }} role="img" aria-label="Abstract AI network background with pulsating nodes and dataflow lines">
//           {/* All SVG graphical elements are decorative and complex. Using aria-hidden="true" on the entire SVG or the main groups is the most appropriate way to prevent screen readers from announcing their individual complex paths/circles. The overall SVG element already has role="img" and aria-label. */}
//           <g aria-hidden="true">
//             {/* Replace the existing center sphere */}
//             {/* SEO growth lines with subtle flow animation */}
//             <path d="M100 700 C300 600, 500 500, 700 450" stroke="#3B82F6" strokeWidth="2" opacity="0.4" strokeDasharray="20 10" style={{ animation: 'svgDataFlowSlow 12s linear infinite' }} />
//             <path d="M150 750 C350 650, 550 550, 750 500" stroke="#A855F7" strokeWidth="2" opacity="0.4" strokeDasharray="15 8" style={{ animation: 'svgDataFlowSlow 15s linear infinite', animationDelay: '3s' }} />
//             {/* Animated smaller nodes (datapoints) */}
//             <circle cx="700" cy="700" r="18" fill="#4A6CF7" opacity="0.4" style={{ animation: 'svgGlowPulse 9s ease-in-out infinite', animationDelay: '3s' }} />
//           </g>
//         </svg>
//       </div>

//       {/* AI-Themed Background Elements - TopRight */}
//       {/* ADDED background-svg-container class for initial hiding */}
//       <div className="absolute right-0 top-0 z-[-1] opacity-30 lg:opacity-100 background-svg-container top-right-svg">
//         <svg width="450" height="556" viewBox="0 0 450 556" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Decorative neural network and circuit pattern in background">
//           <defs>
//             {/* Gradients */}
//             <linearGradient id="paint0_neural_gradient" x1="220" y1="40" x2="380" y2="200" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" /><stop offset="1" stopColor="#06B6D4" stopOpacity="0.3" /></linearGradient>
//             <linearGradient id="paint1_connection" x1="250" y1="80" x2="320" y2="160" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" /><stop offset="1" stopColor="#06B6D4" /></linearGradient>
//             <linearGradient id="paint2_connection" x1="280" y1="60" x2="380" y2="110" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6" /><stop offset="1" stopColor="#10B981" /></linearGradient>
//             <radialGradient id="paint3_node" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" /><stop offset="1" stopColor="#4A6CF7" stopOpacity="0.3" /></radialGradient>
//             <radialGradient id="paint4_node" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"><stop stopColor="#06B6D4" /><stop offset="1" stopColor="#06B6D4" stopOpacity="0.3" /></radialGradient>
//             <linearGradient id="paint5_circuit" x1="200" y1="250" x2="400" y2="400" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" stopOpacity="0.6" /><stop offset="1" stopColor="#06B6D4" stopOpacity="0.2" /></linearGradient>
//             <linearGradient id="paint6_circuit_lines" x1="220" y1="270" x2="380" y2="330" gradientUnits="userSpaceOnUse"><stop stopColor="#2563EB" /><stop offset="1" stopColor="#7C3AED" /></linearGradient>
//             <linearGradient id="paint7_binary" x1="100" y1="160" x2="200" y2="200" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6"/><stop offset="1" stopColor="#06B6D4"/></linearGradient> {/* Added missing gradient for binary text */}
//             <linearGradient id="paint8_geometric" x1="100" y1="450" x2="200" y2="450" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" stopOpacity="0.5"/><stop offset="1" stopColor="#06B6D4" stopOpacity="0.1"/></linearGradient>
//             <linearGradient id="paint9_geometric" x1="320" y1="480" x2="420" y2="480" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6" stopOpacity="0.4"/><stop offset="1" stopColor="#10B981" stopOpacity="0.1"/></linearGradient>
//             <linearGradient id="paint10_dataflow" x1="50" y1="350" x2="450" y2="350" gradientUnits="userSpaceOnUse"><stop stopColor="#2563EB"/><stop offset="1" stopColor="#7C3AED"/></linearGradient>
//           </defs>
//           <g aria-hidden="true">
//             <circle cx="300" cy="120" r="80" fill="url(#paint0_neural_gradient)" opacity="0.6" />
//             <path d="M250 80L320 100L280 140L350 120L320 160" stroke="url(#paint1_connection)" strokeWidth="2" opacity="0.7" strokeDasharray="15 5" className="svg-animated-element" style={{ animation: 'neuralFlow 12s linear infinite' }} />
//             <path d="M280 60L350 90L320 130L380 110" stroke="url(#paint2_connection)" strokeWidth="1.5" opacity="0.6" strokeDasharray="10 3" className="svg-animated-element" style={{ animation: 'neuralFlowReverse 15s linear infinite', animationDelay: '2s' }} />
//             <circle cx="250" cy="80" r="8" fill="#4A6CF7" opacity="0.8" />
//             <circle cx="320" cy="100" r="6" fill="#8B5CF6" opacity="0.9" />
//             <circle cx="280" cy="140" r="7" fill="#4A6CF7" opacity="0.8" />
//             <circle cx="350" cy="120" r="5" fill="#8B5CF6" opacity="0.9" />
//             <circle cx="320" cy="160" r="6" fill="#10B981" opacity="0.8" />
//             <circle cx="380" cy="110" r="4" fill="#10B981" opacity="0.9" />
//             {/*Circuit Pattern - STATIC */}
//             <rect x="200" y="250" width="200" height="150" rx="10" fill="none" stroke="url(#paint5_circuit)" strokeWidth="1" opacity="0.4" />
//             <path d="M220 270L380 270" stroke="url(#paint6_circuit_lines)" strokeWidth="1" opacity="0.7" strokeDasharray="8 4" className="svg-animated-element" style={{ animation: 'svgDataFlow 8s linear infinite' }} />
//             <path d="M220 290L350 290" stroke="url(#paint6_circuit_lines)" strokeWidth="1" opacity="0.7" strokeDasharray="8 4" className="svg-animated-element" style={{ animation: 'svgDataFlow 8s linear infinite', animationDelay: '0.5s' }} />
//             <path d="M220 310L380 310" stroke="url(#paint6_circuit_lines)" strokeWidth="1" opacity="0.7" strokeDasharray="8 4" className="svg-animated-element" style={{ animation: 'svgDataFlow 8s linear infinite', animationDelay: '1s' }} />
//             <path d="M220 330L350 330" stroke="url(#paint6_circuit_lines)" strokeWidth="1" opacity="0.7" strokeDasharray="8 4" className="svg-animated-element" style={{ animation: 'svgDataFlow 8s linear infinite', animationDelay: '1.5s' }} />
//             <circle cx="220" cy="270" r="4" fill="#4A6CF7" opacity="0.8" className="svg-animated-element" />
//             <circle cx="380" cy="270" r="4" fill="#4A6CF7" opacity="0.8" className="svg-animated-element" />
//             <circle cx="220" cy="290" r="4" fill="#06B6D4" opacity="0.8" className="svg-animated-element" />
//             <circle cx="350" cy="290" r="4" fill="#06B6D4" opacity="0.8" className="svg-animated-element" />
//             <circle cx="220" cy="310" r="4" fill="#8B5CF6" opacity="0.8" className="svg-animated-element" />
//             <circle cx="380" cy="310" r="4" fill="#8B5CF6" opacity="0.8" className="svg-animated-element" />
//             <circle cx="220" cy="330" r="4" fill="#10B981" opacity="0.8" className="svg-animated-element" />
//             <circle cx="350" cy="330" r="4" fill="#10B981" opacity="0.8" className="svg-animated-element" />
//             <g aria-label="Floating binary code display">
//               <AnimatedBinaryText initialText="01001001" x="150" y="160" fill="url(#paint7_binary)" fontSize="12" fontFamily="monospace" className="animated-binary-text" interval={2500} aria-label="Binary code" />
//               <AnimatedBinaryText initialText="11010110" x="160" y="175" fill="url(#paint7_binary)" fontSize="12" fontFamily="monospace" className="animated-binary-text" interval={2000} aria-label="Binary code" />
//               <AnimatedBinaryText initialText="00110101" x="140" y="190" fill="url(#paint7_binary)" fontSize="12" fontFamily="monospace" className="animated-binary-text" interval={3000} aria-label="Binary code" />
//             </g>
//             <polygon points="100,450 150,420 200,450 150,480" fill="url(#paint8_geometric)" opacity="0.4" />
//             <polygon points="320,480 370,450 420,480 370,510" fill="url(#paint9_geometric)" opacity="0.3" />
//             <path d="M50 350 Q150 320, 250 350 Q350 380, 450 350" stroke="url(#paint10_dataflow)" strokeWidth="2" fill="none" opacity="0" />
//           </g>
//         </svg>
//       </div>
//       {/* BottomLeftAI-ThemedBackgroundElements */}
//       {/* ADDED background-svg-container class for initial hiding */}
//       <div className="absolute bottom-0 left-0 z-[-1] opacity-30 lg:opacity-100 background-svg-container bottom-left-svg">
//         <svg width="364" height="201" viewBox="0 0 364 201" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Decorative dataflow and machine learning pattern in background">
//           <defs>
//             {/* DataFlow Gradients */}
//             <linearGradient id="paint0_dataflow_main" x1="184.389" y1="69.2405" x2="184.389" y2="212.24" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" stopOpacity="0" /><stop offset="0.5" stopColor="#06B6D4" /><stop offset="1" stopColor="#4A6CF7" /></linearGradient>
//             <linearGradient id="paint1_dataflow_secondary" x1="156.389" y1="69.2405" x2="156.389" y2="212.24" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6" stopOpacity="0" /><stop offset="1" stopColor="#8B5CF6" /></linearGradient>
//             <linearGradient id="paint2_dataflow_tertiary" x1="125.389" y1="69.2405" x2="125.389" y2="212.24" gradientUnits="userSpaceOnUse"><stop stopColor="#10B981" stopOpacity="0" /><stop offset="1" stopColor="#10B981" /></linearGradient>
//             {/* Analytics Core */}
//             <radialGradient id="paint3_analytics_core" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(220 63) rotate(90) scale(35)"><stop offset="0" stopColor="#4A6CF7" stopOpacity="0.3" /><stop offset="1" stopColor="#06B6D4" stopOpacity="0.1" /></radialGradient>
//             {/* Connection Lines */}
//             <linearGradient id="paint4_connections" x1="190" y1="35" x2="250" y2="85" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" /><stop offset="1" stopColor="#06B6D4" /></linearGradient>
//             {/* ML Pattern */}
//             <linearGradient id="paint5_ml_pattern" x1="50" y1="120" x2="130" y2="160" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6" /><stop offset="1" stopColor="#10B981" /></linearGradient>
//             {/* Algorithm Flow */}
//             <linearGradient id="paint6_algorithm" x1="280" y1="100" x2="360" y2="140" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" /><stop offset="1" stopColor="#10B981" /></linearGradient>
//           </defs>
//           <g aria-hidden="true">
//             {/*DataFlowCurves*/}
//             {/* These paths were commented out in your provided code, so they remain commented. */}
//             {/*<path d="M5.88928 72.33C33.6599 66.479 101.397 64.908 150.178 105.427C211.155 156.076 229.591 62.093 264.333 66.607C299.076 71.123 337.718 83.657 362.889 212.24" stroke="url(#paint0_dataflow_main)" strokeWidth="2" strokeDasharray="15 10" className="svg-animated-element" style={{ animation: 'svgDataFlowSlow 20s linear infinite' }}/>*/}
//             {/*<path d="M-22.11077 72.3303C5.65989 66.479 73.3965 64.9086 122.178 105.427C183.155 156.076 201.591 62.093 236.333 66.607C271.076 71.123 309.718 83.657 334.889 212.24" stroke="url(#paint1_dataflow_secondary)" strokeWidth="1.5" opacity="0.5" strokeDasharray="12 8" className="svg-animated-element" style={{ animation: 'svgDataFlowSlow 25s linear infinite', animationDelay: '5s' }}/>*/}
//             {/*<path d="M-53.11077 72.3303C-25.3401 66.479 42.3965 64.9086 91.1783 105.427C152.155 156.076 170.591 62.093 205.333 66.607C240.076 71.122 278.718 83.657 303.889 212.24" stroke="url(#paint2_dataflow_tertiary)" strokeWidth="1" opacity="0.5"/>*/}
//             {/* AI Analytics Visualization */}
//             <circle cx="220" cy="63" r="35" fill="url(#paint3_analytics_core)" opacity="0.8" />
//             <g className="svg-animated-element rotating-needle" style={{ animation: 'smoothOrbitRotation 25s ease-in-out infinite' }}>
//               <circle cx="255" cy="63" r="3" fill="#2563EB" opacity="0.8" />
//               <path d="M220 63L255 63" stroke="#2563EB" strokeWidth="1.5" opacity="0.9" />
//             </g>
//             <circle cx="240" cy="40" r="3" fill="#8B5CF6" opacity="0.6" className="svg-animated-element" style={{ animation: 'svgGlowPulse 12s ease-in-out infinite', animationDelay: '2s' }} />
//             <circle cx="195" cy="85" r="3" fill="#F59E0B" opacity="0.6" className="svg-animated-element" style={{ animation: 'svgFloatSlow 8s ease-in-out infinite', animationDelay: '4s' }} />
//             <circle cx="250" cy="70" r="2" fill="#10B981" opacity="0.6" className="svg-animated-element" style={{ animation: 'svgNodePulse 9s ease-in-out infinite', animationDelay: '6s' }} />
//             <circle cx="195" cy="85" r="3" fill="#F59E0B" opacity="0.8" />
//             {/* Connection Lines to Data Points */}
//             <path d="M220 63L190 45M220 63L210 35M220 63L240 40M220 63L250 70M220 63L195 85" stroke="url(#paint4_connections)" strokeWidth="1" opacity="0.4" />
//             {/* Machine Learning Pattern */}
//             <rect x="50" y="120" width="80" height="40" rx="5" fill="none" stroke="url(#paint5_ml_pattern)" strokeWidth="1" opacity="0.4" />
//             {/* ML Nodes */}
//             <circle cx="70" cy="130" r="2" fill="#4A6CF7" className="svg-animated-element" style={{ animation: 'gentleStrike 4s ease-in-out infinite', animationDelay: '0s' }} />
//             <circle cx="90" cy="135" r="2" fill="#06B6D4" className="svg-animated-element" style={{ animation: 'gentleStrikeReverse 4s ease-in-out infinite', animationDelay: '0.5s' }} />
//             <circle cx="110" cy="140" r="2" fill="#8B5CF6" className="svg-animated-element" style={{ animation: 'gentleStrike 4s ease-in-out infinite', animationDelay: '1s' }} />
//             <circle cx="70" cy="150" r="2" fill="#10B981" className="svg-animated-element" style={{ animation: 'gentleStrikeReverse 4s ease-in-out infinite', animationDelay: '1.5s' }} />
//             <circle cx="90" cy="145" r="2" fill="#F59E0B" className="svg-animated-element" className="svg-animated-element" style={{ animation: 'gentleStrike 4s ease-in-out infinite', animationDelay: '2s' }} />
//             <circle cx="110" cy="150" r="2" fill="#EF4444" className="svg-animated-element" style={{ animation: 'gentleStrikeReverse 4s ease-in-out infinite', animationDelay: '2.5s' }} />
//             {/* Algorithm Flow */}
//             <path d="M280 100L320 110L340 130L360 140" stroke="url(#paint6_algorithm)" strokeWidth="2" fill="none" opacity="0.6" />
//             {/* Algorithm Nodes */}
//             <circle cx="280" cy="100" r="4" fill="#4A6CF7" />
//             <circle cx="320" cy="110" r="3" fill="#06B6D4" />
//             <circle cx="340" cy="130" r="3" fill="#8B5CF6" />
//             <circle cx="360" cy="140" r="4" fill="#10B981" />
//           </g>
//         </svg>
//       </div>
//     </section>
//   );
// };

// export default Hero;
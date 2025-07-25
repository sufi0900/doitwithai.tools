/*eslint-disable @next/next/no-img-element */
/*eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useRef, useCallback, useState } from 'react'; // Added useCallback
import AnimatedBinaryText from '@/components/Hero/AnimatedBinaryText'; // Adjust path if needed
import "@/components/Hero/critical-hero.css"; // Ensure this CSS contains the optimized animations
import { useAnimationCleanup } from '@/components/Hero/useAnimationCleanup'; // Adjust path



const Hero = () => {

  const heroRef = useRef<HTMLElement>(null);
  const { addCleanup } = useAnimationCleanup();

  const [showSecondaryContent, setShowSecondaryContent] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer: NodeJS.Timeout;

    timer = setTimeout(() => {
      if (heroRef.current) {
        requestAnimationFrame(() => {
          heroRef.current!.classList.add('hero-animations-active');

          if (prefersReducedMotion) {
            heroRef.current!.classList.add('reduced-motion');
            setShowSecondaryContent(true);
            setShowBenefits(true);
            setShowCTA(true);

            document.querySelectorAll('.animated-staggered-item').forEach(el => {
              const htmlEl = el as HTMLElement;
              htmlEl.style.opacity = '1';
              htmlEl.style.transform = 'none';
            });
          } else {
            setTimeout(() => setShowSecondaryContent(true), 800);
            setTimeout(() => setShowBenefits(true), 1600);
            setTimeout(() => setShowCTA(true), 2400);
          }
        });
      }
    }, 100);

    addCleanup(() => clearTimeout(timer));
    return () => clearTimeout(timer);
  }, [addCleanup]);


  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      document.querySelectorAll('svg circle, svg path, svg rect, svg polygon').forEach(el => {
        el.classList.remove('animate-svg');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const targetElement = entry.target as HTMLElement | SVGElement;

        if (targetElement.classList.contains('svg-animated-element')) {
          if (entry.isIntersecting) {
            targetElement.classList.add('animate-svg');
          } else {
            targetElement.classList.remove('animate-svg');
          }
        }
        else if (
          (targetElement instanceof HTMLElement || targetElement instanceof SVGElement) &&
          (targetElement.style.animation ||
            targetElement.classList.contains('animate-pulse') ||
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


 
  useEffect(() => {
    const handleVisibilityChange = () => {
      const animatedElements = document.querySelectorAll(
        '[style*="animation"], .animate-pulse, .animate-shimmer-custom, .svg-animated-element'
      );

      animatedElements.forEach(el => {
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
  }, [addCleanup]);


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
      <div className="absolute inset-0 z-[-1] opacity-30 lg:opacity-50">
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
          aria-label="Abstract AI network background with pulsating nodes and data flow lines"
        >
          <defs>
            {/* Gradients - no direct ARIA needed as they are referenced by other elements */}
            <radialGradient id="centerGradient1" cx="0" cy="0" r="1"><stop stopColor="#4A6CF7" stopOpacity="0.6"/><stop offset="0.7" stopColor="#6366F1" stopOpacity="0.4"/><stop offset="1" stopColor="#6366F1" stopOpacity="0.2"/></radialGradient>
            <radialGradient id="centerGradient2" cx="0" cy="0" r="1"><stop stopColor="#06B6D4" stopOpacity="0.6"/><stop offset="0.7" stopColor="#3B82F6" stopOpacity="0.4"/><stop offset="1" stopColor="#3B82F6" stopOpacity="0.2"/></radialGradient>
            <radialGradient id="centerGradient3" cx="0" cy="0" r="1"><stop stopColor="#8B5CF6" stopOpacity="0.6"/><stop offset="0.7" stopColor="#A855F7" stopOpacity="0.4"/><stop offset="1" stopColor="#A855F7" stopOpacity="0.2"/></radialGradient>
            <radialGradient id="centerGradient4" cx="0" cy="0" r="1"><stop stopColor="#10B981" stopOpacity="0.6"/><stop offset="0.7" stopColor="#059669" stopOpacity="0.4"/><stop offset="1" stopColor="#059669" stopOpacity="0.2"/></radialGradient>
            <linearGradient id="aiGradient1" x1="0" y1="0" x2="1200" y2="800" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" stopOpacity="0.3"/><stop offset="1" stopColor="#6366F1" stopOpacity="0.1"/></linearGradient>
            <linearGradient id="aiGradient2" x1="0" y1="0" x2="1200" y2="800" gradientUnits="userSpaceOnUse"><stop stopColor="#3B82F6" stopOpacity="0.2"/><stop offset="1" stopColor="#A855F7" stopOpacity="0.05"/></linearGradient>
            <radialGradient id="nodeGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(600 400) scale(300)"><stop stopColor="#4A6CF7" stopOpacity="0.5"/><stop offset="1" stopColor="#4A6CF7" stopOpacity="0"/></radialGradient>
            {/* DataFlowGradients and others (your existing defs) */}
            <linearGradient id="paint0_dataflow_main" x1="184.389" y1="69.2405" x2="184.389" y2="212.24" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" stopOpacity="0"/><stop offset="0.5" stopColor="#06B6D4"/><stop offset="1" stopColor="#4A6CF7"/></linearGradient>
            <linearGradient id="paint1_dataflow_secondary" x1="156.389" y1="69.2405" x2="156.389" y2="212.24" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6" stopOpacity="0"/><stop offset="1" stopColor="#8B5CF6"/></linearGradient>
            <linearGradient id="paint2_dataflow_tertiary" x1="125.389" y1="69.2405" x2="125.389" y2="212.24" gradientUnits="userSpaceOnUse"><stop stopColor="#10B981" stopOpacity="0"/><stop offset="1" stopColor="#10B981"/></linearGradient>
            <radialGradient id="paint3_analytics_core" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(220 63) rotate(90) scale(35)"><stop offset="0" stopColor="#4A6CF7" stopOpacity="0.3"/><stop offset="1" stopColor="#06B6D4" stopOpacity="0.1"/></radialGradient>
            <linearGradient id="paint4_connections" x1="190" y1="35" x2="250" y2="85" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7"/><stop offset="1" stopColor="#06B6D4"/></linearGradient>
            <linearGradient id="paint5_ml_pattern" x1="50" y1="120" x2="130" y2="160" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6"/><stop offset="1" stopColor="#10B981"/></linearGradient>
            <linearGradient id="paint6_algorithm" x1="280" y1="100" x2="360" y2="140" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7"/><stop offset="1" stopColor="#10B981"/></linearGradient>
            <linearGradient id="paint7_binary" x1="140" y1="200" x2="200" y2="240" gradientUnits="userSpaceOnUse"><stop stopColor="#007BFF"/><stop offset="1" stopColor="#00C0C0"/></linearGradient>
            <linearGradient id="paint8_geometric" x1="100" y1="420" x2="200" y2="480" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6"/><stop offset="1" stopColor="#8B5CF6" stopOpacity="0"/></linearGradient>
            <linearGradient id="paint9_geometric" x1="320" y1="480" x2="420" y2="510" gradientUnits="userSpaceOnUse"><stop stopColor="#10B981"/><stop offset="1" stopColor="#10B981" stopOpacity="0"/></linearGradient>
            <linearGradient id="paint10_dataflow" x1="50" y1="350" x2="450" y2="350" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" stopOpacity="0"/><stop offset="0.5" stopColor="#06B6D4"/><stop offset="1" stopColor="#4A6CF7" stopOpacity="0"/></linearGradient>
          </defs>

          {/* All SVG graphical elements are decorative and complex.
              Using aria-hidden="true" on the entire SVG or the main groups
              is the most appropriate way to prevent screen readers from
              announcing their individual complex paths/circles.
              The overall SVG element already has role="img" and aria-label.
          */}
          <g aria-hidden="true">
            {/* Replace the existing center sphere */}
            <circle cx="600" cy="400" r="250"  style={{ animation: 'gentleColorMorph 20s ease-in-out infinite' }} />
            <circle cx="600" cy="400" r="200" stroke="#4A6CF7" strokeWidth="2" opacity="0.2" />

            {/* Interconnected nodes and lines - STATIC main structure */}
            <path d="M600 400L450 250L300 350L400 550L600 400" stroke="url(#aiGradient1)" strokeWidth="1" opacity="0.7" />
            <path d="M600 400L750 250L900 350L800 550L600 400" stroke="url(#aiGradient1)" strokeWidth="1" opacity="0.7" />
            <path d="M600 400L500 150L700 150L600 400" stroke="url(#aiGradient2)" strokeWidth="1" opacity="0.6" />
            <path d="M600 400L500 650L700 650L600 400" stroke="url(#aiGradient2)" strokeWidth="1" opacity="0.6" />

            {/* SEO growth lines with subtle flow animation */}
            <path d="M100 700C300 600, 500 500, 700 450" stroke="#3B82F6" strokeWidth="2" opacity="0.4" strokeDasharray="20 10"  style={{ animation: 'svgDataFlowSlow 12s linear infinite' }} />
            <path d="M150 750C350 650, 550 550, 750 500" stroke="#A855F7" strokeWidth="2" opacity="0.4" strokeDasharray="15 8"  style={{ animation: 'svgDataFlowSlow 15s linear infinite', animationDelay: '3s' }} />

            {/* Animated smaller nodes (datapoints) */}
            <circle cx="200" cy="150" r="15" fill="#4A6CF7" opacity="0.4"  style={{ animation: 'svgNodePulse 6s ease-in-out infinite', animationDelay: '0s' }} />
            <circle cx="900" cy="100" r="10" fill="#6366F1" opacity="0.3"  style={{ animation: 'svgFloatSlow 8s ease-in-out infinite', animationDelay: '2s' }} />
            <circle cx="1000" cy="600" r="20" fill="#3B82F6" opacity="0.4"  style={{ animation: 'svgGlowPulse 10s ease-in-out infinite', animationDelay: '4s' }} />
            <circle cx="150" cy="550" r="12" fill="#A855F7" opacity="0.3"  style={{ animation: 'svgNodePulse 7s ease-in-out infinite', animationDelay: '6s' }} />
            <circle cx="700" cy="700" r="18" fill="#4A6CF7" opacity="0.4"  style={{ animation: 'svgGlowPulse 9s ease-in-out infinite', animationDelay: '3s' }} />
          </g>
        </svg>
      </div>

      {/* Main content area */}
 <div className="container mx-auto flex flex-col items-center justify-center px-2 lg:px-8 max-w-7xl">
        <div className="hero-section w-full">
          <header className="text-center mb-8">
            <h1
              id="hero-heading"
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 dark:text-white"
              itemProp="headline"
            >
              <span className="block">Welcome to</span>
              <span className="block text-blue-600 dark:text-blue-400 relative">
                DOITWITHAITOOLS
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-60"></span>
              </span>
            </h1>
            {/* KEY CHANGE 1: Updated Main Value Proposition */}
            {/* Replace your main heading paragraph with this: */}
            <p className="hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-6 text-lg font-medium leading-relaxed text-gray-600 dark:text-gray-200 sm:text-xl lg:text-lg xl:text-xl animated-staggered-item p1-animate max-w-4xl mx-auto"
              style={{ transform: 'translateY(20px)', opacity: 0, willChange: 'transform, opacity' }}>
              Your go-to **resource hub** for mastering AI tools that{' '}
              <span className="relative inline-block mx-1 animated-staggered-item p1-span-animate"
                style={{ transform: 'translateY(20px)', opacity: 0, willChange: 'transform, opacity' }}>
                <span className="uppercase text-blue-600 dark:text-blue-400 text-xl bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 font-bold">
                  boost productivity
                </span>
              </span>
              and help you **earn online**—with **hands-on tutorials, reviews**, and{' '}
              <span className="font-bold text-green-600 dark:text-green-400">completely **free resources**</span>.
            </p>
          </header>

          <main className="max-w-6xl mx-auto text-center">
            {/* KEY CHANGE 2: Enhanced Secondary Message */}
            {/* Replace your secondary content section with this: */}
            <div className={`transition-all duration-700 ${showSecondaryContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex flex-wrap justify-center items-center gap-2 mb-4 text-sm">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  📚 Tutorials & Guides
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  🔧 Tool Reviews
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  💰 Earning Strategies
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                  🎁 Free Resources
                </span>
              </div>

              <p className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
                <span className="text-green-600 dark:text-green-400">Perfect for Beginners</span> •
                <span className="text-purple-600 dark:text-purple-400 ml-2">Loved by Experts</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                From ChatGPT for SEO to productivity AI tools—everything you need to thrive in the AI era
              </p>
            </div>

            <div className={`mb-8 transition-all duration-700 ${showBenefits ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* KEY CHANGE 3: Updated Section Heading */}
              {/* Replace your benefits section heading with this: */}
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 dark:text-white">
                  Why DoItWithAI.tools Stands Out?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  More than just another AI blog—we're your practical learning companion
                </p>
              </div>

              {/* KEY CHANGE 4: Brand-Aligned Benefits */}
              {/* Replace your benefits cards with these updated versions: */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Benefit 1 - Specific to your content */}
                <div className="group p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 animated-staggered-item p1-animate hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                  style={{ transform: 'translateY(20px)', opacity: 0 }}>
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🎯</div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    AI-Powered SEO Mastery
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Learn how to dominate search rankings with{' '}
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      ChatGPT for keyword research
                    </span>
                    , AI-generated alt text, and content optimization strategies that actually work.
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span className="inline-flex items-center">
                      📈 <span className="ml-1">Real case studies & examples</span>
                    </span>
                  </div>
                </div>

                {/* Benefit 2 - Productivity focus */}
                <div className="group p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 animated-staggered-item p2-animate hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                  style={{ transform: 'translateY(20px)', opacity: 0 }}>
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">⚡</div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    Productivity Game-Changers
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Discover and master AI tools like{' '}
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      Merlin AI, Claude, and more
                    </span>
                    {' '}through detailed reviews and practical tutorials—all{' '}
                    <span className="font-bold text-green-600 dark:text-green-400">completely free</span>.
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span className="inline-flex items-center">
                      🛠️ <span className="ml-1">Hands-on tool reviews & tutorials</span>
                    </span>
                  </div>
                </div>

                {/* Benefit 3 - Earning focus */}
                <div className="group p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 animated-staggered-item p3-animate hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                  style={{ transform: 'translateY(20px)', opacity: 0 }}>
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">💰</div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    Earn Online with AI
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Turn AI skills into income streams with{' '}
                    <span className="font-bold text-green-600 dark:text-green-400">
                      actionable strategies
                    </span>
                    {' '}for freelancing, content creation, and digital marketing—perfect for beginners and pros alike.
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span className="inline-flex items-center">
                      💡 <span className="ml-1">Beginner-friendly step-by-step guides</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`mb-8 transition-all duration-700 ${showCTA ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* KEY CHANGE 5: Updated CTA Section */}
              {/* Replace your CTA intro with this: */}
              <div className="max-w-2xl mx-auto text-center mb-8">
                <p className="text-xl font-medium mb-4 text-gray-700 dark:text-gray-200">
                  Ready to transform your workflow and boost your income?
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Dive into our comprehensive guides, download free resources, and join thousands learning AI the practical way.
                </p>

                {/* Enhanced value proposition */}
                <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    ✅ Always Free
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    📚 Beginner-Friendly
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                    🎯 Practical & Actionable
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                    💰 Income-Focused
                  </span>
                </div>
              </div>

              {/* Review Invitation Section - Removed as per previous discussion */}

              {/* KEY CHANGE 6: Updated CTA Buttons */}
              {/* Replace your CTA buttons with these: */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
                <a href="/blogs"
                  className="w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-300 hover-optimized animate-fadeInUp delay-1800 hover:scale-105 hover:shadow-lg"
                  aria-label="Start learning with our comprehensive AI guides"
                  itemProp="url">
                  📚 Start Learning Now
                </a>
                <a href="/free-resources"
                  className="w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 hover-optimized animate-fadeInUp delay-1800 hover:scale-105 hover:shadow-lg"
                  aria-label="Access our free AI resources and tools"
                  itemProp="url">
                  🎁 Get Free Resources
                </a>
              </div>

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
      <div className="absolute right-0 top-0 z-[-1] opacity-30 lg:opacity-70">
        <svg
          width="450"
          height="556"
          viewBox="0 0 450 556"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Decorative neural network and circuit pattern in background"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="paint0_neural_gradient" x1="220" y1="40" x2="380" y2="200" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7"/><stop offset="1" stopColor="#06B6D4" stopOpacity="0.3"/></linearGradient>
            <linearGradient id="paint1_connection" x1="250" y1="80" x2="320" y2="160" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7"/><stop offset="1" stopColor="#06B6D4"/></linearGradient>
            <linearGradient id="paint2_connection" x1="280" y1="60" x2="380" y2="110" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6"/><stop offset="1" stopColor="#10B981"/></linearGradient>
            <radialGradient id="paint3_node" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7"/><stop offset="1" stopColor="#4A6CF7" stopOpacity="0.3"/></radialGradient>
            <radialGradient id="paint4_node" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"><stop stopColor="#06B6D4"/><stop offset="1" stopColor="#06B6D4" stopOpacity="0.3"/></radialGradient>
            <linearGradient id="paint5_circuit" x1="200" y1="250" x2="400" y2="400" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" stopOpacity="0.6"/><stop offset="1" stopColor="#06B6D4" stopOpacity="0.2"/></linearGradient>
            <linearGradient id="paint6_circuit_lines" x1="220" y1="270" x2="380" y2="330" gradientUnits="userSpaceOnUse"><stop stopColor="#2563EB"/><stop offset="1" stopColor="#7C3AED"/></linearGradient>
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
            {/* Circuit Pattern - STATIC */}
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
              <AnimatedBinaryText initialText="01001001" x="150" y="160" fill="url(#paint7_binary)" fontSize="12" fontFamily="monospace" className="animated-binary-text" interval={2500} aria-label="Binary code" />
              <AnimatedBinaryText initialText="11010110" x="160" y="175" fill="url(#paint7_binary)" fontSize="12" fontFamily="monospace" className="animated-binary-text" interval={2000} aria-label="Binary code" />
              <AnimatedBinaryText initialText="00110101" x="140" y="190" fill="url(#paint7_binary)" fontSize="12" fontFamily="monospace" className="animated-binary-text" interval={3000} aria-label="Binary code" />
            </g>

            <polygon points="100,450 150,420 200,450 150,480" fill="url(#paint8_geometric)" opacity="0.4"/>
            <polygon points="320,480 370,450 420,480 370,510" fill="url(#paint9_geometric)" opacity="0.3"/>
            <path d="M50 350Q150 320 250 350Q350 380 450 350" stroke="url(#paint10_dataflow)" strokeWidth="2" fill="none" opacity="0="/>
          </g>
        </svg>
      </div>

      {/* Bottom Left AI-Themed Background Elements */}
      <div className="absolute bottom-0 left-0 z-[-1] opacity-30 lg:opacity-100">
        <svg
          width="364"
          height="201"
          viewBox="0 0 364 201"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Decorative data flow and machine learning pattern in background"
        >
          <defs>
            {/* DataFlowGradients */}
            <linearGradient id="paint0_dataflow_main" x1="184.389" y1="69.2405" x2="184.389" y2="212.24" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7" stopOpacity="0"/><stop offset="0.5" stopColor="#06B6D4"/><stop offset="1" stopColor="#4A6CF7"/></linearGradient>
            <linearGradient id="paint1_dataflow_secondary" x1="156.389" y1="69.2405" x2="156.389" y2="212.24" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6" stopOpacity="0"/><stop offset="1" stopColor="#8B5CF6"/></linearGradient>
            <linearGradient id="paint2_dataflow_tertiary" x1="125.389" y1="69.2405" x2="125.389" y2="212.24" gradientUnits="userSpaceOnUse"><stop stopColor="#10B981" stopOpacity="0"/><stop offset="1" stopColor="#10B981"/></linearGradient>
            {/* AnalyticsCore */}
            <radialGradient id="paint3_analytics_core" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(220 63) rotate(90) scale(35)"><stop offset="0" stopColor="#4A6CF7" stopOpacity="0.3"/><stop offset="1" stopColor="#06B6D4" stopOpacity="0.1"/></radialGradient>
            {/* ConnectionLines */}
            <linearGradient id="paint4_connections" x1="190" y1="35" x2="250" y2="85" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7"/><stop offset="1" stopColor="#06B6D4"/></linearGradient>
            {/* MLPattern */}
            <linearGradient id="paint5_ml_pattern" x1="50" y1="120" x2="130" y2="160" gradientUnits="userSpaceOnUse"><stop stopColor="#8B5CF6"/><stop offset="1" stopColor="#10B981"/></linearGradient>
            {/* AlgorithmFlow */}
            <linearGradient id="paint6_algorithm" x1="280" y1="100" x2="360" y2="140" gradientUnits="userSpaceOnUse"><stop stopColor="#4A6CF7"/><stop offset="1" stopColor="#10B981"/></linearGradient>
          </defs>

          <g aria-hidden="true">
            {/* Data Flow Curves */}
            <path d="M5.88928 7.33C33.6599 66.479 101.397 64.908 150.178 105.427C211.155 156.076 229.591 62.093 264.333 166.607C299.076 171.123 337.718 183.657 362.889 212.24" stroke="url(#paint0_dataflow_main)" strokeWidth="2" strokeDasharray="15 10" className="svg-animated-element" style={{ animation: 'svgDataFlowSlow 20s linear infinite' }} />
            <path d="M-22.11077 2.3303C5.65989 66.479 73.3965 64.9086 122.178 105.427C183.155 156.076 201.591 62.093 236.333 166.607C271.076 171.123 309.718 183.657 334.889 212.24" stroke="url(#paint1_dataflow_secondary)" strokeWidth="1.5" opacity="0.5" strokeDasharray="12 8" className="svg-animated-element" style={{ animation: 'svgDataFlowSlow 25s linear infinite', animationDelay: '5s' }} />
            <path d="M-53.11077 2.3303C-25.3401 66.479 42.3965 64.9086 91.1783 105.427C152.155 156.076 170.591 62.093 205.333 166.607C240.076 171.122 78.718 183.657 303.889 212.24" stroke="url(#paint2_dataflow_tertiary)" strokeWidth="1" opacity="0.5" />

            {/* AI Analytics Visualization */}
            <circle cx="220" cy="63" r="35" fill="url(#paint3_analytics_core)" opacity="0.8" />
            {/* Data Points */}
           {/* Replace one of the existing data points with rotating one */}
<g transform="translate(220, 63)">
  <circle cx="0" cy="0" r="3" fill="#4A6CF7" opacity="0.8" 
    style={{animation: 'smoothOrbitRotation 15s linear infinite'}}/>
</g>
            <circle cx="240" cy="40" r="3" fill="#8B5CF6" opacity="0.6" className="svg-animated-element" style={{ animation: 'svgGlowPulse 12s ease-in-out infinite', animationDelay: '2s' }} />
            <circle cx="195" cy="85" r="3" fill="#F59E0B" opacity="0.6" className="svg-animated-element" style={{ animation: 'svgFloatSlow 8s ease-in-out infinite', animationDelay: '4s' }} />
            <circle cx="250" cy="70" r="2" fill="#10B981" opacity="0.6" className="svg-animated-element" style={{ animation: 'svgNodePulse 9s ease-in-out infinite', animationDelay: '6s' }} />
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
            <circle cx="90" cy="145" r="2" fill="#F59E0B" className="svg-animated-element" style={{ animation: 'gentleStrike 4s ease-in-out infinite', animationDelay: '2s' }} />
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
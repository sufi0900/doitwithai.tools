/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useRef } from 'react';

const Hero = () => {
  const heroRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    // Preload critical animations with requestAnimationFrame
    const preloadAnimations = () => {
      if (heroRef.current) {
        // Force layout calculation early
        heroRef.current.offsetHeight;
        
        // Use requestAnimationFrame for smooth animations
        animationRef.current = requestAnimationFrame(() => {
          const elements = heroRef.current.querySelectorAll('.animate-on-load');
          elements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
            el.classList.add('animate-ready');
          });
        });
      }
    };

    // Use requestIdleCallback for non-critical animations
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(preloadAnimations);
    } else {
      setTimeout(preloadAnimations, 0);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Optimized CSS with will-change and transform3d for GPU acceleration */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translate3d(0, -100%, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        @keyframes backInDown {
          0% {
            opacity: 0;
            transform: translate3d(0, -1200px, 0) scale(0.7);
          }
          80% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(0.7);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        
        @keyframes fadeInDownBig {
          from {
            opacity: 0;
            transform: translate3d(0, -2000px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translate3d(-100%, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 100%, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translate3d(100%, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        @keyframes fadeInLeftBig {
          from {
            opacity: 0;
            transform: translate3d(-2000px, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        @keyframes fadeInRightBig {
          from {
            opacity: 0;
            transform: translate3d(2000px, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes pulse2 {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* Optimized animation classes with GPU acceleration */
        .animate-fadeInDown {
          animation-name: fadeInDown;
          will-change: transform, opacity;
        }
        
        .animate-backInDown {
          animation-name: backInDown;
          will-change: transform, opacity;
        }
        
        .animate-fadeInDownBig {
          animation-name: fadeInDownBig;
          will-change: transform, opacity;
        }
        
        .animate-fadeInLeft {
          animation-name: fadeInLeft;
          will-change: transform, opacity;
        }
        
        .animate-fadeInUp {
          animation-name: fadeInUp;
          will-change: transform, opacity;
        }
        
        .animate-fadeInRight {
          animation-name: fadeInRight;
          will-change: transform, opacity;
        }
        
        .animate-fadeInLeftBig {
          animation-name: fadeInLeftBig;
          will-change: transform, opacity;
        }
        
        .animate-fadeInRightBig {
          animation-name: fadeInRightBig;
          will-change: transform, opacity;
        }
        
        .animate-shimmer-custom {
          animation-name: shimmer;
          will-change: transform;
        }
        
        .animate-pulse2-custom {
          animation-name: pulse2;
          will-change: opacity;
        }

        /* Optimized animation properties */
        .animated {
          animation-duration: 1s;
          animation-fill-mode: both;
          animation-timing-function: ease-out;
        }
        
        .animate-delay-1s { animation-delay: 1s; }
        .animate-delay-2s { animation-delay: 2s; }
        .animate-delay-3s { animation-delay: 3s; }
        .animate-delay-4s { animation-delay: 4s; }
        .animate-delay-5s { animation-delay: 5s; }
        .animate-delay-5-5s { animation-delay: 5.5s; }
        .animate-delay-6s { animation-delay: 6s; }
        .animate-delay-6-5s { animation-delay: 6.5s; }

        /* Optimized specific animations */
        .h1-letter-animation {
          animation-duration: 0.6s;
          animation-fill-mode: both;
          animation-timing-function: ease-out;
        }
        
        .h2-word-animation {
          animation-duration: 0.4s;
          animation-timing-function: ease-out;
        }

        /* Performance optimizations */
        .hero-section {
          contain: layout style paint;
          will-change: auto;
        }
        
        .hero-section * {
          backface-visibility: hidden;
          perspective: 1000px;
        }
        
        /* Reduce paint operations */
        .animate-on-load {
          opacity: 0;
          transform: translate3d(0, 20px, 0);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .animate-ready {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
        
        /* Optimize hover effects */
        .hover-optimized {
          transition: transform 0.2s ease-out;
        }
        
        .hover-optimized:hover {
          transform: scale(1.05);
        }
        
        /* Optimize float animation */
        .float-animation {
          animation: float 2s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>
      
      <section 
        id="home" 
        className="relative z-10 overflow-hidden bg-teal-50 dark:bg-gray-800 min-h-screen flex items-center justify-center py-16 md:py-[75px]"
        ref={heroRef}
      >
        {/* Optimized SVG Background with loading optimization */}
        <div className="absolute inset-0 z-[-1] opacity-30 lg:opacity-100">
          <div className="w-full h-full">
            {/* Placeholder for SVG - using a simple div to avoid layout shift */}
            <div className="w-full h-full bg-gradient-to-br from-teal-100/20 to-blue-100/20 dark:from-gray-700/20 dark:to-gray-600/20"></div>
          </div>
        </div>
        
        <div className="container mx-auto flex flex-col items-center justify-center px-2 lg:px-8 max-w-7xl">
          {/* Hero Component with improved performance */}
          <div className="hero-section w-full">
            
            {/* Welcome with optimized letter animation */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-center font-bold mb-2">
              {["W", "e", "l", "c", "o", "m", "e", " ", "t", "o"].map((letter, index) => (
                <span
                  key={index}
                  className={`inline-block transform transition-all duration-400 hover-optimized
                    ${index === 0 ? 'hover:text-red-500' : ''}
                    ${index === 1 ? 'hover:text-green-500' : ''}
                    ${index === 2 ? 'hover:text-blue-500' : ''}
                    ${index === 3 ? 'hover:text-amber-500' : ''}
                    ${index === 4 ? 'hover:text-purple-500' : ''}
                    ${index === 5 ? 'hover:text-pink-500' : ''}
                    ${index === 6 ? 'hover:text-cyan-500' : ''}
                    ${index === 7 ? 'hover:text-indigo-500' : ''}
                    ${index === 8 ? 'hover:text-zinc-500' : ''}
                    ${index === 9 ? 'hover:text-primary' : ''}
                    animated animate-fadeInDown h1-letter-animation animate-on-load`}
                  style={{
                    animationDelay: `${index * 0.1 + 0.5}s`,
                  }}
                >
                  <span 
                    className="inline-block float-animation"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </span>
                </span>
              ))}
            </h1>

            {/* Do It With AI Tools with optimized animation */}
            <h2 className="text-3xl text-center md:text-4xl lg:text-5xl font-extrabold mb-6 text-gray-600 dark:text-gray-400">
              <span className="relative inline-block">
                {["Do", "It", "With", "AI", "Tools"].map((word, index) => (
                  <span
                    key={index}
                    className="inline-block mx-1 animated animate-backInDown h2-word-animation animate-on-load"
                    style={{
                      animationDelay: `${0.5 + index * 0.3}s`,
                      background: index === 3 ? 'linear-gradient(90deg, #3b82f6, #6366f1)' : 'transparent',
                      backgroundClip: index === 3 ? 'text' : 'border-box',
                      WebkitBackgroundClip: index === 3 ? 'text' : 'border-box',
                      WebkitTextFillColor: index === 3 ? 'transparent' : 'currentColor',
                      position: 'relative'
                    }}
                  >
                    {word}
                    {index === 4 && (
                      <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500 rounded animate-pulse"></span>
                    )}
                  </span>
                ))}
              </span>
            </h2>

            {/* First Paragraph - optimized for performance */}
            <p className="hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-6 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl first-line:uppercase first-line:tracking-widest first-letter:text-7xl first-letter:font-bold first-letter:text-primary dark:first-letter:text-primary first-letter:me-3 first-letter:float-start animate-on-load">
              Artificial Intelligence is reshaping everything, and you've found the most
              <span className="relative inline-block mx-1 animated animate-fadeInDownBig animate-delay-1s animate-on-load">
                {/* Star animation - left */}
                <span className="absolute -left-2 top-4 text-yellow-400 animate-pulse2-custom text-sm">✨</span>
                <span className="uppercase text-blue-600 dark:text-blue-400 text-xl bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                  trusted platform
                </span>
                {/* Make underline visible always */}
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600 rounded transition-all duration-500"></span>
                {/* Stars with glowing effect on hover */}
                <span className="absolute -right-2 -top-1 text-yellow-400 text-xs rotate-12 transform transition-all animate-pulse2-custom duration-300 group-hover:scale-150 group-hover:opacity-100 opacity-100">✨</span>
                <span className="absolute -left-2 -bottom-2 text-yellow-400 text-xs -rotate-12 transform transition-all animate-pulse2-custom duration-300 group-hover:scale-150 group-hover:opacity-100 opacity-100">✨</span>
              </span>
              to master it.
            </p>

            {/* Second Paragraph - optimized */}
            <p className="mb-6 text-lg font-medium leading-relaxed text-gray-600 dark:text-gray-300 sm:text-xl lg:text-lg xl:text-xl animated animate-fadeInLeft animate-delay-2s animate-on-load">
              <span className="inline-block px-3 py-1 mx-1 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 text-gray-700 dark:text-gray-200 font-semibold rounded-lg border-l-4 border-blue-500">
                🚀 Discover
              </span>
              the game-changing AI insights and proven
              <span className="relative font-bold text-blue-700 dark:text-blue-300 mx-2 inline-block">
                ChatGPT
                {/* Tailwind ping animation for glow effect */}
                <span className="pointer-events-none absolute inset-0 rounded-md opacity-20 bg-blue-400 dark:bg-blue-600 animate-ping z-[-1]"></span>
              </span>
              prompts that
              <span className="inline-block px-2 py-1 mx-1 bg-primary/10 text-primary font-semibold rounded-md">improve your SEO</span>,
              <span className="inline-block px-2 py-1 mx-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold rounded-md">create high-quality content</span>,
              and
              <span className="inline-block px-2 py-1 mx-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold rounded-md">skyrocket your website rankings</span>.
            </p>

            {/* Third Paragraph - optimized card-like styling */}
            <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 animated animate-fadeInUp animate-delay-3s animate-on-load">
              <p className="text-lg font-medium leading-relaxed text-gray-600 dark:text-gray-300 sm:text-xl lg:text-lg xl:text-xl">
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full text-sm mr-2">
                  ⚡ We're
                </span>
                boosting productivity and creativity by showcasing the best AI tools,
                <span className="inline-block px-2 py-1 mx-1 bg-purple-100 dark:bg-violet-900/30 text-purple-700 dark:text-purple-300 font-medium rounded">teaching you to code smarter</span>,
                <span className="inline-block px-2 py-1 mx-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium rounded">providing upskilling resources</span>,
                and
                <span className="inline-block px-2 py-1 mx-1 bg-indigo-100 dark:bg-cyan-900/30 text-blue-900 dark:text-white font-medium rounded">sharing premium AI assets</span>
                —all completely
                <span className="font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">FREE</span>.
              </p>
            </div>

            {/* Fourth Paragraph - optimized */}
            <div className="relative mb-6 animated animate-fadeInRight animate-delay-4s animate-on-load">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10 rounded-lg"></div>
              <p className="relative p-4 text-lg font-medium leading-relaxed text-gray-700 dark:text-gray-200 sm:text-xl lg:text-lg xl:text-xl">
                <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                Mastering AI today isn't just a trend;
                <span className="relative inline-block mx-2">
                  <span className="font-bold text-primary dark:text-blue-400 bg-primary/10 dark:bg-blue-500/20 px-3 py-1 rounded-lg">
                    it's the key step
                  </span>
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded"></span>
                </span>
                that will set you apart and unlock your future success in tomorrow's world.
              </p>
            </div>

            {/* Together let's unlock - optimized */}
            <p className="text-center font-medium text-lg mt-4">
              <span className="relative inline-block animated animate-fadeInLeftBig animate-delay-5s animate-on-load">
                <span className="animate-shimmer-custom bg-gradient-to-r from-transparent via-primary/20 to-transparent absolute inset-0 w-full"></span>
                <span className="text-primary dark:text-white text-2xl">Together, let's unlock the future of AI,</span>
              </span>
              <span className="group relative inline-block mx-2 animated animate-fadeInRightBig animate-delay-5-5s animate-on-load">
                <span className="font-semibold italic text-blue-600 dark:text-primary text-xl bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                  one solution at a time
                </span>
                {/* Make underline visible always */}
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600 rounded transition-all duration-500"></span>
                {/* Stars with glowing effect on hover */}
                <span className="absolute -right-2 -top-1 text-yellow-400 text-xs rotate-12 transform transition-all animate-pulse2-custom duration-300 group-hover:scale-150 group-hover:opacity-100 opacity-100">✨</span>
                <span className="absolute -left-2 -bottom-2 text-yellow-400 text-xs -rotate-12 transform transition-all animate-pulse2-custom duration-300 group-hover:scale-150 group-hover:opacity-100 opacity-100">✨</span>
              </span>
            </p>
          </div>

          {/* Call to action - optimized */}
          <div className="flex flex-col mt-8 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <a
              href="/blogs"
              className="whitespace-nowrap rounded-sm bg-primary px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-primary/80 animated animate-fadeInUp animate-delay-6s animate-on-load hover-optimized"
            >
              🔍 Explore AI Insights
            </a>
            <a
              href="/contact"
              className="whitespace-nowrap rounded-sm bg-black px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-black/90 dark:bg-white/10 dark:text-white dark:hover:bg-white/5 animated animate-fadeInUp animate-delay-6-5s animate-on-load hover-optimized"
            >
              💌 Join Our Community
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
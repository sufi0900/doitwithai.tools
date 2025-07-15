/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from 'react';

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to ensure the animation triggers after the initial paint
    // This helps synchronize the animation with the browser's rendering cycle.
    const frameId = requestAnimationFrame(() => {
      setIsLoaded(true);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translate3d(0, -30px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes backInDown {
          0% { opacity: 0; transform: translate3d(0, -100px, 0) scale(0.9); }
          80% { opacity: 1; transform: translate3d(0, 0, 0) scale(0.9); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translate3d(-30px, 0, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate3d(0, 30px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translate3d(30px, 0, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes fadeInLeftBig {
          from { opacity: 0; transform: translate3d(-50px, 0, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes fadeInRightBig {
          from { opacity: 0; transform: translate3d(50px, 0, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse2 {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        /* --- REVISED CSS LOGIC TO PREVENT FOUC --- */

        /*
          CRITICAL: Initially hide elements that will animate by default.
          This prevents them from flashing before animations apply.
          'transition: opacity 0s;' ensures no unwanted default transition when opacity changes.
        */
        .animate-fadeInDown,
        .animate-backInDown,
        .animate-fadeInLeft,
        .animate-fadeInUp,
        .animate-fadeInRight,
        .animate-fadeInLeftBig,
        .animate-fadeInRightBig {
          opacity: 0;
          transition: opacity 0s; /* Prevent an initial fade-in before animation */
        }

        /* Trigger animations ONLY when the parent container has the 'hero-loaded' class. */
        .hero-loaded .animate-fadeInDown { animation: fadeInDown 0.8s ease-out both; }
        .hero-loaded .animate-backInDown { animation: backInDown 0.6s ease-out both; }
        .hero-loaded .animate-fadeInLeft { animation: fadeInLeft 0.8s ease-out both; }
        .hero-loaded .animate-fadeInUp { animation: fadeInUp 0.8s ease-out both; }
        .hero-loaded .animate-fadeInRight { animation: fadeInRight 0.8s ease-out both; }
        .hero-loaded .animate-fadeInLeftBig { animation: fadeInLeftBig 0.8s ease-out both; }
        .hero-loaded .animate-fadeInRightBig { animation: fadeInRightBig 0.8s ease-out both; }

        /* Performance optimization for animated properties */
        .hero-loaded .animate-fadeInDown,
        .hero-loaded .animate-backInDown,
        .hero-loaded .animate-fadeInLeft,
        .hero-loaded .animate-fadeInUp,
        .hero-loaded .animate-fadeInRight,
        .hero-loaded .animate-fadeInLeftBig,
        .hero-loaded .animate-fadeInRightBig {
          will-change: transform, opacity;
        }

        /* Static animations (not part of initial entrance) */
        .animate-shimmer-custom { animation: shimmer 2s ease-in-out infinite; will-change: transform; }
        .animate-pulse2-custom { animation: pulse2 2s ease-in-out infinite; will-change: opacity; }

        /* Staggered delay classes - apply only when hero-loaded triggers animations */
        .delay-1100 { animation-delay: 1.1s; }
        .delay-1200 { animation-delay: 1.2s; }
        .delay-1300 { animation-delay: 1.3s; }
        .delay-1400 { animation-delay: 1.4s; }
        .delay-1500 { animation-delay: 1.5s; }
        .delay-1600 { animation-delay: 1.6s; }
        .delay-1700 { animation-delay: 1.7s; }
        .delay-1800 { animation-delay: 1.8s; }

        /* General performance optimizations */
        .hero-section { contain: layout style paint; will-change: auto; }
        .hero-section * { backface-visibility: hidden; perspective: 1000px; }
        .hover-optimized { transition: transform 0.2s ease-out; }
        .hover-optimized:hover { transform: scale(1.05); }
        .float-animation { animation: float 3s ease-in-out infinite; will-change: transform; }
        .text-optimized { text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      `}</style>
      <section
        id="home"
        className={`relative z-10 overflow-hidden bg-teal-50 dark:bg-gray-800 min-h-screen flex items-center justify-center py-16 md:py-[75px] ${isLoaded ? 'hero-loaded' : ''}`}
      >
        <div className="absolute inset-0 z-[-1] opacity-30 lg:opacity-100">
          <div className="w-full h-full bg-gradient-to-br from-teal-100/20 to-blue-100/20 dark:from-gray-700/20 dark:to-gray-600/20"></div>
        </div>
        
        <div className="container mx-auto flex flex-col items-center justify-center px-2 lg:px-8 max-w-7xl">
          <div className="hero-section w-full">
            
            {/* ✅ LCP OPTIMIZATION: Main headings are now static for fast paint, with no animations. */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-center font-bold mb-2 text-optimized">
              Welcome to
            </h1>
            <h2 className="text-3xl text-center md:text-4xl lg:text-5xl font-extrabold mb-6 text-gray-600 dark:text-gray-400 text-optimized">
              Do It With AI Tools
            </h2>

            {/* First Paragraph - Removed 'hero-element' as 'animate-fadeInLeft' now handles initial opacity */}
            <p className={`hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-6 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl first-line:uppercase first-line:tracking-widest first-letter:text-7xl first-letter:font-bold first-letter:text-primary dark:first-letter:text-primary first-letter:me-3 first-letter:float-start text-optimized animate-fadeInLeft delay-1100`}>
              Artificial Intelligence is reshaping everything, and you've found the most
              <span className={`relative inline-block mx-1`}>
                <span className="absolute -left-2 top-4 text-yellow-400 animate-pulse2-custom text-sm">✨</span>
                <span className="uppercase text-blue-600 dark:text-blue-400 text-xl bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                  trusted platform
                </span>
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600 rounded transition-all duration-500"></span>
                <span className="absolute -right-2 -top-1 text-yellow-400 text-xs rotate-12 transform transition-all animate-pulse2-custom duration-300 group-hover:scale-150 group-hover:opacity-100 opacity-100">✨</span>
                <span className="absolute -left-2 -bottom-2 text-yellow-400 text-xs -rotate-12 transform transition-all animate-pulse2-custom duration-300 group-hover:scale-150 group-hover:opacity-100 opacity-100">✨</span>
              </span>
              to master it.
            </p>

            {/* Second Paragraph - Removed 'hero-element' as 'animate-fadeInRight' now handles initial opacity */}
            <p className={`mb-6 text-lg font-medium leading-relaxed text-gray-600 dark:text-gray-300 sm:text-xl lg:text-lg xl:text-xl text-optimized animate-fadeInRight delay-1300`}>
              <span className="inline-block px-3 py-1 mx-1 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 text-gray-700 dark:text-gray-200 font-semibold rounded-lg border-l-4 border-blue-500">
                🚀 Discover
              </span>
              the game-changing AI insights and proven
              <span className="relative font-bold text-blue-700 dark:text-blue-300 mx-2 inline-block">
                ChatGPT
                <span className="pointer-events-none absolute inset-0 rounded-md opacity-20 bg-blue-400 dark:bg-blue-600 animate-ping z-[-1]"></span>
              </span>
              prompts that
              <span className="inline-block px-2 py-1 mx-1 bg-primary/10 text-primary font-semibold rounded-md">improve your SEO</span>,
              <span className="inline-block px-2 py-1 mx-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold rounded-md">create high-quality content</span>,
              and
              <span className="inline-block px-2 py-1 mx-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold rounded-md">skyrocket your website rankings</span>.
            </p>

            {/* Third Paragraph - Removed 'hero-element' as 'animate-fadeInUp' now handles initial opacity */}
            <div className={`mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 animate-fadeInUp delay-1400`}>
              <p className="text-lg font-medium leading-relaxed text-gray-600 dark:text-gray-300 sm:text-xl lg:text-lg xl:text-xl text-optimized">
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

            {/* Fourth Paragraph - Removed 'hero-element' as 'animate-fadeInLeft' now handles initial opacity */}
            <div className={`relative mb-6 animate-fadeInLeft delay-1500`}>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10 rounded-lg"></div>
              <p className="relative p-4 text-lg font-medium leading-relaxed text-gray-700 dark:text-gray-200 sm:text-xl lg:text-lg xl:text-xl text-optimized">
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

            {/* Together let's unlock - Removed 'hero-element' */}
            <p className="text-center font-medium text-lg mt-4 text-optimized">
              <span className={`relative inline-block animate-fadeInLeftBig delay-1600`}>
                <span className="animate-shimmer-custom bg-gradient-to-r from-transparent via-primary/20 to-transparent absolute inset-0 w-full"></span>
                <span className="text-primary dark:text-white text-2xl">Together, let's unlock the future of AI,</span>
              </span>
              <span className={`group relative inline-block mx-2 animate-fadeInRightBig delay-1700`}>
                <span className="font-semibold italic text-blue-600 dark:text-primary text-xl bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                  one solution at a time
                </span>
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600 rounded transition-all duration-500"></span>
                <span className="absolute -right-2 -top-1 text-yellow-400 text-xs rotate-12 transform transition-all animate-pulse2-custom duration-300 group-hover:scale-150 group-hover:opacity-100 opacity-100">✨</span>
                <span className="absolute -left-2 -bottom-2 text-yellow-400 text-xs -rotate-12 transform transition-all animate-pulse2-custom duration-300 group-hover:scale-150 group-hover:opacity-100 opacity-100">✨</span>
              </span>
            </p>
          </div>

          {/* Call to action - Removed 'hero-element' */}
          <div className="flex flex-col mt-8 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <a
              href="/blogs"
              className={`whitespace-nowrap rounded-sm bg-primary px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-primary/80 hover-optimized animate-fadeInUp delay-1800`}
            >
              🔍 Explore AI Insights
            </a>
            <a
              href="/contact"
              className={`whitespace-nowrap rounded-sm bg-black px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-black/90 dark:bg-white/10 dark:text-white dark:hover:bg-white/5 hover-optimized animate-fadeInUp delay-1800`}
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
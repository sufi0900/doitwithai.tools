/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";
// Removed Link import due to environment limitations
// import Link from "next/link";

// Removed animate.css import due to environment limitations
// import "animate.css";

const Hero = () => {
  return (
    <>
      {/* Custom CSS for animations, as animate.css is not supported */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translate3d(0, -100%, 0);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes backInDown {
          0% {
            opacity: 0;
            transform: translateY(-1200px) scale(0.7);
          }
          80% {
            opacity: 1;
            transform: translateY(0px) scale(0.7);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes fadeInDownBig {
          from {
            opacity: 0;
            transform: translate3d(0, -2000px, 0);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translate3d(-100%, 0, 0);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 100%, 0);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translate3d(100%, 0, 0);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes fadeInLeftBig {
          from {
            opacity: 0;
            transform: translate3d(-2000px, 0, 0);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes fadeInRightBig {
          from {
            opacity: 0;
            transform: translate3d(2000px, 0, 0);
          }
          to {
            opacity: 1;
            transform: none;
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

        .animate-fadeInDown { animation-name: fadeInDown; }
        .animate-backInDown { animation-name: backInDown; }
        .animate-fadeInDownBig { animation-name: fadeInDownBig; }
        .animate-fadeInLeft { animation-name: fadeInLeft; }
        .animate-fadeInUp { animation-name: fadeInUp; }
        .animate-fadeInRight { animation-name: fadeInRight; }
        .animate-fadeInLeftBig { animation-name: fadeInLeftBig; }
        .animate-fadeInRightBig { animation-name: fadeInRightBig; }
        .animate-shimmer-custom { animation-name: shimmer; }
        .animate-pulse2-custom { animation-name: pulse2; }

        /* General animation properties */
        .animated {
          animation-duration: 1s;
          animation-fill-mode: both;
        }
        .animate-delay-1s { animation-delay: 1s; }
        .animate-delay-2s { animation-delay: 2s; }
        .animate-delay-3s { animation-delay: 3s; }
        .animate-delay-4s { animation-delay: 4s; }
        .animate-delay-5s { animation-delay: 5s; }
        .animate-delay-5-5s { animation-delay: 5.5s; } /* For 5.5s delay */
        .animate-delay-6s { animation-delay: 6s; }
        .animate-delay-6-5s { animation-delay: 6.5s; } /* For 6.5s delay */

        /* Specific animation overrides for elements that had custom delays */
        .h1-letter-animation {
          animation-duration: 0.6s;
          animation-fill-mode: both;
        }
        .h2-word-animation {
          animation-duration: 0.4s;
        }
      `}</style>

      <section
        id="home"
        className="relative z-10 overflow-hidden bg-teal-50 dark:bg-gray-800
                   min-h-screen flex items-center justify-center py-16 md:py-[75px]"
      >
        {/* New SVG Background */}
        <div className="absolute inset-0 z-[-1] opacity-30 lg:opacity-100">
          <svg width="100%" height="100%" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Gradient for AI/Learning nodes and connections */}
              <linearGradient id="aiGradient1" x1="0" y1="0" x2="1200" y2="800" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4A6CF7" stopOpacity="0.3"/> {/* Blue */}
                <stop offset="1" stopColor="#6366F1" stopOpacity="0.1"/> {/* Indigo */}
              </linearGradient>
              {/* Secondary gradient for more subtle connections */}
              <linearGradient id="aiGradient2" x1="0" y1="0" x2="1200" y2="800" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6" stopOpacity="0.2"/> {/* Lighter Blue */}
                <stop offset="1" stopColor="#A855F7" stopOpacity="0.05"/> {/* Purple */}
              </linearGradient>
              {/* Radial gradient for central node glow */}
              <radialGradient id="nodeGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(600 400) scale(300)">
                <stop stopColor="#4A6CF7" stopOpacity="0.5"/>
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0"/>
              </radialGradient>
            </defs>

            {/* Main neural network core / central idea node */}
            <circle cx="600" cy="400" r="250" fill="url(#nodeGlow)"/>
            <circle cx="600" cy="400" r="200" stroke="#4A6CF7" strokeWidth="2" opacity="0.2"/>

            {/* Interconnected nodes and lines (representing AI connections, learning paths) */}
            <path d="M600 400 L450 250 L300 350 L400 550 L600 400" stroke="url(#aiGradient1)" strokeWidth="1" opacity="0.7"/>
            <path d="M600 400 L750 250 L900 350 L800 550 L600 400" stroke="url(#aiGradient1)" strokeWidth="1" opacity="0.7"/>
            <path d="M600 400 L500 150 L700 150 L600 400" stroke="url(#aiGradient2)" strokeWidth="1" opacity="0.6"/>
            <path d="M600 400 L500 650 L700 650 L600 400" stroke="url(#aiGradient2)" strokeWidth="1" opacity="0.6"/>

            {/* SEO growth lines (upward trend) */}
            <path d="M100 700 C300 600, 500 500, 700 450" stroke="#3B82F6" strokeWidth="3" opacity="0.4"/>
            <path d="M150 750 C350 650, 550 550, 750 500" stroke="#A855F7" strokeWidth="3" opacity="0.4"/>

            {/* Smaller scattered nodes (data points, individual learnings) */}
            <circle cx="200" cy="150" r="15" fill="#4A6CF7" opacity="0.5"/>
            <circle cx="900" cy="100" r="10" fill="#6366F1" opacity="0.4"/>
            <circle cx="1000" cy="600" r="20" fill="#3B82F6" opacity="0.6"/>
            <circle cx="150" cy="550" r="12" fill="#A855F7" opacity="0.3"/>
            <circle cx="700" cy="700" r="18" fill="#4A6CF7" opacity="0.5"/>
          </svg>
        </div>

        <div className="container mx-auto flex flex-col items-center justify-center px-2 lg:px-8 max-w-7xl">
          {/* Hero Component with improved styling variety */}
          <div className="hero-section w-full">
            {/* Welcome with letter animation */}

            <h1 className="text-4xl md:text-5xl lg:text-6xl text-center font-bold mb-2 ">
              {["W", "e", "l", "c", "o", "m", "e", " ", "t", "o"].map((letter, index) => (
                <span
                  key={index}
                  className={`inline-block transform transition-all duration-400 hover:scale-150
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
                    animated animate-fadeInDown h1-letter-animation`}
                  style={{
                    animationDelay: `${index * 0.1 + 0.5}s`,
                  }}
                >
                  <span
                    className="inline-block"
                    style={{
                      animation: `float 2s ease-in-out infinite`,
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </span>
                </span>
              ))}
            </h1>

            {/* Do It With AI Tools with animated gradient border */}
            <h2 className="text-3xl text-center md:text-4xl lg:text-5xl font-extrabold mb-6 text-gray-600 dark:text-gray-400 ">
              <span className="relative inline-block">
                {["Do", "It", "With", "AI", "Tools"].map((word, index) => (
                  <span
                    key={index}
                    className="inline-block mx-1 animated animate-backInDown h2-word-animation"
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
                    {index === 4 &&
                      <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500 rounded animate-pulse"></span>
                    }
                  </span>
                ))}
              </span>
            </h2>

            {/* First Paragraph - with first letter styling preserved */}
            <p className="hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-6 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl first-line:uppercase first-line:tracking-widest first-letter:text-7xl first-letter:font-bold first-letter:text-primary dark:first-letter:text-primary first-letter:me-3 first-letter:float-start">
              Artificial Intelligence is reshaping everything, and you've found the most
              <span className="relative inline-block mx-1 animated animate-fadeInDownBig animate-delay-1s">
                {/* Star animation - left */}
                <span className="absolute -left-2 top-4 text-yellow-400 animate-pulse2-custom text-sm">✨</span>
                <span className="uppercase text-blue-600 dark:text-blue-400 text-xl bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">trusted platform</span>
                {/* Make underline visible always */}
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600 rounded transition-all duration-500"></span>
                {/* Stars with glowing effect on hover */}
                <span className="absolute -right-2 -top-1 text-yellow-400 text-xs rotate-12 transform transition-all animate-pulse2-custom duration-300 group-hover:scale-150 group-hover:opacity-100 opacity-100">✨</span>
                <span className="absolute -left-2 -bottom-2 text-yellow-400 text-xs -rotate-12 transform transition-all animate-pulse2-custom duration-300 group-hover:scale-150 group-hover:opacity-100 opacity-100">✨</span>
              </span>
              to master it.
            </p>

            {/* Second Paragraph - with distinctive styling */}
            <p className="mb-6 text-lg font-medium leading-relaxed text-gray-600 dark:text-gray-300 sm:text-xl lg:text-lg xl:text-xl animated animate-fadeInLeft animate-delay-2s">
              <span className="inline-block px-3 py-1 mx-1 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 text-gray-700 dark:text-gray-200 font-semibold rounded-lg border-l-4 border-blue-500">
                🚀 Discover
              </span>
              the game-changing AI insights and proven
              <span className="relative font-bold text-blue-700 dark:text-blue-300 chatgpt chatgpt-glow mx-2 inline-block">
                ChatGPT
                {/* Tailwind ping animation for glow effect */}
                <span className="pointer-events-none absolute inset-0 rounded-md opacity-20 bg-blue-400 dark:bg-blue-600 animate-ping z-[-1]"></span>
              </span>
              prompts that
              <span className="inline-block px-2 py-1 mx-1 bg-primary/10 text-primary font-semibold rounded-md">
                improve your SEO
              </span>,
              <span className="inline-block px-2 py-1 mx-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold rounded-md">
                create high-quality content
              </span>, and
              <span className="inline-block px-2 py-1 mx-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold rounded-md">
                skyrocket your website rankings
              </span>.
            </p>

            {/* Third Paragraph - with unique card-like styling */}
            <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 animated animate-fadeInUp animate-delay-3s">
              <p className="text-lg font-medium leading-relaxed text-gray-600 dark:text-gray-300 sm:text-xl lg:text-lg xl:text-xl">
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full text-sm mr-2">
                  ⚡ We're
                </span>
                boosting productivity and creativity by showcasing the best AI tools,
                <span className="inline-block px-2 py-1 mx-1 bg-purple-100 dark:bg-violet-900/30 text-purple-700 dark:text-purple-300 font-medium rounded">
                  teaching you to code smarter
                </span>,
                <span className="inline-block px-2 py-1 mx-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium rounded">
                  providing upskilling resources
                </span>, and
                <span className="inline-block px-2 py-1 mx-1 bg-indigo-100 dark:bg-cyan-900/30 text-blue-900 dark:text-white font-medium rounded">
                  sharing premium AI assets
                </span>
                —all completely
                <span className="font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                  FREE
                </span>.
              </p>
            </div>

            {/* Fourth Paragraph - with emphasis styling */}
            <div className="relative mb-6 animated animate-fadeInRight animate-delay-4s">
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

            {/* Together let's unlock - with sophisticated animation */}
            <p className="text-center font-medium text-lg mt-4">
              <span className="relative inline-block animated animate-fadeInLeftBig animate-delay-5s">
                <span className="animate-shimmer-custom bg-gradient-to-r from-transparent via-primary/20 to-transparent absolute inset-0 w-full"></span>
                <span className="text-primary dark:text-white text-2xl">Together, let's unlock the future of AI,</span>
              </span>
              <span className="group relative inline-block mx-2 animated animate-fadeInRightBig animate-delay-5-5s">
                <span className="font-semibold italic text-blue-600 dark:text-primary text-xl bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">one solution at a time</span>
                {/* Make underline visible always */}
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600 rounded transition-all duration-500"></span>

                {/* Stars with glowing effect on hover */}
                <span className="absolute -right-2 -top-1 text-yellow-400 text-xs rotate-12 transform transition-all animate-pulse2-custom duration-300 group-hover:scale-150 group-hover:opacity-100 opacity-100">✨</span>
                <span className="absolute -left-2 -bottom-2 text-yellow-400 text-xs -rotate-12 transform transition-all animate-pulse2-custom duration-300 group-hover:scale-150 group-hover:opacity-100 opacity-100">✨</span>
              </span>
            </p>

          </div>
          {/* Call to action - streamlined */}
          <div className="flex flex-col mt-8 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            {/* Replaced Link with a standard anchor tag */}
            <a href="/blogs" className="whitespace-nowrap rounded-sm bg-primary px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-primary/80 animated animate-fadeInUp animate-delay-6s">
              🔍 Explore AI Insights
            </a>
            {/* Replaced Link with a standard anchor tag */}
            <a href="/contact" className="whitespace-nowrap rounded-sm bg-black px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-black/90 dark:bg-white/10 dark:text-white dark:hover:bg-white/5 animated animate-fadeInUp animate-delay-6-5s">
              💌 Join Our Community
            </a>
          </div>
        </div>
        {/* AI-Themed Background Elements */}

{/* Top Right - Neural Network Pattern */}
<div className="absolute right-0 top-0 z-[-1] opacity-30 lg:opacity-100">
  <svg
    width="450"
    height="556"
    viewBox="0 0 450 556"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Main AI Brain/Neural Network */}
    <circle
      cx="300"
      cy="120"
      r="80"
      fill="url(#paint0_neural_gradient)"
      opacity="0.6"
    />
    
    {/* Neural Network Connections */}
    <path
      d="M250 80 L320 100 L280 140 L350 120 L320 160"
      stroke="url(#paint1_connection)"
      strokeWidth="2"
      opacity="0.7"
    />
    
    <path
      d="M280 60 L350 90 L320 130 L380 110"
      stroke="url(#paint2_connection)"
      strokeWidth="1.5"
      opacity="0.6"
    />
    
    {/* AI Nodes */}
    <circle cx="250" cy="80" r="8" fill="url(#paint3_node)" />
    <circle cx="320" cy="100" r="6" fill="url(#paint4_node)" />
    <circle cx="280" cy="140" r="7" fill="url(#paint3_node)" />
    <circle cx="350" cy="120" r="5" fill="url(#paint4_node)" />
    <circle cx="320" cy="160" r="6" fill="url(#paint3_node)" />
    <circle cx="380" cy="110" r="4" fill="url(#paint4_node)" />
    
    {/* Circuit Pattern */}
    <rect
      x="200"
      y="250"
      width="200"
      height="150"
      rx="10"
      fill="none"
      stroke="url(#paint5_circuit)"
      strokeWidth="1"
      opacity="0.4"
    />
    
    {/* Circuit Lines */}
    <path
      d="M220 270 L380 270 M220 290 L350 290 M220 310 L380 310 M220 330 L350 330"
      stroke="url(#paint6_circuit_lines)"
      strokeWidth="1"
      opacity="0.5"
    />
    
    {/* Circuit Nodes */}
    <circle cx="230" cy="270" r="3" fill="#4A6CF7" />
    <circle cx="370" cy="290" r="3" fill="#06B6D4" />
    <circle cx="240" cy="310" r="3" fill="#8B5CF6" />
    <circle cx="360" cy="330" r="3" fill="#10B981" />
    
    {/* Floating AI Elements */}
    <g opacity="0.6">
      {/* Binary Code Pattern */}
      <text x="150" y="200" fill="url(#paint7_binary)" fontSize="12" fontFamily="monospace" opacity="0.3">
        01001001
      </text>
      <text x="160" y="220" fill="url(#paint7_binary)" fontSize="12" fontFamily="monospace" opacity="0.3">
        11010110
      </text>
      <text x="140" y="240" fill="url(#paint7_binary)" fontSize="12" fontFamily="monospace" opacity="0.3">
        00110101
      </text>
    </g>
    
    {/* Geometric AI Pattern */}
    <polygon
      points="100,450 150,420 200,450 150,480"
      fill="url(#paint8_geometric)"
      opacity="0.4"
    />
    
    <polygon
      points="320,480 370,450 420,480 370,510"
      fill="url(#paint9_geometric)"
      opacity="0.3"
    />
    
    {/* Data Flow Lines */}
    <path
      d="M50 350 Q150 320 250 350 Q350 380 450 350"
      stroke="url(#paint10_dataflow)"
      strokeWidth="2"
      fill="none"
      opacity="0.4"
    />
    
    <defs>
      {/* Neural Network Gradient */}
      <linearGradient
        id="paint0_neural_gradient"
        x1="220"
        y1="40"
        x2="380"
        y2="200"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#4A6CF7" />
        <stop offset="1" stopColor="#06B6D4" stopOpacity="0.3" />
      </linearGradient>
      
      {/* Connection Gradients */}
      <linearGradient
        id="paint1_connection"
        x1="250"
        y1="80"
        x2="320"
        y2="160"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#4A6CF7" />
        <stop offset="1" stopColor="#06B6D4" />
      </linearGradient>
      
      <linearGradient
        id="paint2_connection"
        x1="280"
        y1="60"
        x2="380"
        y2="110"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#8B5CF6" />
        <stop offset="1" stopColor="#10B981" />
      </linearGradient>
      
      {/* Node Gradients */}
      <radialGradient
        id="paint3_node"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#4A6CF7" />
        <stop offset="1" stopColor="#4A6CF7" stopOpacity="0.3" />
      </radialGradient>
      
      <radialGradient
        id="paint4_node"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#06B6D4" />
        <stop offset="1" stopColor="#06B6D4" stopOpacity="0.3" />
      </radialGradient>
      
      {/* Circuit Gradients */}
      <linearGradient
        id="paint5_circuit"
        x1="200"
        y1="250"
        x2="400"
        y2="400"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#4A6CF7" stopOpacity="0.6" />
        <stop offset="1" stopColor="#06B6D4" stopOpacity="0.2" />
      </linearGradient>
      
      <linearGradient
        id="paint6_circuit_lines"
        x1="220"
        y1="270"
        x2="380"
        y2="330"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#4A6CF7" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      
      {/* Binary Code Gradient */}
      <linearGradient
        id="paint7_binary"
        x1="140"
        y1="200"
        x2="200"
        y2="240"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#4A6CF7" />
        <stop offset="1" stopColor="#06B6D4" />
      </linearGradient>
      
      {/* Geometric Gradients */}
      <linearGradient
        id="paint8_geometric"
        x1="100"
        y1="420"
        x2="200"
        y2="480"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#8B5CF6" />
        <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
      </linearGradient>
      
      <linearGradient
        id="paint9_geometric"
        x1="320"
        y1="450"
        x2="420"
        y2="510"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#10B981" />
        <stop offset="1" stopColor="#10B981" stopOpacity="0" />
      </linearGradient>
      
      {/* Data Flow Gradient */}
      <linearGradient
        id="paint10_dataflow"
        x1="50"
        y1="350"
        x2="450"
        y2="350"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#4A6CF7" stopOpacity="0" />
        <stop offset="0.5" stopColor="#06B6D4" />
        <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
</div>

{/* Bottom Left - Data Flow and Analytics */}
<div className="absolute bottom-0 left-0 z-[-1] opacity-30 lg:opacity-100">
  <svg
    width="364"
    height="201"
    viewBox="0 0 364 201"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Data Flow Curves */}
    <path
      d="M5.88928 72.3303C33.6599 66.4798 101.397 64.9086 150.178 105.427C211.155 156.076 229.59 162.093 264.333 166.607C299.076 171.12 337.718 183.657 362.889 212.24"
      stroke="url(#paint0_dataflow_main)"
      strokeWidth="2"
    />
    
    <path
      d="M-22.1107 72.3303C5.65989 66.4798 73.3965 64.9086 122.178 105.427C183.155 156.076 201.59 162.093 236.333 166.607C271.076 171.12 309.718 183.657 334.889 212.24"
      stroke="url(#paint1_dataflow_secondary)"
      strokeWidth="1.5"
      opacity="0.7"
    />
    
    <path
      d="M-53.1107 72.3303C-25.3401 66.4798 42.3965 64.9086 91.1783 105.427C152.155 156.076 170.59 162.093 205.333 166.607C240.076 171.12 278.718 183.657 303.889 212.24"
      stroke="url(#paint2_dataflow_tertiary)"
      strokeWidth="1"
      opacity="0.5"
    />
    
    {/* AI Analytics Visualization */}
    <circle
      cx="220"
      cy="63"
      r="35"
      fill="url(#paint3_analytics_core)"
      opacity="0.8"
    />
    
    {/* Data Points */}
    <circle cx="190" cy="45" r="3" fill="#4A6CF7" opacity="0.8" />
    <circle cx="210" cy="35" r="2" fill="#06B6D4" opacity="0.8" />
    <circle cx="240" cy="40" r="3" fill="#8B5CF6" opacity="0.8" />
    <circle cx="250" cy="70" r="2" fill="#10B981" opacity="0.8" />
    <circle cx="195" cy="85" r="3" fill="#F59E0B" opacity="0.8" />
    
    {/* Connection Lines to Data Points */}
    <path
      d="M220 63 L190 45 M220 63 L210 35 M220 63 L240 40 M220 63 L250 70 M220 63 L195 85"
      stroke="url(#paint4_connections)"
      strokeWidth="1"
      opacity="0.4"
    />
    
    {/* Machine Learning Pattern */}
    <rect
      x="50"
      y="120"
      width="80"
      height="40"
      rx="5"
      fill="none"
      stroke="url(#paint5_ml_pattern)"
      strokeWidth="1"
      opacity="0.4"
    />
    
    {/* ML Nodes */}
    <circle cx="70" cy="130" r="2" fill="#4A6CF7" />
    <circle cx="90" cy="135" r="2" fill="#06B6D4" />
    <circle cx="110" cy="140" r="2" fill="#8B5CF6" />
    <circle cx="70" cy="150" r="2" fill="#10B981" />
    <circle cx="90" cy="145" r="2" fill="#F59E0B" />
    <circle cx="110" cy="150" r="2" fill="#EF4444" />
    
    {/* Algorithm Flow */}
    <path
      d="M280 100 L320 110 L340 130 L360 140"
      stroke="url(#paint6_algorithm)"
      strokeWidth="2"
      fill="none"
      opacity="0.6"
    />
    
    {/* Algorithm Nodes */}
    <circle cx="280" cy="100" r="4" fill="#4A6CF7" />
    <circle cx="320" cy="110" r="3" fill="#06B6D4" />
    <circle cx="340" cy="130" r="3" fill="#8B5CF6" />
    <circle cx="360" cy="140" r="4" fill="#10B981" />
    
    <defs>
      {/* Data Flow Gradients */}
      <linearGradient
        id="paint0_dataflow_main"
        x1="184.389"
        y1="69.2405"
        x2="184.389"
        y2="212.24"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#4A6CF7" stopOpacity="0" />
        <stop offset="0.5" stopColor="#06B6D4" />
        <stop offset="1" stopColor="#4A6CF7" />
      </linearGradient>
      
      <linearGradient
        id="paint1_dataflow_secondary"
        x1="156.389"
        y1="69.2405"
        x2="156.389"
        y2="212.24"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#8B5CF6" stopOpacity="0" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      
      <linearGradient
        id="paint2_dataflow_tertiary"
        x1="125.389"
        y1="69.2405"
        x2="125.389"
        y2="212.24"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#10B981" stopOpacity="0" />
        <stop offset="1" stopColor="#10B981" />
      </linearGradient>
      
      {/* Analytics Core */}
      <radialGradient
        id="paint3_analytics_core"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(220 63) rotate(90) scale(35)"
      >
        <stop offset="0" stopColor="#4A6CF7" stopOpacity="0.3" />
        <stop offset="1" stopColor="#06B6D4" stopOpacity="0.1" />
      </radialGradient>
      
      {/* Connection Lines */}
      <linearGradient
        id="paint4_connections"
        x1="190"
        y1="35"
        x2="250"
        y2="85"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#4A6CF7" />
        <stop offset="1" stopColor="#06B6D4" />
      </linearGradient>
      
      {/* ML Pattern */}
      <linearGradient
        id="paint5_ml_pattern"
        x1="50"
        y1="120"
        x2="130"
        y2="160"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#8B5CF6" />
        <stop offset="1" stopColor="#10B981" />
      </linearGradient>
      
      {/* Algorithm Flow */}
      <linearGradient
        id="paint6_algorithm"
        x1="280"
        y1="100"
        x2="360"
        y2="140"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#4A6CF7" />
        <stop offset="1" stopColor="#10B981" />
      </linearGradient>
    </defs>
  </svg>
</div>
      </section>
    </>
  );
};

export default Hero;
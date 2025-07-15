// components/Hero/HeroEnhanced.jsx
"use client";
import { useEffect, useState } from 'react';

const HeroEnhanced = () => {
  const [animationsReady, setAnimationsReady] = useState(false);

  useEffect(() => {
    // Ensure animations start after component mounts
    const timer = setTimeout(() => {
      setAnimationsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Enhanced overlay that appears over the critical content */}
      <div 
        className="hero-enhancement-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 z-[-1] opacity-30 lg:opacity-100">
          <svg width="100%" height="100%" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="aiGradient1" x1="0" y1="0" x2="1200" y2="800" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4A6CF7" stopOpacity="0.3"/>
                <stop offset="1" stopColor="#6366F1" stopOpacity="0.1"/>
              </linearGradient>
              <linearGradient id="aiGradient2" x1="0" y1="0" x2="1200" y2="800" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6" stopOpacity="0.2"/>
                <stop offset="1" stopColor="#A855F7" stopOpacity="0.05"/>
              </linearGradient>
              <radialGradient id="nodeGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(600 400) scale(300)">
                <stop stopColor="#4A6CF7" stopOpacity="0.5"/>
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0"/>
              </radialGradient>
            </defs>
            
            {/* Main neural network core */}
            <circle cx="600" cy="400" r="250" fill="url(#nodeGlow)" className={animationsReady ? 'animate-pulse' : ''}/>
            <circle cx="600" cy="400" r="200" stroke="#4A6CF7" strokeWidth="2" opacity="0.2"/>
            
            {/* Interconnected nodes and lines */}
            <path d="M600 400 L450 250 L300 350 L400 550 L600 400" stroke="url(#aiGradient1)" strokeWidth="1" opacity="0.7"/>
            <path d="M600 400 L750 250 L900 350 L800 550 L600 400" stroke="url(#aiGradient1)" strokeWidth="1" opacity="0.7"/>
            <path d="M600 400 L500 150 L700 150 L600 400" stroke="url(#aiGradient2)" strokeWidth="1" opacity="0.6"/>
            <path d="M600 400 L500 650 L700 650 L600 400" stroke="url(#aiGradient2)" strokeWidth="1" opacity="0.6"/>
            
            {/* SEO growth lines */}
            <path d="M100 700 C300 600, 500 500, 700 450" stroke="#3B82F6" strokeWidth="3" opacity="0.4"/>
            <path d="M150 750 C350 650, 550 550, 750 500" stroke="#A855F7" strokeWidth="3" opacity="0.4"/>
            
            {/* Smaller scattered nodes */}
            <circle cx="200" cy="150" r="15" fill="#4A6CF7" opacity="0.5" className={animationsReady ? 'animate-bounce' : ''}/>
            <circle cx="900" cy="100" r="10" fill="#6366F1" opacity="0.4" className={animationsReady ? 'animate-pulse' : ''}/>
            <circle cx="1000" cy="600" r="20" fill="#3B82F6" opacity="0.6" className={animationsReady ? 'animate-bounce' : ''}/>
            <circle cx="150" cy="550" r="12" fill="#A855F7" opacity="0.3" className={animationsReady ? 'animate-pulse' : ''}/>
            <circle cx="700" cy="700" r="18" fill="#4A6CF7" opacity="0.5" className={animationsReady ? 'animate-bounce' : ''}/>
          </svg>
        </div>
      </div>

      {/* Enhanced typography overlay */}
      <div 
        className="hero-text-enhancement"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '1200px',
          padding: '0 1rem',
          pointerEvents: 'none',
          zIndex: 2
        }}
      >
        {animationsReady && (
          <>
            {/* Enhanced welcome text with letter animation */}
            <div className="enhanced-welcome" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <h1 style={{ fontSize: '0', lineHeight: '1.2' }}>
                {["W", "e", "l", "c", "o", "m", "e", " ", "t", "o"].map((letter, index) => (
                  <span
                    key={index}
                    className="inline-block transform transition-all duration-400 hover:scale-150"
                    style={{
                      fontSize: '3rem',
                      fontWeight: '700',
                      color: '#1f2937',
                      display: 'inline-block',
                      animation: `fadeInDown 0.6s ease-out forwards`,
                      animationDelay: `${index * 0.1 + 0.5}s`,
                      opacity: 0
                    }}
                  >
                    <span 
                      style={{
                        display: 'inline-block',
                        animation: `float 2s ease-in-out infinite`,
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      {letter === " " ? "\u00A0" : letter}
                    </span>
                  </span>
                ))}
              </h1>
            </div>

            {/* Enhanced subtitle with gradient animation */}
            <div className="enhanced-subtitle" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '0', lineHeight: '1.2' }}>
                {["Do", "It", "With", "AI", "Tools"].map((word, index) => (
                  <span
                    key={index}
                    className="inline-block mx-1"
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: '800',
                      color: '#4b5563',
                      animation: `backInDown 0.4s ease-out forwards`,
                      animationDelay: `${0.5 + index * 0.3}s`,
                      opacity: 0,
                      background: index === 3 ? 'linear-gradient(90deg, #3b82f6, #6366f1)' : 'transparent',
                      backgroundClip: index === 3 ? 'text' : 'border-box',
                      WebkitBackgroundClip: index === 3 ? 'text' : 'border-box',
                      WebkitTextFillColor: index === 3 ? 'transparent' : 'currentColor'
                    }}
                  >
                    {word}
                  </span>
                ))}
              </h2>
            </div>

            {/* Enhanced description with rich formatting */}
            <div className="enhanced-description" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <p style={{
                fontSize: '1.25rem',
                fontWeight: '500',
                lineHeight: '1.75',
                color: '#6b7280',
                maxWidth: '800px',
                margin: '0 auto',
                animation: 'fadeInUp 0.8s ease-out forwards',
                animationDelay: '1.5s',
                opacity: 0
              }}>
                Artificial Intelligence is reshaping everything, and you've found the most{' '}
                <span style={{
                  color: '#2563eb',
                  fontWeight: '600',
                  background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  trusted platform
                </span>{' '}
                to master it.
              </p>
            </div>

            {/* Enhanced additional content */}
            <div className="enhanced-content" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <p style={{
                fontSize: '1.125rem',
                fontWeight: '500',
                lineHeight: '1.75',
                color: '#6b7280',
                maxWidth: '900px',
                margin: '0 auto',
                animation: 'fadeInLeft 0.8s ease-out forwards',
                animationDelay: '2s',
                opacity: 0
              }}>
                🚀 <strong>Discover</strong> the game-changing AI insights and proven{' '}
                <span style={{
                  color: '#1d4ed8',
                  fontWeight: '600',
                  background: 'linear-gradient(90deg, #1d4ed8, #06b6d4)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  ChatGPT
                </span>{' '}
                prompts that improve your SEO, create high-quality content, and skyrocket your website rankings.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Animation keyframes */}
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

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: none;
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }

        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .enhanced-welcome h1 span {
            font-size: 2rem !important;
          }
          
          .enhanced-subtitle h2 span {
            font-size: 1.5rem !important;
          }
          
          .enhanced-description p {
            font-size: 1rem !important;
          }
          
          .enhanced-content p {
            font-size: 0.9rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default HeroEnhanced;
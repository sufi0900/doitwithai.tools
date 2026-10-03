/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect } from 'react';
import { X, Star, Sparkles, Heart, Trophy, Gift, Zap, Crown, Gem } from 'lucide-react';

// Confetti component with enhanced effects
const Confetti = ({ mode = 'external', isActive }) => {
  let confettiCount;
  if (mode === 'external') {
    confettiCount = 120; // More particles for bigger celebration
  } else if (mode === 'internal') {
    confettiCount = 60; // More internal particles
  } else {
    confettiCount = 25; // More continuous particles
  }
  
  const emojis = ['🎉', '✨', '🎊', '⭐', '�', '🥳', '🌟', '💫', '🎈', '🏆', '💎', '👑']; // More variety

  if (!isActive && mode !== 'continuous') return null;

  const particles = Array.from({ length: confettiCount }).map((_, i) => {
    let initialX, initialY, translateXEnd, translateYEnd;
    const rotation = Math.random() * 720;
    let delay, duration, animationFillMode;

    if (mode === 'external') {
      delay = (i * 0.03) + Math.random() * 0.2;
      duration = 1.5 + Math.random() * 1;
      animationFillMode = 'forwards';

      const startFromLeft = Math.random() > 0.5;
      initialX = startFromLeft ? -10 - (Math.random() * 15) : 110 + (Math.random() * 15); 
      initialY = Math.random() * 100;

      const targetX = 35 + (Math.random() * 30);
      const targetY = 35 + (Math.random() * 30);

      translateXEnd = targetX - initialX;
      translateYEnd = targetY - initialY;
    } else if (mode === 'internal') {
      delay = (i * 0.02) + Math.random() * 0.15;
      duration = 1.2 + Math.random() * 0.8;
      animationFillMode = 'forwards';

      initialX = 50 + (Math.random() - 0.5) * 20;
      initialY = 50 + (Math.random() - 0.5) * 20;

      translateXEnd = (Math.random() - 0.5) * 400;
      translateYEnd = (Math.random() - 0.5) * 400;
    } else {
      delay = Math.random() * 3;
      duration = 6 + Math.random() * 4;
      animationFillMode = 'infinite linear';

      const startFromLeft = Math.random() > 0.5;
      initialX = startFromLeft ? -15 - (Math.random() * 10) : 115 + (Math.random() * 10); 
      initialY = Math.random() * 130 - 15;

      translateXEnd = (Math.random() * 120) - initialX;
      translateYEnd = (Math.random() * 120) - initialY;
    }

    return (
      <div
        key={`${mode}-${i}`}
        className="absolute text-2xl md:text-3xl lg:text-4xl drop-shadow-lg"
        style={{
          left: `${initialX}${mode === 'external' ? 'vw' : '%'}`, 
          top: `${initialY}${mode === 'external' ? 'vh' : '%'}`,   
          transform: `translate(-50%, -50%)`,
          animation: `confetti-anim-${mode} ${duration}s ease-out ${delay}s ${animationFillMode}`,
          opacity: 0,
          '--translate-x-end': `${translateXEnd}${mode === 'external' ? 'vw' : '%'}`, 
          '--translate-y-end': `${translateYEnd}${mode === 'external' ? 'vh' : '%'}`, 
          '--rotation': `${rotation}deg`,
        }}
      >
        {emojis[Math.floor(Math.random() * emojis.length)]}
      </div>
    );
  });

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${mode === 'external' ? 'z-60' : (mode === 'internal' ? 'z-20' : 'z-25')}`}>
      {particles}
    </div>
  );
};

// Fireworks effect component
const Fireworks = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${20 + i * 10}%`,
            top: `${30 + (i % 3) * 20}%`,
            background: `hsl(${i * 45}, 100%, 60%)`,
            animation: `firework ${2 + Math.random()}s ease-out ${i * 0.2}s infinite`,
            boxShadow: `0 0 10px hsl(${i * 45}, 100%, 60%)`,
          }}
        />
      ))}
    </div>
  );
};

const CongratsPopup = ({
  showAfter = 10000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showSecondWave, setShowSecondWave] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => {
        setIsAnimating(true);
        setShowFireworks(true);
        // Second wave of celebration
        setTimeout(() => setShowSecondWave(true), 1000);
      }, 100);
    }, showAfter);

    return () => clearTimeout(timer);
  }, [showAfter]);

  // Effect to manage body scroll
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = ''; // Reset to default
    }

    // Cleanup function to ensure scroll is re-enabled if component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);


  const handleClose = () => {
    setIsAnimating(false);
    setShowFireworks(false);
    setShowSecondWave(false);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      {/* Enhanced External Confetti */}
      <Confetti mode="external" isActive={showFireworks} />
      <Confetti mode="external" isActive={showSecondWave} />
      
      {/* Fireworks Effect */}
      <Fireworks isActive={showFireworks} />

      {/* Radial celebration rings */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border-4 border-yellow-400/30 animate-ping"
            style={{
              animationDelay: `${i * 0.3}s`,
              animationDuration: '3s',
              transform: `scale(${0.5 + i * 0.3})`,
            }}
          />
        ))}
      </div>

      {/* Main popup container with enhanced entrance - Removed max-h and overflow-y-auto */}
      <div className={`
        relative w-full max-w-lg mx-4 
        transform transition-all duration-1000 ease-out 
        ${isAnimating
          ? 'scale-100 opacity-100 translate-y-0 rotate-0'
          : 'scale-30 opacity-0 translate-y-20 rotate-45'
        }
      `}>
        
        {/* Enhanced floating sparkles with better visibility */}
        <div className="absolute -inset-20 pointer-events-none">
          {[...Array(20)].map((_, i) => {
            const icons = [Star, Sparkles, Heart, Gem, Crown, Zap];
            const Icon = icons[i % icons.length];
            return (
              <div
                key={i}
                className="absolute animate-float-complex"
                style={{
                  left: `${5 + (i * 4.5)}%`,
                  top: `${-5 + (i % 6) * 20}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${2.5 + (i % 4)}s`,
                }}
              >
                <Icon 
                  className={`w-5 h-5 ${
                    i % 4 === 0 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' :
                    i % 4 === 1 ? 'text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]' :
                    i % 4 === 2 ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' :
                    'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Multi-layered pulsing glow effect */}
        <div className="absolute -inset-8 bg-gradient-to-r from-yellow-400/40 via-pink-500/40 to-purple-600/40 rounded-3xl blur-2xl animate-pulse-glow-intense" />
        <div className="absolute -inset-6 bg-gradient-to-r from-blue-400/30 via-emerald-400/30 to-orange-400/30 rounded-3xl blur-xl animate-pulse-glow-offset" />

        {/* Enhanced main popup with rainbow border */}
        <div className="relative bg-gradient-to-r from-yellow-400 via-pink-500 via-purple-600 to-blue-500 p-[3px] rounded-3xl shadow-2xl animate-rainbow-spin">
          <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl p-4 sm:p-6 text-center relative overflow-hidden"> {/* Further adjusted padding */}
            
            {/* Enhanced Internal Confetti */}
            <Confetti mode="internal" isActive={showFireworks} />
            <Confetti mode="internal" isActive={showSecondWave} />
            <Confetti mode="continuous" isActive={true} />

            {/* Animated background with better visibility */}
            <div className="absolute inset-0 opacity-15 dark:opacity-10">
              <div className="absolute top-0 left-0 w-full h-full">
                {[...Array(12)].map((_, i) => {
                  const icons = [Star, Heart, Trophy, Crown, Gem];
                  const Icon = icons[i % icons.length];
                  return (
                    <div
                      key={i}
                      className="absolute animate-bounce-slow"
                      style={{
                        left: `${10 + i * 8}%`,
                        top: `${5 + (i % 3) * 30}%`,
                        animationDelay: `${i * 0.3}s`,
                      }}
                    >
                      <Icon className={`w-8 h-8 ${
                        i % 3 === 0 ? 'text-yellow-500' :
                        i % 3 === 1 ? 'text-pink-500' : 'text-purple-500'
                      } drop-shadow-lg`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enhanced close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 z-30 hover:scale-110 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-600"
              aria-label="Close popup"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Enhanced content */}
            <div className="relative z-10">
              {/* Animated trophy with crown */}
              <div className="mx-auto mb-6 relative"> {/* Reduced mb */}
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center animate-bounce-trophy-enhanced shadow-2xl relative"> {/* Reduced size */}
                  <Trophy className="w-10 h-10 text-white fill-current drop-shadow-lg" /> {/* Reduced size */}
                  {/* Crown on top */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2"> {/* Adjusted position */}
                    <Crown className="w-7 h-7 text-yellow-300 fill-current animate-pulse drop-shadow-lg" /> {/* Reduced size */}
                  </div>
                </div>
                
                {/* Enhanced sparkle effects - Adjusted positions and sizes */}
                <div className="absolute -top-3 -right-3 animate-ping">
                  <Sparkles className="w-7 h-7 text-yellow-400 drop-shadow-glow" />
                </div>
                <div className="absolute -bottom-3 -left-3 animate-ping" style={{ animationDelay: '0.5s' }}>
                  <Star className="w-6 h-6 text-pink-400 fill-current drop-shadow-glow" />
                </div>
                <div className="absolute -top-1 -left-5 animate-ping" style={{ animationDelay: '1s' }}>
                  <Gem className="w-5 h-5 text-purple-400 drop-shadow-glow" />
                </div>
                <div className="absolute -bottom-1 -right-5 animate-ping" style={{ animationDelay: '1.5s' }}>
                  <Heart className="w-5 h-5 text-red-400 fill-current drop-shadow-glow" />
                </div>
              </div>

              {/* Enhanced main heading */}
             <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 via-pink-600 to-orange-500 mb-4 animate-gradient-text-enhanced drop-shadow-lg">
  🎉 Congratulations, AI Enthusiast! 🎉
</h2>

<h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-4 animate-fade-in-up drop-shadow-sm" style={{ animationDelay: '0.5s' }}>
  ✨ Your Dedication Shines! ✨
</h3>

<div className="space-y-3 text-gray-700 dark:text-gray-300 animate-fade-in-up mb-6" style={{ animationDelay: '0.7s' }}>
  <p className="text-lg font-medium">
    🌟 Thank you for spending quality time diving deep into our AI insights!
  </p>
  <p className="text-base">
    Your commitment to understanding artificial intelligence truly sets you apart. It's clear you're at the forefront of the AI revolution.
  </p>
  <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
    Keep exploring – the future of AI is here, and you're helping to shape it! 🚀✨
  </p>
</div>
              {/* Enhanced emoji celebration */}
              <div className="flex justify-center space-x-2 mb-6"> {/* Reduced space-x and mb */}
                {['🎊', '✨', '🏆', '💎', '👑', '🎉', '⭐', '💫'].map((emoji, i) => (
                  <span 
                    key={i}
                    className="text-2xl animate-bounce-celebration-enhanced drop-shadow-lg" 
                    style={{ animationDelay: `${i * 0.1 + 1}s` }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>

              {/* Enhanced OK Button */}
              <button
                onClick={handleClose}
                className="group relative px-8 py-3 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white font-bold text-base rounded-full shadow-2xl hover:shadow-3xl transform transition-all duration-500 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-300/50 animate-fade-in-up overflow-hidden" 
                style={{ animationDelay: '1s' }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Gift className="w-4 h-4" /> {/* Reduced icon size */}
                  Awesome, Got it! 
                  <Sparkles className="w-4 h-4" /> {/* Reduced icon size */}
                </span>
                
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Button sparkle effects */}
                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-spin drop-shadow-glow" />
                </div>
                <div className="absolute -bottom-1 -left-1 opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ transitionDelay: '0.1s' }}>
                  <Star className="w-4 h-4 text-pink-300 fill-current animate-pulse drop-shadow-glow" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-complex {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-15px) rotate(90deg) scale(1.1); }
          50% { transform: translateY(-8px) rotate(180deg) scale(0.9); }
          75% { transform: translateY(-12px) rotate(270deg) scale(1.05); }
        }
        
        @keyframes pulse-glow-intense {
          0%, 100% { opacity: 0.6; transform: scale(1) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.1) rotate(180deg); }
        }
        
        @keyframes pulse-glow-offset {
          0%, 100% { opacity: 0.4; transform: scale(1.05) rotate(0deg); }
          50% { opacity: 0.8; transform: scale(0.95) rotate(-180deg); }
        }
        
        @keyframes rainbow-spin {
          0% { transform: rotate(0deg); filter: hue-rotate(0deg); }
          100% { transform: rotate(360deg); filter: hue-rotate(360deg); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-25px) scale(1.1); }
        }
        
        @keyframes bounce-trophy-enhanced {
          0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); }
          25% { transform: translateY(-8px) scale(1.05) rotate(-5deg); }
          50% { transform: translateY(-15px) scale(1.1) rotate(0deg); }
          75% { transform: translateY(-8px) scale(1.05) rotate(5deg); }
        }
        
        @keyframes gradient-text-enhanced {
          0%, 100% { background-position: 0% 50%; background-size: 200% 200%; }
          50% { background-position: 100% 50%; background-size: 200% 200%; }
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes bounce-celebration-enhanced {
          0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); }
          25% { transform: translateY(-10px) scale(1.3) rotate(-15deg); }
          50% { transform: translateY(-20px) scale(1.4) rotate(0deg); }
          75% { transform: translateY(-10px) scale(1.3) rotate(15deg); }
        }

        @keyframes firework {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 0.8; }
          100% { transform: scale(3) rotate(360deg); opacity: 0; }
        }

        @keyframes confetti-anim-external {
          0% {
            transform: translate(-50%, -50%) scale(0.3) rotate(var(--rotation));
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--translate-x-end)), calc(-50% + var(--translate-y-end))) scale(1.2) rotate(calc(var(--rotation) + 720deg)); 
            opacity: 0;
          }
        }
        @keyframes confetti-anim-internal {
          0% {
            transform: translate(-50%, -50%) scale(0.3) rotate(var(--rotation));
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--translate-x-end)), calc(-50% + var(--translate-y-end))) scale(1.1) rotate(calc(var(--rotation) + 720deg)); 
            opacity: 0;
          }
        }
        @keyframes confetti-anim-continuous {
          0% {
            transform: translate(-50%, -50%) scale(0.4) rotate(var(--rotation));
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            transform: translate(calc(-50% + var(--translate-x-end)), calc(-50% + var(--translate-y-end))) scale(1) rotate(calc(var(--rotation) + 360deg));
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--translate-x-end)), calc(-50% + var(--translate-y-end))) scale(0.6) rotate(calc(var(--rotation) + 720deg));
            opacity: 0;
          }
        }

        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  );
};

export default CongratsPopup;

// components/Hero/AdvancedAnimations.jsx
import React, { useEffect } from 'react';

const AdvancedAnimations = ({ containerRef }) => {
  useEffect(() => {
    // Ensure this only runs on the client-side
    if (typeof window === 'undefined' || !containerRef.current) {
      return;
    }

    // --- Initial Load Animations ---
    // Apply animations that should run as soon as this component loads
    const loadElements = containerRef.current.querySelectorAll('.animate-on-load');
    loadElements.forEach(el => {
      // Find the animation class and apply it
      const animationClass = Array.from(el.classList).find(cls => cls.startsWith('load-anim-'));
      if (animationClass) {
        el.classList.add(animationClass.replace('load-anim-', ''));
      }
    });

    // --- Scroll-Triggered Animations ---
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target); // Animate only once
          }
        });
      },
      { threshold: 0.1 }
    );

    const scrollElements = containerRef.current.querySelectorAll('.animate-on-scroll');
    scrollElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [containerRef]);

  return (
    <>
      {/* Particle elements for the background effect */}
      <div className="particle-container">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>

      <style jsx>{`
        /* --- All non-critical animations are defined here --- */
        
        /* Keyframes */
        @keyframes fadeInDown { from { opacity: 0; transform: translate3d(0, -100%, 0); } to { opacity: 1; transform: none; } }
        @keyframes backInDown { 0% { opacity: 0; transform: translateY(-1200px) scale(0.7); } 80% { opacity: 1; transform: translateY(0px) scale(0.7); } 100% { transform: scale(1); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translate3d(0, 100%, 0); } to { opacity: 1; transform: none; } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translate3d(-100%, 0, 0); } to { opacity: 1; transform: none; } }
        @keyframes fadeInRight { from { opacity: 0; transform: translate3d(100%, 0, 0); } to { opacity: 1; transform: none; } }
        @keyframes fadeInLeftBig { from { opacity: 0; transform: translate3d(-2000px, 0, 0); } to { opacity: 1; transform: none; } }
        @keyframes fadeInRightBig { from { opacity: 0; transform: translate3d(2000px, 0, 0); } to { opacity: 1; transform: none; } }
        @keyframes pulse2 { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }

        /* Animation Classes */
        .animate-fadeInDown { animation: fadeInDown 1s both; }
        .animate-backInDown { animation: backInDown 1s both; }
        .animate-fadeInUp { animation: fadeInUp 1s both; }
        .animate-fadeInLeft { animation: fadeInLeft 1s both; }
        .animate-fadeInRight { animation: fadeInRight 1s both; }
        .animate-fadeInLeftBig { animation: fadeInLeftBig 1s both; }
        .animate-fadeInRightBig { animation: fadeInRightBig 1s both; }
        .animate-pulse2 { animation: pulse2 1.5s infinite; }

        /* Scroll-triggered animation setup */
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .animate-on-scroll.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        /* Particle Effects */
        .particle-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
            z-index: -1;
        }
        .particle {
          position: absolute;
          background-color: rgba(74, 108, 247, 0.3); /* theme color */
          border-radius: 50%;
          opacity: 0;
          animation: float 6s ease-in-out infinite, fadeIn 2s forwards;
        }
        /* Completed particle styles with variation */
        .particle:nth-child(1) { width: 10px; height: 10px; left: 15%; bottom: 20%; animation-delay: 0s, 0.5s; }
        .particle:nth-child(2) { width: 15px; height: 15px; left: 45%; bottom: 40%; animation-delay: 1s, 1s; animation-duration: 8s; }
        .particle:nth-child(3) { width: 8px; height: 8px; left: 75%; bottom: 30%; animation-delay: 2s, 1.5s; }
        .particle:nth-child(4) { width: 12px; height: 12px; left: 90%; bottom: 60%; animation-delay: 0.5s, 0.2s; animation-duration: 7s; }
        .particle:nth-child(5) { width: 7px; height: 7px; left: 5%; bottom: 80%; animation-delay: 3s, 2s; }
        .particle:nth-child(6) { width: 18px; height: 18px; left: 25%; bottom: 60%; animation-delay: 1.5s, 1.2s; animation-duration: 9s; }
      `}</style>
    </>
  );
};

export default AdvancedAnimations;
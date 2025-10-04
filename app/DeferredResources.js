// components/DeferredStyles.js or DeferredStyles.js (same directory as layout)
"use client";
import { useEffect } from 'react';

export default function DeferredStyles() {
  useEffect(() => {
    // Dynamically load critical-hero.css after Hero is rendered
    const loadCriticalHeroCSS = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '../components/Hero/critical-hero.css'; // Adjust path as needed
      link.media = 'all';
      document.head.appendChild(link);
    };

    // Dynamically load carousel styles
    const loadCarouselStyles = () => {
      const slickCSS = document.createElement('link');
      slickCSS.rel = 'stylesheet';
      slickCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.css';
      document.head.appendChild(slickCSS);

      const slickThemeCSS = document.createElement('link');
      slickThemeCSS.rel = 'stylesheet';
      slickThemeCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick-theme.min.css';
      document.head.appendChild(slickThemeCSS);
    };

    // Load styles with progressive delays
    const timer1 = setTimeout(loadCriticalHeroCSS, 100);
    const timer2 = setTimeout(loadCarouselStyles, 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return null; // This component doesn't render anything
}
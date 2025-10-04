"use client";

import React, { useState, useEffect } from 'react';
import Header from "@/components/Header"; // Your existing global header

const ConditionalGlobalHeader = () => {
  const [showGlobalHeader, setShowGlobalHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 100; // Adjust this value based on when you want the transition
      
      // Show global header when at very top (within threshold)
      if (currentScrollY <= scrollThreshold) {
        setShowGlobalHeader(true);
      } 
      // Hide global header when scrolling down past threshold
      else if (currentScrollY > scrollThreshold) {
        setShowGlobalHeader(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className={`
      fixed top-0 left-0 w-full z-40 
      transition-all duration-500 ease-out
      ${showGlobalHeader 
        ? 'translate-y-0 opacity-100' 
        : '-translate-y-full opacity-0 pointer-events-none'
      }
    `}>
      <Header />
    </div>
  );
};

export default ConditionalGlobalHeader;
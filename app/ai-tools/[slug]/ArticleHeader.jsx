"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Avatar from '@mui/material/Avatar';
import ThemeToggler from "@/components/Header/ThemeToggler";

const ArticleHeader = ({ articleTitle, isSticky = false }) => {
  const [mounted, setMounted] = useState(false);
  const [showGlobalHeader, setShowGlobalHeader] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
   
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 100;
     
      setShowGlobalHeader(currentScrollY <= scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
   
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8
    });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 w-full z-50
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
          border-b border-gray-200/50 dark:border-gray-700/50
          transition-all duration-500 ease-out
          ${isSticky && !showGlobalHeader
            ? 'translate-y-0 opacity-100 shadow-xl shadow-gray-900/10 dark:shadow-gray-900/30'
            : '-translate-y-full opacity-0 pointer-events-none'
          }
        `}
      >
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-white/50 to-purple-50/30 dark:from-gray-900/50 dark:via-gray-800/50 dark:to-gray-900/50 pointer-events-none" />
       
        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-between h-16 px-4">
           
            {/* Enhanced Logo with improved hover effects */}
            <div className="flex-shrink-0 group">
              <div className="relative">
                <Avatar
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  sx={{
                    width: 48,
                    height: 48,
                    background: "transparent",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                  className="group-hover:scale-110 transition-all duration-300 ring-2 ring-transparent group-hover:ring-blue-500/40 group-hover:ring-offset-2 group-hover:ring-offset-white dark:group-hover:ring-offset-gray-900 shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/20"
                >
                  <Image
                    src="/logoForHeader.png"
                    alt="Logo"
                    width={48}
                    height={48}
                    className="w-full dark:hidden transition-all duration-300"
                  />
                  <Image
                    src="/logoForHeader.png"
                    alt="Logo"
                    width={48}
                    height={48}
                    className="hidden w-full dark:block transition-all duration-300"
                  />
                </Avatar>
               
                {/* Enhanced glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10 animate-pulse" />
              </div>
            </div>

            {/* Enhanced Article Title with tooltip functionality */}
            <div className="flex-grow flex justify-center px-4">
              <div className="relative max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl group">
               
                {/* Enhanced background decoration with animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800/60 dark:via-gray-700/60 dark:to-gray-800/60 rounded-xl blur-sm opacity-60 group-hover:opacity-80 transition-all duration-300" />
               
                {/* Main title container with hover effects */}
                <div 
                  className="relative bg-white/70 dark:bg-gray-800/70 rounded-xl px-4 py-3 border border-gray-200/40 dark:border-gray-600/40 backdrop-blur-sm group-hover:bg-white/80 dark:group-hover:bg-gray-800/80 group-hover:border-blue-500/30 dark:group-hover:border-blue-400/30 transition-all duration-300 cursor-help"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <h2 className="text-center text-sm sm:text-base md:text-lg font-bold
                                bg-gradient-to-r from-gray-800 via-blue-900 to-gray-800 dark:from-white dark:via-blue-100 dark:to-white
                                bg-clip-text text-transparent
                                truncate leading-tight group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-blue-600 dark:group-hover:from-blue-300 dark:group-hover:via-purple-300 dark:group-hover:to-blue-300 transition-all duration-300">
                    {articleTitle || "Article"}
                  </h2>
                 
                  {/* Enhanced underline accent with animation */}
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-70 group-hover:w-16 group-hover:opacity-100 transition-all duration-300" />
                  
                  {/* Hover indicator */}
                  <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
                </div>
               
                {/* Enhanced side decorative elements */}
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full opacity-30 group-hover:opacity-60 group-hover:h-10 transition-all duration-300" />
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full opacity-30 group-hover:opacity-60 group-hover:h-10 transition-all duration-300" />
              </div>
            </div>

            {/* Enhanced Theme Toggle */}
            <div className="flex-shrink-0">
              <div className="relative  rounded-xl bg-gray-100/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/40 dark:border-gray-600/40 hover:border-blue-500/40 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300 group">
                <ThemeToggler />
               
                {/* Enhanced background animation */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10" />
              </div>
            </div>
          </div>
         
          {/* Enhanced bottom accent line */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 animate-pulse" />
        </div>
      </header>

      {/* Tooltip Portal */}
      {showTooltip && articleTitle && (
        <div 
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="relative">
            {/* Tooltip arrow */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-100"></div>
            
            {/* Tooltip content */}
            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg shadow-2xl backdrop-blur-sm border border-gray-700 dark:border-gray-300 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg animate-in fade-in-0 zoom-in-95 duration-200">
              <p className="text-sm font-medium text-center leading-relaxed break-words">
                {articleTitle}
              </p>
            </div>
            
            {/* Tooltip glow effect */}
            <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-lg opacity-50 -z-10"></div>
          </div>
        </div>
      )}

      {/* Enhanced custom styles */}
      <style jsx>{`
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-in {
          animation: animate-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .fade-in-0 {
          animation-fill-mode: forwards;
        }
        
        .zoom-in-95 {
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </>
  );
};

export default ArticleHeader;
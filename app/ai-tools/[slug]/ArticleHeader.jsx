"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Avatar from '@mui/material/Avatar';
import ThemeToggler from "@/components/Header/ThemeToggler";

const ArticleHeader = ({ articleTitle, isSticky = false }) => {
  const [mounted, setMounted] = useState(false);
  const [showGlobalHeader, setShowGlobalHeader] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const titleRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 100;
      setShowGlobalHeader(currentScrollY <= scrollThreshold || !isSticky);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSticky]);

  const handleMouseEnter = useCallback((e) => {
    if (titleRef.current) {
      const rect = titleRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8
      });
      setShowTooltip(true);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  // Handle logo click with proper new tab support
  const handleLogoClick = useCallback((e) => {
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      // Ctrl+click or middle click - open in new tab
      window.open("/", "_blank");
      e.preventDefault();
    } else {
      // Normal click - navigate in same tab
      window.location.href = "/";
    }
  }, []);

  if (!mounted) {
    return (
      <header className="fixed left-0 top-0 z-50 h-16 w-full animate-pulse border-b border-gray-200/50 bg-white/95 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/95">
        <div className="container mx-auto flex h-full items-center justify-between px-4">
          <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-6 w-1/3 rounded-md bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed left-0 top-0 z-50 w-full border-b border-gray-200/50 bg-white/95 transition-all duration-300 ease-out backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/95 
        ${isSticky && !showGlobalHeader ? 'translate-y-0 opacity-100 shadow-lg shadow-blue-500/10 dark:shadow-indigo-900/30' : '-translate-y-full opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-blue-50/20 via-white/20 to-indigo-50/20 dark:from-gray-900/20 dark:via-gray-800/20 dark:to-gray-900/20" />

        <div className="container relative z-10 mx-auto">
          {/* Fixed height container for consistent navbar size */}
          <div className="flex h-16 items-center justify-between gap-2 px-2 sm:gap-3 sm:px-4">
            
            {/* Logo - single optimized image for both modes */}
            <div className="group flex-shrink-0">
              <div className="relative">
                <Avatar
                  onClick={handleLogoClick}
                  onMouseDown={(e) => e.button === 1 && handleLogoClick(e)}
                  sx={{
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                    background: "transparent",
                    cursor: "pointer",
                  }}
                  className="transition-transform duration-200 group-hover:scale-110"
                >
                  <Image
                    src="/logoForHeader.png"
                    alt="Logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                    priority
                  />
                </Avatar>
              </div>
            </div>

            {/* Article Title - Responsive with truncation for mobile */}
            <div className="flex flex-grow justify-center px-1 sm:px-2 min-w-0">
              <div className="group relative w-full max-w-full">
                <h2
                  ref={titleRef}
                  className="relative cursor-help text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-blue-900 to-gray-800 dark:from-white dark:via-blue-100 dark:to-white 
                  text-xs sm:text-sm md:text-base lg:text-lg 
                  px-2 py-2 leading-tight
                  truncate sm:line-clamp-2 sm:truncate-none
                  whitespace-nowrap sm:whitespace-normal"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  title={articleTitle}
                >
                  {articleTitle || "Article"}
                </h2>
                {/* REMOVED: The div that creates the underline */}
                {/* <div className="absolute bottom-1 left-1/2 h-0.5 w-8 sm:w-12 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-70" /> */}
              </div>
            </div>

            {/* ThemeToggler - Responsive sizing */}
            <div className="flex-shrink-0">
              <div className="group relative transition-all duration-200 scale-90 sm:scale-100">
                <ThemeToggler />
              </div>
            </div>
          </div>
          
          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-1/2 h-px w-16 sm:w-24 -translate-x-1/2 transform bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        </div>
      </header>

      {/* Enhanced tooltip with better responsive behavior */}
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
            <div className="absolute -top-2 left-1/2 h-0 w-0 -translate-x-1/2 transform border-b-4 border-l-4 border-r-4 border-b-gray-900 border-transparent dark:border-b-gray-100"></div>
            <div className="rounded-lg border border-gray-700 bg-gray-900 px-3 sm:px-4 py-2 text-white shadow-2xl backdrop-blur-sm animate-fade-in-up dark:border-gray-300 dark:bg-gray-100 dark:text-gray-900 max-w-[280px] sm:max-w-xs md:max-w-md lg:max-w-lg">
              <p className="break-words text-center text-xs sm:text-sm font-medium leading-relaxed">{articleTitle}</p>
            </div>
            <div className="absolute -z-10 inset-0 rounded-lg bg-blue-500/20 blur-lg opacity-50"></div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        html {
          scroll-behavior: smooth;
        }
        
        @media (max-width: 640px) {
          .truncate {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
        }
      `}</style>
    </>
  );
};

export default ArticleHeader;
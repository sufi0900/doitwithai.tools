// components/Common/ArticleHeader.jsx
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

  // Use a ref for the title element to get its position
  const titleRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 100;
      // Show global header only if scrolled up, or if sticky is not enabled
      setShowGlobalHeader(currentScrollY <= scrollThreshold || !isSticky);
    };

    // Ensure handleScroll is called once on mount for initial state
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSticky]); // Re-run effect if isSticky changes

  // Memoize tooltip position calculation for performance
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

  // Early exit if not mounted to prevent hydration mismatches,
  // but this "null" render will still block FCP if it's the *very* first thing.
  // We want to render the bare minimum first.
  // For FCP, ensure the server component renders a basic header,
  // and this client component then enhances it.
  // However, given it's marked "use client", the assumption is it runs on both.
  // If `mounted` is `false`, it's before hydration, so we render a skeleton.
  if (!mounted) {
    // Render a minimal, unstyled header for FCP if not mounted yet
    // This helps avoid a blank space or layout shift.
    return (
      <header className="fixed top-0 left-0 w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 h-16">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div> {/* Placeholder for logo */}
          <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div> {/* Placeholder for title */}
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div> {/* Placeholder for theme toggler */}
        </div>
      </header>
    );
  }

  // Once mounted, render the full interactive header
  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ease-out
        ${isSticky && !showGlobalHeader ? 'translate-y-0 opacity-100 shadow-lg shadow-blue-500/10 dark:shadow-indigo-900/30' : '-translate-y-full opacity-0 pointer-events-none'}`}
      >
        {/* Simplified gradient overlay for immediate rendering */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-white/20 to-indigo-50/20 dark:from-gray-900/20 dark:via-gray-800/20 dark:to-gray-900/20 pointer-events-none" />

        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Optimized Logo with essential styles for FCP */}
            <div className="flex-shrink-0 group">
              <div className="relative">
                <Avatar
                  onClick={() => { window.location.href = "/"; }}
                  sx={{
                    width: 48,
                    height: 48,
                    background: "transparent",
                    cursor: "pointer",
                    // Keep essential transition, but remove heavy initial hover effects
                  }}
                  className="group-hover:scale-110 transition-transform duration-200" // Reduced duration for faster visual feedback
                >
                  {/* Next/Image directly for optimization */}
                  <Image
                    src="/logoForHeader.png"
                    alt="Logo"
                    width={48}
                    height={48}
                    className="w-full dark:hidden"
                    priority // Critical for LCP/FCP
                  />
                  <Image
                    src="/logoForHeader.png"
                    alt="Logo"
                    width={48}
                    height={48}
                    className="hidden w-full dark:block"
                    priority // Critical for LCP/FCP
                  />
                </Avatar>
                {/* Remove complex glow effect for FCP; can be added post-hydration if necessary */}
              </div>
            </div>

            {/* Optimized Article Title for FCP */}
            <div className="flex-grow flex justify-center px-4">
              <div className="relative max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl group">
                {/* Simplified background decoration; remove animation for FCP */}
                <div className="absolute inset-0 bg-blue-50/20 dark:bg-gray-800/30 rounded-xl blur-sm" /> {/* Simpler static background */}

                {/* Main title container */}
                <div
                  ref={titleRef} // Attach ref here
                  className="relative bg-white/70 dark:bg-gray-800/70 rounded-xl px-4 py-3 border border-gray-200/40 dark:border-gray-600/40 backdrop-blur-sm transition-colors duration-200 cursor-help" // Simplified transitions
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <h2 className="text-center text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-gray-800 via-blue-900 to-gray-800 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent truncate leading-tight">
                    {articleTitle || "Article"}
                  </h2>
                  {/* Underline accent - simplified for FCP */}
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-70" />
                  {/* Remove hover indicator for FCP */}
                </div>

                {/* Side decorative elements - simplify or remove for FCP */}
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full opacity-30" />
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full opacity-30" />
              </div>
            </div>

            {/* Optimized ThemeToggle */}
            <div className="flex-shrink-0">
              <div className="relative rounded-xl bg-gray-100/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/40 dark:border-gray-600/40 transition-all duration-200 group">
                <ThemeToggler />
                {/* Remove background animation for FCP */}
              </div>
            </div>
          </div>
          {/* Bottom accent line - simplify for FCP */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        </div>
      </header>

      {/* TooltipPortal - Only rendered when showTooltip is true */}
      {showTooltip && articleTitle && (
        <div className="fixed z-[9999] pointer-events-none" style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px`, transform: 'translateX(-50%)' }}>
          <div className="relative">
            {/* Tooltip arrow */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-100"></div>
            {/* Tooltip content */}
            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg shadow-2xl backdrop-blur-sm border border-gray-700 dark:border-gray-300 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg animate-fade-in-up">
              <p className="text-sm font-medium text-center leading-relaxed break-words">{articleTitle}</p>
            </div>
            {/* Tooltip glow effect - simplified */}
            <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-lg opacity-50 -z-10"></div>
          </div>
        </div>
      )}

      {/* Simplified CSS for animations relevant to interaction, not initial render */}
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
        /* Smooth scroll behavior - global style, usually in your main CSS or layout */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </>
  );
};

export default ArticleHeader;
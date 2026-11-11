"use client";

import Image from "next/image";
import React from "react";

const TwitterBanner = () => {
  return (
    <div className="relative w-[1500px] h-[500px] overflow-hidden font-sans">
      {/* Dynamic gradient background - Deep, tech-blue base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0d16] via-[#101931] to-[#0a0d16]"></div>

      {/* Accent gradient overlay with brand blue */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#506ffc]/15 via-transparent to-[#3f57e6]/20"></div>
      
      {/* Additional depth layer (adjusted to new dark color) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#506ffc]/5 to-[#0a0d16]/80"></div>

      {/* Grid pattern for tech feel */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Left side - Dynamic accent shapes */}
      <div className="absolute left-0 top-0 w-[600px] h-full opacity-[0.08]">
        <svg viewBox="0 0 600 500" className="w-full h-full">
          <circle cx="120" cy="250" r="180" fill="none" stroke="#506ffc" strokeWidth="2" />
          <circle cx="120" cy="250" r="220" fill="none" stroke="#3f57e6" strokeWidth="1" opacity="0.6" />
          <rect x="320" y="150" width="120" height="120" fill="#506ffc" opacity="0.1" rx="16" transform="rotate(12 380 210)" />
          <rect x="280" y="300" width="90" height="90" fill="#3f57e6" opacity="0.15" rx="12" />
        </svg>
      </div>

      {/* Right side - Decorative elements */}
      <div className="absolute right-0 top-0 w-[500px] h-full opacity-[0.06]">
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <circle cx="380" cy="250" r="200" fill="none" stroke="#506ffc" strokeWidth="1" />
          <path d="M 300 100 L 450 100 L 375 200 Z" fill="#3f57e6" opacity="0.12" />
          <rect x="320" y="350" width="100" height="100" fill="#506ffc" opacity="0.1" rx="20" transform="rotate(-15 370 400)" />
        </svg>
      </div>

      {/* Main content - LEFT ALIGNED (profile pic consideration) */}
      <div className="relative z-20 h-full flex items-center px-16">
        <div className="w-full max-w-[1300px] ml-[300px]">
          
          {/* Personal header with name */}          <div className="flex items-center gap-6 mb-6">
            <h2 className="text-3xl font-bold text-white tracking-tight"
                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
              Sufian Mustafa
            </h2>
            <div className="h-6 w-[2px] bg-gradient-to-b from-[#1D9BF0] to-[#7856FF]"></div>
            <p className="text-lg text-gray-300 font-medium"
               style={{ textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
              Developer • SEO Writer • AI Enthusiast
            </p>
          </div>

          {/* Main value proposition - PERSONAL FIRST */}
          <div className="space-y-5 mb-7">
            <h1 className="text-7xl font-bold text-white leading-[1.05] tracking-tight max-w-[950px]"
                style={{ textShadow: '0 4px 24px rgba(0,0,0,0.8)' }}>
              Helping Creators Build<br />
              <span className="text-[#506ffc]">Smarter with AI</span>
            </h1>
            
            <p className="text-2xl text-gray-300 font-medium leading-relaxed max-w-[850px]"
               style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
              Sharing insights, tools & prompts for the AI-powered creator
            </p>
          </div>

          {/* Expertise tags - Twitter style */}
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="group flex items-center gap-2.5 bg-[#506ffc]/15 backdrop-blur-sm px-5 py-2.5 rounded-full border border-[#506ffc]/40 hover:bg-[#506ffc]/25 transition-all duration-300">
              <svg className="w-5 h-5 text-[#506ffc]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm font-bold text-white">Development</span>
            </div>

            <div className="group flex items-center gap-2.5 bg-[#3f57e6]/15 backdrop-blur-sm px-5 py-2.5 rounded-full border border-[#3f57e6]/40 hover:bg-[#3f57e6]/25 transition-all duration-300">
              <svg className="w-5 h-5 text-[#3f57e6]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm font-bold text-white">SEO Strategy</span>
            </div>

            <div className="group flex items-center gap-2.5 bg-[#506ffc]/15 backdrop-blur-sm px-5 py-2.5 rounded-full border border-[#506ffc]/40 hover:bg-[#506ffc]/25 transition-all duration-300">
              <svg className="w-5 h-5 text-[#506ffc]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
              </svg>
              <span className="text-sm font-bold text-white">AI Tools</span>
            </div>

            <div className="group flex items-center gap-2.5 bg-[#3f57e6]/15 backdrop-blur-sm px-5 py-2.5 rounded-full border border-[#3f57e6]/40 hover:bg-[#3f57e6]/25 transition-all duration-300">
              <svg className="w-5 h-5 text-[#3f57e6]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
              <span className="text-sm font-bold text-white">Prompt Engineering</span>
            </div>

            <div className="group flex items-center gap-2.5 bg-[#506ffc]/15 backdrop-blur-sm px-5 py-2.5 rounded-full border border-[#506ffc]/40 hover:bg-[#506ffc]/25 transition-all duration-300">
              <svg className="w-5 h-5 text-[#506ffc]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm font-bold text-white">Content Creation</span>
            </div>
          </div>

          {/* Strategic CTA with logo - BOTTOM PLACEMENT */}
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-[#1D9BF0]/20 to-[#7856FF]/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 shadow-2xl">
            {/* Logo - smaller, supporting role */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-[#1D9BF0]/30 rounded-xl blur-lg"></div>
              <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-white/40 shadow-xl bg-white">
                <Image 
                  src="/logoo.png" 
                  alt="DoItWithAI Tools"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* CTA Text */}
            <div className="flex flex-col">
              <p className="text-lg text-gray-300 font-medium leading-tight mb-1">
                All free resources, tools & tutorials at
              </p>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-[#7870e4]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
                </svg>
                <span className="text-2xl font-bold text-white tracking-tight">
                  doitwithai.tools
                </span>
              </div>
            </div>

            {/* Arrow indicator */}
            <div className="ml-2 flex items-center justify-center w-10 h-10 rounded-full bg-[#1D9BF0]/30 border border-[#1D9BF0]/50">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#1D9BF0] to-transparent"></div>
      
      {/* Corner glow effects */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#1D9BF0]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#7856FF]/10 rounded-full blur-3xl"></div>
    </div>
  );
};

export default TwitterBanner;
// AuthorBioCard.js - Create this as a new component
"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const AuthorBioCard = () => {
  return (
    <div className="my-12 w-full">
      {/* Author Bio Card */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-800 dark:via-gray-800/50 dark:to-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.3) 0%, transparent 50%),
                                 radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)`,
            }}
          ></div>
        </div>

        <div className="relative p-6 sm:p-8 md:p-10">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
            {/* Author Image */}
            <div className="flex-shrink-0">
              <Link 
                href="/author/sufian-mustafa"
                className="block group"
              >
                <div className="relative h-32 w-32 sm:h-40 sm:w-40 lg:h-36 lg:w-36 xl:h-40 xl:w-40 overflow-hidden rounded-2xl ring-4 ring-blue-500/30 dark:ring-blue-400/30 ring-offset-4 ring-offset-white dark:ring-offset-gray-800 transition-all duration-300 group-hover:ring-blue-500 group-hover:ring-offset-8 group-hover:scale-105">
                  <Image
                    src="/sufian-mustafa-founder-doitwithaitools.png"
                    alt="Sufian Mustafa - Founder & AI Tools Expert"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 160px"
                  />
                  {/* Online Status Badge */}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Author Info */}
            <div className="flex-1 text-center lg:text-left">
              {/* Name and Title */}
              <div className="mb-4">
                <Link 
                  href="/author/sufian-mustafa"
                  className="group inline-block"
                >
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    Sufian Mustafa
                  </h3>
                </Link>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                    Founder & CEO
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                    AI Tools Expert
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                    SEO Specialist
                  </span>
                </div>
              </div>

              {/* Bio Description */}
{/* Bio Description - Strategically Structured */}
<div className="mb-6 max-w-3xl space-y-4">
  {/* Introduction - Who */}
  <p className="text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
    <span className="font-semibold text-gray-900 dark:text-white">Sufian Mustafa</span> is an AI SEO Strategist, Developer, and the founder of{" "}
    <Link href="/" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline hover:no-underline transition-colors">
      Do It With AI Tools
    </Link>.
  </p>

  {/* Journey & Expertise - How */}
<div className="space-y-4 max-w-3xl">
  <p className="text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300 text-justify">
    Following an <span className="font-semibold text-gray-900 dark:text-white">18-month deep-dive</span> into AI-assisted development, Sufian built this platform from the ground up to serve as a hub for battle-tested workflows and practical AI resources.
  </p>

  <p className="text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300 text-justify border-l-2 border-[#5271ff] pl-4">
    By combining technical expertise with advanced prompt engineering, he builds high-performance content engines optimized for <span className="font-semibold text-[#5271ff]">modern AI search (GEO/AEO)</span> 
  </p>
</div>

  {/* Mission & Value - Why */}
  <p className="text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
    <span className="inline-flex items-center">
      <svg className="w-4 h-4 mr-1.5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
      <span className="font-semibold text-gray-900 dark:text-white">Mission:</span>
    </span>{" "}
    Help creators 10x their productivity using the same strategies he uses to maintain <span className="font-medium text-green-600 dark:text-green-400">99% technical SEO health</span> and top rankings.
  </p>
</div>         <div className="space-y-3">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                  Connect with Sufian
                </p>
               <div className="flex flex-wrap justify-center lg:justify-start gap-2">
  {[
    { 
      icon: "linkedin", 
      href: "https://www.linkedin.com/in/sufian-mustafa/", 
      label: "LinkedIn",
      svg: <path d="M15.2196 0H1.99991C1.37516 0 0.875366 0.497491 0.875366 1.11936V14.3029C0.875366 14.8999 1.37516 15.4222 1.99991 15.4222H15.1696C15.7943 15.4222 16.2941 14.9247 16.2941 14.3029V1.09448C16.3441 0.497491 15.8443 0 15.2196 0ZM5.44852 13.1089H3.17444V5.7709H5.44852V13.1089ZM4.29899 4.75104C3.54929 4.75104 2.97452 4.15405 2.97452 3.43269C2.97452 2.71133 3.57428 2.11434 4.29899 2.11434C5.02369 2.11434 5.62345 2.71133 5.62345 3.43269C5.62345 4.15405 5.07367 4.75104 4.29899 4.75104ZM14.07 13.1089H11.796V9.55183C11.796 8.7061 11.771 7.58674 10.5964 7.58674C9.39693 7.58674 9.222 8.53198 9.222 9.47721V13.1089H6.94792V5.7709H9.17202V6.79076H9.19701C9.52188 6.19377 10.2466 5.59678 11.3711 5.59678C13.6952 5.59678 14.12 7.08925 14.12 9.12897V13.1089H14.07Z" />
    },
    { 
      icon: "x", 
      href: "https://x.com/SufianWebDev", 
      label: "X (Twitter)",
      svg: <path d="M714.163 519.284L1160.89 0H1050.25L668.898 441.35L356.51 0H0L468.906 681.821L0 1226.55H110.636L512.154 762.19L843.49 1226.55H1200L714.163 519.284ZM562.82 699.363L518.069 636.986L150.797 79.4655H304.046L600.102 504.272L644.853 566.649L1026.71 1147.98H873.459L562.82 699.363Z"/>
    },
    { 
      icon: "github", 
      href: "https://github.com/sufi0900", 
      label: "GitHub",
      svg: <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    },
    { 
      icon: "devto", 
      href: "https://dev.to/sufian", 
      label: "Dev.to",
      svg: <path d="M19.236 3H4.764C3.791 3 3.002 3.787 3.002 4.76v14.48c0 .973.789 1.76 1.762 1.76h14.472c.973 0 1.762-.787 1.762-1.76V4.76C21 3.787 20.209 3 19.236 3zM9.195 13.414c0 .755-.466 1.901-1.942 1.898H5.389V8.665h1.903c1.424 0 1.902 1.144 1.903 1.899v2.85zm4.045-3.562H11.1v1.544h1.309v1.188H11.1v1.543h2.142v1.188h-2.498a.813.813 0 0 1-.833-.792V9.497a.813.813 0 0 1 .833-.792h2.496v1.147zm4.165 4.632c-.531 1.235-1.481.99-1.906 0l-1.548-5.818h1.309l1.193 4.569 1.188-4.569h1.31l-1.546 5.818z"/>
    },
    
{ 
  icon: "substack", 
  href: "https://substack.com/@sufianai", 
  label: "Substack",
  svg:
   <path d="M22.539 8.242H1.46V5.406h21.079v2.836zM1.46 10.812V24L12 18.11L22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.079V0z"/>
},
    { 
      icon: "medium", 
      href: "https://medium.com/@sufianmustafa0900", 
      label: "Medium",
      svg: <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
    },
   { 
  icon: "website", 
  href: "https://sufianmustafa.com/", 
  label: "Website",
  // Updated to a high-detail solid globe path
  svg: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
},
    { 
  icon: "email", 
  href: "mailto:sufianmustafa0900@gmail.com", 
  label: "Email",

  svg: <path d="M1.5 3.5c-.83 0-1.5.67-1.5 1.5v10c0 .83.67 1.5 1.5 1.5h21c.83 0 1.5-.67 1.5-1.5v-10c0-.83-.67-1.5-1.5-1.5h-21zm0 2h21v2l-10.5 6.5-10.5-6.5v-2zm0 3.5l10.5 6.5 10.5-6.5v7h-21v-7z"/>
},


  ].map((social) => (
    <Link
      key={social.icon}
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Connect with Sufian on ${social.label}`}
      className="flex items-center justify-center w-10 h-10 rounded-lg
                 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300
                 hover:bg-[#5271ff] hover:text-white dark:hover:bg-[#5271ff]
                 transform hover:scale-110 transition-all duration-300 group"
      title={social.label}
    >
      <svg 
        width={social.icon === "x" ? "16" : "18"} 
        height={social.icon === "x" ? "16" : "18"} 
        viewBox={social.icon === "x" ? "0 0 1200 1227" : social.icon === "website" || social.icon === "email" ? "0 0 24 24" : social.icon === "linkedin" ? "0 0 17 16" : "0 0 24 24"} 
        fill={social.icon === "website" || social.icon === "email" ? "none" : "currentColor"}
        stroke={social.icon === "website" || social.icon === "email" ? "currentColor" : "none"}
        className="fill-current"
      >
        {social.svg}
      </svg>
    </Link>
  ))}
</div>
              </div>

              {/* CTA Button */}
              <div className="mt-6">
                <Link
                  href="/author/sufian-mustafa"
                  className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-sm
                             bg-gradient-to-r from-blue-600 to-blue-800 text-white
                             hover:from-blue-700 hover:to-blue-800
                             dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-800
                             shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  View Full Profile
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Corner Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-400/10 to-transparent rounded-tr-full"></div>
      </div>
    </div>
  );
};

export default AuthorBioCard;
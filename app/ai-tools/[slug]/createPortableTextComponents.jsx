import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PortableText } from "@portabletext/react";
import { urlForImage } from "@/sanity/lib/image";
import OptimizedVideo from "@/app/ai-seo/[slug]/OptimizedVideo";
// import OptimizedGif from "@/app/ai-seo/[slug]/OptimizedGif";
import OptimizedImage from "@/app/ai-seo/[slug]/OptimizedImage";
import { Rocket } from 'lucide-react';
import { CopyBlock, dracula } from "react-code-blocks";
import { Clipboard, Check } from "lucide-react";
import { getFileUrl } from "./sanityFileUrl"; // path as you saved it
// import Image from 'next/image';

const PortableTextComponents = () => {
  // Add this before the PortableTextComponents function
  const CodeBlockComponent = ({ code, language }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(String(code));
        } else {
          const textarea = document.createElement("textarea");
          textarea.value = String(code);
          textarea.setAttribute("readonly", "");
          textarea.style.position = "absolute";
          textarea.style.left = "-9999px";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch (err) {
        console.error("Copy failed", err);
      }
    };

    return (
      <div className="sanity-code-input mx-2 sm:mx-0">
        <div className="my-4 sm:my-6 rounded-lg overflow-hidden shadow-sm relative">
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20">
            <button
              onClick={handleCopy}
              aria-label="Copy code"
              className="inline-flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2 py-1 bg-white/90 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm text-xs text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition"
            >
              {copied ? <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" /> : <Clipboard className="w-3 h-3 sm:w-4 sm:h-4" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <div className="overflow-x-auto px-1 sm:px-2 py-2 bg-transparent">
            <div className="min-w-0">
              <CopyBlock
                text={String(code)}
                language={language}
                showLineNumbers={true}
                startingLineNumber={1}
                theme={dracula}
                wrapLines={false}
                codeBlock
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const imgdesc = {
    block: {
      normal: ({ children }) => (
        <p
          className="hover:text-gray-950 customanchor dark:hover:text-gray-50 mb-2 sm:mb-4 mt-1 text-xs sm:text-sm md:text-base font-medium leading-relaxed text-gray-800 dark:text-gray-300 transition-all duration-300 ease-in-out">
          {children}
        </p>
      ),
      a: ({ children }) => (
        <a className="dark-bg-green-50 rounded-bl-xl rounded-br-xl text-center text-xs sm:text-sm md:text-base text-blue-500 underline hover:text-blue-600 dark:text-gray-400 hover:underline">
          {children}
        </a>
      )
    },
  }

  // Enhanced VideoComponent in portableTextComponents
  const VideoComponent = ({ value }) => {
    const [fileUrl, setFileUrl] = useState(null);
    const [isUrlLoading, setIsUrlLoading] = useState(true);

    useEffect(() => {
      let mounted = true;
      const load = async () => {
        try {
          const url = getFileUrl(value) || (value?.asset?.url ?? null);
          if (mounted) {
            setFileUrl(url);
            setIsUrlLoading(false);
          }
        } catch (err) {
          console.error("Video load error:", err);
          if (mounted) {
            setIsUrlLoading(false);
          }
        }
      };
      load();
      return () => (mounted = false);
    }, [value]);

    // Show loading state while URL is being fetched
    if (isUrlLoading) {
      return (
        <div className="relative w-full my-8 sm:my-10 md:my-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="group relative transform transition-all duration-500">
              {/* Loading skeleton while URL loads */}
              <div className="relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                <div className="aspect-video w-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px] xl:min-h-[400px] flex items-center justify-center animate-pulse">
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Preparing video...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Show error state if no URL could be loaded
    if (!fileUrl) {
      return (
        <div className="relative w-full my-8 sm:my-10 md:my-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="group relative transform transition-all duration-500">
              <div className="relative overflow-hidden rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="aspect-video w-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px] xl:min-h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4 p-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-4 h-4 sm:w-6 sm:h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-medium text-red-600 dark:text-red-400">
                        Video not available
                      </p>
                      <p className="text-xs sm:text-sm text-red-500 dark:text-red-500 mt-1">
                        Unable to load video content
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full my-8 sm:my-10 md:my-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="group relative transform transition-all duration-500 ">

            {/* Enhanced gradient border - responsive */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 blur-sm"></div>

            {/* Main container with responsive padding */}
            <div className="relative bg-white dark:bg-gray-900 p-2 sm:p-3 md:p-4 rounded-lg shadow-xl group-hover:shadow-2xl transition-shadow duration-500">

              <div className="relative overflow-hidden rounded-lg">


                {/* Video container with OptimizedVideo component */}
                <div className="relative">
                  <OptimizedVideo
                    src={fileUrl}
                    alt={value.alt}
                    caption={value.caption}
                    className="rounded-lg shadow-lg"
                  />

                  {/* Enhanced caption with proper mobile sizing */}
                  {value.caption && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-2 sm:gap-3">
                    
                    {/* Caption icon - no vertical alignment class needed here */}
                    <div className="flex-shrink-0">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>

                        {/* Caption text - properly sized for mobile */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                            {value.caption}
                          </p>
                        </div>

                      </div>
                    </div>
                  )}


                </div>

              </div>

              {/* Background glow effect - reduced on mobile */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            </div>
          </div>
        </div>
      </div>
    );
  };

  const portableTextComponents = {
    types: {

      code: ({ value }) => {
        const code = value?.code || value?.codeString || value?.source || "";
        const language = (value?.language || value?.lang || "text").toLowerCase();

        return <CodeBlockComponent code={code} language={language} />;
      },

      video: VideoComponent,

image: ({ value, index }) => {
  const imageUrl = value?.asset ? urlForImage(value.asset).url() : "/fallback-image-url.png";
  const isPriority = index < 3;
  const blurDataURL = value?.asset ? urlForImage(value.asset).width(20).height(20).blur(10).url() : undefined;

  return (
    <div className="relative w-full my-8 sm:my-10 md:my-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="group relative transform transition-all duration-500">

          {/* Enhanced gradient border - responsive (same as video) */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 blur-sm"></div>

          {/* Main container with responsive padding (same as video) */}
          <div className="relative bg-white dark:bg-gray-900 p-2 sm:p-3 md:p-4 rounded-lg shadow-xl group-hover:shadow-2xl transition-shadow duration-500">

            <div className="relative overflow-hidden rounded-lg">
              <figure className="relative">

                {/* Image container */}
                <div className="relative overflow-hidden rounded-lg">
                  <OptimizedImage
                    src={imageUrl}
                    alt={value.alt || "Article image"}
                    className="w-full h-auto object-cover rounded-lg shadow-lg"
                    priority={isPriority}
                    blurDataURL={blurDataURL}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 70vw"
                    width={800}
                    height={600}
                    quality={85}
                    enableModal={true}
                  />
                  
                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" />
                </div>

                {/* Enhanced image description with proper mobile sizing (same as video caption) */}
                {value.imageDescription && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-2 sm:gap-3">
                    
                    {/* Caption icon - no vertical alignment class needed here */}
                    <div className="flex-shrink-0">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <svg
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Caption text container */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words -mt-1">
                        <PortableText value={value.imageDescription} components={imgdesc}/>
                      </p>
                    </div>
                    
                  </div>
                </div>
              )}

              </figure>
            </div>

            {/* Background glow effect - reduced on mobile (same as video) */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          </div>
        </div>
      </div>
    </div>
  );
},
      table: ({ value }) => (
        <div className="card2 mx-2 sm:mx-0 sm:m-2 mb-4 mt-4 rounded-xl shadow-md overflow-hidden">
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <tbody>
                {value.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`${rowIndex % 2 === 0
                      ? "bg-green-100 dark:bg-gray-800"
                      : "bg-white dark:bg-gray-900"
                      } ${rowIndex % 4 === 0 ? "bg-green-100 dark:bg-gray-800" : ""
                      } border-b hover:bg-gray-200 dark:hover:bg-gray-700`}
                  >
                    {row.cells.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base font-medium text-gray-900 dark:text-white break-words"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },

    block: {
      normal: ({ children }) => (
        <p className="hover:text-gray-950 dark:hover:text-gray-50 transition-all duration-300 ease-in-out mb-3 sm:mb-4 text-base sm:text-lg md:text-xl lg:text-lg xl:text-xl font-medium leading-relaxed text-gray-700 dark:text-gray-300 px-2 sm:px-0">
          {children}
        </p>
      ),

      h1: ({ children }) => (
        <h1 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight sm:leading-none tracking-tight text-gray-900 dark:text-white transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 sm:px-0">
          {children}
        </h1>
      ),

      // H2 - Primary section headings
      h2: ({ children }) => (
        <h2 className="mb-3 sm:mb-4 md:mb-5 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-gray-800 dark:text-white px-2 sm:px-0">
          {children}
        </h2>
      ),

      // H3 - Subsection headings
      h3: ({ children }) => (
        <h3 className="mb-3 sm:mb-4 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-2xl font-semibold text-gray-700 dark:text-gray-200 px-2 sm:px-0">
          {children}
        </h3>
      ),

      // H4 - Sub-subsection headings
      h4: ({ children }) => (
        <h4 className="hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-3 sm:mb-4 text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl font-bold leading-tight text-gray-700 dark:text-gray-300 px-2 sm:px-0">
          {children}
        </h4>
      ),

      // H5 - Minor headings
      h5: ({ children }) => (
        <h5 className="mb-3 sm:mb-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg font-semibold leading-tight text-gray-600 dark:text-gray-400 px-2 sm:px-0">
          {children}
        </h5>
      ),
          h6: ({ children }) => (
        <div className="relative z-10 mb-10 overflow-hidden rounded-md bg-primary bg-opacity-10 p-8 md:p-9 lg:p-8 xl:p-9">
          <h4 className="text-center  text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed  dark:text-gray-400 text-body-color">
          <span className="absolute left-0 top-0 z-[-1]">
                        <svg
                          width="132"
                          height="109"
                          viewBox="0 0 132 109"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            opacity="0.5"
                            d="M33.0354 90.11C19.9851 102.723 -3.75916 101.834 -14 99.8125V-15H132C131.456 -12.4396 127.759 -2.95278 117.318 14.5117C104.268 36.3422 78.7114 31.8952 63.2141 41.1934C47.7169 50.4916 49.3482 74.3435 33.0354 90.11Z"
                            fill="url(#paint0_linear_111:606)"
                          />
                          <path
                            opacity="0.5"
                            d="M33.3654 85.0768C24.1476 98.7862 1.19876 106.079 -9.12343 108.011L-38.876 22.9988L100.816 -25.8905C100.959 -23.8126 99.8798 -15.5499 94.4164 0.87754C87.5871 21.4119 61.9822 26.677 49.5641 38.7512C37.146 50.8253 44.8877 67.9401 33.3654 85.0768Z"
                            fill="url(#paint1_linear_111:606)"
                          />
                          <defs>
                            <linearGradient
                              id="paint0_linear_111:606"
                              x1="94.7523"
                              y1="82.0246"
                              x2="8.40951"
                              y2="52.0609"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="white" stopOpacity="0.06" />
                              <stop
                                offset="1"
                                stopColor="white"
                                stopOpacity="0"
                              />
                            </linearGradient>
                            <linearGradient
                              id="paint1_linear_111:606"
                              x1="90.3206"
                              y1="58.4236"
                              x2="1.16149"
                              y2="50.8365"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="white" stopOpacity="0.06" />
                              <stop
                                offset="1"
                                stopColor="white"
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>
                        </svg>
                      </span>
               
                    
            {children}
            <span className="absolute bottom-0 right-0 z-[-1]">
                
                <svg
                  width="53"
                  height="30"
                  viewBox="0 0 53 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    opacity="0.8"
                    cx="37.5"
                    cy="37.5"
                    r="37.5"
                    fill="#4A6CF7"
                  />
                  <mask
                    id="mask0_111:596"
                    style={{ maskType: "alpha" }}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="75"
                    height="75"
                  >
                    <circle
                      opacity="0.8"
                      cx="37.5"
                      cy="37.5"
                      r="37.5"
                      fill="#4A6CF7"
                    />
                  </mask>
                  <g mask="url(#mask0_111:596)">
                    <circle
                      opacity="0.8"
                      cx="37.5"
                      cy="37.5"
                      r="37.5"
                      fill="url(#paint0_radial_111:596)"
                    />
                    <g opacity="0.8" filter="url(#filter0_f_111:596)">
                      <circle
                        cx="40.8089"
                        cy="19.853"
                        r="15.4412"
                        fill="white"
                      />
                    </g>
                  </g>
                  <defs>
                    <filter
                      id="filter0_f_111:596"
                      x="4.36768"
                      y="-16.5881"
                      width="72.8823"
                      height="72.8823"
                      filterUnits="userSpaceOnUse"
                      colorInterpolationFilters="sRGB"
                    >
                      <feFlood
                        floodOpacity="0"
                        result="BackgroundImageFix"
                      />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                      />
                      <feGaussianBlur
                        stdDeviation="10.5"
                        result="effect1_foregroundBlur_111:596"
                      />
                    </filter>
                    <radialGradient
                      id="paint0_radial_111:596"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(37.5 37.5) rotate(90) scale(40.2574)"
                    >
                      <stop stopOpacity="0.47" />
                      <stop offset="1" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </span>
          </h4>
        </div>
      ),
    },

    list: {
      bullet: ({ children }) => (
        <ul className="
          mb-4 mx-2 sm:mx-0 sm:ml-4 sm:mr-4 rounded-lg
          bg-white p-3 sm:p-4 md:p-6 shadow-sm sm:shadow-lg
          dark:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200
          transition-all duration-300 ease-in-out list-inside custom-bullet-list
          [&_ul]:bg-transparent [&_ul]:p-0 [&_ul]:shadow-none [&_ul]:rounded-none [&_ul]:mx-0 [&_ul]:ml-2 sm:[&_ul]:ml-4
        ">
          {children}
        </ul>
      ),

      number: ({ children }) => (
        <ol className="
          mb-6 sm:mb-8 md:mb-10 mx-2 sm:mx-0 sm:ml-6 list-decimal custom-number-list
          bg-white p-3 sm:p-4 md:p-6 shadow-sm sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl
          dark:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200
          transition-all duration-300 ease-in-out rounded-lg
          [&_ol]:bg-transparent [&_ol]:p-0 [&_ol]:shadow-none [&_ol]:rounded-none [&_ol]:mx-0 [&_ol]:ml-2 sm:[&_ol]:ml-6
          [&_ul]:bg-transparent [&_ul]:p-0 [&_ul]:shadow-none [&_ul]:rounded-none [&_ul]:mx-0 [&_ul]:ml-2 sm:[&_ul]:ml-6
        ">
          {children}
        </ol>
      ),
    },

    listItem: {
      bullet: ({ children }) => (
        <li className="hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-2 sm:mb-3 md:mb-4 text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl font-medium leading-relaxed text-gray-700 dark:text-gray-300">
          {children}
        </li>
      ),

      number: ({ children }) => (
        <li className="hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-2 sm:mb-3 md:mb-4 text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl font-medium leading-relaxed text-gray-700 dark:text-gray-300">
          {children}
        </li>
      ),
    },

    marks: {
      code: ({ children }) => (
        <code className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-mono text-xs sm:text-sm rounded px-1 py-0.5 break-words">
          {children}
        </code>
      ),

    // new strong renderer — inherits color from parent (link or paragraph)
strong: ({ children }) => (
  <strong className="font-bold text-current">
    {children}
  </strong>
),

      em: ({ children }) => <em>{children}</em>,

    link: ({ children, value }) => {
  return (
    <a
      href={value.href}
      target="_blank"
      rel="noreferrer noopener" // ✅ Apply this to all links with target="_blank"
      className="text-blue-600 dark:text-blue-400 font-medium transition-all duration-300 ease-in-out hover:text-blue-700 dark:hover:text-blue-300 bg-gradient-to-r from-current to-current bg-[length:100%_1.5px] bg-no-repeat bg-[position:0_100%] hover:bg-[length:0_1.5px] break-words"
    >
      {children}
    </a>
  );
},
    },

    button: ({ value }) => {
      const { text, link } = value;

      return (
        <div className="flex justify-center mb-4 sm:mb-6 mt-4 sm:mt-6 px-2 sm:px-0">
          <a
            href={link}
            className="press-button w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg md:text-xl font-semibold tracking-wide rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.02] no-shift"
            aria-label={text}
            itemProp="url"
          >
            <span className="truncate">{text}</span>
            <Rocket className="ml-2 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
          </a>
        </div>
      );
    },
  };

  return portableTextComponents;
};

export default PortableTextComponents;
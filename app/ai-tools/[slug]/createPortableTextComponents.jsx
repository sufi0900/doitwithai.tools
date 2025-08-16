import React, { useState, useEffect, useRef } from 'react';
import { PortableText } from "@portabletext/react";
import { urlForImage } from "@/sanity/lib/image";
import OptimizedVideo from "@/app/ai-seo/[slug]/OptimizedVideo";
import OptimizedGif from "@/app/ai-seo/[slug]/OptimizedGif";
import OptimizedImage from "@/app/ai-seo/[slug]/OptimizedImage";
import { Rocket } from 'lucide-react';
import { CopyBlock, dracula } from "react-code-blocks";
import { Clipboard, Check } from "lucide-react";

const PortableTextComponents = () => {

  const GifComponent = ({ value }) => {
    const [fileUrl, setFileUrl] = useState(null);
    
    const extractTextFromChildren = (children) => {
      return React.Children.toArray(children)
        .map(child => {
          if (typeof child === 'string') {
            return child;
          }
          if (React.isValidElement(child) && child.props.children) {
            return extractTextFromChildren(child.props.children);
          }
          return '';
        })
        .join('');
    };
    
    const createIdFromText = (text) => {
      if (!text) return '';
      
      if (Array.isArray(text)) {
        return React.Children.toArray(text)
          .map(child => {
            if (typeof child === 'string') {
              return child;
            }
            if (React.isValidElement(child) && child.props.children) {
              return createIdFromText(child.props.children);
            }
            return '';
          })
          .join('')
          .replace(/\s+/g, '-')
          .toLowerCase();
      }
      
      if (typeof text === 'string') {
        return text.replace(/\s+/g, '-').toLowerCase();
      }
      
      return '';
    };

    useEffect(() => {
      let isMounted = true;
      
      const loadFileUrl = async () => {
        try {
          const url = await setFileUrl(value);
          if (isMounted) {
            setFileUrl(url);
          }
        } catch (error) {
          console.error("Error loading file URL:", error);
        }
      };
      
      loadFileUrl();
      
      return () => {
        isMounted = false;
      };
    }, [value]);

    if (!fileUrl) return (
      <div className="w-full overflow-hidden rounded px-2 sm:px-0 sm:lg:-mx-2">
        <div className="sm:lg:m-4">
          <div className="card3 rounded-xl animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 h-48 sm:h-64 rounded-xl"></div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="w-full overflow-hidden rounded px-2 sm:px-0 sm:lg:-mx-2">
        <div className="sm:lg:m-4">
          <div className="card3 rounded-xl">
            <figure className="relative my-4 sm:my-8">
              <OptimizedGif
                src={fileUrl}
                alt={value.alt}
                caption={value.caption}
                className="customClassName h-full w-full object-cover"
              />
            </figure>
          </div>
        </div>
      </div>
    );
  };

  const VideoComponent = ({ value }) => {
    const [fileUrl, setFileUrl] = useState(null);

    useEffect(() => {
      let isMounted = true;
      
      const loadFileUrl = async () => {
        try {
          const url = await getFileUrl(value);
          if (isMounted) {
            setFileUrl(url);
          }
        } catch (error) {
          console.error("Error loading file URL:", error);
        }
      };
      
      loadFileUrl();
      
      return () => {
        isMounted = false;
      };
    }, [value]);

    if (!fileUrl) return (
      <div className="w-full overflow-hidden rounded px-2 sm:px-0 sm:lg:-mx-2">
        <div className="sm:lg:m-4">
          <div className="card3 rounded-xl animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 h-48 sm:h-64 rounded-xl"></div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="w-full overflow-hidden rounded px-2 sm:px-0 sm:lg:-mx-2">
        <div className="sm:lg:m-4">
          <div className="card3 rounded-xl">
            <figure className="relative my-4 sm:my-8">
              <OptimizedVideo
                src={fileUrl}
                alt={value.alt}
                className="h-full w-full object-cover"
              >
                <figcaption className="imgdesc py-2 rounded-bl-xl rounded-br-xl text-center text-sm sm:text-base text-gray-800 dark:text-gray-400">
                  {value.caption}
                </figcaption>
              </OptimizedVideo>
            </figure>
          </div>
        </div>
      </div>
    );
  };

  const imgdesc = {
    block: {
      normal: ({ children }) => (
        <p className="hover:text-gray-950 dark:hover:text-gray-50 mb-2 sm:mb-4 mt-1 text-xs sm:text-sm md:text-base font-medium leading-relaxed text-gray-800 dark:text-gray-300 transition-all duration-300 ease-in-out">
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

  const portableTextComponents = {
    types: {
      code: ({ value }) => {
        const code = value?.code || value?.codeString || value?.source || "";
        const language = (value?.language || value?.lang || "text").toLowerCase();
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
              {/* Copy button - responsive positioning */}
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

              {/* Code block wrapper - enhanced mobile scrolling */}
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
      },

      gif: GifComponent,
      video: VideoComponent,

      image: ({ value, index }) => {
        const imageUrl = value?.asset ? urlForImage(value.asset).url() : "/fallback-image-url.png";
        const isPriority = index < 3;
        const blurDataURL = value?.asset ? urlForImage(value.asset).width(20).height(20).blur(10).url() : undefined;

        return (
          <div className="w-full my-4 sm:my-6 lg:my-8 px-2 sm:px-0">
            <div className="relative group">
              <div className="relative overflow-hidden rounded-lg sm:rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 ease-out">
                
                {/* Enhanced gradient border - simplified on mobile */}
                <div className="absolute inset-0 rounded-lg sm:rounded-2xl bg-gradient-to-br from-blue-500/5 sm:from-blue-500/10 via-purple-500/5 to-pink-500/5 sm:to-pink-500/10 p-[1px]">
                  <div className="w-full h-full rounded-lg sm:rounded-2xl bg-white dark:bg-gray-900"/>
                </div>
                
                {/* Responsive padding */}
                <div className="relative p-1.5 sm:p-3 lg:p-4">
                  <figure className="relative">
                    
                    {/* Zoom indicator - hidden on mobile */}
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden sm:block">
                      <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                        </svg>
                        Click to zoom
                      </div>
                    </div>

                    {/* Image container */}
                    <div className="relative overflow-hidden rounded-md sm:rounded-xl">
                      <OptimizedImage
                        src={imageUrl}
                        alt={value.alt || "Article image"}
                        className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                        priority={isPriority}
                        blurDataURL={blurDataURL}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 70vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"/>
                    </div>

                    {/* Enhanced image description with proper mobile sizing */}
                    {value.imageDescription && (
                      <figcaption className="mt-2 sm:mt-3 md:mt-4 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-start gap-1.5 sm:gap-2 md:gap-3">
                          {/* Icon - smaller on mobile */}
                          <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                          {/* Caption text - properly sized for mobile */}
                          <div className="customanchor text-xs sm:text-sm md:text-base min-w-0 flex-1">
                            <PortableText value={value.imageDescription} components={imgdesc}/>
                          </div>
                        </div>
                      </figcaption>
                    )}
                  </figure>
                </div>
              </div>
              
              {/* Background glow effect - reduced on mobile */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/5 sm:from-blue-500/10 via-purple-500/5 sm:via-purple-500/10 to-pink-500/5 sm:to-pink-500/10 rounded-lg sm:rounded-2xl blur-lg sm:blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"/>
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
                    className={`${
                      rowIndex % 2 === 0
                        ? "bg-green-100 dark:bg-gray-800"
                        : "bg-white dark:bg-gray-900"
                    } ${
                      rowIndex % 4 === 0 ? "bg-green-100 dark:bg-gray-800" : ""
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
      
      strong: ({ children }) => (
        <strong className="text-black dark:text-white font-bold">
          {children}
        </strong>
      ),
      
      em: ({ children }) => <em>{children}</em>,
      
      link: ({ children, value }) => {
        const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
        return (
          <a
            href={value.href}
            rel={rel}
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
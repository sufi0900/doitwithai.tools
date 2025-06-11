/* eslint-disable @next/next/no-img-element */
"use client";
import RelatedPost from "@/components/Blog/RelatedPost";
import { useCallback } from 'react';
import { debounce } from 'lodash';
import SharePost from "@/components/Blog/SharePost";
import TagButton from "@/components/Blog/TagButton";
import NewsLatterBox from "@/components/Contact/NewsLatterBox";
import Image from "next/image";
import React, { useState, useEffect  } from "react";
import { ExpandMore, ExpandLess, AccessTime, CalendarMonthOutlined } from "@mui/icons-material";
import RecentPost from "@/components/RecentPost/page";
import Card from "@/components/Card/Page";
import BigSkeleton from "@/components/Blog/Skeleton/HomeBigCard"
import SkelCard from "@/components/Blog/Skeleton/Card"
import classNames from 'classnames';
import SlugSkeleton from "@/components/Blog/Skeleton/SlugSkeleton"
import { ArrowRight } from "lucide-react";
import RelatedResources from "@/app/free-ai-resources/RelatedResources";
import SidebarRelatedResources from "@/app/free-ai-resources/SidebarRelatedResources";
import { fetchRelatedResources } from "@/app/free-ai-resources/resourceHelpers";
import { client } from "@/sanity/lib/client";
import { PortableText } from "@portabletext/react";
import { urlForImage } from "@/sanity/lib/image";
import OptimizedVideo from "@/app/ai-seo/[slug]/OptimizedVideo";
import OptimizedGif from "@/app/ai-seo/[slug]/OptimizedGif";
import OptimizedImage from "@/app/ai-seo/[slug]/OptimizedImage";
import ReadingProgressCircle from "@/app/ai-seo/[slug]/ReadingProgressCircle";
import CongratsPopup from "./CongratsPopup"
import "@/styles/customanchor.css";
import Link from "next/link";
export const revalidate = false;
export const dynamic = "force-dynamic";

async function fetchAllBlogs(page = 1, limit = 5, categories = []) {
  const start = (page - 1) * limit;
  const query = `*[_type in $categories] | order(publishedAt desc) {formattedDate, readTime , _id, _type, title, slug, mainImage, overview, body, publishedAt }[${start}...${start + limit}]`;
  const result = await client.fetch(query, { categories });
  return result;
}

export default function BlogSidebarPage({ data, }) {
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
    

    // Utility function to create ID from text
    const createIdFromText = (text) => {
      if (!text) return '';
      
      // If text is an array of React elements, extract the text content
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
      
      // If text is a string, directly convert it
      if (typeof text === 'string') {
        return text.replace(/\s+/g, '-').toLowerCase();
      }
      
      return '';
    };
    // Add this useEffect in your page component (not in OptimizedImage)
useEffect(() => {
  // Preserve scroll position on reload
  const handleBeforeUnload = () => {
    sessionStorage.setItem('scrollPosition', window.scrollY.toString());
  };

  const restoreScrollPosition = () => {
    const savedPosition = sessionStorage.getItem('scrollPosition');
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition));
      sessionStorage.removeItem('scrollPosition');
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Restore position after content loads
  if (document.readyState === 'complete') {
    restoreScrollPosition();
  } else {
    window.addEventListener('load', restoreScrollPosition);
  }

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('load', restoreScrollPosition);
  };
}, []);
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
  <div className="w-full overflow-hidden rounded lg:-mx-2">
    <div className="lg:m-4">
      <div className="card3 rounded-xl animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-xl"></div>
      </div>
    </div>
  </div>
);  
    return (
      <div className="w-full overflow-hidden rounded lg:-mx-2">
        <div className="lg:m-4">
          <div className="card3 rounded-xl">
            <figure className="relative my-8">
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
  <div className="w-full overflow-hidden rounded lg:-mx-2">
    <div className="lg:m-4">
      <div className="card3 rounded-xl animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-xl"></div>
      </div>
    </div>
  </div>
);  
    return (
      <div className="w-full overflow-hidden rounded lg:-mx-2">
        <div className="lg:m-4">
          <div className="card3 rounded-xl">
            <figure className="relative my-8">
              <OptimizedVideo
                src={fileUrl}
                alt={value.alt}
                className="h-full w-full object-cover"
              >
                <figcaption className="imgdesc py-2 rounded-bl-xl rounded-br-xl text-center text-base text-gray-800 dark:text-gray-400">
                  {value.caption}
                </figcaption>
              </OptimizedVideo>
            </figure>
          </div>
        </div>
      </div>
    );
  };
  const imgdesc ={
    block: {  
      normal: ({ children }) => (
        <p className="hover:text-gray-950 dark:hover:text-gray-50 mb-4 mt-1 text-lg  font-medium leading-relaxed text-gray-800 dark:text-gray-300  transition-all duration-300 ease-in-out">
    {children}
  </p>
      ),
     
      a: ({ children }) => (
        <a  className="dark-bg-green-50 rounded-bl-xl rounded-br-xl text-center text-base text-blue-500 underline hover:text-blue-600 dark:text-gray-400 hover:underline">
          {children}
        </a>
      )
    },
   
  }
  
  const portableTextComponents = {
    types: {

      gif: GifComponent,
      video: VideoComponent,

image: ({ value }) => {
  const imageUrl = value?.asset ? urlForImage(value.asset).url() : "/fallback-image-url.png";
  return (
    <div className="w-full my-8 lg:my-12">
      {/* Container with subtle shadow and modern styling */}
      <div className="relative group">
        {/* Main image container */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300 ease-out">
          {/* Subtle border gradient */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 p-[1px]">
            <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-900" />
          </div>
          
          {/* Image content */}
          <div className="relative p-3 lg:p-4">
            <figure className="relative">
              {/* Zoom indicator - Added pointer-events-none */}
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  Click to zoom
                </div>
              </div>
              
              {/* Image with enhanced styling */}
              <div className="relative overflow-hidden rounded-xl">
                <OptimizedImage
                  src={imageUrl}
                  alt={value.alt}
                                    showStaticPlaceholder={true} // Enable static placeholder

                  className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                />
                
                {/* Subtle overlay gradient - Added pointer-events-none */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
              
              {/* Caption with enhanced styling */}
              {value.imageDescription && (
                <figcaption className="mt-4 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-start gap-3">
                    {/* Info icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    {/* Caption text */}
                    <div className="customanchor ">
                      <PortableText 
                        value={value.imageDescription} 
                        components={imgdesc} 
                      />
                    </div>
                  </div>
                </figcaption>
              )}
            </figure>
          </div>
        </div>
        
        {/* Subtle glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
      </div>
    </div>
  );
},
      table: ({ value }) => (
        <div className="card2 m-2 mb-4 mt-4 rounded-bl-xl rounded-br-xl rounded-tl-xl rounded-tr-xl shadow-md">
          <div className="relative overflow-x-auto rounded-xl">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
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
                    style={{ borderRadius: "0.5rem" }} // Adjust border radius here
                  >
                    {row.cells.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4  text-base font-medium text- dark:text-white"
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
        <p className="hover:text-gray-950 dark:hover:text-gray-50 transition-all duration-300 ease-in-out mb-4 text-lg font-medium leading-relaxed text-gray-700 dark:text-gray-300 sm:text-xl lg:text-lg xl:text-xl">
    {children}
  </p>
      ),
      h1: ({ children }) => (
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white  transition-colors duration-300 hover:text-blue-600   dark:hover:text-blue-400 ">
          {children}
        </h1>
      ),
  
 // Modified h2 component
 h2: ({ children }) => {
   // Convert children to an array of elements
   const childArray = React.Children.toArray(children);
   
   // Extract text from the first two children (words)
   const words = childArray.map(child => typeof child === 'string' ? child : child.props.children).join(' ').trim().split(' ');
   const firstTwoWords = words.slice(0, 2).join(' ');
   const remainingWords = words.slice(2).join(' ');
 
   return (
     <h2 className="relative pl-4 mb-6 text-4xl font-bold leading-tight text-gray-800 dark:text-white 
                   border-l-[4px] border-blue-500 dark:border-blue-400 
                   group hover:pl-6 transition-all duration-300 ease-out 
                   hover:text-blue-600 dark:hover:text-blue-500">
       <span className="relative inline-block">
         {/* Container for the border effect */}
         <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-blue-500 dark:bg-blue-400 transition-all duration-300 ease-out scale-x-0 group-hover:scale-x-100"></span>
         <span className="pb-1"> {/* This maintains space for text without overlap */}
           {firstTwoWords}
         </span>{' '}
         {/* Remaining words */}
         {remainingWords}
       </span>
       <span
         className="absolute left-0 top-0 h-full animate-pulse bg-gradient-to-b from-blue-500 to-blue-400
                   group-hover:from-blue-400 group-hover:to-blue-500 transition-all duration-300 ease-out"
         style={{
           width: '4px',
           boxShadow: '0 0 4px rgba(37, 99, 235, 0.5)', // Light blue glow
         }}
       ></span>
     </h2>
   );
 },
 
 // Modified h3 component
 h3: ({ children }) => {
   // Convert children to an array of elements
   const childArray = React.Children.toArray(children);
   
   // Extract text from the first two children (words)
   const words = childArray.map(child => typeof child === 'string' ? child : child.props.children).join(' ').trim().split(' ');
   const firstTwoWords = words.slice(0, 2).join(' ');
   const remainingWords = words.slice(2).join(' ');
 
   return (
     <h3 className="relative mb-6 text-2xl font-bold leading-snug text-gray-700 dark:text-gray-200 
                    group hover:text-blue-600 dark:hover:text-blue-400 
                    transition-all duration-300 ease-out">
       <span className="relative inline-block pl-4">
         {/* Container for the border effect */}
         <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-blue-500 dark:bg-blue-400 transition-all duration-300 ease-out scale-x-0 group-hover:scale-x-100"></span>
         <span className="pb-1"> {/* This maintains space for text without overlap */}
           {firstTwoWords}
         </span>{' '}
         {/* Remaining words */}
         {remainingWords}
       </span>
       <span
         className="absolute left-0 top-0 h-full animate-pulse bg-gradient-to-b from-blue-500 to-blue-400
                   group-hover:from-blue-400 group-hover:to-blue-500 transition-all duration-300 ease-out"
         style={{
           width: '4px',
           boxShadow: '0 0 4px rgba(37, 99, 235, 0.5)', // Light blue glow
         }}
       ></span>
     </h3>
       );
 },
      // Heading 4
      h4: ({ children }) => (
        <h4 className="hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-4 text-xl font-bold leading-tight text-gray-700 dark:text-gray-300 sm:text-2xl lg:text-xl xl:text-2xl">
          {children}
        </h4>
      ),
    
      // Heading 5
      h5: ({ children }) => (
        <h5 className="mb-4 text-lg font-semibold leading-tight text-gray-600 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl">
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
          <ul className="mb-4  ml-4 mr-4 transform space-y-4 rounded-lg bg-white p-6 shadow-lg hover:shadow-xl dark:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out list-inside custom-bullet-list">
          {children}
        
        </ul>
        ),
        number: ({ children }) => (
          <ol className="mb-10 list-decimal ml-6 custom-number-list bg-white p-6 shadow-lg hover:shadow-xl dark:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200">
          {children}
        </ol>
        ),
      },
      listItem: {
        bullet: ({ children }) => (
          <li
          className="hover:text-gray-800  dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-4 text-lg font-medium leading-relaxed  text-gray-700 dark:text-gray-300 sm:text-xl lg:text-lg xl:text-xl">
            {children}
          </li>
        ),
    
        number: ({ children }) => <li className="hover:text-gray-800  dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-4 text-lg font-medium leading-relaxed  text-gray-700 dark:text-gray-300  sm:text-xl lg:text-lg xl:text-xl">
          {children}</li>,
      },
    marks: {
      strong: ({ children }) => (
        <strong className=" text-black  dark:text-white">{children}</strong>
      ),
      em: ({ children }) => <em>{children}</em>,
    },
       button: ({ value }) => {
  const { text, link } = value;
  return (
    <div className="btn1 mb-6 mt-6 flex justify-center">
      <a
        href={link}
        className="relative inline-flex items-center gap-2 rounded-xl border-2 border-white bg-blue-700 px-6 py-3 text-xl font-semibold text-white shadow-lg transition-all duration-500 ease-in-out hover:scale-105 hover:bg-gradient-to-r hover:from-red-500 hover:via-purple-500 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-pink-300"
        style={{ color: '#ffffff' }} // <-- Force white text in both themes
      >
        {text}
        <span className="flex btn2 h-8 w-8 items-center justify-center rounded-full border border-white bg-white/20 p-2 shadow-md transition-all duration-300 hover:bg-white/30">
          <ArrowRight className="h-5 w-5 text-white" />
        </span>
      </a>

      {/* Animation Styling */}
      <style jsx>{`
        .btn1 a {
          animation: pulse 1s infinite alternate;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 10px rgba(255, 105, 180, 0.4);
          }
          100% {
            box-shadow: 0 0 20px rgba(255, 105, 180, 0.8);
          }
        }
      `}</style>
    </div>
  );
},

  };

  portableTextComponents.types.button = portableTextComponents.button;
  
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
const [loading, setLoading] = useState(!data); // Only show loading if no data initially  
  const [currentPage, setCurrentPage] = useState(1);
  const [allData, setAllData] = useState([]);
const [relatedResources, setRelatedResources] = useState([]);
const [resourcesLoading, setResourcesLoading] = useState(false); // Start with false


useEffect(() => {
  const fetchResources = async () => {
    if (data && data._id && relatedResources.length === 0) { // Only fetch if not already loaded
      setResourcesLoading(true);
      try {
        const resources = await fetchRelatedResources(data._id, data._type);
        setRelatedResources(resources);
      } catch (error) {
        console.error("Error fetching related resources:", error);
      } finally {
        setResourcesLoading(false);
      }
    }
  };
  
  fetchResources();
}, [data, relatedResources.length]);



useEffect(() => {
  const fetchData = async () => {
    // Only set loading if we don't have initial data
    if (!data) {
      setLoading(true);
    }
    
    try {
      const newData = await fetchAllBlogs(currentPage, 5, [
        "makemoney",
        "aitool", 
        "news",
        "coding",
        "freeairesources",
        "seo",
      ]);
      
      setAllData(newData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Only fetch if we don't have the data or if page changed
  if (currentPage > 1 || !data) {
    fetchData();
  }
}, [currentPage, data]);

const debouncedSearch = useCallback(
  debounce(async (searchQuery) => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    
    const query = `*[_type in ["makemoney", "aitool", "news", "coding", "freeairesources", "seo"] && (title match $searchText || overview match $searchText)] | order(publishedAt desc)[0...5] {
      _id, _type, title, slug, mainImage, publishedAt
    }`;
    
    try {
      const results = await client.fetch(query, {
        searchText: `*${searchQuery}*`,
      });
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
  }, 300),
  []
);

const handleSearchChange = (e) => {
  const value = e.target.value;
  setSearchText(value);
  debouncedSearch(value);
};
   
  const resetSearch = () => {
    setSearchText("");
    setSearchResults([]);
  };
  const renderSearchResults = () => {
    return searchResults.map((blog) =>
    <div key={blog._id} className="mb-10 rounded-sm bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
<h3 className="border-b border-black border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
                  Search Result
 </h3>
    <ul className="p-8">

      <li  className="mb-6 border-b border-black border-opacity-10 pb-6 dark:border-white dark:border-opacity-10">
   
     <RelatedPost key={blog._id} 
     title={blog.title}
    image={urlForImage(blog.mainImage).url()}
    slug={`/${schemaSlugMap[blog._type]}/${blog.slug.current}`}
    date={new Date(blog.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
/>
</li>
</ul>
</div>
);
  };
  const [recentData, setRecentData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const query = `*[_type in ["makemoney", "aitool", "news", "coding", "freeairesources", "seo"]]|order(publishedAt desc)[0...5]`;

      const recentData = await client.fetch(query);
      setRecentData(recentData);
    };

    fetchData();
  }, []);

  const [relatedPosts, setRelatedPosts] = useState([]);

  const schemaSlugMap = {
    makemoney: "ai-learn-earn",
        aitool: "ai-tools",
        news: "news",
        coding: "coding",
        freeairesources: "freeairesources",
        seo: "seo",
  };
  useEffect(() => {
    const fetchData = async () => {
      const query = `*[_type == "aitool"][0...3] | order(_createdAt desc)`;
      const relatedPostsData = await client.fetch(query);
        setRelatedPosts(relatedPostsData);
    };
      fetchData();

  }, []);

  const bgColors = [
    'bg-cyan-200',
    'bg-amber-200',
    'bg-green-200',
    'bg-red-200',
    'bg-indigo-200'
  ];
  
  const [isTableOfContentsOpen, setIsTableOfContentsOpen] = useState(true);

  // Function to toggle the state of the table of contents box
  const toggleTableOfContents = () => {
    setIsTableOfContentsOpen(!isTableOfContentsOpen);
  };
  
  // Function to render the table of contents
// Enhanced Table of Contents with professional styling
const renderTableOfContents = () => {
  if (!data.tableOfContents || data.tableOfContents.length === 0) {
    return null;
  }

  return (
    <div
      className={`transition-max-height mb-8 overflow-y-auto bs1 ${
        isTableOfContentsOpen ? "max-h-[800px]" : "max-h-0"
      }`}
    >
      <div className="rounded-lg border border-gray-300 shadow-md bg-white dark:bg-gray-800 transition-colors duration-300 overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">
            Table of Contents
          </h1>
        </div>
        
        {/* Table of contents list */}
        <div className="p-6">
          <ul className="space-y-4">
            {data.tableOfContents.map((item, index) => (
              <li key={index} className="relative">
                {/* Main heading with blue accent */}
                <div className="group">
                  <a
                    className="flex items-center gap-3 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium text-lg"
                    // href={`#${item.heading.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    {/* Animated blue indicator */}
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-500 dark:group-hover:bg-blue-400 transition-all duration-200">
                      <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 group-hover:bg-white transition-colors duration-200"></span>
                    </span>
                    <span className="border-b border-transparent group-hover:border-blue-300 dark:group-hover:border-blue-400 transition-all duration-200">
                      {item.heading}
                    </span>
                  </a>
                </div>
                
                {/* Subheadings with hierarchy indicators */}
                {item.subheadings && item.subheadings.length > 0 && (
                  <ul className="ml-9 mt-3 relative space-y-2">
                    {/* Vertical connection line */}
                    <div className="absolute left-[-15px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-200 to-transparent dark:from-blue-800 dark:to-transparent"></div>
                    
                    {item.subheadings.map((subheadingObj, subIndex) => (
                      <li key={subIndex} className="relative">
                        {/* Horizontal connection line */}
                        <div className="absolute left-[-15px] top-1/2 w-3 h-[2px] bg-blue-200 dark:bg-blue-800"></div>
                        <a
                          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group pl-2"
                          // href={`#${subheadingObj.subheading.replace(/\s+/g, '-').toLowerCase()}`}
                        >
                          {/* Small blue dot indicator */}
                          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-all duration-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 group-hover:bg-blue-500 dark:group-hover:bg-blue-400 transition-colors duration-200"></span>
                          </span>
                          <span className="border-b border-transparent group-hover:border-blue-300 dark:group-hover:border-blue-400 transition-all duration-200">
                            {subheadingObj.subheading}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
  return (
    <>  
    <section className="overflow-hidden pb-[120px] pt-[40px]">
      
        <div className="container">
          
  <nav aria-label="Breadcrumb" className="mb-8">
  <ol className="flex items-center space-x-2 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 px-4 py-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
    <li>
      <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
        </svg>
        Home
      </Link>
    </li>
    <li className="flex items-center">
      <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
      </svg>
      <Link 
        href={`/${schemaSlugMap[data._type] === 'ai-learn-earn' ? 'ai-learn-earn' : schemaSlugMap[data._type]}`}
        className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
      >
        {data._type === "aitool" ? "AI Tools" : 
         data._type === "makemoney" ? "AI Learn & Earn" :
         data._type === "coding" ? "AI Code" :
         data._type === "seo" ? "AI SEO" : 
         data._type === "freeairesources" ? "Free AI Resources" : "AI News"}
      </Link>
    </li>
    <li className="flex items-center">
      <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
      </svg>
      <span className="text-gray-900 dark:text-white font-medium bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-md text-xs" aria-current="page">
        {data.title.length > 50 ? `${data.title.substring(0, 50)}...` : data.title}
      </span>
    </li>
  </ol>
</nav>

{(loading && !data) ? (

         
<SlugSkeleton/>

          
        ) : (
          <article id="main-content" className="lg:m-4  flex flex-wrap">
        <div className=" lg:-mx-5 w-full overflow-hidden rounded">
          <div className="lg:m-4 ">
       <div className="mb-8 text-center lg:text-left">
  <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 md:text-5xl lg:text-6xl transition-all duration-300 hover:scale-[1.02] transform">
    {data.title}
  </h1>
  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto lg:mx-0 rounded-full"></div>
</div>
               
<ReadingProgressCircle/>
        
      <div className="card4 rounded-xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
  <figure className="relative overflow-hidden">
    <div className="overflow-hidden lg:aspect-[28/16] relative group">
          <a href={urlForImage(data.mainImage).url()} aria-label={`View full image: ${data.title}`}>

      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
        <Image
          className="h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-110 dark:brightness-90"
          src={urlForImage(data.mainImage).url()}
          alt={data.mainImage.alt || `${data.title}`}
          layout="responsive"
          width={500} 
          
          height={500}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          priority={true}
          loading="eager" // ADD this
  fetchPriority="high" // ADD this
        />
   
        </a>
    </div>
    <figcaption className="customanchor my-4 px-4 text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 py-3 rounded-b-xl">
      <PortableText value={data.mainImage.imageDescription} components={imgdesc} />
    </figcaption>
  </figure>
</div>
                    </div>
                            </div>


                            <div className="customanchor mb-4 mt-4     border-b-2 border-black border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
                     
                    </div>   
            <div className="w-full  lg:w-8/12 ">
                  <div className="mb-10 mt-4 w-full overflow-hidden rounded   article-content">
<div className="mb-10 flex flex-nowrap items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg shadow-sm overflow-x-auto space-x-6">
  {/* Author */}
  <div className="flex items-center shrink-0">
    <div className="relative mr-4 h-12 w-12 overflow-hidden rounded-full ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 transition-all duration-300 group-hover:ring-4">
      <Link href="/author/sufian-mustafa">
        <Image
          src="/sufi.png"
          alt="Sufian Mustafa - AI Tools Expert"
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </Link>
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
    </div>
    <div className="flex flex-col justify-center">
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
        By <Link href="/author/sufian-mustafa" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Sufian Mustafa</Link>
      </span>
      <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">AI Tools Expert & Founder</p>
    </div>
  </div>

  {/* Meta Info: Date, Time, Tag */}
  <div className="flex flex-nowrap items-center gap-4 shrink-0">
    <div className="flex items-center bg-white dark:bg-gray-700 px-3 py-2 rounded-lg shadow-sm whitespace-nowrap">
      <span className="mr-2 text-blue-500">
        <CalendarMonthOutlined className="w-4 h-4" />
      </span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {new Date(data.publishedAt).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </span>
    </div>

    <div className="flex items-center bg-white dark:bg-gray-700 px-3 py-2 rounded-lg shadow-sm whitespace-nowrap">
      <span className="mr-2 text-green-500">
        <AccessTime className="w-4 h-4" />
      </span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {data.readTime?.minutes} min read
      </span>
    </div>

    <div>
      <p className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white whitespace-nowrap">
        {data.tags &&
          data.tags.slice(0, 1).map((tag) => (
            <Link key={tag.name} href={tag.link} className="tag">
              {tag.name}
            </Link>
          ))}
      </p>
    </div>
  </div>
</div>

                  <button
                    className="relative mb-4  ml-4 inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    onClick={toggleTableOfContents}
                  >
                    {isTableOfContentsOpen ? (
                      <>
                        Hide Table of Contents <ExpandLess className="ml-2" />
                      </>
                    ) : (
                      <>
                        Show Table of Contents <ExpandMore className="ml-2" />
                      </>
                    )}
                  </button>
               

                  {renderTableOfContents()}
                 
                    <div className="customanchor mb-4 mt-4     border-b-2 border-black border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
                      <PortableText
                        value={data.content}
                        components={portableTextComponents}
                      />
                    </div>     
  

    {/* FAQ Section */}
    <div className="bs1 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6 mt-10">
      <h2 className="text-3xl font-bold text-black dark:text-white mb-6">
        Frequently Asked Questions
      </h2>
     
      {data.faqs && data.faqs.map((faq, index) => (
  <div key={faq.question} className="space-y-4">
    <details className="group" open>
      <summary
        className={classNames(
          'cursor-pointer text-lg font-medium text-black    p-4 mt-2 rounded-lg transition-all duration-300 hover:bg-gray-200 ',
          bgColors[index % bgColors.length] // Apply different background color
        )}
      >
        {faq.question}
      </summary>
      <div className="p-4 mt-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="mb-4 mt-1 text-lg  font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
          {faq.answer}
        </p>
      </div>
    </details>
  </div>
))}
    </div>
         <RelatedResources 
                    resources={relatedResources} 
                    isLoading={resourcesLoading} 
                      slidesToShow={2} // This will show 2 cards on large screens

                  />
                  </div>
                 
                  <div className="items-center justify-between sm:flex mb-4 mt-4     border-b-2 border-black border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
                    <div className="mb-5">
                      <h4 className="mb-3 text-sm font-medium text-body-color">
                        Related Tags :
                      </h4>
                      <div className="flex items-center ">
                      {data.tags && data.tags.slice(0, 3).map((tag) => (
    <TagButton key={tag.name} href={tag.link} text={tag.name} /> 
  ))}
                      </div>
                    </div>
                    <div className="mb-5">
                      <h5 className="mb-3 text-sm font-medium text-body-color sm:text-right">
                        Share this post :
                      </h5>
                      <div className="flex items-center sm:justify-end">
                        <SharePost />
                      </div>
                    </div>
                  </div>
                <div >
                
</div>

            </div>
         
            <div className="w-full px-4 mt-4 lg:w-4/12">
              <div className="mb-10 mt-12 rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark dark:shadow-none lg:mt-0">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="Search here..."
                    className="mr-4 w-full rounded-sm border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                    value={searchText}
onChange={handleSearchChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchText.trim() !== "") {
                        handleSearch();
                      }
                    }}
                  />
                  <button
                    aria-label="search button"
                    className="flex h-[50px] w-full max-w-[50px] items-center justify-center rounded-sm bg-primary text-white"
                    onClick={() => {
                      if (searchText.trim() !== "") {
                        handleSearch();
                      }
                    }}
                  >
                    <svg
                      width="20"
                      height="18"
                      viewBox="0 0 20 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.4062 16.8125L13.9375 12.375C14.9375 11.0625 15.5 9.46875 15.5 7.78125C15.5 5.75 14.7188 3.875 13.2812 2.4375C10.3438 -0.5 5.5625 -0.5 2.59375 2.4375C1.1875 3.84375 0.40625 5.75 0.40625 7.75C0.40625 9.78125 1.1875 11.6562 2.625 13.0937C4.09375 14.5625 6.03125 15.3125 7.96875 15.3125C9.875 15.3125 11.75 14.5938 13.2188 13.1875L18.75 17.6562C18.8438 17.75 18.9688 17.7812 19.0938 17.7812C19.25 17.7812 19.4062 17.7188 19.5312 17.5938C19.6875 17.3438 19.6562 17 19.4062 16.8125ZM3.375 12.3438C2.15625 11.125 1.5 9.5 1.5 7.75C1.5 6 2.15625 4.40625 3.40625 3.1875C4.65625 1.9375 6.3125 1.3125 7.96875 1.3125C9.625 1.3125 11.2812 1.9375 12.5312 3.1875C13.75 4.40625 14.4375 6.03125 14.4375 7.75C14.4375 9.46875 13.7188 11.125 12.5 12.3438C10 14.8438 5.90625 14.8438 3.375 12.3438Z"
                        fill="white"
                      />
                    </svg>
                  </button>
                  <button
                aria-label="reset button"
                className="ml-2 flex h-[50px] w-full max-w-[70px] items-center justify-center rounded-sm bg-gray-300   text-gray-700"
                onClick={resetSearch}
              >
                Reset
              </button>
                </div>
              </div>
              {searchResults.length > 0 && (
            <div className=" flex flex-wrap justify-center">
              {renderSearchResults()}
            </div>
          )}

<div className="space-y-8">
  {/* Related Posts Section */}
  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg hover:shadow-xl dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 dark:shadow-gray-900/20 transition-all duration-500">
    {/* Decorative gradient border */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div className="relative">
      <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-5 bg-gradient-to-r from-blue-50/50 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m0 0l4-4a4 4 0 105.656-5.656l-4 4m-4 4l4-4m0 0l-1.102 1.102" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">
          Related Posts
        </h3>
      </div>
      
      <ul className="p-6 space-y-4">
        {relatedPosts.map((post, index) => (
          <li key={post._id} className="group/item relative">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-600 scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300 origin-top rounded-full"></div>
            <div className="pl-4 group-hover/item:pl-6 transition-all duration-300">
              <RelatedPost
                title={post.title}
                image={urlForImage(post.mainImage).url()}
                slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
                date={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              />
            </div>
            {index < relatedPosts.length - 1 && (
              <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
            )}
          </li>
        ))}
      </ul>
    </div>
  </div>

  {/* Related Resources Section - NEW */}
  <SidebarRelatedResources 
    resources={relatedResources} 
    isLoading={resourcesLoading} 
    maxItems={3} 
  />

  {/* Recent Posts Section */}
  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg hover:shadow-xl dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 dark:shadow-gray-900/20 transition-all duration-500">
    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div className="relative">
      <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-5 bg-gradient-to-r from-green-50/50 to-emerald-50/30 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">
          Recent Posts
        </h3>
      </div>
      
      <ul className="p-6 space-y-4">
        {recentData.slice(0, 3).map((post, index) => (
          <li key={post._id} className="group/item relative">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-green-500 to-emerald-600 scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300 origin-top rounded-full"></div>
            <div className="pl-4 group-hover/item:pl-6 transition-all duration-300">
              <RelatedPost
                title={post.title}
                image={post.mainImage ? urlForImage(post.mainImage).url() : "/path-to-placeholder-image.jpg"}
                slug={`/${schemaSlugMap[post._type]}/${post.slug?.current || ""}`}
                date={post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : "Unknown Date"}
              />
            </div>
            {index < 2 && (
              <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
            )}
          </li>
        ))}
        
        {/* Explore All Posts Link */}
        <Link href="/blogs" className="block mt-6">
          <div className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-center transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center justify-center gap-2 text-lg font-semibold text-white">
              <span className="text-xl">🚀</span>
              Explore All Posts
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </span>
          </div>
        </Link>
      </ul>
    </div>
  </div>

  {/* Popular Categories Section */}
  <div className="group mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-gray-50/30 shadow-lg hover:shadow-xl dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 dark:shadow-gray-900/20 transition-all duration-500">
    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div className="relative">
      <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-5 bg-gradient-to-r from-purple-50/50 to-pink-50/30 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg">
          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">
          Popular Categories
        </h3>
      </div>

      <ul className="p-6 space-y-3">
        {[
          { href: "/ai-tools", icon: "⚙️", label: "AI Tools", gradient: "from-blue-500 to-cyan-500" },
          { href: "/ai-learn-earn", icon: "💸", label: "Learn & Earn With AI", gradient: "from-green-500 to-emerald-500" },
          { href: "/free-ai-resources", icon: "🎁", label: "Free AI Resources", gradient: "from-purple-500 to-violet-500" },
          { href: "/ai-seo", icon: "📈", label: "SEO With AI", gradient: "from-orange-500 to-red-500" },
          { href: "/ai-code", icon: "💻", label: "Code With AI", gradient: "from-indigo-500 to-purple-500" }
        ].map((category, index) => (
          <li key={category.href} className="group/cat">
            <Link
              href={category.href}
              className="flex items-center gap-4 rounded-xl p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 dark:hover:from-gray-700/50 dark:hover:to-gray-600/30 transition-all duration-300 group-hover/cat:scale-[1.02] group-hover/cat:shadow-md"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r ${category.gradient} shadow-lg text-white text-lg group-hover/cat:scale-110 transition-transform duration-300`}>
                {category.icon}
              </div>
              <div className="flex-1">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300 group-hover/cat:text-primary transition-colors duration-300">
                  {category.label}
                </span>
              </div>
              <svg className="h-5 w-5 text-gray-400 group-hover/cat:text-primary group-hover/cat:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </div>
</div>
     <br/>        
     <br/>        
              <NewsLatterBox />
            </div>
          </article>
          
                  )}
                 {loading ? (
  <div className="mb-10 rounded-sm bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
    <div className="animate-pulse p-8">
      <div className="h-4 bg-gray-200 rounded mb-4"></div>
      <div className="h-4 bg-gray-200 rounded mb-4"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
    </div>
  </div>
) : (
    <div className="container border-b-2 border-black border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
        <h2 className="mb-6 mt-6 text-3xl font-bold tracking-wide text-black dark:text-white sm:text-4xl">
          <span className="relative  mr-2 inline-block">
           Related
            <span className="absolute bottom-[-8px] left-0 h-1 w-full bg-blue-500"></span>
          </span>
          <span className="text-blue-500">Posts</span>
        </h2>
        <div className="flex flex-wrap justify-start">
        {loading ? (
          // Display Skeleton components while loading
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="mx-2 mb-4  flex  flex-wrap justify-start">
              
              <SkelCard />
            </div>
          ))
        ) : (
        relatedPosts.map((post) =>         
               <Card
                key={post._id}
                tags={post.tags} 
                ReadTime={post.readTime?.minutes} 
                overview={post.overview}
                title={post.title}
                mainImage={urlForImage(post.mainImage).url()}
                slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
                publishedAt= {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                
              />
))}
                    </div>
                    </div>
                    )}

       <div className="border-b-2 border-black border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
      
        <RecentPost  />
          

        </div>
        </div>    
      </section>
       <CongratsPopup 
      showAfter={19000} // 10 seconds for testing, change to 300000 for 5 minutes in production
      onClose={() => setShowCongratsPopup(false)}
    />
  </>
  );
}

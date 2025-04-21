/* eslint-disable @next/next/no-img-element */
"use client";

import RelatedPost from "@/components/Blog/RelatedPost";
import SharePost from "@/components/Blog/SharePost";
import TagButton from "@/components/Blog/TagButton";
import NewsLatterBox from "@/components/Contact/NewsLatterBox";
import Image from "next/image";
import React, { useState, useEffect  } from "react";
import { ExpandMore, ExpandLess, AccessTime, CalendarMonthOutlined } from "@mui/icons-material";
import RecentPost from "@/components/RecentPost/page";
import Card from "@/components/Card/Page";
import SkelCard from "@/components/Blog/Skeleton/Card"
import classNames from 'classnames';
import SlugSkeleton from "@/components/Blog/Skeleton/SlugSkeleton"
import OptimizedImage from "@/app/ai-seo/[slug]/OptimizedImage";
import ReadingProgressCircle from "@/app/ai-seo/[slug]/ReadingProgressCircle";
import { ArrowRight } from "lucide-react";

import { client } from "@/sanity/lib/client";
import { PortableText } from "@portabletext/react";
import { urlForImage } from "@/sanity/lib/image";

import "@/styles/customanchor.css";
import Link from "next/link";
export const revalidate = false;
export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 5;
const SEARCH_MIN_LENGTH = 4;
const CATEGORIES = ["makemoney", "aitool", "news", "coding", "freeairesources", "seo"];
const SCHEMA_SLUG_MAP = {
  makemoney: "ai-learn-earn",
  aitool: "ai-tools",
  news: "news",
  coding: "ai-code",
  freeairesources: "freeairesources",
  seo: "ai-seo",
};


async function fetchAllBlogs(page = 1, limit = 5, categories = [], retries = 2) {
  const start = (page - 1) * limit;
  const query = `*[_type in $categories] | order(publishedAt desc) {
    formattedDate, 
    readTime, 
    _id, 
    _type, 
    title, 
    slug, 
    mainImage, 
    overview, 
     content[] {
    ...,
    _type == "image" => {
      _type,
      asset->,
      alt,
      imageDescription
    },
    _type == "video" => {
      _type,
      asset->,
      alt,
      caption
    },
    _type == "gif" => {
      _type,
      asset->,
      alt,
      caption
    },
    publishedAt 
  }[${start}...${start + limit}]`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await client.fetch(query, { categories });
      return result;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed to fetch blogs:`, error);
      if (attempt === retries) return [];
    }
  }
}


export default function BlogSidebarPage({ data, }) {
    const GifComponent = ({ value }) => {
      const [fileUrl, setFileUrl] = useState(null);
    
      useEffect(() => {
        const loadFileUrl = async () => {
          const url = await getFileUrl(value);
          setFileUrl(url);
        };
        loadFileUrl();
      }, [value]);
    
      if (!fileUrl) return <div>Loading...</div>;
    
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
        const loadFileUrl = async () => {
          const url = await getFileUrl(value);
          setFileUrl(url);
        };
        loadFileUrl();
      }, [value]);
    
      if (!fileUrl) return <div>Loading...</div>;
    
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
        <p className="mb-4 mt-1 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out">
    {children}
  </p>
      ),
      link: ({ children }) => (
        <a  className="dark-bg-green-50 rounded-bl-xl rounded-br-xl text-center text-base text-blue-500 underline hover:text-blue-600 dark:text-gray-400 hover:underline">
          {children}
        </a>
      ),
      a: ({ children }) => (
        <a  className="dark-bg-green-50 rounded-bl-xl rounded-br-xl text-center text-base text-blue-500 underline hover:text-blue-600 dark:text-gray-400 hover:underline">
          {children}
        </a>
      )
    
    },
    link: ({ children }) => (
      <a  className="dark-bg-green-50 rounded-bl-xl rounded-br-xl text-center text-base text-blue-500 underline hover:text-blue-600 dark:text-gray-400 hover:underline">
        {children}
      </a>
    ),
  }
  
  const portableTextComponents = {
   
  
    gif: GifComponent,
    video: VideoComponent,
    types: {
      image: ({ value }) => {
        const imageUrl = value?.asset ? urlForImage(value.asset).url() : "/fallback-image-url.png";
        return (
          <div className="w-full overflow-hidden rounded lg:-mx-2">
            <div className="lg:m-4">
              <div className="card3 rounded-xl">
                <figure className="relative my-8">
                  <OptimizedImage
                    src={imageUrl}
                    alt={value.alt}
                    className="customClassName h-full w-full object-cover"
                  >
                    {value.imageDescription && (
                  <figcaption className="py-2 rounded-bl-xl rounded-br-xl text-center text-xs text-gray-800 dark:text-gray-400">
                    <PortableText 
                      value={value.imageDescription} 
                      components={imgdesc} 
                    />
                  </figcaption>
                )}
                  </OptimizedImage>
                </figure>
              </div>
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
        <p className="hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-4 text-lg font-medium leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl">
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
        <ul className="m-2 transform space-y-4 rounded-lg bg-white p-6 shadow-lg hover:shadow-xl dark:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-10 list-inside custom-bullet-list">
        {children}
      </ul>
      
      ),
  
    
      number: ({ children }) => (
        <ol className="mb-10 list-inside text-body-color custom-number-list">
        {children}
      </ol>
      ),
    },
    listItem: {
      bullet: ({ children }) => (
        <li
        className="hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-4 text-lg font-medium leading-relaxed  text-gray-600 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl">
          {children}
        </li>
      ),
  
      number: ({ children }) => <li className="...">{children}</li>,
    },
    marks: {
      strong: ({ children }) => (
        <strong className=" text-primary  dark:text-blue-400">{children}</strong>
      ),
      em: ({ children }) => <em>{children}</em>,
    },
    button: ({ value }) => {
      const { text, link } = value;
      return (
        <div className="btn1 mb-6 mt-6 flex justify-center">
        <a
          href={link}
          className="relative  inline-flex items-center gap-2 rounded-xl border-2 border-white bg-blue-700 px-6 py-3 text-xl font-semibold text-black shadow-lg transition-all duration-500 ease-in-out hover:scale-105 hover:bg-gradient-to-r hover:from-red-500 hover:via-purple-500 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-pink-300"
        >
          {text}
          <span className="flex btn2 h-8 w-8 items-center justify-center rounded-full border border-white bg-white/20 p-2 shadow-md transition-all duration-300 hover:bg-white/30">
            <ArrowRight className="h-5 w-5 text-white" />
          </span>
        </a>
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
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const newData = await fetchAllBlogs(currentPage, 5, [
        "makemoney",
        "aitool",
        "news",
        "coding",
        "freeairesources",
        "seo",
      ]);
      
      setAllData(newData);
      setLoading(false);
    };
    fetchData();
    
  }, [currentPage]);
  const handleSearch = async () => {
    if (searchText.trim().length < 4) {
      console.log("Please enter at least 4 characters for search.");
      return;
    }
    const query = `*[_type in ["makemoney", "aitool", "news", "coding", "freeairesources", "seo"] && (title match $searchText || content match $searchText)] | order(publishedAt desc)`;

    const searchResults = await client.fetch(query, {
      searchText: `*${searchText}*`,
    });
    setSearchResults(searchResults);
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
        aitool: "aitools",
        news: "news",
        coding: "coding",
        freeairesources: "freeairesources",
        seo: "seo",
  };
  useEffect(() => {
    const fetchData = async () => {
      const query = `*[_type == "makemoney"][0...3] | order(_createdAt desc)`;
      const relatedPostsData = await client.fetch(query);
        setRelatedPosts(relatedPostsData);
    };
      fetchData();

  }, []);

  const bgColors = [
    'bg-cyan-200',
    'bg-green-200',
    'bg-amber-200',
    
    'bg-red-200',
    'bg-indigo-200'

  ];
  

  const [isTableOfContentsOpen, setIsTableOfContentsOpen] = useState(true);

  // Function to toggle the state of the table of contents box
  const toggleTableOfContents = () => {
    setIsTableOfContentsOpen(!isTableOfContentsOpen);
  };
  
  // Function to render the table of contents
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
          
        {loading ? (
         
<SlugSkeleton/>

          
        ) : (
          <div className="lg:m-4  flex flex-wrap">
        <div className=" lg:-mx-5 w-full overflow-hidden rounded">
          <div className="lg:m-4 ">
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white  transition-colors duration-300 hover:text-blue-600   dark:hover:text-blue-400">
                {data.title}
                </h1>
               
<ReadingProgressCircle/>
        
        <div className="card4  rounded-xl">
        <figure className=" relative overflow-hidden rounded-lg">
                        <div className="overflow-hidden lg:aspect-[28/16]">
                          <a href={urlForImage(data.mainImage).url()}>
                            <Image
                              className="h-full w-full object-cover shadow-xl transition-transform duration-200 ease-in-out  hover:scale-[1.05] dark:shadow-gray-800"
                              src={urlForImage(data.mainImage).url()}
                              alt={data.mainImage.alt}
                              layout="responsive"
                              width={500} 
                              height={500}
                              placeholder="blur"
                              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                        

                            />
                          </a>

                        </div>
                        <figcaption className="imgdesc  my-2 text-center text-sm text-gray-500 dark:text-gray-400">
                          {/* Iteratively render descriptions and links from the imageDescription array */}
   
              <PortableText value={data.mainImage.imageDescription} components={imgdesc}  />


                        </figcaption>
                      </figure>

                      </div>
                    </div>
                            </div>
                            <div className="customanchor mb-4 mt-4     border-b-2 border-black border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
                     
                    </div>   
            <div className="w-full  lg:w-8/12 ">
                  <div className="mb-10 mt-4 w-full overflow-hidden rounded  article-content">
                  <div className="mb-10 flex flex-wrap items-center justify-between border-b border-black border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
                    <div className="flex flex-wrap items-center">
                      <div className="mb-5 mr-10 flex items-center">
                        <div className="mr-4">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full">
                          <Link href="/author/sufian-mustafa">
                            <Image
                              src="/sufi.png"
                              alt="author"
                              fill
                            />
                            </Link>
                          </div>
                        </div>
                        <div className="w-full">
                          <span className="mb-1 text-base font-medium text-body-color">
                            By <Link href="/author/sufian-mustafa">  Sufian Mustafa</Link>
                          </span>
                        </div>
                      </div>
                      <div className="mb-5 flex items-center">
                        <p className="mr-5 flex items-center text-base font-medium text-body-color">
                          <span className="mr-3">
                    
                            
                            
                            <CalendarMonthOutlined/>
                          </span>
                          {new Date(data.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="mr-5 flex items-center text-base font-medium text-body-color">
                          <span className="mr-3">
                          
                              <AccessTime />
                         
                          </span>
                          Read Time: {data.readTime?.minutes} min
                        
                       
                        </p>
                        <p className="flex items-center text-base font-medium text-body-color">
                          <span className="mr-3">
                            <svg
                              width="20"
                              height="12"
                              viewBox="0 0 20 12"
                              className="fill-current"
                            >
                              <path d="M10.2559 3.8125C9.03711 3.8125 8.06836 4.8125 8.06836 6C8.06836 7.1875 9.06836 8.1875 10.2559 8.1875C11.4434 8.1875 12.4434 7.1875 12.4434 6C12.4434 4.8125 11.4746 3.8125 10.2559 3.8125ZM10.2559 7.09375C9.66211 7.09375 9.16211 6.59375 9.16211 6C9.16211 5.40625 9.66211 4.90625 10.2559 4.90625C10.8496 4.90625 11.3496 5.40625 11.3496 6C11.3496 6.59375 10.8496 7.09375 10.2559 7.09375Z" />
                              <path d="M19.7559 5.625C17.6934 2.375 14.1309 0.4375 10.2559 0.4375C6.38086 0.4375 2.81836 2.375 0.755859 5.625C0.630859 5.84375 0.630859 6.125 0.755859 6.34375C2.81836 9.59375 6.38086 11.5312 10.2559 11.5312C14.1309 11.5312 17.6934 9.59375 19.7559 6.34375C19.9121 6.125 19.9121 5.84375 19.7559 5.625ZM10.2559 10.4375C6.84961 10.4375 3.69336 8.78125 1.81836 5.96875C3.69336 3.1875 6.84961 1.53125 10.2559 1.53125C13.6621 1.53125 16.8184 3.1875 18.6934 5.96875C16.8184 8.78125 13.6621 10.4375 10.2559 10.4375Z" />
                            </svg>
                          </span>
                          35
                        </p>
                      </div>
                    </div>
                    <div className="mb-5">
                      <p
                      
                        className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
                      >
                       {data.tags && data.tags.slice(0, 1).map((tag) => (
    <Link key={tag.name} href={tag.link} className="tag">{tag.name}</Link>
  ))}
                      </p>
                    </div>
                  </div>
                  <button
                    className="relative mb-4 inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
                    <div className="container   ">
    {/* Existing Content */}
    <div className="lg:m-4 flex flex-wrap">
      {/* Your existing content here */}
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
          'cursor-pointer text-lg font-medium text-black    p-4 rounded-lg transition-all duration-300 hover:bg-gray-200 ',
          bgColors[index % bgColors.length] // Apply different background color
        )}
      >
        {faq.question}
      </summary>
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-base text-gray-700 dark:text-gray-300">
          {faq.answer}
        </p>
      </div>
    </details>
  </div>
))}
    </div>
  </div>        
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
               
            </div>
            <div className="w-full px-4 lg:w-4/12">
              <div className="mb-10 mt-12 rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark dark:shadow-none lg:mt-0">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="Search here..."
                    className="mr-4 w-full rounded-sm border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
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
            <div className="-mx-4 flex flex-wrap justify-center">
              {renderSearchResults()}
            </div>
          )}
              <div className="mb-10  rounded-sm bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                <h3 className="border-b border-black border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
                  Related Posts
                </h3>
                <ul className="p-8">
                {relatedPosts.map((post) => (
                  <li key={post._id} className="mb-6 border-b border-black border-opacity-10 pb-6 dark:border-white dark:border-opacity-10">
               
               <RelatedPost
                
                title={post.title}
                image={urlForImage(post.mainImage).url()}
                slug={`/${schemaSlugMap[post._type]}/${post.slug.current}`}
                date={new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}

              />
          
                   
                  </li>
                    ))}
              <h3 className="border-b border-black border-opacity-10 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
                  Recent Posts
                </h3>
                    <br/>
                    <br/>
                          {recentData.slice(0, 3).map((post) => (
                <li key={post._id} className="mb-6 border-b border-black border-opacity-10 pb-6 dark:border-white dark:border-opacity-10">
                <RelatedPost
                  title={post.title}
                  image={post.mainImage ? urlForImage(post.mainImage).url() : "/path-to-placeholder-image.jpg"} // Add a fallback
                  slug={`/${schemaSlugMap[post._type]}/${post.slug?.current || ""}`} // Ensure slug is defined
                  date={post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : "Unknown Date"} // Fallback for date
                />
              </li>
              
                       ))}
                       <Link href="/blogs">
                      <h3 className=" cursor-pointer text-center border-b border-black border-opacity-10 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white dark:hover:text-primary hover:text-primary">
               Explore all Posts
                </h3>
                </Link>
                </ul>
              </div>
              <div className="mb-10 rounded-sm bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                <h3 className="border-b border-black border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
                  Popular Category
                </h3>
                <ul className="px-8 py-6">
                  <li>
                    <Link
                      href="/ai-tools"
                      className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                    >
                     AI Tools
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/ai-learn-earn"
                      className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                    >
                     Make Money With AI
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/free-resources"
                      className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                    >
                   Free AI Resources
                    </Link>
                  </li>
                  
                  <li>
                    <Link
                      href="/ai-seo"
                      className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                    >
                SEO With AI
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/ai-code"
                      className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                    >
                   Code With AI
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/news"
                      className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                    >
                 AI Trends & News
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mb-10 rounded-sm bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                <h3 className="border-b border-black border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
                  Popular Tags
                </h3>
                <div className="flex flex-wrap px-8 py-6">
                  
                <TagButton text="AI Tools" href="/ai-tools" /> 
                  <TagButton text="AI Image Generator" href="/ai-tools/ai-image-generator" />
                  <TagButton text="AI Video Generator"  href="/ai-tools/ai-video-generator" />
                  <TagButton text="AI Extension" href="/ai-tools/ai-extension" />
             
                  <TagButton text="AI Article Writer"  href="/ai-tools/ai-article-generator"/>
                </div>
              </div>

              <NewsLatterBox />
            </div>
          </div>
                  )}

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
       <div className="border-b-2 border-black border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
      
        <RecentPost  />
     
        </div>
        </div>    
      </section>
    </>
  );
}

import React, { useState, useEffect , useMemo  } from 'react';
import { PortableText } from "@portabletext/react";
import { urlForImage } from "@/sanity/lib/image";
import OptimizedVideo from "@/app/ai-seo/[slug]/OptimizedVideo";
import OptimizedGif from "@/app/ai-seo/[slug]/OptimizedGif";
import OptimizedImage from "@/app/ai-seo/[slug]/OptimizedImage";
// import SimplifiedOptimizedImage from "@/app/ai-seo/[slug]/SimplifiedOptimizedImage";
import { ArrowRight, Rocket } from 'lucide-react';

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
  
const imgdesc = {
  block: {
    normal: ({ children }) => (
      <p className="hover:text-gray-950 dark:hover:text-gray-50 mb-2 sm:mb-4 mt-1 text-sm sm:text-base font-medium leading-relaxed text-gray-800 dark:text-gray-300 transition-all duration-300 ease-in-out">
        {children}
      </p>
    ),
    a: ({ children }) => (
      <a className="dark-bg-green-50 rounded-bl-xl rounded-br-xl text-center text-sm sm:text-base text-blue-500 underline hover:text-blue-600 dark:text-gray-400 hover:underline">
        {children}
      </a>
    )
  },
}
   


 const portableTextComponents = {
    types: {

      gif: GifComponent,
      video: VideoComponent,

image: ({ value, index }) => {
  const imageUrl = value?.asset ? urlForImage(value.asset).url() : "/fallback-image-url.png";
  const isPriority = index < 3;
  const blurDataURL = value?.asset ? urlForImage(value.asset).width(20).height(20).blur(10).url() : undefined;

  return (
    <div className="w-full my-6 sm:my-8 lg:my-12">
      <div className="relative group">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300 ease-out">
          
          {/* Enhanced gradient border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 p-[1px]">
            <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-900"/>
          </div>
          
          {/* Responsive padding */}
          <div className="relative p-2 sm:p-3 lg:p-4">
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
              <div className="relative overflow-hidden rounded-xl">
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

              {/* FIXED: Enhanced image description with proper mobile sizing */}
              {value.imageDescription && (
                <figcaption className="mt-3 sm:mt-4 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-start gap-2 sm:gap-3">
                    {/* Icon - smaller on mobile */}
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    {/* Caption text - properly sized for mobile */}
                    <div className="customanchor text-sm sm:text-base">
                      <PortableText value={value.imageDescription} components={imgdesc}/>
                    </div>
                  </div>
                </figcaption>
              )}
            </figure>
          </div>
        </div>
        
        {/* Background glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"/>
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
  // H2 - Primary section headings
  h2: ({ children }) => (
    <h2 className="mb-5 text-xl font-bold text-gray-800 dark:text-white sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl">
      {children}
    </h2>
  ),

  // H3 - Subsection headings  
  h3: ({ children }) => (
    <h3 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200 sm:text-xl md:text-xl lg:text-2xl xl:text-2xl">
      {children}
    </h3>
  ),

  // H4 - Sub-subsection headings
  h4: ({ children }) => (
    <h4 className="hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out mb-4 text-base font-bold leading-tight text-gray-700 dark:text-gray-300 sm:text-lg md:text-lg lg:text-xl xl:text-xl">
      {children}
    </h4>
  ),

  // H5 - Minor headings
  h5: ({ children }) => (
    <h5 className="mb-4 text-sm font-semibold leading-tight text-gray-600 dark:text-gray-400 sm:text-base md:text-base lg:text-lg xl:text-lg">
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
       <ul className="mb-4 ml-4 mr-4 rounded-lg bg-white p-6 shadow-lg  dark:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 ease-in-out list-inside custom-bullet-list
  [&_ul]:bg-transparent [&_ul]:p-0 [&_ul]:shadow-none [&_ul]:rounded-none">
  {children}
</ul>

        ),
       number: ({ children }) => (
  <ol className="
    mb-10 ml-6 list-decimal custom-number-list 
    bg-white p-6 shadow-lg hover:shadow-xl 
    dark:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 
    transition-all duration-300 ease-in-out
    [&_ol]:bg-transparent [&_ol]:p-0 [&_ol]:shadow-none [&_ol]:rounded-none [&_ol]:ml-6
    [&_ul]:bg-transparent [&_ul]:p-0 [&_ul]:shadow-none [&_ul]:rounded-none [&_ul]:ml-6
  ">
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
        <strong
        
        className=" text-black  dark:text-white"
        >{children}</strong>
      ),
      em: ({ children }) => <em>{children}</em>,
    },

marks: {
  link: ({ children, value }) => {
    const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
    return (
      <a
        href={value.href}
        rel={rel}
        className="text-blue-600 dark:text-blue-400 font-medium transition-all duration-300 ease-in-out hover:text-blue-700 dark:hover:text-blue-300 bg-gradient-to-r from-current to-current bg-[length:100%_1.5px] bg-no-repeat bg-[position:0_100%] hover:bg-[length:0_1.5px]"
      >
        {children}
      </a>
    );
  },
},


button: ({ value }) => {
  const { text, link } = value;

  return (
    <div className="flex justify-center mb-6 mt-6">
  <a
    href={link}
    className="press-button w-full sm:w-auto inline-flex items-center justify-center min-h-[52px] px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg sm:text-xl font-semibold tracking-wide rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.02] no-shift"
    aria-label={text}
    itemProp="url"
  >
    {text}
    <Rocket className="ml-2 " />
  </a>
</div>

  );
},


  };


  return portableTextComponents;
};

export default PortableTextComponents;


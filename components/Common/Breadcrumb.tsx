import Link from "next/link";

const Breadcrumb = ({
  pageName,
  linktext,
  description,
  firstlink,
  firstlinktext,
  link,
  pageName2,
}: {
  pageName: string;
  pageName2: string;
  description: string;
  firstlink: string;
  firstlinktext: string;
  linktext: string;
  link: string;
}) => {
  return (
    <>
      <section className="relative z-10 overflow-hidden bg-gradient-to-br from-gray-50/50 to-blue-50/30 dark:from-gray-900/50 dark:to-gray-800/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-start lg:items-center py-8 sm:py-12 lg:py-16">
            {/* Main Content Section */}
            <div className="w-full lg:w-8/12 xl:w-7/12 mb-8 lg:mb-0">
              <div className="max-w-full lg:max-w-[650px] space-y-4 sm:space-y-6">
                {/* Enhanced Title */}
                <Link href={link} className="group inline-block">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-relaxed sm:leading-relaxed lg:leading-relaxed xl:leading-relaxed">
                    <span className="group/title inline-block cursor-pointer">
                      {/* First part with blue styling */}
                      <span className="relative text-blue-600 dark:text-blue-400 transition-colors duration-300 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                        {pageName}
                        <span className="absolute bottom-[-4px] sm:bottom-[-6px] left-0 h-0.5 sm:h-1 w-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transform origin-left transition-transform duration-300"></span>
                      </span>
                      
                      {/* Space and second part */}
                      <span className="mx-1.5 sm:mx-2"></span>
                      
                      <span className="relative text-gray-700 dark:text-gray-300 transition-all duration-300 group-hover:text-gray-900 dark:group-hover:text-white">
                        {pageName2}
                        <span className="absolute bottom-[-4px] sm:bottom-[-6px] left-0 h-0.5 sm:h-1 w-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 group/title-hover:w-full"></span>
                      </span>
                    </span>
                  </h2>
                </Link>

                {/* Enhanced Description */}
                <div className="relative">
                  <p className="text-sm sm:text-base lg:text-lg leading-relaxed sm:leading-relaxed lg:leading-relaxed text-gray-600 dark:text-gray-300 font-medium max-w-none ">
                    {description}
                  </p>
                  
                  {/* Subtle accent line */}
                  <div className="mt-4 sm:mt-6 w-16 sm:w-20 h-0.5 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Enhanced Breadcrumb Navigation */}
            <div className="w-full lg:w-4/12 xl:w-5/12">
              <div className="flex justify-start lg:justify-end">
                <nav className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-300">
                  <ol className="flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base">
                    {/* Home/First Link */}
                    <li className="flex items-center">
                      <Link
                        href={firstlink}
                        className="group flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                      >
                        <span className="truncate max-w-[80px] sm:max-w-none">{firstlinktext}</span>
                        <span className="ml-2 sm:ml-3 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </Link>
                    </li>

                    {/* Current Page */}
                    <li>
                      <Link
                        href={link}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 truncate max-w-[120px] sm:max-w-[200px] lg:max-w-none inline-block"
                        title={linktext} // Tooltip for truncated text
                      >
                        {linktext}
                      </Link>
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Background Decorations - Optimized for performance */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Left decoration - simplified */}
          <div className="absolute left-0 top-0 -z-10 w-48 sm:w-64 lg:w-80 h-48 sm:h-64 lg:h-80 opacity-[0.03] dark:opacity-[0.05]">
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          
          {/* Right decoration - simplified */}
          <div className="absolute right-0 top-0 -z-10 w-48 sm:w-64 lg:w-80 h-48 sm:h-64 lg:h-80 opacity-[0.03] dark:opacity-[0.05]">
            <div className="w-full h-full bg-gradient-to-bl from-purple-500 to-blue-500 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          </div>

          {/* Bottom accent - mobile-friendly */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 sm:w-48 lg:w-64 h-0.5 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        </div>

        {/* Original SVG backgrounds - kept but with better responsive behavior */}
        <div className="absolute inset-0 pointer-events-none -z-20 opacity-50 dark:opacity-30">
          <span className="absolute left-0 top-0 hidden sm:block">
            <svg
              className="w-48 sm:w-64 lg:w-72 h-auto"
              viewBox="0 0 287 254"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                opacity="0.1"
                d="M286.5 0.5L-14.5 254.5V69.5L286.5 0.5Z"
                fill="url(#paint0_linear_111:578)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_111:578"
                  x1="-40.5"
                  y1="117"
                  x2="301.926"
                  y2="-97.1485"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#4A6CF7" />
                  <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          
          <span className="absolute right-0 top-0 hidden md:block">
            <svg
              className="w-64 sm:w-80 lg:w-96 h-auto"
              viewBox="0 0 628 258"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                opacity="0.1"
                d="M669.125 257.002L345.875 31.9983L524.571 -15.8832L669.125 257.002Z"
                fill="url(#paint0_linear_0:1)"
              />
              <path
                opacity="0.1"
                d="M0.0716344 182.78L101.988 -15.0769L142.154 81.4093L0.0716344 182.78Z"
                fill="url(#paint1_linear_0:1)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_0:1"
                  x1="644"
                  y1="221"
                  x2="429.946"
                  y2="37.0429"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#4A6CF7" />
                  <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                  id="paint1_linear_0:1"
                  x1="18.3648"
                  y1="166.016"
                  x2="105.377"
                  y2="32.3398"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#4A6CF7" />
                  <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </div>
      </section>
    </>
  );
};

export default Breadcrumb;
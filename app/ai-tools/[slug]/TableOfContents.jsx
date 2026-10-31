import React, { useState } from 'react';
import { ExpandMore, ExpandLess } from "@mui/icons-material";

const TableOfContents = ({ tableOfContents }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleTableOfContents = () => {
    setIsOpen(!isOpen);
  };

  // Debug logging
  if (!tableOfContents || tableOfContents.length === 0) {
    console.warn('[TOC] No table of contents data provided:', tableOfContents);
    return null;
  }

  const generateAnchor = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  return (
    <>
      <button
        className="relative mb-4 mt-4 inline-flex items-center rounded-lg px-3 py-2 text-center text-sm font-medium transition-all duration-200 
        bg-transparent border border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400
        dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:border-blue-500
        focus:outline-none focus:ring-4 focus:ring-blue-300/20 dark:focus:ring-blue-800/20"
        onClick={toggleTableOfContents}
      >
        {isOpen ? (
          <>
            <span className="hidden sm:inline">Hide Table of Contents</span>
            <span className="sm:hidden">Hide TOC</span>
            <ExpandLess className="ml-2" />
          </>
        ) : (
          <>
            <span className="hidden sm:inline">Show Table of Contents</span>
            <span className="sm:hidden">Show TOC</span>
            <ExpandMore className="ml-2" />
          </>
        )}
      </button>

      <div
        className={`transition-max-height mb-8 overflow-y-auto ${
          isOpen ? "max-h-[800px]" : "max-h-0"
        }`}
      >
        <div className="rounded-lg border border-gray-300 shadow-md bg-white dark:bg-gray-800 transition-colors duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl sm:text-3xl font-semibold text-gray-800 dark:text-white">
              Table of Contents
            </h2>
          </div>
          
          <div className="p-4 sm:p-6">
            <ul className="space-y-3 sm:space-y-4">
              {tableOfContents.map((item, index) => (
                <li key={index} className="relative">
                  <div className="group">
                    <a
                      href={`#${generateAnchor(item.heading)}`}
                      className="flex items-center gap-2 sm:gap-3 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium text-base sm:text-lg"
                    >
                      <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-500 dark:group-hover:bg-blue-400 transition-all duration-200 flex-shrink-0">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 dark:bg-blue-400 group-hover:bg-white transition-colors duration-200"></span>
                      </span>
                      <span className="border-b border-transparent group-hover:border-blue-300 dark:group-hover:border-blue-400 transition-all duration-200 leading-tight">
                        {item.heading}
                      </span>
                    </a>
                  </div>
                  
                  {item.subheadings && item.subheadings.length > 0 && (
                    <ul className="ml-7 sm:ml-9 mt-2 sm:mt-3 relative space-y-1.5 sm:space-y-2">
                      <div className="absolute left-[-13px] sm:left-[-15px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-200 to-transparent dark:from-blue-800 dark:to-transparent"></div>
                      
                      {item.subheadings.map((subheadingObj, subIndex) => (
                        <li key={subIndex} className="relative">
                          <div className="absolute left-[-13px] sm:left-[-15px] top-1/2 w-2.5 sm:w-3 h-[2px] bg-blue-200 dark:bg-blue-800"></div>
                          
                          <a
                            href={`#${generateAnchor(subheadingObj.subheading)}`}
                            className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group pl-1.5 sm:pl-2 text-sm sm:text-base"
                          >
                            <span className="flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-all duration-200 flex-shrink-0">
                              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 group-hover:bg-blue-500 dark:group-hover:bg-blue-400 transition-colors duration-200"></span>
                            </span>
                            <span className="border-b border-transparent group-hover:border-blue-300 dark:group-hover:border-blue-400 transition-all duration-200 leading-tight">
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
    </>
  );
};

export default TableOfContents;
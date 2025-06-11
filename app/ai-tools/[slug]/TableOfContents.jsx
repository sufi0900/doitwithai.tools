import React, { useState } from 'react';
import { ExpandMore, ExpandLess } from "@mui/icons-material";

const TableOfContents = ({ tableOfContents }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleTableOfContents = () => {
    setIsOpen(!isOpen);
  };

  if (!tableOfContents || tableOfContents.length === 0) {
    return null;
  }

  return (
    <>
      <button
        className="relative mb-4 ml-4 inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        onClick={toggleTableOfContents}
      >
        {isOpen ? (
          <>
            Hide Table of Contents <ExpandLess className="ml-2" />
          </>
        ) : (
          <>
            Show Table of Contents <ExpandMore className="ml-2" />
          </>
        )}
      </button>

      <div
      className={`transition-max-height mb-8 overflow-y-auto bs1 ${
        isOpen ? "max-h-[800px]" : "max-h-0"
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
            {tableOfContents.map((item, index) => (
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
    </>
  );
};

export default TableOfContents;

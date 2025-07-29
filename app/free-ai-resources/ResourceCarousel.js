// components/ResourceCarousel.js
import React, { useRef, useEffect } from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ResourceCarousel = ({
  children,
  className = "",
  autoplay = true,
  autoplaySpeed = 2000,
  slidesToShow = 3 // Add this prop with default value
}) => {
  const sliderRef = useRef(null);

  // Determine the number of actual children being passed
  const numChildren = React.Children.count(children);

  // Settings for the slider - use the slidesToShow prop
 const settings = {
  dots: true,
  infinite: numChildren > slidesToShow,
  speed: 500,
  slidesToShow: slidesToShow,
  slidesToScroll: slidesToShow, // KEY FIX — scroll and dot count matches slidesToShow
  autoplay: autoplay && numChildren > 1,
  autoplaySpeed: autoplaySpeed,
  pauseOnHover: true,
  arrows: false,
  dotsClass: "slick-dots custom-dots",
  customPaging: function (i) {
    return (
      <div className="w-3 h-3 mx-1 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-primary dark:hover:bg-primary transition-colors"></div>
    );
  },
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: Math.min(slidesToShow, 2),
        slidesToScroll: Math.min(slidesToShow, 2), // keep scroll match
        infinite: numChildren > 2,
        autoplay: autoplay && numChildren > 2,
      },
    },
    {
      breakpoint: 640,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode: true,
        centerPadding: "0",
        infinite: numChildren > 1,
        autoplay: autoplay && numChildren > 1,
      },
    },
  ],
};

// Key changes for ResourceCarousel.js

// 1. Update the useEffect CSS styles
useEffect(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    .custom-dots {
      position: absolute;
      bottom: 0px;
      display: flex !important;
      justify-content: center;
      width: 100%;
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .custom-dots li {
      margin: 0 4px;
      display: inline-block;
    }
    .custom-dots li button {
      opacity: 0;
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
      cursor: pointer;
    }
    .custom-dots .slick-active div {
      background-color: #5271FF !important;
      transform: scale(1.2);
    }
    
    /* FIX: Ensure carousel container has proper positioning */
    .slick-slider {
      z-index: 1;
      position: relative;
    }
    
    /* FIX: Ensure arrows are visible and properly positioned */
    .carousel-nav {
      z-index: 20 !important;
      position: absolute !important;
      visibility: visible !important;
      opacity: 1 !important;
      display: flex !important;
    }
    
    /* FIX: Ensure icons inside arrows are visible */
    .carousel-nav svg {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
  `;
  document.head.appendChild(style);
  return () => {
    document.head.removeChild(style);
  };
}, []);

  // Conditionally render arrows based on the number of children
  const showArrows = numChildren > settings.slidesToShow; // Show arrows only if there are more items than fit in a single view

  return (
    <div className={`relative ${className}`}>
      <Slider ref={sliderRef} {...settings} className="pb-12">
        {React.Children.map(children, (child, index) => (
          <div key={index} className="px-3">
            {child}
          </div>
        ))}
      </Slider>

      {/* Custom navigation arrows - only render if needed */}
    {showArrows && (
  <>
    {/* Debug: Simple visible arrows */}
    <button
      className="absolute left-2 top-1/2 -translate-y-1/2 z-50 
                 bg-blue-600 text-white rounded-full p-2 
                 hover:bg-blue-700 shadow-lg"
      onClick={() => sliderRef.current?.slickPrev()}
      style={{ 
        visibility: 'visible', 
        opacity: 1, 
        display: 'flex',
        minWidth: '40px',
        minHeight: '40px'
      }}
    >
      <ChevronLeft className="w-6 h-6" />
    </button>
    
    <button
      className="absolute right-2 top-1/2 -translate-y-1/2 z-50
                 bg-blue-600 text-white rounded-full p-2
                 hover:bg-blue-700 shadow-lg"
      onClick={() => sliderRef.current?.slickNext()}
      style={{ 
        visibility: 'visible', 
        opacity: 1, 
        display: 'flex',
        minWidth: '40px',
        minHeight: '40px'
      }}
    >
      <ChevronRight className="w-6 h-6" />
    </button>
        </>
      )}
    </div>
  );
};

export default ResourceCarousel;
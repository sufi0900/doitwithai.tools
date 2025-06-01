// components/ResourceCarousel.js
import React, { useRef, useEffect } from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import react-slick CSS in your _app.js or layout.js:
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

const ResourceCarousel = ({ children, className = "", autoplay = true, autoplaySpeed = 2000 }) => {
  const sliderRef = useRef(null);
  
  // Settings for the slider
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: autoplay,
    autoplaySpeed: autoplaySpeed,
    pauseOnHover: true,
    arrows: false,
    dotsClass: "slick-dots custom-dots",
    customPaging: function(i) {
      return (
        <div className="w-3 h-3 mx-1 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-primary dark:hover:bg-primary transition-colors"></div>
      );
    },
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: '0',
        }
      }
    ]
  };

  useEffect(() => {
    // Add custom CSS for the active dot
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-dots .slick-active div {
        background-color: #5271FF !important;
        transform: scale(1.2);
      }
      
      /* Ensure carousel doesn't interfere with modals */
      .slick-slider {
        z-index: 0;
      }
      
      /* Fix modal z-index issue */
      body > div[class*='fixed inset-0'] {
        z-index: 50 !important; 
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Slider ref={sliderRef} {...settings} className="pb-12">
        {React.Children.map(children, (child, index) => (
          <div key={index} className="px-3">
            {child}
          </div>
        ))}
      </Slider>
      
      {/* Custom navigation arrows */}
      <button 
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 transition-all hover:bg-primary hover:text-white dark:hover:bg-primary hidden md:block -ml-5 group"
        onClick={() => sliderRef.current.slickPrev()}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200 group-hover:text-white" />
      </button>
      
      <button 
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 transition-all hover:bg-primary hover:text-white dark:hover:bg-primary hidden md:block -mr-5 group"
        onClick={() => sliderRef.current.slickNext()}
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200 group-hover:text-white" />
      </button>
    </div>
  );
};

export default ResourceCarousel;
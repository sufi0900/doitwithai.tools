// components/ResourceCarousel.js (updated)
import React, { useRef, useEffect, useState } from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ResourceCarousel = ({
  children,
  className = "",
  autoplay = true,
  autoplaySpeed = 2000,
  slidesToShow = 3
}) => {
  const sliderRef = useRef(null);
  const numChildren = React.Children.count(children);
  const [isCarouselPlaying, setIsCarouselPlaying] = useState(autoplay);
  const [activeModalCount, setActiveModalCount] = useState(0);

  // Settings for the slider
  const settings = {
    dots: true,
    infinite: numChildren > slidesToShow,
    speed: 1000, // MODIFIED: Slower transition speed
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    autoplay: isCarouselPlaying && numChildren > 1,
    autoplaySpeed: 4000, // MODIFIED: Slower autoplay interval
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
          slidesToScroll: 1,
          infinite: numChildren > 2,
          autoplay: isCarouselPlaying && numChildren > 2,
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
          autoplay: isCarouselPlaying && numChildren > 1,
        },
      },
    ],
  };

  useEffect(() => {
    // Handler for when a modal opens
    const handleOpenModal = (e) => {
      console.log('Modal opened, pausing carousel');
      setActiveModalCount(prev => prev + 1);
      setIsCarouselPlaying(false);
      
      // Force pause the slider immediately
      if (sliderRef.current) {
        sliderRef.current.slickPause();
      }
    };

    // Handler for when a modal closes
    const handleCloseModal = (e) => {
      console.log('Modal close event received:', e.detail);
      
      // If it's a "close all" event, reset everything
      if (e.detail && e.detail.closeAll) {
        console.log('Close all modals event');
        setActiveModalCount(0);
        if (autoplay) {
          setTimeout(() => {
            setIsCarouselPlaying(true);
            if (sliderRef.current) {
              sliderRef.current.slickPlay();
            }
          }, 100); // Small delay to ensure modal is fully closed
        }
      } else {
        // Individual modal closed
        setActiveModalCount(prev => {
          const newCount = Math.max(0, prev - 1);
          console.log('Active modal count:', newCount);
          
          // If no more active modals and autoplay was originally enabled
          if (newCount === 0 && autoplay) {
            setTimeout(() => {
              setIsCarouselPlaying(true);
              if (sliderRef.current) {
                sliderRef.current.slickPlay();
              }
            }, 100);
          }
          
          return newCount;
        });
      }
    };

    // Add event listeners for the custom events
    window.addEventListener('openResourceModal', handleOpenModal);
    window.addEventListener('closeAllResourceModals', handleCloseModal);
    window.addEventListener('closeResourceModal', handleCloseModal); // Listen for individual closes too

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('openResourceModal', handleOpenModal);
      window.removeEventListener('closeAllResourceModals', handleCloseModal);
      window.removeEventListener('closeResourceModal', handleCloseModal);
    };
  }, [autoplay]);

  // Update slider settings when playing state changes
  useEffect(() => {
    if (sliderRef.current) {
      if (isCarouselPlaying && activeModalCount === 0) {
        sliderRef.current.slickPlay();
      } else {
        sliderRef.current.slickPause();
      }
    }
  }, [isCarouselPlaying, activeModalCount]);

  // Conditionally render arrows based on the number of children
  const showArrows = numChildren > slidesToShow;

  // CSS styles useEffect remains unchanged
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
      .slick-slider {
        z-index: 1;
        position: relative;
      }
      .carousel-nav {
        z-index: 20 !important;
        position: absolute !important;
        visibility: visible !important;
        opacity: 1 !important;
        display: flex !important;
      }
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
      {showArrows && (
        <>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 z-50 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 shadow-lg"
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
            className="absolute right-2 top-1/2 -translate-y-1/2 z-50 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 shadow-lg"
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
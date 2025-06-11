
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
  
  // Settings for the slider - use the slidesToShow prop
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: slidesToShow, // Use the prop instead of hardcoded 3
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
          slidesToShow: Math.min(slidesToShow, 2), // Respect the prop but cap at 2 for tablet
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
  className="carouselNav absolute left-0 top-1/2 -translate-y-1/2 z-10 
             backdrop-blur-md bg-white/10 dark:bg-gray-900/10 
             border border-white/20 dark:border-gray-700/20
             rounded-full p-3 transition-all duration-500 ease-out
             hover:backdrop-blur-xl hover:bg-primary hover:border-primary
             dark:hover:bg-primary dark:hover:border-primary
             hover:shadow-2xl hover:shadow-primary/30 dark:hover:shadow-primary/40
             hover:scale-115 hover:-translate-x-2
             active:scale-105 active:transition-all active:duration-75
             focus:outline-none focus:ring-4 focus:ring-primary/30
             hidden md:flex items-center justify-center
             -ml-6 group overflow-hidden
             before:absolute before:inset-0 before:bg-gradient-to-r 
             before:from-primary/0 before:to-primary/0 
             before:hover:from-primary/10 before:hover:to-primary/20
             before:transition-all before:duration-500 before:opacity-0 
             before:hover:opacity-100"
  onClick={() => sliderRef.current.slickPrev()}
  aria-label="Previous slide"
>
  <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300 
                         group-hover:text-white dark:group-hover:text-white 
                         transition-all duration-500 drop-shadow-sm
                         group-hover:drop-shadow-lg group-hover:scale-110
                         relative z-10" />
</button>

<button 
  className="carouselNav absolute right-0 top-1/2 -translate-y-1/2 z-10 
             backdrop-blur-md bg-white/10 dark:bg-gray-900/10 
             border border-white/20 dark:border-gray-700/20
             rounded-full p-3 transition-all duration-500 ease-out
             hover:backdrop-blur-xl hover:bg-primary hover:border-primary
             dark:hover:bg-primary dark:hover:border-primary
             hover:shadow-2xl hover:shadow-primary/30 dark:hover:shadow-primary/40
             hover:scale-115 hover:translate-x-2
             active:scale-105 active:transition-all active:duration-75
             focus:outline-none focus:ring-4 focus:ring-primary/30
             hidden md:flex items-center justify-center
             -mr-6 group overflow-hidden
             before:absolute before:inset-0 before:bg-gradient-to-l 
             before:from-primary/0 before:to-primary/0 
             before:hover:from-primary/10 before:hover:to-primary/20
             before:transition-all before:duration-500 before:opacity-0 
             before:hover:opacity-100"
  onClick={() => sliderRef.current.slickNext()}
  aria-label="Next slide"
>
  <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300 
                          group-hover:text-white dark:group-hover:text-white 
                          transition-all duration-500 drop-shadow-sm
                          group-hover:drop-shadow-lg group-hover:scale-110
                          relative z-10" />
</button>
    </div>
  );
};

export default ResourceCarousel;
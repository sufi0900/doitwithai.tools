// components/ResourceCarousel.js (Without Dots)
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ResourceCarousel = ({ 
  children, 
  className = "", 
  autoplay = true, 
  autoplaySpeed = 4000,
  slidesToShow = 3,
}) => {
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  const [isCarouselPlaying, setIsCarouselPlaying] = useState(false);
  const [activeModalCount, setActiveModalCount] = useState(0);
  const [isInView, setIsInView] = useState(false);

  // Memoize children count
  const numChildren = useMemo(() => React.Children.count(children), [children]);
  
  // Memoize whether to show arrows
  const showArrows = useMemo(() => numChildren > slidesToShow, [numChildren, slidesToShow]);

  // Intersection Observer to detect when carousel is in view
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInView(entry.isIntersecting);
        
        // Start autoplay only when in view and no modals are open
        if (entry.isIntersecting && autoplay && activeModalCount === 0) {
          setIsCarouselPlaying(true);
        } else {
          setIsCarouselPlaying(false);
        }
      },
      {
        threshold: 0.3,
        rootMargin: '50px 0px'
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [autoplay, activeModalCount]);

  // Optimized slider settings
  const settings = useMemo(() => ({
    dots: false, // Explicitly set to false to ensure no default dots appear
    infinite: numChildren > slidesToShow,
    speed: 600,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    autoplay: isCarouselPlaying && numChildren > 1 && isInView,
    autoplaySpeed: autoplaySpeed,
    pauseOnHover: true,
    arrows: false,
    lazyLoad: 'ondemand',
    waitForAnimate: false,
    useCSS: true,
    useTransform: true,
    
    // The beforeChange prop is no longer needed without dots to track
    // beforeChange: (current, next) => {
    //   setCurrentSlide(next);
    // },

    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(slidesToShow, 2),
          slidesToScroll: 1,
          infinite: numChildren > 2,
          autoplay: isCarouselPlaying && numChildren > 2 && isInView,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: numChildren > 1,
          autoplay: isCarouselPlaying && numChildren > 1 && isInView,
        },
      },
    ],
  }), [numChildren, slidesToShow, isCarouselPlaying, autoplaySpeed, isInView]);

  // Modal event handlers
  const handleOpenModal = useCallback(() => {
    setActiveModalCount(prev => prev + 1);
    setIsCarouselPlaying(false);
    if (sliderRef.current) {
      sliderRef.current.slickPause();
    }
  }, []);

  const handleCloseModal = useCallback((e) => {
    if (e.detail && e.detail.closeAll) {
      setActiveModalCount(0);
      if (autoplay && isInView) {
        setTimeout(() => {
          setIsCarouselPlaying(true);
          if (sliderRef.current) {
            sliderRef.current.slickPlay();
          }
        }, 100);
      }
    } else {
      setActiveModalCount(prev => {
        const newCount = Math.max(0, prev - 1);
        if (newCount === 0 && autoplay && isInView) {
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
  }, [autoplay, isInView]);

  // Navigation handlers
  const handlePrevSlide = useCallback(() => {
    if (sliderRef.current) {
      sliderRef.current.slickPrev();
    }
  }, []);

  const handleNextSlide = useCallback(() => {
    if (sliderRef.current) {
      sliderRef.current.slickNext();
    }
  }, []);

  // Modal event listeners
  useEffect(() => {
    window.addEventListener('openResourceModal', handleOpenModal);
    window.addEventListener('closeAllResourceModals', handleCloseModal);
    window.addEventListener('closeResourceModal', handleCloseModal);

    return () => {
      window.removeEventListener('openResourceModal', handleOpenModal);
      window.removeEventListener('closeAllResourceModals', handleCloseModal);
      window.removeEventListener('closeResourceModal', handleCloseModal);
    };
  }, [handleOpenModal, handleCloseModal]);

  // Update slider playing state
  useEffect(() => {
    if (sliderRef.current) {
      if (isCarouselPlaying && activeModalCount === 0 && isInView) {
        sliderRef.current.slickPlay();
      } else {
        sliderRef.current.slickPause();
      }
    }
  }, [isCarouselPlaying, activeModalCount, isInView]);

  // Remove the useEffect for injecting dot styles
  // The className "resource-carousel-slider" will still be applied to the Slider component
  // which you can use for any other styling you need.

  // Early return for insufficient items
  if (numChildren === 0) return null;

  // If only one item, render without slider
  if (numChildren <= 1) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <div className="px-3">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative carousel-container ${isInView ? 'in-view' : ''} ${className}`}
    >
      <Slider
        ref={sliderRef}
        {...settings}
        className="resource-carousel-slider"
      >
        {React.Children.map(children, (child, index) => (
          <div key={index} className="px-3 focus:outline-none">
            {child}
          </div>
        ))}
      </Slider>

      {/* Custom navigation arrows */}
      {showArrows && (
        <>
          <button
            className="carousel-nav absolute left-2 top-1/2 -translate-y-1/2 z-50 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={handlePrevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            className="carousel-nav absolute right-2 top-1/2 -translate-y-1/2 z-50 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={handleNextSlide}
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
};

export default ResourceCarousel;
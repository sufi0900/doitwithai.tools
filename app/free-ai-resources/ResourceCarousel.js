// components/ResourceCarousel.js (Smart Dots + Intersection Observer)
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ResourceCarousel = ({ 
  children, 
  className = "", 
  autoplay = true, 
  autoplaySpeed = 4000,
  slidesToShow = 3,
  maxDots = 3 // Maximum number of dots to show
}) => {
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  const [isCarouselPlaying, setIsCarouselPlaying] = useState(false); // Start as false
  const [activeModalCount, setActiveModalCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stylesInjected, setStylesInjected] = useState(false);
  const [isInView, setIsInView] = useState(false);

  // Memoize children count
  const numChildren = useMemo(() => React.Children.count(children), [children]);
  
  // Memoize whether to show arrows
  const showArrows = useMemo(() => numChildren > slidesToShow, [numChildren, slidesToShow]);

  // Calculate smart dot configuration
  const dotConfig = useMemo(() => {
    if (numChildren <= slidesToShow) {
      return { showDots: false, dots: [] };
    }

    const totalSlides = numChildren - slidesToShow + 1;
    
    if (totalSlides <= maxDots) {
      // If we have few slides, show one dot per slide
      return {
        showDots: true,
        dots: Array.from({ length: totalSlides }, (_, i) => ({
          slideIndex: i,
          label: `${i + 1}`
        }))
      };
    }

    // For many slides, create smart groupings
    const itemsPerDot = Math.ceil(totalSlides / maxDots);
    const dots = Array.from({ length: maxDots }, (_, i) => {
      const slideIndex = i * itemsPerDot;
      const startItem = slideIndex + 1;
      const endItem = Math.min(slideIndex + itemsPerDot, totalSlides);
      
      return {
        slideIndex: Math.min(slideIndex, totalSlides - 1),
        label: startItem === endItem ? `${startItem}` : `${startItem}-${endItem}`
      };
    });

    return { showDots: true, dots };
  }, [numChildren, slidesToShow, maxDots]);

  // Determine which dot is active
  const activeDotIndex = useMemo(() => {
    if (!dotConfig.showDots) return -1;
    
    // Find which dot group the current slide belongs to
    for (let i = 0; i < dotConfig.dots.length; i++) {
      const dot = dotConfig.dots[i];
      const nextDot = dotConfig.dots[i + 1];
      
      if (!nextDot || currentSlide <= nextDot.slideIndex) {
        return i;
      }
    }
    return dotConfig.dots.length - 1;
  }, [currentSlide, dotConfig]);

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
        threshold: 0.3, // Trigger when 30% of carousel is visible
        rootMargin: '50px 0px' // Start slightly before it's fully visible
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [autoplay, activeModalCount]);

  // Optimized slider settings
  const settings = useMemo(() => ({
    dots: false, // We'll use custom dots
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
    
    beforeChange: (current, next) => {
      setCurrentSlide(next);
    },

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
    console.log('Modal opened, pausing carousel');
    setActiveModalCount(prev => prev + 1);
    setIsCarouselPlaying(false);
    if (sliderRef.current) {
      sliderRef.current.slickPause();
    }
  }, []);

  const handleCloseModal = useCallback((e) => {
    console.log('Modal close event received:', e.detail);
    
    if (e.detail && e.detail.closeAll) {
      console.log('Close all modals event');
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
        console.log('Active modal count:', newCount);
        
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

  // Smart dot click handler
  const handleDotClick = useCallback((slideIndex) => {
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(slideIndex);
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

  // Inject styles only once
  useEffect(() => {
    if (stylesInjected) return;

    const style = document.createElement('style');
    style.id = 'resource-carousel-styles';
    style.innerHTML = `
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
        transition: opacity 0.2s ease;
      }
      
      .carousel-nav:hover {
        opacity: 1 !important;
      }
      
      .carousel-nav svg {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      /* Smart dots styles */
      .smart-dots {
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        display: flex !important;
        gap: 8px;
        z-index: 100 !important;
        background: rgba(0, 0, 0, 0.1);
        padding: 8px 12px;
        border-radius: 20px;
        backdrop-filter: blur(4px);
      }
      
      .smart-dot {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.7);
        border: 2px solid rgba(255, 255, 255, 0.9);
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        flex-shrink: 0;
      }
      
      .smart-dot:hover {
        background-color: rgba(255, 255, 255, 0.9);
        transform: scale(1.15);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
      
      .smart-dot.active {
        background-color: #5271FF;
        border-color: #5271FF;
        transform: scale(1.3);
        box-shadow: 0 0 15px rgba(82, 113, 255, 0.6);
      }
      
      /* Dot tooltip for showing range */
      .smart-dot::before {
        content: attr(data-label);
        position: absolute;
        bottom: 120%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 4px 6px;
        border-radius: 4px;
        font-size: 10px;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
      }
      
      .smart-dot:hover::before {
        opacity: 1;
      }
      
      /* Mobile optimizations */
      @media (max-width: 640px) {
        .carousel-nav {
          opacity: 0.8;
        }
        
        .smart-dot {
          width: 12px;
          height: 12px;
        }
        
        .smart-dots {
          gap: 6px;
          bottom: -8px;
          padding: 6px 10px;
        }
      }
      
      /* Performance optimizations */
      .slick-slide {
        will-change: transform;
      }
      
      .slick-track {
        will-change: transform;
      }
      
      .slick-slide > div {
        height: 100%;
      }
      
      /* Intersection observer fade effect */
      .carousel-container {
        transition: opacity 0.3s ease;
      }
      
      .carousel-container.in-view {
        opacity: 1;
      }
      
      .carousel-container:not(.in-view) {
        opacity: 0.7;
      }
    `;

    if (!document.getElementById('resource-carousel-styles')) {
      document.head.appendChild(style);
      setStylesInjected(true);
    }

    return () => {
      const existingStyle = document.getElementById('resource-carousel-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, [stylesInjected]);

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
        className="pb-16" // Increased padding for dots visibility
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

      {/* Smart dots navigation */}
      {dotConfig.showDots && (
        <div className="smart-dots">
          {dotConfig.dots.map((dot, index) => (
            <button
              key={index}
              className={`smart-dot ${index === activeDotIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(dot.slideIndex)}
              aria-label={`Go to slides ${dot.label}`}
              data-label={dot.label}
            />
          ))}
        </div>
      )}

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
          <div>Slide: {currentSlide + 1}/{numChildren}</div>
          <div>In View: {isInView ? 'Yes' : 'No'}</div>
          <div>Playing: {isCarouselPlaying ? 'Yes' : 'No'}</div>
          <div>Active Dot: {activeDotIndex + 1}</div>
        </div>
      )}
    </div>
  );
};

export default ResourceCarousel;
import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';

// Component for circular reading progress indicator
const ReadingProgressCircle = () => {
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    // Function to calculate scroll progress
    const calculateScrollProgress = () => {
      const articleElement = document.querySelector('.article-content');
      if (!articleElement) return;
      
      const windowHeight = window.innerHeight;
      const articleHeight = articleElement.offsetHeight;
      const scrollTop = window.scrollY;
      const articleTop = articleElement.getBoundingClientRect().top + scrollTop;
      const articleBottom = articleTop + articleHeight;
      
      const totalReadableHeight = articleBottom - articleTop - windowHeight;
      let currentProgress = (scrollTop - articleTop + windowHeight * 0.5) / totalReadableHeight * 100;

      currentProgress = Math.max(0, Math.min(100, currentProgress));
      setProgress(Math.round(currentProgress));
    };
    
    calculateScrollProgress();
    window.addEventListener('scroll', calculateScrollProgress);
    
    return () => window.removeEventListener('scroll', calculateScrollProgress);
  }, []);
  
  // SVG calculations for circle
  const circleRadius = 35; // Increasing the radius for a wider circle
  const circleDiameter = circleRadius * 2;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const dashOffset = circleCircumference - (progress / 100) * circleCircumference;
  
  const isComplete = progress >= 100;
  
  return (
    <div 
      className={`fixed bottom-24 right-4 z-50 flex items-center justify-center rounded-full readingbar shadow-lg 
                transition-all duration-300 ease-in-out
              
                ${isComplete ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-gray-800'}
                h-[80px] w-[80px] border border-gray-100 dark:border-gray-700`}  // Adjusting the height and width of the outer circle
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-40 w-full flex items-center justify-center">
        <svg className="absolute inset-0" width="100%" height="100%" viewBox={`0 0 ${circleDiameter + 16} ${circleDiameter + 16}`}>
          <circle
            cx={(circleDiameter + 16) / 2}
            cy={(circleDiameter + 16) / 2}
            r={circleRadius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3" // Adjusting stroke width for background circle
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx={(circleDiameter + 16) / 2}
            cy={(circleDiameter + 16) / 2}
            r={circleRadius}
            fill="none"
            strokeWidth="3" // Adjusting stroke width for progress circle
            strokeLinecap="round"
            strokeDasharray={circleCircumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${(circleDiameter + 16) / 2} ${(circleDiameter + 16) / 2})`}
            className={`transition-all duration-300 ease-out ${
              isComplete 
                ? 'text-green-500 dark:text-green-400' 
                : 'text-blue-500 dark:text-blue-400'
            }`}
            stroke="currentColor"
          />
        </svg>
        
        {/* Content inside circle */}
        <div className="z-10 flex flex-col items-center justify-center">
          {isComplete ? (
            <CheckCircle className="h-8 w-8 text-green-500 dark:text-green-400" />
          ) : (
            <>
              <BookOpen className="h-5 w-5 mb-1 text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                {`${progress}%`}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadingProgressCircle;

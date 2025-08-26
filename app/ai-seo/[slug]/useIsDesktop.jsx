// hooks/useIsDesktop.js
import { useState, useEffect } from 'react';

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Only run on the client side
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setIsDesktop(window.innerWidth >= 1024); // Adjust breakpoint as needed
      };

      handleResize(); // Set initial state
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return isDesktop;
};

export default useIsDesktop;
//useAnimationCleanup.js

import { useEffect, useRef } from 'react';

export const useAnimationCleanup = () => {
  const cleanupRef = useRef([]);

  useEffect(() => {
    const cleanups = cleanupRef.current;
    return () => {
      // Cleanup all animations on unmount
      cleanups.forEach(cleanup => cleanup());
    };
  }, []);

  const addCleanup = (cleanup) => {
    cleanupRef.current.push(cleanup);
  };

  return { addCleanup };
};
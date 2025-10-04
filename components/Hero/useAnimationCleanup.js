import { useEffect, useRef } from 'react';

export const useAnimationCleanup = () => {
  const cleanupRef = useRef([]);

  useEffect(() => {
    return () => {
      // Cleanup all animations on unmount
      cleanupRef.current.forEach(cleanup => cleanup());
    };
  }, []);

  const addCleanup = (cleanup) => {
    cleanupRef.current.push(cleanup);
  };

  return { addCleanup };
};
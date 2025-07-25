// useProgressiveDisclosure.js
import { useState, useEffect } from 'react';

export const useProgressiveDisclosure = (stages = [], baseDelay = 1000) => {
  const [visibleStages, setVisibleStages] = useState(new Set([0])); // First stage always visible
  
  useEffect(() => {
    const timers = [];
    
    stages.forEach((_, index) => {
      if (index === 0) return; // Skip first stage
      
      const timer = setTimeout(() => {
        setVisibleStages(prev => new Set([...prev, index]));
      }, baseDelay * index);
      
      timers.push(timer);
    });
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [stages.length, baseDelay]);
  
  const isStageVisible = (stageIndex) => visibleStages.has(stageIndex);
  
  return { isStageVisible, visibleStages };
};
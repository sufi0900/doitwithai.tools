// components/AnimatedBinaryText.js
import React, { useState, useEffect, useRef } from 'react';

const generateRandomBinary = (length) => {
  let binary = '';
  for (let i = 0; i < length; i++) {
    binary += Math.round(Math.random());
  }
  return binary;
};

const AnimatedBinaryText = ({ initialText, interval = 2000, ...props }) => {
  const [binaryString, setBinaryString] = useState(initialText);
  const intervalIdRef = useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false); // State to hold the preference

  // Effect to determine prefers-reduced-motion on the client-side
  useEffect(() => {
    // This code only runs in the browser
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches); // Set initial state

      const handleChange = () => {
        setPrefersReducedMotion(mediaQuery.matches); // Update if preference changes
      };

      mediaQuery.addEventListener('change', handleChange);

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []); // Empty dependency array, runs once on client mount


  useEffect(() => {
    const stringLength = initialText.length;

    // Clear any existing interval to prevent multiple intervals running
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    if (prefersReducedMotion) {
      // If user prefers reduced motion, set text once and do not animate
      setBinaryString(initialText); // Ensure it's the initial, static text
      return; // No interval started
    }

    // Only start the interval if motion is preferred
    const updateBinary = () => {
      setBinaryString(generateRandomBinary(stringLength));
    };

    intervalIdRef.current = setInterval(updateBinary, interval);

    // Cleanup function: clear interval when component unmounts or dependencies change
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [initialText, interval, prefersReducedMotion]); // Add prefersReducedMotion to dependencies

  return (
    <text {...props}>
      {binaryString}
      {/* Conditionally render the <animate> tag only if motion is preferred */}
      {!prefersReducedMotion && (
        <animate
          attributeName="opacity"
          values="0.5;1.0;0.5" // Starts at 0.5, goes to 1.0 (fully visible), then back to 0.5
          dur="5s" // Duration of each fade cycle
          repeatCount="indefinite"
        />
      )}
    </text>
  );
};

export default AnimatedBinaryText;
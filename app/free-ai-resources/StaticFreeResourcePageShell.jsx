// components/Common/StaticFreeResourcePageShell.jsx
import React from 'react';
import HeroSection from '@/app/free-ai-resources/HeroSection'; // Adjust path if HeroSection moves

const StaticFreeResourcePageShell = ({ children }) => {
  return (
    <div className="container mt-10"> {/* Assuming this container is part of your common layout */}
      <HeroSection />
      {children} {/* This is where Allblogs (or other content) will be rendered */}
    </div>
  );
};

export default StaticFreeResourcePageShell;
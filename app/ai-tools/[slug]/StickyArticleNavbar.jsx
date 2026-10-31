"use client";

import React, { useState, useEffect } from 'react';
import ArticleHeader from './ArticleHeader';

const StickyArticleNavbar = ({ articleTitle }) => {
  const [isSticky, setIsSticky] = useState(false);
  const [showGlobalHeader, setShowGlobalHeader] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100; // Same threshold as ConditionalGlobalHeader
      const articleHeaderHeight = 200;
      
      // Determine if global header should show
      setShowGlobalHeader(scrollPosition <= scrollThreshold);
      
      // Determine if article header should be sticky
      setIsSticky(scrollPosition > articleHeaderHeight && scrollPosition > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ArticleHeader 
      articleTitle={articleTitle} 
      isSticky={isSticky}
    />
  );
};

export default StickyArticleNavbar;
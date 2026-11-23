"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";

const ConditionalGlobalHeader = () => {
  const [showGlobalHeader, setShowGlobalHeader] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY <= 100;
      setShowGlobalHeader((prev) => (prev === shouldShow ? prev : shouldShow));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ease-out ${
        showGlobalHeader
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <Header />
    </div>
  );
};

export default ConditionalGlobalHeader;

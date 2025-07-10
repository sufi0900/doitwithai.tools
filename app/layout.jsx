// layout.js
"use client";
import { useEffect, useState } from 'react';
import { useOnlineStatus } from './useOnlineStatus';

import { Inter } from "next/font/google";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Providers } from "./providers";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/index.css";
import { Toaster } from 'react-hot-toast';
import Header from "@/components/Header"
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration"; // Add this
import { CacheProvider } from "@/React_Query_Caching/CacheProvider"

const ConditionalGlobalHeader = dynamic(() => import("@/components/Header/ConditionalGlobalHeader"), {
  ssr: false // Client-side only for scroll detection
});
const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: true
});
const ScrollToTop = dynamic(() => import("@/components/ScrollToTop"), {
  ssr: false // Client-side only component
});

// Optimize font loading
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true
});

export default function RootLayout({
  children, // Removed the ': React.ReactNode;' type annotation
}) {
  const pathname = usePathname();
// Add this to your layout.js after the existing imports

// Add inside your RootLayout component, before the return statement
  const isOnline = useOnlineStatus();

useEffect(() => {
    const handleOnline = () => isOnline(true);
    const handleOffline = () => isOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
}, []);


// Add this after const pathname = usePathname();
useEffect(() => {
  // Function to handle link clicks and ensure caching
  const handleLinkClick = (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (href && href.startsWith('/') && !href.startsWith('//')) {
      // This is an internal link, cache it
      setTimeout(() => {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'PRECACHE_PAGE',
            path: href,
            url: window.location.origin + href
          });
        }
      }, 100);
    }
  };
  
  // Add click listener to document
  document.addEventListener('click', handleLinkClick);
  
  return () => {
    document.removeEventListener('click', handleLinkClick);
  };
}, []);
  // Check if current page is a slug page (article page)
  const isSlugPage = pathname && (
    pathname.startsWith('/ai-tools/') ||
    pathname.startsWith('/ai-seo/') ||
    pathname.startsWith('/ai-code/') ||
    pathname.startsWith('/ai-learn-earn/') ||
    pathname.startsWith('/free-ai-resources/') ||
    pathname.startsWith('/ai-news/')
  ) && pathname.split('/').length === 3;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      
   <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#000000" />
      </head>
      <body className={`bg-[#c8cff298] dark:bg-black ${inter.className}`}>
  <noscript>JavaScript is required for this app to work properly.</noscript>
 {!isOnline && (
        <div style={{ background: 'red', color: 'white', textAlign: 'center', padding: '5px' }}>
          You are currently offline.
        </div>
      )}
        <Toaster position="bottom-center" />
        <CacheProvider>
          <Providers>
            {isSlugPage ? (
              <ConditionalGlobalHeader />
            ) : (
              <Suspense fallback={<div>Loading...</div>}>
                <Header />
              </Suspense>
            )}

            <main className={!isSlugPage ? "pt-24" : ""}>
              {children}
            </main>
            <Suspense fallback={<div>Loading...</div>}>
              <Footer />
              <ScrollToTop />
            </Suspense>
          </Providers>
        </CacheProvider>
         <ServiceWorkerRegistration /> 
      </body>
    </html>
  );
}
                          
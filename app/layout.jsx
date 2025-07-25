// layout.js
"use client";
import { useEffect, useState } from 'react';
import { useOnlineStatus } from './useOnlineStatus';

import { Inter } from "next/font/google";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation"; // Already imported
import { Providers } from "./providers";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/index.css";
import { Toaster } from 'react-hot-toast';
import Header from "@/components/Header"
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { CacheProvider } from "@/React_Query_Caching/CacheProvider"
import "../components/Hero/critical-hero.css"

const ConditionalGlobalHeader = dynamic(() => import("@/components/Header/ConditionalGlobalHeader"), {
  ssr: false // Client-side only for scroll detection
});
const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: true
});
const ScrollToTop = dynamic(() => import("@/components/ScrollToTop"), {
  ssr: false // Client-side only component
});
const Hero = dynamic(() => import("@/components/Hero"), {
  ssr: true,
  loading: () => (
    <section className="relative z-10 overflow-hidden bg-teal-50 dark:bg-gray-800 min-h-screen flex items-center justify-center py-16 md:py-[75px]">
      <div className="container mx-auto flex flex-col items-center justify-center px-2 lg:px-8 max-w-7xl">
        <div className="hero-section w-full">
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
              <span className="block">Welcome to</span>
              <span className="text-blue-600 dark:text-blue-400">DOITWITHAI TOOLS</span>
            </h1>
          </header>
        </div>
      </div>
    </section>
  )
});
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
  variable: '--font-inter'
});

export default function RootLayout({
  children,
}) {
  const pathname = usePathname();
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

  useEffect(() => {
    const handleLinkClick = (event) => {
      const link = event.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith('//')) {
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

    document.addEventListener('click', handleLinkClick);

    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);


  useEffect(() => {
    const cacheCurrentStaticPage = async () => {
      const staticPages = ['/about', '/faq', '/contact', '/privacy', '/terms'];
      if (staticPages.includes(pathname)) {
        try {
          const response = await fetch(pathname);
          if (response.ok) {
            const htmlContent = await response.text();
            // Assuming staticPageCache is defined elsewhere or passed
            // await staticPageCache.cachePage(pathname, htmlContent); 
            console.warn("Caching static pages: staticPageCache is not defined in this snippet. Ensure it's imported/defined if needed.");
          }
        } catch (error) {
          console.log('Failed to cache static page:', pathname);
        }
      }
    };

    cacheCurrentStaticPage();
  }, [pathname]);

  const isSlugPage = pathname && (
    pathname.startsWith('/ai-tools/') ||
    pathname.startsWith('/ai-seo/') ||
    pathname.startsWith('/ai-code/') ||
    pathname.startsWith('/ai-learn-earn/') ||
    pathname.startsWith('/free-ai-resources/') ||
    pathname.startsWith('/ai-news/')
  ) && pathname.split('/').length === 3;

  // Determine if the current page is the homepage
  const isHomePage = pathname === '/';

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
<br/>
<br/>
<br/>
            {/* Conditionally render the Hero component only on the homepage */}
            {isHomePage && <Hero/>}

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
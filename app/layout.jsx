/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";
import { Providers } from "./providers";

import "../styles/index.css"
import "../components/Hero/critical-hero.css"
import { useEffect, useState } from "react";
import { useOnlineStatus } from "./useOnlineStatus";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Hero from "@/components/Hero"; 
import Header from "@/components/Header";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CacheProvider } from "@/React_Query_Caching/CacheProvider";

// EVERYTHING else lazy-loaded
const ConditionalGlobalHeader = dynamic(
  () => import("@/components/Header/ConditionalGlobalHeader"),
  { ssr: false }
);
const Footer = dynamic(() => import("@/components/Footer"), { ssr: true });
const ScrollToTop = dynamic(() => import("@/components/ScrollToTop"), {
  ssr: false,
});
const Toaster = dynamic(() => import("react-hot-toast").then((m) => m.Toaster), {
  ssr: false,
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
  adjustFontFallback: true,
  variable: "--font-inter",
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isOnline = useOnlineStatus();
  const [hydrated, setHydrated] = useState(false);
  const [isOfflineRetrying, setIsOfflineRetrying] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const handleOfflineRetry = () => {
    setIsOfflineRetrying(true);
    // Simulate a network check
    setTimeout(() => {
      // In a real scenario, you'd check navigator.onLine and perhaps
      // try to refetch a small asset. For now, we'll just re-evaluate.
      setIsOfflineRetrying(false);
      if (navigator.onLine) {
        window.location.reload();
      }
    }, 1500);
  };

  // 1) Stick hero CSS + global CSS + carousel CSS + Toaster into a deferred import
  useEffect(() => {
    // mark that initial paint has happened
    setHydrated(true);

    import("slick-carousel/slick/slick.css");
    import("slick-carousel/slick/slick-theme.css");
  }, []);

  // online/offline banner
  useEffect(() => {
    const goOnline = () => {
      // No need to set state here, useOnlineStatus hook handles it
      console.log('You are back online!');
    };
    const goOffline = () => {
      // No need to set state here, useOnlineStatus hook handles it
      console.log('You are offline.');
    };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Precache on link click
  useEffect(() => {
    const handler = (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      
      const href = a.getAttribute("href");
      if (!href?.startsWith("/") || href.startsWith("//")) return;

      // Only prefetch static pages, not dynamic content
      const staticPages = ["/about", "/faq", "/contact", "/privacy", "/terms"];
      const isStaticPage = staticPages.includes(href) || staticPages.includes(href.replace(/\/$/, ''));
      
      if (isStaticPage) {
        setTimeout(() => {
          navigator.serviceWorker?.controller?.postMessage({
            type: "PRECACHE_STATIC_PAGE",
            path: href,
            url: window.location.origin + href,
          });
        }, 100);
      }
    };
    
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Update refreshCount on component mount or hydration
  useEffect(() => {
    if (hydrated) {
      setRefreshCount(prevCount => prevCount + 1);
    }
  }, [hydrated]);


  const isHomePage = pathname === "/";
  const isSlugPage =
    pathname.startsWith("/ai-tools/") ||
    pathname.startsWith("/ai-seo/") ||
    pathname.startsWith("/ai-code/") ||
    pathname.startsWith("/ai-learn-earn/") ||
    pathname.startsWith("/free-ai-resources/") ||
    (pathname.startsWith("/ai-news/") &&
      pathname.split("/").length === 3);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${inter.className} bg-[#f0fdfa] dark:bg-black`}>
        <noscript>JavaScript is required for this app to work properly.</noscript>
        
        {/* ENHANCED OFFLINE BAR */}
        {!isOnline && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] max-w-md w-full mx-4">
            <div className="relative overflow-hidden rounded-xl shadow-2xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-[2px]">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 opacity-75 animate-pulse"></div>
              
              <div className="relative bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-75"></div>
                      <div className="relative bg-gradient-to-br from-orange-500 to-red-600 rounded-full p-2">
                        <svg className="h-5 w-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 dark:text-gray-100">
                      <p className="font-bold text-base leading-tight">🔌 You're Offline</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {refreshCount} components • Using cached content
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <button
                      onClick={handleOfflineRetry}
                      disabled={isOfflineRetrying}
                      className={`relative overflow-hidden px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 ${
                        isOfflineRetrying
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isOfflineRetrying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                      
                      <div className={`flex items-center space-x-2 ${isOfflineRetrying ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Retry</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Providers>

          {isSlugPage ? (
            <ConditionalGlobalHeader />
          ) : (
            <Header />
          )}
          {isHomePage && <Hero />}

          {hydrated && (
            <>
              <CacheProvider>
                <main className={isHomePage ? "" : "pt-[80px]"}>
                  {children}
                </main>

                <Footer />
                <ScrollToTop />
              
              </CacheProvider>

              <Toaster position="bottom-center" />
              <SpeedInsights/>
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}
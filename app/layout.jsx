//layout.jsx

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";
import { Providers } from "./providers";

import "../styles/index.css";
import "../components/Hero/critical-hero.css";
import { useEffect, useState } from "react";
import { useOnlineStatus } from "./useOnlineStatus";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Hero from "@/components/Hero";
import Header from "@/components/Header";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { CacheProvider } from "@/React_Query_Caching/CacheProvider";
import Script from "next/script";

// EVERYTHING else lazy-loaded
const ConditionalGlobalHeader = dynamic(
  () => import("@/components/Header/ConditionalGlobalHeader"),
  { ssr: false },
);
const Footer = dynamic(() => import("@/components/Footer"), { ssr: true });
const ScrollToTop = dynamic(() => import("@/components/ScrollToTop"), {
  ssr: false,
});
const Toaster = dynamic(
  () => import("react-hot-toast").then((m) => m.Toaster),
  {
    ssr: false,
  },
);
const SiteAssistant = dynamic(
  () => import("@/features/site-assistant/components/SiteAssistant"),
  { ssr: false },
);

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
      console.log("You are back online!");
    };
    const goOffline = () => {
      // No need to set state here, useOnlineStatus hook handles it
      console.log("You are offline.");
    };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    const cleanupKey = "legacy-pwa-cleanup-v1";

    const cleanupLegacyPwa = async () => {
      if (localStorage.getItem(cleanupKey) === "done") return;

      const hadActiveController =
        "serviceWorker" in navigator &&
        Boolean(navigator.serviceWorker.controller);

      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();

        await Promise.all(
          registrations.map((registration) => registration.unregister()),
        );
      }

      // Cache Storage here is the old Workbox/PWA cache.
      // It is separate from Redis and your Vercel cache.
      if ("caches" in window) {
        const cacheNames = await caches.keys();

        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        );
      }

      localStorage.setItem(cleanupKey, "done");

      // An unregistered worker may continue controlling the current tab
      // until that tab reloads.
      if (hadActiveController) {
        window.location.reload();
      }
    };

    cleanupLegacyPwa().catch((error) => {
      console.error("Legacy service-worker cleanup failed:", error);
    });
  }, []);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Update refreshCount on component mount or hydration
  useEffect(() => {
    if (hydrated) {
      setRefreshCount((prevCount) => prevCount + 1);
    }
  }, [hydrated]);

  const isHomePage = pathname === "/";
  const isSlugPage =
    pathname.startsWith("/ai-tools/") ||
    pathname.startsWith("/ai-seo/") ||
    pathname.startsWith("/ai-code/") ||
    pathname.startsWith("/ai-learn-earn/") ||
    pathname.startsWith("/free-ai-resources/") ||
    (pathname.startsWith("/ai-news/") && pathname.split("/").length === 3);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="/favicon.ico?v=20260917"
          type="image/x-icon"
          sizes="any"
        />
        <link
          rel="shortcut icon"
          href="/favicon.ico?v=20260917"
          type="image/x-icon"
        />
        <link
          rel="apple-touch-icon"
          href="/icons/apple-touch-icon.png?v=20260917"
          sizes="180x180"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />

        {/* Ahrefs Web Analytics */}

        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="vodw9TgfqC4efMfrAO9xrw"
          strategy="afterInteractive"
        />

        {/* Google Analytics (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SHX78424XN"
          strategy="afterInteractive"
        />

        <Script id="ga4-init" strategy="afterInteractive">
          {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-SHX78424XN', {
      page_path: window.location.pathname,
    });
  `}
        </Script>
      </head>
      <body className={`${inter.className} bg-[#f0fdfa] dark:bg-black`}>
        <noscript>
          JavaScript is required for this app to work properly.
        </noscript>

        {/* ENHANCED OFFLINE BAR */}
        {!isOnline && (
          <div className="fixed bottom-6 left-1/2 z-[1000] mx-4 w-full max-w-md -translate-x-1/2">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-[2px] shadow-2xl">
              <div className="animate-pulse absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 opacity-75"></div>

              <div className="relative rounded-xl bg-gradient-to-br from-orange-50 to-red-50 p-4 dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="animate-ping absolute inset-0 rounded-full bg-orange-400 opacity-75"></div>
                      <div className="relative rounded-full bg-gradient-to-br from-orange-500 to-red-600 p-2">
                        <svg
                          className="animate-pulse h-5 w-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-gray-900 dark:text-gray-100">
                      <p className="text-base font-bold leading-tight">
                        🔌 You're Offline
                      </p>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {refreshCount} components • Using cached content
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <button
                      onClick={handleOfflineRetry}
                      disabled={isOfflineRetrying}
                      className={`relative transform overflow-hidden rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 active:scale-95 dark:focus:ring-blue-800 ${
                        isOfflineRetrying
                          ? "cursor-not-allowed bg-gray-400 text-white"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
                      }`}
                    >
                      {isOfflineRetrying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        </div>
                      )}

                      <div
                        className={`flex items-center space-x-2 ${isOfflineRetrying ? "opacity-0" : "opacity-100"} transition-opacity duration-200`}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        <span>Retry</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="mt-3 h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="animate-pulse h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Providers>
          {isSlugPage ? <ConditionalGlobalHeader /> : <Header />}
          {isHomePage && <Hero />}

          <>
            <CacheProvider>
              <main className={isHomePage ? "" : "pt-[80px]"}>{children}</main>

              <Footer />
              <ScrollToTop />
              <SiteAssistant />
            </CacheProvider>

            <Toaster position="bottom-center" />
            <SpeedInsights />
            <Analytics />
          </>
        </Providers>
      </body>
    </html>
  );
}

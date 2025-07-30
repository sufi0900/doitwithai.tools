// layout.js
"use client";
import { Providers } from "./providers";

import "../styles/index.css"
import "../components/Hero/critical-hero.css"
import { useEffect, useState } from "react";
import { useOnlineStatus } from "./useOnlineStatus";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Hero from "@/components/Hero"; // *no* CSS import here
import Header from "@/components/Header";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
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

  // 1) Stick hero CSS + global CSS + carousel CSS + Toaster into a deferred import
  useEffect(() => {
    // mark that initial paint has happened
    setHydrated(true);

    // dynamically inject your hero animations & media query CSS
    // import("../components/Hero/critical-hero.css");
    // global styles
    // import("../styles/index.css");
    // carousel / slick CSS
    import("slick-carousel/slick/slick.css");
    import("slick-carousel/slick/slick-theme.css");
  }, []);

  // online/offline banner
  useEffect(() => {
    const goOnline = () => isOnline(true),
      goOffline = () => isOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [isOnline]);

  // Precache on link click
  useEffect(() => {
    const handler = (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (href?.startsWith("/") && !href.startsWith("//")) {
        setTimeout(() => {
          navigator.serviceWorker?.controller?.postMessage({
            type: "PRECACHE_PAGE",
            path: href,
            url: window.location.origin + href,
          });
        }, 100);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Cache static pages
  useEffect(() => {
    const staticPages = ["/about", "/faq", "/contact", "/privacy", "/terms"];
    if (staticPages.includes(pathname)) {
      fetch(pathname)
        .then((r) => (r.ok ? r.text() : null))
        .then((html) => {
          /* optional caching logic */
        })
        .catch(() => {});
    }
  }, [pathname]);

  const isHomePage = pathname === "/";
  const isSlugPage =
    pathname.startsWith("/ai-tools/") ||
    pathname.startsWith("/ai-seo/") ||
    pathname.startsWith("/ai-code/") ||
    pathname.startsWith("/ai-learn-earn/") ||
    pathname.startsWith("/free-ai-resources/") ||
    pathname.startsWith("/ai-news/") &&
      pathname.split("/").length === 3;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${inter.className} bg-[#f0fdfa] dark:bg-black`}>
        <noscript>JavaScript is required for this app to work properly.</noscript>
        {!isOnline && (
          <div className="bg-red-600 text-white text-center p-2">
            You are currently offline.
          </div>
        )}
    {isSlugPage ? (
                  <ConditionalGlobalHeader />
                ) : (
                  <Header />
                )}
        {/* 1st paint: Hero only */}
        {isHomePage && <Hero />}
  <Providers>
        {/* everything else only once we've painted at least the hero */}
        {hydrated && (
          <>
            <CacheProvider>
            
            

                <main className={isHomePage ? "" : "pt-[80px]"}>
                  {children}
                </main>

                <Footer />
                <ScrollToTop />
              
            </CacheProvider>

            {/* Toaster for notifications */}
            <Toaster position="bottom-center" />

            <ServiceWorkerRegistration />
          </>
        )}
        </Providers>
      </body>
    </html>
  );
}

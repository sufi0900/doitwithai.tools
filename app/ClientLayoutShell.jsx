/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Providers } from "./providers";
import { useOnlineStatus } from "./useOnlineStatus";
import Header from "@/components/Header";
import WorkspaceProvider from "@/features/tools-workspace/WorkspaceProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { CacheProvider } from "@/React_Query_Caching/CacheProvider";

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

export default function ClientLayoutShell({ children }) {
  const pathname = usePathname() || "/";
  const isOnline = useOnlineStatus();
  const [hydrated, setHydrated] = useState(false);
  const [isOfflineRetrying, setIsOfflineRetrying] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const handleOfflineRetry = () => {
    setIsOfflineRetrying(true);
    setTimeout(() => {
      setIsOfflineRetrying(false);
      if (navigator.onLine) {
        window.location.reload();
      }
    }, 1500);
  };

  useEffect(() => {
    setHydrated(true);
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

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        );
      }

      localStorage.setItem(cleanupKey, "done");

      if (hadActiveController) {
        window.location.reload();
      }
    };

    cleanupLegacyPwa().catch((error) => {
      console.error("Legacy service-worker cleanup failed:", error);
    });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
    <>
      {!isOnline && (
        <div className="fixed bottom-6 left-1/2 z-[1000] mx-4 w-full max-w-md -translate-x-1/2">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-[2px] shadow-2xl">
            <div className="animate-pulse absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 opacity-75"></div>

            <div className="relative rounded-xl bg-gradient-to-br from-orange-50 to-red-50 p-4 dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center justify-between space-x-4">
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
                    <span>Retry</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Providers>
        <WorkspaceProvider>
          {isSlugPage ? <ConditionalGlobalHeader /> : <Header />}

          <CacheProvider>
            <main className={isHomePage ? "" : "pt-[80px]"}>{children}</main>

            <Footer />
            <ScrollToTop />
            <SiteAssistant />
          </CacheProvider>

          <Toaster position="bottom-center" />
          <SpeedInsights />
          <Analytics />
        </WorkspaceProvider>
      </Providers>
    </>
  );
}

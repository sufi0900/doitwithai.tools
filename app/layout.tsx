"use client";

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
// import { queryClient } from "@/React_Query_Caching/QueryProvider";

import   { CacheProvider }   from "@/React_Query_Caching/CacheProvider"

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
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
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
      <link 
        rel="preload" 
        href="/modal-video.css" 
        as="style" 
        onLoad={(e) => { e.currentTarget.onload = null; e.currentTarget.rel = 'stylesheet'; }}
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body className={`bg-[#c8cff298] dark:bg-black ${inter.className}`}>
                       <Toaster position="bottom-center" /> {/* Add this line */}
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
    </body>
  </html>
  );
}
// git init
// git add .
// git commit -m "Your commit message"
// git push -u origin main
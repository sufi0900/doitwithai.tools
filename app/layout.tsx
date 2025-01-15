"use client";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Providers } from "./providers";
import "../styles/index.css";


// Dynamic imports for components that are not immediately needed
const Header = dynamic(() => import("@/components/Header"), {
  ssr: true
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
    <body className={`bg-[#FCFCFC] dark:bg-black ${inter.className}`}>
      <Providers>
        <Suspense fallback={<div>Loading...</div>}>
          <Header />
        </Suspense>
        <main className="pt-24">
          {children}
        </main>
        <Suspense fallback={<div>Loading...</div>}>
          <Footer />
          <ScrollToTop />
        </Suspense>
      </Providers>
    </body>
  </html>
  );
}
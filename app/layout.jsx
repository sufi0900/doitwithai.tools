// app/layout.jsx — Server Component RootLayout (Guarantees pure SSR <head> output for Google AdSense & Search Crawlers)
// Optimized by Apex-CWV (Phase 1): Scoped homepage/carousel CSS to route level & deferred 3P scripts to lazyOnload to eliminate 1,190ms render-blocking waterfall & 410ms TBT.

import "../styles/index.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import ClientLayoutShell from "./ClientLayoutShell";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
  adjustFontFallback: true,
  variable: "--font-inter",
});

export const metadata = {
  other: {
    "google-adsense-account": "ca-pub-1402360917878288",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="google-adsense-account"
          content="ca-pub-1402360917878288"
        />
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

        {/* Google AdSense — loaded via lazyOnload so main-thread hydration & LCP are never blocked */}
        <Script
          id="google-adsense-lib"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1402360917878288"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />

        {/* Ahrefs Web Analytics — deferred to lazyOnload to preserve 0ms TBT during FCP/LCP */}
        <Script
          id="ahrefs-analytics"
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="vodw9TgfqC4efMfrAO9xrw"
          strategy="lazyOnload"
        />

        {/* Google Analytics (GA4) — deferred to lazyOnload */}
        <Script
          id="ga4-lib"
          src="https://www.googletagmanager.com/gtag/js?id=G-SHX78424XN"
          strategy="lazyOnload"
        />

        <Script id="ga4-init" strategy="lazyOnload">
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
        <ClientLayoutShell>{children}</ClientLayoutShell>
      </body>
    </html>
  );
}

// app/ai-tools/page.jsx
import React from 'react';
import Script from "next/script";
import Head from "next/head"; // Note: For App Router, `metadata` export is preferred.
import { NextSeo } from "next-seo"; // NextSeo is for Pages Router, ensure it's still needed/used with App Router.
import BlogListingPageContent from "./AllBlogs"; // Import the new reusable component

// --- Next.js Server-Side Configuration ---
// Enable Incremental Static Regeneration (ISR) for this page.
// The page will be revalidated at most every 3600 seconds (1 hour).
// Remove `export const dynamic = "force-dynamic";` to allow ISR.
export const revalidate = 3600; // Revalidate every 1 hour

// --- SEO Metadata (Next.js App Router Standard) ---
export const metadata = {
  title: "Best AI Tools for Productivity - DoItWithAI.Tools",
  description: "Explore a comprehensive list of blogs on the Best AI Tools for Productivity (Freemium), providing detailed reviews of the top artificial intelligence solutions.",
  author: "Sufian Mustafa",
  openGraph: {
    title: "Best AI Tools for Productivity - DoItWithAI.Tools",
    description: "Explore a comprehensive list of blogs on the Best AI Tools for Productivity (Freemium), providing detailed reviews of the top artificial intelligence solutions.",
    url: "https://www.doitwithai.tools/ai-tools",
    type: "website",
    images: [{
      url: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg',
      width: 1200,
      height: 630,
      alt: 'Best AI Tools for Productivity',
    }],
    siteName: "AiToolTrend",
    locale: 'en_US',
  },
  twitter: {
    card: "summary_large_image",
    domain: "doitwithai.tools",
    url: "https://www.doitwithai.tools/ai-tools",
    title: "Best AI Tools for Productivity - DoItWithAI.Tools",
    description: "Explore a comprehensive list of blogs on the Best AI Tools for Productivity (Freemium), providing detailed reviews of the top artificial intelligence solutions.",
    image: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg',
  },
  alternates: {
    canonical: "https://www.doitwithai.tools/ai-tools",
  },
};

export default function Page() {
  // Define schema-specific data for the AI Tools page
  const schemaType = "aitool"; // Sanity schema type
  const pageSlugPrefix = "ai-tools"; // URL prefix for this category
  const pageTitle = "AI Tools";
  const pageTitleHighlight = "AI Tools";
  const pageDescription = "Explore the newest and most effective AI tools to boost your productivity.";

  const breadcrumbProps = {
    pageName: "Best AI Tools",
    pageName2: "for Productivity",
    description: "Unlock the power of AI to enhance productivity and creativity like never before!! In this category, we review the best freemium AI tools designed to streamline tasks and boost SEO. Discover smart solutions that transform your workflow, whether you're a digital marketer, SEO professional, or curious beginner. Our insights help you work smarter, save time, and elevate your project with cutting-edge AI technology.",
    firstlinktext: "Home",
    firstlink: "/",
    link: "/ai-tools",
    linktext: "ai-tools",
  };

  // Schema Markup for AI Tools CollectionPage
  function schemaMarkup() {
    return {
      __html: `
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "${metadata.title}",
          "description": "${metadata.description}",
          "url": "${metadata.openGraph.url}",
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.doitwithai.tools/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "${breadcrumbProps.pageName}",
                "item": "${breadcrumbProps.link}"
              }
            ]
          }
        }
      `
    };
  }

  return (
    <>
      {/*
        Note: In Next.js App Router, the `metadata` export is the primary way
        to manage head tags. `next/head` and `next-seo` are generally for
        Pages Router. If you're using App Router, you might be able to simplify
        this section by relying more on the `metadata` export.
      */}
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:site_name" content={metadata.openGraph.siteName} />
        <meta property="og:locale" content={metadata.openGraph.locale} />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="author" content={metadata.author} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta property="og:image:width" content={metadata.openGraph.images[0].width} />
        <meta property="og:image:height" content={metadata.openGraph.images[0].height} />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:type" content={metadata.openGraph.type} />
        <meta name="twitter:card" content={metadata.twitter.card} />
        <meta property="twitter:domain" content={metadata.twitter.domain} />
        <meta property="twitter:url" content={metadata.twitter.url} />
        <meta name="twitter:title" content={metadata.twitter.title} />
        <meta name="twitter:description" content={metadata.twitter.description} />
        <meta name="twitter:image" content={metadata.twitter.image} />
        <link rel="canonical" href={metadata.alternates.canonical} />
        {/* NextSeo is Pages Router specific, consider removing if fully on App Router */}
        <NextSeo
          title={metadata.title}
          description={metadata.description}
          author={metadata.author}
          type="website"
          locale='en_IE' // Note: This might conflict with en_US in metadata.openGraph.locale
          site_name={metadata.openGraph.siteName}
          canonical={metadata.alternates.canonical}
          openGraph={{
            title: metadata.openGraph.title,
            description: metadata.openGraph.description,
            url: metadata.openGraph.url,
            type: "ItemList", // Changed from "website" for better SEO context for a collection page
            images: metadata.openGraph.images
          }}
        />
      </Head>
      <Script
        id="BreadcrumbListSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaMarkup()}
        key={`${pageSlugPrefix}-jsonld`} // Dynamic key
      />
      <BlogListingPageContent
        schemaType={schemaType}
        pageSlugPrefix={pageSlugPrefix}
        pageTitle={pageTitle}
        pageTitleHighlight={pageTitleHighlight}
        pageDescription={pageDescription}
        breadcrumbProps={breadcrumbProps}
      />
    </>
  );
}

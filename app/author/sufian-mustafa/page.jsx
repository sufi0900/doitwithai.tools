/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import React from "react";
import { NextSeo } from "next-seo";
import Script from "next/script";
import Head from 'next/head';
import Link from "next/link";

function getBaseUrl() {
  // For production, always use your custom domain
  if (process.env.NODE_ENV === 'production') {
    return 'https://doitwithai.tools';  // Remove trailing slash
  }
  
  // For development
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return 'http://localhost:3000';
}
function generateOGImageURL(params) {
  const baseURL = `${getBaseUrl()}/api/og`;
  const searchParams = new URLSearchParams(params);
  return `${baseURL}?${searchParams.toString()}`;
}

export const metadata = {
  title: "Sufian Mustafa: Author, Developer, & SEO Lead for doitwithai.tools",
  description: "Meet the creator behind doitwithai.tools. Sufian Mustafa developed this platform & all its content using a unique, strategic blend of AI and web development",
  author: "Sufian Mustafa",
  keywords: "Sufian Mustafa, AI web developer, AI content creator, author page, doitwithai.tools, prompt engineering, Sanity.io, Next.js developer",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Sufian Mustafa: Author, Developer, & SEO Lead for doitwithai.tools",
    description: "Meet the creator behind doitwithai.tools. Sufian Mustafa developed this platform & all its content using a unique, strategic blend of AI and web development",
    images: [{
      url: generateOGImageURL({
        title: 'Sufian Mustafa: The creator who built this platform using a unique blend of AI and passion.',
        // description field is removed
        category: 'Author Page',
        ctaText: 'Read My Story',
        features: 'Web Developer,AI Enthusiast,Content Creator',
      }),
      width: 1200,
      height: 630,
      alt: 'Sufian Mustafa - AI-Assisted Web Creator and Author'
    }],
    url: `${getBaseUrl()}/author/sufian-mustafa`,
    type: 'profile',
    siteName: 'doitwithai.tools',
    profile: {
      firstName: 'Sufian',
      lastName: 'Mustafa',
      username: 'sufianmustafa',
    },
  },
  twitter: {
    card: 'summary_large_image',
    site: "@doitwithai",
    creator: "@doitwithai",
    title: "Sufian Mustafa: Author, Developer, & SEO Lead for doitwithai.tools",
    description: "Meet the creator behind doitwithai.tools. Sufian Mustafa developed this platform & all its content using a unique, strategic blend of AI and web development",
    image: generateOGImageURL({
      title: 'Sufian Mustafa: The creator who built this platform using a unique blend of AI and passion.',
      // description field is removed
      category: 'Author Page',
      ctaText: 'Read My Story',
      features: 'Web Developer,AI Enthusiast,Content Creator',
    }),
  },
  alternates: {
    canonical: `${getBaseUrl()}/author/sufian-mustafa`,
  },
};

function authorSchema() {
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Sufian Mustafa",
      "url": `${getBaseUrl()}/author/sufian-mustafa`,
      "image": `${getBaseUrl()}/sufi.jpeg`,
      "jobTitle": "AI-Assisted Web Creator and Content Creator",
      "description": "Sufian Mustafa is a passionate web developer and AI enthusiast who creates and curates content for doitwithai.tools, combining modern web technologies with the power of artificial intelligence.",
      "sameAs": [
        "https://www.linkedin.com/in/sufianmustafa",
        "https://twitter.com/doitwithai", // Example, please update with a real Twitter for Sufian
      ],
      "brand": {
        "@type": "Organization",
        "name": "doitwithai.tools",
        "url": `${getBaseUrl()}`,
      }
    })
  };
}

function breadcrumbSchema() {
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `${getBaseUrl()}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Authors",
          "item": `${getBaseUrl()}/author`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Sufian Mustafa",
          "item": `${getBaseUrl()}/author/sufian-mustafa`
        }
      ]
    })
  };
}

const AuthorPage = () => {
    return (
      <>
<Head>
        <NextSeo
          title={metadata.title}
          description={metadata.description}
          canonical={metadata.alternates.canonical}
          openGraph={{
            title: metadata.openGraph.title,
            description: metadata.openGraph.description,
            url: metadata.openGraph.url,
            type: metadata.openGraph.type,
            images: metadata.openGraph.images,
            siteName: metadata.openGraph.siteName,
            locale: metadata.openGraph.locale,
          }}
          twitter={{
            card: metadata.twitter.card,
            site: metadata.twitter.site,
            handle: metadata.twitter.creator,
            title: metadata.twitter.title,
            description: metadata.twitter.description,
            image: metadata.twitter.image,
          }}
          additionalMetaTags={[
            { name: 'author', content: metadata.author },
            { name: 'keywords', content: metadata.keywords },
            { name: 'robots', content: 'index, follow' },
          ]}
        />
           </Head>
        <Script
          id="AuthorSchema"
          type="application/ld+json"
          dangerouslySetInnerHTML={authorSchema()}
          key="author-jsonld"
          
        />
        <Script
          id="BreadcrumbSchema"
          type="application/ld+json"
          dangerouslySetInnerHTML={breadcrumbSchema()}
          key="breadcrumb-jsonld"
          
        />



other code

      </>
    );

};

export default AuthorPage;
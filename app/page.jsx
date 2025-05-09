import React from 'react'
import HomePageCode from "./HomePageCode"
import Script from "next/script";
import Head from "next/head";
import { NextSeo } from "next-seo";
export const revalidate = false;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Do it with AI tools – Double your SEO power & boost productivity",
  description:
    "Discover practical AI tools, coding resources, earning strategies, SEO tactics, and free AI resources to leverage artificial intelligence for productivity and profit. Your ultimate hub for AI innovation and implementation.",
  author: "Sufian Mustafa",
  openGraph: {
    images: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg',
  },
  images: [
    {
      url: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg',
      width: 1200,
      height: 630,
    },
    {
      url: 'https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg',
      width: 800,
      height: 600,
    }
  ],
  keywords: "AI tools, artificial intelligence, AI coding, AI SEO, AI resources, AI monetization, free AI resources, next.js AI, AI productivity, AI for business"
};

export default function Page() {
  
  function schemaMarkup() {
    return {
      __html: `{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Do It With AI",
        "url": "https://www.doitwithai.tools/",
        "description": "A dynamic AI-focused content hub delivering real-time insights, resources, and strategies on leveraging artificial intelligence in practical, profitable ways.",
        "publisher": {
          "@type": "Organization",
          "name": "Do It With AI",
          "logo": {
            "@type": "ImageObject",
            "url": "https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg",
            "width": 600,
            "height": 60
          }
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.doitwithai.tools/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        },
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "AI Tools",
              "url": "https://www.doitwithai.tools/ai-tools",
              "description": "Discover detailed reviews, comparisons, and tutorials on the most effective AI tools for productivity, content creation, automation, marketing, and business growth."
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "AI Code",
              "url": "https://www.doitwithai.tools/ai-code",
              "description": "Explore hands-on guides, coding walkthroughs, and developer-friendly content focused on using AI in web development, app creation, and automation with tools like OpenAI, LangChain, and more."
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "AI Learn & Earn",
              "url": "https://www.doitwithai.tools/ai-learn-earn",
              "description": "Unlock learning paths and income strategies that use AI for skill development and digital monetization—from freelancing and digital products to affiliate marketing and AI-powered side hustles."
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": "AI SEO",
              "url": "https://www.doitwithai.tools/ai-seo",
              "description": "Level up your website's visibility using AI. Learn to master keyword research, optimize content, automate audits, and implement data-driven SEO strategies that actually work."
            },
            {
              "@type": "ListItem",
              "position": 5,
              "name": "Free AI Resources",
              "url": "https://www.doitwithai.tools/ai-free-resources",
              "description": "Access a growing library of free, downloadable AI assets including videos, documents, templates, and tools. Curated to save time, boost creativity, and give users a head start with zero cost."
            }
          ]
        }
      }`
    };
  }

  function homepageFAQSchema() {
    return {
      __html: `{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is doitwithai.tools?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "doitwithai.tools is a dynamic AI-focused content hub built with Next.js and powered by Sanity CMS, designed to deliver real-time, value-packed insights, resources, and strategies on how to leverage artificial intelligence in practical, profitable ways across five key categories: AI Tools, AI Code, AI Learn & Earn, AI SEO, and Free AI Resources."
            }
          },
          {
            "@type": "Question",
            "name": "What types of AI tools are covered on doitwithai.tools?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We cover a wide range of AI tools for productivity, content creation, automation, marketing, and business growth, with detailed reviews, comparisons, and tutorials to help you make informed decisions about which tools best suit your needs."
            }
          },
          {
            "@type": "Question",
            "name": "How can I use AI for making money online?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our AI Learn & Earn section provides comprehensive guides on using AI for freelancing, creating digital products, implementing affiliate marketing strategies, and developing AI-powered side hustles that can generate income online."
            }
          },
          {
            "@type": "Question",
            "name": "Are there free AI resources available on doitwithai.tools?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, we offer a growing library of free, downloadable AI assets including videos, documents, templates, and tools in our Free AI Resources section, all carefully curated to save time, boost creativity, and give users a head start with zero cost."
            }
          }
        ]
      }`
    };
  }

  function organizationSchema() {
    return {
      __html: `{
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Do It With AI",
        "url": "https://www.doitwithai.tools",
        "logo": "https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg",
        "sameAs": [
          "https://twitter.com/doitwithai",
          "https://www.facebook.com/doitwithai",
          "https://www.linkedin.com/company/doitwithai"
        ]
      }`
    };
  }

  function breadcrumbSchema() {
    return {
      __html: `{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.doitwithai.tools/"
          }
        ]
      }`
    };
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta property="og:site_name" content="Do It With AI" />
        <meta property="og:locale" content="en_US" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description}/>
        <meta name="author" content={metadata.author} />
        <meta name="keywords" content={metadata.keywords} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.doitwithai.tools/" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="doitwithai.tools" />
        <meta property="twitter:url" content="https://www.doitwithai.tools/" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="https://res.cloudinary.com/dtvtphhsc/image/upload/v1713980491/studio-b7f33b608e28a75955602f7f0e02a8b6-5jzms2ck_wdjynr.jpg" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://www.doitwithai.tools/"/>
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Additional Meta Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="revisit-after" content="7 days" />

        <NextSeo
          title={metadata.title}
          description={metadata.description}
          author={metadata.author}
          type="website"
          locale="en_US"
          site_name="Do It With AI"
          canonical="https://www.doitwithai.tools/"
          openGraph={{
            title: metadata.title,
            description: metadata.description,
            url: "https://www.doitwithai.tools/",
            type: "website",
            images: metadata.images
          }}
          twitter={{
            handle: "@doitwithai",
            site: "@doitwithai",
            cardType: "summary_large_image",
          }}
          additionalMetaTags={[
            {
              name: "application-name",
              content: "Do It With AI"
            },
            {
              name: "msapplication-TileColor",
              content: "#ffffff"
            }
          ]}
        />
      </Head>

      {/* Schema.org JSON-LD structured data */}
      <Script
        id="WebsiteSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaMarkup()}
        key="website-jsonld"
      />
      
      <Script
        id="FAQSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={homepageFAQSchema()}
        key="faq-jsonld"
      />
      
      <Script
        id="OrganizationSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={organizationSchema()}
        key="organization-jsonld"
      />
      
      <Script
        id="BreadcrumbSchema"
        type="application/ld+json"
        dangerouslySetInnerHTML={breadcrumbSchema()}
        key="breadcrumb-jsonld"
      />

      <HomePageCode/> 
    </>
  )
}
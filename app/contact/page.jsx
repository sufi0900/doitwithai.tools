import React from 'react';
import Script from "next/script";
import { NextSeo } from "next-seo";
import Contact from "@/components/Contact";
import Head from 'next/head';

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
  title: "Contact doitwithai.tools for Expert AI, SEO, & Web Support ",
  description: "For inquiries about AI tools, support, or collaboration opportunities, please use the contact form to get in touch. We will respond promptly to your message.",
  keywords: "contact AI experts, AI tools support, SEO consultation, web development help, AI automation, machine learning guidance, digital marketing assistance",
  authors: [{ name: "Sufian Mustafa" }],
  creator: "Sufian Mustafa",
  publisher: "doitwithai.tools",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: "Get in Touch with doitwithai.tools",
    description: "Fill out the form to send us your message. We'll respond to your inquiry as soon as possible.",
    url: `${getBaseUrl()}/contact`,
    siteName: "doitwithai.tools",
    type: "website",
    locale: "en_US",
    images: [{
      url: generateOGImageURL({
        title: 'Contact us for any inquiries about AI tools, support, or collaboration opportunities.',
        // description field is removed
        category: 'Contact Us',
        ctaText: 'Message Us',
        features: 'AI Support,SEO Help,Partnerships',
      }),
      width: 1200,
      height: 630,
      alt: 'Contact doitwithai.tools - AI and SEO Support',
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get in Touch with doitwithai.tools",
    description: "Fill out the form to send us your message. We'll respond to your inquiry as soon as possible.",
    images: [generateOGImageURL({
      title: 'Contact us for any inquiries about AI tools, support, or collaboration opportunities.',
      // description field is removed
      category: 'Contact Us',
      ctaText: 'Message Us',
      features: 'AI Support,SEO Help,Partnerships',
    })],
    creator: "@doitwithai",
  },
  alternates: {
    canonical: `${getBaseUrl()}/contact`,
  },
};
// JSON-LD structured data for better SEO
function jsonLdMarkup() {
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact doitwithai.tools",
      "description": "Contact page for doitwithai.tools - Expert guidance on AI tools, SEO strategies, and web development solutions.",
      "url": `${getBaseUrl()}/contact`,
      "mainEntity": {
        "@type": "Organization",
        "name": "doitwithai.tools",
        "url": `${getBaseUrl()}`,
        "logo": `${getBaseUrl()}/images/logo.png`,
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+1-XXX-XXX-XXXX",
          "contactType": "Customer Service",
          "email": "sufianmustafa0900@gmail.com",
          "availableLanguage": ["English"],
          "areaServed": "Worldwide",
          "serviceType": ["AI Tools Consultation", "SEO Strategy", "Web Development Support", "AI Automation Guidance"]
        },
      "sameAs": [
        "https://x.com/doitwithaitools",
        "https://www.facebook.com/profile.php?id=61579751720695&mibextid=ZbWKwL",
        "https://www.linkedin.com/company/do-it-with-ai-tools",
        "https://www.pinterest.com/doitwithai/",
        "https://www.tiktok.com/@doitwithai.tools",
        "https://www.youtube.com/@doitwithaitools"
      ]
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${getBaseUrl()}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Contact Us",
            "item": `${getBaseUrl()}/contact`
          }
        ]
      }
    }, null, 2)
  };
}

const ContactPage = () => {
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
          type: 'website',
          siteName: metadata.openGraph.siteName,
          locale: metadata.openGraph.locale,
          images: metadata.openGraph.images,
        }}
        twitter={{
          card: metadata.twitter.card,
          title: metadata.twitter.title,
          description: metadata.twitter.description,
          image: metadata.twitter.images[0].url,
          creator: metadata.twitter.creator,
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: metadata.keywords
          },
          {
            name: 'author',
            content: metadata.author
          },
          {
            name: 'robots',
            content: 'index, follow'
          }
        ]}
      />
         </Head>
      {/* JSON-LD structured data */}
      <Script
        id="contact-page-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdMarkup()}
      />
      
      <Contact />
    </>
  );
};

export default ContactPage;
import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact DoItWithAI.Tools | Expert AI & SEO Support Available 24/7",
  description: "Get expert guidance on AI tools, SEO strategies, web development, and automation solutions. Contact our team for personalized support and consultation services.",
  keywords: "contact AI experts, SEO consultation, AI tools support, web development help, AI automation, machine learning guidance, digital marketing assistance",
  authors: [{ name: "DoItWithAI.Tools Team" }],
  creator: "DoItWithAI.Tools",
  publisher: "DoItWithAI.Tools",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: "Contact DoItWithAI.Tools | Expert AI & SEO Support",
    description: "Connect with our AI and SEO experts for personalized guidance on tools, strategies, and implementation. We're here to help accelerate your digital success.",
    url: "https://doitwithai.tools/contact",
    siteName: "DoItWithAI.Tools",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/images/contact-og-image.jpg", // Add your contact page OG image
        width: 1200,
        height: 630,
        alt: "Contact DoItWithAI.Tools - Expert AI and SEO Support",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact DoItWithAI.Tools | Expert AI & SEO Support",
    description: "Get expert guidance on AI tools, SEO strategies, and web development. Contact our team for personalized support.",
    images: ["/images/contact-twitter-card.jpg"], // Add your Twitter card image
    creator: "@doitwithai", // Replace with your actual Twitter handle
  },
  alternates: {
    canonical: "https://doitwithai.tools/contact",
  },
  other: {
    "contact:phone": "+1-XXX-XXX-XXXX", // Add your phone number
    "contact:email": "support@doitwithai.tools", // Add your contact email
    "business:contact_data:locality": "Your City", // Add your city
    "business:contact_data:region": "Your State", // Add your state
    "business:contact_data:country_name": "United States", // Add your country
  },
};

// JSON-LD structured data for better SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact DoItWithAI.Tools",
  "description": "Contact page for DoItWithAI.Tools - Expert guidance on AI tools, SEO strategies, and web development solutions.",
  "url": "https://doitwithai.tools/contact",
  "mainEntity": {
    "@type": "Organization",
    "name": "DoItWithAI.Tools",
    "url": "https://doitwithai.tools",
    "logo": "https://doitwithai.tools/images/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-XXX-XXX-XXXX", // Add your phone number
      "contactType": "Customer Service",
      "email": "support@doitwithai.tools",
      "availableLanguage": ["English"],
      "areaServed": "Worldwide",
      "serviceType": ["AI Tools Consultation", "SEO Strategy", "Web Development Support", "AI Automation Guidance"]
    },
    "sameAs": [
      "https://twitter.com/doitwithai", // Add your social media URLs
      "https://linkedin.com/company/doitwithai",
      "https://facebook.com/doitwithai"
    ]
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://doitwithai.tools"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Contact Us",
        "item": "https://doitwithai.tools/contact"
      }
    ]
  }
};

const ContactPage = () => {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Breadcrumb
        linktext="Contact Us"
        firstlinktext="Home"
        firstlink="/"
        pageName="Contact Us"
        pageName2=""
        link="contact"
        description="Connect with our AI and SEO experts for personalized guidance, tool recommendations, and strategic consultation. We're here to accelerate your digital transformation journey!"
      />
      <Contact />
    </>
  );
};

export default ContactPage;
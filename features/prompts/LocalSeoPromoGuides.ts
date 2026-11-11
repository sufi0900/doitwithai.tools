import type { KeywordGuide } from "./KeywordGuideCard";

export const localSeoPromoGuides: Record<string, KeywordGuide> = {
  gbpAuditor: {
    href: "/tools/google-business-profile-auditor",
    image: "/prompts/local-seo-gbp-prompts-hero-v2.webp",
    alt: "Google Business Profile Completeness Auditor and Local Pack Workbench.",
    label: "AUDIT YOUR GOOGLE BUSINESS PROFILE",
    title: "Score your GBP categories, 750c description, services & Q&As",
    description:
      "Run your profile details through our Google Business Profile Completeness Auditor to spot missing secondary categories, truncated descriptions, and conversion gaps.",
    action: "Open GBP Completeness Auditor",
  },
  servicePageAndReviews: {
    href: "/tools/local-seo-service-page-planner",
    image: "/prompts/on-page-seo-content-writing-prompts-hero-v2.webp",
    alt: "Local SEO Service and City Landing Page Planner.",
    label: "ANTI-DOORWAY CITY & SERVICE PAGES",
    title: "Architect unique city & service pages that convert local callers",
    description:
      "Plan service-in-city landing pages with genuine neighborhood proof, pricing transparency, and review widgets in our Local SEO Service Page Planner.",
    action: "Open Local Service Page Planner",
  },
  reviewAndSchema: {
    href: "/tools/local-business-schema-generator",
    image: "/prompts/keyword-research-prompts-hero-v2.webp",
    alt: "LocalBusiness JSON-LD Schema and Review Response Studio.",
    label: "LOCALBUSINESS JSON-LD & REVIEW LINKS",
    title: "Generate valid LocalBusiness JSON-LD schema & review QR links",
    description:
      "Create copy-paste LocalBusiness JSON-LD with GeoCoordinates and OpeningHoursSpecification, or reply to customer reviews in our Local SEO studios.",
    action: "Open LocalBusiness Schema Studio",
  },
};

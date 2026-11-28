/**
 * Phase 4: 5 New Signature Multi-Website Templates (Zero AI Slop)
 * Each template has its own distinct typography, surface system, AAA contrast ratio,
 * multi-page navigation contract, pre-wired micro-tools, and niche blog dispatches.
 */

export type MultiWebsiteSignatureTemplateId =
  | "swiss-editorial-directory"
  | "warm-architectural-studio"
  | "crisp-saas-utility-hub"
  | "modern-boutique-commerce"
  | "trusted-local-service-pro";

export interface MultiWebsiteSignatureContract {
  id: MultiWebsiteSignatureTemplateId;
  name: string;
  category: "blog-editorial" | "personal-brand" | "startup-saas";
  eyebrow: string;
  tagline: string;
  description: string;
  audience: string;
  isLight: boolean;
  palette: {
    backgroundHex: string;
    surfaceHex: string;
    surfaceTintHex: string;
    inkPrimary: string;
    inkSecondary: string;
    inkMuted: string;
    accentHex: string;
    accentFg: string;
    borderHex: string;
    ruleWeight: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    monoFont: string;
    headingTracking: string;
  };
  layoutVariant:
    | "swiss-grid-index"
    | "architectural-split-folio"
    | "saas-command-hub"
    | "boutique-merchandiser"
    | "local-trust-converter";
  defaultNavPages: Array<{ title: string; slug: string; navLabel: string; summary: string }>;
  defaultMicroToolSlugs: string[];
  trustSignals: string[];
}

export const MULTI_WEBSITE_SIGNATURE_TEMPLATES: Record<
  MultiWebsiteSignatureTemplateId,
  MultiWebsiteSignatureContract
> = {
  "swiss-editorial-directory": {
    id: "swiss-editorial-directory",
    name: "Swiss Editorial Directory",
    category: "blog-editorial",
    eyebrow: "ZURICH GRID ARCHITECTURE · GALLERY WHITE & INK",
    tagline: "Precision Industry Resource Directory, Reference Tools & Editorial Dispatches",
    description:
      "Inspired by classic Swiss print grids: pure gallery white (#FFFFFF), exposed 1px ink hairlines, numbered index rows, and high-contrast editorial scarlet accents.",
    audience: "Curated tool directories, B2B research portals, and industry benchmarks",
    isLight: true,
    palette: {
      backgroundHex: "#FFFFFF",
      surfaceHex: "#FFFFFF",
      surfaceTintHex: "#F8FAFC",
      inkPrimary: "#0A0A0A",
      inkSecondary: "#262626",
      inkMuted: "#525252",
      accentHex: "#B91C1C",
      accentFg: "#FFFFFF",
      borderHex: "#0A0A0A",
      ruleWeight: "1.5px",
    },
    typography: {
      headingFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      bodyFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      monoFont: "'JetBrains Mono', monospace",
      headingTracking: "-0.03em",
    },
    layoutVariant: "swiss-grid-index",
    defaultNavPages: [
      { title: "Index Methodology", slug: "methodology", navLabel: "Methodology", summary: "How every listed utility and benchmark is verified." },
      { title: "Submit to Directory", slug: "submit", navLabel: "Submit Resource", summary: "Editorial criteria for submitting new tools or studies." },
      { title: "Annual Benchmark Report", slug: "benchmarks", navLabel: "2026 Report", summary: "Full industry performance tables and quartiles." },
    ],
    defaultMicroToolSlugs: [
      "b2b-saas-automation-roi-calculator",
      "saas-churn-ltv-cac-ratio-calculator",
      "white-label-content-marketing-roi-calculator",
      "b2b-operations-maturity-audit-quiz",
    ],
    trustSignals: ["100% Independent Verification", "Zero Sponsored Placements", "Quarterly Data Audits"],
  },

  "warm-architectural-studio": {
    id: "warm-architectural-studio",
    name: "Warm Architectural Studio",
    category: "personal-brand",
    eyebrow: "ATELIER & DESIGN-BUILD PRACTICE · WARM ALABASTER & TERRACOTTA",
    tagline: "Spatial Architecture, Turnkey Project Estimators & Material Monographs",
    description:
      "Warm stone and alabaster surfaces (#FAF7F2) paired with deep espresso ink (#1C1917) and burnt terracotta accents (#9A3412) for architecture, interior design, and real estate studios.",
    audience: "Architecture firms, luxury real estate groups, and design-build studios",
    isLight: true,
    palette: {
      backgroundHex: "#FAF7F2",
      surfaceHex: "#FFFFFF",
      surfaceTintHex: "#F3EFE6",
      inkPrimary: "#1C1917",
      inkSecondary: "#44403C",
      inkMuted: "#57534E",
      accentHex: "#9A3412",
      accentFg: "#FFFFFF",
      borderHex: "#D6D3D1",
      ruleWeight: "1px",
    },
    typography: {
      headingFont: "Georgia, 'Playfair Display', serif",
      bodyFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      monoFont: "'JetBrains Mono', monospace",
      headingTracking: "-0.02em",
    },
    layoutVariant: "architectural-split-folio",
    defaultNavPages: [
      { title: "Architectural Practice", slug: "practice", navLabel: "Practice", summary: "Our philosophy on sustainable materials, daylighting, and spatial permanence." },
      { title: "Commission & Process", slug: "process", navLabel: "Process", summary: "From feasibility study and schematic design to on-site construction administration." },
      { title: "Material Library", slug: "materials", navLabel: "Materials", summary: "Curated stone, timber, and low-carbon structural systems." },
    ],
    defaultMicroToolSlugs: [
      "mortgage-emi-payment-calculator",
      "rental-yield-cap-rate-calculator",
      "home-remodel-project-scope-quiz",
      "mls-property-listing-copy-generator",
    ],
    trustSignals: ["AIA & LEED Accredited", "Turnkey Feasibility Tools", "25-Year Structural Warranty"],
  },

  "crisp-saas-utility-hub": {
    id: "crisp-saas-utility-hub",
    name: "Crisp SaaS Utility Hub",
    category: "startup-saas",
    eyebrow: "ENTERPRISE PRODUCT SUITE · SLATE PAPER & ROYAL COBALT",
    tagline: "Interactive Engineering Calculators, Live Documentation & Product Benchmarks",
    description:
      "Engineered like Stripe and Linear daylight documentation: crisp slate-tinted canvas (#F8FAFC), pure white elevated surfaces, monospaced badges, and Royal Cobalt (#1D4ED8) primary actions.",
    audience: "B2B SaaS platforms, developer tool suites, and AI product teams",
    isLight: true,
    palette: {
      backgroundHex: "#F8FAFC",
      surfaceHex: "#FFFFFF",
      surfaceTintHex: "#EFF6FF",
      inkPrimary: "#0F172A",
      inkSecondary: "#334155",
      inkMuted: "#475569",
      accentHex: "#1D4ED8",
      accentFg: "#FFFFFF",
      borderHex: "#CBD5E1",
      ruleWeight: "1px",
    },
    typography: {
      headingFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      bodyFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      monoFont: "'JetBrains Mono', monospace",
      headingTracking: "-0.025em",
    },
    layoutVariant: "saas-command-hub",
    defaultNavPages: [
      { title: "Platform Architecture", slug: "architecture", navLabel: "Architecture", summary: "Multi-tenant security, SLA guarantees, and edge latency benchmarks." },
      { title: "Enterprise Security", slug: "security", navLabel: "Security", summary: "SOC 2 Type II controls, Row-Level Security, and zero-retention API routing." },
      { title: "Changelog & Releases", slug: "changelog", navLabel: "Changelog", summary: "Weekly shipping notes across calculators, APIs, and integrations." },
    ],
    defaultMicroToolSlugs: [
      "b2b-saas-automation-roi-calculator",
      "saas-churn-ltv-cac-ratio-calculator",
      "custom-software-project-scope-estimator-quiz",
      "b2b-cold-outreach-value-hook-generator",
    ],
    trustSignals: ["99.99% Edge Uptime", "SOC 2 Type II Ready", "$0 Browser-Side Calculation"],
  },

  "modern-boutique-commerce": {
    id: "modern-boutique-commerce",
    name: "Modern Boutique Commerce",
    category: "startup-saas",
    eyebrow: "DIRECT-TO-CONSUMER ATELIER · WARM IVORY & DEEP FOREST",
    tagline: "Interactive Guided Shopping Quizzes, Fit Finders & Editorial Lookbooks",
    description:
      "Editorial retail presentation with warm ivory surfaces (#FDFBF7), deep forest emerald accents (#065F46), interactive size/routine matchmakers, and zero visual clutter.",
    audience: "DTC e-commerce brands, specialty retail, and curated product studios",
    isLight: true,
    palette: {
      backgroundHex: "#FDFBF7",
      surfaceHex: "#FFFFFF",
      surfaceTintHex: "#ECFDF5",
      inkPrimary: "#111827",
      inkSecondary: "#374151",
      inkMuted: "#4B5563",
      accentHex: "#065F46",
      accentFg: "#FFFFFF",
      borderHex: "#D1D5DB",
      ruleWeight: "1px",
    },
    typography: {
      headingFont: "Georgia, 'Playfair Display', serif",
      bodyFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      monoFont: "'JetBrains Mono', monospace",
      headingTracking: "-0.02em",
    },
    layoutVariant: "boutique-merchandiser",
    defaultNavPages: [
      { title: "Sourcing & Craftsmanship", slug: "craftsmanship", navLabel: "Craftsmanship", summary: "Small-batch materials, ethical provenance, and lifetime repair guarantee." },
      { title: "Size & Fit Guide", slug: "sizing", navLabel: "Fit Guide", summary: "Exact garment measurements and interactive size finder." },
      { title: "Wholesale & Press", slug: "stockists", navLabel: "Stockists", summary: "Retail partners, press kit, and trade inquiries." },
    ],
    defaultMicroToolSlugs: [
      "apparel-size-fit-recommender-quiz",
      "skincare-routine-product-matchmaker-quiz",
      "holiday-gift-finder-concierge-quiz",
      "bundle-discount-aov-lift-calculator",
    ],
    trustSignals: ["Free 30-Day Exchanges", "Small-Batch Ethical Craft", "60-Second Guided Fit Quiz"],
  },

  "trusted-local-service-pro": {
    id: "trusted-local-service-pro",
    name: "Trusted Local Service Pro",
    category: "startup-saas",
    eyebrow: "LICENSED REGIONAL CONTRACTORS · HIGH-TRUST CONVERSION LAYOUT",
    tagline: "Instant Sq-Ft & Solar Estimators, Service Area Proof & Same-Day Booking",
    description:
      "Built for high-ticket local service businesses (solar, HVAC, roofing, remodeling): ultra-clear pricing calculators up front, verified license badges, and high-contrast emerald booking actions.",
    audience: "Solar installers, HVAC & roofing contractors, medical clinics, and local trades",
    isLight: true,
    palette: {
      backgroundHex: "#FFFFFF",
      surfaceHex: "#F8FAFC",
      surfaceTintHex: "#ECFDF5",
      inkPrimary: "#0F172A",
      inkSecondary: "#1E293B",
      inkMuted: "#475569",
      accentHex: "#047857",
      accentFg: "#FFFFFF",
      borderHex: "#CBD5E1",
      ruleWeight: "1.5px",
    },
    typography: {
      headingFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      bodyFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      monoFont: "'JetBrains Mono', monospace",
      headingTracking: "-0.02em",
    },
    layoutVariant: "local-trust-converter",
    defaultNavPages: [
      { title: "Service Areas & Licensing", slug: "service-areas", navLabel: "Service Areas", summary: "Cities served, state contractor licenses, and insurance certificates." },
      { title: "Financing & Rebates", slug: "financing", navLabel: "Rebates & Financing", summary: "Federal tax credits, utility rebates, and 0%-APR payment plans." },
      { title: "25-Year Workmanship Warranty", slug: "warranty", navLabel: "Warranty", summary: "Our written performance and labor guarantee." },
    ],
    defaultMicroToolSlugs: [
      "solar-panel-savings-payback-calculator",
      "hvac-tonnage-replacement-cost-estimator",
      "roofing-painting-sqft-instant-quoter",
      "seasonal-home-maintenance-health-audit",
    ],
    trustSignals: ["Licensed, Bonded & Insured", "Instant Online Cost Estimators", "4.9★ Verified Local Reviews"],
  },
};

export function isMultiWebsiteSignatureTemplate(
  id: string,
): id is MultiWebsiteSignatureTemplateId {
  return Object.prototype.hasOwnProperty.call(MULTI_WEBSITE_SIGNATURE_TEMPLATES, id);
}

export function getMultiWebsiteSignatureContract(
  id: string,
): MultiWebsiteSignatureContract | null {
  return isMultiWebsiteSignatureTemplate(id)
    ? MULTI_WEBSITE_SIGNATURE_TEMPLATES[id]
    : null;
}

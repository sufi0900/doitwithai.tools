/**
 * Phase 5: 5 New Signature Single-Website Templates (Blogging, Personal Branding & Solo-Tools)
 * Zero AI Slop: Each template locks a distinct publication/monograph typography system,
 * AAA high-contrast surface palette, and purpose-built single-site conversion layout.
 */

export type SingleWebsiteSignatureTemplateId =
  | "editorial-magazine-journal"
  | "minimalist-founder-monograph"
  | "technical-newsletter-docs"
  | "creator-lead-magnet-hub"
  | "agency-flagship-showcase";

export interface SingleWebsiteSignatureContract {
  id: SingleWebsiteSignatureTemplateId;
  name: string;
  category: "blog-editorial" | "personal-brand" | "startup-saas";
  eyebrow: string;
  tagline: string;
  description: string;
  audience: string;
  isLight: boolean;
  isBlogFirst: boolean;
  isSingleToolFocused: boolean;
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
    | "broadsheet-magazine"
    | "founder-monograph"
    | "developer-handbook"
    | "solo-calculator-funnel"
    | "agency-audit-showcase";
  flagshipMicroToolSlug: string;
  editorialSections: Array<{ label: string; description: string }>;
}

export const SINGLE_WEBSITE_SIGNATURE_TEMPLATES: Record<
  SingleWebsiteSignatureTemplateId,
  SingleWebsiteSignatureContract
> = {
  "editorial-magazine-journal": {
    id: "editorial-magazine-journal",
    name: "Editorial Magazine Journal",
    category: "blog-editorial",
    eyebrow: "BROADSHEET PUBLICATION · WARM NEWSPRINT & OXFORD NAVY",
    tagline: "Long-Form Investigative Essays, Topic Clusters & Reader Companion Calculators",
    description:
      "Modeled after flagship literary and business broadsheets: warm newsprint canvas (#FBF9F5), double-rule masthead dividers, classic serif headlines, and Oxford Navy (#1E3A8A) editorial callouts.",
    audience: "Independent journalists, niche SEO publications, and research digests",
    isLight: true,
    isBlogFirst: true,
    isSingleToolFocused: false,
    palette: {
      backgroundHex: "#FBF9F5",
      surfaceHex: "#FFFFFF",
      surfaceTintHex: "#F3EFE6",
      inkPrimary: "#111827",
      inkSecondary: "#374151",
      inkMuted: "#4B5563",
      accentHex: "#1E3A8A",
      accentFg: "#FFFFFF",
      borderHex: "#111827",
      ruleWeight: "2px",
    },
    typography: {
      headingFont: "Georgia, 'Playfair Display', 'Times New Roman', serif",
      bodyFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      monoFont: "'JetBrains Mono', monospace",
      headingTracking: "-0.02em",
    },
    layoutVariant: "broadsheet-magazine",
    flagshipMicroToolSlug: "white-label-content-marketing-roi-calculator",
    editorialSections: [
      { label: "Cover Essay", description: "Primary investigative dispatch with verified primary citations." },
      { label: "Topic Desk", description: "Structured pillar-and-cluster archives organized by reader intent." },
      { label: "Interactive Companion", description: "Embedded reader calculator reinforcing the cover thesis." },
    ],
  },

  "minimalist-founder-monograph": {
    id: "minimalist-founder-monograph",
    name: "Minimalist Founder Monograph",
    category: "personal-brand",
    eyebrow: "EXECUTIVE MONOGRAPH · PURE ALABASTER & GRAPHITE INK",
    tagline: "Operating Principles, Board Advisory Thesis & Executive Essays",
    description:
      "Radical restraint for founders, executives, and angel investors: generous whitespace, single-column prose measure (65ch), crisp graphite typography (#0F172A), and deep emerald (#065F46) proof markers.",
    audience: "Startup founders, executive advisors, angel investors, and keynote authors",
    isLight: true,
    isBlogFirst: true,
    isSingleToolFocused: false,
    palette: {
      backgroundHex: "#FFFFFF",
      surfaceHex: "#F8FAFC",
      surfaceTintHex: "#F1F5F9",
      inkPrimary: "#0F172A",
      inkSecondary: "#334155",
      inkMuted: "#475569",
      accentHex: "#065F46",
      accentFg: "#FFFFFF",
      borderHex: "#E2E8F0",
      ruleWeight: "1px",
    },
    typography: {
      headingFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      bodyFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      monoFont: "'JetBrains Mono', monospace",
      headingTracking: "-0.03em",
    },
    layoutVariant: "founder-monograph",
    flagshipMicroToolSlug: "freelance-consultant-hourly-retainer-calculator",
    editorialSections: [
      { label: "Operating Thesis", description: "First-principles essays on company building and capital allocation." },
      { label: "Advisory Scope", description: "Interactive engagement estimator and quarterly board availability." },
      { label: "Field Notes", description: "Chronological archive of memos, investments, and post-mortems." },
    ],
  },

  "technical-newsletter-docs": {
    id: "technical-newsletter-docs",
    name: "Technical Newsletter & Docs",
    category: "blog-editorial",
    eyebrow: "ENGINEERING HANDBOOK · CARBON SLATE & COBALT SPEC",
    tagline: "Architecture RFCs, Benchmarks, Code Walkthroughs & System Calculators",
    description:
      "Built for software engineers, AI researchers, and technical writers: high-contrast daylight engineering paper (#F8FAFC), monospaced section numbering, spec tables, and embedded unit-economics calculators.",
    audience: "Engineering newsletters, developer advocates, and technical documentation sites",
    isLight: true,
    isBlogFirst: true,
    isSingleToolFocused: false,
    palette: {
      backgroundHex: "#F8FAFC",
      surfaceHex: "#FFFFFF",
      surfaceTintHex: "#EFF6FF",
      inkPrimary: "#0F172A",
      inkSecondary: "#1E293B",
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
    layoutVariant: "developer-handbook",
    flagshipMicroToolSlug: "b2b-saas-automation-roi-calculator",
    editorialSections: [
      { label: "RFC & Architecture Notes", description: "Deep-dive systems engineering dispatches with reproducible benchmarks." },
      { label: "Interactive Spec Calculator", description: "Live browser-side throughput and cost estimator ($0 runtime)." },
      { label: "Release Changelog", description: "Versioned index of published guides, diagrams, and code patterns." },
    ],
  },

  "creator-lead-magnet-hub": {
    id: "creator-lead-magnet-hub",
    name: "Creator Lead-Magnet Hub",
    category: "personal-brand",
    eyebrow: "SOLO-TOOL CONVERSION ENGINE · WARM SAND & BURNT AMBER",
    tagline: "One Flagship Interactive Calculator Paired With a High-Converting Newsletter",
    description:
      "Designed for creators, coaches, and solo educators who drive traffic from YouTube, LinkedIn, or Pinterest straight into one flagship calculator/quiz and capture email subscribers.",
    audience: "Course creators, fitness/finance coaches, and newsletter operators",
    isLight: true,
    isBlogFirst: false,
    isSingleToolFocused: true,
    palette: {
      backgroundHex: "#FFFDF9",
      surfaceHex: "#FFFFFF",
      surfaceTintHex: "#FEF3C7",
      inkPrimary: "#1C1917",
      inkSecondary: "#44403C",
      inkMuted: "#57534E",
      accentHex: "#B45309",
      accentFg: "#FFFFFF",
      borderHex: "#E7E5E4",
      ruleWeight: "1.5px",
    },
    typography: {
      headingFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      bodyFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      monoFont: "'JetBrains Mono', monospace",
      headingTracking: "-0.025em",
    },
    layoutVariant: "solo-calculator-funnel",
    flagshipMicroToolSlug: "course-creator-launch-revenue-calculator",
    editorialSections: [
      { label: "Flagship Interactive Tool", description: "Above-the-fold calculator or scored quiz with instant email report delivery." },
      { label: "Playbook Dispatches", description: "3-5 high-signal guides expanding on the calculator output." },
      { label: "Subscriber Vault", description: "Direct newsletter signup with zero popup clutter." },
    ],
  },

  "agency-flagship-showcase": {
    id: "agency-flagship-showcase",
    name: "Agency Flagship Showcase",
    category: "startup-saas",
    eyebrow: "WHITE-LABEL GROWTH PARTNER · DEEP GRAPHITE & ROYAL COBALT",
    tagline: "Verified Client Case Studies Paired With an Interactive White-Label Audit Tool",
    description:
      "Purpose-built for SEO, content, and digital marketing agencies: combines an interactive White-Label Readiness Audit above the fold with quantified client revenue outcomes and retainer booking.",
    audience: "SEO agencies, growth consultancies, and B2B service partners",
    isLight: true,
    isBlogFirst: false,
    isSingleToolFocused: true,
    palette: {
      backgroundHex: "#FFFFFF",
      surfaceHex: "#F8FAFC",
      surfaceTintHex: "#EFF6FF",
      inkPrimary: "#0F172A",
      inkSecondary: "#334155",
      inkMuted: "#475569",
      accentHex: "#1D4ED8",
      accentFg: "#FFFFFF",
      borderHex: "#CBD5E1",
      ruleWeight: "1.5px",
    },
    typography: {
      headingFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      bodyFont: "'Plus Jakarta Sans', -apple-system, sans-serif",
      monoFont: "'JetBrains Mono', monospace",
      headingTracking: "-0.025em",
    },
    layoutVariant: "agency-audit-showcase",
    flagshipMicroToolSlug: "white-label-seo-ai-readiness-audit-quiz",
    editorialSections: [
      { label: "Live Prospect Audit", description: "100% agency-branded interactive audit capturing prospect domain and email." },
      { label: "Verified Case Outcomes", description: "Before/after traffic, pipeline, and ROI breakdowns." },
      { label: "Methodology & Playbooks", description: "Authority guides demonstrating technical and editorial mastery." },
    ],
  },
};

export function isSingleWebsiteSignatureTemplate(
  id: string,
): id is SingleWebsiteSignatureTemplateId {
  return Object.prototype.hasOwnProperty.call(SINGLE_WEBSITE_SIGNATURE_TEMPLATES, id);
}

export function getSingleWebsiteSignatureContract(
  id: string,
): SingleWebsiteSignatureContract | null {
  return isSingleWebsiteSignatureTemplate(id)
    ? SINGLE_WEBSITE_SIGNATURE_TEMPLATES[id]
    : null;
}

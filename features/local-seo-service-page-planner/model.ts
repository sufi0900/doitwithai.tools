export type ServicePagePlannerInput = {
  businessName: string;
  primaryCategory: string;
  hubCity: string;
  stateAbbr: string;
  servicesLines: string;
  citiesLines: string;
  uniqueLocalProofNotes: string;
};

export type PlannedServiceAreaPage = {
  slug: string;
  pageType: "Hub Pillar" | "Core Service" | "City Service Silo";
  targetCity: string;
  targetService: string;
  primaryKeyword: string;
  metaTitle: string;
  metaDescription: string;
  h1Heading: string;
  h2Outline: string[];
  localDifferentiatorPrompt: string;
  internalLinksTo: string[];
};

export type ServicePageMatrixResult = {
  totalPagesCount: number;
  doorwayRiskStatus: "Safe Silo Architecture" | "Moderate — Add Local Proof" | "High Doorway Risk — Consolidate";
  doorwayRiskAdvice: string;
  pages: PlannedServiceAreaPage[];
  csvExport: string;
};

export const DEFAULT_SERVICE_PAGE_INPUT: ServicePagePlannerInput = {
  businessName: "Summit Air & Heating Pros",
  primaryCategory: "HVAC Contractor",
  hubCity: "Denver",
  stateAbbr: "CO",
  servicesLines: [
    "Emergency AC Repair",
    "Furnace Installation & Replacement",
    "Ductless Mini-Split Systems",
  ].join("\n"),
  citiesLines: ["Denver", "Aurora", "Lakewood", "Littleton"].join("\n"),
  uniqueLocalProofNotes:
    "NATE-certified technicians, 60-minute dispatch across the Denver metro, Xcel Energy rebate partner, 10-year parts & labor warranty.",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function buildServiceAreaMatrix(
  input: ServicePagePlannerInput,
): ServicePageMatrixResult {
  const biz = input.businessName.trim() || "Local Pros";
  const hub = input.hubCity.trim() || "Metro";
  const st = input.stateAbbr.trim() || "";
  const services = input.servicesLines
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
  const cities = input.citiesLines
    .split(/\r?\n|,/)
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 10);

  const pages: PlannedServiceAreaPage[] = [];

  // 1. Core Service Pages (Anchored to Hub City)
  services.forEach((srv) => {
    const sSlug = slugify(srv);
    const cityState = [hub, st].filter(Boolean).join(", ");
    pages.push({
      slug: `/services/${sSlug}`,
      pageType: "Core Service",
      targetCity: hub,
      targetService: srv,
      primaryKeyword: `${srv.toLowerCase()} ${hub.toLowerCase()} ${st.toLowerCase()}`.trim(),
      metaTitle: `${srv} in ${cityState} | ${biz}`.slice(0, 62),
      metaDescription: `Need ${srv.toLowerCase()} in ${cityState}? ${biz} provides upfront pricing, certified technicians, and fast local scheduling. Book online today.`.slice(
        0,
        158,
      ),
      h1Heading: `${srv} in ${cityState}`,
      h2Outline: [
        `Signs You Need ${srv} in ${hub}`,
        `Our Step-by-Step ${srv} Process & Pricing Factors`,
        `Recent ${srv} Projects Completed in ${cityState}`,
        `Frequently Asked Questions About ${srv}`,
      ],
      localDifferentiatorPrompt: `Include 2 real job photos from ${hub}, local permit/climate considerations in ${st || hub}, and ${input.uniqueLocalProofNotes || "verified customer reviews"}.`,
      internalLinksTo: cities
        .filter((c) => c.toLowerCase() !== hub.toLowerCase())
        .slice(0, 3)
        .map((c) => `/locations/${slugify(c)}-${sSlug}`),
    });
  });

  // 2. City × Service Pages (For surrounding service-area cities)
  cities
    .filter((c) => c.toLowerCase() !== hub.toLowerCase())
    .forEach((city) => {
      const cSlug = slugify(city);
      const cityState = [city, st].filter(Boolean).join(", ");
      const primarySrv = services[0] || input.primaryCategory;
      const sSlug = slugify(primarySrv);

      pages.push({
        slug: `/locations/${cSlug}-${sSlug}`,
        pageType: "City Service Silo",
        targetCity: city,
        targetService: primarySrv,
        primaryKeyword: `${primarySrv.toLowerCase()} ${city.toLowerCase()} ${st.toLowerCase()}`.trim(),
        metaTitle: `${primarySrv} in ${cityState} | ${biz}`.slice(0, 62),
        metaDescription: `Trusted ${primarySrv.toLowerCase()} serving ${cityState}. Fast dispatch from our ${hub} crew, transparent quotes, and local warranties from ${biz}.`.slice(
          0,
          158,
        ),
        h1Heading: `${primarySrv} & ${input.primaryCategory} Serving ${cityState}`,
        h2Outline: [
          `Fast Dispatch to ${city} Neighborhoods & Landmarks`,
          `${services.slice(0, 3).join(", ")} Available in ${cityState}`,
          `Case Study & Customer Reviews from ${city} Homeowners`,
          `Local Rebates, Permits & FAQs for ${cityState} Residents`,
        ],
        localDifferentiatorPrompt: `Avoid find-and-replace city swapping! Mention specific ${city} neighborhoods/ZIP codes, drive-time dispatch from ${hub}, and at least 1 real customer review from a ${city} client.`,
        internalLinksTo: [`/services/${sSlug}`, "/locations"],
      });
    });

  const totalPagesCount = pages.length;
  const doorwayRiskStatus: ServicePageMatrixResult["doorwayRiskStatus"] =
    cities.length > 8
      ? "High Doorway Risk — Consolidate"
      : cities.length > 4
        ? "Moderate — Add Local Proof"
        : "Safe Silo Architecture";

  const doorwayRiskAdvice =
    cities.length > 8
      ? "Publishing 8+ city pages at once without unique job photos, ZIP-specific case studies, and localized reviews risks triggering Google's Doorway Page spam classifier. Start with your top 4–5 highest-revenue cities first."
      : "To rank safely in neighboring cities where you don't have a physical storefront, include real completed project photos, neighborhood/ZIP mentions, and customer reviews from each specific city.";

  const csvRows = [
    '"URL Slug","Page Type","Target City","Target Service","Primary Keyword","Meta Title","H1 Heading","Unique Local Proof Requirement"',
    ...pages.map(
      (p) =>
        `"${p.slug}","${p.pageType}","${p.targetCity}","${p.targetService}","${p.primaryKeyword}","${p.metaTitle.replace(/"/g, '""')}","${p.h1Heading.replace(/"/g, '""')}","${p.localDifferentiatorPrompt.replace(/"/g, '""')}"`,
    ),
  ];

  return {
    totalPagesCount,
    doorwayRiskStatus,
    doorwayRiskAdvice,
    pages,
    csvExport: csvRows.join("\r\n"),
  };
}

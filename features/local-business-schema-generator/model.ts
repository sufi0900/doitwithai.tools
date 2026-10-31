export type BusinessSubtypeGroup = {
  group: string;
  types: Array<{ value: string; label: string }>;
};

export const LOCAL_BUSINESS_SUBTYPES: BusinessSubtypeGroup[] = [
  {
    group: "General & Professional Services",
    types: [
      { value: "LocalBusiness", label: "LocalBusiness (General)" },
      { value: "ProfessionalService", label: "ProfessionalService" },
      { value: "LegalService", label: "LegalService / Law Firm" },
      { value: "Attorney", label: "Attorney" },
      { value: "AccountingService", label: "AccountingService / CPA" },
      { value: "RealEstateAgent", label: "RealEstateAgent / Brokerage" },
      { value: "InsuranceAgency", label: "InsuranceAgency" },
      { value: "FinancialService", label: "FinancialService" },
    ],
  },
  {
    group: "Medical, Dental & Wellness",
    types: [
      { value: "Dentist", label: "Dentist / Dental Clinic" },
      { value: "MedicalClinic", label: "MedicalClinic" },
      { value: "Physician", label: "Physician / Doctor" },
      { value: "Optician", label: "Optician / Eye Care" },
      { value: "Pharmacy", label: "Pharmacy" },
      { value: "VeterinaryCare", label: "VeterinaryCare / Animal Hospital" },
      { value: "DaySpa", label: "DaySpa / MedSpa" },
      { value: "HealthClub", label: "HealthClub / Gym & Fitness" },
    ],
  },
  {
    group: "Home Services & Contractors",
    types: [
      { value: "HomeAndConstructionBusiness", label: "Home & Construction (General)" },
      { value: "HVACBusiness", label: "HVACBusiness (Heating & Cooling)" },
      { value: "Plumber", label: "Plumber / Plumbing Service" },
      { value: "Electrician", label: "Electrician" },
      { value: "RoofingContractor", label: "RoofingContractor" },
      { value: "GeneralContractor", label: "GeneralContractor" },
      { value: "Locksmith", label: "Locksmith" },
      { value: "MovingCompany", label: "MovingCompany" },
      { value: "HousePainter", label: "HousePainter" },
    ],
  },
  {
    group: "Food, Hospitality, Salon & Retail",
    types: [
      { value: "Restaurant", label: "Restaurant" },
      { value: "CafeOrCoffeeShop", label: "CafeOrCoffeeShop" },
      { value: "Bakery", label: "Bakery" },
      { value: "HairSalon", label: "HairSalon / Barber" },
      { value: "BeautySalon", label: "BeautySalon" },
      { value: "AutoRepair", label: "AutoRepair / Mechanic" },
      { value: "AutoWash", label: "AutoWash / Detailing" },
      { value: "Store", label: "Retail Store" },
    ],
  },
];

export type HoursPresetId = "mon-fri-9-5" | "mon-sat-9-6" | "24-7" | "custom";

export type LocalBusinessSchemaInput = {
  businessType: string;
  name: string;
  description: string;
  url: string;
  telephone: string;
  email: string;
  priceRange: "$" | "$$" | "$$$" | "$$$$";
  imageUrl: string;
  logoUrl: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
  latitude: string;
  longitude: string;
  hasMapUrl: string;
  serviceAreasCsv: string;
  hoursPreset: HoursPresetId;
  customDaysCsv: string;
  opensTime: string;
  closesTime: string;
  sameAsLines: string;
  includeRating: boolean;
  ratingValue: string;
  reviewCount: string;
};

export type SchemaAuditCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export type LocalBusinessSchemaResult = {
  jsonLdObject: Record<string, unknown>;
  jsonString: string;
  scriptTagHtml: string;
  completenessScore: number;
  checks: SchemaAuditCheck[];
};

export const DEFAULT_LOCAL_SCHEMA_INPUT: LocalBusinessSchemaInput = {
  businessType: "Dentist",
  name: "Apex Dental & Implant Studio",
  description:
    "Family, cosmetic, and dental implant clinic in Austin, TX offering same-day emergency dental care, Invisalign, and sedation dentistry.",
  url: "https://apexdentalaustin.example.com",
  telephone: "+1-512-555-0194",
  email: "care@apexdentalaustin.example.com",
  priceRange: "$$",
  imageUrl: "https://apexdentalaustin.example.com/images/clinic-front.jpg",
  logoUrl: "https://apexdentalaustin.example.com/images/logo.png",
  streetAddress: "402 W 7th St, Suite 210",
  addressLocality: "Austin",
  addressRegion: "TX",
  postalCode: "78701",
  addressCountry: "US",
  latitude: "30.2701",
  longitude: "-97.7458",
  hasMapUrl: "https://www.google.com/maps?cid=1234567890",
  serviceAreasCsv: "Austin, Westlake Hills, Round Rock, Cedar Park, Barton Hills",
  hoursPreset: "mon-fri-9-5",
  customDaysCsv: "Monday, Tuesday, Wednesday, Thursday, Friday",
  opensTime: "08:30",
  closesTime: "17:30",
  sameAsLines:
    "https://www.facebook.com/apexdentalaustin\nhttps://www.instagram.com/apexdentalaustin\nhttps://www.yelp.com/biz/apex-dental-austin",
  includeRating: true,
  ratingValue: "4.9",
  reviewCount: "248",
};

export function buildLocalBusinessSchema(
  input: LocalBusinessSchemaInput,
): LocalBusinessSchemaResult {
  const cleanUrl = input.url.trim().replace(/\/$/, "");
  const entityId = cleanUrl ? `${cleanUrl}/#localbusiness` : "#localbusiness";

  const areas = input.serviceAreasCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const sameAs = input.sameAsLines
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s));

  let openingHoursSpecification: Array<Record<string, unknown>> = [];
  if (input.hoursPreset === "24-7") {
    openingHoursSpecification = [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
    ];
  } else if (input.hoursPreset === "mon-sat-9-6") {
    openingHoursSpecification = [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: input.opensTime || "09:00",
        closes: input.closesTime || "18:00",
      },
    ];
  } else {
    const days =
      input.hoursPreset === "custom"
        ? input.customDaysCsv
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean)
        : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    openingHoursSpecification = [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: days,
        opens: input.opensTime || "09:00",
        closes: input.closesTime || "17:00",
      },
    ];
  }

  const latNum = Number(input.latitude);
  const lngNum = Number(input.longitude);
  const hasValidGeo =
    input.latitude.trim() !== "" &&
    input.longitude.trim() !== "" &&
    Number.isFinite(latNum) &&
    Number.isFinite(lngNum);

  const jsonLdObject: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": input.businessType || "LocalBusiness",
    "@id": entityId,
    name: input.name.trim() || "Local Business",
    description: input.description.trim() || undefined,
    url: cleanUrl || undefined,
    telephone: input.telephone.trim() || undefined,
    email: input.email.trim() || undefined,
    priceRange: input.priceRange || "$$",
    image: input.imageUrl.trim() || undefined,
    logo: input.logoUrl.trim() || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: input.streetAddress.trim(),
      addressLocality: input.addressLocality.trim(),
      addressRegion: input.addressRegion.trim(),
      postalCode: input.postalCode.trim(),
      addressCountry: input.addressCountry.trim() || "US",
    },
  };

  if (hasValidGeo) {
    jsonLdObject.geo = {
      "@type": "GeoCoordinates",
      latitude: latNum,
      longitude: lngNum,
    };
  }

  if (input.hasMapUrl.trim()) {
    jsonLdObject.hasMap = input.hasMapUrl.trim();
  }

  if (areas.length > 0) {
    jsonLdObject.areaServed = areas.map((city) => ({
      "@type": "City",
      name: city,
    }));
  }

  if (openingHoursSpecification.length > 0) {
    jsonLdObject.openingHoursSpecification = openingHoursSpecification;
  }

  if (sameAs.length > 0) {
    jsonLdObject.sameAs = sameAs;
  }

  if (
    input.includeRating &&
    Number(input.ratingValue) > 0 &&
    Number(input.reviewCount) > 0
  ) {
    jsonLdObject.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: input.ratingValue.trim(),
      reviewCount: input.reviewCount.trim(),
      bestRating: "5",
      worstRating: "1",
    };
  }

  // Strip undefined keys
  const cleaned = JSON.parse(JSON.stringify(jsonLdObject));
  const jsonString = JSON.stringify(cleaned, null, 2);
  const scriptTagHtml = `<script type="application/ld+json">\n${jsonString}\n</script>`;

  const checks: SchemaAuditCheck[] = [
    {
      label: "Specific Industry @type",
      passed: input.businessType !== "LocalBusiness",
      detail:
        input.businessType !== "LocalBusiness"
          ? `Using specific Schema.org subtype '${input.businessType}'.`
          : "Tip: Pick a specific subtype (e.g. Dentist, HVACBusiness, LegalService) for stronger entity disambiguation.",
    },
    {
      label: "Complete NAP (Name, Address, Phone)",
      passed: Boolean(
        input.name.trim() &&
          input.streetAddress.trim() &&
          input.addressLocality.trim() &&
          input.telephone.trim(),
      ),
      detail: "Verifies streetAddress, addressLocality, and E.164/local telephone.",
    },
    {
      label: "GeoCoordinates (Latitude & Longitude)",
      passed: hasValidGeo,
      detail: hasValidGeo
        ? `Geo pin verified (${latNum}, ${lngNum}).`
        : "Add latitude & longitude so Google Maps and AI search engines pinpoint your exact coordinates.",
    },
    {
      label: "Service Area Cities (areaServed)",
      passed: areas.length >= 2,
      detail: `${areas.length} target service-area cities declared.`,
    },
    {
      label: "Entity Disambiguation Links (sameAs)",
      passed: sameAs.length >= 2,
      detail: `${sameAs.length} external authority profile URLs linked.`,
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const completenessScore = Math.round((passedCount / checks.length) * 100);

  return {
    jsonLdObject: cleaned,
    jsonString,
    scriptTagHtml,
    completenessScore,
    checks,
  };
}

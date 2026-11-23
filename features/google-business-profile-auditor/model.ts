export type GbpAuditInput = {
  businessName: string;
  primaryCategory: string;
  secondaryCategoriesCsv: string;
  cityAndState: string;
  serviceAreasCsv: string;
  description: string;
  servicesCsv: string;
  websiteUrl: string;
  appointmentUrl: string;
  reviewCount: number;
  averageRating: number;
  ownerReplyRatePercent: number;
  photoCount: number;
  postsPerMonth: number;
  qaSeedCount: number;
};

export type GbpCheckItem = {
  id: string;
  category: "Relevance" | "Prominence" | "Completeness" | "Conversion";
  title: string;
  status: "pass" | "warn" | "fail";
  score: number;
  maxScore: number;
  finding: string;
  fixAction: string;
};

export type GbpOptimizationPack = {
  optimizedDescription: string;
  recommendedCategories: string[];
  qaSeeds: Array<{ question: string; answer: string }>;
  weeklyPosts: Array<{
    type: "What's New" | "Offer" | "Service Spotlight";
    headline: string;
    body: string;
    ctaLabel: string;
  }>;
};

export type GbpAuditResult = {
  overallScore: number;
  pillarScores: {
    relevance: number;
    prominence: number;
    completeness: number;
    conversion: number;
  };
  checks: GbpCheckItem[];
  optimizationPack: GbpOptimizationPack;
};

export const DEFAULT_GBP_AUDIT_INPUT: GbpAuditInput = {
  businessName: "Apex Dental & Implant Studio",
  primaryCategory: "Dentist",
  secondaryCategoriesCsv:
    "Cosmetic Dentist, Dental Implants Periodontist, Emergency Dental Service, Pediatric Dentist",
  cityAndState: "Austin, TX",
  serviceAreasCsv: "Austin, Westlake Hills, Round Rock, Cedar Park",
  description:
    "Apex Dental & Implant Studio provides family dentistry, same-day dental crowns, Invisalign clear aligners, and dental implants in Austin, TX. Conveniently located downtown with evening appointments and direct insurance billing.",
  servicesCsv:
    "Dental Implants, Invisalign Clear Aligners, Emergency Tooth Extraction, Teeth Whitening, Porcelain Veneers, Routine Dental Cleaning",
  websiteUrl:
    "https://apexdentalaustin.example.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp",
  appointmentUrl:
    "https://apexdentalaustin.example.com/book?utm_source=google&utm_medium=organic&utm_campaign=gbp_booking",
  reviewCount: 142,
  averageRating: 4.9,
  ownerReplyRatePercent: 92,
  photoCount: 38,
  postsPerMonth: 4,
  qaSeedCount: 5,
};

export function buildDeterministicGbpPack(
  input: GbpAuditInput,
): GbpOptimizationPack {
  const biz = input.businessName.trim() || "Our Local Business";
  const cat = input.primaryCategory.trim() || "Local Service Provider";
  const city = input.cityAndState.trim() || "your local area";
  const areas = input.serviceAreasCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const services = input.servicesCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const topServices =
    services.length > 0
      ? services.slice(0, 5).join(", ")
      : `specialized ${cat.toLowerCase()} solutions, consultations, and same-week appointments`;
  const areaPhrase =
    areas.length > 1
      ? `proudly serving ${areas.slice(0, 4).join(", ")}`
      : `serving clients across ${city}`;

  const rawDesc = `${biz} is a trusted ${cat.toLowerCase()} in ${city}, ${areaPhrase}. We specialize in ${topServices} tailored to your goals, schedule, and budget. Every visit includes transparent pricing, modern equipment, and personalized care from our experienced local team. Contact ${biz} today or book online for fast, dependable service in ${city}.`;
  const optimizedDescription = rawDesc.slice(0, 745);

  const existingSec = input.secondaryCategoriesCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const recommendedCategories =
    existingSec.length >= 3
      ? existingSec
      : [
          ...existingSec,
          `${cat} Service`,
          `Emergency ${cat} Service`,
          `${cat} Consultant`,
          `Local ${cat} Specialist`,
        ].slice(0, 5);

  const s1 = services[0] || `primary ${cat.toLowerCase()} service`;
  const s2 = services[1] || `emergency ${cat.toLowerCase()} appointments`;

  const qaSeeds = [
    {
      question: `Do you offer same-week or emergency appointments for ${s1.toLowerCase()} in ${city}?`,
      answer: `Yes! At ${biz}, we reserve daily slots for urgent requests and same-week consultations in ${city}. You can call our office directly or use our online booking link to reserve a convenient time.`,
    },
    {
      question: `Which neighborhoods around ${city} does ${biz} serve?`,
      answer: `Our team serves customers throughout ${city}${areas.length ? `, including ${areas.join(", ")}` : ""}. Free parking and flexible scheduling are available for all visitors.`,
    },
    {
      question: `Do you provide upfront pricing estimates before starting ${s1.toLowerCase()}?`,
      answer: `Absolutely. Every appointment at ${biz} begins with a transparent assessment and written cost breakdown so there are never any surprises.`,
    },
    {
      question: `What makes ${biz} different from other ${cat.toLowerCase()} providers in ${city}?`,
      answer: `We combine ${topServices} under one roof with a ${input.averageRating || 4.9}-star customer satisfaction track record and personalized follow-up care.`,
    },
  ];

  const weeklyPosts: GbpOptimizationPack["weeklyPosts"] = [
    {
      type: "Service Spotlight",
      headline: `Looking for Trusted ${s1} in ${city}?`,
      body: `Whether you need ${s1.toLowerCase()} or ${s2.toLowerCase()}, our team at ${biz} in ${city} delivers clear timelines, upfront pricing, and proven results. Tap below to schedule your consultation this week!`,
      ctaLabel: "Book Online",
    },
    {
      type: "Offer",
      headline: `New Client Priority Consultation in ${city}`,
      body: `First time visiting ${biz}? Book your ${s1.toLowerCase()} assessment in ${city} this month for priority scheduling and a complete custom action plan.`,
      ctaLabel: "Claim Offer",
    },
    {
      type: "What's New",
      headline: `Serving ${areas.slice(0, 3).join(", ") || city} With Expanded Hours`,
      body: `We have added new appointment availability at ${biz} to better serve clients across ${city}. Check our live calendar to reserve your preferred time slot.`,
      ctaLabel: "Learn More",
    },
  ];

  return {
    optimizedDescription,
    recommendedCategories,
    qaSeeds,
    weeklyPosts,
  };
}

export function auditGoogleBusinessProfile(
  input: GbpAuditInput,
): GbpAuditResult {
  const secCats = input.secondaryCategoriesCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const services = input.servicesCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const descLen = input.description.trim().length;
  const cityToken = (input.cityAndState.split(",")[0] || "")
    .trim()
    .toLowerCase();
  const descHasCity =
    cityToken.length > 1 &&
    input.description.toLowerCase().includes(cityToken);
  const hasUtm = /utm_source=/i.test(input.websiteUrl);
  const nameLooksStuffed =
    (input.businessName.match(/\|/g)?.length || 0) >= 2 ||
    input.businessName.length > 68;

  const checks: GbpCheckItem[] = [
    {
      id: "name-compliance",
      category: "Relevance",
      title: "GBP Business Title Policy & Suspension Safety",
      status: !input.businessName.trim()
        ? "fail"
        : nameLooksStuffed
          ? "warn"
          : "pass",
      score: !input.businessName.trim() ? 0 : nameLooksStuffed ? 5 : 10,
      maxScore: 10,
      finding: nameLooksStuffed
        ? "Business title exceeds 68 chars or contains multiple pipe separators (keyword stuffing suspension risk)."
        : `Clean brand title (${input.businessName.trim().length} chars).`,
      fixAction:
        "Use your real-world legal/storefront name without stuffing extra city lists or pipe symbols.",
    },
    {
      id: "primary-cat",
      category: "Relevance",
      title: "Primary GBP Category Precision",
      status: input.primaryCategory.trim().length >= 3 ? "pass" : "fail",
      score: input.primaryCategory.trim().length >= 3 ? 15 : 0,
      maxScore: 15,
      finding: input.primaryCategory.trim()
        ? `Primary category set to '${input.primaryCategory.trim()}'.`
        : "Missing primary Google Business Profile category.",
      fixAction:
        "Select the single most specific GBP primary category matching your core revenue service.",
    },
    {
      id: "secondary-cats",
      category: "Relevance",
      title: "Secondary Categories Coverage (Target: 3–6)",
      status:
        secCats.length >= 3 ? "pass" : secCats.length >= 1 ? "warn" : "fail",
      score: secCats.length >= 3 ? 10 : secCats.length >= 1 ? 5 : 0,
      maxScore: 10,
      finding: `${secCats.length} secondary categories configured.`,
      fixAction:
        "Add 3 to 6 relevant secondary categories to unlock additional GBP service menus and query triggers.",
    },
    {
      id: "description-depth",
      category: "Completeness",
      title: "750-Character Description & Local Entity Mention",
      status:
        descLen >= 250 && descLen <= 750 && descHasCity
          ? "pass"
          : descLen >= 100
            ? "warn"
            : "fail",
      score:
        descLen >= 250 && descLen <= 750 && descHasCity
          ? 12
          : descLen >= 100
            ? 7
            : 2,
      maxScore: 12,
      finding: `${descLen} / 750 chars used · ${descHasCity ? "Includes target city" : "Missing target city name"}.`,
      fixAction:
        "Use 350–700 characters naturally mentioning your primary category, top services, and city.",
    },
    {
      id: "services-catalog",
      category: "Completeness",
      title: "Explicit GBP Services Catalog (Target: 5+)",
      status:
        services.length >= 5
          ? "pass"
          : services.length >= 2
            ? "warn"
            : "fail",
      score: services.length >= 5 ? 10 : services.length >= 2 ? 5 : 0,
      maxScore: 10,
      finding: `${services.length} structured services listed.`,
      fixAction:
        "Populate at least 5–10 individual services with 200-char descriptions inside GBP.",
    },
    {
      id: "utm-attribution",
      category: "Conversion",
      title: "Website & Booking Link UTM Attribution",
      status:
        hasUtm && input.appointmentUrl.trim()
          ? "pass"
          : input.websiteUrl.trim()
            ? "warn"
            : "fail",
      score:
        hasUtm && input.appointmentUrl.trim()
          ? 10
          : input.websiteUrl.trim()
            ? 5
            : 0,
      maxScore: 10,
      finding: hasUtm
        ? "Website URL includes UTM tracking parameters for Search Console & GA4 separation."
        : "Website URL lacks ?utm_source=google&utm_medium=organic&utm_campaign=gbp tracking.",
      fixAction:
        "Append UTM parameters to your GBP website and booking URLs so Local Pack clicks are tracked accurately in GA4 and GSC.",
    },
    {
      id: "reviews-prominence",
      category: "Prominence",
      title: "Review Volume & Star Rating Benchmark",
      status:
        input.reviewCount >= 50 && input.averageRating >= 4.5
          ? "pass"
          : input.reviewCount >= 15
            ? "warn"
            : "fail",
      score:
        input.reviewCount >= 50 && input.averageRating >= 4.5
          ? 15
          : input.reviewCount >= 15
            ? 9
            : 3,
      maxScore: 15,
      finding: `${input.reviewCount} reviews at ${input.averageRating.toFixed(1)}★ average.`,
      fixAction:
        "Use our Google Review Link & QR Poster Generator to build steady weekly review velocity above 4.6★.",
    },
    {
      id: "review-replies",
      category: "Prominence",
      title: "Owner Review Response Rate (Target: 90%+)",
      status:
        input.ownerReplyRatePercent >= 85
          ? "pass"
          : input.ownerReplyRatePercent >= 50
            ? "warn"
            : "fail",
      score:
        input.ownerReplyRatePercent >= 85
          ? 8
          : input.ownerReplyRatePercent >= 50
            ? 4
            : 0,
      maxScore: 8,
      finding: `${input.ownerReplyRatePercent}% of customer reviews have an owner reply.`,
      fixAction:
        "Reply to 100% of reviews within 48 hours using our Google Review Response Generator.",
    },
    {
      id: "visual-media",
      category: "Conversion",
      title: "Exterior, Interior & Team Photo Coverage (Target: 25+)",
      status:
        input.photoCount >= 25
          ? "pass"
          : input.photoCount >= 10
            ? "warn"
            : "fail",
      score: input.photoCount >= 25 ? 5 : input.photoCount >= 10 ? 3 : 0,
      maxScore: 5,
      finding: `${input.photoCount} photos uploaded.`,
      fixAction:
        "Upload at least 25 authentic storefront, team, equipment, and before/after photos.",
    },
    {
      id: "posts-qa",
      category: "Conversion",
      title: "Active GBP Updates & Pre-Seeded Owner Q&As",
      status:
        input.postsPerMonth >= 2 && input.qaSeedCount >= 3
          ? "pass"
          : input.postsPerMonth >= 1 || input.qaSeedCount >= 1
            ? "warn"
            : "fail",
      score:
        input.postsPerMonth >= 2 && input.qaSeedCount >= 3
          ? 5
          : input.postsPerMonth >= 1 || input.qaSeedCount >= 1
            ? 3
            : 0,
      maxScore: 5,
      finding: `${input.postsPerMonth} posts/month · ${input.qaSeedCount} Q&As seeded.`,
      fixAction:
        "Publish 1 GBP update per week and pre-seed your top 5 buyer questions in the Q&A section.",
    },
  ];

  const calcPillar = (cat: GbpCheckItem["category"]) => {
    const items = checks.filter((c) => c.category === cat);
    const earned = items.reduce((a, b) => a + b.score, 0);
    const max = items.reduce((a, b) => a + b.maxScore, 0) || 1;
    return Math.round((earned / max) * 100);
  };

  const totalEarned = checks.reduce((a, b) => a + b.score, 0);
  const totalMax = checks.reduce((a, b) => a + b.maxScore, 0) || 100;

  return {
    overallScore: Math.round((totalEarned / totalMax) * 100),
    pillarScores: {
      relevance: calcPillar("Relevance"),
      prominence: calcPillar("Prominence"),
      completeness: calcPillar("Completeness"),
      conversion: calcPillar("Conversion"),
    },
    checks,
    optimizationPack: buildDeterministicGbpPack(input),
  };
}

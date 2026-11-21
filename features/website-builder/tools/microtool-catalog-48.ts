/**
 * DoItWithAI Website Builder — 48-Tool Master Catalog Across 8 Major Verticals (v1.1)
 * 42 Builder-Exclusive Niche Tools + 6 White-Label SEO/Marketing Tools
 * All tools run on the 3 Master Engines (calculator_ast, scored_quiz, ai_prompt_wrapper)
 * with zero raw client code execution and $0.00 runtime for Calculators & Quizzes.
 */

export type MicroToolEngineType = "calculator_ast" | "scored_quiz" | "ai_prompt_wrapper";

export type MicroToolVerticalId =
  | "real-estate-finance"
  | "home-services-solar"
  | "health-fitness-coaching"
  | "education-courses-creators"
  | "ecommerce-retail"
  | "b2b-saas-consultants"
  | "legal-hr-events-travel"
  | "white-label-seo-agency";

export interface CalculatorInputField {
  id: string;
  label: string;
  unit?: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export interface CalculatorOutputMetric {
  id: string;
  label: string;
  formula: string;
  format: "currency" | "percent" | "number" | "years" | "months";
  highlight?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: Array<{ label: string; points: number }>;
}

export interface QuizScoreTier {
  minScore: number;
  maxScore: number;
  badge: string;
  headline: string;
  recommendation: string;
}

export interface AiWrapperField {
  id: string;
  label: string;
  placeholder: string;
  defaultValue: string;
  multiline?: boolean;
}

export interface BuilderMicroToolConfig {
  slug: string;
  title: string;
  vertical: MicroToolVerticalId;
  verticalLabel: string;
  engine: MicroToolEngineType;
  exclusiveToBuilder: boolean;
  eyebrow: string;
  summary: string;
  leadMagnetHook: string;
  ctaLabel: string;
  badges: string[];
  calculator?: {
    inputs: CalculatorInputField[];
    outputs: CalculatorOutputMetric[];
  };
  quiz?: {
    questions: QuizQuestion[];
    tiers: QuizScoreTier[];
  };
  aiWrapper?: {
    fields: AiWrapperField[];
    systemInstruction: string;
    sampleOutputTitle: string;
    sampleOutputBullets: string[];
  };
}

export const MICROTOOL_VERTICALS: Array<{
  id: MicroToolVerticalId;
  label: string;
  badge: string;
}> = [
  { id: "real-estate-finance", label: "Real Estate & Finance", badge: "6 Exclusive" },
  { id: "home-services-solar", label: "Home Services, Solar & Trades", badge: "6 Exclusive" },
  { id: "health-fitness-coaching", label: "Health, Fitness & Coaching", badge: "6 Exclusive" },
  { id: "education-courses-creators", label: "Education, Courses & Creators", badge: "6 Exclusive" },
  { id: "ecommerce-retail", label: "E-Commerce & Retail", badge: "6 Exclusive" },
  { id: "b2b-saas-consultants", label: "B2B SaaS & Consultants", badge: "6 Exclusive" },
  { id: "legal-hr-events-travel", label: "Legal, HR, Events & Travel", badge: "6 Exclusive" },
  { id: "white-label-seo-agency", label: "White-Label Marketing & SEO", badge: "6 White-Label" },
];

function makeCalcTool(params: {
  slug: string;
  title: string;
  vertical: MicroToolVerticalId;
  verticalLabel: string;
  exclusive?: boolean;
  eyebrow: string;
  summary: string;
  leadMagnetHook: string;
  badges: string[];
  inputs: CalculatorInputField[];
  outputs: CalculatorOutputMetric[];
}): BuilderMicroToolConfig {
  return {
    slug: params.slug,
    title: params.title,
    vertical: params.vertical,
    verticalLabel: params.verticalLabel,
    engine: "calculator_ast",
    exclusiveToBuilder: params.exclusive ?? true,
    eyebrow: params.eyebrow,
    summary: params.summary,
    leadMagnetHook: params.leadMagnetHook,
    ctaLabel: "Calculate Instant Breakdown",
    badges: params.badges,
    calculator: {
      inputs: params.inputs,
      outputs: params.outputs,
    },
  };
}

function makeQuizTool(params: {
  slug: string;
  title: string;
  vertical: MicroToolVerticalId;
  verticalLabel: string;
  exclusive?: boolean;
  eyebrow: string;
  summary: string;
  leadMagnetHook: string;
  badges: string[];
  questions: QuizQuestion[];
}): BuilderMicroToolConfig {
  return {
    slug: params.slug,
    title: params.title,
    vertical: params.vertical,
    verticalLabel: params.verticalLabel,
    engine: "scored_quiz",
    exclusiveToBuilder: params.exclusive ?? true,
    eyebrow: params.eyebrow,
    summary: params.summary,
    leadMagnetHook: params.leadMagnetHook,
    ctaLabel: "Get My Personalized Score & Roadmap",
    badges: params.badges,
    quiz: {
      questions: params.questions,
      tiers: [
        {
          minScore: 0,
          maxScore: 45,
          badge: "FOUNDATION STAGE",
          headline: "High-Leverage Quick Wins Available",
          recommendation: "Focus on core fundamentals first to unlock an immediate 30-45% improvement before scaling.",
        },
        {
          minScore: 46,
          maxScore: 78,
          badge: "GROWTH READY",
          headline: "Strong Baseline With Optimization Gaps",
          recommendation: "Your core foundation is solid. Tightening 2-3 conversion bottlenecks will compound results.",
        },
        {
          minScore: 79,
          maxScore: 100,
          badge: "TOP-TIER PERFORMER",
          headline: "Ready for Full-Scale Acceleration",
          recommendation: "You are operating in the top decile. Automate repeatable workflows and expand capacity.",
        },
      ],
    },
  };
}

function makeAiTool(params: {
  slug: string;
  title: string;
  vertical: MicroToolVerticalId;
  verticalLabel: string;
  exclusive?: boolean;
  eyebrow: string;
  summary: string;
  leadMagnetHook: string;
  badges: string[];
  fields: AiWrapperField[];
  systemInstruction: string;
  sampleOutputTitle: string;
  sampleOutputBullets: string[];
}): BuilderMicroToolConfig {
  return {
    slug: params.slug,
    title: params.title,
    vertical: params.vertical,
    verticalLabel: params.verticalLabel,
    engine: "ai_prompt_wrapper",
    exclusiveToBuilder: params.exclusive ?? true,
    eyebrow: params.eyebrow,
    summary: params.summary,
    leadMagnetHook: params.leadMagnetHook,
    ctaLabel: "Generate Custom Draft",
    badges: params.badges,
    aiWrapper: {
      fields: params.fields,
      systemInstruction: params.systemInstruction,
      sampleOutputTitle: params.sampleOutputTitle,
      sampleOutputBullets: params.sampleOutputBullets,
    },
  };
}

export const BUILDER_48_MICROTOOLS_CATALOG: BuilderMicroToolConfig[] = [
  // 1. REAL ESTATE & FINANCE (6)
  makeCalcTool({
    slug: "mortgage-emi-payment-calculator",
    title: "Mortgage & Monthly EMI Calculator",
    vertical: "real-estate-finance",
    verticalLabel: "Real Estate & Finance",
    eyebrow: "REAL ESTATE FINANCE · $0 RUNTIME ENGINE",
    summary: "Calculate exact monthly mortgage payments, down-payment ratios, and total interest over your loan term.",
    leadMagnetHook: "Email me the full 30-year amortization schedule PDF",
    badges: ["Monthly EMI", "Down Payment Ratio", "Total Interest"],
    inputs: [
      { id: "homePrice", label: "Property Price", unit: "$", min: 50000, max: 3000000, step: 10000, defaultValue: 450000 },
      { id: "downPct", label: "Down Payment", unit: "%", min: 3, max: 60, step: 1, defaultValue: 20 },
      { id: "rate", label: "Annual Interest Rate", unit: "%", min: 1, max: 15, step: 0.25, defaultValue: 6.5 },
      { id: "years", label: "Loan Term", unit: "yrs", min: 5, max: 30, step: 5, defaultValue: 30 },
    ],
    outputs: [
      { id: "loanAmount", label: "Financed Loan Principal", formula: "round(homePrice * (1 - downPct / 100), 0)", format: "currency" },
      { id: "monthlyPayment", label: "Estimated Monthly Payment", formula: "round((homePrice * (1 - downPct / 100) * (rate / 1200)) / (1 - pow(1 + rate / 1200, -years * 12)), 0)", format: "currency", highlight: true },
      { id: "totalInterest", label: "Total Interest Over Term", formula: "round(((homePrice * (1 - downPct / 100) * (rate / 1200)) / (1 - pow(1 + rate / 1200, -years * 12))) * years * 12 - (homePrice * (1 - downPct / 100)), 0)", format: "currency" },
    ],
  }),
  makeCalcTool({
    slug: "rent-vs-buy-break-even-estimator",
    title: "Rent vs. Buy Break-Even Estimator",
    vertical: "real-estate-finance",
    verticalLabel: "Real Estate & Finance",
    eyebrow: "HOMEBUYER DECISION TOOL · $0 RUNTIME",
    summary: "Compare 5-year net housing costs between renting and buying with appreciation and tax equity factored in.",
    leadMagnetHook: "Send custom neighborhood rent-vs-buy comparison report",
    badges: ["5-Year Net Equity", "Rent Escalation", "Break-Even Year"],
    inputs: [
      { id: "monthlyRent", label: "Current Monthly Rent", unit: "$", min: 500, max: 12000, step: 100, defaultValue: 2400 },
      { id: "homePrice", label: "Target Home Price", unit: "$", min: 80000, max: 2500000, step: 10000, defaultValue: 420000 },
      { id: "appreciation", label: "Annual Appreciation", unit: "%", min: 1, max: 10, step: 0.5, defaultValue: 4 },
    ],
    outputs: [
      { id: "fiveYrRent", label: "5-Year Cumulative Rent Spend", formula: "round(monthlyRent * 60 * 1.12, 0)", format: "currency" },
      { id: "fiveYrEquity", label: "5-Year Projected Home Appreciation", formula: "round(homePrice * (pow(1 + appreciation / 100, 5) - 1), 0)", format: "currency", highlight: true },
      { id: "netAdvantage", label: "Projected 5-Year Ownership Advantage", formula: "round(homePrice * (pow(1 + appreciation / 100, 5) - 1) - (homePrice * 0.06), 0)", format: "currency" },
    ],
  }),
  makeCalcTool({
    slug: "rental-yield-cap-rate-calculator",
    title: "Rental Yield & Cap Rate Calculator",
    vertical: "real-estate-finance",
    verticalLabel: "Real Estate & Finance",
    eyebrow: "INVESTOR CASHFLOW ENGINE · $0 RUNTIME",
    summary: "Evaluate gross rental yield, net operating income (NOI), and cap rate for residential or commercial properties.",
    leadMagnetHook: "Download investor underwriting spreadsheet + local rent comps",
    badges: ["Cap Rate %", "Net Operating Income", "Annual Cashflow"],
    inputs: [
      { id: "purchasePrice", label: "Purchase Price", unit: "$", min: 60000, max: 5000000, step: 10000, defaultValue: 350000 },
      { id: "monthlyRent", label: "Gross Monthly Rent", unit: "$", min: 500, max: 35000, step: 100, defaultValue: 2900 },
      { id: "expenseRatio", label: "Operating Expense %", unit: "%", min: 15, max: 60, step: 1, defaultValue: 32 },
    ],
    outputs: [
      { id: "annualNoi", label: "Annual Net Operating Income (NOI)", formula: "round(monthlyRent * 12 * (1 - expenseRatio / 100), 0)", format: "currency", highlight: true },
      { id: "capRate", label: "Net Cap Rate", formula: "round((monthlyRent * 12 * (1 - expenseRatio / 100) / purchasePrice) * 100, 2)", format: "percent" },
      { id: "grossYield", label: "Gross Rental Yield", formula: "round((monthlyRent * 12 / purchasePrice) * 100, 2)", format: "percent" },
    ],
  }),
  makeCalcTool({
    slug: "mortgage-refinance-savings-calculator",
    title: "Refinance Break-Even & Savings Calculator",
    vertical: "real-estate-finance",
    verticalLabel: "Real Estate & Finance",
    eyebrow: "REFINANCE ANALYZER · $0 RUNTIME",
    summary: "Calculate how many months it takes for lower interest savings to pay back closing costs.",
    leadMagnetHook: "Lock your custom refinance rate sheet via email",
    badges: ["Break-Even Months", "Monthly Savings", "5-Year Net Gain"],
    inputs: [
      { id: "balance", label: "Remaining Loan Balance", unit: "$", min: 50000, max: 2000000, step: 10000, defaultValue: 320000 },
      { id: "rateDrop", label: "Interest Rate Reduction", unit: "%", min: 0.25, max: 5, step: 0.25, defaultValue: 1.5 },
      { id: "closingCosts", label: "Refinance Closing Costs", unit: "$", min: 1000, max: 25000, step: 250, defaultValue: 4200 },
    ],
    outputs: [
      { id: "monthlySavings", label: "Estimated Monthly Interest Savings", formula: "round((balance * (rateDrop / 100)) / 12, 0)", format: "currency", highlight: true },
      { id: "breakEvenMonths", label: "Closing Cost Break-Even Window", formula: "round(closingCosts / max(1, (balance * (rateDrop / 100)) / 12), 1)", format: "months" },
      { id: "fiveYearNet", label: "5-Year Net Savings After Costs", formula: "round(((balance * (rateDrop / 100)) / 12) * 60 - closingCosts, 0)", format: "currency" },
    ],
  }),
  makeQuizTool({
    slug: "first-time-homebuyer-readiness-quiz",
    title: "Homebuyer Financial Readiness Audit",
    vertical: "real-estate-finance",
    verticalLabel: "Real Estate & Finance",
    eyebrow: "INTERACTIVE BUYER QUIZ · $0 RUNTIME",
    summary: "Score your down-payment reserve, debt-to-income health, and pre-approval readiness in 60 seconds.",
    leadMagnetHook: "Send my personalized pre-approval checklist & lender guide",
    badges: ["DTI Assessment", "Credit Tier", "Pre-Approval Score"],
    questions: [
      { id: "q1", question: "How much of your target down payment + 3-month reserve is saved?", options: [{ label: "Under 5%", points: 10 }, { label: "10% to 15%", points: 25 }, { label: "20%+ plus emergency buffer", points: 35 }] },
      { id: "q2", question: "What is your approximate credit score tier?", options: [{ label: "Building (<640)", points: 10 }, { label: "Good (640-739)", points: 25 }, { label: "Excellent (740+)", points: 35 }] },
      { id: "q3", question: "What share of monthly gross income goes to existing debt?", options: [{ label: "Over 40%", points: 10 }, { label: "20% to 35%", points: 20 }, { label: "Under 20%", points: 30 }] },
    ],
  }),
  makeAiTool({
    slug: "mls-property-listing-copy-generator",
    title: "MLS Property Listing & Social Copy AI",
    vertical: "real-estate-finance",
    verticalLabel: "Real Estate & Finance",
    eyebrow: "REAL ESTATE COPYWRITING ENGINE",
    summary: "Turn raw property specs into high-converting MLS descriptions, luxury headlines, and Instagram open-house captions.",
    leadMagnetHook: "Email all 5 listing variations + downloadable open-house flyer copy",
    badges: ["MLS Description", "Luxury Hook", "Open House Post"],
    fields: [
      { id: "specs", label: "Property Specs (Beds, Baths, SqFt, Neighborhood)", placeholder: "4 bed, 3 bath, 2,850 sqft in Austin Hills", defaultValue: "4 Bed, 3 Bath, 2,850 SqFt modern craftsman in Austin Hills with solar roof & chef kitchen" },
      { id: "buyerPersona", label: "Target Buyer Persona", placeholder: "Remote tech families / downsizers", defaultValue: "Growing families seeking turnkey indoor-outdoor living and top school district" },
    ],
    systemInstruction: "Write a high-converting MLS property listing with 3 headline hooks, a 140-word architectural narrative, and 5 bulleted lifestyle highlights.",
    sampleOutputTitle: "Turnkey Modern Craftsman With Chef's Kitchen & Private Solar Sanctuary",
    sampleOutputBullets: [
      "Headline Hook: Architectural warmth meets zero-bill solar efficiency in the heart of Austin Hills.",
      "MLS Narrative: Spanning 2,850 sq ft across an open-concept floorplan, this 4-bedroom residence pairs custom white-oak cabinetry with effortless indoor-outdoor entertaining.",
      "Social Callout: Private tour slots open this Saturday — request the full disclosure packet & floorplan.",
    ],
  }),

  // 2. HOME SERVICES, SOLAR & TRADES (6)
  makeCalcTool({
    slug: "solar-panel-savings-payback-calculator",
    title: "Solar Savings & Payback Period Calculator",
    vertical: "home-services-solar",
    verticalLabel: "Home Services, Solar & Trades",
    eyebrow: "SOLAR ROI ESTIMATOR · $0 RUNTIME",
    summary: "Estimate system size (kW), 25-year utility savings, and net payback period based on your monthly electric bill.",
    leadMagnetHook: "Get a custom roof satellite layout & itemized solar quote",
    badges: ["System Size (kW)", "Payback Years", "25-Year Savings"],
    inputs: [
      { id: "monthlyBill", label: "Average Monthly Electric Bill", unit: "$", min: 50, max: 1500, step: 10, defaultValue: 260 },
      { id: "sunHours", label: "Peak Daily Sun Hours", unit: "hrs", min: 3, max: 7, step: 0.5, defaultValue: 5.5 },
      { id: "offsetPct", label: "Target Bill Offset", unit: "%", min: 50, max: 100, step: 5, defaultValue: 95 },
    ],
    outputs: [
      { id: "systemKw", label: "Recommended Solar Array Size (kW)", formula: "round((monthlyBill * (offsetPct / 100)) / (sunHours * 4.2), 1)", format: "number" },
      { id: "annualSavings", label: "First-Year Utility Bill Savings", formula: "round(monthlyBill * 12 * (offsetPct / 100), 0)", format: "currency", highlight: true },
      { id: "paybackYears", label: "Estimated Net Payback Window", formula: "round((((monthlyBill * (offsetPct / 100)) / (sunHours * 4.2)) * 1850) / max(1, monthlyBill * 12 * (offsetPct / 100)), 1)", format: "years" },
    ],
  }),
  makeCalcTool({
    slug: "hvac-tonnage-replacement-cost-estimator",
    title: "HVAC Tonnage & Replacement Cost Estimator",
    vertical: "home-services-solar",
    verticalLabel: "Home Services, Solar & Trades",
    eyebrow: "HVAC SIZING ENGINE · $0 RUNTIME",
    summary: "Calculate required cooling tonnage, BTU capacity, and turnkey installation estimate from square footage.",
    leadMagnetHook: "Unlock $500 seasonal installation rebate + exact load sheet",
    badges: ["Tonnage Sizing", "BTU Capacity", "SEER2 Savings"],
    inputs: [
      { id: "sqft", label: "Conditioned Home Square Footage", unit: "sqft", min: 600, max: 6500, step: 100, defaultValue: 2200 },
      { id: "ceilingFt", label: "Average Ceiling Height", unit: "ft", min: 8, max: 14, step: 1, defaultValue: 9 },
      { id: "seerTier", label: "Target Efficiency Tier (SEER2)", unit: "SEER", min: 14, max: 22, step: 2, defaultValue: 16 },
    ],
    outputs: [
      { id: "tons", label: "Recommended System Capacity (Tons)", formula: "round((sqft * (ceilingFt / 8)) / 550, 1)", format: "number", highlight: true },
      { id: "estimatedCost", label: "Estimated Turnkey Install Budget", formula: "round(((sqft * (ceilingFt / 8)) / 550) * (1850 + (seerTier - 14) * 180), 0)", format: "currency" },
      { id: "annualCoolingSave", label: "Projected Annual Efficiency Savings", formula: "round(sqft * 0.42 * ((seerTier - 12) / 10), 0)", format: "currency" },
    ],
  }),
  makeCalcTool({
    slug: "roofing-painting-sqft-instant-quoter",
    title: "Roofing & Exterior Sq-Ft Instant Quoter",
    vertical: "home-services-solar",
    verticalLabel: "Home Services, Solar & Trades",
    eyebrow: "CONTRACTOR INSTANT QUOTE · $0 RUNTIME",
    summary: "Give homeowners an instant material + labor estimate based on footprint, pitch multiplier, and material tier.",
    leadMagnetHook: "Book a free 15-minute drone measurement & lock quote",
    badges: ["Roof Squares", "Material + Labor", "Pitch Multiplier"],
    inputs: [
      { id: "footprintSqft", label: "Home Footprint Area", unit: "sqft", min: 500, max: 6000, step: 100, defaultValue: 2000 },
      { id: "pitchFactor", label: "Slope / Pitch Multiplier", unit: "x", min: 1.05, max: 1.45, step: 0.05, defaultValue: 1.2 },
      { id: "ratePerSqft", label: "Material Grade Rate / SqFt", unit: "$", min: 4, max: 16, step: 0.5, defaultValue: 6.5 },
    ],
    outputs: [
      { id: "totalSurface", label: "Total Estimated Surface SqFt", formula: "round(footprintSqft * pitchFactor, 0)", format: "number" },
      { id: "projectEstimate", label: "Estimated Turnkey Project Total", formula: "round(footprintSqft * pitchFactor * ratePerSqft, 0)", format: "currency", highlight: true },
      { id: "roofSquares", label: "Total Material Squares (100 sqft)", formula: "round((footprintSqft * pitchFactor) / 100, 1)", format: "number" },
    ],
  }),
  makeQuizTool({
    slug: "home-remodel-project-scope-quiz",
    title: "Instant Home Remodel Scope & Budget Quiz",
    vertical: "home-services-solar",
    verticalLabel: "Home Services, Solar & Trades",
    eyebrow: "LEAD QUALIFICATION QUIZ · $0 RUNTIME",
    summary: "Qualify remodeling leads by timeline, structural changes, and finish level before booking on-site estimates.",
    leadMagnetHook: "Receive your custom room-by-room budget range & timeline guide",
    badges: ["Scope Tier", "Permit Check", "Timeline Estimate"],
    questions: [
      { id: "q1", question: "Are you moving plumbing, gas lines, or load-bearing walls?", options: [{ label: "Cosmetic refresh only", points: 35 }, { label: "Minor layout tweak", points: 25 }, { label: "Full structural reconfiguration", points: 15 }] },
      { id: "q2", question: "When do you want construction to start?", options: [{ label: "Within 30 days", points: 35 }, { label: "1 to 3 months", points: 25 }, { label: "Just researching ideas", points: 10 }] },
      { id: "q3", question: "Are designs and material selections already finalized?", options: [{ label: "Yes, ready to build", points: 30 }, { label: "Need design-build help", points: 25 }, { label: "Starting from scratch", points: 15 }] },
    ],
  }),
  makeQuizTool({
    slug: "seasonal-home-maintenance-health-audit",
    title: "Seasonal Home Maintenance & Efficiency Audit",
    vertical: "home-services-solar",
    verticalLabel: "Home Services, Solar & Trades",
    eyebrow: "PREVENTIVE HOME AUDIT · $0 RUNTIME",
    summary: "Diagnose insulation, HVAC filter, gutter, and water-heater risk factors before peak winter or summer weather.",
    leadMagnetHook: "Download the 24-point seasonal inspection checklist PDF",
    badges: ["Energy Loss Check", "Safety Score", "Priority Fixes"],
    questions: [
      { id: "q1", question: "When was your HVAC system last professionally serviced?", options: [{ label: "Within 6 months", points: 35 }, { label: "1-2 years ago", points: 20 }, { label: "Over 2 years / unsure", points: 10 }] },
      { id: "q2", question: "How old is your roof and water heater?", options: [{ label: "Under 7 years", points: 35 }, { label: "8 to 14 years", points: 20 }, { label: "15+ years", points: 10 }] },
      { id: "q3", question: "Do you notice uneven room temperatures or drafty windows?", options: [{ label: "No, consistent comfort", points: 30 }, { label: "Minor hot/cold spots", points: 20 }, { label: "Significant drafts & high bills", points: 10 }] },
    ],
  }),
  makeAiTool({
    slug: "local-service-review-reply-estimate-writer",
    title: "Local Contractor Quote & Review Reply AI",
    vertical: "home-services-solar",
    verticalLabel: "Home Services, Solar & Trades",
    eyebrow: "LOCAL SERVICE COMMUNICATION AI",
    summary: "Draft polite, trust-building Google Review replies and clear scope-of-work estimate summaries in seconds.",
    leadMagnetHook: "Get our 15 top-converting homeowner follow-up templates",
    badges: ["Google Review Reply", "Scope Summary", "Local SEO Keywords"],
    fields: [
      { id: "serviceType", label: "Service Performed & City", placeholder: "Solar battery backup install in Islamabad / Dallas", defaultValue: "10kW hybrid solar & lithium battery backup installation" },
      { id: "customerNote", label: "Customer Review or Job Notes", placeholder: "Crew finished on time, clean wiring...", defaultValue: "The crew finished in one day, explained the app clearly, and our bill dropped 85%." },
    ],
    systemInstruction: "Write a warm, local-SEO-friendly Google Review response and a concise follow-up referral note.",
    sampleOutputTitle: "Polished Customer Review Response + Referral Follow-Up",
    sampleOutputBullets: [
      "Public Reply: Thank you for trusting our team with your 10kW hybrid solar and lithium battery installation! Seeing an 85% bill drop right away is exactly why we size every array to your peak load.",
      "Local SEO Signal: Naturally reinforces service quality and clean single-day installation without keyword stuffing.",
      "Referral Note: Reminds the homeowner about the $250 neighbor referral credit.",
    ],
  }),

  // 3. HEALTH, FITNESS & COACHING (6)
  makeCalcTool({
    slug: "tdee-calorie-macro-planner-calculator",
    title: "TDEE Calorie & Macro Split Planner",
    vertical: "health-fitness-coaching",
    verticalLabel: "Health, Fitness & Coaching",
    eyebrow: "NUTRITION COACHING ENGINE · $0 RUNTIME",
    summary: "Compute daily maintenance calories (TDEE), fat-loss or muscle-gain targets, and exact gram targets for protein, carbs, and fats.",
    leadMagnetHook: "Email my 7-day high-protein meal prep shopping list",
    badges: ["Daily Calories", "Protein (g)", "Fat Loss / Lean Bulk"],
    inputs: [
      { id: "weightKg", label: "Body Weight", unit: "kg", min: 40, max: 180, step: 1, defaultValue: 76 },
      { id: "activityMult", label: "Activity Multiplier (1.2-1.9)", unit: "x", min: 1.2, max: 1.9, step: 0.1, defaultValue: 1.5 },
      { id: "goalDelta", label: "Daily Calorie Adjustment", unit: "kcal", min: -700, max: 500, step: 50, defaultValue: -350 },
    ],
    outputs: [
      { id: "tdee", label: "Estimated Maintenance Calories (TDEE)", formula: "round(weightKg * 24 * activityMult, 0)", format: "number" },
      { id: "targetCalories", label: "Daily Target Calories", formula: "round(weightKg * 24 * activityMult + goalDelta, 0)", format: "number", highlight: true },
      { id: "proteinGrams", label: "Daily Protein Target (grams)", formula: "round(weightKg * 2.1, 0)", format: "number" },
    ],
  }),
  makeCalcTool({
    slug: "daily-protein-hydration-intake-calculator",
    title: "Optimal Protein & Hydration Intake Calculator",
    vertical: "health-fitness-coaching",
    verticalLabel: "Health, Fitness & Coaching",
    eyebrow: "PERFORMANCE HYDRATION · $0 RUNTIME",
    summary: "Calculate daily water intake (liters) and per-meal protein targets tailored to body weight and training duration.",
    leadMagnetHook: "Download the athlete hydration & recovery cheat sheet",
    badges: ["Liters / Day", "Protein / Meal", "Electrolyte Baseline"],
    inputs: [
      { id: "weightKg", label: "Body Weight", unit: "kg", min: 40, max: 160, step: 1, defaultValue: 74 },
      { id: "trainMins", label: "Daily Training Duration", unit: "min", min: 0, max: 180, step: 15, defaultValue: 60 },
      { id: "meals", label: "Meals Per Day", unit: "meals", min: 2, max: 6, step: 1, defaultValue: 4 },
    ],
    outputs: [
      { id: "waterLiters", label: "Daily Hydration Target (Liters)", formula: "round(weightKg * 0.035 + (trainMins / 60) * 0.6, 2)", format: "number", highlight: true },
      { id: "proteinPerMeal", label: "Target Protein Per Meal (grams)", formula: "round((weightKg * 2.0) / max(1, meals), 0)", format: "number" },
      { id: "dailyProtein", label: "Total Daily Protein (grams)", formula: "round(weightKg * 2.0, 0)", format: "number" },
    ],
  }),
  makeCalcTool({
    slug: "lean-body-mass-recomposition-estimator",
    title: "Lean Body Mass & Recomposition Estimator",
    vertical: "health-fitness-coaching",
    verticalLabel: "Health, Fitness & Coaching",
    eyebrow: "BODY COMPOSITION LAB · $0 RUNTIME",
    summary: "Estimate lean body mass, fat mass, and 12-week body recomposition milestones at a sustainable weekly pace.",
    leadMagnetHook: "Get your 12-week progressive overload & tracking template",
    badges: ["Lean Mass (kg)", "12-Week Target", "Sustainable Pace"],
    inputs: [
      { id: "weightKg", label: "Current Weight", unit: "kg", min: 40, max: 170, step: 1, defaultValue: 80 },
      { id: "bodyFatPct", label: "Estimated Body Fat %", unit: "%", min: 6, max: 45, step: 1, defaultValue: 22 },
      { id: "weeklyLossKg", label: "Target Weekly Fat Change", unit: "kg", min: 0.2, max: 1.0, step: 0.1, defaultValue: 0.5 },
    ],
    outputs: [
      { id: "leanMass", label: "Current Lean Body Mass (kg)", formula: "round(weightKg * (1 - bodyFatPct / 100), 1)", format: "number", highlight: true },
      { id: "twelveWkWeight", label: "12-Week Projected Weight (kg)", formula: "round(weightKg - weeklyLossKg * 12, 1)", format: "number" },
      { id: "newBfPct", label: "12-Week Projected Body Fat %", formula: "round(((weightKg * (bodyFatPct / 100) - weeklyLossKg * 12) / max(1, weightKg - weeklyLossKg * 12)) * 100, 1)", format: "percent" },
    ],
  }),
  makeQuizTool({
    slug: "fitness-recovery-coaching-readiness-quiz",
    title: "Fitness & Recovery Readiness Assessment",
    vertical: "health-fitness-coaching",
    verticalLabel: "Health, Fitness & Coaching",
    eyebrow: "COACHING INTAKE QUIZ · $0 RUNTIME",
    summary: "Assess sleep recovery, training consistency, and nutrition habits to match visitors with the right coaching tier.",
    leadMagnetHook: "Unlock your personalized 4-week starter training block",
    badges: ["Recovery Score", "Habit Consistency", "Program Match"],
    questions: [
      { id: "q1", question: "How many hours of uninterrupted sleep do you average?", options: [{ label: "Under 6 hours", points: 10 }, { label: "6 to 7 hours", points: 22 }, { label: "7.5+ hours", points: 35 }] },
      { id: "q2", question: "How many resistance or structured workouts do you complete weekly?", options: [{ label: "0-1 sessions", points: 10 }, { label: "2-3 sessions", points: 25 }, { label: "4+ structured sessions", points: 35 }] },
      { id: "q3", question: "How consistently do you hit your daily protein target?", options: [{ label: "Rarely track", points: 10 }, { label: "3-4 days a week", points: 20 }, { label: "6-7 days a week", points: 30 }] },
    ],
  }),
  makeQuizTool({
    slug: "custom-workout-split-finder-quiz",
    title: "Custom Workout Split & Volume Finder Quiz",
    vertical: "health-fitness-coaching",
    verticalLabel: "Health, Fitness & Coaching",
    eyebrow: "PROGRAM MATCHMAKER · $0 RUNTIME",
    summary: "Match busy clients with their optimal training split (Full Body, Upper/Lower, or Push/Pull/Legs) based on schedule and equipment.",
    leadMagnetHook: "Send my exact weekly exercise selection & rep ranges PDF",
    badges: ["Optimal Split", "Weekly Volume", "Equipment Match"],
    questions: [
      { id: "q1", question: "How many days per week can you commit to 45-60 min training?", options: [{ label: "2-3 days/week", points: 30 }, { label: "4 days/week", points: 35 }, { label: "5-6 days/week", points: 35 }] },
      { id: "q2", question: "Where do you primarily train?", options: [{ label: "Home dumbbells / bands", points: 20 }, { label: "Garage rack & barbell", points: 30 }, { label: "Full commercial gym", points: 35 }] },
      { id: "q3", question: "What is your #1 90-day priority?", options: [{ label: "Joint-friendly fat loss", points: 25 }, { label: "Strength & athletic power", points: 30 }, { label: "Hypertrophy & physique", points: 30 }] },
    ],
  }),
  makeAiTool({
    slug: "high-protein-meal-prep-menu-generator",
    title: "High-Protein Weekly Meal Prep Planner AI",
    vertical: "health-fitness-coaching",
    verticalLabel: "Health, Fitness & Coaching",
    eyebrow: "NUTRITION CLIENT LEAD MAGNET",
    summary: "Generate a custom 3-meal + 1-snack daily menu tailored to calorie targets, dietary preferences, and prep time.",
    leadMagnetHook: "Email this meal plan + printable grocery aisle checklist",
    badges: ["Macro-Balanced", "30-Min Prep", "Grocery List"],
    fields: [
      { id: "caloriesAndProtein", label: "Daily Calorie & Protein Goal", placeholder: "2,100 kcal · 165g protein", defaultValue: "2,100 kcal · 165g protein (lean recomposition)" },
      { id: "dietStyle", label: "Dietary Preferences / Exclusions", placeholder: "Halal, high-protein, no shellfish...", defaultValue: "Whole-food high-protein, dairy-friendly, under 30 minutes cooking time" },
    ],
    systemInstruction: "Create a structured 1-day sample high-protein meal plan with exact gram macros per meal and a 5-item prep shortcut list.",
    sampleOutputTitle: "2,100 kcal / 165g Protein Batch-Prep Menu",
    sampleOutputBullets: [
      "Meal 1 (45g Protein): Greek yogurt bowl with whey isolate, chia seeds, and berries (480 kcal).",
      "Meal 2 (55g Protein): Lemon-herb grilled chicken breast, roasted sweet potato, and olive-oil greens (640 kcal).",
      "Meal 3 (50g Protein): Lean beef or salmon stir-fry with jasmine rice and crisp broccoli (680 kcal) + 15g protein snack.",
    ],
  }),

  // 4. EDUCATION, COURSES & CREATORS (6)
  makeCalcTool({
    slug: "gpa-final-exam-grade-target-calculator",
    title: "Weighted GPA & Final Exam Target Calculator",
    vertical: "education-courses-creators",
    verticalLabel: "Education, Courses & Creators",
    eyebrow: "STUDENT UTILITY · $0 RUNTIME",
    summary: "Calculate the exact score needed on your final exam to achieve your target course grade.",
    leadMagnetHook: "Download the exam-week spaced repetition planner PDF",
    badges: ["Required Final %", "Weighted Grade", "Study Priority"],
    inputs: [
      { id: "currentGrade", label: "Current Course Grade", unit: "%", min: 40, max: 100, step: 1, defaultValue: 84 },
      { id: "targetGrade", label: "Target Final Course Grade", unit: "%", min: 50, max: 100, step: 1, defaultValue: 90 },
      { id: "finalWeight", label: "Final Exam Weight", unit: "%", min: 10, max: 60, step: 5, defaultValue: 25 },
    ],
    outputs: [
      { id: "requiredScore", label: "Required Score on Final Exam", formula: "round((targetGrade - currentGrade * (1 - finalWeight / 100)) / (finalWeight / 100), 1)", format: "percent", highlight: true },
      { id: "PointsLocked", label: "Course Percentage Points Already Locked", formula: "round(currentGrade * (1 - finalWeight / 100), 1)", format: "percent" },
    ],
  }),
  makeCalcTool({
    slug: "study-schedule-pomodoro-sprint-planner",
    title: "Exam Study Hours & Pomodoro Sprint Planner",
    vertical: "education-courses-creators",
    verticalLabel: "Education, Courses & Creators",
    eyebrow: "ACADEMIC PRODUCTIVITY · $0 RUNTIME",
    summary: "Convert syllabus chapters and days remaining into focused 25-minute Pomodoro study blocks per day.",
    leadMagnetHook: "Send my printable weekly Pomodoro tracker & active-recall sheet",
    badges: ["Pomodoros / Day", "Total Deep Hours", "Buffer Days"],
    inputs: [
      { id: "chapters", label: "Chapters / Modules to Master", unit: "mods", min: 2, max: 40, step: 1, defaultValue: 12 },
      { id: "hoursPerMod", label: "Deep Study Hours Per Module", unit: "hrs", min: 1, max: 8, step: 0.5, defaultValue: 2.5 },
      { id: "daysLeft", label: "Days Until Exam / Deadline", unit: "days", min: 3, max: 90, step: 1, defaultValue: 15 },
    ],
    outputs: [
      { id: "dailyHours", label: "Required Deep Study Hours / Day", formula: "round((chapters * hoursPerMod) / max(1, daysLeft), 1)", format: "number", highlight: true },
      { id: "dailyPomodoros", label: "25-Min Pomodoro Blocks / Day", formula: "ceil(((chapters * hoursPerMod) / max(1, daysLeft)) * 2)", format: "number" },
      { id: "totalHours", label: "Total Curriculum Study Hours", formula: "round(chapters * hoursPerMod, 1)", format: "number" },
    ],
  }),
  makeCalcTool({
    slug: "course-creator-launch-revenue-calculator",
    title: "Course Launch & Cohort Revenue Calculator",
    vertical: "education-courses-creators",
    verticalLabel: "Education, Courses & Creators",
    eyebrow: "CREATOR ECONOMICS · $0 RUNTIME",
    summary: "Project cohort enrollment, order-bump lift, and net creator revenue from email list size and conversion rate.",
    leadMagnetHook: "Download the 14-day course launch email sequence blueprint",
    badges: ["Projected Enrollments", "Order Bump Lift", "Net Launch Revenue"],
    inputs: [
      { id: "listSize", label: "Active Email / Waitlist Subscribers", unit: "subs", min: 200, max: 100000, step: 100, defaultValue: 3500 },
      { id: "convRate", label: "Expected Launch Conversion Rate", unit: "%", min: 0.5, max: 10, step: 0.25, defaultValue: 2.5 },
      { id: "coursePrice", label: "Core Course Price", unit: "$", min: 49, max: 2500, step: 25, defaultValue: 299 },
    ],
    outputs: [
      { id: "students", label: "Projected New Students", formula: "round(listSize * (convRate / 100), 0)", format: "number" },
      { id: "grossRevenue", label: "Projected Launch Revenue (w/ 15% Bump)", formula: "round(listSize * (convRate / 100) * coursePrice * 1.15, 0)", format: "currency", highlight: true },
    ],
  }),
  makeQuizTool({
    slug: "student-learning-style-retention-quiz",
    title: "Active Recall & Learning Style Diagnostic Quiz",
    vertical: "education-courses-creators",
    verticalLabel: "Education, Courses & Creators",
    eyebrow: "STUDENT DIAGNOSTIC · $0 RUNTIME",
    summary: "Identify whether a student retains fastest via visual diagrams, practice problem sets, or Feynman teaching sprints.",
    leadMagnetHook: "Unlock your tailored exam study protocol & Anki deck guide",
    badges: ["Retention Profile", "Study Method", "Focus Score"],
    questions: [
      { id: "q1", question: "How do you currently review new lecture material?", options: [{ label: "Re-reading notes passively", points: 10 }, { label: "Highlighting & summaries", points: 22 }, { label: "Practice tests & flashcards", points: 35 }] },
      { id: "q2", question: "When do you review a topic after first learning it?", options: [{ label: "Night before the exam", points: 10 }, { label: "Once a week", points: 25 }, { label: "Spaced intervals (1d, 3d, 7d)", points: 35 }] },
      { id: "q3", question: "Can you explain the topic out loud without looking at notes?", options: [{ label: "Struggle without notes", points: 10 }, { label: "Know main definitions", points: 20 }, { label: "Can teach it clearly", points: 30 }] },
    ],
  }),
  makeQuizTool({
    slug: "course-skill-level-placement-quiz",
    title: "Course Skill-Level & Track Placement Quiz",
    vertical: "education-courses-creators",
    verticalLabel: "Education, Courses & Creators",
    eyebrow: "CURRICULUM PLACEMENT · $0 RUNTIME",
    summary: "Route prospective students into your Foundations, Practitioner, or Advanced Mastery track automatically.",
    leadMagnetHook: "Watch Lesson 1 of your recommended track free",
    badges: ["Track Placement", "Time Saved", "Module Skip Map"],
    questions: [
      { id: "q1", question: "How many real-world projects have you shipped in this domain?", options: [{ label: "Brand new (0 projects)", points: 15 }, { label: "1 to 3 guided projects", points: 25 }, { label: "4+ production projects", points: 35 }] },
      { id: "q2", question: "How comfortable are you debugging complex edge cases?", options: [{ label: "Need step-by-step guidance", points: 10 }, { label: "Can solve common errors", points: 25 }, { label: "Architect & optimize systems", points: 35 }] },
      { id: "q3", question: "What is your primary outcome goal for this cohort?", options: [{ label: "Learn core fundamentals", points: 20 }, { label: "Build a portfolio capstone", points: 25 }, { label: "Scale commercial client work", points: 30 }] },
    ],
  }),
  makeAiTool({
    slug: "syllabus-lesson-outline-quiz-architect",
    title: "Lesson Outline & Practice Quiz Architect AI",
    vertical: "education-courses-creators",
    verticalLabel: "Education, Courses & Creators",
    eyebrow: "EDUCATOR CONTENT ENGINE",
    summary: "Transform any course topic into a structured 45-minute lesson plan, learning objectives, and 3 retrieval quiz questions.",
    leadMagnetHook: "Download the complete curriculum design workbook",
    badges: ["Learning Objectives", "45-Min Pacing", "Retrieval Quiz"],
    fields: [
      { id: "lessonTopic", label: "Lesson Topic & Target Level", placeholder: "Intro to React Server Components for intermediate devs", defaultValue: "Mastering Cashflow Underwriting for First-Time Real Estate Investors" },
      { id: "keyOutcome", label: "Single Actionable Student Takeaway", placeholder: "Calculate NOI and Cap Rate on any listing in 5 minutes", defaultValue: "Calculate true Net Operating Income (NOI) and spot hidden expense traps" },
    ],
    systemInstruction: "Generate a tight lesson plan with 3 measurable learning objectives, a 3-part teaching arc, and 2 multiple-choice check questions.",
    sampleOutputTitle: "45-Minute Mastery Lesson Plan + Active Recall Check",
    sampleOutputBullets: [
      "Learning Objective: Calculate true NOI by separating capex reserves and vacancy from gross rent.",
      "Teaching Arc: 10m Concept Teardown -> 20m Live Deal Walkthrough -> 15m Student Underwriting Drill.",
      "Retrieval Check: Includes 2 scenario-based questions verifying vacancy and maintenance deductions.",
    ],
  }),

  // 5. E-COMMERCE & RETAIL (6)
  makeCalcTool({
    slug: "ecommerce-profit-margin-roas-calculator",
    title: "E-Commerce Profit Margin & Break-Even ROAS Calculator",
    vertical: "ecommerce-retail",
    verticalLabel: "E-Commerce & Retail",
    eyebrow: "MERCHANT UNIT ECONOMICS · $0 RUNTIME",
    summary: "Calculate net contribution margin per order and exact break-even Return on Ad Spend (ROAS) after COGS and shipping.",
    leadMagnetHook: "Download the DTC unit-economics & bundle pricing sheet",
    badges: ["Net Margin %", "Break-Even ROAS", "Max CPA"],
    inputs: [
      { id: "aov", label: "Average Order Value (AOV)", unit: "$", min: 15, max: 1500, step: 5, defaultValue: 85 },
      { id: "cogs", label: "Landed Product Cost (COGS)", unit: "$", min: 2, max: 800, step: 2, defaultValue: 24 },
      { id: "shipFees", label: "Fulfillment + Payment Fees", unit: "$", min: 2, max: 150, step: 1, defaultValue: 11 },
    ],
    outputs: [
      { id: "grossProfit", label: "Pre-Ad Contribution Profit / Order", formula: "round(aov - cogs - shipFees, 2)", format: "currency", highlight: true },
      { id: "marginPct", label: "Contribution Margin %", formula: "round(((aov - cogs - shipFees) / max(1, aov)) * 100, 1)", format: "percent" },
      { id: "breakEvenRoas", label: "Break-Even ROAS Multiplier", formula: "round(aov / max(1, aov - cogs - shipFees), 2)", format: "number" },
    ],
  }),
  makeCalcTool({
    slug: "bundle-discount-aov-lift-calculator",
    title: "Product Bundle & Tiered Discount AOV Calculator",
    vertical: "ecommerce-retail",
    verticalLabel: "E-Commerce & Retail",
    eyebrow: "CART CONVERSION ENGINE · $0 RUNTIME",
    summary: "Show shoppers or merchants exact dollar savings on 2-pack and 3-pack bundles while protecting net profit per order.",
    leadMagnetHook: "Unlock our top 5 high-AOV bundle layout templates",
    badges: ["Customer Savings", "Bundle AOV Lift", "Net Profit Lift"],
    inputs: [
      { id: "unitPrice", label: "Single Item Retail Price", unit: "$", min: 10, max: 500, step: 2, defaultValue: 48 },
      { id: "qty", label: "Bundle Pack Quantity", unit: "items", min: 2, max: 6, step: 1, defaultValue: 3 },
      { id: "discountPct", label: "Bundle Tier Discount", unit: "%", min: 5, max: 40, step: 5, defaultValue: 15 },
    ],
    outputs: [
      { id: "bundlePrice", label: "Final Bundle Checkout Price", formula: "round(unitPrice * qty * (1 - discountPct / 100), 2)", format: "currency", highlight: true },
      { id: "customerSavings", label: "Instant Customer Savings", formula: "round(unitPrice * qty * (discountPct / 100), 2)", format: "currency" },
    ],
  }),
  makeQuizTool({
    slug: "apparel-size-fit-recommender-quiz",
    title: "Instant Size & Fit Finder Quiz",
    vertical: "ecommerce-retail",
    verticalLabel: "E-Commerce & Retail",
    eyebrow: "RETURN-REDUCTION QUIZ · $0 RUNTIME",
    summary: "Cut sizing returns by 35% by guiding shoppers to their exact fit preference (Tailored, Regular, or Relaxed).",
    leadMagnetHook: "Save my fit profile & unlock 10% off my first order",
    badges: ["Exact Size Match", "Lower Return Rate", "10% Welcome Code"],
    questions: [
      { id: "q1", question: "How do you prefer your everyday tops/jackets to drape?", options: [{ label: "Close, tailored silhouette", points: 25 }, { label: "Classic true-to-size fit", points: 35 }, { label: "Relaxed / oversized layering", points: 30 }] },
      { id: "q2", question: "Between two sizes, which do you usually choose?", options: [{ label: "Smaller size for structure", points: 25 }, { label: "Standard chart size", points: 35 }, { label: "Size up for comfort", points: 30 }] },
      { id: "q3", question: "Will you wear base layers underneath?", options: [{ label: "No, worn solo", points: 30 }, { label: "Light tee underneath", points: 35 }, { label: "Heavy knit / hoodie layer", points: 25 }] },
    ],
  }),
  makeQuizTool({
    slug: "skincare-routine-product-matchmaker-quiz",
    title: "Custom Product Routine Matchmaker Quiz",
    vertical: "ecommerce-retail",
    verticalLabel: "E-Commerce & Retail",
    eyebrow: "GUIDED SELLING QUIZ · $0 RUNTIME",
    summary: "Recommend a curated 3-step product bundle based on customer goals, sensitivity, and daily routine.",
    leadMagnetHook: "Email my custom AM/PM routine + $15 bundle voucher",
    badges: ["3-Step Regimen", "Ingredient Match", "Bundle Voucher"],
    questions: [
      { id: "q1", question: "What is your #1 priority right now?", options: [{ label: "Deep hydration & barrier repair", points: 35 }, { label: "Brightening & even tone", points: 35 }, { label: "Blemish & oil control", points: 30 }] },
      { id: "q2", question: "How many steps do you want in your daily routine?", options: [{ label: "Minimalist 2-step (2 mins)", points: 30 }, { label: "Balanced 3-step core", points: 35 }, { label: "Full 5-step ritual", points: 30 }] },
      { id: "q3", question: "How sensitive is your skin to active ingredients?", options: [{ label: "Very sensitive / gentle only", points: 25 }, { label: "Normal tolerance", points: 35 }, { label: "Experienced with actives", points: 35 }] },
    ],
  }),
  makeQuizTool({
    slug: "holiday-gift-finder-concierge-quiz",
    title: "60-Second Gift Finder Concierge Quiz",
    vertical: "ecommerce-retail",
    verticalLabel: "E-Commerce & Retail",
    eyebrow: "HIGH-CONVERTING GIFT QUIZ · $0 RUNTIME",
    summary: "Turn undecided gift shoppers into buyers by matching recipient personality, occasion, and budget tier.",
    leadMagnetHook: "Send my top 3 gift picks + free gift-wrap code",
    badges: ["Recipient Match", "Budget Filter", "Free Gift Wrap"],
    questions: [
      { id: "q1", question: "What best describes the recipient's daily style?", options: [{ label: "Practical minimalist", points: 35 }, { label: "Design & craft enthusiast", points: 35 }, { label: "Always outdoors / on the move", points: 30 }] },
      { id: "q2", question: "What is your target gift budget?", options: [{ label: "Under $50 thoughtful pick", points: 30 }, { label: "$50 to $120 signature set", points: 35 }, { label: "$120+ luxury collector bundle", points: 35 }] },
      { id: "q3", question: "When do you need it delivered?", options: [{ label: "Express 2-day shipping", points: 30 }, { label: "Standard this week", points: 35 }, { label: "Instant digital gift card + box", points: 30 }] },
    ],
  }),
  makeAiTool({
    slug: "shopify-product-description-faq-generator",
    title: "Conversion Product Copy & Buyer FAQ AI",
    vertical: "ecommerce-retail",
    verticalLabel: "E-Commerce & Retail",
    eyebrow: "E-COMMERCE MERCHANDISING AI",
    summary: "Generate sensory benefit bullets, materials/care specs, and 3 objection-busting FAQs for any product page.",
    leadMagnetHook: "Download our 25-point high-converting PDP checklist",
    badges: ["Sensory Bullets", "Objection FAQs", "SEO Meta Snippet"],
    fields: [
      { id: "productName", label: "Product Name & Core Materials", placeholder: "Merino Wool Travel Hoodie — 260gsm ethically sourced", defaultValue: "Artisan Full-Grain Leather Weekender Bag with brass hardware & padded laptop sleeve" },
      { id: "audienceHook", label: "Target Buyer & Primary Benefit", placeholder: "Frequent flyers who hate bulky luggage", defaultValue: "Executives and weekend travelers wanting carry-on compliance and lifetime durability" },
    ],
    systemInstruction: "Write a conversion-focused product description with an emotional hook, 4 benefit-first bullets, and 2 buyer objection FAQs.",
    sampleOutputTitle: "PDP Conversion Copy + Objection-Busting FAQs",
    sampleOutputBullets: [
      "Benefit Lead: Engineered from vegetable-tanned full-grain leather that develops a richer patina on every flight while sliding effortlessly into overhead bins.",
      "Feature-to-Outcome: Dedicated 16-inch suspended laptop compartment eliminates airport security unpacking.",
      "Objection FAQ: Covers exact carry-on dimensions, waterproof lining care, and lifetime brass hardware warranty.",
    ],
  }),

  // 6. B2B SAAS & CONSULTANTS (6)
  makeCalcTool({
    slug: "b2b-saas-automation-roi-calculator",
    title: "B2B SaaS Automation ROI & Payback Calculator",
    vertical: "b2b-saas-consultants",
    verticalLabel: "B2B SaaS & Consultants",
    eyebrow: "B2B BUYER JUSTIFICATION · $0 RUNTIME",
    summary: "Quantify annual hours reclaimed, dollar labor savings, and software payback period for CFO approval.",
    leadMagnetHook: "Email the CFO-ready 1-page business case PDF",
    badges: ["Annual $ Saved", "Hours Reclaimed", "ROI Multiple"],
    inputs: [
      { id: "teamSize", label: "Team Members Using Workflow", unit: "users", min: 1, max: 250, step: 1, defaultValue: 12 },
      { id: "hoursSavedWk", label: "Hours Saved Per User / Week", unit: "hrs", min: 1, max: 25, step: 0.5, defaultValue: 5 },
      { id: "hourlyCost", label: "Loaded Hourly Team Cost", unit: "$", min: 20, max: 250, step: 5, defaultValue: 65 },
    ],
    outputs: [
      { id: "annualHours", label: "Annual Team Hours Reclaimed", formula: "round(teamSize * hoursSavedWk * 50, 0)", format: "number" },
      { id: "annualSavings", label: "Annual Productivity Value Created", formula: "round(teamSize * hoursSavedWk * 50 * hourlyCost, 0)", format: "currency", highlight: true },
    ],
  }),
  makeCalcTool({
    slug: "freelance-consultant-hourly-retainer-calculator",
    title: "Consultant Day-Rate & Retainer Pricing Calculator",
    vertical: "b2b-saas-consultants",
    verticalLabel: "B2B SaaS & Consultants",
    eyebrow: "ADVISORY PRICING ENGINE · $0 RUNTIME",
    summary: "Reverse-engineer your required hourly rate, day rate, and monthly retainer from target take-home income and billable utilization.",
    leadMagnetHook: "Download the value-based retainer proposal template",
    badges: ["Minimum Day Rate", "Monthly Retainer", "Tax & Overhead Buffer"],
    inputs: [
      { id: "targetIncome", label: "Target Annual Net Income", unit: "$", min: 40000, max: 600000, step: 5000, defaultValue: 160000 },
      { id: "billableHrsWk", label: "Billable Client Hours / Week", unit: "hrs", min: 10, max: 40, step: 1, defaultValue: 24 },
      { id: "overheadPct", label: "Taxes & Overhead Buffer", unit: "%", min: 15, max: 50, step: 5, defaultValue: 30 },
    ],
    outputs: [
      { id: "hourlyRate", label: "Required Billable Hourly Rate", formula: "round((targetIncome / (1 - overheadPct / 100)) / (billableHrsWk * 46), 0)", format: "currency", highlight: true },
      { id: "dayRate", label: "Recommended 8-Hour Day Rate", formula: "round(((targetIncome / (1 - overheadPct / 100)) / (billableHrsWk * 46)) * 8, 0)", format: "currency" },
    ],
  }),
  makeCalcTool({
    slug: "saas-churn-ltv-cac-ratio-calculator",
    title: "SaaS Customer LTV, Churn & LTV:CAC Calculator",
    vertical: "b2b-saas-consultants",
    verticalLabel: "B2B SaaS & Consultants",
    eyebrow: "SAAS METRICS LAB · $0 RUNTIME",
    summary: "Model customer lifetime value (LTV), payback months, and LTV:CAC ratio from ARPA, gross margin, and monthly churn.",
    leadMagnetHook: "Get our SaaS board metrics benchmark report",
    badges: ["Customer LTV", "LTV:CAC Ratio", "CAC Payback Months"],
    inputs: [
      { id: "arpa", label: "Monthly Revenue Per Account (ARPA)", unit: "$", min: 19, max: 5000, step: 10, defaultValue: 199 },
      { id: "churnPct", label: "Monthly Logo Churn Rate", unit: "%", min: 0.5, max: 15, step: 0.25, defaultValue: 3.5 },
      { id: "cac", label: "Customer Acquisition Cost (CAC)", unit: "$", min: 50, max: 15000, step: 50, defaultValue: 950 },
    ],
    outputs: [
      { id: "ltv", label: "Gross Customer Lifetime Value (LTV)", formula: "round((arpa * 0.82) / (churnPct / 100), 0)", format: "currency", highlight: true },
      { id: "ltvCac", label: "LTV : CAC Multiple", formula: "round(((arpa * 0.82) / (churnPct / 100)) / max(1, cac), 1)", format: "number" },
      { id: "paybackMonths", label: "CAC Payback Window", formula: "round(cac / max(1, arpa * 0.82), 1)", format: "months" },
    ],
  }),
  makeQuizTool({
    slug: "b2b-operations-maturity-audit-quiz",
    title: "B2B Operations & RevOps Maturity Audit",
    vertical: "b2b-saas-consultants",
    verticalLabel: "B2B SaaS & Consultants",
    eyebrow: "EXECUTIVE DIAGNOSTIC QUIZ · $0 RUNTIME",
    summary: "Benchmark a prospect's pipeline attribution, onboarding handoff, and reporting automation in 3 minutes.",
    leadMagnetHook: "Send my 90-day RevOps bottleneck remediation roadmap",
    badges: ["Maturity Score", "Pipeline Leakage", "90-Day Roadmap"],
    questions: [
      { id: "q1", question: "How is lead-to-close attribution tracked today?", options: [{ label: "Manual spreadsheets", points: 10 }, { label: "Basic CRM stages", points: 22 }, { label: "Automated multi-touch RevOps", points: 35 }] },
      { id: "q2", question: "How long does new client onboarding take after contract sign?", options: [{ label: "2+ weeks of manual emails", points: 10 }, { label: "3-5 days semi-automated", points: 25 }, { label: "Same-day automated workspace", points: 35 }] },
      { id: "q3", question: "Do executives have a live weekly retention & expansion dashboard?", options: [{ label: "Built ad-hoc monthly", points: 10 }, { label: "Partial weekly report", points: 20 }, { label: "Real-time automated ledger", points: 30 }] },
    ],
  }),
  makeQuizTool({
    slug: "custom-software-project-scope-estimator-quiz",
    title: "Software & Agency Project Scope Estimator Quiz",
    vertical: "b2b-saas-consultants",
    verticalLabel: "B2B SaaS & Consultants",
    eyebrow: "AGENCY INTAKE QUALIFIER · $0 RUNTIME",
    summary: "Pre-qualify software or agency leads by complexity, integrations, and timeline before a discovery call.",
    leadMagnetHook: "Receive your instant sprint breakdown & architecture brief",
    badges: ["Sprint Estimate", "Integration Tier", "Discovery Ready"],
    questions: [
      { id: "q1", question: "What type of build or engagement do you need?", options: [{ label: "Focused MVP / single workflow", points: 35 }, { label: "Multi-role SaaS + billing", points: 30 }, { label: "Enterprise migration + custom AI", points: 25 }] },
      { id: "q2", question: "Are wireframes or product requirements already documented?", options: [{ label: "Full spec ready", points: 35 }, { label: "High-level goals defined", points: 25 }, { label: "Need discovery sprint first", points: 15 }] },
      { id: "q3", question: "What is your target go-live window?", options: [{ label: "4-6 weeks", points: 30 }, { label: "2-3 months", points: 30 }, { label: "Flexible phased rollout", points: 25 }] },
    ],
  }),
  makeAiTool({
    slug: "b2b-cold-outreach-value-hook-generator",
    title: "B2B Executive Outreach & Value Hook AI",
    vertical: "b2b-saas-consultants",
    verticalLabel: "B2B SaaS & Consultants",
    eyebrow: "B2B PIPELINE ENGINE",
    summary: "Craft concise, zero-fluff executive emails and LinkedIn connection notes anchored on a concrete business trigger.",
    leadMagnetHook: "Download our 12 highest-reply B2B executive follow-up scripts",
    badges: ["Trigger-Based Hook", "Under 90 Words", "LinkedIn DM Variant"],
    fields: [
      { id: "icpRole", label: "Target Executive Role & Industry", placeholder: "VP of Operations at mid-market logistics firms", defaultValue: "Head of Growth at B2B SaaS companies scaling content & programmatic SEO" },
      { id: "painAndProof", label: "Core Bottleneck & Quantified Proof", placeholder: "Cut manual QA time 70%...", defaultValue: "Eliminate keyword cannibalization and ship 100 fact-checked articles/month at $0.02/article" },
    ],
    systemInstruction: "Write an 80-word executive email and a 250-character LinkedIn note with zero buzzwords and a low-friction question.",
    sampleOutputTitle: "80-Word Executive Trigger Email + LinkedIn Note",
    sampleOutputBullets: [
      "Subject Line: Sitemap overlap vs. new blog velocity",
      "Email Body: Leads directly with how 300-page SaaS domains lose rankings to internal keyword cannibalization—and shows how an automated Sitemap Overlap Gate fixes it.",
      "Low-Friction CTA: Asks if they want a 60-second overlap scan of their current /blog sitemap.",
    ],
  }),

  // 7. LEGAL, HR, EVENTS & TRAVEL (6)
  makeCalcTool({
    slug: "wedding-event-budget-allocation-planner",
    title: "Wedding & Event Budget Allocation Planner",
    vertical: "legal-hr-events-travel",
    verticalLabel: "Legal, HR, Events & Travel",
    eyebrow: "EVENT PLANNING UTILITY · $0 RUNTIME",
    summary: "Break down total event budget into venue, catering per guest, photography, decor, and a 10% contingency buffer.",
    leadMagnetHook: "Email my itemized vendor payment calendar & checklist",
    badges: ["Per-Guest Cost", "Venue & Catering Split", "10% Contingency"],
    inputs: [
      { id: "totalBudget", label: "Total Event Budget", unit: "$", min: 3000, max: 250000, step: 1000, defaultValue: 35000 },
      { id: "guests", label: "Confirmed Guest Count", unit: "guests", min: 20, max: 800, step: 10, defaultValue: 140 },
    ],
    outputs: [
      { id: "venueCatering", label: "Venue & Catering Allocation (48%)", formula: "round(totalBudget * 0.48, 0)", format: "currency", highlight: true },
      { id: "perGuest", label: "All-In Budget Per Guest", formula: "round(totalBudget / max(1, guests), 0)", format: "currency" },
      { id: "contingency", label: "Recommended 10% Emergency Reserve", formula: "round(totalBudget * 0.10, 0)", format: "currency" },
    ],
  }),
  makeCalcTool({
    slug: "trip-cost-daily-travel-budget-estimator",
    title: "Trip Cost & Daily Travel Budget Estimator",
    vertical: "legal-hr-events-travel",
    verticalLabel: "Legal, HR, Events & Travel",
    eyebrow: "TRAVEL AGENCY CONVERTER · $0 RUNTIME",
    summary: "Estimate total trip investment across flights, lodging, dining, and local experiences for solo, couple, or family travel.",
    leadMagnetHook: "Send my custom day-by-day itinerary & packing checklist PDF",
    badges: ["Total Trip Cost", "Cost Per Traveler", "Daily Spend"],
    inputs: [
      { id: "nights", label: "Trip Duration (Nights)", unit: "nights", min: 2, max: 30, step: 1, defaultValue: 7 },
      { id: "dailyRate", label: "Lodging + Dining Budget / Night", unit: "$", min: 60, max: 1500, step: 20, defaultValue: 280 },
      { id: "flightsTotal", label: "Estimated Flights & Transfers", unit: "$", min: 100, max: 15000, step: 50, defaultValue: 1400 },
    ],
    outputs: [
      { id: "totalTrip", label: "Estimated Total Trip Budget", formula: "round(nights * dailyRate + flightsTotal, 0)", format: "currency", highlight: true },
      { id: "withBuffer", label: "Recommended Total w/ 12% Buffer", formula: "round((nights * dailyRate + flightsTotal) * 1.12, 0)", format: "currency" },
    ],
  }),
  makeCalcTool({
    slug: "employee-true-hiring-onboarding-cost-calculator",
    title: "True Employee Hiring & Onboarding Cost Calculator",
    vertical: "legal-hr-events-travel",
    verticalLabel: "Legal, HR, Events & Travel",
    eyebrow: "HR & RECRUITING ROI · $0 RUNTIME",
    summary: "Calculate total first-year employer investment including benefits load, recruiting fees, and 60-day ramp time.",
    leadMagnetHook: "Download the structured 30-60-90 day onboarding scorecard",
    badges: ["Loaded Annual Cost", "Recruiting & Ramp", "Monthly Run-Rate"],
    inputs: [
      { id: "baseSalary", label: "Annual Base Salary", unit: "$", min: 25000, max: 350000, step: 2500, defaultValue: 85000 },
      { id: "benefitsPct", label: "Taxes, Benefits & Equipment Load", unit: "%", min: 12, max: 40, step: 1, defaultValue: 22 },
      { id: "recruitCost", label: "Recruiting & Onboarding Spend", unit: "$", min: 500, max: 40000, step: 500, defaultValue: 6500 },
    ],
    outputs: [
      { id: "firstYearTotal", label: "First-Year All-In Employer Investment", formula: "round(baseSalary * (1 + benefitsPct / 100) + recruitCost, 0)", format: "currency", highlight: true },
      { id: "monthlyBurn", label: "Ongoing Monthly Loaded Run-Rate", formula: "round((baseSalary * (1 + benefitsPct / 100)) / 12, 0)", format: "currency" },
    ],
  }),
  makeQuizTool({
    slug: "contract-compliance-risk-readiness-quiz",
    title: "Business Contract & Compliance Readiness Quiz",
    vertical: "legal-hr-events-travel",
    verticalLabel: "Legal, HR, Events & Travel",
    eyebrow: "LEGAL INTAKE DIAGNOSTIC · $0 RUNTIME",
    summary: "Help founders spot IP assignment, contractor classification, and liability clause gaps before signing deals.",
    leadMagnetHook: "Download the founder contract red-flag checklist (Educational Guide)",
    badges: ["IP Protection", "Liability Cap", "Intake Summary"],
    questions: [
      { id: "q1", question: "Do all contractors and employees have signed IP assignment clauses?", options: [{ label: "Verbal or informal emails", points: 10 }, { label: "Partial templates signed", points: 22 }, { label: "100% signed written IP agreements", points: 35 }] },
      { id: "q2", question: "Do your client MSAs include a clear limitation of liability cap?", options: [{ label: "No standard MSA", points: 10 }, { label: "Sometimes included", points: 25 }, { label: "Capped in every contract", points: 35 }] },
      { id: "q3", question: "When were your privacy policy and terms last reviewed?", options: [{ label: "Copied years ago", points: 10 }, { label: "Reviewed within 2 years", points: 20 }, { label: "Updated for current regulations", points: 30 }] },
    ],
  }),
  makeQuizTool({
    slug: "visa-consultation-eligibility-pre-check-quiz",
    title: "Service & Consultation Eligibility Pre-Check Quiz",
    vertical: "legal-hr-events-travel",
    verticalLabel: "Legal, HR, Events & Travel",
    eyebrow: "ADVISORY PRE-QUALIFIER · $0 RUNTIME",
    summary: "Organize client documentation readiness, timeline urgency, and pathway fit before a paid consultation.",
    leadMagnetHook: "Receive your customized document preparation checklist PDF",
    badges: ["Document Readiness", "Timeline Fit", "Fast-Track Intake"],
    questions: [
      { id: "q1", question: "Are your core academic/professional transcripts and IDs valid for 12+ months?", options: [{ label: "Need renewals first", points: 15 }, { label: "Most documents ready", points: 25 }, { label: "100% verified & digitized", points: 35 }] },
      { id: "q2", question: "What is your target filing or travel window?", options: [{ label: "Urgent (<60 days)", points: 25 }, { label: "3 to 6 months", points: 35 }, { label: "6+ months planning ahead", points: 30 }] },
      { id: "q3", question: "Have you completed a prior formal application in this category?", options: [{ label: "First-time applicant", points: 30 }, { label: "Renewal / extension", points: 35 }, { label: "Addressing prior refusal", points: 20 }] },
    ],
  }),
  makeAiTool({
    slug: "role-scorecard-job-description-architect-ai",
    title: "Outcome-Based Job Description & Interview Scorecard AI",
    vertical: "legal-hr-events-travel",
    verticalLabel: "Legal, HR, Events & Travel",
    eyebrow: "HR & TALENT ACQUISITION AI",
    summary: "Turn a role title and 90-day outcomes into an A-player job description plus 4 structured behavioral interview questions.",
    leadMagnetHook: "Download the complete 30-60-90 hiring scorecard template",
    badges: ["90-Day Outcomes", "Interview Rubric", "Bias-Free Copy"],
    fields: [
      { id: "roleTitle", label: "Role Title & Seniority", placeholder: "Senior Full-Stack Engineer / Head of Customer Success", defaultValue: "Technical Product Marketing Manager (B2B AI SaaS)" },
      { id: "ninetyDayWin", label: "Top 90-Day Measurable Deliverable", placeholder: "Launch self-serve onboarding...", defaultValue: "Own product launch playbooks, customer case studies, and interactive ROI calculators" },
    ],
    systemInstruction: "Draft an outcome-led job summary, 4 measurable 90-day success criteria, and 3 structured interview questions.",
    sampleOutputTitle: "Outcome-Led Job Description + 90-Day Interview Rubric",
    sampleOutputBullets: [
      "Mission Statement: Own technical product storytelling and interactive buyer enablement tools from seed through Series A.",
      "90-Day Success Metric: Ship 3 verified customer case studies and lift self-serve trial-to-paid conversion by 18%.",
      "Interview Question: Walk us through a complex technical feature you translated into a clear revenue-driving buyer asset.",
    ],
  }),

  // 8. WHITE-LABEL MARKETING & SEO AGENCIES (6 Opt-In White-Label)
  makeQuizTool({
    slug: "white-label-seo-ai-readiness-audit-quiz",
    title: "White-Label SEO & AI Search Readiness Audit",
    vertical: "white-label-seo-agency",
    verticalLabel: "White-Label Marketing & SEO",
    exclusive: false,
    eyebrow: "AGENCY LEAD MAGNET · 100% WHITE-LABEL",
    summary: "Capture high-ticket SEO retainers on your agency domain by scoring a prospect's technical SEO, content velocity, and AI citation health.",
    leadMagnetHook: "Request a custom 15-minute video teardown from our agency team",
    badges: ["100% Agency Branded", "AEO + SEO Score", "Retainer Lead Capture"],
    questions: [
      { id: "q1", question: "How often does your site publish original, fact-checked guides?", options: [{ label: "Rarely / ad-hoc", points: 10 }, { label: "2-4 articles/month", points: 25 }, { label: "Weekly cluster publishing", points: 35 }] },
      { id: "q2", question: "Are JSON-LD schema (@graph) and internal topic clusters automated?", options: [{ label: "No schema setup", points: 10 }, { label: "Basic plugin defaults", points: 20 }, { label: "Full connected entity graph", points: 35 }] },
      { id: "q3", question: "Do you check for keyword cannibalization before publishing new service pages?", options: [{ label: "Never checked", points: 10 }, { label: "Manual spot checks", points: 20 }, { label: "Automated sitemap overlap gate", points: 30 }] },
    ],
  }),
  makeCalcTool({
    slug: "white-label-content-marketing-roi-calculator",
    title: "White-Label Content & Organic Traffic ROI Calculator",
    vertical: "white-label-seo-agency",
    verticalLabel: "White-Label Marketing & SEO",
    exclusive: false,
    eyebrow: "AGENCY SALES ENABLEMENT · $0 RUNTIME",
    summary: "Show agency prospects their projected monthly organic traffic value, lead volume, and compound ROI vs. paid ads.",
    leadMagnetHook: "Book a strategy call to claim your custom 90-day keyword roadmap",
    badges: ["Organic Pipeline Value", "Paid Ad Equivalent", "100% White-Label"],
    inputs: [
      { id: "monthlyArticles", label: "Monthly Research Articles Published", unit: "posts", min: 2, max: 100, step: 2, defaultValue: 16 },
      { id: "avgVisitsPerPost", label: "Avg Monthly Visits / Mature Article", unit: "visits", min: 30, max: 1500, step: 20, defaultValue: 220 },
      { id: "leadValue", label: "Value Per Qualified Organic Lead", unit: "$", min: 25, max: 2500, step: 25, defaultValue: 180 },
    ],
    outputs: [
      { id: "monthlyTraffic", label: "Projected Monthly Compounding Traffic", formula: "round(monthlyArticles * 6 * avgVisitsPerPost, 0)", format: "number" },
      { id: "monthlyPipeline", label: "Projected Monthly Organic Lead Value", formula: "round((monthlyArticles * 6 * avgVisitsPerPost * 0.018) * leadValue, 0)", format: "currency", highlight: true },
    ],
  }),
  makeCalcTool({
    slug: "white-label-ad-spend-roas-profit-calculator",
    title: "White-Label Paid Ads ROAS & Agency Profit Calculator",
    vertical: "white-label-seo-agency",
    verticalLabel: "White-Label Marketing & SEO",
    exclusive: false,
    eyebrow: "PERFORMANCE AGENCY TOOL · $0 RUNTIME",
    summary: "Model target CPA, ROAS multiplier, and net revenue after ad spend and agency retainer fees.",
    leadMagnetHook: "Request a free wasted-ad-spend audit from our media buyers",
    badges: ["Net ROAS", "Target CPA", "Retainer ROI"],
    inputs: [
      { id: "adSpend", label: "Monthly Paid Media Budget", unit: "$", min: 1000, max: 250000, step: 1000, defaultValue: 15000 },
      { id: "roas", label: "Target Return on Ad Spend (ROAS)", unit: "x", min: 1.5, max: 12, step: 0.25, defaultValue: 4.0 },
      { id: "marginPct", label: "Gross Product/Service Margin", unit: "%", min: 20, max: 90, step: 5, defaultValue: 65 },
    ],
    outputs: [
      { id: "attributedRev", label: "Projected Attributed Monthly Revenue", formula: "round(adSpend * roas, 0)", format: "currency", highlight: true },
      { id: "netContribution", label: "Net Margin Contribution After Ad Spend", formula: "round(adSpend * roas * (marginPct / 100) - adSpend, 0)", format: "currency" },
    ],
  }),
  makeCalcTool({
    slug: "white-label-serp-ctr-traffic-lift-calculator",
    title: "White-Label SERP CTR & Title Optimization Lift Calculator",
    vertical: "white-label-seo-agency",
    verticalLabel: "White-Label Marketing & SEO",
    exclusive: false,
    eyebrow: "ON-PAGE CTR CALCULATOR · $0 RUNTIME",
    summary: "Demonstrate how lifting Google Search Console CTR from 1.8% to 4.5% on existing impressions unlocks immediate free clicks.",
    leadMagnetHook: "Get our top 10 striking-distance pages audit",
    badges: ["Extra Monthly Clicks", "Zero New Backlinks", "CTR Gain"],
    inputs: [
      { id: "impressions", label: "Monthly Search Console Impressions", unit: "impr", min: 5000, max: 2000000, step: 5000, defaultValue: 120000 },
      { id: "currentCtr", label: "Current Average CTR", unit: "%", min: 0.5, max: 10, step: 0.25, defaultValue: 1.8 },
      { id: "targetCtr", label: "Target Optimized CTR", unit: "%", min: 1.0, max: 15, step: 0.25, defaultValue: 4.2 },
    ],
    outputs: [
      { id: "extraClicks", label: "Net New Monthly Organic Clicks", formula: "round(impressions * (max(0, targetCtr - currentCtr) / 100), 0)", format: "number", highlight: true },
      { id: "totalClicks", label: "New Total Monthly Organic Clicks", formula: "round(impressions * (targetCtr / 100), 0)", format: "number" },
    ],
  }),
  makeCalcTool({
    slug: "white-label-local-gbp-lead-value-estimator",
    title: "White-Label Local SEO & Map-Pack Lead Estimator",
    vertical: "white-label-seo-agency",
    verticalLabel: "White-Label Marketing & SEO",
    exclusive: false,
    eyebrow: "LOCAL AGENCY CONVERTER · $0 RUNTIME",
    summary: "Calculate how ranking in the Google Maps Top 3 converts local search volume into phone calls and booked jobs.",
    leadMagnetHook: "Claim your free Google Business Profile competitive heatmap",
    badges: ["Map-Pack Calls", "Booked Jobs / Mo", "Local Revenue"],
    inputs: [
      { id: "localSearches", label: "Monthly Local Service Searches", unit: "srch", min: 300, max: 50000, step: 100, defaultValue: 3200 },
      { id: "mapPackShare", label: "Top-3 Map Pack Click Share", unit: "%", min: 8, max: 35, step: 1, defaultValue: 18 },
      { id: "avgTicket", label: "Average Customer Job Value", unit: "$", min: 80, max: 15000, step: 50, defaultValue: 650 },
    ],
    outputs: [
      { id: "monthlyCalls", label: "Projected Monthly Calls & Visits", formula: "round(localSearches * (mapPackShare / 100), 0)", format: "number" },
      { id: "bookedRevenue", label: "Projected Monthly Local Revenue (25% Close)", formula: "round(localSearches * (mapPackShare / 100) * 0.25 * avgTicket, 0)", format: "currency", highlight: true },
    ],
  }),
  makeAiTool({
    slug: "white-label-schema-faq-meta-brief-assistant",
    title: "White-Label On-Page Meta, FAQ & Schema Brief AI",
    vertical: "white-label-seo-agency",
    verticalLabel: "White-Label Marketing & SEO",
    exclusive: false,
    eyebrow: "WHITE-LABEL SEO WORKBENCH",
    summary: "Generate pixel-safe meta titles (<580px), answer-engine FAQ blocks, and JSON-LD schema recommendations under your agency brand.",
    leadMagnetHook: "Send this full on-page optimization brief to my inbox",
    badges: ["<580px Meta Title", "AEO Direct Answer", "JSON-LD Ready"],
    fields: [
      { id: "targetKeyword", label: "Primary Target Keyword & Page URL", placeholder: "commercial solar installation dallas", defaultValue: "b2b saas technical seo audit services" },
      { id: "brandOffer", label: "Client Brand & Core Value Prop", placeholder: "Apex Solar — 0-down commercial arrays", defaultValue: "Northstar Digital — revenue-first technical SEO & programmatic content" },
    ],
    systemInstruction: "Produce a 55-character meta title, 150-character meta description, and 2 AEO FAQ pairs ready for JSON-LD.",
    sampleOutputTitle: "Pixel-Verified Meta Snippet + Answer-Engine FAQ Pack",
    sampleOutputBullets: [
      "Meta Title (54 chars): B2B SaaS Technical SEO Audit Services | Northstar",
      "Meta Description (148 chars): Fix crawl waste, keyword cannibalization, and schema gaps. Book a revenue-first B2B SaaS technical SEO audit with Northstar Digital.",
      "JSON-LD FAQ Pair: Includes ready-to-embed FAQPage question and concise 42-word direct answer lead.",
    ],
  }),
];

export function getMicroToolConfigBySlug(slug?: string): BuilderMicroToolConfig | null {
  if (!slug) return null;
  const clean = slug.trim().toLowerCase();
  return BUILDER_48_MICROTOOLS_CATALOG.find((item) => item.slug === clean) ?? null;
}

export function getMicroToolsByVertical(vertical: MicroToolVerticalId | "all"): BuilderMicroToolConfig[] {
  if (vertical === "all") return BUILDER_48_MICROTOOLS_CATALOG;
  return BUILDER_48_MICROTOOLS_CATALOG.filter((item) => item.vertical === vertical);
}

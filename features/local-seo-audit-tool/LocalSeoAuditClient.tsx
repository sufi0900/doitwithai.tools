"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Download,
  Sparkles,
  Loader2,
  ArrowRight,
  MapPin,
  SearchCheck,
  Building2,
  Compass,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";

export type LocalAuditPreset = {
  id: string;
  label: string;
  businessName: string;
  primaryService: string;
  targetCityAreas: string;
  napDetails: string;
  gbpMetrics: string;
  currentPageSignals: string;
};

export const LOCAL_AUDIT_PRESETS: LocalAuditPreset[] = [
  {
    id: "smb-home-service",
    label: "SMB Home Service (Map Pack & 'Near Me')",
    businessName: "Apex Hydro Plumbing & Drain",
    primaryService: "Emergency Plumber & Tankless Water Heater Repair",
    targetCityAreas: "Austin, Round Rock, Cedar Park & South Congress, TX",
    napDetails: "512-555-0194 | 1420 S Congress Ave, Suite 200, Austin, TX 78704 | https://apexhydroplumbing.com/austin-plumber",
    gbpMetrics: "68 Google reviews (4.9★), Primary: Plumber, Secondary: Water Heater Installation Service, Drainage Service | 24 geo-tagged job photos",
    currentPageSignals: "Title: Austin Plumber | H1: Welcome to Apex Hydro Plumbing | Missing LocalBusiness JSON-LD & neighborhood service sections",
  },
  {
    id: "local-ecommerce-storefront",
    label: "Local E-Commerce & Storefront Geo-Targeting",
    businessName: "Nordic Timber Acoustic Studio & Showroom",
    primaryService: "Acoustic Wood Wall Panels & Custom Home Studio Design",
    targetCityAreas: "Chicago, West Loop, River North & Oak Park, IL",
    napDetails: "312-555-0148 | 840 W Fulton Market, Chicago, IL 60607 | https://nordictimberacoustics.com/chicago-showroom",
    gbpMetrics: "42 Google reviews (4.8★), Primary: Acoustical Consultant, Secondary: Home Improvement Store | In-store pickup & local inventory enabled",
    currentPageSignals: "Title: Acoustic Wall Panels Chicago Showroom | H1: Acoustic Panels Near Me in West Loop Chicago | Has Product schema but missing LocalBusiness areaServed",
  },
  {
    id: "healthcare-legal-practice",
    label: "Dental / Medical / Legal Practice Audit",
    businessName: "BrightSmile Implant & Cosmetic Dentistry",
    primaryService: "Dental Implants, Invisalign & Same-Day Crowns",
    targetCityAreas: "Scottsdale, Paradise Valley & North Phoenix, AZ",
    napDetails: "480-555-0182 | 7300 E Camelback Rd, Suite 110, Scottsdale, AZ 85251 | https://brightsmilescottsdale.com",
    gbpMetrics: "115 Google reviews (4.9★), Primary: Cosmetic Dentist, Secondary: Dental Implants Periodontist, Emergency Dental Service",
    currentPageSignals: "Title: Cosmetic Dentist Scottsdale AZ - BrightSmile | H1: Dental Implants & Invisalign in Scottsdale, AZ | Has Dentist JSON-LD & FAQPage",
  },
];

export type LocalKeywordRow = {
  keyword: string;
  intentType: "Near Me (Implicit)" | "City + Service (Explicit)" | "Emergency / Transactional" | "AI Voice / Local Q&A";
  recommendedPlacement: string;
};

export type LocalAuditCard = {
  id: string;
  badge: string;
  title: string;
  scoreLabel: string;
  bodyText: string;
  actionItems: string[];
  tone: "emerald" | "sky" | "amber" | "purple";
};

export type LocalSeoAuditPack = {
  overallLocalScore: number;
  gbpMapPackScore: number;
  nearMeCoverageScore: number;
  napCitationScore: number;
  keywordMatrix: LocalKeywordRow[];
  localSchemaJson: string;
  cards: LocalAuditCard[];
};

export function runLocalSeoAudit(params: {
  businessName: string;
  primaryService: string;
  targetCityAreas: string;
  napDetails: string;
  gbpMetrics: string;
  currentPageSignals: string;
}): LocalSeoAuditPack {
  const biz = params.businessName.trim() || LOCAL_AUDIT_PRESETS[0].businessName;
  const service =
    params.primaryService.trim() || LOCAL_AUDIT_PRESETS[0].primaryService;
  const areas =
    params.targetCityAreas.trim() || LOCAL_AUDIT_PRESETS[0].targetCityAreas;
  const nap = params.napDetails.trim() || LOCAL_AUDIT_PRESETS[0].napDetails;
  const gbp = params.gbpMetrics.trim() || LOCAL_AUDIT_PRESETS[0].gbpMetrics;
  const pageSignals =
    params.currentPageSignals.trim() ||
    LOCAL_AUDIT_PRESETS[0].currentPageSignals;

  const primaryCity = areas.split(",")[0]?.trim() || "Austin";
  const coreService = service.split("&")[0]?.trim() || "Local Service";

  const hasPhone = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(nap);
  const hasZip = /\b\d{5}(-\d{4})?\b/.test(nap);
  const hasUrl = /https?:\/\/[^\s|]+/i.test(nap);
  const reviewMatch = gbp.match(/(\d+)\s*(google\s*)?reviews?/i);
  const reviewCount = reviewMatch ? parseInt(reviewMatch[1], 10) : 35;
  const hasSecondaryCat = /secondary/i.test(gbp);
  const missingSchema = /missing\s+localbusiness/i.test(pageSignals);
  const weakH1 = /welcome to/i.test(pageSignals);

  const gbpMapPackScore = Math.max(
    40,
    Math.min(
      99,
      68 +
        (reviewCount >= 50 ? 14 : 7) +
        (hasSecondaryCat ? 10 : 0) +
        (/photo/i.test(gbp) ? 6 : 0),
    ),
  );

  const napCitationScore = Math.max(
    45,
    Math.min(
      99,
      62 + (hasPhone ? 13 : 0) + (hasZip ? 12 : 0) + (hasUrl ? 11 : 0),
    ),
  );

  const nearMeCoverageScore = Math.max(
    42,
    Math.min(
      98,
      86 - (missingSchema ? 14 : 0) - (weakH1 ? 12 : 0) + (areas.includes(",") ? 8 : 0),
    ),
  );

  const overallLocalScore = Math.round(
    gbpMapPackScore * 0.38 +
      nearMeCoverageScore * 0.34 +
      napCitationScore * 0.28,
  );

  const keywordMatrix: LocalKeywordRow[] = [
    {
      keyword: `${coreService.toLowerCase()} near me`,
      intentType: "Near Me (Implicit)",
      recommendedPlacement: "GBP Services List + Opening 100-Word Proximity Proof + Customer Review Responses",
    },
    {
      keyword: `best ${coreService.toLowerCase()} in ${primaryCity.toLowerCase()}`,
      intentType: "City + Service (Explicit)",
      recommendedPlacement: "Primary SEO Title Tag + H1 Heading + Self-Referencing City URL Slug",
    },
    {
      keyword: `same day ${coreService.toLowerCase()} ${primaryCity.toLowerCase()} open now`,
      intentType: "Emergency / Transactional",
      recommendedPlacement: "Above-the-Fold Trust Bar + GBP Opening Hours + Click-to-Call CTA Button",
    },
    {
      keyword: `how much does ${coreService.toLowerCase()} cost in ${primaryCity.toLowerCase()}`,
      intentType: "AI Voice / Local Q&A",
      recommendedPlacement: "50-Word Local Pricing Quick Answer + FAQPage Schema for Google AI Overviews",
    },
  ];

  const phoneExtracted =
    nap.match(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/)?.[0] || "512-555-0194";
  const urlExtracted =
    nap.match(/https?:\/\/[^\s|]+/i)?.[0] || "https://doitwithai.tools";
  const areaList = areas
    .split(/[,&]+/)
    .map((a) => a.trim())
    .filter(Boolean);

  const localSchemaObj = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: biz,
    description: `${service} serving ${areas} with verified local response and transparent pricing.`,
    url: urlExtracted,
    telephone: phoneExtracted,
    areaServed: areaList.map((city) => ({
      "@type": "City",
      name: city,
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: String(reviewCount),
    },
  };

  const localSchemaJson = JSON.stringify(localSchemaObj, null, 2);

  const cards: LocalAuditCard[] = [
    {
      id: "gbp-map-pack-readiness",
      badge: "Google Map Pack & GBP Audit",
      title: "1. Google Business Profile & 3-Pack Ranking Signals",
      scoreLabel: `${gbpMapPackScore}/100 Map Pack`,
      bodyText: `Audited "${biz}" for "${coreService}" across ${areas}. You currently have ${reviewCount} reviews and ${hasSecondaryCat ? "both primary and secondary GBP categories configured" : "room to add secondary GBP service categories"}. Winning the top-3 Map Pack requires exact primary category alignment, steady review velocity mentioning "${primaryCity}", and active service-area attributes.`,
      actionItems: [
        `Set your exact Primary GBP Category to match "${coreService}" and add 2–4 secondary categories covering adjacent high-margin services.`,
        `Reply to every Google review within 24 hours, naturally referencing the service performed and neighborhood (${areaList.slice(0, 3).join(", ")}).`,
        "Upload 3–5 authentic job or showroom photos per month with clear exterior signage and team equipment.",
      ],
      tone: gbpMapPackScore >= 80 ? "emerald" : "amber",
    },
    {
      id: "near-me-onpage-optimization",
      badge: "'Near Me' & City Landing Page SEO",
      title: "2. On-Page Title, H1 & 'Near Me' Proximity Signals",
      scoreLabel: `${nearMeCoverageScore}/100 On-Page`,
      bodyText:
        weakH1 || missingSchema
          ? `Detected on-page gaps (${weakH1 ? "generic 'Welcome to' H1 without service/city" : "H1 present"}${missingSchema ? ", missing LocalBusiness JSON-LD" : ""}). Ranking for "${coreService.toLowerCase()} near me" does not mean stuffing the words "near me" into every heading—it requires proving physical proximity through neighborhood landmarks, driving corridors, ZIP codes, and embedded LocalBusiness schema.`
          : `Strong local on-page signals detected for ${primaryCity}. Keep reinforcing hyper-local proof with neighborhood landmarks and localized pricing tables.`,
      actionItems: [
        `Upgrade SEO Title to: "${coreService} in ${primaryCity} | ${biz}" (clean, high-CTR, under 580px).`,
        `Upgrade H1 to: "${service} Serving ${areas}" and place a 50-word local cost & response-time Quick Answer directly below.`,
        `Add a dedicated "Neighborhoods & ZIP Codes We Serve in ${primaryCity}" section citing local landmarks and response times.`,
      ],
      tone: nearMeCoverageScore >= 80 ? "sky" : "amber",
    },
    {
      id: "nap-citation-consistency",
      badge: "NAP & SMB Directory Citations",
      title: "3. NAP Consistency & Local Citation Ecosystem Audit",
      scoreLabel: `${napCitationScore}/100 Citations`,
      bodyText: `Verified NAP string (${nap}). ${hasPhone && hasZip && hasUrl ? "Phone, 5-digit ZIP code, and canonical landing page URL are all present." : "Missing one or more structured NAP components (Phone, ZIP, or Landing URL)."} Search engines and AI assistants (ChatGPT Search, Apple Siri, Perplexity) cross-check your website footer NAP against Apple Business Connect, Bing Places, Yelp, and BBB.`,
      actionItems: [
        "Use the exact same suite/street abbreviation and phone number format across your website footer, GBP, Apple Business Connect, and Bing Places.",
        "Point your GBP website button to the dedicated city/location page rather than a generic national homepage when running multi-location SEO.",
        "Embed a clickable tel: link and Google Maps directions link in the hero and footer of your local landing page.",
      ],
      tone: napCitationScore >= 85 ? "emerald" : "amber",
    },
    {
      id: "local-schema-jsonld",
      badge: "Copy-Paste LocalBusiness JSON-LD",
      title: "4. Ready-to-Embed LocalBusiness & areaServed Schema",
      scoreLabel: `${overallLocalScore}/100 Overall`,
      bodyText: localSchemaJson,
      actionItems: [
        "Paste this LocalBusiness JSON-LD block into your local landing page <head> so Google and AI engines map your exact service areas.",
        "Validate additional subtype properties (Dentist, Plumber, LegalService, Store) in our LocalBusiness Schema Markup Generator.",
      ],
      tone: "purple",
    },
  ];

  return {
    overallLocalScore,
    gbpMapPackScore,
    nearMeCoverageScore,
    napCitationScore,
    keywordMatrix,
    localSchemaJson,
    cards,
  };
}

export default function LocalSeoAuditClient() {
  const [businessName, setBusinessName] = useState(
    LOCAL_AUDIT_PRESETS[0].businessName,
  );
  const [primaryService, setPrimaryService] = useState(
    LOCAL_AUDIT_PRESETS[0].primaryService,
  );
  const [targetCityAreas, setTargetCityAreas] = useState(
    LOCAL_AUDIT_PRESETS[0].targetCityAreas,
  );
  const [napDetails, setNapDetails] = useState(
    LOCAL_AUDIT_PRESETS[0].napDetails,
  );
  const [gbpMetrics, setGbpMetrics] = useState(
    LOCAL_AUDIT_PRESETS[0].gbpMetrics,
  );
  const [currentPageSignals, setCurrentPageSignals] = useState(
    LOCAL_AUDIT_PRESETS[0].currentPageSignals,
  );

  const [pack, setPack] = useState<LocalSeoAuditPack>(() =>
    runLocalSeoAudit(LOCAL_AUDIT_PRESETS[0]),
  );
  const [isRunning, setIsRunning] = useState(false);
  const [runMode, setRunMode] = useState<"local" | "ai">("local");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPack(
      runLocalSeoAudit({
        businessName,
        primaryService,
        targetCityAreas,
        napDetails,
        gbpMetrics,
        currentPageSignals,
      }),
    );
  }, [
    businessName,
    primaryService,
    targetCityAreas,
    napDetails,
    gbpMetrics,
    currentPageSignals,
  ]);

  const applyPreset = (preset: LocalAuditPreset) => {
    setBusinessName(preset.businessName);
    setPrimaryService(preset.primaryService);
    setTargetCityAreas(preset.targetCityAreas);
    setNapDetails(preset.napDetails);
    setGbpMetrics(preset.gbpMetrics);
    setCurrentPageSignals(preset.currentPageSignals);
    setTimeout(() => {
      focusToolSection(resultsRef.current);
    }, 80);
  };

  const handleInstantAudit = () => {
    setRunMode("local");
    setIsRunning(true);
    setTimeout(() => {
      const updated = runLocalSeoAudit({
        businessName,
        primaryService,
        targetCityAreas,
        napDetails,
        gbpMetrics,
        currentPageSignals,
      });
      setPack(updated);
      setIsRunning(false);
      focusToolSection(resultsRef.current);
    }, 300);
  };

  const handleAiDeepLocalAudit = async () => {
    setRunMode("ai");
    setIsRunning(true);
    try {
      const res = await fetch("/api/ai-tools/local-seo-audit-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          primaryService,
          targetCityAreas,
          napDetails,
          gbpMetrics,
          currentPageSignals,
        }),
      });
      const data = await res.json();
      if (data?.ok && data?.pack) {
        setPack(data.pack);
      }
    } catch {
      // Deterministic audit remains active
    } finally {
      setIsRunning(false);
      focusToolSection(resultsRef.current);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportMarkdown = () => {
    const md = [
      `# Free Local SEO Audit & 'Near Me' Optimization Report`,
      `- **Business Name**: ${businessName}`,
      `- **Primary Service**: ${primaryService}`,
      `- **Target Cities & Neighborhoods**: ${targetCityAreas}`,
      `- **Overall Local SEO Score**: ${pack.overallLocalScore}/100`,
      `- **GBP & Map Pack Readiness**: ${pack.gbpMapPackScore}/100`,
      `- **'Near Me' & On-Page Score**: ${pack.nearMeCoverageScore}/100`,
      `- **NAP & Citation Score**: ${pack.napCitationScore}/100`,
      ``,
      `## 'Near Me' & Local Keyword Matrix`,
      ...pack.keywordMatrix.map(
        (k) => `- **${k.keyword}** (${k.intentType}) → *${k.recommendedPlacement}*`,
      ),
      ``,
      ...pack.cards.map(
        (c) =>
          `## ${c.title} (${c.scoreLabel})\n${c.bodyText}\n\n${c.actionItems.map((a) => `- ${a}`).join("\n")}`,
      ),
    ].join("\n\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "local-seo-audit-report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const rows = [
      ["Section", "Badge", "Score", "Diagnostic Summary", "Action Items"],
      ...pack.cards.map((c) => [
        c.title,
        c.badge,
        c.scoreLabel,
        c.bodyText.replace(/"/g, '""'),
        c.actionItems.join(" | ").replace(/"/g, '""'),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "local-seo-audit-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toneClasses: Record<LocalAuditCard["tone"], string> = {
    emerald:
      "border-emerald-500/30 bg-emerald-950/20 text-emerald-100 dark:border-emerald-500/30",
    sky: "border-sky-500/30 bg-sky-950/20 text-sky-100 dark:border-sky-500/30",
    amber:
      "border-amber-500/30 bg-amber-950/20 text-amber-100 dark:border-amber-500/30",
    purple:
      "border-purple-500/30 bg-purple-950/20 text-purple-100 dark:border-purple-500/30",
  };

  return (
    <div className="relative space-y-8">
      <ToolRunOverlay active={isRunning} title={
          runMode === "ai"
            ? "Synthesizing AI Map Pack & Hyper-Local Geo-Targeting Plan..."
            : "Auditing GBP Signals, 'Near Me' Keywords, NAP & Local Schema..."
        } description="Analyzing data and compiling real-time report..." />

      {/* TOP INPUT DASHBOARD */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300">
              <MapPin className="h-3.5 w-3.5" /> Free Local SEO Audit · Near Me Keywords · SMB Map Pack
            </span>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Configure Your SMB Local SEO &amp; &ldquo;Near Me&rdquo; Audit
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {LOCAL_AUDIT_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-blue-400 hover:bg-slate-800"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Business / Practice / Store Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., Apex Hydro Plumbing & Drain"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              2. Primary Service or Product Category
            </label>
            <input
              type="text"
              value={primaryService}
              onChange={(e) => setPrimaryService(e.target.value)}
              placeholder="e.g., Emergency Plumber & Water Heater Repair"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              3. Target City, Neighborhoods &amp; State
            </label>
            <input
              type="text"
              value={targetCityAreas}
              onChange={(e) => setTargetCityAreas(e.target.value)}
              placeholder="e.g., Austin, Round Rock & Cedar Park, TX"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              4. NAP String (Phone, Street, ZIP &amp; URL)
            </label>
            <textarea
              rows={3}
              value={napDetails}
              onChange={(e) => setNapDetails(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-xs leading-5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              5. Google Business Profile (GBP) Signals
            </label>
            <textarea
              rows={3}
              value={gbpMetrics}
              onChange={(e) => setGbpMetrics(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-xs leading-5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              6. Current Landing Page Title, H1 &amp; Schema
            </label>
            <textarea
              rows={3}
              value={currentPageSignals}
              onChange={(e) => setCurrentPageSignals(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-xs leading-5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-5">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleInstantAudit}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#4662df] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-500 disabled:opacity-50"
            >
              <Compass className="h-4 w-4" />
              Run Free Local SEO Audit
            </button>

            <button
              type="button"
              onClick={handleAiDeepLocalAudit}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-2xl border border-purple-400/40 bg-purple-500/15 px-5 py-3 text-sm font-bold text-purple-200 transition hover:bg-purple-500/25 disabled:opacity-50"
            >
              {isRunning && runMode === "ai" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              AI Deep Map Pack &amp; Geo-Targeting Plan
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportMarkdown}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              <Download className="h-3.5 w-3.5" /> Export .MD
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              <Download className="h-3.5 w-3.5" /> Export .CSV
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM RESULTS DASHBOARD */}
      <div ref={resultsRef} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Overall Local SEO Score
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.overallLocalScore}/100
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Composite SMB &amp; Map Pack readiness
            </p>
          </div>

          <div className="rounded-2xl border border-sky-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-300">
              GBP &amp; 3-Pack Readiness
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.gbpMapPackScore}/100
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Categories, reviews &amp; photo velocity
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
              &ldquo;Near Me&rdquo; &amp; On-Page
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.nearMeCoverageScore}/100
            </p>
            <p className="mt-1 text-xs text-slate-400">
              City H1, landmarks &amp; proximity proof
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
              NAP &amp; Citation Consistency
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.napCitationScore}/100
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Phone, ZIP, URL &amp; directory match
            </p>
          </div>
        </div>

        {/* NEAR ME KEYWORD MATRIX */}
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <h3 className="text-sm font-black uppercase tracking-wider text-blue-300">
            Generated &ldquo;Near Me&rdquo; &amp; Geo-Modified Keyword Placement Matrix
          </h3>
          <table className="mt-4 w-full text-left text-xs text-slate-200">
            <thead className="border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400">
              <tr>
                <th className="pb-3 pr-4">Target Local Keyword</th>
                <th className="pb-3 pr-4">Local Search Intent</th>
                <th className="pb-3 pr-4">Where to Place on Your Page &amp; GBP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {pack.keywordMatrix.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-3 pr-4 font-mono font-bold text-white">
                    {row.keyword}
                  </td>
                  <td className="py-3 pr-4 text-emerald-300">
                    {row.intentType}
                  </td>
                  <td className="py-3 pr-4 text-slate-300">
                    {row.recommendedPlacement}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4 DIAGNOSTIC & SCHEMA CARDS */}
        <div className="grid gap-5 md:grid-cols-2">
          {pack.cards.map((card) => (
            <div
              key={card.id}
              className={`flex flex-col justify-between rounded-3xl border p-6 shadow-xl ${toneClasses[card.tone]}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    {card.badge}
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider">
                    {card.scoreLabel}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-black text-white">
                  {card.title}
                </h3>

                <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-950/85 p-4 font-mono text-xs leading-6 text-slate-200">
                  {card.bodyText}
                </pre>

                <ul className="mt-4 space-y-2 text-xs text-slate-200">
                  {card.actionItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <SearchCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      card.id,
                      `${card.title} (${card.scoreLabel})\n${card.bodyText}`,
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedId === card.id ? "Copied!" : "Copy Card"}
                </button>

                <Link
                  href="/tools/local-seo-service-page-planner"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-300 hover:underline"
                >
                  Plan City Pages Next <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

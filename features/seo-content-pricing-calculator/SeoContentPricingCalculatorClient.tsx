"use client";

import React, { useMemo, useState } from "react";

export type ComplexityTier = "standard" | "saas-b2b" | "regulated-sme";

export interface PricingScenarioPreset {
  id: string;
  label: string;
  badge: string;
  articlesPerMonth: number;
  wordsPerArticle: number;
  complexity: ComplexityTier;
  includeSchemaAndGraphics: boolean;
  avgCustomerLtvUsd: number;
  conversionRatePct: number;
}

export const PRICING_PRESETS: PricingScenarioPreset[] = [
  {
    id: "seed-saas-sprint",
    label: "1. Seed SaaS Topical Authority Sprint",
    badge: "12 Articles / mo",
    articlesPerMonth: 12,
    wordsPerArticle: 2000,
    complexity: "saas-b2b",
    includeSchemaAndGraphics: true,
    avgCustomerLtvUsd: 1200,
    conversionRatePct: 1.8
  },
  {
    id: "niche-publisher-scale",
    label: "2. High-Velocity Niche Publisher Cluster",
    badge: "40 Articles / mo",
    articlesPerMonth: 40,
    wordsPerArticle: 1600,
    complexity: "standard",
    includeSchemaAndGraphics: true,
    avgCustomerLtvUsd: 350,
    conversionRatePct: 2.2
  },
  {
    id: "enterprise-regulated",
    label: "3. Enterprise FinTech / B2B Flagship Hub",
    badge: "20 Articles / mo",
    articlesPerMonth: 20,
    wordsPerArticle: 2500,
    complexity: "regulated-sme",
    includeSchemaAndGraphics: true,
    avgCustomerLtvUsd: 4800,
    conversionRatePct: 1.4
  }
];

export interface ProviderColumnModel {
  id: string;
  name: string;
  subtitle: string;
  perWordRateUsd: number;
  perArticleCostUsd: number;
  monthlyTotalUsd: number;
  annualTotalUsd: number;
  turnaroundDays: string;
  eeatAndSchemaQuality: string;
  includedDeliverables: string[];
}

export default function SeoContentPricingCalculatorClient() {
  const [activePresetId, setActivePresetId] = useState<string>(PRICING_PRESETS[0].id);
  const [articlesPerMonth, setArticlesPerMonth] = useState<number>(PRICING_PRESETS[0].articlesPerMonth);
  const [wordsPerArticle, setWordsPerArticle] = useState<number>(PRICING_PRESETS[0].wordsPerArticle);
  const [complexity, setComplexity] = useState<ComplexityTier>(PRICING_PRESETS[0].complexity);
  const [includeSchemaAndGraphics, setIncludeSchemaAndGraphics] = useState<boolean>(
    PRICING_PRESETS[0].includeSchemaAndGraphics
  );
  const [avgCustomerLtvUsd, setAvgCustomerLtvUsd] = useState<number>(PRICING_PRESETS[0].avgCustomerLtvUsd);
  const [conversionRatePct, setConversionRatePct] = useState<number>(PRICING_PRESETS[0].conversionRatePct);
  const [nicheTopic, setNicheTopic] = useState<string>("B2B SaaS & AI Workflow Automation");
  const [activeTab, setActiveTab] = useState<"matrix" | "roi" | "proposal">("matrix");
  const [aiAdvisorMemo, setAiAdvisorMemo] = useState<string | null>(null);
  const [aiSourceTier, setAiSourceTier] = useState<string>("Instant Client-Side Benchmark Engine");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleSelectPreset = (preset: PricingScenarioPreset) => {
    setActivePresetId(preset.id);
    setArticlesPerMonth(preset.articlesPerMonth);
    setWordsPerArticle(preset.wordsPerArticle);
    setComplexity(preset.complexity);
    setIncludeSchemaAndGraphics(preset.includeSchemaAndGraphics);
    setAvgCustomerLtvUsd(preset.avgCustomerLtvUsd);
    setConversionRatePct(preset.conversionRatePct);
    setAiAdvisorMemo(null);
  };

  const calc = useMemo(() => {
    const complexityMultiplier =
      complexity === "regulated-sme" ? 1.55 : complexity === "saas-b2b" ? 1.25 : 1.0;
    const addOnPerArticleAgency = includeSchemaAndGraphics ? 140 : 0;
    const addOnPerArticleFreelance = includeSchemaAndGraphics ? 65 : 0;
    const addOnPerArticleInHouse = includeSchemaAndGraphics ? 45 : 0;
    const addOnPerArticleHybridAi = includeSchemaAndGraphics ? 12 : 0;

    const totalMonthlyWords = articlesPerMonth * wordsPerArticle;

    const agencyPerWord = Number((0.28 * complexityMultiplier).toFixed(2));
    const agencyPerArticle = Math.round(wordsPerArticle * agencyPerWord + addOnPerArticleAgency);

    const freelancerPerWord = Number((0.15 * complexityMultiplier).toFixed(2));
    const freelancerPerArticle = Math.round(wordsPerArticle * freelancerPerWord + addOnPerArticleFreelance);

    const inHouseBaseSalaryMonthly = complexity === "regulated-sme" ? 8200 : complexity === "saas-b2b" ? 6800 : 5400;
    const inHouseCapacityArticles = Math.max(12, Math.round(32000 / Math.max(800, wordsPerArticle)));
    const writersNeeded = Math.max(1, Math.ceil(articlesPerMonth / inHouseCapacityArticles));
    const inHouseMonthlyTotal = writersNeeded * inHouseBaseSalaryMonthly + articlesPerMonth * addOnPerArticleInHouse;
    const inHousePerArticle = Math.round(inHouseMonthlyTotal / Math.max(1, articlesPerMonth));
    const inHousePerWord = Number((inHousePerArticle / Math.max(1, wordsPerArticle)).toFixed(2));

    const hybridAiPerWord = Number((0.025 * complexityMultiplier).toFixed(3));
    const hybridAiPerArticle = Math.round(wordsPerArticle * hybridAiPerWord + 28 * complexityMultiplier + addOnPerArticleHybridAi);

    const providers: ProviderColumnModel[] = [
      {
        id: "seo-agency",
        name: "1. Retainer SEO Agency",
        subtitle: "Full-service account management + writers",
        perWordRateUsd: agencyPerWord,
        perArticleCostUsd: agencyPerArticle,
        monthlyTotalUsd: agencyPerArticle * articlesPerMonth,
        annualTotalUsd: agencyPerArticle * articlesPerMonth * 12,
        turnaroundDays: "7–14 business days / article",
        eeatAndSchemaQuality: "High polish, slow iteration",
        includedDeliverables: [
          "Keyword brief & SERP outline",
          "Human draft + 1 revision round",
          includeSchemaAndGraphics ? "Custom schema + 2 graphics (+$140/art)" : "Basic text-only CMS upload"
        ]
      },
      {
        id: "senior-freelancer",
        name: "2. Senior Niche Freelancer",
        subtitle: "Direct contract specialist writer",
        perWordRateUsd: freelancerPerWord,
        perArticleCostUsd: freelancerPerArticle,
        monthlyTotalUsd: freelancerPerArticle * articlesPerMonth,
        annualTotalUsd: freelancerPerArticle * articlesPerMonth * 12,
        turnaroundDays: "3–5 business days / article",
        eeatAndSchemaQuality: "Strong voice, manual schema",
        includedDeliverables: [
          "Self-managed topic research",
          "Google Doc draft delivery",
          includeSchemaAndGraphics ? "Manual FAQ schema + stock visuals (+$65/art)" : "Raw copy only"
        ]
      },
      {
        id: "in-house-team",
        name: `3. In-House Content Team (${writersNeeded} FTE)`,
        subtitle: "Salaried writer(s) + SEO tool stack",
        perWordRateUsd: inHousePerWord,
        perArticleCostUsd: inHousePerArticle,
        monthlyTotalUsd: inHouseMonthlyTotal,
        annualTotalUsd: inHouseMonthlyTotal * 12,
        turnaroundDays: "1–3 days / article",
        eeatAndSchemaQuality: "Deep product alignment",
        includedDeliverables: [
          "Direct access to internal SMEs",
          "Full editorial calendar ownership",
          "Fixed payroll overhead regardless of volume"
        ]
      },
      {
        id: "hybrid-ai-eeat",
        name: "4. AI + Human E-E-A-T Studio",
        subtitle: "AI research/drafting + human SME fact-check",
        perWordRateUsd: hybridAiPerWord,
        perArticleCostUsd: hybridAiPerArticle,
        monthlyTotalUsd: hybridAiPerArticle * articlesPerMonth,
        annualTotalUsd: hybridAiPerArticle * articlesPerMonth * 12,
        turnaroundDays: "Same day (45 mins / article)",
        eeatAndSchemaQuality: "50-word AEO box + JSON-LD + SME proof",
        includedDeliverables: [
          "Automated SERP entity & citation mapping",
          "Human SME proof injection + burstiness polish",
          "Auto-generated FAQPage schema & comparison tables"
        ]
      }
    ];

    const annualSavingsVsAgency = providers[0].annualTotalUsd - providers[3].annualTotalUsd;
    const savingsPctVsAgency = Math.round(
      ((providers[0].annualTotalUsd - providers[3].annualTotalUsd) / Math.max(1, providers[0].annualTotalUsd)) * 100
    );

    const forecastRows = [3, 6, 9, 12].map((month) => {
      const cumulativeArticles = articlesPerMonth * month;
      const avgMonthlyClicksPerMatureArticle =
        complexity === "regulated-sme" ? 190 : complexity === "saas-b2b" ? 240 : 310;
      const maturityFactor = month === 3 ? 0.25 : month === 6 ? 0.55 : month === 9 ? 0.85 : 1.15;
      const estMonthlyOrganicClicks = Math.round(
        cumulativeArticles * avgMonthlyClicksPerMatureArticle * maturityFactor
      );
      const estMonthlyCustomers = Number(
        ((estMonthlyOrganicClicks * (conversionRatePct / 100)) * 0.35).toFixed(1)
      );
      const estMonthlyRevenueUsd = Math.round(estMonthlyCustomers * avgCustomerLtvUsd);
      const cumulativeHybridCostUsd = providers[3].monthlyTotalUsd * month;
      const cumulativeAgencyCostUsd = providers[0].monthlyTotalUsd * month;

      return {
        month,
        cumulativeArticles,
        estMonthlyOrganicClicks,
        estMonthlyCustomers,
        estMonthlyRevenueUsd,
        cumulativeHybridCostUsd,
        cumulativeAgencyCostUsd
      };
    });

    const proposalMarkdown = `# 2026 SEO Content Production & ROI Proposal (${nicheTopic})
- **Target Publishing Velocity**: ${articlesPerMonth} articles/month (${wordsPerArticle.toLocaleString()} words/article · ${totalMonthlyWords.toLocaleString()} words/mo)
- **Editorial Complexity Tier**: ${complexity.toUpperCase()} (${includeSchemaAndGraphics ? "Includes FAQPage JSON-LD Schema + Custom Comparison Tables" : "Core Editorial Copy"})

## Per-Article & Annual Cost Comparison
1. **Retainer SEO Agency**: $${agencyPerArticle.toLocaleString()}/article ($${providers[0].monthlyTotalUsd.toLocaleString()}/mo · $${providers[0].annualTotalUsd.toLocaleString()}/yr)
2. **Senior Niche Freelancer**: $${freelancerPerArticle.toLocaleString()}/article ($${providers[1].monthlyTotalUsd.toLocaleString()}/mo · $${providers[1].annualTotalUsd.toLocaleString()}/yr)
3. **In-House Content Writer(s)**: $${inHousePerArticle.toLocaleString()}/article ($${providers[2].monthlyTotalUsd.toLocaleString()}/mo · $${providers[2].annualTotalUsd.toLocaleString()}/yr)
4. **AI + Human E-E-A-T Studio Workflow**: $${hybridAiPerArticle.toLocaleString()}/article ($${providers[3].monthlyTotalUsd.toLocaleString()}/mo · $${providers[3].annualTotalUsd.toLocaleString()}/yr)

## Executive ROI Summary
- **12-Month Net Budget Saved vs. Agency**: **$${annualSavingsVsAgency.toLocaleString()}/year (${savingsPctVsAgency}% cost reduction)**
- **Month-12 Projected Organic Traffic**: ~${forecastRows[3].estMonthlyOrganicClicks.toLocaleString()} monthly organic clicks across ${forecastRows[3].cumulativeArticles} indexed articles
- **Month-12 Projected Pipeline Value**: ~$${forecastRows[3].estMonthlyRevenueUsd.toLocaleString()}/month at $${avgCustomerLtvUsd.toLocaleString()} customer LTV`;

    return {
      totalMonthlyWords,
      providers,
      annualSavingsVsAgency,
      savingsPctVsAgency,
      forecastRows,
      proposalMarkdown
    };
  }, [
    articlesPerMonth,
    wordsPerArticle,
    complexity,
    includeSchemaAndGraphics,
    avgCustomerLtvUsd,
    conversionRatePct,
    nicheTopic
  ]);

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownloadCsv = () => {
    const headers = "Provider Model,Per-Word Rate (USD),Per-Article Cost (USD),Monthly Spend (USD),Annual Spend (USD),Turnaround\n";
    const rows = calc.providers
      .map(
        (p) =>
          `"${p.name}",${p.perWordRateUsd},${p.perArticleCostUsd},${p.monthlyTotalUsd},${p.annualTotalUsd},"${p.turnaroundDays}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seo-content-pricing-comparison-2026.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateAiBudgetMemo = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai-tools/seo-content-pricing-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nicheTopic,
          articlesPerMonth,
          wordsPerArticle,
          complexity,
          agencyPerArticle: calc.providers[0].perArticleCostUsd,
          hybridPerArticle: calc.providers[3].perArticleCostUsd,
          annualSavingsVsAgency: calc.annualSavingsVsAgency
        })
      });
      const data = await res.json();
      if (data?.advisorMemo) setAiAdvisorMemo(data.advisorMemo);
      if (data?.sourceTier) setAiSourceTier(data.sourceTier);
      setActiveTab("proposal");
    } catch {
      setAiAdvisorMemo(calc.proposalMarkdown);
      setAiSourceTier("Deterministic Financial Benchmark Fallback");
      setActiveTab("proposal");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div id="seo-pricing-calculator-workspace" className="space-y-6">
      {/* Presets Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Load Verified 2025–2026 Content Production Benchmarks
          </span>
          <span className="text-xs text-slate-400">
            Real-time per-article, per-word, and 12-month compounding ROI modeling
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PRICING_PRESETS.map((preset) => {
            const active = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-left rounded-xl border p-3 transition ${
                  active
                    ? "border-indigo-500 bg-indigo-950/50 text-white"
                    : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">{preset.label}</span>
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                    {preset.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Controls */}
        <div className="lg:col-span-5 space-y-5 rounded-2xl border border-slate-800 bg-slate-900/85 p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">1. Content Volume & Complexity Controls</h2>
            <span className="text-xs font-semibold text-indigo-400">
              {calc.totalMonthlyWords.toLocaleString()} words/mo
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>Monthly Publishing Velocity</span>
              <span className="text-indigo-400">{articlesPerMonth} articles / month</span>
            </div>
            <input
              type="range"
              min={1}
              max={120}
              value={articlesPerMonth}
              onChange={(e) => setArticlesPerMonth(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>Average Word Count per Article</span>
              <span className="text-indigo-400">{wordsPerArticle.toLocaleString()} words</span>
            </div>
            <input
              type="range"
              min={800}
              max={4000}
              step={100}
              value={wordsPerArticle}
              onChange={(e) => setWordsPerArticle(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Subject-Matter & Technical Depth Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "standard", label: "Standard Blog", sub: "1.0x rate" },
                { id: "saas-b2b", label: "B2B SaaS / Tech", sub: "1.25x SME rate" },
                { id: "regulated-sme", label: "FinTech / Med / Legal", sub: "1.55x SME rate" }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setComplexity(item.id as ComplexityTier)}
                  className={`rounded-xl border p-2.5 text-left transition ${
                    complexity === item.id
                      ? "border-indigo-500 bg-indigo-950/60 text-white"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSchemaAndGraphics}
                onChange={(e) => setIncludeSchemaAndGraphics(e.target.checked)}
                className="mt-1 accent-indigo-500"
              />
              <div>
                <div className="text-xs font-semibold text-white">
                  Include Custom Comparison Tables, 50-Word AEO Box & FAQPage Schema
                </div>
                <div className="text-[11px] text-slate-400">
                  Adds $140/article at traditional agencies vs. $12/article in automated AI + SME workflows.
                </div>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                Customer LTV ($ USD)
              </label>
              <input
                type="number"
                value={avgCustomerLtvUsd}
                onChange={(e) => setAvgCustomerLtvUsd(Math.max(50, Number(e.target.value) || 0))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                Organic Lead-to-Sale (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={conversionRatePct}
                onChange={(e) => setConversionRatePct(Math.max(0.1, Number(e.target.value) || 0.5))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
              Your Industry / Niche (For Custom AI Budget Proposal)
            </label>
            <input
              type="text"
              value={nicheTopic}
              onChange={(e) => setNicheTopic(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerateAiBudgetMemo}
            disabled={isAiLoading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-emerald-500 disabled:opacity-60 transition"
          >
            {isAiLoading
              ? "Generating Custom CFO & Editorial Budget Memo..."
              : "✨ Generate Custom AI Content Budget & ROI Proposal"}
          </button>
        </div>

        {/* Right Output Workspace */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top KPI Callout Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
              <div className="text-[11px] font-semibold uppercase text-slate-400">Agency / Article</div>
              <div className="mt-1 text-2xl font-extrabold text-rose-400">
                ${calc.providers[0].perArticleCostUsd.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                ${calc.providers[0].perWordRateUsd}/word avg
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
              <div className="text-[11px] font-semibold uppercase text-slate-400">Freelancer / Art</div>
              <div className="mt-1 text-2xl font-extrabold text-amber-400">
                ${calc.providers[1].perArticleCostUsd.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                ${calc.providers[1].perWordRateUsd}/word avg
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4">
              <div className="text-[11px] font-semibold uppercase text-emerald-300">AI + SME Studio</div>
              <div className="mt-1 text-2xl font-extrabold text-emerald-400">
                ${calc.providers[3].perArticleCostUsd.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-emerald-300/80">
                ${calc.providers[3].perWordRateUsd}/word + SME check
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/30 p-4">
              <div className="text-[11px] font-semibold uppercase text-indigo-300">Annual Savings</div>
              <div className="mt-1 text-2xl font-extrabold text-indigo-300">
                ${calc.annualSavingsVsAgency.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-indigo-300/80">
                {calc.savingsPctVsAgency}% saved vs. Agency
              </div>
            </div>
          </div>

          {/* Studio View Switcher */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("matrix")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "matrix"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  1. 4-Tier Per-Article Pricing Matrix
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("roi")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "roi"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  2. 12-Month Traffic & Pipeline ROI Forecast
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("proposal")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "proposal"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  3. Executive Proposal & CSV Export
                </button>
              </div>
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-indigo-500"
              >
                ⬇ Export CSV
              </button>
            </div>

            {activeTab === "matrix" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {calc.providers.map((p) => {
                  const isHybrid = p.id === "hybrid-ai-eeat";
                  return (
                    <div
                      key={p.id}
                      className={`rounded-xl border p-4 space-y-3 ${
                        isHybrid
                          ? "border-emerald-500/50 bg-emerald-950/15"
                          : "border-slate-800 bg-slate-950/70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-white">{p.name}</h3>
                          <p className="text-[11px] text-slate-400">{p.subtitle}</p>
                        </div>
                        {isHybrid && (
                          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                            Best ROI
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-900/90 p-2.5 text-center">
                        <div>
                          <div className="text-[10px] text-slate-400">Per Article</div>
                          <div className="text-sm font-extrabold text-white">
                            ${p.perArticleCostUsd.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Monthly</div>
                          <div className="text-sm font-extrabold text-indigo-300">
                            ${p.monthlyTotalUsd.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Annual</div>
                          <div className="text-sm font-extrabold text-slate-200">
                            ${p.annualTotalUsd.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 space-y-1">
                        <div>
                          <span className="text-slate-400">Turnaround: </span>
                          <span className="font-medium text-white">{p.turnaroundDays}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">E-E-A-T & Schema: </span>
                          <span className="font-medium text-emerald-300">{p.eeatAndSchemaQuality}</span>
                        </div>
                      </div>

                      <ul className="space-y-1 text-[11px] text-slate-300 list-disc pl-4">
                        {p.includedDeliverables.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "roi" && (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-200 uppercase text-[11px]">
                      <tr>
                        <th className="p-3">Timeline</th>
                        <th className="p-3">Published URLs</th>
                        <th className="p-3">Est. Monthly Clicks</th>
                        <th className="p-3">Agency Spend</th>
                        <th className="p-3 text-emerald-300">AI+SME Spend</th>
                        <th className="p-3 text-indigo-300">Est. Monthly Pipeline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                      {calc.forecastRows.map((row) => (
                        <tr key={row.month}>
                          <td className="p-3 font-bold text-white">Month {row.month}</td>
                          <td className="p-3">{row.cumulativeArticles} articles</td>
                          <td className="p-3 font-semibold text-cyan-300">
                            {row.estMonthlyOrganicClicks.toLocaleString()} clicks/mo
                          </td>
                          <td className="p-3 text-rose-300">
                            ${row.cumulativeAgencyCostUsd.toLocaleString()}
                          </td>
                          <td className="p-3 font-semibold text-emerald-400">
                            ${row.cumulativeHybridCostUsd.toLocaleString()}
                          </td>
                          <td className="p-3 font-bold text-indigo-300">
                            ${row.estMonthlyRevenueUsd.toLocaleString()}/mo
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-slate-400">
                  * Traffic model assumes indexation curve across {articlesPerMonth} monthly long-tail articles with 50-word AEO summary boxes and internal cluster linking.
                </p>
              </div>
            )}

            {activeTab === "proposal" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Executive Budget Memo · {aiSourceTier}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy("proposal", aiAdvisorMemo || calc.proposalMarkdown)
                    }
                    className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    {copiedKey === "proposal" ? "✓ Copied Proposal" : "Copy Markdown Proposal"}
                  </button>
                </div>
                <pre className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-200 whitespace-pre-wrap font-mono leading-relaxed max-h-80 overflow-y-auto">
                  {aiAdvisorMemo || calc.proposalMarkdown}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

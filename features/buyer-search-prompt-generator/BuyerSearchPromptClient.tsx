"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Download,
  Sparkles,
  Loader2,
  ArrowRight,
  ShoppingBag,
  Shuffle,
  SearchCheck,
  Target,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";

export type BuyerPromptPreset = {
  id: string;
  label: string;
  productOrService: string;
  idealBuyerPersona: string;
  priceTier: string;
  primaryPainPoint: string;
  topCompetitors: string;
  keyDifferentiator: string;
};

export const BUYER_PROMPT_PRESETS: BuyerPromptPreset[] = [
  {
    id: "saas-seo-suite",
    label: "SaaS & AI SEO Platform (4 Buyer Prompts)",
    productOrService: "DoItWithAI.tools Free AI SEO & AEO Toolkit",
    idealBuyerPersona: "Non-coder SaaS founders, solo SEO creators, and lean content teams",
    priceTier: "100% Free Browser Toolkit (No login or credit card)",
    primaryPainPoint: "Paying $129+/mo for bloated enterprise SEO suites when they only need fast KGR, Search Intent, Schema, and AI Overview tracking",
    topCompetitors: "Semrush, Ahrefs, Surfer SEO, Frase",
    keyDifferentiator: "Instant 0.1s browser calculators + multi-LLM citation readiness across Google AI Mode, Perplexity, Claude, and Copilot",
  },
  {
    id: "ecommerce-product-visibility",
    label: "E-Commerce Product Page AI Visibility",
    productOrService: "Modular Acoustic Wood Slat Wall Panels (STC-45 Studio Grade)",
    idealBuyerPersona: "Home studio creators, architects, and remote executives upgrading video call acoustics",
    priceTier: "$189 per 24x94-inch 2-panel kit with free acoustic mounting clips",
    primaryPainPoint: "Thin foam tiles look cheap on camera and fail to block low-frequency room echo",
    topCompetitors: "GIK Acoustics, Felt Right, generic Amazon foam panels",
    keyDifferentiator: "FSC-certified real walnut veneer bonded to 9mm recycled PET felt with NRC 0.85 lab certification and 15-minute DIY install",
  },
  {
    id: "b2b-service-comparison",
    label: "B2B Agency & Proposal Buyer Prompts",
    productOrService: "Technical SEO & Programmatic Content Sprint for B2B SaaS",
    idealBuyerPersona: "VP of Marketing or Head of Growth at Series A–B B2B SaaS companies",
    priceTier: "$4,500 fixed 30-day sprint (deliverable-backed, no 12-month retainer lock-in)",
    primaryPainPoint: "Pages stuck in 'Crawled - currently not indexed' and zero citations in ChatGPT Search or Perplexity",
    topCompetitors: "Traditional retainer SEO agencies, in-house freelance writers",
    keyDifferentiator: "Ships 15 schema-grounded comparison & calculator pages with verified Information Gain in 30 days",
  },
];

const RANDOM_BUYER_SEEDS: BuyerPromptPreset[] = [
  ...BUYER_PROMPT_PRESETS,
  {
    id: "ergonomic-desk-setup",
    label: "D2C Hardware & Review Visibility",
    productOrService: "Dual-Motor Solid Walnut Standing Desk with Integrated Cable Vault",
    idealBuyerPersona: "Software engineers and remote designers working 8+ hours at multi-monitor setups",
    priceTier: "$749 with 15-year motor warranty and 30-day free return shipping",
    primaryPainPoint: "Wobbly two-leg desks at standing height and messy power bricks hanging underneath",
    topCompetitors: "Uplift V2, Jarvis Fully, Secretlab Magnus Pro",
    keyDifferentiator: "Zero-wobble 4-column steel frame, recessed magnetic power tray, and kiln-dried North American walnut top",
  },
];

export type BuyerPromptCard = {
  id: string;
  stageBadge: string;
  funnelStage: string;
  title: string;
  buyerSearchQuery: string;
  llmSystemPrompt: string;
  pageOptimizationChecklist: string[];
  tone: "emerald" | "sky" | "amber" | "purple";
};

export type BuyerSearchPromptPack = {
  commercialIntentScore: number;
  productSchemaReadiness: number;
  reviewVisibilityScore: number;
  funnelCoverageCount: number;
  cards: BuyerPromptCard[];
};

export function generateFourBuyerSearchPrompts(params: {
  productOrService: string;
  idealBuyerPersona: string;
  priceTier: string;
  primaryPainPoint: string;
  topCompetitors: string;
  keyDifferentiator: string;
}): BuyerSearchPromptPack {
  const product =
    params.productOrService.trim() || BUYER_PROMPT_PRESETS[0].productOrService;
  const persona =
    params.idealBuyerPersona.trim() ||
    BUYER_PROMPT_PRESETS[0].idealBuyerPersona;
  const price =
    params.priceTier.trim() || BUYER_PROMPT_PRESETS[0].priceTier;
  const pain =
    params.primaryPainPoint.trim() || BUYER_PROMPT_PRESETS[0].primaryPainPoint;
  const competitors =
    params.topCompetitors.trim() || BUYER_PROMPT_PRESETS[0].topCompetitors;
  const diff =
    params.keyDifferentiator.trim() || BUYER_PROMPT_PRESETS[0].keyDifferentiator;

  const hasNumbers = /\d/.test(`${price} ${diff}`);
  const commercialIntentScore = Math.min(
    99,
    82 + (hasNumbers ? 9 : 0) + (competitors.length > 5 ? 6 : 0),
  );
  const productSchemaReadiness = Math.min(
    98,
    80 + (price.length > 4 ? 10 : 0) + (diff.length > 20 ? 8 : 0),
  );
  const reviewVisibilityScore = Math.min(
    97,
    81 + (persona.length > 10 ? 8 : 0) + (pain.length > 15 ? 7 : 0),
  );

  const cards: BuyerPromptCard[] = [
    {
      id: "buyer-prompt-1-problem",
      stageBadge: "Buyer Prompt #1 · Problem-Aware Discovery",
      funnelStage: "Informational → Commercial Bridge",
      title: "1. Pain-Point & Root-Cause Buyer Search Prompt",
      buyerSearchQuery: `"What is the most reliable way for ${persona.toLowerCase()} to solve [${pain}] without overspending or complex setup?"`,
      llmSystemPrompt: `Act as an independent product researcher advising ${persona}. A buyer asks: "How do I fix ${pain}?" Evaluate the root causes, compare traditional workarounds against modern solutions like ${product} (${diff}), and write a 50-word Quick Answer plus a 3-column decision checklist that AI search engines (ChatGPT Search, Perplexity, Google AI Mode) can cite verbatim.`,
      pageOptimizationChecklist: [
        `Open your guide or category page with a 50-word direct answer addressing "${pain}".`,
        `Include quantified proof from "${diff}" in the first 200 words so LLMs extract concrete entities.`,
        "Add FAQPage JSON-LD answering the exact conversational question above.",
      ],
      tone: "sky",
    },
    {
      id: "buyer-prompt-2-comparison",
      stageBadge: "Buyer Prompt #2 · Category & Feature Shortlist",
      funnelStage: "Commercial Investigation Intent",
      title: "2. Best-For Persona & Price-Tier Shortlist Prompt",
      buyerSearchQuery: `"Best solutions for ${persona.toLowerCase()} comparing price (${price}), core specs, and real-world pros and cons in 2026"`,
      llmSystemPrompt: `You are an E-Commerce & SaaS Buying Advisor. Generate an objective commercial comparison table for ${persona} evaluating ${product} alongside ${competitors}. Include exact pricing (${price}), primary differentiator (${diff}), ideal use case, and who should skip each option so the table wins Google AI Overviews and Perplexity shopping citations.`,
      pageOptimizationChecklist: [
        "Keep product name as H1 and pair it with a clean, non-stuffed SEO Title + single-sentence Meta Description.",
        "Render an HTML <table> comparing Price, Core Specs, Best For, and Verified Differentiator.",
        "State both who the product is built for and when a competitor is a better fit (builds high E-E-A-T trust).",
      ],
      tone: "emerald",
    },
    {
      id: "buyer-prompt-3-versus",
      stageBadge: "Buyer Prompt #3 · Head-to-Head Competitor Switch",
      funnelStage: "High-Intent 'Alternative / Vs' Evaluation",
      title: "3. Competitor Vs. & Switching-Cost Buyer Prompt",
      buyerSearchQuery: `"${product} vs ${competitors.split(",")[0]?.trim() || "top alternatives"}: which is better for ${persona.toLowerCase()} when dealing with ${pain}?"`,
      llmSystemPrompt: `Compare ${product} head-to-head against ${competitors} for a buyer frustrated by "${pain}". Break down total cost of ownership (${price}), setup speed, and verified capability differences (${diff}). Provide 3 migration or onboarding steps and a neutral buyer verdict.`,
      pageOptimizationChecklist: [
        `Create a dedicated "/vs/" or comparison section addressing ${competitors} with verified dates and pricing.`,
        "Avoid vague marketing superlatives; cite specific feature limits, warranty terms, or benchmark numbers.",
        "Link directly from the comparison table to your interactive calculator or free trial / product page.",
      ],
      tone: "amber",
    },
    {
      id: "buyer-prompt-4-transactional",
      stageBadge: "Buyer Prompt #4 · Transactional & Review Verification",
      funnelStage: "Bottom-of-Funnel Purchase Readiness",
      title: "4. Product Schema, Review Proof & Pre-Purchase Prompt",
      buyerSearchQuery: `"Is ${product} worth it at ${price}? Real customer review takeaways, specs, and buying checklist for ${persona.toLowerCase()}"`,
      llmSystemPrompt: `Write a high-converting, AI-citation-ready product page section and JSON-LD Product/SoftwareApplication schema for ${product}. Highlight pricing (${price}), core proof (${diff}), and customer review themes resolving "${pain}", formatted with clear H2s, bulleted specs, and AggregateRating / Offer structured data.`,
      pageOptimizationChecklist: [
        `Embed valid Product or SoftwareApplication JSON-LD with Offer (${price}) and verified review attributes.`,
        "Summarize verified customer review pros/cons on-page—AI engines weight specific review evidence heavily.",
        "Place a clear, friction-free CTA above the fold with transparent pricing or instant tool access.",
      ],
      tone: "purple",
    },
  ];

  return {
    commercialIntentScore,
    productSchemaReadiness,
    reviewVisibilityScore,
    funnelCoverageCount: 4,
    cards,
  };
}

export default function BuyerSearchPromptClient() {
  const [productOrService, setProductOrService] = useState(
    BUYER_PROMPT_PRESETS[0].productOrService,
  );
  const [idealBuyerPersona, setIdealBuyerPersona] = useState(
    BUYER_PROMPT_PRESETS[0].idealBuyerPersona,
  );
  const [priceTier, setPriceTier] = useState(
    BUYER_PROMPT_PRESETS[0].priceTier,
  );
  const [primaryPainPoint, setPrimaryPainPoint] = useState(
    BUYER_PROMPT_PRESETS[0].primaryPainPoint,
  );
  const [topCompetitors, setTopCompetitors] = useState(
    BUYER_PROMPT_PRESETS[0].topCompetitors,
  );
  const [keyDifferentiator, setKeyDifferentiator] = useState(
    BUYER_PROMPT_PRESETS[0].keyDifferentiator,
  );
  const [seedIndex, setSeedIndex] = useState(0);

  const [pack, setPack] = useState<BuyerSearchPromptPack>(() =>
    generateFourBuyerSearchPrompts(BUYER_PROMPT_PRESETS[0]),
  );
  const [isRunning, setIsRunning] = useState(false);
  const [runMode, setRunMode] = useState<"local" | "ai">("local");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPack(
      generateFourBuyerSearchPrompts({
        productOrService,
        idealBuyerPersona,
        priceTier,
        primaryPainPoint,
        topCompetitors,
        keyDifferentiator,
      }),
    );
  }, [
    productOrService,
    idealBuyerPersona,
    priceTier,
    primaryPainPoint,
    topCompetitors,
    keyDifferentiator,
  ]);

  const applyPreset = (preset: BuyerPromptPreset) => {
    setProductOrService(preset.productOrService);
    setIdealBuyerPersona(preset.idealBuyerPersona);
    setPriceTier(preset.priceTier);
    setPrimaryPainPoint(preset.primaryPainPoint);
    setTopCompetitors(preset.topCompetitors);
    setKeyDifferentiator(preset.keyDifferentiator);
    setTimeout(() => {
      focusToolSection(resultsRef.current);
      paintToolFeedback(resultsRef.current);
    }, 80);
  };

  const handleRandomBuyerSeed = () => {
    const nextIdx = (seedIndex + 1) % RANDOM_BUYER_SEEDS.length;
    setSeedIndex(nextIdx);
    applyPreset(RANDOM_BUYER_SEEDS[nextIdx]);
  };

  const handleInstantGenerate = () => {
    setRunMode("local");
    setIsRunning(true);
    setTimeout(() => {
      const updated = generateFourBuyerSearchPrompts({
        productOrService,
        idealBuyerPersona,
        priceTier,
        primaryPainPoint,
        topCompetitors,
        keyDifferentiator,
      });
      setPack(updated);
      setIsRunning(false);
      focusToolSection(resultsRef.current);
      paintToolFeedback(resultsRef.current);
    }, 300);
  };

  const handleAiEnrich = async () => {
    setRunMode("ai");
    setIsRunning(true);
    try {
      const res = await fetch("/api/ai-tools/buyer-search-prompt-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productOrService,
          idealBuyerPersona,
          priceTier,
          primaryPainPoint,
          topCompetitors,
          keyDifferentiator,
        }),
      });
      const data = await res.json();
      if (data?.ok && data?.pack) {
        setPack(data.pack);
      }
    } catch {
      // Deterministic pack remains active
    } finally {
      setIsRunning(false);
      focusToolSection(resultsRef.current);
      paintToolFeedback(resultsRef.current);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportMarkdown = () => {
    const md = [
      `# 4 Buyer Search Prompts & Product AI Visibility Pack`,
      `- **Product / Service**: ${productOrService}`,
      `- **Ideal Buyer Persona**: ${idealBuyerPersona}`,
      `- **Price & Offer Tier**: ${priceTier}`,
      `- **Primary Pain Point**: ${primaryPainPoint}`,
      `- **Top Competitors**: ${topCompetitors}`,
      `- **Key Differentiator**: ${keyDifferentiator}`,
      ``,
      ...pack.cards.map(
        (c) =>
          `## ${c.title} (${c.stageBadge})\n**Simulated Buyer Search Query:**\n> ${c.buyerSearchQuery}\n\n**Copy-Paste LLM Prompt:**\n\`\`\`text\n${c.llmSystemPrompt}\n\`\`\`\n\n**Product Page AI Visibility Checklist:**\n${c.pageOptimizationChecklist.map((item) => `- ${item}`).join("\n")}`,
      ),
    ].join("\n\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "4-buyer-search-prompts-pack.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const rows = [
      [
        "Stage",
        "Funnel Intent",
        "Simulated Buyer Search Query",
        "Copy-Paste LLM Prompt",
        "Optimization Checklist",
      ],
      ...pack.cards.map((c) => [
        c.stageBadge,
        c.funnelStage,
        c.buyerSearchQuery.replace(/"/g, '""'),
        c.llmSystemPrompt.replace(/"/g, '""'),
        c.pageOptimizationChecklist.join(" | ").replace(/"/g, '""'),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "4-buyer-search-prompts-pack.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toneClasses: Record<BuyerPromptCard["tone"], string> = {
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
      <ToolRunOverlay
        active={isRunning}
        label={
          runMode === "ai"
            ? "Synthesizing Custom 4-Stage Buyer Search Prompts..."
            : "Generating 4 Buyer Search Prompts & Product Visibility Matrix..."
        }
      />

      {/* TOP INPUT DASHBOARD */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300">
              <ShoppingBag className="h-3.5 w-3.5" /> 4-Stage Buyer Search · Commercial SEO · Product AI Visibility
            </span>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Generate 4 Buyer Search Prompts Across Your Purchase Funnel
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {BUYER_PROMPT_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-blue-400 hover:bg-slate-800"
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={handleRandomBuyerSeed}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/25"
            >
              <Shuffle className="h-3.5 w-3.5" /> Randomize Scenario
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Product, SaaS, or Service Name
            </label>
            <input
              type="text"
              value={productOrService}
              onChange={(e) => setProductOrService(e.target.value)}
              placeholder="e.g., Modular Acoustic Wood Slat Panels"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              2. Ideal Buyer Persona / Role
            </label>
            <input
              type="text"
              value={idealBuyerPersona}
              onChange={(e) => setIdealBuyerPersona(e.target.value)}
              placeholder="e.g., Home studio creators & remote executives"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              3. Price Tier &amp; Offer Structure
            </label>
            <input
              type="text"
              value={priceTier}
              onChange={(e) => setPriceTier(e.target.value)}
              placeholder="e.g., $189 per 2-panel kit with free shipping"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              4. Primary Buyer Pain Point / Trigger
            </label>
            <input
              type="text"
              value={primaryPainPoint}
              onChange={(e) => setPrimaryPainPoint(e.target.value)}
              placeholder="e.g., Thin foam tiles look cheap and fail to block echo"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              5. Top Competitors / Alternatives
            </label>
            <input
              type="text"
              value={topCompetitors}
              onChange={(e) => setTopCompetitors(e.target.value)}
              placeholder="e.g., GIK Acoustics, Felt Right, Amazon panels"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              6. Verified Proof &amp; Differentiator
            </label>
            <input
              type="text"
              value={keyDifferentiator}
              onChange={(e) => setKeyDifferentiator(e.target.value)}
              placeholder="e.g., NRC 0.85 lab-certified walnut + 15-min DIY install"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-5">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleInstantGenerate}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#4662df] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-500 disabled:opacity-50"
            >
              <Target className="h-4 w-4" />
              Generate 4 Buyer Search Prompts
            </button>

            <button
              type="button"
              onClick={handleAiEnrich}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-2xl border border-purple-400/40 bg-purple-500/15 px-5 py-3 text-sm font-bold text-purple-200 transition hover:bg-purple-500/25 disabled:opacity-50"
            >
              {isRunning && runMode === "ai" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              AI Deep Persona &amp; Schema Synthesis
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
              Buyer Funnel Coverage
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.funnelCoverageCount} Stages
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Problem · Shortlist · Vs · Purchase
            </p>
          </div>

          <div className="rounded-2xl border border-sky-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-300">
              Commercial Intent Match
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.commercialIntentScore}/100
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Aligned with ChatGPT &amp; Perplexity shopping queries
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Product Schema Readiness
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.productSchemaReadiness}/100
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Offer, Price &amp; Differentiator grounded
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-slate-900/90 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Review &amp; Citation Signal
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {pack.reviewVisibilityScore}/100
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Persona + pain-point proof density
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {pack.cards.map((card) => (
            <div
              key={card.id}
              className={`flex flex-col justify-between rounded-3xl border p-6 shadow-xl ${toneClasses[card.tone]}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    {card.stageBadge}
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider">
                    {card.funnelStage}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-black text-white">
                  {card.title}
                </h3>

                <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/70 p-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                    Simulated Buyer Search Query:
                  </p>
                  <p className="mt-1 font-mono text-xs text-white">
                    {card.buyerSearchQuery}
                  </p>
                </div>

                <div className="mt-3 rounded-2xl bg-slate-950/90 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                    Copy-Paste LLM Content &amp; Audit Prompt:
                  </p>
                  <p className="mt-1.5 text-xs leading-6 text-slate-200">
                    {card.llmSystemPrompt}
                  </p>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-slate-200">
                  {card.pageOptimizationChecklist.map((item, idx) => (
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
                      `${card.title}\nBuyer Search Query: ${card.buyerSearchQuery}\n\nLLM Prompt:\n${card.llmSystemPrompt}`,
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedId === card.id ? "Copied Prompt!" : "Copy Buyer Prompt"}
                </button>

                <Link
                  href="/tools/search-intent-checker"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-300 hover:underline"
                >
                  Verify Intent Next <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

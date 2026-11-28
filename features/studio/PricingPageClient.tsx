"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  createDefaultStudioState,
  loadStudioState,
  saveStudioStateOptimistic,
  setPlanTierOptimistic,
  subscribeStudioState,
} from "@/lib/studio/store";
import type { PlanTierId, StudioWorkspaceState } from "@/lib/studio/types";

export default function PricingPageClient() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [studio, setStudio] = useState<StudioWorkspaceState>(
    createDefaultStudioState,
  );
  const [loadingTier, setLoadingTier] = useState<PlanTierId | null>(null);
  const [statusNote, setStatusNote] = useState("");

  useEffect(() => {
    setStudio(loadStudioState());
    return subscribeStudioState(() => setStudio(loadStudioState()));
  }, []);

  const handleCheckout = async (tier: PlanTierId) => {
    if (tier === "free") {
      setPlanTierOptimistic("free", billingCycle);
      saveStudioStateOptimistic((prev) => ({ ...prev, guestPassActive: true }));
      router.push("/studio/onboarding");
      return;
    }

    setLoadingTier(tier);
    setStatusNote("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planTier: tier,
          billingCycle,
          returnPath: "/studio",
        }),
      });
      const payload = (await res.json()) as {
        mode?: string;
        checkoutUrl?: string;
        message?: string;
      };

      if (payload.mode === "external-checkout" && payload.checkoutUrl) {
        window.location.href = payload.checkoutUrl;
        return;
      }

      saveStudioStateOptimistic((prev) => ({
        ...prev,
        guestPassActive: true,
        planTier: tier,
        billingCycle,
      }));
      setStatusNote(
        payload.message ||
          "Plan activated! Redirecting to your unlocked /studio workspace…",
      );
      setTimeout(() => router.push("/studio"), 600);
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="bg-slate-50 px-4 py-14 text-slate-900 dark:bg-[#080E1E] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5271FF]/35 bg-[#5271FF]/10 px-3.5 py-1 text-xs font-bold text-[#5271FF] dark:text-[#b4c2ff]">
            <Sparkles size={13} />
            Simple, Transparent DIY Toolkit Pricing
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Write Better SEO Content &amp; Launch Tool Websites Without Bloat
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Use 90+ free browser SEO tools every day, or unlock the unified{" "}
            <code>/studio</code> workspace for multi-section E-E-A-T articles,
            Infographic Studio V5, saved keyword backlogs, and isolated
            Website Builder hosting.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-7 inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                billingCycle === "monthly"
                  ? "bg-[#5271FF] text-white shadow"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                billingCycle === "yearly"
                  ? "bg-[#5271FF] text-white shadow"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <span>Yearly Founding Pass</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-300">
                Save 45%
              </span>
            </button>
          </div>
        </div>

        {statusNote && (
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-3 text-center text-xs font-bold text-emerald-700 dark:text-emerald-200">
            {statusNote}
          </div>
        )}

        {/* 3 Pricing Tiers */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {/* Tier 1: Free ($0) */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold">Free</h2>
                {studio.planTier === "free" && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Current Plan
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Everyday stateless SEO tools &amp; 1 trial Studio article
              </p>
              <p className="mt-5 text-4xl font-black">
                $0
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {" "}
                  / forever
                </span>
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span>Access to 90+ stateless <code>/tools/*</code> (capped daily runs)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span>1 free trial article preview inside <code>/studio/writer</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span>1 connected website + 5 daily Site Audit Snapshots</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span>Sample curated SEO &amp; AEO prompt packs (<code>/prompts/*</code>)</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => void handleCheckout("free")}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 px-5 py-3.5 text-xs font-extrabold text-slate-800 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-white"
            >
              <span>Start Free in Studio</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Tier 2: Pro Creator ($12/mo or $79/yr Founding Pass) */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-[#5271FF] bg-white p-7 shadow-2xl shadow-[#5271FF]/15 dark:bg-[#111B34]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#5271FF] to-[#4361EE] px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow">
              Most Popular · Solo Creators
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold">Pro Creator</h2>
                {studio.planTier === "pro_creator" && (
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
                    Active
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                Complete DIY SEO, Content Writer &amp; Website Builder suite
              </p>

              {billingCycle === "yearly" ? (
                <div className="mt-5">
                  <p className="text-4xl font-black">
                    $79
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
                      {" "}
                      / year Founding Pass
                    </span>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                    Equals ~$6.58/month (Save 45% vs. $12/mo)
                  </p>
                </div>
              ) : (
                <p className="mt-5 text-4xl font-black">
                  $12
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
                    {" "}
                    / month
                  </span>
                </p>
              )}

              <ul className="mt-6 space-y-3 text-xs text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#5271FF]" />
                  <span><strong>1 connected website</strong> with 50 Combined Site Snapshots/day</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#5271FF]" />
                  <span><strong>15–20 publish-ready articles/mo</strong> (real internal/external links)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#5271FF]" />
                  <span><strong>Infographic Studio V5</strong> + 1-Click Social Repurposing Pack</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#5271FF]" />
                  <span><strong>AI Tool &amp; Blog Website Builder</strong> (isolated <code>*.doitwithai.site</code>)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#5271FF]" />
                  <span>Saved Keyword Backlog, Manual Planner &amp; full 650+ Pro Prompt Vault</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={loadingTier === "pro_creator"}
              onClick={() => void handleCheckout("pro_creator")}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5271FF] px-5 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-[#5271FF]/30 transition hover:bg-[#4361EE] disabled:opacity-60"
            >
              {loadingTier === "pro_creator" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Sparkles size={15} />
              )}
              <span>
                {billingCycle === "yearly"
                  ? "Get $79/yr Founding Pass"
                  : "Upgrade to Pro Creator ($12/mo)"}
              </span>
            </button>
          </div>

          {/* Tier 3: Pro Plus ($29/mo) */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold">Pro Plus</h2>
                {studio.planTier === "pro_plus" && (
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-300">
                    Active
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Multi-site portfolio builders, niche publishers &amp; consultants
              </p>

              {billingCycle === "yearly" ? (
                <div className="mt-5">
                  <p className="text-4xl font-black">
                    $228
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {" "}
                      / year
                    </span>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                    Equals $19/month billed annually
                  </p>
                </div>
              ) : (
                <p className="mt-5 text-4xl font-black">
                  $29
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {" "}
                    / month
                  </span>
                </p>
              )}

              <ul className="mt-6 space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-amber-500" />
                  <span><strong>Up to 5 connected websites</strong> in one Studio account</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-amber-500" />
                  <span><strong>50 complete publish-ready articles/mo</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-amber-500" />
                  <span><strong>Custom Domain CNAME</strong> support on Website Builder sites</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-amber-500" />
                  <span>Bulk .ZIP publishing kits (DOCX, PDF, HTML, SVG, Social Decks)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-amber-500" />
                  <span>200 daily Combined Site Snapshots &amp; priority model routing</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={loadingTier === "pro_plus"}
              onClick={() => void handleCheckout("pro_plus")}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3.5 text-xs font-extrabold text-slate-950 shadow transition hover:bg-amber-300 disabled:opacity-60"
            >
              {loadingTier === "pro_plus" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Crown size={15} />
              )}
              <span>Upgrade to Pro Plus ($29/mo)</span>
            </button>
          </div>
        </div>

        {/* Fair-Use & Margin Safety Note */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-600 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="shrink-0 text-emerald-500" />
            <span>
              <strong>100% Manual Editorial Control:</strong> Zero unwanted
              background bots or surprise auto-posting. Review every outline,
              infographic, and internal link before publishing.
            </span>
          </div>
          <Link
            href="/ai-content-writer"
            className="font-bold text-[#5271FF] hover:underline dark:text-[#9aabff]"
          >
            Try the Flagship AI Content Writer →
          </Link>
        </div>
      </div>
    </div>
  );
}

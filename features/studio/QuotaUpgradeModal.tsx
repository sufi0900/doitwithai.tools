"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Crown, Loader2, Sparkles, X } from "lucide-react";
import { setPlanTierOptimistic } from "@/lib/studio/store";
import type { PlanTierId } from "@/lib/studio/types";

export default function QuotaUpgradeModal({
  open,
  reason,
  onClose,
}: {
  open: boolean;
  reason: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [upgradingTier, setUpgradingTier] = useState<PlanTierId | null>(null);

  if (!open) return null;

  const handleInstantCheckout = async (
    tier: "pro_creator" | "pro_plus",
    cycle: "monthly" | "yearly",
  ) => {
    setUpgradingTier(tier);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planTier: tier,
          billingCycle: cycle,
          returnPath: "/studio",
        }),
      });
      const data = (await res.json()) as {
        mode?: string;
        checkoutUrl?: string;
        redirectUrl?: string;
      };
      if (data.mode === "external-checkout" && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      // Preview Sandbox Checkout unlock
      setPlanTierOptimistic(tier, cycle);
      onClose();
      router.refresh();
    } finally {
      setUpgradingTier(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quota-upgrade-title"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-700 bg-[#0F172A] p-6 text-slate-100 shadow-2xl sm:p-8">
        <button
          type="button"
          aria-label="Close upgrade modal"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X size={18} />
        </button>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300">
          <Crown size={13} />
          Plan Quota Guardrail Reached
        </span>

        <h2
          id="quota-upgrade-title"
          className="mt-3 text-2xl font-extrabold text-white"
        >
          Upgrade Your DIY Studio Quota
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
          {reason}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col justify-between rounded-2xl border border-[#5271FF] bg-[#5271FF]/10 p-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#9aabff]">
                  Pro Creator
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Founding Pass $79/yr
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-white">
                $12<span className="text-xs font-medium text-slate-400">/month</span>
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-200">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  1 connected website + 50 snapshots/day
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  20 complete articles/mo + Infographic V5
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  AI Tool/Blog Website Builder + Prompt Vault
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={upgradingTier !== null}
              onClick={() => void handleInstantCheckout("pro_creator", "yearly")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5271FF] px-4 py-2.5 text-xs font-extrabold text-white shadow transition hover:bg-[#4361EE]"
            >
              {upgradingTier === "pro_creator" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              <span>Unlock Pro Creator</span>
            </button>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-slate-700 bg-slate-900/90 p-5">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                Pro Plus
              </span>
              <p className="mt-2 text-2xl font-black text-white">
                $29<span className="text-xs font-medium text-slate-400">/month</span>
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-200">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  Up to 5 connected websites
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  50 publish-ready articles/mo + bulk ZIP
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  Custom domain CNAME support
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={upgradingTier !== null}
              onClick={() => void handleInstantCheckout("pro_plus", "monthly")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-amber-300"
            >
              {upgradingTier === "pro_plus" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Crown size={14} />
              )}
              <span>Unlock Pro Plus</span>
            </button>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-400">
          <Link href="/pricing" onClick={onClose} className="underline hover:text-white">
            Compare all plan features on /pricing →
          </Link>
        </div>
      </div>
    </div>
  );
}
